import type { SectorId } from '../world/themes'
import type { EncounterTable } from '../sim/spawn'

/**
 * ─── Sectors of Ampere Valley ────────────────────────────────────────────────
 *
 * Each sector is one bright stage theme with its own machine mix, an enemy
 * level band and a Core Master at the end of its story mission. Beating the
 * master unlocks the next sector on the map (and copies its weapon).
 */

export interface Sector {
  id: SectorId
  /** Enemy level band; missions scale inside it with the player's level. */
  levels: [number, number]
  encounters: EncounterTable
  boss: string
  /** Sector that must be cleared (boss beaten) before this one opens. */
  after: SectorId | null
  /** Position on the hub's sector map, 0..1 in both axes. */
  mapPos: [number, number]
  rooms: [number, number]
}

export const SECTORS: Sector[] = [
  {
    id: 'scrapyard', levels: [1, 4], boss: 'scrapper', after: null, mapPos: [0.22, 0.72], rooms: [7, 9],
    encounters: { kinds: [['hardhat', 3], ['trooper', 2], ['heli', 1.5], ['roller', 1], ['turret', 0.6], ['hopper', 0.5], ['brute', 0.3]], element: 'none', density: 0.85, eliteChance: 0.04 }
  },
  {
    id: 'blaze', levels: [3, 8], boss: 'blazeMaster', after: 'scrapyard', mapPos: [0.46, 0.8], rooms: [8, 10],
    encounters: { kinds: [['hardhat', 2], ['trooper', 2], ['roller', 2], ['hopper', 1.5], ['turret', 1], ['brute', 0.8], ['heli', 1]], element: 'fire', density: 0.95, eliteChance: 0.07 }
  },
  {
    id: 'cryo', levels: [6, 11], boss: 'frostMaster', after: 'blaze', mapPos: [0.7, 0.66], rooms: [8, 10],
    encounters: { kinds: [['trooper', 2.5], ['heli', 2], ['hardhat', 1.5], ['turret', 1.2], ['brute', 1], ['hopper', 1], ['roller', 1]], element: 'ice', density: 1.0, eliteChance: 0.08 }
  },
  {
    id: 'volt', levels: [9, 15], boss: 'voltMaster', after: 'cryo', mapPos: [0.78, 0.36], rooms: [9, 11],
    encounters: { kinds: [['heli', 2.5], ['turret', 1.5], ['trooper', 2], ['roller', 1.5], ['brute', 1.2], ['hopper', 1.2], ['hardhat', 1]], element: 'volt', density: 1.05, eliteChance: 0.09 }
  },
  {
    id: 'gale', levels: [13, 19], boss: 'galeMaster', after: 'volt', mapPos: [0.5, 0.2], rooms: [9, 11],
    encounters: { kinds: [['heli', 3], ['hopper', 2], ['trooper', 2], ['roller', 1.5], ['brute', 1.2], ['turret', 1], ['hardhat', 1]], element: 'wind', density: 1.1, eliteChance: 0.1 }
  },
  {
    id: 'fortress', levels: [18, 26], boss: 'vexMk1', after: 'gale', mapPos: [0.24, 0.32], rooms: [10, 12],
    encounters: { kinds: [['brute', 2], ['trooper', 2], ['heli', 2], ['hopper', 2], ['roller', 2], ['turret', 1.5], ['hardhat', 1.5]], element: 'none', density: 1.15, eliteChance: 0.12 }
  }
]

export const SECTOR_BY_ID = Object.fromEntries(SECTORS.map(s => [s.id, s])) as Record<SectorId, Sector>

/** Blades-style soft scaling: enemies track the player inside the band. */
export const enemyLevelFor = (sector: Sector, playerLevel: number, delta = 0): number =>
  Math.max(sector.levels[0], Math.min(sector.levels[1], playerLevel + delta))
