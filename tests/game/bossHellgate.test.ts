import { describe, expect, it } from 'vitest'
import { Sim, hasStatus, outOfReach } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'
import { HELLGATE_TUNING, gateOf } from '@/game/sim/bosses/hellgate'
import type { Unit } from '@/game/sim/types'

/**
 * The Arch-Demon, Hellgate (#74): a dive whose shadow hunts the hero and locks
 * a second before the crash (step out after the lock and the blade sticks in
 * the stone), the gate of fire closing in at 55 %, three dives at 25 %.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 30, difficulty: 1, mode: 'zone', zone: 'fortress' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 30, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
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
/** The demon 7 m off, awake, only the moves a test names ready. */
const demon = (sim: Sim, ready: string[] = []): Unit => {
  const h = sim.hero.unit
  const d = spawnEnemy(sim, 'archDemon', h.x, h.z - 7)!
  d.awake = true
  d.targetId = h.id
  d.homeX = d.x
  d.homeZ = d.z
  for (let i = 0; i < d.cds.length; i++) d.cds[i] = 99
  for (const k of ['dive', 'wave', 'pillars']) d.boss!.cd[k] = ready.includes(k) ? 0 : 99
  return d
}

describe('Hellgate, the Arch-Demon (#74)', () => {
  it('dives out of reach; the shadow follows the hero, then locks — stepping out after it dazes him', () => {
    const sim = arena()
    const h = sim.hero.unit
    const d = demon(sim, ['dive'])
    step(sim, 1, () => (d.boss!.alt ?? 0) > 3)
    expect(d.boss!.mode).toBe('air')
    expect(outOfReach(d)).toBe(true)
    // Before the lock, the shadow goes where the hero goes.
    h.x += 2
    h.px = h.x
    step(sim, 0.1)
    expect(d.boss!.goalX).toBeCloseTo(h.x, 1)
    // Past the lock: the spot stays; just before the crash the hero steps clear of it.
    step(sim, 3, () => d.boss!.modeT >= HELLGATE_TUNING.DIVE_T - 0.25)
    const gx = d.boss!.goalX
    h.x += 6
    h.px = h.x
    const hp = h.hp
    step(sim, 2, () => d.boss!.mode === 'dazed')
    expect(d.boss!.goalX).toBeCloseTo(gx, 5)
    expect(h.hp).toBe(hp)
    expect(d.boss!.mode).toBe('dazed')
    expect(hasStatus(d, 'stun')).toBe(true)
    expect(d.boss!.alt).toBe(0)
  })

  it('a dive on a hero who stands still lands on him', () => {
    const sim = arena()
    const h = sim.hero.unit
    const d = demon(sim, ['dive'])
    const hp = h.hp
    step(sim, 4, () => d.boss!.mode === 'dazed')
    expect(hp - h.hp).toBeGreaterThan(d.s.baseDmg * 1.5)
  })

  it('at 55 % the gate of fire closes from the edge to six metres round the fight, and imps come through', () => {
    const sim = arena()
    const d = demon(sim)
    d.hp = d.s.maxHp * 0.54
    step(sim, 1.5)
    const g = gateOf(d)!
    expect(g).toBeDefined()
    const ring = (): number[] => sim.fields.filter(f => f.active && f.kind === 'burnGround' && f.dur < 1.5).map(f => Math.hypot(f.x - g.x, f.z - g.z))
    const early = ring()
    expect(early.length).toBeGreaterThan(5)
    expect(Math.max(...early)).toBeGreaterThan(9)
    expect(sim.units.filter(u => u.alive && u.kind === 'imp').length).toBeGreaterThan(0)
    step(sim, HELLGATE_TUNING.RING_CLOSE)
    const late = ring()
    expect(late.length).toBeGreaterThan(5)
    for (const r of late) expect(Math.abs(r - HELLGATE_TUNING.RING_TO)).toBeLessThan(0.6)
  })

  it('at 25 % it dives three times running, and only the last one sticks', () => {
    const sim = arena()
    const d = demon(sim)
    d.boss!.phase = 2
    d.hp = d.s.maxHp * 0.24
    let dives = 0
    let dazedAt = -1
    let was = ''
    for (let i = 0; i < 30 * 14 && dazedAt < 0; i++) {
      step(sim, 1 / 30)
      if (d.boss!.mode === 'air' && was !== 'air') dives++
      if (d.boss!.mode === 'dazed') dazedAt = dives
      was = d.boss!.mode
    }
    expect(dives).toBe(3)
    expect(dazedAt).toBe(3)
  })
})
