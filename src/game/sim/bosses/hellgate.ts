import { hasLineOfSight, isSolidAt, nearestOpen } from '../grid'
import { addField } from '../actors'
import { applyStatus, knockback } from '../combat'
import { spawnEnemy } from '../spawn'
import type { Sim } from '../world'
import type { BossState, Unit } from '../types'
import type { BossScript } from './index'
import { bark, daze, laneLength, move, other, strikeFor, warn } from './kit'

/**
 * ─── The Arch-Demon, Hellgate (Dread Fortress) ──────────────────────────────
 *
 *   100–55 %  a SWORD WAVE (the lane flashes, then a wall of fire runs down
 *             it to the rock), HELLFIRE PILLARS stepping out toward the hero,
 *             and the DIVE CLEAVE: it leaps out of reach, its shadow hunts
 *             the hero and LOCKS a second before it crashes down — and the
 *             blade sticks in the stone (dazed 2.5 s, the window).
 *   55 %      THE GATE: a ring of hellfire closes from the field's edge to
 *             six metres round its home and holds there; two imps come
 *             through it.
 *   25 %      enraged: the dive comes three times running, and only the
 *             last one sticks.
 */

/** The dive: seconds in the air, seconds before the end the shadow locks, its reach, its height. */
const DIVE_T = 2.1
const DIVE_LOCK = 1.1
const DIVE_R = 3.4
const DIVE_HIGH = 6.5
/** The sword wave: its reach, half-width, speed (m/s). */
const WAVE_LEN = 16
const WAVE_W = 1.3
const WAVE_SPEED = 13
/** The gate: from, to (metres round home), how long it closes and holds. */
const RING_FROM = 12
const RING_TO = 6.5
const RING_CLOSE = 6
const RING_HOLD = 16
const RING_BEAT = 0.5
const RING_N = 26

const hitsBuf: Unit[] = []
const COLOR = '#ff4a2a'
/** Where the gate closes in on: where the fight stands when it opens. */
const gates = new WeakMap<BossState, { x: number; z: number }>()

/** Leap out of reach; the shadow follows `tgt` until it locks, then the crash. */
const dive = (sim: Sim, u: Unit, tgt: Unit): void => {
  const b = u.boss!
  move(sim, u, 'slam', DIVE_T, 0.45, tgt, tgt.x, tgt.z, 2)
  b.mode = 'air'
  b.sub = 'dive'
  b.modeT = 0
  b.goalX = tgt.x
  b.goalZ = tgt.z
  b.carry = tgt.id
  warn(sim, u, { shape: 'circle', x: tgt.x, z: tgt.z, r: DIVE_R, w: 0, a: 0, dur: DIVE_T, follow: tgt.id, lock: DIVE_T - DIVE_LOCK })
  sim.emit({ t: 'fx', id: 'slam', x: u.x, z: u.z, r: 2.5, color: COLOR })
}

/** The wave: a wall of fire running down the lane to the rock. */
const wave = (sim: Sim, u: Unit, a: number): void => {
  const dx = Math.sin(a)
  const dz = Math.cos(a)
  const len = laneLength(sim, u.x, u.z, dx, dz, WAVE_LEN, 0.2)
  const hit = new Set<number>()
  const x0 = u.x
  const z0 = u.z
  const steps = Math.max(1, Math.ceil(len / 1.2))
  for (let k = 1; k <= steps; k++) {
    const d = (len * k) / steps
    sim.after(d / WAVE_SPEED, () => {
      if (!u.alive) return
      const x = x0 + dx * d
      const z = z0 + dz * d
      sim.emit({ t: 'fx', id: 'burst:ember', x, z, r: WAVE_W + 0.4, color: COLOR })
      if (k % 2 === 0) addField(sim, { fx: 'burning', kind: 'burnGround', src: u, x, z, r: WAVE_W, dur: 3.5, every: 0.5, dmg: u.s.baseDmg * 0.15, type: 'fire', v: u.s.baseDmg * 0.1, color: COLOR })
      for (const t of sim.inCircle(other(u), x, z, WAVE_W + 0.3, hitsBuf)) {
        if (hit.has(t.id)) continue
        hit.add(t.id)
        strikeFor(sim, u, t, 1.7, 'fire')
        knockback(t, x - dx, z - dz, 2.5)
      }
    })
  }
}

/** Pillars of hellfire erupting one after another on a line toward the hero. */
const pillars = (sim: Sim, u: Unit, tgt: Unit): void => {
  const a = Math.atan2(tgt.x - u.x, tgt.z - u.z)
  const dx = Math.sin(a)
  const dz = Math.cos(a)
  const reach = Math.hypot(tgt.x - u.x, tgt.z - u.z) + 3
  for (let k = 0; k < 6; k++) {
    const d = 2.5 + k * 2.1
    if (d > reach) break
    const x = u.x + dx * d
    const z = u.z + dz * d
    if (isSolidAt(sim.grid, x, z)) break
    const delay = 0.9 + k * 0.22
    warn(sim, u, { shape: 'circle', x, z, r: 1.5, w: 0, a: 0, dur: delay })
    sim.after(delay, () => {
      if (!u.alive) return
      addField(sim, { fx: 'pillar', kind: 'burnGround', src: u, x, z, r: 1.5, dur: 1.4, every: 0.45, dmg: u.s.baseDmg * 0.2, type: 'fire', v: u.s.baseDmg * 0.12, color: COLOR })
      for (const t of sim.inCircle(other(u), x, z, 1.6, hitsBuf)) {
        strikeFor(sim, u, t, 1.4, 'fire')
        applyStatus(sim, t, 'knockup', 0.6, 1, u)
      }
    })
  }
}

/** One beat of the closing gate: a ring of fire at its radius now. */
const ringBeat = (sim: Sim, u: Unit, r: number): void => {
  const c = gates.get(u.boss!) ?? { x: u.homeX, z: u.homeZ }
  for (let k = 0; k < RING_N; k++) {
    const ang = (k / RING_N) * Math.PI * 2
    const x = c.x + Math.sin(ang) * r
    const z = c.z + Math.cos(ang) * r
    if (isSolidAt(sim.grid, x, z)) continue
    addField(sim, { fx: 'burning', kind: 'burnGround', src: u, x, z, r: 1.3, dur: RING_BEAT * 1.9, every: 0.5, dmg: u.s.baseDmg * 0.2, type: 'fire', v: u.s.baseDmg * 0.1, color: COLOR })
  }
}

const hellgate: BossScript = {
  phases: [0.55, 0.25],
  think(sim, u, tgt) {
    const b = u.boss!
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    // A chain of dives (the last phase): the next one, straight away.
    if (b.n > 0) { b.n--; dive(sim, u, tgt); return true }
    if ((b.cd.dive ?? 0) <= 0 && d > 3.5) {
      b.cd.dive = b.phase >= 2 ? 10 : 13
      if (b.phase >= 3) b.n = 2
      dive(sim, u, tgt)
      return true
    }
    if (b.next > 0) return false
    const los = hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)
    if ((b.cd.wave ?? 0) <= 0 && los && d < WAVE_LEN) {
      b.cd.wave = b.phase >= 2 ? 6.5 : 8
      b.next = 2
      const act = move(sim, u, 'cone', 1.05, 0.7, tgt, tgt.x, tgt.z, 1)
      const len = laneLength(sim, u.x, u.z, Math.sin(act.a), Math.cos(act.a), WAVE_LEN, 0.2)
      warn(sim, u, { shape: 'line', x: u.x, z: u.z, r: len, w: WAVE_W, a: act.a, dur: 1.05, wind: 1.05 })
      return true
    }
    if ((b.cd.pillars ?? 0) <= 0 && los && d > 3 && d < 14) {
      b.cd.pillars = b.phase >= 2 ? 8 : 10
      b.next = 2
      move(sim, u, 'lob', 0.6, 0.6, tgt)
      return true
    }
    return false
  },
  land(sim, u, act) {
    const b = u.boss!
    if (act.id === 'cone') wave(sim, u, act.a)
    else if (act.id === 'lob') {
      const t = sim.live(act.targetId)
      if (t) pillars(sim, u, t)
    } else if (act.id === 'slam' && b.sub === 'dive') {
      // The crash: on the locked spot, everyone near thrown back.
      b.mode = ''
      b.sub = ''
      b.alt = 0
      b.carry = 0
      let x = b.goalX
      let z = b.goalZ
      if (isSolidAt(sim.grid, x, z)) {
        const o: [number, number] = [0, 0]
        if (nearestOpen(sim.grid, x, z, o, 4)) { x = o[0]; z = o[1] } else { x = u.x; z = u.z }
      }
      u.x = u.px = x
      u.z = u.pz = z
      sim.emit({ t: 'fx', id: 'quake', x, z, r: DIVE_R + 1, color: COLOR })
      sim.emit({ t: 'fx', id: 'slam', x, z, r: DIVE_R, color: COLOR })
      for (const t of sim.inCircle(other(u), x, z, DIVE_R, hitsBuf)) {
        strikeFor(sim, u, t, 2.2)
        knockback(t, x, z, 3.5)
      }
      addField(sim, { fx: 'burning', kind: 'burnGround', src: u, x, z, r: 2, dur: 3, every: 0.5, dmg: u.s.baseDmg * 0.15, type: 'fire', v: u.s.baseDmg * 0.1, color: COLOR })
      // The blade sticks in the stone — unless more dives are coming.
      if (b.n <= 0) daze(sim, u, 2.5, 0.5)
    }
  },
  onPhase(sim, u, phase) {
    const b = u.boss!
    if (phase === 2) {
      // The gate opens: a roar, the ring of fire, two imps through it.
      move(sim, u, 'enrage', 1.2, 0.5, null)
      sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 9, color: COLOR })
      bark(sim, u, 'archDemon', 'gate')
      b.cd.ring = 0
      b.cd.ringT = RING_CLOSE + RING_HOLD
      // Round the fight, between the demon and the hero.
      const h = sim.hero.unit
      const gx = (u.x * 2 + h.x) / 3
      const gz = (u.z * 2 + h.z) / 3
      gates.set(b, { x: gx, z: gz })
      for (let i = 0; i < 2; i++) {
        const ang = sim.rng() * Math.PI * 2
        const x = gx + Math.sin(ang) * (RING_TO - 1.5)
        const z = gz + Math.cos(ang) * (RING_TO - 1.5)
        if (isSolidAt(sim.grid, x, z)) continue
        const m = spawnEnemy(sim, 'imp', x, z, u.group, u)
        if (m) { m.awake = true; sim.emit({ t: 'fx', id: 'summon', x, z, color: COLOR }) }
      }
    }
    if (phase === 3) {
      applyStatus(sim, u, 'enrage', 60, 0.3, u)
      sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 9, color: COLOR })
      bark(sim, u, 'archDemon', 'dive')
      b.cd.dive = 0
    }
  },
  tick(sim, u) {
    // The gate: closing, then holding, laid a beat at a time.
    const b = u.boss!
    const left = b.cd.ringT ?? 0
    if (left <= 0 || (b.cd.ring ?? 0) > 0) return
    b.cd.ring = RING_BEAT
    const into = RING_CLOSE + RING_HOLD - left
    const k = Math.min(1, into / RING_CLOSE)
    ringBeat(sim, u, RING_FROM + (RING_TO - RING_FROM) * (k * k * (3 - 2 * k)))
  },
  air(sim, u, dt) {
    const b = u.boss!
    const act = u.action
    if (!act || act.id !== 'slam' || b.sub !== 'dive') { b.mode = ''; b.sub = ''; b.alt = 0; return false }
    const t = b.modeT
    const lockAt = DIVE_T - DIVE_LOCK
    // Up fast, hang while the shadow hunts, then down hard.
    if (t < 0.45) b.alt = DIVE_HIGH * (t / 0.45) ** 0.7
    else if (t < DIVE_T - 0.3) b.alt = DIVE_HIGH
    else b.alt = DIVE_HIGH * Math.max(0, (DIVE_T - t) / 0.3) ** 1.5
    const tgt = b.carry ? sim.live(b.carry) : undefined
    if (t < lockAt && tgt) { b.goalX = tgt.x; b.goalZ = tgt.z }
    act.x = b.goalX
    act.z = b.goalZ
    // It glides over its shadow.
    const mx = b.goalX - u.x
    const mz = b.goalZ - u.z
    const md = Math.hypot(mx, mz)
    const stepLen = Math.min(md, 18 * dt)
    if (md > 0.01) { u.x += (mx / md) * stepLen; u.z += (mz / md) * stepLen; u.facing = Math.atan2(mx, mz) }
    return true
  }
}

export const HELLGATE_SCRIPTS: Record<string, BossScript> = { hellgate }
/** The gate's middle (tests, the view's needs): none until it opens. */
export const gateOf = (u: Unit): { x: number; z: number } | undefined => (u.boss ? gates.get(u.boss) : undefined)
export const HELLGATE_TUNING = { DIVE_T, DIVE_LOCK, DIVE_R, RING_FROM, RING_TO, RING_CLOSE, RING_HOLD }
