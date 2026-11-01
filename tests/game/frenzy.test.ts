import { describe, expect, it } from 'vitest'
import { setupRun } from '@/game/sim/bot'
import { FRENZY_MAX, frenzyCount, stepFrenzy } from '@/game/sim/frenzy'
import { findStatus } from '@/game/sim/world'

/** Frenzy (#170): a boss hurt fast goes into 200-250 % damage for 8-12 s, twice a fight at most. */
describe('frenzy', () => {
  it('starts when a boss loses a tenth of its health in three seconds, lasts 8-12 s, and happens twice at most', () => {
    const { sim } = setupRun({ zone: 'woods', level: 7, cls: 'pyro', geared: true, seed: 3 })
    const boss = sim.units.find(u => u.rank === 'boss')!
    const hero = sim.units.find(u => u.kind === 'hero')!
    stepFrenzy(sim, boss, hero, 5, 0.1)
    boss.hp -= boss.s.maxHp * 0.15
    stepFrenzy(sim, boss, hero, 5, 0.1)
    const st = findStatus(boss, 'frenzy')!
    expect(st).toBeTruthy()
    expect(st.v).toBeGreaterThanOrEqual(1)
    expect(st.v).toBeLessThanOrEqual(1.5)
    expect(st.t).toBeGreaterThanOrEqual(8)
    expect(st.t).toBeLessThanOrEqual(12)
    expect(frenzyCount(boss)).toBe(1)
    for (let i = 0; i < 5; i++) {
      boss.statuses.length = 0
      boss.hp = boss.s.maxHp
      stepFrenzy(sim, boss, hero, 5, 0.1)
      boss.hp -= boss.s.maxHp * 0.2
      stepFrenzy(sim, boss, hero, 5, 0.1)
    }
    expect(frenzyCount(boss)).toBe(FRENZY_MAX)
  })
})
