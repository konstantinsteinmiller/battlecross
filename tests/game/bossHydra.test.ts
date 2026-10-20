import { describe, expect, it } from 'vitest'
import { Sim, hasStatus } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { cellIndex, raiseWall } from '@/game/sim/actors'
import { dealDamage } from '@/game/sim/combat'
import { CELL } from '@/game/sim/grid'
import { startAttrs } from '@/game/data/attributes'
import { HYDRA_TUNING, hydraOf } from '@/game/sim/bosses/hydra'
import type { SimEvent, Unit } from '@/game/sim/types'

/**
 * The Hydra (afterplay §5.6): every blow lands on a head; a cut head leaves a
 * stump that grows two heads in 8 s unless fire sears it (a fire blow, or a
 * brazier its own slam knocks over); no heads, and the body sinks open; a
 * round never takes it past a phase line.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 57, difficulty: 1, mode: 'zone', zone: 'fortress' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 57, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
  })
  sim.hero.unit.s.maxHp = sim.hero.unit.hp = 1e7
  return sim
}
const step = (sim: Sim, seconds: number, until?: () => boolean, seen?: SimEvent[]): void => {
  for (let t = 0; t < seconds; t += 1 / 30) {
    stepSim(sim, plan, 1 / 30)
    if (seen) seen.push(...sim.events)
    sim.events.length = 0
    if (until?.()) return
  }
}
const hydra = (sim: Sim): Unit => {
  const h = sim.hero.unit
  const u = spawnEnemy(sim, 'hydra', h.x, h.z - 7)!
  step(sim, 1 / 30)
  u.awake = true
  u.targetId = h.id
  // Only what a test does moves it.
  u.boss!.next = 99
  return u
}
const hit = (sim: Sim, u: Unit, n: number, type: 'physical' | 'fire' = 'physical'): void => { dealDamage(sim, sim.hero.unit, u, n, { type, canCrit: false }) }
/** Cut one head off (true damage, exactly its health). */
const cut = (sim: Sim, u: Unit): void => {
  const hs = hydraOf(u)!.heads
  let k = 0
  for (let i = 1; i < hs.length; i++) if (hs[i]! < hs[k]!) k = i
  dealDamage(sim, sim.hero.unit, u, hs[k]! + 1, { type: 'true', canCrit: false })
}

describe('the Hydra (afterplay §5.6)', () => {
  it('three heads; every blow lands on a head, the body untouched', () => {
    const sim = arena()
    const u = hydra(sim)
    expect(hydraOf(u)!.heads.length).toBe(HYDRA_TUNING.START_HEADS)
    expect(sim.walls.filter(w => w.fx === 'brazier').length).toBe(4)
    const hp = u.hp
    hit(sim, u, 500)
    expect(u.hp).toBe(hp)
    expect(Math.min(...hydraOf(u)!.heads)).toBeLessThan(u.s.maxHp * HYDRA_TUNING.HEAD_HP)
  })

  it('a cut stump grows two heads in 8 s', () => {
    const sim = arena()
    const u = hydra(sim)
    cut(sim, u)
    expect(hydraOf(u)!.heads.length).toBe(2)
    expect(hydraOf(u)!.stumps.length).toBe(1)
    step(sim, HYDRA_TUNING.REGROW - 0.3)
    expect(hydraOf(u)!.heads.length).toBe(2)
    step(sim, 0.6)
    expect(hydraOf(u)!.heads.length).toBe(4)
    expect(hydraOf(u)!.stumps.length).toBe(0)
  })

  it('a fire blow sears the stump: it grows nothing', () => {
    const sim = arena()
    const u = hydra(sim)
    cut(sim, u)
    hit(sim, u, 10, 'fire')
    expect(hydraOf(u)!.stumps.length).toBe(0)
    step(sim, HYDRA_TUNING.REGROW + 0.5)
    expect(hydraOf(u)!.heads.length).toBe(2)
  })

  it('its slam knocks a brazier over; standing in the burning patch, every stump is seared', () => {
    const sim = arena()
    const h = sim.hero.unit
    const u = hydra(sim)
    // A brazier right by the hero, the hydra at arm's length.
    const c = cellIndex(sim, h.x + 1.6, h.z)
    raiseWall(sim, [c], 1e6, 'brazier')
    u.x = h.x - 2.6
    u.z = h.z
    cut(sim, u)
    cut(sim, u)
    expect(hydraOf(u)!.stumps.length).toBe(2)
    const seen: SimEvent[] = []
    u.boss!.next = 0
    step(sim, 3, () => !sim.walls.some(w => w.fx === 'brazier' && w.cells[0] === c && w.t < w.dur), seen)
    expect(seen.some(e => e.t === 'tele' && e.tele.src === u.id && e.tele.shape === 'circle')).toBe(true)
    step(sim, 0.2)
    expect(sim.walls.some(w => w.fx === 'brazier' && w.cells[0] === c && w.t < w.dur)).toBe(false)
    // Into the patch it goes (lured there): both stumps sear.
    u.x = ((c % sim.grid.w) + 0.5) * CELL
    u.z = (Math.floor(c / sim.grid.w) + 0.5) * CELL + 1
    u.boss!.next = 99
    step(sim, 0.3)
    expect(hydraOf(u)!.stumps.length).toBe(0)
  })

  it('no heads: the body sinks dazed and open; then three heads rise for the next round', () => {
    const sim = arena()
    const u = hydra(sim)
    cut(sim, u)
    cut(sim, u)
    cut(sim, u)
    expect(hydraOf(u)!.heads.length).toBe(0)
    expect(hydraOf(u)!.window).toBeGreaterThan(0)
    expect(u.boss!.mode).toBe('dazed')
    expect(hasStatus(u, 'stun')).toBe(true)
    const hp = u.hp
    hit(sim, u, 100)
    expect(u.hp).toBeLessThan(hp)
    step(sim, HYDRA_TUNING.WINDOW + 0.3)
    expect(hydraOf(u)!.window).toBe(0)
    expect(hydraOf(u)!.rounds).toBe(1)
    expect(hydraOf(u)!.heads.length).toBe(HYDRA_TUNING.START_HEADS)
  })

  it('a round never takes it past a phase line: the window shuts there, and the heads grow back', () => {
    const sim = arena()
    const u = hydra(sim)
    for (let i = 0; i < 3; i++) cut(sim, u)
    dealDamage(sim, sim.hero.unit, u, u.s.maxHp * 0.9, { type: 'true', canCrit: false })
    expect(u.hp).toBeCloseTo(u.s.maxHp * 0.6, 0)
    step(sim, 0.5)
    expect(hydraOf(u)!.window).toBe(0)
    expect(hydraOf(u)!.heads.length).toBe(HYDRA_TUNING.START_HEADS)
    expect(u.boss!.mode).not.toBe('dazed')
  })

  it('says its last words', () => {
    const sim = arena()
    const u = hydra(sim)
    u.boss!.phase = 3
    for (let i = 0; i < 3; i++) cut(sim, u)
    sim.events.length = 0
    dealDamage(sim, sim.hero.unit, u, 1e9, { type: 'true', canCrit: false })
    expect(u.alive).toBe(false)
    expect(sim.events.some(e => e.t === 'bark' && e.key === 'dlg.bark.hydra.death.1')).toBe(true)
  })
})
