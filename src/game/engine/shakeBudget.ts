/**
 * Crit screen-shake limiter (#140). A fast champion lands crits every few
 * hundred ms; each added +0.6 trauma, so the screen never settled. Crit shakes
 * are now half as strong and at most `CRIT_SHAKE_MAX` may fire in any sliding
 * `CRIT_SHAKE_WINDOW` seconds. A throttled crit keeps its hit-stop, number and
 * sound: only the camera trauma is dropped. Time is passed in (the sim clock),
 * so the budget is deterministic.
 */

/** A crit shakes at this share of the normal heavy-hit trauma. */
export const CRIT_SHAKE_SCALE = 0.5
/** Length of the sliding window, in seconds. */
export const CRIT_SHAKE_WINDOW = 5
/** Crit shakes allowed per window. */
export const CRIT_SHAKE_MAX = 3

/** Sliding-window counter. Boss slams, boss kills and hero hits never use it. */
export class ShakeBudget {
  private stamps: number[] = []

  constructor(private max = CRIT_SHAKE_MAX, private window = CRIT_SHAKE_WINDOW) {}

  /** True (and the shake is spent) when one more shake fits the window at `now`. */
  tryTake(now: number): boolean {
    // A clock that restarted (new zone) must not inherit the old window.
    if (this.stamps.length && this.stamps[this.stamps.length - 1]! > now) this.stamps.length = 0
    const from = now - this.window
    while (this.stamps.length && this.stamps[0]! <= from) this.stamps.shift()
    if (this.stamps.length >= this.max) return false
    this.stamps.push(now)
    return true
  }

  reset(): void {
    this.stamps.length = 0
  }
}

/** Trauma a crit adds at `now`: halved, or 0 when the window is spent. */
export function critTrauma(budget: ShakeBudget, now: number, heavyTrauma: number): number {
  return budget.tryTake(now) ? heavyTrauma * CRIT_SHAKE_SCALE : 0
}
