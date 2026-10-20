import { SIEGE_DUE } from '../data/breaking'
import { ITEM_BY_ID } from '../data/items'
import {
  FIFTH_PASSIVE_FLAG, SIEGE_TIERS, bellRings, marksBanked, milestonesReached, siegeReward, tierOpen,
  type SiegeMilestone, type SiegeReward, type SiegeTier
} from '../data/siege'
import { prizeOf } from '../gamble'
import { addOres, claimAfterplayDues, flagSet, gainItem, hasFlag, profile, syncPassiveSlots } from './profile'

/**
 * ─── The siege in the save (afterplay §8.4, §8.6) ───────────────────────────
 *
 * What lasts of the Siege of Bastion between visits (`profile.meta.siege`):
 * the wins by tier (which open Hard), the Marks banked, the milestones reached
 * once each, and the bell's count of invaded zones cleared since the last
 * siege. The story's first siege is due while `siegeDue` stands (B5); once it
 * is held, `siegeHeld` opens the siege for good.
 */

/** The flag the story's siege leaves: the siege is repeatable from now on. */
export const SIEGE_HELD = 'siegeHeld'

/** Is the siege open at all (the story's due, or held once)? */
export const siegeOpen = (): boolean => hasFlag(SIEGE_DUE) || hasFlag(SIEGE_HELD)

/** The story's first siege is the next one: it cannot be lost. */
export const storySiegeDue = (): boolean => hasFlag(SIEGE_DUE) && !hasFlag(SIEGE_HELD)

/** May this tier be fought now? */
export const siegeTierOpen = (tier: SiegeTier): boolean => siegeOpen() && tierOpen(tier, profile.meta.siege.wins, flagSet())

/** The tiers on offer, in order. */
export const siegeTiers = (): Array<{ tier: SiegeTier; open: boolean; wins: number }> =>
  SIEGE_TIERS.map(tier => ({ tier, open: siegeTierOpen(tier), wins: profile.meta.siege.wins[tier] }))

/** Does the siege bell ring (a banner on the map, the captain's call)? */
export const siegeBell = (): boolean => bellRings(hasFlag(SIEGE_HELD), storySiegeDue(), profile.meta.siege.clears)

/** An invaded zone was cleared: one more toward the bell. */
export const countSiegeClear = (): void => {
  if (!hasFlag(SIEGE_HELD)) return
  profile.meta.siege.clears++
}

/** Has the fifth passive slot been earned (the Hard win milestone, account-wide)? */
export const fifthPassiveOpen = (): boolean => hasFlag(FIFTH_PASSIVE_FLAG)

export interface SiegeOutcome {
  tier: SiegeTier
  won: boolean
  story: boolean
  /** Waves fought to their end. */
  waves: number
  /** Marks the siege earned, and those banked of them. */
  earned: number
  banked: number
  /** The gate took no damage all siege. */
  flawless: boolean
}

export interface SiegeResult {
  /** A win's purse and its XP (0 on a loss); the Demonglass it owes. */
  reward: SiegeReward | null
  /** The piece the win rolled (tier 5–6), '' none left to roll. */
  item: string
  /** Milestones this siege reached, and the items they handed over now. */
  milestones: SiegeMilestone[]
  items: string[]
}

/**
 * Bank a siege that is over: its Marks, the win and what it reaches. The
 * purse, the XP and the rolled piece are handed back for the result screen
 * (the flow banks them with the visit's tally). Each milestone is reached once
 * for good; one whose item does not exist yet is owed (`claimOwedSiegeItems`).
 */
export const recordSiege = (o: SiegeOutcome, seed: number): SiegeResult => {
  const s = profile.meta.siege
  s.runs++
  s.best = Math.max(s.best, o.waves)
  s.marks += o.banked
  s.clears = 0
  const out: SiegeResult = { reward: null, item: '', milestones: [], items: [] }
  // The story's siege is held either way it ends (it cannot be lost): the siege opens for good.
  if (o.story && !hasFlag(SIEGE_HELD)) {
    profile.world.flags = profile.world.flags.filter(f => f !== SIEGE_DUE)
    profile.world.flags.push(SIEGE_HELD)
  }
  if (!o.won) return out
  s.wins[o.tier]++
  out.reward = siegeReward(o.tier, profile.level)
  // The win's Demonglass goes into the pouch (phase 8; `glass` kept what an older save won before it).
  addOres({ demonglass: out.reward.glass })
  const prize = prizeOf(out.reward.tier, new Set(profile.inv.items), seed) ?? prizeOf(5, new Set(profile.inv.items), seed)
  if (prize) out.item = prize.id
  const reached = milestonesReached(s.wins, o.flawless && o.tier === 'hard', new Set(s.milestones))
  for (const m of reached) {
    s.milestones.push(m.id)
    out.milestones.push(m)
    if (m.flag && !hasFlag(m.flag)) profile.world.flags.push(m.flag)
    // Veteran's Instinct: the fifth passive slot is there at once.
    if (m.flag === FIFTH_PASSIVE_FLAG) syncPassiveSlots()
    if (m.item) {
      if (ITEM_BY_ID[m.item]) { gainItem(m.item); out.items.push(m.item) } else if (!s.owed.includes(m.item)) s.owed.push(m.item)
    }
  }
  return out
}

/** Milestone items owed until they existed (phase 8 adds them): handed over now. The
 *  profile does it on every load (`claimAfterplayDues`), with the rest the afterplay owes. */
export const claimOwedSiegeItems = (): string[] => claimAfterplayDues()

export { marksBanked }
