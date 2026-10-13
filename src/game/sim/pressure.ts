import type { Unit } from './types'
import type { Sim } from './world'

/**
 * ─── Adaptive pressure (roadmap #124, D144) ──────────────────────────────────
 *
 * A hero having no trouble at all is pushed a little harder. Every minute of
 * fight time in a zone (never in a town, never in the colosseum, never in the
 * opening fight; a paused game does not step the sim) the last minute is
 * judged:
 *
 *   - the hero fought (dealt damage), drank no health potion and lost less
 *     than `EASY_LOST` of his health → one step up;
 *   - a potion drunk → no step up; potions in two minutes running, or a hard
 *     minute (more than `HEAVY_LOST` lost, or down below `LOW_HP`) → one step
 *     down;
 *   - anything else → it holds.
 *
 * A step is `STEP` more enemy health and damage (additive), up to `CAP`; in a
 * zone `OVER_LEVEL` or more levels above the hero, twice that (`STEP_OVER`,
 * `CAP_OVER`). Bosses take half the bonus. It lives for the session, across
 * visits (`sessionPressure`), not in the save; a defeat puts it back to 0.
 * The careful clear (#113) measures the same health lost, so a harder hunt
 * is harder to clear carefully — and pays nothing extra.
 */

export const WINDOW = 60
export const STEP = 0.1
export const CAP = 0.6
export const STEP_OVER = 0.2
export const CAP_OVER = 1.2
export const OVER_LEVEL = 5
export const EASY_LOST = 0.1
export const HEAVY_LOST = 0.5
export const LOW_HP = 0.25
/** Share of the bonus a boss takes. */
export const BOSS_SHARE = 0.5

export interface PressureState {
  /** The extra enemy health and damage now (0 = as designed). */
  bonus: number
  /** Fight time into this window. */
  t: number
  /** The hero's `lost` and `dealt` when the window opened. */
  lost0: number
  dealt0: number
  /** Health potions drunk in this window; whether the last window had any. */
  potions: number
  lastPotion: boolean
  /** Lowest health share seen in this window. */
  low: number
}

/** The session's level, carried from visit to visit (a defeat clears it). */
let session = 0
export const sessionPressure = (): number => session
export const setSessionPressure = (bonus: number): void => { session = Math.max(0, bonus) }

export const newPressure = (bonus = 0): PressureState =>
  ({ bonus, t: 0, lost0: 0, dealt0: 0, potions: 0, lastPotion: false, low: 1 })

/** Skull pips for a bonus (one per normal step). */
export const pressurePips = (bonus: number): number => Math.round(bonus / STEP)

/** The multiplier a unit of this rank takes from a bonus. */
export const pressureMul = (bonus: number, boss: boolean): number => 1 + bonus * (boss ? BOSS_SHARE : 1)

/** Is the zone 5+ levels above the hero? */
const overLevel = (sim: Sim): boolean => sim.level - sim.hero.level >= OVER_LEVEL

export type Verdict = 'up' | 'down' | 'hold'

/** Judge one window (pure: the rules above). */
export const judge = (o: { lostShare: number; low: number; potions: number; lastPotion: boolean; fought: boolean }): Verdict => {
  const heavy = o.lostShare > HEAVY_LOST || o.low < LOW_HP
  if (o.potions > 0) return o.lastPotion || heavy ? 'down' : 'hold'
  if (heavy) return 'down'
  return o.fought && o.lostShare < EASY_LOST ? 'up' : 'hold'
}

/** Rescale a living enemy from one bonus to another: its share of health is kept. */
const rescale = (u: Unit, from: number, to: number): void => {
  const boss = u.rank === 'boss'
  const k = pressureMul(to, boss) / pressureMul(from, boss)
  const share = u.hp / u.s.maxHp
  u.s.maxHp = Math.max(1, Math.round(u.s.maxHp * k))
  u.hp = Math.max(1, u.s.maxHp * share)
  u.s.baseDmg *= k
}

/** A health potion drunk (the hero's `usePotion`). */
export const notePotion = (sim: Sim): void => { if (sim.pressure) sim.pressure.potions++ }

/** One step of fight time: watch the hero, judge each minute. */
export const stepPressure = (sim: Sim, dt: number): void => {
  const p = sim.pressure
  const h = sim.hero
  if (!p || !h || sim.ended || sim.mode !== 'zone' || !h.unit.alive) return
  p.low = Math.min(p.low, h.unit.hp / h.unit.s.maxHp)
  p.t += dt
  if (p.t < WINDOW) return
  const v = judge({
    lostShare: (h.lost - p.lost0) / h.unit.s.maxHp, low: p.low, potions: p.potions, lastPotion: p.lastPotion, fought: h.dealt > p.dealt0
  })
  const over = overLevel(sim)
  const step = over ? STEP_OVER : STEP
  const cap = over ? CAP_OVER : CAP
  const from = p.bonus
  // Above the cap (carried in from a harder place) it never climbs, only falls.
  const to = v === 'up' ? Math.max(from, Math.min(cap, from + step)) : v === 'down' ? Math.max(0, from - step) : from
  p.lastPotion = p.potions > 0
  p.t = 0
  p.potions = 0
  p.low = h.unit.hp / h.unit.s.maxHp
  p.lost0 = h.lost
  p.dealt0 = h.dealt
  if (Math.abs(to - from) < 1e-9) return
  p.bonus = Math.round(to * 100) / 100
  for (const u of sim.units) if (u.alive && u.team === 1) rescale(u, from, p.bonus)
  sim.emit({ t: 'pressure', up: to > from, pips: pressurePips(p.bonus) })
}
