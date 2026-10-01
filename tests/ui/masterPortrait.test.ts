// @vitest-environment jsdom
// The Masters' baked portraits (`scripts/render-portraits.mjs`) and the
// component the hub and the outro show them with: framed in the signature
// colour, greyed once beaten, a silhouette while locked.

import { describe, expect, it, vi } from 'vitest'
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

import MasterPortrait from '@/components/atoms/MasterPortrait.vue'
import { MASTER_COLOR } from '@/game/data/signature'

describe('the baked portraits', () => {
  it('exist for every Master and Vex, and stay small', () => {
    for (const id of Object.keys(MASTER_COLOR)) {
      const f = resolve(__dirname, '../../public/images/masters', `${id}.webp`)
      expect(existsSync(f), id).toBe(true)
      expect(statSync(f).size, id).toBeLessThan(12 * 1024)
    }
  })
})

describe('MasterPortrait', () => {
  it('shows the Master in their signature colour, named for screen readers', () => {
    const w = mount(MasterPortrait, { props: { id: 'blazeMaster', state: 'next' } })
    const el = w.get('.portrait')
    expect(w.get('img').attributes('src')).toMatch(/images\/masters\/blazeMaster\.webp$/)
    expect(el.attributes('style')).toContain(MASTER_COLOR.blazeMaster)
    expect(el.attributes('aria-label')).toBe('boss.blazeMaster')
    expect(el.classes()).toContain('next')
  })

  it('hides the face, the colour and the name while locked', () => {
    const w = mount(MasterPortrait, { props: { id: 'neonMaster', state: 'locked' } })
    const el = w.get('.portrait')
    expect(el.attributes('style')).not.toContain(MASTER_COLOR.neonMaster)
    expect(el.attributes('aria-label')).toBe('hud.bossUnknown')
    expect(w.find('.q').exists()).toBe(true)
  })

  it('wears a tick once beaten', () => {
    const w = mount(MasterPortrait, { props: { id: 'scrapper', state: 'beaten' } })
    expect(w.find('.tick').exists()).toBe(true)
  })
})
