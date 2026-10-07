import { describe, expect, it } from 'vitest'
import { EDGE_FROM, EDGE_STRENGTH, EDGE_SUB, EDGE_TO, edgeField, edgeHaze } from '@/game/gfx/edgeFog'
import { generateZone } from '@/game/sim/zoneGen'
import { ZONES, ZONE_IDS } from '@/game/data/zones'

/**
 * The haze past the walkable edge (roadmap #83): it deepens smoothly with the
 * distance from where the hero can walk, with no step a player sees as a
 * contour line, and never touches the playfield itself.
 */

const MARGIN = 18

describe('the edge haze', () => {
  it('eases from nothing to its full depth: no haze on the walkable, none of it a step', () => {
    expect(edgeHaze(0)).toBe(0)
    expect(edgeHaze(EDGE_FROM)).toBe(0)
    expect(edgeHaze(EDGE_TO)).toBeCloseTo(EDGE_STRENGTH, 6)
    expect(edgeHaze(100)).toBeCloseTo(EDGE_STRENGTH, 6)
    let prev = 0
    for (let d = 0; d <= 30; d += 0.05) {
      const k = edgeHaze(d)
      expect(k).toBeGreaterThanOrEqual(prev - 1e-9)
      prev = k
    }
  })

  for (const zone of ZONE_IDS) {
    it(`${zone}: the field is zero where the hero walks and rises without a jump away from it`, () => {
      const plan = generateZone(ZONES[zone], 7)
      const { w, h, solid } = plan
      const f = edgeField((i, j) => !solid[j * w + i], w, h, MARGIN)
      const at = (a: number, b: number): number => f.data[b * f.nx + a]!
      // On the walkable, deep inside it: none.
      for (let j = 1; j < h - 1; j++) {
        for (let i = 1; i < w - 1; i++) {
          let open = true
          for (let dj = -1; dj <= 1 && open; dj++) for (let di = -1; di <= 1; di++) if (solid[(j + dj) * w + i + di]) { open = false; break }
          if (!open) continue
          const a = (i + MARGIN) * EDGE_SUB + 1
          const b = (j + MARGIN) * EDGE_SUB + 1
          expect(edgeHaze(at(a, b)), `${zone} cell ${i},${j}`).toBe(0)
        }
      }
      // Along every row and column, the haze between neighbouring samples
      // (0.75 m apart) never steps by more than a soft gradient does.
      let worst = 0
      for (let b = 0; b < f.nz; b++) {
        for (let a = 1; a < f.nx; a++) worst = Math.max(worst, Math.abs(edgeHaze(at(a, b)) - edgeHaze(at(a - 1, b))))
      }
      for (let a = 0; a < f.nx; a++) {
        for (let b = 1; b < f.nz; b++) worst = Math.max(worst, Math.abs(edgeHaze(at(a, b)) - edgeHaze(at(a, b - 1))))
      }
      expect(worst, zone).toBeLessThan(0.1)
      // Far out past the grid it is full.
      expect(edgeHaze(at(0, 0))).toBeCloseTo(EDGE_STRENGTH, 3)
    })
  }
})
