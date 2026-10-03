import { FACTIONS, REP_MAX, type FactionId } from './data/quests'
import { ZONES } from './data/zones'
import { ITEMS, type ItemDef, type ItemSlot, type ZoneId } from './data/items'
import { hashSeed, mulberry32, pick, randInt } from './sim/rng'

/**
 * ─── Faction contracts (roadmap #15, D66–D68) ───────────────────────────────
 *
 * Every day each of the three factions posts one short contract on the board
 * every town keeps. It counts by itself as the hero plays (the run's tally at
 * the end of each visit) and is handed in at any town's board for gold and a
 * point of the faction's standing. Standing runs −5…5; at +3 the faction
 * sends a gift once, at +5 it gives a lasting blessing while the hero keeps it.
 */

export type ContractKind = 'slay' | 'clear' | 'chests'

export interface Contract {
  faction: FactionId
  kind: ContractKind
  /** Where: the zone to hunt in or to clear ('' for chests: anywhere). */
  zone: ZoneId | ''
  /** What to defeat (\`slay\` only). */
  enemy: string
  /** How many (kills, wins or chests). */
  n: number
  /** Counted so far. */
  have: number
  /** Handed in. */
  done: boolean
}

/** Gold a contract pays at the hero's level. */
export const contractGold = (level: number): number => 40 + level * 12
/** Standing a contract earns. */
export const CONTRACT_REP = 1
/** The standing that brings the faction's gift, and its gold. */
export const REP_GIFT = 3
export const GIFT_GOLD = 300
/** The standing that brings the blessing (held while the standing stays). */
export const REP_BLESSING = REP_MAX

/** What each faction leans to, and the gear its gift is cut from. */
const LEAN: Record<FactionId, { kinds: ReadonlyArray<readonly [ContractKind, number]>; gift: readonly ItemSlot[] }> = {
  order: { kinds: [['slay', 3], ['clear', 2], ['chests', 1]], gift: ['body', 'off', 'head'] },
  syndicate: { kinds: [['chests', 3], ['slay', 2], ['clear', 1]], gift: ['main', 'trinket', 'hands'] },
  circle: { kinds: [['slay', 2], ['clear', 2], ['chests', 2]], gift: ['trinket', 'main', 'feet'] }
}

const weightedPick = <T>(rng: () => number, items: ReadonlyArray<readonly [T, number]>): T => {
  let total = 0
  for (const [, w] of items) total += w
  let r = rng() * total
  for (const [it, w] of items) { r -= w; if (r <= 0) return it }
  return items[items.length - 1]![0]
}

/**
 * The day's three contracts. \`zones\`: the zones the hero can reach (open on
 * the map), the hardest last; a contract is set in one of the latest few, so
 * it asks for a place worth going to.
 */
export const postContracts = (day: string, zones: readonly ZoneId[]): Contract[] => {
  const recent = zones.slice(-3)
  return FACTIONS.map((faction) => {
    const rng = mulberry32(hashSeed(`contract:${day}:${faction}`))
    let kind = weightedPick(rng, LEAN[faction].kinds)
    if (!recent.length && kind !== 'chests') kind = 'chests'
    const zone = kind === 'chests' ? '' : pick(rng, recent)
    if (kind === 'slay' && zone) {
      const kinds = ZONES[zone].kinds.map(k => k.kind)
      return { faction, kind, zone, enemy: pick(rng, kinds), n: randInt(rng, 8, 14), have: 0, done: false }
    }
    if (kind === 'clear' && zone) return { faction, kind, zone, enemy: '', n: 1, have: 0, done: false }
    return { faction, kind: 'chests', zone: '', enemy: '', n: randInt(rng, 2, 4), have: 0, done: false }
  })
}

/** What one visit did, as the contracts read it. */
export interface VisitDeeds {
  zone: ZoneId | ''
  won: boolean
  kills: Readonly<Record<string, number>>
  chests: number
}

/** Count a visit into the open contracts (returns those it moved). */
export const countDeeds = (list: Contract[], d: VisitDeeds): Contract[] => {
  const moved: Contract[] = []
  for (const c of list) {
    if (c.done || c.have >= c.n) continue
    let add = 0
    if (c.kind === 'slay' && c.zone === d.zone) add = d.kills[c.enemy] ?? 0
    else if (c.kind === 'clear' && c.zone === d.zone && d.won) add = 1
    else if (c.kind === 'chests') add = d.chests
    if (add > 0) { c.have = Math.min(c.n, c.have + add); moved.push(c) }
  }
  return moved
}

/** The faction's gift: a piece the hero does not own, of its gear, at the tier
 *  the hero's merchants sell; null when every such piece is owned. */
export const giftItem = (f: FactionId, tier: number, owned: ReadonlySet<string>): ItemDef | null => {
  const slots = LEAN[f].gift
  const ok = (i: ItemDef): boolean => i.tier === tier && !owned.has(i.id)
  for (const s of slots) {
    const it = ITEMS.find(i => i.slot === s && ok(i))
    if (it) return it
  }
  return ITEMS.find(ok) ?? null
}

/** The blessings: what +5 standing gives while it is held. */
export const BLESSING = {
  /** The Iron Order: more health. */
  order: { maxHpPct: 0.05 },
  /** The Ashen Syndicate: more gold from every kill. */
  syndicate: { goldPct: 0.1 },
  /** The Circle of Aether: faster mana. */
  circle: { manaRegenPct: 0.1 }
} as const
