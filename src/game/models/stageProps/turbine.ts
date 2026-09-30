import { Group, Mesh, type BufferGeometry } from 'three'
import { rbox, rcyl, sph, torus, xform, paint, merge } from '../kit'
import { toonVC, outlineMat } from '../toon'

/**
 * A wind turbine for the Sky Docks' gusts (`sim/stages/wind.ts`): a big
 * ducted fan on a mast, facing down its wind. The wind used to come out of
 * nowhere; now the rotor spins up as a gust builds and coasts to a stop in
 * the calm, so the player sees where it blows from and when.
 * `rotor` spins about its local Z (the wind's way).
 */
export interface TurbineMesh {
  root: Group
  rotor: Group
}

let bodyGeo: BufferGeometry | null = null
let rotorGeo: BufferGeometry | null = null

const RING = '#dfe6f2'
const STRIPE = '#ffb22a'
const MAST = '#5d6a80'
const BLADE = '#f4f7fb'
const HUB = '#2a3140'

export const buildTurbine = (): TurbineMesh => {
  if (!bodyGeo) {
    bodyGeo = merge([
      // The mast and its foot.
      xform(paint(rcyl(0.22, 2.6, 0.08, 10), MAST), [0, 1.3, 0]),
      xform(paint(rbox(1.2, 0.3, 1.2, 0.1, 4, 2), MAST), [0, 0.15, 0]),
      // The duct: a thick ring with a hazard stripe, on the mast's top.
      xform(paint(torus(1.35, 0.22, 8, 24), RING), [0, 3.2, 0]),
      xform(paint(torus(1.36, 0.08, 6, 24), STRIPE), [0, 3.2, 0.18]),
      xform(paint(rbox(0.3, 0.5, 0.3, 0.05, 4, 2), MAST), [0, 2.75, 0])
    ])
  }
  if (!rotorGeo) {
    const parts: BufferGeometry[] = [xform(paint(sph(0.3, 12, 8), HUB), [0, 0, 0.05])]
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2
      parts.push(xform(paint(rbox(0.32, 1.12, 0.05, 0.05, 4, 2), BLADE), [Math.sin(a) * 0.62, Math.cos(a) * 0.62, 0], [0.35, 0, -a]))
    }
    rotorGeo = merge(parts)
  }
  const root = new Group()
  const add = (g: BufferGeometry, to: Group) => {
    to.add(new Mesh(g, toonVC()))
    const o = new Mesh(g, outlineMat(0.025))
    o.renderOrder = -1
    to.add(o)
  }
  add(bodyGeo, root)
  const rotor = new Group()
  rotor.position.set(0, 3.2, 0)
  add(rotorGeo, rotor)
  root.add(rotor)
  return { root, rotor }
}
