import { pose, type Rig } from './kit'
import { TAU, frac, legAt, swingA, type EnemyMotion, type GaitSpec, type LegSample } from './motion'

/**
 * ─── The planted-foot gait on a hip/knee rig ─────────────────────────────────
 *
 * Shared by the machines (models/enemies.ts) and the humanoid bosses
 * (models/bosses.ts). `gaitLegs` samples both legs at the frame's stride phase
 * (m.phase, advanced by distance in the sim); the pose helpers then turn that
 * into hip/knee rotations and the hips' drop. Module scratch, no allocations:
 * call `gaitLegs` first, then read `legL`, `legR`, `gaitDir` or pose.
 */

export const legL: LegSample = { th: 0, knee: 0, stance: true }
export const legR: LegSample = { th: 0, knee: 0, stance: false }
/** Unit travel direction in the body frame (f: +Z, s: +X), the swing
 *  amplitude, and the outward bias that keeps side-steps apart. */
export const gaitDir = { f: 1, s: 0, a: 0, bias: 0 }

/** Both legs at the frame's stride phase. `wk` = gaitAmp(m.walk). */
export const gaitLegs = (g: GaitSpec, m: EnemyMotion, wk: number): void => {
  // The smoothed direction shrinks toward zero while it turns round (a
  // backpedal); its length scales the swing, so the unit direction can flip
  // while the legs are near neutral instead of snapping them across.
  const mag = Math.hypot(m.fwd, m.side)
  gaitDir.f = mag > 1e-6 ? m.fwd / mag : 1
  gaitDir.s = mag > 1e-6 ? m.side / mag : 0
  gaitDir.a = swingA(g, m.walk, gaitDir.s) * Math.min(1, mag) * (1 - m.dash)
  // Side-steps: each foot sweeps OUTWARD of its own hip (step, close, step),
  // so the legs never cross whatever the amplitude.
  gaitDir.bias = gaitDir.a * Math.abs(gaitDir.s)
  const sA = Math.sin(gaitDir.a)
  const u = frac(m.phase / TAU)
  // A shorter step lifts the foot less, and a side-step is a low shuffle
  const knee = g.knee * Math.min(wk, gaitDir.a / g.A) * (1 - 0.5 * Math.abs(gaitDir.s))
  legAt(u, sA, g.beta, knee, legL)
  legAt(frac(u + 0.5), sA, g.beta, knee, legR)
}

/** Hips drop that keeps the stance sole on the floor (inverted pendulum). */
export const stanceDrop = (g: GaitSpec): number => {
  const st = legL.stance ? legL : legR
  const out = st === legR ? gaitDir.bias : -gaitDir.bias
  return g.L * (1 - Math.cos(Math.hypot(st.th * gaitDir.f, st.th * gaitDir.s + out)))
}

/** Leg rotations from `gaitLegs`, plus a static bend (soft knees). */
export const poseLegs = (rig: Rig, hipBend = 0, kneeBend = 0): void => {
  const f = gaitDir.f
  const s = gaitDir.s
  pose(rig, 'hipL', -legL.th * f + hipBend, 0, legL.th * s - gaitDir.bias)
  pose(rig, 'hipR', -legR.th * f + hipBend, 0, legR.th * s + gaitDir.bias)
  pose(rig, 'kneeL', legL.knee + kneeBend, 0, 0)
  pose(rig, 'kneeR', legR.knee + kneeBend, 0, 0)
}
