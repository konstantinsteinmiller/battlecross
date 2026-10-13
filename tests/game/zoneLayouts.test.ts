import { describe, expect, it } from 'vitest'
import { fillGrid, generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { K_BLOCK, K_FORD, K_WATER } from '@/game/sim/zoneFeatures'
import { CELL, SOLID_LOW, cellOf, createGrid, findPath, type Grid } from '@/game/sim/grid'
import { DRESS_FOOT } from '@/game/sim/dressing'
import { ZONES, ZONE_FEATURES, ZONE_IDS, ZONE_SHAPE } from '@/game/data/zones'
import type { ZoneId } from '@/game/data/items'
import { groundAt, setGround } from '@/game/gfx/ground'

/**
 * Every place is laid out the way the place itself is (roadmap #120), not as
 * a variation of one chain of clearings: the Crags' lava tongues joined by
 * stepping stones, the path round Dragon's Peak to its summit, the Sunken
 * Temple's colonnaded chambers, the goblins' camp in the Hollows, the
 * Outskirts' windmills, and the rest. And everything big that stands in a
 * place stands in the way.
 */

const SEEDS = [1, 2, 3, 5, 7, 11, 42, 77, 1234, 99991]
const plans = (zone: ZoneId): ZonePlan[] => SEEDS.map(s => generateZone(ZONES[zone], s))
const gridOf = (plan: ZonePlan): Grid => fillGrid(createGrid(plan.w, plan.h), plan)
const cell = (plan: ZonePlan, x: number, z: number): number => cellOf(z) * plan.w + cellOf(x)
const pieces = (plan: ZonePlan, kind: string) => (plan.dressing ?? []).filter(d => d.kind === kind)
const fin = (plan: ZonePlan) => plan.packs[plan.packs.length - 1]!
const path: number[] = []

describe('each zone has a layout of its own', () => {
  it('no two zones share a shape, but the Plains keep the plain chain', () => {
    expect(new Set(ZONE_IDS.map(z => ZONE_SHAPE[z])).size).toBe(ZONE_IDS.length)
    expect(ZONE_SHAPE.plains).toBe('chain')
  })

  it('the Ashen Crags: tongues of crust in a sea of lava, crossed on stepping stones only', () => {
    for (const plan of plans('crags')) {
      const tag = `crags#${plan.seed}`
      let lava = 0
      for (let k = 0; k < plan.kind.length; k++) if (plan.kind[k] === K_WATER) lava++
      expect(lava, tag).toBeGreaterThan(250)
      // The road never runs through the lava; where it crosses it, it is on stones.
      const fords = plan.crossings.filter(c => c.kind === 'ford')
      expect(fords.length, tag).toBeGreaterThanOrEqual(2)
      for (let k = 0; k < plan.trail.length; k++) if (plan.trail[k]) expect(plan.kind[k], tag).not.toBe(K_WATER)
      // Take the stones away and the finale is out of reach from the start
      // (a loop off the road never crosses the lava).
      const g = gridOf(plan)
      for (const f of fords) for (const k of f.cells) g.solid[k] = SOLID_LOW
      expect(findPath(g, plan.start.x, plan.start.z, fin(plan).x, fin(plan).z, path, 20000), tag).toBe(0)
      // With them, the walk crosses them.
      const open = gridOf(plan)
      const n = findPath(open, plan.start.x, plan.start.z, fin(plan).x, fin(plan).z, path, 20000)
      expect(n, tag).toBeGreaterThan(0)
      let onStones = 0
      let px = plan.start.x
      let pz = plan.start.z
      for (let q = 0; q < n; q += 2) {
        for (let s = 0; s < 6; s++) if (plan.kind[cell(plan, px + ((path[q]! - px) * s) / 6, pz + ((path[q + 1]! - pz) * s) / 6)] === K_FORD) onStones++
        px = path[q]!
        pz = path[q + 1]!
      }
      expect(onStones, tag).toBeGreaterThan(4)
    }
  })

  it('Dragon\'s Peak: the path goes round the mountain, and the dragon waits on its summit, the highest ground', () => {
    for (const plan of plans('peak')) {
      const tag = `peak#${plan.seed}`
      expect(fin(plan).boss, tag).toBe(ZONES.peak.finale.leader)
      setGround({ w: plan.w, h: plan.h, height: plan.height })
      // The summit's floor holds the highest ground of the place.
      let top = -Infinity
      let rest = -Infinity
      for (let k = 0; k < plan.solid.length; k++) {
        if (plan.solid[k] || plan.kind[k] === K_WATER) continue
        const x = (k % plan.w + 0.5) * CELL
        const z = (Math.floor(k / plan.w) + 0.5) * CELL
        if (Math.hypot(x - fin(plan).x, z - fin(plan).z) <= fin(plan).r) top = Math.max(top, groundAt(x, z))
        else rest = Math.max(rest, groundAt(x, z))
      }
      expect(top, tag).toBeGreaterThan(rest)
      // The road passes every side of the summit: it goes round, not up a face.
      const sides = new Set<number>()
      for (let k = 0; k < plan.trail.length; k++) {
        if (!plan.trail[k]) continue
        const a = Math.atan2((Math.floor(k / plan.w) + 0.5) * CELL - fin(plan).z, (k % plan.w + 0.5) * CELL - fin(plan).x)
        sides.add(Math.floor(((a + Math.PI) / (Math.PI * 2)) * 8) % 8)
      }
      expect(sides.size, tag).toBe(8)
      // And it climbs: each shelf stands higher than the one before.
      const ys = plan.clearings.filter(c => c.role !== 'secret').map(c => groundAt(c.x, c.z))
      for (let q = 1; q < ys.length; q++) expect(ys[q]!, tag).toBeGreaterThan(ys[q - 1]! - 0.05)
    }
  })

  it('the Sunken Temple: column-lined chambers in crumbling walls, a pack in each', () => {
    for (const plan of plans('temple')) {
      const tag = `temple#${plan.seed}`
      for (const p of plan.packs) {
        // The chamber is the open rectangle round the pack: its columns stand inside it.
        const cols = [...pieces(plan, 'column'), ...pieces(plan, 'brokenColumn')].filter(c => Math.abs(c.x - p.x) < 9 * CELL && Math.abs(c.z - p.z) < 7 * CELL)
        expect(cols.length, `${tag} pack at ${p.x},${p.z}`).toBeGreaterThanOrEqual(1)
      }
      expect([...pieces(plan, 'column'), ...pieces(plan, 'brokenColumn')].length, tag).toBeGreaterThanOrEqual(4 * plan.packs.length)
      let ruin = 0
      for (const v of plan.masonry ?? []) if (v === 2) ruin++
      expect(ruin, tag).toBeGreaterThan(80)
    }
  })

  it('the Goblin Hollows are lived in: a fire in every den with its pack round it, beds with clubs, banners', () => {
    for (const plan of plans('hollows')) {
      const tag = `hollows#${plan.seed}`
      // A fire in the dens (a ledge or a cave mouth can leave one den no room for it).
      const dens = plan.packs.filter(q => !q.finale)
      const lit = dens.filter(p => pieces(plan, 'fire').some(f => Math.hypot(f.x - p.x, f.z - p.z) < p.r)).length
      expect(lit, tag).toBeGreaterThanOrEqual(dens.length - 1)
      expect(pieces(plan, 'bed').length, tag).toBeGreaterThanOrEqual(plan.packs.length - 1)
      for (const b of pieces(plan, 'bed')) expect(pieces(plan, 'club').some(c => Math.hypot(c.x - b.x, c.z - b.z) < 2), `${tag} a club by the bed`).toBe(true)
      expect(pieces(plan, 'banner').length, tag).toBeGreaterThanOrEqual(6)
    }
  })

  it('the Oakhaven Outskirts have a windmill or two among the wheat', () => {
    for (const plan of plans('outskirts')) {
      const n = pieces(plan, 'mill').length
      expect(n, `outskirts#${plan.seed}`).toBeGreaterThanOrEqual(1)
      expect(n, `outskirts#${plan.seed}`).toBeLessThanOrEqual(2)
    }
  })

  it('the rest: glades and giants, timbered drifts, a lake with floes, walled courts, a castle, islands in the void', () => {
    for (const plan of plans('woods')) {
      expect(pieces(plan, 'oldTree').length, `woods#${plan.seed}`).toBeGreaterThanOrEqual(2)
      expect(pieces(plan, 'claws').length + pieces(plan, 'mist').length, `woods#${plan.seed}`).toBeGreaterThan(0)
    }
    for (const plan of plans('mines')) {
      expect(pieces(plan, 'timber').length, `mines#${plan.seed}`).toBeGreaterThanOrEqual(3)
      expect(pieces(plan, 'rail').length, `mines#${plan.seed}`).toBeGreaterThan(8)
      expect(pieces(plan, 'cart').length, `mines#${plan.seed}`).toBeGreaterThanOrEqual(2)
    }
    for (const plan of plans('tundra')) {
      expect(plan.kind.includes(K_WATER), `tundra#${plan.seed}`).toBe(true)
      expect(pieces(plan, 'floe').length, `tundra#${plan.seed}`).toBeGreaterThan(3)
    }
    for (const z of ['citadel', 'fortress'] as const) {
      for (const plan of plans(z)) {
        let built = 0
        for (const v of plan.masonry ?? []) if (v === 1) built++
        expect(built, `${z}#${plan.seed}`).toBeGreaterThan(150)
        expect(pieces(plan, 'gateTower').length, `${z}#${plan.seed}`).toBeGreaterThanOrEqual(z === 'fortress' ? 6 : ZONES.citadel.sections * 2 - 2)
      }
    }
    for (const plan of plans('citadel')) expect(pieces(plan, 'pylon').length, `citadel#${plan.seed}`).toBeGreaterThanOrEqual(4)
    for (const plan of plans('rift')) {
      const tag = `rift#${plan.seed}`
      expect(ZONE_FEATURES.rift.liquid).toBe('void')
      expect(plan.crossings.filter(c => c.kind === 'bridge').length, tag).toBeGreaterThanOrEqual(ZONES.rift.sections - 1)
      // The finale's island floats: the void all round it but where its bridge lands.
      const f = fin(plan)
      let rim = 0
      let wet = 0
      for (let a = 0; a < 32; a++) {
        const k = cell(plan, f.x + Math.cos((a / 32) * Math.PI * 2) * (f.r + 2.2 * CELL), f.z + Math.sin((a / 32) * Math.PI * 2) * (f.r + 2.2 * CELL))
        rim++
        if (plan.kind[k] === K_WATER) wet++
      }
      expect(wet / rim, tag).toBeGreaterThan(0.6)
    }
  })
})

describe('set pieces', () => {
  it('what stands in the way blocks the walk grid, cell by cell, and never stands on the road', () => {
    for (const zone of ZONE_IDS) {
      for (const plan of plans(zone)) {
        const g = gridOf(plan)
        for (const d of plan.dressing ?? []) {
          const [a, b] = DRESS_FOOT[d.kind]
          expect(d.cells.length, `${zone}#${plan.seed} ${d.kind}`).toBe(a * b)
          for (const k of d.cells) {
            expect(plan.kind[k], `${zone}#${plan.seed} ${d.kind}`).toBe(K_BLOCK)
            expect(g.solid[k]! & SOLID_LOW, `${zone}#${plan.seed} ${d.kind}`).toBeTruthy()
            expect(plan.trail[k], `${zone}#${plan.seed} ${d.kind} on the road`).toBe(0)
          }
        }
      }
    }
  })

  it('beds, mills, columns and the rest are big enough to matter: a mill takes nine cells, a bed two', () => {
    expect(DRESS_FOOT.mill[0] * DRESS_FOOT.mill[1]).toBe(9)
    expect(DRESS_FOOT.bed[0] * DRESS_FOOT.bed[1]).toBe(2)
    for (const k of ['fire', 'tent', 'column', 'oldTree', 'log', 'cart', 'pylon', 'banner'] as const) expect(DRESS_FOOT[k][0] * DRESS_FOOT[k][1], k).toBeGreaterThan(0)
  })
})
