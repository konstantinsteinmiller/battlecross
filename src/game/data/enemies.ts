import type { EnemyKind } from '../models/enemies'

/**
 * ─── Enemy stat sheets ───────────────────────────────────────────────────────
 *
 * Numbers are level-1 values; `scaleHp` / `scaleDmg` grow them with the enemy
 * level. The player's buster starts at 10 damage per pellet, 100 HP, so a
 * hardhat takes three pellets (or one full charge) and one pellet costs the
 * player a tenth of the bar — the classic rhythm.
 *
 * `tele` is the telegraph length (ring shrink time). Every attack is readable
 * a beat ahead: orange rings can be blocked (and parried in the last 0.28 s),
 * red rings cannot — slide or step out.
 */

export type Element = 'none' | 'fire' | 'ice' | 'volt' | 'wind'

export interface EnemyDef {
  kind: EnemyKind
  hp: number
  dmg: number
  speed: number
  /** Body radius for collision / separation. */
  radius: number
  /** Hit sphere radius for player shots. */
  hitR: number
  /** Height of the hit / aim point above the enemy's feet. */
  aimY: number
  /** Hover height for flyers. */
  fly: number
  aggro: number
  /** Preferred distance band to the player. */
  range: [number, number]
  xp: number
  bolts: [number, number]
  /** Base cooldown between attacks, seconds (randomised ±30 %). */
  cooldown: number
  tele: number
  /** Red ring (unblockable) vs orange ring (blockable). */
  unblockable: boolean
  /** Damage multiplier taken (armor). */
  armor: number
}

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  hardhat: {
    kind: 'hardhat', hp: 30, dmg: 9, speed: 1.3, radius: 0.5, hitR: 0.62, aimY: 0.42, fly: 0,
    aggro: 13, range: [3, 12], xp: 12, bolts: [3, 6], cooldown: 2.4, tele: 0.55, unblockable: false, armor: 1
  },
  trooper: {
    kind: 'trooper', hp: 55, dmg: 8, speed: 2.3, radius: 0.55, hitR: 0.72, aimY: 1.05, fly: 0,
    aggro: 16, range: [5, 10], xp: 20, bolts: [5, 9], cooldown: 2.1, tele: 0.5, unblockable: false, armor: 1
  },
  heli: {
    kind: 'heli', hp: 28, dmg: 11, speed: 3.4, radius: 0.5, hitR: 0.6, aimY: 0, fly: 2.1,
    aggro: 16, range: [4.5, 8], xp: 14, bolts: [4, 7], cooldown: 3.0, tele: 0.7, unblockable: false, armor: 1
  },
  hopper: {
    kind: 'hopper', hp: 72, dmg: 16, speed: 2.0, radius: 0.75, hitR: 0.9, aimY: 1.35, fly: 0,
    aggro: 14, range: [0, 6], xp: 26, bolts: [6, 10], cooldown: 2.8, tele: 0.8, unblockable: true, armor: 0.95
  },
  roller: {
    kind: 'roller', hp: 46, dmg: 14, speed: 2.2, radius: 0.7, hitR: 0.85, aimY: 0.9, fly: 0,
    aggro: 16, range: [5, 12], xp: 18, bolts: [5, 8], cooldown: 2.6, tele: 0.7, unblockable: true, armor: 1
  },
  brute: {
    kind: 'brute', hp: 150, dmg: 20, speed: 1.6, radius: 0.95, hitR: 1.1, aimY: 1.55, fly: 0,
    aggro: 14, range: [0, 2.6], xp: 42, bolts: [10, 16], cooldown: 1.6, tele: 0.85, unblockable: false, armor: 0.85
  },
  turret: {
    kind: 'turret', hp: 60, dmg: 12, speed: 0, radius: 0.6, hitR: 0.75, aimY: 0.75, fly: 0,
    aggro: 18, range: [0, 20], xp: 16, bolts: [4, 7], cooldown: 2.6, tele: 0.8, unblockable: true, armor: 0.9
  }
}

export const scaleHp = (base: number, level: number): number => Math.round(base * (1 + 0.3 * (level - 1)))
export const scaleDmg = (base: number, level: number): number => Math.round(base * (1 + 0.14 * (level - 1)))
export const scaleXp = (base: number, level: number): number => Math.round(base * (1 + 0.22 * (level - 1)))
