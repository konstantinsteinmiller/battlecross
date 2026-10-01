/**
 * ─── The lights go out on a clock ────────────────────────────────────────────
 *
 * A stage that goes dark in pulses (the Blackout Boulevard, #110) runs this
 * clock: a WARNING (the lights dip twice and a power-down whine plays), the
 * DARK, then the LIGHT, which is always the longest part so a crossing never
 * has to be made blind. Every change of brightness is a FADE_S ramp, and the
 * warning dips are at most two in a second — under the three-flashes-a-second
 * line photosensitivity guidance draws.
 *
 * Pure: the level of darkness is a function of the mission clock, so a reload
 * or a retry lands in the same place of the cycle and a test can sweep it.
 */

export interface PulseSpec {
  /** One whole cycle (s). */
  period: number
  /** The warning before the dark (s). */
  warn: number
  /** How long it stays dark (s). */
  dark: number
  /** Shifts this stage's cycle on the mission clock (s). */
  phase: number
}

export const BLACKOUT: PulseSpec = { period: 9, warn: 1, dark: 2, phase: 0 }

/** Fade time of every change of brightness (s). */
export const FADE_S = 0.2
/** How deep a warning dip goes (0..1 of the full dark). */
const DIP = 0.45

export interface PulseState {
  /** 0 = full light, 1 = full dark. */
  dark01: number
  /** In the warning beat (the dips, the whine). */
  warning: boolean
  /** Dark enough that a pulse-bridge is gone. */
  out: boolean
  /** Seconds into the cycle (0 = the warning starts). */
  u: number
}

const ramp = (x: number): number => Math.max(0, Math.min(1, x / FADE_S))

/** Where `time` falls in the cycle. */
export const pulseAt = (time: number, s: PulseSpec = BLACKOUT): PulseState => {
  const c = ((time + s.phase) % s.period + s.period) % s.period
  if (c < s.warn) {
    // Two dips, each a fade down and back up, evenly in the warning.
    const half = s.warn / 2
    const k = c % half
    const dip = Math.min(ramp(k), ramp(half - k)) * DIP
    return { dark01: dip, warning: true, out: false, u: c }
  }
  const inDark = c - s.warn
  if (inDark < s.dark) {
    // Fades in, holds, and fades back out at the end.
    const d = Math.min(ramp(inDark), ramp(s.dark - inDark))
    return { dark01: d, warning: false, out: inDark >= FADE_S * 0.5 && inDark <= s.dark - FADE_S * 0.5, u: c }
  }
  return { dark01: 0, warning: false, out: false, u: c }
}

/** The light part of the cycle: the time a crossing has (s). */
export const lightWindow = (s: PulseSpec = BLACKOUT): number => s.period - s.warn - s.dark
