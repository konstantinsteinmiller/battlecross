import { RigBuilder, sph, ell, cap, torus, rcyl, rcone, dome, paintBy, xform, type Rig, pose, nudge, scaleBone } from './kit'
import { PAL } from './palette'
import type { BufferGeometry } from 'three'

/**
 * ─── Core Masters ────────────────────────────────────────────────────────────
 *
 * The bosses. Four are "masters" — humanoids on Flux's own chibi skeleton,
 * scaled up, each with a signature helmet crest and weapon arms (the sector's
 * element made visible). The Scrapper (tutorial) is a hulking junk crane and
 * Dr. Vex's machine is a hovering skull-faced capsule — the finale's classic
 * silhouette.
 */

export type BossId = 'scrapper' | 'blazeMaster' | 'frostMaster' | 'voltMaster' | 'galeMaster' | 'vexMk1'

interface MasterSpec {
  main: string
  deep: string
  accent: string
  glow: string
  skin: string
  crest: (b: RigBuilder) => void
  arms: (b: RigBuilder) => void
}

/** Shared humanoid skeleton for the four masters (Flux's proportions ×1.35). */
const masterRig = (s: MasterSpec): Rig => {
  const b = new RigBuilder()
  b.bone('hips', null, [0, 0.62, 0])
    .bone('spine', 'hips', [0, 0.1, 0])
    .bone('chest', 'spine', [0, 0.16, 0])
    .bone('head', 'chest', [0, 0.22, 0])
    .bone('shoulderL', 'chest', [-0.28, 0.08, 0])
    .bone('elbowL', 'shoulderL', [0, -0.2, 0])
    .bone('shoulderR', 'chest', [0.28, 0.08, 0])
    .bone('elbowR', 'shoulderR', [0, -0.2, 0])
    .bone('hipL', 'hips', [-0.11, -0.05, 0])
    .bone('kneeL', 'hipL', [0, -0.22, 0])
    .bone('hipR', 'hips', [0.11, -0.05, 0])
    .bone('kneeR', 'hipR', [0, -0.22, 0])
  b.part('hips', ell(0.19, 0.11, 0.15), s.deep)
  b.part('spine', ell(0.17, 0.12, 0.14), s.main, { p: [0, 0.03, 0] })
  b.part('chest', ell(0.25, 0.19, 0.18, 18, 12), s.main, { p: [0, 0.04, 0] })
  b.part('chest', ell(0.12, 0.09, 0.05), s.accent, { p: [0, 0.03, 0.17] })
  b.part('chest', sph(0.05, 10, 8), s.glow, { p: [0, 0.03, 0.2], glow: true, outline: false })
  b.part('chest', torus(0.09, 0.03, 8, 18), s.deep, { p: [0, 0.2, 0], r: [Math.PI / 2, 0, 0] })
  // Head: face + helmet (the crest goes on top)
  const hy = 0.16
  b.part('head', ell(0.18, 0.17, 0.165, 18, 14), s.skin, { p: [0, hy - 0.01, 0.02] })
  b.part('head', dome(0.215, Math.PI * 0.42, 22, 10), s.main, { p: [0, hy, -0.005] })
  b.part('head', torus(0.205, 0.025, 6, 24), s.deep, { p: [0, hy + 0.045, 0], r: [Math.PI / 2 - 0.08, 0, 0] })
  b.part('head', ell(0.16, 0.06, 0.12), s.deep, { p: [0, hy - 0.13, -0.05] })
  b.mirror((sd) => {
    b.part('head', rcyl(0.07, 0.05, 0.02, 14), s.accent, { p: [sd * 0.205, hy - 0.02, -0.01], r: [0, 0, Math.PI / 2] })
    // Stern eyes (masters frown — narrower whites, glowing irises)
    b.part('head', ell(0.05, 0.045, 0.03), PAL.eyeWhite, { p: [sd * 0.065, hy - 0.025, 0.17], r: [0, sd * 0.22, sd * 0.25] })
    b.part('head', ell(0.026, 0.03, 0.02), s.glow, { p: [sd * 0.06, hy - 0.03, 0.19], r: [0, sd * 0.22, 0], glow: true, outline: false })
    b.part('head', ell(0.06, 0.012, 0.02), s.deep, { p: [sd * 0.065, hy + 0.03, 0.175], r: [0, sd * 0.2, -sd * 0.35], outline: false })
  })
  s.crest(b)
  b.mirror((sd, t) => {
    b.part(`shoulder${t}`, sph(0.1, 14, 10), s.deep)
    b.part(`shoulder${t}`, cap(0.065, 0.08), s.main, { p: [0, -0.09, 0] })
    b.part(`hip${t}`, cap(0.075, 0.1), s.main, { p: [0, -0.1, 0] })
    b.part(`knee${t}`, rcone(0.12, 0.1, 0.14, 0.035, 16), s.deep, { p: [0, -0.1, 0] })
    b.part(`knee${t}`, ell(0.125, 0.1, 0.18, 16, 10), s.deep, { p: [0, -0.235, 0.045] })
    b.part(`knee${t}`, torus(0.1, 0.024, 6, 16), s.accent, { p: [0, -0.03, 0], r: [Math.PI / 2, 0, 0] })
  })
  s.arms(b)
  return b.build({ outline: 0.016, height: 1.6 })
}

const cones = (b: RigBuilder, bone: string, pts: Array<[number, number, number, number, number, number]>, color: string, glow = false) => {
  // [x, y, z, height, radius, tiltZ]
  for (const [x, y, z, h, r, tz] of pts) b.part(bone, rcone(r, 0.01, h, 0.01, 10), color, { p: [x, y, z], r: [0, 0, tz], glow, outline: !glow })
}

export const buildBlazeMaster = (): Rig => masterRig({
  main: '#e0442a', deep: '#8a1f16', accent: '#ffb23a', glow: '#fff27a', skin: '#ffd2a8',
  crest: (b) => {
    // Flame crest: three stacked glowing cones on the helmet
    cones(b, 'head', [[0, 0.44, -0.02, 0.26, 0.09, 0], [-0.09, 0.38, 0.0, 0.18, 0.06, 0.4], [0.09, 0.38, 0.0, 0.18, 0.06, -0.4]], '#ffb23a', true)
    cones(b, 'head', [[0, 0.4, -0.02, 0.16, 0.11, 0]], '#e0442a')
  },
  arms: (b) => {
    b.mirror((sd, t) => {
      // Flame nozzles: flared forearm cannons with glowing throats
      b.part(`elbow${t}`, rcone(0.08, 0.12, 0.26, 0.03, 16), '#3b4458', { p: [0, -0.14, 0], r: [Math.PI, 0, 0] })
      b.part(`elbow${t}`, torus(0.11, 0.025, 6, 16), '#ffb23a', { p: [0, -0.27, 0], r: [Math.PI / 2, 0, 0] })
      b.part(`elbow${t}`, sph(0.075, 10, 8), '#fff27a', { p: [0, -0.26, 0], glow: true, outline: false })
      void sd
    })
  }
})

export const buildFrostMaster = (): Rig => masterRig({
  main: '#7fd6ff', deep: '#2f78ad', accent: '#ffffff', glow: '#bff6ff', skin: '#e8f4ff',
  crest: (b) => {
    // Ice crystal crown
    const pts: Array<[number, number, number, number, number, number]> = []
    for (let k = -2; k <= 2; k++) pts.push([k * 0.075, 0.38 - Math.abs(k) * 0.02, -0.02, 0.22 - Math.abs(k) * 0.05, 0.045, -k * 0.25])
    cones(b, 'head', pts, '#e8fbff')
    b.mirror((sd) => cones(b, 'chest', [[sd * 0.3, 0.3, 0, 0.22, 0.06, -sd * 0.6]], '#bff6ff', true))
  },
  arms: (b) => {
    b.mirror((sd, t) => {
      b.part(`elbow${t}`, cap(0.085, 0.1), '#2f78ad', { p: [0, -0.09, 0] })
      // Crystal blades on the forearms
      cones(b, `elbow${t}`, [[sd * 0.04, -0.24, 0.05, 0.3, 0.05, Math.PI + sd * 0.2]], '#e8fbff')
      b.part(`elbow${t}`, sph(0.08, 12, 8), '#e8fbff', { p: [0, -0.22, 0] })
    })
  }
})

export const buildVoltMaster = (): Rig => masterRig({
  main: '#ffd23a', deep: '#5c2ca0', accent: '#b98cff', glow: '#d3fbff', skin: '#ffd2a8',
  crest: (b) => {
    // Zig-zag antenna: three tilted cones stacked into a bolt
    cones(b, 'head', [[0.02, 0.4, 0, 0.14, 0.05, 0.6], [-0.02, 0.5, 0, 0.14, 0.05, -0.6], [0.02, 0.6, 0, 0.14, 0.05, 0.5]], '#fff27a', true)
    b.mirror((sd) => b.part('chest', torus(0.1, 0.035, 8, 18), '#b98cff', { p: [sd * 0.3, 0.12, 0], r: [0, 0, Math.PI / 2] }))
  },
  arms: (b) => {
    b.mirror((sd, t) => {
      // Coil gauntlets: stacked rings with a glowing ball
      for (let k = 0; k < 3; k++) b.part(`elbow${t}`, torus(0.075, 0.025, 6, 16), k % 2 ? '#b98cff' : '#5c2ca0', { p: [0, -0.05 - k * 0.07, 0], r: [Math.PI / 2, 0, 0] })
      b.part(`elbow${t}`, sph(0.085, 12, 8), '#d3fbff', { p: [0, -0.27, 0], glow: true, outline: false })
      void sd
    })
  }
})

export const buildGaleMaster = (): Rig => masterRig({
  main: '#3fc0b0', deep: '#1f6a62', accent: '#ffffff', glow: '#bffff2', skin: '#ffd2a8',
  crest: (b) => {
    // Fan fins either side of the helmet + a small propeller hub on top
    b.mirror((sd) => {
      b.part('head', ell(0.05, 0.16, 0.12), '#ffffff', { p: [sd * 0.22, 0.22, -0.02], r: [0, 0, -sd * 0.5] })
    })
    b.part('head', sph(0.05, 10, 8), '#ffffff', { p: [0, 0.39, 0] })
    // Wing cape on the back
    b.mirror((sd) => b.part('chest', ell(0.22, 0.28, 0.03), '#bffff2', { p: [sd * 0.18, 0.02, -0.2], r: [0.2, sd * 0.4, sd * 0.3] }))
  },
  arms: (b) => {
    b.mirror((_sd, t) => {
      b.part(`elbow${t}`, cap(0.085, 0.1), '#1f6a62', { p: [0, -0.09, 0] })
      b.part(`elbow${t}`, rcyl(0.1, 0.06, 0.02, 16), '#ffffff', { p: [0, -0.22, 0] })
      b.part(`elbow${t}`, torus(0.11, 0.02, 6, 16), '#3fc0b0', { p: [0, -0.22, 0], r: [Math.PI / 2, 0, 0] })
    })
  }
})

/** The Scrapper: a hulking junk crane — magnet claw, hammer fist, visor head. */
export const buildScrapper = (): Rig => {
  const b = new RigBuilder()
  b.bone('hips', null, [0, 1.0, 0])
    .bone('chest', 'hips', [0, 0.4, 0])
    .bone('head', 'chest', [0, 0.55, 0.12])
    .bone('shoulderL', 'chest', [-0.72, 0.28, 0])
    .bone('elbowL', 'shoulderL', [0, -0.5, 0])
    .bone('shoulderR', 'chest', [0.72, 0.28, 0])
    .bone('elbowR', 'shoulderR', [0, -0.5, 0])
    .bone('hipL', 'hips', [-0.28, -0.1, 0])
    .bone('kneeL', 'hipL', [0, -0.42, 0])
    .bone('hipR', 'hips', [0.28, -0.1, 0])
    .bone('kneeR', 'hipR', [0, -0.42, 0])
  const rust = '#c9763a'
  const yellow = '#ffc21a'
  const steel = '#6f7a90'
  b.part('hips', ell(0.42, 0.22, 0.34), steel)
  const body = paintBy(ell(0.62, 0.52, 0.48, 22, 16), (x, y) => (Math.abs(y - 0.1) < 0.07 ? '#3b4458' : x > 0.25 ? rust : yellow))
  b.painted('chest', body, { p: [0, 0.12, 0] })
  b.part('chest', torus(0.5, 0.06, 8, 26), '#3b4458', { p: [0, 0.12, 0], r: [Math.PI / 2, 0, 0] })
  for (const [x, y] of [[-0.3, 0.4], [0.3, 0.35], [0.05, -0.25], [-0.4, -0.1]] as const) {
    b.part('chest', sph(0.06, 8, 6), '#3b4458', { p: [x, y, 0.42] })
  }
  b.part('chest', ell(0.18, 0.12, 0.06), '#ff7a2a', { p: [0, 0.12, 0.47], glow: true, outline: false })
  b.part('head', ell(0.24, 0.2, 0.22, 16, 12), yellow)
  b.part('head', ell(0.2, 0.07, 0.08), '#1d2438', { p: [0, 0.02, 0.18] })
  b.part('head', ell(0.14, 0.035, 0.03), '#ff4050', { p: [0, 0.02, 0.25], glow: true, outline: false })
  b.part('head', rcyl(0.04, 0.2, 0.02, 8), steel, { p: [0.12, 0.28, -0.05] })
  b.part('head', sph(0.05, 8, 6), '#ff4050', { p: [0.12, 0.4, -0.05], glow: true, outline: false })
  b.mirror((sd, t) => {
    b.part(`shoulder${t}`, sph(0.3, 16, 12), steel)
    b.part(`shoulder${t}`, cap(0.14, 0.24), rust, { p: [0, -0.26, 0] })
    b.part(`hip${t}`, cap(0.16, 0.22), steel, { p: [0, -0.2, 0] })
    b.part(`knee${t}`, cap(0.15, 0.18), rust, { p: [0, -0.16, 0] })
    b.part(`knee${t}`, ell(0.25, 0.16, 0.34), steel, { p: [0, -0.46, 0.06] })
    void sd
  })
  // Left: magnet claw (a horseshoe torus)
  b.part('elbowL', cap(0.14, 0.18), steel, { p: [0, -0.14, 0] })
  b.part('elbowL', torus(0.22, 0.09, 8, 18, Math.PI), '#d0303f', { p: [0, -0.45, 0], r: [0, 0, Math.PI] })
  b.mirror((sd) => b.part('elbowL', rcyl(0.095, 0.1, 0.03, 12), '#e8edf7', { p: [sd * 0.22, -0.46, 0] }))
  // Right: hammer fist
  b.part('elbowR', cap(0.15, 0.16), rust, { p: [0, -0.14, 0] })
  b.part('elbowR', rcyl(0.26, 0.42, 0.1, 18), '#3b4458', { p: [0, -0.46, 0], r: [0, 0, Math.PI / 2] })
  b.part('elbowR', torus(0.26, 0.04, 6, 18), yellow, { p: [0.16, -0.46, 0], r: [0, Math.PI / 2, 0] })
  b.part('elbowR', torus(0.26, 0.04, 6, 18), yellow, { p: [-0.16, -0.46, 0], r: [0, Math.PI / 2, 0] })
  return b.build({ outline: 0.026, height: 2.6 })
}

/** Dr. Vex's machine: a hovering capsule with a skull faceplate and claws. */
export const buildVex = (): Rig => {
  const b = new RigBuilder()
  b.bone('body', null, [0, 0, 0])
    .bone('dome', 'body', [0, 0.7, 0])
    .bone('clawL', 'body', [-0.9, -0.1, 0.2])
    .bone('clawR', 'body', [0.9, -0.1, 0.2])
  b.part('body', ell(1.0, 0.7, 0.85, 24, 16), '#5a5f70')
  b.part('body', torus(0.98, 0.09, 8, 32), '#ff3f5f', { r: [Math.PI / 2, 0, 0] })
  // Skull faceplate
  const skull: BufferGeometry = paintBy(ell(0.5, 0.45, 0.2, 20, 14), (_x, y) => (y < -0.05 ? '#dfe5ee' : '#f4f7ff'))
  b.painted('body', skull, { p: [0, 0.05, 0.72] })
  b.mirror((sd) => {
    b.part('body', ell(0.13, 0.1, 0.05), '#1a1c22', { p: [sd * 0.17, 0.1, 0.9] })
    b.part('body', sph(0.05, 8, 6), '#ff3f5f', { p: [sd * 0.17, 0.1, 0.93], glow: true, outline: false })
  })
  for (let k = -2; k <= 2; k++) b.part('body', ell(0.04, 0.07, 0.03), '#1a1c22', { p: [k * 0.08, -0.22, 0.88] })
  b.part('dome', dome(0.45, Math.PI / 2, 20, 10), '#9fe6ff', { glow: true })
  b.part('dome', torus(0.45, 0.05, 6, 24), '#3a3d49', { r: [Math.PI / 2, 0, 0] })
  b.mirror((_sd, t) => {
    b.part(`claw${t}`, sph(0.25, 14, 10), '#3a3d49')
    b.part(`claw${t}`, rcone(0.12, 0.02, 0.5, 0.02, 10), '#dfe5ee', { p: [0.08, -0.35, 0.1], r: [0.3, 0, 0.3] })
    b.part(`claw${t}`, rcone(0.12, 0.02, 0.5, 0.02, 10), '#dfe5ee', { p: [-0.08, -0.35, 0.1], r: [0.3, 0, -0.3] })
  })
  return b.build({ outline: 0.03, height: 2.2 })
}

export const buildBossRig = (id: BossId): Rig => {
  switch (id) {
    case 'scrapper': return buildScrapper()
    case 'blazeMaster': return buildBlazeMaster()
    case 'frostMaster': return buildFrostMaster()
    case 'voltMaster': return buildVoltMaster()
    case 'galeMaster': return buildGaleMaster()
    case 'vexMk1': return buildVex()
  }
}

/** Generic boss animation driven by the AI's current action. */
export const poseBoss = (rig: Rig, id: BossId, t: number, act: 'idle' | 'walk' | 'tele' | 'attack' | 'stun' | 'air', k: number): void => {
  if (id === 'vexMk1') {
    nudge(rig, 'body', 0, Math.sin(t * 1.4) * 0.12, 0)
    pose(rig, 'body', Math.sin(t * 0.9) * 0.05, 0, Math.sin(t * 1.1) * 0.05)
    const open = act === 'tele' ? k : act === 'attack' ? 1 - k : 0
    pose(rig, 'clawL', -open * 0.9, 0, -0.3 - open * 0.4)
    pose(rig, 'clawR', -open * 0.9, 0, 0.3 + open * 0.4)
    scaleBone(rig, 'dome', 1 + (act === 'tele' ? 0.06 * Math.sin(t * 20) : 0))
    return
  }
  const walk = act === 'walk' ? 1 : 0
  const w = Math.sin(t * 7) * walk
  pose(rig, 'hipL', w * 0.5, 0, 0)
  pose(rig, 'hipR', -w * 0.5, 0, 0)
  pose(rig, 'kneeL', Math.max(0, -w) * 0.6, 0, 0)
  pose(rig, 'kneeR', Math.max(0, w) * 0.6, 0, 0)
  const bob = Math.sin(t * 2.2) * 0.012
  if (act === 'tele') {
    // Wind-up: crouch and draw both arms back
    nudge(rig, 'hips', 0, -0.08 * k + bob, 0)
    pose(rig, 'shoulderL', 0.8 * k, 0, -0.4 * k)
    pose(rig, 'shoulderR', 0.8 * k, 0, 0.4 * k)
    pose(rig, 'elbowL', -0.8 * k, 0, 0)
    pose(rig, 'elbowR', -0.8 * k, 0, 0)
    pose(rig, 'chest', 0.2 * k, 0, 0)
    pose(rig, 'head', -0.15 * k, 0, 0)
  } else if (act === 'attack') {
    // Thrust: both weapon arms forward
    const e = 1 - k
    nudge(rig, 'hips', 0, bob, 0)
    pose(rig, 'shoulderL', -1.5 * e, 0, -0.1)
    pose(rig, 'shoulderR', -1.5 * e, 0, 0.1)
    pose(rig, 'elbowL', -0.1, 0, 0)
    pose(rig, 'elbowR', -0.1, 0, 0)
    pose(rig, 'chest', -0.12 * e, 0, 0)
    pose(rig, 'head', 0, 0, 0)
  } else if (act === 'air') {
    nudge(rig, 'hips', 0, bob, 0)
    pose(rig, 'shoulderL', -2.6, 0, -0.3)
    pose(rig, 'shoulderR', -2.6, 0, 0.3)
    pose(rig, 'kneeL', 0.9, 0, 0)
    pose(rig, 'kneeR', 0.9, 0, 0)
    pose(rig, 'hipL', -0.6, 0, 0)
    pose(rig, 'hipR', -0.6, 0, 0)
  } else if (act === 'stun') {
    nudge(rig, 'hips', 0, -0.05, 0)
    pose(rig, 'chest', 0.35, Math.sin(t * 8) * 0.2, 0)
    pose(rig, 'head', 0.3, Math.sin(t * 9) * 0.4, 0)
    pose(rig, 'shoulderL', 0.3, 0, -0.6)
    pose(rig, 'shoulderR', 0.3, 0, 0.6)
  } else {
    nudge(rig, 'hips', 0, bob, 0)
    pose(rig, 'chest', 0, Math.sin(t * 0.8) * 0.1, 0)
    pose(rig, 'head', 0, Math.sin(t * 0.8) * 0.15, 0)
    pose(rig, 'shoulderL', 0.1, 0, -0.35 + Math.sin(t * 2) * 0.05)
    pose(rig, 'shoulderR', 0.1, 0, 0.35 - Math.sin(t * 2) * 0.05)
    pose(rig, 'elbowL', -0.5, 0, 0)
    pose(rig, 'elbowR', -0.5, 0, 0)
  }
}
