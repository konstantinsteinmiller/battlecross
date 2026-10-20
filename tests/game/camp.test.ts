// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { fillGrid, generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { ZONES, townNpcs } from '@/game/data/zones'
import { CELL, createGrid, findPath } from '@/game/sim/grid'
import { K_BLOCK } from '@/game/sim/zoneFeatures'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { chestLock, orderOpen } from '@/game/sim/interact'
import { PICK_REACH } from '@/game/sim/herbs'
import { referenceBuild } from '@/game/sim/bot'
import { CAPTIVE_TALK } from '@/game/sim/cages'
import { CAMP_SPEAKER, CAMP_TEACHERS, CAMP_THANKS, NETTLE_WALK_MAX, inCamp } from '@/game/sim/camp'
import { MENTOR_NPC } from '@/game/data/mentor'
import { SPOKEN } from '@/game/data/dialogs'
import { plainStats } from '@/game/sim/stats'
import { skillsOf } from '@/game/data/skills'

/**
 * The rescued teachers' camp (roadmap #156): past the first visit's boss, a
 * big cage holding three of Sunford's teachers, its key in front of it, a
 * broken-down caravan and a fire. Opened after the boss, the knight thanks
 * the hero once and they settle by the fire to teach; the first lesson there
 * is free. Nettle walks over once the boss is down. Unopened, nobody speaks;
 * either way the teachers are Sunford's.
 */

const SEEDS = [1, 2, 3, 7, 11, 42, 77, 1234]

const firstVisit = (seed: number): ZonePlan => generateZone(ZONES.plains, seed, { tutorial: true, openingPack: 2 })

const visit = (seed = 3): { sim: Sim; plan: ZonePlan } => {
  const plan = firstVisit(seed)
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  const ref = referenceBuild({ level: 1, cls: 'aegis' })
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, 'plains', [])
  return { sim, plan }
}

const run = (sim: Sim, plan: ZonePlan, secs: number, until: () => boolean = () => false): void => {
  for (let t = 0; t < secs && !until(); t += 1 / 30) stepSim(sim, plan, 1 / 30)
}

/** The boss is down: the visit is won (the camp's cage may open). */
const win = (sim: Sim): void => {
  sim.ended = 'victory'
  for (const u of sim.units) if (u.team === 1) { u.alive = false; u.hp = 0 }
}

/** The hero picks up the key and opens the cage. */
const openCage = (sim: Sim, plan: ZonePlan): void => {
  const h = sim.hero.unit
  h.x = h.px = sim.cageKey!.x + PICK_REACH * 0.5
  h.z = h.pz = sim.cageKey!.z
  stepSim(sim, plan, 1 / 30)
  expect(sim.cageKey!.taken).toBe(true)
  const cage = sim.chests.find(c => c.role === 'cage')!
  h.x = h.px = cage.sx
  h.z = h.pz = cage.sz
  expect(orderOpen(sim, cage.id)).toBe(true)
  run(sim, plan, 2, () => cage.state === 'open')
  expect(cage.state).toBe('open')
}

const barks = (sim: Sim): string[] => sim.events.filter(e => e.t === 'bark').map(e => (e as { key: string }).key)

describe('the camp past the first visit\'s boss', () => {
  it('on every seed: a big cage past the finale, its key in front, a fire and a caravan, ~40 % more ground, all reachable', () => {
    for (const seed of SEEDS) {
      const plan = firstVisit(seed)
      const tag = `#${seed}`
      const camp = plan.camp!
      expect(camp, tag).toBeTruthy()
      const fin = plan.clearings.find(c => c.role === 'finale')!
      // Up the screen from the boss's floor.
      expect(camp.z, tag).toBeLessThan(fin.z - fin.r)
      // One cage, three cells wide, standing on its cells.
      const cages = plan.chests.filter(c => c.role === 'cage')
      expect(cages, tag).toHaveLength(1)
      const cage = cages[0]!
      expect(camp.cells, tag).toHaveLength(3)
      for (const k of camp.cells) expect(plan.kind[k], tag).toBe(K_BLOCK)
      expect(camp.cells).toContain(Math.floor(cage.z / CELL) * plan.w + Math.floor(cage.x / CELL))
      // The key lies in front of the cage, on the way to its door.
      expect(plan.cageKey, tag).toBeTruthy()
      expect(plan.cageKey!.z, tag).toBeGreaterThan(cage.z)
      expect(Math.hypot(plan.cageKey!.x - cage.x, plan.cageKey!.z - cage.z), tag).toBeLessThan(4)
      // A fire and the broken-down caravan, both set pieces with cells of their own.
      const fire = plan.dressing?.find(d => d.kind === 'fire')
      const wagon = plan.dressing?.find(d => d.kind === 'wagon')
      expect(fire?.cells.length, tag).toBe(1)
      expect(wagon?.cells.length, tag).toBe(6)
      expect(Math.hypot(fire!.x - camp.x, fire!.z - camp.z), tag).toBeLessThan(6)
      expect(Math.hypot(wagon!.x - camp.x, wagon!.z - camp.z), tag).toBeLessThan(8)
      // About 40 % more ground than the boss's floor alone (the way in counted too, and
      // the boss's floor is lumpy: a wide band).
      let finCells = 0
      let campCells = 0
      for (let k = 0; k < plan.solid.length; k++) {
        if (plan.solid[k]) continue
        const x = ((k % plan.w) + 0.5) * CELL
        const z = (Math.floor(k / plan.w) + 0.5) * CELL
        if (Math.hypot(x - fin.x, z - fin.z) <= fin.r) finCells++
        else if (z < fin.z - fin.r * 0.6 && Math.hypot(x - camp.x, z - camp.z) <= 6 * CELL) campCells++
      }
      expect(campCells / finCells, tag).toBeGreaterThan(0.3)
      expect(campCells / finCells, tag).toBeLessThan(0.8)
      // Everything is walked to from the start: the cage's door, the key, every place by the fire.
      const g = fillGrid(createGrid(plan.w, plan.h), plan)
      const path: number[] = []
      for (const p of [{ x: cage.sx, z: cage.sz }, plan.cageKey!, ...camp.spots, camp.entry]) {
        expect(findPath(g, plan.start.x, plan.start.z, p.x, p.z, path), `${tag} ${p.x},${p.z}`).toBeGreaterThan(0)
      }
    }
  })

  it('the cage traps nobody: every open cell of the camp is walked to from the start', () => {
    for (const seed of SEEDS) {
      const plan = firstVisit(seed)
      const g = fillGrid(createGrid(plan.w, plan.h), plan)
      const camp = plan.camp!
      const path: number[] = []
      for (let k = 0; k < plan.solid.length; k++) {
        const x = ((k % plan.w) + 0.5) * CELL
        const z = (Math.floor(k / plan.w) + 0.5) * CELL
        if (g.solid[k] || Math.hypot(x - camp.x, z - camp.z) > 5 * CELL) continue
        expect(findPath(g, plan.start.x, plan.start.z, x, z, path), `#${seed} cell ${k % plan.w},${Math.floor(k / plan.w)}`).toBeGreaterThan(0)
      }
    }
  })

  it('a later visit to the plains has no camp', () => {
    expect(generateZone(ZONES.plains, 3).camp).toBeUndefined()
    expect(generateZone(ZONES.plains, 3, { cage: true }).camp).toBeUndefined()
  })
})

describe('the cage and its teachers', () => {
  it('three of Sunford\'s teachers behind the bars, in their own looks, nobody to talk to yet', () => {
    const { sim } = visit()
    const cage = sim.chests.find(c => c.role === 'cage')!
    const people = sim.captives.map(p => sim.get(p.unit)!)
    expect(people.map(u => u.kind).sort()).toEqual(CAMP_TEACHERS.map(t => t.look).sort())
    for (const u of people) {
      expect(Math.abs(u.z - cage.z)).toBeLessThan(0.5)
      expect(Math.abs(u.x - cage.x)).toBeLessThanOrEqual(CELL + 0.01)
      expect(u.npc).toBeFalsy()
    }
    for (const t of CAMP_TEACHERS) expect(inCamp(sim, t.npc)).toBe(false)
  })

  it('locked until the boss is down; opened with its key, the knight thanks the hero once and they settle by the fire to teach', () => {
    const { sim, plan } = visit()
    const cage = sim.chests.find(c => c.role === 'cage')!
    expect(chestLock(sim, cage)).toBe('finale')
    win(sim)
    expect(chestLock(sim, cage)).toBe('key')
    openCage(sim, plan)
    // The special key is the camp's own: no cage's captive (the plains' peddler) is freed by it.
    expect(sim.specialOpened).toContain('plains:camp')
    expect(sim.specialOpened).not.toContain('plains:cage')
    run(sim, plan, 4)
    const aegis = sim.captives.find(p => p.npc === CAMP_SPEAKER)!
    expect(barks(sim)).toEqual([CAMP_THANKS])
    expect(sim.events.find(e => e.t === 'bark' && (e as { unit: number }).unit === aegis.unit)).toBeTruthy()
    // Out of the cage, answering to their town ids.
    for (const p of sim.captives) {
      const u = sim.get(p.unit)!
      expect(u.npc).toBe(p.npc)
      expect(u.z - cage.z, p.npc).toBeGreaterThan(0.8)
      expect(inCamp(sim, p.npc!)).toBe(true)
    }
    // Then to their places by the fire, and there they stay.
    run(sim, plan, CAPTIVE_TALK + 15)
    expect(sim.captives).toHaveLength(3)
    for (const p of sim.captives) {
      const u = sim.get(p.unit)!
      expect(p.phase).toBe('stay')
      expect(u.alive).toBe(true)
      expect(Math.hypot(u.x - p.hx, u.z - p.hz), p.npc).toBeLessThan(0.8)
      expect(Math.hypot(u.x - plan.camp!.fire.x, u.z - plan.camp!.fire.z), p.npc).toBeLessThan(4)
    }
    // Said once only.
    run(sim, plan, 10)
    expect(barks(sim)).toEqual([CAMP_THANKS])
  })

  it('left shut: nobody speaks, nobody comes out, and nobody teaches here', () => {
    const { sim, plan } = visit()
    win(sim)
    run(sim, plan, 20)
    expect(barks(sim)).toEqual([])
    expect(sim.captives.every(p => p.phase === 'caged')).toBe(true)
    for (const t of CAMP_TEACHERS) expect(inCamp(sim, t.npc)).toBe(false)
  })

  it('the thanks is a voiced line in the knight\'s own voice', () => {
    const conv = SPOKEN.find(s => s.id === `bark.${CAMP_SPEAKER}`)
    expect(conv).toBeTruthy()
    expect(conv!.voice).toBe(CAMP_SPEAKER)
    expect(conv!.greet[0]!.lines[0]!.id).toBe(CAMP_THANKS)
  })
})

describe('the road teacher walks over to the fire', () => {
  it('from where she waited on the road, once the boss is down', () => {
    const { sim, plan } = visit()
    const hero = sim.hero.unit
    const nettle = sim.addUnit({
      kind: 'sfShadow', team: 0, rank: 'npc', level: 1, x: plan.start.x, z: plan.start.z - 12, r: 0.5, h: 1.45,
      s: plainStats({ hp: 1000, dmg: 0, speed: 3.6 }), facing: 0, npc: MENTOR_NPC
    })
    const x0 = nettle.x
    const z0 = nettle.z
    // Not before the boss falls.
    run(sim, plan, 2)
    expect(Math.hypot(nettle.x - x0, nettle.z - z0)).toBeLessThan(0.01)
    win(sim)
    run(sim, plan, 3)
    // On her way: walking, closer to the fire.
    expect(sim.camp!.nettle).toBe('walk')
    expect(nettle.anim).toBe('walk')
    run(sim, plan, NETTLE_WALK_MAX + 2, () => sim.camp!.nettle === 'there')
    expect(sim.camp!.nettle).toBe('there')
    expect(Math.hypot(nettle.x - sim.camp!.nx, nettle.z - sim.camp!.nz)).toBeLessThan(0.6)
    expect(Math.hypot(nettle.x - plan.camp!.fire.x, nettle.z - plan.camp!.fire.z)).toBeLessThan(4)
    // There, she turns to the hero; still the one to talk to for her lesson.
    run(sim, plan, 0.5)
    expect(nettle.npc).toBe(MENTOR_NPC)
    void hero
  })

  it('and when she never came into the opening, she steps in at the camp and walks to the fire', () => {
    const { sim, plan } = visit()
    expect(sim.units.some(u => u.npc === MENTOR_NPC)).toBe(false)
    win(sim)
    stepSim(sim, plan, 1 / 30)
    const nettle = sim.units.find(u => u.npc === MENTOR_NPC)!
    expect(nettle).toBeTruthy()
    expect(Math.hypot(nettle.x - plan.camp!.entry.x, nettle.z - plan.camp!.entry.z)).toBeLessThan(0.5)
    run(sim, plan, NETTLE_WALK_MAX + 2, () => sim.camp!.nettle === 'there')
    expect(Math.hypot(nettle.x - sim.camp!.nx, nettle.z - sim.camp!.nz)).toBeLessThan(0.6)
  })
})

describe('the camp\'s gift and the teachers\' way home', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  beforeEach(async () => {
    drainAndResetModules()
    localStorage.clear()
    await holdGameState()
    p = await import('@/game/state/profile')
    p.initProfile()
  })
  afterEach(() => { drainPersist(); vi.restoreAllMocks() })

  /** A first lesson of the three teachers' classes this hero could take for nothing. */
  const firstLessons = (): string[] => ['aegis', 'pyro', 'soulwarden'].flatMap(c => skillsOf(c as never).map(s => s.id))

  it('the first lesson bought in the camp is free, once; elsewhere every lesson has its price', () => {
    p.profile.gold = 0
    const ids = firstLessons()
    // Out of the camp: a price.
    for (const id of ids) expect(p.skillCost(id), id).toBeGreaterThan(0)
    p.lesson.camp = true
    for (const id of ids) expect(p.skillCost(id), id).toBe(0)
    const free = ids.find(id => p.learnBlock(id) === '')
    expect(free, 'a lesson a new hero can take').toBeTruthy()
    expect(p.learnSkill(free!)).toBe(true)
    expect(p.profile.gold).toBe(0)
    expect(p.profile.tips[p.CAMP_GIFT_TIP]).toBe(true)
    // The gift is spent: the next one is paid for, in the camp too.
    for (const id of ids.filter(id => id !== free)) expect(p.skillCost(id), id).toBeGreaterThan(0)
    p.lesson.camp = false
    for (const id of ids.filter(id => id !== free)) expect(p.skillCost(id), id).toBeGreaterThan(0)
  })

  it('the road teacher\'s own gift does not spend the camp\'s', () => {
    p.profile.gold = 0
    p.lesson.camp = true
    p.lesson.free = 'shadowstep'
    expect(p.skillCost('shadowstep')).toBe(0)
    if (p.learnBlock('shadowstep') === '') {
      expect(p.learnSkill('shadowstep')).toBe(true)
      expect(p.profile.tips[p.CAMP_GIFT_TIP]).toBeFalsy()
    }
  })

  it('opened or not, the four teachers are in Sunford once the hero has left the first visit', () => {
    const want = [...CAMP_TEACHERS.map(t => t.npc), 'sfShadow']
    // Left with the cage shut: the save holds nothing of the camp.
    const shut = townNpcs('sunford', new Set(p.profile.world.flags)).map(n => n.id)
    for (const id of want) expect(shut, id).toContain(id)
    // Left with it opened: the camp's chest is the save's, and nothing else changes.
    p.profile.world.chests.push('plains:camp')
    const opened = townNpcs('sunford', new Set(p.profile.world.flags)).map(n => n.id)
    for (const id of want) expect(opened, id).toContain(id)
    // …and the plains' own cage (the peddler's) is not counted as opened by it.
    expect(p.hasFlag('freedPeddler')).toBe(false)
  })
})
