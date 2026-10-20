import { CELL, isSolidAt, nearestOpen } from '../grid'
import { addField, cellIndex, raiseWall } from '../actors'
import { applyStatus, knockback, removeStatus } from '../combat'
import { spawnEnemy } from '../spawn'
import { hasStatus, type Sim } from '../world'
import type { BossState, Unit } from '../types'
import type { BossScript } from './index'
import { bark, other, raiseProps, shatterWallAt, strikeFor, warn } from './kit'

/**
 * ─── The Leviathan (Void Citadel, afterplay §5.5) — teaches the water arena ─
 *
 *   all fight  the hall is FLOODED: inside it the water slows the hero by
 *             half (it does no harm), and six small stone ISLANDS stand out
 *             of it. The Leviathan lives under the water and is only hit
 *             while it is up: it SURFACES at an island's edge near the hero
 *             (bubbles show the spot 1.2 s first), BITES whoever stands
 *             there, holds its head up a few seconds, and dives again.
 *   every 14 s THE TIDAL WAVE crosses the whole hall, one gap in it (two wide
 *             lanes show where it runs): stand in the gap, or behind an
 *             island, which breaks the wave for whoever shelters in its lee.
 *   60 %      the islands SINK one by one (a ring shows which, 3 s first) and
 *             stay under 15 s: less cover from the wave.
 *   30 %      it GRABS: the bubbles rise under the hero himself, and whoever
 *             is still there is held 2 s; two sea-demons come up with it.
 */

const COLOR = '#3a8ac8'
const WATER = '#2a6a9a'
/** How far round its home the hall is flooded (m), and how much the water slows. */
const WATER_R = 13
const WATER_SLOW = 0.5
const ISLES = 6
const BUBBLES = 1.2
const BITE_R = 2.4
const UP_T = 4
const DOWN_T = 1.6
const WAVE_EVERY = 14
const WAVE_WARN = 2
const WAVE_SPEED = 7
const WAVE_DEPTH = 1.3
const WAVE_GAP = 1.8
const WAVE_SPAN = 14
/** The lee of an island: metres behind it the wave breaks. */
const LEE = 2.6
const SINK_EVERY = 6
const SINK_WARN = 3
const SINK_DUR = 15
const GRAB_HOLD = 2

interface Wave { x: number; z: number; dx: number; dz: number; len: number; gap: number; run: number; warn: number }
/** What the script keeps between steps. */
interface LvState {
  /** Under the water (out of reach) or up; seconds left of either. */
  up: boolean; t: number
  /** Bubbles rising: seconds left, and where it comes up. */
  rise: number; sx: number; sz: number; grab: boolean
  wave: Wave | null; waveT: number; fxT: number
  /** The islands that are under, by cell, and seconds until each comes back. */
  sunk: number[]; sunkT: number[]
  sinkT: number; sinkCell: number; sinkWarn: number
  waterT: number
  /** Who the wave has hit already (once a wave). */
  hit: number[]
}
const states = new WeakMap<BossState, LvState>()
const state = (b: BossState): LvState => {
  let s = states.get(b)
  if (!s) {
    s = { up: false, t: DOWN_T, rise: 0, sx: 0, sz: 0, grab: false, wave: null, waveT: WAVE_EVERY * 0.6, fxT: 0, sunk: [], sunkT: [], sinkT: SINK_EVERY, sinkCell: -1, sinkWarn: 0, waterT: 0, hit: [] }
    states.set(b, s)
  }
  return s
}

const hitsBuf: Unit[] = []
const open2: [number, number] = [0, 0]

/** The islands standing now, by cell. */
const isles = (sim: Sim): number[] => {
  const out: number[] = []
  for (const w of sim.walls) if (w.fx === 'isle' && w.t < w.dur) out.push(w.cells[0]!)
  return out
}
const cellX = (sim: Sim, c: number): number => ((c % sim.grid.w) + 0.5) * CELL
const cellZ = (sim: Sim, c: number): number => (Math.floor(c / sim.grid.w) + 0.5) * CELL

/** Under it goes: out of reach, not seen. */
const dive = (sim: Sim, u: Unit, s: LvState): void => {
  s.up = false
  s.t = DOWN_T + sim.rng() * 1.2
  applyStatus(sim, u, 'stealth', 99, 1, u, { quiet: true })
  applyStatus(sim, u, 'invulnerable', 99, 1, u, { quiet: true })
  u.boss!.guard = 0
  u.action = null
  sim.emit({ t: 'fx', id: 'burst:water', x: u.x, z: u.z, r: 2, color: COLOR })
}

/** Where it comes up next: at the edge of the island nearest the hero (or under him, grabbing). */
const planRise = (sim: Sim, u: Unit, s: LvState): void => {
  const h = sim.hero.unit
  s.grab = u.boss!.phase >= 3
  let x = h.x
  let z = h.z
  if (!s.grab) {
    let best = -1
    let bd = Infinity
    for (const c of isles(sim)) {
      const d = Math.hypot(cellX(sim, c) - h.x, cellZ(sim, c) - h.z)
      if (d < bd) { bd = d; best = c }
    }
    if (best >= 0) {
      const ix = cellX(sim, best)
      const iz = cellZ(sim, best)
      const d = Math.max(0.01, Math.hypot(h.x - ix, h.z - iz))
      x = ix + ((h.x - ix) / d) * (CELL * 0.5 + 1.2)
      z = iz + ((h.z - iz) / d) * (CELL * 0.5 + 1.2)
    }
  }
  if (isSolidAt(sim.grid, x, z) && nearestOpen(sim.grid, x, z, open2, 3)) { x = open2[0]; z = open2[1] }
  s.sx = x
  s.sz = z
  s.rise = BUBBLES
  // It moves under the water to the spot.
  u.x = u.px = x
  u.z = u.pz = z
  warn(sim, u, { shape: 'circle', x, z, r: BITE_R, w: 0, a: 0, dur: BUBBLES })
  sim.emit({ t: 'fx', id: 'burst:water', x, z, r: 1.4, color: COLOR })
}

/** Up it comes: the bite (or the grab), and it is open to blows. */
const surface = (sim: Sim, u: Unit, s: LvState): void => {
  s.up = true
  s.t = UP_T
  removeStatus(u, 'stealth')
  removeStatus(u, 'invulnerable')
  u.boss!.guard = 1
  sim.emit({ t: 'fx', id: 'quake', x: s.sx, z: s.sz, r: BITE_R + 0.4, color: COLOR })
  for (const t of sim.inCircle(other(u), s.sx, s.sz, BITE_R, hitsBuf)) {
    strikeFor(sim, u, t, s.grab ? 1 : 1.7)
    if (s.grab && t.rank === 'hero') {
      // Held in its jaws: the hold, and its teeth the while.
      applyStatus(sim, t, 'stun', GRAB_HOLD, 1, u)
      for (let k = 1; k <= 3; k++) sim.after(k * 0.6, () => { if (u.alive && t.alive) strikeFor(sim, u, t, 0.35) })
    } else knockback(t, s.sx, s.sz, 5)
  }
}

/** The wave across the hall, its gap somewhere the hero can reach. */
const tidal = (sim: Sim, u: Unit, s: LvState): void => {
  const a = sim.rng() * Math.PI * 2
  const dx = Math.sin(a)
  const dz = Math.cos(a)
  const px = dz
  const pz = -dx
  const h = sim.hero.unit
  // Across from beyond the hall's edge to beyond the other, through its home.
  const len = WATER_R * 2 + 2
  const x = u.homeX - dx * (WATER_R + 1)
  const z = u.homeZ - dz * (WATER_R + 1)
  // The gap: within a few metres of the hero's line, so it can be reached.
  const across = (h.x - x) * px + (h.z - z) * pz
  const gap = Math.max(-WAVE_SPAN + 3, Math.min(WAVE_SPAN - 3, across + (sim.rng() - 0.5) * 8))
  s.wave = { x, z, dx, dz, len, gap, run: len / WAVE_SPEED, warn: WAVE_WARN }
  s.hit.length = 0
  for (const [lo, hi] of [[-WAVE_SPAN, gap - WAVE_GAP], [gap + WAVE_GAP, WAVE_SPAN]] as const) {
    const mid = (lo + hi) / 2
    warn(sim, u, { shape: 'line', x: x + px * mid, z: z + pz * mid, r: len, w: (hi - lo) / 2, a, dur: WAVE_WARN })
  }
}

/** Does an island break the wave (heading dx, dz) for whoever stands at (x, z)? */
export const inLee = (sim: Sim, x: number, z: number, dx: number, dz: number): boolean => {
  for (let k = 0.5; k <= LEE; k += 0.35) {
    const c = cellIndex(sim, x - dx * k, z - dz * k)
    if (c >= 0 && sim.walls.some(w => w.fx === 'isle' && w.t < w.dur && w.cells[0] === c)) return true
  }
  return false
}

/** One step of the wave's run. */
const stepWave = (sim: Sim, u: Unit, s: LvState, dt: number): void => {
  const w = s.wave
  if (!w) return
  if (w.warn > 0) { w.warn -= dt; return }
  w.run -= dt
  const d = Math.max(0, Math.min(w.len, w.len - w.run * WAVE_SPEED))
  const cx = w.x + w.dx * d
  const cz = w.z + w.dz * d
  const px = w.dz
  const pz = -w.dx
  s.fxT -= dt
  if (s.fxT <= 0) {
    s.fxT = 0.18
    for (let k = -WAVE_SPAN; k <= WAVE_SPAN; k += 2.4) {
      if (Math.abs(k - w.gap) < WAVE_GAP) continue
      const x = cx + px * k
      const z = cz + pz * k
      if (!isSolidAt(sim.grid, x, z)) sim.emit({ t: 'fx', id: 'burst:water', x, z, r: 1.5, color: COLOR })
    }
  }
  for (const t of sim.inCircle(other(u), cx, cz, WAVE_SPAN + 1, hitsBuf)) {
    const along = (t.x - cx) * w.dx + (t.z - cz) * w.dz
    const across = (t.x - cx) * px + (t.z - cz) * pz
    if (Math.abs(along) > WAVE_DEPTH + t.r || Math.abs(across) > WAVE_SPAN || Math.abs(across - w.gap) < WAVE_GAP - t.r * 0.5) continue
    if (s.hit.includes(t.id) || inLee(sim, t.x, t.z, w.dx, w.dz)) continue
    s.hit.push(t.id)
    strikeFor(sim, u, t, 1.9, 'frost')
    applyStatus(sim, t, 'knockdown', 0.9, 1, u)
    knockback(t, t.x - w.dx, t.z - w.dz, 6)
  }
  if (w.run <= 0) s.wave = null
}

const leviathan: BossScript = {
  phases: [0.6, 0.3],
  arena(sim, u) {
    raiseProps(sim, u, 'isle', ISLES, 3.5, 8.5)
    const s = state(u.boss!)
    dive(sim, u, s)
  },
  think(sim, u, tgt) {
    const b = u.boss!
    if (!b.marks.includes('bark:intro')) bark(sim, u, 'leviathan', 'intro')
    const s = state(b)
    // Up, with the hero at its jaws: the generic snap (its def's swing). Else it holds its place.
    return !(s.up && Math.hypot(tgt.x - u.x, tgt.z - u.z) < u.r + 2.6)
  },
  onPhase(sim, u, phase) {
    sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 8, color: COLOR })
    if (phase === 2) bark(sim, u, 'leviathan', 'sink')
    if (phase === 3) {
      bark(sim, u, 'leviathan', 'grab')
      for (let i = 0; i < 2; i++) {
        const a = sim.rng() * Math.PI * 2
        const x = u.homeX + Math.sin(a) * 4
        const z = u.homeZ + Math.cos(a) * 4
        if (isSolidAt(sim.grid, x, z)) continue
        const m = spawnEnemy(sim, 'seaDemon', x, z, u.group, u)
        if (m) { m.awake = true; sim.emit({ t: 'fx', id: 'burst:water', x, z, r: 1.6, color: COLOR }) }
      }
    }
  },
  tick(sim, u, dt) {
    const b = u.boss!
    const s = state(b)
    // The flood: drawn as a broad sheet laid in beats, and it drags at the hero's legs.
    s.waterT -= dt
    if (s.waterT <= 0) {
      s.waterT = 4
      addField(sim, { fx: 'water', kind: 'damage', src: u, x: u.homeX, z: u.homeZ, r: WATER_R, dur: 4, color: WATER })
    }
    const h = sim.hero.unit
    // The Leviathan Scale (afterplay phase 8) walks on water: it does not drag.
    if (u.awake && h.alive && !h.s.mods.waterWalk && Math.hypot(h.x - u.homeX, h.z - u.homeZ) < WATER_R && h.action?.id !== 'roll') applyStatus(sim, h, 'slow', 0.25, WATER_SLOW, u, { quiet: true })
    if (!u.awake) return
    // Under or up.
    if (s.rise > 0) {
      s.rise -= dt
      if (s.rise <= 0) surface(sim, u, s)
    } else {
      s.t -= dt
      if (s.t <= 0) {
        if (s.up) dive(sim, u, s)
        else if (!s.wave) planRise(sim, u, s)
        else s.t = 0.3
      }
    }
    if (!s.up && !hasStatus(u, 'invulnerable')) { applyStatus(sim, u, 'invulnerable', 99, 1, u, { quiet: true }); b.guard = 0 }
    // The wave, under the water.
    s.waveT -= dt
    if (s.waveT <= 0 && !s.wave && !s.up && s.rise <= 0) {
      s.waveT = b.phase >= 2 ? WAVE_EVERY - 2 : WAVE_EVERY
      tidal(sim, u, s)
    }
    stepWave(sim, u, s, dt)
    // The islands sink (from 60 %), one at a time, and come back.
    for (let i = s.sunk.length - 1; i >= 0; i--) {
      s.sunkT[i]! -= dt
      if (s.sunkT[i]! > 0) continue
      const c = s.sunk[i]!
      s.sunk.splice(i, 1)
      s.sunkT.splice(i, 1)
      if (!sim.units.some(q => q.alive && cellIndex(sim, q.x, q.z) === c)) raiseWall(sim, [c], 1e6, 'isle')
    }
    if (b.phase >= 2) {
      if (s.sinkWarn > 0) {
        s.sinkWarn -= dt
        if (s.sinkWarn <= 0 && s.sinkCell >= 0) {
          const x = cellX(sim, s.sinkCell)
          const z = cellZ(sim, s.sinkCell)
          if (shatterWallAt(sim, x, z) === 'isle') {
            s.sunk.push(s.sinkCell)
            s.sunkT.push(SINK_DUR)
            sim.emit({ t: 'fx', id: 'burst:water', x, z, r: 2, color: COLOR })
          }
          s.sinkCell = -1
        }
      } else {
        s.sinkT -= dt
        const standing = isles(sim)
        // Never the last two: there is always somewhere to shelter.
        if (s.sinkT <= 0 && standing.length > 2) {
          s.sinkT = SINK_EVERY
          s.sinkCell = standing[Math.floor(sim.rng() * standing.length)]!
          s.sinkWarn = SINK_WARN
          warn(sim, u, { shape: 'circle', x: cellX(sim, s.sinkCell), z: cellZ(sim, s.sinkCell), r: CELL * 0.8, w: 0, a: 0, dur: SINK_WARN })
        }
      }
    }
  },
  botGoal(sim, u) {
    const s = state(u.boss!)
    const w = s.wave
    if (!w) return null
    // Shelter: the lee of the island nearest, or the gap, whichever is closer.
    const h = sim.hero.unit
    let bx = 0
    let bz = 0
    let bd = Infinity
    for (const c of isles(sim)) {
      if (c === s.sinkCell) continue
      const x = cellX(sim, c) + w.dx * (CELL * 0.5 + 0.7)
      const z = cellZ(sim, c) + w.dz * (CELL * 0.5 + 0.7)
      if (isSolidAt(sim.grid, x, z)) continue
      const d = Math.hypot(x - h.x, z - h.z)
      if (d < bd) { bd = d; bx = x; bz = z }
    }
    // The gap's lane, level with the hero.
    const px = w.dz
    const pz = -w.dx
    const along = (h.x - w.x) * w.dx + (h.z - w.z) * w.dz
    const gx = w.x + w.dx * along + px * w.gap
    const gz = w.z + w.dz * along + pz * w.gap
    const gd = Math.hypot(gx - h.x, gz - h.z)
    if (gd < bd && !isSolidAt(sim.grid, gx, gz)) return { x: gx, z: gz }
    return bd < Infinity ? { x: bx, z: bz } : null
  }
}

export const LEVIATHAN_SCRIPTS: Record<string, BossScript> = { leviathan }
export const LEVIATHAN_TUNING = { WATER_R, WATER_SLOW, ISLES, BUBBLES, BITE_R, UP_T, WAVE_EVERY, WAVE_WARN, SINK_WARN, SINK_DUR, GRAB_HOLD }
/** Is it up (open to blows)? Where is the wave? (tests, the view) */
export const leviathanOf = (u: Unit): { up: boolean; rising: boolean; wave: Readonly<Wave> | null; sunk: readonly number[] } | undefined => {
  const s = u.boss ? states.get(u.boss) : undefined
  return s ? { up: s.up, rising: s.rise > 0, wave: s.wave, sunk: s.sunk } : undefined
}
