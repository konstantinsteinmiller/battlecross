// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

/**
 * What the end of a visit does (`flow.bankVisit`), and what the coach counts.
 * Portal calls are stubbed: this is the game's own bookkeeping.
 */

const ads = vi.hoisted(() => ({ shown: 0, can: true, order: [] as string[] }))
vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => { ads.shown++; ads.order.push('ad') } }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => ads.can, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
const funnel = vi.hoisted(() => ({ events: [] as string[] }))
// No GPU in the test: the loop is a stand-in (travel would start the renderer).
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: (c: string, w: string, a: string) => { funnel.events.push(`${c}:${w}:${a}`) } }))

type Flow = typeof import('@/game/flow')
type P = typeof import('@/game/state/profile')
let f: Flow
let p: P

const tally = (over: Partial<import('@/game/flow').VisitTally> = {}): import('@/game/flow').VisitTally =>
  ({ xp: 60, gold: 40, kills: 5, items: [], seconds: 75, waves: 0, ...over })

beforeEach(async () => {
  drainAndResetModules()
  ads.shown = 0
  ads.can = true
  ads.order.length = 0
  funnel.events.length = 0
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  p.initProfile()
})
afterEach(() => { drainPersist() })

describe('the end of a visit', () => {
  it('a win banks XP, gold and loot, clears the node and opens its neighbours', async () => {
    await f.bankVisit('victory', 'plains', tally({ items: ['copperBand', 'rustedShortsword'] }))
    const r = f.flow.results!
    expect(r.outcome).toBe('victory')
    expect(r.firstClear).toBe(true)
    expect(p.profile.world.cleared).toContain('plains')
    expect(r.unlocked.sort()).toEqual(['hollows', 'woods'])
    expect(p.profile.gold).toBeGreaterThanOrEqual(40)
    expect(p.owns('copperBand')).toBe(true)
    // The starter sword again: turned into gold, and said so.
    expect(r.items.find(i => i.id === 'rustedShortsword')).toMatchObject({ added: false })
    expect(r.items.find(i => i.id === 'rustedShortsword')!.gold).toBeGreaterThan(0)
    expect(p.profile.stats).toMatchObject({ kills: 5, runs: 1, deaths: 0, playSeconds: 75 })
    expect(f.flow.modal).toBe('results')
  })

  it('a second win of the same zone is not a first clear and unlocks nothing new', async () => {
    await f.bankVisit('victory', 'plains', tally())
    await f.bankVisit('victory', 'plains', tally())
    expect(f.flow.results!.firstClear).toBe(false)
    expect(f.flow.results!.unlocked).toEqual([])
    expect(p.profile.story).toBe(1)
  })

  it('a defeat keeps the XP and the loot and drops a tenth of the purse', async () => {
    p.profile.gold = 1000
    await f.bankVisit('defeat', 'plains', tally({ gold: 0, items: ['copperBand'] }))
    const r = f.flow.results!
    expect(r.outcome).toBe('defeat')
    expect(r.goldLost).toBe(100)
    expect(p.profile.gold).toBe(900)
    expect(p.lifetimeXp()).toBe(60)
    expect(p.owns('copperBand')).toBe(true)
    expect(p.profile.world.cleared).not.toContain('plains')
    expect(p.profile.stats.deaths).toBe(1)
  })

  it('a retreat keeps everything and costs nothing — it only gives up the clear', async () => {
    p.profile.gold = 1000
    await f.bankVisit('retreat', 'plains', tally())
    expect(f.flow.results!.goldLost).toBe(0)
    expect(p.profile.gold).toBe(1040)
    expect(p.profile.world.cleared).not.toContain('plains')
    expect(p.profile.stats.deaths).toBe(0)
  })

  it('a level gained on the way is on the result, with its points waiting', async () => {
    await f.bankVisit('victory', 'plains', tally({ xp: 400 }))
    const r = f.flow.results!
    expect(r.levelAfter).toBeGreaterThan(r.levelBefore)
    expect(p.profile.hero.points).toBe((r.levelAfter - r.levelBefore) * 3)
  })

  it('the finale of a quest zone brings its decision — once', async () => {
    await f.bankVisit('victory', 'hollows', tally())
    expect(f.flow.quest).toBe('goblinKing')
    p.decideQuest('goblinKing', 'slay')
    f.flow.quest = ''
    await f.bankVisit('victory', 'hollows', tally())
    expect(f.flow.quest).toBe('')
  })

  it('the colosseum remembers the best wave', async () => {
    await f.bankVisit('victory', 'arena', tally({ waves: 6 }))
    await f.bankVisit('victory', 'arena', tally({ waves: 4 }))
    expect(p.profile.world.arenaBest).toBe(6)
  })

  it('the save is written before the result screen opens', async () => {
    await f.bankVisit('victory', 'plains', tally())
    const blob = JSON.parse(localStorage.getItem('bcross_state') ?? '{}')
    expect(blob.bc_world.cleared).toContain('plains')
    expect(blob.bc_stats.runs).toBe(1)
  })
})

describe('Continue on the result screen', () => {
  it('closes the result FIRST, then plays the interstitial, then moves on', async () => {
    await f.bankVisit('victory', 'plains', tally())
    const { watch } = await import('vue')
    const stop = watch(() => f.flow.modal, (m) => ads.order.push(`modal:${m || 'none'}`), { flush: 'sync' })
    await f.leaveResults()
    stop()
    expect(ads.shown).toBe(1)
    expect(ads.order.indexOf('modal:none')).toBeLessThan(ads.order.indexOf('ad'))
    expect(f.flow.screen).toBe('map')
  })

  it('plays no ad inside the pacing window', async () => {
    ads.can = false
    await f.bankVisit('victory', 'plains', tally())
    await f.leaveResults()
    expect(ads.shown).toBe(0)
    expect(f.flow.screen).toBe('map')
  })

  it('a double tap asks for one ad', async () => {
    await f.bankVisit('victory', 'plains', tally())
    await Promise.all([f.leaveResults(), f.leaveResults()])
    expect(ads.shown).toBe(1)
  })

  it('goes to the decision when the finale brought one, and to the ending after the throne', async () => {
    await f.bankVisit('victory', 'hollows', tally())
    await f.leaveResults()
    // The decision is a conversation over the scene (D37), not a window.
    expect(f.flow.modal).toBe('')
    expect(f.flow.talk).toBe('decision')
    p.decideQuest('goblinKing', 'slay')
    f.afterVisit()
    expect(f.flow.screen).toBe('map')

    p.decideQuest('throne', 'shatter')
    f.afterVisit()
    expect(f.flow.modal).toBe('ending')
    // Shown once.
    p.markTip('endingSeen')
    f.afterVisit()
    expect(f.flow.modal).toBe('')
  })
})

describe('Retry on the result screen', () => {
  const fake = { setup: { theme: 'plains' } } as never

  it('closes the result, plays the paced interstitial, then re-enters the same zone', async () => {
    f.setNodeBuilder(async () => fake)
    await f.travel('plains')
    await f.bankVisit('defeat', 'plains', tally())
    const { watch } = await import('vue')
    const stop = watch(() => f.flow.modal, (m) => ads.order.push(`modal:${m || 'none'}`), { flush: 'sync' })
    await f.retryVisit()
    stop()
    expect(ads.shown).toBe(1)
    expect(ads.order.indexOf('modal:none')).toBeLessThan(ads.order.indexOf('ad'))
    expect(f.flow.screen).toBe('zone')
    expect(f.flow.node).toBe('plains')
    expect(f.flow.results).toBeNull()
    f.setNodeBuilder(null)
  })

  it('plays no ad inside the pacing window, and a double tap asks for one', async () => {
    f.setNodeBuilder(async () => fake)
    ads.can = false
    await f.travel('plains')
    await f.bankVisit('defeat', 'plains', tally())
    await f.retryVisit()
    expect(ads.shown).toBe(0)
    expect(f.flow.screen).toBe('zone')

    ads.can = true
    await f.bankVisit('defeat', 'plains', tally())
    await Promise.all([f.retryVisit(), f.retryVisit()])
    expect(ads.shown).toBe(1)
    f.setNodeBuilder(null)
  })
})

describe('the per-zone funnel (Poki measure)', () => {
  const fake = { setup: { theme: 'plains' } } as never

  it('opens a level on entering a zone and closes it with exactly one complete or fail', async () => {
    f.setNodeBuilder(async () => fake)
    p.clearNode('plains')
    await f.travel('hollows')
    expect(funnel.events).toEqual(['level:hollows:start'])
    await f.bankVisit('victory', 'hollows', tally())
    expect(funnel.events).toEqual(['level:hollows:start', 'level:hollows:complete'])

    await f.travel('plains')
    await f.bankVisit('defeat', 'plains', tally())
    expect(funnel.events.slice(2)).toEqual(['level:plains:start', 'level:plains:fail'])
    f.setNodeBuilder(null)
  })

  it('a retreat is a fail; a town is not a level; a result without a start reports nothing', async () => {
    f.setNodeBuilder(async () => fake)
    await f.bankVisit('victory', 'plains', tally())
    expect(funnel.events).toEqual([])
    await f.travel('sunford')
    expect(funnel.events).toEqual([])
    await f.travel('plains')
    await f.bankVisit('retreat', 'plains', tally())
    expect(funnel.events).toEqual(['level:plains:start', 'level:plains:fail'])
    f.setNodeBuilder(null)
  })
})

describe('who hunts the hero', () => {
  it('nobody, until a faction has been crossed badly enough', async () => {
    expect(f.hostileFaction()).toBeNull()
    p.decideQuest('siege', 'defend')
    expect(f.hostileFaction()).toBe('syndicate')
  })

  it('Oakhaven looks like what was made of it', async () => {
    expect(f.townTheme('oakhaven')).toBe('town')
    p.decideQuest('siege', 'betray')
    expect(f.townTheme('oakhaven')).toBe('ruin')
    expect(f.townTheme('sunford')).toBe('town')
  })
})

describe('the control coach', () => {
  it('a lesson retires after it has been DONE its few times — never on a timer', async () => {
    const { coach, LESSONS } = await import('@/game/coach')
    coach.reset()
    const need = LESSONS.find(l => l.id === 'move')!.need
    expect(coach.learned('move')).toBe(false)
    for (let i = 0; i < need - 1; i++) coach.use('move')
    expect(coach.learned('move')).toBe(false)
    coach.use('move')
    expect(coach.learned('move')).toBe(true)
    expect(coach.count('move')).toBe(need)
  })

  it('mastery is per input family: a desktop veteran on a phone has not learned the touch controls', async () => {
    const { coach } = await import('@/game/coach')
    const { hud } = await import('@/game/state/hud')
    coach.reset()
    hud.device = 'mouse'
    for (let i = 0; i < 5; i++) coach.use('target')
    expect(coach.learned('target')).toBe(true)
    hud.device = 'touch'
    expect(coach.learned('target')).toBe(false)
    hud.device = 'mouse'
  })

  it('"?" brings every lesson back, and one use retires a recalled one', async () => {
    const { coach, LESSONS } = await import('@/game/coach')
    coach.reset()
    for (const l of LESSONS) for (let i = 0; i < l.need; i++) coach.use(l.id)
    for (const l of LESSONS) expect(coach.learned(l.id), l.id).toBe(true)
    coach.recallAll()
    for (const l of LESSONS) expect(coach.learned(l.id), l.id).toBe(false)
    coach.use('skill')
    expect(coach.learned('skill')).toBe(true)
    expect(coach.learned('move')).toBe(false)
  })

  it('a held stick counts in parts, not per frame', async () => {
    const { coach } = await import('@/game/coach')
    coach.reset()
    for (let i = 0; i < 40; i++) coach.progress('move', 0.02)
    expect(coach.count('move')).toBe(0)
    for (let i = 0; i < 15; i++) coach.progress('move', 0.02)
    expect(coach.count('move')).toBe(1)
  })
})
