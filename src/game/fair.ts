import { ITEMS, type ItemDef } from './data/items'
import { mulberry32 } from './sim/rng'

/**
 * ─── The fair corner's games (afterplay §9) ──────────────────────────────────
 *
 * Three games at the fort's fair corner, built like the gamblers' tables in
 * `gamble.ts`: a fee from the hero's level, a row of wins, prizes. The rules
 * only (the windows are `components/modals/WhackGame.vue`, `RingTossGame.vue`
 * and `ArmWrestleGame.vue`, the purse and the rows `state/fair.ts`).
 *
 * Whack-a-Imp (Pip): imps pop out of nine barrels; hit 20 in 30 seconds. A
 *   gold armoured imp costs a life when hit. Three wins in a row bring the
 *   top prize: gold, Demonglass, a rare trinket and a tenth of a level.
 * Ring Toss at the Hydra (Old Bess): five rings at a wooden hydra whose three
 *   heads sway. Hold for power, let go to toss; every ringed head in a row is
 *   worth one more point. The score's tier pays; all five ringed (a perfect
 *   round) is the top prize, and one half of the Tidecaller's unlock.
 * Arm-Wrestle (Hob, the Forgemaster's apprentice): tap on the beat of a
 *   pulsing ring to push his arm down; Strength widens the beat. The third win
 *   in a row brings a smithing discount, the fifth Mythic Ichor, the Heroic+
 *   material (and the Hexsmith's streak).
 *
 * The cap (owner decision Q9): each game pays its top prize five times, then
 * gold only until the hero has cleared five more zones. No real-time clock.
 */

export type FairGame = 'whack' | 'ring' | 'arm'
export const FAIR_GAMES: readonly FairGame[] = ['whack', 'ring', 'arm']

const five = (n: number): number => Math.max(5, Math.round(n / 5) * 5)

/** Gold to play a round, from the hero's level. */
export const fairFee = (level: number): number => five(20 + 3 * level)

/** Gold a top prize pays: 600 at level 31, 1,200 at level 60 (§11). */
export const fairTopGold = (level: number): number =>
  Math.round((600 + 600 * Math.max(0, Math.min(1, (level - 31) / 29))) / 50) * 50

/** Demonglass a top prize pays (§11). */
export const FAIR_GLASS = 10
/** Top prizes a game pays before it pays gold only. */
export const FAIR_FULL = 5
/** Zone clears that open the top prizes again. */
export const FAIR_CLEARS = 5

/** A rare trinket not owned yet (null: every one is owned). */
export const trinketPrize = (owned: ReadonlySet<string>, seed: number): ItemDef | null => {
  const pool = ITEMS.filter(i => i.slot === 'trinket' && i.tier === 3 && !owned.has(i.id))
  if (!pool.length) return null
  return pool[Math.floor(mulberry32(seed)() * pool.length)]!
}

// ─── Whack-a-Imp ─────────────────────────────────────────────────────────────

export const WHACK_HOLES = 9
export const WHACK_SECONDS = 30
export const WHACK_GOAL = 20
export const WHACK_LIVES = 3
/** Wins in a row for the top prize (the row then starts over). */
export const WHACK_ROW = 3
/** How long an imp stays up: 0.6 s at the start, 0.3 s at the end. */
export const whackUp = (t: number): number => 0.6 - 0.3 * Math.max(0, Math.min(1, t / WHACK_SECONDS))

/** One imp out of a barrel: when (s), which barrel, how long, armoured gold. */
export interface WhackPop { at: number; hole: number; up: number; gold: boolean }

/** A round dealt: every imp of the 30 seconds. Never two at once in one barrel; a gold one is more likely each win into the row. */
export const dealWhack = (row: number, seed: number): WhackPop[] => {
  const rng = mulberry32(seed)
  const goldChance = 0.12 + 0.04 * Math.max(0, Math.min(WHACK_ROW - 1, row))
  const out: WhackPop[] = []
  const busy = new Array<number>(WHACK_HOLES).fill(-1)
  let t = 0.6
  while (t < WHACK_SECONDS) {
    const up = whackUp(t)
    let hole = Math.floor(rng() * WHACK_HOLES)
    for (let k = 0; k < WHACK_HOLES && busy[hole]! > t; k++) hole = (hole + 1) % WHACK_HOLES
    if (busy[hole]! <= t) {
      out.push({ at: t, hole, up, gold: rng() < goldChance })
      busy[hole] = t + up + 0.1
    }
    // An imp every 0.55 s at the start, every 0.35 s at the end, a little jitter.
    t += 0.55 - 0.2 * (t / WHACK_SECONDS) + (rng() - 0.5) * 0.1
  }
  return out
}

/** The imps that can be hit (the plain ones) in a deal: always more than the goal. */
export const whackPlain = (pops: readonly WhackPop[]): number => pops.filter(p => !p.gold).length

// ─── Ring Toss at the Hydra ──────────────────────────────────────────────────

export const RING_RINGS = 5
/** How far each head stands (as the power that reaches it, 0..1). */
export const RING_DEPTHS: readonly number[] = [0.35, 0.6, 0.85]
/** Power a toss may miss a head's depth by and still ring it. */
export const RING_DEPTH_TOL = 0.09
/** How far a head may sway off the middle (of its full sway 1) and still be ringed. */
export const RING_SWAY_TOL = 0.3
/** Seconds a ring flies. */
export const RING_FLIGHT = 0.5
/** Seconds the power bar takes to go up and back down. */
export const RING_POWER_PERIOD = 1.4
/** The top score: every ring a head, in a row (1 + 2 + 3 + 4 + 5). */
export const RING_PERFECT = (RING_RINGS * (RING_RINGS + 1)) / 2

/** Each head's sway: seconds for one swing there and back, and where it starts. */
export interface RingHead { period: number; phase: number }
export const dealHeads = (seed: number): RingHead[] => {
  const rng = mulberry32(seed)
  return RING_DEPTHS.map((_, i) => ({ period: 2.4 + i * 0.5 + rng() * 0.4, phase: rng() * Math.PI * 2 }))
}

/** A head's place off the middle, -1..1, at `t` seconds. */
export const headSway = (h: RingHead, t: number): number => Math.sin((t / h.period) * Math.PI * 2 + h.phase)

/** The power bar while held for `held` seconds: 0 → 1 → 0, again and again. */
export const ringPower = (held: number): number => {
  const p = (held % RING_POWER_PERIOD) / RING_POWER_PERIOD
  return p < 0.5 ? p * 2 : 2 - p * 2
}

/** Which head (index) a toss of this power let go at `t` rings, or -1. */
export const ringHit = (power: number, t: number, heads: readonly RingHead[]): number => {
  const land = t + RING_FLIGHT
  for (let i = 0; i < heads.length; i++) {
    if (Math.abs(power - RING_DEPTHS[i]!) <= RING_DEPTH_TOL && Math.abs(headSway(heads[i]!, land)) <= RING_SWAY_TOL) return i
  }
  return -1
}

/** A round's score: each ringed toss is worth one more than the last, a miss starts the count over. */
export const ringScore = (hits: readonly boolean[]): number => {
  let score = 0
  let run = 0
  for (const h of hits) {
    run = h ? run + 1 : 0
    score += run
  }
  return score
}

/** What a score pays: nothing, the fee back (×1), ×2, ×4, or the top prize (a perfect round). */
export type RingTier = 0 | 1 | 2 | 3 | 4
export const RING_TIERS: ReadonlyArray<{ min: number; mul: number }> = [
  { min: 0, mul: 0 },
  { min: 3, mul: 1 },
  { min: 6, mul: 2 },
  { min: 10, mul: 4 }
]
export const ringTier = (score: number): RingTier => {
  if (score >= RING_PERFECT) return 4
  let t = 0
  for (let i = 0; i < RING_TIERS.length; i++) if (score >= RING_TIERS[i]!.min) t = i
  return t as RingTier
}

// ─── Arm-Wrestle ─────────────────────────────────────────────────────────────

/** Wins in a row for Heroic+ material (and the Hexsmith's streak); the row then starts over. */
export const ARM_ROW = 5
/** The win in a row that brings the smithing discount. */
export const ARM_DISCOUNT_ROW = 3
/** The discount off the smith's upgrades, until the top prizes open again. */
export const ARM_DISCOUNT = 0.2
/** Seconds between beats, by the wins already in the row. */
export const ARM_BEATS: readonly number[] = [0.9, 0.8, 0.72, 0.65, 0.6]
/** Where the arms start (0: the hero's knuckles on the table, 1: the apprentice's). */
export const ARM_START = 0.5
/** A tap on the beat pushes; a tap off it slips; a beat let pass is his push. */
export const ARM_PUSH = 0.12
export const ARM_SLIP = 0.08
export const ARM_LEAN = 0.05
/** Seconds a bout may last: arms still up then, the apprentice wins. */
export const ARM_SECONDS = 30

/** The beat's window (seconds each side): 0.08 s, Strength adds up to 0.06 s more. */
export const armWindow = (str: number): number => 0.08 + 0.06 * Math.max(0, Math.min(1, str / 300))

/** The beat a row plays. */
export const armBeat = (row: number): number => ARM_BEATS[Math.max(0, Math.min(ARM_BEATS.length - 1, Math.floor(row)))]!

/** Is a tap at `t` seconds on a beat (beats at `beat`, 2·beat, …)? */
export const armOnBeat = (t: number, beat: number, window: number): boolean => {
  const k = Math.round(t / beat)
  return k >= 1 && Math.abs(t - k * beat) <= window
}

// ─── The save ────────────────────────────────────────────────────────────────

export interface FairSave {
  /** Wins in a row (Whack-a-Imp, Arm-Wrestle) and, for the Ring Toss, nothing (it pays by score). */
  rows: Record<FairGame, number>
  /** The best: the longest row (whack, arm), the best score (ring). */
  best: Record<FairGame, number>
  /** Top prizes paid since the cap last opened. */
  full: Record<FairGame, number>
  /** Zones cleared since the cap last opened. */
  clears: number
  /** The smithing discount is on (until the cap opens again). */
  discount: boolean
}

const zero = (): Record<FairGame, number> => ({ whack: 0, ring: 0, arm: 0 })
export const defaultFair = (): FairSave => ({ rows: zero(), best: zero(), full: zero(), clears: 0, discount: false })

/** A stored fair block, cleaned: anything missing or malformed loads as never played. */
export const normalizeFair = (raw: unknown): FairSave => {
  const d = defaultFair()
  if (!raw || typeof raw !== 'object') return d
  const o = raw as Record<string, unknown>
  const n = (v: unknown, max = Infinity): number => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(0, Math.round(v))) : 0)
  const per = (v: unknown, max: Record<FairGame, number>): Record<FairGame, number> => {
    const r = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>
    return { whack: n(r.whack, max.whack), ring: n(r.ring, max.ring), arm: n(r.arm, max.arm) }
  }
  return {
    rows: per(o.rows, { whack: WHACK_ROW - 1, ring: 0, arm: ARM_ROW - 1 }),
    best: per(o.best, { whack: Infinity, ring: RING_PERFECT, arm: Infinity }),
    full: per(o.full, { whack: FAIR_FULL, ring: FAIR_FULL, arm: FAIR_FULL }),
    clears: n(o.clears, FAIR_CLEARS - 1),
    discount: o.discount === true
  }
}
