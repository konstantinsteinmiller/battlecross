/**
 * ─── The alternative tutorial level (`/#/alt-tutorial`) ───────────────────────
 *
 * A playtester found the first level short and quiet. The stretched version keeps its length (about three and a half
 * minutes) and adds small fights, in this order along the one road:
 *
 *   1. two goblins            (the dummy's graduates: move, target, strike on live foes)
 *   2. the ambush (#218)      three bandit raiders in broken-down wagons, sprung by a trapdoor: the lane charge teaches the dodge
 *                             roll, the cone the shield bash
 *   3. three goblins          (a breather with a slinger: the potion, the skill)
 *   4. the four with the key  (as in the first level, the palisade gate)
 *   5. the Bandit Chief, then the cage and the teachers.
 *
 * It is the first level every fresh save plays (`flow.ts`).
 */

/** Sections of the stretched road (the first level has 3). */
export const ALT_SECTIONS = 5

/** The kinds of the packs along the stretched road, section by section (the finale and the four with the key are the first level's own). */
export const ALT_PACKS: Readonly<Record<number, readonly string[]>> = {
  1: ['goblin', 'goblin'],
  3: ['goblin', 'goblin', 'goblinSlinger']
}

/** The ambush's section and its raiders (#218). */
export const ALT_AMBUSH_SECTION = 2
export const ALT_AMBUSH_KINDS: readonly string[] = ['banditRaider', 'banditRaider', 'banditRaider']
/** The hero this close to the trapdoor's middle (on the hatch) makes it open, metres. */
export const TRAP_RADIUS = 1.6
/** The pit once open: nobody walks into it, metres from the middle. */
export const TRAP_HOLE_R = 2.5
/** From the first crack to the hatch giving way, seconds (the dodge roll gets the hero out in this time). */
export const TRAP_CRACK_S = 1.0
/** How far open the hatch is when the dodge lesson stops the world (0..1), and the seconds it takes to get there. */
export const TRAP_HOLD_OPEN = 0.35
export const TRAP_HOLD_S = 0.2
/** The trapdoor's side, metres (a "huge" one: two leaves, each half of it). */
export const TRAP_SIZE = 3.4

