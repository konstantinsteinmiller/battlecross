// The beam-in (src/game/sim/beamIn.ts): the mission opens on Flux himself,
// forming in the pad's column and landing, then the camera dives into his
// head. Pinned here: the timeline's order, that the shot starts in FRONT of
// him (his face, not his back), that it never sits inside a wall, and that the
// last frame is exactly the first-person eye looking exactly along the view —
// the handover must not jump.

import { describe, expect, it } from 'vitest'
import { CELL, type MapData } from '@/game/world/levelGen'
import { createNav } from '@/game/world/nav'
import { cineWorld, solidAt } from '@/game/sim/cineCam'
import { EYE_H } from '@/game/sim/constants'
import {
  BeamInCamera, beamInPose, newBeamInPose, padPlateLift,
  BEAM_IN_COLUMN, BEAM_IN_DIVE, BEAM_IN_DROP, BEAM_IN_END, BEAM_IN_LAND, BEAM_IN_SKIP_AFTER
} from '@/game/sim/beamIn'
import { PAD_TOP } from '@/game/sim/exitRun'

const grid = (W: number, H: number, walls: Array<[number, number]> = []): MapData => {
  const cell = new Uint8Array(W * H).fill(1)
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) if (i === 0 || j === 0 || i === W - 1 || j === H - 1) cell[j * W + i] = 0
  }
  for (const [i, j] of walls) cell[j * W + i] = 0
  return { w: W, h: H, cell, pillars: [], room: new Int16Array(W * H), rooms: [], doors: [] } as unknown as MapData
}
const c = (i: number): number => (i + 0.5) * CELL

/** Forward for a mission yaw / pitch: (−sin yaw, −cos yaw) in plan. */
const forward = (yaw: number, pitch: number) =>
  ({ x: -Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: -Math.cos(yaw) * Math.cos(pitch) })

describe('the timeline', () => {
  it('forms, lands, dives, ends — in that order, with a skip only after it began', () => {
    expect(BEAM_IN_SKIP_AFTER).toBeGreaterThan(0)
    expect(BEAM_IN_LAND).toBeLessThan(BEAM_IN_DIVE)
    expect(BEAM_IN_DIVE).toBeLessThan(BEAM_IN_END)
    expect(BEAM_IN_COLUMN).toBeGreaterThan(BEAM_IN_LAND)
    expect(BEAM_IN_COLUMN).toBeLessThan(BEAM_IN_DIVE)
    // Short enough to replay every mission.
    expect(BEAM_IN_END).toBeLessThan(2.6)
  })

  it('he forms thin and tall high in the column and lands on the plate', () => {
    const o = newBeamInPose()
    beamInPose(0, o)
    expect(o.drop).toBeCloseTo(BEAM_IN_DROP)
    expect(o.sy).toBeGreaterThan(1.3)
    expect(o.sx).toBeLessThan(0.5)
    beamInPose(BEAM_IN_LAND, o)
    expect(o.drop).toBe(0)
    expect(o.sx).toBe(1)
    expect(o.sy).toBe(1)
  })

  it('falls faster as he goes (out of the light, not floating down)', () => {
    const o = newBeamInPose()
    const h = (t: number) => beamInPose(t, o).drop
    const early = h(0) - h(0.2)
    const late = h(BEAM_IN_LAND - 0.2) - h(BEAM_IN_LAND)
    expect(late).toBeGreaterThan(early * 3)
  })

  it('third person (no HUD, no arm) until the lens is behind him; then the arm rises', () => {
    const o = newBeamInPose()
    beamInPose(BEAM_IN_LAND + 0.1, o)
    expect(o.cine).toBe(true)
    expect(o.arm).toBe(0)
    expect(o.crouch).toBeGreaterThan(0.5)
    beamInPose(BEAM_IN_END, o)
    expect(o.cine).toBe(false)
    expect(o.dive).toBe(1)
    expect(o.arm).toBe(1)
    // The lens is in his head by then: the body is not drawn over it.
    expect(o.body).toBe(false)
  })
})

describe('the camera', () => {
  const w = cineWorld(createNav(grid(12, 12)))
  const fx = c(6)
  const fz = c(6)

  it('opens in front of him, looking at him', () => {
    for (const yaw of [0, 1.2, -2.4, Math.PI]) {
      const cam = new BeamInCamera()
      const s = cam.frame(w, fx, 0, fz, yaw, 0, 0)
      const f = forward(yaw, 0)
      const toCam = { x: s.x - fx, z: s.z - fz }
      expect(toCam.x * f.x + toCam.z * f.z, `yaw ${yaw}`).toBeGreaterThan(1.5)
      // It looks at him (his chest), not past him.
      expect(Math.hypot(s.tx - fx, s.tz - fz)).toBeLessThan(0.01)
    }
  })

  it('ends exactly at the first-person eye, looking along the view', () => {
    const yaw = 0.7
    const pitch = -0.12
    const cam = new BeamInCamera()
    cam.frame(w, fx, 0, fz, yaw, pitch, 0)
    const s = cam.frame(w, fx, 0, fz, yaw, pitch, 1)
    expect(s.x).toBeCloseTo(fx, 6)
    expect(s.y).toBeCloseTo(EYE_H, 6)
    expect(s.z).toBeCloseTo(fz, 6)
    const d = Math.hypot(s.tx - s.x, s.ty - s.y, s.tz - s.z)
    const f = forward(yaw, pitch)
    expect((s.tx - s.x) / d).toBeCloseTo(f.x, 5)
    expect((s.ty - s.y) / d).toBeCloseTo(f.y, 5)
    expect((s.tz - s.z) / d).toBeCloseTo(f.z, 5)
  })

  it('swings round to BEHIND him on the way in', () => {
    const yaw = 0
    const cam = new BeamInCamera()
    cam.frame(w, fx, 0, fz, yaw, 0, 0)
    const s = cam.frame(w, fx, 0, fz, yaw, 0, 0.8)
    const f = forward(yaw, 0)
    expect((s.x - fx) * f.x + (s.z - fz) * f.z).toBeLessThan(0)
  })

  it('never sits inside a wall, even with one right in front of him', () => {
    // Flux faces −Z (yaw 0) with a wall's face 1.5 m ahead: the opening shot
    // (~2.7 m ahead of him) can not stand where it wants.
    const walled = cineWorld(createNav(grid(12, 12, [[5, 5], [6, 5], [7, 5]])))
    const open = new BeamInCamera().frame(w, fx, 0, fz, 0, 0, 0)
    expect(solidAt(walled, open.x, open.y, open.z)).toBe(true) // the wanted spot IS in the wall
    const cam = new BeamInCamera()
    for (let k = 0; k <= 20; k++) {
      const s = cam.frame(walled, fx, 0, fz, 0, 0, k / 20)
      expect(solidAt(walled, s.x, s.y, s.z), `dive ${k / 20}`).toBe(false)
    }
  })
})

describe('the pad', () => {
  it('on the pad his feet are on its plate; off it, on the floor', () => {
    expect(padPlateLift(5, 5, 5.3, 5.2)).toBe(PAD_TOP)
    expect(padPlateLift(5, 5, 8, 5)).toBe(0)
  })
})
