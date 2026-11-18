import { Group, Mesh, type BufferGeometry, type Scene } from 'three'
import { sfx } from '../audio/sfx'
import { sceneQuality } from '../engine/quality'
import { gnomeSpot, RING_R, type RebelSite } from '../sim/rebelSite'
import type { SimEvent } from '../sim/types'
import type { Sim } from '../sim/world'
import { celVC, outlineMat } from './cel'
import { groundAt } from './ground'
import { merge, paint, rbox, rcyl, sph, xform } from './kit'
import type { Vfx } from './vfx'

/**
 * ─── The Hollows' chain gang, drawn (roadmap #205) ───────────────────────────
 *
 * A ring of iron-banded posts, a chain from each to its gnome, and the dig the gang works at: a heap of
 * rubble with picks leaning on it and a battered ore cart. When a chain snaps (`rebel` event) it drops
 * to the ground and stays there, a little pile of links, in the dust the freed gnome leaves. The sim's
 * gnomes are units; this is only what stands round them.
 */

const P = (g: BufferGeometry, hex: string, p?: [number, number, number], r?: [number, number, number], s?: number | [number, number, number]): BufferGeometry =>
  xform(paint(g, hex), p, r, s ?? 1)

export interface RebelPieceGeo { lit: BufferGeometry[] }

const OAK = '#7a5434'
const OAK2 = '#5d3e24'
const IRON = '#3e3a3a'
const IRON2 = '#575050'
const ROCK = '#77706a'
const ROCK2 = '#5b554f'
const ORE = '#9a7a52'

/** The height of the ring on a post, and of the chain's other end at the gnome (m). */
const RING_Y = 0.78
const CUFF_Y = 0.42
const LINKS = 9

/** A post: a stone footing, the stake, an iron band with a ring on it. */
const post = (): RebelPieceGeo => ({
  lit: [
    P(rbox(0.56, 0.16, 0.56, 0.3, 6, 3), ROCK2, [0, 0.08, 0]),
    P(rcyl(0.13, 1.15, 0.04, 8, 1), OAK, [0, 0.735, 0]),
    P(rcyl(0.19, 0.07, 0.02, 10, 1), IRON, [0, RING_Y, 0]),
    P(rbox(0.1, 0.16, 0.06, 0.4, 4, 4), IRON2, [0, RING_Y - 0.02, 0.19])
  ]
})

/** A chain from the post's ring to the gnome's cuff, `dx`, `dz` away (the post is the origin): links alternately turned, sagging. */
const chain = (dx: number, dz: number): RebelPieceGeo => {
  const len = Math.hypot(dx, dz)
  const ry = Math.atan2(dx, dz)
  const lit: BufferGeometry[] = []
  const ux = dx / len
  const uz = dz / len
  // Start just outside the band, end at the cuff.
  const s0 = 0.28
  const s1 = len - 0.12
  for (let q = 0; q < LINKS; q++) {
    const k = q / (LINKS - 1)
    const d = s0 + (s1 - s0) * k
    const y = RING_Y + (CUFF_Y - RING_Y) * k - Math.sin(k * Math.PI) * 0.1
    lit.push(P(rbox(0.1, 0.05, 0.17, 0.4, 4, 3), q % 2 ? IRON : IRON2, [ux * d, y, uz * d], [0, ry, q % 2 ? Math.PI / 2 : 0]))
  }
  // The cuff on the gnome's wrist.
  lit.push(P(rbox(0.2, 0.13, 0.2, 0.4, 4, 4), IRON, [ux * (len - 0.02), CUFF_Y, uz * (len - 0.02)], [0, ry, 0]))
  return { lit }
}

/** The dig: a heap of rubble, two picks leaning on it, a few ore lumps. */
const heap = (): RebelPieceGeo => ({
  lit: [
    P(sph(0.62, 10, 7), ROCK, [0, 0.12, 0], undefined, [1.15, 0.62, 1]),
    P(sph(0.4, 9, 6), ROCK2, [0.42, 0.14, 0.3], undefined, [1, 0.7, 0.9]),
    P(sph(0.34, 9, 6), ROCK2, [-0.4, 0.1, -0.3], undefined, [1, 0.7, 1]),
    P(sph(0.2, 8, 5), ORE, [0.1, 0.5, -0.1], undefined, [1, 0.8, 1]),
    // Two picks.
    P(rcyl(0.035, 1.05, 0.01, 6, 1), OAK, [-0.55, 0.62, 0.55], [0.5, 0.4, 0.4]),
    P(rbox(0.5, 0.07, 0.09, 0.4, 6, 3), IRON, [-0.8, 1.04, 0.66], [0.5, 0.4, 0.4]),
    P(rcyl(0.035, 1.0, 0.01, 6, 1), OAK2, [0.62, 0.6, 0.5], [0.45, -0.5, -0.35]),
    P(rbox(0.5, 0.07, 0.09, 0.4, 6, 3), IRON, [0.88, 0.98, 0.64], [0.45, -0.5, -0.35])
  ]
})

/** An ore cart: a box of boards on two wheels, heaped with ore. */
const cart = (): RebelPieceGeo => {
  const lit: BufferGeometry[] = [
    P(rbox(1.3, 0.12, 0.8, 0.3, 8, 3), OAK2, [0, 0.46, 0]),
    P(rbox(1.3, 0.34, 0.1, 0.3, 8, 3), OAK, [0, 0.67, 0.39]),
    P(rbox(1.3, 0.34, 0.1, 0.3, 8, 3), OAK, [0, 0.67, -0.39]),
    P(rbox(0.1, 0.34, 0.68, 0.3, 3, 6), OAK, [0.6, 0.67, 0]),
    P(rbox(0.1, 0.34, 0.68, 0.3, 3, 6), OAK, [-0.6, 0.67, 0]),
    P(sph(0.34, 9, 6), ORE, [0.1, 0.84, 0], undefined, [1.5, 0.7, 1]),
    P(sph(0.2, 8, 5), ROCK, [-0.3, 0.84, 0.1])
  ]
  for (const sz of [-1, 1]) lit.push(P(rcyl(0.28, 0.1, 0.03, 12, 1), IRON, [0, 0.28, sz * 0.5], [Math.PI / 2, 0, 0]))
  return { lit }
}

/** Every piece, for the geometry audits. */
export const rebelPieceParts = (): Record<'post' | 'chain' | 'heap' | 'cart', RebelPieceGeo> =>
  ({ post: post(), chain: chain(1.6, 0), heap: heap(), cart: cart() })

const ease = (k: number): number => k * k * (3 - 2 * k)

interface Chain { g: Group; fall: number; dropped: boolean }

export class RebelProps {
  private root = new Group()
  private geos: BufferGeometry[] = []
  private low = sceneQuality() === 'low'
  private chains: Chain[] = []
  private guardedT = 0

  constructor(private sim: Sim, private vfx: Vfx) {}

  private piece(p: RebelPieceGeo, at: [number, number, number], ry = 0): Group {
    const g = new Group()
    const geo = merge(p.lit)
    this.geos.push(geo)
    const body = new Mesh(geo, celVC())
    const line = new Mesh(geo, outlineMat())
    line.renderOrder = -1
    g.add(body, line)
    for (const m of g.children) m.frustumCulled = false
    g.position.set(at[0], at[1], at[2])
    g.rotation.y = ry
    this.root.add(g)
    return g
  }

  build(scene: Scene, site: RebelSite): void {
    this.buildRing(site)
    if (site.more) this.buildRing(site.more)
    scene.add(this.root)
  }

  /** One gang: its posts and chains (in the order the sim lays its gnomes), its dig and its cart. */
  private buildRing(site: RebelSite): void {
    site.posts.forEach((p, q) => {
      const at = gnomeSpot(site, q)
      this.piece(post(), [p.x, groundAt(p.x, p.z), p.z])
      // The chain hangs from the post: its group sits at the post's foot.
      const g = this.piece(chain(at.x - p.x, at.z - p.z), [p.x, groundAt(p.x, p.z), p.z])
      this.chains.push({ g, fall: -1, dropped: false })
    })
    // The dig in the middle of the ring, the cart beside the gang.
    this.piece(heap(), [site.x, groundAt(site.x, site.z), site.z], 0.6)
    const cx = site.x + Math.sin(site.posts[0]!.a + Math.PI / 6) * (RING_R + 2.6)
    const cz = site.z + Math.cos(site.posts[0]!.a + Math.PI / 6) * (RING_R + 2.6)
    this.piece(cart(), [cx, groundAt(cx, cz), cz], site.posts[0]!.a)
  }

  onEvent(e: SimEvent): void {
    if (e.t !== 'rebel') return
    switch (e.id) {
      case 'snap': {
        const c = this.chains[e.n]
        if (c && c.fall < 0) c.fall = 0
        sfx('hitHeavy', 0, 0.6)
        for (let q = 0; q < (this.low ? 3 : 8); q++) {
          this.vfx.particles.emit({
            x: e.x, y: 0.4 + Math.random() * 0.4, z: e.z, vx: (Math.random() - 0.5) * 3, vy: 1.4 + Math.random() * 1.6, vz: (Math.random() - 0.5) * 3,
            color: q % 2 ? '#d8d0c0' : '#8a7a68', size: 0.16 + Math.random() * 0.1, sizeEnd: 0.04, life: 0.6 + Math.random() * 0.4, gravity: 7, drag: 0.8
          })
        }
        this.vfx.ring(e.x, e.z, 0.3, 1.8, '#ffe9a8', 0.45)
        break
      }
      case 'stab':
        sfx('hitPierce', 0, 0.55)
        this.vfx.ring(e.x, e.z, 0.2, 1.1, '#ffe9a8', 0.3, 0.07)
        break
      case 'guarded':
        sfx('denied', 0, 0.5)
        this.guardedT = 0.6
        break
    }
  }

  update(dt: number): void {
    const time = this.sim.time
    // A chain with its gnome rattles (a gnome that tugs); a snapped one drops and lies.
    this.chains.forEach((c, q) => {
      if (c.fall >= 0) {
        c.fall = Math.min(1, c.fall + dt / 0.45)
        // The links fall to the ground and lie there, flattened.
        c.g.scale.y = 1 - ease(c.fall) * 0.8
        c.dropped = c.fall >= 1
      } else {
        c.g.rotation.z = this.guardedT > 0 ? Math.sin(time * 40 + q) * 0.05 * this.guardedT : 0
      }
    })
    if (this.guardedT > 0) this.guardedT = Math.max(0, this.guardedT - dt)
  }

  dispose(): void {
    this.root.parent?.remove(this.root)
    for (const g of this.geos) g.dispose()
    this.geos.length = 0
  }
}
