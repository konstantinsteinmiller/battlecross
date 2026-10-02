import { PerspectiveCamera, Vector3 } from 'three'
import { groundAt } from '../gfx/ground'

/**
 * ─── The follow camera ───────────────────────────────────────────────────────
 *
 * A fixed high-angle camera that follows the hero: no yaw, no player control,
 * so screen-up is always world −Z and a drag on screen means the same thing
 * everywhere. The FOV is narrow and constant (an almost-orthographic look);
 * what adapts to the viewport is the DISTANCE, so a 320 px portrait phone and
 * a 21:9 desktop both see a playable slice of the field instead of one of them
 * getting a keyhole.
 *
 * It also owns the two camera halves of the GDD's "juice" (§2.3):
 *   • trauma shake — `offset = random(−1, 1) × trauma²`, decaying 1.5 / s;
 *   • the zoom punch of a boss's finishing blow.
 */

/** Degrees. Narrow on purpose: little perspective distortion at this pitch. */
export const CAM_FOV = 30
/** Pitch above the horizon, radians (~52°). */
export const CAM_PITCH = 52 * Math.PI / 180
/** The slice of ground the view must always hold (metres). */
const MIN_WIDTH = 9.5
const MIN_DEPTH = 11.5
/** GDD: trauma decays at 1.5 per second. */
export const TRAUMA_DECAY = 1.5
/** Largest shake offset, in metres at trauma 1. */
const SHAKE_MAX = 0.42

const TAN_HALF = Math.tan((CAM_FOV * Math.PI) / 360)
const SIN_P = Math.sin(CAM_PITCH)
const COS_P = Math.cos(CAM_PITCH)

const _dir = new Vector3()
const _proj = new Vector3()
/** How far above and below the view's height a tap's ray looks for ground (m), and its step. */
const GROUND_BAND = 6
const MARCH = 0.35

export class FollowCam {
  readonly camera = new PerspectiveCamera(CAM_FOV, 1, 1, 220)
  /** The point on the ground the camera looks at (smoothed). */
  readonly target = new Vector3()
  /** Distance from the target that fits the viewport. */
  dist = 20
  /** 1 = the fitted distance; below 1 is closer (a zoom punch, a town). */
  zoom = 1
  trauma = 0
  width = 1
  height = 1
  private zoomFrom = 1
  private zoomTo = 1
  private zoomT = 0
  private zoomDur = 0
  private zoomHold = 0
  /** How far ahead of the hero the view leads, toward where they walk. */
  private leadX = 0
  private leadZ = 0
  private snapNext = true

  setViewport(w: number, h: number): void {
    this.width = Math.max(1, w)
    this.height = Math.max(1, h)
    const aspect = this.width / this.height
    this.camera.aspect = aspect
    // Width on the ground is 2·d·tan(fov/2)·aspect; depth is that height
    // stretched by the pitch.
    const forWidth = MIN_WIDTH / (2 * TAN_HALF * aspect)
    const forDepth = (MIN_DEPTH * SIN_P) / (2 * TAN_HALF)
    this.dist = Math.max(forWidth, forDepth)
    this.camera.far = this.dist * 2.6 + 60
    this.camera.near = Math.max(0.5, this.dist * 0.25)
    this.camera.updateProjectionMatrix()
  }

  /** Jump straight to the next `follow` target (a new zone, a teleport). */
  snap(): void {
    this.snapNext = true
  }

  /** Ease toward (x, z) on ground at height `y`, leading a little in the
   *  walking direction. The height eases slower than the ground plan does, so a
   *  bumpy path does not bob the view. */
  follow(x: number, z: number, vx: number, vz: number, dt: number, y = 0): void {
    const k = 1 - Math.exp(-dt * 3)
    this.leadX += (vx * 0.28 - this.leadX) * k
    this.leadZ += (vz * 0.28 - this.leadZ) * k
    const tx = x + this.leadX
    const tz = z + this.leadZ
    if (this.snapNext) {
      this.snapNext = false
      this.target.set(tx, y, tz)
      return
    }
    const f = 1 - Math.exp(-dt * 7)
    this.target.x += (tx - this.target.x) * f
    this.target.z += (tz - this.target.z) * f
    this.target.y += (y - this.target.y) * (1 - Math.exp(-dt * 3.5))
  }

  /** GDD: light hit +0.2, critical / explosion +0.6. Capped at 1. */
  addTrauma(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount)
  }

  /** Zoom to `to` over `dur` seconds, hold, and ease back. */
  punchZoom(to: number, dur = 0.12, hold = 0.25): void {
    this.zoomFrom = this.zoom
    this.zoomTo = to
    this.zoomT = 0
    this.zoomDur = dur
    this.zoomHold = hold
  }

  /** Real-time update (never slowed by hit-stop): shake, zoom, placement. */
  update(dt: number): void {
    if (this.zoomDur > 0) {
      this.zoomT += dt
      if (this.zoomT < this.zoomDur) {
        const k = this.zoomT / this.zoomDur
        this.zoom = this.zoomFrom + (this.zoomTo - this.zoomFrom) * (1 - (1 - k) * (1 - k))
      } else if (this.zoomT < this.zoomDur + this.zoomHold) {
        this.zoom = this.zoomTo
      } else {
        const k = Math.min(1, (this.zoomT - this.zoomDur - this.zoomHold) / 0.35)
        this.zoom = this.zoomTo + (1 - this.zoomTo) * k * k * (3 - 2 * k)
        if (k >= 1) { this.zoomDur = 0; this.zoom = 1 }
      }
    }
    this.trauma = Math.max(0, this.trauma - TRAUMA_DECAY * dt)
    const s = this.trauma * this.trauma * SHAKE_MAX
    const ox = s > 0 ? (Math.random() * 2 - 1) * s : 0
    const oy = s > 0 ? (Math.random() * 2 - 1) * s * 0.6 : 0
    const oz = s > 0 ? (Math.random() * 2 - 1) * s : 0
    const d = this.dist * this.zoom
    const c = this.camera
    c.position.set(this.target.x + ox, this.target.y + SIN_P * d + oy, this.target.z + COS_P * d + oz)
    c.lookAt(this.target.x + ox * 0.6, this.target.y + 0.6, this.target.z + oz * 0.6)
    c.updateMatrixWorld()
  }

  /** The view depth of the look-at point (the outline's reference depth). */
  get refDepth(): number {
    return this.dist * this.zoom
  }

  /**
   * Surface pixel → the point of the GROUND under it (`gfx/ground.ts`): the
   * ray is marched down through the band of heights near the view and the
   * first crossing is refined, so a tap on a hillside lands where the finger
   * is, and a tap on a ledge lands on the ledge, not on the ground behind it.
   * False when the ray misses.
   */
  screenToGround(sx: number, sy: number, out: { x: number; z: number }): boolean {
    const c = this.camera
    _dir.set((sx / this.width) * 2 - 1, -(sy / this.height) * 2 + 1, 0.5).unproject(c).sub(c.position)
    if (_dir.y > -1e-5) return false
    _dir.normalize()
    const ox = c.position.x
    const oy = c.position.y
    const oz = c.position.z
    // Where the ray meets the planes a few metres above and below the view's own height.
    const top = this.target.y + GROUND_BAND
    const bottom = this.target.y - GROUND_BAND
    let t0 = Math.max(0, (oy - top) / -_dir.y)
    const t1 = (oy - bottom) / -_dir.y
    const above = (t: number): number => oy + _dir.y * t - groundAt(ox + _dir.x * t, oz + _dir.z * t)
    let a0 = above(t0)
    let hit = -1
    for (let t = t0 + MARCH; t <= t1 + MARCH; t += MARCH) {
      const a = above(t)
      if (a <= 0) {
        // Crossed between t0 and t: halve the bracket a few times.
        let lo = t0
        let hi = t
        for (let k = 0; k < 8; k++) {
          const mid = (lo + hi) / 2
          if (above(mid) > 0) lo = mid
          else hi = mid
        }
        hit = (lo + hi) / 2
        break
      }
      t0 = t
      a0 = a
    }
    if (hit < 0) {
      // Past the band (off the land): the plane at the view's height.
      if (a0 > 0) hit = (oy - this.target.y) / -_dir.y
      else return false
    }
    out.x = ox + _dir.x * hit
    out.z = oz + _dir.z * hit
    return true
  }

  /** World point → surface pixels. Returns false behind the camera. */
  project(x: number, y: number, z: number, out: { x: number; y: number }): boolean {
    _proj.set(x, y, z).project(this.camera)
    out.x = (_proj.x * 0.5 + 0.5) * this.width
    out.y = (-_proj.y * 0.5 + 0.5) * this.height
    return _proj.z < 1
  }

  /** Pixels one metre covers at the look-at depth (for sizing DOM markers). */
  get pxPerMetre(): number {
    return this.height / (2 * TAN_HALF * this.dist * this.zoom)
  }
}
