import { Group, InstancedMesh, Matrix4, Quaternion, Vector3, type BufferGeometry, type Scene } from 'three'
import { sfx } from '../audio/sfx'
import { sceneQuality } from '../engine/quality'
import { isPylon } from '../sim/invasion'
import type { SimEvent } from '../sim/types'
import type { Sim } from '../sim/world'
import { celVCInst, glowVCInst, outlineMat } from './cel'
import { groundAt } from './ground'
import { demonPylonGeo } from './setPieces'
import type { Vfx } from './vfx'

/**
 * ─── The demon pylons of an invaded zone (afterplay §3) ──────────────────────
 *
 * The sim keeps each pylon as a unit that never acts (`sim/invasion.ts`); this
 * draws them, every one of a visit in ONE instanced draw for the stone, one
 * for its outline and one for its glow (§14: "pylons instanced, 1 draw"), and
 * answers their events:
 *
 *   a hit    it shudders, red sparks fly off the struck side;
 *   its end  it cracks and sinks into the ground in a burst of embers.
 */

const SINK = 0.7
const EMBER = '#ff4a2a'

interface PylonView { id: number; x: number; z: number; y: number; a: number; shake: number; sinkT: number }

const _m = new Matrix4()
const _q = new Quaternion()
const _p = new Vector3()
const _s = new Vector3()
const _up = new Vector3(0, 1, 0)

export class PylonProps {
  private root = new Group()
  private views: PylonView[] = []
  private meshes: InstancedMesh[] = []
  private geos: BufferGeometry[] = []
  private low = sceneQuality() === 'low'

  constructor(private sim: Sim, private vfx: Vfx) {}

  /** Build the visit's pylons (nothing when it has none). */
  build(scene: Scene): boolean {
    const units = this.sim.units.filter(u => isPylon(u) && u.alive)
    if (!units.length) return false
    const { lit, glow } = demonPylonGeo()
    this.geos.push(lit, glow)
    const n = units.length
    const stone = new InstancedMesh(lit, celVCInst(), n)
    const line = new InstancedMesh(lit, outlineMat(undefined, undefined, true), n)
    line.renderOrder = -1
    const shine = new InstancedMesh(glow, glowVCInst(), n)
    this.meshes.push(stone, line, shine)
    for (const u of units) this.views.push({ id: u.id, x: u.x, z: u.z, y: groundAt(u.x, u.z), a: (u.id * 0.83) % (Math.PI / 2), shake: 0, sinkT: -1 })
    for (const m of this.meshes) {
      m.frustumCulled = false
      this.root.add(m)
    }
    this.place()
    scene.add(this.root)
    return true
  }

  onEvent(e: SimEvent): void {
    if (!this.views.length) return
    if (e.t === 'hit') {
      const v = this.views.find(q => q.id === e.tgt)
      if (!v || v.sinkT >= 0) return
      v.shake = 1
      const ps = this.vfx.particles
      for (let q = 0; q < (this.low ? 3 : 7); q++) {
        const a = Math.random() * Math.PI * 2
        ps.emit({
          x: v.x, y: v.y + 0.8 + Math.random() * 1.6, z: v.z, vx: Math.cos(a) * 2.2, vy: 1.2 + Math.random() * 2, vz: Math.sin(a) * 2.2,
          color: q % 2 ? EMBER : '#ffb02a', size: 0.12, sizeEnd: 0.03, life: 0.45 + Math.random() * 0.3, gravity: 6, drag: 0.8
        })
      }
    } else if (e.t === 'death') {
      const v = this.views.find(q => q.id === e.unit)
      if (!v || v.sinkT >= 0) return
      v.sinkT = 0
      const ps = this.vfx.particles
      for (let q = 0; q < (this.low ? 12 : 28); q++) {
        const a = Math.random() * Math.PI * 2
        const sp = 1 + Math.random() * 3.4
        ps.emit({
          x: v.x, y: v.y + Math.random() * 3, z: v.z, vx: Math.cos(a) * sp, vy: 1.5 + Math.random() * 4, vz: Math.sin(a) * sp,
          color: q % 3 ? EMBER : '#3a1a1e', size: 0.16 + Math.random() * 0.1, sizeEnd: 0.04, life: 0.8 + Math.random() * 0.6, gravity: 7, drag: 0.7
        })
      }
      this.vfx.ring(v.x, v.z, 0.3, 2.6, EMBER, 0.5)
      sfx('chest', 0, 0.5)
    }
  }

  update(dt: number): void {
    if (!this.views.length) return
    let moving = false
    for (const v of this.views) {
      if (v.shake > 0) { v.shake = Math.max(0, v.shake - dt * 5); moving = true }
      if (v.sinkT >= 0 && v.sinkT < SINK) { v.sinkT = Math.min(SINK, v.sinkT + dt); moving = true }
    }
    if (moving) this.place()
  }

  /** Every pylon's matrix: a shudder after a blow, sunk away once it has fallen. */
  private place(): void {
    this.views.forEach((v, k) => {
      const sunk = v.sinkT < 0 ? 0 : v.sinkT / SINK
      const wob = Math.sin(v.shake * 30) * v.shake * 0.06
      _q.setFromAxisAngle(_up, v.a)
      _p.set(v.x + wob, v.y - sunk * 3.4, v.z)
      // Gone once sunk: a zero scale draws nothing.
      _s.setScalar(sunk >= 1 ? 0 : 1)
      _m.compose(_p, _q, _s)
      for (const m of this.meshes) m.setMatrixAt(k, _m)
    })
    for (const m of this.meshes) m.instanceMatrix.needsUpdate = true
  }

  dispose(): void {
    this.root.parent?.remove(this.root)
    for (const m of this.meshes) m.dispose()
    for (const g of this.geos) g.dispose()
    this.views.length = 0
    this.meshes.length = 0
  }
}
