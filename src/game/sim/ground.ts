import { CELL } from './grid'

/**
 * ─── The height of the ground (roadmap #57) ──────────────────────────────────
 *
 * A zone's ground is a height at every CORNER of the walk grid, (w + 1) ×
 * (h + 1) of them, and between corners it is bilinear: one smooth surface the
 * view draws and every body, mark and effect stands on. Past the grid the
 * edge's heights carry on.
 *
 * Height is the look of the land, not a rule of the fight: no high ground, no
 * fall. The one thing it changes is where a body can walk, and that is not
 * read from here at all: a ledge's cliff edge is a cell of its own kind in the
 * plan (`K_CLIFF`), which the walk grid already keeps everybody out of.
 *
 * Pure and cheap: four array reads, called per unit and per effect per frame.
 */

export interface HeightField {
  /** The grid's size in cells; the field holds (w + 1) × (h + 1) corners. */
  w: number
  h: number
  height: Float32Array
}

/** A field that is flat everywhere (a place without relief). */
export const flatField = (w: number, h: number): HeightField => ({ w, h, height: new Float32Array((w + 1) * (h + 1)) })

/** The ground's height at a point (metres), bilinear between grid corners. */
export const groundY = (f: HeightField, x: number, z: number): number => {
  const W = f.w
  const Hh = f.h
  let fx = x / CELL
  let fz = z / CELL
  if (fx < 0) fx = 0
  else if (fx > W) fx = W
  if (fz < 0) fz = 0
  else if (fz > Hh) fz = Hh
  let i = fx | 0
  let j = fz | 0
  if (i >= W) i = W - 1
  if (j >= Hh) j = Hh - 1
  const u = fx - i
  const v = fz - j
  const H = f.height
  const k = j * (W + 1) + i
  const a = H[k]!
  const b = H[k + 1]!
  const c = H[k + W + 1]!
  const d = H[k + W + 2]!
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

/** The ground's slope at a point: metres of rise per metre along x and z. */
export const groundSlope = (f: HeightField, x: number, z: number, out: [number, number], step = 0.5): [number, number] => {
  out[0] = (groundY(f, x + step, z) - groundY(f, x - step, z)) / (2 * step)
  out[1] = (groundY(f, x, z + step) - groundY(f, x, z - step)) / (2 * step)
  return out
}

// ─── Value noise (the rolling of the land) ──────────────────────────────────

const hash = (x: number, y: number, seed: number): number => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** Smooth value noise in 0..1. */
export const valueNoise = (x: number, y: number, seed: number): number => {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = x - xi
  const fy = y - yi
  const u = fx * fx * (3 - 2 * fx)
  const v = fy * fy * (3 - 2 * fy)
  const a = hash(xi, yi, seed)
  const b = hash(xi + 1, yi, seed)
  const c = hash(xi, yi + 1, seed)
  const d = hash(xi + 1, yi + 1, seed)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
