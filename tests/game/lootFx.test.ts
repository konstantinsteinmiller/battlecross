import { describe, expect, it } from 'vitest'
import { SLOW_MO, SLOW_MO_FLOOR, slowMoScale } from '@/game/gfx/slowMo'
import { beamShape } from '@/game/gfx/lootBeam'

describe('level-up slow motion (roadmap #6)', () => {
  it('runs at full speed outside the beat', () => {
    expect(slowMoScale(-1)).toBe(1)
    expect(slowMoScale(0)).toBe(1)
    expect(slowMoScale(SLOW_MO)).toBe(1)
    expect(slowMoScale(5)).toBe(1)
  })

  it('eases down to the floor, holds, and eases back without a jump', () => {
    expect(slowMoScale(SLOW_MO * 0.3)).toBe(SLOW_MO_FLOOR)
    let prev = 1
    let maxStep = 0
    for (let t = 0; t <= SLOW_MO; t += SLOW_MO / 200) {
      const s = slowMoScale(t)
      expect(s).toBeGreaterThanOrEqual(SLOW_MO_FLOOR - 1e-9)
      expect(s).toBeLessThanOrEqual(1)
      maxStep = Math.max(maxStep, Math.abs(s - prev))
      prev = s
    }
    expect(maxStep).toBeLessThan(0.1)
  })
})

describe('loot beams climb with the tier (roadmap #5)', () => {
  it('a rarer tier stands taller, wider and longer', () => {
    for (let t = 2; t <= 6; t++) {
      const a = beamShape(t - 1)
      const b = beamShape(t)
      expect(b.h).toBeGreaterThan(a.h)
      expect(b.r).toBeGreaterThan(a.r)
      expect(b.dur).toBeGreaterThan(a.dur)
    }
  })
})
