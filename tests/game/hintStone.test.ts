import { describe, expect, it } from 'vitest'
import { Matrix4, Vector3 } from 'three'
import { HINT_FRONT, HINT_LIFT, HINT_SLAB, HINT_TILT, hintStoneParts, hintWidth } from '@/game/gfx/levelProps'

/**
 * No part of the hint stone shows through its carved face. The collision fit
 * once squeezed the heap it leans on forward into its cells, and the heap came
 * out through the slab. Every rock vertex is taken into the slab's own frame
 * (the lean undone) and must not sit inside the slab or in front of its back
 * face where the face is visible (above the foot the propping stones touch).
 */
const FOOT = 0.25
const EPS = 0.02

describe('the hint stone', () => {
  for (const n of [2, 3, 4, 5]) {
    it(`no rock pokes through the slab (${n} symbols)`, () => {
      const x = 10, z = 20
      const { rocks } = hintStoneParts(x, z, n)
      const half = hintWidth(n) / 2
      const toSlab = new Matrix4().makeRotationX(HINT_TILT).setPosition(x, HINT_LIFT, z + HINT_FRONT).invert()
      const v = new Vector3()
      const bad: string[] = []
      rocks.forEach((g, k) => {
        const pos = g.getAttribute('position')
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(toSlab)
          const ly = v.y - HINT_SLAB.y
          const overFace = Math.abs(v.x) < half && v.y > FOOT && ly < HINT_SLAB.h / 2
          if (overFace && v.z > -HINT_SLAB.t / 2 - EPS) bad.push(`rock ${k} at (${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`)
        }
      })
      expect(bad.slice(0, 5)).toEqual([])
    })
  }
})
