import { DoubleSide, Group, Mesh, MeshBasicMaterial, type BufferGeometry, type Scene } from 'three'
import { sfx } from '../audio/sfx'
import { sceneQuality } from '../engine/quality'
import { CART_END_Z, CART_START_Z, LANE_X, UNDER_LAYOUT } from '../sim/undercroftMap'
import type { SimEvent } from '../sim/types'
import type { Sim } from '../sim/world'
import { celVC, glowVC, outlineMat } from './cel'
import { groundAt } from './ground'
import { merge, paint, rbox, rcyl, sph, xform } from './kit'
import type { Vfx } from './vfx'

/**
 * The Smugglers' Undercroft, drawn (roadmap #EXT-1, `sim/undercroft.ts`): the rail lane (two rails and their sleepers, missing over
 * each gap, a dark pit there), the barrels that sit on the lane, the wall braziers (cold until the hero passes), and the mine
 * cart the hero rides in the run. Nothing is allocated per frame.
 */

const P = (g: BufferGeometry, hex: string, p?: [number, number, number], r?: [number, number, number], s?: number | [number, number, number]): BufferGeometry =>
  xform(paint(g, hex), p, r, s ?? 1)

const OAK = '#7a5434'
const OAK2 = '#5d3e24'
const IRON = '#4a4650'
const STONE = '#6a6258'

const barrelGeo = (): BufferGeometry => merge([
  P(rcyl(0.46, 0.95, 0.12, 12, 2), OAK, [0, 0.48, 0]),
  P(rcyl(0.49, 0.1, 0.03, 12, 1), IRON, [0, 0.22, 0]),
  P(rcyl(0.49, 0.1, 0.03, 12, 1), IRON, [0, 0.76, 0]),
  P(rcyl(0.3, 0.05, 0.02, 10, 1), OAK2, [0, 0.97, 0])
])
const brazierGeo = (): BufferGeometry => merge([
  P(rbox(0.7, 0.3, 0.7, 0.2, 6, 4), STONE, [0, 0.15, 0]),
  P(rcyl(0.1, 1.1, 0.03, 8, 1), OAK2, [0, 0.8, 0]),
  P(rcyl(0.38, 0.22, 0.06, 10, 1), IRON, [0, 1.42, 0])
])
const flameGeo = (): BufferGeometry => merge([P(sph(0.3, 8, 6), '#ffb02a', [0, 1.72, 0], [0, 0, 0], [1, 1.5, 1]), P(sph(0.18, 6, 5), '#fff0a0', [0, 1.7, 0])])
const cartGeo = (): BufferGeometry => merge([
  P(rbox(1.35, 0.55, 1.9, 0.25, 8, 6), IRON, [0, 0.55, 0]),
  P(rbox(1.5, 0.12, 2.05, 0.4, 8, 4), OAK, [0, 0.86, 0]),
  P(rbox(1.2, 0.08, 1.7, 0.3, 6, 4), '#2a2430', [0, 0.78, 0]),
  ...[-1, 1].flatMap(sx => [-1, 1].map(sz => P(rcyl(0.26, 0.12, 0.04, 10, 1), OAK2, [sx * 0.72, 0.26, sz * 0.62], [0, 0, Math.PI / 2])))
])

export class UndercroftProps {
  private root = new Group()
  private geos: BufferGeometry[] = []
  private low = sceneQuality() === 'low'
  private barrels: Array<{ g: Group; i: number }> = []
  private flames: Mesh[] = []
  private cart: Group | null = null
  private pits: MeshBasicMaterial[] = []
  private pulse = 0

  constructor(private sim: Sim, private vfx: Vfx, private trauma: (n: number) => void) {}

  private body(geo: BufferGeometry, x: number, z: number, y = 0): Group {
    this.geos.push(geo)
    const g = new Group()
    const m = new Mesh(geo, celVC())
    const l = new Mesh(geo, outlineMat())
    l.renderOrder = -1
    m.frustumCulled = l.frustumCulled = false
    g.add(m, l)
    g.position.set(x, groundAt(x, z) + y, z)
    this.root.add(g)
    return g
  }

  build(scene: Scene): void {
    const u = this.sim.under
    if (!u) return
    // The rails and sleepers, broken over each gap.
    const gaps = u.cart.obstacles.filter(o => o.kind === 'gap')
    const inGap = (z: number): boolean => gaps.some(o => Math.abs(z - o.z) < o.len / 2 + 0.1)
    const parts: BufferGeometry[] = []
    for (let z = CART_START_Z; z > CART_END_Z; z -= 1.3) {
      if (inGap(z)) continue
      parts.push(P(rbox(1.7, 0.1, 0.32, 0.3, 4, 3), OAK2, [LANE_X, 0.05, z]))
      for (const s of [-0.58, 0.58]) parts.push(P(rbox(0.13, 0.12, 1.4, 0.3, 3, 4), IRON, [LANE_X + s, 0.14, z]))
    }
    const rails = merge(parts)
    for (const p of parts) p.dispose()
    this.geos.push(rails)
    const rm = new Mesh(rails, celVC())
    rm.frustumCulled = false
    this.root.add(rm)
    // The pits in the gaps: dark decals laid on the ground.
    for (const o of gaps) {
      const mat = new MeshBasicMaterial({ color: '#0a0806', transparent: true, opacity: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, side: DoubleSide })
      const geo = rbox(2.4, 0.02, o.len, 0.1, 2, 2)
      this.geos.push(geo)
      const m = new Mesh(geo, mat)
      m.position.set(o.x, groundAt(o.x, o.z) + 0.05, o.z)
      m.frustumCulled = false
      this.root.add(m)
      this.pits.push(mat)
    }
    // The barrels.
    const bg = barrelGeo()
    this.geos.push(bg)
    u.cart.obstacles.forEach((o, i) => {
      if (o.kind !== 'barrel') return
      const g = new Group()
      const m = new Mesh(bg, celVC())
      const l = new Mesh(bg, outlineMat())
      l.renderOrder = -1
      m.frustumCulled = l.frustumCulled = false
      g.add(m, l)
      g.position.set(o.x, groundAt(o.x, o.z), o.z)
      this.root.add(g)
      this.barrels.push({ g, i })
    })
    // The braziers: a cold bowl until the hero passes.
    const brg = brazierGeo()
    const fg = flameGeo()
    this.geos.push(brg, fg)
    for (const b of UNDER_LAYOUT.braziers) {
      const g = new Group()
      const m = new Mesh(brg, celVC())
      const l = new Mesh(brg, outlineMat())
      l.renderOrder = -1
      m.frustumCulled = l.frustumCulled = false
      g.add(m, l)
      g.position.set(b.x, groundAt(b.x, b.z), b.z)
      this.root.add(g)
      const f = new Mesh(fg, glowVC())
      f.frustumCulled = false
      f.position.copy(g.position)
      f.visible = false
      this.root.add(f)
      this.flames.push(f)
    }
    // The cart under the hero (hidden outside the run).
    this.cart = this.body(cartGeo(), 0, 0)
    this.cart.visible = false
    scene.add(this.root)
  }

  onEvent(e: SimEvent): void {
    if (e.t !== 'under') return
    switch (e.id) {
      case 'drop':
        sfx('swingHeavy', 0, 0.6)
        break
      case 'land':
        sfx('quake', 0, 0.9)
        sfx('hitHeavy', 0, 0.7)
        this.trauma(0.8)
        this.vfx.ring(e.x, e.z, 0.4, 4.2, '#b3a48c', 0.6)
        for (let q = 0; q < (this.low ? 10 : 26); q++) {
          const a = Math.random() * Math.PI * 2
          this.vfx.particles.emit({ x: e.x + Math.cos(a) * 0.8, y: 0.2, z: e.z + Math.sin(a) * 0.8, vx: Math.cos(a) * (2 + Math.random() * 2), vy: 1 + Math.random() * 2, vz: Math.sin(a) * (2 + Math.random() * 2), color: q % 2 ? '#b3a48c' : '#7a5a3a', size: 0.35, sizeEnd: 0.08, life: 1, gravity: 3, drag: 1 })
        }
        break
      case 'brazier':
        sfx('castFire', 0, 0.5)
        this.vfx.ring(e.x, e.z, 0.3, 2.6, '#ffb02a', 0.5)
        break
      case 'cartStart':
        sfx('quake', 0, 0.7)
        this.trauma(0.4)
        break
      case 'barrel':
        sfx('hitHeavy', 0, 0.9)
        this.trauma(0.5)
        for (let q = 0; q < (this.low ? 6 : 14); q++) {
          const a = Math.random() * Math.PI * 2
          this.vfx.particles.emit({ x: e.x, y: 0.5, z: e.z, vx: Math.cos(a) * 3, vy: 2 + Math.random() * 3, vz: Math.sin(a) * 3, color: q % 2 ? '#7a5434' : '#c8a060', size: 0.14, sizeEnd: 0.03, life: 0.7, gravity: 9, drag: 0.5 })
        }
        break
      case 'gap':
        sfx('quake', 0, 0.8)
        this.trauma(0.55)
        this.vfx.ring(e.x, e.z, 0.3, 2.4, '#8a6a4a', 0.4)
        break
      case 'cartEnd':
        sfx('hitHeavy', 0, 0.8)
        this.trauma(0.6)
        break
      case 'warden':
        sfx('bossIntro', 0, 0.9)
        this.trauma(0.7)
        break
      case 'won':
        sfx('crowdCheer', 0, 0.8)
        this.vfx.ring(e.x, e.z + 4, 0.5, 5, '#ffd24a', 0.7)
        break
    }
  }

  update(dt: number): void {
    const u = this.sim.under
    if (!u) return
    this.pulse += dt
    u.braziers.forEach((b, q) => {
      const f = this.flames[q]
      if (!f) return
      f.visible = b.lit
      if (b.lit) {
        f.scale.set(1 + Math.sin(this.pulse * 14 + q) * 0.12, 1 + Math.sin(this.pulse * 11 + q * 2) * 0.18, 1)
        if (!this.low && Math.random() < dt * 5) this.vfx.particles.emit({ x: b.x, y: 2.0, z: b.z, vx: (Math.random() - 0.5) * 0.4, vy: 1 + Math.random(), vz: 0, color: '#ff8a2a', size: 0.1, sizeEnd: 0.02, life: 0.6 })
      }
    })
    for (const { g, i } of this.barrels) g.visible = !u.cart.obstacles[i]!.hit
    const h = this.sim.hero.unit
    if (this.cart) {
      this.cart.visible = u.cart.on
      if (u.cart.on) {
        this.cart.position.set(h.x, groundAt(h.x, h.z) + 0.02, h.z)
        this.cart.rotation.z = Math.sin(this.pulse * 18) * 0.015
      }
    }
  }

  dispose(): void {
    this.root.parent?.remove(this.root)
    for (const g of this.geos) g.dispose()
    for (const m of this.pits) m.dispose()
    this.geos.length = 0
  }
}
