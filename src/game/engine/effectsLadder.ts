import { deviceClass } from '@/use/deviceProfile'
import { sceneQuality } from './quality'
import { setSceneryOutlines } from '../gfx/cel'

/**
 * ─── The effects ladder (outstanding question 43) ────────────────────────────
 *
 * The canvas always draws at the screen's own pixel ratio: a soft picture on a
 * 3× phone is a bug, not a saving. When a device cannot keep up, this ladder
 * gives up EFFECTS instead, one rung at a time, and climbs back when the
 * frames recover:
 *
 *   0  everything
 *   1  half the particles (bursts, sparks, trails' crumbs, dust)
 *   2  + no outlines on the scenery (rocks, trees, props: a second draw of
 *        every one of them; characters, loot and the field keep theirs)
 *   3  + no motes in the air (fireflies, embers, snow)
 *
 * It listens to the REAL frame interval (`engine/app.ts` feeds it the wall
 * clock, not the game step, which is clamped to 0.1 s): an average over ~22 ms
 * (under ~45 fps) held for 2 s steps down; under ~17.5 ms (60 fps with room)
 * held for 8 s steps up. `?fxlevel=0..3` pins it (QA, screenshots, A/B arms).
 *
 * Where it starts (#Perf1): a GPU the device profile names as weak (a PowerVR
 * Rogue GE83xx, a Mali-G57 MC2, `deviceProfile.ts`) starts on the LAST rung.
 * Measured on such a phone: 1–3 fps for the first 30 s. A ladder that has to
 * measure its way down from the top spends those seconds rendering what the
 * device cannot draw, and when it was fed the clamped game step it needed
 * 2 s of GAME time per rung, i.e. 20 frames, i.e. seven to twenty seconds a
 * rung at those rates. A weak guess climbs back after 8 s of fast frames, so a
 * wrongly listed GPU costs a few seconds of effects, not a session. A budget
 * phone with an unlisted GPU (`sceneQuality` low) starts on rung 1.
 */

export const FX_TOP = 3
const SLOW_MS = 22
const FAST_MS = 17.5
const DOWN_AFTER = 2
const UP_AFTER = 8

let level = 0
let pinned = false
let started = false
let avg = 16.7
let slowT = 0
let fastT = 0

const start = (): void => {
  if (started) return
  started = true
  let pin: string | null = null
  try { pin = new URLSearchParams(window.location.search).get('fxlevel') } catch { /* no window */ }
  const n = pin === null ? NaN : Number(pin)
  if (Number.isFinite(n)) {
    pinned = true
    setLevel(Math.max(0, Math.min(FX_TOP, Math.round(n))))
    return
  }
  let weakGpu = false
  let budget = false
  try { weakGpu = deviceClass() === 'weak'; budget = sceneQuality() === 'low' } catch { /* no WebGL to ask */ }
  setLevel(weakGpu ? FX_TOP : budget ? 1 : 0)
}

const setLevel = (l: number): void => {
  level = l
  setSceneryOutlines(l < 2)
}

/** The rung the effects are on now (0: everything). */
export const fxLevel = (): number => {
  start()
  return level
}

/** Feed it every rendered frame's real interval (seconds). A frame of up to a
 *  second counts (a device at 1–3 fps is exactly what this is for); a longer
 *  gap is a hidden tab or a pause, not a frame. */
export const stepEffectsLadder = (dt: number): void => {
  start()
  if (pinned || dt <= 0 || dt > 1) return
  avg += (dt * 1000 - avg) * 0.08
  if (avg > SLOW_MS) { slowT += dt; fastT = 0 } else if (avg < FAST_MS) { fastT += dt; slowT = 0 } else { slowT = 0; fastT = 0 }
  if (slowT > DOWN_AFTER && level < FX_TOP) { setLevel(level + 1); slowT = 0; avg = 16.7 }
  if (fastT > UP_AFTER && level > 0) { setLevel(level - 1); fastT = 0 }
}

/** Test seam: back to the start, nothing pinned. */
export const __resetEffectsLadder = (): void => {
  started = false
  pinned = false
  level = 0
  avg = 16.7
  slowT = 0
  fastT = 0
  setSceneryOutlines(true)
}
