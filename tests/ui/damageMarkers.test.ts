// ─── The damage markers on screen ────────────────────────────────────────────
//
// `DamageMarkers.vue` draws the feed (`state/damageFeed.ts`) from the HUD
// ticker: a wedge on the ring round the crosshair at the source's bearing,
// re-aimed as Flux turns, gone after its fade; an edge bloom only for a source
// off the screen. Wordless and aria-hidden.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'

const g = vi.hoisted(() => ({
  mission: { camera: { fov: 60, aspect: 16 / 9 }, player: { x: 0, z: 0, yaw: 0 } } as unknown
}))
vi.mock('@/game/boot', () => ({ currentMission: () => g.mission }))

import DamageMarkers from '@/components/hud/DamageMarkers.vue'
import { damageFeed, MARKER_HOLD, MARKER_FADE } from '@/game/state/damageFeed'
import { hud, tickHud } from '@/game/state/hud'

type Player = { x: number; z: number; yaw: number }
const player = () => (g.mission as { player: Player }).player
const rotation = (el: Element): number => {
  const m = /rotate\((-?[\d.]+)rad\)/.exec((el as SVGElement).style.transform)
  return m ? Number(m[1]) : NaN
}

enableAutoUnmount(afterEach)
beforeEach(() => {
  hud.phase = 'play'
  Object.assign(player(), { x: 0, z: 0, yaw: 0 })
})
afterEach(() => { hud.phase = 'boot' })

describe('DamageMarkers', () => {
  it('is wordless and hidden from assistive tech', () => {
    const w = mount(DamageMarkers)
    expect(w.get('.dmg-layer').attributes('aria-hidden')).toBe('true')
    expect(w.text()).toBe('')
  })

  it('a hit from the right puts a wedge at +90°, re-aimed when Flux turns, gone after its fade', () => {
    const w = mount(DamageMarkers)
    damageFeed.push(player(), { x: 10, z: 0 }, 0, 0, 10, 100)
    tickHud(1 / 60)
    const arcs = w.findAll('.dmg-arc')
    const on = arcs.filter(a => Number((a.element as SVGElement).style.opacity) > 0)
    expect(on).toHaveLength(1)
    expect(rotation(on[0]!.element)).toBeCloseTo(Math.PI / 2, 2)
    // Turn right by 90° (the yaw grows to the left): now dead ahead.
    player().yaw = -Math.PI / 2
    tickHud(1 / 60)
    expect(rotation(on[0]!.element)).toBeCloseTo(0, 2)
    tickHud(MARKER_HOLD + MARKER_FADE)
    expect((on[0]!.element as SVGElement).style.opacity).toBe('0')
  })

  it('an edge bloom only for a source off the screen', () => {
    const w = mount(DamageMarkers)
    const blooms = () => w.findAll('.dmg-edge').filter(e => Number((e.element as HTMLElement).style.opacity) > 0)
    damageFeed.push(player(), { x: 0, z: -10 }, 0, 0, 10, 100) // ahead
    tickHud(1 / 60)
    expect(blooms()).toHaveLength(0)
    damageFeed.push(player(), { x: 0, z: 10 }, 0, 0, 10, 100) // behind
    tickHud(1 / 60)
    expect(blooms()).toHaveLength(1)
  })

  it('a hit with no direction shows nothing', () => {
    const w = mount(DamageMarkers)
    damageFeed.push(player(), null, 0, 0, 30, 100)
    tickHud(1 / 60)
    expect(w.findAll('.dmg-arc').some(a => Number((a.element as SVGElement).style.opacity) > 0)).toBe(false)
  })

  it('out of play (the exit, the results) the markers clear', () => {
    const w = mount(DamageMarkers)
    damageFeed.push(player(), { x: 10, z: 0 }, 0, 0, 10, 100)
    tickHud(1 / 60)
    hud.phase = 'beamOut'
    tickHud(1 / 60)
    expect(damageFeed.markers.some(m => m.active)).toBe(false)
    expect(w.findAll('.dmg-arc').every(a => Number((a.element as SVGElement).style.opacity || 0) === 0)).toBe(true)
  })
})
