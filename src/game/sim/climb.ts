import { Group, Color, type MeshBasicMaterial, type Object3D } from 'three'
import { CELL, type MapData, type Terrain, type Ladder, type Lift, type Crusher, type RollerLane, type RewardSpot } from '../world/levelGen'
import { floorAt, groundAt, moveBody, platUnder, type Nav, type Plat, type Slab } from '../world/nav'
import { BALL_R } from '../world/climbGen'
import {
  buildLift, buildCrusher, buildScrapBall, buildLaneLamp, type LiftMesh, type CrusherMesh, type BallMesh
} from '../models/climbProps'
import { buildBolt, buildCapsule } from '../models/props'
import type { Theme } from '../world/themes'
import type { CombatPlayer, Enemy, PickupKind } from './world'
import type { Particles } from '../fx/particles'
import type { FloorMarkers, ShockRings } from '../fx/markers'
import { PLAYER_R } from './constants'

/**
 * ─── The climb at run time ───────────────────────────────────────────────────
 *
 * Everything that moves or can hurt on the tower (`world/climbGen.ts`), and
 * the player's body on its floor heights:
 *
 *  - Flux has feet now: gravity, ground snap down stairs and onto a lowering
 *    lift, a step-up of STEP_UP, a tenth of a second of grace over a pit edge
 *    (the shuttle's lip) — and no jump. Ladders are climbed by pushing toward
 *    the wall (away from it goes down), so forward climbs when facing the
 *    ladder and forward descends when coming off the top; the top steps off
 *    by itself. Slide lets go.
 *  - Lifts: a shuttle loops over a pit on the mission clock; a vertical lift
 *    waits at the bottom and rides up once stood on, then comes home.
 *  - Crushers warn (a lamp, a click, a red ring on the walkway), slam, hold,
 *    rise. Under the head at the slam: a fifth of the health.
 *  - Scrap balls drop from hatches over the rolling stairs and roll down
 *    their lanes into the gutter, each lane's lamp going amber then red first.
 *  - Pits: a fall well below the last floor costs PIT_COST of the health and
 *    puts Flux back on the last checkpoint after a fade (MegaMan's pits,
 *    softened).
 *
 * Nothing allocates per step: pools and fixed arrays built with the mission.
 */

/** Share of max health a pit fall costs. */
export const PIT_COST = 0.15
const GRAVITY = 26
const MAX_FALL = 22
/** Walking down: a floor this far under the feet is followed, not fallen to. */
const SNAP = 0.6
/** Grace over a pit edge before the fall starts (s). */
const COYOTE = 0.1
const CLIMB_SPEED = 3.3
/** Fallen this far under the last floor over a pit: it is a pit fall. */
const PIT_DROP = 4.5
/** Crusher cycle (s from the warning): warn, slam, hold, rise; idle after. */
const CR_WARN = 0.75
const CR_SLAM = 0.12
const CR_HOLD = 0.45
const CR_RISE = 0.9
/** The crusher head's rest height over the walkway, its size, its beam. */
const CR_REST = 3.8
const CR_SIZE = 2.5
const CR_BEAM = 5.4
const CR_COST = 0.2
/** Scrap balls: the lamp's warning, the drop out of the hatch, the roll. */
const BALL_WARN = 0.9
const BALL_HATCH = 2.5
const BALL_V0 = 3
const BALL_ACC = 6
const BALL_VMAX = 9
const BALL_COST = 0.16
/** Flux's height for things that hit his body (m). */
const BODY_H = 1.75

/** The player's body as the climb moves it (the mission's `PlayerState`). */
export interface ClimbBody {
  x: number
  z: number
  y: number
  vx: number
  vz: number
  vy: number
  yaw: number
  ground: boolean
  /** The ladder climbed (index), or −1. */
  ladder: number
  /** The platform stood on (index into `nav.plats`), or −1. */
  plat: number
  /** Time off the ground while grounded over a pit edge (the grace). */
  air: number
  /** Height of the last solid floor stood on. */
  safeY: number
  /** Stepping off the top of a ladder: time left, and where to. */
  mantle: number
  mx: number
  mz: number
  path: Array<[number, number]> | null
}

export interface ClimbHost {
  nav: Nav
  map: MapData
  theme: Theme
  combat: CombatPlayer
  fx: Particles
  markers: FloorMarkers
  shocks: ShockRings
  hitPlayer(e: Enemy | null, dmg: number, o: { blockable: boolean; fromX: number; fromZ: number; kind: 'melee' | 'aoe' | 'shot' }): 'hit' | 'block' | 'parry' | 'miss'
  sfx(name: string, x?: number, z?: number): void
  shake(amount: number): void
  onPickup(kind: PickupKind, value: number): void
  propParent(x: number, z: number): Object3D
}

interface LadderRt {
  def: Ladder
  /** The face's middle, the normal toward the foot, the unit along it. */
  ex: number
  ez: number
  nx: number
  nz: number
  ax: number
  az: number
  standX: number
  standZ: number
  topX: number
  topZ: number
}

interface LiftRt {
  def: Lift
  plat: Plat
  mesh: LiftMesh
  x: number
  y: number
  z: number
  /** v lift: 0 home, 1 rising, 2 up, 3 returning. */
  state: number
  t: number
  /** Time stood on (at home) / left alone (up). */
  ride: number
  moving: boolean
  bottom: number
  /** Its index here and its platform's in `nav.plats`. */
  idx: number
  platIdx: number
}

interface CrusherRt {
  def: Crusher
  x: number
  z: number
  slab: Slab
  mesh: CrusherMesh
  /** Head underside over the walkway (m). */
  head: number
  /** Which cycle the warning / the hit / the impact last fired in. */
  warned: number
  hitCyc: number
  landed: number
}

interface LaneRt {
  def: RollerLane
  mat: MeshBasicMaterial
  /** Release count fired so far (keyed on the mission clock). */
  fired: number
  topY: number
}

interface BallRt {
  active: boolean
  lane: LaneRt | null
  /** Metres rolled; −1 while still dropping out of the hatch. */
  s: number
  v: number
  x: number
  y: number
  z: number
  vy: number
  sink: number
  hit: boolean
  mesh: BallMesh
}

interface RewardRt {
  def: RewardSpot
  root: Group
  taken: boolean
}

export interface ClimbSave {
  /** Last checkpoint reached (−1: the pad). */
  cp: number
  /** Reward ledges already emptied. */
  got: number[]
}

/** Lamp colours, made once: the telegraphs change colour every frame. */
const LAMP = {
  rest: new Color('#8dff7a'),
  move: new Color('#ffd23a'),
  moveDim: new Color('#7a5a10'),
  warn: new Color('#ff2d3f'),
  warnDim: new Color('#5a0a10'),
  hot: new Color('#ff7a2a'),
  idle: new Color('#ffb02a'),
  laneOff: new Color('#3a2a18'),
  laneRed: new Color('#ff2d3f'),
  laneRedDim: new Color('#6a0a12'),
  laneAmber: new Color('#ffb02a')
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const ease = (k: number) => k * k * (3 - 2 * k)

export class ClimbRun {
  readonly t: Terrain
  private host: ClimbHost
  private ladders: LadderRt[] = []
  private lifts: LiftRt[] = []
  private crushers: CrusherRt[] = []
  private lanes: LaneRt[] = []
  private balls: BallRt[] = []
  private rewards: RewardRt[] = []
  /** Last checkpoint reached (−1: the pad). */
  cp = -1
  /** This step's pit fall happened (the mission restarts Flux), and how dark
   *  the fall has made the view so far (0..1). */
  pitted = false
  pitDark = 0
  /** Speed of the last landing (m/s), for the thud. */
  landSpeed = 0
  private level: number

  constructor(host: ClimbHost, level: number) {
    this.host = host
    this.level = level
    const t = host.map.terrain!
    this.t = t
    const th = host.theme
    const nav = host.nav
    for (const L of t.ladders) {
      const ex = L.di ? (L.di > 0 ? (L.i + 1) * CELL : L.i * CELL) : (L.i + 0.5) * CELL
      const ez = L.dj ? (L.dj > 0 ? (L.j + 1) * CELL : L.j * CELL) : (L.j + 0.5) * CELL
      const nx = -L.di
      const nz = -L.dj
      this.ladders.push({
        def: L, ex, ez, nx, nz, ax: Math.abs(L.dj), az: Math.abs(L.di),
        standX: ex + nx * (PLAYER_R + 0.06), standZ: ez + nz * (PLAYER_R + 0.06),
        topX: ex - nx * (PLAYER_R + 0.35), topZ: ez - nz * (PLAYER_R + 0.35)
      })
    }
    for (const lf of t.lifts) {
      const mesh = buildLift(th, lf.hw, lf.hd, lf.kind === 'v')
      const plat: Plat = { x0: 0, z0: 0, x1: 0, z1: 0, top: lf.ay, dx: 0, dz: 0 }
      nav.plats!.push(plat)
      const bottom = t.pitBottom[lf.room] ?? lf.ay - 12
      const rt: LiftRt = {
        def: lf, plat, mesh, x: lf.ax, y: lf.ay, z: lf.az, state: 0, t: 0, ride: 0, moving: false, bottom,
        idx: this.lifts.length, platIdx: nav.plats!.length - 1
      }
      host.propParent(lf.ax, lf.az).add(mesh.root)
      this.lifts.push(rt)
      this.placeLift(rt, lf.ax, lf.ay, lf.az, true)
    }
    for (const cr of t.crushers) {
      const x = (cr.i + 0.5) * CELL
      const z = (cr.j + 0.5) * CELL
      // Thinner along the walkway, so a body caught inside is pushed out
      // along the walk, never off its side.
      const walkX = !t.pit[cr.j * host.map.w + cr.i + 1] && host.map.cell[cr.j * host.map.w + cr.i + 1] !== 0
      const ha = CR_SIZE / 2
      const hb = ha - 0.08
      const slab: Slab = walkX
        ? { minX: x - hb, maxX: x + hb, minZ: z - ha, maxZ: z + ha, active: false }
        : { minX: x - ha, maxX: x + ha, minZ: z - hb, maxZ: z + hb, active: false }
      nav.slabs.push(slab)
      const mesh = buildCrusher(th, CR_SIZE, CR_BEAM)
      mesh.root.position.set(x, cr.y, z)
      host.propParent(x, z).add(mesh.root)
      this.crushers.push({ def: cr, x, z, slab, mesh, head: CR_REST, warned: -1, hitCyc: -1, landed: -1 })
    }
    for (const ln of t.lanes) {
      const lamp = buildLaneLamp()
      const topY = groundAt(host.map, ln.x, ln.z)
      lamp.root.position.set(ln.x - ln.dx * 0.1 + ln.dz * 0.75, topY + 2.35, ln.z - ln.dz * 0.1 + ln.dx * 0.75)
      host.propParent(ln.x, ln.z).add(lamp.root)
      const rt: LaneRt = { def: ln, mat: lamp.mat, fired: -1, topY }
      this.lanes.push(rt)
      for (let n = 0; n < 2; n++) {
        const mesh = buildScrapBall(th, BALL_R)
        mesh.root.visible = false
        host.propParent(ln.x, ln.z).add(mesh.root)
        this.balls.push({ active: false, lane: null, s: 0, v: 0, x: 0, y: 0, z: 0, vy: 0, sink: 0, hit: false, mesh })
      }
    }
    for (const r of t.rewards) {
      const root = new Group()
      // A borrowed-weapon ledge is `sim/borrowed.ts`'s to draw, pay and save;
      // it keeps its place in the list so the snapshot's indices hold.
      if (r.kind === 'weapon') {
        this.rewards.push({ def: r, root, taken: false })
        continue
      }
      if (r.kind === 'bolts') {
        for (let n = 0; n < 3; n++) {
          const b = buildBolt()
          const a = (n / 3) * Math.PI * 2
          b.root.position.set(Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35)
          root.add(b.root)
        }
      } else {
        root.add(buildCapsule(r.kind === 'hp' ? 'hp' : 'we', true).root)
      }
      root.position.set(r.x, r.y + 0.75, r.z)
      host.propParent(r.x, r.z).add(root)
      this.rewards.push({ def: r, root, taken: false })
    }
  }

  // ─── Per step ──────────────────────────────────────────────────────────────

  /** Lifts, crushers, balls, rewards, checkpoints. Before the player moves:
   *  the lifts' motion this step is what carries a rider. */
  update(dt: number, time: number, p: ClimbBody, playing: boolean): void {
    for (const lf of this.lifts) this.stepLift(lf, dt, time, p)
    for (const cr of this.crushers) this.stepCrusher(cr, time, p, playing)
    for (const ln of this.lanes) this.stepLane(ln, time)
    for (const b of this.balls) if (b.active) this.stepBall(b, dt, p, playing)
    for (const r of this.rewards) {
      if (r.taken || r.def.kind === 'weapon') continue
      r.root.rotation.y += dt * 1.8
      r.root.position.y = r.def.y + 0.75 + Math.sin(time * 2.4) * 0.1
      if (playing && Math.abs(p.y - r.def.y) < 1 && Math.hypot(p.x - r.def.x, p.z - r.def.z) < 1.1) this.take(r)
    }
    if (p.ground && playing) {
      const k = Math.floor(p.z / CELL) * this.host.map.w + Math.floor(p.x / CELL)
      for (let n = this.cp + 1; n < this.t.checkpoints.length; n++) {
        if (!this.t.checkpoints[n]!.cells.includes(k)) continue
        this.cp = n
        const c = this.t.checkpoints[n]!
        this.host.fx.riseRing(c.x, c.y + 0.1, c.z, '#7ff4ff', 0.7, 14)
        break
      }
    }
  }

  private placeLift(lf: LiftRt, x: number, y: number, z: number, first = false): void {
    const pl = lf.plat
    pl.dx = first ? 0 : x - lf.x
    pl.dz = first ? 0 : z - lf.z
    lf.x = x
    lf.y = y
    lf.z = z
    pl.x0 = x - lf.def.hw
    pl.x1 = x + lf.def.hw
    pl.z0 = z - lf.def.hd
    pl.z1 = z + lf.def.hd
    pl.top = y
    lf.mesh.root.position.set(x, y, z)
    if (lf.mesh.column) lf.mesh.column.scale.y = Math.max(0.1, y - 0.5 - lf.bottom)
  }

  private stepLift(lf: LiftRt, dt: number, time: number, p: ClimbBody): void {
    const d = lf.def
    let k: number
    if (d.kind === 'h') {
      // A loop on the mission clock: wait at A, go, wait at B, come back.
      const leg = d.travel + d.wait
      const u = ((time + d.phase) % (leg * 2) + leg * 2) % (leg * 2)
      if (u < d.wait) k = 0
      else if (u < leg) k = ease((u - d.wait) / d.travel)
      else if (u < leg + d.wait) k = 1
      else k = 1 - ease((u - leg - d.wait) / d.travel)
      lf.moving = (u >= d.wait && u < leg) || u >= leg + d.wait
    } else {
      // Rides up once stood on for a beat; comes home once left alone.
      const on = p.ground && p.plat === lf.platIdx
      if (lf.state === 0) {
        lf.ride = on ? lf.ride + dt : 0
        if (lf.ride > 0.35) { lf.state = 1; lf.t = 0; this.host.sfx('door', lf.x, lf.z) }
      } else if (lf.state === 2) {
        lf.ride = on ? 0 : lf.ride + dt
        if (lf.ride > d.wait) { lf.state = 3; lf.t = 0; this.host.sfx('door', lf.x, lf.z) }
      } else {
        lf.t += dt
        if (lf.t >= d.travel) { lf.state = lf.state === 1 ? 2 : 0; lf.ride = 0 }
      }
      const f = Math.min(1, lf.t / d.travel)
      k = lf.state === 0 ? 0 : lf.state === 2 ? 1 : lf.state === 1 ? ease(f) : 1 - ease(f)
      lf.moving = lf.state === 1 || lf.state === 3
    }
    this.placeLift(lf, d.ax + (d.bx - d.ax) * k, d.ay + (d.by - d.ay) * k, d.az + (d.bz - d.az) * k)
    const blink = lf.moving && Math.floor(time * 6 + lf.idx) % 2 === 0
    lf.mesh.lampMat.color.copy(lf.moving ? (blink ? LAMP.move : LAMP.moveDim) : LAMP.rest)
  }

  private stepCrusher(cr: CrusherRt, time: number, p: ClimbBody, playing: boolean): void {
    const d = cr.def
    const period = Math.max(d.period, CR_WARN + CR_SLAM + CR_HOLD + CR_RISE + 0.1)
    const clock = time + d.phase
    const cyc = Math.floor(clock / period)
    const u = clock - cyc * period
    const tSlam = CR_WARN
    const tHold = tSlam + CR_SLAM
    const tRise = tHold + CR_HOLD
    const tIdle = tRise + CR_RISE
    let head: number
    if (u < tSlam) head = CR_REST + Math.sin(u * 70) * 0.03 * (u / tSlam)
    else if (u < tHold) { const k = (u - tSlam) / CR_SLAM; head = CR_REST * (1 - k * k) }
    else if (u < tRise) head = 0
    else if (u < tIdle) head = CR_REST * ease((u - tRise) / CR_RISE)
    else head = CR_REST
    cr.head = head
    cr.mesh.head.position.y = head
    cr.mesh.rod.position.y = head + 1.3
    cr.mesh.rod.scale.y = Math.max(0.05, CR_BEAM - head - 1.3)
    cr.slab.active = head < BODY_H
    // Telegraph: the lamp blinks red, a click, a ring on the walkway.
    const warning = u < tSlam
    cr.mesh.lampMat.color.copy(warning ? (Math.floor(u * 10) % 2 ? LAMP.warn : LAMP.warnDim) : head < CR_REST - 0.1 ? LAMP.hot : LAMP.idle)
    if (warning && cr.warned !== cyc) {
      cr.warned = cyc
      this.host.sfx('trapClick', cr.x, cr.z)
      this.host.markers.spawn(cr.x, cr.z, 1.35, CR_WARN + CR_SLAM)
    }
    // The slam: whoever is under the head as it comes down.
    if (playing && u >= tSlam && u < tRise && head < p.y - d.y + BODY_H && cr.hitCyc !== cyc && Math.abs(p.y - d.y) < 1.2) {
      const r = PLAYER_R * 0.7
      if (Math.abs(p.x - cr.x) < CR_SIZE / 2 + r && Math.abs(p.z - cr.z) < CR_SIZE / 2 + r) {
        cr.hitCyc = cyc
        this.host.hitPlayer(null, Math.round(this.host.combat.maxHp * CR_COST), { blockable: false, fromX: cr.x, fromZ: cr.z, kind: 'aoe' })
      }
    }
    if (u >= tHold && cr.landed !== cyc) {
      cr.landed = cyc
      this.host.sfx('stomp', cr.x, cr.z)
      const dd = Math.hypot(p.x - cr.x, p.z - cr.z)
      if (dd < 10) this.host.shake(0.28 * (1 - dd / 10))
      this.host.shocks.spawn(cr.x, d.y + 0.05, cr.z, 2.2, '#ffd9a0', 0.35)
      this.host.fx.sparks(cr.x, d.y + 0.2, cr.z, '#ffd9a0', 14, 6, 0.2)
    }
  }

  private stepLane(ln: LaneRt, time: number): void {
    const d = ln.def
    const n = Math.floor((time - d.phase) / d.period)
    const next = (n + 1) * d.period + d.phase
    const toGo = next - time
    // Lamp: dark, amber in the last BALL_WARN, red blinking in its last half.
    if (toGo < BALL_WARN) ln.mat.color.copy(toGo < BALL_WARN / 2 ? (Math.floor(toGo * 12) % 2 ? LAMP.laneRed : LAMP.laneRedDim) : LAMP.laneAmber)
    else ln.mat.color.copy(LAMP.laneOff)
    if (n > ln.fired) {
      const first = ln.fired < 0
      ln.fired = n
      if (!first) this.release(ln)
    }
  }

  private release(ln: LaneRt): void {
    let b: BallRt | null = null
    for (const x of this.balls) if (!x.active) { b = x; break }
    if (!b) return
    const d = ln.def
    b.active = true
    b.lane = ln
    b.s = -1
    b.v = BALL_V0
    b.x = d.x
    b.z = d.z
    b.y = ln.topY + BALL_HATCH
    b.vy = 0
    b.sink = 0
    b.hit = false
    b.mesh.root.visible = true
    b.mesh.root.scale.setScalar(1)
    b.mesh.root.position.set(b.x, b.y, b.z)
    this.host.sfx('lob', d.x, d.z)
  }

  private stepBall(b: BallRt, dt: number, p: ClimbBody, playing: boolean): void {
    const d = b.lane!.def
    const map = this.host.map
    if (b.sink > 0) {
      // Into the gutter: down and gone.
      b.sink += dt
      b.y -= dt * 5
      b.mesh.root.scale.setScalar(Math.max(0.01, 1 - b.sink * 3))
      if (b.sink > 0.35) { b.active = false; b.mesh.root.visible = false }
    } else if (b.s < 0) {
      // Dropping out of the hatch onto the top of the stairs.
      b.vy -= GRAVITY * dt
      b.y += b.vy * dt
      const g = groundAt(map, b.x, b.z) + BALL_R
      if (b.y <= g) {
        b.y = g
        b.s = 0
        this.host.sfx('stomp', b.x, b.z)
      }
    } else {
      b.v = Math.min(BALL_VMAX, b.v + BALL_ACC * dt)
      b.s += b.v * dt
      b.x = d.x + d.dx * b.s
      b.z = d.z + d.dz * b.s
      b.y = groundAt(map, b.x - d.dx * 0.3, b.z - d.dz * 0.3) + BALL_R
      // Roll: spin about the axle across the lane.
      if (d.dx) b.mesh.spin.rotation.z += (b.v * dt / BALL_R) * (d.dx > 0 ? -1 : 1)
      else b.mesh.spin.rotation.x += (b.v * dt / BALL_R) * (d.dz > 0 ? 1 : -1)
      if (b.s >= d.len + 0.5) {
        b.sink = 1e-3
        this.host.fx.sparks(b.x, b.y, b.z, '#ffd9a0', 10, 5, 0.18)
        this.host.sfx('bonk', b.x, b.z)
      }
    }
    b.mesh.root.position.set(b.x, b.y, b.z)
    if (!playing || b.hit || b.sink > 0) return
    const dx = p.x - b.x
    const dz = p.z - b.z
    const reach = BALL_R + PLAYER_R * 0.75
    if (dx * dx + dz * dz < reach * reach && b.y - BALL_R < p.y + BODY_H && b.y + BALL_R > p.y) {
      b.hit = true
      const r = this.host.hitPlayer(null, Math.round(this.host.combat.maxHp * BALL_COST), { blockable: false, fromX: b.x - d.dx, fromZ: b.z - d.dz, kind: 'aoe' })
      if (r === 'hit') {
        // Bowled aside, across the lane.
        const side = (dx * -d.dz + dz * d.dx) >= 0 ? 1 : -1
        p.vx += -d.dz * side * 5
        p.vz += d.dx * side * 5
      }
    }
  }

  private take(r: RewardRt): void {
    r.taken = true
    r.root.visible = false
    const d = r.def
    this.host.fx.riseRing(d.x, d.y + 0.2, d.z, '#8dff7a', 0.7, 16)
    if (d.kind === 'bolts') {
      const v = 12 + this.level * 5
      for (let n = 0; n < 3; n++) this.host.onPickup('bolt', v)
    } else {
      this.host.onPickup(d.kind === 'hp' ? 'hpBig' : 'weBig', 0)
    }
  }

  // ─── The player's body ─────────────────────────────────────────────────────

  /**
   * One step of Flux's body: the ladder he is on, the step off its top, a
   * ladder to grab, the platform carrying him, the walk (`moveBody`), then
   * gravity. `p.vx/vz` are already blended toward the wanted velocity;
   * `wx, wz` are the stick in world space (−1..1: toward a ladder's wall is
   * up). Writes the new x, z to `out` (the mission applies them) and sets
   * `pitted` / `pitDark` / `landSpeed`.
   */
  stepBody(p: ClimbBody, out: [number, number], wx: number, wz: number, dt: number, sliding: boolean): void {
    this.pitted = false
    this.pitDark = 0
    this.landSpeed = 0
    const nav = this.host.nav
    if (p.ladder >= 0) {
      this.climbLadder(p, out, wx, wz, dt)
      return
    }
    if (p.mantle > 0) {
      const k = Math.min(1, dt / p.mantle)
      out[0] = p.x + (p.mx - p.x) * k
      out[1] = p.z + (p.mz - p.z) * k
      p.mantle -= dt
      p.vx = 0
      p.vz = 0
      return
    }
    if (p.ground && !sliding && this.tryMount(p, wx, wz)) {
      out[0] = p.x
      out[1] = p.z
      return
    }
    let x = p.x
    let z = p.z
    if (p.ground && p.plat >= 0) {
      const pl = nav.plats![p.plat]
      if (pl) { x += pl.dx; z += pl.dz }
    }
    moveBody(nav, x, z, p.y, p.vx * dt, p.vz * dt, PLAYER_R, out)
    const sup = floorAt(nav, out[0], out[1], p.y)
    if (p.ground) {
      if (sup >= p.y - SNAP) {
        p.y = sup
        p.vy = 0
        p.air = 0
      } else if (sup === -Infinity && p.air < COYOTE) {
        p.air += dt
      } else {
        p.ground = false
        p.vy = 0
      }
    }
    if (!p.ground) {
      p.vy = Math.max(-MAX_FALL, p.vy - GRAVITY * dt)
      p.y += p.vy * dt
      if (p.y <= sup) {
        this.landSpeed = -p.vy
        p.y = sup
        p.vy = 0
        p.ground = true
        p.air = 0
      }
    }
    p.plat = p.ground ? platUnder(nav, out[0], out[1], p.y) : -1
    if (p.ground && p.air === 0) p.safeY = p.y
    if (!p.ground && groundAt(this.host.map, out[0], out[1]) === -Infinity && floorAt(nav, out[0], out[1]) === -Infinity) {
      const drop = p.safeY - p.y
      this.pitDark = clamp(drop / PIT_DROP, 0, 1)
      if (drop > PIT_DROP) this.pitted = true
    }
  }

  /** Grab a ladder: at its foot pushing toward the wall, or at its top
   *  walking off the edge above it. */
  private tryMount(p: ClimbBody, wx: number, wz: number): boolean {
    for (let n = 0; n < this.ladders.length; n++) {
      const L = this.ladders[n]!
      const rx = p.x - L.ex
      const rz = p.z - L.ez
      if (Math.abs(rx * L.ax + rz * L.az) > 0.95) continue
      const d = rx * L.nx + rz * L.nz
      const push = -(wx * L.nx + wz * L.nz)
      if (Math.abs(p.y - L.def.y0) < 0.35 && d > 0 && d < PLAYER_R + 0.45 && push > 0.35) {
        p.y = L.def.y0
      } else if (Math.abs(p.y - L.def.y1) < 0.35 && d < 0 && d > -1.3 && push < -0.35) {
        p.y = L.def.y1 - 0.05
      } else continue
      p.ladder = n
      p.ground = false
      p.vx = 0
      p.vz = 0
      p.vy = 0
      p.plat = -1
      p.path = null
      this.host.sfx('tink', L.ex, L.ez)
      return true
    }
    return false
  }

  private climbLadder(p: ClimbBody, out: [number, number], wx: number, wz: number, dt: number): void {
    const L = this.ladders[p.ladder]!
    const push = -(wx * L.nx + wz * L.nz)
    const k = Math.min(1, dt * 14)
    out[0] = p.x + (L.standX - p.x) * k
    out[1] = p.z + (L.standZ - p.z) * k
    p.vx = 0
    p.vz = 0
    p.vy = 0
    if (Math.abs(push) > 0.2) p.y += push * CLIMB_SPEED * dt
    if (p.y >= L.def.y1 - 0.02) {
      p.y = L.def.y1 - 0.02
      if (push > 0.2) {
        // Over the top: step off onto the ledge.
        p.ladder = -1
        p.y = L.def.y1
        p.ground = true
        p.air = 0
        p.safeY = p.y
        p.mantle = 0.2
        p.mx = L.topX
        p.mz = L.topZ
      }
    } else if (p.y <= L.def.y0) {
      p.y = L.def.y0
      p.ladder = -1
      p.ground = true
      p.air = 0
      p.safeY = p.y
    }
  }

  /** Slide on a ladder: let go and drop off it, backward. */
  letGo(p: ClimbBody): void {
    const L = this.ladders[p.ladder]
    if (!L) return
    p.ladder = -1
    p.ground = false
    p.vy = 0
    p.vx = L.nx * 3
    p.vz = L.nz * 3
  }

  /** Slide is a ground move: not in the air, on a ladder or stepping off one. */
  canSlide(p: ClimbBody): boolean {
    return p.ground && p.ladder < 0 && p.mantle <= 0
  }

  /** Where a pit fall (or a resume) puts Flux back. */
  respawn(): { x: number; z: number; y: number; yaw: number } {
    const c = this.t.checkpoints[this.cp]
    if (c) return c
    const s = this.host.map.start
    return { x: s.x, z: s.z, y: groundAt(this.host.map, s.x, s.z), yaw: s.yaw }
  }

  /** The climb's machines stay on their own platform; a flyer rises and
   *  sinks through its band after the player. */
  tendFoe(e: Enemy, playerY: number, dt: number): void {
    const l = e.leash
    if (l) {
      e.x = clamp(e.x, l[0], l[2])
      e.z = clamp(e.z, l[1], l[3])
    }
    const h = e.hover
    if (h && e.state !== 'dead') {
      const want = clamp(playerY, h[0], h[1])
      const f = e.floor ?? 0
      e.floor = f + clamp(want - f, -2.4 * dt, 2.4 * dt)
    }
  }

  save(): ClimbSave {
    const got: number[] = []
    this.rewards.forEach((r, i) => { if (r.taken) got.push(i) })
    return { cp: this.cp, got }
  }

  restore(s: ClimbSave | undefined): void {
    if (!s) return
    this.cp = Math.max(-1, Math.min(this.t.checkpoints.length - 1, Math.round(s.cp)))
    for (const i of s.got ?? []) {
      const r = this.rewards[i]
      if (!r) continue
      r.taken = true
      r.root.visible = false
    }
  }
}
