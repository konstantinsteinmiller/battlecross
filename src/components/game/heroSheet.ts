import { EQUIP_SLOTS, ITEM_BY_ID, slotOf, type EquipSlot, type ItemDef, type ItemSlot } from '@/game/data/items'
import type { AttrBlock } from '@/game/data/attributes'
import { heroStats } from '@/game/sim/stats'
import type { UnitStats } from '@/game/sim/types'
import { heroBuild, profile } from '@/game/state/profile'
import { fmt } from '@/utils/format'

/**
 * ─── The hero's numbers, and what a change would make of them ────────────────
 *
 * One list of the derived stats the screens show (the character page shows
 * all of them, the equipment page the key ones), and the "what if" behind
 * every preview: this piece worn instead of that, one more point of Strength.
 * It only ASKS the rules (`heroStats`, the same function the fight uses); it
 * never changes the hero.
 */

export type StatKey =
  | 'damage' | 'health' | 'mana' | 'armor' | 'resist' | 'crit' | 'critDamage' | 'attackSpeed' | 'moveSpeed' | 'cdr'
  | 'block' | 'dodge' | 'hpRegen'

type Kind = 'int' | 'pct' | 'dec'
interface StatDef { key: StatKey; kind: Kind; get: (s: UnitStats) => number }

/** Every stat of the sheet, in the order it is listed (`stat.<key>` in i18n). */
export const STATS: readonly StatDef[] = [
  { key: 'damage', kind: 'int', get: s => s.baseDmg * s.damageMul },
  { key: 'health', kind: 'int', get: s => s.maxHp },
  { key: 'mana', kind: 'int', get: s => s.maxMana },
  { key: 'armor', kind: 'int', get: s => s.armor },
  { key: 'resist', kind: 'pct', get: s => s.resist },
  { key: 'crit', kind: 'pct', get: s => s.critChance },
  { key: 'critDamage', kind: 'pct', get: s => s.critMult },
  { key: 'attackSpeed', kind: 'pct', get: s => s.attackSpeed },
  { key: 'moveSpeed', kind: 'dec', get: s => s.moveSpeed },
  { key: 'cdr', kind: 'pct', get: s => s.cdr },
  { key: 'block', kind: 'pct', get: s => s.block },
  { key: 'dodge', kind: 'pct', get: s => s.dodge },
  { key: 'hpRegen', kind: 'dec', get: s => s.hpRegen }
]

/** The six shown beside the paper-doll, where there is room for six. */
export const KEY_STATS: readonly StatKey[] = ['damage', 'armor', 'health', 'mana', 'crit', 'moveSpeed']

/** A stat's value in the units it is shown in (whole, percent points, one decimal). */
const unit = (kind: Kind, v: number): number => (kind === 'int' ? Math.round(v) : kind === 'pct' ? Math.round(v * 100) : Math.round(v * 10) / 10)
const text = (kind: Kind, n: number): string => (kind === 'int' ? fmt(n) : kind === 'pct' ? `${n}%` : n.toFixed(1))

export interface StatRow {
  key: StatKey
  /** As it stands. */
  text: string
  /** As it would be (the same as `text` when nothing would change). */
  next: string
  /** The change, in the shown units: positive is better. */
  delta: number
  /** `+12`, `−3%`, or '' when nothing would change. */
  deltaText: string
}

/** The sheet's rows; with `next`, each carries what the change would do to it. */
export const statRows = (now: UnitStats, next: UnitStats = now, keys?: readonly StatKey[]): StatRow[] =>
  STATS.filter(d => !keys || keys.includes(d.key)).map((d) => {
    const a = unit(d.kind, d.get(now))
    const b = unit(d.kind, d.get(next))
    const delta = Math.round((b - a) * 10) / 10
    const abs = text(d.kind, Math.abs(delta))
    return { key: d.key, text: text(d.kind, a), next: text(d.kind, b), delta, deltaText: delta > 0 ? `+${abs}` : delta < 0 ? `−${abs}` : '' }
  })

// ─── What if: gear ───────────────────────────────────────────────────────────

/** The slot `equipItem` would put this item in: its own; for a trinket the
 *  one it is already in, else the free one, else the first. */
export const slotFor = (id: string): EquipSlot | null => {
  const it = ITEM_BY_ID[id]
  if (!it) return null
  const fits = EQUIP_SLOTS.filter(s => slotOf(s) === it.slot)
  const eq = profile.inv.equipped
  return fits.find(s => eq[s] === id) ?? fits.find(s => !eq[s]) ?? fits[0] ?? null
}

/** The worn piece an item is measured against: what is in the slot it would
 *  take (null: that slot is empty, or the item is the one worn there). */
export const wornAgainst = (id: string): string | null => {
  const slot = slotFor(id)
  const worn = slot ? profile.inv.equipped[slot] : null
  return worn && worn !== id ? worn : null
}

/** The hero's stats with `id` in `slot` (null: the slot emptied). */
export const statsWith = (slot: EquipSlot, id: string | null): UnitStats => {
  const equipped = { ...profile.inv.equipped }
  if (id) {
    // One ring is not worn twice: moving it leaves what was there in its place.
    for (const s of EQUIP_SLOTS) if (s !== slot && equipped[s] === id) equipped[s] = equipped[slot]
  }
  equipped[slot] = id
  return heroStats({ ...heroBuild(), equipped })
}

/** The hero's stats with these attribute points instead of his own. */
export const statsWithAttrs = (attrs: AttrBlock): UnitStats => heroStats(heroBuild(attrs))

// ─── The bag's order ─────────────────────────────────────────────────────────

/** Gear in body order: what is held, then head to foot, then the trinkets. */
export const SLOT_ORDER: readonly ItemSlot[] = ['main', 'off', 'head', 'body', 'hands', 'feet', 'trinket']

/** By kind of gear, the best first within a kind. */
export const bySlot = (a: ItemDef, b: ItemDef): number =>
  SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot) || b.tier - a.tier || b.level - a.level
