import { AdditiveBlending, Color, Group, Mesh, MeshBasicMaterial, type BufferGeometry } from 'three'
import { rbox, rcyl, torus, xform, paint, merge } from '../kit'
import { toonVC, outlineMat } from '../toon'

/**
 * The Blackout Boulevard's props (`sim/stages/neon.ts`):
 *
 *  - a bridge of light: a glowing slab with a bright rim, solid only while
 *    lit; dark, only a faint outline of it is left, so a player still sees
 *    where it will be;
 *  - a light switch: a round wall plate whose ring shows which group of its
 *    room's bridges is lit (magenta: group 0, cyan: group 1).
 */

export const NEON_A = '#ff3fd2'
export const NEON_B = '#3ff4ff'

export interface BridgeMesh {
  root: Group
  slab: MeshBasicMaterial
  rim: MeshBasicMaterial
}

/** A w × d bridge of light, its top at the group's origin. */
export const buildBridge = (w: number, d: number, color: string): BridgeMesh => {
  const root = new Group()
  const slab = new MeshBasicMaterial({ color: new Color(color), transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false, toneMapped: false })
  const s = new Mesh(rbox(w - 0.08, 0.16, d - 0.08, 0.05, 4, 2), slab)
  s.position.y = -0.08
  root.add(s)
  const rim = new MeshBasicMaterial({ color: new Color(color), toneMapped: false })
  const edge: BufferGeometry[] = []
  for (const sx of [-1, 1]) edge.push(xform(rbox(0.08, 0.08, d - 0.04, 0.3), [sx * (w / 2 - 0.06), 0, 0]))
  for (const sz of [-1, 1]) edge.push(xform(rbox(w - 0.04, 0.08, 0.08, 0.3), [0, 0, sz * (d / 2 - 0.06)]))
  root.add(new Mesh(merge(edge), rim))
  return { root, slab, rim }
}

export interface SwitchMesh {
  root: Group
  ring: MeshBasicMaterial
}

let plateGeo: BufferGeometry | null = null

/** A light switch facing +Z. */
export const buildSwitch = (): SwitchMesh => {
  if (!plateGeo) {
    plateGeo = merge([
      xform(paint(rcyl(0.4, 0.1, 0.03, 24), '#20202e'), [0, 0, 0.05], [Math.PI / 2, 0, 0]),
      xform(paint(rbox(0.16, 0.32, 0.08, 0.3), '#d8dde8'), [0, 0.06, 0.12], [0.35, 0, 0])
    ])
  }
  const root = new Group()
  root.add(new Mesh(plateGeo, toonVC()))
  const o = new Mesh(plateGeo, outlineMat(0.02))
  o.renderOrder = -1
  root.add(o)
  const ring = new MeshBasicMaterial({ color: new Color(NEON_A), toneMapped: false })
  const r = new Mesh(torus(0.42, 0.045, 6, 28), ring)
  r.position.z = 0.12
  root.add(r)
  return { root, ring }
}
