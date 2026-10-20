import { reactive, watch } from 'vue'
import { app, type GameMode } from './engine/app'
import { afterPaint } from './engine/slicer'
import { createInput, type Input } from './engine/input'
import { AMBUSH_KIND, FACTIONS, REP_HOSTILE, questOfNode, type FactionId } from './data/quests'
import { NODE_BY_ID, TOWNS, ZONES, foundFlag, hiddenTrainerOf, visitLevel, type NodeId, type NpcDef, type ThemeId, type TownId } from './data/zones'
import type { ClassId } from './data/skills'
import type { ZoneId } from './data/items'
import { invadedFlag, invasionLetsIn, zoneOf } from './data/invasion'
import { ZoneMode, type VisitResume, type ZoneSetup } from './modes/zoneMode'
import { setVisitSnapshotProvider, takeResumeVisit } from './state/saveSlots'
import { MENTOR_MET_TIP, MENTOR_NPC, MENTOR_SKILL, ROAD_NPCS } from './data/mentor'
import type { ConversationDef } from './dialog/types'
import { abortTalk, beginTalk, conversationOf, decisionOf, talkCodeReady, talkResume, talkWaiting, type TalkStage } from './talk'
import { loadTalk } from './talkLoader'
import {
  claimAfterplayDues, clearNode, flagSet, gainItem, grantXp, hasFlag, isFreshProfile, isNodeOpen, isNodeReachable, lifetimeXp, profile, saveProfile,
  beginMapBeat, rescuesIn, storyArrive, storyMapBeat, storyZoneWon
} from './state/profile'
import { overrunFlag, rebuiltFlag, rebuiltTiers } from './data/breaking'
import { WANDERER_FLAG, trialFlag, visitTrialFlags } from './data/prestige'
import { hud, pushHud } from './state/hud'
import { freeCaptives } from './state/profile'
import { cageOf } from './data/cages'
import { addHerbs, addOres, addPieces, markTreasureDug, treasureFor, setElixirs, countContracts, countErrands, countTasks, finishEscortTasks, markChestsOpened, recordArenaWaves, recordMastery, setManaPotions } from './state/profile'
import { zoneMastery, type Mastery } from './sim/route'
import { inCamp } from './sim/camp'
import { playJingle } from './audio/music'
import { flushSaveNow } from '@/use/useSaveStatus'
import { resumeMusicAfterAd, setMusicTrack, startGameMusic } from '@/use/useSound'
import { pokiMeasure } from '@/utils/pokiPlugin'
import { showMidgameAd } from '@/use/useAds'
import { canOfferReward, canShowInterstitial, claimReward, isRewardGated, markInterstitialShown } from '@/use/useAdGate'
import { breakAllowed } from '@/game/adPacing'
import { isAdShowing } from '@/use/useGamePause'
import { triggerHappytime } from '@/use/useCrazyGames'
import { reportLadder, reportRun } from '@/use/useLeaderboard'
import { arenaModOf } from './arenaWeek'
import { joinPortalBoard, reportPortalBest } from '@/use/usePortalLeaderboard'
import { difficultyFactor } from '@/use/useUser'
import { trackForTheme } from './audio/themes'
import { PREVIEW_ON } from './previewFlags'
import { classifyOnboarding } from './coach/reveal'
import { chestReward, escortPacks, merchantTiers, type EncounterSpec } from './data/encounters'
import { dayKey } from './rareShelf'
import { carefulMult } from './careful'
import { BOARD } from './townTasks'
import { lesson, mapSpot, markTip, setMapPos } from './state/profile'
import { SIEGE_LORD, siegeEnemyLevel, type SiegeTier } from './data/siege'
import { countSiegeClear, marksBanked, recordSiege, siegeTierOpen, storySiegeDue } from './state/siege'
import { countFairClear } from './state/fair'

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
  | '' | 'results' | 'secondWind' | 'contracts' | 'siege' | 'pause' | 'character' | 'skills' | 'inventory' | 'journal' | 'shop' | 'trainer' | 'healer' | 'alchemy' | 'smithing' | 'sellOre' | 'memory' | 'itemBattle' | 'cups' | 'whack' | 'ring' | 'arm' | 'ending' | 'help'
/** A conversation in progress (`talk.ts`, drawn by `DialogLayer`): with a
 *  townsperson in the scene, with a trainer met on the map, or a quest's
 *  decision. It is not a window — the world keeps running under it — and it
 *  stays set while a shop / trainer / healer window it opened is up. */
export type Talk = '' | 'npc' | 'map' | 'decision'

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
  /** Chests opened of the chests the visit held (absent: a place without any). */
  chests?: { opened: number; total: number }
  /** The zone's mastery this visit (bosses, chests), its share in percent and
   *  the zone's best before it (roadmap #70; absent: not a zone). */
  mastery?: Mastery & { pct: number; bestBefore: number }
  /** A random encounter met on the map (`node` is its region's zone). */
  encounter?: boolean
  /** The hero's very first visit (the opening fight): no ad follows it (#20). */
  opening?: boolean
  /** The colosseum (#10): the best wave before this climb is folded in, whether this climb beat it, and this week's best. */
  arenaBest?: number
  arenaNewBest?: boolean
  arenaWeek?: number
  /** The purse was tripled by a rewarded video (#19): `gold` stays what the
   *  run earned, twice that again went into the wallet. */
  tripled?: boolean
  /** A careful clear (#113): its multiplier, the bonus it paid beside `xp`
   *  and `gold`, and the share of health the visit lost. */
  careful?: { mult: number; xp: number; gold: number; lostPct: number }
  /** The Siege of Bastion (afterplay §8): its tier, the waves held, the Marks
   *  earned and banked, the Demonglass won, and the milestones reached. */
  siege?: SiegeResultView
}

export const flow = reactive({
  screen: 'boot' as Screen,
  modal: '' as Modal,
  /** The conversation in progress, if any. */
  talk: '' as Talk,
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
  endingShown: false,
  /** The random encounter being fought (roadmap #67), from the veil until the
   *  hero is back on the map. */
  encounter: null as EncounterSpec | null
})


let input: Input | null = null
/**
 * The game's one input record. The flow owns it (`boot.ts` and the HUD take
 * this same record), so a place built before the engine chunk has run still
 * reads the controls: a zone built with none threw on every frame.
 */
export const gameInput = (): Input => (input ??= createInput())

/**
 * The loader is building the first scene and the game has not taken it up
 * yet (`boot.adoptBootMode`). A travel in that window was undone when it
 * was: the prepared scene replaced the place travelled to and the flow
 * named the wrong node. Nothing is built for a travel until then.
 */
let booting = false
/** The engine chunk is in and the loader is about to build: travel waits. */
export const bootStarting = (): void => { booting = true }
/** The game shows its first scene: travel is open. */
export const bootAdopted = (): void => { booting = false }

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

/** A town's look: Oakhaven is a ruin once it has fallen, and every town the
 *  demons overran is one in the afterplay until its road is purged. */
export const townTheme = (town: TownId): ThemeId =>
  ((town === 'oakhaven' && hasFlag('oakhavenFallen')) || flagSet().has(overrunFlag(town)) ? 'ruin' : TOWNS[town].theme)

const setupFor = (node: NodeId): ZoneSetup => {
  const def = NODE_BY_ID[node]!
  const visits = profile.world.visits[node] ?? 0
  const flags = flagSet()
  if (def.kind === 'town') {
    const town = node as TownId
    return { kind: 'town', town, theme: townTheme(town), seed: hashSeed(node, 7), level: profile.level, difficulty: 1, flags }
  }
  if (def.kind === 'arena') {
    return { kind: 'arena', theme: 'arena', seed: hashSeed(node, visits), level: profile.level, difficulty: difficultyFactor(), flags, arenaMod: arenaModOf() }
  }
  // The afterplay: every zone is its invaded self (`data/invasion.ts`).
  const invaded = profile.world.afterplay
  const zone = zoneOf(node as ZoneId, invaded)
  const hostile = hostileFaction()
  return {
    kind: 'zone',
    zone: zone.id,
    theme: zone.theme,
    seed: hashSeed(node, visits),
    level: visitLevel(zone, profile.level),
    ...(invaded ? { invaded } : {}),
    difficulty: difficultyFactor(),
    // The very first visit of a new save opens gently.
    tutorial: node === 'plains' && isFreshProfile(),
    ambush: hostile ? AMBUSH_KIND[hostile] : null,
    // A core sold to the Syndicate leaves the mines crawling.
    extra: node === 'mines' && hasFlag('coreSold') ? 1 : 0,
    // The dragon keeps its bargain where it matters.
    dragonAlly: hasFlag('dragonPact') && (node === 'fortress' || node === 'rift'),
    // The treasure map (#89): the pieces still lying here, the X once it is whole.
    ...treasureFor(node),
    // A cage (#100), until it has been opened.
    cage: !!cageOf(node) && !hasFlag(cageOf(node)!.flag),
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
  /** Arena: the waves fought to their last enemy. */
  waves: number
  /** Chests opened of the chests the visit held. */
  chests?: { opened: number; total: number }
  /** One-time chests emptied this visit (their save keys). */
  special?: readonly string[]
  /** The mana potion stock as the visit leaves it (some drunk, some found). */
  manaPotions?: number
  /** Bosses beaten and chests opened of the visit's (a zone only). */
  mastery?: Mastery
  /** The rested pool as the visit leaves it (seconds of double XP, #9). */
  rested?: number
  /** Kills by enemy kind (the faction contracts, #15). */
  killKinds?: Readonly<Record<string, number>>
  /** Herbs picked, by plant (#88). */
  herbs?: Readonly<Record<string, number>>
  /** Ore mined (#99), nuggets by metal. */
  ores?: Readonly<Record<string, number>>
  /** Treasure map pieces picked up (#89). */
  pieces?: readonly string[]
  /** The elixirs as the visit leaves them (some drunk, #87), and the one carried. */
  elixirs?: Readonly<Record<string, number>>
  elixirPick?: string
  /** Health lost over the visit and the hero's health (the careful clear, #113). */
  lost?: number
  maxHp?: number
  /** The zone was its invaded self (the afterplay). */
  invaded?: boolean
  /** Times the hero fell and got up again (Second wind): the Dragoon's trial asks none. */
  falls?: number
  /** The Siege of Bastion: how it ended (`sim/siege.ts`). */
  siege?: { tier: SiegeTier; story: boolean; waves: number; earned: number; flawless: boolean; won: boolean }
}

type Precompile = (mode: GameMode, onProgress: (f01: number) => void) => Promise<void>
let precompile: Precompile = async () => {}
/** `boot.ts` owns the renderer; it hands the shader warm-up in. */
export const setPrecompile = (fn: Precompile): void => { precompile = fn }

const openPanel = (panel: 'map' | 'character' | 'inventory' | 'skills'): void => {
  if (flow.modal || flow.talk || flow.loading) return
  // The loadout is fixed once a fight is on: menus open in towns and on the map.
  if (flow.screen === 'zone') return
  if (panel === 'map') { openMap(); return }
  flow.modal = panel
}

/** What a built place must offer the flow (the tests hand in a stand-in). */
export interface BuiltPlace extends GameMode {
  setup: { theme: ThemeId }
}
type NodeBuilder = (node: NodeId, onProgress: (p01: number) => void, encounter?: EncounterSpec, saved?: SavedVisit) => Promise<BuiltPlace>

/**
 * ─── A visit kept in a manual save slot ─────────────────────────────────────
 *
 * The place the hero was in when the game was saved, and how to rebuild it
 * exactly: its setup as it was built (the seed above all), and what has
 * happened in it since (`ZoneMode.snapshot`). Loading the slot boots straight
 * back into it (`createBootMode`) — no new visit, no re-populated zone.
 */
export interface SavedVisit {
  v: 1
  node: NodeId
  encounter: EncounterSpec | null
  setup: Omit<ZoneSetup, 'flags'> & { flags: string[] }
  resume: VisitResume
}

/** The visit being played, as a save slot keeps it (null: not in a place). */
export const savedVisit = (): SavedVisit | null => {
  const mode = app.mode
  if (!(mode instanceof ZoneMode) || flow.loading || !flow.node || (flow.screen !== 'zone' && flow.screen !== 'town')) return null
  const resume = mode.snapshot()
  if (!resume) return null
  return {
    v: 1,
    node: flow.node as NodeId,
    encounter: flow.encounter ? JSON.parse(JSON.stringify(flow.encounter)) as EncounterSpec : null,
    setup: { ...JSON.parse(JSON.stringify({ ...mode.setup, flags: undefined })), flags: [...mode.setup.flags] },
    resume
  }
}
setVisitSnapshotProvider(savedVisit)

/** A random encounter's fight: the region's ground and enemies, at its level. */
const encounterSetup = (e: EncounterSpec): ZoneSetup => (e.siege ? siegeSetup(e) : {
  kind: 'zone', zone: e.zone, theme: ZONES[e.zone].theme, seed: e.seed, level: e.level, difficulty: difficultyFactor(),
  encounter: e.packs.map(p => [...p]), flags: flagSet(), ...(e.escort ? { escort: true } : {}), ...(e.invaded ? { invaded: true } : {})
})

/**
 * The Siege of Bastion (afterplay §8): the fort's south gate and its three
 * lanes, fought at the hero's level (never under 38) plus the tier's.
 */
const siegeSetup = (e: EncounterSpec): ZoneSetup => ({
  kind: 'arena', theme: ZONES.outskirts.theme, seed: e.seed, level: e.level, difficulty: difficultyFactor(), flags: flagSet(),
  siege: { ...e.siege!, commander: hasFlag('oakhavenFallen') ? 'mara' : 'hale' }
})

/**
 * Ring the bell: the siege begins (the captain's word, `SiegeModal`). Built
 * behind the veil like an encounter, so its end, a retry and the way back
 * (the map, at the fort) are an encounter's.
 */
export const startSiege = async (tier: SiegeTier): Promise<void> => {
  if (flow.loading || !siegeTierOpen(tier)) return
  const story = storySiegeDue()
  // The story's siege is fought on Normal.
  const t: SiegeTier = story ? 'normal' : tier
  flow.modal = ''
  flow.npc = null
  await startEncounter({
    kind: 'fight', zone: 'outskirts', level: siegeEnemyLevel(profile.level, t), seed: hashSeed(`siege:${t}`, profile.meta.siege.runs), packs: [[SIEGE_LORD]],
    siege: { tier: t, story, rotation: profile.meta.siege.runs }
  })
}

/** The siege as the result screen tells it. */
export interface SiegeResultView { tier: SiegeTier; waves: number; earned: number; banked: number; glass: number; milestones: string[]; story: boolean }

/**
 * Bank a siege that is over (`state/siege.ts`): its Marks (half of them on a
 * loss), and on a win the purse, the XP and the rolled piece go into the
 * visit's tally, so the result screen counts them with the rest.
 */
const bankSiege = (o: NonNullable<VisitTally['siege']>, h: VisitTally & { xp: number; gold: number; items: readonly string[] }): SiegeResultView => {
  const banked = marksBanked(o.earned, o.won)
  const r = recordSiege({ tier: o.tier, won: o.won, story: o.story, waves: o.waves, earned: o.earned, banked, flawless: o.flawless }, hashSeed('siegePrize', profile.meta.siege.runs))
  if (r.reward) {
    h.xp += r.reward.xp
    h.gold += r.reward.gold
  }
  if (r.item) h.items = [...h.items, r.item]
  for (const m of r.milestones) pushHud({ t: 'toast', key: `siege.milestone.${m.id}` })
  return { tier: o.tier, waves: o.waves, earned: o.earned, banked, glass: r.reward?.glass ?? 0, milestones: r.milestones.map(m => m.id), story: o.story }
}

/**
 * Set out with the caravan (roadmap #85, D106): the road between Sunford and
 * Oakhaven, in the outskirts' own land, three ambushes on the way. Asked for
 * at a board whose escort task is still open today.
 */
export const setOutEscort = async (): Promise<void> => {
  if (flow.loading) return
  const day = dayKey()
  const zone: ZoneId = 'outskirts'
  const seed = hashSeed(`escort:${day}`, profile.stats.runs)
  flow.modal = ''
  await startEncounter({ kind: 'fight', zone, level: visitLevel(ZONES[zone], profile.level), seed, packs: escortPacks(zone, seed), escort: true })
}

const buildZone = async (node: NodeId, onProgress: (p01: number) => void, encounter?: EncounterSpec, saved?: SavedVisit): Promise<ZoneMode> => {
  // A saved visit is rebuilt from the setup it was built with, not today's.
  const setup: ZoneSetup = saved
    ? { ...saved.setup, flags: new Set(saved.setup.flags) }
    : encounter ? encounterSetup(encounter) : setupFor(node)
  const mode = await ZoneMode.create(setup, gameInput(), {
    onEnd: (outcome) => { void finishVisit(outcome) },
    askSecondWind: offerSecondWind,
    onInteract: (npcId) => talkTo(npcId),
    onPause: () => { if (!flow.modal && !flow.talk && !flow.loading && flow.screen !== 'map') flow.modal = 'pause' },
    onPanel: openPanel,
    menuOpen: () => !!flow.talk || !!flow.modal
  }, p => onProgress(p * 0.82), saved?.resume)
  await precompile(mode, f => onProgress(0.82 + f * 0.12))
  try { await mode.warmUp(async () => {}, f => onProgress(0.94 + f * 0.06)) } catch (e) { console.warn('[flow] warm-up render failed', e) }
  onProgress(1)
  return mode
}

let buildNode: NodeBuilder = buildZone
/** Build a place without showing it, and show a built one (the recorder cuts
 *  between prebuilt places; the game itself travels with `travel`). */
export const buildPlace = (node: NodeId, onProgress: (p01: number) => void, encounter?: EncounterSpec): Promise<BuiltPlace> => buildNode(node, onProgress, encounter)
export const enterPlace = (node: NodeId, mode: BuiltPlace): void => enter(node, mode)
/** Test seam: build places without a GPU. */
export const setNodeBuilder = (fn: NodeBuilder | null): void => { buildNode = fn ?? buildZone }

/**
 * Poki's per-level funnel (the Player Fit table): a zone visit is a "level".
 * A `start` is always closed by exactly one `complete` or `fail`, so the
 * open one is remembered here. A no-op on every other portal (stub alias).
 */
let measuring = ''
/** An encounter's "level" in the funnel: one name for all of them. */
const ENCOUNTER_LEVEL = 'encounter'
const measureStart = (node: string): void => {
  if (NODE_BY_ID[node]?.kind === 'town') return
  if (measuring) pokiMeasure('level', measuring, 'fail')
  measuring = node
  pokiMeasure('level', node, 'start')
}
const measureEnd = (node: string, won: boolean): void => {
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
  flow.encounter = null
  profile.world.at = node
  // Back on the map, the hero stands at the place he entered.
  setMapPos(...mapSpot(node))
  if (def.kind === 'town') {
    // A town is "cleared" by walking into it: its roads open.
    if (clearNode(node)) saveProfile()
    // The fort, the first time (the afterplay's B2): its people take him in.
    if (storyArrive(node)) pushHud({ t: 'toast', key: 'breaking.toast.brk2' })
  }
  setMusicTrack(trackForTheme(mode.setup.theme))
  startGameMusic()
  app.setMode(mode)
  app.setWanted(true)
  measureStart(node)
}

/** The first scene (no main menu): the opening fight, or the last town. */
export const createBootMode = async (onProgress: (p01: number) => void = () => {}): Promise<GameMode> => {
  booting = true
  // The portal's own board, when the build carries one: joined on arrival.
  void joinPortalBoard(lifetimeXp())
  // The save is read (the cloud's too): a new player gets the introductions,
  // a returning one is past them (`coach/reveal.ts`).
  classifyOnboarding()
  // A save slot was just loaded mid-visit: straight back into that moment.
  const saved = takeResumeVisit() as SavedVisit | null
  if (saved && saved.v === 1 && NODE_BY_ID[saved.node]) {
    try {
      const mode = await buildNode(saved.node, onProgress, saved.encounter ?? undefined, saved)
      const def = NODE_BY_ID[saved.node]!
      flow.node = saved.node
      flow.encounter = saved.encounter
      flow.screen = def.kind === 'town' && !saved.encounter ? 'town' : 'zone'
      if (!saved.encounter) profile.world.at = saved.node
      setMusicTrack(trackForTheme(mode.setup.theme))
      measureStart(saved.encounter ? ENCOUNTER_LEVEL : saved.node)
      return mode
    } catch (e) {
      // A save from a game version that builds this place differently: the
      // usual start instead (the profile in the slot is loaded either way).
      console.warn('[flow] the saved visit could not be restored', e)
      flow.encounter = null
    }
  }
  const at = profile.world.at
  const node: NodeId = isFreshProfile() ? 'plains' : NODE_BY_ID[at]?.kind === 'town' ? at : 'sunford'
  const mode = await buildNode(node, onProgress)
  const def = NODE_BY_ID[node]!
  flow.node = node
  flow.screen = def.kind === 'town' ? 'town' : 'zone'
  profile.world.at = node
  setMusicTrack(trackForTheme(mode.setup.theme))
  measureStart(node)
  return mode
}

/**
 * Travel to a node. The place is built BEHIND the loading veil, time-sliced so
 * the veil's bar keeps moving, and only takes over once it is complete,
 * shaders included.
 */
export const travel = async (node: NodeId): Promise<void> => {
  // Any place without a story lock: too strong is the player's own risk (#72).
  if (flow.loading || booting || !NODE_BY_ID[node] || !isNodeReachable(node) || !invasionLetsIn(node, profile.world.afterplay, flagSet())) return
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

/**
 * A random encounter met on the map (roadmap #67): a fight is built behind the
 * same veil as any journey, in the region's look, and fought like a zone. The
 * hero's place and his spot on the map stay as they are: win, retreat or
 * fall, he is back where he was walking.
 */
export const startEncounter = async (e: EncounterSpec): Promise<void> => {
  if (flow.loading || booting || e.kind === 'chest' || e.kind === 'merchant' || !e.packs.length) return
  flow.loading = true
  flow.loadProgress = 0
  flow.loadingNode = ''
  flow.encounter = e
  saveProfile()
  try {
    await afterPaint()
    app.setWanted(false)
    const mode = await buildNode(e.zone, (p) => { flow.loadProgress = p }, e)
    flow.node = e.zone
    flow.modal = ''
    flow.results = null
    flow.screen = 'zone'
    // The siege fights to the colosseum's track (its own is a later phase's).
    setMusicTrack(trackForTheme(e.siege ? 'arena' : mode.setup.theme))
    startGameMusic()
    app.setMode(mode)
    app.setWanted(true)
    measureStart(ENCOUNTER_LEVEL)
  } catch (err) {
    console.error('[flow] encounter failed', err)
    flow.encounter = null
    app.setWanted(true)
  } finally {
    flow.loading = false
  }
}

/** A chest found in the grass: opened on the spot, on the map. Returns what it held. */
export const openFoundChest = (e: EncounterSpec): { gold: number; xp: number } => {
  const r = chestReward(e.level)
  profile.gold += r.gold
  grantXp(r.xp)
  saveProfile()
  return r
}

/** A wandering merchant met on the road: his wares, over the map. */
export const meetMerchant = (e: EncounterSpec): void => {
  if (flow.modal || flow.talk || flow.loading) return
  flow.npc = { id: 'wanderer', role: 'shop', look: 'peddler', at: [0, 0], stock: { slots: ['main', 'off', 'body', 'trinket'], tiers: merchantTiers(e.level) } }
  flow.modal = 'shop'
}

/** The world map, over whatever scene is up. */
export const openMap = (): void => {
  if (flow.loading) return
  flow.modal = ''
  flow.screen = 'map'
  hud.phase = 'map'
  app.setWanted(false)
  playMapBeat()
}

/**
 * The afterplay's beats on the map (B0 the rift's scream, B1 Scout Wren): told
 * as a portrait conversation the first time the map is up for each, one after
 * the other. A save from before the afterplay whose hero beat the Void Lord
 * hears them on its next map.
 */
const playMapBeat = (): void => {
  const b = storyMapBeat()
  if (!b || flow.modal || flow.talk || flow.loading || flow.screen !== 'map') return
  if (!talkCodeReady()) { void loadTalk().then(playMapBeat, () => {}); return }
  // B10's decision: the storyteller puts it over the dead dragon.
  if (b === 'quest.seal') { startDecision('seal'); return }
  const conv = conversationOf(b)
  if (!conv) return
  beginMapBeat(b)
  // The rift screams: a red flash and a jolt (B0).
  if (b === 'story.rift') { pushHud({ t: 'flash', color: '#c0202a', strength: 0.8 }); pushHud({ t: 'hurt', strength: 1 }) }
  startTalk('map', conv, 'portrait', '', 'breaking.title')
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

// ─── Triple the purse (roadmap #19) ──────────────────────────────────────────

/** Is "Triple the purse" on offer on this result? A won visit that earned
 *  gold, not the opening fight, once (D59). */
export const purseOffered = (r: ResultsData | null): boolean =>
  // Not a siege's: its purse is the afterplay's own sized reward (§11).
  !!r && r.outcome === 'victory' && r.gold > 0 && !r.opening && !r.tripled && !r.siege && canOfferReward.value

let purseBusy = false
/**
 * The video, then the purse ×3 in total: the gold the run earned is already
 * banked, twice that again goes in — granted and saved before the coins fly.
 */
export const triplePurse = async (): Promise<boolean> => {
  const r = flow.results
  if (purseBusy || !r || !purseOffered(r)) return false
  purseBusy = true
  try {
    return await claimReward(() => {
      profile.gold += r.gold * 2
      r.tripled = true
      saveProfile()
      void flushSaveNow()
    })
  } finally {
    purseBusy = false
    if (isRewardGated) resumeMusicAfterAd()
  }
}

// ─── Second wind (roadmap #18) ───────────────────────────────────────────────

/**
 * May the fallen hero be offered Second wind? A rewarded video must be ready
 * (or the build has no ads at all, and it is free); never after the opening
 * fight (the first visit ever), never in the colosseum (it would skew the
 * best-wave board), never in a recorded clip.
 */
export const secondWindAllowed = (mode: 'zone' | 'arena' | 'town', siege = false): boolean =>
  !PREVIEW_ON && (mode === 'zone' || siege) && profile.stats.runs > 0 && canOfferReward.value

/** The scene asks when the hero falls: true holds the defeat on the offer. */
const offerSecondWind = (): boolean => {
  const z = app.mode instanceof ZoneMode ? app.mode : null
  // In a siege only the hero's fall is undone, never the gate's (afterplay §8.1).
  if (!z || flow.modal || z.sim.siege?.phase === 'lost' || !secondWindAllowed(z.sim.mode, !!z.sim.siege)) return false
  flow.modal = 'secondWind'
  return true
}

let windBusy = false
/**
 * Take Second wind: the video, then up again. A video that did not finish
 * grants nothing and leaves the offer up (its button goes when no other video
 * is ready, leaving "No thanks"). The music the ad stopped comes back either way.
 */
export const takeSecondWind = async (): Promise<boolean> => {
  if (windBusy || flow.modal !== 'secondWind') return false
  windBusy = true
  let ok = false
  try {
    ok = await claimReward(() => {})
  } finally {
    windBusy = false
    resumeMusicAfterAd()
  }
  if (!ok) return false
  flow.modal = ''
  const z = app.mode instanceof ZoneMode ? app.mode : null
  z?.secondWind(true)
  return true
}

/** No thanks: the defeat goes on to its result screen. */
export const declineSecondWind = (): void => {
  if (windBusy || flow.modal !== 'secondWind') return
  flow.modal = ''
  const z = app.mode instanceof ZoneMode ? app.mode : null
  z?.secondWind(false)
}

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
  await bankVisit(outcome, node, {
    xp: h.xp, gold: h.gold, kills: h.kills, items: h.items, seconds: mode.sim.time, waves: mode.sim.wave.cleared,
    lost: h.lost, maxHp: h.unit.s.maxHp, invaded: !!mode.setup.invaded, falls: h.falls ?? 0,
    chests: mode.sim.chests.length ? { opened: h.chests, total: mode.sim.chests.length } : undefined,
    special: mode.sim.specialOpened, rested: h.rested, killKinds: h.killKinds, herbs: h.herbs, ores: h.ores, pieces: h.pieces,
    // The flasks went in only where they may be drunk (not in a "No potions"
    // week): elsewhere the stocks stay as they were.
    ...(mode.setup.arenaMod !== 'nopotions' ? { manaPotions: h.manaPotions, elixirs: h.elixirs, elixirPick: h.elixirPick } : {}),
    ...(mode.sim.mode === 'zone' && !flow.encounter ? { mastery: zoneMastery(mode.sim) } : {}),
    ...(mode.sim.siege ? { siege: { tier: mode.sim.siege.tier, story: mode.sim.siege.story, waves: mode.sim.siege.cleared, earned: mode.sim.siege.earned, flawless: mode.sim.siege.flawless, won: outcome === 'victory' } } : {})
  })
}

/** Bank a decided visit: rewards, unlocks, the save, the result screen. */
export const bankVisit = async (outcome: 'victory' | 'defeat' | 'retreat', node: NodeId, tally: VisitTally): Promise<void> => {
  const h = { ...tally }
  // Was the Wanderer at the fort before this visit (a trial it passes brings him)?
  const came = flagSet().has(WANDERER_FLAG)
  // An encounter is a fight on the road: it pays, it may cost, but it clears
  // no place and brings no decision.
  const encounter = !!flow.encounter
  measureEnd(encounter ? ENCOUNTER_LEVEL : node, outcome === 'victory')
  const levelBefore = profile.level
  // Read before the run counter moves: the first visit ever is the opening fight.
  const opening = profile.stats.runs === 0
  const items: ResultItem[] = []
  // A careful clear (#113): a win with little health lost pays up to twice.
  const careful = outcome === 'victory' && node !== 'arena' && !h.siege && h.lost !== undefined && h.maxHp ? carefulMult(h.lost, h.maxHp) : 1
  const carefulXp = Math.round(h.xp * (careful - 1))
  const carefulGold = Math.round(h.gold * (careful - 1))
  // The siege (afterplay §8): its Marks, a win's purse, XP and piece, its milestones.
  const sieged = h.siege ? bankSiege(h.siege, h) : null
  grantXp(h.xp + carefulXp)
  profile.gold += h.gold + carefulGold
  for (const id of h.items) {
    const r = gainItem(id)
    items.push({ id, added: r.added, gold: r.gold })
  }
  // What the chests held beside gold and gear: the stock of mana potions as
  // it stands, and the one-time chests that are now empty for good.
  if (h.manaPotions !== undefined) setManaPotions(h.manaPotions)
  if (h.elixirs) setElixirs(h.elixirs, h.elixirPick ?? '')
  if (h.rested !== undefined) profile.meta.rested = Math.max(0, Math.min(profile.meta.rested, h.rested))
  if (h.special?.length) markChestsOpened(h.special)
  // The herbs picked go into the pouch, whatever the visit's end.
  if (h.herbs) addHerbs(h.herbs)
  // So does the ore (#99).
  if (h.ores) addOres(h.ores)
  // So do the map's pieces (#89); the buried chest dug up ends the errand.
  if (h.pieces?.length) addPieces(h.pieces)
  if (h.special?.some(k => k.endsWith(':treasure'))) markTreasureDug()
  // A cage opened (#100): whoever was in it is free, and found again in town.
  if (h.special?.some(k => k.endsWith(':cage'))) freeCaptives(h.special.find(k => k.endsWith(':cage'))!.split(':')[0]!)
  // The caravan arrived (#85): the boards' escort tasks are done, to hand in.
  if (flow.encounter?.escort && outcome === 'victory') finishEscortTasks()
  const mastery = h.mastery && !encounter ? { ...h.mastery, ...recordMastery(node, h.mastery) } : undefined
  profile.stats.kills += h.kills
  // The boards' defeat tasks (#85) and the errands taken count what the visit did.
  countTasks({ zone: !encounter && node in ZONES ? node as ZoneId : '', kills: h.killKinds ?? {} })
  countErrands({ node: encounter ? '' : node, won: outcome === 'victory', kills: h.killKinds ?? {} })
  // The faction contracts count what the visit did (#15).
  countContracts({ zone: !encounter && node in ZONES ? node as ZoneId : '', won: outcome === 'victory', kills: h.killKinds ?? {}, chests: h.chests?.opened ?? 0 })
  profile.stats.runs++
  profile.stats.playSeconds += Math.round(h.seconds)
  let goldLost = 0
  let firstClear = false
  const unlocked: NodeId[] = []
  if (outcome === 'victory' && !encounter) {
    const before = new Set(Object.keys(NODE_BY_ID).filter(n => isNodeOpen(n as NodeId)))
    firstClear = clearNode(node)
    // An invaded zone's first win (afterplay §4): the next one in the
    // invasion's order opens; on the result screen it is a first clear.
    // Every invaded clear brings the siege bell nearer (§8.4).
    if (h.invaded && node in ZONES) countSiegeClear()
    // Every zone won brings the fair games' full prizes nearer again (§9).
    if (node in ZONES) countFairClear()
    if (h.invaded && node in ZONES && !hasFlag(invadedFlag(node as ZoneId))) {
      profile.world.flags.push(invadedFlag(node as ZoneId))
      firstClear = true
    }
    profile.questsDone++
    // A finale that carries a quest brings its decision (once).
    const q = questOfNode(node)
    if (q && !profile.quests.done[q.id]) flow.quest = q.id
    // The afterplay (the Breaking): the zone is purged, whoever was held on
    // its road goes to the fort, and the story moves on.
    if (node in ZONES) {
      const story = storyZoneWon(node as ZoneId)
      // B8's Leviathan Scale and anything else the story now owes (afterplay phase 8).
      claimAfterplayDues()
      if (rescuesIn(story).length) pushHud({ t: 'toast', key: 'breaking.toast.rescued' })
      for (const b of ['brk3', 'brk4', 'brk5', 'brk6', 'brk7', 'brk8', 'brk9', 'brk10']) if (story.includes(b)) pushHud({ t: 'toast', key: `breaking.toast.${b}` })
    }
    for (const n of Object.keys(NODE_BY_ID)) if (!before.has(n) && isNodeOpen(n as NodeId)) unlocked.push(n as NodeId)
    // The prestige trials (afterplay §10): the Leviathan slain, the Elder Dragon slain without a fall.
    for (const f of visitTrialFlags(true, tally.killKinds ?? {}, tally.falls ?? 0)) if (!hasFlag(f)) profile.world.flags.push(f)
  } else if (outcome === 'defeat') {
    profile.stats.deaths++
    // The colosseum is a ladder: falling is how a climb ends, not a loss (#10);
    // a caravan lost on the road costs the task, not the purse (#85).
    if (node !== 'arena' && !flow.encounter?.escort && !h.siege) {
      goldLost = Math.floor(profile.gold * DEFEAT_GOLD_LOSS)
      profile.gold -= goldLost
    }
  }
  // A prestige trial passed (a siege, a boss): the Mysterious Wanderer is at the fort (afterplay §10).
  if (!came && flagSet().has(WANDERER_FLAG)) pushHud({ t: 'toast', key: 'prestige.toast.wanderer' })
  // The colosseum's best, however the climb ended (#10): all-time and this week.
  const arenaNew = node === 'arena' && !encounter ? recordArenaWaves(h.waves) : null
  saveProfile()
  void flushSaveNow()
  const results: ResultsData = {
    node, outcome, xp: h.xp, gold: h.gold, goldLost, kills: h.kills, items, levelBefore, levelAfter: profile.level,
    seconds: h.seconds, firstClear, unlocked, waves: h.waves, chests: h.chests, ...(mastery ? { mastery } : {}), ...(encounter ? { encounter: true } : {}), ...(opening ? { opening: true } : {}),
    ...(arenaNew ? { arenaBest: arenaNew.best, arenaNewBest: arenaNew.isNew, arenaWeek: arenaNew.week } : {}),
    ...(careful > 1 ? { careful: { mult: Math.round(careful * 10) / 10, xp: carefulXp, gold: carefulGold, lostPct: Math.round((h.lost! / h.maxHp!) * 100) } } : {}),
    ...(sieged ? { siege: sieged } : {})
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
  if (arenaNew?.isNewWeek) void reportLadder(arenaNew.weekBest, profile.level)
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
  const decisionNext = !!flow.quest && !profile.quests.done[flow.quest]
  await adBreak(decisionNext)
  // The conversations' code is a lazy chunk (roadmap #142), long since loaded
  // on the idle queue as a rule.
  if (decisionNext) await loadTalk().catch(() => {})
  if (flow.quest && startDecision(flow.quest)) return
  afterVisit()
}

/**
 * The paced break behind a closed result screen, shared by Continue and
 * Retry. Never throws: whatever the ad does, the player moves on. The clock
 * says whether an ad may run; the content rules (`adPacing`, #20) say whether
 * this moment may take one.
 */
const adBreak = async (decisionNext = false): Promise<void> => {
  leaving = true
  const r = flow.results
  flow.modal = ''
  let adShown = false
  try {
    if (r && breakAllowed({ outcome: r.outcome, opening: r.opening, decisionNext }) && canShowInterstitial()) {
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
  // Back from an encounter: on the map, where he was walking.
  flow.encounter = null
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
  const encounter = flow.encounter
  await adBreak()
  flow.results = null
  // An encounter is met again as it was.
  if (encounter) await startEncounter(encounter)
  else await travel(node)
}

// ─── Towns ───────────────────────────────────────────────────────────────────

export const npcById = (id: string): NpcDef | null => {
  // The town the hero stands in first: a person who moved (a teacher or a
  // trader rescued to the fort) keeps their id, and stocks what they stock HERE.
  const here = flow.node && flow.node in TOWNS ? TOWNS[flow.node as TownId].npcs.find(x => x.id === id) : undefined
  if (here) return here
  for (const t of Object.values(TOWNS)) {
    const n = t.npcs.find(x => x.id === id)
    if (n) return n
  }
  return ROAD_NPCS.find(x => x.id === id) ?? null
}

// ─── Conversations ───────────────────────────────────────────────────────────

/** The live scene, when it is one the hero stands in. */
const liveZone = (): ZoneMode | null => (app.mode instanceof ZoneMode ? app.mode : null)

/**
 * Start a conversation. The world keeps running (no window, no pause): the
 * scene locks the hero's input, turns the speakers to each other and frames
 * them. A topic may hand over to a window (`flow.modal`); the conversation
 * waits behind it and goes on when it closes (`closeModal`).
 */
const startTalk = (kind: Exclude<Talk, ''>, conv: ConversationDef, stage: TalkStage, npcId = '', title = ''): boolean => {
  if (flow.talk) return false
  const begun = beginTalk(conv, {
    stage,
    title,
    onOpen: (w) => { flow.modal = w },
    onEnd: () => {
      lesson.free = ''
      flow.talk = ''
      liveZone()?.setTalk(false)
      if (kind === 'decision') afterVisit()
      else flow.npc = null
      // The next beat of the story, if one is waiting on the map.
      if (kind === 'map') playMapBeat()
    }
  })
  if (!begun) return false
  flow.talk = kind
  liveZone()?.setTalk(true, npcId)
  return true
}

/** The window a townsperson's role opens (reached through their conversation). */
const roleWindow = (npc: NpcDef): Modal =>
  (npc.role === 'shop' ? 'shop' : npc.role === 'trainer' ? 'trainer' : npc.role === 'healer' ? 'healer' : npc.role === 'alchemist' ? 'alchemy'
    : npc.role === 'gambler' ? (npc.game === 'memory' ? 'memory' : npc.game === 'cups' ? 'cups' : npc.game === 'whack' ? 'whack' : npc.game === 'ring' ? 'ring' : npc.game === 'arm' ? 'arm' : 'itemBattle') : '')

/** The hero walked up to a townsperson (the scene calls this; so may a test). */
/**
 * The hero has met a teacher of this class. For a hidden class that is news
 * in Silverbridge: its master teaches there from now on (roadmap #86).
 */
const metTeacher = (cls: ClassId | undefined): void => {
  if (!cls) return
  const f = foundFlag(cls)
  if (hasFlag(f) || !Object.values(TOWNS).some(t => t.npcs.some(n => n.needs?.includes(f)))) return
  profile.world.flags.push(f)
  saveProfile()
}

export const talkTo = (npcId: string): void => {
  if (flow.modal || flow.talk || flow.loading) return
  // The town square's notice board (#85): its tasks and the factions' contracts.
  if (npcId === BOARD) { flow.modal = 'contracts'; return }
  const npc = npcById(npcId)
  if (!npc) return
  // The conversations' code is a lazy chunk (roadmap #142): a town is never
  // entered without it, so only a road NPC met in its first seconds waits.
  if (!talkCodeReady()) { void loadTalk().then(() => talkTo(npcId), () => {}); return }
  // A rebuilt town's shops stock a tier higher (the afterplay).
  flow.npc = npc.stock && flow.node && flagSet().has(rebuiltFlag(flow.node)) ? { ...npc, stock: { ...npc.stock, tiers: rebuiltTiers(npc.stock.tiers) } } : npc
  if (npc.role === 'trainer') metTeacher(npc.cls)
  // The Wanderer teaches every prestige class whose trial is passed: the first of them to begin with.
  flow.trainerCls = npc.classes?.find(c => flagSet().has(trialFlag(c))) ?? npc.cls ?? ''
  // The road teacher (#136) teaches her one skill for nothing, once, as a gift.
  lesson.free = npc.id === MENTOR_NPC ? MENTOR_SKILL : ''
  if (npc.id === MENTOR_NPC) markTip(MENTOR_MET_TIP)
  // A rescued teacher in the first visit's camp (#156): their lessons and
  // nothing else (no small talk out here), the first one on them.
  const zone = liveZone()
  lesson.camp = !!zone && inCamp(zone.sim, npc.id)
  if (lesson.camp) { flow.modal = roleWindow(npc); return }
  const conv = conversationOf(npc.id)
  // Everyone has a conversation (a test holds the data to it); without one
  // the trade itself is still reachable.
  if (conv) startTalk('npc', conv, 'world', npc.id)
  else flow.modal = roleWindow(npc)
}

/**
 * A quest's decision (GDD §3.2), after the result screen: the same bubbles and
 * list, with the speaker as a portrait. It cannot be left without choosing;
 * the choice is applied by `decideQuest` and saved at once, and `afterVisit`
 * follows what is told afterwards. False when there is nothing to decide.
 */
const startDecision = (questId: string): boolean => {
  const conv = decisionOf(questId)
  if (!conv || profile.quests.done[questId]) return false
  flow.modal = ''
  return startTalk('decision', conv, 'portrait', '', `quest.${questId}.title`)
}

/** The hidden trainer a cleared zone holds, if it has one for this save. */
export const hiddenTrainer = (node: NodeId): { cls: ClassId; npc: string } | null =>
  hiddenTrainerOf(node, new Set(profile.world.cleared), flagSet())

/** Open a hidden trainer from the map. */
export const visitHiddenTrainer = (node: NodeId): void => {
  const t = hiddenTrainer(node)
  if (!t) return
  if (flow.modal || flow.talk || flow.loading) return
  if (!talkCodeReady()) { void loadTalk().then(() => visitHiddenTrainer(node), () => {}); return }
  flow.npc = { id: t.npc, role: 'trainer', look: t.npc, at: [0, 0], cls: t.cls }
  flow.trainerCls = t.cls
  metTeacher(t.cls)
  // Nobody to stand in front of on the map: the trainer speaks as a portrait.
  const conv = conversationOf(t.npc)
  if (conv) startTalk('map', conv, 'portrait')
  else flow.modal = 'trainer'
}

export const closeModal = (): void => {
  flow.modal = ''
  // A window a conversation opened: the talk goes on (a parting word, then
  // the topics again), and the townsperson stays the one in front of the hero.
  if (flow.talk && talkWaiting()) { talkResume(); return }
  flow.npc = null
  lesson.camp = false
}

// A conversation never outlives the place it is held in.
watch(() => flow.loading, (on) => {
  if (!on || !flow.talk) return
  abortTalk()
  lesson.free = ''
  lesson.camp = false
  flow.talk = ''
  flow.npc = null
  liveZone()?.setTalk(false)
}, { flush: 'sync' })
