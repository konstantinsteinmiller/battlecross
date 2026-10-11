// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { ITEMS, ITEM_BY_ID, SMITHED, SMITH_PIECES, sellValue } from '@/game/data/items'
import { ZONE_LOOT } from '@/game/data/loot'
import { ORE_IDS, ORE_PRICE } from '@/game/data/ores'
import { RECIPES, gradeMakes, gradeOf, spotHalf, strikeScore } from '@/game/data/smithing'
import { FORGE_MAX } from '@/game/data/forge'

/**
 * Smithing (roadmap #99, D120–D123): a fixed catalogue of metal gear that is
 * only ever forged, three strikes that decide its grade, and a smith who buys
 * ore at a flat price and teaches the craft.
 */

describe('the catalogue', () => {
  it('six pieces in each of four metals, each with a masterwork twin a quality higher', () => {
    expect(SMITHED).toHaveLength(ORE_IDS.length * SMITH_PIECES.length * 2)
    expect(RECIPES).toHaveLength(ORE_IDS.length * SMITH_PIECES.length)
    for (const r of RECIPES) {
      const a = ITEM_BY_ID[r.item]!
      const b = ITEM_BY_ID[r.master]!
      expect(a, r.id).toBeTruthy()
      expect(b, r.id).toBeTruthy()
      expect(b.tier, r.id).toBe(a.tier + 1)
      expect(b.slot).toBe(a.slot)
      expect(a.level).toBe(r.level)
      // Plain gear, no passive.
      expect(a.unique).toBeFalsy()
      // Only weapons and armour.
      expect(['main', 'off', 'head', 'body', 'feet']).toContain(a.slot)
    }
  })

  it('never dropped, never in a shop or a gambler\'s pool: only forged', () => {
    const ids = new Set(SMITHED.map(i => i.id))
    for (const i of ITEMS) expect(ids.has(i.id), i.id).toBe(false)
    for (const z of Object.values(ZONE_LOOT)) for (const id of z?.items ?? []) expect(ids.has(id), id).toBe(false)
  })

  it('no forging for profit: the nuggets and the gold are worth more than the masterwork sells for', () => {
    for (const r of RECIPES) {
      const spent = r.gold + r.nuggets * ORE_PRICE[r.metal]
      expect(spent, r.id).toBeGreaterThan(sellValue(ITEM_BY_ID[r.master]!))
    }
  })

  it('in step with found gear: a masterwork is no stronger than the found pieces of its quality', () => {
    const pts = (id: string): number => {
      const m = ITEM_BY_ID[id]!.mods as Record<string, number>
      return ['str', 'dex', 'int', 'end', 'skl', 'cha'].reduce((s, a) => s + (m[a] ?? 0), 0)
    }
    for (const r of RECIPES) {
      const b = ITEM_BY_ID[r.master]!
      const found = ITEMS.filter(i => i.slot === b.slot && i.tier === b.tier)
      if (!found.length) continue
      const best = Math.max(...found.map(i => pts(i.id)))
      expect(pts(r.master), r.id).toBeLessThanOrEqual(best * 1.15)
    }
  })
})

describe('the anvil', () => {
  it('a strike on the spot\'s middle is worth all, two half-widths off nothing', () => {
    expect(strikeScore(0, 0.1)).toBe(1)
    expect(strikeScore(0.03, 0.1)).toBe(1)
    expect(strikeScore(0.2, 0.1)).toBe(0)
    expect(strikeScore(-0.1, 0.1)).toBeGreaterThan(0)
    expect(strikeScore(-0.1, 0.1)).toBeLessThan(1)
  })

  it('a rarer metal narrows the spot; a steadier hand (Dexterity) widens it, up to half again', () => {
    expect(spotHalf('mithril', 0)).toBeLessThan(spotHalf('iron', 0))
    expect(spotHalf('iron', 60)).toBeGreaterThan(spotHalf('iron', 0))
    expect(spotHalf('iron', 999)).toBeCloseTo(spotHalf('iron', 0) * 1.5)
  })

  it('three strikes make the grade; a hand long past the metal strikes one better; the grade picks the twin and its levels', () => {
    expect(gradeOf(0.5, 1, 3)).toBe('poor')
    expect(gradeOf(1.2, 1, 3)).toBe('good')
    expect(gradeOf(2.0, 1, 3)).toBe('great')
    expect(gradeOf(2.9, 1, 3)).toBe('perfect')
    expect(gradeOf(1.2, 11, 3)).toBe('great')
    expect(gradeOf(2.9, 30, 3)).toBe('perfect')
    const r = RECIPES[0]!
    expect(gradeMakes(r, 'poor')).toEqual({ id: r.item, levels: 0 })
    expect(gradeMakes(r, 'good')).toEqual({ id: r.item, levels: 1 })
    expect(gradeMakes(r, 'great')).toEqual({ id: r.master, levels: 1 })
    expect(gradeMakes(r, 'perfect')).toEqual({ id: r.master, levels: 3 })
  })
})

describe('at the smith', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  beforeEach(async () => {
    drainAndResetModules()
    localStorage.clear()
    await holdGameState()
    p = await import('@/game/state/profile')
    p.initProfile()
  })
  afterEach(() => { drainPersist(); vi.restoreAllMocks() })

  it('buys the whole pouch at the flat price', () => {
    p.addOres({ iron: 3, gold: 2 })
    const before = p.profile.gold
    expect(p.orePouchValue()).toBe(3 * ORE_PRICE.iron + 2 * ORE_PRICE.gold)
    expect(p.sellAllOre()).toBe(3 * ORE_PRICE.iron + 2 * ORE_PRICE.gold)
    expect(p.profile.gold).toBe(before + 3 * ORE_PRICE.iron + 2 * ORE_PRICE.gold)
    expect(p.oreCount('iron')).toBe(0)
    // A metal sold is still a metal known.
    expect(p.profile.inv.oresFound).toContain('gold')
    expect(p.sellAllOre()).toBe(0)
  })

  it('teaches once; a metal mined makes its pieces known; the strikes make the piece; again works it up', () => {
    const r = RECIPES.find(x => x.metal === 'iron' && x.piece === 'sword')!
    expect(p.smithBlock(r.id)).toBe('learn')
    p.learnSmithing()
    expect(p.smithBlock(r.id)).toBe('metal')
    p.addOres({ iron: 2 })
    expect(p.smithBlock(r.id)).toBe('ore')
    p.addOres({ iron: 10 })
    p.profile.gold = 0
    expect(p.smithBlock(r.id)).toBe('gold')
    p.profile.gold = 10000
    expect(p.smithBlock(r.id)).toBe('')
    const made = p.smithForge(r.id, 'great')!
    expect(made).toEqual({ id: r.master, levels: 1, fresh: true })
    expect(p.owns(r.master)).toBe(true)
    expect(p.upgradeLevel(r.master)).toBe(1)
    expect(p.oreCount('iron')).toBe(12 - r.nuggets)
    expect(p.profile.gold).toBe(10000 - r.gold)
    // The same twin again: worked up, at least a level.
    const again = p.smithForge(r.id, 'great')!
    expect(again).toEqual({ id: r.master, levels: 2, fresh: false })
    expect(p.profile.inv.items.filter(i => i === r.master)).toHaveLength(1)
    // To the top and no further.
    p.addOres({ iron: 40 })
    for (let k = 0; k < 6; k++) p.smithForge(r.id, 'perfect')
    expect(p.upgradeLevel(r.master)).toBe(FORGE_MAX)
  })

  it('kept in the save: the lesson, the pouch and the metals known', async () => {
    p.learnSmithing()
    p.addOres({ silver: 4 })
    p.saveProfile()
    drainAndResetModules()
    await holdGameState()
    const q = await import('@/game/state/profile')
    q.initProfile()
    expect(q.profile.inv.smithing).toBe(true)
    expect(q.oreCount('silver')).toBe(4)
    expect(q.profile.inv.oresFound).toEqual(['silver'])
  })
})
