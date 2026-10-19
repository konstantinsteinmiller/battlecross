/**
 * Smithing for the wiki, read from the game's own data (items, ores, forge,
 * smithing, zones). Nothing here restates a number: the Items, Traders and
 * Smithing pages quote these, and tests/wiki/items.test.ts keeps it so.
 */
import { SMITH_LINES, SMITH_METAL, SMITH_PIECES, CHARISMA_ITEMS, DEXTERITY_ITEMS, GAPFILL_ITEMS, ITEMS, type SmithLine, type SmithMetal, type SmithPiece, type ItemDef } from '@/game/data/items'
import { RECIPES, STRIKES, SWEEP, spotHalf, gradeMakes, GRADES, type Recipe, type Grade } from '@/game/data/smithing'
import { ORE_IDS, ORE_LEVEL, ORE_PRICE, ORE_CAP, ORE_NODES_MAX, LATE_ORE_LEVEL, LATE_ORE_NODES_MIN, oresAt, type OreId } from '@/game/data/ores'
import { FORGE_FIRST, FORGE_STEP, FORGE_STEP_LATE, FORGE_KNEE, FORGE_GAIN, LEGEND_WORTH, forgeCost, forgeTotal } from '@/game/data/forge'
import { ZONES, ZONE_IDS, TOWNS, type TownId } from '@/game/data/zones'

export { RECIPES, SMITH_LINES, SMITH_METAL, SMITH_PIECES, ORE_IDS, ORE_LEVEL, ORE_PRICE, ORE_CAP, ORE_NODES_MAX, LATE_ORE_LEVEL, LATE_ORE_NODES_MIN, STRIKES, SWEEP, GRADES,
  FORGE_FIRST, FORGE_STEP, FORGE_STEP_LATE, FORGE_KNEE, FORGE_GAIN, LEGEND_WORTH, forgeCost, forgeTotal, spotHalf, gradeMakes, CHARISMA_ITEMS, DEXTERITY_ITEMS }
export type { SmithLine, SmithMetal, SmithPiece, OreId, Recipe, Grade }

export const metalName = (m: string): string => m[0]!.toUpperCase() + m.slice(1)
export const PIECE_NAME: Record<SmithPiece, string> = { sword: 'Sword', hammer: 'Hammer', shield: 'Shield', helm: 'Helm', plate: 'Plate', greaves: 'Greaves' }
/** What each build's piece really is (the forge names it after the strength line). */
export const LINE_NAME: Record<SmithLine, string> = { str: 'Strength', dex: 'Dexterity', int: 'Intelligence', skl: 'Skill', cha: 'Charisma', end: 'Endurance' }

/** Every recipe by the item it makes (the plain piece or its masterwork twin). */
export const RECIPE_OF_ITEM: Record<string, { recipe: Recipe; master: boolean }> = {}
for (const r of RECIPES) {
  RECIPE_OF_ITEM[r.item] = { recipe: r, master: false }
  RECIPE_OF_ITEM[r.master] = { recipe: r, master: true }
}

/** The recipe table of one build, one metal. */
export const recipesOf = (line: SmithLine, metal: SmithMetal): Recipe[] => RECIPES.filter(r => r.line === line && r.metal === metal)

/** The ores a zone can hold anywhere in its level band, with the weights at the band's two ends merged. */
export const oresInZone = (z: (typeof ZONE_IDS)[number]): Array<{ id: OreId; weight: number }> => {
  const out = new Map<OreId, number>()
  for (let lv = ZONES[z].min; lv <= ZONES[z].max; lv++) for (const o of oresAt(lv)) out.set(o.id, Math.max(out.get(o.id) ?? 0, o.weight))
  return [...out].map(([id, weight]) => ({ id, weight }))
}
/** The zones that hold an ore. */
export const zonesOfOre = (o: OreId): string[] => ZONE_IDS.filter(z => oresInZone(z).some(x => x.id === o))

/** Every smith who teaches the forge and buys ore (the town smiths with a shop). */
export const SMITHS: Array<{ npc: string; town: TownId }> = []
for (const town of Object.keys(TOWNS) as TownId[]) {
  for (const n of TOWNS[town].npcs) if (n.job === 'smith' && n.role === 'shop') SMITHS.push({ npc: n.id, town })
}

/** The found sets: items of one attribute build added to the normal catalogue. */
export const DEX_SET: ItemDef[] = ITEMS.filter(i => DEXTERITY_ITEMS.has(i.id))
export const CHA_SET: ItemDef[] = ITEMS.filter(i => CHARISMA_ITEMS.has(i.id))
/** The gap-fill set (items-gap-audit.md): a piece for every empty cell of the line x slot x quality matrix. */
export const FILL_SET: ItemDef[] = ITEMS.filter(i => GAPFILL_ITEMS.has(i.id))

/** The sentence the Traders page and the Items lead share about the forge. */
export const forgeSummary = (nameOf: (id: string) => string): string => {
  const pieces = RECIPES.length
  return `Every town smith (${[...new Set(SMITHS.map(s => nameOf(s.town)))].join(', ')}) buys ore at a flat price, teaches smithing once, and forges ${pieces} recipes: `
    + `${SMITH_PIECES.length} pieces for each of ${SMITH_LINES.length} builds (${SMITH_LINES.map(l => LINE_NAME[l]).join(', ')}) in each of ${ORE_IDS.length} metals (${ORE_IDS.map(metalName).join(', ')}), `
    + 'each with a masterwork twin. Fixed stats, nothing rolls.'
}
