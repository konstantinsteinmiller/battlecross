import type { Sim } from '../world'
import type { DamageType, Unit } from '../types'

/**
 * ─── What a scripted boss does with a blow that reaches it ──────────────────
 *
 * Most bosses take a blow on their one health bar (times their `guard`). A
 * few share it out first: the Hydra's heads each have a bar of their own, and
 * a fire blow sears a stump shut. A script registers here by its id; combat
 * asks before the blow comes off the body's health. Kept apart from the
 * scripts (no imports of combat), so combat may read it without a cycle.
 */

/** What of `amount` (already past armour and guard) the body itself takes. */
export type BossHurt = (sim: Sim, u: Unit, amount: number, type: DamageType) => number

export const BOSS_HURT: Record<string, BossHurt> = {}

/** The share of a blow the boss's body takes. */
export const bossHurt = (sim: Sim, u: Unit, amount: number, type: DamageType): number => {
  const h = u.boss ? BOSS_HURT[u.boss.script] : undefined
  return h ? h(sim, u, amount, type) : amount
}
