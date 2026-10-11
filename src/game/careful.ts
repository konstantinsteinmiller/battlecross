/**
 * ─── The careful clear (roadmap #113) ────────────────────────────────────────
 *
 * A zone won without getting hurt pays more: an over-levelled or careful
 * player is rewarded for it. The share of health LOST over the visit (damage
 * up to the health there was, so an overkill blow counts no more than what it
 * took; healing does not pay it back) sets a multiplier on what the visit
 * earned, its gold and its experience:
 *
 *   lost ≤ 15 %  → ×2
 *   lost ≥ 50 %  → ×1
 *   in between   → straight between the two
 *
 * Only a won zone or road fight; the colosseum is a ladder and pays by waves.
 * A rewarded video's ×3 is on the earned purse only; this bonus is beside it.
 */

export const CAREFUL_FULL = 0.15
export const CAREFUL_NONE = 0.5
export const CAREFUL_MAX = 2

/** The multiplier for a visit that lost `lost` health of `maxHp`. */
export const carefulMult = (lost: number, maxHp: number): number => {
  if (!(maxHp > 0)) return 1
  const f = Math.max(0, lost) / maxHp
  if (f <= CAREFUL_FULL) return CAREFUL_MAX
  if (f >= CAREFUL_NONE) return 1
  return 1 + (CAREFUL_MAX - 1) * (CAREFUL_NONE - f) / (CAREFUL_NONE - CAREFUL_FULL)
}
