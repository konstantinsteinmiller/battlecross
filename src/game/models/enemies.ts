import {
  RigBuilder, sph, ell, cap, torus, rcyl, rcone, dome, paintBy, xform, type Rig, pose, nudge, scaleBone
} from './kit'
import { PAL } from './palette'

/**
 * ─── Machine enemies ─────────────────────────────────────────────────────────
 *
 * Original designs built on the archetypes of the sprite era: the helmet-hider,
 * the shield trooper, the heli drone, the one-eyed stomper, the gear roller,
 * the heavy brute and the wall cannon. Each is ONE skinned rig (3 draw calls)
 * with a signature colour, big readable eyes and a silhouette that tells you
 * how it fights before it moves.
 *
 * Every builder takes a colour set so sector variants (blaze / cryo / volt)
 * and elites (gold trim) reuse the same rig.
 */

export type EnemyKind = 'hardhat' | 'trooper' | 'heli' | 'hopper' | 'roller' | 'brute' | 'turret'

export interface EnemyColors {
  main: string
  deep: string
  accent: string
  eye: string
  metal: string
}

export const BASE_COLORS: Record<EnemyKind, EnemyColors> = {
  hardhat: { main: PAL.hardhat, deep: PAL.hardhatDeep, accent: '#ff7a1f', eye: PAL.glowRed, metal: '#4a5570' },
  trooper: { main: PAL.trooper, deep: PAL.trooperDeep, accent: '#b8f06a', eye: PAL.glowPink, metal: '#7f8ba3' },
  heli: { main: PAL.heli, deep: PAL.heliDeep, accent: '#ffd23a', eye: PAL.glowYellow, metal: '#7f8ba3' },
  hopper: { main: PAL.hopper, deep: PAL.hopperDeep, accent: '#ffd23a', eye: PAL.glowRed, metal: '#8a93a8' },
  roller: { main: PAL.roller, deep: PAL.rollerDeep, accent: '#ffe14a', eye: PAL.glowCyan, metal: '#6f7a90' },
  brute: { main: PAL.brute, deep: PAL.bruteDeep, accent: '#ff8a2a', eye: PAL.glowRed, metal: '#3b4458' },
  turret: { main: PAL.turret, deep: '#2c7a72', accent: '#ffcf3a', eye: PAL.glowRed, metal: '#5d6a82' }
}

/** Eye: white, iris, pupil, highlight — the thing that makes a machine cute. */
const eye = (b: RigBuilder, bone: string, p: [number, number, number], r: number, iris: string, facingY = 0, glowIris = false) => {
  b.part(bone, ell(r, r * 1.15, r * 0.55), PAL.eyeWhite, { p, r: [0, facingY, 0] })
  const fx = Math.sin(facingY)
  const fz = Math.cos(facingY)
  b.part(bone, ell(r * 0.6, r * 0.7, r * 0.3), iris, { p: [p[0] + fx * r * 0.35, p[1] - r * 0.1, p[2] + fz * r * 0.35], r: [0, facingY, 0], glow: glowIris, outline: false })
  b.part(bone, ell(r * 0.32, r * 0.38, r * 0.2), PAL.pupil, { p: [p[0] + fx * r * 0.5, p[1] - r * 0.12, p[2] + fz * r * 0.5], r: [0, facingY, 0], outline: false })
  b.part(bone, sph(r * 0.16, 8, 6), '#ffffff', { p: [p[0] + fx * r * 0.52 - r * 0.22, p[1] + r * 0.28, p[2] + fz * r * 0.52], glow: true, outline: false })
}

// ─── Hardhat ─────────────────────────────────────────────────────────────────

export const buildHardhat = (c: EnemyColors = BASE_COLORS.hardhat): Rig => {
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
    .bone('body', 'root', [0, 0.26, 0])
    .bone('helmet', 'root', [0, 0.3, 0])
    .bone('footL', 'root', [-0.16, 0.07, 0.04])
    .bone('footR', 'root', [0.16, 0.07, 0.04])
  b.part('body', ell(0.3, 0.24, 0.28, 16, 12), c.metal, { p: [0, 0, 0] })
  b.part('body', rcyl(0.07, 0.1, 0.03, 12), '#2a3042', { p: [0, -0.08, 0.26], r: [Math.PI / 2, 0, 0] })
  b.part('body', torus(0.07, 0.022, 6, 14), c.accent, { p: [0, -0.08, 0.3] })
  eye(b, 'body', [-0.1, 0.07, 0.22], 0.075, PAL.pupil, -0.2)
  eye(b, 'body', [0.1, 0.07, 0.22], 0.075, PAL.pupil, 0.2)
  const helm = paintBy(dome(0.44, Math.PI * 0.5, 22, 10), (x, y, z) =>
    (Math.abs(x) < 0.07 || (Math.abs(z) < 0.07 && y > 0.18) ? c.deep : c.main))
  b.painted('helmet', helm, { p: [0, 0, 0] })
  b.part('helmet', torus(0.43, 0.055, 8, 28), c.deep, { p: [0, 0, 0], r: [Math.PI / 2, 0, 0] })
  b.part('helmet', sph(0.07, 10, 8), c.deep, { p: [0, 0.44, 0] })
  b.mirror((s, t) => {
    b.part(`foot${t}`, ell(0.12, 0.075, 0.16), c.accent, { p: [0, 0, 0.02] })
  })
  return b.build({ outline: 0.016, height: 0.78 })
}

/** 0 = fully hidden under the helmet, 1 = peeking. */
export const poseHardhat = (rig: Rig, peek: number, t: number, walk: number): void => {
  const k = Math.max(0, Math.min(1, peek))
  nudge(rig, 'helmet', 0, -0.26 * (1 - k) + 0.12 * k, -0.04 * k)
  pose(rig, 'helmet', -0.35 * k, 0, Math.sin(t * 9) * 0.04 * walk)
  scaleBone(rig, 'body', 1, 0.45 + 0.55 * k, 1)
  nudge(rig, 'body', 0, -0.12 * (1 - k), 0)
  const w = Math.sin(t * 12) * walk
  nudge(rig, 'footL', 0, Math.max(0, w) * 0.05, 0)
  nudge(rig, 'footR', 0, Math.max(0, -w) * 0.05, 0)
}

// ─── Shield Trooper ──────────────────────────────────────────────────────────

export const buildTrooper = (c: EnemyColors = BASE_COLORS.trooper): Rig => {
  const b = new RigBuilder()
  b.bone('hips', null, [0, 0.72, 0])
    .bone('chest', 'hips', [0, 0.26, 0])
    .bone('head', 'chest', [0, 0.28, 0])
    .bone('shoulderL', 'chest', [-0.3, 0.12, 0])
    .bone('elbowL', 'shoulderL', [0, -0.24, 0])
    .bone('shoulderR', 'chest', [0.3, 0.12, 0])
    .bone('elbowR', 'shoulderR', [0, -0.24, 0])
    .bone('hipL', 'hips', [-0.13, -0.06, 0])
    .bone('kneeL', 'hipL', [0, -0.3, 0])
    .bone('hipR', 'hips', [0.13, -0.06, 0])
    .bone('kneeR', 'hipR', [0, -0.3, 0])
  b.part('hips', ell(0.22, 0.14, 0.17), c.deep)
  b.part('chest', ell(0.27, 0.24, 0.2, 16, 12), c.main, { p: [0, 0.02, 0] })
  b.part('chest', ell(0.17, 0.1, 0.06), c.deep, { p: [0, -0.06, 0.18] })
  b.part('chest', sph(0.05, 10, 8), c.eye, { p: [0, 0.08, 0.2], glow: true, outline: false })
  // Helmet with a dark visor band and a single glowing eye
  b.part('head', sph(0.2, 18, 12), c.main, { p: [0, 0.12, 0] })
  b.part('head', ell(0.18, 0.07, 0.1), '#1d2438', { p: [0, 0.1, 0.12] })
  b.part('head', ell(0.05, 0.045, 0.03), c.eye, { p: [0.03, 0.1, 0.205], glow: true, outline: false })
  b.part('head', rcone(0.08, 0.02, 0.18, 0.02, 10), c.accent, { p: [0, 0.35, -0.02] })
  b.part('head', torus(0.2, 0.03, 6, 20), c.deep, { p: [0, 0.07, 0], r: [Math.PI / 2, 0, 0] })
  b.mirror((s, t) => {
    b.part(`shoulder${t}`, sph(0.11, 12, 8), c.deep)
    b.part(`shoulder${t}`, cap(0.07, 0.12), c.main, { p: [0, -0.11, 0] })
    b.part(`hip${t}`, cap(0.08, 0.16), c.main, { p: [0, -0.14, 0] })
    b.part(`knee${t}`, cap(0.075, 0.12), c.main, { p: [0, -0.1, 0] })
    b.part(`knee${t}`, ell(0.13, 0.1, 0.19), c.deep, { p: [0, -0.3, 0.04] })
  })
  // Left: the big round shield
  b.part('elbowL', cap(0.08, 0.1), c.deep, { p: [0, -0.08, 0] })
  b.part('elbowL', rcyl(0.44, 0.1, 0.04, 26), '#aeb8cc', { p: [0.02, -0.18, 0.2], r: [Math.PI / 2, 0, 0] })
  b.part('elbowL', torus(0.44, 0.045, 8, 28), c.deep, { p: [0.02, -0.18, 0.25] })
  b.part('elbowL', ell(0.16, 0.16, 0.05), c.main, { p: [0.02, -0.18, 0.28] })
  b.part('elbowL', ell(0.07, 0.07, 0.03), c.accent, { p: [0.02, -0.18, 0.31], glow: true, outline: false })
  // Right: arm gun
  b.part('elbowR', rcyl(0.08, 0.3, 0.03, 14), c.metal, { p: [0, -0.12, 0] })
  b.part('elbowR', torus(0.07, 0.02, 6, 14), c.accent, { p: [0, -0.27, 0], r: [Math.PI / 2, 0, 0] })
  return b.build({ outline: 0.018, height: 1.62 })
}

/** guard: 1 = shield raised in front. aim: 1 = gun arm raised to fire. */
export const poseTrooper = (rig: Rig, guard: number, aim: number, t: number, walk: number): void => {
  const w = Math.sin(t * 8) * walk
  pose(rig, 'hipL', w * 0.5, 0, 0)
  pose(rig, 'hipR', -w * 0.5, 0, 0)
  pose(rig, 'kneeL', Math.max(0, -w) * 0.6, 0, 0)
  pose(rig, 'kneeR', Math.max(0, w) * 0.6, 0, 0)
  nudge(rig, 'hips', 0, Math.abs(w) * 0.03 + Math.sin(t * 2) * 0.008, 0)
  pose(rig, 'shoulderL', -1.35 * guard - 0.1, 0.35 * guard, -0.25 + 0.45 * guard)
  pose(rig, 'elbowL', -0.4 * guard, 0, 0)
  pose(rig, 'shoulderR', -1.5 * aim - 0.05, 0, 0.18 - 0.15 * aim)
  pose(rig, 'elbowR', -0.15 * aim - 0.2 * (1 - aim), 0, 0)
  pose(rig, 'head', -0.1 * aim, 0, 0)
  pose(rig, 'chest', 0.05 * guard, 0.15 * aim, 0)
}

// ─── Rotor Drone ─────────────────────────────────────────────────────────────

export const buildHeli = (c: EnemyColors = BASE_COLORS.heli): Rig => {
  const b = new RigBuilder()
  b.bone('body', null, [0, 0, 0])
    .bone('rotor', 'body', [0, 0.38, 0])
    .bone('clawL', 'body', [-0.16, -0.24, 0.02])
    .bone('clawR', 'body', [0.16, -0.24, 0.02])
  b.part('body', ell(0.36, 0.3, 0.34, 18, 12), c.main)
  b.part('body', ell(0.3, 0.14, 0.28), c.metal, { p: [0, -0.2, 0] })
  b.part('body', torus(0.34, 0.035, 6, 24), c.deep, { p: [0, -0.04, 0], r: [Math.PI / 2, 0, 0] })
  eye(b, 'body', [0, 0.04, 0.27], 0.13, c.eye, 0, true)
  b.part('body', rcyl(0.05, 0.14, 0.02, 10), c.metal, { p: [0, 0.32, 0] })
  b.part('rotor', sph(0.07, 10, 8), c.accent)
  b.part('rotor', ell(0.62, 0.025, 0.08), c.accent, { p: [0, 0.02, 0] })
  b.part('rotor', ell(0.08, 0.025, 0.62), c.accent, { p: [0, 0.02, 0] })
  b.mirror((s, t) => {
    b.part(`claw${t}`, cap(0.04, 0.1), c.metal, { p: [0, -0.06, 0] })
    b.part(`claw${t}`, ell(0.06, 0.04, 0.08), c.deep, { p: [s * 0.02, -0.14, 0.03] })
  })
  return b.build({ outline: 0.015, height: 0.8 })
}

export const poseHeli = (rig: Rig, t: number, tilt: number, spin: number): void => {
  pose(rig, 'rotor', 0, spin, 0)
  pose(rig, 'body', tilt, 0, Math.sin(t * 2.3) * 0.08)
  pose(rig, 'clawL', Math.sin(t * 3) * 0.2 - tilt * 0.8, 0, -0.2)
  pose(rig, 'clawR', Math.sin(t * 3 + 1) * 0.2 - tilt * 0.8, 0, 0.2)
}

// ─── Stomper ─────────────────────────────────────────────────────────────────

export const buildHopper = (c: EnemyColors = BASE_COLORS.hopper): Rig => {
  const b = new RigBuilder()
  b.bone('hips', null, [0, 0.95, 0])
    .bone('body', 'hips', [0, 0.1, 0])
    .bone('legL', 'hips', [-0.26, -0.1, 0])
    .bone('footL', 'legL', [0, -0.62, 0])
    .bone('legR', 'hips', [0.26, -0.1, 0])
    .bone('footR', 'legR', [0, -0.62, 0])
  b.part('body', ell(0.52, 0.56, 0.48, 20, 14), c.main, { p: [0, 0.3, 0] })
  b.part('body', ell(0.44, 0.2, 0.4), c.deep, { p: [0, -0.02, 0] })
  eye(b, 'body', [0, 0.42, 0.36], 0.21, c.eye, 0, true)
  b.part('body', rcone(0.07, 0.02, 0.3, 0.02, 10), c.accent, { p: [0, 0.94, -0.05] })
  b.part('body', sph(0.06, 10, 8), c.accent, { p: [0, 1.1, -0.05], glow: true, outline: false })
  b.mirror((s) => {
    b.part('body', ell(0.14, 0.1, 0.12), c.deep, { p: [s * 0.5, 0.3, 0] })
  })
  b.mirror((s, t) => {
    // Coil-spring legs: stacked tori read as springs at any angle
    for (let k = 0; k < 4; k++) b.part(`leg${t}`, torus(0.11, 0.035, 6, 16), c.metal, { p: [0, -0.1 - k * 0.13, 0], r: [Math.PI / 2, 0, 0] })
    b.part(`foot${t}`, ell(0.2, 0.1, 0.28), c.deep, { p: [0, -0.02, 0.06] })
    b.part(`foot${t}`, ell(0.19, 0.04, 0.26), c.accent, { p: [0, -0.1, 0.06], outline: false })
  })
  return b.build({ outline: 0.02, height: 2.0 })
}

/** squash: -1 crouch … 0 rest … 1 stretched (air). */
export const poseHopper = (rig: Rig, squash: number, t: number): void => {
  const s = Math.max(-1, Math.min(1, squash))
  scaleBone(rig, 'legL', 1, 1 + s * 0.35, 1)
  scaleBone(rig, 'legR', 1, 1 + s * 0.35, 1)
  scaleBone(rig, 'body', 1 - s * 0.08, 1 + s * 0.1, 1 - s * 0.08)
  nudge(rig, 'hips', 0, s * 0.22 + Math.sin(t * 2.5) * 0.01, 0)
}

// ─── Gear Roller ─────────────────────────────────────────────────────────────

export const buildRoller = (c: EnemyColors = BASE_COLORS.roller): Rig => {
  const b = new RigBuilder()
  b.bone('root', null, [0, 0.7, 0])
    .bone('wheel', 'root', [0, 0, 0])
    .bone('driver', 'root', [0, 0.9, 0])
  b.part('wheel', torus(0.52, 0.16, 10, 28), c.main, { r: [0, Math.PI / 2, 0] })
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2
    b.part('wheel', sph(0.1, 10, 8), c.deep, { p: [0, Math.cos(a) * 0.68, Math.sin(a) * 0.68] })
  }
  b.part('wheel', rcyl(0.24, 0.3, 0.08, 16), c.metal, { r: [0, 0, Math.PI / 2] })
  b.part('wheel', rcyl(0.1, 0.36, 0.04, 12), c.accent, { r: [0, 0, Math.PI / 2] })
  // The little driver bot on the axle
  b.part('driver', sph(0.2, 16, 12), c.accent, { p: [0, 0.1, 0] })
  b.part('driver', ell(0.22, 0.06, 0.22), c.deep, { p: [0, 0.22, 0] })
  eye(b, 'driver', [0, 0.1, 0.17], 0.09, c.eye, 0, true)
  b.mirror((s) => {
    b.part('driver', cap(0.035, 0.1), c.metal, { p: [s * 0.2, -0.02, 0.06], r: [0.6, 0, s * 0.8] })
    // Little feet balancing on the rim
    b.part('driver', ell(0.06, 0.04, 0.08), c.deep, { p: [s * 0.09, -0.12, 0.02] })
  })
  return b.build({ outline: 0.018, height: 1.8 })
}

export const poseRoller = (rig: Rig, wheelAngle: number, t: number, lean: number): void => {
  pose(rig, 'wheel', wheelAngle, 0, 0)
  pose(rig, 'driver', lean * 0.35, 0, Math.sin(t * 6) * 0.05)
  nudge(rig, 'driver', 0, Math.abs(Math.sin(t * 10)) * 0.03 * Math.min(1, Math.abs(lean) + 0.2), 0)
}

// ─── Guardroid (brute) ───────────────────────────────────────────────────────

export const buildBrute = (c: EnemyColors = BASE_COLORS.brute): Rig => {
  const b = new RigBuilder()
  b.bone('hips', null, [0, 1.0, 0])
    .bone('chest', 'hips', [0, 0.38, 0])
    .bone('head', 'chest', [0, 0.48, 0.06])
    .bone('shoulderL', 'chest', [-0.62, 0.22, 0])
    .bone('elbowL', 'shoulderL', [0, -0.42, 0])
    .bone('shoulderR', 'chest', [0.62, 0.22, 0])
    .bone('elbowR', 'shoulderR', [0, -0.42, 0])
    .bone('hipL', 'hips', [-0.22, -0.08, 0])
    .bone('kneeL', 'hipL', [0, -0.42, 0])
    .bone('hipR', 'hips', [0.22, -0.08, 0])
    .bone('kneeR', 'hipR', [0, -0.42, 0])
  b.part('hips', ell(0.36, 0.2, 0.28), c.deep)
  b.part('chest', ell(0.52, 0.42, 0.38, 20, 14), c.main, { p: [0, 0.08, 0] })
  b.part('chest', ell(0.34, 0.2, 0.12), c.deep, { p: [0, -0.1, 0.3] })
  b.part('chest', sph(0.13, 14, 10), c.eye, { p: [0, 0.14, 0.34], glow: true, outline: false })
  b.part('chest', torus(0.14, 0.035, 6, 18), c.accent, { p: [0, 0.14, 0.34] })
  b.part('head', ell(0.2, 0.17, 0.2, 16, 12), c.main, { p: [0, 0.08, 0] })
  b.part('head', ell(0.16, 0.05, 0.08), '#1d2438', { p: [0, 0.09, 0.15] })
  b.part('head', ell(0.13, 0.03, 0.03), c.eye, { p: [0, 0.09, 0.21], glow: true, outline: false })
  b.mirror((s, t) => {
    b.part(`shoulder${t}`, sph(0.28, 16, 12), c.deep)
    b.part(`shoulder${t}`, torus(0.25, 0.05, 6, 18), c.accent, { p: [s * 0.03, 0, 0], r: [0, 0, Math.PI / 2] })
    b.part(`shoulder${t}`, cap(0.13, 0.2), c.main, { p: [0, -0.2, 0] })
    b.part(`elbow${t}`, cap(0.15, 0.2), c.deep, { p: [0, -0.14, 0] })
    b.part(`elbow${t}`, sph(0.25, 16, 12), c.main, { p: [0, -0.4, 0.02] })
    b.part(`elbow${t}`, torus(0.18, 0.05, 6, 16), c.accent, { p: [0, -0.26, 0], r: [Math.PI / 2, 0, 0] })
    b.part(`hip${t}`, cap(0.14, 0.2), c.main, { p: [0, -0.2, 0] })
    b.part(`knee${t}`, cap(0.14, 0.16), c.deep, { p: [0, -0.16, 0] })
    b.part(`knee${t}`, ell(0.22, 0.15, 0.3), c.main, { p: [0, -0.46, 0.06] })
  })
  return b.build({ outline: 0.024, height: 2.45 })
}

/** punch: which arm (−1 L, 1 R, 0 none) and wind-up k (−1 back … 1 thrown). */
export const poseBrute = (rig: Rig, t: number, walk: number, arm: number, k: number, slam: number): void => {
  const w = Math.sin(t * 5.5) * walk
  pose(rig, 'hipL', w * 0.4, 0, 0)
  pose(rig, 'hipR', -w * 0.4, 0, 0)
  pose(rig, 'kneeL', Math.max(0, -w) * 0.5, 0, 0)
  pose(rig, 'kneeR', Math.max(0, w) * 0.5, 0, 0)
  nudge(rig, 'hips', 0, Math.abs(w) * 0.05 - slam * 0.25, 0)
  const throwL = arm < 0 ? k : 0
  const throwR = arm > 0 ? k : 0
  pose(rig, 'shoulderL', -1.4 * Math.max(0, throwL) + 0.6 * Math.max(0, -throwL) - 2.6 * slam, 0, -0.2)
  pose(rig, 'shoulderR', -1.4 * Math.max(0, throwR) + 0.6 * Math.max(0, -throwR) - 2.6 * slam, 0, 0.2)
  pose(rig, 'elbowL', -0.9 + 0.8 * Math.max(0, throwL), 0, 0)
  pose(rig, 'elbowR', -0.9 + 0.8 * Math.max(0, throwR), 0, 0)
  pose(rig, 'chest', 0.2 * slam, -0.35 * throwL + 0.35 * throwR, 0)
}

// ─── Wall Cannon ─────────────────────────────────────────────────────────────

export const buildTurret = (c: EnemyColors = BASE_COLORS.turret): Rig => {
  const b = new RigBuilder()
  b.bone('base', null, [0, 0, 0])
    .bone('head', 'base', [0, 0.62, 0])
    .bone('barrel', 'head', [0, 0.08, 0.2])
  b.part('base', rcyl(0.55, 0.3, 0.12, 22), c.metal, { p: [0, 0.15, 0] })
  b.part('base', rcone(0.36, 0.26, 0.36, 0.06, 18), c.deep, { p: [0, 0.45, 0] })
  b.part('head', dome(0.42, Math.PI * 0.55, 20, 10), c.main, { p: [0, -0.05, 0] })
  b.part('head', torus(0.4, 0.05, 6, 22), c.deep, { p: [0, -0.05, 0], r: [Math.PI / 2, 0, 0] })
  eye(b, 'head', [0, 0.22, 0.31], 0.1, c.eye, 0, true)
  b.part('barrel', rcyl(0.11, 0.55, 0.04, 14), c.metal, { p: [0, 0, 0.25], r: [Math.PI / 2, 0, 0] })
  b.part('barrel', torus(0.11, 0.035, 6, 14), c.accent, { p: [0, 0, 0.52] })
  return b.build({ outline: 0.018, height: 1.2 })
}

export const poseTurret = (rig: Rig, pitch: number, recoil: number): void => {
  pose(rig, 'barrel', -pitch, 0, 0)
  nudge(rig, 'barrel', 0, 0, -recoil * 0.15)
}

export const buildEnemyRig = (kind: EnemyKind, colors?: EnemyColors): Rig => {
  const c = colors ?? BASE_COLORS[kind]
  switch (kind) {
    case 'hardhat': return buildHardhat(c)
    case 'trooper': return buildTrooper(c)
    case 'heli': return buildHeli(c)
    case 'hopper': return buildHopper(c)
    case 'roller': return buildRoller(c)
    case 'brute': return buildBrute(c)
    case 'turret': return buildTurret(c)
  }
}
