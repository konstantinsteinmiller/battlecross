import { describe, expect, it } from 'vitest'
import { generateZone, fillGrid } from '@/game/sim/zoneGen'
import { ZONES } from '@/game/data/zones'
import { CELL, createGrid, findPath } from '@/game/sim/grid'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { referenceBuild } from '@/game/sim/bot'
import { dealDamage } from '@/game/sim/combat'
import { startStampede } from '@/game/sim/rebels'
import { gnomeSpot } from '@/game/sim/rebelSite'
import { spawnEnemy, spawnMinion } from '@/game/sim/spawn'
import { ENEMY_BY_ID, MINIONS } from '@/game/data/enemies'
import { CRIES, CRIER, cryKey } from '@/game/data/assault'
import { KING_HP_MUL, LEAP_RUNNERS, REBEL_COUNT, REBEL_FLOOR, STAMPEDE_MAX, STAMPEDE_MIN, rebellionDue, stampedeShare } from '@/game/data/rebellion'
import { TUSKER_SCRIPTS } from '@/game/sim/bosses/tusker'

/**
 * #205: the Hollows' chain gang of gnome diggers while the Goblin King lives; freed gnomes cannot die,
 * they run at a tenth of their health, and come back for the King's fight.
 */

const STEP = 1 / 30
const SEEDS = [1, 2, 3, 7, 11, 42, 99, 123]

const scene = (seed = 3) => {
  const plan = generateZone(ZONES.hollows, seed, { rebels: true })
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: 'hollows' })
  applyPlan(sim, plan)
  const ref = referenceBuild({ level: 5, cls: 'aegis' })
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, 'hollows', [])
  return { sim, plan }
}
const run = (sim: Sim, plan: ReturnType<typeof scene>['plan'], s: number): void => {
  for (let t = 0; t < s; t += STEP) stepSim(sim, plan, STEP)
}
/** Take the overseers out of the way and let the hero walk up: the whole gang is free. */
const free = (sc: ReturnType<typeof scene>): void => {
  const { sim, plan } = sc
  // The overseers are away (not dead: the zone would be won, and a won zone harms nobody).
  for (const e of sim.units) if (e.team === 1) { e.awake = false; e.x = e.px = 1; e.z = e.pz = 1 }
  const g = sim.rebels!.gnomes[0]!
  sim.hero.unit.x = sim.hero.unit.px = g.x0
  sim.hero.unit.z = sim.hero.unit.pz = g.z0 + 1.2
  run(sim, plan, 2)
}

describe('where the gang stands', () => {
  it('while the King lives: a post and a gnome each, on open ground, a few steps from the overseers, reachable', () => {
    let laid = 0
    for (const seed of SEEDS) {
      const plan = generateZone(ZONES.hollows, seed, { rebels: true })
      if (!plan.rebels) continue
      laid++
      const r = plan.rebels
      expect(r.posts, `#${seed}`).toHaveLength(REBEL_COUNT)
      const g = fillGrid(createGrid(plan.w, plan.h), plan)
      const path: number[] = []
      expect(findPath(g, plan.start.x, plan.start.z, r.x, r.z, path), `#${seed}`).toBeGreaterThan(0)
      const near = Math.min(...plan.packs.filter(p => !p.finale).map(p => Math.hypot(p.x - r.x, p.z - r.z)))
      expect(near, `#${seed}`).toBeGreaterThanOrEqual(5.5)
      expect(near, `#${seed}`).toBeLessThanOrEqual(12)
      for (let q = 0; q < REBEL_COUNT; q++) {
        const at = gnomeSpot(r, q)
        expect(g.solid[Math.floor(at.z / CELL) * plan.w + Math.floor(at.x / CELL)] ?? 0, `#${seed} gnome ${q}`).toBe(0)
      }
    }
    // Nearly every seed has room for it.
    expect(laid).toBeGreaterThanOrEqual(SEEDS.length - 1)
  })

  it('nothing of it once the King has fallen, nowhere else, and nothing else of the place moves', () => {
    expect(rebellionDue(() => false)).toBe(true)
    expect(rebellionDue(f => f === 'arenaOpen')).toBe(false)
    const a = generateZone(ZONES.hollows, 3)
    const b = generateZone(ZONES.hollows, 3, { rebels: true })
    expect(a.rebels).toBeUndefined()
    expect(b.packs).toEqual(a.packs)
    expect(b.chests).toEqual(a.chests)
    const first = generateZone(ZONES.plains, 3, { rebels: true, tutorial: true })
    expect(first.rebels).toBeUndefined()
  })
})

describe('the gnomes in chains', () => {
  it('chained at their posts, harmless and untargetable, until the overseers are down', () => {
    const { sim, plan } = scene()
    const r = sim.rebels!
    expect(r.gnomes).toHaveLength(REBEL_COUNT)
    for (const g of r.gnomes) {
      const u = sim.get(g.unit)!
      expect(u.rank).toBe('npc')
      // Not a target for anyone: the foes' search for somebody to hit passes them by.
      expect(sim.nearest(0, u.x, u.z, 3, sim.hero.unit.id)).toBeUndefined()
    }
    // The hero walks up with an overseer awake beside the gang: the chains hold and he is told so.
    const guard = spawnEnemy(sim, 'goblin', r.site.x + 2, r.site.z + 2)!
    guard.awake = true
    const h = sim.hero.unit
    h.x = h.px = r.gnomes[0]!.x0
    h.z = h.pz = r.gnomes[0]!.z0 + 1.2
    run(sim, plan, 1)
    expect(r.freed).toBe(0)
    expect(sim.events.some(e => e.t === 'rebel' && e.id === 'guarded') || r.guardT > 0).toBe(true)
    // The overseer falls: all of them are let go, one after the other.
    for (const e of sim.units) if (e.team === 1) e.awake = false
    run(sim, plan, 3)
    expect(r.freed).toBe(REBEL_COUNT)
    for (const g of r.gnomes) {
      const u = sim.get(g.unit)!
      expect(g.mode).toBe('follow')
      expect(u.kind).toBe('rebelGnome')
      expect(u.team).toBe(0)
      expect(u.rank).toBe('minion')
    }
  })

  it('they do not count against the hero\'s own band of six', () => {
    const sc = scene()
    free(sc)
    expect(sc.sim.countAlive(0, 'rebelGnome')).toBe(REBEL_COUNT)
    const h = sc.sim.hero.unit
    for (let q = 0; q < 6; q++) expect(spawnMinion(sc.sim, 'guard', h.x + q * 0.1, h.z, -1), 'guard ' + q).not.toBeNull()
  })
})

describe('frail, but never dead', () => {
  it('a blow that would leave a gnome under a tenth leaves it at 9 %, sends it running, and nothing takes more', () => {
    const sc = scene()
    free(sc)
    const { sim } = sc
    const g = sim.rebels!.gnomes[0]!
    const u = sim.get(g.unit)!
    const foe = spawnEnemy(sim, 'goblin', u.x + 1, u.z)!
    foe.awake = true
    foe.targetId = u.id
    // A blow that leaves it with 12 %: no harm in running yet.
    u.hp = u.s.maxHp
    dealDamage(sim, foe, u, u.s.maxHp * 0.88, { type: 'true', canCrit: false, attack: true })
    expect(g.mode).toBe('follow')
    expect(u.hp).toBeGreaterThan(u.s.maxHp * 0.1)
    // The next one would kill it.
    dealDamage(sim, foe, u, u.s.maxHp * 5, { type: 'true', canCrit: false, attack: true })
    expect(u.alive).toBe(true)
    expect(u.hp).toBeCloseTo(u.s.maxHp * REBEL_FLOOR, 5)
    expect(g.mode).toBe('fled')
    expect(u.rank).toBe('npc')
    expect(foe.targetId).toBe(0)
    expect(u.flinch).toBeGreaterThan(0)
    // And never again, however hard.
    dealDamage(sim, foe, u, u.s.maxHp * 50, { type: 'true', canCrit: false, attack: true })
    expect(u.alive).toBe(true)
    expect(u.hp).toBeCloseTo(u.s.maxHp * REBEL_FLOOR, 5)
  })

  it('a runner keeps out of the foes\' way and stays near the hero', () => {
    const sc = scene()
    free(sc)
    const { sim, plan } = sc
    const g = sim.rebels!.gnomes[1]!
    const u = sim.get(g.unit)!
    dealDamage(sim, null, u, u.s.maxHp * 5, { type: 'true', canCrit: false })
    expect(g.mode).toBe('fled')
    const foe = spawnEnemy(sim, 'goblin', u.x + 3, u.z)!
    foe.awake = true
    foe.group = 999
    const d0 = Math.hypot(foe.x - u.x, foe.z - u.z)
    run(sim, plan, 1)
    expect(Math.hypot(foe.x - u.x, foe.z - u.z)).toBeGreaterThan(d0 - 1.5)
    expect(u.alive).toBe(true)
  })
})

describe('the King\'s fight', () => {
  it('has 14 % more health, Tusker\'s and his own', () => {
    expect(KING_HP_MUL).toBe(1.14)
    expect(ENEMY_BY_ID.tusker!.hp).toBeCloseTo(7.5 * 1.14, 6)
    expect(ENEMY_BY_ID.goblinKing!.hp).toBeCloseTo(6.5 * 1.14, 6)
    expect(MINIONS.rebelGnome).toBeTruthy()
  })

  it('the first stampede: every freed gnome stabs once, together 5 % to 10 % of his health by how many were freed, one scream', () => {
    expect(stampedeShare(0)).toBe(0)
    expect(stampedeShare(1)).toBeCloseTo(STAMPEDE_MIN, 9)
    expect(stampedeShare(REBEL_COUNT)).toBeCloseTo(STAMPEDE_MAX, 9)
    expect(stampedeShare(3)).toBeGreaterThan(STAMPEDE_MIN)
    expect(stampedeShare(3)).toBeLessThan(STAMPEDE_MAX)
    const sc = scene()
    free(sc)
    const { sim, plan } = sc
    // Tusker stands near the hero.
    const h = sim.hero.unit
    const boss = spawnEnemy(sim, 'tusker', h.x + 6, h.z)!
    boss.awake = true
    sim.events.length = 0
    startStampede(sim, 'first', boss)
    const screams = sim.events.filter(e => e.t === 'bark')
    expect(screams).toHaveLength(1)
    expect((screams[0] as { key: string }).key).toBe(cryKey('gnome', CRIES[0]))
    // What the gnomes' stabs took (the hero's own blows are not theirs).
    let taken = 0
    let stabs = 0
    for (let t = 0; t < 8; t += STEP) {
      stepSim(sim, plan, STEP)
      for (const e of sim.events) {
        if (e.t === 'hit' && e.src === 0 && e.tgt === boss.id) taken += e.amount
        if (e.t === 'rebel' && e.id === 'stab') stabs++
      }
      sim.events.length = 0
    }
    expect(stabs).toBe(REBEL_COUNT)
    // All six stabbed (the boss's own guard and the hero's mercy aside): about the share of his health.
    expect(taken).toBeGreaterThan(boss.s.maxHp * STAMPEDE_MAX * 0.8)
    expect(taken).toBeLessThan(boss.s.maxHp * STAMPEDE_MAX * 1.25)
    // They ran off again, none hurt.
    for (const g of sim.rebels!.gnomes) {
      expect(sim.get(g.unit)!.alive).toBe(true)
      expect(['fled', 'stab']).toContain(g.mode)
    }
  })

  it('the second: five of them, one stab each, when he leaps off Tusker; and the script wires both', () => {
    const sc = scene()
    free(sc)
    const { sim, plan } = sc
    const king = spawnEnemy(sim, 'goblinKing', sim.hero.unit.x + 6, sim.hero.unit.z)!
    king.awake = true
    startStampede(sim, 'second', king)
    expect(sim.rebels!.gnomes.filter(g => g.mode === 'run')).toHaveLength(LEAP_RUNNERS)
    let stabs = 0
    for (let t = 0; t < 8; t += STEP) {
      stepSim(sim, plan, STEP)
      for (const e of sim.events) if (e.t === 'rebel' && e.id === 'stab') stabs++
      sim.events.length = 0
    }
    expect(stabs).toBe(LEAP_RUNNERS)
    expect(sim.rebels!.stampedes).toBe(1)
    expect(CRIER.gnome).toBe('rebelGnome')
    // The Tusker script asks for both.
    const src = TUSKER_SCRIPTS.tusker!.think.toString() + TUSKER_SCRIPTS.tusker!.onPhase!.toString()
    expect(src).toContain('startStampede')
  })

  it('no gnomes freed, no stampede', () => {
    const { sim } = scene()
    const boss = spawnEnemy(sim, 'tusker', sim.hero.unit.x + 6, sim.hero.unit.z)!
    sim.events.length = 0
    startStampede(sim, 'first', boss)
    expect(sim.events.filter(e => e.t === 'bark')).toHaveLength(0)
    expect(sim.rebels!.stampedes).toBe(0)
  })
})
