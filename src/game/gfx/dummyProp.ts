import { Group, Mesh, type BufferGeometry, type Scene } from 'three'
import { sfx } from '../audio/sfx'
import { sceneQuality } from '../engine/quality'
import type { SimEvent } from '../sim/types'
import type { Sim } from '../sim/world'
import { DUMMY_KIND } from '../coach/dummy'
import { celVC, outlineMat } from './cel'
import { ell, merge, paint, rbox, rcone, rcyl, sph, torus, xform } from './kit'
import { groundAt } from './ground'
import type { Vfx } from './vfx'

/**
 * ─── The straw training dummy's look (roadmap #52) ───────────────────────────
 *
 * A burlap sack on a post, arms on a cross-bar, straw sticking out of every
 * seam and a red-and-white target painted on its chest — the first thing a
 * new player hits. The sim keeps it as a unit that never acts
 * (`coach/dummy.ts`); this draws it and answers its two events:
 *
 *   a hit    it rocks away from the blow on a spring, the head nods a beat
 *            later, the sack squashes and a puff of straw flies off it;
 *   its end  it bursts: head, sack and arms fly off with a cloud of straw,
 *            bounce, and shrink away; the bare post is left leaning.
 *
 * Five small parts, two draws each, built once (the tutorial visit only).
 */

const P = (g: BufferGeometry, hex: string, p?: [number, number, number], r?: [number, number, number], s?: number | [number, number, number]): BufferGeometry =>
  xform(paint(g, hex), p, r, s ?? 1)

const WOOD = '#8a5a2e'
const WOOD_LIGHT = '#a8703c'
const BURLAP = '#d8b26a'
const BURLAP_DARK = '#b98f4c'
const ROPE = '#7c5a32'
const STRAW = '#f2d35a'
const STRAW_DARK = '#d9a92e'
const RED = '#e8443a'
const CREAM = '#fff4dc'
const INK = '#3b2a1a'

/** Height of the post's top, where the sack hangs. */
const TOP = 1.32
/** The neck: the head nods about it. */
const NECK = 1.55

const straw = (out: BufferGeometry[], p: [number, number, number], r: [number, number, number], n = 3, len = 0.2): void => {
  for (let k = 0; k < n; k++) {
    const t = (k - (n - 1) / 2) * 0.22
    out.push(P(rcone(0.035, 0.008, len, 0.01, 6), k % 2 ? STRAW : STRAW_DARK, p, [r[0] + t, r[1], r[2] + t * 0.7]))
  }
}

const buildParts = (): { post: BufferGeometry; arms: BufferGeometry; body: BufferGeometry; head: BufferGeometry } => {
  // The post and its cross-foot.
  const post = merge([
    P(rcyl(0.075, TOP + 0.1, 0.03, 10), WOOD, [0, (TOP + 0.1) / 2, 0]),
    P(rbox(0.9, 0.09, 0.14, 0.4, 8, 6), WOOD_LIGHT, [0, 0.05, 0]),
    P(rbox(0.14, 0.09, 0.9, 0.4, 8, 6), WOOD_LIGHT, [0, 0.05, 0]),
    P(sph(0.09, 8, 6), WOOD, [0, TOP + 0.12, 0])
  ])
  // The cross-bar with sleeves of sack and straw hands.
  const a: BufferGeometry[] = [
    P(rcyl(0.05, 1.12, 0.02, 8), WOOD_LIGHT, [0, TOP - 0.04, 0], [0, 0, Math.PI / 2]),
    P(ell(0.16, 0.11, 0.11, 10, 8), BURLAP_DARK, [-0.42, TOP - 0.04, 0]),
    P(ell(0.16, 0.11, 0.11, 10, 8), BURLAP_DARK, [0.42, TOP - 0.04, 0]),
    P(torus(0.1, 0.025, 6, 12), ROPE, [-0.53, TOP - 0.04, 0], [0, Math.PI / 2, 0]),
    P(torus(0.1, 0.025, 6, 12), ROPE, [0.53, TOP - 0.04, 0], [0, Math.PI / 2, 0])
  ]
  straw(a, [-0.62, TOP - 0.04, 0], [0, 0, Math.PI / 2], 4, 0.22)
  straw(a, [0.62, TOP - 0.04, 0], [0, 0, -Math.PI / 2], 4, 0.22)
  const arms = merge(a)
  // The sack: a stuffed body tied at the waist, the target on its chest.
  const b: BufferGeometry[] = [
    P(ell(0.3, 0.38, 0.24, 14, 10), BURLAP, [0, TOP - 0.16, 0]),
    P(torus(0.27, 0.035, 6, 18), ROPE, [0, TOP - 0.3, 0], [Math.PI / 2, 0, 0], [1, 0.9, 1]),
    // A patch, stitched on crooked.
    P(rbox(0.12, 0.1, 0.03, 0.3, 6, 4), BURLAP_DARK, [-0.17, TOP - 0.38, 0.2], [0, 0.3, 0.3]),
    // The target: red, cream, red.
    P(rcyl(0.15, 0.03, 0.01, 18), RED, [0, TOP - 0.08, 0.235], [Math.PI / 2, 0, 0]),
    P(rcyl(0.1, 0.03, 0.01, 18), CREAM, [0, TOP - 0.08, 0.25], [Math.PI / 2, 0, 0]),
    P(rcyl(0.05, 0.03, 0.01, 14), RED, [0, TOP - 0.08, 0.265], [Math.PI / 2, 0, 0])
  ]
  straw(b, [0, TOP - 0.52, 0], [Math.PI, 0, 0], 5, 0.18)
  straw(b, [0, TOP + 0.2, 0], [0, 0, 0], 3, 0.12)
  const body = merge(b)
  // The head: a little sack with button eyes and a stitched grin, straw hair.
  const h: BufferGeometry[] = [
    P(ell(0.21, 0.2, 0.19, 12, 9), BURLAP, [0, NECK + 0.14, 0]),
    P(torus(0.11, 0.03, 6, 14), ROPE, [0, NECK + 0.0, 0], [Math.PI / 2, 0, 0]),
    // X eyes.
    P(rbox(0.08, 0.018, 0.02, 0.4, 4, 3), INK, [-0.075, NECK + 0.17, 0.18], [0, 0, 0.75]),
    P(rbox(0.08, 0.018, 0.02, 0.4, 4, 3), INK, [-0.075, NECK + 0.17, 0.18], [0, 0, -0.75]),
    P(rbox(0.08, 0.018, 0.02, 0.4, 4, 3), INK, [0.075, NECK + 0.17, 0.18], [0, 0, 0.75]),
    P(rbox(0.08, 0.018, 0.02, 0.4, 4, 3), INK, [0.075, NECK + 0.17, 0.18], [0, 0, -0.75]),
    P(torus(0.07, 0.012, 4, 10, Math.PI), INK, [0, NECK + 0.1, 0.17], [0, 0, Math.PI])
  ]
  straw(h, [0, NECK + 0.32, 0], [0, 0, 0], 5, 0.16)
  straw(h, [-0.18, NECK + 0.22, 0], [0, 0, 0.9], 2, 0.12)
  straw(h, [0.18, NECK + 0.22, 0], [0, 0, -0.9], 2, 0.12)
  const head = merge(h)
  return { post, arms, body, head }
}

interface Piece {
  g: Group
  /** Flying after the burst: velocity, spin. */
  vx: number
  vy: number
  vz: number
  sx: number
  sz: number
}

/** A damped spring on two axes: the rock of a blow. */
interface Spring { ax: number; az: number; wx: number; wz: number }
const springStep = (s: Spring, k: number, c: number, dt: number): void => {
  s.wx += (-k * s.ax - c * s.wx) * dt
  s.wz += (-k * s.az - c * s.wz) * dt
  s.ax += s.wx * dt
  s.az += s.wz * dt
}

export class DummyProp {
  private root = new Group()
  /** Rocks about the foot of the post. */
  private tilt = new Group()
  private pieces: Piece[] = []
  private head!: Group
  private body!: Group
  private arms!: Group
  private geos: BufferGeometry[] = []
  private rock: Spring = { ax: 0, az: 0, wx: 0, wz: 0 }
  private nod: Spring = { ax: 0, az: 0, wx: 0, wz: 0 }
  private squash = 0
  private time = Math.random() * 6
  /** Seconds since it burst (-1: standing). */
  private burstT = -1
  private id = 0
  private x = 0
  private z = 0
  private facing = 0
  private low = sceneQuality() === 'low'

  constructor(private sim: Sim, private vfx: Vfx) {}

  /** Build it where the sim stood the dummy (nothing when this visit has none). */
  build(scene: Scene): boolean {
    const u = this.sim.units.find(q => q.kind === DUMMY_KIND)
    if (!u) return false
    this.id = u.id
    this.x = u.x
    this.z = u.z
    this.facing = u.facing
    const parts = buildParts()
    this.geos.push(parts.post, parts.arms, parts.body, parts.head)
    const part = (g: BufferGeometry, pivotY: number): Group => {
      const grp = new Group()
      const m = new Mesh(g, celVC())
      const o = new Mesh(g, outlineMat())
      o.renderOrder = -1
      // Authored in the dummy's own space: offset so the group turns about its pivot.
      m.position.y = o.position.y = -pivotY
      grp.position.y = pivotY
      grp.add(m, o)
      return grp
    }
    this.tilt.add(part(parts.post, 0))
    this.arms = part(parts.arms, TOP - 0.04)
    this.body = part(parts.body, TOP - 0.16)
    this.head = part(parts.head, NECK)
    this.tilt.add(this.arms, this.body, this.head)
    this.root.add(this.tilt)
    this.root.position.set(this.x, groundAt(this.x, this.z), this.z)
    this.root.rotation.y = this.facing
    scene.add(this.root)
    return true
  }

  onEvent(e: SimEvent): void {
    if (!this.id) return
    if (e.t === 'hit' && e.tgt === this.id) this.hit(e.src, e.crit || e.heavy)
    else if (e.t === 'death' && e.unit === this.id) this.burst()
  }

  /** A blow: it rocks away from whoever dealt it. */
  private hit(src: number, heavy: boolean): void {
    if (this.burstT >= 0) return
    const from = this.sim.get(src)
    let dx = 0
    let dz = 1
    if (from) {
      dx = this.x - from.x
      dz = this.z - from.z
      const l = Math.hypot(dx, dz) || 1
      dx /= l
      dz /= l
    }
    // World push → the dummy's own axes (it is turned by `facing`).
    const c = Math.cos(-this.facing)
    const s = Math.sin(-this.facing)
    const lx = dx * c - dz * s
    const lz = dx * s + dz * c
    const k = heavy ? 3.8 : 2.6
    this.rock.wx += lz * k
    this.rock.wz -= lx * k
    this.nod.wx += lz * k * 0.6
    this.nod.wz -= lx * k * 0.6
    this.squash = 1
    // A puff of straw off the side that was struck.
    const ps = this.vfx.particles
    const n = this.low ? 5 : 11
    const y = groundAt(this.x, this.z) + 1.1
    for (let q = 0; q < n; q++) {
      const a = Math.random() * Math.PI * 2
      ps.emit({
        x: this.x - dx * 0.25, y: y + Math.random() * 0.4, z: this.z - dz * 0.25,
        vx: dx * (1.5 + Math.random() * 2) + Math.cos(a) * 1.1, vy: 1.5 + Math.random() * 2.2, vz: dz * (1.5 + Math.random() * 2) + Math.sin(a) * 1.1,
        color: q % 3 ? STRAW : STRAW_DARK, size: 0.13 + Math.random() * 0.09, sizeEnd: 0.05, life: 0.55 + Math.random() * 0.35, gravity: 9, drag: 0.9
      })
    }
  }

  /** Knocked apart: the parts fly, straw everywhere, the post leans. */
  private burst(): void {
    if (this.burstT >= 0) return
    this.burstT = 0
    const gy = groundAt(this.x, this.z)
    const hero = this.sim.hero.unit
    let dx = this.x - hero.x
    let dz = this.z - hero.z
    const l = Math.hypot(dx, dz) || 1
    dx /= l
    dz /= l
    for (const [g, up, side] of [[this.head, 6.2, 0], [this.body, 3.6, 0.6], [this.arms, 4.6, -0.8]] as const) {
      // Out of the tilting post into the world, keeping where it was.
      g.updateWorldMatrix(true, false)
      const wp = g.getWorldPosition(g.position.clone())
      const q = g.getWorldQuaternion(g.quaternion.clone())
      this.tilt.remove(g)
      this.root.parent?.add(g)
      g.position.copy(wp)
      g.quaternion.copy(q)
      const a = Math.atan2(dx, dz) + side + (Math.random() - 0.5) * 0.6
      const sp = 2.2 + Math.random() * 1.6
      this.pieces.push({ g, vx: Math.sin(a) * sp, vy: up + Math.random(), vz: Math.cos(a) * sp, sx: (Math.random() - 0.5) * 14, sz: (Math.random() - 0.5) * 14 })
    }
    // The bare post leans back from the blow.
    this.rock.wx += 2
    const ps = this.vfx.particles
    const n = this.low ? 14 : 34
    for (let q = 0; q < n; q++) {
      const a = Math.random() * Math.PI * 2
      const sp = 1.2 + Math.random() * 3.6
      ps.emit({
        x: this.x, y: gy + 0.8 + Math.random() * 0.9, z: this.z, vx: Math.cos(a) * sp + dx * 1.5, vy: 2 + Math.random() * 4.5, vz: Math.sin(a) * sp + dz * 1.5,
        color: q % 4 === 0 ? BURLAP : q % 2 ? STRAW : STRAW_DARK, size: 0.14 + Math.random() * 0.12, sizeEnd: 0.05, life: 0.8 + Math.random() * 0.7, gravity: 8, drag: 0.7
      })
    }
    this.vfx.ring(this.x, this.z, 0.3, 2.4, STRAW, 0.5)
    this.vfx.ring(this.x, this.z, 0.2, 1.4, '#ffffff', 0.35)
    sfx('chest', 0, 0.7)
  }

  update(dt: number): void {
    if (!this.id) return
    this.time += dt
    springStep(this.rock, 70, 5.5, dt)
    springStep(this.nod, 120, 6, dt)
    const lean = this.burstT >= 0 ? 0.22 : 0
    // A breath of wind while it stands; the springs ride on top.
    const sway = this.burstT >= 0 ? 0 : Math.sin(this.time * 1.3) * 0.025
    this.tilt.rotation.x = Math.max(-0.6, Math.min(0.6, this.rock.ax + lean))
    this.tilt.rotation.z = Math.max(-0.6, Math.min(0.6, this.rock.az + sway))
    if (this.burstT < 0) {
      this.head.rotation.x = this.nod.ax
      this.head.rotation.z = this.nod.az - sway * 1.5
      this.squash = Math.max(0, this.squash - dt * 5)
      const k = Math.sin(this.squash * Math.PI) * 0.14
      this.body.scale.set(1 + k, 1 - k, 1 + k)
      return
    }
    this.burstT += dt
    for (const p of this.pieces) {
      const g = p.g
      p.vy -= 16 * dt
      g.position.x += p.vx * dt
      g.position.y += p.vy * dt
      g.position.z += p.vz * dt
      g.rotation.x += p.sx * dt
      g.rotation.z += p.sz * dt
      const floor = groundAt(g.position.x, g.position.z) + 0.12
      if (g.position.y < floor) {
        g.position.y = floor
        // A soft bounce, losing most of it.
        p.vy = Math.abs(p.vy) > 1.5 ? -p.vy * 0.35 : 0
        p.vx *= 0.55
        p.vz *= 0.55
        p.sx *= 0.5
        p.sz *= 0.5
      }
      // Gone after a moment on the ground: they shrink into the grass.
      const fade = Math.max(0, Math.min(1, (this.burstT - 1.7) / 0.5))
      g.scale.setScalar(1 - fade)
      g.visible = fade < 1
    }
  }

  dispose(): void {
    this.root.parent?.remove(this.root)
    for (const p of this.pieces) p.g.parent?.remove(p.g)
    for (const g of this.geos) g.dispose()
    this.pieces.length = 0
    this.id = 0
  }
}
