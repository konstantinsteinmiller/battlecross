import { hasLineOfSight } from '../grid'
import { addField } from '../actors'
import { applyStatus, knockback } from '../combat'
import { AIR_REACH, type Sim } from '../world'
import type { Unit } from '../types'
import type { BossScript } from './index'
import { daze, laneLength, move, other, strikeFor, warn } from './kit'

/**
 * ─── The Void Dragon, Skyfire (Dragonspine Peak) ────────────────────────────
 *
 *   100–60 %  grounded: a SWEEPING BREATH (the cone shows 1.3 s, then the
 *             fire sweeps across it in eight bursts, scorching the ground),
 *             its stomp and its bite (the def's abilities).
 *   60 %      it takes off, out of reach: three STRAFING RUNS, each aimed
 *             through the hero (the lane flashes 1.5 s, then it dives along
 *             it low, breathing fire; the trail burns 6 s), then a CRASH
 *             LANDING (its shadow grows 1.5 s) that knocks everyone back and
 *             leaves it lying dazed 4 s.
 *   30 %      enraged; at 15 % it takes off once more, for two runs.
 */

/** Cruising height and the height of a strafing dive, metres. */
const HIGH = 7
const LOW = 2.2
/** Seconds: the climb, the lane's warning, the climb after a pass, the landing's warning. */
const RISE = 1.3
const WARN = 1.5
const CLIMB = 0.7
const LANDING = 1.5
/** Dive speed (m/s), the fire trail's width, how often a patch of fire is laid. */
const DIVE = 16
const TRAIL_R = 1.35
const TRAIL_EVERY = 1.1

const hitsBuf: Unit[] = []

/** Begin a flight: `passes` strafing runs, then the crash landing. */
const takeOff = (sim: Sim, u: Unit, passes: number): void => {
  const b = u.boss!
  b.mode = 'air'
  b.modeT = 0
  b.sub = 'rise'
  b.n = passes
  u.action = null
  u.anim = 'idle'
  sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 7, color: '#c87aff' })
  sim.emit({ t: 'fx', id: 'slam', x: u.x, z: u.z, r: 4, color: '#c87aff' })
}

/** Plan the next run: a lane through where the hero stands, wall to wall. */
const planPass = (sim: Sim, u: Unit): void => {
  const b = u.boss!
  const h = sim.hero.unit
  // Across the hero, turned from the last run so no two runs share a lane.
  const base = b.n % 2 ? Math.atan2(h.x - u.x, h.z - u.z) : Math.atan2(h.x - u.x, h.z - u.z) + Math.PI / 2
  const a = base + (sim.rng() - 0.5) * 0.5
  const dx = Math.sin(a)
  const dz = Math.cos(a)
  const back = laneLength(sim, h.x, h.z, -dx, -dz, 16, 0.2)
  const fwd = laneLength(sim, h.x, h.z, dx, dz, 16, 0.2)
  b.dx = dx
  b.dz = dz
  // It starts a little past the wall behind (it comes in over the rock): it flies there high first.
  b.goalX = h.x - dx * (back + 2)
  b.goalZ = h.z - dz * (back + 2)
  b.left = back + fwd + 4
  b.sub = 'move'
  b.modeT = 0
}

/** At the lane's start: the lane flashes, the dive is coming. */
const warnPass = (sim: Sim, u: Unit): void => {
  const b = u.boss!
  const a = Math.atan2(b.dx, b.dz)
  u.facing = a
  b.sub = 'warn'
  b.modeT = 0
  warn(sim, u, { shape: 'line', x: u.x, z: u.z, r: b.left, w: TRAIL_R, a, dur: WARN })
}

const skyfire: BossScript = {
  phases: [0.6, 0.3],
  think(sim, u, tgt) {
    const b = u.boss!
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    // The second flight, once, low on health.
    if (b.phase >= 3 && !b.marks.includes('flight2') && u.hp <= u.s.maxHp * 0.15) {
      b.marks.push('flight2')
      takeOff(sim, u, 2)
      return true
    }
    if (b.next <= 0 && d < 10 && hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)) {
      b.next = (b.phase >= 3 ? 6 : 8) + sim.rng() * 2
      const act = move(sim, u, 'cone', 1.3, 2, tgt)
      warn(sim, u, { shape: 'cone', x: u.x, z: u.z, r: 9, w: 0.95, a: act.a, dur: 1.3, wind: 1.3 })
      return true
    }
    return false
  },
  land(sim, u, act) {
    if (act.id !== 'cone') return
    // The sweep: eight bursts across the cone, each scorching the ground where it reaches.
    const hitCount = new Map<number, number>()
    for (let k = 0; k < 8; k++) {
      const ang = act.a - 0.8 + (1.6 * k) / 7
      sim.after(k * 0.2, () => {
        if (!u.alive || u.boss?.mode) return
        sim.emit({ t: 'fx', id: 'breath', x: u.x, z: u.z, r: 9, a: ang, dur: 0.26, color: '#c87aff' })
        for (const t of sim.inCone(other(u), u.x, u.z, ang, 9, 0.26, hitsBuf)) {
          const n = hitCount.get(t.id) ?? 0
          if (n >= 2) continue
          hitCount.set(t.id, n + 1)
          strikeFor(sim, u, t, 0.9, 'shadow')
          applyStatus(sim, t, 'burn', 3, u.s.baseDmg * 0.2, u, { type: 'shadow', quiet: true })
        }
        if (k % 2 === 0) addField(sim, { fx: 'burning', kind: 'burnGround', src: u, x: u.x + Math.sin(ang) * 6, z: u.z + Math.cos(ang) * 6, r: 1.6, dur: 4, every: 0.5, dmg: u.s.baseDmg * 0.18, type: 'shadow', color: '#c87aff' })
      })
    }
  },
  onPhase(sim, u, phase) {
    if (phase === 2) takeOff(sim, u, 3)
    if (phase === 3) {
      applyStatus(sim, u, 'enrage', 60, 0.3, u)
      sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 8, color: '#c87aff' })
    }
  },
  air(sim, u, dt) {
    const b = u.boss!
    const t = b.modeT
    switch (b.sub) {
      case 'rise':
        b.alt = HIGH * Math.min(1, t / RISE) ** 0.8
        if (t >= RISE) planPass(sim, u)
        return true
      case 'move': {
        // High and fast to the start of the next lane.
        b.alt = HIGH
        const mx = b.goalX - u.x
        const mz = b.goalZ - u.z
        const md = Math.hypot(mx, mz)
        const stepLen = Math.min(md, 26 * dt)
        if (md > 0.01) { u.x += (mx / md) * stepLen; u.z += (mz / md) * stepLen; u.facing = Math.atan2(mx, mz) }
        if (md - stepLen < 0.05) warnPass(sim, u)
        return true
      }
      case 'warn':
        // Circling high while the lane flashes, then the dive.
        b.alt = HIGH
        if (t >= WARN) { b.sub = 'pass'; b.modeT = 0; b.speed = DIVE; b.carry = 0 }
        return true
      case 'pass': {
        // Down to a low glide breathing fire along the lane.
        b.alt = Math.max(LOW, b.alt - dt * 14)
        const stepLen = Math.min(b.left, b.speed * dt)
        u.x += b.dx * stepLen
        u.z += b.dz * stepLen
        b.left -= stepLen
        b.carry += stepLen
        if (b.carry >= TRAIL_EVERY) {
          b.carry = 0
          addField(sim, { fx: 'burning', kind: 'burnGround', src: u, x: u.x, z: u.z, r: TRAIL_R, dur: 6, every: 0.5, dmg: u.s.baseDmg * 0.22, type: 'shadow', color: '#c87aff' })
          sim.emit({ t: 'fx', id: 'burst:ember', x: u.x, z: u.z, r: 1.4, color: '#c87aff' })
        }
        // Whoever it passes over is caught in the breath (once a pass).
        for (const h of sim.inCircle(other(u), u.x, u.z, TRAIL_R + 0.3, hitsBuf)) {
          if (b.marks.includes('hit:' + h.id + ':' + b.n)) continue
          b.marks.push('hit:' + h.id + ':' + b.n)
          strikeFor(sim, u, h, 1.6, 'shadow')
          applyStatus(sim, h, 'burn', 4, u.s.baseDmg * 0.22, u, { type: 'shadow', quiet: true })
        }
        if (b.left <= 0) {
          b.n--
          b.sub = 'climb'
          b.modeT = 0
          b.marks = b.marks.filter(m => !m.startsWith('hit:'))
        }
        return true
      }
      case 'climb':
        b.alt = Math.min(HIGH, b.alt + dt * 9)
        if (t >= CLIMB) {
          if (b.n > 0) planPass(sim, u)
          else {
            // Down: over the middle of its field, the shadow grows.
            b.sub = 'land'
            b.modeT = 0
            u.x = u.homeX
            u.z = u.homeZ
            u.px = u.x
            u.pz = u.z
            warn(sim, u, { shape: 'circle', x: u.x, z: u.z, r: 4.5, w: 0, a: 0, dur: LANDING })
          }
        }
        return true
      case 'land':
        b.alt = HIGH * (1 - Math.min(1, t / LANDING)) ** 1.6
        if (t >= LANDING) {
          b.alt = 0
          b.mode = ''
          b.sub = ''
          sim.emit({ t: 'fx', id: 'quake', x: u.x, z: u.z, r: 4.5, color: '#c87aff' })
          for (const h of sim.inCircle(other(u), u.x, u.z, 4.5, hitsBuf)) { strikeFor(sim, u, h, 1.4); knockback(h, u.x, u.z, 7) }
          // It hit the ground hard: down, dazed.
          daze(sim, u, 4, 0.5)
          b.next = 3
        }
        return true
    }
    b.mode = ''
    b.alt = 0
    return false
  }
}

export const SKYFIRE_SCRIPTS: Record<string, BossScript> = { skyfire }
export const SKYFIRE_TUNING = { HIGH, LOW, RISE, WARN, CLIMB, LANDING, AIR_REACH }
