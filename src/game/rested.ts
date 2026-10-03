/**
 * ─── Rested (roadmap #9, D61) ────────────────────────────────────────────────
 *
 * Time away fills a pool of double-XP fight time: ten minutes for every hour
 * away, at most two hours of it (full after twelve hours). An absence shorter
 * than half an hour counts for nothing, so a reload is never a farm. The pool
 * drains with fight time only (a zone, the colosseum, an encounter — never a
 * town or the map), and while it lasts every kill pays double XP.
 *
 * The last-seen time is stamped with every save. A reload without a save in
 * between reads the same last-seen and the same pool, so it gains the same
 * amount again rather than adding to it.
 */

/** Seconds of double XP the pool holds at most. */
export const RESTED_CAP = 2 * 3600
/** Seconds of double XP earned per hour away. */
export const RESTED_PER_HOUR = 10 * 60
/** Shortest absence that counts, ms. */
export const RESTED_MIN_AWAY_MS = 30 * 60 * 1000

/** The pool after an absence from `lastSeen` to `now` (ms), and what it gained. */
export const accrueRested = (pool: number, lastSeen: number, now: number): { pool: number; gained: number } => {
  const p = Math.max(0, Math.min(RESTED_CAP, pool))
  const away = now - lastSeen
  if (!(lastSeen > 0) || away < RESTED_MIN_AWAY_MS) return { pool: p, gained: 0 }
  const next = Math.min(RESTED_CAP, p + (away / 3_600_000) * RESTED_PER_HOUR)
  return { pool: next, gained: next - p }
}

/** Kill XP multiplier while the pool lasts. */
export const RESTED_XP = 2

/** Hours and minutes of a pool, for the map and the banner (to the nearest minute, never "0 min" while any is left). */
export const restedClock = (seconds: number): { h: number; m: number } => {
  const mins = seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0
  return { h: Math.floor(mins / 60), m: mins % 60 }
}
