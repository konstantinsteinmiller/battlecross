import { afterEach, describe, expect, it, vi } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero, usePotion } from '@/game/sim/hero'
import { applyPlan, populateZone } from '@/game/sim/director'
import { generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { dealDamage, kill } from '@/game/sim/combat'
import { ZONES } from '@/game/data/zones'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import type { Unit } from '@/game/sim/types'
import { BASH_SKILL, MERCY, openingBoss, POTION_STOP_HP, mercyStats, potionStopDue, potionStopOver, stepMercy } from '@/game/coach/tutorialAid'
import { coach, hintPath } from '@/game/coach'

/**
 * The opening fight's helping hands: the potion stop (#154), the chevrons to
 * the boss and the boss's mercy (#155).
 */

const DT = 1 / 30

const visit = (seed = 7): { sim: Sim; plan: ZonePlan } => {
  const plan = generateZone(ZONES.plains, seed, { tutorial: true, openingPack: 5 })
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [BASH_SKILL], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, 'plains', [])
  return { sim, plan }
}
const bossOf = (sim: Sim): Unit => openingBoss(sim)!

afterEach(() => { vi.restoreAllMocks() })

describe('the potion stop (#154)', () => {
  it('comes once the hero drops below 35 % with a flask ready, once a visit', () => {
    const { sim } = visit()
    const u = sim.hero.unit
    u.hp = u.s.maxHp * (POTION_STOP_HP + 0.05)
    expect(potionStopDue(sim)).toBe(false)
    u.hp = u.s.maxHp * (POTION_STOP_HP - 0.05)
    expect(potionStopDue(sim)).toBe(true)
    // Released by drinking (the scene's only order while it holds).
    expect(usePotion(sim)).toBe(true)
    // Low again later: it has taught the flask, it does not stop the world again.
    sim.hero.potionCd = 0
    u.hp = u.s.maxHp * 0.1
    expect(potionStopDue(sim)).toBe(false)
  })

  it('never without a flask to drink, while it cools, or in a conversation', () => {
    const empty = visit().sim
    empty.hero.potions = 0
    empty.hero.unit.hp = 1
    expect(potionStopDue(empty)).toBe(false)
    const cooling = visit().sim
    cooling.hero.potionCd = 3
    cooling.hero.unit.hp = 1
    expect(potionStopDue(cooling)).toBe(false)
    const talking = visit().sim
    talking.hero.unit.truce = true
    talking.hero.unit.hp = 1
    expect(potionStopDue(talking)).toBe(false)
  })

  it('is over once the flask is drunk by any road, or no longer needed, so the hint never lingers', () => {
    // Drunk from code (a cheat, the preview feed), not through the button.
    const drunk = visit().sim
    drunk.hero.unit.hp = 1
    expect(potionStopDue(drunk)).toBe(true)
    expect(potionStopOver(drunk)).toBe(false)
    expect(usePotion(drunk)).toBe(true)
    expect(potionStopOver(drunk)).toBe(true)
    // Health back without a flask (a heal), the flasks gone, or the fight over.
    const healed = visit().sim
    healed.hero.unit.hp = 1
    expect(potionStopDue(healed)).toBe(true)
    healed.hero.unit.hp = healed.hero.unit.s.maxHp
    expect(potionStopOver(healed)).toBe(true)
    const emptied = visit().sim
    emptied.hero.unit.hp = 1
    expect(potionStopDue(emptied)).toBe(true)
    emptied.hero.potions = 0
    expect(potionStopOver(emptied)).toBe(true)
    const fallen = visit().sim
    fallen.hero.unit.hp = 1
    expect(potionStopDue(fallen)).toBe(true)
    kill(fallen, fallen.hero.unit, null)
    expect(potionStopOver(fallen)).toBe(true)
  })
})

describe('the chevrons to the opening boss (#155)', () => {
  const host = (sim: Sim, tutorial: boolean) => ({
    sim, setup: { kind: 'zone' as const, tutorial },
    project: (x: number, _y: number, z: number, o: { x: number; y: number }) => { o.x = x * 10; o.y = z * 10; return true }
  })

  it('lead along the walked way to the boss, out of a fight', () => {
    const { sim } = visit()
    coach.step(host(sim, true), DT)
    expect(hintPath.lead).toBe(true)
    const w = hintPath.world
    const boss = bossOf(sim)
    expect(boss.kind).toBe('banditChief')
    expect(Math.hypot(w[w.length - 2]! - boss.x, w[w.length - 1]! - boss.z)).toBeLessThan(3)
  })

  it('not outside the opening fight, and not once the boss is awake', () => {
    const plain = visit(8).sim
    coach.step(host(plain, false), DT)
    expect(hintPath.lead).toBe(false)
    const { sim } = visit(9)
    const boss = bossOf(sim)
    boss.awake = true
    coach.step(host(sim, true), DT)
    expect(hintPath.lead).toBe(false)
  })
})

describe('the opening boss\'s mercy (#155)', () => {
  const fight = (seed = 7): Sim => {
    const { sim } = visit(seed)
    bossOf(sim).awake = true
    vi.spyOn(console, 'info').mockImplementation(() => {})
    return sim
  }
  /** `secs` of fight in which the hero loses `hpPerSec` and casts Shield Slam every `bashEvery` seconds (0: never). */
  const run = (sim: Sim, secs: number, hpPerSec: number, bashEvery = 0): boolean => {
    const u = sim.hero.unit
    let on = false
    let nextBash = bashEvery
    for (let t = 0; t < secs; t += DT) {
      sim.events.length = 0
      if (bashEvery > 0 && t >= nextBash) { nextBash += bashEvery; sim.events.push({ t: 'cast', src: u.id, skill: BASH_SKILL, x: 0, z: 0, tx: 0, tz: 0 }) }
      // Potions keep him standing: the loss is counted, the bar refilled.
      u.hp -= hpPerSec * DT
      if (u.hp < u.s.maxHp * 0.3) u.hp = u.s.maxHp
      on = stepMercy(sim, DT) || on
    }
    return on
  }

  it('a hero losing his health over and over without Shield Slam: every enemy blow drops by 65 %', () => {
    const sim = fight()
    const max = sim.hero.unit.s.maxHp
    expect(run(sim, MERCY.minT + 5, max / 5)).toBe(true)
    expect(sim.foeHitMul).toBeCloseTo(1 - MERCY.cut)
    expect(mercyStats(sim).mercy).toBe(true)
  })

  it('the cut is in every enemy blow that lands, and only in theirs', () => {
    const base = fight(11)
    const cut = fight(11)
    cut.foeHitMul = 1 - MERCY.cut
    const hit = (sim: Sim): number => dealDamage(sim, bossOf(sim), sim.hero.unit, 40, { type: 'physical', canCrit: false })
    expect(hit(cut) / hit(base)).toBeCloseTo(1 - MERCY.cut, 1)
    const swing = (sim: Sim): number => dealDamage(sim, sim.hero.unit, bossOf(sim), 40, { type: 'physical', canCrit: false })
    expect(swing(cut)).toBeCloseTo(swing(base))
  })

  it('a hero who keeps slamming does not get it, however hard the fight', () => {
    const sim = fight()
    const max = sim.hero.unit.s.maxHp
    expect(run(sim, 70, max / 5, 8)).toBe(false)
    expect(sim.foeHitMul).toBe(1)
  })

  it('a hero who is doing fine does not get it', () => {
    const sim = fight()
    bossOf(sim).hp = bossOf(sim).s.maxHp * 0.4
    expect(run(sim, 70, 0.1)).toBe(false)
    expect(sim.foeHitMul).toBe(1)
  })

  it('a fall in the fight, a slow fight with the boss still high: struggling', () => {
    const fell = fight()
    stepMercy(fell, DT)
    kill(fell, fell.hero.unit, null)
    expect(stepMercy(fell, DT)).toBe(true)
    const slow = fight()
    expect(run(slow, MERCY.slow + 1, 0)).toBe(true)
  })

  it('no clock runs before the boss wakes', () => {
    const { sim } = visit()
    for (let i = 0; i < 30 * 90; i++) stepMercy(sim, DT)
    expect(mercyStats(sim).t).toBe(0)
    expect(sim.foeHitMul).toBe(1)
  })
})
