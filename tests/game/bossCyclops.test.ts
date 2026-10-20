import { describe, expect, it } from 'vitest'
import { Sim, hasStatus } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { cellIndex, raiseWall } from '@/game/sim/actors'
import { dealDamage } from '@/game/sim/combat'
import { isSolidAt } from '@/game/sim/grid'
import { startAttrs } from '@/game/data/attributes'
import { laneLength } from '@/game/sim/bosses/kit'
import { CYCLOPS_TUNING, GUARD, eyeOpen } from '@/game/sim/bosses/cyclops'
import type { SimEvent, Unit } from '@/game/sim/types'

/**
 * The Cyclops (afterplay §5.3): armoured but for its eye (a fifth of a blow
 * gets through), and the eye opens 2.5 s after a missed boulder or a charge
 * into a support beam (which breaks and drops rocks where the warning
 * shows); the beam sweeps a lit lane; at 60 % it covers its eye; at 30 %,
 * blind, it goes for the last noise: running is noise, a roll is not.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 45, difficulty: 1, mode: 'zone', zone: 'mines' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 45, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
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
const MOVES = ['charge', 'beam', 'boulder']
/** The cyclops `dist` m off along an open lane, awake, only the moves a test names ready, no beams of its own. */
const cyclops = (sim: Sim, ready: string[] = [], dist = 8): Unit => {
  const h = sim.hero.unit
  let ax = 0
  let az = -1
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2
    if (laneLength(sim, h.x, h.z, Math.sin(a), Math.cos(a), dist + 6) >= dist + 5) { ax = Math.sin(a); az = Math.cos(a); break }
  }
  const c = spawnEnemy(sim, 'cyclops', h.x + ax * dist, h.z + az * dist)!
  c.awake = true
  c.targetId = h.id
  c.homeX = c.x
  c.homeZ = c.z
  c.boss!.marks.push('arena')
  for (let i = 0; i < c.cds.length; i++) c.cds[i] = 99
  for (const k of MOVES) c.boss!.cd[k] = ready.includes(k) ? 0 : 99
  return c
}
/** The same blow from the hero, as it lands on the cyclops now. */
const blow = (sim: Sim, c: Unit): number => {
  const hp = c.hp
  const got = dealDamage(sim, sim.hero.unit, c, 400, { type: 'physical', canCrit: false })
  c.hp = hp
  return got
}

describe('the Cyclops (afterplay §5.3)', () => {
  it('its hide turns four blows in five; the open eye takes them in full', () => {
    const sim = arena()
    const c = cyclops(sim)
    step(sim, 0.1)
    expect(eyeOpen(c)).toBe(false)
    const shut = blow(sim, c)
    c.boss!.guard = 1
    const open = blow(sim, c)
    expect(shut / open).toBeCloseTo(GUARD, 2)
  })

  it('a boulder shows where it falls; on the hero it hurts and the eye stays shut, missed it dazes it with the eye open 2.5 s', () => {
    const throwAt = (dodge: boolean): { hurt: number; opened: boolean; dazed: boolean; warned: boolean } => {
      const sim = arena()
      const h = sim.hero.unit
      const c = cyclops(sim, ['boulder'], 8)
      const seen: SimEvent[] = []
      step(sim, 1, () => c.action?.id === 'lob', seen)
      const warned = seen.some(e => e.t === 'tele' && e.tele.shape === 'circle' && e.tele.src === c.id)
      if (dodge) h.x += CYCLOPS_TUNING.BOULDER_R + 2
      const hp = h.hp
      c.boss!.cd.boulder = 99
      let opened = false
      let dazed = false
      for (let i = 0; i < 70; i++) {
        step(sim, 1 / 30)
        if (eyeOpen(c)) opened = true
        if (c.boss!.mode === 'dazed') dazed = true
      }
      return { hurt: hp - h.hp, opened, dazed, warned }
    }
    const hit = throwAt(false)
    expect(hit.warned).toBe(true)
    expect(hit.hurt).toBeGreaterThan(0)
    expect(hit.opened).toBe(false)
    const miss = throwAt(true)
    expect(miss.hurt).toBeLessThanOrEqual(0)
    expect(miss.opened).toBe(true)
    expect(miss.dazed).toBe(true)
  })

  it('the window closes again: the eye is shut 2.5 s after it opened', () => {
    const sim = arena()
    const h = sim.hero.unit
    const c = cyclops(sim, ['boulder'], 8)
    step(sim, 1, () => c.action?.id === 'lob')
    h.x += CYCLOPS_TUNING.BOULDER_R + 2
    c.boss!.cd.boulder = 99
    step(sim, 2, () => eyeOpen(c))
    expect(eyeOpen(c)).toBe(true)
    step(sim, CYCLOPS_TUNING.EYE_OPEN - 0.3)
    expect(eyeOpen(c)).toBe(true)
    step(sim, 0.5)
    expect(eyeOpen(c)).toBe(false)
    expect(c.boss!.guard).toBe(GUARD)
  })

  it('a charge into a support beam breaks it: rocks fall where the warning shows, and the eye opens', () => {
    const sim = arena()
    const h = sim.hero.unit
    const c = cyclops(sim, ['charge'], 8)
    step(sim, 1, () => c.action?.id === 'charge')
    expect(c.action?.id).toBe('charge')
    const a = c.action!.a
    const bx = c.x + Math.sin(a) * 4.5
    const bz = c.z + Math.cos(a) * 4.5
    raiseWall(sim, [cellIndex(sim, bx, bz)], 1e6, 'beam')
    h.x += Math.cos(a) * 5
    h.z -= Math.sin(a) * 5
    const seen: SimEvent[] = []
    step(sim, 3, () => c.boss!.mode === 'dazed', seen)
    expect(c.boss!.mode).toBe('dazed')
    expect(eyeOpen(c)).toBe(true)
    step(sim, 0.2, undefined, seen)
    expect(isSolidAt(sim.grid, bx, bz)).toBe(false)
    // The rocks' warning, then the rocks.
    const rocks = seen.find(e => e.t === 'tele' && e.tele.shape === 'circle' && e.tele.src === c.id)
    expect(rocks).toBeDefined()
    expect(hasStatus(c, 'stun')).toBe(true)
  })

  it('the eye beam: a lit lane, then a 90° sweep; before 60 % the eye shows while it burns, after it the hand covers it', () => {
    const sweep = (low: boolean): { warned: number; hurt: number; open: boolean } => {
      const sim = arena()
      const h = sim.hero.unit
      const c = cyclops(sim, [], 6)
      if (low) {
        c.hp = c.s.maxHp * 0.59
        step(sim, 2, () => c.boss!.phase === 2 && !c.action)
      }
      c.boss!.cd.beam = 0
      c.boss!.next = 0
      const seen: SimEvent[] = []
      const hp = h.hp
      step(sim, 1, () => c.action?.id === 'beam', seen)
      expect(h.hp).toBeGreaterThanOrEqual(hp)
      let open = false
      for (let i = 0; i < 75; i++) { step(sim, 1 / 30, undefined, seen); if (eyeOpen(c)) open = true }
      return { warned: seen.filter(e => e.t === 'tele' && e.tele.src === c.id).length, hurt: hp - h.hp, open }
    }
    const early = sweep(false)
    expect(early.warned).toBe(2)
    expect(early.hurt).toBeGreaterThan(0)
    expect(early.open).toBe(true)
    const late = sweep(true)
    expect(late.open).toBe(false)
  })

  it('blind at 30 %, it goes for the last noise: a roll leaves none, running does', () => {
    const aimAfter = (roll: boolean): number => {
      const sim = arena()
      const h = sim.hero.unit
      const c = cyclops(sim, [], 8)
      c.hp = c.s.maxHp * 0.29
      step(sim, 3, () => c.boss!.phase === 3 && !c.action)
      expect(c.boss!.marks.includes('blind')).toBe(true)
      const x0 = h.x
      const z0 = h.z
      // The hero moves 4 m off: rolling (silent) or running.
      for (let i = 0; i < 8; i++) {
        if (roll) h.action = { id: 'roll' } as Unit['action']
        h.x += 0.5
        step(sim, 1 / 30)
        h.action = null
      }
      c.boss!.cd.boulder = 0
      c.boss!.next = 0
      step(sim, 1, () => c.action?.id === 'lob')
      expect(c.action?.id).toBe('lob')
      return Math.hypot(c.action!.x - x0, c.action!.z - z0)
    }
    // Rolled: it throws where the hero last made a sound.
    expect(aimAfter(true)).toBeLessThan(0.6)
    // Ran: where he is now.
    expect(aimAfter(false)).toBeGreaterThan(3.4)
  })

  it('raises the hall\'s four support beams', () => {
    const sim = arena()
    const h = sim.hero.unit
    spawnEnemy(sim, 'cyclops', h.x, h.z - 8)
    step(sim, 0.2)
    expect(sim.walls.filter(w => w.fx === 'beam').length).toBe(4)
  })
})
