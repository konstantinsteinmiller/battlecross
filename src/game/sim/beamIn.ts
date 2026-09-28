import { EYE_H } from './constants'
import { clearLine, placeCamera, CAM_PAD, type CineWorld, type CamSpot } from './cineCam'
import { PAD_R, PAD_TOP } from './exitRun'

/**
 * ─── The beam-in: Flux arrives, then the view becomes his ────────────────────
 *
 * A mission used to open in first person, dropping the eye seven metres onto
 * the pad in a second: the player never saw who they were. Now the first
 * seconds are a shot of Flux himself, then the camera flies into his head:
 *
 *   materialise  the camera stands in front of him, a three-quarter view. He
 *                forms in the pad's light column — thin and tall, filling out
 *                — and drops out of it, faster as he falls;
 *   land         a crouch on the plate, a ring of light and sparks;
 *   dive         the camera swings round behind him and into his eyes; once
 *                it is behind him the HUD fades in, the arm cannon rises: play.
 *
 * Any press after `BEAM_IN_SKIP_AFTER` goes straight to play. Like the exit
 * (`sim/exitRun.ts`), the whole thing is a pure function of time over a shot
 * placed once, so the renderer can interpolate it and a test can step it
 * without a GPU. The camera asks `sim/cineCam.ts` to keep out of the walls; it
 * ENDS exactly at the first-person eye, looking exactly where the player
 * looks, so the handover has no jump.
 */

/** He touches the plate (s). */
export const BEAM_IN_LAND = 0.9
/** The landing crouch is over and the camera starts its dive (s). */
export const BEAM_IN_DIVE = 1.25
/** The view is his: play (s). */
export const BEAM_IN_END = 2.15
/** A press counts as a skip only after this long (s). */
export const BEAM_IN_SKIP_AFTER = 0.3

/** How high over the plate he forms (m): inside the pad's light column,
 *  which stands 3.2 m tall. */
export const BEAM_IN_DROP = 1.7
/** The pad's light column is lit until just after he lands, then fades, so
 *  he stands in his own colours before the dive (s). */
export const BEAM_IN_COLUMN = BEAM_IN_LAND + 0.15
/** The opening shot: this far from him (m), turned this far off his front
 *  (rad), with the lens this high over his feet (m). */
const SHOT_DIST = 3.2
const SHOT_TURN = 0.55
const SHOT_UP = 1.55
/** What the opening shot frames: his chest (m over his feet). */
const CHEST = 1.0
/** Past this much of the dive the lens is at his head: the body is hidden, or
 *  the near plane would slice through it. */
const BODY_UNTIL = 0.82

export interface BeamInPose {
  /** Height over the plate (m). */
  drop: number
  /** Body scale: sideways, and up (forming thin and tall). */
  sx: number
  sy: number
  /** The landing crouch, 0..1. */
  crouch: number
  /** The camera's dive into his head, 0..1. */
  dive: number
  /** Third person, until the dive is half done: the HUD is away. */
  cine: boolean
  /** The arm cannon raised, 0..1. */
  arm: number
  /** His body is drawn. */
  body: boolean
}

export const newBeamInPose = (): BeamInPose =>
  ({ drop: BEAM_IN_DROP, sx: 0.25, sy: 1.6, crouch: 0, dive: 0, cine: true, arm: 0, body: true })

const smooth = (a: number, b: number, x: number): number => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

/** The beam-in at `t` seconds. */
export const beamInPose = (t: number, o: BeamInPose): BeamInPose => {
  const k = Math.min(1, Math.max(0, t / BEAM_IN_LAND))
  // Held in the light at first, then falling out of it: he lands with speed.
  o.drop = BEAM_IN_DROP * (1 - k * k)
  const form = smooth(0, 0.45, t)
  o.sx = 0.25 + 0.75 * form
  o.sy = 1 + 0.6 * (1 - form)
  o.crouch = t < BEAM_IN_LAND ? 0 : 1 - smooth(BEAM_IN_LAND, BEAM_IN_DIVE, t)
  o.dive = smooth(BEAM_IN_DIVE, BEAM_IN_END, t)
  // The HUD returns once the lens is behind him, not while it still faces him.
  o.cine = o.dive < 0.5
  o.arm = smooth(BEAM_IN_DIVE + 0.45, BEAM_IN_END, t)
  o.body = o.dive < BODY_UNTIL
  return o
}

/** Standing on the teleporter pad his feet are on its plate, `PAD_TOP` over
 *  the floor the first-person game walks on (as in the exit). */
export const padPlateLift = (padX: number, padZ: number, x: number, z: number): number =>
  Math.hypot(x - padX, z - padZ) < PAD_R ? PAD_TOP : 0

export interface BeamInShot {
  x: number
  y: number
  z: number
  /** Where the lens looks. */
  tx: number
  ty: number
  tz: number
}

const angDiff = (a: number, b: number): number => {
  let d = (a - b) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

/**
 * The beam-in's camera. `yaw` / `pitch` are the player's view (mission
 * convention: forward is (−sin yaw, −cos yaw)); the opening shot is placed on
 * the first frame after a `reset`, from where he stands.
 */
export class BeamInCamera {
  readonly shot: BeamInShot = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 }
  private primed = false
  private ang = 0
  private r = SHOT_DIST
  private h = SHOT_UP
  private want: CamSpot = { x: 0, y: 0, z: 0 }
  private placed: CamSpot = { x: 0, y: 0, z: 0 }

  reset(): void {
    this.primed = false
  }

  /** Place the opening shot: in front of him, a three-quarter view, as near
   *  the wanted spot as the walls allow. */
  private prime(w: CineWorld, fx: number, fy: number, fz: number, yaw: number): void {
    // Model convention: his front is the direction (sin θ, cos θ), θ = yaw + π.
    const th = yaw + Math.PI + SHOT_TURN
    const want = this.want
    want.x = fx + Math.sin(th) * SHOT_DIST
    want.y = fy + SHOT_UP
    want.z = fz + Math.cos(th) * SHOT_DIST
    placeCamera(w, fx, fy + CHEST, fz, want, this.placed)
    const p = this.placed
    this.ang = Math.atan2(p.x - fx, p.z - fz)
    this.r = Math.hypot(p.x - fx, p.z - fz)
    this.h = p.y - fy
    this.primed = true
  }

  /** `drop`: how high over the plate he still is (the lens tilts down with him). */
  frame(w: CineWorld, fx: number, fy: number, fz: number, yaw: number, pitch: number, dive: number, drop = 0): BeamInShot {
    if (!this.primed) this.prime(w, fx, fy, fz, yaw)
    const s = this.shot
    // The dive: round to behind him (θ = yaw) the short way, in to his eyes.
    const e = dive * dive * (3 - 2 * dive)
    const ang = this.ang + angDiff(yaw, this.ang) * e
    const r = this.r * (1 - e)
    s.x = fx + Math.sin(ang) * r
    s.y = fy + this.h + (EYE_H - this.h) * e
    s.z = fz + Math.cos(ang) * r
    // A swing that would cut through a wall stays on this side of it (the
    // straight line in is always open: it ends in his own head).
    if (r > 0.4 && !clearLine(w, fx, fy + CHEST, fz, s.x, s.y, s.z, CAM_PAD)) {
      const g = Math.min(1, e / 0.6)
      const lx = this.placed.x + (fx - this.placed.x) * g
      const lz = this.placed.z + (fz - this.placed.z) * g
      s.x = lx
      s.z = lz
    }
    // Looks at his chest, then along his view: the last frame is the
    // first-person camera's own orientation.
    const look = smooth(0.25, 0.9, dive)
    const cp = Math.cos(pitch)
    const ex = fx - Math.sin(yaw) * cp * 10
    const ey = fy + EYE_H + Math.sin(pitch) * 10
    const ez = fz - Math.cos(yaw) * cp * 10
    s.tx = fx + (ex - fx) * look
    const cy = fy + drop + CHEST
    s.ty = cy + (ey - cy) * look
    s.tz = fz + (ez - fz) * look
    return s
  }
}
