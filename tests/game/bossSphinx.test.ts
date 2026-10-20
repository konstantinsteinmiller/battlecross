import { describe, expect, it } from 'vitest'
import { Sim, hasStatus, outOfReach } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { dealDamage } from '@/game/sim/combat'
import { startAttrs } from '@/game/data/attributes'
import { laneLength } from '@/game/sim/bosses/kit'
import { SPHINX_TUNING, riddleOf } from '@/game/sim/bosses/sphinx'
import type { SimEvent, Unit } from '@/game/sim/types'

/**
 * The Sphinx (afterplay §5.4): claws and sand, each warned; at 60 % she flies
 * up out of reach and asks a riddle of four coloured plates — stepped in the
 * order shown, she falls dazed and open; stepped wrong, she heals 8 % and asks
 * again in a new order; at 30 % a riddle of five and two acolytes.
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
/** Into the riddle: phase 2 begins, and the stepping starts. */
const toRiddle = (sim: Sim, s: Unit, at = 0.59): void => {
  s.hp = s.s.maxHp * at
  step(sim, 12, () => s.boss!.sub === 'step')
}
/** The hero steps onto plate k (and stays a moment). */
const stepOn = (sim: Sim, s: Unit, k: number): void => {
  const r = riddleOf(s)!
  const h = sim.hero.unit
  h.x = r.px[k]!
  h.z = r.pz[k]!
  h.kx = h.kz = 0
  step(sim, 0.2)
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

  it('at 60 % she flies out of reach, lights four plates and asks a sequence of four', () => {
    const sim = arena()
    const s = sphinx(sim)
    const seen: SimEvent[] = []
    s.hp = s.s.maxHp * 0.59
    step(sim, 12, () => s.boss!.sub === 'step', seen)
    expect(s.boss!.mode).toBe('air')
    expect(outOfReach(s)).toBe(true)
    const r = riddleOf(s)!
    expect(r.px.length).toBe(4)
    expect(r.seq.length).toBe(4)
    for (let i = 1; i < r.seq.length; i++) expect(r.seq[i]).not.toBe(r.seq[i - 1])
    // Each symbol of the sequence flared on its plate, in the order asked.
    const flares = seen.filter(e => e.t === 'fx' && e.id === 'field:rune')
    expect(flares.length).toBe(4)
    expect(seen.some(e => e.t === 'bark' && e.key === 'dlg.bark.sphinx.riddle.1')).toBe(true)
    // A blow cannot reach her up there.
    const hp = s.hp
    dealDamage(sim, sim.hero.unit, s, 1000, { type: 'true', canCrit: false })
    expect(s.hp).toBe(hp)
  })

  it('stepped right: she falls dazed 6 s and takes half again for 10 s', () => {
    const sim = arena()
    const s = sphinx(sim)
    toRiddle(sim, s)
    for (const k of [...riddleOf(s)!.seq]) stepOn(sim, s, k)
    step(sim, 1, () => s.boss!.mode === 'dazed')
    expect(s.boss!.mode).toBe('dazed')
    expect(s.boss!.alt).toBe(0)
    expect(hasStatus(s, 'stun')).toBe(true)
    expect(hasStatus(s, 'vulnerable')).toBe(true)
    step(sim, SPHINX_TUNING.RIGHT_DAZE - 0.5)
    expect(hasStatus(s, 'stun')).toBe(true)
    expect(hasStatus(s, 'vulnerable')).toBe(true)
  })

  it('stepped wrong: she heals 8 % and asks again, in a new order', () => {
    const sim = arena()
    const s = sphinx(sim)
    toRiddle(sim, s)
    const first = [...riddleOf(s)!.seq]
    const hp = s.hp
    // Not the first symbol asked.
    stepOn(sim, s, (first[0]! + 1) % 4)
    expect(s.hp - hp).toBeCloseTo(s.s.maxHp * SPHINX_TUNING.WRONG_HEAL, 0)
    expect(s.boss!.mode).toBe('air')
    expect(s.boss!.sub).toBe('show')
    expect(riddleOf(s)!.at).toBe(0)
  })

  it('too slow is wrong too', () => {
    const sim = arena()
    const s = sphinx(sim)
    toRiddle(sim, s)
    const hp = s.hp
    step(sim, SPHINX_TUNING.STEP_TIME + 0.5, () => s.boss!.sub === 'show')
    expect(s.boss!.sub).toBe('show')
    expect(s.hp).toBeGreaterThan(hp)
  })

  it('at 30 % a riddle of five and two sand-spinning acolytes; she says her last words', () => {
    const sim = arena()
    const s = sphinx(sim)
    const seen: SimEvent[] = []
    s.hp = s.s.maxHp * 0.29
    s.boss!.phase = 2
    step(sim, 12, () => s.boss!.sub === 'step', seen)
    expect(s.boss!.phase).toBe(3)
    expect(riddleOf(s)!.seq.length).toBe(5)
    expect(sim.units.filter(u => u.alive && u.kind === 'sphinxAcolyte').length).toBe(2)
    expect(seen.some(e => e.t === 'bark' && e.key === 'dlg.bark.sphinx.sand.1')).toBe(true)
    for (const k of [...riddleOf(s)!.seq]) stepOn(sim, s, k)
    step(sim, 1, () => s.boss!.mode === 'dazed')
    sim.events.length = 0
    dealDamage(sim, sim.hero.unit, s, 1e9, { type: 'true', canCrit: false })
    expect(s.alive).toBe(false)
    expect(sim.events.some(e => e.t === 'bark' && e.key === 'dlg.bark.sphinx.death.1')).toBe(true)
  })
})
