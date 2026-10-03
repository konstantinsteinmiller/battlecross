import { ATTRS, type Attr, type AttrBlock } from './attributes'
import { EQUIP_SLOTS, ITEM_BY_ID, slotOf, type EquipSlot, type ItemDef } from './items'

/**
 * ─── Is it better? (roadmap #5) ──────────────────────────────────────────────
 *
 * One rule behind every green "better" arrow: the loot toast, the bag's grid,
 * the equipment page's sockets and the result screen.
 *
 * The rule is a WEIGHTED STAT SCORE for this hero's build:
 *
 *   - each attribute point on the item counts by how much the build has put
 *     into that attribute (its strongest attribute 1, an untouched one 0.25;
 *     Endurance never under 0.5 — staying alive is everyone's business);
 *     "+N to all" counts on every attribute, "+N to STR or DEX" on the better;
 *   - armour counts 0.3 a point (a body's Armor Value, or a helmet's `armor`);
 *   - everything else an item does (a passive, a percentage) is worth 3 per
 *     tier: a higher tier's effects are stronger, and the tables do not give
 *     two effects a common unit.
 *
 * An empty slot is always beaten. Equal scores fall to tier, then level. A
 * trinket is measured against the weaker of the two worn. Pure: no profile,
 * no Vue, so the toast in a fight and the sheet in a town agree.
 */

type Equipped = Readonly<Record<EquipSlot, string | null>>

/** How much each attribute is worth to this build (0.25..1). */
export const attrWeights = (attrs?: Readonly<AttrBlock>): Record<Attr, number> => {
  const w = {} as Record<Attr, number>
  if (!attrs) {
    for (const a of ATTRS) w[a] = 1
    return w
  }
  let lo = Infinity
  let hi = -Infinity
  for (const a of ATTRS) { lo = Math.min(lo, attrs[a]); hi = Math.max(hi, attrs[a]) }
  for (const a of ATTRS) w[a] = hi > lo ? 0.25 + 0.75 * (attrs[a] - lo) / (hi - lo) : 1
  w.end = Math.max(w.end, 0.5)
  return w
}

/** An item's worth to a build (see the rule above). */
export const itemScore = (it: ItemDef, w: Readonly<Record<Attr, number>>): number => {
  const m = it.mods
  let s = 0
  let sumW = 0
  for (const a of ATTRS) { s += (m[a] ?? 0) * w[a]; sumW += w[a] }
  s += (m.allAttrs ?? 0) * sumW
  s += (m.strOrDex ?? 0) * Math.max(w.str, w.dex)
  s += ((it.armor ?? 0) + (m.armor ?? 0)) * 0.3
  return s + it.tier * 3
}

/** The worn piece `it` would be measured against: '' when a slot it fits is
 *  empty, null when it is already worn. */
const rival = (it: ItemDef, equipped: Equipped, w: Readonly<Record<Attr, number>>): string | null => {
  let worst: string | null = null
  let worstScore = Infinity
  for (const s of EQUIP_SLOTS) {
    if (slotOf(s) !== it.slot) continue
    const id = equipped[s]
    if (id === it.id) return null
    if (!id || !ITEM_BY_ID[id]) return ''
    const sc = itemScore(ITEM_BY_ID[id]!, w)
    if (sc < worstScore) { worstScore = sc; worst = id }
  }
  return worst ?? ''
}

/**
 * Would wearing `itemId` beat what is worn? `attrs`: the build's attribute
 * block (spent points with the base); without it every attribute weighs 1.
 */
export const isUpgrade = (itemId: string, equipped: Equipped, attrs?: Readonly<AttrBlock>): boolean => {
  const it = ITEM_BY_ID[itemId]
  if (!it) return false
  const w = attrWeights(attrs)
  const r = rival(it, equipped, w)
  if (r === null) return false
  if (r === '') return true
  const other = ITEM_BY_ID[r]!
  const a = itemScore(it, w)
  const b = itemScore(other, w)
  if (Math.abs(a - b) > 1e-6) return a > b
  return it.tier > other.tier || (it.tier === other.tier && it.level > other.level)
}

/**
 * Does the bag hold something wearable that beats what is in `slot`? The
 * socket's arrow: only pieces the hero is high enough to put on count.
 */
export const slotHasUpgrade = (
  slot: EquipSlot, equipped: Equipped, bag: readonly string[], level: number, attrs?: Readonly<AttrBlock>
): boolean => {
  const want = slotOf(slot)
  const w = attrWeights(attrs)
  const cur = equipped[slot]
  const curScore = cur && ITEM_BY_ID[cur] ? itemScore(ITEM_BY_ID[cur]!, w) : -Infinity
  for (const id of bag) {
    const it = ITEM_BY_ID[id]
    if (!it || it.slot !== want || it.level > level) continue
    if (EQUIP_SLOTS.some(s => equipped[s] === id)) continue
    if (itemScore(it, w) > curScore) return true
  }
  return false
}
