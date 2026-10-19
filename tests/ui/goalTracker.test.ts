// @vitest-environment jsdom
// The goal chip: a tap on "spend your points" opens the hero sheet.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
vi.mock('@/game/audio/sfx', () => ({ sfx: () => {} }))

import GoalTracker from '@/components/hud/GoalTracker.vue'
import { flow } from '@/game/flow'
import { onboard } from '@/game/coach/state'

beforeEach(() => {
  flow.modal = ''
  flow.talk = null as never
  flow.loading = false as never
  flow.screen = 'town' as never
})

describe('GoalTracker', () => {
  it('opens the character sheet when the points goal is tapped', async () => {
    onboard.goal = { id: 'points', n: 7, of: 0 }
    const w = mount(GoalTracker)
    await w.get('button.goal').trigger('click')
    expect(flow.modal).toBe('character')
  })
  it('opens the skills sheet for the learn goal, and never over another window', async () => {
    onboard.goal = { id: 'learn' }
    const w = mount(GoalTracker)
    flow.modal = 'shop' as never
    await w.get('button.goal').trigger('click')
    expect(flow.modal).toBe('shop')
  })
})
