import { RigBuilder, sph, ell, cap, torus, rcyl, rcone, type Rig, pose, nudge } from './kit'
import { PAL } from './palette'

/**
 * Friendly androids: the stranded worker-bot the rescue jobs send you after,
 * and Pip, Flux's hovering support unit (hub + tutorial tips).
 */

export const buildWorkerBot = (): Rig => {
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
    .bone('body', 'root', [0, 0.62, 0])
    .bone('head', 'body', [0, 0.34, 0])
    .bone('armL', 'body', [-0.3, 0.12, 0])
    .bone('armR', 'body', [0.3, 0.12, 0])
  b.part('body', ell(0.3, 0.3, 0.26, 16, 12), '#f2f5fb')
  b.part('body', ell(0.31, 0.08, 0.27), '#2fb89a', { p: [0, -0.02, 0] })
  b.part('body', ell(0.12, 0.12, 0.05), '#2fb89a', { p: [0, 0.08, 0.24] })
  b.part('body', rcyl(0.14, 0.36, 0.06, 14), '#5d6a82', { p: [0, -0.42, 0] })
  b.part('body', ell(0.28, 0.1, 0.24), '#3b4458', { p: [0, -0.6, 0] })
  b.part('head', sph(0.22, 16, 12), '#f2f5fb', { p: [0, 0.1, 0] })
  b.part('head', ell(0.17, 0.08, 0.06), '#1d2438', { p: [0, 0.1, 0.17] })
  b.part('head', ell(0.05, 0.035, 0.02), '#7fffc8', { p: [-0.06, 0.1, 0.225], glow: true, outline: false })
  b.part('head', ell(0.05, 0.035, 0.02), '#7fffc8', { p: [0.06, 0.1, 0.225], glow: true, outline: false })
  b.part('head', cap(0.015, 0.16), '#5d6a82', { p: [0.08, 0.36, 0], r: [0, 0, -0.3] })
  b.part('head', sph(0.045, 10, 8), '#ffd84a', { p: [0.13, 0.46, 0], glow: true, outline: false })
  b.mirror((s, t) => {
    b.part(`arm${t}`, cap(0.06, 0.16), '#2fb89a', { p: [0, -0.12, 0] })
    b.part(`arm${t}`, sph(0.075, 10, 8), '#f2f5fb', { p: [0, -0.26, 0] })
  })
  return b.build({ outline: 0.014, height: 1.3 })
}

export const animateWorkerBot = (rig: Rig, t: number, waving: boolean): void => {
  nudge(rig, 'body', 0, Math.sin(t * 2) * 0.02, 0)
  pose(rig, 'head', 0, Math.sin(t * 0.8) * 0.4, Math.sin(t * 1.3) * 0.08)
  if (waving) {
    pose(rig, 'armR', 0, 0, 2.5 + Math.sin(t * 9) * 0.35)
    pose(rig, 'armL', 0, 0, -0.3)
  } else {
    pose(rig, 'armR', 0, 0, 0.25)
    pose(rig, 'armL', 0, 0, -0.25)
  }
}

/** Pip — a round hover-bot with a single big eye and a halo ring. */
export const buildPip = (): Rig => {
  const b = new RigBuilder()
  b.bone('root', null, [0, 0, 0])
    .bone('body', 'root', [0, 0, 0])
    .bone('ring', 'body', [0, -0.18, 0])
  b.part('body', sph(0.24, 18, 14), '#f4f7ff')
  b.part('body', ell(0.25, 0.08, 0.25), PAL.labCyan, { p: [0, 0.02, 0] })
  b.part('body', ell(0.14, 0.14, 0.06), '#1d2438', { p: [0, 0.04, 0.2] })
  b.part('body', ell(0.08, 0.09, 0.03), PAL.glowCyan, { p: [0, 0.05, 0.25], glow: true, outline: false })
  b.part('body', rcone(0.05, 0.015, 0.14, 0.01, 10), PAL.labBlue, { p: [0, 0.3, 0] })
  b.part('body', sph(0.035, 8, 6), '#ff7ab0', { p: [0, 0.39, 0], glow: true, outline: false })
  b.part('ring', torus(0.2, 0.03, 6, 20), PAL.labBlue, { r: [Math.PI / 2, 0, 0] })
  return b.build({ outline: 0.012, height: 0.6 })
}

export const animatePip = (rig: Rig, t: number): void => {
  nudge(rig, 'body', 0, Math.sin(t * 2.4) * 0.05, 0)
  pose(rig, 'body', Math.sin(t * 1.2) * 0.08, Math.sin(t * 0.7) * 0.3, 0)
  pose(rig, 'ring', 0, t * 3, 0)
}
