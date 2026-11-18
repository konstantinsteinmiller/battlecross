import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { generateZone } from '@/game/sim/zoneGen'
import { applyPlan, populateZone } from '@/game/sim/director'
import { botThink, referenceBuild } from '@/game/sim/bot'
import { OPENING, ZONES } from '@/game/data/zones'
import { ALT_AMBUSH_KINDS, ALT_SECTIONS, TRAP_HOLE_R } from '@/game/data/altTutorial'
import { CELL, isSolidAt } from '@/game/sim/grid'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import type { SimEvent } from '@/game/sim/types'

/**
 * The stretched first level (`data/altTutorial.ts`) and its ambush (#218): two goblins, the trapdoor and three
 * raiders in their wagons, three more goblins, the four with the key, the boss — and the same gate, camp and win as the first level.
 */

const start = (seed: number, level = 12): { sim: Sim; plan: ReturnType<typeof generateZone> } => {
  const plan = generateZone(ZONES.plains, seed, { tutorial: true, alt: true, openingPack: OPENING.pack })
  const ref = referenceBuild({ cls: 'aegis', level })
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, 'plains', [])
  sim.hero.unit.s.maxHp = sim.hero.unit.hp = 1e6
  return { sim, plan }
}

describe('the stretched first level', () => {
  it('has five sections: small fights, an ambush, the four with the key, the boss; the gate stands before the boss', () => {
    for (const seed of [1, 2, 3, 5, 7, 11, 42, 99]) {
      const { plan } = start(seed)
      expect(plan.packs, `seed ${seed}`).toHaveLength(ALT_SECTIONS)
      expect(plan.packs.map(p => p.kinds.length)).toEqual([2, 0, 3, OPENING.pack, plan.packs[4]!.kinds.length])
      expect(plan.packs[1]!.ambush!.kinds).toEqual([...ALT_AMBUSH_KINDS])
      expect(plan.packs[4]!.finale).toBe(true)
      // The key pack is the one before the boss, as the gate has it.
      expect(plan.gate, `seed ${seed}`).toBeTruthy()
      expect(plan.gate!.pack).toBe(ALT_SECTIONS - 2)
      // Wagons stand round the trapdoor for the raiders to hide in.
      expect(plan.packs[1]!.ambush!.carts.length, `seed ${seed}: wagons`).toBeGreaterThanOrEqual(1)
      expect(plan.dressing?.filter(d => d.kind === 'wagon').length).toBeGreaterThanOrEqual(plan.packs[1]!.ambush!.carts.length)
    }
  })

  it('the first level is as it was: three sections, no ambush', () => {
    const plan = generateZone(ZONES.plains, 5, { tutorial: true, openingPack: OPENING.pack })
    expect(plan.packs).toHaveLength(3)
    expect(plan.packs.some(p => p.ambush)).toBe(false)
  })

  it('nobody stands in the ambush until the hero steps on the trapdoor; then the raiders are out, awake', () => {
    const { sim, plan } = start(5)
    const g = sim.groups[1]!
    expect(g.ambush?.sprung).toBe(false)
    expect(g.members).toHaveLength(0)
    for (let i = 0; i < 30; i++) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
    expect(g.cleared, 'an empty ambush is not "cleared"').toBe(false)
    const hero = sim.hero.unit
    hero.x = g.ambush!.x
    hero.z = g.ambush!.z
    stepSim(sim, plan, 1 / 30)
    // On the hatch it starts to give way (the dodge lesson's moment); the raiders are not out yet.
    expect(sim.events.some(e => e.t === 'trapCrack')).toBe(true)
    expect(g.ambush!.sprung).toBe(false)
    expect(g.members).toHaveLength(0)
    const smash = g.ambush!.smash
    expect(smash, 'a cart on the left breaks up').toBeTruthy()
    expect(smash!.cells.some(k => isSolidAt(sim.grid, ((k % sim.grid.w) + 0.5) * CELL, (Math.floor(k / sim.grid.w) + 0.5) * CELL))).toBe(true)
    sim.events.length = 0
    let ev: Extract<SimEvent, { t: 'trapSprung' }> | undefined
    for (let i = 0; i < 60 && !ev; i++) {
      stepSim(sim, plan, 1 / 30)
      ev = sim.events.find((e): e is Extract<SimEvent, { t: 'trapSprung' }> => e.t === 'trapSprung')
    }
    expect(ev).toBeTruthy()
    // The pit is shut to every foot, the broken cart's ground is open.
    expect(isSolidAt(sim.grid, g.ambush!.x, g.ambush!.z)).toBe(true)
    expect(Math.hypot(hero.x - g.ambush!.x, hero.z - g.ambush!.z)).toBeGreaterThan(TRAP_HOLE_R - 0.3)
    expect(smash!.cells.every(k => !isSolidAt(sim.grid, ((k % sim.grid.w) + 0.5) * CELL, (Math.floor(k / sim.grid.w) + 0.5) * CELL))).toBe(true)
    expect(g.ambush!.sprung).toBe(true)
    expect(ev!.ids).toHaveLength(ALT_AMBUSH_KINDS.length)
    for (const id of ev!.ids) {
      const u = sim.get(id)!
      expect(u.awake && u.alive && u.team === 1).toBe(true)
      expect(u.kind).toBe('banditRaider')
    }
  })

  it('the raiders teach both lessons: a lane charge (the dodge) and a cone (the shield bash)', () => {
    const kinds = ENEMY_BY_ID.banditRaider!.abilities.map(a => a.kind)
    expect(kinds).toContain('charge')
    expect(kinds).toContain('cone')
  })

  it('played through, the level is won with the gate, the ambush and every pack', () => {
    const { sim, plan } = start(5)
    const seen: SimEvent[] = []
    let think = 0
    while (!sim.ended && sim.time < 600) {
      think -= 1 / 30
      if (think <= 0) { think = 0.2; botThink(sim) }
      stepSim(sim, plan, 1 / 30)
      seen.push(...sim.events)
      sim.events.length = 0
    }
    expect(sim.ended).toBe('victory')
    expect(seen.some(e => e.t === 'trapSprung')).toBe(true)
    expect(sim.groups.every(g => g.cleared)).toBe(true)
    expect(sim.gate!.opened).toBe(true)
  })

  it('pays about level 2 and a half by the fall of the boss (the siege then makes it 3)', () => {
    const { sim, plan } = start(5, 1)
    sim.xpMul = OPENING.xpMul
    sim.holdLevelUp = true
    let think = 0
    while (!sim.ended && sim.time < 600) {
      think -= 1 / 30
      if (think <= 0) { think = 0.2; botThink(sim) }
      stepSim(sim, plan, 1 / 30)
      sim.events.length = 0
    }
    expect(sim.ended).toBe('victory')
    // Level 2 and a half is 75 (the first bar) + half of 192 (the second): 171 XP.
    expect(sim.hero.xp).toBeGreaterThan(150)
    expect(sim.hero.xp).toBeLessThan(200)
  })
})

describe('the rune puzzle pays experience', () => {
  it('solving it is worth a fifth of the bar to the next level, once', async () => {
    const { stepPlates } = await import('@/game/sim/interact')
    const { xpToNext } = await import('@/game/data/progression')
    const { sim } = start(5, 1)
    const p = sim.puzzle!
    const xp0 = sim.hero.xp
    for (const id of p.order) {
      const pl = sim.plates.find(x => x.id === id)!
      sim.hero.unit.x = pl.x
      sim.hero.unit.z = pl.z
      stepPlates(sim)
    }
    expect(p.solved).toBe(true)
    expect(sim.hero.xp - xp0).toBe(Math.round(xpToNext(1) / 5))
    // Standing on it again pays nothing more.
    stepPlates(sim)
    expect(sim.hero.xp - xp0).toBe(Math.round(xpToNext(1) / 5))
  })
})
