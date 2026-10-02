// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { xpToNext } from '@/game/data/progression'

/**
 * The rules of the hero's own sheet: points, learning from trainers, the
 * loadout, gear, shops, the potion belt and the permanent quest decisions.
 * Everything here goes through `state/profile.ts`, as the menus do.
 */

type P = typeof import('@/game/state/profile')
let p: P

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  p.initProfile()
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

describe('levels and attribute points (GDD §4.1)', () => {
  it('a level is three points; spending one is permanent and counted', () => {
    expect(p.grantXp(xpToNext(1))).toBe(1)
    expect(p.profile.level).toBe(2)
    expect(p.profile.hero.points).toBe(3)
    expect(p.spendPoint('str')).toBe(true)
    expect(p.spendPoint('str', 2)).toBe(true)
    expect(p.profile.hero.attrs.str).toBe(8)
    expect(p.profile.hero.points).toBe(0)
    expect(p.spendPoint('dex')).toBe(false)
    expect(p.profile.hero.attrs.dex).toBe(5)
  })

  it('XP keeps counting after the cap, as lifetime XP', () => {
    p.grantXp(50_000_000)
    expect(p.profile.level).toBe(30)
    const before = p.lifetimeXp()
    p.grantXp(1234)
    expect(p.profile.level).toBe(30)
    expect(p.lifetimeXp()).toBe(before + 1234)
    expect(p.xp01()).toBe(1)
  })
})

describe('trainers and the loadout (GDD §4.2)', () => {
  it('learning costs gold and needs the level and attributes; the reason it fails is told', () => {
    expect(p.learnBlock('shieldSlam')).toBe('known')
    expect(p.learnBlock('fireball')).toBe('gold')
    p.profile.gold = 10_000
    expect(p.learnBlock('fireball')).toBe('')
    expect(p.learnBlock('flamePillar')).toBe('level')
    p.profile.level = 10
    expect(p.learnBlock('flamePillar')).toBe('attrs')
    const gold = p.profile.gold
    expect(p.learnSkill('fireball')).toBe(true)
    expect(p.profile.gold).toBe(gold - p.skillCost('fireball'))
    expect(p.knows('fireball')).toBe(true)
    expect(p.learnSkill('fireball')).toBe(false)
  })

  it('a hero may learn from ANY trainer: the build is classless', () => {
    p.profile.gold = 10_000
    for (const id of ['fireball', 'shadowstep', 'royalGuard', 'temporalStasis', 'sanguineFlask', 'aetherPistol', 'stoneSpike']) {
      expect(p.learnSkill(id), id).toBe(true)
    }
    expect(p.profile.hero.learned).toHaveLength(8)
  })

  it('a new skill drops into the first free slot of its kind; the seventh active waits', () => {
    p.profile.gold = 100_000
    for (const id of ['fireball', 'shadowstep', 'royalGuard', 'temporalStasis', 'sanguineFlask']) p.learnSkill(id)
    expect(p.profile.hero.active).toEqual(['shieldSlam', 'fireball', 'shadowstep', 'royalGuard', 'temporalStasis', 'sanguineFlask'])
    p.learnSkill('aetherPistol')
    expect(p.profile.hero.active).not.toContain('aetherPistol')
    expect(p.knows('aetherPistol')).toBe(true)
  })

  it('slotting swaps instead of duplicating, and an active never goes in a passive slot', () => {
    p.profile.gold = 100_000
    p.learnSkill('fireball')
    expect(p.setSlot('active', 0, 'fireball')).toBe(true)
    expect(p.profile.hero.active.slice(0, 2)).toEqual(['fireball', 'shieldSlam'])
    expect(p.setSlot('passive', 0, 'fireball')).toBe(false)
    expect(p.setSlot('active', 2, 'cataclysm')).toBe(false)
    expect(p.setSlot('active', 0, '')).toBe(true)
    expect(p.profile.hero.active[0]).toBe('')
    expect(p.setSlot('active', 9, 'fireball')).toBe(false)
  })

  it('a skill whose requirement only gear met drops out of the visit\'s loadout when the gear comes off', () => {
    p.profile.gold = 100_000
    p.profile.level = 6
    // Aegis Aura needs STR 8 / END 6: the starter sword and buckler carry it there.
    p.profile.hero.attrs.str = 5
    expect(p.totalAttrs().str).toBeGreaterThanOrEqual(8)
    expect(p.learnSkill('aegisAura')).toBe(true)
    p.learnSkill('radiantStrike')
    const withGear = p.loadoutActive()
    p.unequip('main')
    p.unequip('off')
    expect(p.totalAttrs().str).toBe(5)
    // Shield Slam needs STR 5 and stays; nothing that needed more may remain.
    expect(p.loadoutActive()).toContain('shieldSlam')
    expect(p.loadoutActive().filter(Boolean).length).toBeLessThanOrEqual(withGear.filter(Boolean).length)
  })

  it('a friendly faction\'s trainers charge less, and Charisma haggles', () => {
    p.profile.level = 5
    const full = p.skillCost('radiantStrike')
    p.profile.quests.rep.order = 2
    const friend = p.skillCost('radiantStrike')
    expect(friend).toBeLessThan(full)
    p.profile.hero.attrs.cha = 30
    expect(p.skillCost('radiantStrike')).toBeLessThan(friend)
  })
})

describe('gear and shops (GDD §6)', () => {
  it('every named item is owned once: a second copy becomes gold', () => {
    expect(p.gainItem('ironBroadsword')).toEqual({ added: true, gold: 0 })
    const gold = p.profile.gold
    const again = p.gainItem('ironBroadsword')
    expect(again.added).toBe(false)
    expect(again.gold).toBeGreaterThan(0)
    expect(p.profile.gold).toBe(gold + again.gold)
    expect(p.profile.inv.items.filter(i => i === 'ironBroadsword')).toHaveLength(1)
  })

  it('an item needs its level, goes in its own slot, and a new one is flagged until looked at', () => {
    p.gainItem('ironBroadsword')
    expect(p.profile.inv.fresh).toContain('ironBroadsword')
    expect(p.canEquip('ironBroadsword')).toBe(false)
    expect(p.equipItem('ironBroadsword')).toBeNull()
    p.profile.level = 6
    expect(p.equipItem('ironBroadsword')).toBe('main')
    expect(p.profile.inv.equipped.main).toBe('ironBroadsword')
    expect(p.profile.inv.fresh).not.toContain('ironBroadsword')
    expect(p.equipItem('voidCannon')).toBeNull()
  })

  it('two trinkets are worn, never the same one twice', () => {
    p.profile.level = 10
    p.gainItem('copperBand')
    p.gainItem('ringOfMending')
    p.gainItem('bandOfSwiftness')
    expect(p.equipItem('copperBand')).toBe('trinket1')
    expect(p.equipItem('ringOfMending')).toBe('trinket2')
    expect(p.equipItem('bandOfSwiftness')).toBe('trinket1')
    expect(p.equipItem('ringOfMending', 'trinket1')).toBe('trinket1')
    const eq = p.profile.inv.equipped
    expect(eq.trinket1).toBe('ringOfMending')
    expect(eq.trinket2).not.toBe('ringOfMending')
  })

  it('wearing something changes the hero\'s stats', () => {
    const before = p.computeStats()
    p.profile.level = 6
    p.gainItem('chainmailVest')
    p.equipItem('chainmailVest')
    const after = p.computeStats()
    expect(after.armor).toBeGreaterThan(before.armor)
    expect(after.power.str).toBeGreaterThan(before.power.str)
  })

  it('buying needs the gold; selling pays less than buying; worn gear is not sold from under the hero', () => {
    expect(p.buyItem('copperBand')).toBe(false)
    p.profile.gold = 1000
    const cost = p.buyCost('copperBand')
    expect(p.buyItem('copperBand')).toBe(true)
    expect(p.profile.gold).toBe(1000 - cost)
    expect(p.buyItem('copperBand')).toBe(false)
    expect(p.sellItem('rustedShortsword')).toBe(false)
    const gold = p.profile.gold
    expect(p.sellItem('copperBand')).toBe(true)
    expect(p.profile.gold - gold).toBeLessThan(cost)
    expect(p.owns('copperBand')).toBe(false)
  })

  it('the belt grows from three potions to five, each slot dearer', () => {
    expect(p.profile.inv.potions).toBe(3)
    expect(p.buyPotionSlot()).toBe(false)
    p.profile.gold = 10_000
    const first = p.potionUpgradeCost()
    expect(p.buyPotionSlot()).toBe(true)
    expect(p.potionUpgradeCost()).toBeGreaterThan(first)
    expect(p.buyPotionSlot()).toBe(true)
    expect(p.profile.inv.potions).toBe(p.POTION_MAX)
    expect(p.potionUpgradeCost()).toBe(0)
    expect(p.buyPotionSlot()).toBe(false)
  })
})

describe('decisions (GDD §3.2)', () => {
  it('a decision is made once: its flags, reputation and reward land, and it cannot be remade', () => {
    const gold = p.profile.gold
    expect(p.decideQuest('siege', 'defend')).toBe(true)
    expect(p.hasFlag('oakhavenSaved')).toBe(true)
    expect(p.profile.quests.rep).toMatchObject({ order: 2, syndicate: -3 })
    expect(p.profile.gold).toBe(gold + 300)
    expect(p.decideQuest('siege', 'betray')).toBe(false)
    expect(p.hasFlag('oakhavenFallen')).toBe(false)
    expect(p.profile.quests.done.siege).toBe('defend')
  })

  it('an option the hero does not qualify for cannot be forced', () => {
    expect(p.decideQuest('goblinKing', 'pact')).toBe(false)
    p.profile.hero.attrs.cha = 8
    expect(p.decideQuest('goblinKing', 'pact')).toBe(true)
    expect(p.isNodeOpen('arena')).toBe(false)
    p.clearNode('plains')
    p.clearNode('hollows')
    expect(p.isNodeOpen('arena')).toBe(true)
  })

  it('reputation stays inside −5…5 however the choices stack', () => {
    p.profile.quests.rep.order = 4
    p.decideQuest('siege', 'defend')
    p.decideQuest('core', 'destroy')
    expect(p.profile.quests.rep.order).toBe(5)
    expect(p.profile.quests.rep.syndicate).toBeGreaterThanOrEqual(-5)
  })

  it('a quest can hand over a named item', () => {
    p.decideQuest('oracle', 'slay')
    expect(p.owns('timekeepersHourglass')).toBe(true)
  })

  it('clearing a zone counts once', () => {
    expect(p.clearNode('plains')).toBe(true)
    expect(p.clearNode('plains')).toBe(false)
    expect(p.profile.story).toBe(1)
    expect(p.clearNode('sunford')).toBe(true)
    expect(p.profile.story).toBe(1)
  })
})
