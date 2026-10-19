// @vitest-environment jsdom
// The zone badge: the place's emblem, name, level and the clearing (a count over
// a row of gems) in ONE badge, which replaced the two chips that said it twice.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) }) }))

import ZoneBadge from '@/components/hud/ZoneBadge.vue'
import { hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { onboard } from '@/game/coach/state'

beforeEach(() => {
  flow.screen = 'zone'
  hud.zoneKey = 'plains'
  hud.zoneLevel = 3
  hud.groupsDone = 1
  hud.groupsTotal = 4
  hud.wave = 0
  hud.arenaMod = ''
  onboard.goal = null
})

describe('ZoneBadge', () => {
  it('shows the emblem, name, level, the count and one gem per group', () => {
    const w = mount(ZoneBadge)
    expect(w.find('.zone__slot').exists()).toBe(true)
    expect(w.find('.zone__name').text()).toBe('node.plains.name')
    expect(w.find('.zone__level').text()).toContain('"n":3')
    expect(w.find('.zone__count').text()).toBe('1/4')
    expect(w.findAll('.zone__pips i')).toHaveLength(4)
    expect(w.findAll('.zone__pips i.on')).toHaveLength(1)
  })

  it('a town shows the name only', () => {
    flow.screen = 'town'
    const w = mount(ZoneBadge)
    expect(w.find('.zone__name').exists()).toBe(true)
    expect(w.find('.zone__progress').exists()).toBe(false)
    expect(w.find('.zone__level').exists()).toBe(false)
  })

  it('the colosseum counts waves and keeps its weekly modifier on show', () => {
    hud.zoneKey = 'arena'
    hud.wave = 3
    hud.arenaMod = 'swift'
    const w = mount(ZoneBadge)
    expect(w.find('.zone__count').text()).toBe('3')
    expect(w.findAll('.zone__pips i.on')).toHaveLength(2)
    expect(w.find('[data-arena-mod]').exists()).toBe(true)
  })

  it('is a tap target only while the clear goal is the goal', () => {
    expect(mount(ZoneBadge).element.tagName).toBe('DIV')
    onboard.goal = { id: 'clear', place: 'plains', n: 1, of: 4 }
    expect(mount(ZoneBadge).element.tagName).toBe('BUTTON')
  })

  it('the clear goal chip steps aside for it, in the zone', () => {
    const src = readFileSync('src/components/hud/GoalTracker.vue', 'utf8')
    expect(src).toMatch(/id === 'clear' && flow\.screen === 'zone'/)
  })
})
