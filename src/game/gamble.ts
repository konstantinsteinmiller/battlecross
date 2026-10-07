import { ITEMS, sellValue, type ItemDef } from './data/items'
import { xpToNext } from './data/progression'
import { mulberry32 } from './sim/rng'

/**
 * ─── The gamblers (roadmap #91, #92, D110, D111) ────────────────────────────
 *
 * Two games of chance and skill in the towns, the rules only (the windows are
 * `components/modals/MemoryGame.vue` and `ItemBattle.vue`, the purse and the
 * streaks `state/profile.ts`).
 *
 * The memory stand (Silverbridge, after the shooting galleries of Ocarina of
 * Time): the hero bets gold, turns the cards two at a time and must find every
 * pair before the sand runs out. Done in time, the bet comes back doubled.
 * Every win in a row leaves less time and more pairs; the fifth in a row adds
 * a Legendary the hero does not own yet, and the row starts over.
 *
 * The item battle (Sunford and Oakhaven): for a small fee, the hero and the
 * gambler each lay an item, three times at most; the higher sale value takes
 * the point, two points take the game. The hero's laid items are gone either
 * way. The gambler lays ever dearer things. A won game pays a little
 * experience; the third win in a row adds an Epic not owned yet.
 */

// ─── The memory stand ────────────────────────────────────────────────────────

/** The rounds of a winning row: pairs on the table and seconds on the glass. */
export const MEMORY_ROUNDS: ReadonlyArray<{ pairs: number; seconds: number }> = [
  { pairs: 6, seconds: 70 },
  { pairs: 6, seconds: 61 },
  { pairs: 8, seconds: 52 },
  { pairs: 8, seconds: 43 },
  { pairs: 10, seconds: 34 }
]
/** Wins in a row for the Legendary. */
export const MEMORY_ROW = MEMORY_ROUNDS.length
/** How long a wrong pair stays face up, in seconds. */
export const MEMORY_PEEK = 0.8

/** The round a winning row of `streak` plays next. */
export const memoryRound = (streak: number): { pairs: number; seconds: number } =>
  MEMORY_ROUNDS[Math.max(0, Math.min(MEMORY_ROUNDS.length - 1, streak))]!

const five = (n: number): number => Math.max(5, Math.round(n / 5) * 5)
/** The three bets the stand takes from a hero of this level. */
export const memoryStakes = (level: number): [number, number, number] =>
  [five(10 + 5 * level), five(25 + 12 * level), five(50 + 25 * level)]

/** A shuffled table: each pair's id twice, `pairs * 2` cards. */
export const dealMemory = (pairs: number, seed: number): number[] => {
  const rng = mulberry32(seed)
  const cards: number[] = []
  for (let p = 0; p < pairs; p++) cards.push(p, p)
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j]!, cards[i]!]
  }
  return cards
}

// ─── The item battle ─────────────────────────────────────────────────────────

/** Unworn items the hero must have to sit down. */
export const BATTLE_MIN_ITEMS = 3
/** Points that take a game (of three items at most). */
export const BATTLE_POINTS = 2
/** Wins in a row for the Epic. */
export const BATTLE_ROW = 3

/** The table's fee, by the hero's level. */
export const battleFee = (level: number): number => 10 + 2 * level

/** The experience a won game pays: a tenth of a level. */
export const battleXp = (level: number): number => Math.round(xpToNext(level) * 0.1)

/** The quality of item a hero of this level mostly carries. */
const homeTier = (level: number): number => (level < 6 ? 1 : level < 11 ? 2 : level < 17 ? 3 : level < 24 ? 4 : 5)

/**
 * What the gambler lays in a round: a piece of the quality the hero mostly
 * carries, a step dearer for every two rounds into the game and every win in
 * the row (never a Legendary).
 */
export const gamblerItem = (level: number, streak: number, round: number, seed: number): ItemDef => {
  const tier = Math.min(5, homeTier(level) + Math.floor((round + streak) / 2))
  const pool = ITEMS.filter(i => i.tier === tier)
  const rng = mulberry32(seed + round * 7919 + streak * 104729)
  return pool[Math.floor(rng() * pool.length)]!
}

/** A round: the dearer item takes the point; a tie goes to the house. */
export const battleRound = (mine: ItemDef, theirs: ItemDef): 'win' | 'lose' => (sellValue(mine) > sellValue(theirs) ? 'win' : 'lose')

// ─── The prizes (D113) ───────────────────────────────────────────────────────

/** A random piece of this quality the hero does not own yet (null: he owns them all). */
export const prizeOf = (tier: 4 | 6, owned: ReadonlySet<string>, seed: number): ItemDef | null => {
  const pool = ITEMS.filter(i => i.tier === tier && !owned.has(i.id))
  if (!pool.length) return null
  return pool[Math.floor(mulberry32(seed)() * pool.length)]!
}
