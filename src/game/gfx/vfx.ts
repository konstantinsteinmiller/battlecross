import {
  AdditiveBlending, CircleGeometry, Color, CylinderGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, NormalBlending,
  PlaneGeometry, RingGeometry, SphereGeometry, type BufferGeometry, type Scene
} from 'three'
import type { Projectile, SimEvent, Telegraph } from '../sim/types'
import { sceneQuality } from '../engine/quality'
import { Particles } from './particles'
import { glowTexture, ringTexture } from './textures'

/**
 * ─── Effects ─────────────────────────────────────────────────────────────────
 *
 * Everything that flashes, bursts, sweeps or glows. The sim says WHAT happened
 * (`SimEvent`); this turns it into light. Six pooled primitives carry all of
 * it, so a boss fight with meteors falling costs a fixed handful of draw calls
 * and allocates nothing per effect:
 *
 *   particles  one Points draw for every spark, ember, mote and trail
 *   rings      shockwaves expanding on the ground
 *   arcs       the sweep of a blade or a cone of breath
 *   discs      ground fields, telegraphs' fills, craters
 *   beams      lines between two points (lasers, drains, dashes)
 *   orbs       projectiles and things falling from the sky
 *
 * Telegraphs (the red warning under an enemy ability) live here too: a circle,
 * a cone or a line that FILLS as the wind-up runs out, in exactly the shape
 * the hit will have.
 */

const ENEMY_TELE = new Color('#ff3246')
const ALLY_TELE = new Color('#ffb84a')

interface Pooled {
  mesh: Mesh
  mat: MeshBasicMaterial
  t: number
  dur: number
  active: boolean
}

const basic = (additive: boolean, map = false): MeshBasicMaterial => new MeshBasicMaterial({
  color: 0xffffff, transparent: true, depthWrite: false, side: DoubleSide, toneMapped: false,
  blending: additive ? AdditiveBlending : NormalBlending, map: map ? glowTexture() : null
})

interface Ring extends Pooled { r0: number; r1: number }
interface Arc extends Pooled { r: number; half: number; breath: boolean }
interface Disc extends Pooled { r: number; kind: 'field' | 'flash' | 'tele'; fill: Mesh | null; pulse: number }
interface Beam extends Pooled { w: number }
interface Orb extends Pooled { x0: number; y0: number; z0: number; x1: number; y1: number; z1: number; trail: string; size: number; arc: number }
interface Tele extends Pooled { fill: Mesh; fillMat: MeshBasicMaterial; shape: Telegraph['shape'] }

/** How a projectile looks: core colour, size, and what it leaves behind. */
const SHOTS: Record<string, { color: string; size: number; trail: string; spark: string }> = {
  fireball: { color: '#ffb02a', size: 0.5, trail: '#ff6a1a', spark: '#ffd27a' },
  aether: { color: '#7ff4ff', size: 0.26, trail: '#4ff0c8', spark: '#e8ffff' },
  bolt: { color: '#b8a8ff', size: 0.3, trail: '#8a6aff', spark: '#e8e0ff' },
  bullet: { color: '#fff0c0', size: 0.2, trail: '#ffd27a', spark: '#ffffff' },
  arrow: { color: '#f4e8d0', size: 0.2, trail: '#c9b28a', spark: '#ffffff' },
  rock: { color: '#b8b0a4', size: 0.28, trail: '#8a8278', spark: '#e8e2d8' },
  ember: { color: '#ff8a2a', size: 0.36, trail: '#ff5a1a', spark: '#ffd27a' },
  shadow: { color: '#b06aff', size: 0.34, trail: '#6a2ad0', spark: '#e0b8ff' },
  web: { color: '#f0f0ff', size: 0.3, trail: '#c8c8e8', spark: '#ffffff' },
  water: { color: '#7fe8ff', size: 0.3, trail: '#3fc7e0', spark: '#e8ffff' },
  holy: { color: '#fff2a8', size: 0.32, trail: '#ffd84a', spark: '#ffffff' },
  rocket: { color: '#ffb04a', size: 0.36, trail: '#ff6a2a', spark: '#ffe0a8' },
  blast: { color: '#7ff4ff', size: 0.5, trail: '#4fd8ff', spark: '#ffffff' },
  bomb: { color: '#3a3440', size: 0.42, trail: '#ff8a3a', spark: '#ffd27a' },
  venom: { color: '#8dff5a', size: 0.4, trail: '#5fbf3a', spark: '#d8ffb8' },
  meteor: { color: '#ff7a1a', size: 0.9, trail: '#ff4a0a', spark: '#ffd27a' },
  icicle: { color: '#bfe6ff', size: 0.5, trail: '#7fc8ff', spark: '#ffffff' },
  geyser: { color: '#7fe8ff', size: 0.5, trail: '#3fc7e0', spark: '#ffffff' },
  curse: { color: '#b06aff', size: 0.5, trail: '#6a2ad0', spark: '#e0b8ff' },
  roots: { color: '#7a5a3a', size: 0.4, trail: '#5fae4a', spark: '#c8ff9a' },
  flask: { color: '#ff4a6a', size: 0.3, trail: '#c8283a', spark: '#ffb8c8' }
}
const shotOf = (fx: string) => SHOTS[fx] ?? SHOTS.bolt!

export class Vfx {
  readonly root = new Group()
  readonly particles: Particles
  private rings: Ring[] = []
  private arcs: Arc[] = []
  private discs: Disc[] = []
  private beams: Beam[] = []
  private orbs: Orb[] = []
  private teles: Tele[] = []
  private shots = new Map<Projectile, Mesh>()
  private shotPool: Mesh[] = []
  private ringGeo = new RingGeometry(0.82, 1, 48)
  private discGeo = new CircleGeometry(1, 40)
  private planeGeo = new PlaneGeometry(1, 1)
  private orbGeo = new SphereGeometry(1, 10, 8)
  private pillarGeo = new CylinderGeometry(1, 1, 1, 16, 1, true)
  private arcGeos = new Map<number, BufferGeometry>()
  private low = sceneQuality() === 'low'
  private time = 0

  constructor(scene: Scene) {
    this.particles = new Particles(this.low ? 700 : 1500)
    this.root.add(this.particles.points)
    scene.add(this.root)
  }

  /** Fewer particles on a weak device; the SHAPES of the effects stay. */
  private n(count: number): number {
    return this.low ? Math.max(2, Math.round(count * 0.5)) : count
  }

  // ─── Primitives ────────────────────────────────────────────────────────────

  ring(x: number, z: number, r0: number, r1: number, color: string, dur = 0.45, y = 0.06): void {
    let p = this.rings.find(q => !q.active)
    if (!p) {
      const mat = basic(true)
      const mesh = new Mesh(this.ringGeo, mat)
      mesh.rotation.x = -Math.PI / 2
      mesh.renderOrder = 4
      this.root.add(mesh)
      p = { mesh, mat, t: 0, dur, active: false, r0, r1 }
      this.rings.push(p)
    }
    p.active = true
    p.t = 0
    p.dur = dur
    p.r0 = r0
    p.r1 = r1
    p.mat.color.set(color)
    p.mesh.position.set(x, y, z)
    p.mesh.visible = true
  }

  /** A full pie slice (from the apex out): the cone telegraph. */
  private coneGeo(half: number): BufferGeometry {
    const key = -Math.round(half * 20) - 1
    let g = this.arcGeos.get(key)
    if (!g) {
      g = new CircleGeometry(1, 24, Math.PI / 2 - half, half * 2)
      this.arcGeos.set(key, g)
    }
    return g
  }

  private arcGeo(half: number): BufferGeometry {
    const key = Math.round(half * 20)
    let g = this.arcGeos.get(key)
    if (!g) {
      g = new RingGeometry(0.35, 1, 24, 1, Math.PI / 2 - half, half * 2)
      this.arcGeos.set(key, g)
    }
    return g
  }

  /** A sweep on the ground plane from (x, z) along angle `a`. */
  arc(x: number, z: number, a: number, r: number, half: number, color: string, dur = 0.22, breath = false): void {
    let p = this.arcs.find(q => !q.active)
    if (!p) {
      const mat = basic(true)
      const mesh = new Mesh(this.arcGeo(half), mat)
      mesh.renderOrder = 5
      this.root.add(mesh)
      p = { mesh, mat, t: 0, dur, active: false, r, half, breath }
      this.arcs.push(p)
    }
    p.mesh.geometry = this.arcGeo(half)
    p.active = true
    p.t = 0
    p.dur = dur
    p.r = r
    p.half = half
    p.breath = breath
    p.mat.color.set(color)
    p.mesh.position.set(x, breath ? 0.5 : 0.7, z)
    // The sector is cut around +Y in the XY plane. Laid flat (X by −90°) that
    // points at −Z, so a further half turn about Y brings it to heading 0 = +Z.
    p.mesh.rotation.set(-Math.PI / 2, a + Math.PI, 0, 'YXZ')
    p.mesh.visible = true
  }

  disc(x: number, z: number, r: number, color: string, dur: number, kind: Disc['kind'] = 'flash', additive = true): Disc {
    let p = this.discs.find(q => !q.active && (q.mat.blending === AdditiveBlending) === additive)
    if (!p) {
      const mat = basic(additive)
      const mesh = new Mesh(this.discGeo, mat)
      mesh.rotation.x = -Math.PI / 2
      mesh.renderOrder = 2
      this.root.add(mesh)
      p = { mesh, mat, t: 0, dur, active: false, r, kind, fill: null, pulse: 0 }
      this.discs.push(p)
    }
    p.active = true
    p.t = 0
    p.dur = dur
    p.r = r
    p.kind = kind
    p.mat.color.set(color)
    p.mesh.position.set(x, 0.04, z)
    p.mesh.scale.setScalar(r)
    p.mesh.visible = true
    return p
  }

  beam(x0: number, z0: number, x1: number, z1: number, w: number, color: string, dur = 0.3, y = 0.9): void {
    let p = this.beams.find(q => !q.active)
    if (!p) {
      const mat = basic(true, true)
      const mesh = new Mesh(this.planeGeo, mat)
      mesh.renderOrder = 6
      this.root.add(mesh)
      p = { mesh, mat, t: 0, dur, active: false, w }
      this.beams.push(p)
    }
    const dx = x1 - x0
    const dz = z1 - z0
    const len = Math.hypot(dx, dz) || 0.01
    p.active = true
    p.t = 0
    p.dur = dur
    p.w = w
    p.mat.color.set(color)
    p.mesh.position.set((x0 + x1) / 2, y, (z0 + z1) / 2)
    // Turned in its own plane first (Z), then laid flat: local +X runs A → B.
    p.mesh.rotation.set(-Math.PI / 2, 0, -Math.atan2(dz, dx), 'XYZ')
    p.mesh.scale.set(len, w * 2, 1)
    p.mesh.visible = true
  }

  /** A glowing ball that travels (a lobbed flask, a meteor from the sky). */
  orb(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, size: number, color: string, trail: string, dur: number, arc = 0): void {
    let p = this.orbs.find(q => !q.active)
    if (!p) {
      const mat = basic(true)
      const mesh = new Mesh(this.orbGeo, mat)
      mesh.renderOrder = 6
      this.root.add(mesh)
      p = { mesh, mat, t: 0, dur, active: false, x0, y0, z0, x1, y1, z1, trail, size, arc }
      this.orbs.push(p)
    }
    Object.assign(p, { active: true, t: 0, dur, x0, y0, z0, x1, y1, z1, trail, size, arc })
    p.mat.color.set(color)
    p.mat.opacity = 1
    p.mesh.scale.setScalar(size)
    p.mesh.position.set(x0, y0, z0)
    p.mesh.visible = true
  }

  /** A column of light standing on the ground for `dur` seconds. */
  pillar(x: number, z: number, r: number, h: number, color: string, dur: number): void {
    const d = this.disc(x, z, r, color, dur, 'field')
    if (!d.fill) {
      d.fill = new Mesh(this.pillarGeo, basic(true))
      d.fill.renderOrder = 5
      this.root.add(d.fill)
    }
    const m = d.fill.material as MeshBasicMaterial
    m.color.set(color)
    d.fill.position.set(x, h / 2, z)
    d.fill.scale.set(r * 0.8, h, r * 0.8)
    d.fill.visible = true
    d.pulse = h
  }

  // ─── Telegraphs ────────────────────────────────────────────────────────────

  telegraph(t: Telegraph): void {
    let p = this.teles.find(q => !q.active)
    if (!p) {
      const mat = basic(false)
      const fillMat = basic(false)
      const mesh = new Mesh(this.discGeo, mat)
      const fill = new Mesh(this.discGeo, fillMat)
      mesh.renderOrder = 3
      fill.renderOrder = 3
      this.root.add(mesh, fill)
      p = { mesh, mat, t: 0, dur: 1, active: false, fill, fillMat, shape: 'circle' }
      this.teles.push(p)
    }
    const col = t.team === 1 ? ENEMY_TELE : ALLY_TELE
    p.active = true
    p.t = 0
    p.dur = Math.max(0.05, t.dur)
    p.shape = t.shape
    p.mat.color.copy(col)
    p.fillMat.color.copy(col)
    const y = 0.05
    for (const m of [p.mesh, p.fill]) {
      m.visible = true
      if (t.shape === 'circle') {
        m.geometry = this.discGeo
        m.rotation.set(-Math.PI / 2, 0, 0, 'YXZ')
        m.position.set(t.x, y, t.z)
      } else if (t.shape === 'cone') {
        m.geometry = this.coneGeo(t.w)
        m.rotation.set(-Math.PI / 2, t.a + Math.PI, 0, 'YXZ')
        m.position.set(t.x, y, t.z)
      } else {
        m.geometry = this.planeGeo
        // The plane's local +Y runs along the line once it is laid flat.
        m.rotation.set(-Math.PI / 2, t.a, 0, 'YXZ')
        m.position.set(t.x + Math.sin(t.a) * t.r * 0.5, y, t.z + Math.cos(t.a) * t.r * 0.5)
      }
    }
    if (t.shape === 'line') {
      p.mesh.scale.set(t.w * 2, t.r, 1)
      p.fill.scale.set(t.w * 2, 0.001, 1)
    } else {
      p.mesh.scale.setScalar(t.r)
      p.fill.scale.setScalar(0.001)
    }
    p.fill.position.y = y + 0.01
    p.fill.userData.r = t.r
    p.fill.userData.w = t.w
    p.fill.userData.x = t.x
    p.fill.userData.z = t.z
    p.fill.userData.a = t.a
  }

  // ─── Compound effects ──────────────────────────────────────────────────────

  /** The hit spark at a unit: size by weight, colour by damage type. */
  impact(x: number, y: number, z: number, color: string, heavy: boolean, crit: boolean): void {
    const ps = this.particles
    const k = crit ? 1.6 : heavy ? 1.25 : 1
    ps.flash(x, y, z, '#ffffff', 0.9 * k, 0.09)
    ps.flash(x, y, z, color, 1.5 * k, 0.16)
    ps.sparks(x, y, z, color, this.n(crit ? 18 : heavy ? 12 : 7), 6 * k, 0.16 * k)
    if (crit) {
      ps.sparks(x, y, z, '#ffd700', this.n(10), 9, 0.2)
      this.ring(x, z, 0.3, 1.9, '#ffd700', 0.3, y * 0.5)
    } else if (heavy) this.ring(x, z, 0.3, 1.4, color, 0.25, 0.1)
  }

  burst(x: number, z: number, r: number, fx: string, color?: string): void {
    const s = shotOf(fx)
    const c = color || s.color
    const ps = this.particles
    this.disc(x, z, r, c, 0.32, 'flash')
    this.ring(x, z, r * 0.25, r * 1.15, c, 0.4)
    ps.flash(x, 0.7, z, '#ffffff', r * 1.3, 0.12)
    ps.flash(x, 0.8, z, c, r * 2.2, 0.26)
    const n = this.n(Math.round(14 + r * 6))
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2
      const sp = (0.5 + Math.random()) * r * 2.4
      ps.emit({
        x, y: 0.3, z, vx: Math.cos(a) * sp, vy: 2 + Math.random() * 5, vz: Math.sin(a) * sp,
        color: Math.random() < 0.35 ? s.spark : s.trail, size: 0.22 + Math.random() * 0.3, sizeEnd: 0.03, life: 0.35 + Math.random() * 0.4, gravity: 9, drag: 1.5
      })
    }
  }

  /** Dust and rock kicked up by something heavy landing. */
  slam(x: number, z: number, r: number, color: string): void {
    const ps = this.particles
    this.ring(x, z, r * 0.2, r, color, 0.38)
    this.ring(x, z, r * 0.1, r * 0.7, '#ffffff', 0.26)
    this.disc(x, z, r, color, 0.25, 'flash')
    const n = this.n(Math.round(10 + r * 5))
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2
      const sp = r * (1.6 + Math.random())
      ps.emit({ x: x + Math.cos(a) * 0.4, y: 0.15, z: z + Math.sin(a) * 0.4, vx: Math.cos(a) * sp, vy: 1.5 + Math.random() * 3, vz: Math.sin(a) * sp, color: Math.random() < 0.5 ? '#d8c8b0' : color, size: 0.3 + Math.random() * 0.3, sizeEnd: 0.05, life: 0.4 + Math.random() * 0.3, gravity: 7, drag: 2.2 })
    }
  }

  /** A poof where something appeared or vanished. */
  poof(x: number, z: number, color: string, scale = 1): void {
    const ps = this.particles
    ps.flash(x, 0.8, z, color, 1.8 * scale, 0.2)
    ps.riseRing(x, 0.1, z, color, 0.6 * scale, this.n(12))
    ps.sparks(x, 0.9, z, color, this.n(10), 4 * scale, 0.2)
  }

  /** The burst of a death: bigger for bigger things. */
  death(x: number, z: number, h: number, color: string, big: number): void {
    const ps = this.particles
    ps.flash(x, h * 0.5, z, '#ffffff', 1.6 * big, 0.16)
    ps.flash(x, h * 0.5, z, color, 2.6 * big, 0.3)
    ps.sparks(x, h * 0.5, z, color, this.n(Math.round(14 * big)), 6.5 * big, 0.22 * big)
    this.ring(x, z, 0.3, 1.8 * big, color, 0.4)
    if (big > 1.5) {
      this.ring(x, z, 0.5, 4 * big, '#ffffff', 0.7)
      this.pillar(x, z, 1.2 * big, 9, color, 0.6)
      for (let k = 0; k < this.n(40); k++) {
        const a = Math.random() * Math.PI * 2
        const sp = 3 + Math.random() * 9
        ps.emit({ x, y: h * 0.4, z, vx: Math.cos(a) * sp, vy: 4 + Math.random() * 9, vz: Math.sin(a) * sp, color: Math.random() < 0.4 ? '#ffffff' : color, size: 0.4 + Math.random() * 0.4, sizeEnd: 0.04, life: 0.7 + Math.random() * 0.6, gravity: 10, drag: 0.8 })
      }
    }
  }

  /** Gold and loot sparkle rising out of a kill. */
  coins(x: number, z: number, n: number): void {
    const ps = this.particles
    for (let k = 0; k < this.n(Math.min(12, 3 + n)); k++) {
      const a = Math.random() * Math.PI * 2
      ps.emit({ x, y: 0.4, z, vx: Math.cos(a) * 1.6, vy: 4.5 + Math.random() * 2, vz: Math.sin(a) * 1.6, color: '#ffd84a', size: 0.24, sizeEnd: 0.1, life: 0.7, gravity: 11, drag: 0.6 })
    }
  }

  levelUp(x: number, z: number): void {
    this.pillar(x, z, 1, 8, '#ffe9a8', 0.9)
    this.ring(x, z, 0.4, 4.5, '#ffd84a', 0.8)
    this.ring(x, z, 0.2, 3, '#ffffff', 0.55)
    this.particles.riseRing(x, 0.1, z, '#ffd84a', 1, this.n(24))
    this.particles.riseRing(x, 0.1, z, '#ffffff', 0.6, this.n(14))
  }

  /** Play a sim `fx` event. */
  play(e: Extract<SimEvent, { t: 'fx' }>, heightOf: (unit: number) => number): void {
    const id = e.id
    const c = e.color ?? '#ffffff'
    const ps = this.particles
    if (id.startsWith('burst:')) { this.burst(e.x, e.z, e.r ?? 2, id.slice(6), e.color); return }
    if (id.startsWith('impact:')) {
      const s = shotOf(id.slice(7))
      ps.flash(e.x, 0.9, e.z, s.color, 0.9, 0.12)
      ps.sparks(e.x, 0.9, e.z, s.spark, this.n(6), 5, 0.14)
      return
    }
    if (id.startsWith('fall:')) {
      const s = shotOf(id.slice(5))
      this.orb(e.x + 3, 15, e.z - 2, e.x, 0.4, e.z, s.size, s.color, s.trail, e.dur ?? 0.9)
      return
    }
    if (id.startsWith('lob:')) {
      const s = shotOf(id.slice(4))
      this.orb(e.x, 1.2, e.z, e.x2 ?? e.x, 0.3, e.z2 ?? e.z, s.size, s.color, s.trail, e.dur ?? 0.4, 3)
      return
    }
    if (id.startsWith('field:')) { this.field(id.slice(6), e.x, e.z, e.r ?? 2, e.dur ?? 3, c); return }
    const h = e.unit ? heightOf(e.unit) : 1.2
    switch (id) {
      case 'slam':
      case 'quake':
        this.slam(e.x, e.z, e.r ?? 3, c)
        break
      case 'rupture':
        this.ring(e.x, e.z, 1, e.r ?? 12, c, 0.8)
        this.disc(e.x, e.z, e.r ?? 12, c, 0.3, 'flash')
        break
      case 'cleave':
        this.arc(e.x, e.z, e.a ?? 0, e.r ?? 2.4, e.dur ?? 0.9, c, 0.2)
        break
      case 'breath': {
        const half = e.dur ?? 0.5
        this.arc(e.x, e.z, e.a ?? 0, e.r ?? 6, half, c, 0.45, true)
        const a = e.a ?? 0
        for (let k = 0; k < this.n(26); k++) {
          const off = a + (Math.random() - 0.5) * half * 2
          const sp = (e.r ?? 6) * (1.4 + Math.random() * 1.2)
          ps.emit({ x: e.x, y: 0.9, z: e.z, vx: Math.sin(off) * sp, vy: 0.5 + Math.random() * 1.5, vz: Math.cos(off) * sp, color: Math.random() < 0.4 ? '#ffffff' : c, size: 0.5 + Math.random() * 0.5, sizeEnd: 1.1, life: 0.4 + Math.random() * 0.25, drag: 1.4 })
        }
        break
      }
      case 'beam':
        this.beam(e.x, e.z, e.x2 ?? e.x, e.z2 ?? e.z, (e.r ?? 1) * 1.2, c, 0.4)
        this.beam(e.x, e.z, e.x2 ?? e.x, e.z2 ?? e.z, (e.r ?? 1) * 0.5, '#ffffff', 0.3)
        break
      case 'dash':
        this.beam(e.x, e.z, e.x2 ?? e.x, e.z2 ?? e.z, 0.45, c, 0.28, 0.6)
        break
      case 'drain':
        this.beam(e.x, e.z, e.x2 ?? e.x, e.z2 ?? e.z, 0.22, c, 0.4)
        ps.sparks(e.x, 1, e.z, c, this.n(6), 3, 0.18)
        break
      case 'rewind':
        if (e.x2 !== undefined && e.z2 !== undefined) this.beam(e.x, e.z, e.x2, e.z2, 0.35, c, 0.5)
        this.poof(e.x, e.z, c, 1.2)
        break
      case 'blink':
      case 'summon':
      case 'deploy':
        this.poof(e.x, e.z, c)
        break
      case 'smoke':
        for (let k = 0; k < this.n(28); k++) {
          const a = Math.random() * Math.PI * 2
          const d = Math.random() * (e.r ?? 3)
          ps.emit({ x: e.x + Math.cos(a) * d, y: 0.3 + Math.random(), z: e.z + Math.sin(a) * d, vx: Math.cos(a) * 1.5, vy: 0.8 + Math.random(), vz: Math.sin(a) * 1.5, color: c, size: 1.2 + Math.random(), sizeEnd: 2.4, life: 0.8 + Math.random() * 0.6, drag: 1.6 })
        }
        break
      case 'roar':
      case 'harvest':
        this.ring(e.x, e.z, 0.5, e.r ?? 6, c, 0.55)
        this.ring(e.x, e.z, 0.2, (e.r ?? 6) * 0.7, '#ffffff', 0.4)
        break
      case 'blast':
        this.burst(e.x, e.z, e.r ?? 2.4, 'ember', c)
        break
      case 'shieldSlam':
      case 'radiant':
        this.impact(e.x, h * 0.6, e.z, c, true, false)
        this.arc(e.x, e.z, e.a ?? 0, 2.4, 1.1, c, 0.22)
        if (id === 'radiant') this.pillar(e.x, e.z, 0.8, 6, '#fff2a8', 0.45)
        break
      case 'spike':
        this.pillar(e.x, e.z, 0.5, 2.6, c, 0.35)
        this.slam(e.x, e.z, 1.4, c)
        break
      case 'heal':
        ps.riseRing(e.x, 0.1, e.z, c, 0.7, this.n(16))
        ps.flash(e.x, h * 0.6, e.z, c, 1.8, 0.3)
        break
      case 'buff':
      case 'shield':
      case 'fatalSave':
      case 'mark':
        this.ring(e.x, e.z, 0.3, 1.8, c, 0.5)
        ps.riseRing(e.x, 0.1, e.z, c, 0.7, this.n(12))
        break
      case 'bastion':
      case 'exosuit':
      case 'rage':
      case 'stasis':
      case 'petrify':
        this.pillar(e.x, e.z, 0.9, 3.2, c, 0.5)
        this.ring(e.x, e.z, 0.3, 2.6, c, 0.6)
        ps.riseRing(e.x, 0.1, e.z, c, 0.9, this.n(18))
        break
      case 'chest':
        this.levelUp(e.x, e.z)
        break
      default:
        break
    }
  }

  /** A lingering ground field's standing visual. */
  field(fx: string, x: number, z: number, r: number, dur: number, color: string): void {
    const d = this.disc(x, z, r, color, dur, 'field')
    this.ring(x, z, r * 0.5, r, color, 0.4)
    if (fx === 'pillar' || fx === 'orbital') this.pillar(x, z, r, fx === 'orbital' ? 16 : 5, color, dur)
    void d
  }

  // ─── Per frame ─────────────────────────────────────────────────────────────

  /** Mirror the sim's projectiles: one small glowing mesh each, with a trail. */
  syncProjectiles(list: Projectile[], alpha: number, dt: number): void {
    for (const [p, m] of this.shots) {
      if (p.active) continue
      m.visible = false
      this.shotPool.push(m)
      this.shots.delete(p)
    }
    for (let i = 0; i < list.length; i++) {
      const p = list[i]!
      if (!p.active) continue
      let m = this.shots.get(p)
      const s = shotOf(p.fx)
      if (!m) {
        m = this.shotPool.pop()
        if (!m) {
          m = new Mesh(this.orbGeo, basic(true))
          m.renderOrder = 6
          this.root.add(m)
        }
        m.visible = true
        ;(m.material as MeshBasicMaterial).color.set(p.color || s.color)
        m.scale.setScalar(s.size * (p.aoe > 0 ? 1.15 : 1))
        this.shots.set(p, m)
      }
      // Lead the mesh by the part of a step the render is ahead of the sim.
      const lead = alpha * (1 / 60)
      m.position.set(p.x + p.vx * lead, p.y, p.z + p.vz * lead)
      if (Math.random() < dt * (this.low ? 30 : 70)) {
        this.particles.emit({
          x: m.position.x, y: p.y, z: m.position.z, vx: (Math.random() - 0.5) * 0.8, vy: 0.4 + Math.random() * 0.6, vz: (Math.random() - 0.5) * 0.8,
          color: s.trail, size: s.size * 1.3, sizeEnd: 0.04, life: 0.22 + Math.random() * 0.14
        })
      }
    }
  }

  update(dt: number): void {
    this.time += dt
    for (const p of this.rings) {
      if (!p.active) continue
      p.t += dt
      const k = p.t / p.dur
      if (k >= 1) { p.active = false; p.mesh.visible = false; continue }
      const e = 1 - (1 - k) * (1 - k)
      p.mesh.scale.setScalar(p.r0 + (p.r1 - p.r0) * e)
      p.mat.opacity = 1 - k
    }
    for (const p of this.arcs) {
      if (!p.active) continue
      p.t += dt
      const k = p.t / p.dur
      if (k >= 1) { p.active = false; p.mesh.visible = false; continue }
      const e = 1 - (1 - k) * (1 - k)
      p.mesh.scale.setScalar(p.r * (p.breath ? 0.3 + 0.7 * e : 0.7 + 0.3 * e))
      p.mat.opacity = (1 - k) * (p.breath ? 0.75 : 0.95)
    }
    for (const p of this.discs) {
      if (!p.active) continue
      p.t += dt
      const k = p.t / p.dur
      if (k >= 1) {
        p.active = false
        p.mesh.visible = false
        if (p.fill) p.fill.visible = false
        p.pulse = 0
        continue
      }
      if (p.kind === 'flash') p.mat.opacity = (1 - k) * 0.55
      else {
        // A standing field breathes, and fades in and out at its ends.
        const edge = Math.min(1, p.t / 0.25, (p.dur - p.t) / 0.4)
        p.mat.opacity = (0.2 + 0.08 * Math.sin(this.time * 6)) * Math.max(0, edge)
        if (p.fill && p.pulse > 0) {
          ;(p.fill.material as MeshBasicMaterial).opacity = (0.3 + 0.12 * Math.sin(this.time * 14)) * Math.max(0, edge)
          p.fill.rotation.y += dt * 2
        }
        if (Math.random() < dt * (this.low ? 5 : 12)) {
          const a = Math.random() * Math.PI * 2
          const d = Math.sqrt(Math.random()) * p.r
          this.particles.emit({ x: p.mesh.position.x + Math.cos(a) * d, y: 0.1, z: p.mesh.position.z + Math.sin(a) * d, vy: 1.5 + Math.random() * 2, color: '#' + p.mat.color.getHexString(), size: 0.24, sizeEnd: 0.04, life: 0.7 })
        }
      }
    }
    for (const p of this.beams) {
      if (!p.active) continue
      p.t += dt
      const k = p.t / p.dur
      if (k >= 1) { p.active = false; p.mesh.visible = false; continue }
      p.mat.opacity = 1 - k
      p.mesh.scale.y = p.w * 2 * (1 - k * 0.6)
    }
    for (const p of this.orbs) {
      if (!p.active) continue
      p.t += dt
      const k = Math.min(1, p.t / p.dur)
      const x = p.x0 + (p.x1 - p.x0) * k
      const z = p.z0 + (p.z1 - p.z0) * k
      const y = p.y0 + (p.y1 - p.y0) * k + Math.sin(k * Math.PI) * p.arc
      p.mesh.position.set(x, y, z)
      this.particles.emit({ x, y, z, vx: (Math.random() - 0.5), vy: Math.random(), vz: (Math.random() - 0.5), color: p.trail, size: p.size * 1.6, sizeEnd: 0.05, life: 0.3 })
      if (k >= 1) { p.active = false; p.mesh.visible = false }
    }
    for (const p of this.teles) {
      if (!p.active) continue
      p.t += dt
      const k = Math.min(1, p.t / p.dur)
      if (p.t >= p.dur + 0.06) {
        p.active = false
        p.mesh.visible = p.fill.visible = false
        continue
      }
      // The outline of the danger, and a fill that reaches it as time runs out.
      p.mat.opacity = 0.16 + 0.05 * Math.sin(this.time * 18)
      p.fillMat.opacity = 0.26 + 0.2 * k
      const u = p.fill.userData as { r: number; w: number; x: number; z: number; a: number }
      if (p.shape === 'line') {
        p.fill.scale.set(u.w * 2, Math.max(0.001, u.r * k), 1)
        p.fill.position.x = u.x + Math.sin(u.a) * u.r * k * 0.5
        p.fill.position.z = u.z + Math.cos(u.a) * u.r * k * 0.5
      } else {
        p.fill.scale.setScalar(Math.max(0.001, u.r * k))
      }
    }
    this.particles.update(dt)
  }

  setViewport(heightPx: number, fovDeg: number): void {
    this.particles.setScale(heightPx, fovDeg)
  }

  clear(): void {
    for (const list of [this.rings, this.arcs, this.discs, this.beams, this.orbs, this.teles] as Pooled[][]) {
      for (const p of list) { p.active = false; p.mesh.visible = false }
    }
    for (const d of this.discs) if (d.fill) d.fill.visible = false
    for (const t of this.teles) t.fill.visible = false
    for (const [, m] of this.shots) { m.visible = false; this.shotPool.push(m) }
    this.shots.clear()
    this.particles.clear()
  }

  dispose(): void {
    this.ringGeo.dispose()
    this.discGeo.dispose()
    this.planeGeo.dispose()
    this.orbGeo.dispose()
    this.pillarGeo.dispose()
    for (const g of this.arcGeos.values()) g.dispose()
    this.particles.dispose()
    this.root.traverse((o) => { const m = (o as Mesh).material as MeshBasicMaterial | undefined; if (m && m.dispose) m.dispose() })
    this.root.removeFromParent()
  }
}

export { ringTexture }
