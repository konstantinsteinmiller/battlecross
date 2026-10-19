// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
// The town's simulation is a lazy chunk in the game (roadmap #142).
import '../stubs/lazyCode'
import { buildHouse, roomPropsOf } from '@/game/gfx/houses'
import { newKit } from '@/game/gfx/archKit'
import { furnitureBlocks } from '@/game/gfx/roomLayout'
import { fillGrid } from '@/game/sim/zoneGen'
import { generateTown } from '@/game/sim/townGen'
import { CELL, cellOf, createGrid, findPath, isSolidAt, setBlocks, type Block } from '@/game/sim/grid'
import { TOWNS, type TownId } from '@/game/data/zones'
import { townExitAt, townExitClear, townGeo } from '@/game/sim/town'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateTown } from '@/game/sim/director'
import { createHero, orderMove } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { clearOfFurniture, townLife } from '@/game/sim/townLife'
import { referenceBuild } from '@/game/sim/bot'

/**
 * The ways out of a town (roadmap #131): the road runs on to the edge of the
 * grid with no tree, prop or person in its way, walking into its end leaves for
 * the map; and the people who sell never stand in a counter or a desk.
 */

const TOWN_IDS = Object.keys(TOWNS) as TownId[]
const SEEDS = [7, 1, 4242]
const FLAGS: string[][] = [[], ['oakhavenFallen'], ['oakhavenFallen', 'goblinPact', 'coreCircle']]
const path: number[] = []

describe('the ways out of a town', () => {
  it('every town has one, its open ground reaching the edge of the grid', () => {
    for (const town of TOWN_IDS) {
      const def = TOWNS[town]
      const geo = townGeo(def.width, def.site)
      expect(geo.EXITS.length, town).toBeGreaterThanOrEqual(def.site ? 2 : 1)
      for (const e of geo.EXITS) {
        const edge = e.dz > 0 ? e.j1 === geo.H - 1 : e.dx > 0 ? e.i1 === geo.W - 1 : e.i0 === 0
        expect(edge, `${town}: an exit stops short of the edge`).toBe(true)
      }
    }
  })

  for (const town of TOWN_IDS) {
    it(`${town}: the exit is open ground you can walk to, and nothing stands in front of it`, () => {
      for (const seed of SEEDS) {
        for (const flags of FLAGS) {
          const tag = `${town}#${seed} [${flags}]`
          const plan = generateTown(TOWNS[town], new Set(flags), seed)
          const t = plan.town!
          const g = fillGrid(createGrid(plan.w, plan.h), plan)
          expect(t.exits.length, tag).toBeGreaterThan(0)
          // Arriving is not leaving.
          expect(townExitAt(t.exits, cellOf(plan.start.x), cellOf(plan.start.z)), `${tag}: starts in the exit`).toBe(false)
          for (const e of t.exits) {
            for (let j = e.j0; j <= e.j1; j++) {
              for (let i = e.i0; i <= e.i1; i++) {
                const x = (i + 0.5) * CELL
                const z = (j + 0.5) * CELL
                expect(isSolidAt(g, x, z), `${tag}: the exit is blocked at ${i},${j}`).toBe(false)
                if (townExitAt(t.exits, i, j)) {
                  expect(findPath(g, plan.start.x, plan.start.z, x, z, path, 8000), `${tag}: the exit at ${i},${j} cannot be walked to`).toBeGreaterThan(0)
                }
              }
            }
          }
          // The way out is grassy ground: no paving patch ends in a hard edge at the forest.
          for (const e of t.exits) {
            for (let j = e.j0; j <= e.j1; j++) {
              for (let i = e.i0; i <= e.i1; i++) {
                const edgeCell = e.dz > 0 ? j >= plan.h - 4 : e.dx > 0 ? i >= plan.w - 4 : i <= 3
                if (edgeCell) expect(plan.trail[j * plan.w + i], `${tag}: paved exit at ${i},${j}`).toBe(0)
              }
            }
          }
          // No prop, place or person in the open before it.
          // (Beside the road is a tree-free margin; the road itself holds nothing.)
          const clear = (x: number, z: number): boolean => t.exits.some(e => cellOf(x) >= e.i0 && cellOf(x) <= e.i1 && cellOf(z) >= e.j0 && cellOf(z) <= e.j1)
          const margin = (i: number, j: number): boolean => townExitClear(t.exits, i, j)
          for (const p of t.props) {
            expect(clear(p.x, p.z), `${tag}: a ${p.kind} stands before the exit`).toBe(false)
            for (const k of p.cells) expect(margin(k % plan.w, Math.floor(k / plan.w)), `${tag}: a ${p.kind} blocks the exit`).toBe(false)
          }
          for (const s of t.spots) expect(clear(s.x, s.z), `${tag}: a ${s.kind} place is before the exit`).toBe(false)
          for (const p of t.people) expect(clear(p.x, p.z), `${tag}: ${p.id} stands before the exit`).toBe(false)
          for (const h of t.houses) {
            for (let j = h.j0; j < h.j0 + h.cd; j++) for (let i = h.i0; i < h.i0 + h.cw; i++) expect(clear((i + 0.5) * CELL, (j + 0.5) * CELL), `${tag}: a house stands before the exit`).toBe(false)
          }
        }
      }
    })

    it(`${town}: the hero who walks to the end of a road is in its exit`, () => {
      const plan = generateTown(TOWNS[town], new Set(), 7)
      const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'town', zone: town })
      applyPlan(sim, plan)
      createHero(sim, { build: referenceBuild({ cls: 'aegis', level: 1 }).build, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
      populateTown(sim, plan, {})
      const h = sim.hero.unit
      for (const e of plan.town!.exits) {
        h.x = h.px = plan.start.x
        h.z = h.pz = plan.start.z
        // The middle of the corridor's end.
        const gx = (e.dz > 0 ? (e.i0 + e.i1 + 1) / 2 : e.dx > 0 ? e.i1 + 0.5 : e.i0 + 0.5) * CELL
        const gz = (e.dz > 0 ? e.j1 + 0.5 : (e.j0 + e.j1 + 1) / 2) * CELL
        orderMove(sim, gx, gz)
        let inside = false
        for (let s = 0; s < 30 * 60 && !inside; s++) {
          stepSim(sim, plan, 1 / 30)
          inside = townExitAt(plan.town!.exits, cellOf(h.x), cellOf(h.z))
        }
        expect(inside, `${town}: the hero never got into the exit at ${gx},${gz} (${h.x.toFixed(1)},${h.z.toFixed(1)})`).toBe(true)
      }
    })
  }
})

/** Every room's furniture in a town, as `TownView.build` lays it, without the seats (somebody sits on those). */
const furnish = (plan: ReturnType<typeof generateTown>): Block[] => {
  const t = plan.town!
  const out: Block[] = []
  t.houses.forEach((h, hi) => {
    if (!h.inside) return
    const x = (h.i0 + h.cw / 2) * CELL
    const z = (h.j0 + h.cd / 2) * CELL
    const owner = t.people.find(p => p.npc && p.npc === h.owner)
    const o = buildHouse(newKit(), h, { style: t.style, ruined: t.ruined, low: false, x, y: 0, z, job: owner?.job, cls: h.cls, inRoom: roomPropsOf(t, hi) })
    if (!o.layout) return
    const lay = o.layout
    const keep = lay.pieces
    lay.pieces = keep.filter(p => !p.label.includes('chair'))
    out.push(...furnitureBlocks(lay, x, z))
    lay.pieces = keep
  })
  return out
}

describe('the people who sell', () => {
  for (const town of TOWN_IDS) {
    it(`${town}: nobody stands in a counter, a bar or a desk, at the start or through a minute of the day`, () => {
      for (const flags of FLAGS.slice(0, 2)) {
        for (const seed of [7, 3]) {
          const tag = `${town}#${seed} [${flags}]`
          const plan = generateTown(TOWNS[town], new Set(flags), seed)
          const blocks = furnish(plan)
          // (A body brushing a piece's edge by a few centimetres is a sleeve, not a body inside it.)
          const inBlock = (x: number, z: number): Block | undefined => blocks.find(b => x > b.x0 + 0.04 && x < b.x1 - 0.04 && z > b.z0 + 0.04 && z < b.z1 - 0.04)
          // Their places are clear of the furniture.
          for (const s of plan.town!.spots) if (s.room >= 0 && s.kind !== 'seat') expect(inBlock(s.x, s.z), `${tag}: a ${s.kind} place is in a piece of furniture`).toBeUndefined()
          const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'town', zone: town })
          applyPlan(sim, plan)
          createHero(sim, { build: referenceBuild({ cls: 'aegis', level: 1 }).build, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
          populateTown(sim, plan, {})
          setBlocks(sim.grid, blocks)
          clearOfFurniture(sim)
          const life = townLife(sim)!
          for (let s = 0; s < 30 * 60; s++) {
            stepSim(sim, plan, 1 / 30)
            for (const p of life.people) {
              const b = inBlock(p.unit.x, p.unit.z)
              expect(b, `${tag}: ${p.unit.npc || p.unit.id} is inside a piece of furniture at ${p.unit.x.toFixed(2)},${p.unit.z.toFixed(2)} (${s / 30}s)`).toBeUndefined()
            }
          }
        }
      }
    })
  }
})
