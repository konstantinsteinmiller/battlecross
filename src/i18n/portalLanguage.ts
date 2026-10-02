// ─── A portal language CHANGE outranks the player's stored choice ───────────
//
// The Playgama build's language contract (portal-platform-signals):
//
//   • the portal language is APPLIED, never persisted into the player's own
//     language key — platform state is not player state;
//   • a language the player picked in Options wins while the portal language
//     is STEADY — every load re-reports the same portal value, and it must not
//     knock the player out of their own choice;
//   • but a portal language that CHANGED since this device last saw it
//     outranks that choice. Playgama QA's localization flow is exactly this:
//     pick a language in-game, switch the platform language in the QA Tool —
//     which re-initialises the Bridge WITHOUT reloading the frame — and the UI
//     must follow. "Player choice always wins" fails it ("the platform signal
//     to change the locale did not have any effect", filed against a sibling
//     game), which is why the two rules ship together.
//
// The last-seen marker is DEVICE-LOCAL on purpose: it lives beside the save,
// never inside it (`bc_*` keys are folded into the synced state blob). A
// second device on another portal language must not read as a switch. On
// YouTube Playables Web Storage is null and the storage shim holds it in
// memory, which still catches the in-session switch — and the module keeps
// its own copy for a runtime with no storage at all.

import { safeGetItem, safeSetItem } from '@/utils/safeStorage'
import { isSupportedLocale } from '@/i18n'

/** Device-local marker: the portal language this device saw last. Not an
 *  `bc_*` key — those belong to the synced save blob. */
export const PORTAL_LANGUAGE_SEEN_KEY = 'portal_lang_seen'

let seenThisSession: string | null = null

/**
 * Record `code` as the portal language seen now, and report whether it is a
 * CHANGE from the one seen before (on this device, or earlier this session).
 *
 * `false` on the first observation — no previous value means nothing changed,
 * so shipping this never costs a returning player their choice. Idempotent:
 * re-noting the value just recorded reports no change, so the boot read and
 * the live watcher can both call it.
 */
export const notePortalLanguageChange = (code: string): boolean => {
  const previous = safeGetItem(PORTAL_LANGUAGE_SEEN_KEY) ?? seenThisSession
  seenThisSession = code
  if (previous !== code) safeSetItem(PORTAL_LANGUAGE_SEEN_KEY, code)
  return isSupportedLocale(previous) && previous !== code
}

export interface PortalLanguageTarget {
  /** Did the PLAYER pick a language (in Options)? */
  hasChoice: () => boolean
  /** Forget that choice — without persisting the portal value in its place. */
  clearChoice: (portalCode: string) => void
  /** Show the game in this language (never persists it). */
  apply: (code: string) => void
}

/**
 * Follow the portal language: applied while the player has no choice of their
 * own, and a portal CHANGE clears that choice first. Unsupported and empty
 * values are ignored — an unshipped portal language must never knock the
 * player out of the language they are playing in.
 */
export const followPortalLanguage = (code: string | null | undefined, target: PortalLanguageTarget): void => {
  if (!code || !isSupportedLocale(code)) return
  if (notePortalLanguageChange(code) && target.hasChoice()) target.clearChoice(code)
  if (target.hasChoice()) return
  target.apply(code)
}

/** Test seam: forget the in-session marker. */
export const __resetPortalLanguageMarker = (): void => { seenThisSession = null }
