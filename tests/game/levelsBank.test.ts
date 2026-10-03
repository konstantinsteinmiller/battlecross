// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

/**
 * What a visit's chests leave in the save: the stock of mana potions (carried
 * between visits, never more than the belt has slots), the healers' price for
 * one, and the one-time chests that stay empty once opened. And the key the
 * second flask is drunk with.
 */

vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: () => {} }))

type Flow = typeof import('@/game/flow')
type P = typeof import('@/game/state/profile')
let f: Flow
let p: P

const tally = (over: Partial<import('@/game/flow').VisitTally> = {}): import('@/game/flow').VisitTally =>
  ({ xp: 60, gold: 40, kills: 5, items: [], seconds: 75, waves: 0, ...over })

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  p.initProfile()
})
afterEach(() => { drainPersist() })

describe('mana potions in the save', () => {
  it('a new save (and one from before they existed) has none', () => {
    expect(p.profile.inv.manaPotions).toBe(0)
    expect(p.profile.world.chests).toEqual([])
    // An older blob has neither field: loading it fills the defaults.
    delete (p.profile.inv as Partial<typeof p.profile.inv>).manaPotions
    delete (p.profile.world as Partial<typeof p.profile.world>).chests
    p.saveProfile()
    p.loadProfile()
    expect(p.profile.inv.manaPotions).toBe(0)
    expect(p.profile.world.chests).toEqual([])
  })

  it('the stock a visit ends with is banked, on a win, a defeat and a retreat alike', async () => {
    await f.bankVisit('victory', 'plains', tally({ manaPotions: 2 }))
    expect(p.profile.inv.manaPotions).toBe(2)
    // One drunk in the next fight, which was lost: it is gone all the same.
    await f.bankVisit('defeat', 'plains', tally({ manaPotions: 1 }))
    expect(p.profile.inv.manaPotions).toBe(1)
    await f.bankVisit('retreat', 'plains', tally({ manaPotions: 3 }))
    expect(p.profile.inv.manaPotions).toBe(3)
    // A tally without the field (a town, an older caller) leaves the stock alone.
    await f.bankVisit('victory', 'plains', tally())
    expect(p.profile.inv.manaPotions).toBe(3)
  })

  it('is capped at the belt\'s size, and survives a reload', async () => {
    expect(p.profile.inv.potions).toBe(3)
    await f.bankVisit('victory', 'plains', tally({ manaPotions: 9 }))
    expect(p.profile.inv.manaPotions).toBe(3)
    p.loadProfile()
    expect(p.profile.inv.manaPotions).toBe(3)
    // A bigger belt holds more of both.
    p.profile.inv.potions = 5
    p.setManaPotions(9)
    expect(p.profile.inv.manaPotions).toBe(5)
    p.setManaPotions(-2)
    expect(p.profile.inv.manaPotions).toBe(0)
  })

  it('a healer sells one for gold while there is room', () => {
    const cost = p.manaPotionCost()
    expect(cost).toBeGreaterThan(0)
    expect(p.buyManaPotion()).toBe(false)
    p.profile.gold = cost * 10
    expect(p.manaPotionRoom()).toBe(3)
    expect(p.buyManaPotion()).toBe(true)
    expect(p.profile.inv.manaPotions).toBe(1)
    expect(p.profile.gold).toBe(cost * 9)
    expect(p.buyManaPotion()).toBe(true)
    expect(p.buyManaPotion()).toBe(true)
    // The stock is full: nothing is sold and nothing is charged.
    expect(p.manaPotionRoom()).toBe(0)
    expect(p.buyManaPotion()).toBe(false)
    expect(p.profile.inv.manaPotions).toBe(3)
    expect(p.profile.gold).toBe(cost * 7)
    // A higher level pays more.
    p.profile.level = 20
    expect(p.manaPotionCost()).toBeGreaterThan(cost)
  })
})

describe('chests in the save and on the result screen', () => {
  it('a one-time chest is remembered once, whatever the outcome', async () => {
    await f.bankVisit('defeat', 'fortress', tally({ special: ['fortress:secret'] }))
    expect(p.profile.world.chests).toEqual(['fortress:secret'])
    await f.bankVisit('victory', 'woods', tally({ special: ['woods:puzzle', 'fortress:secret'] }))
    expect(p.profile.world.chests).toEqual(['fortress:secret', 'woods:puzzle'])
    p.loadProfile()
    expect(p.profile.world.chests).toEqual(['fortress:secret', 'woods:puzzle'])
  })

  it('zone mastery (roadmap #70): banked per zone, best kept, an old save starts at nothing', async () => {
    expect(p.profile.world.mastery).toEqual({})
    const m = { bosses: 2, bossesTotal: 3, chests: 3, chestsTotal: 5 }
    await f.bankVisit('victory', 'woods', tally({ mastery: m }))
    // (2 + 3) of (3 + 5) is 63 %: the zone's first best.
    expect(f.flow.results!.mastery).toEqual({ ...m, pct: 63, bestBefore: 0 })
    expect(p.profile.world.mastery.woods).toEqual({ bosses: 2, chests: 3, best: 63, full: 0 })
    // A full clear: everything taken, the best goes up and it counts as one.
    await f.bankVisit('victory', 'woods', tally({ mastery: { bosses: 2, bossesTotal: 2, chests: 4, chestsTotal: 4 } }))
    expect(f.flow.results!.mastery!.bestBefore).toBe(63)
    expect(p.profile.world.mastery.woods).toEqual({ bosses: 4, chests: 7, best: 100, full: 1 })
    // A weaker visit keeps the best; another zone is its own.
    await f.bankVisit('defeat', 'woods', tally({ mastery: { bosses: 0, bossesTotal: 2, chests: 1, chestsTotal: 4 } }))
    expect(p.profile.world.mastery.woods!.best).toBe(100)
    await f.bankVisit('victory', 'mines', tally({ mastery: m }))
    expect(p.profile.world.mastery.mines!.best).toBe(63)
    p.loadProfile()
    expect(p.profile.world.mastery.woods).toEqual({ bosses: 4, chests: 8, best: 100, full: 1 })
    // A town or the colosseum has none to show.
    await f.bankVisit('victory', 'arena', tally())
    expect(f.flow.results!.mastery).toBeUndefined()
    // A save from before mastery (or a mangled one) loads clean.
    delete (p.profile.world as Partial<typeof p.profile.world>).mastery
    p.saveProfile()
    p.loadProfile()
    expect(p.profile.world.mastery).toEqual({})
    ;(p.profile.world as { mastery: unknown }).mastery = { woods: { bosses: 'x', chests: -3, best: 250 } }
    p.saveProfile()
    p.loadProfile()
    expect(p.profile.world.mastery.woods).toEqual({ bosses: 0, chests: 0, best: 100, full: 0 })
  })

  it('the result screen is told how many chests were opened of how many', async () => {
    await f.bankVisit('victory', 'plains', tally({ chests: { opened: 2, total: 3 } }))
    expect(f.flow.results!.chests).toEqual({ opened: 2, total: 3 })
    await f.bankVisit('victory', 'arena', tally())
    expect(f.flow.results!.chests).toBeUndefined()
  })
})

describe('the mana potion key', () => {
  it('is an action of its own, bound to a free key next to the health potion\'s', async () => {
    const k = await import('@/game/engine/keyBindings')
    expect(k.ACTIONS).toContain('manaPotion')
    expect(k.DEFAULT_BINDINGS.manaPotion).toEqual(['KeyR'])
    for (const a of k.ACTIONS) if (a !== 'manaPotion') expect(k.DEFAULT_BINDINGS[a], a).not.toContain('KeyR')
    const en = (await import('@/i18n/locales/en')).default as Record<string, unknown>
    const actions = (en.options as Record<string, Record<string, string>>).actions!
    for (const a of k.ACTIONS) expect(actions[a], a).toBeTruthy()
  })
})
