// ─── Playgama Wrap: the site's language is a portal language ────────────────
//
// On a Playgama Wrap site Bridge 2.2.0 runs its `standalone` adapter, which
// loads the Wrap SDK (`PLAYGAMA_WRAP`) and reports the page's
// `platformService.getLanguage()` as `platform.language` — or the BROWSER
// language when the page supplies none. Those two cannot be told apart through
// `platform.language`, which is why `standalone` used to be ignored outright
// (the v1-era rule for an adapter with no SDK behind it) and every Wrap visitor
// started in English.
//
// Pinned: a language the Wrap SDK supplies is picked up like any portal's —
// including a mid-session switch, which main.ts then lets override an earlier
// in-game choice — and where the SDK supplies none, a browser guess never
// passes for one. The localhost MOCK stays ignored.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist } from '../stubs/drainPersist'

const makeBridge = (o: { id: string; browserLanguage: string; wrap?: { getLanguage?: () => unknown } | null }) => {
  const bridge = {
    version: '2.2.0',
    platform: {
      id: o.id,
      // What Bridge reports: the Wrap page's language, else the browser's.
      get language (): string {
        const fromWrap = o.wrap?.getLanguage?.()
        return typeof fromWrap === 'string' && fromWrap ? fromWrap : o.browserLanguage
      },
      // Bridge's public handle on the platform SDK (`PLAYGAMA_WRAP` on Wrap).
      sdk: o.wrap === undefined ? undefined : (o.wrap === null ? null : { platformService: o.wrap }),
      isPaused: false,
      isAudioEnabled: true,
      sendMessage: vi.fn(async () => {})
    },
    advertisement: { isInterstitialSupported: true, isRewardedSupported: true, showInterstitial: vi.fn(), showRewarded: vi.fn() },
    initialize: vi.fn(async () => {}),
    on: vi.fn(),
    off: vi.fn()
  }
  return bridge
}

const load = async (bridge: ReturnType<typeof makeBridge>) => {
  drainAndResetModules()
  vi.stubEnv('VITE_APP_PLAYGAMA', 'true')
  vi.doMock('@/utils/playgamaBridgeLoader', () => ({ loadPlaygamaBridge: async () => bridge }))
  vi.doMock('@/use/useGamePause', () => ({ pauseGame: vi.fn(), resumeGame: vi.fn() }))
  vi.doMock('@/use/useGamePauseAudio', () => ({ setPlatformAudioMuted: vi.fn() }))
  vi.doMock('@/use/usePortalLeaderboard', () => ({ setPortalBoard: vi.fn() }))
  vi.doMock('@/utils/save/PlaygamaStrategy', () => ({ PlaygamaStrategy: class {} }))
  const m = await import('@/utils/playgamaPlugin')
  await m.playgamaPlugin()
  return m
}

beforeEach(() => { vi.spyOn(console, 'info').mockImplementation(() => {}) })

afterEach(async () => {
  drainPersist()
  const m = await import('@/utils/playgamaPlugin')
  m.__stopPlaygamaLanguageWatch?.()
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.doUnmock('@/utils/playgamaBridgeLoader')
  vi.doUnmock('@/use/useGamePause')
  vi.doUnmock('@/use/useGamePauseAudio')
  vi.doUnmock('@/use/usePortalLeaderboard')
  vi.doUnmock('@/utils/save/PlaygamaStrategy')
  vi.restoreAllMocks()
})

describe('the Wrap site\'s language (Bridge `standalone`)', () => {
  it('is picked up when the Wrap SDK supplies it — not the browser\'s', async () => {
    const m = await load(makeBridge({ id: 'standalone', browserLanguage: 'de', wrap: { getLanguage: () => 'fr-FR' } }))
    expect(m.playgamaLocale.value).toBe('fr')
  })

  it('follows a mid-session switch on the Wrap page, like any portal', async () => {
    vi.useFakeTimers()
    let lang = 'fr'
    const m = await load(makeBridge({ id: 'standalone', browserLanguage: 'de', wrap: { getLanguage: () => lang } }))
    expect(m.playgamaLocale.value).toBe('fr')
    lang = 'ja'
    await vi.advanceTimersByTimeAsync(2_100)
    expect(m.playgamaLocale.value).toBe('ja')
  })

  it('falls back to the game\'s own default when the Wrap SDK supplies none', async () => {
    const empty = await load(makeBridge({ id: 'standalone', browserLanguage: 'de', wrap: { getLanguage: () => '' } }))
    expect(empty.playgamaLocale.value).toBeNull()
    const noMethod = await load(makeBridge({ id: 'standalone', browserLanguage: 'de', wrap: {} }))
    expect(noMethod.playgamaLocale.value).toBeNull()
    const noSdk = await load(makeBridge({ id: 'standalone', browserLanguage: 'de', wrap: null }))
    expect(noSdk.playgamaLocale.value).toBeNull()
  })

  it('ignores a Wrap language this game does not ship', async () => {
    const m = await load(makeBridge({ id: 'standalone', browserLanguage: 'de', wrap: { getLanguage: () => 'sw' } }))
    expect(m.playgamaLocale.value).toBeNull()
  })

  it('the localhost MOCK stays ignored (its language is only the browser\'s)', async () => {
    const m = await load(makeBridge({ id: 'mock', browserLanguage: 'de' }))
    expect(m.playgamaLocale.value).toBeNull()
  })
})
