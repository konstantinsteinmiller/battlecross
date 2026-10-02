import { describe, expect, it } from 'vitest'
import { fillGrid, generateArena, generateTown, generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { K_BRIDGE, K_CLIFF, K_FORD, K_RAMP, K_WATER } from '@/game/sim/zoneFeatures'
import { CELL, cellOf, createGrid, findPath, isSolidAt, nearestOpen } from '@/game/sim/grid'
import { groundY, type HeightField } from '@/game/sim/ground'
import { SLOPE } from '@/game/sim/relief'
import { TOWNS, ZONES, ZONE_IDS, ZONE_RELIEF } from '@/game/data/zones'
import type { ZoneId } from '@/game/data/items'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { referenceBuild } from '@/game/sim/bot'
import { FollowCam } from '@/game/engine/camera'
import { clearGround, groundAt, setGround } from '@/game/gfx/ground'

/**
 * The lie of the land (roadmap #57): heights are smooth everywhere a body can
 * walk, step only at a ledge's marked cliff edge, keep water level in its
 * hollow, never cut the road, and a tap on a slope lands where the finger is.
 */

const SEEDS = [1, 2, 3, 5, 7, 11, 42, 77, 1234, 99991]
const fieldOf = (p: ZonePlan): HeightField => ({ w: p.w, h: p.h, height: p.height })
const every = (fn: (plan: ZonePlan, zone: ZoneId, tag: string) => void): void => {
  for (const zone of ZONE_IDS) for (const seed of SEEDS) fn(generateZone(ZONES[zone], seed), zone, `${zone}#${seed}`)
}
const path: number[] = []

describe('groundY', () => {
  it('is the corner heights at the corners, bilinear between, and clamped past the grid', () => {
    const f: HeightField = { w: 2, h: 1, height: new Float32Array([0, 1, 2, 3, 4, 5]) }
    expect(groundY(f, 0, 0)).toBe(0)
    expect(groundY(f, CELL, 0)).toBe(1)
    expect(groundY(f, 2 * CELL, CELL)).toBe(5)
    expect(groundY(f, CELL / 2, CELL / 2)).toBeCloseTo((0 + 1 + 3 + 4) / 4)
    expect(groundY(f, -10, -10)).toBe(0)
    expect(groundY(f, 99, 99)).toBe(5)
  })

  it('the same seed lies the same way; another seed, another', () => {
    const a = generateZone(ZONES.peak, 42)
    const b = generateZone(ZONES.peak, 42)
    expect(Array.from(a.height)).toEqual(Array.from(b.height))
    expect(Array.from(generateZone(ZONES.peak, 43).height)).not.toEqual(Array.from(a.height))
    expect(a.height.length).toBe((a.w + 1) * (a.h + 1))
  })
})

describe('relief in every zone', () => {
  it('nothing is dead flat, and the zones differ in character', () => {
    const spread = (zone: ZoneId): number => {
      let s = 0
      for (const seed of SEEDS) {
        const p = generateZone(ZONES[zone], seed)
        let lo = Infinity
        let hi = -Infinity
        for (const v of p.height) { lo = Math.min(lo, v); hi = Math.max(hi, v) }
        s += hi - lo
      }
      return s / SEEDS.length
    }
    for (const zone of ZONE_IDS) expect(spread(zone), zone).toBeGreaterThan(0.6)
    // The peak climbs; the plains roll.
    expect(spread('peak')).toBeGreaterThan(spread('plains'))
  })

  it('every slope a body walks is gentle: the ground only steps at a marked cliff', () => {
    every((plan, _zone, tag) => {
      const W1 = plan.w + 1
      const walk = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < plan.w && j < plan.h && !plan.solid[j * plan.w + i] && plan.kind[j * plan.w + i] !== K_CLIFF
      const cliff = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < plan.w && j < plan.h && plan.kind[j * plan.w + i] === K_CLIFF
      let worst = 0
      for (let j = 0; j < plan.h; j++) {
        for (let i = 0; i < plan.w; i++) {
          if (!walk(i, j)) continue
          const k = j * W1 + i
          const e = [[k, k + 1], [k + W1, k + W1 + 1], [k, k + W1], [k + 1, k + W1 + 1]] as const
          // A walkable cell beside a cliff may share its foot or its brow, nothing more.
          const nearCliff = cliff(i - 1, j) || cliff(i + 1, j) || cliff(i, j - 1) || cliff(i, j + 1)
          for (const [a, b] of e) {
            const d = Math.abs(plan.height[a]! - plan.height[b]!)
            if (!nearCliff) worst = Math.max(worst, d)
          }
        }
      }
      expect(worst, tag).toBeLessThanOrEqual(SLOPE + 0.02)
    })
  })

  it('a ledge is a real step: higher past its edge, with a ramp, and never across the road', () => {
    let ledges = 0
    every((plan, zone, tag) => {
      for (const l of plan.ledges) {
        ledges++
        expect(l.step, tag).toBeGreaterThanOrEqual(ZONE_RELIEF[zone].step[0] - 1e-6)
        const f = fieldOf(plan)
        // Down below the edge and up on top, a little way either side of it.
        const at = (s: number, t: number): number => groundY(f, l.x + l.ux * s - l.uz * t, l.z + l.uz * s + l.ux * t)
        const across = l.t0 + (l.half + 1.6 * CELL) * (l.t0 > 0 ? -1 : 1)
        expect(at(l.d0 + 1.2, across) - at(l.d0 - 1.2, across), tag).toBeGreaterThan(l.step * 0.6)
      }
      let cliffs = 0
      let ramps = 0
      for (let k = 0; k < plan.kind.length; k++) {
        if (plan.kind[k] === K_CLIFF) { cliffs++; expect(plan.trail[k], `${tag} a cliff across the road`).toBe(0) }
        if (plan.kind[k] === K_RAMP) ramps++
      }
      if (plan.ledges.length) { expect(cliffs, tag).toBeGreaterThan(0); expect(ramps, tag).toBeGreaterThan(0) }
      else expect(cliffs + ramps, tag).toBe(0)
    })
    expect(ledges).toBeGreaterThan(30)
  })

  it('what is up a ledge is reached by its ramp, and no ground is stranded', () => {
    every((plan, _zone, tag) => {
      const g = fillGrid(createGrid(plan.w, plan.h), plan)
      for (const l of plan.ledges) {
        const i = l.probe % plan.w
        const x = (i + 0.5) * CELL
        const z = ((l.probe - i) / plan.w + 0.5) * CELL
        expect(findPath(g, plan.start.x, plan.start.z, x, z, path) > 0, `${tag} ledge top`).toBe(true)
      }
      // Every open cell outside a sealed pocket can be walked to.
      const seen = new Uint8Array(plan.w * plan.h)
      const q = [cellOf(plan.start.z) * plan.w + cellOf(plan.start.x)]
      seen[q[0]!] = 1
      while (q.length) {
        const k = q.pop()!
        const i = k % plan.w
        const j = (k - i) / plan.w
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const nk = (j + dj) * plan.w + i + di
          if (seen[nk] || g.solid[nk]) continue
          seen[nk] = 1
          q.push(nk)
        }
      }
      let stranded = 0
      for (let k = 0; k < g.solid.length; k++) if (!g.solid[k] && !seen[k] && !plan.sealed[k]) stranded++
      expect(stranded, tag).toBe(0)
    })
  })

  it('water lies level in a hollow: its banks are never below it', () => {
    every((plan, _zone, tag) => {
      const f = fieldOf(plan)
      const wet = (k: number): boolean => plan.kind[k] === K_WATER || plan.kind[k] === K_BRIDGE || plan.kind[k] === K_FORD
      for (let j = 1; j < plan.h - 1; j++) {
        for (let i = 1; i < plan.w - 1; i++) {
          const k = j * plan.w + i
          if (!wet(k)) continue
          const W1 = plan.w + 1
          const c = [plan.height[j * W1 + i]!, plan.height[j * W1 + i + 1]!, plan.height[(j + 1) * W1 + i]!, plan.height[(j + 1) * W1 + i + 1]!]
          expect(Math.max(...c) - Math.min(...c), `${tag} water at ${i},${j} is level`).toBeLessThan(1e-4)
          const level = c[0]!
          for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
            const nk = (j + dj) * plan.w + i + di
            if (wet(nk) || plan.solid[nk]) continue
            expect(groundY(f, (i + di + 0.5) * CELL, (j + dj + 0.5) * CELL), `${tag} bank`).toBeGreaterThanOrEqual(level - 1e-4)
          }
        }
      }
    })
  })

  it('chests, plates and carved stones stand on level pads', () => {
    every((plan, _zone, tag) => {
      const W1 = plan.w + 1
      for (const c of plan.chests) {
        const i = cellOf(c.x)
        const j = cellOf(c.z)
        const h = [plan.height[j * W1 + i]!, plan.height[j * W1 + i + 1]!, plan.height[(j + 1) * W1 + i]!, plan.height[(j + 1) * W1 + i + 1]!]
        expect(Math.max(...h) - Math.min(...h), `${tag} chest ${c.id}`).toBeLessThan(0.05)
      }
    })
  })

  it('a raised dais lifts the finale above the ground round it', () => {
    let n = 0
    every((plan, _zone, tag) => {
      if (!plan.dais) return
      n++
      const f = fieldOf(plan)
      const d = plan.dais
      expect(groundY(f, d.x, d.z) - groundY(f, d.x + d.rim + 1.5, d.z), tag).toBeGreaterThan(0.3)
      // Not a ledge: the dais is walked up from every side.
      for (const l of plan.ledges) expect(Math.hypot(l.x - d.x, l.z - d.z), tag).toBeGreaterThan(1)
    })
    expect(n).toBeGreaterThan(10)
  })

  it('the first visit rolls gently and has no ledge or dais', () => {
    for (const seed of SEEDS) {
      const plan = generateZone(ZONES.plains, seed, { tutorial: true })
      expect(plan.ledges).toEqual([])
      expect(plan.dais).toBeNull()
    }
  })

  it('nobody starts a visit on a cliff edge', () => {
    for (const zone of ['crags', 'mines', 'peak', 'fortress', 'temple'] as ZoneId[]) {
      for (const seed of SEEDS) {
        const plan = generateZone(ZONES[zone], seed)
        const sim = new Sim({ seed, w: plan.w, h: plan.h, level: ZONES[zone].min, difficulty: 1, mode: 'zone', zone })
        applyPlan(sim, plan)
        const ref = referenceBuild({ level: ZONES[zone].min + 1, cls: 'aegis' })
        createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
        populateZone(sim, plan, zone, [])
        for (const u of sim.units) {
          expect(plan.kind[cellOf(u.z) * plan.w + cellOf(u.x)], `${zone}#${seed} ${u.kind}`).not.toBe(K_CLIFF)
          expect(isSolidAt(sim.grid, u.x, u.z)).toBe(false)
        }
        // A blink or a shove that lands on a cliff edge is put on open ground beside it.
        const out: [number, number] = [0, 0]
        for (let k = 0; k < plan.kind.length; k++) {
          if (plan.kind[k] !== K_CLIFF) continue
          const x = (k % plan.w + 0.5) * CELL
          const z = (Math.floor(k / plan.w) + 0.5) * CELL
          expect(nearestOpen(sim.grid, x, z, out, 4)).toBe(true)
          expect(plan.kind[cellOf(out[1]) * plan.w + cellOf(out[0])]).not.toBe(K_CLIFF)
        }
      }
    }
  })

  it('a town slopes gently, with every house and every townsperson on level ground', () => {
    for (const town of Object.keys(TOWNS) as Array<keyof typeof TOWNS>) {
      const plan = generateTown(TOWNS[town], new Set(), 7)
      const f = fieldOf(plan)
      for (const b of plan.buildings) {
        const ys = [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5], [0, 0]].map(([dx, dz]) => groundY(f, b.x + dx! * b.w, b.z + dz! * b.d))
        expect(Math.max(...ys) - Math.min(...ys), `${town} house`).toBeLessThan(0.01)
      }
      for (const n of plan.npcs) expect(Math.abs(groundY(f, n.x + 0.5, n.z) - groundY(f, n.x - 0.5, n.z)), town).toBeLessThan(0.01)
    }
    // The colosseum's sand is raked flat.
    expect(generateArena(4).height.every(v => v === 0)).toBe(true)
  })
})

describe('the pick ray', () => {
  it('a tap on a slope lands on the ground point under the finger', () => {
    const plan = generateZone(ZONES.peak, 77)
    const f = fieldOf(plan)
    setGround(f)
    try {
      const cam = new FollowCam()
      cam.setViewport(390, 780)
      let checked = 0
      for (const [ci, c] of plan.clearings.entries()) {
        if (c.role === 'secret') continue
        cam.snap()
        cam.follow(c.x, c.z, 0, 0, 0.016, groundAt(c.x, c.z))
        cam.update(0)
        for (let a = 0; a < 12; a++) {
          const r = (a % 3 + 1) * 1.6
          const x = c.x + Math.cos(a * 0.9 + ci) * r
          const z = c.z + Math.sin(a * 0.9 + ci) * r
          // Points beside a cliff can be hidden by it; the rest must come back.
          let cliffNear = false
          for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) {
            const i = cellOf(x) + di
            const j = cellOf(z) + dj
            if (i >= 0 && j >= 0 && i < plan.w && j < plan.h && plan.kind[j * plan.w + i] === K_CLIFF) cliffNear = true
          }
          if (cliffNear) continue
          const s = { x: 0, y: 0 }
          expect(cam.project(x, groundY(f, x, z), z, s)).toBe(true)
          const g = { x: 0, z: 0 }
          expect(cam.screenToGround(s.x, s.y, g)).toBe(true)
          expect(Math.hypot(g.x - x, g.z - z), `clearing ${ci} point ${a}`).toBeLessThan(0.12)
          checked++
        }
      }
      expect(checked).toBeGreaterThan(20)
      // And the view's height follows the ground under its target.
      const cam2 = new FollowCam()
      cam2.setViewport(390, 780)
      const c = plan.clearings[plan.clearings.length - 1]!
      cam2.follow(c.x, c.z, 0, 0, 0.016, groundAt(c.x, c.z))
      expect(cam2.target.y).toBeCloseTo(groundY(f, c.x, c.z))
    } finally {
      clearGround(f)
    }
    expect(groundAt(10, 10)).toBe(0)
  })
})
