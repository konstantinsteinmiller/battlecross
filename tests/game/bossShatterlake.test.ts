import { describe, expect, it } from 'vitest'
import { Sim, hasStatus } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { cellIndex, raiseWall } from '@/game/sim/actors'
import { isSolidAt } from '@/game/sim/grid'
import { startAttrs } from '@/game/data/attributes'
import { laneLength } from '@/game/sim/bosses/kit'
import type { Unit } from '@/game/sim/types'

/**
 * The Frost Jarl, Shatterlake (#74): hammerfall raises ice spikes where the
 * hero stood; his shoulder charge shatters on one and leaves him dazed (the
 * rock only staggers him); at half the ice breaks and a glacier grinds across.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 19, difficulty: 1, mode: 'zone', zone: 'tundra' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 19, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
  })
  sim.hero.unit.s.maxHp = sim.hero.unit.hp = 1e7
  return sim
}
const step = (sim: Sim, seconds: number, until?: () => boolean): void => {
  for (let t = 0; t < seconds; t += 1 / 30) {
    stepSim(sim, plan, 1 / 30)
    sim.events.length = 0
    if (until?.()) return
  }
}
/** The Jarl `dist` m off along an open lane, awake, only the moves a test names ready. */
const jarl = (sim: Sim, ready: string[] = [], dist = 8): Unit => {
  const h = sim.hero.unit
  let ax = 0
  let az = -1
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2
    if (laneLength(sim, h.x, h.z, Math.sin(a), Math.cos(a), dist + 4) >= dist + 3) { ax = Math.sin(a); az = Math.cos(a); break }
  }
  const j = spawnEnemy(sim, 'frostJarl', h.x + ax * dist, h.z + az * dist)!
  j.awake = true
  j.targetId = h.id
  j.homeX = j.x
  j.homeZ = j.z
  for (let i = 0; i < j.cds.length; i++) j.cds[i] = 99
  for (const k of ['hammer', 'charge', 'glacierNext']) j.boss!.cd[k] = ready.includes(k) ? 0 : 99
  return j
}

describe('Shatterlake, the Frost Jarl (#74)', () => {
  it('hammerfall comes down where the hero stood and raises a row of ice spikes there', () => {
    const sim = arena()
    const h = sim.hero.unit
    const j = jarl(sim, ['hammer'])
    const hp = h.hp
    step(sim, 3, () => sim.walls.length > 0)
    expect(sim.walls.length).toBe(1)
    expect(sim.walls[0]!.fx).toBe('ice')
    expect(hp - h.hp).toBeGreaterThan(j.s.baseDmg)
    // The spikes stand, then melt away.
    step(sim, 9)
    expect(sim.walls.length).toBe(0)
  })

  it('a shoulder charge into an ice spike shatters it and leaves him dazed 3 s', () => {
    const sim = arena()
    const h = sim.hero.unit
    const j = jarl(sim, ['charge'])
    step(sim, 1, () => j.action?.id === 'charge')
    expect(j.action?.id).toBe('charge')
    // An ice spike rises in his lane, between him and the hero.
    const a = j.action!.a
    const sx = j.x + Math.sin(a) * 4
    const sz = j.z + Math.cos(a) * 4
    raiseWall(sim, [cellIndex(sim, sx, sz)], 8, 'ice')
    expect(isSolidAt(sim.grid, sx, sz)).toBe(true)
    const hp = h.hp
    step(sim, 3, () => j.boss!.mode === 'dazed')
    expect(j.boss!.mode).toBe('dazed')
    expect(h.hp).toBe(hp)
    step(sim, 0.2)
    expect(isSolidAt(sim.grid, sx, sz)).toBe(false)
    step(sim, 2.4)
    expect(hasStatus(j, 'stun')).toBe(true)
  })

  it('at half the ice breaks (slowing patches) and the glacier grinds across, catching a hero who stands still once', () => {
    const sim = arena()
    const h = sim.hero.unit
    const j = jarl(sim)
    j.hp = j.s.maxHp * 0.49
    step(sim, 2)
    expect(sim.fields.filter(f => f.active && f.kind === 'web').length).toBeGreaterThan(3)
    let frozen = 0
    let was = false
    for (let i = 0; i < 30 * 10; i++) {
      step(sim, 1 / 30)
      const now = hasStatus(h, 'frozen')
      if (now && !was) frozen++
      was = now
    }
    expect(frozen).toBe(1)
  })
})
