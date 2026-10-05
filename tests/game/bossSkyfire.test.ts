import { describe, expect, it } from 'vitest'
import { Sim, hasStatus, outOfReach } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { dealDamage } from '@/game/sim/combat'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'
import type { Unit } from '@/game/sim/types'

/**
 * The Void Dragon, Skyfire (#74): at 60 % it takes off (out of everyone's
 * reach), makes three strafing runs that leave fire, and crashes down dazed.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 25, difficulty: 1, mode: 'zone', zone: 'peak' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 25, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
  })
  sim.hero.unit.s.maxHp = sim.hero.unit.hp = 1e7
  return sim
}
const step = (sim: Sim, seconds: number, until?: () => boolean): void => {
  for (let t = 0; t < seconds; t += 1 / 30) {
    stepSim(sim, plan, 1 / 30)
    sim.events.length = 0
    if (until?.()) return
  }
}
const dragon = (sim: Sim): Unit => {
  const h = sim.hero.unit
  const d = spawnEnemy(sim, 'voidDragon', h.x, h.z - 7)!
  d.awake = true
  d.targetId = h.id
  d.homeX = d.x
  d.homeZ = d.z
  for (let i = 0; i < d.cds.length; i++) d.cds[i] = 99
  d.boss!.next = 99
  return d
}

describe('Skyfire, the Void Dragon (#74)', () => {
  it('at 60 % it takes off, out of reach, and nothing on the ground can touch it', () => {
    const sim = arena()
    const d = dragon(sim)
    d.hp = d.s.maxHp * 0.59
    step(sim, 3, () => (d.boss?.alt ?? 0) > 3)
    expect(d.boss!.mode).toBe('air')
    expect(outOfReach(d)).toBe(true)
    const hp = d.hp
    expect(dealDamage(sim, sim.hero.unit, d, 1000, { type: 'physical' })).toBe(0)
    expect(d.hp).toBe(hp)
    expect(sim.nearest(1, d.x, d.z, 50)).toBeUndefined()
  })

  it('makes three strafing runs, each leaving a trail of fire, then crashes down dazed', () => {
    const sim = arena()
    const d = dragon(sim)
    d.hp = d.s.maxHp * 0.59
    let passes = 0
    let was = ''
    let fires = 0
    for (let i = 0; i < 30 * 40 && d.boss!.mode !== 'dazed'; i++) {
      step(sim, 1 / 30)
      const sub = d.boss!.sub
      if (sub === 'pass' && was !== 'pass') passes++
      was = sub
      fires = Math.max(fires, sim.fields.filter(f => f.active && f.kind === 'burnGround').length)
    }
    expect(passes).toBe(3)
    expect(fires).toBeGreaterThan(4)
    expect(d.boss!.mode).toBe('dazed')
    expect(d.boss!.alt).toBe(0)
    expect(hasStatus(d, 'stun')).toBe(true)
    expect(outOfReach(d)).toBe(false)
  })

  it('its sweeping breath hits whoever stands in the cone, at most twice', () => {
    const sim = arena()
    const d = dragon(sim)
    const h = sim.hero.unit
    d.boss!.next = 0
    const hp0 = h.hp
    step(sim, 4)
    const lost = hp0 - h.hp
    expect(lost).toBeGreaterThan(0)
    expect(lost).toBeLessThan(d.s.baseDmg * 3.5)
  })
})
