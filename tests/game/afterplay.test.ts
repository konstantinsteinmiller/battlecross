import { describe, expect, it } from 'vitest'
import {
  AFTER_CURVE, AFTER_MAX_LEVEL, AFTER_XP_MUL, MAX_LEVEL, MAX_SKILL_RANK, addXp, levelCap, rankCd, rankLevel, rankMul, rankPrice,
  skillPrice, xpToNext, xpToReach
} from '@/game/data/progression'
import { ATTR_SOFT_CAP, softCapAttr, startAttrs } from '@/game/data/attributes'
import { SKILLS, SKILL_BY_ID, SKILL_LEVEL_SCALE, priceOf } from '@/game/data/skills'
import { heroStats, sumBuild, type HeroBuild } from '@/game/sim/stats'
import { Sim } from '@/game/sim/world'
import { createHero, castSkill } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'

/**
 * The afterplay's phase 1 (docs/gdd-afterplay.md §2, §17 P1): the level cap
 * gated 30/60, the softer curve above 30, the attribute soft cap, and skill
 * ranks II/III with their levels, prices and effects.
 */

const NO_GEAR = { main: null, off: null, head: null, body: null, hands: null, feet: null, trinket1: null, trinket2: null }

describe('the level cap and the curve (§2.1)', () => {
  it('is 30 until the afterplay opens, 60 after', () => {
    expect(MAX_LEVEL).toBe(30)
    expect(AFTER_MAX_LEVEL).toBe(60)
    expect(levelCap(false)).toBe(30)
    expect(levelCap(true)).toBe(60)
  })

  it('gates: before the trigger no amount of XP passes 30; after it, none passes 60', () => {
    expect(addXp(29, 0, 1e9).level).toBe(30)
    expect(addXp(30, 0, 1e9).level).toBe(30)
    expect(addXp(30, 0, 1e9, levelCap(true)).level).toBe(60)
    expect(addXp(60, 0, 1e9, 60).xp).toBe(xpToNext(60))
  })

  it('keeps the campaign curve to 30 exactly, and costs a quarter less above it', () => {
    const raw = (l: number): number => 45 * Math.pow(l, 1.55) + 30 * l
    for (let l = 1; l <= 30; l++) expect(xpToNext(l), `level ${l}`).toBe(Math.round(raw(l)))
    for (let l = 31; l < 60; l++) expect(xpToNext(l), `level ${l}`).toBe(Math.round(raw(l) * AFTER_CURVE))
    // Still rises level on level.
    for (let l = 31; l < 59; l++) expect(xpToNext(l + 1)).toBeGreaterThan(xpToNext(l))
    // xpToReach under the campaign cap is what it always was (leaderboard seed, save tiebreak).
    expect(xpToReach(45)).toBe(xpToReach(30))
  })

  it('lands near the doc\'s target: 30→60 at AFTER_XP_MUL costs about one to two campaigns of kill XP', () => {
    const campaign = xpToReach(30)
    const after = xpToReach(60, 60) - campaign
    // The doc's numbers: ~118k for the campaign, ~600k raw to 59, ×0.75 above 30.
    expect(campaign).toBeGreaterThan(105_000)
    expect(campaign).toBeLessThan(125_000)
    expect(after).toBeGreaterThan(380_000)
    expect(after).toBeLessThan(420_000)
    const effective = after / AFTER_XP_MUL
    expect(effective / campaign).toBeGreaterThan(1)
    expect(effective / campaign).toBeLessThan(2)
  })
})

describe('the attribute soft cap (§2.2)', () => {
  it('counts every point up to 300, half of each beyond', () => {
    expect(ATTR_SOFT_CAP).toBe(300)
    expect(softCapAttr(120)).toBe(120)
    expect(softCapAttr(300)).toBe(300)
    expect(softCapAttr(340)).toBe(320)
  })

  it('bends what an attribute does, never the totals skill requirements read', () => {
    const build = (str: number): HeroBuild => ({ level: 60, attrs: { ...startAttrs(), str }, equipped: { ...NO_GEAR }, passives: [] })
    expect(sumBuild(build(400)).attrs.str).toBe(400)
    expect(heroStats(build(400)).power.str).toBe(350)
    expect(heroStats(build(200)).power.str).toBe(200)
  })
})

describe('skill ranks (§2.3)', () => {
  it('Rank II: +30 % effect, −10 % cooldown; Rank III: +60 %, −10 %', () => {
    expect(MAX_SKILL_RANK).toBe(3)
    expect([rankMul(1), rankMul(2), rankMul(3)]).toEqual([1, 1.3, 1.6])
    expect([rankCd(1), rankCd(2), rankCd(3)]).toEqual([1, 0.9, 0.9])
  })

  it('asks the skill\'s own (0.7-scaled) level + 20 / + 32, capped 50 / 58', () => {
    expect(SKILL_LEVEL_SCALE).toBe(0.7)
    for (const s of SKILLS) {
      expect(rankLevel(s.level, 1), s.id).toBe(s.level)
      expect(rankLevel(s.level, 2), s.id).toBe(Math.min(50, s.level + 20))
      expect(rankLevel(s.level, 3), s.id).toBe(Math.min(58, s.level + 32))
      // Every rank is within the afterplay's levels.
      expect(rankLevel(s.level, 3)).toBeLessThanOrEqual(AFTER_MAX_LEVEL)
    }
  })

  it('is priced from the skill\'s price level + 20 / + 32, never below the lesson', () => {
    for (const s of SKILLS) {
      expect(rankPrice(s.priceLevel, 1), s.id).toBe(priceOf(s))
      expect(rankPrice(s.priceLevel, 2), s.id).toBe(skillPrice(s.priceLevel + 20))
      expect(rankPrice(s.priceLevel, 3), s.id).toBe(skillPrice(s.priceLevel + 32))
      expect(rankPrice(s.priceLevel, 3)).toBeGreaterThan(rankPrice(s.priceLevel, 2))
      expect(rankPrice(s.priceLevel, 2)).toBeGreaterThan(priceOf(s))
    }
  })

  it('a ranked passive gives its bonuses × the rank\'s factor', () => {
    const passive = SKILLS.find(s => s.kind === 'passive' && s.mods && Object.keys(s.mods).length)!
    const key = Object.keys(passive.mods!)[0] as keyof NonNullable<typeof passive.mods>
    const build = (rank: number): HeroBuild => ({ level: 50, attrs: startAttrs(), equipped: { ...NO_GEAR }, passives: [passive.id], ranks: { [passive.id]: rank } })
    expect(sumBuild(build(3)).mods[key]).toBeCloseTo(sumBuild(build(1)).mods[key]! * 1.6)
  })

  /** Cast a skill once at rank `rank`: the damage dealt in 2 s and the cooldown set. */
  const cast = (id: string, rank: number): { dealt: number; cd: number } => {
    const plan = generateArena(7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 40, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, {
      build: { level: 40, attrs: { ...startAttrs(), str: 60 }, equipped: { ...NO_GEAR }, passives: [], ranks: { [id]: rank } },
      skills: [id], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3
    })
    const u = sim.hero.unit
    u.mana = 9999
    const e = spawnEnemy(sim, 'goblin', u.x + 1.5, u.z)!
    e.awake = true
    e.s.maxHp *= 1000
    e.hp = e.s.maxHp
    // A clean read: no crits, no armour in the way.
    u.s.critChance = 0
    e.s.armor = 0
    castSkill(sim, 0, { x: e.x, z: e.z })
    const cd = sim.hero.cdMax[0]!
    // Only the skill: the hero's own swings are taken out of the count.
    u.s.baseDmg = 0
    for (let t = 0; t < 2; t += 1 / 30) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
    return { dealt: e.s.maxHp - e.hp, cd }
  }

  it('in a fight: Rank III hits 60 % harder and comes back 10 % sooner', () => {
    expect(SKILL_BY_ID.shieldSlam).toBeDefined()
    const one = cast('shieldSlam', 1)
    const three = cast('shieldSlam', 3)
    expect(one.dealt).toBeGreaterThan(0)
    expect(three.dealt / one.dealt).toBeGreaterThan(1.45)
    expect(three.dealt / one.dealt).toBeLessThan(1.75)
    expect(three.cd / one.cd).toBeCloseTo(0.9)
  })
})
