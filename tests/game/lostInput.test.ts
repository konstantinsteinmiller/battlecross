// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { watchLostInput } from '@/game/engine/lostInput'

// The shared "the browser lost the finger" guard (the battle stick and the
// world-map stick both sit on it).

const touches = (type: string, n: number): Event =>
  Object.assign(new Event(type, { bubbles: true }), { touches: { length: n } })
const tick = () => new Promise(r => setTimeout(r, 0))

let held = 0
let all = 0
let touchesReleased = 0
let stop: () => void

beforeEach(() => {
  held = 1
  all = 0
  touchesReleased = 0
  stop = watchLostInput({
    releaseAll: () => { all++; held = 0 },
    releaseTouches: () => { touchesReleased++; held = 0 },
    heldTouches: () => held
  })
})
afterEach(() => stop())

describe('watchLostInput', () => {
  for (const type of ['blur', 'pagehide', 'orientationchange']) {
    it(`${type} releases everything`, () => {
      window.dispatchEvent(new Event(type))
      expect(all).toBe(1)
    })
  }

  it('resize releases the touches', () => {
    window.dispatchEvent(new Event('resize'))
    expect(touchesReleased).toBe(1)
  })

  it('the page going hidden releases everything, visible does not', () => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(all).toBe(0)
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    delete (document as unknown as Record<string, unknown>).visibilityState
    expect(all).toBe(1)
  })

  it('the last finger lifting releases a hold whose pointerup was lost, a task later', async () => {
    window.dispatchEvent(touches('touchend', 0))
    expect(touchesReleased).toBe(0)
    await tick()
    expect(touchesReleased).toBe(1)
  })

  it('a hold already let go by its pointerup is left alone', async () => {
    window.dispatchEvent(touches('touchend', 0))
    held = 0
    await tick()
    expect(touchesReleased).toBe(0)
  })

  it('a finger still down keeps the hold', async () => {
    window.dispatchEvent(touches('touchcancel', 1))
    await tick()
    expect(touchesReleased).toBe(0)
  })

  it('fewer fingers than held pointers releases at once', () => {
    held = 2
    window.dispatchEvent(touches('touchmove', 1))
    expect(touchesReleased).toBe(1)
    held = 1
    window.dispatchEvent(touches('touchstart', 1))
    expect(touchesReleased).toBe(1)
  })

  it('stops listening once detached', () => {
    stop()
    window.dispatchEvent(new Event('blur'))
    expect(all).toBe(0)
  })
})
