// @vitest-environment jsdom
// The trade table (D38): the merchant's shelf, the hero's bag, the piece on
// the table and the one action that is the deal; the buy-back row; the
// trainer's lesson and the healer's belt on the same frame. The screens are
// driven by clicks, as a player drives them, and checked against the save.

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
let modal: typeof import('@/use/useModalState')
let w: VueWrapper | null = null

const $ = <T extends Element = HTMLElement>(sel: string): T | null => document.querySelector<T>(sel)
const $$ = (sel: string): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(sel)]
const click = async (el: Element | null): Promise<void> => {
  expect(el, 'the element to click').toBeTruthy()
  ;(el as HTMLElement).click()
  await nextTick()
}
/** The deal button: the last one in the actions row. */
const act = (): HTMLButtonElement => $$('.shop__actions button, .trainer__actions button').at(-1) as HTMLButtonElement

const open = async (which: 'TradeScreen' | 'TeachScreen' | 'HealerScreen', npc: string): Promise<void> => {
  const comp = (await import(`@/components/screens/trade/${which}.vue`)).default
  f.flow.npc = f.npcById(npc)
  f.flow.trainerCls = f.flow.npc?.cls ?? ''
  w = mount(comp, { attachTo: document.body })
  await nextTick()
}

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/flow')
  modal = await import('@/use/useModalState')
  p.initProfile()
})
afterEach(() => {
  w?.unmount()
  w = null
  document.body.innerHTML = ''
  drainPersist()
})

describe('the merchant\'s table', () => {
  it('is a full screen that pauses the game while it is up, and Esc closes it', async () => {
    f.flow.modal = 'shop'
    await open('TradeScreen', 'sunfordSmith')
    expect($('.screen')).toBeTruthy()
    expect(modal.isAnyModalOpen.value).toBe(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape' }))
    await nextTick()
    expect(f.flow.modal).toBe('')
    w!.unmount()
    w = null
    expect(modal.isAnyModalOpen.value).toBe(false)
  })

  it('a ware is put on the table, then bought with the one big action', async () => {
    p.profile.gold = 1000
    await open('TradeScreen', 'sunfordSmith')
    const wares = $$('.ware')
    expect(wares.length).toBeGreaterThan(3)
    // What the hero already owns is marked so, and cannot be bought twice.
    expect($$('.ware.is-owned').map(el => el.dataset.item)).toEqual(expect.arrayContaining(['rustedShortsword', 'woodenBuckler', 'paddedTunic']))
    const ware = $<HTMLElement>('.ware:not(.is-owned)')!
    const id = ware.dataset.item!
    await click(ware)
    expect($('.trade__table .item-card')).toBeTruthy()
    const cost = p.buyCost(id)
    await click(act())
    expect(p.owns(id)).toBe(true)
    expect(p.profile.gold).toBe(1000 - cost)
    // The deal is stamped, and the ware shows as owned now.
    expect($('.deal-stamp')).toBeTruthy()
    expect($(`.ware[data-item="${id}"]`)!.classList.contains('is-owned')).toBe(true)
    expect(act().disabled).toBe(true)
  })

  it('too light a purse: the action is refused and the table says why', async () => {
    p.profile.gold = 0
    await open('TradeScreen', 'sunfordSmith')
    await click($('.ware:not(.is-owned)'))
    expect(act().disabled).toBe(true)
    expect($('.trade__why')!.textContent).toContain('trainer.block.gold')
  })

  it('selling pays a quarter; what was sold waits on the buy-back row at that price', async () => {
    p.profile.gold = 0
    p.gainItem('copperBand')
    await open('TradeScreen', 'sunfordSmith')
    await click($('.trade__bag .cell[data-item="copperBand"]'))
    await click(act())
    const paid = p.profile.gold
    expect(paid).toBeGreaterThan(0)
    expect(p.owns('copperBand')).toBe(false)
    expect($$('.trade__back .back').map(el => el.dataset.item)).toEqual(['copperBand'])
    // Bought back for exactly what it fetched.
    await click($('.trade__back .back'))
    await click(act())
    expect(p.owns('copperBand')).toBe(true)
    expect(p.profile.gold).toBe(0)
    expect($('.trade__back')).toBeNull()
  })

  it('worn gear is not sold: the table offers to take it off first', async () => {
    await open('TradeScreen', 'sunfordSmith')
    await click($('.trade__bag .cell[data-item="rustedShortsword"]'))
    expect(act().disabled).toBe(true)
    expect($('.trade__why')!.textContent).toContain('bag.worn')
    const takeOff = $$('.shop__actions button')[0]!
    await click(takeOff)
    expect(p.profile.inv.equipped.main).toBeNull()
    expect(act().disabled).toBe(false)
  })

  it('the sales of a visit are final once the hero turns to someone else', async () => {
    p.gainItem('copperBand')
    await open('TradeScreen', 'sunfordSmith')
    await click($('.trade__bag .cell[data-item="copperBand"]'))
    await click(act())
    expect(p.buyBack).toHaveLength(1)
    f.flow.npc = f.npcById('sunfordPeddler')
    await nextTick()
    expect(p.buyBack).toHaveLength(0)
  })
})

describe('the trainer\'s lesson', () => {
  it('six lessons; learning one costs its fee and puts it in the first free slot', async () => {
    p.profile.gold = 5000
    await open('TeachScreen', 'trainerPyro')
    const lessons = $$('.lesson')
    expect(lessons).toHaveLength(6)
    await click(lessons[0]!)
    const cost = p.skillCost('fireball')
    await click(act())
    expect(p.knows('fireball')).toBe(true)
    expect(p.profile.gold).toBe(5000 - cost)
    expect(p.profile.hero.active[1]).toBe('fireball')
    expect($('.deal-stamp')).toBeTruthy()
  })

  it('a lesson out of reach says why and cannot be bought', async () => {
    p.profile.gold = 5000
    await open('TeachScreen', 'trainerPyro')
    await click($$('.lesson')[5]!)
    expect(act().disabled).toBe(true)
    expect($('.trade__why')!.textContent).toContain('trainer.block.level')
    // The hero's attributes are set against what the lesson asks.
    expect($$('.teach__attr.is-need').length).toBeGreaterThan(0)
  })
})

describe('the healer\'s stall', () => {
  it('sells a fourth flask and mana potions up to the belt\'s size', async () => {
    p.profile.gold = 10_000
    await open('HealerScreen', 'sunfordHealer')
    expect($$('.heal__belt .flask.is-on')).toHaveLength(3)
    await click($('.heal__buy-slot'))
    expect(p.profile.inv.potions).toBe(4)
    expect($$('.heal__belt .flask.is-on')).toHaveLength(4)
    for (let i = 0; i < 6 && $('.heal__buy-mana'); i++) await click($('.heal__buy-mana'))
    expect(p.profile.inv.manaPotions).toBe(4)
    expect($$('.heal__mana .flask.is-on')).toHaveLength(4)
    expect($('.heal__buy-mana')).toBeNull()
  })
})
