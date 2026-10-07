import type { ErrandDef, ErrandStep } from './data/errands'

/**
 * ─── The errand rules (D101) — pure ──────────────────────────────────────────
 *
 * An errand in progress is `{ step, have, done }`: the step it is on and what
 * that step has counted so far. Counted steps (slay, clear, visit) move at the
 * end of a visit; live steps (gather, bring, pieces, dig) are true or not of the
 * world as it is; `talk` moves when the person is spoken to.
 */

export type ErrandState = 'none' | 'active' | 'ready' | 'done'

export interface ErrandSave {
  step: number
  have: number
  done: boolean
}

/** What the live steps look at. */
export interface ErrandWorld {
  herbs(plant: string): number
  owns(item: string): boolean
  pieces(): number
  flags: ReadonlySet<string>
}

/** What one visit did, as the errands read it. */
export interface ErrandDeeds {
  /** The node visited ('' for a road fight). */
  node: string
  won: boolean
  kills: Readonly<Record<string, number>>
}

const LIVE = new Set(['gather', 'bring', 'pieces', 'dig'])

/** How far a step is (0..n). */
export const stepHave = (s: ErrandStep, save: ErrandSave, w: ErrandWorld): number => {
  switch (s.kind) {
    case 'gather': return Math.min(s.n, w.herbs(s.plant ?? ''))
    case 'bring': return s.item && w.owns(s.item) ? s.n : 0
    case 'pieces': return Math.min(s.n, w.pieces())
    case 'dig': return w.flags.has(`dug:${s.place ?? ''}`) ? s.n : 0
    default: return Math.min(s.n, save.have)
  }
}

/** Where an errand stands. */
export const errandState = (def: ErrandDef, save: ErrandSave | undefined, w: ErrandWorld): ErrandState => {
  if (!save) return 'none'
  if (save.done) return 'done'
  if (save.step >= def.steps.length) return 'ready'
  const last = save.step === def.steps.length - 1
  const s = def.steps[save.step]!
  return last && stepHave(s, save, w) >= s.n ? 'ready' : 'active'
}

/** Move past every step the world already satisfies (not the last one: that
 *  is handed in), live steps included. */
export const settle = (def: ErrandDef, save: ErrandSave, w: ErrandWorld): void => {
  while (!save.done && save.step < def.steps.length - 1) {
    const s = def.steps[save.step]!
    if (stepHave(s, save, w) < s.n) break
    save.step++
    save.have = 0
  }
}

/** Count a visit into an errand's current (counted) step; then settle. */
export const countVisit = (def: ErrandDef, save: ErrandSave, d: ErrandDeeds, w: ErrandWorld): boolean => {
  if (save.done || save.step >= def.steps.length) return false
  const s = def.steps[save.step]!
  if (LIVE.has(s.kind) || s.kind === 'talk') { const before = save.step; settle(def, save, w); return save.step !== before }
  let add = 0
  const here = !s.place || s.place === d.node
  if (s.kind === 'slay' && here) add = s.enemy ? d.kills[s.enemy] ?? 0 : Object.values(d.kills).reduce((a, b) => a + b, 0)
  else if (s.kind === 'clear' && here && d.won && d.node) add = 1
  else if (s.kind === 'visit' && d.node && s.place === d.node) add = 1
  if (add <= 0) return false
  save.have = Math.min(s.n, save.have + add)
  settle(def, save, w)
  return true
}

/** The person spoken to: a `talk` step to them is done. */
export const countTalk = (def: ErrandDef, save: ErrandSave, npc: string, w: ErrandWorld): boolean => {
  if (save.done || save.step >= def.steps.length) return false
  const s = def.steps[save.step]!
  if (s.kind !== 'talk' || s.npc !== npc) return false
  save.have = s.n
  settle(def, save, w)
  return true
}

/** What handing in gives away: herbs or an item (the last step's). */
export const handInCost = (def: ErrandDef): { herbs: Record<string, number>; item: string } => {
  const s = def.steps[def.steps.length - 1]
  if (s?.kind === 'gather' && s.plant) return { herbs: { [s.plant]: s.n }, item: '' }
  if (s?.kind === 'bring' && s.item) return { herbs: {}, item: s.item }
  return { herbs: {}, item: '' }
}
