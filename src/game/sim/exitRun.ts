import { BANNER_HOLD } from '../state/banner'
import { CELL } from '../world/levelGen'
import { floorAt, groundAt, hasLineOfSight } from '../world/nav'
import { HERO_GAIT, TAU, cycleLen } from '../models/motion'
import { DRONE_BELOW, DRONE_DECK_Y, DRONE_DUCT_R, DRONE_RIM_R, DRONE_ROTORS, DRONE_ARM_R } from '../models/exitDrone'
import { solidAt, clearFraction, clearLine, placeCamera, CAM_PAD, type CineWorld, type CamSpot } from './cineCam'

/**
 * ─── The exit: the lab's drone fetches Flux ──────────────────────────────────
 *
 * The objective is done and the room is quiet; the player asks to leave (B,
 * or the button). Instead of a beam, a cutscene of about five seconds, then
 * the "LEVEL CLEARED" banner and the results:
 *
 *   approach  the drone (`models/exitDrone.ts`) flies in from above and
 *             behind Flux, banking with its deceleration, and settles into a
 *             hover beside him, ~0.4 m off the floor;
 *   walk      the view is third person now: Flux turns, walks to the deck…
 *   hop       …and hops onto it (a wind-up, the jump, the landing's squash —
 *             the drone dips under his weight);
 *   lift      it rises, accelerating, and heads out of the level over the
 *             walls with a slight forward tilt. The banner goes up here, and
 *             `BANNER_HOLD.cleared` later the mission finishes — once.
 *
 * Any press after the first `EXIT_SKIP_AFTER` s jumps straight to the
 * lift-off (banner and finish still run their course). The whole thing is a
 * pure function of time (`sample`) over a plan made once at the start
 * (`planExit`), so the renderer can interpolate it and a test can step it
 * without a GPU. The camera (`ExitCamera`) frames it and asks `sim/cineCam.ts`
 * to keep the lens out of every wall.
 */

/** A press counts as a skip only after this long (s): the press that asked
 *  for the exit must never also skip it. */
export const EXIT_SKIP_AFTER = 0.4
/** The drone's flight in (s). */
export const EXIT_APPROACH = 2.8
/** The hop onto the deck (s); from under the drone it is a longer jump. */
export const EXIT_HOP = 0.62
const EXIT_HOP_OVERHEAD = 0.8
/** Standing on the deck before lift-off (s). */
export const EXIT_SETTLE = 0.85
/** The deck's top over the floor while it waits: its underside ~0.4 m up. */
export const DRONE_HOVER = DRONE_BELOW + 0.4
/** Flux's walk to the deck (m/s) and its shortest length (s). */
const WALK_SPEED = 1.5
const WALK_MIN = 0.45
/** Where the hop starts, from the drone's middle (m): off the rim, between
 *  two ducts. */
const HOP_FROM = DRONE_RIM_R + 0.38
/** How far the hop arcs over its straight line (m). */
const HOP_ARC = 0.5
/** The hover spot: this far from Flux (m)… */
const SPOT_DIST = [2.5, 2.1, 2.9, 1.8, 3.3]
/** …and turned this far from his view (rad): beside him first, then ahead,
 *  then behind. */
const SPOT_TURN = [-Math.PI / 2, Math.PI / 2, -0.9, 0.9, -2.2, 2.2, 0, Math.PI]
/** Turns (rad) tried for the approach, from straight behind Flux. */
const APPROACH_TURN = [0, 0.7, -0.7, 1.4, -1.4, 2.1, -2.1]
/** A circle round the drone that holds its ducts (m), for the flight path. */
const DRONE_REACH = DRONE_ARM_R + DRONE_DUCT_R * 0.8
/** The teleporter pad (`models/props.ts`): Flux stands on its plate, this
 *  high, out to this radius, and steps down off its rim. */
const PAD_TOP = 0.32
const PAD_R = 1.15

export type ExitEvent = 'approach' | 'walk' | 'hop' | 'land' | 'lift' | 'finish'
export type ExitStage = 'approach' | 'walk' | 'hop' | 'settle' | 'lift'

/** What the mission does at each beat (sounds, the banner, the finish). */
export interface ExitHost {
  exitEvent(e: ExitEvent): void
}

export interface ExitPlan {
  /** Flux where the exit began: feet, and his view's yaw (mission convention). */
  fx: number
  fy: number
  fz: number
  fyaw: number
  /** The drone's hover spot, and its deck's top there. */
  sx: number
  sz: number
  hoverY: number
  /** The drone's yaw once it waits (model convention: +Z toward Flux). */
  droneYaw: number
  /** The approach: a cubic Bézier, four points x, y, z. */
  path: number[]
  /** No clear spot beside him: the drone came straight down over him. */
  overhead: boolean
  /** Where his hop starts (the walk ends). */
  ex: number
  ez: number
  /** The way out once over the walls (unit, horizontal): back the way it came. */
  liftX: number
  liftZ: number
  /** The top of every wall round about (m). */
  top: number
  /** Seconds into the lift when the drone is clear of those walls. */
  liftClear: number
  /** Which side of the stage the camera starts on (±1). */
  camSide: 1 | -1
  /** The teleporter pad's middle, when there is one: standing on it, Flux's
   *  feet are on its plate (the first-person game never needed to know). */
  pad: { x: number; z: number } | null
  /** The timeline (s from the start). */
  tWalk: number
  tHop: number
  tLand: number
  tLift: number
  tEnd: number
}

export interface ExitPose {
  /** The drone: position (its deck's middle), yaw, tilt in its own frame, rotor angle, thrust 0..1. */
  dx: number
  dy: number
  dz: number
  dyaw: number
  dpitch: number
  droll: number
  spin: number
  thrust: number
  /** Flux: feet, and his yaw (model convention: facing +Z at 0). */
  hx: number
  hy: number
  hz: number
  hyaw: number
  mode: 'stand' | 'walk' | 'hop' | 'ride'
  /** Walking: stride share 0..1 and gait phase (rad). */
  walk: number
  stride: number
  /** Hopping / landing: crouch and tuck 0..1. */
  crouch: number
  tuck: number
  /** Head pitch while he watches the drone come in (rad, − = up). */
  look: number
  /** Seconds into his cheer on the rising deck, −1 before it. */
  cheer: number
}

export const newExitPose = (): ExitPose => ({
  dx: 0, dy: 0, dz: 0, dyaw: 0, dpitch: 0, droll: 0, spin: 0, thrust: 0,
  hx: 0, hy: 0, hz: 0, hyaw: 0, mode: 'stand', walk: 0, stride: 0, crouch: 0, tuck: 0, look: 0, cheer: -1
})

const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v)
const smooth = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const angDiff = (a: number, b: number): number => {
  let d = a - b
  while (d > Math.PI) d -= TAU
  while (d < -Math.PI) d += TAU
  return d
}

// ─── The plan ─────────────────────────────────────────────────────────────────

/** The tallest wall within `r` m of (x, z), and never less than a room's. */
const localTop = (w: CineWorld, x: number, z: number, fy: number, r = 6): number => {
  let top = fy + 3.6
  const nav = w.nav
  const i0 = Math.max(0, Math.floor((x - r) / CELL))
  const i1 = Math.min(nav.w - 1, Math.floor((x + r) / CELL))
  const j0 = Math.max(0, Math.floor((z - r) / CELL))
  const j1 = Math.min(nav.h - 1, Math.floor((z + r) / CELL))
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      const h = w.top[j * nav.w + i]!
      if (h > top) top = h
    }
  }
  return top
}

const bez = (p: number[], b: number, out: CamSpot): CamSpot => {
  const a = 1 - b
  const k0 = a * a * a
  const k1 = 3 * a * a * b
  const k2 = 3 * a * b * b
  const k3 = b * b * b
  out.x = k0 * p[0]! + k1 * p[3]! + k2 * p[6]! + k3 * p[9]!
  out.y = k0 * p[1]! + k1 * p[4]! + k2 * p[7]! + k3 * p[10]!
  out.z = k0 * p[2]! + k1 * p[5]! + k2 * p[8]! + k3 * p[11]!
  return out
}

const _pt: CamSpot = { x: 0, y: 0, z: 0 }

/** The drone, hovering at (sx, hoverY, sz) turned to `yaw`, touches nothing:
 *  its deck, its four ducts, and no floor under it higher than Flux's. */
const droneFits = (w: CineWorld, sx: number, sz: number, yaw: number, fy: number, hoverY: number): boolean => {
  for (let k = 0; k < 9; k++) {
    const a = (k / 8) * TAU
    const r = k === 8 ? 0 : 1.05
    if (floorAt(w.nav, sx + Math.cos(a) * r, sz + Math.sin(a) * r) > fy + 0.15) return false
  }
  if (solidAt(w, sx, hoverY - 0.12, sz, DRONE_RIM_R + 0.05, 0.12)) return false
  const c = Math.cos(yaw)
  const s = Math.sin(yaw)
  for (const [x, z] of DRONE_ROTORS) {
    if (solidAt(w, sx + x * c + z * s, hoverY + 0.06, sz - x * s + z * c, DRONE_DUCT_R + 0.08, 0.1)) return false
  }
  return true
}

/** Flux can walk from (ax, az) to (bx, bz) on his own floor: no wall, no
 *  pillar or crate, no pit, no step. */
const walkable = (w: CineWorld, ax: number, az: number, bx: number, bz: number, fy: number): boolean => {
  const len = Math.hypot(bx - ax, bz - az)
  const n = Math.max(1, Math.ceil(len / 0.25))
  for (let s = 0; s <= n; s++) {
    const x = ax + (bx - ax) * s / n
    const z = az + (bz - az) * s / n
    const g = groundAt(w.nav.map, x, z)
    if (g < fy - 0.35 || g > fy + 0.35) return false
    if (solidAt(w, x, fy + 0.6, z, 0.3, 0)) return false
  }
  return true
}

/** The approach path is open all the way down (the drone's whole reach). */
const pathClear = (w: CineWorld, path: number[]): boolean => {
  for (let s = 0; s <= 28; s++) {
    const p = bez(path, s / 28, _pt)
    if (solidAt(w, p.x, p.y - 0.15, p.z, DRONE_REACH, 0.2)) return false
  }
  return true
}

/** Seconds into the lift before the drone's underside is `h` m over its hover. */
const riseTime = (h: number): number => {
  let s = 0
  while (s < 8 && liftRise(s) < h) s += 0.02
  return s
}
/** How high Flux's feet stand over the floor at (x, z): the pad's plate. */
const padLift = (P: ExitPlan, x: number, z: number): number =>
  P.pad ? PAD_TOP * (1 - smooth(PAD_R, PAD_R + 0.2, Math.hypot(x - P.pad.x, z - P.pad.z))) : 0

/** How far the drone has risen `s` s into the lift (m): from rest, accelerating. */
const liftRise = (s: number): number => 1.15 * s * s + 0.5 * s * s * s

/** Try the hover spot (sx, sz): fills the plan and says yes when the drone
 *  fits there, Flux can walk to it, and a flight path in is open. */
const trySpot = (w: CineWorld, P: ExitPlan, sx: number, sz: number): boolean => {
  const { fx, fy, fz } = P
  const d = Math.hypot(sx - fx, sz - fz)
  if (d < HOP_FROM + 0.5) return false
  if (!hasLineOfSight(w.nav, fx, fz, sx, sz)) return false
  const hoverY = fy + DRONE_HOVER
  const yaw = Math.atan2(fx - sx, fz - sz)
  if (!droneFits(w, sx, sz, yaw, fy, hoverY)) return false
  const ux = (sx - fx) / d
  const uz = (sz - fz) / d
  const ex = sx - ux * HOP_FROM
  const ez = sz - uz * HOP_FROM
  if (!walkable(w, fx, fz, ex, ez, fy)) return false
  // In from above and behind Flux; failing that, straight down.
  const path: number[] = []
  let found = false
  for (const turn of APPROACH_TURN) {
    const bx = Math.sin(P.fyaw + turn)
    const bz = Math.cos(P.fyaw + turn)
    path.length = 0
    path.push(
      sx + bx * 11, P.top + 6, sz + bz * 11,
      sx + bx * 5.5, P.top + 2.6, sz + bz * 5.5,
      sx + bx * 0.8, hoverY + 1.5, sz + bz * 0.8,
      sx, hoverY, sz
    )
    if (pathClear(w, path)) {
      P.liftX = bx
      P.liftZ = bz
      found = true
      break
    }
  }
  if (!found) {
    path.length = 0
    path.push(sx, P.top + 7, sz, sx, P.top + 3, sz, sx, hoverY + 1.4, sz, sx, hoverY, sz)
    if (!pathClear(w, path)) return false
    P.liftX = Math.sin(P.fyaw)
    P.liftZ = Math.cos(P.fyaw)
  }
  P.sx = sx
  P.sz = sz
  P.hoverY = hoverY
  P.droneYaw = yaw
  P.path = path
  P.ex = ex
  P.ez = ez
  P.overhead = false
  return true
}

/**
 * Plan the exit from where Flux stands (feet at `fy`, facing `fyaw` in the
 * mission's convention, `grounded` unless on a ladder or in the air). Looks
 * for a hover spot 2–3 m away that the drone fits into, that Flux can walk
 * to and that a flight path reaches; falls back to straight down over him.
 */
export const planExit = (
  w: CineWorld, fx: number, fy: number, fz: number, fyaw: number, grounded: boolean, pad: { x: number; z: number } | null = null
): ExitPlan => {
  const top = localTop(w, fx, fz, fy)
  const P: ExitPlan = {
    fx, fy, fz, fyaw, sx: fx, sz: fz, hoverY: fy + 2.05, droneYaw: fyaw + Math.PI, path: [], overhead: true,
    ex: fx, ez: fz, liftX: Math.sin(fyaw), liftZ: Math.cos(fyaw), top, liftClear: 0, camSide: 1, pad,
    tWalk: 0, tHop: 0, tLand: 0, tLift: 0, tEnd: 0
  }
  let ok = false
  if (grounded) {
    for (const d of SPOT_DIST) {
      for (const a of SPOT_TURN) {
        if (trySpot(w, P, fx - Math.sin(fyaw + a) * d, fz - Math.cos(fyaw + a) * d)) {
          ok = true
          break
        }
      }
      if (ok) break
    }
    // The middles of the cells round him: a corridor's axis, a shaft's middle.
    for (let dj = -1; dj <= 1 && !ok; dj++) {
      for (let di = -1; di <= 1 && !ok; di++) {
        const cx = (Math.floor(fx / CELL) + di + 0.5) * CELL
        const cz = (Math.floor(fz / CELL) + dj + 0.5) * CELL
        const d = Math.hypot(cx - fx, cz - fz)
        if (d >= 1.6 && d <= 3.8) ok = trySpot(w, P, cx, cz)
      }
    }
  }
  if (!ok) {
    // Straight down over him, deck clear of his head; he jumps up to it.
    const hoverY = fy + padLift(P, fx, fz) + 1.78 + DRONE_BELOW
    P.path = [fx, top + 7, fz, fx, top + 3, fz, fx, hoverY + 1.2, fz, fx, hoverY, fz]
    P.hoverY = hoverY
    P.droneYaw = fyaw + Math.PI
  }
  const walkLen = P.overhead ? 0 : Math.hypot(P.ex - fx, P.ez - fz)
  P.tWalk = EXIT_APPROACH
  P.tHop = P.tWalk + (P.overhead ? 0 : Math.max(WALK_MIN, walkLen / WALK_SPEED))
  P.tLand = P.tHop + (P.overhead ? EXIT_HOP_OVERHEAD : EXIT_HOP)
  P.tLift = P.tLand + EXIT_SETTLE
  P.tEnd = P.tLift + BANNER_HOLD.cleared
  P.liftClear = riseTime(Math.max(0.5, top + 1 - P.hoverY))
  P.camSide = pickCamSide(w, P)
  return P
}

// ─── The run ──────────────────────────────────────────────────────────────────

const EVENTS: ExitEvent[] = ['approach', 'walk', 'hop', 'land', 'lift', 'finish']

export class ExitRun {
  plan: ExitPlan | null = null
  /** Seconds since the start (sim time), and a step ago (render interpolation). */
  time = 0
  ptime = 0
  /** Index into EVENTS of the next beat. */
  private next = 0
  /** Scratch for the tilt's finite differences. */
  private a: CamSpot = { x: 0, y: 0, z: 0 }
  private b: CamSpot = { x: 0, y: 0, z: 0 }
  private c: CamSpot = { x: 0, y: 0, z: 0 }

  constructor(private host: ExitHost) {}

  /** A plan is running (from `start` on, to the end of the mission). */
  get active(): boolean {
    return this.plan !== null
  }

  /** The drone has lifted off (the banner is up). */
  get lifted(): boolean {
    return !!this.plan && this.time >= this.plan.tLift
  }

  /** A press now would skip to the lift-off. */
  get skippable(): boolean {
    return !!this.plan && this.time >= EXIT_SKIP_AFTER && this.time < this.plan.tLift
  }

  get stage(): ExitStage {
    const P = this.plan
    const t = this.time
    if (!P || t < P.tWalk) return 'approach'
    if (t < P.tHop) return 'walk'
    if (t < P.tLand) return 'hop'
    if (t < P.tLift) return 'settle'
    return 'lift'
  }

  /** Start the exit. Once per mission: a second call is refused. */
  start(plan: ExitPlan): boolean {
    if (this.plan) return false
    this.plan = plan
    this.time = 0
    this.ptime = 0
    this.next = 0
    this.fire()
    return true
  }

  /** One sim step; `pressed` is a fresh tap, click or key press this step. */
  update(dt: number, pressed: boolean): void {
    if (!this.plan) return
    this.ptime = this.time
    if (pressed) this.skip()
    this.time += dt
    this.fire()
  }

  /** Jump to the lift-off, skipping the beats between (their sounds too).
   *  Refused in the first `EXIT_SKIP_AFTER` s and once it has lifted off. */
  skip(): boolean {
    const P = this.plan
    if (!P || !this.skippable) return false
    this.time = this.ptime = P.tLift
    this.next = EVENTS.indexOf('lift')
    return true
  }

  private at(e: ExitEvent): number {
    const P = this.plan!
    switch (e) {
      case 'approach': return 0
      case 'walk': return P.tWalk
      case 'hop': return P.tHop
      case 'land': return P.tLand
      case 'lift': return P.tLift
      case 'finish': return P.tEnd
    }
  }

  private fire(): void {
    while (this.next < EVENTS.length && this.time >= this.at(EVENTS[this.next]!)) {
      this.host.exitEvent(EVENTS[this.next++]!)
    }
  }

  /** The drone's middle at time `t` (no tilt). */
  private dronePos(t: number, out: CamSpot): CamSpot {
    const P = this.plan!
    if (t < EXIT_APPROACH) {
      const k = clamp(t / EXIT_APPROACH, 0, 1)
      return bez(P.path, 1 - Math.pow(1 - k, 2.4), out)
    }
    const tau = t - EXIT_APPROACH
    const s = t > P.tLift ? Math.min(6, t - P.tLift) : 0
    // Hovering: a slow bob, and a dip under Flux's weight as he lands.
    const still = 1 - smooth(0, 0.45, s)
    let y = P.hoverY + 0.035 * Math.sin(2.3 * tau) * smooth(0, 0.5, tau) * still
    if (t > P.tLand) {
      const l = t - P.tLand
      y -= 0.11 * Math.sin(8.5 * l) * Math.exp(-3.8 * l) * still
    }
    // Lifting: up, accelerating, and away once over the walls.
    y += liftRise(s)
    const drift = s > P.liftClear ? 1.5 * (s - P.liftClear) ** 2 : 0
    out.x = P.sx + P.liftX * drift
    out.y = y
    out.z = P.sz + P.liftZ * drift
    return out
  }

  /** Flux's deck: where his feet are once aboard. */
  private deckY(t: number): number {
    return this.dronePos(t, this.c).y + DRONE_DECK_Y
  }

  /** Everything at time `t` (a pure function of it, so the render can
   *  interpolate between two steps). */
  sample(t: number, o: ExitPose): ExitPose {
    const P = this.plan!
    // ── The drone ──
    const d = this.dronePos(t, this.a)
    o.dx = d.x
    o.dy = d.y
    o.dz = d.z
    const h = 1 / 30
    const p0 = this.dronePos(Math.max(0, t - h), this.b)
    let ax = 0
    let az = 0
    if (t > h) {
      const p1x = p0.x
      const p1z = p0.z
      const p2 = this.dronePos(t + h, this.b)
      ax = (p2.x + p1x - 2 * o.dx) / (h * h)
      az = (p2.z + p1z - 2 * o.dz) / (h * h)
    }
    const lift = t > P.tLift ? smooth(0, 0.6, t - P.tLift) : 0
    // A slight forward tilt out of the level, the way it is heading.
    ax += P.liftX * 2.4 * lift
    az += P.liftZ * 2.4 * lift
    const travel = Math.atan2(P.path[9]! - P.path[0]!, P.path[11]! - P.path[2]!)
    const yawIn = Math.abs(P.path[9]! - P.path[0]!) + Math.abs(P.path[11]! - P.path[2]!) < 0.5 ? P.droneYaw + 1.2 : travel
    const kIn = clamp(t / EXIT_APPROACH, 0, 1)
    o.dyaw = yawIn + angDiff(P.droneYaw, yawIn) * smooth(0.35, 0.95, kIn)
    const c = Math.cos(o.dyaw)
    const s = Math.sin(o.dyaw)
    // Acceleration in the drone's frame; it leans into it (a quad pitches its
    // front down to speed up along +Z, and flares back as it brakes).
    const lx = ax * c - az * s
    const lz = ax * s + az * c
    o.dpitch = clamp(lz * 0.075, -0.42, 0.42)
    o.droll = clamp(-lx * 0.075, -0.42, 0.42)
    const lt = t > P.tLift ? t - P.tLift : 0
    o.spin = 40 * t + 9 * lt * lt
    const landed = t > P.tLand ? Math.exp(-4 * (t - P.tLand)) : 0
    o.thrust = t < EXIT_APPROACH ? 0.75 - 0.3 * kIn : lift > 0 ? 0.5 + 0.5 * lift : 0.45 + 0.35 * landed
    // ── Flux ──
    o.walk = 0
    o.crouch = 0
    o.tuck = 0
    o.look = 0
    o.cheer = -1
    const yawTo = P.overhead ? P.fyaw + Math.PI : Math.atan2(P.sx - P.fx, P.sz - P.fz)
    if (t < P.tWalk) {
      o.mode = 'stand'
      o.hx = P.fx
      o.hy = P.fy + padLift(P, P.fx, P.fz)
      o.hz = P.fz
      const yaw0 = P.fyaw + Math.PI
      o.hyaw = yaw0 + angDiff(yawTo, yaw0) * smooth(EXIT_APPROACH - 1.3, EXIT_APPROACH - 0.35, t)
      // He watches it come in.
      o.look = clamp(-Math.atan2(o.dy - (P.fy + 1.3), Math.max(0.8, Math.hypot(o.dx - P.fx, o.dz - P.fz))), -0.55, 0.2)
    } else if (t < P.tHop) {
      o.mode = 'walk'
      const dur = P.tHop - P.tWalk
      const u = (t - P.tWalk) / dur
      // Constant pace, with a short start and stop (15 % of the walk each).
      const e = clamp(u, 0, 1)
      const k = e < 0.15 ? (e * e) / 0.255 : e > 0.85 ? 1 - ((1 - e) * (1 - e)) / 0.255 : (e - 0.075) / 0.85
      o.hx = P.fx + (P.ex - P.fx) * k
      o.hz = P.fz + (P.ez - P.fz) * k
      o.hy = P.fy + padLift(P, o.hx, o.hz)
      o.hyaw = yawTo
      const len = Math.hypot(P.ex - P.fx, P.ez - P.fz)
      o.walk = 0.6 * clamp(Math.min(u * 5, (1 - u) * 5), 0.25, 1)
      o.stride = (k * len * TAU) / cycleLen(HERO_GAIT, HERO_GAIT.A)
    } else if (t < P.tLand) {
      o.mode = 'hop'
      o.hyaw = yawTo
      const tau = (t - P.tHop) / (P.tLand - P.tHop)
      const from = P.fy + padLift(P, P.ex, P.ez)
      if (tau < 0.28) {
        o.hx = P.ex
        o.hy = from
        o.hz = P.ez
        o.crouch = smooth(0, 1, tau / 0.28)
      } else if (tau < 0.86) {
        const a = (tau - 0.28) / 0.58
        const deck = this.deckY(t)
        o.hx = P.ex + (P.sx - P.ex) * a
        o.hz = P.ez + (P.sz - P.ez) * a
        o.hy = from + (deck - from) * a + 4 * (P.overhead ? 0.45 : HOP_ARC) * a * (1 - a)
        o.crouch = 1 - smooth(0, 0.3, a)
        o.tuck = Math.sin(Math.PI * a)
      } else {
        o.hx = P.sx
        o.hy = this.deckY(t)
        o.hz = P.sz
        o.crouch = 0.75 * smooth(0.86, 1, tau)
      }
    } else {
      o.mode = 'ride'
      o.hyaw = yawTo
      o.hx = o.dx
      o.hy = o.dy + DRONE_DECK_Y
      o.hz = o.dz
      o.crouch = 0.75 * Math.exp(-5 * (t - P.tLand))
      if (t > P.tLift + 0.1) o.cheer = t - P.tLift - 0.1
    }
    return o
  }
}

// ─── The camera ───────────────────────────────────────────────────────────────

/** `out` = (x, y, z) made unit length (straight ahead when it has none). */
const unit = (out: CamSpot, x: number, y: number, z: number): CamSpot => {
  const l = Math.hypot(x, y, z)
  if (l < 1e-6) {
    out.x = 0
    out.y = 0
    out.z = 1
  } else {
    out.x = x / l
    out.y = y / l
    out.z = z / l
  }
  return out
}

/** The camera's side of the stage whose first shot (low, wide, looking over
 *  Flux at the drone coming in) is the more open. */
const pickCamSide = (w: CineWorld, P: ExitPlan): 1 | -1 => {
  let best: 1 | -1 = 1
  let bestF = -1
  for (const side of [1, -1] as const) {
    const s = shotA(P, side, 1, _pt)
    const f = clearFraction(w, P.fx, P.fy + 0.95, P.fz, s.x, s.y, s.z, CAM_PAD)
    if (f > bestF + 1e-6) {
      best = side
      bestF = f
    }
  }
  return best
}

/** The stage's axis (Flux → the drone) and its side (toward the camera). */
const axis = (P: ExitPlan): [number, number] => {
  const dx = P.sx - P.fx
  const dz = P.sz - P.fz
  const l = Math.hypot(dx, dz)
  return l > 0.3 ? [dx / l, dz / l] : [-Math.sin(P.fyaw), -Math.cos(P.fyaw)]
}

/** Shot A, the arrival: low and wide, beside and behind Flux, the drone
 *  coming down past him. `k` stretches it for a narrow (portrait) screen. */
const shotA = (P: ExitPlan, side: 1 | -1, k: number, out: CamSpot): CamSpot => {
  const [ux, uz] = axis(P)
  out.x = P.fx - ux * 2.3 * k - uz * side * 1.8 * k
  out.y = P.fy + 0.45
  out.z = P.fz - uz * 2.3 * k + ux * side * 1.8 * k
  return out
}

export interface CineShot {
  x: number
  y: number
  z: number
  tx: number
  ty: number
  tz: number
  fov: number
}

/**
 * The exit's camera. Three shots, blended (never cut) by an eased follow:
 *   A  approach — low and wide beside Flux, looking up past him at the drone;
 *   B  boarding — a slow orbit round the stage (Flux and the deck), rising;
 *   C  lift-off — a chase crane that follows the deck up a beat behind, with
 *      a short FOV push as it goes.
 * Every wanted position goes through `placeCamera` (pulled in, craned up or
 * swung round when something is in the way), and the eased one is checked
 * again: if the follow would carry the lens into a wall or behind one, it
 * snaps to the placed spot instead. The look-at never strays so far toward
 * the drone that Flux leaves the frame.
 */
export class ExitCamera {
  readonly shot: CineShot = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0, fov: 70 }
  private primed = false
  private want: CamSpot = { x: 0, y: 0, z: 0 }
  private placed: CamSpot = { x: 0, y: 0, z: 0 }
  private anchor: CamSpot = { x: 0, y: 0, z: 0 }
  private look: CamSpot = { x: 0, y: 0, z: 0 }
  private dirF: CamSpot = { x: 0, y: 0, z: 1 }
  private dirD: CamSpot = { x: 0, y: 0, z: 1 }

  reset(): void {
    this.primed = false
  }

  /** Frame the exit at `t` for a render step `dt` (0: a repaint, nothing
   *  eases). `baseFov` is the game's own vertical FOV for this screen
   *  (`fovForAspect`); the shots work from it, capped where a portrait
   *  screen's is very tall. */
  frame(w: CineWorld, run: ExitRun, o: ExitPose, t: number, dt: number, aspect: number, baseFov: number): CineShot {
    const P = run.plan!
    // A portrait screen's own view is very tall (`fovForAspect` widens it for
    // the sideways view): the shots stay tighter than that and stand further
    // back instead, so both subjects are in frame and still read.
    const k = aspect < 1 ? Math.min(1.45, Math.pow(1 / Math.max(0.3, aspect), 0.35)) : 1
    const vFov = Math.min(baseFov, 72)
    const want = this.want
    const an = this.anchor
    const lk = this.look
    const side = P.camSide
    // The orbit's centre: between Flux and the drone.
    const mx = P.overhead ? P.fx : (P.fx + P.sx) / 2
    const mz = P.overhead ? P.fz : (P.fz + P.sz) / 2
    shotA(P, side, k, this.placed)
    const thA = Math.atan2(this.placed.x - mx, this.placed.z - mz)
    const thEnd = thA + side * 0.7
    let fov = vFov + 12
    let rate = 3.5
    /** Shot A looks up this far from Flux's head toward the drone (0..1). */
    let lookUp = 0
    if (t < P.tWalk) {
      shotA(P, side, k, want)
      want.y = o.hy + 0.45
      an.x = P.fx
      an.y = o.hy + 0.95
      an.z = P.fz
      lookUp = 0.4
    } else if (t < P.tLift) {
      const g = smooth(P.tWalk, P.tLift, t)
      const th = thA + side * 0.7 * g
      const R = 3.4 * k
      want.x = mx + Math.sin(th) * R
      want.y = P.fy + 1.2 + 0.5 * g
      want.z = mz + Math.cos(th) * R
      an.x = mx
      an.y = P.fy + 1.05
      an.z = mz
      lk.x = (mx + o.hx) / 2
      lk.y = (P.fy + 0.9 + o.hy + 0.95) / 2
      lk.z = (mz + o.hz) / 2
      fov = vFov + 2
      rate = 2.2
    } else {
      const s = t - P.tLift
      want.x = o.dx + Math.sin(thEnd) * 4 * k
      want.y = o.dy + 0.9 - 0.4 * smooth(0, 1.5, s)
      want.z = o.dz + Math.cos(thEnd) * 4 * k
      an.x = o.hx
      an.y = o.hy + 0.95
      an.z = o.hz
      lk.x = o.hx
      lk.y = o.hy + 1.0
      lk.z = o.hz
      fov = vFov + 2 + 13 * (1 - Math.exp(-10 * s)) * Math.exp(-2.2 * s)
      rate = 2.4
    }
    const placed = this.placed
    placeCamera(w, an.x, an.y, an.z, want, placed)
    if (lookUp > 0) {
      // From the lens: part of the way from his head toward the drone — but
      // never so far off his head that he leaves the frame (a portrait
      // screen's narrow width counts), wherever the drone is coming from.
      const f = this.dirF
      const d = this.dirD
      const hy = o.hy + 1.15
      const dist = Math.max(1e-3, Math.hypot(o.hx - placed.x, hy - placed.y, o.hz - placed.z))
      unit(f, o.hx - placed.x, hy - placed.y, o.hz - placed.z)
      unit(d, o.dx - placed.x, Math.min(o.dy, o.hy + 4.2) - placed.y, o.dz - placed.z)
      unit(d, f.x + (d.x - f.x) * lookUp, f.y + (d.y - f.y) * lookUp, f.z + (d.z - f.z) * lookUp)
      const halfV = (fov * Math.PI) / 360
      const limit = Math.min(halfV, Math.atan(Math.tan(halfV) * aspect)) * 0.55
      const cos = clamp(d.x * f.x + d.y * f.y + d.z * f.z, -1, 1)
      if (Math.acos(cos) > limit) {
        // Turn back toward his head, to the limit.
        const px = d.x - f.x * cos
        const py = d.y - f.y * cos
        const pz = d.z - f.z * cos
        const pl = Math.hypot(px, py, pz) || 1
        const c = Math.cos(limit)
        const s = Math.sin(limit)
        d.x = f.x * c + (px / pl) * s
        d.y = f.y * c + (py / pl) * s
        d.z = f.z * c + (pz / pl) * s
      }
      lk.x = placed.x + d.x * dist
      lk.y = placed.y + d.y * dist
      lk.z = placed.z + d.z * dist
    }
    const sh = this.shot
    sh.fov = fov
    if (this.primed && dt <= 0) return sh
    if (!this.primed) {
      sh.x = placed.x
      sh.y = placed.y
      sh.z = placed.z
      sh.tx = lk.x
      sh.ty = lk.y
      sh.tz = lk.z
      this.primed = true
    } else {
      const a = 1 - Math.exp(-rate * dt)
      const nx = sh.x + (placed.x - sh.x) * a
      const ny = sh.y + (placed.y - sh.y) * a
      const nz = sh.z + (placed.z - sh.z) * a
      // The eased lens may not cut a corner through a wall: then it snaps.
      if (solidAt(w, nx, ny, nz, CAM_PAD * 0.6) || !clearLine(w, an.x, an.y, an.z, nx, ny, nz, 0.1)) {
        sh.x = placed.x
        sh.y = placed.y
        sh.z = placed.z
      } else {
        sh.x = nx
        sh.y = ny
        sh.z = nz
      }
      const b = 1 - Math.exp(-7 * dt)
      sh.tx += (lk.x - sh.tx) * b
      sh.ty += (lk.y - sh.ty) * b
      sh.tz += (lk.z - sh.tz) * b
    }
    return sh
  }
}
