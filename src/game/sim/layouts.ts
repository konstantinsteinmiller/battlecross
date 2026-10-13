import type { ZoneShape } from '../data/zones'
import { CELL } from './grid'
import type { Rng } from './rng'
import { K_BRIDGE, K_FORD, type CrossingPlan } from './zoneFeatures'

/**
 * ─── The layouts a place is laid out in (roadmap #103, #120) ─────────────────
 *
 * Most zones are a chain of round clearings joined by passes (`zoneGen.ts`).
 * The places here have a shape of their own, and lay their clearings, their
 * ways between them and what is built into them themselves:
 *
 *   strips    the Ashen Crags: tongues of half-cooled lava running up the
 *             map side by side, hot lava between them, stepping stones
 *             across from one to the next;
 *   spiral    Dragon's Peak: one path round the mountain and up it, the
 *             dragon on the summit in its middle;
 *   galleries the Deep Mines: galleries joined by narrow drifts, up and then
 *             along into the next, timbered and railed;
 *   courts    the Void Citadel: walled courtyards one above the next, a gate
 *             between each two, towers either side of it;
 *   castle    the Dread Fortress: the approach, the barbican, the gatehouse
 *             through the curtain wall, the bailey, the inner ward, the keep;
 *   islands   the Rift: a ledge up its wall, then islands adrift in the void,
 *             a bridge from each to the next.
 *
 * Every shape still runs from the start at the bottom of the map to the
 * finale (the clearings in `cs`, start first), so the features, branches,
 * relief and packs are laid over it as on any zone.
 */

// ─── Carving ─────────────────────────────────────────────────────────────────

export const carveDisc = (solid: Uint8Array, w: number, h: number, ci: number, cj: number, r: number, rng: Rng): void => {
  // A lumpy edge: the radius wobbles with the bearing, so no clearing is a
  // perfect circle.
  const lobes = 3 + Math.floor(rng() * 3)
  const ph = rng() * Math.PI * 2
  const amp = 0.1 + rng() * 0.08
  const R = Math.ceil(r) + 1
  for (let dj = -R; dj <= R; dj++) {
    for (let di = -R; di <= R; di++) {
      const i = ci + di
      const j = cj + dj
      if (i < 2 || j < 2 || i >= w - 2 || j >= h - 2) continue
      const d = Math.hypot(di, dj)
      const a = Math.atan2(dj, di)
      if (d <= r * (1 + amp * Math.sin(a * lobes + ph))) solid[j * w + i] = 0
    }
  }
}

/** An open rectangle (cells, inclusive), inside the rim. */
export const carveRect = (solid: Uint8Array, w: number, h: number, i0: number, j0: number, i1: number, j1: number): void => {
  for (let j = Math.max(2, Math.round(j0)); j <= Math.min(h - 3, Math.round(j1)); j++) {
    for (let i = Math.max(2, Math.round(i0)); i <= Math.min(w - 3, Math.round(i1)); i++) solid[j * w + i] = 0
  }
}

export const carveLine = (solid: Uint8Array, trail: Uint8Array, w: number, h: number, ai: number, aj: number, bi: number, bj: number, half: number): void => {
  const n = Math.max(1, Math.ceil(Math.hypot(bi - ai, bj - aj) * 2))
  for (let s = 0; s <= n; s++) {
    const ci = ai + ((bi - ai) * s) / n
    const cj = aj + ((bj - aj) * s) / n
    const R = Math.ceil(half)
    for (let dj = -R; dj <= R; dj++) {
      for (let di = -R; di <= R; di++) {
        const i = Math.round(ci + di)
        const j = Math.round(cj + dj)
        if (i < 2 || j < 2 || i >= w - 2 || j >= h - 2) continue
        const d = Math.hypot(i - ci, j - cj)
        if (d <= half) solid[j * w + i] = 0
        if (d <= 0.9) trail[j * w + i] = 1
      }
    }
  }
}

/** A worn way along a polyline (cells). */
const carvePath = (solid: Uint8Array, trail: Uint8Array, w: number, h: number, pts: ReadonlyArray<readonly [number, number]>, half: number): void => {
  for (let q = 1; q < pts.length; q++) carveLine(solid, trail, w, h, pts[q - 1]![0], pts[q - 1]![1], pts[q]![0], pts[q]![1], half)
}

// ─── What a layout hands back ────────────────────────────────────────────────

/** A point on a way between two clearings: the relief lays it `f` of the way
 *  from clearing `k`'s level to the next one's (a long way climbs steadily). */
export interface Guide { i: number; j: number; k: number; f: number }

/** A built room (cells, inclusive): a temple's chamber, a gallery, a court. */
export interface Chamber { i0: number; j0: number; i1: number; j1: number }

/** A piece the layout itself builds in (columns, timbers, towers), laid by `dressing.ts`. */
export interface Fixture {
  kind: 'column' | 'brokenColumn' | 'timber' | 'rail' | 'pylon' | 'gateTower' | 'lavaRock' | 'shard'
  /** Cell (blocking pieces), or centre in cells (the rest). */
  i: number
  j: number
  a: number
}

export interface Laid {
  cs: Array<{ i: number; j: number; r: number }>
  /** Each clearing's room, where it is one (null: a round clearing). */
  chambers: Array<Chamber | null>
  /** Open cells that hold the zone's liquid: the lava between the strips, the void round the islands. */
  water: number[]
  /** Its stepping stones and bridges (the cells' kind is set by the caller). */
  crossings: CrossingPlan[]
  fixtures: Fixture[]
  /** Rock cells that are a built wall: the view draws dressed stone there. */
  masonry: number[]
  guides: Guide[]
  /** Scatter boulders through the clearings (a built place has none). */
  boulders: boolean
  /** The clearing the secret pocket is off (default: the middle one). */
  secretFrom?: number
  /** Where a way off the road (#70) can loop round from clearing `a` to `b`:
   *  the room's cell and the road's column beside it (`zoneFeatures.ts`). */
  loopSites: Array<{ a: number; b: number; i: number; j: number; ri: number }>
}

export interface LayCtx {
  shape: ZoneShape
  /** The plan's stream (where the clearings lie, as for every shape) and the layout's own. */
  rng: Rng
  lrng: Rng
  n: number
  boss: boolean
  /** The chain's width (cells), and the rock either side of it. */
  W: number
  M: number
  w: number
  h: number
  solid: Uint8Array
  trail: Uint8Array
}

/** The map's height (cells) a shape needs for `n` sections. */
export const layoutHeight = (shape: ZoneShape, n: number, boss: boolean): number => {
  const base = 16 + n * 11 + (boss ? 6 : 3)
  if (shape === 'spiral') return Math.max(base, 70)
  if (shape === 'courts') return 16 + n * 12 + (boss ? 6 : 3)
  return base
}

export const LAID_SHAPES: ReadonlySet<ZoneShape> = new Set<ZoneShape>(['strips', 'spiral', 'galleries', 'courts', 'castle', 'islands'])

const blank = (): Laid => ({ cs: [], chambers: [], water: [], crossings: [], fixtures: [], masonry: [], guides: [], boulders: true, loopSites: [] })

export const layOut = (c: LayCtx): Laid => {
  switch (c.shape) {
    case 'strips': return strips(c)
    case 'spiral': return spiral(c)
    case 'galleries': return galleries(c)
    case 'courts': return courts(c)
    case 'castle': return castle(c)
    default: return islands(c)
  }
}

/** A crossing's record over the cells it covers. */
const crossingOf = (kind: 'bridge' | 'ford', cells: number[], w: number): CrossingPlan => {
  let i0 = 1e9
  let i1 = -1
  let j0 = 1e9
  let j1 = -1
  for (const k of cells) {
    const i = k % w
    const j = (k - i) / w
    i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j)
  }
  return { kind, cells, x: ((i0 + i1 + 1) / 2) * CELL, z: ((j0 + j1 + 1) / 2) * CELL, i0, i1, j0, j1 }
}

/** Solid cells next to (8 ways) an open one: the face of a built wall, two deep. */
const faceOf = (solid: Uint8Array, w: number, h: number, inBox: (i: number, j: number) => boolean): number[] => {
  const out: number[] = []
  for (let j = 1; j < h - 1; j++) {
    for (let i = 1; i < w - 1; i++) {
      const k = j * w + i
      if (!solid[k] || !inBox(i, j)) continue
      let by = false
      for (let dj = -2; dj <= 2 && !by; dj++) for (let di = -2; di <= 2; di++) {
        const ni = i + di
        const nj = j + dj
        if (ni < 0 || nj < 0 || ni >= w || nj >= h) continue
        if (!solid[nj * w + ni]) { by = true; break }
      }
      if (by) out.push(k)
    }
  }
  return out
}

/**
 * Liquid left in a few cells on its own (a nook of rock between a tongue and
 * a clearing's lumpy edge) is rock again: a pool of one cell would lie at a
 * level of its own beside the sea's, a step nobody could walk.
 */
const dropSpecks = (water: number[], solid: Uint8Array, w: number, h: number, min = 16): void => {
  const wet = new Uint8Array(w * h)
  for (const k of water) wet[k] = 1
  const seen = new Uint8Array(w * h)
  const keep: number[] = []
  for (const k0 of water) {
    if (seen[k0]) continue
    const part = [k0]
    seen[k0] = 1
    for (let q = 0; q < part.length; q++) {
      const k = part[q]!
      const i = k % w
      for (const nk of [k - 1, k + 1, k - w, k + w]) {
        if (nk < 0 || nk >= w * h || seen[nk] || !wet[nk] || Math.abs((nk % w) - i) > 1) continue
        seen[nk] = 1
        part.push(nk)
      }
    }
    if (part.length >= min) keep.push(...part)
    else for (const k of part) solid[k] = 1
  }
  water.length = 0
  water.push(...keep)
  void h
}

/** The face of the walls round a place's rooms. */
export const wallFace = (solid: Uint8Array, w: number, h: number, rooms: ReadonlyArray<Chamber | null>): number[] =>
  faceOf(solid, w, h, (i, j) => rooms.some(r => !!r && i >= r.i0 - 3 && i <= r.i1 + 3 && j >= r.j0 - 3 && j <= r.j1 + 3))

// ─── The Ashen Crags: tongues of cooled lava ─────────────────────────────────

const strips = (c: LayCtx): Laid => {
  const { rng, lrng, n, boss, W, M, w, h, solid, trail } = c
  const out = blank()
  const lane = [M + W / 2 - 6, M + W / 2 + 6]
  // The road's clearings: the first two on the left tongue, then one on each
  // in turn; the finale on the wide crust where the tongues meet.
  const tongue = (k: number): number => (k <= 1 ? 0 : (k - 1) % 2)
  let cj = h - 8
  out.cs.push({ i: lane[0]!, j: cj, r: 4.2 })
  for (let k = 1; k <= n; k++) {
    const last = k === n
    const r = last ? (boss ? 7.4 : 6.6) : 3.4 + rng() * 0.6
    cj -= 11 + (last && boss ? 2 : 0) + Math.round(rng() * 1.5)
    out.cs.push({ i: last ? M + W / 2 : lane[tongue(k)]! + Math.round((rng() - 0.5) * 2), j: cj, r })
  }
  for (const _ of out.cs) out.chambers.push(null)
  const fin = out.cs[n]!
  // Runs of clearings on one tongue, and the row each crossing leaves at.
  const runs: Array<{ t: number; ks: number[] }> = []
  for (let k = 0; k < n; k++) {
    const t = tongue(k)
    if (runs.length && runs[runs.length - 1]!.t === t) runs[runs.length - 1]!.ks.push(k)
    else runs.push({ t, ks: [k] })
  }
  const crossRow = runs.map(r => out.cs[r.ks[r.ks.length - 1]!]!.j - 5)
  // Each tongue: a band a few cells wide, its edge wandering.
  const ph = lrng() * 6
  runs.forEach((run, q) => {
    const bottom = q === 0 ? out.cs[0]!.j + 3 : crossRow[q - 1]! + 2
    const top = q === runs.length - 1 ? fin.j : crossRow[q]! - 2
    for (let j = top; j <= bottom; j++) {
      const mid = lane[run.t]! + Math.sin(j * 0.42 + ph + run.t * 2) * 0.9
      const half = 2.1 + 0.5 * Math.sin(j * 0.77 + ph * 1.7)
      for (let i = Math.floor(mid - half); i <= Math.ceil(mid + half); i++) {
        if (Math.abs(i - mid) <= half && j >= 2 && j < h - 2) solid[j * w + i] = 0
      }
    }
  })
  for (let k = 0; k <= n; k++) carveDisc(solid, w, h, out.cs[k]!.i, out.cs[k]!.j, out.cs[k]!.r, rng)
  // The road: up each tongue, over the stones to the next.
  // Legs along a tongue only: the hop from one tongue to the next is the stones'.
  const legs: Array<[number, number, number, number]> = []
  let at: [number, number] = [out.cs[0]!.i, out.cs[0]!.j]
  runs.forEach((run, q) => {
    if (q > 0) at = [lane[run.t]!, crossRow[q - 1]! - 1]
    for (const k of run.ks) {
      if (k === 0) continue
      legs.push([at[0], at[1], out.cs[k]!.i, out.cs[k]!.j])
      at = [out.cs[k]!.i, out.cs[k]!.j]
    }
    const end: [number, number] = q < runs.length - 1 ? [lane[run.t]!, crossRow[q]!] : [fin.i, fin.j]
    legs.push([at[0], at[1], end[0], end[1]])
  })
  // Lava: the whole sea the tongues run through, below the finale's crust.
  const lava = new Uint8Array(w * h)
  for (let j = Math.round(fin.j + fin.r * 0.6); j < h - 3; j++) {
    for (let i = lane[0]! - 1; i <= lane[1]! + 1; i++) if (solid[j * w + i]) lava[j * w + i] = 1
  }
  // The stepping stones: from one tongue's edge across to the next, a little crooked.
  const fords: number[][] = []
  runs.forEach((run, q) => {
    if (q === runs.length - 1) return
    const x = crossRow[q]!
    const a = lane[run.t]!
    const b = lane[runs[q + 1]!.t]!
    const s = Math.sign(b - a)
    const bend: Array<[number, number]> = [[a + s * 1.5, x], [a + s * 5, x - 1 + Math.round(lrng())], [b - s * 5, x + Math.round(lrng())], [b - s * 1.5, x - 1]]
    const cells = new Set<number>()
    for (let p = 1; p < bend.length; p++) {
      const [ai, aj] = bend[p - 1]!
      const [bi, bj] = bend[p]!
      const steps = Math.ceil(Math.hypot(bi - ai, bj - aj) * 3)
      for (let t = 0; t <= steps; t++) {
        const pi = ai + ((bi - ai) * t) / steps
        const pj = aj + ((bj - aj) * t) / steps
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          const i = Math.round(pi + di)
          const j = Math.round(pj + dj)
          if (Math.hypot(i - pi, j - pj) > 0.75) continue
          const k = j * w + i
          if (lava[k]) cells.add(k)
          if (Math.hypot(i - pi, j - pj) <= 0.6) trail[k] = 1
        }
      }
      // Boulders stand in the lava either side of the stones.
      for (let t = 0.25; t < 1; t += 0.5) {
        const pi = ai + (bi - ai) * t
        const pj = aj + (bj - aj) * t
        for (const sg of [-1, 1]) if (lrng() < 0.7) out.fixtures.push({ kind: 'lavaRock', i: pi + (lrng() - 0.5) * 1.2, j: pj + sg * (1.9 + lrng() * 0.8), a: lrng() * 6 })
      }
    }
    fords.push([...cells])
  })
  // The road along the tongues (on their crust only: the stones are its way across).
  for (const [ai, aj, bi, bj] of legs) carveLine(solid, trail, w, h, ai, aj, bi, bj, 1)
  for (const cells of fords) for (const k of cells) { lava[k] = 0; solid[k] = 0 }
  for (let k = 0; k < w * h; k++) {
    if (!lava[k]) continue
    // Never the rim, and nothing the road opened.
    if (!solid[k]) continue
    solid[k] = 0
    trail[k] = 0
    out.water.push(k)
  }
  dropSpecks(out.water, solid, w, h)
  for (const cells of fords) out.crossings.push(crossingOf('ford', cells, w))
  // A way off the road loops round the first tongue's outer side.
  for (const d of [15, 13.5, 12]) for (const dj of [0, 2, -2]) out.loopSites.push({ a: 0, b: 1, i: Math.round(lane[0]! - d), j: Math.round((out.cs[0]!.j + out.cs[1]!.j) / 2) + dj, ri: lane[0]! })
  // A crossing's lava is a little wider where the tongues lie far apart: a
  // few loose rocks stand in it too.
  for (let q = 0; q < 6; q++) {
    const i = lane[0]! + 3 + lrng() * (lane[1]! - lane[0]! - 6)
    const j = fin.j + fin.r + 2 + lrng() * (h - 8 - fin.j - fin.r)
    const k = Math.round(j) * w + Math.round(i)
    if (out.water.includes(k)) out.fixtures.push({ kind: 'lavaRock', i, j, a: lrng() * 6 })
  }
  return out
}

// ─── Dragon's Peak: round the mountain and up ────────────────────────────────

const spiral = (c: LayCtx): Laid => {
  const { rng, n, boss, W, M, w, h, solid, trail } = c
  const out = blank()
  // The mountain stands a little left of the middle: the rock on its east
  // flank holds a way off the road (#70), which needs room beside it.
  const cx = M + W / 2 - 3
  const cy = h - 32
  const E = cx + 12
  const Wf = cx - 12
  const top = cy - 15
  const south = cy + 11
  // The path, once round and up: from the foot east, up the east flank
  // (the first shelves), across the north face, down the west flank (the
  // last shelf), back along the inner south side and up onto the summit.
  const fin = { i: cx, j: cy, r: boss ? 7.4 : 6.4 }
  const shelf = (i: number, j: number, out1: number): { i: number; j: number; r: number } => ({ i: Math.round(i + out1), j, r: 3.6 + rng() * 0.4 })
  const start = { i: cx + 3, j: h - 8, r: 4.2 }
  // Up to three shelves: two on the east flank, one on the west.
  const spots = [shelf(E, cy + 8, 1.5), shelf(E, cy - 6, 1.5), shelf(Wf, cy + 2, -1.5)]
  out.cs.push(start, ...spots.slice(0, n - 1), fin)
  for (const _ of out.cs) out.chambers.push(null)
  for (const p of out.cs) carveDisc(solid, w, h, p.i, p.j, p.r, rng)
  // Nodes along the way, each with the leg it lies on (clearing k to k + 1).
  type Node = [number, number, number]
  const nodes: Node[] = [[start.i, start.j, 0], [E - 1, h - 11, 0], [E, h - 14, 0]]
  const legOf = (k: number): number => Math.min(k, n - 1)
  for (let k = 1; k < n; k++) {
    const s = out.cs[k]!
    nodes.push([s.i - Math.sign(s.i - cx) * 1.5, s.j, k])
    // Round the corners after the east flank's last shelf, and before the west's.
    if (k === Math.min(2, n - 1)) nodes.push([E, top + 3, legOf(k)], [E - 3, top, legOf(k)], [Wf + 3, top, legOf(k)], [Wf, top + 3, legOf(k)])
  }
  nodes.push([Wf, south - 3, n - 1], [Wf + 3, south, n - 1], [cx - 3, south, n - 1], [cx, cy + 7, n - 1], [cx, cy, n - 1])
  carvePath(solid, trail, w, h, nodes.map(([i, j]) => [i, j] as const), 1.35)
  // The relief climbs along it: each point lies between its two clearings'
  // levels, by how far along its leg it is.
  const lens: number[] = [0]
  for (let q = 1; q < nodes.length; q++) lens.push(lens[q - 1]! + Math.hypot(nodes[q]![0] - nodes[q - 1]![0], nodes[q]![1] - nodes[q - 1]![1]))
  const legStart = new Map<number, number>()
  const legEnd = new Map<number, number>()
  nodes.forEach(([, , k], q) => {
    if (!legStart.has(k)) legStart.set(k, q === 0 ? 0 : lens[q - 1]!)
    legEnd.set(k, lens[q]!)
  })
  for (let q = 1; q < nodes.length; q++) {
    const [ai, aj, k] = nodes[q - 1]!
    const [bi, bj] = nodes[q]!
    const steps = Math.max(1, Math.round(Math.hypot(bi - ai, bj - aj) / 2))
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      const d = lens[q - 1]! + (lens[q]! - lens[q - 1]!) * t
      const k0 = nodes[q]![2] !== k && t > 0.5 ? nodes[q]![2] : k
      const a = legStart.get(k0)!
      const b = legEnd.get(k0)!
      out.guides.push({ i: ai + (bi - ai) * t, j: aj + (bj - aj) * t, k: k0, f: Math.max(0, Math.min(1, (d - a) / ((b - a) || 1))) })
    }
  }
  // A way off the road loops out over the east flank, from shelf to shelf.
  if (n >= 3) {
    const a = out.cs[1]!
    const b = out.cs[2]!
    for (const d of [10, 11, 9]) out.loopSites.push({ a: 1, b: 2, i: Math.min(w - 11, E + d), j: Math.round((a.j + b.j) / 2), ri: E })
  }
  return out
}

// ─── The Deep Mines: galleries and drifts ────────────────────────────────────

const galleries = (c: LayCtx): Laid => {
  const { rng, lrng, n, boss, W, M, w, h, solid, trail } = c
  const out = blank()
  out.boulders = false
  let cj = h - 8
  let ci = M + W / 2
  out.cs.push({ i: ci, j: cj, r: 4.2 })
  out.chambers.push(null)
  for (let k = 1; k <= n; k++) {
    const last = k === n
    const hw = last ? (boss ? 8 : 7) : 4 + Math.round(rng())
    const hh = last ? (boss ? 6 : 5.5) : 3 + Math.round(rng())
    cj -= 11 + (last && boss ? 2 : 0) + Math.round(rng() * 1.5)
    const side = k % 2 ? 1 : -1
    ci = last ? M + W / 2 : M + W / 2 + side * (3 + Math.round(rng()))
    ci = Math.max(M + hw + 3, Math.min(M + W - hw - 4, ci))
    out.cs.push({ i: ci, j: cj, r: Math.max(hw, hh) })
    out.chambers.push({ i0: ci - hw, j0: cj - hh, i1: ci + hw, j1: cj + hh })
  }
  carveDisc(solid, w, h, out.cs[0]!.i, out.cs[0]!.j, 4.2, rng)
  for (let k = 1; k <= n; k++) {
    const g = out.chambers[k]!
    carveRect(solid, w, h, g.i0, g.j0, g.i1, g.j1)
    const p = out.cs[k - 1]!
    const q = out.cs[k]!
    // A drift: up out of the last gallery, then along into this one's side.
    const legs: Array<[number, number, number, number]> = [[p.i, p.j, p.i, q.j], [p.i, q.j, q.i, q.j]]
    for (const [ai, aj, bi, bj] of legs) {
      carveLine(solid, trail, w, h, ai, aj, bi, bj, 1.1)
      // Timbering every few steps where the drift runs through rock, rails all along.
      const along = Math.abs(bi - ai) > 0.5
      const len = Math.max(Math.abs(bi - ai), Math.abs(bj - aj))
      const sx = Math.sign(bi - ai)
      const sz = Math.sign(bj - aj)
      for (let s = 0; s <= len; s++) {
        const i = ai + sx * s
        const j = aj + sz * s
        const inRoom = (k2: number): boolean => { const r = out.chambers[k2]; return !!r && i >= r.i0 - 1 && i <= r.i1 + 1 && j >= r.j0 - 1 && j <= r.j1 + 1 }
        if (inRoom(k) || inRoom(k - 1) || Math.hypot(i - out.cs[0]!.i, j - out.cs[0]!.j) < 5) continue
        out.fixtures.push({ kind: 'rail', i, j, a: along ? Math.PI / 2 : 0 })
        if (s % 3 === 1) out.fixtures.push({ kind: 'timber', i, j, a: along ? Math.PI / 2 : 0 })
      }
    }
  }
  // A way off the road can loop round the outside of the drifts, either side.
  for (let k = 0; k + 1 < n; k++) {
    const a = out.cs[k]!
    const b = out.cs[k + 1]!
    for (const s of [1, -1]) for (const d of [15.5, 17, 14]) for (const dj of [0, 2, -2]) {
      out.loopSites.push({ a: k, b: k + 1, i: Math.round(M + W / 2 + s * d), j: Math.round((a.j + b.j) / 2) + dj, ri: M + W / 2 })
    }
  }
  void lrng
  return out
}

// ─── The Void Citadel: courtyards behind walls ───────────────────────────────

const courts = (c: LayCtx): Laid => {
  const { rng, n, boss, W, M, w, h, solid, trail } = c
  const out = blank()
  out.boulders = false
  let cj = h - 8
  out.cs.push({ i: M + W / 2, j: cj, r: 4.2 })
  out.chambers.push(null)
  for (let k = 1; k <= n; k++) {
    const last = k === n
    const hw = last ? (boss ? 8 : 7) : 4 + Math.round(rng())
    const hh = last ? (boss ? 6 : 5) : 3.5 + Math.round(rng() * 0.6)
    cj -= 12 + (last && boss ? 2 : 0) + Math.round(rng() * 1.5)
    const ci = last ? M + W / 2 : M + W / 2 + (k % 2 ? 3 : -3) + Math.round((rng() - 0.5) * 2)
    out.cs.push({ i: ci, j: cj, r: Math.max(hw, hh) })
    out.chambers.push({ i0: ci - hw, j0: Math.round(cj - hh), i1: ci + hw, j1: Math.round(cj + hh) })
  }
  carveDisc(solid, w, h, out.cs[0]!.i, out.cs[0]!.j, 4.2, rng)
  for (let k = 1; k <= n; k++) {
    const g = out.chambers[k]!
    carveRect(solid, w, h, g.i0, g.j0, g.i1, g.j1)
    // The gate from the court below: straight through the wall between.
    const p = out.cs[k - 1]!
    const lo = out.chambers[k - 1]
    const gi = lo ? Math.round(Math.max(Math.max(lo.i0, g.i0) + 2, Math.min(Math.min(lo.i1, g.i1) - 2, (p.i + out.cs[k]!.i) / 2))) : p.i
    const bottom = lo ? lo.j0 : p.j
    carveLine(solid, trail, w, h, p.i, p.j, gi, bottom, 1.2)
    carveLine(solid, trail, w, h, gi, bottom, gi, g.j1, 1.2)
    carveLine(solid, trail, w, h, gi, g.j1, out.cs[k]!.i, out.cs[k]!.j, 1.2)
    // A tower either side of the gate, in the wall.
    const wj = Math.round((bottom + g.j1) / 2)
    for (const s of [-1, 1]) out.fixtures.push({ kind: 'gateTower', i: gi + s * 2.6, j: wj, a: 0 })
    // A pylon in each corner of the court.
    for (const [ci2, cj2] of [[g.i0 + 1, g.j0 + 1], [g.i1 - 1, g.j0 + 1], [g.i0 + 1, g.j1 - 1], [g.i1 - 1, g.j1 - 1]] as const) {
      out.fixtures.push({ kind: 'pylon', i: ci2, j: cj2, a: 0 })
    }
  }
  out.masonry = wallFace(solid, w, h, out.chambers)
  return out
}

// ─── The Dread Fortress: gatehouse, bailey, keep ─────────────────────────────

const castle = (c: LayCtx): Laid => {
  const { rng, n, boss, W, M, w, h, solid, trail } = c
  const out = blank()
  out.boulders = false
  const mid = M + W / 2
  // From the top down: the keep, its wall, the inner ward, the inner wall,
  // the bailey (two clearings), the curtain wall, the barbican, the approach.
  // With more or fewer sections the bailey holds the difference.
  const keep = { hw: boss ? 8 : 7, hh: boss ? 6 : 5.5 }
  const jStart = h - 8
  const jBarb = jStart - 11
  const barb = { i0: mid - 5, j0: jBarb - 3, i1: mid + 5, j1: jBarb + 3 }
  const curtain = [barb.j0 - 4, barb.j0 - 1]
  const keepJ = 4 + keep.hh
  const keepBox = { i0: mid - keep.hw, j0: Math.round(keepJ - keep.hh), i1: mid + keep.hw, j1: Math.round(keepJ + keep.hh) }
  const keepWall = [keepBox.j1 + 1, keepBox.j1 + 3]
  const ward = { i0: mid - 6, j0: keepWall[1]! + 1, i1: mid + 6, j1: keepWall[1]! + 7 }
  const inner = [ward.j1 + 1, ward.j1 + 3]
  const bailey = { i0: mid - 11, j0: inner[1]! + 1, i1: mid + 11, j1: curtain[0]! - 1 }
  out.cs.push({ i: mid, j: jStart, r: 4.2 })
  out.chambers.push(null)
  // The clearings: barbican, then the bailey's, then the ward and the keep.
  const inBailey = Math.max(1, n - 3)
  out.cs.push({ i: mid, j: jBarb, r: 5 })
  out.chambers.push(barb)
  const bh = bailey.j1 - bailey.j0
  for (let q = 0; q < inBailey; q++) {
    const s = q % 2 ? 1 : -1
    const j = Math.round(bailey.j1 - ((q + 1) / (inBailey + 1)) * bh)
    out.cs.push({ i: mid + s * (5 + Math.round(rng() * 2)), j, r: 6 })
    out.chambers.push(bailey)
  }
  if (n >= 4) {
    out.cs.push({ i: mid, j: Math.round((ward.j0 + ward.j1) / 2), r: 6 })
    out.chambers.push(ward)
  }
  out.cs.push({ i: mid, j: Math.round(keepJ), r: Math.max(keep.hw, keep.hh) })
  out.chambers.push(keepBox)
  carveDisc(solid, w, h, mid, jStart, 4.2, rng)
  for (const r of [barb, bailey, ward, keepBox]) carveRect(solid, w, h, r.i0, r.j0, r.i1, r.j1)
  // The road: up through the gates, across the bailey from one pack to the next.
  const pts: Array<[number, number]> = [[mid, jStart], [mid, jBarb]]
  for (let k = 2; k < 2 + inBailey; k++) pts.push([mid, out.cs[k]!.j + 2], [out.cs[k]!.i, out.cs[k]!.j])
  pts.push([mid, bailey.j0 + 1], [mid, ward.j1], [mid, keepBox.j1], [mid, keepJ])
  carvePath(solid, trail, w, h, pts, 1.2)
  // Gate towers either side of each gate, the curtain's on its outer face.
  for (const wall of [curtain, inner, keepWall]) {
    const wj = Math.round((wall[0]! + wall[1]!) / 2)
    for (const s of [-1, 1]) out.fixtures.push({ kind: 'gateTower', i: mid + s * 2.6, j: wj, a: 0 })
  }
  // And one on each outer corner of the bailey.
  for (const [ti, tj] of [[bailey.i0 - 1.6, bailey.j0 - 1.6], [bailey.i1 + 1.6, bailey.j0 - 1.6], [bailey.i0 - 1.6, bailey.j1 + 1.6], [bailey.i1 + 1.6, bailey.j1 + 1.6]] as const) {
    out.fixtures.push({ kind: 'gateTower', i: ti, j: tj, a: 0 })
  }
  out.masonry = faceOf(solid, w, h, (i, j) => i >= bailey.i0 - 3 && i <= bailey.i1 + 3 && j >= keepBox.j0 - 3 && j <= barb.j1 + 3)
  // A way off the road loops outside the walls, from the bailey's far
  // corner round into the inner ward's side.
  if (n >= 4) {
    const a = 1 + inBailey
    const p = out.cs[a]!
    const sd = Math.sign(p.i - mid) || 1
    for (const d of [18, 19, 17]) for (const dj of [0, -2, 2]) {
      out.loopSites.push({ a, b: a + 1, i: mid + sd * d, j: Math.round((p.j + out.cs[a + 1]!.j) / 2) + dj, ri: mid })
    }
  }
  // The secret is off the barbican, in the curtain's thickness.
  out.secretFrom = 1
  return out
}

// ─── The Rift: a ledge down its wall, islands in the void ────────────────────

const islands = (c: LayCtx): Laid => {
  const { rng, lrng, n, boss, W, M, w, h, solid, trail } = c
  const out = blank()
  // The road runs up a ledge on the rift's wall (the left one or the right,
  // by the seed), then crosses the void from island to island to the one the
  // finale holds. The chasm is narrow along the ledge and opens wide round
  // the last island.
  const mid = M + W / 2
  const s = lrng() < 0.5 ? 1 : -1
  const L = mid - (7 + Math.floor(lrng() * 3) - 1) * s
  const isleI = mid + 5 * s
  const lo = Math.min(mid - 2 * s, mid + 13 * s)
  const hi = Math.max(mid - 2 * s, mid + 13 * s)
  let cj = h - 8
  out.cs.push({ i: L, j: cj, r: 4.2 })
  for (let k = 1; k <= n; k++) {
    const last = k === n
    cj -= 11 + (last && boss ? 2 : 0) + Math.round(rng() * 1.5)
    if (k === 1 && !last) out.cs.push({ i: L, j: cj, r: 4.4 })
    else out.cs.push({ i: isleI, j: cj, r: last ? (boss ? 7.4 : 6.4) : 3.4 + rng() * 0.4 })
  }
  for (const _ of out.cs) out.chambers.push(null)
  const fin = out.cs[n]!
  const wideFrom = Math.round(fin.j + fin.r + 2)
  // The ledge: its two clearings and the way between, cut into the wall.
  const ledge = out.cs.slice(0, Math.min(2, n))
  for (const p of ledge) carveDisc(solid, w, h, p.i, p.j, p.r, rng)
  const isles = out.cs.slice(ledge.length)
  for (const p of isles) carveDisc(solid, w, h, p.i, p.j, p.r, rng)
  const lastLedge = ledge[ledge.length - 1]!
  const first = isles[0]!
  carvePath(solid, trail, w, h, [[ledge[0]!.i, ledge[0]!.j], [lastLedge.i, lastLedge.j], [L, first.j]], 1.5)
  // Bridges: across from the ledge to the first island, then straight up
  // from each island to the next. Each covers the rock and void between.
  const bridged: number[][] = []
  const span = (cells: number[]): void => {
    const keep = cells.filter(k => solid[k])
    for (const k of keep) solid[k] = 0
    bridged.push(keep)
  }
  {
    const cells: number[] = []
    for (let j = first.j - 1; j <= first.j + 1; j++) for (let i = Math.min(L + 2 * s, first.i - s); i <= Math.max(L + 2 * s, first.i - s); i++) cells.push(j * w + i)
    span(cells)
    carveLine(solid, trail, w, h, L, first.j, first.i, first.j, 0.9)
  }
  for (let q = 1; q < isles.length; q++) {
    const a = isles[q - 1]!
    const b = isles[q]!
    const cells: number[] = []
    for (let j = b.j + 1; j < a.j; j++) for (let i = a.i - 1; i <= a.i + 1; i++) cells.push(j * w + i)
    span(cells)
    carveLine(solid, trail, w, h, a.i, a.j, b.i, b.j, 0.9)
  }
  const bridge = new Uint8Array(w * h)
  for (const cells of bridged) for (const k of cells) bridge[k] = 1
  // The void: the chasm's rock, all but the bridges; wide round the finale.
  for (let j = 3; j < h - 3; j++) {
    const i0 = j < wideFrom ? mid - 16 : lo
    const i1 = j < wideFrom ? mid + 16 : hi
    for (let i = i0; i <= i1; i++) {
      const k = j * w + i
      if (!solid[k] || bridge[k]) continue
      solid[k] = 0
      trail[k] = 0
      out.water.push(k)
    }
  }
  dropSpecks(out.water, solid, w, h)
  for (const cells of bridged) if (cells.length) out.crossings.push(crossingOf('bridge', cells, w))
  // A way off the road loops through the wall behind the ledge.
  const ds = [9, 10, 11, 12].sort(() => lrng() - 0.5)
  if (ledge.length > 1) for (const d of ds) for (const dj of [0, 2, -2]) out.loopSites.push({ a: 0, b: 1, i: L - d * s, j: Math.round((ledge[0]!.j + ledge[1]!.j) / 2) + dj, ri: L })
  // Shards of rock adrift in the void.
  const wet = new Uint8Array(w * h)
  for (const k of out.water) wet[k] = 1
  for (let q = 0; q < 40 && out.fixtures.length < 14; q++) {
    const i = mid - 16 + lrng() * 32
    const j = 4 + lrng() * (h - 8)
    const k = Math.round(j) * w + Math.round(i)
    // Over the void, a cell clear of anything one walks on.
    let clear = true
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (!wet[k + dj * w + di]) clear = false
    if (clear) out.fixtures.push({ kind: 'shard', i, j, a: lrng() * 6 })
  }
  return out
}
