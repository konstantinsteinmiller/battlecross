import { heal } from '../combat'
import { isSolidAt } from '../grid'
import { spawnEnemy } from '../spawn'
import type { Sim } from '../world'
import type { Unit } from '../types'
import type { BossScript } from './index'

/**
 * ─── The Elder Treant (Whispering Woods, #171) — teaches "kill the healer" ───
 *
 *   100–50 %  two Grove Shamans stand off to its sides, each with a green
 *             beam to the treant that mends it: together faster than a
 *             young hero hurts it. Cut the beams (kill the shamans), then
 *             the fight is a fight. The treant's own slam and root volley are
 *             the def's abilities.
 *   50 %      the grove calls two more shamans, a little further out.
 *
 * Nothing here moves the treant: the script only spawns the shamans, mends it
 * by them, and draws the beams. A shaman that is dead mends nothing.
 */

const COLOR = '#6fe06a'
/** Share of the treant's life one shaman mends per second. */
const MEND = 0.011
/** Seconds between two beam flashes. */
const BEAM_EVERY = 0.55
/** How far from the treant the first pair stands, and the second. */
const RING = [6.5, 8.5]

const idOf = (m: string): number => +m.slice(3)

/** The shamans of this treant that still live. */
const living = (sim: Sim, u: Unit): Unit[] => {
  const out: Unit[] = []
  for (const m of u.boss!.marks) {
    if (!m.startsWith('sh:')) continue
    const s = sim.get(idOf(m))
    if (s && s.alive) out.push(s)
  }
  return out
}

/** Two shamans, one either side of the treant, on open ground. */
const call = (sim: Sim, u: Unit, ring: number): void => {
  const h = sim.hero.unit
  const a0 = Math.atan2(h.x - u.x, h.z - u.z)
  for (let i = 0; i < 2; i++) {
    const a = a0 + (i ? 1 : -1) * 1.5
    let x = u.x + Math.sin(a) * ring
    let z = u.z + Math.cos(a) * ring
    if (isSolidAt(sim.grid, x, z)) { x = u.x + Math.sin(a) * 3.5; z = u.z + Math.cos(a) * 3.5 }
    if (isSolidAt(sim.grid, x, z)) { x = u.x; z = u.z + 3 }
    const m = spawnEnemy(sim, 'groveShaman', x, z, u.group, u)
    if (!m) continue
    m.awake = true
    m.targetId = h.id
    u.boss!.marks.push('sh:' + m.id)
    sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: COLOR })
  }
}

const grove: BossScript = {
  phases: [0.5],
  arena(sim, u) {
    call(sim, u, RING[0]!)
  },
  think() {
    return false
  },
  tick(sim, u, dt) {
    const b = u.boss!
    if (!u.alive) return
    const shamans = living(sim, u)
    if (!shamans.length) return
    if (u.hp < u.s.maxHp) heal(sim, u, u.s.maxHp * MEND * shamans.length * dt, true)
    b.cd.beam = (b.cd.beam ?? 0) - dt
    if (b.cd.beam > 0) return
    b.cd.beam = BEAM_EVERY
    for (const s of shamans) sim.emit({ t: 'fx', id: 'dash', x: s.x, z: s.z, x2: u.x, z2: u.z, color: COLOR })
  },
  onPhase(sim, u, phase) {
    if (phase !== 2) return
    sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 8, color: COLOR })
    call(sim, u, RING[1]!)
  }
}

export const GROVE_SCRIPTS: Record<string, BossScript> = { grove }
export const GROVE_TUNING = { MEND, BEAM_EVERY, RING }
