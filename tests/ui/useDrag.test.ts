// @vitest-environment jsdom
// Drag and drop on the big screens (`components/game/useDrag.ts`): a mouse
// picks a thing up by moving it, a finger by resting on it (a finger that
// moves first is scrolling), the zone under the pointer decides, and the
// release of a drag is never also a click.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { HOLD_MS, useDrag } from '@/components/game/useDrag'

interface Held { id: string }

/** A screen with one draggable thing and two drop zones. */
const harness = (accepts: (p: Held, zone: string) => boolean, onDrop = vi.fn()) => {
  const clicks = vi.fn()
  let api: ReturnType<typeof useDrag<Held>> | null = null
  const C = defineComponent({
    setup() {
      api = useDrag<Held>({ accepts, onDrop })
      return () => h('div', [
        h('button', { class: 'thing', ...{ onPointerdown: api!.handle({ id: 'sword' }).pointerdown }, onClick: clicks }),
        h('div', { class: 'socket', 'data-drop': 'slot:main' }),
        h('div', { class: 'other', 'data-drop': 'slot:feet' })
      ])
    }
  })
  const w = mount(C, { attachTo: document.body })
  return { w, onDrop, clicks, api: () => api! }
}

/** What `elementFromPoint` answers (jsdom lays nothing out). */
const under = (el: Element | null): void => { document.elementFromPoint = () => el }

const pe = (type: string, o: Partial<PointerEventInit> & { pointerType?: string } = {}): Event => {
  const e = new MouseEvent(type, { bubbles: true, clientX: o.clientX ?? 0, clientY: o.clientY ?? 0, button: 0 }) as MouseEvent & { pointerId: number; pointerType: string }
  Object.defineProperty(e, 'pointerId', { value: 1 })
  Object.defineProperty(e, 'pointerType', { value: o.pointerType ?? 'mouse' })
  return e
}

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('useDrag', () => {
  it('a mouse drags by moving with the button down, and drops on the zone under it', async () => {
    const { w, onDrop, api } = harness(() => true)
    w.find('.thing').element.dispatchEvent(pe('pointerdown', { clientX: 10, clientY: 10 }))
    // Two pixels is a shaky click, not a drag.
    window.dispatchEvent(pe('pointermove', { clientX: 12, clientY: 10 }))
    expect(api().state.active).toBe(false)
    under(w.find('.socket').element)
    window.dispatchEvent(pe('pointermove', { clientX: 60, clientY: 40 }))
    expect(api().state.active).toBe(true)
    expect(api().state.payload).toEqual({ id: 'sword' })
    expect(api().state.over).toBe('slot:main')
    expect(api().state.overOk).toBe(true)
    window.dispatchEvent(pe('pointerup', { clientX: 60, clientY: 40 }))
    expect(onDrop).toHaveBeenCalledWith({ id: 'sword' }, 'slot:main')
    expect(api().state.active).toBe(false)
    await nextTick()
  })

  it('a zone that does not take it is told so, and nothing is dropped', () => {
    const { w, onDrop, api } = harness((_p, zone) => zone === 'slot:main')
    w.find('.thing').element.dispatchEvent(pe('pointerdown'))
    under(w.find('.other').element)
    window.dispatchEvent(pe('pointermove', { clientX: 80 }))
    expect(api().state.over).toBe('slot:feet')
    expect(api().state.overOk).toBe(false)
    window.dispatchEvent(pe('pointerup', { clientX: 80 }))
    expect(onDrop).not.toHaveBeenCalled()
  })

  it('the release of a drag is not a click on what it was let go over', () => {
    const { w, clicks } = harness(() => true)
    const thing = w.find('.thing').element as HTMLButtonElement
    thing.dispatchEvent(pe('pointerdown'))
    under(null)
    window.dispatchEvent(pe('pointermove', { clientX: 90 }))
    window.dispatchEvent(pe('pointerup', { clientX: 90 }))
    thing.click()
    expect(clicks).not.toHaveBeenCalled()
    // A plain click afterwards is a click again.
    thing.dispatchEvent(pe('pointerdown'))
    window.dispatchEvent(pe('pointerup'))
    thing.click()
    expect(clicks).toHaveBeenCalledTimes(1)
  })

  it('a finger picks up only after resting on it; a finger that moves first is scrolling', () => {
    vi.useFakeTimers()
    const { w, onDrop, api } = harness(() => true)
    const thing = w.find('.thing').element
    // Scrolling: the finger moves off before the hold is up.
    thing.dispatchEvent(pe('pointerdown', { pointerType: 'touch', clientX: 10, clientY: 10 }))
    window.dispatchEvent(pe('pointermove', { pointerType: 'touch', clientX: 10, clientY: 40 }))
    vi.advanceTimersByTime(HOLD_MS + 50)
    expect(api().state.active).toBe(false)
    window.dispatchEvent(pe('pointerup', { pointerType: 'touch' }))
    // Resting: picked up, then carried and let go on a socket.
    thing.dispatchEvent(pe('pointerdown', { pointerType: 'touch', clientX: 10, clientY: 10 }))
    vi.advanceTimersByTime(HOLD_MS + 10)
    expect(api().state.active).toBe(true)
    under(w.find('.socket').element)
    window.dispatchEvent(pe('pointermove', { pointerType: 'touch', clientX: 100, clientY: 10 }))
    window.dispatchEvent(pe('pointerup', { pointerType: 'touch', clientX: 100, clientY: 10 }))
    expect(onDrop).toHaveBeenCalledWith({ id: 'sword' }, 'slot:main')
  })

  it('while a finger carries something, the page under it does not scroll', () => {
    vi.useFakeTimers()
    const { w } = harness(() => true)
    w.find('.thing').element.dispatchEvent(pe('pointerdown', { pointerType: 'touch' }))
    vi.advanceTimersByTime(HOLD_MS + 10)
    const move = new Event('touchmove', { cancelable: true })
    window.dispatchEvent(move)
    expect(move.defaultPrevented).toBe(true)
  })
})
