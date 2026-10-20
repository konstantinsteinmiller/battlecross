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

/** The campaign's cap: the hero stops here until the afterplay opens. */
export const MAX_LEVEL = 30

/**
 * The afterplay (docs/gdd-afterplay.md §2): once the Void Lord falls in the
 * Rift the cap rises to 60. Above 30 each level costs a quarter less than the
 * formula says, and kills in invaded zones and siege waves pay AFTER_XP_MUL,
 * so 30→60 takes about as long as the campaign did.
 */
export const AFTER_MAX_LEVEL = 60
export const AFTER_CURVE = 0.75
export const AFTER_XP_MUL = 2.2

/** The level cap a hero faces: 30 in the campaign, 60 in the afterplay. */
export const levelCap = (afterplay: boolean): number => (afterplay ? AFTER_MAX_LEVEL : MAX_LEVEL)

/** XP needed to go from `level` to `level + 1`. */
export const xpToNext = (level: number): number => {
  const base = 45 * Math.pow(level, 1.55) + 30 * level
  return Math.round(level > MAX_LEVEL ? base * AFTER_CURVE : base)
}

/** Total XP that reaching `level` from level 1 takes (under `cap`). */
export const xpToReach = (level: number, cap = MAX_LEVEL): number => {
  let total = 0
  for (let l = 1; l < Math.min(level, cap); l++) total += xpToNext(l)
  return total
}

export interface XpResult {
  level: number
  xp: number
  gained: number
}

/** Add XP to a (level, xp-into-level) pair. At the cap the bar stays full. */
export const addXp = (level: number, xp: number, amount: number, cap = MAX_LEVEL): XpResult => {
  let l = Math.max(1, Math.round(level))
  let x = Math.max(0, xp) + Math.max(0, amount)
  let gained = 0
  while (l < cap && x >= xpToNext(l)) {
    x -= xpToNext(l)
    l++
    gained++
  }
  if (l >= cap) x = Math.min(x, xpToNext(cap))
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

/**
 * Skill ranks (afterplay §2.3). Rank 1 is the skill as learned; II and III are
 * bought from the same trainer once the afterplay opens. Rank II: +30 %
 * effect, −10 % cooldown; Rank III: +60 % effect, −10 % cooldown. The hero
 * level a rank asks is the skill's own (already scaled) level + 20 / + 32,
 * capped 50 / 58; its price is `skillPrice` of the price level + 20 / + 32.
 */
export const MAX_SKILL_RANK = 3
const RANK_EFFECT = [1, 1.3, 1.6] as const
const RANK_CD = [1, 0.9, 0.9] as const
const RANK_LEVEL_STEP = [0, 20, 32] as const
const RANK_LEVEL_CAP = [0, 50, 58] as const

const rankIdx = (rank: number): 0 | 1 | 2 => (Math.max(1, Math.min(MAX_SKILL_RANK, Math.round(rank || 1))) - 1) as 0 | 1 | 2

/** The effect factor of a skill at `rank` (1..3). */
export const rankMul = (rank: number): number => RANK_EFFECT[rankIdx(rank)]
/** The cooldown factor of a skill at `rank` (1..3). */
export const rankCd = (rank: number): number => RANK_CD[rankIdx(rank)]
/** The hero level a rank asks of a skill whose own level is `skillLevel`. */
export const rankLevel = (skillLevel: number, rank: number): number => {
  const i = rankIdx(rank)
  return i === 0 ? skillLevel : Math.min(RANK_LEVEL_CAP[i], skillLevel + RANK_LEVEL_STEP[i])
}
/** What a rank costs at the trainer, from the skill's price level. */
export const rankPrice = (priceLevel: number, rank: number): number => skillPrice(priceLevel + RANK_LEVEL_STEP[rankIdx(rank)])
