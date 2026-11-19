/**
 * ─── Starting the colosseum part of the way up (roadmap #230) ────────────────
 *
 * The ladder began at wave 1 every time, so a hero who had reached wave 20 once had to fight 19 easy waves again to go on.
 * From the second visit the gate offers the start the hero's power warrants. It is the best wave reached so far less three,
 * held down by what the build can do: the sum of its attributes, the high-level skills it knows and the passives it wears.
 * A weak build is not thrown into a wave it has outgrown (its best came from a better build, a better week).
 */

/** Waves taken off the best wave reached: the start is a few waves before where the hero last fell. */
export const ARENA_START_BACK = 3
/** A skill of this level or above counts as a high-level skill. */
export const ARENA_HIGH_SKILL = 20

export interface ArenaPower {
  /** The total of the six attributes, gear and passives counted. */
  attrs: number
  /** Learned skills of level `ARENA_HIGH_SKILL` or more. */
  highSkills: number
  /** Passive slots filled. */
  passives: number
}

/** The wave a build of this power holds without a fight to spare: more attributes, high skills and passives, a later wave. */
export const powerWave = (p: ArenaPower): number => Math.round(2 + p.attrs / 15 + p.highSkills * 1.5 + p.passives * 2)

/** The wave to offer (1: the ladder from the beginning; nothing to offer). */
export const arenaStartWave = (best: number, p: ArenaPower): number =>
  Math.max(1, Math.min(best - ARENA_START_BACK, powerWave(p)))
