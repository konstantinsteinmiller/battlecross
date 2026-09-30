import type { PlayerStats } from './stats'

/**
 * ─── Adaptive difficulty: bosses that keep up, a hand for players who don't ──
 *
 * A player who lucks into a purple buster and pours bolts into it can hit
 * six times harder than the game expects, and a Core Master then melts in
 * seconds. So a boss's health follows the player's POWER against a
 * reference: the same level with standard, un-upgraded gear and no chips
 * (the Blaze Master fight as designed). Above the reference, the boss absorbs
 * BOSS_ABSORB of the surplus (up to BOSS_CAP ×): upgrades still show — the
 * fight is shorter — but never trivial. Below it, nothing changes here; the
 * lab offers help instead (`behind`, Pip's upgrade lesson).
 *
 * The power index is the damage a shot does on average: buster damage, the
 * charge bonus and the crits' expected share. Pure; pinned by
 * `tests/game/adaptive.test.ts`.
 */

export const BOSS_ABSORB = 0.85
export const BOSS_CAP = 2
/** Power under this share of the reference: the player is falling behind. */
export const BEHIND_AT = 0.8
/** The standard arm's base damage (items.ts `arm_standard`). */
const STANDARD_MAIN = 10

export const powerIndex = (s: Pick<PlayerStats, 'busterDmg' | 'chargeDmgMul' | 'critChance' | 'critMul'>): number =>
  s.busterDmg * s.chargeDmgMul * (1 + s.critChance * (s.critMul - 1))

/** The reference power at `level`: the standard arm of that item level,
 *  unupgraded, no chips, no crits. */
export const refPower = (level: number): number => {
  const main = Math.round(STANDARD_MAIN * (1 + (Math.max(1, level) - 1) * 0.16))
  return Math.round(main * (1 + 0.03 * (Math.max(1, level) - 1)))
}

/** The player's power against the reference at `level` (1 = as designed). */
export const powerRatio = (s: Parameters<typeof powerIndex>[0], level: number): number =>
  powerIndex(s) / Math.max(1, refPower(level))

/** A boss's health multiplier for this player at this level. */
export const bossHpMul = (s: Parameters<typeof powerIndex>[0], level: number): number => {
  const r = Math.min(BOSS_CAP, Math.max(1, powerRatio(s, level)))
  return 1 + BOSS_ABSORB * (r - 1)
}

/** Falling behind the curve for the next mission's level. */
export const behind = (s: Parameters<typeof powerIndex>[0], level: number): boolean =>
  powerRatio(s, level) < BEHIND_AT
