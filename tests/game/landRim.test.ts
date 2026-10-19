import { describe, expect, it } from 'vitest'
import { GROUND_NEAR, LAND_RIM_IN, LAND_RIM_OUT, gridEdgeDist, landRimK } from '../../src/game/gfx/terrain'

const W = 40
const H = 30
/** The rim blend along a line crossing the grid's south edge at open ground (walkable all the way in). */
const ramp = (): number[] => {
  const out: number[] = []
  for (let z = H - 12; z <= H + 16; z += 0.25) out.push(landRimK(0, gridEdgeDist(20, z, W, H)))
  return out
}

describe('land beyond the grid: the rim colour eases in across the edge', () => {
  it('the blend straddles the grid edge: still clear well inside, full far out', () => {
    expect(LAND_RIM_IN).toBeGreaterThanOrEqual(3)
    expect(LAND_RIM_OUT).toBeGreaterThanOrEqual(8)
    expect(landRimK(0, gridEdgeDist(20, H - LAND_RIM_IN - 1, W, H))).toBe(0)
    expect(landRimK(0, gridEdgeDist(20, H + LAND_RIM_OUT, W, H))).toBe(1)
  })
  it('has no colour step at the grid edge', () => {
    const e = gridEdgeDist(20, H, W, H)
    expect(Math.abs(e)).toBe(0)
    expect(Math.abs(landRimK(0, gridEdgeDist(20, H + 0.01, W, H)) - landRimK(0, gridEdgeDist(20, H - 0.01, W, H)))).toBeLessThan(0.005)
  })
  it('never steps more than a quarter-cell can, and its slope has no kink', () => {
    const r = ramp()
    let maxSlope = 0
    for (let i = 1; i < r.length; i++) maxSlope = Math.max(maxSlope, Math.abs(r[i]! - r[i - 1]!))
    expect(maxSlope).toBeLessThan(0.06)
    let kink = 0
    for (let i = 2; i < r.length; i++) kink = Math.max(kink, Math.abs(r[i]! - 2 * r[i - 1]! + r[i - 2]!))
    expect(kink).toBeLessThan(0.02)
  })
  it('is the same blend at a corner, and monotonic outward', () => {
    let prev = -1
    for (let d = -LAND_RIM_IN; d <= LAND_RIM_OUT; d += 0.5) {
      const k = landRimK(0, gridEdgeDist(W + d, H + d, W, H))
      expect(k).toBeGreaterThanOrEqual(prev)
      prev = k
    }
  })
})

describe('the detailed ground carries the blend itself', () => {
  it('reaches past the grid by the whole blend, so the rim is full where the sheet beyond starts', () => {
    expect(landRimK(0, gridEdgeDist(W + LAND_RIM_OUT, 10, W, H))).toBe(1)
  })
  it('covers the surround out to where the rim colour is already full', () => {
    expect(landRimK(GROUND_NEAR, -LAND_RIM_IN - 5)).toBe(1)
    expect(GROUND_NEAR).toBeGreaterThanOrEqual(3)
  })
})
