// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { installLazyCode } from '../stubs/lazyCode'

/**
 * The Goblin King's hoard: laid out once, about two seconds after the finale
 * falls the first time; the pick goes into the visit's finds and the finale
 * chest stops rolling a piece of its own.
 */

vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {}, reportLadder: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {}, canOfferReward: { value: false }, isRewardGated: false, adInFlight: { value: false }, claimReward: async () => false }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: () => {} }))

type Flow = typeof import('@/game/flow')
type W = typeof import('@/game/sim/world')
type P = typeof import('@/game/state/profile')
let f: Flow
let w: W
let p: P
let sim: InstanceType<W['Sim']>

const liveScene = async (invaded = false): Promise<void> => {
  const { ZoneMode } = await import('@/game/modes/zoneMode')
  const { createHero } = await import('@/game/sim/hero')
  const { noGear } = await import('@/game/data/items')
  const { startAttrs } = await import('@/game/data/attributes')
  sim = new w.Sim({ seed: 3, w: 40, h: 40, level: 4, difficulty: 1, mode: 'zone', zone: 'hollows' })
  createHero(sim, { build: { level: 4, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: 20, z: 20, xpInto: 0, potions: 1 })
  sim.chests.push({
    id: 0, x: 22, z: 20, sx: 22, sz: 21, tier: 'gold', role: 'finale', state: 'closed', door: -1, guard: -1, special: '', openedAt: 0,
    loot: [{ kind: 'item', gold: 0, u: 0.3, item: '' }, { kind: 'gold', gold: 50, u: 0, item: '' }]
  } as never)
  const z = Object.create(ZoneMode.prototype) as InstanceType<typeof ZoneMode>
  Object.assign(z, { sim, setup: { kind: 'zone', invaded }, talkNpc: 0, talkFace: 0, talkOn: false, talkHold: 0 })
  const { app } = await import('@/game/engine/app')
  ;(app as { mode: unknown }).mode = z
}

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  w = await import('@/game/sim/world')
  await installLazyCode()
  p.initProfile()
  f.flow.node = 'hollows'
  f.flow.modal = ''
  f.flow.talk = ''
  f.flow.loading = false
  await liveScene()
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

describe('the Goblin King\'s hoard', () => {
  it('is laid out the first time: three cards, a window up', () => {
    expect(f.offerKingHoard()).toBe(true)
    expect(f.flow.modal).toBe('kingHoard')
    expect(f.hoard.picks).toHaveLength(3)
  })

  it('waits (asks again) while another window is up', () => {
    f.flow.modal = 'pause'
    expect(f.offerKingHoard()).toBe(false)
    expect(f.hoard.picks).toHaveLength(0)
  })

  it('taking a card: it joins the visit\'s finds, the chest keeps only its purse, the window shuts, never again', () => {
    f.offerKingHoard()
    const id = f.hoard.picks[1]!.id
    f.claimKingHoard(id)
    expect(f.flow.modal).toBe('')
    expect(sim.hero.items).toContain(id)
    const chest = sim.chests[0]!
    expect(chest.loot.map(d => d.kind)).toEqual(['gold'])
    expect(p.profile.tips[f.KING_HOARD_TIP]).toBe(true)
    // Asked again (a reload mid-victory): handled, nothing laid out.
    expect(f.offerKingHoard()).toBe(true)
    expect(f.flow.modal).toBe('')
  })

  it('a card that is not on the table cannot be claimed', () => {
    f.offerKingHoard()
    f.claimKingHoard('dragonSmasher')
    expect(sim.hero.items).not.toContain('dragonSmasher')
    expect(f.flow.modal).toBe('kingHoard')
  })

  it('not due elsewhere, after the first clear, in the invaded Hollows or on an encounter', async () => {
    f.flow.node = 'plains'
    expect(f.offerKingHoard()).toBe(true)
    expect(f.flow.modal).toBe('')
    f.flow.node = 'hollows'
    p.clearNode('hollows')
    expect(f.offerKingHoard()).toBe(true)
    expect(f.flow.modal).toBe('')
  })

  it('not due in the invaded Hollows', async () => {
    await liveScene(true)
    expect(f.offerKingHoard()).toBe(true)
    expect(f.flow.modal).toBe('')
  })
})
