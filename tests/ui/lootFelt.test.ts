// @vitest-environment jsdom
// Loot that is felt (roadmap #5), the UI half: a new find goes on straight
// from the result screen ("Equip" → "Equipped", disabled while the hero is
// too low), and the green "better" arrow shows on the result, in the bag's
// grid and on the socket the bag has something better for.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k), te: () => false }) }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/game/engine/quality', () => ({ sceneQuality: () => 'low' }))
vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))

type P = typeof import('@/game/state/profile')
type F = typeof import('@/game/flow')
let p: P
let f: F
let w: VueWrapper | null = null

// The modal measures its header; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class { observe(): void {} unobserve(): void {} disconnect(): void {} } as unknown as typeof ResizeObserver

const $ = <T extends Element = HTMLElement>(sel: string): T | null => document.querySelector<T>(sel)
const $$ = (sel: string): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(sel)]

const showResults = async (items: string[]): Promise<void> => {
  for (const id of items) p.gainItem(id)
  f.flow.results = {
    node: 'plains' as never, outcome: 'victory', xp: 10, gold: 5, goldLost: 0, kills: 3,
    items: items.map(id => ({ id, added: true, gold: 0 })),
    levelBefore: p.profile.level, levelAfter: p.profile.level, seconds: 60, firstClear: false, unlocked: [], waves: 0
  }
  f.flow.modal = 'results'
  const ResultsModal = (await import('@/components/modals/ResultsModal.vue')).default
  // The rank badge reads the live board: not this spec's business.
  w = mount(ResultsModal, { attachTo: document.body, global: { stubs: { RankBadge: true } } })
  await nextTick()
}

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  p.initProfile()
})
afterEach(() => {
  w?.unmount()
  w = null
  document.body.innerHTML = ''
  drainPersist()
})

describe('the result screen', () => {
  it('equips a new find on the spot and says so', async () => {
    p.profile.level = 6
    await showResults(['ironBroadsword'])
    const row = $$('.loot')[0]!
    // Better than the rusted sword the hero starts with.
    expect(row.querySelector('.loot__up')).toBeTruthy()
    const btn = row.querySelector<HTMLButtonElement>('.loot__act button')!
    expect(btn.disabled).toBe(false)
    btn.click()
    await nextTick()
    expect(p.profile.inv.equipped.main).toBe('ironBroadsword')
    expect(row.querySelector('.loot__done')?.textContent).toContain('results.equipped')
    expect(row.querySelector('.loot__act button')).toBeNull()
    expect(row.querySelector('.loot__up')).toBeNull()
  })

  it('cannot equip a find above the hero\'s level', async () => {
    p.profile.level = 1
    await showResults(['ironBroadsword'])
    const btn = $<HTMLButtonElement>('.loot__act button')!
    expect(btn.disabled).toBe(true)
    btn.click()
    await nextTick()
    expect(p.profile.inv.equipped.main).toBe('rustedShortsword')
  })
})

describe('the bag', () => {
  it('marks a better piece in the grid, and the socket it would improve', async () => {
    p.profile.level = 6
    p.gainItem('ironBroadsword')
    f.flow.modal = 'inventory'
    const HeroBook = (await import('@/components/screens/hero/HeroBook.vue')).default
    w = mount(HeroBook, { attachTo: document.body })
    await nextTick()
    expect($('.bag__grid [data-item="ironBroadsword"] .item-cell__up')).toBeTruthy()
    // What is worn gets no arrow.
    expect($('.bag__grid [data-item="rustedShortsword"] .item-cell__up')).toBeNull()
    expect($('.doll__socket[data-slot="main"] .doll__up')).toBeTruthy()
    expect($('.doll__socket[data-slot="body"] .doll__up')).toBeNull()
    p.equipItem('ironBroadsword')
    await nextTick()
    expect($('.doll__socket[data-slot="main"] .doll__up')).toBeNull()
  })
})
