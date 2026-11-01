// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { MASTERY_LEVELS, MASTERY_MIN_SKILLS, MASTERY_MUL, masteryEarned } from '@/game/data/progression'
import { skillsOf, SKILL_BY_ID } from '@/game/data/skills'
import { masteredDef } from '@/game/sim/mastery'

/**
 * Mastery (#168): a point per class at levels 25 and 35 once six of its skills
 * are learned, spent on one learned skill, which then works twice as hard.
 */

type P = typeof import('@/game/state/profile')
let p: P

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  p.initProfile()
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

/** Learn the first `n` skills of a class, whatever they cost or ask. */
const learnN = (cls: string, n: number): string[] => {
  const ids = skillsOf(cls as never).slice(0, n).map(s => s.id)
  for (const id of ids) if (!p.profile.hero.learned.includes(id)) p.profile.hero.learned.push(id)
  return ids
}

describe('mastery points', () => {
  it('none below six learned skills of the class; one at level 25 and a second at 35 from then on', () => {
    expect(MASTERY_LEVELS).toEqual([25, 35])
    expect(masteryEarned(40, MASTERY_MIN_SKILLS - 1)).toBe(0)
    expect(masteryEarned(24, MASTERY_MIN_SKILLS)).toBe(0)
    expect(masteryEarned(25, MASTERY_MIN_SKILLS)).toBe(1)
    expect(masteryEarned(34, 12)).toBe(1)
    expect(masteryEarned(35, 12)).toBe(2)
  })

  it('a skill is mastered once per point, only of a class with six learned, and the point is spent', () => {
    const ids = learnN('aegis', MASTERY_MIN_SKILLS - 1)
    p.profile.level = 25
    expect(p.masteryBlock(ids[0]!)).toBe('skills')
    const six = learnN('aegis', MASTERY_MIN_SKILLS)
    expect(p.masteryBlock('shieldSlam')).toBe('')
    expect(p.masteryLeft('aegis')).toBe(1)
    expect(p.masterSkill('shieldSlam')).toBe(true)
    expect(p.isMastered('shieldSlam')).toBe(true)
    expect(p.masteryBlock('shieldSlam')).toBe('mastered')
    expect(p.masteryBlock(six[1]!)).toBe('points')
    expect(p.masterSkill(six[1]!)).toBe(false)
    p.profile.level = 35
    expect(p.masteryLeft('aegis')).toBe(1)
    expect(p.masterSkill(six[1]!)).toBe(true)
    // Another class has earned nothing.
    expect(p.masteryBlock('fireball')).toBe('unknown')
    // The sim hears of it.
    expect(p.heroBuild().mastered).toEqual(['shieldSlam', six[1]])
  })
})

describe('what a mastered skill does', () => {
  it('an active\'s strength figures double, its durations and radii do not; a skill not mastered is untouched', () => {
    const d = SKILL_BY_ID.shieldSlam!
    expect(masteredDef(d, [])).toBe(d)
    const m = masteredDef(d, ['shieldSlam'])
    expect(m.p.dmg).toBe(d.p.dmg! * MASTERY_MUL)
    expect(m.p.stun).toBe(d.p.stun)
    const tauntingCry = SKILL_BY_ID.tauntingCry!
    const t = masteredDef(tauntingCry, ['tauntingCry'])
    expect(t.p.def).toBe(tauntingCry.p.def! * MASTERY_MUL)
    expect(t.p.dur).toBe(tauntingCry.p.dur)
    expect(t.p.radius).toBe(tauntingCry.p.radius)
  })

  it('a passive\'s mods double in the hero\'s stats', async () => {
    const { heroStats } = await import('@/game/sim/stats')
    const { startAttrs } = await import('@/game/data/attributes')
    const base = { level: 20, attrs: startAttrs(), equipped: {}, passives: ['aegisAura'] }
    const plain = heroStats(base as never)
    const mastered = heroStats({ ...base, mastered: ['aegisAura'] } as never)
    expect(mastered.mods.armorPct).toBeCloseTo((plain.mods.armorPct ?? 0) * MASTERY_MUL)
    expect(mastered.mods.physReduction).toBeCloseTo((plain.mods.physReduction ?? 0) * MASTERY_MUL)
  })
})
