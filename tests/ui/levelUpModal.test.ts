// @vitest-environment jsdom
// ─── The level-up pick says how many, which one, and that the click counted ──
//
// From a playtest: after a mission with several level-ups, "the upgrade modal
// has bad feedback on which upgrade was clicked and granted and how many you
// have to pick and how many you have picked already … after clicking one
// upgrade the screen doesn't change". The old modal granted the stat and
// redrew the same three cards under the same badge (the level REACHED).
//
// Pinned here: one pip per banked level-up, labelled with the level it was
// earned at; a pick spends one at once (it is saved) but locks input for the
// beat, so a double-click can't spend two; the pip, badge and count move on
// when the "+N" chip lands; and the modal closes only after the last pick's
// finished state has been held, never on the click itself.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import { flow } from '@/game/flow'
import { profile } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import LevelUpModal from '@/components/modals/LevelUpModal.vue'
import { PICK_PACE, pickLevels, pipWindow } from '@/components/modals/levelUpPick'

const celebrate = vi.fn()
vi.mock('@/game/boot', () => ({ currentHub: () => ({ celebrate }) }))
vi.mock('@/game/audio/sfx', () => ({ sfx: vi.fn() }))
vi.mock('@/game/flow', async () => {
  const { reactive } = await import('vue')
  return { flow: reactive({ modal: '' as string }) }
})

// FModal measures its ribbon with a ResizeObserver, which jsdom lacks.
vi.stubGlobal('ResizeObserver', class {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
})

const i18n = () => createI18n({ legacy: false, locale: 'en', messages: { en } })

/** Open the modal with `pending` picks banked at `level`. */
const openWith = (level: number, pending: number) => {
  profile.level = level
  profile.hero.pendingAttrs = pending
  profile.hero.attrs = { hp: 0, we: 0, power: 0 }
  profile.hero.skills = {}
  flow.modal = 'levelUp'
  return mount(LevelUpModal, { global: { plugins: [i18n()], stubs: { teleport: true } } })
}

type W = ReturnType<typeof openWith>
const pipTexts = (w: W) => w.findAll('.pip').map(p => p.text())
const pipState = (w: W) => w.findAll('.pip').map(p =>
  (p.classes('spent') ? 'spent' : p.classes('active') ? 'active' : 'todo'))
const statValue = (w: W, a: string) => Number(w.get(`.stat.${a} .s-val`).text().replace(/\D/g, ''))
const advance = async (ms: number) => {
  await vi.advanceTimersByTimeAsync(ms)
  await nextTick()
}

enableAutoUnmount(afterEach)
beforeEach(() => {
  vi.useFakeTimers()
  vi.mocked(sfx).mockClear()
  celebrate.mockClear()
})
afterEach(() => {
  vi.useRealTimers()
  flow.modal = ''
})

describe('the pick row shows how many picks and which one is being spent', () => {
  it('one pip per pending pick, labelled with the level it was earned at', () => {
    const w = openWith(6, 3)
    expect(pipTexts(w)).toEqual(['4', '5', '6'])
    expect(pipState(w)).toEqual(['active', 'todo', 'todo'])
    // The badge is the level being SPENT, not the level reached.
    expect(w.get('.badge .n').text()).toBe('4')
    expect(w.get('.left').text()).toBe('3')
    const bar = w.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuemax')).toBe('3')
    expect(bar.attributes('aria-valuenow')).toBe('0')
    expect(bar.attributes('aria-label')).toBe('Choose 3 system upgrade(s)!')
  })

  it('a long backlog draws a sliding window with the cut counts at its ends', () => {
    expect(pipWindow(12, 0)).toEqual({ start: 0, end: 7, before: 0, after: 5 })
    expect(pipWindow(12, 11)).toEqual({ start: 5, end: 12, before: 5, after: 0 })
    expect(pipWindow(3, 1)).toEqual({ start: 0, end: 3, before: 0, after: 0 })
    expect(pickLevels(6, 3)).toEqual([4, 5, 6])
    const w = openWith(20, 12)
    expect(w.findAll('.pip')).toHaveLength(7)
    expect(w.get('.more').text()).toBe('+5')
  })

  it('opening with nothing to spend closes instead of showing an empty pick', async () => {
    openWith(5, 0)
    await nextTick()
    expect(flow.modal).toBe('')
  })
})

describe('a pick is visibly granted, and a double-click cannot spend two', () => {
  it('spends one at once, locks input for the beat, then moves on to the next level', async () => {
    const w = openWith(6, 3)
    const hp0 = statValue(w, 'hp')
    await w.get('.card.hp').trigger('click')
    // Spent (and saved) on the click itself…
    expect(profile.hero.pendingAttrs).toBe(2)
    expect(profile.hero.attrs.hp).toBe(1)
    expect(sfx).toHaveBeenCalledWith('attrPick')
    expect(celebrate).toHaveBeenCalledTimes(1)
    expect(w.get('.card.hp').classes()).toContain('picked')
    expect(w.get('.card.we').classes()).toContain('dim')
    expect(w.find('.flyer').exists()).toBe(true)
    // …and locked: a second click, or a key, during the beat does nothing.
    expect(w.get('.card.we').attributes('aria-disabled')).toBe('true')
    await w.get('.card.we').trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit2' }))
    await nextTick()
    expect(profile.hero.pendingAttrs).toBe(2)
    expect(profile.hero.attrs.we).toBe(0)

    // In flight: the row has not moved yet.
    await advance(PICK_PACE.fly - 1)
    expect(pipState(w)).toEqual(['active', 'todo', 'todo'])
    // The chip lands: that level's pip ticks off with the chosen glyph, the
    // badge rolls on to the next level, the count drops.
    await advance(1)
    expect(pipState(w)).toEqual(['spent', 'active', 'todo'])
    expect(w.findAll('.pip')[0]!.classes()).toContain('hp')
    expect(w.get('.badge .n').text()).toBe('5')
    expect(w.get('.left').text()).toBe('2')
    expect(w.find('.flyer').exists()).toBe(false)
    expect(w.get('.card.hp').classes()).not.toContain('picked')

    // Still locked until the beat is over.
    await w.get('.card.we').trigger('click')
    expect(profile.hero.pendingAttrs).toBe(2)
    await advance(PICK_PACE.lock - PICK_PACE.fly)
    expect(w.get('.card.we').attributes('aria-disabled')).toBe('false')
    // The stat has counted up to its new value by now.
    await advance(PICK_PACE.count)
    expect(statValue(w, 'hp')).toBe(hp0 + 10)

    await w.get('.card.we').trigger('click')
    expect(profile.hero.pendingAttrs).toBe(1)
    expect(profile.hero.attrs.we).toBe(1)
  })

  it('1 / 2 / 3 pick by keyboard', async () => {
    const w = openWith(4, 2)
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit3' }))
    await nextTick()
    expect(profile.hero.attrs.power).toBe(1)
    expect(w.get('.card.power').classes()).toContain('picked')
  })
})

describe('the last pick finishes before the modal closes', () => {
  it('holds every pip ticked and the check, then closes', async () => {
    const w = openWith(3, 2)
    await w.get('.card.hp').trigger('click')
    await advance(PICK_PACE.lock)
    await w.get('.card.power').trigger('click')
    expect(profile.hero.pendingAttrs).toBe(0)
    // The last pick plays the full fanfare, not the light confirm.
    expect(vi.mocked(sfx).mock.calls.map(c => c[0])).toEqual(['attrPick', 'levelUp'])
    // Not on the click…
    expect(flow.modal).toBe('levelUp')
    await advance(PICK_PACE.fly)
    // …the finished state: all pips ticked, the badge a check, no count left.
    expect(pipState(w)).toEqual(['spent', 'spent'])
    expect(w.get('.badge').classes()).toContain('done')
    expect(w.find('.left').exists()).toBe(false)
    expect(flow.modal).toBe('levelUp')
    // Input stays locked through the hold.
    await w.get('.card.we').trigger('click')
    expect(profile.hero.attrs.we).toBe(0)
    await advance(PICK_PACE.hold - 1)
    expect(flow.modal).toBe('levelUp')
    await advance(1)
    expect(flow.modal).toBe('')
  })
})
