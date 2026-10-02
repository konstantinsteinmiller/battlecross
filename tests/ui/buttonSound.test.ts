// @vitest-environment jsdom
// #114 sound pass: every button answers with a click; a disabled one stays
// silent and does nothing. The HUD chips answer the same way (#45).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const played = vi.hoisted(() => [] as string[])
vi.mock('@/game/audio/sfx', () => ({ sfx: (n: string) => { played.push(n) } }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, te: () => false }) }))

import FButton from '@/components/atoms/FButton.vue'
import FHudButton from '@/components/atoms/FHudButton.vue'

describe('FButton', () => {
  it('clicks, and emits', async () => {
    played.length = 0
    const w = mount(FButton, { props: { label: 'Go' } })
    await w.trigger('click')
    expect(played).toEqual(['uiClick'])
    expect(w.emitted('click')).toHaveLength(1)
  })

  it('a disabled button is silent and emits nothing', async () => {
    played.length = 0
    const w = mount(FButton, { props: { label: 'Go', isDisabled: true } })
    await w.trigger('click')
    expect(played).toEqual([])
    expect(w.emitted('click')).toBeUndefined()
  })

  it('wears its type as a tone class, and its disabled state as a class', () => {
    expect(mount(FButton, { props: { label: 'Go', type: 'success' } }).classes()).toContain('tone-success')
    const off = mount(FButton, { props: { label: 'Go', isDisabled: true } })
    expect(off.classes()).toContain('is-disabled')
    expect(off.attributes('disabled')).toBeDefined()
  })
})

describe('FHudButton', () => {
  it('clicks, and emits', async () => {
    played.length = 0
    const w = mount(FHudButton, { props: { icon: 'pause', ariaLabel: 'Pause' } })
    await w.trigger('click')
    expect(played).toEqual(['uiClick'])
    expect(w.emitted('click')).toHaveLength(1)
  })

  it('a disabled chip is silent and emits nothing', async () => {
    played.length = 0
    const w = mount(FHudButton, { props: { icon: 'pause', ariaLabel: 'Pause', isDisabled: true } })
    await w.trigger('click')
    expect(played).toEqual([])
    expect(w.emitted('click')).toBeUndefined()
  })
})
