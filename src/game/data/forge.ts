import type { Mods, ModId } from './mods'
import { priceOf, type ItemDef } from './items'

/**
 * ─── Upgrading what the hero wears (roadmap #90, D99) ────────────────────────
 *
 * Any town's smith works on a piece the hero wears, for gold: up to +5. Each
 * level grows the piece's ATTRIBUTES and ARMOUR by 3 % of what it has (a
 * legendary, which nothing outranks, by 5 %); what makes an item special (a
 * burn on hit, a pierce, a fatal save) is never touched.
 *
 * So a better piece grows by more (3 % of a big number), and the growth stays
 * marginal on purpose: a fully upgraded piece never beats a next-quality piece
 * of its slot made for the same build (tested; the top steps are as small as
 * +16 %), so rare, epic and legendary gear stay the way up. Each level costs
 * more than the last (×1.6): gold spent here is a long tail, not a shortcut.
 *
 * Numbers are kept as they come (3 % of a 4 is 0.12): a level always counts,
 * and the item card shows one decimal where one is due.
 */

export const FORGE_MAX = 5

/** Share of an item's attributes and armour one level adds, by quality (tier). */
export const FORGE_GAIN: Readonly<Record<ItemDef['tier'], number>> = { 1: 0.03, 2: 0.03, 3: 0.03, 4: 0.03, 5: 0.03, 6: 0.05 }

/** The first level's price as a share of the item's own; each next one ×FORGE_STEP. */
export const FORGE_FIRST = 0.12
export const FORGE_STEP = 1.6
/** A legendary has no shop price: the smith reckons it at this. */
export const LEGEND_WORTH = 12000

/** What an upgrade grows: the attributes and armour, nothing else. */
const GROWS: ReadonlySet<ModId> = new Set<ModId>(['str', 'dex', 'int', 'end', 'skl', 'cha', 'allAttrs', 'strOrDex', 'armor', 'maxHp', 'maxMana'])

const keep2 = (v: number): number => Math.round(v * 100) / 100

/** How much bigger a level makes the growing numbers (1 at +0). */
export const forgeScale = (it: ItemDef, level: number): number =>
  1 + FORGE_GAIN[it.tier] * Math.max(0, Math.min(FORGE_MAX, level))

/** The item's modifiers at an upgrade level. */
export const forgedMods = (it: ItemDef, level: number): Mods => {
  if (level <= 0) return it.mods
  const k = forgeScale(it, level)
  const out: Mods = {}
  for (const id of Object.keys(it.mods) as ModId[]) {
    const v = it.mods[id] ?? 0
    out[id] = GROWS.has(id) && v > 0 ? keep2(v * k) : v
  }
  return out
}

/** A body piece's armour value at an upgrade level. */
export const forgedArmor = (it: ItemDef, level: number): number =>
  it.armor ? keep2(it.armor * forgeScale(it, level)) : 0

/** The gold the next level costs (`level`: the one it is at now). */
export const forgeCost = (it: ItemDef, level: number): number =>
  Math.round((it.tier === 6 ? LEGEND_WORTH : priceOf(it)) * FORGE_FIRST * Math.pow(FORGE_STEP, level))

/** Every level from +0 to +5, all paid. */
export const forgeTotal = (it: ItemDef): number => {
  let t = 0
  for (let l = 0; l < FORGE_MAX; l++) t += forgeCost(it, l)
  return t
}
