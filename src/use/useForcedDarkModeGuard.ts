// ─── useForcedDarkModeGuard (Vue 3) ─────────────────────────────────────
//
// Module-singleton wrapper around `@/utils/forcedDarkModeGuard`. One watcher
// per page, however many components call the composable. From the
// forced-dark-mode-guard skill; wired here as:
//
//   main.ts            startForcedDarkModeGuard(...) before the app mounts
//   App.vue            <ForcedDarkModeModal />   (mounted unconditionally)
//   ForcedDarkModeModal holds the game (an app-side modal hold) while blocking,
//                      which also keeps the portal gameplay bracket closed
//   useFirstLoadInterstitial  reads `isForcedDarkBlocking` in its own fire
//                      condition: the first-load ad stays ARMED under the
//                      notice and fires once it clears
//
// State model:
//   result          latest DetectionResult from the watcher
//   isBlocking      override live AND the player has not chosen
//                   "Continue at own risk" for that override kind
//   continueAnyway  records the choice for the CURRENT kind only — a
//                   different overrider appearing later re-shows the modal.
//                   Kept in MEMORY for this page load only, never in storage:
//                   CrazyGames QA rejects extra storage keys and YouTube
//                   Playables has no storage. A reload asks again.
//
// Re-check triggers: focus + MutationObserver + matchMedia (no Page
// Visibility; YouTube Playables bans it), plus whatever the host passes as
// `subscribeRecheck`.
//
// Capture seam: `disabled: true` skips the watcher and releases every gate
// at once (main.ts drives it from the dev-only `?darkguard=off`).

import { computed, readonly, shallowRef, type ComputedRef, type Ref } from 'vue'
import {
  applyPreventionOptOuts,
  watchForcedDarkMode,
  type DetectionResult,
  type OverrideKind,
  type WatchOptions
} from '@/utils/forcedDarkModeGuard'

export interface StartOptions extends WatchOptions {
  /** Fired once per override kind per page session, when it is first seen as
   *  live. */
  onDetected?: (r: DetectionResult) => void
  /** Fired when the player picks "Continue at own risk". */
  onContinueAnyway?: (r: DetectionResult) => void
  /** Hard block: never offer "Continue at own risk". Default false. */
  hardBlock?: boolean
  /** Skip detection entirely and release every gate immediately. For
   *  capture/test seams only. */
  disabled?: boolean
}

const EMPTY: DetectionResult = { detected: false, kind: null, confidence: null, browser: 'other', signals: [] }

const result = shallowRef<DetectionResult>(EMPTY)
const continuedKinds = shallowRef<ReadonlySet<OverrideKind>>(new Set())
const hardBlock = shallowRef(false)
const hasFirstVerdict = shallowRef(false)

let stopWatcher: (() => void) | null = null
let opts: StartOptions = {}
const reported = new Set<OverrideKind>()
const clearWaiters: (() => void)[] = []

const isBlocking = computed(() => {
  const r = result.value
  if (!r.detected || !r.kind) return false
  return hardBlock.value || !continuedKinds.value.has(r.kind)
})

/** True while the notice is up. Read it inside a placement's own condition
 *  (`if (isForcedDarkBlocking.value) …`), never as a bare `await` on every
 *  call: that adds a tick to every ad, and in a context where the guard never
 *  started it waits out the 1.5 s first-verdict cap. */
export const isForcedDarkBlocking: ComputedRef<boolean> = isBlocking

function flushWaiters(): void {
  if (!hasFirstVerdict.value || isBlocking.value) return
  clearWaiters.splice(0).forEach(fn => fn())
}

/** Idempotent. Call once, early in main.ts (before mounting is fine). */
export function startForcedDarkModeGuard(options: StartOptions = {}): void {
  if (stopWatcher || typeof window === 'undefined') return
  opts = options
  hardBlock.value = !!options.hardBlock
  applyPreventionOptOuts()
  if (options.disabled) {
    stopWatcher = () => {}
    hasFirstVerdict.value = true
    flushWaiters()
    return
  }
  stopWatcher = watchForcedDarkMode(r => {
    result.value = r
    hasFirstVerdict.value = true
    if (r.detected && r.kind && !reported.has(r.kind)) {
      reported.add(r.kind)
      try { opts.onDetected?.(r) } catch (e) { console.warn('[forced-dark-guard] onDetected threw', e) }
    }
    flushWaiters()
  }, options)
}

export function stopForcedDarkModeGuard(): void {
  stopWatcher?.()
  stopWatcher = null
}

/**
 * Resolves once the guard has a verdict and nothing is blocking.
 * `maxWaitMs` caps only the wait for the FIRST verdict (a detector that never
 * answers must not hold the game hostage); a live block always waits.
 */
export function whenForcedDarkGuardClear(maxWaitMs = 1500): Promise<void> {
  return new Promise(resolve => {
    clearWaiters.push(resolve)
    flushWaiters()
    setTimeout(() => {
      if (!hasFirstVerdict.value) { hasFirstVerdict.value = true; flushWaiters() }
    }, maxWaitMs)
  })
}

export interface ForcedDarkModeGuard {
  result: Readonly<Ref<DetectionResult>>
  isBlocking: ComputedRef<boolean>
  canContinueAnyway: ComputedRef<boolean>
  continueAnyway: () => void
}

export function useForcedDarkModeGuard(): ForcedDarkModeGuard {
  return {
    result: readonly(result) as Readonly<Ref<DetectionResult>>,
    isBlocking,
    canContinueAnyway: computed(() => !hardBlock.value),
    continueAnyway: () => {
      const r = result.value
      if (hardBlock.value || !r.kind) return
      // In memory only (this page load): see the header on why not storage.
      continuedKinds.value = new Set([...continuedKinds.value, r.kind])
      try { opts.onContinueAnyway?.(r) } catch { /* noop */ }
      flushWaiters()
    }
  }
}

/** Test seam: forget the verdict, the choices and the watcher. */
export function __resetForcedDarkModeGuard(): void {
  stopForcedDarkModeGuard()
  result.value = EMPTY
  continuedKinds.value = new Set()
  hardBlock.value = false
  hasFirstVerdict.value = false
  reported.clear()
  clearWaiters.splice(0)
  opts = {}
}
