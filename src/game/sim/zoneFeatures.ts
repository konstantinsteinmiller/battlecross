import { ZONE_BRANCHES, ZONE_FEATURES, ZONE_RELIEF, type BranchStyle, type LiquidId, type ZoneDef } from '../data/zones'
import { ENEMY_BY_ID } from '../data/enemies'
import type { ChestTier } from '../data/loot'
import { CELL } from './grid'
import { mulberry32, type Rng } from './rng'

/**
 * ─── What a zone holds beside its packs (roadmap #54–#59) ────────────────────
 *
 * Chests off the road, optional corners with a guard or a champion, a pressure
 * plate puzzle with its hidden pocket, rivers and ponds to walk around, and
 * caves. All of it is laid over the finished chain of clearings by a SEPARATE
 * seeded stream, so the packs of a seed are exactly what they were before any
 * of this existed (the balance tests ride on that).
 *
 * A cell is described by parallel layers, one array each (`solid`, `trail`,
 * `kind`, `cave`, `sealed`): a height field for hills and ledges is one more
 * array beside them, not a rewrite.
 *
 * Every feature is laid in a TRANSACTION: it is drawn, the whole plan is
 * walked again from the start, and if anything that must be reachable is not
 * (a pack, a chest, a plate) the feature is taken back. So no seed can seal a
 * zone, however a river and a cave fall together.
 */

/** What stands on a cell (`ZonePlan.kind`). */
export const K_GROUND = 0
/** Water or lava: nobody stands in it; it is seen and shot over. */
export const K_WATER = 1
/** A bridge over water (walkable). */
export const K_BRIDGE = 2
/** Stepping stones through water (walkable). */
export const K_FORD = 3
/** A level prop stands here (a chest, a carved stone, a skull post): nobody
 *  walks through it, and the scenery leaves the cell alone. */
export const K_BLOCK = 4
/** A pressure plate (walkable). */
export const K_PLATE = 5
/** A ledge's cliff edge: the ground steps up here, so nobody walks across it.
 *  It is seen and shot over, like water. */
export const K_CLIFF = 6
/** The ramp up a ledge (walkable; worn, or built as steps). */
export const K_RAMP = 7

export type ChestRole = 'finale' | 'secret' | 'puzzle' | 'champion' | 'guard' | 'cave' | 'lagoon' | 'nook' | 'tutorial' | 'ledge'
  /** At the far end of a loop way, guarded by its pack (roadmap #70). */
  | 'bypass'
  /** Behind a branch boss, at the dead end of its way (roadmap #70). */
  | 'branch'

export interface ChestPlan {
  id: number
  x: number
  z: number
  tier: ChestTier
  role: ChestRole
  /** Where the hero stands to open it. */
  sx: number
  sz: number
  /** The door it is hidden behind (-1: in plain view). */
  door: number
  /** The optional pack that guards it (-1: nobody). */
  guard: number
}

export interface PlatePlan {
  id: number
  x: number
  z: number
  /** Which symbol and colour it carries (0..3). */
  symbol: number
}

export interface PuzzlePlan {
  /** Plate ids in the order they must be stepped on. */
  order: number[]
  /** The carved stone that shows the order. */
  hint: { x: number; z: number }
  /** The door the solved puzzle opens. */
  door: number
}

export interface DoorPlan {
  id: number
  /** Every sealed cell behind it (the passage and the pocket). */
  cells: number[]
  /** Where the wall opens. */
  x: number
  z: number
}

export interface OptionalPackPlan {
  x: number
  z: number
  r: number
  kinds: string[]
  /** Levels above the visit's own. */
  levelOffset: number
  /** The over-levelled optional elite (skulls by its path, a framed bar). */
  champion: boolean
  /** A branch boss leads it (its kind; roadmap #70). */
  boss?: string
  /** The branch it holds (`branches` index). */
  branch?: number
}

export interface CavePlan {
  /** The chamber. */
  x: number
  z: number
  r: number
  /** The rock arch, and the way in (radians, 0 faces +Z). */
  mouth: { x: number; z: number; a: number }
}

export interface RiverPlan {
  /** Centre row at column i: `riverRow(r, i)`. Cells within `half` rows of it are water. */
  j0: number
  amp: number
  fq: number
  ph: number
  half: number
}

export interface CrossingPlan {
  kind: 'bridge' | 'ford'
  cells: number[]
  /** Centre, and the cell box it spans. */
  x: number
  z: number
  i0: number
  i1: number
  j0: number
  j1: number
}

export interface SignPlan {
  x: number
  z: number
  /** Faces this way (radians). */
  a: number
}

/**
 * A ledge across part of a clearing: past the line `d0` metres out from the
 * clearing's centre along (ux, uz) the ground stands `step` metres higher,
 * and the line itself is a cliff edge, except for a ramp `half` metres either
 * side of `t0` (measured across the line), which climbs over `run` metres.
 */
export interface LedgePlan {
  /** The clearing's centre and radius (metres). */
  x: number
  z: number
  r: number
  ux: number
  uz: number
  d0: number
  t0: number
  half: number
  run: number
  step: number
  /** A cell on top that must be reachable (by the ramp). */
  probe: number
}

/** The raised floor a finale stands on: a plateau of radius `r`, sloping down to `rim`. */
export interface DaisPlan {
  x: number
  z: number
  r: number
  rim: number
  h: number
}

/** A side place off clearing `k` and how far above (or below) it it lies. */
export interface LobePlan {
  x: number
  z: number
  r: number
  k: number
  lift: number
}

/**
 * A way off the main road (roadmap #70). A `loop` forks off one main clearing
 * and rejoins the road at a later one, through a clearing of its own where a
 * pack waits by a chest: another route to the finale, over other ground. A
 * `boss` way is a dead end: an arena where a branch boss guards a gold chest.
 * Neither counts for the win.
 */
export interface BranchPlan {
  id: number
  kind: 'loop' | 'boss'
  /** The main clearing it forks off, and the one it rejoins (-1: a dead end). */
  from: number
  to: number
  /** Its own clearing (metres). */
  x: number
  z: number
  r: number
  /** The way's bends (metres): from the fork, through its clearing, to its end. */
  way: Array<{ x: number; z: number }>
  /** The optional pack that holds it (`optionalPacks` index). */
  pack: number
  /** The chest it pays (`chests` index; -1: none). */
  chest: number
  style: BranchStyle
}

/** A signpost where a branch leaves the road; its arm points down the way. */
export interface ForkPlan {
  x: number
  z: number
  /** The way's bearing (radians, 0 faces +Z). */
  a: number
  branch: number
  /** A boss waits down it (a skull on the arm). */
  boss: boolean
}

export interface Features {
  liquid: LiquidId | null
  chests: ChestPlan[]
  plates: PlatePlan[]
  puzzle: PuzzlePlan | null
  doors: DoorPlan[]
  optionalPacks: OptionalPackPlan[]
  caves: CavePlan[]
  rivers: RiverPlan[]
  ponds: Array<{ x: number; z: number; r: number }>
  crossings: CrossingPlan[]
  /** Skull posts by a champion's path. */
  signs: SignPlan[]
  ledges: LedgePlan[]
  dais: DaisPlan | null
  lobes: LobePlan[]
  branches: BranchPlan[]
  forks: ForkPlan[]
}

export const noFeatures = (): Features => ({
  liquid: null, chests: [], plates: [], puzzle: null, doors: [], optionalPacks: [], caves: [], rivers: [], ponds: [],
  crossings: [], signs: [], ledges: [], dais: null, lobes: [], branches: [], forks: []
})

/** The river's centre row at column `i` (also past the grid: the view carries it on). */
export const riverRow = (r: RiverPlan, i: number): number => r.j0 + Math.round(r.amp * Math.sin(i * r.fq + r.ph))

export interface FeatureCtx {
  def: ZoneDef
  seed: number
  w: number
  h: number
  solid: Uint8Array
  trail: Uint8Array
  kind: Uint8Array
  cave: Uint8Array
  sealed: Uint8Array
  side: Uint8Array
  /** Clearing centres and radii in cells: 0 is the start, the last the finale. */
  cs: Array<{ i: number; j: number; r: number }>
  /** The finale chest and the secret chest of the base plan (metres). */
  chest: { x: number; z: number } | null
  secret: { x: number; z: number } | null
  /** The side lobe the secret pocket already took. */
  secretSlot: { k: number; side: number } | null
  tutorial: boolean
  /** Only the finale's and the secret's chest: the plain chain of clearings
   *  (the yardstick the features' cost and reward are measured against). */
  bare: boolean
  /** Lay the branching ways (roadmap #70): there is rock beside the chain for them. */
  branches?: boolean
}

const FEATURE_SALT = 0x5f3c9a17
const LEDGE_SALT = 0x3b9e14d1
const BRANCH_SALT = 0x6d2b79f5

export const addFeatures = (c: FeatureCtx): Features => {
  const { w, h, solid, trail, kind, cave, sealed, side: off, cs } = c
  const f = ZONE_FEATURES[c.def.id]
  const rng: Rng = mulberry32((c.seed ^ FEATURE_SALT) >>> 0)
  const out = noFeatures()
  out.liquid = f.liquid
  const n = cs.length - 1
  const boss = ENEMY_BY_ID[c.def.finale.leader]?.rank === 'boss'
  /** Cells a feature stands on: nothing else is laid on or beside them. */
  const claimed = new Uint8Array(w * h)
  const startK = cs[0]!.j * w + cs[0]!.i
  const int = (lo: number, hi: number): number => lo + Math.floor(rng() * (hi - lo + 1))
  const cx = (i: number): number => (i + 0.5) * CELL

  // ── Walking the plan ──
  const open = (k: number, doorsOpen: boolean): boolean =>
    !solid[k] && kind[k] !== K_WATER && kind[k] !== K_BLOCK && kind[k] !== K_CLIFF && (doorsOpen || !sealed[k])
  const queue = new Int32Array(w * h)
  const flood = (doorsOpen: boolean): Uint8Array => {
    const seen = new Uint8Array(w * h)
    if (!open(startK, doorsOpen)) return seen
    let head = 0
    let tail = 0
    queue[tail++] = startK
    seen[startK] = 1
    while (head < tail) {
      const k = queue[head++]!
      const i = k % w
      const j = (k - i) / w
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue
          const ni = i + di
          const nj = j + dj
          if (ni < 0 || nj < 0 || ni >= w || nj >= h) continue
          const nk = nj * w + ni
          if (seen[nk] || !open(nk, doorsOpen)) continue
          // No cutting a corner, exactly as the pathfinder walks.
          if (di && dj && (!open(j * w + ni, doorsOpen) || !open(nj * w + i, doorsOpen))) continue
          seen[nk] = 1
          queue[tail++] = nk
        }
      }
    }
    return seen
  }
  const cellAt = (x: number, z: number): number => Math.floor(z / CELL) * w + Math.floor(x / CELL)
  const touches = (seen: Uint8Array, k: number): boolean => {
    const i = k % w
    const j = (k - i) / w
    return !!(seen[k] || seen[k - 1] || seen[k + 1] || (j > 0 && seen[k - w]) || (j < h - 1 && seen[k + w]))
  }
  /** Open ground (outside a sealed pocket) that cannot be walked to. */
  const stranded = (): number => {
    const a = flood(false)
    let n0 = 0
    for (let k = 0; k < w * h; k++) if (!a[k] && !sealed[k] && open(k, false)) n0++
    return n0
  }
  /** Every branch way's centre line, cell by cell: a way is never cut. */
  const wayProbe: number[] = []
  /** Everything that must be walkable to still is. */
  const sound = (): boolean => {
    const a = flood(false)
    const b = out.doors.length ? flood(true) : a
    for (let k = 1; k <= n; k++) if (!a[cs[k]!.j * w + cs[k]!.i]) return false
    for (const ch of out.chests) if (!(ch.door >= 0 ? b : a)[cellAt(ch.sx, ch.sz)]) return false
    for (const p of out.plates) if (!a[cellAt(p.x, p.z)]) return false
    if (out.puzzle && !touches(a, cellAt(out.puzzle.hint.x, out.puzzle.hint.z))) return false
    for (const p of out.optionalPacks) if (!a[cellAt(p.x, p.z)]) return false
    for (const cv of out.caves) if (!a[cellAt(cv.x, cv.z)]) return false
    for (const cr of out.crossings) for (const k of cr.cells) if (!a[k]) return false
    for (const l of out.ledges) if (!a[l.probe]) return false
    for (const k of wayProbe) if (!a[k]) return false
    // A sealed pocket has no back way in: its chest waits for the door.
    for (const ch of out.chests) if (ch.door >= 0 && a[cellAt(ch.sx, ch.sz)]) return false
    return true
  }

  /** The side lobes already taken, as "clearing:side". */
  const used = new Set<string>()

  /** Lay a feature; take it back if it fails or leaves the plan unsound. */
  const attempt = (fn: () => boolean): boolean => {
    const snap = [solid.slice(), trail.slice(), kind.slice(), cave.slice(), sealed.slice(), claimed.slice(), off.slice()]
    const len = [out.chests.length, out.plates.length, out.doors.length, out.optionalPacks.length, out.caves.length, out.rivers.length, out.ponds.length, out.crossings.length, out.signs.length, out.ledges.length, out.lobes.length, out.branches.length, out.forks.length, wayProbe.length]
    const puzzle = out.puzzle
    const lobes = [...used]
    if (fn() && sound()) return true
    used.clear()
    for (const u of lobes) used.add(u)
    solid.set(snap[0]!); trail.set(snap[1]!); kind.set(snap[2]!); cave.set(snap[3]!); sealed.set(snap[4]!); claimed.set(snap[5]!); off.set(snap[6]!)
    out.chests.length = len[0]!; out.plates.length = len[1]!; out.doors.length = len[2]!; out.optionalPacks.length = len[3]!
    out.caves.length = len[4]!; out.rivers.length = len[5]!; out.ponds.length = len[6]!; out.crossings.length = len[7]!; out.signs.length = len[8]!
    out.ledges.length = len[9]!; out.lobes.length = len[10]!
    out.branches.length = len[11]!; out.forks.length = len[12]!; wayProbe.length = len[13]!
    out.puzzle = puzzle
    return false
  }

  // ── Carving ──
  const inside = (i: number, j: number): boolean => i >= 2 && j >= 2 && i < w - 2 && j < h - 2
  /** Open a disc; returns the cells that were rock before (and marks them as
   *  a side feature's: the scenery in front of them stays low). */
  const disc = (ci: number, cj: number, r: number, lumpy: boolean): number[] => {
    const fresh: number[] = []
    const lobes = 3 + Math.floor(rng() * 3)
    const ph = rng() * Math.PI * 2
    const amp = lumpy ? 0.08 + rng() * 0.08 : 0
    const R = Math.ceil(r) + 1
    for (let dj = -R; dj <= R; dj++) {
      for (let di = -R; di <= R; di++) {
        const i = ci + di
        const j = cj + dj
        if (!inside(i, j)) continue
        if (Math.hypot(di, dj) > r * (1 + amp * Math.sin(Math.atan2(dj, di) * lobes + ph))) continue
        const k = j * w + i
        if (solid[k]) { solid[k] = 0; off[k] = 1; fresh.push(k) }
      }
    }
    return fresh
  }
  /** Open a line; returns the cells that were rock before. `mark`: it is the
   *  road (a worn trail), not a side path. */
  const line = (ai: number, aj: number, bi: number, bj: number, half: number, mark: boolean): number[] => {
    const fresh: number[] = []
    const steps = Math.max(1, Math.ceil(Math.hypot(bi - ai, bj - aj) * 2))
    const R = Math.ceil(half)
    for (let s = 0; s <= steps; s++) {
      const pi = ai + ((bi - ai) * s) / steps
      const pj = aj + ((bj - aj) * s) / steps
      for (let dj = -R; dj <= R; dj++) {
        for (let di = -R; di <= R; di++) {
          const i = Math.round(pi + di)
          const j = Math.round(pj + dj)
          if (!inside(i, j)) continue
          const d = Math.hypot(i - pi, j - pj)
          const k = j * w + i
          if (d <= half && solid[k]) { solid[k] = 0; if (!mark) off[k] = 1; fresh.push(k) }
          if (mark && d <= 0.9 && !solid[k]) trail[k] = 1
        }
      }
    }
    return fresh
  }
  /** Untouched rock all round (ci, cj) out to r: room for a side pocket. */
  const virgin = (ci: number, cj: number, r: number): boolean => {
    const R = Math.ceil(r)
    if (ci - R < 3 || cj - R < 3 || ci + R > w - 4 || cj + R > h - 4) return false
    for (let dj = -R; dj <= R; dj++) {
      for (let di = -R; di <= R; di++) {
        if (Math.hypot(di, dj) > r) continue
        const k = (cj + dj) * w + ci + di
        if (!solid[k] || kind[k] !== K_GROUND || sealed[k] || cave[k] || claimed[k]) return false
      }
    }
    return true
  }

  // ── Side lobes: each (clearing, side) holds one feature at most ──
  if (c.secretSlot) used.add(c.secretSlot.k + ':' + c.secretSlot.side)
  interface Site { i: number; j: number; k: number; side: number; dx: number; dz: number }
  const ANGLES = [0, 0.32, -0.32, 0.62, -0.62, 0.95, -0.95]
  /** A free pocket of radius `rr` off a clearing kLo..kHi, `gap` cells out
   *  from its edge, with `margin` cells of untouched rock all round it. */
  const site = (kLo: number, kHi: number, rr: number, gap: number, margin = 1): Site | null => {
    const slots: Array<[number, number]> = []
    for (let k = kLo; k <= kHi; k++) for (const side of [-1, 1]) if (!used.has(k + ':' + side)) slots.push([k, side])
    for (let q = slots.length - 1; q > 0; q--) {
      const p = Math.floor(rng() * (q + 1))
      const t = slots[q]!
      slots[q] = slots[p]!
      slots[p] = t
    }
    const first = Math.floor(rng() * ANGLES.length)
    for (const [k, side] of slots) {
      const from = cs[k]!
      const D = from.r + rr + gap
      for (let q = 0; q < ANGLES.length; q++) {
        const th = ANGLES[(first + q) % ANGLES.length]!
        const i = Math.round(from.i + side * Math.cos(th) * D)
        const j = Math.round(from.j + Math.sin(th) * D)
        if (!virgin(i, j, rr + margin)) continue
        const d = Math.hypot(i - from.i, j - from.j) || 1
        used.add(k + ':' + side)
        return { i, j, k, side, dx: (i - from.i) / d, dz: (j - from.j) / d }
      }
    }
    return null
  }

  // ── Chests ──
  /** Put a chest on a cell. The hero stands in front of it on the camera's
   *  side when that cell is free (the chest then faces the player), else on
   *  the open neighbour nearest (pi, pj). */
  const addChest = (ci: number, cj: number, tier: ChestTier, role: ChestRole, pi: number, pj: number, door = -1, guard = -1): boolean => {
    if (!inside(ci, cj)) return false
    const k = cj * w + ci
    if (trail[k] || claimed[k] || kind[k] !== K_GROUND) return false
    let best = -1
    let bd = Infinity
    for (const [di, dj] of [[0, 1], [1, 0], [-1, 0], [0, -1]] as const) {
      const nk = (cj + dj) * w + ci + di
      if (solid[nk] || kind[nk] !== K_GROUND || claimed[nk] || (sealed[nk] && door < 0)) continue
      const d = dj === 1 ? -1 : Math.hypot(ci + di - pi, cj + dj - pj)
      if (d < bd) { bd = d; best = nk }
    }
    if (best < 0) return false
    solid[k] = 0
    kind[k] = K_BLOCK
    claimed[k] = 1
    claimed[best] = 1
    const si = best % w
    out.chests.push({ id: out.chests.length, x: cx(ci), z: cx(cj), tier, role, sx: cx(si), sz: cx((best - si) / w), door, guard })
    return true
  }

  /** A plain kind of the zone to stand guard (never an elite or a weakling). */
  const guardKind = (): string => {
    const pool = c.def.kinds.filter(e => ENEMY_BY_ID[e.kind]?.rank === 'normal')
    const list = pool.length ? pool : c.def.kinds
    let total = 0
    for (const e of list) total += e.w
    let r = rng() * total
    for (const e of list) {
      r -= e.w
      if (r <= 0) return e.kind
    }
    return list[0]!.kind
  }

  /**
   * The zone as a small graph (roadmap #70): loops that fork off the road and
   * rejoin it further on, and dead-end ways to a branch boss. Drawn from a
   * stream of its own; each branch is one transaction, so a seed that has no
   * room for one simply has fewer.
   */
  const addBranches = (): void => {
    const B = ZONE_BRANCHES[c.def.id]
    const brng: Rng = mulberry32((c.seed ^ BRANCH_SALT) >>> 0)
    const bint = (lo: number, hi: number): number => lo + Math.floor(brng() * (hi - lo + 1))
    // The road's column at row j (the chain runs up the map).
    const roadI = (j: number): number => {
      for (let k = 0; k < n; k++) {
        const a = cs[k]!
        const b = cs[k + 1]!
        if (j <= a.j && j >= b.j) return a.i + ((b.i - a.i) * (a.j - j)) / ((a.j - b.j) || 1)
      }
      return j > cs[0]!.j ? cs[0]!.i : cs[n]!.i
    }
    /** Untouched rock all along a planned way, `clear` cells either side,
     *  except where it leaves or meets an open place (`ends`). */
    const rockLine = (ai: number, aj: number, bi: number, bj: number, clear: number, ends: ReadonlyArray<{ i: number; j: number; r: number }>): boolean => {
      const steps = Math.max(1, Math.ceil(Math.hypot(bi - ai, bj - aj) * 2))
      const R = Math.ceil(clear)
      for (let s = 0; s <= steps; s++) {
        const pi = ai + ((bi - ai) * s) / steps
        const pj = aj + ((bj - aj) * s) / steps
        for (let dj = -R; dj <= R; dj++) {
          for (let di = -R; di <= R; di++) {
            if (Math.hypot(di, dj) > clear) continue
            const i = Math.round(pi + di)
            const j = Math.round(pj + dj)
            if (ends.some(e => Math.hypot(i - e.i, j - e.j) < e.r)) continue
            if (i < 3 || j < 3 || i > w - 4 || j > h - 4) return false
            const k = j * w + i
            if (!solid[k] || kind[k] !== K_GROUND || sealed[k] || cave[k] || claimed[k] || way[k]) return false
          }
        }
      }
      return true
    }
    /** The bends between two points: a switchback zigzags, the rest run straight. */
    const bends = (ai: number, aj: number, bi: number, bj: number): Array<[number, number]> => {
      if (B.style !== 'switchback') return [[ai, aj], [bi, bj]]
      const l = Math.hypot(bi - ai, bj - aj) || 1
      const px = -(bj - aj) / l
      const pz = (bi - ai) / l
      const out: Array<[number, number]> = [[ai, aj]]
      for (const [t, s] of [[0.33, 1], [0.66, -1]] as const) out.push([ai + (bi - ai) * t + px * s * 2.4, aj + (bj - aj) * t + pz * s * 2.4])
      out.push([bi, bj])
      return out
    }
    /** Open a planned way: the cells it takes, its centre line probed. */
    let half = B.half
    const cut = (id: number, pts: Array<[number, number]>): void => {
      for (let q = 1; q < pts.length; q++) {
        const [ai, aj] = pts[q - 1]!
        const [bi, bj] = pts[q]!
        for (const k of line(ai, aj, bi, bj, half, false)) {
          way[k] = id + 1
          if (B.style === 'tunnel') cave[k] = 1
        }
        const steps = Math.max(1, Math.ceil(Math.hypot(bi - ai, bj - aj) * 2))
        for (let s = 0; s <= steps; s++) {
          const i = Math.round(ai + ((bi - ai) * s) / steps)
          const j = Math.round(aj + ((bj - aj) * s) / steps)
          // Wild ground, not the worn road (`trail` is the main road's alone).
          wayProbe.push(j * w + i)
        }
      }
    }
    /** The branch's own clearing. */
    const room = (id: number, i: number, j: number, r: number): void => {
      for (const k of disc(i, j, r, true)) {
        way[k] = id + 1
        if (B.style === 'tunnel') cave[k] = 1
      }
    }
    /** A signpost by the mouth of a way, on the side away from the road. */
    const fork = (id: number, from: { i: number; j: number; r: number }, ux: number, uz: number, boss: boolean): boolean => {
      const mi = from.i + ux * (from.r - 1.1)
      const mj = from.j + uz * (from.r - 1.1)
      const cand: Array<[number, number]> = []
      for (const s of [1, -1]) for (const d of [2.4, 2.9, 1.9]) cand.push([Math.round(mi - uz * s * d), Math.round(mj + ux * s * d)])
      // The camera's side first: the sign is read, not hidden behind its post.
      cand.sort((p, q) => q[1] - p[1])
      for (const [pi, pj] of cand) {
        if (!inside(pi, pj)) continue
        const kk = pj * w + pi
        if (solid[kk] || kind[kk] !== K_GROUND || claimed[kk] || trail[kk] || sealed[kk] || way[kk]) continue
        // Clear of the way and of the clearing's middle, where the pack stands.
        if (Math.hypot(pi - from.i, pj - from.j) < from.r * 0.62) continue
        let onWay = false
        for (let dj = -1; dj <= 1 && !onWay; dj++) for (let di = -1; di <= 1; di++) if (way[kk + dj * w + di]) { onWay = true; break }
        if (onWay) continue
        kind[kk] = K_BLOCK
        claimed[kk] = 1
        out.forks.push({ x: cx(pi), z: cx(pj), a: Math.atan2(ux, uz), branch: id, boss })
        return true
      }
      return false
    }
    const plainPack = (): string[] => {
      const size = c.def.pack[0] + Math.floor(brng() * (c.def.pack[1] - c.def.pack[0] + 1))
      const kinds: string[] = []
      let elites = 0
      for (let q = 0; q < size; q++) {
        let total = 0
        for (const e of c.def.kinds) total += e.w
        let r = brng() * total
        let kind = c.def.kinds[0]!.kind
        for (const e of c.def.kinds) { r -= e.w; if (r <= 0) { kind = e.kind; break } }
        if (ENEMY_BY_ID[kind]?.rank === 'elite') {
          if (elites > 0) kind = c.def.kinds[0]!.kind
          else elites++
        }
        kinds.push(kind)
      }
      return kinds
    }
    /** A chest at the far side of a branch's clearing from (ai, aj). */
    const farChest = (i: number, j: number, r: number, ai: number, aj: number, tier: ChestTier, role: ChestRole, pack: number): boolean => {
      const l = Math.hypot(i - ai, j - aj) || 1
      const ux = (i - ai) / l
      const uz = (j - aj) / l
      for (const [t, s] of [[0, 0], [0.5, 1], [0.5, -1], [1, 1], [1, -1]] as const) {
        const ci = Math.round(i + ux * (r - 1.3) - uz * s * t * 1.5)
        const cj = Math.round(j + uz * (r - 1.3) + ux * s * t * 1.5)
        if (wayProbe.includes(cj * w + ci)) continue
        if (addChest(ci, cj, tier, role, i, j, -1, pack)) return true
      }
      return false
    }

    // Loops first: each takes a lot of rock. Every zone gets at least one (a
    // second route to the finale): when the seed's tries all fail, narrower
    // ways with less rock between are tried too.
    const loops = bint(B.bypasses[0], B.bypasses[1])
    const anyLoop = (): boolean => out.branches.some(b => b.kind === 'loop')
    for (let q = 0; q < loops || (q < loops + 2 && !anyLoop()); q++) {
      const relaxed = q >= loops
      half = relaxed ? Math.min(B.half, 1.3) : B.half
      const wall = relaxed ? 1 : 1.6
      // A loop rejoins the road before the finale's arena when there is a
      // clearing to rejoin: the boss's floor keeps its one way in.
      const last = n > 2 ? n - 1 : n
      const spans: Array<[number, number]> = []
      for (let a = 0; a < n; a++) for (const s of [1, 2]) if (a + s <= last) spans.push([a, a + s])
      for (let p = spans.length - 1; p > 0; p--) {
        const t = Math.floor(brng() * (p + 1))
        const x = spans[p]!
        spans[p] = spans[t]!
        spans[t] = x
      }
      const s0 = brng() < 0.5 ? -1 : 1
      let laid = false
      for (const [a, b] of spans) {
        if (laid) break
        for (const side of [s0, -s0]) {
          if (laid) break
          for (const D of relaxed ? [9, 10.5, 12, 14, 16, 18] : [11, 13, 9.5, 15]) {
            const A = cs[a]!
            const Bc = cs[b]!
            const rr = 3 + brng() * 0.6
            const mj = Math.round((A.j + Bc.j) / 2 + (brng() - 0.5) * 3)
            const ri = roadI(mj)
            const mi = Math.round(ri + side * D)
            if (Math.abs(mi - ri) < 8.5) continue
            if (!virgin(mi, mj, rr + 2.5)) continue
            // A fork reads as one: it leaves the clearing well off the road's line.
            const nx = cs[a + 1]!
            const angA = Math.abs(Math.atan2(mj - A.j, mi - A.i) - Math.atan2(nx.j - A.j, nx.i - A.i))
            const pv = cs[b - 1]!
            const angB = Math.abs(Math.atan2(mj - Bc.j, mi - Bc.i) - Math.atan2(pv.j - Bc.j, pv.i - Bc.i))
            const wrap = (x: number): number => Math.min(x, Math.PI * 2 - x)
            if (wrap(angA) < 0.6 || wrap(angB) < 0.6) continue
            const id = out.branches.length
            const ok = attempt(() => {
              const lA = Math.hypot(mi - A.i, mj - A.j) || 1
              const lB = Math.hypot(mi - Bc.i, mj - Bc.j) || 1
              const pA: [number, number] = [A.i + ((mi - A.i) / lA) * (A.r - 0.6), A.j + ((mj - A.j) / lA) * (A.r - 0.6)]
              const pB: [number, number] = [Bc.i + ((mi - Bc.i) / lB) * (Bc.r - 0.6), Bc.j + ((mj - Bc.j) / lB) * (Bc.r - 0.6)]
              const ends = [{ i: A.i, j: A.j, r: A.r + 1.2 }, { i: Bc.i, j: Bc.j, r: Bc.r + 1.2 }, { i: mi, j: mj, r: rr + 0.5 }]
              const legA = bends(pA[0], pA[1], mi, mj)
              const legB = bends(mi, mj, pB[0], pB[1])
              for (const leg of [legA, legB]) for (let e = 1; e < leg.length; e++) {
                if (!rockLine(leg[e - 1]![0], leg[e - 1]![1], leg[e]![0], leg[e]![1], half + wall, ends)) return false
              }
              // Another route, not a shortcut: the road stays the short way.
              let road = 0
              for (let k = a; k < b; k++) road += Math.hypot(cs[k + 1]!.i - cs[k]!.i, cs[k + 1]!.j - cs[k]!.j)
              let walk = 0
              for (const leg of [legA, legB]) for (let e = 1; e < leg.length; e++) walk += Math.hypot(leg[e]![0] - leg[e - 1]![0], leg[e]![1] - leg[e - 1]![1])
              if (walk + A.r + Bc.r < road * 1.3) return false
              room(id, mi, mj, rr)
              cut(id, legA)
              cut(id, legB)
              const pack = out.optionalPacks.length
              out.optionalPacks.push({ x: cx(mi), z: cx(mj), r: rr * CELL, kinds: plainPack(), levelOffset: 0, champion: false, branch: id })
              claimed[mj * w + mi] = 1
              out.lobes.push({ x: cx(mi), z: cx(mj), r: rr * CELL, k: a, lift: (brng() - 0.4) * 0.9 })
              const chest = out.chests.length
              const tier: ChestTier = brng() < 0.6 ? 'iron' : 'wood'
              // Out of the way of both legs: on the clearing's outer side.
              if (!farChest(mi, mj, rr, ri, mj, tier, 'bypass', pack)) return false
              const ux = (pA[0] - A.i) / (A.r - 0.6)
              const uz = (pA[1] - A.j) / (A.r - 0.6)
              out.branches.push({
                id, kind: 'loop', from: a, to: b, x: cx(mi), z: cx(mj), r: rr * CELL,
                way: [...legA, ...legB.slice(1)].map(([i, j]) => ({ x: cx(i), z: cx(j) })),
                pack, chest, style: B.style
              })
              return fork(id, A, ux, uz, false)
            })
            if (ok) { laid = true; break }
          }
        }
      }
    }

    // Then the dead ends, each to a branch boss and a gold chest.
    half = B.half
    const bosses = bint(B.bosses[0], B.bosses[1])
    const ANG = [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05]
    for (let q = 0; q < bosses; q++) {
      const kind0 = B.bossKinds[bint(0, B.bossKinds.length - 1)]!
      const slots: Array<[number, number]> = []
      for (let k = 0; k < n; k++) for (const s of [-1, 1]) slots.push([k, s])
      for (let p = slots.length - 1; p > 0; p--) {
        const t = Math.floor(brng() * (p + 1))
        const x = slots[p]!
        slots[p] = slots[t]!
        slots[t] = x
      }
      let laid = false
      for (const [k, side] of slots) {
        if (laid) break
        const from = cs[k]!
        for (const ra of [4.2, 3.7]) {
          if (laid) break
          for (const th of ANG) {
            for (const gap of [4.5, 6, 3.5]) {
              const D = from.r + ra + gap
              const ai = Math.round(from.i + side * Math.cos(th) * D)
              const aj = Math.round(from.j + Math.sin(th) * D)
              if (!virgin(ai, aj, ra + 2.5)) continue
              const id = out.branches.length
              const ok = attempt(() => {
                const l = Math.hypot(ai - from.i, aj - from.j) || 1
                const ux = (ai - from.i) / l
                const uz = (aj - from.j) / l
                const p0: [number, number] = [from.i + ux * (from.r - 0.6), from.j + uz * (from.r - 0.6)]
                const leg = bends(p0[0], p0[1], ai, aj)
                const ends = [{ i: from.i, j: from.j, r: from.r + 1.2 }, { i: ai, j: aj, r: ra + 0.5 }]
                for (let e = 1; e < leg.length; e++) if (!rockLine(leg[e - 1]![0], leg[e - 1]![1], leg[e]![0], leg[e]![1], half + 1.6, ends)) return false
                room(id, ai, aj, ra)
                cut(id, leg)
                const pack = out.optionalPacks.length
                const guards = bint(1, 2)
                const kinds = [kind0]
                for (let g = 0; g < guards; g++) kinds.push(guardKind())
                out.optionalPacks.push({ x: cx(ai), z: cx(aj), r: ra * CELL, kinds, levelOffset: 0, champion: false, boss: kind0, branch: id })
                claimed[aj * w + ai] = 1
                out.lobes.push({ x: cx(ai), z: cx(aj), r: ra * CELL, k, lift: 0.35 + brng() * 0.4 })
                const chest = out.chests.length
                if (!farChest(ai, aj, ra, from.i, from.j, 'gold', 'branch', pack)) return false
                out.branches.push({
                  id, kind: 'boss', from: k, to: -1, x: cx(ai), z: cx(aj), r: ra * CELL,
                  way: leg.map(([i, j]) => ({ x: cx(i), z: cx(j) })), pack, chest, style: B.style
                })
                return fork(id, from, ux, uz, true)
              })
              if (ok) { laid = true; break }
            }
            if (laid) break
          }
        }
      }
    }
  }

  // The finale's chest: a boulder never sits on it or in front of it.
  if (c.chest) {
    const fin = cs[n]!
    const ci = Math.floor(c.chest.x / CELL)
    const cj = Math.floor(c.chest.z / CELL)
    solid[cj * w + ci] = 0
    solid[(cj + 1) * w + ci] = 0
    trail[cj * w + ci] = 0
    addChest(ci, cj, boss ? 'gold' : 'iron', 'finale', fin.i, fin.j)
  }
  if (c.secret) {
    const ci = Math.floor(c.secret.x / CELL)
    const cj = Math.floor(c.secret.z / CELL)
    const from = cs[c.secretSlot?.k ?? 1]!
    trail[cj * w + ci] = 0
    addChest(ci, cj, 'gold', 'secret', from.i, from.j)
  }

  if (c.bare) return out

  // The first visit of a new save: one easy chest right by the road, and
  // nothing else to take the eye off learning to fight.
  if (c.tutorial) {
    const s = cs[0]!
    const lean = cs[1]!.i >= s.i ? -1 : 1
    for (const [di, dj] of [[lean * 2, -2], [-lean * 2, -2], [lean * 3, -1], [-lean * 3, -1], [lean * 2, 1], [-lean * 2, 1]] as const) {
      if (attempt(() => addChest(s.i + di, s.j + dj, 'wood', 'tutorial', s.i, s.j - 1))) break
    }
    return out
  }

  // ── Branching ways and their bosses (roadmap #70), on a stream of their own ──
  const way = new Uint8Array(w * h)
  if (c.branches) addBranches()

  // ── A river across the road, bridged where the road meets it ──
  if (f.liquid && rng() < f.river) {
    const passes: number[] = []
    for (let k = 1; k <= n; k++) passes.push(k)
    for (let q = passes.length - 1; q > 0; q--) {
      const p = Math.floor(rng() * (q + 1))
      const t = passes[q]!
      passes[q] = passes[p]!
      passes[p] = t
    }
    const amp = 0.6 + rng() * 0.7
    const fq = 0.24 + rng() * 0.2
    const ph = rng() * Math.PI * 2
    for (const k of passes) {
      const a = cs[k - 1]!
      const b = cs[k]!
      const river: RiverPlan = { j0: Math.round((a.j + b.j) / 2), amp, fq, ph, half: 1 }
      const done = attempt(() => {
        // Where the road's centre line meets the river.
        const t = (river.j0 - a.j) / ((b.j - a.j) || 1)
        const b0 = Math.round(a.i + (b.i - a.i) * t - 0.5)
        if (b0 < 4 || b0 + 1 > w - 5) return false
        const jMin = Math.min(riverRow(river, b0), riverRow(river, b0 + 1)) - river.half
        const jMax = Math.max(riverRow(river, b0), riverRow(river, b0 + 1)) + river.half
        if (jMin - 4 < 3 || jMax + 4 > h - 4) return false
        // The old road near the banks goes; a new one runs over the bridge.
        for (let j = jMin - 3; j <= jMax + 3; j++) for (let i = 2; i < w - 2; i++) trail[j * w + i] = 0
        for (let i = 2; i < w - 2; i++) {
          const jc = riverRow(river, i)
          for (let dj = -river.half; dj <= river.half; dj++) {
            const kk = (jc + dj) * w + i
            if (kind[kk] === K_BLOCK || claimed[kk]) return false
            solid[kk] = 0
            kind[kk] = K_WATER
          }
        }
        // A branch way the river crosses keeps going over stepping stones.
        for (const br of out.branches) {
          const fc: number[] = []
          for (let kk = 0; kk < w * h; kk++) if (way[kk] === br.id + 1 && kind[kk] === K_WATER) { kind[kk] = K_FORD; fc.push(kk) }
          if (!fc.length) continue
          const is = fc.map(kk => kk % w)
          const js = fc.map(kk => Math.floor(kk / w))
          for (const kk of fc) claimed[kk] = 1
          out.crossings.push({
            kind: 'ford', cells: fc, x: cx(is.reduce((s, v) => s + v, 0) / fc.length), z: cx(js.reduce((s, v) => s + v, 0) / fc.length),
            i0: Math.min(...is), i1: Math.max(...is), j0: Math.min(...js), j1: Math.max(...js)
          })
        }
        const cells: number[] = []
        for (let j = jMin; j <= jMax; j++) {
          for (let i = b0; i <= b0 + 1; i++) {
            const kk = j * w + i
            if (kind[kk] === K_WATER) { kind[kk] = K_BRIDGE; cells.push(kk) }
            solid[kk] = 0
            trail[kk] = 1
          }
        }
        // Both ends are joined back to the road, four rows up and down it.
        const at = (j: number): number => {
          const u = Math.max(0, Math.min(1, (j - a.j) / ((b.j - a.j) || 1)))
          return a.i + (b.i - a.i) * u
        }
        const up = Math.max(b.j, jMin - 4)
        const down = Math.min(a.j, jMax + 4)
        line(b0 + 0.5, jMin - 1, at(up), up, 1.3, true)
        line(b0 + 0.5, jMax + 1, at(down), down, 1.3, true)
        // The connectors never refill the river.
        for (let i = 2; i < w - 2; i++) {
          const jc = riverRow(river, i)
          for (let dj = -river.half; dj <= river.half; dj++) {
            const kk = (jc + dj) * w + i
            if (kind[kk] === K_WATER) trail[kk] = 0
          }
        }
        for (const kk of cells) claimed[kk] = 1
        out.rivers.push(river)
        out.crossings.push({ kind: 'bridge', cells, x: (b0 + 1) * CELL, z: ((jMin + jMax + 1) / 2) * CELL, i0: b0, i1: b0 + 1, j0: jMin, j1: jMax })
        return true
      })
      if (done) break
    }
  }

  // ── Ledges and the finale's dais (roadmap #57), on a stream of their own so
  //    the rest of a seed's layout is what it was before the land had relief ──
  const rel = ZONE_RELIEF[c.def.id]
  const lrng: Rng = mulberry32((c.seed ^ LEDGE_SALT) >>> 0)
  if (!c.tutorial && lrng() < rel.dais) {
    const fin = cs[n]!
    out.dais = { x: cx(fin.i), z: cx(fin.j), r: fin.r * CELL * 0.42, rim: fin.r * CELL * 0.8, h: 0.75 + lrng() * 0.35 }
  }
  const ledge = (withChest: boolean): boolean => attempt(() => {
    // Never on a boss's floor, nor across a dais.
    const kHi = boss || out.dais ? n - 1 : n
    const k = Math.floor(lrng() * (kHi + 1))
    const from = cs[k]!
    // The terrace lies up-screen of its edge, so the camera looks at the
    // cliff's face, not over its back.
    const th = -Math.PI / 2 + (lrng() - 0.5) * 1.9
    const ux = Math.cos(th)
    const uz = Math.sin(th)
    const R = from.r
    const d0 = R * (0.3 + lrng() * 0.15)
    const step = rel.step[0] + lrng() * (rel.step[1] - rel.step[0])
    const e = 0.5 * (Math.abs(ux) + Math.abs(uz))
    const half = 1.55
    const run = step > 1.5 ? 1.9 : 1.7
    const reach = R * 1.3 + 1
    const RR = Math.ceil(reach)
    // Where across the line the ramp goes: somewhere in the middle half of it.
    const across: number[] = []
    for (let dj = -RR; dj <= RR; dj++) for (let di = -RR; di <= RR; di++) {
      const i = from.i + di
      const j = from.j + dj
      if (!inside(i, j) || solid[j * w + i] || Math.hypot(di, dj) > reach) continue
      if (Math.abs(di * ux + dj * uz - d0) <= e + 0.15) across.push(-di * uz + dj * ux)
    }
    if (across.length < 4) return false
    // Never on the side a branch way leaves by: the way runs on level ground.
    for (const br of out.branches) {
      const ends = br.to === k ? [br.way[br.way.length - 1]!] : br.from === k ? [br.way[0]!] : []
      for (const p of ends) if ((p.x / CELL - 0.5 - from.i) * ux + (p.z / CELL - 0.5 - from.j) * uz > d0 - 2) return false
    }
    across.sort((a, b) => a - b)
    const t0 = across[Math.floor((0.25 + 0.5 * lrng()) * across.length)]!
    const cliff: number[] = []
    const ramp: number[] = []
    const tops: Array<[number, number]> = []
    let top = -1
    let far = -Infinity
    for (let dj = -RR; dj <= RR; dj++) for (let di = -RR; di <= RR; di++) {
      const i = from.i + di
      const j = from.j + dj
      if (!inside(i, j) || Math.hypot(di, dj) > reach) continue
      const kk = j * w + i
      if (solid[kk]) continue
      const sc = di * ux + dj * uz
      const tc = -di * uz + dj * ux
      if (Math.abs(tc - t0) + e <= half && Math.abs(sc - d0) <= run) {
        if (kind[kk] !== K_GROUND || claimed[kk] || sealed[kk]) return false
        ramp.push(kk)
      } else if (Math.abs(sc - d0) <= e + 0.15) {
        // The edge never cuts the road, a feature or a door.
        if (kind[kk] !== K_GROUND || claimed[kk] || trail[kk] || sealed[kk] || cave[kk]) return false
        cliff.push(kk)
      } else if (sc > d0 && kind[kk] === K_GROUND && !claimed[kk]) {
        // Not where a river's valley would pull the top back down.
        if (out.rivers.some(r => Math.abs(riverRow(r, i) - j) < 7)) return false
        tops.push([kk, sc])
        if (sc > far) { far = sc; top = kk }
      }
    }
    if (cliff.length < 3 || ramp.length < 2 || top < 0) return false
    const cutOff0 = stranded()
    for (const kk of cliff) { kind[kk] = K_CLIFF; claimed[kk] = 1 }
    for (const kk of ramp) { kind[kk] = K_RAMP; claimed[kk] = 1 }
    // The edge must not leave a scrap of ground nobody can walk to.
    if (stranded() > cutOff0) return false
    out.ledges.push({ x: cx(from.i), z: cx(from.j), r: R * CELL, ux, uz, d0: d0 * CELL, t0: t0 * CELL, half: half * CELL, run: run * CELL, step, probe: top })
    if (withChest) {
      // Something up there for the climb, as far back on the top as will take it.
      tops.sort((p, q) => q[1] - p[1])
      let placed = false
      const tier = lrng() < 0.5 ? 'iron' : 'wood'
      for (const [kk] of tops.slice(0, 8)) {
        const ti = kk % w
        if (addChest(ti, (kk - ti) / w, tier, 'ledge', from.i, from.j)) { placed = true; break }
      }
      if (!placed) return false
      out.ledges[out.ledges.length - 1]!.probe = cellAt(out.chests[out.chests.length - 1]!.sx, out.chests[out.chests.length - 1]!.sz)
    }
    return true
  })
  if (!c.tutorial) {
    for (let q = 0; q < rel.ledges; q++) {
      if (lrng() >= rel.ledge) continue
      // A ledge mostly has something up there for the climb.
      const withChest = lrng() < 0.65
      for (let tries = 0; tries < 10; tries++) if (ledge(withChest)) break
    }
  }

  // ── Side features, in an order the seed picks, up to the visit's chest count ──
  const want = int(f.chests[0], f.chests[1])
  // A branch's chest is the branch's own reward, beside the zone's count.
  const side = (): number => out.chests.filter(ch => ch.role !== 'finale' && ch.role !== 'secret' && ch.role !== 'branch' && ch.role !== 'bypass').length
  const midHi = Math.max(1, n - 1)

  const corner = (champion: boolean): boolean => attempt(() => {
    const rr = champion ? 3.3 : 2.6
    const s = site(1, midHi, rr, 2.4)
    if (!s) return false
    const from = cs[s.k]!
    // A champion waits on a knoll; a guard a little above the clearing.
    out.lobes.push({ x: cx(s.i), z: cx(s.j), r: rr * CELL, k: s.k, lift: champion ? 0.75 : 0.3 })
    line(from.i, from.j, s.i, s.j, champion ? 1.25 : 1.05, false)
    disc(s.i, s.j, rr, true)
    const pack = out.optionalPacks.length
    out.optionalPacks.push({
      x: cx(s.i), z: cx(s.j), r: rr * CELL,
      kinds: [champion ? f.championKind : guardKind()],
      levelOffset: champion ? int(f.championLevels[0], f.championLevels[1]) : int(0, 1),
      champion
    })
    claimed[s.j * w + s.i] = 1
    const ci = Math.round(s.i + s.dx * (rr - 1.3))
    const cj = Math.round(s.j + s.dz * (rr - 1.3))
    if (!addChest(ci, cj, champion ? 'gold' : rng() < 0.6 ? 'iron' : 'wood', champion ? 'champion' : 'guard', s.i, s.j, -1, pack)) return false
    if (champion) {
      // Skulls on posts either side of the way in: this one is a choice.
      const mi = from.i + s.dx * (from.r + 1.2)
      const mj = from.j + s.dz * (from.r + 1.2)
      for (const sgn of [-1, 1]) {
        const pi = Math.round(mi - s.dz * sgn * 2.3)
        const pj = Math.round(mj + s.dx * sgn * 2.3)
        if (!inside(pi, pj)) continue
        const kk = pj * w + pi
        if (kind[kk] !== K_GROUND || claimed[kk] || trail[kk] || sealed[kk] || cave[kk]) continue
        // A notch in the tree line, so nothing grows in front of the post.
        solid[kk] = 0
        off[kk] = 1
        kind[kk] = K_BLOCK
        claimed[kk] = 1
        // The skull looks at the player, whichever way the path runs.
        out.signs.push({ x: cx(pi), z: cx(pj), a: 0 })
      }
    }
    return true
  })

  const caveFeature = (): boolean => attempt(() => {
    const rr = 2.3
    const s = site(0, midHi, rr, 4.2)
    if (!s) return false
    const from = cs[s.k]!
    const ei = from.i + s.dx * (from.r - 0.6)
    const ej = from.j + s.dz * (from.r - 0.6)
    // The passage bends once on its way in.
    const bend = (rng() < 0.5 ? -1 : 1) * (1.6 + rng() * 0.8)
    let mi = (ei + s.i) / 2 - s.dz * bend
    let mj = (ej + s.j) / 2 + s.dx * bend
    if (!virgin(Math.round(mi), Math.round(mj), 1.6)) { mi = (ei + s.i) / 2; mj = (ej + s.j) / 2 }
    const fresh = [...line(ei, ej, mi, mj, 0.8, false), ...line(mi, mj, s.i, s.j, 0.8, false), ...disc(s.i, s.j, rr, true)]
    if (fresh.length < 8) return false
    for (const kk of fresh) cave[kk] = 1
    // The arch stands on the first cave cell of the way in.
    let mouthI = Math.round(ei)
    let mouthJ = Math.round(ej)
    for (let q = 0; q <= 40; q++) {
      const pi = Math.round(ei + ((mi - ei) * q) / 40)
      const pj = Math.round(ej + ((mj - ej) * q) / 40)
      if (cave[pj * w + pi]) { mouthI = pi; mouthJ = pj; break }
    }
    const ma = Math.atan2(mi - ei, mj - ej)
    claimed[mouthJ * w + mouthI] = 1
    const dl = Math.hypot(s.i - mi, s.j - mj) || 1
    const ux = (s.i - mi) / dl
    const uz = (s.j - mj) / dl
    let guard = -1
    if (rng() < 0.4) {
      guard = out.optionalPacks.length
      out.optionalPacks.push({ x: cx(s.i), z: cx(s.j), r: rr * CELL, kinds: [guardKind()], levelOffset: int(1, 2), champion: false })
      claimed[s.j * w + s.i] = 1
    }
    if (!addChest(Math.round(s.i + ux * (rr - 1.2)), Math.round(s.j + uz * (rr - 1.2)), 'iron', 'cave', s.i, s.j, -1, guard)) return false
    out.caves.push({ x: cx(s.i), z: cx(s.j), r: rr * CELL, mouth: { x: cx(mouthI), z: cx(mouthJ), a: ma } })
    // A cave goes down into the hill.
    out.lobes.push({ x: cx(s.i), z: cx(s.j), r: rr * CELL, k: s.k, lift: -0.55 })
    return true
  })

  const lagoon = (): boolean => attempt(() => {
    if (!f.liquid) return false
    const rr = 3.3
    const s = site(0, midHi, rr, 1.7, 0.4)
    if (!s) return false
    const from = cs[s.k]!
    disc(s.i, s.j, rr, false)
    line(from.i, from.j, s.i, s.j, 1.3, false)
    const R = Math.ceil(rr) + 1
    for (let dj = -R; dj <= R; dj++) {
      for (let di = -R; di <= R; di++) {
        const d = Math.hypot(di, dj)
        if (d <= 1.6 || d > rr + 0.3) continue
        const kk = (s.j + dj) * w + s.i + di
        if (solid[kk]) continue
        if (trail[kk] || claimed[kk] || kind[kk] !== K_GROUND) return false
        kind[kk] = K_WATER
      }
    }
    // Stepping stones from the islet back toward the clearing, cell by cell
    // with no diagonal step (a body cannot cut a corner between two stones).
    const cells: number[] = []
    let i = s.i
    let j = s.j
    let fx = s.i
    let fz = s.j
    for (let q = 0; q < 40; q++) {
      fx -= s.dx * 0.5
      fz -= s.dz * 0.5
      const ni = Math.round(fx)
      const nj = Math.round(fz)
      if (ni !== i && nj !== j) {
        // A diagonal: go round by the axis the line leans on.
        const via = Math.abs(s.dx) >= Math.abs(s.dz) ? j * w + ni : nj * w + i
        if (kind[via] === K_WATER) { kind[via] = K_FORD; cells.push(via) }
      }
      i = ni
      j = nj
      const kk = j * w + i
      if (kind[kk] === K_WATER) { kind[kk] = K_FORD; cells.push(kk) } else if (cells.length && !solid[kk] && kind[kk] !== K_FORD) break
    }
    if (!cells.length) return false
    for (const kk of cells) claimed[kk] = 1
    if (!addChest(s.i, s.j, rng() < 0.5 ? 'iron' : 'wood', 'lagoon', s.i - s.dx * 2, s.j - s.dz * 2)) return false
    let si = 0
    let sj = 0
    for (const kk of cells) { si += kk % w; sj += Math.floor(kk / w) }
    const is = cells.map(kk => kk % w)
    const js = cells.map(kk => Math.floor(kk / w))
    out.crossings.push({ kind: 'ford', cells, x: cx(si / cells.length), z: cx(sj / cells.length), i0: Math.min(...is), i1: Math.max(...is), j0: Math.min(...js), j1: Math.max(...js) })
    out.ponds.push({ x: cx(s.i), z: cx(s.j), r: rr * CELL })
    out.lobes.push({ x: cx(s.i), z: cx(s.j), r: rr * CELL, k: s.k, lift: -0.3 })
    return true
  })

  const puzzle = (): boolean => attempt(() => {
    const count = f.plates
    if (!count || out.puzzle) return false
    const rr = 1.9
    const s = site(0, midHi, rr, 2.4)
    if (!s) return false
    const from = cs[s.k]!
    const id = out.doors.length
    const fresh = [...line(from.i, from.j, s.i, s.j, 0.9, false), ...disc(s.i, s.j, rr, false)]
    if (fresh.length < 6) return false
    for (const kk of fresh) sealed[kk] = id + 1
    // The wall opens at the sealed cell nearest the clearing.
    let mouth = fresh[0]!
    let md = Infinity
    for (const kk of fresh) {
      const d = Math.hypot((kk % w) - from.i, Math.floor(kk / w) - from.j)
      if (d < md) { md = d; mouth = kk }
    }
    out.doors.push({ id, cells: fresh, x: cx(mouth % w), z: cx(Math.floor(mouth / w)) })
    if (!addChest(s.i, s.j, 'gold', 'puzzle', from.i, from.j, id)) return false
    // The plates: an arc inside the clearing, on the pocket's side of it.
    const R = Math.max(2.4, from.r * 0.52)
    const phi = Math.atan2(s.dz, s.dx)
    const dphi = 2.4 / R
    const spots: number[] = []
    const place = (a: number, rad: number): number => {
      const pi = Math.round(from.i + Math.cos(a) * rad)
      const pj = Math.round(from.j + Math.sin(a) * rad)
      if (!inside(pi, pj)) return -1
      const kk = pj * w + pi
      if (trail[kk] || claimed[kk] || kind[kk] !== K_GROUND || sealed[kk]) return -1
      for (const o of spots) if (Math.abs((o % w) - pi) <= 1 && Math.abs(Math.floor(o / w) - pj) <= 1) return -1
      return kk
    }
    for (let m = 0; m < count; m++) {
      const a = phi + (m - (count - 1) / 2) * dphi
      let kk = place(a, R)
      if (kk < 0) kk = place(a, R - 0.8)
      if (kk < 0) kk = place(a, R + 0.8)
      if (kk < 0) return false
      spots.push(kk)
    }
    const first = out.plates.length
    for (let m = 0; m < count; m++) {
      const kk = spots[m]!
      solid[kk] = 0
      kind[kk] = K_PLATE
      claimed[kk] = 1
      out.plates.push({ id: first + m, x: cx(kk % w), z: cx(Math.floor(kk / w)), symbol: m })
    }
    // The carved stone stands at the end of the row, by the first plate.
    let hint = -1
    for (const [da, dr] of [[-1, 0], [-1, 0.9], [count, 0], [count, 0.9], [-1.6, 0], [count + 0.6, 0]] as const) {
      const a = phi + (da - (count - 1) / 2) * dphi
      hint = place(a, R + dr)
      if (hint >= 0) break
    }
    if (hint < 0) return false
    // The stone is read from the plates: no rock or boulder between them.
    const seen = (a: number, b: number): boolean => {
      const ai = a % w, aj = Math.floor(a / w), bi = b % w, bj = Math.floor(b / w)
      const steps = Math.max(1, Math.ceil(Math.hypot(bi - ai, bj - aj) * 3))
      for (let q = 1; q < steps; q++) {
        const kk = Math.round(aj + ((bj - aj) * q) / steps) * w + Math.round(ai + ((bi - ai) * q) / steps)
        if (kk !== a && kk !== b && (solid[kk] || sealed[kk])) return false
      }
      return true
    }
    for (const kk of spots) if (!seen(hint, kk)) return false
    solid[hint] = 0
    kind[hint] = K_BLOCK
    claimed[hint] = 1
    // The order: never simply the row as it lies.
    const order = Array.from({ length: count }, (_, m) => first + m)
    for (let tries = 0; tries < 4; tries++) {
      for (let q = order.length - 1; q > 0; q--) {
        const p = Math.floor(rng() * (q + 1))
        const t = order[q]!
        order[q] = order[p]!
        order[p] = t
      }
      if (order.some((v, m) => v !== first + m)) break
    }
    out.puzzle = { order, hint: { x: cx(hint % w), z: cx(Math.floor(hint / w)) }, door: id }
    out.lobes.push({ x: cx(s.i), z: cx(s.j), r: rr * CELL, k: s.k, lift: 0.15 })
    return true
  })

  /** A chest in an alcove off a clearing; failing that, by its far wall. */
  const nook = (): boolean => {
    if (attempt(() => {
      const s = site(0, midHi, 1.3, 2, 0.6)
      if (!s) return false
      // An alcove takes no lobe: the big features keep theirs.
      used.delete(s.k + ':' + s.side)
      const from = cs[s.k]!
      line(from.i, from.j, s.i, s.j, 0.9, false)
      disc(s.i, s.j, 1.3, false)
      out.lobes.push({ x: cx(s.i), z: cx(s.j), r: 1.3 * CELL, k: s.k, lift: 0.25 })
      return addChest(s.i, s.j, 'wood', 'nook', from.i, from.j)
    })) return true
    for (let tries = 0; tries < 10; tries++) {
      const k = int(0, midHi)
      const from = cs[k]!
      const a = rng() * Math.PI * 2
      const d = from.r * 0.7
      const ci = Math.round(from.i + Math.cos(a) * d)
      const cj = Math.round(from.j + Math.sin(a) * d)
      if (!inside(ci, cj) || solid[cj * w + ci]) continue
      let road = false
      for (let dj = -2; dj <= 2 && !road; dj++) for (let di = -2; di <= 2; di++) if (trail[(cj + dj) * w + ci + di]) { road = true; break }
      if (road) continue
      if (attempt(() => addChest(ci, cj, 'wood', 'nook', from.i, from.j))) return true
    }
    return false
  }

  const kinds: Array<[() => boolean, number]> = [
    [() => corner(true), f.champion], [() => corner(false), f.corner], [caveFeature, f.cave], [lagoon, f.lagoon], [puzzle, f.plates ? f.puzzle : 0]
  ]
  for (let q = kinds.length - 1; q > 0; q--) {
    const p = Math.floor(rng() * (q + 1))
    const t = kinds[q]!
    kinds[q] = kinds[p]!
    kinds[p] = t
  }
  for (const [lay, chance] of kinds) {
    const roll = rng()
    if (side() >= want || roll >= chance) continue
    lay()
  }
  for (let tries = 0; tries < 4 && side() < want; tries++) nook()

  // ── Ponds inside the clearings: something to walk round in a fight ──
  if (f.liquid) {
    for (let q = 0; q < f.ponds; q++) {
      if (rng() >= f.pond) continue
      for (let tries = 0; tries < 5; tries++) if (attempt(() => {
        // Not in a boss's arena: a body that size has to be able to walk it all.
        const k = int(1, boss ? Math.max(1, n - 1) : n)
        const from = cs[k]!
        const a = rng() * Math.PI * 2
        const d = from.r * (0.52 + rng() * 0.26)
        const pr = 1.2 + rng() * 0.9
        const ci = Math.round(from.i + Math.cos(a) * d)
        const cj = Math.round(from.j + Math.sin(a) * d)
        const lobes = 2 + Math.floor(rng() * 3)
        const ph = rng() * Math.PI * 2
        const cells: number[] = []
        const R = Math.ceil(pr) + 1
        for (let dj = -R; dj <= R; dj++) {
          for (let di = -R; di <= R; di++) {
            const i = ci + di
            const j = cj + dj
            if (!inside(i, j)) continue
            if (Math.hypot(di, dj) > pr * (1 + 0.22 * Math.sin(Math.atan2(dj, di) * lobes + ph))) continue
            const kk = j * w + i
            if (solid[kk]) continue
            if (kind[kk] !== K_GROUND || sealed[kk] || cave[kk]) return false
            // Not on the road, not under the pack, not against a feature.
            if (Math.hypot(i - from.i, j - from.j) < 3.1) return false
            for (let ej = -1; ej <= 1; ej++) for (let ei = -1; ei <= 1; ei++) {
              const nk = (j + ej) * w + i + ei
              if (trail[nk] || claimed[nk]) return false
            }
            cells.push(kk)
          }
        }
        if (cells.length < 4) return false
        for (const kk of cells) kind[kk] = K_WATER
        out.ponds.push({ x: cx(ci), z: cx(cj), r: pr * CELL })
        return true
      })) break
    }
  }
  // Open ground nobody can walk to (a scrap boxed in by boulders) is rock:
  // a blink or a shove must never leave a body somewhere it cannot leave.
  {
    const a = flood(false)
    for (let k = 0; k < w * h; k++) if (!a[k] && !sealed[k] && open(k, false)) solid[k] = 1
  }
  return out
}
