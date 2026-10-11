// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { CAREFUL_FULL, CAREFUL_MAX, CAREFUL_NONE, carefulMult } from '@/game/careful'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { dealDamage, heal } from '@/game/sim/combat'
import { spawnEnemy } from '@/game/sim/spawn'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'

/**
 * The careful clear (#113): a won zone pays its gold and experience up to
 * twice when little health was lost — ×2 at 15 % or less, ×1 at 50 % or more.
 */

describe('the careful multiplier', () => {
  it('×2 up to 15 % lost, ×1 from 50 %, straight between', () => {
    expect(carefulMult(0, 1000)).toBe(CAREFUL_MAX)
    expect(carefulMult(150, 1000)).toBe(2)
    expect(carefulMult(500, 1000)).toBe(1)
    expect(carefulMult(900, 1000)).toBe(1)
    const mid = carefulMult(((CAREFUL_FULL + CAREFUL_NONE) / 2) * 1000, 1000)
    expect(mid).toBeCloseTo(1.5, 6)
    expect(carefulMult(10, 0)).toBe(1)
  })
})

describe('the health a visit loses', () => {
  const field = (): Sim => {
    const plan = generateArena(7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, { build: { level: 5, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
    return sim
  }

  it('counts each blow up to the health it found, and healing does not pay it back', () => {
    const sim = field()
    const h = sim.hero.unit
    const e = spawnEnemy(sim, 'goblin', h.x + 2, h.z)!
    dealDamage(sim, e, h, 50, { type: 'true', canCrit: false })
    expect(sim.hero.lost).toBeCloseTo(50, 6)
    heal(sim, h, 50)
    expect(sim.hero.lost).toBeCloseTo(50, 6)
    // An overkill counts only what was left.
    h.hp = 30
    dealDamage(sim, e, h, 500, { type: 'true', canCrit: false })
    expect(sim.hero.lost).toBeCloseTo(80, 6)
    expect(sim.hero.taken).toBeGreaterThan(sim.hero.lost)
  })
})

describe('the bank pays it beside the purse', () => {
  type Flow = typeof import('@/game/flow')
  type P = typeof import('@/game/state/profile')
  let f: Flow
  let p: P
  beforeEach(async () => {
    drainAndResetModules()
    await holdGameState()
    vi.doMock('@/use/useLeaderboard', () => ({ reportRun: async () => {}, reportLadder: async () => {} }))
    vi.doMock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
    vi.doMock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
    p = await import('@/game/state/profile')
    f = await import('@/game/flow')
    p.initProfile()
    p.profile.stats.runs = 4
  })
  afterEach(() => { drainPersist() })

  const tally = (lost: number) => ({ xp: 100, gold: 200, kills: 3, items: [], seconds: 60, waves: 0, lost, maxHp: 1000 })

  it('a careful win pays twice, shown on its own line; the purse stays what was earned', async () => {
    p.profile.gold = 0
    await f.bankVisit('victory', 'plains', tally(100))
    const r = f.flow.results!
    expect(r.gold).toBe(200)
    expect(r.careful).toEqual({ mult: 2, xp: 100, gold: 200, lostPct: 10 })
    expect(p.profile.gold).toBe(400)
  })

  it('a hard-won fight pays as earned; a loss and the colosseum never get it', async () => {
    p.profile.gold = 0
    await f.bankVisit('victory', 'plains', tally(700))
    expect(f.flow.results!.careful).toBeUndefined()
    expect(p.profile.gold).toBe(200)
    await f.bankVisit('defeat', 'plains', tally(0))
    expect(f.flow.results!.careful).toBeUndefined()
    await f.bankVisit('victory', 'arena', tally(0))
    expect(f.flow.results!.careful).toBeUndefined()
  })
})
