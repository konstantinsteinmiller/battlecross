import { ExtrudeGeometry, Quaternion, Shape, Vector3, type BufferGeometry } from 'three'
import {
  RigBuilder, cap, ell, gradY, lathe, lens, limb, mixHex, paintBy, rbox, rcone, rcyl, rock, rod, sph, spike, stripUv, tone, torus,
  type Rig, type V3
} from '../kit'

/**
 * ─── Things that are not people ──────────────────────────────────────────────
 *
 * Wolves, spiders, treants, golems, elementals, naga, wyverns, the dragon and
 * the Aether-Tech turrets. Same kit and rules as the humanoid (rounded parts,
 * one skinned mesh), built to the hero's standard (roadmap #74): every part
 * shaded (a light back, a pale belly, darker toward the ground), limbs in
 * jointed segments, eyes that GLARE from under a brow instead of a doll's
 * eyes, and a silhouette of their own: a ruff and fangs, bark ridges and twig
 * fingers, boulders with light in their cracks, membrane wings on finger bones.
 *
 * Bone names matter: `anim.ts` poses each family by them. The two-legged ones
 * (treant, golem, elemental, naga) share the humanoid's names, elbows
 * (`fore`) and knees (`shin`, `foot`) included, and so its choreography; each
 * carries a `weapon` bone whose +Z runs to where its blow lands (down the arm
 * for a fist, up the shaft for a trident): a swing's trail is read from it.
 */

/** A fist is its own weapon: the bone points down the arm. */
const FIST: V3 = [Math.PI / 2, 0, 0]

const DARK = '#1b1626'
const BONE_WHITE = '#f4ecd8'

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x)

/** Lowest and highest y of a geometry, in its own space. */
const yRange = (g: BufferGeometry): [number, number] => {
  const p = g.attributes.position!
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < lo) lo = y; if (y > hi) hi = y }
  return [lo, hi]
}

/** A part shaded darker below and lighter above (in its own space, before it is placed). */
const shade = (g: BufferGeometry, hex: string, lo = 0.72, hi = 1.12): BufferGeometry => gradY(g, tone(hex, lo), tone(hex, hi))

/** An animal's coat: a pale underside, the coat, a darker back. */
const coat = (g: BufferGeometry, belly: string, fur: string, back: string): BufferGeometry => {
  const [lo, hi] = yRange(g)
  const span = Math.max(1e-5, hi - lo)
  return paintBy(g, (_x, y) => {
    const k = (y - lo) / span
    return k < 0.38 ? mixHex(belly, fur, clamp01(k / 0.38) ** 0.7) : mixHex(fur, back, clamp01((k - 0.38) / 0.62) * 0.85)
  })
}

/** A geometry turned so its +Y runs from `a` to `b`, and set there: a strut, a spar, a finger bone. */
const between = (g: BufferGeometry, a: V3, b: V3): BufferGeometry => {
  const d = new Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2])
  const len = d.length() || 1e-3
  g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.divideScalar(len)))
  g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2)
  return g
}

/** A flat outline (x across, y forward), extruded thin and laid on the ground plane (forward = +Z). */
const plate = (pts: Array<[number, number]>, thick: number): BufferGeometry => {
  const s = new Shape()
  s.moveTo(pts[0]![0], pts[0]![1])
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i]![0], pts[i]![1])
  s.closePath()
  const g = new ExtrudeGeometry(s, { depth: thick, bevelEnabled: false, curveSegments: 2 })
  g.translate(0, 0, -thick / 2)
  g.rotateX(Math.PI / 2)
  g.computeVertexNormals()
  // Indexed like every kit part, so it merges with them (each face keeps its own corners).
  g.setIndex(Array.from({ length: g.attributes.position!.count }, (_, i) => i))
  return stripUv(g)
}

/**
 * Eyes that glare: a dark socket, the eye lit inside it, a catch of light,
 * and a brow drawn down over the inner corner. `tilt` slants the eye (inner
 * corner low), the look of something that means it.
 */
const glare = (b: RigBuilder, bone: string, x: number, y: number, z: number, r: number, iris: string, o: { brow?: string; tilt?: number; socket?: string; yaw?: number } = {}): void => {
  const tilt = o.tilt ?? 0.32
  b.mirror((s) => {
    const yaw = s * (o.yaw ?? 0.25)
    b.part(bone, lens(r * 1.3, r * 0.95, r * 0.55, 8, 6), o.socket ?? DARK, { p: [s * x, y, z], r: [0, yaw, -s * tilt], outline: false })
    b.part(bone, lens(r, r * 0.6, r * 0.45, 8, 6), iris, { p: [s * x, y - r * 0.05, z + r * 0.12], r: [0, yaw, -s * tilt], glow: true, outline: false })
    b.part(bone, sph(r * 0.2, 5, 4), '#ffffff', { p: [s * (x - r * 0.25), y + r * 0.12, z + r * 0.52], glow: true, outline: false })
    if (o.brow) b.part(bone, rbox(r * 2.6, r * 0.6, r * 1.1, 0.5, 8, 6), o.brow, { p: [s * x, y + r * 0.85, z - r * 0.05], r: [0.25, yaw, s * 0.42] })
  })
}

// ─── Four legs: wolf, void stalker, frost howler ─────────────────────────────

type BeastVariant = 'wolf' | 'stalker' | 'howler'

const BEAST: Record<BeastVariant, { fur: string; back: string; belly: string; eye: string; accent: string; nose: string }> = {
  wolf: { fur: '#8e98ac', back: '#58627a', belly: '#e4e8f0', eye: '#ffb02a', accent: '#c8ced8', nose: '#2a2430' },
  stalker: { fur: '#4a2a8a', back: '#24104a', belly: '#9a6ae8', eye: '#f0c0ff', accent: '#b06aff', nose: '#14081f' },
  howler: { fur: '#dce6f4', back: '#8ea8cc', belly: '#ffffff', eye: '#7fe8ff', accent: '#9fd8ff', nose: '#3a4a66' }
}

export const buildBeast = (variant: BeastVariant): Rig => {
  const P = BEAST[variant]
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.46, 0])
  b.bone('head', 'body', [0, 0.12, 0.36])
  b.bone('tail', 'body', [0, 0.1, -0.4])
  const big = variant === 'howler' ? 1.12 : 1
  // ── The body: a deep chest, lean haunches, a ruff at the neck ──
  b.painted('body', coat(ell(0.25 * big, 0.27 * big, 0.3, 12, 8), P.belly, P.fur, P.back), { p: [0, 0.03, 0.12] })
  b.painted('body', coat(ell(0.2, 0.21, 0.27, 12, 8), P.belly, P.fur, P.back), { p: [0, 0.02, -0.2] })
  const ruff = variant === 'howler' ? 9 : 7
  for (let i = 0; i < ruff; i++) {
    const a = -1.75 + (3.5 * i) / (ruff - 1)
    b.part('body', spike(0.075 * big, 0.26 * big, 5), tone(P.fur, 1.08), { p: [Math.sin(a) * 0.19 * big, 0.1 + Math.cos(a) * 0.17 * big, 0.3], r: [-0.75, 0, -a] })
  }
  for (let i = 0; i < 4; i++) b.part('body', spike(0.05, 0.16, 5), P.back, { p: [0, 0.27 - i * 0.01, 0.1 - i * 0.14], r: [-0.9, 0, 0] })
  // ── Legs: the front straight, the hind with a hock; paws with claws ──
  for (const [n, x, z] of [['legFL', -0.16, 0.24], ['legFR', 0.16, 0.24], ['legBL', -0.16, -0.26], ['legBR', 0.16, -0.26]] as const) {
    b.bone(n, 'body', [x, -0.1, z])
    const hind = n[3] === 'B'
    if (hind) {
      b.painted(n, coat(ell(0.1, 0.15, 0.13, 10, 6), P.belly, P.fur, P.back), { p: [0, -0.03, 0.01] })
      b.painted(n, shade(limb(0.06, 0.045, 0.17, 7, 2), P.fur, 0.75, 1), { p: [0, -0.13, -0.05], r: [-0.4, 0, 0] })
      b.painted(n, shade(limb(0.045, 0.04, 0.1, 6, 2), P.back, 0.8, 1), { p: [0, -0.27, -0.1], r: [0.55, 0, 0] })
    } else {
      b.painted(n, shade(limb(0.075, 0.058, 0.2, 7, 2), P.fur, 0.78, 1.05), { p: [0, 0.02, 0], r: [0.1, 0, 0] })
      b.painted(n, shade(limb(0.055, 0.045, 0.16, 7, 2), P.fur, 0.75, 1), { p: [0, -0.17, 0.02] })
    }
    b.painted(n, shade(ell(0.075, 0.048, 0.1, 8, 5), P.back, 0.6, 0.9), { p: [0, -0.33, 0.05] })
    for (let t = -1; t <= 1; t++) b.part(n, spike(0.016, 0.06, 4), BONE_WHITE, { p: [t * 0.035, -0.35, 0.14], r: [1.6, 0, 0], outline: false })
  }
  // ── The head: a skull, a long muzzle, a jaw with fangs, ears laid back a little ──
  b.painted('head', coat(sph(0.2, 12, 9), P.belly, P.fur, P.back), { p: [0, 0.08, 0.04] })
  b.painted('head', coat(ell(0.1, 0.085, 0.18, 10, 6), P.belly, P.fur, P.back), { p: [0, 0.01, 0.25] })
  b.part('head', ell(0.045, 0.035, 0.035, 8, 5), P.nose, { p: [0, 0.055, 0.42] })
  b.painted('head', shade(ell(0.085, 0.045, 0.14, 8, 5), P.belly, 0.75, 0.95), { p: [0, -0.075, 0.22] })
  b.part('head', lens(0.07, 0.016, 0.03, 8, 3), DARK, { p: [0, -0.04, 0.35], outline: false })
  b.mirror((s) => {
    b.part('head', spike(0.02, 0.08, 4), BONE_WHITE, { p: [s * 0.045, -0.06, 0.34], r: [Math.PI, 0, 0], outline: false })
    b.part('head', spike(0.055, 0.17, 5), tone(P.fur, 1.05), { p: [s * 0.17, 0.02, 0.05], r: [0.3, 0, s * 1.9] })
    b.painted('head', shade(rcone(0.085, 0.012, 0.24, 0.012, 7), P.back, 0.85, 1.15), { p: [s * 0.12, 0.28, -0.03], r: [-0.35, 0, -s * 0.3] })
    b.part('head', rcone(0.05, 0.008, 0.15, 0.008, 6), variant === 'stalker' ? P.accent : '#6a4a5a', { p: [s * 0.122, 0.27, 0.005], r: [-0.35, 0, -s * 0.3], outline: false })
  })
  glare(b, 'head', 0.085, 0.12, 0.2, 0.045, P.eye, { brow: tone(P.back, 0.9) })
  // ── The tail ──
  if (variant === 'stalker') {
    // A whip of segments tipped with void light.
    for (let k = 0; k < 4; k++) b.part('body', spike(0.06, 0.22, 5), P.accent, { p: [0, 0.3, 0.24 - k * 0.15], r: [-0.5, 0, 0] })
    b.painted('tail', shade(rcone(0.06, 0.02, 0.5, 0.012, 7), P.fur), { p: [0, 0.05, -0.26], r: [-1.3, 0, 0] })
    b.part('tail', spike(0.06, 0.18, 5), P.accent, { p: [0, 0.14, -0.55], r: [-1.1, 0, 0], glow: true })
  } else {
    b.painted('tail', coat(ell(0.085, 0.085, 0.15, 8, 6), P.belly, P.fur, P.back), { p: [0, 0.03, -0.08], r: [0.6, 0, 0] })
    b.painted('tail', coat(ell(0.1, 0.1, 0.15, 8, 6), P.belly, P.fur, P.back), { p: [0, 0.11, -0.2], r: [0.9, 0, 0] })
    b.part('tail', ell(0.07, 0.07, 0.1, 8, 5), tone(P.belly, 0.98), { p: [0, 0.19, -0.3], r: [1.1, 0, 0] })
  }
  if (variant === 'howler') {
    // Frost grown out of its back.
    for (let k = 0; k < 5; k++) b.part('body', spike(0.06, 0.32 - Math.abs(k - 2) * 0.05, 5), k % 2 ? '#bfe6ff' : '#e8f8ff', { p: [(k % 2 ? 0.06 : -0.06), 0.3, 0.2 - k * 0.12], r: [-0.5, 0, (k % 2 ? -0.3 : 0.3)] })
  }
  return b.build({ height: 0.95 * big })
}

// ─── The war boar (Tusker, #74) ──────────────────────────────────────────────

/**
 * The Goblin King's war boar: a deep, humped body on short legs, a bristle
 * ridge down the spine, a low head with a long snout and great curling tusks,
 * red war barding with gold rivets on its flanks, and a saddle (`saddle` bone)
 * the King sits in (`gfx/rigs/index.ts` seats the rider). Bone names are the
 * wolf's, so the beast's gait and bite drive it.
 */
export const buildBoar = (): Rig => {
  const hide = '#6e4a38'
  const back = '#3e2a20'
  const belly = '#a88068'
  const snout = '#c88a7a'
  const tusk = '#f4ecd8'
  const cloth = '#8a2a1c'
  const gold = '#d9a83a'
  const leather = '#5a3a24'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.5, 0])
  b.bone('head', 'body', [0, 0.02, 0.52])
  b.bone('tail', 'body', [0, 0.1, -0.5])
  b.bone('saddle', 'body', [0, 0.42, -0.04])
  // ── The body: a hump over the shoulders, sloping to the haunch ──
  b.painted('body', coat(ell(0.36, 0.36, 0.42, 12, 9), belly, hide, back), { p: [0, 0.06, 0.16] })
  b.painted('body', coat(ell(0.32, 0.31, 0.38, 12, 9), belly, hide, back), { p: [0, 0.0, -0.26] })
  // The bristle ridge, tall over the hump.
  for (let k = 0; k < 9; k++) {
    const t = k / 8
    b.part('body', spike(0.05, 0.22 - Math.abs(t - 0.3) * 0.16, 4), back, { p: [(k % 2 ? 0.03 : -0.03), 0.39 - t * 0.1, 0.42 - t * 0.78], r: [-0.5, 0, (k % 2 ? -0.2 : 0.2)] })
  }
  // War barding: a red cloth down each flank, a gold-studded hem.
  b.mirror((s) => {
    const cl = plate(([[0, 0.24], [0.3, 0.2], [0.34, -0.22], [0, -0.3]] as Array<[number, number]>).map(([x, y]) => [x, y] as [number, number]), 0.025)
    b.painted('body', gradY(cl, tone(cloth, 0.7), tone(cloth, 1.15)), { p: [s * 0.34, 0.06, -0.02], r: [0, 0, s * (Math.PI / 2 - 0.12)] })
    for (let k = 0; k < 4; k++) b.part('body', sph(0.025, 5, 4), gold, { p: [s * 0.37, -0.22, 0.2 - k * 0.15], outline: false })
  })
  // The saddle: a leather seat on a blanket, a horn at the front.
  b.painted('saddle', shade(rbox(0.42, 0.1, 0.44, 0.4, 8, 6), leather, 0.7, 1.15), { p: [0, 0, 0] })
  b.painted('saddle', shade(rbox(0.5, 0.04, 0.54, 0.3, 8, 4), cloth, 0.75, 1.1), { p: [0, -0.06, 0] })
  b.part('saddle', rcone(0.04, 0.02, 0.14, 0.01, 6), gold, { p: [0, 0.1, 0.2] })
  // ── Legs: short, thick, on dark hooves ──
  for (const [n, x, z] of [['legFL', -0.2, 0.3], ['legFR', 0.2, 0.3], ['legBL', -0.2, -0.32], ['legBR', 0.2, -0.32]] as const) {
    b.bone(n, 'body', [x, -0.18, z])
    const hind = n[3] === 'B'
    b.painted(n, coat(ell(0.12, hind ? 0.17 : 0.14, 0.14, 9, 6), belly, hide, back), { p: [0, -0.02, 0] })
    b.painted(n, shade(limb(0.075, 0.06, 0.2, 7, 2), hide, 0.65, 1), { p: [0, -0.1, hind ? -0.02 : 0.02], r: [hind ? -0.2 : 0.1, 0, 0] })
    b.painted(n, shade(rcone(0.07, 0.06, 0.07, 0.015, 7), '#2a1e1a', 0.7, 1.1), { p: [0, -0.3, 0.02] })
  }
  // ── The head: low and heavy, a long snout, tusks curling up ──
  b.painted('head', coat(ell(0.25, 0.24, 0.27, 12, 9), belly, hide, back), { p: [0, 0.0, 0.05] })
  b.painted('head', coat(rcone(0.17, 0.12, 0.3, 0.04, 10), belly, hide, back), { p: [0, -0.05, 0.3], r: [Math.PI / 2, 0, 0] })
  b.part('head', rcyl(0.12, 0.05, 0.03, 10, 2), snout, { p: [0, -0.05, 0.46], r: [Math.PI / 2, 0, 0] })
  b.mirror((s) => {
    b.part('head', sph(0.03, 5, 4), '#3a1e1e', { p: [s * 0.045, -0.04, 0.48], outline: false })
    // The tusks: out of the lower jaw, curling up and back.
    curl(b, 'head', [[s * 0.1, -0.12, 0.36], [s * 0.2, -0.08, 0.44], [s * 0.25, 0.06, 0.42], [s * 0.22, 0.16, 0.34]], 0.045, 0.01, '#d8c8a8', tusk)
    // Small ears, laid back.
    b.painted('head', shade(rcone(0.08, 0.012, 0.18, 0.01, 6), back, 0.8, 1.1), { p: [s * 0.17, 0.2, -0.06], r: [-0.9, 0, -s * 0.5] })
  })
  glare(b, 'head', 0.12, 0.08, 0.19, 0.045, '#ff7a3a', { brow: back, tilt: 0.45 })
  // A short tail with a tuft.
  b.painted('tail', shade(limb(0.03, 0.02, 0.18, 5, 2), hide), { r: [2.4, 0, 0] })
  b.part('tail', spike(0.05, 0.12, 4), back, { p: [0, 0.1, -0.12], r: [2.2, 0, 0] })
  return b.build({ height: 1.1 })
}

// ─── Eight legs (six drawn): spider, brood spider, brood mother ──────────────

type SpiderVariant = 'spider' | 'brood' | 'mother'

const SPIDER: Record<SpiderVariant, { body: string; mark: string; eye: string }> = {
  spider: { body: '#5a3f8f', mark: '#b48cff', eye: '#ff6ab0' },
  brood: { body: '#6a2a9a', mark: '#ff6ab0', eye: '#ffe07a' },
  mother: { body: '#3a1a5a', mark: '#ff4a8a', eye: '#ffe07a' }
}

export const buildSpider = (variant: SpiderVariant): Rig => {
  const P = SPIDER[variant]
  const big = variant === 'spider' ? 1 : 1.12
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.36, 0])
  b.bone('head', 'body', [0, 0.02, 0.22])
  // The abdomen: banded, a glowing mark on top, bristles.
  const abd = ell(0.3 * big, 0.26 * big, 0.36 * big, 12, 8)
  const [lo, hi] = yRange(abd)
  paintBy(abd, (_x, y, z) => {
    const k = (y - lo) / (hi - lo)
    const band = Math.abs(Math.sin(z * 17)) > 0.82 && k > 0.35
    return band ? tone(P.mark, 0.75) : mixHex(tone(P.body, 0.6), tone(P.body, 1.15), k)
  })
  b.painted('body', abd, { p: [0, 0.08, -0.3] })
  b.part('body', ell(0.09, 0.03, 0.15, 8, 5), P.mark, { p: [0, 0.08 + 0.255 * big, -0.3], glow: true, outline: false })
  for (let i = 0; i < 6; i++) b.part('body', spike(0.025, 0.12, 4), tone(P.body, 0.55), { p: [(i % 2 ? 0.12 : -0.12), 0.24, -0.16 - i * 0.07], r: [-0.8, 0, (i % 2 ? -0.5 : 0.5)] })
  b.painted('body', shade(ell(0.2, 0.15, 0.22, 12, 8), P.body, 0.65, 1.15), { p: [0, 0.04, 0.06] })
  if (variant !== 'spider') {
    // Spines along the back, egg-white sacs under it.
    for (let i = 0; i < 4; i++) b.part('body', spike(0.045, 0.24, 5), P.mark, { p: [0, 0.3 * big, -0.12 - i * 0.12], r: [-0.4, 0, 0] })
  }
  // The head: a cluster of lit eyes, jaws and fangs.
  b.painted('head', shade(sph(0.16, 10, 8), P.body, 0.7, 1.15), { p: [0, 0.04, 0.04] })
  b.mirror((s) => {
    b.part('head', sph(0.045, 7, 5), P.eye, { p: [s * 0.055, 0.1, 0.165], glow: true, outline: false })
    b.part('head', sph(0.026, 6, 4), P.eye, { p: [s * 0.115, 0.12, 0.13], glow: true, outline: false })
    b.part('head', sph(0.022, 6, 4), P.eye, { p: [s * 0.035, 0.16, 0.14], glow: true, outline: false })
    b.painted('head', shade(ell(0.05, 0.075, 0.05, 8, 5), P.body, 0.6, 1), { p: [s * 0.055, -0.05, 0.15] })
    b.part('head', spike(0.022, 0.13, 5), BONE_WHITE, { p: [s * 0.05, -0.13, 0.19], r: [Math.PI - 0.35, 0, s * 0.15] })
    b.painted('head', shade(limb(0.025, 0.02, 0.14, 5, 2), P.body), { p: [s * 0.12, 0, 0.12], r: [-0.9, 0, s * 0.4] })
  })
  // Legs: a femur up and out, a knee, a long shin down to the ground.
  for (let k = 0; k < 3; k++) {
    b.mirror((s, t) => {
      const n = `leg${t}${k}`
      b.bone(n, 'body', [s * 0.15, 0.02, 0.1 - k * 0.15], [0, s * (k - 1) * 0.5, 0])
      const f = 0.34 * big
      const kx = s * 0.8 * f
      const ky = 0.6 * f
      b.painted(n, shade(limb(0.045, 0.036, f, 6, 2), P.body, 0.7, 1.1), { p: [0, 0, 0], r: [0, 0, s * 2.214] })
      b.part(n, sph(0.046, 6, 5), tone(P.body, 0.8), { p: [kx, ky, 0] })
      const shin = (0.36 + 0.02 + ky) / 0.93
      b.painted(n, gradY(limb(0.038, 0.016, shin, 6, 2), DARK, tone(P.body, 0.75)), { p: [kx, ky, 0], r: [0, 0, s * 0.38] })
      b.part(n, spike(0.02, 0.1, 4), tone(P.mark, 0.8), { p: [kx + s * 0.03, ky - 0.08, 0], r: [0, 0, -s * 0.9], outline: false })
    })
  }
  return b.build({ height: 0.8 * big })
}

// ─── Treant ──────────────────────────────────────────────────────────────────

type TreantVariant = 'treant' | 'elder' | 'thorn'

const TREANT: Record<TreantVariant, { bark: string; leaf: string; leaf2: string; eye: string; extra: string }> = {
  treant: { bark: '#7a5a3a', leaf: '#4f9a3e', leaf2: '#8fd45a', eye: '#ffe07a', extra: '#a8e06a' },
  elder: { bark: '#5a4632', leaf: '#3a7f36', leaf2: '#6fbf4a', eye: '#ffe07a', extra: '#ffd24a' },
  thorn: { bark: '#3e2a26', leaf: '#4a2a3a', leaf2: '#7a3a4a', eye: '#ff6a4a', extra: '#c8303a' }
}

/** Bark: furrows running up it (by the angle round the trunk), darker toward the roots. */
const bark = (g: BufferGeometry, hex: string): BufferGeometry => {
  const [lo, hi] = yRange(g)
  return paintBy(g, (x, y, z) => {
    const k = (y - lo) / Math.max(1e-5, hi - lo)
    const furrow = Math.abs(Math.sin(Math.atan2(x, z) * 6 + y * 4)) > 0.78
    return tone(hex, (furrow ? 0.62 : 1) * (0.75 + 0.35 * k))
  })
}

export const buildTreant = (variant: TreantVariant): Rig => {
  const P = TREANT[variant]
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('hips', 'root', [0, 0.34, 0])
  b.bone('torso', 'hips', [0, 0.02, 0])
  b.bone('head', 'torso', [0, 0.5, 0])
  b.mirror((s, t) => {
    b.bone('arm' + t, 'torso', [s * 0.36, 0.42, 0])
    b.bone('fore' + t, 'arm' + t, [0, -0.22, 0])
    b.bone('hand' + t, 'fore' + t, [0, -0.2, 0])
    if (s > 0) b.bone('weapon', 'handR', [0, 0, 0], FIST)
    else b.bone('offhand', 'handL', [0, 0, 0], FIST)
    b.bone('leg' + t, 'hips', [s * 0.16, 0, 0])
    b.bone('shin' + t, 'leg' + t, [0, -0.18, 0])
    b.bone('foot' + t, 'shin' + t, [0, -0.14, 0])
    // Legs of root: thick, and splaying into root toes at the ground.
    b.painted('leg' + t, bark(limb(0.15, 0.125, 0.18, 9, 2), P.bark), {})
    b.painted('shin' + t, bark(limb(0.125, 0.11, 0.14, 9, 2), P.bark), {})
    b.painted('foot' + t, shade(rock(0.13, s > 0 ? 3 : 5, 8, 6), P.bark, 0.6, 0.9), { p: [0, -0.02, 0.03], s: [1, 0.6, 1.2] })
    for (let r = -1; r <= 1; r++) b.painted('foot' + t, shade(rcone(0.05, 0.012, 0.22, 0.01, 6), P.bark, 0.6, 0.95), { p: [r * 0.07, -0.05, 0.13], r: [1.35, r * 0.4, 0] })
    // Arms of branch: a mossy shoulder, twigs off the forearm, twig fingers.
    b.painted('arm' + t, bark(limb(0.1, 0.085, 0.22, 8, 2), P.bark), {})
    b.painted('arm' + t, shade(sph(0.15, 9, 7), P.leaf, 0.75, 1.2), { p: [0, 0.03, 0] })
    b.painted('fore' + t, bark(limb(0.085, 0.075, 0.2, 8, 2), P.bark), {})
    b.part('fore' + t, spike(0.03, 0.2, 5), tone(P.bark, 0.9), { p: [s * 0.08, -0.08, -0.02], r: [0, 0, -s * 0.9] })
    b.part('fore' + t, sph(0.06, 6, 5), P.leaf2, { p: [s * 0.16, -0.0, -0.02] })
    b.painted('hand' + t, shade(rock(0.13, s > 0 ? 7 : 11, 8, 6), P.bark, 0.7, 1.05), {})
    for (let f = -1; f <= 1; f++) b.painted('hand' + t, shade(rcone(0.035, 0.008, 0.2, 0.008, 5), P.bark, 0.7, 1), { p: [f * 0.06, -0.12, 0.04], r: [Math.PI - 0.3, 0, f * 0.3] })
  })
  // The trunk: wide at the base, furrowed, a knot of a face with a mouth like a split.
  b.painted('torso', bark(lathe([[0, -0.08], [0.36, -0.08], [0.31, 0.18], [0.28, 0.48], [0.21, 0.62], [0, 0.66]], 14), P.bark), {})
  glare(b, 'torso', 0.11, 0.38, 0.26, 0.06, P.eye, { brow: tone(P.bark, 0.75), tilt: 0.4 })
  b.part('torso', lens(0.13, 0.045, 0.06, 10, 4), DARK, { p: [0, 0.2, 0.27], outline: false })
  for (let k = -1; k <= 1; k++) b.part('torso', spike(0.022, 0.06, 4), tone(P.bark, 1.4), { p: [k * 0.06, 0.225, 0.315], r: [Math.PI, 0, 0], outline: false })
  b.part('torso', sph(0.05, 6, 5), tone(P.bark, 0.85), { p: [0, 0.3, 0.29] })
  // The crown: leaf clusters in two tones, branches through them, moss hanging off.
  const clusters: Array<[number, number, number, number]> = [[0, 0.32, 0, 0.34], [-0.24, 0.42, 0.08, 0.24], [0.22, 0.46, -0.06, 0.24], [0.06, 0.58, 0.14, 0.2], [-0.12, 0.5, -0.2, 0.22]]
  clusters.forEach(([x, y, z, r], i) => b.painted('head', shade(sph(r, 10, 8), i % 2 ? P.leaf2 : P.leaf, 0.7, 1.2), { p: [x, y, z] }))
  b.mirror((s) => { b.part('head', spike(0.04, 0.32, 5), tone(P.bark, 0.9), { p: [s * 0.3, 0.38, 0.05], r: [0, 0, -s * 1.1] }) })
  for (let k = 0; k < 3; k++) b.part('head', cap(0.025, 0.24, 5, 2), tone(P.leaf, 0.85), { p: [-0.2 + k * 0.2, 0.06, 0.24 - Math.abs(k - 1) * 0.06] })
  if (variant === 'elder') {
    // Blossom and age: a glowing bloom, a beard of moss, antler branches.
    b.part('head', sph(0.16, 10, 8), P.extra, { p: [0, 0.66, 0.1], glow: true })
    for (let k = 0; k < 4; k++) b.part('torso', spike(0.035, 0.2, 5), tone(P.leaf, 0.9), { p: [(k - 1.5) * 0.06, 0.12, 0.27], r: [Math.PI - 0.2, 0, (k - 1.5) * 0.15] })
    b.mirror((s) => { b.part('torso', rcone(0.06, 0.012, 0.36, 0.01, 6), P.bark, { p: [s * 0.3, 0.58, 0], r: [0, 0, -s * 0.9] }) })
  }
  if (variant === 'thorn') {
    for (let k = 0; k < 10; k++) {
      const a = k * 2.4
      b.part('torso', spike(0.035, 0.18, 4), P.extra, { p: [Math.sin(a) * 0.3, 0.05 + (k % 5) * 0.11, Math.cos(a) * 0.3], r: [Math.PI / 2, a, 0] })
    }
  }
  return b.build({ height: 1.9 })
}

// ─── Golem ───────────────────────────────────────────────────────────────────

type GolemVariant = 'iron' | 'colossus' | 'cinder'

const GOLEM: Record<GolemVariant, { stone: string; plate: string; core: string; crack: string }> = {
  iron: { stone: '#8f9bb0', plate: '#5d6a82', core: '#ffb04a', crack: '#ffb04a' },
  colossus: { stone: '#aab8cf', plate: '#4a5878', core: '#7ff4ff', crack: '#7ff4ff' },
  cinder: { stone: '#4a3a36', plate: '#2a2020', core: '#ff7a1a', crack: '#ff5a1a' }
}

export const buildGolem = (variant: GolemVariant): Rig => {
  const P = GOLEM[variant]
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('hips', 'root', [0, 0.38, 0])
  b.bone('torso', 'hips', [0, 0.02, 0])
  b.bone('head', 'torso', [0, 0.62, 0])
  b.mirror((s, t) => {
    b.bone('arm' + t, 'torso', [s * 0.48, 0.48, 0])
    b.bone('fore' + t, 'arm' + t, [0, -0.22, 0])
    b.bone('hand' + t, 'fore' + t, [0, -0.24, 0])
    if (s > 0) b.bone('weapon', 'handR', [0, 0, 0], FIST)
    else b.bone('offhand', 'handL', [0, 0, 0], FIST)
    b.bone('leg' + t, 'hips', [s * 0.2, 0, 0])
    b.bone('shin' + t, 'leg' + t, [0, -0.18, 0])
    b.bone('foot' + t, 'shin' + t, [0, -0.16, 0])
    // Legs: short pillars of stone, a slab of a foot.
    b.painted('leg' + t, shade(rock(0.15, s > 0 ? 21 : 23, 8, 6), P.stone, 0.6, 0.95), { p: [0, -0.08, 0], s: [1, 1.15, 1] })
    b.painted('shin' + t, shade(rock(0.14, s > 0 ? 25 : 27, 8, 6), P.stone, 0.6, 0.95), { p: [0, -0.06, 0] })
    b.painted('foot' + t, shade(rbox(0.26, 0.1, 0.34, 0.35, 8, 6), P.plate, 0.6, 1), { p: [0, -0.02, 0.04] })
    // Arms: a boulder shoulder under a plate, a huge forearm, a fist like a rock.
    b.painted('arm' + t, shade(rock(0.2, s > 0 ? 31 : 33, 9, 7), P.stone, 0.7, 1.1), { p: [0, -0.06, 0] })
    b.painted('arm' + t, shade(rbox(0.34, 0.12, 0.32, 0.4, 8, 6), P.plate, 0.7, 1.15), { p: [s * 0.04, 0.12, 0], r: [0, 0, -s * 0.35] })
    for (let k = 0; k < 2; k++) b.part('arm' + t, sph(0.025, 5, 4), tone(P.plate, 1.5), { p: [s * (0.0 + k * 0.1), 0.19 - k * 0.03, 0.14], outline: false })
    b.painted('fore' + t, shade(rock(0.19, s > 0 ? 35 : 37, 9, 7), P.stone, 0.65, 1.05), { p: [0, -0.1, 0.02], s: [1, 1.2, 1] })
    b.part('fore' + t, rod(0.018, 0.22, 4), P.crack, { p: [s * 0.13, -0.1, 0.08], r: [0, 0, s * 0.2], glow: true, outline: false })
    b.painted('hand' + t, shade(rock(0.19, s > 0 ? 41 : 43, 9, 7), P.plate, 0.6, 1), {})
  })
  // The body: a heap of boulders round a core whose light leaks out of the cracks.
  b.painted('torso', shade(rock(0.42, 51, 12, 9), P.stone, 0.62, 1.12), { p: [0, 0.32, -0.02], s: [1.05, 0.88, 0.78] })
  b.painted('torso', shade(rock(0.24, 53, 9, 7), P.stone, 0.62, 1.05), { p: [0, 0.02, 0], s: [1.2, 0.7, 1] })
  b.painted('torso', shade(rbox(0.5, 0.36, 0.14, 0.4, 10, 8), P.plate, 0.7, 1.2), { p: [0, 0.38, 0.26] })
  b.part('torso', sph(0.12, 10, 8), P.core, { p: [0, 0.34, 0.33], glow: true, outline: false })
  b.part('torso', torus(0.15, 0.035, 6, 14), tone(P.plate, 0.7), { p: [0, 0.34, 0.33] })
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3
    b.part('torso', rod(0.016, 0.24, 4), P.crack, { p: [Math.cos(a) * 0.26, 0.34 + Math.sin(a) * 0.2, 0.28], r: [0, 0, a + Math.PI / 2], glow: true, outline: false })
  }
  // The head: small, sunk between the shoulders, a slit of light for eyes under a brow of rock.
  b.painted('head', shade(rock(0.2, 61, 9, 7), P.stone, 0.65, 1.1), { p: [0, 0.08, 0.02], s: [1.1, 0.85, 1] })
  b.part('head', rbox(0.22, 0.045, 0.06, 0.5, 8, 4), P.core, { p: [0, 0.08, 0.2], glow: true, outline: false })
  b.painted('head', shade(rbox(0.32, 0.08, 0.14, 0.4, 8, 6), P.plate, 0.8, 1.2), { p: [0, 0.15, 0.15], r: [0.3, 0, 0] })
  if (variant === 'colossus') {
    // Crystal grown through it.
    for (let k = 0; k < 5; k++) b.part('torso', spike(0.08, 0.42 - k * 0.04, 5), k % 2 ? '#7ff4ff' : '#c8faff', { p: [-0.3 + k * 0.15, 0.62, -0.18], r: [-0.5, 0, (k - 2) * 0.25], glow: k % 2 === 0 })
    b.mirror((s) => { b.part('head', rcone(0.07, 0.015, 0.3, 0.012, 7), P.plate, { p: [s * 0.18, 0.26, 0], r: [0, 0, -s * 0.5] }) })
  }
  if (variant === 'cinder') {
    for (let k = 0; k < 4; k++) b.part('torso', rock(0.09, 70 + k, 6, 5), '#ff7a1a', { p: [-0.24 + k * 0.16, 0.6, -0.1], glow: true })
  }
  return b.build({ height: 2 })
}

// ─── Elementals and other floating things ────────────────────────────────────

type ElementalVariant = 'fire' | 'emberLord' | 'void' | 'essence'

/** Each variant's glow, body, depth and heart. The Blood Alchemist's homunculus
 *  (#95) is a bubbly drop of life essence: pink and crimson, a warm glow. */
const ELEMENTAL_TONES: Record<ElementalVariant, [string, string, string, string]> = {
  fire: ['#ffd27a', '#ff7a1a', '#d83a10', '#3a1a14'],
  emberLord: ['#ffd27a', '#ff7a1a', '#d83a10', '#3a1a14'],
  void: ['#d8a8ff', '#8a4ae0', '#4a1a9a', '#1c0c38'],
  essence: ['#ffc8d8', '#ff4a6a', '#a81838', '#4a0c1c']
}

export const buildElemental = (variant: ElementalVariant): Rig => {
  const [hot, mid, deep, coal] = ELEMENTAL_TONES[variant]
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('hips', 'root', [0, 0.5, 0])
  b.bone('torso', 'hips', [0, 0, 0])
  b.bone('head', 'torso', [0, 0.46, 0])
  b.mirror((s, t) => {
    b.bone('arm' + t, 'torso', [s * 0.34, 0.34, 0])
    b.bone('fore' + t, 'arm' + t, [0, -0.13, 0])
    b.bone('hand' + t, 'fore' + t, [0, -0.13, 0])
    if (s > 0) b.bone('weapon', 'handR', [0, 0, 0], FIST)
    else b.bone('offhand', 'handL', [0, 0, 0], FIST)
    b.painted('arm' + t, gradY(limb(0.08, 0.07, 0.13, 7, 2), mid, hot), { glow: true })
    b.painted('fore' + t, gradY(limb(0.07, 0.06, 0.13, 7, 2), mid, hot), { glow: true })
    // A fist of flame: a coal at its heart, tongues licking up off it.
    b.part('hand' + t, sph(0.12, 8, 6), mid, { glow: true })
    b.part('hand' + t, rock(0.075, s > 0 ? 3 : 4, 6, 5), coal, { p: [0, -0.02, 0.05] })
    for (let k = 0; k < 3; k++) b.part('hand' + t, spike(0.05, 0.2, 5), k === 1 ? hot : mid, { p: [(k - 1) * 0.06, 0.1, 0], r: [0, 0, (k - 1) * -0.4], glow: true, outline: false })
  })
  // The body: layers of flame round a coal heart, tongues off the shoulders, a wisp below.
  b.painted('torso', gradY(lathe([[0, -0.5], [0.09, -0.32], [0.26, 0], [0.3, 0.24], [0.2, 0.44], [0, 0.5]], 12), deep, mid), { glow: true })
  b.painted('torso', gradY(lathe([[0, -0.22], [0.16, 0.02], [0.19, 0.24], [0.1, 0.38], [0, 0.42]], 10), mid, hot), { p: [0, 0, 0.07], glow: true, outline: false })
  b.part('torso', rock(0.1, 9, 7, 5), coal, { p: [0, 0.16, 0.2] })
  b.part('torso', sph(0.06, 6, 5), '#ffffff', { p: [0, 0.16, 0.27], glow: true, outline: false })
  for (let k = 0; k < 6; k++) {
    const a = (k / 5 - 0.5) * 2.4
    b.part('torso', spike(0.07, 0.3 - Math.abs(a) * 0.04, 5), k % 2 ? hot : mid, { p: [Math.sin(a) * 0.26, 0.36, Math.cos(a) * 0.04 - 0.04], r: [-0.3, 0, -a * 0.6], glow: true })
  }
  // Coals that orbit it (they hang off the body: the body's own sway turns them).
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.6
    b.part('torso', rock(0.055, 12 + k, 6, 4), coal, { p: [Math.cos(a) * 0.42, 0.1 + (k % 2) * 0.22, Math.sin(a) * 0.42] })
  }
  // The head: a coal skull cracked with light, eyes that burn.
  b.part('head', rock(0.24, 17, 10, 8), coal, { p: [0, 0.14, 0] })
  for (let k = 0; k < 3; k++) b.part('head', rod(0.014, 0.16, 4), hot, { p: [(k - 1) * 0.1, 0.24 - Math.abs(k - 1) * 0.06, 0.18], r: [0.3, 0, (k - 1) * 0.6], glow: true, outline: false })
  glare(b, 'head', 0.09, 0.14, 0.2, 0.055, '#ffffff', { socket: hot, tilt: 0.45 })
  for (let k = 0; k < 5; k++) {
    b.part('head', spike(0.09 - Math.abs(k - 2) * 0.012, 0.42 - Math.abs(k - 2) * 0.07, 6), k % 2 ? mid : hot, { p: [(k - 2) * 0.1, 0.36, -0.04], r: [-0.2, 0, -(k - 2) * 0.32], glow: true })
  }
  if (variant === 'emberLord') {
    b.mirror((s) => { b.part('head', rcone(0.07, 0.015, 0.36, 0.012, 7), coal, { p: [s * 0.24, 0.3, 0], r: [-0.3, 0, -s * 0.75] }) })
    b.part('torso', torus(0.3, 0.04, 6, 16), coal, { p: [0, 0.16, 0], r: [Math.PI / 2, 0, 0] })
    for (let k = 0; k < 6; k++) b.part('torso', spike(0.035, 0.12, 4), hot, { p: [Math.cos(k) * 0.3, 0.2, Math.sin(k) * 0.3], glow: true, outline: false })
  }
  return b.build({ height: 1.5 })
}

// ─── Naga ────────────────────────────────────────────────────────────────────

type NagaVariant = 'naga' | 'oracle' | 'serpent'

const NAGA: Record<NagaVariant, { scale: string; belly: string; fin: string; eye: string; gold: string }> = {
  naga: { scale: '#2fb0a0', belly: '#d8f4e4', fin: '#1f7a8a', eye: '#ffe07a', gold: '#d9a83a' },
  oracle: { scale: '#26c8b0', belly: '#eafff4', fin: '#6a4fe0', eye: '#e8d0ff', gold: '#ffd24a' },
  serpent: { scale: '#1f6a9a', belly: '#bfe8f4', fin: '#0f3a6a', eye: '#7fffd0', gold: '#c9a24a' }
}

/** A serpent's length: banded belly scales below, the coat above. */
const scales = (g: BufferGeometry, P: { scale: string; belly: string }): BufferGeometry => {
  const [lo, hi] = yRange(g)
  return paintBy(g, (_x, y, z) => {
    const k = (y - lo) / Math.max(1e-5, hi - lo)
    if (k < 0.35) return Math.abs(Math.sin(z * 40)) > 0.75 ? tone(P.belly, 0.82) : P.belly
    return tone(P.scale, 0.8 + 0.35 * k)
  })
}

export const buildNaga = (variant: NagaVariant): Rig => {
  const P = NAGA[variant]
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('hips', 'root', [0, 0.42, 0])
  b.bone('torso', 'hips', [0, 0.02, 0])
  b.bone('head', 'torso', [0, 0.42, 0])
  b.bone('tail1', 'hips', [0, -0.1, -0.1])
  b.bone('tail2', 'tail1', [0, -0.2, -0.3])
  b.bone('tail3', 'tail2', [0, -0.06, -0.34])
  b.mirror((s, t) => {
    b.bone('arm' + t, 'torso', [s * 0.235, 0.33, 0])
    b.bone('fore' + t, 'arm' + t, [0, -0.14, 0])
    b.bone('hand' + t, 'fore' + t, [0, -0.13, 0])
    // The trident stands upright in a hanging hand; the oracle strikes with a bare one.
    if (s > 0) b.bone('weapon', 'handR', [0, 0, 0.06], variant === 'oracle' ? FIST : [-1.45, 0, 0])
    else b.bone('offhand', 'handL', [0, 0, 0], FIST)
    b.painted('arm' + t, shade(limb(0.065, 0.055, 0.14, 7, 2), P.scale, 0.8, 1.1), {})
    b.painted('fore' + t, shade(limb(0.055, 0.05, 0.13, 7, 2), P.scale, 0.8, 1.1), {})
    b.part('fore' + t, torus(0.06, 0.018, 5, 12), P.gold, { p: [0, -0.07, 0], r: [Math.PI / 2, 0, 0] })
    b.part('fore' + t, spike(0.03, 0.14, 4), P.fin, { p: [s * 0.04, -0.04, -0.05], r: [-1.2, 0, s * 0.5] })
    b.painted('hand' + t, shade(sph(0.07, 8, 6), P.scale, 0.8, 1.1), {})
    for (let f = -1; f <= 1; f++) b.part('hand' + t, spike(0.012, 0.06, 4), BONE_WHITE, { p: [f * 0.03, -0.06, 0.04], r: [Math.PI - 0.4, 0, 0], outline: false })
  })
  // The torso: scaled, a pale front, a gold collar; fins down the spine.
  b.painted('torso', scales(ell(0.2, 0.235, 0.17, 12, 8), P), { p: [0, 0.2, 0] })
  b.part('torso', torus(0.16, 0.025, 5, 16), P.gold, { p: [0, 0.37, 0.01], r: [Math.PI / 2 - 0.2, 0, 0] })
  b.part('torso', sph(0.035, 6, 5), P.eye, { p: [0, 0.34, 0.16], glow: true, outline: false })
  // The coil: fat segments curling behind, banded underneath, a fin ridge, a tail fin.
  b.painted('hips', scales(ell(0.23, 0.2, 0.24, 10, 7), P), { p: [0, -0.1, -0.02] })
  b.painted('tail1', scales(ell(0.2, 0.17, 0.27, 10, 7), P), { p: [0, -0.14, -0.14] })
  b.painted('tail2', scales(ell(0.15, 0.13, 0.25, 10, 7), P), { p: [0, -0.03, -0.16] })
  b.painted('tail3', shade(rcone(0.11, 0.02, 0.38, 0.015, 8), P.scale, 0.75, 1.1), { p: [0, 0, -0.14], r: [-Math.PI / 2, 0, 0] })
  for (const [bone, z, h] of [['hips', -0.02, 0.2], ['tail1', -0.14, 0.18], ['tail2', -0.16, 0.14]] as const) {
    b.part(bone, spike(0.04, h, 4), P.fin, { p: [0, (bone === 'hips' ? 0.08 : bone === 'tail1' ? 0.02 : 0.1), z], r: [-0.6, 0, 0] })
  }
  b.part('tail3', plate([[0, 0.05], [0.16, -0.12], [0, -0.06], [-0.16, -0.12]], 0.03), P.fin, { p: [0, 0, -0.32] })
  // The head: a hood spread behind it, a long jaw with fangs, slit eyes.
  b.painted('head', shade(sph(0.25, 14, 10), P.scale, 0.75, 1.15), { p: [0, 0.25, 0] })
  b.painted('head', shade(ell(0.16, 0.1, 0.16, 10, 6), P.scale, 0.8, 1.1), { p: [0, 0.16, 0.18] })
  b.part('head', ell(0.13, 0.05, 0.13, 10, 5), P.belly, { p: [0, 0.1, 0.2] })
  b.part('head', lens(0.11, 0.015, 0.03, 8, 3), DARK, { p: [0, 0.12, 0.33], outline: false })
  b.mirror((s) => {
    b.part('head', spike(0.016, 0.07, 4), BONE_WHITE, { p: [s * 0.05, 0.1, 0.32], r: [Math.PI, 0, 0], outline: false })
    // The hood: a fan of fin behind each cheek, its colour darkening to the edge.
    const hood = plate(([[0, 0.18], [0.24, 0.1], [0.3, -0.12], [0.12, -0.26], [0, -0.2]] as Array<[number, number]>).map(([x, y]) => [s * x, y] as [number, number]), 0.03)
    b.painted('head', gradY(hood, tone(P.fin, 0.6), tone(P.fin, 1.25)), { p: [s * 0.12, 0.26, -0.08], r: [0, -s * 0.5, s * 1.35] })
  })
  glare(b, 'head', 0.1, 0.27, 0.22, 0.055, P.eye, { brow: tone(P.scale, 0.75), tilt: 0.4 })
  b.part('head', spike(0.05, 0.3, 5), P.fin, { p: [0, 0.48, -0.06], r: [-0.6, 0, 0] })
  if (variant === 'oracle') {
    b.part('handL', sph(0.13, 10, 8), '#7fe8ff', { p: [0, 0.06, 0.16], glow: true })
    b.part('head', torus(0.22, 0.025, 5, 16), P.gold, { p: [0, 0.5, -0.04], r: [Math.PI / 2 + 0.3, 0, 0] })
    for (let k = 0; k < 5; k++) b.part('head', spike(0.025, 0.12, 4), P.gold, { p: [Math.cos(k * 0.6 + 1.6) * 0.22, 0.5 + Math.sin(k * 0.6 + 1.6) * 0.06, -0.04], r: [0, 0, k * 0.6 - 1.2], outline: false })
  } else {
    // A trident.
    b.part('weapon', rcyl(0.024, 1, 0.012, 8, 2), P.gold, { p: [0, 0, 0.3], r: [Math.PI / 2, 0, 0] })
    b.part('weapon', rbox(0.2, 0.04, 0.04, 0.5, 6, 4), P.gold, { p: [0, 0, 0.78] })
    for (let k = -1; k <= 1; k++) b.part('weapon', rcone(0.03, 0.006, 0.22, 0.006, 6), '#e8f4ff', { p: [k * 0.08, 0, 0.9], r: [Math.PI / 2, 0, 0] })
  }
  return b.build({ height: 1.6 })
}

// ─── Wings: a membrane on finger bones ───────────────────────────────────────

/**
 * One wing on `bone`, spreading toward `s` (−1 left, +1 right): a membrane
 * scalloped between its fingers, shaded lighter toward the leading edge, the
 * arm and finger bones over it, a claw at the wrist. `span` and `chord` in
 * metres; the root sits at the bone.
 */
const wing = (b: RigBuilder, bone: string, s: -1 | 1, span: number, chord: number, skin: string, bones: string, claw: string, o: { edge?: string; vein?: string } = {}): void => {
  const wrist: [number, number] = [0.5 * span, 0.12 * chord]
  const tips: [[number, number], [number, number], [number, number]] = [[1 * span, -0.08 * chord], [0.86 * span, -0.62 * chord], [0.5 * span, -0.92 * chord]]
  const outline: Array<[number, number]> = [
    [0, 0.14 * chord], [wrist[0], wrist[1] + 0.04 * chord], tips[0],
    [0.8 * span, -0.34 * chord], tips[1],
    [0.58 * span, -0.6 * chord], tips[2],
    [0.24 * span, -0.62 * chord], [0, -0.38 * chord]
  ]
  const pts = outline.map(([x, y]) => [s * x, y] as [number, number])
  const mem = plate(pts, 0.022 * span)
  // Lighter at the leading edge (+z), the colour deepening toward the trailing scallops.
  let zlo = Infinity
  let zhi = -Infinity
  const p = mem.attributes.position!
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i); if (z < zlo) zlo = z; if (z > zhi) zhi = z }
  paintBy(mem, (_x, _y, z) => mixHex(tone(skin, 0.7), o.edge ?? tone(skin, 1.2), ((z - zlo) / Math.max(1e-5, zhi - zlo)) ** 1.6))
  b.painted(bone, mem, { p: [0, 0.02, 0] })
  const arm = (a: V3, c: V3, r: number): void => { b.painted(bone, shade(between(rod(r, Math.hypot(c[0] - a[0], c[2] - a[2]), 5), a, c), bones, 0.8, 1.1), {}) }
  const w: V3 = [s * wrist[0], 0.03, wrist[1]]
  arm([0, 0.03, 0.1 * chord], w, 0.045 * span)
  for (const t of tips) arm(w, [s * t[0], 0.03, t[1]], 0.026 * span)
  // Veins of light through the membrane (over it, so they read from above).
  if (o.vein) {
    for (let i = 0; i < tips.length - 1; i++) {
      const m: V3 = [s * (tips[i]![0] + tips[i + 1]![0]) * 0.45, 0.045, (tips[i]![1] + tips[i + 1]![1]) * 0.45]
      b.part(bone, between(rod(0.006 * span, 1, 4), w, m), o.vein, { glow: true, outline: false })
    }
  }
  b.part(bone, spike(0.035 * span, 0.14 * span, 5), claw, { p: [w[0], 0.08, w[2] + 0.03], r: [-0.4, 0, 0] })
}

// ─── Wyvern and dragon ───────────────────────────────────────────────────────

type WyvernVariant = 'wyvern' | 'matriarch'

export const buildWyvern = (variant: WyvernVariant = 'wyvern'): Rig => {
  const hide = variant === 'wyvern' ? '#d8683a' : '#8a3a6a'
  const belly = variant === 'wyvern' ? '#ffd9a8' : '#f4c8e0'
  const skin = variant === 'wyvern' ? '#b8482a' : '#5a1a4a'
  const horn = '#f4e8d0'
  const eye = variant === 'wyvern' ? '#ffe07a' : '#ff8ad8'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.9, 0])
  b.bone('neck', 'body', [0, 0.14, 0.3])
  b.bone('head', 'neck', [0, 0.2, 0.22])
  b.bone('tail', 'body', [0, 0, -0.36])
  b.mirror((s, t) => {
    b.bone('wing' + t, 'body', [s * 0.2, 0.18, 0])
    b.bone('leg' + t, 'body', [s * 0.14, -0.2, -0.04])
    wing(b, 'wing' + t, s, 0.95, 0.62, skin, hide, horn)
    // Legs: a thigh, a shin, talons.
    b.painted('leg' + t, coat(ell(0.09, 0.12, 0.11, 8, 6), belly, hide, tone(hide, 0.8)), { p: [0, -0.04, 0] })
    b.painted('leg' + t, shade(limb(0.05, 0.04, 0.16, 6, 2), hide, 0.7, 1), { p: [0, -0.12, 0.02], r: [0.3, 0, 0] })
    for (let k = -1; k <= 1; k++) b.part('leg' + t, spike(0.022, 0.09, 4), horn, { p: [k * 0.035, -0.29, 0.1], r: [1.7, k * 0.3, 0], outline: false })
  })
  b.painted('body', coat(ell(0.28, 0.27, 0.42, 12, 8), belly, hide, tone(hide, 0.75)), {})
  for (let k = 0; k < 4; k++) b.part('body', spike(0.05, 0.18, 5), skin, { p: [0, 0.27, 0.2 - k * 0.16], r: [-0.7, 0, 0] })
  b.painted('neck', coat(cap(0.11, 0.2, 8, 3), belly, hide, tone(hide, 0.8)), { p: [0, 0.08, 0.08], r: [0.8, 0, 0] })
  b.part('neck', spike(0.04, 0.14, 5), skin, { p: [0, 0.2, 0.0], r: [-0.8, 0, 0] })
  // The head: a long snout, a lower jaw with teeth, swept horns, eyes under a ridge.
  b.painted('head', coat(sph(0.2, 12, 9), belly, hide, tone(hide, 0.8)), { p: [0, 0.06, 0.04] })
  b.painted('head', coat(ell(0.12, 0.09, 0.2, 10, 6), belly, hide, tone(hide, 0.85)), { p: [0, 0.02, 0.24] })
  b.painted('head', shade(ell(0.1, 0.05, 0.17, 8, 5), belly, 0.75, 0.95), { p: [0, -0.07, 0.22] })
  b.part('head', lens(0.08, 0.015, 0.03, 8, 3), DARK, { p: [0, -0.03, 0.38], outline: false })
  b.mirror((s) => {
    b.painted('head', shade(rcone(0.06, 0.012, 0.3, 0.01, 7), horn, 0.8, 1.05), { p: [s * 0.12, 0.22, -0.08], r: [-0.85, 0, -s * 0.25] })
    b.part('head', spike(0.016, 0.06, 4), BONE_WHITE, { p: [s * 0.05, -0.05, 0.36], r: [Math.PI, 0, 0], outline: false })
    b.part('head', sph(0.02, 5, 4), DARK, { p: [s * 0.04, 0.07, 0.43], outline: false })
  })
  glare(b, 'head', 0.1, 0.1, 0.2, 0.05, eye, { brow: tone(hide, 0.75) })
  // The tail: tapering, a spade of skin at its end.
  b.painted('tail', shade(rcone(0.14, 0.02, 0.72, 0.015, 8), hide, 0.75, 1.1), { p: [0, 0, -0.34], r: [-Math.PI / 2, 0, 0] })
  b.part('tail', plate([[0, 0.06], [0.14, -0.08], [0, -0.26], [-0.14, -0.08]], 0.025), skin, { p: [0, 0.02, -0.68] })
  return b.build({ height: 1.9 })
}

type DragonVariant = 'void' | 'ally' | 'drake'

const DRAGON: Record<DragonVariant, { hide: string; top: string; belly: string; skin: string; skinEdge: string; horn: string; hornBase: string; glow: string; mouth: string }> = {
  // The Void Dragon: near-black violet, lit only where it means harm.
  void: { hide: '#22113e', top: '#3e2474', belly: '#7a66a8', skin: '#1e0c3c', skinEdge: '#5a32a0', horn: '#efe6f8', hornBase: '#3a2a4a', glow: '#c87aff', mouth: '#2a0a24' },
  ally: { hide: '#5a3aa8', top: '#8a6ae0', belly: '#e0d0f8', skin: '#3a2478', skinEdge: '#9a7ae8', horn: '#f8f0ff', hornBase: '#6a5a80', glow: '#e0a8ff', mouth: '#4a1a3a' },
  drake: { hide: '#1e4a52', top: '#2f7a7a', belly: '#9ad0c0', skin: '#123a40', skinEdge: '#3fa0a0', horn: '#e0f0e8', hornBase: '#2a4a48', glow: '#5ff0e0', mouth: '#1a2a2a' }
}

/** A run of segments along `pts` (a horn, a curling spine), tapering from `r0` to `r1`, shaded `base` → `tip`. */
const curl = (b: RigBuilder, bone: string, pts: V3[], r0: number, r1: number, base: string, tip: string): void => {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!
    const c = pts[i + 1]!
    const ka = i / (pts.length - 1)
    const kb = (i + 1) / (pts.length - 1)
    const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2])
    const g = rcone(r0 + (r1 - r0) * ka, Math.max(0.006, r0 + (r1 - r0) * kb), len * 1.08, Math.min(0.012, r1 * 0.5 + 0.004), 7)
    b.painted(bone, between(gradY(g, mixHex(base, tip, ka), mixHex(base, tip, kb)), a, c), {})
  }
}

export const buildDragon = (variant: DragonVariant): Rig => {
  const P = DRAGON[variant]
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.78, 0])
  // A chain wherever it bends (#74): a neck of two, a tail of three, legs of
  // shoulder or thigh, shin and foot, so it moves as an animal, not a figure.
  b.bone('neck', 'body', [0, 0.24, 0.5])
  b.bone('neck2', 'neck', [0, 0.16, 0.13])
  b.bone('head', 'neck2', [0, 0.2, 0.17])
  b.bone('jaw', 'head', [0, -0.04, 0.1])
  b.bone('tail1', 'body', [0, 0, -0.56])
  b.bone('tail2', 'tail1', [0, 0, -0.52])
  b.bone('tail3', 'tail2', [0, 0, -0.46])
  const hide = (g: BufferGeometry): BufferGeometry => coat(g, P.belly, P.hide, P.top)
  // ── Wings: big, membrane dark with a lit leading edge, veins of light ──
  b.mirror((s, t) => {
    // Held up and swept back at rest: a dragon spreads, it does not hang its wings out flat.
    b.bone('wing' + t, 'body', [s * 0.32, 0.36, -0.02], [0, s * 0.28, s * 0.42])
    wing(b, 'wing' + t, s, 1.75, 1.05, P.skin, P.hide, P.horn, { edge: P.skinEdge, vein: P.glow })
  })
  // ── The body: a deep chest over the haunches, shoulders the wings grow from ──
  const chest = ell(0.5, 0.5, 0.52, 14, 10)
  const [lo, hi] = yRange(chest)
  paintBy(chest, (_x, y, z) => {
    const k = (y - lo) / (hi - lo)
    if (k < 0.34) return Math.abs(Math.sin(z * 16)) > 0.82 ? tone(P.belly, 0.72) : P.belly
    return mixHex(P.hide, P.top, clamp01((k - 0.34) / 0.66))
  })
  b.painted('body', chest, { p: [0, 0.06, 0.26] })
  b.painted('body', hide(ell(0.42, 0.4, 0.48, 12, 9)), { p: [0, -0.02, -0.26] })
  b.mirror((s) => { b.painted('body', hide(ell(0.22, 0.2, 0.26, 10, 7)), { p: [s * 0.3, 0.3, 0.04] }) })
  // Cracks of light across the chest, the heart of it showing through.
  b.part('body', sph(0.11, 8, 6), P.glow, { p: [0, -0.02, 0.74], glow: true, outline: false })
  for (let k = 0; k < 5; k++) {
    const a = -1.1 + k * 0.55
    b.part('body', rod(0.014, 0.26, 4), P.glow, { p: [Math.sin(a) * 0.2, -0.04 + Math.cos(a) * 0.14, 0.7], r: [0.4, 0, a], glow: true, outline: false })
  }
  // Spines down the back, tall at the shoulders, each tipped with light.
  for (let k = 0; k < 7; k++) {
    const h = 0.36 - Math.abs(k - 2) * 0.045
    b.painted('body', gradY(spike(0.085 - Math.abs(k - 2) * 0.006, h, 5), P.skin, P.glow), { p: [0, 0.46 - Math.max(0, k - 3) * 0.05, 0.5 - k * 0.17], r: [-0.55, 0, 0] })
  }
  // ── Four legs: heavy shoulders and thighs, digitigrade hind legs, claws ──
  for (const [n, x, z] of [['legFL', -0.32, 0.36], ['legFR', 0.32, 0.36], ['legBL', -0.34, -0.34], ['legBR', 0.34, -0.34]] as const) {
    const s = x < 0 ? -1 : 1
    const front = n[3] === 'F'
    const shin = 'shin' + n.slice(3)
    const foot = 'foot' + n.slice(3)
    b.bone(n, 'body', [x, -0.2, z])
    if (front) {
      // Shoulder, forearm from the elbow, a foot that stays flat on the ground.
      b.bone(shin, n, [0, -0.2, 0.02])
      b.bone(foot, shin, [0, -0.32, 0.03])
      b.painted(n, hide(ell(0.15, 0.24, 0.17, 9, 6)), { p: [s * 0.02, -0.04, 0] })
      b.painted(shin, shade(limb(0.1, 0.08, 0.32, 8, 2), P.hide, 0.7, 1.05), {})
    } else {
      // Thigh, then a shin running back to the hock and a long foot forward from it (digitigrade).
      b.bone(shin, n, [0, -0.2, -0.05])
      b.bone(foot, shin, [0, -0.33, 0.06])
      b.painted(n, hide(ell(0.2, 0.28, 0.25, 9, 6)), { p: [s * 0.02, -0.02, 0] })
      b.painted(shin, shade(limb(0.1, 0.08, 0.24, 8, 2), P.hide, 0.7, 1.05), { r: [-0.55, 0, 0] })
      b.painted(shin, shade(limb(0.075, 0.065, 0.2, 7, 2), P.hide, 0.65, 1), { p: [0, -0.2, -0.125], r: [0.5, 0, 0] })
    }
    b.painted(foot, shade(ell(0.15, 0.07, 0.2, 8, 5), P.hide, 0.5, 0.85), { p: [0, 0.01, 0.06] })
    for (let k = -1; k <= 1; k++) b.painted(foot, gradY(spike(0.034, 0.14, 4), P.hornBase, P.horn), { p: [k * 0.075, -0.01, 0.24], r: [1.65, k * 0.25, 0], outline: false })
  }
  // ── The neck: three segments in an S, pale plates under, spines over ──
  b.painted('neck', hide(ell(0.22, 0.22, 0.25, 10, 8)), { p: [0, 0.04, 0.02], r: [0.7, 0, 0] })
  b.painted('neck2', hide(ell(0.19, 0.19, 0.22, 10, 8)), { p: [0, 0.02, 0.01], r: [0.9, 0, 0] })
  b.painted('neck2', hide(ell(0.17, 0.17, 0.2, 10, 8)), { p: [0, 0.14, 0.11], r: [0.6, 0, 0] })
  b.painted('neck', gradY(spike(0.06, 0.24, 5), P.skin, P.glow), { p: [0, 0.22, -0.08], r: [-0.85, 0, 0] })
  for (let k = 1; k < 3; k++) b.painted('neck2', gradY(spike(0.06, 0.24 - k * 0.03, 5), P.skin, P.glow), { p: [0, 0.16 + (k - 1) * 0.1, -0.09 + (k - 1) * 0.12], r: [-0.85, 0, 0] })
  // ── The head: a wedge of a skull, a long snout, brow ridges, horns that sweep back ──
  b.painted('head', hide(ell(0.26, 0.22, 0.3, 12, 9)), { p: [0, 0.1, 0] })
  b.painted('head', hide(ell(0.18, 0.13, 0.34, 12, 8)), { p: [0, 0.05, 0.34] })
  b.painted('head', hide(ell(0.14, 0.1, 0.13, 10, 6)), { p: [0, 0.06, 0.6] })
  b.part('head', ell(0.13, 0.03, 0.28, 8, 4), P.mouth, { p: [0, -0.04, 0.34], outline: false })
  b.mirror((s) => {
    b.painted('head', shade(rbox(0.15, 0.07, 0.24, 0.5, 8, 6), P.hide, 0.7, 1.2), { p: [s * 0.13, 0.22, 0.12], r: [0.2, s * 0.2, s * 0.32] })
    b.part('head', sph(0.03, 5, 4), DARK, { p: [s * 0.06, 0.12, 0.7], outline: false })
    if (variant === 'drake') {
      // A drake's horns: two straight blades swept back, no crown.
      curl(b, 'head', [[s * 0.14, 0.24, -0.06], [s * 0.2, 0.36, -0.3], [s * 0.22, 0.38, -0.52]], 0.065, 0.01, P.hornBase, P.horn)
    } else {
      // The great horns: three segments curling back and up.
      curl(b, 'head', [[s * 0.15, 0.24, -0.06], [s * 0.22, 0.42, -0.26], [s * 0.25, 0.5, -0.5], [s * 0.22, 0.46, -0.7]], 0.085, 0.012, P.hornBase, P.horn)
      // A lesser horn below each.
      curl(b, 'head', [[s * 0.22, 0.1, -0.08], [s * 0.34, 0.14, -0.26], [s * 0.38, 0.12, -0.4]], 0.05, 0.01, P.hornBase, P.horn)
    }
    // A frill of spines at the cheek.
    for (let k = 0; k < 3; k++) b.part('head', spike(0.04, 0.2 - k * 0.03, 4), P.skin, { p: [s * 0.24, 0.0 - k * 0.06, -0.02 - k * 0.04], r: [0.4, 0, s * (1.6 + k * 0.25)] })
    // Teeth along the upper jaw.
    for (let k = 0; k < 4; k++) b.part('head', spike(0.018, 0.07 - (k % 2) * 0.015, 4), BONE_WHITE, { p: [s * (0.11 - k * 0.01), -0.05, 0.3 + k * 0.1], r: [Math.PI, 0, 0], outline: false })
  })
  glare(b, 'head', 0.15, 0.17, 0.22, 0.06, P.glow, { brow: tone(P.hide, 0.8), tilt: 0.42 })
  // ── The jaw: hinged, lined with teeth, dark inside ──
  b.painted('jaw', shade(ell(0.15, 0.06, 0.34, 10, 6), P.belly, 0.7, 0.95), { p: [0, -0.05, 0.28] })
  b.part('jaw', ell(0.12, 0.025, 0.28, 8, 4), P.mouth, { p: [0, -0.005, 0.28], outline: false })
  b.mirror((s) => { for (let k = 0; k < 3; k++) b.part('jaw', spike(0.016, 0.06, 4), BONE_WHITE, { p: [s * (0.1 - k * 0.012), 0.01, 0.2 + k * 0.12], outline: false }) })
  // ── The tail: long, plated under, spined, a blade of a spade at its end ──
  // Three segments, each a little into the next so a bend never opens a gap.
  b.painted('tail1', shade(rcone(0.3, 0.19, 0.62, 0.02, 10), P.hide, 0.62, 1.05), { p: [0, 0, -0.26], r: [-Math.PI / 2, 0, 0] })
  b.painted('tail2', shade(rcone(0.19, 0.11, 0.58, 0.015, 9), P.hide, 0.62, 1.05), { p: [0, 0, -0.24], r: [-Math.PI / 2, 0, 0] })
  b.painted('tail3', shade(rcone(0.11, 0.02, 0.6, 0.012, 8), P.hide, 0.62, 1.05), { p: [0, 0, -0.26], r: [-Math.PI / 2, 0, 0] })
  for (const [bone, y, z, k] of [['tail1', 0.27, -0.14, 0], ['tail1', 0.22, -0.42, 1], ['tail2', 0.17, -0.12, 2], ['tail2', 0.13, -0.36, 3], ['tail3', 0.09, -0.14, 4]] as const) {
    b.painted(bone, gradY(spike(0.065 - k * 0.008, 0.24 - k * 0.025, 5), P.skin, P.glow), { p: [0, y, z], r: [-0.6, 0, 0] })
  }
  b.painted('tail3', gradY(plate([[0, 0.1], [0.24, -0.08], [0.06, -0.2], [0, -0.42], [-0.06, -0.2], [-0.24, -0.08]], 0.035), P.skin, P.skinEdge), { p: [0, 0.03, -0.56] })
  return b.build({ height: 2.4 })
}

// ─── Aether-Tech turrets ─────────────────────────────────────────────────────

export const buildTurret = (variant: 'gatling' | 'rocket'): Rig => {
  const shell = variant === 'gatling' ? '#4a8fb8' : '#c9783a'
  const metal = '#b9c4d6'
  const glowHex = variant === 'gatling' ? '#4ff0c8' : '#ffb04a'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.36, 0])
  b.bone('head', 'body', [0, 0.26, 0])
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2
    b.painted('root', shade(cap(0.05, 0.36, 6, 2), metal), { p: [Math.sin(a) * 0.22, 0.2, Math.cos(a) * 0.22], r: [Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6] })
  }
  b.painted('body', shade(rcyl(0.2, 0.2, 0.06, 12, 2), shell), {})
  b.painted('head', shade(rbox(0.42, 0.34, 0.44, 0.5, 12, 8), shell, 0.7, 1.15), { p: [0, 0.12, 0] })
  b.part('head', sph(0.085, 8, 6), glowHex, { p: [0, 0.2, 0.2], glow: true, outline: false })
  if (variant === 'gatling') {
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2
      b.part('head', rcyl(0.04, 0.46, 0.012, 8, 2), metal, { p: [Math.cos(a) * 0.07, 0.08 + Math.sin(a) * 0.07, 0.42], r: [Math.PI / 2, 0, 0] })
    }
  } else {
    b.mirror((s) => {
      b.part('head', rcyl(0.09, 0.4, 0.03, 10, 2), metal, { p: [s * 0.14, 0.1, 0.32], r: [Math.PI / 2, 0, 0] })
      b.part('head', sph(0.07, 8, 6), '#ff5a3a', { p: [s * 0.14, 0.1, 0.52] })
    })
  }
  return b.build({ height: 1.1 })
}

/**
 * The caravan of the road to Oakhaven (roadmap #85): a mule hitched to a
 * covered cart, the goods stacked under its canvas. Facing +Z (the mule in
 * front), about 2.6 m long; the unit's circle is its middle. Bones: `body`
 * (the mule), `head` (it nods as it walks), `wheelL` / `wheelR` (they turn).
 */
export const buildCart = (): Rig => {
  const coat = '#8a6a4e'
  const wood = '#9a6a3a'
  const canvas = '#d8c08a'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.78, 0.55])
  b.bone('head', 'body', [0, 0.22, 0.48])
  b.bone('wheelL', 'root', [-0.66, 0.42, -0.62])
  b.bone('wheelR', 'root', [0.66, 0.42, -0.62])
  // The mule: a round barrel of a body, a long head with tall ears, four legs.
  b.painted('body', shade(ell(0.3, 0.27, 0.52, 14, 10), coat), {})
  b.part('body', ell(0.22, 0.13, 0.36, 10, 6), '#d8c4a6', { p: [0, -0.15, 0] })
  b.painted('head', shade(ell(0.14, 0.17, 0.3, 12, 8), coat), { p: [0, 0.02, 0.16], r: [0.5, 0, 0] })
  b.part('head', ell(0.11, 0.09, 0.09, 10, 6), '#d8c4a6', { p: [0, -0.1, 0.38] })
  b.mirror((s) => {
    b.part('head', ell(0.05, 0.16, 0.03, 8, 6), coat, { p: [s * 0.08, 0.2, 0.02], r: [-0.3, 0, s * 0.3] })
    b.part('head', sph(0.025, 6, 4), DARK, { p: [s * 0.1, 0.06, 0.24] })
    for (const z of [0.32, -0.32]) b.part('body', limb(0.07, 0.05, 0.62, 8, 2), tone(coat, 0.85), { p: [s * 0.17, -0.12, z] })
    // The shafts from the cart to the harness.
    b.part('root', rod(0.035, 1.25, 6), wood, { p: [s * 0.36, 0.72, -0.05], r: [Math.PI / 2, 0, 0] })
  })
  b.part('body', ell(0.06, 0.06, 0.2, 8, 5), '#5a3e28', { p: [0, 0.18, -0.02] })
  b.part('body', limb(0.03, 0.02, 0.32, 6, 2), '#5a3e28', { p: [0, 0.05, -0.5], r: [-0.5, 0, 0] })
  // The cart: a bed of planks, its goods, a canvas over hoops.
  b.part('root', rbox(1.12, 0.32, 1.25, 0.25, 12, 8), wood, { p: [0, 0.72, -0.82] })
  b.part('root', rbox(0.42, 0.34, 0.4, 0.3, 10, 8), '#c9a26a', { p: [-0.26, 1.02, -1.08] })
  b.part('root', rcyl(0.2, 0.42, 0.06, 12, 2), '#7a4a2a', { p: [0.24, 1.06, -0.62] })
  b.painted('root', shade(ell(0.6, 0.5, 0.7, 16, 10), canvas, 0.8, 1.08), { p: [0, 1.06, -0.9], s: [1, 0.85, 1] })
  // The hoops under the canvas show through as dark bands: it reads as a wagon's top.
  for (const z of [-1.38, -0.9, -0.42]) {
    const k = 1 - Math.pow((z + 0.9) / 0.7, 2)
    b.part('root', torus(0.6 * Math.sqrt(Math.max(0.05, k)) + 0.012, 0.035, 6, 20, Math.PI), '#6a4a2e', { p: [0, 1.06, z], s: [1, 0.85, 1] })
  }
  // Wheels: a rim, a hub.
  for (const w of ['wheelL', 'wheelR'] as const) {
    b.part(w, torus(0.36, 0.06, 8, 22), '#6a4a2e', { r: [0, Math.PI / 2, 0] })
    b.part(w, rcyl(0.1, 0.14, 0.03, 10, 2), '#3e2c1e', { r: [0, 0, Math.PI / 2] })
  }
  return b.build({ height: 1.7 })
}

/**
 * Every creature rig the game can build, by a short name: what the tests
 * (coplanar faces, triangle budgets) and the benches walk, so a variant added
 * here is checked without anyone adding it to a list.
 */
export const CREATURE_BUILDS: Record<string, () => Rig> = {
  wolf: () => buildBeast('wolf'),
  stalker: () => buildBeast('stalker'),
  howler: () => buildBeast('howler'),
  boar: buildBoar,
  cart: buildCart,
  spider: () => buildSpider('spider'),
  brood: () => buildSpider('brood'),
  mother: () => buildSpider('mother'),
  treant: () => buildTreant('treant'),
  elder: () => buildTreant('elder'),
  thorn: () => buildTreant('thorn'),
  golem: () => buildGolem('iron'),
  colossus: () => buildGolem('colossus'),
  cinder: () => buildGolem('cinder'),
  fire: () => buildElemental('fire'),
  emberLord: () => buildElemental('emberLord'),
  void: () => buildElemental('void'),
  essence: () => buildElemental('essence'),
  naga: () => buildNaga('naga'),
  oracle: () => buildNaga('oracle'),
  serpent: () => buildNaga('serpent'),
  wyvern: () => buildWyvern('wyvern'),
  matriarch: () => buildWyvern('matriarch'),
  dragon: () => buildDragon('void'),
  drake: () => buildDragon('drake'),
  ally: () => buildDragon('ally'),
  gatling: () => buildTurret('gatling'),
  rocket: () => buildTurret('rocket')
}
