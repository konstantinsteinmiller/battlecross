import {
  CELL, cellOf, centerOf, clearCorridor, findPath, hasLineOfSight, isSolidAt, isSolidCell, moveCircle, nearestOpen,
  setTempSolid, smoothPath
} from './grid'
import { applyStatus, attackSpeedOf, dealDamage, heal, isControlled, moveSpeedOf } from './combat'
import { angleTo, hasStatus, newAction, statusV, type Sim } from './world'
import type { DamageType, Field, Projectile, StatusId, Team, Unit } from './types'

/**
 * ─── Bodies in the world ─────────────────────────────────────────────────────
 *
 * What every unit does the same way, hero and goblin alike: walking (straight
 * when the way is clear, along an A* path when it is not), keeping apart from
 * its neighbours, the basic weapon attack, and the things attacks leave in the
 * world — projectiles, lingering ground fields, temporary walls.
 */

const out2: [number, number] = [0, 0]
const hits: Unit[] = []

// ─── Walking ─────────────────────────────────────────────────────────────────

/** Give a unit somewhere to go. Paths only when the straight line is blocked. */
export const setGoal = (sim: Sim, u: Unit, x: number, z: number): void => {
  let gx = x
  let gz = z
  if (isSolidAt(sim.grid, gx, gz)) {
    if (!nearestOpen(sim.grid, gx, gz, out2, 5)) return
    gx = out2[0]
    gz = out2[1]
  }
  u.goalX = gx
  u.goalZ = gz
  u.hasGoal = true
  u.pathI = 0
  if (clearCorridor(sim.grid, u.x, u.z, gx, gz, u.r * 0.9)) {
    u.path.length = 0
    return
  }
  if (findPath(sim.grid, u.x, u.z, gx, gz, u.path) > 0) smoothPath(sim.grid, u.x, u.z, u.path, u.r * 0.9)
  else {
    // No way there: go as far as the straight line allows.
    u.path.length = 0
  }
}

export const stop = (u: Unit): void => {
  u.hasGoal = false
  u.path.length = 0
  u.pathI = 0
}

/** Step a unit toward its goal. Returns true while it is still on the way. */
export const walk = (sim: Sim, u: Unit, dt: number, speedMul = 1): boolean => {
  if (!u.hasGoal) return false
  let tx = u.goalX
  let tz = u.goalZ
  if (u.pathI * 2 < u.path.length) {
    tx = u.path[u.pathI * 2]!
    tz = u.path[u.pathI * 2 + 1]!
  }
  const dx = tx - u.x
  const dz = tz - u.z
  const d = Math.hypot(dx, dz)
  const stepLen = moveSpeedOf(u) * speedMul * dt
  if (d <= Math.max(0.06, stepLen)) {
    if (u.pathI * 2 < u.path.length - 2) {
      u.pathI++
      return true
    }
    moveCircle(sim.grid, u.x, u.z, dx, dz, u.r, out2)
    u.x = out2[0]
    u.z = out2[1]
    stop(u)
    return false
  }
  moveCircle(sim.grid, u.x, u.z, (dx / d) * stepLen, (dz / d) * stepLen, u.r, out2)
  u.x = out2[0]
  u.z = out2[1]
  u.facing = turnToward(u.facing, Math.atan2(dx, dz), dt * 14)
  return true
}

/** Step a unit in a direction (the stick, a kiting retreat). */
export const stride = (sim: Sim, u: Unit, dirX: number, dirZ: number, dt: number, speedMul = 1): void => {
  const l = Math.hypot(dirX, dirZ)
  if (l < 1e-4) return
  const stepLen = moveSpeedOf(u) * speedMul * Math.min(1, l) * dt
  moveCircle(sim.grid, u.x, u.z, (dirX / l) * stepLen, (dirZ / l) * stepLen, u.r, out2)
  u.x = out2[0]
  u.z = out2[1]
  u.facing = turnToward(u.facing, Math.atan2(dirX, dirZ), dt * 14)
}

export const turnToward = (from: number, to: number, maxStep: number): number => {
  let d = to - from
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  if (Math.abs(d) <= maxStep) return to
  return from + Math.sign(d) * maxStep
}

export const face = (u: Unit, x: number, z: number): void => {
  if (Math.abs(x - u.x) + Math.abs(z - u.z) > 1e-4) u.facing = angleTo(u.x, u.z, x, z)
}

/** Keep bodies from standing inside each other, and apply knockback. */
export const separate = (sim: Sim, dt: number): void => {
  const us = sim.units
  for (let i = 0; i < us.length; i++) {
    const a = us[i]!
    if (!a.alive) continue
    if (a.kx !== 0 || a.kz !== 0) {
      moveCircle(sim.grid, a.x, a.z, a.kx * dt, a.kz * dt, a.r, out2)
      a.x = out2[0]
      a.z = out2[1]
      const k = Math.exp(-dt * 8)
      a.kx *= k
      a.kz *= k
      if (Math.abs(a.kx) + Math.abs(a.kz) < 0.05) a.kx = a.kz = 0
    }
    if (a.rank === 'npc' || a.rank === 'turret') continue
    for (let j = i + 1; j < us.length; j++) {
      const b = us[j]!
      if (!b.alive) continue
      const dx = b.x - a.x
      const dz = b.z - a.z
      const rr = (a.r + b.r) * 0.9
      const d2 = dx * dx + dz * dz
      if (d2 >= rr * rr || d2 < 1e-6) continue
      const d = Math.sqrt(d2)
      const push = (rr - d) * 0.5
      const nx = dx / d
      const nz = dz / d
      // The heavier body gives less; statues and turrets give nothing.
      const fixedB = b.rank === 'npc' || b.rank === 'turret' || b.rank === 'boss'
      const fixedA = a.rank === 'boss'
      const wa = fixedA ? 0 : fixedB ? 2 : 1
      const wb = fixedB ? 0 : fixedA ? 2 : 1
      if (wa > 0) {
        moveCircle(sim.grid, a.x, a.z, -nx * push * wa, -nz * push * wa, a.r, out2)
        a.x = out2[0]
        a.z = out2[1]
      }
      if (wb > 0) {
        moveCircle(sim.grid, b.x, b.z, nx * push * wb, nz * push * wb, b.r, out2)
        b.x = out2[0]
        b.z = out2[1]
      }
    }
  }
}

// ─── The basic attack ────────────────────────────────────────────────────────

/** Is `tgt` close enough (and visible enough) for `u`'s weapon? */
export const inAttackRange = (sim: Sim, u: Unit, tgt: Unit, slack = 0): boolean => {
  const d = Math.hypot(tgt.x - u.x, tgt.z - u.z) - tgt.r
  if (d > u.s.atkRange + slack) return false
  return u.s.atkStyle === 'melee' || hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)
}

/** Begin a basic swing at `tgt` if the weapon is ready. */
export const startAttack = (sim: Sim, u: Unit, tgt: Unit, windup: number): boolean => {
  if (u.attackCd > 0 || u.action || isControlled(u)) return false
  const speed = attackSpeedOf(u)
  const interval = u.s.atkInterval / speed
  const w = Math.min(interval * 0.6, windup / speed)
  u.action = newAction(u, 'attack', w, Math.max(w + 0.08, interval * 0.72), tgt.id, tgt.x, tgt.z)
  u.attackCd = interval
  u.anim = 'attack'
  u.animT = 0
  u.animStyle = u.swings % 2
  face(u, tgt.x, tgt.z)
  stop(u)
  sim.emit({ t: 'swing', src: u.id, style: u.s.atkStyle, heavy: u.s.atkHeavy })
  return true
}

/** The swing lands (melee) or leaves the weapon (ranged, magic). `mul` scales
 *  it (an off-hand follow-up is half strength). */
export const resolveAttack = (sim: Sim, u: Unit, tgt: Unit | undefined, mul = 1, shotFx = ''): void => {
  u.swings++
  if (!tgt || !tgt.alive) return
  const base = u.s.baseDmg * mul
  if (u.s.atkStyle === 'melee') {
    // A melee swing misses a target that walked out of reach during the wind-up.
    if (Math.hypot(tgt.x - u.x, tgt.z - u.z) - tgt.r > u.s.atkRange + 1.1) return
    const dealt = dealDamage(sim, u, tgt, base, { type: u.s.atkType, attack: true, heavy: u.s.atkHeavy })
    if (dealt > 0 && u === sim.hero?.unit) heroOnHit?.(sim, tgt, base)
    return
  }
  const pierce = u === sim.hero?.unit ? Math.round(u.s.mods.pierce ?? 0) : 0
  fire(sim, {
    fx: shotFx || (u.s.atkStyle === 'magic' ? 'bolt' : 'bullet'), src: u, tx: tgt.x, tz: tgt.z, targetId: tgt.id,
    speed: u.s.atkStyle === 'magic' ? 15 : 22, dmg: base, type: u.s.atkType, basic: true, pierce,
    spell: u.s.atkStyle === 'magic', homing: u.team === 0, color: ''
  })
}

/** The hero's on-hit hooks (burn on hit, venom, freeze…), installed by
 *  `hero.ts` so this module does not depend on it. */
let heroOnHit: ((sim: Sim, tgt: Unit, base: number) => void) | null = null
export const setHeroOnHit = (fn: (sim: Sim, tgt: Unit, base: number) => void): void => { heroOnHit = fn }

// ─── Projectiles ─────────────────────────────────────────────────────────────

export interface FireOpts {
  fx: string
  src: Unit
  /** From here (default: the source). */
  x?: number
  z?: number
  tx: number
  tz: number
  targetId?: number
  speed: number
  dmg: number
  type: DamageType
  r?: number
  aoe?: number
  pierce?: number
  life?: number
  status?: { id: StatusId; dur: number; v: number; type?: DamageType }
  /** Arcs to (tx, tz) over this many seconds and bursts there. */
  lob?: number
  homing?: boolean
  basic?: boolean
  spell?: boolean
  heavy?: boolean
  crit?: boolean
  skill?: string
  color: string
}

export const fire = (sim: Sim, o: FireOpts): Projectile => {
  let p = sim.projectiles.find(q => !q.active)
  if (!p) {
    p = {
      active: false, fx: '', team: 0, srcId: 0, x: 0, z: 0, y: 1, vx: 0, vz: 0, targetId: 0, speed: 0, r: 0.3, life: 0,
      dmg: 0, type: 'physical', crit: false, aoe: 0, pierce: 0, hit: [], lob: 0, lobT: 0, tx: 0, tz: 0, skill: '',
      basic: false, spell: false, heavy: false, color: ''
    }
    sim.projectiles.push(p)
  }
  const x = o.x ?? o.src.x
  const z = o.z ?? o.src.z
  const dx = o.tx - x
  const dz = o.tz - z
  const d = Math.hypot(dx, dz) || 1
  p.active = true
  p.fx = o.fx
  p.team = o.src.team
  p.srcId = o.src.id
  // Leaves from in front of the body, not from inside it.
  p.x = x + (dx / d) * Math.min(d, o.src.r * 0.9)
  p.z = z + (dz / d) * Math.min(d, o.src.r * 0.9)
  p.y = o.src.h * 0.6
  p.vx = (dx / d) * o.speed
  p.vz = (dz / d) * o.speed
  p.targetId = o.homing ? (o.targetId ?? 0) : 0
  p.speed = o.speed
  p.r = o.r ?? 0.3
  p.life = o.life ?? 2.2
  p.dmg = o.dmg
  p.type = o.type
  p.crit = !!o.crit
  p.aoe = o.aoe ?? 0
  p.pierce = o.pierce ?? 0
  p.hit.length = 0
  p.status = o.status
  p.lob = o.lob ?? 0
  p.lobT = 0
  p.tx = o.tx
  p.tz = o.tz
  p.skill = o.skill ?? ''
  p.basic = !!o.basic
  p.spell = !!o.spell
  p.heavy = !!o.heavy
  p.color = o.color
  if (p.lob > 0) {
    p.vx = dx / p.lob
    p.vz = dz / p.lob
    p.life = p.lob + 0.1
  }
  return p
}

const burst = (sim: Sim, p: Projectile, src: Unit | null, direct: Unit | null): void => {
  const other: Team = p.team === 0 ? 1 : 0
  if (p.aoe > 0) {
    sim.emit({ t: 'fx', id: 'burst:' + p.fx, x: p.x, z: p.z, r: p.aoe, color: p.color })
    const near = sim.inCircle(other, p.x, p.z, p.aoe, hits)
    for (let i = 0; i < near.length; i++) {
      const t = near[i]!
      const dealt = dealDamage(sim, src, t, p.dmg, { type: p.type, spell: p.spell, skill: p.skill, heavy: p.heavy, crit: p.crit || undefined })
      if (dealt > 0 && p.status && t.alive) applyStatus(sim, t, p.status.id, p.status.dur, p.status.v, src, { type: p.status.type })
    }
  } else if (direct) {
    const dealt = dealDamage(sim, src, direct, p.dmg, { type: p.type, attack: p.basic, spell: p.spell, skill: p.skill, heavy: p.heavy, crit: p.crit || undefined })
    if (dealt > 0) {
      if (p.status && direct.alive) applyStatus(sim, direct, p.status.id, p.status.dur, p.status.v, src, { type: p.status.type })
      if (p.basic && src === sim.hero?.unit) heroOnHit?.(sim, direct, p.dmg)
    }
    sim.emit({ t: 'fx', id: 'impact:' + p.fx, x: p.x, z: p.z, color: p.color })
  } else {
    sim.emit({ t: 'fx', id: 'impact:' + p.fx, x: p.x, z: p.z, color: p.color })
  }
}

export const stepProjectiles = (sim: Sim, dt: number): void => {
  const ps = sim.projectiles
  for (let n = 0; n < ps.length; n++) {
    const p = ps[n]!
    if (!p.active) continue
    const src = sim.live(p.srcId) ?? null
    p.life -= dt
    if (p.lob > 0) {
      p.lobT += dt
      p.x += p.vx * dt
      p.z += p.vz * dt
      const k = Math.min(1, p.lobT / p.lob)
      p.y = 1 + Math.sin(k * Math.PI) * (2.2 + p.lob * 2.4)
      if (p.lobT >= p.lob) {
        p.x = p.tx
        p.z = p.tz
        burst(sim, p, src, null)
        p.active = false
      }
      continue
    }
    if (p.targetId) {
      const t = sim.live(p.targetId)
      if (t) {
        const dx = t.x - p.x
        const dz = t.z - p.z
        const d = Math.hypot(dx, dz) || 1
        p.vx = (dx / d) * p.speed
        p.vz = (dz / d) * p.speed
      } else p.targetId = 0
    }
    const stepLen = p.speed * dt
    const steps = Math.max(1, Math.ceil(stepLen / 0.5))
    const sx = (p.vx * dt) / steps
    const sz = (p.vz * dt) / steps
    const other: Team = p.team === 0 ? 1 : 0
    for (let s = 0; s < steps && p.active; s++) {
      p.x += sx
      p.z += sz
      if (isSolidAt(sim.grid, p.x, p.z)) {
        burst(sim, p, src, null)
        p.active = false
        break
      }
      const us = sim.units
      for (let i = 0; i < us.length; i++) {
        const u = us[i]!
        if (!u.alive || u.team !== other || u.rank === 'npc') continue
        if (hasStatus(u, 'stealth') && !p.targetId) continue
        const rr = u.r + p.r
        if ((u.x - p.x) * (u.x - p.x) + (u.z - p.z) * (u.z - p.z) > rr * rr) continue
        if (p.hit.includes(u.id)) continue
        p.hit.push(u.id)
        burst(sim, p, src, u)
        if (p.aoe > 0 || p.pierce <= 0) {
          p.active = false
          break
        }
        p.pierce--
        p.targetId = 0
      }
    }
    if (p.active && p.life <= 0) {
      if (p.aoe > 0) burst(sim, p, src, null)
      p.active = false
    }
  }
}

// ─── Ground fields ───────────────────────────────────────────────────────────

export interface FieldOpts {
  fx: string
  kind: Field['kind']
  src: Unit
  x: number
  z: number
  r: number
  dur: number
  every?: number
  /** Damage per tick. */
  dmg?: number
  type?: DamageType
  v?: number
  skill?: string
  color: string
}

export const addField = (sim: Sim, o: FieldOpts): Field => {
  let f = sim.fields.find(q => !q.active)
  if (!f) {
    f = {
      active: false, fx: '', team: 0, srcId: 0, x: 0, z: 0, r: 1, t: 0, dur: 1, every: 0.5, next: 0, dmg: 0, type: 'fire',
      kind: 'damage', v: 0, skill: '', color: ''
    }
    sim.fields.push(f)
  }
  f.active = true
  f.fx = o.fx
  f.team = o.src.team
  f.srcId = o.src.id
  f.x = o.x
  f.z = o.z
  f.r = o.r
  f.t = 0
  f.dur = o.dur
  f.every = o.every ?? 0.5
  f.next = f.every
  f.dmg = o.dmg ?? 0
  f.type = o.type ?? 'fire'
  f.kind = o.kind
  f.v = o.v ?? 0
  f.skill = o.skill ?? ''
  f.color = o.color
  sim.emit({ t: 'fx', id: 'field:' + o.fx, x: o.x, z: o.z, r: o.r, dur: o.dur, color: o.color })
  return f
}

export const stepFields = (sim: Sim, dt: number): void => {
  for (let n = 0; n < sim.fields.length; n++) {
    const f = sim.fields[n]!
    if (!f.active) continue
    f.t += dt
    const src = sim.live(f.srcId) ?? null
    const other: Team = f.team === 0 ? 1 : 0
    // Auras hold while a body stands inside: refreshed every step, so leaving
    // the field ends them a moment later.
    if (f.kind === 'haste' || f.kind === 'banner' || f.kind === 'crucible') {
      const friends = sim.inCircle(f.team, f.x, f.z, f.r, hits)
      for (let i = 0; i < friends.length; i++) {
        const u = friends[i]!
        if (f.kind === 'haste') {
          if (u === sim.hero?.unit) {
            applyStatus(sim, u, 'haste', 0.3, f.v, src, { quiet: true })
            applyStatus(sim, u, 'attackSpeed', 0.3, 0.3, src, { quiet: true })
          }
        } else if (f.kind === 'banner') {
          applyStatus(sim, u, 'damageUp', 0.3, f.v, src, { quiet: true })
          applyStatus(sim, u, 'regen', 0.3, 0.05, src, { quiet: true })
        } else if (u === sim.hero?.unit) {
          applyStatus(sim, u, 'unkillable', 0.3, 1, src, { quiet: true })
        }
      }
    }
    f.next -= dt
    if (f.next <= 0) {
      f.next += f.every
      if (f.dmg > 0) {
        const near = sim.inCircle(other, f.x, f.z, f.r, hits)
        for (let i = 0; i < near.length; i++) {
          const u = near[i]!
          dealDamage(sim, src, u, f.dmg, { type: f.type, spell: true, skill: f.skill, canCrit: f.kind !== 'burnGround' })
          if (!u.alive) continue
          if (f.kind === 'burnGround' && f.v > 0) applyStatus(sim, u, 'burn', 2.5, f.v, src, { type: 'fire', quiet: true })
          if (f.kind === 'web') applyStatus(sim, u, 'slow', 1, 0.5, src, { quiet: true })
        }
      }
      if (f.kind === 'heal') {
        const friends = sim.inCircle(f.team, f.x, f.z, f.r, hits)
        for (let i = 0; i < friends.length; i++) heal(sim, friends[i]!, f.v, true)
      }
    }
    if (f.t >= f.dur) f.active = false
  }
}

// ─── Temporary walls ─────────────────────────────────────────────────────────

/** Raise solid cells for a while (Earth Barrier, Tectonic rubble). Anything
 *  standing where a wall rises is pushed out of it. */
export const raiseWall = (sim: Sim, cells: number[], dur: number, fx: string): void => {
  const g = sim.grid
  const kept: number[] = []
  for (const k of cells) {
    const i = k % g.w
    const j = (k - i) / g.w
    if (isSolidCell(g, i, j)) continue
    setTempSolid(g, i, j, true)
    kept.push(k)
  }
  if (!kept.length) return
  sim.walls.push({ cells: kept, t: 0, dur, fx })
  sim.emit({ t: 'wall', cells: kept, on: true, fx })
  for (const u of sim.units) {
    if (!u.alive) continue
    if (isSolidAt(g, u.x, u.z) && nearestOpen(g, u.x, u.z, out2, 6)) {
      u.x = out2[0]
      u.z = out2[1]
    }
    // Paths laid before the wall rose may run through it.
    if (u.hasGoal) setGoal(sim, u, u.goalX, u.goalZ)
  }
}

export const stepWalls = (sim: Sim, dt: number): void => {
  for (let n = sim.walls.length - 1; n >= 0; n--) {
    const w = sim.walls[n]!
    w.t += dt
    if (w.t < w.dur) continue
    const g = sim.grid
    for (const k of w.cells) {
      const i = k % g.w
      setTempSolid(g, i, (k - i) / g.w, false)
    }
    sim.emit({ t: 'wall', cells: w.cells, on: false, fx: w.fx })
    sim.walls.splice(n, 1)
    // A goal set while the wall stood may have found no way round it: with
    // the wall gone, everyone on the way somewhere looks again.
    for (const u of sim.units) if (u.alive && u.hasGoal) setGoal(sim, u, u.goalX, u.goalZ)
  }
}

/** The cell index under a point, or -1 off the grid. */
export const cellIndex = (sim: Sim, x: number, z: number): number => {
  const i = cellOf(x)
  const j = cellOf(z)
  return i < 0 || j < 0 || i >= sim.grid.w || j >= sim.grid.h ? -1 : j * sim.grid.w + i
}

export { CELL, centerOf, statusV }
