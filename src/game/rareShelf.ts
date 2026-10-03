import { ITEMS, type ItemSlot } from './data/items'
import { hashSeed, mulberry32, shuffle } from './sim/rng'

/**
 * ─── A merchant's rare shelf (roadmap #19, D60) ──────────────────────────────
 *
 * Three pieces a tier above what the merchant normally sells — from their own
 * trade where the tier has any, else from any slot — never a legendary, never
 * something the hero owns, never what the merchant's normal stock already
 * holds. Stocked once per merchant per day (local date) and kept in the save,
 * so buying one empties its place instead of conjuring a new piece; a rewarded
 * video re-stocks it at once, a few times a day.
 */

export const SHELF_SIZE = 3
/** Rewarded re-stocks a day, over all merchants. */
export const SHELF_REFRESHES = 3

/** Today's date as the save keeps it (the player's own calendar day). */
export const dayKey = (d = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export interface Stock { slots: readonly ItemSlot[]; tiers: readonly number[] }

/** The tier a shelf holds: one above the merchant's best, capped below legendary. */
export const shelfTier = (s: Stock): number => Math.min(5, Math.max(...s.tiers) + 1)

/** Stock a shelf: `roll` is how many times it was re-stocked today. */
export const stockShelf = (npcId: string, s: Stock, owned: ReadonlySet<string>, day: string, roll: number): string[] => {
  const tier = shelfTier(s)
  const rng = mulberry32(hashSeed(`shelf:${npcId}:${day}:${roll}`))
  const ok = ITEMS.filter(i => i.tier === tier && !owned.has(i.id) && !(s.slots.includes(i.slot) && s.tiers.includes(i.tier)))
  const own = shuffle(rng, ok.filter(i => s.slots.includes(i.slot)))
  const rest = shuffle(rng, ok.filter(i => !s.slots.includes(i.slot)))
  return [...own, ...rest].slice(0, SHELF_SIZE).map(i => i.id)
}
