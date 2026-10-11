import { reactive, ref, toRaw, watch } from 'vue'
import { getState, setStates } from '@/use/useGameState'
import { saveDataVersion } from '@/use/useSaveStatus'
import {
  LEVEL_KEY, GOLD_KEY, STORY_KEY, QUESTS_DONE_KEY, HERO_KEY, INVENTORY_KEY, QUESTS_KEY, WORLD_KEY, STATS_KEY,
  TUTORIAL_KEY, VERSION_KEY, META_KEY
} from '@/keys'
import { SHELF_REFRESHES, dayKey, stockShelf, type Stock } from '../rareShelf'
import { RESTED_CAP, accrueRested } from '../rested'
import {
  CONTRACT_REP, GIFT_GOLD, REP_BLESSING, REP_GIFT, contractGold, countDeeds, giftItem, postContracts, type Contract, type VisitDeeds
} from '../contracts'
import type { ZoneId } from '../data/items'
import { weekKey } from '../arenaWeek'
import { ATTRS, ATTR_START, POINTS_PER_LEVEL, startAttrs, type Attr, type AttrBlock } from '../data/attributes'
import { MAX_LEVEL, addXp, xpToNext, xpToReach } from '../data/progression'
import { ACTIVE_SLOTS, PASSIVE_SLOTS, SKILL_BY_ID, meetsSkill, priceOf as skillPriceOf, CLASSES } from '../data/skills'
import { EQUIP_SLOTS, ITEM_BY_ID, noGear, priceOf as itemPriceOf, sellValue, slotOf, type EquipSlot } from '../data/items'
import { FORGE_MAX, forgeCost } from '../data/forge'
import { HERB_CAP, isPlant } from '../data/plants'
import { ORE_CAP, ORE_IDS, ORE_PRICE, isOre } from '../data/ores'
import { RECIPE_BY_ID, gradeMakes, type Grade } from '../data/smithing'
import { ELIXIR_BY_ID, ELIXIR_CAP, ELIXIR_IDS, brewFee, isElixir, type ElixirId } from '../data/elixirs'
import { BATTLE_MIN_ITEMS, BATTLE_ROW, MEMORY_ROW, battleFee, battleXp, gamblerTable, prizeOf } from '../gamble'
import { DUG_FLAG, MAP_PIECES, TREASURE_ERRAND, TREASURE_ZONE, isPiece, piecesIn } from '../data/treasure'
import { ESCORT_PAY, TASK_XP, countTaskDeeds, postTasks, taskGold, type TaskDeeds, type TownTask } from '../townTasks'
import { errandDef, type ErrandDef, type ErrandReward } from '../data/errands'
import { countTalk, countVisit, errandState, handInCost, settle, type ErrandDeeds, type ErrandSave, type ErrandState, type ErrandWorld } from '../errands'
import { FACTIONS, FRIEND_DISCOUNT, QUEST_BY_ID, REP_FRIEND, REP_MAX, REP_MIN, choiceOpen, type FactionId } from '../data/quests'
import { MAP, NODE_BY_ID, TOWNS, ZONES, nodeOpen, nodeReachable, type NodeId, type TownId } from '../data/zones'
import { heroStats, shopDiscount, sumBuild, type HeroBuild } from '../sim/stats'
import type { UnitStats } from '../sim/types'
import { heroGenderOf, type HeroGender } from '../art/heroPortrait'
import { setHeroForm } from '@/i18n/gendered'

/**
 * ─── The player profile ──────────────────────────────────────────────────────
 *
 * One reactive object the menus bind to and a zone visit reads its hero from.
 * It is persisted into the single `bcross_state` blob as a handful of `bc_*`
 * fields (see `src/keys.ts`) at CHECKPOINTS — a zone finished, a purchase, a
 * point spent, a quest decided — never per frame.
 *
 * Every field has a default and `loadProfile()` fills anything missing, so an
 * older save (or a partial cloud row) always hydrates into a complete profile.
 */

/** Bumped when a structured field changes shape. 2: three more equipment
 *  slots (head, hands, feet); a version 1 save loads with them empty. */
export const SAVE_VERSION = 2

export interface HeroSave {
  /** XP into the current level. */
  xp: number
  /** Attribute points as allocated (the base 5 included). */
  attrs: AttrBlock
  /** Points not yet spent. */
  points: number
  /** Every skill the hero has learned. */
  learned: string[]
  /** The six active slots and the three passive slots ('' = empty). */
  active: string[]
  passive: string[]
  /** The boy hero or the girl hero (roadmap #71), chosen on the first boot
   *  and changed on the character page. A save from before the choice has
   *  none and loads as the boy hero it always played. */
  gender: HeroGender
}

export interface InventorySave {
  /** Owned item ids (each named item is owned once). */
  items: string[]
  /** What is worn, by slot (null: empty). Head, hands and feet came with
   *  save version 2; an older save has no such keys and loads them empty. */
  equipped: Record<EquipSlot, string | null>
  /** Ids the player has not looked at yet (the "NEW" dot). */
  fresh: string[]
  /** Potions carried into each zone. */
  potions: number
  /** Mana potions in stock: found in chests or bought, kept between visits,
   *  never more than the belt has slots (`potions`). */
  manaPotions: number
  /** Upgrade levels by item id, +1..+5 (roadmap #90). A sold piece loses its. */
  upgrades: Record<string, number>
  /** The herb pouch: how many of each plant (roadmap #88), up to HERB_CAP. */
  herbs: Record<string, number>
  /** The ore pouch: nuggets of each metal (roadmap #99), up to ORE_CAP; and
   *  every metal ever mined (its smithing recipes are known). */
  ores: Record<string, number>
  oresFound: string[]
  /** A town smith has taught the hero smithing (#99, D122). */
  smithing: boolean
  /** Elixirs brewed by the alchemist (roadmap #87), up to ELIXIR_CAP of each,
   *  and the one the third flask pours ('' when none is carried). */
  elixirs: Record<string, number>
  elixirPick: string
}

export interface QuestSave {
  /** Quest id → the choice made. Permanent. */
  done: Record<string, string>
  rep: Record<FactionId, number>
  /** Errands taken (roadmap #85, #86, #89): where each stands. */
  errands: Record<string, ErrandSave>
}

export interface WorldSave {
  /** Nodes cleared (zones) or visited (towns). */
  cleared: string[]
  /** World-state flags written by quest choices. */
  flags: string[]
  /** The last place the hero entered (a zone, a town, the colosseum). */
  at: NodeId
  /** Where the hero's token stands on the world map, as fractions of the sheet
   *  (like `MAP[].at`): he walks it freely (roadmap #67). */
  pos: [number, number]
  /** Visits per zone (seeds the next layout). */
  visits: Record<string, number>
  /** The colosseum's best: waves survived. */
  arenaBest: number
  /** One-time chests already emptied ("zone:role": a puzzle's, a secret's). */
  chests: string[]
  /** Zone mastery (roadmap #70), per zone: bosses beaten and chests opened. */
  mastery: Record<string, ZoneMasterySave>
  /** Dialogue memory (`game/talk.ts`): who the hero has met (`<npc>`) and
   *  what was said (`<npc>.<topic>`), so nobody introduces themselves twice. */
  said: string[]
  /** Pieces of the treasure map found (roadmap #89), by piece id. */
  pieces: string[]
}

/** What the hero has made of a zone over all his visits (roadmap #70). */
export interface ZoneMasterySave {
  /** Bosses beaten (branch bosses and the finale's) and chests opened, all visits. */
  bosses: number
  chests: number
  /** The best visit's share of its bosses and chests, in percent. */
  best: number
  /** Visits that took every boss and every chest. */
  full: number
}

export interface StatsSave {
  kills: number
  deaths: number
  runs: number
  playSeconds: number
  bestLevel: number
  /** Every point of XP ever earned, still counting past the level cap: the
   *  leaderboard's score. Read it through `lifetimeXp()`. */
  xpEarned: number
}

/** The rare shelves (roadmap #19): stocked for one day at a time. */
export interface ShelfSave {
  /** The day (`dayKey`) the shelves below were stocked for. */
  day: string
  /** Merchant id → the pieces on their rare shelf today (bought ones stay
   *  listed and show as owned). */
  wares: Record<string, string[]>
  /** Merchant id → times re-stocked today (seeds the next stock). */
  rolls: Record<string, number>
  /** Rewarded re-stocks used today, over all merchants. */
  used: number
}

/** Day-to-day state on top of progress (`bc_meta`). A save from before any
 *  of it loads the defaults. */
/** A saved build (roadmap #14): the loadout and the gear, by slot. */
export interface PresetSave {
  /** The player's name for it ('' = the default "Build n"). */
  name: string
  active: string[]
  passive: string[]
  equipped: Record<EquipSlot, string | null>
}

/** The faction contracts on the boards (roadmap #15): posted for one day. */
export interface ContractsSave {
  day: string
  list: Contract[]
}

/** The colosseum's week (roadmap #10). */
export interface ArenaWeekSave {
  /** The ISO week the best below belongs to. */
  week: string
  best: number
}

export interface MetaSave {
  shelf: ShelfSave
  arena: ArenaWeekSave
  contracts: ContractsSave
  /** Factions whose +3 gift was collected. */
  repGifts: FactionId[]
  /** Two build presets (null: not saved yet). */
  presets: (PresetSave | null)[]
  /** Times the healer's respec was bought (the first is free). */
  respecs: number
  /** When the save was last written (ms since 1970): the start of an absence. */
  lastSeen: number
  /** Seconds of double kill XP waiting (roadmap #9). */
  rested: number
  /** The town boards' tasks of the day (roadmap #85), by town. */
  tasks: { day: string; towns: Partial<Record<TownId, TownTask[]>> }
  /** The gamblers' winning rows (roadmap #91, #92): games won in a row at
   *  the memory stand and at the item battle. */
  /** Wins in a row: at the memory stand, and at each item-battle table (by
   *  gambler, #115). `battle` is the old shared row, read once into Sunford's. */
  gamble: { memory: number; battle: number; rows: Record<string, number> }
}

/** What the last absence added to the rested pool, in seconds (0: nothing
 *  to announce). The map shows it once and clears it. */
export const restedGain = ref(0)

export interface Profile {
  level: number
  gold: number
  /** Zones cleared at least once (the save-merge "story" score). */
  story: number
  /** Runs won plus quests decided. */
  questsDone: number
  hero: HeroSave
  inv: InventorySave
  quests: QuestSave
  world: WorldSave
  stats: StatsSave
  /** One-time flags (true) and the control coach's per-glyph success counts. */
  tips: Record<string, true | number>
  meta: MetaSave
}

/** A place's own spot on the map sheet (fractions): where the hero stands at it. */
export const mapSpot = (id: NodeId): [number, number] => {
  const at = NODE_BY_ID[id]?.at ?? [0.265, 0.625]
  return [at[0], at[1]]
}

const emptySlots = (n: number): string[] => new Array<string>(n).fill('')

const defaultHero = (): HeroSave => {
  // A militia recruit: one trick learned on the drill ground, so the very
  // first fight already has a button to press.
  const active = emptySlots(ACTIVE_SLOTS)
  active[0] = 'shieldSlam'
  return { xp: 0, attrs: startAttrs(), points: 0, learned: ['shieldSlam'], active, passive: emptySlots(PASSIVE_SLOTS), gender: 'm' }
}

const defaultInv = (): InventorySave => ({
  items: ['rustedShortsword', 'woodenBuckler', 'paddedTunic'],
  // No cap, gloves or boots: the first ones found are the first ones worn.
  equipped: { ...noGear(), main: 'rustedShortsword', off: 'woodenBuckler', body: 'paddedTunic' },
  fresh: [],
  potions: 3,
  manaPotions: 0,
  upgrades: {},
  herbs: {},
  ores: {},
  oresFound: [],
  smithing: false,
  elixirs: {},
  elixirPick: ''
})

const defaults = (): Profile => ({
  level: 1,
  gold: 0,
  story: 0,
  questsDone: 0,
  hero: defaultHero(),
  inv: defaultInv(),
  quests: { done: {}, rep: { order: 0, syndicate: 0, circle: 0 }, errands: {} },
  world: { cleared: [], flags: [], at: 'plains', pos: mapSpot('plains'), visits: {}, arenaBest: 0, chests: [], mastery: {}, said: [], pieces: [] },
  stats: { kills: 0, deaths: 0, runs: 0, playSeconds: 0, bestLevel: 1, xpEarned: 0 },
  tips: {},
  meta: { shelf: { day: '', wares: {}, rolls: {}, used: 0 }, arena: { week: '', best: 0 }, contracts: { day: '', list: [] }, repGifts: [], presets: [null, null], lastSeen: 0, rested: 0, respecs: 0, tasks: { day: '', towns: {} }, gamble: { memory: 0, battle: 0, rows: {} } }
})

const num = (v: unknown, d: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && Number.isFinite(Number(v)) ? Number(v) : d)
const obj = <T extends object>(v: unknown, d: T): T => (v && typeof v === 'object' && !Array.isArray(v) ? { ...d, ...(v as T) } : d)
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])

/** A deep copy of plain data. JSON, like the blob's own trip to storage: it
 *  sees through Vue proxies (`structuredClone` throws on them), runs in every
 *  WebView a portal serves, and gives exactly what a reload would read back. */
const plain = <T>(v: T): T => JSON.parse(JSON.stringify(toRaw(v))) as T

/** A stored field as the profile may keep it: a copy, never the blob's own. */
const stored = (key: string): unknown => {
  const v = getState(key)
  return v !== null && typeof v === 'object' ? plain(v) : v
}

export const profile: Profile = reactive(defaults())

/**
 * Read the persisted fields into the reactive profile (fills defaults, drops
 * anything the game no longer knows).
 *
 * The profile gets COPIES. Holding the blob's own nested arrays would make
 * every in-memory change an edit of the save, written out by the next
 * unrelated write (a volume change) before any checkpoint took it. The profile
 * reaches the blob through `saveProfile` and nothing else.
 */
export const loadProfile = (): void => {
  const d = defaults()
  profile.level = Math.max(1, Math.min(MAX_LEVEL, Math.round(num(getState(LEVEL_KEY), 1))))
  profile.gold = Math.max(0, Math.round(num(getState(GOLD_KEY), 0)))
  profile.story = Math.max(0, Math.round(num(getState(STORY_KEY), 0)))
  profile.questsDone = Math.max(0, Math.round(num(getState(QUESTS_DONE_KEY), 0)))

  const hero = obj(stored(HERO_KEY), d.hero)
  const attrs = obj(hero.attrs, d.hero.attrs)
  for (const a of ATTRS) attrs[a] = Math.max(1, Math.round(num(attrs[a], 5)))
  hero.attrs = attrs
  hero.xp = Math.max(0, num(hero.xp, 0))
  hero.points = Math.max(0, Math.round(num(hero.points, 0)))
  hero.learned = strs(hero.learned).filter(id => SKILL_BY_ID[id])
  const slots = (v: unknown, n: number, kind: 'active' | 'passive'): string[] => {
    const out = strs(v).slice(0, n).map(id => (SKILL_BY_ID[id]?.kind === kind && hero.learned.includes(id) ? id : ''))
    while (out.length < n) out.push('')
    return out
  }
  hero.active = slots(hero.active, ACTIVE_SLOTS, 'active')
  hero.passive = slots(hero.passive, PASSIVE_SLOTS, 'passive')
  // A save from before the hero choice is the boy hero it always played.
  hero.gender = heroGenderOf(hero.gender)
  profile.hero = hero
  setHeroForm(hero.gender)

  const inv = obj(stored(INVENTORY_KEY), d.inv)
  inv.items = [...new Set(strs(inv.items).filter(id => ITEM_BY_ID[id]))]
  // Exactly the slots the game has now: a slot an older save does not know
  // (head, hands, feet) is empty, and a key it no longer knows is dropped.
  const worn = obj(inv.equipped, d.inv.equipped)
  const eq = noGear()
  for (const s of EQUIP_SLOTS) {
    const id = worn[s]
    if (typeof id === 'string' && id && inv.items.includes(id) && ITEM_BY_ID[id]?.slot === slotOf(s)) eq[s] = id
  }
  // One ring cannot be worn on both hands.
  if (eq.trinket2 && eq.trinket2 === eq.trinket1) eq.trinket2 = null
  inv.equipped = eq
  inv.fresh = strs(inv.fresh).filter(id => inv.items.includes(id))
  inv.potions = Math.max(1, Math.min(5, Math.round(num(inv.potions, 3))))
  // A save from before mana potions has none.
  inv.manaPotions = Math.max(0, Math.min(inv.potions, Math.round(num(inv.manaPotions, 0))))
  // A save from before upgrades has none; a level out of range or of a piece
  // no longer owned is dropped.
  const ups = obj(inv.upgrades, {}) as Record<string, unknown>
  inv.upgrades = {}
  for (const [id, v] of Object.entries(ups)) {
    const lvl = Math.round(num(v, 0))
    if (inv.items.includes(id) && lvl >= 1) inv.upgrades[id] = Math.min(FORGE_MAX, lvl)
  }
  // A save from before the herb pouch has none; only plants the game knows.
  const herbs = obj(inv.herbs, {}) as Record<string, unknown>
  inv.herbs = {}
  for (const [id, v] of Object.entries(herbs)) {
    const n = Math.round(num(v, 0))
    if (isPlant(id) && n > 0) inv.herbs[id] = Math.min(HERB_CAP, n)
  }
  // A save from before ore has no pouch; only the four metals.
  const ores = obj(inv.ores, {}) as Record<string, unknown>
  inv.ores = {}
  for (const [id, v] of Object.entries(ores)) {
    const n = Math.round(num(v, 0))
    if (isOre(id) && n > 0) inv.ores[id] = Math.min(ORE_CAP, n)
  }
  inv.oresFound = Array.isArray(inv.oresFound) ? ORE_IDS.filter(o => (inv.oresFound as unknown[]).includes(o)) : []
  for (const id of Object.keys(inv.ores)) if (!inv.oresFound.includes(id)) inv.oresFound.push(id)
  inv.smithing = inv.smithing === true
  // A save from before the alchemist has no elixirs; only the six he brews.
  const elix = obj(inv.elixirs, {}) as Record<string, unknown>
  inv.elixirs = {}
  for (const [id, v] of Object.entries(elix)) {
    const n = Math.round(num(v, 0))
    if (isElixir(id) && n > 0) inv.elixirs[id] = Math.min(ELIXIR_CAP, n)
  }
  inv.elixirPick = typeof inv.elixirPick === 'string' && (inv.elixirs[inv.elixirPick] ?? 0) > 0 ? inv.elixirPick : firstElixir(inv.elixirs)
  profile.inv = inv

  const quests = obj(stored(QUESTS_KEY), d.quests)
  quests.done = obj(quests.done, {})
  const rep = obj(quests.rep, d.quests.rep)
  for (const f of FACTIONS) rep[f] = Math.max(REP_MIN, Math.min(REP_MAX, Math.round(num(rep[f], 0))))
  quests.rep = rep
  // A save from before errands has none; an errand the game no longer has is
  // kept (a later build may bring it back) but cleaned to numbers.
  const errands = obj(quests.errands, {}) as Record<string, unknown>
  quests.errands = {}
  for (const [id, v] of Object.entries(errands)) {
    if (!v || typeof v !== 'object') continue
    const e = v as Partial<ErrandSave>
    quests.errands[id] = { step: Math.max(0, Math.round(num(e.step, 0))), have: Math.max(0, Math.round(num(e.have, 0))), done: e.done === true }
  }
  profile.quests = quests

  const storedWorld = stored(WORLD_KEY)
  const world = obj(storedWorld, d.world)
  world.cleared = [...new Set(strs(world.cleared).filter(id => NODE_BY_ID[id]))]
  world.flags = [...new Set(strs(world.flags))]
  world.visits = obj(world.visits, {})
  world.arenaBest = Math.max(0, Math.round(num(world.arenaBest, 0)))
  // A save from before one-time chests has opened none.
  world.chests = [...new Set(strs(world.chests))]
  // A save from before zone mastery has mastered nothing yet.
  const mastery: Record<string, ZoneMasterySave> = {}
  for (const [z, m] of Object.entries(obj(world.mastery, {}) as Record<string, unknown>)) {
    const v = obj(m, { bosses: 0, chests: 0, best: 0, full: 0 })
    mastery[z] = {
      bosses: Math.max(0, Math.round(num(v.bosses, 0))), chests: Math.max(0, Math.round(num(v.chests, 0))),
      best: Math.max(0, Math.min(100, Math.round(num(v.best, 0)))), full: Math.max(0, Math.round(num(v.full, 0)))
    }
  }
  world.mastery = mastery
  // A save from before the conversations has no memory: everyone is met anew.
  world.said = [...new Set(strs(world.said))]
  // A save from before the treasure map has no pieces.
  world.pieces = [...new Set(strs(world.pieces))]
  if (!NODE_BY_ID[world.at]) world.at = 'plains'
  // A save from before the hero walked the map freely: he stands at his place.
  // (Read off what was stored: the defaults would stand him at the plains.)
  world.pos = validPos((storedWorld as { pos?: unknown } | null)?.pos) ?? mapSpot(world.at)
  profile.world = world

  profile.stats = obj(stored(STATS_KEY), d.stats)
  profile.tips = obj(stored(TUTORIAL_KEY), {})

  const meta = obj(stored(META_KEY), d.meta)
  const shelf = obj(meta.shelf, d.meta.shelf)
  const wares: Record<string, string[]> = {}
  for (const [n, ids] of Object.entries(obj(shelf.wares, {}) as Record<string, unknown>)) wares[n] = strs(ids).filter(id => ITEM_BY_ID[id])
  const rolls: Record<string, number> = {}
  for (const [n, r] of Object.entries(obj(shelf.rolls, {}) as Record<string, unknown>)) rolls[n] = Math.max(0, Math.round(num(r, 0)))
  meta.shelf = { day: typeof shelf.day === 'string' ? shelf.day : '', wares, rolls, used: Math.max(0, Math.round(num(shelf.used, 0))) }
  // Presets (#14): kept as saved; what no longer exists is dropped on load.
  const presets: (PresetSave | null)[] = []
  for (let i = 0; i < PRESETS; i++) {
    const v = Array.isArray(meta.presets) ? (meta.presets[i] as unknown) : null
    if (!v || typeof v !== 'object') { presets.push(null); continue }
    const o = v as Partial<PresetSave>
    const ids = (a: unknown, n: number): string[] => { const out = strs(a).slice(0, n).map(id => (SKILL_BY_ID[id] ? id : '')); while (out.length < n) out.push(''); return out }
    const eq = noGear()
    const src = obj(o.equipped, {} as Record<string, unknown>)
    for (const s of EQUIP_SLOTS) { const id = src[s]; if (typeof id === 'string' && ITEM_BY_ID[id]) eq[s] = id }
    presets.push({ name: typeof o.name === 'string' ? o.name.slice(0, PRESET_NAME_MAX) : '', active: ids(o.active, ACTIVE_SLOTS), passive: ids(o.passive, PASSIVE_SLOTS), equipped: eq })
  }
  meta.presets = presets
  meta.respecs = Math.max(0, Math.round(num(meta.respecs, 0)))
  const aw = obj(meta.arena, d.meta.arena)
  meta.arena = { week: typeof aw.week === 'string' ? aw.week : '', best: Math.max(0, Math.round(num(aw.best, 0))) }
  // Contracts (#15): a day's list as posted; anything malformed is dropped
  // and the board posts afresh.
  const cs = obj(meta.contracts, d.meta.contracts)
  const list = Array.isArray(cs.list) ? cs.list.filter((c): c is Contract =>
    !!c && typeof c === 'object' && FACTIONS.includes((c as Contract).faction) && ['slay', 'clear', 'chests'].includes((c as Contract).kind) &&
    Number.isFinite((c as Contract).n) && Number.isFinite((c as Contract).have)) : []
  meta.contracts = list.length === FACTIONS.length && typeof cs.day === 'string' ? { day: cs.day, list } : { day: '', list: [] }
  meta.repGifts = strs(meta.repGifts).filter((f): f is FactionId => FACTIONS.includes(f as FactionId))
  // The boards' tasks (#85): a day's lists as posted; anything malformed is
  // dropped and that board posts afresh.
  const ts = obj(meta.tasks, d.meta.tasks)
  const towns: Partial<Record<TownId, TownTask[]>> = {}
  for (const [town, l] of Object.entries(obj(ts.towns, {}))) {
    if (!(town in TOWNS) || !Array.isArray(l)) continue
    const ok = l.filter((t): t is TownTask => !!t && typeof t === 'object' && ['slay', 'gather', 'escort'].includes((t as TownTask).kind) &&
      Number.isFinite((t as TownTask).n) && Number.isFinite((t as TownTask).have))
    if (ok.length) towns[town as TownId] = ok
  }
  meta.tasks = { day: typeof ts.day === 'string' ? ts.day : '', towns }
  // A save from before the gamblers has no winning rows.
  const gm = obj(meta.gamble, d.meta.gamble) as Record<string, unknown>
  const rows: Record<string, number> = {}
  const rawRows = gm.rows && typeof gm.rows === 'object' ? gm.rows as Record<string, unknown> : {}
  for (const [k, v] of Object.entries(rawRows)) rows[k] = Math.max(0, Math.min(BATTLE_ROW - 1, Math.round(num(v, 0))))
  // A save from before #115 kept one row for both tables: it was Sunford's.
  const legacy = Math.max(0, Math.min(BATTLE_ROW - 1, Math.round(num(gm.battle, 0))))
  if (legacy && rows.sunfordGambler === undefined) rows.sunfordGambler = legacy
  meta.gamble = {
    memory: Math.max(0, Math.min(MEMORY_ROW - 1, Math.round(num(gm.memory, 0)))),
    battle: 0,
    rows
  }
  // Rested (#9): the absence since the last save fills the pool. The new
  // last-seen is written by the next save; a reload before it reads the same
  // two numbers again and comes to the same pool.
  const now = Date.now()
  const r = accrueRested(Math.min(RESTED_CAP, Math.max(0, num(meta.rested, 0))), Math.max(0, num(meta.lastSeen, 0)), now)
  meta.rested = r.pool
  meta.lastSeen = now
  // Only ever raised here: a later re-read (a cloud row landing) must not
  // take back a welcome the map has not shown yet.
  if (r.gained > 0) restedGain.value = r.gained
  profile.meta = meta
}

/**
 * DEV ONLY: a sandboxed run writes nothing (the model bench, a probe that jumps
 * to a late zone with a made-up build). Folds out of every build.
 */
let saveSandbox = false
export const setSaveSandbox = (on: boolean): void => {
  saveSandbox = on
}

/**
 * Set once a save slot was loaded or a new game started (`saveSlots.ts`): the
 * blob already holds the NEW game and the page is about to reload, so the old
 * in-memory profile must never be written back over it by a checkpoint that
 * fires in the meantime.
 */
let profileReplaced = false
export const freezeProfile = (): void => {
  profileReplaced = true
}

/** Persist the whole profile (a checkpoint). Cheap: one debounced blob write.
 *  The blob gets copies, so play after a checkpoint waits for the next one. */
export const saveProfile = (): void => {
  if (import.meta.env.DEV && saveSandbox) return
  if (profileReplaced) return
  profile.meta.lastSeen = Date.now()
  setStates({
    [VERSION_KEY]: SAVE_VERSION,
    [LEVEL_KEY]: profile.level,
    [GOLD_KEY]: profile.gold,
    [STORY_KEY]: profile.story,
    [QUESTS_DONE_KEY]: profile.questsDone,
    [HERO_KEY]: plain(profile.hero),
    [INVENTORY_KEY]: plain(profile.inv),
    [QUESTS_KEY]: plain(profile.quests),
    [WORLD_KEY]: plain(profile.world),
    [STATS_KEY]: plain(profile.stats),
    [TUTORIAL_KEY]: plain(profile.tips),
    [META_KEY]: plain(profile.meta)
  })
}

let loaded = false
/** The profile has been read from the save (before that it holds defaults,
 *  and writing it out would put a first-timer over the real save). */
export const profileLoaded = (): boolean => loaded
/** Load once, and re-load whenever a cloud hydrate lands new data. */
export const initProfile = (): void => {
  if (loaded) return
  loaded = true
  loadProfile()
  watch(saveDataVersion, () => loadProfile())
}

/** Has this save ever been played? (A first-timer boots into the opening fight.) */
export const isFreshProfile = (): boolean =>
  profile.level <= 1 && profile.story === 0 && profile.questsDone === 0 && profile.stats.runs === 0 && profile.stats.kills === 0

// ─── Who the hero is (roadmap #71) ───────────────────────────────────────────

/** The one-time flag (in `tips`) that the player has picked a hero. */
export const HERO_PICKED_TIP = 'heroPicked'

/**
 * Is the hero still to be chosen? Only a brand-new save, and only until a
 * pick: a returning player (any progress at all) never sees the choice, and
 * one who picked and reloaded before the first kill does not see it again.
 */
export const needsHeroChoice = (): boolean => isFreshProfile() && profile.tips[HERO_PICKED_TIP] !== true

/** Be the boy hero or the girl hero. Saved at once; every view of the hero
 *  (the rig, the portraits, the gendered lines) follows. */
export const setHeroGender = (g: HeroGender): void => {
  const gender = heroGenderOf(g)
  const changed = profile.hero.gender !== gender
  profile.hero.gender = gender
  setHeroForm(gender)
  if (changed) saveProfile()
}

/** The first-boot pick: the hero, and the flag that it was made. */
export const pickHero = (g: HeroGender): void => {
  profile.hero.gender = heroGenderOf(g)
  setHeroForm(profile.hero.gender)
  profile.tips[HERO_PICKED_TIP] = true
  saveProfile()
}

// ─── The hero as the sim wants him ───────────────────────────────────────────

export const heroBuild = (attrs: AttrBlock = profile.hero.attrs): HeroBuild => ({
  level: profile.level,
  attrs,
  equipped: profile.inv.equipped,
  passives: profile.hero.passive.filter(Boolean),
  blessings: blessings(),
  upgrades: profile.inv.upgrades
})

export const computeStats = (attrs: AttrBlock = profile.hero.attrs): UnitStats => heroStats(heroBuild(attrs))

/** Attribute totals with gear and passives (what skill requirements look at). */
export const totalAttrs = (): AttrBlock => sumBuild(heroBuild()).attrs

// ─── Progression ─────────────────────────────────────────────────────────────

export const xp01 = (): number => (profile.level >= MAX_LEVEL ? 1 : profile.hero.xp / Math.max(1, xpToNext(profile.level)))

/**
 * Lifetime XP: the leaderboard's score. Floored at what the level and bar
 * already prove, so the number can only ever grow.
 */
export const lifetimeXp = (): number =>
  Math.max(Math.round(profile.stats.xpEarned || 0), xpToReach(profile.level) + Math.round(profile.hero.xp))

/** Grant XP; returns the levels gained (each is 3 attribute points). */
export const grantXp = (amount: number): number => {
  profile.stats.xpEarned = lifetimeXp() + Math.max(0, Math.round(amount))
  const r = addXp(profile.level, profile.hero.xp, amount)
  profile.level = r.level
  profile.hero.xp = r.xp
  if (r.gained > 0) {
    profile.hero.points += r.gained * POINTS_PER_LEVEL
    profile.stats.bestLevel = Math.max(profile.stats.bestLevel, r.level)
  }
  return r.gained
}

export const spendPoint = (a: Attr, n = 1): boolean => {
  if (profile.hero.points < n || n <= 0) return false
  profile.hero.points -= n
  profile.hero.attrs[a] += n
  saveProfile()
  return true
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export const knows = (id: string): boolean => profile.hero.learned.includes(id)

/** What a trainer charges this hero: Charisma haggles, a friendly faction gives a discount. */
export const skillCost = (id: string): number => {
  const s = SKILL_BY_ID[id]
  if (!s) return 0
  const f = CLASSES[s.cls].faction
  const friend = f !== 'none' && profile.quests.rep[f] >= REP_FRIEND ? FRIEND_DISCOUNT : 0
  return Math.max(1, Math.round(skillPriceOf(s) * (1 - shopDiscount(totalAttrs().cha)) * (1 - friend)))
}

export type LearnBlock = '' | 'known' | 'level' | 'attrs' | 'gold'

/** Why this skill cannot be learned right now ('' = it can). */
export const learnBlock = (id: string): LearnBlock => {
  const s = SKILL_BY_ID[id]
  if (!s || knows(id)) return 'known'
  if (profile.level < s.level) return 'level'
  if (!meetsSkill(s, profile.level, totalAttrs())) return 'attrs'
  if (profile.gold < skillCost(id)) return 'gold'
  return ''
}

export const learnSkill = (id: string): boolean => {
  if (learnBlock(id) !== '') return false
  const s = SKILL_BY_ID[id]!
  profile.gold -= skillCost(id)
  profile.hero.learned.push(id)
  // Straight into the first free slot of its kind, so a new skill is usable
  // without a trip to the loadout screen.
  const slots = s.kind === 'active' ? profile.hero.active : profile.hero.passive
  const free = slots.indexOf('')
  if (free >= 0) slots[free] = id
  saveProfile()
  return true
}

/** Put a learned skill in a slot (swapping with whatever was there), or clear it with ''. */
export const setSlot = (kind: 'active' | 'passive', slot: number, id: string): boolean => {
  const slots = kind === 'active' ? profile.hero.active : profile.hero.passive
  if (slot < 0 || slot >= slots.length) return false
  if (id) {
    const s = SKILL_BY_ID[id]
    if (!s || s.kind !== kind || !knows(id)) return false
    // Requirements are checked again here: gear that carried a threshold may
    // have been taken off since the skill was learned.
    if (!meetsSkill(s, profile.level, totalAttrs())) return false
    const from = slots.indexOf(id)
    if (from >= 0) slots[from] = slots[slot] ?? ''
  }
  slots[slot] = id
  saveProfile()
  return true
}

/** The active loadout for a zone visit: skills whose requirements still hold. */
export const loadoutActive = (): string[] => {
  const attrs = totalAttrs()
  return profile.hero.active.map(id => (id && SKILL_BY_ID[id] && meetsSkill(SKILL_BY_ID[id]!, profile.level, attrs) ? id : ''))
}

// ─── Items ───────────────────────────────────────────────────────────────────

export const owns = (id: string): boolean => profile.inv.items.includes(id)

export const equippedIn = (id: string): EquipSlot | null => {
  for (const s of EQUIP_SLOTS) if (profile.inv.equipped[s] === id) return s
  return null
}

/** Add an item to the bag. A second copy of one already owned becomes gold. */
export const gainItem = (id: string): { added: boolean; gold: number } => {
  const it = ITEM_BY_ID[id]
  if (!it) return { added: false, gold: 0 }
  if (owns(id)) {
    const gold = sellValue(it)
    profile.gold += gold
    return { added: false, gold }
  }
  profile.inv.items.push(id)
  profile.inv.fresh.push(id)
  return { added: true, gold: 0 }
}

/** No level gate (#98): what the hero owns, he can wear; its stats and where
 *  it is found decide whether he wants it. */
export const canEquip = (id: string): boolean => !!ITEM_BY_ID[id] && owns(id)

/** Does this item go in that slot? (A helmet is not worn on the feet.) */
export const fitsSlot = (id: string, slot: EquipSlot): boolean => ITEM_BY_ID[id]?.slot === slotOf(slot)

/** Equip an item: it goes in its own slot (head, hands, feet…), replacing
 *  what was there; a trinket goes to the free trinket slot, else the first.
 *  `into` names the slot it was dropped on: one it does not fit refuses it. */
export const equipItem = (id: string, into?: EquipSlot): EquipSlot | null => {
  const it = ITEM_BY_ID[id]
  if (!it || !canEquip(id)) return null
  if (into && !fitsSlot(id, into)) return null
  let slot: EquipSlot
  if (it.slot === 'trinket') {
    const cur = equippedIn(id)
    if (cur && !into) return cur
    slot = into === 'trinket1' || into === 'trinket2' ? into : !profile.inv.equipped.trinket1 ? 'trinket1' : !profile.inv.equipped.trinket2 ? 'trinket2' : 'trinket1'
    // One ring cannot be worn on both hands.
    const other: EquipSlot = slot === 'trinket1' ? 'trinket2' : 'trinket1'
    if (profile.inv.equipped[other] === id) profile.inv.equipped[other] = profile.inv.equipped[slot]
  } else slot = it.slot
  profile.inv.equipped[slot] = id
  markSeen(id)
  saveProfile()
  return slot
}

export const unequip = (slot: EquipSlot): void => {
  if (!EQUIP_SLOTS.includes(slot)) return
  profile.inv.equipped[slot] = null
  saveProfile()
}

export const markSeen = (id: string): void => {
  const i = profile.inv.fresh.indexOf(id)
  if (i >= 0) profile.inv.fresh.splice(i, 1)
}

/** What a shop charges this hero for an item. */
export const buyCost = (id: string): number => {
  const it = ITEM_BY_ID[id]
  return it ? Math.max(1, Math.round(itemPriceOf(it) * (1 - shopDiscount(totalAttrs().cha)))) : 0
}

// ─── The colosseum's ladder (roadmap #10) ────────────────────────────────────

/** This week's best wave (0 when the week has none yet). */
export const arenaWeekBest = (): number => (profile.meta.arena.week === weekKey() ? profile.meta.arena.best : 0)

/** Fold a climb into the bests. Returns the all-time best before it, whether
 *  it beat it, and this week's best after it (and whether that moved). */
export const recordArenaWaves = (waves: number): { best: number; isNew: boolean; week: number; weekBest: number; isNewWeek: boolean } => {
  const before = profile.world.arenaBest
  profile.world.arenaBest = Math.max(before, waves)
  const wk = weekKey()
  const weekBefore = arenaWeekBest()
  profile.meta.arena = { week: wk, best: Math.max(weekBefore, waves) }
  return { best: before, isNew: waves > before, week: profile.meta.arena.best, weekBest: profile.meta.arena.best, isNewWeek: waves > weekBefore }
}

// ─── Faction contracts and standing (roadmap #15) ────────────────────────────

/** The zones the hero can reach now, the easiest first. */
const reachableZones = (): ZoneId[] =>
  MAP.filter(n => n.kind === 'zone' && isNodeOpen(n.id)).map(n => n.id as ZoneId).sort((a, b) => ZONES[a].min - ZONES[b].min)

/** Today's contracts (posted on the first look of the day). */
export const contractsToday = (): Contract[] => {
  const day = dayKey()
  if (profile.meta.contracts.day !== day || profile.meta.contracts.list.length === 0) {
    profile.meta.contracts = { day, list: postContracts(day, reachableZones()) }
    saveProfile()
  }
  return profile.meta.contracts.list
}

// ─── The town boards' tasks (roadmap #85, D105) ─────────────────────────────

/** A town's tasks today (posted the first time they are looked at). */
export const tasksOf = (town: TownId): TownTask[] => {
  const day = dayKey()
  if (profile.meta.tasks.day !== day) profile.meta.tasks = { day, towns: {} }
  if (!profile.meta.tasks.towns[town]) {
    profile.meta.tasks.towns[town] = postTasks(town, day, reachableZones(), isNodeOpen('oakhaven'))
    saveProfile()
  }
  // The reactive list (a screen showing it follows its counts).
  return profile.meta.tasks.towns[town]!
}

/** How far a task is: counted, or (gathering) what the pouch holds. */
export const taskHave = (t: TownTask): number => (t.kind === 'gather' ? Math.min(t.n, herbCount(t.plant)) : Math.min(t.n, t.have))
export const taskReady = (t: TownTask): boolean => !t.done && taskHave(t) >= t.n
/** Tasks ready to hand in at a town's board. */
export const tasksReady = (town: TownId): number => tasksOf(town).filter(taskReady).length

/** What a task pays now. */
export const taskPay = (t: TownTask): { gold: number; xp: number } => {
  const k = t.kind === 'escort' ? ESCORT_PAY : 1
  return { gold: taskGold(profile.level) * k, xp: Math.round(xpToNext(Math.min(profile.level, MAX_LEVEL - 1)) * TASK_XP * k) }
}

/** Hand a finished task in at its board: the herbs go, the pay comes. */
export const handInTask = (town: TownId, i: number): { gold: number; xp: number } | null => {
  const t = tasksOf(town)[i]
  if (!t || !taskReady(t)) return null
  if (t.kind === 'gather' && !spendHerbs({ [t.plant]: t.n })) return null
  const pay = taskPay(t)
  t.done = true
  profile.gold += pay.gold
  grantXp(pay.xp)
  saveProfile()
  return pay
}

/** A visit's kills into every board's defeat tasks. */
export const countTasks = (d: TaskDeeds): void => {
  if (profile.meta.tasks.day !== dayKey()) return
  for (const list of Object.values(profile.meta.tasks.towns)) if (list) countTaskDeeds(list, d)
}

/** The caravan arrived (#85): every board's escort task of the day is done. */
export const finishEscortTasks = (): void => {
  for (const list of Object.values(profile.meta.tasks.towns)) for (const t of list ?? []) if (t.kind === 'escort') t.have = t.n
  saveProfile()
}

/** Count a visit into today's contracts (the visit's own save follows). */
export const countContracts = (d: VisitDeeds): Contract[] => countDeeds(contractsToday(), d)

/** Contracts ready to hand in. */
export const contractsReady = (): number => profile.meta.contracts.list.filter(c => !c.done && c.have >= c.n).length

/** Hand a finished contract in: its gold, and a point of the faction's standing. */
export const handInContract = (i: number): boolean => {
  const c = contractsToday()[i]
  if (!c || c.done || c.have < c.n) return false
  c.done = true
  profile.gold += contractGold(profile.level)
  profile.quests.rep[c.faction] = Math.min(REP_MAX, profile.quests.rep[c.faction] + CONTRACT_REP)
  saveProfile()
  return true
}

/** Is the faction's +3 gift waiting? */
export const giftReady = (f: FactionId): boolean => profile.quests.rep[f] >= REP_GIFT && !profile.meta.repGifts.includes(f)

/** Collect the faction's gift: gold, and a piece of its gear at the hero's
 *  merchants' tier. Returns the item id ('' when there was none to give). */
export const claimGift = (f: FactionId): string | null => {
  if (!giftReady(f)) return null
  const tier = Math.max(1, Math.min(5, Math.ceil(profile.level / 6)))
  const it = giftItem(f, tier, new Set(profile.inv.items))
  profile.gold += GIFT_GOLD
  if (it) gainItem(it.id)
  profile.meta.repGifts.push(f)
  saveProfile()
  return it?.id ?? ''
}

/** The factions whose +5 blessing the hero holds now. */
export const blessings = (): FactionId[] => FACTIONS.filter(f => profile.quests.rep[f] >= REP_BLESSING)

// ─── Build presets (roadmap #14) ─────────────────────────────────────────────

export const PRESETS = 2
export const PRESET_NAME_MAX = 16

/** Save the loadout and the gear as they are now into preset `i` (its name is kept). */
export const savePreset = (i: number): boolean => {
  if (i < 0 || i >= PRESETS) return false
  profile.meta.presets[i] = {
    name: profile.meta.presets[i]?.name ?? '',
    active: [...profile.hero.active],
    passive: [...profile.hero.passive],
    equipped: { ...profile.inv.equipped }
  }
  saveProfile()
  return true
}

export const renamePreset = (i: number, name: string): void => {
  const p = profile.meta.presets[i]
  if (!p) return
  p.name = name.replace(/\s+/g, ' ').trim().slice(0, PRESET_NAME_MAX)
  saveProfile()
}

/**
 * Put preset `i` on: the gear first (what the hero no longer owns, or cannot
 * wear yet, is left out and its slot keeps what it had), then the skills (one
 * no longer known, or whose requirement the new gear does not meet, leaves its
 * slot empty). Returns what was left out, as item and skill ids.
 */
export const loadPreset = (i: number): string[] | null => {
  const p = profile.meta.presets[i]
  if (!p) return null
  const skipped: string[] = []
  for (const s of EQUIP_SLOTS) {
    const id = p.equipped[s]
    if (!id) { profile.inv.equipped[s] = null; continue }
    if (owns(id) && canEquip(id)) profile.inv.equipped[s] = id
    else skipped.push(id)
  }
  if (profile.inv.equipped.trinket2 && profile.inv.equipped.trinket2 === profile.inv.equipped.trinket1) profile.inv.equipped.trinket2 = null
  const attrs = totalAttrs()
  const fit = (ids: string[]): string[] => ids.map(id => {
    if (!id) return ''
    const s = SKILL_BY_ID[id]
    if (s && knows(id) && meetsSkill(s, profile.level, attrs)) return id
    skipped.push(id)
    return ''
  })
  profile.hero.active = fit(p.active)
  profile.hero.passive = fit(p.passive)
  saveProfile()
  return skipped
}

// ─── Respec at the healer (roadmap #14) ─────────────────────────────────────

export const RESPEC_BASE = 50
export const RESPEC_PER_LEVEL = 25

/** What forgetting the training costs: the first time is free. */
export const respecCost = (): number => (profile.meta.respecs === 0 ? 0 : RESPEC_BASE + RESPEC_PER_LEVEL * profile.level)

/** Attribute points a respec gives back. */
export const respecRefund = (): number => ATTRS.reduce((n, a) => n + Math.max(0, profile.hero.attrs[a] - ATTR_START), 0)

/** Slotted skills whose requirement a respec would break (they go to the bench). */
export const respecBenched = (): string[] => {
  const attrs = sumBuild(heroBuild(startAttrs())).attrs
  return [...profile.hero.active, ...profile.hero.passive].filter(id => id && SKILL_BY_ID[id] && !meetsSkill(SKILL_BY_ID[id]!, profile.level, attrs))
}

/** Forget the training: every spent point back to spend again, for `respecCost`. */
export const respec = (): boolean => {
  const refund = respecRefund()
  const cost = respecCost()
  if (refund <= 0 || profile.gold < cost) return false
  const bench = new Set(respecBenched())
  profile.gold -= cost
  profile.hero.points += refund
  for (const a of ATTRS) profile.hero.attrs[a] = Math.min(profile.hero.attrs[a], ATTR_START)
  profile.hero.active = profile.hero.active.map(id => (bench.has(id) ? '' : id))
  profile.hero.passive = profile.hero.passive.map(id => (bench.has(id) ? '' : id))
  profile.meta.respecs++
  saveProfile()
  return true
}

// ─── The rare shelf (roadmap #19) ────────────────────────────────────────────

/** A new day empties every shelf; they are stocked again when first looked at. */
const shelfDay = (): ShelfSave => {
  const day = dayKey()
  if (profile.meta.shelf.day !== day) profile.meta.shelf = { day, wares: {}, rolls: {}, used: 0 }
  return profile.meta.shelf
}

/** A merchant's rare shelf today (stocked on first look, then kept). */
export const rareShelf = (npcId: string, stock: Stock): string[] => {
  const s = shelfDay()
  if (!s.wares[npcId]) {
    s.wares[npcId] = stockShelf(npcId, stock, new Set(profile.inv.items), s.day, s.rolls[npcId] ?? 0)
    saveProfile()
  }
  return s.wares[npcId]!
}

/** Rewarded re-stocks left today. */
export const shelfRefreshesLeft = (): number => Math.max(0, SHELF_REFRESHES - shelfDay().used)

/** Re-stock a merchant's rare shelf (after the video). False when none is left today. */
export const restockShelf = (npcId: string, stock: Stock): boolean => {
  const s = shelfDay()
  if (s.used >= SHELF_REFRESHES) return false
  s.used++
  s.rolls[npcId] = (s.rolls[npcId] ?? 0) + 1
  s.wares[npcId] = stockShelf(npcId, stock, new Set(profile.inv.items), s.day, s.rolls[npcId]!)
  saveProfile()
  return true
}

export const buyItem = (id: string): boolean => {
  const cost = buyCost(id)
  if (!ITEM_BY_ID[id] || owns(id) || profile.gold < cost) return false
  profile.gold -= cost
  profile.inv.items.push(id)
  profile.inv.fresh.push(id)
  saveProfile()
  return true
}

export const sellItem = (id: string): boolean => {
  const it = ITEM_BY_ID[id]
  if (!it || !owns(id) || equippedIn(id)) return false
  profile.inv.items.splice(profile.inv.items.indexOf(id), 1)
  markSeen(id)
  delete profile.inv.upgrades[id]
  const gold = sellValue(it)
  profile.gold += gold
  buyBack.push({ id, gold })
  saveProfile()
  return true
}

// ─── The treasure map (roadmap #89, D112) ────────────────────────────────────

/** Pieces picked up on a visit, into the save. The first one starts the errand. */
export const addPieces = (ids: readonly string[]): number => {
  let added = 0
  for (const id of ids) if (isPiece(id) && !profile.world.pieces.includes(id)) { profile.world.pieces.push(id); added++ }
  if (added && !profile.quests.errands[TREASURE_ERRAND]) startErrand(TREASURE_ERRAND)
  return added
}

/** The buried chest was dug up: the errand is done, by itself. */
export const markTreasureDug = (): void => {
  if (!profile.world.flags.includes(DUG_FLAG)) profile.world.flags.push(DUG_FLAG)
  // The pieces step is behind it by now: the save moves on to the dig, done.
  const save = profile.quests.errands[TREASURE_ERRAND]
  const def = errandDef(TREASURE_ERRAND)
  if (save && def) settle(def, save, errandWorld())
  if (errandStateOf(TREASURE_ERRAND) === 'ready') completeErrand(TREASURE_ERRAND)
}

/** What a zone visit lays of the map: its pieces still lying, and the X once the map is whole. */
export const treasureFor = (zone: string): { pieces: string[]; treasure: boolean } => ({
  pieces: piecesIn(zone, profile.world.pieces),
  treasure: zone === TREASURE_ZONE && profile.world.pieces.length >= MAP_PIECES.length && !profile.world.flags.includes(DUG_FLAG)
})

// ─── The gamblers (roadmap #91, #92, D110, D111, D113) ──────────────────────

/** The bag's unworn items (what the item battle is played with). */
export const unwornItems = (): string[] => profile.inv.items.filter(id => !equippedIn(id) && !!ITEM_BY_ID[id])

/** A prize: an Epic or a Legendary not owned yet, into the bag (its sale price in gold when every one is owned). */
const givePrize = (tier: number): { item: string; gold: number } => {
  const it = prizeOf(tier, new Set(profile.inv.items), Date.now() >>> 0)
  if (it) { gainItem(it.id); return { item: it.id, gold: 0 } }
  const gold = tier >= 6 ? 2400 : tier >= 4 ? 600 : 250
  profile.gold += gold
  return { item: '', gold }
}

/** The memory stand: the bet goes on the table. False: not the gold. */
export const placeMemoryBet = (stake: number): boolean => {
  if (stake <= 0 || profile.gold < stake) return false
  profile.gold -= stake
  saveProfile()
  return true
}

/** The sand ran out, or every pair was found: the bet back doubled (and the
 *  row's Legendary on its fifth win), or the row starts over. */
export const settleMemory = (won: boolean, stake: number): { gold: number; prize: { item: string; gold: number } | null; row: number } => {
  let prize: { item: string; gold: number } | null = null
  let gold = 0
  if (won) {
    gold = stake * 2
    profile.gold += gold
    profile.meta.gamble.memory++
    if (profile.meta.gamble.memory >= MEMORY_ROW) { prize = givePrize(6); profile.meta.gamble.memory = 0 }
  } else profile.meta.gamble.memory = 0
  saveProfile()
  return { gold, prize, row: profile.meta.gamble.memory }
}

/** Why the item battle at this gambler's table cannot start ('' when it can). */
export const battleBlock = (gambler: string): '' | 'items' | 'gold' => {
  if (unwornItems().length < BATTLE_MIN_ITEMS) return 'items'
  if (profile.gold < battleFee(gambler)) return 'gold'
  return ''
}

/** Wins in a row at this gambler's table. */
export const battleRow = (gambler: string): number => profile.meta.gamble.rows[gambler] ?? 0

/** Sit down at the item battle: the table's fee. */
export const startBattle = (gambler: string): boolean => {
  if (battleBlock(gambler)) return false
  profile.gold -= battleFee(gambler)
  saveProfile()
  return true
}

/** Lay an item: it is gone, won or lost. */
export const layBattleItem = (id: string): boolean => {
  if (!owns(id) || equippedIn(id)) return false
  profile.inv.items.splice(profile.inv.items.indexOf(id), 1)
  markSeen(id)
  delete profile.inv.upgrades[id]
  saveProfile()
  return true
}

/** A game decided: a won one pays a little experience (and the row's Epic on its third win). */
export const settleBattle = (won: boolean, gambler: string): { xp: number; prize: { item: string; gold: number } | null; row: number } => {
  let prize: { item: string; gold: number } | null = null
  let xp = 0
  const rows = profile.meta.gamble.rows
  if (won) {
    xp = battleXp(profile.level)
    grantXp(xp)
    rows[gambler] = (rows[gambler] ?? 0) + 1
    if (rows[gambler]! >= BATTLE_ROW) { prize = givePrize(gamblerTable(gambler).prize); rows[gambler] = 0 }
  } else rows[gambler] = 0
  saveProfile()
  return { xp, prize, row: rows[gambler] ?? 0 }
}

// ─── Errands (roadmap #85, #86, #89, D101) ───────────────────────────────────

/** The world as the errands' live steps see it. */
export const errandWorld = (): ErrandWorld => ({
  herbs: herbCount,
  // Something handed over must be in the bag, not on the hero.
  owns: (id: string) => owns(id) && !equippedIn(id),
  pieces: () => profile.world.pieces.length,
  flags: flagSet()
})

/** Where an errand stands. */
export const errandStateOf = (id: string): ErrandState => {
  const def = errandDef(id)
  return def ? errandState(def, profile.quests.errands[id], errandWorld()) : 'none'
}

/** Every errand taken and not yet handed in, with where it stands. */
export const openErrands = (): Array<{ def: ErrandDef; save: ErrandSave; state: ErrandState }> => {
  const w = errandWorld()
  const out: Array<{ def: ErrandDef; save: ErrandSave; state: ErrandState }> = []
  for (const [id, save] of Object.entries(profile.quests.errands)) {
    const def = errandDef(id)
    if (!def || save.done) continue
    out.push({ def, save, state: errandState(def, save, w) })
  }
  return out
}

/** Take an errand on (once). */
export const startErrand = (id: string): boolean => {
  const def = errandDef(id)
  if (!def || profile.quests.errands[id]) return false
  const save: ErrandSave = { step: 0, have: 0, done: false }
  settle(def, save, errandWorld())
  profile.quests.errands[id] = save
  saveProfile()
  return true
}

/** Hand an errand in: what it asked for is given over, its reward paid. */
export const completeErrand = (id: string): ErrandReward | null => {
  const def = errandDef(id)
  const save = profile.quests.errands[id]
  if (!def || !save || errandState(def, save, errandWorld()) !== 'ready') return null
  const cost = handInCost(def)
  if (Object.keys(cost.herbs).length && !spendHerbs(cost.herbs)) return null
  if (cost.item) {
    const i = profile.inv.items.indexOf(cost.item)
    if (i < 0) return null
    profile.inv.items.splice(i, 1)
    delete profile.inv.upgrades[cost.item]
  }
  save.done = true
  save.step = def.steps.length
  const r = def.reward
  if (r.gold) profile.gold += r.gold
  if (r.xp) grantXp(Math.round(xpToNext(Math.min(profile.level, MAX_LEVEL - 1)) * r.xp))
  for (const f of r.flags ?? []) if (!profile.world.flags.includes(f)) profile.world.flags.push(f)
  if (r.item) gainItem(r.item)
  saveProfile()
  return r
}

/** A visit's deeds into every open errand (the end of each visit). */
export const countErrands = (d: ErrandDeeds): void => {
  const w = errandWorld()
  for (const [id, save] of Object.entries(profile.quests.errands)) {
    const def = errandDef(id)
    if (def && !save.done) countVisit(def, save, d, w)
  }
}

/** Someone spoken to: errands waiting on a word with them move on. */
export const errandTalk = (npc: string): void => {
  const w = errandWorld()
  let moved = false
  for (const [id, save] of Object.entries(profile.quests.errands)) {
    const def = errandDef(id)
    if (def && !save.done && countTalk(def, save, npc, w)) moved = true
  }
  if (moved) saveProfile()
}

// ─── The herb pouch (roadmap #88) ────────────────────────────────────────────

/** How many of a plant the pouch holds. */
export const herbCount = (id: string): number => profile.inv.herbs[id] ?? 0

/** Herbs into the pouch (a visit's pickings), each kind up to the cap. */
export const addHerbs = (got: Readonly<Record<string, number>>): void => {
  for (const [id, n] of Object.entries(got)) {
    if (!isPlant(id) || n <= 0) continue
    profile.inv.herbs[id] = Math.min(HERB_CAP, herbCount(id) + Math.round(n))
  }
}

/** Take herbs out of the pouch (a brew, a task handed in): all or nothing. */
export const spendHerbs = (want: Readonly<Record<string, number>>): boolean => {
  for (const [id, n] of Object.entries(want)) if (herbCount(id) < n) return false
  for (const [id, n] of Object.entries(want)) {
    const left = herbCount(id) - n
    if (left > 0) profile.inv.herbs[id] = left
    else delete profile.inv.herbs[id]
  }
  return true
}

// ─── The ore pouch (roadmap #99) ──────────────────────────────────────────────

/** How many nuggets of a metal the pouch holds. */
export const oreCount = (id: string): number => profile.inv.ores[id] ?? 0

/** Nuggets into the pouch (a visit's mining); a metal mined is a metal known. */
export const addOres = (got: Readonly<Record<string, number>>): void => {
  for (const [id, n] of Object.entries(got)) {
    if (!isOre(id) || n <= 0) continue
    profile.inv.ores[id] = Math.min(ORE_CAP, oreCount(id) + Math.round(n))
    if (!profile.inv.oresFound.includes(id)) profile.inv.oresFound.push(id)
  }
}

/** Take nuggets out of the pouch (sold, smithed): all or nothing. */
export const spendOres = (want: Readonly<Record<string, number>>): boolean => {
  for (const [id, n] of Object.entries(want)) if (oreCount(id) < n) return false
  for (const [id, n] of Object.entries(want)) {
    const left = oreCount(id) - n
    if (left > 0) profile.inv.ores[id] = left
    else delete profile.inv.ores[id]
  }
  return true
}

/** What the smith pays for the whole pouch (#99, D120): a flat price a nugget. */
export const orePouchValue = (): number => ORE_IDS.reduce((s, o) => s + oreCount(o) * ORE_PRICE[o], 0)

/** Sell every nugget to a smith. Returns the gold paid (0: nothing to sell). */
export const sellAllOre = (): number => {
  const gold = orePouchValue()
  if (!gold) return 0
  profile.inv.ores = {}
  profile.gold += gold
  saveProfile()
  return gold
}

// ─── Smithing (roadmap #99, D121–D123) ────────────────────────────────────────

/** A smith teaches it: once, for good. */
export const learnSmithing = (): void => {
  if (profile.inv.smithing) return
  profile.inv.smithing = true
  saveProfile()
}

/** Why a recipe cannot be forged now ('' = it can). */
export const smithBlock = (id: string): '' | 'learn' | 'metal' | 'ore' | 'gold' | 'max' => {
  const r = RECIPE_BY_ID[id]
  if (!r || !profile.inv.smithing) return 'learn'
  if (!profile.inv.oresFound.includes(r.metal)) return 'metal'
  // Both twins at the forge's top: nothing more to be had from it.
  if (owns(r.master) && upgradeLevel(r.master) >= FORGE_MAX && owns(r.item) && upgradeLevel(r.item) >= FORGE_MAX) return 'max'
  if (oreCount(r.metal) < r.nuggets) return 'ore'
  if (profile.gold < r.gold) return 'gold'
  return ''
}

/**
 * Forge a piece at the grade the strikes earned. The nuggets and the gold are
 * spent; a new piece goes into the bag with its forge levels, one already
 * owned is worked up instead (at least a level). Returns what came off the
 * anvil, or null when it could not be forged.
 */
export const smithForge = (id: string, grade: Grade): { id: string; levels: number; fresh: boolean } | null => {
  const r = RECIPE_BY_ID[id]
  if (!r || smithBlock(id)) return null
  const made = gradeMakes(r, grade)
  spendOres({ [r.metal]: r.nuggets })
  profile.gold -= r.gold
  const fresh = !owns(made.id)
  if (fresh) {
    profile.inv.items.push(made.id)
    profile.inv.fresh.push(made.id)
  }
  const add = fresh ? made.levels : Math.max(1, made.levels)
  const lvl = Math.min(FORGE_MAX, upgradeLevel(made.id) + add)
  if (lvl > 0) profile.inv.upgrades[made.id] = lvl
  saveProfile()
  return { id: made.id, levels: lvl, fresh }
}

// ─── Elixirs (roadmap #87, D104) ──────────────────────────────────────────────

/** The first elixir carried, in the alchemist's order ('' when none). */
const firstElixir = (have: Readonly<Record<string, number>>): string => ELIXIR_IDS.find(id => (have[id] ?? 0) > 0) ?? ''

/** How many of an elixir the hero carries. */
export const elixirCount = (id: string): number => profile.inv.elixirs[id] ?? 0

/** Why the alchemist cannot brew this one now ('' when he can). */
export const brewBlock = (id: ElixirId): '' | 'full' | 'herbs' | 'gold' => {
  if (elixirCount(id) >= ELIXIR_CAP) return 'full'
  if (Object.entries(ELIXIR_BY_ID[id].recipe).some(([p, n]) => herbCount(p) < (n ?? 0))) return 'herbs'
  if (profile.gold < brewFee(profile.level)) return 'gold'
  return ''
}

/** Brew one: the herbs and the fee for a flask. The first one brewed is the one carried. */
export const brewElixir = (id: ElixirId): boolean => {
  if (brewBlock(id)) return false
  spendHerbs(ELIXIR_BY_ID[id].recipe as Record<string, number>)
  profile.gold -= brewFee(profile.level)
  profile.inv.elixirs[id] = elixirCount(id) + 1
  if (!profile.inv.elixirPick) profile.inv.elixirPick = id
  saveProfile()
  return true
}

/** The elixir the third flask pours. */
export const pickElixir = (id: ElixirId): void => {
  if (elixirCount(id) <= 0) return
  profile.inv.elixirPick = id
  saveProfile()
}

/** The elixirs as a visit leaves them (some drunk), and the one it ended on. */
export const setElixirs = (have: Readonly<Record<string, number>>, pick: string): void => {
  const out: Record<string, number> = {}
  for (const id of ELIXIR_IDS) {
    const n = Math.max(0, Math.min(ELIXIR_CAP, Math.round(have[id] ?? 0)))
    if (n > 0) out[id] = n
  }
  profile.inv.elixirs = out
  profile.inv.elixirPick = (out[pick] ?? 0) > 0 ? pick : firstElixir(out)
}

// ─── Upgrades (roadmap #90, D99) ──────────────────────────────────────────────

/** The level a piece is upgraded to (0: as found). */
export const upgradeLevel = (id: string): number => profile.inv.upgrades[id] ?? 0

/** What the next level of a piece costs (0: it is at the top). */
export const upgradeCost = (id: string): number => {
  const it = ITEM_BY_ID[id]
  const lvl = upgradeLevel(id)
  return it && lvl < FORGE_MAX ? forgeCost(it, lvl) : 0
}

/** Can a worn piece go up a level now (gold aside: `upgradeCost` says that)? */
export const canUpgrade = (id: string): boolean => !!ITEM_BY_ID[id] && !!equippedIn(id) && upgradeLevel(id) < FORGE_MAX

/** The smith's work: a worn piece one level up, for its price. A town's
 *  business: the screens offer it only there. */
export const upgradeItem = (id: string): boolean => {
  const cost = upgradeCost(id)
  if (!canUpgrade(id) || !cost || profile.gold < cost) return false
  profile.gold -= cost
  profile.inv.upgrades[id] = upgradeLevel(id) + 1
  saveProfile()
  return true
}

// ─── Buy-back (D38) ──────────────────────────────────────────────────────────

/**
 * What the hero sold during THIS visit to a merchant, oldest first, with the
 * gold each fetched. A sale can be undone at exactly the price paid while the
 * conversation lasts; the trade screen empties the list when it ends
 * (`clearBuyBack`). Never saved: after a reload a sale is final.
 */
export const buyBack: Array<{ id: string; gold: number }> = reactive([])

/** What buying a sold item back costs (0: it is not on the buy-back row). */
export const buyBackCost = (id: string): number => buyBack.find(b => b.id === id)?.gold ?? 0

/** Take a sold item back for what the merchant paid. */
export const buyBackItem = (id: string): boolean => {
  const at = buyBack.findIndex(b => b.id === id)
  const sold = buyBack[at]
  if (!sold || !ITEM_BY_ID[id] || owns(id) || profile.gold < sold.gold) return false
  profile.gold -= sold.gold
  profile.inv.items.push(id)
  buyBack.splice(at, 1)
  saveProfile()
  return true
}

/** The visit is over: what was sold stays sold. */
export const clearBuyBack = (): void => {
  buyBack.length = 0
}

/** A fourth and fifth potion, sold by the healers. */
export const POTION_MAX = 5
export const potionUpgradeCost = (): number => (profile.inv.potions >= POTION_MAX ? 0 : 150 * Math.pow(4, profile.inv.potions - 3))
export const buyPotionSlot = (): boolean => {
  const cost = potionUpgradeCost()
  if (cost <= 0 || profile.gold < cost) return false
  profile.gold -= cost
  profile.inv.potions++
  saveProfile()
  return true
}

// ─── Mana potions and one-time chests ────────────────────────────────────────

/** What a healer charges for one mana potion. */
export const manaPotionCost = (): number => 20 + profile.level * 6

/** Is there room in the stock (as many slots as the health belt has)? */
export const manaPotionRoom = (): number => Math.max(0, profile.inv.potions - profile.inv.manaPotions)

/** Buy one mana potion for the stock. False: no room, or not the gold. */
export const buyManaPotion = (): boolean => {
  const cost = manaPotionCost()
  if (manaPotionRoom() <= 0 || profile.gold < cost) return false
  profile.gold -= cost
  profile.inv.manaPotions++
  saveProfile()
  return true
}

/** The stock as a visit leaves it (some drunk, some found): held to the belt's size. */
export const setManaPotions = (n: number): void => {
  profile.inv.manaPotions = Math.max(0, Math.min(profile.inv.potions, Math.round(n)))
}

/** Remember the one-time chests a visit emptied. */
export const markChestsOpened = (keys: readonly string[]): void => {
  for (const k of keys) if (!profile.world.chests.includes(k)) profile.world.chests.push(k)
}

/** Bank a visit's mastery of its zone; returns the visit's share (percent) and the zone's best before it. */
export const recordMastery = (
  zone: string, m: { bosses: number; bossesTotal: number; chests: number; chestsTotal: number }
): { pct: number; bestBefore: number } => {
  const total = m.bossesTotal + m.chestsTotal
  const pct = total ? Math.round(((m.bosses + m.chests) / total) * 100) : 0
  const cur = profile.world.mastery[zone] ?? { bosses: 0, chests: 0, best: 0, full: 0 }
  const bestBefore = cur.best
  profile.world.mastery[zone] = {
    bosses: cur.bosses + m.bosses, chests: cur.chests + m.chests, best: Math.max(cur.best, pct),
    full: cur.full + (total > 0 && pct === 100 ? 1 : 0)
  }
  return { pct, bestBefore }
}

// ─── The world ───────────────────────────────────────────────────────────────

export const flagSet = (): Set<string> => new Set(profile.world.flags)
export const hasFlag = (f: string): boolean => profile.world.flags.includes(f)

/** A stored map position, if it is one (two numbers on the sheet). */
const validPos = (v: unknown): [number, number] | null =>
  Array.isArray(v) && v.length === 2 && v.every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1) ? [v[0] as number, v[1] as number] : null
/** Where the hero's token stands on the map (fractions of the sheet). Kept in
 *  memory as he walks; written with the next save. */
export const setMapPos = (x: number, y: number): void => {
  profile.world.pos = [Math.round(Math.max(0, Math.min(1, x)) * 10000) / 10000, Math.round(Math.max(0, Math.min(1, y)) * 10000) / 10000]
}

export const isNodeOpen = (id: NodeId): boolean => nodeOpen(id, new Set(profile.world.cleared), flagSet())
/** May the hero go there at all (only the story locks hold, roadmap #72)? */
export const isNodeReachable = (id: NodeId): boolean => nodeReachable(id, flagSet())
export const openNodes = (): NodeId[] => MAP.filter(n => isNodeOpen(n.id)).map(n => n.id)

/** Mark a node cleared (a zone won, a town entered). Returns whether it was the first time. */
export const clearNode = (id: NodeId): boolean => {
  if (profile.world.cleared.includes(id)) return false
  profile.world.cleared.push(id)
  if (NODE_BY_ID[id]?.kind === 'zone') profile.story++
  return true
}

/** The decision of a quest, applied once and for all. */
export const decideQuest = (questId: string, choiceId: string): boolean => {
  const q = QUEST_BY_ID[questId]
  const c = q?.choices.find(x => x.id === choiceId)
  if (!q || !c || profile.quests.done[questId]) return false
  if (!choiceOpen(c, { level: profile.level, attrs: totalAttrs(), flags: flagSet(), rep: profile.quests.rep })) return false
  profile.quests.done[questId] = choiceId
  for (const f of c.flags) if (!profile.world.flags.includes(f)) profile.world.flags.push(f)
  if (c.rep) {
    for (const k in c.rep) {
      const f = k as FactionId
      profile.quests.rep[f] = Math.max(REP_MIN, Math.min(REP_MAX, profile.quests.rep[f] + (c.rep[f] ?? 0)))
    }
  }
  if (c.gold) profile.gold += c.gold
  if (c.item) gainItem(c.item)
  profile.questsDone++
  saveProfile()
  return true
}

export const markTip = (id: string): void => {
  if (profile.tips[id]) return
  profile.tips[id] = true
  saveProfile()
}
