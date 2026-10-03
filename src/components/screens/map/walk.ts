/**
 * ─── Where the hero may walk on the world map (roadmap #67) ──────────────────
 *
 * A grid over the sheet (`STEP` units a cell) built from the terrain's own
 * shapes, so the hero is stopped exactly where the picture shows it:
 *
 *   sea, the lake, rivers and the rift       blocked (a road crosses them: the
 *                                            bridges and the temple causeway)
 *   the Ironpeaks                            a mountain wall, walked only along
 *                                            its roads (the passes)
 *   the land of a place not open yet         blocked: the fog lies over it
 *   roads                                    walkable, and faster
 *
 * Whose land a cell is: the place nearest to it. A locked place's land is
 * fogged; walking toward it stops half way. Pure geometry: no DOM.
 */
import { MAP, type NodeId } from '@/game/data/zones'
import { MAP_H, MAP_W, distToLine, inPoly, type Pt } from './geo'
import { ROADS, nodeAt } from './roads'
import { TERRAIN_SHAPES } from './terrain'

/** Sheet units per cell. */
export const STEP = 10
export const GW = MAP_W / STEP
export const GH = MAP_H / STEP
/** The paper's margin and frame: never walked. */
const MARGIN = 38
/** A road's walkable half-width, and how far a mountain pass opens round it. */
const ROAD_HALF = 13
const PASS_HALF = 30
/** The bare site round every place: always walkable once the place is open. */
const SITE_R = 52

/** 0: blocked, 1: land, 2: road. */
export const BLOCKED = 0
export const LAND = 1
export const ROAD = 2

interface Base {
  ground: Uint8Array
  /** Index into `MAP` of the place whose land the cell is. */
  owner: Uint8Array
}

let base: Base | null = null

const ROAD_BOXES = ROADS.map(r => {
  let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity
  for (const p of r.line) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]) }
  return { line: r.line, x0: x0 - PASS_HALF, y0: y0 - PASS_HALF, x1: x1 + PASS_HALF, y1: y1 + PASS_HALF }
})

/** Distance from a point to the nearest road (only roads whose box is near). */
const roadDist = (p: Pt): number => {
  let best = Infinity
  for (const b of ROAD_BOXES) {
    if (p[0] < b.x0 || p[0] > b.x1 || p[1] < b.y0 || p[1] > b.y1) continue
    best = Math.min(best, distToLine(p, b.line))
  }
  return best
}

const SPOTS = MAP.map(n => nodeAt(n.id))

/** The terrain's own classes, once: what is land, road or water, and whose. */
const buildBase = (): Base => {
  const ground = new Uint8Array(GW * GH)
  const owner = new Uint8Array(GW * GH)
  const T = TERRAIN_SHAPES
  for (let j = 0; j < GH; j++) {
    for (let i = 0; i < GW; i++) {
      const k = j * GW + i
      const p: Pt = [(i + 0.5) * STEP, (j + 0.5) * STEP]
      let near = 0
      let nd = Infinity
      SPOTS.forEach((s, n) => { const d = Math.hypot(s[0] - p[0], s[1] - p[1]); if (d < nd) { nd = d; near = n } })
      owner[k] = near
      if (p[0] < MARGIN || p[1] < MARGIN || p[0] > MAP_W - MARGIN || p[1] > MAP_H - MARGIN) continue
      const land = inPoly(p, T.land)
      if (!land) continue
      const rd = roadDist(p)
      let g = LAND
      if (inPoly(p, T.lake) || inPoly(p, T.rift)) g = BLOCKED
      else if (T.rivers.some(r => distToLine(p, r.line) < r.w / 2 + 5)) g = BLOCKED
      else if (inPoly(p, T.regions.rock!) && rd > PASS_HALF) g = BLOCKED
      if (rd < ROAD_HALF) g = ROAD
      if (nd < SITE_R && g === BLOCKED) g = LAND
      ground[k] = g
    }
  }
  return { ground, owner }
}

const getBase = (): Base => (base ||= buildBase())

export interface WalkMask {
  /** Per cell: `BLOCKED`, `LAND` or `ROAD` for this save's open places. */
  cells: Uint8Array
  /** May the hero stand here? */
  ok(x: number, y: number): boolean
  /** Is this a road (the faster ground)? */
  road(x: number, y: number): boolean
  /** Whose land this is. */
  owner(x: number, y: number): NodeId
}

const cellOf = (x: number, y: number): number => {
  const i = Math.floor(x / STEP)
  const j = Math.floor(y / STEP)
  return i < 0 || j < 0 || i >= GW || j >= GH ? -1 : j * GW + i
}

/** The mask for a set of open places: their land walkable, the rest fogged. */
export const walkMask = (open: (id: NodeId) => boolean): WalkMask => {
  const b = getBase()
  const cells = new Uint8Array(GW * GH)
  const openAt = MAP.map(n => open(n.id))
  for (let k = 0; k < cells.length; k++) if (b.ground[k] && openAt[b.owner[k]!]) cells[k] = b.ground[k]!
  return {
    cells,
    ok: (x, y) => { const k = cellOf(x, y); return k >= 0 && cells[k]! !== BLOCKED },
    road: (x, y) => { const k = cellOf(x, y); return k >= 0 && cells[k]! === ROAD },
    owner: (x, y) => { const k = cellOf(x, y); return MAP[k >= 0 ? b.owner[k]! : 0]!.id }
  }
}

/** The fog: cells of land (or road) that belong to a place not open yet. */
export const fogCells = (open: (id: NodeId) => boolean): Uint8Array => {
  const b = getBase()
  const out = new Uint8Array(GW * GH)
  const T = TERRAIN_SHAPES
  for (let k = 0; k < out.length; k++) {
    if (open(MAP[b.owner[k]!]!.id)) continue
    const p: Pt = [((k % GW) + 0.5) * STEP, (Math.floor(k / GW) + 0.5) * STEP]
    // Over the land only (the sea is never fogged), the frame included.
    if (inPoly(p, T.land)) out[k] = 1
  }
  return out
}

/**
 * One step of walking from `p` by (`dx`, `dy`): the whole step if the ground
 * allows it, else along whichever axis does (the hero slides along a coast
 * instead of sticking to it), else nowhere.
 */
export const stepWalk = (m: WalkMask, p: Pt, dx: number, dy: number): Pt => {
  const fits = (x: number, y: number): boolean => m.ok(x, y) && m.ok(x + Math.sign(dx) * 3, y) && m.ok(x, y + Math.sign(dy) * 3)
  if (fits(p[0] + dx, p[1] + dy)) return [p[0] + dx, p[1] + dy]
  if (dx && fits(p[0] + dx, p[1])) return [p[0] + dx, p[1]]
  if (dy && fits(p[0], p[1] + dy)) return [p[0], p[1] + dy]
  return p
}

/** The walkable cell nearest a point (within `reach` cells), as its centre. */
export const nearestWalkable = (m: WalkMask, p: Pt, reach = 8): Pt | null => {
  const ci = Math.floor(p[0] / STEP)
  const cj = Math.floor(p[1] / STEP)
  if (m.ok(p[0], p[1])) return p
  let best: Pt | null = null
  let bd = Infinity
  for (let dj = -reach; dj <= reach; dj++) {
    for (let di = -reach; di <= reach; di++) {
      const i = ci + di
      const j = cj + dj
      if (i < 0 || j < 0 || i >= GW || j >= GH || !m.cells[j * GW + i]) continue
      const d = di * di + dj * dj
      if (d < bd) { bd = d; best = [(i + 0.5) * STEP, (j + 0.5) * STEP] }
    }
  }
  return best
}

/** Seconds a cell costs to cross, relative to open land. A road is quicker. */
export const ROAD_COST = 0.62

/**
 * The way from one spot to another over walkable ground: an A* over the cells
 * (eight ways, no cutting a blocked corner; roads cheaper, so a long way takes
 * the road the way a traveller would), then straightened where the ground
 * between two turns is all of one kind. Null: there is no way.
 */
export const findPath = (m: WalkMask, from: Pt, to: Pt): Pt[] | null => {
  const s = cellOf(from[0], from[1])
  const g = cellOf(to[0], to[1])
  if (s < 0 || g < 0 || !m.cells[g]) return null
  if (s === g) return [from, to]
  const N = GW * GH
  const cost = new Float32Array(N).fill(Infinity)
  const prev = new Int32Array(N).fill(-1)
  const done = new Uint8Array(N)
  const gi = g % GW
  const gj = Math.floor(g / GW)
  const h = (k: number): number => Math.hypot((k % GW) - gi, Math.floor(k / GW) - gj) * ROAD_COST
  // A binary heap of [f, cell].
  const heap: Array<[number, number]> = []
  const push = (f: number, k: number): void => {
    heap.push([f, k])
    let i = heap.length - 1
    while (i > 0) { const pa = (i - 1) >> 1; if (heap[pa]![0] <= heap[i]![0]) break; [heap[pa], heap[i]] = [heap[i]!, heap[pa]!]; i = pa }
  }
  const pop = (): number => {
    const top = heap[0]!
    const last = heap.pop()!
    if (heap.length) {
      heap[0] = last
      let i = 0
      for (;;) {
        const l = i * 2 + 1
        const r = l + 1
        let m2 = i
        if (l < heap.length && heap[l]![0] < heap[m2]![0]) m2 = l
        if (r < heap.length && heap[r]![0] < heap[m2]![0]) m2 = r
        if (m2 === i) break
        ;[heap[m2], heap[i]] = [heap[i]!, heap[m2]!]
        i = m2
      }
    }
    return top[1]
  }
  // The start may stand on a blocked cell's edge (a coast): it counts as open.
  cost[s] = 0
  push(h(s), s)
  while (heap.length) {
    const k = pop()
    if (done[k]) continue
    done[k] = 1
    if (k === g) break
    const i = k % GW
    const j = Math.floor(k / GW)
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue
        const ni = i + di
        const nj = j + dj
        if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue
        const n = nj * GW + ni
        if (!m.cells[n] || done[n]) continue
        // No slipping between two blocked cells on a diagonal.
        if (di && dj && (!m.cells[j * GW + ni] || !m.cells[nj * GW + i])) continue
        const step = (di && dj ? Math.SQRT2 : 1) * (m.cells[n] === ROAD ? ROAD_COST : 1)
        const c = cost[k]! + step
        if (c < cost[n]!) { cost[n] = c; prev[n] = k; push(c + h(n), n) }
      }
    }
  }
  if (prev[g]! < 0) return null
  const cells: number[] = []
  for (let k = g; k !== -1; k = prev[k]!) cells.unshift(k)
  const pts: Pt[] = cells.map(k => [((k % GW) + 0.5) * STEP, (Math.floor(k / GW) + 0.5) * STEP])
  pts[0] = from
  pts[pts.length - 1] = to
  return straighten(m, pts)
}

/** Can the hero walk straight from `a` to `b`, over ground of one kind (`kind`: 0 any)? */
const clear = (m: WalkMask, a: Pt, b: Pt, roadOnly: boolean): boolean => {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4))
  for (let s = 0; s <= n; s++) {
    const x = a[0] + ((b[0] - a[0]) * s) / n
    const y = a[1] + ((b[1] - a[1]) * s) / n
    if (!m.ok(x, y)) return false
    if (roadOnly && !m.road(x, y)) return false
  }
  return true
}

/** Drop the turns a straight line can do without: off a road anywhere, on a road only along it. */
const straighten = (m: WalkMask, pts: Pt[]): Pt[] => {
  const out: Pt[] = [pts[0]!]
  let i = 0
  while (i < pts.length - 1) {
    let j = pts.length - 1
    for (; j > i + 1; j--) {
      let road = false
      for (let k = i; k <= j && !road; k++) road = m.road(pts[k]![0], pts[k]![1])
      if (clear(m, pts[i]!, pts[j]!, road)) break
    }
    out.push(pts[j]!)
    i = j
  }
  return out
}
