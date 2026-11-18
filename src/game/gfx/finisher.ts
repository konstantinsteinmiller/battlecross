import type { Sim } from '../sim/world'
import type { Unit } from '../sim/types'

/** How near another awake foe has to be to keep a kill from being the last one (m), and how far a pack-mate counts. */
export const FINISH_NEAR = 10
export const FINISH_PACK = 18

/**
 * Did this blow take the last foe of its fight (roadmap #EXT-10)? True when the target was an enemy (not
 * a summon, which carries an owner) and no other foe still stands near it: nobody awake within `FINISH_NEAR`
 * metres, and no pack-mate (same group, when it has one) within `FINISH_PACK`. It works for a wave of
 * the arena, the tutorial's few foes, the guards of a sally or a pack of the zone alike, because it reads
 * who is left around the kill and not how the director filed them. The kill has already happened in the
 * sim when the view reads the event.
 */
export const lastOfPack = (sim: Sim, tgt: Unit | undefined | null): boolean => {
  if (!tgt || tgt.team !== 1 || tgt.rank === 'npc' || tgt.ownerId) return false
  for (const u of sim.units) {
    if (!u.alive || u.team !== 1 || u.id === tgt.id || u.rank === 'npc' || u.ownerId) continue
    const d = Math.hypot(u.x - tgt.x, u.z - tgt.z)
    if (u.awake && d <= FINISH_NEAR) return false
    if (tgt.group > 0 && u.group === tgt.group && d <= FINISH_PACK) return false
  }
  return true
}
