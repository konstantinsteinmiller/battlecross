import { AdditiveBlending, BufferGeometry, Color, DoubleSide, LatheGeometry, Mesh, MeshBasicMaterial, Vector2 } from 'three'
import { RigBuilder, sph, ell, cap, torus, rcyl, rcone, dome, lathe, stripUv, xform, type Rig, type V3, pose, nudge } from './kit'
import { PAL } from './palette'

/**
 * ─── Prof. Gauss ─────────────────────────────────────────────────────────────
 *
 * The valley's inventor, and an android herself: a head taller than Flux,
 * thin and a little stooped in a long white lab coat, round lens rings over
 * gentle cyan eyes, and a brass coil glowing under a glass cap where a bun
 * would sit (`story.md` § Gauss's look). The GDD's IP guard covers her too, so
 * nothing in the face is human: an ivory faceplate under a lilac-silver
 * cranial shell that reads as a grandmother's set hair, sensor discs for ears,
 * a smile arc. Her eye-lights and the coil share the rig's glow material, so
 * `setGaussGlow` dims both to the stasis blue.
 *
 * Sized for the intro's shots: seen side-on at the console from four metres,
 * so the read is the silhouette (coat tails, stoop, the glowing bun), and
 * framed chest-up inside her capsule, so her eyes sit low enough to stay in
 * that shot with the capsule's base under her.
 *
 * Built on the kit like every other rig; one pose function covers the intro's
 * beats (console, the Atlas disc, the lever, the stagger, the step into the
 * capsule, asleep). The hub will reuse it for the idle at the console.
 */

const COAT = '#eef2f7'
const COAT_SHADE = '#c3cddd'
const COAT_LINING = '#8e9ab2'
const FACE = '#f7e8dc'
const HAIR = '#aca2e2'
const HAIR_DEEP = '#7b70bd'
const SUIT = PAL.gunmetal
const SUIT_DEEP = PAL.heroSuitDeep
const BRASS = '#ffc45a'
const GOLD = '#d9a441'
const SHOE = '#4a3e5e'

export interface GaussRig extends Rig {
  /** The glass cap over the coil (a plain mesh riding the head bone). */
  cap: Mesh
}

/** Head-bone space: the skull's centre, the bun's seat and its tilt back. */
const SKULL: V3 = [0, 0.12, 0.005]
const BUN: V3 = [0, 0.255, -0.06]
const BUN_TILT = -0.5
/** The head's parts are authored at 1 and drawn this size. */
const HEAD = 1.34

/**
 * The coat's skirt, waist to hem, painted per vertex. A lathe whose hem is cut
 * on the bias: the tails hang lower behind, and a V opens at the front, so
 * the legs show through the parting like an unbuttoned coat. The seam sits at
 * the back and its normals are welded, so the outline hull stays closed.
 * `inset` < 1 and `inward` build the darker lining the parting shows.
 */
const skirt = (inset = 1, inward = false): BufferGeometry => {
  const prof: Array<[number, number]> = [[0.265, -0.44], [0.24, -0.3], [0.21, -0.16], [0.18, -0.04], [0.155, 0.06], [0.14, 0.13]]
  const segs = 32
  const n = prof.length
  const top = prof[n - 1]![1]
  const bottom = prof[0]![1]
  const g = stripUv(new LatheGeometry(prof.map(([r, y]) => new Vector2(r * inset, y)), segs, Math.PI))
  const pos = g.attributes.position!
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const a = Math.atan2(x, z)
    const u = (top - pos.getY(i)) / (top - bottom)
    const back = (1 - Math.cos(a)) / 2
    const notch = Math.max(0, 1 - Math.abs(a) / 0.42)
    pos.setXYZ(i, x, pos.getY(i) - 0.1 * back * u ** 1.5 + 0.24 * notch * u ** 2.2, z * 0.84)
  }
  g.computeVertexNormals()
  // Weld the seam: the first and last columns coincide.
  const nor = g.attributes.normal!
  for (let j = 0; j < n; j++) {
    const k0 = j
    const k1 = segs * n + j
    const x = nor.getX(k0) + nor.getX(k1)
    const y = nor.getY(k0) + nor.getY(k1)
    const z = nor.getZ(k0) + nor.getZ(k1)
    const l = Math.hypot(x, y, z) || 1
    nor.setXYZ(k0, x / l, y / l, z / l)
    nor.setXYZ(k1, x / l, y / l, z / l)
  }
  if (inward) {
    const idx = g.index!
    for (let i = 0; i < idx.count; i += 3) {
      const b = idx.getX(i + 1)
      idx.setX(i + 1, idx.getX(i + 2))
      idx.setX(i + 2, b)
    }
    for (let i = 0; i < nor.count; i++) nor.setXYZ(i, -nor.getX(i), -nor.getY(i), -nor.getZ(i))
  }
  return g
}

export const buildGauss = (): GaussRig => {
  const b = new RigBuilder()
  b.bone('hips', null, [0, 0.78, 0])
    .bone('spine', 'hips', [0, 0.15, 0], [0.14, 0, 0])
    .bone('chest', 'spine', [0, 0.2, 0], [0.24, 0, 0])
    .bone('head', 'chest', [0, 0.24, 0.035], [-0.42, 0, 0])
    .bone('shoulderL', 'chest', [-0.18, 0.15, -0.01])
    .bone('elbowL', 'shoulderL', [0, -0.25, 0])
    .bone('shoulderR', 'chest', [0.18, 0.15, -0.01])
    .bone('elbowR', 'shoulderR', [0, -0.25, 0])
    .bone('hipL', 'hips', [-0.08, -0.04, 0])
    .bone('kneeL', 'hipL', [0, -0.34, 0])
    .bone('hipR', 'hips', [0.08, -0.04, 0])
    .bone('kneeR', 'hipR', [0, -0.34, 0])
  /** Head parts, drawn a size up: the cast's heads are big, and hers has to
   *  read from the console shot's four metres. */
  const hp = (geo: BufferGeometry, hex: string, o: { p?: V3; r?: V3; glow?: boolean; outline?: boolean } = {}): void => {
    const p = o.p ?? [0, 0, 0]
    b.part('head', geo, hex, { ...o, p: [p[0] * HEAD, p[1] * HEAD, p[2] * HEAD], s: HEAD })
  }

  // ── The coat: a long skirt with tails, over graphite legs ──
  b.part('hips', skirt(), COAT)
  b.part('hips', skirt(0.965, true), COAT_LINING, { outline: false })
  // Waist and chest: one tapering line from the shoulders into the coat.
  b.part('spine', lathe([[0, -0.1], [0.125, -0.1], [0.13, -0.04], [0.12, 0.04], [0.118, 0.1], [0, 0.12]], 20), COAT, { s: [1, 1, 0.8] })
  b.part('spine', ell(0.09, 0.022, 0.03, 10, 6), COAT_SHADE, { p: [0, -0.01, -0.1] })
  b.mirror((s) => {
    b.part('spine', sph(0.011, 6, 4), GOLD, { p: [s * 0.065, -0.01, -0.125] })
  })
  b.part('chest', lathe([[0, -0.17], [0.112, -0.16], [0.132, -0.08], [0.15, 0.02], [0.155, 0.1], [0.138, 0.165], [0.09, 0.21], [0.04, 0.228], [0, 0.23]], 20), COAT, { s: [1, 1, 0.8] })
  // The coat's V over graphite, a cyan cravat tied at the throat.
  b.part('chest', ell(0.045, 0.075, 0.03, 10, 8), SUIT, { p: [0, 0.15, 0.098], r: [-0.3, 0, 0] })
  b.mirror((s) => {
    b.part('chest', ell(0.02, 0.055, 0.012, 8, 6), PAL.labCyan, { p: [s * 0.016, 0.11, 0.125], r: [-0.25, 0, s * 0.3] })
  })
  b.part('chest', ell(0.026, 0.022, 0.018, 10, 6), PAL.labCyan, { p: [0, 0.165, 0.12], r: [-0.3, 0, 0] })
  b.part('chest', sph(0.009, 6, 4), PAL.glowCyan, { p: [0, 0.166, 0.138], glow: true, outline: false })
  // The collar stands up round the neck, open at the front.
  b.part('chest', torus(0.068, 0.022, 8, 18, Math.PI * 1.4), COAT, { p: [0, 0.215, -0.005], r: [Math.PI / 2 - 0.25, 0, Math.PI * 0.8] })
  // Breast pocket: two pens and a tuning fork (her name, her trade).
  b.part('chest', ell(0.038, 0.042, 0.012, 10, 6), COAT_SHADE, { p: [-0.09, 0.0, 0.112], r: [-0.05, -0.3, 0], outline: false })
  b.part('chest', cap(0.008, 0.05, 5, 2), '#ff5f7a', { p: [-0.104, 0.045, 0.108] })
  b.part('chest', cap(0.008, 0.04, 5, 2), PAL.labBlue, { p: [-0.09, 0.04, 0.11] })
  b.part('chest', torus(0.011, 0.004, 4, 8, Math.PI), GOLD, { p: [-0.072, 0.045, 0.11], r: [0, 0, Math.PI] })
  b.mirror((s) => {
    b.part('chest', cap(0.004, 0.035, 4, 2), GOLD, { p: [-0.072 + s * 0.011, 0.063, 0.11] })
  })
  b.part('chest', cap(0.032, 0.06, 10, 2), SUIT_DEEP, { p: [0, 0.24, 0.02] })

  // ── Head: ivory faceplate, lilac-silver shell, lens rings, the coil bun ──
  hp(ell(0.122, 0.138, 0.12, 20, 14), FACE, { p: SKULL })
  hp(ell(0.138, 0.13, 0.14, 20, 14), HAIR, { p: [0, 0.158, -0.02] })
  // Set hair at the nape: the shell rounds out behind into a bob.
  hp(ell(0.13, 0.1, 0.1, 16, 10), HAIR, { p: [0, 0.09, -0.06] })
  b.mirror((s) => {
    // Brows: short kind arcs, lifted in the middle.
    hp(torus(0.028, 0.0065, 4, 8, Math.PI * 0.55), HAIR_DEEP, { p: [s * 0.05, 0.16, 0.112], r: [-0.25, s * 0.3, Math.PI * 0.225 + s * 0.12], outline: false })
    // Eyes: a dark socket, a cyan light, a glint.
    hp(ell(0.03, 0.033, 0.014, 12, 8), PAL.black, { p: [s * 0.048, 0.115, 0.108], r: [0, s * 0.38, 0], outline: false })
    hp(ell(0.019, 0.024, 0.01, 10, 8), PAL.glowCyan, { p: [s * 0.049, 0.113, 0.117], r: [0, s * 0.38, 0], glow: true, outline: false })
    hp(sph(0.0065, 6, 4), '#ffffff', { p: [s * 0.049 + 0.008, 0.124, 0.127], glow: true, outline: false })
    // Round lens rings, a touch proud of the face.
    hp(torus(0.037, 0.006, 5, 20), GOLD, { p: [s * 0.05, 0.114, 0.126], r: [0, s * 0.3, 0] })
    hp(cap(0.004, 0.06, 4, 2), GOLD, { p: [s * 0.1, 0.12, 0.07], r: [Math.PI / 2, s * -0.35, 0], outline: false })
    // Cheek lamps, warm and faint.
    hp(ell(0.022, 0.012, 0.006, 8, 6), '#f3a9bd', { p: [s * 0.078, 0.07, 0.1], r: [0, s * 0.62, 0], outline: false })
    // Sensor discs for ears, with a cyan dot like a pearl stud.
    hp(rcyl(0.03, 0.02, 0.007, 12, 2), GOLD, { p: [s * 0.12, 0.1, 0.0], r: [0, 0, Math.PI / 2] })
    hp(sph(0.01, 6, 4), PAL.glowCyan, { p: [s * 0.132, 0.1, 0.0], glow: true, outline: false })
  })
  hp(torus(0.012, 0.0045, 4, 6, Math.PI), GOLD, { p: [0, 0.122, 0.124], outline: false })
  // A small, closed smile.
  hp(torus(0.022, 0.005, 4, 10, Math.PI * 0.62), '#8a5f7c', { p: [0, 0.05, 0.106], r: [-0.3, 0, Math.PI * 1.19], outline: false })
  // The bun: a brass seat, the coil, a bright tip, under the glass cap.
  const bunAt = (y: number): V3 => [0, BUN[1] + y * Math.cos(BUN_TILT), BUN[2] - y * Math.sin(-BUN_TILT)]
  hp(rcyl(0.078, 0.04, 0.015, 18), SUIT, { p: BUN, r: [BUN_TILT, 0, 0] })
  hp(torus(0.078, 0.012, 6, 18), GOLD, { p: bunAt(0.012), r: [BUN_TILT + Math.PI / 2, 0, 0] })
  for (let k = 0; k < 3; k++) {
    hp(torus(0.052 - k * 0.012, 0.012, 6, 14), BRASS, { p: bunAt(0.035 + k * 0.026), r: [BUN_TILT + Math.PI / 2, 0, 0], glow: true, outline: false })
  }
  hp(sph(0.018, 8, 6), '#fff4c8', { p: bunAt(0.11), glow: true, outline: false })

  // ── Arms: slim coat sleeves, turned-back cuffs, ivory hands ──
  b.mirror((s, t) => {
    b.part(`shoulder${t}`, sph(0.072, 12, 8), COAT, { p: [0, -0.01, 0] })
    b.part(`shoulder${t}`, cap(0.056, 0.16, 10, 3), COAT, { p: [0, -0.12, 0] })
    b.part(`elbow${t}`, cap(0.052, 0.12, 10, 3), COAT, { p: [0, -0.085, 0] })
    b.part(`elbow${t}`, rcone(0.066, 0.056, 0.055, 0.014, 12), COAT_SHADE, { p: [0, -0.175, 0] })
    b.part(`elbow${t}`, ell(0.042, 0.058, 0.034, 10, 8), FACE, { p: [0, -0.24, 0.004] })
    b.part(`elbow${t}`, cap(0.015, 0.026, 6, 2), FACE, { p: [s * -0.034, -0.225, 0.024], r: [0.3, 0, s * 0.5] })
  })
  // ── Legs: graphite under the coat, neat plum shoes ──
  b.mirror((_s, t) => {
    b.part(`hip${t}`, cap(0.054, 0.27, 10, 3), SUIT, { p: [0, -0.17, 0] })
    b.part(`knee${t}`, cap(0.046, 0.26, 10, 3), SUIT, { p: [0, -0.17, 0] })
    b.part(`knee${t}`, ell(0.062, 0.05, 0.11, 12, 8), SHOE, { p: [0, -0.355, 0.035] })
    b.part(`knee${t}`, rcyl(0.026, 0.03, 0.008, 8), SUIT_DEEP, { p: [0, -0.39, -0.045] })
  })
  const rig = b.build({ outline: 0.012, height: 1.8 })
  // The glass cap: a separate transparent shell over the bun, on the head bone.
  const capMesh = new Mesh(
    xform(dome(0.086, Math.PI / 2, 18, 8), [0, 0, 0], [0, 0, 0], [1, 1.35, 1]),
    new MeshBasicMaterial({ color: new Color('#bfefff'), transparent: true, opacity: 0.28, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, toneMapped: false })
  )
  capMesh.position.set(...bunAt(0.02)).multiplyScalar(HEAD)
  capMesh.scale.setScalar(HEAD)
  capMesh.rotation.x = BUN_TILT
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
  nudge(rig, 'hips', 0, -0.012 * br - 0.05 * p.stagger, 0)
  pose(rig, 'spine', 0.08 * p.stagger + 0.06 * p.asleep, 0.25 * p.lever, jit)
  pose(rig, 'chest', 0.02 * br + 0.1 * p.lever, -0.1 * p.disc, -jit)
  pose(rig, 'head', 0.35 * p.asleep + 0.1 * p.stagger - 0.04 * br, 0.5 * p.look, jit * 2 + 0.06 * (1 - p.asleep) * Math.sin(t * 0.7))
  // Right arm: at rest by her side, or down onto the lever and pulled.
  const lv = Math.min(1, p.lever * 1.6)
  const pull = Math.max(0, p.lever * 1.6 - 0.6)
  pose(rig, 'shoulderR', 0.1 - 1.1 * lv + 0.5 * pull - 2.2 * p.slap, 0, 0.14 - 0.3 * lv - 0.2 * p.slap)
  pose(rig, 'elbowR', -0.35 - 0.4 * lv * (1 - pull), 0, 0)
  // Left arm: at rest, or forward, pressing the disc into Flux's chest.
  pose(rig, 'shoulderL', 0.1 - 1.45 * p.disc - 0.35 * p.stagger, 0.2 * p.disc, -0.14 - 0.2 * p.stagger + 0.08 * p.asleep)
  pose(rig, 'elbowL', -0.35 - 0.2 * p.disc - 0.9 * p.stagger, 0, 0)
  pose(rig, 'hipL', -0.08 * p.stagger, 0, -0.03)
  pose(rig, 'hipR', 0.06 * p.stagger, 0, 0.03)
  pose(rig, 'kneeL', 0.14 * p.stagger, 0, 0)
  pose(rig, 'kneeR', 0, 0, 0)
}
