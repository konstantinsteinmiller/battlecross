/**
 * A charged blow (a boss's charge, a charged cone or lane charge) never wipes the hero out of a healthy bar: it takes at most this share
 * of his CURRENT health — 30 % from a low-level foe, rising with the foe's level to 50 % from the Ashen Lands on (level 11) — and at least a
 * fifth of his FULL health, so a hero who is already low can still be finished by it.
 */
export const CHARGE_CAP_MIN = 0.3
export const CHARGE_CAP_MAX = 0.5
export const CHARGE_CAP_FROM = 5
export const CHARGE_CAP_AT = 11
export const CHARGE_FLOOR = 0.2

/** The share of the hero's current health one charged blow of a foe of this level may take. */
export const chargeShare = (level: number): number =>
  CHARGE_CAP_MIN + (CHARGE_CAP_MAX - CHARGE_CAP_MIN) * Math.min(1, Math.max(0, (level - CHARGE_CAP_FROM) / (CHARGE_CAP_AT - CHARGE_CAP_FROM)))

/** The damage options of a charged blow from a foe of this level. */
export const chargeCapOf = (level: number): { capHp: number; capFloor: number } => ({ capHp: chargeShare(level), capFloor: CHARGE_FLOOR })
