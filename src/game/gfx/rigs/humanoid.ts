import type { BufferGeometry } from 'three'
import { RigBuilder, cap, dome, ell, lathe, rbox, rcone, rcyl, sph, torus, tube, type Rig, type V3 } from '../kit'

/**
 * ─── The chibi humanoid (GDD §2.1) ───────────────────────────────────────────
 *
 * One parametric builder for the hero, every townsperson and every two-legged
 * monster: head 45 % of the height, torso 30 %, legs 25 %; stubby limbs with
 * mitten hands and capsule feet; large oval eyes with a bright catch-light.
 * Everything is rounded primitives merged into ONE skinned mesh (plus one
 * outline mesh), so a character is 2–3 draw calls and ~1.2–1.8 k triangles.
 *
 * A `Look` picks the skin, the outfit, what is on the head and what is in the
 * hands. The hero's look is derived from the gear he wears.
 */

export type HeadGear =
  | 'none' | 'short' | 'long' | 'spiky' | 'bun' | 'hood' | 'helm' | 'greathelm' | 'crown' | 'wizard' | 'bandana'
  | 'horns' | 'bald' | 'goggles' | 'skull' | 'cap'

export type Held =
  | 'none' | 'sword' | 'dagger' | 'greatsword' | 'axe' | 'hammer' | 'staff' | 'wand' | 'gun' | 'cannon' | 'club' | 'bow'
  | 'sling' | 'scythe' | 'flask'

export type OffHand = 'none' | 'shield' | 'tome' | 'orb' | 'syringe' | 'battery' | 'dagger' | 'gun'

export interface Look {
  skin: string
  /** Hair, or the colour of whatever is on the head. */
  hair: string
  head: HeadGear
  /** Outfit: top, legs, trim. */
  top: string
  bottom: string
  trim: string
  outfit: 'tunic' | 'robe' | 'plate' | 'leather' | 'rags' | 'bare' | 'apron'
  held: Held
  off: OffHand
  /** Weapon metal / wood, and its glow (staff orbs, guns). */
  metal?: string
  glow?: string
  ears?: 'none' | 'pointy' | 'goblin'
  /** Glowing eyes (demons, the dead, void things). */
  eyeGlow?: string
  cape?: string
  wings?: string
  tail?: string
  beard?: string
  /** Shoulder plates (knights, warlords). */
  pauldrons?: boolean
  /** A bulkier body (chiefs, giants, demons). */
  bulk?: number
  /** Ghostly: drawn see-through (summoned spirits). */
  ghost?: boolean
}

const DARK = '#1b1626'
const EYE = '#241a2e'

// Proportions at scale 1 (total height ~1.4 m).
const HIP_Y = 0.36
const HEAD_Y = 0.42
const HEAD_R = 0.31
const SHOULDER_X = 0.235
const SHOULDER_Y = 0.33
const HAND_Y = -0.27

const weaponParts = (b: RigBuilder, held: Held, metal: string, glowHex: string): void => {
  const bone = 'handR'
  const wood = '#8a5a34'
  // Weapons point forward and a little up from a hanging hand.
  switch (held) {
    case 'sword':
      b.part(bone, rbox(0.07, 0.03, 0.5, 0.5, 8, 6), metal, { p: [0, 0, 0.33], r: [-0.25, 0, 0] })
      b.part(bone, rbox(0.2, 0.05, 0.05, 0.6, 8, 6), '#c9a24a', { p: [0, 0.015, 0.08], r: [-0.25, 0, 0] })
      b.part(bone, rcyl(0.028, 0.12, 0.012, 8, 2), wood, { p: [0, -0.005, 0], r: [1.32, 0, 0] })
      break
    case 'dagger':
      b.part(bone, rbox(0.06, 0.025, 0.26, 0.5, 8, 6), metal, { p: [0, 0, 0.2], r: [-0.2, 0, 0] })
      b.part(bone, rbox(0.13, 0.04, 0.04, 0.6, 8, 6), '#c9a24a', { p: [0, 0.01, 0.07], r: [-0.2, 0, 0] })
      break
    case 'greatsword':
      b.part(bone, rbox(0.11, 0.04, 0.82, 0.5, 8, 8), metal, { p: [0, 0.03, 0.5], r: [-0.3, 0, 0] })
      b.part(bone, rbox(0.3, 0.06, 0.06, 0.6, 8, 6), '#c9a24a', { p: [0, 0.02, 0.1], r: [-0.3, 0, 0] })
      b.part(bone, rcyl(0.032, 0.2, 0.012, 8, 2), wood, { p: [0, -0.01, -0.02], r: [1.27, 0, 0] })
      break
    case 'axe':
      b.part(bone, rcyl(0.028, 0.62, 0.012, 8, 2), wood, { p: [0, 0.06, 0.22], r: [1.2, 0, 0] })
      b.part(bone, rbox(0.05, 0.26, 0.22, 0.55, 8, 6), metal, { p: [0, 0.22, 0.46], r: [-0.35, 0, 0] })
      break
    case 'hammer':
      b.part(bone, rcyl(0.03, 0.66, 0.012, 8, 2), wood, { p: [0, 0.06, 0.24], r: [1.2, 0, 0] })
      b.part(bone, rbox(0.3, 0.2, 0.2, 0.45, 10, 8), metal, { p: [0, 0.18, 0.52], r: [-0.35, 0, 0] })
      break
    case 'club':
      b.part(bone, rcone(0.045, 0.1, 0.52, 0.03, 8), wood, { p: [0, 0.06, 0.26], r: [1.2, 0, 0] })
      break
    case 'staff':
      b.part(bone, rcyl(0.026, 1.05, 0.012, 8, 2), wood, { p: [0, 0.32, 0.06] })
      b.part(bone, torus(0.085, 0.022, 6, 12), '#c9a24a', { p: [0, 0.86, 0.06] })
      b.part(bone, sph(0.075, 10, 8), glowHex, { p: [0, 0.86, 0.06], glow: true, outline: false })
      break
    case 'wand':
      b.part(bone, rcyl(0.02, 0.4, 0.01, 8, 2), '#e9e2ff', { p: [0, 0.05, 0.18], r: [1.15, 0, 0] })
      b.part(bone, sph(0.055, 8, 6), glowHex, { p: [0, 0.13, 0.36], glow: true, outline: false })
      break
    case 'scythe':
      b.part(bone, rcyl(0.026, 1.1, 0.012, 8, 2), wood, { p: [0, 0.3, 0.06] })
      b.part(bone, rbox(0.04, 0.12, 0.5, 0.5, 8, 6), metal, { p: [0, 0.84, 0.28], r: [0.35, 0, 0] })
      break
    case 'gun':
      b.part(bone, rbox(0.08, 0.1, 0.3, 0.5, 8, 6), metal, { p: [0, 0.02, 0.2] })
      b.part(bone, rbox(0.06, 0.14, 0.07, 0.6, 8, 6), wood, { p: [0, -0.05, 0.08], r: [0.3, 0, 0] })
      b.part(bone, sph(0.035, 8, 6), glowHex, { p: [0, 0.03, 0.36], glow: true, outline: false })
      break
    case 'cannon':
      b.part(bone, rcyl(0.11, 0.56, 0.04, 10, 2), metal, { p: [0, 0.04, 0.3], r: [Math.PI / 2, 0, 0] })
      b.part(bone, torus(0.12, 0.03, 6, 12), '#c9a24a', { p: [0, 0.04, 0.5] })
      b.part(bone, sph(0.07, 8, 6), glowHex, { p: [0, 0.04, 0.58], glow: true, outline: false })
      break
    case 'bow':
      b.part(bone, torus(0.3, 0.022, 6, 14, Math.PI), wood, { p: [0, 0, 0.14], r: [0, Math.PI / 2, Math.PI / 2] })
      break
    case 'sling':
      b.part(bone, sph(0.07, 8, 6), '#9a9a9a', { p: [0, -0.08, 0.1] })
      break
    case 'flask':
      b.part(bone, sph(0.09, 10, 8), glowHex, { p: [0, 0, 0.1], glow: true })
      b.part(bone, rcyl(0.03, 0.08, 0.01, 8, 2), '#d8e2ee', { p: [0, 0.1, 0.1] })
      break
    default:
      break
  }
}

const offParts = (b: RigBuilder, off: OffHand, metal: string, trim: string, glowHex: string): void => {
  const bone = 'handL'
  switch (off) {
    case 'shield':
      b.part(bone, rcyl(0.26, 0.07, 0.03, 14, 2), metal, { p: [-0.07, 0.04, 0.06], r: [0, 0, Math.PI / 2] })
      b.part(bone, rcyl(0.15, 0.09, 0.03, 12, 2), trim, { p: [-0.09, 0.04, 0.06], r: [0, 0, Math.PI / 2] })
      b.part(bone, sph(0.06, 8, 6), '#ffe9a8', { p: [-0.14, 0.04, 0.06] })
      break
    case 'tome':
      b.part(bone, rbox(0.2, 0.26, 0.07, 0.5, 8, 6), trim, { p: [0, 0, 0.1], r: [0.3, 0, 0] })
      b.part(bone, rbox(0.16, 0.22, 0.08, 0.5, 8, 6), '#f4ead2', { p: [0, 0, 0.1], r: [0.3, 0, 0] })
      break
    case 'orb':
      b.part(bone, sph(0.1, 10, 8), glowHex, { p: [0, 0.06, 0.14], glow: true })
      b.part(bone, torus(0.12, 0.018, 6, 12), '#c9a24a', { p: [0, 0.06, 0.14], r: [Math.PI / 2, 0, 0] })
      break
    case 'syringe':
      b.part(bone, rcyl(0.04, 0.26, 0.015, 8, 2), '#d8e2ee', { p: [0, 0.02, 0.14], r: [Math.PI / 2, 0, 0] })
      b.part(bone, rcyl(0.03, 0.14, 0.012, 8, 2), glowHex, { p: [0, 0.02, 0.14], r: [Math.PI / 2, 0, 0], glow: true, outline: false })
      break
    case 'battery':
      b.part(bone, rcyl(0.07, 0.2, 0.02, 10, 2), metal, { p: [0, 0, 0.1] })
      b.part(bone, rcyl(0.055, 0.1, 0.02, 10, 2), glowHex, { p: [0, 0.02, 0.1], glow: true, outline: false })
      break
    case 'dagger':
      b.part(bone, rbox(0.055, 0.025, 0.24, 0.5, 8, 6), metal, { p: [0, 0, 0.18], r: [-0.2, 0, 0] })
      break
    case 'gun':
      b.part(bone, rbox(0.07, 0.09, 0.26, 0.5, 8, 6), metal, { p: [0, 0.02, 0.18] })
      break
    default:
      break
  }
}

const headGear = (b: RigBuilder, l: Look): void => {
  const c = l.hair
  const cy = 0.27
  const bone = 'head'
  switch (l.head) {
    case 'short':
      b.part(bone, dome(HEAD_R * 1.07, 1.75, 14, 7), c, { p: [0, cy + 0.01, -0.02], r: [-0.28, 0, 0] })
      b.part(bone, ell(0.2, 0.07, 0.07, 10, 6), c, { p: [0.05, cy + 0.2, 0.24], r: [0.2, 0, 0.25] })
      break
    case 'long':
      b.part(bone, dome(HEAD_R * 1.08, 1.8, 14, 7), c, { p: [0, cy + 0.01, -0.02], r: [-0.3, 0, 0] })
      b.part(bone, ell(0.3, 0.3, 0.12, 12, 8), c, { p: [0, cy - 0.2, -0.24] })
      b.part(bone, ell(0.18, 0.07, 0.07, 10, 6), c, { p: [-0.06, cy + 0.2, 0.25], r: [0.2, 0, -0.25] })
      break
    case 'spiky':
      b.part(bone, dome(HEAD_R * 1.05, 1.6, 14, 6), c, { p: [0, cy + 0.01, -0.02], r: [-0.25, 0, 0] })
      for (let k = 0; k < 5; k++) {
        const a = (k - 2) * 0.42
        b.part(bone, rcone(0.075, 0.012, 0.24, 0.01, 7), c, { p: [Math.sin(a) * 0.2, cy + 0.3 + Math.cos(a) * 0.05, -0.02 + (k % 2) * 0.1], r: [-0.2, 0, -a * 0.9] })
      }
      break
    case 'bun':
      b.part(bone, dome(HEAD_R * 1.07, 1.75, 14, 7), c, { p: [0, cy + 0.01, -0.02], r: [-0.28, 0, 0] })
      b.part(bone, sph(0.12, 10, 8), c, { p: [0, cy + 0.33, -0.12] })
      b.part(bone, ell(0.2, 0.07, 0.07, 10, 6), c, { p: [0, cy + 0.2, 0.25], r: [0.2, 0, 0] })
      break
    case 'hood':
      b.part(bone, dome(HEAD_R * 1.16, 2.05, 14, 8), c, { p: [0, cy + 0.02, -0.04], r: [-0.42, 0, 0] })
      b.part(bone, rcone(0.16, 0.02, 0.26, 0.015, 8), c, { p: [0, cy + 0.34, -0.22], r: [-0.9, 0, 0] })
      break
    case 'helm':
      b.part(bone, dome(HEAD_R * 1.1, 1.75, 14, 7), c, { p: [0, cy + 0.02, -0.01], r: [-0.22, 0, 0] })
      b.part(bone, rbox(0.06, 0.26, 0.34, 0.6, 8, 6), l.trim, { p: [0, cy + 0.36, -0.06] })
      b.part(bone, rbox(0.5, 0.06, 0.06, 0.6, 8, 6), c, { p: [0, cy + 0.07, 0.3] })
      break
    case 'greathelm':
      b.part(bone, sph(HEAD_R * 1.12, 14, 10), c, { p: [0, cy, 0] })
      b.part(bone, rbox(0.4, 0.07, 0.08, 0.6, 8, 6), DARK, { p: [0, cy + 0.03, 0.3], outline: false })
      b.part(bone, rcone(0.05, 0.012, 0.3, 0.01, 7), l.trim, { p: [-0.2, cy + 0.36, 0], r: [0, 0, 0.5] })
      b.part(bone, rcone(0.05, 0.012, 0.3, 0.01, 7), l.trim, { p: [0.2, cy + 0.36, 0], r: [0, 0, -0.5] })
      break
    case 'crown':
      b.part(bone, dome(HEAD_R * 1.06, 1.7, 14, 7), c, { p: [0, cy + 0.01, -0.02], r: [-0.28, 0, 0] })
      b.part(bone, tube(0.22, 0.2, 0.1, 12), '#ffd24a', { p: [0, cy + 0.32, 0] })
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2
        b.part(bone, rcone(0.04, 0.008, 0.11, 0.008, 6), '#ffd24a', { p: [Math.sin(a) * 0.21, cy + 0.41, Math.cos(a) * 0.21] })
      }
      break
    case 'wizard':
      b.part(bone, rcyl(0.44, 0.04, 0.018, 14, 2), c, { p: [0, cy + 0.2, 0] })
      b.part(bone, rcone(0.27, 0.02, 0.5, 0.02, 12), c, { p: [0, cy + 0.44, -0.03], r: [-0.18, 0, 0] })
      b.part(bone, torus(0.26, 0.03, 6, 14), l.trim, { p: [0, cy + 0.24, 0], r: [Math.PI / 2, 0, 0] })
      break
    case 'bandana':
      b.part(bone, dome(HEAD_R * 1.05, 1.5, 14, 6), c, { p: [0, cy + 0.02, -0.01], r: [-0.2, 0, 0] })
      b.part(bone, ell(0.1, 0.05, 0.14, 8, 6), c, { p: [0.16, cy + 0.12, -0.3], r: [0.4, 0.4, 0] })
      break
    case 'horns':
      for (const s of [-1, 1] as const) {
        b.part(bone, rcone(0.075, 0.012, 0.34, 0.01, 8), c, { p: [s * 0.22, cy + 0.3, 0.02], r: [0.2, 0, -s * 0.55] })
      }
      break
    case 'goggles':
      b.part(bone, dome(HEAD_R * 1.07, 1.7, 14, 7), c, { p: [0, cy + 0.01, -0.02], r: [-0.28, 0, 0] })
      b.part(bone, torus(0.085, 0.028, 6, 12), '#b9c4d6', { p: [-0.12, cy + 0.2, 0.26], r: [0.25, 0, 0] })
      b.part(bone, torus(0.085, 0.028, 6, 12), '#b9c4d6', { p: [0.12, cy + 0.2, 0.26], r: [0.25, 0, 0] })
      break
    case 'cap':
      b.part(bone, dome(HEAD_R * 1.08, 1.6, 14, 6), c, { p: [0, cy + 0.03, -0.01], r: [-0.15, 0, 0] })
      b.part(bone, rbox(0.34, 0.04, 0.2, 0.6, 8, 6), c, { p: [0, cy + 0.14, 0.34], r: [0.25, 0, 0] })
      break
    default:
      break
  }
}

/** Build a chibi humanoid. Bones: root, hips, torso, head, armL/R, handL/R,
 *  legL/R (+ cape, tail, wingL/R when the look has them). */
export const buildHumanoid = (l: Look): Rig => {
  const k = l.bulk ?? 1
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('hips', 'root', [0, HIP_Y, 0])
  b.bone('torso', 'hips', [0, 0.02, 0])
  b.bone('head', 'torso', [0, HEAD_Y, 0])
  b.mirror((s, t) => {
    b.bone('arm' + t, 'torso', [s * SHOULDER_X * k, SHOULDER_Y, 0])
    b.bone('hand' + t, 'arm' + t, [0, HAND_Y, 0])
    b.bone('leg' + t, 'hips', [s * 0.105 * k, 0, 0])
  })
  if (l.cape) b.bone('cape', 'torso', [0, 0.36, -0.15])
  if (l.tail) b.bone('tail', 'hips', [0, 0.05, -0.16])
  if (l.wings) b.mirror((s, t) => { b.bone('wing' + t, 'torso', [s * 0.1, 0.3, -0.16]) })

  const metal = l.metal ?? '#c9d3e4'
  const glowHex = l.glow ?? '#7ff4ff'
  const skeletal = l.head === 'skull'

  // ── Legs ──
  b.mirror((_s, t) => {
    const leg = 'leg' + t
    const legCol = l.outfit === 'bare' ? l.skin : l.bottom
    b.part(leg, cap(0.085 * k, 0.15, 8, 3), legCol, { p: [0, -0.15, 0] })
    b.part(leg, ell(0.11 * k, 0.075, 0.16, 10, 6), l.outfit === 'bare' ? l.skin : DARK, { p: [0, -0.3, 0.035] })
  })

  // ── Torso ──
  if (l.outfit === 'robe') {
    // A bell from the chest to the ankles: the legs barely show under it.
    b.part('torso', lathe([[0, -0.3], [0.3 * k, -0.3], [0.27 * k, -0.1], [0.2 * k, 0.2], [0.17 * k, 0.36], [0, 0.4]], 12), l.top, {})
    b.part('torso', torus(0.2 * k, 0.035, 6, 14), l.trim, { p: [0, 0.08, 0], r: [Math.PI / 2, 0, 0] })
  } else {
    b.part('torso', ell(0.22 * k, 0.235, 0.18 * k, 12, 8), l.outfit === 'bare' ? l.skin : l.top, { p: [0, 0.2, 0] })
    if (l.outfit === 'plate') {
      b.part('torso', ell(0.2 * k, 0.16, 0.12, 10, 6), l.trim, { p: [0, 0.24, 0.1] })
      b.part('torso', torus(0.2 * k, 0.04, 6, 14), l.trim, { p: [0, 0.04, 0], r: [Math.PI / 2, 0, 0] })
    } else if (l.outfit === 'apron') {
      b.part('torso', rbox(0.28 * k, 0.36, 0.06, 0.5, 8, 6), l.trim, { p: [0, 0.12, 0.16] })
    } else if (l.outfit !== 'bare') {
      b.part('torso', torus(0.2 * k, 0.035, 6, 14), l.trim, { p: [0, 0.05, 0], r: [Math.PI / 2, 0, 0] })
    }
    if (l.outfit === 'rags' || l.outfit === 'bare') {
      b.part('hips', ell(0.2 * k, 0.1, 0.17 * k, 10, 6), l.bottom, { p: [0, 0.03, 0] })
    }
  }
  if (l.pauldrons) {
    b.mirror((s) => {
      b.part('torso', dome(0.15 * k, 1.5, 10, 5), l.trim, { p: [s * 0.25 * k, 0.33, 0], r: [0, 0, -s * 0.45] })
    })
  }

  // ── Arms and hands ──
  b.mirror((_s, t) => {
    const sleeve = l.outfit === 'bare' || l.outfit === 'rags' ? l.skin : l.top
    b.part('arm' + t, cap(0.07 * k, 0.13, 8, 3), sleeve, { p: [0, -0.12, 0] })
    b.part('hand' + t, sph(0.088 * k, 8, 6), skeletal ? '#e8e2cf' : l.skin, { p: [0, 0, 0] })
  })

  // ── Head ──
  const cy = 0.27
  b.part('head', sph(HEAD_R, 14, 10), l.skin, { p: [0, cy, 0] })
  if (l.head !== 'greathelm') {
    b.mirror((s) => {
      if (skeletal || l.eyeGlow) {
        // Sockets with a light inside.
        b.part('head', ell(0.085, 0.1, 0.04, 8, 6), DARK, { p: [s * 0.115, cy - 0.01, 0.268], outline: false })
        b.part('head', sph(0.04, 6, 5), l.eyeGlow ?? '#7dff8a', { p: [s * 0.115, cy - 0.01, 0.29], glow: true, outline: false })
      } else {
        b.part('head', ell(0.078, 0.108, 0.035, 8, 6), EYE, { p: [s * 0.118, cy - 0.01, 0.27], outline: false })
        b.part('head', sph(0.03, 6, 5), '#ffffff', { p: [s * 0.118 - 0.022, cy + 0.035, 0.298], glow: true, outline: false })
      }
    })
    if (skeletal) b.part('head', rbox(0.2, 0.07, 0.05, 0.5, 8, 6), '#cfc8b4', { p: [0, cy - 0.18, 0.24], outline: false })
    else b.part('head', ell(0.05, 0.022, 0.02, 8, 5), '#7a3b3b', { p: [0, cy - 0.15, 0.292], outline: false })
  }
  if (l.ears === 'pointy' || l.ears === 'goblin') {
    const len = l.ears === 'goblin' ? 0.34 : 0.2
    b.mirror((s) => {
      b.part('head', rcone(0.085, 0.012, len, 0.01, 7), l.skin, { p: [s * (0.3 + len * 0.3), cy + 0.03, 0], r: [0, 0, -s * 1.25] })
    })
  }
  if (l.beard) b.part('head', ell(0.2, 0.19, 0.13, 10, 7), l.beard, { p: [0, cy - 0.24, 0.17] })
  headGear(b, l)

  // ── Extras ──
  if (l.cape) {
    b.part('cape', lathe([[0, -0.62], [0.28, -0.62], [0.24, -0.3], [0.17, 0], [0, 0.02]], 10), l.cape, { s: [1, 1, 0.42], p: [0, 0, -0.02] })
  }
  if (l.tail) b.part('tail', rcone(0.06, 0.012, 0.42, 0.01, 7), l.tail, { p: [0, 0.05, -0.2], r: [-1.2, 0, 0] })
  if (l.wings) {
    b.mirror((s, t) => {
      const g: BufferGeometry = rbox(0.5, 0.42, 0.04, 0.45, 10, 8)
      b.part('wing' + t, g, l.wings!, { p: [s * 0.27, 0.12, 0], r: [0, 0, s * 0.35] })
    })
  }

  weaponParts(b, l.held, metal, glowHex)
  offParts(b, l.off, metal, l.trim, glowHex)

  const rig = b.build({ height: 1.4 })
  return rig
}

export const HUMAN_BONES = ['root', 'hips', 'torso', 'head', 'armL', 'armR', 'handL', 'handR', 'legL', 'legR'] as const

/** Where a weapon's tip is, in hand space — the trail of a swing starts here. */
export const WEAPON_REACH: Record<Held, number> = {
  none: 0.25, sword: 0.6, dagger: 0.36, greatsword: 0.95, axe: 0.6, hammer: 0.65, staff: 0.9, wand: 0.4, gun: 0.4,
  cannon: 0.6, club: 0.55, bow: 0.3, sling: 0.2, scythe: 0.9, flask: 0.2
}

export type { V3 }
