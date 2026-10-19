/**
 * What the HUD shows of a unit's statuses (#152): the icon and, for the ones
 * that stack, how many stacks there are. Stacks are gameplay (the Iron Monk's
 * chi feeds his finishers, Entropy's Accelerate cuts cooldowns, Venomous Blade
 * builds poison on a foe), so a stacking status is never pushed out of the
 * row by a plain buff.
 */
import type { Status, StatusId } from '@/game/sim/types'

export interface StatusChip { id: string; n: number }

/** Statuses whose count matters even at one stack. */
const COUNTED: ReadonlySet<StatusId> = new Set<StatusId>(['chi'])

/** Does this status show a stack count? */
export const showsCount = (s: StatusChip): boolean => s.n > 1 || COUNTED.has(s.id as StatusId)

/** The hero's status row: counted statuses first, then the rest in order. */
export const heroStatusView = (st: readonly Status[]): StatusChip[] => {
  const all = st.map(s => ({ id: s.id as string, n: s.n }))
  return [...all.filter(showsCount), ...all.filter(s => !showsCount(s))]
}

/** What stacks on the locked target (e.g. poison): only the counted ones. */
export const targetStackView = (st: readonly Status[] | undefined): StatusChip[] =>
  (st ?? []).map(s => ({ id: s.id as string, n: s.n })).filter(showsCount)

/** The Iron Monk's beads, and the skills that spend all of them (`heroSkills.ts` `spendChi`). */
export const CHI_BEADS = 5
export const CHI_SPENDERS: ReadonlySet<string> = new Set(['risingDragon', 'mountainPalm'])

/** Same chips, same counts? (So the HUD is only replaced on a change.) */
export const sameChips = (a: readonly StatusChip[], b: readonly StatusChip[]): boolean =>
  a.length === b.length && a.every((s, k) => s.id === b[k]!.id && s.n === b[k]!.n)
