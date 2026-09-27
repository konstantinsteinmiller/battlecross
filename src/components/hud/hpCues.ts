import { profile, markTip } from '@/game/state/profile'

/**
 * ─── The health bar's hit cues (HudBars.vue) ────────────────────────────────
 *
 * A playtester never looked at the health bar: the heart, the red pulse and
 * the vignette worked, the bar itself did not register. So the bar answers
 * every hit, and the first one in a profile leads the eye to it:
 *
 * - the damage ghost: the chunk just lost stays standing, light, for
 *   `GHOST_HOLD`, then drains down to the fill (the fighting game's "recent
 *   damage" segment);
 * - a flash and a small kick, never more often than `KICK_GAP`, so sustained
 *   fire does not strobe it;
 * - once per profile (`FIRST_HIT_TIP`), a glow flies from the hit's marker to
 *   the heart and the bar swells once.
 */

/** The lost chunk holds this long (s) before it drains… */
export const GHOST_HOLD = 0.4
/** …and drains in this (s). */
export const GHOST_DRAIN = 0.3

/**
 * The damage ghost, in % of the bar. More hits inside the hold keep the top
 * where the run of hits began and restart the hold; a rise (a gel, a revive)
 * clears it.
 */
export class HpGhost {
  /** Where the ghost's top stands (%); at or under `floor` it is hidden. */
  top = 0
  /** The fill it drains to (%). */
  floor = 0
  private hold = 0
  private rate = 0

  get showing(): boolean {
    return this.top > this.floor
  }

  /** Health fell from `before` to `after` (%). */
  hit(before: number, after: number): void {
    if (after >= before) return
    this.top = this.showing ? Math.max(this.top, before) : before
    this.floor = after
    this.hold = GHOST_HOLD
    this.rate = 0
  }

  /** Health rose or reset to `to` (%): nothing lost to show. */
  reset(to: number): void {
    this.top = this.floor = to
    this.hold = 0
    this.rate = 0
  }

  /** One HUD frame; returns the top (%). */
  step(dt: number): number {
    if (!this.showing) return this.top
    if (this.hold > 0) {
      this.hold -= dt
      if (this.hold > 0) return this.top
      dt = -this.hold
      this.rate = (this.top - this.floor) / GHOST_DRAIN
    }
    this.top = Math.max(this.floor, this.top - this.rate * dt)
    return this.top
  }
}

/** The bar's flash and kick fire at most this often (s). */
export const KICK_GAP = 0.35

/** A gate that opens at most once per `gap` seconds of `now`. */
export const rateGate = (gap: number): ((now: number) => boolean) => {
  let last = -Infinity
  return (now: number): boolean => {
    if (now - last < gap) return false
    last = now
    return true
  }
}

/** `profile.tips` key: the first real damage has had its cue. */
export const FIRST_HIT_TIP = 'cue:firstHit'

/** True exactly once per profile: the first real damage plays the long cue
 *  (and the tip is saved at once). */
export const claimFirstHit = (): boolean => {
  if (profile.tips[FIRST_HIT_TIP]) return false
  markTip(FIRST_HIT_TIP)
  return true
}
