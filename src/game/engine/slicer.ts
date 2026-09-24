/**
 * ─── Time slicing for heavy builds ───────────────────────────────────────────
 *
 * Building a sector (level meshes, a dozen rigged machines) is a few hundred
 * milliseconds of pure JS on a desktop and several times that on a phone. Run
 * as one task it freezes the loading bar, the portal's own UI and every input
 * for its whole length. `await slice()` inside the long loops hands the thread
 * back to the browser whenever the budget is spent, so the loader keeps
 * painting while the level is built behind it.
 *
 * The budget is measured on the WALL CLOCK. Idle deadlines are a trap: a
 * `requestIdleCallback` that fires through its timeout reports zero time
 * remaining, so a deadline-driven loop crawls on exactly the busy phones this
 * exists for.
 *
 * The yield is `scheduler.yield()` where it exists, else a MessageChannel
 * task, never a timer: timers are clamped (4 ms nested, 1 s in a background
 * tab), and a player who switches tabs while the level loads must not come
 * back to a build that has barely moved.
 */

export type Slice = () => Promise<void> | void

type YieldingScheduler = { yield?: () => Promise<void> }

/** Give the browser a turn: render a frame, run input, then continue. */
export const yieldToBrowser = (): Promise<void> => {
  const s = (globalThis as { scheduler?: YieldingScheduler }).scheduler
  if (s?.yield) return s.yield()
  return new Promise((resolve) => {
    const ch = new MessageChannel()
    ch.port1.onmessage = () => resolve()
    ch.port2.postMessage(null)
  })
}

/**
 * A slice gate: returns nothing (keep going) while the budget lasts, and a
 * promise that yields once it is spent. Call it often; it is one clock read.
 */
export const createSlicer = (budgetMs = 12): Slice => {
  let start = performance.now()
  return () => {
    if (performance.now() - start < budgetMs) return
    return yieldToBrowser().then(() => { start = performance.now() })
  }
}

/** For callers that build synchronously on purpose (tests, tools). */
export const noSlice: Slice = () => {}

/**
 * Resolve once the page has painted a frame, so whatever feedback was just
 * put up (a loader, a transition) is ON SCREEN before heavy work starts.
 * Capped: a tab in the background gets no frames and must not stall.
 */
export const afterPaint = (capMs = 120): Promise<void> => new Promise((resolve) => {
  let done = false
  const go = () => { if (!done) { done = true; resolve() } }
  requestAnimationFrame(() => setTimeout(go, 0))
  setTimeout(go, capMs)
})
