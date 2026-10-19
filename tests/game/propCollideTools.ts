import type { BufferGeometry } from 'three'
import type { Grid } from '@/game/sim/grid'
import { footOf, footPoints, spillOf } from '@/game/gfx/footprint'
import { BODY_H, GROUND_H } from '@/game/gfx/propRoles'

/**
 * Tools for `propCollide*.test.ts`: how far a drawn prop reaches past the walk
 * grid's colliders (`colliderDist`), from its geometry as the game draws it.
 */

/**
 * The spill (m) of parts already in the world (a merged level prop, a town's
 * prop out of its kit): what of them stands below a body's height over the
 * ground at their middle (above what is walked over), against the colliders.
 * 0: all of it on them.
 */
export const worldSpill = (g: Grid, parts: readonly BufferGeometry[], groundAt: (x: number, z: number) => number): { spill: number; x: number; z: number } => {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity
  for (const p of parts) {
    p.computeBoundingBox()
    const b = p.boundingBox!
    x0 = Math.min(x0, b.min.x); x1 = Math.max(x1, b.max.x)
    z0 = Math.min(z0, b.min.z); z1 = Math.max(z1, b.max.z)
  }
  const x = (x0 + x1) / 2
  const z = (z0 + z1) / 2
  const y = groundAt(x, z)
  const local = parts.map(p => p.clone().translate(-x, -y, -z))
  const spill = spillOf(g, footPoints(footOf(local, BODY_H, GROUND_H)), x, z, 0, 1)
  for (const p of local) p.dispose()
  return { spill, x, z }
}
