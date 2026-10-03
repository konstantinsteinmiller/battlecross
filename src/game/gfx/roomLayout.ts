/**
 * ─── Arranging a room (roadmap #68) ──────────────────────────────────────────
 *
 * Furniture stands the way people arrange a room: against a wall or in a
 * corner, with its back to the wall; free-standing only where there is room to
 * walk round it. Nothing stands in a doorway, before a window (if it is taller
 * than the sill), on somebody's place, or at the foot of the stair; and from
 * the door one can still walk to everybody's place, to the stair and to each
 * bed's open side.
 *
 * The layout knows only rectangles (the room's x across, z from the back wall
 * to the front) and heights: `interiors.ts` asks it where a piece of a given
 * size may go, draws the piece there, and records it. The test
 * (`tests/game/roomLayout.test.ts`) checks every room of every town by the
 * same records.
 */

export interface Rect { x0: number; z0: number; x1: number; z1: number }

/** Which wall a piece stands against (its back to it). */
export type Wall = 'back' | 'west' | 'east' | 'front'

export interface Piece {
  label: string
  rect: Rect
  /** Its height above the floor: from y0 (a shelf on a wall starts high) to y1. */
  y0: number
  y1: number
  /** Lies flat (a rug): stood on, walked over. */
  flat: boolean
  wall?: Wall
}

/** Kept clear: of every piece, or (`below`) of every piece reaching higher than it (a window's sill). */
export interface Zone { label: string; rect: Rect; below?: number }

/** A place that must be reached on foot from the door. */
export interface Target { label: string; x: number; z: number }

/** A placement: where the piece's origin goes and how it is turned (front: +z, then turned by `ry`). */
export interface Spot { x: number; z: number; ry: number; rect: Rect }

/** Turns: the piece's front looks into the room from each wall. */
export const FACE: Record<Wall, number> = { back: 0, west: Math.PI / 2, east: -Math.PI / 2, front: Math.PI }

/** Half the width of a walker (the clearance kept round furniture on the way). */
export const AGENT = 0.2
/** A target counts as reached from this near. */
const REACH = 0.35
const GRID = 0.1

export const overlaps = (a: Rect, b: Rect, m = 0): boolean => a.x0 < b.x1 - m && b.x0 < a.x1 - m && a.z0 < b.z1 - m && b.z0 < a.z1 - m
const inside = (a: Rect, b: Rect, m = 0.005): boolean => a.x0 >= b.x0 - m && a.x1 <= b.x1 + m && a.z0 >= b.z0 - m && a.z1 <= b.z1 + m
export const grow = (a: Rect, d: number): Rect => ({ x0: a.x0 - d, z0: a.z0 - d, x1: a.x1 + d, z1: a.z1 + d })

export class RoomLayout {
  pieces: Piece[] = []
  /** Things hung on the walls (pictures, boards, shelves high up): kept apart from one another and from tall furniture before them. */
  hangs: Piece[] = []
  zones: Zone[] = []
  targets: Target[] = []

  constructor(readonly room: Rect, readonly door: { x: number; z: number }) {}

  zone(label: string, rect: Rect, below?: number): void {
    this.zones.push({ label, rect, below })
  }

  target(label: string, x: number, z: number): void {
    this.targets.push({ label, x, z })
  }

  /** A piece that stands where it must (a counter before its keeper, a plan's table): recorded, not searched for. */
  fixed(label: string, rect: Rect, y1: number, o: { y0?: number; flat?: boolean; wall?: Wall } = {}): Piece {
    const p = { label, rect, y0: o.y0 ?? 0, y1, flat: !!o.flat, wall: o.wall }
    this.pieces.push(p)
    return p
  }

  /** Could a piece stand here: inside the room, clear of every piece and zone, the ways still open? */
  free(rect: Rect, y1: number, o: { y0?: number; flat?: boolean; path?: boolean; label?: string } = {}): boolean {
    if (!inside(rect, this.room)) return false
    if (o.flat) return true
    const y0 = o.y0 ?? 0
    for (const p of this.pieces) if (!p.flat && p.y0 < y1 && y0 < p.y1 && overlaps(rect, p.rect)) return false
    for (const z of this.zones) if ((z.below === undefined || y1 > z.below) && overlaps(rect, z.rect)) return false
    if (o.path !== false && y0 < 1.2) {
      const before = this.reachedNow()
      for (const t of this.unreached([rect])) if (!before.has(t)) return false
    }
    return true
  }

  private cacheKey = ''
  private cacheMiss: Set<string> = new Set()
  /** The targets unreached as things stand (cached until a piece or a target is added). */
  private reachedNow(): Set<string> {
    const key = `${this.pieces.length}/${this.targets.length}`
    if (key !== this.cacheKey) {
      this.cacheKey = key
      this.cacheMiss = new Set(this.unreached())
    }
    return this.cacheMiss
  }

  /** Record a piece (after `free` said it may stand there). */
  add(label: string, s: Spot, y1: number, o: { y0?: number; flat?: boolean; wall?: Wall } = {}): Piece {
    return this.fixed(label, s.rect, y1, o)
  }

  /**
   * Where along a wall a piece `len` wide and `depth` deep may stand, nearest
   * to `prefer` (0..1 along the wall: the back wall west to east, a side wall
   * back to front). `back`: from the piece's origin to its back (half its
   * depth unless it is lopsided).
   */
  onWall(wall: Wall, len: number, depth: number, y1: number, prefer: number, o: { back?: number; y0?: number; path?: boolean; margin?: number } = {}): Spot | null {
    const r = this.room
    const back = o.back ?? depth / 2
    const m = o.margin ?? 0.02
    const along = wall === 'back' || wall === 'front' ? [r.x0, r.x1] : [r.z0, r.z1]
    const a0 = along[0]! + len / 2 + m
    const a1 = along[1]! - len / 2 - m
    if (a1 < a0) return null
    const want = along[0]! + (along[1]! - along[0]!) * prefer
    const cand: number[] = []
    for (let a = a0; a <= a1 + 1e-6; a += 0.05) cand.push(a)
    cand.sort((p, q) => Math.abs(p - want) - Math.abs(q - want))
    for (const a of cand) {
      const s = this.spotOn(wall, a, len, depth, back, m)
      if (this.free(s.rect, y1, { y0: o.y0, path: o.path })) return s
    }
    return null
  }

  /** The spot of a piece against `wall` at `a` along it. */
  spotOn(wall: Wall, a: number, len: number, depth: number, back: number, m = 0.02): Spot {
    const r = this.room
    switch (wall) {
      case 'back': return { x: a, z: r.z0 + m + back, ry: FACE.back, rect: { x0: a - len / 2, z0: r.z0 + m, x1: a + len / 2, z1: r.z0 + m + depth } }
      case 'front': return { x: a, z: r.z1 - m - back, ry: FACE.front, rect: { x0: a - len / 2, z0: r.z1 - m - depth, x1: a + len / 2, z1: r.z1 - m } }
      case 'west': return { x: r.x0 + m + back, z: a, ry: FACE.west, rect: { x0: r.x0 + m, z0: a - len / 2, x1: r.x0 + m + depth, z1: a + len / 2 } }
      case 'east': return { x: r.x1 - m - back, z: a, ry: FACE.east, rect: { x0: r.x1 - m - depth, z0: a - len / 2, x1: r.x1 - m, z1: a + len / 2 } }
    }
  }

  /** A free-standing piece (`w` across, `d` deep, unturned), nearest to (px, pz). */
  centre(w: number, d: number, y1: number, px: number, pz: number, o: { clear?: number } = {}): Spot | null {
    const r = this.room
    // Room to walk round it: kept off the walls and other pieces by `clear`.
    const c = o.clear ?? 0.5
    const cand: Array<[number, number]> = []
    for (let x = r.x0 + w / 2 + c; x <= r.x1 - w / 2 - c + 1e-6; x += 0.1) {
      for (let z = r.z0 + d / 2 + c; z <= r.z1 - d / 2 - c + 1e-6; z += 0.1) cand.push([x, z])
    }
    cand.sort((p, q) => Math.hypot(p[0] - px, p[1] - pz) - Math.hypot(q[0] - px, q[1] - pz))
    for (const [x, z] of cand) {
      const rect = { x0: x - w / 2, z0: z - d / 2, x1: x + w / 2, z1: z + d / 2 }
      if (!this.free(grow(rect, c - AGENT), y1, { path: false })) continue
      if (!this.free(rect, y1)) continue
      return { x, z, ry: 0, rect }
    }
    return null
  }

  /**
   * A place on a wall for something hung (`len` wide, from y0 up to y1): not
   * over a door or a window, not behind furniture reaching up to it, not over
   * another thing hung there.
   */
  hang(wall: Wall, len: number, y0: number, y1: number, prefer: number, avoid: Rect[] = []): Spot | null {
    const r = this.room
    const along = wall === 'back' || wall === 'front' ? [r.x0, r.x1] : [r.z0, r.z1]
    const want = along[0]! + (along[1]! - along[0]!) * prefer
    const cand: number[] = []
    for (let a = along[0]! + len / 2 + 0.1; a <= along[1]! - len / 2 - 0.1 + 1e-6; a += 0.05) cand.push(a)
    cand.sort((p, q) => Math.abs(p - want) - Math.abs(q - want))
    for (const a of cand) {
      const s = this.spotOn(wall, a, len, 0.06, 0.0, 0.0)
      const near = this.spotOn(wall, a, len, 0.6, 0, 0).rect
      if (avoid.some(v => overlaps(near, v))) continue
      if (this.pieces.some(p => !p.flat && p.y1 > y0 - 0.05 && overlaps(near, p.rect))) continue
      if (this.hangs.some(p => p.wall === wall && p.y0 < y1 && y0 < p.y1 && overlaps(grow(s.rect, 0.05), p.rect))) continue
      return s
    }
    return null
  }

  /** Record something hung on a wall. */
  addHang(label: string, s: Spot, wall: Wall, y0: number, y1: number): void {
    this.hangs.push({ label, rect: s.rect, y0, y1, flat: false, wall })
  }

  /** The targets no longer reached on foot from the door (with `extra` pieces in the way). */
  unreached(extra: Rect[] = []): string[] {
    const r = this.room
    const nx = Math.max(1, Math.ceil((r.x1 - r.x0) / GRID))
    const nz = Math.max(1, Math.ceil((r.z1 - r.z0) / GRID))
    const block = this.baseBlock(nx, nz).slice()
    for (const b of extra) {
      for (let j = 0; j < nz; j++) {
        const z = r.z0 + (j + 0.5) * GRID
        if (z <= b.z0 - AGENT || z >= b.z1 + AGENT) continue
        for (let i = 0; i < nx; i++) {
          const x = r.x0 + (i + 0.5) * GRID
          if (x > b.x0 - AGENT && x < b.x1 + AGENT) block[j * nx + i] = 1
        }
      }
    }
    const cellOf = (x: number, z: number): number => {
      const i = Math.min(nx - 1, Math.max(0, Math.floor((x - r.x0) / GRID)))
      const j = Math.min(nz - 1, Math.max(0, Math.floor((z - r.z0) / GRID)))
      return j * nx + i
    }
    // From just inside the door.
    const seen = new Uint8Array(nx * nz)
    const q: number[] = []
    const start = cellOf(this.door.x, r.z1 - GRID / 2)
    if (block[start]) return this.targets.map(t => t.label).concat('door')
    seen[start] = 1
    q.push(start)
    while (q.length) {
      const k = q.pop()!
      const i = k % nx
      const j = (k - i) / nx
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const ni = i + di
        const nj = j + dj
        if (ni < 0 || nj < 0 || ni >= nx || nj >= nz) continue
        const nk = nj * nx + ni
        if (seen[nk] || block[nk]) continue
        seen[nk] = 1
        q.push(nk)
      }
    }
    const out: string[] = []
    for (const t of this.targets) {
      let ok = false
      for (let j = 0; j < nz && !ok; j++) {
        for (let i = 0; i < nx && !ok; i++) {
          if (!seen[j * nx + i]) continue
          const x = r.x0 + (i + 0.5) * GRID
          const z = r.z0 + (j + 0.5) * GRID
          if (Math.hypot(x - t.x, z - t.z) <= REACH) ok = true
        }
      }
      if (!ok) out.push(t.label)
    }
    return out
  }

  private blockKey = -1
  private blockGrid = new Uint8Array(0)
  /** The cells a walker cannot stand in: by the walls, round every piece on the floor (cached per piece count). */
  private baseBlock(nx: number, nz: number): Uint8Array {
    if (this.blockKey === this.pieces.length && this.blockGrid.length === nx * nz) return this.blockGrid
    const r = this.room
    const block = new Uint8Array(nx * nz)
    const blockers = this.pieces.filter(p => !p.flat && p.y0 < 1.2).map(p => p.rect)
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const x = r.x0 + (i + 0.5) * GRID
        const z = r.z0 + (j + 0.5) * GRID
        if (x - r.x0 < AGENT || r.x1 - x < AGENT || z - r.z0 < AGENT) { block[j * nx + i] = 1; continue }
        for (const b of blockers) if (x > b.x0 - AGENT && x < b.x1 + AGENT && z > b.z0 - AGENT && z < b.z1 + AGENT) { block[j * nx + i] = 1; break }
      }
    }
    this.blockKey = this.pieces.length
    this.blockGrid = block
    return block
  }

  /** Everything wrong with the room, in words (the test's view): overlaps, blocked zones, unreached places. */
  problems(): string[] {
    const out: string[] = []
    const solid = this.pieces.filter(p => !p.flat)
    for (const p of [...solid, ...this.hangs]) if (!inside(p.rect, this.room, 0.02)) out.push(`${p.label} is through a wall`)
    for (let a = 0; a < solid.length; a++) {
      for (let b = a + 1; b < solid.length; b++) {
        const p = solid[a]!
        const q = solid[b]!
        if (p.y0 < q.y1 && q.y0 < p.y1 && overlaps(p.rect, q.rect, 0.01)) out.push(`${p.label} overlaps ${q.label}`)
      }
    }
    for (const z of this.zones) for (const p of solid) if ((z.below === undefined || p.y1 > z.below) && overlaps(z.rect, p.rect, 0.01)) out.push(`${p.label} stands in ${z.label}`)
    for (let a = 0; a < this.hangs.length; a++) {
      for (let b = a + 1; b < this.hangs.length; b++) {
        const p = this.hangs[a]!
        const q = this.hangs[b]!
        if (p.wall === q.wall && p.y0 < q.y1 && q.y0 < p.y1 && overlaps(p.rect, q.rect, 0.01)) out.push(`${p.label} hangs over ${q.label}`)
      }
    }
    for (const t of this.unreached()) out.push(`${t} cannot be reached from the door`)
    return out
  }
}
