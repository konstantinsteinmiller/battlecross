// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Matrix4 } from 'three'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { stubCanvas, trisOf, findFights, describe1, type Tri } from './zfightTools'
import { generateZone, fillGrid } from '@/game/sim/zoneGen'
import { ZONES, ZONE_IDS } from '@/game/data/zones'
import { HERBS_MAX, HERBS_MIN, PLANTS, PLANT_IDS, plantsOf } from '@/game/data/plants'
import { ERRANDS } from '@/game/data/errands'
import type { ZoneId } from '@/game/data/items'
import { PICK_REACH } from '@/game/sim/herbs'
import { CELL, cellOf, createGrid, findPath, isSolidAt } from '@/game/sim/grid'
import { K_GROUND } from '@/game/sim/zoneFeatures'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { referenceBuild } from '@/game/sim/bot'

/**
 * Herbs in the wild (roadmap #88): six or seven a visit, of what grows in
 * the place, where the hero can walk to them; picked by walking over them,
 * into the pouch at the end of the visit.
 */

stubCanvas()
const SEEDS = [1, 2, 3, 7, 11, 42, 77, 1234]

describe('where herbs grow', () => {
  it('every zone holds 6 or 7 a visit, of its own plants, on ground the hero walks to, apart', () => {
    for (const zone of ZONE_IDS) {
      const def = ZONES[zone]
      const kinds = new Set(plantsOf(def.id).map(p => p.id))
      expect(kinds.size, zone).toBeGreaterThanOrEqual(2)
      for (const seed of SEEDS) {
        const plan = generateZone(def, seed)
        const herbs = plan.herbs ?? []
        const tag = `${zone}#${seed}`
        expect(herbs.length, tag).toBeGreaterThanOrEqual(HERBS_MIN)
        expect([HERBS_MIN, HERBS_MAX], tag).toEqual([6, 7])
        expect(herbs.length, tag).toBeLessThanOrEqual(HERBS_MAX)
        const g = fillGrid(createGrid(plan.w, plan.h), plan)
        const path: number[] = []
        for (const h of herbs) {
          expect(kinds.has(h.kind), `${tag} ${h.kind}`).toBe(true)
          expect(isSolidAt(g, h.x, h.z), `${tag} ${h.kind} in rock`).toBe(false)
          expect(plan.kind[cellOf(h.z) * plan.w + cellOf(h.x)], tag).toBe(K_GROUND)
          expect(findPath(g, plan.start.x, plan.start.z, h.x, h.z, path), `${tag} ${h.kind} out of reach`).toBeGreaterThan(0)
          for (const c of plan.chests) expect(Math.hypot(c.x - h.x, c.z - h.z), tag).toBeGreaterThanOrEqual(2.5)
          for (const o of herbs) if (o !== h) expect(Math.hypot(o.x - h.x, o.z - h.z), tag).toBeGreaterThanOrEqual(6.9)
        }
      }
    }
  })

  it('a seed lays the same herbs; another seed lays others', () => {
    const a = generateZone(ZONES.woods, 7).herbs
    expect(generateZone(ZONES.woods, 7).herbs).toEqual(a)
    expect(generateZone(ZONES.woods, 8).herbs).not.toEqual(a)
  })

  it('the first visit and a bare chain hold none', () => {
    expect(generateZone(ZONES.plains, 1, { tutorial: true }).herbs).toEqual([])
    expect(generateZone(ZONES.plains, 1, { bare: true }).herbs).toEqual([])
  })

  it('every plant grows somewhere, the rare ones only past the first zones', () => {
    for (const p of PLANTS) {
      expect(ZONE_IDS.some(z => plantsOf(z).some(q => q.id === p.id)), p.id).toBe(true)
    }
    expect(plantsOf('plains').some(p => p.id === 'moonbell')).toBe(false)
    // The heal plant of the board's task (#85) grows in the first zone.
    expect(plantsOf('plains').some(p => p.id === 'sunpetal')).toBe(true)
  })
})

describe('picking them', () => {
  it('walking over one picks it, once; the visit counts it', () => {
    const plan = generateZone(ZONES.woods, 7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 6, difficulty: 1, mode: 'zone', zone: 'woods' })
    applyPlan(sim, plan)
    const ref = referenceBuild({ level: 7, cls: 'aegis' })
    createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    populateZone(sim, plan, 'woods', [])
    expect(sim.herbs.length).toBe(plan.herbs!.length)
    const h = sim.herbs[0]!
    const u = sim.hero.unit
    u.x = u.px = h.x + PICK_REACH * 0.5
    u.z = u.pz = h.z
    sim.events.length = 0
    stepSim(sim, plan, 1 / 30)
    expect(h.taken).toBe(true)
    expect(sim.hero.herbs[h.kind]).toBe(1)
    expect(sim.events.filter(e => e.t === 'herb')).toHaveLength(1)
    stepSim(sim, plan, 1 / 30)
    expect(sim.hero.herbs[h.kind]).toBe(1)
    // Out of reach: left where it grows.
    const o = sim.herbs[1]!
    expect(Math.hypot(o.x - u.x, o.z - u.z)).toBeGreaterThan(PICK_REACH)
    expect(o.taken).toBe(false)
    expect(CELL).toBeGreaterThan(PICK_REACH)
  })
})

describe('the pouch', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  beforeEach(async () => {
    drainAndResetModules()
    localStorage.clear()
    await holdGameState()
    p = await import('@/game/state/profile')
    p.initProfile()
  })
  afterEach(() => { drainPersist(); vi.restoreAllMocks() })

  it('fills from a visit, spends all or nothing, and keeps only plants it knows across a save', async () => {
    p.addHerbs({ sunpetal: 4, glowcap: 1, nettle: 9 })
    expect(p.herbCount('sunpetal')).toBe(4)
    expect(p.herbCount('nettle')).toBe(0)
    expect(p.spendHerbs({ sunpetal: 3, glowcap: 2 })).toBe(false)
    expect(p.herbCount('sunpetal')).toBe(4)
    expect(p.spendHerbs({ sunpetal: 3, glowcap: 1 })).toBe(true)
    expect(p.profile.inv.herbs).toEqual({ sunpetal: 1 })
    p.addHerbs({ moonbell: 500 })
    expect(p.herbCount('moonbell')).toBe(99)
    p.saveProfile()
    drainAndResetModules()
    await holdGameState()
    const q = await import('@/game/state/profile')
    q.initProfile()
    expect(q.profile.inv.herbs).toEqual({ sunpetal: 1, moonbell: 99 })
  })
})

describe('the herb models', () => {
  it('no two faces of a herb fight over the same pixels', async () => {
    const { plantGeometry } = await import('@/game/gfx/plants')
    const bad: string[] = []
    for (const id of PLANT_IDS) {
      const g = plantGeometry(id)
      const tris: Tri[] = []
      trisOf(g.lit, new Matrix4(), `${id}`, tris, 'lit')
      if (g.glow) trisOf(g.glow, new Matrix4(), `${id}:glow`, tris, 'glow')
      const f = findFights(tris, 0.006, 0.004, 8).map(describe1)
      if (f.length) bad.push(`${id}: ${f.slice(0, 3).join(' | ')}`)
    }
    expect(bad).toEqual([])
  })
})

describe('plants grow where they belong (#112, #114)', () => {
  it('an errand that sends the hero to a place for its plant finds it growing there', () => {
    for (const e of ERRANDS) {
      const place = e.steps.find(s => s.kind === 'slay' && s.place)?.place
      for (const s of e.steps) {
        if (s.kind !== 'gather' || !place || !s.plant) continue
        const grows = plantsOf(place as ZoneId).some(p => p.id === s.plant)
        const anywhere = ZONE_IDS.some(z => plantsOf(z).some(p => p.id === s.plant))
        expect(anywhere, `${e.id}: ${s.plant} grows nowhere`).toBe(true)
        // The Collector's and Old Rowan's moonbells are where they say: the Woods.
        if (s.plant === 'moonbell') expect(grows, `${e.id}: moonbells in ${place}`).toBe(true)
      }
    }
    expect(plantsOf('woods').some(p => p.id === 'moonbell')).toBe(true)
  })

  it('no sun petals in the drowned temple; every zone grows at least two kinds', () => {
    expect(plantsOf('temple').some(p => p.id === 'sunpetal')).toBe(false)
    for (const z of ZONE_IDS) expect(plantsOf(z).length, z).toBeGreaterThanOrEqual(2)
  })
})
