import { glitchLicenseReason, glitchLicenseStatus } from '@/use/useGlitchLicense'
import { version } from '@/use/useUser'
import { connectGlitch, newSessionId, sendHeartbeat, type GlitchConnectDeps } from '@/utils/glitchInstall'
import { GlitchStrategy } from '@/utils/save/GlitchStrategy'
import type { SaveStrategy } from '@/utils/save/types'

// ─── Glitch plugin ─────────────────────────────────────────────────────────
//
// Encapsulates everything the game talks to Glitch.fun about:
//
//   1. License validation + payout heartbeat — existing behavior.
//   2. Save API integration — a `GlitchStrategy` that can plug into
//      `SaveManager` so progress persists through Glitch's versioned save
//      slot API.
//
// The save strategy is exposed via `createGlitchSaveStrategy()` so the
// bootstrap code can wire it into `SaveManager` without this module having
// to know about the rest of the app. Returning `null` when config is
// missing means the bootstrap can fall back to localStorage transparently.

const HEARTBEAT_INTERVAL_MS = 60_000

interface GlitchConfig {
  titleId: string
  installId: string
  token: string
}

/**
 * Resolve config from Vite env + URL. Returns `null` if any piece is
 * missing — callers should treat that as "Glitch is not available in
 * this session" and fall back gracefully.
 */
const resolveGlitchConfig = (): GlitchConfig | null => {
  const installId = new URLSearchParams(window.location.search).get('install_id')
  if (!installId) return null

  const isProduction = import.meta.env.VITE_NODE_ENV === 'production'
  const titleId = isProduction
    ? import.meta.env.VITE_APP_GLITCH_INSTALL_ID
    : import.meta.env.VITE_APP_GLITCH_TEST_INSTALL_ID
  const token = import.meta.env.VITE_APP_GLITCH_TOKEN

  if (!titleId || !token) return null
  return { titleId, installId, token }
}

/**
 * Build the save strategy for Glitch. Returns `null` when config is
 * missing so `SaveManager` can use the default localStorage strategy
 * instead of failing opaque network calls on every write.
 */
export const createGlitchSaveStrategy = (): SaveStrategy | null => {
  const cfg = resolveGlitchConfig()
  if (!cfg) return null
  return new GlitchStrategy(cfg)
}

/**
 * Kick off license validation + payout heartbeat. Should be fired early
 * during bootstrap when the build is configured for Glitch. Safe to call
 * when config is missing — license status flips to 'denied' and no
 * network calls happen.
 */
export const glitchPlugin = (): void => {
  const isProduction = import.meta.env.VITE_NODE_ENV === 'production'
  const titleId =
    (isProduction ? undefined : import.meta.env.VITE_APP_GLITCH_TEST_INSTALL_ID) ||
    import.meta.env.VITE_APP_GLITCH_INSTALL_ID
  const token = import.meta.env.VITE_APP_GLITCH_TOKEN
  if (!titleId || !token) {
    console.warn('[Glitch] Missing title id / token — Glitch connection disabled.')
    glitchLicenseReason.value = 'UNAUTHENTICATED'
    glitchLicenseStatus.value = 'denied'
    return
  }

  let storage: Storage | null = null
  try { storage = window.localStorage } catch { /* blocked storage */ }

  const deps: GlitchConnectDeps = {
    titleId,
    token,
    search: new URLSearchParams(window.location.search),
    storage,
    fetch: window.fetch.bind(window),
    gameVersion: version,
    userAgent: navigator.userAgent,
    // The launcher's session id when given, else one per page load.
    sessionId: new URLSearchParams(window.location.search).get('session_id') || newSessionId()
  }

  connectGlitch(deps).then((result) => {
    if (!result.ok) {
      console.warn('[Glitch] Access denied:', result.reason)
      glitchLicenseReason.value = result.reason
      glitchLicenseStatus.value = 'denied'
      return
    }
    glitchLicenseReason.value = null
    glitchLicenseStatus.value = 'ok'
    // Heartbeat = re-post the install under our own user_install_id. Skipped
    // when Glitch asks us to, or when the launcher gave us an install_id
    // without its key (posting a guessed key would register a phantom install).
    const { userInstallId, validation } = result
    if (!userInstallId || validation.disable_playtime_tracking) return
    sendHeartbeat(deps, userInstallId)
    setInterval(() => sendHeartbeat(deps, userInstallId), HEARTBEAT_INTERVAL_MS)
  })
}

export default glitchPlugin
