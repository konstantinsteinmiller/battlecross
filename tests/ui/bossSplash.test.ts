// @vitest-environment jsdom
// The stage select's boss splash (#103): a story mission's build shows its
// Master inside the beam's own wait; a job's does not.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'

const flow = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
vi.mock('@/game/flow', async () => {
  const { reactive } = await import('vue')
  flow.value = reactive({ loading: true, loadingSector: 'magnet', loadingBoss: 'magnetMaster', loadProgress: 0.3 })
  return { flow: flow.value }
})

import MissionLoading from '@/components/hud/MissionLoading.vue'

describe('the boss splash', () => {
  it('shows the Master of a story mission while it builds', () => {
    const w = mount(MissionLoading, { global: { stubs: { Transition: false } } })
    expect(w.find('.splash').exists()).toBe(true)
    expect(w.find('.splash .name').text()).toBe('boss.magnetMaster')
    expect(w.find('.splash img').attributes('src')).toMatch(/magnetMaster\.webp$/)
  })

  it('a job builds without it', async () => {
    ;(flow.value as { loadingBoss: string }).loadingBoss = ''
    const w = mount(MissionLoading, { global: { stubs: { Transition: false } } })
    expect(w.find('.splash').exists()).toBe(false)
  })
})
void reactive
