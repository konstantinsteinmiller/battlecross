import { AdditiveBlending, Color, DoubleSide, Mesh, MeshBasicMaterial } from 'three'
import { RigBuilder, sph, ell, cap, torus, rcyl, dome, lathe, type Rig, pose, nudge } from './kit'
import { PAL } from './palette'

/**
 * ─── Prof. Gauss ─────────────────────────────────────────────────────────────
 *
 * The valley's inventor, and an android herself: tall and stooped in a white
 * lab coat, round spectacles, and a brass coil glowing under a glass cap on
 * her head (`story-arc.md` § 1, shot 2). Her eye-lights and the coil share the
 * rig's glow material, so `setGaussGlow` dims both to the stasis blue.
 *
 * Built on the kit like every other rig; one pose function covers the intro's
 * beats (console, the Atlas disc, the lever, the stagger, the step into the
 * capsule, asleep). The hub will reuse it for the idle at the console.
 */

const COAT = '#eef2f7'
const COAT_SHADE = '#c9d2df'
const SKIN = '#d6d9e6'
const SUIT = '#3b4458'
const BRASS = '#ffc45a'

export interface GaussRig extends Rig {
  /** The glass cap over the coil (a plain mesh riding the head bone). */
  cap: Mesh
}

export const buildGauss = (): GaussRig => {
  const b = new RigBuilder()
  b.bone('hips', null, [0, 0.95, 0])
    .bone('spine', 'hips', [0, 0.2, 0], [0.12, 0, 0])
    .bone('chest', 'spine', [0, 0.26, 0], [0.1, 0, 0])
    .bone('head', 'chest', [0, 0.3, 0.02], [-0.18, 0, 0])
    .bone('shoulderL', 'chest', [-0.25, 0.16, 0])
    .bone('elbowL', 'shoulderL', [0, -0.3, 0])
    .bone('shoulderR', 'chest', [0.25, 0.16, 0])
    .bone('elbowR', 'shoulderR', [0, -0.3, 0])
    .bone('hipL', 'hips', [-0.11, -0.04, 0])
    .bone('kneeL', 'hipL', [0, -0.45, 0])
    .bone('hipR', 'hips', [0.11, -0.04, 0])
    .bone('kneeR', 'hipR', [0, -0.45, 0])
  // The coat: a skirt flaring from the hips to the knees, lapels over the chest.
  b.part('hips', lathe([[0, 0.12], [0.2, 0.12], [0.24, -0.1], [0.3, -0.45], [0.34, -0.7], [0, -0.7]], 20), COAT)
  b.part('hips', rcyl(0.2, 0.06, 0.02, 16), COAT_SHADE, { p: [0, 0.08, 0] })
  b.part('spine', ell(0.2, 0.18, 0.16, 16, 12), COAT, { p: [0, 0.08, 0] })
  b.part('chest', ell(0.25, 0.22, 0.18, 18, 12), COAT, { p: [0, 0.06, 0] })
  b.part('chest', ell(0.08, 0.18, 0.04), PAL.labCyan, { p: [0, 0.02, 0.15] })
  b.mirror((s) => {
    b.part('chest', ell(0.07, 0.17, 0.03), COAT_SHADE, { p: [s * 0.1, 0.04, 0.155], r: [0, 0, s * 0.22] })
  })
  // A breast pocket with two pens.
  b.part('chest', ell(0.05, 0.05, 0.02), COAT_SHADE, { p: [-0.13, -0.02, 0.15] })
  b.part('chest', cap(0.01, 0.06), '#ff5f7a', { p: [-0.14, 0.03, 0.155] })
  b.part('chest', cap(0.01, 0.06), PAL.labBlue, { p: [-0.115, 0.03, 0.155] })
  b.part('chest', rcyl(0.07, 0.1, 0.03, 12), SKIN, { p: [0, 0.24, 0] })
  // Head: a long face, spectacles, eye-lights, the brass coil under glass.
  b.part('head', ell(0.15, 0.18, 0.15, 18, 14), SKIN, { p: [0, 0.12, 0.01] })
  b.part('head', ell(0.13, 0.03, 0.12), '#9aa3b8', { p: [0, 0.02, 0] })
  b.mirror((s) => {
    b.part('head', ell(0.028, 0.022, 0.02), '#7ff4ff', { p: [s * 0.055, 0.14, 0.14], glow: true, outline: false })
    b.part('head', torus(0.042, 0.009, 6, 16), '#2a3144', { p: [s * 0.058, 0.14, 0.15] })
    b.part('head', cap(0.012, 0.05), '#b0b8c8', { p: [s * 0.155, 0.12, 0.02], r: [0, 0, Math.PI / 2] })
  })
  b.part('head', cap(0.008, 0.03), '#2a3144', { p: [0, 0.14, 0.155], r: [0, 0, Math.PI / 2] })
  b.part('head', ell(0.045, 0.012, 0.01), '#7c6a8a', { p: [0, 0.03, 0.15] })
  b.part('head', rcyl(0.14, 0.05, 0.02, 18), '#5d6a82', { p: [0, 0.27, 0] })
  for (let k = 0; k < 3; k++) {
    b.part('head', torus(0.08 - k * 0.018, 0.018, 6, 16), BRASS, { p: [0, 0.31 + k * 0.035, 0], r: [Math.PI / 2, 0, 0], glow: true, outline: false })
  }
  b.part('head', sph(0.022, 8, 6), '#fff4c8', { p: [0, 0.42, 0], glow: true, outline: false })
  // Arms: coat sleeves, grey hands.
  b.mirror((_s, t) => {
    b.part(`shoulder${t}`, sph(0.085, 12, 8), COAT)
    b.part(`shoulder${t}`, cap(0.065, 0.2), COAT, { p: [0, -0.14, 0] })
    b.part(`elbow${t}`, cap(0.058, 0.18), COAT, { p: [0, -0.12, 0] })
    b.part(`elbow${t}`, torus(0.06, 0.018, 6, 14), COAT_SHADE, { p: [0, -0.22, 0], r: [Math.PI / 2, 0, 0] })
    b.part(`elbow${t}`, sph(0.06, 10, 8), '#8b93a6', { p: [0, -0.3, 0.01] })
  })
  // Legs: dark trousers under the coat, heavy boots.
  b.mirror((_s, t) => {
    b.part(`hip${t}`, cap(0.07, 0.34), SUIT, { p: [0, -0.2, 0] })
    b.part(`knee${t}`, cap(0.06, 0.34), SUIT, { p: [0, -0.2, 0] })
    b.part(`knee${t}`, ell(0.08, 0.06, 0.13), '#252932', { p: [0, -0.43, 0.04] })
  })
  const rig = b.build({ outline: 0.014, height: 1.95 })
  // The glass cap: a separate transparent shell on the head bone.
  const capMesh = new Mesh(
    dome(0.12, Math.PI / 2, 18, 8),
    new MeshBasicMaterial({ color: new Color('#bfefff'), transparent: true, opacity: 0.28, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, toneMapped: false })
  )
  capMesh.position.set(0, 0.28, 0)
  rig.bones.head!.add(capMesh)
  return Object.assign(rig, { cap: capMesh })
}

const WARM = new Color('#ffffff')
const STASIS = new Color('#5b8cff')
const _c = new Color()

/** Her eye-lights and coil: 1 = awake, 0 = asleep (a slow blue pulse, `pulse` 0..1). */
export const setGaussGlow = (rig: Rig, awake: number, pulse = 0): void => {
  _c.copy(STASIS).multiplyScalar(0.35 + 0.35 * pulse).lerp(WARM, Math.max(0, Math.min(1, awake)))
  rig.glowMaterial.color.copy(_c)
}

export interface GaussPose {
  /** Her right hand on the capsule's lever, 0 reaching … 1 thrown. */
  lever: number
  /** Her left arm out, pressing the Atlas disc home, 0..1. */
  disc: number
  /** The red crackle's stagger, 0..1. */
  stagger: number
  /** Head turn, −1 (her right) … 1 (her left). */
  look: number
  /** Hand up to slap the panel inside the capsule, 0..1. */
  slap: number
  /** Asleep in stasis: head bowed, arms slack, 0..1. */
  asleep: number
}

export const newGaussPose = (): GaussPose => ({ lever: 0, disc: 0, stagger: 0, look: 0, slap: 0, asleep: 0 })

export const poseGauss = (rig: Rig, p: GaussPose, t: number): void => {
  const br = Math.sin(t * 1.9) * (1 - p.asleep)
  const jit = p.stagger * Math.sin(t * 43) * 0.05
  nudge(rig, 'hips', 0, -0.015 * br - 0.05 * p.stagger, 0)
  pose(rig, 'spine', 0.08 * p.stagger + 0.06 * p.asleep, 0.25 * p.lever, jit)
  pose(rig, 'chest', 0.02 * br + 0.1 * p.lever, -0.1 * p.disc, -jit)
  pose(rig, 'head', 0.2 * p.asleep + 0.1 * p.stagger, 0.5 * p.look, jit * 2)
  // Right arm: at rest by her side, or down onto the lever and pulled.
  const lv = Math.min(1, p.lever * 1.6)
  const pull = Math.max(0, p.lever * 1.6 - 0.6)
  pose(rig, 'shoulderR', -1.1 * lv + 0.5 * pull - 2.2 * p.slap, 0, 0.12 - 0.3 * lv - 0.2 * p.slap)
  pose(rig, 'elbowR', -0.3 - 0.4 * lv * (1 - pull), 0, 0)
  // Left arm: at rest, or forward, pressing the disc into Flux's chest.
  pose(rig, 'shoulderL', -1.35 * p.disc - 0.35 * p.stagger, 0.2 * p.disc, -0.1 - 0.2 * p.stagger + 0.08 * p.asleep)
  pose(rig, 'elbowL', -0.25 - 0.25 * p.disc - 0.9 * p.stagger, 0, 0)
  pose(rig, 'hipL', -0.08 * p.stagger, 0, -0.03)
  pose(rig, 'hipR', 0.06 * p.stagger, 0, 0.03)
  pose(rig, 'kneeL', 0.14 * p.stagger, 0, 0)
  pose(rig, 'kneeR', 0, 0, 0)
}
