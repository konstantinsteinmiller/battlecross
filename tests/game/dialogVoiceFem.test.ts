// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * The girl hero's own recordings (roadmap #71): a line with a take at
 * `<id>__f` plays it for her; every other line plays as it always did.
 */
vi.mock('virtual:asset-overrides', () => ({
  default: {
    sfx: [], music: [], textures: [], items: [], skills: [], portraits: [], ui: [], icons: [],
    voice: ['en/dlg.hero.bye.ogg', 'en/dlg.hero.bye__f.ogg', 'de/dlg.hero.trade.ogg', 'de/dlg.hero.trade__f.ogg', 'en/dlg.hero.trade.ogg']
  }
}))

afterEach(async () => { (await import('@/i18n/gendered')).setHeroForm('m') })

describe('the girl hero\'s recordings', () => {
  it('her take when there is one, in her language first; the line\'s own otherwise', async () => {
    const { voiceUrl } = await import('@/game/audio/speech')
    const { setHeroForm } = await import('@/i18n/gendered')
    expect(voiceUrl('en', 'dlg.hero.bye')).toMatch(/en\/dlg\.hero\.bye\.ogg$/)
    setHeroForm('f')
    expect(voiceUrl('en', 'dlg.hero.bye')).toMatch(/en\/dlg\.hero\.bye__f\.ogg$/)
    expect(voiceUrl('de', 'dlg.hero.trade')).toMatch(/de\/dlg\.hero\.trade__f\.ogg$/)
    // German has no take of this one: the English take of hers.
    expect(voiceUrl('de', 'dlg.hero.bye')).toMatch(/en\/dlg\.hero\.bye__f\.ogg$/)
    // No take of hers at all: the line's own recording.
    expect(voiceUrl('fr', 'dlg.hero.trade')).toMatch(/en\/dlg\.hero\.trade\.ogg$/)
  })
})
