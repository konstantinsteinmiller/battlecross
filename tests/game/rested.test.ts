// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { RESTED_CAP, RESTED_MIN_AWAY_MS, RESTED_PER_HOUR, accrueRested, restedClock } from '@/game/rested'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { dealDamage } from '@/game/sim/combat'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'

/** Rested (roadmap #9, D61): time away buys double-XP fight time. */

const H = 3_600_000

describe('the pool', () => {
  it('ten minutes of double XP per hour away, capped at two hours, nothing under half an hour', () => {
    const now = 100 * H
    expect(accrueRested(0, now - 3 * H, now)).toEqual({ pool: 3 * RESTED_PER_HOUR, gained: 3 * RESTED_PER_HOUR })
    expect(accrueRested(0, now - 12 * H, now).pool).toBe(RESTED_CAP)
    expect(accrueRested(0, now - 50 * H, now).pool).toBe(RESTED_CAP)
    expect(accrueRested(1000, now - RESTED_MIN_AWAY_MS + 1, now)).toEqual({ pool: 1000, gained: 0 })
    expect(accrueRested(RESTED_CAP - 60, now - 5 * H, now).gained).toBe(60)
  })

  it('a clock that went back, or no last-seen at all, adds nothing', () => {
    expect(accrueRested(500, 200 * H, 100 * H)).toEqual({ pool: 500, gained: 0 })
    expect(accrueRested(0, 0, 100 * H).gained).toBe(0)
  })

  it('reads as hours and minutes, to the nearest minute, never 0 min while any is left', () => {
    expect(restedClock(4800)).toEqual({ h: 1, m: 20 })
    expect(restedClock(3600.0002)).toEqual({ h: 1, m: 0 })
    expect(restedClock(10)).toEqual({ h: 0, m: 1 })
  })
})

describe('in the save', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  beforeEach(async () => {
    vi.useFakeTimers({ now: new Date(2026, 9, 4, 12) })
    drainAndResetModules()
    await holdGameState()
    p = await import('@/game/state/profile')
    p.initProfile()
  })
  afterEach(() => { drainPersist(); vi.useRealTimers() })

  it('an absence since the last save fills the pool once; a reload with no save in between reads the same pool', () => {
    p.saveProfile()
    vi.setSystemTime(Date.now() + 6 * H)
    p.loadProfile()
    expect(p.profile.meta.rested).toBe(6 * RESTED_PER_HOUR)
    expect(p.restedGain.value).toBe(6 * RESTED_PER_HOUR)
    // Reload again without a save: the stored last-seen is the old one, so the same pool, not double.
    p.loadProfile()
    expect(p.profile.meta.rested).toBe(6 * RESTED_PER_HOUR)
    // A save stamps now: the next reload adds nothing.
    p.saveProfile()
    p.loadProfile()
    expect(p.profile.meta.rested).toBe(6 * RESTED_PER_HOUR)
    expect(p.restedGain.value).toBe(6 * RESTED_PER_HOUR)
  })
})

describe('in a fight', () => {
  const field = (rested: number, mode: 'zone' | 'town' = 'zone'): Sim => {
    const plan = generateArena(7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode, zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, { build: { level: 5, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3, rested })
    return sim
  }
  const killOne = (sim: Sim): number => {
    const u = sim.hero.unit
    const e = spawnEnemy(sim, 'goblin', u.x + 2, u.z)!
    const before = sim.hero.xp
    dealDamage(sim, u, e, 1e7, { type: 'true', canCrit: false })
    return sim.hero.xp - before
  }

  it('a kill pays double XP while the pool lasts, and the pool drains with fight time only', () => {
    const plain = killOne(field(0))
    const sim = field(1)
    expect(killOne(sim)).toBe(plain * 2)
    for (let i = 0; i < 40; i++) stepSim(sim, generateArena(7), 0.05)
    expect(sim.hero.rested).toBe(0)
    expect(killOne(sim)).toBe(plain)
    const town = field(100, 'town')
    for (let i = 0; i < 40; i++) stepSim(town, generateArena(7), 0.05)
    expect(town.hero.rested).toBe(100)
  })
})
