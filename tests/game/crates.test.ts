// Supply crates break only to a charged shot (src/game/sim/objectives.ts):
// a quick shot bounces off with a tink and tells the lessons, so the charge
// shot has a second use and the crate lesson has something to teach. Energy
// barrels stay volatile and pop to anything.

import { describe, expect, it, vi } from 'vitest'
import { Scene } from 'three'
import { generateMap, cellCenter } from '@/game/world/levelGen'
import { createNav, hasLineOfSight } from '@/game/world/nav'
import { THEMES } from '@/game/world/themes'
import { tutorialQuest } from '@/game/data/quests'
import { MissionObjects, type ObjectiveHost } from '@/game/sim/objectives'

const makeObjects = () => {
  const q = tutorialQuest()
  const map = generateMap({ seed: q.seed, rooms: q.rooms, boss: true })
  const scene = new Scene()
  const noop = () => {}
  const host = {
    scene, map, nav: createNav(map), theme: THEMES.scrapyard, propParent: () => scene,
    fx: { sparks: noop, emit: noop, orbBurst: noop, flash: noop, riseRing: noop },
    shocks: { spawn: noop }, shake: noop, sfx: noop, explode: vi.fn(),
    onCrateDeflect: vi.fn(), onCrateBroken: vi.fn(), onChestOpened: noop, onCoreTaken: noop, onObjectiveDone: noop
  }
  return { objs: new MissionObjects(host as unknown as ObjectiveHost, q), host, map }
}

describe('supply crates', () => {
  it('turn a quick shot away and report it', () => {
    const { objs, host } = makeObjects()
    const c = objs.addCrate(10, 10, 0)
    expect(objs.shotHitsCrate(c.x, 0.6, c.z, 0.1, 999, 0)).toBe(true)
    expect(c.broken).toBe(false)
    expect(c.hp).toBe(12)
    expect(host.onCrateDeflect).toHaveBeenCalledWith(c)
  })

  it('break to a charged shot (or a copied weapon)', () => {
    const { objs, host } = makeObjects()
    const c = objs.addCrate(10, 10, 0)
    expect(objs.shotHitsCrate(c.x, 0.6, c.z, 0.1, 30, 1)).toBe(true)
    expect(c.broken).toBe(true)
    expect(host.onCrateBroken).toHaveBeenCalledWith(c)
  })

  it('barrels still pop to anything', () => {
    const { objs } = makeObjects()
    const b = objs.addCrate(10, 10, 0, 'barrel')
    objs.shotHitsCrate(b.x, 0.6, b.z, 0.1, 10, 0)
    expect(b.broken).toBe(true)
  })

  it('a seeded mission lays its crates out the same every time (resume snapshots index them)', () => {
    const a = makeObjects().objs.crates.map(c => [c.kind, c.x.toFixed(3), c.z.toFixed(3)])
    const b = makeObjects().objs.crates.map(c => [c.kind, c.x.toFixed(3), c.z.toFixed(3)])
    expect(a).toEqual(b)
    expect(a.length).toBeGreaterThan(0)
  })
})

describe('a scripted chest (the walkthrough\'s chest room)', () => {
  it('stands against a wall in sight of the door, clear of the crates, under the same id every time', () => {
    const place = () => {
      const { objs, host, map } = makeObjects()
      const room = map.rooms.find(r => r.role === 'boss')!
      const from = map.rooms[room.parent]!
      // Seen from the doorway the player comes in by.
      const d = map.doors[from.door]!
      const fx = cellCenter(d.i + (d.axis === 'x' ? d.dir : 0))
      const fz = cellCenter(d.j + (d.axis === 'z' ? d.dir : 0))
      const before = objs.chests.length
      const c = objs.placeChest(from, fx, fz)!
      return { objs, host, from, fx, fz, before, c }
    }
    const a = place()
    expect(a.c).not.toBeNull()
    expect(a.c.id).toBe(a.before)
    expect(a.c.opened).toBe(false)
    expect(a.c.rarity).toBe('tuned')
    const i = Math.floor(a.c.x / 3)
    const j = Math.floor(a.c.z / 3)
    expect(i >= a.from.x0 && i < a.from.x0 + a.from.w && j >= a.from.z0 && j < a.from.z0 + a.from.h).toBe(true)
    expect(hasLineOfSight(a.host.nav, a.fx, a.fz, a.c.x, a.c.z)).toBe(true)
    expect(a.objs.crates.every(k => Math.hypot(k.x - a.c.x, k.z - a.c.z) > 1)).toBe(true)
    const b = place()
    expect([b.c.id, b.c.x, b.c.z]).toEqual([a.c.id, a.c.x, a.c.z])
  })
})
