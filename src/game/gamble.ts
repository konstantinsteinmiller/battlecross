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

/**
 * Each gambler plays his own table (#115): what he lays does not follow the
 * hero's level or what the hero owns, so collecting better pieces is how a
 * table is beaten. Sunford's never lays above Uncommon, even three wins into
 * a row; Oakhaven's goes up to Rare. A table's fee is its own, and so is the
 * prize for three wins in a row (a Rare in Sunford, so the easy table is not
 * an Epic farm).
 *
 *   base    the quality he opens with
 *   top     the dearest quality he ever lays
 *   fee     gold to sit down
 *   prize   the quality of the piece three wins in a row bring
 */
export interface GamblerTable { base: number; top: number; fee: number; prize: number }
export const GAMBLER_TABLES: Readonly<Record<string, GamblerTable>> = {
  sunfordGambler: { base: 1, top: 2, fee: 14, prize: 3 },
  oakGambler: { base: 2, top: 3, fee: 40, prize: 4 }
}
/** A gambler without a table of his own (a later town): Oakhaven's stakes. */
const DEFAULT_TABLE: GamblerTable = { base: 2, top: 3, fee: 40, prize: 4 }
export const gamblerTable = (gambler: string): GamblerTable => GAMBLER_TABLES[gambler] ?? DEFAULT_TABLE

/** The table's fee. */
export const battleFee = (gambler: string): number => gamblerTable(gambler).fee

/** The experience a won game pays: a tenth of a level. */
export const battleXp = (level: number): number => Math.round(xpToNext(level) * 0.1)

/**
 * What the gambler lays in a round: his table's opening quality, a step dearer
 * for every two rounds into the game and every win in the row, never past his
 * table's top.
 */
export const gamblerItem = (gambler: string, streak: number, round: number, seed: number): ItemDef => {
  const t = gamblerTable(gambler)
  const tier = Math.min(t.top, t.base + Math.floor((round + streak) / 2))
  const pool = ITEMS.filter(i => i.tier === tier)
  const rng = mulberry32(seed + round * 7919 + streak * 104729)
  return pool[Math.floor(rng() * pool.length)]!
}

/** A round: the dearer item takes the point; a tie goes to the house. */
export const battleRound = (mine: ItemDef, theirs: ItemDef): 'win' | 'lose' => (sellValue(mine) > sellValue(theirs) ? 'win' : 'lose')

// ─── The prizes (D113) ───────────────────────────────────────────────────────

/** A random piece of this quality the hero does not own yet (null: he owns them all). */
export const prizeOf = (tier: number, owned: ReadonlySet<string>, seed: number): ItemDef | null => {
  const pool = ITEMS.filter(i => i.tier === tier && !owned.has(i.id))
  if (!pool.length) return null
  return pool[Math.floor(mulberry32(seed)() * pool.length)]!
}
