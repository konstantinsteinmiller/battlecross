import { SphereGeometry, type BufferGeometry } from 'three'
import { sceneQuality } from '../../engine/quality'
import {
  RigBuilder, blade, dome, ell, gradY, lathe, lens, limb, mixHex, rbox, rcone, rcyl, rod, sph, spike, stripUv, tone, torus, tube,
  type Rig, type V3
} from '../kit'

/**
 * ─── The chibi humanoid (GDD §2.1) ───────────────────────────────────────────
 *
 * One parametric builder for the hero, every townsperson and every two-legged
 * monster: head 45 % of the height, torso 30 %, legs 25 %. Still a chibi, no
 * longer a doll: the limbs have elbows, knees and feet, the hands are mittens
 * with a thumb, the torso has a waist and shoulders and sits on a neck, the
 * face has brows, lids that blink, a nose, cheeks and a mouth that opens, the
 * hair has volume and a strand or two that swings, and the clothes are layered
 * by outfit (collar, sleeves, belt and buckle, boots, gloves, plates, a hood).
 *
 * Everything is rounded primitives merged into ONE skinned mesh plus one
 * outline hull: 3 draws a character. Vertex colours only, smooth normals.
 * Triangles: the hero ≤ ~3.2 k, a standard enemy ≤ ~2.2 k, and a leaner build
 * of both on a weak device (`sceneQuality() === 'low'`).
 *
 * The weapon hangs on its own `weapon` bone under the right hand (the off hand
 * item on `offhand`), authored along +Z from the grip, so a swing can let the
 * blade lead or lag the wrist and a trail knows where the tip is.
 */

export type HeadGear =
  | 'none' | 'short' | 'long' | 'spiky' | 'bun' | 'ponytail' | 'hood' | 'helm' | 'greathelm' | 'crown' | 'wizard' | 'bandana'
  | 'horns' | 'bald' | 'goggles' | 'skull' | 'cap' | 'leathercap' | 'circlet' | 'hat'

/** Hand and foot gear, worn as its own layer over the body outfit. */
export type GearKind = 'none' | 'cloth' | 'leather' | 'plate'

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
  /** Iris colour (default: a warm brown). */
  eye?: string
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
  /** A robe's hood, worn down on the shoulders (the head keeps its own gear). */
  cowl?: boolean
  /** The hero: built at the higher detail level. */
  hero?: boolean
  /** The hair worn UNDER head gear (a helmet, a hat): its fringe and nape show. */
  style?: HairStyle
  /** A girl's face (the girl hero, roadmap #71): lashes, finer arched brows,
   *  rosier lips and cheeks. Same head, same proportions. */
  fem?: boolean
  /** The tie of a ponytail (default: a red ribbon). */
  ribbon?: string
  /** The head gear's own colour and trim (default: `hair` and `trim`). */
  headCol?: string
  headTrim?: string
  /** Gloves: 'none' is bare hands. Unset: whatever the body outfit implies. */
  gloves?: GearKind
  gloveTrim?: string
  /** Boots: 'none' is simple shoes. Unset: whatever the body outfit implies. */
  boots?: GearKind
  bootTrim?: string
}

/** 0 = a weak device, 1 = everybody, 2 = the hero. */
export type Detail = 0 | 1 | 2

const DARK = '#1b1626'
const LEATHER = '#4a3528'
const GOLD = '#d8ae4a'
const WOOD = '#8a5a34'

// Proportions at scale 1 (total height ~1.42 m).
const HIP_Y = 0.37
const THIGH = 0.165
const SHIN = 0.15
const WAIST_Y = 0.05
const NECK_Y = 0.385
const HEAD_R = 0.31
/** Head centre above the head bone. */
const CY = 0.27
const SHOULDER_X = 0.225
const SHOULDER_Y = 0.325
const UPPER = 0.135
const FORE = 0.125
const EYE_Y = CY - 0.03
const EYE_X = 0.118
const EYE_RY = 0.112

/** Leg segment lengths (the animation grounds the feet with them). */
export const LEG = { thigh: THIGH, shin: SHIN } as const

/**
 * How each weapon sits in a hanging hand: the rest rotation of the `weapon`
 * bone. Blades point forward and up; staves stand upright; guns and bows lie
 * along the forearm, so raising the arm aims them.
 */
const WEAPON_REST: Record<Held, V3> = {
  none: [Math.PI / 2, 0, 0], sword: [-0.5, 0, 0], dagger: [-0.35, 0, 0], greatsword: [-0.62, 0, 0], axe: [-0.5, 0, 0],
  hammer: [-0.5, 0, 0], club: [-0.5, 0, 0], staff: [-1.45, 0, 0], wand: [-0.6, 0, 0], scythe: [-1.45, 0, 0],
  gun: [1.2, 0, 0], cannon: [1.2, 0, 0], bow: [1.35, 0, 0], sling: [0.3, 0, 0], flask: [-0.4, 0, 0]
}

const OFF_REST: Record<OffHand, V3> = {
  none: [0, 0, 0], shield: [0, 0, 0], tome: [-0.3, 0, 0], orb: [0, 0, 0], syringe: [-0.4, 0, 0], battery: [0, 0, 0],
  dagger: [-0.35, 0, 0], gun: [1.2, 0, 0]
}

// ─── Parts ───────────────────────────────────────────────────────────────────

/** The skull: a sphere with a jaw that narrows and cheeks that do not. Keeps
 *  the sphere's own normals (the change is too small for the ramp to see, and
 *  recomputing them would split the seam the hull is pushed along). */
const headGeo = (ws: number, hs: number): BufferGeometry => {
  const g = new SphereGeometry(HEAD_R, ws, hs)
  const pos = g.attributes.position!
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i)
    const y = pos.getY(i)
    let z = pos.getZ(i)
    const ny = y / HEAD_R
    if (ny < 0) {
      x *= 1 - 0.17 * Math.pow(-ny, 1.6)
      z *= 1 - 0.07 * -ny
    }
    x *= 1 + 0.05 * Math.exp(-((ny + 0.28) * (ny + 0.28)) / 0.07)
    if (z > HEAD_R * 0.55) z *= 0.975
    pos.setXYZ(i, x, y, z)
  }
  return stripUv(g)
}

const weaponParts = (b: RigBuilder, held: Held, metal: string, glowHex: string, q: Detail): void => {
  const w = 'weapon'
  const hi = q === 2
  const along: V3 = [Math.PI / 2, 0, 0]
  const steel = (g: BufferGeometry): BufferGeometry => gradY(g, tone(metal, 0.86), tone(metal, 1.1))
  switch (held) {
    case 'sword':
      b.painted(w, steel(blade(0.5, 0.085, 0.03, 0.72, hi ? 8 : 6)), { p: [0, 0, 0.07] })
      b.part(w, rbox(0.2, 0.05, 0.05, 0.6, 5, 3), GOLD, { p: [0, 0, 0.06] })
      b.part(w, rod(0.024, 0.13), WOOD, { p: [0, 0, 0], r: along })
      b.part(w, sph(0.034, 5, 3), GOLD, { p: [0, 0, -0.07] })
      break
    case 'dagger':
      b.painted(w, steel(blade(0.27, 0.07, 0.026, 0.6, 6)), { p: [0, 0, 0.05] })
      b.part(w, rbox(0.12, 0.04, 0.04, 0.6, 4, 3), GOLD, { p: [0, 0, 0.045] })
      b.part(w, rod(0.022, 0.1), LEATHER, { p: [0, 0, 0], r: along })
      break
    case 'greatsword':
      b.painted(w, steel(blade(0.84, 0.135, 0.04, 0.78, hi ? 8 : 6)), { p: [0, 0, 0.1] })
      b.part(w, rbox(0.34, 0.065, 0.065, 0.6, 5, 3), GOLD, { p: [0, 0, 0.09] })
      b.part(w, rod(0.028, 0.25), LEATHER, { p: [0, 0, -0.03], r: along })
      b.part(w, sph(0.045, 5, 3), GOLD, { p: [0, 0, -0.16] })
      break
    case 'axe':
      b.part(w, rod(0.026, 0.66), WOOD, { p: [0, 0, 0.2], r: along })
      // The edge faces the way the arm chops: weapon −Y.
      b.painted(w, steel(rbox(0.05, 0.3, 0.24, 0.5, 8, 5)), { p: [0, -0.12, 0.44] })
      b.part(w, spike(0.05, 0.14, 5), metal, { p: [0, 0.07, 0.45] })
      b.part(w, rbox(0.075, 0.09, 0.12, 0.6, 6, 4), tone(metal, 0.7), { p: [0, 0, 0.45] })
      break
    case 'hammer':
      b.part(w, rod(0.028, 0.68), WOOD, { p: [0, 0, 0.2], r: along })
      b.painted(w, steel(rbox(0.2, 0.36, 0.22, 0.42, 8, 6)), { p: [0, 0, 0.5] })
      b.part(w, rbox(0.215, 0.1, 0.235, 0.5, 6, 4), GOLD, { p: [0, 0, 0.5] })
      break
    case 'club':
      b.painted(w, gradY(rcone(0.04, 0.105, 0.56, 0.03, 7), tone(WOOD, 0.8), tone(WOOD, 1.1)), { p: [0, 0, 0.24], r: along })
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1
        b.part(w, spike(0.03, 0.07, 4), '#d8d2c4', { p: [Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0.42 - k * 0.05], r: [0, 0, a - Math.PI / 2] })
      }
      break
    case 'staff':
      b.part(w, rod(0.024, 1.08), WOOD, { p: [0, 0, 0.22], r: along })
      b.part(w, torus(0.085, 0.022, 3, 7), GOLD, { p: [0, 0, 0.8] })
      b.part(w, sph(0.07, 7, 5), glowHex, { p: [0, 0, 0.8], glow: true, outline: false })
      b.part(w, spike(0.04, 0.1, 4), GOLD, { p: [0, 0, 0.92], r: along })
      break
    case 'wand':
      b.part(w, rod(0.018, 0.36), '#e9e2ff', { p: [0, 0, 0.15], r: along })
      b.part(w, sph(0.05, 6, 5), glowHex, { p: [0, 0, 0.35], glow: true, outline: false })
      b.part(w, torus(0.03, 0.012, 4, 6), GOLD, { p: [0, 0, 0.03] })
      break
    case 'scythe':
      b.part(w, rod(0.024, 1.16), WOOD, { p: [0, 0, 0.26], r: along })
      // The blade hooks toward weapon −Y, the way the arm reaps.
      b.painted(w, steel(blade(0.52, 0.13, 0.03, 0.5, 6)), { p: [0, -0.02, 0.8], r: [1.95, 0, 0] })
      b.part(w, rbox(0.06, 0.08, 0.1, 0.6, 6, 4), tone(metal, 0.7), { p: [0, 0, 0.8] })
      break
    case 'gun':
      // Barrel along +Z, sights on +Y, the grip in the hand.
      b.part(w, rbox(0.075, 0.1, 0.3, 0.5, 6, 5), metal, { p: [0, 0.035, 0.13] })
      b.part(w, rod(0.028, 0.18), tone(metal, 0.7), { p: [0, 0.05, 0.32], r: along })
      b.part(w, rbox(0.055, 0.12, 0.065, 0.6, 6, 4), WOOD, { p: [0, -0.03, 0.01], r: [0.3, 0, 0] })
      b.part(w, sph(0.03, 5, 4), glowHex, { p: [0, 0.05, 0.4], glow: true, outline: false })
      b.part(w, rbox(0.085, 0.05, 0.1, 0.6, 6, 4), glowHex, { p: [0, 0.05, 0.1], glow: true, outline: false })
      break
    case 'cannon':
      b.part(w, rcyl(0.11, 0.56, 0.04, 8, 1), metal, { p: [0, 0.05, 0.26], r: along })
      b.part(w, tube(0.125, 0.125, 0.06, 8), GOLD, { p: [0, 0.05, 0.48], r: along })
      b.part(w, tube(0.125, 0.125, 0.06, 8), GOLD, { p: [0, 0.05, 0.1], r: along })
      b.part(w, sph(0.07, 6, 5), glowHex, { p: [0, 0.05, 0.55], glow: true, outline: false })
      b.part(w, rbox(0.05, 0.12, 0.06, 0.6, 6, 4), WOOD, { p: [0, -0.05, 0.02] })
      break
    case 'bow':
      // Limbs along ±Y (upright once the arm is raised), the belly toward +Z.
      b.painted(w, gradY(torus(0.3, 0.022, 4, 10, Math.PI), tone(WOOD, 0.85), tone(WOOD, 1.15)), { p: [0, 0, -0.3], r: [0, Math.PI / 2, Math.PI / 2] })
      b.part(w, rod(0.007, 0.6, 4), '#f4ead2', { p: [0, 0, -0.3], outline: false })
      b.part(w, rod(0.03, 0.11), LEATHER, { p: [0, 0, 0.04] })
      break
    case 'sling':
      b.part(w, rod(0.008, 0.2, 4), LEATHER, { p: [0, 0, 0.1], r: along, outline: false })
      b.part(w, sph(0.065, 6, 5), '#9a9a9a', { p: [0, 0, 0.2] })
      break
    case 'flask':
      b.part(w, sph(0.085, 8, 6), glowHex, { p: [0, 0, 0.11], glow: true })
      b.part(w, rod(0.03, 0.09), '#d8e2ee', { p: [0, 0, 0.2], r: along })
      b.part(w, rod(0.036, 0.04), WOOD, { p: [0, 0, 0.25], r: along })
      break
    default:
      break
  }
}

const offParts = (b: RigBuilder, off: OffHand, metal: string, trim: string, glowHex: string): void => {
  const o = 'offhand'
  const along: V3 = [Math.PI / 2, 0, 0]
  const flatX: V3 = [0, 0, Math.PI / 2]
  switch (off) {
    case 'shield':
      // Strapped to the outside of the hand: its face is −X, so a forearm
      // brought across the body turns it to the front.
      b.painted(o, gradY(lathe([[0, -0.035], [0.27, -0.016], [0.27, 0.016], [0, 0.035]], 10), tone(metal, 0.9), tone(metal, 1.1)), { p: [-0.075, 0.04, 0.02], r: flatX })
      b.part(o, lathe([[0, -0.04], [0.17, -0.02], [0.17, 0.02], [0, 0.04]], 8), trim, { p: [-0.09, 0.04, 0.02], r: flatX })
      b.part(o, sph(0.065, 5, 4), '#ffe9a8', { p: [-0.135, 0.04, 0.02] })
      break
    case 'tome':
      b.part(o, rbox(0.07, 0.26, 0.2, 0.5, 6, 4), trim, { p: [0, 0.02, 0.1] })
      b.part(o, rbox(0.08, 0.22, 0.16, 0.5, 6, 4), '#f4ead2', { p: [0, 0.02, 0.105] })
      b.part(o, rbox(0.085, 0.07, 0.07, 0.6, 5, 4), GOLD, { p: [0, 0.02, 0.1] })
      break
    case 'orb':
      b.part(o, sph(0.1, 8, 6), glowHex, { p: [0, 0.07, 0.13], glow: true })
      b.part(o, torus(0.125, 0.016, 3, 8), GOLD, { p: [0, 0.07, 0.13], r: [Math.PI / 2, 0, 0] })
      break
    case 'syringe':
      b.part(o, rod(0.04, 0.26, 6), '#d8e2ee', { p: [0, 0, 0.14], r: along })
      b.part(o, rod(0.03, 0.14), glowHex, { p: [0, 0, 0.14], r: along, glow: true, outline: false })
      b.part(o, spike(0.012, 0.1, 4), '#eef2fa', { p: [0, 0, 0.32], r: along })
      break
    case 'battery':
      b.part(o, rcyl(0.07, 0.2, 0.02, 7, 1), metal, { p: [0, 0.02, 0.1] })
      b.part(o, rcyl(0.055, 0.1, 0.02, 7, 1), glowHex, { p: [0, 0.04, 0.1], glow: true, outline: false })
      break
    case 'dagger':
      b.painted(o, gradY(blade(0.25, 0.065, 0.026, 0.6, 6), tone(metal, 0.86), tone(metal, 1.1)), { p: [0, 0, 0.05] })
      b.part(o, rbox(0.11, 0.04, 0.04, 0.6, 4, 3), GOLD, { p: [0, 0, 0.045] })
      b.part(o, rod(0.022, 0.1), LEATHER, { p: [0, 0, 0], r: along })
      break
    case 'gun':
      b.part(o, rbox(0.07, 0.09, 0.26, 0.5, 6, 5), metal, { p: [0, 0.03, 0.12] })
      b.part(o, rbox(0.05, 0.11, 0.06, 0.6, 6, 4), WOOD, { p: [0, -0.03, 0.01], r: [0.3, 0, 0] })
      b.part(o, sph(0.028, 5, 4), glowHex, { p: [0, 0.04, 0.27], glow: true, outline: false })
      break
    default:
      break
  }
}

export type HairStyle = 'short' | 'long' | 'spiky' | 'bun' | 'ponytail'
const isHair = (h: HeadGear): h is HairStyle => h === 'short' || h === 'long' || h === 'spiky' || h === 'bun' || h === 'ponytail'
/** The ponytail's tie, unless the look names one. */
const RIBBON = '#e0505e'

/** Head gear whose own swinging part (a plume, a hat's point, a hood's tip) takes the back hair bone. */
const GEAR_SWINGS: ReadonlySet<HeadGear> = new Set<HeadGear>(['hood', 'helm', 'greathelm', 'wizard', 'bandana'])

/**
 * A head of hair. `under` = worn under a hat or a helmet: only what shows is
 * built (the fringe over the brow, the hair at the nape), tucked in so it
 * cannot poke through the gear. `swing` false pins the back hair to the head
 * (the gear above it owns the swinging bone).
 */
const hairParts = (b: RigBuilder, style: HairStyle, c: string, q: Detail, under: boolean, swing: boolean, ribbon = RIBBON): void => {
  const lo = tone(c, 0.8)
  const hi = tone(c, 1.12)
  const cy = CY
  const seg = q === 2 ? 13 : q === 1 ? 11 : 9
  const cap = (theta: number, tilt: number, grow = 1.065): void => {
    if (under) return
    b.painted('head', gradY(dome(HEAD_R * grow, theta, seg, q === 2 ? 6 : 5), lo, hi), { p: [0, cy + 0.008, -0.018], r: [tilt, 0, 0] })
  }
  /** A clump of fringe over the brow (lower and flatter under a brim). */
  const lock = (x: number, y: number, z: number, rz: number, sx = 0.11, sy = 0.075): void => {
    b.part('head', ell(sx, under ? sy * 0.8 : sy, under ? 0.045 : 0.06, 6, 3), hi, { p: [x, cy + (under ? y - 0.045 : y), under ? z + 0.012 : z], r: [0.25, 0, rz] })
  }
  /** Back hair: on the swinging bone, or pinned at the same place. */
  const pivot: V3 = style === 'long' || style === 'ponytail' ? HAIR_B[style]! : style === 'bun' && !under ? HAIR_B.bun! : NAPE
  const back = (g: BufferGeometry, p: V3, r: V3 = [0, 0, 0], outline = true): void => {
    if (swing) b.painted('hairB', g, { p, r, outline })
    else b.painted('head', g, { p: [pivot[0] + p[0], pivot[1] + p[1], pivot[2] + p[2]], r, outline })
  }
  switch (style) {
    case 'short':
      cap(1.75, -0.3)
      lock(-0.13, 0.19, 0.215, 0.45)
      lock(0.03, 0.225, 0.245, -0.1, 0.12, 0.07)
      lock(0.17, 0.17, 0.18, -0.55, 0.1, 0.07)
      // A cowlick and a tuft at the nape: the strands that swing.
      if (!under) b.part('hairF', spike(0.055, 0.16, 4), hi, { p: [0, 0.06, 0], r: [0.5, 0, 0.2] })
      back(gradY(ell(0.2, 0.11, 0.1, 7, 4), lo, c), [0, -0.1, 0.02])
      break
    case 'long':
      cap(1.8, -0.3, 1.075)
      lock(-0.12, 0.2, 0.225, 0.4)
      lock(0.07, 0.215, 0.24, -0.3, 0.13, 0.07)
      // A curtain down the back, and two locks beside the face.
      back(gradY(ell(0.29, 0.3, 0.12, 9, 6), lo, c), [0, -0.27, 0])
      b.part(under ? 'head' : 'hairF', ell(0.055, 0.17, 0.06, 5, 4), c, { p: under ? [-0.275, cy - 0.1, 0.03] : [-0.275, -0.4, -0.03] })
      b.part(under ? 'head' : 'hairF', ell(0.055, 0.17, 0.06, 5, 4), c, { p: under ? [0.275, cy - 0.1, 0.03] : [0.275, -0.4, -0.03] })
      break
    case 'spiky':
      cap(1.6, -0.25, 1.05)
      if (!under) {
        for (let k = 0; k < 5; k++) {
          const a = (k - 2) * 0.42
          b.part(k % 2 ? 'hairF' : 'head', spike(0.08, 0.25, 5), hi, k % 2
            ? { p: [Math.sin(a) * 0.2, 0.02 + Math.cos(a) * 0.05, -0.12], r: [-0.2, 0, -a * 0.9] }
            : { p: [Math.sin(a) * 0.2, cy + 0.3 + Math.cos(a) * 0.05, -0.02], r: [-0.2, 0, -a * 0.9] })
        }
      }
      lock(-0.1, 0.2, 0.225, 0.5, 0.09, 0.07)
      lock(0.1, 0.2, 0.225, -0.5, 0.09, 0.07)
      back(gradY(spike(0.1, 0.2, 5), lo, c), [0, -0.08, -0.03], [-2.4, 0, 0])
      break
    case 'bun':
      cap(1.75, -0.3)
      lock(-0.1, 0.205, 0.235, 0.35)
      lock(0.1, 0.205, 0.235, -0.35)
      if (under) back(gradY(ell(0.2, 0.11, 0.1, 7, 4), lo, c), [0, -0.1, 0.02])
      else back(gradY(sph(0.125, 8, 6), c, hi), [0, 0.03, 0])
      b.part(under ? 'head' : 'hairF', ell(0.04, 0.13, 0.045, 5, 4), c, { p: under ? [-0.27, cy - 0.08, 0.03] : [-0.27, -0.38, -0.03] })
      b.part(under ? 'head' : 'hairF', ell(0.04, 0.13, 0.045, 5, 4), c, { p: under ? [0.27, cy - 0.08, 0.03] : [0.27, -0.38, -0.03] })
      break
    case 'ponytail': {
      // The girl hero (roadmap #71): a side-swept fringe and a high ponytail
      // tied with a ribbon that swings on the hair spring. Under a helmet the
      // tail still shows below its rim. (Kept lean: the hero's triangle
      // budget holds for her in the heaviest gear too.)
      cap(1.8, -0.3, 1.07)
      // Two broad locks sweep across the brow from her right.
      lock(-0.11, 0.2, 0.225, 0.5, 0.15, 0.075)
      lock(0.12, 0.185, 0.215, -0.15, 0.13, 0.068)
      // The tail hangs down and back from the tie: full near the top, a soft
      // point at the end.
      const tail = lathe([[0, -0.44], [0.045, -0.39], [0.095, -0.26], [0.1, -0.13], [0.07, -0.03], [0.045, 0]], q === 0 ? 5 : 6)
      back(gradY(tail, lo, hi), [0, -0.01, -0.02], [0.42, 0, 0])
      // The ribbon around its root, square to the tail.
      const tie = (g: BufferGeometry): BufferGeometry => gradY(g, tone(ribbon, 0.82), tone(ribbon, 1.12))
      back(tie(torus(0.052, 0.026, 3, 5)), [0, -0.005, -0.012], [-1.15, 0, 0], false)
      break
    }
  }
}

/**
 * What is on the head. A hair style is the head gear of the bare-headed; any
 * other kind is worn OVER the look's `style` of hair (when it has one), which
 * then shows only where the gear leaves it room: the fringe and the nape.
 */
const headGear = (b: RigBuilder, l: Look, q: Detail): void => {
  if (isHair(l.head)) { hairParts(b, l.head, l.hair, q, false, true, l.ribbon); return }
  // Legacy looks colour their gear with `hair`; a look with gear AND hair names the gear's colour.
  const c = l.headCol ?? l.hair
  const trim = l.headTrim ?? l.trim
  const lo = tone(c, 0.8)
  const hi = tone(c, 1.12)
  const cy = CY
  const bone = 'head'
  const seg = q === 2 ? 13 : q === 1 ? 11 : 9
  const under = (): void => { if (l.style) hairParts(b, l.style, l.hair, q, true, !GEAR_SWINGS.has(l.head), l.ribbon) }
  switch (l.head) {
    case 'hood':
      b.painted(bone, gradY(dome(HEAD_R * 1.17, 1.84, seg, 7), lo, hi), { p: [0, cy + 0.02, -0.04], r: [-0.56, 0, 0] })
      // The face sits in the hood's shadow; the point flops behind.
      b.part(bone, torus(HEAD_R * 1.02, 0.04, 3, 10, Math.PI * 1.25), hi, { p: [0, cy - 0.015, 0.09], r: [0.18, 0, -Math.PI * 0.125] })
      b.painted('hairB', gradY(spike(0.15, 0.26, 6), lo, c), { p: [0, 0.03, -0.06], r: [-1.1, 0, 0] })
      if (l.style) {
        // Only the fringe finds its way out of a hood.
        b.part(bone, ell(0.1, 0.055, 0.045, 6, 4), tone(l.hair, 1.1), { p: [-0.1, cy + 0.15, 0.25], r: [0.25, 0, 0.45] })
        b.part(bone, ell(0.1, 0.055, 0.045, 6, 4), tone(l.hair, 1.1), { p: [0.11, cy + 0.14, 0.24], r: [0.25, 0, -0.5] })
      }
      break
    case 'helm':
      // Open-faced: a skull cap, a brow band with a nasal, cheek guards. The face stays in view.
      b.painted(bone, gradY(dome(HEAD_R * 1.1, 1.72, seg, 6), lo, hi), { p: [0, cy + 0.02, -0.01], r: [-0.22, 0, 0] })
      b.part(bone, rbox(0.5, 0.06, 0.07, 0.6, 6, 3), trim, { p: [0, cy + 0.115, 0.285] })
      b.part(bone, rbox(0.05, 0.17, 0.05, 0.6, 4, 3), hi, { p: [0, cy + 0.035, 0.315] })
      b.mirror((s) => { b.part(bone, rbox(0.07, 0.25, 0.2, 0.55, 5, 3), c, { p: [s * 0.3, cy - 0.08, 0.04] }) })
      // The crest is a plume: it swings.
      b.painted('hairB', gradY(ell(0.045, 0.15, 0.2, 5, 4), tone(trim, 0.8), tone(trim, 1.15)), { p: [0, 0.1, 0.02] })
      under()
      break
    case 'greathelm':
      b.painted(bone, gradY(sph(HEAD_R * 1.12, seg, 9), lo, hi), { p: [0, cy, 0] })
      b.part(bone, rbox(0.42, 0.07, 0.08, 0.6, 7, 4), DARK, { p: [0, cy + 0.02, 0.3], outline: false })
      b.part(bone, rbox(0.06, 0.26, 0.07, 0.6, 5, 4), hi, { p: [0, cy - 0.1, 0.325] })
      b.mirror((s) => {
        b.part(bone, spike(0.055, 0.3, 5), trim, { p: [s * 0.2, cy + 0.36, 0], r: [0, 0, -s * 0.5] })
        if (l.eyeGlow) b.part(bone, sph(0.032, 5, 4), l.eyeGlow, { p: [s * 0.1, cy + 0.02, 0.325], glow: true, outline: false })
      })
      b.painted('hairB', gradY(ell(0.04, 0.2, 0.16, 6, 5), tone(trim, 0.8), tone(trim, 1.15)), { p: [0, 0.06, -0.08] })
      break
    case 'crown':
      hairParts(b, l.style ?? 'short', l.hair, q, false, true, l.ribbon)
      b.part(bone, tube(0.225, 0.2, 0.1, 10), '#ffd24a', { p: [0, cy + 0.32, 0] })
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2
        b.part(bone, spike(0.042, 0.12, 4), '#ffd24a', { p: [Math.sin(a) * 0.215, cy + 0.41, Math.cos(a) * 0.215] })
      }
      b.part(bone, sph(0.036, 5, 4), '#ff4a6a', { p: [0, cy + 0.325, 0.215], glow: true, outline: false })
      break
    case 'circlet':
      // A band across the brow over a full head of hair, with a stone at the front.
      hairParts(b, l.style ?? 'short', l.hair, q, false, true, l.ribbon)
      b.part(bone, torus(HEAD_R * 1.045, 0.026, 3, 12), c, { p: [0, cy + 0.15, -0.01], r: [Math.PI / 2 - 0.2, 0, 0] })
      b.part(bone, spike(0.04, 0.09, 4), c, { p: [0, cy + 0.245, 0.29], r: [0.35, 0, 0] })
      b.part(bone, sph(0.034, 5, 4), l.glow ?? trim, { p: [0, cy + 0.2, 0.305], glow: true, outline: false })
      break
    case 'wizard':
      b.part(bone, lathe([[0, -0.02], [0.45, -0.008], [0.45, 0.008], [0, 0.02]], 11), c, { p: [0, cy + 0.2, 0], r: [-0.08, 0, 0] })
      b.painted(bone, gradY(lathe([[0.27, -0.13], [0.135, 0.13], [0, 0.14]], 9), lo, c), { p: [0, cy + 0.33, -0.02], r: [-0.14, 0, 0] })
      b.part(bone, tube(0.275, 0.262, 0.07, 10), trim, { p: [0, cy + 0.25, -0.01], r: [-0.1, 0, 0] })
      // The point of the hat flops.
      b.painted('hairB', gradY(spike(0.135, 0.32, 7), c, hi), { p: [0, 0.15, 0], r: [-0.25, 0, 0] })
      b.part('hairB', sph(0.04, 5, 4), trim, { p: [0, 0.31, -0.045] })
      under()
      break
    case 'hat':
      // A traveller's hat: a wide brim turned up at one side, a low crown, a band and a feather.
      b.part(bone, lathe([[0, -0.018], [0.43, -0.008], [0.43, 0.008], [0, 0.018]], 11), c, { p: [0, cy + 0.205, -0.01], r: [-0.1, 0, 0.07] })
      b.painted(bone, gradY(lathe([[0.262, -0.1], [0.215, 0.06], [0.15, 0.1], [0, 0.11]], 9), lo, hi), { p: [0, cy + 0.31, -0.02], r: [-0.1, 0, 0] })
      b.part(bone, tube(0.268, 0.262, 0.055, 10), trim, { p: [0, cy + 0.245, -0.015], r: [-0.1, 0, 0] })
      b.painted(bone, gradY(ell(0.03, 0.17, 0.06, 5, 4), tone(trim, 0.9), '#ffffff'), { p: [0.24, cy + 0.36, -0.08], r: [-0.5, 0, -0.5] })
      under()
      break
    case 'cap':
      b.painted(bone, gradY(dome(HEAD_R * 1.085, 1.6, seg, 5), lo, hi), { p: [0, cy + 0.03, -0.01], r: [-0.15, 0, 0] })
      b.part(bone, rbox(0.34, 0.045, 0.22, 0.6, 7, 4), c, { p: [0, cy + 0.14, 0.33], r: [0.25, 0, 0] })
      b.part(bone, sph(0.035, 5, 4), hi, { p: [0, cy + 0.36, -0.06] })
      if (l.style) under()
      else b.painted('hairB', gradY(ell(0.2, 0.1, 0.1, 7, 4), tone(c, 0.6), tone(c, 0.75)), { p: [0, -0.1, 0.02] })
      break
    case 'leathercap':
      // A stitched leather cap with ear flaps, a seam over the crown and a stud.
      b.painted(bone, gradY(dome(HEAD_R * 1.08, 1.68, seg, 6), lo, hi), { p: [0, cy + 0.02, -0.015], r: [-0.26, 0, 0] })
      b.part(bone, rbox(0.045, 0.05, 0.6, 0.6, 4, 5), tone(c, 1.3), { p: [0, cy + 0.305, -0.03], r: [-0.26, 0, 0] })
      b.part(bone, torus(HEAD_R * 1.065, 0.028, 3, 9, Math.PI * 1.1), trim, { p: [0, cy + 0.13, 0.0], r: [Math.PI / 2 - 0.26, 0, -Math.PI * 0.05] })
      b.mirror((s) => {
        b.painted(bone, gradY(ell(0.045, 0.13, 0.11, 4, 3), lo, c), { p: [s * 0.305, cy - 0.06, 0.0] })
        b.part(bone, sph(0.022, 4, 3), GOLD, { p: [s * 0.335, cy - 0.13, 0.02] })
      })
      under()
      break
    case 'bandana':
      b.painted(bone, gradY(dome(HEAD_R * 1.055, 1.5, seg, 5), lo, hi), { p: [0, cy + 0.02, -0.01], r: [-0.2, 0, 0] })
      b.part(bone, sph(0.05, 5, 4), c, { p: [0.14, cy + 0.14, -0.27] })
      b.part('hairB', ell(0.045, 0.13, 0.03, 5, 4), c, { p: [-0.03, -0.1, 0], r: [0, 0, 0.25] })
      b.part('hairB', ell(0.04, 0.11, 0.03, 5, 4), hi, { p: [0.05, -0.08, -0.01], r: [0, 0, -0.3] })
      under()
      break
    case 'horns':
      for (const s of [-1, 1] as const) {
        b.painted(bone, gradY(spike(0.08, 0.36, 6), lo, hi), { p: [s * 0.22, cy + 0.3, 0.02], r: [0.2, 0, -s * 0.55] })
      }
      break
    case 'goggles':
      // Hair of its own (the look's colour), goggles pushed up on the brow.
      hairParts(b, l.style ?? 'spiky', l.hair, q, false, true, l.ribbon)
      b.part(bone, tube(HEAD_R * 1.09, HEAD_R * 1.09, 0.05, 10), LEATHER, { p: [0, cy + 0.13, -0.01], r: [-0.3, 0, 0] })
      b.mirror((s) => {
        b.part(bone, torus(0.082, 0.026, 3, 7), '#b9c4d6', { p: [s * 0.115, cy + 0.185, 0.262], r: [0.3, s * 0.3, 0] })
        b.part(bone, lens(0.062, 0.062, 0.03, 5, 4), l.glow ?? '#7ff4ff', { p: [s * 0.115, cy + 0.185, 0.262], r: [-0.3, s * 0.3, 0], glow: true, outline: false })
      })
      break
    default:
      break
  }
}

const hasFace = (l: Look): boolean => l.head !== 'greathelm'

/** Where the swinging part of each head's hair (or plume, or hat point) hinges. */
const NAPE: V3 = [0, CY - 0.05, -0.27]
const HAIR_B: Partial<Record<HeadGear, V3>> = {
  long: [0, CY + 0.02, -0.26], bun: [0, CY + 0.3, -0.13], ponytail: [0, CY + 0.16, -0.285], hood: [0, CY + 0.25, -0.24], helm: [0, CY + 0.33, -0.05],
  greathelm: [0, CY + 0.33, -0.05], wizard: [0, CY + 0.44, -0.05], bandana: [0, CY + 0.14, -0.3]
}

/**
 * Build a chibi humanoid. Bones: root, hips, torso, neck, head, the face
 * (browL/R, lids, mouth), hairF, hairB, armL/R → foreL/R → handL/R, weapon
 * (right hand), offhand (left hand), legL/R → shinL/R → footL/R, plus cape,
 * cape2, tail and wingL/R when the look has them.
 */
export const buildHumanoid = (l: Look, detail?: Detail): Rig => {
  const q: Detail = detail ?? (sceneQuality() === 'low' ? 0 : l.hero ? 2 : 1)
  const k = l.bulk ?? 1
  /** Limbs thicken less than the trunk does. */
  const kl = 1 + (k - 1) * 0.7
  const skeletal = l.head === 'skull'
  const face = hasFace(l)
  const bare = l.outfit === 'bare'
  const robe = l.outfit === 'robe'
  const plate = l.outfit === 'plate'
  /** Radial segments of a limb, by detail. */
  const R = q === 2 ? 8 : q === 1 ? 7 : 6
  /** Rings in a limb's rounded ends. */
  const CS = q === 2 ? 2 : 1
  const metal = l.metal ?? '#c9d3e4'
  const glowHex = l.glow ?? '#7ff4ff'
  const skin = l.skin
  const skinLo = tone(skin, 0.86)

  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('hips', 'root', [0, HIP_Y, 0])
  b.bone('torso', 'hips', [0, WAIST_Y, 0])
  b.bone('neck', 'torso', [0, NECK_Y, 0])
  b.bone('head', 'neck', [0, 0.035, 0])
  if (face) {
    b.mirror((s, t) => { b.bone('brow' + t, 'head', [s * EYE_X, EYE_Y + EYE_RY + 0.045, 0.268]) })
    b.bone('lids', 'head', [0, EYE_Y + EYE_RY, 0.25])
    b.bone('mouth', 'head', [0, CY - 0.165, 0.272])
  }
  b.bone('hairF', 'head', [0, CY + HEAD_R * 0.97, 0.06])
  b.bone('hairB', 'head', HAIR_B[l.head] ?? ((l.style === 'long' || l.style === 'ponytail') && !GEAR_SWINGS.has(l.head) ? HAIR_B[l.style]! : NAPE))
  b.mirror((s, t) => {
    b.bone('arm' + t, 'torso', [s * SHOULDER_X * k, SHOULDER_Y, 0])
    b.bone('fore' + t, 'arm' + t, [0, -UPPER, 0])
    b.bone('hand' + t, 'fore' + t, [0, -FORE, 0])
    b.bone('leg' + t, 'hips', [s * 0.095 * k, 0, 0])
    b.bone('shin' + t, 'leg' + t, [0, -THIGH, 0])
    b.bone('foot' + t, 'shin' + t, [0, -SHIN, 0])
  })
  b.bone('weapon', 'handR', [0, -0.05, 0.015], WEAPON_REST[l.held])
  b.bone('offhand', 'handL', [0, -0.05, 0.015], OFF_REST[l.off])
  if (l.cape) {
    b.bone('cape', 'torso', [0, 0.35, -0.13 * k])
    b.bone('cape2', 'cape', [0, -0.3, 0])
  }
  if (l.tail) b.bone('tail', 'hips', [0, 0.05, -0.16])
  if (l.wings) b.mirror((s, t) => { b.bone('wing' + t, 'torso', [s * 0.1, 0.3, -0.16]) })

  // ── Legs: thigh, shin, foot ──
  const unshod = bare || l.outfit === 'rags'
  /** Foot gear: its own layer when the look names one, else what the outfit implies. */
  const boots: GearKind | 'bare' = l.boots ?? (unshod ? 'bare' : plate ? 'plate' : robe ? 'cloth' : 'leather')
  const bootTrim = l.bootTrim ?? l.trim
  const legCol = unshod ? skin : l.bottom
  const shinCol = boots === 'plate' ? tone(bootTrim, 0.92) : boots === 'cloth' ? tone(l.bottom, 0.72) : boots === 'leather' ? tone(LEATHER, 1.12) : legCol
  const bootCol = boots === 'bare' ? skin : boots === 'plate' ? bootTrim : boots === 'cloth' ? tone(l.bottom, 0.6) : boots === 'leather' ? LEATHER : '#3a2c2a'
  const thin = skeletal ? 0.6 : 1
  b.mirror((_s, t) => {
    b.painted('leg' + t, gradY(limb(0.094 * kl * thin, 0.074 * kl * thin, THIGH, R, CS), tone(legCol, 0.9), legCol), {})
    b.painted('shin' + t, gradY(limb(0.07 * kl * thin, 0.058 * kl * thin, SHIN, R, 1), tone(shinCol, 0.86), shinCol), {})
    // A boot with a toe: longer forward than back, flat underneath.
    b.painted('foot' + t, gradY(rbox(0.13 * kl, 0.088, 0.225, 0.55, q === 2 ? 8 : 6, q === 2 ? 5 : 4), tone(bootCol, 0.8), bootCol), { p: [0, -0.011, 0.045] })
    if (boots === 'leather') {
      // The boot's cuff, turned down over the shin, with a band of the tier's colour.
      b.part('shin' + t, tube(0.084 * kl, 0.072 * kl, 0.05, R), tone(LEATHER, 1.45), { p: [0, -0.02, 0] })
      if (q > 0) b.part('shin' + t, tube(0.073 * kl, 0.07 * kl, 0.022, R), bootTrim, { p: [0, -0.065, 0] })
    } else if (boots === 'cloth') {
      b.part('shin' + t, tube(0.076 * kl, 0.072 * kl, 0.03, R), bootTrim, { p: [0, -0.012, 0] })
    } else if (boots === 'plate') {
      // A greave with a knee cop, and a ridge down the sabaton.
      b.part('shin' + t, sph(0.064 * kl, 5, 3), tone(bootTrim, 1.15), { p: [0, 0.0, 0.035] })
      if (q === 2) {
        b.part('shin' + t, tube(0.076 * kl, 0.07 * kl, 0.03, R), tone(bootTrim, 1.2), { p: [0, -SHIN + 0.05, 0] })
        b.part('foot' + t, rbox(0.045, 0.05, 0.2, 0.6, 5, 4), tone(bootTrim, 1.25), { p: [0, 0.028, 0.06] })
      }
    }
  })

  // ── Hips and torso: a waist between them, so the two can twist apart ──
  const topCol = bare ? skin : l.top
  const pelvisCol = l.bottom
  b.painted('hips', gradY(ell(0.17 * k, 0.115, 0.14 * k, q === 2 ? 10 : 8, q === 2 ? 6 : 5), tone(pelvisCol, 0.85), pelvisCol), { p: [0, 0.0, 0] })
  const trunk = (): BufferGeometry => lathe([
    [0, -0.03], [0.148 * k, -0.03], [0.156 * k, 0.03], [0.186 * k, 0.15], [0.202 * k, 0.26], [0.168 * k, 0.335], [0.085, 0.385], [0, 0.39]
  ], q === 2 ? 11 : q === 1 ? 9 : 8)
  if (skeletal) {
    // A ribcage: a narrow chest with dark gaps between the ribs.
    b.part('torso', ell(0.15, 0.17, 0.11, 9, 6), skin, { p: [0, 0.22, 0] })
    b.part('torso', rcyl(0.03, 0.2, 0.01, 6, 1), skin, { p: [0, 0.06, -0.02] })
    for (let i = 0; i < 3; i++) b.part('torso', rbox(0.2, 0.022, 0.03, 0.5, 6, 3), DARK, { p: [0, 0.16 + i * 0.065, 0.1], outline: false })
  } else {
    b.painted('torso', gradY(trunk(), tone(topCol, 0.84), tone(topCol, 1.04)), { s: [1, 1, 0.8] })
  }

  switch (l.outfit) {
    case 'robe': {
      // The skirt hangs from the hips; the legs walk under it.
      b.painted('hips', gradY(lathe([[0.31 * k, -0.33], [0.275 * k, -0.2], [0.2 * k, -0.02], [0.158 * k, 0.07]], q === 0 ? 9 : 12), tone(l.top, 0.74), tone(l.top, 0.98)), { s: [1, 1, 0.86] })
      b.part('hips', tube(0.318 * k, 0.312 * k, 0.045, q === 0 ? 9 : 12), l.trim, { p: [0, -0.305, 0], s: [1, 1, 0.86] })
      // A sash, and a stripe down the front.
      b.part('hips', tube(0.172 * k, 0.166 * k, 0.06, 10), l.trim, { p: [0, 0.06, 0], s: [1, 1, 0.82] })
      b.part('hips', ell(0.03, 0.09, 0.02, 5, 4), l.trim, { p: [0.03, -0.04, 0.165 * k], r: [-0.25, 0, 0] })
      b.part('torso', rbox(0.055, 0.3, 0.03, 0.5, 5, 4), l.trim, { p: [0, 0.2, 0.152 * k], r: [-0.07, 0, 0] })
      if (l.cowl || l.head === 'hood') b.part('torso', torus(0.15, 0.05, 4, 8), tone(l.head === 'hood' ? (l.headCol ?? l.hair) : l.top, 0.9), { p: [0, 0.37, -0.02], r: [Math.PI / 2 - 0.25, 0, 0] })
      else b.part('torso', tube(0.1, 0.125, 0.05, 8), l.trim, { p: [0, 0.375, 0.0] })
      break
    }
    case 'plate': {
      // Breastplate, gorget, a skirt of plates, a belt.
      b.painted('torso', gradY(ell(0.2 * k, 0.17, 0.125, 8, 5), tone(l.trim, 0.9), tone(l.trim, 1.18)), { p: [0, 0.225, 0.075] })
      if (q === 2) b.part('torso', ell(0.035, 0.1, 0.02, 4, 3), tone(l.trim, 1.3), { p: [0, 0.24, 0.195] })
      b.part('torso', tube(0.105, 0.135, 0.06, 8), l.trim, { p: [0, 0.378, 0] })
      b.painted('hips', gradY(lathe([[0.215 * k, -0.105], [0.19 * k, -0.02], [0.16 * k, 0.07]], 10), tone(l.trim, 0.8), l.trim), { s: [1, 1, 0.84] })
      b.part('hips', tube(0.168 * k, 0.164 * k, 0.05, 10), LEATHER, { p: [0, 0.055, 0], s: [1, 1, 0.83] })
      b.part('hips', rbox(0.065, 0.06, 0.03, 0.6, 4, 3), GOLD, { p: [0, 0.055, 0.137 * k] })
      break
    }
    case 'apron': {
      b.part('torso', rbox(0.26 * k, 0.3, 0.05, 0.5, 7, 5), l.trim, { p: [0, 0.16, 0.145 * k], r: [-0.06, 0, 0] })
      b.part('hips', rbox(0.3 * k, 0.24, 0.05, 0.5, 7, 5), l.trim, { p: [0, -0.06, 0.135 * k], r: [0.08, 0, 0] })
      b.part('hips', tube(0.172 * k, 0.168 * k, 0.045, 10), tone(l.trim, 0.7), { p: [0, 0.06, 0], s: [1, 1, 0.83] })
      b.part('torso', tube(0.095, 0.12, 0.04, 8), tone(l.trim, 0.7), { p: [0, 0.37, 0.01], r: [-0.3, 0, 0] })
      break
    }
    case 'rags': {
      // A torn vest over bare skin, a loincloth, wraps.
      b.part('hips', lathe([[0.21 * k, -0.1], [0.185 * k, 0], [0.16 * k, 0.06]], 9), l.bottom, { s: [1, 1, 0.84] })
      b.part('hips', tube(0.168 * k, 0.164 * k, 0.04, 9), l.trim, { p: [0, 0.055, 0], s: [1, 1, 0.83] })
      b.part('torso', ell(0.075, 0.18, 0.04, 5, 4), tone(l.top, 0.75), { p: [-0.07 * k, 0.21, 0.135 * k], r: [0, 0, 0.5] })
      break
    }
    case 'bare': {
      if (!skeletal) {
        b.part('hips', lathe([[0.2 * k, -0.09], [0.185 * k, 0], [0.16 * k, 0.06]], 9), l.bottom, { s: [1, 1, 0.84] })
        b.part('hips', tube(0.168 * k, 0.164 * k, 0.04, 9), l.trim, { p: [0, 0.055, 0], s: [1, 1, 0.83] })
        // A chest that reads as muscle: a lighter plate of it.
        b.part('torso', ell(0.15 * k, 0.1, 0.05, 7, 4), tone(skin, 1.1), { p: [0, 0.25, 0.12 * k], outline: false })
      }
      break
    }
    default: {
      // Tunic and leather: a skirt of the tunic under a belt with a buckle.
      b.painted('hips', gradY(lathe([[0.215 * k, -0.105], [0.195 * k, -0.02], [0.16 * k, 0.07]], 10), tone(l.top, 0.78), tone(l.top, 0.94)), { s: [1, 1, 0.84] })
      b.part('hips', tube(0.17 * k, 0.166 * k, 0.05, 10), l.outfit === 'leather' ? tone(l.trim, 1.0) : LEATHER, { p: [0, 0.055, 0], s: [1, 1, 0.83] })
      b.part('hips', rbox(0.065, 0.06, 0.03, 0.6, 4, 3), GOLD, { p: [0, 0.055, 0.139 * k] })
      // A collar, open at the throat.
      b.part('torso', tube(0.1, 0.125, 0.05, 8), tone(l.top, 1.2), { p: [0, 0.372, 0.005], r: [-0.2, 0, 0] })
      if (l.outfit === 'leather') {
        // A strap across the chest and a pouch on the hip.
        b.part('torso', rbox(0.05, 0.42, 0.03, 0.5, 4, 3), tone(l.trim, 1.15), { p: [0, 0.19, 0.145 * k], r: [-0.06, 0, 0.72] })
        b.part('hips', rbox(0.08, 0.09, 0.06, 0.55, 4, 3), tone(l.trim, 1.25), { p: [0.15 * k, 0.0, 0.07] })
      } else if (q > 0) {
        b.part('torso', rbox(0.05, 0.2, 0.025, 0.5, 5, 4), tone(l.top, 1.22), { p: [0, 0.24, 0.158 * k], r: [-0.08, 0, 0] })
      }
      break
    }
  }
  if (l.pauldrons) {
    b.mirror((s) => {
      b.painted('torso', gradY(dome(0.155 * k, 1.5, 8, 3), tone(l.trim, 0.9), tone(l.trim, 1.2)), { p: [s * 0.25 * k, 0.33, 0], r: [0, 0, -s * 0.5] })
      if (q === 2) b.part('torso', spike(0.035, 0.08, 4), tone(l.trim, 1.25), { p: [s * 0.3 * k, 0.43, 0], r: [0, 0, -s * 0.5] })
    })
  }

  // ── Neck ──
  if (!skeletal) b.part('neck', tube(0.07, 0.078, 0.09, 8), skinLo, { p: [0, 0.0, 0] })
  else b.part('neck', rcyl(0.03, 0.1, 0.01, 6, 1), skin, { p: [0, 0, 0] })

  // ── Arms: shoulder, upper arm, forearm, a mitten with a thumb ──
  const longSleeve = robe || plate || l.outfit === 'leather'
  const upperCol = bare || l.outfit === 'rags' ? skin : l.top
  const foreCol = bare || l.outfit === 'rags' || l.outfit === 'apron' || l.outfit === 'tunic' ? skin : l.top
  /** Hand gear: its own layer when the look names one, else what the outfit implies. */
  const gloves: GearKind = l.gloves ?? (plate ? 'plate' : l.outfit === 'leather' || l.outfit === 'apron' ? 'leather' : 'none')
  const gloveTrim = l.gloveTrim ?? l.trim
  const handCol = gloves === 'plate' ? tone(gloveTrim, 0.95) : gloves === 'leather' ? LEATHER : gloves === 'cloth' ? tone(l.top, 0.78) : skeletal ? '#e8e2cf' : skin
  b.mirror((s, t) => {
    b.painted('arm' + t, gradY(limb(0.08 * kl * thin, 0.064 * kl * thin, UPPER, R, CS), tone(upperCol, 0.88), upperCol), {})
    if (robe) {
      // A wide sleeve that opens at the wrist.
      b.painted('fore' + t, gradY(lathe([[0, -FORE - 0.02], [0.105 * kl, -FORE - 0.02], [0.092 * kl, -FORE * 0.55], [0.066 * kl, 0.02], [0, 0.05]], R), tone(l.top, 0.8), l.top), {})
      b.part('fore' + t, tube(0.108 * kl, 0.108 * kl, 0.03, R), l.trim, { p: [0, -FORE - 0.005, 0] })
    } else {
      b.painted('fore' + t, gradY(limb(0.062 * kl * thin, 0.052 * kl * thin, FORE, R, 1), tone(foreCol, 0.9), foreCol), {})
      if (!longSleeve && !bare && l.outfit !== 'rags' && q > 0) {
        // The hem of a short sleeve.
        b.part('arm' + t, tube(0.082 * kl, 0.086 * kl, 0.035, R), tone(l.top, 1.2), { p: [0, -UPPER + 0.04, 0] })
      }
      if (plate || l.outfit === 'leather') {
        // A bracer.
        b.part('fore' + t, tube(0.07 * kl, 0.066 * kl, 0.075, R), plate ? l.trim : tone(l.trim, 1.2), { p: [0, -FORE + 0.045, 0] })
      } else if (l.outfit === 'rags' && q > 0) {
        b.part('fore' + t, tube(0.062 * kl, 0.058 * kl, 0.04, R), l.top, { p: [0, -FORE + 0.03, 0] })
      }
    }
    b.painted('hand' + t, gradY(ell(0.064 * kl, 0.074 * kl, 0.058 * kl, q === 2 ? 8 : 6, q === 2 ? 5 : 4), tone(handCol, 0.9), handCol), { p: [0, -0.042, 0.004] })
    if (q > 0) b.part('hand' + t, ell(0.026 * kl, 0.036 * kl, 0.026 * kl, 4, 3), handCol, { p: [-s * 0.048 * kl, -0.03, 0.036], r: [0, 0, s * 0.5] })
    if (gloves === 'plate') {
      // A gauntlet: a flared cuff and a ridge of knuckles.
      b.part('hand' + t, tube(0.086 * kl, 0.064 * kl, 0.06, R), tone(gloveTrim, 1.15), { p: [0, 0.012, 0] })
      if (q === 2) b.part('hand' + t, rbox(0.1 * kl, 0.03, 0.05, 0.6, 5, 3), tone(gloveTrim, 1.3), { p: [0, -0.07, 0.03] })
    } else if (gloves === 'leather') {
      b.part('hand' + t, tube(0.08 * kl, 0.064 * kl, 0.05, R), tone(LEATHER, 1.45), { p: [0, 0.01, 0] })
      if (q > 0) b.part('hand' + t, tube(0.068 * kl, 0.066 * kl, 0.018, R), gloveTrim, { p: [0, -0.012, 0] })
    } else if (gloves === 'cloth') {
      b.part('hand' + t, tube(0.07 * kl, 0.064 * kl, 0.028, R), gloveTrim, { p: [0, 0.004, 0] })
    }
  })

  // ── Head and face ──
  const hs = q === 2 ? 10 : q === 1 ? 9 : 7
  const ws = q === 2 ? 14 : q === 1 ? 12 : 10
  b.painted('head', gradY(headGeo(ws, hs), tone(skin, 0.94), tone(skin, 1.03)), { p: [0, CY, 0] })
  if (face) {
    const iris = l.eye ?? '#7a4a2a'
    const lidCol = tone(skin, 0.9)
    const browCol = skeletal ? DARK : tone(l.beard ?? (isHair(l.head) || l.style || l.head === 'crown' || l.head === 'goggles' || l.head === 'circlet' ? l.hair : '#3a2a22'), 0.55)
    b.mirror((s, t) => {
      const ry = s * 0.37
      if (skeletal || l.eyeGlow) {
        // Sockets with a light inside.
        b.part('head', lens(0.086, 0.104, 0.03, 6, 4), DARK, { p: [s * EYE_X, EYE_Y, 0.262], r: [0, ry, 0], outline: false })
        b.part('head', sph(0.04, 5, 4), l.eyeGlow ?? '#7dff8a', { p: [s * EYE_X, EYE_Y, 0.285], glow: true, outline: false })
      } else {
        // A big dark gem of an eye, the iris lit from below, a catch-light on top.
        b.part('head', lens(0.08, EYE_RY, 0.036, q === 2 ? 8 : 6, q === 2 ? 5 : 4), mixHex(DARK, iris, 0.22), { p: [s * EYE_X, EYE_Y, 0.258], r: [0, ry, 0], outline: false })
        b.part('head', lens(0.058, 0.058, 0.022, q === 2 ? 5 : 4, 3), mixHex(iris, '#ffffff', 0.18), { p: [s * EYE_X + s * 0.006, EYE_Y - 0.042, 0.276], r: [0, ry, 0], outline: false })
        b.part('head', sph(0.027, 4, 3), '#ffffff', { p: [s * EYE_X - 0.022, EYE_Y + 0.04, 0.294], glow: true, outline: false })
        if (q === 2) b.part('head', sph(0.013, 4, 3), '#ffffff', { p: [s * EYE_X + 0.024, EYE_Y - 0.03, 0.296], glow: true, outline: false })
        // The lid: a sliver at the top of the eye that drops over it to blink.
        b.part('lids', lens(0.088, EYE_RY * 1.04, 0.044, 6, 4), lidCol, { p: [s * EYE_X, -EYE_RY, 0.012], r: [0, ry, 0], outline: false })
        // Its lash line (a bolder one on a girl's face).
        b.part('lids', lens(l.fem ? 0.09 : 0.084, l.fem ? 0.024 : 0.016, 0.02, 4, 2), DARK, { p: [s * EYE_X, -EYE_RY * 2 + 0.012, 0.03], r: [0, ry, 0], outline: false })
        if (l.fem) {
          // A lash flicking out at the outer corner, over the lid.
          b.part('head', spike(0.018, 0.075, 3), DARK, { p: [s * (EYE_X + 0.07), EYE_Y + EYE_RY * 0.72, 0.258], r: [0.2, ry, -s * 1.0], outline: false })
        }
      }
      // A girl's brows are finer and arched; a boy's thicker and straighter.
      if (!skeletal) b.part('brow' + t, l.fem ? ell(0.064, 0.012, 0.018, 4, 3) : ell(0.062, 0.017, 0.02, 4, 3), browCol, { r: [0, ry, -s * (l.fem ? 0.2 : 0.12)], outline: false })
    })
    if (skeletal) {
      // A row of teeth; the jaw drops when it shouts.
      b.part('head', lens(0.03, 0.04, 0.02, 4, 3), DARK, { p: [0, CY - 0.11, 0.285], outline: false })
      b.part('mouth', rbox(0.2, 0.075, 0.07, 0.5, 6, 4), '#cfc8b4', { p: [0, -0.01, -0.02], outline: false })
      for (let i = -1; i <= 1; i++) b.part('mouth', rbox(0.012, 0.06, 0.02, 0.6, 4, 3), DARK, { p: [i * 0.05, 0, 0.018], outline: false })
    } else {
      b.part('mouth', lens(0.046, 0.034, 0.016, 4, 3), l.fem ? '#8a2f40' : '#6a2a34', { outline: false })
      b.part('head', lens(0.021, 0.018, 0.024, 4, 3), tone(skin, 0.86), { p: [0, CY - 0.095, 0.296], outline: false })
      if (q > 0) {
        const blush = mixHex(skin, '#ff6a7a', l.fem ? 0.4 : 0.3)
        b.mirror((s) => { b.part('head', lens(0.05, 0.028, 0.012, 4, 2), blush, { p: [s * 0.2, CY - 0.115, 0.215], r: [0, s * 0.8, 0], outline: false }) })
      }
    }
  }
  if (l.ears === 'pointy' || l.ears === 'goblin') {
    const len = l.ears === 'goblin' ? 0.34 : 0.2
    b.mirror((s) => {
      b.painted('head', gradY(spike(0.085, len, 5), skin, tone(skin, 0.86)), { p: [s * (0.3 + len * 0.3), CY + 0.03, 0], r: [0, 0, -s * 1.25] })
    })
  } else if (face && !skeletal && l.head !== 'hood' && l.head !== 'helm' && l.head !== 'leathercap') {
    b.mirror((s) => { b.part('head', ell(0.03, 0.055, 0.04, 4, 3), skinLo, { p: [s * 0.3, CY - 0.04, -0.01] }) })
  }
  if (l.beard) {
    b.painted('head', gradY(ell(0.2, 0.19, 0.13, 8, 5), tone(l.beard, 0.82), l.beard), { p: [0, CY - 0.25, 0.165] })
    b.mirror((s) => { b.part('head', ell(0.07, 0.03, 0.03, 4, 3), l.beard!, { p: [s * 0.065, CY - 0.125, 0.285], r: [0, 0, -s * 0.35] }) })
  }
  headGear(b, l, q)

  // ── Extras ──
  if (l.cape) {
    const c0 = tone(l.cape, 0.72)
    // Two panels, so the hem can trail behind the shoulders.
    b.painted('cape', gradY(lathe([[0, -0.34], [0.24 * k, -0.34], [0.17 * k, 0], [0, 0.025]], 8), tone(l.cape, 0.88), tone(l.cape, 1.05)), { s: [1, 1, 0.34], p: [0, 0, -0.015] })
    b.painted('cape2', gradY(lathe([[0, -0.36], [0.3 * k, -0.36], [0.235 * k, 0.0], [0, 0.03]], 8), c0, tone(l.cape, 0.9)), { s: [1, 1, 0.32], p: [0, 0, -0.02] })
    // The clasp at the throat.
    b.part('torso', sph(0.035, 5, 4), GOLD, { p: [0, 0.365, 0.125] })
    b.part('torso', torus(0.14 * k, 0.035, 4, 6, Math.PI), l.cape, { p: [0, 0.36, -0.01], r: [Math.PI / 2 - 0.25, 0, Math.PI] })
  }
  if (l.tail) b.painted('tail', gradY(spike(0.06, 0.42, 5), l.tail, tone(l.tail, 0.8)), { p: [0, 0.05, -0.2], r: [-1.2, 0, 0] })
  if (l.wings) {
    b.mirror((s, t) => {
      const g: BufferGeometry = rbox(0.5, 0.42, 0.04, 0.45, 8, 5)
      b.painted('wing' + t, gradY(g, tone(l.wings!, 0.75), tone(l.wings!, 1.1)), { p: [s * 0.27, 0.12, 0], r: [0, 0, s * 0.35] })
      b.part('wing' + t, spike(0.03, 0.16, 4), tone(l.wings!, 1.3), { p: [s * 0.46, 0.34, 0], r: [0, 0, -s * 0.6] })
    })
  }

  weaponParts(b, l.held, metal, glowHex, q)
  offParts(b, l.off, metal, l.trim, glowHex)

  const rig = b.build({ height: 1.42 })
  // Eyes open, mouth shut: the rest pose of the face (bind pose has both wide).
  rig.bones.lids?.scale.set(1, LID_OPEN, LID_FLAT)
  rig.bones.mouth?.scale.set(1, skeletal ? 1 : MOUTH_SHUT, 1)
  return rig
}

/** The lid bone's scale with the eye open (1 = shut). */
export const LID_OPEN = 0.17
export const LID_FLAT = 0.5
export const MOUTH_SHUT = 0.32

export const HUMAN_BONES = [
  'root', 'hips', 'torso', 'neck', 'head', 'armL', 'armR', 'foreL', 'foreR', 'handL', 'handR', 'weapon', 'offhand',
  'legL', 'legR', 'shinL', 'shinR', 'footL', 'footR', 'hairF', 'hairB'
] as const

/** Where a weapon's tip is along its bone's +Z — the trail of a swing starts here. */
export const WEAPON_REACH: Record<Held, number> = {
  none: 0.16, sword: 0.58, dagger: 0.33, greatsword: 0.95, axe: 0.58, hammer: 0.64, staff: 0.9, wand: 0.4, gun: 0.42,
  cannon: 0.6, club: 0.54, bow: 0.1, sling: 0.24, scythe: 0.92, flask: 0.2
}

/** Where the trail's inner edge sits, as a share of the reach (the part of the
 *  weapon that cuts: a blade's whole length, an axe's or a hammer's head). */
export const WEAPON_EDGE: Record<Held, number> = {
  none: 0, sword: 0.22, dagger: 0.2, greatsword: 0.2, axe: 0.42, hammer: 0.45, staff: 0.7, wand: 0.6, gun: 0.8,
  cannon: 0.8, club: 0.4, bow: 0, sling: 0.6, scythe: 0.5, flask: 0.3
}

export type { V3 }
