// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { CELL, ROUND_R, SOLID_LOW, SOLID_ROUND, createGrid, moveCircle, resolveCircle } from '@/game/sim/grid'
import { generateArena, generateEncounter, generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { K_BLOCK, K_CLIFF, K_WATER, hintCells } from '@/game/sim/zoneFeatures'
import { ZONES, ZONE_IDS, type ThemeId } from '@/game/data/zones'
import { invadedZone } from '@/game/data/invasion'
import { layScenery, shapeFoot, wetCell } from '@/game/gfx/terrain'
import { COVER_TOL, FootIndex, cellSamples, footOf } from '@/game/gfx/footprint'
import { piecePalette, setPiece } from '@/game/gfx/setPieces'
import { mulberry32 } from '@/game/sim/rng'
import { WAY_W } from '@/game/sim/widen'
import { discSamples, gridOf, owner, pointsOf, touchable, triDist2, widthField, widthTo } from './walkTruthTools'
import { stubCanvas, trisOfScene } from './zfightTools'

/**
 * No invisible walls, and a road to everything (playtest: in the Whisperwood
 * the hero could not walk along an open grass line between two chests).
 *
 * (a) Every blocked cell the hero can touch is something drawn: scenery whose
 *     footprint from above covers the whole cell (within `COVER_TOL`), water,
 *     a cliff, a level prop that stands on it, or the rock of a sealed pocket.
 *     The walkable ground never reaches the grid's edge (whose outside is solid).
 * (b) From the start, a way at least `PATH_W` wide runs to every place one
 *     goes to: each pack and the finale, every chest, plate, cave, sign, herb,
 *     ore, map piece, key and the training dummy.
 *
 * Every procedurally laid place: each zone, its first visit, a random
 * encounter and an escort, and the colosseum; many seeds each.
 */

/**
 * The narrowest way the hero is ever sent along (m): 2.4 m, his body (0.9 m
 * across) and three quarters of a metre to spare either side: a way, not a
 * gap he threads. One cell (1.5 m) between two walls of scenery read as a
 * gap, and was what the side places were reached by. The generator cuts its
 * ways 3 m wide (`WAY_W`, two cells); this field samples every 0.3 m, which
 * reads a way up to 0.42 m narrower than it is, so 3 m measures ≥ 2.58.
 */
const PATH_W = 2.4

/** 16 seeds a place in the suite; `WT_SEEDS=200` for a soak. */
const SEEDS = Array.from({ length: Number(process.env.WT_SEEDS) || 16 }, (_, k) => 1 + k * 7919)

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
  for (const seed of SEEDS) {
    yield { name: `encounter#${seed}`, theme: 'plains', plan: generateEncounter([['goblin'], ['goblin', 'goblin']], seed) }
    yield { name: `escort#${seed}`, theme: 'forest', plan: generateEncounter([['goblin'], ['goblin'], ['goblin']], seed, { escort: true }) }
    yield { name: `arena#${seed}`, theme: 'arena', plan: generateArena(seed) }
  }
}

/** Each set piece kind's footprint, by its seed (a piece is built from one). */
const pieceIndex = (plan: ZonePlan, theme: ThemeId, into: FootIndex): void => {
  const pal = piecePalette('#557744', '#223322')
  ;(plan.dressing ?? []).forEach((d, q) => {
    const g = setPiece(d.kind, pal, (q * 7 + Math.floor(d.x * 3 + d.z * 5)) >>> 0)
    into.add({ foot: footOf([...g.lit, ...g.glow]), x: d.x, z: d.z, rot: d.a, sc: 1 })
  })
  void theme
}

describe('walk truth: no invisible walls, a road to everything', () => {
  it('(a) every blocked cell the hero can touch is drawn, and covered by what is drawn', () => {
    const bad: string[] = []
    for (const { name, plan, theme } of cases()) {
      const g = gridOf(plan, false)
      const { w, h } = plan
      // The walkable ground keeps off the grid's edge: past it is solid nobody drew.
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        if ((i === 0 || j === 0 || i === w - 1 || j === h - 1) && !g.solid[j * w + i]) bad.push(`${name}: walkable cell ${i},${j} on the grid's edge`)
      }
      const scenery = new FootIndex()
      for (const grp of layScenery(plan, theme, mulberry32(plan.seed ^ 0x51ab), false)) {
        const f = shapeFoot(grp.shape)
        for (const p of grp.places) scenery.add({ foot: f, x: p[0], z: p[1], rot: p[2], sc: p[3] })
      }
      const pieces = new FootIndex()
      pieceIndex(plan, theme, pieces)
      // What stands on a level prop's cell.
      const owned = new Map<number, string>()
      const own = (x: number, z: number, what: string): void => { owned.set(Math.floor(z / CELL) * w + Math.floor(x / CELL), what) }
      for (const c of plan.chests) own(c.x, c.z, 'chest')
      // The camp's big cage covers three cells (#156).
      for (const k of plan.camp?.cells ?? []) owned.set(k, 'cage')
      for (const s of plan.signs) own(s.x, s.z, 'sign')
      for (const s of plan.forks) own(s.x, s.z, 'fork')
      if (plan.puzzle) for (const k of hintCells(Math.floor(plan.puzzle.hint.z / CELL) * w + Math.floor(plan.puzzle.hint.x / CELL))) owned.set(k, 'hint')
      for (const o of plan.ores ?? []) own(o.x, o.z, 'ore')
      const pieceCells = new Map<number, string>()
      for (const d of plan.dressing ?? []) for (const k of d.cells) pieceCells.set(k, d.kind)
      for (const k of touchable(g)) {
        const i = k % w
        const j = (k - i) / w
        const at = `${name}: cell ${i},${j}`
        if (plan.solid[k]) {
          const miss = cellSamples(i, j, CELL).filter(([x, z]) => !scenery.covered(x, z))
          if (miss.length) bad.push(`${at} is rock with ${miss.length}/16 of it bare`)
        } else if (plan.sealed[k]) {
          if (!plan.doors.some(d => d.cells.includes(k))) bad.push(`${at} is sealed by no door`)
        } else if (plan.kind[k] === K_WATER) {
          if (!wetCell(plan, i, j)) bad.push(`${at} is water nobody drew`)
        } else if (plan.kind[k] === K_CLIFF) {
          // The cliff's face is the ground itself (banded rock), always drawn.
        } else if (plan.kind[k] === K_BLOCK) {
          if (pieceCells.has(k)) {
            const miss = cellSamples(i, j, CELL).filter(([x, z]) => !pieces.covered(x, z))
            if (miss.length) bad.push(`${at} is a set piece (${pieceCells.get(k)}) with ${miss.length}/16 of it bare`)
          } else if (!owned.has(k)) bad.push(`${at} is blocked with nothing on it`)
        } else bad.push(`${at} blocked for no reason (kind ${plan.kind[k]})`)
      }
    }
    if (process.env.WT_DEBUG) {
      const by = new Map<string, number>()
      for (const b of bad) { const k = b.replace(/#\d+| first visit/, '').replace(/cell \d+,\d+/, 'cell').replace(/\d+\/16/, 'n/16'); by.set(k, (by.get(k) ?? 0) + 1) }
      console.log([...by].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} | ${k}`).join('\n'))
    }
    expect(bad.slice(0, 40), `${bad.length} bare cells`).toEqual([])
  }, 600_000)

  it(`(b) a way at least ${PATH_W} m wide runs from the start to every place one goes to`, () => {
    const bad: string[] = []
    const half = PATH_W / 2
    let narrowest = Infinity
    for (const { name, plan } of cases()) {
      // Behind a door is reached once it opens: the doors stand open here.
      const f = widthField(gridOf(plan, true), plan.start.x, plan.start.z, half + 0.3 + CELL / 2)
      for (const p of pointsOf(plan)) {
        // The way's edge comes to within arm's length of the thing's own cell.
        const reach = half + 0.3 + CELL / 2
        const r = widthTo(f, (Math.floor(p.x / CELL) + 0.5) * CELL, (Math.floor(p.z / CELL) + 0.5) * CELL, reach)
        narrowest = Math.min(narrowest, r * 2)
        if (r < half) bad.push(`${name}: ${p.what} at ${p.x.toFixed(1)},${p.z.toFixed(1)} only ${(r * 2).toFixed(2)} m wide`)
      }
    }
    expect(bad.slice(0, 40), `${bad.length} narrow ways (narrowest ${narrowest.toFixed(2)} m)`).toEqual([])
  }, 600_000)

  it('(a) every level prop (chest, cage, post, hint stone, ore) covers its collider', async () => {
    stubCanvas()
    const { Scene } = await import('three')
    const { LevelProps } = await import('@/game/gfx/levelProps')
    const { Vfx } = await import('@/game/gfx/vfx')
    const { setGround } = await import('@/game/gfx/ground')
    const { THEMES } = await import('@/game/gfx/terrain')
    const { Sim } = await import('@/game/sim/world')
    const { applyPlan, populateZone } = await import('@/game/sim/director')
    const bad: string[] = []
    for (const z of ZONE_IDS) {
      // Seed 0: the first visit (the plains' only), its big cage in the camp (#156).
      for (const seed of z === 'plains' ? [3, 8, 11, 0] : [3, 8, 11]) {
        const odd = seed % 2 === 1
        const plan = seed ? generateZone(ZONES[z], seed, { cage: odd, treasure: !odd }) : generateZone(ZONES[z], 3, { tutorial: true, openingPack: 2 })
        setGround({ w: plan.w, h: plan.h, height: plan.height })
        const scene = new Scene()
        const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: z })
        applyPlan(sim, plan)
        populateZone(sim, plan, z, [])
        await new LevelProps(sim, new Vfx(scene), THEMES[ZONES[z].theme]).build(plan, scene)
        const tris = trisOfScene(scene, [], 300)
        const pieceCells = new Set<number>()
        for (const d of plan.dressing ?? []) for (const k of d.cells) pieceCells.add(k)
        // A cage and the hint stone stop a body by their whole cells (`fillGrid`): those are covered square.
        const square = new Set<number>()
        for (const c of plan.chests) if (c.role === 'cage') square.add(Math.floor(c.z / CELL) * plan.w + Math.floor(c.x / CELL))
        // The camp's big cage stands on three cells (#156).
        for (const k of plan.camp?.cells ?? []) square.add(k)
        if (plan.puzzle) for (const k of hintCells(Math.floor(plan.puzzle.hint.z / CELL) * plan.w + Math.floor(plan.puzzle.hint.x / CELL))) square.add(k)
        // Doors open: a chest in a pocket is square rock until its door opens, then round.
        const g = gridOf(plan, true)
        for (let k = 0; k < plan.kind.length; k++) {
          if (plan.kind[k] !== K_BLOCK || pieceCells.has(k)) continue
          const i = k % plan.w
          const j = (k - i) / plan.w
          const near = tris.filter(t => Math.max(t.ax, t.bx, t.cx) >= i * CELL - COVER_TOL && Math.min(t.ax, t.bx, t.cx) <= (i + 1) * CELL + COVER_TOL &&
            Math.max(t.az, t.bz, t.cz) >= j * CELL - COVER_TOL && Math.min(t.az, t.bz, t.cz) <= (j + 1) * CELL + COVER_TOL)
          if (square.has(k)) {
            if (g.solid[k] !== SOLID_LOW) { bad.push(`${z}#${seed}: square level prop cell ${i},${j} is not square (${g.solid[k]})`); continue }
            const miss = cellSamples(i, j, CELL).filter(([x, zz]) => !near.some(t => triDist2(t, x, zz) <= COVER_TOL))
            if (miss.length) bad.push(`${z}#${seed}: level prop ${owner(plan, k)} at cell ${i},${j} with ${miss.length}/16 of its cell bare`)
            continue
          }
          // The collider is the disc round the cell's middle (`SOLID_ROUND`), not the square.
          if (g.solid[k] !== (SOLID_LOW | SOLID_ROUND)) { bad.push(`${z}#${seed}: level prop cell ${i},${j} is not round (${g.solid[k]})`); continue }
          const pts = discSamples((i + 0.5) * CELL, (j + 0.5) * CELL, ROUND_R)
          const miss = pts.filter(([x, zz]) => !near.some(t => triDist2(t, x, zz) <= COVER_TOL))
          if (miss.length) bad.push(`${z}#${seed}: level prop ${owner(plan, k)} at cell ${i},${j} with ${miss.length}/${pts.length} of its collider bare`)
        }
      }
    }
    expect(bad.slice(0, 40), `${bad.length} bare level-prop cells`).toEqual([])
  }, 600_000)

  it('a level prop stops the hero at its round footprint: he walks past its cell\'s corner, not into its middle', () => {
    const g = createGrid(5, 5)
    g.solid[2 * 5 + 2] = SOLID_LOW | SOLID_ROUND
    const out: [number, number] = [0, 0]
    // Straight at it: stopped a hero's radius short of the disc.
    moveCircle(g, 3.75, 0.5, 0, 3, 0.45, out)
    expect(out[1]).toBeCloseTo(3.75 - ROUND_R - 0.45, 1)
    // At the cell's corner, where the square's collider stood and nothing is drawn: left alone.
    resolveCircle(g, 2.8, 2.8, 0.45, out)
    expect(out).toEqual([2.8, 2.8])
    // A square cell (rock) still pushes him off it.
    g.solid[2 * 5 + 2] = 1
    resolveCircle(g, 2.8, 2.8, 0.45, out)
    expect(Math.hypot(out[0] - 2.8, out[1] - 2.8)).toBeGreaterThan(0.1)
  })

  it('the cover tolerance is under the hero\'s radius; the way the generator cuts is as wide as this asks', () => {
    expect(COVER_TOL).toBeLessThan(0.45)
    expect(WAY_W).toBeGreaterThanOrEqual(PATH_W)
    expect(PATH_W).toBeGreaterThan(2 * 0.9)
  })
})
