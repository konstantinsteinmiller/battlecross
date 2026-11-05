import { REBEL_FLEE, REBEL_FLOOR } from '../data/rebellion'
import type { Unit } from './types'
import type { Sim } from './world'

/**
 * A freed gnome cannot be killed (roadmap #205): a blow that would leave it under a tenth of its health
 * leaves it at 9 % instead and sends it running; from then on nothing takes any more of it (it still
 * flinches at every blow). A leaf of its own so `combat.ts` can call it without a cycle.
 */

/** The unit kind of a digger in the gang. */
export const REBEL_KIND = 'rebelGnome'

/** How much of `left` the gnome really loses (0 once it has run). */
export const rebelHurt = (sim: Sim, tgt: Unit, left: number): number => {
  const r = sim.rebels
  const g = r?.gnomes.find(q => q.unit === tgt.id)
  if (!r || !g || g.mode === 'chained') return left
  const floor = tgt.s.maxHp * REBEL_FLOOR
  // Already running (or on a stampede): nothing hurts it any more.
  if (g.mode !== 'follow' || tgt.hp <= floor + 1e-6) return 0
  if (tgt.hp - left >= tgt.s.maxHp * REBEL_FLEE) return left
  // The blow that would have dropped it under a tenth: it keeps nine, and it runs.
  left = Math.max(0, tgt.hp - floor)
  g.mode = 'fled'
  tgt.rank = 'npc'
  tgt.hasGoal = false
  tgt.path.length = 0
  tgt.action = null
  tgt.targetId = 0
  // Whoever was after it looks for someone else.
  for (const e of sim.units) if (e.team === 1 && e.targetId === tgt.id) { e.targetId = 0; e.hasGoal = false }
  sim.emit({ t: 'rebel', id: 'flee', n: g.q, x: tgt.x, z: tgt.z })
  return left
}
