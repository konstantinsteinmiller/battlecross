import { orderMove } from './hero'
import type { Sim } from './world'

/**
 * ─── The goal chip walks the hero to the objective ───────────────────────────
 *
 * A straight arrow points through rock; a tap on the goal chip instead walks the hero there by the path a click would take.
 * The walk is given up the moment the player takes over (stick or an order of his own), when a foe is awake close by (the
 * fight is the hero's), on arrival, or when he makes no headway for a few seconds (a blocked road).
 */

interface Walk { x: number; z: number; px: number; pz: number; still: number; leg: number }
const walks = new WeakMap<Sim, Walk>()

/** Metres from the target that count as arrived. */
export const ARRIVE = 3
/** Seconds without moving `HEADWAY` metres before the walk is given up. */
const STILL_S = 3
const HEADWAY = 0.4
/** Awake foes this close hand the hero back to the player. */
const FOE_NEAR = 9
/** Orders re-issued at most this often (a walk that ends short of the target is begun again). */
const MAX_LEGS = 8

export const walkActive = (sim: Sim): boolean => walks.has(sim)

export const startWalk = (sim: Sim, x: number, z: number): boolean => {
  const h = sim.hero
  if (!h.unit.alive || sim.ended || sim.leaving || Math.hypot(x - h.unit.x, z - h.unit.z) < ARRIVE) return false
  walks.set(sim, { x, z, px: h.unit.x, pz: h.unit.z, still: 0, leg: 1 })
  orderMove(sim, x, z)
  return true
}

export const stepWalk = (sim: Sim, dt: number): void => {
  const w = walks.get(sim)
  if (!w) return
  const h = sim.hero
  const u = h.unit
  const done = (): void => { walks.delete(sim) }
  if (!u.alive || sim.leaving || Math.hypot(h.stickX, h.stickZ) > 0.2) return done()
  if (Math.hypot(w.x - u.x, w.z - u.z) < ARRIVE) return done()
  // An order that is not ours: the player took over.
  if (h.order.kind !== 'none' && (h.order.kind !== 'move' || Math.hypot(h.order.x - w.x, h.order.z - w.z) > 0.5)) return done()
  for (const e of sim.units) {
    if (e.alive && e.team === 1 && e.awake && e.rank !== 'npc' && Math.hypot(e.x - u.x, e.z - u.z) < FOE_NEAR) return done()
  }
  if (Math.hypot(u.x - w.px, u.z - w.pz) > HEADWAY) { w.px = u.x; w.pz = u.z; w.still = 0 } else w.still += dt
  if (w.still > STILL_S) return done()
  if (h.order.kind === 'none') {
    if (++w.leg > MAX_LEGS) return done()
    orderMove(sim, w.x, w.z)
  }
}
