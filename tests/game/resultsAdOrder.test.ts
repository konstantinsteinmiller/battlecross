// The interstitial comes BEFORE the result screen — never on top of it, and
// never a moment after it (CrazyGames QA). `finishMission` pays and saves,
// runs the ad break, and only then reveals the results and plays the jingle.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({ adMs: 0, canShow: true, marks: 0, happy: 0, adCalls: 0 }))

vi.mock('@/use/useAds', async () => {
  const { isAdShowing } = await import('@/use/useGamePause')
  return {
    // Stands in for a provider: the gate goes up synchronously (as the real
    // `showMidgameAd` flips it before its first await) and drops at the end.
    showMidgameAd: async (): Promise<void> => {
      h.adCalls++
      isAdShowing.value = true
      await new Promise((r) => setTimeout(r, h.adMs))
      isAdShowing.value = false
    }
  }
})
vi.mock('@/use/useAdGate', () => ({
  canShowInterstitial: () => h.canShow,
  markInterstitialShown: () => { h.marks++ }
}))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => { h.happy++ } }))

const tally = { xp: 10, bolts: 5, kills: 1, chests: 0, items: [], seconds: 30 }

const load = async () => {
  const flowMod = await import('@/game/flow')
  const { tutorialQuest } = await import('@/game/data/quests')
  const { isAdShowing } = await import('@/use/useGamePause')
  flowMod.flow.quest = tutorialQuest()
  flowMod.flow.modal = ''
  flowMod.flow.results = null
  return { ...flowMod, isAdShowing }
}

describe('ad break before the result screen', () => {
  beforeEach(() => {
    h.adMs = 0
    h.canShow = true
    h.marks = 0
    h.happy = 0
    h.adCalls = 0
  })
  afterEach(() => { vi.useRealTimers() })

  it('plays the due interstitial first, and reveals the results only after it', async () => {
    const m = await load()
    h.adMs = 150
    const done = m.finishMission(true, tally)
    // The ad is up; nothing of the result screen may be showing under it.
    expect(m.isAdShowing.value).toBe(true)
    expect(m.flow.modal).toBe('')
    expect(m.flow.results).toBeNull()
    await done
    expect(m.isAdShowing.value).toBe(false)
    expect(m.flow.modal).toBe('results')
    expect(m.flow.results?.success).toBe(true)
    expect(h.adCalls).toBe(1)
    expect(h.marks).toBe(1) // the shared pacing clock restarts
    expect(h.happy).toBe(1) // CrazyGames happytime on a win
  })

  it('skips the ad when none is due and reveals straight away', async () => {
    const m = await load()
    h.canShow = false
    await m.finishMission(false, tally)
    expect(h.adCalls).toBe(0)
    expect(m.flow.modal).toBe('results')
    expect(h.happy).toBe(0) // no happytime on a failed mission
  })

  it('waits for an ad ANOTHER placement left on screen', async () => {
    const m = await load()
    h.canShow = false
    m.isAdShowing.value = true // e.g. the QA trigger or the first-load ad
    const done = m.finishMission(true, tally)
    await new Promise((r) => setTimeout(r, 250))
    expect(m.flow.modal).toBe('')
    m.isAdShowing.value = false
    await done
    expect(m.flow.modal).toBe('results')
  })

  it('never strands the player behind a gate that does not drop', async () => {
    const m = await load()
    vi.useFakeTimers()
    h.canShow = false
    m.isAdShowing.value = true
    const done = m.finishMission(true, tally)
    await vi.advanceTimersByTimeAsync(8200)
    await done
    expect(m.flow.modal).toBe('results')
    m.isAdShowing.value = false
  })
})
