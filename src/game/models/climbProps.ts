import { Group, Mesh, MeshBasicMaterial, Color, type BufferGeometry } from 'three'
import { rcyl, rcone, rbox, sph, torus, xform, paint, paintBy, merge } from './kit'
import { toonVC, glowVC, outlineMat } from './toon'
import type { Theme } from '../world/themes'

/**
 * The climb's moving props (`sim/climb.ts` drives them): lifts, crusher
 * pistons, scrap balls and the warning lamps. Static meshes, three draw calls
 * at most each (toon body, outline, glow) plus a lamp whose colour the sim
 * sets every frame — the lamps are the telegraphs, so each owns its material.
 */

const DANGER_YELLOW = '#ffc21a'
const DANGER_BLACK = '#1b1d24'

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

const lampMaterial = (hex: string): MeshBasicMaterial =>
  new MeshBasicMaterial({ color: new Color(hex), toneMapped: false })

const stripes = (per: number) => (x: number, y: number, z: number) =>
  (Math.floor((x + z + y * 0.6) * per) & 1 ? DANGER_YELLOW : DANGER_BLACK)

export interface LiftMesh {
  root: Group
  /** Corner lamps: green at rest, amber blinking on the move. */
  lampMat: MeshBasicMaterial
  /** A vertical lift's piston, drawn from the platform down (unit length,
   *  scaled in y by the sim to reach the shaft floor); null for a shuttle. */
  column: Mesh | null
}

/**
 * A lift platform, its top at the group's origin: a steel deck with a
 * hazard-striped rim and a lamp at each corner. A vertical lift stands on a
 * piston; a shuttle has glowing thrusters underneath.
 */
export const buildLift = (theme: Theme, hw: number, hd: number, vertical: boolean): LiftMesh => {
  const toon: BufferGeometry[] = []
  const glowG: BufferGeometry[] = []
  toon.push(xform(paint(rbox(hw * 2, 0.34, hd * 2, 0.22), theme.pilaster), [0, -0.17, 0]))
  toon.push(paintBy(xform(rbox(hw * 2 + 0.08, 0.2, hd * 2 + 0.08, 0.3), [0, -0.42, 0]), stripes(2.4)))
  toon.push(xform(paint(rbox(hw * 1.4, 0.05, hd * 1.4, 0.2), theme.crateTrim), [0, 0.005, 0]))
  if (!vertical) {
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      toon.push(xform(paint(rcone(0.32, 0.22, 0.4), theme.pipe), [sx * hw * 0.55, -0.7, sz * hd * 0.55]))
      glowG.push(xform(paint(sph(0.2, 10, 6), theme.accent), [sx * hw * 0.55, -0.95, sz * hd * 0.55]))
    }
  }
  const root = assemble(toon, glowG)
  const lampMat = lampMaterial('#8dff7a')
  const lampG = merge([[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) =>
    xform(sph(0.13, 10, 6), [sx! * (hw - 0.22), 0.1, sz! * (hd - 0.22)])))
  root.add(new Mesh(lampG, lampMat))
  let column: Mesh | null = null
  if (vertical) {
    // Unit length from y = 0 down to y = −1 under the deck.
    const g = paintBy(xform(rcyl(0.5, 1, 0.02, 16), [0, -0.5, 0]), (_x, y) => (Math.floor(-y * 6) & 1 ? theme.pipe : theme.pilaster))
    column = new Mesh(g, toonVC())
    column.position.y = -0.5
    root.add(column)
  }
  return { root, lampMat, column }
}

export interface CrusherMesh {
  root: Group
  /** The piston head; its local y = 0 is the head's underside. */
  head: Group
  /** The rod from the head up into the beam: unit length from y = 0 up,
   *  set each frame to span the gap (it telescopes). */
  rod: Mesh
  /** The warning lamp on the gantry beam. */
  lampMat: MeshBasicMaterial
}

/**
 * A piston crusher hanging from a gantry beam (the beam itself is level
 * geometry): a heavy striped head with teeth under it and the rod above it.
 * `beamY` is the beam's height over the head's rest (the group's origin is the
 * walkway floor under the head).
 */
export const buildCrusher = (theme: Theme, size: number, beamY: number): CrusherMesh => {
  const toon: BufferGeometry[] = []
  toon.push(paintBy(xform(rbox(size, 1.0, size, 0.25), [0, 0.62, 0]), stripes(1.8)))
  toon.push(xform(paint(rbox(size * 0.8, 0.3, size * 0.8, 0.3), theme.crateTrim), [0, 1.25, 0]))
  // Teeth: a row of blunt studs under the head, so it reads as a crusher.
  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) {
      toon.push(xform(paint(rcone(0.26, 0.1, 0.16), '#3a3f4e'), [a * size * 0.3, 0.05, b * size * 0.3], [Math.PI, 0, 0]))
    }
  }
  const head = assemble(toon, [xform(paint(sph(0.18, 10, 6), '#ff3a2a'), [0, 0.62, size / 2 + 0.02])])
  const root = new Group()
  root.add(head)
  const rod = new Mesh(paintBy(xform(rcyl(0.24, 1, 0.02, 12), [0, 0.5, 0]), (_x, y) => (Math.floor(y * 5) & 1 ? theme.pipe : theme.pilaster)), toonVC())
  root.add(rod)
  const lampMat = lampMaterial('#ffb02a')
  const lamp = new Mesh(merge([xform(sph(0.24, 12, 8), [0, beamY + 0.55, 0])]), lampMat)
  root.add(lamp)
  return { root, head, rod, lampMat }
}

export interface BallMesh {
  root: Group
  /** The ball itself, spun about its axle by the sim as it rolls. */
  spin: Group
}

/** A scrap ball: a dented steel sphere with two bands and blunt spikes. */
export const buildScrapBall = (theme: Theme, r: number): BallMesh => {
  const toon: BufferGeometry[] = []
  toon.push(paint(sph(r, 16, 12), '#5d6272'))
  toon.push(xform(paint(torus(r * 1.0, r * 0.12, 6, 20), theme.hazard), [0, 0, 0]))
  toon.push(xform(paint(torus(r * 1.0, r * 0.12, 6, 20), theme.hazard), [0, 0, 0], [Math.PI / 2, 0, 0]))
  const dirs: Array<[number, number, number]> = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
  for (const [x, y, z] of dirs) {
    const rot: [number, number, number] = y ? (y > 0 ? [0, 0, 0] : [Math.PI, 0, 0]) : x ? [0, 0, x > 0 ? -Math.PI / 2 : Math.PI / 2] : [z > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0]
    toon.push(xform(paint(rcone(r * 0.26, r * 0.06, r * 0.4), DANGER_BLACK), [x * r * 1.05, y * r * 1.05, z * r * 1.05], rot))
  }
  const spin = assemble(toon, [], 0.03)
  const root = new Group()
  root.add(spin)
  return { root, spin }
}

/**
 * An ember barrel (the blaze sector's scrap ball): a charred drum with glowing
 * seams and hot end caps, its axis along the axle it rolls about — X for a
 * lane along Z (`axleX`), else Z — so the sim spins it like the ball.
 */
export const buildEmberBarrel = (theme: Theme, r: number, axleX: boolean): BallMesh => {
  const toon: BufferGeometry[] = []
  const glowG: BufferGeometry[] = []
  const len = r * 2.1
  toon.push(paint(rcyl(r, len, r * 0.25, 18), '#3a2a26'))
  for (const s of [-0.3, 0.3]) toon.push(xform(paint(torus(r, r * 0.09, 6, 20), theme.pilaster), [0, s * len, 0], [Math.PI / 2, 0, 0]))
  for (const s of [-0.08, 0.08]) glowG.push(xform(paint(torus(r * 0.99, r * 0.05, 6, 20), '#ff7a1a'), [0, s * len, 0], [Math.PI / 2, 0, 0]))
  for (const s of [-1, 1]) glowG.push(xform(paint(rcyl(r * 0.55, 0.04, 0.01, 14), '#ffb04a'), [0, s * (len / 2 + 0.005), 0]))
  // Built along Y; laid along the axle.
  const drum = assemble(toon, glowG, 0.03)
  drum.rotation.set(axleX ? 0 : Math.PI / 2, 0, axleX ? Math.PI / 2 : 0)
  const spin = new Group()
  spin.add(drum)
  const root = new Group()
  root.add(spin)
  return { root, spin }
}

/** A lane's release lamp (under the hatch gantry): dark, amber, then red. */
export const buildLaneLamp = (): { root: Mesh; mat: MeshBasicMaterial } => {
  const mat = lampMaterial('#3a2a18')
  const root = new Mesh(sph(0.2, 12, 8), mat)
  return { root, mat }
}
