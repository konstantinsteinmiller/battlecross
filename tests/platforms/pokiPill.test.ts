// ─── Poki's mobile pill stays off our HUD ────────────────────────────────────
//
// On mobile, poki.com draws its nav pill over the game frame's LEFT edge: a
// 62×46 CSS-px tab 24 px from the top (measured on a live game page, portrait
// and landscape). That is exactly where the mission HUD's HP / energy bars are.
// integrate-poki Pitfall 10: move it with `movePill(topPercent, topPx)`.
//
// The boxes below are the real ones, measured on the built Poki bundle with
// phone emulation (scratchpad layout run): bars at (9,9)–(40,132) in every
// layout; the objective card below them in portrait (9,143)–(165,205) and beside
// them in landscape (49,9)–(206,75); the result modal's frame.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PILL, PILL_AVOID_SELECTOR, pillTopPx, startPillPlacement, type Box } from '@/platforms/poki/pill'

const box = (left: number, top: number, right: number, bottom: number): Box => ({ left, top, right, bottom })
const BARS = box(9, 9, 40, 132)
const OBJ_PORTRAIT = box(9, 143, 165, 205)
const OBJ_LANDSCAPE = box(49, 9, 206, 75)

describe('pillTopPx', () => {
  it('keeps Poki\'s default spot when nothing of ours is there (hub, menus)', () => {
    expect(pillTopPx([], 780)).toBe(PILL.defaultTop)
    // The top-right status cluster is outside the pill's strip.
    expect(pillTopPx([box(170, 8, 380, 50)], 780)).toBe(PILL.defaultTop)
  })

  it('mission, portrait: below the bars AND the objective card under them', () => {
    const top = pillTopPx([BARS, OBJ_PORTRAIT], 780)
    expect(top).toBe(213)
    expect(top).toBeGreaterThanOrEqual(OBJ_PORTRAIT.bottom)
  })

  it('mission, landscape (844×390) and Poki\'s smallest size (640×360): just below the bars', () => {
    expect(pillTopPx([BARS, OBJ_LANDSCAPE], 390)).toBe(140)
    expect(pillTopPx([BARS, OBJ_LANDSCAPE], 360)).toBe(140)
  })

  it('never past Poki\'s limit (half the game area); with no free slot, the default', () => {
    // A modal frame spans the height: nothing below the bars is free.
    expect(pillTopPx([BARS, box(9, 135, 381, 655)], 780)).toBe(PILL.defaultTop)
    expect(pillTopPx([BARS, box(54, 27, 790, 386)], 390)).toBe(PILL.defaultTop)
    // A column taller than half the screen.
    expect(pillTopPx([box(9, 9, 40, 300)], 390)).toBe(PILL.defaultTop)
  })

  it('watches exactly the mission HUD cluster and modal frames', () => {
    expect(PILL_AVOID_SELECTOR).toBe('.hud-layer .bars, .hud-layer .obj, .f-modal__frame')
  })
})

const place = (el: Element, b: Box): void => {
  el.getBoundingClientRect = () => ({
    left: b.left, top: b.top, right: b.right, bottom: b.bottom, x: b.left, y: b.top,
    width: b.right - b.left, height: b.bottom - b.top, toJSON: () => ({})
  }) as DOMRect
}
const hud = (): HTMLElement => {
  const layer = document.createElement('div')
  layer.className = 'hud-layer'
  const bars = document.createElement('div')
  bars.className = 'bars'
  place(bars, BARS)
  layer.appendChild(bars)
  document.body.appendChild(layer)
  return layer
}

describe('startPillPlacement', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers(); document.body.innerHTML = '' })

  it('moves the pill now, again when the screen changes, and never twice for one answer', () => {
    const layer = hud()
    const move = vi.fn()
    const stop = startPillPlacement(move)
    expect(move.mock.calls).toEqual([[0, 140]])

    vi.advanceTimersByTime(3000)
    expect(move).toHaveBeenCalledTimes(1)

    // Portrait: the objective card appears under the bars.
    const obj = document.createElement('div')
    obj.className = 'obj'
    place(obj, OBJ_PORTRAIT)
    layer.appendChild(obj)
    vi.advanceTimersByTime(1000)
    expect(move.mock.calls.at(-1)).toEqual([0, 213])

    // Back to the hub: nothing of ours in the strip.
    layer.remove()
    vi.advanceTimersByTime(1000)
    expect(move.mock.calls.at(-1)).toEqual([0, PILL.defaultTop])

    stop()
    hud()
    vi.advanceTimersByTime(3000)
    expect(move).toHaveBeenCalledTimes(3)
  })
})

describe('pokiPlugin wiring', () => {
  const movePill = vi.fn()
  const install = (category: string): void => {
    ;(window as unknown as { PokiSDK: unknown }).PokiSDK = {
      init: () => Promise.resolve(), gameLoadingFinished() {}, gameplayStart() {}, gameplayStop() {},
      commercialBreak: () => Promise.resolve(), rewardedBreak: () => Promise.resolve(false),
      measure() {}, captureError() {}, getLanguage: () => 'en', getDeviceInfo: () => ({ category }),
      movePill
    }
  }
  let mod: Awaited<typeof import('@/utils/pokiPlugin')> | null = null
  afterEach(() => {
    mod?.__resetPokiGameplayBracketForTests()
    mod = null
    movePill.mockReset()
    document.body.innerHTML = ''
    delete (window as unknown as { PokiSDK?: unknown }).PokiSDK
  })
  const boot = async (category: string) => {
    install(category)
    hud()
    vi.resetModules()
    mod = await import('@/utils/pokiPlugin')
    await mod.pokiPlugin()
  }

  it('on a phone or tablet, moves the pill off the HP bars once the SDK is up', async () => {
    await boot('mobile')
    expect(movePill.mock.calls).toEqual([[0, 140]])
    mod!.__resetPokiGameplayBracketForTests()
    movePill.mockReset()
    await boot('tablet')
    expect(movePill.mock.calls).toEqual([[0, 140]])
  })

  it('on desktop (no pill over the game) leaves it alone', async () => {
    await boot('desktop')
    expect(movePill).not.toHaveBeenCalled()
  })
})
