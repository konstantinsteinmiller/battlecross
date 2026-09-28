import { RigBuilder, sph, ell, torus, rcone, rbox, type Rig, pose, nudge, scaleBone } from './kit'

/**
 * ─── Atlas ───────────────────────────────────────────────────────────────────
 *
 * Gauss's field guide, the AI on Flux's chest disc, given a body to point
 * with: a pocket-sized hover-bot. A pearl shell with a dark visor and two
 * round cyan eyes (and a little blush), cyan crystal tips above and below,
 * stubby fins, and a spinning ring with a gap in it — the same glyph Atlas
 * wears in Flux's HUD. About 0.4 m across; cute on purpose, next to Flux's
 * armour and Pip's big single eye.
 *
 * `animateAtlas` bobs it, spins the ring, blinks the eyes, and while it
 * talks, bounces and squints happily.
 */

const SHELL = '#eef4ff'
const TRIM = '#b9c7dc'
const CYAN = '#6ff2ff'

export const buildAtlas = (): Rig => {
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
    .bone('body', 'root', [0, 0, 0])
    .bone('eyes', 'body', [0, 0.005, 0.128])
    .bone('ring', 'body', [0, 0, 0])
  b.part('body', ell(0.14, 0.13, 0.135, 18, 14), SHELL)
  b.part('body', torus(0.139, 0.012, 6, 24), TRIM, { p: [0, -0.01, 0], r: [Math.PI / 2, 0, 0] })
  // The visor, and the blush under it.
  b.part('body', ell(0.1, 0.06, 0.05, 16, 10), '#1d2a4a', { p: [0, 0.005, 0.1] })
  b.mirror((s) => {
    b.part('body', ell(0.022, 0.012, 0.01), '#ff9ac8', { p: [s * 0.075, -0.045, 0.118], glow: true, outline: false })
    // Stubby fins.
    b.part('body', rbox(0.07, 0.03, 0.1, 0.4), TRIM, { p: [s * 0.15, 0, -0.01], r: [0, 0, s * 0.35] })
  })
  // Crystal tips above and below.
  b.part('body', rcone(0.035, 0.004, 0.08, 0.004, 6), CYAN, { p: [0, 0.16, 0], glow: true, outline: false })
  b.part('body', rcone(0.03, 0.004, 0.06, 0.004, 6), CYAN, { p: [0, -0.15, 0], r: [Math.PI, 0, 0], glow: true, outline: false })
  // Eyes: two round lights (their bone squints / blinks them).
  b.mirror((s) => {
    b.part('eyes', ell(0.028, 0.034, 0.012), CYAN, { p: [s * 0.04, 0, 0.004], glow: true, outline: false })
    b.part('eyes', sph(0.009, 6, 4), '#ffffff', { p: [s * 0.04 - 0.008, 0.012, 0.012], glow: true, outline: false })
  })
  // The glyph ring: a ring with a gap, tilted, spinning.
  b.part('ring', torus(0.2, 0.011, 6, 30, Math.PI * 1.6), CYAN, { r: [Math.PI / 2 - 0.35, 0, 0], glow: true, outline: false })
  return b.build({ outline: 0.008, height: 0.4 })
}

/**
 * Pose Atlas at `t` (s). `talk` 0..1: speaking (a bounce, happy squint);
 * `alive` 0..1: switched on (0 = eyes and glow down, as before the intro's
 * "Core online").
 */
export const animateAtlas = (rig: Rig, t: number, talk = 0, alive = 1): void => {
  nudge(rig, 'body', 0, Math.sin(t * 2.6) * 0.02 + talk * Math.abs(Math.sin(t * 11)) * 0.015, 0)
  pose(rig, 'body', Math.sin(t * 1.3) * 0.08 + talk * 0.1, Math.sin(t * 0.8) * 0.25, Math.sin(t * 1.7) * 0.06)
  pose(rig, 'ring', 0, t * (2.2 + talk * 3), 0)
  // Blink every few seconds; squint (a happy ^^) while talking.
  const blink = (t % 3.7) < 0.12 ? 0.1 : 1
  const squint = 1 - 0.3 * talk
  scaleBone(rig, 'eyes', 1, Math.max(0.08, Math.min(blink, squint)) * alive + 0.05 * (1 - alive), 1)
  const k = 0.25 + 0.75 * alive
  rig.glowMaterial.color.setRGB(k, k, k)
}
