import { CELL, WALL_H, Cell, type MapData } from '../world/levelGen'
import { floorAt, type Nav } from '../world/nav'

/**
 * ─── Solid space for a free camera ───────────────────────────────────────────
 *
 * The first-person camera never needs this: it rides in Flux's head, and his
 * collision circle keeps the eye off every wall. A cutscene camera (the exit,
 * `sim/exitRun.ts`) flies free, so it asks the level itself: is this point
 * inside a wall, under a floor, in a pillar or a door frame? Is the straight
 * line from the subject to the lens open? And, when it is not, where is the
 * nearest place that is — pulled in along the line, or swung round the
 * subject? Heights count: the walls are open to the sky, so above their tops
 * the camera is free (the climb's walls are as tall as each room's).
 *
 * Pure (no three.js), allocation-free in the per-frame calls.
 */

/** An axis-aligned solid the grid does not hold: a door's lintel, a shut door. */
export interface CineBox {
  x0: number
  x1: number
  y0: number
  y1: number
  z0: number
  z1: number
}

export interface CineWorld {
  nav: Nav
  /** Per cell: the top of the wall standing in it; −∞ for a walkable cell
   *  (its floor is `floorAt`). Cells off the grid count as the tallest wall. */
  top: Float32Array
  maxTop: number
  /** Door lintels and shut doors, refreshed when a cutscene starts. */
  boxes: CineBox[]
}

/** Where a labyrinth wall ends: its height plus the rounded cap on it. */
const LAB_TOP = WALL_H + 0.3
/** A pillar's height (its glowing orb included). */
const PILLAR_TOP = 3.1
/** A chest or a crate: taller than the camera ever flies low. */
const PROP_TOP = 1.3

/** The walls of a map, cell by cell. On the climb a wall stands as tall as
 *  the tallest room (or corridor) it borders, as `world/climbMesh.ts` draws it. */
export const cineWorld = (nav: Nav): CineWorld => {
  const map: MapData = nav.map
  const W = map.w
  const H = map.h
  const top = new Float32Array(W * H).fill(-Infinity)
  const t = map.terrain
  const edgeTop = (k: number): number => {
    if (!t) return LAB_TOP
    const room = map.room[k]!
    return room >= 0 ? (t.wallTop[room] ?? LAB_TOP) : t.floor[k]! + WALL_H + 0.8
  }
  let maxTop = LAB_TOP
  if (t) for (const v of t.wallTop) maxTop = Math.max(maxTop, v)
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const k = j * W + i
      if (map.cell[k] !== Cell.Void) continue
      if (!t) {
        top[k] = LAB_TOP
        continue
      }
      let h = -Infinity
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const ni = i + di
          const nj = j + dj
          if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue
          const nk = nj * W + ni
          if (map.cell[nk] !== Cell.Void) h = Math.max(h, edgeTop(nk) + 0.3)
        }
      }
      top[k] = h === -Infinity ? maxTop : h
    }
  }
  return { nav, top, maxTop: maxTop + 0.3, boxes: [] }
}

/** The wall top of cell (i, j), or −∞ for open floor. */
const cellTop = (w: CineWorld, i: number, j: number): number => {
  const nav = w.nav
  if (i < 0 || j < 0 || i >= nav.w || j >= nav.h) return w.maxTop
  return w.top[j * nav.w + i]!
}

/**
 * Is (x, y, z) within `r` (sideways) and `ry` (up and down) of anything
 * solid? `r` = 0 asks about the point itself.
 */
export const solidAt = (w: CineWorld, x: number, y: number, z: number, r = 0, ry = r): boolean => {
  const nav = w.nav
  // The floor under the point (the climb's heights, a lift's top; 0 on a flat map).
  if (y < floorAt(nav, x, z) + ry) return true
  const i0 = Math.floor((x - r) / CELL)
  const i1 = Math.floor((x + r) / CELL)
  const j0 = Math.floor((z - r) / CELL)
  const j1 = Math.floor((z + r) / CELL)
  const terrain = !!nav.map.terrain
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      let h = cellTop(w, i, j)
      const minX = i * CELL
      const minZ = j * CELL
      const cx = Math.max(minX, Math.min(x, minX + CELL))
      const cz = Math.max(minZ, Math.min(z, minZ + CELL))
      if (h === -Infinity) {
        // Open floor: on the climb a neighbour's floor can stand higher (a
        // cliff face) — the height there, at the point of it nearest.
        if (!terrain || (i === Math.floor(x / CELL) && j === Math.floor(z / CELL))) continue
        h = floorAt(nav, Math.max(minX + 1e-3, Math.min(cx, minX + CELL - 1e-3)), Math.max(minZ + 1e-3, Math.min(cz, minZ + CELL - 1e-3)))
      }
      if (y >= h + ry) continue
      const dx = x - cx
      const dz = z - cz
      if (dx * dx + dz * dz <= r * r) return true
    }
  }
  for (const p of nav.map.pillars) {
    if (y >= PILLAR_TOP + ry) continue
    const rr = p.r + r
    if ((x - p.x) ** 2 + (z - p.z) ** 2 < rr * rr) return true
  }
  for (const p of nav.props) {
    if (!p.active || y >= floorAt(nav, p.x, p.z) + PROP_TOP + ry) continue
    const rr = p.r + r
    if ((x - p.x) ** 2 + (z - p.z) ** 2 < rr * rr) return true
  }
  for (const b of w.boxes) {
    if (x > b.x0 - r && x < b.x1 + r && z > b.z0 - r && z < b.z1 + r && y > b.y0 - ry && y < b.y1 + ry) return true
  }
  return false
}

/** Sample spacing along a sight line (m). */
const STEP = 0.15

/**
 * How far along a → b (0..1) the line runs before it meets something solid
 * (with `r` of clearance). 1 = the whole line is open.
 */
export const clearFraction = (
  w: CineWorld, ax: number, ay: number, az: number, bx: number, by: number, bz: number, r = 0
): number => {
  const len = Math.hypot(bx - ax, by - ay, bz - az)
  const n = Math.max(1, Math.ceil(len / STEP))
  for (let s = 1; s <= n; s++) {
    const f = s / n
    if (solidAt(w, ax + (bx - ax) * f, ay + (by - ay) * f, az + (bz - az) * f, r)) return (s - 1) / n
  }
  return 1
}

/** The open line of sight test. */
export const clearLine = (
  w: CineWorld, ax: number, ay: number, az: number, bx: number, by: number, bz: number, r = 0
): boolean => clearFraction(w, ax, ay, az, bx, by, bz, r) >= 1

export interface CamSpot {
  x: number
  y: number
  z: number
}

/** Clearance kept round the lens: the near plane must never slice a wall. */
export const CAM_PAD = 0.35
/** Closest a pulled-in camera may come to its subject before it swings round. */
export const CAM_MIN = 1.25
/** Swings tried round the subject (radians), nearest first. */
const SWINGS = [0, 0.45, -0.45, 0.9, -0.9, 1.35, -1.35, 1.8, -1.8, 2.3, -2.3, Math.PI]
/** Heights the lens may crane up by (m) to see over something low — a crate,
 *  the teleporter pad, a ledge — before it gives up a direction. */
const RAISES = [0, 0.8, 1.6, 2.6]

/**
 * Put the camera as near `want` as the level allows, keeping a clear view of
 * `anchor` (the subject). Each direction round the anchor — the wanted one
 * first, then swung either way, widening — is tried at the wanted height and
 * craned up over low obstacles, each line pulled in to just short of what
 * blocks it; the first direction that keeps `minDist` wins (at the height
 * that keeps the most of the distance; a lower one when it keeps nearly as
 * much). Last resort: straight up over the anchor (the sky is always open).
 * Writes `out` and returns which rule placed it (for tests and debugging).
 */
export const placeCamera = (
  w: CineWorld, ax: number, ay: number, az: number, want: CamSpot, out: CamSpot, minDist = CAM_MIN
): 'want' | 'pulled' | 'raised' | 'swung' | 'lifted' => {
  const ox = want.x - ax
  const oy = want.y - ay
  const oz = want.z - az
  const d = Math.hypot(ox, oy, oz)
  if (d < 1e-4) {
    out.x = ax
    out.y = ay
    out.z = az
    return 'want'
  }
  if (clearFraction(w, ax, ay, az, want.x, want.y, want.z, CAM_PAD) >= 1) {
    out.x = want.x
    out.y = want.y
    out.z = want.z
    return 'want'
  }
  for (const a of SWINGS) {
    const c = Math.cos(a)
    const s = Math.sin(a)
    const rx = ox * c - oz * s
    const rz = ox * s + oz * c
    let best = -1
    let bestK = 0
    let bestR = 0
    for (const r of RAISES) {
      const ry = oy + r
      const dl = Math.hypot(rx, ry, rz)
      const g = clearFraction(w, ax, ay, az, ax + rx, ay + ry, az + rz, CAM_PAD)
      const kd = g >= 1 ? dl : g * dl - CAM_PAD
      // A higher line has to keep clearly more of the distance to be worth it.
      if (kd > best * 1.25 + 0.05) {
        best = kd
        bestK = kd / dl
        bestR = r
      }
      if (g >= 1) break
    }
    if (best < minDist) continue
    out.x = ax + rx * bestK
    out.y = ay + (oy + bestR) * bestK
    out.z = az + rz * bestK
    return a !== 0 ? 'swung' : bestR > 0 ? 'raised' : 'pulled'
  }
  // Straight up from the subject, as far as it is open.
  const up = Math.max(minDist, d)
  const g = clearFraction(w, ax, ay, az, ax, ay + up, az, CAM_PAD)
  out.x = ax
  out.y = ay + Math.max(0.3, g * up - CAM_PAD)
  out.z = az + 0.01
  return 'lifted'
}
