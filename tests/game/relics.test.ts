// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import {
  AFTER_BOSS_DROPS, AFTER_ITEMS, INFERNALS, ITEMS, ITEM_BY_ID, infernalId, noGear, priceOf, setPartner, type ZoneId
} from '@/game/data/items'
import { DEMON_AFFIXES, HEROIC, HEROIC_MAX, INFERNAL_MUL, SET_BONUS, heroicCost, heroicScale } from '@/game/data/relics'
import { forgedArmor, forgedMods } from '@/game/data/forge'
import { CAPSTONES, CAPSTONE_LEVEL, CAPSTONE_OF, CAPSTONE_PRICE, CLASS_IDS, SKILLS, SKILL_BY_ID, priceOf as skillPrice } from '@/game/data/skills'
import { INVASION, invadedFlag, invadedOpen } from '@/game/data/invasion'
import { SIEGE_MILESTONES } from '@/game/data/siege'
import { MAT_IDS, ORE_IDS, pouchPrice } from '@/game/data/ores'
import { startAttrs } from '@/game/data/attributes'
import { sumBuild } from '@/game/sim/stats'
import { Sim } from '@/game/sim/world'
import { createHero, castSkill } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { kill } from '@/game/sim/combat'
import { armInvasion } from '@/game/sim/invasion'
import { armRelicDrops, relicDefence, relicOffence } from '@/game/sim/relics'
import { HERO_SKILLS } from '@/game/sim/heroSkills'
import type { Unit } from '@/game/sim/types'

/**
 * Afterplay phase 8 (docs/gdd-afterplay.md §2.3, §2.4, §11): the boss uniques
 * and mythics, the Infernal twins, Heroic+, Demonglass and Mythic Ichor, the
 * capstones, and the hooks phases 6 and 7 left (owed siege pieces, the fifth
 * passive slot, the story's reward flags) — as data, in a fight, and through
 * the save.
 */

const BOSS_ZONES: readonly ZoneId[] = ['woods', 'outskirts', 'mines', 'temple', 'citadel', 'fortress', 'rift']

describe('the afterplay item tables', () => {
  it('each of the seven new bosses leaves a pair, a set, levels 37–60 (the Elder Dragon\'s mythic)', () => {
    for (const z of BOSS_ZONES) {
      const pair = AFTER_BOSS_DROPS[z]!
      expect(pair, z).toHaveLength(2)
      expect(INVASION[z].boss, z).toBeTruthy()
      const [a, b] = pair.map(id => ITEM_BY_ID[id]!)
      expect(a!.set).toBe(b!.set)
      expect(setPartner(a!)).toBe(b!.id)
      for (const it of [a!, b!]) {
        expect(it.level).toBeGreaterThanOrEqual(34)
        expect(it.level).toBeLessThanOrEqual(60)
        expect(it.tier).toBe(z === 'rift' ? 7 : 6)
        expect(it.unique).toBe(true)
        expect(SET_BONUS[it.set!], it.id).toBeTruthy()
      }
    }
    expect(Object.values(AFTER_BOSS_DROPS).flat()).toHaveLength(14)
  })

  it('every siege milestone piece exists now, and none of the new pieces is sold, gambled or dropped by the campaign', () => {
    for (const m of SIEGE_MILESTONES) if (m.item) expect(ITEM_BY_ID[m.item], m.item).toBeTruthy()
    const campaign = new Set(ITEMS.map(i => i.id))
    for (const it of AFTER_ITEMS) expect(campaign.has(it.id), it.id).toBe(false)
    // Mythics: the siege's top two and the Elder Dragon's pair.
    expect(AFTER_ITEMS.filter(i => i.tier === 7).map(i => i.id).sort()).toEqual(['crownOfTheLastBastion', 'dragonboneGreatsword', 'gatebreaker', 'heartOfTheElderDragon'])
  })

  it('every named unique of the campaign has an Infernal twin: +30 levels, attributes ×1.9, one demon affix, tinted not redrawn', () => {
    const uniques = ITEMS.filter(i => i.unique)
    expect(INFERNALS).toHaveLength(uniques.length)
    const affixKeys = DEMON_AFFIXES.map(a => Object.keys(a)[0]!)
    for (const it of uniques) {
      const tw = ITEM_BY_ID[infernalId(it.id)]!
      expect(tw, it.id).toBeTruthy()
      expect(tw.infernal).toBe(it.id)
      expect(tw.level).toBe(it.level + 30)
      expect(tw.tier).toBe(it.tier)
      expect(tw.drop).toEqual({ zone: it.drop.zone, src: 'infernal' })
      for (const a of ['str', 'dex', 'int', 'end', 'skl', 'cha'] as const) if (it.mods[a]) expect(tw.mods[a]).toBe(Math.round(it.mods[a]! * INFERNAL_MUL))
      expect(affixKeys.filter(k => (tw.mods[k as keyof typeof tw.mods] ?? 0) > (it.mods[k as keyof typeof it.mods] ?? 0))).toHaveLength(1)
      if (it.armor) expect(tw.armor).toBe(Math.round(it.armor * INFERNAL_MUL))
      if (it.tier < 6) expect(priceOf(tw)).toBeGreaterThan(priceOf(it) * 2.5)
    }
    // The eight affixes all appear.
    for (const k of affixKeys) expect(INFERNALS.some(i => (i.mods[k as keyof typeof i.mods] ?? 0) > 0), k).toBe(true)
  })

  it('Heroic+ costs the design\'s numbers (8k … 40k and Ichor) and grows only attributes and armour', () => {
    expect(HEROIC).toHaveLength(HEROIC_MAX)
    expect(heroicCost(0)).toEqual({ gold: 8000, glass: 20, ichor: 0 })
    expect(heroicCost(4)!.gold).toBe(40000)
    expect(heroicCost(4)!.ichor).toBeGreaterThan(0)
    expect(heroicCost(5)).toBeNull()
    for (let r = 1; r < HEROIC_MAX; r++) expect(HEROIC[r]!.gold).toBeGreaterThan(HEROIC[r - 1]!.gold)
    expect(heroicScale(0)).toBe(1)
    expect(heroicScale(5)).toBeCloseTo(1.3)
    const it = ITEM_BY_ID.chimeraMane!
    const m = forgedMods(it, 0, 5)
    expect(m.str).toBeCloseTo(it.mods.str! * 1.3, 1)
    expect(m.stunDurationCut).toBe(it.mods.stunDurationCut)
    const plate = ITEM_BY_ID.leviathanScale!
    expect(forgedArmor(plate, 2, 3)).toBeGreaterThan(forgedArmor(plate, 2, 0))
  })

  it('a boss pair worn together adds its set bonus; one piece alone does not', () => {
    const build = (eq: Partial<ReturnType<typeof noGear>>) => sumBuild({ level: 40, attrs: startAttrs(), equipped: { ...noGear(), ...eq }, passives: [] })
    const one = build({ head: 'chimeraMane' })
    const both = build({ head: 'chimeraMane', main: 'triFang' })
    expect(one.mods.spellCrit ?? 0).toBe(0)
    expect(both.mods.spellCrit).toBeCloseTo(SET_BONUS.chimera!.spellCrit!)
    // Heroic ranks reach the build too.
    const h = sumBuild({ level: 40, attrs: startAttrs(), equipped: { ...noGear(), head: 'chimeraMane' }, passives: [], heroic: { chimeraMane: 5 } })
    expect(h.attrs.str).toBeGreaterThan(one.attrs.str)
  })

  it('Demonglass and Mythic Ichor are pouch materials a smith buys, never mined', () => {
    expect(MAT_IDS).toEqual(['demonglass', 'ichor'])
    for (const m of MAT_IDS) { expect(ORE_IDS).not.toContain(m); expect(pouchPrice(m)).toBeGreaterThan(0) }
  })
})

describe('capstones (§2.3)', () => {
  it('one per class, level 45, 15k, no new slot, out of the class\'s twelve', () => {
    expect(CAPSTONES).toHaveLength(16)
    for (const c of CLASS_IDS) {
      const s = CAPSTONE_OF[c]
      expect(s, c).toBeTruthy()
      expect(s.level).toBe(CAPSTONE_LEVEL)
      expect(s.kind).toBe('active')
      expect(skillPrice(s)).toBe(CAPSTONE_PRICE)
      expect(SKILL_BY_ID[s.id]).toBe(s)
      expect(SKILLS.includes(s)).toBe(false)
      // It runs its signature skill's code, with numbers of its own and bigger.
      const base = SKILL_BY_ID[s.capstone!]!
      expect(base.cls).toBe(c)
      expect(HERO_SKILLS[s.id]).toBe(HERO_SKILLS[base.id])
      expect(Object.keys(s.p).some(k => (s.p[k] ?? 0) > (base.p[k] ?? 0)), s.id).toBe(true)
    }
  })

  it('every capstone casts in a fight', () => {
    for (const s of CAPSTONES) {
      const plan = generateArena(11)
      const sim = new Sim({ seed: 11, w: plan.w, h: plan.h, level: 50, difficulty: 1, mode: 'zone', zone: 'plains' })
      applyPlan(sim, plan)
      const attrs = { ...startAttrs(), str: 60, dex: 60, int: 60, end: 60, skl: 60, cha: 60 }
      createHero(sim, { build: { level: 50, attrs, equipped: noGear(), passives: [] }, skills: [s.id], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
      const u = sim.hero.unit
      u.mana = 9999
      // Foes too tough to fall, so every effect has someone to land on.
      for (let i = 0; i < 3; i++) { const e = spawnEnemy(sim, 'goblin', u.x + 2 + i, u.z + 1)!; e.awake = true; e.s.maxHp *= 1000; e.hp = e.s.maxHp }
      const target = sim.units.find(x => x.team === 1)!
      expect(castSkill(sim, 0, { x: target.x, z: target.z }), s.id).toBe(true)
      let seen = 0
      // Long enough for the slowest to land (the Stopped Hour strikes when time moves again).
      for (let t = 0; t < 7; t += 1 / 30) { stepSim(sim, plan, 1 / 30); seen += sim.events.length; sim.events.length = 0 }
      const did = sim.hero.dealt > 0 || sim.units.some(x => x.team === 0 && x.ownerId === u.id) || u.statuses.length > 0
      expect(did, `${s.id} did nothing`).toBe(true)
      expect(seen).toBeGreaterThan(0)
    }
  }, 60_000)
})

/** An invaded visit of a zone with a hero at level 45. */
const invadedSim = (zone: ZoneId): { sim: Sim; boss: (kind: string) => Unit } => {
  const plan = generateArena(5)
  const sim = new Sim({ seed: 5, w: plan.w, h: plan.h, level: 45, difficulty: 1, mode: 'zone', zone })
  applyPlan(sim, plan)
  armInvasion(sim)
  sim.dropTable = { mob: ['ironBroadsword'], chest: [], boss: [], secret: [] }
  armRelicDrops(sim)
  createHero(sim, { build: { level: 45, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  return { sim, boss: (kind) => spawnEnemy(sim, kind, plan.start.x + 4, plan.start.z)! }
}

describe('in a fight', () => {
  it('a boss\'s first kill leaves both pieces, 3 Ichor and its Demonglass; a repeat an Ichor and a piece one time in five at most', () => {
    const { sim, boss } = invadedSim('woods')
    expect(sim.dropTable.boss).toEqual(AFTER_BOSS_DROPS.woods)
    kill(sim, boss('chimera'), sim.hero.unit)
    expect([...sim.hero.items].sort()).toEqual([...AFTER_BOSS_DROPS.woods!].sort())
    expect(sim.hero.ores.ichor).toBe(3)
    expect(sim.hero.ores.demonglass).toBe(600)
    for (const id of sim.hero.items) sim.owned.add(id)
    sim.hero.items.length = 0
    let pieces = 0
    for (let i = 0; i < 40; i++) { kill(sim, boss('chimera'), sim.hero.unit); pieces = sim.hero.items.length }
    expect(sim.hero.ores.ichor).toBe(3 + 40)
    expect(pieces).toBeGreaterThan(0)
    expect(pieces).toBeLessThan(20)
  })

  it('a Reborn finale drops Infernal twins; a slain demon leaves Demonglass; the campaign zone does neither', () => {
    const { sim } = invadedSim('hollows')
    expect(sim.dropTable.boss.every(id => ITEM_BY_ID[id]!.infernal)).toBe(true)
    const imp = spawnEnemy(sim, 'imp', sim.hero.unit.x + 3, sim.hero.unit.z)!
    kill(sim, imp, sim.hero.unit)
    expect(sim.hero.ores.demonglass).toBe(1)
    const plan = generateArena(5)
    const calm = new Sim({ seed: 5, w: plan.w, h: plan.h, level: 10, difficulty: 1, mode: 'zone', zone: 'hollows' })
    applyPlan(calm, plan)
    createHero(calm, { build: { level: 10, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    kill(calm, spawnEnemy(calm, 'imp', plan.start.x + 3, plan.start.z)!, calm.hero.unit)
    expect(calm.hero.ores.demonglass ?? 0).toBe(0)
  })

  it('the demon affixes: more against demons, beasts and pylons; less from fire, shadow and demons', () => {
    const { sim } = invadedSim('woods')
    const imp = spawnEnemy(sim, 'imp', 0, 0)!
    const goblin = spawnEnemy(sim, 'goblin', 0, 0)!
    const harpy = spawnEnemy(sim, 'harpy', 0, 0)!
    expect(relicOffence({ demonBane: 0.15 }, imp)).toBeCloseTo(1.15)
    expect(relicOffence({ demonBane: 0.15 }, goblin)).toBe(1)
    expect(relicOffence({ beastBane: 0.2 }, harpy)).toBeCloseTo(1.2)
    expect(relicDefence({ fireWard: 0.2 }, goblin, 'fire')).toBeCloseTo(0.8)
    expect(relicDefence({ fireWard: 0.2 }, goblin, 'physical')).toBe(1)
    expect(relicDefence({ demonWard: 0.1 }, imp, 'physical')).toBeCloseTo(0.9)
  })

  it('the Rift\'s heart waits for the Hydra\'s fire key (B9)', () => {
    const won = new Set(['invaded:fortress', invadedFlag('fortress')])
    expect(invadedOpen('rift', won)).toBe(false)
    expect(invadedOpen('rift', new Set([...won, 'hydraKey']))).toBe(true)
  })
})

describe('through the profile and the save', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  const STATE_KEY = 'bcross_state'

  beforeEach(() => { drainAndResetModules() })
  afterEach(() => { drainPersist() })

  const boot = async (blob?: Record<string, unknown>): Promise<void> => {
    // The blob is in storage before the state module reads it.
    if (blob) localStorage.setItem(STATE_KEY, JSON.stringify(blob))
    await holdGameState()
    p = await import('@/game/state/profile')
    p.initProfile()
  }

  /** A save from before phase 8: the afterplay open, two siege pieces owed, Demonglass banked, B8's flag. */
  const OLD = {
    bc_version: 3,
    bc_level: 52,
    bc_gold: 100000,
    bc_hero: { xp: 0, attrs: startAttrs(), points: 0, learned: ['shieldSlam'], active: ['shieldSlam'], passive: ['', '', '', ''], ranks: {} },
    bc_inventory: { items: ['rustedShortsword', 'woodenBuckler', 'paddedTunic', 'ashenGreatsword'], equipped: { main: 'ashenGreatsword', off: 'woodenBuckler', body: 'paddedTunic' }, upgrades: { ashenGreatsword: 4 } },
    bc_world: { cleared: ['plains', 'rift'], flags: ['brk8', 'leviathanScale', 'fifthPassive', 'infernalForge'], at: 'bastion', afterplay: true },
    bc_meta: { siege: { wins: { normal: 5, hard: 1, nightmare: 0 }, runs: 6, best: 10, marks: 12, milestones: ['normal1', 'normal5', 'hard1'], owed: ['bastionBanner', 'wallwardensPlate'], glass: 300, clears: 0 } }
  }

  it('an old save is handed what the afterplay owed it, once: the siege pieces, its Demonglass, the Scale, the fifth slot', async () => {
    await boot(OLD)
    expect(p.owns('bastionBanner')).toBe(true)
    expect(p.owns('wallwardensPlate')).toBe(true)
    expect(p.owns('leviathanScale')).toBe(true)
    expect(p.profile.meta.siege.owed).toEqual([])
    expect(p.profile.meta.siege.glass).toBe(0)
    expect(p.oreCount('demonglass')).toBe(300)
    expect(p.profile.hero.passive).toHaveLength(5)
    expect(p.profile.inv.heroic).toEqual({})
    // Sold, then reloaded: the Scale is not given twice.
    expect(p.sellItem('leviathanScale')).toBe(true)
    p.saveProfile()
    p.loadProfile()
    expect(p.owns('leviathanScale')).toBe(false)
    expect(p.oreCount('demonglass')).toBe(300)
  })

  it('Heroic+, Infernal smithing and the Marks keep through a save round trip', async () => {
    await boot(OLD)
    // Heroic+: a worn piece, gold, Demonglass.
    expect(p.heroicBlock('ashenGreatsword')).toBe('')
    expect(p.buyHeroic('ashenGreatsword')).toBe(true)
    expect(p.heroicRank('ashenGreatsword')).toBe(1)
    expect(p.profile.gold).toBe(100000 - 8000)
    expect(p.oreCount('demonglass')).toBe(280)
    expect(p.heroicBlock('rustedShortsword')).toBe('worn')
    // Infernal smithing: the original goes into the fire, the twin keeps its levels and its slot.
    const twin = infernalId('ashenGreatsword')
    expect(p.infernalBlock('ashenGreatsword')).toBe('')
    expect(p.forgeInfernal('ashenGreatsword')).toBe(twin)
    expect(p.owns('ashenGreatsword')).toBe(false)
    expect(p.profile.inv.equipped.main).toBe(twin)
    expect(p.upgradeLevel(twin)).toBe(4)
    expect(p.heroicRank(twin)).toBe(1)
    expect(p.profile.inv.infernalForged).toBe(1)
    expect(p.infernalBlock('rustedShortsword')).toBe('none')
    // Marks for Demonglass.
    const glass = p.oreCount('demonglass')
    expect(p.buyGlassWithMarks()).toBe(true)
    expect(p.profile.meta.siege.marks).toBe(7)
    expect(p.oreCount('demonglass')).toBe(glass + 25)
    // A material sells to the smith.
    expect(p.sellOres({ demonglass: 5 })).toBe(5 * pouchPrice('demonglass'))
    // The fifth slot takes a passive.
    p.profile.hero.learned.push('aegisAura')
    p.profile.hero.attrs.str = 30; p.profile.hero.attrs.end = 30
    expect(p.setSlot('passive', 4, 'aegisAura')).toBe(true)
    p.saveProfile()
    p.loadProfile()
    expect(p.heroicRank(twin)).toBe(1)
    expect(p.upgradeLevel(twin)).toBe(4)
    expect(p.profile.inv.equipped.main).toBe(twin)
    expect(p.profile.inv.infernalForged).toBe(1)
    expect(p.oreCount('demonglass')).toBe(glass + 20)
    expect(p.profile.hero.passive[4]).toBe('aegisAura')
    expect(p.profile.meta.siege.marks).toBe(7)
  })

  it('without the fifth slot\'s flag, a fifth passive does not survive a load', async () => {
    await boot({ ...OLD, bc_world: { ...OLD.bc_world, flags: ['brk8'] }, bc_hero: { ...OLD.bc_hero, learned: ['shieldSlam', 'aegisAura'], passive: ['', '', '', '', 'aegisAura'] } })
    expect(p.profile.hero.passive).toHaveLength(4)
    expect(p.profile.hero.passive).not.toContain('aegisAura')
  })

  it('a capstone: the afterplay\'s, taught at the fort by a rescued teacher, at home by one never taken', async () => {
    await boot({ ...OLD, bc_level: 46, bc_hero: { ...OLD.bc_hero, attrs: { str: 60, dex: 60, int: 60, end: 60, skl: 60, cha: 60 } } })
    const aegis = CAPSTONE_OF.aegis.id
    const wind = CAPSTONE_OF.windrunner.id
    p.profile.world.at = 'sunford'
    expect(p.learnBlock(aegis)).toBe('fort')
    expect(p.learnBlock(wind)).toBe('')
    p.profile.world.at = 'bastion'
    expect(p.learnBlock(aegis)).toBe('')
    expect(p.learnSkill(aegis)).toBe(true)
    expect(p.profile.hero.active).toContain(aegis)
    // No ranks for a capstone.
    expect(p.rankBlock(aegis)).toBe('max')
    p.profile.world.afterplay = false
    expect(p.learnBlock(wind)).toBe('afterplay')
  })
})
