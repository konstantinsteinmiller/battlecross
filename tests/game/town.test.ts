import { describe, expect, it } from 'vitest'
import { generateTown, fillGrid, type ZonePlan } from '@/game/sim/zoneGen'
import { CELL, cellOf, createGrid, findPath, isSolidAt, type Grid } from '@/game/sim/grid'
import { TOWNS, townNpcs, type TownId } from '@/game/data/zones'
import { QUESTS } from '@/game/data/quests'
import { TC_DOOR, TC_FLOOR, TC_PROP, TC_WALL, townLane, type TownPlan } from '@/game/sim/town'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateTown } from '@/game/sim/director'
import { createHero, orderAttack } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { townAddress, townLife, townPose } from '@/game/sim/townLife'
import { referenceBuild } from '@/game/sim/bot'

/**
 * Towns (roadmap #41, #42): rows of houses with rooms the hero walks into,
 * dressed streets that never block the way, and people who go about their
 * day — and stop and turn to the hero when he speaks to them.
 */

const TOWN_IDS = Object.keys(TOWNS) as TownId[]
const flagSets: string[][] = [[], ...QUESTS.flatMap(q => q.choices.map(c => c.flags)), ['oakhavenFallen', 'goblinPact', 'coreCircle']]
const SEEDS = [7, 1, 2, 3, 99, 4242]

const gridOf = (plan: ZonePlan): Grid => fillGrid(createGrid(plan.w, plan.h), plan)
const path: number[] = []
const reach = (g: Grid, plan: ZonePlan, x: number, z: number): boolean =>
  (cellOf(x) === cellOf(plan.start.x) && cellOf(z) === cellOf(plan.start.z)) || findPath(g, plan.start.x, plan.start.z, x, z, path, 6000) > 0

describe('town plans', () => {
  for (const town of TOWN_IDS) {
    it(`${town}: everybody, every place to sit or work, and every door is reachable, in every world state and seed`, () => {
      for (const seed of SEEDS) {
        for (const flags of flagSets) {
          const tag = `${town}#${seed} [${flags}]`
          const plan = generateTown(TOWNS[town], new Set(flags), seed)
          const t = plan.town!
          const g = gridOf(plan)
          expect(isSolidAt(g, plan.start.x, plan.start.z), `${tag} start`).toBe(false)
          for (const p of t.people) {
            expect(isSolidAt(g, p.x, p.z), `${tag}: ${p.id} stands in something`).toBe(false)
            expect(reach(g, plan, p.x, p.z), `${tag}: ${p.id} cannot be reached`).toBe(true)
          }
          for (const [k, s] of t.spots.entries()) {
            expect(isSolidAt(g, s.ax, s.az), `${tag}: spot ${k} (${s.kind}) is walked to through a wall`).toBe(false)
            expect(reach(g, plan, s.ax, s.az), `${tag}: spot ${k} (${s.kind}) cannot be reached`).toBe(true)
          }
          for (const h of t.houses) {
            if (!h.inside) continue
            const fj = h.j0 + h.cd - 1
            expect(reach(g, plan, (h.doorI + 0.5) * CELL, (fj + 1.5) * CELL), `${tag}: ${h.kind} door`).toBe(true)
          }
          for (const [x, z] of t.patrol) expect(reach(g, plan, x, z), `${tag} patrol`).toBe(true)
        }
      }
    })
  }

  it('the cast is everyone the world state leaves in town; the folk come and go with the flags', () => {
    for (const town of TOWN_IDS) {
      for (const flags of flagSets) {
        const set = new Set(flags)
        const plan = generateTown(TOWNS[town], set, 7)
        expect(plan.npcs.map(n => n.id).sort()).toEqual(townNpcs(town, set).map(n => n.id).sort())
        expect(plan.town!.people.filter(p => p.npc).map(p => p.id).sort()).toEqual(plan.npcs.map(n => n.id).sort())
      }
    }
  })

  it('every shopkeeper, trainer and healer has a house of their own; a fallen town keeps its houses', () => {
    for (const town of TOWN_IDS) {
      for (const flags of flagSets) {
        const set = new Set(flags)
        const t = generateTown(TOWNS[town], set, 7).town!
        for (const n of townNpcs(town, set)) {
          if (n.role !== 'shop' && n.role !== 'trainer' && n.role !== 'healer') continue
          if ((n.place ?? 'street') === 'street') continue
          expect(t.houses.filter(h => h.owner === n.id).length, `${town} ${n.id}`).toBe(1)
        }
      }
      // The same streets whatever has become of the town.
      const a = generateTown(TOWNS[town], new Set(), 7).town!.houses.map(h => [h.i0, h.j0, h.cw, h.cd, h.kind])
      const b = generateTown(TOWNS[town], new Set(['oakhavenFallen']), 7).town!.houses.map(h => [h.i0, h.j0, h.cw, h.cd, h.kind])
      expect(b).toEqual(a)
    }
    expect(generateTown(TOWNS.oakhaven, new Set(['oakhavenFallen']), 7).town!.ruined).toBe(true)
    expect(generateTown(TOWNS.oakhaven, new Set(), 7).town!.ruined).toBe(false)
  })

  it('people inside are in their own room, which is entered only through its door', () => {
    for (const town of TOWN_IDS) {
      for (const flags of flagSets) {
        const plan = generateTown(TOWNS[town], new Set(flags), 7)
        const t = plan.town!
        for (const p of t.people) {
          const k = cellOf(p.z) * plan.w + cellOf(p.x)
          if (p.place === 'inside' && p.room >= 0) {
            expect(t.cell[k], `${town}: ${p.id} is not on a floor`).toBe(TC_FLOOR)
            expect(t.room[k], `${town}: ${p.id} is in somebody else's house`).toBe(p.room)
          } else expect(t.cell[k] === TC_WALL || t.cell[k] === TC_FLOOR, `${town}: ${p.id} is inside a house`).toBe(false)
        }
        // Flood a room without its doorway: it reaches nothing outside.
        for (const [hi, h] of t.houses.entries()) {
          if (!h.inside) continue
          let doors = 0
          for (let j = h.j0; j < h.j0 + h.cd; j++) {
            for (let i = h.i0; i < h.i0 + h.cw; i++) {
              const k = j * plan.w + i
              expect(t.room[k], `${town} house ${hi}`).toBe(hi)
              const edge = i === h.i0 || i === h.i0 + h.cw - 1 || j === h.j0 || j === h.j0 + h.cd - 1
              if (edge) {
                expect(t.cell[k] === TC_WALL || t.cell[k] === TC_DOOR, `${town} house ${hi} wall ${i},${j}`).toBe(true)
                if (t.cell[k] === TC_DOOR) doors++
              }
            }
          }
          expect(doors, `${town} house ${hi} doors`).toBe(1)
        }
      }
    }
  })

  it('no prop stands in a street\'s lane, and the lanes are one walkable network', () => {
    for (const town of TOWN_IDS) {
      for (const seed of SEEDS) {
        const plan = generateTown(TOWNS[town], new Set(flagSets[seed % flagSets.length]), seed)
        const t = plan.town!
        const g = gridOf(plan)
        for (const p of t.props) {
          for (const k of p.cells) {
            const i = k % plan.w
            const j = (k - i) / plan.w
            expect(townLane(i, j), `${town}#${seed}: a ${p.kind} in the lane at ${i},${j}`).toBe(false)
          }
        }
        for (let j = 0; j < plan.h; j++) {
          for (let i = 0; i < plan.w; i++) {
            if (!townLane(i, j)) continue
            expect(g.solid[j * plan.w + i], `${town}#${seed} lane ${i},${j}`).toBe(0)
            expect(reach(g, plan, (i + 0.5) * CELL, (j + 0.5) * CELL), `${town}#${seed} lane ${i},${j} cut off`).toBe(true)
          }
        }
        // Props are where the plan says: their cells are kept clear of feet.
        for (const p of t.props) for (const k of p.cells) expect(t.cell[k]).toBe(TC_PROP)
      }
    }
  })

  it('the same seed lays the same town; another seed varies it', () => {
    const a = generateTown(TOWNS.sunford, new Set(), 11)
    const b = generateTown(TOWNS.sunford, new Set(), 11)
    const c = generateTown(TOWNS.sunford, new Set(), 12)
    expect(Array.from(a.town!.cell)).toEqual(Array.from(b.town!.cell))
    expect(a.town!.people).toEqual(b.town!.people)
    expect(a.town!.props).toEqual(b.town!.props)
    expect(JSON.stringify(c.town!.houses)).not.toEqual(JSON.stringify(a.town!.houses))
  })
})

// ─── Town life ───────────────────────────────────────────────────────────────

const visit = (town: TownId, seed: number, flags: string[] = [], o: { lite?: boolean; visit?: number } = {}): { sim: Sim; plan: ZonePlan } => {
  const plan = generateTown(TOWNS[town], new Set(flags), seed)
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'town', zone: town })
  applyPlan(sim, plan)
  createHero(sim, { build: referenceBuild({ cls: 'aegis', level: 1 }).build, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
  populateTown(sim, plan, o)
  sim.events.length = 0
  return { sim, plan }
}
const run = (sim: Sim, plan: ZonePlan, sec: number): void => {
  for (let t = 0; t < sec; t += 1 / 30) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
}
const snapshot = (sim: Sim): string => sim.units.map(u => `${u.id}:${u.x.toFixed(3)},${u.z.toFixed(3)},${townPose(sim, u.id)?.pose ?? ''}`).join('|')

describe('town life', () => {
  it('a visit plays the same for the same seed and visit, and differently on another visit', () => {
    const a = visit('sunford', 7, [], { visit: 2 })
    const b = visit('sunford', 7, [], { visit: 2 })
    const c = visit('sunford', 7, [], { visit: 3 })
    run(a.sim, a.plan, 40)
    run(b.sim, b.plan, 40)
    run(c.sim, c.plan, 40)
    expect(snapshot(a.sim)).toEqual(snapshot(b.sim))
    expect(snapshot(c.sim)).not.toEqual(snapshot(a.sim))
  })

  it('people go about their day: they move, they change what they do, and they keep out of walls and doorways', () => {
    for (const town of TOWN_IDS) {
      for (const flags of [[], ['oakhavenFallen']]) {
        const { sim, plan } = visit(town, 7, flags)
        const life = townLife(sim)!
        const g = gridOf(plan)
        const poses = new Map<number, Set<string>>()
        const start = new Map(life.people.map(p => [p.unit.id, { x: p.unit.x, z: p.unit.z }]))
        let moved = 0
        for (let s = 0; s < 120 * 30; s++) {
          stepSim(sim, plan, 1 / 30)
          sim.events.length = 0
          if (s % 15) continue
          for (const p of life.people) {
            const u = p.unit
            const v = townPose(sim, u.id)!
            ;(poses.get(u.id) ?? poses.set(u.id, new Set()).get(u.id)!).add(v.pose)
            // Anywhere but at a spot (a seat, a wall to lean on), a body stands on open ground.
            const atSpot = p.spot >= 0 && Math.hypot(u.x - life.plan.spots[p.spot]!.x, u.z - life.plan.spots[p.spot]!.z) < 0.9
            if (!atSpot) expect(g.solid[cellOf(u.z) * plan.w + cellOf(u.x)], `${town}: ${p.def.id} in a wall at ${s / 30}s`).toBe(0)
          }
        }
        for (const p of life.people) {
          const s0 = start.get(p.unit.id)!
          if (Math.hypot(p.unit.x - s0.x, p.unit.z - s0.z) > 0.5 || poses.get(p.unit.id)!.size > 1) moved++
          // Nobody is left standing in a doorway.
          const c = life.plan.cell[cellOf(p.unit.z) * plan.w + cellOf(p.unit.x)]
          if (c === TC_DOOR) expect(p.unit.hasGoal, `${town}: ${p.def.id} lingers in a doorway`).toBe(true)
        }
        // Statues no more: nearly everybody has done more than one thing.
        expect(moved, `${town} [${flags}]`).toBeGreaterThanOrEqual(Math.ceil(life.people.length * 0.75))
        const all = new Set([...poses.values()].flatMap(s => [...s]))
        expect(all.size, `${town} poses: ${[...all]}`).toBeGreaterThanOrEqual(5)
      }
    }
  })

  it('a weak device keeps the cast and only the folk marked lite', () => {
    const full = visit('sunford', 7)
    const lite = visit('sunford', 7, [], { lite: true })
    const folk = TOWNS.sunford.folk
    expect(full.sim.units.length - lite.sim.units.length).toBe(folk.filter(f => !f.lite).length)
    expect(lite.sim.units.filter(u => u.npc).length).toBe(full.sim.units.filter(u => u.npc).length)
  })

  it('walked up to, a townsperson stops and turns to the hero; spoken to, they hold still; let go, they carry on', () => {
    const { sim, plan } = visit('sunford', 7)
    run(sim, plan, 6)
    const hero = sim.hero.unit
    for (const id of ['sunfordSmith', 'trainerPyro', 'elderMara']) {
      const npc = sim.units.find(u => u.npc === id)!
      // Put the hero a few steps away in the open (in the room, for one who is inside).
      const life = townLife(sim)!
      const p = life.people.find(q => q.unit === npc)!
      hero.x = hero.px = p.def.x + (p.def.room >= 0 ? 0 : 0.4)
      hero.z = hero.pz = p.def.z + (p.def.room >= 0 ? 0 : 2.6)
      if (p.def.room >= 0) {
        const h = life.plan.houses[p.def.room]!
        hero.x = hero.px = (h.doorI + 0.5) * CELL
        hero.z = hero.pz = (h.j0 + h.cd - 0.5) * CELL
      }
      orderAttack(sim, npc.id)
      let met = false
      for (let s = 0; s < 30 * 12 && !met; s++) {
        stepSim(sim, plan, 1 / 30)
        met = sim.events.some(e => e.t === 'fx' && e.id === 'interact' && e.unit === npc.id)
        sim.events.length = 0
      }
      expect(met, `${id}: the hero never got to them`).toBe(true)
      townAddress(sim, npc.id)
      const at = { x: npc.x, z: npc.z }
      run(sim, plan, 3)
      expect(npc.hasGoal, id).toBe(false)
      expect(Math.hypot(npc.x - at.x, npc.z - at.z), `${id} walked off mid-conversation`).toBeLessThan(0.05)
      const seated = townPose(sim, npc.id)!.pose.startsWith('sit')
      if (!seated) {
        const want = Math.atan2(hero.x - npc.x, hero.z - npc.z)
        const d = Math.abs(Math.atan2(Math.sin(want - npc.facing), Math.cos(want - npc.facing)))
        expect(d, `${id} does not face the hero`).toBeLessThan(0.15)
        expect(townPose(sim, npc.id)!.pose).toBe('listen')
      }
      townAddress(sim, 0)
      const before = snapshot(sim)
      run(sim, plan, 25)
      expect(snapshot(sim)).not.toEqual(before)
      expect(townPose(sim, npc.id)!.pose).not.toBe('listen')
    }
  })

  it('a hero walking into a townsperson who is on the move is not stopped by them', () => {
    const { sim, plan } = visit('oakhaven', 7)
    const life = townLife(sim)!
    // A walker in the street; the hero walks straight through where they are.
    run(sim, plan, 10)
    const hero = sim.hero.unit
    const w = life.people.find(p => p.unit.hasGoal && p.def.room < 0)
    if (!w) return
    hero.x = hero.px = w.unit.x
    hero.z = hero.pz = w.unit.z + 1.2
    const before = hero.z
    for (let s = 0; s < 30; s++) {
      sim.hero.stickX = 0
      sim.hero.stickZ = -1
      stepSim(sim, plan, 1 / 30)
    }
    expect(before - hero.z).toBeGreaterThan(1)
  })
})

void ({} as TownPlan)
