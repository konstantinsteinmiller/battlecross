import { vi } from 'vitest'

/**
 * ─── Never drop a `useGameState` instance with a save still armed ───────────
 *
 * `useGameState` persists on a DEBOUNCE: `setState` arms a 200 ms `setTimeout`
 * that writes the blob to whatever `localStorage` is installed when it fires.
 * `vi.resetModules()` drops the module but not the timer, and
 * `tests/save/setup.ts` installs a fresh storage before every case — so a write
 * armed in one case can land in a LATER case's storage, right before that
 * case's fresh `useGameState` reads it. Whether it does is timing: the victim
 * only boots with another case's data when its own setup yields long enough
 * (an awaited `vi.doMock`/`importOriginal`, a slow import on a loaded machine).
 * That is how `leaderboardOffline` went flaky in full-suite runs.
 *
 * The cure is what a real page does on `pagehide`: flush before the instance
 * is dropped. Three calls, used together:
 *
 *   • `holdGameState()` — after (re)loading modules: the instance the modules
 *     under test write through (same registry, so the very same one).
 *   • `drainAndResetModules()` — in place of `vi.resetModules()`.
 *   • `drainPersist()` — first thing in `afterEach`, while the case's own
 *     storage is still the one installed.
 *
 * Always drain a HELD instance. A fresh `await import('@/use/useGameState')`
 * at the start of a case would still get the PREVIOUS case's instance from the
 * registry, and flushing that writes the previous case's blob into this case's
 * storage — the leak, made certain.
 */

type GameStateModule = typeof import('@/use/useGameState')

const held = new Set<GameStateModule>()

/** The `useGameState` instance in the CURRENT module registry, held until the
 *  next drain. */
export const holdGameState = async (): Promise<GameStateModule> => {
  const mod = await import('@/use/useGameState')
  held.add(mod)
  return mod
}

/** Flush every held instance's pending write into the storage installed NOW
 *  (which cancels its timer), then let go of it. */
export const drainPersist = (): void => {
  for (const mod of held) mod.flushPersist()
  held.clear()
}

/** `vi.resetModules()`, minus the armed write it would otherwise orphan. */
export const drainAndResetModules = (): void => {
  drainPersist()
  vi.resetModules()
}
