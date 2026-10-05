import { describe, expect, it } from 'vitest'
import { runZone } from '@/game/sim/bot'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'

/**
 * A necromancer keeps at most four raised skeletons alive (D88): a pack of
 * them used to raise the dead faster than an Aegis-only hero could cut them
 * down, and the Dread Fortress never ended.
 */

describe('the necromancer\'s raised dead (D88)', () => {
  it('never has more than four of its skeletons up at once', () => {
    const plan = generateArena(7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 20, difficulty: 1, mode: 'zone', zone: 'tundra' })
    applyPlan(sim, plan)
    createHero(sim, {
      build: { level: 20, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
      skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
    })
    const h = sim.hero.unit
    h.s.maxHp = h.hp = 1e7
    const n = spawnEnemy(sim, 'necromancer', h.x, h.z - 8)!
    n.awake = true
    n.targetId = h.id
    let most = 0
    for (let t = 0; t < 60; t += 1 / 30) {
      stepSim(sim, plan, 1 / 30)
      sim.events.length = 0
      most = Math.max(most, sim.units.filter(u => u.alive && u.ownerId === n.id).length)
    }
    expect(most).toBeGreaterThan(0)
    expect(most).toBeLessThanOrEqual(4)
  })

  it('an Aegis-only hero gets through the Dread Fortress again (slowly: about eight minutes)', () => {
    const r = runZone({ zone: 'fortress', level: 27, cls: 'aegis', seed: 77, maxSeconds: 600 })
    expect(r.outcome).toBe('victory')
  }, 120000)
})
