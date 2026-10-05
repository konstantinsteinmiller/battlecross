import { ENEMY_BY_ID } from '../../data/enemies'
import { isSolidAt } from '../grid'
import { applyStatus, dealDamage, removeStatus } from '../combat'
import { face, setGoal, stop, walk } from '../actors'
import { hasStatus, newAction, type Sim } from '../world'
import type { Action, BossState, Team, Telegraph, Unit } from '../types'

/**
 * ─── The boss kit (#74) ──────────────────────────────────────────────────────
 *
 * The mechanics a scripted boss is built from, shared by every script:
 *
 *   lanes      how far a run goes before it meets rock (the warning shows
 *              exactly that far)
 *   charge     a run down a lane that carries whoever it hits until the wall
 *              (pinned, stunned) or, missing, rams the wall and is DAZED
 *              (stars, hurt more) — the punish window
 *   moves      a scripted wind-up (`move`): an action the script lands itself
 *   exit       leave the field by the way in, then be GONE (no body, no loot,
 *              not counted): a mount running off, a cameo leaving
 */

/** An action whose landing is the script's (`landScripted`), not the def's abilities. */
export const SCRIPTED = -2

export const newBossState = (script: string): BossState => ({
  script, phase: 1, mode: '', modeT: 0, sub: '', goalX: 0, goalZ: 0, dx: 0, dz: 1, speed: 0, left: 0, alt: 0, carry: 0, next: 0, n: 0, marks: []
})

export const other = (u: Unit): Team => (u.team === 0 ? 1 : 0)

/** Metres from (x, z) along (dx, dz) to the first rock or wall (capped at `max`). */
export const laneLength = (sim: Sim, x: number, z: number, dx: number, dz: number, max: number, pad = 0.4): number => {
  const step = 0.35
  for (let d = step; d <= max; d += step) {
    if (isSolidAt(sim.grid, x + dx * (d + pad), z + dz * (d + pad))) return Math.max(0, d - step)
  }
  return max
}

/** Raise a warning on the ground for `u`'s move. */
export const warn = (sim: Sim, u: Unit, t: Omit<Telegraph, 'team' | 'src'> & { team?: Team }): void => {
  sim.emit({ t: 'tele', tele: { team: u.team, src: u.id, ...t } })
}

/**
 * Begin a scripted move: an action named `id` (the animation reads the name:
 * 'charge', 'slam', 'cone', 'leap', 'lob', 'enrage' …) that lands after
 * `windup` through the script's `land`, and frees the unit after `recover`.
 */
export const move = (sim: Sim, u: Unit, id: string, windup: number, recover: number, tgt: Unit | null, x = tgt?.x ?? u.x, z = tgt?.z ?? u.z, style = 1): Action => {
  stop(u)
  if (tgt) face(u, tgt.x, tgt.z)
  const act = newAction(u, id, windup, windup + recover, tgt?.id ?? 0, x, z, SCRIPTED)
  u.action = act
  u.anim = 'cast'
  u.animT = 0
  u.animStyle = style
  sim.emit({ t: 'cast', src: u.id, skill: 'enemy:' + id, x: u.x, z: u.z, tx: x, tz: z })
  return act
}

/** Hit `t` as `u`'s ability would: a multiple of its base hit, heavy. */
export const strikeFor = (sim: Sim, u: Unit, t: Unit, mul: number, type = ENEMY_BY_ID[u.kind]?.type ?? 'physical'): number =>
  dealDamage(sim, u, t, u.s.baseDmg * mul, { type, heavy: true, canCrit: false })

// ─── Dazed ──────────────────────────────────────────────────────────────────

/**
 * Stars over its head for `dur` seconds: it cannot act, and takes `vuln` more
 * damage. Applied straight (a boss shrugs off most stuns; this one is its own
 * mistake and is meant to be punished in full).
 */
export const daze = (sim: Sim, u: Unit, dur: number, vuln = 0.5): void => {
  const b = u.boss
  if (b) { b.mode = 'dazed'; b.modeT = 0 }
  stop(u)
  u.action = null
  removeStatus(u, 'stun')
  u.statuses.push({ id: 'stun', t: dur, dur, v: 1, n: 1, src: u.id, tick: 0.5 })
  if (vuln > 0) applyStatus(sim, u, 'vulnerable', dur, vuln, u, { quiet: true })
  sim.emit({ t: 'status', tgt: u.id, id: 'stun', x: u.x, z: u.z, h: u.h })
}

// ─── The charge ─────────────────────────────────────────────────────────────

export interface ChargeOpts {
  /** Run speed, m/s. */
  speed: number
  /** The longest run, metres. */
  max: number
  /** Damage (× base hit) to whoever it runs down, and when it pins them to the wall. */
  dmg: number
  pinDmg: number
  /** Seconds the pinned one stays stunned on the wall. */
  pinStun: number
  /** Seconds it stands dazed when it rams the wall with nobody on its horns (0: it just stops). */
  daze: number
  /** Carries whoever it hits (a gore); else knocks them aside and runs on (a dash). */
  carry: boolean
}

const charges = new WeakMap<BossState, ChargeOpts>()

/** Wind up a charge at `tgt`: the lane to the wall shows for `windup` seconds, then it runs (`land` → `runCharge`). */
export const windCharge = (sim: Sim, u: Unit, tgt: Unit, windup: number, o: ChargeOpts): void => {
  const b = u.boss!
  const a = Math.atan2(tgt.x - u.x, tgt.z - u.z)
  const dx = Math.sin(a)
  const dz = Math.cos(a)
  const len = laneLength(sim, u.x, u.z, dx, dz, o.max, u.r)
  b.dx = dx
  b.dz = dz
  // A lane that ends at rock is run all the way into it; one that ends in the open just stops.
  b.left = len < o.max - 0.4 ? len + 2 : len
  charges.set(b, o)
  move(sim, u, 'charge', windup, 0, tgt, u.x + dx * len, u.z + dz * len, 3)
  warn(sim, u, { shape: 'line', x: u.x, z: u.z, r: len + u.r, w: u.r * 0.9, a, dur: windup, wind: windup })
}

/** The wind-up is over: the run begins. */
export const runCharge = (sim: Sim, u: Unit): void => {
  const b = u.boss!
  const o = charges.get(b)
  if (!o) return
  b.mode = 'charge'
  b.modeT = 0
  b.speed = o.speed
  b.carry = 0
  u.action = null
  u.anim = 'walk'
  sim.emit({ t: 'fx', id: 'dash', x: u.x, z: u.z, x2: u.x + b.dx * b.left, z2: u.z + b.dz * b.left, color: ENEMY_BY_ID[u.kind]?.color })
}

const hitsBuf: Unit[] = []

/** One step of a run: carry, ram, or stop. Returns false once the run is over. */
export const stepCharge = (sim: Sim, u: Unit, dt: number): boolean => {
  const b = u.boss!
  const o = charges.get(b)
  if (!o) { b.mode = ''; return false }
  const stepLen = Math.min(b.left, b.speed * dt)
  const subs = Math.max(1, Math.ceil(stepLen / 0.3))
  const carried = b.carry ? sim.live(b.carry) : undefined
  for (let s = 0; s < subs; s++) {
    const nx = u.x + b.dx * (stepLen / subs)
    const nz = u.z + b.dz * (stepLen / subs)
    // Rock ahead: the wall.
    if (isSolidAt(sim.grid, nx + b.dx * u.r, nz + b.dz * u.r)) {
      ram(sim, u, o, carried)
      return false
    }
    u.x = nx
    u.z = nz
    b.left -= stepLen / subs
    if (!b.carry) {
      for (const t of sim.inCircle(other(u), u.x + b.dx * u.r * 0.6, u.z + b.dz * u.r * 0.6, u.r * 0.7, hitsBuf)) {
        if (o.carry && t.rank === 'hero') {
          b.carry = t.id
          strikeFor(sim, u, t, o.dmg)
          // Caught on its tusks: helpless until the wall (or the end of the run).
          applyStatus(sim, t, 'stun', 6, 1, u, { quiet: true })
          sim.emit({ t: 'fx', id: 'slam', x: t.x, z: t.z, r: 1.4, color: '#ffffff' })
        } else {
          strikeFor(sim, u, t, o.dmg)
          t.kx += -b.dz * 7 * Math.sign((t.x - u.x) * -b.dz + (t.z - u.z) * b.dx || 1)
          t.kz += b.dx * 7 * Math.sign((t.x - u.x) * -b.dz + (t.z - u.z) * b.dx || 1)
        }
      }
    }
  }
  // The one it carries rides on its front.
  const c = b.carry ? sim.live(b.carry) : undefined
  if (c) {
    c.x = u.x + b.dx * (u.r + c.r * 0.8)
    c.z = u.z + b.dz * (u.r + c.r * 0.8)
    c.facing = Math.atan2(-b.dx, -b.dz)
    c.action = null
  }
  if (b.left <= 0.05) {
    // The end of the run with no wall: it skids to a stop and lets go.
    if (c) { removeStatus(c, 'stun'); applyStatus(sim, c, 'stun', o.pinStun * 0.5, 1, u) }
    b.mode = ''
    b.carry = 0
    u.aiT = 0.8
    return false
  }
  u.anim = 'walk'
  face(u, u.x + b.dx, u.z + b.dz)
  return true
}

/** It reaches the wall: pin whoever it carries against it, or ram it and stand dazed. */
const ram = (sim: Sim, u: Unit, o: ChargeOpts, carried: Unit | undefined): void => {
  const b = u.boss!
  const color = ENEMY_BY_ID[u.kind]?.color
  sim.emit({ t: 'fx', id: 'quake', x: u.x + b.dx * u.r, z: u.z + b.dz * u.r, r: 2.2, color })
  b.mode = ''
  b.carry = 0
  if (carried && carried.alive) {
    // Pinned against the rock: the full blow, and held there.
    strikeFor(sim, u, carried, o.pinDmg)
    removeStatus(carried, 'stun')
    applyStatus(sim, carried, 'stun', o.pinStun, 1, u)
    // It backs off the wall to come again.
    u.kx = -b.dx * 6
    u.kz = -b.dz * 6
    u.aiT = 1.2
    return
  }
  if (o.daze > 0) daze(sim, u, o.daze)
  else u.aiT = 0.6
}

// ─── Leaving the field ──────────────────────────────────────────────────────

/** Turn and leave by the way in (the zone's start), then be gone. */
export const exitField = (sim: Sim, u: Unit): void => {
  const b = u.boss!
  b.mode = 'exit'
  b.modeT = 0
  u.action = null
  removeStatus(u, 'stun')
  u.targetId = 0
  setGoal(sim, u, sim.start.x, sim.start.z)
}

export const stepExit = (sim: Sim, u: Unit, dt: number): void => {
  const b = u.boss!
  if (!u.hasGoal) setGoal(sim, u, sim.start.x, sim.start.z)
  u.anim = walk(sim, u, dt, 2.2) ? 'walk' : 'idle'
  // Out of sight down the way in (or stuck): gone.
  if (b.modeT > 5.5 || Math.hypot(u.x - sim.hero.unit.x, u.z - sim.hero.unit.z) > 22) despawn(sim, u)
}

/** Gone from the field: no body, no loot, no kill counted. */
export const despawn = (sim: Sim, u: Unit): void => {
  if (u.boss) { u.boss.mode = 'gone'; u.boss.carry = 0 }
  u.alive = false
  u.hp = 0
  u.action = null
  u.deadT = 99
  sim.emit({ t: 'fx', id: 'gone', x: u.x, z: u.z, unit: u.id })
}

/** Is it holding still as a mistake (the window to punish)? */
export const isDazed = (u: Unit): boolean => u.boss?.mode === 'dazed' && hasStatus(u, 'stun')
