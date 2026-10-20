// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
// The town's simulation is a lazy chunk in the game (roadmap #142).
import '../stubs/lazyCode'
import { CELL, ROUND_R, SOLID_LOW, SOLID_ROUND, colliderDist, createGrid, setBlocks, type Block } from '@/game/sim/grid'
import { fillGrid, generateArena, generateEncounter, generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { generateTown } from '@/game/sim/townGen'
import { DRESS_FOOT, DRESS_ROLE, type DressKind } from '@/game/sim/dressing'
import { TOWNS, ZONES, ZONE_IDS, type ThemeId } from '@/game/data/zones'
import { invadedZone } from '@/game/data/invasion'
import { THEMES, bodyPoints, fitPlace, layTerrainProps } from '@/game/gfx/terrain'
import { BODY_H, GROUND_H, SCENERY_ROLE, SOLID_TOL, TOWN_PROP_ROLE, type SceneryKind } from '@/game/gfx/propRoles'
import { footOf, footPoints, spillOf } from '@/game/gfx/footprint'
import { piecePalette } from '@/game/gfx/setPieces'
import { buildProp } from '@/game/gfx/townProps'
import { buildHouse, roomPropsOf } from '@/game/gfx/houses'
import { newKit } from '@/game/gfx/archKit'
import { stubCanvas } from './zfightTools'
import { worldSpill } from './propCollideTools'

/**
 * Nothing solid is drawn where the hero can walk (owner, Citadel of the Void:
 * the hero walked into a tall rock with crystal spikes, drawn half a cell out
 * over the court beside it).
 *
 * Every prop kind says whether it stands in the way (`gfx/propRoles.ts`).
 * Every SOLID one, as the game places it, covers of the ground (up to a
 * body's height) only what the walk grid's colliders cover, give or take
 * `SOLID_TOL`: blocked cells, a level prop's round disc, a room's furniture.
 * The footprints come from the very placements the renderer draws
 * (`layTerrainProps`, `piecesOf`, the town's props from their own builder).
 * The level props a scene holds (chests, posts, the hint stone, cave mouths,
 * the rocks of a door) are `propCollideLevel.test.ts`.
 */

/** 4 seeds a place in the suite; `PC_SEEDS=60` for a soak. */
const SEEDS = Array.from({ length: Number(process.env.PC_SEEDS) || 4 }, (_, k) => 3 + k * 7919)

type Case = { name: string; plan: ZonePlan; theme: ThemeId }

const cases = function * (): Generator<Case> {
  for (const id of ZONE_IDS) {
    const def = ZONES[id]
    for (const seed of SEEDS) {
      const odd = seed % 2 === 1
      yield { name: `${id}#${seed}`, theme: def.theme, plan: generateZone(def, seed, { cage: odd, treasure: !odd, pieces: odd ? ['a', 'b'] : [], ambush: odd ? def.kinds[0]!.kind : null }) }
    }
    yield { name: `${id} first visit`, theme: def.theme, plan: generateZone(def, 3, { tutorial: true, openingPack: 2 }) }
    // The afterplay's invaded self (`data/invasion.ts`): its ruins and scars on the same ground.
    for (const seed of SEEDS.slice(0, 2)) {
      const odd = seed % 2 === 1
      yield { name: `${id} invaded#${seed}`, theme: def.theme, plan: generateZone(invadedZone(id), seed, { cage: odd, treasure: !odd }) }
    }
  }
  for (const seed of SEEDS.slice(0, 3)) {
    yield { name: `encounter#${seed}`, theme: 'plains', plan: generateEncounter([['goblin'], ['goblin', 'goblin']], seed) }
    yield { name: `escort#${seed}`, theme: 'forest', plan: generateEncounter([['goblin'], ['goblin'], ['goblin']], seed, { escort: true }) }
    yield { name: `arena#${seed}`, theme: 'arena', plan: generateArena(seed) }
  }
}

/** The walk grid once every door is open: what the scenery is fitted to (stricter than shut). */
const walkOf = (plan: ZonePlan) => fillGrid(createGrid(plan.w, plan.h), plan, true)

const TOWN_CASES = [['sunford', []], ['oakhaven', []], ['ironhold', []], ['silverbridge', []], ['oakhaven', ['oakhavenFallen']]] as const

describe('props and colliders: nothing solid is drawn where the hero walks', () => {
  it('every kind of prop says whether it stands in the way', () => {
    const roles = ['solid', 'walk']
    const seen = new Set<SceneryKind>()
    for (const [id, th] of Object.entries(THEMES)) {
      // A theme's border stands on solid cells; its decor lies in the clearings.
      for (const s of th.border) expect(SCENERY_ROLE[s.kind], `${id} border ${s.kind}`).toBe('solid')
      for (const s of th.decor) expect(SCENERY_ROLE[s.kind], `${id} decor ${s.kind}`).toBe('walk')
    }
    // Everything the terrain places, in every theme.
    for (const id of ZONE_IDS) {
      for (const g of layTerrainProps(generateZone(ZONES[id], 5), ZONES[id].theme)) {
        expect(roles, `${id}: ${g.shape.kind}`).toContain(SCENERY_ROLE[g.shape.kind])
        seen.add(g.shape.kind)
      }
    }
    for (const t of TOWN_CASES) for (const g of layTerrainProps(generateTown(TOWNS[t[0]], new Set(t[1]), 7), t[1].length ? 'ruin' : 'town')) seen.add(g.shape.kind)
    for (const k of Object.keys(SCENERY_ROLE)) expect(roles).toContain(SCENERY_ROLE[k as SceneryKind])
    // A set piece with cells of its own stands in the way.
    for (const k of Object.keys(DRESS_FOOT) as DressKind[]) {
      expect(roles, k).toContain(DRESS_ROLE[k])
      if (DRESS_FOOT[k][0] > 0) expect(DRESS_ROLE[k], k).toBe('solid')
    }
    expect(Object.keys(DRESS_ROLE).sort()).toEqual(Object.keys(DRESS_FOOT).sort())
    // Every town prop that is built.
    for (const t of TOWN_CASES) {
      for (const p of generateTown(TOWNS[t[0]], new Set(t[1]), 7).town!.props) expect(roles, p.kind).toContain(TOWN_PROP_ROLE[p.kind])
    }
    // The registry is no wider than the game: every scenery kind is placed somewhere.
    expect([...Object.keys(SCENERY_ROLE)].filter(k => !seen.has(k as SceneryKind))).toEqual([])
  })

  it('a rock jittered toward the path is drawn back onto its cell, a pebble-sized one is not stopped', () => {
    // A row of rock (j = 0, 1) beside open ground (j = 2..4).
    const g = createGrid(5, 5)
    for (let i = 0; i < 5; i++) for (const j of [0, 1]) g.solid[j * 5 + i] = 1
    expect(colliderDist(g, 3, 1)).toBe(0)
    expect(colliderDist(g, 3, CELL * 2 + 0.4)).toBeCloseTo(0.4, 5)
    // The round collider of a level prop: its disc, not its cell's corner.
    g.solid[3 * 5 + 2] = SOLID_LOW | SOLID_ROUND
    expect(colliderDist(g, 3.75, 5.25 + ROUND_R + 0.2)).toBeCloseTo(0.2, 5)
    // A boulder pushed half a cell toward the open ground is fitted back.
    const boulder = THEMES.peak.border.find(s => s.kind === 'boulder')!
    const p: [number, number, number, number] = [3.75, CELL * 1.5 + 0.55, 0.3, 1.6]
    expect(spillOf(g, bodyPoints(boulder), p[0], p[1], p[2], p[3])).toBeGreaterThan(SOLID_TOL)
    expect(fitPlace(g, boulder, p, 2, 1)).toBe(true)
    expect(spillOf(g, bodyPoints(boulder), p[0], p[1], p[2], p[3])).toBeLessThanOrEqual(SOLID_TOL)
  })

  it('zones: every solid piece of scenery and every set piece stands on its colliders', () => {
    stubCanvas()
    const bad: string[] = []
    let props = 0
    for (const { name, plan, theme } of cases()) {
      const g = walkOf(plan)
      for (const grp of layTerrainProps(plan, theme)) {
        if (SCENERY_ROLE[grp.shape.kind] !== 'solid') continue
        const pts = bodyPoints(grp.shape)
        for (const p of grp.places) {
          props++
          const s = spillOf(g, pts, p[0], p[1], p[2], p[3])
          if (s > SOLID_TOL) bad.push(`${name}: ${grp.shape.kind} at ${p[0].toFixed(1)},${p[1].toFixed(1)} (cell ${Math.floor(p[0] / CELL)},${Math.floor(p[1] / CELL)}) reaches ${s.toFixed(2)} m past its colliders`)
        }
      }
    }
    expect(props).toBeGreaterThan(10_000)
    expect(bad.slice(0, 30), `${bad.length} solid props drawn over walkable ground`).toEqual([])
  }, 120_000)

  it('zones: every solid set piece, as drawn, stands on its colliders', async () => {
    stubCanvas()
    const { piecesOf } = await import('@/game/gfx/levelProps')
    const bad: string[] = []
    let n = 0
    for (const { name, plan, theme } of cases()) {
      const g = walkOf(plan)
      for (const { d, g: geo } of piecesOf(plan, piecePalette(THEMES[theme].ground[1], THEMES[theme].rim), g)) {
        const parts = [...geo.lit, ...geo.glow]
        if (DRESS_ROLE[d.kind] === 'solid') {
          n++
          const s = spillOf(g, footPoints(footOf(parts, BODY_H, GROUND_H)), d.x, d.z, d.a, 1)
          if (s > SOLID_TOL) bad.push(`${name}: ${d.kind} at ${d.x.toFixed(1)},${d.z.toFixed(1)} reaches ${s.toFixed(2)} m past its colliders`)
        }
        for (const x of parts) x.dispose()
      }
    }
    expect(n).toBeGreaterThan(300)
    expect(bad.slice(0, 30), `${bad.length} set pieces drawn over walkable ground`).toEqual([])
  }, 120_000)

  it('towns: every solid prop and the scenery stand on their colliders', async () => {
    stubCanvas()
    const { groundAt, setGround } = await import('@/game/gfx/ground')
    const bad: string[] = []
    for (const [t, flags] of TOWN_CASES) {
      const name = `${t}${flags.length ? ' (fallen)' : ''}`
      const plan = generateTown(TOWNS[t], new Set(flags), 7)
      setGround({ w: plan.w, h: plan.h, height: plan.height })
      const g = walkOf(plan)
      const town = plan.town!
      const jambs: Block[] = []
      for (const p of town.props) {
        if (TOWN_PROP_ROLE[p.kind] !== 'solid') continue
        const k = newKit()
        buildProp(k, p, { style: town.style, ruined: town.ruined, low: false, gy: groundAt })
        const parts = [k.hull, k.detail, k.glow].filter(m => !m.empty).map(m => m.build())
        const { spill } = worldSpill(g, parts, groundAt)
        for (const x of parts) x.dispose()
        if (spill > SOLID_TOL) bad.push(`${name}: ${p.kind} at ${p.x.toFixed(1)},${p.z.toFixed(1)} reaches ${spill.toFixed(2)} m past its colliders`)
      }
      // The houses: walls, roofs, porches and doors (the room's furniture is
      // the walk grid's furniture blocks: `furniture.test.ts`).
      for (let hi = 0; hi < town.houses.length; hi++) {
        const h = town.houses[hi]!
        const x = (h.i0 + h.cw / 2) * CELL
        const z = (h.j0 + h.cd / 2) * CELL
        const k = newKit()
        const out = buildHouse(k, h, { style: town.style, ruined: town.ruined, low: false, x, y: groundAt(x, z), z, cls: h.cls, inRoom: h.inside ? roomPropsOf(town, hi) : undefined })
        // A walked-in door's jambs stop the hero (`TownView` adds them to the grid's furniture).
        setBlocks(g, [...jambs, ...out.jambs])
        jambs.push(...out.jambs)
        const kits = out.cut && out.cut !== k ? [k, out.cut] : [k]
        const parts = kits.flatMap(q => [q.hull, q.detail, q.glow]).filter(m => !m.empty).map(m => m.build())
        const { spill } = worldSpill(g, parts, groundAt)
        for (const q of parts) q.dispose()
        if (spill > SOLID_TOL) bad.push(`${name}: house ${hi} (${h.kind}) at ${x.toFixed(1)},${z.toFixed(1)} reaches ${spill.toFixed(2)} m past its colliders`)
      }
      for (const grp of layTerrainProps(plan, flags.length ? 'ruin' : 'town')) {
        if (SCENERY_ROLE[grp.shape.kind] !== 'solid') continue
        const pts = bodyPoints(grp.shape)
        for (const p of grp.places) {
          const s = spillOf(g, pts, p[0], p[1], p[2], p[3])
          if (s > SOLID_TOL) bad.push(`${name}: ${grp.shape.kind} at ${p[0].toFixed(1)},${p[1].toFixed(1)} reaches ${s.toFixed(2)} m past its colliders`)
        }
      }
    }
    expect(bad.slice(0, 30), `${bad.length} town props drawn over walkable ground`).toEqual([])
  }, 120_000)
})

