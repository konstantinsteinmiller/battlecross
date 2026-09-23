/**
 * Derived player stats — everything combat reads, computed from level,
 * attributes, circuit skills and gear (see `state/profile.ts`). The mission
 * never looks at the profile directly, only at this flat record.
 */
export interface PlayerStats {
  level: number
  maxHp: number
  maxWe: number
  maxPower: number
  /** Damage of one quick pellet. */
  busterDmg: number
  pelletMul: number
  chargeDmgMul: number
  /** Multiplier on charge TIME (smaller = faster). */
  chargeTimeMul: number
  /** Multiplier on the perfect-release window length. */
  perfectMul: number
  critMul: number
  /** Multiplier on damage TAKEN (armor). */
  damageTakenMul: number
  blockCostMul: number
  blockDmgMul: number
  parryBonus: number
  parryStunBonus: number
  /** Fraction of max HP regenerated per second out of combat. */
  regen: number
  reflectPct: number
  lastStand: boolean
  specialMul: number
  weCostMul: number
  slideCdMul: number
  slideCost: number
  boltMul: number
  magnetMul: number
  tanksMax: number
  scanner: boolean
  piercing: boolean
  giga: boolean
  moveMul: number
  /** Extra crit chance on any hit (chips). */
  critChance: number
}

export const baseStats = (): PlayerStats => ({
  level: 1,
  maxHp: 100,
  maxWe: 28,
  maxPower: 100,
  busterDmg: 10,
  pelletMul: 1,
  chargeDmgMul: 1,
  chargeTimeMul: 1,
  perfectMul: 1,
  critMul: 1.5,
  damageTakenMul: 1,
  blockCostMul: 1,
  blockDmgMul: 1,
  parryBonus: 0,
  parryStunBonus: 0,
  regen: 0,
  reflectPct: 0,
  lastStand: false,
  specialMul: 1,
  weCostMul: 1,
  slideCdMul: 1,
  slideCost: 25,
  boltMul: 1,
  magnetMul: 1,
  tanksMax: 2,
  scanner: false,
  piercing: false,
  giga: false,
  moveMul: 1,
  critChance: 0
})

// Charge timing (seconds at chargeTimeMul = 1)
export const CHARGE_L1 = 0.55
export const CHARGE_L2 = 1.2
export const CHARGE_L3 = 2.1
export const PERFECT_DELAY = 0.08
export const PERFECT_LEN = 0.24

export interface ChargeInfo {
  level: 0 | 1 | 2 | 3
  /** 0..1 progress toward the next level (for the ring). */
  toL1: number
  toL2: number
  perfect: boolean
  /** Perfect window has passed (release now is a normal full charge). */
  late: boolean
}

export const chargeInfo = (t: number, s: PlayerStats): ChargeInfo => {
  const l1 = CHARGE_L1 * s.chargeTimeMul
  const l2 = CHARGE_L2 * s.chargeTimeMul
  const l3 = CHARGE_L3 * s.chargeTimeMul
  const p0 = l2 + PERFECT_DELAY
  const p1 = p0 + PERFECT_LEN * s.perfectMul
  const level: ChargeInfo['level'] = s.giga && t >= l3 ? 3 : t >= l2 ? 2 : t >= l1 ? 1 : 0
  return {
    level,
    toL1: Math.min(1, t / l1),
    toL2: Math.min(1, Math.max(0, (t - l1) / (l2 - l1))),
    perfect: level === 2 && t >= p0 && t <= p1,
    late: t > p1
  }
}
