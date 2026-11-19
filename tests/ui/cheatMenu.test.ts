// @vitest-environment jsdom
// The cheat menu: the phone's tap code (fifty taps on the health bar inside forty seconds), switching cheat mode on in
// localStorage, and what the menu does: skip to the second arc, set a level with its attribute points, unlock every skill.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, te: () => false }) }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
vi.mock('@/game/engine/quality', () => ({ sceneQuality: () => 'low' }))
vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {}, reportLadder: async () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {}, canOfferReward: { value: false }, isRewardGated: false, adInFlight: { value: false }, claimReward: async () => false }))
vi.mock('@/utils/pokiPlugin', () => ({ pokiMeasure: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
globalThis.ResizeObserver ??= class { observe(): void {} unobserve(): void {} disconnect(): void {} } as unknown as typeof ResizeObserver

type P = typeof import('@/game/state/profile')
type F = typeof import('@/game/flow')
let p: P
let f: F
let w: VueWrapper | null = null
const $ = (sel: string): HTMLElement | null => document.querySelector<HTMLElement>(sel)
const click = async (sel: string): Promise<void> => { $(sel)!.click(); await nextTick() }

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  localStorage.removeItem('cheat')
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

const open = async (): Promise<void> => {
  const CheatModal = (await import('@/components/modals/CheatModal.vue')).default
  w = mount(CheatModal, { attachTo: document.body })
  await nextTick()
}

describe('the phone door', () => {
  it('fifty taps inside forty seconds switch cheat mode on and open the menu; fewer, or too slow, do nothing', async () => {
    const { registerCheatTap, __resetCheatTaps, CHEAT_TAPS } = await import('@/use/useCheatTap')
    __resetCheatTaps()
    f.flow.modal = ''
    for (let i = 0; i < CHEAT_TAPS - 1; i++) expect(registerCheatTap(1000 + i * 100)).toBe(false)
    expect(f.flow.modal).toBe('')
    expect(registerCheatTap(1000 + (CHEAT_TAPS - 1) * 100)).toBe(true)
    expect(f.flow.modal).toBe('cheat')
    expect(localStorage.getItem('cheat')).toBe('true')
    // Fifty taps spread over more than forty seconds never add up.
    f.flow.modal = ''
    localStorage.removeItem('cheat')
    __resetCheatTaps()
    for (let i = 0; i < CHEAT_TAPS + 20; i++) expect(registerCheatTap(10_000_000 + i * 1000)).toBe(false)
    expect(f.flow.modal).toBe('')
    expect(localStorage.getItem('cheat')).toBeNull()
  })
})

describe('the cheat menu', () => {
  it('skips to the second arc: every place cleared, the afterplay open, level 30 with its points', async () => {
    await open()
    await click('[data-cheat-arc2]')
    expect(p.profile.world.afterplay).toBe(true)
    expect(p.profile.world.cleared).toEqual(expect.arrayContaining(['plains', 'hollows', 'rift']))
    expect(p.profile.level).toBeGreaterThanOrEqual(30)
  })

  it('sets a level and gives the attribute points that level earns, counting what is already spent', async () => {
    await open()
    p.profile.hero.attrs.str += 4
    const input = $('[data-cheat-level]') as HTMLInputElement
    input.value = '12'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    await click('[data-cheat-set-level]')
    expect(p.profile.level).toBe(12)
    // 3 points a level from level 2, minus the 4 already in Strength.
    expect(p.profile.hero.points).toBe(3 * 11 - 4)
  })

  it('unlocks every skill with one button', async () => {
    await open()
    const { ENDGAME_SKILLS, SKILLS } = await import('@/game/data/skills')
    await click('[data-cheat-skills]')
    for (const s of [...SKILLS, ...ENDGAME_SKILLS]) expect(p.profile.hero.learned).toContain(s.id)
  })

  it('switches cheat mode off again', async () => {
    localStorage.setItem('cheat', 'true')
    f.flow.modal = 'cheat'
    await open()
    await click('[data-cheat-off]')
    expect(localStorage.getItem('cheat')).toBeNull()
    expect(f.flow.modal).toBe('')
  })
})
