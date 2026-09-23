// Invariants of the procedural sector maps and the navigation built on them.
//
// A map that is not fully connected, a start pad in a wall or a boss room
// without its boss door is a mission the player cannot finish — and it only
// shows up for the one seed a player happens to roll. So these sweep a few
// hundred seeds per shape instead of checking one hand-picked map.

import { describe, expect, it } from 'vitest'
import { generateMap, roomCenter, CELL, Cell, type MapData } from '@/game/world/levelGen'
import { createNav, findPath, hasLineOfSight, moveCircle, isSolidAt } from '@/game/world/nav'
import { mulberry32 } from '@/game/world/rng'

const SEEDS = Array.from({ length: 160 }, (_, i) => (i * 2654435761 + 97) >>> 0)
const SHAPES = [
  { rooms: 6, boss: false },
  { rooms: 9, boss: true },
  { rooms: 11, boss: true }
]

/** Flood fill over every non-void cell from the start pad. */
const reachable = (m: MapData): Set<number> => {
  const seen = new Set<number>()
  const si = Math.floor(m.start.x / CELL)
  const sj = Math.floor(m.start.z / CELL)
  const stack = [sj * m.w + si]
  while (stack.length) {
    const k = stack.pop()!
    if (seen.has(k) || m.cell[k] === Cell.Void) continue
    seen.add(k)
    const i = k % m.w
    const j = (k - i) / m.w
    if (i > 0) stack.push(k - 1)
    if (i < m.w - 1) stack.push(k + 1)
    if (j > 0) stack.push(k - m.w)
    if (j < m.h - 1) stack.push(k + m.w)
  }
  return seen
}

describe('generateMap', () => {
  it('is deterministic for a seed', () => {
    const a = generateMap({ seed: 1234, rooms: 9, boss: true })
    const b = generateMap({ seed: 1234, rooms: 9, boss: true })
    expect(JSON.stringify(a.rooms)).toBe(JSON.stringify(b.rooms))
    expect(JSON.stringify(a.doors)).toBe(JSON.stringify(b.doors))
    expect(Array.from(a.cell)).toEqual(Array.from(b.cell))
  })

  for (const shape of SHAPES) {
    it(`every map is sound (${shape.rooms} rooms, boss ${shape.boss})`, () => {
      for (const seed of SEEDS) {
        const m = generateMap({ seed, ...shape })
        const where = `seed ${seed}`
        expect(m.rooms.length, where).toBeGreaterThanOrEqual(4)
        // The boss room hangs off the requested rooms as one extra.
        expect(m.rooms.length, where).toBeLessThanOrEqual(shape.rooms + (shape.boss ? 1 : 0))
        // One start pad, and it stands on a room floor.
        expect(m.rooms.filter(r => r.role === 'start').length, where).toBe(1)
        const sk = Math.floor(m.start.z / CELL) * m.w + Math.floor(m.start.x / CELL)
        expect(m.cell[sk], where).toBe(Cell.Room)
        // The boss room exists exactly when asked for, behind a boss door.
        const bosses = m.rooms.filter(r => r.role === 'boss')
        expect(bosses.length, where).toBe(shape.boss ? 1 : 0)
        if (shape.boss) {
          expect(m.doors.some(d => d.boss && d.to === bosses[0]!.id), where).toBe(true)
        }
        // Every room is reachable from the pad (doors open for the player).
        const seen = reachable(m)
        for (const r of m.rooms) {
          const [cx, cz] = roomCenter(r)
          const k = Math.floor(cz / CELL) * m.w + Math.floor(cx / CELL)
          expect(seen.has(k), `${where} room ${r.id}`).toBe(true)
        }
        // Doors sit on walkable cells and join two different rooms.
        for (const d of m.doors) {
          expect(m.cell[d.j * m.w + d.i], `${where} door ${d.id}`).not.toBe(Cell.Void)
          expect(d.from, where).not.toBe(d.to)
        }
        // Rooms that host encounters have somewhere to put them.
        for (const r of m.rooms) {
          if (r.role !== 'start') expect(r.spots.length, `${where} room ${r.id}`).toBeGreaterThan(0)
        }
      }
    })
  }
})

describe('navigation', () => {
  it('finds a walk-to path from the pad to every room', () => {
    for (const seed of SEEDS.slice(0, 60)) {
      const m = generateMap({ seed, rooms: 10, boss: true })
      const nav = createNav(m)
      for (const r of m.rooms) {
        const [cx, cz] = roomCenter(r)
        // Hard cap well above any 44×44 grid, so a miss is a real miss.
        const p = findPath(nav, m.start.x, m.start.z, cx, cz, 5000, 1)
        expect(p, `seed ${seed} room ${r.id}`).not.toBeNull()
      }
    }
  })

  it('line of sight is symmetric', () => {
    const m = generateMap({ seed: 77, rooms: 10, boss: true })
    const nav = createNav(m)
    const rng = mulberry32(5)
    for (let n = 0; n < 400; n++) {
      const ax = rng() * m.w * CELL
      const az = rng() * m.h * CELL
      const bx = rng() * m.w * CELL
      const bz = rng() * m.h * CELL
      if (isSolidAt(nav, ax, az) || isSolidAt(nav, bx, bz)) continue
      expect(hasLineOfSight(nav, ax, az, bx, bz)).toBe(hasLineOfSight(nav, bx, bz, ax, az))
    }
  })

  it('a body pushed around at random never ends up inside a wall', () => {
    const m = generateMap({ seed: 4242, rooms: 11, boss: true })
    const nav = createNav(m)
    const rng = mulberry32(9)
    const out: [number, number] = [0, 0]
    let x = m.start.x
    let z = m.start.z
    for (let n = 0; n < 5000; n++) {
      // Steps up to half a cell: far larger than any frame's movement.
      moveCircle(nav, x, z, (rng() - 0.5) * CELL, (rng() - 0.5) * CELL, 0.62, out)
      x = out[0]
      z = out[1]
      expect(isSolidAt(nav, x, z), `step ${n}`).toBe(false)
    }
  })
})
