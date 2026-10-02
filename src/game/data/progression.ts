/**
 * ─── Levels and experience ───────────────────────────────────────────────────
 *
 * The hero's level runs 1..30 (the GDD's item tiers end at "30+"). Each level
 * grants 3 attribute points. XP keeps counting past the cap as LIFETIME XP —
 * the leaderboard's score and the save-merge tiebreak — so a capped hero's
 * numbers still move.
 *
 * The curve is tuned so the first clear of each zone at its recommended level
 * is worth roughly one level early on and a third of one late, which matches
 * the map's two-zones-per-tier pacing without a grind wall between tiers.
 */

export const MAX_LEVEL = 30

/** XP needed to go from `level` to `level + 1`. */
export const xpToNext = (level: number): number => Math.round(45 * Math.pow(level, 1.55) + 30 * level)

/** Total XP that reaching `level` from level 1 takes. */
export const xpToReach = (level: number): number => {
  let total = 0
  for (let l = 1; l < Math.min(level, MAX_LEVEL); l++) total += xpToNext(l)
  return total
}

export interface XpResult {
  level: number
  xp: number
  gained: number
}

/** Add XP to a (level, xp-into-level) pair. At the cap the bar stays full. */
export const addXp = (level: number, xp: number, amount: number): XpResult => {
  let l = Math.max(1, Math.round(level))
  let x = Math.max(0, xp) + Math.max(0, amount)
  let gained = 0
  while (l < MAX_LEVEL && x >= xpToNext(l)) {
    x -= xpToNext(l)
    l++
    gained++
  }
  if (l >= MAX_LEVEL) x = Math.min(x, xpToNext(MAX_LEVEL))
  return { level: l, xp: x, gained }
}

/** XP a kill is worth: the enemy's level and rank, less for a far weaker one. */
export const killXp = (enemyLevel: number, rankMul: number, heroLevel: number): number => {
  const base = (8 + 5 * enemyLevel) * rankMul
  // Farming zones far below the hero pays little; fighting up pays a bonus.
  const gap = enemyLevel - heroLevel
  const scale = gap >= 0 ? 1 + Math.min(0.6, gap * 0.08) : Math.max(0.15, 1 + gap * 0.12)
  return Math.max(1, Math.round(base * scale))
}

/** Gold a kill drops (before Charisma and luck). */
export const killGold = (enemyLevel: number, rankMul: number): number =>
  Math.round((3 + 1.6 * enemyLevel) * rankMul)

/** What learning a skill costs at its trainer. */
export const skillPrice = (levelReq: number): number => Math.round(40 + 22 * levelReq + 3.5 * levelReq * levelReq)
