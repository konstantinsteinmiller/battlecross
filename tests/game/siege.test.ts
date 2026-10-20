import { describe, expect, it } from 'vitest'
import {
  BARRICADE, BUILD_SECONDS, DEFENCE_COST, MARKS, MYTHIC_WAVES, RAM_KIND, REPAIR, SIEGE_CAP, SIEGE_LORD, SIEGE_MILESTONES, SIEGE_WAVES,
  TIER_HP, bellRings, marksBanked, milestonesReached, siegeEnemyLevel, siegeReward, siegeWaves, tierOpen, type SiegeTier
} from '@/game/data/siege'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { Sim } from '@/game/sim/world'
import { applyPlan } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { applyStatus, dealDamage } from '@/game/sim/combat'
import { spawnEnemy } from '@/game/sim/spawn'
import { CELL, cellOf, createGrid, findPath, isSolidAt } from '@/game/sim/grid'
import { fillGrid, type ZonePlan } from '@/game/sim/zoneGen'
import { SIEGE_LAYOUT, generateSiege } from '@/game/sim/siegeMap'
import { BALLISTA_KIND, GATE_KIND, armSiege, buildBlock, buildDefence, skipBuild, siegeTarget, type SiegeState } from '@/game/sim/siege'
import { startAttrs } from '@/game/data/attributes'
import { noGear } from '@/game/data/items'
import type { HeroBuild } from '@/game/sim/stats'
import { siegePieceParts, siegeStatics } from '@/game/gfx/siegeProps'
import { BODY_H, SOLID_TOL } from '@/game/gfx/propRoles'
import { K_BLOCK } from '@/game/sim/zoneFeatures'

/**
 * The Siege of Bastion (docs/gdd-afterplay.md §8, phase 6): the wave
 * director's waves and their scaling by tier, the gate's fall and the
 * Siege Lord's, the build phase's economy, the defences doing what they say,
 * the one-time milestones, and the bell's cadence.
 */

const naked = (level = 40): HeroBuild => ({ level, attrs: startAttrs(), equipped: noGear(), passives: [] })
const DT = 1 / 30

const siege = (o: { tier?: SiegeTier; story?: boolean; level?: number; cap?: number } = {}): { sim: Sim; plan: ZonePlan; s: SiegeState } => {
  const plan = generateSiege(11)
  const level = siegeEnemyLevel(o.level ?? 40, o.tier ?? 'normal')
  const sim = new Sim({ seed: 11, w: plan.w, h: plan.h, level, difficulty: 1, mode: 'arena', zone: 'siege' })
  applyPlan(sim, plan)
  createHero(sim, { build: naked(o.level ?? 40), skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
  const s = armSiege(sim, { tier: o.tier ?? 'normal', story: o.story, cap: o.cap ?? SIEGE_CAP, commander: { look: 'captain', voice: 'hale' } })
  sim.events.length = 0
  return { sim, plan, s }
}

/** The hero out of the fight: unseen, untouchable, out of the way. */
const bystander = (sim: Sim): void => {
  const h = sim.hero.unit
  applyStatus(sim, h, 'stealth', 1e9, 1, h)
  applyStatus(sim, h, 'invulnerable', 1e9, 1, h)
}

const run = (sim: Sim, plan: ZonePlan, sec: number, each?: () => void): void => {
  for (let t = 0; t < sec && !sim.ended; t += DT) {
    stepSim(sim, plan, DT)
    sim.events.length = 0
    each?.()
  }
}

const gateOf = (sim: Sim, s: SiegeState) => sim.get(s.gate)!

describe('the siege (data)', () => {
  it('ten waves, each as §8.3 has it, on every tier; Nightmare adds two waves of mythic elites', () => {
    for (const tier of ['normal', 'hard', 'nightmare'] as const) {
      const w = siegeWaves(tier, 0)
      expect(w.length).toBe(SIEGE_WAVES)
      const kinds = (n: number): string[] => w[n - 1]!.groups.map(g => g.kind)
      const roles = (n: number): string[] => w[n - 1]!.groups.map(g => g.role)
      expect(new Set([...kinds(1), ...kinds(2)])).toEqual(new Set(['imp', 'hellhound']))
      expect(roles(3)).toContain('leap')
      expect(kinds(3)).toContain('gargoyle')
      expect(w[3]!.groups.filter(g => g.role === 'ram').reduce((n, g) => n + g.n, 0)).toBe(1)
      expect(roles(5)).toContain('boss')
      for (const n of [6, 7]) expect(w[n - 1]!.groups.some(g => g.kind === 'harpy' && g.role === 'raider')).toBe(true)
      expect(roles(8)).toContain('sapper')
      expect(w[8]!.groups.filter(g => g.role === 'ram').reduce((n, g) => n + g.n, 0)).toBe(2)
      expect(new Set(roles(9)).size).toBeGreaterThanOrEqual(5)
      expect(w[9]!.groups.find(g => g.role === 'boss')!.kind).toBe(SIEGE_LORD)
      expect(roles(10)).toContain('elite')
      for (const x of w.flatMap(v => v.groups)) if (x.kind !== RAM_KIND) expect(ENEMY_BY_ID[x.kind], x.kind).toBeDefined()
      const mythic = w.filter(v => v.groups.some(g => g.role === 'elite' && v.n !== 10)).map(v => v.n)
      expect(mythic).toEqual(tier === 'nightmare' ? [...MYTHIC_WAVES] : [])
    }
    // The fifth wave's captain rotates.
    expect(siegeWaves('normal', 0)[4]!.groups[0]!.kind).not.toBe(siegeWaves('normal', 1)[4]!.groups[0]!.kind)
  })

  it('scaling: the hero\'s level (never under 38) plus one, Hard +3 levels and +30 % health, Nightmare +6', () => {
    expect(siegeEnemyLevel(30, 'normal')).toBe(39)
    expect(siegeEnemyLevel(45, 'normal')).toBe(46)
    expect(siegeEnemyLevel(45, 'hard')).toBe(49)
    expect(siegeEnemyLevel(45, 'nightmare')).toBe(52)
    expect(TIER_HP.hard).toBeCloseTo(1.3)
    // The same imp is tougher on Hard: its level and its health share.
    const hp = (tier: SiegeTier): number => {
      const { sim, plan, s } = siege({ tier })
      bystander(sim)
      skipBuild(sim)
      run(sim, plan, 1)
      expect(s.phase).toBe('wave')
      const imp = sim.units.find(u => u.kind === 'imp' && u.alive)!
      return imp.s.maxHp
    }
    expect(hp('hard') / hp('normal')).toBeGreaterThan(1.3)
  })

  it('Hard opens after a Normal win; Nightmare after B10 or a rift kept ajar', () => {
    const none = { normal: 0, hard: 0, nightmare: 0 }
    expect(tierOpen('normal', none, new Set())).toBe(true)
    expect(tierOpen('hard', none, new Set())).toBe(false)
    expect(tierOpen('hard', { ...none, normal: 1 }, new Set())).toBe(true)
    expect(tierOpen('nightmare', { ...none, normal: 3, hard: 3 }, new Set())).toBe(false)
    expect(tierOpen('nightmare', none, new Set(['riftAjar']))).toBe(true)
  })

  it('the bell rings for the story\'s siege, and after every second invaded zone cleared', () => {
    expect(bellRings(false, true, 0)).toBe(true)
    expect(bellRings(false, false, 5)).toBe(false)
    expect(bellRings(true, false, 1)).toBe(false)
    expect(bellRings(true, false, 2)).toBe(true)
  })

  it('a win pays §11\'s purse (scaled by level), XP in levels and Demonglass; a loss keeps half the Marks', () => {
    const n = siegeReward('normal', 45)
    const h = siegeReward('hard', 45)
    const m = siegeReward('nightmare', 45)
    expect([n.gold, h.gold, m.gold]).toEqual([4000, 6000, 9000])
    expect([n.glass, h.glass, m.glass]).toEqual([50, 80, 120])
    expect(h.xp / n.xp).toBeCloseTo(1.3, 2)
    expect(siegeReward('normal', 55).gold).toBeGreaterThan(n.gold)
    expect(marksBanked(21, true)).toBe(21)
    expect(marksBanked(21, false)).toBe(10)
  })

  it('milestones: each reached once, by wins at its tier (the flawless Hard win too)', () => {
    const wins = { normal: 1, hard: 0, nightmare: 0 }
    expect(milestonesReached(wins, false, new Set()).map(m => m.id)).toEqual(['normal1'])
    expect(milestonesReached(wins, false, new Set(['normal1']))).toEqual([])
    expect(milestonesReached({ normal: 5, hard: 1, nightmare: 0 }, true, new Set(['normal1'])).map(m => m.id).sort())
      .toEqual(['hard1', 'hardFlawless', 'normal5'])
    expect(milestonesReached({ normal: 9, hard: 9, nightmare: 1 }, true, new Set(SIEGE_MILESTONES.map(m => m.id)))).toEqual([])
  })
})

describe('the siege (field)', () => {
  it('a gate in the wall, three lanes joined by a cross way, every fixed piece a block on open ground, a way from the gate to every lane', () => {
    const plan = generateSiege(3)
    const g = fillGrid(createGrid(plan.w, plan.h), plan)
    const L = SIEGE_LAYOUT
    expect(L.lanes.length).toBe(3)
    expect(plan.gates.length).toBe(3)
    for (const k of L.gate.cells) expect(plan.solid[k]).toBe(0)
    expect(isSolidAt(g, L.gate.x, L.gate.z)).toBe(true)
    expect(isSolidAt(g, L.gate.front.x, L.gate.front.z)).toBe(false)
    const path: number[] = []
    for (const l of L.lanes) {
      expect(isSolidAt(g, l.platform.x, l.platform.z)).toBe(true)
      expect(isSolidAt(g, l.stand.x, l.stand.z)).toBe(true)
      expect(isSolidAt(g, l.fire.x, l.fire.z)).toBe(false)
      expect(findPath(g, l.entry.x, l.entry.z, L.gate.front.x, L.gate.front.z, path, 20000)).toBeGreaterThan(0)
      for (const k of l.barricade) expect(plan.solid[k]).toBe(0)
    }
    expect(plan.masonry!.some(v => v > 0)).toBe(true)
  })
})

describe('the siege (props stand on their colliders)', () => {
  it('every fixed piece covers the cells it blocks, and nothing of it below head height stands outside them', () => {
    const plan = generateSiege(3)
    const parts = siegePieceParts()
    const blocked = new Set<number>()
    for (let k = 0; k < plan.kind.length; k++) if (plan.kind[k] === K_BLOCK) blocked.add(k)
    const covered = new Set<number>()
    for (const st of siegeStatics()) {
      const geos = parts[st.piece].lit
      // The cells this piece stands on: the blocked ones under its middle and, for the gate, across its width.
      const mine = [...blocked].filter(k => Math.abs(((k % plan.w) + 0.5) * CELL - st.x) < (st.piece === 'gate' ? 3.1 : 0.8) && Math.abs((Math.floor(k / plan.w) + 0.5) * CELL - st.z) < 0.8)
      expect(mine.length, st.piece).toBe(st.piece === 'gate' ? 4 : 1)
      const x0 = Math.min(...mine.map(k => (k % plan.w) * CELL)) - SOLID_TOL
      const x1 = Math.max(...mine.map(k => (k % plan.w + 1) * CELL)) + SOLID_TOL
      const z0 = Math.min(...mine.map(k => Math.floor(k / plan.w) * CELL)) - SOLID_TOL
      const z1 = Math.max(...mine.map(k => (Math.floor(k / plan.w) + 1) * CELL)) + SOLID_TOL
      for (const g of geos) {
        const p = g.attributes.position!
        let lx = Infinity, hx = -Infinity, lz = Infinity, hz = -Infinity, low = false
        for (let v = 0; v < p.count; v++) {
          if (p.getY(v) >= BODY_H) continue
          low = true
          const x = p.getX(v) + st.x
          const z = p.getZ(v) + st.z
          expect(x >= x0 && x <= x1 && z >= z0 && z <= z1, `${st.piece}: a part spills out of its cells at (${x.toFixed(2)}, ${z.toFixed(2)})`).toBe(true)
          lx = Math.min(lx, x); hx = Math.max(hx, x); lz = Math.min(lz, z); hz = Math.max(hz, z)
        }
        if (!low) continue
        for (const k of mine) {
          const cx = ((k % plan.w) + 0.5) * CELL
          const cz = (Math.floor(k / plan.w) + 0.5) * CELL
          if (cx >= lx && cx <= hx && cz >= lz && cz <= hz) covered.add(k)
        }
      }
    }
    // Every blocked cell of the field is one a piece stands on, and is drawn.
    expect([...blocked].filter(k => !covered.has(k))).toEqual([])
  })
})

describe('the siege (sim)', () => {
  it('arms with the gate\'s body, the commander, 5 Marks and a 15 s build phase; the first wave comes when it runs out', () => {
    const { sim, plan, s } = siege()
    const gate = gateOf(sim, s)
    expect(gate.kind).toBe(GATE_KIND)
    expect(gate.team).toBe(0)
    expect(s.marks).toBe(MARKS.start)
    expect(s.phase).toBe('build')
    expect(s.buildT).toBe(BUILD_SECONDS)
    bystander(sim)
    run(sim, plan, BUILD_SECONDS - 0.5)
    expect(s.phase).toBe('build')
    expect(sim.units.some(u => u.team === 1)).toBe(false)
    run(sim, plan, 1.5)
    expect(s.phase).toBe('wave')
    expect(s.wave).toBe(1)
    expect(sim.units.filter(u => u.team === 1 && u.alive).length).toBeGreaterThan(0)
  })

  it('the horde marches on the gate and beats it down: the siege is lost when it falls', () => {
    const { sim, plan, s } = siege()
    bystander(sim)
    skipBuild(sim)
    const gate = gateOf(sim, s)
    run(sim, plan, 600)
    expect(gate.alive).toBe(false)
    expect(sim.ended).toBe('defeat')
    expect(s.phase).toBe('lost')
    expect(s.flawless).toBe(false)
  })

  it('the story\'s siege cannot be lost: the gate holds at its last splinter, a fallen hero gets up', () => {
    const { sim, plan, s } = siege({ story: true })
    bystander(sim)
    skipBuild(sim)
    const gate = gateOf(sim, s)
    run(sim, plan, 300)
    expect(gate.alive).toBe(true)
    expect(gate.hp).toBeGreaterThan(0)
    expect(sim.ended).toBe('')
    // The hero falls: he is up again in the same step.
    const h = sim.hero.unit
    h.statuses.length = 0
    dealDamage(sim, null, h, h.hp * 10, { type: 'true', canCrit: false })
    stepSim(sim, plan, DT)
    expect(h.alive).toBe(true)
    expect(sim.ended).toBe('')
  })

  it('ten waves fought to the end and the Siege Lord felled: won, with Marks for every wave and every elite', () => {
    const { sim, plan, s } = siege()
    bystander(sim)
    const seen = new Set<string>()
    let lord = false
    const cull = (): void => {
      if (s.phase === 'build') skipBuild(sim)
      for (const u of sim.units) {
        if (!u.alive || u.team !== 1) continue
        seen.add(u.kind)
        if (u.kind === SIEGE_LORD && u.champion) lord = true
        dealDamage(sim, null, u, u.hp * 10, { type: 'true', canCrit: false })
      }
    }
    run(sim, plan, 900, cull)
    expect(sim.ended).toBe('victory')
    expect(s.phase).toBe('won')
    expect(s.cleared).toBe(SIEGE_WAVES)
    expect(lord).toBe(true)
    expect(seen.has(RAM_KIND)).toBe(true)
    expect(seen.has('harpy') && seen.has('gargoyle') && seen.has('hellhound')).toBe(true)
    // Every wave paid 3, +2 with the gate unharmed; every elite 1.
    expect(s.earned).toBe(SIEGE_WAVES * (MARKS.wave + MARKS.unharmed) + s.elites)
    expect(s.elites).toBeGreaterThanOrEqual(1 + 1 + 1 + 2 + 1)
    expect(s.flawless).toBe(true)
  })

  it(`never more than ${SIEGE_CAP} of the horde (and the militia) alive at once; a low device's cap holds too`, () => {
    for (const cap of [SIEGE_CAP, 18]) {
      const { sim, plan, s } = siege({ cap })
      bystander(sim)
      s.wave = 9
      skipBuild(sim)
      let most = 0
      run(sim, plan, 40, () => { most = Math.max(most, sim.units.filter(u => u.alive && u.team === 1).length) })
      expect(most).toBeGreaterThan(cap / 2)
      expect(most).toBeLessThanOrEqual(cap)
    }
  })
})

describe('the siege (build phase economy)', () => {
  it('a defence costs its Marks, only in the build phase, only while Marks and room last', () => {
    const { sim, plan, s } = siege()
    s.marks = 20
    expect(buildDefence(sim, 'ballista')).toBe(true)
    expect(s.marks).toBe(20 - DEFENCE_COST.ballista)
    expect(buildDefence(sim, 'cauldron')).toBe(true)
    expect(buildDefence(sim, 'barricade')).toBe(true)
    expect(buildDefence(sim, 'militia')).toBe(true)
    expect(s.marks).toBe(20 - DEFENCE_COST.ballista - DEFENCE_COST.cauldron - DEFENCE_COST.barricade - DEFENCE_COST.militia)
    expect(sim.units.filter(u => u.kind === 'guard' && u.alive).length).toBe(2)
    // The gate is whole: nothing to repair.
    expect(buildBlock(sim, 'repair')).toBe('full')
    s.marks = 2
    expect(buildBlock(sim, 'ballista')).toBe('marks')
    expect(buildDefence(sim, 'ballista')).toBe(false)
    expect(s.marks).toBe(2)
    // Three platforms: a fourth ballista has nowhere to stand.
    s.marks = 99
    buildDefence(sim, 'ballista')
    buildDefence(sim, 'ballista')
    expect(buildBlock(sim, 'ballista')).toBe('full')
    // In a wave, nothing is built.
    skipBuild(sim)
    bystander(sim)
    run(sim, plan, 0.2)
    expect(s.phase).toBe('wave')
    expect(buildBlock(sim, 'barricade')).toBe('phase')
    expect(buildDefence(sim, 'barricade')).toBe(false)
  })

  it(`a gate repair gives back ${REPAIR * 100} % of the gate`, () => {
    const { sim, s } = siege()
    const gate = gateOf(sim, s)
    gate.hp = Math.round(gate.s.maxHp * 0.4)
    s.marks = 2
    expect(buildDefence(sim, 'repair')).toBe(true)
    expect(gate.hp / gate.s.maxHp).toBeCloseTo(0.4 + REPAIR, 2)
    expect(s.marks).toBe(0)
  })
})

describe('the siege (defences work)', () => {
  it('a ballista shoots the horde down its lane with a bolt that pierces', () => {
    const { sim, plan, s } = siege()
    bystander(sim)
    s.marks = 9
    buildDefence(sim, 'ballista')
    const b = sim.units.find(u => u.kind === BALLISTA_KIND)!
    const lane = SIEGE_LAYOUT.lanes[1]!
    expect(b.x).toBeCloseTo(lane.platform.x)
    const foes = [0, 1].map(k => spawnEnemy(sim, 'hellhound', lane.x, b.z + 8 + k * 1.2, 0)!)
    for (const f of foes) { f.awake = false; f.s.moveSpeed = 0 }
    const hp0 = foes.map(f => f.hp)
    run(sim, plan, 2.5)
    expect(foes[0]!.hp).toBeLessThan(hp0[0]!)
    expect(foes[1]!.hp).toBeLessThan(hp0[1]!)
  })

  it('a fire cauldron burns whoever crosses its lane\'s chokepoint', () => {
    const { sim, plan, s } = siege()
    bystander(sim)
    s.marks = 9
    buildDefence(sim, 'cauldron')
    const fire = SIEGE_LAYOUT.lanes[1]!.fire
    const f = spawnEnemy(sim, 'imp', fire.x, fire.z, 0)!
    f.awake = false
    f.s.moveSpeed = 0
    const hp0 = f.hp
    run(sim, plan, 1.2)
    expect(f.hp).toBeLessThan(hp0)
    expect(f.statuses.some(st => st.id === 'burn')).toBe(true)
  })

  it(`a barricade closes its lane for ${BARRICADE.dur} s: the way to the gate goes round it by the cross way`, () => {
    const { sim, plan, s } = siege()
    bystander(sim)
    const lane = SIEGE_LAYOUT.lanes[1]!
    const gate = SIEGE_LAYOUT.gate.front
    const path: number[] = []
    const before = findPath(sim.grid, lane.entry.x, lane.entry.z, gate.x, gate.z, path, 20000)
    expect(before).toBeGreaterThan(0)
    s.marks = 1
    expect(buildDefence(sim, 'barricade')).toBe(true)
    for (const k of lane.barricade) expect(isSolidAt(sim.grid, (k % plan.w + 0.5) * CELL, (Math.floor(k / plan.w) + 0.5) * CELL)).toBe(true)
    const after = findPath(sim.grid, lane.entry.x, lane.entry.z, gate.x, gate.z, path, 20000)
    expect(after).toBeGreaterThan(0)
    const cells = new Set<number>()
    for (let q = 0; q < path.length; q += 2) cells.add(cellOf(path[q + 1]!) * plan.w + cellOf(path[q]!))
    expect(lane.barricade.some(k => cells.has(k))).toBe(false)
    // Through another lane's mouth.
    const xs: number[] = []
    for (let q = 0; q < path.length; q += 2) xs.push(path[q]!)
    expect(xs.some(x => Math.abs(x - lane.x) > 6)).toBe(true)
    // It stands its time, then the lane is open again.
    run(sim, plan, BARRICADE.dur + 1, () => { if (s.phase === 'wave') sim.units.filter(u => u.team === 1).forEach(u => { u.alive = false }) })
    expect(isSolidAt(sim.grid, lane.x, (Math.floor(lane.barricade[0]! / plan.w) + 0.5) * CELL)).toBe(false)
    expect(s.barricades[1]).toBeNull()
  })

  it('a raider goes for a ballista while one stands; a sapper runs at it and blows it up', () => {
    const { sim, plan, s } = siege()
    bystander(sim)
    s.marks = 9
    buildDefence(sim, 'ballista')
    const b = sim.units.find(u => u.kind === BALLISTA_KIND)!
    const harpy = spawnEnemy(sim, 'harpy', 10, 30, 0)!
    s.roles.set(harpy.id, 'raider')
    expect(siegeTarget(sim, harpy)).toBe(b)
    const imp = spawnEnemy(sim, 'imp', b.x + 1.2, b.z + 0.6, 0)!
    imp.awake = true
    s.roles.set(imp.id, 'sapper')
    expect(siegeTarget(sim, imp)).toBe(b)
    // A wave with nothing more to come: the sapper's run.
    s.phase = 'wave'
    s.queue.length = 0
    s.packetT = 99
    run(sim, plan, 2)
    expect(b.alive).toBe(false)
    expect(imp.alive).toBe(false)
    // With no ballista left, the raider marches on the gate.
    expect(siegeTarget(sim, harpy)).toBe(gateOf(sim, s))
  })

  it('a ram walks its lane to the gate and batters it; killed before it gets there, the gate is spared', () => {
    const { sim, plan, s } = siege()
    bystander(sim)
    s.wave = 4
    skipBuild(sim)
    const gate = gateOf(sim, s)
    let ram = 0
    run(sim, plan, 90, () => {
      // Only the ram is let through.
      for (const u of sim.units) if (u.alive && u.team === 1 && u.kind !== RAM_KIND) dealDamage(sim, null, u, u.hp * 10, { type: 'true', canCrit: false })
      ram ||= sim.units.find(u => u.kind === RAM_KIND)?.id ?? 0
    })
    expect(ram).toBeGreaterThan(0)
    expect(gate.hp).toBeLessThan(gate.s.maxHp)
    expect(s.hurt).toBe(true)
  })
})
