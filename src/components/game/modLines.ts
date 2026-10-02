import { ATTRS } from '@/game/data/attributes'
import type { ModId, Mods } from '@/game/data/mods'

/**
 * A modifier bag as lines for a tooltip: `mod.<id>` in i18n, with `{n}`.
 * Fractions are shown as whole percents; the rest are flat numbers. The six
 * attributes come first; then everything else as tabled.
 */
const FLAT: ReadonlySet<string> = new Set<string>([
  ...ATTRS, 'allAttrs', 'strOrDex', 'armor', 'maxHp', 'maxMana', 'hpRegen', 'burnOnHit', 'pierce', 'critCooldown',
  'extraBlastEvery', 'fatalSave', 'knockbackImmune', 'pyromaniac'
])

export interface ModLine {
  id: ModId
  key: string
  n: number
  /** One of the six attributes (drawn in the attribute's colour). */
  attr: boolean
}

const round1 = (v: number): number => Math.round(v * 10) / 10
const isAttr = (id: string): boolean => (ATTRS as readonly string[]).includes(id)

export const modLines = (mods: Mods | undefined): ModLine[] => {
  if (!mods) return []
  const out: ModLine[] = []
  const ids = Object.keys(mods) as ModId[]
  ids.sort((a, b) => Number(isAttr(b)) - Number(isAttr(a)))
  for (const id of ids) {
    const v = mods[id] ?? 0
    if (!v) continue
    out.push({ id, key: `mod.${id}`, n: FLAT.has(id) ? round1(v) : Math.round(v * 100), attr: isAttr(id) })
  }
  return out
}

export interface ModCompare extends ModLine {
  /** This item's number minus the worn one's, in the line's own units
   *  (0: the same; the line is then shown without a mark). */
  delta: number
  /** Only the WORN item has this line: wearing the new one loses it. */
  gone: boolean
}

const shown = (id: ModId, v: number): number => (FLAT.has(id) ? round1(v) : Math.round(v * 100))

/**
 * An item's lines set against the piece worn in its slot: every line of the
 * new item with how it differs, then the lines only the worn one has (`gone`,
 * with the worn number). Every modifier in the game is "more is better", so a
 * positive delta is a gain.
 */
export const compareMods = (mods: Mods | undefined, worn: Mods | undefined): ModCompare[] => {
  const out: ModCompare[] = modLines(mods).map((l) => {
    const base = shown(l.id, worn?.[l.id] ?? 0)
    return { ...l, delta: round1(l.n - base), gone: false }
  })
  for (const l of modLines(worn)) {
    if (mods?.[l.id]) continue
    out.push({ ...l, delta: -l.n, gone: true })
  }
  return out
}

/** A signed number for a comparison: `+3`, `−2.5`. */
export const signed = (n: number): string => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')
