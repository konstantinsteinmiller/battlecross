import { Group, Mesh, Quaternion, Vector3, type BufferGeometry, type Scene } from 'three'
import { sfx } from '../audio/sfx'
import { sceneQuality } from '../engine/quality'
import { CATAPULT_FLIGHT, CATAPULT_WIND, RAM_BLOW_GAP } from '../data/assault'
import { ASSAULT_LAYOUT, BREACH_I0, BREACH_I1, PAL_I0, PAL_I1 } from '../sim/assaultMap'
import { CELL } from '../sim/grid'
import type { SimEvent } from '../sim/types'
import type { Sim } from '../sim/world'
import { celVC, glowVC, outlineMat } from './cel'
import { groundAt } from './ground'
import { merge, paint, rbox, rcone, rcyl, sph, xform } from './kit'
import type { Vfx } from './vfx'

/**
 * ─── The besieged gate of the Hollows (roadmap #204) ─────────────────────────
 *
 * What the field holds, drawn: the palisade across the cave mouth (its middle chunks tip over when
 * the breach comes), two wooden watchtowers with goblin archers on their platforms (they lean and
 * shudder under the ram, then fall toward the camera), two catapults whose arms crank back and
 * snap forward, and the ram, a log slung in a timber frame. The rebels' banners stand in the yard,
 * torches burn at the cave mouth. Arrows and stones fly as pooled meshes; dust and splinters are
 * the effects layer's particles. Nothing is allocated per frame.
 *
 * Each piece is built at the origin on flat ground, its front toward +Z (the camera); parts of one
 * piece never share a plane.
 */

const P = (g: BufferGeometry, hex: string, p?: [number, number, number], r?: [number, number, number], s?: number | [number, number, number]): BufferGeometry =>
  xform(paint(g, hex), p, r, s ?? 1)

export interface AssaultPieceGeo { lit: BufferGeometry[]; glow: BufferGeometry[] }

const OAK = '#7a5434'
const OAK2 = '#5d3e24'
const OAK3 = '#8c6540'
const IRON = '#3e3a3a'
const ROCK = '#77706a'
const ROCK2 = '#5b554f'
const HIDE = '#9a7a52'
const RED = '#b0302c'
const GOLD = '#e8b73a'

/** A watchtower: stone footing, four leaning legs with braces, a deck with a railing, a hide roof, a banner. 3 m across. */
const tower = (): AssaultPieceGeo => {
  const lit: BufferGeometry[] = [P(rbox(3.2, 0.34, 3.2, 0.2, 8, 4), ROCK2, [0, 0.17, 0])]
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    // The legs lean in toward the deck.
    lit.push(P(rcyl(0.14, 4.5, 0.04, 8, 1), OAK2, [sx * 1.28, 2.55, sz * 1.28], [sz * 0.05, 0, -sx * 0.05]))
    lit.push(P(rcyl(0.09, 1.4, 0.02, 6, 1), OAK2, [sx * 1.2, 5.5, sz * 1.2]))
  }
  // Cross braces on each face.
  for (const [dz, ry] of [[1.36, 0], [-1.36, 0], [1.36, Math.PI / 2], [-1.36, Math.PI / 2]] as const) {
    for (const s of [-1, 1]) lit.push(P(rbox(0.1, 3.6, 0.09, 0.3, 4, 4), OAK3, ry ? [dz, 2.5, 0.02 * s] : [0.02 * s, 2.5, dz], [0, ry, s * 0.62]))
  }
  // The deck, its railing, and the roof.
  lit.push(P(rbox(3.2, 0.28, 3.2, 0.2, 8, 4), OAK, [0, 4.64, 0]))
  for (const sz of [-1, 1]) lit.push(P(rbox(3.0, 0.75, 0.14, 0.25, 8, 4), OAK3, [0, 5.2, sz * 1.5]))
  for (const sx of [-1, 1]) lit.push(P(rbox(0.14, 0.75, 3.0, 0.25, 4, 8), OAK3, [sx * 1.5, 5.2, 0]))
  lit.push(P(rcone(2.5, 0.12, 1.15, 0.05, 4), HIDE, [0, 6.55, 0], [0, Math.PI / 4, 0]))
  // A banner at the corner, the goblins' green rag.
  lit.push(P(rcyl(0.04, 2.1, 0.01, 6, 1), OAK2, [1.45, 7.0, 1.45]))
  lit.push(P(rbox(0.7, 0.45, 0.03, 0.4, 4, 4), '#4a8a3a', [1.8, 7.7, 1.45]))
  return { lit, glow: [] }
}

/** The rubble of a fallen tower: broken beams and the footing. */
const rubble = (): AssaultPieceGeo => {
  const lit: BufferGeometry[] = [P(rbox(3.2, 0.34, 3.2, 0.2, 8, 4), ROCK2, [0, 0.17, 0])]
  const beams: Array<[number, number, number, number, number]> = [
    [-0.9, 0.9, 0.6, 0.5, 0.06], [0.8, 0.95, -0.5, -0.4, 0.08], [0.1, 1.1, 1.0, 1.2, -0.06], [-0.5, 1.3, -0.8, 0.2, 0.1], [1.1, 1.0, 0.9, -0.9, 0.05]
  ]
  for (const [x, y, z, ry, rz] of beams) lit.push(P(rbox(0.22, 1.6, 0.2, 0.3, 4, 4), OAK2, [x, y, z], [Math.PI / 2 - 0.08, ry, rz]))
  return { lit, glow: [] }
}

/** One chunk of palisade: stakes of different heights, sharpened, lashed to two rails. 3 m wide. */
const palisadeChunk = (seed: number): AssaultPieceGeo => {
  const lit: BufferGeometry[] = []
  for (let q = 0; q < 6; q++) {
    const x = -1.25 + q * 0.5
    const h = 2.6 + (((seed * 7 + q * 13) % 5) * 0.12)
    lit.push(P(rcyl(0.2, h, 0.05, 8, 1), q % 2 ? OAK : OAK3, [x, h / 2, 0]))
    lit.push(P(rcone(0.2, 0.03, 0.5, 0.02, 8), q % 2 ? OAK : OAK3, [x, h + 0.25, 0]))
  }
  for (const y of [0.7, 1.9]) lit.push(P(rbox(3.0, 0.16, 0.14, 0.3, 6, 3), OAK2, [0, y, 0.24]))
  return { lit, glow: [] }
}

/** One loose stake, standing on its own. */
const stakeOnly = (h: number, hex: string): AssaultPieceGeo => ({
  lit: [P(rcyl(0.2, h, 0.05, 8, 1), hex, [0, h / 2, 0]), P(rcone(0.2, 0.03, 0.5, 0.02, 8), hex, [0, h + 0.25, 0])],
  glow: []
})

/** Half a rail, lashed to the stakes behind it. */
const railHalf = (y: number): AssaultPieceGeo => ({ lit: [P(rbox(1.5, 0.16, 0.14, 0.3, 6, 3), OAK2, [0, y, 0.24])], glow: [] })

/** The cave mouth's frame: two stone jambs, a lintel, the darkness between, a torch at each jamb. */
const mouth = (): AssaultPieceGeo => {
  const lit: BufferGeometry[] = []
  for (const sx of [-1, 1]) {
    lit.push(P(rbox(1.5, 4.6, 1.5, 0.18, 8, 10), ROCK, [sx * 4.9, 2.3, 0]))
    lit.push(P(rbox(1.7, 0.7, 1.7, 0.2, 8, 4), ROCK2, [sx * 4.9, 0.35, 0.02]))
    lit.push(P(rcyl(0.05, 2.0, 0.01, 6, 1), OAK2, [sx * 3.95, 1.0, 0.95]))
  }
  lit.push(P(rbox(11.6, 1.1, 1.7, 0.18, 12, 4), ROCK2, [0, 5.0, 0]))
  lit.push(P(rbox(8.0, 4.3, 0.12, 0.2, 8, 4), '#0b0907', [0, 2.25, -0.55]))
  return { lit, glow: [P(rcone(0.2, 0.01, 0.5, 0.02, 8), '#ffb02a', [-3.95, 2.2, 0.95]), P(rcone(0.2, 0.01, 0.5, 0.02, 8), '#ffb02a', [3.95, 2.2, 0.95])] }
}

/** A catapult's frame and wheels (the arm is `catapultArm`). Facing +Z: the throw goes to -Z, toward the tower. */
const catapult = (): AssaultPieceGeo => {
  const lit: BufferGeometry[] = [
    P(rbox(2.4, 0.3, 3.0, 0.2, 8, 4), OAK2, [0, 0.62, 0]),
    P(rbox(0.28, 1.5, 0.28, 0.25, 6, 6), OAK, [-0.9, 1.4, 0.2]),
    P(rbox(0.28, 1.5, 0.28, 0.25, 6, 6), OAK, [0.9, 1.4, 0.2]),
    P(rbox(2.2, 0.22, 0.26, 0.3, 8, 4), OAK3, [0, 2.1, 0.2]),
    P(rbox(0.5, 0.3, 0.9, 0.3, 6, 4), OAK3, [0, 0.9, 1.2]),
    P(rcyl(0.04, 1.0, 0.01, 6, 1), IRON, [0, 0.5, 1.9])
  ]
  for (const sx of [-1, 1]) for (const sz of [-0.9, 0.9]) {
    lit.push(P(rcyl(0.5, 0.2, 0.06, 14, 1), '#3a2a1e', [sx * 1.3, 0.5, sz], [0, 0, Math.PI / 2]))
  }
  return { lit, glow: [] }
}

/** The throwing arm and its bucket, hinged at the origin (the post's top), the bucket at -Z. */
const catapultArm = (): AssaultPieceGeo => ({
  lit: [
    P(rbox(0.22, 0.24, 3.4, 0.3, 4, 8), OAK3, [0, 0, -1.0]),
    P(rcone(0.42, 0.28, 0.34, 0.05, 10), IRON, [0, 0.05, -2.55]),
    P(rbox(0.5, 0.5, 0.5, 0.25, 6, 6), '#4a4440', [0, 0, 0.75])
  ],
  glow: []
})

/** The lever the hero pulls: a post with a red grip, beside the catapult. */
const lever = (): AssaultPieceGeo => ({
  lit: [P(rbox(0.46, 0.2, 0.46, 0.3, 6, 3), ROCK2, [0, 0.1, 0]), P(rcyl(0.06, 1.0, 0.02, 6, 1), IRON, [0, 0.7, 0], [0.32, 0, 0]), P(sph(0.13, 8, 6), RED, [0, 1.19, -0.16])],
  glow: []
})

/** The ram: a wheeled frame with two A-frames and shield planks, the push-bars behind. Head toward +Z. */
const ram = (): AssaultPieceGeo => {
  const lit: BufferGeometry[] = [P(rbox(1.5, 0.22, 2.9, 0.3, 8, 4), OAK2, [0, 0.55, 0])]
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) lit.push(P(rcyl(0.34, 0.14, 0.04, 12, 1), '#3a2a1e', [sx * 0.86, 0.34, sz * 0.95], [0, 0, Math.PI / 2]))
    // The A-frames the log hangs from, and the shield planks along the sides.
    for (const sz of [-0.55, 0.55]) {
      lit.push(P(rbox(0.12, 1.9, 0.12, 0.3, 4, 4), OAK, [sx * 0.55, 1.5, sz], [0, 0, sx * 0.12]))
    }
    lit.push(P(rbox(0.08, 0.9, 2.5, 0.2, 4, 6), OAK3, [sx * 0.72, 1.15, 0]))
  }
  lit.push(P(rbox(1.1, 0.14, 0.14, 0.3, 6, 3), OAK, [0, 2.4, -0.55]))
  lit.push(P(rbox(1.1, 0.14, 0.14, 0.3, 6, 3), OAK, [0, 2.4, 0.55]))
  // The push-bars behind: where the hero walks.
  lit.push(P(rbox(1.3, 0.1, 0.1, 0.3, 6, 3), OAK, [0, 1.0, -1.45]))
  return { lit, glow: [] }
}

/** The hanging log with its iron head, hinged at the top beam (the origin), swinging along Z. */
const ramLog = (): AssaultPieceGeo => ({
  lit: [
    P(rcyl(0.2, 2.9, 0.05, 10, 1), OAK, [0, -1.0, 0.1], [Math.PI / 2, 0, 0]),
    P(rcone(0.3, 0.2, 0.46, 0.04, 10), IRON, [0, -1.0, 1.77], [Math.PI / 2, 0, 0]),
    P(rcyl(0.025, 1.4, 0.01, 6, 1), IRON, [0, -0.3, -0.45]),
    P(rcyl(0.025, 1.4, 0.01, 6, 1), IRON, [0, -0.3, 0.65])
  ],
  glow: []
})

/** A rebels' banner: a pole, a red cloth with a gold crown struck through by a black bar. */
const banner = (): AssaultPieceGeo => ({
  lit: [
    P(rcyl(0.05, 3.2, 0.01, 6, 1), OAK2, [0, 1.6, 0]),
    P(sph(0.09, 6, 5), GOLD, [0, 3.25, 0]),
    P(rbox(1.0, 1.25, 0.04, 0.4, 6, 6), RED, [0.55, 2.55, 0]),
    P(rbox(0.5, 0.18, 0.03, 0.3, 4, 3), GOLD, [0.55, 2.4, 0.04]),
    P(rbox(0.1, 0.22, 0.03, 0.4, 3, 3), GOLD, [0.34, 2.57, 0.04]),
    P(rbox(0.1, 0.28, 0.03, 0.4, 3, 3), GOLD, [0.55, 2.59, 0.04]),
    P(rbox(0.1, 0.22, 0.03, 0.4, 3, 3), GOLD, [0.76, 2.57, 0.04]),
    P(rbox(1.15, 0.1, 0.03, 0.4, 6, 3), '#16110f', [0.55, 2.5, 0.08], [0, 0, 0.62])
  ],
  glow: []
})

/** A stone for the catapults and an arrow, shared by every shot. */
const stone = (): BufferGeometry => P(sph(0.42, 10, 8), '#8a847c')
const arrow = (): BufferGeometry => merge([
  P(rcyl(0.018, 0.9, 0.005, 5, 1), '#c8b890', [0, 0, 0], [Math.PI / 2, 0, 0]),
  P(rcone(0.05, 0.005, 0.14, 0.01, 5), IRON, [0, 0, 0.5], [Math.PI / 2, 0, 0]),
  P(rbox(0.1, 0.012, 0.16, 0.4, 3, 3), '#9a3a30', [0, 0, -0.42])
])

/** Every besieged-gate piece, as the poke-through and coplanar audits read them. */
export const assaultPieceParts = (): Record<'tower' | 'rubble' | 'palisade' | 'mouth' | 'catapult' | 'arm' | 'lever' | 'ram' | 'log' | 'banner', AssaultPieceGeo> =>
  ({ tower: tower(), rubble: rubble(), palisade: palisadeChunk(1), mouth: mouth(), catapult: catapult(), arm: catapultArm(), lever: lever(), ram: ram(), log: ramLog(), banner: banner() })

const ease = (k: number): number => k * k * (3 - 2 * k)
const _v = new Vector3()
const _q = new Quaternion()
const _fwd = new Vector3(0, 0, 1)

interface Shot { mesh: Mesh; t: number; dur: number; x0: number; y0: number; z0: number; x1: number; y1: number; z1: number; arc: number; spin: number }

export class AssaultProps {
  private root = new Group()
  private geos: BufferGeometry[] = []
  private low = sceneQuality() === 'low'
  private towers: Group[] = []
  private rubbles: Group[] = []
  /** The breach's loose pieces (single stakes, halves of the rails): when each lets go, how far it tips, how it twists. */
  private chunks: Array<{ g: Group; t: number; delay: number; tip: number; twist: number; y0: number }> = []
  private arms: Group[] = []
  private ramG!: Group
  private logG!: Group
  private banners: Group[] = []
  private arrows: Shot[] = []
  private stones: Shot[] = []
  private shake = [0, 0]
  private landed = [false, false]
  private ringT = 0
  private breachT = -1
  private pulse = 0

  constructor(private sim: Sim, private vfx: Vfx, private trauma: (n: number) => void) {}

  /** One piece as a group: its body, its outline, its glowing parts. */
  private piece(p: AssaultPieceGeo, at: [number, number, number], ry = 0): Group {
    const g = new Group()
    if (p.lit.length) {
      const geo = merge(p.lit)
      this.geos.push(geo)
      const body = new Mesh(geo, celVC())
      const line = new Mesh(geo, outlineMat())
      line.renderOrder = -1
      g.add(body, line)
    }
    if (p.glow.length) {
      const geo = merge(p.glow)
      this.geos.push(geo)
      g.add(new Mesh(geo, glowVC()))
    }
    for (const m of g.children) m.frustumCulled = false
    g.position.set(at[0], at[1], at[2])
    g.rotation.y = ry
    this.root.add(g)
    return g
  }

  build(scene: Scene): void {
    const L = ASSAULT_LAYOUT
    // The palisade: the stakes outside the breach are one still piece; the chunks between the towers each tip over later.
    const z = L.wallZ
    for (let i = PAL_I0; i <= PAL_I1; i += 2) {
      const x = (i + 1) * CELL
      const inBreach = i >= BREACH_I0 && i + 1 <= BREACH_I1
      // A tower stands in the wall where a chunk would be.
      if (L.towers.some(t => Math.abs(t.x - x) < 0.1)) continue
      if (!inBreach) { this.piece(palisadeChunk(i), [x, groundAt(x, z), z + 0.0]); continue }
      // The breach is made of single stakes and half rails: each splinters away on its own.
      const mid = (BREACH_I0 + BREACH_I1 + 1) / 2 * CELL
      const rnd = (n: number): number => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
      const add = (geo: AssaultPieceGeo, px: number, n: number): void => {
        const g = this.piece(geo, [px, groundAt(px, z), z])
        this.chunks.push({ g, t: -1, delay: Math.abs(px - mid) * 0.05 + rnd(n) * 0.35, tip: 1.05 + rnd(n + 3) * 0.5, twist: (rnd(n + 7) - 0.5) * 1.1, y0: g.position.y })
      }
      for (let q = 0; q < 6; q++) {
        const h = 2.6 + (((i * 7 + q * 13) % 5) * 0.12)
        add(stakeOnly(h, q % 2 ? OAK : OAK3), x - 1.25 + q * 0.5, q)
      }
      for (const [dx, n] of [[-0.75, 20], [0.75, 21]] as const) for (const y of [0.7, 1.9]) add(railHalf(y), x + dx, n + y * 10)
    }
    // The cave mouth, behind the wall.
    this.piece(mouth(), [L.mouth.x, groundAt(L.mouth.x, L.mouth.z), L.mouth.z + 1.0])
    // The towers, each hinged at its front edge so it falls toward the camera; their rubble waits unseen.
    for (const t of L.towers) {
      const g = new Group()
      const inner = this.piece(tower(), [0, 0, -1.5])
      this.root.remove(inner)
      g.add(inner)
      g.position.set(t.x, groundAt(t.x, t.z), t.z + 1.5)
      this.root.add(g)
      this.towers.push(g)
      const r = this.piece(rubble(), [t.x, groundAt(t.x, t.z), t.z], 0.4)
      r.visible = false
      this.rubbles.push(r)
    }
    // The catapults: frame, the arm on its hinge, the lever beside.
    L.catapults.forEach(c => {
      const y = groundAt(c.x, c.z)
      // Both face the wall: the throw goes to -Z.
      this.piece(catapult(), [c.x, y, c.z], Math.PI)
      const arm = this.piece(catapultArm(), [c.x, y + 2.1, c.z - 0.2], Math.PI)
      this.arms.push(arm)
      this.piece(lever(), [c.lever.x, groundAt(c.lever.x, c.lever.z), c.lever.z], 0)
    })
    // The ram, and its swinging log.
    this.ramG = this.piece(ram(), [L.ram.x, groundAt(L.ram.x, L.ram.z), L.ram.z], Math.PI)
    this.logG = this.piece(ramLog(), [0, 2.4, 0], 0)
    this.root.remove(this.logG)
    this.ramG.add(this.logG)
    // The rebels' banners in the yard.
    for (const [x, zz, ry] of [[7.5, 40, 0.3], [46.5, 40, -0.3], [33, 41, 0.1]] as const) this.banners.push(this.piece(banner(), [x, groundAt(x, zz), zz], ry))
    // Shared shot geometry.
    const sg = stone()
    const ag = arrow()
    this.geos.push(sg, ag)
    for (let q = 0; q < 2; q++) {
      const m = new Mesh(sg, celVC())
      m.visible = false
      m.frustumCulled = false
      this.root.add(m)
      this.stones.push({ mesh: m, t: 1, dur: 1, x0: 0, y0: 0, z0: 0, x1: 0, y1: 0, z1: 0, arc: 0, spin: 0 })
    }
    for (let q = 0; q < (this.low ? 4 : 9); q++) {
      const m = new Mesh(ag, celVC())
      m.visible = false
      m.frustumCulled = false
      this.root.add(m)
      this.arrows.push({ mesh: m, t: 1, dur: 1, x0: 0, y0: 0, z0: 0, x1: 0, y1: 0, z1: 0, arc: 0, spin: 0 })
    }
    scene.add(this.root)
  }

  private launch(s: Shot, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, dur: number, arc: number, spin = 0): void {
    s.t = 0
    s.dur = dur
    s.x0 = x0; s.y0 = y0; s.z0 = z0; s.x1 = x1; s.y1 = y1; s.z1 = z1
    s.arc = arc
    s.spin = spin
    s.mesh.visible = true
  }

  private dust(x: number, z: number, n: number, spread: number, color = '#b3a48c'): void {
    const k = this.low ? Math.ceil(n / 2) : n
    for (let q = 0; q < k; q++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.random() * spread
      this.vfx.particles.emit({
        x: x + Math.cos(a) * r, y: 0.3 + Math.random() * 0.8, z: z + Math.sin(a) * r, vx: Math.cos(a) * (1 + Math.random() * 2), vy: 0.8 + Math.random() * 1.8, vz: Math.sin(a) * (1 + Math.random() * 2),
        color: q % 3 ? color : '#7a5a3a', size: 0.28 + Math.random() * 0.3, sizeEnd: 0.06, life: 0.7 + Math.random() * 0.6, gravity: 2.5, drag: 1.1
      })
    }
  }

  onEvent(e: SimEvent): void {
    if (e.t !== 'assault') return
    const L = ASSAULT_LAYOUT
    switch (e.id) {
      case 'arrow': {
        const s = this.arrows.find(a => !a.mesh.visible)
        if (!s) break
        this.launch(s, e.x + (Math.random() - 0.5) * 1.2, groundAt(e.x, e.z) + 5.4, e.z + 0.6, e.tx ?? e.x, groundAt(e.tx ?? e.x, e.tz ?? e.z) + 0.7, e.tz ?? e.z, 0.7 + Math.random() * 0.2, 2.2)
        if (Math.random() < 0.35) sfx('shootBow', 0, 0.35)
        break
      }
      case 'pull':
        sfx('chest', 0, 0.9)
        this.vfx.ring(L.catapults[e.n]!.lever.x, L.catapults[e.n]!.lever.z, 0.3, 1.6, '#ffd24a', 0.4)
        break
      case 'stone': {
        const s = this.stones[e.n]
        if (!s) break
        sfx('swingHeavy', 0, 0.9)
        this.launch(s, e.x, groundAt(e.x, e.z) + 3.6, e.z, e.tx!, groundAt(e.tx!, e.tz!) + 3.6, e.tz! + 0.8, CATAPULT_FLIGHT, 8.5, 5)
        break
      }
      case 'impact':
        this.shake[e.n] = 1
        sfx('explode', 0, 0.9)
        this.trauma(0.6)
        this.dust(e.x, e.z + 1.2, 12, 1.6)
        this.vfx.ring(e.x, e.z + 1.2, 0.4, 3.2, '#e8d9b0', 0.5)
        break
      case 'roll':
        sfx('alert', 0, 0.8)
        this.vfx.ring(e.x, e.z, 0.4, 2.6, '#ffd24a', 0.5)
        break
      case 'ram':
        this.shake[Math.max(0, L.towers.findIndex(t => Math.abs(t.x - e.x) < 2))] = 0.55 + e.n * 0.2
        sfx('hitHeavy', 0, 1)
        this.trauma(0.35 + e.n * 0.1)
        this.dust(e.x, e.z, 6 + e.n * 3, 1.4)
        break
      case 'tower':
        sfx('quake', 0, 1)
        sfx('crowdCheer', 0, 0.8)
        this.trauma(0.5)
        break
      case 'breach':
        this.breachT = 0
        sfx('crowdRoar', 0, 1)
        this.trauma(0.7)
        break
    }
  }

  private placeShot(s: Shot, dt: number, orient: boolean): void {
    if (!s.mesh.visible) return
    s.t += dt
    const k = Math.min(1, s.t / s.dur)
    const x = s.x0 + (s.x1 - s.x0) * k
    const z = s.z0 + (s.z1 - s.z0) * k
    const y = s.y0 + (s.y1 - s.y0) * k + 4 * s.arc * k * (1 - k)
    s.mesh.position.set(x, y, z)
    if (orient) {
      // Along the flight: the next point of the arc.
      const k2 = Math.min(1, k + 0.04)
      const nx = s.x0 + (s.x1 - s.x0) * k2
      const nz = s.z0 + (s.z1 - s.z0) * k2
      const ny = s.y0 + (s.y1 - s.y0) * k2 + 4 * s.arc * k2 * (1 - k2)
      _v.set(nx - x, ny - y, nz - z)
      if (_v.lengthSq() > 1e-8) { _v.normalize(); s.mesh.quaternion.copy(_q.setFromUnitVectors(_fwd, _v)) }
    } else {
      s.mesh.rotation.x += s.spin * dt
    }
    if (k >= 1) {
      s.mesh.visible = false
      if (orient) this.dust(s.x1, s.z1, 2, 0.4)
    }
  }

  update(dt: number): void {
    const a = this.sim.assault
    if (!a) return
    const L = ASSAULT_LAYOUT
    const time = this.sim.time
    this.pulse += dt
    // The towers: standing (shuddering after a blow), then toppling toward the camera.
    a.towers.forEach((t, q) => {
      const g = this.towers[q]!
      const tw = L.towers[q]!
      if (!t.down) {
        this.shake[q] = Math.max(0, (this.shake[q] ?? 0) - dt * 1.6)
        const s = this.shake[q]!
        g.rotation.x = Math.sin(time * 38) * 0.02 * s - s * 0.03
        g.rotation.z = Math.sin(time * 31 + q) * 0.025 * s
        return
      }
      const k = Math.min(1, t.fallT / 1.5)
      if (k < 1) {
        g.rotation.x = ease(k) * ease(k) * (Math.PI / 2 - 0.12) + Math.sin(k * 9) * 0.012
        g.rotation.z = Math.sin(k * 6 + q) * 0.05 * (1 - k)
        if (this.low === false && Math.random() < dt * 24) this.dust(tw.x, tw.z + 2 + k * 3, 1, 1.2, '#8a6a4a')
      } else {
        // On the ground: it breaks up and sinks into its own dust; the rubble stays.
        if (!this.landed[q]) {
          this.landed[q] = true
          g.rotation.x = Math.PI / 2 - 0.12
          this.dust(tw.x, tw.z + 4.5, 22, 3)
          this.vfx.ring(tw.x, tw.z + 4.5, 0.6, 5, '#e8d9b0', 0.6)
          this.trauma(0.8)
          sfx('deathBig', 0, 0.8)
          this.rubbles[q]!.visible = true
        }
        const sink = Math.min(1, (t.fallT - 1.5) / 0.8)
        g.position.y = groundAt(tw.x, tw.z) - sink * 2.2
        if (sink >= 1) g.visible = false
      }
    })
    // The palisade's middle tips over once the breach comes, chunk by chunk from the middle out.
    if (this.breachT >= 0) {
      this.breachT += dt
      for (const c of this.chunks) {
        const k = Math.min(1, Math.max(0, (this.breachT - c.delay) / 0.7))
        // They go over INTO the cave side (toward -Z), twisting, and lie in the dust.
        c.g.rotation.x = -ease(k) * ease(k) * c.tip
        c.g.rotation.z = c.twist * ease(k)
        c.g.position.y = c.y0 - (k >= 1 ? Math.min(1, (this.breachT - c.delay - 0.7) / 1.5) * 0.5 : 0)
        if (k > 0 && c.t < 0) {
          c.t = 0
          this.dust(c.g.position.x, L.wallZ, 2, 0.6)
          // Splinters off the break.
          for (let q = 0; q < (this.low ? 2 : 5); q++) {
            this.vfx.particles.emit({
              x: c.g.position.x, y: 0.8 + Math.random() * 1.6, z: L.wallZ, vx: (Math.random() - 0.5) * 3, vy: 1.5 + Math.random() * 2.5, vz: -Math.random() * 3,
              color: q % 2 ? '#8c6540' : '#5d3e24', size: 0.07 + Math.random() * 0.06, sizeEnd: 0.03, life: 0.8 + Math.random() * 0.5, gravity: 9, drag: 0.4
            })
          }
        }
        if (this.breachT - c.delay > 6 && c.g.visible) c.g.visible = false
      }
    }
    // The catapults' arms: ready (forward), cranked back by the wind-up, snapped forward on release.
    a.catapults.forEach((c, q) => {
      const arm = this.arms[q]!
      let ang = 0
      if (c.state === 'wind') ang = -ease(Math.min(1, c.t / CATAPULT_WIND)) * 1.15
      else if (c.state === 'fly') ang = -1.15 * Math.max(0, 1 - c.t / 0.16)
      else if (c.state === 'spent') ang = 0.05
      arm.rotation.x = ang
    })
    // The ram: where it is, rocking as it rolls, the log drawn back and swung.
    const r = a.ram
    this.ramG.position.set(r.x, groundAt(r.x, r.z), r.z)
    this.ramG.rotation.z = r.mode === 'roll' ? Math.sin(time * (7 + r.speed * 2)) * 0.012 * (0.4 + r.speed * 0.3) : 0
    let swing = 0
    if (r.mode === 'blow') {
      const k = Math.max(0, Math.min(2, r.blows))
      const due = 0.55 + k * RAM_BLOW_GAP
      const back = due - 0.55
      // Drawn back over half a second, then it swings through.
      const u = (r.t - back) / 0.55
      if (u < 1) swing = ease(Math.max(0, u)) * 0.6
      else swing = 0.6 - ease(Math.min(1, (r.t - due) / 0.12 + 1)) * 0.72
    } else if (r.mode === 'roll') swing = Math.sin(time * 5) * 0.03
    this.logG.rotation.x = swing
    // A cloud at the wheels while it is pushed.
    if (r.mode === 'roll' && Math.random() < dt * (this.low ? 5 : 14) * (r.speed / 2)) this.dust(r.x, r.z + 1.2, 1, 0.5)
    // The banners stir.
    this.banners.forEach((b, q) => { b.rotation.y = (q ? -0.3 : 0.3) + Math.sin(time * 1.7 + q * 2) * 0.1 })
    // Pulsing rings: where the hero can act (a lever not yet pulled, the ram waiting), quicker once he has idled.
    this.ringT -= dt
    if (this.ringT <= 0 && a.phase === 'play') {
      this.ringT = a.idle > 6 ? 0.9 : 1.7
      const col = a.idle > 6 ? '#fff0a0' : '#ffd24a'
      a.catapults.forEach((c, q) => { if (c.state === 'ready') this.vfx.ring(L.catapults[q]!.lever.x, L.catapults[q]!.lever.z, 0.25, a.idle > 6 ? 2.2 : 1.6, col, 0.8, 0.07) })
      if (r.mode === 'idle') this.vfx.ring(r.x, r.z + 1.1, 0.3, a.idle > 6 ? 2.6 : 1.9, col, 0.8, 0.07)
    }
    // Shots in the air.
    for (const s of this.arrows) this.placeShot(s, dt, true)
    for (const s of this.stones) this.placeShot(s, dt, false)
    // Torches flutter at the mouth (a little ember now and then).
    if (!this.low && Math.random() < dt * 4) {
      const sx = Math.random() < 0.5 ? -3.95 : 3.95
      this.vfx.particles.emit({ x: L.mouth.x + sx, y: 2.7, z: L.mouth.z + 1.95, vx: (Math.random() - 0.5) * 0.4, vy: 1 + Math.random(), vz: 0, color: '#ff8a2a', size: 0.1, sizeEnd: 0.02, life: 0.6 })
    }
  }

  dispose(): void {
    this.root.parent?.remove(this.root)
    for (const g of this.geos) g.dispose()
    this.geos.length = 0
  }
}
