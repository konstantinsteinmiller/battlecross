import { CELL, isSolidAt, nearestOpen, type Grid } from './grid'
import { PICK_REACH } from './herbs'
import { KEY_DROP_T } from './camp'
import { openDoor } from './interact'
import type { DoorPlan } from './zoneFeatures'
import type { Sim } from './world'

/**
 * ─── The palisade gate (the first visit, #194) ───────────────────────────────
 *
 * The first level's last pack before the boss (four, after the plates) keeps a silver key: the last of them to fall lets it
 * drop. A small wooden palisade across the road walls the boss's floor off, so the two packs never meet and a new player
 * does not walk north into the boss before the fight with the pack is won; the key opens it (the hero stands at the gate with
 * the key and the palisade lowers). The camp's cage keeps its own key, the boss's (`camp.ts`).
 */

/** How far from the gate the hero opens it, metres. */
export const GATE_REACH = 3.2

/** What the plan says: the gate's door, the pack whose fall drops the key, where the gate stands. */
export interface GatePlan {
  door: number
  /** The index of the pack (= its group id) that holds the key. */
  pack: number
  x: number
  z: number
}

/** The gate in the world. `drop`: seconds since the key fell (-1: not yet). */
export interface GateState {
  door: number
  group: number
  x: number
  z: number
  /** Where to stand to open it: on the pack's side, just clear of the wall. */
  fx: number
  fz: number
  key: { x: number; z: number; taken: boolean; drop: number }
  opened: boolean
}

export const armGate = (plan: GatePlan | undefined, pack: { x: number; z: number } | undefined, grid: Grid): GateState | null => {
  if (!plan) return null
  // From the wall's middle toward the pack until the ground is open, and a step more: where the hero stands to open it.
  let fx = plan.x
  let fz = plan.z
  if (pack) {
    const d = Math.hypot(pack.x - plan.x, pack.z - plan.z) || 1
    const ux = (pack.x - plan.x) / d
    const uz = (pack.z - plan.z) / d
    for (let t = 0; t < d; t += 0.4) {
      if (!isSolidAt(grid, plan.x + ux * t, plan.z + uz * t)) { fx = plan.x + ux * (t + 0.8); fz = plan.z + uz * (t + 0.8); break }
    }
  }
  return { door: plan.door, group: plan.pack, x: plan.x, z: plan.z, fx, fz, key: { x: plan.x, z: plan.z, taken: false, drop: -1 }, opened: false }
}

interface Cut {
  w: number
  h: number
  solid: Uint8Array
  sealed: Uint8Array
}

/**
 * Where to wall the road between two clearings: a local cross-section of the way (the open cells at one step-count from the
 * boss's middle, near the road), two or three layers deep so that no step slips through diagonally. The narrowest wall that
 * really cuts the road (a walk from the pack's middle to the boss's, diagonals included, finds no way round) is sealed as door
 * `id`. Null where the road has no such place.
 */
export const placeGate = (c: Cut, id: number, boss: { x: number; z: number; r: number }, prev: { x: number; z: number; r: number }): DoorPlan | null => {
  const { w, h, solid, sealed } = c
  const open = (k: number): boolean => !solid[k] && !sealed[k]
  const cellOf = (x: number, z: number): number => Math.min(h - 1, Math.max(0, Math.floor(z / CELL))) * w + Math.min(w - 1, Math.max(0, Math.floor(x / CELL)))
  const from = cellOf(boss.x, boss.z)
  const to = cellOf(prev.x, prev.z)
  if (!open(from) || !open(to)) return null
  const dist = new Int32Array(w * h).fill(-1)
  const queue: number[] = [from]
  dist[from] = 0
  for (let q = 0; q < queue.length; q++) {
    const k = queue[q]!
    const i = k % w
    for (const n of [i > 0 ? k - 1 : -1, i < w - 1 ? k + 1 : -1, k >= w ? k - w : -1, k < w * (h - 1) ? k + w : -1]) {
      if (n < 0 || dist[n]! >= 0 || !open(n)) continue
      dist[n] = dist[k]! + 1
      queue.push(n)
    }
  }
  const dTo = dist[to]!
  if (dTo < 0) return null
  // The road itself: from the pack's middle, always to a cell one step nearer the boss.
  const road: number[] = [to]
  for (let k = to; dist[k]! > 0;) {
    const i = k % w
    let nxt = -1
    for (const n of [i > 0 ? k - 1 : -1, i < w - 1 ? k + 1 : -1, k >= w ? k - w : -1, k < w * (h - 1) ? k + w : -1]) if (n >= 0 && dist[n]! === dist[k]! - 1) { nxt = n; break }
    if (nxt < 0) break
    road.push(nxt)
    k = nxt
  }
  const roadAt = new Map<number, number>()
  for (const k of road) roadAt.set(dist[k]!, k)
  // A wall of `cells` cuts the road if no walk from the pack to the boss gets round it.
  const cuts = (wall: Set<number>): boolean => {
    const seen = new Uint8Array(w * h)
    const stack = [to]
    seen[to] = 1
    while (stack.length) {
      const k = stack.pop()!
      const i = k % w
      const j = (k - i) / w
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const ni = i + di
          const nj = j + dj
          if ((!di && !dj) || ni < 0 || nj < 0 || ni >= w || nj >= h) continue
          const n = nj * w + ni
          if (seen[n] || !open(n) || wall.has(n)) continue
          // A diagonal step needs both of its sides open, as the walkers' grid has it.
          if (di && dj && (!open(j * w + ni) || !open(nj * w + i))) continue
          if (n === from) return false
          seen[n] = 1
          stack.push(n)
        }
      }
    }
    return true
  }
  // The clearings are discs that nearly touch: the road's narrow place is the neck between them.
  const lo = Math.max(2, Math.floor((boss.r * 0.5) / CELL))
  const hi = dTo - Math.max(2, Math.floor((prev.r * 0.5) / CELL)) - 3
  const REACH = 7
  let best: { cells: number[]; d: number; n: number } | null = null
  for (let d = lo; d <= hi; d++) {
    const centre = roadAt.get(d)
    if (centre === undefined) continue
    const ci = centre % w
    const cj = (centre - ci) / w
    for (let depth = 2; depth <= 4; depth++) {
      const cells: number[] = []
      for (let k = 0; k < dist.length; k++) {
        const dk = dist[k]!
        if (dk < d || dk >= d + depth) continue
        if (Math.abs((k % w) - ci) > REACH || Math.abs(Math.floor(k / w) - cj) > REACH) continue
        cells.push(k)
      }
      if (cells.length > 40 || !cuts(new Set(cells))) continue
      const score = cells.length + Math.abs(d - (lo + hi) / 2) * 0.01
      if (!best || score < best.n) best = { cells, d, n: score }
      break
    }
  }
  if (!best) return null
  for (const k of best.cells) sealed[k] = id + 1
  // Where the wall opens: the road's own cell in the middle of it.
  const mid = roadAt.get(best.d + 1) ?? roadAt.get(best.d)!
  return { id, cells: best.cells, x: ((mid % w) + 0.5) * CELL, z: (Math.floor(mid / w) + 0.5) * CELL, style: 'palisade' }
}

/** Each step: the key falls when its pack is down, is picked up, and the gate opens for whoever carries it. */
export const stepGate = (sim: Sim, dt: number): void => {
  const g = sim.gate
  if (!g || g.opened || !sim.hero) return
  const k = g.key
  const u = sim.hero.unit
  if (k.drop < 0) {
    const grp = sim.groups[g.group]
    if (!grp?.cleared) return
    // Where the last of the pack fell, else the gate's side of the road.
    let x = g.x
    let z = g.z
    let last = -1
    for (const q of sim.units) if (q.group === g.group && !q.alive && q.id > last) { last = q.id; x = q.x; z = q.z }
    const out: [number, number] = [x, z]
    if (nearestOpen(sim.grid, x, z, out, 4)) { x = out[0]; z = out[1] }
    k.x = x
    k.z = z
    k.drop = 0
    sim.emit({ t: 'cageKeyDrop', x, z, gate: true })
    return
  }
  if (k.drop < KEY_DROP_T) k.drop = Math.min(KEY_DROP_T, k.drop + dt)
  if (!u.alive) return
  if (!k.taken && k.drop >= KEY_DROP_T && Math.hypot(k.x - u.x, k.z - u.z) <= PICK_REACH) {
    k.taken = true
    sim.emit({ t: 'cageKey', x: k.x, z: k.z, gate: true })
  }
  if (k.taken && Math.hypot(g.fx - u.x, g.fz - u.z) <= GATE_REACH) {
    g.opened = true
    openDoor(sim, g.door)
  }
}

/** Where the hero should go for the gate: the key where it lies, then the gate. Null: nothing yet, or already open. */
export const gateGoal = (sim: Sim): { x: number; z: number } | null => {
  const g = sim.gate
  if (!g || g.opened || g.key.drop < 0) return null
  return g.key.taken ? { x: g.fx, z: g.fz } : { x: g.key.x, z: g.key.z }
}
