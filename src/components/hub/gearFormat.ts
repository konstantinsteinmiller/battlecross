import type { GameIconName } from '@/components/icons/iconNames'
import type { Affix, AffixId } from '@/game/data/items'
import type { StatKey } from '@/game/data/itemCompare'

export const SLOT_ICON: Record<string, GameIconName> = {
  buster: 'buster', helmet: 'helmet', chest: 'armor', boots: 'boots', chip: 'chip', chip1: 'chip', chip2: 'chip'
}

const PERCENT: AffixId[] = ['crit', 'critDmg', 'bolts', 'chargeSpeed', 'pelletDmg', 'chargeDmg', 'moveSpeed', 'special', 'regen', 'magnet']

/** "+12 max health", "+4.5% critical chance" — number formatted here, text
 *  translated (`affix.<id>` takes the signed value as `{v}`). */
export const formatAffix = (t: (k: string, p?: Record<string, unknown>) => string, a: Affix): string => {
  const pct = PERCENT.includes(a.id)
  const v = pct ? `${Math.round(a.v * 1000) / 10}%` : `${Math.round(a.v)}`
  return t(`affix.${a.id}`, { v: `+${v}` })
}

/** A stat CHANGE, signed: "+3 armor", "−2% critical chance". The main stats
 *  read as their affix twins (`affix.armor`, `affix.damage`). */
export const formatStatDelta = (t: (k: string, p?: Record<string, unknown>) => string, key: StatKey, delta: number): string => {
  const pct = PERCENT.includes(key as AffixId)
  const m = Math.abs(delta)
  const v = pct ? `${Math.round(m * 1000) / 10}%` : `${Math.round(m)}`
  return t(`affix.${key}`, { v: `${delta > 0 ? '+' : '−'}${v}` })
}
