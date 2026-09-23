import { reactive, toRaw, watch } from 'vue'
import { getState, setStates } from '@/use/useGameState'
import { saveDataVersion } from '@/use/useSaveStatus'
import {
  LEVEL_KEY, BOLTS_KEY, STORY_KEY, QUESTS_DONE_KEY, HERO_KEY, INVENTORY_KEY, QUESTS_KEY, WORLD_KEY,
  STATS_KEY, TUTORIAL_KEY, MISSION_KEY
} from '@/keys'
import type { Attr } from '../data/progression'
import { addXp, ATTR_GAIN, xpToNext } from '../data/progression'
import type { WeaponId } from '../data/weapons'
import { WEAPONS } from '../data/weapons'
import {
  starterItems, mainStat, BASE_BY_ID, EQUIP_SLOTS, type Item, type EquipSlot
} from '../data/items'
import type { Quest } from '../data/quests'
import type { SectorId } from '../world/themes'
import { SKILL_BY_ID } from '../data/skills'
import { baseStats, type PlayerStats } from '../sim/stats'
import { DEFAULT_HERO_COLORS, type HeroColors } from '../models/hero'

/**
 * ─── The player profile ──────────────────────────────────────────────────────
 *
 * One reactive object the hub UI binds to and the mission reads through
 * `computeStats()`. It is persisted into the single `mega_adventure_state`
 * blob as a handful of `ma_*` fields (see `src/keys.ts`) at CHECKPOINTS —
 * a kill's XP, a pickup banked, a purchase, a mission end — never per frame.
 *
 * Every field has a default and `load()` fills anything missing, so an older
 * save (or a partial cloud row) always hydrates into a complete profile.
 */

export interface HeroSave {
  xp: number
  attrs: Record<Attr, number>
  skills: Record<string, number>
  /** Level-up attribute picks the player has not chosen yet. */
  pendingAttrs: number
  weapons: WeaponId[]
  slots: [WeaponId | '', WeaponId | '']
  weaponXp: Partial<Record<WeaponId, number>>
}

export interface InventorySave {
  items: Item[]
  equipped: Record<EquipSlot, string | null>
  tanks: number
  /** Item ids the player has not looked at yet (the "NEW" badge). */
  fresh: string[]
}

export interface QuestSave {
  jobs: Quest[]
  jobSeed: number
  storyAttempts: Record<string, number>
}

export interface WorldSave {
  unlocked: SectorId[]
  bosses: string[]
  tutorialDone: boolean
  selected: SectorId
}

export interface StatsSave {
  kills: number
  deaths: number
  chests: number
  missions: number
  playSeconds: number
  bestLevel: number
}

export interface Profile {
  level: number
  bolts: number
  story: number
  questsDone: number
  hero: HeroSave
  inv: InventorySave
  quests: QuestSave
  world: WorldSave
  stats: StatsSave
  tips: Record<string, true>
}

const defaultHero = (): HeroSave => ({
  xp: 0, attrs: { hp: 0, we: 0, power: 0 }, skills: {}, pendingAttrs: 0, weapons: [], slots: ['', ''], weaponXp: {}
})

const defaultInv = (): InventorySave => {
  const items = starterItems()
  return {
    items,
    equipped: { buster: 'start_buster', helmet: 'start_helm', chest: 'start_body', boots: 'start_boots', chip1: null, chip2: null },
    tanks: 1,
    fresh: []
  }
}

const defaults = (): Profile => ({
  level: 1,
  bolts: 0,
  story: 0,
  questsDone: 0,
  hero: defaultHero(),
  inv: defaultInv(),
  quests: { jobs: [], jobSeed: Math.floor(Math.random() * 1e9), storyAttempts: {} },
  world: { unlocked: ['scrapyard'], bosses: [], tutorialDone: false, selected: 'scrapyard' },
  stats: { kills: 0, deaths: 0, chests: 0, missions: 0, playSeconds: 0, bestLevel: 1 },
  tips: {}
})

const num = (v: unknown, d: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && Number.isFinite(Number(v)) ? Number(v) : d)
const obj = <T extends object>(v: unknown, d: T): T => (v && typeof v === 'object' && !Array.isArray(v) ? { ...d, ...(v as T) } : d)

export const profile: Profile = reactive(defaults())

/** Read the persisted fields into the reactive profile (fills defaults). */
export const loadProfile = (): void => {
  const d = defaults()
  profile.level = Math.max(1, Math.round(num(getState(LEVEL_KEY), 1)))
  profile.bolts = Math.max(0, Math.round(num(getState(BOLTS_KEY), 0)))
  profile.story = Math.max(0, Math.round(num(getState(STORY_KEY), 0)))
  profile.questsDone = Math.max(0, Math.round(num(getState(QUESTS_DONE_KEY), 0)))
  const hero = obj(getState(HERO_KEY), d.hero)
  hero.attrs = obj(hero.attrs, d.hero.attrs)
  hero.skills = obj(hero.skills, {})
  hero.weaponXp = obj(hero.weaponXp, {})
  if (!Array.isArray(hero.weapons)) hero.weapons = []
  if (!Array.isArray(hero.slots) || hero.slots.length !== 2) hero.slots = ['', '']
  profile.hero = hero
  const inv = obj(getState(INVENTORY_KEY), d.inv)
  if (!Array.isArray(inv.items) || inv.items.length === 0) {
    inv.items = d.inv.items
    inv.equipped = d.inv.equipped
  }
  inv.equipped = obj(inv.equipped, d.inv.equipped)
  if (!Array.isArray(inv.fresh)) inv.fresh = []
  inv.items = inv.items.filter(it => it && BASE_BY_ID[it.base])
  profile.inv = inv
  const quests = obj(getState(QUESTS_KEY), d.quests)
  if (!Array.isArray(quests.jobs)) quests.jobs = []
  quests.storyAttempts = obj(quests.storyAttempts, {})
  profile.quests = quests
  const world = obj(getState(WORLD_KEY), d.world)
  if (!Array.isArray(world.unlocked) || !world.unlocked.length) world.unlocked = ['scrapyard']
  if (!Array.isArray(world.bosses)) world.bosses = []
  profile.world = world
  profile.stats = obj(getState(STATS_KEY), d.stats)
  profile.tips = obj(getState(TUTORIAL_KEY), {})
}

const plain = <T>(v: T): T => JSON.parse(JSON.stringify(toRaw(v))) as T

/** Persist the whole profile (a checkpoint). Cheap: one debounced blob write. */
export const saveProfile = (): void => {
  setStates({
    [LEVEL_KEY]: profile.level,
    [BOLTS_KEY]: profile.bolts,
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

// ─── Progression ─────────────────────────────────────────────────────────────

export const chipsAvailable = (): number => {
  const spent = Object.values(profile.hero.skills).reduce((a, b) => a + b, 0)
  return Math.max(0, profile.level - 1 - spent)
}

export const xp01 = (): number => profile.hero.xp / Math.max(1, xpToNext(profile.level))

/** Grant XP; returns levels gained (each adds a chip and a pending attribute). */
export const grantXp = (amount: number): number => {
  const r = addXp(profile.level, profile.hero.xp, amount)
  profile.level = r.level
  profile.hero.xp = r.xp
  if (r.gained > 0) {
    profile.hero.pendingAttrs += r.gained
    profile.stats.bestLevel = Math.max(profile.stats.bestLevel, r.level)
  }
  return r.gained
}

export const chooseAttr = (a: Attr): boolean => {
  if (profile.hero.pendingAttrs <= 0) return false
  profile.hero.pendingAttrs--
  profile.hero.attrs[a]++
  saveProfile()
  return true
}

export const rankUpSkill = (id: string): boolean => {
  const node = SKILL_BY_ID[id]
  if (!node) return false
  const ranks = profile.hero.skills
  const cur = ranks[id] ?? 0
  if (cur >= node.ranks || chipsAvailable() <= 0) return false
  if (node.req && (ranks[node.req.id] ?? 0) < node.req.rank) return false
  ranks[id] = cur + 1
  saveProfile()
  return true
}

export const respecSkills = (cost: number): boolean => {
  if (profile.bolts < cost) return false
  profile.bolts -= cost
  profile.hero.skills = {}
  saveProfile()
  return true
}

// ─── Gear ────────────────────────────────────────────────────────────────────

export const itemById = (id: string | null): Item | null =>
  id ? profile.inv.items.find(i => i.id === id) ?? null : null

export const equipped = (slot: EquipSlot): Item | null => itemById(profile.inv.equipped[slot])

export const heroColors = (): HeroColors => {
  const c: HeroColors = { ...DEFAULT_HERO_COLORS }
  for (const s of ['helmet', 'chest', 'boots', 'buster'] as const) {
    const it = equipped(s)
    const tint = it ? BASE_BY_ID[it.base]?.tint : undefined
    if (tint) Object.assign(c, Object.fromEntries(Object.entries(tint).filter(([, v]) => v)))
  }
  const w = profile.hero.slots[0]
  if (w) {
    c.buster = WEAPONS[w].shell
    c.core = WEAPONS[w].color
  }
  return c
}

// ─── Derived combat stats ────────────────────────────────────────────────────

export const computeStats = (): PlayerStats => {
  const s = baseStats()
  const sk = (id: string) => profile.hero.skills[id] ?? 0
  const aff: Record<string, number> = {}
  let armor = 0
  let busterMain = 10
  for (const slot of EQUIP_SLOTS) {
    const it = equipped(slot)
    if (!it) continue
    const base = BASE_BY_ID[it.base]
    if (!base) continue
    if (it.slot === 'buster') busterMain = mainStat(it)
    else if (it.slot !== 'chip') armor += mainStat(it)
    const all = [...it.affixes, ...(base.implicit ? [base.implicit] : [])]
    for (const a of all) aff[a.id] = (aff[a.id] ?? 0) + a.v
  }
  armor += aff.armor ?? 0
  const lvl = profile.level
  s.level = lvl
  s.maxHp = Math.round((100 + profile.hero.attrs.hp * ATTR_GAIN.hp + (aff.hp ?? 0)) * (1 + 0.08 * sk('frame')))
  s.maxWe = 28 + profile.hero.attrs.we * ATTR_GAIN.we + sk('cells') * 3 + Math.round(aff.we ?? 0)
  s.maxPower = 100 + profile.hero.attrs.power * ATTR_GAIN.power + Math.round(aff.power ?? 0)
  s.busterDmg = Math.round(busterMain * (1 + 0.03 * (lvl - 1)))
  s.pelletMul = 1 + 0.1 * sk('rapid') + (aff.pelletDmg ?? 0)
  s.chargeDmgMul = 1 + 0.12 * sk('megaCharge') + (aff.chargeDmg ?? 0)
  s.chargeTimeMul = Math.max(0.45, (1 - 0.1 * sk('quickCharge')) * (1 - (aff.chargeSpeed ?? 0)))
  s.perfectMul = 1 + 0.25 * sk('perfectTiming')
  s.critMul = 1.5 + 0.15 * sk('perfectTiming') + (aff.critDmg ?? 0)
  s.critChance = Math.min(0.5, aff.crit ?? 0)
  s.damageTakenMul = 100 / (100 + armor)
  s.blockCostMul = 1 - 0.15 * sk('barrier')
  s.blockDmgMul = 1 - 0.2 * sk('barrier')
  s.parryBonus = 0.05 * sk('parry')
  s.parryStunBonus = 0.3 * sk('parry')
  s.regen = 0.01 * sk('autoRepair') + (aff.regen ?? 0)
  s.reflectPct = 0.15 * sk('spikes')
  s.lastStand = sk('lastStand') > 0
  s.specialMul = 1 + 0.1 * sk('mastery') + (aff.special ?? 0)
  s.weCostMul = 1 - 0.1 * sk('efficient')
  s.slideCdMul = 1 - 0.15 * sk('boosters')
  s.slideCost = 25 - 5 * sk('boosters')
  s.boltMul = 1 + 0.15 * sk('magnet') + (aff.bolts ?? 0)
  s.magnetMul = 1 + 0.4 * sk('magnet') + (aff.magnet ?? 0)
  s.tanksMax = 2 + sk('tankCap')
  s.piercing = sk('piercing') > 0
  s.giga = sk('giga') > 0
  s.moveMul = 1 + (aff.moveSpeed ?? 0)
  return s
}

export const isEquipped = (id: string): EquipSlot | null => {
  for (const s of EQUIP_SLOTS) if (profile.inv.equipped[s] === id) return s
  return null
}

/** Equip an item into its slot (chips: the free chip socket, else socket 1). */
export const equipItem = (id: string, socket?: EquipSlot): EquipSlot | null => {
  const it = itemById(id)
  if (!it) return null
  let slot: EquipSlot
  if (it.slot === 'chip') {
    const cur = isEquipped(id)
    if (cur) return cur
    slot = socket && (socket === 'chip1' || socket === 'chip2') ? socket
      : !profile.inv.equipped.chip1 ? 'chip1' : !profile.inv.equipped.chip2 ? 'chip2' : 'chip1'
  } else {
    slot = it.slot
  }
  profile.inv.equipped[slot] = id
  markSeen(id)
  saveProfile()
  return slot
}

export const unequipChip = (slot: 'chip1' | 'chip2'): void => {
  profile.inv.equipped[slot] = null
  saveProfile()
}

export const markSeen = (id: string): void => {
  const i = profile.inv.fresh.indexOf(id)
  if (i >= 0) profile.inv.fresh.splice(i, 1)
}

/** Break an item down for bolts. Equipped items cannot be salvaged. */
export const salvageItem = (id: string, value: number): boolean => {
  if (isEquipped(id)) return false
  const i = profile.inv.items.findIndex(x => x.id === id)
  if (i < 0) return false
  profile.inv.items.splice(i, 1)
  markSeen(id)
  profile.bolts += value
  saveProfile()
  return true
}

export const upgradeItem = (id: string, cost: number, max: number): boolean => {
  const it = itemById(id)
  if (!it || it.upg >= max || profile.bolts < cost) return false
  profile.bolts -= cost
  it.upg++
  saveProfile()
  return true
}

/** The equipped armor total (for the Hero screen). */
export const armorTotal = (): number => {
  let armor = 0
  for (const slot of EQUIP_SLOTS) {
    const it = equipped(slot)
    if (!it || it.slot === 'buster' || it.slot === 'chip') continue
    armor += mainStat(it)
    for (const a of it.affixes) if (a.id === 'armor') armor += a.v
    const imp = BASE_BY_ID[it.base]?.implicit
    if (imp?.id === 'armor') armor += imp.v
  }
  return Math.round(armor)
}

export const markTip = (id: string): void => {
  if (profile.tips[id]) return
  profile.tips[id] = true
  saveProfile()
}

// ─── Mission snapshot (resume) ───────────────────────────────────────────────

export interface MissionSnapshot {
  quest: Quest
  killed: number[]
  opened: number[]
  doors: number[]
  collected: number[]
  progress: number
  x: number
  z: number
  yaw: number
  hp: number
  we: number
  bolts: number
  xp: number
  kills: number
  t: number
  done: boolean
}

export const readSnapshot = (): MissionSnapshot | null => {
  const s = getState<MissionSnapshot | null>(MISSION_KEY, null)
  return s && typeof s === 'object' && s.quest ? s : null
}

export const writeSnapshot = (s: MissionSnapshot | null): void => {
  setStates({ [MISSION_KEY]: s ? plain(s) : null })
}
