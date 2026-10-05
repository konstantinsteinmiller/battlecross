import { hasLineOfSight, isSolidAt } from '../grid'
import { addField, cellIndex, raiseWall } from '../actors'
import { applyStatus, knockback } from '../combat'
import type { Sim } from '../world'
import type { BossState, Unit } from '../types'
import type { BossScript } from './index'
import { bark, laneLength, move, other, shatterWallAt, strikeFor, warn, windCharge, type ChargeOpts } from './kit'

/**
 * ─── The Frost Jarl, Shatterlake (Frostpeak Tundra) ─────────────────────────
 *
 *   100–50 %  HAMMERFALL: the circle shows where the hero stands, the hammer
 *             comes down there and a row of ICE SPIKES bursts up across it
 *             (they stand 8 s). The SHOULDER CHARGE: the lane shows, he runs
 *             it; whoever he meets is thrown aside. Into the rock he staggers
 *             a moment — into an ice spike, the spike shatters and he stands
 *             dazed 3 s. Hide behind the ice.
 *   50 %      THE ICE BREAKS: he smashes the lake, frozen patches crack open
 *             all over the field (they slow), and from now on the ROLLING
 *             GLACIER: a wall of ice grinds across the whole field, one gap
 *             in it — two wide warnings show where it runs, the gap between.
 */

const COLOR = '#8fd8ff'
const SHOULDER: ChargeOpts = {
  speed: 13, max: 16, dmg: 1.5, pinDmg: 0, pinStun: 0, daze: 1, carry: false,
  // His own ice stops him cold; the rock only staggers him.
  wallDaze: (sim, x, z) => (shatterWallAt(sim, x, z) === 'ice' ? (sim.emit({ t: 'fx', id: 'burst:frost', x, z, r: 2.4, color: COLOR }), 3) : 1)
}
/** Hammerfall: its reach, its wind-up, how long the spikes stand. */
const HAMMER_R = 2.4
const HAMMER_T = 1.15
const SPIKE_DUR = 8
/** The glacier: its warning, its speed (m/s), its thickness, the gap's half-width, its half-span. */
const GLACIER_WARN = 1.8
const GLACIER_SPEED = 6.5
const GLACIER_DEPTH = 1.3
const GLACIER_GAP = 1.8
const GLACIER_SPAN = 14

const hitsBuf: Unit[] = []

/** The glacier under way: where it starts, its heading, its run, where its gap is. */
interface Glacier { x: number; z: number; dx: number; dz: number; len: number; gap: number }
const glaciers = new WeakMap<BossState, Glacier>()

/** A row of ice spikes across (x, z), at right angles to `a`. */
const spikes = (sim: Sim, x: number, z: number, a: number): void => {
  const px = Math.cos(a)
  const pz = -Math.sin(a)
  const cells: number[] = []
  for (let k = -2; k <= 2; k++) {
    const k0 = cellIndex(sim, x + px * k * 1.4, z + pz * k * 1.4)
    if (k0 >= 0 && !cells.includes(k0)) cells.push(k0)
  }
  raiseWall(sim, cells, SPIKE_DUR, 'ice')
  sim.emit({ t: 'fx', id: 'spike', x, z, r: 3, color: COLOR })
}

/** The glacier: across the field along `a`, the gap at `gap` metres off its middle line. */
const glacier = (sim: Sim, u: Unit, a: number, gap: number): void => {
  const b = u.boss!
  const dx = Math.sin(a)
  const dz = Math.cos(a)
  const h = sim.hero.unit
  // It starts behind the rock on the far side of the hero and runs through to the other.
  const back = laneLength(sim, h.x, h.z, -dx, -dz, 14, 0.2)
  const fwd = laneLength(sim, h.x, h.z, dx, dz, 14, 0.2)
  const sx = h.x - dx * (back + 1)
  const sz = h.z - dz * (back + 1)
  const len = back + fwd + 2
  glaciers.set(b, { x: sx, z: sz, dx, dz, len, gap })
  b.cd.glacier = GLACIER_WARN
  b.cd.glacierRun = GLACIER_WARN + len / GLACIER_SPEED
  b.marks = b.marks.filter(m => !m.startsWith('g:'))
  // Two wide warnings, one each side of the gap.
  const px = Math.cos(a)
  const pz = -Math.sin(a)
  for (const [lo, hi] of [[-GLACIER_SPAN, gap - GLACIER_GAP], [gap + GLACIER_GAP, GLACIER_SPAN]] as const) {
    const mid = (lo + hi) / 2
    warn(sim, u, { shape: 'line', x: sx + px * mid, z: sz + pz * mid, r: len, w: (hi - lo) / 2, a, dur: GLACIER_WARN })
  }
}

/** One step of the glacier's run. */
const stepGlacier = (sim: Sim, u: Unit, dt: number): void => {
  const b = u.boss!
  const run = b.cd.glacierRun ?? 0
  const g = glaciers.get(b)
  if (!g || run <= 0 || (b.cd.glacier ?? 0) > 0) return
  const d = Math.max(0, Math.min(g.len, g.len - (run - dt) * GLACIER_SPEED))
  const cx = g.x + g.dx * d
  const cz = g.z + g.dz * d
  const px = g.dz
  const pz = -g.dx
  // The wall of ice, drawn as frost bursting along it (a beat at a time).
  if ((b.cd.glacierFx ?? 0) <= 0) {
    b.cd.glacierFx = 0.18
    for (let s = -GLACIER_SPAN; s <= GLACIER_SPAN; s += 2.4) {
      if (Math.abs(s - g.gap) < GLACIER_GAP) continue
      const x = cx + px * s
      const z = cz + pz * s
      if (isSolidAt(sim.grid, x, z)) continue
      sim.emit({ t: 'fx', id: 'burst:frost', x, z, r: 1.5, color: COLOR })
    }
  }
  for (const t of sim.inCircle(other(u), cx, cz, GLACIER_SPAN + 1, hitsBuf)) {
    const along = (t.x - cx) * g.dx + (t.z - cz) * g.dz
    const across = (t.x - cx) * px + (t.z - cz) * pz
    if (Math.abs(along) > GLACIER_DEPTH + t.r || Math.abs(across) > GLACIER_SPAN || Math.abs(across - g.gap) < GLACIER_GAP - t.r * 0.5) continue
    if (b.marks.includes('g:' + t.id)) continue
    b.marks.push('g:' + t.id)
    strikeFor(sim, u, t, 1.8, 'frost')
    applyStatus(sim, t, 'frozen', 1.2, 1, u)
    knockback(t, t.x - g.dx, t.z - g.dz, 5)
  }
}

const shatterlake: BossScript = {
  phases: [0.5],
  think(sim, u, tgt) {
    const b = u.boss!
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    const los = hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)
    if (b.phase >= 2 && (b.cd.glacierNext ?? 0) <= 0 && (b.cd.glacierRun ?? 0) <= 0) {
      b.cd.glacierNext = 13
      move(sim, u, 'slam', 0.9, 0.6, tgt)
      b.marks.push('glacier')
      return true
    }
    if (b.next > 0) return false
    if ((b.cd.charge ?? 0) <= 0 && los && d > 4) {
      b.cd.charge = b.phase >= 2 ? 7 : 8.5
      b.next = 1.5
      windCharge(sim, u, tgt, 1.1, SHOULDER)
      return true
    }
    if ((b.cd.hammer ?? 0) <= 0 && d < 12) {
      b.cd.hammer = b.phase >= 2 ? 7 : 9
      b.next = 1.5
      const a = Math.atan2(tgt.x - u.x, tgt.z - u.z)
      const stand = Math.max(0, d - HAMMER_R - u.r * 0.5)
      let sx = u.x + Math.sin(a) * stand
      let sz = u.z + Math.cos(a) * stand
      if (isSolidAt(sim.grid, sx, sz)) { sx = u.x; sz = u.z }
      b.goalX = tgt.x
      b.goalZ = tgt.z
      move(sim, u, 'leap', HAMMER_T, 0.5, tgt, sx, sz, 1)
      bark(sim, u, 'frostJarl', 'hammer')
      warn(sim, u, { shape: 'circle', x: tgt.x, z: tgt.z, r: HAMMER_R, w: 0, a: 0, dur: HAMMER_T, wind: HAMMER_T })
      return true
    }
    return false
  },
  land(sim, u, act) {
    const b = u.boss!
    if (act.id === 'leap') {
      // Hammerfall: he lands short of the spot, the hammer comes down on it.
      const hx = b.goalX
      const hz = b.goalZ
      u.x = u.px = act.x
      u.z = u.pz = act.z
      const a = Math.atan2(hx - u.x, hz - u.z)
      u.facing = a
      sim.emit({ t: 'fx', id: 'quake', x: hx, z: hz, r: HAMMER_R + 1, color: COLOR })
      for (const t of sim.inCircle(other(u), hx, hz, HAMMER_R, hitsBuf)) {
        strikeFor(sim, u, t, 1.9, 'frost')
        applyStatus(sim, t, 'slow', 2.5, 0.45, u)
        knockback(t, hx, hz, 5)
      }
      spikes(sim, hx, hz, a)
    } else if (act.id === 'slam' && b.marks.includes('glacier')) {
      b.marks.splice(b.marks.indexOf('glacier'), 1)
      sim.emit({ t: 'fx', id: 'quake', x: u.x, z: u.z, r: 5, color: COLOR })
      const h = sim.hero.unit
      // Across the hero's line, or along it, by turns; the gap never under the hero.
      const base = Math.atan2(h.x - u.x, h.z - u.z) + (b.n++ % 2 ? Math.PI / 2 : 0)
      const side = sim.rng() < 0.5 ? -1 : 1
      glacier(sim, u, base, side * (3.5 + sim.rng() * 4))
    } else if (act.id === 'enrage') {
      // The ice breaks: frozen patches crack open all over the field.
      sim.emit({ t: 'fx', id: 'quake', x: u.x, z: u.z, r: 8, color: COLOR })
      for (let i = 0; i < 9; i++) {
        const ang = (i / 9) * Math.PI * 2 + sim.rng() * 0.5
        const r = 4 + sim.rng() * 7
        const x = u.homeX + Math.sin(ang) * r
        const z = u.homeZ + Math.cos(ang) * r
        if (isSolidAt(sim.grid, x, z)) continue
        addField(sim, { fx: 'frost', kind: 'web', src: u, x, z, r: 1.8 + sim.rng() * 0.8, dur: 40, every: 0.5, dmg: 0, type: 'frost', color: COLOR })
      }
      for (const t of sim.inCircle(other(u), u.x, u.z, 5, hitsBuf)) knockback(t, u.x, u.z, 6)
    }
  },
  onPhase(sim, u, phase) {
    if (phase !== 2) return
    const b = u.boss!
    move(sim, u, 'enrage', 1.1, 0.5, null)
    bark(sim, u, 'frostJarl', 'iceBreak')
    sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 9, color: COLOR })
    applyStatus(sim, u, 'enrage', 60, 0.2, u)
    b.cd.glacierNext = 3
  },
  tick(sim, u, dt) {
    stepGlacier(sim, u, dt)
  }
}

export const SHATTERLAKE_SCRIPTS: Record<string, BossScript> = { shatterlake }
export const SHATTERLAKE_TUNING = { HAMMER_R, HAMMER_T, SPIKE_DUR, GLACIER_WARN, GLACIER_SPEED, GLACIER_GAP, GLACIER_SPAN }
