// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { ITEMS, ITEM_BY_ID, SMITHED, SMITH_LINES, SMITH_METAL, SMITH_PIECES, sellValue, smithItemId } from '@/game/data/items'
import { ATTRS } from '@/game/data/attributes'
import { SETS } from '@/game/art/artSheet'
import en from '@/i18n/locales/en'
import { ZONE_LOOT } from '@/game/data/loot'
import { ORE_IDS, ORE_PRICE } from '@/game/data/ores'
import { RECIPES, RECIPE_BY_ID, gradeMakes, gradeOf, spotHalf, strikeScore } from '@/game/data/smithing'
import { FORGE_MAX } from '@/game/data/forge'

/**
 * Smithing (roadmap #99, D120–D123): a fixed catalogue of metal gear that is
 * only ever forged, three strikes that decide its grade, and a smith who buys
 * ore at a flat price and teaches the craft.
 */

describe('the catalogue', () => {
  it('six pieces in each of six metals for each of six builds, each with a masterwork twin (a quality higher, up to legendary)', () => {
    expect(SMITH_LINES).toEqual(ATTRS.slice().sort((a, b) => SMITH_LINES.indexOf(a) - SMITH_LINES.indexOf(b)))
    expect(SMITHED).toHaveLength(SMITH_LINES.length * ORE_IDS.length * SMITH_PIECES.length * 2)
    expect(RECIPES).toHaveLength(SMITH_LINES.length * ORE_IDS.length * SMITH_PIECES.length)
    for (const r of RECIPES) {
      const a = ITEM_BY_ID[r.item]!
      const b = ITEM_BY_ID[r.master]!
      expect(a, r.id).toBeTruthy()
      expect(b, r.id).toBeTruthy()
      expect(b.tier, r.id).toBe(SMITH_METAL[r.metal].master)
      expect(b.tier, r.id).toBeGreaterThanOrEqual(a.tier)
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

describe('the endgame metals (roadmap #150)', () => {
  const pts = (id: string): number => {
    const m = ITEM_BY_ID[id]!.mods as Record<string, number>
    return ATTRS.reduce((s, a) => s + (m[a] ?? 0), 0)
  }
  const best = (slot: string, tier: number): number => Math.max(...ITEMS.filter(i => i.slot === slot && i.tier === tier).map(i => pts(i.id)))
  const endgame = RECIPES.filter(x => x.metal === 'adamant' || x.metal === 'aetherite')

  it('smithing reaches heroic and legendary: adamant plain heroic, its masterwork legendary, aetherite legendary both ways', () => {
    expect([SMITH_METAL.adamant.tier, SMITH_METAL.adamant.master]).toEqual([5, 6])
    expect([SMITH_METAL.aetherite.tier, SMITH_METAL.aetherite.master]).toEqual([6, 6])
    expect(SMITH_METAL.adamant.level).toBeGreaterThan(SMITH_METAL.mithril.level)
    expect(SMITH_METAL.aetherite.level).toBeGreaterThan(SMITH_METAL.adamant.level)
    for (const r of endgame) {
      expect(ITEM_BY_ID[r.item]!.tier, r.id).toBe(SMITH_METAL[r.metal].tier)
      expect(ITEM_BY_ID[r.master]!.tier, r.id).toBe(SMITH_METAL[r.metal].master)
    }
  })

  it('a smithed legendary is worth about a legendary drop, never more; a heroic one matches the heroic drops', () => {
    for (const r of endgame) {
      for (const id of [r.item, r.master]) {
        const it = ITEM_BY_ID[id]!
        const cap = best(it.slot, it.tier)
        if (!cap) continue
        // Not above the best found piece of that slot and quality (a hair of rounding).
        expect(pts(id), id).toBeLessThanOrEqual(cap * 1.15)
      }
    }
    // The masterwork main hand is within reach of what drops (80 % or more of the best legendary).
    for (const line of SMITH_LINES) {
      const sword = ITEM_BY_ID[RECIPE_BY_ID[line === 'str' ? 'aetherite:sword' : `aetherite:sword:${line}`]!.master]!
      expect(pts(sword.id), sword.id).toBeGreaterThanOrEqual(best('main', 6) * 0.8)
    }
    const plate = ITEM_BY_ID[RECIPE_BY_ID['aetherite:plate']!.master]!
    const titan = ITEM_BY_ID.armorOfTheTitan!
    expect(plate.armor!).toBeLessThanOrEqual(titan.armor!)
    expect(plate.armor!).toBeGreaterThanOrEqual(titan.armor! * 0.9)
  })

  it('costs climb with the metal: more gold, dearer nuggets', () => {
    for (let i = 1; i < ORE_IDS.length; i++) {
      const lo = RECIPE_BY_ID[`${ORE_IDS[i - 1]}:plate`]!
      const hi = RECIPE_BY_ID[`${ORE_IDS[i]}:plate`]!
      expect(hi.gold, hi.id).toBeGreaterThanOrEqual(lo.gold)
      expect(ORE_PRICE[ORE_IDS[i]!]).toBeGreaterThan(ORE_PRICE[ORE_IDS[i - 1]!])
    }
  })
})

describe('a build for every attribute (roadmap #148)', () => {
  const pts = (id: string): number => {
    const m = ITEM_BY_ID[id]!.mods as Record<string, number>
    return ATTRS.reduce((s, a) => s + (m[a] ?? 0), 0)
  }
  const cell = (id: string) => SETS.flatMap(x => x.cells).find(c => c?.id === id)

  it('the strength line keeps its ids, recipe ids and numbers', () => {
    expect(smithItemId('iron', 'sword', false)).toBe('smithIronSword')
    expect(smithItemId('gold', 'plate', true)).toBe('smithMasterGoldPlate')
    expect(RECIPE_BY_ID['iron:sword']!.item).toBe('smithIronSword')
    expect(smithItemId('iron', 'sword', true, 'int')).toBe('smithMasterIntIronSword')
    expect(RECIPE_BY_ID['silver:helm:cha']!.master).toBe('smithMasterChaSilverHelm')
    expect(new Set(SMITHED.map(i => i.id)).size).toBe(SMITHED.length)
    expect(new Set(RECIPES.map(r => r.id)).size).toBe(RECIPES.length)
  })

  it('every build has the same attribute budget as the strength line, piece for piece, tier for tier', () => {
    for (const r of RECIPES) {
      const base = RECIPE_BY_ID[`${r.metal}:${r.piece}`]!
      for (const [mine, theirs] of [[r.item, base.item], [r.master, base.master]] as const) {
        const a = pts(mine)
        const b = pts(theirs)
        expect(Math.abs(a - b), `${mine}: ${a} vs ${b}`).toBeLessThanOrEqual(Math.max(1, b * 0.15))
        const x = ITEM_BY_ID[mine]!
        const y = ITEM_BY_ID[theirs]!
        expect([x.slot, x.tier, x.level]).toEqual([y.slot, y.tier, y.level])
      }
    }
  })

  it('a build leads with its own attribute and weapons scale with it; a masterwork beats the plain piece', () => {
    for (const r of RECIPES.filter(x => x.line !== 'str')) {
      for (const id of [r.item, r.master]) {
        const it = ITEM_BY_ID[id]!
        const m = it.mods as Record<string, number>
        for (const o of ATTRS) expect(m[r.line] ?? 0, `${id} ${o}`).toBeGreaterThanOrEqual(m[o] ?? 0)
        if (it.weapon) expect(it.weapon.scale, id).toBe(r.line)
      }
      expect(pts(r.master), r.id).toBeGreaterThanOrEqual(pts(r.item))
    }
  })

  it('costs do not depend on the build: the same nuggets and gold as the strength sibling', () => {
    for (const r of RECIPES) {
      const base = RECIPE_BY_ID[`${r.metal}:${r.piece}`]!
      expect([r.nuggets, r.gold, r.level]).toEqual([base.nuggets, base.gold, base.level])
    }
  })

  it('every recipe resolves to items with an English name and an art blurb on a sheet', () => {
    const names = en.item as Record<string, { name: string }>
    for (const r of RECIPES) {
      for (const id of [r.item, r.master]) {
        expect(ITEM_BY_ID[id], id).toBeTruthy()
        expect(names[id]?.name, id).toBeTruthy()
        expect(cell(id)?.blurb, id).toBeTruthy()
      }
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
    expect(p.sellOres({ iron: 3, gold: 2 })).toBe(3 * ORE_PRICE.iron + 2 * ORE_PRICE.gold)
    expect(p.profile.gold).toBe(before + 3 * ORE_PRICE.iron + 2 * ORE_PRICE.gold)
    expect(p.oreCount('iron')).toBe(0)
    // A metal sold is still a metal known.
    expect(p.profile.inv.oresFound).toContain('gold')
    expect(p.sellOres({ iron: 1 })).toBe(0)
  })

  it('buys only the nuggets picked, and refuses a bad count whole', () => {
    p.addOres({ iron: 5, silver: 2 })
    const before = p.profile.gold
    expect(p.sellOres({ iron: 2, silver: 0 })).toBe(2 * ORE_PRICE.iron)
    expect(p.oreCount('iron')).toBe(3)
    expect(p.oreCount('silver')).toBe(2)
    expect(p.profile.gold).toBe(before + 2 * ORE_PRICE.iron)
    // Nothing picked, more than owned, negative or fractional: nothing sold.
    expect(p.sellOres({})).toBe(0)
    expect(p.sellOres({ iron: 1, silver: 3 })).toBe(0)
    expect(p.sellOres({ iron: -1 })).toBe(0)
    expect(p.sellOres({ iron: 1.5 })).toBe(0)
    expect(p.oreCount('iron')).toBe(3)
    expect(p.oreCount('silver')).toBe(2)
    expect(p.profile.gold).toBe(before + 2 * ORE_PRICE.iron)
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
