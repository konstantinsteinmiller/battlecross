import { reactive, toRaw, watch } from 'vue'
import { getState, setStates } from '@/use/useGameState'
import { saveDataVersion } from '@/use/useSaveStatus'
import {
  LEVEL_KEY, GOLD_KEY, STORY_KEY, QUESTS_DONE_KEY, HERO_KEY, INVENTORY_KEY, QUESTS_KEY, WORLD_KEY, STATS_KEY,
  TUTORIAL_KEY, VERSION_KEY
} from '@/keys'
import { ATTRS, POINTS_PER_LEVEL, startAttrs, type Attr, type AttrBlock } from '../data/attributes'
import { MAX_LEVEL, addXp, xpToNext, xpToReach } from '../data/progression'
import { ACTIVE_SLOTS, PASSIVE_SLOTS, SKILL_BY_ID, meetsSkill, priceOf as skillPriceOf, CLASSES } from '../data/skills'
import { EQUIP_SLOTS, ITEM_BY_ID, noGear, priceOf as itemPriceOf, sellValue, slotOf, type EquipSlot } from '../data/items'
import { FACTIONS, FRIEND_DISCOUNT, QUEST_BY_ID, REP_FRIEND, REP_MAX, REP_MIN, choiceOpen, type FactionId } from '../data/quests'
import { MAP, NODE_BY_ID, nodeOpen, type NodeId } from '../data/zones'
import { heroStats, shopDiscount, sumBuild, type HeroBuild } from '../sim/stats'
import type { UnitStats } from '../sim/types'

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
}

export interface QuestSave {
  /** Quest id → the choice made. Permanent. */
  done: Record<string, string>
  rep: Record<FactionId, number>
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
  /** Dialogue memory (`game/talk.ts`): who the hero has met (`<npc>`) and
   *  what was said (`<npc>.<topic>`), so nobody introduces themselves twice. */
  said: string[]
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
  return { xp: 0, attrs: startAttrs(), points: 0, learned: ['shieldSlam'], active, passive: emptySlots(PASSIVE_SLOTS) }
}

const defaultInv = (): InventorySave => ({
  items: ['rustedShortsword', 'woodenBuckler', 'paddedTunic'],
  // No cap, gloves or boots: the first ones found are the first ones worn.
  equipped: { ...noGear(), main: 'rustedShortsword', off: 'woodenBuckler', body: 'paddedTunic' },
  fresh: [],
  potions: 3,
  manaPotions: 0
})

const defaults = (): Profile => ({
  level: 1,
  gold: 0,
  story: 0,
  questsDone: 0,
  hero: defaultHero(),
  inv: defaultInv(),
  quests: { done: {}, rep: { order: 0, syndicate: 0, circle: 0 } },
  world: { cleared: [], flags: [], at: 'plains', pos: mapSpot('plains'), visits: {}, arenaBest: 0, chests: [], said: [] },
  stats: { kills: 0, deaths: 0, runs: 0, playSeconds: 0, bestLevel: 1, xpEarned: 0 },
  tips: {}
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
  profile.hero = hero

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
  profile.inv = inv

  const quests = obj(stored(QUESTS_KEY), d.quests)
  quests.done = obj(quests.done, {})
  const rep = obj(quests.rep, d.quests.rep)
  for (const f of FACTIONS) rep[f] = Math.max(REP_MIN, Math.min(REP_MAX, Math.round(num(rep[f], 0))))
  quests.rep = rep
  profile.quests = quests

  const storedWorld = stored(WORLD_KEY)
  const world = obj(storedWorld, d.world)
  world.cleared = [...new Set(strs(world.cleared).filter(id => NODE_BY_ID[id]))]
  world.flags = [...new Set(strs(world.flags))]
  world.visits = obj(world.visits, {})
  world.arenaBest = Math.max(0, Math.round(num(world.arenaBest, 0)))
  // A save from before one-time chests has opened none.
  world.chests = [...new Set(strs(world.chests))]
  // A save from before the conversations has no memory: everyone is met anew.
  world.said = [...new Set(strs(world.said))]
  if (!NODE_BY_ID[world.at]) world.at = 'plains'
  // A save from before the hero walked the map freely: he stands at his place.
  // (Read off what was stored: the defaults would stand him at the plains.)
  world.pos = validPos((storedWorld as { pos?: unknown } | null)?.pos) ?? mapSpot(world.at)
  profile.world = world

  profile.stats = obj(stored(STATS_KEY), d.stats)
  profile.tips = obj(stored(TUTORIAL_KEY), {})
}

/**
 * DEV ONLY: a sandboxed run writes nothing (the model bench, a probe that jumps
 * to a late zone with a made-up build). Folds out of every build.
 */
let saveSandbox = false
export const setSaveSandbox = (on: boolean): void => {
  saveSandbox = on
}

/** Persist the whole profile (a checkpoint). Cheap: one debounced blob write.
 *  The blob gets copies, so play after a checkpoint waits for the next one. */
export const saveProfile = (): void => {
  if (import.meta.env.DEV && saveSandbox) return
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
    [TUTORIAL_KEY]: plain(profile.tips)
  })
}

let loaded = false
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

// ─── The hero as the sim wants him ───────────────────────────────────────────

export const heroBuild = (attrs: AttrBlock = profile.hero.attrs): HeroBuild => ({
  level: profile.level,
  attrs,
  equipped: profile.inv.equipped,
  passives: profile.hero.passive.filter(Boolean)
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

export const canEquip = (id: string): boolean => {
  const it = ITEM_BY_ID[id]
  return !!it && owns(id) && profile.level >= it.level
}

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
  const gold = sellValue(it)
  profile.gold += gold
  buyBack.push({ id, gold })
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
