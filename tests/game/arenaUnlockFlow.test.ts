// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { installLazyCode } from '../stubs/lazyCode'

/**
 * #201: the Goblin King's answer opens the colosseum with a window of its own,
 * once; and Elder Mara's "Where should I go next?" ends the goal that leads
 * the hero to her.
 */

vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {}, reportLadder: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {}, canOfferReward: { value: false }, isRewardGated: false, adInFlight: { value: false }, claimReward: async () => false }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: () => {} }))

type Flow = typeof import('@/game/flow')
type T = typeof import('@/game/talk')
type P = typeof import('@/game/state/profile')
let f: Flow
let k: T
let p: P

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  k = await import('@/game/talk')
  await installLazyCode()
  p.initProfile()
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

describe('the colosseum window after the Goblin King (#201)', () => {
  it('shows once after his decision, not after any other visit', () => {
    p.markTip('hollowsParty')
    p.decideQuest('goblinKing', 'slay')
    f.flow.quest = 'goblinKing'
    f.afterVisit()
    expect(f.flow.modal).toBe('arenaUnlock')
    f.closeArenaUnlock('map')
    expect(f.flow.modal).toBe('')
    // The next visit's end (no decision behind it) does not repeat it.
    f.afterVisit()
    expect(f.flow.modal).not.toBe('arenaUnlock')
  })

  it('a decision that is not the King\'s does not open it', () => {
    p.markTip('hollowsParty')
    p.decideQuest('goblinKing', 'slay')
    f.flow.quest = 'siege'
    f.afterVisit()
    expect(f.flow.modal).not.toBe('arenaUnlock')
  })
})

describe('Elder Mara tells of the Woods (#201)', () => {
  it('asking where to go next, after the King, sets the flag that ends the goal', async () => {
    const g = await import('@/game/coach/goal')
    for (const n of ['plains', 'sunford']) p.clearNode(n as 'plains')
    p.markTip('hollowsParty')
    p.decideQuest('goblinKing', 'slay')
    expect(g.maraPending()).toBe(true)
    f.talkTo('elderMara')
    for (let i = 0; i < 40 && k.talk.on && k.talk.phase === 'line'; i++) k.talkNext()
    expect(k.talkPick('next')).toBe(true)
    for (let i = 0; i < 40 && k.talk.on && k.talk.phase === 'line'; i++) k.talkNext()
    expect(p.profile.world.flags).toContain(g.MARA_TOLD_FLAG)
    expect(g.maraPending()).toBe(false)
  })

  it('asking before the King is answered does not count', async () => {
    const g = await import('@/game/coach/goal')
    for (const n of ['plains', 'sunford']) p.clearNode(n as 'plains')
    f.talkTo('elderMara')
    for (let i = 0; i < 40 && k.talk.on && k.talk.phase === 'line'; i++) k.talkNext()
    k.talkPick('next')
    for (let i = 0; i < 40 && k.talk.on && k.talk.phase === 'line'; i++) k.talkNext()
    k.talkLeave()
    p.markTip('hollowsParty')
    p.decideQuest('goblinKing', 'slay')
    expect(g.maraPending()).toBe(true)
  })
})
