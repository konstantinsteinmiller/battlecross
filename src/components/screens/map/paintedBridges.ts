/**
 * ─── Where the drawn roads cross the PAINTED water (roadmap #119) ────────────
 *
 * Over the painted sheet the roads are drawn on top of the painting, so a road
 * crosses whatever water the painting has under it: a river, the temple's
 * lake. Every such stretch gets a drawn plank bridge (the temple's is its
 * causeway), and the hero walks the water only there (`walk.ts`). Read off the
 * baked painting (`paintedGround.ts`). Pure geometry: no DOM.
 */
import { MAP_H, MAP_W, type Pt } from './geo'
import { PAINTED_GROUND } from './paintedGround'
import { ROADS } from './roads'
import type { Crossing } from './terrain'

/** Sheet units per cell of `PAINTED_GROUND` (the walk grid's `STEP`). */
const CELL = 10
/** How far along a road it is sampled (sheet units). */
const SAMPLE = 2
/** A bridge reaches this far onto either bank. */
const BANK = 8

export interface PaintedCrossing extends Crossing {
  /** The bridge's two ends, on the banks. */
  a: Pt
  b: Pt
  /** The road it carries (`Road.key`). */
  road: string
}

/** Is the painting water (or the rift's void) at this sheet point? */
export const paintedWater = (x: number, y: number): boolean => {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false
  const c = PAINTED_GROUND[Math.floor(y / CELL)]?.[Math.floor(x / CELL)]
  return c === '~' || c === 'x'
}

/** Points along a polyline, `SAMPLE` units apart. */
const samples = (line: readonly Pt[]): Pt[] => {
  const out: Pt[] = []
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!
    const b = line[i]!
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / SAMPLE))
    for (let s = i === 1 ? 0 : 1; s <= n; s++) out.push([a[0] + ((b[0] - a[0]) * s) / n, a[1] + ((b[1] - a[1]) * s) / n])
  }
  return out
}

let cached: PaintedCrossing[] | null = null

/** Every stretch of a road over painted water, one bridge each. */
export const paintedCrossings = (): PaintedCrossing[] => {
  if (cached) return cached
  const out: PaintedCrossing[] = []
  for (const r of ROADS) {
    const pts = samples(r.line)
    let i = 0
    while (i < pts.length) {
      if (!paintedWater(pts[i]![0], pts[i]![1])) { i++; continue }
      let j = i
      while (j + 1 < pts.length && paintedWater(pts[j + 1]![0], pts[j + 1]![1])) j++
      // Onto the banks (or the road's end, where a place stands in the water).
      const a = pts[Math.max(0, i - Math.ceil(BANK / SAMPLE))]!
      const b = pts[Math.min(pts.length - 1, j + Math.ceil(BANK / SAMPLE))]!
      const span = Math.hypot(b[0] - a[0], b[1] - a[1])
      out.push({
        p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
        angle: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI,
        span,
        a,
        b,
        road: r.key
      })
      i = j + 1
    }
  }
  return (cached = out)
}
