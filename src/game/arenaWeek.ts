/**
 * ─── The colosseum's week (roadmap #10, D71) ─────────────────────────────────
 *
 * The ladder runs by the ISO week (UTC, weeks start on Monday): one modifier
 * a week for everyone, and the board ranks the week's best wave. The Worker
 * computes the same key (`worker/src/index.ts`), so a score is always filed
 * under the week the server agrees it is.
 */

export type ArenaMod = 'fire' | 'nopotions' | 'glass' | 'swarm' | 'elites' | 'haste'
/** In rotation order, one per week. */
export const ARENA_MODS: readonly ArenaMod[] = ['fire', 'nopotions', 'glass', 'swarm', 'elites', 'haste']

/** Glass: both sides deal this much more. */
export const GLASS_DAMAGE = 1.5
/** Swarm: this many times the enemies, at this share of their health. */
export const SWARM_COUNT = 1.5
export const SWARM_HP = 0.7
/** Haste: enemies move and strike this much faster. */
export const HASTE = 1.2

/** ISO-8601 week of a date, in UTC: "2026-W40". */
export const weekKey = (d = new Date()): string => {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const y = t.getUTCFullYear()
  const w = Math.ceil(((t.getTime() - Date.UTC(y, 0, 1)) / 86_400_000 + 1) / 7)
  return `${y}-W${String(w).padStart(2, '0')}`
}

/** Whole weeks since Monday 1970-01-05 (UTC): the rotation's counter. */
const weeksSinceEpoch = (d: Date): number => Math.floor((d.getTime() - Date.UTC(1970, 0, 5)) / (7 * 86_400_000))

/** This week's modifier. */
export const arenaModOf = (d = new Date()): ArenaMod => ARENA_MODS[((weeksSinceEpoch(d) % ARENA_MODS.length) + ARENA_MODS.length) % ARENA_MODS.length]!
