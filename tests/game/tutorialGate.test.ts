import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { generateZone } from '@/game/sim/zoneGen'
import { applyPlan, populateZone } from '@/game/sim/director'
import { botThink, referenceBuild } from '@/game/sim/bot'
import { OPENING, ZONES } from '@/game/data/zones'
import { isSolidAt } from '@/game/sim/grid'
import { gateGoal } from '@/game/sim/gate'
import type { SimEvent } from '@/game/sim/types'

/**
 * The first level's palisade gate (#194): the pack before the boss is four; its last member to fall lets a silver key drop;
 * a small wooden palisade across the road keeps the boss's floor (the cage, the cart) shut until the key opens it, so a new
 * player cannot walk north into the boss and the two packs never meet.
 */

const start = (seed: number): { sim: Sim; plan: ReturnType<typeof generateZone> } => {
  const plan = generateZone(ZONES.plains, seed, { tutorial: true, openingPack: OPENING.pack })
  const ref = referenceBuild({ cls: 'aegis', level: 12 })
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, 'plains', [])
  sim.hero.unit.s.maxHp = sim.hero.unit.hp = 1e6
  return { sim, plan }
}

describe('the first level: four before the boss, and a palisade gate', () => {
  it('the second pack is four, and a palisade door is cut across the road before the boss', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 23, 42, 99, 123, 777]) {
      const plan = generateZone(ZONES.plains, seed, { tutorial: true, openingPack: OPENING.pack })
      expect(OPENING.pack).toBe(4)
      expect(plan.packs[0]!.kinds).toHaveLength(2)
      expect(plan.packs[1]!.kinds).toHaveLength(4)
      expect(plan.gate, `seed ${seed}`).toBeTruthy()
      const door = plan.doors.find(d => d.id === plan.gate!.door)!
      expect(door.style).toBe('palisade')
      expect(plan.gate!.pack).toBe(1)
      // The gate stands between the pack and the boss: shut, no walker gets from one to the other.
      const { sim } = start(seed)
      const g = sim.grid
      const from = plan.packs[1]!
      const boss = plan.packs[2]!
      const seen = new Set<number>()
      const key = (x: number, z: number): number => Math.floor(z / 1.5) * g.w + Math.floor(x / 1.5)
      const stack = [key(from.x, from.z)]
      seen.add(stack[0]!)
      while (stack.length) {
        const k = stack.pop()!
        const i = k % g.w
        const j = (k - i) / g.w
        for (let dj = -1; dj <= 1; dj++) {
          for (let di = -1; di <= 1; di++) {
            const ni = i + di
            const nj = j + dj
            if ((!di && !dj) || ni < 0 || nj < 0 || ni >= g.w || nj >= g.h) continue
            const n = nj * g.w + ni
            if (seen.has(n) || isSolidAt(g, (ni + 0.5) * 1.5, (nj + 0.5) * 1.5)) continue
            // The walkers cut no corners: a diagonal step needs both of its sides open.
            if (di && dj && (isSolidAt(g, (ni + 0.5) * 1.5, (j + 0.5) * 1.5) || isSolidAt(g, (i + 0.5) * 1.5, (nj + 0.5) * 1.5))) continue
            seen.add(n)
            stack.push(n)
          }
        }
      }
      expect(seen.has(key(boss.x, boss.z)), `seed ${seed}: the boss is walled off`).toBe(false)
    }
  })

  it('the pack falls, its last member drops a silver key, the key opens the gate, and the boss floor is reached', () => {
    const { sim, plan } = start(5)
    const seen: SimEvent[] = []
    let think = 0
    expect(gateGoal(sim)).toBeNull()
    while (!sim.ended && sim.time < 400) {
      think -= 1 / 30
      if (think <= 0) { think = 0.2; botThink(sim) }
      stepSim(sim, plan, 1 / 30)
      seen.push(...sim.events)
      sim.events.length = 0
    }
    expect(sim.ended).toBe('victory')
    const drop = seen.findIndex(e => e.t === 'cageKeyDrop' && e.gate)
    const take = seen.findIndex(e => e.t === 'cageKey' && e.gate)
    const open = seen.findIndex(e => e.t === 'door')
    expect(drop).toBeGreaterThanOrEqual(0)
    expect(take).toBeGreaterThan(drop)
    expect(open).toBeGreaterThan(take)
    expect(sim.gate!.opened).toBe(true)
  })

  it('the key does not drop while one of the four stands', () => {
    const { sim, plan } = start(5)
    const grp = sim.groups[plan.gate!.pack]!
    const alive = sim.units.filter(u => u.group === grp.id)
    expect(alive).toHaveLength(4)
    for (let i = 0; i < 30; i++) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
    expect(sim.gate!.key.drop).toBe(-1)
  })
})
