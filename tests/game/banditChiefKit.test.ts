import { describe, expect, it } from 'vitest'
import { ENEMY_BY_ID, GNOME_FLEETING } from '@/game/data/enemies'
import { ZONES } from '@/game/data/zones'
import { LOOKS } from '@/game/gfx/rigs/looks'
import { BOSS_BARKS } from '@/game/data/dialogs/bosses'
import { rainSpan, spearSpan, startAbility } from '@/game/sim/abilities'
import { botThink, setupRun } from '@/game/sim/bot'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import type { Sim } from '@/game/sim/world'
import type { Unit } from '@/game/sim/types'

/** The first boss's show (#136): arrows on the spot, spears down a lane, a whistle for gnomes. */

const def = ENEMY_BY_ID.banditChief!
const abil = (kind: string): number => def.abilities.findIndex(a => a.kind === kind && !a.charged)
const DT = 1 / 30

type Plan = ReturnType<typeof setupRun>['plan']

const arena = (): { sim: Sim; plan: Plan; boss: Unit; hero: Unit } => {
  const { sim, plan } = setupRun({ zone: 'plains', level: 2, cls: 'aegis', seed: 5 })
  const hero = sim.hero.unit
  const boss = spawnEnemy(sim, 'banditChief', hero.x + 6, hero.z)!
  boss.awake = true
  // Only the move under test: nothing else of the boss's is ready.
  boss.cds.fill(99)
  boss.attackCd = 99
  hero.shield = 0
  hero.hp = hero.s.maxHp
  sim.events.length = 0
  return { sim, plan, boss, hero }
}

/** Run `sec` seconds; `each` sees the clock after every step. */
const run = (sim: Sim, plan: Plan, sec: number, each: (t: number) => void): void => {
  for (let t = 0; t < sec; t += DT) {
    stepSim(sim, plan, DT)
    each(t + DT)
  }
}

describe('the plains finale boss has the three new moves (#136)', () => {
  it('the kit: arrow rain, spears in a lane, a whistle for gnomes - and the charged cone stays', () => {
    expect(ZONES.plains.finale.leader).toBe('banditChief')
    const kinds = def.abilities.map(a => a.kind)
    expect(kinds).toContain('rain')
    expect(kinds).toContain('spears')
    const whistle = def.abilities.find(a => a.kind === 'summon')!
    expect(whistle.spawn).toBe('gnome')
    expect(whistle.bark).toBe('whistle')
    expect(def.abilities.filter(a => a.charged)).toHaveLength(1)
    expect(def.abilities[0]!.charged).toBe(true)
  })

  it('the whistle has a bark line, and the gnome a look', () => {
    expect(BOSS_BARKS.some(b => b.id === 'bark.banditChief' && b.greet.some(g => g.id === 'whistle'))).toBe(true)
    expect(LOOKS.gnome).toBeTruthy()
    expect(ENEMY_BY_ID.gnome!.look).toBe('gnome')
  })

  it('every move has a wind-up of its own, and the damage per hit is small', () => {
    for (const k of ['rain', 'spears', 'summon']) {
      const a = def.abilities[abil(k)]!
      expect(a.windup, k).toBeGreaterThanOrEqual(0.8)
    }
    expect(def.abilities[abil('rain')]!.dmg).toBeLessThanOrEqual(0.5)
    expect(def.abilities[abil('spears')]!.dmg).toBeLessThanOrEqual(0.8)
  })
})

describe('arrow rain', () => {
  it('shows the circle first, then hits the ground it showed several times, small each', () => {
    const { sim, plan, boss, hero } = arena()
    const i = abil('rain')
    const a = def.abilities[i]!
    startAbility(sim, boss, a, i, hero)
    const tele = sim.events.find(e => e.t === 'tele')
    if (!tele || tele.t !== 'tele') throw new Error('no telegraph')
    expect(tele.tele.shape).toBe('circle')
    expect(tele.tele.r).toBe(a.r)
    expect(tele.tele.x).toBeCloseTo(hero.x, 5)
    // The warning stays down for the whole rain, past the last hit.
    expect(tele.tele.dur).toBeCloseTo(a.windup + rainSpan(a), 5)
    const hits: number[] = []
    let last = hero.hp
    run(sim, plan, a.windup + rainSpan(a) + 0.2, t => {
      if (hero.hp < last - 1e-6) hits.push(t)
      last = hero.hp
    })
    expect(hits.length).toBe(a.hits)
    expect(hits[0]!).toBeGreaterThanOrEqual(a.windup)
    for (let k = 1; k < hits.length; k++) expect(hits[k]! - hits[k - 1]!).toBeGreaterThan((a.gap ?? 0.5) - 0.1)
    expect(hero.hp).toBeGreaterThan(hero.s.maxHp * 0.3)
  })

  it('walking out of the circle takes no damage at all', () => {
    const { sim, plan, boss, hero } = arena()
    const i = abil('rain')
    const a = def.abilities[i]!
    startAbility(sim, boss, a, i, hero)
    hero.x += (a.r ?? 3) + 2
    hero.px = hero.x
    run(sim, plan, a.windup + rainSpan(a) + 0.2, () => {})
    expect(hero.hp).toBe(hero.s.maxHp)
  })
})

describe('spear throws', () => {
  it('lights a lane first, then throws spears down it one after another', () => {
    const { sim, plan, boss, hero } = arena()
    const i = abil('spears')
    const a = def.abilities[i]!
    hero.x = boss.x - 6
    hero.z = boss.z
    startAbility(sim, boss, a, i, hero)
    const tele = sim.events.find(e => e.t === 'tele')
    if (!tele || tele.t !== 'tele') throw new Error('no telegraph')
    expect(tele.tele.shape).toBe('line')
    expect(tele.tele.r).toBe(a.r)
    expect(tele.tele.w).toBe(a.w)
    expect(tele.tele.dur).toBeCloseTo(a.windup + spearSpan(a), 5)
    const hits: number[] = []
    let last = hero.hp
    run(sim, plan, a.windup + spearSpan(a) + 0.8, t => {
      if (hero.hp < last - 1e-6) hits.push(t)
      last = hero.hp
    })
    expect(hits.length).toBe(a.hits)
    expect(hits[0]!).toBeGreaterThan(a.windup)
    expect(hero.hp).toBeGreaterThan(hero.s.maxHp * 0.3)
  })

  it('a hero off the lane is missed', () => {
    const { sim, plan, boss, hero } = arena()
    const i = abil('spears')
    const a = def.abilities[i]!
    hero.x = boss.x - 6
    hero.z = boss.z
    startAbility(sim, boss, a, i, hero)
    hero.z += (a.w ?? 1) + 1.5
    hero.pz = hero.z
    run(sim, plan, a.windup + spearSpan(a) + 0.8, () => {})
    expect(hero.hp).toBe(hero.s.maxHp)
  })
})

describe('the whistle and the gnomes', () => {
  it('the whistle calls gnomes at the end of its wind-up and shouts once', () => {
    const { sim, plan, boss, hero } = arena()
    const i = abil('summon')
    const a = def.abilities[i]!
    startAbility(sim, boss, a, i, hero)
    expect(sim.events.filter(e => e.t === 'bark')).toHaveLength(1)
    expect(sim.units.filter(u => u.kind === 'gnome')).toHaveLength(0)
    run(sim, plan, a.windup + 0.2, () => {})
    const gnomes = sim.units.filter(u => u.kind === 'gnome' && u.alive)
    expect(gnomes).toHaveLength(a.count ?? 0)
    expect(gnomes.every(g => g.ownerId === boss.id)).toBe(true)
  })

  it('a gnome loses 10 % of its health every 0.5 s and is gone at 5 s', () => {
    expect(GNOME_FLEETING).toEqual({ life: 5, every: 0.5, pct: 0.1 })
    const { sim, plan, boss, hero } = arena()
    hero.x -= 40
    hero.px = hero.x
    const g = spawnEnemy(sim, 'gnome', boss.x + 12, boss.z, -1, boss)!
    g.targetId = 0
    expect(g.life).toBe(5)
    const max = g.s.maxHp
    const seen: Array<[number, number]> = []
    let n = 1
    run(sim, plan, 5.2, t => {
      if (t >= n * 0.5 + 0.05 && n <= 10) { seen.push([n * 0.5, g.hp / max]); n++ }
    })
    // Just after each half second, one more tenth is gone.
    for (const [t, f] of seen.slice(0, 9)) expect(f, `at ${t}s`).toBeCloseTo(1 - t * 0.2, 1)
    expect(g.alive).toBe(false)
  })

  it('a gnome is nearly harmless: little damage, no reward', () => {
    const gnome = ENEMY_BY_ID.gnome!
    expect(gnome.dmg).toBeLessThanOrEqual(0.35)
    expect(gnome.rank).toBe('weak')
    expect(gnome.fleeting).toBe(GNOME_FLEETING)
  })

  it('a hero who ignores them takes little from a whole whistle', () => {
    const { sim, plan, boss, hero } = arena()
    const i = abil('summon')
    startAbility(sim, boss, def.abilities[i]!, i, hero)
    run(sim, plan, 6.5, () => {})
    expect(sim.units.filter(u => u.kind === 'gnome' && u.alive)).toHaveLength(0)
    expect(hero.hp).toBeGreaterThan(hero.s.maxHp * 0.7)
  })
})

describe('the tutorial boss stays beatable (#136)', () => {
  const CLASSES = ['aegis', 'shadow', 'pyro', 'sovereign', 'chrono', 'blood', 'aether', 'geo'] as const
  const fight = (cls: (typeof CLASSES)[number]): { won: boolean; seconds: number; gnomes: number; rain: number; spears: number } => {
    const { sim, plan } = setupRun({ zone: 'plains', level: 2, cls, seed: 77 })
    let think = 0
    let gnomes = 0
    let rain = 0
    let spears = 0
    while (!sim.ended && sim.time < 300) {
      think -= DT
      if (think <= 0) { think = 0.2; botThink(sim) }
      stepSim(sim, plan, DT)
      for (const e of sim.events) {
        if (e.t === 'fx' && e.id === 'summon') gnomes++
        if (e.t === 'cast' && e.skill === 'enemy:rain') rain++
        if (e.t === 'cast' && e.skill === 'enemy:spears') spears++
      }
      sim.events.length = 0
    }
    return { won: sim.ended === 'victory', seconds: sim.time, gnomes, rain, spears }
  }

  it('the reference bot beats the plains at its level with every class, and meets the new moves on the way', () => {
    let moves = 0
    for (const cls of CLASSES) {
      const f = fight(cls)
      expect(f.won, cls).toBe(true)
      moves += f.gnomes + f.rain + f.spears
    }
    expect(moves).toBeGreaterThan(0)
  })
})
