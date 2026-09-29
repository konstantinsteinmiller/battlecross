import { Group, Mesh, MeshBasicMaterial, Color, type BufferGeometry } from 'three'
import { rcyl, rbox, sph, xform, paint, paintBy, merge } from '../kit'
import { toonVC, glowVC, outlineMat } from '../toon'
import type { Theme } from '../../world/themes'

/**
 * The volt stage's props (`sim/stages/rail.ts`, `sim/stages/shock.ts` drive
 * them): the maglev rail, its cart and the electrified floor panels. Cheap
 * on purpose — the whole rail is one merged toon mesh (beams and pylons) and
 * one glow mesh (the live strips, flickered by the sim through its one
 * material), the cart three draw calls and a lamp, a panel a plate and its
 * grid. The sparks are the particle pool's (`fx/particles.ts`).
 */

const DANGER_YELLOW = '#ffc21a'
const DANGER_BLACK = '#1b1d24'

const stripes = (per: number) => (x: number, y: number, z: number) =>
  (Math.floor((x + z + y * 0.6) * per) & 1 ? DANGER_YELLOW : DANGER_BLACK)

const assemble = (toonParts: BufferGeometry[], glowParts: BufferGeometry[], outline = 0.03): Group => {
  const root = new Group()
  if (toonParts.length) {
    const g = merge(toonParts)
    root.add(new Mesh(g, toonVC()))
    const o = new Mesh(g, outlineMat(outline))
    o.renderOrder = -1
    root.add(o)
  }
  if (glowParts.length) root.add(new Mesh(merge(glowParts), glowVC()))
  return root
}

export interface RailMesh {
  root: Group
  /** The live strips along the beam: the sim flickers its colour. */
  stripMat: MeshBasicMaterial
}

/** Pylons stand under the beam about this far apart (m). */
const PYLON_EVERY = 9

/**
 * The rail along `points` (the cart's floor at each point): a beam just
 * under the deck with two live strips along its top, on pylons down to
 * `bottomAt(x, z)` (a floor under it, or the pit's bottom) where that is
 * more than a metre down.
 */
export const buildRail = (theme: Theme, points: ReadonlyArray<{ x: number; y: number; z: number }>, bottomAt: (x: number, z: number) => number): RailMesh => {
  const toon: BufferGeometry[] = []
  const strips: BufferGeometry[] = []
  let run = PYLON_EVERY / 2
  for (let n = 1; n < points.length; n++) {
    const a = points[n - 1]!
    const c = points[n]!
    const dx = c.x - a.x
    const dy = c.y - a.y
    const dz = c.z - a.z
    const h = Math.hypot(dx, dz)
    const len = Math.hypot(h, dy)
    if (len < 1e-4) continue
    // Along +X, pitched then turned onto the segment.
    const rot: [number, number, number] = [0, Math.atan2(-dz, dx), Math.atan2(dy, h)]
    const mid: [number, number, number] = [(a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2]
    toon.push(xform(paint(rbox(len + 0.12, 0.34, 0.62, 0.3, 8, 6), theme.pilaster), [mid[0], mid[1] - 0.62, mid[2]], rot))
    for (const side of [-1, 1]) {
      const sx = Math.sin(rot[1]) * side * 0.24
      const sz = Math.cos(rot[1]) * side * 0.24
      strips.push(xform(rbox(len + 0.1, 0.07, 0.1, 0.6, 6, 4), [mid[0] + sx, mid[1] - 0.43, mid[2] + sz], rot))
    }
    run += len
    if (run >= PYLON_EVERY) {
      run = 0
      const foot = bottomAt(c.x, c.z)
      const top = c.y - 0.75
      if (top - foot > 1) {
        const hgt = top - foot
        toon.push(paintBy(xform(rcyl(0.26, hgt, 0.05, 10), [c.x, foot + hgt / 2, c.z]), (_x, y) => (Math.floor(y * 0.8) & 1 ? theme.pipe : theme.pilaster)))
        toon.push(paintBy(xform(rbox(0.9, 0.3, 0.9, 0.4, 8, 6), [c.x, top, c.z]), stripes(2.2)))
      }
    }
  }
  const root = assemble(toon, [], 0.025)
  const stripMat = new MeshBasicMaterial({ color: new Color(theme.accent), toneMapped: false })
  if (strips.length) root.add(new Mesh(merge(strips), stripMat))
  return { root, stripMat }
}

export interface CartMesh {
  root: Group
  /** The magnet pads under the deck: bright while it rides. */
  padMat: MeshBasicMaterial
}

/**
 * The maglev cart, its deck top at the group's origin, facing −Z (the game's
 * forward at yaw 0): a hazard-striped deck with low side walls, a black
 * bumper with a lamp at the front, magnet pads glowing underneath.
 */
export const buildCart = (theme: Theme): CartMesh => {
  const toon: BufferGeometry[] = []
  const glowG: BufferGeometry[] = []
  toon.push(paintBy(xform(rbox(2.5, 0.36, 2.6, 0.25), [0, -0.2, 0]), stripes(1.6)))
  toon.push(xform(paint(rbox(2.2, 0.05, 2.3, 0.2), '#2a2d3e'), [0, 0.0, 0]))
  for (const sx of [-1, 1]) {
    toon.push(xform(paint(rbox(0.2, 0.62, 2.5, 0.3), DANGER_YELLOW), [sx * 1.18, 0.25, 0]))
    toon.push(xform(paint(rbox(0.26, 0.12, 2.6, 0.4), DANGER_BLACK), [sx * 1.18, 0.6, 0]))
  }
  toon.push(xform(paint(rbox(2.5, 0.42, 0.28, 0.35), DANGER_BLACK), [0, 0.12, -1.34]))
  toon.push(xform(paint(rbox(1.4, 0.3, 0.9, 0.35), theme.pilaster), [0, -0.52, 0]))
  glowG.push(xform(paint(sph(0.14, 10, 6), '#fff6c0'), [0.8, 0.2, -1.5]))
  glowG.push(xform(paint(sph(0.14, 10, 6), '#fff6c0'), [-0.8, 0.2, -1.5]))
  glowG.push(xform(paint(rbox(2.1, 0.05, 0.08, 0.5, 6, 4), theme.accent), [0, 0.2, 1.33]))
  const root = assemble(toon, glowG)
  const padMat = new MeshBasicMaterial({ color: new Color(theme.pipe), toneMapped: false })
  const pads = merge([-0.75, 0.75].map(sz => xform(rbox(1.7, 0.1, 0.5, 0.5, 8, 4), [0, -0.72, sz])))
  root.add(new Mesh(pads, padMat))
  return { root, padMat }
}

export interface ShockPanelMesh {
  root: Group
  /** The grid's colour: dark at rest, amber in the warning, white-hot live. */
  mat: MeshBasicMaterial
}

/**
 * An electrified floor panel filling a cell (`size` m square), its top a
 * few centimetres over the floor at the group's origin: a dark plate in a
 * hazard-striped frame, a glowing grid on it.
 */
export const buildShockPanel = (size: number): ShockPanelMesh => {
  const toon: BufferGeometry[] = []
  const s = size - 0.1
  toon.push(xform(paint(rbox(s, 0.06, s, 0.2, 8, 4), '#1d2038'), [0, 0.01, 0]))
  for (const [x, z, w, d] of [[0, -s / 2, s, 0.16], [0, s / 2, s, 0.16], [-s / 2, 0, 0.16, s], [s / 2, 0, 0.16, s]] as const) {
    toon.push(paintBy(xform(rbox(w, 0.08, d, 0.3, 8, 4), [x, 0.02, z]), stripes(2.4)))
  }
  const root = assemble(toon, [], 0.015)
  const grid: BufferGeometry[] = []
  for (let n = -1; n <= 1; n++) {
    grid.push(xform(rbox(s * 0.9, 0.03, 0.07, 0.6, 6, 4), [0, 0.05, n * s * 0.28]))
    grid.push(xform(rbox(0.07, 0.03, s * 0.9, 0.6, 6, 4), [n * s * 0.28, 0.05, 0]))
  }
  const mat = new MeshBasicMaterial({ color: new Color('#2a3a7a'), toneMapped: false })
  root.add(new Mesh(merge(grid), mat))
  return { root, mat }
}
