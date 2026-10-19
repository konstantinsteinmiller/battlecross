import type { Attr } from './attributes'
import { GEAR_ATTR_SCALE, ITEM_BUDGET, type ItemDef, type ItemSlot } from './items'

/**
 * ─── The item matrix (items-gap-audit.md) ────────────────────────────────────
 *
 * Every attribute line (a build) laid over the seven slots and the six
 * qualities. A cell is one slot at one quality for one line; the audit counts
 * the pieces in it, and `tests/game/itemMatrix.test.ts` holds every cell above
 * zero, so a new line or a new quality cannot ship with a hole in it.
 */
export const ITEM_LINES: readonly Attr[] = ['str', 'dex', 'int', 'skl', 'cha', 'end']
export const MATRIX_SLOTS: readonly ItemSlot[] = ['main', 'off', 'head', 'body', 'hands', 'feet', 'trinket']
export const MATRIX_TIERS: readonly number[] = [1, 2, 3, 4, 5, 6]

/** A piece serves a line when that attribute is at least this share of the piece's top one. */
export const SERVE_SHARE = 0.5

const value = (it: ItemDef, a: Attr): number =>
  (it.mods[a] ?? 0) + (it.mods.strOrDex && (a === 'str' || a === 'dex') ? it.mods.strOrDex : 0)

/**
 * Does `it` serve `line`? A weapon serves the attribute its blow scales on;
 * a piece of the other slots, the attribute that is at least half of its top
 * one (heavy gear that leads with endurance and carries strength serves both
 * builds); a ring of every attribute serves all.
 */
export const servesLine = (it: ItemDef, line: Attr): boolean => {
  if (it.weapon) return it.weapon.scale === line
  if (it.mods.allAttrs) return true
  const top = Math.max(...ITEM_LINES.map(a => value(it, a)))
  return top > 0 && value(it, line) >= top * SERVE_SHARE
}

/** The pieces in one cell of the matrix. */
export const cellOf = (items: readonly ItemDef[], line: Attr, slot: ItemSlot, tier: number): ItemDef[] =>
  items.filter(i => i.slot === slot && i.tier === tier && servesLine(i, line))

const ATTR_KEYS: readonly Attr[] = ['str', 'dex', 'int', 'end', 'skl', 'cha']

/** A piece's attribute points as the tables state them (before the quality's share): `allAttrs` counts for six. */
export const rawPoints = (it: ItemDef): number =>
  (ATTR_KEYS.reduce((n, a) => n + (it.mods[a] ?? 0), 0) + (it.mods.allAttrs ?? 0) * 6 + (it.mods.strOrDex ?? 0)) / (GEAR_ATTR_SCALE[it.tier] ?? 1)

/** How far a piece is from its slot's budget at its quality: 1 is on it. */
export const budgetRatio = (it: ItemDef): number => rawPoints(it) / ITEM_BUDGET[it.slot]![it.tier - 1]!

/** The body armour a plate piece of each quality carries; cloth and leather wear a share of it. */
export const PLATE_ARMOR: readonly number[] = [14, 28, 55, 85, 140, 220]
