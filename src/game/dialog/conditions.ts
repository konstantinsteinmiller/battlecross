import { ATTRS, type AttrBlock } from '../data/attributes'
import { FACTIONS } from '../data/quests'
import type { BlockDef, Cond, DialogWorld, LineDef, LockReason } from './types'

/** A memory key as written in a condition: a bare topic is this conversation's. */
export const memoryKey = (conv: string, key: string): string => (key.includes('.') ? key : `${conv}.${key}`)

/** Does the condition hold in this world? `conv` resolves bare memory keys. */
export const meets = (c: Cond | undefined, w: DialogWorld, conv: string): boolean => {
  if (!c) return true
  if (c.flags && !c.flags.every(f => w.flags.has(f))) return false
  if (c.not && c.not.some(f => w.flags.has(f))) return false
  if (c.quest) {
    for (const q in c.quest) {
      const want = c.quest[q]
      const done = w.quests[q]
      if (want === true ? !done : want === false ? !!done : done !== want) return false
    }
  }
  if (c.rep) for (const f of FACTIONS) if (c.rep[f] !== undefined && w.rep[f] < c.rep[f]!) return false
  if (c.repMax) for (const f of FACTIONS) if (c.repMax[f] !== undefined && w.rep[f] > c.repMax[f]!) return false
  if (c.level !== undefined && w.level < c.level) return false
  if (c.attrs) for (const a of ATTRS) if (c.attrs[a] !== undefined && w.attrs[a] < c.attrs[a]!) return false
  if (c.gold !== undefined && w.gold < c.gold) return false
  if (c.cleared && !c.cleared.every(n => w.cleared.has(n))) return false
  if (c.uncleared && c.uncleared.some(n => w.cleared.has(n))) return false
  if (c.said && !c.said.every(k => w.said.has(memoryKey(conv, k)))) return false
  if (c.unsaid && c.unsaid.some(k => w.said.has(memoryKey(conv, k)))) return false
  if (c.met !== undefined && w.said.has(conv) !== c.met) return false
  if (c.any && !c.any.some(x => meets(x, w, conv))) return false
  return true
}

/**
 * What a locked choice is missing, in the order the list shows it. Only what
 * the hero can work on is named (level, attributes, standing, gold); anything
 * else is `other`.
 */
export const lockReasons = (c: Cond | undefined, w: DialogWorld, conv: string): LockReason[] => {
  if (!c || meets(c, w, conv)) return []
  const out: LockReason[] = []
  if (c.level !== undefined && w.level < c.level) out.push({ kind: 'level', n: c.level })
  if (c.attrs) for (const a of ATTRS) if (c.attrs[a] !== undefined && w.attrs[a] < c.attrs[a]!) out.push({ kind: 'attr', attr: a as keyof AttrBlock, n: c.attrs[a]! })
  if (c.rep) for (const f of FACTIONS) if (c.rep[f] !== undefined && w.rep[f] < c.rep[f]!) out.push({ kind: 'rep', faction: f, n: c.rep[f]! })
  if (c.gold !== undefined && w.gold < c.gold) out.push({ kind: 'gold', n: c.gold })
  if (!out.length) out.push({ kind: 'other' })
  return out
}

/** Of several alternatives, the first whose condition holds. */
export const findBlock = (blocks: readonly BlockDef[] | undefined, w: DialogWorld, conv: string): BlockDef | undefined =>
  blocks?.find(x => meets(x.when, w, conv))

/** The lines to speak: the block that applies, with its own conditional lines
 *  filtered. Empty when none does. */
export const pickBlock = (blocks: readonly BlockDef[] | undefined, w: DialogWorld, conv: string): LineDef[] => {
  const b = findBlock(blocks, w, conv)
  return b ? b.lines.filter(l => meets(l.when, w, conv)) : []
}
