import { describe, expect, it } from 'vitest'
import { SIEGE_CAP, siegeEnemyLevel, type DefenceId, type SiegeTier } from '@/game/data/siege'
import { Sim } from '@/game/sim/world'
import { applyPlan } from '@/game/sim/director'
import { createHero, orderAttack } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { botThink, referenceBuild } from '@/game/sim/bot'
import { generateSiege } from '@/game/sim/siegeMap'
import { armSiege, buildDefence, skipBuild } from '@/game/sim/siege'
import type { ClassId } from '@/game/data/skills'

/**
 * The siege against the reference player (`sim/bot.ts`, afterplay §8.4): a
 * geared hero at the siege's level who spends his Marks on the obvious
 * defences holds a Normal siege to the Siege Lord's fall in about the time
 * §8.1 gives it (12-15 min); Hard is a real step up. Prints its numbers.
 */

const BUY: DefenceId[] = ['repair', 'ballista', 'militia', 'cauldron', 'ballista', 'cauldron', 'ballista', 'cauldron', 'barricade']

const runSiege = (cls: ClassId, tier: SiegeTier, level: number, seed = 7): { won: boolean; waves: number; seconds: number; gate01: number } => {
  const plan = generateSiege(seed)
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: siegeEnemyLevel(level, tier), difficulty: 1, mode: 'arena', zone: 'siege' })
  applyPlan(sim, plan)
  const ref = referenceBuild({ level, cls, geared: true })
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  const s = armSiege(sim, { tier, cap: SIEGE_CAP, commander: { look: 'captain', voice: 'hale' } })
  const dt = 1 / 30
  let think = 0
  const log: string[] = []
  let w = 0
  while (!sim.ended && sim.time < 1800) {
    if (s.phase === 'build' && s.wave !== w) {
      w = s.wave
      const g = sim.get(s.gate)!
      log.push(`w${w}@${Math.round(sim.time)}s gate${Math.round((g.hp / g.s.maxHp) * 100)} hero${Math.round((sim.hero.unit.hp / sim.hero.unit.s.maxHp) * 100)} marks${s.marks}`)
    }
    if (s.phase === 'build') {
      // Spend what there is, the gate first when it is hurt, then the plan's order; then on.
      const gate = sim.get(s.gate)!
      if (gate.hp < gate.s.maxHp * 0.75) buildDefence(sim, 'repair')
      for (const d of BUY) if (d !== 'repair') buildDefence(sim, d)
      skipBuild(sim)
    }
    think -= dt
    if (think <= 0) {
      think = 0.2
      botThink(sim)
      // A player goes for the ram the moment it is warned (§8.5).
      const ram = s.rams.map(r => sim.live(r.id)).find(Boolean)
      if (ram && sim.hero.order.targetId !== ram.id) orderAttack(sim, ram.id)
    }
    stepSim(sim, plan, dt)
    sim.events.length = 0
  }
  const gate = sim.get(s.gate)!
  if (process.env.SIEGE_LOG) console.log(cls, tier, log.join(' | '), 'end', sim.ended, Math.round(sim.time), 'hero alive', sim.hero.unit.alive)
  return { won: sim.ended === 'victory', waves: s.cleared, seconds: Math.round(sim.time), gate01: Math.round((gate.alive ? gate.hp / gate.s.maxHp : 0) * 100) / 100 }
}

describe('the siege against the reference player', () => {
  it('a geared level-40 hero holds a Normal siege; Hard is harder', () => {
    const rows: string[] = []
    for (const cls of ['aegis', 'pyro', 'blood'] as const) {
      const n = runSiege(cls, 'normal', 40)
      const h = runSiege(cls, 'hard', 40)
      rows.push(`${cls}: normal ${JSON.stringify(n)} hard ${JSON.stringify(h)}`)
      expect(n.won, `${cls} normal ${JSON.stringify(n)}`).toBe(true)
      expect(n.seconds, `${cls} normal`).toBeGreaterThan(5 * 60)
      expect(n.seconds, `${cls} normal`).toBeLessThan(18 * 60)
      expect(!h.won || h.gate01 <= n.gate01 + 0.05 || h.seconds >= n.seconds, `${cls} hard`).toBe(true)
    }
    console.log(rows.join('\n'))
  }, 300_000)
})
