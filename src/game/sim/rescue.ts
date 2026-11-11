import { KEY_DROP_T, campPending } from './camp'
import { orderMove } from './hero'
import { orderOpen } from './interact'
import type { Sim } from './world'

/**
 * ─── "Free the caged teachers" is a button (the first visit's camp) ──────────
 *
 * The goal on screen, tapped, walks the hero to the boss's gold key, then to the cage's door and opens it. The walk is
 * given up the moment the player takes over (the stick, or an order of his own), and when the key has not fallen yet
 * there is nothing to walk to.
 */

/** Begin the walk. False where there is nothing to free, or the hero cannot go. */
export const startRescue = (sim: Sim): boolean => {
  const c = sim.camp
  if (!c || sim.ended !== 'victory' || !campPending(sim) || !sim.hero.unit.alive) return false
  c.auto = { kind: '' }
  return true
}

/** Every step while a walk runs: the key, then the cage. */
export const stepRescue = (sim: Sim): void => {
  const c = sim.camp
  const a = c?.auto
  if (!c || !a) return
  const h = sim.hero
  const stopped = !campPending(sim) || !h.unit.alive || sim.leaving || h.unit.truce
  // The player took over: the stick, or an order that is not the one given here.
  const taken = Math.hypot(h.stickX, h.stickZ) > 0.2 || (a.kind !== '' && h.order.kind !== a.kind && h.order.kind !== 'none')
  if (stopped || taken) { c.auto = undefined; return }
  const cage = sim.chests.find(q => q.role === 'cage' && q.state !== 'open')
  const k = sim.cageKey
  if (!cage) { c.auto = undefined; return }
  if (k && !k.taken) {
    // The key has not fallen or landed yet: nothing to walk to.
    if ((k.drop ?? KEY_DROP_T) < KEY_DROP_T) { c.auto = undefined; return }
    // Walk to it (again, when the walk ended short of it): picking it up is by proximity.
    if (!(a.kind === 'move' && h.order.kind === 'move')) {
      orderMove(sim, k.x, k.z)
      a.kind = 'move'
    }
    return
  }
  // The key is in hand: to the cage's door, and open it (again while the lid has not begun to lift).
  if (a.kind !== 'chest' || (h.order.kind === 'none' && h.opening < 0)) {
    if (!orderOpen(sim, cage.id)) { c.auto = undefined; return }
    a.kind = 'chest'
  }
}
