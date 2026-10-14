// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { attachInput, createInput, type Input } from '@/game/engine/input'

// A held stick or key must let go when the browser loses track of it (iOS
// drops touchend on a system gesture, a notification or an app switch).

const ptr = (type: string, id: number, x: number, y: number, pointerType = 'touch'): Event =>
  Object.assign(new Event(type, { bubbles: true, cancelable: true }), {
    pointerId: id, pointerType, clientX: x, clientY: y, button: 0
  })

const touches = (type: string, n: number): Event =>
  Object.assign(new Event(type, { bubbles: true }), { touches: { length: n } })

let surface: HTMLElement
let input: Input
let detach: () => void

const grabStick = () => {
  surface.dispatchEvent(ptr('pointerdown', 1, 60, 300))
  surface.dispatchEvent(ptr('pointermove', 1, 200, 140))
}

beforeEach(() => {
  surface = document.createElement('div')
  document.body.appendChild(surface)
  input = createInput()
  input.joyHomeX = 60
  input.joyHomeY = 300
  input.joyHomeR = 50
  detach = attachInput(surface, input)
})

afterEach(() => {
  detach()
  surface.remove()
})

describe('held input is released when the browser loses it', () => {
  it('the stick steers while held', () => {
    grabStick()
    expect(input.joyActive).toBe(true)
    expect(Math.hypot(input.moveX, input.moveY)).toBeGreaterThan(0.5)
  })

  for (const [name, fire] of [
    ['pointercancel', () => surface.dispatchEvent(ptr('pointercancel', 1, 0, 0))],
    ['lostpointercapture', () => surface.dispatchEvent(ptr('lostpointercapture', 1, 0, 0))],
    ['window blur', () => window.dispatchEvent(new Event('blur'))],
    ['pagehide', () => window.dispatchEvent(new Event('pagehide'))],
    ['orientationchange', () => window.dispatchEvent(new Event('orientationchange'))],
    ['resize', () => window.dispatchEvent(new Event('resize'))]
  ] as const) {
    it(`${name} releases the stick`, () => {
      grabStick()
      fire()
      expect(input.joyActive).toBe(false)
      expect(Math.abs(input.moveX)).toBe(0)
      expect(Math.abs(input.moveY)).toBe(0)
    })
  }

  it('the page going hidden releases the stick and the keys', () => {
    grabStick()
    window.dispatchEvent(Object.assign(new Event('keydown'), { code: 'KeyW' }))
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    delete (document as unknown as Record<string, unknown>).visibilityState
    expect(input.joyActive).toBe(false)
    expect(input.keysMoving).toBe(false)
    expect(Math.abs(input.moveX)).toBe(0)
    expect(Math.abs(input.moveY)).toBe(0)
  })

  it('a touchend with no fingers left releases a stick whose pointerup was lost', async () => {
    grabStick()
    window.dispatchEvent(touches('touchend', 0))
    await new Promise(r => setTimeout(r, 0))
    expect(input.joyActive).toBe(false)
    expect(Math.abs(input.moveX)).toBe(0)
  })

  it('a touchend with a finger still down keeps the stick', async () => {
    grabStick()
    window.dispatchEvent(touches('touchend', 1))
    await new Promise(r => setTimeout(r, 0))
    expect(input.joyActive).toBe(true)
  })

  it('a touch list shorter than the held pointers releases them', () => {
    grabStick()
    surface.dispatchEvent(ptr('pointerdown', 2, 400, 100))
    expect(input.held).toBe(true)
    window.dispatchEvent(touches('touchmove', 1))
    expect(input.joyActive).toBe(false)
    expect(input.held).toBe(false)
    expect(Math.abs(input.moveX)).toBe(0)
  })

  it('a normal tap still lands when its touchend follows the pointerup', async () => {
    surface.dispatchEvent(ptr('pointerdown', 3, 400, 100))
    surface.dispatchEvent(ptr('pointerup', 3, 400, 100))
    window.dispatchEvent(touches('touchend', 0))
    await new Promise(r => setTimeout(r, 0))
    expect(input.taps).toEqual([{ x: 400, y: 100 }])
  })

  it('a NaN finger position never steers', () => {
    surface.dispatchEvent(ptr('pointerdown', 1, 60, 300))
    surface.dispatchEvent(ptr('pointermove', 1, NaN, NaN))
    expect(Number.isFinite(input.moveX)).toBe(true)
    expect(Number.isFinite(input.moveY)).toBe(true)
    expect(Math.abs(input.moveX)).toBe(0)
    expect(Math.abs(input.moveY)).toBe(0)
  })
})
