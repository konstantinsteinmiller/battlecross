import { reactive } from 'vue'

/**
 * ─── The hero choice (roadmap #71) ───────────────────────────────────────────
 *
 * A brand-new save picks the boy hero or the girl hero before the first fight
 * moves: no main menu, the plains already on screen behind two painted
 * portraits, one tap. `components/screens/hero/HeroChoice.vue` draws it; this
 * module holds the rule for WHEN, pure so it can be tested, and the one flag
 * the rest of the game may read while it is up.
 *
 * While it is up the game holds still (it takes the modal pause), which also
 * keeps the portals' gameplay bracket closed: nothing is "played" before the
 * pick. It waits for:
 *   · the loader to be gone (the scene is the backdrop, not the splash);
 *   · an ad on screen (GameMonetize's first-load interstitial fires when the
 *     splash leaves: the ad first, then the choice);
 *   · the forced-dark-mode notice, which also blocks the start.
 */

/** Read by the lessons' pacing (`coach/onboarding.ts` `blocked()`): true while
 *  the choice is on screen, so no lesson starts under it. */
export const heroChoice = reactive({ open: false })

export interface HeroChoiceGate {
  /** `needsHeroChoice()`: a brand-new save that has not picked. */
  needs: boolean
  screen: string
  node: string
  /** A place is being built behind the veil. */
  loading: boolean
  /** The loader and its backdrop have left. */
  splashGone: boolean
  adShowing: boolean
  /** The forced-dark-mode notice is up. */
  darkBlocking: boolean
}

/** Is the choice owed now (the opening fight of a new save is the scene)? */
export const heroChoiceDue = (g: HeroChoiceGate): boolean =>
  g.needs && g.screen === 'zone' && g.node === 'plains' && !g.loading

/** Is it on screen? Owed, and nothing else has the player. */
export const heroChoiceShown = (g: HeroChoiceGate): boolean =>
  heroChoiceDue(g) && g.splashGone && !g.adShowing && !g.darkBlocking
