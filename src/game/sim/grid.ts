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
/** What a look or a shot cannot pass. */
export const SIGHT_MASK = SOLID_TERRAIN | SOLID_TEMP | SOLID_SEALED
const WALK_MASK = 0xff
/** A* expansions a search may spend. A zone has about a thousand walkable
 *  cells and a search pops a cell a few times at worst, so this is "the whole
 *  map, however the river winds": a path that exists is always found. */
export const PATH_BUDGET = 6000

export interface Grid {
  w: number
  h: number
  solid: Uint8Array
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

/** Push a circle out of every solid cell it overlaps. Writes `out`. */
export const resolveCircle = (g: Grid, x: number, z: number, r: number, out: [number, number]): [number, number] => {
  let px = x
  let pz = z
  const i0 = cellOf(px - r)
  const i1 = cellOf(px + r)
  const j0 = cellOf(pz - r)
  const j1 = cellOf(pz + r)
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      if (!isSolidCell(g, i, j)) continue
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
  return out
}

/**
 * Move a circle by (dx, dz) and resolve against solid cells. Axis-separated
 * and sub-stepped, so the circle slides along walls and a fast dash cannot
 * tunnel through a corner. Mutates and returns `out` ([x, z]).
 */
export const moveCircle = (g: Grid, x: number, z: number, dx: number, dz: number, r: number, out: [number, number]): [number, number] => {
  const len = Math.hypot(dx, dz)
  const steps = Math.max(1, Math.ceil(len / (r * 0.8)))
  let px = x
  let pz = z
  const sx = dx / steps
  const sz = dz / steps
  for (let s = 0; s < steps; s++) {
    px += sx
    resolveCircle(g, px, pz, r, out)
    px = out[0]
    pz = out[1]
    pz += sz
    resolveCircle(g, px, pz, r, out)
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
