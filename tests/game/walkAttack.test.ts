import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero, setStick } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'
import type { Unit } from '@/game/sim/types'

/** VITE_APP_WALK_ATTACK: the hero swings on the run; off, a swing is dropped the moment he moves. */

const plan = generateArena(7)
const scene = (walkAttack: boolean): { sim: Sim; foe: Unit } => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: 'hollows' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 5, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
  })
  sim.walkAttack = walkAttack
  const h = sim.hero.unit
  h.hp = h.s.maxHp = 1e6
  const foe = spawnEnemy(sim, 'goblin', h.x + 1.6, h.z)!
  foe.awake = true
  foe.s.baseDmg = 0
  foe.s.maxHp = foe.hp = 1e6
  foe.rooted = true
  return { sim, foe }
}
const run = (sim: Sim, secs: number, stick: [number, number]): void => {
  for (let t = 0; t < secs; t += 1 / 30) {
    setStick(sim, stick[0], stick[1])
    stepSim(sim, plan, 1 / 30)
    sim.events.length = 0
  }
}

describe('the swing on the run', () => {
  it('on: running past a foe in reach swings at it, the legs keep running, the chest faces it', () => {
    const { sim, foe } = scene(true)
    const h = sim.hero.unit
    const x0 = h.x
    let swung = 0
    let chestOnFoe = 0
    for (let t = 0; t < 2; t += 1 / 30) {
      setStick(sim, 0, 1)
      stepSim(sim, plan, 1 / 30)
      if (h.action?.id === 'attack') {
        swung++
        // The heading is the stick's (+Z); the chest points at the foe (+X of the hero).
        expect(Math.abs(h.facing)).toBeLessThan(0.5)
        if (Math.abs(h.aim - Math.atan2(foe.x - h.x, foe.z - h.z)) < 0.2) chestOnFoe++
        expect(h.walkAtk).toBe(true)
        expect(h.anim).toBe('walk')
      }
      sim.events.length = 0
    }
    expect(swung).toBeGreaterThan(3)
    expect(chestOnFoe).toBe(swung)
    // He ran on (the foe stands still beside his track) and the foe was hit.
    expect(Math.hypot(h.x - x0, h.z - plan.start.z)).toBeGreaterThan(2)
    expect(foe.hp).toBeLessThan(1e6)
  })

  it('the red-marked foe is the one he faces, even when another stands nearer', () => {
    const { sim, foe } = scene(true)
    const h = sim.hero.unit
    const near = spawnEnemy(sim, 'goblin', h.x + 0.6, h.z + 1.2)!
    near.awake = true; near.rooted = true; near.s.baseDmg = 0; near.s.maxHp = near.hp = 1e6
    h.targetId = foe.id
    sim.hero.order.targetId = foe.id
    run(sim, 0.3, [0, 0.01])
    for (let t = 0; t < 1; t += 1 / 30) {
      setStick(sim, 0, 1)
      h.targetId = foe.id
      stepSim(sim, plan, 1 / 30)
      if (h.action?.id === 'attack') expect(h.action.targetId).toBe(foe.id)
      sim.events.length = 0
    }
  })

  it('out of reach, he just runs: no swing, the chest follows the legs', () => {
    const { sim } = scene(true)
    const h = sim.hero.unit
    run(sim, 3, [0, -1])
    expect(h.action).toBeNull()
    expect(h.walkAtk).toBe(false)
    expect(h.aim).toBeCloseTo(h.facing, 3)
  })

  it('off: running drops the swing, as before', () => {
    const { sim, foe } = scene(false)
    run(sim, 2, [0, 1])
    expect(foe.hp).toBe(1e6)
    expect(sim.hero.unit.walkAtk).toBe(false)
  })
})
