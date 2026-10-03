import { describe, expect, it } from 'vitest'
import { BRANCH_MARGIN, fillGrid, generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { CELL, cellOf, createGrid, findPath, SOLID_TERRAIN, type Grid } from '@/game/sim/grid'
import { ZONES, ZONE_BRANCHES, ZONE_IDS } from '@/game/data/zones'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import type { ZoneId } from '@/game/data/items'
import { Sim, SIDE_GROUP } from '@/game/sim/world'
import { applyPlan, leaveVisit, populateZone } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { botThink, referenceBuild, runZone, setupRun } from '@/game/sim/bot'
import { kill } from '@/game/sim/combat'
import { openChest } from '@/game/sim/interact'
import { nextObjective, openBranches, zoneMastery } from '@/game/sim/route'

/**
 * Branching ways and their bosses (roadmap #70): a zone is a small graph, a
 * main road from the start to the finale with loops that fork off it and
 * rejoin it, and dead-end ways where a branch boss guards a gold chest. Every
 * promise the generator, the sim and the guidance API make about them.
 */

const SEEDS = [1, 2, 3, 5, 7, 11, 42, 77, 1234, 99991]

const gridOf = (plan: ZonePlan): Grid => fillGrid(createGrid(plan.w, plan.h), plan)
const path: number[] = []
const walk = (g: Grid, ax: number, az: number, bx: number, bz: number): boolean =>
  (cellOf(ax) === cellOf(bx) && cellOf(az) === cellOf(bz)) || findPath(g, ax, az, bx, bz, path) > 0

const everyPlan = (fn: (plan: ZonePlan, zone: ZoneId, tag: string) => void): void => {
  for (const zone of ZONE_IDS) for (const seed of SEEDS) fn(generateZone(ZONES[zone], seed), zone, `${zone}#${seed}`)
}

const visit = (zone: ZoneId, seed: number) => {
  const plan = generateZone(ZONES[zone], seed)
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: ZONES[zone].min, difficulty: 1, mode: 'zone', zone })
  applyPlan(sim, plan)
  const ref = referenceBuild({ level: ZONES[zone].min + 1, cls: 'aegis' })
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, zone, [])
  sim.events.length = 0
  return { sim, plan }
}

/** The main clearings, start first, finale last (the secret's pocket aside). */
const mains = (plan: ZonePlan) => plan.clearings.filter(c => c.role !== 'secret')

describe('the zone as a graph', () => {
  it('every zone but the tutorial has a loop (a second route to the finale) and a branch boss', () => {
    everyPlan((plan, zone, tag) => {
      const loops = plan.branches.filter(b => b.kind === 'loop')
      const bosses = plan.branches.filter(b => b.kind === 'boss')
      expect(loops.length, tag).toBeGreaterThanOrEqual(1)
      expect(loops.length, tag).toBeLessThanOrEqual(ZONE_BRANCHES[zone].bypasses[1])
      expect(bosses.length, tag).toBeGreaterThanOrEqual(1)
      expect(bosses.length, tag).toBeLessThanOrEqual(ZONE_BRANCHES[zone].bosses[1])
      expect(plan.w, tag).toBe(40 + 2 * BRANCH_MARGIN)
    })
  })

  it('the tutorial visit stays one road: no branch, no fork, no branch boss, the old width', () => {
    for (const seed of SEEDS) {
      const plan = generateZone(ZONES.plains, seed, { tutorial: true })
      expect(plan.branches).toEqual([])
      expect(plan.forks).toEqual([])
      expect(plan.optionalPacks).toEqual([])
      expect(plan.w).toBe(40)
    }
  })

  it('every branch can be walked to: its clearing, its pack, its chest, all along its way', () => {
    everyPlan((plan, _zone, tag) => {
      const g = gridOf(plan)
      for (const b of plan.branches) {
        const t = `${tag} ${b.kind} ${b.id}`
        expect(walk(g, plan.start.x, plan.start.z, b.x, b.z), t).toBe(true)
        const pack = plan.optionalPacks[b.pack]!
        expect(pack.branch, t).toBe(b.id)
        expect(walk(g, plan.start.x, plan.start.z, pack.x, pack.z), `${t} pack`).toBe(true)
        const c = plan.chests[b.chest]!
        expect(c.role, t).toBe(b.kind === 'boss' ? 'branch' : 'bypass')
        expect(c.guard, `${t} its pack guards its chest`).toBe(b.pack)
        expect(walk(g, plan.start.x, plan.start.z, c.sx, c.sz), `${t} chest`).toBe(true)
        // The whole way is open ground, bend to bend.
        for (let q = 1; q < b.way.length; q++) {
          const a = b.way[q - 1]!
          const e = b.way[q]!
          for (let s = 0; s <= 8; s++) {
            const x = a.x + ((e.x - a.x) * s) / 8
            const z = a.z + ((e.z - a.z) * s) / 8
            expect(g.solid[cellOf(z) * plan.w + cellOf(x)]! & SOLID_TERRAIN, `${t} way at ${x.toFixed(1)},${z.toFixed(1)}`).toBe(0)
          }
        }
      }
    })
  })

  it('forks really fork: a way leaves its clearing well off the road\'s line, past a signpost', () => {
    everyPlan((plan, _zone, tag) => {
      const cs = mains(plan)
      for (const b of plan.branches) {
        const from = cs[b.from]!
        const next = cs[b.from + 1]!
        const w0 = b.way[0]!
        const w1 = b.way[1]!
        const road = Math.atan2(next.z - from.z, next.x - from.x)
        const way = Math.atan2(w1.z - from.z, w1.x - from.x)
        let d = Math.abs(road - way)
        d = Math.min(d, Math.PI * 2 - d)
        expect(d, `${tag} ${b.kind} ${b.id} leaves along the road`).toBeGreaterThan(0.5)
        // It starts at its clearing's rim.
        expect(Math.hypot(w0.x - from.x, w0.z - from.z), tag).toBeLessThan(from.r)
        // Exactly one signpost, by the road's clearing, pointing down the way.
        const forks = plan.forks.filter(f => f.branch === b.id)
        expect(forks, tag).toHaveLength(1)
        const f = forks[0]!
        expect(f.boss, tag).toBe(b.kind === 'boss')
        expect(Math.hypot(f.x - from.x, f.z - from.z), tag).toBeLessThan(from.r + CELL)
        const ux = Math.sin(f.a)
        const uz = Math.cos(f.a)
        expect(ux * (w1.x - w0.x) + uz * (w1.z - w0.z), `${tag} the arm points down the way`).toBeGreaterThan(0)
      }
    })
  })

  it('a loop rejoins the road at a later clearing; a boss way dead-ends in its arena with a gold chest', () => {
    everyPlan((plan, _zone, tag) => {
      const cs = mains(plan)
      for (const b of plan.branches) {
        const end = b.way[b.way.length - 1]!
        if (b.kind === 'loop') {
          expect(b.to, tag).toBeGreaterThan(b.from)
          // The finale's arena keeps its one way in when there is a clearing before it.
          if (cs.length > 3) expect(b.to, tag).toBeLessThan(cs.length - 1)
          const to = cs[b.to]!
          expect(Math.hypot(end.x - to.x, end.z - to.z), tag).toBeLessThan(to.r)
          expect(plan.optionalPacks[b.pack]!.boss, tag).toBeUndefined()
        } else {
          expect(b.to, tag).toBe(-1)
          expect(Math.hypot(end.x - b.x, end.z - b.z), tag).toBeLessThan(1)
          const pack = plan.optionalPacks[b.pack]!
          const def = ENEMY_BY_ID[pack.boss!]!
          expect(pack.kinds[0], tag).toBe(pack.boss)
          expect(def.rank, tag).toBe('boss')
          expect(def.branch, tag).toBe(true)
          expect(plan.chests[b.chest]!.tier, tag).toBe('gold')
          // Its arena is its own: no main clearing within its reach.
          for (const c of cs) expect(Math.hypot(c.x - b.x, c.z - b.z), tag).toBeGreaterThan(c.r + b.r)
        }
      }
    })
  })

  it('the finale is reached by two routes: with the road cut beside a loop, the loop still gets there', () => {
    everyPlan((plan, zone, tag) => {
      const cs = mains(plan)
      const fin = cs[cs.length - 1]!
      const half = ZONE_BRANCHES[zone].half + 0.3
      const loops = plan.branches.filter(x => x.kind === 'loop')
      /** On a loop's way: within its half width of the polyline (cells). */
      const onWay = (i: number, j: number, l: (typeof loops)[number]): boolean => {
        for (let q = 1; q < l.way.length; q++) {
          const ax = l.way[q - 1]!.x / CELL - 0.5
          const az = l.way[q - 1]!.z / CELL - 0.5
          const bx = l.way[q]!.x / CELL - 0.5
          const bz = l.way[q]!.z / CELL - 0.5
          const t = Math.max(0, Math.min(1, ((i - ax) * (bx - ax) + (j - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2 || 1)))
          if (Math.hypot(i - ax - (bx - ax) * t, j - az - (bz - az) * t) <= half) return true
        }
        return false
      }
      for (const b of loops) {
        const g = gridOf(plan)
        // Wall off the whole map across the middle of the road's first leg
        // past the fork, all but the loops' own ways.
        const j0 = Math.round((cs[b.from]!.z + cs[b.from + 1]!.z) / 2 / CELL - 0.5)
        for (let j = j0 - 1; j <= j0 + 1; j++) {
          for (let i = 0; i < plan.w; i++) if (!loops.some(l => onWay(i, j, l))) g.solid[j * plan.w + i] = SOLID_TERRAIN
        }
        expect(walk(g, plan.start.x, plan.start.z, fin.x, fin.z), `${tag} loop ${b.id}`).toBe(true)
        // And the cut is real: with the loops' ways walled up too, the finale is out of reach.
        for (let j = j0 - 1; j <= j0 + 1; j++) for (let i = 0; i < plan.w; i++) g.solid[j * plan.w + i] = SOLID_TERRAIN
        expect(walk(g, plan.start.x, plan.start.z, fin.x, fin.z), `${tag} loop ${b.id}: the road was not cut`).toBe(false)
      }
    })
  })

  it('the road stays the short way: the walk from a loop\'s fork to its rejoin never takes the loop', () => {
    everyPlan((plan, _zone, tag) => {
      const cs = mains(plan)
      const g = gridOf(plan)
      for (const b of plan.branches.filter(x => x.kind === 'loop')) {
        const a = cs[b.from]!
        const e = cs[b.to]!
        const n = findPath(g, a.x, a.z, e.x, e.z, path)
        expect(n, tag).toBeGreaterThan(0)
        // Every leg of the walk (waypoints are x, z pairs), sampled along.
        let px = a.x
        let pz = a.z
        for (let q = 0; q < n; q += 2) {
          for (let s = 0; s <= 6; s++) {
            const x = px + ((path[q]! - px) * s) / 6
            const z = pz + ((path[q + 1]! - pz) * s) / 6
            expect(Math.hypot(x - b.x, z - b.z), `${tag} loop ${b.id}`).toBeGreaterThan(b.r)
          }
          px = path[q]!
          pz = path[q + 1]!
        }
      }
    })
  })

  it('is the same plan for the same seed, and another layout for another seed', () => {
    for (const zone of ZONE_IDS) {
      const a = generateZone(ZONES[zone], 42)
      const b = generateZone(ZONES[zone], 42)
      expect(b.branches).toEqual(a.branches)
      expect(b.forks).toEqual(a.forks)
      expect(Array.from(b.solid)).toEqual(Array.from(a.solid))
      expect(Array.from(b.cave)).toEqual(Array.from(a.cave))
      const shapes = new Set(SEEDS.map(s => JSON.stringify(generateZone(ZONES[zone], s).branches.map(x => [x.kind, x.from, x.to, Math.round(x.x)]))))
      expect(shapes.size, zone).toBeGreaterThan(SEEDS.length / 2)
    }
  })

  it('keeps each zone\'s character: tunnels in the mines and hollows, zigzags up the peak', () => {
    for (const seed of SEEDS) {
      for (const zone of ['mines', 'hollows'] as const) {
        const plan = generateZone(ZONES[zone], seed)
        for (const b of plan.branches) {
          expect(b.style).toBe('tunnel')
          expect(plan.cave[cellOf(b.z) * plan.w + cellOf(b.x)], `${zone}#${seed}`).toBe(1)
        }
      }
      for (const b of generateZone(ZONES.peak, seed).branches) expect(b.way.length, `peak#${seed}`).toBeGreaterThan(b.kind === 'loop' ? 3 : 2)
      for (const b of generateZone(ZONES.plains, seed).branches) expect(b.style).toBe('wide')
    }
  })
})

describe('branch bosses and packs in play', () => {
  it('nobody stands in the way of a signpost when the packs spawn', () => {
    for (const zone of ZONE_IDS) {
      for (const seed of SEEDS.slice(0, 4)) {
        const { sim, plan } = visit(zone, seed)
        for (const f of plan.forks) {
          for (const u of sim.units) {
            if (u.team !== 1) continue
            expect(Math.hypot(u.x - f.x, u.z - f.z), `${zone}#${seed} ${u.kind} on a signpost`).toBeGreaterThan(u.r + 0.75)
          }
        }
      }
    }
  })

  it('a branch boss is a boss (its plate, its sting) that decides nothing: the main chain alone wins', () => {
    const { sim, plan } = visit('woods', 5)
    const boss = sim.branches.find(b => b.kind === 'boss')!
    const g = sim.groupById(boss.group)!
    expect(g.id).toBeGreaterThanOrEqual(SIDE_GROUP)
    expect(g.boss).toBe(plan.optionalPacks[plan.branches[boss.id]!.pack]!.boss)
    const leader = sim.get(g.members[0]!)!
    expect(leader.rank).toBe('boss')
    expect(leader.kind).toBe(g.boss)
    // Woken, it announces itself like a boss.
    sim.hero.unit.x = leader.x
    sim.hero.unit.z = leader.z + 3
    const woke: string[] = []
    for (let t = 0; t < 1; t += 1 / 30) {
      stepSim(sim, plan, 1 / 30)
      for (const e of sim.events) if (e.t === 'awake') woke.push(e.boss)
      sim.events.length = 0
    }
    expect(woke).toContain(g.boss)
    // The main chain falls: the visit is won with the branch boss standing.
    for (const m of sim.groups) for (const id of m.members) kill(sim, sim.get(id)!, sim.hero.unit)
    stepSim(sim, plan, 1 / 30)
    expect(sim.ended).toBe('victory')
    expect(leader.alive).toBe(true)
    expect(g.cleared).toBe(false)
  })

  it('a branch boss pays like an elite and leaves the finale\'s promised drop alone; its chest unlocks when its pack falls', () => {
    const { sim, plan } = visit('woods', 5)
    sim.dropTable.boss = ['__finaleOnly']
    sim.dropTable.mob = []
    const b = sim.branches.find(x => x.kind === 'boss')!
    const g = sim.groupById(b.group)!
    const chest = sim.chests.find(c => c.id === b.chest)!
    for (const id of g.members) kill(sim, sim.get(id)!, sim.hero.unit)
    expect(sim.hero.items).not.toContain('__finaleOnly')
    stepSim(sim, plan, 1 / 30)
    expect(g.cleared).toBe(true)
    expect(chest.state).toBe('closed')
    openChest(sim, chest)
    expect(chest.state).not.toBe('closed')
  })

  it('the reference player walks the road past every branch and never wakes one', () => {
    for (const [zone, seed] of [['woods', 77], ['mines', 5], ['peak', 11], ['plains', 3]] as const) {
      const { sim, plan } = setupRun({ zone, level: ZONES[zone].min + 1, cls: 'aegis', seed })
      let think = 0
      while (!sim.ended && sim.time < 420) {
        think -= 1 / 30
        if (think <= 0) { think = 0.2; botThink(sim) }
        stepSim(sim, plan, 1 / 30)
        sim.events.length = 0
      }
      expect(sim.ended, `${zone}#${seed}`).toBe('victory')
      for (const b of sim.branches) expect(sim.groupById(b.group)!.awake, `${zone}#${seed} branch ${b.id}`).toBe(false)
    }
  })

  it('the explorer clears the branches before the finale and masters more of the zone', () => {
    const main = runZone({ zone: 'outskirts', level: 10, cls: 'aegis', seed: 77 })
    const full = runZone({ zone: 'outskirts', level: 10, cls: 'aegis', seed: 77, explore: true, maxSeconds: 900 })
    expect(main.outcome).toBe('victory')
    expect(full.outcome).toBe('victory')
    expect(main.mastery.bosses).toBe(1)
    expect(main.mastery.chests).toBe(0)
    expect(full.mastery.bosses).toBe(full.mastery.bossesTotal)
    expect(full.mastery.chests).toBeGreaterThan(0)
    expect(full.xp).toBeGreaterThan(main.xp)
    expect(full.seconds).toBeGreaterThan(main.seconds)
    expect(full.seconds).toBeLessThan(420)
  })
})

describe('guidance: the next objective and the branches on offer', () => {
  it('points down the main road, pack by pack, to the boss, the chest and the way out', () => {
    const { sim, plan } = visit('woods', 5)
    let o = nextObjective(sim)
    expect(o).toMatchObject({ kind: 'pack', group: 0, x: sim.groups[0]!.x, z: sim.groups[0]!.z })
    for (const id of sim.groups[0]!.members) kill(sim, sim.get(id)!, sim.hero.unit)
    stepSim(sim, plan, 1 / 30)
    expect(nextObjective(sim).group).toBe(1)
    for (const g of sim.groups.slice(0, -1)) for (const id of g.members) kill(sim, sim.get(id)!, sim.hero.unit)
    stepSim(sim, plan, 1 / 30)
    o = nextObjective(sim)
    const fin = sim.groups[sim.groups.length - 1]!
    expect(o.kind).toBe(fin.boss ? 'boss' : 'pack')
    expect(o.group).toBe(fin.id)
    for (const id of fin.members) kill(sim, sim.get(id)!, sim.hero.unit)
    stepSim(sim, plan, 1 / 30)
    expect(sim.ended).toBe('victory')
    const c = sim.chests.find(x => x.role === 'finale')!
    expect(nextObjective(sim)).toMatchObject({ kind: 'chest', chest: c.id })
    openChest(sim, c)
    expect(nextObjective(sim).kind).toBe('exit')
    leaveVisit(sim)
    expect(nextObjective(sim).kind).toBe('none')
  })

  it('offers the branches nearest first until each is cleared and its chest opened', () => {
    const { sim, plan } = visit('woods', 5)
    const all = openBranches(sim)
    expect(all.length).toBe(sim.branches.length)
    for (let q = 1; q < all.length; q++) expect(all[q]!.d).toBeGreaterThanOrEqual(all[q - 1]!.d)
    expect(all.every(o => o.guarded && o.chestShut)).toBe(true)
    const b = all[0]!.branch
    for (const id of sim.groupById(b.group)!.members) kill(sim, sim.get(id)!, sim.hero.unit)
    stepSim(sim, plan, 1 / 30)
    expect(openBranches(sim).find(o => o.branch.id === b.id)).toMatchObject({ guarded: false, chestShut: true })
    openChest(sim, sim.chests.find(c => c.id === b.chest)!)
    expect(openBranches(sim).some(o => o.branch.id === b.id)).toBe(false)
  })

  it('counts mastery: every boss of the visit (branch and finale) and every chest', () => {
    const { sim, plan } = visit('woods', 5)
    const m0 = zoneMastery(sim)
    expect(m0.bosses).toBe(0)
    expect(m0.bossesTotal).toBe(1 + sim.branches.filter(b => b.kind === 'boss').length)
    expect(m0.chestsTotal).toBe(sim.chests.length)
    const b = sim.branches.find(x => x.kind === 'boss')!
    for (const id of sim.groupById(b.group)!.members) kill(sim, sim.get(id)!, sim.hero.unit)
    stepSim(sim, plan, 1 / 30)
    openChest(sim, sim.chests.find(c => c.id === b.chest)!)
    expect(zoneMastery(sim)).toMatchObject({ bosses: 1, chests: 1 })
  })
})
