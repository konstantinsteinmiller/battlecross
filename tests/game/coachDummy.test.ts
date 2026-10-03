import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { dealDamage } from '@/game/sim/combat'
import { applyPlan, populateZone } from '@/game/sim/director'
import { generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { CELL } from '@/game/sim/grid'
import { ZONES } from '@/game/data/zones'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import { DUMMY_KIND, dummyBeat, dummyOf, dummyPurse, spawnDummy, stepDummy } from '@/game/coach/dummy'

/**
 * The opening beat of a new save (roadmap #52): a straw training dummy by the
 * road of the first visit, to learn to walk and hit on before the goblins.
 * Where it stands, that it never fights back or wakes the pack, and that it
 * pays its token purse exactly once.
 */

// Forty layouts: every one must have a spot for it.
const SEEDS = [...Array.from({ length: 38 }, (_, k) => k + 1), 1234, 99991]

const visit = (seed = 7): { sim: Sim; plan: ZonePlan } => {
  const plan = generateZone(ZONES.plains, seed, { tutorial: true })
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, 'plains', [])
  spawnDummy(sim, plan)
  return { sim, plan }
}

describe('the training dummy: where it stands', () => {
  it('only the first visit of a new save has one', () => {
    for (const seed of SEEDS) {
      expect(generateZone(ZONES.plains, seed).dummy, `#${seed}`).toBeUndefined()
      expect(generateZone(ZONES.plains, seed, { tutorial: true }).dummy, `#${seed}`).toBeDefined()
    }
  })

  it('stands in the opening clearing, on open ground, clear of the chest and well out of the first pack\'s sight', () => {
    for (const seed of SEEDS) {
      const plan = generateZone(ZONES.plains, seed, { tutorial: true })
      const d = plan.dummy!
      const start = plan.clearings[0]!
      expect(Math.hypot(d.x - start.x, d.z - start.z), `#${seed} in the clearing`).toBeLessThan(start.r + CELL)
      expect(Math.hypot(d.x - start.x, d.z - start.z), `#${seed} not on the hero`).toBeGreaterThan(3.2)
      const i = Math.floor(d.x / CELL)
      const j = Math.floor(d.z / CELL)
      expect(plan.solid[j * plan.w + i], `#${seed} open`).toBe(0)
      for (const c of plan.chests) expect(Math.hypot(c.x - d.x, c.z - d.z), `#${seed} chest`).toBeGreaterThanOrEqual(2.6)
      // A goblin of the pack, standing at the pack's edge, does not see a hero beside the dummy.
      const pack = plan.packs[0]!
      const reach = Math.max(...pack.kinds.map(k => ENEMY_BY_ID[k]!.aggro))
      expect(Math.hypot(pack.x - d.x, pack.z - d.z) - 3.8 - 1.2, `#${seed} pack`).toBeGreaterThan(reach)
    }
  })

  it('the packs are the same with or without it (the fight is untouched)', () => {
    for (const seed of SEEDS) {
      const a = generateZone(ZONES.plains, seed, { tutorial: true })
      const b = generateZone(ZONES.plains, seed, { tutorial: true })
      expect(a.packs).toEqual(b.packs)
      expect(a.dummy).toEqual(b.dummy)
    }
  })
})

describe('the training dummy: how it behaves', () => {
  it('is an enemy to pick and hit, but it never wakes, moves or fights back', () => {
    const { sim } = visit()
    const d = dummyOf(sim)!
    expect(d.kind).toBe(DUMMY_KIND)
    expect(d.team).toBe(1)
    const x = d.x
    const z = d.z
    // A blow wakes a struck enemy, and a knock-back pushes it: not this one.
    dealDamage(sim, sim.hero.unit, d, 1, { type: 'physical', canCrit: false })
    d.x += 1.2
    expect(stepDummy(sim)).toBeNull()
    expect(d.awake).toBe(false)
    expect([d.x, d.z]).toEqual([x, z])
    expect(dummyBeat(sim)).toBe('on')
  })

  it('takes a few plain swings (not one, not ten), and pays its little purse exactly once', () => {
    const { sim } = visit()
    const d = dummyOf(sim)!
    const hero = sim.hero
    const gold0 = hero.gold
    let swings = 0
    while (d.alive && swings < 20) {
      dealDamage(sim, hero.unit, d, hero.unit.s.baseDmg, { type: 'physical', canCrit: false })
      swings++
    }
    expect(swings).toBeGreaterThanOrEqual(3)
    expect(swings).toBeLessThanOrEqual(5)
    sim.events.length = 0
    expect(stepDummy(sim)).toBe('fell')
    expect(hero.gold - gold0).toBe(dummyPurse(sim.level))
    expect(sim.events.filter(e => e.t === 'loot')).toHaveLength(1)
    // No kill is counted (a new save stays new) and nothing is paid twice.
    expect(hero.kills).toBe(0)
    expect(stepDummy(sim)).toBeNull()
    expect(hero.gold - gold0).toBe(dummyPurse(sim.level))
  })

  it('walking past it to the pack ends the beat without it', () => {
    const { sim } = visit()
    sim.groups[0]!.awake = true
    expect(stepDummy(sim)).toBe('passed')
    expect(dummyBeat(sim)).toBe('passed')
    expect(dummyOf(sim)).not.toBeNull()
  })

  it('a visit without one has no beat at all', () => {
    const plan = generateZone(ZONES.plains, 7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    expect(spawnDummy(sim, plan)).toBeNull()
    expect(dummyBeat(sim)).toBeNull()
    expect(stepDummy(sim)).toBeNull()
  })
})
