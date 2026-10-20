import type { Mods } from './mods'

/**
 * ─── The afterplay's gear (docs/gdd-afterplay.md §2.4, phase 8) ─────────────
 *
 * What the Breaking adds to the armoury, as data the item tables, the sim and
 * the smith read:
 *
 *   Infernal    every named unique of the campaign comes back from the invaded
 *               zones as its Infernal twin (`<id>Infernal`): 30 levels higher,
 *               its attributes and armour ×1.9, a red-black tint, and one of
 *               the eight demon affixes below. A fort smith also remakes an
 *               owned unique as its twin once the Forgemaster has his forge
 *               back (B6, `infernalForge`), for gold and Demonglass.
 *   uniques     each of the seven new bosses drops two named pieces (the
 *               Elder Dragon's are mythic), a pair that is a set: both worn,
 *               the set's bonus is added (`SET_BONUS`).
 *   Heroic+     five ranks above a worn piece's gold levels, bought with gold,
 *               Demonglass and (the last three) Mythic Ichor (`HEROIC`).
 *   materials   Demonglass (from demons) and Mythic Ichor (from the bosses),
 *               kept in the ore pouch and sold to a smith (`ores.ts`).
 *
 * Pure data: no items import (`items.ts` reads this).
 */

/** The demons (the Demonglass they carry, the affixes that hunt them). */
export const DEMON_KINDS: ReadonlySet<string> = new Set([
  'imp', 'hellhound', 'frostHellhound', 'highDemon', 'demonMiner', 'pitLord', 'doomKnight', 'archDemon',
  'gargoyle', 'seaDemon', 'voidling', 'demonPylon'
])

/** The mythic beasts: the afterplay's seven bosses and their kin. */
export const MYTHIC_KINDS: ReadonlySet<string> = new Set([
  'chimera', 'chimeraTail', 'centaurWarchief', 'centaurRaider', 'cyclops', 'cyclopsBrute', 'sphinx', 'sphinxAcolyte',
  'leviathan', 'hydra', 'hydraSpawn', 'elderDragon', 'drakeHatchling', 'harpy'
])

/** The eight demon affixes (§2.4): an Infernal piece carries one, picked by its place in the table. */
export const DEMON_AFFIXES: readonly Mods[] = [
  { demonBane: 0.15 },
  { demonLeech: 0.04 },
  { beastBane: 0.15 },
  { fireWard: 0.2 },
  { shadowWard: 0.2 },
  { demonWard: 0.1 },
  { pylonBreaker: 0.5 },
  { glassFinder: 0.5 }
]

/** An Infernal twin's level over its original's, and what its attributes and armour are multiplied by. */
export const INFERNAL_LEVEL = 30
export const INFERNAL_MUL = 1.9
/** The suffix of an Infernal twin's id. */
export const INFERNAL_SUFFIX = 'Infernal'
/** An Infernal piece in a shop costs this many times its original's price. */
export const INFERNAL_PRICE = 3
/** The share of a visit's dropped pieces that comes as an Infernal twin (§11: 10 %). */
export const INFERNAL_SHARE = 0.1

/** Remaking an owned unique as its Infernal twin at a smith (after B6): gold by tier, and Demonglass. */
export const INFERNAL_FORGE_GOLD: Readonly<Record<number, number>> = { 1: 1500, 2: 2500, 3: 4000, 4: 6000, 5: 9000, 6: 14000 }
export const INFERNAL_FORGE_GLASS = 40

/** The flag B6 leaves (the Forgemaster's forge): Infernal smithing and the fort's Infernal stock. */
export const INFERNAL_FORGE_FLAG = 'infernalForge'
/** The flags B7–B9 leave (`breaking.ts`). */
export const ORACLE_LENS_FLAG = 'oracleLens'
export const LEVIATHAN_SCALE_FLAG = 'leviathanScale'
export const HYDRA_KEY_FLAG = 'hydraKey'
/** The Leviathan Scale (B8's reward) has been put in the bag once (it is never given twice). */
export const SCALE_GIVEN_FLAG = 'scaleGiven'

/**
 * A boss pair's set bonus (both worn). The design asks for "+20 % to one skill
 * school"; the game has no skill schools, so each set raises the line of its
 * boss's own element with a modifier the game already has.
 */
export const SET_BONUS: Readonly<Record<string, Mods>> = {
  chimera: { spellCrit: 0.08, critChance: 0.04 },
  centaur: { pierce: 1, attackSpeed: 0.1 },
  cyclops: { crumble: 0.2 },
  sphinx: { cdr: 0.1 },
  leviathan: { chillDamage: 0.2 },
  hydra: { igniteBonus: 0.2, burnOnHit: 30 },
  elderDragon: { damagePct: 0.15 }
}

/**
 * ─── Heroic+ (§2.4: "+6 … +10") ──────────────────────────────────────────────
 *
 * The smith's gold levels have had no top since #149, so the design's +6..+10
 * are five HEROIC ranks on top of them, the afterplay's alone. Each rank grows
 * a piece's attributes and armour by `HEROIC_GAIN` of what it has at its gold
 * level. The cost is the design's: 8k at the first, 40k and Ichor at the last.
 */
export const HEROIC_MAX = 5
export const HEROIC_GAIN = 0.06
export const HEROIC: ReadonlyArray<{ gold: number; glass: number; ichor: number }> = [
  { gold: 8000, glass: 20, ichor: 0 },
  { gold: 14000, glass: 35, ichor: 0 },
  { gold: 21000, glass: 50, ichor: 1 },
  { gold: 30000, glass: 70, ichor: 2 },
  { gold: 40000, glass: 100, ichor: 3 }
]

/** What the next heroic rank costs a piece at `rank` (null: none left). */
export const heroicCost = (rank: number): { gold: number; glass: number; ichor: number } | null =>
  rank >= 0 && rank < HEROIC_MAX ? HEROIC[rank]! : null

/** How much bigger the heroic ranks make the growing numbers (1 at rank 0). */
export const heroicScale = (rank: number): number => 1 + HEROIC_GAIN * Math.max(0, Math.min(HEROIC_MAX, Math.floor(rank)))

/**
 * ─── What the afterplay's bosses leave (§11) ─────────────────────────────────
 *
 * A boss's first kill: its two uniques, `ICHOR_FIRST` Mythic Ichor and its own
 * Demonglass (the Chimera's 600, §5.1); a repeat kill: one of the two at
 * `REPEAT_DROP`, and an Ichor. A demon slain in an invaded zone leaves a
 * Demonglass; the pylons' chest ten.
 */
export const ICHOR_FIRST = 3
export const ICHOR_REPEAT = 1
export const REPEAT_DROP = 0.2
export const BOSS_GLASS: Readonly<Record<string, number>> = { chimera: 600 }
export const PYLON_GLASS = 10
export const DEMON_GLASS = 1

/** The Siege Marks' quartermaster (§8.6): Demonglass for Marks. */
export const MARKS_GLASS = { marks: 5, glass: 25 }
