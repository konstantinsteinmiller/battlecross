import { describe, expect, it } from 'vitest'
import { ShaderMaterial } from 'three'
import { WAY_GAP, WAY_MAX, WayMarks, layoutWay } from '@/game/gfx/wayMarks'

describe('the coach way chevrons lie on the ground', () => {
  it('is a depth-tested, depth-write-free decal pulled toward the camera (never a layer above the scene, never coplanar opaque)', () => {
    const w = new WayMarks()
    const m = w.mesh.material as ShaderMaterial
    expect(m.depthTest).toBe(true)
    expect(m.depthWrite).toBe(false)
    expect(m.transparent).toBe(true)
    expect(m.polygonOffset).toBe(true)
    expect(m.polygonOffsetFactor).toBeLessThan(0)
    w.dispose()
  })

  it('stands the chevrons along the walked way, pointing at the goal, clear of both ends', () => {
    const out = new Float32Array(WAY_MAX * 4)
    // From (0,0) east 10 m, then south 10 m.
    const k = layoutWay(0, 0, [10, 0, 10, 10], 2, 0, out)
    expect(k).toBeGreaterThan(5)
    for (let i = 0; i < k; i++) {
      const x = out[i * 4]!, z = out[i * 4 + 1]!, a = out[i * 4 + 2]!, al = out[i * 4 + 3]!
      const onFirst = Math.abs(z) < 1e-4 && x <= 10 + 1e-4
      const onSecond = Math.abs(x - 10) < 1e-4 && z >= -1e-4
      expect(onFirst || onSecond).toBe(true)
      expect(a).toBeCloseTo(onFirst && !(Math.abs(x - 10) < 1e-4) ? 0 : Math.PI / 2, 5)
      expect(al).toBeGreaterThanOrEqual(0)
      expect(al).toBeLessThanOrEqual(1)
      if (i) expect(Math.hypot(x - out[i * 4 - 4]!, z - out[i * 4 - 3]!)).toBeLessThanOrEqual(WAY_GAP + 1e-3)
    }
    // Short of the goal at (10, 10).
    expect(Math.hypot(out[(k - 1) * 4]! - 10, out[(k - 1) * 4 + 1]! - 10)).toBeGreaterThan(1)
  })

  it('draws nothing for a way too short to hold one, or none at all', () => {
    const out = new Float32Array(WAY_MAX * 4)
    expect(layoutWay(0, 0, [1, 0], 1, 0, out)).toBe(0)
    expect(layoutWay(0, 0, [], 0, 0, out)).toBe(0)
  })
})
