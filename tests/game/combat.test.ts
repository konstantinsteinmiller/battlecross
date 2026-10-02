import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero, castSkill, usePotion, orderAttack, slotState, POTION_HEAL } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { applyStatus, dealDamage, isControlled, heal, stepStatuses } from '@/game/sim/combat'
import { armorMitigation, heroStats, enemyHp, enemyDmg, shopDiscount, type HeroBuild } from '@/game/sim/stats'
import { stepSim } from '@/game/sim/step'
import { referenceBuild, setupRun, runZone, botThink } from '@/game/sim/bot'
import { generateArena, generateZone } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs, ATTR_EFFECTS, CAPS } from '@/game/data/attributes'
import { CLASS_IDS, SKILLS, SKILL_BY_ID, skillsOf } from '@/game/data/skills'
import { ZONES } from '@/game/data/zones'
import type { Unit } from '@/game/sim/types'

/**
 * The combat rules, on the pure simulation (no renderer, no Vue): the stat
 * maths, damage and its mitigations, statuses, the potion, and a smoke run of
 * every active skill of every class.
 */

const naked = (over: Partial<HeroBuild> = {}): HeroBuild => ({
  level: 1, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [], ...over
})

/** An open field with a hero in the middle. */
const field = (build: HeroBuild = naked(), skills: string[] = [], level = 5): Sim => {
  const plan = generateArena(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build, skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  return sim
}
const foe = (sim: Sim, kind = 'goblin', dx = 2, dz = 0): Unit => {
  const u = sim.hero.unit
  const e = spawnEnemy(sim, kind, u.x + dx, u.z + dz)!
  e.awake = true
  return e
}
const run = (sim: Sim, seconds: number): void => {
  const plan = generateArena(7)
  for (let t = 0; t < seconds; t += 1 / 30) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
}

describe('stats from attributes and gear (GDD §4.1)', () => {
  it('Endurance and levels are health; Intelligence is mana', () => {
    const base = heroStats(naked())
    const tough = heroStats(naked({ attrs: { ...startAttrs(), end: 15 } }))
    expect(tough.maxHp - base.maxHp).toBeCloseTo(10 * ATTR_EFFECTS.end.hpPerPoint)
    expect(heroStats(naked({ level: 2 })).maxHp).toBeGreaterThan(base.maxHp)
    const smart = heroStats(naked({ attrs: { ...startAttrs(), int: 15 } }))
    expect(smart.maxMana - base.maxMana).toBeCloseTo(10 * ATTR_EFFECTS.int.manaPerPoint)
  })

  it('Dexterity is crit and speed, Skill is crit damage and cooldowns, Strength blocks', () => {
    const base = heroStats(naked())
    const quick = heroStats(naked({ attrs: { ...startAttrs(), dex: 25 } }))
    expect(quick.critChance).toBeGreaterThan(base.critChance)
    expect(quick.attackSpeed).toBeGreaterThan(base.attackSpeed)
    expect(quick.moveSpeed).toBeGreaterThan(base.moveSpeed)
    const deft = heroStats(naked({ attrs: { ...startAttrs(), skl: 25 } }))
    expect(deft.critMult).toBeGreaterThan(base.critMult)
    expect(deft.cdr).toBeGreaterThan(base.cdr)
    expect(heroStats(naked({ attrs: { ...startAttrs(), str: 25 } })).block).toBeGreaterThan(base.block)
  })

  it('gear adds its stats, and a passive its modifiers', () => {
    const base = heroStats(naked())
    const armed = heroStats(naked({ equipped: { main: 'ironBroadsword', off: 'ironShield', body: 'chainmailVest', trinket1: 'ringOfMending', trinket2: null } }))
    expect(armed.power.str).toBe(5 + 12 + 8 + 10)
    expect(armed.armor).toBeGreaterThan(base.armor + 28 - 0.001)
    expect(armed.block).toBeGreaterThan(base.block + 0.14)
    expect(armed.hpRegen).toBeGreaterThan(base.hpRegen + 2.9)
    const lethal = heroStats(naked({ passives: ['lethality'] }))
    expect(lethal.critChance - base.critChance).toBeCloseTo(0.15)
    expect(lethal.critMult - base.critMult).toBeCloseTo(0.3)
  })

  it('nothing the attributes buy escapes its cap', () => {
    const maxed = heroStats(naked({ level: 30, attrs: { str: 400, dex: 400, int: 400, end: 400, skl: 400, cha: 400 } }))
    expect(maxed.critChance).toBeLessThanOrEqual(CAPS.crit)
    expect(maxed.block).toBeLessThanOrEqual(CAPS.block)
    expect(maxed.cdr).toBeLessThanOrEqual(CAPS.cdr)
    expect(maxed.resist).toBeLessThanOrEqual(CAPS.resist)
    expect(shopDiscount(400)).toBe(CAPS.discount)
  })

  it('armour mitigates with diminishing returns and never reaches immunity', () => {
    expect(armorMitigation(0, 10)).toBe(0)
    let last = 0
    for (const a of [10, 50, 200, 1000, 100000]) {
      const m = armorMitigation(a, 10)
      expect(m).toBeGreaterThan(last)
      expect(m).toBeLessThan(1)
      last = m
    }
    // The same armour is worth less against a higher-level attacker.
    expect(armorMitigation(100, 30)).toBeLessThan(armorMitigation(100, 5))
  })

  it('enemies grow with the level', () => {
    for (let l = 1; l < 30; l++) {
      expect(enemyHp(l + 1)).toBeGreaterThan(enemyHp(l))
      expect(enemyDmg(l + 1)).toBeGreaterThan(enemyDmg(l))
    }
  })
})

describe('damage', () => {
  it('lands, and armour takes its share off physical hits but not off true damage', () => {
    const sim = field()
    const a = foe(sim, 'ironGolem')
    const b = foe(sim, 'ironGolem', -2)
    const hero = sim.hero.unit
    const phys = dealDamage(sim, hero, a, 100, { type: 'physical', canCrit: false })
    const pure = dealDamage(sim, hero, b, 100, { type: 'true', canCrit: false })
    expect(phys).toBeGreaterThan(0)
    expect(phys).toBeLessThan(pure)
    expect(a.hp).toBeCloseTo(a.s.maxHp - phys, 3)
  })

  it('a guaranteed crit hits harder by the crit multiplier', () => {
    const sim = field()
    const a = foe(sim, 'wolf')
    const b = foe(sim, 'wolf', -2)
    const hero = sim.hero.unit
    const plain = dealDamage(sim, hero, a, 20, { type: 'true', canCrit: false })
    const crit = dealDamage(sim, hero, b, 20, { type: 'true', crit: true })
    expect(crit / plain).toBeCloseTo(hero.s.critMult, 1)
  })

  it('kills pay the hero in XP and gold, once', () => {
    const sim = field()
    const e = foe(sim)
    dealDamage(sim, sim.hero.unit, e, 1e6, { type: 'true', canCrit: false })
    expect(e.alive).toBe(false)
    expect(sim.hero.kills).toBe(1)
    expect(sim.hero.xp).toBeGreaterThan(0)
    const xp = sim.hero.xp
    dealDamage(sim, sim.hero.unit, e, 1e6, { type: 'true', canCrit: false })
    expect(sim.hero.kills).toBe(1)
    expect(sim.hero.xp).toBe(xp)
  })

  it('an invulnerable unit takes nothing', () => {
    const sim = field()
    const hero = sim.hero.unit
    const e = foe(sim)
    applyStatus(sim, hero, 'invulnerable', 5, 1, hero)
    expect(dealDamage(sim, e, hero, 500, { type: 'physical', canCrit: false })).toBe(0)
    expect(hero.hp).toBe(hero.s.maxHp)
  })

  it('the hero falling ends the visit in defeat', () => {
    const sim = field()
    const e = foe(sim)
    dealDamage(sim, e, sim.hero.unit, 1e6, { type: 'true', canCrit: false })
    expect(sim.hero.unit.alive).toBe(false)
    run(sim, 0.2)
    expect(sim.ended).toBe('defeat')
  })
})

describe('statuses', () => {
  it('a stun stops a unit acting and wears off', () => {
    const sim = field()
    const e = foe(sim)
    applyStatus(sim, e, 'stun', 1.5, 1, sim.hero.unit)
    expect(isControlled(e)).toBe(true)
    for (let t = 0; t < 2; t += 0.1) stepStatuses(sim, e, 0.1)
    expect(isControlled(e)).toBe(false)
  })

  it('a burn deals its damage over its duration', () => {
    const sim = field()
    const e = foe(sim, 'ironGolem')
    const hp = e.hp
    applyStatus(sim, e, 'burn', 4, 10, sim.hero.unit, { type: 'fire' })
    for (let t = 0; t < 4.2; t += 0.1) stepStatuses(sim, e, 0.1)
    expect(hp - e.hp).toBeGreaterThan(15)
    expect(e.statuses.some(s => s.id === 'burn')).toBe(false)
  })

  it('poison stacks up to its cap', () => {
    const sim = field()
    const e = foe(sim, 'ironGolem')
    for (let i = 0; i < 9; i++) applyStatus(sim, e, 'poison', 4, 3, sim.hero.unit, { type: 'poison', maxStacks: 5 })
    const st = e.statuses.find(s => s.id === 'poison')!
    expect(st.n).toBe(5)
  })

  it('healing never overfills', () => {
    const sim = field()
    const hero = sim.hero.unit
    hero.hp = hero.s.maxHp - 10
    expect(heal(sim, hero, 500)).toBeCloseTo(10)
    expect(hero.hp).toBe(hero.s.maxHp)
  })
})

describe('the potion', () => {
  it('heals 45 % of max health, costs one, and needs a moment before the next', () => {
    const sim = field()
    const hero = sim.hero.unit
    hero.hp = 1
    expect(usePotion(sim)).toBe(true)
    expect(hero.hp).toBeCloseTo(1 + hero.s.maxHp * POTION_HEAL, 0)
    expect(sim.hero.potions).toBe(2)
    hero.hp = 1
    expect(usePotion(sim)).toBe(false)
    run(sim, 7)
    expect(usePotion(sim)).toBe(true)
  })

  it('is not wasted at full health', () => {
    const sim = field()
    expect(usePotion(sim)).toBe(false)
    expect(sim.hero.potions).toBe(3)
  })
})

describe('skills', () => {
  it('a skill costs its mana and starts its cooldown; it cannot be cast again at once', () => {
    const sim = field(naked(), ['shieldSlam'])
    const e = foe(sim, 'ironGolem')
    orderAttack(sim, e.id)
    const mana = sim.hero.unit.mana
    expect(castSkill(sim, 0, null)).toBe(true)
    run(sim, 1)
    expect(sim.hero.unit.mana).toBeLessThan(mana)
    expect(sim.hero.cd[0]).toBeGreaterThan(0)
    expect(slotState(sim, 0).ready).toBe(false)
    expect(castSkill(sim, 0, null)).toBe(false)
    expect(e.hp).toBeLessThan(e.s.maxHp)
  })

  it('Shield Slam stuns what it hits', () => {
    const sim = field(naked(), ['shieldSlam'])
    const e = foe(sim, 'ironGolem', 1.6)
    orderAttack(sim, e.id)
    castSkill(sim, 0, null)
    run(sim, 0.8)
    expect(e.statuses.some(s => s.id === 'stun')).toBe(true)
  })

  it('an enemy-targeted skill is refused with no enemy to aim at; an empty slot does nothing', () => {
    const sim = field(naked(), ['shieldSlam'])
    expect(castSkill(sim, 0, null)).toBe(false)
    expect(castSkill(sim, 3, null)).toBe(false)
    expect(sim.hero.unit.mana).toBe(sim.hero.unit.s.maxMana)
  })

  it('no mana, no cast', () => {
    const sim = field(naked(), ['shieldSlam'])
    const e = foe(sim, 'ironGolem')
    orderAttack(sim, e.id)
    sim.hero.unit.mana = 0
    expect(slotState(sim, 0).noMana).toBe(true)
    expect(castSkill(sim, 0, null)).toBe(false)
  })

  // Every active skill of every class, cast by a level-30 hero of that class
  // into a pack: it must be accepted, run for three seconds without throwing,
  // and leave the fight in a sane state.
  for (const cls of CLASS_IDS) {
    const actives = skillsOf(cls).filter(s => s.kind === 'active')
    it(`${cls}: all ${actives.length} active skills cast and resolve`, () => {
      const ref = referenceBuild({ level: 30, cls })
      for (const s of actives) {
        expect(ref.skills, `${s.id} is in the level-30 loadout`).toContain(s.id)
        const sim = field(ref.build, ref.skills, 28)
        const hero = sim.hero.unit
        const foes = [foe(sim, 'ironGolem', 2, 0), foe(sim, 'cultist', 2.5, 1.5), foe(sim, 'voidStalker', 3, -1.5)]
        for (const f of foes) { f.s.maxHp *= 40; f.hp = f.s.maxHp }
        orderAttack(sim, foes[0]!.id)
        const slot = ref.skills.indexOf(s.id)
        // Chrono Rewind needs a past to return to; Vent Heat something to vent.
        run(sim, 0.6)
        sim.hero.heat = 50
        hero.mana = hero.s.maxMana
        const aim = s.target === 'ground' || s.target === 'dir' ? { x: foes[0]!.x, z: foes[0]!.z } : null
        expect(castSkill(sim, slot, aim), s.id).toBe(true)
        run(sim, 0.7)
        const cd = sim.hero.cd[slot]!
        expect(() => run(sim, 2.5), s.id).not.toThrow()
        expect(Number.isFinite(hero.hp) && Number.isFinite(hero.x) && Number.isFinite(hero.z), s.id).toBe(true)
        expect(cd, `${s.id} cooldown`).toBeGreaterThan(0)
        for (const u of sim.units) expect(Number.isFinite(u.hp) && Number.isFinite(u.x), `${s.id}: ${u.kind}`).toBe(true)
      }
    })
  }

  it('every passive changes the hero it is slotted on', () => {
    const base = JSON.stringify(heroStats(naked({ level: 30, attrs: { str: 30, dex: 30, int: 30, end: 30, skl: 30, cha: 30 } })))
    for (const s of SKILLS.filter(x => x.kind === 'passive')) {
      const with_ = JSON.stringify(heroStats(naked({ level: 30, attrs: { str: 30, dex: 30, int: 30, end: 30, skl: 30, cha: 30 }, passives: [s.id] })))
      expect(with_, s.id).not.toBe(base)
    }
  })

  it('the summoner\'s guards arrive and are capped', () => {
    const ref = referenceBuild({ level: 30, cls: 'sovereign' })
    const sim = field(ref.build, ref.skills, 20)
    foe(sim, 'ironGolem', 6)
    const slot = ref.skills.indexOf('royalGuard')
    const max = SKILL_BY_ID.royalGuard!.p.max!
    for (let i = 0; i < 4; i++) {
      sim.hero.cd[slot] = 0
      sim.hero.unit.mana = sim.hero.unit.s.maxMana
      castSkill(sim, slot, null)
      run(sim, 0.8)
    }
    const guards = sim.units.filter(u => u.alive && u.kind === 'guard')
    expect(guards.length).toBeGreaterThan(0)
    expect(guards.length).toBeLessThanOrEqual(max)
  })
})

describe('a whole visit', () => {
  it('the opening zone is cleared by a naked level-1 hero pressing one button', () => {
    const { sim, plan } = setupRun({ zone: 'plains', cls: 'aegis', level: 1, seed: 3, geared: false })
    let think = 0
    while (!sim.ended && sim.time < 400) {
      think -= 1 / 30
      if (think <= 0) { think = 0.2; botThink(sim) }
      stepSim(sim, plan, 1 / 30)
      sim.events.length = 0
    }
    expect(sim.ended).toBe('victory')
    expect(sim.groupsDone).toBe(sim.groups.length)
    expect(sim.hero.xp).toBeGreaterThan(0)
    expect(sim.hero.gold).toBeGreaterThan(0)
  })

  it('is deterministic: the same seed plays the same visit', () => {
    const a = runZone({ zone: 'hollows', cls: 'pyro', level: 4, seed: 11 })
    const b = runZone({ zone: 'hollows', cls: 'pyro', level: 4, seed: 11 })
    expect(a).toEqual(b)
  })

  it('a zone\'s finale holds its leader, and its loot comes from its own table', () => {
    for (const zone of ['hollows', 'mines', 'rift'] as const) {
      const { sim } = setupRun({ zone, cls: 'aegis', level: ZONES[zone].min, seed: 5 })
      expect(sim.units.some(u => u.kind === ZONES[zone].finale.leader), zone).toBe(true)
      const all = [...sim.dropTable.mob, ...sim.dropTable.chest, ...sim.dropTable.boss, ...sim.dropTable.secret]
      expect(all.length, zone).toBeGreaterThan(0)
    }
    expect(generateZone(ZONES.plains, 1).packs.length).toBe(ZONES.plains.sections)
  })
})
