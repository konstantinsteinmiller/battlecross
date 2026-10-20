import { describe, expect, it } from 'vitest'
import { INVASION, invadedZone } from '@/game/data/invasion'
import { SKILL_BY_ID } from '@/game/data/skills'
import { HERO_SKILLS } from '@/game/sim/heroSkills'
import { botThink, setupRun } from '@/game/sim/bot'
import { stepSim } from '@/game/sim/step'
import type { ZoneId } from '@/game/data/items'

/**
 * A geared Shadow at the top of an afterplay band burst every afterplay boss
 * down in 3-5 s (outstanding-decisions.md, "Shadow afterplay balance"): its
 * Dance of Blades put all eight strikes into a boss, and its attack speed
 * and crit multiplier had no cap. The other classes take 30-70 s.
 */

// The mythic bosses and the Reborn Frost Jarl and Void Dragon. The three
// earliest Reborn (plains, hollows, crags) fall in 2-15 s to every class.
const BOSS_ZONES: ZoneId[] = ['woods', 'outskirts', 'mines', 'tundra', 'temple', 'citadel', 'peak', 'fortress', 'rift']

const shadowFight = (zone: ZoneId): number => {
  const { sim, plan } = setupRun({ zone, level: INVASION[zone].max, cls: 'shadow', geared: true, invaded: true, seed: 7, potions: 5 })
  const b = sim.units.find(u => u.kind === invadedZone(zone).finale.leader)!
  let think = 0
  let woke = -1
  while (!sim.ended && sim.time < 600 && b.alive) {
    think -= 1 / 30
    if (think <= 0) { think = 0.2; botThink(sim) }
    stepSim(sim, plan, 1 / 30)
    sim.events.length = 0
    if (woke < 0 && b.awake) woke = sim.time
  }
  expect(b.alive, zone).toBe(false)
  return sim.time - woke
}

describe('the Shadow against the afterplay bosses', () => {
  it('Dance of Blades strikes a lone boss once, not eight times', () => {
    const { sim, plan } = setupRun({ zone: 'woods', level: INVASION.woods.max, cls: 'shadow', geared: true, invaded: true, seed: 7 })
    stepSim(sim, plan, 1 / 30)
    const b = sim.units.find(u => u.kind === invadedZone('woods').finale.leader)!
    const u = sim.hero.unit
    // Alone with the boss: everything else gone.
    for (const e of sim.units) if (e.team === 1 && e !== b) e.alive = false
    u.x = b.x + b.r + u.r + 0.4
    u.z = b.z
    HERO_SKILLS.danceOfBlades!({ sim, h: sim.hero, u, def: SKILL_BY_ID.danceOfBlades!, target: b, x: b.x, z: b.z, a: 0 })
    let strikes = 0
    for (let i = 0; i < 60; i++) {
      stepSim(sim, plan, 1 / 30)
      for (const e of sim.events) if (e.t === 'hit' && e.tgt === b.id && e.skill === 'danceOfBlades') strikes++
      sim.events.length = 0
    }
    expect(strikes).toBe(1)
  })

  it('a geared Shadow of the band\'s top no longer bursts the bosses down in seconds', () => {
    const fights = BOSS_ZONES.map(shadowFight)
    // eslint-disable-next-line no-console
    console.log(`[shadow afterplay] ${BOSS_ZONES.map((z, i) => `${z} ${Math.round(fights[i]!)} s`).join(', ')}`)
    // Before: 3-5 s on most of them, 6.6 s on average.
    for (let i = 0; i < fights.length; i++) {
      expect(fights[i], BOSS_ZONES[i]).toBeGreaterThan(5)
      expect(fights[i], BOSS_ZONES[i]).toBeLessThan(90)
    }
    expect(fights.reduce((n, f) => n + f, 0) / fights.length).toBeGreaterThan(12)
  }, 300_000)
})
