// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { fillGrid, generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { ZONES, townNpcs } from '@/game/data/zones'
import { CELL, createGrid, findPath } from '@/game/sim/grid'
import { K_BLOCK } from '@/game/sim/zoneFeatures'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { openDoor } from '@/game/sim/interact'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { chestLock, orderOpen } from '@/game/sim/interact'
import { PICK_REACH } from '@/game/sim/herbs'
import { referenceBuild } from '@/game/sim/bot'
import { CAMP_EXIT_GAP, CAPTIVE_TALK } from '@/game/sim/cages'
import { CAMP_SPEAKER, CAMP_TEACHERS, CAMP_THANKS, KEY_DROP_T, NETTLE_WALK_MAX, campPending, campTarget, inCamp } from '@/game/sim/camp'
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
  openGate(sim, plan)
  return { sim, plan }
}

/** The palisade gate (#194) is open: these tests are about the camp, not the way to it. */
const openGate = (sim: Sim, plan: ZonePlan): void => {
  if (!plan.gate || !sim.gate) return
  sim.gate.opened = true
  openDoor(sim, plan.gate.door)
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
  // The boss's key has to have fallen and landed (#182).
  run(sim, plan, KEY_DROP_T + 0.3)
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

const barks = (sim: Sim): string[] => sim.events.filter(e => e.t === 'bark').map(e => (e as { key: string }).key).filter(k => !k.startsWith('dlg.bark.hero.'))

describe('the camp on the boss floor (#182)', () => {
  it('on every seed: the cage right of the boss, the caravan left of it, the fire a little below it, the finale chest where it was', () => {
    for (const seed of SEEDS) {
      const plan = firstVisit(seed)
      const tag = `#${seed}`
      const camp = plan.camp!
      expect(camp, tag).toBeTruthy()
      const boss = plan.packs.find(q => q.finale)!
      // One cage, three cells wide, standing on its cells, to the right of the boss (no more than a row off).
      const cages = plan.chests.filter(c => c.role === 'cage')
      expect(cages, tag).toHaveLength(1)
      const cage = cages[0]!
      expect(camp.cells, tag).toHaveLength(5)
      for (const k of camp.cells) expect(plan.kind[k], tag).toBe(K_BLOCK)
      expect(camp.cells).toContain(Math.floor(cage.z / CELL) * plan.w + Math.floor(cage.x / CELL))
      expect(cage.x - boss.x, tag).toBeGreaterThanOrEqual(5.5 * CELL)
      expect(cage.x - boss.x, tag).toBeLessThanOrEqual(7.5 * CELL)
      expect(Math.abs(cage.z - boss.z), tag).toBeLessThanOrEqual(1.5 * CELL)
      // The caravan to its left (six cells, a set piece); the fire a little below it (one cell).
      const fire = plan.dressing?.find(d => d.kind === 'fire')!
      const wagon = plan.dressing?.find(d => d.kind === 'wagon')!
      expect(wagon, tag).toBeTruthy()
      expect(wagon.cells.length, tag).toBe(6)
      expect(wagon.x, tag).toBeLessThan(boss.x - 3 * CELL)
      expect(fire.cells.length, tag).toBe(1)
      expect(fire.z - boss.z, tag).toBeGreaterThanOrEqual(2.5 * CELL)
      expect(fire.z - boss.z, tag).toBeLessThanOrEqual(7.5 * CELL)
      // The finale's chest stays where it was: a few cells above the boss.
      const finale = plan.chests.find(c => c.role === 'finale')!
      expect(finale.x, tag).toBeCloseTo(boss.x, 5)
      expect(boss.z - finale.z, tag).toBeCloseTo(4 * CELL, 5)
      // The camp's fixed key place (where it falls if the boss is not found) is on the floor, below the boss.
      expect(plan.cageKey, tag).toBeTruthy()
      expect(Math.hypot(plan.cageKey!.x - boss.x, plan.cageKey!.z - boss.z), tag).toBeLessThan(2 * CELL)
      // Everything is walked to from the start: the cage's door, the key, every place by the fire, Nettle's way in.
      const g = fillGrid(createGrid(plan.w, plan.h), plan, true)
      const path: number[] = []
      for (const p of [{ x: cage.sx, z: cage.sz }, plan.cageKey!, ...camp.spots, camp.entry, { x: finale.sx, z: finale.sz }]) {
        expect(findPath(g, plan.start.x, plan.start.z, p.x, p.z, path), `${tag} ${p.x},${p.z}`).toBeGreaterThan(0)
      }
    }
  })

  it('nothing clips: no two blocking pieces share a cell, the pack ring is clear of them, the wheels and the teachers places lie on open ground', () => {
    for (const seed of SEEDS) {
      const plan = firstVisit(seed)
      const tag = `#${seed}`
      const camp = plan.camp!
      const boss = plan.packs.find(q => q.finale)!
      const cellOf = (x: number, z: number): number => Math.floor(z / CELL) * plan.w + Math.floor(x / CELL)
      const taken = new Map<number, string>()
      const take = (k: number, what: string): void => {
        expect(taken.get(k), `${tag} ${what} on ${taken.get(k)}`).toBeUndefined()
        taken.set(k, what)
      }
      for (const k of camp.cells) take(k, 'cage')
      for (const d of plan.dressing ?? []) for (const k of d.cells) take(k, d.kind)
      for (const c of plan.chests) if (c.role !== 'cage') take(cellOf(c.x, c.z), 'chest ' + c.role)
      // The boss's pack spawns up to 2.5 cells round its middle (and the leader a little above): none of it on a blocked cell.
      const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
      applyPlan(sim, plan)
      populateZone(sim, plan, 'plains', [])
      for (const u of sim.units) {
        if (u.team !== 1) continue
        expect(taken.has(cellOf(u.x, u.z)), `${tag} ${u.kind} at ${u.x.toFixed(1)},${u.z.toFixed(1)} stands on ${taken.get(cellOf(u.x, u.z))}`).toBe(false)
        expect(plan.solid[cellOf(u.x, u.z)], `${tag} ${u.kind} in rock`).toBeFalsy()
      }
      // The teachers places and the wheels are on open ground, apart from each other.
      for (const sp of camp.spots) {
        expect(plan.solid[cellOf(sp.x, sp.z)], tag + ' place in rock').toBeFalsy()
        expect(taken.has(cellOf(sp.x, sp.z)), tag + ' place on a piece').toBe(false)
      }
      for (const d of (plan.dressing ?? []).filter(q => q.kind === 'wheel' || q.kind === 'spikes')) {
        expect(plan.solid[cellOf(d.x, d.z)], tag + ' ' + d.kind + ' in rock').toBeFalsy()
        for (const sp of camp.spots) expect(Math.hypot(d.x - sp.x, d.z - sp.z), tag + ' wreckage on a place').toBeGreaterThan(1.2 * CELL)
        expect(Math.hypot(d.x - boss.x, d.z - boss.z), tag + ' wreckage in the pack ring').toBeGreaterThan(2.5 * CELL)
      }
    }
  })

  it('the cage traps nobody: every open cell of the fight (4.5 cells round the boss) is walked to from the start', () => {
    for (const seed of SEEDS) {
      const plan = firstVisit(seed)
      const g = fillGrid(createGrid(plan.w, plan.h), plan, true)
      const boss = plan.packs.find(q => q.finale)!
      const path: number[] = []
      for (let k = 0; k < plan.solid.length; k++) {
        const x = ((k % plan.w) + 0.5) * CELL
        const z = (Math.floor(k / plan.w) + 0.5) * CELL
        if (g.solid[k] || Math.hypot(x - boss.x, z - boss.z) > 4.5 * CELL) continue
        expect(findPath(g, plan.start.x, plan.start.z, x, z, path), `#${seed} cell ${k % plan.w},${Math.floor(k / plan.w)}`).toBeGreaterThan(0)
      }
    }
  })

  it('the boss drops the key as it falls: nowhere before, it arcs down, and it can be picked up only once it has landed', () => {
    const { sim, plan } = visit()
    expect(sim.cageKey!.drop).toBe(-1)
    expect(chestLock(sim, sim.chests.find(c => c.role === 'cage')!)).toBe('finale')
    win(sim)
    run(sim, plan, 1 / 30 + 0.01)
    expect(sim.cageKey!.drop).toBeGreaterThanOrEqual(0)
    // It falls where the boss lay (or the nearest open ground to it).
    const boss = sim.units.find(u => !u.alive && u.team === 1 && u.kind === sim.groups.find(g => g.boss)!.boss)
    expect(Math.hypot(sim.cageKey!.x - (boss?.x ?? sim.cageKey!.x), sim.cageKey!.z - (boss?.z ?? sim.cageKey!.z))).toBeLessThan(2 * CELL)
    // Standing on it before it lands: nothing is picked up.
    const h = sim.hero.unit
    h.x = h.px = sim.cageKey!.x
    h.z = h.pz = sim.cageKey!.z
    stepSim(sim, plan, 1 / 30)
    expect(sim.cageKey!.taken).toBe(false)
    run(sim, plan, KEY_DROP_T + 0.2)
    expect(sim.cageKey!.drop).toBe(KEY_DROP_T)
    expect(sim.cageKey!.taken).toBe(true)
  })

  it('the teachers behind the bars cannot be touched while the boss fights (nothing targets or hurts them)', () => {
    const { sim, plan } = visit()
    run(sim, plan, 2)
    for (const p of sim.captives) {
      const u = sim.get(p.unit)!
      expect(u.statuses.some(q => q.id === 'invulnerable'), p.npc).toBe(false)
      expect(u.hp, p.npc).toBe(u.s.maxHp)
    }
  })

  it('a later visit to the plains has no camp', () => {
    expect(generateZone(ZONES.plains, 3).camp).toBeUndefined()
    expect(generateZone(ZONES.plains, 3, { cage: true }).camp).toBeUndefined()
  })
})

describe('the first visit holds a little of the rest of the world (#178)', () => {
  it('two plants, a first ore node and a piece of the treasure map, on every seed, all reachable and clear of the camp', () => {
    for (const seed of SEEDS) {
      const plan = generateZone(ZONES.plains, seed, { tutorial: true, openingPack: 2, pieces: ['plains1'] })
      const tag = 'seed ' + seed
      expect(plan.herbs, tag).toHaveLength(2)
      expect(plan.ores, tag).toHaveLength(1)
      expect(plan.pieces.map(q => q.id), tag).toEqual(['plains1'])
      const grid = createGrid(plan.w, plan.h)
      fillGrid(grid, plan, true)
      const camp = plan.camp!
      const at = [...plan.herbs, ...plan.ores, ...plan.pieces]
      for (const q of at) {
        expect(Math.hypot(q.x - camp.x, q.z - camp.z), tag).toBeGreaterThan(3 * CELL)
        const path: number[] = []
        // An ore node stands in rock: it is reached from the cell in front of it.
        const to = 'sx' in q ? { x: (q as { sx: number }).sx, z: (q as { sz: number }).sz } : q
        expect(findPath(grid, plan.start.x, plan.start.z, to.x, to.z, path), tag + ' reachable').toBeGreaterThan(0)
      }
    }
  })

  it('without the piece lying about (already found), the visit still holds the plants and the ore', () => {
    const plan = generateZone(ZONES.plains, 3, { tutorial: true, openingPack: 2 })
    expect(plan.pieces).toHaveLength(0)
    expect(plan.herbs).toHaveLength(2)
    expect(plan.ores).toHaveLength(1)
  })
})

describe('the way to the camp (#177)', () => {
  it('wheels and splintered spokes lie along the way in, from the boss floor towards the wagon', () => {
    for (const seed of SEEDS) {
      const plan = firstVisit(seed)
      const camp = plan.camp!
      const bits = (plan.dressing ?? []).filter(d => d.kind === 'wheel' || d.kind === 'spikes')
      expect(bits.length, 'seed ' + seed).toBeGreaterThanOrEqual(3)
      expect(bits.some(d => d.kind === 'wheel'), 'seed ' + seed).toBe(true)
      expect(bits.some(d => d.kind === 'spikes'), 'seed ' + seed).toBe(true)
      // They block nothing, start below the boss and lead left to the caravan.
      for (const d of bits) expect(d.cells, 'seed ' + seed).toEqual([])
      const fin = plan.packs.find(q => q.finale)!
      const wagon = plan.dressing!.find(d => d.kind === 'wagon')!
      expect(Math.max(...bits.map(d => d.z)), 'seed ' + seed).toBeGreaterThan(fin.z + 2.5 * CELL)
      for (const d of bits) expect(d.x, 'seed ' + seed).toBeLessThan(fin.x)
      expect(Math.min(...bits.map(d => Math.hypot(d.x - wagon.x, d.z - wagon.z))), 'seed ' + seed).toBeLessThan(3 * CELL)
      void camp
    }
  })

  it('a later visit has none of it', () => {
    const plan = generateZone(ZONES.plains, 3, {})
    expect((plan.dressing ?? []).some(d => d.kind === 'wheel' || d.kind === 'spikes')).toBe(false)
  })

  it('the visit is not over while the teachers are caged: the way leads to the key, then to the cage', () => {
    const { sim, plan } = visit()
    expect(campPending(sim)).toBe(true)
    const cage = sim.chests.find(c => c.role === 'cage')!
    // The key is the boss's to drop: until it falls the way leads to the cage's door.
    expect(campTarget(sim)!.x).toBeCloseTo(cage.sx, 5)
    win(sim)
    run(sim, plan, KEY_DROP_T + 0.3)
    expect(campPending(sim)).toBe(true)
    expect(campTarget(sim)!.x).toBeCloseTo(sim.cageKey!.x, 5)
    openCage(sim, plan)
    expect(campPending(sim)).toBe(false)
    expect(campTarget(sim)).toBeNull()
    void cage
  })

  it('a visit without a camp is never pending', () => {
    const plan = generateZone(ZONES.plains, 3, {})
    const sim = new Sim({ seed: 3, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    expect(campPending(sim)).toBe(false)
  })
})

describe('the cage and its teachers', () => {
  it('four of Sunford\'s teachers behind the bars (the knight, the pyromancer, the Soul Warden and the monk), in their own looks, nobody to talk to yet', () => {
    const { sim } = visit()
    const cage = sim.chests.find(c => c.role === 'cage')!
    const people = sim.captives.map(p => sim.get(p.unit)!)
    expect(people.map(u => u.kind).sort()).toEqual(CAMP_TEACHERS.map(t => t.look).sort())
    for (const u of people) {
      expect(Math.abs(u.z - cage.z)).toBeLessThan(0.5)
      expect(Math.abs(u.x - cage.x)).toBeLessThanOrEqual(2.6)
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
    // They leave the cage one by one (`CAMP_EXIT_GAP` apart), so the last is out a few seconds after the first.
    run(sim, plan, CAMP_EXIT_GAP * 4)
    // Out of the cage, answering to their town ids.
    for (const p of sim.captives) {
      const u = sim.get(p.unit)!
      expect(u.npc).toBe(p.npc)
      expect(u.z - cage.z, p.npc).toBeGreaterThan(0.8)
      expect(inCamp(sim, p.npc!)).toBe(true)
    }
    // Then to their places by the fire, and there they stay.
    run(sim, plan, CAPTIVE_TALK + 15)
    expect(sim.captives).toHaveLength(4)
    for (const p of sim.captives) {
      const u = sim.get(p.unit)!
      expect(p.phase).toBe('stay')
      expect(u.alive).toBe(true)
      expect(Math.hypot(u.x - p.hx, u.z - p.hz), p.npc).toBeLessThan(0.8)
      // The ones who teach stand by the fire; the knight (his skill is the hero's already) has stepped aside, by the cage's door (#186).
      const teaches = CAMP_TEACHERS.find(t => t.npc === p.npc)!.teaches
      if (teaches) expect(Math.hypot(u.x - plan.camp!.fire.x, u.z - plan.camp!.fire.z), p.npc).toBeLessThan(4)
      else expect(Math.hypot(u.x - plan.camp!.aside.x, u.z - plan.camp!.aside.z), p.npc).toBeLessThan(0.8)
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

  it('the free lesson is the last step of the visit (#180): pending once the cage is open, done when it is taken', async () => {
    const L = await import('@/game/coach/campLesson')
    const { sim, plan } = visit()
    p.profile.gold = 0
    // The cage is shut: the rescue comes first, not the lesson.
    expect(L.campLessonPending(sim)).toBe(false)
    win(sim)
    openCage(sim, plan)
    expect(L.campHasLesson()).toBe(true)
    expect(L.campLessonPending(sim)).toBe(true)
    // The teachers stand out, and the chevrons can find the nearest.
    run(sim, plan, CAPTIVE_TALK + 8)
    expect(L.nearestTeacher(sim, sim.hero.unit.x, sim.hero.unit.z)).toBeTruthy()
    p.lesson.camp = true
    p.learnSkill(firstLessons().find(id => p.learnBlock(id) === '')!)
    p.lesson.camp = false
    expect(L.campLessonPending(sim)).toBe(false)
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
