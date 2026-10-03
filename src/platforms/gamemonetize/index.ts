// ─── GameMonetize platform module ───────────────────────────────────────────
//
// The platform-module DESCRIPTOR the registry enumerates — and nothing else.
//
// It used to be a barrel as well, re-exporting the plugin, the strategy and the
// provider. `src/platforms/index.ts` imports every descriptor statically to
// build `ALL_PLATFORMS`, so a re-export here puts `@/utils/gameMonetizePlugin`
// (and the SDK URL it carries) into every build's module graph, where only
// Rollup's tree-shaking stood between it and the other portals' bundles. The
// implementations are reached through their own paths instead:
// `@/utils/gameMonetizePlugin` (main.ts, lazily), `@/use/ads/GameMonetizeProvider`
// (resolveAdProvider) and `@/utils/save/GameMonetizeStrategy`
// (resolveSaveStrategy), each aliased to a stub on every other build.
//
// GameMonetize is an ad DISTRIBUTION network — the build is embedded across many
// partner sites (and publishers may self-host), so hostname-based site locking
// would block legitimate embeds. The capability resolver therefore renders on
// the build flag alone, with no URL gate (same posture as Playgama).
//
// The SDK (https://api.gamemonetize.com/sdk.js) has no cloud-save / player-data
// API, so persistence is local-only.

export type { PlatformModule } from '../types'

export const platform = {
  id: 'gamemonetize' as const,
  envFlag: 'GAME_MONETIZE',
  capabilities: {
    hasCloudSave: false,             // no GameMonetize player-data API
    hasAds: true,                    // sdk.showBanner (interstitial only)
    hostnameMatcher: 'gamemonetize', // informational only — NO site-lock applied
    portalEnforcesAgeGate: false,
    // No child-directed ad flag on any web portal build (owner decision
    // 2026-10-02): `tagForChildDirectedTreatment` and the like are for the
    // Tauri / app-store builds only. GameMonetize's own SDK takes none.
    childDirectedAdSignal: false,
    needsParentOriginCheck: false    // distribution network — no URL gating
  }
}
