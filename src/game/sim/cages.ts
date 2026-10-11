import { mulberry32 } from './rng'
import { centerOf } from './grid'
import { pickSpots, walkableFrom, type SpotPlan } from './herbs'
import { K_BLOCK, K_GROUND, type ChestPlan } from './zoneFeatures'
import type { Sim } from './world'

/**
 * ─── A cage and its key (roadmap #100, D125) ────────────────────────────────
 *
 * Laid last, on a stream of its own: the cage on open ground well along the
 * way (all eight neighbours open, so it stands free and is seen), the hero's
 * place to open it on the camera's side; the key somewhere else, at least
 * fourteen metres off. The cage is a chest (role `cage`) that a missing key
 * locks; the key is picked up by walking over it.
 */

const CAGE_SALT = 0x1f83d9ab

export interface CageKeyState {
  x: number
  z: number
  taken: boolean
}

/** Where the cage stands and where its key lies; null when the place has no room. */
export const placeCage = (
  p: SpotPlan & { seed: number },
  avoid: ReadonlyArray<{ x: number; z: number }>
): { chest: Omit<ChestPlan, 'id'>; key: { x: number; z: number } } | null => {
  const rng = mulberry32((p.seed ^ CAGE_SALT) >>> 0)
  const reach = walkableFrom(p.w, p.h, p.solid, p.sealed, p.start)
  const cand: number[] = []
  for (let j = 2; j < p.h - 3; j++) {
    for (let i = 2; i < p.w - 2; i++) {
      const k = j * p.w + i
      if (!reach[k] || p.kind[k] !== K_GROUND || p.trail[k]) continue
      let open = 0
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const nk = (j + dj) * p.w + i + di
        if (!p.solid[nk] && p.kind[nk] === K_GROUND) open++
      }
      if (open < 9) continue
      // The stand, a cell nearer the camera: open ground, off the road.
      const s = (j + 1) * p.w + i
      if (p.trail[s]) continue
      const x = centerOf(i)
      const z = centerOf(j)
      if (Math.hypot(x - p.start.x, z - p.start.z) < 24) continue
      if (p.chests.some(c => Math.hypot(c.x - x, c.z - z) < 6)) continue
      if (avoid.some(c => Math.hypot(c.x - x, c.z - z) < 4)) continue
      cand.push(k)
    }
  }
  if (!cand.length) return null
  const k = cand[Math.floor(rng() * cand.length)]!
  const i = k % p.w
  const j = (k - i) / p.w
  const x = centerOf(i)
  const z = centerOf(j)
  const keys = pickSpots(p, rng, 6, 4, [...avoid, { x, z }]).filter(s => Math.hypot(s.x - x, s.z - z) >= 14 && Math.hypot(s.x - p.start.x, s.z - p.start.z) >= 10)
  const key = keys[0]
  if (!key) return null
  p.kind[k] = K_BLOCK
  return { chest: { x, z, tier: 'iron', role: 'cage', sx: x, sz: centerOf(j + 1), door: -1, guard: -1 }, key }
}

/** The key lying in the place (null: no cage here). */
export const populateCage = (sim: Sim, key: { x: number; z: number } | undefined): void => {
  sim.cageKey = key ? { x: key.x, z: key.z, taken: false } : null
}
