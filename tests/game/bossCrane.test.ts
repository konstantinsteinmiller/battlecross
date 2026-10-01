// The Scrapper's magnet crane (#108): asleep for the first half of the fight,
// then a crate on a telegraph every few seconds near Flux; crates that land
// stay as soft cover (at most two: the oldest is lifted away), and one landing
// on the Scrapper hurts him.

import { describe, expect, it, vi } from 'vitest'
import { Group } from 'three'
import { BossCrane, CRANE_EVERY, CRANE_MAX, BOSS_COST, type CraneHost } from '@/game/sim/bossCrane'
import { createNav } from '@/game/world/nav'
import { generateMap } from '@/game/world/levelGen'
import { THEMES } from '@/game/world/themes'
import { bossRoomOf } from '@/game/sim/bosses'
import type { Enemy } from '@/game/sim/world'

const rig = () => {
  const map = generateMap({ seed: 7, rooms: 8, boss: true })
  const room = bossRoomOf(map.rooms)!
  const crates: Array<Record<string, unknown>> = []
  const host = {
    nav: createNav(map),
    theme: THEMES.scrapyard,
    player: { x: (room.x0 + 2) * 3, y: 0, z: (room.z0 + 2) * 3 },
    markers: { spawn: vi.fn() },
    shocks: { spawn: vi.fn() },
    fx: { sparks: vi.fn() },
    sfx: vi.fn(),
    shake: vi.fn(),
    hitPlayer: vi.fn(() => 'hit'),
    hurtMachines: vi.fn(),
    combat: { maxHp: 100 },
    addArenaCrate: vi.fn((x: number, z: number) => { const c = { x, z, broken: false }; crates.push(c); return c as never }),
    liftCrate: vi.fn((c: { broken: boolean }) => { c.broken = true }),
    hurtBoss: vi.fn(),
    propParent: () => new Group()
  }
  const crane = new BossCrane(host as unknown as CraneHost, room)
  // The boss far from Flux, in the opposite corner.
  const boss = { x: (room.x0 + room.w - 2) * 3, z: (room.z0 + room.h - 2) * 3, state: 'engage', def: { hitR: 1 } } as unknown as Enemy
  return { crane, host, crates, boss, room }
}

const run = (r: ReturnType<typeof rig>, seconds: number, live = true) => {
  for (let t = 0; t < seconds; t += 0.05) r.crane.update(0.05, r.boss, live, true)
}

describe('the magnet crane', () => {
  it('sleeps while the Scrapper is above half health', () => {
    const r = rig()
    run(r, 30, false)
    expect(r.host.markers.spawn).not.toHaveBeenCalled()
    expect(r.crates).toHaveLength(0)
  })

  it('drops a crate on a ring near Flux, which then stands as cover', () => {
    const r = rig()
    run(r, CRANE_EVERY * 0.5 + 0.2)
    run(r, 1.2)
    expect(r.host.markers.spawn).toHaveBeenCalledTimes(1)
    const [mx, mz] = r.host.markers.spawn.mock.calls[0]!
    expect(Math.hypot(mx - r.host.player.x, mz - r.host.player.z)).toBeLessThan(1.6)
    run(r, 2)
    expect(r.crates).toHaveLength(1)
    expect(r.crates[0]).toMatchObject({ soft: true, crane: true, arena: true, hp: 1 })
    expect(r.crane.standing).toHaveLength(1)
  })

  it(`keeps at most ${CRANE_MAX} standing: the oldest is lifted away`, () => {
    const r = rig()
    run(r, CRANE_EVERY * 0.5 + CRANE_EVERY * (CRANE_MAX + 1) + 4)
    expect(r.host.liftCrate).toHaveBeenCalled()
    expect(r.crane.standing.length).toBeLessThanOrEqual(CRANE_MAX)
  })

  it('a crate landing on the Scrapper hurts him instead of standing', () => {
    const r = rig()
    // The boss right where Flux is: the crate is aimed there.
    ;(r.boss as { x: number }).x = r.host.player.x
    ;(r.boss as { z: number }).z = r.host.player.z
    run(r, CRANE_EVERY * 0.5 + 4)
    expect(r.host.hurtBoss).toHaveBeenCalledWith(r.boss, BOSS_COST, expect.any(Number), expect.any(Number))
    expect(r.crates).toHaveLength(0)
  })
})
