import { shallowReactive } from 'vue'

/**
 * ─── What the onboarding shows right now (shared, reactive) ──────────────────
 *
 * A leaf module: the in-world coach (`game/coach.ts`), the pacing that picks
 * the next feature lesson (`coach/onboarding.ts`) and the two layers that
 * draw them all read and write it, without importing one another.
 */

/** The game's features, each taught once, the first time it matters
 *  (roadmap #52). `talk` is drawn in the world; the rest over the screens. */
export type FeatureId = 'talk' | 'teach' | 'learn' | 'slot' | 'equip' | 'attr' | 'travel' | 'buy'

export const onboard = shallowReactive({
  /** The feature being taught ('' none). */
  lesson: '' as FeatureId | '',
  /** It is on screen (not held back by a conversation, a veil, an ad, a settle). */
  shown: false,
  /** The last lesson that was retired while it was on screen, and a counter
   *  that grows with each such retirement (the success pop replays). */
  done: '' as FeatureId | '',
  doneN: 0,
  /** An awake enemy is near the hero (the coach writes it): no reveal then. */
  fight: false
})
