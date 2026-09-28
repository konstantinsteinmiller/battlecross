// Corridor traps (src/game/sim/traps.ts): where they go (from the map seed,
// never where a fight or a door could stack on them), how a flame jet cycles
// and a blade swings, when either hurts, and how both park for a fight. Driven
// on real generated maps with a fake mission around the system, so no GPU.

import { describe, expect, it } from 'vitest'
import { generateMap, CELL, type MapData } from '@/game/world/levelGen'
import { tutorialQuest } from '@/game/data/quests'
import { scaleDmg } from '@/game/data/enemies'
import {
  TrapSystem, planTraps, plateSpot, corridorCells, mainPath, flameStage, trapDamage, inFlame, bladeHits,
  alongOf, acrossOf, FLAME_IDLE, FLAME_WARN, FLAME_BURN, FLAME_CYCLE, BLADE_PERIOD, BLADE_ARM, BLADE_AMP,
  TRAP_DMG, type TrapSpot, type TrapState, type TrapHost, type TrapView
} from '@/game/sim/traps'

const MAPS: MapData[] = []
for (let k = 0; k < 40; k++) MAPS.push(generateMap({ seed: 1000 + k * 7919, rooms: 6 + (k % 6), boss: k % 3 === 0 }))

/** A fake mission: counts hits and sounds; Flux stands where the test puts him. */
const makeHost = (x = 0, z = 0) => {
  const hits: Array<{ dmg: number; blockable: boolean; fromX: number; fromZ: number }> = []
  const sounds: string[] = []
  const host: TrapHost = {
    time: 0,
    player: { x, z },
    setup: { enemyLevel: 1 },
    hitPlayer: (_e, dmg, o) => { hits.push({ dmg, blockable: o.blockable, fromX: o.fromX, fromZ: o.fromZ }); return 'hit' },
    sfx: (name) => { sounds.push(name) },
    shake: () => {}
  }
  return { host, hits, sounds }
}

/** A hand-made spot in an X corridor at the origin. */
const spot = (over: Partial<TrapSpot> = {}): TrapSpot => ({
  kind: 'flame', door: 0, room: 0, i: 0, j: 0, axis: 'x', x: 0, z: 0, phase: 0, side: 0, plate: false, ...over
})

const step = (sys: InstanceType<typeof TrapSystem>, host: TrapHost, secs: number, combat = false, playing = true) => {
  for (let t = 0; t < secs - 1e-9; t += 1 / 60) {
    host.time += 1 / 60
    sys.update(1 / 60, { playing, combat })
  }
}

describe('placement', () => {
  it('one or two per regular map, from the seed: the same map gets the same traps', () => {
    for (const map of MAPS) {
      const a = planTraps(map)
      expect(a.length).toBeLessThanOrEqual(2)
      expect(planTraps(map)).toEqual(a)
    }
    expect(MAPS.filter(m => planTraps(m).length > 0).length).toBeGreaterThan(MAPS.length * 0.8)
  })

  it('leaves the map itself alone (the tutorial layout is pinned elsewhere)', () => {
    const q = tutorialQuest()
    const before = JSON.stringify(generateMap({ seed: q.seed, rooms: q.rooms, boss: true }))
    const map = generateMap({ seed: q.seed, rooms: q.rooms, boss: true })
    planTraps(map)
    plateSpot(map, 0)
    expect(JSON.stringify(map)).toBe(before)
  })

  it('never in the tutorial (its one trap is the scripted gel plate)', () => {
    const q = tutorialQuest()
    expect(planTraps(generateMap({ seed: q.seed, rooms: q.rooms, boss: true }), { tutorial: true })).toEqual([])
  })

  it('never in a start-room corridor, never the boss shutter\'s, never on a door\'s own cell', () => {
    for (const map of MAPS) {
      const start = map.rooms.find(r => r.role === 'start')!.id
      for (const s of planTraps(map)) {
        const d = map.doors[s.door]!
        expect(d.from).not.toBe(start)
        expect(d.boss).toBe(false)
        const cells = corridorCells(map, d)
        const at = cells.findIndex(([i, j]) => i === s.i && j === s.j)
        expect(at).toBeGreaterThanOrEqual(0)
        expect(at).toBeLessThan(cells.length - 1)
        expect(s.room).toBe(d.from)
        expect(s.axis).toBe(d.axis)
        expect(s.x).toBe((s.i + 0.5) * CELL)
        expect(s.plate).toBe(false)
      }
    }
  })

  it('on or just off the main path, two to a map in different corridors, one of each kind', () => {
    for (const map of MAPS) {
      const path = mainPath(map)
      const traps = planTraps(map)
      for (const s of traps) {
        const d = map.doors[s.door]!
        expect(path.has(d.to) || path.has(d.from)).toBe(true)
      }
      if (traps.length === 2) {
        expect(traps[0]!.door).not.toBe(traps[1]!.door)
        expect(new Set(traps.map(t => t.kind)).size).toBe(2)
      }
    }
  })

  it('the gel plate sits one cell before its door, nozzles in both walls', () => {
    const map = MAPS.find(m => m.doors.some(d => corridorCells(m, d).length >= 3))!
    const d = map.doors.find(x => corridorCells(map, x).length >= 3)!
    const s = plateSpot(map, d.id)!
    const cells = corridorCells(map, d)
    expect([s.i, s.j]).toEqual(cells[cells.length - 2])
    expect(s.plate).toBe(true)
    expect(s.side).toBe(0)
  })
})

describe('damage', () => {
  it('an eighth of the starting bar, scaled like the machines\' damage', () => {
    expect(trapDamage(1)).toBe(TRAP_DMG)
    expect(TRAP_DMG / 100).toBeGreaterThanOrEqual(0.1)
    expect(TRAP_DMG / 100).toBeLessThanOrEqual(0.14)
    expect(trapDamage(8)).toBe(scaleDmg(TRAP_DMG, 8))
  })
})

describe('the flame jet', () => {
  it('cycles idle → warn → burn → cool', () => {
    expect(flameStage(0)).toBe('idle')
    expect(flameStage(FLAME_IDLE + 0.01)).toBe('warn')
    expect(flameStage(FLAME_IDLE + FLAME_WARN + 0.01)).toBe('burn')
    expect(flameStage(FLAME_IDLE + FLAME_WARN + FLAME_BURN + 0.01)).toBe('cool')
    expect(flameStage(FLAME_CYCLE + 0.01)).toBe('idle')
  })

  it('its sheet spans the corridor, a body deep', () => {
    const s = spot()
    expect(inFlame(s, 0, 1.2)).toBe(true)
    expect(inFlame(s, 0.6, -1.2)).toBe(true)
    expect(inFlame(s, 1.2, 0)).toBe(false)
    // An X corridor: along = world x, across = −(world z).
    expect(alongOf(s, 2, 5)).toBe(2)
    expect(acrossOf(s, 2, 5)).toBe(-5)
    expect(alongOf(spot({ axis: 'z' }), 2, 5)).toBe(5)
  })

  it('hurts only while it burns, unblockable, pushing along the corridor', () => {
    const { host, hits, sounds } = makeHost(0.2, 0.4)
    const sys = new TrapSystem(host, [spot()])
    step(sys, host, FLAME_IDLE + FLAME_WARN - 0.05)
    expect(hits).toHaveLength(0)
    expect(sounds).toContain('trapHiss')
    step(sys, host, 0.2)
    expect(hits.length).toBeGreaterThan(0)
    expect(sounds).toContain('flameJet')
    const h = hits[0]!
    expect(h.blockable).toBe(false)
    expect(h.dmg).toBe(trapDamage(1))
    // From the sheet's plane, level with Flux: the push is purely along X.
    expect(h.fromX).toBe(0)
    expect(h.fromZ).toBe(0.4)
  })

  it('leaves Flux alone outside the sheet, and when not in live play', () => {
    const out = makeHost(2.5, 0)
    const a = new TrapSystem(out.host, [spot()])
    step(a, out.host, FLAME_CYCLE)
    expect(out.hits).toHaveLength(0)
    const paused = makeHost(0, 0)
    const b = new TrapSystem(paused.host, [spot()])
    step(b, paused.host, FLAME_CYCLE, false, false)
    expect(paused.hits).toHaveLength(0)
  })

  it('parks in a fight: holds its idle, pilot dark, until the room is quiet', () => {
    const { host, hits } = makeHost(0, 0)
    const sys = new TrapSystem(host, [spot()])
    step(sys, host, 0.5)
    step(sys, host, 10, true)
    const s = sys.traps[0]!
    expect(s.stage).toBe('idle')
    expect(s.parked).toBe(true)
    expect(hits).toHaveLength(0)
    step(sys, host, FLAME_CYCLE)
    expect(s.parked).toBe(false)
    expect(hits.length).toBeGreaterThan(0)
  })

  it('a burst under way when a fight starts still finishes', () => {
    const { host } = makeHost(5, 0)
    const sys = new TrapSystem(host, [spot()])
    step(sys, host, FLAME_IDLE + FLAME_WARN + 0.1)
    expect(sys.traps[0]!.stage).toBe('burn')
    step(sys, host, 0.3, true)
    expect(sys.traps[0]!.stage).toBe('burn')
  })

  it('two traps from one map never pulse in step', () => {
    const map = MAPS.find(m => planTraps(m).filter(t => t.kind === 'flame').length > 0)!
    const phases = MAPS.flatMap(m => planTraps(m)).filter(t => t.kind === 'flame').map(t => t.phase)
    expect(new Set(phases.map(p => p.toFixed(3))).size).toBeGreaterThan(phases.length / 2)
    expect(map).toBeTruthy()
  })
})

describe('the swinging blade', () => {
  const blade = (over: Partial<TrapSpot> = {}) => spot({ kind: 'blade', side: 1, ...over })

  it('cuts where it is, not where it is not', () => {
    const s = blade()
    // Straight down: it is in the middle of the corridor.
    expect(bladeHits(s, 0, 0, 0)).toBe(true)
    // Swung out to one side: the other side is clear.
    const lat = BLADE_ARM * Math.sin(BLADE_AMP)
    expect(bladeHits(s, BLADE_AMP, 0, lat)).toBe(false) // local +X is world −Z
    expect(bladeHits(s, BLADE_AMP, 0, -lat)).toBe(true)
    expect(bladeHits(s, BLADE_AMP, 0, 0.85)).toBe(false)
    // A body's depth along the corridor, no more.
    expect(bladeHits(s, 0, 1, 0)).toBe(false)
  })

  it('swings wall to wall and back once a period, never through the walls', () => {
    expect(BLADE_ARM * Math.sin(BLADE_AMP) + 0.35).toBeLessThan(CELL / 2)
    expect(BLADE_ARM * Math.sin(BLADE_AMP)).toBeGreaterThan(0.8)
    const { host } = makeHost(50, 50)
    const sys = new TrapSystem(host, [blade()])
    let lo = 0
    let hi = 0
    for (let t = 0; t < BLADE_PERIOD; t += 1 / 60) {
      step(sys, host, 1 / 60)
      lo = Math.min(lo, sys.traps[0]!.angle)
      hi = Math.max(hi, sys.traps[0]!.angle)
    }
    expect(hi).toBeCloseTo(BLADE_AMP, 2)
    expect(lo).toBeCloseTo(-BLADE_AMP, 2)
  })

  it('a player standing in the middle is hit as it passes; a whoosh comes first', () => {
    const { host, hits, sounds } = makeHost(0, 0)
    const sys = new TrapSystem(host, [blade({ phase: BLADE_PERIOD / 4 })]) // starts at the top
    step(sys, host, BLADE_PERIOD / 4 + 0.05)
    expect(sounds).toContain('bladeWhoosh')
    expect(hits.length).toBeGreaterThan(0)
  })

  it('latches at the top of its swing in a fight and cuts nothing while latched', () => {
    const { host, hits } = makeHost(50, 50)
    const sys = new TrapSystem(host, [blade()])
    step(sys, host, 3, true)
    const s = sys.traps[0]!
    expect(s.parked).toBe(true)
    expect(Math.abs(s.angle)).toBeCloseTo(BLADE_AMP, 3)
    expect(s.speed).toBe(0)
    // Flux walks right into it: nothing.
    const lat = BLADE_ARM * Math.sin(s.angle)
    host.player.x = 0
    host.player.z = -lat
    step(sys, host, 2, true)
    expect(hits).toHaveLength(0)
    // The fight ends: it swings again.
    step(sys, host, 0.1)
    expect(s.parked).toBe(false)
    expect(Math.abs(s.speed)).toBeGreaterThan(0)
  })

  it('keeps swinging through a fight that does not reach it', () => {
    const { host } = makeHost(50, 50)
    const sys = new TrapSystem(host, [blade(), spot({ x: 40, z: 40 })])
    const reaches = (x: number, z: number) => Math.hypot(x - 40, z - 40) < 12
    for (let t = 0; t < 3; t += 1 / 60) {
      host.time += 1 / 60
      sys.update(1 / 60, { playing: true, combat: true, fightAt: reaches })
    }
    const [b, f] = sys.traps
    expect(b!.parked).toBe(false)
    expect(Math.abs(b!.speed)).toBeGreaterThan(0)
    expect(f!.parked).toBe(true)
  })
})

describe('the tutorial plate', () => {
  it('waits armed, bursts once when tripped, then stays dark; it never hurts by itself', () => {
    const { host, hits, sounds } = makeHost(0, 0)
    const sys = new TrapSystem(host, [spot({ plate: true })])
    step(sys, host, 10)
    expect(sys.plate!.stage).toBe('idle')
    expect(sys.trip()).toBe(true)
    expect(sounds).toEqual(expect.arrayContaining(['trapClick', 'flameJet']))
    expect(sys.plate!.stage).toBe('burn')
    step(sys, host, 3)
    expect(sys.plate!.stage).toBe('spent')
    expect(sys.trip()).toBe(false)
    // The mission sets the health itself (exactly a quarter).
    expect(hits).toHaveLength(0)
  })

  it('a resumed tutorial finds it spent', () => {
    const { host } = makeHost()
    const sys = new TrapSystem(host, [spot({ plate: true })])
    sys.spendPlate()
    expect(sys.trip()).toBe(false)
  })
})

describe('views and culling', () => {
  it('syncs every view each step; a trap whose room is not drawn stays silent', () => {
    const synced: TrapState[] = []
    const view: TrapView = { shown: false, sync: (s) => { synced.push(s) } }
    const { host, sounds } = makeHost(0, 0)
    const sys = new TrapSystem(host, [spot()], () => view)
    step(sys, host, FLAME_CYCLE)
    expect(synced.length).toBeGreaterThan(200)
    expect(sounds).toHaveLength(0)
  })

  it('and one far away stays silent too', () => {
    const { host, sounds } = makeHost(60, 0)
    const sys = new TrapSystem(host, [spot(), spot({ kind: 'blade', side: 1 })])
    step(sys, host, FLAME_CYCLE)
    expect(sounds).toHaveLength(0)
  })
})
