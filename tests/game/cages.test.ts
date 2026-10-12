// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { generateZone, fillGrid } from '@/game/sim/zoneGen'
import { ZONES, ZONE_IDS, townNpcs } from '@/game/data/zones'
import { CAGES, cageOf } from '@/game/data/cages'
import { createGrid, findPath } from '@/game/sim/grid'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { chestLock, orderOpen } from '@/game/sim/interact'
import { PICK_REACH } from '@/game/sim/herbs'
import { referenceBuild } from '@/game/sim/bot'
import { SPOKEN, conversationOf } from '@/game/data/dialogs'
import { CAPTIVE_TALK, captiveLine } from '@/game/sim/cages'
import { meets } from '@/game/dialog/conditions'
import { startAttrs } from '@/game/data/attributes'

/**
 * Cages (roadmap #100): six places hold somebody in a cage whose key lies
 * elsewhere in the place; opened once, for good, and the freed are met again
 * in a town (the disciples teaching their class, the master's test spared).
 */

const SEEDS = [1, 2, 3, 7, 11, 42]

describe('where the cages stand', () => {
  it('in each of the six places, on every seed: a cage on open ground and its key, both reachable, apart', () => {
    for (const c of CAGES) {
      for (const seed of SEEDS) {
        const plan = generateZone(ZONES[c.zone], seed, { cage: true })
        const tag = `${c.zone}#${seed}`
        const cage = plan.chests.find(x => x.role === 'cage')
        expect(cage, tag).toBeTruthy()
        expect(plan.cageKey, tag).toBeTruthy()
        const g = fillGrid(createGrid(plan.w, plan.h), plan)
        const path: number[] = []
        expect(findPath(g, plan.start.x, plan.start.z, cage!.sx, cage!.sz, path), `${tag} cage`).toBeGreaterThan(0)
        expect(findPath(g, plan.start.x, plan.start.z, plan.cageKey!.x, plan.cageKey!.z, path), `${tag} key`).toBeGreaterThan(0)
        expect(Math.hypot(cage!.x - plan.cageKey!.x, cage!.z - plan.cageKey!.z), tag).toBeGreaterThanOrEqual(14)
      }
    }
  })

  it('none without one asked for, none in the other places, none on the first visit', () => {
    for (const z of ZONE_IDS) {
      const plan = generateZone(ZONES[z], 7, { cage: !!cageOf(z) && false })
      expect(plan.chests.some(x => x.role === 'cage'), z).toBe(false)
    }
    expect(generateZone(ZONES.plains, 7, { cage: true, tutorial: true }).chests.some(x => x.role === 'cage')).toBe(false)
  })

  it('the cage changes nothing else of the place: the same packs and chests as without it', () => {
    const a = generateZone(ZONES.woods, 11)
    const b = generateZone(ZONES.woods, 11, { cage: true })
    expect(b.packs).toEqual(a.packs)
    expect(b.chests.filter(x => x.role !== 'cage')).toEqual(a.chests)
    expect(b.herbs).toEqual(a.herbs)
  })
})

describe('opening one', () => {
  it('locked until the key is found; then opened like a chest, kept as the place\'s cage', () => {
    const plan = generateZone(ZONES.woods, 3, { cage: true })
    const sim = new Sim({ seed: 3, w: plan.w, h: plan.h, level: 7, difficulty: 1, mode: 'zone', zone: 'woods' })
    applyPlan(sim, plan)
    const ref = referenceBuild({ level: 7, cls: 'aegis' })
    createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    populateZone(sim, plan, 'woods', [])
    const cage = sim.chests.find(c => c.role === 'cage')!
    expect(chestLock(sim, cage)).toBe('key')
    expect(orderOpen(sim, cage.id)).toBe(false)
    expect(sim.events.some(e => e.t === 'chest' && e.state === 'locked' && e.why === 'key')).toBe(true)
    const u = sim.hero.unit
    u.x = u.px = sim.cageKey!.x + PICK_REACH * 0.5
    u.z = u.pz = sim.cageKey!.z
    stepSim(sim, plan, 1 / 30)
    expect(sim.cageKey!.taken).toBe(true)
    expect(chestLock(sim, cage)).toBe('')
    u.x = u.px = cage.sx
    u.z = u.pz = cage.sz
    expect(orderOpen(sim, cage.id)).toBe(true)
    for (let t = 0; t < 2; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    expect(cage.state).toBe('open')
    expect(sim.specialOpened).toContain('woods:cage')
  })

  it('the captives are people: behind the bars, out through the door, a word to the hero, and off home', () => {
    const plan = generateZone(ZONES.woods, 3, { cage: true })
    const sim = new Sim({ seed: 3, w: plan.w, h: plan.h, level: 7, difficulty: 1, mode: 'zone', zone: 'woods' })
    applyPlan(sim, plan)
    const ref = referenceBuild({ level: 7, cls: 'aegis' })
    createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    populateZone(sim, plan, 'woods', [])
    const def = cageOf('woods')!
    const cage = sim.chests.find(c => c.role === 'cage')!
    // Two of them (a family), in the look they wear in town, inside the cage.
    const people = sim.units.filter(u => u.rank === 'npc' && u.kind === def.look)
    expect(people).toHaveLength(def.count)
    for (const u of people) expect(Math.hypot(u.x - cage.x, u.z - cage.z)).toBeLessThan(0.5)
    sim.cageKey!.taken = true
    const h = sim.hero.unit
    h.x = h.px = cage.sx
    h.z = h.pz = cage.sz
    expect(orderOpen(sim, cage.id)).toBe(true)
    for (let t = 0; t < 4; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    const said = sim.events.filter(e => e.t === 'bark').map(e => (e as { key: string }).key)
    // Out of the cage, beside its door, talking to the hero: one of them speaks, once.
    for (const u of people) {
      expect(Math.hypot(u.x - cage.x, u.z - cage.z), 'out').toBeGreaterThan(1.2)
      expect(u.alive).toBe(true)
    }
    expect(said).toEqual([captiveLine(def.npc)])
    expect(sim.captives.every(p => p.phase === 'talk')).toBe(true)
    // Then off home, back the way the hero came; gone once out of the picture.
    for (let t = 0; t < CAPTIVE_TALK + 1; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    expect(sim.captives.every(p => p.phase === 'leave')).toBe(true)
    const d0 = Math.hypot(people[0]!.x - plan.start.x, people[0]!.z - plan.start.z)
    for (let t = 0; t < 2; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    expect(Math.hypot(people[0]!.x - plan.start.x, people[0]!.z - plan.start.z)).toBeLessThan(d0 - 2)
    for (let t = 0; t < 45 && sim.captives.length; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    expect(sim.captives).toHaveLength(0)
    for (const u of people) expect(sim.get(u.id)).toBeUndefined()
  })

  it('every freed one has a voiced line saying who they are', () => {
    for (const c of CAGES) {
      const conv = SPOKEN.find(s => s.id === `bark.${c.npc}`)
      expect(conv, c.npc).toBeTruthy()
      expect(conv!.voice).toBe(c.npc)
      expect(conv!.greet[0]!.lines[0]!.id).toBe(captiveLine(c.npc))
    }
  })
})

describe('the freed', () => {
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

  it('are met again in their town; a disciple teaches the class and spares the master\'s test', () => {
    for (const c of CAGES) {
      const before = townNpcs(c.town, new Set(p.profile.world.flags)).map(n => n.id)
      expect(before, c.npc).not.toContain(c.npc)
      p.freeCaptives(c.zone)
      expect(p.hasFlag(c.flag)).toBe(true)
      const after = townNpcs(c.town, new Set(p.profile.world.flags)).map(n => n.id)
      expect(after, c.npc).toContain(c.npc)
      expect(conversationOf(c.npc), c.npc).toBeTruthy()
      if (c.found) expect(p.hasFlag(c.found)).toBe(true)
    }
    // The masters no longer set their tests.
    const w = {
      level: 20, gold: 0, attrs: startAttrs(), flags: new Set(p.profile.world.flags), rep: { order: 0, syndicate: 0, circle: 0 }, quests: {},
      cleared: new Set<string>(), said: new Set<string>(), errands: {}
    }
    for (const m of ['sbMasterWindrunner', 'sbMasterFrostwarden', 'sbMasterLightbringer']) {
      const favor = conversationOf(m)!.nodes.root!.choices.find(ch => ch.id === 'favor')!
      expect(meets(favor.when, w, m), m).toBe(false)
    }
  })
})
