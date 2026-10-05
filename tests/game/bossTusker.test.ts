import { describe, expect, it } from 'vitest'
import { Sim, hasStatus, outOfReach } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'
import { laneLength } from '@/game/sim/bosses/kit'
import type { Unit } from '@/game/sim/types'

/**
 * The Goblin King on Tusker (#74): a charge that pins the hero to the wall or
 * rams it and stands dazed, and the King leaping off at half, the boar
 * leaving the field (gone: no body, no loot, not counted).
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: 'hollows' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 5, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
  })
  return sim
}
const step = (sim: Sim, seconds: number, until?: () => boolean): void => {
  for (let t = 0; t < seconds; t += 1 / 30) {
    stepSim(sim, plan, 1 / 30)
    sim.events.length = 0
    if (until?.()) return
  }
}
/** Tusker 6 m from the hero, awake, his charge ready, the hero between him and a wall (not a gate). */
const boar = (sim: Sim): Unit => {
  const h = sim.hero.unit
  let ax = 0
  let az = 1
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2
    const len = laneLength(sim, h.x, h.z, Math.sin(a), Math.cos(a), 40)
    // A wall (a gate would let the run out): stand the hero 7 m short of it.
    if (len > 8 && len < 30) {
      ax = Math.sin(a); az = Math.cos(a)
      h.x += ax * (len - 7); h.z += az * (len - 7); h.px = h.x; h.pz = h.z
      break
    }
  }
  const t = spawnEnemy(sim, 'tusker', h.x - ax * 6, h.z - az * 6)!
  t.awake = true
  t.targetId = h.id
  t.boss!.next = 0
  t.aiT = 0
  for (let i = 0; i < t.cds.length; i++) t.cds[i] = 99
  return t
}

describe('Tusker the war boar (#74)', () => {
  it('a missed charge rams the wall: dazed, stars, hurt more', () => {
    const sim = arena()
    const h = sim.hero.unit
    h.s.maxHp = h.hp = 1e6
    const t = boar(sim)
    step(sim, 1, () => t.action?.id === 'charge')
    expect(t.action?.id).toBe('charge')
    // The hero steps out of the lane during the wind-up.
    const ang = t.action!.a
    h.x += Math.cos(ang) * 4
    h.z -= Math.sin(ang) * 4
    h.px = h.x
    h.pz = h.z
    step(sim, 4, () => t.boss!.mode === 'dazed')
    expect(t.boss!.mode).toBe('dazed')
    expect(hasStatus(t, 'stun')).toBe(true)
    expect(hasStatus(t, 'vulnerable')).toBe(true)
    // It stays dazed for its window, then fights again.
    step(sim, 3)
    expect(hasStatus(t, 'stun')).toBe(true)
    step(sim, 1.2)
    expect(hasStatus(t, 'stun')).toBe(false)
  })

  it('a charge that catches the hero carries him to the wall and pins him there', () => {
    const sim = arena()
    const h = sim.hero.unit
    h.s.maxHp = h.hp = 1e6
    const t = boar(sim)
    step(sim, 1.4, () => t.boss!.mode === 'charge')
    step(sim, 3, () => t.boss!.carry !== 0)
    expect(t.boss!.carry).toBe(h.id)
    const hp0 = h.hp
    step(sim, 4, () => t.boss!.mode !== 'charge')
    expect(h.hp).toBeLessThan(hp0)
    expect(hasStatus(h, 'stun')).toBe(true)
    // The boar is not dazed: it caught its prey.
    expect(t.boss!.mode).not.toBe('dazed')
  })

  it('at half health the King leaps off and Tusker leaves the field, gone and uncounted', () => {
    const sim = arena()
    const h = sim.hero.unit
    h.s.maxHp = h.hp = 1e6
    const t = boar(sim)
    t.boss!.next = 99
    t.hp = t.s.maxHp * 0.49
    step(sim, 0.5, () => t.boss!.mode === 'exit')
    expect(t.boss!.marks).toContain('dismounted')
    expect(t.boss!.mode).toBe('exit')
    const king = sim.units.find(u => u.kind === 'goblinKing' && u.alive)
    expect(king).toBeDefined()
    expect(king!.awake).toBe(true)
    expect(king!.boss?.script).toBe('kingAfoot')
    step(sim, 7, () => t.boss!.mode === 'gone')
    expect(t.boss!.mode).toBe('gone')
    expect(t.alive).toBe(false)
    expect(outOfReach(t)).toBe(true)
  })

  it('the King on foot dashes three times, then stands panting', () => {
    const sim = arena()
    const h = sim.hero.unit
    h.s.maxHp = h.hp = 1e6
    const k = spawnEnemy(sim, 'goblinKing', h.x, h.z - 5)!
    k.awake = true
    k.targetId = h.id
    k.boss!.next = 0
    for (let i = 0; i < k.cds.length; i++) k.cds[i] = 99
    let dashes = 0
    let was = ''
    for (let i = 0; i < 30 * 8 && k.boss!.mode !== 'dazed'; i++) {
      step(sim, 1 / 30)
      if (k.boss!.mode === 'charge' && was !== 'charge') dashes++
      was = k.boss!.mode
      // Keep the hero in front of him.
      if (Math.hypot(h.x - k.x, h.z - k.z) < 2.5) { h.x = k.x; h.z = k.z + 5; h.px = h.x; h.pz = h.z }
    }
    expect(dashes).toBe(3)
    expect(k.boss!.mode).toBe('dazed')
  })
})
