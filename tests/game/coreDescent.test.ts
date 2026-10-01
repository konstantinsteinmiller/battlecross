// The Core Descent (#109): Vex in three stages — the roof under lightning,
// the reactor hall, the Core ring — carried between them by a fall scene,
// with a retry point at each landing.

import { describe, expect, it, vi } from 'vitest'
import { CoreDescent, FALL_S, STAGE_AT, STRIKE_EVERY, RING_TEMPO, type DescentHost } from '@/game/sim/coreDescent'
import { generateVexFortress } from '@/game/world/stages/fortress'
import { CELL } from '@/game/world/levelGen'
import type { Enemy } from '@/game/sim/world'

const rig = () => {
  const map = generateVexFortress(3)
  const stages = map.terrain!.bossStages!
  const roof = map.rooms[stages[0]!]!
  const host = {
    player: { x: (roof.x0 + 3.5) * CELL, y: 0, z: (roof.z0 + 5) * CELL, px: 0, pz: 0, py: 0, safeY: 0, yaw: 0, vx: 0, vz: 0, vy: 0 },
    combat: { maxHp: 100 },
    rooms: map.rooms,
    markers: { spawn: vi.fn() },
    shocks: { spawn: vi.fn() },
    fx: { sparks: vi.fn() },
    setBossRoom: vi.fn(),
    keepRetryPoint: vi.fn(),
    stageDark: vi.fn(),
    skyFlash: vi.fn(),
    say: vi.fn(),
    sfx: vi.fn(),
    shake: vi.fn(),
    hitPlayer: vi.fn(() => 'hit'),
    hurtMachines: vi.fn()
  }
  const boss = { x: 0, z: 0, px: 0, pz: 0, hp: 1000, maxHp: 1000, state: 'engage', st: 0, tempo: 1, phase2: false, def: { fly: 1.6 } } as unknown as Enemy
  const d = new CoreDescent(host as unknown as DescentHost, stages)
  return { map, stages, host, boss, d }
}

const run = (r: ReturnType<typeof rig>, seconds: number) => {
  for (let t = 0; t < seconds; t += 1 / 30) r.d.update(1 / 30, r.boss, true, true)
}

describe('the Core Descent', () => {
  it('the roof storms: gloom, Atlas\'s warning, and a strike on a ring near Flux', () => {
    const r = rig()
    run(r, STRIKE_EVERY + 1.5)
    expect(r.host.stageDark).toHaveBeenCalled()
    expect(r.host.say).toHaveBeenCalledWith('hint.vex.roof')
    expect(r.host.markers.spawn).toHaveBeenCalled()
    const [x, z] = r.host.markers.spawn.mock.calls[0]!
    expect(Math.hypot(x - r.host.player.x, z - r.host.player.z)).toBeLessThan(1.3)
    expect(r.host.skyFlash).toHaveBeenCalled()
  })

  it(`at ${STAGE_AT[0] * 100} % the roof gives way: a fall, then the reactor hall, Vex re-enters and a retry point is kept`, () => {
    const r = rig()
    r.boss.hp = r.boss.maxHp * STAGE_AT[0] - 1
    run(r, 0.1)
    expect(r.d.falling).toBe(true)
    expect(r.boss.state).toBe('idle')
    expect(r.host.say).toHaveBeenCalledWith('hint.vex.fall')
    run(r, FALL_S)
    expect(r.d.falling).toBe(false)
    expect(r.d.stage).toBe(1)
    const hall = r.map.rooms[r.stages[1]!]!
    expect(r.host.setBossRoom).toHaveBeenCalledWith(hall)
    const p = r.host.player
    expect(Math.floor(p.x / CELL)).toBeGreaterThanOrEqual(hall.x0)
    expect(Math.floor(p.x / CELL)).toBeLessThan(hall.x0 + hall.w)
    expect(Math.floor(p.z / CELL)).toBeGreaterThanOrEqual(hall.z0)
    expect(r.boss.state).toBe('alert')
    expect(r.host.keepRetryPoint).toHaveBeenCalledTimes(1)
  })

  it(`at ${STAGE_AT[1] * 100} % it ends on the Core ring, Vex over the Core and quicker`, () => {
    const r = rig()
    r.boss.hp = r.boss.maxHp * STAGE_AT[0] - 1
    run(r, FALL_S + 0.2)
    r.boss.state = 'engage'
    r.boss.hp = r.boss.maxHp * STAGE_AT[1] - 1
    run(r, FALL_S + 0.2)
    expect(r.d.stage).toBe(2)
    const ring = r.map.rooms[r.stages[2]!]!
    expect(r.boss.z).toBeCloseTo((ring.z0 + ring.h / 2) * CELL)
    expect(r.boss.tempo).toBeCloseTo(RING_TEMPO)
    expect(r.host.say).toHaveBeenCalledWith('hint.vex.core')
    // No storm off the roof.
    r.host.markers.spawn.mockClear()
    r.boss.state = 'engage'
    run(r, STRIKE_EVERY * 2)
    expect(r.host.markers.spawn).not.toHaveBeenCalled()
  })

  it('a retry or a reload lands straight in the stage it was in, at the health it had', () => {
    const r = rig()
    r.d.restore(r.boss, 2, 222)
    expect(r.d.stage).toBe(2)
    expect(r.boss.hp).toBe(222)
    expect(r.boss.phase2).toBe(true)
  })
})
