import type { FeatureId } from './state'
import type { RevealId } from './reveal'

/**
 * ─── Pacing the introductions (roadmap #52) ──────────────────────────────────
 *
 * The rules that keep the onboarding from stacking up, as a pure clock the
 * tests can drive:
 *
 *   • ONE feature lesson at a time;
 *   • at most one NEW feature per breathing moment (arriving somewhere, a
 *     window or a conversation closing, a fight over). A lesson that leads on
 *     from the one just learned (talk → teach → learn → slot) is the same
 *     feature and may follow at once;
 *   • a lesson waits for the screen to settle (`SETTLE`) and is held back
 *     while anything else has the player (a conversation, a veil, an ad);
 *   • reveals of HUD buttons come first, `REVEAL_GAP` apart, never mid-fight
 *     and never over a lesson that is on screen; a lesson then waits one gap.
 *
 * Learning is not decided here: the game reports uses (`coach.use`), and a
 * feature already used before its lesson came up never comes up.
 */

/** Seconds between two reveals, and from a reveal to a lesson. */
export const REVEAL_GAP = 1.2
/** Seconds a new screen or window settles before a lesson shows on it. */
export const SETTLE = 0.9

/** What leads on from what: the second may follow the first in one moment. */
export const CHAIN: Partial<Record<FeatureId, FeatureId>> = { teach: 'talk', learn: 'teach', slot: 'learn' }

export interface PaceInput {
  /** Seconds (any clock that only moves forward). */
  now: number
  /** The features that could be taught HERE, most important first, unlearned only. */
  want: readonly FeatureId[]
  /** Something else has the player: nothing new shows. */
  blocked: boolean
  /** Reveals that are due and whose button is on screen in a calm. */
  reveals: readonly RevealId[]
}

export interface PaceOutput {
  lesson: FeatureId | ''
  shown: boolean
  /** A button to pop in now ('' none). */
  reveal: RevealId | ''
}

export class Pacer {
  lesson: FeatureId | '' = ''
  /** Breathing moments so far. */
  moment = 0
  private introduced = new Set<FeatureId>()
  private retired = new Set<FeatureId>()
  private settledFrom = -Infinity
  private lastReveal = -Infinity
  private wasShown = false

  /** A breathing moment: a new feature may be introduced. */
  breathe(now: number): void {
    this.moment++
    this.introduced.clear()
    this.retired.clear()
    this.settledFrom = now
  }

  /** The screen changed under the lesson (a window, a page, a phase). */
  settle(now: number): void {
    this.settledFrom = now
  }

  /** The feature was used: its lesson is over. */
  retire(id: FeatureId): void {
    this.retired.add(id)
    if (this.lesson === id) { this.lesson = ''; this.wasShown = false }
  }

  /** May this feature start now? */
  private may(id: FeatureId): boolean {
    if (this.introduced.has(id) || this.introduced.size === 0) return true
    const from = CHAIN[id]
    return !!from && this.retired.has(from)
  }

  step(inp: PaceInput): PaceOutput {
    // A lesson the place no longer asks for steps aside (it may come back).
    if (this.lesson && !inp.want.includes(this.lesson)) { this.lesson = ''; this.wasShown = false }
    if (!this.lesson) {
      for (const id of inp.want) {
        if (!this.may(id)) continue
        this.lesson = id
        this.introduced.add(id)
        break
      }
    }
    let reveal: RevealId | '' = ''
    if (!inp.blocked && inp.reveals.length && inp.now - this.lastReveal >= REVEAL_GAP && !this.wasShown) {
      reveal = inp.reveals[0]!
      this.lastReveal = inp.now
    }
    const shown = !!this.lesson && !inp.blocked && !reveal &&
      inp.now - this.settledFrom >= SETTLE && inp.now - this.lastReveal >= REVEAL_GAP
    // Once on screen it stays through a short settle (a page turn, a hover).
    this.wasShown = shown || (this.wasShown && !!this.lesson && !inp.blocked)
    return { lesson: this.lesson, shown: shown || (this.wasShown && !inp.blocked), reveal }
  }

  /** Test seam. */
  reset(): void {
    this.lesson = ''
    this.moment = 0
    this.introduced.clear()
    this.retired.clear()
    this.settledFrom = -Infinity
    this.lastReveal = -Infinity
    this.wasShown = false
  }
}
