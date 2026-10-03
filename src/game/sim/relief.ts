import type { ZoneRelief } from '../data/zones'
import { CELL } from './grid'
import { valueNoise } from './ground'
import { mulberry32 } from './rng'
import {
  K_BLOCK, K_BRIDGE, K_CLIFF, K_FORD, K_PLATE, K_WATER, riverRow,
  type CrossingPlan, type DaisPlan, type LedgePlan, type LobePlan, type RiverPlan
} from './zoneFeatures'

/**
 * ─── The lie of the land (roadmap #57) ───────────────────────────────────────
 *
 * The height of every grid corner, from a plan that is otherwise finished.
 * Its own seeded stream: the packs, the features and the walk grid of a seed
 * are what they were; this only says how high each part of them lies.
 *
 *   1. Each clearing gets a level: the road climbs (or delves, or both) from
 *      one to the next, never more steeply than the pass between them allows.
 *      Side places sit a little above their clearing (a champion's knoll) or
 *      below it (a cave, a lagoon).
 *   2. The levels are spread over the map (inverse distance to each place's
 *      edge, so a clearing is level inside and the slope lives in the pass),
 *      blurred, and rolled with low noise so nothing is dead flat; then
 *      SWELLS, hills and dips of a metre or so, rise across each clearing's
 *      outer ring and between clearings, fading to nothing over the middle
 *      of a clearing where the fights are. The road is worn a little lower.
 *   3. A finale's dais is raised; a ledge steps the ground up past its edge
 *      (sharply on the cliff, over the run of the ramp at its ramp).
 *   4. Water lies level: a river in a valley (its banks and bridge flat), a
 *      pond in a hollow. Chests, plates and carved stones stand on level pads.
 *   5. Every slope that is not a cliff is relaxed until it can be walked up
 *      (no more than `SLOPE` metres between neighbouring corners).
 */

/** The steepest a walkable slope gets: metres of rise between corners 1.5 m apart (≈ 20°). */
export const SLOPE = 0.55

const RELIEF_SALT = 0x6c2f81a3

export interface ReliefCtx {
  seed: number
  w: number
  h: number
  kind: Uint8Array
  /** The worn road (it is walked a little lower than the ground beside it). */
  trail: Uint8Array
  /** Clearing centres and radii, in cells (0 the start, the last the finale). */
  cs: Array<{ i: number; j: number; r: number }>
  lobes: LobePlan[]
  ledges: LedgePlan[]
  dais: DaisPlan | null
  rivers: RiverPlan[]
  crossings: CrossingPlan[]
  relief: ZoneRelief
  tutorial: boolean
}

const smooth = (a: number, b: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export const buildRelief = (c: ReliefCtx): Float32Array => {
  const { w, h, kind, cs } = c
  const W1 = w + 1
  const H1 = h + 1
  const H = new Float32Array(W1 * H1)
  const pinned = new Uint8Array(W1 * H1)
  const rng = mulberry32((c.seed ^ RELIEF_SALT) >>> 0)
  const rel = c.relief
  const n = cs.length - 1
  const calm = c.tutorial ? 0.4 : 1

  // ── 1. Levels ──
  const level = new Float32Array(cs.length)
  let dir = rel.trend === 'down' ? -1 : rel.trend === 'up' ? 1 : rng() < 0.5 ? 1 : -1
  for (let k = 1; k <= n; k++) {
    const a = cs[k - 1]!
    const b = cs[k]!
    if (rel.trend === 'mixed' && rng() < 0.45) dir = -dir
    const gap = Math.hypot(b.i - a.i, b.j - a.j) - a.r - b.r
    // A pass climbs no faster than a third of a metre per cell of it.
    const cap = Math.max(0, gap - 0.5) * 0.3
    const d = (rel.climb[0] + rng() * (rel.climb[1] - rel.climb[0])) * calm
    level[k] = level[k - 1]! + dir * Math.min(d, cap)
  }
  const discs: Array<{ x: number; z: number; r: number; y: number }> = cs.map((p, k) => ({ x: p.i + 0.5, z: p.j + 0.5, r: p.r, y: level[k]! }))
  for (const l of c.lobes) discs.push({ x: l.x / CELL, z: l.z / CELL, r: l.r / CELL, y: (level[l.k] ?? 0) + l.lift * calm })

  // ── 2. Spread, blur, roll ──
  for (let cj = 0; cj < H1; cj++) {
    for (let ci = 0; ci < W1; ci++) {
      let sw = 0
      let s = 0
      for (const d of discs) {
        const dx = ci - d.x
        const dz = cj - d.z
        const e = Math.max(0, Math.sqrt(dx * dx + dz * dz) - d.r)
        const wt = 1 / ((e + 0.35) * (e + 0.35) * (e + 0.35))
        sw += wt
        s += wt * d.y
      }
      H[cj * W1 + ci] = s / sw
    }
  }
  const tmp = new Float32Array(W1 * H1)
  for (let pass = 0; pass < 2; pass++) {
    for (let cj = 0; cj < H1; cj++) {
      for (let ci = 0; ci < W1; ci++) {
        let s = 0
        let m = 0
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          const i = ci + di
          const j = cj + dj
          if (i < 0 || j < 0 || i >= W1 || j >= H1) continue
          s += H[j * W1 + i]!
          m++
        }
        tmp[cj * W1 + ci] = s / m
      }
    }
    H.set(tmp)
  }
  const ns = Math.floor(rng() * 100000)
  const roll = rel.roll * calm
  for (let cj = 0; cj < H1; cj++) {
    for (let ci = 0; ci < W1; ci++) {
      const x = ci * CELL
      const z = cj * CELL
      H[cj * W1 + ci]! += roll * ((valueNoise(x * 0.085, z * 0.085, ns) * 2 - 1) * 0.75 + (valueNoise(x * 0.21, z * 0.21, ns + 9) * 2 - 1) * 0.25)
    }
  }

  // Swells: broad hills and dips, kept off the middle of each clearing.
  const swell = rel.swell * calm
  if (swell > 0) {
    const ns2 = Math.floor(rng() * 100000)
    // Props stand on level pads: the swells keep away from them (and from a
    // puzzle's plates, which then lie on one level floor).
    const pads: Array<[number, number]> = []
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const kd = kind[j * w + i]
      if (kd === K_BLOCK || kd === K_PLATE) pads.push([i + 0.5, j + 0.5])
    }
    for (let cj = 0; cj < H1; cj++) {
      for (let ci = 0; ci < W1; ci++) {
        let calmK = 1
        for (let k = 0; k <= n; k++) {
          const p = cs[k]!
          const dx = ci - (p.i + 0.5)
          const dz = cj - (p.j + 0.5)
          // A raised dais keeps its whole floor and its foot level.
          const wide = k === n && c.dais
          calmK = Math.min(calmK, smooth(p.r * (wide ? 1.05 : 0.38), p.r * (wide ? 1.6 : 0.92), Math.sqrt(dx * dx + dz * dz)))
        }
        for (const [pi, pj] of pads) {
          const dx = ci - pi
          const dz = cj - pj
          const d2 = dx * dx + dz * dz
          if (d2 < 16) calmK = Math.min(calmK, smooth(1.2, 4, Math.sqrt(d2)))
        }
        const x = ci * CELL
        const z = cj * CELL
        const v = (valueNoise(x * 0.06, z * 0.06, ns2) * 2 - 1) * 0.7 + (valueNoise(x * 0.13, z * 0.13, ns2 + 5) * 2 - 1) * 0.3
        H[cj * W1 + ci]! += swell * calmK * v * 1.6
      }
    }
  }
  // The road is worn: a hand's breadth lower where it is walked most.
  for (let cj = 0; cj < H1; cj++) {
    for (let ci = 0; ci < W1; ci++) {
      let t = 0
      let m = 0
      for (let dj = -1; dj <= 0; dj++) for (let di = -1; di <= 0; di++) {
        const i = ci + di
        const j = cj + dj
        if (i < 0 || j < 0 || i >= w || j >= h) continue
        t += c.trail[j * w + i]!
        m++
      }
      if (m && t) H[cj * W1 + ci]! -= 0.09 * (t / m)
    }
  }

  // ── 3. The dais, and the ledges ──
  if (c.dais) {
    const d = c.dais
    for (let cj = 0; cj < H1; cj++) for (let ci = 0; ci < W1; ci++) {
      const dx = ci * CELL - d.x
      const dz = cj * CELL - d.z
      const r = Math.sqrt(dx * dx + dz * dz)
      H[cj * W1 + ci]! += d.h * (1 - smooth(d.r, d.rim, r))
    }
  }
  for (const l of c.ledges) addLedge(H, w, h, l)

  // ── 4. Water lies level; props stand on pads ──
  const wet = (i: number, j: number): boolean => {
    if (i < 0 || j < 0 || i >= w || j >= h) return false
    const k = kind[j * w + i]
    return k === K_WATER || k === K_BRIDGE || k === K_FORD
  }
  const cornerOf = (ci: number, cj: number): number => Math.max(0, Math.min(H1 - 1, cj)) * W1 + Math.max(0, Math.min(W1 - 1, ci))
  for (const r of c.rivers) {
    // The band of corners the river and its banks touch, column by column.
    const band = (ci: number): [number, number] => {
      const a = riverRow(r, Math.max(0, ci - 1))
      const b = riverRow(r, Math.min(w - 1, ci))
      return [Math.min(a, b) - r.half - 1, Math.max(a, b) + r.half + 2]
    }
    const cr = c.crossings.find(x => x.kind === 'bridge')
    let low = Infinity
    for (let ci = cr ? cr.i0 - 2 : 0; ci <= (cr ? cr.i1 + 3 : w); ci++) {
      if (ci < 0 || ci > w) continue
      const [a, b] = band(ci)
      for (let cj = a; cj <= b; cj++) low = Math.min(low, H[cornerOf(ci, cj)]!)
    }
    // A valley: the water a little below the lowest bank it crosses.
    const lr = low - 0.3
    for (let ci = 0; ci < W1; ci++) {
      const [a, b] = band(ci)
      for (let cj = a - 5; cj <= b + 5; cj++) {
        if (cj < 0 || cj >= H1) continue
        const k = cj * W1 + ci
        const out = cj < a ? a - cj : cj > b ? cj - b : 0
        if (out === 0) { H[k] = lr; pinned[k] = 1 } else if (!pinned[k]) H[k] = lr + (H[k]! - lr) * smooth(0, 5.5, out)
      }
    }
  }
  // Ponds and lagoons: each body of water level, in a hollow.
  const seen = new Uint8Array(w * h)
  const stack: number[] = []
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if (seen[j * w + i] || !wet(i, j)) continue
      const cells: number[] = []
      stack.push(j * w + i)
      seen[j * w + i] = 1
      while (stack.length) {
        const k = stack.pop()!
        cells.push(k)
        const ci = k % w
        const cj = (k - ci) / w
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const ni = ci + di
          const nj = cj + dj
          if (!wet(ni, nj) || seen[nj * w + ni]) continue
          seen[nj * w + ni] = 1
          stack.push(nj * w + ni)
        }
      }
      // Its corners and a ring round it (the bank), unless a river set them.
      const set = new Set<number>()
      for (const k of cells) {
        const ci = k % w
        const cj = (k - ci) / w
        for (let dj = -1; dj <= 2; dj++) for (let di = -1; di <= 2; di++) set.add(cornerOf(ci + di, cj + dj))
      }
      // Water that touches a river's set level takes that level; any other
      // lies a little below its lowest bank.
      let low = Infinity
      let set0 = Infinity
      for (const k of set) {
        low = Math.min(low, H[k]!)
        if (pinned[k]) set0 = Math.min(set0, H[k]!)
      }
      const lv = set0 < Infinity ? set0 : low - 0.18
      for (const k of set) if (!pinned[k]) { H[k] = lv; pinned[k] = 1 }
    }
  }
  // ── 5. Every slope that is not a cliff can be walked ──
  const cliffCell = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < w && j < h && kind[j * w + i] === K_CLIFF
  // Which corner-to-corner edges belong to a cliff (bit 1: to the next corner along x, 2: along z).
  const free = new Uint8Array(W1 * H1)
  for (let cj = 0; cj < H1; cj++) for (let ci = 0; ci < W1; ci++) {
    let f = 0
    if (!cliffCell(ci, cj - 1) && !cliffCell(ci, cj)) f |= 1
    if (!cliffCell(ci - 1, cj) && !cliffCell(ci, cj)) f |= 2
    free[cj * W1 + ci] = f
  }
  // The land settles round its water first; then each prop's pad is levelled
  // on the settled ground, and the land settles round the pads.
  relax(H, pinned, W1, H1, SLOPE, free)
  // Pads: a chest, a plate, a carved stone stands level. Props close together
  // (a puzzle's plates and its stone, a chest by a skull post) share one
  // floor; and a floor is set no higher or lower than the ground already set
  // round it (water, another floor) can be walked to.
  const padCells: number[] = []
  for (let k = 0; k < w * h; k++) if (kind[k] === K_BLOCK || kind[k] === K_PLATE) padCells.push(k)
  const group = new Int32Array(padCells.length).fill(-1)
  let groups = 0
  for (let a0 = 0; a0 < padCells.length; a0++) {
    if (group[a0]! >= 0) continue
    group[a0] = groups
    const stackP = [a0]
    while (stackP.length) {
      const q = stackP.pop()!
      const qi = padCells[q]! % w
      const qj = (padCells[q]! - qi) / w
      for (let b0 = 0; b0 < padCells.length; b0++) {
        if (group[b0]! >= 0) continue
        const bi = padCells[b0]! % w
        const bj = (padCells[b0]! - bi) / w
        if (Math.max(Math.abs(bi - qi), Math.abs(bj - qj)) <= 2) { group[b0] = groups; stackP.push(b0) }
      }
    }
    groups++
  }
  for (let g = 0; g < groups; g++) {
    const set = new Set<number>()
    for (let q = 0; q < padCells.length; q++) {
      if (group[q] !== g) continue
      const i = padCells[q]! % w
      const j = (padCells[q]! - i) / w
      for (const k of [j * W1 + i, j * W1 + i + 1, (j + 1) * W1 + i, (j + 1) * W1 + i + 1]) set.add(k)
    }
    let m = 0
    let n0 = 0
    let mp = 0
    let np = 0
    for (const k of set) { m += H[k]!; n0++; if (pinned[k]) { mp += H[k]!; np++ } }
    let lv = np ? mp / np : m / n0
    if (!np) {
      // Within reach of what is already set round it.
      let lo = -Infinity
      let hi = Infinity
      for (const k of set) {
        const ci = k % W1
        const cj = (k - ci) / W1
        for (let dj = -8; dj <= 8; dj++) for (let di = -8; di <= 8; di++) {
          const d = Math.abs(di) + Math.abs(dj)
          if (d === 0 || d > 8) continue
          const ni = ci + di
          const nj = cj + dj
          if (ni < 0 || nj < 0 || ni >= W1 || nj >= H1) continue
          const nk = nj * W1 + ni
          if (!pinned[nk] || set.has(nk)) continue
          lo = Math.max(lo, H[nk]! - d * SLOPE * 0.98)
          hi = Math.min(hi, H[nk]! + d * SLOPE * 0.98)
        }
      }
      if (lo <= hi) lv = Math.max(lo, Math.min(hi, lv))
    }
    for (const k of set) if (!pinned[k]) { H[k] = lv; pinned[k] = 1 }
  }

  relax(H, pinned, W1, H1, SLOPE, free)
  return H
}

/** Step the ground up past a ledge's edge (sharply), or up its ramp (over the run). */
const addLedge = (H: Float32Array, w: number, h: number, l: LedgePlan): void => {
  const W1 = w + 1
  // Corners measured from the clearing's centre, in cells.
  const ox = l.x / CELL
  const oz = l.z / CELL
  const d0 = l.d0 / CELL
  const t0 = l.t0 / CELL
  const half = l.half / CELL
  const run = l.run / CELL
  const R = l.r / CELL
  for (let cj = 0; cj <= h; cj++) {
    for (let ci = 0; ci <= w; ci++) {
      const di = ci - ox
      const dj = cj - oz
      const dist = Math.sqrt(di * di + dj * dj)
      // The terrace is the clearing's; out in the trees it eases away.
      const fade = 1 - smooth(R * 1.25, R * 2.1, dist)
      if (fade <= 0) continue
      const s = di * l.ux + dj * l.uz
      const t = -di * l.uz + dj * l.ux
      const k = Math.abs(t - t0) <= half ? smooth(d0 - run, d0 + run, s) : smooth(d0 - 0.15, d0 + 0.15, s)
      H[cj * W1 + ci]! += l.step * k * fade
    }
  }
}

/**
 * Relax every corner-to-corner slope steeper than `max`, except the edges
 * `free` leaves out (a cliff's own; null: none). Pinned corners do not move; the other end
 * takes all of it.
 */
const relax = (H: Float32Array, pinned: Uint8Array, W1: number, H1: number, max: number, free: Uint8Array | null): void => {
  let moved = 0
  const fix = (a: number, b: number): void => {
    const d = H[a]! - H[b]!
    const ex = Math.abs(d) - max
    if (ex <= 0) return
    moved += ex
    const pa = pinned[a]
    const pb = pinned[b]
    if (pa && pb) return
    const sgn = d > 0 ? 1 : -1
    if (pa) H[b]! += sgn * ex
    else if (pb) H[a]! -= sgn * ex
    else { H[a]! -= sgn * ex * 0.5; H[b]! += sgn * ex * 0.5 }
  }
  // Until nothing is too steep (or as near as pinned corners allow).
  for (let it = 0; it < 400; it++) {
    moved = 0
    for (let cj = 0; cj < H1; cj++) {
      for (let ci = 0; ci < W1; ci++) {
        const k = cj * W1 + ci
        const f = free ? free[k]! : 3
        if (ci + 1 < W1 && f & 1) fix(k, k + 1)
        if (cj + 1 < H1 && f & 2) fix(k, k + W1)
      }
    }
    if (moved < 1e-4) break
  }
}

/**
 * A town lies on a gentle slope, but every house stands on a level pad and
 * every townsperson on level ground.
 */
export const buildTownRelief = (w: number, h: number, seed: number, pads: Array<{ x: number; z: number; w: number; d: number }>, spots: Array<{ x: number; z: number }>): Float32Array => {
  const W1 = w + 1
  const H1 = h + 1
  const H = new Float32Array(W1 * H1)
  const pinned = new Uint8Array(W1 * H1)
  const rng = mulberry32((seed ^ RELIEF_SALT) >>> 0)
  const a = (rng() - 0.5) * 0.06
  const b = (rng() - 0.5) * 0.06
  const ns = Math.floor(rng() * 100000)
  for (let cj = 0; cj < H1; cj++) {
    for (let ci = 0; ci < W1; ci++) {
      const x = ci * CELL
      const z = cj * CELL
      // A tilt of a metre or so across the square, and a little rolling.
      H[cj * W1 + ci] = (ci - w / 2) * CELL * a + (cj - h / 2) * CELL * b + 0.16 * (valueNoise(x * 0.1, z * 0.1, ns) * 2 - 1)
    }
  }
  const level = (i0: number, i1: number, j0: number, j1: number): void => {
    // Level with a pad it overlaps, else at its own mean.
    let m = 0
    let n = 0
    let mp = 0
    let np = 0
    for (let cj = j0; cj <= j1; cj++) for (let ci = i0; ci <= i1; ci++) {
      if (ci < 0 || cj < 0 || ci >= W1 || cj >= H1) continue
      m += H[cj * W1 + ci]!
      n++
      if (pinned[cj * W1 + ci]) { mp += H[cj * W1 + ci]!; np++ }
    }
    if (!n) return
    const lv = np ? mp / np : m / n
    for (let cj = j0; cj <= j1; cj++) for (let ci = i0; ci <= i1; ci++) {
      if (ci < 0 || cj < 0 || ci >= W1 || cj >= H1 || pinned[cj * W1 + ci]) continue
      H[cj * W1 + ci] = lv
      pinned[cj * W1 + ci] = 1
    }
  }
  for (const p of pads) level(Math.floor((p.x - p.w / 2) / CELL) - 1, Math.ceil((p.x + p.w / 2) / CELL) + 1, Math.floor((p.z - p.d / 2) / CELL) - 1, Math.ceil((p.z + p.d / 2) / CELL) + 1)
  for (const s of spots) level(Math.floor(s.x / CELL) - 1, Math.floor(s.x / CELL) + 2, Math.floor(s.z / CELL) - 1, Math.floor(s.z / CELL) + 2)
  relax(H, pinned, W1, H1, 0.3, null)
  return H
}
