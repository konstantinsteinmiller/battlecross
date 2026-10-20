import { Group } from 'three'
import { setCelFlash, setCelOpacity, setCelTint } from '../cel'
import { INFERNAL_TINT } from '../corruption'
import { nudge, pose, scaleBone, type Rig } from '../kit'
import { ENEMY_BY_ID } from '../../data/enemies'
import { SKILL_BY_ID } from '../../data/skills'
import { findStatus, hasStatus } from '../../sim/world'
import type { Action, Unit } from '../../sim/types'
import { groundAt } from '../ground'
import { ABILITY_CAST, SKILL_CAST, castClip, type CastName } from './clips'
import { LID_FLAT, LID_OPEN } from './humanoid'
import { I, N, inOut, lerpPose, sample, snap, type Clip, type Pose } from './pose'
import type { RigView } from './index'
import { sampleLoop } from './townClips'
import { pickaxeMesh } from './handProps'

/**
 * ─── Animation ───────────────────────────────────────────────────────────────
 *
 * No clips on disk: every pose is computed from what the unit is doing in the
 * sim, so the art payload stays at zero and the animation stays honest — a
 * swing's hit frame IS the sim's hit time, and the blade connects exactly when
 * the number pops.
 *
 * What changed with the playtest pass (roadmap #38, decision D43): the pose is
 * no longer one of five buckets recomputed from nothing every frame. A
 * humanoid's frame is layered:
 *
 *   1. the stance its weapon is carried in (`clips.ts`), blended with a walk
 *      cycle by how fast it is moving;
 *   2. the CLIP of the action in hand: anticipation → hold → strike on the
 *      sim's hit time → follow-through → recovery, picked by weapon family
 *      for a basic attack and by skill / ability id for a cast;
 *   3. a short crossfade whenever the clip changes, so idle ↔ walk ↔ attack ↔
 *      hurt ease instead of popping;
 *   4. overlays that are added on top: breathing and weight shift at rest, a
 *      spring-driven recoil from a hit (away from the attacker), the wobble
 *      of a stun, a tremble in a held wind-up;
 *   5. secondary motion on springs: the cape, the hair, a plume, a tail;
 *   6. the face: brows, a blink on its own clock, a mouth that opens to shout.
 *
 * The sim's timings are never touched: it is all read-only on `Unit`.
 *
 * The GDD's squash and stretch (§2.3.4) still lives here:
 *   • idle: Y 1.0 → 1.05, X 1.0 → 0.97 over 1.2 s, ping-pong;
 *   • a cast or a landing: Y down to 0.8 in 0.08 s, then an elastic spring back.
 */

const TAU = Math.PI * 2
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)
const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v)
const easeOut = (k: number): number => 1 - (1 - k) * (1 - k)
const easeIn = (k: number): number => k * k
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k
const smooth = (lo: number, hi: number, v: number): number => {
  const k = clamp01((v - lo) / (hi - lo))
  return k * k * (3 - 2 * k)
}

/** Elastic-out: overshoots 1 and settles (the GDD names the easing). */
export const elasticOut = (k: number): number => {
  if (k <= 0) return 0
  if (k >= 1) return 1
  return Math.pow(2, -9 * k) * Math.sin(((k * 10 - 0.75) * TAU) / 3) + 1
}

/** GDD §2.3.4 squash: `depth` down in 0.08 s, elastic back over 0.42 s. */
export const squashCurve = (t: number, depth: number): number => {
  if (t < 0) return 1
  if (t < 0.08) return 1 - depth * (t / 0.08)
  const k = (t - 0.08) / 0.42
  if (k >= 1) return 1
  return 1 - depth + depth * elasticOut(k)
}

/** GDD §2.3.4 idle breath: 0..1..0 over 2.4 s. */
export const breath = (time: number): number => 0.5 - 0.5 * Math.cos((time * TAU) / 2.4)

export const squash = (v: RigView, depth = 0.2): void => {
  v.squashT = 0
  v.squashDepth = depth
}

const turn = (from: number, to: number, k: number): number => {
  let d = to - from
  while (d > Math.PI) d -= TAU
  while (d < -Math.PI) d += TAU
  return from + d * k
}

/** A damped spring on one value: `s[i]` is the value, `s[i + 1]` its speed. */
const spring = (s: Float32Array, i: number, target: number, stiff: number, damp: number, dt: number): number => {
  const h = Math.min(dt, 1 / 30)
  const v = s[i + 1]! + (-stiff * (s[i]! - target) - damp * s[i + 1]!) * h
  s[i + 1] = v
  s[i] = s[i]! + v * h
  return s[i]!
}

// Channel indices used below (see `pose.ts`).
const {
  hipY, hipZ, hipRx, hipRy, hipRz, torRx, torRy, torRz, neckRx, headRx, headRy, headRz,
  aLx, aLy, aLz, eL, hLx, hLy, hLz, aRx, aRy, aRz, eR, hRx, hRy, hRz, wRx, wRy, wRz, oRx, oRy, oRz,
  lLx, lLz, kL, fL, lRx, lRz, kR, fR, rootZ, rootY, pitch, roll, spin, brow, lid, mouth
} = I

// Spring slots (`RigView.sec`): value + speed each.
const S_CAPE = 0
const S_CAPE2 = 2
const S_HAIR = 4
const S_SWAY = 6
const S_HURT = 8
const S_TAIL = 10

const T = new Float32Array(N)
const W = new Float32Array(N)
const O = new Float32Array(N)

/** A trail's strength at clip time `s`: on from the strike's start `S`, full until `t0`, gone by `t1`. */
const win = (s: number, S: number, t0: number, t1: number): number =>
  s < S ? 0 : s <= t0 ? 1 : 1 - clamp01((s - t0) / Math.max(0.01, t1 - t0))

// ─── Clips ───────────────────────────────────────────────────────────────────

/** Which clip an action plays. A basic attack takes the next of its style's
 *  set; a cast is looked up by the hero's skill id or the enemy's ability. */
const clipOf = (v: RigView, u: Unit, a: Action): Clip => {
  const set = v.set
  if (a.id === 'attack') return set.attacks[v.combo % set.attacks.length]!
  // Opening a chest (`sim/interact.ts`), mining an outcrop (`sim/ores.ts`).
  if (a.id === 'open') return castClip(set, 'open')
  if (a.id === 'mine') return castClip(set, 'mine')
  // A capstone (afterplay §2.3) is cast like the signature skill it raises.
  let name: CastName | undefined = SKILL_CAST[a.id] ?? SKILL_CAST[SKILL_BY_ID[a.id]?.capstone ?? '']
  if (!name) {
    name = ABILITY_CAST[a.id]
    // A cone of fire or frost is breathed, not swung; so is anything a caster cones.
    if (a.id === 'cone') {
      const def = ENEMY_BY_ID[u.kind]?.abilities[a.ability]
      if (def?.fx === 'breath' || set.style === 'caster' || set.style === 'wand' || set.style === 'staff') name = 'breath'
    }
    // An archer's volley is its own shot; a gunner's too.
    if ((a.id === 'shot' || a.id === 'volley') && (set.style === 'bow' || set.style === 'gun' || set.style === 'sling' || set.style === 'cannon')) return set.attacks[0]!
    // Unarmed monsters hit with what they have.
    if (a.id === 'blink' && set.style !== 'heavy' && set.style !== 'great') return set.attacks[0]!
  }
  if (!name) name = u.animStyle === 2 ? 'burst' : u.animStyle === 3 ? 'charge' : u.animStyle === 0 ? 'strike' : 'beam'
  return castClip(set, name)
}

const beginClip = (v: RigView, u: Unit, a: Action): void => {
  if (a.id === 'attack') v.combo++
  const c = clipOf(v, u, a)
  v.clip = c
  v.clipSrc = a
  // The strike takes at most `c.strike` seconds, and never more than the back
  // 45 % of a short wind-up; everything before it is anticipation.
  const hitAt = Math.max(0.02, a.hitAt)
  v.clipS = 1 - Math.min(0.45, c.strike / hitAt)
  v.clipAfter = -1
  v.clipFollow = Math.max(a.end - a.hitAt, c.tail)
  v.hopFrom = 1
}

const endClip = (v: RigView): void => {
  v.clip = null
  v.clipSrc = null
}

/** Where in its clip the unit is: 0..1 wind-up, 1..2 follow-through, −1 none. */
const clipTime = (v: RigView, u: Unit, dt: number, moving: boolean): number => {
  const c = v.clip
  if (!c) return -1
  const a = u.action
  if (a && a === v.clipSrc) {
    if (a.t < a.hitAt) return clamp01(a.t / Math.max(0.01, a.hitAt)) * 0.9999
    v.clipAfter = a.t - a.hitAt
    return 1 + Math.min(1, v.clipAfter / v.clipFollow)
  }
  // The sim has let go of it. A swing dropped in its wind-up is simply over;
  // one that landed plays out its follow-through unless he walks off.
  if (v.clipAfter < 0 || moving || !u.alive) { endClip(v); return -1 }
  v.clipAfter += dt
  if (v.clipAfter >= v.clipFollow) { endClip(v); return -1 }
  return 1 + v.clipAfter / v.clipFollow
}

// ─── The humanoid ────────────────────────────────────────────────────────────

const walkPose = (v: RigView, speed: number, out: Pose): void => {
  const st = v.set.stance
  out.set(st)
  const amp = Math.min(1, speed / 3.2) * v.stride
  const s = Math.sin(v.phase)
  const c = Math.cos(v.phase)
  out[lLx] = -0.72 * amp * s
  out[lRx] = 0.72 * amp * s
  // The knee folds while its leg swings forward.
  out[kL] = 0.12 + 0.95 * amp * Math.max(0, c)
  out[kR] = 0.12 + 0.95 * amp * Math.max(0, -c)
  // Toe-off behind.
  out[fL] = 0.45 * amp * Math.max(0, -s)
  out[fR] = 0.45 * amp * Math.max(0, s)
  out[lLz] = 0.04
  out[lRz] = 0.04
  const twoHands = v.set.style === 'great' || v.set.style === 'cannon' || v.set.style === 'scythe'
  const armed = v.held !== 'none'
  if (!twoHands) {
    if (!v.set.shield) {
      out[aLx] = st[aLx]! * 0.4 + 0.6 * amp * s
      out[eL] = 0.5 + 0.3 * amp * Math.max(0, -s)
    }
    out[aRx] = st[aRx]! * (armed ? 1 : 0.4) - 0.6 * amp * s * (armed ? 0.3 : 1)
    if (!armed) out[eR] = 0.5 + 0.3 * amp * Math.max(0, s)
  }
  out[torRy] = st[torRy]! * 0.5 + 0.16 * amp * s
  out[hipRy] = -0.12 * amp * s
  out[headRy] = -out[torRy]! * 0.7
  out[torRx] = 0.07 * amp
  out[pitch] = 0.1 * amp
  out[hipRz] = 0.04 * amp * c
}

const humanoid = (v: RigView, u: Unit, time: number, dt: number, speed: number): void => {
  const r = v.rig
  const set = v.set
  const a = u.action
  if (a !== v.lastAction) {
    v.lastAction = a
    if (a) beginClip(v, u, a)
  }
  const moving = u.anim === 'walk' && speed > 0.3
  const s = clipTime(v, u, dt, moving && !a)
  const clip = v.clip
  v.walkK += ((moving && s < 0 ? 1 : 0) - v.walkK) * Math.min(1, dt * 12)

  // ── 1–2. Stance, walk, clip ──
  if (clip && s >= 0) {
    sample(clip, s, v.clipS, T)
  } else {
    // A townsperson at work plays their loop in place of the plain stance (`townClips.ts`).
    if (v.loop) sampleLoop(v.loop, v.loopT, T)
    else T.set(set.stance)
    if (v.walkK > 0.01) {
      walkPose(v, speed, W)
      lerpPose(T, W, v.walkK, T)
    }
  }

  // ── 3. Crossfade when the clip changes ──
  const blendKey = clip ?? v.loop ?? null
  if (blendKey !== v.blendKey) {
    const outOf = (v.blendKey as { blendOut?: number } | null)?.blendOut
    v.blendKey = blendKey
    v.from.set(v.pose)
    // Whole turns are not unwound (a whirl, a sling's wind-up).
    v.from[spin] = v.from[spin]! - Math.round(v.from[spin]! / TAU) * TAU
    v.from[wRx] = v.from[wRx]! - Math.round(v.from[wRx]! / TAU) * TAU
    // ...nor is the dodge roll's somersault: it ends a full turn on and must not unwind.
    v.from[pitch] = v.from[pitch]! - Math.round(v.from[pitch]! / TAU) * TAU
    v.blendT = 0
    v.blendDur = clip && a ? Math.max(clip.blendIn ?? 0, Math.min(0.07, a.hitAt * 0.4)) : v.loop ? 0.32 : outOf ?? 0.18
    // Out of a clip with its own recovery (the roll's landing, #139) into a
    // swing: the recovery still plays, as far as the wind-up leaves room for it.
    if (clip && a && outOf) v.blendDur = Math.max(v.blendDur, Math.min(outOf, a.hitAt * 0.6))
  }
  if (v.blendT < v.blendDur) {
    v.blendT += dt
    lerpPose(v.from, T, inOut(clamp01(v.blendT / v.blendDur)), v.pose)
  } else v.pose.set(T)

  // ── The trail the weapon leaves, and the leap ──
  let trail = 0
  let trailOff = 0
  v.hopY = 0
  v.leapK = 0
  if (clip && s >= 0) {
    // A leap's strike is mostly flight: its trail is the last of the way down.
    const S = clip.hop > 0.5 ? Math.max(v.clipS, 0.86) : v.clipS
    if (clip.trail) trail = win(s, S, clip.trail[0], clip.trail[1])
    if (clip.trailOff) {
      const w = clip.trail ?? [1.1, 1.28]
      // A dual-wielder's follow-up cuts a beat after the main hand.
      trailOff = set.dual && set.style === 'dagger' && clip.trail ? (s < 1.2 ? 0 : s <= 1.4 ? 1 : 1 - clamp01((s - 1.4) / 0.18)) : win(s, S, w[0]!, w[1]!)
    }
    if (clip.hop > 0 && s < 1) {
      // Off the ground through the back half of the wind-up, down on the hit.
      const from = Math.min(S, 0.62)
      const k = clamp01((s - from) / (1 - from))
      v.hopY = clip.hop * Math.sin(k * Math.PI) * (1 - 0.25 * k)
      v.leapK = k * k * (3 - 2 * k)
    }
    // The blow lands: the heavy ones flatten him for a beat.
    if (s >= 1 && v.hopFrom < 1 && clip.heavy) squash(v, 0.16)
    v.hopFrom = s
  }
  v.trail = trail
  v.trailOff = trailOff
  v.trailHeavy = !!clip?.heavy

  // ── 4. Overlays ──
  O.set(v.pose)
  const t = time + v.phase
  const rest = (1 - v.walkK) * (s < 0 ? 1 : 0.2)
  if (rest > 0.01) {
    // Breathing, a slow shift of weight from foot to foot, a look around.
    const br = Math.sin(t * 2.6)
    const ws = Math.sin(t * 0.7) + 0.4 * Math.sin(t * 1.9 + 1)
    O[torRx] = O[torRx]! + 0.022 * br * rest
    O[aLz] = O[aLz]! + 0.02 * br * rest
    O[aRz] = O[aRz]! + 0.02 * br * rest
    O[hipRz] = O[hipRz]! + 0.045 * ws * rest
    O[torRz] = O[torRz]! - 0.03 * ws * rest
    O[headRz] = O[headRz]! - 0.02 * ws * rest
    O[lLz] = O[lLz]! + 0.02 * ws * rest
    O[lRz] = O[lRz]! - 0.02 * ws * rest
    O[headRy] = O[headRy]! + 0.14 * Math.sin(t * 0.53) * Math.sin(t * 0.31) * rest
    O[headRx] = O[headRx]! + 0.03 * Math.sin(t * 0.9) * rest
    O[wRx] = O[wRx]! + 0.04 * Math.sin(t * 1.3) * rest
    O[oRx] = O[oRx]! + 0.03 * Math.sin(t * 1.1 + 2) * rest
  }
  if (clip && s >= 0 && s < 1 && clip.tense > 0) {
    // Held strength shakes: more the closer the release.
    const k = smooth(v.clipS * 0.45, v.clipS, s) * clip.tense
    const sh = Math.sin(time * 47 + v.phase) * 0.018 * k
    O[torRz] = O[torRz]! + sh
    O[aRz] = O[aRz]! + sh * 1.6
    O[aLz] = O[aLz]! - sh * 1.6
    O[wRz] = O[wRz]! + sh * 2
    O[headRz] = O[headRz]! - sh * 0.7
  }

  // A hit rocks the body away from whoever dealt it, on a spring.
  if (u.flinch > v.lastFlinch + 0.3) v.sec[S_HURT + 1] = v.sec[S_HURT + 1]! + 9
  v.lastFlinch = u.flinch
  const h = spring(v.sec, S_HURT, 0, 150, 13, dt)
  let hurtPitch = 0
  let hurtRoll = 0
  if (Math.abs(h) > 0.004) {
    const rel = v.hitYaw - v.yaw
    hurtPitch = Math.cos(rel) * 0.3 * h
    hurtRoll = -Math.sin(rel) * 0.26 * h
    O[torRx] = O[torRx]! + hurtPitch * 0.9
    O[headRx] = O[headRx]! + hurtPitch * 1.1
    O[torRz] = O[torRz]! + hurtRoll * 0.6
    O[aLz] = O[aLz]! + Math.abs(h) * 0.35
    O[aRz] = O[aRz]! + Math.abs(h) * 0.35
    O[rootZ] = O[rootZ]! + Math.cos(rel) * 0.07 * h
  }
  const pained = u.flinch > 0.35 || h > 0.3
  if (pained) {
    O[lid] = 1
    O[mouth] = Math.max(O[mouth]!, 0.7)
    O[brow] = 0.7
  }

  // Stunned, confused, afraid: derived here from the statuses (enemies never
  // get an animation state for them from the sim).
  const dazed = v.dazed
  if (dazed > 0.01) {
    const w = Math.sin(time * 4.2 + v.phase)
    const w2 = Math.cos(time * 4.2 + v.phase)
    O[headRz] = O[headRz]! + 0.34 * w * dazed
    O[headRx] = O[headRx]! + (0.22 + 0.12 * w2) * dazed
    O[torRz] = O[torRz]! + 0.12 * w * dazed
    O[torRx] = O[torRx]! + 0.16 * dazed
    O[aLx] = lerp(O[aLx]!, 0.1, dazed * 0.8)
    O[aRx] = lerp(O[aRx]!, 0.1, dazed * 0.8)
    O[eL] = lerp(O[eL]!, 0.25, dazed * 0.8)
    O[eR] = lerp(O[eR]!, 0.25, dazed * 0.8)
    O[wRx] = lerp(O[wRx]!, 0.9, dazed * 0.7)
    O[kL] = O[kL]! + 0.35 * dazed
    O[kR] = O[kR]! + 0.35 * dazed
    O[lLx] = O[lLx]! - 0.18 * dazed
    O[lRx] = O[lRx]! - 0.18 * dazed
    O[lid] = Math.max(O[lid]!, 0.62 * dazed)
    O[mouth] = Math.max(O[mouth]!, 0.45 * dazed)
    O[brow] = lerp(O[brow]!, 0.8, dazed)
    O[roll] = O[roll]! + 0.09 * w * dazed
    O[pitch] = O[pitch]! + 0.05 * w2 * dazed
  }
  if (v.scared > 0.01) {
    // Cowering: shoulders up, arms over the head, knees soft.
    const k = v.scared
    O[torRx] = O[torRx]! + 0.3 * k
    O[headRx] = O[headRx]! + 0.25 * k
    O[aLx] = lerp(O[aLx]!, -2.3, k)
    O[aRx] = lerp(O[aRx]!, -2.3, k)
    O[eL] = lerp(O[eL]!, 1.8, k)
    O[eR] = lerp(O[eR]!, 1.8, k)
    O[brow] = lerp(O[brow]!, 1, k)
    O[mouth] = Math.max(O[mouth]!, 0.8 * k)
  }
  // Off the ground with no say in it: limbs trail.
  if (v.air > 0.01) {
    const k = v.air
    O[aLx] = lerp(O[aLx]!, -2.6, k)
    O[aRx] = lerp(O[aRx]!, -2.4, k)
    O[aLz] = lerp(O[aLz]!, 0.7, k)
    O[aRz] = lerp(O[aRz]!, 0.7, k)
    O[lLx] = lerp(O[lLx]!, -0.5 + 0.3 * Math.sin(time * 11), k)
    O[lRx] = lerp(O[lRx]!, 0.3 - 0.3 * Math.sin(time * 11), k)
    O[kL] = lerp(O[kL]!, 0.9, k)
    O[kR] = lerp(O[kR]!, 0.6, k)
    O[mouth] = Math.max(O[mouth]!, k)
    O[brow] = lerp(O[brow]!, 1, k)
  }
  // On its back: arms thrown wide.
  if (v.down > 0.01) {
    const k = v.down
    O[aLz] = lerp(O[aLz]!, 1.2, k)
    O[aRz] = lerp(O[aRz]!, 1.2, k)
    O[aLx] = lerp(O[aLx]!, -0.3, k)
    O[aRx] = lerp(O[aRx]!, -0.3, k)
    O[eL] = lerp(O[eL]!, 0.3, k)
    O[eR] = lerp(O[eR]!, 0.3, k)
    O[lLz] = lerp(O[lLz]!, 0.3, k)
    O[lRz] = lerp(O[lRz]!, 0.3, k)
    O[lid] = Math.max(O[lid]!, k)
  }

  // ── 6. The face: a blink on its own clock ──
  v.blinkT -= dt
  if (v.blinkT <= 0) v.blinkT = 1.8 + Math.random() * 3.6
  if (v.blinkT < 0.13) O[lid] = Math.max(O[lid]!, Math.sin((v.blinkT / 0.13) * Math.PI))
  apply(v, r, O)

  // ── 5. Secondary motion ──
  const lunge = dt > 1e-4 ? (O[rootZ]! - v.lastRootZ) / dt : 0
  v.lastRootZ = O[rootZ]!
  const fwd = clamp(v.fwd + lunge * v.scale, -6, 9)
  const lean = O[pitch]! + O[torRx]! + hurtPitch
  const cape = spring(v.sec, S_CAPE, clamp(0.1 + 0.1 * fwd - lean * 0.8, 0.03, 1.25), 46, 6.5, dt)
  const cape2 = spring(v.sec, S_CAPE2, clamp((cape - 0.1) * 0.55 + 0.05 * fwd, -0.4, 0.9), 30, 4.6, dt)
  const sway = spring(v.sec, S_SWAY, clamp(-v.yawRate * 0.05 - O[torRy]! * 0.25, -0.45, 0.45), 40, 6, dt)
  const hair = spring(v.sec, S_HAIR, clamp(0.07 * fwd - (O[headRx]! + lean) * 0.6, -0.5, 0.9), 70, 7, dt)
  pose(r, 'cape', cape, 0, sway)
  pose(r, 'cape2', cape2, 0, sway * 0.8)
  pose(r, 'hairB', hair, 0, sway * 0.7)
  pose(r, 'hairF', -hair * 0.5, 0, -sway * 0.5)
  // Wings beat, tails flick, a naga's coil sways.
  const flap = Math.sin(time * 6 + v.phase)
  pose(r, 'wingL', 0, -0.35 - flap * 0.25 - trail * 0.3, 0)
  pose(r, 'wingR', 0, 0.35 + flap * 0.25 + trail * 0.3, 0)
  const tail = spring(v.sec, S_TAIL, clamp(0.08 * fwd, -0.3, 0.6), 36, 5, dt)
  pose(r, 'tail', Math.sin(time * 3 + v.phase) * 0.2 + tail, Math.sin(time * 2.3) * 0.4 + sway, 0)
  const coil = Math.sin(time * 2.4 + v.phase) * (moving ? 0.5 : 0.22)
  pose(r, 'tail1', 0, coil, 0)
  pose(r, 'tail2', 0, -coil * 1.3, 0)
  pose(r, 'tail3', 0, coil * 1.5, 0)

  v.rootZ = O[rootZ]!
  v.rootY = O[rootY]!
  v.pitch = O[pitch]!
  v.roll = O[roll]! + hurtRoll
  v.spin = O[spin]!
}

/** Channels → bones. The feet are grounded here: the hips drop by however
 *  much the lower of the two feet has been lifted by the leg angles. */
const apply = (v: RigView, r: Rig, P: Pose): void => {
  let drop = 0
  if (v.l1 > 0) {
    const liftL = v.l1 * (1 - Math.cos(P[lLx]!) * Math.cos(P[lLz]!)) + v.l2 * (1 - Math.cos(P[lLx]! + P[kL]!))
    const liftR = v.l1 * (1 - Math.cos(P[lRx]!) * Math.cos(P[lRz]!)) + v.l2 * (1 - Math.cos(P[lRx]! + P[kR]!))
    drop = Math.min(liftL, liftR)
  }
  pose(r, 'hips', P[hipRx], P[hipRy], P[hipRz])
  nudge(r, 'hips', 0, P[hipY]! - drop, P[hipZ])
  pose(r, 'torso', P[torRx], P[torRy], P[torRz])
  if (v.neck) {
    pose(r, 'neck', P[neckRx]! + P[headRx]! * 0.4, P[headRy]! * 0.4, 0)
    pose(r, 'head', P[headRx]! * 0.6, P[headRy]! * 0.6, P[headRz])
  } else pose(r, 'head', P[headRx], P[headRy], P[headRz])
  // No elbow on this rig (a golem, a treant): half the bend goes to the shoulder.
  const fe = v.fore ? 0 : 0.5
  pose(r, 'armL', P[aLx]! - P[eL]! * fe, P[aLy], -P[aLz]!)
  pose(r, 'armR', P[aRx]! - P[eR]! * fe, -P[aRy]!, P[aRz])
  pose(r, 'foreL', -P[eL]!, 0, 0)
  pose(r, 'foreR', -P[eR]!, 0, 0)
  pose(r, 'handL', P[hLx], P[hLy], -P[hLz]!)
  pose(r, 'handR', P[hRx], -P[hRy]!, P[hRz])
  pose(r, 'weapon', P[wRx], P[wRy], P[wRz])
  pose(r, 'offhand', P[oRx], P[oRy], P[oRz])
  pose(r, 'legL', P[lLx], 0, -P[lLz]!)
  pose(r, 'legR', P[lRx], 0, P[lRz])
  pose(r, 'shinL', P[kL], 0, 0)
  pose(r, 'shinR', P[kR], 0, 0)
  // Soles flat on the ground whatever the leg is doing, plus the heel's lift.
  pose(r, 'footL', -(P[lLx]! + P[kL]!) * 0.9 + P[fL]!, 0, 0)
  pose(r, 'footR', -(P[lRx]! + P[kR]!) * 0.9 + P[fR]!, 0, 0)
  if (v.face) {
    const b = P[brow]!
    pose(r, 'browL', 0, 0, b * 0.42)
    pose(r, 'browR', 0, 0, -b * 0.42)
    nudge(r, 'browL', 0, b * 0.02, 0)
    nudge(r, 'browR', 0, b * 0.02, 0)
    const l = clamp01(P[lid]!)
    scaleBone(r, 'lids', 1, LID_OPEN + (1 - LID_OPEN) * l, LID_FLAT + (1 - LID_FLAT) * l)
    const m = clamp01(P[mouth]!)
    if (v.jaw) nudge(r, 'mouth', 0, -m * 0.045, 0)
    else scaleBone(r, 'mouth', 1 - 0.2 * m, v.mouthRest + (1.55 - v.mouthRest) * m, 1)
  }
}

// ─── Creatures ───────────────────────────────────────────────────────────────

interface Beats { on: boolean; coil: number; hit: number; out: number; hold: number }
const beats: Beats = { on: false, coil: 0, hit: 0, out: 0, hold: 0 }

/**
 * A creature's attack as three numbers: `coil` 0..1 is the anticipation (drawn
 * back, held), `hit` 0..1 snaps to 1 exactly on the sim's hit time and
 * overshoots a little after it, `out` 0..1 is the way back to rest.
 */
const beatsOf = (u: Unit, strike = 0.1): Beats => {
  const a = u.action
  const b = beats
  if (!a) { b.on = false; b.coil = b.hit = b.out = b.hold = 0; return b }
  b.on = true
  const hitAt = Math.max(0.02, a.hitAt)
  const S = 1 - Math.min(0.45, strike / hitAt)
  if (a.t < a.hitAt) {
    const w = a.t / hitAt
    b.coil = easeOut(clamp01(w / (S * 0.7)))
    b.hold = smooth(S * 0.5, S, w)
    b.hit = w > S ? snap((w - S) / (1 - S)) : 0
    b.out = 0
  } else {
    const f = clamp01((a.t - a.hitAt) / Math.max(0.05, a.end - a.hitAt))
    b.coil = 1
    b.hold = 0
    b.hit = 1 + 0.22 * Math.sin(clamp01(f / 0.3) * Math.PI)
    b.out = inOut(clamp01((f - 0.32) / 0.68))
  }
  return b
}
/** Rest → coiled → struck → rest, for one channel. */
const beat = (b: Beats, coiled: number, struck: number): number => (coiled * b.coil * (1 - Math.min(1, b.hit)) + struck * b.hit) * (1 - b.out)

const beast = (v: RigView, u: Unit, time: number, speed: number): void => {
  const r = v.rig
  const walking = u.anim === 'walk' && speed > 0.3
  const amp = walking ? Math.min(1, speed / 3) : 0
  const s = Math.sin(v.phase)
  const big = v.family === 'dragon' || v.family === 'wyvern'
  const a = u.action
  const b = beatsOf(u, big ? 0.13 : 0.09)
  const kind = a ? a.id : ''
  // A breath is held open; a slam or a leap comes down from above.
  const breathing = b.on && kind === 'cone'
  const slam = b.on && (kind === 'slam' || kind === 'leap' || kind === 'smash' || kind === 'barrage')
  const roar = b.on && (kind === 'enrage' || kind === 'summon' || kind === 'heal')

  let bodyX = Math.cos(v.phase * 2) * 0.06 * amp + Math.sin(time * 1.3 + v.phase) * 0.015
  let bodyZ = 0
  let bodyY = Math.abs(s) * 0.05 * amp
  let headX = Math.sin(time * 1.8 + v.phase) * 0.06
  let fl = s * 0.9 * amp
  let bl = 0
  let lift = 0
  if (b.on) {
    if (slam || roar) {
      // Up on the hind legs, then the whole weight down.
      bodyX += beat(b, -0.5, 0.22)
      bodyY += beat(b, 0.16, -0.08)
      headX += beat(b, -0.35, 0.4)
      fl += beat(b, -0.9, 0.35)
      bl += beat(b, 0.35, 0.1)
      lift = roar ? 0 : b.hold * 0.5
    } else if (breathing) {
      bodyX += beat(b, -0.22, 0.2)
      bodyZ += beat(b, -0.2, 0.25)
      headX += beat(b, -0.55, 0.3)
    } else {
      // The bite: haunches down and back, then the whole body behind the jaws.
      bodyX += beat(b, 0.26, -0.3)
      bodyZ += beat(b, -0.24, 0.5)
      bodyY += beat(b, -0.07, 0.04)
      headX += beat(b, -0.5, 0.45)
      fl += beat(b, 0.45, -0.75)
      bl += beat(b, -0.45, 0.6)
    }
    // Held strength shakes.
    bodyZ += Math.sin(time * 44) * 0.012 * b.hold
  }
  if (u.flinch > 0) headX -= 0.35 * u.flinch
  if (v.dazed > 0.01) {
    headX += (0.3 + 0.1 * Math.sin(time * 4)) * v.dazed
    bodyY -= 0.08 * v.dazed
  }
  const headZ = v.dazed > 0.01 ? Math.sin(time * 4.2 + v.phase) * 0.35 * v.dazed : 0
  // Walking: diagonal pairs. Striking: the front pair reaches, the back pair drives.
  pose(r, 'legFL', fl, 0, 0)
  pose(r, 'legFR', b.on ? fl : -fl, 0, 0)
  pose(r, 'legBL', b.on ? bl : -fl, 0, 0)
  pose(r, 'legBR', b.on ? bl : fl, 0, 0)
  pose(r, 'body', bodyX, 0, 0)
  nudge(r, 'body', 0, bodyY, bodyZ)
  pose(r, 'head', headX, 0, headZ)
  // The jaw (where a rig has one): wide on the coil of a bite and snapped shut on it,
  // held open through a breath or a roar, at rest just parted.
  const jaw = breathing ? beat(b, 0.35, 0.62) : roar || slam ? beat(b, 0.55, 0.3) : b.on ? beat(b, 0.6, 0.02) : 0.05 + Math.sin(time * 1.1 + v.phase) * 0.025
  pose(r, 'jaw', jaw, 0, 0)
  pose(r, 'tail', -0.3 + Math.sin(time * 5) * 0.1 - beat(b, 0.5, -0.3), Math.sin(time * 6 + v.phase) * 0.5 * (1 - b.hold), 0)
  // The dragon shares these bones for its neck, wings and second tail.
  pose(r, 'neck', -headX * 0.5 + Math.sin(time * 1.4) * 0.05 + (breathing ? beat(b, -0.4, 0.3) : 0), Math.sin(time * 0.9) * 0.08, 0)
  const flap = Math.sin(time * (v.float > 0 ? 8 : 2.2) + v.phase)
  const raise = b.on ? beat(b, 0.7, slam ? -0.25 : 0.2) + lift * 0.3 : 0
  pose(r, 'wingL', 0, 0, -0.2 - flap * (v.float > 0 ? 0.55 : 0.12) - raise)
  pose(r, 'wingR', 0, 0, 0.2 + flap * (v.float > 0 ? 0.55 : 0.12) + raise)
  pose(r, 'tail1', 0, Math.sin(time * 1.6) * 0.25, 0)
  pose(r, 'tail2', 0, Math.sin(time * 1.6 - 0.8) * 0.4, 0)
  pose(r, 'legL', Math.sin(time * 3) * 0.1, 0, 0)
  pose(r, 'legR', -Math.sin(time * 3) * 0.1, 0, 0)

  v.rootZ = b.on && !slam && !roar && !breathing ? beat(b, -0.12, 0.34) : 0
  v.hopY = 0
  v.leapK = 0
  if (b.on && kind === 'leap' && a && a.t < a.hitAt) {
    const k = clamp01((a.t / a.hitAt - 0.45) / 0.55)
    v.hopY = 1.6 * Math.sin(k * Math.PI) * (1 - 0.25 * k)
    v.leapK = k * k * (3 - 2 * k)
  }
  v.pitch = 0
  v.roll = v.dazed > 0.01 ? Math.sin(time * 4.2) * 0.08 * v.dazed : 0
  v.trail = b.on && !roar && !breathing && b.hit > 0 && b.out < 0.25 ? 1 - b.out * 4 : 0
  v.trailOff = 0
  v.trailHeavy = big || u.s.atkHeavy
  if (b.on && b.hit >= 1 && v.hopFrom < 1 && (slam || big)) squash(v, 0.14)
  v.hopFrom = b.on ? Math.min(1, b.hit) : 0
}

// ─── The dragon (#74) ───────────────────────────────────────────────────────
//
// Its own performance, not the wolf's: a body of chains (a neck of two, a tail
// of three, legs of shoulder or thigh, shin and foot) driven the way an animal
// moves, every channel eased by a spring so nothing snaps:
//
//   walk     a four-beat gait (hind, fore, hind, fore): a leg lifts, folds at
//            the knee and swings through, the foot stays flat; the body dips
//            on each footfall and rolls over the planted shoulder; the head is
//            held steady against it; a wave runs down the tail, and the tail
//            swings out wide on a turn
//   idle     it breathes (the chest rises, the neck lifts, the jaw parts on
//            the breath out), looks about slowly, the wings settle
//   bite     the neck draws back in an S with the jaw wide, then strikes
//            through, snaps shut, and the body follows the head
//   breath   it rears and draws breath (wings lift, chest swells), thrusts
//            the head down at the ground and sweeps it across the cone
//   stomp    it rears onto its hind legs, forelegs up and folded, wings flung
//            wide, then comes down with its whole weight, forelegs planted,
//            wings beating down, and the body rocks back up as it settles
//   charge   head low, horns first, wings folded tight, a fast gallop
//   roar     (meteors, a summons, rage) up on its haunches, wings spread,
//            head thrown back, jaw wide, the whole body shaking with it

interface DragonState { last: number; turn: number; ch: Record<string, number> }
const dragonStates = new WeakMap<RigView, DragonState>()

/** Ease channel `k` of `st` toward `to` at `rate` per second (a critically damped feel). */
const ease = (st: DragonState, k: string, to: number, rate: number, dt: number): number => {
  const cur = st.ch[k] ?? to
  const v = cur + (to - cur) * (1 - Math.exp(-rate * dt))
  st.ch[k] = v
  return v
}

/** The four legs: name suffix, front?, and where in the gait cycle (0..1) each lifts. */
const DRAGON_LEGS = [['BL', false, 0], ['FL', true, 0.25], ['BR', false, 0.5], ['FR', true, 0.75]] as const

const dragon = (v: RigView, u: Unit, time: number, speed: number): void => {
  const r = v.rig
  let st = dragonStates.get(v)
  if (!st) { st = { last: time, turn: 0, ch: {} }; dragonStates.set(v, st) }
  const dt = clamp(time - st.last, 0, 0.1)
  st.last = time
  const walking = u.anim === 'walk' && speed > 0.3
  const a = u.action
  const kind = a ? a.id : ''
  const b = beatsOf(u, 0.16)
  const breathing = b.on && kind === 'cone'
  const stomp = b.on && (kind === 'slam' || kind === 'smash' || kind === 'leap')
  const roar = b.on && (kind === 'enrage' || kind === 'summon' || kind === 'heal' || kind === 'barrage')
  const charge = b.on && kind === 'charge'
  const bite = b.on && !breathing && !stomp && !roar && !charge
  const amp = ease(st, 'amp', walking || charge ? Math.min(1.25, speed / 3) : 0, 6, dt)
  const ph = v.phase * 0.5
  const cyc = ph / TAU
  // A turn swings the tail out the other way, and the neck leads into it.
  st.turn += (v.yawRate - st.turn) * (1 - Math.exp(-4 * dt))

  // ── The breath, and a slow look about ──
  const br = Math.sin(time * 1.9 + v.phase)
  const lookY = Math.sin(time * 0.37 + v.phase * 3) * 0.28 + Math.sin(time * 0.91) * 0.08

  // ── Targets: rest, then the gait, then the action on top ──
  let bodyX = 0
  let bodyY = br * 0.012
  let bodyZ = 0
  let bodyRoll = 0
  let neckX = -br * 0.03
  let neck2X = 0
  let neckY = lookY * 0.45
  let headX = br * 0.02
  let headY = lookY * 0.55
  let headZ = 0
  let jaw = 0.04 + Math.max(0, -br) * 0.07
  let wingUp = Math.sin(time * 0.8 + v.phase) * 0.04
  let wingBack = 0
  let wingFlap = 0
  let tailX = -0.06
  let tailLift = 0
  let frontHip = 0
  let frontKnee = 0
  let hindHip = 0
  let hindKnee = 0
  let rootZ = 0
  let shake = 0

  // ── Flight (Skyfire): the script holds it in the air ──
  const fb = u.boss
  const flying = !!fb && fb.alt > 0.15
  if (flying) {
    const sub = fb!.sub
    const diving = sub === 'pass'
    const landing = sub === 'land'
    // A wingbeat: slow and deep climbing and hovering, a glide with the wings swept back on the dive.
    const beat = Math.sin(time * (diving ? 3 : 6.2) + v.phase)
    wingUp = diving ? 0.2 + beat * 0.08 : 0.55 + beat * 0.75
    wingBack = diving ? 0.55 : landing ? -0.35 : -0.05
    wingFlap = 0
    // Legs drawn up under it; out for the landing.
    frontHip = landing ? -0.2 : -0.9
    frontKnee = landing ? 0.3 : 1.4
    hindHip = landing ? 0.1 : 0.8
    hindKnee = landing ? 0 : -0.5
    // Nose up as it climbs, down into the dive, flared for the landing.
    bodyX = sub === 'rise' || sub === 'climb' ? -0.3 : diving ? 0.22 : landing ? -0.38 : 0
    bodyY = beat * 0.06
    neckX = diving ? 0.35 : -0.15
    neck2X = diving ? 0.2 : 0
    headX = diving ? 0.35 : 0.1
    // Breathing fire down the lane.
    jaw = diving ? 0.75 : 0.12
    tailX = diving ? -0.2 : 0.15
    tailLift = 0
  }

  // The gait: the body dips on every footfall (four a cycle) and rolls over the planted shoulder.
  if (!flying) bodyY += -0.035 * amp * (0.5 + 0.5 * Math.cos(cyc * TAU * 4))
  bodyRoll += 0.045 * amp * Math.sin(cyc * TAU * 2)
  bodyX += 0.02 * amp * Math.sin(cyc * TAU * 4 + 0.6)
  // The head held steady against it: the neck takes the sway out.
  neckY += -0.08 * amp * Math.sin(cyc * TAU * 2)
  headY += 0.06 * amp * Math.sin(cyc * TAU * 2)
  wingBack += 0.3 * amp
  wingUp += 0.05 * amp * Math.sin(cyc * TAU * 4)

  if (b.on && !flying) {
    if (bite) {
      // Draw back in an S, jaw wide; strike through; the body follows the head.
      neckX += beat(b, -0.42, 0.42)
      neck2X += beat(b, -0.3, 0.32)
      headX += beat(b, 0.38, -0.12)
      jaw = beat(b, 0.75, 0.02) + 0.04
      bodyX += beat(b, -0.08, 0.12)
      rootZ = beat(b, -0.14, 0.42)
      frontHip += beat(b, 0.1, -0.3)
      hindHip += beat(b, -0.15, 0.3)
      wingUp += beat(b, 0.15, -0.05)
      tailLift += beat(b, -0.15, 0.2)
    } else if (breathing) {
      // Rear and draw breath, then thrust the head down at the ground and sweep it across.
      const sweep = b.hit > 0 ? Math.sin((a ? a.t - a.hitAt : 0) * 3.2) * 0.38 * (1 - b.out) : 0
      bodyX += beat(b, -0.2, 0.1)
      bodyY += beat(b, 0.07, 0)
      neckX += beat(b, -0.5, 0.3)
      neck2X += beat(b, -0.35, 0.25)
      headX += beat(b, -0.3, 0.22)
      neckY += sweep * 0.55
      headY += sweep * 0.45
      jaw = beat(b, 0.12, 0.85) + 0.04
      wingUp += beat(b, 0.45, 0.2)
      wingBack += beat(b, -0.25, 0)
      frontHip += beat(b, -0.15, -0.05)
      shake += 0.6 * b.hit * (1 - b.out)
    } else if (stomp) {
      // Up onto the hind legs, forelegs folded high, wings flung wide... then the whole weight down.
      bodyX += beat(b, -0.5, 0.14)
      bodyY += beat(b, 0.3, -0.1)
      frontHip += beat(b, -0.85, -0.22)
      frontKnee += beat(b, 1.15, 0.05)
      hindHip += beat(b, 0.35, -0.05)
      hindKnee += beat(b, -0.3, 0.12)
      neckX += beat(b, -0.35, 0.4)
      neck2X += beat(b, -0.2, 0.2)
      headX += beat(b, -0.25, 0.25)
      jaw = beat(b, 0.45, 0.65) + 0.04
      wingUp += beat(b, 0.8, -0.45)
      wingBack += beat(b, -0.4, 0.1)
      wingFlap += beat(b, 0.3, -0.5)
      tailX += beat(b, 0.3, -0.15)
      tailLift += beat(b, -0.35, 0.25)
    } else if (charge) {
      // Head low, horns first, wings folded tight.
      neckX += beat(b, 0.15, 0.45)
      neck2X += beat(b, 0.1, 0.25)
      headX += beat(b, 0.3, 0.2)
      bodyX += beat(b, 0.12, 0.08)
      wingBack += beat(b, 0.5, 0.6)
      wingUp += beat(b, -0.2, -0.25)
      tailLift += beat(b, 0.1, 0.2)
      jaw = beat(b, 0.3, 0.45) + 0.04
      rootZ = beat(b, -0.1, 0.3)
    } else if (roar) {
      // Up on its haunches, wings spread, head thrown back, jaw wide, shaking with it.
      bodyX += beat(b, -0.32, -0.22)
      bodyY += beat(b, 0.16, 0.1)
      frontHip += beat(b, -0.4, -0.25)
      frontKnee += beat(b, 0.6, 0.35)
      neckX += beat(b, -0.45, -0.55)
      neck2X += beat(b, -0.25, -0.3)
      headX += beat(b, -0.2, -0.45)
      jaw = beat(b, 0.35, 0.95) + 0.04
      wingUp += beat(b, 0.7, 0.85)
      wingBack += beat(b, -0.3, -0.35)
      wingFlap += Math.sin(time * 14) * 0.08 * b.hit
      tailLift += beat(b, -0.2, -0.3)
      shake += 1.2 * b.hit * (1 - b.out)
    }
  }
  if (u.flinch > 0) { headX -= 0.3 * u.flinch; neckX -= 0.2 * u.flinch; jaw += 0.25 * u.flinch }
  if (v.dazed > 0.01) { headZ += Math.sin(time * 4.2 + v.phase) * 0.3 * v.dazed; neckX += 0.25 * v.dazed }
  const sh = shake > 0 ? Math.sin(time * 47) * 0.015 * shake : 0

  // ── Ease every channel: a body this size never snaps ──
  const fast = b.on ? 18 : 7
  const E = (k: string, to: number, rate = fast): number => ease(st!, k, to, rate, dt)
  const bx = E('bodyX', bodyX)
  const by = E('bodyY', bodyY)
  const bz = E('bodyZ', bodyZ)
  pose(r, 'body', bx + sh, 0, E('roll', bodyRoll, 8) + sh * 0.6)
  nudge(r, 'body', 0, by, bz)
  // The neck and head lag the body a little: the head arrives last.
  pose(r, 'neck', E('neckX', neckX - bx * 0.4), E('neckY', neckY + st.turn * 0.06, 6), 0)
  pose(r, 'neck2', E('neck2X', neck2X, fast * 0.8), E('neck2Y', neckY * 0.6, 5), 0)
  pose(r, 'head', E('headX', headX - bx * 0.3, fast * 0.7), E('headY', headY, 4), E('headZ', headZ, 6))
  pose(r, 'jaw', E('jaw', jaw, b.on ? 26 : 8), 0, 0)
  // Wings: spread or folded, a beat when it lands, a breath of their own.
  const wu = E('wingUp', wingUp, b.on ? 10 : 4)
  const wb = E('wingBack', wingBack, 5)
  const wf = E('wingFlap', wingFlap, 14)
  pose(r, 'wingL', 0, -wb, -(wu + wf))
  pose(r, 'wingR', 0, wb, wu + wf)
  // The tail: a wave down its length that follows the gait, swung out by a turn, lifted by the action.
  const swing = -st.turn * 0.12
  for (let k = 1; k <= 3; k++) {
    const lag = k * 0.65
    const wave = Math.sin(cyc * TAU * 2 - lag) * (0.12 + 0.06 * k) * amp + Math.sin(time * 1.3 - lag + v.phase) * 0.07 * k * (1 - amp)
    pose(r, 'tail' + k, E('tailX' + k, (tailX + tailLift) * (k === 1 ? 1 : 0.5), 6 - k), E('tailY' + k, wave + swing * k, 7 - k), 0)
  }
  // Legs: each lifts and swings through on its beat, the knee folding as it lifts, the foot kept flat.
  for (const [leg, front, at] of DRAGON_LEGS) {
    let c = (cyc + at) % 1
    if (c < 0) c += 1
    const swingK = c < 0.32 ? c / 0.32 : -1
    const lift = swingK >= 0 ? Math.sin(swingK * Math.PI) : 0
    const A = flying ? 0 : 0.36 * amp
    // Swing: from back to front. Stance: the planted foot travels back under the body.
    const hip = swingK >= 0 ? A * (1 - 2 * (swingK * swingK * (3 - 2 * swingK))) : -A + 2 * A * ((c - 0.32) / 0.68)
    const knee = lift * 0.95 * amp
    const h = E('hip' + leg, hip + (front ? frontHip : hindHip), 16)
    const kn = E('knee' + leg, knee + (front ? frontKnee : hindKnee), 16)
    pose(r, 'leg' + leg, h, 0, 0)
    pose(r, 'shin' + leg, kn, 0, 0)
    // The foot stays level with the ground, curling a little as it leaves it.
    pose(r, 'foot' + leg, -(h + kn) * 0.9 + lift * 0.35 * amp, 0, 0)
  }

  v.rootZ = rootZ
  v.hopY = 0
  v.leapK = 0
  v.pitch = 0
  v.roll = 0
  v.trail = bite && b.hit > 0 && b.out < 0.25 ? 1 - b.out * 4 : 0
  v.trailOff = 0
  v.trailHeavy = true
  // The stomp lands: the whole body squashes into the ground.
  if (b.on && b.hit >= 1 && v.hopFrom < 1 && stomp) squash(v, 0.16)
  v.hopFrom = b.on ? Math.min(1, b.hit) : 0
}

// ─── A rider in the saddle (#74) ────────────────────────────────────────────

/**
 * The rider of a mount (the Goblin King on Tusker): seated astride, thighs
 * forward and out round the beast, a hand on the reins, the club arm drawn
 * back and thrown when the mount's action is a barrage (the King's bombs),
 * leaning into a charge, rocking with the gait. Gone once it has leapt off.
 */
export const poseRider = (v: RigView, u: Unit, time: number): void => {
  const r = v.rider
  if (!r) return
  const b = u.boss
  const off = !u.alive || !!b && (b.marks.includes('dismounted') || b.mode === 'exit' || b.mode === 'gone')
  r.root.visible = !off
  if (off) return
  const a = u.action
  const throwing = a && a.id === 'barrage' ? clamp01(a.t / Math.max(0.05, a.hitAt)) : 0
  const thrown = a && a.id === 'barrage' && a.t > a.hitAt ? clamp01((a.t - a.hitAt) / 0.25) : 0
  const charging = b?.mode === 'charge' ? 1 : a?.id === 'charge' ? 0.5 : 0
  const horn = a && a.id === 'enrage' ? clamp01(a.t / Math.max(0.05, a.hitAt)) : 0
  const rock = Math.sin(time * 9 + v.phase) * (u.anim === 'walk' || charging ? 0.06 : 0.015)
  pose(r, 'legL', -1.3, 0, 0.62)
  pose(r, 'legR', -1.3, 0, -0.62)
  pose(r, 'shinL', 1.25, 0, 0)
  pose(r, 'shinR', 1.25, 0, 0)
  pose(r, 'torso', 0.12 + rock + charging * 0.35 - horn * 0.3, 0, 0)
  pose(r, 'head', -0.1 - charging * 0.2 - horn * 0.4, 0, 0)
  // The reins.
  pose(r, 'armL', -0.9 - charging * 0.3, 0, 0.25)
  pose(r, 'foreL', -0.7, 0, 0)
  // The club: raised, drawn back to throw, and thrown; held high to blow the horn.
  pose(r, 'armR', -0.6 - throwing * 2 + thrown * 2.6 - horn * 1.8, 0, -0.25)
  pose(r, 'foreR', -0.5 - throwing * 0.6, 0, 0)
}

const spider = (v: RigView, u: Unit, time: number, speed: number): void => {
  const r = v.rig
  const amp = u.anim === 'walk' && speed > 0.3 ? 1 : 0.12
  const b = beatsOf(u, 0.08)
  for (let k = 0; k < 3; k++) {
    // Tripod gait: alternate legs move together. The front pair rears with the body.
    const a = Math.sin(v.phase * (amp === 1 ? 1 : 0) + time * (amp === 1 ? 0 : 2) + (k % 2 ? Math.PI : 0)) * 0.4 * amp
    const rear = k === 0 ? beat(b, 0.7, -0.35) : 0
    pose(r, `legL${k}`, 0, a + rear * 0.4, Math.abs(a) * 0.3 - rear)
    pose(r, `legR${k}`, 0, a - rear * 0.4, -Math.abs(a) * 0.3 + rear)
  }
  // Rears up on its back legs, fangs high; then down on the target.
  const bodyX = Math.sin(time * 3 + v.phase) * 0.04 + beat(b, -0.42, 0.34) + (v.dazed > 0.01 ? 0.25 * v.dazed : 0)
  const z = beat(b, -0.16, 0.36) + Math.sin(time * 44) * 0.01 * b.hold
  pose(r, 'body', bodyX, 0, v.dazed > 0.01 ? Math.sin(time * 4.2) * 0.2 * v.dazed : 0)
  nudge(r, 'body', 0, Math.sin(time * 4 + v.phase) * 0.02 + beat(b, 0.08, -0.04), z)
  pose(r, 'head', (u.flinch > 0 ? -0.3 * u.flinch : 0) + beat(b, -0.3, 0.3), 0, 0)
  v.rootZ = beat(b, -0.1, 0.26)
  v.hopY = 0
  v.leapK = 0
  v.pitch = 0
  v.roll = 0
  v.trail = b.on && b.hit > 0 && b.out < 0.25 ? 1 - b.out * 4 : 0
  v.trailOff = 0
  v.trailHeavy = false
}

/** The caravan (#85): the mule nods as it walks, the wheels turn with the road. */
const cart = (v: RigView, u: Unit, time: number): void => {
  const r = v.rig
  const going = u.anim === 'walk'
  pose(r, 'head', going ? Math.sin(time * 6) * 0.12 : Math.sin(time * 0.9 + v.phase) * 0.05, 0, 0)
  const turn = going ? time * 3.7 : 0
  pose(r, 'wheelL', turn, 0, 0)
  pose(r, 'wheelR', turn, 0, 0)
  v.rootZ = 0
  v.hopY = 0
  v.leapK = 0
  v.pitch = 0
  v.roll = 0
  v.trail = 0
  v.trailOff = 0
}

const turret = (v: RigView, u: Unit, time: number): void => {
  const r = v.rig
  const b = beatsOf(u, 0.03)
  const kick = b.on && b.hit >= 1 ? 1 - b.out : 0
  // It spools before it fires: a shiver that tightens.
  const spool = b.on ? Math.sin(time * 60) * 0.012 * b.coil * (1 - Math.min(1, b.hit)) : 0
  pose(r, 'head', -kick * 0.2 + spool, Math.sin(time * 1.2 + v.phase) * (u.targetId ? 0 : 0.5), spool)
  nudge(r, 'head', 0, 0, -kick * 0.07)
  v.rootZ = 0
  v.hopY = 0
  v.leapK = 0
  v.pitch = 0
  v.roll = 0
  v.trail = 0
  v.trailOff = 0
}

// ─── The frame ───────────────────────────────────────────────────────────────

/**
 * Pose a rig for this frame. `x`, `z` are the interpolated position; `dt` is
 * the frame's EFFECT time (slowed, never stopped, by a hit-stop).
 */
const holdPick = (v: RigView, on: boolean): void => {
  const w = v.rig.bones.weapon
  const o = v.rig.bones.offhand
  if (!w || !w.parent) return
  if (on) {
    const g = new Group()
    g.position.copy(w.position)
    g.quaternion.copy(w.quaternion)
    g.add(pickaxeMesh())
    w.parent.add(g)
    v.pick = g
    w.scale.setScalar(0.001)
    o?.scale.setScalar(0.001)
  } else {
    v.pick?.removeFromParent()
    v.pick = null
    w.scale.setScalar(1)
    o?.scale.setScalar(1)
  }
}

export const animate = (v: RigView, u: Unit, x: number, z: number, time: number, dt: number): void => {
  const rig = v.rig
  const root = rig.root
  const speed = Math.hypot(u.vx, u.vz)
  if (u.alive) v.phase += speed * dt * (v.family === 'beast' ? 3.4 : 4.2) / Math.max(0.6, v.scale)

  // Frozen in place: no pose update at all (the last pose holds, tinted).
  const stasis = hasStatus(u, 'stasis')
  const stone = hasStatus(u, 'petrify')
  const ice = hasStatus(u, 'frozen')
  const held = stasis || stone || ice

  // A new ability squashes the body before it springs into the move.
  if (u.action !== v.squashAction) {
    v.squashAction = u.action
    if (u.action && u.action.id !== 'attack' && u.action.id !== 'open' && u.action.id !== 'mine') squash(v, 0.16)
  }
  // The pickaxe (#99): the weapon and the off hand's piece are put away (their
  // bones folded to nothing) and the pick is in both hands while he mines.
  const mining = u.action?.id === 'mine'
  if (mining !== !!v.pick) holdPick(v, mining)
  if (u.anim === 'spawn' && u.animT < dt * 2) squash(v, 0.35)
  if (v.squashT >= 0) {
    v.squashT += dt
    if (v.squashT > 0.6) v.squashT = -1
  }

  // What the body is going through, eased so nothing snaps.
  const k = Math.min(1, dt * 12)
  const stunned = u.alive && (u.anim === 'stun' || hasStatus(u, 'stun') || hasStatus(u, 'confuse'))
  v.dazed += ((stunned && !held ? 1 : 0) - v.dazed) * k
  v.scared += ((u.alive && hasStatus(u, 'fear') && !held ? 1 : 0) - v.scared) * k
  const up = findStatus(u, 'knockup')
  v.air += ((up ? 1 : 0) - v.air) * Math.min(1, dt * 16)
  const flat = hasStatus(u, 'knockdown')
  v.down += ((flat ? 1 : 0) - v.down) * Math.min(1, dt * (flat ? 14 : 6))

  // Heading, and how fast along it he is going (capes and hair trail by it).
  const yaw0 = v.yaw
  v.yaw = turn(v.yaw, u.facing, held ? 0 : Math.min(1, dt * 16))
  let dy = v.yaw - yaw0
  if (dy > Math.PI) dy -= TAU
  else if (dy < -Math.PI) dy += TAU
  v.yawRate = dt > 1e-4 ? clamp(dy / dt, -12, 12) : 0
  v.fwd = u.vx * Math.sin(v.yaw) + u.vz * Math.cos(v.yaw)

  if (!held && u.alive) {
    switch (v.family) {
      case 'beast':
      case 'wyvern':
        beast(v, u, time, speed)
        break
      case 'dragon':
        dragon(v, u, time, speed)
        break
      case 'spider':
        spider(v, u, time, speed)
        break
      case 'turret':
        turret(v, u, time)
        break
      case 'cart':
        cart(v, u, time)
        break
      default:
        humanoid(v, u, time, dt, speed)
    }
    if (v.rider) poseRider(v, u, time)
  } else if (!u.alive && !held) {
    v.trail = v.trailOff = 0
    if (v.rider) v.rider.root.visible = false
    v.hopY = 0
    v.leapK = 0
    if (v.family === 'humanoid' || v.family === 'naga') limp(v, u)
  } else {
    v.trail = v.trailOff = 0
  }

  // ── Placement ──
  let px = x
  let pz = z
  let y = v.float > 0 ? v.float + Math.sin(time * 2.4 + v.phase) * 0.07 : 0
  if (up) y += Math.sin(clamp01(1 - up.t / up.dur) * Math.PI) * 1.3
  y += (v.hopY + v.rootY) * v.scale
  // A boss in the air (#74): its script's height, in metres.
  if (u.boss && u.boss.alt > 0) y += u.boss.alt
  // A leap is drawn travelling: the sim moves the body at the landing.
  const a = u.action
  if (v.leapK > 0 && a && a.id === 'leap' && !a.done) {
    px += (a.x - u.x) * v.leapK
    pz += (a.z - u.z) * v.leapK
  }
  const sy0 = Math.sin(v.yaw)
  const cy0 = Math.cos(v.yaw)
  px += sy0 * v.rootZ * v.scale
  pz += cy0 * v.rootZ * v.scale
  let tilt = v.pitch
  let roll = v.roll
  if (v.air > 0.01) tilt -= 0.5 * v.air
  if (v.down > 0.001) {
    // Thrown onto its back, a small bounce, and up again.
    tilt = lerp(tilt, -1.38, easeOut(v.down))
    y += Math.sin(clamp01(v.down) * Math.PI) * 0.12 * (flat ? 1 : 0)
  }

  // ── Squash and stretch ──
  const idle = u.alive && u.anim === 'idle' && !u.action && !held ? 1 : 0
  const b = breath(time + v.phase) * idle
  let sy = (1 + 0.05 * b) * squashCurve(v.squashT, v.squashDepth)
  let sxz = (1 - 0.03 * b) * (1 + (1 - squashCurve(v.squashT, v.squashDepth)) * 0.5)
  let opacity = v.ghost ? 0.62 : 1

  if (u.anim === 'spawn') {
    const e = elasticOut(clamp01(u.animT / 0.5))
    sy *= e
    sxz *= e
  }
  if (!u.alive) {
    // Thrown back by the blow that did it, a bounce, then into the ground.
    const fall = easeOut(clamp01(u.deadT / 0.34))
    const back = Math.cos(v.hitYaw - v.yaw) <= 0.2 ? -1 : 1
    tilt = back * 1.5 * fall + Math.sin(clamp01((u.deadT - 0.34) / 0.25) * Math.PI) * 0.1 * back
    y += Math.sin(clamp01(u.deadT / 0.34) * Math.PI) * 0.32
    const slide = easeOut(clamp01(u.deadT / 0.5)) * 0.5
    px += Math.sin(v.hitYaw) * slide * (v.hitYaw === 0 ? 0 : 1)
    pz += Math.cos(v.hitYaw) * slide * (v.hitYaw === 0 ? 0 : 1)
    const fade = clamp01((u.deadT - 1.1) / 0.9)
    opacity *= 1 - fade
    y -= fade * 0.25
    if (u.deadT > 2.1) v.gone = true
    if (u.rank === 'turret' || u.rank === 'minion') {
      // Summons do not die, they are dismissed: a quick shrink.
      const e = 1 - clamp01(u.deadT / 0.3)
      sy *= e
      sxz *= e
      tilt = 0
      if (u.deadT > 0.3) v.gone = true
    }
  }
  if (hasStatus(u, 'stealth')) opacity *= u.team === 0 ? 0.35 : 0.2

  // On the ground's height where the body stands (`gfx/ground.ts`).
  root.position.set(px, y + groundAt(px, pz), pz)
  root.rotation.set(tilt, v.yaw + v.spin, roll, 'YXZ')
  root.scale.set(v.scale * sxz, v.scale * sy, v.scale * sxz)
  v.x = px
  v.z = pz

  // ── Surface ──
  const dying = u.alive ? 0 : Math.max(0, 0.8 - u.deadT * 4)
  setCelFlash(rig.material, u.alive ? Math.max(u.flinch * 0.8, v.flash) : dying, v.flash > u.flinch * 0.8 ? v.flashHex : '#ffffff')
  if (v.flash > 0) v.flash = Math.max(0, v.flash - dt * 7)
  setCelTint(rig.material, stone ? '#a39d92' : ice ? '#a8dcff' : stasis ? '#9fb4ff' : hasStatus(u, 'poison') ? '#c8f0a8' : hasStatus(u, 'enrage') ? '#ffc8b8' : u.infernal ? INFERNAL_TINT : '#ffffff')
  setCelOpacity(rig.material, opacity)
  // The shared outline cannot fade per rig: it simply leaves with the body.
  if (rig.outline) rig.outline.visible = opacity > 0.6
  rig.root.visible = !v.gone
}

/** A body with nobody in it: arms out, head back, the weapon let go. */
const limp = (v: RigView, u: Unit): void => {
  const k = easeOut(clamp01(u.deadT / 0.3))
  O.set(v.pose)
  O[aLz] = lerp(O[aLz]!, 1.1, k)
  O[aRz] = lerp(O[aRz]!, 1.0, k)
  O[aLx] = lerp(O[aLx]!, -0.4, k)
  O[aRx] = lerp(O[aRx]!, -0.5, k)
  O[eL] = lerp(O[eL]!, 0.4, k)
  O[eR] = lerp(O[eR]!, 0.3, k)
  O[wRx] = lerp(O[wRx]!, 1.2, k)
  O[headRx] = lerp(O[headRx]!, -0.4, k)
  O[torRx] = lerp(O[torRx]!, -0.15, k)
  O[lLz] = lerp(O[lLz]!, 0.25, k)
  O[lRz] = lerp(O[lRz]!, 0.2, k)
  O[kL] = lerp(O[kL]!, 0.5, k)
  O[lid] = 1
  O[mouth] = 0.5
  O[brow] = 0.6
  O[rootZ] = 0
  O[pitch] = 0
  O[spin] = 0
  apply(v, v.rig, O)
  v.rootZ = 0
  v.rootY = 0
  v.pitch = 0
  v.roll = 0
  v.spin = 0
}

/** Tell a view where a blow came from (the direction it travelled, radians)
 *  and flash it: the recoil and a death both fall away from the attacker. */
export const struck = (v: RigView, yaw: number, flash = 0, hex = '#ffffff'): void => {
  v.hitYaw = yaw
  if (flash > v.flash) { v.flash = flash; v.flashHex = hex }
}

void easeIn
