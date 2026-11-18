import { DoubleSide, Group, Mesh, MeshBasicMaterial, type BufferGeometry, type Scene } from 'three'
import { sfx } from '../audio/sfx'
import { sceneQuality } from '../engine/quality'
import type { SimEvent } from '../sim/types'
import type { Sim } from '../sim/world'
import { boulderAt, GALLERY_LIFT, LANE_OFFSETS } from '../sim/tricks'
import { celVC, glowVC, outlineMat } from './cel'
import { groundAt } from './ground'
import { merge, paint, rbox, rcyl, sph, xform } from './kit'
import type { Vfx } from './vfx'

/**
 * The Hollows' section tricks, drawn (roadmap #EXT-2, `sim/tricks.ts`): the cook's iron stew pot on its three legs (a green glow
 * and steam while the cook lives, cold and dark once he is down), the lever post at the boulder lane's edge, and the three boulders
 * as they roll. Nothing is allocated per frame.
 */

const P = (g: BufferGeometry, hex: string, p?: [number, number, number], r?: [number, number, number], s?: number | [number, number, number]): BufferGeometry =>
  xform(paint(g, hex), p, r, s ?? 1)

const IRON = '#3e3a3a'
const OAK = '#7a5434'
const OAK2 = '#5d3e24'
const ROCK = '#8a847c'

const potGeo = (): BufferGeometry => merge([
  P(sph(0.62, 12, 9), IRON, [0, 0.82, 0], [0, 0, 0], [1, 0.8, 1]),
  P(rcyl(0.66, 0.12, 0.05, 12, 1), '#5b5656', [0, 1.24, 0]),
  ...[0, 1, 2].map(i => P(rcyl(0.07, 0.5, 0.02, 6, 1), OAK2, [Math.cos(i * 2.094) * 0.5, 0.25, Math.sin(i * 2.094) * 0.5])),
  P(rcyl(0.04, 1.1, 0.01, 6, 1), OAK, [0.5, 1.3, 0.2], [0, 0, 0.5])
])
/** The brew: a green disc a hand's breadth below the rim, lit. */
const brewGeo = (): BufferGeometry => P(rcyl(0.5, 0.05, 0.02, 12, 1), '#7dff8a', [0, 1.18, 0])
/** The slingers' scaffold: four posts, a plank deck and a rail, standing GALLERY_LIFT high. */
const scaffoldGeo = (): BufferGeometry => merge([
  ...[-1, 1].flatMap(sx => [-1, 1].map(sz => P(rcyl(0.11, GALLERY_LIFT - 0.3, 0.03, 8, 1), OAK2, [sx * 1.05, (GALLERY_LIFT - 0.3) / 2, sz * 0.75]))),
  P(rbox(2.5, 0.18, 1.95, 0.25, 8, 4), OAK, [0, GALLERY_LIFT - 0.09 - 0.1, 0]),
  P(rbox(2.4, 0.5, 0.1, 0.3, 6, 3), OAK2, [0, GALLERY_LIFT + 0.3, 0.9]),
  P(rbox(0.1, 0.5, 1.8, 0.3, 3, 6), OAK2, [-1.15, GALLERY_LIFT + 0.3, 0]),
  P(rbox(0.1, 0.5, 1.8, 0.3, 3, 6), OAK2, [1.15, GALLERY_LIFT + 0.3, 0]),
  P(rbox(0.12, 1.5, 0.1, 0.3, 3, 3), IRON, [0.0, 0.8, -0.9], [0.6, 0, 0])
])
const leverGeo = (): BufferGeometry => merge([
  P(rbox(0.5, 0.3, 0.5, 0.2, 4, 4), ROCK, [0, 0.15, 0]),
  P(rcyl(0.1, 1.3, 0.03, 8, 1), OAK2, [0, 0.9, 0]),
  P(rcyl(0.07, 0.8, 0.02, 6, 1), OAK, [0.2, 1.55, 0], [0, 0, 1.05]),
  P(sph(0.12, 8, 6), '#c9483a', [0.55, 1.78, 0])
])

export class HollowsTricks {
  private root = new Group()
  private geos: BufferGeometry[] = []
  private low = sceneQuality() === 'low'
  private pots: Array<{ g: Group; brew: Mesh }> = []
  private scaffolds: Group[] = []
  private posts: Group[] = []
  private floors: Mesh[] = []
  private floorMats: MeshBasicMaterial[] = []
  private levers: Group[] = []
  private boulders: Mesh[][] = []
  private ringT = 0
  private pulse = 0
  private at: [number, number] = [0, 0]

  constructor(private sim: Sim, private vfx: Vfx, private trauma: (n: number) => void) {}

  private mesh(geo: BufferGeometry, glow = false): Mesh {
    this.geos.push(geo)
    const m = new Mesh(geo, glow ? glowVC() : celVC())
    m.frustumCulled = false
    return m
  }

  build(scene: Scene): void {
    const tr = this.sim.tricks
    if (!tr) return
    const pg = potGeo()
    this.geos.push(pg)
    for (const p of tr.pots) {
      const g = new Group()
      const body = new Mesh(pg, celVC())
      const line = new Mesh(pg, outlineMat())
      line.renderOrder = -1
      body.frustumCulled = line.frustumCulled = false
      const brew = this.mesh(brewGeo(), true)
      g.add(body, line, brew)
      g.position.set(p.x, groundAt(p.x, p.z), p.z)
      this.root.add(g)
      this.pots.push({ g, brew })
    }
    const lg = leverGeo()
    this.geos.push(lg)
    const bg = sph(0.8, 12, 9)
    paint(bg, ROCK)
    this.geos.push(bg)
    for (const ln of tr.lanes) {
      const g = new Group()
      const body = new Mesh(lg, celVC())
      const line = new Mesh(lg, outlineMat())
      line.renderOrder = -1
      body.frustumCulled = line.frustumCulled = false
      g.add(body, line)
      g.position.set(ln.lx, groundAt(ln.lx, ln.lz), ln.lz)
      this.root.add(g)
      this.levers.push(g)
      const row: Mesh[] = []
      for (let k = 0; k < LANE_OFFSETS.length; k++) {
        const m = new Mesh(bg, celVC())
        m.visible = false
        m.frustumCulled = false
        this.root.add(m)
        row.push(m)
      }
      this.boulders.push(row)
    }
    const sg = scaffoldGeo()
    this.geos.push(sg)
    for (const gl of tr.galleries) {
      const g = new Group()
      const body = new Mesh(sg, celVC())
      const line = new Mesh(sg, outlineMat())
      line.renderOrder = -1
      body.frustumCulled = line.frustumCulled = false
      g.add(body, line)
      g.position.set(gl.x, groundAt(gl.x, gl.z), gl.z)
      this.root.add(g)
      this.scaffolds.push(g)
      // The rope post.
      const pg = new Group()
      const pb = new Mesh(lg, celVC())
      const pl = new Mesh(lg, outlineMat())
      pl.renderOrder = -1
      pb.frustumCulled = pl.frustumCulled = false
      pg.add(pb, pl)
      pg.position.set(gl.px, groundAt(gl.px, gl.pz), gl.pz)
      this.root.add(pg)
      this.posts.push(pg)
    }
    // The false floor: a dark, cracked disc laid on the ground (a decal: no depth write, pulled toward the camera).
    for (const tp of tr.traps) {
      const mat = new MeshBasicMaterial({ color: '#14100c', transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, side: DoubleSide })
      const geo = rcyl(tp.r, 0.02, 0.01, 18, 1)
      this.geos.push(geo)
      const m = new Mesh(geo, mat)
      m.position.set(tp.x, groundAt(tp.x, tp.z) + 0.04, tp.z)
      m.frustumCulled = false
      this.root.add(m)
      this.floors.push(m)
      this.floorMats.push(mat)
    }
    scene.add(this.root)
  }

  onEvent(e: SimEvent): void {
    if (e.t !== 'trick') return
    switch (e.id) {
      case 'pot': {
        const n = this.low ? 1 : 3
        for (let q = 0; q < n; q++) {
          this.vfx.particles.emit({
            x: e.x + (Math.random() - 0.5) * 0.4, y: 1.4, z: e.z + (Math.random() - 0.5) * 0.4, vx: (Math.random() - 0.5) * 0.3, vy: 0.9 + Math.random() * 0.5, vz: (Math.random() - 0.5) * 0.3,
            color: '#a8f0b0', size: 0.28, sizeEnd: 0.6, life: 1.4, gravity: -0.2, drag: 0.5
          })
        }
        break
      }
      case 'potOut':
        sfx('hitHeavy', 0, 0.5)
        this.vfx.ring(e.x, e.z, 0.3, 2.4, '#7dff8a', 0.5)
        break
      case 'lever':
        sfx('chest', 0, 0.9)
        sfx('quake', 0, 0.6)
        this.trauma(0.3)
        this.vfx.ring(e.x, e.z, 0.3, 1.8, '#ffd24a', 0.4)
        break
      case 'galleryDown':
        sfx('quake', 0, 0.9)
        sfx('hitHeavy', 0, 0.8)
        this.trauma(0.5)
        this.vfx.ring(e.x, e.z, 0.4, 3.4, '#e8d9b0', 0.5)
        for (let q = 0; q < (this.low ? 6 : 16); q++) {
          const a = Math.random() * Math.PI * 2
          this.vfx.particles.emit({ x: e.x + Math.cos(a) * 1, y: 0.4 + Math.random() * 1.5, z: e.z + Math.sin(a) * 1, vx: Math.cos(a) * 2, vy: 1 + Math.random() * 2, vz: Math.sin(a) * 2, color: q % 2 ? '#b3a48c' : '#7a5434', size: 0.3, sizeEnd: 0.06, life: 0.9, gravity: 4, drag: 0.8 })
        }
        break
      case 'galleryLand':
        sfx('hitHeavy', 0, 0.6)
        this.vfx.ring(e.x, e.z, 0.3, 2.2, '#e8d9b0', 0.4)
        break
      case 'trapCrack':
        sfx('quake', 0, 0.6)
        this.trauma(0.2)
        break
      case 'trapFall':
        sfx('hitHeavy', 0, 0.8)
        this.trauma(0.45)
        this.vfx.ring(e.x, e.z, 0.4, 3, '#8a6a4a', 0.5)
        for (let q = 0; q < (this.low ? 6 : 14); q++) {
          const a = Math.random() * Math.PI * 2
          this.vfx.particles.emit({ x: e.x + Math.cos(a) * 1.2, y: 0.2, z: e.z + Math.sin(a) * 1.2, vx: Math.cos(a) * 1.5, vy: 2.5 + Math.random() * 2, vz: Math.sin(a) * 1.5, color: '#8a6a4a', size: 0.25, sizeEnd: 0.05, life: 0.8, gravity: 8, drag: 0.6 })
        }
        break
      case 'boulderHit':
        sfx('hitHeavy', 0, 0.7)
        this.trauma(0.25)
        this.vfx.ring(e.x, e.z, 0.3, 2, '#e8d9b0', 0.4)
        break
    }
  }

  update(dt: number): void {
    const tr = this.sim.tricks
    if (!tr) return
    this.pulse += dt
    tr.pots.forEach((p, q) => {
      const v = this.pots[q]
      if (v) v.brew.visible = p.lit
    })
    tr.galleries.forEach((gl, q) => {
      const sc = this.scaffolds[q]
      const po = this.posts[q]
      if (sc) {
        // The scaffold comes down with its rope: it tilts and drops to the ground, and stays a wreck.
        const k = gl.state === 'down' ? Math.min(1, gl.t / 0.6) : 0
        sc.rotation.z = -0.5 * k * k
        sc.position.y = groundAt(gl.x, gl.z) - GALLERY_LIFT * 0.75 * k * k
      }
      if (po) po.rotation.z = gl.state === 'up' ? 0 : -0.5
      if (gl.state === 'up' && this.ringT <= 0 && po) this.vfx.ring(gl.px, gl.pz, 0.25, 1.7, '#ffd24a', 0.8, 0.07)
    })
    tr.traps.forEach((tp, q) => {
      const mat = this.floorMats[q]
      if (!mat) return
      // Cracks darken the floor during the warning, then it is a hole.
      mat.opacity = tp.state === 'armed' ? 0 : tp.state === 'cracking' ? 0.15 + 0.35 * Math.min(1, tp.t) + Math.sin(this.pulse * 40) * 0.05 : 0.92
      if (tp.state === 'cracking' && !this.low && Math.random() < dt * 12) {
        this.vfx.particles.emit({ x: tp.x + (Math.random() - 0.5) * tp.r * 1.6, y: 0.1, z: tp.z + (Math.random() - 0.5) * tp.r * 1.6, vx: 0, vy: 0.8, vz: 0, color: '#b3a48c', size: 0.2, sizeEnd: 0.05, life: 0.5, gravity: 2 })
      }
    })
    this.ringT -= dt
    tr.lanes.forEach((ln, q) => {
      // The lever's handle: down once pulled.
      const g = this.levers[q]
      if (g) g.rotation.z = ln.state === 'ready' ? 0 : -0.5
      // A ring where the hero can act, so the lever is found.
      if (ln.state === 'ready' && this.ringT <= 0) { this.ringT = 1.6; this.vfx.ring(ln.lx, ln.lz, 0.25, 1.7, '#ffd24a', 0.8, 0.07) }
      const row = this.boulders[q]
      if (!row) return
      for (let k = 0; k < row.length; k++) {
        const m = row[k]!
        const on = ln.state === 'roll' && boulderAt(ln, k, ln.t, this.at)
        m.visible = on
        if (!on) continue
        m.position.set(this.at[0], groundAt(this.at[0], this.at[1]) + 0.8, this.at[1])
        m.rotation.x += dt * 7
        if (!this.low && Math.random() < dt * 14) {
          this.vfx.particles.emit({ x: this.at[0], y: 0.3, z: this.at[1], vx: (Math.random() - 0.5) * 2, vy: 0.8 + Math.random(), vz: (Math.random() - 0.5) * 2, color: '#b3a48c', size: 0.3, sizeEnd: 0.06, life: 0.6, gravity: 2.5, drag: 1.1 })
        }
      }
    })
  }

  dispose(): void {
    this.root.parent?.remove(this.root)
    for (const g of this.geos) g.dispose()
    this.geos.length = 0
  }
}

/** The pot and the lever as the poke-through audit reads them. */
export const hollowsTrickParts = (): Record<'pot' | 'lever' | 'scaffold', { lit: BufferGeometry[]; glow: BufferGeometry[] }> =>
  ({ pot: { lit: [potGeo()], glow: [brewGeo()] }, lever: { lit: [leverGeo()], glow: [] }, scaffold: { lit: [scaffoldGeo()], glow: [] } })
