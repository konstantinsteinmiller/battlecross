import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { applyPlan } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { referenceBuild } from '@/game/sim/bot'
import { isSolidCell } from '@/game/sim/grid'
import { PARTY_H, PARTY_LAYOUT, PARTY_W, generateCelebration } from '@/game/sim/celebrateMap'
import { armCelebration, cheerUp, skipCelebration } from '@/game/sim/celebrate'
import { CRIES, CRIER, cryKey } from '@/game/data/assault'
import {
  CHEER_EVERY, PARTY_DWARFS, PARTY_GNOMES_MAX, PARTY_GNOMES_MIN, PARTY_GOBLINS, PARTY_S, PARTY_TIP, SHOUT_EVERY, SHOUT_FIRST, partyDue, partyGnomes
} from '@/game/data/celebrate'

/**
 * #206: the film after the Goblin King's answer. Goblins with their "no king" crests, dwarfs with their mugs, gnomes
 * dancing round the fire; the hero among them; a few shouts; then the story goes on.
 */

const STEP = 1 / 30

const scene = (freed = 4) => {
  const plan = generateCelebration(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 6, difficulty: 1, mode: 'zone', zone: 'hollows' })
  applyPlan(sim, plan)
  const ref = referenceBuild({ level: 6, cls: 'aegis' })
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 1 })
  armCelebration(sim, { freed })
  return { sim, plan }
}
const run = (sim: Sim, plan: ReturnType<typeof scene>['plan'], s: number): void => {
  for (let t = 0; t < s; t += STEP) { stepSim(sim, plan, STEP); sim.events.length = 0 }
}

describe('when it is shown', () => {
  it('once, right after the King\'s answer', () => {
    expect(partyDue(true, false)).toBe(true)
    expect(partyDue(true, true)).toBe(false)
    expect(partyDue(false, false)).toBe(false)
    expect(PARTY_TIP).toBe('hollowsParty')
  })
  it('the gnomes in the crowd are the ones the hero freed, three at least and six at most', () => {
    expect(partyGnomes(0)).toBe(PARTY_GNOMES_MIN)
    expect(partyGnomes(4)).toBe(4)
    expect(partyGnomes(99)).toBe(PARTY_GNOMES_MAX)
  })
})

describe('the camp', () => {
  it('the hero, the fire and every celebrant stand on open ground; the table and the poles are in view of the camera', () => {
    const { sim, plan } = scene()
    const L = PARTY_LAYOUT
    expect(plan.w).toBe(PARTY_W)
    expect(plan.h).toBe(PARTY_H)
    expect(isSolidCell(sim.grid, Math.floor(L.start.x / 1.5), Math.floor(L.start.z / 1.5))).toBe(false)
    for (const p of sim.celebrate!.celebrants) {
      const u = sim.get(p.unit)!
      expect(isSolidCell(sim.grid, Math.floor(u.x / 1.5), Math.floor(u.z / 1.5)), `${p.kind} ${p.unit}`).toBe(false)
      expect(Math.hypot(u.x - L.fire.x, u.z - L.fire.z)).toBeGreaterThan(1.5)
    }
    // The table lies north of the fire (behind it for the camera) and its poles flank the crowd.
    expect(L.table.z).toBeLessThan(L.fire.z)
    for (const p of L.poles) expect(p.z).toBeLessThan(L.fire.z)
    expect(plan.dressing!.some(d => d.kind === 'fire')).toBe(true)
  })
})

describe('the crowd', () => {
  it('goblins with crests, dwarfs with mugs, gnomes dancing: the numbers, and every body its own', () => {
    const { sim } = scene(5)
    const c = sim.celebrate!
    const n = (k: string): number => c.celebrants.filter(p => p.kind === k).length
    expect(n('goblin')).toBe(PARTY_GOBLINS)
    expect(n('dwarf')).toBe(PARTY_DWARFS)
    expect(n('gnome')).toBe(5)
    for (const p of c.celebrants) expect(p.role).toBe(p.kind === 'goblin' ? 'crest' : p.kind === 'dwarf' ? 'mug' : 'dance')
    expect(new Set(c.celebrants.map(p => p.unit)).size).toBe(c.celebrants.length)
    // Scene pieces: nobody here fights, and nobody can be aimed at.
    for (const p of c.celebrants) expect(sim.get(p.unit)!.rank).toBe('npc')
  })

  it('the crests go up in turn (each its own beat), the gnomes circle the fire, the hero stays', () => {
    const { sim, plan } = scene()
    const c = sim.celebrate!
    const h = sim.hero.unit
    const hx = h.x
    const hz = h.z
    const g = c.celebrants.find(p => p.kind === 'gnome')!
    const a0 = g.a
    const ups = new Set<string>()
    for (let t = 0; t < CHEER_EVERY * 1.2; t += STEP) {
      stepSim(sim, plan, STEP)
      sim.events.length = 0
      ups.add(c.celebrants.filter(p => p.role === 'crest').map(p => p.up > 0.5 ? 1 : 0).join(''))
    }
    // Not all at once, not never.
    expect(ups.size).toBeGreaterThan(2)
    expect(Math.abs(g.a - a0)).toBeGreaterThan(0.3)
    const gu = sim.get(g.unit)!
    expect(Math.hypot(gu.x - PARTY_LAYOUT.fire.x, gu.z - PARTY_LAYOUT.fire.z)).toBeCloseTo(g.r * Math.hypot(Math.sin(g.a), 0.85 * Math.cos(g.a)), 1)
    expect(Math.hypot(h.x - hx, h.z - hz)).toBeLessThan(0.01)
    expect(cheerUp(0, 0)).toBe(0)
    expect(cheerUp(0.475, 0)).toBeCloseTo(1, 1)
  })

  it('shouts the siege\'s cries now and then, goblins and gnomes by turns, one voice at a time', () => {
    const { sim, plan } = scene()
    const keys: string[] = []
    let last = -1
    for (let t = 0; t < PARTY_S; t += STEP) {
      stepSim(sim, plan, STEP)
      for (const e of sim.events) if (e.t === 'bark') { keys.push(e.key); if (last >= 0) expect(t - last).toBeLessThan(SHOUT_EVERY + 0.2); last = t }
      sim.events.length = 0
    }
    expect(keys.length).toBeGreaterThanOrEqual(Math.floor((PARTY_S - SHOUT_FIRST) / SHOUT_EVERY))
    const allowed = new Set([...CRIES.map(c => cryKey('goblin', c)), ...CRIES.map(c => cryKey('gnome', c))])
    for (const k of keys) expect(allowed.has(k), k).toBe(true)
    // Both kinds are heard; the words are the voiced ones of the siege.
    expect(keys.some(k => k.includes(CRIER.goblin))).toBe(true)
    expect(keys.some(k => k.includes(CRIER.gnome))).toBe(true)
  })
})

describe('the end', () => {
  it('it runs its length and is watched; the skip leaves at once and says so; and nothing is left to move', () => {
    const a = scene()
    expect(a.sim.celebrate!.phase).toBe('play')
    run(a.sim, a.plan, PARTY_S - 0.5)
    expect(a.sim.celebrate!.phase).toBe('play')
    run(a.sim, a.plan, 1)
    expect(a.sim.celebrate).toMatchObject({ phase: 'done', outcome: 'watched' })
    const b = scene()
    run(b.sim, b.plan, 2)
    skipCelebration(b.sim)
    expect(b.sim.celebrate).toMatchObject({ phase: 'done', outcome: 'skipped' })
  })

  it('the hero cannot be moved by the player while it plays', async () => {
    const { sim, plan } = scene()
    const { setStick } = await import('@/game/sim/hero')
    const h = sim.hero.unit
    const z0 = h.z
    setStick(sim, 0, -1)
    run(sim, plan, 2)
    expect(h.z).toBe(z0)
  })
})
