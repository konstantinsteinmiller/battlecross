import { Group } from 'three'
import type { Enemy, World } from './world'
import { ENEMIES, scaleDmg, scaleHp, type Element } from '../data/enemies'
import {
  buildEnemyRig, poseHardhat, poseTrooper, poseHeli, poseHopper, poseRoller, poseBrute, poseTurret,
  BASE_COLORS, type EnemyKind, type EnemyColors
} from '../models/enemies'
import { makeTeleRing, setTeleRing, makeBlobShadow } from '../fx/markers'
import { hasLineOfSight, findPath, moveCircle, resolveCircle, smoothPath } from '../world/nav'
import { PLAYER_R } from './constants'

/**
 * ─── Enemy AI ────────────────────────────────────────────────────────────────
 *
 * One small state machine shared by every archetype:
 *
 *   idle ──sees you──▶ alert (0.45 s "!") ──▶ engage ──cooldown──▶ tele ──▶ act ──▶ recover ──▶ engage
 *                                                ▲                                                  │
 *                                                └──────────── stun (parry / full charge) ◀─────────┘
 *
 * `engage` is where the archetypes differ (keep range, hide, orbit, hop…);
 * `tele` always shows the ring, so every attack is readable a beat ahead.
 */

export const PARRY_WINDOW = 0.28

let nextId = 1

const ELEMENT_TINT: Record<Exclude<Element, 'none' | 'wind'>, Partial<EnemyColors>> = {
  fire: { main: '#ff6a3d', deep: '#b8321c', accent: '#ffd23a', eye: '#fff27a' },
  ice: { main: '#7fd6ff', deep: '#2f78ad', accent: '#ffffff', eye: '#bff6ff' },
  volt: { main: '#ffe13d', deep: '#7a4fd6', accent: '#b98cff', eye: '#d3fbff' }
}

export const colorsFor = (kind: EnemyKind, element: Element, elite: boolean): EnemyColors => {
  const base = { ...BASE_COLORS[kind] }
  if (element !== 'none' && element !== 'wind') Object.assign(base, ELEMENT_TINT[element])
  if (elite) base.accent = '#ffd84a'
  return base
}

export const createEnemy = (kind: EnemyKind, level: number, x: number, z: number, room: number, opts: { elite?: boolean; element?: Element } = {}): Enemy => {
  const def = ENEMIES[kind]
  const elite = !!opts.elite
  const element = opts.element ?? 'none'
  const rig = buildEnemyRig(kind, colorsFor(kind, element, elite))
  const root = new Group()
  root.add(rig.root)
  const scale = elite ? 1.18 : 1
  rig.root.scale.setScalar(scale)
  const hp = Math.round(scaleHp(def.hp, level) * (elite ? 2.5 : 1))
  const e: Enemy = {
    id: nextId++, kind, def, level, elite, boss: false, element,
    nameKey: `enemy.${kind}`,
    x, z, y: def.fly, px: x, pz: z, py: def.fly, yaw: Math.random() * Math.PI * 2, vx: 0, vz: 0,
    hp, maxHp: hp, dmg: Math.round(scaleDmg(def.dmg, level) * (elite ? 1.3 : 1)),
    room, awake: false, state: 'idle', st: 0, cd: 0.6 + Math.random() * 1.2, attack: '', step: 0,
    teleDur: def.tele, teleRed: def.unblockable, guard: kind === 'hardhat' || kind === 'trooper' ? 1 : 0, aim: 0,
    stunT: 0, flash: 0, path: null, pathT: 0, walk: 0, anim: Math.random() * 10, a: 0, b: 0,
    tx: 0, tz: 0, sx: 0, sz: 0, hitPlayer: false,
    rig, root, shadow: makeBlobShadow(def.radius * 1.1 * scale), ring: makeTeleRing(), deathT: 0,
    guardBreakT: 0, hurtAt: -10, bossId: null, phase2: false, burnT: 0, burnDps: 0, frozenT: 0, lastWeapon: ''
  }
  return e
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const angDiff = (a: number, b: number): number => {
  let d = a - b
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

const faceTo = (e: Enemy, x: number, z: number, rate: number, dt: number): void => {
  const want = Math.atan2(x - e.x, z - e.z)
  const d = angDiff(want, e.yaw)
  e.yaw += Math.max(-rate * dt, Math.min(rate * dt, d))
}

const distToPlayer = (w: World, e: Enemy): number => Math.hypot(w.player.x - e.x, w.player.z - e.z)

const seesPlayer = (w: World, e: Enemy): boolean =>
  hasLineOfSight(w.nav, e.x, e.z, w.player.x, w.player.z)

const _out: [number, number] = [0, 0]

/** Move with collision; returns the fraction of the intended move achieved. */
const step = (w: World, e: Enemy, dx: number, dz: number): number => {
  const want = Math.hypot(dx, dz)
  if (want < 1e-5) return 1
  moveCircle(w.nav, e.x, e.z, dx, dz, e.def.radius, _out)
  const got = Math.hypot(_out[0] - e.x, _out[1] - e.z)
  e.x = _out[0]
  e.z = _out[1]
  return got / want
}

/** Steer toward (tx, tz) at `speed`: straight when visible, A* otherwise. */
const seek = (w: World, e: Enemy, tx: number, tz: number, speed: number, dt: number): void => {
  let gx = tx
  let gz = tz
  if (!hasLineOfSight(w.nav, e.x, e.z, tx, tz)) {
    e.pathT -= dt
    if (!e.path || e.pathT <= 0) {
      const raw = findPath(w.nav, e.x, e.z, tx, tz, 700)
      e.path = raw ? smoothPath(w.nav, e.x, e.z, raw, e.def.radius) : null
      e.pathT = 0.7
    }
    if (e.path && e.path.length) {
      const [wx, wz] = e.path[0]!
      if (Math.hypot(wx - e.x, wz - e.z) < 0.5) e.path.shift()
      if (e.path.length) [gx, gz] = e.path[0]!
    }
  } else {
    e.path = null
  }
  const dx = gx - e.x
  const dz = gz - e.z
  const d = Math.hypot(dx, dz)
  if (d < 0.05) return
  const sp = Math.min(speed, d / dt)
  step(w, e, (dx / d) * sp * dt, (dz / d) * sp * dt)
  e.walk = Math.min(1, e.walk + dt * 4)
}

/** Hold the preferred distance band; strafe a little inside it. */
const keepRange = (w: World, e: Enemy, dt: number, strafe = 0.6): void => {
  const d = distToPlayer(w, e)
  const [lo, hi] = e.def.range
  const sp = e.def.speed
  if (d > hi || !seesPlayer(w, e)) {
    seek(w, e, w.player.x, w.player.z, sp, dt)
  } else if (d < lo) {
    const dx = (e.x - w.player.x) / (d || 1)
    const dz = (e.z - w.player.z) / (d || 1)
    step(w, e, dx * sp * 0.8 * dt, dz * sp * 0.8 * dt)
    e.walk = Math.min(1, e.walk + dt * 4)
  } else if (strafe > 0) {
    const s = Math.sin(w.time * 0.9 + e.id * 1.7)
    const dx = (e.z - w.player.z) / (d || 1)
    const dz = -(e.x - w.player.x) / (d || 1)
    step(w, e, dx * s * sp * strafe * dt, dz * s * sp * strafe * dt)
    e.walk = Math.min(1, e.walk + dt * 2 * Math.abs(s))
  }
}

/** Keep enemies from stacking on each other (and off the player). */
const separate = (w: World, e: Enemy): void => {
  for (const o of w.enemies) {
    if (o === e || o.state === 'dead' || o.offstage) continue
    const dx = e.x - o.x
    const dz = e.z - o.z
    const rr = e.def.radius + o.def.radius
    const d2 = dx * dx + dz * dz
    if (d2 < rr * rr && d2 > 1e-6) {
      const d = Math.sqrt(d2)
      const push = (rr - d) * 0.5
      e.x += (dx / d) * push
      e.z += (dz / d) * push
    }
  }
  if (e.def.fly === 0) {
    const dx = e.x - w.player.x
    const dz = e.z - w.player.z
    const rr = e.def.radius + PLAYER_R
    const d2 = dx * dx + dz * dz
    if (d2 < rr * rr && d2 > 1e-6) {
      const d = Math.sqrt(d2)
      e.x += (dx / d) * (rr - d)
      e.z += (dz / d) * (rr - d)
    }
  }
  const [rx, rz] = resolveCircle(w.nav, e.x, e.z, e.def.radius)
  e.x = rx
  e.z = rz
}

const enterState = (e: Enemy, s: Enemy['state']): void => {
  e.state = s
  e.st = 0
}

const startTele = (e: Enemy, attack: string, dur: number, red: boolean): void => {
  e.attack = attack
  e.teleDur = dur
  e.teleRed = red
  enterState(e, 'tele')
}

/** Wake an enemy (and, a beat later, its room-mates). */
export const wake = (w: World, e: Enemy, chain = true): void => {
  if (e.awake || e.state === 'dead' || e.offstage) return
  e.awake = true
  e.hold = false
  enterState(e, 'alert')
  e.cd = Math.max(e.cd, 0.8 + Math.random() * 0.6)
  if (chain) {
    for (const o of w.enemies) {
      if (o !== e && !o.awake && o.room === e.room && o.state !== 'dead' && !o.offstage) {
        o.awake = true
        enterState(o, 'alert')
        o.st = -0.15 - Math.random() * 0.35
        o.cd = Math.max(o.cd, 1.2 + Math.random() * 1.2)
      }
    }
  }
  w.sfx('alert', e.x, e.z)
}

// ─── Main update ─────────────────────────────────────────────────────────────

export const updateEnemy = (w: World, e: Enemy, dt: number): void => {
  e.px = e.x
  e.pz = e.z
  e.py = e.y
  e.st += dt
  e.anim += dt
  e.flash = Math.max(0, e.flash - dt * 8)
  e.walk = Math.max(0, e.walk - dt * 2.5)
  e.guardBreakT = Math.max(0, e.guardBreakT - dt)

  if (e.state === 'dead') {
    e.deathT += dt
    return
  }

  const d = distToPlayer(w, e)
  const def = e.def

  switch (e.state) {
    case 'idle': {
      // Idle bob / patrol-in-place; perception tick.
      if (!e.hold && d < def.aggro && seesPlayer(w, e)) wake(w, e)
      break
    }
    case 'alert': {
      faceTo(e, w.player.x, w.player.z, 7, dt)
      if (e.st > 0.45) enterState(e, 'engage')
      break
    }
    case 'stun': {
      e.stunT -= dt
      if (e.kind === 'heli') e.y = Math.max(0.45, e.y - dt * 6)
      if (e.stunT <= 0) {
        e.cd = Math.max(e.cd, 0.6)
        enterState(e, 'engage')
      }
      break
    }
    default:
      runArchetype(w, e, dt, d)
  }

  if (e.state !== 'tele') e.ring.visible = false
  separate(w, e)
}

const runArchetype = (w: World, e: Enemy, dt: number, d: number): void => {
  const def = e.def
  const px = w.player.x
  const pz = w.player.z
  if (e.state === 'engage') e.cd -= dt
  const canAttack = e.state === 'engage' && e.cd <= 0 && seesPlayer(w, e)
  const cooldown = () => def.cooldown * (0.7 + Math.random() * 0.6)

  switch (e.kind) {
    // ── Hardhat: hide, peek, spread, hide ────────────────────────────────
    case 'hardhat': {
      if (e.state === 'engage') {
        e.guard = Math.min(1, e.guard + dt * 5)
        faceTo(e, px, pz, 3, dt)
        if (d > 7) seek(w, e, px, pz, def.speed, dt)
        if (canAttack && d < 13) startTele(e, 'spread', def.tele + 0.2, false)
      } else if (e.state === 'tele') {
        e.guard = Math.max(0, 1 - e.st / 0.22)
        faceTo(e, px, pz, 8, dt)
        if (e.st >= e.teleDur) {
          const ang = Math.atan2(px - e.x, pz - e.z)
          for (const off of [-0.26, 0, 0.26]) {
            const a = ang + off
            w.fireEnemyShot(e, e.x + Math.sin(a) * 0.35, 0.42, e.z + Math.cos(a) * 0.35, Math.sin(a), 0.03, Math.cos(a), 10, e.dmg, true)
          }
          w.sfx('enemyShot', e.x, e.z)
          enterState(e, 'recover')
        }
      } else if (e.state === 'recover') {
        e.guard = e.st < 0.75 ? 0 : Math.min(1, (e.st - 0.75) / 0.2)
        if (e.st > 0.95) {
          e.cd = cooldown()
          enterState(e, 'engage')
        }
      }
      break
    }

    // ── Shield trooper: guard, lower shield, 3-round burst ───────────────
    case 'trooper': {
      if (e.state === 'engage') {
        e.guard = Math.min(1, e.guard + dt * 4)
        e.aim = Math.max(0, e.aim - dt * 4)
        faceTo(e, px, pz, 5, dt)
        keepRange(w, e, dt, 0.7)
        if (canAttack && d < 16) startTele(e, 'burst', def.tele, false)
      } else if (e.state === 'tele') {
        e.guard = Math.max(0, e.guard - dt * 5)
        e.aim = Math.min(1, e.aim + dt * 5)
        faceTo(e, px, pz, 8, dt)
        if (e.st >= e.teleDur) {
          e.step = 0
          enterState(e, 'act')
        }
      } else if (e.state === 'act') {
        const due = e.step * 0.16
        if (e.step < 3 && e.st >= due) {
          const a = Math.atan2(px - e.x, pz - e.z) + (Math.random() - 0.5) * 0.06
          const ox = e.x + Math.sin(e.yaw) * 0.3 + Math.cos(e.yaw) * 0.32
          const oz = e.z + Math.cos(e.yaw) * 0.3 - Math.sin(e.yaw) * 0.32
          const dy = (1.1 - 1.08) / Math.max(1, d)
          w.fireEnemyShot(e, ox, 1.08, oz, Math.sin(a), dy, Math.cos(a), 12.5, e.dmg, true)
          w.sfx('enemyShot', e.x, e.z)
          e.step++
        }
        if (e.st > 0.55) enterState(e, 'recover')
      } else if (e.state === 'recover') {
        e.aim = Math.max(0, e.aim - dt * 3)
        e.guard = Math.min(1, e.guard + dt * 3)
        if (e.st > 0.45) {
          e.cd = cooldown()
          enterState(e, 'engage')
        }
      }
      break
    }

    // ── Rotor drone: orbit, rise, swoop (parryable melee) ────────────────
    case 'heli': {
      const baseY = def.fly + Math.sin(e.anim * 2.2) * 0.12
      if (e.state === 'engage') {
        e.y += (baseY - e.y) * Math.min(1, dt * 3)
        faceTo(e, px, pz, 5, dt)
        // Orbit at the preferred band
        e.a += dt * 0.6 * (e.id % 2 ? 1 : -1)
        const r = (def.range[0] + def.range[1]) / 2
        const ox = px + Math.cos(e.a) * r
        const oz = pz + Math.sin(e.a) * r
        seek(w, e, ox, oz, def.speed * 0.8, dt)
        if (canAttack && d < 11) startTele(e, 'swoop', def.tele, false)
      } else if (e.state === 'tele') {
        e.y += (def.fly + 0.7 - e.y) * Math.min(1, dt * 4)
        faceTo(e, px, pz, 8, dt)
        if (e.st >= e.teleDur) {
          e.tx = px
          e.tz = pz
          e.hitPlayer = false
          enterState(e, 'act')
        }
      } else if (e.state === 'act') {
        // Dive at the player's head height
        const dx = w.player.x - e.x
        const dz = w.player.z - e.z
        const dd = Math.hypot(dx, dz)
        const sp = 11
        if (dd > 0.05) step(w, e, (dx / dd) * sp * dt, (dz / dd) * sp * dt)
        e.y += (1.25 - e.y) * Math.min(1, dt * 7)
        if (!e.hitPlayer && dd < 1.0 + PLAYER_R) {
          e.hitPlayer = true
          const r = w.hitPlayer(e, e.dmg, { blockable: true, fromX: e.x, fromZ: e.z, kind: 'melee' })
          if (r === 'parry') {
            e.stunT = 2.2
            enterState(e, 'stun')
            break
          }
          enterState(e, 'recover')
        } else if (e.st > 0.9) {
          enterState(e, 'recover')
        }
      } else if (e.state === 'recover') {
        // Pull back out and up
        const dx = e.x - px
        const dz = e.z - pz
        const dd = Math.hypot(dx, dz) || 1
        step(w, e, (dx / dd) * 5 * dt, (dz / dd) * 5 * dt)
        e.y += (baseY - e.y) * Math.min(1, dt * 3)
        if (e.st > 0.8) {
          e.cd = cooldown()
          enterState(e, 'engage')
        }
      }
      break
    }

    // ── Stomper: hop closer, crouch (red), leap, shockwave ───────────────
    case 'hopper': {
      if (e.state === 'engage') {
        faceTo(e, px, pz, 4, dt)
        e.a += dt
        // Small hops toward the player on a rhythm
        if (d > 3.5) {
          const phase = (e.a % 0.95) / 0.95
          if (phase < 0.45) seek(w, e, px, pz, def.speed * 2.2, dt)
          e.b = phase
        }
        if (canAttack && d < 8) {
          startTele(e, 'leap', def.tele, true)
          // Where it will land: the player's spot, clamped to 7 m
          const dx = px - e.x
          const dz = pz - e.z
          const dd = Math.hypot(dx, dz) || 1
          const reach = Math.min(dd, 7)
          e.tx = e.x + (dx / dd) * reach
          e.tz = e.z + (dz / dd) * reach
          w.markers.spawn(e.tx, e.tz, 2.6, def.tele + 0.7)
        }
      } else if (e.state === 'tele') {
        faceTo(e, e.tx, e.tz, 6, dt)
        if (e.st >= e.teleDur) {
          e.sx = e.x
          e.sz = e.z
          enterState(e, 'act')
          w.sfx('jump', e.x, e.z)
        }
      } else if (e.state === 'act') {
        const dur = 0.7
        const k = Math.min(1, e.st / dur)
        const nx = e.sx + (e.tx - e.sx) * k
        const nz = e.sz + (e.tz - e.sz) * k
        step(w, e, nx - e.x, nz - e.z)
        e.y = Math.sin(k * Math.PI) * 2.8
        if (k >= 1) {
          e.y = 0
          w.shocks.spawn(e.x, 0.05, e.z, 2.8, '#ff5a3a', 0.45)
          w.fx.sparks(e.x, 0.3, e.z, '#ffd9a0', 18, 7, 0.22)
          w.shake(0.45)
          w.sfx('stomp', e.x, e.z)
          if (Math.hypot(w.player.x - e.x, w.player.z - e.z) < 2.6 + PLAYER_R) {
            w.hitPlayer(e, Math.round(e.dmg * 1.3), { blockable: false, fromX: e.x, fromZ: e.z, kind: 'aoe' })
          }
          enterState(e, 'recover')
        }
      } else if (e.state === 'recover') {
        if (e.st > 1.0) {
          e.cd = cooldown()
          enterState(e, 'engage')
        }
      }
      break
    }

    // ── Gear roller: rev (red), charge in a line, dizzy on a wall ────────
    case 'roller': {
      if (e.state === 'engage') {
        faceTo(e, px, pz, 3.5, dt)
        keepRange(w, e, dt, 0.4)
        if (canAttack && d < 14 && d > 3) startTele(e, 'charge', def.tele, true)
      } else if (e.state === 'tele') {
        faceTo(e, px, pz, 6, dt)
        e.a += dt * 30 // wheel revs
        if (e.st >= e.teleDur) {
          const dx = px - e.x
          const dz = pz - e.z
          const dd = Math.hypot(dx, dz) || 1
          e.tx = dx / dd
          e.tz = dz / dd
          e.hitPlayer = false
          enterState(e, 'act')
          w.sfx('dash', e.x, e.z)
        }
      } else if (e.state === 'act') {
        const sp = 12
        const frac = step(w, e, e.tx * sp * dt, e.tz * sp * dt)
        e.a += dt * 40
        e.walk = 1
        if (!e.hitPlayer && Math.hypot(w.player.x - e.x, w.player.z - e.z) < e.def.radius + PLAYER_R + 0.15) {
          e.hitPlayer = true
          w.hitPlayer(e, e.dmg, { blockable: false, fromX: e.x, fromZ: e.z, kind: 'melee' })
        }
        if (frac < 0.4 && e.st > 0.1) {
          // Hit a wall: dizzy
          w.fx.sparks(e.x + e.tx * 0.7, 0.8, e.z + e.tz * 0.7, '#ffe07a', 14, 6)
          w.shake(0.15)
          w.sfx('bonk', e.x, e.z)
          e.stunT = 1.4
          enterState(e, 'stun')
        } else if (e.st > 1.5) {
          enterState(e, 'recover')
        }
      } else if (e.state === 'recover') {
        if (e.st > 0.5) {
          e.cd = cooldown()
          enterState(e, 'engage')
        }
      }
      break
    }

    // ── Guardroid: two-punch combo (orange) or overhead slam (red) ───────
    case 'brute': {
      if (e.state === 'engage') {
        faceTo(e, px, pz, 3, dt)
        if (d > 2.3) seek(w, e, px, pz, def.speed, dt)
        if (canAttack && d < 3.2) {
          if (Math.random() < 0.35) startTele(e, 'slam', 1.1, true)
          else {
            e.step = 0
            startTele(e, 'combo', def.tele, false)
          }
        }
      } else if (e.state === 'tele') {
        faceTo(e, px, pz, e.attack === 'slam' ? 2 : 4, dt)
        if (e.st >= e.teleDur) enterState(e, 'act')
      } else if (e.state === 'act') {
        if (e.attack === 'combo') {
          // The punch lands on entering 'act'
          if (e.st <= dt * 1.5) {
            const reach = 3.0 + PLAYER_R
            const ang = Math.abs(angDiff(Math.atan2(px - e.x, pz - e.z), e.yaw))
            w.sfx('punch', e.x, e.z)
            if (d < reach && ang < 1.1) {
              w.hitPlayer(e, e.dmg, { blockable: true, fromX: e.x, fromZ: e.z, kind: 'melee' })
            }
            if (e.state !== 'act') break // parried → stunned
          }
          if (e.st > 0.25) {
            if (e.step === 0) {
              e.step = 1
              startTele(e, 'combo', 0.45, false)
            } else {
              enterState(e, 'recover')
            }
          }
        } else {
          if (e.st <= dt * 1.5) {
            w.shocks.spawn(e.x + Math.sin(e.yaw) * 1.2, 0.05, e.z + Math.cos(e.yaw) * 1.2, 3.4, '#ff5a3a', 0.5)
            w.fx.sparks(e.x + Math.sin(e.yaw) * 1.2, 0.3, e.z + Math.cos(e.yaw) * 1.2, '#ffd9a0', 22, 8, 0.24)
            w.shake(0.55)
            w.sfx('stomp', e.x, e.z)
            const sx = e.x + Math.sin(e.yaw) * 1.2
            const sz = e.z + Math.cos(e.yaw) * 1.2
            if (Math.hypot(px - sx, pz - sz) < 3.2 + PLAYER_R) {
              w.hitPlayer(e, Math.round(e.dmg * 1.5), { blockable: false, fromX: e.x, fromZ: e.z, kind: 'aoe' })
            }
          }
          if (e.st > 0.4) enterState(e, 'recover')
        }
      } else if (e.state === 'recover') {
        if (e.st > (e.attack === 'slam' ? 1.2 : 0.9)) {
          e.cd = cooldown()
          enterState(e, 'engage')
        }
      }
      break
    }

    // ── Wall cannon: aim, lob a shell at your feet (red marker) ──────────
    case 'turret': {
      if (e.state === 'engage') {
        faceTo(e, px, pz, 2.5, dt)
        if (canAttack && d < 20) {
          startTele(e, 'lob', def.tele, true)
          e.tx = px
          e.tz = pz
          w.markers.spawn(px, pz, 1.9, def.tele + 1.1)
        }
      } else if (e.state === 'tele') {
        faceTo(e, e.tx, e.tz, 4, dt)
        if (e.st >= e.teleDur) {
          w.lobShell(e, e.tx, e.tz, 1.1, e.dmg)
          w.sfx('lob', e.x, e.z)
          e.a = 1 // recoil
          enterState(e, 'recover')
        }
      } else if (e.state === 'recover') {
        if (e.st > 0.35) {
          e.cd = cooldown()
          enterState(e, 'engage')
        }
      }
      e.a = Math.max(0, e.a - dt * 4)
      break
    }
  }

  // Telegraph ring
  if (e.state === 'tele') {
    const k = e.st / e.teleDur
    const pw = Math.min(0.5, PARRY_WINDOW / e.teleDur)
    setTeleRing(e.ring, k, e.teleRed, pw, 0.9 + e.def.radius * 0.6)
  }
}

// ─── Visual sync (called per rendered frame) ─────────────────────────────────

export const syncEnemyVisual = (e: Enemy, alpha: number, time: number): void => {
  const x = e.px + (e.x - e.px) * alpha
  const z = e.pz + (e.z - e.pz) * alpha
  const y = e.py + (e.y - e.py) * alpha
  e.root.position.set(x, y, z)
  e.root.rotation.y = e.yaw
  e.shadow.position.set(x, 0.02, z)
  const sh = e.def.radius * 1.1 * (e.elite ? 1.18 : 1) * Math.max(0.45, 1 - y * 0.15)
  e.shadow.scale.setScalar(sh)
  const r = e.rig
  const t = e.anim
  // Hit flash (white emissive pulse) + stun wobble
  r.material.emissive.setScalar(e.flash * 0.85)
  const stunned = e.state === 'stun'
  if (e.state === 'dead') {
    // Pop: squash and vanish
    const k = Math.min(1, e.deathT / 0.14)
    e.root.scale.setScalar(Math.max(0.001, 1 + k * 0.25))
    e.root.visible = e.deathT < 0.14
    e.shadow.visible = e.root.visible
    e.ring.visible = false
    return
  }
  switch (e.kind) {
    case 'hardhat':
      poseHardhat(r, 1 - e.guard, t, e.walk)
      break
    case 'trooper': {
      const g = e.guardBreakT > 0 ? 0 : e.guard
      poseTrooper(r, g, e.aim, t, e.walk)
      break
    }
    case 'heli': {
      const tilt = e.state === 'act' ? 0.45 : e.state === 'tele' ? -0.25 : 0.08
      poseHeli(r, t, tilt, t * (stunned ? 4 : 28))
      break
    }
    case 'hopper': {
      let sq = Math.sin(t * 2.2) * 0.06
      if (e.state === 'tele') sq = -Math.min(1, e.st / 0.3)
      else if (e.state === 'act') sq = 0.8
      else if (e.state === 'recover') sq = -0.6 * Math.max(0, 1 - e.st * 3)
      else if (e.state === 'engage' && e.b < 0.45 && e.walk > 0.2) sq = Math.sin((e.b / 0.45) * Math.PI) * 0.6
      poseHopper(r, sq, t)
      break
    }
    case 'roller':
      poseRoller(r, e.a + e.walk * t * 6, t, e.state === 'act' ? 1 : e.state === 'tele' ? -0.5 : 0.2)
      break
    case 'brute': {
      let arm = 0
      let k = 0
      let slam = 0
      if (e.attack === 'combo' && (e.state === 'tele' || e.state === 'act')) {
        arm = e.step === 0 ? 1 : -1
        k = e.state === 'tele' ? -Math.min(1, e.st / e.teleDur) : Math.min(1, e.st / 0.08)
      } else if (e.attack === 'slam' && (e.state === 'tele' || e.state === 'act')) {
        slam = e.state === 'tele' ? -0.4 * Math.min(1, e.st / e.teleDur) : Math.min(1, e.st / 0.1)
      }
      poseBrute(r, t, e.walk, arm, k, slam)
      break
    }
    case 'turret': {
      poseTurret(r, 0.35, e.a)
      break
    }
  }
  if (stunned) {
    e.root.rotation.z = Math.sin(time * 18) * 0.08
  } else {
    e.root.rotation.z = 0
  }
  // Ring position above the enemy
  if (e.ring.visible) e.ring.position.set(x, y + e.rig.height * (e.elite ? 1.18 : 1) + 0.45, z)
}
