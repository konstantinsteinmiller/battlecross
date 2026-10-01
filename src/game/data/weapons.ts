import type { Element } from './enemies'
import { MASTER_COLOR } from './signature'

/**
 * ─── Special weapons (the weapon-copy system) ────────────────────────────────
 *
 * Beating a Core Master copies its weapon into Flux's buster. Two can be
 * slotted at a time; each costs Weapon Energy per use and levels up (3 ranks)
 * through kills scored with it. Equipping one tints the arm cannon.
 */

export type WeaponId = 'scrapBurst' | 'flameWave' | 'iceLance' | 'thunderArc' | 'galeGuard' | 'magnetPull' | 'drillBomb' | 'bubbleLance' | 'neonBlade' | 'droneSwarm'

export interface WeaponDef {
  id: WeaponId
  color: string
  /** Secondary tint for the arm shell while equipped. */
  shell: string
  cost: number
  cooldown: number
  /** Damage multiplier on the buster's base damage. */
  dmg: number
  element: Element
  /** Boss that drops it. */
  from: string
  /** Weapon XP needed for rank 2 and 3. */
  xp: [number, number]
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  scrapBurst: { id: 'scrapBurst', color: MASTER_COLOR.scrapper, shell: '#6f7a90', cost: 2, cooldown: 0.45, dmg: 1.5, element: 'none', from: 'scrapper', xp: [12, 30] },
  flameWave: { id: 'flameWave', color: MASTER_COLOR.blazeMaster, shell: '#c0392b', cost: 4, cooldown: 0.9, dmg: 3.2, element: 'fire', from: 'blazeMaster', xp: [14, 34] },
  iceLance: { id: 'iceLance', color: MASTER_COLOR.frostMaster, shell: '#2f78ad', cost: 4, cooldown: 1.0, dmg: 3.0, element: 'ice', from: 'frostMaster', xp: [14, 34] },
  thunderArc: { id: 'thunderArc', color: MASTER_COLOR.voltMaster, shell: '#7a4fd6', cost: 5, cooldown: 1.1, dmg: 2.6, element: 'volt', from: 'voltMaster', xp: [16, 38] },
  galeGuard: { id: 'galeGuard', color: MASTER_COLOR.galeMaster, shell: '#1f9a7a', cost: 6, cooldown: 1.6, dmg: 2.2, element: 'wind', from: 'galeMaster', xp: [16, 38] },
  // A homing horseshoe: it bends onto its mark, breaks a guard or a closed
  // shell like a full charge, and yanks a flyer out of the air.
  magnetPull: { id: 'magnetPull', color: MASTER_COLOR.magnetMaster, shell: '#c9d3e6', cost: 3, cooldown: 0.8, dmg: 1.8, element: 'none', from: 'magnetMaster', xp: [16, 38] },
  // A boring bomb: it bores straight on and bursts where it stops, hurting
  // everything round it, and its blast breaks cracked rock.
  drillBomb: { id: 'drillBomb', color: MASTER_COLOR.drillMaster, shell: '#6b5a4a', cost: 4, cooldown: 1.0, dmg: 2.8, element: 'none', from: 'drillMaster', xp: [16, 38] },
  // A big bubble rolling along the floor, through every machine in its way.
  bubbleLance: { id: 'bubbleLance', color: MASTER_COLOR.tideMaster, shell: '#1f3f6a', cost: 3, cooldown: 0.7, dmg: 2.4, element: 'none', from: 'tideMaster', xp: [16, 38] },
  // A spinning blade of light thrown like a boomerang: it cuts on the way
  // out and again on the way back (and through shots it meets).
  neonBlade: { id: 'neonBlade', color: MASTER_COLOR.neonMaster, shell: '#2a1840', cost: 3, cooldown: 0.6, dmg: 2.6, element: 'none', from: 'neonMaster', xp: [16, 38] },
  // Three little drones that seek out three machines (round cover, from
  // any side): costly, and never wasted.
  droneSwarm: { id: 'droneSwarm', color: MASTER_COLOR.rotorMaster, shell: '#3a3f4f', cost: 6, cooldown: 1.8, dmg: 2.0, element: 'none', from: 'rotorMaster', xp: [16, 38] }
}

export const WEAPON_IDS = Object.keys(WEAPONS) as WeaponId[]

/** Each weapon's mark (`components/icons`): the results screen's "new weapon"
 *  line and the HUD's weapon buttons draw the same glyph in its colour, so a
 *  player sees WHAT they won, not only its name. */
export const WEAPON_ICON = {
  scrapBurst: 'grapeshot',
  flameWave: 'flame',
  iceLance: 'snowflake',
  thunderArc: 'bolt',
  galeGuard: 'wind',
  magnetPull: 'magnet',
  drillBomb: 'drill',
  bubbleLance: 'bubble',
  neonBlade: 'blade',
  droneSwarm: 'drones'
} as const satisfies Record<WeaponId, string>

export const weaponRank = (xp: number, def: WeaponDef): 1 | 2 | 3 => (xp >= def.xp[1] ? 3 : xp >= def.xp[0] ? 2 : 1)
