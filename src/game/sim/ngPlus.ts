/**
 * ─── New Game+: how a second (third…) run through the story scales ──────────
 *
 * The level cap stays at 40: a New Game+ needs no new levels. Instead:
 * - **The bands lift to the cap.** On a first run every sector clamps its
 *   machines into its own band (the Scrapyard's tops out at 4), so a level-40
 *   Flux would walk through it. In New Game+ each band's top is the cap, so
 *   the machines track Flux all the way (`data/regions.ts` `enemyLevelFor`):
 *   the whole story at endgame strength, with endgame rewards.
 * - **Story progress counts as complete** for the machines' toughening
 *   (`adaptive.ts` PROGRESS_HP): every Core Master was beaten once already.
 * - **Each cycle adds 25% health** to every machine and boss (up to the
 *   fourth cycle, ×2).
 * - **Bosses get quicker** (#102): 15% shorter tells and cooldowns a cycle
 *   (down to ×0.6), and now and then a follow-up attack right after the
 *   last one ends, to catch a player off guard.
 *
 * Pure: the mission and the quest builders read it.
 */

/** Health added per New Game+ cycle, and the cycle where it stops growing. */
export const NG_HP_STEP = 0.25
export const NG_MAX_CYCLE = 4

/** Every machine's and boss's health multiplier in cycle `c` (0: first run). */
export const ngHpMul = (c: number): number => 1 + NG_HP_STEP * Math.min(NG_MAX_CYCLE, Math.max(0, c))

/** A boss's tell and cooldown multiplier: 15% quicker a cycle, floored. */
export const ngTempo = (c: number): number => (c > 0 ? Math.max(0.6, 0.85 ** c) : 1)

/** The chance a boss chains a quick follow-up right after an attack. */
export const ngFollowUp = (c: number): number => (c > 0 ? Math.min(0.4, 0.2 + 0.1 * (c - 1)) : 0)

/** The cooldown of a follow-up (s): just long enough to read the next tell. */
export const NG_FOLLOW_CD = 0.35
