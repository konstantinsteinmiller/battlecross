import { CELL, Cell, type MapData } from './levelGen'

/**
 * ─── Navigation on the cell grid ─────────────────────────────────────────────
 *
 * One grid answers three questions, all without a physics engine:
 *   • collision — circle vs solid cells (plus pillar circles and closed doors),
 *   • line of sight — a DDA walk through cells,
 *   • paths — A* over walkable cells for tap-to-move and enemy chase.
 *
 * `solid` is the dynamic layer: a closed door marks its cell solid, an opened
 * door clears it. Everything else is static per map.
 */

/** A thin axis-aligned blocker (a closed door panel). */
export interface Slab {
  minX: number
  minZ: number
  maxX: number
  maxZ: number
  active: boolean
}

export interface Nav {
  map: MapData
  /** 1 = cannot be entered (void). */
  solid: Uint8Array
  /** Door cells for path-finding: 0 open, 1 closed (enemies stop, the player's
   *  walk-to passes — doors open on approach), 2 locked (nobody passes). */
  pathBlock: Uint8Array
  /** Closed doors: collide with bodies and block line of sight. */
  slabs: Slab[]
  /** Chests / crates: collide with bodies (not with sight). */
  props: Array<{ x: number; z: number; r: number; active: boolean }>
  w: number
  h: number
}

export const createNav = (map: MapData): Nav => {
  const solid = new Uint8Array(map.w * map.h)
  for (let k = 0; k < solid.length; k++) solid[k] = map.cell[k] === Cell.Void ? 1 : 0
  return { map, solid, pathBlock: new Uint8Array(map.w * map.h), slabs: [], props: [], w: map.w, h: map.h }
}

export const setCellSolid = (nav: Nav, i: number, j: number, v: boolean): void => {
  if (i < 0 || j < 0 || i >= nav.w || j >= nav.h) return
  nav.solid[j * nav.w + i] = v ? 1 : 0
}

export const isSolidCell = (nav: Nav, i: number, j: number): boolean => {
  if (i < 0 || j < 0 || i >= nav.w || j >= nav.h) return true
  return nav.solid[j * nav.w + i] === 1
}

export const isSolidAt = (nav: Nav, x: number, z: number): boolean =>
  isSolidCell(nav, Math.floor(x / CELL), Math.floor(z / CELL))

/**
 * Move a circle by (dx, dz) and resolve against solid cells and pillars.
 * Axis-separated so the circle slides along walls instead of sticking.
 * Mutates and returns `out` ([x, z]).
 */
export const moveCircle = (nav: Nav, x: number, z: number, dx: number, dz: number, r: number, out: [number, number]): [number, number] => {
  // Sub-step long moves so a fast slide cannot tunnel through a wall corner.
  const len = Math.hypot(dx, dz)
  const steps = Math.max(1, Math.ceil(len / (r * 0.8)))
  let px = x
  let pz = z
  const sx = dx / steps
  const sz = dz / steps
  for (let s = 0; s < steps; s++) {
    px += sx
    ;[px, pz] = resolveCircle(nav, px, pz, r)
    pz += sz
    ;[px, pz] = resolveCircle(nav, px, pz, r)
  }
  out[0] = px
  out[1] = pz
  return out
}

const _res: [number, number] = [0, 0]
/** Push a circle out of every overlapping solid cell and pillar. */
export const resolveCircle = (nav: Nav, x: number, z: number, r: number): [number, number] => {
  let px = x
  let pz = z
  const i0 = Math.floor((px - r) / CELL)
  const i1 = Math.floor((px + r) / CELL)
  const j0 = Math.floor((pz - r) / CELL)
  const j1 = Math.floor((pz + r) / CELL)
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      if (!isSolidCell(nav, i, j)) continue
      // Closest point of the cell AABB to the circle centre.
      const minX = i * CELL
      const minZ = j * CELL
      const cx = Math.max(minX, Math.min(px, minX + CELL))
      const cz = Math.max(minZ, Math.min(pz, minZ + CELL))
      const ddx = px - cx
      const ddz = pz - cz
      const d2 = ddx * ddx + ddz * ddz
      if (d2 >= r * r) continue
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2)
        const push = r - d
        px += (ddx / d) * push
        pz += (ddz / d) * push
      } else {
        // Centre inside the cell: push out along the shallowest axis.
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
  for (const p of nav.map.pillars) {
    const ddx = px - p.x
    const ddz = pz - p.z
    const rr = r + p.r
    const d2 = ddx * ddx + ddz * ddz
    if (d2 < rr * rr && d2 > 1e-8) {
      const d = Math.sqrt(d2)
      px = p.x + (ddx / d) * rr
      pz = p.z + (ddz / d) * rr
    }
  }
  // Dynamic props (chests, crates): solid until opened / broken.
  for (const p of nav.props) {
    if (!p.active) continue
    const ddx = px - p.x
    const ddz = pz - p.z
    const rr = r + p.r
    const d2 = ddx * ddx + ddz * ddz
    if (d2 < rr * rr && d2 > 1e-8) {
      const d = Math.sqrt(d2)
      px = p.x + (ddx / d) * rr
      pz = p.z + (ddz / d) * rr
    }
  }
  for (const sl of nav.slabs) {
    if (!sl.active) continue
    const cx = Math.max(sl.minX, Math.min(px, sl.maxX))
    const cz = Math.max(sl.minZ, Math.min(pz, sl.maxZ))
    const ddx = px - cx
    const ddz = pz - cz
    const d2 = ddx * ddx + ddz * ddz
    if (d2 >= r * r) continue
    if (d2 > 1e-8) {
      const d = Math.sqrt(d2)
      px += (ddx / d) * (r - d)
      pz += (ddz / d) * (r - d)
    } else {
      // Inside the slab: push out along the thin axis toward the nearer face.
      const thinX = sl.maxX - sl.minX < sl.maxZ - sl.minZ
      if (thinX) px = px < (sl.minX + sl.maxX) / 2 ? sl.minX - r : sl.maxX + r
      else pz = pz < (sl.minZ + sl.maxZ) / 2 ? sl.minZ - r : sl.maxZ + r
    }
  }
  _res[0] = px
  _res[1] = pz
  return _res
}

/** Segment vs AABB (slab) intersection — Liang–Barsky style clip. */
const segHitsSlab = (ax: number, az: number, bx: number, bz: number, sl: Slab): boolean => {
  let t0 = 0
  let t1 = 1
  const dx = bx - ax
  const dz = bz - az
  const clip = (p: number, q: number): boolean => {
    if (Math.abs(p) < 1e-9) return q >= 0
    const r = q / p
    if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r }
    else { if (r < t0) return false; if (r < t1) t1 = r }
    return true
  }
  return clip(-dx, ax - sl.minX) && clip(dx, sl.maxX - ax) && clip(-dz, az - sl.minZ) && clip(dz, sl.maxZ - az) && t0 <= t1
}

/**
 * Grid line of sight from (ax, az) to (bx, bz). Pillars block too (a
 * segment-vs-circle test), so an enemy behind a pillar cannot shoot through it.
 */
export const hasLineOfSight = (nav: Nav, ax: number, az: number, bx: number, bz: number): boolean => {
  let i = Math.floor(ax / CELL)
  let j = Math.floor(az / CELL)
  const ti = Math.floor(bx / CELL)
  const tj = Math.floor(bz / CELL)
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
  while ((i !== ti || j !== tj) && guard++ < 256) {
    if (tMaxX < tMaxZ) {
      tMaxX += tDeltaX
      i += stepI
    } else {
      tMaxZ += tDeltaZ
      j += stepJ
    }
    if (isSolidCell(nav, i, j)) return false
  }
  for (const sl of nav.slabs) {
    if (sl.active && segHitsSlab(ax, az, bx, bz, sl)) return false
  }
  // Pillars
  const len2 = dx * dx + dz * dz
  if (len2 < 1e-6) return true
  for (const p of nav.map.pillars) {
    const t = Math.max(0, Math.min(1, ((p.x - ax) * dx + (p.z - az) * dz) / len2))
    const cx = ax + dx * t - p.x
    const cz = az + dz * t - p.z
    if (cx * cx + cz * cz < p.r * p.r * 0.8) return false
  }
  return true
}

// ─── A* ──────────────────────────────────────────────────────────────────────

/**
 * A* over walkable cells (8-connected, no corner cutting). Returns world-space
 * waypoints from the cell after `from` to `to`'s cell centre, or null when no
 * path exists. Grids are ≤ 44×44, so a binary-heap-free open list is plenty.
 */
export const findPath = (nav: Nav, fx: number, fz: number, tx: number, tz: number, maxNodes = 1400, through = 0): Array<[number, number]> | null => {
  const W = nav.w
  const si = Math.floor(fx / CELL)
  const sj = Math.floor(fz / CELL)
  const ti = Math.floor(tx / CELL)
  const tj = Math.floor(tz / CELL)
  if (isSolidCell(nav, ti, tj)) return null
  const start = sj * W + si
  const goal = tj * W + ti
  if (start === goal) return [[tx, tz]]
  const blocked = (i: number, j: number) => isSolidCell(nav, i, j) || nav.map.navBlock[j * W + i] === 1 || nav.pathBlock[j * W + i]! > through
  const g = new Map<number, number>()
  const came = new Map<number, number>()
  const open: number[] = [start]
  const f = new Map<number, number>()
  const h = (k: number) => {
    const i = k % W
    const j = (k - i) / W
    const ddx = Math.abs(i - ti)
    const ddz = Math.abs(j - tj)
    return Math.max(ddx, ddz) + 0.414 * Math.min(ddx, ddz)
  }
  g.set(start, 0)
  f.set(start, h(start))
  const closed = new Set<number>()
  let expanded = 0
  while (open.length && expanded++ < maxNodes) {
    let bi = 0
    let bf = Infinity
    for (let n = 0; n < open.length; n++) {
      const v = f.get(open[n]!) ?? Infinity
      if (v < bf) { bf = v; bi = n }
    }
    const cur = open[bi]!
    open.splice(bi, 1)
    if (cur === goal) {
      const cells: number[] = [cur]
      let c = cur
      while (came.has(c)) { c = came.get(c)!; cells.push(c) }
      cells.reverse()
      const out: Array<[number, number]> = []
      for (let n = 1; n < cells.length; n++) {
        const k = cells[n]!
        const i = k % W
        const j = (k - i) / W
        out.push([(i + 0.5) * CELL, (j + 0.5) * CELL])
      }
      // Final waypoint is the exact target, not the cell centre.
      out[out.length - 1] = [tx, tz]
      return out
    }
    closed.add(cur)
    const ci = cur % W
    const cj = (cur - ci) / W
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue
        const ni = ci + di
        const nj = cj + dj
        if (blocked(ni, nj) && !(ni === ti && nj === tj && !isSolidCell(nav, ni, nj) && nav.pathBlock[nj * W + ni]! <= through)) continue
        if (di && dj && (blocked(ci + di, cj) || blocked(ci, cj + dj))) continue
        const nk = nj * W + ni
        if (closed.has(nk)) continue
        const cost = (g.get(cur) ?? 0) + (di && dj ? 1.414 : 1)
        if (cost < (g.get(nk) ?? Infinity)) {
          came.set(nk, cur)
          g.set(nk, cost)
          f.set(nk, cost + h(nk))
          if (!open.includes(nk)) open.push(nk)
        }
      }
    }
  }
  return null
}

/** Pull a path taut: drop waypoints that are directly visible from an earlier
 *  point, so walking to a tapped spot follows smooth diagonals, not a staircase. */
export const smoothPath = (nav: Nav, fx: number, fz: number, path: Array<[number, number]>, radius = 0.45): Array<[number, number]> => {
  if (path.length <= 1) return path
  const out: Array<[number, number]> = []
  let ax = fx
  let az = fz
  let n = 0
  while (n < path.length) {
    let far = n
    for (let m = path.length - 1; m > n; m--) {
      const [bx, bz] = path[m]!
      if (clearCorridor(nav, ax, az, bx, bz, radius)) { far = m; break }
    }
    const [px, pz] = path[far]!
    out.push([px, pz])
    ax = px
    az = pz
    n = far + 1
  }
  return out
}

/** LOS for a fat body: tests the centre line and both shoulder lines. */
const clearCorridor = (nav: Nav, ax: number, az: number, bx: number, bz: number, r: number): boolean => {
  const dx = bx - ax
  const dz = bz - az
  const len = Math.hypot(dx, dz) || 1
  const nx = -dz / len * r
  const nz = dx / len * r
  return hasLineOfSight(nav, ax, az, bx, bz)
    && hasLineOfSight(nav, ax + nx, az + nz, bx + nx, bz + nz)
    && hasLineOfSight(nav, ax - nx, az - nz, bx - nx, bz - nz)
}
