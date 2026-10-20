import {
  ARM_DISCOUNT_ROW, ARM_ROW, FAIR_CLEARS, FAIR_FULL, FAIR_GLASS, RING_TIERS, WHACK_ROW,
  fairFee, fairTopGold, ringScore, ringTier, trinketPrize, type FairGame, type RingTier
} from '../fair'
import { battleXp } from '../gamble'
import { addOres, gainItem, grantXp, hasFlag, profile, saveProfile, totalAttrs } from './profile'

/**
 * ─── The fair corner in the save (afterplay §9) ─────────────────────────────
 *
 * The purse and the rows of the fort's three fair games
 * (`profile.meta.fair`, rules in `game/fair.ts`). A round's fee goes on the
 * table when it starts; the settle pays it out. The top prize is paid in
 * full five times a game, then in gold only until five more zones are
 * cleared (`countFairClear`). The flags the hidden classes read are set
 * whether the prize is capped or not.
 */

/** A Ring Toss perfect round was thrown (with the Leviathan: the Tidecaller, phase 10). */
export const RING_PERFECT_FLAG = 'ringPerfect'
/** Five Arm-Wrestle wins in a row (with five Infernal forgings: the Hexsmith, phase 10). */
export const ARM_STREAK_FLAG = 'armStreak5'

/** What a top prize brought. `capped`: gold only, the full prizes are spent for now. */
export interface FairTop { gold: number; xp: number; glass: number; item: string; mats: number; capped: boolean }

/** A round settled: the gold it paid, the top prize (null: none this round), the row now. */
export interface FairResult { gold: number; top: FairTop | null; row: number }

const fair = () => profile.meta.fair

/** Gold to play a round now. */
export const fairFeeNow = (): number => fairFee(profile.level)

/** Has this game paid its top prize five times since the cap last opened? */
export const fairCapped = (game: FairGame): boolean => fair().full[game] >= FAIR_FULL

/** Why a round cannot start ('' when it can). */
export const fairBlock = (): '' | 'gold' => (profile.gold >= fairFeeNow() ? '' : 'gold')

/** Sit down: the fee goes on the table. False: not the gold. */
export const startFair = (): boolean => {
  if (fairBlock()) return false
  profile.gold -= fairFeeNow()
  saveProfile()
  return true
}

const setFlag = (f: string): void => { if (!hasFlag(f)) profile.world.flags.push(f) }

/** The top prize: in full (gold, a tenth of a level, Demonglass, and a trinket or Mythic Ichor), or gold only once capped. */
const payTop = (game: FairGame, trinket: boolean, mats: number): FairTop => {
  const gold = fairTopGold(profile.level)
  profile.gold += gold
  if (fairCapped(game)) return { gold, xp: 0, glass: 0, item: '', mats: 0, capped: true }
  fair().full[game]++
  const xp = battleXp(profile.level)
  grantXp(xp)
  addOres({ demonglass: FAIR_GLASS, ichor: mats })
  let item = ''
  if (trinket) {
    const it = trinketPrize(new Set(profile.inv.items), Date.now() >>> 0)
    if (it) { gainItem(it.id); item = it.id }
  }
  return { gold, xp, glass: FAIR_GLASS, item, mats, capped: false }
}

/** Whack-a-Imp decided: a win pays the fee doubled and adds to the row; the third in a row is the top prize. */
export const settleWhack = (won: boolean): FairResult => {
  const f = fair()
  let gold = 0
  let top: FairTop | null = null
  if (won) {
    f.rows.whack++
    f.best.whack = Math.max(f.best.whack, f.rows.whack)
    if (f.rows.whack >= WHACK_ROW) { top = payTop('whack', true, 0); f.rows.whack = 0 }
    else { gold = fairFeeNow() * 2; profile.gold += gold }
  } else f.rows.whack = 0
  saveProfile()
  return { gold, top, row: f.rows.whack }
}

/** A Ring Toss round decided by its five tosses: the score's tier pays; a perfect round is the top prize and the flag. */
export const settleRing = (hits: readonly boolean[]): FairResult & { score: number; tier: RingTier } => {
  const f = fair()
  const score = ringScore(hits)
  const tier = ringTier(score)
  f.best.ring = Math.max(f.best.ring, score)
  let gold = 0
  let top: FairTop | null = null
  if (tier === 4) {
    setFlag(RING_PERFECT_FLAG)
    top = payTop('ring', true, 0)
  } else if (tier > 0) { gold = fairFeeNow() * RING_TIERS[tier]!.mul; profile.gold += gold }
  saveProfile()
  return { gold, top, row: 0, score, tier }
}

/** Arm-Wrestle decided: a win pays the fee doubled; the third in a row turns on the smith's discount, the fifth is the top prize (Mythic Ichor, the Heroic+ material). */
export const settleArm = (won: boolean): FairResult & { discount: boolean } => {
  const f = fair()
  let gold = 0
  let top: FairTop | null = null
  let discount = false
  if (won) {
    f.rows.arm++
    f.best.arm = Math.max(f.best.arm, f.rows.arm)
    if (f.rows.arm >= ARM_ROW) {
      setFlag(ARM_STREAK_FLAG)
      top = payTop('arm', false, 1)
      f.rows.arm = 0
    } else {
      gold = fairFeeNow() * 2
      profile.gold += gold
      if (f.rows.arm === ARM_DISCOUNT_ROW && !fairCapped('arm') && !f.discount) { f.discount = true; discount = true }
    }
  } else f.rows.arm = 0
  saveProfile()
  return { gold, top, row: f.rows.arm, discount }
}

/** The hero's Strength (the Arm-Wrestle's beat widens with it). */
export const heroStrength = (): number => totalAttrs().str

/** A zone was won: one more toward opening the top prizes again (and ending the discount). */
export const countFairClear = (): void => {
  const f = fair()
  f.clears++
  if (f.clears < FAIR_CLEARS) return
  f.clears = 0
  f.full = { whack: 0, ring: 0, arm: 0 }
  f.discount = false
}
