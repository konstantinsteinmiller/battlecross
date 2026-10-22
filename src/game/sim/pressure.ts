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
  /** The hard fights' damage ramps (#157), by foe. */
  ramps: Map<number, BossRamp>
}

/** The session's level, carried from visit to visit (a defeat clears it). */
let session = 0
export const sessionPressure = (): number => session
export const setSessionPressure = (bonus: number): void => { session = Math.max(0, bonus) }

export const newPressure = (bonus = 0): PressureState =>
  ({ bonus, t: 0, lost0: 0, dealt0: 0, potions: 0, lastPotion: false, low: 1, ramps: new Map() })

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

/**
 * ─── The hard-fight ramp (roadmap #157) ──────────────────────────────────────
 *
 * A boss, a champion or an elite the hero shrugs off hits a little harder.
 * Each keeps its own ramp. Its blows on the hero are measured as a share of
 * his health (after armour, before shields): normal attacks and abilities
 * apart, each as a running average at the foe's design damage. Every
 * `RAMP_WINDOW` seconds of that fight:
 *
 *   - no potion drunk and less than `RAMP_EASY` of his health lost → its
 *     damage climbs by its rank's `step`, but never past the point where a
 *     normal attack takes `hit` of his health or an ability `strong` (it
 *     stops there: a stronger hero simply holds it);
 *   - a potion drunk → it eases back by `RAMP_EASE` of itself, so a potion
 *     never turns a hard fight soft at once;
 *   - anything else → it holds.
 *
 * A boss climbs fastest and highest; a champion less, a plain elite least
 * (`RAMP_TUNE`). Damage only, health is untouched; a new foe starts from
 * nothing, and it lives on top of the minute-by-minute pressure.
 */
export const RAMP_WINDOW = 8
export const RAMP_EASY = 0.04
export const RAMP_EASE = 0.12
export type RampKind = 'boss' | 'champion' | 'elite'
export const RAMP_TUNE: Readonly<Record<RampKind, { step: number; hit: number; strong: number }>> = {
  boss: { step: 0.06, hit: 0.07, strong: 0.225 },
  champion: { step: 0.04, hit: 0.05, strong: 0.16 },
  elite: { step: 0.025, hit: 0.035, strong: 0.11 }
}
/** The boss's (the tests read them). */
export const RAMP_STEP = RAMP_TUNE.boss.step
export const RAMP_HIT = RAMP_TUNE.boss.hit
export const RAMP_HIT_STRONG = RAMP_TUNE.boss.strong
/** Weight of a new blow in the running averages. */
const RAMP_AVG = 0.3
/** A fight is on while the foe struck the hero this recently. */
const RAMP_ENGAGED = 6

export interface BossRamp {
  /** The foe it belongs to (`Unit.id`), and its rank's tuning. */
  id: number
  kind: RampKind
  /** Extra damage now (0 = as designed). */
  bonus: number
  /** Average blow at design damage, as a share of the hero's health (-1: none seen). */
  hit: number
  strong: number
  /** Fight time into this window; since the foe last struck. */
  t: number
  idle: number
  lost0: number
  potions: number
}

/** Which ramp a unit gets, if any. */
export const rampKindOf = (u: Unit): RampKind | null =>
  u.rank === 'boss' ? 'boss' : u.rank === 'elite' ? (u.champion ? 'champion' : 'elite') : null

const newRamp = (id: number, kind: RampKind, lost0: number): BossRamp =>
  ({ id, kind, bonus: 0, hit: -1, strong: -1, t: 0, idle: 0, lost0, potions: 0 })

/** The most the ramp may reach so neither kind of blow passes its target. */
export const rampCeiling = (r: Pick<BossRamp, 'hit' | 'strong'> & { kind?: RampKind }): number => {
  const tune = RAMP_TUNE[r.kind ?? 'boss']
  let cap = Infinity
  if (r.hit > 0) cap = Math.min(cap, tune.hit / r.hit - 1)
  if (r.strong > 0) cap = Math.min(cap, tune.strong / r.strong - 1)
  return r.hit > 0 || r.strong > 0 ? Math.max(0, cap) : 0
}

/** Judge one window of a fight (pure: the rules above). */
export const rampNext = (r: BossRamp, lostShare: number): number => {
  if (r.potions > 0) return r.bonus * (1 - RAMP_EASE)
  if (lostShare >= RAMP_EASY) return r.bonus
  return Math.max(r.bonus, Math.min(rampCeiling(r), r.bonus + RAMP_TUNE[r.kind].step))
}

/** A boss's, champion's or elite's blow landed on the hero (`dealDamage`, before shields). */
export const noteBossHit = (sim: Sim, foe: Unit, amount: number, attack: boolean): void => {
  const p = sim.pressure
  const kind = rampKindOf(foe)
  if (!p || !kind || !sim.hero || sim.mode !== 'zone') return
  let r = p.ramps.get(foe.id)
  if (!r) p.ramps.set(foe.id, r = newRamp(foe.id, kind, sim.hero.lost))
  const share = amount / sim.hero.unit.s.maxHp / (1 + r.bonus)
  if (attack) r.hit = r.hit < 0 ? share : r.hit + (share - r.hit) * RAMP_AVG
  else r.strong = r.strong < 0 ? share : r.strong + (share - r.strong) * RAMP_AVG
  r.idle = 0
}

/** Step each fight's clock; judge each window. */
const stepRamps = (sim: Sim, dt: number): void => {
  const p = sim.pressure
  const h = sim.hero
  if (!p || !h || !p.ramps.size) return
  for (const r of p.ramps.values()) {
    const foe = sim.units.find(u => u.id === r.id)
    if (!foe?.alive) { p.ramps.delete(r.id); continue }
    r.idle += dt
    if (r.idle > RAMP_ENGAGED) continue
    r.t += dt
    if (r.t < RAMP_WINDOW) continue
    const to = Math.round(rampNext(r, (h.lost - r.lost0) / h.unit.s.maxHp) * 1000) / 1000
    if (to !== r.bonus) foe.s.baseDmg *= (1 + to) / (1 + r.bonus)
    r.bonus = to
    r.t = 0
    r.potions = 0
    r.lost0 = h.lost
  }
}

/** A health potion drunk (the hero's `usePotion`). */
export const notePotion = (sim: Sim): void => {
  if (!sim.pressure) return
  sim.pressure.potions++
  for (const r of sim.pressure.ramps.values()) r.potions++
}

/** One step of fight time: watch the hero, judge each minute. */
export const stepPressure = (sim: Sim, dt: number): void => {
  const p = sim.pressure
  const h = sim.hero
  if (!p || !h || sim.ended || sim.mode !== 'zone' || !h.unit.alive) return
  stepRamps(sim, dt)
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
