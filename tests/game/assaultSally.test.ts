import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { applyPlan } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import { ASSAULT_LAYOUT, generateAssault, PAL_J, SALLY_GATE_I0, SALLY_GATE_I1 } from '@/game/sim/assaultMap'
import { armAssault, sallyFoes, skipPanorama } from '@/game/sim/assault'
import { isSolidCell } from '@/game/sim/grid'
import { CATAPULT_FLIGHT, CATAPULT_WIND, SALLY_CAP_S, SALLY_WAVES, sallyPurse } from '@/game/data/assault'

/**
 * #EXT-7: when the first tower falls the gate swings open and the guards sally out in three waves; the party fights beside the hero.
 */

const STEP = 1 / 30

const scene = () => {
  const plan = generateAssault(5)
  const sim = new Sim({ seed: 5, w: plan.w, h: plan.h, level: 4, difficulty: 1, mode: 'zone', zone: 'hollows' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 4, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 1 })
  armAssault(sim)
  skipPanorama(sim)
  return { sim, plan }
}
const run = (sim: Sim, plan: ReturnType<typeof generateAssault>, s: number): void => {
  for (let t = 0; t < s; t += STEP) stepSim(sim, plan, STEP)
}
/** Pull the first catapult's lever: its stone brings the first tower down. */
const fellFirstTower = (sim: Sim, plan: ReturnType<typeof generateAssault>): void => {
  const c = ASSAULT_LAYOUT.catapults[0]!
  const u = sim.hero.unit
  u.x = u.px = c.lever.x
  u.z = u.pz = c.lever.z
  run(sim, plan, 0.5 + CATAPULT_WIND + CATAPULT_FLIGHT + 0.2)
}
/** A unit of the sally's guards still standing. */
const guards = (sim: Sim) => sim.assault!.sally.guards.map(id => sim.get(id)).filter(u => u?.alive)

describe('the sally (#EXT-7)', () => {
  it('waits until a tower falls: no guards, the palisade stands', () => {
    const { sim, plan } = scene()
    run(sim, plan, 3)
    expect(sim.assault!.sally.state).toBe('idle')
    expect(sim.assault!.sally.sent).toBe(0)
    expect(isSolidCell(sim.grid, SALLY_GATE_I0, PAL_J)).toBe(true)
  })

  it('the first tower down opens the gate and sends the first wave', () => {
    const { sim, plan } = scene()
    fellFirstTower(sim, plan)
    const s = sim.assault!.sally
    expect(sim.assault!.towers[0]!.down).toBe(true)
    expect(s.state).toBe('on')
    expect(s.sent).toBeGreaterThanOrEqual(SALLY_WAVES[0]!.kinds.length)
    for (let i = SALLY_GATE_I0; i <= SALLY_GATE_I1; i++) expect(isSolidCell(sim.grid, i, PAL_J)).toBe(false)
    // The rest of the palisade holds.
    expect(isSolidCell(sim.grid, SALLY_GATE_I0 - 2, PAL_J)).toBe(true)
    expect(sallyFoes(sim, sim.assault!)).toBeGreaterThan(0)
  })

  it('the three waves come, the party fights, and the line holds', () => {
    const { sim, plan } = scene()
    fellFirstTower(sim, plan)
    run(sim, plan, SALLY_CAP_S - 2)
    const a = sim.assault!
    // Every wave was sent and the guards are down or the cap routed them; with the party's blows the line holds.
    expect(a.sally.wave).toBe(SALLY_WAVES.length)
    expect(a.sally.state).toBe('done')
    expect(a.sally.held).toBe(true)
    expect(guards(sim)).toHaveLength(0)
    expect(sim.hero.unit.alive).toBe(true)
  })

  it('the hero never falls while it lasts', () => {
    const { sim, plan } = scene()
    fellFirstTower(sim, plan)
    const h = sim.hero.unit
    for (let t = 0; t < 20; t += STEP) {
      h.hp = 1
      stepSim(sim, plan, STEP)
      expect(h.alive).toBe(true)
    }
  })

  it('the second tower down breaks the siege open: the sally is over, the guards that are left are gone', () => {
    const { sim, plan } = scene()
    fellFirstTower(sim, plan)
    expect(sim.assault!.sally.state).toBe('on')
    const c = ASSAULT_LAYOUT.catapults[1]!
    const u = sim.hero.unit
    u.x = u.px = c.lever.x
    u.z = u.pz = c.lever.z
    run(sim, plan, 0.5 + CATAPULT_WIND + CATAPULT_FLIGHT + 2)
    const a = sim.assault!
    expect(a.towers.every(t => t.down)).toBe(true)
    expect(a.phase).toBe('breach')
    expect(a.sally.state).toBe('done')
    expect(guards(sim)).toHaveLength(0)
  })

  it('the storming party keeps its bodies apart: nobody stacks into a neighbour, in the yard or in the sally', () => {
    const { sim, plan } = scene()
    const worst = (): number => {
      let w = Infinity
      const us = sim.units.filter(u => u.alive && u.crowd)
      for (let i = 0; i < us.length; i++) for (let j = i + 1; j < us.length; j++) {
        const d = Math.hypot(us[i]!.x - us[j]!.x, us[i]!.z - us[j]!.z) / (us[i]!.r + us[j]!.r)
        if (d < w) w = d
      }
      return w
    }
    expect(sim.units.filter(u => u.crowd).length).toBeGreaterThan(10)
    let min = Infinity
    for (let t = 0; t < 12; t += STEP) { stepSim(sim, plan, STEP); if (t > 2) min = Math.min(min, worst()) }
    fellFirstTower(sim, plan)
    for (let t = 0; t < 14; t += STEP) { stepSim(sim, plan, STEP); min = Math.min(min, worst()) }
    // Bodies may touch and press a little, but never sit inside one another.
    expect(min).toBeGreaterThan(0.55)
  })

  it('the hero cannot swing or cast while he works a lever', () => {
    const { sim, plan } = scene()
    const c = ASSAULT_LAYOUT.catapults[0]!
    const u = sim.hero.unit
    u.x = u.px = c.lever.x
    u.z = u.pz = c.lever.z
    run(sim, plan, 0.2)
    expect(u.noFight).toBe(true)
    // Far from every lever and ram, his hands are free.
    u.x = u.px = ASSAULT_LAYOUT.start.x
    u.z = u.pz = ASSAULT_LAYOUT.start.z + 4
    run(sim, plan, 6)
    expect(u.noFight).toBe(false)
  })

  it('the strongbox: a held line pays in full, a broken one in half', () => {
    expect(sallyPurse(4, true)).toBeGreaterThan(sallyPurse(4, false))
    expect(sallyPurse(4, false)).toBe(Math.round(sallyPurse(4, true) / 2))
    expect(sallyPurse(1, true)).toBeGreaterThan(0)
  })
})
