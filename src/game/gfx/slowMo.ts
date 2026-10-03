/**
 * ─── The level-up slow-motion (roadmap #6) ───────────────────────────────────
 *
 * A level gained mid-fight holds the moment for about a second: the world
 * eases down to a third of its speed, hangs there while the light goes up,
 * and eases back. A view-side time scale like the hit-stop — the sim just
 * takes smaller steps, so nothing it decides depends on it.
 */

/** How long the whole beat lasts (real seconds). */
export const SLOW_MO = 1
/** The slowest the world runs inside it. */
export const SLOW_MO_FLOOR = 0.3

const smooth = (k: number): number => k * k * (3 - 2 * k)

/** The world's speed `t` seconds into the beat (1 outside it). */
export const slowMoScale = (t: number): number => {
  if (t <= 0 || t >= SLOW_MO) return 1
  const k = t / SLOW_MO
  if (k < 0.12) return 1 - (1 - SLOW_MO_FLOOR) * smooth(k / 0.12)
  if (k < 0.55) return SLOW_MO_FLOOR
  return SLOW_MO_FLOOR + (1 - SLOW_MO_FLOOR) * smooth((k - 0.55) / 0.45)
}
