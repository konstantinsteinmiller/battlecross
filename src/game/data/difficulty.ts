/**
 * What the difficulty setting pays. Enemy strength is `difficultyFactor()` (`use/useUser.ts`: Easy ×0.8, Medium ×1, Hard
 * ×1.25); the coins the hero earns on the way follow it: Medium is the base, Easy pays 10% less, Hard 30% more. The sim
 * reads the enemy factor it was given (`sim.difficulty`) and turns it into the coin factor here, so one number drives both.
 */
export const COIN_MUL = { easy: 0.9, medium: 1, hard: 1.3 } as const

/** The coin factor for the enemy-strength factor a visit was built with. */
export const coinMulFor = (difficulty: number): number => (difficulty < 0.999 ? COIN_MUL.easy : difficulty > 1.001 ? COIN_MUL.hard : COIN_MUL.medium)

/** The change in whole percent (−10, 0, +30), for the options list. */
export const coinPct = (d: keyof typeof COIN_MUL): number => Math.round((COIN_MUL[d] - 1) * 100)
