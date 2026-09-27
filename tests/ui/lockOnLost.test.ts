// ─── The lock-on HUD dims for a target out of sight ──────────────────────────
//
// While the lock's grace holds a target that has gone out of sight (behind a
// wall or a pillar), the target frame (`TargetFrame.vue`, from the `hud`
// mirror) and the lock bracket (`Crosshair.vue`, per frame from
// `Mission.targetHidden`) turn faint, grey and dashed, and come back whole the
// moment it is seen again. A playtester read the old, unchanged frame as a
// lock on a drone he could neither see nor hit.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const g = vi.hoisted(() => ({ mission: null as unknown }))
vi.mock('@/game/boot', () => ({ currentMission: () => g.mission }))

import en from '@/i18n/locales/en'
import TargetFrame from '@/components/hud/TargetFrame.vue'
import Crosshair from '@/components/hud/Crosshair.vue'
import { hud, tickHud } from '@/game/state/hud'
import { baseStats } from '@/game/sim/stats'

const i18n = () => createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en } })
const source = (rel: string): string => readFileSync(resolve(__dirname, '../..', rel), 'utf8')
/** A top-level sass rule: its selector line and the indented lines under it. */
const block = (css: string, selector: string): string => {
  const lines = css.split('\n')
  const at = lines.indexOf(selector)
  expect(at).toBeGreaterThan(-1)
  const end = lines.findIndex((l, k) => k > at && !/^\s/.test(l))
  return lines.slice(at + 1, end).join('\n')
}

enableAutoUnmount(afterEach)
afterEach(() => {
  hud.targetName = ''
  hud.targetHidden = false
  g.mission = null
})

describe('TargetFrame', () => {
  const frame = () => {
    hud.targetName = 'enemy.heli'
    hud.targetLevel = 3
    hud.targetHp01 = 0.5
    hud.targetElite = false
    return mount(TargetFrame, { global: { plugins: [i18n()] } })
  }

  it('dims while the target is out of sight and is whole again once it is seen', async () => {
    const w = frame()
    expect(w.get('.target').classes()).not.toContain('lost')
    hud.targetHidden = true
    await nextTick()
    expect(w.get('.target').classes()).toContain('lost')
    // Still the same lock: name, level and energy stay on show.
    expect(w.text()).toContain('3')
    expect(w.findAll('.cell.on')).toHaveLength(10)
    hud.targetHidden = false
    await nextTick()
    expect(w.get('.target').classes()).not.toContain('lost')
  })

  it('styles the lost state faint, grey and dashed, and fades only on the way out', () => {
    const css = source('src/components/hud/TargetFrame.vue')
    const lost = block(css, '.target.lost')
    // On the frame's children: its own opacity belongs to the enter/leave fade.
    expect(lost).toMatch(/^ {2}\.row, \.cells$/m)
    expect(lost).not.toMatch(/^ {2}(opacity|transition):/m)
    expect(lost).toMatch(/^\s+opacity: 0\.38$/m)
    expect(lost).toMatch(/^\s+filter: grayscale\(1\)$/m)
    expect(lost).toMatch(/^\s+transition: opacity/m)
    expect(lost).toMatch(/outline: 2px dashed/)
    // The plain frame has no transition of its own: restoring is instant.
    expect(block(css, '.target')).not.toMatch(/transition/)
  })
})

describe('Crosshair: the lock bracket', () => {
  type Fake = { targetHidden: boolean; combat: { target: unknown } }
  const fake = (): Fake => ({
    targetHidden: false,
    stats: baseStats(),
    combat: {
      charging: false, charge: 0, recoil: 0,
      target: { x: 0, y: 0, z: -6, state: 'engage', elite: false, def: { aimY: 0.4, hitR: 0.6 } }
    },
    // On screen at (200, 150 − 40 y): the bracket shows.
    project: (_x: number, y: number, _z: number, out: { x: number; y: number; visible: boolean }) => {
      out.x = 200
      out.y = 150 - 40 * y
      out.visible = true
    }
  }) as Fake

  it('dims while the target is out of sight and is whole again the frame it is seen', () => {
    const m = fake()
    g.mission = m
    const w = mount(Crosshair)
    const lock = w.get('.lock').element as HTMLElement
    tickHud(1 / 60)
    expect(lock.style.opacity).toBe('1')
    expect(lock.dataset.lost).toBe('')
    m.targetHidden = true
    tickHud(1 / 60)
    // Still tracking the target, but lost.
    expect(lock.style.opacity).toBe('1')
    expect(lock.dataset.lost).toBe('1')
    m.targetHidden = false
    tickHud(1 / 60)
    expect(lock.dataset.lost).toBe('')
  })

  it('styles the lost corners faint, grey and dashed, the transition on the lost state only', () => {
    const css = source('src/components/hud/Crosshair.vue')
    const lost = css.slice(css.indexOf("&[data-lost='1'] .c"))
    expect(lost).toMatch(/^&\[data-lost='1'\] \.c\n\s+opacity: 0\.38\n\s+border-color: #[0-9a-f]{6}\n\s+transition: opacity/)
    for (const [corner, a, b] of [['tl', 'top', 'left'], ['tr', 'top', 'right'], ['bl', 'bottom', 'left'], ['br', 'bottom', 'right']]) {
      expect(lost).toMatch(new RegExp(`&\\[data-lost='1'\\] \\.${corner}\\n\\s+border-${a}-style: dashed\\n\\s+border-${b}-style: dashed`))
    }
    // After the telegraph colours, so grey wins over them.
    expect(css.indexOf("&[data-lost='1'] .c")).toBeGreaterThan(css.indexOf("&[data-tele='red'] .c"))
  })
})
