/**
 * Shared palette. Saturated primaries in the spirit of the 8-bit era, lifted
 * for a lit 3D render. Everything that has a "signature colour" pulls it from
 * here so the HUD, particles and models agree.
 */
export const PAL = {
  // Cobalt
  heroBlue: '#2468f0',
  heroDeep: '#153c9e',
  heroCyan: '#4fd8ff',
  heroCyanDeep: '#1f9fd8',
  skin: '#ffd2a8',
  skinShade: '#f0b48c',
  eyeWhite: '#ffffff',
  iris: '#1b6dd6',
  pupil: '#0b1433',
  mouth: '#c0705a',
  // Generic machine tones
  steel: '#9aa7bd',
  steelDark: '#5d6a82',
  gunmetal: '#3b4458',
  black: '#1a1f2e',
  white: '#f4f7ff',
  // Enemy signatures
  hardhat: '#ffc21a',
  hardhatDeep: '#e08a00',
  trooper: '#3fae4a',
  trooperDeep: '#26732f',
  heli: '#e83a3a',
  heliDeep: '#a51f2c',
  hopper: '#9150e0',
  hopperDeep: '#5c2ca0',
  roller: '#ff8a1f',
  rollerDeep: '#c25a00',
  brute: '#8f9bb3',
  bruteDeep: '#56617a',
  turret: '#4bb3a8',
  // Glows
  glowCyan: '#7ff4ff',
  glowRed: '#ff4050',
  glowPink: '#ff5fb0',
  glowYellow: '#fff27a',
  glowGreen: '#8dff7a',
  glowOrange: '#ffb04a',
  glowPurple: '#d38bff'
} as const

/** Rarity colours for gear (shared by loot beams, UI frames, text). */
export const RARITY_COLOR = {
  standard: '#e8edf7',
  tuned: '#4aa8ff',
  prototype: '#b46cff',
  legendary: '#ff9a2e'
} as const
