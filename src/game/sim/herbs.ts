import { HERBS_MAX, HERBS_MIN, plantsOf, type PlantId } from '../data/plants'
import type { ThemeId } from '../data/zones'
import { CELL, cellOf, centerOf } from './grid'
import { mulberry32, type Rng } from './rng'
import type { Sim } from './world'
import { K_GROUND } from './zoneFeatures'

/**
 * ─── Things lying in the wild, picked up by walking over them (#88, #89) ─────
 *
 * Herbs (three or four a visit) and, later, the pieces of a treasure map.
 * They are laid on a stream of their own after everything else, so a seed's
 * packs, chests and paths are exactly what they were; and only where the hero
 * can walk to from the start, off the road a little (found, not tripped over),
 * apart from one another and from the chests.
 */

export interface HerbPlan {
  x: number
  z: number
  kind: PlantId
}

export interface HerbState extends HerbPlan {
  id: number
  taken: boolean
}

/** Walking this near picks one up (centre to centre). */
export const PICK_REACH = 1.05

const HERB_SALT = 0x6a09e667

/** The cells a hero can walk to from `start` (doors shut), as a mask. */
export const walkableFrom = (w: number, h: number, solid: Uint8Array, sealed: Uint8Array, start: { x: number; z: number }): Uint8Array => {
  const seen = new Uint8Array(w * h)
  const si = cellOf(start.x)
  const sj = cellOf(start.z)
  if (si < 0 || sj < 0 || si >= w || sj >= h) return seen
  const q: number[] = [sj * w + si]
  seen[sj * w + si] = 1
  while (q.length) {
    const k = q.pop()!
    const i = k % w
    const j = (k - i) / w
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue
        const ni = i + di
        const nj = j + dj
        if (ni < 0 || nj < 0 || ni >= w || nj >= h) continue
        const nk = nj * w + ni
        if (seen[nk] || solid[nk] || sealed[nk]) continue
        // No cutting a corner between two rocks (as A* walks).
        if (di && dj && (solid[j * w + ni] || solid[nj * w + i])) continue
        seen[nk] = 1
        q.push(nk)
      }
    }
  }
  return seen
}

export interface SpotPlan {
  w: number
  h: number
  solid: Uint8Array
  sealed: Uint8Array
  trail: Uint8Array
  kind: Uint8Array
  start: { x: number; z: number }
  chests: ReadonlyArray<{ x: number; z: number }>
}

/**
 * Up to `n` spots for things to lie on: reachable ground, off the road, a few
 * metres from the start, the chests and each other. Pure: the same plan and
 * stream give the same spots.
 */
export const pickSpots = (p: SpotPlan, rng: Rng, n: number, apart = 7, avoid: ReadonlyArray<{ x: number; z: number }> = []): Array<{ x: number; z: number }> => {
  const reach = walkableFrom(p.w, p.h, p.solid, p.sealed, p.start)
  const cand: number[] = []
  for (let j = 1; j < p.h - 1; j++) {
    for (let i = 1; i < p.w - 1; i++) {
      const k = j * p.w + i
      if (!reach[k] || p.kind[k] !== K_GROUND || p.trail[k]) continue
      // Room round it: a plant is not pressed into a wall.
      let open = 0
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (!p.solid[(j + dj) * p.w + i + di]) open++
      if (open < 7) continue
      const x = centerOf(i)
      const z = centerOf(j)
      if (Math.hypot(x - p.start.x, z - p.start.z) < 6) continue
      if (p.chests.some(c => Math.hypot(c.x - x, c.z - z) < 3)) continue
      cand.push(k)
    }
  }
  const out: Array<{ x: number; z: number }> = []
  for (let tries = 0; out.length < n && cand.length && tries < 400; tries++) {
    const k = cand[Math.floor(rng() * cand.length)]!
    const i = k % p.w
    const x = centerOf(i) + (rng() - 0.5) * CELL * 0.4
    const z = centerOf((k - i) / p.w) + (rng() - 0.5) * CELL * 0.4
    if (out.some(o => Math.hypot(o.x - x, o.z - z) < apart)) continue
    if (avoid.some(o => Math.hypot(o.x - x, o.z - z) < 3)) continue
    out.push({ x, z })
  }
  return out
}

/** The herbs a visit holds: 3–4 of what grows in this theme and level band. */
export const placeHerbs = (p: SpotPlan & { seed: number }, theme: ThemeId, level: number): HerbPlan[] => {
  const pool = plantsOf(theme, level)
  if (!pool.length) return []
  const rng = mulberry32((p.seed ^ HERB_SALT) >>> 0)
  const n = HERBS_MIN + Math.floor(rng() * (HERBS_MAX - HERBS_MIN + 1))
  const total = pool.reduce((s, q) => s + q.weight, 0)
  return pickSpots(p, rng, n).map(s => {
    let r = rng() * total
    let kind = pool[pool.length - 1]!.id
    for (const q of pool) {
      r -= q.weight
      if (r <= 0) { kind = q.id; break }
    }
    return { x: s.x, z: s.z, kind }
  })
}

/** Lay the visit's herbs in the sim. */
export const populateHerbs = (sim: Sim, herbs: readonly HerbPlan[]): void => {
  sim.herbs = herbs.map((h, id) => ({ ...h, id, taken: false }))
}

/** The hero walks over one: it is his (this step's pick-ups). */
export const stepPickups = (sim: Sim): void => {
  const h = sim.hero
  if (!h || !sim.herbs.length || !h.unit.alive) return
  const u = h.unit
  for (const p of sim.herbs) {
    if (p.taken || Math.hypot(p.x - u.x, p.z - u.z) > PICK_REACH) continue
    p.taken = true
    h.herbs[p.kind] = (h.herbs[p.kind] ?? 0) + 1
    sim.emit({ t: 'herb', id: p.id, kind: p.kind, x: p.x, z: p.z })
  }
}
