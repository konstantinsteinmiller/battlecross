// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

/**
 * A random encounter through the flow (roadmap #67): met on the map, fought
 * behind the travel veil like any zone, and over with the hero back on the
 * map where he was walking — after a win, a retreat or a fall. Portal calls
 * are stubbed; the place is built by a stand-in (no GPU).
 */

const ads = vi.hoisted(() => ({ shown: 0 }))
vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => { ads.shown++ } }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
const funnel = vi.hoisted(() => ({ events: [] as string[] }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: (c: string, w: string, a: string) => { funnel.events.push(`${c}:${w}:${a}`) } }))

type Flow = typeof import('@/game/flow')
type P = typeof import('@/game/state/profile')
type E = typeof import('@/game/data/encounters')
let f: Flow
let p: P
let e: E
const built: Array<{ node: string; encounter?: unknown }> = []

const tally = (over: Partial<import('@/game/flow').VisitTally> = {}): import('@/game/flow').VisitTally =>
  ({ xp: 50, gold: 30, kills: 4, items: [], seconds: 40, waves: 0, ...over })

/** A returning save out on the map, a little way off the road east of the woods. */
const outInTheWilds = (): [number, number] => {
  for (const id of ['plains', 'sunford', 'hollows', 'woods']) p.clearNode(id as never)
  p.profile.world.at = 'woods'
  p.setMapPos(0.47, 0.57)
  return [...p.profile.world.pos] as [number, number]
}

const fight = (): import('@/game/data/encounters').EncounterSpec => ({ kind: 'fight', zone: 'woods', level: 7, seed: 4242, packs: [['spider', 'spider']] })

beforeEach(async () => {
  drainAndResetModules()
  ads.shown = 0
  funnel.events.length = 0
  built.length = 0
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  e = await import('@/game/data/encounters')
  p.initProfile()
  f.setNodeBuilder(async (node, _progress, encounter) => {
    built.push({ node, encounter })
    return { setup: { theme: 'forest' } } as never
  })
})
afterEach(() => { f.setNodeBuilder(null); drainPersist() })

describe('an encounter, start to end', () => {
  it('is built from its own plan, in its region, without moving the hero\'s place or spot', async () => {
    const spot = outInTheWilds()
    await f.startEncounter(fight())
    expect(built).toHaveLength(1)
    expect(built[0]!.node).toBe('woods')
    expect(built[0]!.encounter).toMatchObject({ kind: 'fight', packs: [['spider', 'spider']] })
    expect(f.flow.screen).toBe('zone')
    expect(f.flow.encounter?.kind).toBe('fight')
    expect(p.profile.world.at).toBe('woods')
    expect(p.profile.world.pos).toEqual(spot)
    // The funnel: an encounter is a "level" of its own.
    expect(funnel.events).toEqual(['level:encounter:start'])
  })

  it('a win pays, clears nothing, and Continue lands on the map at the same spot', async () => {
    const spot = outInTheWilds()
    p.profile.world.at = 'sunford'
    const opened = Object.keys(p.profile.world.cleared)
    await f.startEncounter(fight())
    const gold = p.profile.gold
    await f.bankVisit('victory', 'woods', tally())
    const r = f.flow.results!
    expect(r.encounter).toBe(true)
    expect(r.firstClear).toBe(false)
    expect(r.unlocked).toEqual([])
    expect(f.flow.quest).toBe('')
    expect(p.profile.gold).toBe(gold + 30)
    expect(Object.keys(p.profile.world.cleared)).toEqual(opened)
    expect(funnel.events).toEqual(['level:encounter:start', 'level:encounter:complete'])
    await f.leaveResults()
    expect(f.flow.screen).toBe('map')
    expect(f.flow.encounter).toBeNull()
    expect(p.profile.world.pos).toEqual(spot)
    expect(p.profile.world.at).toBe('sunford')
    // No ad of its own: the pacing gate said no.
    expect(ads.shown).toBe(0)
  })

  it('a retreat keeps what was earned and brings him back to the same spot', async () => {
    const spot = outInTheWilds()
    await f.startEncounter(fight())
    p.profile.gold = 500
    await f.bankVisit('retreat', 'woods', tally())
    expect(f.flow.results!.goldLost).toBe(0)
    expect(p.profile.gold).toBe(530)
    f.afterVisit()
    expect(f.flow.screen).toBe('map')
    expect(p.profile.world.pos).toEqual(spot)
    expect(funnel.events.at(-1)).toBe('level:encounter:fail')
  })

  it('a fall costs the usual tenth of the purse, and he is back where he fell', async () => {
    const spot = outInTheWilds()
    await f.startEncounter(fight())
    p.profile.gold = 1000
    await f.bankVisit('defeat', 'woods', tally({ gold: 0 }))
    expect(f.flow.results!.goldLost).toBe(100)
    expect(p.profile.gold).toBe(900)
    expect(p.profile.stats.deaths).toBe(1)
    expect(p.profile.world.cleared).not.toContain('outskirts')
    await f.leaveResults()
    expect(f.flow.screen).toBe('map')
    expect(p.profile.world.pos).toEqual(spot)
  })

  it('Retry meets the same encounter again', async () => {
    outInTheWilds()
    await f.startEncounter(fight())
    await f.bankVisit('defeat', 'woods', tally())
    await f.retryVisit()
    expect(built).toHaveLength(2)
    expect(built[1]!.encounter).toEqual(built[0]!.encounter)
    expect(f.flow.encounter?.seed).toBe(4242)
    expect(f.flow.screen).toBe('zone')
  })

  it('travelling to a place afterwards is an ordinary journey again, and moves his spot to it', async () => {
    outInTheWilds()
    await f.startEncounter(fight())
    await f.bankVisit('victory', 'woods', tally())
    await f.leaveResults()
    await f.travel('sunford')
    expect(f.flow.encounter).toBeNull()
    expect(p.profile.world.at).toBe('sunford')
    expect(p.profile.world.pos).toEqual(p.mapSpot('sunford'))
    expect(built.at(-1)!.encounter).toBeUndefined()
  })

  it('a chest is opened on the map, and a merchant opens his wares there', () => {
    outInTheWilds()
    const gold = p.profile.gold
    const xp = p.lifetimeXp()
    const r = f.openFoundChest({ kind: 'chest', zone: 'woods', level: 7, seed: 1, packs: [] })
    expect(r).toEqual(e.chestReward(7))
    expect(p.profile.gold).toBe(gold + r.gold)
    expect(p.lifetimeXp()).toBe(xp + r.xp)
    f.meetMerchant({ kind: 'merchant', zone: 'woods', level: 7, seed: 1, packs: [] })
    expect(f.flow.modal).toBe('shop')
    expect(f.flow.npc?.id).toBe('wanderer')
    expect(f.flow.npc?.stock?.tiers).toEqual(e.merchantTiers(7))
    f.closeModal()
    expect(f.flow.npc).toBeNull()
  })

  it('a chest or a merchant never builds a fight', async () => {
    await f.startEncounter({ kind: 'chest', zone: 'woods', level: 7, seed: 1, packs: [] })
    expect(built).toHaveLength(0)
    expect(f.flow.encounter).toBeNull()
  })
})

describe('the hero\'s spot on the map, in the save', () => {
  it('a new save stands him at the plains', () => {
    expect(p.profile.world.pos).toEqual(p.mapSpot('plains'))
  })

  it('is saved and read back', () => {
    p.setMapPos(0.31, 0.62)
    p.saveProfile()
    p.loadProfile()
    expect(p.profile.world.pos).toEqual([0.31, 0.62])
  })

  it('a save from before the free map stands him at his place', async () => {
    const gs = await holdGameState()
    const { WORLD_KEY } = await import('@/keys')
    p.profile.world.at = 'sunford'
    p.saveProfile()
    const old = { ...(gs.getState(WORLD_KEY) as Record<string, unknown>) }
    delete old.pos
    gs.setState(WORLD_KEY, old)
    p.loadProfile()
    expect(p.profile.world.at).toBe('sunford')
    expect(p.profile.world.pos).toEqual(p.mapSpot('sunford'))
    // A broken one too.
    gs.setState(WORLD_KEY, { ...old, pos: ['x', 3] })
    p.loadProfile()
    expect(p.profile.world.pos).toEqual(p.mapSpot('sunford'))
  })
})
