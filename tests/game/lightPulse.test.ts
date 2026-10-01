// The lights go out on a clock (`sim/lightPulse.ts`, #110): a warning, the
// dark, then the light — always the longest part — with fades, never more than
// three flashes a second, and a crossing window a pulse bridge can be timed to.

import { describe, expect, it } from 'vitest'
import { BLACKOUT, FADE_S, lightWindow, pulseAt } from '@/game/sim/lightPulse'

const sweep = (from: number, to: number, step = 0.01) => {
  const out: ReturnType<typeof pulseAt>[] = []
  for (let t = from; t < to; t += step) out.push(pulseAt(t))
  return out
}

describe('the blackout clock', () => {
  it('warns, goes dark, then stays lit for most of the cycle', () => {
    expect(pulseAt(0.25).warning).toBe(true)
    expect(pulseAt(BLACKOUT.warn + 1).out).toBe(true)
    expect(pulseAt(BLACKOUT.warn + BLACKOUT.dark + 1).dark01).toBe(0)
    expect(lightWindow()).toBeGreaterThan(BLACKOUT.warn + BLACKOUT.dark)
  })

  it('repeats on its period, and a phase shifts it', () => {
    for (const t of [0.3, 1.7, 4]) {
      expect(pulseAt(t + BLACKOUT.period).dark01).toBeCloseTo(pulseAt(t).dark01, 9)
    }
    expect(pulseAt(1.5, { ...BLACKOUT, phase: 3 }).dark01).toBeCloseTo(pulseAt(4.5).dark01, 9)
  })

  it('never jumps: every change is a fade', () => {
    const s = sweep(0, BLACKOUT.period * 2, 0.005)
    for (let i = 1; i < s.length; i++) {
      expect(Math.abs(s[i]!.dark01 - s[i - 1]!.dark01)).toBeLessThanOrEqual(0.005 / FADE_S + 1e-9)
    }
  })

  it('flashes at most three times in any second', () => {
    const s = sweep(0, BLACKOUT.period * 3, 0.005)
    // A flash: the light falls past half-way then recovers.
    const dips: number[] = []
    let down = false
    s.forEach((p, i) => {
      if (!down && p.dark01 > 0.2) { down = true; dips.push(i * 0.005) }
      if (down && p.dark01 < 0.05) down = false
    })
    for (const t of dips) expect(dips.filter(d => d >= t && d < t + 1).length).toBeLessThanOrEqual(3)
  })

  it('a pulse bridge is out only in the dark, never in the warning or the light', () => {
    for (const p of sweep(0, BLACKOUT.period)) {
      if (p.out) expect(p.u).toBeGreaterThan(BLACKOUT.warn)
      if (p.warning) expect(p.out).toBe(false)
    }
  })
})
