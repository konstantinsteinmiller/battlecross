// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'

/** The iOS unlock removes every ad: no interstitial, and the rewarded perks are simply free. */
const owned = ref(true)
vi.mock('@/use/useFullVersion', () => ({ adsRemoved: computed(() => owned.value) }))
vi.mock('@/use/useAds', () => ({
  adProviderName: 'levelplay',
  isRewardedReady: ref(false),
  showRewardedAd: vi.fn(async () => { throw new Error('no ad may be requested') })
}))

describe('the unlocked iOS version shows no ads', () => {
  it('never allows an interstitial, and grants a reward perk without a video', async () => {
    const gate = await import('@/use/useAdGate')
    gate.__resetInterstitialClock()
    expect(gate.canShowInterstitial()).toBe(false)
    expect(gate.rewardIsVideo.value).toBe(false)
    expect(gate.canOfferReward.value).toBe(true)
    let granted = 0
    expect(await gate.claimReward(() => { granted++ })).toBe(true)
    expect(granted).toBe(1)
    owned.value = false
    expect(gate.canShowInterstitial()).toBe(true)
    expect(gate.canOfferReward.value).toBe(false)
  })
})
