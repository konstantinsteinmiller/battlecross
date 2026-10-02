import { RigBuilder, cap, dome, ell, lathe, rbox, rcone, rcyl, rock, sph, torus, type Rig } from '../kit'

/**
 * ─── Things that are not people ──────────────────────────────────────────────
 *
 * Wolves and void stalkers, spiders, treants, golems, elementals, naga,
 * wyverns, the dragon, and the Aether-Tech turrets. Same kit, same rules as
 * the humanoid: rounded parts, one skinned mesh, cute before scary.
 *
 * Bone names matter: `anim.ts` poses each family by them. The two-legged ones
 * (treant, golem, elemental, naga) share the humanoid's names and so its
 * choreography; each carries a `weapon` bone whose +Z runs to where its blow
 * lands (down the arm for a fist, up the shaft for a trident), which is what a
 * swing's trail is read from.
 */

/** A fist is its own weapon: the bone points down the arm. */
const FIST: [number, number, number] = [Math.PI / 2, 0, 0]

const DARK = '#1b1626'
const EYE = '#241a2e'

const eyes = (b: RigBuilder, bone: string, x: number, y: number, z: number, r: number, glowHex?: string): void => {
  b.mirror((s) => {
    if (glowHex) {
      b.part(bone, ell(r, r * 1.2, r * 0.5, 8, 6), DARK, { p: [s * x, y, z], outline: false })
      b.part(bone, sph(r * 0.55, 6, 5), glowHex, { p: [s * x, y, z + r * 0.35], glow: true, outline: false })
    } else {
      b.part(bone, ell(r, r * 1.3, r * 0.45, 8, 6), EYE, { p: [s * x, y, z], outline: false })
      b.part(bone, sph(r * 0.38, 6, 5), '#ffffff', { p: [s * x - r * 0.28, y + r * 0.4, z + r * 0.36], glow: true, outline: false })
    }
  })
}

// ─── Four legs: wolf, void stalker ───────────────────────────────────────────

export const buildBeast = (variant: 'wolf' | 'stalker'): Rig => {
  const fur = variant === 'wolf' ? '#9aa4b8' : '#4a2a8a'
  const belly = variant === 'wolf' ? '#e4e8f0' : '#7a4ad0'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.46, 0])
  b.bone('head', 'body', [0, 0.12, 0.36])
  b.bone('tail', 'body', [0, 0.1, -0.4])
  for (const [n, x, z] of [['legFL', -0.16, 0.24], ['legFR', 0.16, 0.24], ['legBL', -0.16, -0.26], ['legBR', 0.16, -0.26]] as const) {
    b.bone(n, 'body', [x, -0.1, z])
    b.part(n, cap(0.07, 0.2, 8, 3), fur, { p: [0, -0.16, 0] })
    b.part(n, ell(0.085, 0.06, 0.11, 8, 5), DARK, { p: [0, -0.32, 0.03] })
  }
  b.part('body', ell(0.27, 0.25, 0.46, 12, 8), fur, {})
  b.part('body', ell(0.2, 0.16, 0.36, 10, 6), belly, { p: [0, -0.1, 0.02] })
  // Head: a big round skull with a short muzzle and tall ears.
  b.part('head', sph(0.27, 12, 9), fur, { p: [0, 0.1, 0.1] })
  b.part('head', ell(0.15, 0.12, 0.17, 10, 6), belly, { p: [0, 0.02, 0.32] })
  b.part('head', sph(0.05, 6, 5), DARK, { p: [0, 0.06, 0.48], outline: false })
  b.mirror((s) => {
    b.part('head', rcone(0.09, 0.015, 0.24, 0.012, 7), fur, { p: [s * 0.15, 0.36, 0.04], r: [0, 0, -s * 0.25] })
  })
  eyes(b, 'head', 0.11, 0.14, 0.33, 0.055, variant === 'stalker' ? '#e0a8ff' : undefined)
  if (variant === 'wolf') {
    b.part('tail', ell(0.09, 0.09, 0.24, 8, 6), fur, { p: [0, 0.06, -0.16], r: [0.5, 0, 0] })
  } else {
    // The stalker: back spines and a whip tail tipped with void light.
    for (let k = 0; k < 4; k++) b.part('body', rcone(0.06, 0.01, 0.2, 0.01, 6), '#b06aff', { p: [0, 0.26, 0.26 - k * 0.17], r: [-0.4, 0, 0] })
    b.part('tail', rcone(0.06, 0.02, 0.5, 0.012, 7), fur, { p: [0, 0.05, -0.26], r: [-1.3, 0, 0] })
    b.part('tail', sph(0.07, 8, 6), '#e0a8ff', { p: [0, 0.12, -0.52], glow: true, outline: false })
  }
  return b.build({ height: 0.95 })
}

// ─── Eight legs (six drawn): spider, brood mother ────────────────────────────

export const buildSpider = (variant: 'spider' | 'brood'): Rig => {
  const body = variant === 'spider' ? '#6a4aa8' : '#8a3fd0'
  const mark = variant === 'spider' ? '#b48cff' : '#ff6ab0'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.36, 0])
  b.bone('head', 'body', [0, 0.02, 0.22])
  b.part('body', ell(0.3, 0.26, 0.34, 12, 8), body, { p: [0, 0.08, -0.22] })
  b.part('body', ell(0.14, 0.1, 0.16, 8, 6), mark, { p: [0, 0.3, -0.26] })
  b.part('head', sph(0.22, 12, 8), body, { p: [0, 0.04, 0.06] })
  eyes(b, 'head', 0.09, 0.1, 0.24, 0.05, mark)
  b.mirror((s) => {
    b.part('head', sph(0.03, 6, 5), mark, { p: [s * 0.16, 0.16, 0.18], glow: true, outline: false })
    b.part('head', rcone(0.035, 0.008, 0.12, 0.008, 6), '#f4f0ff', { p: [s * 0.06, -0.08, 0.24], r: [2.8, 0, 0] })
  })
  for (let k = 0; k < 3; k++) {
    b.mirror((s, t) => {
      const n = `leg${t}${k}`
      b.bone(n, 'body', [s * 0.18, 0.02, 0.12 - k * 0.17])
      // An upper leg out and up, a lower leg down to the ground.
      b.part(n, cap(0.04, 0.3, 6, 2), body, { p: [s * 0.18, 0.1, 0], r: [0, 0, -s * 1.05] })
      b.part(n, cap(0.035, 0.36, 6, 2), DARK, { p: [s * 0.42, -0.1, 0], r: [0, 0, s * 0.22] })
    })
  }
  return b.build({ height: 0.8 })
}

// ─── Treant ──────────────────────────────────────────────────────────────────

export const buildTreant = (variant: 'treant' | 'elder'): Rig => {
  const bark = variant === 'treant' ? '#7a5a3a' : '#5a4a34'
  const leaf = variant === 'treant' ? '#5fae4a' : '#3f8f3a'
  const leaf2 = variant === 'treant' ? '#8fd45a' : '#6fbf4a'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('hips', 'root', [0, 0.34, 0])
  b.bone('torso', 'hips', [0, 0.02, 0])
  b.bone('head', 'torso', [0, 0.5, 0])
  b.mirror((s, t) => {
    b.bone('arm' + t, 'torso', [s * 0.36, 0.42, 0])
    b.bone('hand' + t, 'arm' + t, [0, -0.42, 0])
    if (s > 0) b.bone('weapon', 'handR', [0, 0, 0], FIST)
    else b.bone('offhand', 'handL', [0, 0, 0], FIST)
    b.bone('leg' + t, 'hips', [s * 0.16, 0, 0])
    b.part('leg' + t, rcone(0.16, 0.12, 0.34, 0.04, 9), bark, { p: [0, -0.17, 0] })
    b.part('arm' + t, cap(0.1, 0.3, 8, 3), bark, { p: [0, -0.2, 0] })
    b.part('hand' + t, rock(0.17, s > 0 ? 7 : 11, 8, 6), bark, {})
    b.part('arm' + t, sph(0.13, 8, 6), leaf, { p: [0, 0.02, 0] })
  })
  // A stump of a body, wider at the base, with a knot-hole face.
  b.part('torso', lathe([[0, -0.08], [0.34, -0.08], [0.3, 0.2], [0.27, 0.5], [0.2, 0.62], [0, 0.66]], 12), bark, {})
  eyes(b, 'torso', 0.11, 0.38, 0.27, 0.06, '#ffe07a')
  b.part('torso', ell(0.09, 0.05, 0.04, 8, 5), DARK, { p: [0, 0.22, 0.29], outline: false })
  // The crown: three overlapping leaf balls.
  b.part('head', sph(0.36, 12, 9), leaf, { p: [0, 0.3, 0] })
  b.part('head', sph(0.25, 10, 8), leaf2, { p: [-0.22, 0.42, 0.08] })
  b.part('head', sph(0.24, 10, 8), leaf2, { p: [0.2, 0.46, -0.06] })
  if (variant === 'elder') {
    b.part('head', sph(0.2, 10, 8), '#ffd24a', { p: [0, 0.62, 0.1] })
    b.mirror((s) => { b.part('torso', rcone(0.06, 0.012, 0.3, 0.01, 6), bark, { p: [s * 0.3, 0.56, 0], r: [0, 0, -s * 0.9] }) })
  }
  return b.build({ height: 1.9 })
}

// ─── Golem ───────────────────────────────────────────────────────────────────

export const buildGolem = (variant: 'iron' | 'colossus'): Rig => {
  const stone = variant === 'iron' ? '#9aa7bd' : '#b8c4d9'
  const dark = variant === 'iron' ? '#5d6a82' : '#6a7896'
  const core = variant === 'iron' ? '#ffb04a' : '#7ff4ff'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('hips', 'root', [0, 0.38, 0])
  b.bone('torso', 'hips', [0, 0.02, 0])
  b.bone('head', 'torso', [0, 0.62, 0])
  b.mirror((s, t) => {
    b.bone('arm' + t, 'torso', [s * 0.46, 0.46, 0])
    b.bone('hand' + t, 'arm' + t, [0, -0.44, 0])
    if (s > 0) b.bone('weapon', 'handR', [0, 0, 0], FIST)
    else b.bone('offhand', 'handL', [0, 0, 0], FIST)
    b.bone('leg' + t, 'hips', [s * 0.19, 0, 0])
    b.part('leg' + t, rbox(0.24, 0.36, 0.26, 0.5, 10, 8), dark, { p: [0, -0.19, 0] })
    b.part('arm' + t, rbox(0.22, 0.4, 0.24, 0.5, 10, 8), stone, { p: [0, -0.2, 0] })
    b.part('hand' + t, rbox(0.3, 0.3, 0.3, 0.5, 10, 8), dark, {})
    b.part('torso', dome(0.2, 1.5, 10, 5), dark, { p: [s * 0.44, 0.5, 0], r: [0, 0, -s * 0.5] })
  })
  b.part('torso', rbox(0.76, 0.66, 0.5, 0.42, 14, 10), stone, { p: [0, 0.3, 0] })
  b.part('torso', sph(0.13, 10, 8), core, { p: [0, 0.32, 0.24], glow: true, outline: false })
  b.part('torso', torus(0.16, 0.035, 6, 14), dark, { p: [0, 0.32, 0.25] })
  b.part('head', rbox(0.38, 0.3, 0.34, 0.5, 12, 8), stone, { p: [0, 0.12, 0] })
  eyes(b, 'head', 0.09, 0.13, 0.17, 0.05, core)
  if (variant === 'colossus') {
    b.mirror((s) => { b.part('head', rcone(0.07, 0.015, 0.28, 0.012, 7), dark, { p: [s * 0.2, 0.32, 0], r: [0, 0, -s * 0.5] }) })
  }
  return b.build({ height: 2 })
}

// ─── Elementals and other floating things ────────────────────────────────────

export const buildElemental = (variant: 'fire' | 'emberLord' | 'void'): Rig => {
  const hot = variant === 'void' ? '#b06aff' : '#ffb02a'
  const mid = variant === 'void' ? '#6a2ad0' : '#ff6a1a'
  const coal = variant === 'void' ? '#2a1450' : '#5a2418'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('hips', 'root', [0, 0.5, 0])
  b.bone('torso', 'hips', [0, 0, 0])
  b.bone('head', 'torso', [0, 0.46, 0])
  b.mirror((s, t) => {
    b.bone('arm' + t, 'torso', [s * 0.34, 0.34, 0])
    b.bone('hand' + t, 'arm' + t, [0, -0.26, 0])
    if (s > 0) b.bone('weapon', 'handR', [0, 0, 0], FIST)
    else b.bone('offhand', 'handL', [0, 0, 0], FIST)
    b.part('hand' + t, sph(0.13, 8, 6), mid, { glow: true })
    b.part('hand' + t, sph(0.08, 8, 6), hot, { p: [0, 0.02, 0.06], glow: true, outline: false })
  })
  // A teardrop of flame, wide at the chest and trailing to a wisp.
  b.part('torso', lathe([[0, -0.46], [0.1, -0.3], [0.26, 0], [0.3, 0.24], [0.2, 0.44], [0, 0.5]], 12), mid, { glow: true })
  b.part('torso', lathe([[0, -0.2], [0.16, 0.02], [0.18, 0.24], [0.1, 0.38], [0, 0.42]], 10), hot, { p: [0, 0, 0.06], glow: true, outline: false })
  b.part('head', sph(0.25, 12, 9), coal, { p: [0, 0.14, 0] })
  eyes(b, 'head', 0.09, 0.15, 0.22, 0.055, hot)
  for (let k = 0; k < 3; k++) {
    b.part('head', rcone(0.1, 0.015, 0.3 - k * 0.04, 0.012, 7), k === 1 ? hot : mid, { p: [(k - 1) * 0.14, 0.42, -0.02], r: [0, 0, -(k - 1) * 0.35], glow: true })
  }
  if (variant === 'emberLord') {
    b.mirror((s) => { b.part('head', rcone(0.07, 0.015, 0.3, 0.012, 7), coal, { p: [s * 0.24, 0.3, 0], r: [0, 0, -s * 0.7] }) })
    b.part('torso', torus(0.3, 0.04, 6, 14), coal, { p: [0, 0.16, 0], r: [Math.PI / 2, 0, 0] })
  }
  return b.build({ height: 1.5 })
}

// ─── Naga ────────────────────────────────────────────────────────────────────

export const buildNaga = (variant: 'naga' | 'oracle'): Rig => {
  const scale = variant === 'naga' ? '#3fc7b0' : '#2fe0c0'
  const belly = variant === 'naga' ? '#c8f0e0' : '#e8fff4'
  const fin = variant === 'naga' ? '#2a8f9a' : '#7a5fe0'
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
    b.bone('hand' + t, 'arm' + t, [0, -0.27, 0])
    // The trident stands upright in a hanging hand; the oracle strikes with a bare one.
    if (s > 0) b.bone('weapon', 'handR', [0, 0, 0.06], variant === 'naga' ? [-1.45, 0, 0] : FIST)
    else b.bone('offhand', 'handL', [0, 0, 0], FIST)
    b.part('arm' + t, cap(0.065, 0.13, 8, 3), scale, { p: [0, -0.12, 0] })
    b.part('hand' + t, sph(0.085, 8, 6), scale, {})
  })
  b.part('torso', ell(0.2, 0.235, 0.17, 12, 8), scale, { p: [0, 0.2, 0] })
  b.part('torso', ell(0.14, 0.18, 0.1, 10, 6), belly, { p: [0, 0.18, 0.1] })
  // The serpent's coil: three fat segments curling behind.
  b.part('hips', ell(0.23, 0.2, 0.24, 10, 7), scale, { p: [0, -0.1, -0.02] })
  b.part('tail1', ell(0.2, 0.17, 0.26, 10, 7), scale, { p: [0, -0.14, -0.14] })
  b.part('tail2', ell(0.15, 0.13, 0.24, 10, 7), scale, { p: [0, -0.03, -0.16] })
  b.part('tail3', rcone(0.11, 0.02, 0.36, 0.015, 8), scale, { p: [0, 0, -0.14], r: [-Math.PI / 2, 0, 0] })
  b.part('tail3', rbox(0.3, 0.03, 0.18, 0.5, 8, 6), fin, { p: [0, 0, -0.36] })
  b.part('head', sph(0.29, 14, 10), scale, { p: [0, 0.26, 0] })
  eyes(b, 'head', 0.115, 0.25, 0.255, 0.07, variant === 'oracle' ? '#e8d0ff' : undefined)
  b.part('head', rbox(0.04, 0.3, 0.36, 0.5, 8, 6), fin, { p: [0, 0.46, -0.06] })
  b.mirror((s) => { b.part('head', rbox(0.2, 0.2, 0.03, 0.5, 8, 6), fin, { p: [s * 0.32, 0.24, -0.02], r: [0, -s * 0.5, 0] }) })
  // A trident for the warriors; an orb of tide for the oracle.
  if (variant === 'naga') {
    b.part('weapon', rcyl(0.024, 1, 0.012, 8, 2), '#c9a24a', { p: [0, 0, 0.3], r: [Math.PI / 2, 0, 0] })
    for (let k = -1; k <= 1; k++) b.part('weapon', rcone(0.03, 0.006, 0.2, 0.006, 6), '#e8f4ff', { p: [k * 0.08, 0, 0.88], r: [Math.PI / 2, 0, 0] })
  } else {
    b.part('handL', sph(0.13, 10, 8), '#7fe8ff', { p: [0, 0.08, 0.16], glow: true })
    b.part('head', torus(0.2, 0.03, 6, 14), '#ffd24a', { p: [0, 0.5, 0], r: [Math.PI / 2, 0, 0] })
  }
  return b.build({ height: 1.6 })
}

// ─── Wyvern and dragon ───────────────────────────────────────────────────────

export const buildWyvern = (): Rig => {
  const hide = '#e0703a'
  const belly = '#ffd9a8'
  const wing = '#b8482a'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.9, 0])
  b.bone('neck', 'body', [0, 0.14, 0.3])
  b.bone('head', 'neck', [0, 0.2, 0.22])
  b.bone('tail', 'body', [0, 0, -0.36])
  b.mirror((s, t) => {
    b.bone('wing' + t, 'body', [s * 0.2, 0.18, 0])
    b.bone('leg' + t, 'body', [s * 0.14, -0.2, -0.04])
    b.part('wing' + t, rbox(0.86, 0.05, 0.52, 0.4, 12, 8), wing, { p: [s * 0.48, 0.04, -0.04] })
    b.part('wing' + t, cap(0.04, 0.8, 6, 2), hide, { p: [s * 0.46, 0.06, 0.2], r: [0, 0, Math.PI / 2] })
    b.part('leg' + t, cap(0.07, 0.16, 8, 3), hide, { p: [0, -0.12, 0] })
    b.part('leg' + t, ell(0.09, 0.05, 0.13, 8, 5), DARK, { p: [0, -0.26, 0.04] })
  })
  b.part('body', ell(0.3, 0.28, 0.44, 12, 8), hide, {})
  b.part('body', ell(0.2, 0.18, 0.34, 10, 6), belly, { p: [0, -0.1, 0.04] })
  b.part('neck', cap(0.12, 0.2, 8, 3), hide, { p: [0, 0.08, 0.08], r: [0.8, 0, 0] })
  b.part('head', sph(0.24, 12, 9), hide, { p: [0, 0.06, 0.06] })
  b.part('head', ell(0.14, 0.1, 0.18, 10, 6), belly, { p: [0, -0.02, 0.26] })
  b.mirror((s) => { b.part('head', rcone(0.06, 0.012, 0.24, 0.01, 7), '#f4e8d0', { p: [s * 0.13, 0.26, -0.06], r: [-0.5, 0, -s * 0.2] }) })
  eyes(b, 'head', 0.1, 0.1, 0.25, 0.055)
  b.part('tail', rcone(0.14, 0.02, 0.7, 0.015, 8), hide, { p: [0, 0, -0.34], r: [-Math.PI / 2, 0, 0] })
  b.part('tail', rbox(0.04, 0.2, 0.2, 0.5, 8, 6), wing, { p: [0, 0.04, -0.7] })
  return b.build({ height: 1.9 })
}

export const buildDragon = (variant: 'void' | 'ally'): Rig => {
  const hide = variant === 'void' ? '#6a3ad0' : '#8a5ae8'
  const belly = variant === 'void' ? '#d8b8ff' : '#f0dcff'
  const wing = variant === 'void' ? '#3a1c8a' : '#5a3ab0'
  const horn = '#f4e8ff'
  const glowHex = '#e0a8ff'
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
  b.bone('body', 'root', [0, 0.78, 0])
  b.bone('neck', 'body', [0, 0.24, 0.5])
  b.bone('head', 'neck', [0, 0.36, 0.3])
  b.bone('tail1', 'body', [0, 0, -0.56])
  b.bone('tail2', 'tail1', [0, 0, -0.56])
  b.mirror((s, t) => {
    b.bone('wing' + t, 'body', [s * 0.3, 0.34, -0.06])
    b.part('wing' + t, rbox(1.3, 0.06, 0.86, 0.4, 14, 8), wing, { p: [s * 0.74, 0.1, -0.1] })
    b.part('wing' + t, cap(0.055, 1.3, 6, 2), hide, { p: [s * 0.74, 0.12, 0.3], r: [0, 0, Math.PI / 2] })
    b.part('wing' + t, rcone(0.06, 0.012, 0.22, 0.01, 6), horn, { p: [s * 1.42, 0.14, 0.34], r: [Math.PI / 2, 0, 0] })
  })
  for (const [n, x, z] of [['legFL', -0.3, 0.34], ['legFR', 0.3, 0.34], ['legBL', -0.32, -0.36], ['legBR', 0.32, -0.36]] as const) {
    b.bone(n, 'body', [x, -0.2, z])
    b.part(n, cap(0.13, 0.26, 8, 3), hide, { p: [0, -0.22, 0] })
    b.part(n, ell(0.17, 0.09, 0.22, 8, 5), DARK, { p: [0, -0.5, 0.06] })
  }
  b.part('body', ell(0.5, 0.46, 0.74, 14, 10), hide, {})
  b.part('body', ell(0.36, 0.3, 0.58, 12, 8), belly, { p: [0, -0.16, 0.06] })
  for (let k = 0; k < 5; k++) b.part('body', rcone(0.08, 0.012, 0.24, 0.01, 6), wing, { p: [0, 0.46, 0.46 - k * 0.24], r: [-0.3, 0, 0] })
  b.part('neck', cap(0.2, 0.36, 9, 3), hide, { p: [0, 0.16, 0.12], r: [0.7, 0, 0] })
  b.part('neck', cap(0.14, 0.3, 8, 3), belly, { p: [0, 0.1, 0.22], r: [0.7, 0, 0] })
  // A big friendly-fierce head: round skull, long snout, two swept horns.
  b.part('head', sph(0.36, 14, 10), hide, { p: [0, 0.08, 0.04] })
  b.part('head', ell(0.24, 0.17, 0.3, 12, 7), hide, { p: [0, -0.02, 0.4] })
  b.part('head', ell(0.2, 0.08, 0.26, 10, 6), belly, { p: [0, -0.12, 0.4] })
  b.mirror((s) => {
    b.part('head', rcone(0.09, 0.015, 0.46, 0.012, 8), horn, { p: [s * 0.2, 0.4, -0.16], r: [-0.9, 0, -s * 0.25] })
    b.part('head', sph(0.035, 6, 5), DARK, { p: [s * 0.08, 0.02, 0.68], outline: false })
    b.part('head', rcone(0.035, 0.008, 0.11, 0.008, 6), horn, { p: [s * 0.12, -0.16, 0.56], r: [Math.PI, 0, 0] })
  })
  eyes(b, 'head', 0.16, 0.16, 0.34, 0.075, glowHex)
  b.part('tail1', rcone(0.3, 0.16, 0.62, 0.02, 9), hide, { p: [0, 0, -0.28], r: [-Math.PI / 2, 0, 0] })
  b.part('tail2', rcone(0.17, 0.02, 0.7, 0.015, 8), hide, { p: [0, 0, -0.32], r: [-Math.PI / 2, 0, 0] })
  b.part('tail2', rbox(0.06, 0.3, 0.3, 0.5, 8, 6), wing, { p: [0, 0.06, -0.66] })
  b.part('body', sph(0.16, 10, 8), glowHex, { p: [0, -0.02, 0.62], glow: true, outline: false })
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
    b.part('root', cap(0.05, 0.36, 6, 2), metal, { p: [Math.sin(a) * 0.22, 0.2, Math.cos(a) * 0.22], r: [Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6] })
  }
  b.part('body', rcyl(0.2, 0.2, 0.06, 12, 2), shell, {})
  b.part('head', rbox(0.42, 0.34, 0.44, 0.5, 12, 8), shell, { p: [0, 0.12, 0] })
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
