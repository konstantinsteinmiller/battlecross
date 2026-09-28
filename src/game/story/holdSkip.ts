/**
 * ─── Hold to skip ────────────────────────────────────────────────────────────
 *
 * A cutscene skip without the mouse: hold `Space` for `HOLD_TO_SKIP_S` and it
 * skips. A hold, not a press, because Space is the game's slide key: a player
 * mashing it to see if anything happens must not throw away a story they have
 * never seen. Letting go before the ring is full starts it over.
 *
 * Pure state stepped on the cutscene's own clock (`IntroMode.update`), so an
 * ad or a pause freezes the ring with the picture; the key handlers only say
 * down or up. `holdProgress` is the ring's fill, painted by the layer.
 */

/** How long Space must be held to skip (s). */
export const HOLD_TO_SKIP_S = 3

export interface Hold {
  /** The key is down. */
  down: boolean
  /** Seconds held, on the stepping clock. */
  held: number
  /** This hold has already skipped (it fires once until let go). */
  fired: boolean
}

export const newHold = (): Hold => ({ down: false, held: 0, fired: false })

/** The key went down (a key repeat is not a new press). */
export const pressHold = (h: Hold): void => {
  if (h.down) return
  h.down = true
  h.held = 0
  h.fired = false
}

/** The key came up (or the window lost focus): the ring empties. */
export const releaseHold = (h: Hold): void => {
  h.down = false
  h.held = 0
  h.fired = false
}

/**
 * One step of `dt` seconds. True exactly once per hold: on the step it
 * reaches `need`. (A tiny slack, so 180 steps of 1/60 s make 3 s.)
 */
export const stepHold = (h: Hold, dt: number, need = HOLD_TO_SKIP_S): boolean => {
  if (!h.down || h.fired) return false
  h.held = Math.min(need, h.held + dt)
  if (h.held < need - 1e-6) return false
  h.held = need
  h.fired = true
  return true
}

/** The ring's fill, 0..1 (empty while the key is up). */
export const holdProgress = (h: Hold, need = HOLD_TO_SKIP_S): number =>
  h.down ? Math.min(1, h.held / need) : 0
