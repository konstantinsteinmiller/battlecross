import { Group, Mesh, type BufferGeometry } from 'three'
import { rbox, xform, paint, merge } from '../kit'
import { toonVC, outlineMat } from '../toon'
import { CELL } from '../../world/levelGen'

/**
 * A crumbling platform (`sim/stages/crumble.ts`): a slab of worn plating on
 * two rusty girders, split across by dark cracks and edged with hazard
 * amber, so it reads as "this one will not hold" before it is ever stood on.
 * One cell by default; `w`, `d` in cells. The mesh is shared per size.
 */
const cache = new Map<string, BufferGeometry>()

const SLAB = '#8c7a66'
const SLAB_DARK = '#5e5144'
const CRACK = '#1c1812'
const EDGE = '#ffb22a'
const GIRDER = '#6a4a36'

export const CRUMBLE_THICK = 0.42

export const buildCrumble = (w = 1, d = 1): Group => {
  const key = `${w}x${d}`
  let geo = cache.get(key)
  if (!geo) {
    const sx = w * CELL - 0.12
    const sz = d * CELL - 0.12
    const parts: BufferGeometry[] = [
      xform(paint(rbox(sx, CRUMBLE_THICK, sz, 0.12, 4, 2), SLAB), [0, -CRUMBLE_THICK / 2, 0]),
      // Plate seams: a slightly darker inset, so the slab reads as panels.
      xform(paint(rbox(sx * 0.46, 0.04, sz * 0.9, 0.05, 4, 2), SLAB_DARK), [-sx * 0.25, 0.005, 0]),
      xform(paint(rbox(sx * 0.46, 0.04, sz * 0.9, 0.05, 4, 2), SLAB_DARK), [sx * 0.25, 0.005, 0]),
      // Cracks across the top.
      xform(paint(rbox(sx * 0.7, 0.05, 0.07, 0.02, 4, 2), CRACK), [0.1, 0.02, sz * 0.12], [0, 0.35, 0]),
      xform(paint(rbox(sx * 0.4, 0.05, 0.06, 0.02, 4, 2), CRACK), [-sx * 0.2, 0.02, -sz * 0.2], [0, -0.6, 0]),
      xform(paint(rbox(0.06, 0.05, sz * 0.35, 0.02, 4, 2), CRACK), [sx * 0.28, 0.02, -sz * 0.08], [0, 0.2, 0]),
      // Hazard amber on the two edges a player walks on to it from.
      xform(paint(rbox(sx, 0.06, 0.16, 0.03, 4, 2), EDGE), [0, 0.01, sz / 2 - 0.1]),
      xform(paint(rbox(sx, 0.06, 0.16, 0.03, 4, 2), EDGE), [0, 0.01, -sz / 2 + 0.1]),
      // Girders underneath.
      xform(paint(rbox(0.3, 0.5, sz * 0.9, 0.08, 4, 2), GIRDER), [-sx * 0.3, -CRUMBLE_THICK - 0.22, 0]),
      xform(paint(rbox(0.3, 0.5, sz * 0.9, 0.08, 4, 2), GIRDER), [sx * 0.3, -CRUMBLE_THICK - 0.22, 0])
    ]
    geo = merge(parts)
    cache.set(key, geo)
  }
  const root = new Group()
  root.add(new Mesh(geo, toonVC()))
  const o = new Mesh(geo, outlineMat(0.03))
  o.renderOrder = -1
  root.add(o)
  return root
}
