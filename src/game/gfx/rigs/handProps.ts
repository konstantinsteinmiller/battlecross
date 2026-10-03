import { Color, Matrix4, Mesh, type BufferGeometry, type Object3D } from 'three'
import type { HandProp } from '../../sim/townLife'
import { Mesher } from '../archKit'
import { celVC, outlineMat } from '../cel'

/**
 * ─── Things in a townsperson's hand (roadmap #42) ───────────────────────────
 *
 * A mug, a heel of bread, a pipe, a book, a broom, a hoe, a ladle, a wrench:
 * a tiny static mesh hung on the hand's bone (`weapon` or `offhand`) while the
 * activity lasts. Rig templates are cached by look (`lookKey`); giving every
 * activity its own template would multiply them, so the prop is a separate
 * mesh instead: one shared geometry per kind, one draw while it is held.
 *
 * Authored in the bone's frame: +Z runs from the grip along the forearm's
 * line when the hand hangs (the `weapon` bone of an empty hand), so "up" in
 * the hand is −Z.
 *
 * Seen from the camera's height a true-size mug is a speck: every prop is
 * drawn a good deal bigger than life (the small ones most), in brighter
 * colours than the clothes behind them, and ringed in white inside a thin dark
 * edge, so a drinker or a pipe smoker reads at a glance, on a phone too.
 */

const geos = new Map<HandProp, { lit: BufferGeometry; hull: BufferGeometry }>()

/** How much bigger than life each is drawn (the small ones most). */
const SIZE: Partial<Record<HandProp, number>> = { mug: 2.2, bread: 2.4, pipe: 2.6, book: 2.4, wrench: 2.4, ladle: 2.2, stone: 2.0, cloth: 2.0, broom: 1.8, hoe: 1.8 }
/** The white rim and the dark edge round it (object space, before the size). */
const RIM = 0.012
const EDGE = 0.019
const WHITE = new Color('#ffffff')

const build = (kind: HandProp): { lit: BufferGeometry; hull: BufferGeometry } => {
  const m = new Mesher()
  switch (kind) {
    case 'mug':
      // A wooden tankard, foam on top (the cup's axis along −Z: up in the hand).
      m.push(0, 0, -0.02, 0)
      m.pushMatrix(UPRIGHT)
      m.cyl(0, -0.05, 0, 0.075, 0.08, 0.17, 7, '#e8a648', '#fff4d8')
      m.cyl(0, 0.0, 0, 0.083, 0.083, 0.03, 7, '#8a5a30')
      m.cyl(0, 0.08, 0, 0.083, 0.083, 0.03, 7, '#8a5a30')
      m.ball(0, 0.12, 0, 0.07, '#ffffff', 6, 3, 0.55)
      m.box(0.07, -0.02, -0.02, 0.12, 0.09, 0.02, '#c8843a', '')
      m.pop()
      m.pop()
      break
    case 'bread':
      m.ball(0, 0.02, -0.06, 0.08, '#f0b458', 6, 4, 0.7)
      m.ball(0, 0.04, -0.12, 0.065, '#ffd078', 5, 3, 0.7)
      break
    case 'pipe':
      // A curved stem and a bowl, glowing a little.
      m.beam(0, 0, 0.02, 0, 0.02, -0.16, 0.025, '#9a6a3c', 0.025)
      m.cyl(0, 0.0, -0.17, 0.035, 0.04, 0.08, 6, '#b07440', '#ffa040')
      break
    case 'book':
      m.box(-0.11, -0.02, -0.16, 0.11, 0.03, 0.0, { top: '#fff6e0', side: '#ec5a3a', front: '#ec5a3a', back: '#ec5a3a', bottom: '#ec5a3a' }, '')
      m.box(-0.012, -0.025, -0.165, 0.012, 0.035, 0.005, '#d8b04a', '')
      break
    case 'broom':
      m.beam(0, 0, 0.35, 0, 0, -0.55, 0.035, '#a07848', 0.035)
      m.push(0, 0, 0.42, 0)
      m.cyl(0, -0.02, 0, 0.05, 0.13, 0.22, 7, '#d8b060')
      m.pop()
      break
    case 'hoe':
      m.beam(0, 0, 0.45, 0, 0, -0.5, 0.035, '#a07848', 0.035)
      m.box(-0.12, -0.02, 0.42, 0.12, 0.02, 0.52, '#c0c8d4', '')
      break
    case 'ladle':
      m.beam(0, 0, 0.32, 0, 0, -0.05, 0.025, '#a07848', 0.025)
      m.ball(0, 0, 0.36, 0.06, '#c0c8d4', 5, 3, 0.6)
      break
    case 'wrench':
      m.beam(0, 0, 0.18, 0, 0, -0.02, 0.03, '#c0c8d4', 0.03)
      m.box(-0.05, -0.02, 0.17, 0.05, 0.02, 0.24, '#c0c8d4', '')
      break
    case 'stone':
      m.ball(0, 0, 0.06, 0.09, '#9a8a74', 5, 4, 0.8)
      break
    case 'cloth':
      m.box(-0.12, -0.01, -0.02, 0.12, 0.01, 0.2, '#ffffff', '')
      break
    default:
      break
  }
  return { lit: m.build(), hull: m.welded() }
}

/** The prop mesh for a kind (shared geometry, shared material). */
export const handProp = (kind: HandProp): Mesh => {
  let g = geos.get(kind)
  if (!g) { g = build(kind); geos.set(kind, g) }
  const mesh = new Mesh(g.lit, celVC())
  mesh.frustumCulled = false
  mesh.scale.setScalar(SIZE[kind] ?? 1.8)
  // The white rim, and the dark edge round it (inverted hulls, drawn behind).
  for (const mat of [outlineMat(RIM, WHITE), outlineMat(EDGE)]) {
    const o = new Mesh(g.hull, mat)
    o.frustumCulled = false
    o.renderOrder = -1
    mesh.add(o)
  }
  return mesh
}

/** Put a prop on a bone (or take it off: `kind` ''). Returns the mesh now held. */
export const holdProp = (bone: Object3D | undefined, held: Mesh | null, kind: HandProp, cache: Map<HandProp, Mesh>): Mesh | null => {
  if (held && held.userData.kind === kind && held.parent === bone) return held
  if (held) held.removeFromParent()
  if (!kind || !bone) return null
  let m = cache.get(kind)
  if (!m) { m = handProp(kind); m.userData.kind = kind; cache.set(kind, m) }
  bone.add(m)
  return m
}

/** A cup standing on Y turned to stand along −Z (up in a hanging hand). */
const UPRIGHT = new Matrix4().makeRotationX(-Math.PI / 2)
