import { Group } from 'three'
import type { Enemy, World } from './world'
import { BOSSES, type BossDef } from '../data/bosses'
import { buildBossRig, poseBoss, type BossId } from '../models/bosses'
import { makeTeleRing, setTeleRing, makeBlobShadow } from '../fx/markers'
import { scaleDmg, scaleHp } from '../data/enemies'
import { moveCircle, hasLineOfSight, isSolidAt } from '../world/nav'
import { cellCenter, type Room } from '../world/levelGen'
import { PARRY_WINDOW } from './enemies'
import { PLAYER_R, EYE_H } from './constants'
import { pushHud } from '../state/hud'

/**
 * ─── Core Master AI ──────────────────────────────────────────────────────────
 *
 * Bosses share the enemy record but run their own loop: an intro (drop in,
 * name card, the energy bar filling segment by segment), then a pattern
 * picker — never the same pattern twice in a row — over a small set of attack
 * primitives (volleys, lobs, leaps, dashes, floor waves, shock rings, homing
 * orbs, blinks, beams). At half health the master roars (invulnerable for a
 * beat, a shock ring bursts out) and unlocks its phase-2 patterns and a
 * shorter cooldown.
 */

export const BOSS_INTRO_T = 2.4

let nextBossId = 100000

export const createBoss = (id: BossId, level: number, x: number, z: number, room: number): Enemy => {
  const def = BOSSES[id]
  const rig = buildBossRig(id)
  const root = new Group()
  root.add(rig.root)
  rig.root.scale.setScalar(def.scale)
  const hp = scaleHp(def.hp, level)
  return {
    id: nextBossId++, kind: 'brute', def, level, elite: false, boss: true, element: def.element,
    nameKey: `boss.${id}`,
    x, z, y: 0, px: x, pz: z, py: 0, yaw: 0, vx: 0, vz: 0,
    hp, maxHp: hp, dmg: scaleDmg(def.dmg, level), room, awake: false, state: 'idle', st: 0, cd: 1.2,
    attack: '', step: 0, teleDur: def.tele, teleRed: false, guard: 0, aim: 0, stunT: 0, flash: 0,
    path: null, pathT: 0, walk: 0, anim: 0, a: 0, b: 0, tx: 0, tz: 0, sx: 0, sz: 0, hitPlayer: false,
    rig, root, shadow: makeBlobShadow(def.radius * 1.2), ring: makeTeleRing(), deathT: 0,
    guardBreakT: 0, hurtAt: -10, bossId: id, phase2: false, burnT: 0, burnDps: 0, frozenT: 0, lastWeapon: ''
  }
}

const bdef = (e: Enemy): BossDef => e.def as BossDef

const angDiff = (a: number, b: number): number => {
  let d = a - b
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

const faceTo = (e: Enemy, x: number, z: number, rate: number, dt: number): void => {
  const want = Math.atan2(x - e.x, z - e.z)
  e.yaw += Math.max(-rate * dt, Math.min(rate * dt, angDiff(want, e.yaw)))
}

const _o: [number, number] = [0, 0]
const step = (w: World, e: Enemy, dx: number, dz: number): number => {
  const want = Math.hypot(dx, dz)
  if (want < 1e-6) return 1
  moveCircle(w.nav, e.x, e.z, dx, dz, e.def.radius, _o)
  const got = Math.hypot(_o[0] - e.x, _o[1] - e.z)
  e.x = _o[0]
  e.z = _o[1]
  return got / want
}

/** Pattern metadata: telegraph length and whether the ring is red. */
const PATTERN: Record<string, { tele: number; red: boolean }> = {
  charge: { tele: 0.9, red: true },
  scrapToss: { tele: 0.7, red: true },
  stomp: { tele: 0.8, red: true },
  magnetPunch: { tele: 1.0, red: false },
  fireWave: { tele: 0.7, red: true },
  flameBurst: { tele: 0.6, red: false },
  leapSlam: { tele: 0.8, red: true },
  flameRing: { tele: 1.0, red: true },
  iceVolley: { tele: 0.55, red: false },
  iceVolleyBig: { tele: 0.6, red: false },
  freezeFloor: { tele: 0.6, red: true },
  dashSlash: { tele: 0.55, red: false },
  chainBolt: { tele: 0.9, red: false },
  orbStorm: { tele: 0.8, red: false },
  blink: { tele: 0.35, red: false },
  voltRing: { tele: 0.9, red: true },
  featherFan: { tele: 0.6, red: false },
  tornado: { tele: 0.8, red: true },
  dive: { tele: 0.9, red: false },
  featherStorm: { tele: 0.8, red: false },
  lobBarrage: { tele: 0.8, red: true }
}

// ─── Intro / phase control (called by the mission) ──────────────────────────

export const startBossIntro = (e: Enemy): void => {
  e.awake = true
  e.state = 'alert'
  e.st = 0
  e.y = 9
}

export const updateBoss = (w: World, e: Enemy, dt: number, room: Room | null): void => {
  e.px = e.x
  e.pz = e.z
  e.py = e.y
  e.st += dt
  e.anim += dt
  e.flash = Math.max(0, e.flash - dt * 8)
  e.walk = Math.max(0, e.walk - dt * 2.5)
  if (e.state === 'dead') {
    e.deathT += dt
    // A ripple of explosions across the body before the big pop
    if (e.deathT < 1.6 && Math.random() < dt * 14) {
      const s = bdef(e).scale
      w.fx.orbBurst(e.x + (Math.random() - 0.5) * 1.4 * s, e.y + Math.random() * 2 * s, e.z + (Math.random() - 0.5) * 1.4 * s, bdef(e).color, 0.6)
      w.shake(0.12)
    }
    return
  }
  const d = Math.hypot(w.player.x - e.x, w.player.z - e.z)
  const def = bdef(e)
  const fly = def.fly

  if (e.state === 'idle') return
  if (e.state === 'alert') {
    // Intro: drop in from above, land with a shock ring.
    const k = Math.min(1, e.st / 0.8)
    e.y = fly + (1 - k * k) * 9
    if (k >= 1 && e.a === 0) {
      e.a = 1
      w.shocks.spawn(e.x, 0.05, e.z, 4, def.color, 0.5)
      w.fx.sparks(e.x, 0.3, e.z, def.color, 24, 8, 0.24)
      w.shake(0.5)
      w.sfx('stomp', e.x, e.z)
    }
    faceTo(e, w.player.x, w.player.z, 6, dt)
    if (e.st >= BOSS_INTRO_T) {
      e.state = 'engage'
      e.st = 0
      e.a = 0
      e.cd = 0.8
    }
    return
  }
  if (e.state === 'stun') {
    e.stunT -= dt
    e.y += (fly - e.y) * Math.min(1, dt * 6)
    if (e.stunT <= 0) {
      e.state = 'engage'
      e.st = 0
      e.cd = Math.max(e.cd, 0.4)
    }
    return
  }
  // Phase 2: roar (invulnerable beat) + ring burst
  if (!e.phase2 && e.hp < e.maxHp * 0.5 && (e.state === 'engage' || e.state === 'recover')) {
    e.phase2 = true
    e.state = 'act'
    e.attack = 'roar'
    e.st = 0
    e.ring.visible = false
    pushHud({ t: 'flash', color: def.color, strength: 0.35 })
    w.sfx('bossIntro', e.x, e.z)
    return
  }

  switch (e.state) {
    case 'engage': {
      e.y += (fly + Math.sin(e.anim * 2) * (fly > 0 ? 0.25 : 0) - e.y) * Math.min(1, dt * 4)
      faceTo(e, w.player.x, w.player.z, 5, dt)
      // Hold mid range with a lazy strafe
      const [lo, hi] = def.range
      const px = w.player.x
      const pz = w.player.z
      const nx = (e.x - px) / (d || 1)
      const nz = (e.z - pz) / (d || 1)
      let mx = 0
      let mz = 0
      if (d > hi) { mx -= nx; mz -= nz }
      else if (d < lo) { mx += nx; mz += nz }
      const s = Math.sin(e.anim * 0.7 + e.id) > 0 ? 1 : -1
      mx += -nz * s * 0.7
      mz += nx * s * 0.7
      const ml = Math.hypot(mx, mz)
      if (ml > 0.01) {
        step(w, e, (mx / ml) * def.speed * dt, (mz / ml) * def.speed * dt)
        e.walk = Math.min(1, e.walk + dt * 4)
      }
      e.cd -= dt
      if (e.cd <= 0) {
        const pool = e.phase2 ? [...def.patterns, ...def.patterns2] : def.patterns
        let pick = pool[Math.floor(Math.random() * pool.length)]!
        if (pick === e.attack && pool.length > 1) pick = pool[(pool.indexOf(pick) + 1) % pool.length]!
        const meta = PATTERN[pick] ?? { tele: 0.8, red: false }
        e.attack = pick
        e.teleDur = meta.tele * (e.phase2 ? 0.85 : 1)
        e.teleRed = meta.red
        e.state = 'tele'
        e.st = 0
        e.step = 0
        e.hitPlayer = false
        // Aim now: leaps/lobs commit to where the player stood at the wind-up
        e.tx = w.player.x
        e.tz = w.player.z
        if (pick === 'stomp' || pick === 'leapSlam') w.markers.spawn(e.tx, e.tz, 2.8, e.teleDur + 0.75)
      }
      break
    }
    case 'tele': {
      faceTo(e, w.player.x, w.player.z, e.attack === 'charge' || e.attack === 'dashSlash' ? 3 : 7, dt)
      if (e.attack === 'dive') e.y += (4 - e.y) * Math.min(1, dt * 3)
      const pw = Math.min(0.5, PARRY_WINDOW / e.teleDur)
      setTeleRing(e.ring, e.st / e.teleDur, e.teleRed, pw, 1.4 * def.scale)
      if (e.st >= e.teleDur) {
        e.state = 'act'
        e.st = 0
        e.step = 0
        e.sx = e.x
        e.sz = e.z
        e.ring.visible = false
      }
      break
    }
    case 'act':
      if (runPattern(w, e, dt, d, room)) {
        e.state = 'recover'
        e.st = 0
      }
      break
    case 'recover': {
      e.y += (fly - e.y) * Math.min(1, dt * 5)
      faceTo(e, w.player.x, w.player.z, 4, dt)
      if (e.st > (e.phase2 ? 0.45 : 0.7)) {
        e.state = 'engage'
        e.st = 0
        e.cd = def.cooldown * (e.phase2 ? 0.7 : 1) * (0.8 + Math.random() * 0.4)
      }
      break
    }
  }
  if (e.state !== 'tele') e.ring.visible = false
  // Keep the player out of the boss's body
  const rr = e.def.radius + PLAYER_R
  if (fly === 0 && d < rr && d > 1e-4) {
    e.x = w.player.x + ((e.x - w.player.x) / d) * rr
    e.z = w.player.z + ((e.z - w.player.z) / d) * rr
  }
}

// ─── Patterns ────────────────────────────────────────────────────────────────

/** Fire a fan of `n` shots over `spread` radians toward the player. */
const volley = (w: World, e: Enemy, n: number, spread: number, speed: number, dmgMul: number, blockable: boolean, y = 1.2): void => {
  const base = Math.atan2(w.player.x - e.x, w.player.z - e.z)
  const s = bdef(e).scale
  for (let k = 0; k < n; k++) {
    const a = base + (n === 1 ? 0 : (k / (n - 1) - 0.5) * spread)
    w.fireEnemyShot(e, e.x + Math.sin(a) * 0.8 * s, y * s, e.z + Math.cos(a) * 0.8 * s, Math.sin(a), (EYE_H - 0.45 - y * s) / 14, Math.cos(a), speed, Math.round(e.dmg * dmgMul), blockable)
  }
  w.sfx('enemyShot', e.x, e.z)
}

/** Leap to (tx, tz) over `dur`; returns true on landing (with ring + AoE). */
const leap = (w: World, e: Enemy, dur: number, height: number, color: string): boolean => {
  const k = Math.min(1, e.st / dur)
  const nx = e.sx + (e.tx - e.sx) * k
  const nz = e.sz + (e.tz - e.sz) * k
  step(w, e, nx - e.x, nz - e.z)
  e.y = Math.sin(k * Math.PI) * height + bdef(e).fly
  if (k >= 1) {
    w.shocks.spawn(e.x, 0.05, e.z, 3.2, color, 0.45)
    w.fx.sparks(e.x, 0.3, e.z, color, 20, 8, 0.24)
    w.shake(0.5)
    w.sfx('stomp', e.x, e.z)
    if (Math.hypot(w.player.x - e.x, w.player.z - e.z) < 2.8 + PLAYER_R) {
      w.hitPlayer(e, Math.round(e.dmg * 1.3), { blockable: false, fromX: e.x, fromZ: e.z, kind: 'aoe' })
    }
    return true
  }
  return false
}

const melee = (w: World, e: Enemy, reach: number, dmgMul: number): void => {
  const d = Math.hypot(w.player.x - e.x, w.player.z - e.z)
  const ang = Math.abs(angDiff(Math.atan2(w.player.x - e.x, w.player.z - e.z), e.yaw))
  w.sfx('punch', e.x, e.z)
  if (d < reach + PLAYER_R && ang < 1.2) {
    w.hitPlayer(e, Math.round(e.dmg * dmgMul), { blockable: true, fromX: e.x, fromZ: e.z, kind: 'melee' })
  }
}

const lightning = (w: World, ax: number, ay: number, az: number, bx: number, by: number, bz: number, color: string): void => {
  const n = Math.max(6, Math.round(Math.hypot(bx - ax, bz - az) * 2.5))
  for (let k = 0; k <= n; k++) {
    const t = k / n
    const j = k === 0 || k === n ? 0 : 0.35
    w.fx.emit({
      x: ax + (bx - ax) * t + (Math.random() - 0.5) * j, y: ay + (by - ay) * t + (Math.random() - 0.5) * j,
      z: az + (bz - az) * t + (Math.random() - 0.5) * j, color, size: 0.35, sizeEnd: 0.1, life: 0.2
    })
  }
}

/** Run the current pattern; return true when it is finished. */
const runPattern = (w: World, e: Enemy, dt: number, d: number, room: Room | null): boolean => {
  const def = bdef(e)
  const s = def.scale
  const p = w.player
  switch (e.attack) {
    case 'roar': {
      if (e.step === 0) {
        e.step = 1
        w.spawnRing(e, e.x, e.z, 10, 12, Math.round(e.dmg * 0.9), def.color)
        w.shake(0.6)
      }
      e.flash = 0.6 + Math.sin(e.st * 30) * 0.4
      return e.st > 1.3
    }
    case 'charge': {
      if (e.step === 0) {
        const dx = p.x - e.x
        const dz = p.z - e.z
        const l = Math.hypot(dx, dz) || 1
        e.tx = dx / l
        e.tz = dz / l
        e.step = 1
        w.sfx('dash', e.x, e.z)
      }
      const frac = step(w, e, e.tx * 13 * dt, e.tz * 13 * dt)
      e.walk = 1
      if (!e.hitPlayer && d < e.def.radius + PLAYER_R + 0.2) {
        e.hitPlayer = true
        w.hitPlayer(e, Math.round(e.dmg * 1.2), { blockable: false, fromX: e.x, fromZ: e.z, kind: 'melee' })
      }
      if (frac < 0.4 && e.st > 0.1) {
        w.fx.sparks(e.x + e.tx, 1, e.z + e.tz, '#ffe07a', 20, 7)
        w.shake(0.35)
        w.sfx('bonk', e.x, e.z)
        e.state = 'stun'
        e.stunT = 1.7
        e.st = 0
        pushHud({ t: 'text', x: e.x, y: 2.8, z: e.z, key: 'combat.dizzy', color: '#ffe07a' })
        return false
      }
      return e.st > 1.6
    }
    case 'scrapToss':
    case 'lobBarrage': {
      const n = e.attack === 'lobBarrage' ? 5 : 3
      const due = e.step * 0.15
      if (e.step < n && e.st >= due) {
        const ang = Math.atan2(p.x - e.x, p.z - e.z) + Math.PI / 2
        const off = (e.step - (n - 1) / 2) * 2.2
        const tx = p.x + Math.sin(ang) * off
        const tz = p.z + Math.cos(ang) * off
        w.markers.spawn(tx, tz, 1.9, 1.05)
        w.lobShell(e, tx, tz, 1.0, Math.round(e.dmg * 0.9))
        w.sfx('lob', e.x, e.z)
        e.step++
      }
      return e.st > n * 0.15 + 0.3
    }
    case 'stomp':
      return leap(w, e, 0.75, 3.8, def.color)
    case 'leapSlam': {
      if (e.step === 0 && leap(w, e, 0.7, 3.4, def.color)) {
        e.step = 1
        w.spawnRing(e, e.x, e.z, 8, 8, Math.round(e.dmg * 0.8), def.color)
      }
      return e.step === 1 && e.st > 0.9
    }
    case 'magnetPunch': {
      if (e.step === 0) {
        // Lunge in, then swing
        const dx = p.x - e.x
        const dz = p.z - e.z
        const l = Math.hypot(dx, dz) || 1
        if (l > 2.6) step(w, e, (dx / l) * 10 * dt, (dz / l) * 10 * dt)
        if (l <= 2.6 || e.st > 0.5) {
          e.step = 1
          melee(w, e, 3.2, 1.4)
        }
        return false
      }
      return e.st > 0.8
    }
    case 'fireWave':
    case 'tornado': {
      const n = e.attack === 'fireWave' ? (e.phase2 ? 3 : 1) : 2
      const due = e.step * (e.attack === 'tornado' ? 0.55 : 0.12)
      if (e.step < n && e.st >= due) {
        const base = Math.atan2(p.x - e.x, p.z - e.z)
        const a = e.attack === 'tornado' ? base + (e.step === 0 ? -0.15 : 0.15) : base + (n === 1 ? 0 : (e.step - 1) * 0.45)
        const color = e.attack === 'fireWave' ? '#ff7a2a' : '#bffff2'
        w.spawnWave(e, e.x + Math.sin(a) * 1.2, e.z + Math.cos(a) * 1.2, Math.sin(a), Math.cos(a),
          e.attack === 'fireWave' ? 9 : 6.5, e.attack === 'fireWave' ? 1.4 : 0.95, 24, Math.round(e.dmg * 1.1), color)
        w.sfx('dash', e.x, e.z)
        e.step++
      }
      return e.st > n * 0.5 + 0.2
    }
    case 'flameBurst':
      if (e.step === 0) { volley(w, e, 5, 1.0, 11, 0.8, true); e.step = 1 }
      return e.st > 0.4
    case 'flameRing': {
      const due = e.step * 0.55
      if (e.step < 2 && e.st >= due) {
        w.spawnRing(e, e.x, e.z, 7, 9, Math.round(e.dmg * 0.9), '#ff7a2a')
        e.step++
      }
      return e.st > 1.3
    }
    case 'iceVolley':
    case 'iceVolleyBig': {
      const n = e.attack === 'iceVolley' ? 3 : 5
      if (e.step < n && e.st >= e.step * 0.12) {
        volley(w, e, 1, 0, 17, 0.75, true)
        e.step++
      }
      return e.st > n * 0.12 + 0.2
    }
    case 'freezeFloor': {
      if (e.step === 0) {
        e.step = 1
        const pts: Array<[number, number]> = [[p.x, p.z], [p.x + 2.4, p.z + 1.2], [p.x - 2.2, p.z - 1.4]]
        for (const [x, z] of pts) {
          w.markers.spawn(x, z, 1.6, 1.0)
          w.lobShell(e, x, z, 0.95, Math.round(e.dmg * 0.9))
        }
      }
      return e.st > 1.1
    }
    case 'dashSlash': {
      if (e.step === 0) {
        const dx = p.x - e.x
        const dz = p.z - e.z
        const l = Math.hypot(dx, dz) || 1
        if (l > 1.9) step(w, e, (dx / l) * 17 * dt, (dz / l) * 17 * dt)
        if (Math.random() < 0.7) w.fx.emit({ x: e.x, y: 0.8 * s, z: e.z, color: def.color, size: 0.9, sizeEnd: 0.1, life: 0.25 })
        if (l <= 1.9 || e.st > 0.55) {
          e.step = 1
          melee(w, e, 2.6, 1.1)
        }
        return false
      }
      return e.st > 0.7
    }
    case 'chainBolt': {
      if (e.step === 0) {
        e.step = 1
        lightning(w, e.x, e.y + def.aimY * s, e.z, p.x, EYE_H - 0.4, p.z, '#fff27a')
        w.sfx('crit', e.x, e.z)
        if (hasLineOfSight(w.nav, e.x, e.z, p.x, p.z)) {
          w.hitPlayer(e, Math.round(e.dmg * 1.1), { blockable: true, fromX: e.x, fromZ: e.z, kind: 'shot' })
        }
      }
      return e.st > 0.35
    }
    case 'orbStorm': {
      if (e.step < 4 && e.st >= e.step * 0.15) {
        const a = Math.atan2(p.x - e.x, p.z - e.z) + (e.step - 1.5) * 0.5
        w.fireOrb(e, e.x + Math.sin(a) * s, 1.6 * s, e.z + Math.cos(a) * s, 5.5, Math.round(e.dmg * 0.8))
        e.step++
      }
      return e.st > 0.8
    }
    case 'blink': {
      if (e.step === 0) {
        e.step = 1
        w.fx.riseRing(e.x, 0.2, e.z, def.color, 0.9, 16)
        // Reappear somewhere in the room 5–9 m from the player
        if (room) {
          for (let tries = 0; tries < 12; tries++) {
            const i = room.x0 + Math.floor(Math.random() * room.w)
            const j = room.z0 + Math.floor(Math.random() * room.h)
            const x = cellCenter(i)
            const z = cellCenter(j)
            const dd = Math.hypot(x - p.x, z - p.z)
            if (dd > 5 && dd < 10 && !isSolidAt(w.nav, x, z)) {
              e.x = e.px = x
              e.z = e.pz = z
              break
            }
          }
        }
        w.fx.riseRing(e.x, 0.2, e.z, def.color, 0.9, 16)
        w.sfx('beamIn', e.x, e.z)
        e.cd = 0.15
      }
      return e.st > 0.25
    }
    case 'voltRing': {
      const due = e.step * 0.6
      if (e.step < 2 && e.st >= due) {
        w.spawnRing(e, e.x, e.z, 8, 10, Math.round(e.dmg * 0.9), '#fff27a')
        e.step++
      }
      return e.st > 1.4
    }
    case 'featherFan':
      if (e.step === 0) { volley(w, e, 7, 1.4, 12, 0.7, true); e.step = 1 }
      return e.st > 0.4
    case 'featherStorm': {
      if (e.step < 3 && e.st >= e.step * 0.3) {
        volley(w, e, 5, 1.2, 12, 0.65, true)
        e.step++
      }
      return e.st > 1.0
    }
    case 'dive': {
      if (e.step === 0) {
        const k = Math.min(1, e.st / 0.45)
        const nx = e.sx + (e.tx - e.sx) * k
        const nz = e.sz + (e.tz - e.sz) * k
        step(w, e, nx - e.x, nz - e.z)
        e.y = 4 * (1 - k) + 0.6 * k
        if (k >= 1) {
          e.step = 1
          melee(w, e, 2.4, 1.25)
          w.shocks.spawn(e.x, 0.05, e.z, 2.6, def.color, 0.35)
          w.shake(0.35)
        }
        return false
      }
      e.y += (def.fly - e.y) * Math.min(1, dt * 4)
      return e.st > 0.6
    }
  }
  return true
}

// ─── Visual sync ─────────────────────────────────────────────────────────────

export const syncBossVisual = (e: Enemy, alpha: number): void => {
  const x = e.px + (e.x - e.px) * alpha
  const z = e.pz + (e.z - e.pz) * alpha
  const y = e.py + (e.y - e.py) * alpha
  e.root.position.set(x, y, z)
  e.root.rotation.y = e.yaw
  e.shadow.position.set(x, 0.02, z)
  e.shadow.scale.setScalar(e.def.radius * 1.2 * Math.max(0.4, 1 - y * 0.08))
  e.rig.material.emissive.setScalar(e.flash * 0.5)
  const id = e.bossId!
  if (e.state === 'dead') {
    const k = Math.min(1, e.deathT / 1.6)
    e.root.visible = e.deathT < 1.7
    e.shadow.visible = e.root.visible
    e.root.rotation.z = Math.sin(e.deathT * 30) * 0.05 * k
    return
  }
  const act = e.state === 'tele' ? 'tele'
    : e.state === 'act' ? (e.y > (bdef(e).fly + 0.5) ? 'air' : 'attack')
      : e.state === 'stun' ? 'stun'
        : e.walk > 0.2 ? 'walk' : 'idle'
  const k = e.state === 'tele' ? Math.min(1, e.st / e.teleDur) : e.state === 'act' ? Math.min(1, e.st / 0.25) : 0
  poseBoss(e.rig, id, e.anim, act, k)
  if (e.ring.visible) e.ring.position.set(x, y + e.rig.height * bdef(e).scale + 0.6, z)
}

export const bossRoomOf = (rooms: Room[]): Room | null => rooms.find(r => r.role === 'boss') ?? null
