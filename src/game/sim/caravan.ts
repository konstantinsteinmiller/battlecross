import { moveCircle } from './grid'
import { plainStats } from './stats'
import { turnToward } from './actors'
import { wakeGroup } from './combat'
import type { Sim } from './world'

/**
 * ─── The caravan on the road to Oakhaven (roadmap #85, D106) ─────────────────
 *
 * A mule and its cart roll from one end of the road to the other at a walk;
 * ambushers come out of the clearings for it. It is on the hero's side (team
 * 0, a fixed body like a turret, so nobody pushes it off the road) and the
 * enemies go for it like for anybody of his. It waits for the hero when he
 * falls behind, and stops while a foe is close (the mule will not walk into a
 * fight). It reaching the far end wins the visit; it broken loses it.
 */

export const CARAVAN_KIND = 'caravan'
/** Metres a second on the road. */
export const CARAVAN_SPEED = 1.35
/** It waits while the hero is further than this behind. */
export const CARAVAN_WAIT = 10
/** It holds while an awake foe is this near. */
export const CARAVAN_THREAT = 5.5
/** An ambush springs when the cart rolls this near. */
export const CARAVAN_AMBUSH = 7
/** Its health, as a share of the hero's. */
export const CARAVAN_HP = 2.4

export type CaravanPhase = 'rolling' | 'waiting' | 'held' | 'arrived' | 'lost'

export interface CaravanState {
  unit: number
  /** The road: x, z pairs, the far end last. */
  path: number[]
  /** The next waypoint. */
  i: number
  phase: CaravanPhase
}

/** The cart at the start of the road. */
export const spawnCaravan = (sim: Sim, path: readonly number[]): void => {
  const h = sim.hero
  if (!h || path.length < 4) return
  const hs = h.unit.s
  const s = plainStats({ hp: hs.maxHp * CARAVAN_HP, dmg: 0, armor: hs.armor, speed: CARAVAN_SPEED, range: 0, interval: 99 })
  const u = sim.addUnit({ kind: CARAVAN_KIND, team: 0, rank: 'turret', level: sim.level, x: path[0]!, z: path[1]!, r: 0.95, h: 1.7, s, facing: Math.PI })
  // Always awake: its health bar shows from the start.
  u.awake = true
  sim.caravan = { unit: u.id, path: [...path], i: 1, phase: 'rolling' }
}

/** One step of the road. Returns what changed: arrived, lost, or null. */
export const stepCaravan = (sim: Sim, dt: number): 'arrived' | 'lost' | null => {
  const c = sim.caravan
  if (!c || c.phase === 'arrived' || c.phase === 'lost') return null
  const u = sim.get(c.unit)
  if (!u || !u.alive) {
    c.phase = 'lost'
    sim.emit({ t: 'caravan', phase: 'lost', x: u?.x ?? 0, z: u?.z ?? 0 })
    return 'lost'
  }
  const hero = sim.hero.unit
  // The ambushers come out for the cart as it rolls up.
  for (const e of sim.units) {
    if (e.alive && e.team === 1 && !e.awake && Math.hypot(e.x - u.x, e.z - u.z) < CARAVAN_AMBUSH) wakeGroup(sim, e)
  }
  let phase: CaravanPhase = 'rolling'
  if (hero.alive && Math.hypot(hero.x - u.x, hero.z - u.z) > CARAVAN_WAIT) phase = 'waiting'
  for (const e of sim.units) {
    if (!e.alive || e.team !== 1 || !e.awake) continue
    if (Math.hypot(e.x - u.x, e.z - u.z) < CARAVAN_THREAT) { phase = 'held'; break }
  }
  if (phase !== c.phase) {
    c.phase = phase
    sim.emit({ t: 'caravan', phase, x: u.x, z: u.z })
  }
  if (phase !== 'rolling') { u.anim = 'idle'; return null }
  const tx = c.path[c.i * 2]!
  const tz = c.path[c.i * 2 + 1]!
  const dx = tx - u.x
  const dz = tz - u.z
  const d = Math.hypot(dx, dz)
  const step = CARAVAN_SPEED * dt
  if (d <= Math.max(0.1, step)) {
    c.i++
    if (c.i * 2 >= c.path.length) {
      c.phase = 'arrived'
      u.anim = 'idle'
      sim.emit({ t: 'caravan', phase: 'arrived', x: u.x, z: u.z })
      return 'arrived'
    }
    return null
  }
  const out: [number, number] = [0, 0]
  moveCircle(sim.grid, u.x, u.z, (dx / d) * step, (dz / d) * step, u.r * 0.7, out)
  u.x = out[0]
  u.z = out[1]
  u.facing = turnToward(u.facing, Math.atan2(dx, dz), dt * 3)
  u.anim = 'walk'
  return null
}
