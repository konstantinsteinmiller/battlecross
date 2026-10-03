import { castClip, type ClipSet } from './clips'
import { I, N, easeOut, inOut, lerpPose, mk, snap, type Ch, type Clip, type Ease, type Pose, type Spec } from './pose'

/**
 * ─── Town life: the loops of a day's work (roadmap #42) ──────────────────────
 *
 * What a townsperson is doing (`sim/townLife.ts` names it) as a LOOP: key
 * poses round a cycle of `period` seconds over the stance their weapon is
 * carried in. A beat is a moment of the cycle where something happens (the
 * hammer meets the anvil, a puff of the pipe, a blow on the dummy): the town
 * view hangs its sparks and smoke on it. A prop held in the left hand plays
 * the loop mirrored.
 *
 * Same channels as every clip (`pose.ts`); `anim.ts` plays a loop in place of
 * the plain stance, and crossfades between loops as it does between clips.
 */

export interface LoopKey {
  /** Where in the cycle, 0..1. */
  at: number
  p: Pose
  e: Ease
}

export interface LoopClip {
  keys: LoopKey[]
  period: number
  /** Moments of the cycle (0..1) something lands. */
  beats: number[]
}

const SQUAT: Spec = { lLx: -0.8, kL: 1.6, lRx: -0.7, kR: 1.5, lLz: 0.22, lRz: 0.22 }
const HALF_SQUAT: Spec = { lLx: -0.45, kL: 0.9, lRx: -0.35, kR: 0.8, lLz: 0.16, lRz: 0.16 }
const SIT: Spec = { lLx: -1.5, kL: 1.48, lRx: -1.42, kR: 1.4, lLz: 0.1, lRz: 0.14, fL: 0, fR: 0, torRx: 0.06, aLx: -0.55, eL: 0.7, aRx: -0.55, eR: 0.7, aLz: 0.18, aRz: 0.18 }
const ARMS_BACK: Spec = { aLx: 0.45, aLz: 0.05, eL: 0.5, aRx: 0.45, aRz: 0.05, eR: 0.5, wRx: 0.4, oRx: 0.3 }
const CROSSED: Spec = { aRx: -0.55, aRz: -0.48, aRy: 0.3, eR: 1.95, aLx: -0.5, aLz: -0.5, aLy: 0.3, eL: 2.0 }
/** The right hand at the mouth (a mug, a bite, the pipe). */
const TO_MOUTH: Spec = { aRx: -1.05, aRz: -0.3, aRy: 0.15, eR: 2.25, wRx: 0.2, headRx: -0.12 }
const AT_LAP: Spec = { aRx: -0.65, aRz: 0.05, eR: 1.35, wRx: 0.35 }
/** A mug held up in front of the chest between sips: above a table's top, where it is seen. */
const AT_CHEST: Spec = { aRx: -1.0, aRz: 0.12, eR: 1.75, wRx: 0.25 }
const LEFT_IDLE: Spec = { aLx: -0.5, aLz: -0.5, eL: 1.9 }
const LEAN: Spec = { rootZ: -0.06, pitch: -0.07 }

const loop = (st: Pose, period: number, keys: Array<[number, Spec, Ease?]>, beats: number[] = []): LoopClip => ({
  period,
  beats,
  keys: keys.map(([at, s, e]) => ({ at, p: mk(st, s), e: e ?? inOut }))
})

/** A loop made of a clip of the attack set (drill at a dummy, sparring): gentler, with a breath after it. */
const fromClip = (st: Pose, c: Clip, period: number, k: number): LoopClip => {
  const keys: LoopKey[] = []
  for (const key of c.keys) {
    const p = new Float32Array(N)
    lerpPose(st, key.p, k, p)
    keys.push({ at: (key.at / 2) * 0.82, p, e: key.e })
  }
  return { keys, period, beats: [0.41] }
}

const LOOPS: Record<string, (st: Pose, set: ClipSet) => LoopClip> = {
  stand: st => loop(st, 4, [[0, {}]]),
  look: st => loop(st, 5.2, [[0, { headRy: 0.55, headRx: -0.05 }], [0.3, { headRy: 0.5 }], [0.55, { headRy: -0.5, headRx: 0.05 }], [0.85, { headRy: -0.45 }]]),
  inspect: st => loop(st, 6, [[0, { ...ARMS_BACK, headRy: 0.35, pitch: -0.03 }], [0.45, { ...ARMS_BACK, headRy: 0.3 }], [0.6, { ...ARMS_BACK, headRy: -0.35, headRx: 0.1 }], [0.95, { ...ARMS_BACK, headRy: -0.3 }]]),
  listen: st => loop(st, 2.4, [[0, { headRx: 0.04, brow: 0.3, aRz: 0.2, aLz: 0.2 }], [0.2, { headRx: 0.2, brow: 0.3 }], [0.4, { headRx: 0.04, brow: 0.2 }], [0.6, { headRx: 0.16, headRz: 0.05 }], [0.8, { headRx: 0.02 }]]),
  // Polishing a mug: it held up in one hand, the other rubbing round it with a cloth.
  polish: st => loop(st, 1.6, [
    [0, { ...AT_CHEST, aLx: -0.95, aLz: 0.45, eL: 1.55, headRx: 0.2 }],
    [0.25, { ...AT_CHEST, aLx: -1.1, aLz: 0.25, eL: 1.75, headRx: 0.22 }],
    [0.5, { ...AT_CHEST, aLx: -0.95, aLz: 0.05, eL: 1.6, headRx: 0.2, headRy: 0.06 }],
    [0.75, { ...AT_CHEST, aLx: -0.8, aLz: 0.25, eL: 1.45, headRx: 0.18 }]
  ]),
  // A song: swaying, head back, a hand out on the long notes.
  sing: st => loop(st, 3.2, [
    [0, { aRx: -0.6, aRz: 0.55, eR: 1.1, mouth: 0.8, headRx: -0.12, headRz: -0.08, roll: -0.05 }],
    [0.25, { aRx: -0.9, aRz: 1.0, eR: 0.5, mouth: 0.4, headRx: -0.2, headRz: 0.06, brow: 0.6, roll: 0.05 }],
    [0.5, { aRx: -0.6, aRz: 0.55, eR: 1.1, aLx: -0.5, aLz: 0.7, eL: 1.0, mouth: 0.9, headRx: -0.1, headRz: 0.08, roll: -0.05 }],
    [0.75, { aLx: -0.8, aLz: 1.0, eL: 0.6, mouth: 0.5, headRx: -0.22, headRz: -0.05, brow: 0.6, roll: 0.05 }]
  ]),
  talk: st => loop(st, 2.6, [
    [0, { aRx: -0.75, aRz: 0.4, eR: 1.35, mouth: 0.55, brow: 0.4, headRz: -0.05 }],
    [0.22, { aRx: -0.95, aRz: 0.75, eR: 0.75, mouth: 0.1, brow: 0.5 }],
    [0.45, { aRx: -0.6, aRz: 0.25, eR: 1.1, aLx: -0.65, aLz: 0.55, eL: 1.25, mouth: 0.7, headRz: 0.08 }],
    [0.7, { aLx: -0.85, aLz: 0.8, eL: 0.7, mouth: 0.15, brow: 0.6 }],
    [0.88, { mouth: 0.5, headRx: 0.08 }]
  ]),
  wave: st => loop(st, 0.62, [[0, { aRx: 0, aRz: 2.45, aRy: 0.2, eR: 0.45, mouth: 0.7, brow: 0.6, headRz: 0.08 }], [0.5, { aRx: 0, aRz: 2.6, aRy: -0.2, eR: 1.05, mouth: 0.7, brow: 0.6, headRz: 0.06 }]]),
  sit: st => loop(st, 5, [[0, { ...SIT }], [0.5, { ...SIT, torRx: 0.1, headRy: 0.25, headRx: 0.08 }]]),
  // Asleep over his mug: head down, slow breaths, the mug held loosely on the table.
  doze: st => loop(st, 4.4, [[0, { ...SIT, ...AT_CHEST, aRx: -0.85, eR: 1.3, headRx: 0.55, headRz: 0.1, lid: 1, torRx: 0.22, rootY: -0.01 }], [0.5, { ...SIT, ...AT_CHEST, aRx: -0.85, eR: 1.3, headRx: 0.48, headRz: 0.12, lid: 1, torRx: 0.18, rootY: 0.01, mouth: 0.3 }]]),
  sitDrink: st => loop(st, 5.5, [[0, { ...SIT, ...AT_CHEST }], [0.5, { ...SIT, ...AT_CHEST, headRy: 0.2 }], [0.66, { ...SIT, ...TO_MOUTH, headRx: -0.28 }], [0.86, { ...SIT, ...TO_MOUTH, headRx: -0.3, lid: 0.7 }]], [0.7]),
  sitEat: st => loop(st, 4.2, [[0, { ...SIT, ...AT_LAP }], [0.4, { ...SIT, ...AT_LAP, headRy: -0.2 }], [0.55, { ...SIT, ...TO_MOUTH, mouth: 0.8 }], [0.68, { ...SIT, ...TO_MOUTH, mouth: 0 }], [0.8, { ...SIT, ...AT_LAP, mouth: 0.4 }], [0.9, { ...SIT, ...AT_LAP, mouth: 0 }]]),
  sitSmoke: st => loop(st, 6, [[0, { ...SIT, ...AT_LAP }], [0.45, { ...SIT, ...AT_LAP, headRy: 0.3 }], [0.58, { ...SIT, ...TO_MOUTH, lid: 0.5 }], [0.75, { ...SIT, ...TO_MOUTH, lid: 0.6 }], [0.85, { ...SIT, ...AT_LAP, headRx: -0.15, mouth: 0.35 }]], [0.86]),
  lean: st => loop(st, 6, [[0, { ...CROSSED, ...LEAN, lLz: -0.06, kL: 0.15, lRx: 0.12, headRy: 0.2 }], [0.5, { ...CROSSED, ...LEAN, lLz: -0.06, kL: 0.18, lRx: 0.12, headRy: -0.25, headRx: 0.06 }]]),
  leanSmoke: st => loop(st, 6, [
    [0, { ...LEFT_IDLE, ...AT_LAP, ...LEAN }], [0.45, { ...LEFT_IDLE, ...AT_LAP, ...LEAN, headRy: 0.2 }], [0.58, { ...LEFT_IDLE, ...TO_MOUTH, ...LEAN, lid: 0.5 }],
    [0.76, { ...LEFT_IDLE, ...TO_MOUTH, ...LEAN }], [0.86, { ...LEFT_IDLE, ...AT_LAP, ...LEAN, headRx: -0.15, mouth: 0.35 }]
  ], [0.87]),
  drink: st => loop(st, 5, [[0, { ...AT_CHEST }], [0.55, { ...AT_CHEST, headRy: 0.2 }], [0.68, { ...TO_MOUTH, headRx: -0.3 }], [0.88, { ...TO_MOUTH, headRx: -0.32, lid: 0.7 }]], [0.7]),
  eat: st => loop(st, 4, [[0, { ...AT_LAP }], [0.45, { ...AT_LAP }], [0.58, { ...TO_MOUTH, mouth: 0.8 }], [0.7, { ...TO_MOUTH, mouth: 0 }], [0.82, { ...AT_LAP, mouth: 0.4 }], [0.92, { ...AT_LAP, mouth: 0 }]]),
  smoke: st => loop(st, 6, [[0, { ...AT_LAP, aLx: 0.3, aLz: 0.1, eL: 0.6 }], [0.5, { ...AT_LAP, aLx: 0.3, eL: 0.6, headRy: 0.25 }], [0.62, { ...TO_MOUTH, aLx: 0.3, eL: 0.6, lid: 0.5 }], [0.78, { ...TO_MOUTH, aLx: 0.3, eL: 0.6, lid: 0.55 }], [0.88, { ...AT_LAP, aLx: 0.3, eL: 0.6, headRx: -0.18, mouth: 0.35 }]], [0.89]),
  // The smith at the anvil: up, a hold, down on it.
  hammer: st => loop(st, 1.15, [
    [0, { aRx: -0.95, aRz: 0.32, aRy: 0, eR: 0.25, wRx: 1.85, wRy: 0, torRx: 0.18, pitch: 0.08, aLx: -0.8, eL: 0.7, headRx: 0.25, brow: -0.6 }, snap],
    [0.12, { aRx: -1.0, aRz: 0.38, eR: 0.35, wRx: 1.95, torRx: 0.2, pitch: 0.09, aLx: -0.8, eL: 0.7, headRx: 0.25, brow: -0.5 }, easeOut],
    [0.5, { aRx: 0, aRz: 2.25, aRy: -0.35, eR: 0.45, wRx: 2.55, wRy: 0, torRx: -0.05, torRy: 0.25, pitch: 0, aLx: -0.8, eL: 0.7, headRx: 0.1, brow: -0.5 }, easeOut],
    [0.78, { aRx: 0, aRz: 2.35, aRy: -0.4, eR: 0.35, wRx: 2.65, wRy: 0, torRx: -0.07, torRy: 0.28, aLx: -0.8, eL: 0.7, headRx: 0.12, brow: -0.7 }, inOut]
  ], [0]),
  stir: st => loop(st, 2.2, [
    [0, { aRx: -0.95, aRz: 0.1, aRy: 0.3, eR: 1.0, torRx: 0.18, headRx: 0.3, aLx: -0.4, eL: 1.2 }],
    [0.25, { aRx: -0.75, aRz: 0.35, aRy: 0.1, eR: 0.8, torRx: 0.16, headRx: 0.3 }],
    [0.5, { aRx: -0.9, aRz: 0.15, aRy: -0.2, eR: 0.75, torRx: 0.18, headRx: 0.32 }],
    [0.75, { aRx: -1.1, aRz: -0.05, aRy: 0.1, eR: 1.05, torRx: 0.2, headRx: 0.3 }]
  ]),
  sweep: st => loop(st, 1.5, [
    [0, { aRx: -0.4, aRz: -0.1, eR: 0.5, aLx: -0.75, aLz: -0.25, eL: 1.0, torRy: 0.35, hipRy: 0.12, torRx: 0.18, headRx: 0.25, wRx: 0.6 }],
    [0.5, { aRx: -0.65, aRz: 0.25, eR: 0.4, aLx: -0.5, aLz: 0.1, eL: 0.9, torRy: -0.35, hipRy: -0.12, torRx: 0.18, headRx: 0.25, wRx: 0.9 }]
  ]),
  read: st => loop(st, 6, [
    [0, { aRx: -0.95, aRz: -0.25, eR: 1.7, aLx: -0.95, aLz: -0.25, eL: 1.7, wRx: 0.3, headRx: 0.38, lid: 0.35, torRx: 0.06 }],
    [0.7, { aRx: -0.95, aRz: -0.25, eR: 1.7, aLx: -0.95, aLz: -0.25, eL: 1.7, wRx: 0.3, headRx: 0.4, headRy: 0.12, lid: 0.35 }],
    // A page turned.
    [0.8, { aRx: -0.95, aRz: -0.25, eR: 1.7, aLx: -1.05, aLz: 0.2, eL: 1.3, wRx: 0.3, headRx: 0.35, lid: 0.3 }],
    [0.9, { aRx: -0.95, aRz: -0.25, eR: 1.7, aLx: -0.95, aLz: -0.25, eL: 1.7, wRx: 0.3, headRx: 0.38 }]
  ]),
  count: st => loop(st, 1.8, [
    [0, { aRx: -0.85, aRz: 0.05, eR: 0.75, aLx: -0.8, aLz: 0.05, eL: 0.7, torRx: 0.14, headRx: 0.22, mouth: 0.25 }],
    [0.25, { aRx: -0.95, aRz: 0.1, eR: 0.95, aLx: -0.8, eL: 0.7, torRx: 0.14, headRx: 0.26, mouth: 0 }],
    [0.5, { aRx: -0.85, aRz: 0.05, eR: 0.75, aLx: -0.8, eL: 0.7, torRx: 0.14, headRx: 0.2, mouth: 0.3 }],
    [0.75, { aRx: -0.95, aRz: 0.1, eR: 0.95, aLx: -0.8, eL: 0.7, torRx: 0.14, headRx: 0.12, headRy: 0.3, mouth: 0.1 }]
  ]),
  sharpen: st => loop(st, 0.95, [
    [0, { aRx: -0.75, aRz: -0.1, eR: 1.25, wRx: 1.5, wRy: 0.9, aLx: -0.85, aLz: 0.15, eL: 1.2, aLy: -0.3, torRx: 0.12, headRx: 0.35 }],
    [0.5, { aRx: -0.75, aRz: -0.1, eR: 1.25, wRx: 1.5, wRy: 0.9, aLx: -0.85, aLz: -0.15, eL: 0.9, aLy: 0.4, torRx: 0.12, headRx: 0.35 }]
  ], [0.5]),
  forms: (st, set) => fromClip(st, set.attacks[0]!, 1.7, 0.85),
  spar: (st, set) => fromClip(st, set.attacks[set.attacks.length > 1 ? 1 : 0]!, 1.5, 0.78),
  cast: (st, set) => fromClip(st, castClip(set, 'beam'), 2.3, 0.8),
  warm: st => loop(st, 2.2, [
    [0, { ...HALF_SQUAT, pitch: 0.12, aRx: -1.25, aRz: 0.1, eR: 0.35, aLx: -1.25, aLz: 0.1, eL: 0.35, headRx: 0.15, lid: 0.3 }],
    [0.5, { ...HALF_SQUAT, pitch: 0.12, aRx: -1.2, aRz: -0.05, eR: 0.5, aLx: -1.2, aLz: -0.05, eL: 0.5, headRx: 0.18, lid: 0.4 }]
  ]),
  huddle: st => loop(st, 3.2, [
    [0, { ...SQUAT, lLx: -1.2, kL: 2.0, lRx: -1.15, kR: 2.0, pitch: 0.3, aRx: -0.9, aRz: -0.5, eR: 1.6, aLx: -0.9, aLz: -0.5, eL: 1.6, headRx: 0.45, brow: 0.8, lid: 0.4 }],
    [0.5, { ...SQUAT, lLx: -1.2, kL: 2.0, lRx: -1.15, kR: 2.0, pitch: 0.33, aRx: -0.92, aRz: -0.52, eR: 1.62, aLx: -0.92, aLz: -0.52, eL: 1.62, headRx: 0.5, headRy: 0.25, brow: 0.8, lid: 0.5 }]
  ]),
  tinker: st => loop(st, 1.3, [
    [0, { aRx: -0.9, aRz: 0.0, eR: 1.15, aLx: -0.85, aLz: 0.05, eL: 1.25, torRx: 0.18, headRx: 0.35, wRx: 0.8 }],
    [0.3, { aRx: -1.0, aRz: 0.1, eR: 0.95, aLx: -0.85, eL: 1.25, torRx: 0.18, headRx: 0.36, wRx: 1.2 }],
    [0.6, { aRx: -0.9, eR: 1.15, aLx: -0.95, aLz: 0.15, eL: 1.05, torRx: 0.18, headRx: 0.33 }]
  ], [0.3]),
  pray: st => loop(st, 4.5, [
    [0, { aRx: -0.85, aRz: -0.45, eR: 1.85, aLx: -0.85, aLz: -0.45, eL: 1.85, headRx: 0.32, lid: 1 }],
    [0.5, { aRx: -0.85, aRz: -0.45, eR: 1.85, aLx: -0.85, aLz: -0.45, eL: 1.85, headRx: 0.36, lid: 1, torRx: 0.05 }]
  ]),
  hoe: st => loop(st, 1.6, [
    [0, { aRx: -0.9, aRz: 0.1, eR: 0.3, aLx: -0.85, aLz: 0.0, eL: 0.4, torRx: 0.25, pitch: 0.1, headRx: 0.2, wRx: 1.0 }, snap],
    [0.35, { aRx: -1.9, aRz: 0.2, eR: 0.3, aLx: -1.8, eL: 0.4, torRx: -0.05, pitch: -0.02, headRx: 0.05, wRx: 0.4 }, easeOut],
    [0.75, { aRx: -2.0, aRz: 0.2, eR: 0.35, aLx: -1.9, eL: 0.45, torRx: -0.08, headRx: 0.05, wRx: 0.35 }, inOut]
  ], [0]),
  hang: st => loop(st, 3.2, [
    [0, { aRx: -0.6, eR: 0.9, aLx: -0.6, eL: 0.9, torRx: 0.15, headRx: 0.25 }],
    [0.3, { aRx: 0, aRz: 2.2, eR: 0.5, aLx: 0, aLz: 2.1, eL: 0.5, headRx: -0.35 }],
    [0.65, { aRx: 0, aRz: 2.3, eR: 0.6, aLx: 0, aLz: 2.2, eL: 0.4, headRx: -0.35, headRy: 0.2 }]
  ]),
  play: st => loop(st, 0.7, [[0, { rootY: 0, aRz: 0.6, aLz: 0.6, kL: 0.4, kR: 0.4, mouth: 0.6 }, easeOut], [0.45, { rootY: 0.22, aRx: 0, aLx: 0, aRz: 1.9, aLz: 1.9, eR: 0.3, eL: 0.3, mouth: 1, brow: 0.8 }, easeOut]])
}

const loops = new WeakMap<ClipSet, Map<string, LoopClip>>()

/** The loop of a town pose over a way of carrying, mirrored to the left hand on request. */
export const townLoop = (set: ClipSet, name: string, left = false): LoopClip => {
  let m = loops.get(set)
  if (!m) { m = new Map(); loops.set(set, m) }
  const key = left ? name + '|L' : name
  let c = m.get(key)
  if (!c) {
    const make = LOOPS[name] ?? LOOPS.stand!
    c = make(set.stance, set)
    if (left) {
      const base = c
      c = { ...base, keys: base.keys.map(k => ({ ...k, p: mirrorPose(k.p, set.stance) })) }
    }
    m.set(key, c)
  }
  return c
}

const SWAP: Array<[Ch, Ch]> = [['aLx', 'aRx'], ['aLy', 'aRy'], ['aLz', 'aRz'], ['eL', 'eR'], ['hLx', 'hRx'], ['hLy', 'hRy'], ['hLz', 'hRz'], ['oRx', 'wRx'], ['oRy', 'wRy'], ['oRz', 'wRz']]
const FLIP: Ch[] = ['torRy', 'torRz', 'headRy', 'headRz', 'hipRy', 'hipRz', 'roll']

/** The left-handed version of a pose: what it did with one arm, the other arm does (over the stance). */
const mirrorPose = (p: Pose, st: Pose): Pose => {
  const o = new Float32Array(p)
  for (const [a, b] of SWAP) {
    const ia = I[a]
    const ib = I[b]
    o[ia] = st[ia]! + (p[ib]! - st[ib]!)
    o[ib] = st[ib]! + (p[ia]! - st[ia]!)
  }
  for (const f of FLIP) o[I[f]] = st[I[f]]! - (p[I[f]]! - st[I[f]]!)
  return o
}

/** A loop `t` seconds in, written into `out`. */
export const sampleLoop = (c: LoopClip, t: number, out: Pose): void => {
  const ks = c.keys
  if (ks.length === 1) { out.set(ks[0]!.p); return }
  const u = (((t / c.period) % 1) + 1) % 1
  let i = ks.length - 1
  for (let k = 0; k < ks.length; k++) if (ks[k]!.at <= u) i = k
  const a = ks[i]!
  const b = ks[(i + 1) % ks.length]!
  const ta = a.at
  const tb = b.at > ta ? b.at : b.at + 1
  const uu = u >= ta ? u : u + 1
  const k = Math.min(1, Math.max(0, (uu - ta) / Math.max(1e-4, tb - ta)))
  const e = b.e(k)
  for (let ch = 0; ch < N; ch++) out[ch] = a.p[ch]! + (b.p[ch]! - a.p[ch]!) * e
}

/** Did a beat of the loop fall between `t0` and `t1` seconds in? */
export const loopBeat = (c: LoopClip, t0: number, t1: number): boolean => {
  if (!c.beats.length || t1 <= t0) return false
  const a = t0 / c.period
  const b = t1 / c.period
  for (const beat of c.beats) if (Math.floor(b - beat) > Math.floor(a - beat)) return true
  return false
}
