// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
// The town's simulation is a lazy chunk in the game (roadmap #142).
import '../stubs/lazyCode'
import { buildHouse, roomPropsOf } from '@/game/gfx/houses'
import { newKit } from '@/game/gfx/archKit'
import { AGENT, furnitureBlocks } from '@/game/gfx/roomLayout'
import { type ZonePlan } from '@/game/sim/zoneGen'
import { generateTown } from '@/game/sim/townGen'
import { CELL, FURNITURE_R, createGrid, moveCircle, setBlocks, type Block } from '@/game/sim/grid'
import { TOWNS, type TownId } from '@/game/data/zones'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateTown } from '@/game/sim/director'
import { createHero, orderAttack } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { townLife } from '@/game/sim/townLife'
import { referenceBuild } from '@/game/sim/bot'

/**
 * Furniture indoors stops the hero (roadmap #84: he walked through the study
 * table in Ember Wren's school). The room layout is the room's own and the
 * same on every device; its pieces become rectangles in the walk grid that the
 * hero's body slides along and his walked paths bend round.
 */

const TOWN_IDS = Object.keys(TOWNS) as TownId[]

/** Every room's furniture in a town, as `TownView.build` lays it. */
const furnish = (plan: ZonePlan, low: boolean): Block[] => {
  const t = plan.town!
  const out: Block[] = []
  t.houses.forEach((h, hi) => {
    if (!h.inside) return
    const x = (h.i0 + h.cw / 2) * CELL
    const z = (h.j0 + h.cd / 2) * CELL
    const owner = t.people.find(p => p.npc && p.npc === h.owner)
    const o = buildHouse(newKit(), h, { style: t.style, ruined: t.ruined, low, x, y: 0, z, job: owner?.job, cls: h.cls, inRoom: roomPropsOf(t, hi) })
    if (o.layout) out.push(...furnitureBlocks(o.layout, x, z))
  })
  return out
}

const inside = (b: Block, x: number, z: number, m: number): boolean => x > b.x0 - m && x < b.x1 + m && z > b.z0 - m && z < b.z1 + m

describe('furniture', () => {
  it('the hero\'s body is the walker the room layout keeps its ways open for', () => {
    expect(FURNITURE_R).toBe(AGENT)
  })

  it('a room is arranged the same on a weak device as on a strong one', () => {
    for (const town of TOWN_IDS) {
      const plan = generateTown(TOWNS[town], new Set(), 7)
      const hi = furnish(plan, false)
      expect(hi.length, town).toBeGreaterThan(8)
      expect(furnish(plan, true), town).toEqual(hi)
    }
  })

  it('a table stops a body walking into it, which slides along its edge', () => {
    const g = createGrid(10, 10)
    const table: Block = { x0: 6, z0: 6, x1: 7.5, z1: 6.7 }
    setBlocks(g, [table])
    const out: [number, number] = [0, 0]
    // Straight at it: stops at its edge.
    moveCircle(g, 4, 6.35, 3, 0, 0.45, out, true)
    expect(out[0]).toBeCloseTo(6 - FURNITURE_R, 2)
    // Glancing it: slides along its edge and past it.
    moveCircle(g, 4, 5.7, 4, 0.3, 0.45, out, true)
    expect(inside(table, out[0], out[1], FURNITURE_R - 0.01)).toBe(false)
    expect(out[0]).toBeGreaterThan(7.5)
    // Without the flag (a townsperson), nothing stops the body.
    moveCircle(g, 4, 6.35, 3, 0, 0.45, out)
    expect(out[0]).toBeCloseTo(7, 2)
  })

  for (const town of TOWN_IDS) {
    it(`${town}: the hero walks to everyone indoors round the furniture, never through it`, () => {
      const plan = generateTown(TOWNS[town], new Set(), 7)
      const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'town', zone: town })
      applyPlan(sim, plan)
      createHero(sim, { build: referenceBuild({ cls: 'aegis', level: 1 }).build, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
      populateTown(sim, plan, {})
      const blocks = furnish(plan, false)
      setBlocks(sim.grid, blocks)
      const life = townLife(sim)!
      const hero = sim.hero.unit
      const indoors = life.people.filter(p => p.def.room >= 0 && p.unit.npc)
      expect(indoors.length, town).toBeGreaterThanOrEqual(2)
      for (const p of indoors) {
        const h = life.plan.houses[p.def.room]!
        hero.x = hero.px = (h.doorI + 0.5) * CELL
        hero.z = hero.pz = (h.j0 + h.cd - 0.5) * CELL
        orderAttack(sim, p.unit.id)
        let met = false
        for (let s = 0; s < 30 * 14 && !met; s++) {
          stepSim(sim, plan, 1 / 30)
          for (const b of blocks) expect(inside(b, hero.x, hero.z, FURNITURE_R - 0.03), `${town}: ${p.unit.npc} — the hero crossed a piece at ${hero.x.toFixed(2)},${hero.z.toFixed(2)}`).toBe(false)
          met = sim.events.some(e => e.t === 'fx' && e.id === 'interact' && e.unit === p.unit.id)
          sim.events.length = 0
        }
        expect(met, `${town}: the hero never got to ${p.unit.npc}`).toBe(true)
      }
    })
  }
})
