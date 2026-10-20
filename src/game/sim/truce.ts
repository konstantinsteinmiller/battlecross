import type { Sim } from './world'

/**
 * ─── The truce of a conversation (roadmap #153) ──────────────────────────────
 *
 * While the hero is in a conversation his input is locked, so the world must
 * not hurt him either: he is out of everyone's reach (`outOfReach`), no foe
 * picks him or wakes on him, and nothing a foe casts lands. The scene sets it
 * when a conversation starts and lifts it when it ends (`ZoneMode.setTalk`).
 *
 * A truce that outlived its conversation would be a god mode, so a watchdog
 * looks every `TRUCE_CHECK` seconds: a hero under a truce with no conversation
 * or window open has it lifted.
 */

/** Seconds between the watchdog's looks. */
export const TRUCE_CHECK = 3

export const setTruce = (sim: Sim, on: boolean): void => {
  const u = sim.hero?.unit
  if (!u) return
  if (on) u.truce = true
  else delete u.truce
}

export const inTruce = (sim: Sim): boolean => !!sim.hero?.unit.truce

/** The watchdog's clock (one per scene). */
export interface TruceWatch { t: number }

/**
 * One step of the watchdog. `menuOpen`: a conversation or a window is up.
 * True when it had to lift a truce that had stuck.
 */
export const watchTruce = (sim: Sim, w: TruceWatch, dt: number, menuOpen: boolean): boolean => {
  w.t += dt
  if (w.t < TRUCE_CHECK) return false
  w.t = 0
  if (!inTruce(sim) || menuOpen) return false
  setTruce(sim, false)
  console.warn('[truce] the hero was still untouchable with no conversation open: lifted')
  return true
}
