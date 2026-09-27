// ─── Flux's speech bubble ────────────────────────────────────────────────────
//
// When a hard hit shakes Flux's charge loose (`sim/fumble.ts`) he blurts one
// short line in a comic bubble by his buster arm (`FluxBubble.vue`): it pops
// in, holds ~1.1 s on the HUD's clock and goes. The lines are i18n keys
// (`flux.fumble.1..N`) in every shipped language, short enough for two lines
// on a narrow phone.

import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

import en from '@/i18n/locales/en'
import de from '@/i18n/locales/de'
import FluxBubble from '@/components/hud/FluxBubble.vue'
import { hud, tickHud } from '@/game/state/hud'
import { FUMBLE_BUBBLE, FUMBLE_LINES } from '@/game/sim/fumble'
import { LANGUAGES } from '@/utils/enums'

const i18n = (locale = 'en') => createI18n({ legacy: false, locale, fallbackLocale: 'en', messages: { en, de } })
const say = (key: string) => {
  hud.sayKey = key
  hud.saySeq++
}

enableAutoUnmount(afterEach)
afterEach(() => {
  hud.sayKey = ''
  hud.phase = 'boot'
})

describe('FluxBubble', () => {
  it('shows the translated line politely, and hides after its hold', async () => {
    hud.phase = 'play'
    const w = mount(FluxBubble, { global: { plugins: [i18n()] } })
    expect(w.find('.bubble').exists()).toBe(false)
    expect(w.get('.flux-say').attributes('aria-live')).toBe('polite')
    say('flux.fumble.3')
    await nextTick()
    expect(w.get('.bubble').text()).toBe("My arm's got hiccups!")
    tickHud(FUMBLE_BUBBLE - 0.3)
    await nextTick()
    expect(w.find('.bubble').exists()).toBe(true)
    tickHud(0.31)
    await nextTick()
    expect(w.find('.bubble').exists()).toBe(false)
  })

  it('speaks the player\'s language', async () => {
    hud.phase = 'play'
    const w = mount(FluxBubble, { global: { plugins: [i18n('de')] } })
    say('flux.fumble.3')
    await nextTick()
    expect(w.get('.bubble').text()).toBe('Mein Arm hat Schluckauf!')
  })

  it('the same line again pops again, with a fresh hold', async () => {
    hud.phase = 'play'
    const w = mount(FluxBubble, { global: { plugins: [i18n()] } })
    say('flux.fumble.1')
    await nextTick()
    tickHud(FUMBLE_BUBBLE - 0.1)
    say('flux.fumble.1')
    await nextTick()
    tickHud(0.5)
    await nextTick()
    expect(w.get('.bubble').text()).toBe('Whoa-oh!')
  })

  it('is gone once play stops (death, the exit)', async () => {
    hud.phase = 'play'
    const w = mount(FluxBubble, { global: { plugins: [i18n()] } })
    say('flux.fumble.2')
    await nextTick()
    hud.phase = 'dead'
    await nextTick()
    expect(w.find('.bubble').exists()).toBe(false)
  })
})

describe('Flux\'s fumble lines', () => {
  for (const code of LANGUAGES) {
    it(`${code} has all ${FUMBLE_LINES}, short enough for two lines on a phone`, async () => {
      const mod = await import(`../../src/i18n/locales/${code}.ts`)
      const lines = (mod.default as { flux?: { fumble?: Record<string, string> } }).flux?.fumble ?? {}
      expect(Object.keys(lines).sort()).toEqual(Array.from({ length: FUMBLE_LINES }, (_, i) => String(i + 1)).sort())
      for (const [k, v] of Object.entries(lines)) {
        expect(typeof v, `${code} flux.fumble.${k}`).toBe('string')
        expect(v.trim().length, `${code} flux.fumble.${k}`).toBeGreaterThan(0)
        expect([...v].length, `${code} flux.fumble.${k}: "${v}"`).toBeLessThanOrEqual(26)
      }
    })
  }
})
