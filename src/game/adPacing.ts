/**
 * Interstitial pacing by CONTENT (roadmap #20, D52). The clock in
 * `use/useAdGate` says whether an ad MAY run (ad-free start, two-minute gap);
 * this says whether this moment is one an ad may take at all:
 *
 *   • never after the opening fight — the first thing a new player ever does;
 *   • never after a defeat — a loss followed by an ad reads as a punishment;
 *   • never right before a decision — the story's big moment comes first.
 *
 * A break that is skipped is not owed: the next eligible screen takes the next
 * ad, on the same clock.
 */
export interface BreakContext {
  outcome: 'victory' | 'defeat' | 'retreat'
  /** The visit was the hero's very first (the opening fight). */
  opening?: boolean
  /** A quest decision opens right after this screen. */
  decisionNext?: boolean
}

export const breakAllowed = (c: BreakContext): boolean =>
  !c.opening && c.outcome !== 'defeat' && !c.decisionNext
