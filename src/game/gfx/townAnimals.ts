import { Group, Mesh, type BufferGeometry, type Object3D } from 'three'
import { CELL, hasWalkLine, type Grid } from '../sim/grid'
import { TC_GRASS, TC_GROUND, TC_SQUARE, TC_STREET, TC_YARD, type TownPlan } from '../sim/town'
import { Mesher, newKit, type Kit } from './archKit'
import { celVC, outlineMat } from './cel'
import { groundAt } from './ground'

/**
 * ─── The town's animals (roadmap #97) ────────────────────────────────────────
 *
 * Chickens scratch about the gardens; cats sit on doorsteps and one strolls
 * the lanes; a dog or two roam the streets and trot up to the hero to sit and
 * wag; squirrels dart about the trees and run up into the crown when he comes
 * near. All of it is the view's: nothing here touches the sim or the save,
 * and it uses the sim's grid only to walk where a body could.
 *
 * Every model is a few balls, posts and beams in one merged mesh with its
 * outline, facing +Z with its feet at the origin; the parts that move on
 * their own (a head, a tail) are their own small meshes. `animalKits` builds
 * them as plain kits, so the z-fighting test checks every coat and pose.
 */

export type AnimalKind = 'chicken' | 'cat' | 'dog' | 'squirrel'
export type AnimalPose = 'stand' | 'sit'

export interface Coat { fur: string; belly: string; ear: string; eye: string }

export const CAT_COATS: readonly Coat[] = [
  { fur: '#f0a050', belly: '#fff4e0', ear: '#e08a3a', eye: '#3a8a3a' },
  { fur: '#8a8a94', belly: '#e8e8ee', ear: '#74747e', eye: '#d8a830' },
  { fur: '#3a3440', belly: '#f4f0ea', ear: '#2a2430', eye: '#d8c040' },
  { fur: '#f4e2c0', belly: '#fffaf0', ear: '#d8b890', eye: '#4a8ac8' },
  { fur: '#a0784a', belly: '#f0e0c8', ear: '#7a5634', eye: '#3a8a3a' }
]
export const DOG_COATS: readonly Coat[] = [
  { fur: '#c8884a', belly: '#f4e4cc', ear: '#8a5428', eye: '#2a1a14' },
  { fur: '#f4f0e6', belly: '#ffffff', ear: '#a07850', eye: '#2a1a14' },
  { fur: '#4a3a34', belly: '#d8b890', ear: '#2e2420', eye: '#1b1214' },
  { fur: '#d8b070', belly: '#f8ecd8', ear: '#b88a50', eye: '#2a1a14' }
]
export const SQUIRREL_COAT: Coat = { fur: '#b8602e', belly: '#f0dcc0', ear: '#9a4a22', eye: '#1b1626' }
const CHICKEN_COAT: Coat = { fur: '#fff8ee', belly: '#f4ece0', ear: '#e03a3a', eye: '#1b1626' }

/** One leg, hanging from its hip (the kit's origin) straight down `len` to the paw. */
export interface LegKit {
  kit: Kit
  at: [number, number, number]
  len: number
}

/** The parts of one animal in one pose, and where the moving ones hang. */
export interface AnimalKits {
  body: Kit
  head: Kit | null
  headAt: [number, number, number]
  tail: Kit | null
  tailAt: [number, number, number]
  /** Standing four-legged bodies: the legs, front left, front right, hind
   *  left, hind right (#102). Empty where the legs are part of the body. */
  legs: LegKit[]
}

/** A leg: a post from the hip down to a paw ball, the hip at the origin. */
const legKit = (r: number, len: number, fur: string, paw: string): Kit => {
  const k = newKit()
  k.hull.cyl(0, -len + r * 0.6, 0, r * 0.88, r, len - r * 0.6, 6, fur)
  k.hull.ball(0, -len + r * 0.75, r * 0.25, r * 1.05, paw, 5, 3, 0.75)
  return k
}

/** Four legs at (±x, ±z) under hips at height `len`: FL, FR, HL, HR. */
const fourLegs = (x: number, z: number, len: number, r: number, fur: string, paw: string): LegKit[] =>
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => ({ kit: legKit(r, len, fur, paw), at: [sx! * x, len, sz! * z] as [number, number, number], len }))

const INK = '#1b1626'

const catHead = (c: Coat): Kit => {
  const k = newKit()
  k.hull.ball(0, 0, 0, 0.1, c.fur, 7, 5)
  for (const s of [-1, 1]) k.detail.prism([[s * 0.075 - 0.032, 0.05], [s * 0.075 + 0.032, 0.05], [s * 0.078, 0.135]], -0.018, 0.018, c.ear)
  k.detail.ball(0, -0.035, 0.07, 0.045, c.belly, 5, 3)
  k.detail.box(-0.05, 0.0, 0.082, -0.022, 0.03, 0.1, c.eye, 'b')
  k.detail.box(0.022, 0.0, 0.082, 0.05, 0.03, 0.1, c.eye, 'b')
  k.detail.box(-0.012, -0.03, 0.112, 0.012, -0.012, 0.122, '#e07a8a', 'b')
  return k
}

const dogHead = (c: Coat): Kit => {
  const k = newKit()
  k.hull.ball(0, 0, 0, 0.12, c.fur, 7, 5)
  // The muzzle, and the nose on its tip.
  k.hull.box(-0.055, -0.07, 0.05, 0.055, 0.0, 0.2, c.belly)
  k.detail.ball(0, -0.012, 0.205, 0.03, INK, 5, 3)
  // Floppy ears down the sides.
  for (const s of [-1, 1]) {
    const ear: Array<[number, number]> = [[s * 0.1, 0.07], [s * 0.15, 0.02], [s * 0.13, -0.1], [s * 0.09, -0.06]]
    // Counter-clockwise, as a prism wants it: the right ear runs the other way.
    if (s > 0) ear.reverse()
    k.detail.prism(ear, -0.04, 0.04, c.ear)
  }
  k.detail.box(-0.06, 0.02, 0.09, -0.03, 0.05, 0.113, c.eye, 'b')
  k.detail.box(0.03, 0.02, 0.09, 0.06, 0.05, 0.113, c.eye, 'b')
  // A pink tongue for a happy dog.
  k.detail.box(-0.022, -0.1, 0.13, 0.022, -0.068, 0.17, '#e86a7a', 'b')
  return k
}

/**
 * An animal's kits, in a pose. A cat and a dog stand on four legs or sit on
 * their haunches; a squirrel crouches (it sits up by tipping the whole body);
 * a chicken just stands.
 */
export const animalKits = (kind: AnimalKind, coat: Coat, pose: AnimalPose = 'stand'): AnimalKits => {
  const body = newKit()
  const h = body.hull
  const d = body.detail
  if (kind === 'chicken') {
    const c = coat
    h.ball(0, 0.2, 0, 0.16, c.fur, 7, 5, 0.9)
    h.ball(0, 0.36, 0.12, 0.09, '#fffaf2', 6, 4)
    d.ball(0, 0.26, -0.15, 0.08, c.belly, 5, 3, 1.3)
    d.box(-0.02, 0.43, 0.08, 0.02, 0.48, 0.16, c.ear, 'b')
    d.box(-0.02, 0.34, 0.2, 0.02, 0.37, 0.26, '#ffb02a', 'b')
    d.box(-0.07, 0.37, 0.16, -0.05, 0.39, 0.18, c.eye, 'b')
    d.box(0.05, 0.37, 0.16, 0.07, 0.39, 0.18, c.eye, 'b')
    for (const s of [-1, 1]) d.box(s * 0.05 - 0.012, 0, -0.012, s * 0.05 + 0.012, 0.09, 0.012, '#ffb02a', 'b')
    return { body, head: null, headAt: [0, 0, 0], tail: null, tailAt: [0, 0, 0], legs: [] }
  }
  if (kind === 'cat') {
    let headAt: [number, number, number]
    let tail: Kit | null = null
    if (pose === 'sit') {
      h.ball(0, 0.14, -0.04, 0.15, coat.fur, 7, 5, 0.9)
      h.ball(0, 0.25, 0.05, 0.1, coat.belly, 6, 4)
      for (const s of [-1, 1]) h.cyl(s * 0.05, 0, 0.1, 0.028, 0.026, 0.2, 5, coat.fur)
      // The tail curled round the paws.
      d.beam(-0.02, 0.03, -0.18, 0.15, 0.03, -0.06, 0.05, coat.fur, 0.05)
      d.beam(0.15, 0.03, -0.06, 0.12, 0.03, 0.1, 0.05, coat.fur, 0.05)
      headAt = [0, 0.37, 0.07]
    } else {
      for (const z of [-0.1, 0, 0.1]) h.ball(0, 0.2, z, 0.1, coat.fur, 7, 5, 0.9)
      tail = newKit()
      tail.hull.beam(0, 0, 0, 0, 0.2, -0.12, 0.045, coat.fur, 0.045)
      headAt = [0, 0.31, 0.17]
    }
    const legs = pose === 'sit' ? [] : fourLegs(0.055, 0.1, 0.18, 0.027, coat.fur, coat.belly)
    return { body, head: catHead(coat), headAt, tail, tailAt: pose === 'sit' ? [0, 0, 0] : [0, 0.24, -0.19], legs }
  }
  if (kind === 'dog') {
    let headAt: [number, number, number]
    let tailAt: [number, number, number]
    if (pose === 'sit') {
      h.ball(0, 0.17, -0.08, 0.17, coat.fur, 7, 5, 0.9)
      h.ball(0, 0.36, 0.06, 0.13, coat.fur, 7, 5)
      d.ball(0, 0.36, 0.12, 0.09, coat.belly, 6, 4)
      for (const s of [-1, 1]) h.cyl(s * 0.07, 0, 0.13, 0.042, 0.038, 0.34, 6, coat.fur)
      for (const s of [-1, 1]) d.ball(s * 0.13, 0.06, 0.02, 0.06, coat.fur, 5, 3)
      headAt = [0, 0.58, 0.12]
      tailAt = [0, 0.06, -0.22]
    } else {
      for (const z of [-0.13, 0, 0.13]) h.ball(0, 0.38, z, 0.15, coat.fur, 7, 5, 0.85)
      d.ball(0, 0.33, 0.17, 0.1, coat.belly, 6, 4)
      headAt = [0, 0.53, 0.27]
      tailAt = [0, 0.44, -0.26]
    }
    const tail = newKit()
    tail.hull.beam(0, 0, 0, 0, pose === 'sit' ? 0.04 : 0.18, -0.2, 0.05, coat.fur, 0.05)
    const legs = pose === 'sit' ? [] : fourLegs(0.085, 0.15, 0.32, 0.043, coat.fur, coat.belly)
    return { body, head: dogHead(coat), headAt, tail, tailAt, legs }
  }
  // A squirrel, crouched.
  h.ball(0, 0.08, 0.01, 0.065, coat.fur, 6, 4, 1.1)
  h.ball(0, 0.07, -0.05, 0.075, coat.fur, 6, 4)
  h.ball(0, 0.14, 0.075, 0.052, coat.fur, 6, 4)
  d.ball(0, 0.07, 0.05, 0.04, coat.belly, 5, 3)
  for (const s of [-1, 1]) d.prism([[s * 0.03 - 0.015, 0.175], [s * 0.03 + 0.015, 0.175], [s * 0.033, 0.215]], 0.06, 0.08, coat.ear)
  d.box(-0.035, 0.145, 0.11, -0.015, 0.165, 0.122, coat.eye, 'b')
  d.box(0.015, 0.145, 0.11, 0.035, 0.165, 0.122, coat.eye, 'b')
  const tail = newKit()
  tail.hull.ball(0, 0.04, -0.03, 0.045, coat.fur, 6, 4)
  tail.hull.ball(0, 0.12, -0.07, 0.062, coat.fur, 6, 4, 1.2)
  tail.hull.ball(0, 0.22, -0.04, 0.056, coat.ear, 6, 4)
  // Four short legs under the crouch: it bounds, fore pair then hind pair.
  const legs = fourLegs(0.032, 0.035, 0.05, 0.016, coat.fur, coat.fur)
  legs[2]!.at[2] = -0.065
  legs[3]!.at[2] = -0.065
  return { body, head: null, headAt: [0, 0, 0], tail, tailAt: [0, 0.06, -0.09], legs }
}

// ─── Gaits (#102) ────────────────────────────────────────────────────────────
//
// A paw on the ground does not slide: during its stance the foot moves back
// under the hip in a straight line, exactly as fast as the body moves forward
// (stride × duty ÷ stance time = speed), so its place on the ground stays put.
// In the swing it comes forward, lifted. The leg is a rigid post turned and
// stretched so its paw lands exactly there (a cartoon knee). Phases per leg
// (FL, FR, HL, HR) make the gait: a lateral walk, a diagonal trot, the
// squirrel's bound.

export interface Gait {
  /** Share of a cycle a paw is on the ground. */
  duty: number
  /** Each leg's phase offset in the cycle: FL, FR, HL, HR. */
  offsets: readonly [number, number, number, number]
  /** Cycles a second at a comfortable stride, for a leg as long as a dog's. */
  hz: number
}

export const WALK: Gait = { duty: 0.62, offsets: [0.25, 0.75, 0, 0.5], hz: 1.7 }
export const TROT: Gait = { duty: 0.5, offsets: [0, 0.5, 0.5, 0], hz: 2.6 }
export const BOUND: Gait = { duty: 0.4, offsets: [0, 0.08, 0.5, 0.58], hz: 4.5 }

/** The longest stride a leg of `len` takes in a gait: the paw's travel under
 *  the hip (stride × duty) never more than 0.9 legs, so a planted leg leans
 *  at most about 24° (#123: wider, the posts splayed like a sawhorse). */
export const maxStride = (g: Gait, len: number): number => (0.9 * len) / g.duty

/** The stride (model units a cycle) for a speed (model units a second). */
export const strideFor = (g: Gait, len: number, speed: number): number =>
  Math.min(maxStride(g, len), speed / (g.hz * Math.sqrt(0.32 / len)))

/** Where a paw is, relative to its hip, at `phase` (0..1) of its cycle:
 *  forward along the body, and how high it is lifted. */
export const pawAt = (g: Gait, phase: number, stride: number, len: number): { z: number; lift: number } => {
  const u = phase - Math.floor(phase)
  const a = (stride * g.duty) / 2
  if (u < g.duty) return { z: a - (2 * a * u) / g.duty, lift: 0 }
  const t = (u - g.duty) / (1 - g.duty)
  const k = t * t * (3 - 2 * t)
  return { z: -a + 2 * a * k, lift: Math.sin(Math.PI * t) * len * 0.28 }
}

/** How far the hips sink below a leg's length: the body vaults over its
 *  planted legs (#123). A planted leg is never stretched past its length, so
 *  the hips ride as high as the most leaning planted leg reaches: highest
 *  with a paw under them, lowest when the paws are planted far fore and aft. */
export const vaultDrop = (g: Gait, cycle: number, stride: number, len: number): number => {
  let hip = len
  for (const o of g.offsets) {
    const p = pawAt(g, cycle + o, stride, len)
    if (p.lift === 0) hip = Math.min(hip, Math.sqrt(Math.max(0, len * len - p.z * p.z)))
  }
  return len - hip
}

/** The leg's turn about its hip and its stretch, so its paw is at (z, -len + lift). */
export const legPose = (z: number, lift: number, len: number): { pitch: number; stretch: number } => {
  const down = len - lift
  return { pitch: Math.atan2(-z, down), stretch: Math.hypot(z, down) / len }
}

// ─── Behaviour ───────────────────────────────────────────────────────────────

type Mode = 'idle' | 'walk' | 'greet' | 'sit' | 'climb' | 'up' | 'down'

export interface Beast {
  kind: AnimalKind
  /** A cat that keeps to its doorstep. */
  sitter: boolean
  obj: Group
  stand: Group
  sit: Group | null
  head: Group | null
  tail: Group | null
  headAt: { stand: [number, number, number]; sit: [number, number, number] }
  x: number
  z: number
  y: number
  tx: number
  tz: number
  hx: number
  hz: number
  yaw: number
  mode: Mode
  /** Seconds left in the mode, or a clock. */
  t: number
  clock: number
  /** A dog's wait before it greets the hero again. */
  cool: number
  hop: number
  /** A squirrel's tree. */
  tree: [number, number] | null
  seed: number
  /** Drawn larger than life, so the fixed camera reads it (`SIZE`). */
  size: number
  /** The standing legs (FL, FR, HL, HR) and how long they are. */
  legs: Array<{ obj: Group; len: number }>
  /** Where in the gait cycle it is, and how fast it went this frame. */
  cycle: number
  speed: number
}

/** A pet is drawn bigger than life, as the cartoon camera needs: a real cat
 *  or squirrel beside a hero is a few pixels on a phone. */
const SIZE: Readonly<Record<AnimalKind, number>> = { chicken: 1, cat: 1.3, dog: 1.15, squirrel: 1.7 }

/** How far a planted paw stands above the ground, in metres: on top of the
 *  street's stones (laid 2.5 cm up), with the dip of the paw ball below its
 *  leg's end when the leg is turned. */
const PAW_CLEAR = 0.04

const WALKABLE = new Set([TC_GRASS, TC_STREET, TC_SQUARE, TC_YARD, TC_GROUND])

export class TownAnimals {
  readonly root = new Group()
  readonly beasts: Beast[] = []

  constructor(private readonly town: TownPlan, private readonly w: number, private readonly h: number, private readonly grid: Grid, private readonly owned: BufferGeometry[]) {
    this.root.name = 'animals'
  }

  /** Build the town's animals: fewer on a weak device. */
  populate(low: boolean, seed: number): void {
    const t = this.town
    let s = seed >>> 0
    const rnd = (): number => {
      s = (s + 0x6d2b79f5) >>> 0
      let x = Math.imul(s ^ (s >>> 15), 1 | s)
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296
    }
    const big = this.w >= 60
    const mountain = t.style === 'mountain'
    // Chickens about the gardens and the hay.
    const homes: Array<[number, number]> = []
    for (const p of t.props) if (p.kind === 'garden' || p.kind === 'hay' || p.kind === 'cart') homes.push([p.x, p.z + 1.2])
    const hens = mountain ? 0 : low ? 2 : 4
    for (let i = 0; i < hens && homes.length; i++) {
      const [x, z] = homes[(i * 3) % homes.length]!
      if (!this.open(x, z)) continue
      this.add('chicken', CHICKEN_COAT, x, z, i * 0.7)
    }
    // Cats on doorsteps (and one that strolls the lanes).
    const doors = t.houses.filter(h => !h.inside && (h.kind === 'cottage' || h.kind === 'townhouse'))
    const sitters = Math.min(doors.length, low ? 1 : big ? 3 : 2)
    for (let i = 0; i < sitters; i++) {
      const h = doors[Math.floor(((i + 0.5) / sitters) * doors.length)]!
      const x = (h.doorI + 0.5) * CELL + 0.75
      const z = (h.j0 + h.cd) * CELL + 0.15
      const b = this.add('cat', mountain && i === 0 ? CAT_COATS[1]! : CAT_COATS[Math.floor(rnd() * CAT_COATS.length)]!, x, z, rnd() * 10)
      b.sitter = true
      b.mode = 'sit'
      b.yaw = 0.5 - rnd()
    }
    const sq = t.square
    const mid: [number, number] = [((sq.i0 + sq.i1 + 1) / 2) * CELL, ((sq.j0 + sq.j1 + 1) / 2) * CELL]
    if (!low) {
      const p = this.spotNear(mid[0] + 6, mid[1] + 2, rnd)
      if (p) this.add('cat', CAT_COATS[Math.floor(rnd() * CAT_COATS.length)]!, p[0], p[1], rnd() * 10)
    }
    // A dog or two about the square and the streets.
    const dogs = big && !low ? 2 : 1
    for (let i = 0; i < dogs; i++) {
      const p = this.spotNear(mid[0] + (i ? -10 : 3), mid[1] + (i ? 1 : 3), rnd)
      if (p) this.add('dog', DOG_COATS[(Math.floor(rnd() * DOG_COATS.length) + i) % DOG_COATS.length]!, p[0], p[1], rnd() * 10)
    }
    // Squirrels, one to a tree, spread along the town.
    const trees = t.props.filter(p => p.kind === 'tree').sort((a, b) => a.x - b.x)
    const nsq = Math.min(trees.length, low ? 2 : big ? 4 : 3)
    for (let i = 0; i < nsq; i++) {
      const tr = trees[Math.floor(((i + 0.5) / nsq) * trees.length)]!
      const p = this.spotNear(tr.x, tr.z + 0.9, rnd, 2)
      if (!p) continue
      const b = this.add('squirrel', SQUIRREL_COAT, p[0], p[1], rnd() * 10)
      b.tree = [tr.x, tr.z]
    }
  }

  /** A walkable town cell at a point. */
  private open(x: number, z: number): boolean {
    const i = Math.floor(x / CELL)
    const j = Math.floor(z / CELL)
    if (i < 1 || j < 1 || i >= this.w - 1 || j >= this.h - 1) return false
    return WALKABLE.has(this.town.cell[j * this.w + i]!)
  }

  /** Can it walk straight from a to b, over the town's open ground? */
  private canWalk(ax: number, az: number, bx: number, bz: number): boolean {
    if (!this.open(bx, bz) || !hasWalkLine(this.grid, ax, az, bx, bz)) return false
    const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.6)
    for (let k = 1; k < n; k++) if (!this.open(ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n)) return false
    return true
  }

  /** An open point near (x, z), searching outward. */
  private spotNear(x: number, z: number, rnd: () => number, reach = 6): [number, number] | null {
    for (let k = 0; k < 40; k++) {
      const r = (k / 40) * reach
      const a = rnd() * Math.PI * 2
      const px = x + Math.cos(a) * r
      const pz = z + Math.sin(a) * r
      if (this.open(px, pz)) return [px, pz]
    }
    return null
  }

  private mesh(k: Kit): Group {
    const g = new Group()
    const lit = new Mesher().append(k.hull).append(k.detail)
    if (!lit.empty) { const geo = lit.build(); this.owned.push(geo); g.add(new Mesh(geo, celVC())) }
    if (!k.hull.empty) {
      const line = k.hull.welded()
      this.owned.push(line)
      const o = new Mesh(line, outlineMat())
      o.renderOrder = -1
      g.add(o)
    }
    return g
  }

  private add(kind: AnimalKind, coat: Coat, x: number, z: number, clock: number): Beast {
    const st = animalKits(kind, coat, 'stand')
    const obj = new Group()
    const stand = this.mesh(st.body)
    obj.add(stand)
    let sit: Group | null = null
    let sitHead: [number, number, number] = st.headAt
    if (kind === 'cat' || kind === 'dog') {
      const sk = animalKits(kind, coat, 'sit')
      sit = this.mesh(sk.body)
      sit.visible = false
      obj.add(sit)
      sitHead = sk.headAt
    }
    const legs = st.legs.map(l => {
      const g = this.mesh(l.kit)
      g.position.set(...l.at)
      stand.add(g)
      return { obj: g, len: l.len }
    })
    const head = st.head ? this.mesh(st.head) : null
    if (head) { head.position.set(...st.headAt); obj.add(head) }
    const tail = st.tail ? this.mesh(st.tail) : null
    if (tail) { tail.position.set(...st.tailAt); obj.add(tail) }
    obj.scale.setScalar(SIZE[kind])
    this.root.add(obj)
    const b: Beast = {
      kind, sitter: false, obj, stand, sit, head, tail, headAt: { stand: st.headAt, sit: sitHead },
      x, z, y: 0, tx: x, tz: z, hx: x, hz: z, yaw: clock, mode: 'idle', t: 1 + (clock % 2), clock, cool: 0, hop: 0, tree: null, seed: clock, size: SIZE[kind],
      legs, cycle: 0, speed: 0
    }
    this.place(b)
    this.beasts.push(b)
    return b
  }

  /** Sit or stand: the cat's and the dog's two bodies, the head where that body carries it. */
  private pose(b: Beast, sitting: boolean): void {
    if (!b.sit) return
    b.sit.visible = sitting
    b.stand.visible = !sitting
    if (b.head) b.head.position.set(...(sitting ? b.headAt.sit : b.headAt.stand))
    // The cat's tail is part of its sitting body; the dog's sweeps the ground.
    if (b.tail) {
      if (b.kind === 'cat') b.tail.visible = !sitting
      else b.tail.position.set(0, sitting ? 0.06 : 0.44, sitting ? -0.22 : -0.26)
    }
  }

  private place(b: Beast): void {
    // A sitting body rests where a planted paw does: on top of the street's stones (#123).
    const lift = b.sit?.visible ? PAW_CLEAR : 0
    b.obj.position.set(b.x, groundAt(b.x, b.z) + b.y + lift, b.z)
  }

  /** Every frame: (px, pz) is the hero. */
  update(dt: number, px: number, pz: number): void {
    const step = Math.min(dt, 1 / 20)
    for (const b of this.beasts) {
      b.clock += step
      b.speed = 0
      if (b.kind === 'chicken') this.hen(b, step)
      else if (b.kind === 'cat') this.cat(b, step, px, pz)
      else if (b.kind === 'dog') this.dog(b, step, px, pz)
      else this.squirrel(b, step, px, pz)
      if (b.legs.length) this.stride(b, step)
    }
  }

  /** The legs this frame: the gait for its speed, the paws where the cycle
   *  puts them; standing still, they settle back under the body. */
  private stride(b: Beast, dt: number): void {
    const len = b.legs[0]!.len
    const v = b.speed / b.size
    // Each paw stands on the ground under ITSELF, not under the body: on a
    // street that climbs, the leading paws reach up to it instead of sinking
    // through the cobbles (and a hair above, for the paw's own roundness).
    const base = groundAt(b.x, b.z) + b.y
    const s = Math.sin(b.yaw)
    const c = Math.cos(b.yaw)
    const rise = (ax: number, az: number): number => {
      const px = b.x + (ax * c + az * s) * b.size
      const pz = b.z + (-ax * s + az * c) * b.size
      const d = (groundAt(px, pz) - base + PAW_CLEAR) / b.size
      return Math.max(-0.3 * len, Math.min(0.3 * len, d))
    }
    if (v < 0.05) {
      const k = Math.min(1, dt * 10)
      for (const l of b.legs) {
        const q = legPose(0, rise(l.obj.position.x, l.obj.position.z), len)
        l.obj.rotation.x += (q.pitch - l.obj.rotation.x) * k
        l.obj.scale.y += (q.stretch - l.obj.scale.y) * k
      }
      return
    }
    const g = b.kind === 'squirrel' ? BOUND : v > 1.4 ? TROT : WALK
    const stride = strideFor(g, len, v)
    b.cycle += (v * dt) / stride
    // The body rides down and up over its planted legs, two dips a cycle; the
    // legs reach down from the lowered hips, so every planted paw stays put.
    const drop = vaultDrop(g, b.cycle, stride, len)
    b.obj.position.y -= drop * b.size
    b.legs.forEach((l, i) => {
      const p = pawAt(g, b.cycle + g.offsets[i]!, stride, len)
      const q = legPose(p.z, p.lift + drop + rise(l.obj.position.x, l.obj.position.z + p.z), len)
      l.obj.rotation.x = q.pitch
      l.obj.scale.y = q.stretch
    })
  }

  /** Walk toward (tx, tz) at `speed`; true when there. */
  private walk(b: Beast, dt: number, speed: number): boolean {
    const dx = b.tx - b.x
    const dz = b.tz - b.z
    const d = Math.hypot(dx, dz)
    if (d < 0.05) return true
    const s = Math.min(d, dt * speed)
    b.x += (dx / d) * s
    b.z += (dz / d) * s
    b.speed = s / dt
    // Turn toward the way it goes, not in a snap.
    let dy = Math.atan2(dx, dz) - b.yaw
    dy = Math.atan2(Math.sin(dy), Math.cos(dy))
    b.yaw += dy * Math.min(1, dt * 10)
    b.hop += dt * speed * 9
    return false
  }

  /** Somewhere to go within `r` of home it can walk to in a line. */
  private wander(b: Beast, r: number, min = 0): boolean {
    for (let k = 0; k < 8; k++) {
      const a = Math.random() * Math.PI * 2
      const d = min + Math.random() * (r - min)
      const nx = b.hx + Math.cos(a) * d
      const nz = b.hz + Math.sin(a) * d
      if (Math.hypot(nx - b.x, nz - b.z) < 0.5) continue
      if (this.canWalk(b.x, b.z, nx, nz)) { b.tx = nx; b.tz = nz; return true }
    }
    return false
  }

  /** The head turned toward a point (relative to the body), within reach. */
  private look(b: Beast, x: number, z: number, k: number, dt: number): void {
    if (!b.head) return
    let a = Math.atan2(x - b.x, z - b.z) - b.yaw
    a = Math.atan2(Math.sin(a), Math.cos(a))
    const want = Math.max(-1.2, Math.min(1.2, a)) * k
    b.head.rotation.y += (want - b.head.rotation.y) * Math.min(1, dt * 6)
  }

  private hen(b: Beast, dt: number): void {
    b.t -= dt
    let peck = 0
    if (b.mode === 'walk') {
      if (this.walk(b, dt, 0.9)) { b.mode = 'idle'; b.t = 1 + Math.random() * 2.5 }
    } else {
      peck = Math.max(0, Math.sin(b.t * 9)) * 0.5
      if (b.t <= 0) { if (this.wander(b, 2.2)) b.mode = 'walk'; else b.t = 1 }
    }
    b.y = Math.abs(Math.sin(b.hop)) * 0.05 * (b.mode === 'walk' ? 1 : 0)
    this.place(b)
    b.obj.rotation.set(peck, b.yaw, 0, 'YXZ')
  }

  private cat(b: Beast, dt: number, px: number, pz: number): void {
    const near = Math.hypot(px - b.x, pz - b.z)
    b.t -= dt
    if (b.sitter) {
      // On its step: looks about, watches the hero go by, washes now and then.
      this.pose(b, true)
      if (near < 5) this.look(b, px, pz, 1, dt)
      else if (b.head) b.head.rotation.y = Math.sin(b.clock * 0.4) * 0.9
      if (b.head) b.head.rotation.x = near < 5 ? -0.15 : Math.max(0, Math.sin(b.clock * 0.23)) * 0.4
      b.obj.scale.set(b.size, b.size * (1 + Math.sin(b.clock * 2.2) * 0.02), b.size)
      this.place(b)
      b.obj.rotation.y = b.yaw
      return
    }
    // A cat out for a stroll: walks a little, sits a while; keeps out of reach.
    if (near < 2.2 && b.mode !== 'walk') {
      const ax = b.x - px
      const az = b.z - pz
      const l = Math.hypot(ax, az) || 1
      const nx = b.x + (ax / l) * 3
      const nz = b.z + (az / l) * 3
      if (this.canWalk(b.x, b.z, nx, nz)) { b.tx = nx; b.tz = nz; b.mode = 'walk'; b.t = 3 }
    }
    if (b.mode === 'walk') {
      this.pose(b, false)
      if (this.walk(b, dt, near < 3 ? 1.8 : 0.75) || b.t < -6) { b.mode = 'sit'; b.t = 4 + Math.random() * 7 }
      if (b.tail) b.tail.rotation.z = Math.sin(b.clock * 3) * 0.25
      if (b.head) b.head.rotation.y *= 0.9
    } else {
      this.pose(b, b.mode === 'sit')
      if (near < 5) this.look(b, px, pz, 1, dt)
      else if (b.head) b.head.rotation.y = Math.sin(b.clock * 0.5) * 0.7
      if (b.t <= 0) {
        if (this.wander(b, 8, 2)) { b.mode = 'walk'; b.t = 0 } else b.t = 2
      }
    }
    b.y = 0
    this.place(b)
    b.obj.rotation.y = b.yaw
  }

  private dog(b: Beast, dt: number, px: number, pz: number): void {
    const near = Math.hypot(px - b.x, pz - b.z)
    const fromHome = Math.hypot(px - b.hx, pz - b.hz)
    b.t -= dt
    b.cool -= dt
    let wag = 0.35
    // The hero is about: trot over, sit at his feet and wag.
    if (b.mode !== 'greet' && b.cool <= 0 && near < 7 && fromHome < 16) { b.mode = 'greet'; b.t = 7 }
    if (b.mode === 'greet') {
      const ax = b.x - px
      const az = b.z - pz
      const l = Math.hypot(ax, az) || 1
      const gx = px + (ax / l) * 1.1
      const gz = pz + (az / l) * 1.1
      if (Math.hypot(gx - b.tx, gz - b.tz) > 0.4) {
        if (this.canWalk(b.x, b.z, gx, gz)) { b.tx = gx; b.tz = gz } else { b.tx = b.x; b.tz = b.z }
      }
      const there = near < 1.6 || this.walk(b, dt, 2.8)
      this.pose(b, there)
      if (there) {
        // Face him, look up at him, tail going.
        let dy = Math.atan2(px - b.x, pz - b.z) - b.yaw
        dy = Math.atan2(Math.sin(dy), Math.cos(dy))
        b.yaw += dy * Math.min(1, dt * 6)
        if (b.head) { b.head.rotation.x = -0.25; b.head.rotation.z = Math.sin(b.clock * 1.3) * 0.18 }
        wag = 1
      } else if (b.head) { b.head.rotation.x = 0; b.head.rotation.z = 0 }
      if (b.t <= 0 || near > 9) {
        b.mode = 'idle'
        b.t = 1
        b.cool = 22 + Math.random() * 10
        if (b.head) { b.head.rotation.x = 0; b.head.rotation.z = 0 }
      }
    } else if (b.mode === 'walk') {
      this.pose(b, false)
      if (this.walk(b, dt, 1.3) || b.t < -8) { b.mode = Math.random() < 0.4 ? 'sit' : 'idle'; b.t = 2 + Math.random() * 4 }
      if (b.head) b.head.rotation.x = 0
    } else {
      // Sniffing about, or sitting a while.
      this.pose(b, b.mode === 'sit')
      if (b.head) b.head.rotation.x = b.mode === 'sit' ? 0 : 0.35 + Math.sin(b.clock * 6) * 0.08
      if (b.t <= 0) {
        if (this.wander(b, 12, 3)) { b.mode = 'walk'; b.t = 0 } else b.t = 1.5
      }
    }
    if (b.tail) b.tail.rotation.y = Math.sin(b.clock * (wag > 0.5 ? 16 : 5)) * 0.5 * wag
    // No hop of its own: walking, its gait carries the body (`vaultDrop`).
    b.y = 0
    this.place(b)
    b.obj.rotation.y = b.yaw
  }

  private squirrel(b: Beast, dt: number, px: number, pz: number): void {
    const tree = b.tree!
    const near = Math.hypot(px - b.x, pz - b.z)
    b.t -= dt
    // On the trunk: the side the camera sees, back out, belly to the bark.
    const tx = tree[0]
    const tz = tree[1] + 0.2
    let pitch = 0
    let upright = false
    if ((b.mode === 'idle' || b.mode === 'walk') && near < 4) { b.mode = 'climb'; b.tx = tx; b.tz = tz }
    switch (b.mode) {
      case 'climb':
        // A dash to the foot of its tree, then up.
        if (this.walk(b, dt, 4.2)) { b.mode = 'up'; b.x = tx; b.z = tz }
        break
      case 'up':
        b.y += dt * 1.6
        b.yaw = Math.PI
        pitch = -Math.PI / 2
        if (b.y > 1.05) { b.mode = 'sit'; b.t = 3; b.obj.visible = false }
        break
      case 'sit':
        // Up in the crown, out of sight, until the hero has gone.
        if (near > 6.5 && b.t <= 0) { b.mode = 'down'; b.obj.visible = true } else if (near <= 6.5) b.t = 3
        break
      case 'down':
        b.y -= dt * 1.2
        b.yaw = 0
        pitch = Math.PI / 2
        if (b.y <= 0) { b.y = 0; b.mode = 'idle'; b.t = 1 }
        break
      case 'walk':
        if (this.walk(b, dt, 3.2)) { b.mode = 'idle'; b.t = 0.6 + Math.random() * 1.8 }
        break
      default:
        // Stock still, or sat up with its tail going.
        upright = Math.sin(b.seed + b.clock * 0.7) > 0.2
        if (b.t <= 0) {
          b.hx = tree[0]
          b.hz = tree[1] + 0.4
          if (this.wander(b, 3.5, 1)) b.mode = 'walk'
          b.t = 0.5
        }
    }
    if (b.mode === 'up' || b.mode === 'down' || b.mode === 'sit') {
      b.obj.position.set(b.x, groundAt(tree[0], tree[1]) + b.y, b.z)
    } else {
      b.y = b.mode === 'walk' || b.mode === 'climb' ? Math.abs(Math.sin(b.hop * 0.8)) * 0.06 : 0
      this.place(b)
      b.y = 0
    }
    b.obj.rotation.set(upright ? -0.9 : pitch, b.yaw, 0, 'YXZ')
    if (b.tail) {
      // Upright, the tail stays up; it flicks while the squirrel waits.
      b.tail.rotation.x = (upright ? 0.9 : 0) + (b.mode === 'idle' ? Math.max(0, Math.sin(b.clock * 7)) * 0.35 : 0)
    }
  }

  /** Every animal, for the z-fighting test (at its home). */
  get objects(): Array<{ obj: Object3D; x: number; z: number }> {
    return this.beasts.map(b => ({ obj: b.obj, x: b.x, z: b.z }))
  }
}
