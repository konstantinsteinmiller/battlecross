// @vitest-environment jsdom
// The hero's book (D39, D40): three pages of one full screen, opened on the
// page `flow.modal` names; the paper-doll with a socket per equipment slot;
// the loadout and the codex; the character sheet's six "+". Driven by clicks
// and checked against the save.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k), te: () => false }) }))
vi.mock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
// A low-end device: the paper-doll shows the drawn portrait, never a renderer.
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

const $ = <T extends Element = HTMLElement>(sel: string): T | null => document.querySelector<T>(sel)
const $$ = (sel: string): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(sel)]
const click = async (el: Element | null | undefined): Promise<void> => {
  expect(el, 'the element to click').toBeTruthy()
  ;(el as HTMLElement).click()
  await nextTick()
}

const openBook = async (page: 'character' | 'skills' | 'inventory'): Promise<void> => {
  f.flow.modal = page
  const HeroBook = (await import('@/components/screens/hero/HeroBook.vue')).default
  w = mount(HeroBook, { attachTo: document.body })
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

describe('the book', () => {
  it('opens on the page flow.modal names, and its tabs turn the pages', async () => {
    await openBook('inventory')
    const tabs = $$('.book__tab')
    expect(tabs.map(t => t.dataset.page)).toEqual(['character', 'skills', 'inventory'])
    expect($('.equip')).toBeTruthy()
    await click($('.book__tab[data-page="character"]'))
    expect(f.flow.modal).toBe('character')
    await nextTick()
    await new Promise(r => setTimeout(r, 0))
    await click($('.book__tab[data-page="skills"]'))
    expect(f.flow.modal).toBe('skills')
  })
})

describe('the paper-doll', () => {
  it('has a socket for every equipment slot, placed by its slot id', async () => {
    const { EQUIP_SLOTS } = await import('@/game/data/items')
    await openBook('inventory')
    expect($$('.doll__socket').map(s => s.dataset.slot)).toEqual([...EQUIP_SLOTS])
    expect($$('.doll__socket').every(s => s.classList.contains(`doll__socket--${s.dataset.slot}`))).toBe(true)
    // Filled sockets show the piece; empty ones the ghost of what goes there.
    expect($('.doll__socket[data-slot="main"] .doll__face')).toBeTruthy()
    expect($('.doll__socket[data-slot="trinket1"] .doll__ghost')).toBeTruthy()
  })

  it('a tap looks at a piece (and clears its "new" mark); a second tap wears it', async () => {
    p.profile.level = 8
    p.gainItem('chainmailVest')
    await openBook('inventory')
    const cell = $('.bag__grid .cell[data-item="chainmailVest"]')
    expect(cell!.querySelector('.cell__new')).toBeTruthy()
    await click(cell)
    expect(p.profile.inv.fresh).not.toContain('chainmailVest')
    // The card compares it with what is worn in its slot, and the socket it would take calls.
    expect($('.item-card__versus')).toBeTruthy()
    expect($('.doll__socket[data-slot="body"]')!.classList.contains('is-target')).toBe(true)
    // The stats it would change are shown before anything is worn.
    expect($$('.equip__stats .stat.is-up').length).toBeGreaterThan(0)
    await click($('.bag__grid .cell[data-item="chainmailVest"]'))
    expect(p.profile.inv.equipped.body).toBe('chainmailVest')
  })

  it('the lit socket takes the piece in hand; a tapped socket shows what it holds, a second tap takes it off', async () => {
    p.profile.level = 8
    p.gainItem('copperBand')
    await openBook('inventory')
    await click($('.bag__grid .cell[data-item="copperBand"]'))
    await click($('.doll__socket[data-slot="trinket2"]'))
    expect(p.profile.inv.equipped.trinket2).toBe('copperBand')
    await click($('.doll__socket[data-slot="main"]'))
    expect($('.equip__card .item-card')).toBeTruthy()
    await click($('.doll__socket[data-slot="main"]'))
    expect(p.profile.inv.equipped.main).toBeNull()
  })

  it('a piece above the hero\'s level says so and cannot be worn', async () => {
    p.gainItem('dragonSmasher')
    await openBook('inventory')
    const cell = $('.bag__grid .cell[data-item="dragonSmasher"]')
    expect(cell!.querySelector('.item-cell__lock')).toBeTruthy()
    await click(cell)
    expect($('.equip-card__note')!.textContent).toContain('bag.tooLow')
    const equip = $$('.bag__actions button').at(-1) as HTMLButtonElement
    expect(equip.disabled).toBe(true)
    await click(cell)
    expect(p.profile.inv.equipped.main).toBe('rustedShortsword')
  })

  it('filters by kind of gear', async () => {
    p.gainItem('copperBand')
    await openBook('inventory')
    const all = $$('.bag__grid .cell').length
    await click($$('.bag__filter')[3])
    expect($$('.bag__grid .cell').map(c => c.dataset.item)).toEqual(['copperBand'])
    await click($$('.bag__filter')[0])
    expect($$('.bag__grid .cell')).toHaveLength(all)
  })
})

describe('the skills page', () => {
  it('six active sockets in the battle bar\'s order and three passive ones', async () => {
    await openBook('skills')
    expect($$('.loadout--active .slot')).toHaveLength(6)
    expect($$('.loadout--passive .slot')).toHaveLength(3)
    expect($$('.emblem')).toHaveLength(8)
    expect($$('.codex__path .node')).toHaveLength(6)
  })

  it('a learned skill tapped, then a slot tapped: it is slotted there', async () => {
    p.profile.gold = 10_000
    p.learnSkill('fireball')
    // It went to the first free slot; move it to the sixth by hand.
    await openBook('skills')
    await click($$('.emblem')[2])
    const fireball = $$('.codex__path .node')[0]!
    await click(fireball)
    await click($('.slot[data-drop="active:5"]'))
    expect(p.profile.hero.active[5]).toBe('fireball')
    expect(p.profile.hero.active[1]).toBe('')
  })

  it('a skill not learned yet says where it is taught', async () => {
    await openBook('skills')
    await click($$('.emblem')[2])
    await click($$('.codex__path .node')[0])
    expect($('.skills__note')!.textContent).toContain('skills.hint')
    expect($('.skills__note')!.textContent).toContain('node.sunford.name')
  })
})

describe('the character page', () => {
  it('six "+" buttons spend the points; each attribute says what its next point buys', async () => {
    p.profile.hero.points = 2
    await openBook('character')
    const plus = $$('.attr__plus') as HTMLButtonElement[]
    expect(plus).toHaveLength(6)
    expect($$('.attr__gain').length).toBeGreaterThan(0)
    const str = p.profile.hero.attrs.str
    await click(plus[0])
    expect(p.profile.hero.attrs.str).toBe(str + 1)
    expect(p.profile.hero.points).toBe(1)
    await click(plus[0])
    expect(plus.every(b => b.disabled)).toBe(true)
  })
})
