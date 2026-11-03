import { describe, expect, it } from 'vitest'
import { Sim, outOfReach } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { dealDamage } from '@/game/sim/combat'
import { startAttrs } from '@/game/data/attributes'
import { laneLength } from '@/game/sim/bosses/kit'
import type { SimEvent, Unit } from '@/game/sim/types'

/**
 * The Sphinx (afterplay §5.4): a fight on the ground. Claws and sand, each warned; quicker at 60 %; at 30 % two acolytes.
 * She never flies up and never asks a riddle: she is always open to a blow.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 49, difficulty: 1, mode: 'zone', zone: 'temple' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 49, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
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
const sphinx = (sim: Sim, ready: string[] = [], dist = 6): Unit => {
  const h = sim.hero.unit
  let ax = 0
  let az = -1
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2
    if (laneLength(sim, h.x, h.z, Math.sin(a), Math.cos(a), dist + 6) >= dist + 5) { ax = Math.sin(a); az = Math.cos(a); break }
  }
  const s = spawnEnemy(sim, 'sphinx', h.x + ax * dist, h.z + az * dist)!
  s.awake = true
  s.targetId = h.id
  s.homeX = s.x
  s.homeZ = s.z
  for (const k of ['claw', 'sand']) s.boss!.cd[k] = ready.includes(k) ? 0 : 99
  return s
}

describe('the Sphinx (afterplay §5.4)', () => {
  it('her claw cone shows before it lands', () => {
    const sim = arena()
    const h = sim.hero.unit
    const s = sphinx(sim, ['claw'], 3)
    const seen: SimEvent[] = []
    const hp = h.hp
    let teleAt = -1
    let hitAt = -1
    for (let i = 0; i < 90 && hitAt < 0; i++) {
      step(sim, 1 / 30, undefined, seen)
      if (teleAt < 0 && seen.some(e => e.t === 'tele' && e.tele.src === s.id && e.tele.shape === 'cone')) teleAt = sim.time
      if (h.hp < hp) hitAt = sim.time
    }
    expect(teleAt).toBeGreaterThan(0)
    expect(hitAt - teleAt).toBeGreaterThanOrEqual(0.75)
  })

  it('at 60 % and at 30 % she stays on the ground and in reach: no flight, no riddle', () => {
    const sim = arena()
    const s = sphinx(sim)
    const modes = new Set<string>()
    for (const at of [0.59, 0.29]) {
      s.hp = s.s.maxHp * at
      for (let i = 0; i < 12 * 30; i++) {
        step(sim, 1 / 30)
        modes.add(s.boss!.mode)
        expect(s.boss!.alt).toBe(0)
        expect(outOfReach(s)).toBe(false)
      }
    }
    expect(s.boss!.phase).toBe(3)
    expect(modes.has('air')).toBe(false)
    const hp = s.hp
    dealDamage(sim, sim.hero.unit, s, 1000, { type: 'true', canCrit: false })
    expect(s.hp).toBeLessThan(hp)
  })

  it('at 30 % two sand-spinning acolytes join; she says her last words', () => {
    const sim = arena()
    const s = sphinx(sim)
    const seen: SimEvent[] = []
    s.hp = s.s.maxHp * 0.29
    s.boss!.phase = 2
    step(sim, 6, () => s.boss!.phase === 3, seen)
    expect(s.boss!.phase).toBe(3)
    expect(sim.units.filter(u => u.alive && u.kind === 'sphinxAcolyte').length).toBe(2)
    expect(seen.some(e => e.t === 'bark' && e.key === 'dlg.bark.sphinx.sand.1')).toBe(true)
    sim.events.length = 0
    dealDamage(sim, sim.hero.unit, s, 1e9, { type: 'true', canCrit: false })
    expect(s.alive).toBe(false)
    expect(sim.events.some(e => e.t === 'bark' && e.key === 'dlg.bark.sphinx.death.1')).toBe(true)
  })
})
