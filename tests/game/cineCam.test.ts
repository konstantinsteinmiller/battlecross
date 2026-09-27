// The exit cutscene's free camera (src/game/sim/cineCam.ts) asks the level
// where the solid is: wall cells up to their tops (the walls are open to the
// sky), floors, pillars, door frames. The line of sight from the subject to
// the lens decides where it goes: a wanted spot behind a wall is pulled in to
// this side of it; one too close to keep is swung round the subject; nothing
// placed may ever sit inside geometry. Pinned on hand-made grids and on the
// real labyrinth and climb generators.

import { describe, expect, it } from 'vitest'
import { CELL, WALL_H, generateMap, type MapData } from '@/game/world/levelGen'
import { createNav } from '@/game/world/nav'
import { generateClimb } from '@/game/world/climbGen'
import {
  cineWorld, solidAt, clearLine, clearFraction, placeCamera, CAM_PAD, CAM_MIN, type CamSpot
} from '@/game/sim/cineCam'

/** An open W×H floor with its border walled; `walls` adds void cells. */
const grid = (W: number, H: number, walls: Array<[number, number]> = []): MapData => {
  const cell = new Uint8Array(W * H).fill(1)
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) if (i === 0 || j === 0 || i === W - 1 || j === H - 1) cell[j * W + i] = 0
  }
  for (const [i, j] of walls) cell[j * W + i] = 0
  return { w: W, h: H, cell, pillars: [], room: new Int16Array(W * H), rooms: [], doors: [] } as unknown as MapData
}

const at = (x: number, y: number, z: number): CamSpot => ({ x, y, z })
const c = (i: number): number => (i + 0.5) * CELL

describe('solid space', () => {
  const w = cineWorld(createNav(grid(10, 10, [[6, 3], [6, 4], [6, 5], [6, 6]])))

  it('a wall cell is solid up to its top, and open sky above it', () => {
    expect(solidAt(w, c(6), 1.5, c(4))).toBe(true)
    expect(solidAt(w, c(6), WALL_H - 0.2, c(4))).toBe(true)
    expect(solidAt(w, c(6), WALL_H + 1.5, c(4))).toBe(false)
  })

  it('open floor is free above the floor and solid under it', () => {
    expect(solidAt(w, c(3), 1, c(4))).toBe(false)
    expect(solidAt(w, c(3), -0.1, c(4))).toBe(true)
    // …and a lens this low, with its clearance, touches the floor.
    expect(solidAt(w, c(3), 0.2, c(4), CAM_PAD)).toBe(true)
  })

  it('clearance: a point beside a wall is solid once its radius reaches it', () => {
    const x = 6 * CELL - 0.2 // 0.2 m short of the wall's face
    expect(solidAt(w, x, 1.2, c(4))).toBe(false)
    expect(solidAt(w, x, 1.2, c(4), 0.3)).toBe(true)
  })

  it('the line of sight is cut by a wall and open over it', () => {
    expect(clearLine(w, c(3), 1.2, c(4), c(8), 1.2, c(4))).toBe(false)
    expect(clearLine(w, c(3), 1.2, c(4), c(3), 1.2, c(7))).toBe(true)
    // Up over the wall tops, the same two columns see each other.
    expect(clearLine(w, c(3), WALL_H + 1, c(4), c(8), WALL_H + 1, c(4))).toBe(true)
    const f = clearFraction(w, c(3), 1.2, c(4), c(8), 1.2, c(4))
    expect(f).toBeGreaterThan(0.3)
    expect(f).toBeLessThan(0.7)
  })

  it('door boxes (lintels, shut doors) are solid', () => {
    const wb = cineWorld(createNav(grid(10, 10)))
    wb.boxes = [{ x0: 10, x1: 11, y0: 3, y1: 4.5, z0: 9, z1: 12 }]
    expect(solidAt(wb, 10.5, 3.5, 10)).toBe(true)
    expect(solidAt(wb, 10.5, 2, 10)).toBe(false)
  })
})

describe('placeCamera', () => {
  const w = cineWorld(createNav(grid(10, 10, [[6, 3], [6, 4], [6, 5], [6, 6]])))

  it('keeps the wanted spot when the line to it is open', () => {
    const out = at(0, 0, 0)
    expect(placeCamera(w, c(3), 1, c(4), at(c(3) - 2, 1.2, c(4) + 1.5), out)).toBe('want')
    expect(out).toEqual(at(c(3) - 2, 1.2, c(4) + 1.5))
  })

  it('a spot behind a wall is pulled in to this side of it, clear of it', () => {
    const out = at(0, 0, 0)
    const rule = placeCamera(w, c(3), 1, c(4), at(c(8), 1.2, c(4)), out)
    expect(rule).toBe('pulled')
    expect(out.x).toBeLessThan(6 * CELL - CAM_PAD + 0.01)
    expect(Math.hypot(out.x - c(3), out.z - c(4))).toBeGreaterThanOrEqual(CAM_MIN)
    expect(solidAt(w, out.x, out.y, out.z, CAM_PAD * 0.9)).toBe(false)
    expect(clearLine(w, c(3), 1, c(4), out.x, out.y, out.z)).toBe(true)
  })

  it('something low in the way (a crate, the pad): it cranes up over it', () => {
    const wb = cineWorld(createNav(grid(10, 10)))
    // A low block 1.5 m behind the subject, as wide as the room is deep.
    wb.boxes = [{ x0: c(3) - 2.5, x1: c(3) - 1.5, y0: 0, y1: 0.8, z0: 3, z1: 27 }]
    const out = at(0, 0, 0)
    const want = at(c(3) - 4, 0.5, c(4))
    expect(placeCamera(wb, c(3), 1, c(4), want, out)).toBe('raised')
    expect(out.y).toBeGreaterThan(0.8 + CAM_PAD)
    expect(Math.hypot(out.x - c(3), out.z - c(4))).toBeGreaterThan(3)
    expect(solidAt(wb, out.x, out.y, out.z, CAM_PAD * 0.9)).toBe(false)
    expect(clearLine(wb, c(3), 1, c(4), out.x, out.y, out.z)).toBe(true)
  })

  it('too close to keep, it swings round the subject instead', () => {
    // The subject stands 1 m from the wall and the lens wants to be in it.
    const ax = 6 * CELL - 1
    const out = at(0, 0, 0)
    const rule = placeCamera(w, ax, 1, c(4), at(ax + 3, 1.2, c(4)), out)
    expect(rule).toBe('swung')
    expect(Math.hypot(out.x - ax, out.y - 1, out.z - c(4))).toBeGreaterThanOrEqual(CAM_MIN - 1e-6)
    expect(solidAt(w, out.x, out.y, out.z, CAM_PAD * 0.9)).toBe(false)
    expect(clearLine(w, ax, 1, c(4), out.x, out.y, out.z)).toBe(true)
  })

  it('boxed in on every side, it still finds open air: craned up into a corner, or straight over the subject', () => {
    // A one-cell well of floor walled all round.
    const box = cineWorld(createNav(grid(5, 5, [[1, 1], [2, 1], [3, 1], [1, 2], [3, 2], [1, 3], [2, 3], [3, 3]])))
    const out = at(0, 0, 0)
    const rule = placeCamera(box, c(2), 1, c(2), at(c(2) + 4, 1.2, c(2)), out)
    expect(['swung', 'lifted']).toContain(rule)
    expect(out.y).toBeGreaterThan(1)
    expect(solidAt(box, out.x, out.y, out.z, CAM_PAD * 0.9)).toBe(false)
    expect(clearLine(box, c(2), 1, c(2), out.x, out.y, out.z)).toBe(true)
    // With no room at all, straight up: the sky is open.
    const tight = placeCamera(box, c(2), 1, c(2), at(c(2) + 4, 1.2, c(2)), out, 3)
    expect(tight).toBe('lifted')
    expect(out.y).toBeGreaterThan(2)
    expect(solidAt(box, out.x, out.y, out.z)).toBe(false)
  })
})

describe('on the real generators', () => {
  /** Every placement round a subject is out of the walls with its sight open. */
  const sweep = (m: MapData, spots: Array<[number, number, number]>): number => {
    const w = cineWorld(createNav(m))
    const out = at(0, 0, 0)
    let n = 0
    for (const [x, y, z] of spots) {
      // A subject stands on open floor (a room's middle may hold a pillar).
      if (solidAt(w, x, y + 1, z, 0.7)) continue
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        placeCamera(w, x, y + 1, z, at(x + Math.sin(a) * 4, y + 0.5, z + Math.cos(a) * 4), out)
        expect(solidAt(w, out.x, out.y, out.z, CAM_PAD * 0.9)).toBe(false)
        expect(clearLine(w, x, y + 1, z, out.x, out.y, out.z)).toBe(true)
        n++
      }
    }
    return n
  }

  it('labyrinth rooms', () => {
    const m = generateMap({ seed: 91, rooms: 7, boss: true })
    const spots = m.rooms.map(r => [(r.x0 + r.w / 2) * CELL, 0, (r.z0 + r.h / 2) * CELL] as [number, number, number])
    spots.push([m.start.x, 0, m.start.z])
    expect(sweep(m, spots)).toBeGreaterThan(40)
  })

  it('the climb: its shafts, ledges and corridors, at their own heights', () => {
    const m = generateClimb(5)
    const spots = m.terrain!.checkpoints.map(cp => [cp.x, cp.y, cp.z] as [number, number, number])
    expect(sweep(m, spots)).toBeGreaterThan(40)
    // A climb wall stands as tall as its room: solid at a storey's height
    // where a labyrinth wall would long be over.
    const w = cineWorld(createNav(m))
    const t = m.terrain!
    const tallest = Math.max(...t.wallTop)
    expect(tallest).toBeGreaterThan(WALL_H + 2)
    expect(w.maxTop).toBeGreaterThanOrEqual(tallest)
  })
})
