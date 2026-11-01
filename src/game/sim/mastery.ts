import { MASTERY_MUL, MASTERY_P_KEYS } from '../data/progression'
import type { SkillDef } from '../data/skills'

/**
 * A mastered skill as the sim casts it (#168): the strength figures of an
 * active (`MASTERY_P_KEYS`) doubled, the rest of its parameters as they were.
 * The power scaling and a passive's mods are doubled where they are read
 * (`heroSkills.pw`, `stats.heroStats`).
 */
const cache = new Map<string, SkillDef>()
export const masteredDef = (def: SkillDef, mastered: readonly string[] | undefined): SkillDef => {
  if (!mastered || !mastered.includes(def.id) || def.kind !== 'active') return def
  let m = cache.get(def.id)
  if (!m) {
    const p: Record<string, number> = {}
    for (const [k, v] of Object.entries(def.p)) p[k] = MASTERY_P_KEYS.has(k) ? v * MASTERY_MUL : v
    m = { ...def, p }
    cache.set(def.id, m)
  }
  return m
}
