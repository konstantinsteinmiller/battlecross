// @vitest-environment jsdom
// Drag-to-scroll strips (`use/useDragScroll.ts`), e.g. the hub's sector
// strip: a picked card scrolls fully into view, moving the strip as little as
// possible, and never when it is already in view.

import { describe, expect, it } from 'vitest'
import { revealLeft } from '@/use/useDragScroll'

describe('revealLeft', () => {
  // A 300 px wide view over cards 100 px wide.
  it('leaves a card that is already in view alone', () => {
    expect(revealLeft(0, 300, 100, 100)).toBe(0)
    expect(revealLeft(50, 300, 100, 100)).toBe(50)
  })
  it('scrolls right just far enough for a card cut off on the right (with padding)', () => {
    expect(revealLeft(0, 300, 500, 100)).toBe(500 + 100 + 12 - 300)
  })
  it('scrolls left to a card cut off on the left, never past 0', () => {
    expect(revealLeft(400, 300, 200, 100)).toBe(188)
    expect(revealLeft(400, 300, 4, 100)).toBe(0)
  })
  it('lines up a card wider than the view with its left edge', () => {
    expect(revealLeft(0, 300, 500, 400)).toBe(488)
  })
})

describe('useDragScroll', () => {
  const setup = async () => {
    const { mount } = await import('@vue/test-utils')
    const { defineComponent, h, ref } = await import('vue')
    const { useDragScroll } = await import('@/use/useDragScroll')
    const clicks: number[] = []
    const w = mount(defineComponent({
      setup() {
        const strip = ref<HTMLElement | null>(null)
        useDragScroll(strip)
        return () => h('div', { ref: strip }, [h('button', { onClick: () => clicks.push(1) })])
      }
    }), { attachTo: document.body })
    const el = w.element as HTMLElement
    Object.defineProperty(el, 'scrollWidth', { value: 1000 })
    Object.defineProperty(el, 'clientWidth', { value: 300 })
    el.setPointerCapture = () => {}
    const btn = el.querySelector('button')!
    const ev = (type: string, x: number, pointerType = 'mouse') =>
      btn.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, pointerId: 1, pointerType, button: 0 }))
    return { w, el, btn, ev, clicks }
  }

  it('a mouse drag scrolls the strip and swallows the click that ends it', async () => {
    const { w, el, btn, ev, clicks } = await setup()
    el.scrollLeft = 100
    ev('pointerdown', 200)
    ev('pointermove', 120)
    expect(el.scrollLeft).toBe(180)
    ev('pointerup', 120)
    btn.click()
    expect(clicks).toHaveLength(0)
    w.unmount()
  })

  it('a press that barely moves is still a click, and a tap after a drag is never swallowed', async () => {
    const { w, el, btn, ev, clicks } = await setup()
    ev('pointerdown', 200)
    ev('pointermove', 203)
    ev('pointerup', 203)
    btn.click()
    expect(clicks).toHaveLength(1)
    // A drag released outside the strip (no click follows), then a touch tap.
    ev('pointerdown', 200)
    ev('pointermove', 100)
    el.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, pointerType: 'mouse' }))
    ev('pointerdown', 50, 'touch')
    btn.click()
    expect(clicks).toHaveLength(2)
    w.unmount()
  })
})
