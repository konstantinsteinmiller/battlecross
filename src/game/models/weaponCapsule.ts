import {
  Group, Mesh, MeshBasicMaterial, AdditiveBlending, Color, DoubleSide, CylinderGeometry, Float32BufferAttribute,
  Shape, ExtrudeGeometry, type BufferGeometry
} from 'three'
import { rcyl, rcone, torus, sph, cap, ell, rbox, lathe, xform, paint, merge } from './kit'
import { toonVC, glowVC, outlineMat } from './toon'
import { WEAPONS, type WeaponId } from '../data/weapons'

/**
 * ─── The borrowed-weapon capsule ─────────────────────────────────────────────
 *
 * A Core Master's power, left on a pedestal for Flux to take (`sim/borrowed.ts`).
 * It must never be mistaken for the small red/blue health and energy pills or
 * a bolt, so it borrows nothing from them: it stands UPRIGHT, it is big, and
 * everything on it wears the weapon's own colour —
 *
 *   - a squat emitter plate on the floor, its lens lit;
 *   - a column of light out of the plate, bright at the foot and gone at the
 *     top (black under additive blending adds nothing, so the fade needs no
 *     texture), so the capsule is seen from across a room and over a crowd;
 *   - an upright glass capsule hovering over it, steel end rings, the
 *     weapon's orb glowing inside;
 *   - a small hologram of the weapon over the capsule — the spread's three
 *     shards, a flame, a lance, a lightning bolt, three leaves — so which
 *     power it is reads before the pickup;
 *   - a tilted halo ring spinning round it: "take me".
 *
 * Ten small draws, one or two capsules a map, hung under their room's group
 * so portal culling hides them with it. The mission animates `float`, `halo`
 * and the materials (`sim/borrowed.ts`), and nothing here allocates per frame.
 */

export interface WeaponCapsuleMesh {
  /** On the floor at the capsule's spot. */
  root: Group
  /** The hovering part (shell, orb, hologram, halo): bobs and turns. */
  float: Group
  /** The tilted ring: spins on its own axis inside `float`. */
  halo: Group
  /** The weapon's glyph over the capsule: counter-turns and flickers. */
  holo: Mesh
  columnMat: MeshBasicMaterial
  shellMat: MeshBasicMaterial
  holoMat: MeshBasicMaterial
  haloMat: MeshBasicMaterial
}

/** Where the capsule hovers (m over its floor) and the column's height. */
export const CAPSULE_HOVER = 1.15
const COLUMN_H = 3.6

const additive = (color: string, opacity: number, vertexColors = false): MeshBasicMaterial => new MeshBasicMaterial({
  color: new Color(color), vertexColors, transparent: true, opacity, blending: AdditiveBlending,
  depthWrite: false, side: DoubleSide, toneMapped: false, fog: false
})

/** An open tube whose vertex colour fades from white at the foot to black at
 *  the top: under additive blending the top simply stops glowing. */
const fadeColumn = (rBottom: number, rTop: number, h: number): BufferGeometry => {
  const g = new CylinderGeometry(rTop, rBottom, h, 18, 4, true)
  g.deleteAttribute('uv')
  const pos = g.attributes.position!
  const col = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const k = pos.getY(i) / h + 0.5 // 0 at the foot, 1 at the top
    const v = (1 - k) * (1 - k)
    col[i * 3] = v
    col[i * 3 + 1] = v
    col[i * 3 + 2] = v
  }
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  g.translate(0, h / 2, 0)
  return g
}

/** The weapon's glyph, about 0.3 m tall, centred on the origin (white: the
 *  material carries the colour). One silhouette per verb. */
const glyph = (id: WeaponId): BufferGeometry => {
  const W = '#ffffff'
  const parts: BufferGeometry[] = []
  switch (id) {
    case 'scrapBurst':
      // Three shards fanning out: the spread.
      for (const a of [-0.55, 0, 0.55]) {
        parts.push(xform(paint(rbox(0.07, 0.16, 0.07, 0.3, 8, 6), W), [Math.sin(a) * 0.12, Math.cos(a) * 0.08, 0], [0, 0, -a]))
      }
      break
    case 'flameWave':
      // A flame: a fat drop with a smaller tongue licking off it.
      parts.push(xform(paint(lathe([[0, -0.14], [0.1, -0.08], [0.09, 0.02], [0.04, 0.12], [0, 0.18]], 12), W), [0, 0, 0]))
      parts.push(xform(paint(ell(0.035, 0.07, 0.035, 8, 6), W), [0.08, 0.06, 0], [0, 0, -0.5]))
      break
    case 'iceLance':
      // A lance: a long diamond, point up.
      parts.push(paint(lathe([[0, -0.18], [0.05, -0.1], [0.04, 0.1], [0, 0.2]], 8), W))
      break
    case 'thunderArc': {
      // A lightning bolt, the flat classic: a slab cut in a zigzag (bars at
      // slants read as a cross at this size).
      const s = new Shape()
      const pts: Array<[number, number]> = [[-0.02, 0.19], [0.09, 0.19], [0.03, 0.05], [0.1, 0.05], [-0.06, -0.19], [-0.01, -0.02], [-0.08, -0.02]]
      s.moveTo(pts[0]![0], pts[0]![1])
      for (const [x, y] of pts.slice(1)) s.lineTo(x, y)
      s.closePath()
      const g = new ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false })
      g.deleteAttribute('uv')
      g.translate(0, 0, -0.025)
      g.computeVertexNormals()
      return paint(g, W)
    }
    case 'magnetPull':
      // A horseshoe opening up, its two pole tips.
      parts.push(xform(paint(torus(0.1, 0.035, 6, 14, Math.PI), W), [0, -0.02, 0], [0, 0, Math.PI]))
      for (const s of [-1, 1]) parts.push(xform(paint(rcyl(0.035, 0.14, 0.01, 8), W), [s * 0.1, 0.05, 0]))
      break
    case 'drillBomb':
      // A drill bit pointing down, banded.
      parts.push(xform(paint(rcone(0.1, 0.01, 0.3, 0.01, 10), W), [0, -0.04, 0], [Math.PI, 0, 0]))
      parts.push(xform(paint(rcyl(0.045, 0.1, 0.01, 8), W), [0, 0.16, 0]))
      break
    case 'galeGuard':
      // Three leaves round a centre: the orbit.
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2
        parts.push(xform(paint(ell(0.1, 0.022, 0.05, 10, 6), W), [Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0], [0, 0, a + Math.PI / 2]))
      }
      break
  }
  return merge(parts)
}

export const buildWeaponCapsule = (id: WeaponId): WeaponCapsuleMesh => {
  const def = WEAPONS[id]
  const color = def.color
  const root = new Group()

  // ── The emitter plate on the floor ──
  const plate = merge([
    xform(paint(rcyl(0.5, 0.14, 0.05, 20), '#2c3244'), [0, 0.07, 0]),
    xform(paint(rcyl(0.36, 0.06, 0.02, 20), def.shell), [0, 0.15, 0])
  ])
  const plateMesh = new Mesh(plate, toonVC())
  const plateLine = new Mesh(plate, outlineMat(0.02))
  plateLine.renderOrder = -1
  const lens = new Mesh(xform(paint(rcyl(0.28, 0.03, 0.01, 20), color), [0, 0.185, 0]), glowVC())
  root.add(plateMesh, plateLine, lens)

  // ── The column of light ──
  const columnMat = additive(color, 0.32, true)
  const column = new Mesh(fadeColumn(0.3, 0.42, COLUMN_H), columnMat)
  column.position.y = 0.18
  root.add(column)

  // ── The hovering capsule ──
  const float = new Group()
  float.position.y = CAPSULE_HOVER
  root.add(float)
  // Steel end rings (white on top, the weapon's shell tint below) with an
  // outline, so the capsule has a hard toon edge like every other pickup.
  const rings = merge([
    xform(paint(torus(0.2, 0.06, 8, 20), '#f4f7ff'), [0, 0.28, 0], [Math.PI / 2, 0, 0]),
    xform(paint(sph(0.09, 10, 6), '#f4f7ff'), [0, 0.36, 0]),
    xform(paint(torus(0.2, 0.06, 8, 20), def.shell), [0, -0.28, 0], [Math.PI / 2, 0, 0]),
    xform(paint(sph(0.09, 10, 6), def.shell), [0, -0.36, 0])
  ])
  const ringMesh = new Mesh(rings, toonVC())
  const ringLine = new Mesh(rings, outlineMat(0.014))
  ringLine.renderOrder = -1
  // The glass: an additive shell in the weapon colour, faint.
  const shellMat = additive(color, 0.22)
  const shell = new Mesh(cap(0.22, 0.4, 16, 4), shellMat)
  // The orb inside: a white core in a coloured glow.
  const orb = new Mesh(merge([
    paint(sph(0.14, 12, 8), color),
    paint(sph(0.075, 10, 6), '#ffffff')
  ]), glowVC())
  float.add(ringMesh, ringLine, shell, orb)

  // ── The hologram over it ──
  const holoMat = additive(color, 0.85)
  const holo = new Mesh(glyph(id), holoMat)
  holo.position.y = 0.66
  holo.scale.setScalar(1.25)
  float.add(holo)

  // ── The halo ring ──
  // Tilted, and turned about the vertical (YXZ order: the tilt first), so
  // the ring wobbles round the capsule; three beads on it show the spin (a
  // plain ring turning in its own plane would look still).
  const halo = new Group()
  halo.rotation.order = 'YXZ'
  halo.rotation.x = 0.42
  const haloMat = additive(color, 0.9, true)
  const haloParts = [paint(xform(torus(0.5, 0.022, 6, 40), [0, 0, 0], [Math.PI / 2, 0, 0]), '#ffffff')]
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2
    haloParts.push(paint(xform(sph(0.05, 8, 6), [Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5]), '#ffffff'))
  }
  halo.add(new Mesh(merge(haloParts), haloMat))
  float.add(halo)

  return { root, float, halo, holo, columnMat, shellMat, holoMat, haloMat }
}
