/**
 * ─── Lost input → let go ─────────────────────────────────────────────────────
 *
 * iOS (an installed PWA above all) swallows the pointerup / touchend of a finger
 * that was down when a system gesture, a notification or an app switch took
 * over. A stick that only lets go on its own pointerup then keeps its last push
 * and the hero walks into a corner until the app is restored.
 *
 * `watchLostInput` calls `releaseAll` whenever the page loses the player (blur,
 * hidden, pagehide, orientation change) and `releaseTouches` when the viewport
 * resizes or the browser's own touch list says fewer fingers are on the glass
 * than the caller holds. On a touch END the check waits a task, since the
 * matching pointerup (which turns a press into a tap) is dispatched around it.
 */

export interface LostInputHooks {
  /** Drop everything held: keys, sticks, presses. */
  releaseAll: () => void
  /** Drop the held touch pointers only. */
  releaseTouches: () => void
  /** How many touch pointers the caller believes are down. */
  heldTouches: () => number
}

export const watchLostInput = (h: LostInputHooks): (() => void) => {
  let settle: ReturnType<typeof setTimeout> | null = null

  const onVisibility = () => {
    if (document.visibilityState === 'hidden') h.releaseAll()
  }

  const onTouchList = (e: TouchEvent) => {
    if (e.type === 'touchend' || e.type === 'touchcancel') {
      if (e.touches.length > 0) return
      if (settle !== null) clearTimeout(settle)
      settle = setTimeout(() => {
        settle = null
        if (h.heldTouches() > 0) h.releaseTouches()
      }, 0)
      return
    }
    // Fewer fingers than held pointers: one end went missing (which one is
    // unknowable), so let go of all and let the live finger re-grab.
    if (h.heldTouches() > e.touches.length) h.releaseTouches()
  }

  const touchTypes = ['touchstart', 'touchmove', 'touchend', 'touchcancel'] as const
  window.addEventListener('blur', h.releaseAll)
  window.addEventListener('pagehide', h.releaseAll)
  window.addEventListener('orientationchange', h.releaseAll)
  window.addEventListener('resize', h.releaseTouches)
  document.addEventListener('visibilitychange', onVisibility)
  for (const t of touchTypes) window.addEventListener(t, onTouchList, { capture: true, passive: true })

  return () => {
    window.removeEventListener('blur', h.releaseAll)
    window.removeEventListener('pagehide', h.releaseAll)
    window.removeEventListener('orientationchange', h.releaseAll)
    window.removeEventListener('resize', h.releaseTouches)
    document.removeEventListener('visibilitychange', onVisibility)
    for (const t of touchTypes) window.removeEventListener(t, onTouchList, { capture: true })
    if (settle !== null) clearTimeout(settle)
  }
}
