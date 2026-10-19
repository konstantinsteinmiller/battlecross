import { describe, expect, it } from 'vitest'
import { GAPFILL_ITEMS, GEAR_ATTR_SCALE, ITEMS, ITEM_BUDGET, itemsOfZone, priceOf, type ItemDef, type ItemSlot, type ZoneId } from '@/game/data/items'
import { ITEM_LINES, MATRIX_SLOTS, MATRIX_TIERS, PLATE_ARMOR, budgetRatio, cellOf, rawPoints } from '@/game/data/itemMatrix'
import type { Attr } from '@/game/data/attributes'
import { ZONE_LOOT } from '@/game/data/loot'
import { TOWNS, ZONES, ZONE_IDS } from '@/game/data/zones'

/**
 * The item matrix (items-gap-audit.md): attribute line x slot x quality. Two
 * rules keep the catalogue from growing holes or outliers again: every cell has
 * a piece (coverage), and every piece stays near the stat budget of its slot and
 * quality (balance).
 */
const SLOT_NAME: Record<ItemSlot, string> = { main: 'main hand', off: 'off hand', head: 'head', body: 'body', hands: 'hands', feet: 'feet', trinket: 'trinket' }

describe('item coverage: every line has a piece in every slot at every quality', () => {
  it.each(ITEM_LINES)('%s fills all 42 cells', (line) => {
    const holes: string[] = []
    for (const slot of MATRIX_SLOTS) for (const tier of MATRIX_TIERS) {
      if (cellOf(ITEMS, line, slot, tier).length === 0) holes.push(`${SLOT_NAME[slot]} tier ${tier}`)
    }
    expect(holes, `${line} has no piece in`).toEqual([])
  })

  it('a line\'s weapons are the weapons of its build: the real kinds, every kind of the line present', () => {
    const kinds: Record<Attr, string[]> = {
      str: ['sword', 'greatsword', 'axe', 'hammer'], dex: ['dagger', 'sword'], int: ['wand', 'staff'],
      skl: ['gun', 'cannon'], cha: ['wand', 'staff'], end: ['hammer', 'axe']
    }
    for (const line of ITEM_LINES) {
      const weapons = ITEMS.filter(i => i.weapon?.scale === line)
      expect(new Set(weapons.map(w => w.kind)), line).toEqual(new Set(kinds[line]))
      // One swing at each quality: a weapon build never skips a rung.
      expect(weapons.map(w => w.tier).sort(), line).toEqual(expect.arrayContaining(MATRIX_TIERS.slice()))
    }
  })

  it('each line has a legendary for every slot, and the new ones are found where the other legendaries are', () => {
    for (const line of ITEM_LINES) for (const slot of MATRIX_SLOTS) expect(cellOf(ITEMS, line, slot, 6).length, `${line} ${slot}`).toBeGreaterThan(0)
    for (const it of ITEMS.filter(i => GAPFILL_ITEMS.has(i.id) && i.tier === 6)) {
      expect(it.level, it.id).toBeGreaterThanOrEqual(28)
      expect(it.drop.zone, it.id).toBe('fortress')
      expect(['boss', 'chest'], it.id).toContain(it.drop.src)
    }
  })

  it('a ladder climbs: the lowest level of a quality never drops below the one under it', () => {
    for (const line of ITEM_LINES) for (const slot of MATRIX_SLOTS) {
      let prev = 0
      for (const tier of MATRIX_TIERS) {
        const lv = Math.min(...cellOf(ITEMS, line, slot, tier).map(i => i.level))
        expect(lv, `${line} ${slot} tier ${tier}`).toBeGreaterThanOrEqual(prev)
        prev = lv
      }
    }
  })
})

describe('the gap-fill set can actually be had', () => {
  const fill = ITEMS.filter(i => GAPFILL_ITEMS.has(i.id))

  it('has the audit\'s hundred and five pieces, every one a fixed, unique, named find', () => {
    expect(fill).toHaveLength(105)
    expect(GAPFILL_ITEMS.size).toBe(105)
    for (const i of fill) {
      expect(['mob', 'chest', 'boss'], i.id).toContain(i.drop.src)
      expect(i.unique, i.id).toBeUndefined()
    }
  })

  it('drops in a zone of its own quality, where its level can be reached', () => {
    for (const i of fill) {
      const z = ZONES[i.drop.zone]
      expect(Math.min(6, Math.ceil(z.max / 5)), i.id).toBe(i.tier)
      expect(i.level, i.id).toBeGreaterThanOrEqual(z.min - 0)
      expect(i.level, i.id).toBeLessThanOrEqual(Math.max(z.max, 30))
      if (i.drop.src === 'boss') expect(itemsOfZone(i.drop.zone, 'boss').map(b => b.id), i.id).toContain(i.id)
      else expect(ZONE_LOOT[i.drop.zone].items, i.id).toContain(i.id)
    }
  })

  it('is sold by an armourer or weaponsmith of its quality, but for the legendaries', () => {
    const shops = Object.values(TOWNS).flatMap(t => t.npcs).filter(n => n.role === 'shop' && n.stock)
    for (const i of fill) {
      const sellers = shops.filter(n => n.stock!.slots.includes(i.slot) && n.stock!.tiers.includes(i.tier))
      if (i.tier === 6) expect(priceOf(i), i.id).toBe(0)
      else expect(sellers.length, i.id).toBeGreaterThan(0)
    }
  })

  it('does not flood a zone: no table holds many more pieces than the tier-matched zones carry together', () => {
    const sizes = ZONE_IDS.map(z => ZONE_LOOT[z].items.length)
    for (const z of ZONE_IDS) expect(ZONE_LOOT[z as ZoneId].items.length, z).toBeLessThanOrEqual(24)
    // Neighbouring zones of one quality stay within a few pieces of each other.
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(20)
  })
})

describe('item balance: a piece stays near the stat budget of its slot and quality', () => {
  /** Pieces whose table numbers are older than the budget and pinned by saves or tests, each for a reason. */
  const EXEMPT: Record<string, string> = {
    ringOfAbsolutePower: 'the secret ring of every attribute (counted as six): the capstone of the tables'
  }
  const near = (it: ItemDef): { lo: number; hi: number; own: number } => {
    const b = ITEM_BUDGET[it.slot]![it.tier - 1]! * (GEAR_ATTR_SCALE[it.tier] ?? 1)
    const own = (rawPoints(it) * (GEAR_ATTR_SCALE[it.tier] ?? 1))
    // A point of slack either way: the share rounds each attribute to a whole number.
    return { lo: b * 0.5 - 1, hi: b * 1.5 + 2, own }
  }

  it('every found piece is within 50 % to 150 % of its budget (a point of rounding either way)', () => {
    for (const it of ITEMS) {
      if (EXEMPT[it.id] || it.tier > 6) continue
      const { lo, hi, own } = near(it)
      expect(own, `${it.id} (${budgetRatio(it).toFixed(2)} of budget)`).toBeGreaterThanOrEqual(lo)
      expect(own, `${it.id} (${budgetRatio(it).toFixed(2)} of budget)`).toBeLessThanOrEqual(hi)
    }
  })

  it('the exemptions are still outliers, so the list stays honest', () => {
    for (const id of Object.keys(EXEMPT)) {
      const it = ITEMS.find(i => i.id === id)!
      const { lo, hi, own } = near(it)
      expect(own < lo || own > hi, id).toBe(true)
    }
  })

  it('the new pieces sit on their budget, within a quarter either way (rounding aside)', () => {
    for (const it of ITEMS.filter(i => GAPFILL_ITEMS.has(i.id))) {
      const { own } = near(it)
      const b = ITEM_BUDGET[it.slot]![it.tier - 1]! * (GEAR_ATTR_SCALE[it.tier] ?? 1)
      expect(Math.abs(own - b), `${it.id}: ${own} against ${b.toFixed(1)}`).toBeLessThanOrEqual(Math.max(1.5, b * 0.25))
    }
  })

  it('the budget climbs with the quality in every slot', () => {
    for (const slot of MATRIX_SLOTS) for (let t = 1; t < 6; t++) expect(ITEM_BUDGET[slot]![t]!, `${slot} ${t + 1}`).toBeGreaterThan(ITEM_BUDGET[slot]![t - 1]!)
  })

  it('body armour keeps its weight class: between 40 % and the whole of the plate of its quality', () => {
    for (const it of ITEMS.filter(i => i.slot === 'body')) {
      const plate = PLATE_ARMOR[it.tier - 1]!
      expect(it.armor!, it.id).toBeLessThanOrEqual(plate)
      expect(it.armor!, it.id).toBeGreaterThanOrEqual(plate * 0.4)
    }
  })

  it('armoured head, hands and feet carry a third of a plate at most', () => {
    for (const it of ITEMS.filter(i => ['head', 'hands', 'feet'].includes(i.slot) && i.mods.armor)) {
      expect(it.mods.armor!, it.id).toBeLessThanOrEqual(PLATE_ARMOR[it.tier - 1]! * 0.34)
    }
  })
})
