import { MINER_NPC } from '../data/mentor'
import { CELL, isSolidAt } from '../sim/grid'
import { MINE_TIME } from '../sim/ores'
import { mulberry32 } from '../sim/rng'
import { plainStats } from '../sim/stats'
import { face } from '../sim/actors'
import { newAction, type Sim } from '../sim/world'
import type { Unit } from '../sim/types'

/**
 * ─── The miner at the opening level's ore rock (#195) ────────────────────────
 *
 * The first visit holds a single ore rock. Beside it stands Brann Pickfast, swinging his pick at it over and over: the one a
 * curious hero walks up to and asks about the craft (his talk, `dlg.plainsMiner.*`, is the smith's: ore bought, smithing
 * taught, the forge). He is a scene piece like the road teacher (`mentor.ts`): an `npc` unit nothing can aim at, found again by
 * his NPC id, so a saved visit that restored him needs no state of its own. The rock stays the hero's to mine as well: Brann
 * stands on another side of it than the hero's own place.
 */

/** A unit rolls two dice as it is born: his come from a stream of his own. */
const SALT = 0x6d1e7b05

/** His unit, once he is in the scene. */
export const minerUnit = (sim: Sim): Unit | null => {
  for (const u of sim.units) if (u.alive && u.npc === MINER_NPC) return u
  return null
}

/** The ground beside the rock, other than the hero's own place to swing: the open cell nearest the road-side. */
const placeBeside = (sim: Sim): { x: number; z: number; ox: number; oz: number } | null => {
  const o = sim.ores.find(q => !q.spent)
  if (!o) return null
  let best: { x: number; z: number } | null = null
  let bestD = Infinity
  for (let dj = -1; dj <= 1; dj++) {
    for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue
      const x = o.x + di * CELL
      const z = o.z + dj * CELL
      if (isSolidAt(sim.grid, x, z)) continue
      // Not the hero's own place, and not a cell that closes the way to it.
      if (Math.hypot(x - o.sx, z - o.sz) < CELL * 0.9) continue
      const d = Math.hypot(x - sim.hero.unit.x, z - sim.hero.unit.z)
      if (d < bestD) { bestD = d; best = { x, z } }
    }
  }
  return best ? { ...best, ox: o.x, oz: o.z } : null
}

/** Stand him up beside the rock (the tutorial visit, before the first step). False when the rock has no room for two. */
export const placeMiner = (sim: Sim): boolean => {
  if (minerUnit(sim)) return true
  const at = placeBeside(sim)
  if (!at) return false
  let u!: Unit
  sim.withStream(mulberry32((sim.seed ^ SALT) >>> 0), () => {
    u = sim.addUnit({
      kind: 'miner', team: 0, rank: 'npc', level: 1, x: at.x, z: at.z, r: 0.5, h: 1.45,
      s: plainStats({ hp: 1000, dmg: 0, speed: 3 }), facing: Math.atan2(at.ox - at.x, at.oz - at.z), npc: MINER_NPC
    })
  })
  u.x = u.px = at.x
  u.z = u.pz = at.z
  return true
}

/** Every step: when no swing is going he starts the next, on the rock (it knocks and chips at each swing, `LevelProps`). */
export const stepMiner = (sim: Sim, talking: boolean): void => {
  const u = minerUnit(sim)
  if (!u) return
  const o = sim.ores.find(q => !q.spent && Math.hypot(q.x - u.x, q.z - u.z) < CELL * 2)
  // The rock is gone (the hero mined it) or he is being talked to: he stands and rests.
  if (!o || talking) {
    if (u.action?.id === 'mine') u.action = null
    u.anim = 'idle'
    return
  }
  if (u.action) return
  face(u, o.x, o.z)
  u.action = newAction(u, 'mine', MINE_TIME, MINE_TIME + 0.15, 0, o.x, o.z)
  u.anim = 'cast'
  u.animT = 0
  u.animStyle = 0
  sim.emit({ t: 'mine', id: o.id, kind: o.kind, x: o.x, z: o.z, state: 'start', n: 0 })
}
