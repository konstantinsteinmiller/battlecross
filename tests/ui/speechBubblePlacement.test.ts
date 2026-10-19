// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import SpeechBubble from '@/components/dialog/SpeechBubble.vue'

// A bubble blinked out for a frame on phones: DialogLayer marked its root as
// placed with classList, and any re-render of the root's bound `class` (the
// "next" cue, the emotion) reset className, so `visibility: hidden` came back
// until the next frame. The layer now marks placement with data attributes.
describe('speech bubble placement marks', () => {
  it('keeps the data attributes the layer set across class re-renders', async () => {
    const w = mount(SpeechBubble, { props: { text: 'Hi', tail: true }, global: { stubs: { GameIcon: true } } })
    const el = w.element as HTMLElement
    el.setAttribute('data-placed', '')
    el.toggleAttribute('data-tail-up', true)
    await w.setProps({ cue: true })
    await w.setProps({ emotion: 'shout' })
    expect(el.hasAttribute('data-placed')).toBe(true)
    expect(el.hasAttribute('data-tail-up')).toBe(true)
    expect(el.className).toContain('is-shout')
    await nextTick()
  })

  it('DialogLayer marks placement with attributes, never classes', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const src = readFileSync(resolve(__dirname, '../../src/components/dialog/DialogLayer.vue'), 'utf8')
    expect(src).not.toMatch(/classList\.(add|toggle)\('(is-placed|tail-up|no-tail)'/)
    expect(src).toContain("setAttribute('data-placed'")
  })
})
