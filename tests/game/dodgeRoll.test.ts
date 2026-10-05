import { describe, expect, it } from 'vitest'
import { Sim, hasStatus } from '@/game/sim/world'
import { ROLL_CD, ROLL_DIST, ROLL_T, createHero, rollHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { dealDamage } from '@/game/sim/combat'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'
import { BOT_DODGE, botThink, inDanger } from '@/game/sim/bot'
import { laneLength } from '@/game/sim/bosses/kit'
import { spawnEnemy } from '@/game/sim/spawn'

/**
 * The dodge roll (#74, D79): every hero rolls about four metres in a third of
 * a second, untouchable for nearly all of it, back every 3.5 s. The reference
 * player (D80) rolls out of about seven foe warnings in ten.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 10, difficulty: 1, mode: 'zone', zone: 'outskirts' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 10, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
  })
  return sim
}
const step = (sim: Sim, seconds: number): void => {
  for (let t = 0; t < seconds - 1e-9; t += 1 / 30) {
    stepSim(sim, plan, 1 / 30)
    sim.events.length = 0
  }
}
/** An open direction from the hero with room for a roll. */
const openWay = (sim: Sim): [number, number] => {
  const h = sim.hero.unit
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2
    if (laneLength(sim, h.x, h.z, Math.sin(a), Math.cos(a), ROLL_DIST + 2) >= ROLL_DIST + 1.5) return [Math.sin(a), Math.cos(a)]
  }
  throw new Error('no room to roll')
}

describe('the dodge roll (#74, D79)', () => {
  it('carries the hero about four metres in a third of a second, then needs 3.5 s', () => {
    const sim = arena()
    const h = sim.hero.unit
    const [dx, dz] = openWay(sim)
    const x0 = h.x
    const z0 = h.z
    expect(rollHero(sim, dx, dz)).toBe(true)
    expect(h.action?.id).toBe('roll')
    step(sim, ROLL_T + 0.05)
    expect(Math.hypot(h.x - x0, h.z - z0)).toBeGreaterThan(ROLL_DIST * 0.85)
    expect(Math.hypot(h.x - x0, h.z - z0)).toBeLessThan(ROLL_DIST * 1.1)
    expect(h.action).toBeNull()
    // Not again until the cooldown is over.
    expect(rollHero(sim, dx, dz)).toBe(false)
    step(sim, ROLL_CD)
    expect(rollHero(sim, -dx, -dz)).toBe(true)
  })

  it('nothing hurts the hero mid-roll', () => {
    const sim = arena()
    const h = sim.hero.unit
    const foe = spawnEnemy(sim, 'bandit', h.x + 2, h.z)!
    const [dx, dz] = openWay(sim)
    rollHero(sim, dx, dz)
    step(sim, 0.1)
    expect(hasStatus(h, 'invulnerable')).toBe(true)
    const hp = h.hp
    expect(dealDamage(sim, foe, h, 50, { type: 'physical' })).toBe(0)
    expect(h.hp).toBe(hp)
  })

  it('throws a wind-up away: getting out of the way comes first', () => {
    const sim = arena()
    const h = sim.hero.unit
    h.action = { id: 'fireball', t: 0.1, hitAt: 0.6, end: 0.9, done: false, targetId: 0, x: h.x, z: h.z + 5, sx: h.x, sz: h.z, a: 0, ability: -1, slot: 0 }
    const [dx, dz] = openWay(sim)
    expect(rollHero(sim, dx, dz)).toBe(true)
    expect(h.action?.id).toBe('roll')
  })
})

describe('the reference player rolls out of warnings (#74, D80)', () => {
  it('rolls out of about seven in ten circles about to land on it, and out of them', () => {
    let rolled = 0
    let cleared = 0
    const N = 60
    for (let i = 0; i < N; i++) {
      const sim = arena()
      const h = sim.hero.unit
      // A burst about to land where the hero stands.
      sim.emit({ t: 'tele', tele: { shape: 'circle', x: h.x + 0.6, z: h.z + 0.3, r: 2.2, w: 0, a: 0, dur: 0.5, team: 1 } })
      // Each its own warning, as in a long fight.
      sim.dangers[0]!.n = i + 1
      botThink(sim)
      if (h.action?.id === 'roll') {
        rolled++
        step(sim, ROLL_T + 0.05)
        if (!inDanger(sim.dangers[0]!, h.x, h.z, h.r)) cleared++
      }
    }
    expect(rolled / N).toBeGreaterThan(BOT_DODGE - 0.15)
    expect(rolled / N).toBeLessThan(BOT_DODGE + 0.15)
    expect(cleared).toBeGreaterThan(rolled * 0.8)
  })

  it('waits for a hunting shadow to lock before it rolls', () => {
    const sim = arena()
    const h = sim.hero.unit
    sim.emit({ t: 'tele', tele: { shape: 'circle', x: h.x, z: h.z, r: 3, w: 0, a: 0, dur: 0.5, team: 1, follow: h.id, lock: 0.45 } })
    sim.dangers[0]!.n = 2 // a warning it rolls for
    botThink(sim)
    expect(h.action?.id).not.toBe('roll')
    step(sim, 0.46)
    botThink(sim)
    expect(h.action?.id).toBe('roll')
  })

  it('ignores its own side’s warnings', () => {
    const sim = arena()
    const h = sim.hero.unit
    sim.emit({ t: 'tele', tele: { shape: 'circle', x: h.x, z: h.z, r: 3, w: 0, a: 0, dur: 0.4, team: 0 } })
    sim.dangers[0]!.n = 2
    botThink(sim)
    expect(h.action?.id).not.toBe('roll')
  })
})
