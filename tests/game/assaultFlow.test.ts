// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { installLazyCode } from '../stubs/lazyCode'

/**
 * #204: the siege of the Hollows' gate comes right before the first entry (and again while only skipped and the
 * King lives), never after it has been won or the King dealt with, and the Hollows proper follow it at once.
 */

vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {}, reportLadder: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {}, canOfferReward: { value: false }, isRewardGated: false, adInFlight: { value: false }, claimReward: async () => false }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: () => {} }))

type Flow = typeof import('@/game/flow')
type P = typeof import('@/game/state/profile')
type D = typeof import('@/game/data/assault')
let f: Flow
let p: P
let d: D

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  d = await import('@/game/data/assault')
  await installLazyCode()
  p.initProfile()
})
afterEach(() => { drainPersist(); f.setNodeBuilder(null); vi.restoreAllMocks() })

describe('when the besieged gate comes', () => {
  it('on the first entry to the Hollows, and nowhere else', () => {
    expect(f.assaultOnEntry('hollows')).toBe(true)
    expect(f.assaultOnEntry('plains')).toBe(false)
    expect(f.assaultOnEntry('sunford')).toBe(false)
  })

  it('never again once it has been won', async () => {
    await f.finishAssault('won')
    expect(p.hasFlag(d.ASSAULT_FLAG)).toBe(true)
    expect(f.assaultOnEntry('hollows')).toBe(false)
  })

  it('never once the King has been dealt with', () => {
    p.decideQuest('goblinKing', 'slay')
    expect(f.assaultOnEntry('hollows')).toBe(false)
  })

  it('a skipped siege goes straight into the Hollows, and is never offered again', async () => {
    const built: Array<{ node: string; assault: boolean }> = []
    f.setNodeBuilder(async (node) => {
      built.push({ node, assault: f.assaultOnEntry('x') })
      return { setup: { theme: 'cave' }, snapshot: () => null } as never
    })
    await f.finishAssault('skipped')
    expect(p.hasFlag(d.ASSAULT_FLAG)).toBe(true)
    // The entry after the skip is the Hollows themselves ...
    expect(built.map(b => b.node)).toEqual(['hollows'])
    // ... and no later journey there plays the siege again (dying to the King and retrying included).
    expect(f.assaultOnEntry('hollows')).toBe(false)
  })

  it('the siege is not a visit: it does not count one for the Hollows', async () => {
    const before = p.profile.world.visits.hollows ?? 0
    f.setNodeBuilder(async () => ({ setup: { theme: 'cave' }, snapshot: () => null }) as never)
    await f.travel('hollows')
    expect(p.profile.world.visits.hollows ?? 0).toBe(before)
    // After the win, the entry proper counts.
    await f.finishAssault('won')
    expect(p.profile.world.visits.hollows ?? 0).toBe(before + 1)
  })
})
