import { I, backOut, easeOut, easeOut3, inOut, lin, mk, snap, type Clip, type Key, type Pose, type Spec } from './pose'
import type { Held, OffHand } from './humanoid'

/**
 * ─── The choreography ────────────────────────────────────────────────────────
 *
 * Every attack and cast a two-legged thing can make, authored as key poses on
 * the channels of `pose.ts`. One shape runs through all of them (roadmap #38):
 *
 *   anticipation   the body coils AWAY from the blow: weight on the back foot,
 *                  the weapon drawn back, the chest turned from the target and
 *                  the head still on it; then a brief hold
 *   strike         short and explosive, and it ENDS on the sim's hit time: the
 *                  hips lead, the chest follows, the arm and last the blade
 *   follow-through past the target with overshoot, the front foot planted
 *   recovery       back to the stance the weapon is carried in
 *
 * The sim's timings are balance and are not touched (D43): a clip is laid over
 * whatever wind-up and recovery the action has. Only the follow-through may
 * outlive a very short action (a 0.1 s cast), on the view's own clock.
 *
 * TWO THINGS THE CHIBI BODY DICTATES. The head is as wide as the shoulders and
 * sits right on them, so an arm cannot be raised FORWARD past the chin: it
 * would go through the face. Every "up" is therefore up-and-OUT (`aXz` ≈ 2.2),
 * a V over the head, and it is swung forward or back from there with `aXy`.
 * And the camera looks down from the front: what reads is breadth (an arm out
 * to the side, a blade above the head, a wide stance, a turn of the chest),
 * not depth, so the poses are opened out sideways and lean only a little.
 *
 * The blade's own angle: `wRx` 0 is a hammer grip (the blade square to the
 * forearm), ~2 lays it in line with the arm, more than that cocks it back.
 *
 * A `Style` is a way of carrying a weapon: its stance, its basic attacks (they
 * alternate), and the casts built on that stance.
 */

export type Style =
  | 'sword' | 'dagger' | 'great' | 'heavy' | 'staff' | 'wand' | 'caster' | 'gun' | 'cannon' | 'bow' | 'sling'
  | 'scythe' | 'flask' | 'unarmed'

export type CastName =
  | 'slam' | 'dash' | 'throw' | 'throwDown' | 'channel' | 'summon' | 'shout' | 'ward' | 'buff' | 'whirl' | 'beam'
  | 'raise' | 'burst' | 'point' | 'plant' | 'drain' | 'call' | 'bash' | 'strike' | 'cleave' | 'breath' | 'charge'
  | 'line' | 'leap' | 'open'

export interface ClipSet {
  stance: Pose
  /** Basic attacks, taken in turn. */
  attacks: Clip[]
  casts: Partial<Record<CastName, Clip>>
  style: Style
  shield: boolean
  dual: boolean
}

// ─── Fragments ───────────────────────────────────────────────────────────────

/** Weight on the back foot. */
const BACK: Spec = { lRx: 0.22, kR: 0.5, lLx: -0.3, kL: 0.12, hipZ: -0.05, pitch: -0.06, rootZ: -0.06 }
/** The front foot steps in and plants; the back heel lifts. */
const STEP: Spec = { lLx: -0.6, kL: 0.8, lRx: 0.5, kR: 0.12, fR: 0.35, hipZ: 0.07, pitch: 0.12, headRx: -0.1, rootZ: 0.22 }
const STEP_OVER: Spec = { lLx: -0.66, kL: 0.95, lRx: 0.55, kR: 0.15, fR: 0.4, hipZ: 0.09, pitch: 0.16, headRx: -0.12, rootZ: 0.27 }
const WIDE: Spec = { lLx: -0.2, lLz: 0.16, kL: 0.35, lRx: 0.15, lRz: 0.16, kR: 0.35 }
const SQUAT: Spec = { lLx: -0.8, kL: 1.6, lRx: -0.7, kR: 1.5, lLz: 0.22, lRz: 0.22 }
const HALF_SQUAT: Spec = { lLx: -0.45, kL: 0.9, lRx: -0.35, kR: 0.8, lLz: 0.16, lRz: 0.16 }
const GRIM: Spec = { brow: -0.9 }
const SHOUT: Spec = { brow: -1, mouth: 1 }
/** The blade in line with the forearm. */
const LINE = 2.05

// ─── Stances ─────────────────────────────────────────────────────────────────

const LEGS: Spec = { lLx: -0.2, kL: 0.25, lRx: 0.16, kR: 0.22, lLz: 0.06, lRz: 0.08 }
const REST: Spec = { aLz: 0.14, aRz: 0.14, eL: 0.3, eR: 0.3 }

const STANCE: Record<Style, Spec> = {
  // The blade up and out beside the weapon shoulder, the chest a quarter turned.
  sword: { ...LEGS, torRy: 0.22, hipRy: 0.1, headRy: -0.25, aRx: -0.3, aRz: 0.38, eR: 0.9, wRx: 0.6, wRy: 0.45, aLx: -0.15, aLz: 0.25, eL: 0.7 },
  // Low and forward, both hands up.
  dagger: { pitch: 0.08, torRy: 0.15, headRy: -0.15, aRx: -0.5, aRz: 0.3, eR: 1.2, wRx: 1.2, wRy: 0.3, aLx: -0.4, aLz: 0.3, eL: 1.1, oRx: 1.2, oRy: -0.3, lLx: -0.35, kL: 0.55, lRx: 0.1, kR: 0.5, lLz: 0.1, lRz: 0.12 },
  // Two hands on the grip, the blade leaning back over the shoulder.
  great: { ...WIDE, torRy: 0.3, headRy: -0.3, aRx: -0.5, aRz: 0.5, eR: 0.8, wRx: -0.2, wRy: 0.6, aLx: -0.9, aLz: -0.2, aLy: 0.5, eL: 1.2 },
  heavy: { ...LEGS, torRy: 0.2, headRy: -0.2, aRx: -0.2, aRz: 0.34, eR: 0.7, wRx: 0.1, wRy: 0.45, aLx: -0.1, aLz: 0.25, eL: 0.6 },
  // Upright, the butt near the ground.
  staff: { aRx: -0.5, aRz: 0.34, eR: 0.5, wRx: 0.9, aLx: -0.2, aLz: 0.2, eL: 0.5, lLz: 0.05, lRz: 0.05 },
  wand: { aRx: -0.5, aRz: 0.3, eR: 1.1, wRx: 0.6, wRy: 0.3, aLx: -0.2, aLz: 0.2, eL: 0.6, lLz: 0.05, lRz: 0.05 },
  caster: { aRx: -0.3, aRz: 0.25, eR: 0.8, aLx: -0.3, aLz: 0.25, eL: 0.8, lLz: 0.05, lRz: 0.05 },
  gun: { ...LEGS, torRy: 0.15, headRy: -0.15, aRx: -0.35, aRz: 0.2, eR: 1.0, aLx: -0.3, aLz: 0.2, eL: 0.9 },
  // Braced at the hip, both hands.
  cannon: { ...WIDE, pitch: 0.04, torRy: 0.35, headRy: -0.35, aRx: 0.1, aRz: 0.2, eR: 1.3, aLx: -0.7, aLy: 0.6, eL: 0.9 },
  bow: { ...LEGS, aRx: -0.2, aRz: 0.2, eR: 0.5, aLx: 0, aLz: 0.18, eL: 0.4 },
  sling: { ...LEGS, aRx: -0.2, aRz: 0.25, eR: 0.8, aLx: -0.1, aLz: 0.2, eL: 0.5 },
  scythe: { ...WIDE, torRy: 0.3, headRy: -0.3, aRx: -0.4, aRz: 0.35, eR: 0.8, wRx: 1.2, aLx: -0.9, aLy: 0.5, aLz: -0.2, eL: 1.0 },
  flask: { ...LEGS, aRx: -0.4, aRz: 0.25, eR: 1.2, aLx: -0.2, aLz: 0.2, eL: 0.5 },
  // A boxer's guard.
  unarmed: { pitch: 0.05, torRy: 0.25, headRy: -0.25, aRx: -0.6, aRz: 0.25, eR: 1.7, aLx: -0.8, aLz: 0.25, eL: 1.6, lLx: -0.25, kL: 0.3, lRx: 0.15, kR: 0.3, lLz: 0.08, lRz: 0.1 }
}

/** The shield arm: forearm across the body, the shield's face to the front. */
const SHIELD_ARM: Spec = { aLx: -0.35, aLy: 0.95, aLz: 0.15, eL: 1.35 }

// ─── Builders ────────────────────────────────────────────────────────────────

interface Meta {
  strike?: number
  tail?: number
  trail?: [number, number] | null
  trailOff?: boolean
  heavy?: boolean
  tense?: number
  hop?: number
}

const clip = (keys: Key[], m: Meta = {}): Clip => ({
  keys,
  strike: m.strike ?? (m.heavy ? 0.11 : 0.085),
  tail: m.tail ?? 0.34,
  trail: m.trail === undefined ? [1.1, 1.28] : m.trail,
  trailOff: m.trailOff,
  heavy: !!m.heavy,
  tense: m.tense ?? 0,
  hop: m.hop ?? 0
})

interface Beats {
  /** The coil: weight back, the weapon drawn away from the target. */
  antic: Spec
  /** The instant of the hit. */
  hit: Spec
  /** Past it. */
  over: Spec
  /** Half-way home (default: a quarter of the overshoot left). */
  settle?: Spec
}

/** The standard shape: stance → coil → hold → STRIKE → overshoot → settle → stance. */
const swing = (st: Pose, b: Beats, m: Meta = {}): Clip => clip([
  { at: 0, p: st, e: lin },
  { at: 0.62, p: mk(st, b.antic), e: easeOut },
  { at: 0.999, p: mk(st, b.antic, 1.08), e: inOut },
  { at: 1, p: mk(st, b.hit), e: snap },
  { at: 1.2, p: mk(st, b.over), e: easeOut3 },
  { at: 1.62, p: b.settle ? mk(st, b.settle) : mk(st, b.over, 0.22), e: inOut },
  { at: 2, p: st, e: backOut }
], m)

/** A cast that is HELD after it lands (a breath, a beam, a shout that carries). */
const held = (st: Pose, b: Beats, m: Meta = {}): Clip => clip([
  { at: 0, p: st, e: lin },
  { at: 0.62, p: mk(st, b.antic), e: easeOut },
  { at: 0.999, p: mk(st, b.antic, 1.08), e: inOut },
  { at: 1, p: mk(st, b.hit), e: snap },
  { at: 1.18, p: mk(st, b.over), e: easeOut3 },
  { at: 1.7, p: mk(st, b.over, 0.9), e: inOut },
  { at: 2, p: st, e: inOut }
], { trail: null, ...m })

/** Arm channels a spec leaves alone would keep the stance's: these clear them. */
const R0: Spec = { aRx: 0, aRy: 0 }
const L0: Spec = { aLx: 0, aLy: 0 }

// ─── Basic attacks, by style ─────────────────────────────────────────────────

/** A level sweep from the weapon side across the front (the one-handed half of a cleave). */
const sweep = (extra: Spec = {}): Beats => ({
  antic: { ...BACK, ...GRIM, torRy: 0.95, hipRy: 0.35, headRy: -0.75, ...R0, aRz: 1.5, aRy: -0.6, eR: 0.3, wRx: 1.9, wRy: 0, aLx: -0.9, aLz: 0.3, eL: 0.4, ...extra },
  hit: { ...STEP, ...SHOUT, torRy: -0.55, hipRy: -0.28, headRy: 0.35, ...R0, aRz: 1.42, aRy: 1.3, eR: 0.1, wRx: 1.9, wRy: 0, aLx: 0.6, aLz: 0.6, eL: 0.6 },
  over: { ...STEP_OVER, brow: -1, mouth: 0.7, torRy: -1.05, hipRy: -0.4, headRy: 0.6, ...R0, aRz: 1.3, aRy: 2.3, eR: 0.3, wRx: 2.0, wRy: 0, aLx: 0.8, aLz: 0.7, eL: 0.7 }
})

/** One arm, a long way up, the whole weight down. */
const smash = (): Beats => ({
  antic: { ...BACK, ...GRIM, torRy: 0.5, hipRy: 0.2, headRy: -0.4, torRx: -0.12, pitch: -0.08, ...R0, aRz: 2.45, aRy: -0.35, eR: 0.3, wRx: 2.5, wRy: 0, aLx: -1.0, aLz: 0.4, eL: 0.4, hipY: 0.02 },
  hit: { ...STEP, ...SHOUT, pitch: 0.2, torRy: -0.5, hipRy: -0.25, headRy: 0.3, torRx: 0.2, aRx: -1.1, aRy: 0, aRz: 0.3, eR: 0.1, wRx: 1.9, wRy: 0, aLx: 0.7, aLz: 0.5, eL: 0.6, hipY: -0.03 },
  over: { ...STEP_OVER, brow: -1, mouth: 0.7, pitch: 0.25, torRy: -0.7, headRy: 0.4, torRx: 0.28, kL: 1.05, aRx: -0.7, aRy: 0, aRz: 0.25, eR: 0.15, wRx: 2.25, wRy: 0, aLx: 0.9, aLz: 0.5, eL: 0.7, hipY: -0.05 }
})

const ATTACKS: Record<Style, (st: Pose, dual: boolean) => Clip[]> = {
  sword: st => [
    // Cut, backhand, cut, thrust: the thrust is the rarer beat (its line is
    // the one a body hides when it faces away from the camera).
    // A forehand cut: from high behind the weapon shoulder, across and down.
    swing(st, {
      antic: { ...BACK, ...GRIM, torRy: 0.6, hipRy: 0.22, headRy: -0.5, ...R0, aRz: 2.1, aRy: -0.45, eR: 0.35, wRx: 2.5, wRy: 0, aLx: -1.1, aLz: 0.2, eL: 0.3 },
      hit: { ...STEP, ...SHOUT, torRy: -0.6, hipRy: -0.25, headRy: 0.3, torRx: 0.1, ...R0, aRz: 1.15, aRy: 1.5, eR: 0.1, wRx: 1.7, wRy: 0, aLx: 0.7, aLz: 0.5, eL: 0.7 },
      over: { ...STEP_OVER, brow: -1, mouth: 0.6, torRy: -0.9, hipRy: -0.33, headRy: 0.45, torRx: 0.14, ...R0, aRz: 0.8, aRy: 2.3, eR: 0.35, wRx: 1.9, wRy: 0, aLx: 0.85, aLz: 0.55, eL: 0.8 }
    }),
    // A backhand: from low across the body, out and up to the weapon side.
    swing(st, {
      antic: { ...BACK, ...GRIM, torRy: -0.7, hipRy: -0.2, headRy: 0.5, ...R0, aRz: 0.95, aRy: 2.5, eR: 0.9, wRx: 1.3, wRy: 0, aLx: 0.3, aLz: 0.5, eL: 0.5 },
      hit: { ...STEP, ...SHOUT, torRy: 0.5, hipRy: 0.2, headRy: -0.35, ...R0, aRz: 1.4, aRy: 1.25, eR: 0.1, wRx: 1.9, wRy: 0, aLx: -0.6, aLz: 0.6, eL: 0.5 },
      over: { ...STEP_OVER, brow: -1, mouth: 0.6, torRy: 0.85, hipRy: 0.3, headRy: -0.5, ...R0, aRz: 1.75, aRy: 0.0, eR: 0.25, wRx: 2.1, wRy: 0, aLx: -0.9, aLz: 0.7, eL: 0.4 }
    }),
    // A thrust: the elbow drawn back, then the whole arm in a line.
    swing(st, {
      antic: { ...BACK, ...GRIM, torRy: 0.6, headRy: -0.5, aRx: 0.5, aRz: 0.3, eR: 2.0, wRx: LINE, wRy: 0, aLx: -1.2, aLz: 0.15, eL: 0.2 },
      hit: { ...STEP_OVER, ...SHOUT, rootZ: 0.34, torRy: -0.55, headRy: 0.3, torRx: 0.12, aRx: -1.48, aRz: 0.05, eR: 0.05, wRx: LINE, wRy: 0, aLx: 0.8, aLz: 0.5, eL: 0.6 },
      over: { ...STEP_OVER, mouth: 0.5, brow: -1, rootZ: 0.38, pitch: 0.2, torRy: -0.65, headRy: 0.35, torRx: 0.14, aRx: -1.54, aRz: 0.05, eR: 0.02, wRx: LINE, wRy: 0, aLx: 0.9, aLz: 0.5, eL: 0.6 },
      settle: { rootZ: 0.12, pitch: 0.06, aRx: -0.9, eR: 0.9, wRx: 1.4 }
    }, { strike: 0.07 })
  ].flatMap((c, i, all) => (i === 2 ? [all[0]!, c] : [c])),

  dagger: (st, dual) => {
    // Short and fast: a hooked stab from the side, the body behind it. (A
    // straight jab is all depth, and depth is what this camera does not show.)
    const jab = swing(st, {
      antic: { ...GRIM, torRy: 0.6, headRy: -0.5, ...R0, aRz: 1.35, aRy: -0.5, eR: 0.9, wRx: 1.6, wRy: 0, aLx: -0.9, eL: 1.3, hipZ: -0.04, rootZ: -0.05 },
      hit: { ...STEP, mouth: 0.8, brow: -1, pitch: 0.14, torRy: -0.55, headRy: 0.3, ...R0, aRz: 1.3, aRy: 1.5, eR: 0.15, wRx: 1.9, wRy: 0, ...L0, aLz: 1.3, aLy: -0.4, eL: 0.8, oRx: 1.6, oRy: 0 },
      over: { ...STEP, mouth: 0.4, pitch: 0.17, rootZ: 0.26, torRy: -0.8, headRy: 0.42, ...R0, aRz: 1.15, aRy: 2.1, eR: 0.3, wRx: 2.0, wRy: 0, ...L0, aLz: 1.3, aLy: -0.5, eL: 0.8, oRx: 1.6, oRy: 0 }
    }, { strike: 0.06 })
    if (dual) {
      // The off hand hooks in from the other side a beat behind the main hand's hit.
      const st2 = jab.keys[4]!.p
      jab.keys.splice(5, 1,
        { at: 1.34, p: mk(st2, { torRy: 0.55, headRy: -0.3, ...L0, aLz: 1.3, aLy: 1.5, eL: 0.15, oRx: 1.9, oRy: 0, ...R0, aRz: 0.9, aRy: 0.6, eR: 1.3, wRx: 1.4 }), e: snap },
        { at: 1.6, p: mk(st2, { torRy: 0.75, ...L0, aLz: 1.15, aLy: 2.0, eL: 0.3, oRx: 2.0, oRy: 0, ...R0, aRz: 0.7, aRy: 0.4, eR: 1.3, rootZ: 0.12, pitch: 0.08 }), e: easeOut })
      jab.trailOff = true
    }
    // A reverse slash across the throat, low to high.
    const slash = swing(st, {
      antic: { ...GRIM, torRy: -0.6, headRy: 0.45, ...R0, aRz: 1.0, aRy: 2.4, eR: 1.1, wRx: 1.4, wRy: 0, aLx: 0.2, eL: 1.0, hipZ: -0.04, rootZ: -0.04 },
      hit: { ...STEP, mouth: 0.8, brow: -1, pitch: 0.14, torRy: 0.5, headRy: -0.3, ...R0, aRz: 1.4, aRy: 1.2, eR: 0.15, wRx: 1.9, wRy: 0, aLx: -0.7, eL: 1.2 },
      over: { ...STEP, mouth: 0.4, pitch: 0.16, torRy: 0.8, headRy: -0.45, ...R0, aRz: 1.8, aRy: 0.1, eR: 0.3, wRx: 2.1, wRy: 0, aLx: -0.9, eL: 1.2 }
    }, { strike: 0.06 })
    return [jab, slash]
  },

  great: st => [
    // Overhead: everything goes up and out, then everything comes down.
    swing(st, {
      antic: { ...BACK, ...GRIM, torRx: -0.15, pitch: -0.08, headRx: -0.1, torRy: 0.1, ...R0, aRz: 2.5, aRy: -0.3, eR: 0.2, wRx: 2.6, wRy: 0, ...L0, aLz: 2.4, eL: 0.2, hipY: 0.03 },
      hit: { ...STEP, ...SHOUT, pitch: 0.2, torRx: 0.25, torRy: -0.1, aRx: -1.15, aRy: 0, aRz: 0.25, eR: 0.1, wRx: 1.9, wRy: 0, aLx: -1.15, aLy: 0, aLz: 0.25, eL: 0.1, hipY: -0.04 },
      over: { ...STEP_OVER, brow: -1, mouth: 0.7, pitch: 0.26, torRx: 0.32, kL: 1.05, aRx: -0.75, aRy: 0, aRz: 0.2, eR: 0.12, wRx: 2.25, wRy: 0, aLx: -0.75, aLy: 0, aLz: 0.2, eL: 0.12, hipY: -0.06 }
    }, { heavy: true, tail: 0.5, tense: 0.4, trail: [1.14, 1.34] }),
    // A level sweep, right to left, with the whole back in it.
    swing(st, sweep({ aLx: -1.1, aLz: -0.5, aLy: 0.2, eL: 1.0 }), { heavy: true, tail: 0.5, tense: 0.4, trail: [1.16, 1.36] })
  ],

  heavy: st => [
    swing(st, smash(), { heavy: true, tail: 0.48, tense: 0.35, trail: [1.14, 1.34] }),
    // A side swing at the ribs.
    swing(st, sweep(), { heavy: true, tail: 0.48, tense: 0.35, trail: [1.16, 1.36] })
  ],

  staff: st => [
    // The staff raised, then its head thrust at the target.
    swing(st, {
      antic: { ...BACK, torRy: 0.4, headRy: -0.3, torRx: -0.08, ...R0, aRz: 2.45, aRy: 0.2, eR: 0.25, wRx: 3.0, aLx: -1.4, aLz: 0.2, eL: 0.6, brow: -0.6 },
      hit: { rootZ: 0.1, pitch: 0.08, lLx: -0.4, kL: 0.5, lRx: 0.3, torRy: -0.3, headRy: 0.2, torRx: 0.06, aRx: -1.35, aRy: 0, aRz: 0.3, eR: 0.15, wRx: 2.6, aLx: -1.3, aLz: 0.2, eL: 0.2, mouth: 0.9, brow: -0.8 },
      over: { rootZ: 0.02, pitch: 0.0, torRy: -0.2, torRx: -0.04, aRx: -1.1, aRy: 0, aRz: 0.35, eR: 0.5, wRx: 2.1, aLx: -1.0, aLz: 0.5, eL: 0.4, mouth: 0.4 }
    }, { trail: null, strike: 0.09 }),
    // A flourish: the staff swept round overhead and brought down pointing.
    swing(st, {
      antic: { torRy: -0.35, headRy: 0.25, torRx: -0.1, ...R0, aRz: 2.3, aRy: 1.2, eR: 0.2, wRx: 3.4, aLx: -0.4, aLz: 1.0, eL: 0.3, brow: -0.6, hipY: 0.02 },
      hit: { rootZ: 0.08, pitch: 0.07, lLx: -0.4, kL: 0.5, lRx: 0.3, torRy: 0.3, headRy: -0.2, torRx: 0.06, aRx: -1.25, aRy: 0, aRz: 0.4, eR: 0.2, wRx: 2.5, aLx: -1.4, aLz: 0.1, eL: 0.1, mouth: 0.9, brow: -0.8 },
      over: { torRy: 0.2, aRx: -1.0, aRy: 0, aRz: 0.4, eR: 0.5, wRx: 2.0, aLx: -1.1, aLz: 0.4, eL: 0.3, mouth: 0.4 }
    }, { trail: [1.1, 1.35], strike: 0.1 })
  ],

  wand: st => [
    // A flick from over the shoulder.
    swing(st, {
      antic: { torRy: 0.4, headRy: -0.3, ...R0, aRz: 1.9, aRy: -0.3, eR: 0.8, wRx: 1.2, wRy: 0, aLx: 0.2, aLz: 0.3, eL: 0.6, brow: -0.5, hipZ: -0.03 },
      hit: { rootZ: 0.06, pitch: 0.06, torRy: -0.3, headRy: 0.2, aRx: -1.4, aRy: 0, aRz: 0.2, eR: 0.1, wRx: 1.9, wRy: 0, aLx: 0.4, aLz: 0.5, eL: 0.6, mouth: 0.7, brow: -0.7 },
      over: { torRy: -0.4, aRx: -1.15, aRy: 0, aRz: 0.2, eR: 0.3, wRx: 2.2, wRy: 0, aLx: 0.5, aLz: 0.5, mouth: 0.3 }
    }, { trail: [1.1, 1.3], strike: 0.07 }),
    // Swept in from the side, then the point.
    swing(st, {
      antic: { torRy: -0.3, headRy: 0.2, ...R0, aRz: 1.3, aRy: 2.2, eR: 1.0, wRx: 1.5, wRy: 0, aLx: -0.9, aLz: 0.3, eL: 1.2, brow: -0.5 },
      hit: { rootZ: 0.06, pitch: 0.06, torRy: 0.25, headRy: -0.15, aRx: -1.45, aRy: 0, aRz: 0.3, eR: 0.1, wRx: 1.9, wRy: 0, aLx: -0.3, aLz: 0.6, eL: 0.5, mouth: 0.7, brow: -0.7 },
      over: { torRy: 0.35, aRx: -1.2, aRy: 0, aRz: 0.4, eR: 0.3, wRx: 2.2, wRy: 0, mouth: 0.3 }
    }, { trail: [1.1, 1.3], strike: 0.07 })
  ],

  caster: st => [
    // Both hands gathered at the chest, then pushed out.
    swing(st, {
      antic: { ...BACK, torRx: -0.06, aRx: 0.2, aRz: 0.2, eR: 2.0, aLx: 0.2, aLz: 0.2, eL: 2.0, brow: -0.6 },
      hit: { rootZ: 0.08, pitch: 0.1, lLx: -0.4, kL: 0.5, lRx: 0.3, torRx: 0.06, aRx: -1.45, aRz: 0.0, eR: 0.1, aLx: -1.45, aLz: 0.0, eL: 0.1, mouth: 0.9, brow: -0.8 },
      over: { rootZ: 0.0, pitch: 0.02, aRx: -1.6, aRz: 0.3, eR: 0.4, aLx: -1.6, aLz: 0.3, eL: 0.4, mouth: 0.4 }
    }, { trail: null }),
    // One hand thrown forward, the other back.
    swing(st, {
      antic: { ...BACK, torRy: 0.6, headRy: -0.45, aRx: 0.4, aRz: 0.4, eR: 1.6, aLx: -1.0, aLz: 0.2, eL: 0.4, brow: -0.6 },
      hit: { rootZ: 0.08, pitch: 0.1, lLx: -0.4, kL: 0.5, lRx: 0.3, torRy: -0.5, headRy: 0.3, aRx: -1.5, aRz: 0.05, eR: 0.05, aLx: 0.6, aLz: 0.5, eL: 0.6, mouth: 0.9, brow: -0.8 },
      over: { torRy: -0.6, aRx: -1.6, aRz: 0.1, eR: 0.3, aLx: 0.7, aLz: 0.5, mouth: 0.4 }
    }, { trail: null })
  ],

  gun: (st, dual) => {
    // Aim, the shot, the kick, a glance at the chamber.
    const aim: Spec = { torRy: 0.25, headRy: -0.2, headRx: 0.05, aRx: -1.3, aRz: 0.1, eR: 0.25, wRx: 0.1, aLx: -1.1, aLy: 0.5, aLz: 0, eL: 0.9, brow: -0.6, lid: 0.3 }
    const shot = clip([
      { at: 0, p: st, e: lin },
      { at: 0.55, p: mk(st, aim), e: easeOut3 },
      { at: 0.999, p: mk(st, aim, 1.03), e: lin },
      { at: 1, p: mk(st, aim, 1.03), e: lin },
      { at: 1.1, p: mk(st, { ...aim, aRx: -1.75, eR: 0.55, wRx: -0.4, torRx: -0.14, pitch: -0.07, rootZ: -0.07, hipZ: -0.03, headRx: -0.08, lid: 0.6, mouth: 0.3 }), e: easeOut3 },
      { at: 1.45, p: mk(st, { aRx: -0.9, eR: 1.5, wRx: -0.6, aLx: -0.9, aLy: 0.3, eL: 1.6, headRx: 0.25, torRy: 0.1 }), e: inOut },
      { at: 2, p: st, e: inOut }
    ], { trail: null, strike: 0.02 })
    if (!dual) return [shot]
    // The other barrel: the left hand's turn.
    const aimL: Spec = { torRy: -0.3, headRy: 0.2, headRx: 0.05, aLx: -1.35, aLz: 0.1, eL: 0.2, oRx: 0.1, aRx: -0.5, eR: 1.4, brow: -0.6, lid: 0.3 }
    const shotL = clip([
      { at: 0, p: st, e: lin },
      { at: 0.55, p: mk(st, aimL), e: easeOut3 },
      { at: 1, p: mk(st, aimL, 1.03), e: lin },
      { at: 1.1, p: mk(st, { ...aimL, aLx: -1.8, eL: 0.5, oRx: -0.4, torRx: -0.14, pitch: -0.07, rootZ: -0.07, headRx: -0.08, lid: 0.6 }), e: easeOut3 },
      { at: 1.5, p: mk(st, { aLx: -0.8, eL: 1.3, oRx: -0.3 }), e: inOut },
      { at: 2, p: st, e: inOut }
    ], { trail: null, strike: 0.02 })
    return [shot, shotL]
  },

  cannon: (st) => {
    const brace: Spec = { ...WIDE, pitch: 0.08, hipY: -0.03, torRy: 0.4, headRy: -0.4, aRx: 0.0, eR: 1.4, aLx: -0.9, aLy: 0.6, eL: 1.0, brow: -0.8, lid: 0.3 }
    return [clip([
      { at: 0, p: st, e: lin },
      { at: 0.6, p: mk(st, brace), e: easeOut },
      { at: 1, p: mk(st, brace, 1.06), e: lin },
      // The kick walks him back a step.
      { at: 1.12, p: mk(st, { ...brace, pitch: -0.14, torRx: -0.2, rootZ: -0.2, hipZ: -0.06, aRx: 0.3, wRx: -0.55, lRx: 0.45, kR: 0.4, lLx: -0.5, kL: 0.2, mouth: 0.5, lid: 0.7 }), e: easeOut3 },
      { at: 1.55, p: mk(st, { rootZ: -0.08, pitch: -0.04, wRx: -0.15, headRx: 0.15 }), e: inOut },
      { at: 2, p: st, e: backOut }
    ], { trail: null, heavy: true, tail: 0.5, strike: 0.02, tense: 0.2 })]
  },

  bow: (st) => {
    const nock: Spec = { aRx: -1.5, aRz: 0.1, eR: 0.1, aLx: -1.45, aLz: 0.0, eL: 0.15, brow: -0.4 }
    const draw: Spec = { ...BACK, torRy: -0.5, headRy: 0.45, torRx: -0.05, aRx: -1.5, aRz: 0.1, eR: 0.05, aLx: -1.0, aLz: 0.7, eL: 2.3, brow: -0.7, lid: 0.3 }
    return [clip([
      { at: 0, p: st, e: lin },
      { at: 0.32, p: mk(st, nock), e: easeOut },
      { at: 0.82, p: mk(st, draw), e: inOut },
      { at: 1, p: mk(st, draw, 1.06), e: lin },
      // The string hand flies back off the release; the bow tips forward.
      { at: 1.08, p: mk(st, { ...draw, aLx: -0.6, aLz: 1.1, eL: 1.7, aRx: -1.6, wRx: 0.3, lid: 0 }), e: easeOut3 },
      // A hand over the shoulder for the next arrow.
      { at: 1.5, p: mk(st, { aRx: -0.9, eR: 0.3, aLx: 0, aLz: 2.4, aLy: -0.6, eL: 1.4, torRy: -0.2 }), e: inOut },
      { at: 2, p: st, e: inOut }
    ], { trail: null, strike: 0.02, tense: 0.25 })]
  },

  sling: st => [clip([
    { at: 0, p: st, e: lin },
    // Wound up overhead: two turns of the wrist.
    { at: 0.9, p: mk(st, { ...BACK, torRy: 0.5, headRy: -0.4, ...R0, aRz: 2.4, aRy: -0.3, eR: 0.4, wRx: -12.5, aLx: -1.1, eL: 0.3, brow: -0.7 }), e: lin },
    { at: 1, p: mk(st, { ...STEP, rootZ: 0.12, torRy: -0.5, headRy: 0.3, ...R0, aRz: 1.9, aRy: 1.0, eR: 0.1, wRx: -12.0, aLx: 0.6, aLz: 0.4, mouth: 0.8, brow: -0.9 }), e: easeOut },
    { at: 1.2, p: mk(st, { ...STEP, rootZ: 0.14, torRy: -0.7, ...R0, aRz: 1.0, aRy: 1.6, eR: 0.2, wRx: -11.6, aLx: 0.8 }), e: easeOut3 },
    { at: 2, p: mk(st, { wRx: -12.566 }), e: inOut }
  ], { trail: [1.1, 1.3], strike: 0.3 })],

  scythe: st => [
    // The reap: low, wide, right to left.
    swing(st, sweep({ pitch: 0.04, wRx: 3.0, aLx: -1.1, aLz: -0.5, aLy: 0.2, eL: 0.9 }), { heavy: true, tail: 0.5, tense: 0.3, trail: [1.16, 1.38] }),
    // Back the other way, rising.
    swing(st, {
      antic: { ...BACK, ...GRIM, pitch: 0.08, torRy: -0.9, hipRy: -0.3, headRy: 0.7, ...R0, aRz: 1.1, aRy: 2.4, eR: 0.6, wRx: 2.6, aLx: -0.9, aLz: 0.3, aLy: 0.7, eL: 0.8 },
      hit: { ...STEP, ...SHOUT, torRy: 0.55, hipRy: 0.25, headRy: -0.4, ...R0, aRz: 1.45, aRy: 1.2, eR: 0.1, wRx: 2.4, aLx: -1.3, aLz: -0.3, aLy: 0.3, eL: 0.5 },
      over: { ...STEP_OVER, brow: -1, mouth: 0.6, pitch: 0.06, torRy: 0.95, hipRy: 0.35, headRy: -0.6, ...R0, aRz: 1.9, aRy: 0.0, eR: 0.3, wRx: 2.4, aLx: -1.5, aLz: -0.5, eL: 0.7 }
    }, { heavy: true, tail: 0.5, tense: 0.3, trail: [1.16, 1.38] })
  ],

  flask: st => [
    // An overarm lob.
    swing(st, {
      antic: { ...BACK, torRy: 0.6, headRy: -0.45, ...R0, aRz: 1.7, aRy: -0.8, eR: 0.7, aLx: -1.2, aLz: 0.2, eL: 0.2, brow: -0.6 },
      hit: { ...STEP, rootZ: 0.14, torRy: -0.5, headRy: 0.3, ...R0, aRz: 2.0, aRy: 0.9, eR: 0.15, wRx: 1.2, aLx: 0.6, aLz: 0.5, eL: 0.5, mouth: 0.8, brow: -0.8 },
      over: { ...STEP, rootZ: 0.16, torRy: -0.75, pitch: 0.16, ...R0, aRz: 0.9, aRy: 1.6, eR: 0.2, wRx: 1.6, aLx: 0.8, mouth: 0.4 }
    }, { trail: [1.15, 1.35] })
  ],

  unarmed: st => [
    // A jab off the front hand.
    swing(st, {
      antic: { ...GRIM, torRy: -0.25, headRy: 0.2, aLx: -0.2, eL: 2.2, hipZ: -0.03 },
      hit: { rootZ: 0.14, pitch: 0.1, lLx: -0.45, kL: 0.6, lRx: 0.3, torRy: 0.5, headRy: -0.35, aLx: -1.5, aLz: 0.05, eL: 0.05, mouth: 0.7, brow: -1 },
      over: { rootZ: 0.16, pitch: 0.12, lLx: -0.45, kL: 0.6, lRx: 0.3, torRy: 0.58, aLx: -1.55, aLz: 0.05, eL: 0.02, mouth: 0.3 }
    }, { strike: 0.06, trail: null, trailOff: true }),
    // The cross behind it: the back hip drives through.
    swing(st, {
      antic: { ...BACK, ...GRIM, torRy: 0.7, hipRy: 0.3, headRy: -0.55, aRx: 0.3, eR: 2.2, aLx: -1.0, eL: 1.4 },
      hit: { ...STEP, ...SHOUT, torRy: -0.65, hipRy: -0.3, headRy: 0.35, aRx: -1.5, aRz: 0.05, eR: 0.05, aLx: -0.3, eL: 2.0 },
      over: { ...STEP_OVER, brow: -1, mouth: 0.5, torRy: -0.85, hipRy: -0.38, headRy: 0.45, aRx: -1.6, aRz: 0.0, eR: 0.02, aLx: -0.2, eL: 2.0 }
    }, { strike: 0.07 })
  ]
}

// ─── Casts: the hero's skill families and the enemies' abilities ─────────────

const CASTS: Record<CastName, (st: Pose) => Clip> = {
  // Both arms to the sky, a jump, and the ground takes it.
  slam: st => swing(st, {
    antic: { ...HALF_SQUAT, ...GRIM, torRx: -0.2, pitch: -0.08, headRx: -0.2, torRy: 0, ...R0, aRz: 2.5, eR: 0.2, wRx: 2.6, wRy: 0, ...L0, aLz: 2.5, eL: 0.2 },
    hit: { ...SQUAT, ...SHOUT, torRx: 0.4, pitch: 0.22, headRx: -0.25, torRy: 0, aRx: -1.0, aRy: 0, aRz: 0.3, eR: 0.15, wRx: 2.0, wRy: 0, aLx: -1.0, aLy: 0, aLz: 0.3, eL: 0.15, hipY: -0.02 },
    over: { ...SQUAT, brow: -1, mouth: 0.7, torRx: 0.46, pitch: 0.26, headRx: -0.2, torRy: 0, aRx: -0.7, aRy: 0, aRz: 0.3, eR: 0.3, wRx: 2.3, wRy: 0, aLx: -0.7, aLy: 0, aLz: 0.3, eL: 0.3, hipY: -0.05 }
  }, { heavy: true, tail: 0.5, tense: 0.6, hop: 0.38, strike: 0.12, trail: [1.12, 1.3] }),

  // Down into a sprinter's crouch, then out of it.
  dash: st => swing(st, {
    antic: { ...SQUAT, ...GRIM, pitch: 0.22, torRy: 0.4, headRx: -0.3, ...R0, aRz: 1.3, aRy: -0.8, eR: 0.9, wRx: 1.6, wRy: 0, aLx: -0.9, eL: 1.1, rootZ: -0.08 },
    hit: { ...STEP_OVER, ...SHOUT, pitch: 0.24, rootZ: 0.45, torRy: -0.6, headRy: 0.3, ...R0, aRz: 1.2, aRy: 1.5, eR: 0.1, wRx: 1.8, wRy: 0, aLx: 0.95, aLz: 0.5, eL: 0.6 },
    over: { ...STEP_OVER, brow: -1, mouth: 0.5, pitch: 0.26, rootZ: 0.5, torRy: -0.95, headRy: 0.45, ...R0, aRz: 0.9, aRy: 2.3, eR: 0.3, wRx: 1.9, wRy: 0, aLx: 1.0, aLz: 0.6, eL: 0.7 }
  }, { tail: 0.36, strike: 0.06 }),

  // Thrown with the free hand: the weapon stays where it is.
  throw: st => swing(st, {
    antic: { ...BACK, torRy: -0.6, headRy: 0.45, ...L0, aLz: 1.7, aLy: -0.8, eL: 0.7, brow: -0.6 },
    hit: { ...STEP, rootZ: 0.14, torRy: 0.5, headRy: -0.3, ...L0, aLz: 2.0, aLy: 0.9, eL: 0.15, mouth: 0.8, brow: -0.8 },
    over: { ...STEP, rootZ: 0.16, pitch: 0.16, torRy: 0.75, ...L0, aLz: 0.9, aLy: 1.6, eL: 0.2, mouth: 0.4 }
  }, { trail: null, tail: 0.36 }),

  // Dashed against the ground at his own feet.
  throwDown: st => swing(st, {
    antic: { ...L0, aLz: 2.5, eL: 0.3, torRx: -0.1, headRx: -0.2, hipY: 0.03, brow: -0.6 },
    hit: { ...HALF_SQUAT, pitch: 0.14, torRx: 0.2, aLx: -0.6, aLy: 0, aLz: 0.3, eL: 0.1, mouth: 0.6, brow: -0.8 },
    over: { ...HALF_SQUAT, pitch: 0.16, torRx: 0.24, aLx: -0.3, aLy: 0, aLz: 0.4, eL: 0.2, lid: 0.6 }
  }, { trail: null, tail: 0.3 }),

  // Arms to the sky, held, trembling.
  channel: st => held(st, {
    antic: { torRx: -0.16, pitch: -0.05, headRx: -0.3, torRy: 0, ...R0, aRz: 2.3, aRy: 0.2, eR: 0.3, wRx: 2.6, wRy: 0, ...L0, aLz: 2.3, aLy: 0.2, eL: 0.3, lLz: 0.1, lRz: 0.1, mouth: 0.5, brow: 0.4, hipY: 0.02 },
    hit: { torRx: -0.22, pitch: -0.06, headRx: -0.35, torRy: 0, ...R0, aRz: 1.95, aRy: 0.5, eR: 0.1, wRx: 2.4, wRy: 0, ...L0, aLz: 1.95, aLy: 0.5, eL: 0.1, lLz: 0.14, lRz: 0.14, mouth: 1, brow: -0.6, hipY: 0.04 },
    over: { torRx: -0.26, pitch: -0.07, headRx: -0.38, torRy: 0, ...R0, aRz: 1.85, aRy: 0.6, eR: 0.08, wRx: 2.3, wRy: 0, ...L0, aLz: 1.85, aLy: 0.6, eL: 0.08, lLz: 0.14, lRz: 0.14, mouth: 0.8, brow: -0.6, hipY: 0.03 }
  }, { tense: 1, tail: 0.5 }),

  // The weapon to the sky, then down, pointing where they must rise.
  summon: st => swing(st, {
    antic: { torRx: -0.12, headRx: -0.3, ...R0, aRz: 2.6, eR: 0.1, wRx: 2.6, wRy: 0, aLx: -0.3, aLz: 0.3, eL: 1.0, brow: 0.3, hipY: 0.03 },
    hit: { ...HALF_SQUAT, pitch: 0.08, torRx: 0.15, headRx: -0.05, aRx: -1.1, aRy: 0, aRz: 0.3, eR: 0.1, wRx: 2.1, wRy: 0, aLx: 0.4, aLz: 0.5, eL: 0.4, mouth: 1, brow: -0.8 },
    over: { ...HALF_SQUAT, pitch: 0.1, torRx: 0.2, aRx: -0.95, aRy: 0, aRz: 0.3, eR: 0.15, wRx: 2.25, wRy: 0, aLx: 0.5, aLz: 0.6, mouth: 0.6 }
  }, { tense: 0.5, tail: 0.42, trail: [1.15, 1.4] }),

  // Curled in, then the chest thrown open: a shout that carries.
  shout: st => held(st, {
    antic: { ...HALF_SQUAT, torRx: 0.22, pitch: 0.06, headRx: 0.3, torRy: 0, aRx: 0.3, aRz: 0.2, eR: 1.7, aLx: 0.3, aLy: 0, aLz: 0.2, eL: 1.7, brow: -1, lid: 0.5 },
    hit: { torRx: -0.3, pitch: -0.08, headRx: -0.42, torRy: 0, aRx: 0.5, aRz: 0.95, eR: 0.9, aLx: 0.5, aLy: 0, aLz: 0.95, eL: 0.9, lLz: 0.18, lRz: 0.18, kL: 0.2, kR: 0.2, mouth: 1, brow: -1, hipY: 0.02 },
    over: { torRx: -0.36, pitch: -0.1, headRx: -0.46, torRy: 0, aRx: 0.55, aRz: 1.05, eR: 0.8, aLx: 0.55, aLy: 0, aLz: 1.05, eL: 0.8, lLz: 0.18, lRz: 0.18, kL: 0.2, kR: 0.2, mouth: 1, brow: -1 }
  }, { tense: 0.4, tail: 0.5 }),

  // The shield up, the weapon planted: nothing passes.
  ward: st => held(st, {
    antic: { aLx: -1.3, aLy: 0.9, aLz: 0.1, eL: 1.2, ...R0, aRz: 2.4, eR: 0.2, wRx: 2.6, wRy: 0, torRx: -0.08, headRx: -0.15, brow: -0.8 },
    hit: { ...HALF_SQUAT, pitch: 0.06, aLx: -1.0, aLy: 0.95, aLz: 0.1, eL: 1.5, aRx: -1.0, aRy: 0, aRz: 0.3, eR: 0.3, wRx: 3.2, wRy: 0, torRx: 0.08, headRx: 0.05, mouth: 0.5, brow: -1 },
    over: { ...HALF_SQUAT, pitch: 0.08, aLx: -1.0, aLy: 0.95, aLz: 0.1, eL: 1.5, aRx: -0.9, aRy: 0, aRz: 0.3, eR: 0.35, wRx: 3.25, wRy: 0, torRx: 0.1, headRx: 0.06, brow: -1 }
  }, { tail: 0.45 }),

  // A hand drawn down the blade, and flicked clean.
  buff: st => swing(st, {
    antic: { aRx: -1.2, aRz: 0.1, eR: 1.4, wRx: 0.6, wRy: 0, aLx: -1.2, aLz: 0.0, eL: 1.5, headRx: 0.2, torRx: 0.06, brow: -0.5 },
    hit: { ...R0, aRz: 1.9, aRy: 0.5, eR: 0.3, wRx: 2.4, wRy: 0, aLx: -0.6, aLz: 1.1, eL: 0.3, headRx: -0.15, torRx: -0.08, mouth: 0.5, brow: -0.8 },
    over: { ...R0, aRz: 2.05, aRy: 0.5, eR: 0.2, wRx: 2.5, wRy: 0, aLx: -0.5, aLz: 1.2, eL: 0.25, headRx: -0.2, mouth: 0.3 }
  }, { tail: 0.36, trail: [1.1, 1.3] }),

  // Arms out and the whole body round, twice.
  whirl: st => clip([
    { at: 0, p: st, e: lin },
    { at: 0.9, p: mk(st, { ...HALF_SQUAT, ...GRIM, pitch: 0.12, spin: -1.2, ...R0, aRz: 1.2, eR: 0.3, wRx: LINE, wRy: 0, ...L0, aLz: 1.2, eL: 0.3, oRx: LINE, oRy: 0 }), e: easeOut },
    { at: 1, p: mk(st, { ...HALF_SQUAT, ...SHOUT, pitch: 0.1, spin: 3.2, ...R0, aRz: 1.45, eR: 0.1, wRx: LINE, wRy: 0, ...L0, aLz: 1.45, eL: 0.1, oRx: LINE, oRy: 0 }), e: snap },
    { at: 1.6, p: mk(st, { ...HALF_SQUAT, brow: -1, mouth: 0.6, pitch: 0.08, spin: 11.2, ...R0, aRz: 1.45, eR: 0.1, wRx: LINE, wRy: 0, ...L0, aLz: 1.45, eL: 0.1, oRx: LINE, oRy: 0 }), e: lin },
    { at: 2, p: mk(st, { spin: 12.566 }), e: easeOut3 }
  ], { tail: 0.6, trail: [1.6, 1.95], trailOff: true, strike: 0.08 }),

  // Drawn back to the shoulder, then driven at the target.
  beam: st => swing(st, {
    antic: { ...BACK, torRy: 0.5, headRy: -0.4, aRx: 0.3, aRz: 0.3, aRy: 0, eR: 1.9, aLx: -1.3, aLz: 0.15, eL: 0.3, brow: -0.7 },
    hit: { rootZ: 0.1, pitch: 0.1, lLx: -0.45, kL: 0.55, lRx: 0.35, torRy: -0.45, headRy: 0.3, aRx: -1.5, aRz: 0.05, aRy: 0, eR: 0.05, aLx: -0.4, aLz: 0.4, eL: 1.0, mouth: 1, brow: -0.9 },
    over: { rootZ: 0.02, pitch: 0.02, torRy: -0.3, aRx: -1.7, aRz: 0.2, aRy: 0, eR: 0.3, aLx: -0.3, aLz: 0.5, eL: 1.0, mouth: 0.5 }
  }, { trail: null, tail: 0.36 }),

  // Hands to the ground, then pulled up out of it.
  raise: st => swing(st, {
    antic: { ...SQUAT, pitch: 0.2, torRx: 0.25, headRx: -0.2, torRy: 0, aRx: -0.7, aRy: 0, aRz: 0.3, eR: 0.2, wRx: 2.4, wRy: 0, aLx: -0.7, aLy: 0, aLz: 0.3, eL: 0.2, brow: -0.7 },
    hit: { pitch: -0.07, torRx: -0.2, headRx: -0.3, torRy: 0, ...R0, aRz: 2.4, eR: 0.3, wRx: 2.6, wRy: 0, ...L0, aLz: 2.4, eL: 0.3, hipY: 0.03, lLz: 0.1, lRz: 0.1, mouth: 1, brow: -0.9 },
    over: { pitch: -0.1, torRx: -0.24, headRx: -0.34, torRy: 0, ...R0, aRz: 2.55, eR: 0.2, wRx: 2.6, wRy: 0, ...L0, aLz: 2.55, eL: 0.2, hipY: 0.04, mouth: 0.6 }
  }, { tense: 0.5, hop: 0.1, tail: 0.42, trail: null }),

  // Arms crossed on the chest, then flung wide.
  burst: st => swing(st, {
    antic: { ...HALF_SQUAT, torRx: 0.18, headRx: 0.25, torRy: 0, aRx: -1.0, aRy: 0, aRz: -0.7, eR: 1.9, aLx: -1.0, aLy: 0, aLz: -0.7, eL: 1.9, brow: -0.8, lid: 0.6 },
    hit: { torRx: -0.22, headRx: -0.3, torRy: 0, aRx: -0.5, aRy: 0, aRz: 1.4, eR: 0.1, wRx: LINE, wRy: 0, aLx: -0.5, aLy: 0, aLz: 1.4, eL: 0.1, lLz: 0.16, lRz: 0.16, mouth: 1, brow: -0.9, hipY: 0.03 },
    over: { torRx: -0.27, headRx: -0.34, torRy: 0, aRx: -0.4, aRy: 0, aRz: 1.55, eR: 0.05, wRx: LINE, wRy: 0, aLx: -0.4, aLy: 0, aLz: 1.55, eL: 0.05, lLz: 0.16, lRz: 0.16, mouth: 0.6 }
  }, { tense: 0.6, tail: 0.4, trail: null }),

  // "That one."
  point: st => swing(st, {
    antic: { torRy: -0.3, headRy: 0.2, aLx: -0.4, aLy: 0, aLz: 0.3, eL: 1.9, brow: -0.6 },
    hit: { rootZ: 0.05, torRy: 0.4, headRy: -0.3, aLx: -1.5, aLy: 0, aLz: 0.05, eL: 0.05, mouth: 0.9, brow: -0.9 },
    over: { rootZ: 0.06, torRy: 0.48, headRy: -0.35, aLx: -1.56, aLy: 0, aLz: 0.05, eL: 0.02, mouth: 0.5 }
  }, { trail: null, tail: 0.4 }),

  // Raised in both hands and driven into the earth.
  plant: st => swing(st, {
    antic: { torRx: -0.14, headRx: -0.25, torRy: 0, ...R0, aRz: 2.5, eR: 0.2, wRx: 2.6, wRy: 0, ...L0, aLz: 2.3, eL: 0.3, hipY: 0.03, brow: -0.7 },
    hit: { ...HALF_SQUAT, pitch: 0.15, torRx: 0.2, headRx: -0.15, torRy: 0, aRx: -0.8, aRy: 0, aRz: 0.25, eR: 0.3, wRx: 3.2, wRy: 0, aLx: -0.9, aLy: 0, aLz: 0.25, eL: 0.5, mouth: 0.8, brow: -0.9 },
    over: { ...HALF_SQUAT, pitch: 0.18, torRx: 0.24, torRy: 0, aRx: -0.7, aRy: 0, aRz: 0.25, eR: 0.35, wRx: 3.3, wRy: 0, aLx: -0.8, aLy: 0, aLz: 0.25, eL: 0.6, mouth: 0.4 }
  }, { heavy: true, tail: 0.42, trail: [1.15, 1.4] }),

  // Arms wide to take it, then the hands to the chest.
  drain: st => held(st, {
    antic: { torRx: -0.12, headRx: -0.15, torRy: 0, aRx: -0.5, aRy: 0, aRz: 1.45, eR: 0.1, aLx: -0.5, aLy: 0, aLz: 1.45, eL: 0.1, lLz: 0.1, lRz: 0.1, brow: 0.3 },
    hit: { torRx: 0.12, headRx: 0.2, torRy: 0, aRx: -1.0, aRy: 0, aRz: -0.4, eR: 2.0, aLx: -1.0, aLy: 0, aLz: -0.4, eL: 2.0, mouth: 0.5, lid: 0.7, brow: -0.4 },
    over: { torRx: 0.16, headRx: 0.24, torRy: 0, aRx: -1.0, aRy: 0, aRz: -0.5, eR: 2.1, aLx: -1.0, aLy: 0, aLz: -0.5, eL: 2.1, mouth: 0.3, lid: 0.8 }
  }, { tail: 0.45 }),

  // A hand to the sky, and the sky is told where.
  call: st => swing(st, {
    antic: { torRx: -0.12, headRx: -0.36, ...L0, aLz: 2.6, eL: 0.1, brow: 0.3, hipY: 0.02 },
    hit: { pitch: 0.07, torRx: 0.14, headRx: -0.05, aLx: -1.35, aLy: 0, aLz: 0.2, eL: 0.05, mouth: 1, brow: -0.9, rootZ: 0.04 },
    over: { pitch: 0.09, torRx: 0.18, aLx: -1.15, aLy: 0, aLz: 0.2, eL: 0.05, mouth: 0.6 }
  }, { tense: 0.5, trail: null, tail: 0.42 }),

  // The shield led by the shoulder, through the target.
  bash: st => swing(st, {
    antic: { ...BACK, ...GRIM, torRy: -0.65, hipRy: -0.25, headRy: 0.5, aLx: 0.3, aLy: 0.9, aLz: 0.2, eL: 1.6, aRx: -0.2, eR: 1.1 },
    hit: { ...STEP_OVER, ...SHOUT, rootZ: 0.32, torRy: 0.7, hipRy: 0.3, headRy: -0.4, aLx: -1.4, aLy: 0.7, aLz: 0.05, eL: 0.5, aRx: 0.5, aRz: 0.5, eR: 0.9 },
    over: { ...STEP_OVER, brow: -1, mouth: 0.6, rootZ: 0.36, pitch: 0.2, torRy: 0.9, hipRy: 0.36, headRy: -0.5, aLx: -1.5, aLy: 0.6, aLz: 0.05, eL: 0.35, aRx: 0.6, aRz: 0.6, eR: 0.9 }
  }, { heavy: true, trail: null, trailOff: true, tail: 0.42 }),

  // One great overhead blow.
  strike: st => swing(st, smash(), { heavy: true, tail: 0.46, tense: 0.4, hop: 0.12, trail: [1.14, 1.34] }),

  // A wide level cleave, the back wound up like a spring.
  cleave: st => swing(st, sweep({ torRy: 1.1, hipRy: 0.42, headRy: -0.85, aRy: -0.8 }), { heavy: true, tail: 0.5, tense: 0.6, trail: [1.16, 1.38], strike: 0.12 }),

  // A long breath in, leaning back; then all of it out.
  breath: st => held(st, {
    antic: { torRx: -0.3, pitch: -0.12, headRx: -0.4, torRy: 0, hipZ: -0.05, aRx: 0.6, aRz: 0.5, eR: 0.6, aLx: 0.6, aLy: 0, aLz: 0.5, eL: 0.6, mouth: 0.25, brow: 0.2, lLz: 0.1, lRz: 0.1 },
    hit: { torRx: 0.3, pitch: 0.16, headRx: 0.0, torRy: 0, rootZ: 0.1, lLx: -0.5, kL: 0.7, lRx: 0.4, aRx: 0.9, aRz: 0.6, eR: 0.3, aLx: 0.9, aLy: 0, aLz: 0.6, eL: 0.3, mouth: 1, brow: -1 },
    over: { torRx: 0.33, pitch: 0.18, headRx: 0.02, torRy: 0, rootZ: 0.12, lLx: -0.5, kL: 0.7, lRx: 0.4, aRx: 0.95, aRz: 0.65, eR: 0.3, aLx: 0.95, aLy: 0, aLz: 0.65, eL: 0.3, mouth: 1, brow: -1 }
  }, { tense: 0.5, tail: 0.5 }),

  // The shoulder dropped, a foot scraped back; then gone.
  charge: st => held(st, {
    antic: { ...GRIM, pitch: 0.26, torRy: 0.4, headRx: -0.3, headRy: -0.3, aLx: -0.4, aLy: 0, aLz: -0.2, eL: 1.9, aRx: 0.5, eR: 0.8, lRx: 0.5, kR: 0.35, lLx: -0.65, kL: 1.05, rootZ: -0.08 },
    hit: { ...STEP_OVER, ...SHOUT, pitch: 0.32, rootZ: 0.3, torRy: 0.5, headRx: -0.35, headRy: -0.35, aLx: -0.5, aLy: 0, aLz: -0.2, eL: 1.9, aRx: 0.9, eR: 0.5 },
    over: { ...STEP_OVER, brow: -1, mouth: 0.8, pitch: 0.28, rootZ: 0.2, torRy: 0.5, headRx: -0.3, headRy: -0.3, aLx: -0.5, aLy: 0, aLz: -0.2, eL: 1.8, aRx: 0.9, eR: 0.5 }
  }, { tense: 0.8, tail: 0.5 }),

  // Hands gathered at the chest, then both thrown forward and HELD.
  line: st => held(st, {
    antic: { ...WIDE, torRx: -0.08, headRx: 0.1, torRy: 0, aRx: -1.3, aRy: 0, aRz: -0.1, eR: 1.3, aLx: -1.3, aLy: 0, aLz: -0.1, eL: 1.3, brow: -0.8 },
    hit: { ...WIDE, pitch: 0.08, rootZ: -0.05, torRy: 0, aRx: -1.5, aRy: 0, aRz: 0.0, eR: 0.05, wRx: LINE, wRy: 0, aLx: -1.5, aLy: 0, aLz: 0.0, eL: 0.05, mouth: 1, brow: -1 },
    over: { ...WIDE, pitch: 0.05, rootZ: -0.08, torRx: -0.05, torRy: 0, aRx: -1.52, aRy: 0, aRz: 0.0, eR: 0.08, wRx: LINE, wRy: 0, aLx: -1.52, aLy: 0, aLz: 0.0, eL: 0.08, mouth: 1, brow: -1 }
  }, { tense: 0.9, tail: 0.5 }),

  // A chest: down on one knee, both hands on the lid, and up with it.
  open: st => clip([
    { at: 0, p: st, e: lin },
    { at: 0.5, p: mk(st, { ...SQUAT, lLx: -1.0, kL: 1.5, lRx: 0.2, kR: 1.5, pitch: 0.2, torRx: 0.25, torRy: 0, headRx: 0.25, headRy: 0, aRx: -0.9, aRy: 0, aRz: 0.1, eR: 0.4, wRx: 2.6, wRy: 0.8, aLx: -0.9, aLy: 0, aLz: 0.1, eL: 0.4, brow: 0.3 }), e: easeOut },
    { at: 0.999, p: mk(st, { ...SQUAT, lLx: -1.0, kL: 1.5, lRx: 0.2, kR: 1.5, pitch: 0.22, torRx: 0.28, torRy: 0, headRx: 0.28, headRy: 0, aRx: -0.95, aRy: 0, aRz: 0.1, eR: 0.5, wRx: 2.6, wRy: 0.8, aLx: -0.95, aLy: 0, aLz: 0.1, eL: 0.5, brow: 0.3 }), e: inOut },
    // The lid comes up: so do his hands, his head and his eyebrows.
    { at: 1, p: mk(st, { ...HALF_SQUAT, pitch: 0.06, torRx: 0.0, torRy: 0, headRx: -0.2, headRy: 0, aRx: -1.4, aRy: 0, aRz: 0.5, eR: 0.5, wRx: 2.6, wRy: 0.8, aLx: -1.4, aLy: 0, aLz: 0.5, eL: 0.5, brow: 1, mouth: 0.8, hipY: 0.02 }), e: backOut },
    { at: 1.5, p: mk(st, { ...HALF_SQUAT, pitch: 0.04, torRy: 0, headRx: -0.15, headRy: 0, aRx: -1.2, aRy: 0, aRz: 0.9, eR: 0.3, wRx: 2.4, wRy: 0.6, aLx: -1.2, aLy: 0, aLz: 0.9, eL: 0.3, brow: 1, mouth: 0.6 }), e: easeOut },
    { at: 2, p: st, e: inOut }
  ], { trail: null, strike: 0.12, tail: 0.45 }),

  // Coiled to the ground, into the air, and down on them.
  leap: st => swing(st, {
    antic: { ...SQUAT, ...GRIM, pitch: 0.2, headRx: -0.3, torRy: 0, aRx: 0.8, aRy: 0, aRz: 0.4, eR: 0.4, aLx: 0.8, aLy: 0, aLz: 0.4, eL: 0.4, hipY: -0.03 },
    hit: { ...SQUAT, ...SHOUT, pitch: 0.24, torRx: 0.3, headRx: -0.25, torRy: 0, aRx: -0.9, aRy: 0, aRz: 0.35, eR: 0.2, wRx: 2.0, wRy: 0, aLx: -0.9, aLy: 0, aLz: 0.35, eL: 0.2 },
    over: { ...SQUAT, brow: -1, mouth: 0.6, pitch: 0.27, torRx: 0.35, torRy: 0, aRx: -0.7, aRy: 0, aRz: 0.35, eR: 0.3, wRx: 2.3, wRy: 0, aLx: -0.7, aLy: 0, aLz: 0.35, eL: 0.3, hipY: -0.05 }
  }, { heavy: true, tail: 0.5, tense: 0.5, hop: 1.5, strike: 0.36, trail: [1.12, 1.3] })
}

// ─── Sets ────────────────────────────────────────────────────────────────────

const L_ARM = ['aLx', 'aLy', 'aLz', 'eL'] as const

const sets = new Map<string, ClipSet>()

/** The stance, attacks and casts of one way of carrying a weapon. */
export const clipSet = (style: Style, shield: boolean, dual: boolean): ClipSet => {
  const key = `${style}|${shield ? 1 : 0}|${dual ? 1 : 0}`
  let s = sets.get(key)
  if (s) return s
  const stance = mk(mk(null, REST), { ...STANCE[style], ...(shield ? SHIELD_ARM : {}) })
  const attacks = ATTACKS[style](stance, dual)
  if (shield) for (const c of attacks) guard(c, stance)
  s = { stance, attacks, casts: {}, style, shield, dual }
  sets.set(key, s)
  return s
}

/** A shield stays between its bearer and the enemy: the left arm keeps most of its guard through a swing. */
const guard = (c: Clip, st: Pose): void => {
  for (const k of c.keys) {
    if (k.p === st) continue
    const spec: Spec = {}
    for (const ch of L_ARM) spec[ch] = st[I[ch]]!
    k.p = mk(k.p, spec, 0.72)
  }
}

export const castClip = (set: ClipSet, name: CastName): Clip => {
  let c = set.casts[name]
  if (!c) {
    c = CASTS[name](set.stance)
    if (set.shield && name !== 'bash' && name !== 'ward') guard(c, set.stance)
    set.casts[name] = c
  }
  return c
}

/** How a unit carries what it holds. `magic` / `ranged` is its basic attack's kind. */
export const styleOf = (held: Held, off: OffHand, atk: 'melee' | 'ranged' | 'magic'): Style => {
  switch (held) {
    case 'sword': return 'sword'
    case 'dagger': return 'dagger'
    case 'greatsword': return 'great'
    case 'axe':
    case 'hammer':
    case 'club': return 'heavy'
    case 'staff': return atk === 'melee' ? 'heavy' : 'staff'
    case 'wand': return atk === 'melee' ? 'unarmed' : 'wand'
    case 'gun': return 'gun'
    case 'cannon': return 'cannon'
    case 'bow': return 'bow'
    case 'sling': return 'sling'
    case 'scythe': return atk === 'melee' ? 'scythe' : 'staff'
    case 'flask': return 'flask'
    default: return atk === 'melee' ? 'unarmed' : off === 'gun' ? 'gun' : 'caster'
  }
}

/** The hero's skills, each to the family of cast it reads as. */
export const SKILL_CAST: Readonly<Record<string, CastName>> = {
  shieldSlam: 'bash', radiantStrike: 'strike', tauntingCry: 'shout', holyBastion: 'ward',
  shadowstep: 'dash', venomousBlade: 'buff', smokeBomb: 'throwDown', danceOfBlades: 'whirl',
  fireball: 'beam', flamePillar: 'raise', combustion: 'burst', cataclysm: 'channel',
  royalGuard: 'summon', commandFocus: 'point', bannerOfVictory: 'plant', armyOfTheRealm: 'summon',
  temporalStasis: 'beam', hasteField: 'burst', paradoxShift: 'dash', chronoRewind: 'burst',
  sanguineFlask: 'throw', essenceHarvest: 'drain', mutagenicRage: 'shout', philosophersCrucible: 'plant',
  aetherPistol: 'beam', deployTurret: 'throwDown', ventHeat: 'line', orbitalBeam: 'call', exoSuit: 'shout',
  stoneSpike: 'raise', earthBarrier: 'raise', seismicShock: 'slam', petrify: 'beam', tectonicRupture: 'slam'
}

/** Enemy abilities (`AbilityKind`), each to its cast. A cone is a cleave unless it is breathed. */
export const ABILITY_CAST: Readonly<Record<string, CastName>> = {
  slam: 'slam', smash: 'call', cone: 'cleave', charge: 'charge', line: 'line', shot: 'beam', volley: 'beam',
  lob: 'throw', barrage: 'channel', leap: 'leap', blink: 'strike', summon: 'summon', heal: 'raise', enrage: 'shout'
}
