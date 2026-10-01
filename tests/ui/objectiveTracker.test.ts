// @vitest-environment jsdom
// ─── The objective names the boss it means ──────────────────────────────────
//
// From a blind playtest. The replayed Scrapyard story mission is titled
// "Showdown: Scrapper", but its objective read "Defeat the Core Master": two
// names for one machine. And a desktop tester took a Guardroid for the boss,
// because the objective named a boss without showing it. So the objective
// says "Defeat {boss}" with the sector's boss, and shows its portrait.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import { LANGUAGES } from '@/utils/enums'
import { hud } from '@/game/state/hud'
import { tutorialQuest, storyQuest, rollJob, type Quest } from '@/game/data/quests'
import { SECTOR_BY_ID } from '@/game/data/regions'
import { flow } from '@/game/flow'
import { bossPortrait } from '@/game/models/portrait'
import ObjectiveTracker from '@/components/hud/ObjectiveTracker.vue'

// The tracker reads the current quest off the flow and asks the portrait
// module for a picture; both are reduced to what it touches.
vi.mock('@/game/flow', async () => {
  const { reactive } = await import('vue')
  return { flow: reactive({ quest: null as Quest | null }) }
})
vi.mock('@/game/models/portrait', () => ({
  bossPortrait: vi.fn(async () => 'data:image/png;base64,UE5H'),
  cachedBossPortrait: vi.fn(() => null)
}))

const i18n = () => createI18n({ legacy: false, locale: 'en', messages: { en } })
const tracker = () => mount(ObjectiveTracker, { global: { plugins: [i18n()] } })

const objectiveFor = (q: Quest) => {
  flow.quest = q
  hud.objectiveKey = `objective.${q.template}`
  hud.objectiveParams = { n: 0, total: q.count, target: q.target ? `enemyPlural.${q.target}` : '' }
  hud.objectiveDone = false
}

// One tracker on screen at a time, as in the game.
enableAutoUnmount(afterEach)
beforeEach(() => {
  hud.phase = 'beamIn'
  vi.mocked(bossPortrait).mockClear()
})
afterEach(() => {
  flow.quest = null
  hud.objectiveKey = ''
})

describe('the objective names the sector\'s boss', () => {
  it('a replayed Scrapyard story mission says "Defeat Scrapper", as its title does', () => {
    objectiveFor(storyQuest(SECTOR_BY_ID.scrapyard, 3, 1))
    expect(tracker().get('.obj-text').text()).toBe('Defeat Scrapper')
  })

  it('every sector\'s story mission names its own master', () => {
    objectiveFor(storyQuest(SECTOR_BY_ID.blaze, 5, 0))
    expect(tracker().get('.obj-text').text()).toBe('Reach the arena, defeat Blaze Master')
    objectiveFor(storyQuest(SECTOR_BY_ID.fortress, 5, 0))
    expect(tracker().get('.obj-text').text()).toBe('Reach the arena, defeat Dr. Vex Mk-I')
  })

  it('the tutorial says it the same way', () => {
    objectiveFor(tutorialQuest())
    expect(tracker().get('.obj-text').text()).toBe('Defeat Scrapper')
  })

  it('a job keeps its own objective and shows no boss', async () => {
    const job = rollJob(7, ['scrapyard'], 3)
    objectiveFor(job)
    hud.phase = 'play'
    const w = tracker()
    await flushPromises()
    expect(w.get('.obj-text').text()).not.toMatch(/Scrapper|\{boss\}/)
    expect(w.find('img.portrait').exists()).toBe(false)
    expect(bossPortrait).not.toHaveBeenCalled()
  })

  it.each(LANGUAGES)('%s renders the boss name into the objective', async (code) => {
    const { default: msgs } = await import(`../../src/i18n/locales/${code}.ts`)
    const t = createI18n({ legacy: false, locale: code, messages: { [code]: msgs } }).global.t
    const boss = t('boss.frostMaster')
    for (const key of ['objective.boss', 'objective.tutorial']) {
      const out = t(key, { boss })
      expect(out).toContain(boss)
      expect(out).not.toContain('{')
    }
  })
})

describe('the boss portrait on the card', () => {
  it('waits for the mission to be running, then shows the boss named in its alt', async () => {
    objectiveFor(storyQuest(SECTOR_BY_ID.scrapyard, 3, 1))
    const w = tracker()
    await flushPromises()
    // Beam-in: nothing is rendered yet.
    expect(bossPortrait).not.toHaveBeenCalled()
    expect(w.find('img.portrait').exists()).toBe(false)
    hud.phase = 'play'
    await nextTick()
    await flushPromises()
    expect(bossPortrait).toHaveBeenCalledTimes(1)
    expect(bossPortrait).toHaveBeenCalledWith('scrapper')
    const img = w.get('img.portrait')
    expect(img.attributes('src')).toBe('data:image/png;base64,UE5H')
    expect(img.attributes('alt')).toBe('Scrapper')
  })

  it('goes once the boss is down and the objective is complete', async () => {
    objectiveFor(storyQuest(SECTOR_BY_ID.scrapyard, 3, 1))
    hud.phase = 'play'
    const w = tracker()
    await flushPromises()
    expect(w.find('img.portrait').exists()).toBe(true)
    hud.objectiveDone = true
    await nextTick()
    expect(w.find('img.portrait').exists()).toBe(false)
  })
})
