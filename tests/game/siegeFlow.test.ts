// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

/**
 * The Siege of Bastion through the flow and the save (afterplay §8.4, §8.6):
 * rung from the fort, built behind the veil like an encounter, banked at its
 * end — the Marks (half on a loss), a win's purse, XP and piece, and each
 * milestone once for good, a save round trip included — and the bell's
 * cadence, one siege per two invaded zones cleared. Portal calls are
 * stubbed; the place is built by a stand-in (no GPU).
 */

vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {}, reportLadder: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {}, canOfferReward: { value: true }, isRewardGated: false, adInFlight: { value: false }, claimReward: async () => false }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: () => {} }))

type Flow = typeof import('@/game/flow')
type P = typeof import('@/game/state/profile')
type S = typeof import('@/game/state/siege')
let f: Flow
let p: P
let s: S
const built: Array<{ node: string; encounter?: import('@/game/data/encounters').EncounterSpec }> = []

const tally = (over: Partial<import('@/game/flow').VisitTally> = {}): import('@/game/flow').VisitTally =>
  ({ xp: 500, gold: 300, kills: 60, items: [], seconds: 700, waves: 10, ...over })
type Siege = NonNullable<import('@/game/flow').VisitTally['siege']>
const sieged = (o: Partial<Siege> = {}): Siege => ({ tier: 'normal', story: false, waves: 10, earned: 40, flawless: false, won: true, ...o })

/** A hero of the afterplay at the fort, the story's siege due (B5 done). */
const atTheFort = (): void => {
  p.profile.world.afterplay = true
  p.profile.level = 40
  for (const fl of ['brk0', 'brk1', 'brk2', 'brk3', 'brk4', 'brk5', 'siegeDue']) p.profile.world.flags.push(fl)
  p.profile.world.at = 'bastion'
}

beforeEach(async () => {
  drainAndResetModules()
  built.length = 0
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  s = await import('@/game/state/siege')
  p.initProfile()
  f.setNodeBuilder(async (node, _progress, encounter) => {
    built.push({ node, encounter })
    return { setup: { theme: 'farm' } } as never
  })
})
afterEach(() => { f.setNodeBuilder(null); drainPersist() })

describe('the siege, rung and fought', () => {
  it('is shut before the story brings it; then the bell rings and the story\'s siege is built on Normal, unlosable', async () => {
    expect(s.siegeOpen()).toBe(false)
    await f.startSiege('normal')
    expect(built).toHaveLength(0)
    atTheFort()
    expect(s.siegeOpen()).toBe(true)
    expect(s.siegeBell()).toBe(true)
    expect(s.storySiegeDue()).toBe(true)
    // Hard is not open yet, whatever is asked.
    expect(s.siegeTierOpen('hard')).toBe(false)
    await f.startSiege('normal')
    expect(built).toHaveLength(1)
    expect(built[0]!.encounter?.siege).toMatchObject({ tier: 'normal', story: true })
    expect(built[0]!.encounter?.level).toBe(41)
    expect(f.flow.screen).toBe('zone')
  })

  it('a win banks its Marks, the §11 purse and XP, opens Hard, holds the story, and reaches its milestone once (a save round trip included)', async () => {
    atTheFort()
    await f.startSiege('normal')
    const gold = p.profile.gold
    await f.bankVisit('victory', 'outskirts', tally({ siege: sieged({ story: true, earned: 41 }) }))
    const r = f.flow.results!
    expect(r.siege).toMatchObject({ tier: 'normal', waves: 10, earned: 41, banked: 41, story: true, milestones: ['normal1'] })
    expect(r.gold).toBeGreaterThan(300)
    expect(p.profile.gold).toBe(gold + r.gold)
    expect(r.xp).toBeGreaterThan(500)
    // No purse tripling on a siege: its reward is sized already.
    expect(f.purseOffered(r)).toBe(false)
    const sv = p.profile.meta.siege
    expect(sv.wins.normal).toBe(1)
    expect(sv.marks).toBe(41)
    // The win's Demonglass is in the pouch (phase 8), nothing is left owed.
    expect(sv.glass).toBe(0)
    expect(p.oreCount('demonglass')).toBe(50)
    expect(sv.milestones).toEqual(['normal1'])
    // The banner exists now (phase 8): handed over at once, not owed.
    expect(sv.owed).toEqual([])
    expect(p.owns('bastionBanner')).toBe(true)
    expect(p.profile.world.flags).toContain('siegeHeld')
    expect(p.profile.world.flags).not.toContain('siegeDue')
    expect(s.siegeTierOpen('hard')).toBe(true)
    // The save keeps it all.
    p.saveProfile()
    p.loadProfile()
    expect(p.profile.meta.siege.milestones).toEqual(['normal1'])
    expect(p.profile.meta.siege.owed).toEqual([])
    expect(p.owns('bastionBanner')).toBe(true)
    expect(p.oreCount('demonglass')).toBe(50)
    expect(p.profile.meta.siege.wins.normal).toBe(1)
    // A second win reaches nothing it reached before.
    await f.startSiege('normal')
    await f.bankVisit('victory', 'outskirts', tally({ siege: sieged() }))
    expect(f.flow.results!.siege!.milestones).toEqual([])
    expect(p.profile.meta.siege.milestones).toEqual(['normal1'])
    expect(p.profile.meta.siege.owed).toEqual([])
    expect(p.oreCount('demonglass')).toBe(100)
    expect(p.profile.meta.siege.wins.normal).toBe(2)
  })

  it('a flawless Hard win gives the fifth passive slot and the hidden class key, each once', async () => {
    atTheFort()
    p.profile.world.flags.push('siegeHeld')
    p.profile.meta.siege.wins.normal = 1
    p.profile.meta.siege.milestones.push('normal1')
    expect(s.fifthPassiveOpen()).toBe(false)
    await f.startSiege('hard')
    expect(built.at(-1)!.encounter?.siege?.tier).toBe('hard')
    await f.bankVisit('victory', 'outskirts', tally({ siege: sieged({ tier: 'hard', story: false, flawless: true }) }))
    expect(f.flow.results!.siege!.milestones.sort()).toEqual(['hard1', 'hardFlawless'])
    expect(s.fifthPassiveOpen()).toBe(true)
    // The loadout has its fifth passive slot at once (phase 8).
    expect(p.profile.hero.passive).toHaveLength(5)
    expect(p.profile.world.flags.filter(x => x === 'demonhunterKey')).toHaveLength(1)
    await f.bankVisit('victory', 'outskirts', tally({ siege: sieged({ tier: 'hard', flawless: true }) }))
    expect(p.profile.world.flags.filter(x => x === 'fifthPassive')).toHaveLength(1)
    expect(p.profile.world.flags.filter(x => x === 'demonhunterKey')).toHaveLength(1)
    expect(f.flow.results!.siege!.milestones).toEqual([])
  })

  it('a lost siege keeps half its Marks, wins nothing, and costs no purse', async () => {
    atTheFort()
    p.profile.world.flags.push('siegeHeld')
    p.profile.gold = 1000
    await f.startSiege('normal')
    await f.bankVisit('defeat', 'outskirts', tally({ gold: 0, siege: sieged({ won: false, waves: 6, earned: 25 }) }))
    const r = f.flow.results!
    expect(r.goldLost).toBe(0)
    expect(r.siege).toMatchObject({ banked: 12, earned: 25, waves: 6, milestones: [] })
    expect(p.profile.meta.siege.marks).toBe(12)
    expect(p.profile.meta.siege.wins.normal).toBe(0)
    expect(p.profile.meta.siege.best).toBe(6)
    expect(p.profile.gold).toBe(1000)
  })
})

describe('the siege bell (afterplay §8.4)', () => {
  it('rings after every second invaded zone cleared once the siege is held, and falls silent with a siege', async () => {
    atTheFort()
    await f.startSiege('normal')
    await f.bankVisit('victory', 'outskirts', tally({ siege: sieged({ story: true }) }))
    // Back on the map: the next visits are zones again.
    f.afterVisit()
    expect(s.siegeBell()).toBe(false)
    await f.bankVisit('victory', 'plains', tally({ invaded: true }))
    expect(p.profile.meta.siege.clears).toBe(1)
    expect(s.siegeBell()).toBe(false)
    await f.bankVisit('victory', 'hollows', tally({ invaded: true }))
    expect(s.siegeBell()).toBe(true)
    // A campaign zone, or a lost one, rings nothing.
    await f.bankVisit('defeat', 'woods', tally({ invaded: true }))
    expect(p.profile.meta.siege.clears).toBe(2)
    await f.startSiege('normal')
    await f.bankVisit('defeat', 'outskirts', tally({ siege: sieged({ won: false, waves: 3, earned: 9 }) }))
    expect(p.profile.meta.siege.clears).toBe(0)
    expect(s.siegeBell()).toBe(false)
  })
})
