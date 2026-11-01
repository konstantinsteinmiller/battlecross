import { applyStatus } from './combat'
import { hasStatus, type Sim } from './world'
import type { Unit } from './types'

/**
 * ─── Frenzy (#170) ──────────────────────────────────────────────────────────
 *
 * A boss, an elite or a champion that is being hurt fast — or one whose foe
 * barely feels it (lifesteal, armour) — goes into a frenzy: 8–12 s of 200–250 %
 * damage, shown as red bubbles streaming up round the body. At most twice a
 * fight. The blow multiplier is the status' value (`combat.ts`).
 */
export const FRENZY_MAX = 2
/** Lost within `FRENZY_WINDOW` s: this share of the unit's health sets it off. */
export const FRENZY_LOSS = 0.1
export const FRENZY_WINDOW = 3
/** A fight this long with the foe losing less than `FRENZY_CALM_LOSS` of its health sets it off too. */
export const FRENZY_CALM = 10
export const FRENZY_CALM_LOSS = 0.05
/** Damage on top of the normal blow: 1.0..1.5 (so 200 %..250 % in all). */
const EXTRA_MIN = 1
const EXTRA_STEPS = 6

interface FrenzyState { n: number; refHp: number; refT: number; calmT: number; foeHp: number; busy: number }
const states = new WeakMap<Unit, FrenzyState>()

export const frenzyEligible = (u: Unit): boolean => u.team === 1 && (u.rank === 'boss' || u.rank === 'elite' || !!u.champion)

export const frenzyCount = (u: Unit): number => states.get(u)?.n ?? 0

/** Once a tick for an awake foe with a target `tgt` within reach of the fight. */
export const stepFrenzy = (sim: Sim, u: Unit, tgt: Unit, d: number, dt: number): void => {
  // The opening fight is merciful (its damage is scaled up, mercy aside): no frenzy there.
  if (!frenzyEligible(u) || sim.enemyDmgMul > 1.5 || sim.foeHitMul < 1) return
  let s = states.get(u)
  if (!s) { s = { n: 0, refHp: u.hp, refT: 0, calmT: 0, foeHp: tgt.hp, busy: 0 }; states.set(u, s) }
  if (s.n >= FRENZY_MAX || hasStatus(u, 'frenzy')) { s.refHp = u.hp; s.refT = 0; return }
  const maxHp = u.s.maxHp
  // Hurt fast: more than a tenth of its health gone inside three seconds.
  s.refT += dt
  if (u.hp > s.refHp) s.refHp = u.hp
  let go = s.refHp - u.hp > maxHp * FRENZY_LOSS
  if (s.refT >= FRENZY_WINDOW) { s.refT = 0; s.refHp = u.hp }
  // Not hurting the foe at all: engaged for a while, and the foe is as whole as it was.
  if (!go) {
    if (d < 14) {
      s.calmT += dt
      if (s.calmT >= FRENZY_CALM) {
        go = s.foeHp - tgt.hp < tgt.s.maxHp * FRENZY_CALM_LOSS
        s.calmT = 0
        s.foeHp = tgt.hp
      }
    } else { s.calmT = 0; s.foeHp = tgt.hp }
  }
  if (!go) return
  s.n++
  s.calmT = 0
  s.foeHp = tgt.hp
  s.refHp = u.hp
  s.refT = 0
  const extra = EXTRA_MIN + Math.floor(sim.rng() * EXTRA_STEPS) / 10
  applyStatus(sim, u, 'frenzy', 8 + sim.rng() * 4, extra, u, { quiet: true })
}
