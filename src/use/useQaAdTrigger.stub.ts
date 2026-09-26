// ─── useQaAdTrigger no-op stub (Poki release build) ──────────────────────────
//
// Replaces `@/use/useQaAdTrigger` via `resolve.alias` in `vite.config.ts`
// whenever `platformPolicy.devTools` is false — today, the Poki release.
//
// The real module is a hidden back door: thirty taps on the bolts counter
// request an interstitial, bypassing the pacing gate. No Poki skill or
// requirement endorses such a trigger, Poki asks for a clean build with no
// debug code, and an interstitial a player can summon mid-run is not a
// `commercialBreak()` at a natural break. So the Poki release ships this no-op;
// a QA twin built with `VITE_POKI_QA_TOOLS=true` keeps the real trigger for
// proving ads in the Inspector (and fails the release gates by design).
//
// Must mirror the real module's export surface.

export const QA_AD_TAPS = 30
export const QA_AD_WINDOW_MS = 30_000

export const __resetQaAdTaps = (): void => {}

export const registerQaAdTap = (_now?: number): boolean => false
