import { hasLineOfSight, isSolidAt } from '../grid'
import { spawnEnemy } from '../spawn'
import type { Sim } from '../world'
import type { Unit } from '../types'
import type { BossScript } from './index'
import { bark, move, other, raiseProps, shatterWallAt, strikeFor, warn, windCharge, type ChargeOpts } from './kit'

/**
 * ─── The Centaur Warchief (Outskirts, afterplay §5.2) — teaches kiting ──────
 *
 *   100–60 %  it keeps 8-12 m off and shoots: volleys and arrow rain (the
 *             def's abilities). Close in on it and it TRAMPLES: the lane
 *             shows 1 s, then it runs straight through. Stay at range, or
 *             make it come to you.
 *   60 %      two centaur raiders ride in; the Warchief runs faster and
 *             throws SPEARS down three lanes.
 *   30 %      it REARS UP before every charge (a longer, louder warning),
 *             and now charges from any range. The field's three HAY WAGONS:
 *             a charge that runs into one smashes it and stands the Warchief
 *             stunned 4 s — lure it into them.
 */

const COLOR = '#e0a04a'
/** Close enough to be trampled. */
const CLOSE = 5
/** The lane's warning, and the rear-up's (phase 3). */
const WARN = 1
const REAR = 1.4
const WAGON_STUN = 4
const SPEAR_R = 13
const SPEAR_W = 0.9
const SPEAR_FAN = 0.28

const TRAMPLE: ChargeOpts = {
  speed: 16, max: 18, dmg: 2, pinDmg: 0, pinStun: 0, daze: 0, carry: false,
  // A hay wagon in the way: smashed to straw, and the Warchief stands stunned.
  wallDaze: (sim, x, z) => (shatterWallAt(sim, x, z) === 'wagon' ? (sim.emit({ t: 'fx', id: 'burst:rock', x, z, r: 2.4, color: '#e8c46a' }), WAGON_STUN) : 0)
}

const hitsBuf: Unit[] = []

/** A spot `d` metres from the Warchief, away from the hero, on open ground. */
const behind = (sim: Sim, u: Unit, d: number, side: number): [number, number] => {
  const h = sim.hero.unit
  const a = Math.atan2(u.x - h.x, u.z - h.z) + side * 0.9
  const x = u.x + Math.sin(a) * d
  const z = u.z + Math.cos(a) * d
  return isSolidAt(sim.grid, x, z) ? [u.x, u.z] : [x, z]
}

const centaur: BossScript = {
  phases: [0.6, 0.3],
  arena(sim, u) {
    raiseProps(sim, u, 'wagon', 3, 5, 8)
  },
  think(sim, u, tgt) {
    const b = u.boss!
    // Its first words, once (no string built every step).
    if (!b.marks.includes('bark:intro')) bark(sim, u, 'centaurWarchief', 'intro')
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    const los = hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)
    // The trample: whoever closes in; from 30 %, anyone in sight.
    if ((b.cd.charge ?? 0) <= 0 && los && d >= 1.5 && (d < CLOSE || (b.phase >= 3 && d < TRAMPLE.max))) {
      b.cd.charge = b.phase >= 3 ? 5.5 : 4.5
      b.next = 1.2
      if (b.phase >= 3) {
        // It rears up first: hooves high, a cry, then the run.
        sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 4, color: COLOR })
        windCharge(sim, u, tgt, REAR, TRAMPLE)
      } else windCharge(sim, u, tgt, WARN, TRAMPLE)
      return true
    }
    if (b.next > 0) return false
    // Spears down three lanes (from 60 %).
    if (b.phase >= 2 && (b.cd.spears ?? 0) <= 0 && los && d < SPEAR_R - 1) {
      b.cd.spears = 7
      b.next = 1.5
      const a = Math.atan2(tgt.x - u.x, tgt.z - u.z)
      move(sim, u, 'spears', 0.9, 0.5, tgt)
      for (let k = -1; k <= 1; k++) warn(sim, u, { shape: 'line', x: u.x, z: u.z, r: SPEAR_R, w: SPEAR_W, a: a + k * SPEAR_FAN, dur: 0.9, wind: 0.9 })
      return true
    }
    return false
  },
  land(sim, u, act) {
    if (act.id !== 'spears') return
    const a = Math.atan2(act.x - u.x, act.z - u.z)
    for (let k = -1; k <= 1; k++) {
      const la = a + k * SPEAR_FAN
      const dx = Math.sin(la)
      const dz = Math.cos(la)
      sim.emit({ t: 'fx', id: 'dash', x: u.x, z: u.z, x2: u.x + dx * SPEAR_R, z2: u.z + dz * SPEAR_R, color: COLOR })
      for (const t of sim.inCircle(other(u), u.x, u.z, SPEAR_R + 1, hitsBuf)) {
        const along = (t.x - u.x) * dx + (t.z - u.z) * dz
        const across = Math.abs((t.x - u.x) * dz - (t.z - u.z) * dx)
        if (along < 0 || along > SPEAR_R || across > SPEAR_W + t.r) continue
        strikeFor(sim, u, t, 1.3, 'pierce')
      }
    }
  },
  onPhase(sim, u, phase) {
    const b = u.boss!
    if (phase === 2) {
      // Two raiders ride in; it rides harder.
      move(sim, u, 'enrage', 0.8, 0.4, null)
      sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 8, color: COLOR })
      for (let i = 0; i < 2; i++) {
        const [x, z] = behind(sim, u, 4, i ? 1 : -1)
        const m = spawnEnemy(sim, 'centaurRaider', x, z, u.group, u)
        if (m) {
          m.awake = true
          m.targetId = sim.hero.unit.id
          sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: COLOR })
        }
      }
      u.s.moveSpeed *= 1.3
      b.cd.spears = 2.5
      bark(sim, u, 'centaurWarchief', 'raiders')
    } else if (phase === 3) {
      sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 8, color: COLOR })
      b.cd.charge = 1.5
      bark(sim, u, 'centaurWarchief', 'rear')
    }
  }
}

export const CENTAUR_SCRIPTS: Record<string, BossScript> = { centaur }
export const CENTAUR_TUNING = { CLOSE, WARN, REAR, WAGON_STUN, TRAMPLE }
