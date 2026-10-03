import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { grantXp } from '@/game/sim/combat'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'
import { noGear } from '@/game/data/items'
import { xpToNext } from '@/game/data/progression'

/**
 * Level-up in the fight (roadmap #6), the sim's half: a level gained
 * mid-fight is a breather — health and mana back to full, in the sim's own
 * level-up path, the same every run.
 */

const field = (): Sim => {
  const plan = generateArena(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 3, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 3, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  return sim
}

describe('a level gained mid-fight', () => {
  it('refills health and mana and says so', () => {
    const sim = field()
    const u = sim.hero.unit
    u.hp = Math.round(u.s.maxHp * 0.2)
    u.mana = 0
    sim.events.length = 0
    grantXp(sim, xpToNext(sim.hero.level))
    expect(sim.events.some(e => e.t === 'levelUp')).toBe(true)
    expect(u.hp).toBe(u.s.maxHp)
    expect(u.mana).toBe(u.s.maxMana)
  })

  it('does nothing of the kind short of a level', () => {
    const sim = field()
    const u = sim.hero.unit
    u.hp = 10
    grantXp(sim, 1)
    expect(sim.events.some(e => e.t === 'levelUp')).toBe(false)
    expect(u.hp).toBe(10)
  })
})
