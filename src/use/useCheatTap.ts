import { openCheatMenu } from '@/use/useCheatWord'

/**
 * The cheat menu's phone door: fifty taps on the health bar inside forty seconds (a phone has no keyboard for "cmonc"). Silent,
 * like the QA ad tap: no counter, no toast. The window rolls: a pause longer than it drops the taps before it, so the count
 * restarts, and nobody reaches fifty by accident.
 */
export const CHEAT_TAPS = 50
export const CHEAT_WINDOW_MS = 40_000

let taps: number[] = []

/** Test seam: forget every recorded tap. */
export const __resetCheatTaps = (): void => { taps = [] }

/** One tap on the health bar. Returns whether it opened the menu. `now` is injectable for tests. */
export const registerCheatTap = (now: number = Date.now()): boolean => {
  taps.push(now)
  const cutoff = now - CHEAT_WINDOW_MS
  if (taps[0]! <= cutoff) taps = taps.filter(t => t > cutoff)
  if (taps.length < CHEAT_TAPS) return false
  taps = []
  openCheatMenu()
  return true
}
