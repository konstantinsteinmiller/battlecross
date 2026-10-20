import type { Mods, ModId } from './mods'
import { priceOf, type ItemDef } from './items'
import { heroicScale } from './relics'

/**
 * ─── Upgrading what the hero wears (roadmap #90, D99, #149) ──────────────────
 *
 * Any town's smith works on a piece the hero wears, for gold, and there is no
 * top: the levels go on for as long as the hero can pay. Each level grows the
 * piece's ATTRIBUTES and ARMOUR; what makes an item special (a burn on hit, a
 * pierce, a fatal save) is never touched.
 *
 * STATS. With g = FORGE_GAIN[tier] (4 %, a legendary 5.5 %) and d = level - 10:
 *
 *   step(l) = g                                  for l <= 10
 *   step(l) = g * (1 + 0.5 d/(d+20)) / (1 + d/200)   for l > 10
 *   scale(L) = 1 + sum of step(1..L)
 *
 * So +10 is +40 % of what the piece has (a legendary +55 %), and every level
 * past +10 gives a little more than the one before (+11 is 2.4 % bigger than
 * +10, the step peaks around +55 at about 1.12 g), then the damping term
 * (1 + d/200) lets it fall away again: the total keeps rising, but ever more
 * slowly (about x22 at +1000, a legendary x30), so a very deep upgrade cannot break the game.
 *
 * COST. The first level costs FORGE_FIRST (10 %) of the item's own price (a
 * legendary has none: LEGEND_WORTH); each next one costs FORGE_STEP (x1.35)
 * of the last up to +10, then x1.18 a level, so it climbs without a top
 * (the 10th level costs 1.5 x the price, the 50th about 1300 x). It is finished off with
 * a ceiling on the level the maths will take (MAX_FORGE_LEVEL), far past
 * where any gold goes, so no number overflows or turns NaN.
 *
 * Numbers are kept as they come (4 % of a 4 is 0.16): a level always counts,
 * and the item card shows one decimal where one is due.
 */

/** Smithing (#99) still stops its own forging at this; the smith's upgrade
 *  has no such top. */
export const FORGE_MAX = 5

/** The level the maths is willing to take (a saved level is clamped to it):
 *  unreachable (the cost is ~1e72 gold by then), it keeps every number finite. */
export const MAX_FORGE_LEVEL = 1000

/** The level the first, steady stretch of the curves ends at. */
export const FORGE_KNEE = 10

/** Share of an item's attributes and armour one level adds up to +10, by quality (tier). */
export const FORGE_GAIN: Readonly<Record<ItemDef['tier'], number>> = { 1: 0.04, 2: 0.04, 3: 0.04, 4: 0.04, 5: 0.04, 6: 0.055, 7: 0.055 }

/** The first level's price as a share of the item's own; each next one ×FORGE_STEP. */
export const FORGE_FIRST = 0.1
export const FORGE_STEP = 1.35
/** Past +10 each level costs this much more than the last. */
export const FORGE_STEP_LATE = 1.18
/** A legendary has no shop price: the smith reckons it at this. */
export const LEGEND_WORTH = 12000

/** What an upgrade grows: the attributes and armour, nothing else. */
const GROWS: ReadonlySet<ModId> = new Set<ModId>(['str', 'dex', 'int', 'end', 'skl', 'cha', 'allAttrs', 'strOrDex', 'armor', 'maxHp', 'maxMana'])

const keep2 = (v: number): number => Math.round(v * 100) / 100

/** A level clamped to what the maths takes (a whole number, 0..MAX_FORGE_LEVEL). */
export const clampForgeLevel = (level: number): number =>
  Number.isFinite(level) ? Math.max(0, Math.min(MAX_FORGE_LEVEL, Math.floor(level))) : 0

/** The share of the item's base numbers that level `level` adds (the step
 *  from level - 1 to level; see the header for the curve). */
export const forgeStep = (it: ItemDef, level: number): number => {
  const l = clampForgeLevel(level)
  if (l <= 0) return 0
  const g = FORGE_GAIN[it.tier]
  if (l <= FORGE_KNEE) return g
  const d = l - FORGE_KNEE
  return g * (1 + 0.5 * d / (d + 20)) / (1 + d / 200)
}

/** How much bigger a level makes the growing numbers (1 at +0). */
export const forgeScale = (it: ItemDef, level: number): number => {
  const l = clampForgeLevel(level)
  let k = 1
  for (let i = 1; i <= l; i++) k += forgeStep(it, i)
  return k
}

/** The item's modifiers at an upgrade level (and its afterplay heroic rank, `relics.ts`). */
export const forgedMods = (it: ItemDef, level: number, heroic = 0): Mods => {
  if (level <= 0 && heroic <= 0) return it.mods
  const k = forgeScale(it, level) * heroicScale(heroic)
  const out: Mods = {}
  for (const id of Object.keys(it.mods) as ModId[]) {
    const v = it.mods[id] ?? 0
    out[id] = GROWS.has(id) && v > 0 ? keep2(v * k) : v
  }
  return out
}

/** A body piece's armour value at an upgrade level (and heroic rank). */
export const forgedArmor = (it: ItemDef, level: number, heroic = 0): number =>
  it.armor ? keep2(it.armor * forgeScale(it, level) * heroicScale(heroic)) : 0

/** The gold the next level costs (`level`: the one it is at now). Always
 *  finite and ever rising: x1.35 a level up to +10, x1.18 after. */
export const forgeCost = (it: ItemDef, level: number): number => {
  const l = clampForgeLevel(level)
  const base = (it.tier >= 6 ? LEGEND_WORTH : priceOf(it)) * FORGE_FIRST
  const early = Math.min(l, FORGE_KNEE)
  return Math.round(base * Math.pow(FORGE_STEP, early) * Math.pow(FORGE_STEP_LATE, l - early))
}

/** Every level from +0 to +`levels`, all paid. */
export const forgeTotal = (it: ItemDef, levels = FORGE_KNEE): number => {
  let t = 0
  for (let l = 0; l < levels; l++) t += forgeCost(it, l)
  return t
}
