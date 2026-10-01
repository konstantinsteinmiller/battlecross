// Things that fall on a telegraph (`sim/drops.ts`): the icicles' ring-then-
// fall rhythm, usable in an arena (the Scrapper's crane, the Fortress roof's
// lightning).

import { describe, expect, it, vi } from 'vitest'
import { Drops, type DropHost, type DropSpec } from '@/game/sim/drops'

const host = () => {
  const h = {
    markers: { spawn: vi.fn() },
    shocks: { spawn: vi.fn() },
    fx: { sparks: vi.fn() },
    sfx: vi.fn(),
    shake: vi.fn(),
    hitPlayer: vi.fn(() => 'hit'),
    hurtMachines: vi.fn(),
    combat: { maxHp: 200 }
  }
  return h as typeof h & DropHost
}

const spec = (o: Partial<DropSpec> = {}): DropSpec =>
  ({ x: 0, z: 0, y: 0, warn: 1.4, fall: 0.4, height: 6, reach: 1, cost: 0.1, ...o })

const run = (d: Drops, seconds: number, p = { x: 0, y: 0, z: 0 }, playing = true) => {
  for (let t = 0; t < seconds; t += 0.05) d.update(0.05, p, playing)
}

describe('Drops', () => {
  it('opens the ring at once, for the warning and the fall together', () => {
    const h = host()
    new Drops(h).drop(spec({ sound: 'creak' }))
    expect(h.markers.spawn).toHaveBeenCalledWith(0, 0, 1.25, expect.closeTo(1.8, 6))
    expect(h.sfx).toHaveBeenCalledWith('creak', 0, 0)
  })

  it('hurts Flux under it by its share of his health, not blockable, only once it lands', () => {
    const h = host()
    const d = new Drops(h)
    d.drop(spec())
    run(d, 1.7)
    expect(h.hitPlayer).not.toHaveBeenCalled()
    run(d, 0.2)
    expect(h.hitPlayer).toHaveBeenCalledTimes(1)
    expect(h.hitPlayer).toHaveBeenCalledWith(null, 20, expect.objectContaining({ blockable: false, kind: 'aoe' }))
    expect(d.count).toBe(0)
  })

  it('misses Flux out of reach, or on another floor, and tells onLand so', () => {
    const h = host()
    const landed: boolean[] = []
    const d = new Drops(h)
    d.drop(spec({ onLand: (_s, hit) => landed.push(hit) }))
    run(d, 2, { x: 3, y: 0, z: 0 })
    d.drop(spec({ onLand: (_s, hit) => landed.push(hit) }))
    run(d, 2, { x: 0, y: 3, z: 0 })
    expect(h.hitPlayer).not.toHaveBeenCalled()
    expect(landed).toEqual([false, false])
  })

  it('falls the mesh from its height, accelerating, and leaves it on the floor', () => {
    const h = host()
    const pos = { set: vi.fn() }
    const d = new Drops(h)
    d.drop(spec({ mesh: { position: pos } as never }))
    run(d, 1.6)
    const yEarly = pos.set.mock.calls.at(-1)![1]
    run(d, 0.1)
    const yLater = pos.set.mock.calls.at(-1)![1]
    expect(yLater).toBeLessThan(yEarly)
    run(d, 0.5)
    expect(pos.set.mock.calls.at(-1)![1]).toBe(0)
  })

  it('a harmless drop (cost 0) hurts nobody', () => {
    const h = host()
    const d = new Drops(h)
    d.drop(spec({ cost: 0 }))
    run(d, 2)
    expect(h.hitPlayer).not.toHaveBeenCalled()
    expect(h.hurtMachines).not.toHaveBeenCalled()
  })
})
