import { describe, expect, it } from 'vitest'
import { generateArena, generateTown, generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { CELL, cellOf, createGrid, findPath, isSolidAt, type Grid } from '@/game/sim/grid'
import { TOWNS, ZONES, ZONE_IDS, townNpcs, type TownId } from '@/game/data/zones'
import { QUESTS } from '@/game/data/quests'

/**
 * Generated places must be PLAYABLE, whatever the seed: the hero starts on
 * open ground and can walk to every pack, the boss, the chest and — in a town
 * — to every person. A layout that seals something off is a zone nobody can
 * clear.
 */

const gridOf = (plan: ZonePlan): Grid => {
  const g = createGrid(plan.w, plan.h)
  for (let k = 0; k < plan.solid.length; k++) g.solid[k] = plan.solid[k]! ? 1 : 0
  return g
}

const path: number[] = []
const reachable = (g: Grid, plan: ZonePlan, x: number, z: number): boolean => {
  if (cellOf(x) === cellOf(plan.start.x) && cellOf(z) === cellOf(plan.start.z)) return true
  return findPath(g, plan.start.x, plan.start.z, x, z, path, 6000) > 0
}

const SEEDS = [1, 2, 3, 7, 77, 1234, 99991]

describe('zones', () => {
  for (const zone of ZONE_IDS) {
    it(`${zone}: every seed is walkable from the start to every pack and the chest`, () => {
      for (const seed of SEEDS) {
        const plan = generateZone(ZONES[zone], seed)
        const g = gridOf(plan)
        expect(isSolidAt(g, plan.start.x, plan.start.z), `${zone}#${seed} start`).toBe(false)
        expect(plan.packs.length, `${zone}#${seed} packs`).toBe(ZONES[zone].sections)
        for (const [i, p] of plan.packs.entries()) {
          expect(isSolidAt(g, p.x, p.z), `${zone}#${seed} pack ${i} stands in rock`).toBe(false)
          expect(reachable(g, plan, p.x, p.z), `${zone}#${seed} pack ${i} is sealed off`).toBe(true)
        }
        if (plan.chest) expect(reachable(g, plan, plan.chest.x, plan.chest.z), `${zone}#${seed} chest`).toBe(true)
        if (plan.secret) expect(reachable(g, plan, plan.secret.x, plan.secret.z), `${zone}#${seed} secret`).toBe(true)
      }
    })
  }

  it('the last pack is the finale, and it is the farthest walk from the start', () => {
    for (const zone of ZONE_IDS) {
      const plan = generateZone(ZONES[zone], 5)
      const last = plan.packs[plan.packs.length - 1]!
      expect(last.kinds, zone).toContain(ZONES[zone].finale.leader)
      const d = (p: { x: number; z: number }): number => Math.hypot(p.x - plan.start.x, p.z - plan.start.z)
      expect(d(last), zone).toBeGreaterThanOrEqual(Math.max(...plan.packs.map(d)) - 0.001)
    }
  })

  it('the same seed draws the same zone; another seed, another', () => {
    const a = generateZone(ZONES.woods, 42)
    const b = generateZone(ZONES.woods, 42)
    const c = generateZone(ZONES.woods, 43)
    expect(Array.from(a.solid)).toEqual(Array.from(b.solid))
    expect(a.packs).toEqual(b.packs)
    expect(Array.from(a.solid)).not.toEqual(Array.from(c.solid))
  })

  it('the Dread Fortress hides its secret chest (the Ring of Absolute Power)', () => {
    expect(generateZone(ZONES.fortress, 9).secret).not.toBeNull()
    expect(generateZone(ZONES.plains, 9).secret).toBeNull()
  })

  it('a zone has a rim: nothing walkable touches the edge of the grid', () => {
    for (const zone of ZONE_IDS) {
      const plan = generateZone(ZONES[zone], 3)
      for (let i = 0; i < plan.w; i++) {
        expect(plan.solid[i], `${zone} top`).toBe(1)
        expect(plan.solid[(plan.h - 1) * plan.w + i], `${zone} bottom`).toBe(1)
      }
      for (let j = 0; j < plan.h; j++) {
        expect(plan.solid[j * plan.w], `${zone} left`).toBe(1)
        expect(plan.solid[j * plan.w + plan.w - 1], `${zone} right`).toBe(1)
      }
    }
  })
})

describe('towns', () => {
  // Every world state that changes who stands in a town.
  const flagSets: string[][] = [[], ...QUESTS.flatMap(q => q.choices.map(c => c.flags))]

  for (const town of Object.keys(TOWNS) as TownId[]) {
    it(`${town}: everyone can be walked up to, in every world state`, () => {
      for (const flags of flagSets) {
        const set = new Set(flags)
        const plan = generateTown(TOWNS[town], set, 7)
        const g = gridOf(plan)
        expect(isSolidAt(g, plan.start.x, plan.start.z), `${town} start`).toBe(false)
        expect(plan.npcs.map(n => n.id).sort(), `${town} [${flags}]`).toEqual(townNpcs(town, set).map(n => n.id).sort())
        for (const n of plan.npcs) {
          expect(isSolidAt(g, n.x, n.z), `${town}: ${n.id} stands inside something [${flags}]`).toBe(false)
          expect(reachable(g, plan, n.x, n.z), `${town}: ${n.id} cannot be reached [${flags}]`).toBe(true)
        }
        expect(plan.packs).toEqual([])
      }
    })
  }

  it('shopkeepers and trainers stand in front of a house that swallows nobody', () => {
    for (const town of Object.keys(TOWNS) as TownId[]) {
      const plan = generateTown(TOWNS[town], new Set(), 7)
      const need = townNpcs(town, new Set()).filter(n => n.role === 'shop' || n.role === 'trainer').length
      expect(plan.buildings.length, town).toBeGreaterThanOrEqual(need - 1)
      expect(plan.buildings.length, town).toBeLessThanOrEqual(need)
      for (const b of plan.buildings) {
        expect(b.w).toBeGreaterThan(CELL)
        for (const n of plan.npcs) {
          const inside = Math.abs(n.x - b.x) < b.w / 2 && Math.abs(n.z - b.z) < b.d / 2
          expect(inside, `${town}: ${n.id} is inside a house`).toBe(false)
        }
      }
    }
  })
})

describe('the colosseum', () => {
  it('is one open ring with gates to send the waves through', () => {
    const plan = generateArena(4)
    const g = gridOf(plan)
    expect(isSolidAt(g, plan.start.x, plan.start.z)).toBe(false)
    expect(plan.gates.length).toBeGreaterThanOrEqual(3)
    for (const [x, z] of plan.gates) expect(reachable(g, plan, x, z), `gate ${x},${z}`).toBe(true)
  })
})
