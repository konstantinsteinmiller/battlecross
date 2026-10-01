import type { Element } from './enemies'

/**
 * ─── Special weapons (the weapon-copy system) ────────────────────────────────
 *
 * Beating a Core Master copies its weapon into Flux's buster. Two can be
 * slotted at a time; each costs Weapon Energy per use and levels up (3 ranks)
 * through kills scored with it. Equipping one tints the arm cannon.
 */

export type WeaponId = 'scrapBurst' | 'flameWave' | 'iceLance' | 'thunderArc' | 'galeGuard' | 'magnetPull' | 'drillBomb' | 'bubbleLance'

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
  scrapBurst: { id: 'scrapBurst', color: '#c9d3e6', shell: '#6f7a90', cost: 2, cooldown: 0.45, dmg: 1.5, element: 'none', from: 'scrapper', xp: [12, 30] },
  flameWave: { id: 'flameWave', color: '#ff7a2a', shell: '#c0392b', cost: 4, cooldown: 0.9, dmg: 3.2, element: 'fire', from: 'blazeMaster', xp: [14, 34] },
  iceLance: { id: 'iceLance', color: '#8ff2ff', shell: '#2f78ad', cost: 4, cooldown: 1.0, dmg: 3.0, element: 'ice', from: 'frostMaster', xp: [14, 34] },
  thunderArc: { id: 'thunderArc', color: '#ffe13d', shell: '#7a4fd6', cost: 5, cooldown: 1.1, dmg: 2.6, element: 'volt', from: 'voltMaster', xp: [16, 38] },
  galeGuard: { id: 'galeGuard', color: '#7fffc8', shell: '#1f9a7a', cost: 6, cooldown: 1.6, dmg: 2.2, element: 'wind', from: 'galeMaster', xp: [16, 38] },
  // A homing horseshoe: it bends onto its mark, breaks a guard or a closed
  // shell like a full charge, and yanks a flyer out of the air.
  magnetPull: { id: 'magnetPull', color: '#ff4a5e', shell: '#3f7bff', cost: 3, cooldown: 0.8, dmg: 1.8, element: 'none', from: 'magnetMaster', xp: [16, 38] },
  // A boring bomb: it bores straight on and bursts where it stops, hurting
  // everything round it, and its blast breaks cracked rock.
  drillBomb: { id: 'drillBomb', color: '#ffb12a', shell: '#6b5a4a', cost: 4, cooldown: 1.0, dmg: 2.8, element: 'none', from: 'drillMaster', xp: [16, 38] },
  // A big bubble rolling along the floor, through every machine in its way.
  bubbleLance: { id: 'bubbleLance', color: '#5fd2ff', shell: '#1f3f6a', cost: 3, cooldown: 0.7, dmg: 2.4, element: 'none', from: 'tideMaster', xp: [16, 38] }
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
  bubbleLance: 'bubble'
} as const satisfies Record<WeaponId, string>

export const weaponRank = (xp: number, def: WeaponDef): 1 | 2 | 3 => (xp >= def.xp[1] ? 3 : xp >= def.xp[0] ? 2 : 1)
