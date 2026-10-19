import { CELL } from './grid'
import { K_BLOCK, K_BRIDGE, K_CLIFF, K_FORD, K_GROUND, K_RAMP, K_WATER, type CrossingPlan } from './zoneFeatures'

/**
 * ─── A way wide enough to everything ─────────────────────────────────────────
 *
 * The layouts cut their main road wide, but a side place (a cave, a nook, a
 * lagoon's island, a ledge's chest, a branch's dead end, a cage, the gap
 * between two set pieces) could be reached through a single cell: 1.5 m of
 * grass between two walls of scenery, which reads as a gap, not a way, and
 * catches a hero who is half a step off its middle.
 *
 * So, after everything is placed (and before the relief is raised), every
 * place one goes to gets a way from the start that is TWO cells across all
 * the way: a square of 2 × 2 cells walks there, one cell at a time and edge
 * to edge (a step across a corner would pinch the way to one cell's
 * diagonal). Every point of such a way is at least a cell from anything
 * blocked, so it is `WAY_W` = 3 m wide everywhere.
 *
 * Where the cheapest such way is blocked it is opened, dearest last: rock is
 * cut back (the scenery is laid from the cells afterwards, so it lines the
 * new edge); water gets stepping stones; a ledge's cliff becomes ramp; a set
 * piece in the way is left out. Level props (chests, posts, ore) and the
 * grid's own rim never move. Rock cut beside a sealed pocket belongs to that
 * pocket: it stays rock until the door opens.
 *
 * Pure: it edits the plan's arrays in place.
 */

/** How wide the way to everything is (m): two cells, every point a cell from anything blocked. */
export const WAY_W = 2 * CELL

export interface WidenCtx {
  w: number
  h: number
  solid: Uint8Array
  kind: Uint8Array
  sealed: Uint8Array
  /** Built wall (`masonry`): cut with the rock it stands on. */
  masonry?: Uint8Array
  /** The doors' cell lists: rock cut into a pocket joins its door. */
  doors?: Array<{ cells: number[] }>
  /** The set pieces (`dressing`): one in the way is left out. */
  pieces?: Array<{ cells: number[] }>
  /** The crossings: stepping stones laid are a ford of their own. */
  crossings?: CrossingPlan[]
  /** Cells whose rock round them stays (ore stands against its stone). */
  anchored?: readonly number[]
}

/** A place to reach (metres). The way runs onto its cell or up beside it: a
 *  chest's or an ore's spot is often a nook one cell deep, a post's own cell
 *  is blocked. */
export interface Target { x: number; z: number }

/** Cells kept as they are round the grid's edge (its outside is solid nobody drew). */
const EDGE = 2
/** What opening a cell costs, against a step's 1: the way keeps to open ground where it can. */
const COST_ROCK = 6
const COST_WATER = 14
const COST_CLIFF = 16
const COST_PIECE = 20

/** Widen the ways from `start` to each target. Returns how many cells were opened. */
export const widenWays = (c: WidenCtx, start: { x: number; z: number }, targets: readonly Target[]): number => {
  const { w, h, solid, kind, sealed } = c
  const n = w * h
  const piece = new Int32Array(n).fill(-1)
  c.pieces?.forEach((p, q) => { for (const k of p.cells) piece[k] = q })
  const inner = (k: number): boolean => {
    const i = k % w
    const j = (k - i) / w
    return i >= EDGE && j >= EDGE && i < w - EDGE && j < h - EDGE
  }
  const open = (k: number, doors: boolean): boolean =>
    !solid[k] && kind[k] !== K_WATER && kind[k] !== K_BLOCK && kind[k] !== K_CLIFF && (doors || !sealed[k])
  /** What opening a blocked cell costs (-1: it never opens). */
  // Rock beside water or ore stays: a way cut round the end of a lava tongue
  // would make its stepping stones pointless, and ore stands against its stone.
  const keepRock = new Uint8Array(n)
  const anchored = new Uint8Array(n)
  for (const k of c.anchored ?? []) anchored[k] = 1
  for (let k = 0; k < n; k++) {
    if (kind[k] !== K_WATER && !anchored[k]) continue
    const i = k % w
    const j = (k - i) / w
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ni = i + di
      const nj = j + dj
      if (ni >= 0 && nj >= 0 && ni < w && nj < h) keepRock[nj * w + ni] = 1
    }
  }
  // Except at a crossing's foot: one is on the stones there anyway, and a
  // lagoon's narrow neck may be cut back to make room for them.
  for (let k = 0; k < n; k++) {
    if (kind[k] !== K_FORD && kind[k] !== K_BRIDGE) continue
    const i = k % w
    const j = (k - i) / w
    for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) {
      const ni = i + di
      const nj = j + dj
      const q = nj * w + ni
      if (ni >= 0 && nj >= 0 && ni < w && nj < h && !anchored[q]) {
        let byOre = false
        for (const a of c.anchored ?? []) if (Math.abs((a % w) - ni) <= 1 && Math.abs(Math.floor(a / w) - nj) <= 1) { byOre = true; break }
        if (!byOre) keepRock[q] = 0
      }
    }
  }
  const openCost = (k: number): number => {
    if (!inner(k) || sealed[k]) return -1
    if (solid[k]) return kind[k] === K_GROUND && !keepRock[k] ? COST_ROCK : -1
    if (kind[k] === K_WATER) return COST_WATER
    if (kind[k] === K_CLIFF) return COST_CLIFF
    if (kind[k] === K_BLOCK && piece[k]! >= 0) return COST_PIECE
    return -1
  }
  // A square is named by its top-left cell; its cost to stand on is what it would open.
  const sq = (s: number): [number, number, number, number] => [s, s + 1, s + w, s + w + 1]
  const standCost = (s: number, doors: boolean): number => {
    const i = s % w
    const j = (s - i) / w
    if (i < 0 || j < 0 || i >= w - 1 || j >= h - 1) return -1
    let cost = 0
    for (const k of sq(s)) {
      if (open(k, doors)) continue
      const v = openCost(k)
      if (v < 0) return -1
      cost += v
    }
    return cost
  }
  const g = new Float32Array(n)
  const came = new Int32Array(n)
  const heap: number[] = []
  const hc: number[] = []
  const push = (s: number, v: number): void => {
    heap.push(s); hc.push(v)
    let q = heap.length - 1
    while (q > 0) {
      const p = (q - 1) >> 1
      if (hc[p]! <= hc[q]!) break
      ;[heap[p], heap[q]] = [heap[q]!, heap[p]!]
      ;[hc[p], hc[q]] = [hc[q]!, hc[p]!]
      q = p
    }
  }
  const pop = (): number => {
    const top = heap[0]!
    const ls = heap.pop()!
    const lc = hc.pop()!
    if (heap.length) {
      heap[0] = ls; hc[0] = lc
      let q = 0
      for (;;) {
        const a = q * 2 + 1
        const b = a + 1
        let m = q
        if (a < heap.length && hc[a]! < hc[m]!) m = a
        if (b < heap.length && hc[b]! < hc[m]!) m = b
        if (m === q) break
        ;[heap[m], heap[q]] = [heap[q]!, heap[m]!]
        ;[hc[m], hc[q]] = [hc[q]!, hc[m]!]
        q = m
      }
    }
    return top
  }
  const ci = (v: number): number => Math.floor(v / CELL)
  const s0i = ci(start.x)
  const s0j = ci(start.z)
  /** Dijkstra over squares from those that hold the start's cell to the first that `reaches`. */
  const search = (doors: boolean, reaches: (s: number) => boolean): number => {
    g.fill(Infinity)
    came.fill(-1)
    heap.length = 0
    hc.length = 0
    for (const [di, dj] of [[0, 0], [-1, 0], [0, -1], [-1, -1]] as const) {
      if (s0i + di < 0 || s0j + dj < 0) continue
      const s = (s0j + dj) * w + s0i + di
      const v = standCost(s, doors)
      if (v < 0) continue
      g[s] = v
      came[s] = s
      push(s, v)
    }
    while (heap.length) {
      const v0 = hc[0]!
      const s = pop()
      if (v0 > g[s]!) continue
      if (reaches(s)) return s
      const i = s % w
      const j = (s - i) / w
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const ni = i + di
        const nj = j + dj
        if (ni < 0 || nj < 0 || ni >= w - 1 || nj >= h - 1) continue
        const q = nj * w + ni
        const sc = standCost(q, doors)
        if (sc < 0) continue
        const v = g[s]! + 1 + sc
        if (v < g[q]!) {
          g[q] = v
          came[q] = s
          push(q, v)
        }
      }
    }
    return -1
  }
  let opened = 0
  const ford: number[] = []
  const dropped = new Set<number>()
  const openCell = (k: number, door: number): void => {
    if (solid[k]) {
      solid[k] = 0
      if (c.masonry) c.masonry[k] = 0
      if (door) {
        sealed[k] = door
        c.doors?.[door - 1]?.cells.push(k)
      }
    } else if (kind[k] === K_WATER) {
      kind[k] = K_FORD
      ford.push(k)
    } else if (kind[k] === K_CLIFF) kind[k] = K_RAMP
    else if (kind[k] === K_BLOCK && piece[k]! >= 0) {
      const q = piece[k]!
      dropped.add(q)
      for (const kk of c.pieces![q]!.cells) { kind[kk] = K_GROUND; piece[kk] = -1 }
    }
    opened++
  }
  for (const t of targets) {
    const ti = ci(t.x)
    const tj = ci(t.z)
    if (ti < 0 || tj < 0 || ti >= w || tj >= h) continue
    // A square that reaches the target: holds its cell, or shares an edge with it.
    const reaches = (s: number): boolean => {
      const i = s % w
      const j = (s - i) / w
      return (ti >= i && ti <= i + 1 && tj >= j - 1 && tj <= j + 2) || (tj >= j && tj <= j + 1 && ti >= i - 1 && ti <= i + 2)
    }
    // Shut doors first; through them only for what lies behind one.
    let goal = -1
    let doors = false
    for (const d of [false, true]) {
      doors = d
      goal = search(d, reaches)
      if (goal >= 0) break
    }
    if (goal < 0) continue
    for (let s = goal; ; s = came[s]!) {
      // A square that overlaps a pocket opens its rock into the pocket.
      let door = 0
      for (const k of sq(s)) if (sealed[k]) door = sealed[k]!
      for (const k of sq(s)) if (!open(k, doors)) openCell(k, door)
      if (came[s] === s) break
    }
  }
  if (ford.length && c.crossings) {
    let i0 = w; let i1 = 0; let j0 = h; let j1 = 0
    for (const k of ford) {
      const i = k % w
      const j = (k - i) / w
      i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j)
    }
    c.crossings.push({ kind: 'ford', cells: ford, x: ((i0 + i1 + 1) / 2) * CELL, z: ((j0 + j1 + 1) / 2) * CELL, i0, i1, j0, j1 })
  }
  if (dropped.size && c.pieces) {
    const keep = c.pieces.filter((_, q) => !dropped.has(q))
    c.pieces.length = 0
    c.pieces.push(...keep)
  }
  return opened
}
