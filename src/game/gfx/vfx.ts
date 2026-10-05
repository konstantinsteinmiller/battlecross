import {
  AdditiveBlending, CircleGeometry, Color, CylinderGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, NormalBlending,
  PlaneGeometry, RingGeometry, SphereGeometry, Vector3, type BufferGeometry, type Scene
} from 'three'
import type { DamageType, Projectile, SimEvent, Telegraph, Unit } from '../sim/types'
import { sceneQuality } from '../engine/quality'
import { Particles, SHAPE, Sprites, type Shape } from './particles'
import { Telegraphs } from './telegraphs'
import { fieldTexture, glowTexture, pillarTexture, ringTexture, softDisc } from './textures'
import { Trails } from './trails'
import { groundAt } from './ground'
import { LootBeams } from './lootBeam'

/**
 * ─── Effects ─────────────────────────────────────────────────────────────────
 *
 * Everything that flashes, bursts, sweeps or glows. The sim says WHAT happened
 * (`SimEvent`); this turns it into light. A few pooled primitives carry all of
 * it, so a boss fight with meteors falling costs a fixed handful of draw calls
 * and allocates nothing per effect:
 *
 *   particles  one Points draw for every soft spark, ember and mote
 *   sprites    one instanced draw for every SHAPED one: the streak of a spark
 *              along its flight, a blade's cut mark, a blunt blow's star
 *   trails     one draw for every weapon's swing ribbon (`trails.ts`)
 *   telegraphs one instanced draw for every ground preview (`telegraphs.ts`)
 *   rings      shockwaves expanding on the ground
 *   arcs       the sweep of a blade or a cone of breath
 *   discs      ground fields, telegraphs' fills, craters
 *   beams      lines between two points (lasers, drains, dashes)
 *   orbs       projectiles and things falling from the sky
 *
 * Every blow lands with an IMPACT sized by its weight, shaped by its damage
 * type and thrown away from whoever dealt it (`impact`); a tick of damage
 * over time gets a small one of its own.
 */

/** What a blow of each damage type is drawn in. */
export const TYPE_COLOR: Record<DamageType, string> = {
  physical: '#ffffff', pierce: '#ffe9a8', fire: '#ff8a2a', frost: '#9fdcff', holy: '#fff2a8', poison: '#8dff5a',
  acid: '#c8ff4a', temporal: '#7fd8ff', beam: '#7ff4ff', shadow: '#c08aff', blood: '#ff4a6a', true: '#ffffff'
}

/** How a physical blow lands: an edge, a weight or a point. */
export type Blow = 'slash' | 'blunt' | 'pierce'

export interface ImpactOpts {
  x: number
  y: number
  z: number
  /** The way the blow travelled on the ground (unit length; 0, 0 if unknown). */
  dx: number
  dz: number
  type: DamageType
  blow: Blow
  heavy: boolean
  crit: boolean
  /** A tick of damage over time: a small effect, nothing else. */
  dot: boolean
  /** The target's radius, metres (a bigger body takes a bigger mark). */
  size: number
  toHero: boolean
  /** Draw it in this colour instead of the damage type's own. */
  color?: string
}

interface Pooled {
  mesh: Mesh
  mat: MeshBasicMaterial
  t: number
  dur: number
  active: boolean
}

const _n = new Vector3()
const _zAxis = new Vector3(0, 0, 1)

const basic = (additive: boolean, map = false): MeshBasicMaterial => new MeshBasicMaterial({
  color: 0xffffff, transparent: true, depthWrite: false, side: DoubleSide, toneMapped: false,
  blending: additive ? AdditiveBlending : NormalBlending, map: map ? glowTexture() : null
})

interface Ring extends Pooled { r0: number; r1: number }
interface Arc extends Pooled { r: number; half: number; breath: boolean }
interface Disc extends Pooled { r: number; kind: 'field' | 'flash' | 'tele'; fill: Mesh | null; pulse: number; fx: string }
interface Beam extends Pooled { w: number; seed: number }
interface Orb extends Pooled { x0: number; y0: number; z0: number; x1: number; y1: number; z1: number; trail: string; size: number; arc: number; kind: string; px: number; py: number; pz: number }

/**
 * What a projectile is made of, built in layers the way a hand-made effect is:
 *
 *   energy  light: a soft halo, a body stretched along its flight with a
 *           white-hot head, a hot core, and for some a shape turning in it
 *   point   a thing with a tip (an arrow, a bullet, an icicle, a rocket): a
 *           needle along its flight and a glint on the point
 *   matter  a solid lump (a rock, a bomb, a flask): the mesh itself, opaque
 *           and tumbling, with a faint halo so it reads on dark ground
 *
 * Every one draws a RIBBON behind it (a short streak laid each frame along its
 * way and fading over a few frames: a continuous, tapering trail) and a WAKE
 * of its element (embers, smoke, frost, wisps of shadow, drops). It lands as
 * its element (`hit`) through the same `impact` as a blow.
 */
type Body = 'energy' | 'point' | 'matter'
type Wake = 'fire' | 'smoke' | 'frost' | 'shadow' | 'holy' | 'venom' | 'water' | 'arcane' | 'dust' | 'leaf' | 'blood' | 'air'
interface ShotLook {
  color: string
  size: number
  trail: string
  spark: string
  body: Body
  wake: Wake[]
  hit: DamageType
  blow?: Blow
  /** A shape that turns inside an energy body. */
  spin?: Shape
}
const SHOTS: Record<string, ShotLook> = {
  fireball: { color: '#ffb02a', size: 0.5, trail: '#ff6a1a', spark: '#ffd27a', body: 'energy', wake: ['fire', 'smoke'], hit: 'fire' },
  aether: { color: '#7ff4ff', size: 0.26, trail: '#4ff0c8', spark: '#e8ffff', body: 'energy', wake: ['arcane'], hit: 'beam', spin: SHAPE.ring },
  bolt: { color: '#b8a8ff', size: 0.3, trail: '#8a6aff', spark: '#e8e0ff', body: 'energy', wake: ['arcane'], hit: 'beam', spin: SHAPE.star },
  bullet: { color: '#fff0c0', size: 0.2, trail: '#ffd27a', spark: '#ffffff', body: 'point', wake: ['air'], hit: 'pierce', blow: 'pierce' },
  arrow: { color: '#f4e8d0', size: 0.2, trail: '#e8dcc0', spark: '#ffffff', body: 'point', wake: ['air'], hit: 'pierce', blow: 'pierce' },
  rock: { color: '#b8b0a4', size: 0.28, trail: '#8a8278', spark: '#e8e2d8', body: 'matter', wake: ['dust'], hit: 'physical', blow: 'blunt' },
  ember: { color: '#ff8a2a', size: 0.36, trail: '#ff5a1a', spark: '#ffd27a', body: 'energy', wake: ['fire'], hit: 'fire' },
  shadow: { color: '#b06aff', size: 0.34, trail: '#6a2ad0', spark: '#e0b8ff', body: 'energy', wake: ['shadow'], hit: 'shadow', spin: SHAPE.claw },
  web: { color: '#f0f0ff', size: 0.3, trail: '#c8c8e8', spark: '#ffffff', body: 'matter', wake: ['air'], hit: 'poison' },
  water: { color: '#7fe8ff', size: 0.3, trail: '#3fc7e0', spark: '#e8ffff', body: 'energy', wake: ['water'], hit: 'poison', spin: SHAPE.bubble },
  holy: { color: '#fff2a8', size: 0.32, trail: '#ffd84a', spark: '#ffffff', body: 'energy', wake: ['holy'], hit: 'holy', spin: SHAPE.cross },
  rocket: { color: '#ffb04a', size: 0.36, trail: '#ff6a2a', spark: '#ffe0a8', body: 'point', wake: ['fire', 'smoke'], hit: 'fire' },
  blast: { color: '#7ff4ff', size: 0.5, trail: '#4fd8ff', spark: '#ffffff', body: 'energy', wake: ['arcane'], hit: 'beam', spin: SHAPE.ring },
  bomb: { color: '#3a3440', size: 0.42, trail: '#ff8a3a', spark: '#ffd27a', body: 'matter', wake: ['smoke', 'fire'], hit: 'fire', blow: 'blunt' },
  venom: { color: '#8dff5a', size: 0.4, trail: '#5fbf3a', spark: '#d8ffb8', body: 'energy', wake: ['venom'], hit: 'poison', spin: SHAPE.bubble },
  meteor: { color: '#ff7a1a', size: 0.9, trail: '#ff4a0a', spark: '#ffd27a', body: 'energy', wake: ['fire', 'smoke'], hit: 'fire' },
  icicle: { color: '#bfe6ff', size: 0.5, trail: '#7fc8ff', spark: '#ffffff', body: 'point', wake: ['frost'], hit: 'frost', blow: 'pierce' },
  geyser: { color: '#7fe8ff', size: 0.5, trail: '#3fc7e0', spark: '#ffffff', body: 'energy', wake: ['water'], hit: 'frost', spin: SHAPE.bubble },
  curse: { color: '#b06aff', size: 0.5, trail: '#6a2ad0', spark: '#e0b8ff', body: 'energy', wake: ['shadow'], hit: 'shadow', spin: SHAPE.claw },
  roots: { color: '#7a5a3a', size: 0.4, trail: '#5fae4a', spark: '#c8ff9a', body: 'matter', wake: ['leaf'], hit: 'physical', blow: 'blunt' },
  flask: { color: '#ff4a6a', size: 0.3, trail: '#c8283a', spark: '#ffb8c8', body: 'matter', wake: ['blood'], hit: 'blood' }
}
/** Every kind of projectile the effects know (the effects bench shoots them all). */
export const SHOT_KINDS = Object.keys(SHOTS)
const shotOf = (fx: string): ShotLook => SHOTS[fx] ?? SHOTS.bolt!
const _ink = new Color()
const inks = new Map<string, string>()
/** A colour's ink: the deep tone drawn UNDER a light (plain alpha), so on snow
 *  or a pale floor, where added light is only more white, the colour still shows. */
const inkOf = (c: string): string => {
  let k = inks.get(c)
  if (!k) {
    _ink.set(c)
    const hsl = { h: 0, s: 0, l: 0 }
    _ink.getHSL(hsl)
    k = '#' + _ink.setHSL(hsl.h, Math.min(1, hsl.s * 1.1 + 0.15), Math.min(0.42, hsl.l * 0.55)).getHexString()
    inks.set(c, k)
  }
  return k
}
/** A thing in flight with no kind of its own (a mote a prop throws): light in its colours. */
const moteLook = (color: string, trail: string, size: number): ShotLook =>
  ({ color, size, trail, spark: '#ffffff', body: 'energy', wake: ['arcane'], hit: 'beam' })

export class Vfx {
  readonly root = new Group()
  readonly particles: Particles
  readonly sprites: Sprites
  readonly trails: Trails
  readonly teles: Telegraphs
  readonly loot: LootBeams
  /** The heads of everything in flight, redrawn from scratch each frame. */
  readonly heads: Sprites
  /** Full impacts still allowed this frame (the rest are a flash). */
  private impactsLeft = 0
  private rings: Ring[] = []
  private arcs: Arc[] = []
  private discs: Disc[] = []
  private beams: Beam[] = []
  private orbs: Orb[] = []
  private shots = new Map<Projectile, Mesh>()
  private shotPool: Mesh[] = []
  private ringGeo = new RingGeometry(0.82, 1, 48)
  private discGeo = new CircleGeometry(1, 40)
  private planeGeo = new PlaneGeometry(1, 1)
  private orbGeo = new SphereGeometry(1, 10, 8)
  private pillarGeo = new CylinderGeometry(1, 1, 1, 16, 1, true)
  private arcGeos = new Map<number, BufferGeometry>()
  private low = sceneQuality() === 'low'
  /** Beats of an effect that come a moment after its first (smoke after the fire). */
  private queue: Array<{ at: number; fn: () => void }> = []
  /** `syncProjectiles` ran this frame (it opens the heads; else `update` does). */
  private synced = false
  private time = 0

  constructor(scene: Scene) {
    this.particles = new Particles(this.low ? 700 : 1500)
    this.sprites = new Sprites(this.low ? 320 : 760)
    this.heads = new Sprites(this.low ? 96 : 192)
    this.heads.mesh.renderOrder = 9
    this.root.add(this.particles.points, this.sprites.mesh, this.heads.mesh)
    scene.add(this.root)
    this.trails = new Trails(scene, this.low)
    this.teles = new Telegraphs(scene)
    this.loot = new LootBeams(this.particles, this.sprites, this.low)
    this.root.add(this.loot.root)
  }

  /** Run `fn` `delay` seconds from now, on the effects' own clock. */
  private later(delay: number, fn: () => void): void {
    this.queue.push({ at: this.time + delay, fn })
  }

  /** Fewer particles on a weak device; the SHAPES of the effects stay. */
  private n(count: number): number {
    return this.low ? Math.max(2, Math.round(count * 0.5)) : count
  }

  // ─── Primitives ────────────────────────────────────────────────────────────

  /**
   * Lay a flat mark (a ring, a disc) on the ground round (x, z): tilted to the
   * slope across its radius and set `lift` above the higher of the centre and
   * the rim, so a ring on a hillside neither floats off it nor cuts into it.
   */
  private lay(mesh: Mesh, x: number, z: number, r: number, lift: number): void {
    const c = groundAt(x, z)
    const rr = Math.max(0.4, r)
    const ex = groundAt(x + rr, z)
    const wx = groundAt(x - rr, z)
    const sz = groundAt(x, z + rr)
    const nz = groundAt(x, z - rr)
    _n.set(-(ex - wx) / (2 * rr), 1, -(sz - nz) / (2 * rr)).normalize()
    mesh.quaternion.setFromUnitVectors(_zAxis, _n)
    mesh.position.set(x, Math.max(c, (ex + wx + sz + nz) / 4) + lift, z)
  }

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
    this.lay(p.mesh, x, z, r1, y)
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
    p.mesh.position.set(x, (breath ? 0.5 : 0.7) + groundAt(x, z), z)
    // The sector is cut around +Y in the XY plane. Laid flat (X by −90°) that
    // points at −Z, so a further half turn about Y brings it to heading 0 = +Z.
    p.mesh.rotation.set(-Math.PI / 2, a + Math.PI, 0, 'YXZ')
    p.mesh.visible = true
  }

  /**
   * A flat mark on the ground. Every one is drawn through a soft map (a flash
   * a soft glow, a field a rim-lit disc, a scar a soft stain), never a hard
   * edged disc; none writes depth, so it is a decal, never a face of its own.
   */
  disc(x: number, z: number, r: number, color: string, dur: number, kind: Disc['kind'] = 'flash', additive = true): Disc {
    let p = this.discs.find(q => !q.active && (q.mat.blending === AdditiveBlending) === additive)
    if (!p) {
      const mat = basic(additive, true)
      const mesh = new Mesh(this.discGeo, mat)
      mesh.rotation.x = -Math.PI / 2
      mesh.renderOrder = 2
      this.root.add(mesh)
      p = { mesh, mat, t: 0, dur, active: false, r, kind, fill: null, pulse: 0, fx: '' }
      this.discs.push(p)
    }
    p.active = true
    p.t = 0
    p.dur = dur
    p.r = r
    p.kind = kind
    p.fx = ''
    p.mat.map = kind === 'field' ? fieldTexture() : additive ? glowTexture() : softDisc()
    p.mat.color.set(color)
    this.lay(p.mesh, x, z, r, 0.04)
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
      p = { mesh, mat, t: 0, dur, active: false, w, seed: Math.random() * 100 }
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
    p.mesh.position.set((x0 + x1) / 2, y + groundAt((x0 + x1) / 2, (z0 + z1) / 2), (z0 + z1) / 2)
    // Turned in its own plane first (Z), then laid flat: local +X runs A → B.
    p.mesh.rotation.set(-Math.PI / 2, 0, -Math.atan2(dz, dx), 'XYZ')
    p.mesh.scale.set(len, w * 2, 1)
    p.mesh.visible = true
  }

  /**
   * Something that travels from A to B on its own clock (a lobbed flask, a
   * meteor from the sky, a mote a prop throws), drawn like a projectile of
   * `kind` (`SHOTS`); without one, as a mote of light in its colours.
   */
  orb(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, size: number, color: string, trail: string, dur: number, arc = 0, kind = ''): void {
    let p = this.orbs.find(q => !q.active)
    if (!p) {
      const mat = basic(false)
      const mesh = new Mesh(this.orbGeo, mat)
      mesh.renderOrder = 6
      this.root.add(mesh)
      p = { mesh, mat, t: 0, dur, active: false, x0, y0, z0, x1, y1, z1, trail, size, arc, kind, px: x0, py: y0, pz: z0 }
      this.orbs.push(p)
    }
    Object.assign(p, { active: true, t: 0, dur, x0, y0, z0, x1, y1, z1, trail, size, arc, kind, px: x0, py: y0, pz: z0 })
    p.mat.color.set(color)
    p.mat.opacity = 1
    p.mesh.scale.setScalar(size)
    p.mesh.position.set(x0, y0 + groundAt(x0, z0), z0)
    // Only a lump of matter is a mesh; light is drawn by its head (`flight`).
    p.mesh.visible = !!kind && shotOf(kind).body === 'matter'
  }

  /** A column of light standing on the ground for `dur` seconds. */
  pillar(x: number, z: number, r: number, h: number, color: string, dur: number): void {
    // It strikes: a flash where it lands, light streaming up, a ring at its foot.
    this.particles.flash(x, 0.6, z, '#ffffff', r * 2, 0.12)
    this.sprites.emit({ x, y: 0.15, z, color, size: r * 0.6, sizeEnd: r * 2.4, life: 0.3, shape: SHAPE.ring })
    for (let k = 0; k < this.n(Math.round(8 + r * 4)); k++) {
      const a = Math.random() * Math.PI * 2
      const d = Math.sqrt(Math.random()) * r * 0.7
      this.sprites.emit({ x: x + Math.cos(a) * d, y: 0.2 + Math.random() * h * 0.3, z: z + Math.sin(a) * d, vy: h * (0.9 + Math.random() * 0.8), color: Math.random() < 0.4 ? '#ffffff' : color, size: 0.5 + Math.random() * 0.4, sizeEnd: 0.1, aspect: 0.16, align: true, stretch: 0.02, life: 0.35 + Math.random() * 0.25, drag: 1, shape: SHAPE.streak })
    }
    this.sprites.emit({ x, y: h, z, color: '#ffffff', size: r * 1.6, sizeEnd: r * 0.4, life: 0.25, shape: SHAPE.star, hold: 0.2 })
    const d = this.disc(x, z, r, color, dur, 'field')
    if (!d.fill) {
      const m = basic(true)
      m.map = pillarTexture()
      d.fill = new Mesh(this.pillarGeo, m)
      d.fill.renderOrder = 5
      this.root.add(d.fill)
    }
    const m = d.fill.material as MeshBasicMaterial
    m.color.set(color)
    d.fill.position.set(x, h / 2 + groundAt(x, z), z)
    d.fill.scale.set(r * 0.8, h, r * 0.8)
    d.fill.visible = true
    d.pulse = h
  }

  // ─── Telegraphs ────────────────────────────────────────────────────────────

  /** Raise a ground preview. `caster` is the unit winding the attack up, if any:
   *  the preview is withdrawn when it dies or loses the action. */
  telegraph(t: Telegraph, caster: Unit | null, simTime: number): void {
    this.teles.add(t, caster, simTime)
  }

  // ─── Compound effects ──────────────────────────────────────────────────────

  /**
   * A spray of stretched sparks. With a direction they fan out along it (away
   * from the attacker); without one they go everywhere.
   */
  private spray(o: { x: number; y: number; z: number; dx: number; dz: number }, n: number, speed: number, color: string, spread = 0.9, len = 0.3, up = 2.4): void {
    const sp = this.sprites
    const has = o.dx !== 0 || o.dz !== 0
    for (let i = 0; i < n; i++) {
      const a = has ? (Math.random() - 0.5) * 2 * spread : Math.random() * Math.PI * 2
      const c = Math.cos(a)
      const s = Math.sin(a)
      const fx = has ? o.dx * c - o.dz * s : c
      const fz = has ? o.dx * s + o.dz * c : s
      const v = speed * (0.45 + Math.random() * 0.75)
      sp.emit({
        x: o.x, y: o.y, z: o.z, vx: fx * v, vy: up * (Math.random() - 0.15), vz: fz * v, color,
        size: len * (0.6 + Math.random() * 0.7), sizeEnd: 0.05, aspect: 0.2, align: true, stretch: 0.03,
        life: 0.16 + Math.random() * 0.18, gravity: 9, drag: 3.2, shape: SHAPE.streak, hold: 0.3
      })
    }
  }

  /** A tick of damage over time: one small thing in the type's shape. No flash. */
  private tick(o: ImpactOpts, col: string): void {
    const sp = this.sprites
    const x = o.x + (Math.random() - 0.5) * o.size
    const z = o.z + (Math.random() - 0.5) * o.size
    switch (o.type) {
      case 'fire':
        sp.emit({ x, y: o.y, z, vy: 2.4, color: Math.random() < 0.5 ? '#ffd27a' : col, size: 0.36, sizeEnd: 0.1, aspect: 0.45, align: true, life: 0.32, shape: SHAPE.streak })
        break
      case 'poison':
      case 'acid':
        sp.emit({ x, y: o.y, z, vy: 1.3, color: col, size: 0.24, sizeEnd: 0.34, life: 0.42, shape: SHAPE.bubble, add: 0.6 })
        break
      case 'physical':
      case 'blood':
        // A bleed: two drops.
        for (let i = 0; i < 2; i++) sp.emit({ x, y: o.y, z, vx: (Math.random() - 0.5) * 1.6, vy: 0.8, vz: (Math.random() - 0.5) * 1.6, color: '#ff4a6a', size: 0.2, sizeEnd: 0.08, aspect: 0.4, align: true, life: 0.34, gravity: 9, shape: SHAPE.streak, add: 0.25 })
        break
      default:
        sp.emit({ x, y: o.y, z, color: col, size: 0.24, sizeEnd: 0.55, life: 0.24, shape: SHAPE.ring })
    }
  }

  /**
   * A blow lands. Sized by its weight (and by how big the body is), shaped by
   * its damage type, and thrown along the way it travelled; a critical hit is
   * bigger and wears gold. At most a few FULL impacts a frame: a cleave through
   * a pack draws the rest as a flash.
   */
  impact(o: ImpactOpts): void {
    const ps = this.particles
    const sp = this.sprites
    // A plain blow is drawn warm, not white: white is nothing at all on snow.
    const col = o.color ?? (o.toHero && (o.type === 'physical' || o.type === 'pierce') ? '#ff6a6a' : o.type === 'physical' || o.type === 'true' ? '#ffe9a0' : TYPE_COLOR[o.type])
    if (o.dot) { this.tick(o, col); return }
    const k = 1.25 * (o.crit ? 1.5 : o.heavy ? 1.22 : 1) * Math.min(1.5, Math.max(0.85, 0.7 + o.size * 0.55))
    if (this.impactsLeft <= 0) { ps.flash(o.x, o.y, o.z, col, 1.1 * k, 0.1); return }
    this.impactsLeft--
    const { x, y, z, dx, dz } = o
    // Across the blow, on the ground.
    const px = -dz
    const pz = dx
    const rnd = (): number => Math.random() - 0.5
    ps.flash(x, y, z, '#ffffff', 0.45 * k, 0.06)
    ps.flash(x, y, z, col, 0.8 * k, 0.11)
    // The pop: one hard white frame of a star the moment it lands (the "impact frame").
    sp.emit({ x, y, z, color: '#ffffff', size: 1.15 * k, sizeEnd: 0.4 * k, rot: Math.random() * 0.8, life: 0.07, shape: SHAPE.star, hold: 0.5 })
    // Heavy blows and blunt ones throw speed lines out of the point of contact.
    if (o.heavy || o.crit || o.blow === 'blunt') {
      const nl = this.n(o.crit ? 8 : 6)
      for (let i = 0; i < nl; i++) {
        const a = (i / nl) * Math.PI * 2 + Math.random() * 0.4
        sp.emit({ x, y, z, vx: Math.cos(a) * 14 * k, vy: Math.sin(a) * 9 * k, vz: Math.sin(a) * 4, color: '#ffffff', size: 0.9 * k, sizeEnd: 0.2, aspect: 0.06, align: true, life: 0.1, drag: 6, shape: SHAPE.streak, hold: 0.3 })
      }
    }

    switch (o.type) {
      case 'physical':
      case 'pierce':
      case 'true': {
        const blow: Blow = o.type === 'pierce' ? 'pierce' : o.blow
        if (blow === 'slash') {
          // The cut: a hard-edged mark across the blow, and sparks thrown off it.
          const tilt = rnd() * 1.4
          // Ink under the light: the cut reads on snow and sand too.
          sp.emit({ x, y, z, dx: px, dy: tilt, dz: pz, color: inkOf(col), size: 1.45 * k, sizeEnd: 1.75 * k, aspect: 0.7, life: 0.16, shape: SHAPE.slash, hold: 0.45, add: 0 })
          sp.emit({ x, y, z, dx: px, dy: tilt, dz: pz, color: col, size: 1.4 * k, sizeEnd: 1.75 * k, aspect: 0.55, life: 0.18, shape: SHAPE.slash, hold: 0.45, add: 0.6 })
          if (o.heavy) sp.emit({ x, y, z, dx: px, dy: -tilt * 0.5 + 0.6, dz: pz, color: '#ffffff', size: 1.1 * k, sizeEnd: 1.4 * k, aspect: 0.4, life: 0.14, shape: SHAPE.slash, hold: 0.45 })
          if (o.crit) sp.emit({ x, y, z, dx: px, dy: -tilt - 0.8, dz: pz, color: '#ffd700', size: 1.15 * k, sizeEnd: 1.5 * k, aspect: 0.5, life: 0.2, shape: SHAPE.slash, hold: 0.45 })
          this.spray(o, this.n(o.heavy ? 9 : 6), 8 * k, col, 0.8)
        } else if (blow === 'blunt') {
          // A star where it landed, a ring of dust kicked off the ground.
          sp.emit({ x, y, z, color: inkOf(col), size: 1.25 * k, sizeEnd: 1.6 * k, rot: 0.3, life: 0.12, shape: SHAPE.star, hold: 0.4, add: 0 })
          sp.emit({ x, y, z, color: col, size: 1.15 * k, sizeEnd: 1.6 * k, rot: 0.3, life: 0.15, shape: SHAPE.star, hold: 0.4, add: 0.6 })
          sp.emit({ x, y: 0.12, z, dx: 1, dy: 0, dz: 0, color: '#f0e4cc', size: 0.6 * k, sizeEnd: 2.0 * k, aspect: 0.5, life: 0.28, shape: SHAPE.ring, add: 0.3 })
          for (let i = 0; i < this.n(5); i++) {
            const a = Math.random() * Math.PI * 2
            sp.emit({ x: x + Math.cos(a) * 0.2, y: 0.18, z: z + Math.sin(a) * 0.2, vx: Math.cos(a) * 2.4 * k, vy: 0.9, vz: Math.sin(a) * 2.4 * k, color: '#d8cbb4', size: 0.45, sizeEnd: 0.95, life: 0.36, drag: 3, shape: SHAPE.puff, add: 0 })
          }
          this.spray(o, this.n(4), 6 * k, col, 1.2, 0.24)
        } else {
          // The point: a needle straight through, and little else.
          sp.emit({ x, y, z, dx: dx || 1, dy: 0, dz, color: col, size: 2 * k, sizeEnd: 2.5 * k, life: 0.12, shape: SHAPE.needle, hold: 0.5, add: 0.6 })
          sp.emit({ x, y, z, color: '#ffffff', size: 0.25 * k, sizeEnd: 0.7 * k, life: 0.15, shape: SHAPE.ring })
          this.spray(o, this.n(4), 11 * k, col, 0.25, 0.4, 1)
        }
        break
      }
      case 'fire': {
        // Tongues of flame that climb, and embers.
        for (let i = 0; i < this.n(6); i++) {
          sp.emit({ x: x + rnd() * 0.4, y: y - 0.1, z: z + rnd() * 0.4, vx: rnd() * 2 + dx * 1.5, vy: 2.6 + Math.random() * 2.6, vz: rnd() * 2 + dz * 1.5, color: i % 2 ? '#ffd27a' : col, size: 0.5 * k, sizeEnd: 0.14, aspect: 0.5, align: true, stretch: 0.02, life: 0.3 + Math.random() * 0.15, drag: 1.5, shape: SHAPE.streak })
        }
        sp.emit({ x, y, z, color: '#ffb02a', size: 0.5 * k, sizeEnd: 1.5 * k, life: 0.2, shape: SHAPE.ring })
        ps.sparks(x, y, z, '#ffd27a', this.n(5), 5 * k, 0.14)
        break
      }
      case 'frost': {
        // A crystal that blooms and needles of ice off it.
        sp.emit({ x, y, z, color: '#e8f8ff', size: 0.8 * k, sizeEnd: 1.4 * k, rot: Math.random() * 1.1, spin: 1.5, life: 0.24, shape: SHAPE.shard, hold: 0.4 })
        for (let i = 0; i < this.n(6); i++) {
          const a = (i / 6) * Math.PI * 2 + Math.random() * 0.5
          sp.emit({ x, y, z, vx: Math.cos(a) * 5 * k, vy: Math.sin(a) * 3 + 1, vz: Math.sin(a) * 5 * k, color: col, size: 0.42 * k, sizeEnd: 0.1, aspect: 0.3, align: true, life: 0.24, drag: 5, shape: SHAPE.needle })
        }
        break
      }
      case 'holy': {
        // A cross of light, a halo, rays that rise.
        sp.emit({ x, y, z, color: col, size: 1.1 * k, sizeEnd: 1.6 * k, life: 0.22, shape: SHAPE.cross, hold: 0.45 })
        sp.emit({ x, y, z, color: '#ffffff', size: 0.4 * k, sizeEnd: 1.3 * k, life: 0.22, shape: SHAPE.ring })
        for (let i = 0; i < this.n(5); i++) sp.emit({ x: x + rnd() * 0.7, y: y - 0.2, z: z + rnd() * 0.7, vy: 3.2 + Math.random() * 2, color: '#fff2a8', size: 0.5, sizeEnd: 0.1, aspect: 0.22, align: true, life: 0.36, shape: SHAPE.streak })
        break
      }
      case 'poison':
      case 'acid': {
        // A splash, and bubbles that float up out of it.
        sp.emit({ x, y, z, color: col, size: 0.9 * k, sizeEnd: 1.7 * k, life: 0.26, shape: SHAPE.puff, add: 0.35 })
        for (let i = 0; i < this.n(6); i++) sp.emit({ x: x + rnd() * 0.6, y: y + rnd() * 0.3, z: z + rnd() * 0.6, vx: rnd() * 1.6 + dx, vy: 1 + Math.random() * 1.8, vz: rnd() * 1.6 + dz, color: col, size: 0.16 + Math.random() * 0.2, sizeEnd: 0.34, life: 0.4 + Math.random() * 0.25, drag: 1.5, shape: SHAPE.bubble, add: 0.6 })
        break
      }
      case 'temporal': {
        // Ripples in the air, one inside the other.
        sp.emit({ x, y, z, color: col, size: 0.4 * k, sizeEnd: 1.5 * k, life: 0.28, shape: SHAPE.ring })
        sp.emit({ x, y, z, color: '#ffffff', size: 0.2 * k, sizeEnd: 0.9 * k, life: 0.34, shape: SHAPE.ring, hold: 0.5 })
        for (let i = 0; i < this.n(4); i++) {
          const a = (i / 4) * Math.PI * 2
          sp.emit({ x: x + Math.cos(a) * 0.5, y: y + Math.sin(a) * 0.5, z, vx: -Math.cos(a) * 2, vy: -Math.sin(a) * 2, color: col, size: 0.22, sizeEnd: 0.05, life: 0.28, shape: SHAPE.dot })
        }
        break
      }
      case 'beam': {
        // Forks of light.
        for (let i = 0; i < this.n(4); i++) sp.emit({ x, y, z, color: i % 2 ? '#ffffff' : col, size: 0.95 * k, sizeEnd: 1.3 * k, aspect: 0.6, rot: (i / 4) * Math.PI + Math.random() * 0.6, life: 0.11 + Math.random() * 0.05, shape: SHAPE.bolt, hold: 0.5 })
        this.spray(o, this.n(5), 10 * k, col, 1.4, 0.26, 3)
        break
      }
      case 'shadow': {
        // Claws out of a dark that swallows the light for a beat.
        sp.emit({ x, y, z, color: '#1c0f33', size: 0.8 * k, sizeEnd: 1.3 * k, life: 0.22, shape: SHAPE.puff, add: 0 })
        for (let i = 0; i < 3; i++) sp.emit({ x: x + rnd() * 0.2, y: y + rnd() * 0.2, z, color: col, size: 0.9 * k, sizeEnd: 1.25 * k, rot: (i / 3) * Math.PI * 2 + Math.random(), spin: 3, life: 0.2, shape: SHAPE.claw, add: 0.75, hold: 0.4 })
        this.spray(o, this.n(5), 6 * k, '#e0b8ff', 1.2, 0.22)
        break
      }
      case 'blood': {
        // Drops, thrown the way the blow went, that fall.
        sp.emit({ x, y, z, color: col, size: 0.7 * k, sizeEnd: 1.3 * k, life: 0.2, shape: SHAPE.puff, add: 0.2 })
        for (let i = 0; i < this.n(7); i++) sp.emit({ x, y, z, vx: dx * 4 + rnd() * 4, vy: 1.5 + Math.random() * 3, vz: dz * 4 + rnd() * 4, color: col, size: 0.26, sizeEnd: 0.1, aspect: 0.4, align: true, stretch: 0.02, life: 0.4, gravity: 12, shape: SHAPE.streak, add: 0.25 })
        break
      }
    }
    if (o.crit) {
      // Gold on top of whatever it was.
      sp.emit({ x, y, z, color: '#ffd700', size: 1.2 * k, sizeEnd: 1.8 * k, rot: 0.4, life: 0.18, shape: SHAPE.star, hold: 0.4 })
      sp.emit({ x, y, z, color: '#ffd700', size: 0.5 * k, sizeEnd: 1.9 * k, life: 0.16, shape: SHAPE.ring })
      this.spray(o, this.n(7), 10, '#ffd700', 1.1, 0.3, 3.4)
    } else if (o.heavy) sp.emit({ x, y, z, color: col, size: 0.4 * k, sizeEnd: 1.5 * k, life: 0.16, shape: SHAPE.ring })
  }

  /** A shot leaves a barrel (or a string): a star at the muzzle and a tongue the way it points. */
  muzzle(x: number, y: number, z: number, dx: number, dz: number, color: string, heavy = false): void {
    const sp = this.sprites
    const k = heavy ? 1.7 : 1
    this.particles.flash(x, y, z, color, 0.9 * k, 0.08)
    sp.emit({ x, y, z, color, size: 0.75 * k, sizeEnd: 1.15 * k, rot: Math.random(), life: 0.09, shape: SHAPE.star, hold: 0.5 })
    sp.emit({ x: x + dx * 0.35 * k, y, z: z + dz * 0.35 * k, dx, dy: 0, dz, color: '#ffffff', size: 1.1 * k, sizeEnd: 1.5 * k, aspect: 0.45, life: 0.08, shape: SHAPE.streak, hold: 0.5 })
    this.spray({ x, y, z, dx, dz }, this.n(heavy ? 6 : 3), 9 * k, color, 0.35, 0.26, 1.2)
    if (heavy) for (let i = 0; i < this.n(4); i++) sp.emit({ x, y, z, vx: dx * 1.5 + (Math.random() - 0.5), vy: 0.8, vz: dz * 1.5 + (Math.random() - 0.5), color: '#b8b0a4', size: 0.5, sizeEnd: 1.1, life: 0.5, drag: 2, shape: SHAPE.puff, add: 0 })
  }

  /** A spell leaves a hand: a ring that opens and motes that spin off it. */
  castFlash(x: number, y: number, z: number, color: string, big = false): void {
    const sp = this.sprites
    const k = big ? 1.5 : 1
    this.particles.flash(x, y, z, color, 1.1 * k, 0.12)
    sp.emit({ x, y, z, color, size: 0.3 * k, sizeEnd: 1.3 * k, life: 0.22, shape: SHAPE.ring })
    sp.emit({ x, y, z, color: '#ffffff', size: 0.6 * k, sizeEnd: 0.9 * k, rot: 0.78, life: 0.12, shape: SHAPE.star, hold: 0.5 })
    for (let i = 0; i < this.n(4); i++) {
      const a = (i / 4) * Math.PI * 2 + Math.random()
      sp.emit({ x, y, z, vx: Math.cos(a) * 2.2, vy: 1 + Math.random() * 1.5, vz: Math.sin(a) * 2.2, color, size: 0.2, sizeEnd: 0.04, life: 0.34, drag: 2, shape: SHAPE.dot })
    }
  }

  /** A skill begins: its colour gathers on the ground under the caster. */
  castStart(x: number, z: number, color: string, big = false): void {
    this.ring(x, z, big ? 2.2 : 1.5, 0.35, color, big ? 0.34 : 0.24, 0.07)
    const n = this.n(big ? 10 : 6)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const r = big ? 1.5 : 1.1
      this.sprites.emit({ x: x + Math.cos(a) * r, y: 0.15, z: z + Math.sin(a) * r, vx: -Math.cos(a) * r * 3, vy: 2.6, vz: -Math.sin(a) * r * 3, color, size: 0.34, sizeEnd: 0.08, aspect: 0.3, align: true, life: 0.3, shape: SHAPE.streak })
    }
  }

  /** The air a dash leaves behind: streaks along the way it went. */
  wind(x0: number, z0: number, x1: number, z1: number, color: string): void {
    const dx = x1 - x0
    const dz = z1 - z0
    const len = Math.hypot(dx, dz)
    if (len < 0.3) return
    const ux = dx / len
    const uz = dz / len
    const n = this.n(Math.min(9, 3 + Math.round(len)))
    for (let i = 0; i < n; i++) {
      const k = Math.random()
      const side = (Math.random() - 0.5) * 0.9
      this.sprites.emit({
        x: x0 + dx * k - uz * side, y: 0.35 + Math.random() * 1.1, z: z0 + dz * k + ux * side, vx: ux * 5, vz: uz * 5,
        color: i % 3 ? '#ffffff' : color, size: 1.1 + Math.random() * 1.2, sizeEnd: 0.3, aspect: 0.07, align: true, life: 0.2 + Math.random() * 0.12, drag: 4, shape: SHAPE.streak
      })
    }
  }

  /**
   * An explosion of `fx` (a fireball landing, a bomb, a meteor, a burst of
   * venom), built the way a hand-made one is, in beats:
   *
   *   flash    one white frame, the size of the blast
   *   body     hot puffs of the element that swell and cool
   *   shock    a ring racing out over the ground and one in the air
   *   debris   sparks thrown high that fall; for fire, smoke that lingers
   *   element  embers, shards of ice, bubbles, claws of shadow, rays, forks
   *   scar     a dark mark on the ground that fades over a few seconds
   */
  burst(x: number, z: number, r: number, fx: string, color?: string): void {
    const s = shotOf(fx)
    const c = color || s.color
    const ps = this.particles
    const sp = this.sprites
    const el = s.hit
    const rnd = (): number => Math.random() - 0.5
    // ── flash ──
    ps.flash(x, 0.8, z, '#ffffff', r * 1.5, 0.1)
    sp.emit({ x, y: 0.9, z, color: '#ffffff', size: r * 1.2, sizeEnd: r * 2, life: 0.09, shape: SHAPE.dot, hold: 0.3 })
    ps.flash(x, 0.8, z, c, r * 2.4, 0.26)
    // ── body ──
    const nb = this.n(Math.round(5 + r * 2))
    for (let i = 0; i < nb; i++) {
      const a = Math.random() * Math.PI * 2
      const d = Math.random() * r * 0.35
      sp.emit({
        x: x + Math.cos(a) * d, y: 0.5 + Math.random() * 0.7, z: z + Math.sin(a) * d,
        vx: Math.cos(a) * r * (1 + Math.random()), vy: 1 + Math.random() * 2.2, vz: Math.sin(a) * r * (1 + Math.random()),
        color: i % 3 === 0 ? s.spark : i % 3 === 1 ? c : s.trail, size: r * 0.55, sizeEnd: r * 1.3, life: 0.26 + Math.random() * 0.16,
        drag: 4, shape: SHAPE.puff, add: 1, hold: 0.15
      })
    }
    // ── shock ──
    this.disc(x, z, r, c, 0.3, 'flash')
    this.ring(x, z, r * 0.2, r * 1.3, c, 0.36)
    this.ring(x, z, r * 0.1, r * 0.9, '#ffffff', 0.22)
    sp.emit({ x, y: 0.8, z, color: s.spark, size: r * 0.4, sizeEnd: r * 2.6, life: 0.26, shape: SHAPE.ring })
    // ── debris ──
    const n = this.n(Math.round(10 + r * 5))
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2
      const v = (0.5 + Math.random()) * r * 2.6
      sp.emit({
        x, y: 0.4, z, vx: Math.cos(a) * v, vy: 3 + Math.random() * 6, vz: Math.sin(a) * v,
        color: Math.random() < 0.4 ? s.spark : s.trail, size: 0.3 + Math.random() * 0.25, sizeEnd: 0.05, aspect: 0.3, align: true, stretch: 0.025,
        life: 0.45 + Math.random() * 0.35, gravity: 11, drag: 1.2, shape: SHAPE.streak
      })
    }
    if (el === 'fire' || s.wake.includes('smoke')) this.later(0.12, () => {
      for (let k = 0; k < this.n(Math.round(4 + r * 2)); k++) {
        const a = Math.random() * Math.PI * 2
        const d = Math.random() * r * 0.6
        sp.emit({ x: x + Math.cos(a) * d, y: 0.8 + Math.random() * 0.5, z: z + Math.sin(a) * d, vx: Math.cos(a) * 0.8, vy: 0.9 + Math.random() * 0.8, vz: Math.sin(a) * 0.8, color: '#5a524c', size: r * 0.7, sizeEnd: r * 1.6, life: 0.9 + Math.random() * 0.6, drag: 1.4, shape: SHAPE.puff, add: 0, hold: 0.15 })
      }
    })
    // ── element ──
    switch (el) {
      case 'fire':
        for (let k = 0; k < this.n(10); k++) sp.emit({ x: x + rnd() * r, y: 0.3, z: z + rnd() * r, vx: rnd() * 2, vy: 2.5 + Math.random() * 3.5, vz: rnd() * 2, color: Math.random() < 0.5 ? '#ffd27a' : '#ff8a2a', size: 0.22, sizeEnd: 0.05, aspect: 0.4, align: true, life: 0.7 + Math.random() * 0.5, drag: 0.8, shape: SHAPE.streak })
        break
      case 'frost':
        for (let k = 0; k < this.n(10); k++) {
          const a = (k / 10) * Math.PI * 2
          sp.emit({ x, y: 0.6, z, vx: Math.cos(a) * r * 3, vy: 1 + Math.random() * 2, vz: Math.sin(a) * r * 3, color: k % 2 ? '#ffffff' : c, size: 0.5, sizeEnd: 0.12, rot: Math.random() * 3, spin: 6, life: 0.5, drag: 3, shape: SHAPE.shard, hold: 0.3 })
        }
        break
      case 'poison':
      case 'acid':
        for (let k = 0; k < this.n(12); k++) sp.emit({ x: x + rnd() * r * 1.4, y: 0.2 + Math.random() * 0.4, z: z + rnd() * r * 1.4, vy: 0.8 + Math.random() * 1.6, color: c, size: 0.18 + Math.random() * 0.24, sizeEnd: 0.4, life: 0.6 + Math.random() * 0.4, shape: SHAPE.bubble, add: 0.6 })
        for (let k = 0; k < this.n(4); k++) sp.emit({ x: x + rnd() * r, y: 0.4, z: z + rnd() * r, vy: 0.4, color: inkOf(c), size: r * 0.6, sizeEnd: r * 1.3, life: 1, shape: SHAPE.puff, add: 0, hold: 0.2 })
        break
      case 'shadow':
        // It swallows the light, then claws out of it.
        sp.emit({ x, y: 0.9, z, color: '#14081f', size: r * 2, sizeEnd: r * 0.5, life: 0.3, shape: SHAPE.puff, add: 0, hold: 0.3 })
        for (let k = 0; k < 4; k++) sp.emit({ x: x + rnd() * r * 0.5, y: 0.9 + rnd() * 0.4, z: z + rnd() * r * 0.5, color: c, size: r * 0.9, sizeEnd: r * 1.3, rot: (k / 4) * Math.PI * 2, spin: 3, life: 0.24, shape: SHAPE.claw, hold: 0.4 })
        break
      case 'holy':
        sp.emit({ x, y: 1.1, z, color: '#fff2a8', size: r * 1.3, sizeEnd: r * 1.8, life: 0.3, shape: SHAPE.cross, hold: 0.4 })
        for (let k = 0; k < this.n(8); k++) sp.emit({ x: x + rnd() * r, y: 0.2, z: z + rnd() * r, vy: 5 + Math.random() * 3, color: '#ffffff', size: 0.7, sizeEnd: 0.1, aspect: 0.14, align: true, life: 0.4, shape: SHAPE.streak })
        break
      case 'beam':
      case 'temporal':
        for (let k = 0; k < this.n(6); k++) sp.emit({ x, y: 0.9, z, color: k % 2 ? '#ffffff' : c, size: r * 1.1, sizeEnd: r * 1.4, aspect: 0.5, rot: (k / 6) * Math.PI * 2 + Math.random() * 0.5, life: 0.12 + Math.random() * 0.06, shape: SHAPE.bolt, hold: 0.5 })
        break
      case 'blood':
        for (let k = 0; k < this.n(10); k++) sp.emit({ x, y: 0.6, z, vx: rnd() * 6, vy: 2 + Math.random() * 3, vz: rnd() * 6, color: c, size: 0.26, sizeEnd: 0.1, aspect: 0.4, align: true, life: 0.5, gravity: 12, shape: SHAPE.streak, add: 0.3 })
        break
      default:
        break
    }
    // ── scar ── where something burned or pooled (a decal: no depth write)
    if (el === 'fire' || el === 'poison' || el === 'acid') this.disc(x, z, r * 0.9, el === 'fire' ? '#1a120c' : inkOf(c), 3, 'flash', false)
  }

  /** Dust and rock kicked up by something heavy landing: rings, a cloud, stones, cracks. */
  slam(x: number, z: number, r: number, color: string): void {
    const ps = this.particles
    const sp = this.sprites
    this.ring(x, z, r * 0.2, r, color, 0.38)
    this.ring(x, z, r * 0.1, r * 0.7, '#ffffff', 0.26)
    this.disc(x, z, r, color, 0.25, 'flash')
    ps.flash(x, 0.4, z, '#ffffff', r * 0.9, 0.08)
    // The cloud, rolling out from the edge of the blow.
    const nd = this.n(Math.round(8 + r * 3))
    for (let k = 0; k < nd; k++) {
      const a = (k / nd) * Math.PI * 2 + Math.random() * 0.4
      const d = r * (0.3 + Math.random() * 0.3)
      sp.emit({ x: x + Math.cos(a) * d, y: 0.25, z: z + Math.sin(a) * d, vx: Math.cos(a) * r * 2.2, vy: 0.5 + Math.random() * 0.7, vz: Math.sin(a) * r * 2.2, color: Math.random() < 0.5 ? '#d8cbb4' : '#b8a890', size: 0.6 + r * 0.2, sizeEnd: 1.4 + r * 0.4, life: 0.55 + Math.random() * 0.35, drag: 3.2, shape: SHAPE.puff, add: 0, hold: 0.1 })
    }
    // Stones thrown up that fall back.
    for (let k = 0; k < this.n(Math.round(5 + r * 2)); k++) {
      const a = Math.random() * Math.PI * 2
      const v = r * (1 + Math.random() * 1.4)
      sp.emit({ x, y: 0.2, z, vx: Math.cos(a) * v, vy: 4 + Math.random() * 4, vz: Math.sin(a) * v, color: '#6a5a48', size: 0.2 + Math.random() * 0.2, sizeEnd: 0.16, rot: Math.random() * 3, spin: 8, life: 0.7, gravity: 16, shape: SHAPE.shard, add: 0, hold: 0.7 })
    }
    // Cracks running out over the ground.
    for (let k = 0; k < this.n(6); k++) {
      const a = (k / 6) * Math.PI * 2 + Math.random() * 0.5
      sp.emit({ x: x + Math.cos(a) * r * 0.45, y: 0.06, z: z + Math.sin(a) * r * 0.45, dx: Math.cos(a), dy: 0, dz: Math.sin(a), color: '#4a3a2a', size: r * 0.95, sizeEnd: r, aspect: 0.5, life: 1, shape: SHAPE.bolt, add: 0, hold: 0.4 })
    }
    // A few sparks of its colour.
    const n = this.n(Math.round(6 + r * 2))
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2
      const v = r * (1.6 + Math.random())
      ps.emit({ x: x + Math.cos(a) * 0.4, y: 0.15, z: z + Math.sin(a) * 0.4, vx: Math.cos(a) * v, vy: 1.5 + Math.random() * 3, vz: Math.sin(a) * v, color, size: 0.3 + Math.random() * 0.2, sizeEnd: 0.05, life: 0.4 + Math.random() * 0.3, gravity: 7, drag: 2.2 })
    }
  }


  /** A poof where something appeared or vanished: a flash, a ring, a curl of smoke, motes. */
  poof(x: number, z: number, color: string, scale = 1): void {
    const ps = this.particles
    const sp = this.sprites
    ps.flash(x, 0.8, z, color, 1.8 * scale, 0.2)
    sp.emit({ x, y: 0.9, z, color: '#ffffff', size: 0.8 * scale, sizeEnd: 0.2, life: 0.16, shape: SHAPE.star, hold: 0.3 })
    sp.emit({ x, y: 0.8, z, color, size: 0.4 * scale, sizeEnd: 2.2 * scale, life: 0.3, shape: SHAPE.ring })
    for (let k = 0; k < this.n(7); k++) {
      const a = (k / 7) * Math.PI * 2
      sp.emit({ x: x + Math.cos(a) * 0.3, y: 0.3 + Math.random() * 0.8, z: z + Math.sin(a) * 0.3, vx: Math.cos(a) * 1.6 * scale, vy: 0.6, vz: Math.sin(a) * 1.6 * scale, color: k % 2 ? inkOf(color) : '#8a8090', size: 0.5 * scale, sizeEnd: 1.1 * scale, life: 0.5 + Math.random() * 0.2, drag: 3, shape: SHAPE.puff, add: 0, hold: 0.15 })
    }
    ps.riseRing(x, 0.1, z, color, 0.6 * scale, this.n(12))
    ps.sparks(x, 0.9, z, color, this.n(10), 4 * scale, 0.2)
  }

  /**
   * The burst of a death: the body's light goes out of it. A flash, a ring of
   * dust, the soul rising as a streak; a boss goes with a column of light, a
   * shockwave that crosses the field and embers that hang in the air.
   */
  death(x: number, z: number, h: number, color: string, big: number): void {
    const ps = this.particles
    const sp = this.sprites
    ps.flash(x, h * 0.5, z, '#ffffff', 1.6 * big, 0.16)
    ps.flash(x, h * 0.5, z, color, 2.6 * big, 0.3)
    ps.sparks(x, h * 0.5, z, color, this.n(Math.round(14 * big)), 6.5 * big, 0.22 * big)
    this.ring(x, z, 0.3, 1.8 * big, color, 0.4)
    // Dust where it falls.
    for (let k = 0; k < this.n(6); k++) {
      const a = (k / 6) * Math.PI * 2
      sp.emit({ x: x + Math.cos(a) * 0.4, y: 0.2, z: z + Math.sin(a) * 0.4, vx: Math.cos(a) * 1.8 * big, vy: 0.4, vz: Math.sin(a) * 1.8 * big, color: '#cbbca4', size: 0.5 * big, sizeEnd: 1.2 * big, life: 0.6, drag: 3, shape: SHAPE.puff, add: 0, hold: 0.1 })
    }
    // The soul: a streak of its colour rising out of it, and motes after.
    sp.emit({ x, y: h * 0.6, z, vy: 5, color, size: 1.1 * big, sizeEnd: 0.2, aspect: 0.25, align: true, life: 0.55, drag: 0.5, shape: SHAPE.streak, hold: 0.2 })
    for (let k = 0; k < this.n(6); k++) sp.emit({ x: x + (Math.random() - 0.5) * 0.6, y: h * 0.5, z: z + (Math.random() - 0.5) * 0.6, vy: 2 + Math.random() * 2.5, color: Math.random() < 0.5 ? '#ffffff' : color, size: 0.18, sizeEnd: 0.04, life: 0.8 + Math.random() * 0.4, shape: SHAPE.dot })
    if (big > 1.5) {
      this.ring(x, z, 0.5, 4 * big, '#ffffff', 0.7)
      this.ring(x, z, 0.5, 7 * big, color, 1.1)
      this.pillar(x, z, 1.2 * big, 9, color, 0.6)
      sp.emit({ x, y: h * 0.6, z, color: '#ffffff', size: 2.4 * big, sizeEnd: 0.4, rot: 0.4, life: 0.4, shape: SHAPE.star, hold: 0.2 })
      for (let k = 0; k < this.n(40); k++) {
        const a = Math.random() * Math.PI * 2
        const sp2 = 3 + Math.random() * 9
        ps.emit({ x, y: h * 0.4, z, vx: Math.cos(a) * sp2, vy: 4 + Math.random() * 9, vz: Math.sin(a) * sp2, color: Math.random() < 0.4 ? '#ffffff' : color, size: 0.4 + Math.random() * 0.4, sizeEnd: 0.04, life: 0.7 + Math.random() * 0.6, gravity: 10, drag: 0.8 })
      }
      // Embers that hang in the air after it.
      for (let k = 0; k < this.n(18); k++) sp.emit({ x: x + (Math.random() - 0.5) * 4 * big, y: 0.3 + Math.random() * 2, z: z + (Math.random() - 0.5) * 4 * big, vx: (Math.random() - 0.5) * 0.6, vy: 0.5 + Math.random() * 0.8, vz: (Math.random() - 0.5) * 0.6, color: Math.random() < 0.5 ? '#ffd27a' : color, size: 0.16, sizeEnd: 0.04, life: 1.6 + Math.random() * 1.2, shape: SHAPE.dot, hold: 0.4 })
      this.disc(x, z, 1.4 * big, inkOf(color), 3, 'flash', false)
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

  /** An item of `tier` dropped at (x, z): its beam of light (`lootBeam.ts`). */
  lootBeam(x: number, z: number, tier: number): void {
    this.loot.add(x, z, tier)
  }

  /** A level gained (roadmap #6): a column of light, a flare round the hero,
   *  two rings and sparks spiralling up out of the ground. */
  levelUp(x: number, z: number): void {
    this.pillar(x, z, 1, 8, '#ffe9a8', 1.1)
    this.ring(x, z, 0.4, 4.5, '#ffd84a', 0.8)
    this.ring(x, z, 0.2, 3, '#ffffff', 0.55)
    this.particles.riseRing(x, 0.1, z, '#ffd84a', 1, this.n(24))
    this.particles.riseRing(x, 0.1, z, '#ffffff', 0.6, this.n(14))
    this.sprites.emit({ x, y: 1.1, z, color: '#fff2b8', size: 2.4, sizeEnd: 0.5, life: 0.4, shape: SHAPE.star, spin: 1.5, hold: 0.12 })
    this.sprites.emit({ x, y: 1.1, z, color: '#ffd84a', size: 2.6, sizeEnd: 5.5, life: 0.55, shape: SHAPE.ring, hold: 0.05 })
    for (let k = 0; k < this.n(26); k++) {
      const a = (k / 26) * Math.PI * 4 + Math.random() * 0.3
      const r = 0.5 + Math.random() * 0.7
      this.sprites.emit({
        x: x + Math.cos(a) * r, y: 0.1 + Math.random() * 0.6, z: z + Math.sin(a) * r,
        vx: -Math.sin(a) * 1.4, vy: 3.5 + Math.random() * 4, vz: Math.cos(a) * 1.4,
        color: Math.random() < 0.4 ? '#ffffff' : '#ffd84a', size: 0.32, sizeEnd: 0.06, aspect: 0.3,
        life: 0.8 + Math.random() * 0.6, shape: SHAPE.streak, align: true, stretch: 0.05, drag: 0.4, hold: 0.3
      })
    }
  }

  /** Play a sim `fx` event. */
  play(e: Extract<SimEvent, { t: 'fx' }>, heightOf: (unit: number) => number): void {
    const id = e.id
    const c = e.color ?? '#ffffff'
    const ps = this.particles
    if (id.startsWith('burst:')) { this.burst(e.x, e.z, e.r ?? 2, id.slice(6), e.color); return }
    if (id.startsWith('impact:')) { this.shotHit(id.slice(7), e.x, 0.9, e.z, e.color); return }
    if (id.startsWith('fall:')) {
      const s = shotOf(id.slice(5))
      this.orb(e.x + 3, 15, e.z - 2, e.x, 0.4, e.z, s.size, s.color, s.trail, e.dur ?? 0.9, 0, id.slice(5))
      return
    }
    if (id.startsWith('lob:')) {
      const s = shotOf(id.slice(4))
      this.orb(e.x, 1.2, e.z, e.x2 ?? e.x, 0.3, e.z2 ?? e.z, s.size, s.color, s.trail, e.dur ?? 0.4, 3, id.slice(4))
      return
    }
    if (id.startsWith('field:')) { this.field(id.slice(6), e.x, e.z, e.r ?? 2, e.dur ?? 3, c); return }
    const h = e.unit ? heightOf(e.unit) : 1.2
    switch (id) {
      case 'slam':
      case 'quake':
        this.slam(e.x, e.z, e.r ?? 3, c)
        break
      case 'rupture': {
        // The ground gives: a wide ring, a cloud, stones and cracks (a slam the size of the field).
        const R = e.r ?? 12
        this.ring(e.x, e.z, 1, R, c, 0.8)
        this.disc(e.x, e.z, R, c, 0.3, 'flash')
        this.slam(e.x, e.z, Math.min(5, R * 0.4), c)
        break
      }

      case 'cleave':
        this.arc(e.x, e.z, e.a ?? 0, e.r ?? 2.4, e.dur ?? 0.9, c, 0.2)
        break
      case 'breath': {
        // A cone of the element: tongues that race out and swell, smoke at the end.
        const half = e.dur ?? 0.5
        const R = e.r ?? 6
        this.arc(e.x, e.z, e.a ?? 0, R, half, c, 0.45, true)
        const a = e.a ?? 0
        const sp = this.sprites
        const wave = (): void => {
        for (let k = 0; k < this.n(12); k++) {
          const off = a + (Math.random() - 0.5) * half * 2
          const v = R * (1.6 + Math.random() * 1.1)
          // Hot at the mouth, the element's colour as it swells, its ink at the far end.
          sp.emit({ x: e.x + Math.sin(off) * 0.4, y: 0.9, z: e.z + Math.cos(off) * 0.4, vx: Math.sin(off) * v, vy: Math.random() * 1.2, vz: Math.cos(off) * v, color: k % 6 === 0 ? '#fff4d8' : c, size: 0.8, sizeEnd: 1.5 + R * 0.25, life: 0.38 + Math.random() * 0.22, drag: 2.2, shape: SHAPE.puff, add: 1, hold: 0.25 })
        }
        for (let k = 0; k < this.n(14); k++) {
          const off = a + (Math.random() - 0.5) * half * 2
          const v = R * (2 + Math.random() * 1.4)
          sp.emit({ x: e.x, y: 0.9, z: e.z, vx: Math.sin(off) * v, vy: 0.5 + Math.random(), vz: Math.cos(off) * v, color: Math.random() < 0.5 ? '#ffffff' : c, size: 0.6, sizeEnd: 0.1, aspect: 0.25, align: true, stretch: 0.02, life: 0.3 + Math.random() * 0.15, drag: 2.5, shape: SHAPE.streak })
        }
        for (let k = 0; k < this.n(3); k++) {
          const off = a + (Math.random() - 0.5) * half * 2
          const d = R * (0.6 + Math.random() * 0.4)
          sp.emit({ x: e.x + Math.sin(off) * d, y: 0.6, z: e.z + Math.cos(off) * d, vy: 0.8, color: inkOf(c), size: 0.8, sizeEnd: 1.8, life: 0.8, drag: 1.5, shape: SHAPE.puff, add: 0, hold: 0.2 })
        }
        }
        wave()
        this.later(0.08, wave)
        this.later(0.16, wave)
        break
      }
      case 'beam': {
        // A glow, a white core, sparks along its length and a flare at each end.
        const x2 = e.x2 ?? e.x
        const z2 = e.z2 ?? e.z
        const w = e.r ?? 1
        this.beam(e.x, e.z, x2, z2, w * 1.2, c, 0.4)
        this.beam(e.x, e.z, x2, z2, w * 0.5, '#ffffff', 0.3)
        const sp = this.sprites
        const len = Math.hypot(x2 - e.x, z2 - e.z) || 0.01
        const mx = (e.x + x2) / 2
        const mz = (e.z + z2) / 2
        const ux = (x2 - e.x) / len
        const uz = (z2 - e.z) / len
        sp.emit({ x: mx, y: 0.9, z: mz, dx: ux, dy: 0, dz: uz, color: c, size: len, aspect: Math.min(1, w * 1.1 / len), life: 0.38, shape: SHAPE.band, hold: 0.35 })
        sp.emit({ x: mx, y: 0.9, z: mz, dx: ux, dy: 0, dz: uz, color: '#ffffff', size: len, aspect: Math.min(1, w * 0.35 / len), life: 0.3, shape: SHAPE.band, hold: 0.4 })
        for (let k = 0; k < this.n(12); k++) {
          const t = Math.random()
          sp.emit({ x: e.x + (x2 - e.x) * t, y: 0.9, z: e.z + (z2 - e.z) * t, vx: (Math.random() - 0.5) * 3, vy: 1 + Math.random() * 2, vz: (Math.random() - 0.5) * 3, color: Math.random() < 0.5 ? '#ffffff' : c, size: 0.2, sizeEnd: 0.04, life: 0.35, drag: 2, shape: SHAPE.dot })
        }
        sp.emit({ x: e.x, y: 0.9, z: e.z, color: '#ffffff', size: w * 1.4, sizeEnd: w * 0.6, rot: Math.random(), life: 0.2, shape: SHAPE.star, hold: 0.4 })
        sp.emit({ x: x2, y: 0.9, z: z2, color: c, size: w * 0.5, sizeEnd: w * 2.4, life: 0.3, shape: SHAPE.ring })
        this.particles.flash(x2, 0.9, z2, c, w * 2.2, 0.2)
        break
      }

      case 'dash':
        this.beam(e.x, e.z, e.x2 ?? e.x, e.z2 ?? e.z, 0.45, c, 0.28, 0.6)
        this.wind(e.x, e.z, e.x2 ?? e.x, e.z2 ?? e.z, c)
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
        // A cloud that billows out and hangs: plain smoke, not light.
        for (let k = 0; k < this.n(20); k++) {
          const a = Math.random() * Math.PI * 2
          const d = Math.random() * (e.r ?? 3)
          this.sprites.emit({ x: e.x + Math.cos(a) * d * 0.5, y: 0.3 + Math.random(), z: e.z + Math.sin(a) * d * 0.5, vx: Math.cos(a) * d * 1.4, vy: 0.5 + Math.random() * 0.6, vz: Math.sin(a) * d * 1.4, color: k % 3 ? '#5a5466' : c, size: 1 + Math.random() * 0.6, sizeEnd: 2.4 + Math.random(), life: 1.1 + Math.random() * 0.7, drag: 2.4, shape: SHAPE.puff, add: 0, hold: 0.35 })
        }
        this.particles.flash(e.x, 0.6, e.z, '#ffffff', 2, 0.1)
        break

      case 'roar':
      case 'harvest': {
        // Waves of it: three rings one after the other, and the air shaken.
        const R = e.r ?? 6
        this.ring(e.x, e.z, 0.5, R, c, 0.55)
        this.ring(e.x, e.z, 0.2, R * 0.7, '#ffffff', 0.4)
        this.ring(e.x, e.z, 0.3, R * 0.45, c, 0.3)
        for (let k = 0; k < this.n(10); k++) {
          const a = (k / 10) * Math.PI * 2
          this.sprites.emit({ x: e.x + Math.cos(a) * 0.8, y: 1, z: e.z + Math.sin(a) * 0.8, vx: Math.cos(a) * R * 1.6, vz: Math.sin(a) * R * 1.6, color: '#ffffff', size: 0.8, sizeEnd: 0.2, aspect: 0.1, align: true, life: 0.3, drag: 2, shape: SHAPE.streak })
        }
        break
      }

      case 'blast':
        this.burst(e.x, e.z, e.r ?? 2.4, 'ember', c)
        break
      case 'shieldSlam':
      case 'radiant':
        this.arc(e.x, e.z, e.a ?? 0, 2.4, 1.1, c, 0.22)
        if (id === 'radiant') this.pillar(e.x, e.z, 0.8, 6, '#fff2a8', 0.45)
        break
      case 'spike':
        this.pillar(e.x, e.z, 0.5, 2.6, c, 0.35)
        this.slam(e.x, e.z, 1.4, c)
        break
      case 'heal': {
        // Light gathers and rises: a ring on the ground, crosses and motes going up.
        ps.riseRing(e.x, 0.1, e.z, c, 0.7, this.n(16))
        ps.flash(e.x, h * 0.6, e.z, c, 1.8, 0.3)
        this.ring(e.x, e.z, 1.4, 0.4, c, 0.4)
        for (let k = 0; k < this.n(6); k++) {
          const a = (k / 6) * Math.PI * 2
          this.sprites.emit({ x: e.x + Math.cos(a) * 0.55, y: 0.3 + Math.random() * 0.5, z: e.z + Math.sin(a) * 0.55, vy: 1.6 + Math.random(), color: k % 2 ? '#ffffff' : c, size: 0.36, sizeEnd: 0.1, life: 0.7, shape: SHAPE.cross, hold: 0.4 })
        }
        break
      }

      case 'manaPotion':
        // The blue twin of a health potion's glow: a ring opens at the chest and
        // bubbles rise (the level props add the ring of motes on the ground).
        ps.flash(e.x, h * 0.6, e.z, c, 1.6, 0.3)
        this.sprites.emit({ x: e.x, y: h * 0.6, z: e.z, color: c, size: 0.4, sizeEnd: 1.5, life: 0.32, shape: SHAPE.ring })
        for (let k = 0; k < this.n(5); k++) this.sprites.emit({ x: e.x + (Math.random() - 0.5) * 0.8, y: 0.4 + Math.random() * 0.8, z: e.z + (Math.random() - 0.5) * 0.8, vy: 1.6 + Math.random(), color: '#cfe8ff', size: 0.22, sizeEnd: 0.4, life: 0.5, shape: SHAPE.bubble, add: 0.7 })
        break
      case 'buff':
      case 'shield':
      case 'fatalSave':
      case 'mark':
        // A ring that closes round the body, a shell of light, motes rising.
        this.ring(e.x, e.z, 0.3, 1.8, c, 0.5)
        this.sprites.emit({ x: e.x, y: h * 0.6, z: e.z, color: c, size: 2.4, sizeEnd: 1.2, life: 0.3, shape: SHAPE.ring, hold: 0.2 })
        this.sprites.emit({ x: e.x, y: h * 0.6, z: e.z, color: '#ffffff', size: 1, sizeEnd: 0.3, rot: 0.78, life: 0.2, shape: SHAPE.star, hold: 0.3 })
        ps.riseRing(e.x, 0.1, e.z, c, 0.7, this.n(12))
        break
      case 'bastion':
      case 'exosuit':
      case 'rage':
      case 'stasis':
      case 'petrify':
        this.pillar(e.x, e.z, 0.9, 3.2, c, 0.5)
        this.ring(e.x, e.z, 0.3, 2.6, c, 0.6)
        this.ring(e.x, e.z, 2.6, 0.6, '#ffffff', 0.35)
        ps.riseRing(e.x, 0.1, e.z, c, 0.9, this.n(18))
        break

      case 'chest':
        this.levelUp(e.x, e.z)
        break
      default:
        break
    }
  }

  /** A lingering ground field's standing visual (its life is in `fieldLife`). */
  field(fx: string, x: number, z: number, r: number, dur: number, color: string): void {
    this.ring(x, z, r * 0.5, r, color, 0.4)
    if (fx === 'pillar' || fx === 'orbital') this.pillar(x, z, r, fx === 'orbital' ? 16 : 5, color, dur)
    const d = this.disc(x, z, r, color, dur, 'field')
    d.fx = fx
  }

  // ─── Per frame ─────────────────────────────────────────────────────────────

  /**
   * Mirror the sim's projectiles. Light is drawn as layered sprites (`flight`);
   * only a lump of matter keeps a mesh. Call once a frame, BEFORE `update`.
   */
  syncProjectiles(list: Projectile[], alpha: number, dt: number): void {
    this.heads.begin()
    this.synced = true
    for (const [p, m] of this.shots) {
      if (p.active) continue
      m.visible = false
      this.shotPool.push(m)
      this.shots.delete(p)
    }
    // Lead by the part of a step the render is ahead of the sim.
    const lead = alpha * (1 / 60)
    for (let i = 0; i < list.length; i++) {
      const p = list[i]!
      if (!p.active) continue
      const s = shotOf(p.fx)
      const size = s.size * (p.aoe > 0 ? 1.15 : 1)
      const x = p.x + p.vx * lead
      const z = p.z + p.vz * lead
      // A lob climbs and falls: its flight has a vertical part (`sim/actors.ts`).
      let vy = 0
      if (p.lob > 0) {
        const k = Math.min(1, p.lobT / p.lob)
        vy = Math.cos(k * Math.PI) * Math.PI * (2.2 + p.lob * 2.4) / p.lob
      }
      if (s.body === 'matter') {
        let m = this.shots.get(p)
        if (!m) {
          m = this.shotPool.pop()
          if (!m) {
            m = new Mesh(this.orbGeo, basic(false))
            m.renderOrder = 6
            this.root.add(m)
          }
          m.visible = true
          ;(m.material as MeshBasicMaterial).color.set(p.color || s.color)
          m.scale.setScalar(size)
          this.shots.set(p, m)
        }
        // A shot's height is over the ground under it: it climbs a hill with the hill.
        m.position.set(x, p.y + groundAt(x, z), z)
        m.rotation.x += dt * 9
        m.rotation.z += dt * 5
      }
      this.flight(s, x, p.y, z, p.vx, vy, p.vz, size, p.color || s.color, dt)
    }
  }

  /**
   * One frame of something in flight at (x, y, z) going (vx, vy, vz): its head
   * (stamped for this frame only), the ribbon it leaves and its wake.
   */
  private flight(s: ShotLook, x: number, y: number, z: number, vx: number, vy: number, vz: number, size: number, color: string, dt: number): void {
    const hd = this.heads
    const sp = this.sprites
    const speed = Math.hypot(vx, vy, vz) || 1
    const ux = vx / speed
    const uy = vy / speed
    const uz = vz / speed
    const t = this.time
    // ── The head ──
    if (s.body === 'energy') {
      const flick = 0.9 + 0.1 * Math.sin(t * 47 + x * 3)
      const len = size * 3.2 + speed * 0.04
      const bx = x - ux * size * 0.5
      const by = y - uy * size * 0.5
      const bz = z - uz * size * 0.5
      hd.stamp({ x, y, z, color, size: size * 3.6 * flick, life: 1, shape: SHAPE.dot }, 0.5)
      // Ink first (drawn under), then the light over it.
      hd.stamp({ x: bx, y: by, z: bz, dx: ux, dy: uy, dz: uz, color: inkOf(color), size: len * 1.08, aspect: 0.7, life: 1, shape: SHAPE.streak, add: 0 }, 0.7)
      hd.stamp({ x: bx, y: by, z: bz, dx: ux, dy: uy, dz: uz, color, size: len, aspect: 0.62, life: 1, shape: SHAPE.streak, add: 0.55 })
      if (s.spin !== undefined) hd.stamp({ x, y, z, color: s.spark, size: size * 2.3, rot: t * (s.spin === SHAPE.claw ? 9 : 4), life: 1, shape: s.spin, add: s.spin === SHAPE.bubble ? 0.6 : 1 }, 0.85)
      hd.stamp({ x, y, z, color: '#ffffff', size: size * 1.15 * flick, life: 1, shape: SHAPE.dot })
    } else if (s.body === 'point') {
      // The shaft along the flight, the point a glint.
      hd.stamp({ x: x - ux * 0.35, y: y - uy * 0.35, z: z - uz * 0.35, dx: ux, dy: uy, dz: uz, color, size: Math.max(0.9, size * 4.2), aspect: 0.75, life: 1, shape: SHAPE.needle, add: 0.55 })
      hd.stamp({ x, y, z, color: s.spark, size: size * 1.6, life: 1, shape: SHAPE.star, rot: t * 6 }, 0.9)
      if (s.wake.includes('fire')) {
        // A rocket's exhaust: a flame out of its tail.
        hd.stamp({ x: x - ux * 0.6, y: y - uy * 0.6, z: z - uz * 0.6, dx: -ux, dy: -uy, dz: -uz, color: s.trail, size: 1.1 * (0.85 + Math.random() * 0.3), aspect: 0.45, life: 1, shape: SHAPE.streak })
      }
    } else {
      // Matter: its mesh, and a faint halo of its trail so it reads on dark ground.
      hd.stamp({ x, y, z, color: s.trail, size: size * 2.8, life: 1, shape: SHAPE.dot }, 0.35)
      if (s.wake.includes('fire')) hd.stamp({ x, y: y + size * 0.9, z, color: '#ffd27a', size: 0.5 * (0.7 + Math.random() * 0.6), rot: Math.random() * 3, life: 1, shape: SHAPE.star })
    }
    // ── The ribbon: a short streak along the way it went, fading over a few frames ──
    const seg = speed * dt * 2.2 + 0.2
    const width = s.body === 'point' ? 0.1 : size * 1.2
    const plain = s.body === 'point' && !s.wake.includes('fire')
    sp.emit({
      x: x - ux * seg * 0.5, y: y - uy * seg * 0.5, z: z - uz * seg * 0.5, dx: ux, dy: uy, dz: uz,
      color: plain ? '#ffffff' : s.trail, size: seg, sizeEnd: seg,
      aspect: Math.min(1, width / seg), life: plain ? 0.12 : 0.2, hold: 0, shape: SHAPE.band, add: plain ? 0.7 : 0.6
    })
    // ── The wake ──
    const r = this.low ? 0.5 : 1
    const chance = (perSecond: number): boolean => Math.random() < dt * perSecond * r
    const jx = (): number => (Math.random() - 0.5) * size
    for (const w of s.wake) {
      switch (w) {
        case 'fire':
          if (chance(45)) sp.emit({ x: x + jx(), y: y + jx(), z: z + jx(), vx: -ux * 2 + (Math.random() - 0.5) * 1.5, vy: 1.4 + Math.random() * 2, vz: -uz * 2 + (Math.random() - 0.5) * 1.5, color: Math.random() < 0.5 ? s.spark : s.trail, size: 0.32 * (0.6 + size), sizeEnd: 0.06, aspect: 0.4, align: true, stretch: 0.03, life: 0.28 + Math.random() * 0.2, drag: 2, shape: SHAPE.streak })
          if (chance(40)) this.particles.emit({ x, y, z, vx: (Math.random() - 0.5) * 0.8, vy: 0.5 + Math.random() * 0.6, vz: (Math.random() - 0.5) * 0.8, color: s.trail, size: size * 1.7, sizeEnd: 0.05, life: 0.22 + Math.random() * 0.12 })
          break
        case 'smoke':
          if (chance(16)) sp.emit({ x: x - ux * size, y, z: z - uz * size, vx: (Math.random() - 0.5) * 0.6, vy: 0.5 + Math.random() * 0.5, vz: (Math.random() - 0.5) * 0.6, color: '#4a4440', size: size * 1.1 + 0.2, sizeEnd: size * 2.6 + 0.5, life: 0.55 + Math.random() * 0.3, drag: 1.2, shape: SHAPE.puff, add: 0, hold: 0.1 })
          break
        case 'frost':
          if (chance(28)) sp.emit({ x: x + jx(), y: y + jx(), z: z + jx(), vx: (Math.random() - 0.5) * 1.2, vy: -0.4 - Math.random(), vz: (Math.random() - 0.5) * 1.2, color: Math.random() < 0.5 ? '#ffffff' : s.trail, size: 0.2 + Math.random() * 0.16, sizeEnd: 0.04, rot: Math.random() * 3, spin: 4, life: 0.4, shape: SHAPE.shard, hold: 0.3 })
          break
        case 'shadow':
          if (chance(26)) sp.emit({ x: x + jx(), y: y + jx(), z: z + jx(), vx: (Math.random() - 0.5) * 0.8, vy: 0.3 + Math.random() * 0.6, vz: (Math.random() - 0.5) * 0.8, color: '#1c0f33', size: size * 1.4, sizeEnd: size * 2.2, life: 0.4, drag: 1.5, shape: SHAPE.puff, add: 0, hold: 0.1 })
          if (chance(24)) sp.emit({ x: x + jx(), y: y + jx(), z: z + jx(), vx: (Math.random() - 0.5) * 2, vy: 0.8 + Math.random(), vz: (Math.random() - 0.5) * 2, color: s.spark, size: 0.16, sizeEnd: 0.03, life: 0.4, shape: SHAPE.dot })
          break
        case 'holy':
          if (chance(18)) sp.emit({ x: x + jx(), y: y + jx(), z: z + jx(), vy: 0.6 + Math.random() * 0.6, color: Math.random() < 0.5 ? '#ffffff' : s.trail, size: 0.3, sizeEnd: 0.05, life: 0.42, shape: SHAPE.cross, hold: 0.3 })
          break
        case 'venom':
          if (chance(22)) sp.emit({ x: x + jx(), y: y + jx(), z: z + jx(), vx: (Math.random() - 0.5) * 0.8, vy: 0.2, vz: (Math.random() - 0.5) * 0.8, color: s.color, size: 0.14 + Math.random() * 0.14, sizeEnd: 0.08, life: 0.5, gravity: 5, shape: SHAPE.bubble, add: 0.6 })
          break
        case 'water':
          if (chance(30)) sp.emit({ x: x + jx(), y: y + jx(), z: z + jx(), vx: -ux * 1.5 + (Math.random() - 0.5) * 1.5, vy: 0.6 + Math.random(), vz: -uz * 1.5 + (Math.random() - 0.5) * 1.5, color: Math.random() < 0.5 ? '#ffffff' : s.color, size: 0.16, sizeEnd: 0.05, aspect: 0.5, align: true, life: 0.4, gravity: 9, shape: SHAPE.streak, add: 0.7 })
          break
        case 'arcane':
          if (chance(30)) {
            const a = t * 9 + Math.random() * 6.28
            sp.emit({ x: x + Math.cos(a) * size * 0.8, y: y + Math.sin(a) * size * 0.8, z, vx: Math.cos(a) * 1.4, vy: Math.sin(a) * 1.4, vz: (Math.random() - 0.5), color: Math.random() < 0.4 ? '#ffffff' : s.spark, size: 0.16, sizeEnd: 0.03, life: 0.35, drag: 2, shape: SHAPE.dot })
          }
          if (chance(5)) sp.emit({ x, y, z, color: s.color, size: size * 2.2, sizeEnd: size * 2.6, rot: Math.random() * 6, life: 0.08, shape: SHAPE.bolt, hold: 0.4 })
          break
        case 'dust':
          if (chance(10)) sp.emit({ x, y, z, vx: (Math.random() - 0.5) * 0.4, vy: 0.2, vz: (Math.random() - 0.5) * 0.4, color: '#c8bca8', size: 0.25, sizeEnd: 0.6, life: 0.4, shape: SHAPE.puff, add: 0 })
          break
        case 'leaf':
          if (chance(14)) sp.emit({ x: x + jx(), y, z: z + jx(), vx: (Math.random() - 0.5) * 1.6, vy: 0.6, vz: (Math.random() - 0.5) * 1.6, color: Math.random() < 0.5 ? s.trail : s.spark, size: 0.2, sizeEnd: 0.14, aspect: 0.5, rot: Math.random() * 6, spin: 6, life: 0.6, gravity: 3, drag: 1.5, shape: SHAPE.slash, add: 0.3 })
          break
        case 'blood':
          if (chance(20)) sp.emit({ x, y, z, vx: (Math.random() - 0.5), vy: 0.5, vz: (Math.random() - 0.5), color: s.color, size: 0.16, sizeEnd: 0.08, aspect: 0.45, align: true, life: 0.45, gravity: 10, shape: SHAPE.streak, add: 0.35 })
          break
        case 'air':
          break
      }
    }
  }

  /** A projectile of `kind` lands at (x, y, z): as its element, with a ring of light. */
  shotHit(kind: string, x: number, y: number, z: number, color?: string): void {
    const s = shotOf(kind)
    const col = color || s.color
    this.impact({ x, y, z, dx: 0, dz: 0, type: s.hit, blow: s.blow ?? 'slash', heavy: s.size >= 0.45, crit: false, dot: false, size: 0.4 + s.size, toHero: false, color: s.hit === 'physical' || s.hit === 'pierce' ? undefined : col })
    this.sprites.emit({ x, y, z, color: s.spark, size: s.size * 1.2, sizeEnd: s.size * 4.5, life: 0.22, shape: SHAPE.ring })
  }

  /** What a standing field does each frame, by its kind. */
  private fieldLife(p: Disc, dt: number): void {
    const x = p.mesh.position.x
    const z = p.mesh.position.z
    const r = p.r
    const area = Math.min(3, 0.5 + r * 0.4)
    const rate = (this.low ? 0.5 : 1) * area
    const chance = (perSecond: number): boolean => Math.random() < dt * perSecond * rate
    const at = (): [number, number] => { const a = Math.random() * Math.PI * 2; const d = Math.sqrt(Math.random()) * r; return [x + Math.cos(a) * d, z + Math.sin(a) * d] }
    const col = '#' + p.mat.color.getHexString()
    const sp = this.sprites
    // The edge breathes out now and then.
    if (chance(0.9)) this.ring(x, z, r * 0.85, r * 1.02, col, 0.7, 0.05)
    switch (p.fx) {
      case 'burning':
      case 'pillar':
      case 'ember':
        if (chance(26)) { const [fx, fz] = at(); sp.emit({ x: fx, y: 0.1, z: fz, vx: (Math.random() - 0.5) * 0.6, vy: 1.8 + Math.random() * 2, vz: (Math.random() - 0.5) * 0.6, color: Math.random() < 0.5 ? '#ffd27a' : '#ff6a1a', size: 0.55 + Math.random() * 0.3, sizeEnd: 0.1, aspect: 0.45, align: true, stretch: 0.03, life: 0.4 + Math.random() * 0.2, drag: 1.5, shape: SHAPE.streak }) }
        if (chance(5)) { const [fx, fz] = at(); sp.emit({ x: fx, y: 0.5, z: fz, vy: 0.8, color: '#3a3430', size: 0.6, sizeEnd: 1.5, life: 1, shape: SHAPE.puff, add: 0, hold: 0.2 }) }
        break
      case 'venom':
      case 'poison':
        if (chance(14)) { const [fx, fz] = at(); sp.emit({ x: fx, y: 0.1, z: fz, vy: 0.5 + Math.random() * 0.6, color: col, size: 0.16 + Math.random() * 0.2, sizeEnd: 0.36, life: 0.7, shape: SHAPE.bubble, add: 0.6 }) }
        if (chance(4)) { const [fx, fz] = at(); sp.emit({ x: fx, y: 0.3, z: fz, vy: 0.3, color: inkOf(col), size: 0.9, sizeEnd: 1.8, life: 1.4, shape: SHAPE.puff, add: 0, hold: 0.3 }) }
        break
      case 'haste': {
        // Wind circling the ground.
        if (chance(10)) {
          const a = Math.random() * Math.PI * 2
          const d = r * (0.4 + Math.random() * 0.5)
          sp.emit({ x: x + Math.cos(a) * d, y: 0.3 + Math.random() * 0.8, z: z + Math.sin(a) * d, vx: -Math.sin(a) * 5, vz: Math.cos(a) * 5, color: Math.random() < 0.5 ? '#ffffff' : col, size: 1, sizeEnd: 0.3, aspect: 0.06, align: true, life: 0.3, drag: 1, shape: SHAPE.streak })
        }
        break
      }
      case 'banner':
        if (chance(10)) { const [fx, fz] = at(); sp.emit({ x: fx, y: 0.1, z: fz, vy: 1.4 + Math.random(), color: Math.random() < 0.5 ? '#ffffff' : col, size: 0.24, sizeEnd: 0.06, life: 0.9, shape: SHAPE.cross, hold: 0.3 }) }
        break
      case 'orbital':
        if (chance(16)) { const [fx, fz] = at(); sp.emit({ x: fx, y: 7, z: fz, vy: -16, color: Math.random() < 0.5 ? '#ffffff' : col, size: 1.2, sizeEnd: 0.4, aspect: 0.1, align: true, life: 0.4, shape: SHAPE.streak }) }
        break
      default:
        if (chance(12)) { const [fx, fz] = at(); this.particles.emit({ x: fx, y: 0.1, z: fz, vy: 1.5 + Math.random() * 2, color: col, size: 0.24, sizeEnd: 0.04, life: 0.7 }) }
    }
  }
  /** `simTime` is the sim's own clock: ground previews fill by it (see `telegraphs.ts`). */
  update(dt: number, simTime = 0): void {
    this.time += dt
    if (!this.synced) this.heads.begin()
    if (this.queue.length) {
      const due = this.queue.filter(q => q.at <= this.time)
      if (due.length) {
        this.queue = this.queue.filter(q => q.at > this.time)
        for (const q of due) q.fn()
      }
    }
    this.synced = false
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
      // A breath's cone is only the shape under the flames: faint.
      p.mat.opacity = (1 - k) * (p.breath ? 0.3 : 0.95)
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
      if (p.kind === 'flash') p.mat.opacity = (1 - k) * (p.mat.blending === AdditiveBlending ? 0.7 : 0.5)
      else {
        // A standing field breathes, and fades in and out at its ends.
        const edge = Math.min(1, p.t / 0.25, (p.dur - p.t) / 0.4)
        p.mat.opacity = (0.4 + 0.1 * Math.sin(this.time * 6)) * Math.max(0, edge)
        if (p.fill && p.pulse > 0) {
          ;(p.fill.material as MeshBasicMaterial).opacity = (0.55 + 0.15 * Math.sin(this.time * 14)) * Math.max(0, edge)
          p.fill.rotation.y += dt * 2.5
        }
        this.fieldLife(p, dt)
      }
    }
    for (const p of this.beams) {
      if (!p.active) continue
      p.t += dt
      const k = p.t / p.dur
      if (k >= 1) { p.active = false; p.mesh.visible = false; continue }
      p.mat.opacity = 1 - k
      // A beam is never steady: its width shivers.
      p.mesh.scale.y = p.w * 2 * (1 - k * 0.6) * (0.82 + 0.18 * Math.sin(this.time * 71 + p.seed) * Math.sin(this.time * 23 + p.seed))
    }
    for (const p of this.orbs) {
      if (!p.active) continue
      p.t += dt
      const k = Math.min(1, p.t / p.dur)
      const x = p.x0 + (p.x1 - p.x0) * k
      const z = p.z0 + (p.z1 - p.z0) * k
      const y = p.y0 + (p.y1 - p.y0) * k + Math.sin(k * Math.PI) * p.arc
      p.mesh.position.set(x, y + groundAt(x, z), z)
      p.mesh.rotation.x += dt * 7
      const hex = '#' + p.mat.color.getHexString()
      const look = p.kind ? shotOf(p.kind) : moteLook(hex, p.trail, p.size)
      const inv = 1 / Math.max(1e-4, dt)
      this.flight(look, x, y, z, (x - p.px) * inv, (y - p.py) * inv, (z - p.pz) * inv, p.size, hex, dt)
      p.px = x
      p.py = y
      p.pz = z
      if (k >= 1) { p.active = false; p.mesh.visible = false }
    }
    this.particles.update(dt)
    this.sprites.update(dt)
    this.trails.update(dt)
    this.teles.update(dt, simTime)
    this.loot.update(dt)
    this.heads.end()
    this.impactsLeft = this.low ? 3 : 6
  }

  setViewport(heightPx: number, fovDeg: number): void {
    this.particles.setScale(heightPx, fovDeg)
  }

  clear(): void {
    for (const list of [this.rings, this.arcs, this.discs, this.beams, this.orbs] as Pooled[][]) {
      for (const p of list) { p.active = false; p.mesh.visible = false }
    }
    for (const d of this.discs) if (d.fill) d.fill.visible = false
    this.queue = []
    for (const [, m] of this.shots) { m.visible = false; this.shotPool.push(m) }
    this.shots.clear()
    this.particles.clear()
    this.sprites.clear()
    this.heads.clear()
    this.trails.clear()
    this.teles.clear()
    this.loot.clear()
  }

  dispose(): void {
    this.ringGeo.dispose()
    this.discGeo.dispose()
    this.planeGeo.dispose()
    this.orbGeo.dispose()
    this.pillarGeo.dispose()
    for (const g of this.arcGeos.values()) g.dispose()
    this.particles.dispose()
    this.sprites.dispose()
    this.heads.dispose()
    this.trails.dispose()
    this.teles.dispose()
    this.loot.dispose()
    this.root.traverse((o) => { const m = (o as Mesh).material as MeshBasicMaterial | undefined; if (m && m.dispose) m.dispose() })
    this.root.removeFromParent()
  }
}

export { ringTexture }
