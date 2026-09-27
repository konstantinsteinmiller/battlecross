// Playgama ad provider — wraps the lazy-loaded `playgamaPlugin` in the
// cross-platform `AdProvider` surface consumed by `useAds`.
//
// Mirrors `GameDistributionProvider`: dynamic-imports the plugin so the
// ~280 LOC bridge module only ships on Playgama builds; the file itself
// is excluded from the obfuscator's stringArray transform (see
// `vite.config.ts`) so the `await import('@/...')` literal survives.

import { computed, ref, watch } from 'vue'
import type { AdProvider } from './types'

export const createPlaygamaProvider = (): AdProvider => {
  const isReady = ref(false)
  const isAdsBlocked = ref(false)
  // Per-format support, as Bridge reports it for the platform it landed on.
  // Playgama requires the check before every placement, and its QA Tool drives
  // the answer (`qa_tool` reports the formats the tester switched on); the
  // localhost MOCK serves neither. A format the platform does not serve must
  // not offer its button at all — `canOfferReward` binds to these gates.
  const interstitialSupported = ref(false)
  const rewardedSupported = ref(false)

  let pluginPromise: Promise<typeof import('@/utils/playgamaPlugin')> | null = null
  const loadPlugin = (): Promise<typeof import('@/utils/playgamaPlugin')> => {
    if (!pluginPromise) pluginPromise = import('@/utils/playgamaPlugin')
    return pluginPromise
  }

  return {
    name: 'playgama',
    isReady,
    // The Bridge has no per-ad "loaded" query — `readiness` is: the SDK is up
    // AND the platform serves the format. No-fill is still handled by the show
    // calls' closed / failed edges.
    isRewardedReady: computed(() => isReady.value && rewardedSupported.value),
    isInterstitialReady: computed(() => isReady.value && interstitialSupported.value),
    isAdsBlocked,
    init: async () => {
      try {
        const m = await loadPlugin()
        await m.playgamaPlugin()
        watch(m.isPlaygamaSdkActive, (v) => {
          isReady.value = v
        }, { immediate: true })
        watch(m.isPlaygamaAdsBlocked, (v) => {
          isAdsBlocked.value = v
        }, { immediate: true })
        watch(m.isPlaygamaInterstitialSupported, (v) => {
          interstitialSupported.value = v
        }, { immediate: true })
        watch(m.isPlaygamaRewardedSupported, (v) => {
          rewardedSupported.value = v
        }, { immediate: true })
      } catch (e) {
        console.warn('[ads/playgama] plugin init failed', e)
      }
    },
    // Forwarded so `useAds` sees the bridge's 'opened' state — its 6 s "never
    // opened" cap otherwise releases the wait in the middle of every real ad.
    showRewardedAd: async (onImpression) => {
      const m = await loadPlugin()
      return m.showRewardedPG(onImpression)
    },
    showMidgameAd: async (onImpression) => {
      const m = await loadPlugin()
      return m.showInterstitialPG(onImpression)
    }
  }
}
