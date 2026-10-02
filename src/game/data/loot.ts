import { ITEMS, type ZoneId } from './items'
import { ZONES, ZONE_IDS } from './zones'

/**
 * ─── What a chest holds (roadmap #54) ────────────────────────────────────────
 *
 * Every zone has ONE fixed loot table per chest tier. A chest is a number of
 * draws from its table's weighted entries: a pile of gold, a health potion, a
 * mana potion or a piece of the zone's own equipment. The first draw of every
 * chest is gold, so no chest is ever "just a potion".
 *
 * The two potions are kept differently. The HEALTH belt refills to its size
 * at the start of every visit, so a found health potion tops it up for this
 * visit (and is drunk on the spot if the belt is full). MANA potions are a
 * carried stock: found here (or bought), kept between visits, used when the
 * player chooses, and never more than the belt has slots; one found with the
 * stock full turns into a little gold.
 *
 * Gold is sized from the zone's level band, so a chest in the Ashen Crags pays
 * like the Ashen Crags. Equipment comes from the zone's own drop list (the
 * GDD's master table names where each piece is found), never from a boss or a
 * secret: those stay promises. (The Void Rift's own list is all boss drops,
 * so its chests hold the Dread Fortress's.) An item the hero already owns becomes gold on
 * the way to the bag, exactly as a second copy from a kill does.
 *
 * Nothing here is random: the table is data, and the visit's seed makes the
 * draws (`sim/interact.ts`).
 */

export type ChestTier = 'wood' | 'iron' | 'gold'
export const CHEST_TIERS: readonly ChestTier[] = ['wood', 'iron', 'gold']

export type LootKind = 'gold' | 'potion' | 'mana' | 'item'

export interface LootEntry {
  kind: LootKind
  /** Relative weight among the table's entries. */
  w: number
  /** Gold: the pile, lowest to highest. */
  gold?: [number, number]
}

export interface ChestTable {
  /** Draws per chest. The first is always the gold entry. */
  draws: number
  /** Most pieces of equipment one chest gives. */
  maxItems: number
  entries: LootEntry[]
}

export interface ZoneLoot {
  /** The zone's enemy level band (the gold is sized from its middle). */
  band: [number, number]
  /** Equipment a chest here can hold. */
  items: string[]
  tables: Record<ChestTier, ChestTable>
}

/** The most potions the belt holds (the same cap the healers sell up to). */
export const POTION_BELT_MAX = 5
/** A health potion heals this share of the hero's health. */
export const POTION_HEAL = 0.45
/** A mana potion restores this share of the hero's mana. */
export const MANA_POTION = 0.45
/** What a mana potion is worth when the stock is already full. */
export const manaPotionGold = (level: number): number => 8 + level * 3

/**
 * Draws, most items and weights per tier: better chests draw more often and
 * lean to equipment. The gold is a share of the finale's purse, sized so that
 * a visit with EVERY side chest found pays about a fifth more gold than its
 * fights and finale alone (measured over 60 seeds per zone: +8 % to +28 %).
 */
const SHAPE: Record<ChestTier, { draws: number; maxItems: number; gold: [number, number]; flat: number; w: Record<LootKind, number> }> = {
  wood: { draws: 2, maxItems: 1, gold: [0.07, 0.12], flat: 3, w: { gold: 54, potion: 24, mana: 16, item: 6 } },
  iron: { draws: 3, maxItems: 1, gold: [0.12, 0.2], flat: 5, w: { gold: 42, potion: 24, mana: 18, item: 16 } },
  gold: { draws: 4, maxItems: 1, gold: [0.28, 0.42], flat: 10, w: { gold: 34, potion: 18, mana: 14, item: 34 } }
}

/** What a zone's finale pays in gold at `level` (the yardstick the piles are shares of). */
export const finaleGold = (level: number): number => 20 + level * 14

const tableOf = (tier: ChestTier, level: number): ChestTable => {
  const s = SHAPE[tier]
  const base = finaleGold(level)
  return {
    draws: s.draws,
    maxItems: s.maxItems,
    entries: [
      // A share of the finale's purse, on a few coins that keep the first zones' chests worth the walk.
      { kind: 'gold', w: s.w.gold, gold: [s.flat + Math.round(base * s.gold[0]), s.flat + Math.round(base * s.gold[1])] },
      { kind: 'potion', w: s.w.potion },
      { kind: 'mana', w: s.w.mana },
      { kind: 'item', w: s.w.item }
    ]
  }
}

/** The zone a chest's equipment comes from: its own, or the nearest zone
 *  before it whose list is not boss drops alone. */
export const lootZoneOf = (zone: ZoneId): ZoneId => {
  for (let n = ZONE_IDS.indexOf(zone); n >= 0; n--) {
    const z = ZONE_IDS[n]!
    if (ITEMS.some(i => i.drop.zone === z && (i.drop.src === 'mob' || i.drop.src === 'chest'))) return z
  }
  return zone
}

const lootOf = (zone: ZoneId): ZoneLoot => {
  const def = ZONES[zone]
  const mid = Math.round((def.min + def.max) / 2)
  const from = lootZoneOf(zone)
  return {
    band: [def.min, def.max],
    items: ITEMS.filter(i => i.drop.zone === from && (i.drop.src === 'mob' || i.drop.src === 'chest')).map(i => i.id),
    tables: { wood: tableOf('wood', mid), iron: tableOf('iron', mid), gold: tableOf('gold', mid) }
  }
}

export const ZONE_LOOT: Readonly<Record<ZoneId, ZoneLoot>> =
  Object.fromEntries(ZONE_IDS.map(z => [z, lootOf(z)])) as Record<ZoneId, ZoneLoot>

/** What the Dread Fortress's secret chest pays beside its ring. */
export const secretGold = (level: number): number => 150 + level * 40

/** A champion (the optional over-levelled enemy) is worth this many of its own kills. */
export const CHAMPION_REWARD = 2
