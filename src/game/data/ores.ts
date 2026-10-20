/**
 * ─── Ore (roadmap #99, #150) ─────────────────────────────────────────────────
 *
 * Six metals (adamant and aetherite are the endgame's, #150), mined from outcrops against the stone of a zone (at most three
 * a visit). A zone holds the ores its level reaches (D117), the richest of
 * them rarest. A town smith buys every nugget at a flat price (D120), and the
 * first nugget of an ore unlocks its smithing recipes (D122).
 *
 * The last three zones (level 24 and up) hold no iron and no silver: only the
 * top three metals the level reaches, mithril the commonest of them (#150).
 */

export type OreId = 'iron' | 'silver' | 'gold' | 'mithril' | 'adamant' | 'aetherite'
export const ORE_IDS: readonly OreId[] = ['iron', 'silver', 'gold', 'mithril', 'adamant', 'aetherite']
export const isOre = (id: string): id is OreId => (ORE_IDS as readonly string[]).includes(id)

/** The lowest zone level an ore is found at. */
export const ORE_LEVEL: Readonly<Record<OreId, number>> = { iron: 1, silver: 6, gold: 13, mithril: 21, adamant: 24, aetherite: 26 }
/** What a town smith pays for a nugget. */
export const ORE_PRICE: Readonly<Record<OreId, number>> = { iron: 6, silver: 15, gold: 35, mithril: 80, adamant: 170, aetherite: 340 }
/** How the vein shows: the metal's own colour, and its glint. */
export const ORE_LOOK: Readonly<Record<OreId, { vein: string; glint: string }>> = {
  iron: { vein: '#8a7a70', glint: '#d8c8b8' },
  silver: { vein: '#c8d4e0', glint: '#ffffff' },
  gold: { vein: '#e8b830', glint: '#fff0a0' },
  mithril: { vein: '#6ad8e8', glint: '#d8fcff' },
  adamant: { vein: '#b8406e', glint: '#ffc8dc' },
  aetherite: { vein: '#9468f0', glint: '#eadcff' }
}
/** The most of one ore the pouch holds. */
export const ORE_CAP = 99

/**
 * The afterplay's two materials (§2.4, phase 8): Demonglass (from demons) and
 * Mythic Ichor (from the bosses). Kept in the ore pouch, never mined, never
 * smithed into a piece of their own: they pay for Heroic+ ranks and Infernal
 * smithing, and a smith buys them like ore.
 */
export type MatId = 'demonglass' | 'ichor'
export const MAT_IDS: readonly MatId[] = ['demonglass', 'ichor']
export const isMat = (id: string): id is MatId => (MAT_IDS as readonly string[]).includes(id)
export const MAT_PRICE: Readonly<Record<MatId, number>> = { demonglass: 60, ichor: 900 }
/** A material's pouch holds far more than an ore's: a siege pays in hundreds. */
export const MAT_CAP = 9999
export const MAT_LOOK: Readonly<Record<MatId, { vein: string; glint: string }>> = {
  demonglass: { vein: '#8a1a2a', glint: '#ff6a4a' },
  ichor: { vein: '#c8a020', glint: '#fff4b0' }
}
/** Everything a smith buys from the pouch, and its price. */
export const POUCH_IDS: readonly (OreId | MatId)[] = [...ORE_IDS, ...MAT_IDS]
export const pouchPrice = (id: OreId | MatId): number => (isMat(id) ? MAT_PRICE[id] : ORE_PRICE[id])
/** Outcrops a visit holds at most. */
export const ORE_NODES_MAX = 3

/** From this zone level on a visit holds only the high metals (the last three zones). */
export const LATE_ORE_LEVEL = 24
/** A late zone's nodes: at least this many, up to `ORE_NODES_MAX`. */
export const LATE_ORE_NODES_MIN = 2

/**
 * The ores a zone of this level holds, each with its weight: the richest it
 * reaches is the rarest, the one below it the commonest. In a late zone (#150)
 * only the top three open metals are there (peak: gold, mithril, adamant;
 * fortress and rift: mithril, adamant, aetherite), mithril the commonest at
 * 4 in 9, so it is a steady find and the new metals are the prize.
 */
const LATE_WEIGHT: Readonly<Record<OreId, number>> = { iron: 0, silver: 0, gold: 2, mithril: 4, adamant: 3, aetherite: 2 }
export const oresAt = (level: number): Array<{ id: OreId; weight: number }> => {
  const open = ORE_IDS.filter(o => ORE_LEVEL[o] <= level)
  if (level >= LATE_ORE_LEVEL) return open.slice(-3).map(id => ({ id, weight: LATE_WEIGHT[id] }))
  return open.map((id, i) => ({ id, weight: i === open.length - 2 ? 2 : 1 }))
}
