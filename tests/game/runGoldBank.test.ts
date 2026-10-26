// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

/**
 * Coins are the player's the moment they are picked up: a trainer met inside
 * the visit sees them, and the result screen then banks only what is left to
 * pay (the triple-the-purse offer adds twice the run's total on top).
 */
describe('the run gold already in the purse', () => {
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

  const tally = (gold: number, goldBanked?: number) => ({ xp: 10, gold, ...(goldBanked === undefined ? {} : { goldBanked }), kills: 1, items: [], seconds: 30, waves: 0, lost: 900, maxHp: 1000 })

  it('pays nothing twice: what was banked during the visit is not banked again', async () => {
    p.profile.gold = 255
    await f.bankVisit('victory', 'plains', tally(255, 255))
    expect(p.profile.gold).toBe(255)
    expect(f.flow.results!.gold).toBe(255)
  })

  it('a tally without a banked share still pays all of it', async () => {
    p.profile.gold = 0
    await f.bankVisit('victory', 'plains', tally(255))
    expect(p.profile.gold).toBe(255)
  })

  it('spending it before the result screen leaves the triple on the run total', async () => {
    p.profile.gold = 100 // 255 earned, 155 spent on a trainer
    await f.bankVisit('victory', 'plains', tally(255, 255))
    expect(p.profile.gold).toBe(100)
    f.flow.results!.opening = false
    p.profile.gold += f.flow.results!.gold * 2
    expect(p.profile.gold).toBe(610)
  })
})
