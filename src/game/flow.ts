import { reactive, watch } from 'vue'
import { app, type GameMode } from './engine/app'
import { afterPaint } from './engine/slicer'
import type { Input } from './engine/input'
import { AMBUSH_KIND, FACTIONS, REP_HOSTILE, questOfNode, type FactionId } from './data/quests'
import { NODE_BY_ID, TOWNS, ZONES, foundFlag, hiddenTrainerOf, visitLevel, type NodeId, type NpcDef, type ThemeId, type TownId } from './data/zones'
import type { ClassId } from './data/skills'
import type { ZoneId } from './data/items'
import { ZoneMode, type ZoneSetup } from './modes/zoneMode'
import { hud } from './state/hud'
import { conversationOf, decisionOf } from './data/dialogs'
import type { ConversationDef } from './dialog/types'
import { abortTalk, beginTalk, talkResume, talkWaiting, type TalkStage } from './talk'
import {
  clearNode, flagSet, gainItem, grantXp, hasFlag, isFreshProfile, isNodeOpen, isNodeReachable, lifetimeXp, profile, saveProfile
} from './state/profile'
import { addHerbs, setElixirs, countContracts, countErrands, countTasks, finishEscortTasks, markChestsOpened, recordArenaWaves, recordMastery, setManaPotions } from './state/profile'
import { zoneMastery, type Mastery } from './sim/route'
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
import { BOARD } from './townTasks'
import { mapSpot, setMapPos } from './state/profile'

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
  | '' | 'results' | 'secondWind' | 'contracts' | 'pause' | 'character' | 'skills' | 'inventory' | 'journal' | 'shop' | 'trainer' | 'healer' | 'alchemy' | 'memory' | 'itemBattle' | 'ending' | 'help'
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
    return { kind: 'arena', theme: 'arena', seed: hashSeed(node, visits), level: profile.level, difficulty: difficultyFactor(), flags, arenaMod: arenaModOf() }
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
  /** The elixirs as the visit leaves them (some drunk, #87), and the one carried. */
  elixirs?: Readonly<Record<string, number>>
  elixirPick?: string
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
type NodeBuilder = (node: NodeId, onProgress: (p01: number) => void, encounter?: EncounterSpec) => Promise<BuiltPlace>

/** A random encounter's fight: the region's ground and enemies, at its level. */
const encounterSetup = (e: EncounterSpec): ZoneSetup => ({
  kind: 'zone', zone: e.zone, theme: ZONES[e.zone].theme, seed: e.seed, level: e.level, difficulty: difficultyFactor(),
  encounter: e.packs.map(p => [...p]), flags: flagSet(), ...(e.escort ? { escort: true } : {})
})

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

const buildZone = async (node: NodeId, onProgress: (p01: number) => void, encounter?: EncounterSpec): Promise<ZoneMode> => {
  const setup = encounter ? encounterSetup(encounter) : setupFor(node)
  const mode = await ZoneMode.create(setup, input!, {
    onEnd: (outcome) => { void finishVisit(outcome) },
    askSecondWind: offerSecondWind,
    onInteract: (npcId) => talkTo(npcId),
    onPause: () => { if (!flow.modal && !flow.talk && !flow.loading && flow.screen !== 'map') flow.modal = 'pause' },
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
  }
  setMusicTrack(trackForTheme(mode.setup.theme))
  startGameMusic()
  app.setMode(mode)
  app.setWanted(true)
  measureStart(node)
}

/** The first scene (no main menu): the opening fight, or the last town. */
export const createBootMode = async (onProgress: (p01: number) => void = () => {}): Promise<GameMode> => {
  // The portal's own board, when the build carries one: joined on arrival.
  void joinPortalBoard(lifetimeXp())
  // The save is read (the cloud's too): a new player gets the introductions,
  // a returning one is past them (`coach/reveal.ts`).
  classifyOnboarding()
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
  if (flow.loading || !NODE_BY_ID[node] || !isNodeReachable(node)) return
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
  if (flow.loading || e.kind === 'chest' || e.kind === 'merchant' || !e.packs.length) return
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
    setMusicTrack(trackForTheme(mode.setup.theme))
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
  !!r && r.outcome === 'victory' && r.gold > 0 && !r.opening && !r.tripled && canOfferReward.value

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
export const secondWindAllowed = (mode: 'zone' | 'arena' | 'town'): boolean =>
  !PREVIEW_ON && mode === 'zone' && profile.stats.runs > 0 && canOfferReward.value

/** The scene asks when the hero falls: true holds the defeat on the offer. */
const offerSecondWind = (): boolean => {
  const z = app.mode instanceof ZoneMode ? app.mode : null
  if (!z || flow.modal || !secondWindAllowed(z.sim.mode)) return false
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
    chests: mode.sim.chests.length ? { opened: h.chests, total: mode.sim.chests.length } : undefined,
    special: mode.sim.specialOpened, rested: h.rested, killKinds: h.killKinds, herbs: h.herbs,
    // The flasks went in only where they may be drunk (not in a "No potions"
    // week): elsewhere the stocks stay as they were.
    ...(mode.setup.arenaMod !== 'nopotions' ? { manaPotions: h.manaPotions, elixirs: h.elixirs, elixirPick: h.elixirPick } : {}),
    ...(mode.sim.mode === 'zone' && !flow.encounter ? { mastery: zoneMastery(mode.sim) } : {})
  })
}

/** Bank a decided visit: rewards, unlocks, the save, the result screen. */
export const bankVisit = async (outcome: 'victory' | 'defeat' | 'retreat', node: NodeId, h: VisitTally): Promise<void> => {
  // An encounter is a fight on the road: it pays, it may cost, but it clears
  // no place and brings no decision.
  const encounter = !!flow.encounter
  measureEnd(encounter ? ENCOUNTER_LEVEL : node, outcome === 'victory')
  const levelBefore = profile.level
  // Read before the run counter moves: the first visit ever is the opening fight.
  const opening = profile.stats.runs === 0
  const items: ResultItem[] = []
  grantXp(h.xp)
  profile.gold += h.gold
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
    profile.questsDone++
    // A finale that carries a quest brings its decision (once).
    const q = questOfNode(node)
    if (q && !profile.quests.done[q.id]) flow.quest = q.id
    for (const n of Object.keys(NODE_BY_ID)) if (!before.has(n) && isNodeOpen(n as NodeId)) unlocked.push(n as NodeId)
  } else if (outcome === 'defeat') {
    profile.stats.deaths++
    // The colosseum is a ladder: falling is how a climb ends, not a loss (#10);
    // a caravan lost on the road costs the task, not the purse (#85).
    if (node !== 'arena' && !flow.encounter?.escort) {
      goldLost = Math.floor(profile.gold * DEFEAT_GOLD_LOSS)
      profile.gold -= goldLost
    }
  }
  // The colosseum's best, however the climb ended (#10): all-time and this week.
  const arenaNew = node === 'arena' && !encounter ? recordArenaWaves(h.waves) : null
  saveProfile()
  void flushSaveNow()
  const results: ResultsData = {
    node, outcome, xp: h.xp, gold: h.gold, goldLost, kills: h.kills, items, levelBefore, levelAfter: profile.level,
    seconds: h.seconds, firstClear, unlocked, waves: h.waves, chests: h.chests, ...(mastery ? { mastery } : {}), ...(encounter ? { encounter: true } : {}), ...(opening ? { opening: true } : {}),
    ...(arenaNew ? { arenaBest: arenaNew.best, arenaNewBest: arenaNew.isNew, arenaWeek: arenaNew.week } : {})
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
  for (const t of Object.values(TOWNS)) {
    const n = t.npcs.find(x => x.id === id)
    if (n) return n
  }
  return null
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
      flow.talk = ''
      liveZone()?.setTalk(false)
      if (kind === 'decision') afterVisit()
      else flow.npc = null
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
    : npc.role === 'gambler' ? (npc.game === 'memory' ? 'memory' : 'itemBattle') : '')

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
  flow.npc = npc
  if (npc.role === 'trainer') metTeacher(npc.cls)
  flow.trainerCls = npc.cls ?? ''
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
}

// A conversation never outlives the place it is held in.
watch(() => flow.loading, (on) => {
  if (!on || !flow.talk) return
  abortTalk()
  flow.talk = ''
  flow.npc = null
  liveZone()?.setTalk(false)
}, { flush: 'sync' })
