import { hasLineOfSight, isSolidAt } from '../grid'
import { applyStatus } from '../combat'
import { spawnEnemy } from '../spawn'
import type { Sim } from '../world'
import type { Unit } from '../types'
import type { BossScript } from './index'
import { bark, move, other, strikeFor, warn } from './kit'

/**
 * ─── The Sphinx (Sunken Temple, afterplay §5.4): a plain fight on the ground ──
 *
 *   100–60 %  a CLAW CONE at whoever comes close, and a SAND BARRAGE: circles
 *             round the hero, each shown before the sand comes down.
 *   60 %      the same, quicker (she roars; the claw and the sand come back sooner).
 *   30 %      two sand-spinning acolytes, quicker still, and one circle more in
 *             every barrage.
 *
 * She never leaves the ground and is always open to a blow. (She once flew up at
 * 60 % and asked a riddle of coloured plates; nobody read it as a puzzle, it read
 * as a broken fight.)
 */

const COLOR = '#e8c060'
const CLAW_R = 4.2
const CLAW_HALF = 0.75
const SAND_R = 1.9
const SAND_WARN = 1.1

const hitsBuf: Unit[] = []

/** Sand barrage: `n` circles round the hero, the sand comes down on each. */
const barrage = (sim: Sim, u: Unit, tgt: Unit, n: number): void => {
  for (let k = 0; k < n; k++) {
    const a = sim.rng() * Math.PI * 2
    const r = k === 0 ? 0 : 1.6 + sim.rng() * 2
    const x = tgt.x + Math.sin(a) * r
    const z = tgt.z + Math.cos(a) * r
    const delay = SAND_WARN + k * 0.25
    warn(sim, u, { shape: 'circle', x, z, r: SAND_R, w: 0, a: 0, dur: delay })
    sim.after(delay, () => {
      if (!u.alive) return
      sim.emit({ t: 'fx', id: 'quake', x, z, r: SAND_R + 0.3, color: COLOR })
      for (const t of sim.inCircle(other(u), x, z, SAND_R, hitsBuf)) {
        strikeFor(sim, u, t, 1.3)
        applyStatus(sim, t, 'slow', 2, 0.4, u)
      }
    })
  }
}

const sphinx: BossScript = {
  phases: [0.6, 0.3],
  think(sim, u, tgt) {
    const b = u.boss!
    if (!b.marks.includes('bark:intro')) bark(sim, u, 'sphinx', 'intro')
    if (b.next > 0) return false
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    const los = hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)
    if ((b.cd.claw ?? 0) <= 0 && d < CLAW_R) {
      b.cd.claw = b.phase >= 3 ? 3 : b.phase === 2 ? 4 : 5
      b.next = 1.4
      const act = move(sim, u, 'cone', 0.8, 0.5, tgt)
      warn(sim, u, { shape: 'cone', x: u.x, z: u.z, r: CLAW_R, w: CLAW_HALF, a: act.a, dur: 0.8, wind: 0.8 })
      return true
    }
    if ((b.cd.sand ?? 0) <= 0 && los && d > 2.5 && d < 14) {
      b.cd.sand = b.phase >= 3 ? 5 : b.phase === 2 ? 6.5 : 8
      b.next = 1.6
      move(sim, u, 'lob', 0.6, 0.6, tgt)
      return true
    }
    return false
  },
  land(sim, u, act) {
    if (act.id === 'cone') {
      sim.emit({ t: 'fx', id: 'breath', x: u.x, z: u.z, r: CLAW_R, a: act.a, dur: 0.3, color: COLOR })
      for (const t of sim.inCone(other(u), u.x, u.z, act.a, CLAW_R, CLAW_HALF, hitsBuf)) strikeFor(sim, u, t, 1.6)
    } else if (act.id === 'lob') {
      const t = sim.live(act.targetId)
      if (t) barrage(sim, u, t, u.boss!.phase >= 3 ? 4 : 3)
    }
  },
  onPhase(sim, u, phase) {
    sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 7, color: COLOR })
    if (phase === 3) {
      bark(sim, u, 'sphinx', 'sand')
      // Two acolytes spinning out of the sand.
      for (let i = 0; i < 2; i++) {
        const a = sim.rng() * Math.PI * 2
        const x = u.homeX + Math.sin(a) * 3
        const z = u.homeZ + Math.cos(a) * 3
        if (isSolidAt(sim.grid, x, z)) continue
        const m = spawnEnemy(sim, 'sphinxAcolyte', x, z, u.group, u)
        if (m) { m.awake = true; sim.emit({ t: 'fx', id: 'summon', x, z, color: COLOR }) }
      }
    }
  }
}

export const SPHINX_SCRIPTS: Record<string, BossScript> = { sphinx }
