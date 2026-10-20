// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { installLazyCode } from '../stubs/lazyCode'

/**
 * A conversation's truce (roadmap #153): the hero cannot be hurt or picked
 * while he listens, it is lifted by every way a conversation ends, and a
 * watchdog lifts one that stuck.
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
type Tr = typeof import('@/game/sim/truce')
type W = typeof import('@/game/sim/world')
let f: Flow
let k: T
let tr: Tr
let w: W
let sim: InstanceType<W['Sim']>

/** A live scene for `flow` to talk in: the real `setTalk` on a real sim, no renderer. */
const liveScene = async (): Promise<void> => {
  const { ZoneMode } = await import('@/game/modes/zoneMode')
  const { createHero } = await import('@/game/sim/hero')
  const { noGear } = await import('@/game/data/items')
  const { startAttrs } = await import('@/game/data/attributes')
  const { spawnEnemy } = await import('@/game/sim/spawn')
  sim = new w.Sim({ seed: 3, w: 40, h: 40, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
  createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: 20, z: 20, xpInto: 0, potions: 1 })
  spawnEnemy(sim, 'goblin', 22, 20, 0)
  const z = Object.create(ZoneMode.prototype) as InstanceType<typeof ZoneMode>
  Object.assign(z, { sim, talkNpc: 0, talkFace: 0, talkOn: false, talkHold: 0 })
  const { app } = await import('@/game/engine/app')
  ;(app as { mode: unknown }).mode = z
}

const hear = (): void => {
  for (let i = 0; i < 40 && k.talk.on && k.talk.phase === 'line'; i++) k.talkNext()
}

/** Hurt, picked, or neither. */
const exposed = (): boolean => {
  const goblin = sim.units.find(u => u.team === 1)!
  return !w.outOfReach(sim.hero.unit) && sim.nearest(0, goblin.x, goblin.z, 30) === sim.hero.unit
}

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  const p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  k = await import('@/game/talk')
  tr = await import('@/game/sim/truce')
  w = await import('@/game/sim/world')
  await installLazyCode()
  p.initProfile()
  await liveScene()
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

describe('in a conversation the hero is untouchable (#153)', () => {
  it('no foe picks him, no blow or spell lands on him', async () => {
    const { dealDamage, applyStatus } = await import('@/game/sim/combat')
    f.talkTo('sunfordSmith')
    expect(tr.inTruce(sim)).toBe(true)
    expect(exposed()).toBe(false)
    const goblin = sim.units.find(u => u.team === 1)!
    const hp = sim.hero.unit.hp
    expect(dealDamage(sim, goblin, sim.hero.unit, 50, { type: 'physical' })).toBe(0)
    expect(applyStatus(sim, sim.hero.unit, 'stun', 2, 1, goblin)).toBeNull()
    expect(sim.hero.unit.hp).toBe(hp)
  })

  it('lifted when he says goodbye', () => {
    f.talkTo('sunfordSmith')
    hear()
    expect(k.talkLeave()).toBe(true)
    hear()
    expect(f.flow.talk).toBe('')
    expect(tr.inTruce(sim)).toBe(false)
    expect(exposed()).toBe(true)
  })

  it('kept while a window the conversation opened is up, lifted when the talk then ends', () => {
    f.talkTo('sunfordSmith')
    hear()
    k.talkPick('trade')
    hear()
    expect(f.flow.modal).toBe('shop')
    expect(tr.inTruce(sim)).toBe(true)
    f.closeModal()
    hear()
    expect(tr.inTruce(sim)).toBe(true)
    k.talkLeave()
    hear()
    expect(tr.inTruce(sim)).toBe(false)
  })

  it('lifted when travelling away drops the conversation', () => {
    f.talkTo('sunfordSmith')
    expect(tr.inTruce(sim)).toBe(true)
    f.flow.loading = true
    expect(f.flow.talk).toBe('')
    expect(tr.inTruce(sim)).toBe(false)
  })
})

describe('the truce watchdog (#153)', () => {
  it('every ~3 s: a truce with no conversation or window open is lifted', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const watch = { t: 0 }
    tr.setTruce(sim, true)
    // A menu is open: left alone.
    for (let t = 0; t < 4; t += 0.1) tr.watchTruce(sim, watch, 0.1, true)
    expect(tr.inTruce(sim)).toBe(true)
    // Nothing open: gone within one period.
    let lifted = false
    for (let t = 0; t < tr.TRUCE_CHECK + 0.2 && !lifted; t += 0.1) lifted = tr.watchTruce(sim, watch, 0.1, false)
    expect(lifted).toBe(true)
    expect(tr.inTruce(sim)).toBe(false)
    expect(exposed()).toBe(true)
  })

  it('leaves a hero without a truce alone', () => {
    const watch = { t: 0 }
    for (let t = 0; t < 10; t += 0.1) expect(tr.watchTruce(sim, watch, 0.1, false)).toBe(false)
  })
})
