import { Group, Mesh, type BufferGeometry, type Scene } from 'three'
import { sfx } from '../audio/sfx'
import { sceneQuality } from '../engine/quality'
import { PARTY_LAYOUT } from '../sim/celebrateMap'
import type { Sim } from '../sim/world'
import { celVC, glowVC, outlineMat } from './cel'
import { groundAt } from './ground'
import { merge, paint, rbox, rcone, rcyl, sph, xform } from './kit'
import type { Vfx } from './vfx'

/**
 * ─── The Hollows' celebration, drawn (roadmap #206) ──────────────────────────
 *
 * What the party has besides the camp fire and the tents (the level props draw those): a long feast
 * table with roast meat and mugs, benches, beer barrels, four poles with "no king" banners and bunting
 * strung between them, the crests the goblins hold overhead and the mugs the dwarfs raise. The sim's
 * celebrants are units; this only follows them with what they hold. Nothing is allocated per frame.
 *
 * Each piece is built at the origin on flat ground, its front toward +Z (the camera); parts of one piece never
 * share a plane (a coplanar test holds that).
 */

const P = (g: BufferGeometry, hex: string, p?: [number, number, number], r?: [number, number, number], s?: number | [number, number, number]): BufferGeometry =>
  xform(paint(g, hex), p, r, s ?? 1)

export interface PartyPieceGeo { lit: BufferGeometry[]; glow: BufferGeometry[] }

const OAK = '#7a5434'
const OAK2 = '#5d3e24'
const OAK3 = '#8c6540'
const IRON = '#3e3a3a'
const ROAST = '#a8552a'
const ROAST2 = '#c8743a'
const BONE = '#e8e2cf'
const FOAM = '#f6f0dc'
const ALE = '#d89a2a'
const GREEN = '#2f6a3a'
const GOLD = '#e8b73a'
const RED = '#c0302c'
const CLOTH = '#e6dcc0'

/**
 * The "no king" crest: a round shield, its field, a gold crown and a red cross struck through it. Every layer
 * stands clear of the one behind it (nothing shares a plane). Facing +Z; `r` is its radius.
 */
const crest = (r: number): BufferGeometry[] => [
  P(rcyl(r, 0.07, 0.02, 14, 1), OAK, [0, 0, 0], [Math.PI / 2, 0, 0]),
  P(rcyl(r * 0.84, 0.04, 0.01, 14, 1), GREEN, [0, 0, 0.05], [Math.PI / 2, 0, 0]),
  // The crown: a band and three points.
  P(rbox(r * 0.7, r * 0.2, 0.04, 0.3, 4, 3), GOLD, [0, -r * 0.12, 0.095]),
  P(rcone(r * 0.12, 0.01, r * 0.34, 0.01, 5), GOLD, [-r * 0.26, r * 0.12, 0.095]),
  P(rcone(r * 0.12, 0.01, r * 0.42, 0.01, 5), GOLD, [0, r * 0.16, 0.095]),
  P(rcone(r * 0.12, 0.01, r * 0.34, 0.01, 5), GOLD, [r * 0.26, r * 0.12, 0.095]),
  // The cross over it.
  P(rbox(r * 1.5, r * 0.15, 0.04, 0.4, 6, 3), RED, [0, 0, 0.14], [0, 0, Math.PI / 4]),
  P(rbox(r * 1.5, r * 0.15, 0.04, 0.4, 6, 3), RED, [0, 0, 0.19], [0, 0, -Math.PI / 4])
]
/** The crest held overhead, with the arm's stub under it. */
const CREST_R = 0.34
const heldCrest = (): PartyPieceGeo => ({ lit: [...crest(CREST_R), P(sph(0.1, 8, 6), '#4f8f3a', [0, -CREST_R * 0.9, 0.02])], glow: [] })
/** The goblin's raised arm: a unit-long stem (along Y), stretched between shoulder and grip each frame. */
const armStem = (): BufferGeometry[] => [P(rcyl(0.075, 1, 0.03, 8, 1), '#4f8f3a')]

/** A mug: a barrel of ale with a foam head and a handle. */
const mug = (): PartyPieceGeo => ({
  lit: [
    P(rcyl(0.1, 0.2, 0.03, 10, 1), OAK3, [0, 0.1, 0]),
    P(rcyl(0.108, 0.03, 0.01, 10, 1), IRON, [0, 0.06, 0]),
    P(rcyl(0.108, 0.03, 0.01, 10, 1), IRON, [0, 0.15, 0]),
    P(sph(0.1, 9, 6), FOAM, [0, 0.21, 0], undefined, [1, 0.55, 1]),
    P(rbox(0.05, 0.14, 0.05, 0.4, 3, 3), OAK2, [0.14, 0.1, 0])
  ],
  glow: []
})

/** A beer barrel: staves, two iron bands, a lid and a tap. */
const barrel = (): PartyPieceGeo => ({
  lit: [
    P(rcyl(0.46, 1.0, 0.1, 12, 1), OAK, [0, 0.5, 0]),
    P(rcyl(0.49, 0.06, 0.01, 12, 1), IRON, [0, 0.22, 0]),
    P(rcyl(0.49, 0.06, 0.01, 12, 1), IRON, [0, 0.78, 0]),
    P(rcyl(0.4, 0.05, 0.01, 12, 1), OAK3, [0, 1.025, 0]),
    P(rbox(0.1, 0.1, 0.22, 0.4, 3, 3), IRON, [0, 0.45, 0.52]),
    P(rcyl(0.04, 0.16, 0.01, 6, 1), OAK2, [0, 0.38, 0.62])
  ],
  glow: []
})

/** The feast table: a plank top on trestles, platters with roast meat, mugs, loaves. 9.2 m long. */
const table = (half: number): PartyPieceGeo => {
  const lit: BufferGeometry[] = [P(rbox(half * 2, 0.16, 1.5, 0.2, 14, 3), OAK, [0, 0.98, 0])]
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) lit.push(P(rbox(0.2, 0.9, 0.2, 0.3, 4, 6), OAK2, [sx * (half - 0.5), 0.45, sz * 0.55]))
  lit.push(P(rbox(half * 2 - 1.2, 0.12, 0.14, 0.3, 14, 3), OAK2, [0, 0.4, 0]))
  // The meat: platters with a roast on each, a bone sticking out.
  for (let q = 0; q < 5; q++) {
    const x = -half + 1.2 + q * ((half * 2 - 2.4) / 4)
    lit.push(P(rcyl(0.34, 0.05, 0.02, 12, 1), '#9a9aa0', [x, 1.085, 0.2 * (q % 2 ? -1 : 1)]))
    lit.push(P(sph(0.26, 10, 7), q % 2 ? ROAST : ROAST2, [x, 1.28, 0.2 * (q % 2 ? -1 : 1)], undefined, [1.2, 0.8, 0.9]))
    lit.push(P(rcyl(0.04, 0.36, 0.01, 6, 1), BONE, [x + 0.28, 1.34, 0.2 * (q % 2 ? -1 : 1)], [0, 0, 1.0]))
  }
  // Mugs and loaves between them.
  for (let q = 0; q < 9; q++) {
    const x = -half + 0.7 + q * ((half * 2 - 1.4) / 8)
    const z = q % 2 ? 0.5 : -0.5
    if (q % 3 === 2) lit.push(P(sph(0.17, 8, 6), '#c89a58', [x, 1.14, z], undefined, [1.3, 0.7, 0.9]))
    else {
      lit.push(P(rcyl(0.1, 0.2, 0.03, 10, 1), OAK3, [x, 1.16, z]))
      lit.push(P(sph(0.1, 9, 6), FOAM, [x, 1.27, z], undefined, [1, 0.55, 1]))
    }
  }
  return { lit, glow: [] }
}

/** A long bench (a half-log on stumps). */
const bench = (half: number): PartyPieceGeo => ({
  lit: [
    P(rbox(half * 2, 0.14, 0.42, 0.3, 12, 3), OAK3, [0, 0.5, 0]),
    P(rbox(0.22, 0.44, 0.34, 0.3, 4, 4), OAK2, [-half + 0.5, 0.22, 0]),
    P(rbox(0.22, 0.44, 0.34, 0.3, 4, 4), OAK2, [half - 0.5, 0.22, 0])
  ],
  glow: []
})

/** A banner pole: a post with a cross arm, a cloth with the crest on it, a gold finial. */
const pole = (): PartyPieceGeo => ({
  lit: [
    P(rcyl(0.07, 3.3, 0.02, 7, 1), OAK2, [0, 1.65, 0]),
    P(rbox(1.3, 0.08, 0.08, 0.3, 6, 3), OAK, [0, 3.0, 0]),
    P(sph(0.1, 8, 6), GOLD, [0, 3.38, 0]),
    P(rbox(1.15, 1.5, 0.04, 0.2, 6, 6), CLOTH, [0, 2.2, 0.07]),
    ...crest(0.42).map(g => xform(g, [0, 2.3, 0.07], [0, 0, 0], 1))
  ],
  glow: []
})

const FLAGS = ['#c0302c', '#e8b73a', '#2f6a3a', '#3f7be0', '#9a4ad0']
/** Bunting strung between two poles `dx` apart (their tops), sagging in the middle. */
const bunting = (dx: number): PartyPieceGeo => {
  const lit: BufferGeometry[] = []
  const n = Math.max(5, Math.round(Math.abs(dx) / 0.9))
  for (let q = 1; q < n; q++) {
    const k = q / n
    const y = -Math.sin(k * Math.PI) * 0.7
    lit.push(P(rbox(0.3, 0.38, 0.02, 0.2, 3, 3), FLAGS[q % FLAGS.length]!, [dx * k, y - 0.17, 0.02 * (q % 2)], [0, 0, Math.PI / 12 * (q % 2 ? 1 : -1)]))
  }
  // The string, in short pieces (each follows the sag).
  for (let q = 0; q < n; q++) {
    const k0 = q / n
    const k1 = (q + 1) / n
    const y0 = -Math.sin(k0 * Math.PI) * 0.7
    const y1 = -Math.sin(k1 * Math.PI) * 0.7
    const len = Math.hypot(dx / n, y1 - y0)
    lit.push(P(rbox(len, 0.03, 0.03, 0.4, 3, 3), '#4a3a2a', [dx * (k0 + k1) / 2, (y0 + y1) / 2 + 0.03, -0.05], [0, 0, Math.atan2(y1 - y0, dx / n)]))
  }
  return { lit, glow: [] }
}

/** Every piece, for the geometry audits. */
export const partyPieceParts = (): Record<'crest' | 'mug' | 'barrel' | 'table' | 'bench' | 'pole' | 'bunting', PartyPieceGeo> =>
  ({ crest: heldCrest(), mug: mug(), barrel: barrel(), table: table(PARTY_LAYOUT.table.half), bench: bench(PARTY_LAYOUT.table.half - 0.4), pole: pole(), bunting: bunting(8) })

const GLOW = glowVC

export class CelebrateProps {
  private root = new Group()
  private geos: BufferGeometry[] = []
  private low = sceneQuality() === 'low'
  private crests = new Map<number, Group>()
  private mugs = new Map<number, Group>()
  private banners: Group[] = []
  private cheerT = 0
  private confetti = 0

  constructor(private sim: Sim, private vfx: Vfx) {}

  private piece(p: PartyPieceGeo, at: [number, number, number], ry = 0, add = true): Group {
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
      g.add(new Mesh(geo, GLOW()))
    }
    for (const m of g.children) m.frustumCulled = false
    g.position.set(at[0], at[1], at[2])
    g.rotation.y = ry
    if (add) this.root.add(g)
    return g
  }

  build(scene: Scene): void {
    const L = PARTY_LAYOUT
    const y = (x: number, z: number): number => groundAt(x, z)
    // The table with a bench on each side.
    this.piece(table(L.table.half), [L.table.x, y(L.table.x, L.table.z), L.table.z])
    for (const dz of [-1.25, 1.25]) this.piece(bench(L.table.half - 0.4), [L.table.x, y(L.table.x, L.table.z + dz), L.table.z + dz])
    for (const b of L.barrels) this.piece(barrel(), [b.x, y(b.x, b.z), b.z])
    // The banners (the two in front a little forward and turned in) and the bunting between pole and pole.
    L.poles.forEach((p, q) => this.banners.push(this.piece(pole(), [p.x, y(p.x, p.z), p.z], q % 2 ? -0.18 : 0.18)))
    const top = (q: number): [number, number, number] => [L.poles[q]!.x, y(L.poles[q]!.x, L.poles[q]!.z) + 3.0, L.poles[q]!.z]
    // Poles 0 and 1 stand at one depth, 2 and 3 at another: a string between each pair, along X.
    for (const [a, b] of [[0, 1], [2, 3]] as const) {
      const A = top(a)
      const B = top(b)
      this.piece(bunting(B[0] - A[0]), A)
    }
    // What the crowd holds, one set per celebrant.
    const c = this.sim.celebrate
    if (c) {
      const crestGeo = merge(heldCrest().lit)
      const mugGeo = merge(mug().lit)
      const armGeo = merge(armStem())
      this.geos.push(crestGeo, mugGeo, armGeo)
      for (const p of c.celebrants) {
        if (p.role === 'crest') {
          // g: at the goblin's feet. children[0] the shield (held out to one side, clear of the head),
          // children[1] the raised arm from the shoulder to the grip.
          const g = new Group()
          const sg = new Group()
          const m = new Mesh(crestGeo, celVC())
          const l = new Mesh(crestGeo, outlineMat())
          l.renderOrder = -1
          m.frustumCulled = l.frustumCulled = false
          sg.add(m, l)
          const ag = new Group()
          const am = new Mesh(armGeo, celVC())
          const al = new Mesh(armGeo, outlineMat())
          al.renderOrder = -1
          am.frustumCulled = al.frustumCulled = false
          ag.add(am, al)
          g.add(sg, ag)
          g.visible = false
          this.root.add(g)
          this.crests.set(p.unit, g)
        } else if (p.role === 'mug') {
          const g = new Group()
          const m = new Mesh(mugGeo, celVC())
          const l = new Mesh(mugGeo, outlineMat())
          l.renderOrder = -1
          m.frustumCulled = l.frustumCulled = false
          g.add(m, l)
          g.visible = false
          this.root.add(g)
          this.mugs.set(p.unit, g)
        }
      }
    }
    scene.add(this.root)
  }

  update(dt: number): void {
    const c = this.sim.celebrate
    if (!c) return
    const time = c.t
    for (const p of c.celebrants) {
      const u = this.sim.get(p.unit)
      if (!u) continue
      const lift = u.stunt?.lift ?? 0
      const gy = groundAt(u.x, u.z)
      const cg = this.crests.get(p.unit)
      if (cg) {
        // Held in one raised fist out to the side of the head (never over it, so it cannot sink into it from
        // the high camera): at the hip-side at rest, up beside the head at a cheer. The arm runs from the
        // shoulder to the grip under the shield; the shield leans toward the camera and sways with the beat.
        cg.visible = true
        cg.position.set(u.x, gy + lift, u.z)
        const side = p.unit % 2 ? 1 : -1
        const sway = Math.sin(time * 3.2 + p.off * 4) * 0.08
        const cx = side * 0.66 + sway * 0.4
        const cy = 0.82 + p.up * 0.62
        const sg = cg.children[0]!
        sg.position.set(cx, cy, 0.1)
        sg.rotation.set(-0.35, side * 0.15, -side * 0.12 + sway)
        const ag = cg.children[1]!
        const sx = side * 0.2
        const sy = 0.6
        const hx = cx - side * 0.04
        const hy = cy - CREST_R * 0.9
        const dx = hx - sx
        const dy = hy - sy
        const len = Math.hypot(dx, dy)
        ag.position.set((sx + hx) / 2, (sy + hy) / 2, 0.06)
        ag.rotation.set(0, 0, -Math.atan2(dx, dy))
        ag.scale.set(1, len, 1)
      }
      const mg = this.mugs.get(p.unit)
      if (mg) {
        // In front of the chest, lifted toward the mouth, and up high at a toast.
        mg.visible = true
        mg.position.set(u.x + Math.sin(u.facing + 0.5) * 0.42, gy + lift + 0.7 + p.up * 0.55, u.z + Math.cos(u.facing + 0.5) * 0.42)
        mg.rotation.z = -p.up * 0.5
      }
    }
    // The banners stir.
    this.banners.forEach((b, q) => { b.rotation.y = (q % 2 ? -0.18 : 0.18) + Math.sin(time * 1.5 + q * 1.7) * 0.07 })
    // The crowd's roar now and then, and a puff of confetti at each cheer of the crests.
    this.cheerT -= dt
    if (this.cheerT <= 0) {
      this.cheerT = time < 1 ? 0.2 : 4.6
      sfx('crowdCheer', 0, 0.7)
    }
    this.confetti -= dt
    if (this.confetti <= 0) {
      this.confetti = this.low ? 0.5 : 0.18
      const F = PARTY_LAYOUT.fire
      const a = Math.random() * Math.PI * 2
      const r = 2 + Math.random() * 5
      const colors = ['#e8b73a', '#c0302c', '#4fa84a', '#3f7be0']
      this.vfx.particles.emit({
        x: F.x + Math.sin(a) * r, y: 4.4 + Math.random() * 0.8, z: F.z + Math.cos(a) * r * 0.85, vx: (Math.random() - 0.5) * 1.2, vy: -0.4 - Math.random() * 0.6, vz: (Math.random() - 0.5) * 1.2,
        color: colors[Math.floor(Math.random() * colors.length)]!, size: 0.13, sizeEnd: 0.09, life: 3.2 + Math.random(), gravity: 0.6, drag: 0.6
      })
    }
  }

  dispose(): void {
    this.root.parent?.remove(this.root)
    for (const g of this.geos) g.dispose()
    this.geos.length = 0
    this.crests.clear()
    this.mugs.clear()
  }
}
