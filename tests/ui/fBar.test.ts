// @vitest-environment jsdom
// The one bar (D42): what moves is a transform, the frame decides the
// ornaments, and a painted frame replaces the drawn one.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import FBar from '@/components/atoms/FBar.vue'

const scale = (el: Element): number => Number(/scaleX\(([\d.]+)\)/.exec((el as HTMLElement).style.transform)?.[1] ?? NaN)

describe('FBar', () => {
  it('fills by scaleX and nothing else (no width, no layout)', () => {
    const w = mount(FBar, { props: { value: 0.62 } })
    const fill = w.find('.f-bar__fill').element as HTMLElement
    expect(scale(fill)).toBeCloseTo(0.62, 4)
    expect(fill.style.width).toBe('')
    expect(scale(w.find('.f-bar__ghost').element)).toBeCloseTo(0.62, 4)
  })

  it('clamps a value outside 0..1 and survives NaN', () => {
    expect(scale(mount(FBar, { props: { value: 1.7 } }).find('.f-bar__fill').element)).toBe(1)
    expect(scale(mount(FBar, { props: { value: -3 } }).find('.f-bar__fill').element)).toBe(0)
    expect(scale(mount(FBar, { props: { value: NaN } }).find('.f-bar__fill').element)).toBe(0)
  })

  it('marks 25, 50 and 75 % (three ticks), and can go without', () => {
    expect(mount(FBar, { props: { value: 1 } }).findAll('.f-bar__ticks i')).toHaveLength(3)
    expect(mount(FBar, { props: { value: 1, ticks: false } }).find('.f-bar__ticks').exists()).toBe(false)
  })

  it('the ghost lags a loss and jumps with a gain', async () => {
    const w = mount(FBar, { props: { value: 0.8 } })
    await w.setProps({ value: 0.5 })
    await nextTick()
    // A loss: the class that lets the ghost follow at once is gone, so its
    // own (delayed) transition drains it.
    expect(w.classes()).not.toContain('is-rising')
    expect(scale(w.find('.f-bar__ghost').element)).toBeCloseTo(0.5, 4)
    await w.setProps({ value: 0.9 })
    await nextTick()
    expect(w.classes()).toContain('is-rising')
  })

  it('hangs the shield off the end of the fill, and lays it over the end of a full bar', () => {
    const part = mount(FBar, { props: { value: 0.5, shield: 0.2 } }).find('.f-bar__shield').element as HTMLElement
    expect(part.style.transform).toBe('translateX(50%) scaleX(0.2)')
    const full = mount(FBar, { props: { value: 1, shield: 0.25 } }).find('.f-bar__shield').element as HTMLElement
    expect(full.style.transform).toBe('translateX(75%) scaleX(0.25)')
    expect(mount(FBar, { props: { value: 0.5 } }).find('.f-bar__shield').exists()).toBe(false)
  })

  it('a low bar says so with a class; the number and the name are optional', () => {
    const w = mount(FBar, { props: { value: 0.1, low: true, text: 12, label: 'Health 12 of 120' } })
    expect(w.classes()).toContain('is-low')
    expect(w.find('.f-bar__text').text()).toBe('12')
    expect(w.attributes('role')).toBe('img')
    expect(w.attributes('aria-label')).toBe('Health 12 of 120')
    expect(mount(FBar, { props: { value: 0.1 } }).find('.f-bar__text').exists()).toBe(false)
  })

  it('frames by rank: plain and xp carry no ornament, the boss the most', () => {
    const orn = (frame: string): number => mount(FBar, { props: { value: 1, frame: frame as 'plain' } }).findAll('.f-bar__orn').length
    expect(orn('plain')).toBe(0)
    expect(orn('xp')).toBe(0)
    expect(orn('hero')).toBe(2) // the heart cap and a finial
    expect(orn('mana')).toBe(2)
    expect(orn('elite')).toBe(2) // two wings
    expect(orn('champion')).toBe(3) // a crest and two finials
    expect(orn('boss')).toBe(5) // two wings, two gems, the crown between its horns
    const boss = mount(FBar, { props: { value: 1, frame: 'boss' } })
    expect(boss.find('.f-bar__crown').exists()).toBe(true)
    expect(boss.findAll('.f-bar__gem')).toHaveLength(2)
    expect(boss.findAll('.f-bar__wing')).toHaveLength(2)
    expect(boss.classes()).toContain('f-bar--boss')
  })

  it('a painted frame replaces the drawn ornaments and the bezel', () => {
    const w = mount(FBar, { props: { value: 1, frame: 'boss', art: '/images/ui/bar-frame-boss.webp' } })
    expect(w.classes()).toContain('has-art')
    expect(w.findAll('.f-bar__orn')).toHaveLength(0)
    expect(w.find('.f-bar__bezel').exists()).toBe(false)
    const art = w.find('.f-bar__art').element as HTMLElement
    expect(art.style.borderImageSource).toContain('bar-frame-boss.webp')
    // No file dropped in (the test stub has none): the drawn frame stands.
    expect(mount(FBar, { props: { value: 1, frame: 'boss' } }).find('.f-bar__art').exists()).toBe(false)
  })
})
