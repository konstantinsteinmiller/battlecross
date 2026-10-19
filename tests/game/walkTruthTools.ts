import { CELL, createGrid, type Grid } from '@/game/sim/grid'
import { fillGrid, type ZonePlan } from '@/game/sim/zoneGen'

/**
 * Tools for `walkTruth.test.ts`: the walk grid of a plan, the cells the hero
 * can touch, and the widest way from the start to a point.
 */

export const gridOf = (plan: ZonePlan, doorsOpen: boolean): Grid => fillGrid(createGrid(plan.w, plan.h), plan, doorsOpen)

/** Blocked cells with a walkable cell among their eight neighbours: the ones a body can touch. */
export const touchable = (g: Grid): number[] => {
  const out: number[] = []
  for (let j = 0; j < g.h; j++) {
    for (let i = 0; i < g.w; i++) {
      if (!g.solid[j * g.w + i]) continue
      let open = false
      for (let dj = -1; dj <= 1 && !open; dj++) {
        for (let di = -1; di <= 1; di++) {
          const ni = i + di
          const nj = j + dj
          if (ni >= 0 && nj >= 0 && ni < g.w && nj < g.h && !g.solid[nj * g.w + ni]) { open = true; break }
        }
      }
      if (open) out.push(j * g.w + i)
    }
  }
  return out
}

/** Fine samples per cell of the width field. */
const SUB = 5
/** Clearance is measured up to this (m): wider than any width asked for. */
const CAP = 3

export interface WidthField {
  /** Per fine point: the widest way's half-width (m) from the start to it (0: none). */
  best: Float32Array
  n: number
  m: number
  step: number
}

/**
 * The widest walk from the start: every fine point's clearance (its distance
 * to the nearest blocked cell, or the grid's edge), then a bottleneck flood —
 * a point's value is the largest clearance a way from the start can keep all
 * the way to it. A way of half-width r reaches the point iff its value ≥ r.
 * The way may begin anywhere within `from` of the start (a step from where
 * the hero stands: he may spawn beside a cliff).
 */
export const widthField = (g: Grid, sx: number, sz: number, from: number): WidthField => {
  const step = CELL / SUB
  const n = g.w * SUB
  const m = g.h * SUB
  const clear = new Float32Array(n * m)
  const blocked = (i: number, j: number): boolean => i < 0 || j < 0 || i >= g.w || j >= g.h || g.solid[j * g.w + i] !== 0
  const R = Math.ceil(CAP / CELL)
  for (let pj = 0; pj < m; pj++) {
    for (let pi = 0; pi < n; pi++) {
      const x = (pi + 0.5) * step
      const z = (pj + 0.5) * step
      const ci = Math.floor(x / CELL)
      const cj = Math.floor(z / CELL)
      if (blocked(ci, cj)) continue
      let d = CAP
      for (let dj = -R; dj <= R; dj++) {
        for (let di = -R; di <= R; di++) {
          if (!blocked(ci + di, cj + dj)) continue
          const x0 = (ci + di) * CELL
          const z0 = (cj + dj) * CELL
          const dx = Math.max(x0 - x, 0, x - x0 - CELL)
          const dz = Math.max(z0 - z, 0, z - z0 - CELL)
          d = Math.min(d, Math.hypot(dx, dz))
        }
      }
      clear[pj * n + pi] = d
    }
  }
  // Bottleneck flood, in buckets of 1 cm from the widest down.
  const best = new Float32Array(n * m)
  const Q = Math.ceil(CAP * 100) + 1
  const buckets: number[][] = Array.from({ length: Q }, () => [])
  const r = Math.ceil(from / step)
  for (let dj = -r; dj <= r; dj++) {
    for (let di = -r; di <= r; di++) {
      const pi = Math.floor(sx / step) + di
      const pj = Math.floor(sz / step) + dj
      if (pi < 0 || pj < 0 || pi >= n || pj >= m) continue
      if (Math.hypot((pi + 0.5) * step - sx, (pj + 0.5) * step - sz) > from) continue
      const s = pj * n + pi
      best[s] = clear[s]!
      buckets[Math.floor(best[s]! * 100)]!.push(s)
    }
  }
  for (let b = Q - 1; b >= 0; b--) {
    const list = buckets[b]!
    while (list.length) {
      const k = list.pop()!
      const v = best[k]!
      if (Math.floor(v * 100) !== b) continue
      const pi = k % n
      const pj = (k - pi) / n
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const qi = pi + di
        const qj = pj + dj
        if (qi < 0 || qj < 0 || qi >= n || qj >= m) continue
        const q = qj * n + qi
        const nv = Math.min(v, clear[q]!)
        if (nv > best[q]!) {
          best[q] = nv
          buckets[Math.floor(nv * 100)]!.push(q)
        }
      }
    }
  }
  return { best, n, m, step }
}

/** The widest way's half-width (m) to anywhere within `reach` of (x, z). */
export const widthTo = (f: WidthField, x: number, z: number, reach: number): number => {
  let out = 0
  const r = Math.ceil(reach / f.step)
  const ci = Math.floor(x / f.step)
  const cj = Math.floor(z / f.step)
  for (let dj = -r; dj <= r; dj++) {
    for (let di = -r; di <= r; di++) {
      const i = ci + di
      const j = cj + dj
      if (i < 0 || j < 0 || i >= f.n || j >= f.m) continue
      if (Math.hypot((i + 0.5) * f.step - x, (j + 0.5) * f.step - z) > reach) continue
      out = Math.max(out, f.best[j * f.n + i]!)
    }
  }
  return out
}

/** Everything one goes to in a plan, named, with how close one must come (m). */
export const pointsOf = (plan: ZonePlan): Array<{ what: string; x: number; z: number; post: boolean }> => {
  const out: Array<{ what: string; x: number; z: number; post: boolean }> = []
  const add = (what: string, p: { x: number; z: number }, post = false): void => { out.push({ what, x: p.x, z: p.z, post }) }
  plan.packs.forEach((p, q) => add(p.finale ? 'finale' : `pack ${q}`, p))
  plan.optionalPacks.forEach((p, q) => add(`optional pack ${q}${p.boss ? ` (${p.boss})` : ''}`, p))
  plan.chests.forEach(c => add(`chest ${c.id} (${c.role})`, { x: c.sx, z: c.sz }))
  plan.plates.forEach(p => add(`plate ${p.id}`, p))
  if (plan.puzzle) add('hint stone', plan.puzzle.hint, true)
  plan.caves.forEach((c, q) => { add(`cave ${q} mouth`, c.mouth); add(`cave ${q}`, c) })
  plan.signs.forEach((s, q) => add(`skull sign ${q}`, s, true))
  plan.forks.forEach((s, q) => add(`fork sign ${q}`, s, true))
  plan.herbs?.forEach((s, q) => add(`herb ${q} (${s.kind})`, s))
  plan.ores?.forEach((s, q) => add(`ore ${q} (${s.kind})`, { x: s.sx, z: s.sz }))
  plan.pieces?.forEach(s => add(`map piece ${s.id}`, s))
  if (plan.cageKey) add('cage key', plan.cageKey)
  if (plan.dummy) add('training dummy', plan.dummy, true)
  plan.npcs.forEach(s => add(`npc ${s.id}`, s, true))
  return out
}

/** How far (m) a point lies from a triangle seen from straight above (0: under it). */
export const triDist2 = (t: { ax: number; az: number; bx: number; bz: number; cx: number; cz: number }, x: number, z: number): number => {
  const d = (t.bx - t.ax) * (t.cz - t.az) - (t.bz - t.az) * (t.cx - t.ax)
  if (Math.abs(d) > 1e-12) {
    const w0 = ((t.bx - x) * (t.cz - z) - (t.bz - z) * (t.cx - x)) / d
    const w1 = ((t.cx - x) * (t.az - z) - (t.cz - z) * (t.ax - x)) / d
    if (w0 >= 0 && w1 >= 0 && 1 - w0 - w1 >= 0) return 0
  }
  const seg = (ax: number, az: number, bx: number, bz: number): number => {
    const dx = bx - ax
    const dz = bz - az
    const l = dx * dx + dz * dz
    const u = l > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)) : 0
    return Math.hypot(x - ax - dx * u, z - az - dz * u)
  }
  return Math.min(seg(t.ax, t.az, t.bx, t.bz), seg(t.bx, t.bz, t.cx, t.cz), seg(t.cx, t.cz, t.ax, t.az))
}

/** Points that must be covered over a disc collider: its middle and two rings. */
export const discSamples = (x: number, z: number, r: number): Array<[number, number]> => {
  const out: Array<[number, number]> = [[x, z]]
  for (let q = 0; q < 8; q++) out.push([x + Math.cos((q / 8) * Math.PI * 2) * r * 0.5, z + Math.sin((q / 8) * Math.PI * 2) * r * 0.5])
  for (let q = 0; q < 16; q++) out.push([x + Math.cos((q / 16) * Math.PI * 2) * r, z + Math.sin((q / 16) * Math.PI * 2) * r])
  return out
}

/** What level prop stands on a cell (for a message). */
export const owner = (plan: ZonePlan, k: number): string => {
  const at = (p: { x: number; z: number }): boolean => Math.floor(p.z / CELL) * plan.w + Math.floor(p.x / CELL) === k
  const c = plan.chests.find(at)
  if (c) return `chest (${c.role})`
  if (plan.signs.some(at)) return 'skull sign'
  if (plan.forks.some(at)) return 'fork sign'
  if (plan.puzzle && at(plan.puzzle.hint)) return 'hint stone'
  if ((plan.ores ?? []).some(at)) return 'ore'
  return 'unknown'
}
