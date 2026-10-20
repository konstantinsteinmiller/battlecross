import { CLASSES, PRESTIGE_IDS, skillsOf, type BaseClassId, type PrestigeId } from './skills'
import { DEMONHUNTER_KEY } from './siege'

/**
 * ─── The prestige classes' trials (docs/gdd-afterplay.md §10, phase 10) ──────
 *
 * Each of the four hybrids is earned by a deed, read off what the save already
 * holds, so nothing new is stored but two world flags (the Leviathan slain, the
 * Elder Dragon slain without falling) and an old save that already did the
 * deed has the class at once:
 *
 *   Demonhunter  a Hard siege won with the gate unharmed (`demonhunterKey`, phase 6)
 *   Dragoon      the Elder Dragon slain without a fall (`dragonDeathless`)
 *   Hexsmith     five Infernal pieces forged (`inv.infernalForged`) and five
 *                Arm-Wrestle wins in a row (`armStreak5`, phase 9)
 *   Tidecaller   the Leviathan slain (`leviathanSlain`, or B8 told) and a Ring
 *                Toss perfect round (`ringPerfect`, phase 9; the GDD's Fishing
 *                Derby record while there is no fishing)
 *
 * A passed trial brings the Mysterious Wanderer to the fort (`WANDERER_FLAG`,
 * derived like the towns' states, never stored). He teaches the class's three
 * skills to a hero who knows a skill of each parent.
 *
 * Pure: no save, no Vue.
 */

/** The flags phase 9's fair games set (`state/fair.ts`; a test holds the two to these). */
export const RING_PERFECT = 'ringPerfect'
export const ARM_STREAK = 'armStreak5'
/** The Leviathan was slain (any visit). B8 says the same for a save from before. */
export const LEVIATHAN_SLAIN = 'leviathanSlain'
/** The Elder Dragon was slain in a visit with no fall in it (no Second wind taken). */
export const DRAGON_DEATHLESS = 'dragonDeathless'
/** Infernal pieces the Hexsmith's trial asks to be forged. */
export const HEX_FORGED = 5

/** Derived: a trial is passed, the Wanderer is at the fort. */
export const WANDERER_FLAG = 'wandererCame'
/** Derived: this class's trial is passed. */
export const trialFlag = (cls: PrestigeId): string => `trial${cls[0]!.toUpperCase()}${cls.slice(1)}`

/** What the trials read. */
export interface TrialWorld {
  flags: ReadonlySet<string>
  /** Infernal pieces forged so far. */
  forged: number
}

/** Has the hero passed this class's trial? */
export const trialPassed = (cls: PrestigeId, w: TrialWorld): boolean => {
  const f = w.flags
  switch (cls) {
    case 'demonhunter': return f.has(DEMONHUNTER_KEY)
    case 'dragoon': return f.has(DRAGON_DEATHLESS)
    case 'hexsmith': return f.has(ARM_STREAK) && w.forged >= HEX_FORGED
    case 'tidecaller': return (f.has(LEVIATHAN_SLAIN) || f.has('brk8')) && f.has(RING_PERFECT)
  }
}

/** The trials passed. */
export const trialsPassed = (w: TrialWorld): PrestigeId[] => PRESTIGE_IDS.filter(c => trialPassed(c, w))

/** The flags derived from the trials (never stored): one per passed trial, and the Wanderer's. */
export const prestigeDerived = (w: TrialWorld): string[] => {
  const passed = trialsPassed(w)
  return passed.length ? [WANDERER_FLAG, ...passed.map(trialFlag)] : []
}

/** The parents of a prestige class. */
export const parentsOf = (cls: PrestigeId): readonly [BaseClassId, BaseClassId] => CLASSES[cls].parents!

/** Does the hero know a skill of each parent (the prestige class's second bar)? */
export const knowsParents = (cls: PrestigeId, known: (id: string) => boolean): boolean =>
  parentsOf(cls).every(p => skillsOf(p).some(s => known(s.id)))

/** What a visit just won says about the trials: the flags to add. */
export const visitTrialFlags = (won: boolean, kills: Readonly<Record<string, number>>, falls: number): string[] => {
  if (!won) return []
  const add: string[] = []
  if ((kills.leviathan ?? 0) > 0) add.push(LEVIATHAN_SLAIN)
  if ((kills.elderDragon ?? 0) > 0 && falls === 0) add.push(DRAGON_DEATHLESS)
  return add
}
