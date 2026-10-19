import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero, orderAttack, orderMove, slotState, castSkill } from '@/game/sim/hero'
import { applyPlan, populateZone } from '@/game/sim/director'
import { generateZone } from '@/game/sim/zoneGen'
import { stepSim } from '@/game/sim/step'
import { hashSeed } from '@/game/sim/rng'
import { OPENING, ZONES } from '@/game/data/zones'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import { spawnEnemy } from '@/game/sim/spawn'
import { spawnDummy } from '@/game/coach/dummy'
import { boostOpeningFoes, syncHeroSkills } from '@/game/coach/mentor'
import { MENTOR_SKILL } from '@/game/data/mentor'

/**
 * ─── The opening fight for a hero who took the road teacher's skill ──────────
 *
 * Shadowstep is free and strong; without a price it ate the fight (the hero
 * lost ~20% of his health). `OPENING.skillHp` toughens the foes the moment it
 * is learned. The yardstick (owner): a player who uses both skills on cooldown,
 * never dodges, never drinks, wins with about 5% of his health left.
 */

export interface SkillRun { outcome: string; frac: number; seconds: number; hpMul: number }

/** `learnDelay`: seconds after the first pack falls until the lesson is learned (talk, window, back to the fight). */
export const skillRun = (opts: { learn: boolean; mul?: number; react?: number; learnDelay?: number; seed?: number } = { learn: true }): SkillRun => {
  const react = opts.react ?? 0.25
  const seedKey = opts.seed ?? 0
  const def = ZONES.plains
  const plan = generateZone(def, hashSeed('plains', seedKey), { tutorial: true, openingPack: OPENING.pack })
  const sim = new Sim({ seed: hashSeed('plains', seedKey), w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
  sim.enemyDmgMul = OPENING.dmg
  sim.holdLevelUp = true
  applyPlan(sim, plan)
  const equipped = { ...noGear(), main: 'rustedShortsword', off: 'woodenBuckler', body: 'paddedTunic' }
  createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped, passives: [] }, skills: ['shieldSlam'], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, 'plains', ['rustedShortsword', 'woodenBuckler', 'paddedTunic'], [])
  const dummy = spawnDummy(sim, plan)
  const h = sim.hero
  const u = h.unit
  let think = 0
  let target = 0
  let learnedAt = -1
  let firstDownAt = -1
  while (!sim.ended && sim.time < 600) {
    think -= 1 / 30
    if (firstDownAt < 0 && sim.groups[0]?.cleared) firstDownAt = sim.time
    // The lesson: learned once, a while after the first pack fell.
    if (opts.learn && learnedAt < 0 && firstDownAt >= 0 && sim.time - firstDownAt >= (opts.learnDelay ?? 6)) {
      learnedAt = sim.time
      syncHeroSkills(sim, ['shieldSlam', MENTOR_SKILL])
      boostOpeningFoes(sim, opts.mul ?? OPENING.skillHp)
    }
    if (think <= 0) {
      think = react
      const cur = target ? sim.units.find(e => e.id === target && e.alive) : undefined
      if (!cur) {
        target = 0
        if (dummy && dummy.alive) { target = dummy.id; orderAttack(sim, dummy.id) }
        else {
          let best: (typeof sim.units)[number] | undefined
          let bd = Infinity
          for (const e of sim.units) {
            if (!e.alive || e.team !== 1 || !e.awake) continue
            const d = Math.hypot(e.x - u.x, e.z - u.z)
            if (d < bd) { bd = d; best = e }
          }
          if (best) { target = best.id; orderAttack(sim, best.id) }
          else {
            const next = sim.groups.find(g => !g.cleared)
            if (next && (h.order.kind !== 'move' || Math.hypot(h.order.x - next.x, h.order.z - next.z) > 1)) orderMove(sim, next.x, next.z)
          }
        }
      }
      // Every skill on cooldown at a target in reach (no dodge, no potion).
      const t = target ? sim.units.find(e => e.id === target && e.alive) : undefined
      if (t && t !== dummy && t.awake) {
        for (const slot of [1, 0]) if (slotState(sim, slot).ready && Math.hypot(t.x - u.x, t.z - u.z) < 4) { castSkill(sim, slot, null); break }
      }
    }
    stepSim(sim, plan, 1 / 30)
    sim.events.length = 0
  }
  return { outcome: sim.ended || 'timeout', frac: Math.max(0, u.hp) / u.s.maxHp, seconds: sim.time, hpMul: sim.enemyHpMul }
}

const spread = (mul: number, learn = true): SkillRun[] => {
  const out: SkillRun[] = []
  for (const react of [0.1, 0.25, 0.4]) for (const learnDelay of [6, 9, 12, 15]) for (const seed of [0]) out.push(skillRun({ learn, mul, react, learnDelay, seed }))
  return out
}

const median = (xs: number[]): number => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!

describe('the opening fight with the road teacher\'s skill', () => {
  it('BATCH (set BAL_BATCH=1 to print): hp left with and without the multiplier', () => {
    if (!process.env.BAL_BATCH) return
    for (const mul of (process.env.BAL_MULS ?? '1,1.5,2,2.5,3').split(',').map(Number)) {
      const rs = spread(mul)
      const wins = rs.filter(r => r.outcome === 'victory')
      const fr = wins.map(r => r.frac)
      if (process.env.BAL_DETAIL) for (const r of rs) console.log(`D ${mul} ${r.outcome} ${(r.frac*100).toFixed(1)}`)
      console.log(`mul ${mul}: wins ${wins.length}/${rs.length}, median ${(median(fr) * 100).toFixed(1)}%, min ${(Math.min(...fr) * 100).toFixed(1)}%, max ${(Math.max(...fr) * 100).toFixed(1)}%`)
    }
  })

  it('scales the foes once: the multiplier is set, a second call changes nothing', () => {
    const a = skillRun({ learn: true, mul: 2 })
    expect(a.hpMul).toBe(2)
    const sim = new Sim({ seed: 1, w: 40, h: 40, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
    expect(boostOpeningFoes(sim, 2)).toBe(true)
    expect(boostOpeningFoes(sim, 2)).toBe(false)
    expect(sim.enemyHpMul).toBe(2)
  })

  it('without the skill nothing changes: the naive-clicker balance stays', () => {
    const r = skillRun({ learn: false })
    expect(r.hpMul).toBe(1)
  })

  it('a player who uses both skills on cooldown wins close: always wins, the median ends well under a quarter of the health', () => {
    const rs = spread(OPENING.skillHp)
    const wins = rs.filter(r => r.outcome === 'victory')
    expect(wins.length).toBe(rs.length)
    const m = median(wins.map(r => r.frac))
    expect(m).toBeGreaterThan(0)
    expect(m).toBeLessThanOrEqual(0.2)
  })

  it('the skill without the price would be a walk (the reason for the multiplier)', () => {
    const rs = spread(1)
    expect(median(rs.map(r => r.frac))).toBeGreaterThan(0.4)
  })

  it('living foes are scaled in proportion, the dummy and later births carry it too', () => {
    const plan = generateZone(ZONES.plains, hashSeed('plains', 0), { tutorial: true, openingPack: OPENING.pack })
    const sim = new Sim({ seed: hashSeed('plains', 0), w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: ['shieldSlam'], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
    populateZone(sim, plan, 'plains', [], [])
    const dummy = spawnDummy(sim, plan)!
    const foes = sim.units.filter(e => e.team === 1 && e !== dummy && e.alive)
    expect(foes.length).toBeGreaterThan(5)
    foes[0]!.hp *= 0.5
    const before = foes.map(e => [e.hp, e.s.maxHp] as const)
    const dummyHp = dummy.s.maxHp
    expect(boostOpeningFoes(sim, OPENING.skillHp)).toBe(true)
    foes.forEach((e, i) => {
      expect(e.s.maxHp).toBeCloseTo(before[i]![1] * OPENING.skillHp)
      expect(e.hp).toBeCloseTo(before[i]![0] * OPENING.skillHp)
    })
    expect(foes[0]!.hp / foes[0]!.s.maxHp).toBeCloseTo(0.5)
    expect(dummy.s.maxHp).toBe(dummyHp)
    // A second call (the same lesson heard twice, a resumed visit) changes nothing.
    expect(boostOpeningFoes(sim, OPENING.skillHp)).toBe(false)
    expect(foes[1]!.s.maxHp).toBeCloseTo(before[1]![1] * OPENING.skillHp)
    const born = spawnEnemy(sim, foes[1]!.kind, 0, 0)!
    expect(Math.abs(born.s.maxHp - before[1]![1] * OPENING.skillHp)).toBeLessThan(1)
  })
})
