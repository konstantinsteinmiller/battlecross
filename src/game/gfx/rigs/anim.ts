import { setCelFlash, setCelOpacity, setCelTint, setOutlineOpacity } from '../cel'
import { nudge, pose, type Rig } from '../kit'
import { findStatus, hasStatus } from '../../sim/world'
import type { Unit } from '../../sim/types'
import type { RigView } from './index'

/**
 * ─── Procedural animation ────────────────────────────────────────────────────
 *
 * No clips: every pose is a function of time and of what the unit is doing in
 * the sim. That keeps the art payload at zero and, more usefully, keeps the
 * animation honest — a swing's hit frame IS the sim's hit time, so the sword
 * connects exactly when the number pops.
 *
 * The GDD's squash and stretch (§2.3.4) lives here:
 *   • idle: Y 1.0 → 1.05, X 1.0 → 0.97 over 1.2 s, ping-pong;
 *   • a cast or a landing: Y down to 0.8 in 0.08 s, then an elastic spring back.
 */

const TAU = Math.PI * 2
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeOut = (k: number): number => 1 - (1 - k) * (1 - k)
const easeIn = (k: number): number => k * k
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k

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

// ─── Families ────────────────────────────────────────────────────────────────

const resetHumanoid = (r: Rig): void => {
  pose(r, 'hips')
  pose(r, 'torso')
  pose(r, 'head')
  pose(r, 'armL')
  pose(r, 'armR')
  pose(r, 'handL')
  pose(r, 'handR')
  pose(r, 'legL')
  pose(r, 'legR')
  nudge(r, 'hips')
}

/** A swing's two halves: 0..1 through the wind-up, then 0..1 through the follow-through. */
const actionPhases = (u: Unit): { wind: number; follow: number; on: boolean } => {
  const a = u.action
  if (!a) return { wind: 0, follow: 1, on: false }
  if (a.t < a.hitAt) return { wind: clamp01(a.t / Math.max(0.01, a.hitAt)), follow: 0, on: true }
  return { wind: 1, follow: clamp01((a.t - a.hitAt) / Math.max(0.05, a.end - a.hitAt)), on: true }
}

const humanoid = (v: RigView, u: Unit, time: number, speed: number): void => {
  const r = v.rig
  resetHumanoid(r)
  const walking = u.anim === 'walk' && speed > 0.3
  const ph = v.phase
  // A relaxed stance: arms a little out from the body.
  let aLx = 0
  let aRx = 0
  let aLz = -0.14
  let aRz = 0.14
  let lL = 0
  let lR = 0
  let torsoX = 0
  let torsoY = 0
  let headX = 0
  let hipY = 0
  let cape = 0.12

  if (walking) {
    const s = Math.sin(ph)
    const amp = Math.min(1, speed / 3.2)
    lL = s * 0.8 * amp
    lR = -s * 0.8 * amp
    aLx = -s * 0.6 * amp
    aRx = s * 0.35 * amp
    torsoX = 0.14 * amp
    hipY = Math.abs(Math.cos(ph)) * 0.035 * amp
    cape = 0.35 + 0.1 * Math.sin(ph * 2)
  } else if (!u.action) {
    const b = Math.sin(time * 2.1 + v.phase)
    aLx = b * 0.04
    aRx = -b * 0.04
    headX = b * 0.025
  }

  const p = actionPhases(u)
  if (p.on && u.anim === 'attack') {
    const second = u.animStyle === 1
    if (v.attack === 'swing' || v.attack === 'heavy') {
      const heavy = v.attack === 'heavy'
      if (p.follow === 0) {
        // Wind-up: the weapon arm goes up and back, the body coils.
        const k = easeOut(p.wind)
        aRx = lerp(aRx, heavy ? -2.9 : -2.4, k)
        aRz = lerp(aRz, second ? -0.5 : 0.5, k)
        torsoY = (second ? 0.45 : -0.45) * k
        torsoX = -0.12 * k
        if (heavy) { aLx = lerp(aLx, -2.5, k); aLz = lerp(aLz, 0.3, k) }
      } else {
        // The cut: down and across in the first third, then recovery.
        const k = easeOut(clamp01(p.follow / 0.32))
        const back = easeIn(clamp01((p.follow - 0.45) / 0.55))
        aRx = lerp(lerp(heavy ? -2.9 : -2.4, 0.55, k), 0, back)
        aRz = lerp(lerp(second ? -0.5 : 0.5, second ? 0.7 : -0.6, k), 0.14, back)
        torsoY = lerp(lerp(second ? 0.45 : -0.45, second ? -0.5 : 0.5, k), 0, back)
        torsoX = lerp(0.3 * k, 0, back)
        if (heavy) { aLx = lerp(lerp(-2.5, 0.5, k), 0, back); aLz = lerp(0.3, -0.14, back) }
        lL = 0.35 * (1 - back)
        lR = -0.3 * (1 - back)
      }
    } else if (v.attack === 'shoot') {
      const k = p.follow === 0 ? easeOut(p.wind) : 1 - easeIn(clamp01((p.follow - 0.5) / 0.5))
      const kick = p.follow > 0 ? Math.max(0, 1 - p.follow / 0.25) : 0
      aRx = lerp(aRx, -1.5 - kick * 0.5, k)
      aLx = lerp(aLx, v.held === 'bow' ? -1.5 : -0.6, k)
      torsoX = -0.1 * kick
      headX = -0.08 * kick
    } else {
      // Staff or wand: raised, then thrust at the target.
      const k = p.follow === 0 ? easeOut(p.wind) : 1
      const thrust = p.follow > 0 ? easeOut(clamp01(p.follow / 0.3)) : 0
      const back = p.follow > 0 ? easeIn(clamp01((p.follow - 0.5) / 0.5)) : 0
      aRx = lerp(lerp(aRx, -2.5, k), -1.45, thrust) * (1 - back)
      aLx = lerp(aLx, -0.9, k) * (1 - back)
      torsoX = lerp(-0.16 * k, 0.16, thrust) * (1 - back)
    }
  } else if (p.on && u.anim === 'cast') {
    const k = p.follow === 0 ? easeOut(p.wind) : 1
    const out = p.follow > 0 ? easeOut(clamp01(p.follow / 0.3)) : 0
    const back = p.follow > 0 ? easeIn(clamp01((p.follow - 0.5) / 0.5)) : 0
    switch (u.animStyle) {
      case 2:
        // Both arms to the sky, then flung wide: a shout, a nova, a summon.
        aRx = lerp(lerp(aRx, -2.9, k), -1.2, out) * (1 - back)
        aLx = lerp(lerp(aLx, -2.9, k), -1.2, out) * (1 - back)
        aRz = lerp(lerp(0.14, 0.3, k), 1.3, out)
        aLz = lerp(lerp(-0.14, -0.3, k), -1.3, out)
        headX = lerp(-0.35 * k, 0.1, out)
        torsoX = lerp(-0.2 * k, 0.12, out) * (1 - back)
        hipY = -0.05 * k * (1 - out)
        break
      case 3:
        // Shoulder down for a charge.
        torsoX = 0.5 * k * (1 - back)
        aRx = 0.7 * k
        aLx = 0.7 * k
        lL = 0.5 * k
        lR = -0.4 * k
        break
      case 0:
        // A close strike: the heavy swing.
        if (p.follow === 0) { aRx = lerp(aRx, -2.8, k); aLx = lerp(aLx, -2.4, k); torsoX = -0.15 * k } else {
          aRx = lerp(lerp(-2.8, 0.6, out), 0, back)
          aLx = lerp(lerp(-2.4, 0.4, out), 0, back)
          torsoX = lerp(0.35 * out, 0, back)
        }
        break
      default:
        // Thrown or fired at range: both hands forward.
        aRx = lerp(lerp(aRx, -2.2, k), -1.5, out) * (1 - back)
        aLx = lerp(lerp(aLx, -1.2, k), -1.5, out) * (1 - back)
        torsoX = lerp(-0.18 * k, 0.2, out) * (1 - back)
        break
    }
  }

  // A hit rocks the body back.
  if (u.flinch > 0) {
    torsoX -= 0.3 * u.flinch
    headX -= 0.25 * u.flinch
  }
  if (u.anim === 'stun') {
    headX = 0.3
    torsoX = 0.15
    aLx = aRx = 0.2
  }

  pose(r, 'hips', 0, torsoY * 0.3, 0)
  nudge(r, 'hips', 0, hipY, 0)
  pose(r, 'torso', torsoX, torsoY, 0)
  pose(r, 'head', headX, -torsoY * 0.6, 0)
  pose(r, 'armL', aLx, 0, aLz)
  pose(r, 'armR', aRx, 0, aRz)
  pose(r, 'legL', lL, 0, 0)
  pose(r, 'legR', lR, 0, 0)
  pose(r, 'cape', cape, 0, 0)
  // Wings beat, tails flick.
  const flap = Math.sin(time * 6 + v.phase)
  pose(r, 'wingL', 0, -0.35 - flap * 0.25, 0)
  pose(r, 'wingR', 0, 0.35 + flap * 0.25, 0)
  pose(r, 'tail', Math.sin(time * 3 + v.phase) * 0.2, Math.sin(time * 2.3) * 0.4, 0)
  // Naga: the coil sways.
  const sway = Math.sin(time * 2.4 + v.phase) * (walking ? 0.5 : 0.22)
  pose(r, 'tail1', 0, sway, 0)
  pose(r, 'tail2', 0, -sway * 1.3, 0)
  pose(r, 'tail3', 0, sway * 1.5, 0)
}

const beast = (v: RigView, u: Unit, time: number, speed: number): void => {
  const r = v.rig
  const walking = u.anim === 'walk' && speed > 0.3
  const amp = walking ? Math.min(1, speed / 3) : 0
  const s = Math.sin(v.phase)
  pose(r, 'legFL', s * 0.9 * amp, 0, 0)
  pose(r, 'legBR', s * 0.9 * amp, 0, 0)
  pose(r, 'legFR', -s * 0.9 * amp, 0, 0)
  pose(r, 'legBL', -s * 0.9 * amp, 0, 0)
  let bodyX = Math.cos(v.phase * 2) * 0.06 * amp
  let headX = Math.sin(time * 1.8 + v.phase) * 0.06
  let bodyZ = 0
  const p = actionPhases(u)
  if (p.on) {
    // Crouch back, then the whole body lunges with the jaws.
    if (p.follow === 0) { bodyX = 0.2 * easeOut(p.wind); bodyZ = -0.15 * easeOut(p.wind); headX = -0.3 * p.wind } else {
      const k = easeOut(clamp01(p.follow / 0.3))
      const back = easeIn(clamp01((p.follow - 0.4) / 0.6))
      bodyX = lerp(0.2, -0.25, k) * (1 - back)
      bodyZ = lerp(-0.15, 0.4, k) * (1 - back)
      headX = lerp(-0.3, 0.35, k) * (1 - back)
    }
  }
  if (u.flinch > 0) headX -= 0.3 * u.flinch
  pose(r, 'body', bodyX, 0, 0)
  nudge(r, 'body', 0, Math.abs(Math.sin(v.phase)) * 0.05 * amp, bodyZ)
  pose(r, 'head', headX, 0, 0)
  pose(r, 'tail', -0.3 + Math.sin(time * 5) * 0.1, Math.sin(time * 6 + v.phase) * 0.5, 0)
  // The dragon shares these bones for its neck, wings and second tail.
  pose(r, 'neck', -headX * 0.5 + Math.sin(time * 1.4) * 0.05, Math.sin(time * 0.9) * 0.08, 0)
  const flap = Math.sin(time * (v.float > 0 ? 8 : 2.2) + v.phase)
  const raise = p.on ? 0.5 * (p.follow === 0 ? p.wind : 1 - p.follow) : 0
  pose(r, 'wingL', 0, 0, -0.2 - flap * (v.float > 0 ? 0.55 : 0.12) - raise)
  pose(r, 'wingR', 0, 0, 0.2 + flap * (v.float > 0 ? 0.55 : 0.12) + raise)
  pose(r, 'tail1', 0, Math.sin(time * 1.6) * 0.25, 0)
  pose(r, 'tail2', 0, Math.sin(time * 1.6 - 0.8) * 0.4, 0)
  pose(r, 'legL', Math.sin(time * 3) * 0.1, 0, 0)
  pose(r, 'legR', -Math.sin(time * 3) * 0.1, 0, 0)
}

const spider = (v: RigView, u: Unit, time: number, speed: number): void => {
  const r = v.rig
  const amp = u.anim === 'walk' && speed > 0.3 ? 1 : 0.12
  for (let k = 0; k < 3; k++) {
    // Tripod gait: alternate legs move together.
    const a = Math.sin(v.phase * (amp === 1 ? 1 : 0) + time * (amp === 1 ? 0 : 2) + (k % 2 ? Math.PI : 0)) * 0.4 * amp
    pose(r, `legL${k}`, 0, a, Math.abs(a) * 0.3)
    pose(r, `legR${k}`, 0, a, -Math.abs(a) * 0.3)
  }
  let bodyX = Math.sin(time * 3 + v.phase) * 0.04
  let z = 0
  const p = actionPhases(u)
  if (p.on) {
    if (p.follow === 0) { bodyX = -0.3 * easeOut(p.wind); z = -0.12 * p.wind } else {
      const k = easeOut(clamp01(p.follow / 0.3))
      const back = easeIn(clamp01((p.follow - 0.4) / 0.6))
      bodyX = lerp(-0.3, 0.3, k) * (1 - back)
      z = lerp(-0.12, 0.3, k) * (1 - back)
    }
  }
  pose(r, 'body', bodyX, 0, 0)
  nudge(r, 'body', 0, Math.sin(time * 4 + v.phase) * 0.02, z)
  pose(r, 'head', u.flinch > 0 ? -0.3 * u.flinch : 0, 0, 0)
}

const turret = (v: RigView, u: Unit, time: number): void => {
  const r = v.rig
  const p = actionPhases(u)
  const kick = p.on && p.follow > 0 ? Math.max(0, 1 - p.follow / 0.4) : 0
  pose(r, 'head', -kick * 0.18, Math.sin(time * 1.2 + v.phase) * (u.targetId ? 0 : 0.5), 0)
  nudge(r, 'head', 0, 0, -kick * 0.06)
}

// ─── The frame ───────────────────────────────────────────────────────────────

/**
 * Pose a rig for this frame. `x`, `z` are the interpolated position; `dt` is
 * REAL frame time (so the spring of a squash plays through a hit-stop).
 */
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

  // A new action squashes the body before it springs into the move.
  if (u.action !== v.lastAction) {
    v.lastAction = u.action
    if (u.action && u.action.id !== 'attack') squash(v, 0.2)
    else if (u.action && v.attack === 'heavy') squash(v, 0.1)
  }
  if (u.anim === 'spawn' && u.animT < dt * 2) squash(v, 0.35)
  if (v.squashT >= 0) {
    v.squashT += dt
    if (v.squashT > 0.6) v.squashT = -1
  }

  if (!held && u.alive) {
    switch (v.family) {
      case 'beast':
      case 'wyvern':
      case 'dragon':
        beast(v, u, time, speed)
        break
      case 'spider':
        spider(v, u, time, speed)
        break
      case 'turret':
        turret(v, u, time)
        break
      default:
        humanoid(v, u, time, speed)
    }
  }

  // ── Placement ──
  v.yaw = turn(v.yaw, u.facing, held ? 0 : Math.min(1, dt * 16))
  let y = v.float > 0 ? v.float + Math.sin(time * 2.4 + v.phase) * 0.07 : 0
  const up = findStatus(u, 'knockup')
  if (up) y += Math.sin(clamp01(1 - up.t / up.dur) * Math.PI) * 1.3
  let tilt = 0
  let roll = 0
  if (u.anim === 'stun' && !held) roll = Math.sin(time * 9) * 0.12
  if (hasStatus(u, 'knockdown')) tilt = -1.35

  // ── Squash and stretch ──
  const idle = u.alive && u.anim === 'idle' && !u.action && !held ? 1 : 0
  const b = breath(time + v.phase) * idle
  let sy = (1 + 0.05 * b) * squashCurve(v.squashT, v.squashDepth)
  let sxz = (1 - 0.03 * b) * (1 + (1 - squashCurve(v.squashT, v.squashDepth)) * 0.5)
  let opacity = v.ghost ? 0.62 : 1

  if (u.anim === 'spawn') {
    const k = elasticOut(clamp01(u.animT / 0.5))
    sy *= k
    sxz *= k
  }
  if (!u.alive) {
    // Topple, lie a moment, then fade into the ground.
    const fall = easeOut(clamp01(u.deadT / 0.32))
    tilt = -1.5 * fall
    y += Math.sin(clamp01(u.deadT / 0.32) * Math.PI) * 0.25
    const fade = clamp01((u.deadT - 1.1) / 0.9)
    opacity *= 1 - fade
    y -= fade * 0.25
    if (u.deadT > 2.1) v.gone = true
    if (u.rank === 'turret' || u.rank === 'minion') {
      // Summons do not die, they are dismissed: a quick shrink.
      const k = 1 - clamp01(u.deadT / 0.3)
      sy *= k
      sxz *= k
      tilt = 0
      if (u.deadT > 0.3) v.gone = true
    }
  }
  if (hasStatus(u, 'stealth')) opacity *= u.team === 0 ? 0.35 : 0.2

  root.position.set(x, y, z)
  root.rotation.set(tilt, v.yaw, roll, 'YXZ')
  root.scale.set(v.scale * sxz, v.scale * sy, v.scale * sxz)

  // ── Surface ──
  setCelFlash(rig.material, u.alive ? u.flinch * 0.8 : Math.max(0, 0.8 - u.deadT * 4), '#ffffff')
  setCelTint(rig.material, stone ? '#a39d92' : ice ? '#a8dcff' : stasis ? '#9fb4ff' : hasStatus(u, 'poison') ? '#c8f0a8' : '#ffffff')
  setCelOpacity(rig.material, opacity)
  if (rig.outline) {
    // The shared outline cannot fade per rig: it simply leaves with the body.
    rig.outline.visible = opacity > 0.6
    void setOutlineOpacity
  }
  rig.root.visible = !v.gone
}
