import { Matrix4 } from 'three'
import type { ClassId } from '../data/skills'
import { CLASSES } from '../data/skills'
import type { TownJob, TownStyle } from '../data/zones'
import { shade, under, type Col, type Kit, type Mesher } from './archKit'
import { barrel } from './townProps'
import { RoomLayout, overlaps, type Rect, type Spot, type Wall } from './roomLayout'

/**
 * ─── Interiors: furniture, and the story a room tells (roadmap #62) ──────────
 *
 * A room is read from what is in it and how it is left: a family's table set
 * for supper with one chair pulled out, a knight's armour on its stand with the
 * polishing cloth over it, a taproom's notice board and a patron's pack by his
 * stool. Everything here is drawn in the same chunky cel style as the houses:
 * bevelled boxes (`Mesher.rbox`), turned legs, drawers with knobs, cloth whose
 * folds are painted in its vertex colours.
 *
 * Two kits: `B` holds what makes the room (beds, tables, the hearth, the bar),
 * drawn whenever the room can be seen; `L` the small things that tell its story
 * (books, mugs, a toy, the drawings on the wall), drawn only while the front is
 * lifted, and left out altogether on a weak device (`L` is null then).
 *
 * Coordinates are the room's: x across the house, z from the back wall (`z0`)
 * to the front (`z1`, the wall that lifts away), y up from the floor's ground.
 * Every piece is authored with its front towards +z, standing on y = 0, and is
 * turned and placed by `put`. Nothing lies in a face of anything else: every
 * layer stands a real step (≥ 1 cm, more for big faces) off the one under it
 * (`tests/game/zfight.test.ts`).
 */

/** What a room is (it chooses the furniture and the story). */
export type RoomStory = 'home' | 'inn' | 'healer' | 'shop' | 'school'

export interface RoomCtx {
  /** The room's furniture (always drawn with the room). */
  B: Kit
  /** The clutter that tells its story: drawn only while the front is lifted; null on a weak device. */
  L: Kit | null
  /** The inside faces of the walls, and the floor's height. */
  x0: number
  x1: number
  z0: number
  z1: number
  fy: number
  /** Up to the ceiling (the storey's height). */
  top: number
  /** Where the door is (x, on the front). */
  doorX: number
  /** The owner's work place is by the west wall (else the east), in the front row at `wz`. */
  west: boolean
  wz: number
  story: RoomStory
  job?: TownJob
  cls?: ClassId
  ruined: boolean
  style: TownStyle
  /** Windows in the side walls: which wall (−1 west, 1 east) and where along it. */
  wins: Array<{ side: -1 | 1; z: number }>
  /** Which of the variations of its kind this room is (two homes in a town are never alike). */
  vary: number
  /** The people's places the plan made (room coordinates): the worker's, a seat, the bard's. */
  work: { x: number; z: number } | null
  seat: { x: number; z: number; ry: number } | null
  bard: { x: number; z: number } | null
  /** A taproom's tables and the stools round them (the plan's props). */
  tables: Array<{ x: number; z: number }>
  stools: Array<{ x: number; z: number }>
  /** There is a floor above: a staircase goes up to it. */
  upper: boolean
  r: () => number
}

// ─── Colours ─────────────────────────────────────────────────────────────────

const OAK = '#a8743f'
const WOOD = '#8a5a34'
const DARK = '#5e3c24'
const IRON = '#4a4a54'
const BRASS = '#d8b04a'
const LINEN = '#f2ead8'
const STONE = '#9a8e88'

/** A ruin's version of a colour: scorched, faded. */
const ash = (c: Col, ruined: boolean): Col => (ruined ? shade(c, 0.55) : c)

// ─── Putting things down ─────────────────────────────────────────────────────

/** Draw `fn` turned by `ry` at (x, z) on the floor (y up from it). */
const put = (k: Kit, x: number, y: number, z: number, ry: number, fn: () => void): void => under(k, x, y, z, ry, fn)

/** Turns: a piece against the back wall faces +z (0); against the west wall +x; the east −x. */
const BACK = 0
const WEST = Math.PI / 2
const EAST = -Math.PI / 2

/** Fold shading: a smooth, irregular ripple for cloth. */
const fold = (a: number, b: number, seed: number): number => Math.sin(a * 2.3 + seed) * 0.55 + Math.sin(b * 1.7 + a * 0.9 + seed * 1.3) * 0.45

/**
 * Cloth laid over a top (a quilt, a tablecloth, a cushion): a grid whose
 * height and shade ripple (the folds), in patches of `cols`, hanging `drop`
 * down the sides named in `sides` ('n' 's' 'e' 'w'), `out` clear of them.
 */
const drape = (m: Mesher, x0: number, z0: number, x1: number, z1: number, y: number, cols: Col[], o: { n?: number; lift?: number; drop?: number; sides?: string; out?: number; seed?: number } = {}): void => {
  const n = o.n ?? 4
  const lift = o.lift ?? 0.02
  const seed = o.seed ?? 0
  const out = o.out ?? 0.02
  const nx = Math.max(1, Math.round(n * (x1 - x0) / Math.max(x1 - x0, z1 - z0)))
  const nz = Math.max(1, Math.round(n * (z1 - z0) / Math.max(x1 - x0, z1 - z0)))
  const X = (i: number): number => x0 + ((x1 - x0) * i) / nx
  const Z = (j: number): number => z0 + ((z1 - z0) * j) / nz
  const H = (i: number, j: number): number => y + lift * (0.55 + 0.45 * fold(i, j, seed))
  const S = (c: Col, i: number, j: number): Col => shade(c, 0.9 + 0.12 * fold(i + 0.5, j + 0.3, seed))
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const c = cols[(i + j * (cols.length - 1)) % cols.length]!
      m.quad(X(i), H(i, j + 1), Z(j + 1), X(i + 1), H(i + 1, j + 1), Z(j + 1), X(i + 1), H(i + 1, j), Z(j), X(i), H(i, j), Z(j),
        [S(c, i, j + 1), S(c, i + 1, j + 1), S(c, i + 1, j), S(c, i, j)])
    }
  }
  const drop = o.drop ?? 0
  if (drop <= 0) return
  const sides = o.sides ?? 'nsew'
  // The hanging sides: straight down, `out` clear of what is under, a wavy hem.
  const hem = (t: number): number => y - drop + 0.03 * fold(t * 3, 0.5, seed)
  if (sides.includes('s')) for (let i = 0; i < nx; i++) {
    const c = shade(cols[(i + (nz - 1) * 3) % cols.length]!, 0.86)
    m.quad(X(i), hem(i), z1 + out, X(i + 1), hem(i + 1), z1 + out, X(i + 1), H(i + 1, nz), z1 + out, X(i), H(i, nz), z1 + out, [shade(c, 0.9), shade(c, 0.9), c, c])
  }
  if (sides.includes('n')) for (let i = 0; i < nx; i++) {
    const c = shade(cols[i % cols.length]!, 0.8)
    m.quad(X(i + 1), hem(i + 1), z0 - out, X(i), hem(i), z0 - out, X(i), H(i, 0), z0 - out, X(i + 1), H(i + 1, 0), z0 - out, [shade(c, 0.9), shade(c, 0.9), c, c])
  }
  if (sides.includes('e')) for (let j = 0; j < nz; j++) {
    const c = shade(cols[(nx - 1 + j * 3) % cols.length]!, 0.84)
    m.quad(x1 + out, hem(j + 1), Z(j + 1), x1 + out, hem(j), Z(j), x1 + out, H(nx, j), Z(j), x1 + out, H(nx, j + 1), Z(j + 1), [shade(c, 0.9), shade(c, 0.9), c, c])
  }
  if (sides.includes('w')) for (let j = 0; j < nz; j++) {
    const c = shade(cols[(j * 3) % cols.length]!, 0.84)
    m.quad(x0 - out, hem(j), Z(j), x0 - out, hem(j + 1), Z(j + 1), x0 - out, H(0, j + 1), Z(j + 1), x0 - out, H(0, j), Z(j), [shade(c, 0.9), shade(c, 0.9), c, c])
  }
}

/**
 * Cloth hanging from a line (a curtain, a tapestry, an apron on its hook):
 * from (xa, za) to (xb, zb) at `yt` down to `yb`, pleated `pleats` times in and
 * out by `depth`, facing to the left of a→b; `pinch` gathers the hem.
 */
export const hang = (m: Mesher, xa: number, za: number, xb: number, zb: number, yt: number, yb: number, c: Col, o: { pleats?: number; depth?: number; pinch?: number; seed?: number } = {}): void => {
  const n = o.pleats ?? 4
  const dp = o.depth ?? 0.025
  const pinch = o.pinch ?? 0
  const seed = o.seed ?? 0
  const dx = xb - xa
  const dz = zb - za
  const len = Math.hypot(dx, dz) || 1
  // The face looks to the left of a→b.
  const nx = -dz / len
  const nz = dx / len
  const mx = (xa + xb) / 2
  const mz = (za + zb) / 2
  for (let i = 0; i < n * 2; i++) {
    const t0 = i / (n * 2)
    const t1 = (i + 1) / (n * 2)
    const d0 = (i % 2 ? dp : 0)
    const d1 = (i % 2 ? 0 : dp)
    // The hem is drawn in towards the middle by `pinch`.
    const at = (t: number, d: number, y: number, low: boolean): number[] => {
      const k = low ? 1 - pinch : 1
      const x = mx + (xa + dx * t - mx) * k + nx * d
      const z = mz + (za + dz * t - mz) * k + nz * d
      return [x, y + (low ? 0.02 * fold(t * 6, 0, seed) : 0), z]
    }
    const a = at(t0, d0, yb, true), b = at(t1, d1, yb, true), cc = at(t1, d1, yt, false), d = at(t0, d0, yt, false)
    const k0 = shade(c, i % 2 ? 0.82 : 1.0)
    const k1 = shade(c, i % 2 ? 0.95 : 0.86)
    m.quad(a[0]!, a[1]!, a[2]!, b[0]!, b[1]!, b[2]!, cc[0]!, cc[1]!, cc[2]!, d[0]!, d[1]!, d[2]!, [shade(k0, 0.88), shade(k1, 0.88), k1, k0])
  }
}

// ─── The pieces (front towards +z, standing on y = 0) ────────────────────────

/** A chair: a seat on turned legs and a back of two posts and slats. */
const chair = (k: Kit, wood: Col): void => {
  const h = k.hull
  const d = k.detail
  h.rbox(-0.21, 0.42, -0.2, 0.21, 0.48, 0.21, 0.02, { top: shade(wood, 1.12), side: wood })
  for (const [a, b] of [[-0.16, -0.15], [0.16, -0.15], [-0.16, 0.16], [0.16, 0.16]] as const) d.cyl(a, 0, b, 0.026, 0.032, 0.42, 6, shade(wood, 0.8))
  for (const s of [-1, 1]) h.beam(s * 0.17, 0.48, -0.17, s * 0.17, 1.02, -0.21, 0.05, wood)
  d.rbox(-0.15, 0.66, -0.215, 0.15, 0.74, -0.175, 0.012, shade(wood, 1.05))
  d.rbox(-0.15, 0.86, -0.225, 0.15, 0.95, -0.185, 0.012, shade(wood, 1.05))
}

/** A chair knocked over, lying on its side (a ruin, a hurried leaving). */
const chairDown = (k: Kit, wood: Col): void => {
  const m = new Matrix4().makeRotationZ(Math.PI / 2).setPosition(0.5, 0.225, 0)
  for (const x of [k.hull, k.detail, k.glow]) x.pushMatrix(m)
  chair(k, wood)
  for (const x of [k.hull, k.detail, k.glow]) x.pop()
}

/** A table on four turned legs, `w` × `l`, `h` high. */
const table = (k: Kit, w: number, l: number, h: number, wood: Col): void => {
  k.hull.rbox(-w / 2, h - 0.07, -l / 2, w / 2, h, l / 2, 0.025, { top: shade(wood, 1.15), side: wood })
  k.detail.rbox(-w / 2 + 0.07, h - 0.17, -l / 2 + 0.07, w / 2 - 0.07, h - 0.07, l / 2 - 0.07, 0.01, shade(wood, 0.85))
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (w / 2 - 0.1)
    const z = sz * (l / 2 - 0.1)
    k.detail.cyl(x, 0, z, 0.035, 0.045, h - 0.17, 6, shade(wood, 0.8))
    k.detail.ball(x, h * 0.45, z, 0.055, shade(wood, 0.9), 6, 3)
  }
}

/** A bed: a frame with head- and footboards, a mattress, pillows and a patched quilt. */
const bed = (k: Kit, w: number, l: number, quilt: Col[], o: { messy?: boolean; seed?: number; ruined?: boolean } = {}): void => {
  const h = k.hull
  const d = k.detail
  const wood = ash(WOOD, !!o.ruined)
  h.rbox(-w / 2, 0.14, -l / 2, w / 2, 0.34, l / 2, 0.025, { top: shade(wood, 1.1), side: wood })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) d.rbox(sx * (w / 2 - 0.06) - 0.04, 0, sz * (l / 2 - 0.06) - 0.04, sx * (w / 2 - 0.06) + 0.04, 0.14, sz * (l / 2 - 0.06) + 0.04, 0.01, shade(wood, 0.8))
  // Head- and footboard, with knobs on their posts.
  h.rbox(-w / 2 - 0.03, 0, -l / 2 - 0.08, w / 2 + 0.03, 0.98, -l / 2 + 0.0, 0.03, { top: shade(wood, 1.15), side: shade(wood, 0.95) })
  d.rbox(-w / 2 + 0.1, 0.5, -l / 2 + 0.0, w / 2 - 0.1, 0.86, -l / 2 + 0.02, 0.01, shade(wood, 1.12))
  h.rbox(-w / 2 - 0.03, 0, l / 2, w / 2 + 0.03, 0.62, l / 2 + 0.07, 0.025, { top: shade(wood, 1.15), side: shade(wood, 0.95) })
  for (const sx of [-1, 1]) {
    d.ball(sx * (w / 2 - 0.01), 1.03, -l / 2 - 0.04, 0.06, shade(wood, 1.2), 6, 4)
    d.ball(sx * (w / 2 - 0.01), 0.67, l / 2 + 0.035, 0.05, shade(wood, 1.2), 6, 4)
  }
  // Mattress, sheet, pillows.
  d.rbox(-w / 2 + 0.04, 0.34, -l / 2 + 0.02, w / 2 - 0.04, 0.48, l / 2 - 0.02, 0.05, { top: LINEN, side: shade(LINEN, 0.9) })
  const pw = w > 1.1 ? (w - 0.24) / 2 : w - 0.2
  const px = w > 1.1 ? [-(pw / 2 + 0.04), pw / 2 + 0.04] : [0]
  for (const [i, x] of px.entries()) {
    const off = o.messy && i === 0 ? 0.08 : 0
    d.rbox(x - pw / 2 + off, 0.49, -l / 2 + 0.06, x + pw / 2 + off, 0.62, -l / 2 + 0.4, 0.05, { top: '#fffaf0', side: '#efe6d6' })
  }
  // The quilt, turned down at the head, hanging over the sides and the foot.
  drape(d, -w / 2 + 0.02, -l / 2 + (o.messy ? 0.62 : 0.48), w / 2 - 0.02, l / 2 - 0.02, 0.5, quilt, { n: 7, lift: o.messy ? 0.05 : 0.025, drop: 0.2, sides: 'ew', out: 0.045, seed: o.seed ?? 1 })
  d.box(-w / 2 + 0.03, 0.5, -l / 2 + (o.messy ? 0.5 : 0.4), w / 2 - 0.03, 0.535, -l / 2 + (o.messy ? 0.62 : 0.48), { top: '#fffaf0', side: '#efe6d6' }, 'b')
}

/** A wardrobe: two panelled doors with knobs, a crown, little feet. */
const wardrobe = (k: Kit, w: number, wood: Col): void => {
  const h = k.hull
  const d = k.detail
  h.rbox(-w / 2, 0.08, -0.28, w / 2, 1.85, 0.28, 0.03, { top: shade(wood, 1.1), side: wood })
  h.rbox(-w / 2 - 0.04, 1.85, -0.31, w / 2 + 0.04, 1.94, 0.32, 0.02, shade(wood, 1.15))
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) d.rbox(sx * (w / 2 - 0.08) - 0.04, 0, sz * 0.2 - 0.04, sx * (w / 2 - 0.08) + 0.04, 0.08, sz * 0.2 + 0.04, 0.01, shade(wood, 0.75))
  for (const sx of [-1, 1]) {
    const a = sx < 0 ? -w / 2 + 0.05 : 0.015
    const b = sx < 0 ? -0.015 : w / 2 - 0.05
    d.rbox(a, 0.16, 0.28, b, 1.76, 0.305, 0.012, shade(wood, 1.06))
    d.rbox(a + 0.06, 0.28, 0.305, b - 0.06, 0.92, 0.32, 0.01, shade(wood, 0.94))
    d.rbox(a + 0.06, 1.02, 0.305, b - 0.06, 1.64, 0.32, 0.01, shade(wood, 0.94))
    d.ball(sx * 0.06, 0.98, 0.34, 0.03, BRASS, 5, 3)
  }
}

/** A chest of drawers: three drawers with two knobs each. */
const drawers = (k: Kit, w: number, wood: Col): void => {
  k.hull.rbox(-w / 2, 0.06, -0.23, w / 2, 0.84, 0.23, 0.025, { top: shade(wood, 1.1), side: wood })
  k.hull.rbox(-w / 2 - 0.03, 0.84, -0.25, w / 2 + 0.03, 0.9, 0.26, 0.015, shade(wood, 1.18))
  for (const sx of [-1, 1]) k.detail.rbox(sx * (w / 2 - 0.07) - 0.035, 0, -0.03, sx * (w / 2 - 0.07) + 0.035, 0.06, 0.15, 0.01, shade(wood, 0.75))
  for (let i = 0; i < 3; i++) {
    const y0 = 0.12 + i * 0.235
    k.detail.rbox(-w / 2 + 0.05, y0, 0.23, w / 2 - 0.05, y0 + 0.2, 0.255, 0.01, shade(wood, i % 2 ? 1.0 : 1.07))
    for (const sx of [-1, 1]) k.detail.ball(sx * w * 0.22, y0 + 0.1, 0.275, 0.025, BRASS, 5, 3)
  }
}

/** A bench along a wall, with a cushion. */
const bench = (k: Kit, w: number, wood: Col, cushion: Col, seed: number): void => {
  k.hull.rbox(-w / 2, 0.38, -0.2, w / 2, 0.45, 0.2, 0.02, { top: shade(wood, 1.12), side: wood })
  for (const sx of [-1, 1]) k.detail.rbox(sx * (w / 2 - 0.1) - 0.04, 0, -0.16, sx * (w / 2 - 0.1) + 0.04, 0.38, 0.16, 0.01, shade(wood, 0.85))
  k.detail.rbox(-w / 2 + 0.06, 0.46, -0.17, w / 2 - 0.06, 0.52, 0.17, 0.04, { top: cushion, side: shade(cushion, 0.85) })
  for (let i = 1; i < 4; i++) k.detail.ball(-w / 2 + (w * i) / 4, 0.525, 0, 0.02, shade(cushion, 0.7), 4, 2)
  void seed
}

/** A shelf of boards on a wall, `w` wide, `rows` boards from `y0` up, 0.3 deep. */
const shelfBoards = (k: Kit, w: number, rows: number, y0: number, gap: number, wood: Col): number[] => {
  const ys: number[] = []
  for (let i = 0; i < rows; i++) {
    const y = y0 + i * gap
    k.hull.rbox(-w / 2, y - 0.04, 0, w / 2, y, 0.3, 0.01, { top: shade(wood, 1.12), side: wood })
    for (const sx of [-1, 1]) k.detail.rbox(sx * (w / 2 - 0.08) - 0.02, y - 0.17, 0, sx * (w / 2 - 0.08) + 0.02, y - 0.04, 0.14, 0.008, shade(wood, 0.8))
    ys.push(y)
  }
  return ys
}

/** What stands on a shelf from x0 to x1 at height y: books, jars, plates, bowls. */
const shelfStuff = (m: Mesher, glow: Mesher, x0: number, x1: number, y: number, mix: 'books' | 'kitchen' | 'jars' | 'potions' | 'rocks', r: () => number, ruined: boolean): void => {
  let x = x0
  const books = ['#c9483a', '#3f6fd6', '#5aa84a', '#d8b04a', '#7a3fa0', '#2a6a7a', '#a86a3a']
  while (x < x1 - 0.06) {
    const t = r()
    if (ruined && t < 0.45) { x += 0.12; continue }
    if (mix === 'books' || (mix === 'kitchen' && t < 0.15)) {
      const bw = 0.05 + r() * 0.05
      const bh = 0.18 + r() * 0.12
      const col = books[Math.floor(r() * books.length)]!
      if (r() < 0.12 && x + 0.2 < x1) {
        // One leaning on its neighbour.
        m.pushMatrix(new Matrix4().makeRotationZ(-0.35).setPosition(x + 0.02, y, 0))
        m.rbox(0, 0.001, 0.06, bw, bh, 0.26, 0.008, { top: '#efe6d6', side: col })
        m.pop()
        x += bw + 0.1
        continue
      }
      m.rbox(x, y + 0.001, 0.05, x + bw, y + bh, 0.26, 0.008, { top: '#efe6d6', side: col })
      if (bh > 0.24) m.box(x - 0.002, y + bh - 0.06, 0.265, x + bw + 0.002, y + bh - 0.04, 0.275, BRASS, 'b')
      x += bw + 0.012
    } else if (mix === 'kitchen' && t < 0.55) {
      // A plate standing on its edge against the wall, or a bowl.
      if (t < 0.4) {
        m.pushMatrix(new Matrix4().makeRotationX(Math.PI / 2 - 0.15).setPosition(x + 0.1, y + 0.1, 0.12))
        m.cyl(0, -0.012, 0, 0.1, 0.1, 0.024, 10, '#e8e4dc', '#f6f2ea')
        m.pop()
        x += 0.24
      } else {
        m.cyl(x + 0.08, y, 0.15, 0.05, 0.08, 0.06, 8, '#c98a5a', '#7a4a2a')
        x += 0.19
      }
    } else if (mix === 'rocks') {
      const col = ['#8a8f9a', '#b06aff', '#5fd8ff', '#c9a24a', '#7dd84a'][Math.floor(r() * 5)]!
      if (r() < 0.5) m.cyl(x + 0.06, y, 0.15, 0.06, 0, 0.16 + r() * 0.1, 5, col)
      else m.ball(x + 0.06, y + 0.05, 0.15, 0.06, col, 5, 3, 0.8)
      x += 0.16
    } else {
      // A jar with a lid (or, for potions, a stoppered bottle with a glow).
      const jw = 0.05 + r() * 0.03
      const jh = 0.12 + r() * 0.1
      const col = mix === 'potions' ? ['#7dff8a', '#ff4a6a', '#5fd8ff', '#ffd84a', '#b06aff'][Math.floor(r() * 5)]! : ['#c9b48a', '#a8c4b8', '#d8a070', '#e8d8a8'][Math.floor(r() * 4)]!
      if (mix === 'potions' && !ruined) {
        glow.cyl(x + jw, y, 0.15, jw, jw * 0.8, jh * 0.7, 7, col, col)
        m.cyl(x + jw, y + jh * 0.7, 0.15, jw * 0.4, jw * 0.35, jh * 0.3, 5, '#e8f0f4', '#8a6a44')
      } else {
        m.cyl(x + jw, y, 0.15, jw, jw, jh, 7, col)
        m.cyl(x + jw, y + jh, 0.15, jw + 0.008, jw + 0.008, 0.03, 7, '#8a5a34', '#a06a3a')
      }
      x += jw * 2 + 0.03
    }
  }
}

/** A candle: wax, a brass dish, a flame (a warm glow point). */
const candle = (k: Kit, x: number, y: number, z: number, lit: boolean, tall = 0.12): void => {
  k.detail.cyl(x, y, z, 0.06, 0.05, 0.02, 8, BRASS, shade(BRASS, 1.1))
  k.detail.cyl(x, y + 0.02, z, 0.022, 0.022, tall, 6, '#f6efe0', '#fffaf0')
  if (lit) k.glow.ball(x, y + 0.04 + tall, z, 0.032, '#ffd27a', 5, 3, 1.5)
}

/** A potted plant: a clay pot, soil, leaves (or a tall fern). */
const plant = (k: Kit, s: number, fern: boolean, ruined: boolean): void => {
  k.detail.cyl(0, 0, 0, 0.12 * s, 0.16 * s, 0.24 * s, 8, '#c2683e', '#4a3424')
  k.detail.cyl(0, 0.22 * s, 0, 0.17 * s, 0.17 * s, 0.04 * s, 8, '#d0784a', '#4a3424')
  const leaf = ruined ? '#7a6a3a' : '#4f9a44'
  if (fern) for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    k.detail.beam(Math.sin(a) * 0.03 * s, (0.25 + i * 0.015) * s, Math.cos(a) * 0.03 * s, Math.sin(a) * 0.27 * s, (ruined ? 0.3 : 0.6 + i * 0.02) * s, Math.cos(a) * 0.27 * s, 0.06 * s, shade(leaf, 0.9 + (i % 2) * 0.2), 0.015)
  }
  else {
    k.detail.ball(0, 0.36 * s, 0, 0.16 * s, leaf, 6, 4)
    k.detail.ball(0.08 * s, 0.46 * s, 0.03 * s, 0.1 * s, shade(leaf, 1.2), 5, 3)
    if (!ruined) for (const a of [0.4, 2.4, 4.4]) k.detail.ball(Math.sin(a) * 0.12 * s, 0.42 * s, Math.cos(a) * 0.12 * s, 0.035 * s, '#ff8aa8', 4, 2)
  }
}

/** A rug: a border, a field, a pattern of diamonds, fringes at the ends. */
const rug = (m: Mesher, w: number, l: number, cols: [Col, Col, Col]): void => {
  m.box(-w / 2, 0, -l / 2, w / 2, 0.018, l / 2, { top: cols[0], side: shade(cols[0], 0.8) }, 'b')
  m.box(-w / 2 + 0.1, 0.018, -l / 2 + 0.1, w / 2 - 0.1, 0.028, l / 2 - 0.1, { top: cols[1], side: cols[1] }, 'b')
  const n = Math.max(1, Math.round((l - 0.3) / 0.55))
  for (let i = 0; i < n; i++) {
    const z = -l / 2 + 0.15 + ((l - 0.3) * (i + 0.5)) / n
    const s = Math.min(0.22, w * 0.22)
    m.quad(0, 0.038, z + s, s, 0.038, z, 0, 0.038, z - s, -s, 0.038, z, cols[2])
  }
  for (const sz of [-1, 1]) for (let x = -w / 2 + 0.06; x < w / 2 - 0.02; x += 0.08) m.beam(x, 0.005, sz * (l / 2), x, 0.005, sz * (l / 2 + 0.07), 0.025, LINEN, 0.008)
}

/** A round rug (before a hearth, by a bed). */
const rugRound = (m: Mesher, rad: number, cols: [Col, Col]): void => {
  m.cyl(0, 0, 0, rad, rad, 0.018, 14, shade(cols[0], 0.8), cols[0])
  m.cyl(0, 0.018, 0, rad * 0.7, rad * 0.7, 0.01, 14, cols[1], cols[1])
  m.cyl(0, 0.028, 0, rad * 0.35, rad * 0.35, 0.01, 12, cols[0], cols[0])
}

/** A cooking hearth: stone cheeks and lintel, a fire (or cold ash), a pot on its hook, a kettle, a mantel. */
const hearthKitchen = (k: Kit, L: Kit | null, top: number, o: { lit: boolean; stone: Col; pot: boolean }): void => {
  const h = k.hull
  const d = k.detail
  const st = o.stone
  // Cheeks, lintel and the back of the fire place.
  for (const sx of [-1, 1]) h.rbox(sx < 0 ? -0.7 : 0.38, 0, -0.42, sx < 0 ? -0.38 : 0.7, 1.05, 0.12, 0.04, { top: shade(st, 1.1), side: st })
  h.rbox(-0.74, 1.05, -0.42, 0.74, 1.3, 0.16, 0.04, { top: shade(st, 1.12), side: shade(st, 1.04) })
  d.box(-0.38, 0, -0.42, 0.38, 1.05, -0.38, '#2a2026', 'b')
  d.box(-0.38, 0.0, -0.38, 0.38, 0.06, 0.1, { top: '#3a3034', side: '#2a2026' }, 'b')
  // The chimney breast up to the ceiling, and the mantel shelf.
  h.rbox(-0.6, 1.3, -0.42, 0.6, top - 0.02, -0.06, 0.03, { top: st, side: shade(st, 0.95) })
  h.rbox(-0.8, 1.3, -0.06, 0.8, 1.37, 0.24, 0.015, shade(WOOD, 1.1))
  // Logs, and the fire on them (or cold grey ash).
  d.beam(-0.22, 0.12, -0.12, 0.22, 0.1, -0.02, 0.09, '#5a3a24', 0.09)
  d.beam(-0.2, 0.12, 0.02, 0.18, 0.14, -0.14, 0.08, '#4a2e1c', 0.08)
  if (o.lit) {
    k.glow.ball(0, 0.25, -0.08, 0.17, '#ff7a2a', 6, 4, 1.25)
    k.glow.ball(0.04, 0.34, -0.06, 0.1, '#ffd24a', 5, 3, 1.4)
  } else {
    d.ball(0, 0.08, -0.08, 0.16, '#6a6466', 6, 3, 0.35)
  }
  if (o.pot) {
    // A crane arm from the cheek, a pot on its hook.
    d.beam(-0.36, 0.86, -0.15, 0.04, 0.86, -0.15, 0.03, IRON)
    d.beam(0.0, 0.86, -0.15, 0.0, 0.62, -0.15, 0.015, IRON)
    h.cyl(0, 0.36, -0.15, 0.13, 0.17, 0.24, 9, '#2e2a30', o.lit ? '#c9a070' : '#3a3438')
    d.beam(-0.16, 0.6, -0.15, 0.16, 0.6, -0.15, 0.02, IRON)
  }
  if (!L) return
  // A kettle on the hearth stone, jars and plates on the mantel.
  L.detail.ball(0.52, 0.06 + 0.11, 0.2, 0.11, '#5a5a64', 7, 4, 0.85)
  L.detail.beam(0.6, 0.18, 0.2, 0.7, 0.26, 0.2, 0.025, '#5a5a64')
  L.detail.beam(0.47, 0.3, 0.2, 0.57, 0.3, 0.2, 0.02, '#3a3a44')
  L.detail.cyl(0.52, 0.26, 0.2, 0.04, 0.04, 0.02, 6, '#3a3a44', '#4a4a54')
  for (const [x, c] of [[-0.6, '#c9b48a'], [-0.42, '#d8a070'], [0.5, '#a8c4b8']] as const) {
    L.detail.cyl(x, 1.37, 0.1, 0.05, 0.05, 0.13, 7, c)
    L.detail.cyl(x, 1.5, 0.1, 0.058, 0.058, 0.025, 7, '#8a5a34', '#a06a3a')
  }
  L.detail.pushMatrix(new Matrix4().makeRotationX(Math.PI / 2 - 0.2).setPosition(0.05, 1.5, 0.0))
  L.detail.cyl(0, -0.012, 0, 0.12, 0.12, 0.024, 10, '#4a7ab0', '#e8e4dc')
  L.detail.pop()
}

/** A washbasin on a little stand, a jug beside it, a towel on the rail. */
const washstand = (k: Kit, L: Kit | null): void => {
  k.hull.rbox(-0.3, 0.7, -0.22, 0.3, 0.76, 0.22, 0.015, { top: shade(OAK, 1.1), side: OAK })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.detail.cyl(sx * 0.24, 0, sz * 0.16, 0.025, 0.03, 0.7, 6, shade(OAK, 0.8))
  k.detail.rbox(-0.25, 0.18, -0.17, 0.25, 0.22, 0.17, 0.01, shade(OAK, 0.9))
  k.detail.cyl(0, 0.76, 0, 0.16, 0.21, 0.1, 10, '#e8e4dc', '#8ab8d8')
  if (!L) return
  L.detail.cyl(0.21, 0.76, -0.1, 0.05, 0.065, 0.2, 7, '#c9d8e8', '#4a6a8a')
  L.detail.beam(0.27, 0.92, -0.1, 0.29, 0.82, -0.1, 0.018, '#c9d8e8')
  L.detail.beam(-0.31, 0.62, -0.18, -0.31, 0.62, 0.18, 0.02, OAK)
  hang(L.detail, -0.34, 0.12, -0.34, -0.12, 0.66, 0.36, '#ffffff', { pleats: 2, depth: 0.015, seed: 2 })
}

/** Barrels and sacks: a pantry corner. */
const pantry = (k: Kit, L: Kit | null, r: () => number): void => {
  barrel(k.hull, -0.25, 0, -0.1, 0.85)
  barrel(k.hull, 0.3, 0, -0.18, 0.7)
  if (!L) return
  for (const [x, z, s] of [[-0.06, 0.36, 1], [0.42, 0.3, 0.85]] as const) {
    L.detail.ball(x, 0.2 * s, z, 0.2 * s, '#c9b48a', 7, 4, 1.15)
    L.detail.cyl(x, 0.4 * s, z, 0.05 * s, 0.07 * s, 0.08 * s, 6, '#a8946a')
    L.detail.cyl(x, 0.43 * s, z, 0.075 * s, 0.075 * s, 0.02, 6, '#8a6a44', '#8a6a44')
  }
  // Onions or apples spilling from the open sack.
  for (let i = 0; i < 4; i++) L.detail.ball(-0.28 + i * 0.13, 0.05, 0.52 + (i % 2) * 0.1 + r() * 0.01, 0.05, i % 2 ? '#d84a3a' : '#e8c060', 5, 3)
}

/** A cradle on rockers, a little quilt in it. */
const cradle = (k: Kit, quilt: Col[]): void => {
  for (const sz of [-1, 1]) k.detail.prism([[-0.4, 0.08], [-0.3, 0.02], [0, 0], [0.3, 0.02], [0.4, 0.08], [0.4, 0.12], [-0.4, 0.12]], sz * 0.18 - 0.02, sz * 0.18 + 0.02, shade(OAK, 0.85))
  k.hull.rbox(-0.38, 0.12, -0.2, 0.38, 0.42, 0.2, 0.04, { top: shade(OAK, 1.15), side: OAK })
  k.detail.box(-0.33, 0.3, -0.15, 0.33, 0.43, 0.15, { top: '#3a2a20' }, 'b')
  drape(k.detail, -0.32, -0.12, 0.3, 0.14, 0.44, quilt, { n: 3, lift: 0.025 })
  k.detail.rbox(-0.3, 0.44, -0.13, -0.12, 0.5, 0.13, 0.03, '#fffaf0')
}

/** A rocking horse (a child's toy). */
const toyHorse = (m: Mesher, col: Col): void => {
  for (const sz of [-1, 1]) m.prism([[-0.25, 0.04], [-0.18, 0], [0.18, 0], [0.25, 0.04], [0.25, 0.06], [-0.25, 0.06]], sz * 0.07 - 0.015, sz * 0.07 + 0.015, shade(OAK, 0.8))
  for (const [x, sz] of [[-0.12, -1], [-0.12, 1], [0.12, -1], [0.12, 1]] as const) m.beam(x, 0.05, sz * 0.07, x, 0.2, sz * 0.05, 0.03, OAK)
  m.rbox(-0.16, 0.2, -0.06, 0.16, 0.32, 0.06, 0.03, col)
  m.beam(0.14, 0.28, 0, 0.24, 0.42, 0, 0.07, col)
  m.rbox(0.18, 0.4, -0.045, 0.32, 0.48, 0.045, 0.02, col)
  m.beam(-0.16, 0.3, 0, -0.24, 0.2, 0, 0.03, '#3a2a20')
  for (const sz of [-1, 1]) m.ball(0.27, 0.45, sz * 0.05, 0.018, '#3a2a20', 4, 2)
}

/** A sleeping cat, curled up. */
export const cat = (m: Mesher, col: Col): void => {
  m.ball(0, 0.08, 0, 0.13, col, 7, 4, 0.6)
  m.ball(0.1, 0.11, 0.05, 0.075, col, 6, 4)
  for (const sz of [-1, 1]) m.prism([[0.07, 0.16], [0.13, 0.16], [0.1, 0.22]], 0.05 + sz * 0.035 - 0.01, 0.05 + sz * 0.035 + 0.01, shade(col, 0.85))
  m.beam(-0.1, 0.04, 0.08, 0.06, 0.03, 0.14, 0.04, shade(col, 0.9), 0.04)
}

/** A writing desk with drawers, papers, an inkpot and a quill. */
const desk = (k: Kit, L: Kit | null, wood: Col, lit: boolean): void => {
  k.hull.rbox(-0.55, 0.72, -0.3, 0.55, 0.78, 0.3, 0.02, { top: shade(wood, 1.15), side: wood })
  k.hull.rbox(0.12, 0, -0.27, 0.5, 0.72, 0.27, 0.02, wood)
  for (let i = 0; i < 3; i++) {
    k.detail.rbox(0.16, 0.06 + i * 0.22, 0.27, 0.46, 0.24 + i * 0.22, 0.29, 0.008, shade(wood, 1.08))
    k.detail.ball(0.31, 0.15 + i * 0.22, 0.305, 0.022, BRASS, 5, 3)
  }
  for (const sz of [-1, 1]) k.detail.cyl(-0.47, 0, sz * 0.22, 0.03, 0.035, 0.72, 6, shade(wood, 0.8))
  if (!L) return
  L.detail.box(-0.4, 0.78, -0.15, -0.05, 0.792, 0.15, '#f4ead2', 'b')
  L.detail.box(-0.36, 0.792, -0.1, -0.02, 0.806, 0.18, '#fffaf0', 'b')
  for (let i = 0; i < 4; i++) L.detail.box(-0.32, 0.806, -0.04 + i * 0.045, -0.12 + (i % 2) * 0.06, 0.82, -0.03 + i * 0.045, '#5a5a6a', 'b')
  L.detail.cyl(0.2, 0.78, -0.12, 0.04, 0.035, 0.06, 7, '#2a2a3a', '#14141e')
  L.detail.beam(0.2, 0.83, -0.12, 0.3, 1.02, -0.2, 0.035, '#fffaf0', 0.008)
  if (lit) candle(L, 0.38, 0.78, 0.15, true, 0.1)
}

/** A shelf unit standing on the floor (a dresser): cupboard below, open boards above. */
const dresser = (k: Kit, L: Kit | null, w: number, wood: Col, mix: Parameters<typeof shelfStuff>[5], r: () => number, ruined: boolean): void => {
  k.hull.rbox(-w / 2, 0.04, -0.25, w / 2, 0.8, 0.25, 0.025, { top: shade(wood, 1.12), side: wood })
  for (const sx of [-1, 1]) {
    k.detail.rbox(sx < 0 ? -w / 2 + 0.05 : 0.015, 0.1, 0.25, sx < 0 ? -0.015 : w / 2 - 0.05, 0.74, 0.272, 0.01, shade(wood, 1.06))
    k.detail.ball(sx * 0.07, 0.45, 0.29, 0.025, BRASS, 5, 3)
  }
  // The open part above: sides, a back, two boards, a cornice.
  k.hull.rbox(-w / 2, 0.8, -0.25, -w / 2 + 0.05, 1.9, 0.0, 0.01, wood)
  k.hull.rbox(w / 2 - 0.05, 0.8, -0.25, w / 2, 1.9, 0.0, 0.01, wood)
  k.detail.box(-w / 2 + 0.05, 0.8, -0.25, w / 2 - 0.05, 1.86, -0.23, shade(wood, 0.8), 'b')
  k.hull.rbox(-w / 2 - 0.03, 1.9, -0.28, w / 2 + 0.03, 1.97, 0.03, 0.015, shade(wood, 1.15))
  for (const y of [1.18, 1.52]) k.detail.rbox(-w / 2 + 0.05, y - 0.03, -0.23, w / 2 - 0.05, y, -0.0, 0.006, shade(wood, 1.1))
  if (!L) return
  L.detail.push(0, 0, -0.25)
  shelfStuff(L.detail, L.glow, -w / 2 + 0.08, w / 2 - 0.08, 0.8, mix, r, ruined)
  shelfStuff(L.detail, L.glow, -w / 2 + 0.08, w / 2 - 0.08, 1.18, mix === 'books' ? 'books' : 'kitchen', r, ruined)
  shelfStuff(L.detail, L.glow, -w / 2 + 0.08, w / 2 - 0.08, 1.52, mix, r, ruined)
  L.detail.pop()
}

/** A plain wooden chest with iron bands and a lock. */
const chest = (k: Kit, w: number, wood: Col): void => {
  k.hull.rbox(-w / 2, 0, -0.22, w / 2, 0.4, 0.22, 0.03, { top: shade(wood, 1.15), side: wood })
  for (const x of [-w / 2 + 0.12, w / 2 - 0.12]) k.detail.box(x - 0.03, 0, -0.235, x + 0.03, 0.41, 0.235, IRON, 'b')
  k.detail.rbox(-0.05, 0.22, 0.22, 0.05, 0.33, 0.245, 0.01, BRASS)
}

// ─── On the walls ────────────────────────────────────────────────────────────

/** A curtain each side of a window in a side wall (a rod, two pleated panels tied back). */
const curtains = (L: Mesher, wx: number, side: -1 | 1, z: number, col: Col, seed: number, ruined: boolean): void => {
  const x = wx - side * 0.06
  L.beam(x, 1.82, z - 0.62, x, 1.82, z + 0.62, 0.03, ruined ? '#3a3034' : BRASS)
  for (const s of [-1, 1]) {
    const za = z + s * 0.58
    const zb = z + s * 0.3
    // Facing into the room: a→b runs so the room is on its left.
    const into = side > 0 ? [za, zb] : [zb, za]
    if (s < 0) hang(L, x - side * 0.01, into[0]!, x - side * 0.01, into[1]!, 1.8, ruined ? 1.1 : 0.82, ruined ? shade(col, 0.5) : col, { pleats: 2, depth: 0.03, pinch: ruined ? 0 : 0.35, seed: seed + s })
    else hang(L, x - side * 0.01, into[1]!, x - side * 0.01, into[0]!, 1.8, ruined ? 1.3 : 0.82, ruined ? shade(col, 0.5) : col, { pleats: 2, depth: 0.03, pinch: ruined ? 0 : 0.35, seed: seed + s })
  }
}

/** Planks nailed across a window from the inside (a ruin). */
const boarded = (L: Mesher, wx: number, side: -1 | 1, z: number): void => {
  const x = wx - side * 0.05
  L.beam(x, 1.0, z - 0.5, x, 1.55, z + 0.45, 0.14, '#7a6248', 0.035)
  L.beam(x - side * 0.04, 1.5, z - 0.45, x - side * 0.04, 1.05, z + 0.5, 0.14, '#6a5240', 0.035)
}

/** A framed map (on the back wall). */
const framedMap = (m: Mesher, w: number, h: number): void => {
  m.rbox(-w / 2, 0, 0, w / 2, h, 0.04, 0.012, shade(WOOD, 1.1))
  m.box(-w / 2 + 0.05, 0.05, 0.04, w / 2 - 0.05, h - 0.05, 0.05, { front: '#e8d8a8' }, 'b')
  // Coasts, a river, a red cross where something is.
  m.beam(-w / 2 + 0.1, h * 0.3, 0.06, -0.05, h * 0.6, 0.06, 0.018, '#5a7aa0', 0.004)
  m.beam(-0.05, h * 0.6, 0.06, w / 2 - 0.12, h * 0.75, 0.06, 0.018, '#5a7aa0', 0.004)
  m.beam(-0.1, h * 0.2, 0.06, 0.15, h * 0.45, 0.06, 0.012, '#7a6a4a', 0.004)
  m.beam(0.12, h * 0.36, 0.065, 0.2, h * 0.44, 0.065, 0.02, '#c9483a', 0.005)
  m.beam(0.2, h * 0.36, 0.065, 0.12, h * 0.44, 0.065, 0.02, '#c9483a', 0.005)
}

/** Antlers on a plaque. */
const antlers = (m: Mesher): void => {
  m.rbox(-0.14, -0.18, 0, 0.14, 0.18, 0.05, 0.02, shade(WOOD, 1.1))
  m.ball(0, 0.0, 0.08, 0.07, '#8a6a4a', 5, 3)
  for (const s of [-1, 1]) {
    m.beam(s * 0.04, 0.04, 0.1, s * 0.28, 0.3, 0.12, 0.035, '#e8dcc0')
    m.beam(s * 0.17, 0.17, 0.11, s * 0.2, 0.36, 0.13, 0.03, '#e8dcc0')
    m.beam(s * 0.26, 0.27, 0.12, s * 0.42, 0.32, 0.12, 0.028, '#e8dcc0')
  }
}

/** A round shield on the wall, with a boss and a painted band. */
const wallShield = (m: Mesher, col: Col, rad = 0.3): void => {
  m.pushMatrix(new Matrix4().makeRotationX(Math.PI / 2))
  m.cyl(0, 0, 0, rad, rad, 0.05, 12, shade(col, 0.8), col)
  m.cyl(0, 0.05, 0, rad * 0.3, rad * 0.22, 0.05, 8, '#c0c8d4', '#e0e6ee')
  m.pop()
  m.box(-rad * 0.9, -0.04, 0.06, rad * 0.9, 0.04, 0.07, BRASS, 'b')
}

/** A tapestry on its rod: a field, a border, a figure in the middle. */
const tapestry = (m: Mesher, w: number, h: number, cols: [Col, Col, Col], seed: number): void => {
  m.beam(-w / 2 - 0.08, 0, 0.05, w / 2 + 0.08, 0, 0.05, 0.035, BRASS)
  hang(m, -w / 2, 0.03, w / 2, 0.03, -0.02, -h, cols[0], { pleats: 3, depth: 0.012, seed })
  m.box(-w * 0.3, -h * 0.7, 0.06, w * 0.3, -h * 0.25, 0.07, { front: cols[1] }, 'b')
  m.prism([[-w * 0.12, -h * 0.62], [w * 0.12, -h * 0.62], [0, -h * 0.32]], 0.07, 0.08, cols[2])
}

/** Children's drawings pinned to a wall: little papers with scribbles. */
const drawings = (m: Mesher, r: () => number): void => {
  for (let i = 0; i < 3; i++) {
    const x = i * 0.32 + (r() - 0.5) * 0.06
    const y = (i % 2) * 0.16
    m.box(x - 0.12, y - 0.09, 0, x + 0.12, y + 0.09, 0.012, { front: '#fffaf0' }, 'b')
    const col = ['#ff6a5a', '#4a8ad8', '#5ab84a', '#ffd04a'][(i + Math.floor(r() * 4)) % 4]!
    // A sun, a house, a stick figure: a few strokes each.
    m.ball(x - 0.06, y + 0.04, 0.025, 0.03, '#ffd04a', 4, 2, 0.3)
    m.beam(x - 0.04, y - 0.06, 0.025, x + 0.08, y - 0.06, 0.025, 0.015, col, 0.004)
    m.beam(x + 0.02, y - 0.06, 0.025, x + 0.02, y + 0.04, 0.025, 0.015, col, 0.004)
    m.beam(x - 0.03, y + 0.0, 0.025, x + 0.07, y + 0.0, 0.025, 0.015, col, 0.004)
    m.ball(x + 0.0, y + 0.06, 0.025, 0.012, '#c9483a', 4, 2, 0.3)
  }
}

/** A notice board with job postings pinned to it. */
const noticeBoard = (m: Mesher, r: () => number): void => {
  m.rbox(-0.45, 0, 0, 0.45, 0.62, 0.04, 0.015, shade(WOOD, 1.1))
  m.box(-0.4, 0.05, 0.04, 0.4, 0.57, 0.05, { front: '#b08a5a' }, 'b')
  for (let i = 0; i < 5; i++) {
    const x = -0.3 + (i % 3) * 0.28 + (r() - 0.5) * 0.04
    const y = 0.15 + Math.floor(i / 3) * 0.26 + (r() - 0.5) * 0.04
    const w = 0.08 + r() * 0.04
    m.box(x - w, y - 0.1, 0.06, x + w, y + 0.1, 0.065, { front: i === 2 ? '#ffe8b0' : '#f4ead2' }, 'b')
    for (let l = 0; l < 3; l++) m.box(x - w + 0.03, y + 0.04 - l * 0.04, 0.072, x + w * (l === 2 ? 0.2 : 0.7), y + 0.05 - l * 0.04, 0.074, '#6a5a5a', 'b')
    m.ball(x, y + 0.08, 0.08, 0.015, i % 2 ? '#c9483a' : '#3f6fd6', 4, 2)
  }
}

/** A dart board with three darts in it. */
const dartBoard = (m: Mesher): void => {
  m.pushMatrix(new Matrix4().makeRotationX(Math.PI / 2))
  m.cyl(0, 0, 0, 0.26, 0.26, 0.05, 14, '#3a2a20', '#2a2a2a')
  m.cyl(0, 0.05, 0, 0.2, 0.2, 0.012, 14, '#e8dcc0', '#e8dcc0')
  m.cyl(0, 0.062, 0, 0.13, 0.13, 0.012, 12, '#c9483a', '#c9483a')
  m.cyl(0, 0.074, 0, 0.06, 0.06, 0.012, 10, '#2a8a4a', '#2a8a4a')
  m.cyl(0, 0.086, 0, 0.025, 0.025, 0.012, 8, '#c9483a', '#c9483a')
  m.pop()
  for (const [x, y] of [[0.05, 0.03], [-0.08, -0.06], [0.11, -0.1]] as const) {
    m.beam(x, y, 0.09, x + 0.02, y + 0.03, 0.22, 0.012, '#5a5a64')
    m.prism([[0, 0], [0.04, 0.03], [0, 0.06]], 0.2, 0.21, '#ffd04a')
  }
}

/** A wall clock showing its own time (`t`: 0..1 of the dial). */
const wallClock = (m: Mesher, t: number, rad: number): void => {
  m.pushMatrix(new Matrix4().makeRotationX(Math.PI / 2))
  m.cyl(0, 0, 0, rad, rad, 0.05, 12, shade(WOOD, 1.1), '#f4ead2')
  m.pop()
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    m.box(Math.sin(a) * rad * 0.8 - 0.008, Math.cos(a) * rad * 0.8 - 0.008, 0.055, Math.sin(a) * rad * 0.8 + 0.008, Math.cos(a) * rad * 0.8 + 0.008, 0.062, '#3a3034', 'b')
  }
  const hA = t * Math.PI * 2
  const mA = t * 12 * Math.PI * 2
  m.beam(0, 0, 0.066, Math.sin(hA) * rad * 0.5, Math.cos(hA) * rad * 0.5, 0.066, 0.025, '#2a2228', 0.006)
  m.beam(0, 0, 0.076, Math.sin(mA) * rad * 0.75, Math.cos(mA) * rad * 0.75, 0.076, 0.018, '#2a2228', 0.006)
  m.ball(0, 0, 0.08, 0.018, BRASS, 4, 2)
}

/** A long banner of the school's colours with its mark. */
const banner = (m: Mesher, col: Col, mark: Col, h: number, seed: number): void => {
  m.beam(-0.3, 0, 0.04, 0.3, 0, 0.04, 0.04, BRASS)
  hang(m, -0.25, 0.04, 0.25, 0.04, -0.02, -h, col, { pleats: 2, depth: 0.012, seed })
  m.prism([[-0.25, -h], [0, -h - 0.18], [0.25, -h]], 0.04, 0.05, col)
  m.box(-0.1, -h * 0.55, 0.055, 0.1, -h * 0.3, 0.065, { front: mark }, 'b')
}

// ─── Small story pieces ──────────────────────────────────────────────────────

/** A scorch mark on the floor (a ruin, a pyromancer's practice): a dark blot. */
const scorch = (m: Mesher, x: number, z: number, rad: number, y: number, r: () => number): void => {
  const n = 7
  const pts: Array<[number, number]> = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const rr = rad * (0.6 + r() * 0.5)
    pts.push([x + Math.sin(a) * rr, z + Math.cos(a) * rr])
  }
  for (let i = 0; i < n; i++) {
    const a = pts[i]!
    const b = pts[(i + 1) % n]!
    m.tri(x, y, z, a[0], y, a[1], b[0], y, b[1], i % 2 ? '#3a2e28' : '#463830')
  }
}

/** Soot up a wall (authored on a wall facing +z): a fan of dark tongues. */
const sootUp = (m: Mesher, w: number, h: number, r: () => number): void => {
  // One smudge: a fan from the foot up, dark at the foot, browner where it thins out.
  const n = 9
  const pts: Array<[number, number]> = []
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI
    const k = 0.75 + 0.25 * Math.sin(i * 2.1 + r() * 2)
    pts.push([-Math.cos(a) * (w / 2) * k, Math.sin(a) * h * k])
  }
  for (let i = 0; i < n; i++) m.quad(0, 0, 0, pts[i]![0], pts[i]![1], 0, pts[i + 1]![0], pts[i + 1]![1], 0, 0, 0, 0, ['#2a2220', '#5a4a40', '#5a4a40', '#2a2220'])
}

/** Two muddy boots by the door, and the mud they brought in. */
const boots = (m: Mesher): void => {
  m.cyl(0.0, 0.02, 0.05, 0.3, 0.3, 0.005, 9, '#5a4430', '#5a4430')
  for (const [x, a] of [[-0.09, 0.1], [0.1, -0.25]] as const) {
    m.push(x, 0, 0, a)
    m.rbox(-0.05, 0.0, -0.06, 0.05, 0.28, 0.04, 0.02, { top: '#3a2a20', side: '#6a4a30' })
    m.rbox(-0.068, 0.0, -0.015, 0.068, 0.08, 0.16, 0.025, { top: '#6a4a30', side: '#4a3424' })
    m.pop()
  }
}

/** A dog's bed: a ring of cushion round a soft middle (a bone left by it). */
const dogBed = (m: Mesher, col: Col): void => {
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    m.ball(Math.sin(a) * 0.32, 0.08, Math.cos(a) * 0.26, 0.11, shade(col, i % 2 ? 0.95 : 1.05), 6, 3, 0.75)
  }
  m.cyl(0, 0, 0, 0.3, 0.3, 0.06, 10, shade(col, 0.8), shade(col, 1.15))
  m.beam(0.3, 0.03, 0.34, 0.5, 0.03, 0.4, 0.035, '#f4ead2')
  for (const [x, z] of [[0.3, 0.34], [0.5, 0.4]] as const) m.ball(x, 0.03, z, 0.035, '#f4ead2', 4, 2)
}

/** A wicker laundry basket heaped with washing. */
export const laundryBasket = (m: Mesher): void => {
  m.cyl(0, 0, 0, 0.26, 0.31, 0.3, 10, '#c8a070', '#a8865a')
  m.cyl(0, 0.3, 0, 0.33, 0.33, 0.03, 10, '#b08a5a', '#b08a5a')
  for (const [x, z, c] of [[-0.1, 0.0, '#ffffff'], [0.1, 0.05, '#7fb0e8'], [0.0, -0.12, '#ff9a8a'], [0.05, 0.14, '#f4ead2']] as const) m.ball(x, 0.37, z, 0.11, c, 6, 3, 0.6)
}

/** A half-knitted scarf over a chair's back, needles in it, the ball on the seat (chair space). */
const scarf = (m: Mesher, col: Col): void => {
  hang(m, -0.15, -0.12, 0.15, -0.12, 1.05, 0.66, col, { pleats: 2, depth: 0.015, seed: 3 })
  for (const s of [-1, 1]) m.beam(-0.08 * s, 0.6, -0.1, 0.12 * s, 0.75, -0.1, 0.012, '#d8b04a')
  m.ball(0.06, 0.55, 0.06, 0.07, col, 6, 4)
}

/** A lute (or a fiddle) leaning: a round body, a neck, a pegbox. */
const lute = (m: Mesher): void => {
  m.ball(0, 0.2, 0, 0.18, '#c98a3a', 7, 4, 1.15)
  m.box(-0.07, 0.15, 0.13, 0.07, 0.29, 0.16, '#5a3a24', 'b')
  m.beam(0, 0.36, 0.06, 0, 0.82, 0.04, 0.05, '#5a3a24', 0.03)
  m.beam(0, 0.82, 0.04, 0.0, 0.92, -0.05, 0.06, '#4a2e1c', 0.03)
}

/** A hat upside down on the floor, a few coins in it (the bard's). */
const hatCoins = (m: Mesher, glow: Mesher): void => {
  m.cyl(0, 0, 0, 0.24, 0.24, 0.02, 10, '#4a3a5a', '#4a3a5a')
  m.cyl(0, 0.02, 0, 0.15, 0.13, 0.1, 10, '#5a4a6a', '#2a2234')
  for (const [x, z] of [[0.03, 0.02], [-0.04, -0.03], [0.0, -0.06]] as const) glow.cyl(x, 0.122, z, 0.025, 0.025, 0.01, 6, '#ffd24a', '#ffe680')
}

/** A traveller's pack (by a table, on a step). */
export const pack = (m: Mesher, col: Col): void => {
  m.rbox(-0.18, 0, -0.12, 0.18, 0.42, 0.12, 0.07, { top: shade(col, 1.1), side: col })
  m.rbox(-0.14, 0.12, 0.12, 0.14, 0.32, 0.18, 0.03, shade(col, 0.85))
  m.cyl(0, 0.42, 0, 0.1, 0.1, 0.06, 7, '#c9b48a', '#a8946a')
  m.beam(-0.2, 0.42, -0.05, 0.2, 0.42, -0.05, 0.05, '#c9483a', 0.05)
}

/** A cot: a low frame on legs, a thin mattress, a blanket folded at its foot, a pillow. */
const cot = (k: Kit, w: number, l: number, blanket: Col): void => {
  k.hull.rbox(-w / 2, 0.24, -l / 2, w / 2, 0.32, l / 2, 0.02, { top: shade(OAK, 1.1), side: OAK })
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.detail.cyl(sx * (w / 2 - 0.06), 0, sz * (l / 2 - 0.06), 0.03, 0.03, 0.24, 6, shade(OAK, 0.8))
  k.detail.rbox(-w / 2 + 0.04, 0.32, -l / 2 + 0.03, w / 2 - 0.04, 0.4, l / 2 - 0.03, 0.03, { top: LINEN, side: shade(LINEN, 0.9) })
  k.detail.rbox(-w / 2 + 0.1, 0.4, -l / 2 + 0.06, w / 2 - 0.1, 0.5, -l / 2 + 0.36, 0.04, '#fffaf0')
  for (let i = 0; i < 3; i++) k.detail.rbox(-w / 2 + 0.08, 0.4 + i * 0.05, l / 2 - 0.5, w / 2 - 0.08, 0.45 + i * 0.05, l / 2 - 0.12, 0.012, shade(blanket, 1 - i * 0.08))
}

/** Herbs hung to dry from a pole under the ceiling. */
const herbs = (m: Mesher, w: number, r: () => number): void => {
  m.beam(-w / 2, 0, 0, w / 2, 0, 0, 0.05, DARK)
  for (let x = -w / 2 + 0.2; x < w / 2 - 0.1; x += 0.3) {
    const drop = 0.18 + r() * 0.15
    m.beam(x, -0.02, 0, x, -drop, 0, 0.012, '#c9b48a', 0.012)
    m.cyl(x, -drop - 0.24, 0, 0.0, 0.08, 0.24, 6, r() < 0.5 ? '#6a9a4a' : '#8aa85a')
    m.cyl(x, -drop - 0.03, 0, 0.03, 0.03, 0.03, 5, '#a86a3a')
  }
}

/** A mortar and pestle. */
const mortar = (m: Mesher): void => {
  m.cyl(0, 0, 0, 0.07, 0.1, 0.1, 9, '#a8a4a0', '#5a6a4a')
  m.beam(0.0, 0.07, 0.0, 0.06, 0.2, 0.05, 0.03, '#c8c4c0')
}

/** A cauldron on three feet, bubbling (a glow, and bubbles rising). */
const cauldron = (k: Kit, col: Col, lit: boolean): void => {
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    k.detail.beam(Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3, Math.sin(a) * 0.24, 0.18, Math.cos(a) * 0.24, 0.05, IRON)
  }
  k.hull.ball(0, 0.42, 0, 0.36, '#2e2a30', 8, 5, 0.8)
  k.hull.cyl(0, 0.6, 0, 0.31, 0.33, 0.08, 10, '#3a3438', '#2e2a30')
  if (!lit) return
  k.glow.cyl(0, 0.62, 0, 0.27, 0.27, 0.07, 10, col, col)
  for (const [x, z, s] of [[0.08, 0.05, 1], [-0.1, -0.02, 0.7], [0.0, -0.12, 0.55]] as const) k.glow.ball(x, 0.73 + s * 0.04, z, 0.05 * s, shade(col, 1.3), 5, 3)
}

/** An armour stand: a post, a breastplate, pauldrons, a helm; a shield at its foot. */
export const armourStand = (k: Kit, L: Kit | null, metal: Col, cloth: boolean): void => {
  k.detail.rbox(-0.25, 0, -0.25, 0.25, 0.06, 0.25, 0.02, DARK)
  k.detail.cyl(0, 0.06, 0, 0.04, 0.04, 1.3, 6, WOOD)
  k.hull.rbox(-0.22, 0.75, -0.13, 0.22, 1.28, 0.13, 0.06, { top: shade(metal, 1.2), side: metal })
  for (const s of [-1, 1]) k.hull.ball(s * 0.25, 1.24, 0, 0.11, shade(metal, 1.1), 6, 4, 0.7)
  k.hull.ball(0, 1.48, 0, 0.14, shade(metal, 1.05), 7, 5)
  k.detail.box(-0.1, 1.44, 0.11, 0.1, 1.47, 0.14, '#1e1a20', 'b')
  k.detail.box(-0.2, 0.68, -0.12, 0.2, 0.75, 0.12, '#6a4428', 'b')
  if (!L) return
  if (cloth) hang(L.detail, -0.05, 0.155, 0.17, 0.155, 1.2, 0.86, '#f4ead2', { pleats: 1, depth: 0.012, seed: 5 })
  L.detail.push(0.3, 0, 0.12, -0.3)
  L.detail.rbox(-0.03, 0, -0.2, 0.03, 0.5, 0.2, 0.02, { top: '#c0c8d4', side: '#3f6fd6' })
  L.detail.pop()
}

/** A brazier with fire (a pyromancer's), on three legs. */
const brazier = (k: Kit, lit: boolean): void => {
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    k.detail.beam(Math.sin(a) * 0.2, 0, Math.cos(a) * 0.2, Math.sin(a) * 0.12, 0.62, Math.cos(a) * 0.12, 0.04, IRON)
  }
  k.hull.cyl(0, 0.6, 0, 0.18, 0.28, 0.16, 9, '#5a5054', '#2a2224')
  if (lit) {
    k.glow.ball(0, 0.82, 0, 0.2, '#ff7a2a', 6, 4, 1.3)
    k.glow.ball(0, 0.96, 0, 0.12, '#ffd24a', 5, 3, 1.4)
  }
}

/** A fire bucket: red, full of water, by the brazier. */
const fireBucket = (m: Mesher): void => {
  m.cyl(0, 0, 0, 0.13, 0.16, 0.28, 9, '#c9483a', '#5a8ac8')
  m.cyl(0, 0.27, 0, 0.165, 0.165, 0.03, 9, '#8a8f9a', '#5a8ac8')
  m.beam(-0.16, 0.3, 0, 0.0, 0.42, 0, 0.015, IRON)
  m.beam(0.0, 0.42, 0, 0.16, 0.3, 0, 0.015, IRON)
}

/** A throne: a high back, arms, a cushion worn pale in the middle. */
const throne = (k: Kit, L: Kit | null, col: Col, mark: Col): void => {
  k.hull.rbox(-0.5, 0, -0.35, 0.5, 0.5, 0.3, 0.04, { top: shade(col, 1.2), side: col })
  k.hull.rbox(-0.5, 0.5, -0.35, 0.5, 1.9, -0.15, 0.06, { top: shade(col, 1.2), side: shade(col, 0.9) })
  for (const s of [-1, 1]) {
    k.hull.rbox(s * 0.5 - 0.1, 0.5, -0.2, s * 0.5 + 0.0 * s, 0.82, 0.3, 0.03, shade(col, 1.05))
    k.detail.ball(s * 0.45, 1.98, -0.25, 0.08, BRASS, 6, 4)
  }
  k.detail.rbox(-0.32, 1.1, -0.15, 0.32, 1.7, -0.13, 0.01, mark)
  // The cushion: rich red, worn pale where he sits.
  k.detail.rbox(-0.38, 0.5, -0.12, 0.38, 0.6, 0.27, 0.05, { top: '#a82a3a', side: '#8a1a2a' })
  if (L) L.detail.rbox(-0.16, 0.6, -0.02, 0.16, 0.615, 0.18, 0.01, '#c86a72')
}

/** A tall clock in its case (a grandfather clock), showing its own hour. */
const tallClock = (k: Kit, t: number): void => {
  k.hull.rbox(-0.25, 0, -0.2, 0.25, 2.0, 0.2, 0.03, { top: shade(DARK, 1.2), side: DARK })
  k.detail.push(0, 1.6, 0.2)
  wallClock(k.detail, t, 0.17)
  k.detail.pop()
  k.detail.rbox(-0.12, 0.5, 0.2, 0.12, 1.25, 0.22, 0.01, shade(DARK, 1.2))
  k.detail.cyl(0, 0.7, 0.24, 0.07, 0.07, 0.015, 8, BRASS, BRASS)
}

/** An hourglass. */
const hourglass = (m: Mesher, s: number): void => {
  m.cyl(0, 0, 0, 0.07 * s, 0.07 * s, 0.02 * s, 6, DARK, DARK)
  m.cyl(0, 0.02 * s, 0, 0.055 * s, 0.01 * s, 0.09 * s, 6, '#e8f4f8')
  m.cyl(0, 0.11 * s, 0, 0.01 * s, 0.055 * s, 0.09 * s, 6, '#e8f4f8')
  m.cyl(0, 0.2 * s, 0, 0.07 * s, 0.07 * s, 0.02 * s, 6, DARK, DARK)
  m.cyl(0, 0.02 * s, 0, 0.04 * s, 0.01 * s, 0.05 * s, 6, '#e8c060')
}

/** A half-built contraption: a frame, gears, pipes, a glowing core (an Aether-Tech's). */
const contraption = (k: Kit, L: Kit | null, lit: boolean): void => {
  k.detail.rbox(-0.5, 0, -0.35, 0.5, 0.12, 0.35, 0.02, '#4a4a54')
  for (const [x, z] of [[-0.42, -0.28], [0.42, -0.28], [-0.42, 0.28]] as const) k.detail.beam(x, 0.12, z, x, 1.3, z, 0.05, '#6a6a74')
  k.detail.beam(-0.42, 1.3, -0.28, 0.42, 1.3, -0.28, 0.05, '#6a6a74')
  k.detail.beam(-0.42, 1.3, -0.28, -0.42, 1.3, 0.28, 0.05, '#6a6a74')
  for (const [x, y, z, rad] of [[-0.2, 0.75, 0.0, 0.22], [0.15, 0.55, 0.05, 0.15], [0.25, 0.95, -0.1, 0.12]] as const) {
    k.detail.pushMatrix(new Matrix4().makeRotationX(Math.PI / 2).setPosition(x, y, z))
    k.detail.cyl(0, -0.03, 0, rad, rad, 0.06, 12, '#c9a24a', '#d8b04a')
    k.detail.pop()
  }
  k.detail.beam(-0.38, 0.4, 0.32, 0.0, 0.4, 0.32, 0.06, '#8a6a4a')
  k.detail.beam(0.0, 0.4, 0.32, 0.0, 1.05, 0.0, 0.06, '#8a6a4a')
  if (lit) k.glow.ball(0.05, 1.05, 0.0, 0.14, '#4ff0c8', 7, 4)
  else k.detail.ball(0.05, 1.05, 0.0, 0.14, '#3a4a4a', 7, 4)
  if (!L) return
  L.detail.beam(0.35, 0.02, 0.5, 0.6, 0.02, 0.62, 0.04, '#8a8f9a')
  L.detail.box(0.45, 0.0, 0.66, 0.56, 0.06, 0.74, '#c0c8d4', 'b')
  L.detail.pushMatrix(new Matrix4().makeRotationX(Math.PI / 2).setPosition(-0.4, 0.035, 0.6))
  L.detail.cyl(0, -0.02, 0, 0.09, 0.09, 0.04, 10, '#c9a24a', '#d8b04a')
  L.detail.pop()
}

/** A big geode split open, crystals inside. */
const geode = (k: Kit, lit: boolean): void => {
  k.hull.ball(0, 0.22, 0, 0.26, '#6a645e', 7, 4, 0.85)
  k.detail.cyl(0, 0.2, 0.0, 0.2, 0.2, 0.06, 10, '#3a3440', lit ? '#b06aff' : '#5a4a6a')
  if (lit) for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    k.glow.cyl(Math.sin(a) * 0.1, 0.26, Math.cos(a) * 0.1, 0.035, 0, 0.12, 4, '#d8a8ff')
  }
}

/** A target board on its edge against a wall, knives in it (a Shadowblade's). */
const target = (k: Kit, L: Kit | null): void => {
  k.detail.pushMatrix(new Matrix4().makeRotationX(Math.PI / 2))
  k.detail.cyl(0, 0, 0, 0.4, 0.4, 0.06, 12, '#c8a070', '#e8c890')
  k.detail.cyl(0, 0.06, 0, 0.26, 0.26, 0.012, 12, '#c9483a', '#c9483a')
  k.detail.cyl(0, 0.072, 0, 0.1, 0.1, 0.012, 10, '#f4ead2', '#f4ead2')
  k.detail.pop()
  if (!L) return
  for (const [x, y] of [[0.06, 0.05], [-0.14, -0.08], [0.02, -0.22], [0.2, 0.15]] as const) {
    L.detail.beam(x, y, 0.08, x + 0.02, y + 0.02, 0.24, 0.025, '#d8dde8', 0.01)
    L.detail.beam(x + 0.02, y + 0.02, 0.24, x + 0.03, y + 0.03, 0.34, 0.03, '#3a2a28')
  }
}

// ─── The rooms ───────────────────────────────────────────────────────────────

/** Put `fn` down turned by `ry` at (x, y, z), for every kit given (furniture and clutter together). */
const place = (kits: Array<Kit | null>, x: number, y: number, z: number, ry: number, fn: () => void): void => {
  // (Each kit once: a kit pushed twice would move its piece twice as far.)
  const ks = [...new Set(kits.filter((k): k is Kit => !!k))]
  for (const k of ks) for (const m of [k.hull, k.detail, k.glow]) m.push(x, y, z, ry)
  fn()
  for (const k of ks) for (const m of [k.hull, k.detail, k.glow]) m.pop()
}

const QUILTS: Array<[Col, Col, Col]> = [
  ['#c9483a', '#f4ead2', '#3f6fd6'], ['#5aa84a', '#f4d890', '#a86a3a'], ['#7a3fa0', '#f4ead2', '#d8b04a'], ['#3f8ac8', '#f4ead2', '#e8a648']
]
const CURTAINS = ['#c9483a', '#3f6fd6', '#5aa84a', '#d8962a', '#8a4a6a']

/** A rectangle round a point. */
const around = (x: number, z: number, hw: number, hd = hw): Rect => ({ x0: x - hw, z0: z - hd, x1: x + hw, z1: z + hd })

/** What the room needs from its arranging: the kits, the layout, where things went. */
interface Fit {
  c: RoomCtx
  lay: RoomLayout
  /** From the work wall into the room (+1 when the work wall is the west one). */
  s: number
  /** The work wall, the far wall. */
  work: Wall
  far: Wall
  top: number
  lit: boolean
  tint: (col: Col) => Col
  /** The windows in the side walls (kept clear of anything tall; nothing hung over them). */
  winRects: Rect[]
  /** Where the hearth went (its chimney goes over it). */
  hearth: { x: number; z: number; wall: Wall } | null
}

/** Draw a piece where the layout put it, and record it. */
const put2 = (f: Fit, kits: Array<Kit | null>, label: string, s: Spot | null, y1: number, draw: () => void, o: { y0?: number; flat?: boolean; wall?: Wall } = {}): Spot | null => {
  if (!s) return null
  f.lay.add(label, s, y1, o)
  // (Both kits move with the piece: what stands on it may be clutter.)
  place([f.c.B, f.c.L, ...kits], s.x, f.c.fy, s.z, s.ry, draw)
  return s
}

/** Hang something on a wall where the layout finds room for it. */
const hangOn = (f: Fit, kit: Kit | null, label: string, wall: Wall, len: number, y0: number, y1: number, prefer: number, draw: () => void): void => {
  if (!kit) return
  const s = f.lay.hang(wall, len, y0, y1, prefer, f.winRects)
  if (!s) return
  f.lay.addHang(label, s, wall, y0, y1)
  // A hung thing is authored on the wall (z = 0 its back), at its own height,
  // and stands 12 mm off it (never in the wall's face).
  place([f.c.B, f.c.L], s.x, f.c.fy + y0, s.z, s.ry, () => {
    for (const k of [f.c.B, f.c.L]) if (k) for (const m of [k.hull, k.detail, k.glow]) m.push(0, 0, 0.012)
    draw()
    for (const k of [f.c.B, f.c.L]) if (k) for (const m of [k.hull, k.detail, k.glow]) m.pop()
  })
}

/**
 * A staircase up to the floor above: against a wall, a run of equal steps
 * (rise and tread the same all the way), a railing on its open side, and
 * where it arrives the edge of the floor above round the stairwell (the floor
 * itself is lifted away with the front). The way to its foot is kept clear.
 */
const staircase = (f: Fit): void => {
  const { lay } = f
  const top = f.top
  const n = Math.max(8, Math.round(top / 0.24))
  const rise = top / n
  const run = 0.25
  const width = 0.8
  const len = n * run
  // Try the back wall first (rising from either end), then the side walls, last the front.
  const tries: Array<[Wall, 1 | -1]> = [['back', 1], ['back', -1], [f.far, -1], [f.work, -1], [f.far, 1], [f.work, 1], ['front', 1], ['front', -1]]
  for (const [wall, dir] of tries) {
    for (const pref of [dir > 0 ? 0 : 1, 0.5, dir > 0 ? 1 : 0]) {
      const s = lay.onWall(wall, len, width + 0.05, top, pref, { path: false })
      if (!s) continue
      const sr = s.rect
      const along = wall === 'back' || wall === 'front'
      // The low end of the run, and the floor before its first step (on the room side).
      const lo = along ? (dir > 0 ? sr.x0 : sr.x1) : (dir > 0 ? sr.z0 : sr.z1)
      const into = wall === 'back' || wall === 'west' ? 1 : -1
      const face = wall === 'back' ? sr.z1 : wall === 'front' ? sr.z0 : wall === 'west' ? sr.x1 : sr.x0
      const a = Math.min(lo, lo + dir * 0.75)
      const b = Math.max(lo, lo + dir * 0.75)
      const fr: Rect = along
        ? { x0: a, x1: b, z0: Math.min(face, face + into * FOOT), z1: Math.max(face, face + into * FOOT) }
        : { z0: a, z1: b, x0: Math.min(face, face + into * FOOT), x1: Math.max(face, face + into * FOOT) }
      if (!lay.free(fr, 2, { path: false })) continue
      const fx = (fr.x0 + fr.x1) / 2
      const fz = (fr.z0 + fr.z1) / 2
      lay.target('the stair', fx, fz)
      lay.zone('the foot of the stair', fr)
      if (lay.unreached([sr]).some(t => t === 'the stair') || !lay.free(sr, top)) {
        lay.targets.pop()
        lay.zones.pop()
        continue
      }
      lay.fixed('the stair', sr, top, { wall })
      drawStair(f, sr, wall, dir, n, rise, run)
      return
    }
  }
}

/** The floor kept clear before a stair's first step (to step on to it). */
const FOOT = 0.7

/** The stair itself in its rectangle: steps, a stringer, posts and a rail, the stairwell's edge at the top. */
const drawStair = (f: Fit, sr: Rect, wall: Wall, dir: 1 | -1, n: number, rise: number, run: number): void => {
  const { c } = f
  const B = c.B
  const fy = c.fy
  const wood = ash('#8a5a34', c.ruined)
  const dark = ash('#6a4428', c.ruined)
  const along = wall === 'back' || wall === 'front'
  // The open side (towards the room) and the wall side, across the run.
  const openAt = wall === 'back' ? sr.z1 : wall === 'west' ? sr.x1 : wall === 'east' ? sr.x0 : sr.z0
  const inward = wall === 'back' || wall === 'west' ? 1 : -1
  for (let i = 0; i < n; i++) {
    const a = (dir > 0 ? (along ? sr.x0 : sr.z0) : (along ? sr.x1 : sr.z1)) + dir * i * run
    const b = a + dir * run
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    const y = fy + rise * (i + 1)
    if (along) B.hull.box(lo, fy, sr.z0, hi, y, sr.z1 - 0.06, { top: shade(wood, 1.15), side: wood, front: shade(wood, 0.92) }, 'b')
    else B.hull.box(sr.x0 + (inward < 0 ? 0.06 : 0), fy, lo, sr.x1 - (inward > 0 ? 0.06 : 0), y, hi, { top: shade(wood, 1.15), side: wood, front: shade(wood, 0.92) }, 'b')
  }
  // Posts on the open side every other step, and the hand rail along their tops.
  const p = (i: number): [number, number] => {
    const a = (dir > 0 ? (along ? sr.x0 : sr.z0) : (along ? sr.x1 : sr.z1)) + dir * (i + 0.5) * run
    const q = openAt - inward * 0.04
    return along ? [a, q] : [q, a]
  }
  for (let i = 0; i < n; i += 2) {
    const [x, z] = p(i)
    B.detail.beam(x, fy + rise * (i + 1), z, x, fy + rise * (i + 1) + 0.8, z, 0.045, dark)
  }
  const [ax, az] = p(0)
  const [bx, bz] = p(n - 1)
  B.detail.beam(ax, fy + rise + 0.8, az, bx, fy + rise * n + 0.8 - 0.25, bz, 0.06, shade(wood, 1.2))
  // The newel at the foot, a ball on it.
  B.detail.cyl(ax, fy, az, 0.06, 0.06, rise + 0.95, 6, dark)
  B.detail.ball(ax, fy + rise + 1.0, az, 0.07, shade(wood, 1.2), 6, 4)
  // Where it arrives: the edge of the floor above round the stairwell (a joist across the room side).
  const y = fy + f.top - 0.14
  const [cx, cz] = p(Math.floor(n * 0.55))
  const [dx, dz] = p(n - 1)
  B.detail.box(Math.min(cx, dx) - (along ? 0 : 0.05), y, Math.min(cz, dz) - (along ? 0.05 : 0), Math.max(cx, dx) + (along ? 0 : 0.05), y + 0.12, Math.max(cz, dz) + (along ? 0.05 : 0), dark, '')
}

/** Furnish a room, and leave in it the story of who lives (or lodges, or learns) there. Returns its layout and its hearth. */
export const furnishRoom = (c: RoomCtx): { layout: RoomLayout; hearth: { x: number; z: number; wall: Wall } | null } => {
  const { L, x0, x1, z0, z1, fy, r, ruined } = c
  const lay = new RoomLayout({ x0, z0, x1, z1 }, { x: c.doorX, z: z1 })
  const s = c.west ? 1 : -1
  const f: Fit = {
    c, lay, s, work: c.west ? 'west' : 'east', far: c.west ? 'east' : 'west', top: c.top - fy, lit: !ruined, tint: (col: Col): Col => ash(col, ruined),
    winRects: c.wins.map(w => (w.side < 0 ? { x0, z0: w.z - 0.48, x1: x0 + 0.6, z1: w.z + 0.48 } : { x0: x1 - 0.6, z0: w.z - 0.48, x1, z1: w.z + 0.48 })),
    hearth: null
  }
  // Kept clear: the doorway and the way in; before each window, anything above the sill.
  lay.zone('the doorway', { x0: c.doorX - 0.6, z0: z1 - 1.2, x1: c.doorX + 0.6, z1 })
  for (const w of f.winRects) lay.zone('a window', w, 0.95)
  // Everybody's place (from the plan): kept clear, and reached from the door.
  if (c.work) {
    lay.zone('the work place', around(c.work.x, c.work.z, 0.18))
    lay.target('the work place', c.work.x, c.work.z)
  }
  if (c.seat) lay.target('the seat', c.seat.x + Math.sin(c.seat.ry) * 0.5, c.seat.z + Math.cos(c.seat.ry) * 0.5)
  if (c.bard) {
    lay.zone('the bard\'s place', around(c.bard.x, c.bard.z, 0.2))
    lay.target('the bard\'s place', c.bard.x, c.bard.z)
  }
  // The plan's tables (a taproom's): where they stand, and the stools round them.
  for (const t of c.tables) lay.fixed('a table', around(t.x, t.z, 0.42), 0.8)
  for (const t of c.stools) {
    lay.zone('a stool', around(t.x, t.z, 0.2))
    lay.target('a stool', t.x, t.z)
  }
  // Windows: curtains (a ruin's now and then boarded up). Not on the work wall of a room with fixtures there.
  const cur = CURTAINS[Math.floor(r() * CURTAINS.length)]!
  if (L) for (const [i, w] of c.wins.entries()) {
    const wallX = w.side < 0 ? x0 : x1
    if (c.story !== 'home' && (w.side < 0) === c.west) continue
    if (ruined && i % 2 === 0) boarded(L.detail, wallX, w.side, w.z)
    else curtains(L.detail, wallX, w.side, w.z, c.story === 'school' && c.cls === 'shadow' ? '#2a2440' : cur, i + 1, ruined)
  }
  // The seat the plan put in the back corner: a chair under whoever sits there.
  if (c.seat) {
    const wood = f.tint(OAK)
    lay.fixed('the seat\'s chair', around(c.seat.x, c.seat.z, 0.26), 1.05)
    place([c.B], c.seat.x, fy, c.seat.z, c.seat.ry, () => chair(c.B, wood))
  }
  // Up to the floor above (a home finds room for its hearth and its bed first).
  if (c.upper && c.story !== 'home') staircase(f)
  switch (c.story) {
    case 'home': home(f); break
    case 'inn': inn(f); break
    case 'healer': healer(f); break
    case 'shop': shop(f); break
    case 'school': school(f); break
  }
  // A ruin's floor: scorched here and there; soot up the back wall.
  if (ruined && L) {
    for (let i = 0; i < 3; i++) {
      const sx = x0 + (x1 - x0) * (i + 0.5) / 3
      const sz = z0 + 1.0 + r() * (z1 - z0 - 2.0)
      // (Not on a rug: they lie on the boards.)
      if (lay.pieces.some(p => p.flat && overlaps(p.rect, around(sx, sz, 0.6)))) continue
      scorch(L.detail, sx, sz, 0.3 + r() * 0.2, fy + 0.008, r)
    }
    hangOn(f, L, 'soot', 'back', 2.2, 0.0, 1.9, 0.5, () => sootUp(L.detail, 2.2, 1.9, r))
  }
  // A lantern hanging from the beams over the middle of the room.
  if (f.lit) {
    const lx = (x0 + x1) / 2
    const lz = z0 + (z1 - z0) * 0.45
    c.B.detail.beam(lx, fy + f.top - 0.02, lz, lx, fy + f.top - 0.35, lz, 0.015, IRON, 0.015)
    c.B.detail.rbox(lx - 0.1, fy + f.top - 0.42, lz - 0.1, lx + 0.1, fy + f.top - 0.35, lz + 0.1, 0.02, IRON)
    c.B.glow.ball(lx, fy + f.top - 0.52, lz, 0.09, '#ffd27a', 6, 4)
  }
  return { layout: lay, hearth: f.hearth }
}

/** The cooking hearth (or the taproom's fire) on an outer wall, the back one first: the chimney goes up over it. */
const hearthOn = (f: Fit, prefer: number): Spot | null => {
  const { c } = f
  const tries: Array<[Wall, number]> = [['back', prefer], [f.far, 0.3], [f.work, 0.3]]
  for (const [wall, pref] of tries) {
    const s = f.lay.onWall(wall, 1.62, 0.68, f.top, pref, { back: 0.44 })
    if (!s) continue
    f.hearth = { x: s.x, z: s.z, wall }
    put2(f, [c.B, c.L], 'the hearth', s, f.top, () => hearthKitchen(c.B, c.L, f.top, { lit: f.lit, stone: c.style === 'mountain' ? '#8a8690' : STONE, pot: true }))
    return s
  }
  // A small room: an iron stove instead, its pipe up through the ceiling (against the front wall at last).
  for (const [wall, pref] of [...tries, ['front', 0.15] as [Wall, number], ['front', 0.85] as [Wall, number]]) {
    const s = f.lay.onWall(wall, 0.8, 0.66, f.top, pref)
    if (!s) continue
    f.hearth = { x: s.x, z: s.z, wall }
    put2(f, [c.B, c.L], 'the hearth', s, f.top, () => stove(c.B, c.L, f.top, f.lit))
    return s
  }
  return null
}

/** An iron stove on legs: a fire door, a kettle and a pot on top, its pipe up to the ceiling. */
const stove = (k: Kit, L: Kit | null, top: number, lit: boolean): void => {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.detail.cyl(sx * 0.27, 0, sz * 0.2, 0.03, 0.04, 0.14, 5, IRON)
  k.hull.rbox(-0.34, 0.14, -0.28, 0.34, 0.82, 0.28, 0.04, { top: '#3a3a44', side: '#2e2e36' })
  k.detail.rbox(-0.16, 0.3, 0.28, 0.16, 0.56, 0.3, 0.01, '#4a4a54')
  if (lit) k.glow.box(-0.12, 0.33, 0.3, 0.12, 0.42, 0.312, '#ff8a2a', 'b')
  k.detail.cyl(-0.05, 0.82, -0.12, 0.08, 0.08, top - 0.84, 8, '#3a3a44')
  if (!L) return
  L.detail.ball(0.16, 0.82 + 0.1, 0.08, 0.1, '#5a5a64', 7, 4, 0.85)
  L.detail.beam(0.24, 0.94, 0.08, 0.33, 1.0, 0.08, 0.022, '#5a5a64')
  L.detail.cyl(-0.17, 0.82, 0.12, 0.1, 0.1, 0.12, 8, '#2e2a30', '#c9a070')
}

/** Where the floor before a piece (on its front side) is, `d` deep. */
const before = (s: Spot, d: number): Rect => {
  const r = s.rect
  // The front looks along (sin ry, cos ry).
  const fx = Math.round(Math.sin(s.ry))
  const fz = Math.round(Math.cos(s.ry))
  if (fz > 0) return { x0: r.x0, x1: r.x1, z0: r.z1, z1: r.z1 + d }
  if (fz < 0) return { x0: r.x0, x1: r.x1, z0: r.z0 - d, z1: r.z0 }
  if (fx > 0) return { z0: r.z0, z1: r.z1, x0: r.x1, x1: r.x1 + d }
  return { z0: r.z0, z1: r.z1, x0: r.x0 - d, x1: r.x0 }
}

/** A table with chairs tucked round it, one pulled out (`pulled`), a rug centred under it; what is on it is `set`. */
const dining = (f: Fit, w: number, d: number, px: number, pz: number, round: boolean, wood: Col, rugCols: [Col, Col, Col] | null, set: (L: Kit) => void, o: { pulled?: boolean; scarf?: boolean; clear?: number; wall?: Wall } = {}): Spot | null => {
  const { c } = f
  // The table and its chairs: two along the back side, one at each end.
  const gw = w + 0.84
  const gd = d + 0.7
  let s = f.lay.centre(gw, gd, 1.05, px, pz, { clear: o.clear ?? 0.55 })
  if (!s && o.wall) {
    // Pushed against a wall (a small room): its back side to the wall, chairs round the rest.
    const w2 = f.lay.onWall(o.wall, gw, d + 0.42, 1.05, 0.5)
    if (!w2) return null
    s = w2
    f.lay.add('a table with its chairs', w2, 1.05)
    place([f.c.B, f.c.L], w2.x, f.c.fy, w2.z, w2.ry, () => {
      place([f.c.B, f.c.L], 0, 0, -0.21, 0, () => {
        if (round) {
          f.c.B.hull.cyl(0, 0.68, 0, w / 2, w / 2, 0.06, 12, shade(wood, 0.9), shade(wood, 1.15))
          f.c.B.detail.cyl(0, 0, 0, 0.08, 0.1, 0.68, 7, shade(wood, 0.8))
          f.c.B.detail.cyl(0, 0, 0, 0.3, 0.32, 0.06, 9, shade(wood, 0.75), shade(wood, 0.85))
        } else table(f.c.B, w, d, 0.74, wood)
        place([f.c.B, f.c.L], -w / 2 - 0.12, 0, 0, Math.PI / 2, () => chair(f.c.B, wood))
        place([f.c.B, f.c.L], w / 2 + 0.12, 0, 0, -Math.PI / 2, () => chair(f.c.B, wood))
        if (o.pulled) place([f.c.B, f.c.L], 0.15, 0, d / 2 + 0.3, Math.PI - 0.5, () => {
          chair(f.c.B, wood)
          if (f.c.L && o.scarf && !f.c.ruined) scarf(f.c.L.detail, '#3f8ac8')
        })
        if (f.c.L) set(f.c.L)
      })
    })
    f.lay.target('the table', (before(w2, 0.6).x0 + before(w2, 0.6).x1) / 2, (before(w2, 0.6).z0 + before(w2, 0.6).z1) / 2)
    return w2
  }
  if (!s) return null
  // (The group is drawn with the table's middle 0.2 m in front of the rect's.)
  const tx = s.x
  const tz = s.z + 0.2
  f.lay.add('a table with its chairs', s, 1.05)
  if (rugCols) {
    const rr = { x0: tx - gw / 2 - 0.15, z0: tz - gd / 2 - 0.25, x1: tx + gw / 2 + 0.15, z1: tz + gd / 2 - 0.05 }
    f.lay.fixed('the rug under the table', rr, 0.04, { flat: true })
    place([c.B], tx, c.fy, (rr.z0 + rr.z1) / 2, 0, () => rug(c.B.detail, rr.x1 - rr.x0, rr.z1 - rr.z0, rugCols))
  }
  place([c.B, c.L], tx, c.fy, tz, 0, () => {
    if (round) {
      c.B.hull.cyl(0, 0.68, 0, w / 2, w / 2, 0.06, 12, shade(wood, 0.9), shade(wood, 1.15))
      c.B.detail.cyl(0, 0, 0, 0.08, 0.1, 0.68, 7, shade(wood, 0.8))
      c.B.detail.cyl(0, 0, 0, 0.3, 0.32, 0.06, 9, shade(wood, 0.75), shade(wood, 0.85))
    } else table(c.B, w, d, 0.74, wood)
    // Tucked in: their seats under the table's edge.
    place([c.B, c.L], -w * 0.22, 0, -d / 2 - 0.12, 0, () => chair(c.B, wood))
    place([c.B, c.L], w * 0.22, 0, -d / 2 - 0.12, 0, () => {
      chair(c.B, wood)
      if (c.L && o.scarf && !c.ruined) scarf(c.L.detail, '#3f8ac8')
    })
    place([c.B], -w / 2 - 0.12, 0, 0, Math.PI / 2, () => (c.ruined ? chairDown(c.B, wood) : chair(c.B, wood)))
    // Pulled out and turned: somebody got up (or is about to sit down).
    if (o.pulled) place([c.B], w / 2 + 0.25, 0, 0.12, -Math.PI / 2 + 0.5, () => chair(c.B, wood))
    else place([c.B], w / 2 + 0.12, 0, 0, -Math.PI / 2, () => chair(c.B, wood))
    if (c.L) set(c.L)
  })
  return s
}

/** A family's home: lived in, a meal on the table, the children's things about. */
const home = (f: Fit): void => {
  const { c, lay } = f
  const { B, L, x0, x1, z0, z1, r, ruined } = c
  const v = c.vary
  const quilt = QUILTS[v % QUILTS.length]!.map(q => f.tint(q))
  const wood = f.tint(OAK)
  const bedSide: Wall = v % 2 ? f.far : f.work
  const otherSide: Wall = bedSide === f.far ? f.work : f.far
  // The stair to the floor above (a town house's) goes first: it needs the longest wall.
  if (c.upper) staircase(f)
  // The bed in a back corner, its head to the back wall and a long side to the side wall
  // (else its head to a side wall): the other long side free to get in.
  const bw = 1.15
  const bl = 1.95
  const b = lay.onWall('back', bw + 0.06, bl + 0.16, 1.1, bedSide === 'west' ? 0 : 1) ?? lay.onWall(bedSide, bw + 0.06, bl + 0.16, 1.1, 0.15) ?? lay.onWall(otherSide, bw + 0.06, bl + 0.16, 1.1, 0.15)
  if (b) {
    put2(f, [B, L], 'the bed', b, 1.1, () => bed(B, bw, bl, quilt, { messy: ruined || v % 3 === 2, seed: 2, ruined }))
    // Its open side must be reached: the long side away from the nearest wall.
    const r2 = b.rect
    const alongZ = Math.abs(Math.cos(b.ry)) > 0.5
    if (alongZ) {
      const open = (r2.x0 - x0) < (x1 - r2.x1) ? r2.x1 + 0.35 : r2.x0 - 0.35
      lay.target('the side of the bed', open, (r2.z0 + r2.z1) / 2)
    } else {
      const open = (r2.z0 - z0) < (z1 - r2.z1) ? r2.z1 + 0.35 : r2.z0 - 0.35
      lay.target('the side of the bed', (r2.x0 + r2.x1) / 2, open)
    }
  }
  // The hearth on an outer wall, towards the far side of the bed (after the bed: it may be a stove in a small room).
  const h = hearthOn(f, bedSide === 'west' ? 0.82 : 0.18)
  // The table, set for supper, in the middle of the room (pushed against a wall in a small one).
  const setTable = (K: Kit): void => {
    if (!ruined) {
      for (const [x, z] of [[-0.24, -0.2], [0.26, -0.2], [-0.42, 0.08], [0.42, 0.1]] as const) {
        K.detail.cyl(x, 0.74, z, 0.1, 0.1, 0.015, 10, '#e8e4dc', '#f6f2ea')
        K.detail.cyl(x, 0.755, z, 0.045, 0.06, 0.035, 8, '#c98a5a', '#e8c070')
      }
      K.detail.ball(0.0, 0.8, 0.12, 0.1, '#d89a4a', 7, 4, 0.6)
      K.detail.cyl(0.05, 0.74, -0.12, 0.06, 0.07, 0.18, 8, '#c9d8e8', '#8ab8d8')
      candle(K, -0.05, 0.74, 0.0, true)
    } else {
      K.detail.pushMatrix(new Matrix4().makeRotationZ(1.9).setPosition(0.2, 0.83, 0.1))
      K.detail.cyl(0, -0.03, 0, 0.06, 0.08, 0.06, 8, '#8a6a4a', '#5a4a3a')
      K.detail.pop()
    }
  }
  const rugT: [Col, Col, Col] = [f.tint('#a8543a'), f.tint('#d8a050'), f.tint('#5a7aa0')]
  const mid: [number, number] = [(x0 + x1) / 2, z0 + (z1 - z0) * 0.58]
  if (!dining(f, v % 2 ? 1.2 : 1.15, v % 2 ? 1.2 : 0.72, mid[0], mid[1], v % 2 === 1, wood, rugT, setTable, { pulled: true, scarf: true })) {
    dining(f, 1.0, 0.7, mid[0], mid[1], false, wood, null, setTable, { pulled: true, scarf: true, clear: 0.4, wall: otherSide }) ??
      dining(f, 1.0, 0.7, mid[0], mid[1], false, wood, null, setTable, { pulled: true, scarf: true, clear: 0.4, wall: bedSide }) ??
      dining(f, 0.8, 0.8, mid[0], mid[1], true, wood, null, setTable, { clear: 0.28, wall: 'front' })
  }
  // A round rug before the hearth.
  if (h) {
    const fr = before(h, 1.2)
    const cx = (fr.x0 + fr.x1) / 2
    const cz = (fr.z0 + fr.z1) / 2
    const rr = around(cx, cz, 0.6)
    lay.fixed('the rug before the hearth', rr, 0.04, { flat: true })
    place([B], cx, c.fy, cz, 0, () => rugRound(B.detail, 0.6, [f.tint('#a8543a'), f.tint('#d8a050')]))
  }
  // A dresser of plates against a wall (a wardrobe in some homes), the washstand, a chest of drawers.
  const ward = v % 3 === 1
  const dw = ward ? 1.1 : 1.2
  put2(f, [B, L], ward ? 'the wardrobe' : 'the dresser', lay.onWall('back', dw, 0.62, 1.97, 0.5) ?? lay.onWall(otherSide, dw, 0.62, 1.97, 0.5) ?? lay.onWall(bedSide, dw, 0.62, 1.97, 0.6), 1.97, () => (ward ? wardrobe(B, 1.05, f.tint(WOOD)) : dresser(B, L, 1.15, wood, 'kitchen', r, ruined)))
  put2(f, [B, L], 'the washstand', lay.onWall(f.far, 0.66, 0.5, 0.95, 0.42) ?? lay.onWall(f.work, 0.66, 0.5, 0.95, 0.42), 0.95, () => washstand(B, L))
  put2(f, [B, L], 'the chest of drawers', lay.onWall(bedSide, 0.96, 0.58, 1.25, 0.82) ?? lay.onWall(otherSide, 0.96, 0.58, 1.25, 0.82), 1.25, () => {
    drawers(B, 0.9, wood)
    if (L) { L.detail.push(0.25, 0.9, 0.0); plant(L, 0.8, false, ruined); L.detail.pop() }
  })
  // At the bed's foot: a cradle (a family with a baby), else the dog's bed by the fire.
  const baby = v % 2 === 0
  if (baby && b) {
    const fb = before(b, 0.6)
    put2(f, [B], 'the cradle', lay.centre(0.84, 0.46, 0.55, (fb.x0 + fb.x1) / 2, (fb.z0 + fb.z1) / 2, { clear: 0.22 }), 0.55, () => cradle(B, quilt.slice(1)))
  } else if (L && h) {
    const fr = before(h, 1.0)
    put2(f, [L], 'the dog\'s bed', lay.centre(0.8, 0.62, 0.25, (fr.x0 + fr.x1) / 2 + 0.5, (fr.z0 + fr.z1) / 2, { clear: 0.22 }), 0.25, () => dogBed(L.detail, f.tint('#a86a3a')))
  }
  // The pantry in a front corner, the laundry basket.
  put2(f, [B, L], 'the pantry', lay.onWall(f.far, 1.0, 0.95, 0.85, 0.9) ?? lay.onWall(f.work, 1.0, 0.95, 0.85, 0.9), 0.85, () => pantry(B, L, r))
  if (L) put2(f, [L], 'the laundry basket', lay.onWall(f.far, 0.66, 0.66, 0.55, 0.62) ?? lay.onWall('front', 0.66, 0.66, 0.55, 0.2), 0.55, () => laundryBasket(L.detail))
  if (!L) return
  // A toy left on the floor; muddy boots by the door (along the front wall).
  put2(f, [L], 'a toy', lay.centre(0.55, 0.3, 0.5, (x0 + x1) / 2 - f.s * 0.4, z1 - 1.3, { clear: 0.25 }), 0.5, () => toyHorse(L.detail, ruined ? '#8a7a6a' : '#e8c060'))
  put2(f, [L], 'the boots', lay.onWall('front', 0.5, 0.42, 0.3, (c.doorX - f.s * 0.95 - x0) / (x1 - x0)), 0.3, () => boots(L.detail))
  // On the walls: the children's drawings near the bed, antlers high on the back wall.
  hangOn(f, L, 'the children\'s drawings', bedSide, 0.9, 1.25, 1.55, 0.3, () => { L.detail.push(-0.32, 0.1, 0.012); drawings(L.detail, r); L.detail.pop() })
  hangOn(f, L, 'the antlers', 'back', 0.9, 2.02, 2.42, bedSide === 'west' ? 0.15 : 0.85, () => { L.detail.push(0, 0.2, 0.012); antlers(L.detail); L.detail.pop() })
}

/** A taproom: the bar, the kegs and bottles, the stair to the guests' rooms, the notice board, the bard's corner. */
const inn = (f: Fit): void => {
  const { c, lay } = f
  const { B, L, fy, r, ruined, wz } = c
  const s = f.s
  const wx = c.west ? c.x0 : c.x1
  const wood = ash('#8a5a34', ruined)
  const dark = ash('#6a4428', ruined)
  // The bar, across the keeper's place (he stands between it and the wall), its front to the room.
  const ba = Math.min(wx + s * 1.32, wx + s * 1.74)
  const bb = Math.max(wx + s * 1.32, wx + s * 1.74)
  lay.fixed('the bar', { x0: ba - 0.05, z0: wz - 0.85, x1: bb + 0.05, z1: wz + 0.6 }, 1.36)
  B.hull.rbox(ba, fy, wz - 0.8, bb, fy + 0.95, wz + 0.55, 0.03, { top: wood, side: dark })
  B.hull.rbox(ba - 0.05, fy + 0.95, wz - 0.85, bb + 0.05, fy + 1.02, wz + 0.6, 0.02, { top: shade(wood, 1.2), side: wood })
  for (let i = 0; i < 3; i++) B.detail.rbox(s > 0 ? bb : ba - 0.02, fy + 0.15, wz - 0.65 + i * 0.42, s > 0 ? bb + 0.02 : ba, fy + 0.8, wz - 0.32 + i * 0.42, 0.006, shade(dark, 1.15))
  place([B], (ba + bb) / 2, fy + 1.02, wz - 0.62, 0, () => {
    B.detail.cyl(0, 0, 0, 0.17, 0.17, 0.32, 8, '#a06a3a', '#7a4e2c')
    B.detail.beam(0, 0.16, 0.17, 0, 0.12, 0.27, 0.03, BRASS)
  })
  if (L && !ruined) for (const zz of [-0.25, 0.05, 0.35]) L.detail.cyl((ba + bb) / 2 + (r() - 0.5) * 0.12, fy + 1.02, wz + zz, 0.06, 0.065, 0.14, 6, '#e8a648', '#fff4d8')
  // Kegs against the wall behind the keeper, bottles on a shelf over them, the keys to the rooms on their board.
  const kz0 = wz - 1.48
  if (lay.free({ x0: Math.min(wx, wx + s * 0.62), z0: kz0, x1: Math.max(wx, wx + s * 0.62), z1: wz - 0.45 }, 0.65, { path: false })) {
    lay.fixed('the kegs', { x0: Math.min(wx, wx + s * 0.62), z0: kz0, x1: Math.max(wx, wx + s * 0.62), z1: wz - 0.45 }, 0.65)
    for (const [zz, k] of [[-1.2, 0], [-0.75, 1]] as const) B.detail.cyl(wx + s * 0.33, fy, wz + zz, 0.25, 0.27, 0.62, 8, k ? '#8a5a34' : '#9a6a3a', '#6a4428')
  }
  hangOn(f, B, 'the bottle shelf', f.work, 1.8, 1.4, 1.75, (wz - 0.5 - c.z0) / (c.z1 - c.z0), () => {
    B.hull.rbox(-0.9, 0.05, 0, 0.9, 0.1, 0.28, 0.01, { top: wood, side: dark })
    if (L && !ruined) for (let i = 0; i < 6; i++) L.detail.cyl(-0.68 + i * 0.27, 0.1, 0.14, 0.045, 0.05, 0.2, 5, ['#4aa86a', '#c9482a', '#e8c060', '#5a7ad6'][i % 4]!, '#2a2228')
  })
  hangOn(f, L, 'the keys', f.work, 0.55, 1.1, 1.3, (wz + 0.15 - c.z0) / (c.z1 - c.z0), () => {
    L!.detail.rbox(-0.25, 0, 0, 0.25, 0.14, 0.03, 0.008, wood)
    for (let i = 0; i < 4; i++) {
      L!.detail.ball(-0.18 + i * 0.12, 0.07, 0.04, 0.015, BRASS, 4, 2)
      L!.detail.beam(-0.18 + i * 0.12, 0.06, 0.05, -0.18 + i * 0.12, -0.06, 0.05, 0.02, BRASS, 0.008)
    }
  })
  // The fireplace with its pot, on the back wall towards the bard.
  hearthOn(f, c.bard ? Math.min(1, Math.max(0, (c.bard.x - c.x0) / (c.x1 - c.x0))) : (s > 0 ? 0.85 : 0.15))
  // The bard's corner: his lute leaning on the wall, his hat out for coins.
  if (L && !ruined && c.bard) {
    put2(f, [L], 'the hat', lay.centre(0.5, 0.5, 0.14, c.bard.x, c.bard.z + 0.62, { clear: 0.22 }), 0.14, () => hatCoins(L.detail, L.glow))
    put2(f, [L], 'the lute', lay.onWall(f.far, 0.4, 0.36, 0.95, (c.bard.z - c.z0) / (c.z1 - c.z0)), 0.95, () => {
      L.detail.pushMatrix(new Matrix4().makeRotationX(-0.25).setPosition(0, 0, 0.06))
      lute(L.detail)
      L.detail.pop()
    })
  }
  // The notice board with its postings and the dart board, on the walls where there is room.
  hangOn(f, L, 'the notice board', f.far, 0.95, 1.15, 1.8, 0.4, () => noticeBoard(L!.detail, r))
  hangOn(f, L, 'the dart board', f.far, 0.6, 1.2, 1.75, 0.75, () => { L!.detail.push(0, 0.28, 0); dartBoard(L!.detail); L!.detail.pop() })
}

/** A healer's: cots with folded blankets, herbs drying from the beams, the mortar and her shelves of jars. */
const healer = (f: Fit): void => {
  const { c, lay } = f
  const { B, L, x0, x1, z0, fy, r, ruined, wz } = c
  const wood = ash(OAK, ruined)
  const wx = c.west ? x0 : x1
  // Her worktable at the work wall, before her place: a pot on the boil, bottles, the mortar.
  const ws = lay.spotOn(f.work, wz, 1.24, 0.6, 0.3)
  lay.add('her worktable', ws, 0.82)
  place([B, L], ws.x, fy, ws.z, ws.ry, () => {
    table(B, 1.2, 0.55, 0.8, wood)
    B.detail.cyl(-0.25, 0.8, -0.02, 0.17, 0.2, 0.22, 9, '#3a3438')
    if (f.lit) B.glow.cyl(-0.25, 1.02, -0.02, 0.16, 0.16, 0.02, 9, '#7dff8a', '#7dff8a')
    if (!L) return
    place([L], 0.25, 0.8, 0.05, 0, () => mortar(L.detail))
    for (let i = 0; i < 3; i++) L.detail.cyl(0.05 + i * 0.12, 0.8, -0.15, 0.04, 0.035, 0.14, 6, ['#7dff8a', '#5fd8ff', '#ffd84a'][i]!, '#a06a3a')
  })
  void wx
  // Cots along the far wall, heads to it, the folded blankets at their feet.
  for (const [i, pref] of [0.2, 0.5].entries()) put2(f, [B], 'a cot', lay.onWall(f.far, 0.86, 1.82, 0.55, pref), 0.55, () => cot(B, 0.8, 1.75, ash(i ? '#5aa86a' : '#c9b48a', ruined)))
  // Shelves of jars on the back wall; the washstand by her table; candles on the shelves.
  const d = lay.onWall('back', 1.2, 0.6, 1.97, 0.5)
  put2(f, [B, L], 'the shelves of jars', d, 1.97, () => {
    dresser(B, L, 1.2, wood, 'jars', r, ruined)
    if (L) for (const dx of [-0.4, 0.4]) candle(L, dx, 1.97, -0.12, f.lit)
  })
  put2(f, [B, L], 'the washstand', lay.onWall(f.work, 0.66, 0.5, 0.95, 0.15), 0.95, () => washstand(B, L))
  // Herbs drying under the ceiling (over everything, out of the way).
  if (L) place([L], (x0 + x1) / 2, fy + f.top - 0.15, z0 + 1.3, 0, () => herbs(L.detail, Math.min(3.2, x1 - x0 - 1), r))
}

/** A shop: the counter (a cash box, the ledger, the cat asleep on it), wares on the walls and on a table. */
const shop = (f: Fit): void => {
  const { c, lay } = f
  const { B, L, x0, x1, fy, r, ruined, wz } = c
  const s = f.s
  const wx = c.west ? x0 : x1
  const wood = ash(WOOD, ruined)
  // The counter between the merchant and the room, its front to the room the customers come in by.
  const ca = Math.min(wx + s * 1.3, wx + s * 1.72)
  const cb = Math.max(wx + s * 1.3, wx + s * 1.72)
  lay.fixed('the counter', { x0: ca - 0.04, z0: wz - 0.8, x1: cb + 0.04, z1: wz + 0.65 }, 1.2)
  B.hull.rbox(ca, fy, wz - 0.75, cb, fy + 0.92, wz + 0.6, 0.03, { top: shade(wood, 1.1), side: wood })
  B.hull.rbox(ca - 0.04, fy + 0.92, wz - 0.8, cb + 0.04, fy + 0.98, wz + 0.65, 0.015, { top: shade(wood, 1.25), side: wood })
  if (L) {
    const cx = (ca + cb) / 2
    L.detail.rbox(cx - 0.13, fy + 0.98, wz - 0.55, cx + 0.13, fy + 1.1, wz - 0.32, 0.015, { top: '#5a3a24', side: '#4a2e1c' })
    if (!ruined) for (const [dx, dz] of [[-0.05, -0.47], [0.04, -0.42], [0.0, -0.38]] as const) L.glow.cyl(cx + dx, fy + 1.1, wz + dz, 0.025, 0.025, 0.012, 6, '#ffd24a', '#ffe680')
    L.detail.box(cx - 0.17, fy + 0.98, wz - 0.18, cx + 0.17, fy + 1.0, wz + 0.1, '#5a3a24', 'b')
    for (const sx of [-1, 1]) L.detail.box(cx + (sx < 0 ? -0.16 : 0.005), fy + 1.0, wz - 0.17, cx + (sx < 0 ? -0.005 : 0.16), fy + 1.02, wz + 0.09, '#f4ead2', 'b')
    for (let i = 0; i < 4; i++) L.detail.box(cx - 0.14, fy + 1.02, wz - 0.12 + i * 0.05, cx - 0.04, fy + 1.034, wz - 0.11 + i * 0.05, '#6a5a5a', 'b')
    if (!ruined) place([L], cx, fy + 0.98, wz + 0.4, s > 0 ? EAST : WEST, () => cat(L.detail, '#f0a050'))
  }
  // A rack of blades on the wall behind him.
  hangOn(f, B, 'the rack of blades', f.work, 1.45, 1.0, 1.98, (wz - c.z0) / (c.z1 - c.z0), () => {
    B.detail.rbox(-0.7, 0.0, 0, 0.7, 0.08, 0.08, 0.01, wood)
    B.detail.rbox(-0.7, 0.7, 0, 0.7, 0.78, 0.08, 0.01, wood)
    for (let i = 0; i < 5; i++) {
      const x = -0.56 + i * 0.28
      B.detail.beam(x, 0.08, 0.04, x, 0.95, 0.04, 0.05, '#d8dde8', 0.015)
      B.detail.rbox(x - 0.08, 0.08, 0.02, x + 0.08, 0.12, 0.07, 0.008, BRASS)
    }
  })
  // The armour stand in a back corner, a display table of helms and daggers against the back wall, a barrel of spears.
  put2(f, [B, L], 'the armour stand', lay.onWall('back', 0.66, 0.6, 1.65, s > 0 ? 1 : 0), 1.65, () => armourStand(B, L, ash('#8a8f9a', ruined), false))
  put2(f, [B, L], 'the display table', lay.onWall('back', 1.24, 0.64, 0.95, 0.5), 0.95, () => {
    table(B, 1.2, 0.6, 0.78, wood)
    if (!L) return
    for (const x of [-0.35, 0.05]) {
      L.detail.ball(x, 0.84, 0, 0.12, '#a8b0bc', 7, 4, 0.8)
      L.detail.box(x - 0.12, 0.78, -0.02, x + 0.12, 0.81, 0.02, '#6a6a74', 'b')
    }
    for (let i = 0; i < 3; i++) L.detail.beam(0.28 + i * 0.08, 0.795, -0.18, 0.28 + i * 0.08, 0.795, 0.12, 0.04, '#d8dde8', 0.015)
  })
  put2(f, [B], 'the barrel of spears', lay.onWall(f.far, 0.56, 0.56, 1.5, 0.15), 1.5, () => {
    barrel(B.hull, 0, 0, 0, 0.8)
    for (const [dx, dz, h] of [[-0.06, 0.02, 1.3], [0.07, -0.04, 1.1], [0.0, 0.08, 1.45]] as const) B.detail.beam(dx, 0.4, dz, dx * 1.6, h, dz * 1.6, 0.035, '#d8dde8', 0.012)
  })
  // Shields on the far wall.
  for (let i = 0; i < 3; i++) hangOn(f, L, 'a shield', f.far, 0.6, 1.1, 1.72, 0.3 + i * 0.22, () => { L!.detail.push(0, 0.31, 0); wallShield(L!.detail, ['#3f6fd6', '#c9483a', '#5aa84a'][i]!, 0.26); L!.detail.pop() })
  void r
}

/** A school: the master's place of work, and the story of the class taught there. */
const school = (f: Fit): void => {
  const { c, lay } = f
  const { B, L, x0, x1, z0, z1, fy, r, ruined, wz } = c
  const cls = c.cls ?? 'pyro'
  const col = ash(CLASSES[cls].color, ruined)
  const wood = ash(WOOD, ruined)
  const mid = (x0 + x1) / 2
  const s = f.s
  // The master's fixture at the work wall, before his place.
  const fix = (len: number, depth: number, y1: number, label: string, draw: () => void): void => {
    const sp = lay.spotOn(f.work, wz, len, depth, depth / 2)
    lay.add(label, sp, y1)
    place([B, L], sp.x, fy, sp.z, sp.ry, draw)
  }
  // Books on the back wall, whatever is taught here.
  const shelfMix = cls === 'geo' ? 'rocks' : cls === 'blood' ? 'potions' : 'books'
  put2(f, [B, L], 'the bookcase', lay.onWall('back', 1.24, 0.62, 1.97, s > 0 ? 0.25 : 0.75), 1.97, () => {
    dresser(B, L, 1.2, wood, shelfMix, r, ruined)
    if (L) for (const dx of [-0.4, 0.4]) candle(L, dx, 1.97, -0.12, f.lit)
  })
  switch (cls) {
    case 'pyro': {
      // A lectern at her place; a brazier beside it with a bucket of water ready; scorch marks everywhere.
      fix(0.62, 0.48, 0.95, 'the lectern', () => {
        B.hull.rbox(-0.18, 0, -0.18, 0.18, 0.85, 0.18, 0.02, wood)
        B.detail.rbox(-0.3, 0.85, -0.22, 0.3, 0.92, 0.22, 0.015, shade(wood, 1.15))
        if (L) L.detail.rbox(-0.25, 0.92, -0.16, 0.25, 0.97, 0.16, 0.01, { top: '#f4ead2', side: '#c9483a' })
      })
      put2(f, [B], 'the brazier', lay.onWall(f.work, 0.62, 0.62, 1.05, (wz - 1.0 - z0) / (z1 - z0)), 1.05, () => brazier(B, f.lit))
      if (L) put2(f, [L], 'the fire bucket', lay.onWall(f.work, 0.38, 0.38, 0.45, (wz - 1.6 - z0) / (z1 - z0)), 0.45, () => fireBucket(L.detail))
      put2(f, [B, L], 'the practice post', lay.onWall(f.far, 0.7, 0.5, 1.5, 0.25), 1.5, () => {
        B.hull.cyl(0, 0, 0, 0.12, 0.1, 1.2, 7, '#5a3a24', '#2a2220')
        B.detail.rbox(-0.32, 0.98, -0.06, 0.32, 1.12, 0.06, 0.02, '#3a2a24')
        B.detail.cyl(0, 1.2, 0, 0.13, 0.13, 0.3, 7, '#2a2220', '#1e1a1c')
      })
      if (L) for (let i = 0; i < 4; i++) scorch(L.detail, mid + (i - 1.5) * 1.2, z0 + 1.4 + (i % 2) * 1.0, 0.25 + r() * 0.2, fy + 0.05, r)
      hangOn(f, L, 'soot', 'back', 1.2, 0.3, 1.7, 0.5, () => sootUp(L!.detail, 1.2, 1.4, r))
      break
    }
    case 'shadow': {
      // The target on the wall at his place, knives in it; a bookcase on the back wall swung open on a dark doorway.
      hangOn(f, B, 'the target', f.work, 0.9, 0.85, 1.75, (wz - z0) / (z1 - z0), () => { B.detail.push(0, 0.45, 0.0); target(B, L); B.detail.pop() })
      const hs = lay.onWall('back', 1.9, 1.0, 1.97, s > 0 ? 0.7 : 0.3)
      if (hs) {
        lay.add('the hidden door', hs, 1.97)
        const hx = hs.x - s * 0.45
        B.detail.box(Math.min(hx, hx + s * 0.9), fy, z0, Math.max(hx, hx + s * 0.9), fy + 1.85, z0 + 0.05, '#121018', 'b')
        place([B, L], hx, fy, z0 + 0.06, -s * 0.65, () => {
          for (const k of [B, L]) if (k) for (const m of [k.hull, k.detail, k.glow]) m.push(s * 0.45, 0, 0.27)
          dresser(B, L, 0.9, wood, 'books', r, ruined)
          for (const k of [B, L]) if (k) for (const m of [k.hull, k.detail, k.glow]) m.pop()
        })
      }
      if (L) put2(f, [L], 'the knives on a crate', lay.onWall(f.far, 0.74, 0.54, 0.6, 0.5), 0.6, () => {
        L.detail.rbox(-0.35, 0, -0.25, 0.35, 0.55, 0.25, 0.02, wood)
        for (let i = 0; i < 4; i++) L.detail.beam(-0.2 + i * 0.12, 0.565, -0.12, -0.2 + i * 0.12 + 0.05, 0.565, 0.12, 0.035, '#d8dde8', 0.01)
      })
      hangOn(f, L, 'a cloak on its peg', f.far, 0.5, 0.7, 1.75, 0.8, () => hang(L!.detail, -0.2, 0.03, 0.2, 0.03, 1.0, 0.0, '#2a2440', { pleats: 2, depth: 0.03, seed: 7 }))
      break
    }
    case 'sovereign': {
      // The throne at the back, its cushion worn pale; a carpet from the door to it; banners; his desk.
      const t = lay.onWall('back', 1.1, 0.72, 2.05, 0.5)
      put2(f, [B, L], 'the throne', t, 2.05, () => throne(B, L, ash('#6a3a2a', ruined), col))
      if (t) {
        const rr = { x0: t.x - 0.65, z0: t.rect.z1 + 0.1, x1: t.x + 0.65, z1: z1 - 0.15 }
        lay.fixed('the carpet', rr, 0.04, { flat: true })
        place([B], t.x, fy, (rr.z0 + rr.z1) / 2, 0, () => rug(B.detail, 1.3, rr.z1 - rr.z0, [ash('#8a1a2a', ruined), ash('#a82a3a', ruined), ash(BRASS, ruined)]))
        for (const dx of [-0.85, 0.85]) put2(f, [L], 'a candelabra', L && lay.free(around(t.x + dx, t.z + 0.05, 0.14), 1.45) ? { x: t.x + dx, z: t.z + 0.05, ry: 0, rect: around(t.x + dx, t.z + 0.05, 0.14) } : null, 1.45, () => {
          L!.detail.cyl(0, 0, 0, 0.12, 0.05, 1.2, 6, BRASS, shade(BRASS, 1.1))
          for (const ox of [-0.12, 0, 0.12]) candle(L!, ox, 1.2, 0, f.lit, 0.1)
        })
      }
      fix(1.12, 0.62, 0.8, 'his desk', () => desk(B, L, wood, f.lit))
      for (const w of ['west', 'east'] as const) for (const pref of [0.3, 0.65]) hangOn(f, L, 'a banner', w, 0.7, 0.62, 2.1, pref, () => { L!.detail.push(0, 1.48, 0); banner(L!.detail, col, BRASS, 1.2, 1); L!.detail.pop() })
      break
    }
    case 'chrono': {
      // Clocks on the back wall, each telling a different time; a tall clock in the corner; hourglasses on his desk.
      fix(1.12, 0.62, 0.8, 'his desk', () => {
        desk(B, L, wood, f.lit)
        if (L) for (const [x, sc] of [[0.02, 1], [0.42, 0.7]] as const) { L.detail.push(x, 0.78, x > 0.3 ? -0.15 : 0.2); hourglass(L.detail, sc); L.detail.pop() }
      })
      put2(f, [B], 'the tall clock', lay.onWall('back', 0.56, 0.46, 2.05, s > 0 ? 1 : 0), 2.05, () => tallClock(B, r()))
      for (let i = 0; i < 4; i++) hangOn(f, L, 'a clock', 'back', 0.42, 1.35 + (i % 2) * 0.35, 1.75 + (i % 2) * 0.35, 0.2 + i * 0.2, () => { L!.detail.push(0, 0.2, 0.012); wallClock(L!.detail, r(), 0.14 + (i % 3) * 0.04); L!.detail.pop() })
      break
    }
    case 'blood': {
      // A cauldron bubbling in the room, her bench of vials at her place, a stained cloth over it.
      put2(f, [B], 'the cauldron', lay.centre(0.9, 0.9, 0.9, mid + s * 0.4, z0 + 1.5, { clear: 0.45 }), 0.9, () => cauldron(B, '#ff2a4a', f.lit))
      fix(1.24, 0.6, 0.82, 'her bench', () => {
        table(B, 1.2, 0.55, 0.8, wood)
        if (!L) return
        drape(L.detail, -0.55, -0.24, 0.1, 0.24, 0.8, ['#8a1a2a', '#a82a3a'], { n: 3, lift: 0.02, drop: 0.15, sides: 's', out: 0.03 })
        if (f.lit) for (let i = 0; i < 4; i++) L.glow.cyl(0.22 + (i % 2) * 0.12, 0.8, -0.12 + Math.floor(i / 2) * 0.18, 0.035, 0.03, 0.14, 6, i % 2 ? '#ff2a4a' : '#b06aff', '#ffd0d8')
      })
      break
    }
    case 'aether': {
      // A contraption half built in the room, tools about it; his workbench at his place.
      put2(f, [B, L], 'the contraption', lay.centre(1.1, 1.3, 1.4, mid + s * 0.2, z0 + 1.4, { clear: 0.45 }), 1.4, () => contraption(B, L, f.lit))
      fix(1.24, 0.6, 0.84, 'his workbench', () => {
        table(B, 1.2, 0.55, 0.82, ash('#6a6a74', ruined))
        if (!L) return
        for (let i = 0; i < 3; i++) L.detail.cyl(-0.3 + i * 0.25, 0.82, 0.0, 0.09, 0.09, 0.04, 8, '#c9a24a', '#d8b04a')
        L.detail.beam(0.2, 0.84, -0.15, 0.45, 0.84, -0.05, 0.04, '#8a8f9a')
      })
      break
    }
    case 'geo': {
      // Rock samples on the shelves, a geode split open on a table against the wall, a pile of ore in the corner; his desk.
      put2(f, [B], 'the geode table', lay.onWall('back', 1.04, 0.74, 1.3, 0.5), 1.3, () => {
        table(B, 1.0, 0.7, 0.72, wood)
        place([B], 0, 0.72, 0, 0, () => geode(B, f.lit))
      })
      if (L) put2(f, [L], 'the ore', lay.onWall(f.far, 0.9, 0.7, 0.4, 0.15), 0.4, () => {
        for (let i = 0; i < 5; i++) L.detail.ball(-0.3 + (i % 3) * 0.3, 0.1 + Math.floor(i / 3) * 0.12, -0.12 + (i % 2) * 0.24, 0.13 - (i % 3) * 0.015, ['#6a645e', '#8a8f9a', '#a8946a'][i % 3]!, 5, 3, 0.8)
      })
      fix(1.12, 0.62, 0.8, 'his desk', () => desk(B, L, wood, f.lit))
      break
    }
    case 'aegis': {
      // The armour on its stand, the polishing cloth over it; a shield on the wall; a bench at his place.
      put2(f, [B, L], 'the armour stand', lay.onWall('back', 0.66, 0.6, 1.65, 0.5), 1.65, () => armourStand(B, L, ash('#c0c8d4', ruined), true))
      hangOn(f, L, 'a shield', f.far, 0.7, 1.1, 1.75, 0.35, () => { L!.detail.push(0, 0.32, 0); wallShield(L!.detail, col, 0.32); L!.detail.pop() })
      fix(1.24, 0.44, 0.55, 'his bench', () => bench(B, 1.2, wood, ash('#3f6fd6', ruined), 1))
      break
    }
  }
  // A study table with chairs round it, books open on it (where the class's centrepiece leaves the room).
  if (cls === 'pyro' || cls === 'shadow' || cls === 'chrono' || cls === 'aegis' || cls === 'geo' || cls === 'sovereign') {
    dining(f, 1.5, 0.72, mid - s * 0.4, z0 + (z1 - z0) * 0.55, false, wood, null, (K) => {
      for (const [x, z, a, colB] of [[-0.42, -0.12, 0.2, '#c9483a'], [0.2, 0.05, -0.3, '#3f6fd6']] as const) {
        K.detail.push(x, 0.74, z, a)
        K.detail.rbox(-0.2, 0, -0.14, 0.2, 0.03, 0.14, 0.008, colB)
        K.detail.box(-0.18, 0.03, -0.12, -0.005, 0.045, 0.12, '#f4ead2', 'b')
        K.detail.box(0.005, 0.03, -0.12, 0.18, 0.045, 0.12, '#f4ead2', 'b')
        K.detail.pop()
      }
      for (let i = 0; i < 3; i++) K.detail.rbox(0.48 - 0.02 * i, 0.74 + i * 0.06, -0.2, 0.68 - 0.02 * i, 0.8 + i * 0.06, 0.05, 0.008, ['#5aa84a', '#d8b04a', '#7a3fa0'][i]!)
      candle(K, -0.1, 0.74, 0.22, f.lit)
    })
  }
  // A plant in a front corner.
  if (L) put2(f, [L], 'a plant', lay.onWall(f.far, 0.46, 0.46, 0.75, 0.92), 0.75, () => plant(L, 1.1, cls !== 'blood', ruined))
}
