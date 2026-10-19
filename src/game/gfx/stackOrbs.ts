import {
  AdditiveBlending, Color, DynamicDrawUsage, InstancedMesh, Matrix4, MeshBasicMaterial, PlaneGeometry, Quaternion, Vector3,
  type Camera, type Scene,
} from 'three'
import type { Status, StatusId } from '../sim/types'
import { CHI_BEADS } from '../state/statusView'
import { statusTint } from '@/components/art/tints'
import { glowTexture } from './textures'

/**
 * ─── Stack orbs ──────────────────────────────────────────────────────────────
 *
 * The charges a hero's own skills build, circling him (like the Diablo 2
 * assassin's charges before a finisher): one orb per stack, one ring per kind.
 * The Iron Monk's chi is a ring of jade beads at the chest; Entropy's
 * Accelerate a wider, higher ring of small time sparks. The ring spins faster
 * as it fills, a new bead pops in, a full ring pulses ("finisher ready"), and
 * spending the stacks pulls every bead into the body in a fast collapse.
 * Running out of time only fades them where they are.
 *
 * Only stacks a skill builds on the hero: no foe's debuffs, no elixirs.
 *
 * Cost: ONE InstancedMesh (camera-facing glow quads, additive, unlit, no
 * shadows) sized for every ring full plus every ring collapsing, and nothing
 * allocated per frame. With nothing stacked it is hidden and the frame does
 * no more than read the hero's statuses.
 */

export interface OrbRing {
  id: StatusId
  /** Most stacks the ring shows (one slot each, fixed spacing: no jumps when one is added). */
  max: number
  /** Radius round the body, in body radii. */
  radius: number
  /** Height, as a share of the body's height. */
  height: number
  /** Orb size, in metres. */
  size: number
}

export const ORB_RINGS: readonly OrbRing[] = [
  { id: 'chi', max: CHI_BEADS, radius: 1.7, height: 0.6, size: 0.34 },
  { id: 'accelerate', max: 10, radius: 2.2, height: 0.85, size: 0.22 },
]

/** Every orb the rings can draw at once: each ring full while the last batch collapses. */
export const ORB_POOL = ORB_RINGS.reduce((s, r) => s + r.max * 2, 0)

const SPIN_MIN = 1.6
const SPIN_MAX = 5.2
const SPIN_CALM = 0.6
const POP_RATE = 5
const COLLAPSE_RATE = 1 / 0.22
const FADE_RATE = 1 / 0.3
/** A status that dies with less than this left ran out; with more, it was spent. */
const EXPIRY_EDGE = 0.25

/** A dead hero's statuses, without a fresh array a frame. */
export const NO_STATUSES: readonly Status[] = []

/** What a ring did since the last frame. */
export type StackChange = 'none' | 'add' | 'spend' | 'expire'

/** Read a ring's change from its last and current count (`prevT` = seconds it had left). */
export const stackChange = (prevN: number, n: number, prevT: number): StackChange => {
  if (n > prevN) return 'add'
  if (n >= prevN) return 'none'
  return n === 0 && prevT <= EXPIRY_EDGE ? 'expire' : 'spend'
}

/** A ring's running state between frames. */
export interface RingState { n: number; t: number; phase: number; pop: number; gone: number; goneN: number; goneK: 'spend' | 'expire'; goneR: number }

export const newRingState = (): RingState => ({ n: 0, t: 0, phase: 0, pop: 0, gone: 0, goneN: 0, goneK: 'spend', goneR: 0 })

/** One orb to draw: offset from the body, size, brightness, and its ring. */
export interface Orb { x: number; y: number; z: number; s: number; b: number; ring: number }

export const newOrbs = (): Orb[] => Array.from({ length: ORB_POOL }, () => ({ x: 0, y: 0, z: 0, s: 0, b: 0, ring: 0 }))

/** Body size and frame options for `layoutOrbs`. */
export interface OrbFrame { r: number; h: number; dt: number; time: number; calm: boolean }

/**
 * Advance every ring by one frame and write the orbs to draw into `out`
 * (preallocated, `ORB_POOL` long); returns how many. Pure, allocation-free.
 */
export const layoutOrbs = (statuses: readonly Status[], st: RingState[], f: OrbFrame, out: Orb[]): number => {
  let k = 0
  for (let ri = 0; ri < ORB_RINGS.length; ri++) {
    const ring = ORB_RINGS[ri]!
    const s = st[ri]!
    let n = 0
    let t = 0
    for (let i = 0; i < statuses.length; i++) {
      const q = statuses[i]!
      if (q.id === ring.id) { n = Math.min(ring.max, q.n ?? 1); t = q.t; break }
    }
    const ch = stackChange(s.n, n, s.t)
    if (ch === 'add') s.pop = 1
    else if (ch === 'spend' || ch === 'expire') { s.gone = 1; s.goneN = s.n; s.goneK = ch; s.goneR = s.phase }
    s.n = n
    s.t = t
    s.pop = Math.max(0, s.pop - f.dt * POP_RATE)
    if (s.gone > 0) s.gone = Math.max(0, s.gone - f.dt * (s.goneK === 'spend' ? COLLAPSE_RATE : FADE_RATE))
    if (n === 0 && s.gone === 0) continue

    const fill = n / ring.max
    const spin = f.calm ? SPIN_CALM : SPIN_MIN + (SPIN_MAX - SPIN_MIN) * fill
    s.phase = (s.phase + f.dt * spin) % (Math.PI * 2)
    const rad = Math.max(0.5, f.r) * ring.radius
    const y = f.h * ring.height
    const step = (Math.PI * 2) / ring.max
    const full = n === ring.max
    const pulse = full && !f.calm ? 0.5 + 0.5 * Math.sin(f.time * 7) : 0
    for (let i = 0; i < n; i++) {
      const a = s.phase + i * step
      const o = out[k++]!
      const bob = f.calm ? 0 : Math.sin(f.time * 3 + i * 1.3) * 0.04
      o.x = Math.cos(a) * rad
      o.z = Math.sin(a) * rad
      o.y = y + bob
      o.s = ring.size * (1 + (i === n - 1 ? s.pop * 0.9 : 0) + pulse * 0.25)
      o.b = 0.85 + pulse * 0.6 + (i === n - 1 ? s.pop * 0.5 : 0)
      o.ring = ri
    }
    // The ones just spent rush into the body (or, run out, fade where they are).
    if (s.gone > 0) {
      const g = s.gone
      const spend = s.goneK === 'spend'
      for (let i = 0; i < s.goneN; i++) {
        const a = s.goneR + i * step + (spend ? (1 - g) * 3 : 0)
        const rr = spend ? rad * g * g : rad
        const o = out[k++]!
        o.x = Math.cos(a) * rr
        o.z = Math.sin(a) * rr
        o.y = spend ? y * (0.85 + 0.15 * g) : y
        o.s = ring.size * (spend ? 1 + (1 - g) * 1.4 : g)
        o.b = spend ? 1.4 * g + 0.3 : g
        o.ring = ri
      }
    }
  }
  return k
}

const reducedMotion = (): boolean => {
  try { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

/** The view side: the orbs round one hero, drawn as one InstancedMesh. */
export class StackOrbs {
  readonly mesh: InstancedMesh
  private readonly geo = new PlaneGeometry(1, 1)
  private readonly mat = new MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false })
  private readonly rings = ORB_RINGS.map(newRingState)
  private readonly orbs = newOrbs()
  private readonly tints = ORB_RINGS.map(r => new Color(statusTint(r.id)))
  private readonly calm = reducedMotion()
  private readonly frame: OrbFrame = { r: 0, h: 0, dt: 0, time: 0, calm: false }
  private readonly m = new Matrix4()
  private readonly p = new Vector3()
  private readonly sc = new Vector3()
  private readonly c = new Color()

  constructor(scene: Scene) {
    this.mesh = new InstancedMesh(this.geo, this.mat, ORB_POOL)
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.setColorAt(0, this.c)
    this.mesh.instanceColor!.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.castShadow = this.mesh.receiveShadow = false
    this.mesh.renderOrder = 5
    this.mesh.count = 0
    this.mesh.visible = false
    scene.add(this.mesh)
  }

  /** Once a frame: the hero's statuses at his drawn position, faced to the camera. */
  update(statuses: readonly Status[], x: number, z: number, r: number, h: number, dt: number, time: number, camera: Camera, base = 0): void {
    const f = this.frame
    f.r = r; f.h = h; f.dt = dt; f.time = time; f.calm = this.calm
    const n = layoutOrbs(statuses, this.rings, f, this.orbs)
    this.mesh.count = n
    this.mesh.visible = n > 0
    if (!n) return
    const q: Quaternion = camera.quaternion
    for (let i = 0; i < n; i++) {
      const o = this.orbs[i]!
      this.p.set(x + o.x, base + o.y, z + o.z)
      this.sc.set(o.s, o.s, o.s)
      this.m.compose(this.p, q, this.sc)
      this.mesh.setMatrixAt(i, this.m)
      this.mesh.setColorAt(i, this.c.copy(this.tints[o.ring]!).multiplyScalar(o.b))
    }
    this.mesh.instanceMatrix.needsUpdate = true
    this.mesh.instanceColor!.needsUpdate = true
  }

  dispose(): void {
    this.mesh.removeFromParent()
    this.mesh.dispose()
    this.geo.dispose()
    this.mat.dispose()
  }
}
