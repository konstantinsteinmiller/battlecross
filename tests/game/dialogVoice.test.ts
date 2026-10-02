// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

/**
 * Which recording a dialogue line plays. The folder is listed at build time
 * (`virtual:asset-overrides`), so the game only ever asks for files that are
 * there: a line without one stays a text-paced bubble.
 */
vi.mock('virtual:asset-overrides', () => ({
  default: {
    sfx: [], music: [], textures: [], items: [], skills: [], portraits: [], ui: [],
    voice: ['de/dlg.hero.trade.ogg', 'en/dlg.hero.bye.ogg', 'en/dlg.hero.trade.ogg', 'en/dlg.sunfordSmith.hello.1.mp3']
  }
}))

describe('a dialogue line\'s recording', () => {
  it('is public/audio/voice/<lang>/<line id>.<ext>, in the player\'s language', async () => {
    const { voiceUrl } = await import('@/game/audio/speech')
    expect(voiceUrl('de', 'dlg.hero.trade')).toMatch(/audio\/voice\/de\/dlg\.hero\.trade\.ogg$/)
    expect(voiceUrl('en', 'dlg.hero.trade')).toMatch(/audio\/voice\/en\/dlg\.hero\.trade\.ogg$/)
    // The line id has dots of its own: only the extension is cut off.
    expect(voiceUrl('en', 'dlg.sunfordSmith.hello.1')).toMatch(/audio\/voice\/en\/dlg\.sunfordSmith\.hello\.1\.mp3$/)
  })

  it('falls back to the English recording, and to none (a text-paced bubble) when there is none', async () => {
    const { voiceUrl, speakLine } = await import('@/game/audio/speech')
    expect(voiceUrl('de', 'dlg.hero.bye')).toMatch(/audio\/voice\/en\/dlg\.hero\.bye\.ogg$/)
    expect(voiceUrl('ja', 'dlg.hero.trade')).toMatch(/audio\/voice\/en\/dlg\.hero\.trade\.ogg$/)
    expect(voiceUrl('en', 'dlg.elderMara.hello.1')).toBe('')
    // No file: nothing is fetched, and the line is paced by its text.
    const fetched = vi.fn()
    vi.stubGlobal('fetch', fetched)
    expect(await speakLine('dlg.elderMara.hello.1', 'en')).toBe(0)
    expect(fetched).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('the manifest names the same path the player looks for', async () => {
    const { voicePath } = await import('@/game/dialog/manifest')
    const { voiceUrl } = await import('@/game/audio/speech')
    expect(voiceUrl('en', 'dlg.hero.bye').endsWith(voicePath('en', 'dlg.hero.bye'))).toBe(true)
  })
})
