/**
 * ─── The level-up pick: pacing and pip maths ────────────────────────────────
 *
 * A playtest complaint, word for word: after one pick "the screen doesn't
 * change". With three level-ups banked, the old modal granted the attribute
 * and redrew exactly the same three cards under the same badge — no sign a
 * pick had landed, how many were left, or which level was being spent.
 *
 * So every pick now plays a short, fixed beat (`LevelUpModal.vue`):
 *
 *   0 ms     the card presses in and flashes, a "+N" chip lifts off it
 *   fly      the chip lands on its stat, which counts up; that level's pip
 *            ticks off; the badge rolls on to the next level; cards re-deal
 *   lock     input opens again — a double-click cannot spend two picks
 *   (last)   no re-deal: every pip is ticked, the badge turns into a check,
 *            and the modal HOLDS for `hold` before it closes
 *
 * The numbers live here, apart from the SFC, so the test drives the exact
 * same clock the player sees instead of guessing at sleeps.
 */
export interface PickPace {
  /** The "+N" chip's flight from card to stat; the pick lands at its end. */
  fly: number
  /** From the click until the next pick is accepted. */
  lock: number
  /** The stat's count-up once the chip lands. */
  count: number
  /** After the LAST pick lands: how long the finished state stays up. */
  hold: number
}

export const PICK_PACE: PickPace = { fly: 380, lock: 600, count: 420, hold: 650 }

/** Reduced motion: nothing flies or re-deals, but the lock stays (it guards
 *  the save, not the eye) and the finished state is still held long enough to
 *  be read. */
export const PICK_PACE_REDUCED: PickPace = { fly: 140, lock: 320, count: 0, hold: 650 }

/** Pips drawn at once; beyond that a window slides along with "+n" at the
 *  cut ends. A mission rarely banks more than three levels, but a returning
 *  save can hold a dozen, and a landscape phone has one short row to spare. */
export const MAX_PIPS = 7

/**
 * The level each pending pick was earned at, oldest first: level 6 with three
 * picks pending spends Lv 4, Lv 5, Lv 6. Floored at 2 (level 1 is where the
 * game starts, not a level-up), so a save whose pending count ran ahead of
 * its level still draws sane numbers.
 */
export const pickLevels = (level: number, total: number): number[] =>
  Array.from({ length: Math.max(0, total) }, (_, i) => Math.max(2, level - total + 1 + i))

export interface PipWindow {
  /** First pip index drawn. */
  start: number
  /** One past the last pip index drawn. */
  end: number
  /** Pips cut off on the left (all spent — the window follows the active one). */
  before: number
  /** Pips cut off on the right (all still to spend). */
  after: number
}

/** Which slice of `total` pips to draw so the `active` one stays in view. */
export const pipWindow = (total: number, active: number, max = MAX_PIPS): PipWindow => {
  const n = Math.max(0, total)
  if (n <= max) return { start: 0, end: n, before: 0, after: 0 }
  const start = Math.max(0, Math.min(active - Math.floor(max / 2), n - max))
  const end = start + max
  return { start, end, before: start, after: n - end }
}
