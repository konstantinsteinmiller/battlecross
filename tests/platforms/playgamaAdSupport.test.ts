// @vitest-environment jsdom
// ─── Playgama: ask the platform before every ad ─────────────────────────────
//
// Playgama's rule for the archive it also forwards to YouTube Playables: the
// code "must always check whether ad placements are supported" before firing,
// and where a format is not served its BUTTON must not exist — not fail
// silently after the player tapped it. Bridge answers per platform through
// `advertisement.isInterstitialSupported` / `isRewardedSupported`; the QA Tool
// drives both, and the localhost MOCK serves neither.
//
// Pinned on both layers: the plugin never calls `show*()` for a format the
// platform does not serve, and the provider's per-format readiness — which
// `canOfferReward` and so every rewarded button binds to — follows the answer.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { drainAndResetModules, drainPersist } from '../stubs/drainPersist'

type Listener = (...args: unknown[]) => void

const makeBridge = (ads: { interstitial?: boolean; rewarded?: boolean } = {}) => {
  const listeners = new Map<string, Set<Listener>>()
  const advertisement: Record<string, unknown> = {
    showInterstitial: vi.fn(),
    showRewarded: vi.fn()
  }
  if (ads.interstitial !== undefined) advertisement.isInterstitialSupported = ads.interstitial
  if (ads.rewarded !== undefined) advertisement.isRewardedSupported = ads.rewarded
  const bridge = {
    version: '2.2.0',
    platform: { id: 'playgama', language: 'en', isPaused: false, isAudioEnabled: true, sendMessage: vi.fn(async () => {}) },
    advertisement,
    initialize: vi.fn(async () => {}),
    on: vi.fn((name: string, cb: Listener) => {
      if (!listeners.has(name)) listeners.set(name, new Set())
      listeners.get(name)!.add(cb)
    }),
    off: vi.fn((name: string, cb: Listener) => { listeners.get(name)?.delete(cb) }),
    emit: (name: string, ...args: unknown[]) => { for (const cb of [...(listeners.get(name) ?? [])]) cb(...args) }
  }
  return bridge
}

const loadPlugin = async (bridge: ReturnType<typeof makeBridge>) => {
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

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => {})
})

afterEach(async () => {
  drainPersist()
  const m = await import('@/utils/playgamaPlugin')
  m.__stopPlaygamaLanguageWatch?.()
  vi.unstubAllEnvs()
  vi.doUnmock('@/utils/playgamaBridgeLoader')
  vi.doUnmock('@/use/useGamePause')
  vi.doUnmock('@/use/useGamePauseAudio')
  vi.doUnmock('@/use/usePortalLeaderboard')
  vi.doUnmock('@/utils/save/PlaygamaStrategy')
  vi.doUnmock('@/utils/playgamaPlugin')
  vi.restoreAllMocks()
})

describe('the plugin reads what the platform serves', () => {
  it('publishes both formats as supported when Bridge says so', async () => {
    const m = await loadPlugin(makeBridge({ interstitial: true, rewarded: true }))
    expect(m.isPlaygamaInterstitialSupported.value).toBe(true)
    expect(m.isPlaygamaRewardedSupported.value).toBe(true)
  })

  it('publishes neither on a platform that serves none (the localhost MOCK)', async () => {
    const m = await loadPlugin(makeBridge({ interstitial: false, rewarded: false }))
    expect(m.isPlaygamaInterstitialSupported.value).toBe(false)
    expect(m.isPlaygamaRewardedSupported.value).toBe(false)
  })

  it('counts only an explicit yes — a Bridge that does not answer serves nothing', async () => {
    const m = await loadPlugin(makeBridge({}))
    expect(m.isPlaygamaInterstitialSupported.value).toBe(false)
    expect(m.isPlaygamaRewardedSupported.value).toBe(false)
  })
})

describe('the show wrappers never fire an unsupported format', () => {
  it('skips an interstitial the platform does not serve, and resolves at once', async () => {
    const bridge = makeBridge({ interstitial: false, rewarded: true })
    const m = await loadPlugin(bridge)
    await expect(m.showInterstitialPG()).resolves.toBeUndefined()
    expect(bridge.advertisement.showInterstitial).not.toHaveBeenCalled()
  })

  it('refuses a rewarded video the platform does not serve — no call, no grant', async () => {
    const bridge = makeBridge({ interstitial: true, rewarded: false })
    const m = await loadPlugin(bridge)
    await expect(m.showRewardedPG()).resolves.toBe(false)
    expect(bridge.advertisement.showRewarded).not.toHaveBeenCalled()
  })

  it('still fires a served format (the check is not a blanket off switch)', async () => {
    const bridge = makeBridge({ interstitial: true, rewarded: true })
    const m = await loadPlugin(bridge)
    const p = m.showRewardedPG()
    await Promise.resolve(); await Promise.resolve()
    expect(bridge.advertisement.showRewarded).toHaveBeenCalledTimes(1)
    bridge.emit('rewarded_state_changed', 'rewarded')
    bridge.emit('rewarded_state_changed', 'closed')
    await expect(p).resolves.toBe(true)
  })
})

describe('the provider gates every placement on support', () => {
  const plugin = {
    playgamaPlugin: vi.fn(async () => {}),
    isPlaygamaSdkActive: ref(false),
    isPlaygamaAdsBlocked: ref(false),
    isPlaygamaInterstitialSupported: ref(false),
    isPlaygamaRewardedSupported: ref(false),
    showRewardedPG: vi.fn(async () => true),
    showInterstitialPG: vi.fn(async () => {}),
    __stopPlaygamaLanguageWatch: vi.fn()
  }

  const provider = async () => {
    drainAndResetModules()
    vi.doMock('@/utils/playgamaPlugin', () => plugin)
    const { createPlaygamaProvider } = await import('@/use/ads/PlaygamaProvider')
    const p = createPlaygamaProvider()
    await p.init()
    return p
  }

  beforeEach(() => {
    plugin.isPlaygamaSdkActive.value = true
    plugin.isPlaygamaAdsBlocked.value = false
    plugin.isPlaygamaInterstitialSupported.value = false
    plugin.isPlaygamaRewardedSupported.value = false
  })

  it('offers nothing where the platform serves nothing, though the SDK is up', async () => {
    const p = await provider()
    expect(p.isReady.value).toBe(true)
    expect(p.isRewardedReady.value).toBe(false)
    expect(p.isInterstitialReady.value).toBe(false)
  })

  it('offers each format exactly when it is served', async () => {
    // (Set before init: the provider copies the plugin's answer once init has
    // settled, which is when Bridge knows it.)
    plugin.isPlaygamaRewardedSupported.value = true
    const rewardedOnly = await provider()
    expect(rewardedOnly.isRewardedReady.value).toBe(true)
    expect(rewardedOnly.isInterstitialReady.value).toBe(false)

    plugin.isPlaygamaRewardedSupported.value = false
    plugin.isPlaygamaInterstitialSupported.value = true
    const interstitialOnly = await provider()
    expect(interstitialOnly.isRewardedReady.value).toBe(false)
    expect(interstitialOnly.isInterstitialReady.value).toBe(true)
  })

  it('offers nothing before the SDK is up, whatever the platform serves', async () => {
    plugin.isPlaygamaSdkActive.value = false
    plugin.isPlaygamaRewardedSupported.value = true
    plugin.isPlaygamaInterstitialSupported.value = true
    const p = await provider()
    expect(p.isRewardedReady.value).toBe(false)
    expect(p.isInterstitialReady.value).toBe(false)
  })
})
