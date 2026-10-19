/**
 * ─── The walk grid ───────────────────────────────────────────────────────────
 *
 * One grid of square cells answers three questions without a physics engine:
 *   • collision — a circle against solid cells,
 *   • line of sight — a DDA walk through cells (shots, spells, "can I see it"),
 *   • paths — A* over walkable cells for tap-to-move, chases and minions.
 *
 * `solid` has four layers folded into one byte:
 *   1 = the zone's own terrain (trees, cliffs, walls);
 *   2 = a TEMPORARY blocker a skill raised (an Earth Barrier, Tectonic
 *       rubble), cleared without touching the terrain under it;
 *   4 = LOW ground nobody can stand on but everybody can see and shoot over:
 *       water, lava, a chest, a carved stone;
 *   8 = a SEALED cell: a hidden passage behind a door that has not opened yet.
 *       It is rock until it opens, and then it is gone for the visit.
 *  16 = ROUND: with LOW alone, a level prop (a chest, a post, an ore rock)
 *       that is smaller than its cell. A body is stopped by a disc of
 *       `ROUND_R` round the cell's middle — the prop's drawn footprint — not
 *       by the whole square (whose corners were thin air). Paths and looks
 *       still treat the cell as blocked.
 * Any bit stops a walking body. Only 1, 2 and 8 stop a line of sight or a
 * shot (`SIGHT_MASK`).
 *
 * Pure data and arithmetic: no three.js, no DOM, so the same code runs in the
 * game, in unit tests and in balance scripts. A* keeps its scratch arrays
 * between calls (a dozen chasing units ask every half second).
 */

/** Cell size in metres. */
export const CELL = 1.5

export const SOLID_TERRAIN = 1
export const SOLID_TEMP = 2
export const SOLID_LOW = 4
export const SOLID_SEALED = 8
export const SOLID_ROUND = 16
/** The radius (m) of a ROUND cell's collider: what a chest, a post or an ore rock covers. */
export const ROUND_R = 0.6
/** What a look or a shot cannot pass. */
export const SIGHT_MASK = SOLID_TERRAIN | SOLID_TEMP | SOLID_SEALED
const WALK_MASK = 0xff
/** A* expansions a search may spend. A zone has about a thousand walkable
 *  cells and a search pops a cell a few times at worst, so this is "the whole
 *  map, however the river winds": a path that exists is always found. */
export const PATH_BUDGET = 6000

/** A piece of furniture's footprint, in metres (x across, z down the map). */
export interface Block { x0: number; z0: number; x1: number; z1: number }

export interface Grid {
  w: number
  h: number
  solid: Uint8Array
  /** Furniture indoors (roadmap #84): smaller than a cell, so it is kept as
   *  rectangles beside the cells. It stops the HERO's body (`resolveCircle`
   *  with `blocks`), not a look, a shot or the townsfolk (their routines were
   *  laid round it, and a stuck baker at a table would be worse than a sleeve
   *  through one). Indexed by the cells each one touches. */
  blocks?: Block[]
  blockCells?: Map<number, number[]>
  // A* scratch, sized w·h.
  g: Float32Array
  f: Float32Array
  came: Int32Array
  stamp: Int32Array
  closed: Int32Array
  heap: Int32Array
  gen: number
}

export const createGrid = (w: number, h: number): Grid => ({
  w,
  h,
  solid: new Uint8Array(w * h),
  g: new Float32Array(w * h),
  f: new Float32Array(w * h),
  came: new Int32Array(w * h),
  stamp: new Int32Array(w * h),
  closed: new Int32Array(w * h),
  // A node can be pushed again each time a cheaper way to it is found (one
  // per neighbour at most), so the heap holds up to 8 entries per cell.
  heap: new Int32Array(w * h * 8),
  gen: 0
})

export const cellOf = (v: number): number => Math.floor(v / CELL)
export const centerOf = (i: number): number => (i + 0.5) * CELL

export const isSolidCell = (g: Grid, i: number, j: number): boolean =>
  i < 0 || j < 0 || i >= g.w || j >= g.h || g.solid[j * g.w + i] !== 0

export const isSolidAt = (g: Grid, x: number, z: number): boolean =>
  isSolidCell(g, cellOf(x), cellOf(z))

/** Does the cell stop a look or a shot? (Water and low props do not.) */
export const blocksSightCell = (g: Grid, i: number, j: number): boolean =>
  i < 0 || j < 0 || i >= g.w || j >= g.h || (g.solid[j * g.w + i]! & SIGHT_MASK) !== 0

export const blocksSightAt = (g: Grid, x: number, z: number): boolean =>
  blocksSightCell(g, cellOf(x), cellOf(z))

/** Set or clear one layer of a cell. */
export const setCellBit = (g: Grid, i: number, j: number, bit: number, on: boolean): void => {
  if (i < 0 || j < 0 || i >= g.w || j >= g.h) return
  const k = j * g.w + i
  if (on) g.solid[k]! |= bit
  else g.solid[k]! &= ~bit
}

/** Raise or clear a TEMPORARY blocker on a cell (never touches terrain). */
export const setTempSolid = (g: Grid, i: number, j: number, on: boolean): void => {
  if (i < 0 || j < 0 || i >= g.w || j >= g.h) return
  const k = j * g.w + i
  if (on) g.solid[k]! |= SOLID_TEMP
  else g.solid[k]! &= ~SOLID_TEMP
}

/**
 * The body furniture stops: the walker's half width the room layout keeps
 * clear between pieces (`gfx/roomLayout.ts` AGENT). Every way the layout
 * promises from the door is then walkable; the hero's sleeve may brush a
 * table's edge, never his middle cross it.
 */
export const FURNITURE_R = 0.2

/** Furniture for this grid (a town's rooms), indexed by cell. */
export const setBlocks = (g: Grid, blocks: Block[]): void => {
  const by = new Map<number, number[]>()
  blocks.forEach((b, n) => {
    for (let j = cellOf(b.z0); j <= cellOf(b.z1); j++) {
      for (let i = cellOf(b.x0); i <= cellOf(b.x1); i++) {
        const k = j * g.w + i
        const list = by.get(k)
        if (list) list.push(n)
        else by.set(k, [n])
      }
    }
  })
  g.blocks = blocks
  g.blockCells = by
}

/** Push a circle out of the furniture near it. */
const resolveBlocks = (g: Grid, px: number, pz: number, out: [number, number]): void => {
  const r = FURNITURE_R
  const by = g.blockCells!
  const blocks = g.blocks!
  for (let j = cellOf(pz - r); j <= cellOf(pz + r); j++) {
    for (let i = cellOf(px - r); i <= cellOf(px + r); i++) {
      const list = by.get(j * g.w + i)
      if (!list) continue
      for (const n of list) {
        const b = blocks[n]!
        const cx = Math.max(b.x0, Math.min(px, b.x1))
        const cz = Math.max(b.z0, Math.min(pz, b.z1))
        const dx = px - cx
        const dz = pz - cz
        const d2 = dx * dx + dz * dz
        if (d2 >= r * r) continue
        if (d2 > 1e-8) {
          const d = Math.sqrt(d2)
          px += (dx / d) * (r - d)
          pz += (dz / d) * (r - d)
        } else {
          const left = px - b.x0
          const right = b.x1 - px
          const top = pz - b.z0
          const bottom = b.z1 - pz
          const m = Math.min(left, right, top, bottom)
          if (m === left) px = b.x0 - r
          else if (m === right) px = b.x1 + r
          else if (m === top) pz = b.z0 - r
          else pz = b.z1 + r
        }
      }
    }
  }
  out[0] = px
  out[1] = pz
}

/** Does the segment cross a piece of furniture grown by `pad`? (Slab test.) */
export const crossesBlock = (b: Block, ax: number, az: number, bx: number, bz: number, pad: number): boolean => {
  const x0 = b.x0 - pad
  const x1 = b.x1 + pad
  const z0 = b.z0 - pad
  const z1 = b.z1 + pad
  let t0 = 0
  let t1 = 1
  const dx = bx - ax
  const dz = bz - az
  for (const [p, d, lo, hi] of [[ax, dx, x0, x1], [az, dz, z0, z1]] as const) {
    if (Math.abs(d) < 1e-9) {
      if (p <= lo || p >= hi) return false
      continue
    }
    let ta = (lo - p) / d
    let tb = (hi - p) / d
    if (ta > tb) { const t = ta; ta = tb; tb = t }
    t0 = Math.max(t0, ta)
    t1 = Math.min(t1, tb)
    if (t0 >= t1) return false
  }
  return true
}

/** The first piece of furniture a straight walk would cross (-1: none). */
export const blockOnLine = (g: Grid, ax: number, az: number, bx: number, bz: number, pad = FURNITURE_R): number => {
  const blocks = g.blocks
  if (!blocks) return -1
  let best = -1
  let bd = Infinity
  for (let n = 0; n < blocks.length; n++) {
    const b = blocks[n]!
    if (!crossesBlock(b, ax, az, bx, bz, pad)) continue
    const d = Math.hypot((b.x0 + b.x1) / 2 - ax, (b.z0 + b.z1) / 2 - az)
    if (d < bd) { bd = d; best = n }
  }
  return best
}

/**
 * A walked path that goes round the furniture: where a leg crosses a piece, a
 * waypoint is put at the corner of the piece (grown by the body and a little
 * more) that makes the shortest way round. Mutates `path` ([x, z, …], the
 * start not included). A room is small and its pieces are few, so a handful of
 * corners at most.
 */
export const detourBlocks = (g: Grid, fx: number, fz: number, path: number[]): void => {
  if (!g.blocks?.length) return
  const pad = FURNITURE_R + 0.06
  let ax = fx
  let az = fz
  for (let i = 0, guard = 0; i + 1 < path.length && guard < 24; guard++) {
    const bx = path[i]!
    const bz = path[i + 1]!
    const n = blockOnLine(g, ax, az, bx, bz, FURNITURE_R)
    if (n < 0) { ax = bx; az = bz; i += 2; continue }
    const b = g.blocks[n]!
    let cx = NaN
    let cz = NaN
    let best = Infinity
    for (const [x, z] of [[b.x0 - pad, b.z0 - pad], [b.x1 + pad, b.z0 - pad], [b.x0 - pad, b.z1 + pad], [b.x1 + pad, b.z1 + pad]] as const) {
      if (isSolidAt(g, x, z) || crossesBlock(b, ax, az, x, z, FURNITURE_R - 0.01)) continue
      const d = Math.hypot(x - ax, z - az) + Math.hypot(bx - x, bz - z)
      if (d < best) { best = d; cx = x; cz = z }
    }
    if (!Number.isFinite(best)) { ax = bx; az = bz; i += 2; continue }
    path.splice(i, 0, cx, cz)
  }
}

/** Push a circle out of every solid cell it overlaps (and, with `blocks`, out
 *  of the furniture). Writes `out`. */
export const resolveCircle = (g: Grid, x: number, z: number, r: number, out: [number, number], blocks = false): [number, number] => {
  let px = x
  let pz = z
  const i0 = cellOf(px - r)
  const i1 = cellOf(px + r)
  const j0 = cellOf(pz - r)
  const j1 = cellOf(pz + r)
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      if (!isSolidCell(g, i, j)) continue
      if (g.solid[j * g.w + i] === (SOLID_LOW | SOLID_ROUND) && i >= 0 && j >= 0 && i < g.w && j < g.h) {
        // A prop smaller than its cell: a disc round its middle.
        const dx = px - (i + 0.5) * CELL
        const dz = pz - (j + 0.5) * CELL
        const d = Math.hypot(dx, dz)
        const rr = r + ROUND_R
        if (d >= rr) continue
        if (d > 1e-6) { px += (dx / d) * (rr - d); pz += (dz / d) * (rr - d) } else pz += rr
        continue
      }
      const minX = i * CELL
      const minZ = j * CELL
      const cx = Math.max(minX, Math.min(px, minX + CELL))
      const cz = Math.max(minZ, Math.min(pz, minZ + CELL))
      const dx = px - cx
      const dz = pz - cz
      const d2 = dx * dx + dz * dz
      if (d2 >= r * r) continue
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2)
        px += (dx / d) * (r - d)
        pz += (dz / d) * (r - d)
      } else {
        // Centre inside the cell: out along the shallowest axis.
        const left = px - minX
        const right = minX + CELL - px
        const top = pz - minZ
        const bottom = minZ + CELL - pz
        const m = Math.min(left, right, top, bottom)
        if (m === left) px = minX - r
        else if (m === right) px = minX + CELL + r
        else if (m === top) pz = minZ - r
        else pz = minZ + CELL + r
      }
    }
  }
  out[0] = px
  out[1] = pz
  if (blocks && g.blockCells) resolveBlocks(g, px, pz, out)
  return out
}

/**
 * How far (m) a point lies outside every collider a body is stopped by: 0 on
 * a blocked cell (inside a ROUND cell's disc, for a level prop) or a piece of
 * furniture, else the distance to the nearest one, up to `reach` (then
 * `reach`). Past the grid's edge counts as blocked. What a drawn prop's
 * footprint is held against (`gfx/propRoles.ts`): a point of a solid prop
 * that lies further out than a hand's breadth is one the hero walks into.
 */
export const colliderDist = (g: Grid, x: number, z: number, reach = 2 * CELL, blocks = true): number => {
  let best = reach
  const ci = cellOf(x)
  const cj = cellOf(z)
  // On a blocked square cell: no search.
  if (ci < 0 || cj < 0 || ci >= g.w || cj >= g.h) return 0
  const own = g.solid[cj * g.w + ci]!
  if (own && own !== (SOLID_LOW | SOLID_ROUND)) return 0
  const R = Math.ceil(reach / CELL)
  for (let j = cj - R; j <= cj + R; j++) {
    for (let i = ci - R; i <= ci + R; i++) {
      const out = i < 0 || j < 0 || i >= g.w || j >= g.h
      const v = out ? 0xff : g.solid[j * g.w + i]!
      if (!v) continue
      let d: number
      if (v === (SOLID_LOW | SOLID_ROUND)) d = Math.max(0, Math.hypot(x - (i + 0.5) * CELL, z - (j + 0.5) * CELL) - ROUND_R)
      else d = Math.hypot(Math.max(0, i * CELL - x, x - (i + 1) * CELL), Math.max(0, j * CELL - z, z - (j + 1) * CELL))
      if (d < best) { best = d; if (!d) return 0 }
    }
  }
  if (blocks && g.blocks && g.blockCells) {
    for (let j = cellOf(z - best); j <= cellOf(z + best); j++) {
      for (let i = cellOf(x - best); i <= cellOf(x + best); i++) {
        for (const n of g.blockCells.get(j * g.w + i) ?? []) {
          const b = g.blocks[n]!
          const d = Math.hypot(Math.max(0, b.x0 - x, x - b.x1), Math.max(0, b.z0 - z, z - b.z1))
          if (d < best) best = d
        }
      }
    }
  }
  return best
}

/**
 * Move a circle by (dx, dz) and resolve against solid cells. Axis-separated
 * and sub-stepped, so the circle slides along walls and a fast dash cannot
 * tunnel through a corner. Mutates and returns `out` ([x, z]).
 */
export const moveCircle = (g: Grid, x: number, z: number, dx: number, dz: number, r: number, out: [number, number], blocks = false): [number, number] => {
  const len = Math.hypot(dx, dz)
  const steps = Math.max(1, Math.ceil(len / ((blocks && g.blockCells ? Math.min(r, FURNITURE_R) : r) * 0.8)))
  let px = x
  let pz = z
  const sx = dx / steps
  const sz = dz / steps
  for (let s = 0; s < steps; s++) {
    px += sx
    resolveCircle(g, px, pz, r, out, blocks)
    px = out[0]
    pz = out[1]
    pz += sz
    resolveCircle(g, px, pz, r, out, blocks)
    px = out[0]
    pz = out[1]
  }
  out[0] = px
  out[1] = pz
  return out
}

/** A DDA walk from (ax, az) to (bx, bz): no cell with a bit of `mask` between. */
const lineClear = (g: Grid, ax: number, az: number, bx: number, bz: number, mask: number): boolean => {
  let i = cellOf(ax)
  let j = cellOf(az)
  const ti = cellOf(bx)
  const tj = cellOf(bz)
  const dx = bx - ax
  const dz = bz - az
  const stepI = dx > 0 ? 1 : -1
  const stepJ = dz > 0 ? 1 : -1
  const tDeltaX = dx !== 0 ? Math.abs(CELL / dx) : Infinity
  const tDeltaZ = dz !== 0 ? Math.abs(CELL / dz) : Infinity
  const nextX = stepI > 0 ? (i + 1) * CELL : i * CELL
  const nextZ = stepJ > 0 ? (j + 1) * CELL : j * CELL
  let tMaxX = dx !== 0 ? Math.abs((nextX - ax) / dx) : Infinity
  let tMaxZ = dz !== 0 ? Math.abs((nextZ - az) / dz) : Infinity
  let guard = 0
  while ((i !== ti || j !== tj) && guard++ < 400) {
    if (tMaxX < tMaxZ) {
      tMaxX += tDeltaX
      i += stepI
    } else {
      tMaxZ += tDeltaZ
      j += stepJ
    }
    if (i < 0 || j < 0 || i >= g.w || j >= g.h || (g.solid[j * g.w + i]! & mask) !== 0) return false
  }
  return true
}

/** Line of sight (and of fire) from (ax, az) to (bx, bz): nothing that blocks
 *  a look between. Water and low props are seen and shot over. */
export const hasLineOfSight = (g: Grid, ax: number, az: number, bx: number, bz: number): boolean =>
  lineClear(g, ax, az, bx, bz, SIGHT_MASK)

/** Would the line be clear but for the temporary walls (ice spikes, a barrier)? */
export const sightPastWalls = (g: Grid, ax: number, az: number, bx: number, bz: number): boolean =>
  lineClear(g, ax, az, bx, bz, SOLID_TERRAIN | SOLID_SEALED)

/** Can a point WALK the straight line? (Water is in the way of feet.) */
export const hasWalkLine = (g: Grid, ax: number, az: number, bx: number, bz: number): boolean =>
  lineClear(g, ax, az, bx, bz, WALK_MASK)

/** A walkable straight line for a fat body: the centre line and both shoulder lines. */
export const clearCorridor = (g: Grid, ax: number, az: number, bx: number, bz: number, r: number): boolean => {
  const dx = bx - ax
  const dz = bz - az
  const len = Math.hypot(dx, dz) || 1
  const nx = (-dz / len) * r
  const nz = (dx / len) * r
  return hasWalkLine(g, ax, az, bx, bz) &&
    hasWalkLine(g, ax + nx, az + nz, bx + nx, bz + nz) &&
    hasWalkLine(g, ax - nx, az - nz, bx - nx, bz - nz)
}

/** The nearest walkable cell centre to (x, z), searching outward in rings. */
export const nearestOpen = (g: Grid, x: number, z: number, out: [number, number], maxRing = 8): boolean => {
  const ci = cellOf(x)
  const cj = cellOf(z)
  if (!isSolidCell(g, ci, cj)) { out[0] = x; out[1] = z; return true }
  for (let ring = 1; ring <= maxRing; ring++) {
    let best = Infinity
    let found = false
    for (let dj = -ring; dj <= ring; dj++) {
      for (let di = -ring; di <= ring; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== ring) continue
        const i = ci + di
        const j = cj + dj
        if (isSolidCell(g, i, j)) continue
        const d = (centerOf(i) - x) ** 2 + (centerOf(j) - z) ** 2
        if (d < best) { best = d; out[0] = centerOf(i); out[1] = centerOf(j); found = true }
      }
    }
    if (found) return true
  }
  return false
}

// ─── A* ──────────────────────────────────────────────────────────────────────

const heapPush = (g: Grid, n: number, k: number): number => {
  const heap = g.heap
  const f = g.f
  let i = n
  heap[i] = k
  while (i > 0) {
    const p = (i - 1) >> 1
    if (f[heap[p]!]! <= f[k]!) break
    heap[i] = heap[p]!
    i = p
  }
  heap[i] = k
  return n + 1
}

const heapPop = (g: Grid, n: number): number => {
  const heap = g.heap
  const f = g.f
  const last = heap[n - 1]!
  const m = n - 1
  let i = 0
  for (;;) {
    let c = i * 2 + 1
    if (c >= m) break
    if (c + 1 < m && f[heap[c + 1]!]! < f[heap[c]!]!) c++
    if (f[last]! <= f[heap[c]!]!) break
    heap[i] = heap[c]!
    i = c
  }
  heap[i] = last
  return m
}

/**
 * A* over walkable cells (8-connected, no corner cutting). Appends world-space
 * waypoints (x, z pairs) from the cell after the start to the exact target
 * into `out` and returns how many numbers it wrote (0 = no path).
 */
export const findPath = (g: Grid, fx: number, fz: number, tx: number, tz: number, out: number[], maxNodes = PATH_BUDGET): number => {
  out.length = 0
  const W = g.w
  const si = cellOf(fx)
  const sj = cellOf(fz)
  const ti = cellOf(tx)
  const tj = cellOf(tz)
  if (isSolidCell(g, ti, tj) || si < 0 || sj < 0 || si >= W || sj >= g.h) return 0
  const start = sj * W + si
  const goal = tj * W + ti
  if (start === goal) {
    out.push(tx, tz)
    return 2
  }
  const gen = ++g.gen
  const gs = g.g
  const fs = g.f
  const came = g.came
  const stamp = g.stamp
  const closed = g.closed
  const h = (i: number, j: number): number => {
    const dx = Math.abs(i - ti)
    const dz = Math.abs(j - tj)
    return Math.max(dx, dz) + 0.414 * Math.min(dx, dz)
  }
  gs[start] = 0
  fs[start] = h(si, sj)
  came[start] = -1
  stamp[start] = gen
  let n = heapPush(g, 0, start)
  let expanded = 0
  while (n > 0 && expanded++ < maxNodes) {
    const cur = g.heap[0]!
    n = heapPop(g, n)
    if (closed[cur] === gen) continue
    closed[cur] = gen
    if (cur === goal) {
      // Walk back, then reverse into `out`.
      let c = cur
      let count = 0
      while (came[c]! >= 0) { count++; c = came[c]! }
      out.length = count * 2
      c = cur
      let w = count - 1
      while (came[c]! >= 0) {
        const i = c % W
        const j = (c - i) / W
        out[w * 2] = centerOf(i)
        out[w * 2 + 1] = centerOf(j)
        w--
        c = came[c]!
      }
      // The last waypoint is the exact target, not the cell centre.
      out[count * 2 - 2] = tx
      out[count * 2 - 1] = tz
      return count * 2
    }
    const ci = cur % W
    const cj = (cur - ci) / W
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue
        const ni = ci + di
        const nj = cj + dj
        if (isSolidCell(g, ni, nj)) continue
        if (di && dj && (isSolidCell(g, ci + di, cj) || isSolidCell(g, ci, cj + dj))) continue
        const nk = nj * W + ni
        if (closed[nk] === gen) continue
        const cost = gs[cur]! + (di && dj ? 1.414 : 1)
        if (stamp[nk] !== gen || cost < gs[nk]!) {
          stamp[nk] = gen
          gs[nk] = cost
          fs[nk] = cost + h(ni, nj)
          came[nk] = cur
          n = heapPush(g, n, nk)
        }
      }
    }
  }
  return 0
}

/**
 * Pull a path taut in place: drop waypoints that are directly reachable from
 * an earlier point, so a walk follows smooth diagonals, not a staircase.
 * Returns the new length (in numbers).
 */
export const smoothPath = (g: Grid, fx: number, fz: number, path: number[], radius = 0.4): number => {
  const count = path.length >> 1
  if (count <= 1) return path.length
  let ax = fx
  let az = fz
  let n = 0
  let w = 0
  while (n < count) {
    let far = n
    for (let m = count - 1; m > n; m--) {
      if (clearCorridor(g, ax, az, path[m * 2]!, path[m * 2 + 1]!, radius)) { far = m; break }
    }
    ax = path[far * 2]!
    az = path[far * 2 + 1]!
    path[w * 2] = ax
    path[w * 2 + 1] = az
    w++
    n = far + 1
  }
  path.length = w * 2
  return path.length
}
