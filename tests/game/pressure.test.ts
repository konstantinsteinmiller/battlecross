import { describe, expect, it } from 'vitest'
import {
  BOSS_SHARE, CAP, CAP_OVER, RAMP_EASE, RAMP_HIT, RAMP_HIT_STRONG, RAMP_STEP, RAMP_TUNE, RAMP_WINDOW, STEP, STEP_OVER, WINDOW, judge, newPressure, notePotion, pressurePips, rampCeiling, rampKindOf, rampNext, sessionPressure, setSessionPressure, stepPressure, type BossRamp
} from '@/game/sim/pressure'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { dealDamage } from '@/game/sim/combat'
import { spawnEnemy } from '@/game/sim/spawn'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'
import { botThink, setupRun } from '@/game/sim/bot'
import { stepSim } from '@/game/sim/step'
import { CLASS_IDS } from '@/game/data/skills'
import { ZONES, ZONE_IDS } from '@/game/data/zones'

/**
 * Adaptive pressure (#124, D144): a minute with no trouble raises the enemies'
 * health and damage a step; potions hold it, repeated potions or a hard minute
 * lower it; a defeat clears it; a zone 5+ levels above the hero climbs faster.
 */

const field = (o: { mode?: 'zone' | 'arena' | 'town'; level?: number; heroLevel?: number } = {}): Sim => {
  const plan = generateArena(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: o.level ?? 5, difficulty: 1, mode: o.mode ?? 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: o.heroLevel ?? 5, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  sim.pressure = newPressure()
  return sim
}

/** One minute of fight time; `fought` deals a blow so the minute counts as a fight. */
const minute = (sim: Sim, o: { fought?: boolean; lose?: number; potion?: boolean } = {}): void => {
  if (o.fought ?? true) sim.hero.dealt += 10
  if (o.lose) { sim.hero.lost += o.lose * sim.hero.unit.s.maxHp }
  if (o.potion) notePotion(sim)
  for (let t = 0; t < WINDOW; t += 1) stepPressure(sim, 1)
}

describe('the verdict of a minute', () => {
  const base = { lostShare: 0, low: 1, potions: 0, lastPotion: false, fought: true }
  it('no trouble → up; a potion → hold; potions twice running or a hard minute → down', () => {
    expect(judge(base)).toBe('up')
    expect(judge({ ...base, lostShare: 0.2 })).toBe('hold')
    expect(judge({ ...base, potions: 1 })).toBe('hold')
    expect(judge({ ...base, potions: 1, lastPotion: true })).toBe('down')
    expect(judge({ ...base, lostShare: 0.6 })).toBe('down')
    expect(judge({ ...base, low: 0.2 })).toBe('down')
    expect(judge({ ...base, fought: false })).toBe('hold')
  })
})

describe('the pressure over a visit', () => {
  it('steps up a minute at a time, to its cap', () => {
    const sim = field()
    minute(sim)
    expect(sim.pressure!.bonus).toBeCloseTo(STEP, 6)
    expect(sim.events.some(e => e.t === 'pressure' && e.up && e.pips === 1)).toBe(true)
    for (let i = 0; i < 20; i++) minute(sim)
    expect(sim.pressure!.bonus).toBeCloseTo(CAP, 6)
    expect(pressurePips(sim.pressure!.bonus)).toBe(6)
  })

  it('a potion stops the climb; potions twice running bring it down', () => {
    const sim = field()
    minute(sim); minute(sim)
    expect(sim.pressure!.bonus).toBeCloseTo(2 * STEP, 6)
    minute(sim, { potion: true })
    expect(sim.pressure!.bonus).toBeCloseTo(2 * STEP, 6)
    minute(sim, { potion: true })
    expect(sim.pressure!.bonus).toBeCloseTo(STEP, 6)
  })

  it('a hard minute brings it down, never below 0', () => {
    const sim = field()
    minute(sim)
    minute(sim, { lose: 0.6 })
    expect(sim.pressure!.bonus).toBe(0)
    minute(sim, { lose: 0.6 })
    expect(sim.pressure!.bonus).toBe(0)
  })

  it('a zone 5+ levels above the hero climbs in bigger steps, to a higher cap', () => {
    const sim = field({ level: 12, heroLevel: 5 })
    sim.hero.level = 5
    minute(sim)
    expect(sim.pressure!.bonus).toBeCloseTo(STEP_OVER, 6)
    for (let i = 0; i < 20; i++) minute(sim)
    expect(sim.pressure!.bonus).toBeCloseTo(CAP_OVER, 6)
  })

  it('enemies spawned after a step are tougher; the living keep their share of health', () => {
    const sim = field()
    const before = spawnEnemy(sim, 'goblin', 0, 0)!
    before.hp = before.s.maxHp / 2
    const hp0 = before.s.maxHp
    const dmg0 = before.s.baseDmg
    minute(sim)
    const after = spawnEnemy(sim, 'goblin', 0, 0)!
    expect(after.s.maxHp).toBe(Math.round(hp0 * (1 + STEP)))
    expect(after.s.baseDmg).toBeCloseTo(dmg0 * (1 + STEP), 6)
    expect(before.s.maxHp).toBe(after.s.maxHp)
    expect(before.hp / before.s.maxHp).toBeCloseTo(0.5, 6)
  })

  it('a boss takes half the bonus', () => {
    const sim = field()
    sim.pressure!.bonus = 0.4
    const kind = 'goblinKing'
    const boss = spawnEnemy(sim, kind, 0, 0)!
    sim.pressure!.bonus = 0
    const plain = spawnEnemy(sim, kind, 0, 0)!
    const share = boss.rank === 'boss' ? BOSS_SHARE : 1
    expect(boss.s.baseDmg / plain.s.baseDmg).toBeCloseTo(1 + 0.4 * share, 6)
  })

  it('the colosseum and the towns never move it', () => {
    for (const mode of ['arena', 'town'] as const) {
      const sim = field({ mode })
      minute(sim)
      expect(sim.pressure!.bonus).toBe(0)
    }
  })

  it('a drunk potion is counted (the hero drinks through usePotion)', async () => {
    const { usePotion } = await import('@/game/sim/hero')
    const sim = field()
    const h = sim.hero.unit
    const e = spawnEnemy(sim, 'goblin', h.x + 2, h.z)!
    dealDamage(sim, e, h, 20, { type: 'true', canCrit: false })
    expect(usePotion(sim)).toBe(true)
    expect(sim.pressure!.potions).toBe(1)
  })

  it('the session level is kept between visits and cleared by setting 0', () => {
    setSessionPressure(0.3)
    expect(sessionPressure()).toBe(0.3)
    setSessionPressure(0)
    expect(sessionPressure()).toBe(0)
  })
})

describe('a level-appropriate run with the reference player', () => {
  it('does not run away: a step or two at most, and the bot still wins', () => {
    const zone = ZONE_IDS[7]!
    const def = ZONES[zone]
    let wins = 0
    const seen: string[] = []
    for (const cls of CLASS_IDS) {
      const { sim, plan } = setupRun({ zone, level: Math.min(30, def.min + 1), cls, seed: 77 })
      sim.pressure = newPressure()
      const dt = 1 / 30
      let think = 0
      while (!sim.ended && sim.time < 420) {
        think -= dt
        if (think <= 0) { think = 0.2; botThink(sim) }
        stepSim(sim, plan, dt)
        sim.events.length = 0
      }
      seen.push(`${cls} ${sim.ended} ${sim.time.toFixed(0)}s +${Math.round(sim.pressure.bonus * 100)}%`)
      // A level-appropriate visit is no walkover: two steps at most.
      expect(sim.pressure.bonus, seen.join('; ')).toBeLessThanOrEqual(2 * STEP + 1e-9)
      if (sim.ended === 'victory') wins++
    }
    expect(wins, seen.join('; ')).toBeGreaterThanOrEqual(CLASS_IDS.length - 2)
  })
})

/**
 * The boss ramp (#157): a boss the hero takes no harm from hits harder, a step
 * a window, until a normal attack costs ~7 % and an ability ~22.5 % of his
 * health; a potion eases it back only a little.
 */
describe('the boss ramp', () => {
  const ramp = (o: Partial<BossRamp> = {}): BossRamp =>
    ({ id: 1, kind: 'boss', bonus: 0, hit: 0.02, strong: 0.05, t: 0, idle: 0, lost0: 0, potions: 0, ...o })

  it('stops where a normal attack or an ability reaches its target', () => {
    expect(rampCeiling(ramp())).toBeCloseTo(Math.min(RAMP_HIT / 0.02, RAMP_HIT_STRONG / 0.05) - 1, 6)
    expect(rampCeiling(ramp({ hit: 0.1 }))).toBe(0)
    expect(rampCeiling(ramp({ hit: -1, strong: -1 }))).toBe(0)
  })

  it('climbs on an easy window, holds on a hurting one, eases slowly after a potion', () => {
    expect(rampNext(ramp(), 0)).toBeCloseTo(RAMP_STEP, 6)
    expect(rampNext(ramp({ bonus: 0.5 }), 0.1)).toBe(0.5)
    expect(rampNext(ramp({ bonus: 1, potions: 1 }), 0)).toBeCloseTo(1 - RAMP_EASE, 6)
  })

  it('raises a real boss to the target and no further; a potion barely moves it', () => {
    const sim = field()
    const boss = spawnEnemy(sim, 'goblinKing', 0, 0)!
    const max = sim.hero.unit.s.maxHp
    const dmg0 = boss.s.baseDmg
    // Blows at 2 % of the hero's health (true damage, so the number lands as is).
    const fight = (): void => {
      for (let t = 0; t < RAMP_WINDOW; t++) {
        dealDamage(sim, boss, sim.hero.unit, max * 0.02 * boss.s.baseDmg / dmg0, { type: 'true', attack: true, canCrit: false })
        sim.hero.unit.hp = max
        sim.hero.lost = 0
        stepPressure(sim, 1)
      }
    }
    fight()
    expect(boss.s.baseDmg / dmg0).toBeCloseTo(1 + RAMP_STEP, 3)
    for (let i = 0; i < 80; i++) fight()
    expect(boss.s.baseDmg / dmg0).toBeCloseTo(RAMP_HIT / 0.02, 1)
    const top = boss.s.baseDmg
    notePotion(sim)
    fight()
    expect(boss.s.baseDmg / top).toBeCloseTo((1 + (RAMP_HIT / 0.02 - 1) * (1 - RAMP_EASE)) / (RAMP_HIT / 0.02), 2)
  })
})

describe('the ramp for champions and elites', () => {
  it('climbs slower and stops lower than a boss', () => {
    expect(RAMP_TUNE.champion.step).toBeLessThan(RAMP_TUNE.boss.step)
    expect(RAMP_TUNE.elite.step).toBeLessThan(RAMP_TUNE.champion.step)
    expect(RAMP_TUNE.champion.hit).toBeLessThan(RAMP_TUNE.boss.hit)
    expect(RAMP_TUNE.elite.hit).toBeLessThan(RAMP_TUNE.champion.hit)
  })

  it('gives every elite its own ramp, and none to a normal foe', () => {
    const sim = field()
    const a = spawnEnemy(sim, 'goblin', 0, 0)!
    const b = spawnEnemy(sim, 'goblin', 1, 0)!
    const plain = spawnEnemy(sim, 'goblin', 2, 0)!
    a.rank = 'elite'
    b.rank = 'elite'
    b.champion = true
    expect(rampKindOf(a)).toBe('elite')
    expect(rampKindOf(b)).toBe('champion')
    expect(rampKindOf(plain)).toBeNull()
    const max = sim.hero.unit.s.maxHp
    const dA = a.s.baseDmg, dB = b.s.baseDmg, dP = plain.s.baseDmg
    for (let t = 0; t < RAMP_WINDOW; t++) {
      for (const u of [a, b, plain]) dealDamage(sim, u, sim.hero.unit, max * 0.01, { type: 'true', attack: true, canCrit: false })
      sim.hero.unit.hp = max
      sim.hero.lost = 0
      stepPressure(sim, 1)
    }
    expect(a.s.baseDmg / dA).toBeCloseTo(1 + RAMP_TUNE.elite.step, 3)
    expect(b.s.baseDmg / dB).toBeCloseTo(1 + RAMP_TUNE.champion.step, 3)
    expect(plain.s.baseDmg).toBe(dP)
  })
})
