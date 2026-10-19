import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { ALL_ITEMS, ITEMS, SMITHED, sourcesOf, itemName } from '../../wiki/src/data'
import { CHA_SET, DEX_SET, FILL_SET, RECIPE_OF_ITEM, forgeSummary, metalName, oresInZone, zonesOfOre, SMITHS } from '../../wiki/src/smithing'
import { RECIPES } from '@/game/data/smithing'
import { ORE_IDS, LATE_ORE_LEVEL } from '@/game/data/ores'
import { ZONES, ZONE_IDS } from '@/game/data/zones'

/** The wiki's item and smithing pages quote the game's data, never a copy of it. */
describe('wiki items and smithing', () => {
  it('lists the whole catalogue: found items plus every forged piece', () => {
    expect(ALL_ITEMS).toHaveLength(ITEMS.length + SMITHED.length)
    expect(SMITHED).toHaveLength(6 * 6 * 6 * 2)
    expect(RECIPES).toHaveLength(6 * 6 * 6)
  })
  it('knows the recipe behind every forged piece, with its cost in the source line', () => {
    for (const it of SMITHED) {
      const r = RECIPE_OF_ITEM[it.id]
      expect(r, it.id).toBeTruthy()
      const src = sourcesOf(it)[0]!
      expect(src.kind).toBe('smith')
      expect(src.text).toContain(`${r!.recipe.nuggets} ${metalName(r!.recipe.metal)} nuggets + ${r!.recipe.gold} gold`)
    }
  })
  it('shows the new Dexterity and Charisma sets, each with a place to find it', () => {
    expect(DEX_SET.length).toBeGreaterThanOrEqual(30)
    expect(CHA_SET.length).toBeGreaterThanOrEqual(12)
    for (const it of [...DEX_SET, ...CHA_SET]) {
      expect(itemName(it), it.id).not.toBe(it.id)
      expect(sourcesOf(it).length, it.id).toBeGreaterThan(0)
    }
  })
  it('shows the gap-fill set too: 105 pieces, five lines, each with a place to find it', () => {
    expect(FILL_SET).toHaveLength(105)
    for (const it of FILL_SET) {
      expect(itemName(it), it.id).not.toBe(it.id)
      expect(sourcesOf(it).length, it.id).toBeGreaterThan(0)
    }
    expect(ALL_ITEMS).toHaveLength(ITEMS.length + SMITHED.length)
    expect(ITEMS).toHaveLength(210)
  })
  it('states the forge summary from the data', () => {
    const s = forgeSummary(z => z)
    expect(s).toContain(`${RECIPES.length} recipes`)
    for (const m of ORE_IDS) expect(s).toContain(metalName(m))
    expect(SMITHS.length).toBeGreaterThan(0)
  })
  it('late zones carry no iron or silver', () => {
    for (const z of ZONE_IDS.filter(x => ZONES[x].min >= LATE_ORE_LEVEL)) {
      const ids = oresInZone(z).map(o => o.id)
      expect(ids, z).not.toContain('iron')
      expect(ids, z).not.toContain('silver')
    }
    expect(zonesOfOre('aetherite').length).toBeGreaterThan(0)
    expect(zonesOfOre('adamant').length).toBeGreaterThan(0)
  })
  it('keeps old claims out of the wiki prose', () => {
    const dir = join(__dirname, '../../wiki/src/views')
    const stale = [/up to \+5/, /48 metal/, /Six legendary/, /only epic/i, /max \+10/i, /only strength/i, /iron, silver, gold, mithril, each/]
    for (const f of readdirSync(dir).filter(x => x.endsWith('.vue'))) {
      const text = readFileSync(join(dir, f), 'utf8')
      for (const re of stale) expect(text, `${f} ${re}`).not.toMatch(re)
    }
  })
})
