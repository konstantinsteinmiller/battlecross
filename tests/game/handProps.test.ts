import { describe, expect, it } from 'vitest'
import { BackSide, type Mesh, type ShaderMaterial } from 'three'
import { handProp } from '@/game/gfx/rigs/handProps'
import type { HandProp } from '@/game/sim/townLife'

/**
 * What the townsfolk hold must read from the camera's height (on a phone too):
 * drawn bigger than life, the small ones most, each ringed in white inside a
 * thin dark edge.
 */
describe('hand props', () => {
  const kinds: HandProp[] = ['mug', 'bread', 'pipe', 'book', 'broom', 'hoe', 'ladle', 'stone', 'cloth', 'wrench']
  it('every kind has a shape, a white rim and a dark edge behind it', () => {
    for (const k of kinds) {
      const m = handProp(k)
      expect(m.geometry.attributes.position!.count, k).toBeGreaterThan(0)
      const hulls = m.children as Mesh[]
      expect(hulls.length, k).toBe(2)
      const [rim, edge] = hulls.map(h => h.material as ShaderMaterial)
      for (const h of [rim!, edge!]) expect(h.side).toBe(BackSide)
      expect(rim!.uniforms.uColor!.value.getHex(), k).toBe(0xffffff)
      // The dark edge lies outside the white rim.
      expect(edge!.uniforms.uThickness!.value, k).toBeGreaterThan(rim!.uniforms.uThickness!.value)
    }
  })

  it('the small things (a mug, bread, a pipe, a book) are drawn biggest', () => {
    for (const k of ['mug', 'bread', 'pipe', 'book'] as const) expect(handProp(k).scale.x, k).toBeGreaterThanOrEqual(2.2)
    for (const k of ['broom', 'hoe'] as const) expect(handProp(k).scale.x, k).toBeLessThan(2)
  })
})
