// @vitest-environment jsdom
// #114 sound pass: every button answers with a click; a disabled one stays
// silent and does nothing.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const played = vi.hoisted(() => [] as string[])
vi.mock('@/game/audio/sfx', () => ({ sfx: (n: string) => { played.push(n) } }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

import FButton from '@/components/atoms/FButton.vue'

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
})
