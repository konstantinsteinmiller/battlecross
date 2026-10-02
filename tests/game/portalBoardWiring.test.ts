// @vitest-environment jsdom
// ─── The portal's own leaderboard is actually fed ───────────────────────────
//
// `usePortalLeaderboard` (Playgama's SaaS board on playgama.com, YouTube's own
// board through Bridge's `sendScore` on Playables) was wired in every detail
// except the one that matters: nothing in the game ever called it. With the
// board switched on by env, the tab would have shown other players' rows and
// this player's score would never have been posted anywhere.
//
// Pinned: a player joins the board once on arrival (the boot scene), and every
// visit's end — win OR defeat, since lifetime XP grows on both — reports the
// lifetime XP the save holds, which is also the number YouTube requires the
// sent score to match.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainPersist, holdGameState } from '../stubs/drainPersist'

const h = vi.hoisted(() => ({ join: [] as number[], best: [] as number[] }))

vi.mock('@/use/usePortalLeaderboard', () => ({
  joinPortalBoard: async (best: number) => { h.join.push(best) },
  reportPortalBest: async (best: number) => { h.best.push(best) }
}))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))

const tally = { xp: 40, gold: 5, kills: 3, items: [], seconds: 30, waves: 0 }

describe('portal leaderboard wiring (game/flow.ts)', () => {
  beforeEach(async () => {
    h.join.length = 0
    h.best.length = 0
    // A visit's end saves the profile on the debounce; hold the instance so
    // the write lands in THIS case's storage (tests/stubs/drainPersist.ts).
    await holdGameState()
  })
  afterEach(() => { drainPersist() })

  it('reports lifetime XP at the end of every visit — a win and a defeat alike', async () => {
    const flowMod = await import('@/game/flow')
    const { lifetimeXp } = await import('@/game/state/profile')

    await flowMod.bankVisit('victory', 'plains', tally)
    expect(h.best).toEqual([lifetimeXp()])
    expect(lifetimeXp()).toBe(40)

    await flowMod.bankVisit('defeat', 'plains', tally)
    expect(h.best).toHaveLength(2)
    expect(h.best[1]).toBe(lifetimeXp())
    expect(h.best[1]).toBeGreaterThanOrEqual(h.best[0]!)
  })

  it('joins the board once the boot scene is built, at the saved lifetime XP', async () => {
    const flowMod = await import('@/game/flow')
    const { lifetimeXp } = await import('@/game/state/profile')
    const fakeMode = { setup: { theme: 'plains' } } as never
    flowMod.setNodeBuilder(async () => fakeMode)
    await flowMod.createBootMode()
    flowMod.setNodeBuilder(null)
    expect(h.join).toEqual([lifetimeXp()])
  })
})
