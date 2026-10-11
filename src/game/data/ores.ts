/**
 * ─── Ore (roadmap #99) ───────────────────────────────────────────────────────
 *
 * Four metals, mined from outcrops against the stone of a zone (at most three
 * a visit). A zone holds the ores its level reaches (D117), the richest of
 * them rarest. A town smith buys every nugget at a flat price (D120), and the
 * first nugget of an ore unlocks its smithing recipes (D122).
 */

export type OreId = 'iron' | 'silver' | 'gold' | 'mithril'
export const ORE_IDS: readonly OreId[] = ['iron', 'silver', 'gold', 'mithril']
export const isOre = (id: string): id is OreId => (ORE_IDS as readonly string[]).includes(id)

/** The lowest zone level an ore is found at. */
export const ORE_LEVEL: Readonly<Record<OreId, number>> = { iron: 1, silver: 6, gold: 13, mithril: 21 }
/** What a town smith pays for a nugget. */
export const ORE_PRICE: Readonly<Record<OreId, number>> = { iron: 6, silver: 15, gold: 35, mithril: 80 }
/** How the vein shows: the metal's own colour, and its glint. */
export const ORE_LOOK: Readonly<Record<OreId, { vein: string; glint: string }>> = {
  iron: { vein: '#8a7a70', glint: '#d8c8b8' },
  silver: { vein: '#c8d4e0', glint: '#ffffff' },
  gold: { vein: '#e8b830', glint: '#fff0a0' },
  mithril: { vein: '#6ad8e8', glint: '#d8fcff' }
}
/** The most of one ore the pouch holds. */
export const ORE_CAP = 99
/** Outcrops a visit holds at most. */
export const ORE_NODES_MAX = 3

/**
 * The ores a zone of this level holds, each with its weight: the richest it
 * reaches is the rarest, the one below it the commonest.
 */
export const oresAt = (level: number): Array<{ id: OreId; weight: number }> => {
  const open = ORE_IDS.filter(o => ORE_LEVEL[o] <= level)
  return open.map((id, i) => ({ id, weight: i === open.length - 2 ? 2 : 1 }))
}
