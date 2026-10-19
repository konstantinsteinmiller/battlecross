// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { attachInput, createInput, type Input } from '@/game/engine/input'
import { inStickZone, isTabletViewport, stickAnchor, stickZone } from '@/game/engine/stickZone'

const R = 52
const phones: Array<[number, number]> = [[390, 844], [844, 390], [568, 320]]
const tablets: Array<[number, number]> = [[1024, 768], [768, 1024]]

describe('the floating start zone geometry', () => {
  it('tells a tablet by a coarse pointer and a short side of 600 px', () => {
    expect(isTabletViewport(1024, 768, true)).toBe(true)
    expect(isTabletViewport(844, 390, true)).toBe(false)
    expect(isTabletViewport(1024, 768, false)).toBe(false)
  })
  it('phone zones are about 38 % x 45 % of the screen, width capped', () => {
    const p = stickZone(390, 844, R, false)
    expect(p.w).toBeCloseTo(148.2, 1)
    expect(p.h).toBe(320)
    expect(stickZone(844, 390, R, false).w).toBe(240)
    const s = stickZone(568, 320, R, false)
    expect(s.w).toBeCloseTo(215.84, 1)
    expect(s.h).toBe(144)
  })
  it('tablet zones are larger, with a 110 px edge inset', () => {
    const l = stickZone(1024, 768, R * 1.25, true)
    expect(l.w).toBeCloseTo(440, 5)
    expect(l.h).toBeCloseTo(384, 5)
    expect(l.edgeX).toBe(110)
    const p = stickZone(768, 1024, R * 1.25, true)
    expect(p.w).toBeCloseTo(345.6, 1)
    expect(p.h).toBe(420)
  })
  it('the anchor keeps a radius + 8 px from the left and bottom edges (more on a tablet)', () => {
    for (const [w, h] of phones) {
      const a = stickAnchor(stickZone(w, h, R, false), w, h, 2, h - 2)
      expect(a.x).toBe(R + 8)
      expect(a.y).toBe(h - (R + 8))
    }
    for (const [w, h] of tablets) {
      const a = stickAnchor(stickZone(w, h, R * 1.25, true), w, h, 0, h)
      expect(a.x).toBe(110)
      expect(a.y).toBe(h - 110)
    }
  })
  it('a touch already inside the margins is not moved; safe-area insets push it in', () => {
    const z = stickZone(844, 390, R, false)
    expect(stickAnchor(z, 844, 390, 120, 300)).toEqual({ x: 120, y: 300 })
    const zi = stickZone(844, 390, R, false, 44, 20)
    expect(stickAnchor(zi, 844, 390, 0, 390).x).toBe(R + 8 + 44)
    expect(stickAnchor(zi, 844, 390, 0, 390).y).toBe(390 - (R + 8 + 20))
  })
  it('membership: the bottom-left corner only', () => {
    for (const [w, h] of [...phones, ...tablets]) {
      const z = stickZone(w, h, R, w >= 600 && h >= 600)
      expect(inStickZone(z, w, h, 5, h - 5)).toBe(true)
      expect(inStickZone(z, w, h, w - 5, h - 5)).toBe(false)
      expect(inStickZone(z, w, h, 5, 5)).toBe(false)
    }
  })
})

const ptr = (type: string, id: number, x: number, y: number): Event =>
  Object.assign(new Event(type, { bubbles: true, cancelable: true }), {
    pointerId: id, pointerType: 'touch', clientX: x, clientY: y, button: 0
  })

describe('the floating start zone in the input', () => {
  let surface: HTMLElement
  let input: Input
  let detach: () => void
  beforeEach(() => {
    surface = document.createElement('div')
    surface.getBoundingClientRect = () => ({ left: 0, top: 0, width: 844, height: 390, right: 844, bottom: 390, x: 0, y: 0, toJSON: () => ({}) })
    document.body.appendChild(surface)
    input = createInput()
    input.joyHomeX = 70
    input.joyHomeY = 320
    input.joyHomeR = 60
    detach = attachInput(surface, input)
  })
  afterEach(() => { detach(); surface.remove() })

  it('a drag from the zone becomes the stick, anchored at the start point', () => {
    surface.dispatchEvent(ptr('pointerdown', 1, 200, 280))
    expect(input.joyActive).toBe(false)
    surface.dispatchEvent(ptr('pointermove', 1, 240, 280))
    expect(input.joyActive).toBe(true)
    expect(input.joyOriginX).toBe(200)
    expect(input.joyOriginY).toBe(280)
    expect(input.held).toBe(false)
    expect(input.moveX).toBeGreaterThan(0)
    expect(input.moveY).toBeCloseTo(0, 5)
    surface.dispatchEvent(ptr('pointerup', 1, 240, 280))
    expect(input.joyActive).toBe(false)
    expect(input.moveX).toBe(0)
    expect(input.taps).toEqual([])
  })
  it('the anchor is pulled in from the edge so the handle can go left and down', () => {
    surface.dispatchEvent(ptr('pointerdown', 1, 130, 388))
    surface.dispatchEvent(ptr('pointermove', 1, 130, 340))
    expect(input.joyOriginY).toBe(390 - 60)
    surface.dispatchEvent(ptr('pointermove', 1, 50, 360))
    expect(input.moveX).toBeLessThan(0)
    expect(input.moveY).toBeLessThan(0)
  })
  it('a short tap in the zone is still a world tap', () => {
    surface.dispatchEvent(ptr('pointerdown', 1, 200, 280))
    surface.dispatchEvent(ptr('pointerup', 1, 200, 280))
    expect(input.joyActive).toBe(false)
    expect(input.taps).toEqual([{ x: 200, y: 280 }])
  })
  it('a touch outside the zone does not spawn the stick', () => {
    surface.dispatchEvent(ptr('pointerdown', 1, 600, 280))
    surface.dispatchEvent(ptr('pointermove', 1, 660, 280))
    expect(input.joyActive).toBe(false)
    expect(input.dragging).toBe(true)
  })
  it('the stick travel follows input.joyTravel (the HUD scale)', () => {
    input.joyTravel = 26
    surface.dispatchEvent(ptr('pointerdown', 1, 70, 320))
    surface.dispatchEvent(ptr('pointermove', 1, 96, 320))
    expect(input.joyX).toBeCloseTo(1, 5)
  })
})
