// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { ITEMS, ITEM_BY_ID, MYTHICS, TIER_COLOR, sellValue, sellable } from '@/game/data/items'
import { ZONE_LOOT } from '@/game/data/loot'
import { ARENA_MILESTONES, milestoneAt, nextMilestone } from '@/game/data/arena'
import { generateArena } from '@/game/sim/zoneGen'
import { Sim } from '@/game/sim/world'
import { applyPlan } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { referenceBuild } from '@/game/sim/bot'
import { ArenaCrowd } from '@/game/gfx/arenaCrowd'
import { stubCanvas, trisOfScene, findFights, describe1 } from './zfightTools'

/**
 * The colosseum (roadmap #117): six milestones of the ladder each hand over a
 * mythic piece once, the only way to get one; and the stands, crowd and
 * banners round the sand never put two faces in one plane.
 */

stubCanvas()

describe('mythic gear', () => {
  it('six pieces, one a milestone, a quality above the legendaries; never dropped, sold or shopped', () => {
    expect(MYTHICS).toHaveLength(ARENA_MILESTONES.length)
    expect(TIER_COLOR[7]).toBeTruthy()
    const ids = new Set(MYTHICS.map(i => i.id))
    for (const m of ARENA_MILESTONES) {
      const it = ITEM_BY_ID[m.item]!
      expect(it, m.item).toBeTruthy()
      expect(it.tier).toBe(7)
      expect(it.unique).toBe(true)
      expect(sellable(it)).toBe(false)
      expect(sellValue(it)).toBe(0)
    }
    for (const i of ITEMS) expect(ids.has(i.id), i.id).toBe(false)
    for (const z of Object.values(ZONE_LOOT)) for (const id of z?.items ?? []) expect(ids.has(id), id).toBe(false)
    // One per slot: every build has a reason to climb.
    expect(new Set(MYTHICS.map(i => i.slot)).size).toBe(MYTHICS.length)
  })

  it('milestones climb, the next is the first not won', () => {
    const waves = ARENA_MILESTONES.map(m => m.wave)
    expect(waves).toEqual([...waves].sort((a, b) => a - b))
    expect(milestoneAt(10)?.item).toBe('laurelOfTheVictor')
    expect(milestoneAt(11)).toBeUndefined()
    expect(nextMilestone(() => false)?.wave).toBe(10)
    expect(nextMilestone(id => id === 'laurelOfTheVictor')?.wave).toBe(15)
    expect(nextMilestone(() => true)).toBeUndefined()
  })
})

const arenaSim = () => {
  const plan = generateArena(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 30, difficulty: 1, mode: 'arena' })
  applyPlan(sim, plan)
  const ref = referenceBuild({ level: 30, cls: 'aegis' })
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  return { plan, sim }
}

describe('the ladder\'s milestones', () => {
  it('the wave that completes one hands its mythic over in the sand, once', () => {
    const { plan, sim } = arenaSim()
    // The tenth wave has just fallen (nothing alive, not yet counted).
    sim.wave.n = 10
    sim.wave.cleared = 9
    stepSim(sim, plan, 1 / 30)
    expect(sim.hero.items).toContain('laurelOfTheVictor')
    expect(sim.events.some(e => e.t === 'milestone' && e.wave === 10 && e.fresh)).toBe(true)
    expect(sim.events.some(e => e.t === 'loot' && e.item === 'laurelOfTheVictor')).toBe(true)
  })

  it('an owned prize is not given again (the milestone is still announced)', () => {
    const { plan, sim } = arenaSim()
    sim.owned.add('gripsOfTheGladiator')
    sim.wave.n = 15
    sim.wave.cleared = 14
    stepSim(sim, plan, 1 / 30)
    expect(sim.hero.items).not.toContain('gripsOfTheGladiator')
    expect(sim.events.some(e => e.t === 'milestone' && e.wave === 15 && !e.fresh)).toBe(true)
  })
})

describe('the stands, the crowd and the banners', () => {
  it('no two faces fight over the same pixels', () => {
    const plan = generateArena(7)
    for (const low of [true, false]) {
    const crowd = new ArenaCrowd(plan, { emit: () => {} } as never, low)
    crowd.root.updateMatrixWorld(true)
    const f = findFights(trisOfScene(crowd.root), 0.006, 0.004, 8).map(describe1)
    expect(f).toEqual([])
    }
  })
})
