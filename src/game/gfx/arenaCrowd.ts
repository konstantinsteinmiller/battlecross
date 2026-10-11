import { BufferGeometry, Group, InstancedMesh, Matrix4, Mesh, Quaternion, Vector3 } from 'three'
import { CELL } from '../sim/grid'
import type { ZonePlan } from '../sim/zoneGen'
import { mulberry32 } from '../sim/rng'
import { celVC, celVCInst, outlineMat } from './cel'
import { merge, paint, rbox, rcyl, sph, xform } from './kit'
import type { Particles } from './particles'

/**
 * ─── The colosseum's spectacle (roadmap #117) ──────────────────────────────
 *
 * What the sand was missing: stone stands climbing away beyond the wall,
 * full of a crowd that bobs and jumps when a wave falls; tall crimson and
 * gold banners just inside the wall, seen from anywhere on the sand; and
 * confetti thrown over the arena on a cheer. The stands are four rings, each
 * a step higher and further out than the last (never two surfaces in one
 * plane); the spectators are instanced, one mesh per coat colour.
 */

const COATS = ['#d8584a', '#4a8ad8', '#e8c040', '#6ac06a', '#b86ad8', '#e88a3a']
const SKIN = ['#f0c8a0', '#d8a078', '#a87050']
const _m = new Matrix4()
const _q = new Quaternion()
const _p = new Vector3()
const _s = new Vector3()
const _up = new Vector3(0, 1, 0)

interface Fan { mesh: InstancedMesh; line: InstancedMesh; seats: Array<{ x: number; y: number; z: number; rot: number; phase: number; s: number }> }

export class ArenaCrowd {
  readonly root = new Group()
  private fans: Fan[] = []
  private owned: BufferGeometry[] = []
  /** 0 calm .. 1 on its feet; eases back down. */
  private excite = 0.15
  private time = 0
  private cx: number
  private cz: number

  constructor(plan: ZonePlan, private particles: Particles, private low: boolean) {
    this.cx = (plan.w / 2) * CELL
    this.cz = (plan.h / 2) * CELL
    const rng = mulberry32((plan.seed ^ 0xc0105) >>> 0)
    const R0 = 17
    // ── The stands: four stone steps, each higher and further out ──
    const steps: BufferGeometry[] = []
    const SEGS = 40
    for (let t = 0; t < 4; t++) {
      const r = R0 + t * 1.8
      const top = 0.9 + t * 0.9
      const arc = (2 * Math.PI * r) / SEGS
      for (let k = 0; k < SEGS; k++) {
        const a = (k / SEGS) * Math.PI * 2
        // Neighbouring blocks overlap a little at the joint: every other one
        // stands 5 cm prouder, so their tops are never one plane. Each step
        // reaches 0.3 m in under the one before it (no shared faces).
        const h = top + (k % 2 ? 0.05 : 0)
        steps.push(xform(paint(rbox(arc * 1.06, h, 2.1, 0.04, 4, 3), t % 2 ? '#c8b088' : '#b8a078'), [this.cx + Math.cos(a) * (r + 0.75), h / 2, this.cz + Math.sin(a) * (r + 0.75)], [0, -a + Math.PI / 2, 0]))
      }
    }
    const stands = merge(steps)
    this.owned.push(stands)
    const sm = new Mesh(stands, celVC())
    const so = new Mesh(stands, outlineMat())
    so.renderOrder = -1
    this.root.add(sm, so)

    // ── The crowd: seated evenly along every step (never two in one place),
    // a coat drawn for each seat; one instanced mesh per coat ──
    const PER_STEP = this.low ? 44 : 100
    const byCoat: Array<Fan['seats']> = COATS.map(() => [])
    for (let t = 0; t < 4; t++) {
      const r = R0 + t * 1.8 + 0.9
      const n = Math.round(PER_STEP * (r / (R0 + 0.9)))
      for (let q = 0; q < n; q++) {
        const a = ((q + (t % 2) * 0.5) / n) * Math.PI * 2
        const x = this.cx + Math.cos(a) * r
        const z = this.cz + Math.sin(a) * r
        byCoat[Math.floor(rng() * COATS.length)]!.push({ x, y: 0.9 + t * 0.9, z, rot: Math.atan2(this.cx - x, this.cz - z), phase: rng() * 6.28, s: 0.85 + rng() * 0.3 })
      }
    }
    for (let c = 0; c < COATS.length; c++) {
      const skin = SKIN[c % SKIN.length]!
      const g = merge([
        xform(paint(sph(1, 8, 6), COATS[c]!), [0, 0.45, 0], [0, 0, 0], [0.32, 0.45, 0.26]),
        xform(paint(sph(0.24, 8, 6), skin), [0, 1.05, 0])
      ])
      this.owned.push(g)
      const seats = byCoat[c]!
      const mesh = new InstancedMesh(g, celVCInst(), Math.max(1, seats.length))
      const line = new InstancedMesh(g, outlineMat(undefined, undefined, true), Math.max(1, seats.length))
      line.renderOrder = -1
      mesh.count = seats.length
      line.count = seats.length
      const fan = { mesh, line, seats }
      this.place(fan, 0)
      this.root.add(mesh, line)
      this.fans.push(fan)
    }

    // ── Banners: tall poles inside the wall, crimson and gold cloths ──
    const parts: BufferGeometry[] = []
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + 0.2
      const x = this.cx + Math.cos(a) * 13.6
      const z = this.cz + Math.sin(a) * 13.6
      const rot = -a + Math.PI / 2
      parts.push(xform(paint(rcyl(0.09, 5.2, 0.03, 8, 1), '#6a4a2a'), [x, 2.6, z]))
      parts.push(xform(paint(sph(0.16, 8, 6), '#ffd84a'), [x, 5.3, z]))
      parts.push(xform(paint(rbox(1.2, 1.9, 0.06, 0.1, 4, 3), k % 2 ? '#c8283c' : '#e8b030'), [x + Math.cos(a + Math.PI / 2) * 0.62, 4.2, z + Math.sin(a + Math.PI / 2) * 0.62], [0, rot, 0]))
      parts.push(xform(paint(rbox(0.5, 0.5, 0.08, 0.2, 4, 3), k % 2 ? '#ffd84a' : '#c8283c'), [x + Math.cos(a + Math.PI / 2) * 0.62, 4.25, z + Math.sin(a + Math.PI / 2) * 0.62], [0, rot, Math.PI / 4]))
    }
    const banners = merge(parts)
    this.owned.push(banners)
    const bm = new Mesh(banners, celVC())
    const bo = new Mesh(banners, outlineMat())
    bo.renderOrder = -1
    this.root.add(bm, bo)
  }

  private place(f: Fan, time: number): void {
    for (let n = 0; n < f.seats.length; n++) {
      const s = f.seats[n]!
      // Bobbing in their seats; on a cheer, on their feet and jumping.
      const hop = Math.max(0, Math.sin(time * (3 + this.excite * 6) + s.phase)) * (0.05 + this.excite * 0.45)
      _q.setFromAxisAngle(_up, s.rot)
      _p.set(s.x, s.y + hop, s.z)
      _s.setScalar(s.s)
      _m.compose(_p, _q, _s)
      f.mesh.setMatrixAt(n, _m)
      f.line.setMatrixAt(n, _m)
    }
    f.mesh.instanceMatrix.needsUpdate = true
    f.line.instanceMatrix.needsUpdate = true
  }

  /** The crowd roars: `big` for a milestone. Confetti over the sand round (x, z). */
  cheer(x: number, z: number, big = false): void {
    this.excite = big ? 1 : Math.max(this.excite, 0.7)
    const n = (big ? 70 : 30) * (this.low ? 0.4 : 1)
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2
      const d = 3 + Math.random() * 6
      this.particles.emit({
        x: x + Math.cos(a) * d, y: 5 + Math.random() * 3, z: z + Math.sin(a) * d,
        vx: (Math.random() - 0.5) * 2, vy: -0.4 - Math.random(), vz: (Math.random() - 0.5) * 2,
        color: COATS[k % COATS.length]!, size: 0.22, sizeEnd: 0.16, life: 1.6 + Math.random(), gravity: 1.2, drag: 0.6
      })
    }
  }

  update(dt: number): void {
    this.time += dt
    this.excite += (0.15 - this.excite) * Math.min(1, dt * 0.6)
    for (const f of this.fans) this.place(f, this.time)
  }

  dispose(): void {
    for (const g of this.owned) g.dispose()
    this.root.removeFromParent()
  }
}
