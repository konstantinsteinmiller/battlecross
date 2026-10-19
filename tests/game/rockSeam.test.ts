import { describe, expect, it } from 'vitest'
import { SphereGeometry } from 'three'
import { rock } from '@/game/gfx/kit'

/**
 * A rock is a closed stone: every vertex that sat on the same point of the
 * source sphere (the UV seam, the poles) lands on the same point of the rock,
 * whatever the seed and resolution. A seam that drifted apart showed the
 * ground through the stone.
 */
describe('rock seams', () => {
  const sizes: [number, number][] = [[9, 7], [10, 7], [8, 6], [7, 5]]
  it.each(sizes)('every seam and pole stays welded (%i × %i)', (ws, hs) => {
    const src = new SphereGeometry(1, ws, hs).attributes.position!
    for (let seed = 0; seed < 40; seed++) {
      const pos = rock(0.6, seed, ws, hs).attributes.position!
      const at = new Map<string, number>()
      for (let i = 0; i < src.count; i++) {
        const key = [src.getX(i), src.getY(i), src.getZ(i)].map(v => Math.round(v * 1e4) + 0).join()
        const j = at.get(key)
        if (j === undefined) { at.set(key, i); continue }
        expect(pos.getX(i)).toBeCloseTo(pos.getX(j), 6)
        expect(pos.getY(i)).toBeCloseTo(pos.getY(j), 6)
        expect(pos.getZ(i)).toBeCloseTo(pos.getZ(j), 6)
      }
    }
  })
})
