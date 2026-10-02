/**
 * ─── Poses and clips ─────────────────────────────────────────────────────────
 *
 * A humanoid's pose is a flat array of CHANNELS (an angle, an offset, a face
 * value) rather than a set of bone quaternions: channels blend by plain
 * interpolation, an authored key pose is a handful of numbers, and the frame
 * code can layer breathing, a flinch or a walk cycle on top by adding to them.
 * `anim.ts` turns the final array into bone rotations.
 *
 * Sign conventions are the body's, not the bone's, so a pose reads the same
 * for both sides:
 *   aXx  shoulder swing: negative raises the arm forward and up (−π/2 is level)
 *   aXz  positive lifts the arm AWAY from the body, negative crosses the chest
 *   aXy  positive sweeps a raised arm forward (the turn of a horizontal cut)
 *   eX   elbow bend, 0 straight
 *   wR*  the weapon against the wrist (x: positive tips the blade forward)
 *   lXx  hip swing: negative puts the leg forward; lXz spreads the legs
 *   kX   knee bend, 0 straight; fX lifts the heel
 *   tor* / hip* turn the chest and the pelvis apart; head* is relative to the chest
 *   rootZ lunges the whole body along its heading (view only), pitch leans it
 *   brow −1 angry … +1 raised, lid 0 open … 1 shut, mouth 0 shut … 1 open
 */

export const CH = [
  'hipY', 'hipZ', 'hipRx', 'hipRy', 'hipRz', 'torRx', 'torRy', 'torRz', 'neckRx', 'headRx', 'headRy', 'headRz',
  'aLx', 'aLy', 'aLz', 'eL', 'hLx', 'hLy', 'hLz', 'aRx', 'aRy', 'aRz', 'eR', 'hRx', 'hRy', 'hRz',
  'wRx', 'wRy', 'wRz', 'oRx', 'oRy', 'oRz',
  'lLx', 'lLz', 'kL', 'fL', 'lRx', 'lRz', 'kR', 'fR',
  'rootZ', 'rootY', 'pitch', 'roll', 'spin', 'brow', 'lid', 'mouth'
] as const

export type Ch = (typeof CH)[number]
export const N = CH.length
/** Channel name → index. */
export const I = Object.fromEntries(CH.map((n, i) => [n, i])) as Record<Ch, number>

export type Pose = Float32Array
export type Spec = Partial<Record<Ch, number>>

/** A pose from `base` with the channels in `spec` moved toward their value by
 *  `gain` (1 = exactly the value, 1.1 = a tenth past it: a deeper hold). */
export const mk = (base: Pose | null, spec: Spec, gain = 1): Pose => {
  const p = new Float32Array(N)
  if (base) p.set(base)
  for (const k in spec) {
    const i = I[k as Ch]
    p[i] = p[i]! + (spec[k as Ch]! - p[i]!) * gain
  }
  return p
}

export type Ease = (k: number) => number
export const lin: Ease = k => k
export const easeOut: Ease = k => 1 - (1 - k) * (1 - k)
export const easeOut3: Ease = k => 1 - (1 - k) * (1 - k) * (1 - k)
export const easeIn: Ease = k => k * k
/** Slow, then all at once: the strike. */
export const snap: Ease = k => k * k * k
export const inOut: Ease = k => k * k * (3 - 2 * k)
/** Past the target and back: a settle with a little bounce. */
export const backOut: Ease = (k) => {
  const c = 1.9
  const t = k - 1
  return 1 + (c + 1) * t * t * t + c * t * t
}

export interface Key {
  /**
   * When, in the action's own time: [0, 1) is the wind-up BEFORE the strike
   * begins (scaled into however long this particular wind-up leaves for it),
   * exactly 1 is the instant the sim lands the hit, (1, 2] is after it.
   */
  at: number
  p: Pose
  /** How the pose is approached from the key before it. */
  e: Ease
}

export interface Clip {
  keys: Key[]
  /** Longest the strike itself may take, seconds (short wind-ups shorten it). */
  strike: number
  /** Least time the follow-through gets, seconds: it outlives a short action. */
  tail: number
  /** The weapon's trail: on from the start of the strike until this far after
   *  the hit (in follow units, 1..2), then faded by the second value. */
  trail: [number, number] | null
  /** The off hand cuts too (a dual-wielder's follow-up). */
  trailOff?: boolean
  /** A big blow: a heavier, longer trail and a squash on landing. */
  heavy: boolean
  /** The wind-up trembles with held strength (0 = none). */
  tense: number
  /** The body leaves the ground: height of the arc at its top, metres. */
  hop: number
}

const _a: Key = { at: 0, p: new Float32Array(N), e: lin }

/**
 * The clip at `s` (0..1 wind-up, 1..2 follow-through), written into `out`.
 * `S` is where the strike begins inside the wind-up (0..1): keys before the
 * hit are squeezed into [0, S], so the last of them leads straight into it.
 */
export const sample = (clip: Clip, s: number, S: number, out: Pose): void => {
  const ks = clip.keys
  let a = ks[0] ?? _a
  let ta = 0
  for (let i = 1; i < ks.length; i++) {
    const b = ks[i]!
    const tb = b.at < 1 ? b.at * S : b.at
    if (s <= tb || i === ks.length - 1) {
      const span = tb - ta
      const k = span <= 1e-5 ? 1 : Math.min(1, Math.max(0, (s - ta) / span))
      const e = b.e(k)
      const pa = a.p
      const pb = b.p
      for (let c = 0; c < N; c++) out[c] = pa[c]! + (pb[c]! - pa[c]!) * e
      return
    }
    a = b
    ta = tb
  }
  out.set(a.p)
}

export const lerpPose = (a: Pose, b: Pose, k: number, out: Pose): void => {
  for (let c = 0; c < N; c++) out[c] = a[c]! + (b[c]! - a[c]!) * k
}
