// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

const setUa = (ua: string, touchPoints: number): void => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua)
  Object.defineProperty(navigator, 'maxTouchPoints', { value: touchPoints, configurable: true })
}

const IPAD_DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'

afterEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })
})

describe('iPads asking for the desktop site', () => {
  it('count as mobile, so they get the mobile layout and mute', async () => {
    const { mobileCheck } = await import('@/utils/function')
    setUa(IPAD_DESKTOP, 5)
    expect(mobileCheck()).toBe(true)
  })

  it('while a real Mac (no touch points) stays a desktop', async () => {
    const { mobileCheck } = await import('@/utils/function')
    setUa(IPAD_DESKTOP, 0)
    expect(mobileCheck()).toBe(false)
  })

  it('are Apple touch devices, like iPhones', async () => {
    const { isAppleTouch } = await import('@/use/deviceProfile')
    setUa(IPAD_DESKTOP, 5)
    expect(isAppleTouch()).toBe(true)
    setUa(IPHONE, 5)
    expect(isAppleTouch()).toBe(true)
    setUa('Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile', 5)
    expect(isAppleTouch()).toBe(false)
  })
})

describe('a lost WebGL context', () => {
  it('pauses the game until the context comes back', async () => {
    const { watchContextLoss, glLost } = await import('@/game/engine/glContext')
    const { isGamePaused } = await import('@/use/useGamePause')
    const canvas = document.createElement('canvas')
    watchContextLoss(canvas)
    expect(isGamePaused.value).toBe(false)
    canvas.dispatchEvent(new Event('webglcontextlost'))
    canvas.dispatchEvent(new Event('webglcontextlost'))
    expect(glLost.value).toBe(true)
    expect(isGamePaused.value).toBe(true)
    canvas.dispatchEvent(new Event('webglcontextrestored'))
    expect(glLost.value).toBe(false)
    expect(isGamePaused.value).toBe(false)
  })
})

describe('the audio unlock', () => {
  it('keeps listening after the first tap, so an interrupted context can come back', async () => {
    let state = 'suspended'
    // Like iOS: a resume only lands when a gesture is behind it.
    let gesture = false
    const resume = vi.fn(() => {
      if (gesture) state = 'running'
      return gesture ? Promise.resolve() : Promise.reject(new Error('not allowed'))
    })
    class FakeCtx {
      get state () { return state }
      resume = resume
      suspend = vi.fn(() => Promise.resolve())
      addEventListener () {}
    }
    ;(window as any).AudioContext = FakeCtx
    Object.defineProperty(navigator, 'userActivation', { value: { hasBeenActive: true }, configurable: true })
    vi.resetModules()
    const { getAudioContext } = await import('@/use/useAssets')
    getAudioContext()
    await new Promise(r => setTimeout(r, 0))
    gesture = true
    window.dispatchEvent(new Event('touchend'))
    await new Promise(r => setTimeout(r, 0))
    expect(state).toBe('running')
    // A call interrupts it later; resuming without a gesture is refused, so
    // the next tap must still be heard.
    gesture = false
    state = 'interrupted'
    await new Promise(r => setTimeout(r, 0))
    gesture = true
    window.dispatchEvent(new Event('click'))
    await new Promise(r => setTimeout(r, 0))
    expect(state).toBe('running')
  })
})
