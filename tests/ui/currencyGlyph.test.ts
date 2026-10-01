// @vitest-environment jsdom
// ─── Bolts are a nut; ⚡ is energy ──────────────────────────────────────────
//
// From a blind playtest. The Bolts currency wore the lightning glyph, the same
// ⚡ that marks the charged shot and the weapon-energy bar, and the desktop
// tester called his Bolts "energy". The phone tester read the job board's
// "⚡ 140", next to "+257 XP", as a price. So the currency has its own glyph
// (`nut`, the gold hexagon of the pickup's head) on every surface that shows
// Bolts, and a reward shown before it is earned is signed like the XP.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import { GAME_ICON_NAMES } from '@/components/icons/iconNames'
import { ICON_PATHS } from '@/components/icons/iconPaths'
import { ICON_LABEL_KEYS, resolveIconLabel } from '@/components/icons/iconLabels'
import { ATTR_ICON } from '@/game/data/progression'
import { tutorialQuest } from '@/game/data/quests'
import QuestCard from '@/components/hub/QuestCard.vue'

const read = (rel: string): string => readFileSync(resolve(__dirname, '../..', rel), 'utf8')

/** Every surface that shows the player's Bolts or prices/pays in them. */
const BOLT_SURFACES = [
  'src/components/hud/TopStatus.vue',
  'src/components/hub/HubScreen.vue',
  'src/components/hub/QuestCard.vue',
  'src/components/hub/WorkshopTab.vue',
  'src/components/hub/HeroTab.vue',
  'src/components/hub/CircuitsTab.vue',
  'src/components/modals/ResultsModal.vue',
  'src/components/modals/DefeatModal.vue'
]

describe('the currency glyph', () => {
  it('is a registered solid glyph: a hexagon with a bore', () => {
    expect(GAME_ICON_NAMES).toContain('nut')
    expect(ICON_PATHS.nut).toHaveLength(2)
  })

  it('is announced as "Bolts" when a control forgets its own label', () => {
    expect(ICON_LABEL_KEYS.nut).toBe('hud.bolts')
    const g = createI18n({ legacy: false, locale: 'en', messages: { en } }).global
    expect(resolveIconLabel(undefined, 'nut', (k) => g.t(k), (k) => g.te(k))).toBe('Bolts')
  })

  it.each(BOLT_SURFACES)('%s draws Bolts as the nut, never the lightning', (path) => {
    const src = read(path)
    expect(src).toContain('name="nut"')
    expect(src).not.toContain('name="bolt"')
  })

  it('leaves the lightning to energy: the Reactor (weapon energy) attribute', () => {
    expect(ATTR_ICON.we).toBe('bolt')
  })
})

describe('a quest card promises Bolts the way it promises XP', () => {
  const card = () => mount(QuestCard, {
    props: { quest: tutorialQuest(), story: true },
    global: { plugins: [createI18n({ legacy: false, locale: 'en', messages: { en } })] }
  })

  it('signs the reward: "+80", beside "+120 XP"', () => {
    const w = card()
    expect(w.get('.chip.xp').text()).toBe('+120 XP')
    expect(w.get('.chip.bolt').text()).toBe('+80')
  })

  it('draws the nut after the amount, where "XP" sits in the chip beside it', () => {
    const chip = card().get('.chip.bolt').element
    expect(chip.firstChild?.textContent?.trim()).toBe('+80')
    expect(chip.lastElementChild?.tagName.toLowerCase()).toBe('svg')
  })
})
