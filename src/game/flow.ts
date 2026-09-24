import { reactive } from 'vue'
import { app } from './engine/app'
import type { Quest } from './data/quests'
import { rollJob, storyQuest, tutorialQuest } from './data/quests'
import { SECTORS, SECTOR_BY_ID } from './data/regions'
import { rollItem, type Item } from './data/items'
import { WEAPONS, type WeaponId } from './data/weapons'
import {
  profile, saveProfile, computeStats, grantXp, readSnapshot, writeSnapshot, type MissionSnapshot, lifetimeXp
} from './state/profile'
import { hud } from './state/hud'
import { flushSaveNow } from '@/use/useSaveStatus'
import { setMusicTrack, startGameMusic } from '@/use/useSound'
import { showMidgameAd } from '@/use/useAds'
import { canShowInterstitial, markInterstitialShown } from '@/use/useAdGate'
import { isAdShowing } from '@/use/useGamePause'
import { triggerHappytime } from '@/use/useCrazyGames'
import { playJingle } from './audio/music'
import { afterPaint } from './engine/slicer'
import { reportRun } from '@/use/useLeaderboard'
import type { SectorId } from './world/themes'

/**
 * ─── Game flow ───────────────────────────────────────────────────────────────
 *
 * The director between the two modes: a MISSION (the 3D first-person sector)
 * and the HUB (Gauss's lab — missions, gear, circuits). It owns mission
 * start / resume / finish, reward payout, sector unlocks and the job board.
 *
 * Modes are created lazily through the registered factories so this module
 * does not import the heavy mission/hub code itself.
 */

export type Screen = 'boot' | 'mission' | 'hub'
export type Modal = '' | 'results' | 'defeat' | 'pause' | 'levelUp'

export interface ResultsData {
  quest: Quest
  success: boolean
  xp: number
  bolts: number
  kills: number
  chests: number
  items: Item[]
  levelBefore: number
  levelAfter: number
  seconds: number
  weapon: WeaponId | null
  unlocked: SectorId | null
}

export const flow = reactive({
  screen: 'boot' as Screen,
  modal: '' as Modal,
  results: null as ResultsData | null,
  quest: null as Quest | null,
  /** Mission-side counters mirrored for the results screen. */
  levelAtStart: 1,
  /** A mission is being built behind the hub → mission beam overlay. */
  loading: false,
  /** 0..1 progress of that build. */
  loadProgress: 0,
  /** The sector being built (the overlay's label). */
  loadingSector: '' as SectorId | ''
})

type MissionFactory = (
  quest: Quest, snapshot: MissionSnapshot | null, onProgress?: (p01: number) => void
) => Promise<import('./engine/app').GameMode>
type HubFactory = () => import('./engine/app').GameMode
let missionFactory: MissionFactory | null = null
let hubFactory: HubFactory | null = null

export const registerModeFactories = (m: MissionFactory, h: HubFactory): void => {
  missionFactory = m
  hubFactory = h
}

/** What the game should boot into (no main menu — straight into a scene). */
export const bootTarget = (): { kind: 'mission'; quest: Quest; snapshot: MissionSnapshot | null } | { kind: 'hub' } => {
  const snap = readSnapshot()
  if (snap && !snap.done) return { kind: 'mission', quest: snap.quest, snapshot: snap }
  if (!profile.world.tutorialDone) return { kind: 'mission', quest: tutorialQuest(), snapshot: null }
  return { kind: 'hub' }
}

/** Build the first scene (a resumed mission, the tutorial or the hub). Async:
 *  a mission build is time-sliced so the boot loader keeps moving. */
export const createBootMode = async (onProgress?: (p01: number) => void): Promise<import('./engine/app').GameMode> => {
  const t = bootTarget()
  if (t.kind === 'mission') {
    flow.quest = t.quest
    flow.screen = 'mission'
    flow.levelAtStart = profile.level
    setMusicTrack(t.quest.sector)
    return missionFactory!(t.quest, t.snapshot, onProgress)
  }
  flow.screen = 'hub'
  hud.phase = 'hub'
  setMusicTrack('hub')
  const h = hubFactory!()
  onProgress?.(1)
  return h
}

/**
 * Hub → mission. The sector is built BEHIND the beam overlay (`flow.loading`),
 * time-sliced so the lab keeps animating and the bar keeps filling, and the
 * mission only takes over once it is complete, shaders included. A Deploy tap
 * therefore answers at once instead of freezing the hub for the whole build.
 */
export const startMission = async (quest: Quest): Promise<void> => {
  if (!missionFactory || flow.loading) return
  flow.loading = true
  flow.loadProgress = 0
  flow.loadingSector = quest.sector
  try {
    // The beam is on screen before the build starts, and the lab stops
    // drawing behind it: the build gets the whole CPU (the overlay covers
    // the last frame, which simply stays put).
    await afterPaint()
    app.setWanted(false)
    const m = await missionFactory(quest, null, (p) => { flow.loadProgress = p })
    flow.quest = quest
    flow.modal = ''
    flow.results = null
    flow.levelAtStart = profile.level
    flow.screen = 'mission'
    setMusicTrack(quest.sector)
    startGameMusic()
    app.setMode(m)
  } finally {
    app.setWanted(true)
    flow.loading = false
  }
}

export const goHub = (): void => {
  if (!hubFactory) return
  flow.modal = ''
  flow.screen = 'hub'
  hud.phase = 'hub'
  hud.combat = false
  hud.targetName = ''
  hud.bossName = ''
  setMusicTrack('hub')
  startGameMusic()
  const h = hubFactory()
  app.setMode(h)
  app.setWanted(true)
  ensureJobs()
}

// ─── Rewards ─────────────────────────────────────────────────────────────────

export interface MissionTally {
  xp: number
  bolts: number
  kills: number
  chests: number
  items: Item[]
  seconds: number
}

/** Mission over (success = objective done and beamed out). XP and bolts from
 *  kills were already granted live; this pays the QUEST reward on top, saves,
 *  runs the ad break if one is due and only then reveals the results. */
export const finishMission = async (success: boolean, tally: MissionTally): Promise<void> => {
  const quest = flow.quest
  if (!quest) return
  const levelBefore = flow.levelAtStart
  let xp = tally.xp
  let bolts = tally.bolts
  const items = [...tally.items]
  let weapon: WeaponId | null = null
  let unlocked: SectorId | null = null
  profile.stats.missions++
  if (success) {
    xp += quest.reward.xp
    bolts += quest.reward.bolts
    grantXp(quest.reward.xp)
    profile.bolts += quest.reward.bolts
    profile.questsDone++
    const it = rollItem((quest.seed ^ 0xa11) >>> 0, quest.level, { bias: quest.reward.rarityBias, rarity: quest.reward.guaranteed })
    profile.inv.items.push(it)
    profile.inv.fresh.push(it.id)
    items.push(it)
    if (quest.template === 'tutorial') {
      profile.world.tutorialDone = true
    }
    // The tutorial IS the Scrapyard's story mission: its mini-boss (the
    // Scrapper) counts as that sector's Core Master.
    if (quest.kind === 'story') {
      const sector = SECTOR_BY_ID[quest.sector]
      if (!profile.world.bosses.includes(sector.boss)) {
        profile.world.bosses.push(sector.boss)
        profile.story++
        const w = (Object.values(WEAPONS).find(d => d.from === sector.boss))
        if (w) weapon = grantWeapon(w.id)
        const next = SECTORS.find(s => s.after === sector.id)
        if (next && !profile.world.unlocked.includes(next.id)) {
          profile.world.unlocked.push(next.id)
          unlocked = next.id
        }
      }
    }
    if (quest.kind === 'job') {
      profile.quests.jobs = profile.quests.jobs.filter(j => j.id !== quest.id)
    }
  } else {
    profile.stats.deaths++
    if (quest.kind === 'story') profile.quests.storyAttempts[quest.id] = (profile.quests.storyAttempts[quest.id] ?? 0) + 1
  }
  profile.stats.playSeconds += Math.round(tally.seconds)
  writeSnapshot(null)
  ensureJobs()
  saveProfile()
  void flushSaveNow()
  const results: ResultsData = {
    quest, success, xp, bolts, kills: tally.kills, chests: tally.chests, items, levelBefore,
    levelAfter: profile.level, seconds: tally.seconds, weapon, unlocked
  }
  // Everything is paid and saved before the ad, so a player who closes the
  // tab during it loses nothing.
  await adBreakBeforeResults()
  flow.results = results
  if (success) triggerHappytime()
  playJingle(success ? 'victory' : 'defeat')
  flow.modal = 'results'
  // The leaderboard, AFTER the result screen is up and never awaited: it is a
  // decoration on a game that works without it, and a captive-portal wifi
  // login must not stand between the player and their rewards. Lifetime XP
  // also grew on a defeat (kills pay live), so both outcomes report; `force`
  // makes the number a mission ended on always land.
  void reportRun(lifetimeXp(), profile.level, { force: true })
}

/** Longest we hold the result screen for an ad that another placement left
 *  on screen. The provider caps its own waits; this only guards the gate. */
const AD_GATE_WAIT_MS = 8000

/**
 * The interstitial comes BEFORE the result screen, never on top of it or a
 * moment after it (portal QA). The world is frozen while it runs: the ad
 * flips `isAdShowing`, which suspends the loop and the audio.
 *
 * Waits on the ad GATE, not only on its own request: an ad started by another
 * placement (the QA trigger, the first-load ad) may still be up, and revealing
 * the screen under it would put the ad back on top. The jingle plays after,
 * so the ad never cuts it off.
 */
const adBreakBeforeResults = async (): Promise<void> => {
  if (canShowInterstitial()) {
    markInterstitialShown()
    await showMidgameAd()
  }
  const t0 = Date.now()
  while (isAdShowing.value && Date.now() - t0 < AD_GATE_WAIT_MS) {
    await new Promise((r) => setTimeout(r, 100))
  }
}

const grantWeapon = (id: WeaponId): WeaponId | null => {
  if (profile.hero.weapons.includes(id)) return null
  profile.hero.weapons.push(id)
  if (!profile.hero.slots[0]) profile.hero.slots[0] = id
  else if (!profile.hero.slots[1]) profile.hero.slots[1] = id
  return id
}

// ─── Job board ───────────────────────────────────────────────────────────────

/** Keep three jobs on the board, drawn from the unlocked sectors. */
export const ensureJobs = (): void => {
  const q = profile.quests
  const sectors = profile.world.unlocked
  while (q.jobs.length < 3) {
    q.jobSeed = (q.jobSeed * 1103515245 + 12345) >>> 0
    q.jobs.push(rollJob(q.jobSeed, sectors, profile.level))
  }
}

export const rerollJob = (id: string): void => {
  const q = profile.quests
  const i = q.jobs.findIndex(j => j.id === id)
  if (i < 0) return
  q.jobSeed = (q.jobSeed * 1103515245 + 12345) >>> 0
  q.jobs[i] = rollJob(q.jobSeed, profile.world.unlocked, profile.level)
  saveProfile()
}

export const storyFor = (sector: SectorId): Quest | null => {
  const s = SECTOR_BY_ID[sector]
  if (!profile.world.unlocked.includes(sector)) return null
  if (profile.world.bosses.includes(s.boss)) return null
  return storyQuest(s, profile.level, profile.quests.storyAttempts[`story_${sector}`] ?? 0)
}

export const statsNow = () => computeStats()
