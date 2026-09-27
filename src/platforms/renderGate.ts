// ─── The render gate: may this build show the game here? ────────────────────
//
// `App.vue`'s per-platform render fork, as one composable: whether the game
// renders at all (a site-locked portal build refuses a foreign host), whether
// a portal licence said no, and the "only available on …" fallback copy.
//
// ONE portal short-circuits it at build time: Playgama. Its Technical
// Requirements forbid runtime URL gating ("the game does not include any
// technical means of limiting its operation due to the URL it is opened
// from"), so there is nothing to decide — the game always renders. Deciding it
// anyway would ship the flag and gate name of EVERY other portal into the one
// archive that must name only Playgama (it is also the YouTube Playables
// submission; `tools/playgama-release/gates.mjs` refuses those strings). The
// `import.meta.env` literal folds at build time, so on that build the resolver
// arm, its flag object and `resolveCapabilities` all drop out of the bundle.

import { computed, type ComputedRef } from 'vue'
import { isCrazyWeb, isWaveDash, isItch, isGlitch, isGameDistribution, isPlaygama, isGamepix, isGameMonetize, isYandex, isPoki } from '@/use/useUser'
import { glitchLicenseStatus } from '@/use/useGlitchLicense'
import { resolveCapabilities } from './capabilities'
import { getPlattformText } from './plattformText'

export interface RenderGate {
  /** Render the game. */
  isGameShowAllowed: ComputedRef<boolean>
  /** A portal licence check refused this player (Glitch). */
  isLicenseDenied: ComputedRef<boolean>
  /** Show the "only available on …" copy instead of the game. */
  showOnlyAvailableText: ComputedRef<boolean>
  /** Where the game IS available, for that copy. */
  plattformText: ComputedRef<string>
}

// Capability gates — single source of truth lives in `./capabilities`.
// `parentOrigin` is the iframe parent's origin (only meaningful for Glitch,
// where the game runs on a CDN iframe-embedded into glitch.fun).
const resolvedRenderGate = (): RenderGate => {
  const hostname = window.location.hostname
  const parentOrigin = window.location.ancestorOrigins?.[0] ?? document.referrer ?? ''
  const platformFlags = {
    isCrazyWeb, isWaveDash, isItch, isGlitch, isGameDistribution, isPlaygama, isGamepix, isGameMonetize, isYandex, isPoki
  }
  const capabilities = computed(() => resolveCapabilities({
    flags: platformFlags,
    hostname,
    parentOrigin,
    glitchLicenseStatus: glitchLicenseStatus.value
  }))
  return {
    isGameShowAllowed: computed(() =>
      capabilities.value.allowedToShowOnCrazyGames ||
      capabilities.value.allowedToShowOnWaveDash ||
      capabilities.value.allowedToShowOnItch ||
      capabilities.value.allowedToShowOnGlitch ||
      capabilities.value.allowedToShowOnGameDistribution ||
      capabilities.value.allowedToShowOnPlaygama ||
      capabilities.value.allowedToShowOnGamepix ||
      capabilities.value.allowedToShowOnGameMonetize ||
      capabilities.value.allowedToShowOnYandex ||
      capabilities.value.allowedToShowOnPoki ||
      location.hostname.includes('localhost')
    ),
    isLicenseDenied: computed(() => capabilities.value.isGlitchDenied),
    showOnlyAvailableText: computed(() => capabilities.value.showOnlyAvailableText),
    // Sourced from `./plattformText` — that file is in the obfuscator's exclude
    // list so its env-literal ladder DCEs cleanly per build and only the active
    // build's hostname survives in the bundle. See the comment there.
    plattformText: computed(() => getPlattformText())
  }
}

/** The render gate for THIS build. Call once, from `App.vue`'s setup. */
export const useRenderGate = (): RenderGate =>
  import.meta.env.VITE_APP_PLAYGAMA === 'true'
    ? {
        isGameShowAllowed: computed(() => true),
        isLicenseDenied: computed(() => false),
        showOnlyAvailableText: computed(() => false),
        plattformText: computed(() => '')
      }
    : resolvedRenderGate()
