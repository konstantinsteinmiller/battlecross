import type { TownDef } from '../data/zones'
import { CELL } from './grid'
import { K_WATER, noFeatures } from './zoneFeatures'
import { buildTownRelief } from './relief'
import { layTown } from './town'
import { TC_DOOR, TC_FLOOR, TC_GRASS, TC_GROUND, TC_SQUARE, TC_STREET } from './townCells'
import type { ZonePlan } from './zoneGen'

/**
 * A town: rows of houses facing the camera along two streets, a square in the
 * middle, the green the road comes in by (`town.ts` lays it out and dresses
 * it). Its people are `npcs` (the cast) and `town.people` (everybody).
 */
export const generateTown = (def: TownDef, flags: ReadonlySet<string>, seed: number): ZonePlan => {
  const t = layTown(def, flags, seed)
  const { w, h } = t
  // Everyone's spot and every house stands level on the gentle slope.
  const level: Array<{ x: number; z: number }> = t.town.people.map(p => ({ x: p.x, z: p.z }))
  for (const s of t.town.spots) level.push({ x: s.x, z: s.z })
  for (const p of t.town.props) if (p.cells.length) level.push({ x: p.x, z: p.z })
  // A gentle slope, with every house and every townsperson on level ground.
  const height = buildTownRelief(w, h, seed, t.buildings, level)
  // A river under a bridge town (#103) lies level: every corner of its cells
  // at the lowest of them (the ground dips under the water by itself) — but
  // not a corner of ground somebody walks on: the parapet, a garden or the
  // water's own edge takes the fall.
  let wet = false
  for (let k = 0; k < w * h; k++) if (t.kind[k] === K_WATER) { wet = true; break }
  if (wet) {
    const W1 = w + 1
    const walked = (c: number): boolean => c === TC_GRASS || c === TC_STREET || c === TC_SQUARE || c === TC_GROUND || c === TC_FLOOR || c === TC_DOOR
    const touches = (ci: number, cj: number): boolean => {
      let wetHere = false
      for (let dj = -1; dj <= 0; dj++) for (let di = -1; di <= 0; di++) {
        const i = ci + di
        const j = cj + dj
        if (i < 0 || j < 0 || i >= w || j >= h) continue
        if (t.kind[j * w + i] === K_WATER) wetHere = true
        else if (walked(t.town.cell[j * w + i]!)) return false
      }
      return wetHere
    }
    let low = Infinity
    for (let cj = 0; cj <= h; cj++) for (let ci = 0; ci <= w; ci++) if (touches(ci, cj)) low = Math.min(low, height[cj * W1 + ci]!)
    for (let cj = 0; cj <= h; cj++) for (let ci = 0; ci <= w; ci++) if (touches(ci, cj)) height[cj * W1 + ci] = low
  }
  return {
    seed, w, h, solid: t.solid, trail: t.trail, kind: t.kind, cave: new Uint8Array(w * h), sealed: new Uint8Array(w * h),
    side: new Uint8Array(w * h),
    height,
    ...noFeatures(),
    ...(wet ? { liquid: 'water' as const } : {}),
    clearings: [{ x: (w / 2) * CELL, z: (h / 2) * CELL, r: Math.min(w, h) * 0.45 * CELL, role: 'start' }],
    start: t.start,
    packs: [],
    chest: null,
    secret: null,
    buildings: t.buildings,
    npcs: t.npcs,
    gates: [],
    town: t.town
  }
}
