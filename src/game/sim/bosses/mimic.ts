import { hasLineOfSight, nearestOpen } from '../grid'
import { dealDamage } from '../combat'
import type { Sim } from '../world'
import type { BossScript } from './index'
import { move, warn } from './kit'

/**
 * ─── The mimic's charged attack: three bounces (roadmap #225) ───────────────
 *
 * Like a slime, it leaps three times in a row at where the hero stood when each jump began; the ground shows where it lands, and
 * whoever is inside the ring when it comes down is hit for a share of THEIR health:
 *
 *   jump 1  a hop          ring 1.6 m, 5 % of the hero's health
 *   jump 2  a bigger hop   ring 2.1 m (30 % wider), 8 %
 *   jump 3  a high, slow leap that crashes hard: out of reach in the air; ring 3.15 m (50 % wider than the second), 17 %
 *
 * The flight is the telegraph: the warning shows from take-off and the body lands on its last second. A roll away is enough.
 */

interface Jump { fly: number; r: number; pct: number; height: number; recover: number }
export const MIMIC_JUMPS: readonly Jump[] = [
  { fly: 0.7, r: 1.6, pct: 0.05, height: 0.9, recover: 0.12 },
  { fly: 0.75, r: 2.08, pct: 0.08, height: 1.1, recover: 0.2 },
  { fly: 1.5, r: 3.12, pct: 0.17, height: 3.4, recover: 0.9 }
]
const COOLDOWN = 8
const out2: [number, number] = [0, 0]

const mimic: BossScript = {
  phases: [],
  // The body climbs and falls over each jump's flight (a boss in the air is out of reach above `AIR_REACH`).
  tick(sim, u) {
    const b = u.boss!
    const a = u.action
    if (a && a.id === 'jump') {
      const j = MIMIC_JUMPS[Math.max(0, Math.min(MIMIC_JUMPS.length - 1, Number(b.sub || 0)))]!
      const k = Math.min(1, a.t / Math.max(0.05, a.hitAt))
      b.alt = j.height * Math.sin(k * Math.PI)
    } else if (b.alt > 0) b.alt = 0
  },
  think(sim, u, tgt) {
    const b = u.boss!
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    let n = Number(b.sub || 0)
    if (!b.marks.includes('jumping')) {
      // Begin the series: the hero is a few strides away and in sight.
      if ((b.cd.jumps ?? 0) > 0 || d < 2.2 || d > 10 || !hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)) return false
      b.marks.push('jumping')
      n = 0
    }
    const j = MIMIC_JUMPS[n]!
    b.sub = String(n)
    // Where it will land: the spot the hero stands on now.
    const x = tgt.x
    const z = tgt.z
    move(sim, u, 'jump', j.fly, j.recover, tgt, x, z, 1)
    warn(sim, u, { shape: 'circle', x, z, r: j.r, w: 0, a: 0, dur: j.fly, wind: j.fly })
    return true
  },
  land(sim, u, act) {
    if (act.id !== 'jump') return
    const b = u.boss!
    const n = Number(b.sub || 0)
    const j = MIMIC_JUMPS[n]!
    // It comes down where the ground was marked.
    out2[0] = act.x
    out2[1] = act.z
    if (nearestOpen(sim.grid, act.x, act.z, out2, 3)) { u.x = out2[0]; u.z = out2[1]; u.px = u.x; u.pz = u.z }
    sim.emit({ t: 'fx', id: n === 2 ? 'quake' : 'slam', x: u.x, z: u.z, r: j.r, color: '#c9a24a' })
    const h = sim.hero.unit
    if (h.alive && Math.hypot(h.x - u.x, h.z - u.z) <= j.r + h.r) {
      dealDamage(sim, u, h, h.s.maxHp * j.pct, { type: 'true', heavy: true, canCrit: false })
    }
    if (n >= MIMIC_JUMPS.length - 1) {
      // The series is over: it rests a moment, panting.
      b.marks.splice(b.marks.indexOf('jumping'), 1)
      b.sub = ''
      b.cd.jumps = COOLDOWN
      b.alt = 0
    } else b.sub = String(n + 1)
  }
}

export const MIMIC_SCRIPTS: Record<string, BossScript> = { mimic }
