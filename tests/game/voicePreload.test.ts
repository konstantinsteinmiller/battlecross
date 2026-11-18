// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

/**
 * Recordings ready before they are spoken (roadmap #211): a place's cries and people are fetched and decoded in the
 * background, the first seconds' lines first, never a line the language has no file for, and a newer place drops the queue.
 */
const FILES = [
  'en/dlg.bark.hero.cage.1.ogg', 'en/dlg.bark.hero.hunt.1.ogg', 'en/dlg.bark.trainerAegis.freed.1.ogg',
  'en/dlg.bark.rebelGoblin.down.1.ogg', 'en/dlg.bark.goblinKing.intro.1.ogg', 'en/dlg.bark.banditChief.whistle.1.ogg',
  'en/dlg.bark.freedPeddler.freed.1.ogg', 'en/dlg.bark.chimera.intro.1.ogg', 'en/dlg.sunfordSmith.hello.1.ogg'
]
vi.mock('virtual:asset-overrides', () => ({
  default: { sfx: [], music: [], textures: [], items: [], skills: [], portraits: [], ui: [], icons: [], voice: FILES }
}))

const has = (id: string): boolean => FILES.some(f => f === `en/${id}.ogg`)

describe('which recordings a place gets ahead of time', () => {
  it('the opening level: the hero\'s cries, the camp\'s teachers, the cage\'s captive and the bandit chief, not another zone\'s boss', async () => {
    const { voiceIdsFor } = await import('@/game/audio/voicePreload')
    const { soon } = voiceIdsFor('plains', 'en', has)
    for (const id of ['dlg.bark.hero.cage.1', 'dlg.bark.hero.hunt.1', 'dlg.bark.trainerAegis.freed.1', 'dlg.bark.freedPeddler.freed.1', 'dlg.bark.banditChief.whistle.1']) expect(soon, id).toContain(id)
    expect(soon).not.toContain('dlg.bark.goblinKing.intro.1')
    expect(soon).not.toContain('dlg.bark.chimera.intro.1')
  })

  it('the Hollows add the storming goblins\' cries; a town its people (only lines the language has)', async () => {
    const { voiceIdsFor } = await import('@/game/audio/voicePreload')
    expect(voiceIdsFor('hollows', 'en', has).soon).toContain('dlg.bark.rebelGoblin.down.1')
    expect(voiceIdsFor('plains', 'en', has).soon).not.toContain('dlg.bark.rebelGoblin.down.1')
    const town = voiceIdsFor('sunford', 'en', has)
    expect(town.rest).toContain('dlg.sunfordSmith.hello.1')
    for (const id of [...town.soon, ...town.rest]) expect(has(id), id).toBe(true)
    // A language without a single recording of its own is asked for nothing.
    expect(voiceIdsFor('plains', 'de', () => false)).toEqual({ soon: [], rest: [] })
  })
})

describe('the background queue', () => {
  it('fetches each recording once, one at a time, and stops when the place has changed', async () => {
    vi.resetModules()
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn((url: string) => { calls.push(url); return Promise.resolve({ ok: false, status: 404 }) }))
    class Off { decodeAudioData(): Promise<null> { return Promise.resolve(null) } }
    vi.stubGlobal('OfflineAudioContext', Off)
    ;(window as unknown as Record<string, unknown>).OfflineAudioContext = Off
    const { preloadVoices } = await import('@/game/audio/speech')
    let stale = false
    const ids = ['dlg.bark.hero.cage.1', 'dlg.bark.hero.hunt.1', 'dlg.bark.trainerAegis.freed.1']
    const p = preloadVoices(ids, 'en', () => stale)
    await vi.waitFor(() => expect(calls.length).toBeGreaterThanOrEqual(1))
    stale = true
    await p
    expect(calls.length).toBeLessThan(ids.length)
    expect(new Set(calls).size).toBe(calls.length)
    vi.unstubAllGlobals()
  })
})
