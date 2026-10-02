import { ENEMY_BY_ID, type AbilityDef } from '../data/enemies'
import { hasLineOfSight, isSolidAt, nearestOpen } from './grid'
import { addField, face, fire, stop } from './actors'
import { applyStatus, dealDamage, heal, knockback } from './combat'
import { spawnEnemy } from './spawn'
import { angleTo, newAction, type Sim } from './world'
import type { Action, Team, Unit } from './types'

/**
 * ─── Enemy abilities ─────────────────────────────────────────────────────────
 *
 * A dozen behaviours, each a wind-up with a telegraph on the ground and a
 * release. The telegraph is drawn for exactly the wind-up, in exactly the
 * shape the hit will have: what the player sees is what will land.
 */

const hits: Unit[] = []
const out2: [number, number] = [0, 0]
const rad = (deg: number): number => (deg * Math.PI) / 180

const other = (u: Unit): Team => (u.team === 0 ? 1 : 0)

/** Can `u` use this ability on `tgt` right now? */
export const abilityReady = (sim: Sim, u: Unit, a: AbilityDef, idx: number, tgt: Unit | null): boolean => {
  if (u.cds[idx]! > 0) return false
  if (a.phase && u.phase < a.phase) return false
  if (a.below !== undefined && u.hp > u.s.maxHp * a.below) return false
  if (a.kind === 'enrage' || a.kind === 'summon') return tgt !== null
  if (a.kind === 'heal') return true
  if (!tgt) return false
  const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
  if (d > a.range + tgt.r || (a.min !== undefined && d < a.min)) return false
  if (a.kind === 'shot' || a.kind === 'volley' || a.kind === 'line' || a.kind === 'charge') {
    return hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)
  }
  return true
}

/** Begin the wind-up: face the target, raise the telegraph. */
export const startAbility = (sim: Sim, u: Unit, a: AbilityDef, idx: number, tgt: Unit | null): void => {
  const tx = tgt?.x ?? u.x
  const tz = tgt?.z ?? u.z
  u.cds[idx] = a.cd
  stop(u)
  if (tgt) face(u, tx, tz)
  const act = newAction(u, a.kind, a.windup, a.windup + a.recover, tgt?.id ?? 0, tx, tz, idx)
  u.action = act
  u.anim = 'cast'
  u.animT = 0
  u.animStyle = a.pose ?? (a.kind === 'slam' || a.kind === 'leap' ? 2 : a.kind === 'charge' ? 3 : 1)
  const team = u.team
  const r = a.r ?? 2
  switch (a.kind) {
    case 'slam':
      sim.emit({ t: 'tele', tele: { shape: 'circle', x: u.x, z: u.z, r, w: 0, a: 0, dur: a.windup, team, src: u.id, wind: a.windup } })
      break
    case 'smash':
    case 'leap':
      sim.emit({ t: 'tele', tele: { shape: 'circle', x: tx, z: tz, r, w: 0, a: 0, dur: a.windup, team, src: u.id, wind: a.windup } })
      break
    case 'lob':
      // The warning stays until the lob lands, a beat after the throw.
      sim.emit({ t: 'tele', tele: { shape: 'circle', x: tx, z: tz, r, w: 0, a: 0, dur: a.windup + LOB_FLIGHT, team, src: u.id, wind: a.windup } })
      break
    case 'cone':
      sim.emit({ t: 'tele', tele: { shape: 'cone', x: u.x, z: u.z, r, w: rad(a.w ?? 30), a: act.a, dur: a.windup, team, src: u.id, wind: a.windup } })
      break
    case 'charge':
    case 'line':
      sim.emit({ t: 'tele', tele: { shape: 'line', x: u.x, z: u.z, r, w: a.w ?? 1, a: act.a, dur: a.windup, team, src: u.id, wind: a.windup } })
      break
    case 'blink': {
      // Gone from here; behind the target before the strike.
      if (tgt) {
        sim.emit({ t: 'fx', id: 'blink', x: u.x, z: u.z, color: ENEMY_BY_ID[u.kind]?.color })
        const bx = tgt.x - Math.sin(tgt.facing) * (tgt.r + u.r + 0.4)
        const bz = tgt.z - Math.cos(tgt.facing) * (tgt.r + u.r + 0.4)
        if (!isSolidAt(sim.grid, bx, bz)) { u.x = bx; u.z = bz } else if (nearestOpen(sim.grid, bx, bz, out2, 3)) { u.x = out2[0]; u.z = out2[1] }
        u.px = u.x
        u.pz = u.z
        face(u, tgt.x, tgt.z)
        sim.emit({ t: 'fx', id: 'blink', x: u.x, z: u.z, color: ENEMY_BY_ID[u.kind]?.color })
      }
      break
    }
    default:
      break
  }
  sim.emit({ t: 'cast', src: u.id, skill: 'enemy:' + a.kind, x: u.x, z: u.z, tx, tz })
}

const LOB_FLIGHT = 0.65
const BARRAGE_GAP = 0.22
const BARRAGE_WARN = 0.95

const strike = (sim: Sim, u: Unit, a: AbilityDef, t: Unit, mul = 1): void => {
  const dealt = dealDamage(sim, u, t, u.s.baseDmg * (a.dmg ?? 1) * mul, { type: a.type ?? 'physical', heavy: true, canCrit: false })
  if (dealt > 0 && a.status && t.alive) {
    const v = a.status.id === 'burn' || a.status.id === 'poison' || a.status.id === 'bleed' ? u.s.baseDmg * a.status.v : a.status.v
    applyStatus(sim, t, a.status.id, a.status.dur, v, u, { type: a.status.type })
  }
}

/** The wind-up is over: the ability lands. */
export const resolveAbility = (sim: Sim, u: Unit, act: Action): void => {
  const def = ENEMY_BY_ID[u.kind]
  const a = def?.abilities[act.ability]
  if (!a) return
  const foe = other(u)
  const r = a.r ?? 2
  const color = a.color ?? def!.color
  switch (a.kind) {
    case 'slam': {
      sim.emit({ t: 'fx', id: 'slam', x: u.x, z: u.z, r, color })
      for (const t of sim.inCircle(foe, u.x, u.z, r, hits)) { strike(sim, u, a, t); knockback(t, u.x, u.z, 5) }
      break
    }
    case 'smash': {
      sim.emit({ t: 'fx', id: a.fx ? 'burst:' + a.fx : 'slam', x: act.x, z: act.z, r, color })
      for (const t of sim.inCircle(foe, act.x, act.z, r, hits)) strike(sim, u, a, t)
      break
    }
    case 'cone': {
      sim.emit({ t: 'fx', id: a.fx === 'breath' ? 'breath' : 'cleave', x: u.x, z: u.z, r, a: act.a, color, dur: rad(a.w ?? 30) })
      for (const t of sim.inCone(foe, u.x, u.z, act.a, r, rad(a.w ?? 30), hits)) strike(sim, u, a, t)
      break
    }
    case 'line': {
      sim.emit({ t: 'fx', id: 'beam', x: u.x, z: u.z, x2: u.x + Math.sin(act.a) * r, z2: u.z + Math.cos(act.a) * r, r: a.w ?? 1, color })
      for (const t of sim.inLine(foe, u.x, u.z, act.a, r, a.w ?? 1, hits)) strike(sim, u, a, t)
      break
    }
    case 'charge': {
      for (const t of sim.inLine(foe, u.x, u.z, act.a, r, (a.w ?? 1) + 0.2, hits)) { strike(sim, u, a, t); knockback(t, u.x, u.z, 6) }
      // The body follows through: a shove that decays over the line's length.
      u.kx = Math.sin(act.a) * r * 8
      u.kz = Math.cos(act.a) * r * 8
      sim.emit({ t: 'fx', id: 'dash', x: u.x, z: u.z, x2: u.x + Math.sin(act.a) * r, z2: u.z + Math.cos(act.a) * r, color })
      break
    }
    case 'shot':
    case 'volley': {
      const n = a.kind === 'volley' ? (a.count ?? 3) : 1
      const spread = rad(a.w ?? 14)
      for (let i = 0; i < n; i++) {
        const off = n === 1 ? 0 : (i / (n - 1) - 0.5) * spread * (n - 1)
        const ang = act.a + off
        fire(sim, {
          fx: a.fx ?? 'bolt', src: u, tx: u.x + Math.sin(ang) * 12, tz: u.z + Math.cos(ang) * 12, speed: 12.5,
          dmg: u.s.baseDmg * (a.dmg ?? 1), type: a.type ?? 'pierce', life: 1.3, color,
          status: a.status ? { ...a.status, v: a.status.id === 'poison' || a.status.id === 'burn' ? u.s.baseDmg * a.status.v : a.status.v } : undefined
        })
      }
      break
    }
    case 'lob': {
      fire(sim, {
        fx: a.fx ?? 'bomb', src: u, tx: act.x, tz: act.z, speed: 0, lob: LOB_FLIGHT, aoe: r, dmg: u.s.baseDmg * (a.dmg ?? 1),
        type: a.type ?? 'physical', color, heavy: true,
        status: a.status ? { ...a.status, v: a.status.id === 'poison' || a.status.id === 'burn' ? u.s.baseDmg * a.status.v : a.status.v } : undefined
      })
      break
    }
    case 'barrage': {
      const n = a.count ?? 4
      const t = sim.live(act.targetId)
      const cx = t?.x ?? act.x
      const cz = t?.z ?? act.z
      for (let i = 0; i < n; i++) {
        // The first circle is on the target; the rest scatter round it.
        const ang = sim.rng() * Math.PI * 2
        const d = i === 0 ? 0 : 1.6 + sim.rng() * 4.2
        const x = cx + Math.cos(ang) * d
        const z = cz + Math.sin(ang) * d
        const delay = i * BARRAGE_GAP
        sim.after(delay, () => {
          if (!u.alive) return
          sim.emit({ t: 'tele', tele: { shape: 'circle', x, z, r, w: 0, a: 0, dur: BARRAGE_WARN, team: u.team, src: u.id } })
          sim.emit({ t: 'fx', id: 'fall:' + (a.fx ?? 'bomb'), x, z, r, dur: BARRAGE_WARN, color })
        })
        sim.after(delay + BARRAGE_WARN, () => {
          if (!u.alive) return
          sim.emit({ t: 'fx', id: 'burst:' + (a.fx ?? 'bomb'), x, z, r, color })
          for (const v of sim.inCircle(other(u), x, z, r, hits)) strike(sim, u, a, v)
        })
      }
      break
    }
    case 'leap': {
      if (!isSolidAt(sim.grid, act.x, act.z)) { u.x = act.x; u.z = act.z } else if (nearestOpen(sim.grid, act.x, act.z, out2, 3)) { u.x = out2[0]; u.z = out2[1] }
      sim.emit({ t: 'fx', id: 'slam', x: u.x, z: u.z, r, color })
      for (const t of sim.inCircle(foe, u.x, u.z, r, hits)) { strike(sim, u, a, t); knockback(t, u.x, u.z, 5) }
      break
    }
    case 'blink': {
      const t = sim.live(act.targetId)
      if (t && Math.hypot(t.x - u.x, t.z - u.z) < 3 + t.r) {
        sim.emit({ t: 'fx', id: 'cleave', x: u.x, z: u.z, r: 2.4, a: angleTo(u.x, u.z, t.x, t.z), color, dur: rad(50) })
        strike(sim, u, a, t)
      }
      break
    }
    case 'summon': {
      const n = a.count ?? 2
      // A summoner keeps at most six of its own alive.
      let mine = 0
      for (const m of sim.units) if (m.alive && m.ownerId === u.id) mine++
      for (let i = 0; i < n && mine + i < 6; i++) {
        const ang = sim.rng() * Math.PI * 2
        const d = u.r + 1.2 + sim.rng() * 1.5
        const m = spawnEnemy(sim, a.spawn ?? 'goblin', u.x + Math.cos(ang) * d, u.z + Math.sin(ang) * d, u.group, u)
        if (m) sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color })
      }
      break
    }
    case 'heal': {
      // The most hurt ally in reach (itself included).
      let best: Unit | null = null
      let worst = 0.95
      for (const m of sim.units) {
        if (!m.alive || m.team !== u.team) continue
        if (Math.hypot(m.x - u.x, m.z - u.z) > a.range) continue
        const f = m.hp / m.s.maxHp
        if (f < worst) { worst = f; best = m }
      }
      if (best) {
        heal(sim, best, u.s.baseDmg * (a.dmg ?? 2) * 3)
        sim.emit({ t: 'fx', id: 'heal', x: best.x, z: best.z, unit: best.id, color: '#7dff8a' })
      }
      break
    }
    case 'enrage': {
      for (const m of sim.units) {
        if (!m.alive || m.team !== u.team || Math.hypot(m.x - u.x, m.z - u.z) > 9) continue
        applyStatus(sim, m, 'enrage', 9, 0.3, u, { quiet: m !== u })
      }
      sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 6, color })
      break
    }
  }
  // Lingering ground from an element (a breath leaves fire, a spit leaves venom).
  if ((a.kind === 'smash' || a.kind === 'lob') && a.fx === 'venom') {
    addField(sim, { fx: 'venom', kind: 'poison', src: u, x: act.x, z: act.z, r: r * 0.8, dur: 4, every: 0.5, dmg: u.s.baseDmg * 0.18, type: 'poison', color })
  }
}
