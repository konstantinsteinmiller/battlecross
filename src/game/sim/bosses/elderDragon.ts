import { CELL, hasLineOfSight, isSolidAt } from '../grid'
import { addField, cellIndex } from '../actors'
import { applyStatus, heal, knockback } from '../combat'
import type { Sim } from '../world'
import type { BossState, Unit } from '../types'
import type { BossScript } from './index'
import { bark, daze, move, other, raiseProps, shatterWallAt, strikeFor, warn } from './kit'

/**
 * ─── The Elder Dragon (the Rift, afterplay §5.7, the final fight) ────────────
 * Teaches flight phases with ground cover.
 *
 *   100–70 %  on the ground: a SWEEPING BREATH (the cone shows first), a TAIL
 *             SWIPE at whoever stands behind it, a WING GUST that throws
 *             everyone near 6 m back.
 *   70–40 %   in the air, out of reach: three RUNE STONES rise round the field.
 *             It BREATHES down a lane at the hero from above (the lane shows
 *             first) — a rune stone in the way takes the breath instead, and
 *             breaks after two — while METEORS rain round the hero. After
 *             three breaths it lands hard, dazed 4 s, fights a while on the
 *             ground, and takes off again.
 *   40–15 %   on the ground again, and the VOID RING closes round the fight
 *             to nine metres and holds.
 *   15–0 %    the rift PULLS IT BACK: it hangs rooted for 30 s, open, while
 *             void shards fall round the hero. Not dead by then: it tears
 *             free, heals to 30 % and the third phase goes on.
 */

const COLOR = '#ff6a3a'
const VOID = '#8a3aff'
const HIGH = 7
const RISE = 1.2
const LAND = 1.5
const BREATH_R = 9
const BREATH_WARN = 1.3
const TAIL_R = 5.5
const TAIL_HALF = 0.9
const TAIL_WARN = 0.8
const GUST_R = 6.5
const GUST_WARN = 1
/** Knockback speed: it decays at 8/s, so this is 6 m. */
const GUST_PUSH = 48
/** The breath from the air: its lane's reach, half-width, warning. */
const SKY_LEN = 20
const SKY_W = 1.3
const SKY_WARN = 1.4
const SKY_BREATHS = 3
const METEOR_R = 1.8
const METEOR_WARN = 1.4
const RUNES = 3
/** Breaths a rune stone takes before it breaks. */
const RUNE_HITS = 2
const GROUND_BETWEEN = 9
const RING_FROM = 15
const RING_TO = 9
const RING_CLOSE = 6
const RING_BEAT = 0.5
const RING_N = 30
/** The last phase: how long the rift holds it, and where it heals to if it lasts. */
const PULL = 30
const HEAL_TO = 0.3
const SHARD_EVERY = 1.1
const SHARD_R = 1.6
const SHARD_WARN = 1

/** What the script keeps between steps. */
interface EdState {
  /** Breaths a rune stone has taken, by its cell. */
  runeHits: Map<number, number>
  /** Seconds into the void ring (0: not yet), and where it closes on. */
  ringT: number; rx: number; rz: number
  /** Seconds left of the rift's pull (0: not pulled), and until the next shard. */
  pull: number; shardT: number
  /** Times it tore free and healed. */
  heals: number
}
const states = new WeakMap<BossState, EdState>()
const state = (b: BossState): EdState => {
  let s = states.get(b)
  if (!s) {
    s = { runeHits: new Map(), ringT: 0, rx: 0, rz: 0, pull: 0, shardT: 0, heals: 0 }
    states.set(b, s)
  }
  return s
}

const hitsBuf: Unit[] = []

/** Up it goes: `n` breaths from the air. */
const takeOff = (sim: Sim, u: Unit, n: number): void => {
  const b = u.boss!
  b.mode = 'air'
  b.modeT = 0
  b.sub = 'rise'
  b.n = n
  b.next = 0
  u.action = null
  u.anim = 'idle'
  sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 8, color: COLOR })
  sim.emit({ t: 'fx', id: 'slam', x: u.x, z: u.z, r: 4, color: COLOR })
}

/** The first rune stone on the lane from (x, z) along (dx, dz) within `len`: its cell, and how far (or -1). */
const runeOnLane = (sim: Sim, x: number, z: number, dx: number, dz: number, len: number, out: [number, number]): boolean => {
  for (let d = 0.6; d <= len; d += 0.4) {
    const c = cellIndex(sim, x + dx * d, z + dz * d)
    if (c >= 0 && sim.walls.some(w => w.fx === 'rune' && w.t < w.dur && w.cells[0] === c)) { out[0] = c; out[1] = d; return true }
  }
  return false
}
const lane2: [number, number] = [0, 0]

/** The breath from the air comes down its lane: a rune stone in the way takes it. */
const skyBreath = (sim: Sim, u: Unit, a: number): void => {
  const s = state(u.boss!)
  const dx = Math.sin(a)
  const dz = Math.cos(a)
  let len = SKY_LEN
  if (runeOnLane(sim, u.x, u.z, dx, dz, SKY_LEN, lane2)) {
    len = lane2[1]
    const c = lane2[0]
    const n = (s.runeHits.get(c) ?? 0) + 1
    s.runeHits.set(c, n)
    const x = ((c % sim.grid.w) + 0.5) * CELL
    const z = (Math.floor(c / sim.grid.w) + 0.5) * CELL
    sim.emit({ t: 'fx', id: 'burst:ember', x, z, r: 1.6, color: COLOR })
    if (n >= RUNE_HITS) { shatterWallAt(sim, x, z); sim.emit({ t: 'fx', id: 'burst:rock', x, z, r: 2, color: '#9a8aa8' }) }
  }
  for (let d = 1.5; d < len; d += 2) sim.emit({ t: 'fx', id: 'burst:ember', x: u.x + dx * d, z: u.z + dz * d, r: SKY_W + 0.3, color: COLOR })
  for (const t of sim.inCircle(other(u), u.x, u.z, len + 1, hitsBuf)) {
    const along = (t.x - u.x) * dx + (t.z - u.z) * dz
    const across = Math.abs((t.x - u.x) * dz - (t.z - u.z) * dx)
    if (along < 0 || along > len || across > SKY_W + t.r) continue
    strikeFor(sim, u, t, 2, 'fire')
    applyStatus(sim, t, 'burn', 3, u.s.baseDmg * 0.2, u, { type: 'fire', quiet: true })
  }
}

/** Meteors round the hero, each circle shown first. */
const meteors = (sim: Sim, u: Unit, n: number): void => {
  const h = sim.hero.unit
  for (let k = 0; k < n; k++) {
    const a = sim.rng() * Math.PI * 2
    const r = 1 + sim.rng() * 5
    const x = h.x + Math.sin(a) * r
    const z = h.z + Math.cos(a) * r
    if (isSolidAt(sim.grid, x, z)) continue
    const delay = METEOR_WARN + k * 0.2
    warn(sim, u, { shape: 'circle', x, z, r: METEOR_R, w: 0, a: 0, dur: delay })
    sim.after(delay, () => {
      if (!u.alive) return
      sim.emit({ t: 'fx', id: 'quake', x, z, r: METEOR_R + 0.4, color: COLOR })
      for (const t of sim.inCircle(other(u), x, z, METEOR_R, hitsBuf)) strikeFor(sim, u, t, 1.4, 'fire')
    })
  }
}

/** The ring of void at radius `r` round its middle, laid a beat at a time. */
const ringBeat = (sim: Sim, u: Unit, s: EdState, r: number): void => {
  for (let k = 0; k < RING_N; k++) {
    const ang = (k / RING_N) * Math.PI * 2
    const x = s.rx + Math.sin(ang) * r
    const z = s.rz + Math.cos(ang) * r
    if (isSolidAt(sim.grid, x, z)) continue
    addField(sim, { fx: 'burning', kind: 'burnGround', src: u, x, z, r: 1.3, dur: RING_BEAT * 1.9, every: 0.5, dmg: u.s.baseDmg * 0.22, type: 'shadow', color: VOID })
  }
}

const elderDragon: BossScript = {
  phases: [0.7, 0.4, 0.15],
  think(sim, u, tgt) {
    const b = u.boss!
    const s = state(b)
    if (!b.marks.includes('bark:intro')) bark(sim, u, 'elderDragon', 'intro')
    // Held by the rift: it does nothing but hang there.
    if (s.pull > 0) return true
    // In the second phase, on the ground between flights: up again in time.
    if (b.phase === 2 && (b.cd.fly ?? 0) <= 0) { takeOff(sim, u, SKY_BREATHS); return true }
    if (b.next > 0) return false
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    // Behind it: the tail.
    let back = Math.atan2(tgt.x - u.x, tgt.z - u.z) - u.facing
    back = Math.abs(Math.atan2(Math.sin(back), Math.cos(back)))
    if ((b.cd.tail ?? 0) <= 0 && d < TAIL_R && back > 2.1) {
      b.cd.tail = 5
      b.next = 1.2
      const a = u.facing + Math.PI
      move(sim, u, 'slam', TAIL_WARN, 0.4, null, u.x + Math.sin(a) * 3, u.z + Math.cos(a) * 3, 2)
      warn(sim, u, { shape: 'cone', x: u.x, z: u.z, r: TAIL_R, w: TAIL_HALF, a, dur: TAIL_WARN, wind: TAIL_WARN })
      return true
    }
    if ((b.cd.gust ?? 0) <= 0 && d < GUST_R - 1) {
      b.cd.gust = 11
      b.next = 1.6
      move(sim, u, 'enrage', GUST_WARN, 0.5, null)
      warn(sim, u, { shape: 'circle', x: u.x, z: u.z, r: GUST_R, w: 0, a: 0, dur: GUST_WARN, wind: GUST_WARN })
      return true
    }
    if ((b.cd.breath ?? 0) <= 0 && d < BREATH_R && hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)) {
      b.cd.breath = b.phase >= 3 ? 6 : 8
      b.next = 2
      const act = move(sim, u, 'cone', BREATH_WARN, 1.6, tgt)
      warn(sim, u, { shape: 'cone', x: u.x, z: u.z, r: BREATH_R, w: 0.9, a: act.a, dur: BREATH_WARN, wind: BREATH_WARN })
      return true
    }
    return false
  },
  land(sim, u, act) {
    if (act.id === 'cone') {
      // The sweep: six bursts across the cone, once each at most twice.
      const hitCount = new Map<number, number>()
      for (let k = 0; k < 6; k++) {
        const ang = act.a - 0.75 + (1.5 * k) / 5
        sim.after(k * 0.2, () => {
          if (!u.alive || u.boss?.mode) return
          sim.emit({ t: 'fx', id: 'breath', x: u.x, z: u.z, r: BREATH_R, a: ang, dur: 0.26, color: COLOR })
          for (const t of sim.inCone(other(u), u.x, u.z, ang, BREATH_R, 0.28, hitsBuf)) {
            const n = hitCount.get(t.id) ?? 0
            if (n >= 2) continue
            hitCount.set(t.id, n + 1)
            strikeFor(sim, u, t, 1, 'fire')
            applyStatus(sim, t, 'burn', 3, u.s.baseDmg * 0.2, u, { type: 'fire', quiet: true })
          }
        })
      }
    } else if (act.id === 'slam') {
      const a = u.facing + Math.PI
      sim.emit({ t: 'fx', id: 'breath', x: u.x, z: u.z, r: TAIL_R, a, dur: 0.3, color: '#c8a08a' })
      for (const t of sim.inCone(other(u), u.x, u.z, a, TAIL_R, TAIL_HALF, hitsBuf)) {
        strikeFor(sim, u, t, 1.8)
        knockback(t, u.x, u.z, 6)
      }
    } else if (act.id === 'enrage') {
      sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: GUST_R, color: '#e8e0d0' })
      for (const t of sim.inCircle(other(u), u.x, u.z, GUST_R, hitsBuf)) {
        strikeFor(sim, u, t, 0.6)
        knockback(t, u.x, u.z, GUST_PUSH)
      }
    }
  },
  onPhase(sim, u, phase) {
    const b = u.boss!
    const s = state(b)
    sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 9, color: COLOR })
    if (phase === 2) {
      bark(sim, u, 'elderDragon', 'flight')
      raiseProps(sim, u, 'rune', RUNES, 4, 7.5)
      takeOff(sim, u, SKY_BREATHS)
    } else if (phase === 3) {
      // The void ring closes round the fight.
      if (!s.ringT) {
        const h = sim.hero.unit
        s.rx = (u.x * 2 + h.x) / 3
        s.rz = (u.z * 2 + h.z) / 3
        s.ringT = 0.001
      }
      applyStatus(sim, u, 'enrage', 120, 0.2, u)
    } else if (phase === 4) {
      bark(sim, u, 'elderDragon', 'rift')
      s.pull = PULL
      s.shardT = SHARD_EVERY
      u.action = null
      // Half again to every blow while it hangs there: the window to burst it.
      applyStatus(sim, u, 'vulnerable', PULL, 0.25, u, { quiet: true })
      sim.emit({ t: 'fx', id: 'summon', x: u.x, z: u.z, color: VOID })
    }
  },
  tick(sim, u, dt) {
    const b = u.boss!
    const s = state(b)
    // The void ring: closing, then holding to the end of the fight.
    if (s.ringT > 0) {
      s.ringT += dt
      if ((b.cd.ring ?? 0) <= 0) {
        b.cd.ring = RING_BEAT
        const k = Math.min(1, s.ringT / RING_CLOSE)
        ringBeat(sim, u, s, RING_FROM + (RING_TO - RING_FROM) * (k * k * (3 - 2 * k)))
      }
    }
    // The rift's pull: shards round the hero, and a clock.
    if (s.pull > 0 && u.alive) {
      s.pull -= dt
      s.shardT -= dt
      if (s.shardT <= 0) {
        s.shardT = SHARD_EVERY
        const h = sim.hero.unit
        const a = sim.rng() * Math.PI * 2
        const r = sim.rng() * 3
        const x = h.x + Math.sin(a) * r
        const z = h.z + Math.cos(a) * r
        warn(sim, u, { shape: 'circle', x, z, r: SHARD_R, w: 0, a: 0, dur: SHARD_WARN })
        sim.after(SHARD_WARN, () => {
          if (!u.alive) return
          sim.emit({ t: 'fx', id: 'burst:void', x, z, r: SHARD_R + 0.3, color: VOID })
          for (const t of sim.inCircle(other(u), x, z, SHARD_R, hitsBuf)) strikeFor(sim, u, t, 1.2, 'shadow')
        })
      }
      if (s.pull <= 0) {
        // It tears free: healed to 30 %, and the third phase goes on.
        s.pull = 0
        s.heals++
        heal(sim, u, Math.max(0, u.s.maxHp * HEAL_TO - u.hp))
        b.phase = 3
        u.phase = 3
        sim.emit({ t: 'bossPhase', unit: u.id, phase: 3 })
        sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 10, color: VOID })
        b.next = 1
      }
    }
  },
  air(sim, u, dt) {
    const b = u.boss!
    const t = b.modeT
    switch (b.sub) {
      case 'rise':
        b.alt = HIGH * Math.min(1, t / RISE) ** 0.8
        if (t >= RISE) { b.sub = 'hover'; b.modeT = 0; b.next = 0.6 }
        return true
      case 'hover': {
        // It hangs over its field, turning to the hero; a breath, then meteors.
        b.alt = HIGH
        const h = sim.hero.unit
        u.facing = Math.atan2(h.x - u.x, h.z - u.z)
        if (b.next > 0) return true
        if (b.n <= 0) {
          b.sub = 'land'
          b.modeT = 0
          warn(sim, u, { shape: 'circle', x: u.x, z: u.z, r: 4.5, w: 0, a: 0, dur: LAND })
          return true
        }
        b.n--
        b.next = SKY_WARN + 1.6
        const a = u.facing
        warn(sim, u, { shape: 'line', x: u.x, z: u.z, r: SKY_LEN, w: SKY_W, a, dur: SKY_WARN })
        sim.after(SKY_WARN, () => { if (u.alive && b.mode === 'air') skyBreath(sim, u, a) })
        meteors(sim, u, 3)
        return true
      }
      case 'land':
        b.alt = HIGH * (1 - Math.min(1, t / LAND)) ** 1.6
        if (t >= LAND) {
          b.alt = 0
          b.mode = ''
          b.sub = ''
          sim.emit({ t: 'fx', id: 'quake', x: u.x, z: u.z, r: 4.5, color: COLOR })
          for (const h of sim.inCircle(other(u), u.x, u.z, 4.5, hitsBuf)) { strikeFor(sim, u, h, 1.4); knockback(h, u.x, u.z, 7) }
          daze(sim, u, 4, 0.5)
          b.cd.fly = GROUND_BETWEEN + 4
          b.next = 3
        }
        return true
    }
    b.mode = ''
    b.alt = 0
    return false
  },
  botGoal(sim, u) {
    const b = u.boss!
    if (b.mode !== 'air' || b.sub !== 'hover') return null
    // Behind the nearest rune stone, as seen from the dragon.
    const h = sim.hero.unit
    let bx = 0
    let bz = 0
    let bd = Infinity
    for (const w of sim.walls) {
      if (w.fx !== 'rune' || w.t >= w.dur) continue
      const c = w.cells[0]!
      const x = ((c % sim.grid.w) + 0.5) * CELL
      const z = (Math.floor(c / sim.grid.w) + 0.5) * CELL
      const d0 = Math.max(0.01, Math.hypot(x - u.x, z - u.z))
      const sx = x + ((x - u.x) / d0) * (CELL * 0.5 + 0.6)
      const sz = z + ((z - u.z) / d0) * (CELL * 0.5 + 0.6)
      if (isSolidAt(sim.grid, sx, sz)) continue
      const d = Math.hypot(sx - h.x, sz - h.z)
      if (d < bd) { bd = d; bx = sx; bz = sz }
    }
    return bd < Infinity ? { x: bx, z: bz } : null
  }
}

export const ELDER_DRAGON_SCRIPTS: Record<string, BossScript> = { elderDragon }
export const ELDER_DRAGON_TUNING = { BREATH_WARN, TAIL_WARN, GUST_WARN, GUST_PUSH, SKY_WARN, SKY_BREATHS, METEOR_WARN, RUNES, RUNE_HITS, RING_TO, PULL, HEAL_TO, SHARD_WARN }
/** The rift's pull and the ring as they stand (tests, the view). */
export const elderDragonOf = (u: Unit): { pull: number; heals: number; ring: boolean } | undefined => {
  const s = u.boss ? states.get(u.boss) : undefined
  return s ? { pull: s.pull, heals: s.heals, ring: s.ringT > 0 } : undefined
}
