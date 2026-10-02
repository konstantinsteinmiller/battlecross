import { reactive } from 'vue'
import { app, type GameMode } from './engine/app'
import { afterPaint } from './engine/slicer'
import type { Input } from './engine/input'
import { AMBUSH_KIND, FACTIONS, REP_HOSTILE, questOfNode, type FactionId } from './data/quests'
import { NODE_BY_ID, TOWNS, ZONES, hiddenTrainerOf, visitLevel, type NodeId, type NpcDef, type ThemeId, type TownId } from './data/zones'
import type { ClassId } from './data/skills'
import type { ZoneId } from './data/items'
import { ZoneMode, type ZoneSetup } from './modes/zoneMode'
import { hud } from './state/hud'
import {
  clearNode, flagSet, gainItem, grantXp, hasFlag, isFreshProfile, isNodeOpen, lifetimeXp, profile, saveProfile
} from './state/profile'
import { playJingle } from './audio/music'
import { flushSaveNow } from '@/use/useSaveStatus'
import { resumeMusicAfterAd, setMusicTrack, startGameMusic } from '@/use/useSound'
import { pokiMeasure } from '@/utils/pokiPlugin'
import { showMidgameAd } from '@/use/useAds'
import { canShowInterstitial, markInterstitialShown } from '@/use/useAdGate'
import { isAdShowing } from '@/use/useGamePause'
import { triggerHappytime } from '@/use/useCrazyGames'
import { reportRun } from '@/use/useLeaderboard'
import { joinPortalBoard, reportPortalBest } from '@/use/usePortalLeaderboard'
import { difficultyFactor } from '@/use/useUser'
import type { TrackId } from './audio/music'
import { PREVIEW_ON } from './previewFlags'

/**
 * ─── Game flow ───────────────────────────────────────────────────────────────
 *
 * The director between the places the hero can be: a combat ZONE, a TOWN, the
 * colosseum, and the world MAP that joins them. It owns travel (building the
 * next place behind a loading veil), the end of a visit (rewards, unlocks, the
 * quest decision a finale brings, the save), and the menus over a scene.
 *
 * There is no main menu: a new player boots straight into the first fight on
 * the Sunford Plains; a returning one boots into the town they were last near.
 */

export type Screen = 'boot' | 'zone' | 'town' | 'map'
export type Modal =
  | '' | 'results' | 'pause' | 'character' | 'skills' | 'inventory' | 'shop' | 'trainer' | 'healer' | 'talk'
  | 'decision' | 'ending' | 'help'

export interface ResultItem {
  id: string
  /** False: a second copy, turned into `gold`. */
  added: boolean
  gold: number
}

export interface ResultsData {
  node: NodeId
  /** `retreat`: the player left through the pause menu. */
  outcome: 'victory' | 'defeat' | 'retreat'
  xp: number
  gold: number
  /** Gold dropped on a defeat. */
  goldLost: number
  kills: number
  items: ResultItem[]
  levelBefore: number
  levelAfter: number
  seconds: number
  firstClear: boolean
  /** Nodes this win opened on the map. */
  unlocked: NodeId[]
  waves: number
}

export const flow = reactive({
  screen: 'boot' as Screen,
  modal: '' as Modal,
  /** The node the live scene is. */
  node: '' as NodeId | '',
  results: null as ResultsData | null,
  /** A place is being built behind the veil. */
  loading: false,
  loadProgress: 0,
  loadingNode: '' as NodeId | '',
  /** The townsperson a shop / trainer / talk modal belongs to. */
  npc: null as NpcDef | null,
  /** A trainer opened from the map (a hidden one found in a cleared zone). */
  trainerCls: '' as ClassId | '',
  /** The quest waiting for its decision. */
  quest: '' as string,
  /** After the throne: the ending screen has been shown this session. */
  endingShown: false
})

/** What a zone's theme sounds like (track ids are the composer's). */
const THEME_TRACK: Record<ThemeId, TrackId> = {
  plains: 'gale', cave: 'drill', forest: 'cryo', farm: 'tide', ash: 'blaze', mine: 'magnet', snow: 'cryo', temple: 'tide',
  void: 'neon', peak: 'rotor', fortress: 'fortress', rift: 'volt', town: 'hub', ruin: 'scrapyard', arena: 'blaze'
}

let input: Input | null = null
/** The game's one input record (owned by `boot.ts`). */
export const bindInput = (i: Input): void => { input = i }

const hashSeed = (s: string, n: number): number => {
  let h = 2166136261 ^ n
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) || 1
}

/** Which faction is hunting the hero (the most hostile one), if any. */
export const hostileFaction = (): FactionId | null => {
  let worst: FactionId | null = null
  let v: number = REP_HOSTILE
  for (const f of FACTIONS) if (profile.quests.rep[f] <= v) { v = profile.quests.rep[f]; worst = f }
  return worst
}

/** A town's look: Oakhaven is a ruin once it has fallen. */
export const townTheme = (town: TownId): ThemeId => (town === 'oakhaven' && hasFlag('oakhavenFallen') ? 'ruin' : TOWNS[town].theme)

const setupFor = (node: NodeId): ZoneSetup => {
  const def = NODE_BY_ID[node]!
  const visits = profile.world.visits[node] ?? 0
  const flags = flagSet()
  if (def.kind === 'town') {
    const town = node as TownId
    return { kind: 'town', town, theme: townTheme(town), seed: hashSeed(node, 7), level: profile.level, difficulty: 1, flags }
  }
  if (def.kind === 'arena') {
    return { kind: 'arena', theme: 'arena', seed: hashSeed(node, visits), level: profile.level, difficulty: difficultyFactor(), flags }
  }
  const zone = ZONES[node as ZoneId]
  const hostile = hostileFaction()
  return {
    kind: 'zone',
    zone: zone.id,
    theme: zone.theme,
    seed: hashSeed(node, visits),
    level: visitLevel(zone, profile.level),
    difficulty: difficultyFactor(),
    // The very first visit of a new save opens gently.
    tutorial: node === 'plains' && isFreshProfile(),
    ambush: hostile ? AMBUSH_KIND[hostile] : null,
    // A core sold to the Syndicate leaves the mines crawling.
    extra: node === 'mines' && hasFlag('coreSold') ? 1 : 0,
    // The dragon keeps its bargain where it matters.
    dragonAlly: hasFlag('dragonPact') && (node === 'fortress' || node === 'rift'),
    flags
  }
}

/** What a visit earned, as the result screen and the save need it. */
export interface VisitTally {
  xp: number
  gold: number
  kills: number
  items: readonly string[]
  seconds: number
  /** Arena: the wave reached. */
  waves: number
}

type Precompile = (mode: GameMode, onProgress: (f01: number) => void) => Promise<void>
let precompile: Precompile = async () => {}
/** `boot.ts` owns the renderer; it hands the shader warm-up in. */
export const setPrecompile = (fn: Precompile): void => { precompile = fn }

const openPanel = (panel: 'map' | 'character' | 'inventory' | 'skills'): void => {
  if (flow.modal || flow.loading) return
  // The loadout is fixed once a fight is on: menus open in towns and on the map.
  if (flow.screen === 'zone') return
  if (panel === 'map') { openMap(); return }
  flow.modal = panel
}

/** What a built place must offer the flow (the tests hand in a stand-in). */
export interface BuiltPlace extends GameMode {
  setup: { theme: ThemeId }
}
type NodeBuilder = (node: NodeId, onProgress: (p01: number) => void) => Promise<BuiltPlace>

const buildZone = async (node: NodeId, onProgress: (p01: number) => void): Promise<ZoneMode> => {
  const setup = setupFor(node)
  const mode = await ZoneMode.create(setup, input!, {
    onEnd: (outcome) => { void finishVisit(outcome) },
    onInteract: (npcId) => talkTo(npcId),
    onPause: () => { if (!flow.modal && !flow.loading && flow.screen !== 'map') flow.modal = 'pause' },
    onPanel: openPanel
  }, p => onProgress(p * 0.82))
  await precompile(mode, f => onProgress(0.82 + f * 0.12))
  try { await mode.warmUp(async () => {}, f => onProgress(0.94 + f * 0.06)) } catch (e) { console.warn('[flow] warm-up render failed', e) }
  onProgress(1)
  return mode
}

let buildNode: NodeBuilder = buildZone
/** Build a place without showing it, and show a built one (the recorder cuts
 *  between prebuilt places; the game itself travels with `travel`). */
export const buildPlace = (node: NodeId, onProgress: (p01: number) => void): Promise<BuiltPlace> => buildNode(node, onProgress)
export const enterPlace = (node: NodeId, mode: BuiltPlace): void => enter(node, mode)
/** Test seam: build places without a GPU. */
export const setNodeBuilder = (fn: NodeBuilder | null): void => { buildNode = fn ?? buildZone }

/**
 * Poki's per-level funnel (the Player Fit table): a zone visit is a "level".
 * A `start` is always closed by exactly one `complete` or `fail`, so the
 * open one is remembered here. A no-op on every other portal (stub alias).
 */
let measuring: NodeId | '' = ''
const measureStart = (node: NodeId): void => {
  if (NODE_BY_ID[node]?.kind === 'town') return
  if (measuring) pokiMeasure('level', measuring, 'fail')
  measuring = node
  pokiMeasure('level', node, 'start')
}
const measureEnd = (node: NodeId, won: boolean): void => {
  if (measuring !== node) return
  measuring = ''
  pokiMeasure('level', node, won ? 'complete' : 'fail')
}

const enter = (node: NodeId, mode: BuiltPlace): void => {
  const def = NODE_BY_ID[node]!
  flow.node = node
  flow.modal = ''
  flow.results = null
  flow.screen = def.kind === 'town' ? 'town' : 'zone'
  profile.world.at = node
  if (def.kind === 'town') {
    // A town is "cleared" by walking into it: its roads open.
    if (clearNode(node)) saveProfile()
  }
  setMusicTrack(THEME_TRACK[mode.setup.theme])
  startGameMusic()
  app.setMode(mode)
  app.setWanted(true)
  measureStart(node)
}

/** The first scene (no main menu): the opening fight, or the last town. */
export const createBootMode = async (onProgress: (p01: number) => void = () => {}): Promise<GameMode> => {
  // The portal's own board, when the build carries one: joined on arrival.
  void joinPortalBoard(lifetimeXp())
  const at = profile.world.at
  const node: NodeId = isFreshProfile() ? 'plains' : NODE_BY_ID[at]?.kind === 'town' ? at : 'sunford'
  const mode = await buildNode(node, onProgress)
  const def = NODE_BY_ID[node]!
  flow.node = node
  flow.screen = def.kind === 'town' ? 'town' : 'zone'
  profile.world.at = node
  setMusicTrack(THEME_TRACK[mode.setup.theme])
  measureStart(node)
  return mode
}

/**
 * Travel to a node. The place is built BEHIND the loading veil, time-sliced so
 * the veil's bar keeps moving, and only takes over once it is complete,
 * shaders included.
 */
export const travel = async (node: NodeId): Promise<void> => {
  if (flow.loading || !NODE_BY_ID[node] || !isNodeOpen(node)) return
  flow.loading = true
  flow.loadProgress = 0
  flow.loadingNode = node
  try {
    // The veil is on screen before the build starts, and the old scene stops
    // drawing behind it: the build gets the whole CPU.
    await afterPaint()
    app.setWanted(false)
    if (NODE_BY_ID[node]!.kind !== 'town') profile.world.visits[node] = (profile.world.visits[node] ?? 0) + 1
    const mode = await buildNode(node, (p) => { flow.loadProgress = p })
    enter(node, mode)
  } catch (e) {
    console.error('[flow] travel failed', e)
    app.setWanted(true)
  } finally {
    flow.loading = false
  }
}

/** The world map, over whatever scene is up. */
export const openMap = (): void => {
  if (flow.loading) return
  flow.modal = ''
  flow.screen = 'map'
  hud.phase = 'map'
  app.setWanted(false)
}

/** Close the map without travelling (only back into a town). */
export const closeMap = (): void => {
  if (flow.screen !== 'map') return
  const def = flow.node ? NODE_BY_ID[flow.node] : undefined
  if (def?.kind !== 'town') return
  flow.screen = 'town'
  hud.phase = 'town'
  app.setWanted(true)
}

// ─── The end of a visit ──────────────────────────────────────────────────────

/** Longest we hold a screen for an ad that another placement left on screen:
 *  as long as an ad itself may run (`AD_MAX_MS` in `useAds.ts`), so a result
 *  screen never opens under a video that is still playing. */
const AD_GATE_WAIT_MS = 60_000

const waitForAdGate = async (): Promise<void> => {
  const t0 = Date.now()
  while (isAdShowing.value && Date.now() - t0 < AD_GATE_WAIT_MS) await new Promise((r) => setTimeout(r, 100))
}

/** Share of the purse dropped on a defeat. */
export const DEFEAT_GOLD_LOSS = 0.1

/**
 * A visit is decided. Everything the run earned is banked (XP and loot are
 * kept on a defeat too; a tenth of the purse is not), the save is flushed, and
 * the result screen opens. The interstitial comes AFTER it, on Continue.
 */
export const finishVisit = async (outcome: 'victory' | 'defeat' | 'retreat'): Promise<void> => {
  // DEV: a clip being recorded runs on past the outcome (tools/preview-video).
  if (PREVIEW_ON) return
  const mode = app.mode instanceof ZoneMode ? app.mode : null
  const node = flow.node
  if (!mode || !node) return
  const h = mode.sim.hero
  await bankVisit(outcome, node, { xp: h.xp, gold: h.gold, kills: h.kills, items: h.items, seconds: mode.sim.time, waves: mode.sim.wave.n })
}

/** Bank a decided visit: rewards, unlocks, the save, the result screen. */
export const bankVisit = async (outcome: 'victory' | 'defeat' | 'retreat', node: NodeId, h: VisitTally): Promise<void> => {
  measureEnd(node, outcome === 'victory')
  const levelBefore = profile.level
  const items: ResultItem[] = []
  grantXp(h.xp)
  profile.gold += h.gold
  for (const id of h.items) {
    const r = gainItem(id)
    items.push({ id, added: r.added, gold: r.gold })
  }
  profile.stats.kills += h.kills
  profile.stats.runs++
  profile.stats.playSeconds += Math.round(h.seconds)
  let goldLost = 0
  let firstClear = false
  const unlocked: NodeId[] = []
  if (outcome === 'victory') {
    const before = new Set(Object.keys(NODE_BY_ID).filter(n => isNodeOpen(n as NodeId)))
    firstClear = clearNode(node)
    profile.questsDone++
    if (node === 'arena') profile.world.arenaBest = Math.max(profile.world.arenaBest, h.waves)
    // A finale that carries a quest brings its decision (once).
    const q = questOfNode(node)
    if (q && !profile.quests.done[q.id]) flow.quest = q.id
    for (const n of Object.keys(NODE_BY_ID)) if (!before.has(n) && isNodeOpen(n as NodeId)) unlocked.push(n as NodeId)
  } else if (outcome === 'defeat') {
    profile.stats.deaths++
    goldLost = Math.floor(profile.gold * DEFEAT_GOLD_LOSS)
    profile.gold -= goldLost
  }
  saveProfile()
  void flushSaveNow()
  const results: ResultsData = {
    node, outcome, xp: h.xp, gold: h.gold, goldLost, kills: h.kills, items, levelBefore, levelAfter: profile.level,
    seconds: h.seconds, firstClear, unlocked, waves: h.waves
  }
  // An ad another placement started may still be up: never open under it.
  await waitForAdGate()
  flow.results = results
  if (outcome === 'victory') triggerHappytime()
  if (outcome !== 'retreat') playJingle(outcome)
  flow.modal = 'results'
  // The leaderboard, AFTER the result screen is up and never awaited: it is a
  // decoration on a game that works without it.
  void reportRun(lifetimeXp(), profile.level, { force: true })
  void reportPortalBest(lifetimeXp())
}

/** True from Continue until the next screen is up, so a double tap asks for one ad. */
let leaving = false

/**
 * Continue on the result screen: close it, play the interstitial if one is
 * due, and only then move on — to the quest's decision if the finale brought
 * one, else to the map.
 *
 * The screen closes FIRST, so the ad never opens on top of it (portal QA). The
 * zone stays frozen behind the ad: `showMidgameAd` flips `isAdShowing` before
 * its first await, which suspends the loop and the audio.
 */
export const leaveResults = async (): Promise<void> => {
  if (leaving) return
  await adBreak()
  if (flow.quest) flow.modal = 'decision'
  else afterVisit()
}

/**
 * The paced break behind a closed result screen, shared by Continue and
 * Retry. Never throws: whatever the ad does, the player moves on.
 */
const adBreak = async (): Promise<void> => {
  leaving = true
  flow.modal = ''
  let adShown = false
  try {
    if (canShowInterstitial()) {
      markInterstitialShown()
      adShown = true
      await showMidgameAd()
    }
    await waitForAdGate()
  } catch (e) {
    console.warn('[flow] ad break failed', e)
  } finally {
    leaving = false
    // The ad hard-stopped the music and cleared its intent. The map restarts
    // it, but the decision and the ending are windows over a silent scene.
    if (adShown) resumeMusicAfterAd()
  }
}

/** Past the results (and the decision): the ending once, else the map. */
export const afterVisit = (): void => {
  flow.quest = ''
  if (hasFlag('throneDone') && !flow.endingShown && !profile.tips.endingSeen) {
    flow.endingShown = true
    flow.modal = 'ending'
    return
  }
  flow.modal = ''
  openMap()
  startGameMusic()
}

/** Leave a zone through the pause menu: what the run earned is kept, the
 *  clear is given up. */
export const retreatVisit = async (): Promise<void> => {
  if (flow.screen !== 'zone' || flow.results) return
  flow.modal = ''
  await finishVisit('retreat')
}

/**
 * Retry the zone the hero just fell in. The same paced break as Continue runs
 * first (owner's decision): a die-and-retry session is still a session, and
 * the pacing gate (ad-free start, two-minute gap) keeps it from stacking.
 */
export const retryVisit = async (): Promise<void> => {
  const node = flow.node
  if (!node || leaving) return
  await adBreak()
  flow.results = null
  await travel(node)
}

// ─── Towns ───────────────────────────────────────────────────────────────────

export const npcById = (id: string): NpcDef | null => {
  for (const t of Object.values(TOWNS)) {
    const n = t.npcs.find(x => x.id === id)
    if (n) return n
  }
  return null
}

const talkTo = (npcId: string): void => {
  if (flow.modal || flow.loading) return
  const npc = npcById(npcId)
  if (!npc) return
  flow.npc = npc
  flow.trainerCls = npc.cls ?? ''
  flow.modal = npc.role === 'shop' ? 'shop' : npc.role === 'trainer' ? 'trainer' : npc.role === 'healer' ? 'healer' : 'talk'
}

/** The hidden trainer a cleared zone holds, if it has one for this save. */
export const hiddenTrainer = (node: NodeId): { cls: ClassId; npc: string } | null =>
  hiddenTrainerOf(node, new Set(profile.world.cleared), flagSet())

/** Open a hidden trainer from the map. */
export const visitHiddenTrainer = (node: NodeId): void => {
  const t = hiddenTrainer(node)
  if (!t) return
  flow.npc = { id: t.npc, role: 'trainer', look: t.npc, at: [0, 0], cls: t.cls }
  flow.trainerCls = t.cls
  flow.modal = 'trainer'
}

export const closeModal = (): void => {
  flow.modal = ''
  flow.npc = null
}
