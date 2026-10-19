// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

/**
 * A panel waits up to ~300 ms for its images before it shows (D149): held
 * (laid out, invisible) while an `<img>` in it decodes, shown the moment it
 * has, and shown anyway once the wait is over.
 */

/** Each image's decode, resolved by the test. */
let decodes: Array<() => void> = []

const load = async () => {
  vi.resetModules()
  return import('@/use/useArtGate')
}

const panel = (gate: Awaited<ReturnType<typeof load>>, src: string) => defineComponent({
  setup () {
    const root = ref<HTMLElement | null>(null)
    const held = gate.useArtGate(root)
    return () => h('div', { ref: root, class: 'panel', style: gate.artHold(held.value) }, [h('img', { src })])
  }
})

describe('a panel waits a moment for its pictures', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    delete (HTMLImageElement.prototype as { decode?: unknown }).decode
    decodes = []
  })

  it('is held while an image decodes, and shows the moment it has', async () => {
    ;(HTMLImageElement.prototype as { decode?: unknown }).decode = () => new Promise<void>(resolve => decodes.push(resolve))
    const gate = await load()
    const w = mount(panel(gate, '/images/icons/ui-close.webp'))
    await nextTick()
    expect(w.find('.panel').attributes('style')).toContain('visibility: hidden')
    expect(decodes.length).toBeGreaterThan(0)
    decodes.forEach(d => d())
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()
    expect(w.find('.panel').attributes('style') ?? '').not.toContain('visibility')
    w.unmount()
  })

  it('opens anyway once the wait is over', async () => {
    vi.useFakeTimers()
    ;(HTMLImageElement.prototype as { decode?: unknown }).decode = () => new Promise<void>(() => {})
    const gate = await load()
    const w = mount(panel(gate, '/images/ui/bg-skills.webp'))
    await nextTick()
    expect(w.find('.panel').attributes('style')).toContain('visibility: hidden')
    await vi.advanceTimersByTimeAsync(gate.ART_HOLD_MS - 50)
    expect(w.find('.panel').attributes('style')).toContain('visibility: hidden')
    await vi.advanceTimersByTimeAsync(60)
    await nextTick()
    expect(w.find('.panel').attributes('style') ?? '').not.toContain('visibility')
    w.unmount()
  })

  it('holds nothing where images cannot be decoded on demand', async () => {
    const gate = await load()
    const w = mount(panel(gate, '/images/icons/ui-plus.webp'))
    await nextTick()
    expect(w.find('.panel').attributes('style') ?? '').not.toContain('visibility')
    w.unmount()
  })
})
