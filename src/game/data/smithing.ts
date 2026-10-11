import { ITEM_BY_ID, SMITH_METAL, SMITH_PIECES, sellValue, smithItemId, type SmithMetal, type SmithPiece } from './items'
import { ORE_IDS } from './ores'

/**
 * ─── Smithing (roadmap #99, D121–D123) ──────────────────────────────────────
 *
 * A town smith teaches it once; the first nugget of a metal makes its six
 * pieces known. A piece takes nuggets and gold (never less gold than the
 * masterwork sells for: no forging for profit), and three hammer strikes on
 * the hot iron decide what comes off the anvil:
 *
 *   poor     the plain piece
 *   good     the plain piece, one forge level up
 *   great    the masterwork twin (a quality higher), one level up
 *   perfect  the masterwork twin, three levels up
 *
 * A hand long past the metal (eight levels above the piece) strikes a grade
 * better. Forging a piece already owned works it up instead (its levels, at
 * least one, up to the forge's top).
 */

export type Grade = 'poor' | 'good' | 'great' | 'perfect'
export const GRADES: readonly Grade[] = ['poor', 'good', 'great', 'perfect']

export interface Recipe {
  id: string
  metal: SmithMetal
  piece: SmithPiece
  nuggets: number
  gold: number
  /** The plain piece and its masterwork twin. */
  item: string
  master: string
  level: number
}

const NUGGETS: Readonly<Record<SmithPiece, number>> = { sword: 3, hammer: 4, shield: 3, helm: 2, plate: 5, greaves: 2 }

export const RECIPES: readonly Recipe[] = ORE_IDS.flatMap(metal => SMITH_PIECES.map(piece => {
  const master = smithItemId(metal, piece, true)
  return {
    id: `${metal}:${piece}`, metal, piece, nuggets: NUGGETS[piece],
    // A bigger piece costs more; never so little that forging pays.
    gold: Math.round(sellValue(ITEM_BY_ID[master]!) * (0.8 + 0.1 * NUGGETS[piece])),
    item: smithItemId(metal, piece, false), master, level: SMITH_METAL[metal].level
  }
}))
export const RECIPE_BY_ID: Readonly<Record<string, Recipe>> = Object.fromEntries(RECIPES.map(r => [r.id, r]))

// ─── The forge's mini-game (D123) ───────────────────────────────────────────

/** Strikes a piece takes. */
export const STRIKES = 3
/** How fast the glow sweeps the bar (lengths a second), by metal: the rarer the quicker. */
export const SWEEP: Readonly<Record<SmithMetal, number>> = { iron: 0.7, silver: 0.85, gold: 1.0, mithril: 1.15 }
/** The hot spot's half width (a share of the bar), by metal: the rarer the narrower. */
const SPOT: Readonly<Record<SmithMetal, number>> = { iron: 0.12, silver: 0.1, gold: 0.085, mithril: 0.07 }

/** The hot spot's half width for a smith of this Dexterity: a steady hand widens it (up to half again). */
export const spotHalf = (metal: SmithMetal, dex: number): number => SPOT[metal] * (1 + Math.min(0.5, Math.max(0, dex) / 120))

/** One strike's worth: 1 dead on the spot's centre, 0 at twice its half width off. */
export const strikeScore = (off: number, half: number): number => Math.max(0, Math.min(1, 1 - Math.max(0, Math.abs(off) - half * 0.35) / (half * 1.65)))

/** Three strikes' worth (0..3) as a grade; a hand long past the metal one better. */
export const gradeOf = (total: number, heroLevel: number, recipeLevel: number): Grade => {
  let g = total >= 2.6 ? 3 : total >= 1.9 ? 2 : total >= 1.0 ? 1 : 0
  if (heroLevel >= recipeLevel + 8) g = Math.min(3, g + 1)
  return GRADES[g]!
}

/** What a grade makes: which twin, and how many forge levels on it. */
export const gradeMakes = (r: Recipe, g: Grade): { id: string; levels: number } =>
  g === 'poor' ? { id: r.item, levels: 0 }
    : g === 'good' ? { id: r.item, levels: 1 }
      : g === 'great' ? { id: r.master, levels: 1 }
        : { id: r.master, levels: 3 }
