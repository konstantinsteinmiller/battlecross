// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

/**
 * The class depth preview (#181): which schools the hero has met (D4: the skills page's
 * "schools met" row), and the camp's three cards (D1) — one per rescued teacher.
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

describe('the schools met (D4)', () => {
  it('a new hero has met none; meeting a teacher lights that school once, and a learned skill counts too', async () => {
    const { CLASS_IDS, skillsOf } = await import('@/game/data/skills')
    const met = (): string[] => CLASS_IDS.filter(c => p.metClass(c))
    // The first skill of the starting class is already known, so its school is lit.
    const start = met()
    expect(start.length).toBeLessThanOrEqual(1)
    p.markMet('chrono')
    p.markMet('chrono')
    expect(p.metClass('chrono')).toBe(true)
    expect(met()).toHaveLength(start.includes('chrono') ? start.length : start.length + 1)
    // Learning from a school lights it without ever having talked (a skill is a meeting).
    const s = skillsOf('geo')[0]!
    p.profile.hero.learned.push(s.id)
    expect(p.metClass('geo')).toBe(true)
  })
})

describe('the first build choice (D1)', () => {
  it('each camp teacher has a first skill a new hero can take (the three cards)', async () => {
    const { CAMP_TEACHERS } = await import('@/game/sim/camp')
    const { skillsOf } = await import('@/game/data/skills')
    p.profile.gold = 0
    // One card each, three in all; the ones the hero can take now are the choice (the knight's first skill is his already).
    expect(CAMP_TEACHERS).toHaveLength(3)
    const open = CAMP_TEACHERS.filter(t => skillsOf(t.cls).some(q => { const b = p.learnBlock(q.id); return b === '' || b === 'gold' }))
    expect(open.length).toBeGreaterThanOrEqual(2)
  })
})
