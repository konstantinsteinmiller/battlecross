import { describe, expect, it } from 'vitest'
import { bossHpMul, behind, powerRatio, refPower, BOSS_ABSORB, BOSS_CAP } from '@/game/sim/adaptive'

const stats = (busterDmg: number, o: Partial<{ chargeDmgMul: number; critChance: number; critMul: number }> = {}) =>
  ({ busterDmg, chargeDmgMul: 1, critChance: 0, critMul: 1.5, ...o })

describe('adaptive boss health', () => {
  it('a player at the reference fights the boss as designed', () => {
    const L = 6
    expect(bossHpMul(stats(refPower(L)), L)).toBeCloseTo(1)
  })
  it('an over-geared player meets a tougher boss, but still kills it faster', () => {
    const L = 6
    const s = stats(refPower(L) * 1.9)
    const mul = bossHpMul(s, L)
    expect(mul).toBeGreaterThan(1.6)
    // Time to kill relative to design: hp × mul / power — still under 1.
    expect(mul / powerRatio(s, L)).toBeLessThan(1)
  })
  it('never more than the cap', () => {
    expect(bossHpMul(stats(10_000), 3)).toBeCloseTo(1 + BOSS_ABSORB * (BOSS_CAP - 1))
  })
  it('an under-geared player is flagged, and the boss is not softened', () => {
    const L = 8
    const s = stats(refPower(L) * 0.6)
    expect(behind(s, L)).toBe(true)
    expect(bossHpMul(s, L)).toBe(1)
  })
})
