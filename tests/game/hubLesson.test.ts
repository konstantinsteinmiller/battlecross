// The first-return upgrade tour (src/components/hub/hubLesson.ts). Its steps
// follow the game's own state — the open tab, the selected item, the two
// upgrade levels — never a timer, so a player who side-steps is guided
// back. It runs once, skips players who already upgraded something, and
// tops the wallet up once so the lesson's button is never greyed out.
//
// On screen (HubLesson.vue): the hand is on the target in the tour's first
// frame and never leaves between steps, and a press on the dimmed screen
// pulses the live step. A blind playtester who tapped faster than the old
// fade-in saw a dimmed hub with no hand and took it for a lock-up.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { profile, equipped } from '@/game/state/profile'
import { starterItems, upgradeCost } from '@/game/data/items'
import {
  hubLesson, hubTab, workshopSel, wantsHubLesson, startHubLesson, syncHubLesson, endHubLesson
} from '@/components/hub/hubLesson'
import HubLesson from '@/components/hub/HubLesson.vue'

// HubLesson.vue's game-side imports, reduced to what it reads: the lab is on
// screen with nothing on top, on a touch device. The hand glyph is stubbed
// (its drawing is InputGlyph's business, not the tour's).
vi.mock('@/game/boot', () => ({ input: { device: 'touch' }, currentHub: () => null }))
vi.mock('@/game/flow', () => ({ flow: { modal: '', loading: false, screen: 'hub' } }))
vi.mock('@/use/useModalState', () => ({ isAnyModalOpen: { value: false } }))
vi.mock('@/game/audio/sfx', () => ({ sfx: () => {} }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
vi.mock('@/components/hud/InputGlyph.vue', () => ({ default: { name: 'InputGlyph', render: () => null } }))

const upgrade = (slot: 'buster' | 'chest') => {
  const it = equipped(slot)!
  profile.bolts -= upgradeCost(it)
  it.upg++
  syncHubLesson()
}

beforeEach(() => {
  profile.tips = {}
  profile.bolts = 0
  profile.stats.missions = 1
  profile.inv.items = starterItems()
  profile.inv.equipped = { buster: 'start_buster', helmet: 'start_helm', chest: 'start_body', boots: 'start_boots', chip1: null, chip2: null }
  hubLesson.step = null
  hubLesson.granted = 0
  hubTab.value = 'missions'
  workshopSel.value = null
})

describe('when the tour runs', () => {
  it('after the first mission, not before', () => {
    profile.stats.missions = 0
    expect(wantsHubLesson()).toBe(false)
    profile.stats.missions = 1
    expect(wantsHubLesson()).toBe(true)
  })

  it('skips (for good) a player who already found the Workshop', () => {
    profile.inv.items[0]!.upg = 2
    expect(wantsHubLesson()).toBe(false)
    expect(profile.tips['lesson:upgrade']).toBe(true)
  })

  it('once: ending it (finished or closed) retires it', () => {
    startHubLesson()
    endHubLesson()
    expect(hubLesson.step).toBeNull()
    expect(wantsHubLesson()).toBe(false)
  })
})

describe('the wallet top-up', () => {
  it('covers exactly the two upgrades, once', () => {
    const need = upgradeCost(equipped('buster')!) + upgradeCost(equipped('chest')!)
    profile.bolts = 40
    startHubLesson()
    expect(profile.bolts).toBe(need)
    expect(hubLesson.granted).toBe(need - 40)
    endHubLesson()
    delete profile.tips['lesson:upgrade']
    profile.bolts = 0
    startHubLesson()
    expect(profile.bolts).toBe(0)
  })

  it('adds nothing to a player who can already afford it', () => {
    profile.bolts = 5000
    startHubLesson()
    expect(profile.bolts).toBe(5000)
    expect(hubLesson.granted).toBe(0)
  })
})

describe('the steps follow the game state', () => {
  it('Workshop → buster → chest armour → upgrade it → Missions', () => {
    startHubLesson()
    expect(hubLesson.step).toBe('workshop')
    hubTab.value = 'workshop'
    syncHubLesson()
    expect(hubLesson.step).toBe('upgradeBuster')
    expect(workshopSel.value).toBe('start_buster')
    upgrade('buster')
    expect(hubLesson.step).toBe('pickArmor')
    workshopSel.value = 'start_body'
    syncHubLesson()
    expect(hubLesson.step).toBe('upgradeArmor')
    upgrade('chest')
    expect(hubLesson.step).toBe('deploy')
    hubTab.value = 'missions'
    syncHubLesson()
    expect(hubLesson.step).toBeNull()
    expect(profile.tips['lesson:upgrade']).toBe(true)
  })

  it('a player who wanders off is walked back', () => {
    startHubLesson()
    hubTab.value = 'workshop'
    syncHubLesson()
    upgrade('buster')
    workshopSel.value = 'start_body'
    syncHubLesson()
    expect(hubLesson.step).toBe('upgradeArmor')
    // Selects something else: back to "pick the armour".
    workshopSel.value = 'start_helm'
    syncHubLesson()
    expect(hubLesson.step).toBe('pickArmor')
    // Leaves the Workshop: back to its tab.
    hubTab.value = 'hero'
    syncHubLesson()
    expect(hubLesson.step).toBe('workshop')
  })

  it('keeps the upgrade button on the buster while that is the lesson', () => {
    startHubLesson()
    hubTab.value = 'workshop'
    workshopSel.value = 'start_helm'
    syncHubLesson()
    expect(workshopSel.value).toBe('start_buster')
  })
})

// ─── On screen ───────────────────────────────────────────────────────────────

type Box = { left: number; top: number; width: number; height: number }

/** A hub anchor with a fixed on-screen box (jsdom lays nothing out). */
const place = <T extends HTMLElement>(el: T, b: Box): T => {
  el.getBoundingClientRect = () => ({
    left: b.left, top: b.top, width: b.width, height: b.height, x: b.left, y: b.top,
    right: b.left + b.width, bottom: b.top + b.height, toJSON: () => ({})
  })
  return el
}
const anchor = (lesson: string, b: Box, tag: 'button' | 'div' = 'button'): HTMLElement => {
  const el = place(document.createElement(tag), b)
  el.dataset.lesson = lesson
  document.body.append(el)
  return el
}
/** Where the hand's fingertip sits (the guide's translate). */
const handAt = (w: VueWrapper): [number, number] => {
  const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(w.find('.guide').attributes('style') ?? '')
  return m ? [Number(m[1]), Number(m[2])] : [Number.NaN, Number.NaN]
}
/** The tap point the tour aims at: 62 % across, 60 % down the button. */
const tapPoint = (b: Box): [number, number] => [b.left + b.width * 0.62, b.top + b.height * 0.6]

describe('the tour on screen', () => {
  const TAB: Box = { left: 300, top: 700, width: 80, height: 50 }
  // Animation frames are queued and only run when a test says so: whatever
  // is on screen before `frame()` is the tour's first frame.
  let frames: FrameRequestCallback[] = []
  const frame = () => frames.splice(0).forEach(cb => cb(performance.now()))
  let w: VueWrapper | null = null

  /** Mounts the tour in a calm lab and lets its start timer run. */
  const startTour = async (): Promise<VueWrapper> => {
    w = mount(HubLesson, { attachTo: document.body })
    vi.advanceTimersByTime(900)
    await nextTick()
    return w
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    frames = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => {})
    anchor('tab-workshop', TAB)
  })
  afterEach(() => {
    w?.unmount()
    w = null
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('shows the hand on its first frame, already on the target', async () => {
    const w = await startTour()
    expect(hubLesson.step).toBe('workshop')
    expect(w.find('.guide').exists()).toBe(true)
    const [x, y] = handAt(w)
    const [tx, ty] = tapPoint(TAB)
    expect(x).toBeCloseTo(tx)
    expect(y).toBeCloseTo(ty)
    // The hole is open around the target, everything else fenced off.
    expect(w.find('.hole').exists()).toBe(true)
    expect(w.findAll('.block')).toHaveLength(4)
  })

  it('answers a press on the dimmed screen by pulsing the live step, and nothing else', async () => {
    const w = await startTour()
    await w.find('.block').trigger('pointerdown')
    expect(w.find('.hole').classes()).toContain('pulse-a')
    expect(w.find('.kick').classes()).toContain('pulse-a')
    expect(hubLesson.step).toBe('workshop')
    expect(hubTab.value).toBe('missions')
    // Every press restarts it: the class swaps to a copy of the animation.
    await w.findAll('.block')[2]!.trigger('pointerdown')
    expect(w.find('.hole').classes()).toContain('pulse-b')
    // Then it clears, so a hole opened later never replays a stale pulse.
    vi.advanceTimersByTime(800)
    await nextTick()
    expect(w.find('.hole').classes()).not.toContain('pulse-a')
    expect(w.find('.hole').classes()).not.toContain('pulse-b')
  })

  it('keeps the hand on screen while the next target slides in', async () => {
    const w = await startTour()
    const onTab = handAt(w)
    // The Workshop tab's own click; its panel is still on the way in.
    hubTab.value = 'workshop'
    await nextTick()
    await nextTick()
    expect(hubLesson.step).toBe('upgradeBuster')
    expect(w.find('.hole').exists()).toBe(false)
    expect(w.findAll('.block')).toHaveLength(1)
    expect(handAt(w)).toEqual(onTab)
    // It arrives: the next frame opens the hole there, and the hand goes to
    // the upgrade button inside the lit block.
    const BTN: Box = { left: 120, top: 460, width: 160, height: 44 }
    const block = anchor('upgrade', { left: 100, top: 380, width: 200, height: 140 }, 'div')
    block.append(place(document.createElement('button'), BTN))
    frame()
    await nextTick()
    expect(w.find('.hole').exists()).toBe(true)
    const [x, y] = handAt(w)
    const [tx, ty] = tapPoint(BTN)
    expect(x).toBeCloseTo(tx)
    expect(y).toBeCloseTo(ty)
  })

  it('takes the hand away with the tour', async () => {
    const w = await startTour()
    await w.find('.skip').trigger('click')
    expect(w.find('.guide').exists()).toBe(false)
    expect(w.find('.block').exists()).toBe(false)
    expect(profile.tips['lesson:upgrade']).toBe(true)
  })
})
