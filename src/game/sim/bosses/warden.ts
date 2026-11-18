import { WARDEN_CRUSH, WARDEN_PILLARS, WARDEN_STUN } from '../../data/undercroft'
import { dealDamage } from '../combat'
import { hasLineOfSight } from '../grid'
import type { BossScript } from './index'
import { move, raiseProps, shatterWallAt, warn, windCharge, type ChargeOpts } from './kit'

/**
 * ─── The Tunnel Warden (the Smugglers' Undercroft, roadmap #EXT-1) ──────────
 *
 * A drill-armed brute who bores down a lane at whoever stands in it. Rotten pillars hold up the arena's roof: lure his drill run
 * into one and it comes down on him (a tenth of his health, stunned a few seconds, the best window of the fight). A missed run
 * into plain rock only daze him a moment. Between runs he slams the ground round him, and below half health the roof sheds rock
 * where the ground shows (the def's barrage).
 */

const DRILL: ChargeOpts = {
  speed: 13, max: 18, dmg: 1.4, pinDmg: 2, pinStun: 1.6, daze: 2, carry: true,
  wallDaze: (sim, x, z) => {
    if (shatterWallAt(sim, x, z) !== 'beam') return 2
    sim.emit({ t: 'fx', id: 'burst:rock', x, z, r: 2.6, color: '#8a6a4a' })
    sim.emit({ t: 'fx', id: 'quake', x, z, r: 3, color: '#8a6a4a' })
    sim.emit({ t: 'tusker', id: 'crash', x, z })
    const w = sim.units.find(q => q.alive && q.boss?.script === 'warden' && Math.hypot(q.x - x, q.z - z) < 4.5)
    if (w) dealDamage(sim, null, w, w.s.maxHp * WARDEN_CRUSH, { type: 'true', canCrit: false, echo: true })
    return WARDEN_STUN
  }
}

const warden: BossScript = {
  phases: [0.5],
  arena(sim, u) {
    raiseProps(sim, u, 'beam', WARDEN_PILLARS, 4.5, 8)
  },
  think(sim, u, tgt) {
    const b = u.boss!
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    if (b.next <= 0 && d >= 3.5 && hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)) {
      b.next = 6 + sim.rng() * 2
      windCharge(sim, u, tgt, 1.1, DRILL)
      if (!b.marks.includes('beamsHint')) { b.marks.push('beamsHint'); sim.emit({ t: 'tusker', id: 'beams', x: u.x, z: u.z }) }
      return true
    }
    // The ground slam when he is on top of someone.
    if ((b.cd.slam ?? 0) <= 0 && d < 3.4) {
      b.cd.slam = 5
      move(sim, u, 'slam', 0.7, 0.5, tgt)
      warn(sim, u, { shape: 'circle', x: u.x, z: u.z, r: 3.6, w: 0, a: 0, dur: 0.7, wind: 0.7 })
      return true
    }
    return false
  },
  land(sim, u, act) {
    if (act.id !== 'slam') return
    sim.emit({ t: 'fx', id: 'slam', x: u.x, z: u.z, r: 3.6, color: '#8a6a4a' })
    const h = sim.hero.unit
    if (h.alive && Math.hypot(h.x - u.x, h.z - u.z) < 3.6 + h.r) dealDamage(sim, u, h, u.s.baseDmg * 1.8, { type: 'physical', heavy: true, canCrit: false })
  }
}

export const WARDEN_SCRIPTS: Record<string, BossScript> = { warden }
