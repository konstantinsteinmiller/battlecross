import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { applyPlan, populateZone } from '@/game/sim/director'
import { stepPlates } from '@/game/sim/interact'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import { generateZone } from '@/game/sim/zoneGen'
import { ZONES } from '@/game/data/zones'
import { CELL } from '@/game/sim/grid'
import { K_BLOCK } from '@/game/sim/zoneFeatures'

/** The tutorial's three-plate puzzle (roadmap #136): in the first clearing, every layout. */
const SEEDS = [...Array.from({ length: 38 }, (_, k) => k + 1), 1234, 99991]

describe('the tutorial plate puzzle', () => {
  it('every layout has three plates, a stone and a hidden gold chest, by the first fight clearing', () => {
    for (const seed of SEEDS) {
      const plan = generateZone(ZONES.plains, seed, { tutorial: true })
      expect(plan.plates.length, `#${seed}`).toBe(3)
      expect(plan.puzzle, `#${seed}`).not.toBeNull()
      expect(plan.puzzle!.order.slice().sort(), `#${seed}`).toEqual(plan.plates.map(p => p.id).sort())
      const c = plan.chests.find(x => x.role === 'puzzle')!
      expect(c.door, `#${seed}`).toBe(plan.puzzle!.door)
      const fight = plan.packs[0]!
      for (const p of plan.plates) expect(Math.hypot(p.x - fight.x, p.z - fight.z), `#${seed}`).toBeLessThan(fight.r + 2)
    }
  })

  it('lies north of the start, out of sight of the first screens, on free ground and reachable on foot', () => {
    for (const seed of SEEDS) {
      const plan = generateZone(ZONES.plains, seed, { tutorial: true })
      const spots = [...plan.plates, plan.puzzle!.hint, ...plan.chests.filter(c => c.role === 'puzzle')]
      for (const p of spots) {
        // North is -z; the start's view reaches about nine metres up.
        expect(p.z, `#${seed}`).toBeLessThan(plan.start.z - 11)
        expect(Math.hypot(p.x - plan.start.x, p.z - plan.start.z), `#${seed}`).toBeGreaterThan(13.9)
      }
      // The plates are walked on: open ground, joined to the start by open ground.
      const seen = new Uint8Array(plan.w * plan.h)
      const at = (x: number, z: number): number => Math.floor(z / CELL) * plan.w + Math.floor(x / CELL)
      const queue = [at(plan.start.x, plan.start.z)]
      seen[queue[0]!] = 1
      for (let q = 0; q < queue.length; q++) {
        const k = queue[q]!
        for (const n of [k - 1, k + 1, k - plan.w, k + plan.w]) {
          if (n < 0 || n >= seen.length || seen[n] || plan.solid[n] || plan.sealed[n]) continue
          if (plan.kind[n] === K_BLOCK) continue
          seen[n] = 1
          queue.push(n)
        }
      }
      for (const p of plan.plates) {
        expect(plan.solid[at(p.x, p.z)], `#${seed}`).toBe(0)
        expect(seen[at(p.x, p.z)], `#${seed} plate reachable`).toBe(1)
      }
    }
  })

  it('is deterministic per seed', () => {
    const a = generateZone(ZONES.plains, 5, { tutorial: true })
    const b = generateZone(ZONES.plains, 5, { tutorial: true })
    expect(b.puzzle).toEqual(a.puzzle)
    expect(b.plates).toEqual(a.plates)
  })
})

describe('the tutorial puzzle, played', () => {
  it('stepping the plates in order opens its door; the fight and chest never wait on it', () => {
    const plan = generateZone(ZONES.plains, 7, { tutorial: true })
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    populateZone(sim, plan, 'plains', [])
    const open = (): boolean => sim.doors.every(d => d.open)
    expect(open()).toBe(false)
    for (const id of sim.puzzle!.order) {
      const p = sim.plates.find(x => x.id === id)!
      sim.hero.unit.x = p.x
      sim.hero.unit.z = p.z
      stepPlates(sim)
    }
    expect(sim.puzzle!.solved).toBe(true)
    expect(open()).toBe(true)
  })
})
