import {
  Group, Mesh, MeshBasicMaterial, AdditiveBlending, DoubleSide, Color, type BufferGeometry
} from 'three'
import { rcyl, rbox, torus, tube, xform, paint, paintBy, merge } from '../kit'
import { toonVC, outlineMat } from '../toon'
import { PAL } from '../palette'
import type { Particles, ParticleSpec } from '../../fx/particles'
import type { Theme } from '../../world/themes'

/**
 * ─── Stage vents: the nozzle and its jet ─────────────────────────────────────
 *
 * A vent (`Terrain.vents`, driven by `sim/stages/vents.ts`) is a nozzle in a
 * wall — a jet across the cell in front of it — or a grate in the floor — a
 * column over its own cell. Built in a local frame whose +Z is the jet's
 * way (a floor vent's is +Y), then turned onto it by the sim.
 *
 * The body is one toon mesh plus its outline; the mouth's lamp owns its
 * material (it is the telegraph); the jet is three nested open cones on
 * additive materials whose opacity and length the sim sets each frame, so
 * nothing is created while it runs. The look (`VentLook`) carries every
 * colour, so a frost thrower is the same nozzle with other colours.
 */

/** A vent's colours: the jet's three layers (outer to core), the lamp at
 *  rest, warning and roaring, and the motes it spits. */
export interface VentLook {
  jet: readonly [string, string, string]
  lampIdle: string
  lampWarn: string
  lampHot: string
  mote: string
}

export const FIRE_LOOK: VentLook = {
  jet: ['#ff5a1f', '#ffa23a', '#fff27a'],
  lampIdle: '#6a3414', lampWarn: '#ffb04a', lampHot: '#fff3c4', mote: '#ffb04a'
}

/** A wall jet's length and a floor column's height (m). */
export const JET_LEN = 3.1
export const COLUMN_H = 3.2

export interface VentMesh {
  root: Group
  /** The mouth's lamp: the sim colours it (dim, pulsing, white-hot). */
  lampMat: MeshBasicMaterial
  /** The jet group (its local +Y is the jet's way), scaled along Y by the
   *  sim as it flares, and its layers' materials (opacity per frame). */
  jet: Group
  layers: MeshBasicMaterial[]
  /** Spit `n` motes out of the mouth along the jet (the pooled particles,
   *  one scratch spec). */
  spit(n: number, speed: number): void
}

const additive = (hex: string): MeshBasicMaterial => new MeshBasicMaterial({
  color: new Color(hex), transparent: true, opacity: 0, blending: AdditiveBlending,
  depthWrite: false, side: DoubleSide, toneMapped: false
})

const assemble = (parts: BufferGeometry[]): Group => {
  const g = new Group()
  const geo = merge(parts)
  g.add(new Mesh(geo, toonVC()))
  const o = new Mesh(geo, outlineMat(0.025))
  o.renderOrder = -1
  g.add(o)
  return g
}

/**
 * A vent at world (x, y, z) — a wall vent's mouth on its wall, a floor
 * vent's grate centre — jetting along the unit (dx, dz), or straight up
 * when both are 0.
 */
export const buildVent = (
  theme: Theme, look: VentLook, fx: Particles, x: number, y: number, z: number, dx: number, dz: number
): VentMesh => {
  const wall = dx !== 0 || dz !== 0
  const root = new Group()
  root.position.set(x, y, z)
  if (wall) root.rotation.y = Math.atan2(dx, dz)
  const stripes = (px: number, py: number) => (Math.floor((px + py) * 3) & 1 ? theme.hazard : theme.crateTrim)
  const toon: BufferGeometry[] = []
  let lampGeo: BufferGeometry
  if (wall) {
    // A block on the wall, a striped collar, a stubby nozzle out of it.
    toon.push(xform(paint(rbox(1.1, 1.3, 0.4, 0.3), theme.pilaster), [0, 0, 0.2]))
    toon.push(paintBy(xform(rbox(1.2, 0.24, 0.46, 0.3), [0, -0.66, 0.22]), stripes))
    toon.push(xform(paint(rcyl(0.24, 0.4, 0.06, 14), PAL.gunmetal), [0, 0, 0.55], [Math.PI / 2, 0, 0]))
    lampGeo = xform(torus(0.2, 0.05, 6, 16), [0, 0, 0.76])
  } else {
    // A round grate flush with the floor, a striped rim, the nozzle ring.
    toon.push(xform(paint(rcyl(1.0, 0.1, 0.04, 24), PAL.gunmetal), [0, 0.03, 0]))
    toon.push(paintBy(xform(torus(1.02, 0.08, 6, 28), [0, 0.07, 0], [Math.PI / 2, 0, 0]), (px, _py, pz) => stripes(Math.atan2(pz, px) * 1.2, 0)))
    for (let n = 0; n < 4; n++) {
      toon.push(xform(paint(rbox(1.7, 0.05, 0.1, 0.2), theme.crateTrim), [0, 0.09, -0.6 + n * 0.4]))
    }
    lampGeo = xform(torus(0.3, 0.06, 6, 18), [0, 0.12, 0], [Math.PI / 2, 0, 0])
  }
  root.add(assemble(toon))
  const lampMat = new MeshBasicMaterial({ color: new Color(look.lampIdle), toneMapped: false })
  root.add(new Mesh(lampGeo, lampMat))
  // The jet: open cones along +Y from the mouth; a wall jet is laid along +Z.
  const jet = new Group()
  const len = wall ? JET_LEN : COLUMN_H
  const layers: MeshBasicMaterial[] = []
  const sizes = wall ? [[0.3, 1.05, 1], [0.24, 0.72, 0.85], [0.16, 0.4, 0.6]] : [[0.5, 1.15, 1], [0.4, 0.8, 0.85], [0.26, 0.45, 0.6]]
  sizes.forEach(([r0, r1, l], n) => {
    const mat = additive(look.jet[n]!)
    layers.push(mat)
    const h = len * l!
    jet.add(new Mesh(xform(tube(r1!, r0!, h, 16), [0, h / 2, 0]), mat))
  })
  if (wall) {
    jet.rotation.x = Math.PI / 2
    jet.position.z = 0.7
  }
  jet.visible = false
  root.add(jet)
  // Motes: world-space velocities along the jet, through one scratch spec.
  const mote = new Color(look.mote)
  const spec: ParticleSpec = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, color: mote, size: 0.45, sizeEnd: 0.08, life: 0.35, gravity: 0, drag: 0.5 }
  const ox = wall ? x + dx * 0.75 : x
  const oz = wall ? z + dz * 0.75 : z
  const oy = wall ? y : y + 0.2
  const spit = (n: number, speed: number): void => {
    for (let k = 0; k < n; k++) {
      const a = (Math.random() - 0.5) * 0.9
      const b = (Math.random() - 0.5) * 0.9
      spec.x = ox
      spec.y = oy
      spec.z = oz
      if (wall) {
        spec.vx = dx * speed - dz * a * speed * 0.3
        spec.vz = dz * speed + dx * a * speed * 0.3
        spec.vy = b * speed * 0.3
      } else {
        spec.vx = a * speed * 0.3
        spec.vz = b * speed * 0.3
        spec.vy = speed
      }
      spec.size = 0.35 + Math.random() * 0.3
      fx.emit(spec)
    }
  }
  return { root, lampMat, jet, layers, spit }
}
