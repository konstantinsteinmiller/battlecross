/**
 * ─── The background loads, after the first frame (roadmap #142) ─────────────
 *
 * What the first scene does not show (the screens' chunks, the town's code
 * in a field, the English fallback of a translated game) used to be started
 * on timers 1.5–2.5 s after the scene was up: some 36 requests and their
 * parse at once, inside the player's first fight. Here they wait in ONE
 * queue instead:
 *
 *   - nothing runs before `startIdleQueue()` (the scene calls it once its
 *     first frame is painted), so none of it competes with the boot;
 *   - two tasks at a time (a round trip, not the bandwidth, is what a chunk
 *     waits on: one at a time over a phone's 150 ms link stretched the screens
 *     over ~5 s and slowed the image drip beside them), each started in an
 *     idle period (`requestIdleCallback`, so a busy main thread holds the
 *     queue), with a short gap after each so parses never chain into one long
 *     task;
 *   - in the order of where the player is likely to go next: `idleTask` takes
 *     a rank (lower first) and a place change re-ranks what is still waiting;
 *   - `idleNow(key)` jumps the queue (a window about to open) and returns the
 *     task's promise, so a caller can wait on it;
 *   - a QUIET task (`{ quiet: true }`: the early art, D149) waits for an idle
 *     connection too: it runs alone, one after another, only while no other
 *     task is in flight and nothing has finished downloading for `QUIET_MS`;
 *     a plain task of a worse rank may go ahead of it meanwhile.
 *
 * Each task is a load that is cached on its own (a dynamic import, a warmed
 * image), so running one early, twice or late is always safe. A task that
 * fails is dropped: the window that needs it loads it again when it opens.
 */

type Task = { key: string; rank: number; seq: number; run: () => Promise<unknown>; quiet: boolean }

const waiting = new Map<string, Task>()
const finished = new Map<string, Promise<void>>()
let started = false
let busy = 0
let seq = 0
let timer: ReturnType<typeof setTimeout> | null = null
let idleHandle: number | null = null

/** Loads in flight at once. */
const LANES = 2
/** The pause after a task (ms): lets a frame through between parses. */
const GAP_MS = 60
/** Longest an idle period is waited for before a task runs anyway (ms). */
const IDLE_TIMEOUT_MS = 2500
/** A quiet connection: nothing finished downloading for this long (ms). */
const QUIET_MS = 250
/** How often a waiting quiet task looks again (ms). */
const QUIET_POLL_MS = 200

/** When the page last finished downloading something (performance.now()). */
let lastNet = -Infinity
let netWatch: PerformanceObserver | null = null
const watchNet = (): void => {
  if (netWatch || typeof PerformanceObserver === 'undefined') return
  try {
    netWatch = new PerformanceObserver((l) => {
      for (const e of l.getEntries()) lastNet = Math.max(lastNet, (e as PerformanceResourceTiming).responseEnd || e.startTime + e.duration)
    })
    netWatch.observe({ type: 'resource', buffered: true })
  } catch { netWatch = null }
}
/** Is the connection quiet: no task of ours in flight, nothing landed lately? */
const netQuiet = (): boolean =>
  busy === 0 && (typeof performance === 'undefined' || performance.now() - lastNet >= QUIET_MS)

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
  cancelIdleCallback?: (h: number) => void
}

const execute = (t: Task): Promise<void> => {
  waiting.delete(t.key)
  const p = Promise.resolve().then(t.run).then(() => {}, () => { finished.delete(t.key) })
  finished.set(t.key, p)
  return p
}

const next = (quietOk: boolean): Task | undefined => {
  let best: Task | undefined
  for (const t of waiting.values()) {
    if (t.quiet && !quietOk) continue
    if (!best || t.rank < best.rank || (t.rank === best.rank && t.seq < best.seq)) best = t
  }
  return best
}

const schedule = (): void => {
  if (!started || busy >= LANES || timer !== null || idleHandle !== null || waiting.size === 0) return
  const w = (typeof window !== 'undefined' ? window : undefined) as IdleWindow | undefined
  const go = (): void => {
    idleHandle = null
    timer = null
    const t = next(netQuiet())
    if (!t) {
      // Only quiet tasks wait: look again once the connection may have calmed.
      if (busy === 0 && waiting.size > 0) timer = setTimeout(() => { timer = null; schedule() }, QUIET_POLL_MS)
      return
    }
    busy++
    void execute(t).then(() => { setTimeout(() => { busy--; schedule() }, GAP_MS) })
    // The second lane opens in the next idle period.
    schedule()
  }
  if (w?.requestIdleCallback) idleHandle = w.requestIdleCallback(go, { timeout: IDLE_TIMEOUT_MS })
  else timer = setTimeout(go, 50)
}

/**
 * Queue a background load under `key` (once: a key already waiting only takes
 * the better of the two ranks; one already run is not queued again).
 */
export const idleTask = (key: string, run: () => Promise<unknown>, rank = 50, o: { quiet?: boolean } = {}): void => {
  if (finished.has(key)) return
  const had = waiting.get(key)
  if (had) { had.rank = Math.min(had.rank, rank); return }
  if (o.quiet) watchNet()
  waiting.set(key, { key, rank, seq: seq++, run, quiet: !!o.quiet })
  schedule()
}

/** Re-rank what is still waiting (a new place: its own likely next steps). */
export const rerankIdle = (ranks: Record<string, number>): void => {
  for (const [k, r] of Object.entries(ranks)) {
    const t = waiting.get(k)
    if (t) t.rank = r
  }
}

/** Run the task now, ahead of the queue; resolves when it is done (at once
 *  for an unknown key). */
export const idleNow = (key: string): Promise<void> => {
  const done = finished.get(key)
  if (done) return done
  const t = waiting.get(key)
  return t ? execute(t) : Promise.resolve()
}

/** The first frame is up: the queue may start. */
export const startIdleQueue = (): void => {
  if (started) return
  started = true
  schedule()
}

/** Test seams. */
export const idleWaiting = (): string[] => [...waiting.values()].sort((a, b) => a.rank - b.rank || a.seq - b.seq).map(t => t.key)
export const __resetIdleQueue = (): void => {
  const w = (typeof window !== 'undefined' ? window : undefined) as IdleWindow | undefined
  if (idleHandle !== null) w?.cancelIdleCallback?.(idleHandle)
  if (timer !== null) clearTimeout(timer)
  waiting.clear()
  finished.clear()
  started = false
  busy = 0
  timer = null
  idleHandle = null
  lastNet = -Infinity
}
