import type { Sim } from '../sim/world'
import { findPath, smoothPath } from '../sim/grid'
import type { Particles } from '../gfx/particles'
import { groundAt } from '../gfx/ground'
import { onboard } from './state'
import { nudgeWorld } from './world'

/**
 * ─── The nudges drawn in the scene (roadmap #69) ─────────────────────────────
 *
 * Two of the nudges live in the 3-D world rather than on the HUD, and the zone
 * mode calls these from its frame:
 *
 *   crumbs  a pulse of gold sparkles that runs along the ground, the way the
 *           hero would walk, from his feet a dozen metres toward the next
 *           objective — light, short-lived, gone when the nudge ends;
 *   peek    the camera leans toward an unopened chest nearby and back, once a
 *           zone (an offset on the follow target, eased in and out).
 */

const way: number[] = []
const scratch: number[] = []
let wayAge = 1e9
let wayT = 0
let pulse = 0
/** How far along the way the sparkles reach (metres). */
const REACH = 13
/** A sparkle every this many metres of the pulse. */
const STEP = 0.75

/** Lay sparkles along the walked way while the crumbs nudge is up. */
export const emitCrumbs = (sim: Sim, ps: Particles, dt: number, low: boolean): void => {
  const n = onboard.nudge
  if (!n || n.kind !== 'crumbs' || !nudgeWorld.has) { wayAge = 1e9; return }
  const u = sim.hero.unit
  wayAge += dt
  if (wayAge > 0.6) {
    wayAge = 0
    way.length = 0
    if (findPath(sim.grid, u.x, u.z, nudgeWorld.x, nudgeWorld.z, scratch) > 0) {
      scratch.length = smoothPath(sim.grid, u.x, u.z, scratch)
      way.push(u.x, u.z, ...scratch)
    }
  }
  if (way.length < 4) return
  // A pulse runs out along the way every 1.4 s; each step a few sparkles
  // are dropped where its front is, so the trail draws itself and fades.
  wayT += dt
  const front = ((wayT % 1.4) / 1.4) * REACH
  const from = pulse
  pulse = front
  if (front < from) return
  const every = low ? STEP * 2 : STEP
  for (let d = Math.ceil(from / every) * every; d <= front; d += every) {
    if (d < 1.2) continue
    const at = pointAlong(d)
    if (!at) break
    ps.emit({
      x: at[0] + (Math.random() - 0.5) * 0.25, y: groundAt(at[0], at[1]) + 0.12, z: at[1] + (Math.random() - 0.5) * 0.25,
      vy: 0.45 + Math.random() * 0.3, color: Math.random() < 0.7 ? '#ffe066' : '#ffffff', size: 0.24, sizeEnd: 0.03, life: 0.9
    })
  }
}

const pt: [number, number] = [0, 0]
const pointAlong = (d: number): [number, number] | null => {
  let left = d
  for (let i = 2; i + 1 < way.length; i += 2) {
    const ax = way[i - 2]!
    const az = way[i - 1]!
    const bx = way[i]!
    const bz = way[i + 1]!
    const l = Math.hypot(bx - ax, bz - az)
    if (left <= l) {
      const k = l > 0 ? left / l : 0
      pt[0] = ax + (bx - ax) * k
      pt[1] = az + (bz - az) * k
      return pt
    }
    left -= l
  }
  return null
}

const off = { x: 0, z: 0 }
/** Metres the camera leans at most toward the chest. */
const PEEK_MAX = 4.5

/** The camera's lean this frame (added to its follow target). */
export const peekOffset = (dt: number, hx: number, hz: number): { x: number; z: number } => {
  const n = onboard.nudge
  let tx = 0
  let tz = 0
  if (n && n.kind === 'peek' && nudgeWorld.chest) {
    const dx = nudgeWorld.cx - hx
    const dz = nudgeWorld.cz - hz
    const l = Math.hypot(dx, dz) || 1
    const k = Math.min(PEEK_MAX, l * 0.6) / l
    tx = dx * k
    tz = dz * k
  }
  // Eased both ways: a lean, not a cut.
  const e = 1 - Math.exp(-dt * 3.2)
  off.x += (tx - off.x) * e
  off.z += (tz - off.z) * e
  return off
}

/** Test seam. */
export const resetNudgeFx = (): void => {
  way.length = 0
  wayAge = 1e9
  wayT = 0
  pulse = 0
  off.x = off.z = 0
}
