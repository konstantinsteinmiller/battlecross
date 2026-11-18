import { Group, Mesh, type BufferGeometry, type Scene } from 'three'
import { sfx } from '../audio/sfx'
import { sceneQuality } from '../engine/quality'
import type { SimEvent } from '../sim/types'
import type { Sim } from '../sim/world'
import { boulderAt, LANE_OFFSETS } from '../sim/tricks'
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
  private levers: Group[] = []
  private boulders: Mesh[][] = []
  private ringT = 0
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
    tr.pots.forEach((p, q) => {
      const v = this.pots[q]
      if (v) v.brew.visible = p.lit
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
export const hollowsTrickParts = (): Record<'pot' | 'lever', { lit: BufferGeometry[]; glow: BufferGeometry[] }> =>
  ({ pot: { lit: [potGeo()], glow: [brewGeo()] }, lever: { lit: [leverGeo()], glow: [] } })
