/**
 * ─── The world map's drawing board ───────────────────────────────────────────
 *
 * The map is drawn in ONE space: a 1600 × 900 sheet (16:9, the shape of the
 * painted plate that may replace the terrain). `MAP[].at` in
 * `game/data/zones.ts` are fractions of it. Everything here is plain geometry:
 * no DOM, no Vue, so the terrain, the roads and the hero's walk can be tested
 * and the art bench can bake the same drawing.
 */

export const MAP_W = 1600
export const MAP_H = 900

export type Pt = readonly [number, number]

/** The ink every map drawing is outlined in: the interface's ink, warmed. */
export const INK = '#2a1c30'

export const r1 = (v: number): number => Math.round(v * 10) / 10

/** A small seeded generator (mulberry32): the same map on every device. */
export const seeded = (seed: number): (() => number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The four control points of the Catmull-Rom segment `i` → `i + 1`. */
const segment = (pts: readonly Pt[], i: number, closed: boolean): [Pt, Pt, Pt, Pt] => {
  const n = pts.length
  const at = (k: number): Pt => (closed ? pts[((k % n) + n) % n]! : pts[Math.max(0, Math.min(n - 1, k))]!)
  const p0 = at(i - 1)
  const p1 = at(i)
  const p2 = at(i + 1)
  const p3 = at(i + 2)
  return [p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]
}

/** A smooth curve through every point, as an SVG path. */
export const spline = (pts: readonly Pt[], closed = false): string => {
  if (pts.length < 2) return ''
  const last = closed ? pts.length : pts.length - 1
  let d = `M${r1(pts[0]![0])} ${r1(pts[0]![1])}`
  for (let i = 0; i < last; i++) {
    const [, c1, c2, p] = segment(pts, i, closed)
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p[0])} ${r1(p[1])}`
  }
  return closed ? d + 'Z' : d
}

/** The same curve as a polyline, `per` steps to a segment. */
export const sampleSpline = (pts: readonly Pt[], closed = false, per = 12): Pt[] => {
  if (pts.length < 2) return [...pts]
  const out: Pt[] = [pts[0]!]
  const last = closed ? pts.length : pts.length - 1
  for (let i = 0; i < last; i++) {
    const [a, b, c, d] = segment(pts, i, closed)
    for (let k = 1; k <= per; k++) {
      const t = k / per
      const u = 1 - t
      out.push([
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]
      ])
    }
  }
  return out
}

export const inPoly = (p: Pt, poly: readonly Pt[]): boolean => {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!
    const b = poly[j]!
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside
  }
  return inside
}

/** Distance from a point to a polyline. */
export const distToLine = (p: Pt, line: readonly Pt[]): number => {
  let best = Infinity
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i]!
    const b = line[i + 1]!
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const l2 = dx * dx + dy * dy
    const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0
    const d = Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t)
    if (d < best) best = d
  }
  return best
}

/** The running length of a polyline at each of its points. */
export const lengths = (line: readonly Pt[]): number[] => {
  const out = [0]
  for (let i = 1; i < line.length; i++) out.push(out[i - 1]! + Math.hypot(line[i]![0] - line[i - 1]![0], line[i]![1] - line[i - 1]![1]))
  return out
}

/** The point a share `t` (0..1) of the way along a polyline. */
export const pointAlong = (line: readonly Pt[], cum: readonly number[], t: number): Pt => {
  if (!line.length) return [0, 0]
  const want = Math.max(0, Math.min(1, t)) * (cum[cum.length - 1] ?? 0)
  let i = 1
  while (i < line.length - 1 && cum[i]! < want) i++
  const a = line[i - 1] ?? line[0]!
  const b = line[i] ?? a
  const span = (cum[i] ?? 0) - (cum[i - 1] ?? 0)
  const k = span > 0 ? (want - cum[i - 1]!) / span : 0
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]
}

/** `#rrggbb` → mixed toward another colour by `k` (0..1). */
export const mix = (hex: string, to: string, k: number): string => {
  const ch = (h: string, i: number): number => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  const out = [0, 1, 2].map(i => Math.round(ch(hex, i) + (ch(to, i) - ch(hex, i)) * k))
  return '#' + out.map(v => v.toString(16).padStart(2, '0')).join('')
}
