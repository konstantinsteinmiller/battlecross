import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { applyPlan } from '@/game/sim/director'
import { createHero, setStick } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import { ASSAULT_LAYOUT, generateAssault, PAL_J } from '@/game/sim/assaultMap'
import { armAssault, assaultHint, skipAssault, skipPanorama } from '@/game/sim/assault'
import { isSolidCell } from '@/game/sim/grid'
import { CELL } from '@/game/sim/grid'
import {
  ASSAULT_FLAG, BREACH_S, CATAPULT_FLIGHT, CATAPULT_WIND, CRIES, CRIER, PANORAMA_S, RAM_BLOWS, RAM_HALF_X, RAM_HALF_Z, RAM_RIDE_Z, assaultDue, cryKey, cryPeriod
} from '@/game/data/assault'

/**
 * #204: the besieged gate before the Hollows. Two towers, two catapults, a ram; nobody fights the hero.
 */

const STEP = 1 / 30

const scene = () => {
  const plan = generateAssault(5)
  const sim = new Sim({ seed: 5, w: plan.w, h: plan.h, level: 4, difficulty: 1, mode: 'zone', zone: 'hollows' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 4, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 1 })
  armAssault(sim)
  return { sim, plan }
}
const run = (sim: Sim, plan: ReturnType<typeof generateAssault>, s: number): void => {
  for (let t = 0; t < s; t += STEP) stepSim(sim, plan, STEP)
}
const play = (sim: Sim, plan: ReturnType<typeof generateAssault>): void => {
  skipPanorama(sim)
  run(sim, plan, 0.1)
}
const goto = (sim: Sim, x: number, z: number): void => {
  const u = sim.hero.unit
  u.x = u.px = x
  u.z = u.pz = z
}

describe('the besieged gate', () => {
  it('a panorama first: the hero cannot move, then the play begins', () => {
    const { sim, plan } = scene()
    const u = sim.hero.unit
    const z0 = u.z
    setStick(sim, 0, -1)
    run(sim, plan, 2)
    expect(sim.assault!.phase).toBe('panorama')
    expect(u.z).toBe(z0)
    run(sim, plan, PANORAMA_S)
    expect(sim.assault!.phase).toBe('play')
    expect(assaultHint(sim.assault!)).toBe('levers')
  })

  it('the palisade stands between the towers until the second one falls', () => {
    const { sim } = scene()
    const g = sim.grid
    expect(isSolidCell(g, 17, PAL_J)).toBe(true)
    expect(sim.assault!.towers.every(t => !t.down)).toBe(true)
  })

  it('a catapult\'s lever brings its tower down: wind, flight, impact', () => {
    const { sim, plan } = scene()
    play(sim, plan)
    const c = ASSAULT_LAYOUT.catapults[0]!
    goto(sim, c.lever.x, c.lever.z)
    run(sim, plan, 0.5)
    expect(sim.assault!.catapults[0]!.state).toBe('wind')
    expect(sim.assault!.towers[0]!.incoming).toBe(true)
    run(sim, plan, CATAPULT_WIND + CATAPULT_FLIGHT + 0.2)
    expect(sim.assault!.towers[0]!.down).toBe(true)
    expect(sim.assault!.towers[1]!.down).toBe(false)
    expect(sim.assault!.phase).toBe('play')
  })

  it('a lever is not pulled during the panorama', () => {
    const { sim, plan } = scene()
    const c = ASSAULT_LAYOUT.catapults[0]!
    goto(sim, c.lever.x, c.lever.z)
    run(sim, plan, 1)
    expect(sim.assault!.catapults[0]!.state).toBe('ready')
  })

  it('both catapults: both towers fall, the palisade is breached, the party goes in, and the siege is won', () => {
    const { sim, plan } = scene()
    play(sim, plan)
    for (const c of ASSAULT_LAYOUT.catapults) {
      goto(sim, c.lever.x, c.lever.z)
      run(sim, plan, 0.5)
    }
    run(sim, plan, CATAPULT_WIND + CATAPULT_FLIGHT + 2.5)
    expect(sim.assault!.towers.every(t => t.down)).toBe(true)
    expect(sim.assault!.phase).toBe('breach')
    expect(isSolidCell(sim.grid, 17, PAL_J)).toBe(false)
    run(sim, plan, BREACH_S + 0.5)
    expect(sim.assault!.phase).toBe('done')
    expect(sim.assault!.outcome).toBe('won')
  })

  it('a catapult whose tower is down throws at the other; with none left it stays ready', () => {
    const { sim, plan } = scene()
    play(sim, plan)
    const [c0, c1] = ASSAULT_LAYOUT.catapults
    goto(sim, c0!.lever.x, c0!.lever.z)
    run(sim, plan, 0.5)
    run(sim, plan, CATAPULT_WIND + CATAPULT_FLIGHT + 0.3)
    // The first catapult is spent; the second throws at the one that is left.
    goto(sim, c1!.lever.x, c1!.lever.z)
    run(sim, plan, 0.5)
    expect(sim.assault!.catapults[1]!.at).toBe(1)
  })

  it('the ram: stepping under it sets it rolling with the hero beneath; keys make it faster; three blows bring the tower down', () => {
    const { sim, plan } = scene()
    play(sim, plan)
    const r = sim.assault!.ram
    goto(sim, r.x, r.z + 1.1)
    run(sim, plan, 0.2)
    expect(r.mode).toBe('roll')
    expect(r.riding).toBe(true)
    // Left alone it creeps.
    const z0 = r.z
    run(sim, plan, 2)
    const creep = z0 - r.z
    expect(creep).toBeGreaterThan(1)
    // The hero is under it.
    expect(Math.hypot(sim.hero.unit.x - r.x, sim.hero.unit.z - (r.z + RAM_RIDE_Z))).toBeLessThan(0.1)
    // Behind the push-bar, never inside the frame.
    expect(sim.hero.unit.z - r.z).toBeGreaterThan(RAM_HALF_Z)
    // Pushing speeds it up.
    const z1 = r.z
    setStick(sim, 0, -1)
    run(sim, plan, 1.2)
    setStick(sim, 0, -1)
    const z2 = r.z
    run(sim, plan, 1)
    expect(z2 - r.z).toBeGreaterThan((z0 - z1) / 2 * 1.5)
    // On to the tower and its blows.
    for (let i = 0; i < 400 && r.mode === 'roll'; i++) { setStick(sim, 0, -1); run(sim, plan, STEP) }
    expect(r.mode).toBe('blow')
    const q = r.target
    run(sim, plan, 5.5)
    expect(sim.assault!.towers[q]!.down).toBe(true)
    expect(r.riding).toBe(false)
    // Its work is done: it is left alone where it struck, and does not take him in again.
    expect(r.mode).toBe('spent')
    run(sim, plan, 0.5)
    expect(r.mode).toBe('spent')
    expect(r.riding).toBe(false)
  })

  it('the ram is solid: a goblin or the hero standing in it is pushed out, and nobody runs through it', () => {
    const { sim, plan } = scene()
    play(sim, plan)
    const r = sim.assault!.ram
    const g = sim.assault!.rebels[0]!
    const u = sim.get(g.unit)!
    u.x = u.px = r.x - 0.3
    u.z = u.pz = r.z - 0.2
    run(sim, plan, STEP)
    expect(Math.abs(u.x - r.x) >= RAM_HALF_X || Math.abs(u.z - r.z) >= RAM_HALF_Z).toBe(true)
    // Charging straight across its middle, the goblin ends on a side, not on the far side through it.
    u.x = u.px = r.x
    u.z = u.pz = r.z + RAM_HALF_Z + 1
    for (let i = 0; i < 120; i++) {
      u.z -= 0.1
      run(sim, plan, STEP)
      expect(Math.abs(u.x - r.x) >= RAM_HALF_X || Math.abs(u.z - r.z) >= RAM_HALF_Z).toBe(true)
    }
    // The hero, put inside it before he takes the handles, is put out too.
    goto(sim, r.x, r.z)
    run(sim, plan, STEP)
    const h = sim.hero.unit
    expect(r.riding || Math.abs(h.x - r.x) >= RAM_HALF_X || Math.abs(h.z - r.z) >= RAM_HALF_Z).toBe(true)
  })

  it('each tower has its own ram: the first is left alone where it struck, the second waits near the wall at the other tower', () => {
    const { sim, plan } = scene()
    play(sim, plan)
    const rams = sim.assault!.rams
    expect(rams.length).toBe(2)
    expect(rams[1]!.z).toBeLessThan(rams[0]!.z)
    // The waiting one stands on open ground, a few metres from the wall.
    expect(isSolidCell(sim.grid, Math.floor(rams[1]!.x / CELL), Math.floor(rams[1]!.z / CELL))).toBe(false)
    for (let ride = 0; ride < 2; ride++) {
      const r = rams[ride]!
      goto(sim, r.x + 8, r.z + 8)
      run(sim, plan, 0.1)
      goto(sim, r.x, r.z + 1.1)
      run(sim, plan, 0.2)
      expect(r.target).toBe(ride)
      for (let i = 0; i < 900 && r.mode !== 'spent'; i++) { setStick(sim, 0, -1); run(sim, plan, STEP) }
      expect(r.mode).toBe('spent')
      // Left where it struck, never taken to the other tower.
      expect(sim.assault!.towers[ride]!.down).toBe(true)
    }
    expect(sim.assault!.towers.every(t => t.down)).toBe(true)
    expect(rams[0]!.mode).toBe('spent')
    expect(rams[1]!.mode).toBe('spent')
  })

  it('"Skip Siege" ends it at once, and it is not won', () => {
    const { sim } = scene()
    skipAssault(sim)
    expect(sim.assault!.phase).toBe('done')
    expect(sim.assault!.outcome).toBe('skipped')
  })

  it('the rebels storm the wall and the towers\' archers stand up top', () => {
    const { sim, plan } = scene()
    run(sim, plan, 6)
    const a = sim.assault!
    expect(a.rebels.length).toBeGreaterThanOrEqual(12)
    const wall = ASSAULT_LAYOUT.wallZ
    const near = a.rebels.filter(r => Math.abs((sim.get(r.unit)?.z ?? 0) - wall) < 8).length
    expect(near).toBeGreaterThan(a.rebels.length / 2)
    for (const t of a.towers) for (const id of t.archers) expect(sim.get(id)!.stunt!.lift).toBeGreaterThan(3)
  })

  it('the cries: three kinds, one rebel at a time, 3 s apart, then slower', () => {
    const { sim, plan } = scene()
    const keys: string[] = []
    const emit = sim.emit.bind(sim)
    sim.emit = ((e: { t: string; key?: string }) => { if (e.t === 'bark' && e.key) keys.push(e.key); emit(e as never) }) as never
    run(sim, plan, PANORAMA_S + 14)
    expect(keys.length).toBeGreaterThanOrEqual(4)
    const kinds = new Set(keys.map(k => k.split('.')[3]))
    expect([...kinds].sort()).toEqual([...CRIES].sort())
    expect(cryPeriod(0)).toBe(3)
    expect(cryPeriod(4)).toBe(8)
    expect(cryPeriod(9)).toBeGreaterThanOrEqual(12)
    expect(cryKey('goblin', 'down')).toBe(`dlg.bark.${CRIER.goblin}.down.1`)
  })

  it('it is due on the first entry and until the King is dealt with, never after it has been won', () => {
    expect(assaultDue(() => false)).toBe(true)
    expect(assaultDue(f => f === ASSAULT_FLAG)).toBe(false)
    expect(assaultDue(f => f === 'arenaOpen')).toBe(false)
  })
})
