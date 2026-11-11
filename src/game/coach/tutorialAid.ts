import type { Sim } from '../sim/world'
import type { Unit } from '../sim/types'

/**
 * ─── Two helping hands in the opening fight ──────────────────────────────────
 *
 * The potion stop (roadmap #154): the first time the hero falls below
 * `POTION_STOP_HP` of his health with a flask ready, the scene freezes and an
 * arrow bounces on the health flask until he drinks (tap, click or Q). Once a
 * visit: it teaches the flask, it is not a pause button.
 *
 * The boss's mercy (roadmap #155): a hero STRUGGLING at the opening boss
 * without leaning on his Shield Slam (the stun the fight is built around) gets
 * every enemy blow cut by `MERCY.cut`, for the rest of the visit.
 *
 *   Struggling, counted from the moment the boss wakes:
 *     • the hero has fallen in the fight (Second wind taken), or
 *     • he has lost `MERCY.lost` × his full health in it (potions refill
 *       him, so this counts what was poured away, not what is left), or
 *     • `MERCY.slow` seconds in, the boss still has more than `MERCY.bossLeft`
 *       of its health.
 *   Not using Shield Slam often: fewer than one cast per `MERCY.bashEvery`
 *   seconds of the fight (a hero without the skill has none).
 *   The health and time tests wait `MERCY.minT` seconds, so the boss's
 *   opening blow alone never decides it.
 *
 * Plain bookkeeping on the sim (no scene), so tests pin the rules.
 */

/** Health share below which the potion stop comes. */
export const POTION_STOP_HP = 0.35

/** The most one charged blow or charge may take of the hero's health on the tutorial level. */
export const TUTORIAL_CHARGED_CAP = 0.2

/** The hero's stun skill the opening boss is built around ("Shield Bash"). */
export const BASH_SKILL = 'shieldSlam'

export const MERCY = {
  /** The share of every enemy blow taken away. */
  cut: 0.65,
  /** Hero health lost in the fight, in full bars. */
  lost: 1,
  /** Seconds in the fight after which a boss still above `bossLeft` means struggling. */
  slow: 60,
  bossLeft: 0.5,
  /** Seconds of fight per Shield Slam that count as using it often. */
  bashEvery: 20,
  /** Seconds before the health or time tests may decide. */
  minT: 10
} as const

interface AidState {
  potionDone: boolean
  /** Flasks carried when the potion stop began (-1: no stop yet). */
  stopPotions: number
  /** Seconds the boss fight has gone on. */
  t: number
  /** Hero health lost in it. */
  lost: number
  prevHp: number
  wasAlive: boolean
  falls: number
  bashes: number
  mercy: boolean
}

const states = new WeakMap<Sim, AidState>()
const stateOf = (sim: Sim): AidState => {
  let s = states.get(sim)
  if (!s) {
    s = { potionDone: false, stopPotions: -1, t: 0, lost: 0, prevHp: -1, wasAlive: true, falls: 0, bashes: 0, mercy: false }
    states.set(sim, s)
  }
  return s
}

/**
 * ─── Frustration relief on the tutorial level ────────────────────────────────
 *
 * A first-timer who runs from the fight, swings at nothing, or keeps cancelling
 * his own swings by moving gets hit for nothing: enemy blows are softened while
 * that goes on, and come back as he fights properly.
 *
 *   running away    he moves fast, away from the nearest awake enemy
 *   not hitting     `idleHit` seconds in a fight without one of his blows landing
 *   move cancels    each basic swing his own move dropped before it landed
 *
 * The frustration (0..1) climbs with those and drains while he fights well;
 * `sim.reliefMul` is 1 at 0 and `1 − RELIEF.cut` at 1.
 */
export const RELIEF = {
  /** The most the blows are cut at full frustration. */
  cut: 0.55,
  /** Frustration per second of running away / of not hitting, and per cancelled swing. */
  flee: 0.3,
  whiff: 0.18,
  cancel: 0.12,
  /** Seconds in a fight without landing a blow before that counts. */
  idleHit: 5,
  /** Frustration drained per second of fighting well or of peace. */
  decay: 0.12,
  /** Enemies this close (metres) make it a fight. */
  fight: 14,
  /** Running away: a speed above this (m/s) and the share of it that points away from the enemy. */
  fleeSpeed: 2,
  fleeAway: 0.5
} as const

interface ReliefState { f: number; sinceHit: number; cancels: number }
const reliefs = new WeakMap<Sim, ReliefState>()

/** The frustration now (0..1), for the log and the tests. */
export const frustration = (sim: Sim): number => reliefs.get(sim)?.f ?? 0

/** One step of the relief; call it after the sim step, before its events are drained. */
export const stepRelief = (sim: Sim, dt: number): void => {
  let s = reliefs.get(sim)
  if (!s) { s = { f: 0, sinceHit: 0, cancels: sim.swingCancels }; reliefs.set(sim, s) }
  const u = sim.hero.unit
  let foe: Unit | undefined
  let fd: number = RELIEF.fight
  if (u.alive && !sim.ended && !u.truce) {
    for (const e of sim.units) {
      if (!e.alive || e.team !== 1 || !e.awake || e.rank === 'npc') continue
      const d = Math.hypot(e.x - u.x, e.z - u.z)
      if (d < fd) { fd = d; foe = e }
    }
  }
  let landed = false
  for (const e of sim.events) if (e.t === 'hit' && e.src === u.id) landed = true
  if (landed || !foe) s.sinceHit = 0
  else s.sinceHit += dt
  const cancelled = sim.swingCancels - s.cancels
  s.cancels = sim.swingCancels
  let rise = 0
  if (foe) {
    const sp = Math.hypot(u.vx, u.vz)
    // Running away: fast, and mostly along the line from the enemy to him.
    if (sp > RELIEF.fleeSpeed && (u.vx * (u.x - foe.x) + u.vz * (u.z - foe.z)) / (sp * Math.max(0.01, fd)) > RELIEF.fleeAway) rise += RELIEF.flee
    if (s.sinceHit > RELIEF.idleHit) rise += RELIEF.whiff
  }
  if (foe && cancelled > 0) s.f += cancelled * RELIEF.cancel
  s.f = Math.min(1, Math.max(0, s.f + (rise > 0 ? rise * dt : -RELIEF.decay * dt)))
  sim.reliefMul = 1 - RELIEF.cut * s.f
}

/** The potion stop is due now (and is used up by saying so). */
export const potionStopDue = (sim: Sim): boolean => {
  const s = stateOf(sim)
  const h = sim.hero
  const u = h.unit
  if (s.potionDone || sim.ended || !u.alive || u.truce) return false
  if (h.potions <= 0 || h.potionCd > 0 || u.hp >= u.s.maxHp * POTION_STOP_HP) return false
  s.potionDone = true
  s.stopPotions = h.potions
  return true
}

/**
 * The potion stop is over: the flask was drunk, by the button, the key or any
 * other road (a cheat, the preview feed), or there is nothing left to drink it
 * for. The world must never stay held with the hint up.
 */
export const potionStopOver = (sim: Sim): boolean => {
  const s = stateOf(sim)
  const h = sim.hero
  const u = h.unit
  if (sim.ended || sim.leaving || !u.alive || u.truce) return true
  if (h.potions < s.stopPotions || h.potions <= 0 || h.potionCd > 0) return true
  return u.hp >= u.s.maxHp * POTION_STOP_HP
}

/** The opening fight's boss (the finale's leader, the bandit chief), while it stands. */
export const openingBoss = (sim: Sim): Unit | undefined => {
  let g = -1
  let kind = ''
  for (const q of sim.groups) if (q.boss) { g = q.id; kind = q.boss }
  return g < 0 ? undefined : sim.units.find(u => u.group === g && u.kind === kind && u.team === 1 && u.alive)
}

/**
 * A free revive on the tutorial level: whoever has just fallen once fights on
 * against softer blows (the same cut as the boss's mercy, taken once for the
 * visit, never stacked on it).
 */
export const grantMercy = (sim: Sim): boolean => {
  const s = stateOf(sim)
  if (s.mercy) return false
  s.mercy = true
  sim.foeHitMul *= 1 - MERCY.cut
  return true
}

/** Where the boss fight stands, for the log and the tests. */
export const mercyStats = (sim: Sim): Readonly<AidState> => stateOf(sim)

/**
 * One step of the boss fight's bookkeeping; call it after the sim step, before
 * its events are drained. True on the step the mercy begins.
 */
export const stepMercy = (sim: Sim, dt: number): boolean => {
  const s = stateOf(sim)
  if (s.mercy) return false
  const boss = openingBoss(sim)
  const u = sim.hero.unit
  if (!boss || !boss.awake) { s.prevHp = u.hp; s.wasAlive = u.alive; return false }
  s.t += dt
  for (const e of sim.events) if (e.t === 'cast' && e.src === u.id && e.skill === BASH_SKILL) s.bashes++
  if (s.wasAlive && !u.alive) s.falls++
  if (u.alive && s.wasAlive && s.prevHp >= 0 && u.hp < s.prevHp) s.lost += s.prevHp - u.hp
  s.prevHp = u.hp
  s.wasAlive = u.alive
  const max = u.s.maxHp
  const struggling = s.falls > 0 || (s.t >= MERCY.minT && (s.lost >= max * MERCY.lost || (s.t >= MERCY.slow && boss.hp > boss.s.maxHp * MERCY.bossLeft)))
  const rarelyBashes = s.bashes < s.t / MERCY.bashEvery
  if (!struggling || !rarelyBashes) return false
  s.mercy = true
  sim.foeHitMul *= 1 - MERCY.cut
  console.info('[tutorial] the boss shows mercy: enemy damage −65 %', {
    seconds: Math.round(s.t), hpLost: Math.round(s.lost), maxHp: Math.round(max), falls: s.falls, bashes: s.bashes,
    bossHp: Math.round((boss.hp / boss.s.maxHp) * 100) + '%'
  })
  return true
}
