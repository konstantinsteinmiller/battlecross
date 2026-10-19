import type { BufferGeometry } from 'three'

/**
 * ─── What a prop covers of the ground ────────────────────────────────────────
 *
 * The walk grid blocks whole 1.5 m cells; a prop is a lumpy shape. A blocked
 * cell the hero can touch must be COVERED by what is drawn there, or he walks
 * into a wall nobody can see (the Whisperwood's playtest: a grass line between
 * two chests the hero could not walk along).
 *
 * A footprint is the shape's own geometry seen from straight above: every
 * triangle rasterised into a small local grid, then a distance field over it,
 * so "how far is this point from anything drawn" is one lookup. Built once
 * per shape and kept. Pure arithmetic over the geometry: the game uses it to
 * fill the gaps of its scenery, a test uses it to prove there are none.
 */

/** A footprint: a square local grid, metres per pixel, and each pixel's distance (m) to the drawn shape. */
export interface Foot {
  res: number
  n: number
  half: number
  dist: Float32Array
}

/** Pixel size of a footprint (m). */
const RES = 0.05

/** The footprint of a shape's parts (local space, as built: at scale 1, unturned). */
export const footOf = (parts: readonly BufferGeometry[]): Foot => {
  let half = 0.5
  for (const g of parts) {
    const p = g.attributes.position!
    for (let v = 0; v < p.count; v++) half = Math.max(half, Math.abs(p.getX(v)), Math.abs(p.getZ(v)))
  }
  half += 0.5
  const n = Math.ceil((half * 2) / RES)
  const inside = new Uint8Array(n * n)
  const px = (x: number): number => (x + half) / RES - 0.5
  for (const g of parts) {
    const p = g.attributes.position!
    const index = g.index
    const count = index ? index.count : p.count
    for (let t = 0; t + 2 < count; t += 3) {
      const a = index ? index.getX(t) : t
      const b = index ? index.getX(t + 1) : t + 1
      const c = index ? index.getX(t + 2) : t + 2
      const ax = px(p.getX(a)); const az = px(p.getZ(a))
      const bx = px(p.getX(b)); const bz = px(p.getZ(b))
      const cx = px(p.getX(c)); const cz = px(p.getZ(c))
      // The vertices themselves: a triangle seen edge-on still marks its line.
      for (const [x, z] of [[ax, az], [bx, bz], [cx, cz]] as const) {
        const i = Math.round(x)
        const j = Math.round(z)
        if (i >= 0 && j >= 0 && i < n && j < n) inside[j * n + i] = 1
      }
      const d = (bx - ax) * (cz - az) - (bz - az) * (cx - ax)
      if (Math.abs(d) < 1e-9) continue
      const i0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)))
      const i1 = Math.min(n - 1, Math.ceil(Math.max(ax, bx, cx)))
      const j0 = Math.max(0, Math.floor(Math.min(az, bz, cz)))
      const j1 = Math.min(n - 1, Math.ceil(Math.max(az, bz, cz)))
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const w0 = ((bx - i) * (cz - j) - (bz - j) * (cx - i)) / d
          const w1 = ((cx - i) * (az - j) - (cz - j) * (ax - i)) / d
          if (w0 >= -1e-6 && w1 >= -1e-6 && 1 - w0 - w1 >= -1e-6) inside[j * n + i] = 1
        }
      }
    }
  }
  // Chamfer distance (3-4 weights, in pixels), then metres.
  const D = new Float32Array(n * n)
  const BIG = 1e9
  for (let k = 0; k < n * n; k++) D[k] = inside[k] ? 0 : BIG
  const relax = (k: number, q: number, w: number): void => { if (D[q]! + w < D[k]!) D[k] = D[q]! + w }
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i
      if (i > 0) relax(k, k - 1, 3)
      if (j > 0) {
        relax(k, k - n, 3)
        if (i > 0) relax(k, k - n - 1, 4)
        if (i < n - 1) relax(k, k - n + 1, 4)
      }
    }
  }
  for (let j = n - 1; j >= 0; j--) {
    for (let i = n - 1; i >= 0; i--) {
      const k = j * n + i
      if (i < n - 1) relax(k, k + 1, 3)
      if (j < n - 1) {
        relax(k, k + n, 3)
        if (i < n - 1) relax(k, k + n + 1, 4)
        if (i > 0) relax(k, k + n - 1, 4)
      }
    }
  }
  for (let k = 0; k < n * n; k++) D[k] = (D[k]! / 3) * RES
  return { res: RES, n, half, dist: D }
}

/** How far (m, in the shape's own units) a local point lies from what is drawn. */
export const footDist = (f: Foot, lx: number, lz: number): number => {
  const i = Math.round((lx + f.half) / f.res - 0.5)
  const j = Math.round((lz + f.half) / f.res - 0.5)
  if (i < 0 || j < 0 || i >= f.n || j >= f.n) {
    // Past the grid: at least the way to its edge.
    const ci = Math.max(0, Math.min(f.n - 1, i))
    const cj = Math.max(0, Math.min(f.n - 1, j))
    return f.dist[cj * f.n + ci]! + Math.hypot(i - ci, j - cj) * f.res
  }
  return f.dist[j * f.n + i]!
}

/** One drawn thing: its footprint, where it stands, its turn about the up axis and its scale. */
export interface Footed { foot: Foot; x: number; z: number; rot: number; sc: number }

/** How far (m) a world point lies from a placed footprint (its turn as three's Y rotation). */
export const footedDist = (p: Footed, x: number, z: number): number => {
  const dx = x - p.x
  const dz = z - p.z
  const c = Math.cos(p.rot)
  const s = Math.sin(p.rot)
  // World = R(rot) · local, so local = R(-rot) · world.
  const lx = (dx * c - dz * s) / p.sc
  const lz = (dx * s + dz * c) / p.sc
  return footDist(p.foot, lx, lz) * p.sc
}

/** How far a blocked cell's edge may lie from what is drawn on it (m): the
 *  play between a lumpy shape and a square cell. Under the hero's radius
 *  (0.45 m), so he is never stopped by thin air he can see through. */
export const COVER_TOL = 0.3

/** The points of a cell (i, j) that must be covered: 4 × 4 across it. */
export const cellSamples = (i: number, j: number, cell: number): Array<[number, number]> => {
  const out: Array<[number, number]> = []
  for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) out.push([(i + (a + 0.5) / 4) * cell, (j + (b + 0.5) / 4) * cell])
  return out
}

/** A spatial index of placed footprints (buckets of `bucket` m). */
export class FootIndex {
  private map = new Map<number, Footed[]>()
  constructor(private bucket = 3) {}
  private key(x: number, z: number): number { return (Math.floor(x / this.bucket) + 2048) * 4096 + Math.floor(z / this.bucket) + 2048 }
  add(p: Footed): void {
    // Each footprint is filed under every bucket its grid reaches.
    const r = p.foot.half * p.sc
    for (let bz = Math.floor((p.z - r) / this.bucket); bz <= Math.floor((p.z + r) / this.bucket); bz++) {
      for (let bx = Math.floor((p.x - r) / this.bucket); bx <= Math.floor((p.x + r) / this.bucket); bx++) {
        const k = (bx + 2048) * 4096 + bz + 2048
        const list = this.map.get(k)
        if (list) list.push(p)
        else this.map.set(k, [p])
      }
    }
  }
  /** Is the point within `tol` of anything drawn? */
  covered(x: number, z: number, tol = COVER_TOL): boolean {
    const list = this.map.get(this.key(x, z))
    if (!list) return false
    for (const p of list) if (footedDist(p, x, z) <= tol) return true
    return false
  }
}
