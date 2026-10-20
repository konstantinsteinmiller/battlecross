import { ENEMY_BY_ID } from './enemies'
import type { ZoneId } from './items'
import { HYDRA_KEY_FLAG } from './relics'
import { NODE_BY_ID, ZONES, ZONE_IDS, type NodeId, type PackEntry, type ZoneDef } from './zones'

/**
 * ─── The invasion overlay (docs/gdd-afterplay.md §3–§4, §5.8) ────────────────
 *
 * Once the afterplay is open (the Void Lord is dead) every zone returns as its
 * INVADED version: the same layout (`zoneGen.ts` lays the same ground from the
 * same seed), its enemies swapped for the Breaking's, levelled into the band
 * 31-60, its ground tinted toward dried blood, burning ruins in every clearing,
 * a rift scar or two, and a demon pylon in each section.
 *
 * The roster names the enemies the design asks for. Thirteen of them come in
 * phase 4 (`docs/gdd-afterplay.md` §6) and the seven new bosses in phases 5
 * and 7; until a kind exists in the bestiary its STAND-IN fights in its place
 * (an existing enemy, re-levelled and tinted). Adding the real def to
 * `enemies.ts` is all it takes for it to take over: nothing here changes.
 *
 * Pure data and pure functions: no three.js, no save.
 */

/** What the design asks for, by the kind that stands in for it until it exists. */
export const STAND_INS: Readonly<Record<string, string>> = {
  // (Phase 4's thirteen new enemies are in the bestiary now, and need none; the pylon is phase 2's own, `sim/invasion.ts`.)
  // Phases 5 and 7: the seven new bosses. Each zone's own campaign finale
  // holds the field for its beast, so the arena it was laid for still fits.
  chimera: 'elderTreant',
  centaurWarchief: 'warlord',
  cyclops: 'ironColossus',
  sphinx: 'nagaOracle',
  leviathan: 'voidWarden',
  hydra: 'archDemon',
  elderDragon: 'voidLord'
}

/** The kind that fights for `kind` today: itself once it is in the bestiary. */
export const resolveKind = (kind: string): string => (ENEMY_BY_ID[kind] ? kind : STAND_INS[kind] ?? kind)

export interface InvasionDef {
  /** The invaded level band. */
  min: number
  max: number
  /** The roster as designed (unresolved kinds: `resolveKind`). */
  kinds: PackEntry[]
  finale: { leader: string; with: string[] }
  /** A returning campaign boss on its own script, +30 levels, tinted, one add more (§5.8). */
  reborn?: boolean
  /** The new boss this zone is built toward (phases 5/7), for the map and the tests. */
  boss?: string
  /** The optional champion, when it differs from the campaign's. */
  champion?: string
  /** Burning ruins per section (3-6, §3). */
  ruins: [number, number]
  /** Rift scars per visit (1-2). */
  scars: [number, number]
  /** Map order: zones open one after the other (the quest chain takes this over in phase 3). */
  order: number
}

/** §4, row by row. Weights are the roster's counts. */
export const INVASION: Readonly<Record<ZoneId, InvasionDef>> = {
  plains: {
    min: 31, max: 33, order: 0, ruins: [3, 5], scars: [1, 1], champion: 'banditChief',
    kinds: [{ kind: 'imp', w: 5 }, { kind: 'goblin', w: 3 }, { kind: 'hellhound', w: 3 }],
    // The Demon Warband: a high demon and its imps.
    finale: { leader: 'highDemon', with: ['imp', 'imp', 'imp', 'hellhound'] }
  },
  hollows: {
    min: 32, max: 34, order: 1, ruins: [3, 5], scars: [1, 2], reborn: true,
    kinds: [{ kind: 'hellhound', w: 3 }, { kind: 'imp', w: 3 }, { kind: 'gargoyle', w: 2 }],
    finale: { leader: 'tusker', with: ['hellhound', 'imp', 'imp'] }
  },
  woods: {
    min: 34, max: 37, order: 2, ruins: [3, 5], scars: [1, 2], boss: 'chimera',
    kinds: [{ kind: 'spider', w: 3 }, { kind: 'corruptedTreant', w: 2 }, { kind: 'harpy', w: 3 }, { kind: 'hellhound', w: 2 }],
    finale: { leader: 'chimera', with: ['hellhound', 'harpy'] }
  },
  outskirts: {
    min: 37, max: 40, order: 3, ruins: [4, 6], scars: [1, 2], boss: 'centaurWarchief',
    kinds: [{ kind: 'centaurRaider', w: 4 }, { kind: 'banditArcher', w: 2 }, { kind: 'imp', w: 2 }],
    finale: { leader: 'centaurWarchief', with: ['centaurRaider', 'banditArcher'] }
  },
  crags: {
    min: 40, max: 43, order: 4, ruins: [3, 5], scars: [1, 2], reborn: true,
    kinds: [{ kind: 'fireElemental', w: 3 }, { kind: 'cyclopsBrute', w: 2 }, { kind: 'cultist', w: 2 }, { kind: 'gargoyle', w: 2 }],
    // The Ember Lord Infernal.
    finale: { leader: 'emberLord', with: ['fireElemental', 'cultist', 'cultist', 'gargoyle'] }
  },
  mines: {
    min: 42, max: 45, order: 5, ruins: [3, 5], scars: [1, 2], boss: 'cyclops',
    kinds: [{ kind: 'ironGolem', w: 2 }, { kind: 'cyclopsBrute', w: 2 }, { kind: 'imp', w: 3 }, { kind: 'demonMiner', w: 2 }],
    finale: { leader: 'cyclops', with: ['demonMiner', 'imp'] }
  },
  tundra: {
    min: 45, max: 48, order: 6, ruins: [3, 5], scars: [1, 2], reborn: true,
    kinds: [{ kind: 'frostHellhound', w: 3 }, { kind: 'frostGiant', w: 2 }, { kind: 'harpy', w: 2 }, { kind: 'skeleton', w: 2 }],
    finale: { leader: 'frostJarl', with: ['frostGiant', 'frostHellhound', 'frostHellhound', 'harpy'] }
  },
  temple: {
    min: 46, max: 49, order: 7, ruins: [3, 5], scars: [1, 2], boss: 'sphinx',
    kinds: [{ kind: 'naga', w: 3 }, { kind: 'sphinxAcolyte', w: 2 }, { kind: 'gargoyle', w: 2 }, { kind: 'necromancer', w: 1 }],
    finale: { leader: 'sphinx', with: ['sphinxAcolyte', 'sphinxAcolyte'] }
  },
  citadel: {
    min: 49, max: 52, order: 8, ruins: [3, 5], scars: [1, 2], boss: 'leviathan',
    kinds: [{ kind: 'voidStalker', w: 3 }, { kind: 'seaDemon', w: 3 }, { kind: 'highDemon', w: 2 }],
    finale: { leader: 'leviathan', with: ['seaDemon', 'seaDemon', 'highDemon'] }
  },
  peak: {
    min: 52, max: 55, order: 9, ruins: [3, 5], scars: [1, 2], reborn: true,
    kinds: [{ kind: 'wyvern', w: 3 }, { kind: 'drakeHatchling', w: 3 }, { kind: 'highDemon', w: 2 }],
    // The Void Dragon Reborn, with one add it never had.
    finale: { leader: 'voidDragon', with: ['drakeHatchling'] }
  },
  fortress: {
    min: 54, max: 57, order: 10, ruins: [3, 5], scars: [1, 2], boss: 'hydra', champion: 'pitLord',
    kinds: [{ kind: 'doomKnight', w: 2 }, { kind: 'imp', w: 4 }, { kind: 'hydraSpawn', w: 2 }],
    finale: { leader: 'hydra', with: ['hydraSpawn'] }
  },
  rift: {
    min: 57, max: 60, order: 11, ruins: [3, 4], scars: [2, 2], boss: 'elderDragon',
    // Phase 4 adds every new mythic as a lone elite here (§4).
    kinds: [{ kind: 'voidling', w: 4 }, { kind: 'voidStalker', w: 2 }, { kind: 'highDemon', w: 2 }, { kind: 'doomKnight', w: 1 }],
    finale: { leader: 'elderDragon', with: [] }
  }
}

/** The four campaign bosses that return Reborn (§5.8), by their kind. */
export const REBORN: ReadonlySet<string> = new Set(ZONE_IDS.filter(z => INVASION[z].reborn).map(z => INVASION[z].finale.leader))

/**
 * The invaded zone as a `ZoneDef`: the campaign's own (its id, theme, layout,
 * sections and pack sizes), with the invasion's band, roster and finale, every
 * kind resolved to what fights today.
 */
export const invadedZone = (id: ZoneId): ZoneDef => {
  const base = ZONES[id]
  const inv = INVASION[id]
  return {
    ...base,
    min: inv.min,
    max: inv.max,
    kinds: inv.kinds.map(k => ({ kind: resolveKind(k.kind), w: k.w })),
    finale: { leader: resolveKind(inv.finale.leader), with: inv.finale.with.map(resolveKind) },
    invaded: true,
    ...(inv.champion ? { champion: resolveKind(inv.champion) } : {})
  }
}

/** The zone a visit is fought in: the invaded one in the afterplay. */
export const zoneOf = (id: ZoneId, invaded: boolean): ZoneDef => (invaded ? invadedZone(id) : ZONES[id])

/** Zones in the order the invasion opens them. */
export const INVASION_ORDER: readonly ZoneId[] = [...ZONE_IDS].sort((a, b) => INVASION[a].order - INVASION[b].order)

/** The world flag an invaded zone's first win sets. */
export const invadedFlag = (id: ZoneId): string => `invaded:${id}`

/**
 * May the hero go into a zone's invaded version (§4: "not all at once")? The
 * first two open with the afterplay; each further one when the one before it
 * in the order has been won. Phase 3's quest chain replaces this rule.
 */
export const invadedOpen = (id: ZoneId, flags: ReadonlySet<string>): boolean => {
  const k = INVASION_ORDER.indexOf(id)
  if (k < 0) return false
  if (k < 2) return true
  // The Hydra's fire key opens the Rift's heart (B9, afterplay phase 8).
  if (id === 'rift' && !flags.has(HYDRA_KEY_FLAG)) return false
  return flags.has(invadedFlag(INVASION_ORDER[k - 1]!))
}

/** May the hero go into this place now? Any town, and any zone before the afterplay; in it, an invaded zone once open. */
export const invasionLetsIn = (id: NodeId, afterplay: boolean, flags: ReadonlySet<string>): boolean =>
  !afterplay || NODE_BY_ID[id]?.kind !== 'zone' || invadedOpen(id as ZoneId, flags)

/** The zone before this one in the invasion's order (what must be won to open it), if any. */
export const invadedBefore = (id: ZoneId): ZoneId | null => {
  const k = INVASION_ORDER.indexOf(id)
  return k >= 2 ? INVASION_ORDER[k - 1]! : null
}

/** The corruption's colour and how far the ground is blended toward it (§3). */
export const CORRUPT_HEX = '#5a1a2a'
export const CORRUPT_MIX = 0.35

/** A demon pylon (§3): the sim's numbers. */
export const PYLON = {
  /** Health as a multiple of a normal enemy's at the visit's level. */
  hp: 1.6,
  /** How far its aura reaches (m), and the damage it adds to the demons inside. */
  r: 9,
  dmg: 0.2,
  /** The pylons' chest (§11): gold as a multiple of a finale's purse. */
  gold: 0.6
} as const
