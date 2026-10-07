import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy, spawnMinion } from '@/game/sim/spawn'
import { applyStatus, dealDamage, kill } from '@/game/sim/combat'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'
import { HEAT_MAX, SKILL_BY_ID } from '@/game/data/skills'
import type { HeroBuild } from '@/game/sim/stats'
import type { Unit } from '@/game/sim/types'

/**
 * The passives the classes' second six brought (#95), each a new modifier:
 * Adrenal Catalyst, Crumble, Thermal Plating, Unbreakable, Wildfire, Loyal Hearts.
 */

const build = (passives: string[]): HeroBuild => ({ level: 30, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives })
const field = (passives: string[] = []): Sim => {
  const plan = generateArena(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 30, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: build(passives), skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  return sim
}
const foe = (sim: Sim, dx = 2): Unit => {
  const u = sim.hero.unit
  const e = spawnEnemy(sim, 'goblin', u.x + dx, u.z)!
  e.awake = true
  e.s.maxHp *= 100
  e.hp = e.s.maxHp
  return e
}
const hit = (sim: Sim, from: Unit | null, to: Unit, type: 'true' | 'physical' = 'true'): number => { to.hp = to.s.maxHp; return dealDamage(sim, from, to, 100, { type, canCrit: false }) }
// (True damage skips every defence: a defence is measured with a physical blow.)

describe('the second six\'s passives (#95)', () => {
  it('Adrenal Catalyst: the lower her health, the harder she hits', () => {
    const plain = field()
    const sim = field(['adrenalCatalyst'])
    const a = foe(plain)
    const b = foe(sim)
    expect(hit(sim, sim.hero.unit, b)).toBeCloseTo(hit(plain, plain.hero.unit, a), 3)
    sim.hero.unit.hp = sim.hero.unit.s.maxHp * 0.2
    expect(hit(sim, sim.hero.unit, b)).toBeGreaterThan(hit(plain, plain.hero.unit, a))
  })

  it('Crumble: more damage to the slowed, the knocked down, the petrified', () => {
    const sim = field(['crumble'])
    const e = foe(sim)
    const base = hit(sim, sim.hero.unit, e)
    applyStatus(sim, e, 'slow', 5, 0.3, sim.hero.unit)
    expect(hit(sim, sim.hero.unit, e)).toBeGreaterThan(base)
  })

  it('Thermal Plating: a hot suit takes less', () => {
    const sim = field(['thermalPlating'])
    const e = foe(sim)
    const cold = hit(sim, e, sim.hero.unit, 'physical')
    sim.hero.heat = HEAT_MAX * 0.6
    expect(hit(sim, e, sim.hero.unit, 'physical')).toBeLessThan(cold)
  })

  it('Unbreakable: below 30 % health the knight takes less', () => {
    const sim = field(['unbreakable'])
    const e = foe(sim)
    const u = sim.hero.unit
    const full = hit(sim, e, u, 'physical')
    u.s.maxHp *= 10
    u.hp = u.s.maxHp * 0.2
    const before = u.hp
    dealDamage(sim, e, u, 100, { type: 'physical', canCrit: false })
    expect(before - u.hp).toBeLessThan(full)
  })

  it('Wildfire: a burning foe\'s fall sets its neighbours alight', () => {
    const sim = field(['wildfire'])
    const a = foe(sim, 2)
    const b = foe(sim, 3)
    applyStatus(sim, a, 'burn', 4, 10, sim.hero.unit)
    kill(sim, a, sim.hero.unit)
    expect(b.statuses.some(s => s.id === 'burn')).toBe(true)
    expect(SKILL_BY_ID.wildfire!.mods!.wildfire).toBeGreaterThan(0)
  })

  it('Loyal Hearts: a minion that falls for her heals her', () => {
    const sim = field(['loyalHearts'])
    const u = sim.hero.unit
    u.hp = u.s.maxHp * 0.5
    const m = spawnMinion(sim, 'guard', u.x + 1, u.z, 10)!
    kill(sim, m, null)
    expect(u.hp).toBeGreaterThan(u.s.maxHp * 0.5)
  })
})
