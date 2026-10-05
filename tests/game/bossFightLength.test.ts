import { describe, expect, it } from 'vitest'
import { botThink, setupRun } from '@/game/sim/bot'
import { stepSim } from '@/game/sim/step'
import { ZONES } from '@/game/data/zones'
import type { ClassId } from '@/game/data/skills'
import type { ZoneId } from '@/game/data/items'

/**
 * The scripted boss fights (#74, D82): for the reference player at the zone's
 * level, each lasts about a minute to a minute and a half (from the finale
 * waking to its fall), most classes win it, and the reference player rolls
 * out of the warnings on the way (D80) — the fights never stall.
 */

const CLASSES: ClassId[] = ['aegis', 'shadow', 'pyro', 'sovereign', 'chrono', 'blood', 'aether', 'geo']
const FIGHTS: ZoneId[] = ['hollows', 'tundra', 'peak', 'fortress']

interface Fight { won: boolean; seconds: number; rolls: number; reached: boolean }

const fight = (zone: ZoneId, cls: ClassId): Fight => {
  const def = ZONES[zone]
  const { sim, plan } = setupRun({ zone, level: Math.min(30, def.min + 1), cls, seed: 77 })
  const fin = sim.groups.find(g => g.finale)!
  let t0 = -1
  let think = 0
  let rolls = 0
  while (!sim.ended && sim.time < 420) {
    think -= 1 / 30
    const cd0 = sim.hero.rollCd
    if (think <= 0) { think = 0.2; botThink(sim) }
    if (sim.hero.rollCd > cd0 + 1) rolls++
    stepSim(sim, plan, 1 / 30)
    sim.events.length = 0
    if (t0 < 0 && fin.awake) t0 = sim.time
  }
  return { won: sim.ended === 'victory', seconds: t0 >= 0 ? sim.time - t0 : 0, rolls, reached: t0 >= 0 }
}

describe('the scripted boss fights last a minute or so (#74, D82)', () => {
  for (const zone of FIGHTS) {
    it(`${zone}: most classes win, about a minute on average, rolling as they go`, () => {
      const runs = CLASSES.map(cls => fight(zone, cls))
      const won = runs.filter(r => r.won)
      const avg = won.reduce((n, r) => n + r.seconds, 0) / Math.max(1, won.length)
      expect(won.length).toBeGreaterThanOrEqual(6)
      expect(avg).toBeGreaterThan(40)
      expect(avg).toBeLessThan(100)
      // Every class that reaches the boss dodges something there.
      for (const r of runs) if (r.reached && r.seconds > 20) expect(r.rolls).toBeGreaterThan(0)
    }, 120000)
  }
})
