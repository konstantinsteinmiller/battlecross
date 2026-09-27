// ─── The Slide wears `dodge`, not an arrow ──────────────────────────────────
//
// From a phone playtest. The Slide button (and its coach hint and its row in
// the pause legend) wore `forward`, an arrow pointing ahead, so the tester
// tapped it expecting a dash forward. With no stick a slide hops BACK
// (`sim/mission.ts`), and with one it goes the stick's way, so the arrow
// promised a direction the move does not keep. The Slide now has a glyph of
// its own, `dodge`: a figure dropped low mid-slide with speed lines behind it,
// the move rather than a direction. `forward` stays where it means forward
// (the results screen's continue).
//
// A test cannot judge a drawing, but it can hold its anatomy by rendering the
// glyph exactly as GameIcon does (all sub-paths as ONE path, nonzero winding)
// and probing points, and it can hold every slide surface to the new name.

import sharp from 'sharp'
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import { GAME_ICON_NAMES, isGameIconName, type GameIconName } from '@/components/icons/iconNames'
import { ICON_PATHS } from '@/components/icons/iconPaths'
import { ICON_LABEL_KEYS, resolveIconLabel } from '@/components/icons/iconLabels'
import { SKILL_BY_ID } from '@/game/data/skills'
import { hud } from '@/game/state/hud'
import ActionButtons from '@/components/hud/ActionButtons.vue'
import ControlHints from '@/components/hud/ControlHints.vue'
import ControlsPanel from '@/components/hud/ControlsPanel.vue'

const device = vi.hoisted(() => ({ value: 'touch' as 'touch' | 'mouse' }))
vi.mock('@/game/boot', () => ({ input: { get device() { return device.value }, slideQueued: false } }))

const i18n = () => createI18n({ legacy: false, locale: 'en', messages: { en } })
const read = (rel: string): string => readFileSync(resolve(__dirname, '../..', rel), 'utf8')
const D = (name: GameIconName) => ICON_PATHS[name].join('')

const SCALE = 10
const PX = 24 * SCALE
const render = async (name: GameIconName): Promise<(x: number, y: number) => number> => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PX}" height="${PX}" viewBox="0 0 24 24"><path d="${D(name)}" fill="#000"/></svg>`
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const at = (v: number) => Math.min(PX - 1, Math.max(0, Math.round(v * SCALE)))
  return (x, y) => data[(at(y) * info.width + at(x)) * info.channels + 3]!
}

describe("'dodge' is a glyph of its own", () => {
  it('is registered, passes the runtime guard and has geometry', () => {
    expect(GAME_ICON_NAMES).toContain('dodge')
    expect(isGameIconName('dodge')).toBe(true)
    expect(ICON_PATHS.dodge.length).toBeGreaterThan(0)
    expect(D('dodge')).not.toBe(D('forward'))
  })

  it('is announced as the Slide when a control forgets its own label', () => {
    expect(ICON_LABEL_KEYS.dodge).toBe('combat.slide')
    const g = i18n().global
    expect(resolveIconLabel(undefined, 'dodge', (k) => g.t(k), (k) => g.te(k))).toBe('Slide')
  })

  it('stays inside the 24 x 24 box with a margin', async () => {
    const alpha = await render('dodge')
    for (let t = 0; t <= 24; t += 0.25) {
      for (const [x, y] of [[t, 0.5], [t, 23.5], [0.5, t], [23.5, t]] as const) {
        expect(alpha(x, y), `(${x}, ${y})`).toBe(0)
      }
    }
  })

  it('is a figure: a head, a torso and limbs joined solid (no winding holes at the joints)', async () => {
    const alpha = await render('dodge')
    // head, neck/shoulder, hip joint, front foot, back knee, back foot, hand
    for (const [x, y] of [[15.9, 6.5], [13.9, 10.8], [9.4, 13.8], [20.6, 17.6], [5.5, 16.7], [8.4, 19.0], [10.5, 8.9]] as const) {
      expect(alpha(x, y), `(${x}, ${y})`).toBe(255)
    }
  })

  it('has two speed lines behind it, clear of the figure', async () => {
    const alpha = await render('dodge')
    expect(alpha(4.8, 6.5)).toBe(255)
    expect(alpha(3.8, 10.9)).toBe(255)
    // the gaps: between the two lines, between each line and the figure
    for (const [x, y] of [[4, 8.7], [9.2, 6.5], [7.4, 10.9], [9.2, 7.6]] as const) {
      expect(alpha(x, y), `(${x}, ${y})`).toBe(0)
    }
  })

  it('is not an arrow on the midline: the space in front of the figure is open', async () => {
    const alpha = await render('dodge')
    // `forward`'s shaft and head fill the centre line; `dodge` leaves it clear
    // from the torso to the right edge, above the sliding leg.
    for (const x of [16.5, 18.5, 20.5]) expect(alpha(x, 12), `(${x}, 12)`).toBe(0)
  })
})

describe('every slide surface wears dodge', () => {
  it('the Slide button', () => {
    device.value = 'touch'
    hud.phase = 'play'
    const w = mount(ActionButtons, { global: { plugins: [i18n()] } })
    const btn = w.get('button.act.slide')
    expect(btn.attributes('aria-label')).toBe(en.combat.slide)
    expect(btn.get('svg.game-icon path').attributes('d')).toBe(D('dodge'))
    w.unmount()
  })

  it("the coach's desktop Slide card", () => {
    hud.phase = 'play'
    hud.pointerFree = false
    hud.hints = [{ id: 'slide', family: 'mouse', count: 0, goal: 2, flash: 0, done: false }]
    const w = mount(ControlHints, { global: { plugins: [i18n()] } })
    expect(w.get('.hint.slide.mouse svg.game-icon path').attributes('d')).toBe(D('dodge'))
    w.unmount()
    hud.hints = []
  })

  it('the Slide row of the pause legend, touch and keys', () => {
    for (const fam of ['touch', 'mouse'] as const) {
      device.value = fam
      const w = mount(ControlsPanel, { global: { plugins: [i18n()] } })
      expect(w.get('[data-row="slide"] .action path').attributes('d'), fam).toBe(D('dodge'))
      w.unmount()
    }
    device.value = 'touch'
  })

  it('the Slide Boosters circuit (it buys a faster, cheaper slide)', () => {
    expect(SKILL_BY_ID.boosters!.icon).toBe('dodge')
  })

  it('none of them still names `forward`', () => {
    const buttons = read('src/components/hud/ActionButtons.vue')
    const slideBtn = buttons.slice(buttons.indexOf('button.act.slide('), buttons.indexOf('button.act.tank('))
    expect(slideBtn).toContain('GameIcon(name="dodge")')
    expect(slideBtn).not.toContain('forward')
    expect(read('src/components/hud/ControlHints.vue')).toMatch(/slide: 'dodge'/)
    const legend = read('src/components/hud/ControlsPanel.vue').split('\n').filter(l => l.includes("key: 'slide'"))
    expect(legend).toHaveLength(2)
    for (const l of legend) {
      expect(l).toContain("action: 'dodge'")
      expect(l).not.toContain('forward')
    }
  })
})
