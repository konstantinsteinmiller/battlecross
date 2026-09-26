import { mulberry32, weighted, pick, type Rng } from '../world/rng'
import { PAL, RARITY_COLOR } from '../models/palette'

/**
 * ─── Gear ────────────────────────────────────────────────────────────────────
 *
 * Six slots: the buster (damage), three armour pieces (armour + a main stat)
 * and two chips (pure affixes). Rarity decides how many affixes an item rolls;
 * item level (the level of the enemy / mission that dropped it) scales every
 * number. Items recolour Flux (`HeroColors` in models/hero.ts): a helmet
 * paints the outer armour (head plates, gloves, boots) in its hue, a chest
 * piece the torso armour in its metal, an arm cannon the cannon shell and
 * the core's plasma glow (reactor, muzzle, vents, fin edges) — the eyes and
 * antenna tip stay a constant amber. The graphite undersuit never changes,
 * and the starter kit IS the default look: pearl armour, amber plasma.
 */

export type Slot = 'buster' | 'helmet' | 'chest' | 'boots' | 'chip'
export type EquipSlot = 'buster' | 'helmet' | 'chest' | 'boots' | 'chip1' | 'chip2'
export const EQUIP_SLOTS: EquipSlot[] = ['buster', 'helmet', 'chest', 'boots', 'chip1', 'chip2']

export type Rarity = 'standard' | 'tuned' | 'prototype' | 'legendary'
export const RARITIES: Rarity[] = ['standard', 'tuned', 'prototype', 'legendary']

export type AffixId =
  | 'crit' | 'critDmg' | 'hp' | 'armor' | 'we' | 'power' | 'bolts' | 'chargeSpeed' | 'pelletDmg'
  | 'chargeDmg' | 'moveSpeed' | 'special' | 'regen' | 'magnet'

export interface Affix {
  id: AffixId
  v: number
}

export interface Item {
  id: string
  base: string
  slot: Slot
  rarity: Rarity
  ilvl: number
  /** Workshop upgrade level 0..10. */
  upg: number
  affixes: Affix[]
}

export interface BaseItem {
  id: string
  slot: Slot
  /** Base main stat at ilvl 1 (damage for busters, armour otherwise). */
  main: number
  /** Built-in (implicit) affix for this base. */
  implicit?: Affix
  /** Colours this base gives Flux when equipped (see the header). */
  tint?: { main?: string; accent?: string; buster?: string; core?: string }
  minLevel: number
}

export const BASES: BaseItem[] = [
  // Busters
  // Busters: shell + plasma
  { id: 'arm_standard', slot: 'buster', main: 10, minLevel: 1, tint: { buster: PAL.heroPearl, core: PAL.heroPlasma } },
  { id: 'arm_rapid', slot: 'buster', main: 9, implicit: { id: 'pelletDmg', v: 0.15 }, minLevel: 2, tint: { buster: '#4fae7c', core: '#9dffc4' } },
  { id: 'arm_heavy', slot: 'buster', main: 11, implicit: { id: 'chargeDmg', v: 0.15 }, minLevel: 3, tint: { buster: '#c2453b', core: '#ffb48c' } },
  { id: 'arm_quick', slot: 'buster', main: 9, implicit: { id: 'chargeSpeed', v: 0.1 }, minLevel: 5, tint: { buster: '#8a5bd0', core: '#e6c6ff' } },
  { id: 'arm_nova', slot: 'buster', main: 12, implicit: { id: 'crit', v: 0.05 }, minLevel: 9, tint: { buster: '#e6b23c', core: '#fff3c2' } },
  // Helmets: the outer armour's hue
  { id: 'helm_scout', slot: 'helmet', main: 4, minLevel: 1, tint: { main: PAL.heroPearl } },
  { id: 'helm_guard', slot: 'helmet', main: 6, implicit: { id: 'hp', v: 8 }, minLevel: 3, tint: { main: '#6db38e' } },
  { id: 'helm_ace', slot: 'helmet', main: 5, implicit: { id: 'crit', v: 0.03 }, minLevel: 6, tint: { main: '#d9544a' } },
  { id: 'helm_royal', slot: 'helmet', main: 7, implicit: { id: 'we', v: 3 }, minLevel: 10, tint: { main: '#8b6ad6' } },
  // Chests: the torso armour's metal
  { id: 'body_light', slot: 'chest', main: 6, minLevel: 1, tint: { accent: PAL.heroPearl } },
  { id: 'body_plated', slot: 'chest', main: 9, implicit: { id: 'hp', v: 12 }, minLevel: 3, tint: { accent: '#9fa9b8' } },
  { id: 'body_reactor', slot: 'chest', main: 7, implicit: { id: 'power', v: 12 }, minLevel: 6, tint: { accent: '#cf8a55' } },
  { id: 'body_aegis', slot: 'chest', main: 11, implicit: { id: 'armor', v: 6 }, minLevel: 10, tint: { accent: '#efc55a' } },
  // Boots
  { id: 'boots_basic', slot: 'boots', main: 3, minLevel: 1 },
  { id: 'boots_dash', slot: 'boots', main: 3, implicit: { id: 'moveSpeed', v: 0.05 }, minLevel: 2 },
  { id: 'boots_magnet', slot: 'boots', main: 4, implicit: { id: 'magnet', v: 0.3 }, minLevel: 4 },
  { id: 'boots_titan', slot: 'boots', main: 6, implicit: { id: 'hp', v: 10 }, minLevel: 8 },
  // Chips (main 0 — affixes only)
  { id: 'chip_logic', slot: 'chip', main: 0, minLevel: 1 },
  { id: 'chip_quantum', slot: 'chip', main: 0, minLevel: 6 }
]

export const BASE_BY_ID: Record<string, BaseItem> = Object.fromEntries(BASES.map(b => [b.id, b]))

/** Affix roll ranges at ilvl 1 (scaled up with ilvl for flat stats). */
const AFFIX_POOL: Record<Slot, Array<[AffixId, number]>> = {
  buster: [['pelletDmg', 3], ['chargeDmg', 3], ['chargeSpeed', 2], ['crit', 2], ['critDmg', 1.5], ['special', 1.5]],
  helmet: [['hp', 3], ['we', 2], ['crit', 1], ['regen', 1], ['armor', 2]],
  chest: [['hp', 3], ['armor', 3], ['power', 2], ['regen', 1]],
  boots: [['moveSpeed', 2], ['power', 2], ['hp', 2], ['magnet', 1.5], ['bolts', 1]],
  chip: [['crit', 2], ['critDmg', 2], ['bolts', 2], ['special', 2], ['we', 2], ['chargeSpeed', 1.5], ['regen', 1], ['magnet', 1]]
}

const AFFIX_RANGE: Record<AffixId, [number, number, boolean]> = {
  // [min, max, scalesWithLevel]
  crit: [0.02, 0.05, false],
  critDmg: [0.1, 0.25, false],
  hp: [5, 12, true],
  armor: [2, 5, true],
  we: [2, 4, false],
  power: [6, 14, false],
  bolts: [0.06, 0.15, false],
  chargeSpeed: [0.04, 0.09, false],
  pelletDmg: [0.06, 0.14, false],
  chargeDmg: [0.06, 0.15, false],
  moveSpeed: [0.03, 0.06, false],
  special: [0.06, 0.15, false],
  regen: [0.003, 0.008, false],
  magnet: [0.15, 0.35, false]
}

export const RARITY_AFFIXES: Record<Rarity, number> = { standard: 0, tuned: 1, prototype: 2, legendary: 3 }
export const RARITY_MUL: Record<Rarity, number> = { standard: 1, tuned: 1.12, prototype: 1.26, legendary: 1.45 }
export { RARITY_COLOR }

const lvlScale = (ilvl: number) => 1 + (ilvl - 1) * 0.16

export const rollRarity = (rng: Rng, bias = 0): Rarity => weighted(rng, [
  ['standard', Math.max(5, 60 - bias * 20)],
  ['tuned', 28 + bias * 6],
  ['prototype', 10 + bias * 8],
  ['legendary', 2 + bias * 4]
])

let uid = 0
export const newItemId = (): string => `i${Date.now().toString(36)}${(uid++).toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`

export const rollItem = (seed: number, ilvl: number, opts: { rarity?: Rarity; slot?: Slot; bias?: number } = {}): Item => {
  const rng = mulberry32(seed)
  const rarity = opts.rarity ?? rollRarity(rng, opts.bias ?? 0)
  const bases = BASES.filter(b => b.minLevel <= ilvl && (!opts.slot || b.slot === opts.slot))
  const base = pick(rng, bases.length ? bases : BASES.filter(b => !opts.slot || b.slot === opts.slot))
  const affixes: Affix[] = []
  const pool = [...AFFIX_POOL[base.slot]]
  const n = RARITY_AFFIXES[rarity] + (base.slot === 'chip' ? 1 : 0)
  for (let k = 0; k < n && pool.length; k++) {
    const id = weighted(rng, pool)
    pool.splice(pool.findIndex(p => p[0] === id), 1)
    const [lo, hi, scales] = AFFIX_RANGE[id]
    let v = lo + rng() * (hi - lo)
    if (scales) v = Math.round(v * lvlScale(ilvl))
    v *= RARITY_MUL[rarity]
    affixes.push({ id, v: scales ? Math.round(v) : Math.round(v * 1000) / 1000 })
  }
  return { id: newItemId(), base: base.id, slot: base.slot, rarity, ilvl, upg: 0, affixes }
}

/** The item's main stat (damage for busters, armour for armour). */
export const mainStat = (it: Item): number => {
  const b = BASE_BY_ID[it.base]
  if (!b) return 0
  return Math.round(b.main * lvlScale(it.ilvl) * RARITY_MUL[it.rarity] * (1 + it.upg * 0.08))
}

/** Rough power rating for sorting / comparisons in the UI. */
export const itemPower = (it: Item): number => {
  const m = mainStat(it)
  const aff = it.affixes.length * 6 + (BASE_BY_ID[it.base]?.implicit ? 4 : 0)
  return Math.round((m * (it.slot === 'buster' ? 3 : 2) + aff) * (1 + it.upg * 0.05))
}

export const upgradeCost = (it: Item): number => Math.round(25 * Math.pow(it.ilvl + it.upg + 1, 1.4))
export const salvageValue = (it: Item): number => Math.round((8 + it.ilvl * 4) * RARITY_MUL[it.rarity] * RARITY_MUL[it.rarity] * (1 + it.upg * 0.3))
export const MAX_UPG = 10

export const starterItems = (): Item[] => [
  { id: 'start_buster', base: 'arm_standard', slot: 'buster', rarity: 'standard', ilvl: 1, upg: 0, affixes: [] },
  { id: 'start_helm', base: 'helm_scout', slot: 'helmet', rarity: 'standard', ilvl: 1, upg: 0, affixes: [] },
  { id: 'start_body', base: 'body_light', slot: 'chest', rarity: 'standard', ilvl: 1, upg: 0, affixes: [] },
  { id: 'start_boots', base: 'boots_basic', slot: 'boots', rarity: 'standard', ilvl: 1, upg: 0, affixes: [] }
]
