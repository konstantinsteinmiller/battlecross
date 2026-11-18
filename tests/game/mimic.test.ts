import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { populateZone, applyPlan } from '@/game/sim/director'
import { generateZone } from '@/game/sim/zoneGen'
import { stepSim } from '@/game/sim/step'
import { startAttrs } from '@/game/data/attributes'
import { ZONES } from '@/game/data/zones'
import { finishOpen } from '@/game/sim/interact'
import { spawnEnemy } from '@/game/sim/spawn'
import { mimicCount, mimicable } from '@/game/sim/mimic'

/** #225: the first ordinary chest opened is a mimic; it pays the chest's loot when it falls. */

const DT = 1 / 30
;(globalThis as { __NO_MIMIC__?: boolean }).__NO_MIMIC__ = false
const scene = (seed = 11) => {
  const plan = generateZone(ZONES.hollows, seed)
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 4, difficulty: 1, mode: 'zone', zone: 'hollows' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 4, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
  populateZone(sim, plan, 'hollows', [])
  return { sim, plan }
}

describe('the mimic (#225)', () => {
  it('the rolls: the Hollows always one; elsewhere 10 % two, 75 % one, the rest none', () => {
    expect(mimicCount('hollows', 0.99)).toBe(1)
    expect(mimicCount('plains', 0.05)).toBe(2)
    expect(mimicCount('plains', 0.5)).toBe(1)
    expect(mimicCount('plains', 0.9)).toBe(0)
  })

  it('the first ordinary chest opened springs alive, and pays its loot when the mimic falls', () => {
    const { sim, plan } = scene()
    const c = sim.chests.find(q => mimicable(q) && q.state === 'closed')
    expect(c).toBeDefined()
    expect(sim.mimicLeft).toBe(1)
    const h = sim.hero
    h.unit.x = h.unit.px = c!.sx
    h.unit.z = h.unit.pz = c!.sz
    c!.state = 'opening'
    h.opening = c!.id
    const gold0 = h.gold + h.items.length + h.potions
    finishOpen(sim)
    expect(sim.mimics).toHaveLength(1)
    expect(sim.mimicLeft).toBe(0)
    const m = sim.get(sim.mimics[0]!.unit)!
    expect(m.kind).toBe('mimic')
    expect(m.champion).toBe(true)
    expect(m.alive).toBe(true)
    // Nothing is paid while it lives.
    expect(h.gold + h.items.length + h.potions).toBe(gold0)
    // Another chest is no longer a mimic.
    const c2 = sim.chests.find(q => q !== c && mimicable(q) && q.state === 'closed')
    if (c2) {
      c2.state = 'opening'
      h.opening = c2.id
      finishOpen(sim)
      expect(sim.mimics).toHaveLength(1)
      expect(c2.state).toBe('open')
    }
    // It falls: the chest pays.
    m.hp = 0
    m.alive = false
    stepSim(sim, plan, DT)
    expect(sim.mimics[0]!.paid).toBe(true)
    expect(c!.state).toBe('open')
  })

  it('the cage, the finale and the tutorial chests are never mimics', () => {
    const { sim } = scene()
    for (const c of sim.chests) if (['cage', 'finale', 'tutorial'].includes(c.role)) expect(mimicable(c)).toBe(false)
  })
})

describe('the mimic\'s three bounces', () => {
  it('lands three times, each ring wider and each blow a bigger share of the hero\'s health, the last one high in the air', () => {
    const { sim, plan } = scene()
    const h = sim.hero.unit
    h.s.maxHp = h.hp = 1000
    const m = spawnEnemy(sim, 'mimic', h.x + 6, h.z)!
    m.awake = true
    m.targetId = h.id
    m.s.baseDmg = 0
    m.boss!.cd.jumps = 0
    m.aiT = 0
    let peak3 = 0
    const drops: number[] = []
    let last = h.hp
    for (let t = 0; t < 12 && drops.length < 3; t += DT) {
      // The hero holds his ground, so every ring is on him.
      h.x = h.px = h.x
      stepSim(sim, plan, DT)
      sim.events.length = 0
      if (m.boss!.sub === '2' && m.action?.id === 'jump') peak3 = Math.max(peak3, m.boss!.alt)
      if (h.hp < last - 1) { drops.push((last - h.hp) / 1000); last = h.hp }
      if (h.hp < 500) h.hp = 1000, last = 1000
    }
    expect(drops).toHaveLength(3)
    expect(drops[0]!).toBeGreaterThan(0.04)
    expect(drops[0]!).toBeLessThan(0.07)
    expect(drops[1]!).toBeGreaterThan(0.07)
    expect(drops[1]!).toBeLessThan(0.1)
    expect(drops[2]!).toBeGreaterThan(0.15)
    expect(drops[2]!).toBeLessThan(0.2)
    expect(peak3).toBeGreaterThan(2)
  })
})
