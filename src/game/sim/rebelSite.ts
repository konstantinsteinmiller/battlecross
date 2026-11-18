import { REBEL_COUNT, REBEL_COUNT_MORE } from '../data/rebellion'
import { CELL, centerOf } from './grid'
import { mulberry32 } from './rng'
import { walkableFrom, type SpotPlan } from './herbs'
import { K_GROUND } from './zoneFeatures'

/**
 * ─── Where the chain gang stands (roadmap #205) ──────────────────────────────
 *
 * A few steps from a main pack (its overseers), on open ground well off the road: a ring of posts, a
 * gnome chained at each. Laid on a stream of its own, after everything else, so a seed's packs and
 * chests are exactly what they were.
 */

const REBEL_SALT = 0x3c6ef372

export interface RebelSite {
  /** The gang's middle. */
  x: number
  z: number
  /** One post per gnome, in a ring round the middle; the gnome stands just outside it. */
  posts: Array<{ x: number; z: number; a: number }>
  /** A second, smaller gang of its own (#215): its own ring, freed on its own. */
  more?: RebelSite
}

/** Radius of the post ring and how far outside it the gnome stands (m). */
export const RING_R = 1.5
export const GNOME_OUT = 0.75

/** The gnome that belongs to a post (just outside the ring on its ray). */
export const gnomeSpot = (s: RebelSite, q: number): { x: number; z: number } => {
  const p = s.posts[q]!
  return { x: s.x + Math.sin(p.a) * (RING_R + GNOME_OUT), z: s.z + Math.cos(p.a) * (RING_R + GNOME_OUT) }
}

export const placeRebels = (
  p: SpotPlan & { seed: number },
  pack: { x: number; z: number },
  avoid: ReadonlyArray<{ x: number; z: number }>,
  /** The smaller second gang: its own count and stream, and at least `apart` metres from the first's middle. */
  second?: { x: number; z: number; apart: number }
): RebelSite | null => {
  const count = second ? REBEL_COUNT_MORE : REBEL_COUNT
  const rng = mulberry32(((p.seed ^ REBEL_SALT) + (second ? 0x9e3779b1 : 0)) >>> 0)
  const reach = walkableFrom(p.w, p.h, p.solid, p.sealed, p.start)
  // The ring's heading is drawn first, so each candidate is judged on the very posts and gnomes it would hold.
  const a0 = rng() * Math.PI * 2
  const ang = (q: number): number => a0 + (q / count) * Math.PI * 2
  const cellOk = (x: number, z: number): boolean => {
    const i = Math.floor(x / CELL)
    const j = Math.floor(z / CELL)
    if (i < 1 || j < 1 || i >= p.w - 1 || j >= p.h - 1) return false
    const k = j * p.w + i
    return !p.solid[k] && !p.sealed[k] && p.kind[k] === K_GROUND && !!reach[k]
  }
  const fits = (x: number, z: number): boolean => {
    if (!cellOk(x, z) || p.trail[Math.floor(z / CELL) * p.w + Math.floor(x / CELL)]) return false
    for (let q = 0; q < count; q++) {
      for (const r of [RING_R, RING_R + GNOME_OUT, RING_R + GNOME_OUT + 0.4]) {
        if (!cellOk(x + Math.sin(ang(q)) * r, z + Math.cos(ang(q)) * r)) return false
      }
    }
    return true
  }
  let best: { x: number; z: number; score: number } | null = null
  for (let j = 3; j < p.h - 3; j++) {
    for (let i = 3; i < p.w - 3; i++) {
      const x = centerOf(i)
      const z = centerOf(j)
      const d = Math.hypot(x - pack.x, z - pack.z)
      if (d < 5.5 || d > 12) continue
      if (p.chests.some(c => Math.hypot(c.x - x, c.z - z) < 5)) continue
      if (avoid.some(c => Math.hypot(c.x - x, c.z - z) < 4)) continue
      if (second && Math.hypot(second.x - x, second.z - z) < second.apart) continue
      if (Math.hypot(x - p.start.x, z - p.start.z) < 12) continue
      if (!fits(x, z)) continue
      // Nearest to eight metres from the overseers, a little shuffled so two seeds differ.
      const score = Math.abs(d - 8) + rng() * 0.8
      if (!best || score < best.score) best = { x, z, score }
    }
  }
  if (!best) return null
  const posts = Array.from({ length: count }, (_, q) => ({
    x: best!.x + Math.sin(ang(q)) * RING_R,
    z: best!.z + Math.cos(ang(q)) * RING_R,
    a: ang(q)
  }))
  return { x: best.x, z: best.z, posts }
}
