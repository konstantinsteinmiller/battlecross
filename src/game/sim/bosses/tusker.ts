import { hasLineOfSight, isSolidAt, nearestOpen } from '../grid'
import { knockback } from '../combat'
import { spawnEnemy } from '../spawn'
import type { Sim } from '../world'
import type { Unit } from '../types'
import type { BossScript } from './index'
import { daze, exitField, move, other, warn, windCharge, type ChargeOpts } from './kit'

/**
 * ─── The Goblin King on Tusker (Goldfield Hollows) ──────────────────────────
 *
 *   100–50 %  mounted: Tusker paws the ground, the lane to the wall shows for
 *             1.2 s, then he charges. Caught: the hero is carried to the wall
 *             and pinned there, stunned 2 s. Missed: he rams the rock and
 *             stands dazed 3.5 s, hurt half again as much. The King on his
 *             back throws bombs (the def's barrage); at 75 % he blows his war
 *             horn and goblins come running.
 *   50 %      the King leaps off (a shockwave where he lands); Tusker turns
 *             and runs off down the way in, gone.
 *   the King  on foot, a fresh health bar: three dashes along three lanes,
 *             then panting (dazed 1.5 s); his club spin and his bomb ring
 *             (the def's abilities). At half of his own health Tusker comes
 *             charging back in once, then leaves for good.
 */

const GORE: ChargeOpts = { speed: 11, max: 20, dmg: 1.2, pinDmg: 2.6, pinStun: 2, daze: 3.5, carry: true }
const DASH: ChargeOpts = { speed: 15, max: 6.5, dmg: 1.3, pinDmg: 0, pinStun: 0, daze: 0, carry: false }
const out2: [number, number] = [0, 0]

/** A spot `d` metres from (x, z) away from the hero, on open ground. */
const awayFromHero = (sim: Sim, x: number, z: number, d: number): [number, number] => {
  const h = sim.hero.unit
  const a = Math.atan2(x - h.x, z - h.z)
  for (let k = 0; k < 8; k++) {
    const aa = a + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.5
    const px = x + Math.sin(aa) * d
    const pz = z + Math.cos(aa) * d
    if (!isSolidAt(sim.grid, px, pz)) return [px, pz]
  }
  return nearestOpen(sim.grid, x, z, out2, 3) ? [out2[0], out2[1]] : [x, z]
}

const tusker: BossScript = {
  phases: [0.5],
  think(sim, u, tgt) {
    const b = u.boss!
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    // The war horn, once.
    if (!b.marks.includes('horn') && u.hp <= u.s.maxHp * 0.75) {
      b.marks.push('horn')
      move(sim, u, 'enrage', 0.9, 0.4, tgt)
      return true
    }
    if (b.next <= 0 && d >= 3.2 && hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)) {
      b.next = 7 + sim.rng() * 2.5
      windCharge(sim, u, tgt, 1.2, GORE)
      return true
    }
    return false
  },
  land(sim, u, act) {
    if (act.id === 'enrage') {
      sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 7, color: '#c9a24a' })
      for (let i = 0; i < 3; i++) {
        const [x, z] = awayFromHero(sim, u.x, u.z, 4 + i)
        const m = spawnEnemy(sim, i === 2 ? 'goblinSlinger' : 'goblin', x, z, u.group, u)
        if (m) sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: '#c9a24a' })
      }
    }
  },
  onPhase(sim, u, phase) {
    if (phase !== 2) return
    const b = u.boss!
    b.marks.push('dismounted')
    // The King leaps off beside his boar, and lands with a shockwave.
    const [x, z] = awayFromHero(sim, u.x, u.z, 1.8)
    const king = spawnEnemy(sim, 'goblinKing', x, z, u.group, null)
    if (king) {
      king.awake = true
      king.targetId = sim.hero.unit.id
      king.aiT = 1.2
      sim.emit({ t: 'fx', id: 'slam', x, z, r: 3, color: '#58c23f' })
      for (const t of sim.inCircle(other(king), x, z, 3, [])) knockback(t, x, z, 6)
      sim.emit({ t: 'bossPhase', unit: king.id, phase: 1 })
    }
    // Tusker turns and runs off.
    exitField(sim, u)
  }
}

const kingAfoot: BossScript = {
  phases: [0.5],
  think(sim, u, tgt) {
    const b = u.boss!
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    // A run of three dashes, then he stands panting.
    if (b.n > 0) {
      b.n--
      windCharge(sim, u, tgt, 0.8, DASH)
      if (b.n === 0) b.marks.push('pant')
      return true
    }
    if (b.marks.includes('pant')) {
      b.marks.splice(b.marks.indexOf('pant'), 1)
      daze(sim, u, 1.5, 0.3)
      return true
    }
    if (b.next <= 0 && d >= 2.5 && d < 11 && hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)) {
      b.next = 9 + sim.rng() * 3
      b.n = 2
      windCharge(sim, u, tgt, 0.8, DASH)
      return true
    }
    return false
  },
  onPhase(sim, u, phase) {
    if (phase !== 2) return
    // Tusker comes back for one charge.
    const [x, z] = awayFromHero(sim, u.x, u.z, 7)
    const boar = spawnEnemy(sim, 'tuskerCameo', x, z, u.group, u)
    if (boar) {
      boar.awake = true
      boar.targetId = sim.hero.unit.id
      sim.emit({ t: 'fx', id: 'roar', x, z, r: 4, color: '#8a5a3a' })
    }
  }
}

const tuskerCameo: BossScript = {
  phases: [],
  think(sim, u, tgt) {
    const b = u.boss!
    if (b.marks.includes('charged')) {
      exitField(sim, u)
      return true
    }
    b.marks.push('charged')
    windCharge(sim, u, tgt, 1.2, { ...GORE, daze: 0 })
    warn(sim, u, { shape: 'circle', x: u.x, z: u.z, r: 1.6, w: 0, a: 0, dur: 1.2 })
    return true
  }
}

export const TUSKER_SCRIPTS: Record<string, BossScript> = { tusker, kingAfoot, tuskerCameo }

/** For tests: the charge settings. */
export const TUSKER_TUNING = { GORE, DASH }
