import { skillsOf } from '../data/skills'
import { CAMP_GIFT_TIP, learnBlock, profile } from '../state/profile'
import { CAMP_LESSONS, campPending } from '../sim/camp'
import type { Sim } from '../sim/world'
import type { Unit } from '../sim/types'

/**
 * ─── The camp's free lesson is the last step of the first visit (#180) ───────
 *
 * With the three teachers out of their cage, the goal is to learn the skill
 * they give away (the first lesson bought in the camp is free, `profile.ts`'s
 * `CAMP_GIFT_TIP`); only then does the Leave button come. Never a trap: where
 * none of the three could teach this hero anything (the free lesson would have
 * nothing to give), the step is skipped.
 */

/** Could a rescued teacher teach this hero a skill now (gold aside: the first lesson is free)? */
export const campHasLesson = (): boolean =>
  CAMP_LESSONS.some(t => skillsOf(t.cls).some(s => { const b = learnBlock(s.id); return b === '' || b === 'gold' }))

/** The teachers are out and the free lesson is not taken yet. */
export const campLessonPending = (sim: Sim): boolean =>
  !!sim.camp && !campPending(sim) && !profile.tips[CAMP_GIFT_TIP] && campHasLesson()

/** The rescued teacher nearest to a point (null: none stands out yet). */
export const nearestTeacher = (sim: Sim, x: number, z: number): Unit | null => {
  let best: Unit | null = null
  let bd = 1e9
  for (const p of sim.captives) {
    if (!p.stay) continue
    const u = sim.get(p.unit)
    if (!u?.alive) continue
    const d = Math.hypot(u.x - x, u.z - z)
    if (d < bd) { bd = d; best = u }
  }
  return best
}
