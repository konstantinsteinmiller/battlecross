import { Group, Mesh, MeshBasicMaterial, AdditiveBlending, SphereGeometry, Color, DoubleSide, CircleGeometry } from 'three'
import {
  RigBuilder, sph, ell, cap, torus, rcyl, rcone, paintBy, xform, paint, merge, stripUv, type Rig, pose, nudge
} from './kit'
import { PAL } from './palette'
import { toonVC, outlineMat } from './toon'

/** Colour slots that gear recolours (see `data/items.ts`). */
export interface HeroColors {
  main: string // helmet, gloves, boots, briefs (the deep blue)
  accent: string // torso, upper limbs, helmet stripe, ears (the cyan)
  buster: string // arm cannon shell
  core: string // cannon muzzle glow
}

export const DEFAULT_HERO_COLORS: HeroColors = {
  main: PAL.heroBlue,
  accent: PAL.heroCyan,
  buster: PAL.heroBlue,
  core: PAL.glowCyan
}

/**
 * Cobalt — the player android, full body (Hero screen, results, beam-in,
 * cutaways). Chibi proportions of the sprite era: big round helmet with
 * ear discs and a centre stripe, big eyes, cyan torso and upper limbs, deep
 * blue gloves, briefs and oversized boots, and the right forearm IS the
 * buster.
 */
export const buildHero = (c: HeroColors = DEFAULT_HERO_COLORS): Rig => {
  const b = new RigBuilder()
  b.bone('hips', null, [0, 0.62, 0])
    .bone('spine', 'hips', [0, 0.1, 0])
    .bone('chest', 'spine', [0, 0.15, 0])
    .bone('head', 'chest', [0, 0.2, 0])
    .bone('shoulderL', 'chest', [-0.25, 0.07, 0])
    .bone('elbowL', 'shoulderL', [0, -0.19, 0])
    .bone('shoulderR', 'chest', [0.25, 0.07, 0])
    .bone('elbowR', 'shoulderR', [0, -0.19, 0])
    .bone('hipL', 'hips', [-0.105, -0.05, 0])
    .bone('kneeL', 'hipL', [0, -0.22, 0])
    .bone('hipR', 'hips', [0.105, -0.05, 0])
    .bone('kneeR', 'hipR', [0, -0.22, 0])

  // Pelvis / briefs
  b.part('hips', ell(0.175, 0.105, 0.14), c.main, { p: [0, 0.0, 0] })
  // Waist + chest (one rounded torso in two bones so it can twist)
  b.part('spine', ell(0.165, 0.12, 0.13), c.accent, { p: [0, 0.03, 0] })
  b.part('chest', ell(0.215, 0.165, 0.158), c.accent, { p: [0, 0.03, 0] })
  b.part('chest', torus(0.085, 0.028, 8, 18), c.main, { p: [0, 0.175, 0], r: [Math.PI / 2, 0, 0] })

  // Head: face + two-piece helmet that leaves the face open
  const headY = 0.155
  b.part('head', ell(0.182, 0.175, 0.17, 18, 14), PAL.skin, { p: [0, headY - 0.01, 0.018] })
  const helmetTop = paintBy(
    xform(stripUv(new SphereGeometry(0.212, 32, 14, 0, Math.PI * 2, 0, Math.PI * 0.4)), [0, headY, -0.004]),
    (x) => (Math.abs(x) < 0.058 ? c.accent : c.main)
  )
  b.painted('head', helmetTop)
  const band = stripUv(new SphereGeometry(0.212, 20, 10, Math.PI / 2 + Math.PI * 0.36, Math.PI * 2 - Math.PI * 0.72, Math.PI * 0.4, Math.PI * 0.3))
  b.part('head', band, c.main, { p: [0, headY, -0.004] })
  // Chin guard under the band (rounds off the jaw line)
  b.part('head', ell(0.15, 0.06, 0.12), c.main, { p: [0, headY - 0.13, -0.045] })
  b.mirror((s) => {
    // Ear discs: cyan face in a deep-blue rim
    b.part('head', rcyl(0.078, 0.05, 0.02, 16), c.accent, { p: [s * 0.205, headY - 0.02, -0.01], r: [0, 0, Math.PI / 2] })
    b.part('head', torus(0.074, 0.018, 6, 18), c.main, { p: [s * 0.215, headY - 0.02, -0.01], r: [0, Math.PI / 2, 0] })
    // Eyes: tall whites, blue iris, dark pupil, a glowing highlight
    b.part('head', ell(0.048, 0.066, 0.03), PAL.eyeWhite, { p: [s * 0.064, headY - 0.02, 0.172], r: [0, s * 0.22, 0] })
    b.part('head', ell(0.03, 0.04, 0.02), PAL.iris, { p: [s * 0.058, headY - 0.028, 0.194], r: [0, s * 0.22, 0] })
    b.part('head', ell(0.018, 0.024, 0.014), PAL.pupil, { p: [s * 0.056, headY - 0.03, 0.205], r: [0, s * 0.22, 0], outline: false })
    b.part('head', sph(0.008, 8, 6), '#ffffff', { p: [s * 0.046, headY - 0.006, 0.21], glow: true, outline: false })
  })
  b.part('head', ell(0.028, 0.009, 0.01), PAL.mouth, { p: [0, headY - 0.105, 0.176], outline: false })
  // Forehead gem where the stripe meets the rim
  b.part('head', ell(0.03, 0.022, 0.018), c.core, { p: [0, headY + 0.07, 0.2], glow: true, outline: false })

  // Arms
  b.mirror((s, t) => {
    b.part(`shoulder${t}`, sph(0.085, 14, 10), c.accent)
    b.part(`shoulder${t}`, cap(0.062, 0.08), c.accent, { p: [0, -0.09, 0] })
  })
  // Left: glove + fist
  b.part('elbowL', cap(0.082, 0.1), c.main, { p: [0, -0.09, 0] })
  b.part('elbowL', torus(0.078, 0.022, 6, 16), c.accent, { p: [0, -0.02, 0], r: [Math.PI / 2, 0, 0] })
  b.part('elbowL', sph(0.078, 14, 10), c.main, { p: [0, -0.22, 0.01] })
  // Right: the buster
  b.part('elbowR', rcyl(0.098, 0.3, 0.05, 18), c.buster, { p: [0, -0.14, 0] })
  b.part('elbowR', torus(0.09, 0.024, 6, 18), c.accent, { p: [0, -0.02, 0], r: [Math.PI / 2, 0, 0] })
  b.part('elbowR', torus(0.072, 0.024, 6, 18), c.accent, { p: [0, -0.29, 0], r: [Math.PI / 2, 0, 0] })
  b.part('elbowR', sph(0.052, 12, 8), c.core, { p: [0, -0.285, 0], glow: true, outline: false })

  // Legs + boots
  b.mirror((s, t) => {
    b.part(`hip${t}`, cap(0.072, 0.1), c.accent, { p: [0, -0.1, 0] })
    b.part(`knee${t}`, rcone(0.118, 0.098, 0.14, 0.035, 16), c.main, { p: [0, -0.1, 0] })
    b.part(`knee${t}`, torus(0.1, 0.024, 6, 16), c.accent, { p: [0, -0.03, 0], r: [Math.PI / 2, 0, 0] })
    b.part(`knee${t}`, ell(0.118, 0.095, 0.175, 16, 10), c.main, { p: [s * 0.004, -0.235, 0.045] })
    b.part(`knee${t}`, ell(0.1, 0.03, 0.15), PAL.heroDeep, { p: [s * 0.004, -0.315, 0.045], outline: false })
  })

  return b.build({ outline: 0.014, height: 1.52 })
}

/** Idle breathing + gentle sway. `t` in seconds. */
export const animateHeroIdle = (rig: Rig, t: number): void => {
  const br = Math.sin(t * 2.2)
  nudge(rig, 'hips', 0, br * 0.006, 0)
  pose(rig, 'chest', br * 0.025, Math.sin(t * 0.7) * 0.05, 0)
  pose(rig, 'head', -br * 0.02, Math.sin(t * 0.7 + 0.5) * 0.12, Math.sin(t * 0.9) * 0.03)
  pose(rig, 'shoulderL', 0, 0, -0.18 - br * 0.03)
  pose(rig, 'shoulderR', -0.1, 0, 0.2 + br * 0.03)
  pose(rig, 'elbowL', -0.25, 0, 0)
  pose(rig, 'elbowR', -0.35, 0, 0)
  pose(rig, 'hipL', 0, 0, -0.04)
  pose(rig, 'hipR', 0, 0, 0.04)
}

/** Victory pose (results): buster raised. */
export const animateHeroVictory = (rig: Rig, t: number): void => {
  const k = Math.min(1, t * 3)
  const bob = Math.sin(t * 5) * 0.01
  nudge(rig, 'hips', 0, bob, 0)
  pose(rig, 'shoulderR', -2.7 * k, 0, 0.25 * k)
  pose(rig, 'elbowR', -0.3 * k, 0, 0)
  pose(rig, 'shoulderL', 0, 0, -0.5 * k)
  pose(rig, 'elbowL', -1.2 * k, 0, 0)
  pose(rig, 'head', -0.15 * k, 0, 0.08 * k)
  pose(rig, 'chest', -0.08 * k, 0, 0)
}

// ─── First-person viewmodel ──────────────────────────────────────────────────

export interface Viewmodel {
  root: Group
  /** The glowing muzzle core — its colour/scale shows charge level. */
  core: Mesh
  coreMat: MeshBasicMaterial
  /** Additive halo around the muzzle while charging. */
  halo: Mesh
  haloMat: MeshBasicMaterial
  /** The barrier (block) disc in front of the left side of the view. */
  shield: Mesh
  shieldMat: MeshBasicMaterial
  /** Muzzle position in viewmodel space (for flashes). */
  muzzle: [number, number, number]
  setColors: (c: HeroColors) => void
}

const buildArmGeometry = (c: HeroColors) => {
  // Built along -Z (pointing into the screen). Units are viewmodel units.
  const toonParts = [
    xform(paint(rcyl(0.11, 0.42, 0.06, 20), c.buster), [0, 0, -0.1], [Math.PI / 2, 0, 0]),
    xform(paint(torus(0.1, 0.028, 8, 20), c.accent), [0, 0, 0.1]),
    xform(paint(torus(0.082, 0.028, 8, 20), c.accent), [0, 0, -0.31]),
    // A panel line + vent bumps so the shell reads as machinery up close
    xform(paint(torus(0.113, 0.01, 6, 24), PAL.heroDeep), [0, 0, -0.05]),
    xform(paint(ell(0.03, 0.02, 0.06), c.accent), [0.085, 0.06, -0.12], [0, 0, -0.6]),
    xform(paint(ell(0.03, 0.02, 0.06), c.accent), [-0.085, 0.06, -0.12], [0, 0, 0.6]),
    // Upper arm disappearing toward the camera
    xform(paint(cap(0.07, 0.2), c.accent), [0.02, 0.03, 0.26], [Math.PI / 2 - 0.25, 0, 0])
  ]
  return merge(toonParts)
}

export const buildViewmodel = (c: HeroColors = DEFAULT_HERO_COLORS): Viewmodel => {
  const root = new Group()
  let armGeo = buildArmGeometry(c)
  const arm = new Mesh(armGeo, toonVC())
  const armOutline = new Mesh(armGeo, outlineMat(0.008))
  armOutline.renderOrder = -1
  root.add(arm, armOutline)

  const coreMat = new MeshBasicMaterial({ color: new Color(c.core), toneMapped: false })
  const core = new Mesh(new SphereGeometry(0.06, 14, 10), coreMat)
  core.position.set(0, 0, -0.33)
  root.add(core)

  const haloMat = new MeshBasicMaterial({
    color: new Color(c.core), transparent: true, opacity: 0, blending: AdditiveBlending,
    depthWrite: false, toneMapped: false
  })
  const halo = new Mesh(new SphereGeometry(0.16, 16, 12), haloMat)
  halo.position.copy(core.position)
  root.add(halo)

  const shieldMat = new MeshBasicMaterial({
    color: new Color(PAL.glowCyan), transparent: true, opacity: 0, blending: AdditiveBlending,
    depthWrite: false, side: DoubleSide, toneMapped: false
  })
  const shield = new Mesh(new CircleGeometry(0.34, 6), shieldMat)
  shield.visible = false
  root.add(shield)

  const setColors = (nc: HeroColors) => {
    const next = buildArmGeometry(nc)
    arm.geometry = next
    armOutline.geometry = next
    armGeo.dispose()
    armGeo = next
    coreMat.color.set(nc.core)
    haloMat.color.set(nc.core)
  }

  return { root, core, coreMat, halo, haloMat, shield, shieldMat, muzzle: [0, 0, -0.36], setColors }
}

