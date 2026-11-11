import { describe, expect, it } from 'vitest'
import { ENEMIES } from '@/game/data/enemies'
import { setupRun } from '@/game/sim/bot'
import { spawnEnemy } from '@/game/sim/spawn'
import { startAbility } from '@/game/sim/abilities'
import { stepSim } from '@/game/sim/step'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { applyPlan, populateZone } from '@/game/sim/director'
import { generateZone } from '@/game/sim/zoneGen'
import { hashSeed } from '@/game/sim/rng'
import { ZONES } from '@/game/data/zones'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import { objectiveOf } from '@/game/coach/world'
import { startRescue } from '@/game/sim/rescue'
import { startWalk, walkActive } from '@/game/sim/autowalk'
import { KEY_DROP_T } from '@/game/sim/camp'
import { frustration, grantMercy, MERCY, RELIEF, stepRelief, TUTORIAL_CHARGED_CAP } from '@/game/coach/tutorialAid'

/** The tutorial level (the plains before their first clear): the first boss's big blows are capped, a free revive softens the foes. */

const hit = (cap: number, abilityOf: (e: (typeof ENEMIES)[number]) => number): number => {
  const def = ENEMIES.find(e => e.id === 'banditChief')!
  const { sim, plan } = setupRun({ zone: 'plains', level: 1, cls: 'aegis', seed: 5 })
  sim.chargedCap = cap
  const hero = sim.hero.unit
  const u = spawnEnemy(sim, 'banditChief', hero.x + 3, hero.z)!
  const i = abilityOf(def)
  const ab = def.abilities[i]!
  u.x = hero.x + 3
  u.z = hero.z
  u.awake = true
  hero.hp = hero.s.maxHp
  hero.shield = 0
  startAbility(sim, u, ab, i, hero)
  const before = hero.hp
  for (let n = 0; n < 30 * (ab.windup + 0.5); n++) stepSim(sim, plan, 1 / 30)
  return (before - Math.max(0, hero.hp)) / hero.s.maxHp
}

describe('tutorial level: the first boss', () => {
  it('its charged cone takes at most 20 % of the hero\'s health, and more where there is no cap', () => {
    const cone = (e: (typeof ENEMIES)[number]): number => e.abilities.findIndex(a => a.charged)
    expect(hit(TUTORIAL_CHARGED_CAP, cone)).toBeLessThanOrEqual(0.2 + 1e-6)
    expect(hit(TUTORIAL_CHARGED_CAP, cone)).toBeGreaterThan(0.05)
    expect(hit(0, cone)).toBeGreaterThanOrEqual(0.35)
  })

  it('its lane charge is capped too', () => {
    const lane = (e: (typeof ENEMIES)[number]): number => e.abilities.findIndex(a => a.kind === 'charge')
    expect(hit(TUTORIAL_CHARGED_CAP, lane)).toBeLessThanOrEqual(0.2 + 1e-6)
  })

  it('a free revive cuts the foes\' blows once, and never on top of the boss\'s mercy', () => {
    const { sim } = setupRun({ zone: 'plains', level: 1, cls: 'aegis', seed: 5 })
    expect(grantMercy(sim)).toBe(true)
    expect(sim.foeHitMul).toBeCloseTo(1 - MERCY.cut, 5)
    expect(grantMercy(sim)).toBe(false)
    expect(sim.foeHitMul).toBeCloseTo(1 - MERCY.cut, 5)
  })
})

describe('tutorial level: the objective marker at the palisade', () => {
  it('points at the silver key once it has dropped, then at the gate, then on to the pack beyond', () => {
    const plan = generateZone(ZONES.plains, hashSeed('plains', 0), { tutorial: true, openingPack: 4 })
    const sim = new Sim({ seed: hashSeed('plains', 0), w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 1 })
    populateZone(sim, plan, 'plains', [], [])
    const g = sim.gate!
    expect(g).toBeTruthy()
    // The pack before the boss still stands: the marker is not the key.
    expect(objectiveOf(sim, 'clear')?.kind).not.toBe('key')
    g.key.drop = 1
    expect(objectiveOf(sim, 'clear')).toMatchObject({ kind: 'key', x: g.key.x, z: g.key.z })
    expect(objectiveOf(sim, 'boss')?.kind).toBe('key')
    g.key.taken = true
    expect(objectiveOf(sim, 'clear')).toMatchObject({ kind: 'key', x: g.fx, z: g.fz })
    g.opened = true
    expect(objectiveOf(sim, 'clear')?.kind).not.toBe('key')
  })
})

describe('tutorial level: frustration relief', () => {
  const fight = () => {
    const { sim } = setupRun({ zone: 'plains', level: 1, cls: 'aegis', seed: 5 })
    const hero = sim.hero.unit
    const foe = spawnEnemy(sim, 'goblin', hero.x + 6, hero.z)!
    foe.x = hero.x + 6
    foe.z = hero.z
    foe.awake = true
    return { sim, hero, foe }
  }

  it('softens the blows while the hero runs away from the fight', () => {
    const { sim, hero } = fight()
    for (let i = 0; i < 30 * 6; i++) {
      hero.vx = -4
      hero.vz = 0
      stepRelief(sim, 1 / 30)
    }
    expect(frustration(sim)).toBeGreaterThan(0.5)
    expect(sim.reliefMul).toBeLessThan(1 - RELIEF.cut * 0.5)
    expect(sim.reliefMul).toBeGreaterThanOrEqual(1 - RELIEF.cut)
  })

  it('softens them when the hero lands nothing for a while, and the first blow lands brings it back down', () => {
    const { sim, hero } = fight()
    hero.vx = 0
    hero.vz = 0
    for (let i = 0; i < 30 * 14; i++) stepRelief(sim, 1 / 30)
    const worn = frustration(sim)
    expect(worn).toBeGreaterThan(0.3)
    for (let i = 0; i < 30 * 10; i++) {
      sim.events.length = 0
      sim.events.push({ t: 'hit', src: hero.id } as never)
      stepRelief(sim, 1 / 30)
    }
    expect(frustration(sim)).toBeLessThan(worn)
  })

  it('counts a swing that the hero himself dropped by moving', () => {
    const { sim, hero } = fight()
    stepRelief(sim, 1 / 30)
    sim.swingCancels += 4
    stepRelief(sim, 1 / 30)
    expect(frustration(sim)).toBeGreaterThanOrEqual(4 * RELIEF.cancel - 0.01)
  })

  it('leaves a hero who fights properly, and a quiet field, at full strength', () => {
    const { sim, hero } = fight()
    for (let i = 0; i < 30 * 20; i++) {
      sim.events.length = 0
      if (i % 45 === 0) sim.events.push({ t: 'hit', src: hero.id } as never)
      hero.vx = 0
      hero.vz = 0
      stepRelief(sim, 1 / 30)
    }
    expect(sim.reliefMul).toBe(1)
    const quiet = setupRun({ zone: 'plains', level: 1, cls: 'aegis', seed: 6 }).sim
    for (let i = 0; i < 30 * 20; i++) stepRelief(quiet, 1 / 30)
    expect(quiet.reliefMul).toBe(1)
  })
})

describe('tutorial level: "Free the caged teachers" walks the hero there', () => {
  it('to the gold key, then to the cage, and opens it', () => {
    const plan = generateZone(ZONES.plains, hashSeed('plains', 0), { tutorial: true, openingPack: 4 })
    const sim = new Sim({ seed: hashSeed('plains', 0), w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 1 })
    populateZone(sim, plan, 'plains', [], [])
    // The boss is down and the key has landed where it fell; the hero stands a few metres off it.
    sim.ended = 'victory'
    sim.endedT = 1
    const k = sim.cageKey!
    k.drop = KEY_DROP_T
    sim.hero.unit.x = k.x + 5
    sim.hero.unit.z = k.z
    sim.hero.unit.px = sim.hero.unit.x
    sim.hero.unit.pz = sim.hero.unit.z
    const cage = sim.chests.find(c => c.role === 'cage')!
    expect(startRescue(sim)).toBe(true)
    let sawKey = false
    for (let i = 0; i < 30 * 60 && cage.state === 'closed'; i++) {
      stepSim(sim, plan, 1 / 30)
      if (k.taken) sawKey = true
    }
    expect(sawKey).toBe(true)
    expect(cage.state).not.toBe('closed')
  })

  it('is given up when the player takes the stick', () => {
    const plan = generateZone(ZONES.plains, hashSeed('plains', 0), { tutorial: true, openingPack: 4 })
    const sim = new Sim({ seed: hashSeed('plains', 0), w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 1 })
    populateZone(sim, plan, 'plains', [], [])
    sim.ended = 'victory'
    sim.endedT = 1
    sim.cageKey!.drop = KEY_DROP_T
    expect(startRescue(sim)).toBe(true)
    stepSim(sim, plan, 1 / 30)
    expect(sim.camp!.auto).toBeTruthy()
    sim.hero.stickX = 1
    stepSim(sim, plan, 1 / 30)
    expect(sim.camp!.auto).toBeUndefined()
  })
})

describe('the goal chip walks the hero to the objective', () => {
  const make = (zone: 'plains' | 'hollows') => {
    const plan = generateZone(ZONES[zone], hashSeed(zone, 3), {})
    const sim = new Sim({ seed: hashSeed(zone, 3), w: plan.w, h: plan.h, level: 3, difficulty: 1, mode: 'zone', zone })
    applyPlan(sim, plan)
    createHero(sim, { build: { level: 3, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 1 })
    populateZone(sim, plan, zone, [], [])
    return { plan, sim }
  }
  it('goes toward the next pack along the path, and stops when the player takes the stick', () => {
    for (const zone of ['plains', 'hollows'] as const) {
      const { plan, sim } = make(zone)
      const o = objectiveOf(sim, 'clear')!
      expect(o).toBeTruthy()
      const u = sim.hero.unit
      const d0 = Math.hypot(o.x - u.x, o.z - u.z)
      expect(startWalk(sim, o.x, o.z)).toBe(true)
      expect(walkActive(sim)).toBe(true)
      for (let i = 0; i < 30 * 8; i++) stepSim(sim, plan, 1 / 30)
      expect(Math.hypot(o.x - u.x, o.z - u.z), zone).toBeLessThan(d0 - 4)
      sim.hero.stickX = 1
      stepSim(sim, plan, 1 / 30)
      expect(walkActive(sim)).toBe(false)
    }
  })
})
