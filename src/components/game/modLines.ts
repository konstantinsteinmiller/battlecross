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
