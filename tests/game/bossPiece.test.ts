import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import { spawnEnemy } from '@/game/sim/spawn'
import { populateHerbs, stepPickups, stepPieceDrop } from '@/game/sim/herbs'
import { KEY_DROP_T } from '@/game/sim/camp'

/**
 * #203: the Goblin King carries the Hollows' scrap of the treasure map. It is
 * nowhere on the ground; when the finale is won it falls where he lay, like
 * the first boss's cage key, and is the hero's once it has landed.
 */

const scene = (zone: 'hollows' | 'plains' = 'hollows') => {
  const sim = new Sim({ seed: 5, w: 40, h: 40, level: 4, difficulty: 1, mode: 'zone', zone })
  createHero(sim, { build: { level: 4, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: 10, z: 10, xpInto: 0, potions: 1 })
  const king = spawnEnemy(sim, 'goblinKing', 25, 25, 0)!
  sim.groups.push({ id: 0, x: 25, z: 25, members: [king.id], awake: true, cleared: false, finale: true, boss: 'goblinKing', optional: false } as never)
  return { sim, king }
}

describe('a boss\'s scrap of the treasure map', () => {
  it('the Hollows piece is the boss\'s: it waits (not on the ground) until the finale is won', () => {
    const { sim } = scene()
    populateHerbs(sim, [], [{ id: 'hollows1', x: 10, z: 10 }])
    expect(sim.pieces[0]!.drop).toBe(-1)
    // Standing right on its planned spot, nothing is picked up.
    stepPieceDrop(sim, 0.1)
    stepPickups(sim)
    expect(sim.pieces[0]!.taken).toBe(false)
    expect(sim.pieces[0]!.drop).toBe(-1)
  })

  it('other zones\' pieces lie on the ground as before', () => {
    const { sim } = scene('plains')
    populateHerbs(sim, [], [{ id: 'plains1', x: 10, z: 10 }])
    expect(sim.pieces[0]!.drop).toBeUndefined()
    stepPickups(sim)
    expect(sim.pieces[0]!.taken).toBe(true)
  })

  it('won: it falls where the King lay, and is picked up only after it has landed', () => {
    const { sim, king } = scene()
    populateHerbs(sim, [], [{ id: 'hollows1', x: 5, z: 5 }])
    king.alive = false
    king.x = 25
    king.z = 25
    sim.ended = 'victory'
    const events: string[] = []
    sim.emit = ((e: { t: string }) => { events.push(e.t) }) as never
    stepPieceDrop(sim, 0.016)
    const p = sim.pieces[0]!
    expect(events).toContain('pieceDrop')
    expect(Math.hypot(p.x - 25, p.z - 25)).toBeLessThan(5)
    expect(p.drop).toBe(0)
    // The hero walks to it while it is still in the air: not yet his.
    sim.hero.unit.x = p.x
    sim.hero.unit.z = p.z
    stepPickups(sim)
    expect(p.taken).toBe(false)
    // Landed.
    stepPieceDrop(sim, KEY_DROP_T + 0.1)
    expect(p.drop).toBe(KEY_DROP_T)
    stepPickups(sim)
    expect(p.taken).toBe(true)
    expect(sim.hero.pieces).toContain('hollows1')
    expect(events).toContain('piece')
  })

  it('a piece already found on an earlier visit is not laid again', () => {
    const { sim } = scene()
    populateHerbs(sim, [], [])
    expect(sim.pieces).toHaveLength(0)
  })
})
