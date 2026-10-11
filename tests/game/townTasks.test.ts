// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { CARAVAN_TOWNS, TASKS_PER_TOWN, TOWN_REGION, countTaskDeeds, postTasks } from '@/game/townTasks'
import { ZONES, TOWNS, type TownId } from '@/game/data/zones'
import type { ZoneId } from '@/game/data/items'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { plantsOf } from '@/game/data/plants'
import { generateEncounter, fillGrid } from '@/game/sim/zoneGen'
import { createGrid, isSolidAt } from '@/game/sim/grid'
import { escortPacks } from '@/game/data/encounters'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { referenceBuild } from '@/game/sim/bot'
import { CARAVAN_WAIT } from '@/game/sim/caravan'
import { dealDamage } from '@/game/sim/combat'

/**
 * The town boards (roadmap #85, D105, D106): three tasks a day per town —
 * defeat a kind in a zone, bring herbs, and on the caravan's road the escort —
 * handed in at that town's board for gold and experience.
 */

const TOWN_IDS = Object.keys(TOWNS) as TownId[]
const ZONES_EARLY: ZoneId[] = ['plains', 'hollows', 'woods', 'outskirts']

describe('what a board posts', () => {
  it('three tasks a day per town, the same all day, others the next', () => {
    for (const town of TOWN_IDS) {
      const a = postTasks(town, '2026-10-07', ZONES_EARLY, true)
      expect(a.length, town).toBe(TASKS_PER_TOWN)
      expect(postTasks(town, '2026-10-07', ZONES_EARLY, true)).toEqual(a)
      expect(JSON.stringify(postTasks(town, '2026-10-08', ZONES_EARLY, true))).not.toEqual(JSON.stringify(a))
      for (const t of a) {
        if (t.kind === 'slay') {
          // Close to home: the town's own region, where the hero can go.
          const home = TOWN_REGION[town].filter(z => ZONES_EARLY.includes(z))
          expect(home.length ? home : ZONES_EARLY.slice(-3), town).toContain(t.zone)
          expect(ZONES[t.zone as ZoneId].kinds.map(k => k.kind)).toContain(t.enemy)
          expect(ENEMY_BY_ID[t.enemy]!.rank).toBe('normal')
          expect(t.n).toBeGreaterThanOrEqual(8)
        } else if (t.kind === 'gather') {
          expect(ZONES_EARLY.some(z => plantsOf(z).some(p => p.id === t.plant)), `${town} ${t.plant}`).toBe(true)
          expect(t.n).toBeGreaterThanOrEqual(3)
        }
      }
    }
  })

  it('the caravan is posted in Sunford and Oakhaven once the road is open, nowhere else', () => {
    for (const town of TOWN_IDS) {
      const open = postTasks(town, '2026-10-07', ZONES_EARLY, true).some(t => t.kind === 'escort')
      expect(open, town).toBe(CARAVAN_TOWNS.includes(town))
      expect(postTasks(town, '2026-10-07', ZONES_EARLY, false).some(t => t.kind === 'escort'), town).toBe(false)
    }
  })

  it('a new save gets tasks too (the first zone only)', () => {
    const a = postTasks('sunford', '2026-10-07', ['plains'], false)
    expect(a.length).toBeGreaterThanOrEqual(2)
    expect(a.some(t => t.kind === 'gather' && t.plant === 'sunpetal') || a.some(t => t.kind === 'slay')).toBe(true)
  })

  it('a defeat task counts kills of its kind in its zone only', () => {
    const list = postTasks('sunford', '2026-10-07', ZONES_EARLY, false).filter(t => t.kind === 'slay')
    const t = list[0]!
    countTaskDeeds(list, { zone: 'plains' === t.zone ? 'hollows' : 'plains', kills: { [t.enemy]: 5 } })
    expect(t.have).toBe(0)
    countTaskDeeds(list, { zone: t.zone, kills: { [t.enemy]: 5, other: 9 } })
    expect(t.have).toBe(5)
    countTaskDeeds(list, { zone: t.zone, kills: { [t.enemy]: 50 } })
    expect(t.have).toBe(t.n)
  })
})

describe('the caravan\'s road', () => {
  const road = (seed: number) => {
    const packs = escortPacks('outskirts', seed)
    const plan = generateEncounter(packs, seed, { escort: true })
    const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 9, difficulty: 1, mode: 'zone', zone: 'outskirts' })
    applyPlan(sim, plan)
    const ref = referenceBuild({ level: 9, cls: 'aegis' })
    createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    populateZone(sim, plan, 'outskirts', [])
    return { sim, plan }
  }

  it('is a walkable road from the start through every clearing, the ambushes beside it', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const { plan } = road(seed)
      expect(plan.caravan, `seed ${seed}`).toBeDefined()
      const g = fillGrid(createGrid(plan.w, plan.h), plan)
      const p = plan.caravan!.path
      expect(p.length / 2).toBe(plan.clearings.length)
      for (let i = 0; i < p.length; i += 2) expect(isSolidAt(g, p[i]!, p[i + 1]!)).toBe(false)
      expect(plan.packs).toHaveLength(3)
    }
  })

  it('rolls on with the hero beside it, waits for him, and its arrival wins the visit', () => {
    const { sim, plan } = road(3)
    // Nobody to fight: the ambushers are gone.
    for (const u of sim.units) if (u.team === 1) { u.alive = false; u.hp = 0 }
    const cart = sim.get(sim.caravan!.unit)!
    const hero = sim.hero.unit
    const x0 = cart.x
    const z0 = cart.z
    // The hero far away: it waits.
    hero.x = hero.px = x0 + CARAVAN_WAIT + 5
    for (let s = 0; s < 60; s++) stepSim(sim, plan, 1 / 30)
    expect(Math.hypot(cart.x - x0, cart.z - z0)).toBeLessThan(0.05)
    expect(sim.caravan!.phase).toBe('waiting')
    // He walks with it: it reaches the end.
    for (let s = 0; s < 30 * 200 && !sim.ended; s++) {
      hero.x = hero.px = cart.x + 1.5
      hero.z = hero.pz = cart.z + 1
      stepSim(sim, plan, 1 / 30)
    }
    expect(sim.caravan!.phase).toBe('arrived')
    expect(sim.ended).toBe('victory')
  })

  it('holds while a foe is near it; broken, it loses the visit', () => {
    const { sim, plan } = road(4)
    const cart = sim.get(sim.caravan!.unit)!
    const foe = sim.units.find(u => u.team === 1)!
    foe.x = foe.px = cart.x + 2
    foe.z = foe.pz = cart.z
    foe.awake = true
    for (let s = 0; s < 10; s++) stepSim(sim, plan, 1 / 30)
    expect(sim.caravan!.phase).toBe('held')
    dealDamage(sim, foe, cart, 1e9, { type: 'true', canCrit: false })
    for (let s = 0; s < 10 && !sim.ended; s++) stepSim(sim, plan, 1 / 30)
    expect(sim.caravan!.phase).toBe('lost')
    expect(sim.ended).toBe('defeat')
  })
})

describe('at the board', () => {
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

  it('a herb task takes the herbs and pays; a defeat task pays once counted; the caravan once it arrived', () => {
    for (const z of ['plains', 'hollows', 'woods', 'outskirts']) p.profile.world.cleared.push(z)
    const list = p.tasksOf('sunford')
    expect(p.tasksOf('sunford')).toBe(list)
    const gi = list.findIndex(t => t.kind === 'gather')
    if (gi >= 0) {
      const t = list[gi]!
      expect(p.handInTask('sunford', gi)).toBeNull()
      p.addHerbs({ [t.plant]: t.n + 1 })
      expect(p.taskReady(t)).toBe(true)
      const gold = p.profile.gold
      const pay = p.handInTask('sunford', gi)!
      expect(pay.gold).toBeGreaterThan(0)
      expect(pay.xp).toBeGreaterThan(0)
      expect(p.profile.gold).toBe(gold + pay.gold)
      expect(p.herbCount(t.plant)).toBe(1)
      expect(p.handInTask('sunford', gi)).toBeNull()
    }
    const si = list.findIndex(t => t.kind === 'slay')
    if (si >= 0) {
      const t = list[si]!
      expect(p.handInTask('sunford', si)).toBeNull()
      p.countTasks({ zone: t.zone, kills: { [t.enemy]: t.n } })
      expect(p.handInTask('sunford', si)).not.toBeNull()
    }
    const ei = list.findIndex(t => t.kind === 'escort')
    expect(ei).toBeGreaterThanOrEqual(0)
    expect(p.handInTask('sunford', ei)).toBeNull()
    p.finishEscortTasks()
    const pay = p.handInTask('sunford', ei)!
    expect(pay.gold).toBe(2 * (50 + p.profile.level * 15))
  })
})
