import { Float32BufferAttribute, SphereGeometry } from 'three'
import type { ClassId } from '../data/skills'
import { CLASSES } from '../data/skills'
import type { TownJob, TownStyle } from '../data/zones'
import { CELL } from '../sim/grid'
import type { TownHouse } from '../sim/town'
import { Mesher, cage, lc, newKit, seeded, shade, under, type Col, type Kit } from './archKit'
import { rock, stripUv } from './kit'

/**
 * ─── Houses (roadmap #41) ────────────────────────────────────────────────────
 *
 * A building kit in the game's chunky storybook style: a stone base course,
 * timber-framed plaster walls (the beams are raised strips), an upper storey
 * that juts out a hand's breadth, roofs with deep eaves — shingle rows that
 * step down the slope, a fat rounded thatch, steep slate — dormers, chimneys,
 * doors with frames and steps, shuttered windows with warm lit panes, flower
 * boxes, awnings, lanterns, and a sign over the door that says what the house
 * is: an anvil, a mug, a potion, crossed blades, a school's banner.
 *
 * Six kinds of house (cottage, town house, workshop with an open forge, tavern,
 * hall, chapel), varied by a seed (size, colours, roof, details) and by the
 * town's character (Sunford thatch and timber, Oakhaven tall and colourful,
 * Ironhold stone and slate), and each of them comes as a ruin too: charred
 * beams, walls broken off, a roof fallen in, windows boarded up.
 *
 * Every door faces the camera. A house somebody works in is walked into: its
 * front wall, upper storey and roof go into a SEPARATE kit (`cut`) the town
 * view fades away when the hero steps inside, and what stays (the other walls,
 * a floor, furniture, the trade's own things) is the room.
 *
 * All of it is flat-shaded planes (`archKit.ts`), vertex colours only.
 */

/** How far the walls stand in from the edge of the footprint's cells. */
export const WALL_IN = 0.4
/** Wall thickness. */
const T = 0.22
const BASE_H = 0.4
/** A room's floor: a finger above the ground the people in it stand on. */
const ROOM_Y = 0.03

interface Pal {
  wall: string
  upper: string
  inner: string
  timber: string
  base: string
  roof: string
  roof2: string
  edge: string
  shutter: string
  door: string
  floor: string
}

const RURAL_WALLS = ['#f4e7c6', '#f6dcb8', '#efe7d2', '#ecd7a6', '#f3e0c8']
const MERC_WALLS = ['#f2d9a6', '#c4e0e6', '#f2c6c2', '#d2e8c6', '#f4ecd8', '#e8d0ec']
const STONE_WALLS = ['#a7a6ae', '#9c9aa4', '#aaa395', '#9ea4ac']
const SHUTTERS = ['#5e9c6a', '#4f86c6', '#c96a4a', '#7a6ab8', '#3f9a9a']
const RURAL_ROOFS: Array<[string, string]> = [['#c75440', '#a8402f'], ['#d8743e', '#b45a2c'], ['#5f86c8', '#486ca8'], ['#b0583a', '#8e4430'], ['#6a8a4a', '#567238']]
const MERC_ROOFS: Array<[string, string]> = [['#4f6292', '#405280'], ['#b8503c', '#a04432'], ['#3f8a86', '#337672'], ['#6a5a8a', '#584a76']]
const SLATE: Array<[string, string]> = [['#4d566e', '#424a60'], ['#555a66', '#4a4e58'], ['#4a5a6a', '#3e4c5a']]

const palette = (style: TownStyle, r: () => number, kind: TownHouse['kind']): Pal => {
  const pick = <T>(a: readonly T[]): T => a[Math.floor(r() * a.length)]!
  if (style === 'mountain') {
    const [roof, roof2] = pick(SLATE)
    const stone = pick(STONE_WALLS)
    return { wall: stone, upper: kind === 'tavern' || r() < 0.4 ? '#e8dcc0' : stone, inner: '#efe2c8', timber: '#4f3a2c', base: '#7d7a80', roof, roof2, edge: '#3a3236', shutter: pick(['#8a4a3a', '#4a6a8a', '#5a7a4a']), door: '#6a4630', floor: '#9a7a58' }
  }
  if (style === 'mercantile') {
    const [roof, roof2] = pick(MERC_ROOFS)
    const w = pick(MERC_WALLS)
    return { wall: w, upper: r() < 0.5 ? w : pick(MERC_WALLS), inner: '#f6ead2', timber: '#5a3c2a', base: '#a49c90', roof, roof2, edge: '#4a3428', shutter: pick(SHUTTERS), door: '#7a4c2e', floor: '#a8825c' }
  }
  const [roof, roof2] = pick(RURAL_ROOFS)
  const w = pick(RURAL_WALLS)
  return { wall: w, upper: w, inner: '#f8ecd4', timber: '#7a4e2e', base: '#b9a68a', roof, roof2, edge: '#5a3a24', shutter: pick(SHUTTERS), door: '#8a5a34', floor: '#b08a60' }
}

type Roof = 'gable' | 'front' | 'hip' | 'thatch'

export interface HouseCtx {
  style: TownStyle
  ruined: boolean
  low: boolean
  /** World centre of the house and the ground's height there. */
  x: number
  y: number
  z: number
  /** The one at work inside (furnishes the room). */
  job?: TownJob
  /** A school's class (its banner). */
  cls?: ClassId
}

export interface HouseOut {
  /** The front wall, the upper storey and the roof of a house that is walked into. */
  cut: Kit | null
  /** Chimney tops (world), for their smoke. */
  chimneys: Array<[number, number, number]>
  /** Warm lights (world) by the door: lanterns. */
  lamps: Array<[number, number, number]>
  /** The forge's mouth (world), for its sparks. */
  forge: [number, number, number] | null
  /** Height of the eaves (for the cut-away's lift). */
  top: number
}

/** A face of the box: where it lies and which way it turns. */
type Face = 's' | 'e' | 'w' | 'n'

const faceRot: Record<Face, number> = { s: 0, e: Math.PI / 2, w: -Math.PI / 2, n: Math.PI }

/** Put `fn` on a face: local x along the face (to the viewer's right), y up, +z out of the wall. */
const onFace = (k: Kit, W: number, D: number, f: Face, y: number, fn: (len: number) => void): void => {
  const off = f === 's' || f === 'n' ? D / 2 : W / 2
  const r = faceRot[f]
  under(k, Math.sin(r) * off, y, Math.cos(r) * off, r, () => fn(f === 's' || f === 'n' ? W : D))
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

/** A window on a face (centre x, sill y): frame, cross, sill, panes, shutters. */
const windowOn = (k: Kit, x: number, y: number, w: number, h: number, p: Pal, lit: boolean, o: { shutters?: boolean; box?: boolean; boarded?: boolean; round?: boolean; stone?: boolean } = {}): void => {
  const fr = o.stone ? '#6f6c72' : p.timber
  // The pane: warm light from within, or dark glass.
  if (lit && !o.boarded) k.glow.quad(x - w / 2, y, 0.02, x + w / 2, y, 0.02, x + w / 2, y + h, 0.02, x - w / 2, y + h, 0.02, '#ffd27a')
  else k.detail.quad(x - w / 2, y, 0.02, x + w / 2, y, 0.02, x + w / 2, y + h, 0.02, x - w / 2, y + h, 0.02, o.boarded ? '#2a2228' : '#4a5a74')
  const t = 0.07
  const d = k.detail
  d.box(x - w / 2 - t, y - t, 0, x + w / 2 + t, y, 0.07, fr, 'bn')
  d.box(x - w / 2 - t, y + h, 0, x + w / 2 + t, y + h + t, 0.07, fr, 'bn')
  d.box(x - w / 2 - t, y, 0, x - w / 2, y + h, 0.07, fr, 'bn')
  d.box(x + w / 2, y, 0, x + w / 2 + t, y + h, 0.07, fr, 'bn')
  if (!o.boarded) {
    d.box(x - 0.025, y, 0.01, x + 0.025, y + h, 0.05, fr, 'bn')
    d.box(x - w / 2, y + h * 0.55 - 0.025, 0.01, x + w / 2, y + h * 0.55 + 0.025, 0.05, fr, 'bn')
  }
  // The sill sticks out.
  d.box(x - w / 2 - 0.12, y - t - 0.05, 0, x + w / 2 + 0.12, y - t + 0.01, 0.16, shade(fr, 1.15), 'bn')
  if (o.boarded) {
    // Planks nailed across.
    d.beam(x - w / 2 - 0.08, y + h * 0.2, 0.09, x + w / 2 + 0.08, y + h * 0.75, 0.09, 0.12, '#8a7258', 0.04)
    d.beam(x - w / 2 - 0.08, y + h * 0.85, 0.11, x + w / 2 + 0.08, y + h * 0.3, 0.11, 0.12, '#7a6248', 0.04)
    return
  }
  if (o.shutters) {
    // Shutters swung open against the wall.
    const sw = w * 0.52
    const sc = p.shutter
    d.box(x - w / 2 - t - sw, y, 0.02, x - w / 2 - t - 0.02, y + h, 0.08, { front: sc, side: shade(sc, 0.8), top: shade(sc, 1.1) }, 'bn')
    d.box(x + w / 2 + t + 0.02, y, 0.02, x + w / 2 + t + sw, y + h, 0.08, { front: sc, side: shade(sc, 0.8), top: shade(sc, 1.1) }, 'bn')
    d.box(x - w / 2 - t - sw + 0.04, y + h * 0.48, 0.08, x - w / 2 - t - 0.06, y + h * 0.52, 0.1, shade(sc, 0.7), 'bn')
    d.box(x + w / 2 + t + 0.06, y + h * 0.48, 0.08, x + w / 2 + t + sw - 0.04, y + h * 0.52, 0.1, shade(sc, 0.7), 'bn')
  }
  if (o.box) {
    // A flower box under it, in bloom.
    d.box(x - w / 2 - 0.05, y - 0.32, 0.04, x + w / 2 + 0.05, y - 0.13, 0.3, { front: '#8a5a34', side: '#6a4428', top: '#5a3a24' }, 'bn')
    d.box(x - w / 2, y - 0.14, 0.06, x + w / 2, y - 0.08, 0.28, '#4f9a44', 'bn')
    const cols = ['#ff6a8a', '#ffd84a', '#ff8a4a', '#c08aff', '#ffffff']
    const n = Math.max(3, Math.round(w / 0.2))
    for (let i = 0; i < n; i++) {
      const fx = x - w / 2 + 0.07 + (i / (n - 1)) * (w - 0.14)
      d.ball(fx, y - 0.04 + (i % 2) * 0.05, 0.18 + (i % 3) * 0.03, 0.075, cols[(((i * 7 + Math.round(x * 13)) % cols.length) + cols.length) % cols.length]!, 4, 2)
    }
  }
}

/** A door on a face at x: frame, planks, hinges, a step. `open`: a doorway into a room. */
const doorOn = (k: Kit, x: number, w: number, h: number, p: Pal, o: { open?: boolean; double?: boolean; stone?: boolean; boarded?: boolean; transom?: boolean } = {}): void => {
  const d = k.detail
  const fr = o.stone ? '#77727a' : shade(p.timber, 0.95)
  const t = 0.11
  // Frame: posts and a lintel proud of the wall.
  d.box(x - w / 2 - t, 0, 0, x - w / 2, h + t, 0.09, fr, 'bn')
  d.box(x + w / 2, 0, 0, x + w / 2 + t, h + t, 0.09, fr, 'bn')
  d.box(x - w / 2 - t - 0.06, h, 0, x + w / 2 + t + 0.06, h + t + 0.05, 0.12, shade(fr, 1.1), 'bn')
  if (o.open) return
  if (o.boarded) {
    d.quad(x - w / 2, 0.02, 0.01, x + w / 2, 0.02, 0.01, x + w / 2, h, 0.01, x - w / 2, h, 0.01, '#1e1a20')
    for (let i = 0; i < 3; i++) d.beam(x - w / 2 - 0.05, h * (0.25 + i * 0.25) + (i % 2 ? 0.08 : -0.08), 0.06, x + w / 2 + 0.05, h * (0.25 + i * 0.25) - (i % 2 ? 0.08 : -0.08), 0.06, 0.13, i % 2 ? '#8a7258' : '#76604a', 0.04)
    return
  }
  // Planks, a little different each.
  const n = o.double ? 4 : 3
  const dc = p.door
  for (let i = 0; i < n; i++) {
    const x0 = x - w / 2 + (i / n) * w
    const x1 = x - w / 2 + ((i + 1) / n) * w
    const c = shade(dc, i % 2 ? 0.92 : 1.04)
    d.box(x0 + 0.008, 0, 0.0, x1 - 0.008, h, 0.04, { front: c, side: shade(dc, 0.8), top: shade(dc, 1.1) }, 'bn')
  }
  // Iron bands and a ring.
  for (const yy of [0.32, h - 0.38]) d.box(x - w / 2 + 0.03, yy, 0.04, x + w / 2 - 0.03, yy + 0.06, 0.06, '#3a3438', 'bn')
  d.ball(x + (o.double ? 0.08 : w / 2 - 0.16), h * 0.5, 0.07, 0.045, '#d8b04a', 5, 3)
  if (o.double) d.box(x - 0.015, 0, 0.04, x + 0.015, h, 0.06, shade(dc, 0.7), 'bn')
  if (o.transom) k.glow.quad(x - w / 2 + 0.06, h + 0.04, 0.11, x + w / 2 - 0.06, h + 0.04, 0.11, x + w / 2 - 0.06, h + 0.12, 0.11, x - w / 2 + 0.06, h + 0.12, 0.11, '#ffd27a')
}

/** Timber framing on a face between y0 and y1: posts beside openings, rails, a brace or two. */
const framing = (k: Kit, len: number, y0: number, y1: number, p: Pal, gaps: Array<[number, number]>, r: () => number, ruined: boolean): void => {
  const d = k.detail
  const c = ruined ? '#2e2622' : p.timber
  const s = 0.13
  const free = (x: number): boolean => gaps.every(([a, b]) => x < a - 0.1 || x > b + 0.1)
  // Corner posts and rails.
  d.box(-len / 2, y0, 0, -len / 2 + s, y1, 0.05, c, 'bn')
  d.box(len / 2 - s, y0, 0, len / 2, y1, 0.05, c, 'bn')
  d.box(-len / 2, y1 - s, 0, len / 2, y1, 0.06, shade(c, 1.08), 'bn')
  d.box(-len / 2, y0, 0, len / 2, y0 + s * 0.8, 0.05, c, 'bn')
  // Posts on either side of every window and door, and between where there is room.
  const posts: number[] = []
  for (const [a, b] of gaps) { posts.push(a - 0.18, b + 0.18) }
  for (let x = -len / 2 + 0.9; x < len / 2 - 0.6; x += 1.1) if (free(x) && posts.every(q => Math.abs(q - x) > 0.5)) posts.push(x)
  for (const x of posts) if (x > -len / 2 + 0.2 && x < len / 2 - 0.2) d.box(x - s / 2, y0, 0, x + s / 2, y1, 0.045, c, 'bn')
  // Braces in the panels with no openings.
  posts.sort((a, b) => a - b)
  const all = [-len / 2 + s, ...posts, len / 2 - s]
  for (let i = 0; i < all.length - 1; i++) {
    const a = all[i]!
    const b = all[i + 1]!
    if (b - a < 0.5 || !free((a + b) / 2) || r() < (ruined ? 0.7 : 0.45)) continue
    if (r() < 0.5) d.beam(a + 0.05, y0 + 0.1, 0.02, b - 0.05, y1 - 0.15, 0.02, 0.1, c, 0.05)
    else {
      d.beam(a + 0.05, y1 - 0.15, 0.02, b - 0.05, y0 + 0.1, 0.02, 0.1, c, 0.05)
      if (r() < 0.4) d.beam(a + 0.05, y0 + 0.1, 0.025, b - 0.05, y1 - 0.15, 0.025, 0.1, c, 0.05)
    }
  }
}

/** Stone courses over a face (Ironhold): rows a shade apart, corner quoins. */
const masonry = (k: Kit, len: number, y0: number, y1: number, stone: string, r: () => number): void => {
  const d = k.detail
  const rows = Math.max(2, Math.round((y1 - y0) / 0.42))
  const rh = (y1 - y0) / rows
  for (let i = 0; i < rows; i++) {
    const yy = y0 + i * rh
    const c = shade(stone, 0.9 + (i % 2) * 0.1 + (r() - 0.5) * 0.05)
    // A course in two or three blocks, set off a little from one another.
    const n = 2 + Math.floor(r() * 2)
    let x = -len / 2
    for (let b = 0; b < n; b++) {
      const w = b === n - 1 ? len / 2 - x : (len / n) * (0.75 + r() * 0.5)
      d.box(x + 0.02, yy + 0.025, 0, x + w - 0.02, yy + rh - 0.025, 0.035 + r() * 0.015, { front: shade(stone, (0.92 + r() * 0.14) * (i % 2 ? 1 : 0.95)), side: c, top: shade(stone, 1.1) }, 'bn')
      x += w
    }
  }
  // Big corner stones.
  for (let i = 0; i < rows; i++) {
    const yy = y0 + i * rh
    const w = i % 2 ? 0.34 : 0.22
    for (const s of [-1, 1]) d.box(s < 0 ? -len / 2 - 0.02 : len / 2 - w + 0.02, yy + 0.02, 0, s < 0 ? -len / 2 + w - 0.02 : len / 2 + 0.02, yy + rh - 0.02, 0.06, shade(stone, 1.12), 'bn')
  }
}

// ─── Roofs ───────────────────────────────────────────────────────────────────


/**
 * One face of a roof as shingle rows stepping down it. Corners: eave-left,
 * eave-right, ridge-right, ridge-left (a triangle has the ridge corners
 * equal). `nx, ny, nz`: the face's outward normal (rows are lifted along it).
 */
const roofRows = (m: Mesher, a: number[], b: number[], c: number[], dd: number[], n: [number, number, number], rows: number, c1: string, c2: string, step = 0.06): void => {
  const L = (p: number[], q: number[], t: number): number[] => [p[0]! + (q[0]! - p[0]!) * t, p[1]! + (q[1]! - p[1]!) * t, p[2]! + (q[2]! - p[2]!) * t]
  const up = (p: number[], h: number): number[] => [p[0]! + n[0] * h, p[1]! + n[1] * h, p[2]! + n[2] * h]
  for (let i = 0; i < rows; i++) {
    const t0 = i / rows
    const t1 = (i + 1) / rows
    const l0 = L(a, dd, t0)
    const r0 = L(b, c, t0)
    const l1 = L(a, dd, t1)
    const r1 = L(b, c, t1)
    const col = i % 2 ? c1 : c2
    // Each row tilts out at its lower edge: the step shows as a darker riser.
    const A0 = up(l0, step + 0.01)
    const B0 = up(r0, step + 0.01)
    const B1 = up(r1, 0.01)
    const A1 = up(l1, 0.01)
    m.quad(A0[0]!, A0[1]!, A0[2]!, B0[0]!, B0[1]!, B0[2]!, B1[0]!, B1[1]!, B1[2]!, A1[0]!, A1[1]!, A1[2]!, [shade(col, 0.92), shade(col, 0.92), shade(col, 1.04), shade(col, 1.04)])
    const a0 = up(l0, 0.0)
    const b0 = up(r0, 0.0)
    m.quad(a0[0]!, a0[1]!, a0[2]!, b0[0]!, b0[1]!, b0[2]!, B0[0]!, B0[1]!, B0[2]!, A0[0]!, A0[1]!, A0[2]!, shade(col, 0.62))
  }
}

/** A gable roof, ridge along local x, eaves front (+z) and back. Returns the ridge height. */
const gableRoof = (k: Kit, cut: Kit, L: number, span: number, Y: number, rise: number, p: Pal, o: { eave: number; gableOver: number; rows: number; ruined: boolean; r: () => number; slate?: boolean }): void => {
  const half = span / 2 + o.eave
  const ang = Math.atan2(rise, span / 2)
  const drop = o.eave * Math.tan(ang)
  const ey = Y - drop
  const ry = Y + rise
  const x0 = -L / 2 - o.gableOver
  const x1 = L / 2 + o.gableOver
  const th = 0.14
  const h = cut.hull
  const parts = o.ruined ? (o.r() < 0.5 ? 0 : 1) : 2
  // The slabs: front then back (a ruin has lost one, or both).
  for (const side of [1, -1]) {
    if (parts === 0 || (parts === 1 && side === 1)) continue
    const n: [number, number, number] = [0, Math.cos(ang), side * Math.sin(ang)]
    // Top surface corners: eave-left, eave-right, ridge-right, ridge-left.
    const eL = [x0, ey, side * half]
    const eR = [x1, ey, side * half]
    const rR = [x1, ry, 0]
    const rL = [x0, ry, 0]
    if (side === 1) h.quad(eL[0]!, eL[1]!, eL[2]!, eR[0]!, eR[1]!, eR[2]!, rR[0]!, rR[1]!, rR[2]!, rL[0]!, rL[1]!, rL[2]!, p.roof)
    else h.quad(eR[0]!, eR[1]!, eR[2]!, eL[0]!, eL[1]!, eL[2]!, rL[0]!, rL[1]!, rL[2]!, rR[0]!, rR[1]!, rR[2]!, p.roof)
    // The eave's edge and the slab's underside.
    h.quad(side === 1 ? x0 : x1, ey - th, side * half, side === 1 ? x1 : x0, ey - th, side * half, side === 1 ? x1 : x0, ey, side * half, side === 1 ? x0 : x1, ey, side * half, p.edge)
    h.quad(side === 1 ? x1 : x0, ey - th, side * half, side === 1 ? x0 : x1, ey - th, side * half, side === 1 ? x0 : x1, ry - th, 0, side === 1 ? x1 : x0, ry - th, 0, shade(p.edge, 0.8))
    // The gable ends of the slab.
    for (const ex of [x0, x1]) {
      const s = ex === x0 ? -1 : 1
      if (s * side < 0) h.quad(ex, ey - th, side * half, ex, ey, side * half, ex, ry, 0, ex, ry - th, 0, p.edge)
      else h.quad(ex, ey - th, side * half, ex, ry - th, 0, ex, ry, 0, ex, ey, side * half, p.edge)
    }
    const rows = o.rows
    if (side === 1) roofRows(cut.detail, eL, eR, rR, rL, n, rows, p.roof, p.roof2, o.slate ? 0.045 : 0.065)
    else roofRows(cut.detail, eR, eL, rL, rR, n, rows, p.roof, p.roof2, o.slate ? 0.045 : 0.065)
    // Barge boards along the gable edges.
    for (const ex of [x0, x1]) cut.detail.beam(ex, ey + 0.02, side * half, ex, ry + 0.02, 0, 0.1, p.edge, 0.12)
  }
  if (parts === 2) {
    // The ridge cap.
    cut.detail.beam(x0 - 0.05, ry + 0.06, 0, x1 + 0.05, ry + 0.06, 0, 0.2, shade(p.roof2, 0.8), 0.14)
  } else {
    // Charred rafters stick out where the roof fell in.
    for (let x = x0 + 0.4; x < x1 - 0.2; x += 0.75) {
      const side = parts === 1 ? 1 : (Math.round(x * 10) % 2 ? 1 : -1)
      const len = 0.4 + o.r() * 0.6
      cut.detail.beam(x, ry - 0.05, 0, x, ry - 0.05 - Math.sin(ang) * half * len, side * Math.cos(ang) * half * len, 0.1, '#2e2622', 0.1)
    }
    cut.detail.beam(x0 + 0.3, ry - 0.08, 0, x1 - 0.3 - o.r(), ry - 0.08, 0, 0.14, '#2a2220', 0.14)
  }
}

/** The gable-end triangle of a wall (the wall's colour, a king post). */
const gableEnd = (k: Mesher, half: number, Y: number, rise: number, z: number, c: Col, back: boolean): void => {
  if (back) k.tri(half, Y, z, -half, Y, z, 0, Y + rise, z, c)
  else k.tri(-half, Y, z, half, Y, z, 0, Y + rise, z, c)
}

/** A hipped roof: four faces down to the eaves on every side. */
const hipRoof = (cut: Kit, W: number, D: number, Y: number, rise: number, p: Pal, eave: number, rows: number): void => {
  const hw = W / 2 + eave
  const hd = D / 2 + eave
  const ang = Math.atan2(rise, D / 2)
  const ey = Y - eave * Math.tan(ang)
  const ry = Y + rise
  const rx = Math.max(0.05, (W - D) / 2)
  const h = cut.hull
  const th = 0.14
  // Front, back.
  h.quad(-hw, ey, hd, hw, ey, hd, rx, ry, 0, -rx, ry, 0, p.roof)
  h.quad(hw, ey, -hd, -hw, ey, -hd, -rx, ry, 0, rx, ry, 0, p.roof)
  // East, west.
  h.tri(hw, ey, hd, hw, ey, -hd, rx, ry, 0, p.roof)
  h.tri(-hw, ey, -hd, -hw, ey, hd, -rx, ry, 0, p.roof)
  // The fascia all round.
  h.quad(-hw, ey - th, hd, hw, ey - th, hd, hw, ey, hd, -hw, ey, hd, p.edge)
  h.quad(hw, ey - th, -hd, -hw, ey - th, -hd, -hw, ey, -hd, hw, ey, -hd, p.edge)
  h.quad(hw, ey - th, hd, hw, ey - th, -hd, hw, ey, -hd, hw, ey, hd, p.edge)
  h.quad(-hw, ey - th, -hd, -hw, ey - th, hd, -hw, ey, hd, -hw, ey, -hd, p.edge)
  const nF: [number, number, number] = [0, Math.cos(ang), Math.sin(ang)]
  const angS = Math.atan2(rise, hw - rx)
  roofRows(cut.detail, [-hw, ey, hd], [hw, ey, hd], [rx, ry, 0], [-rx, ry, 0], nF, rows, p.roof, p.roof2)
  roofRows(cut.detail, [hw, ey, -hd], [-hw, ey, -hd], [-rx, ry, 0], [rx, ry, 0], [0, nF[1], -nF[2]], rows, p.roof, p.roof2)
  roofRows(cut.detail, [hw, ey, hd], [hw, ey, -hd], [rx, ry, 0], [rx, ry, 0], [Math.sin(angS), Math.cos(angS), 0], rows, p.roof, p.roof2)
  roofRows(cut.detail, [-hw, ey, -hd], [-hw, ey, hd], [-rx, ry, 0], [-rx, ry, 0], [-Math.sin(angS), Math.cos(angS), 0], rows, p.roof, p.roof2)
  cut.detail.beam(-rx - 0.1, ry + 0.05, 0, rx + 0.1, ry + 0.05, 0, 0.2, shade(p.roof2, 0.8), 0.14)
}

/** A rounded thatch: soft, deep, pulled down over the eaves. */
const thatchRoof = (cut: Kit, W: number, D: number, Y: number, rise: number, ruined: boolean, r: () => number): void => {
  const g = new SphereGeometry(1, 16, 12)
  const pos = g.attributes.position!
  const e = 0.55
  const hw = W / 2 + 0.42
  const hd = D / 2 + 0.42
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i)
    let y = pos.getY(i)
    let z = pos.getZ(i)
    x = Math.sign(x) * Math.pow(Math.abs(x), e)
    z = Math.sign(z) * Math.pow(Math.abs(z), e)
    y = Math.max(-0.15, y)
    const t = Math.max(0, y)
    // Pinched toward a ridge along the long side.
    const kx = W >= D ? 1 - 0.32 * Math.pow(t, 1.5) : 1 - 0.62 * Math.pow(t, 1.3)
    const kz = W >= D ? 1 - 0.62 * Math.pow(t, 1.3) : 1 - 0.32 * Math.pow(t, 1.5)
    pos.setXYZ(i, x * hw * kx, y * rise, z * hd * kz)
  }
  g.computeVertexNormals()
  stripUv(g)
  const cols = new Float32Array(pos.count * 3)
  const straw = ruined ? ['#6a5a40', '#5a4a34'] : ['#e8c060', '#d8aa46']
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const band = Math.floor((y + 0.3) / 0.22)
    const c = lc(y < 0.05 ? (ruined ? '#3a3028' : '#b88a36') : straw[band % 2]!).clone().multiplyScalar(0.94 + (Math.abs(Math.sin(i * 12.9898)) * 0.08))
    cols[i * 3] = c.r
    cols[i * 3 + 1] = c.g
    cols[i * 3 + 2] = c.b
  }
  g.setAttribute('color', new Float32BufferAttribute(cols, 3))
  cut.hull.push(0, Y - 0.12, 0, 0)
  cut.hull.geo(g)
  cut.hull.pop()
  // A ridge roll on top.
  if (!ruined) cut.detail.beam(W >= D ? -W * 0.22 : 0, Y - 0.12 + rise * 0.98, W >= D ? 0 : -D * 0.22, W >= D ? W * 0.22 : 0, Y - 0.12 + rise * 0.98, W >= D ? 0 : D * 0.22, 0.24, '#c8963c', 0.16)
  void r
}

/** A chimney through the roof, from below the eaves to above the ridge; returns its top (local). */
const chimney = (cut: Kit, x: number, z: number, y0: number, y1: number, stone: string): [number, number, number] => {
  const w = 0.5
  cut.hull.box(x - w / 2, y0, z - w / 2, x + w / 2, y1, z + w / 2, { front: stone, side: shade(stone, 0.9), top: '#2a2224' }, 'b')
  // Brick courses and a cap.
  for (let yy = y0 + 0.3; yy < y1 - 0.2; yy += 0.36) cut.detail.box(x - w / 2 - 0.02, yy, z - w / 2 - 0.02, x + w / 2 + 0.02, yy + 0.06, z + w / 2 + 0.02, shade(stone, 0.8), 'b')
  cut.hull.box(x - w / 2 - 0.08, y1, z - w / 2 - 0.08, x + w / 2 + 0.08, y1 + 0.12, z + w / 2 + 0.08, { top: '#3a3034', side: shade(stone, 0.75) }, 'b')
  return [x, y1 + 0.15, z]
}

// ─── Signs ───────────────────────────────────────────────────────────────────

/** What a sign shows, drawn flat on its board (local: board face at z = 0, centre 0,0). */
const emblem = (d: Mesher, kind: string, cls?: ClassId): void => {
  switch (kind) {
    case 'smith':
      // An anvil.
      d.box(-0.17, -0.02, 0, 0.17, 0.06, 0.03, '#4a4a54', 'b')
      d.box(-0.08, -0.12, 0, 0.08, -0.02, 0.03, '#3a3a44', 'b')
      d.box(-0.13, -0.16, 0, 0.13, -0.12, 0.03, '#4a4a54', 'b')
      d.prism([[0.17, -0.02], [0.24, 0.04], [0.17, 0.06]], 0, 0.03, '#4a4a54')
      break
    case 'armor':
      // A helmet.
      d.ball(0, 0.0, 0.02, 0.13, '#b9c4d6', 7, 4, 0.9)
      d.box(-0.13, -0.1, 0.02, 0.13, -0.06, 0.05, '#8a8fa0', 'b')
      d.box(-0.02, -0.08, 0.06, 0.02, 0.06, 0.08, '#2a2a34', 'b')
      break
    case 'weapons':
      d.beam(-0.16, -0.16, 0.02, 0.16, 0.16, 0.02, 0.05, '#d8dde8', 0.02)
      d.beam(0.16, -0.16, 0.03, -0.16, 0.16, 0.03, 0.05, '#d8dde8', 0.02)
      d.box(-0.14, -0.11, 0.03, -0.05, -0.07, 0.06, '#d8b04a', 'b')
      d.box(0.05, -0.11, 0.03, 0.14, -0.07, 0.06, '#d8b04a', 'b')
      break
    case 'trinkets':
      d.ball(0, 0.02, 0.03, 0.1, '#5fd8ff', 6, 4)
      d.cyl(0, -0.16, 0.03, 0.12, 0.12, 0.03, 8, '#ffd24a', '#ffd24a')
      break
    case 'healer':
      // A potion with a green cross on it.
      d.ball(0, -0.04, 0.03, 0.12, '#7dff8a', 7, 4)
      d.box(-0.035, 0.07, 0.01, 0.035, 0.16, 0.05, '#e8f0f4', 'b')
      d.box(-0.05, -0.06, 0.13, 0.05, -0.02, 0.15, '#ffffff', 'b')
      d.box(-0.02, -0.09, 0.13, 0.02, 0.01, 0.15, '#ffffff', 'b')
      break
    case 'tavern':
      // A frothing mug.
      d.box(-0.11, -0.15, 0.01, 0.07, 0.07, 0.06, { front: '#c98a3a', side: '#a06a2a' }, 'b')
      d.ball(-0.02, 0.09, 0.04, 0.1, '#fff8e8', 6, 3, 0.6)
      d.box(0.07, -0.1, 0.02, 0.15, 0.02, 0.05, '#a06a2a', 'b')
      break
    case 'guard':
      d.prism([[-0.13, 0.12], [-0.13, -0.02], [0, -0.17], [0.13, -0.02], [0.13, 0.12]], 0, 0.04, '#3f5fd6', '#2a4aa8')
      d.box(-0.02, -0.12, 0.04, 0.02, 0.1, 0.06, '#ffd84a', 'b')
      break
    case 'black':
      d.ball(0, -0.04, 0.03, 0.12, '#7a5a3a', 6, 4)
      d.ball(0, 0.09, 0.03, 0.05, '#5a4028', 5, 3)
      d.ball(0.05, -0.05, 0.13, 0.035, '#ffd24a', 4, 3)
      break
    case 'class':
      classMark(d, cls ?? 'aegis', 1)
      break
  }
}

/** A class's mark, at scale `s`. */
const classMark = (d: Mesher, cls: ClassId, s: number): void => {
  const c = CLASSES[cls].color
  switch (cls) {
    case 'aegis':
      d.prism([[-0.13 * s, 0.13 * s], [-0.13 * s, 0], [0, -0.17 * s], [0.13 * s, 0], [0.13 * s, 0.13 * s]], 0, 0.04, '#3f5fd6', '#2a4aa8')
      d.box(-0.025 * s, -0.11 * s, 0.04, 0.025 * s, 0.1 * s, 0.06, c, 'b')
      d.box(-0.08 * s, 0.02 * s, 0.04, 0.08 * s, 0.06 * s, 0.06, c, 'b')
      break
    case 'pyro':
      d.prism([[0, 0.2 * s], [-0.11 * s, 0], [-0.08 * s, -0.12 * s], [0.08 * s, -0.12 * s], [0.12 * s, 0.02 * s]], 0, 0.04, c, shade(c, 0.8))
      d.prism([[0, 0.08 * s], [-0.05 * s, -0.02 * s], [-0.03 * s, -0.09 * s], [0.03 * s, -0.09 * s], [0.05 * s, -0.02 * s]], 0.04, 0.06, '#ffe07a')
      break
    case 'shadow':
      d.prism([[0, 0.2 * s], [-0.035 * s, 0], [0, -0.06 * s], [0.035 * s, 0]], 0, 0.04, '#e0e4ee', '#a0a4b4')
      d.box(-0.09 * s, -0.07 * s, 0.01, 0.09 * s, -0.04 * s, 0.05, c, 'b')
      d.box(-0.025 * s, -0.17 * s, 0.01, 0.025 * s, -0.07 * s, 0.05, '#4a3a5a', 'b')
      break
    case 'sovereign':
      d.box(-0.15 * s, -0.09 * s, 0, 0.15 * s, 0.02 * s, 0.04, { front: c, side: shade(c, 0.8), top: shade(c, 1.1) }, 'b')
      for (const px of [-0.12, 0, 0.12]) d.prism([[px * s - 0.045 * s, 0.02 * s], [px * s + 0.045 * s, 0.02 * s], [px * s, (px === 0 ? 0.16 : 0.12) * s]], 0, 0.04, c, shade(c, 0.8))
      d.ball(0, -0.035 * s, 0.05, 0.03 * s, '#ff4a6a', 4, 3)
      break
    case 'blood':
      d.ball(0, -0.04 * s, 0.02, 0.1 * s, c, 6, 4)
      d.prism([[0, 0.16 * s], [-0.07 * s, -0.01 * s], [0.07 * s, -0.01 * s]], 0, 0.04, c)
      break
    case 'aether':
      d.cyl(0, 0, 0, 0.12 * s, 0.12 * s, 0.04, 8, c, c)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        d.box(Math.sin(a) * 0.15 * s - 0.025, Math.cos(a) * 0.15 * s - 0.025, 0, Math.sin(a) * 0.15 * s + 0.025, Math.cos(a) * 0.15 * s + 0.025, 0.04, c, 'b')
      }
      break
    case 'geo':
      d.prism([[-0.15 * s, -0.12 * s], [0.15 * s, -0.12 * s], [0.08 * s, 0.06 * s], [0, 0.16 * s], [-0.08 * s, 0.04 * s]], 0, 0.04, c, shade(c, 0.75))
      break
    case 'chrono':
      d.prism([[-0.1 * s, 0.15 * s], [0, 0], [0.1 * s, 0.15 * s]], 0, 0.04, c)
      d.prism([[0, 0], [-0.1 * s, -0.15 * s], [0.1 * s, -0.15 * s]], 0, 0.04, c)
      break
  }
}

/** A sign on a bracket out from the wall, hanging beside the door (local face frame). */
const hangingSign = (k: Kit, x: number, y: number, kind: string, p: Pal, cls?: ClassId): void => {
  const d = k.detail
  d.beam(x, y, 0, x, y, 0.7, 0.07, '#3a3034', 0.07)
  d.beam(x, y + 0.35, 0, x, y + 0.02, 0.45, 0.04, '#3a3034', 0.04)
  for (const zz of [0.18, 0.56]) d.beam(x, y - 0.03, zz, x, y - 0.12, zz, 0.02, '#3a3034', 0.02)
  // The board turns its face to the camera: a sign across the street, not along it.
  d.push(x, y - 0.38, 0.37, 0)
  d.box(-0.3, -0.25, -0.04, 0.3, 0.25, 0.0, { front: shade(p.timber, 1.3), side: p.timber, top: p.timber }, 'b')
  d.box(-0.26, -0.21, 0.0, 0.26, 0.21, 0.015, '#f4e2b8', 'b')
  d.push(0, 0, 0.015, 0)
  emblem(d, kind, cls)
  d.pop()
  d.pop()
}

/** A school's banner hanging under its gable (local face frame, centre x, top y). */
const banner = (k: Kit, x: number, y: number, cls: ClassId, h = 1.1): void => {
  const d = k.detail
  const c = CLASSES[cls].color
  const cloth = cls === 'aegis' ? '#3f5fd6' : cls === 'pyro' ? '#a82a2a' : cls === 'shadow' ? '#2f2a44' : cls === 'sovereign' ? '#8a2a3a' : cls === 'blood' ? '#f0ece4' : cls === 'aether' ? '#2a4a6a' : cls === 'geo' ? '#6a5a3a' : '#2a4a9a'
  d.beam(x - 0.42, y + 0.03, 0.08, x + 0.42, y + 0.03, 0.08, 0.06, '#5a4030', 0.06)
  for (const s of [-1, 1]) d.ball(x + s * 0.45, y + 0.03, 0.08, 0.05, '#d8b04a', 4, 3)
  // The cloth, with a swallowtail.
  d.prism([[x - 0.34, y], [x - 0.34, y - h], [x, y - h + 0.18], [x + 0.34, y - h], [x + 0.34, y]], 0.05, 0.08, cloth, shade(cloth, 0.8))
  d.box(x - 0.34, y - 0.1, 0.08, x + 0.34, y - 0.04, 0.095, c, 'b')
  d.push(x, y - h * 0.45, 0.085, 0, 1.25)
  classMark(d, cls, 1)
  d.pop()
}

/** A lantern on a bracket; returns where its light is (local). */
const lantern = (k: Kit, x: number, y: number): [number, number, number] => {
  const d = k.detail
  d.beam(x, y + 0.1, 0, x, y + 0.1, 0.28, 0.05, '#2e2a30', 0.05)
  cage(k, x - 0.1, y - 0.24, 0.2, x + 0.1, y + 0.02, 0.4, '#2e2a30', '#ffd27a')
  d.prism([[x - 0.12, y + 0.02], [x + 0.12, y + 0.02], [x, y + 0.14]], 0.18, 0.4, '#2e2a30')
  return [x, y - 0.1, 0.3]
}

/** A cloth awning over a shop front (local face frame). */
const awning = (k: Kit, x0: number, x1: number, y: number, c1: string, c2: string): void => {
  const d = k.detail
  const out = 0.85
  const drop = 0.38
  const n = Math.max(3, Math.round((x1 - x0) / 0.32))
  for (let i = 0; i < n; i++) {
    const a = x0 + ((x1 - x0) * i) / n
    const b = x0 + ((x1 - x0) * (i + 1)) / n
    const c = i % 2 ? c1 : c2
    d.quad(a, y - drop, out, b, y - drop, out, b, y, 0.02, a, y, 0.02, c)
    // A scalloped hem.
    d.tri(a, y - drop, out, a + (b - a) / 2, y - drop - 0.13, out, b, y - drop, out, shade(c, 0.85))
    d.tri(b, y - drop, out, a + (b - a) / 2, y - drop - 0.13, out, a, y - drop, out, shade(c, 0.85))
  }
  for (const xx of [x0 + 0.05, x1 - 0.05]) d.beam(xx, y - 0.6, 0.02, xx, y - drop, out - 0.05, 0.05, '#3a3034', 0.05)
}

// ─── The house ───────────────────────────────────────────────────────────────

/**
 * Build one house into `base` (and, for a house that is walked into, into its
 * own `cut` kit). The house's local frame: its centre at the origin, its front
 * toward +Z, the ground at y 0.
 */
export const buildHouse = (base: Kit, h: TownHouse, c: HouseCtx): HouseOut => {
  const r = seeded(h.seed)
  const p = palette(c.style, r, h.kind)
  if (c.ruined) {
    // Soot and weather: every colour greyer and darker.
    for (const key of ['wall', 'upper', 'inner', 'base', 'roof', 'roof2', 'door', 'shutter'] as const) p[key] = '#' + shade(p[key], 0.62).lerp(lc('#5a5450'), 0.35).getHexString()
    p.timber = '#2e2622'
  }
  const W = h.cw * CELL - WALL_IN * 2
  const D = h.cd * CELL - WALL_IN * 2
  const stone = c.style === 'mountain'
  const enterable = h.inside
  const cut = enterable ? newKit() : base
  const outer = newKit()
  const front = enterable ? cut : base
  const out: HouseOut = { cut: enterable ? cut : null, chimneys: [], lamps: [], forge: null, top: 0 }
  const twoStorey = h.storeys === 2 && !(c.ruined && r() < 0.4)
  const F = h.kind === 'hall' || h.kind === 'chapel' ? 2.6 : h.kind === 'tavern' ? 2.45 : 2.3
  const U = twoStorey ? (h.kind === 'hall' ? 2.0 : 1.8) : 0
  const jut = twoStorey && !stone ? 0.16 : 0
  const doorX = (h.doorI + 0.5) * CELL - (h.i0 * CELL + (h.cw * CELL) / 2)
  const workshop = h.kind === 'workshop'
  const doorW = h.kind === 'hall' || h.kind === 'chapel' || h.kind === 'tavern' ? 1.15 : 0.92
  const doorH = h.kind === 'hall' || h.kind === 'chapel' ? 1.9 : 1.72
  const lit = (): boolean => !c.ruined && r() < 0.62
  // Wall heights of a ruin: broken off, unevenly.
  const brokenTop = (f: number): number => (c.ruined ? f * (0.5 + r() * 0.5) : f)

  under(base, c.x, c.y, c.z, 0, () => {
    under(outer, c.x, c.y, c.z, 0, () => {
      if (enterable) under(cut, c.x, c.y, c.z, 0, () => body())
      else body()
    })
  })
  // The outer pieces (base course, steps) always stand.
  base.hull.append(outer.hull)
  base.detail.append(outer.detail)
  base.glow.append(outer.glow)
  return out

  function body(): void {
    const B = base
    const wallC = stone ? p.wall : p.wall
    const fl = c.ruined ? brokenTop : (v: number): number => v
    // ── The base course: a plinth of stone all round ──
    const pc = { top: shade(p.base, 1.1), side: p.base, front: p.base }
    if (!enterable) outer.hull.box(-W / 2 - 0.05, 0, -D / 2 - 0.05, W / 2 + 0.05, BASE_H, D / 2 + 0.05, pc, 'b', shade(p.base, 0.8))
    else {
      // A room is at ground level: the plinth is a skirt round the outside of its walls.
      const sk = 0.07
      outer.hull.box(-W / 2 - sk, 0, -D / 2 - sk, -W / 2 + 0.02, BASE_H, D / 2 + sk, pc, 'b', shade(p.base, 0.8))
      outer.hull.box(W / 2 - 0.02, 0, -D / 2 - sk, W / 2 + sk, BASE_H, D / 2 + sk, pc, 'b', shade(p.base, 0.8))
      outer.hull.box(-W / 2 + 0.02, 0, -D / 2 - sk, W / 2 - 0.02, BASE_H, -D / 2 + 0.02, pc, 'b', shade(p.base, 0.8))
      const dl = doorX - doorW / 2 - 0.12
      const dr = doorX + doorW / 2 + 0.12
      outer.hull.box(-W / 2 + 0.02, 0, D / 2 - 0.02, dl, BASE_H, D / 2 + sk, pc, 'b', shade(p.base, 0.8))
      outer.hull.box(dr, 0, D / 2 - 0.02, W / 2 - 0.02, BASE_H, D / 2 + sk, pc, 'b', shade(p.base, 0.8))
    }
    // ── Ground-storey walls: west, east, north stay; the front goes with the cut ──
    const inner = enterable ? p.inner : wallC
    const westTop = fl(F)
    const eastTop = fl(F)
    const northTop = fl(F)
    const wy = enterable ? 0 : BASE_H - 0.01
    B.hull.box(-W / 2, wy, -D / 2, -W / 2 + T, westTop, D / 2, { west: wallC, east: inner, top: p.timber, front: wallC, back: wallC }, 'b')
    B.hull.box(W / 2 - T, wy, -D / 2, W / 2, eastTop, D / 2, { east: wallC, west: inner, top: p.timber, front: wallC, back: wallC }, 'b')
    B.hull.box(-W / 2 + T, wy, -D / 2, W / 2 - T, northTop, -D / 2 + T, { back: wallC, front: inner, top: p.timber }, 'b')
    // ── The front wall, around the door (and the forge's mouth) ──
    const fz = D / 2
    const openW = workshop ? Math.min(W - 1.2, 2.6) : doorW
    const openH = workshop ? 1.9 : doorH
    const ox = workshop ? 0 : doorX
    const fTop = c.ruined ? fl(F) : F
    const F0 = wy
    const fc = { front: wallC, back: inner, top: p.timber, side: wallC }
    front.hull.box(-W / 2 + T, F0, fz - T, ox - openW / 2, fTop, fz, fc, 'b')
    front.hull.box(ox + openW / 2, F0, fz - T, W / 2 - T, fTop, fz, fc, 'b')
    front.hull.box(ox - openW / 2, openH, fz - T, ox + openW / 2, fTop, fz, fc, 'b')
    if (!enterable && !workshop) {
      // A closed house's doorway is dark behind its door.
      B.detail.quad(ox - openW / 2, F0, fz - T, ox + openW / 2, F0, fz - T, ox + openW / 2, openH, fz - T, ox - openW / 2, openH, fz - T, '#2a2026')
    }
    // ── What is on the faces ──
    const winY = 0.95
    const winH = 0.7
    const winW = 0.62
    const facade = (k: Kit, f: Face, top: number, len: number, avoid: Array<[number, number]>, y0: number, upper: boolean): Array<[number, number]> => {
      const gaps: Array<[number, number]> = [...avoid]
      const n = Math.max(0, Math.floor((len - 0.6) / 1.45))
      const ww = upper ? 0.56 : winW
      const wh = upper ? 0.6 : winH
      const wy = upper ? y0 + 0.5 : winY
      const xs: number[] = []
      for (let i = 0; i < n; i++) {
        const x = -len / 2 + ((i + 0.5) / n) * len
        if (avoid.some(([a, b]) => x + ww / 2 + 0.35 > a && x - ww / 2 - 0.35 < b)) continue
        xs.push(x)
      }
      onFace(k, W, D, f, 0, () => {
        for (const x of xs) {
          windowOn(k, x, wy, ww, wh, p, lit(), { shutters: !stone && !c.low && r() < 0.65, box: !upper && f === 's' && !c.ruined && !c.low && c.style !== 'mountain' ? r() < 0.75 : !upper && f !== 'n' && !c.ruined && !c.low && r() < 0.25, boarded: c.ruined && r() < 0.7, stone })
          gaps.push([x - ww / 2 - 0.08, x + ww / 2 + 0.08])
        }
        if (stone) masonry(k, len, y0, top, wallC, r)
        else framing(k, len, y0, top, p, gaps, r, c.ruined)
      })
      return gaps
    }
    const doorGap: Array<[number, number]> = [[ox - openW / 2 - 0.12, ox + openW / 2 + 0.12]]
    facade(front, 's', fTop, W, doorGap, BASE_H, false)
    facade(B, 'e', eastTop, D, [], BASE_H, false)
    facade(B, 'w', westTop, D, [], BASE_H, false)
    // The door, and a step up to it.
    if (!workshop) {
      onFace(front, W, D, 's', wy, () => doorOn(front, ox, openW, openH - wy, p, { open: enterable, double: h.kind === 'hall' || h.kind === 'chapel', stone, boarded: c.ruined && !enterable && r() < 0.6, transom: !c.ruined && (h.kind === 'tavern' || h.kind === 'hall') }))
      if (!enterable) {
        outer.hull.box(ox - openW / 2 - 0.15, 0, fz, ox + openW / 2 + 0.15, BASE_H * 0.5, fz + 0.32, { top: shade(p.base, 1.15), side: p.base }, 'b')
        outer.hull.box(ox - openW / 2 - 0.08, 0, fz, ox + openW / 2 + 0.08, BASE_H, fz + 0.16, { top: shade(p.base, 1.2), side: shade(p.base, 1.05) }, 'b')
      } else {
        // A worn flagstone at the threshold, flush with the ground.
        outer.detail.box(ox - openW / 2 - 0.12, 0, fz - 0.02, ox + openW / 2 + 0.12, 0.035, fz + 0.36, { top: shade(p.base, 1.15), side: p.base }, 'b')
      }
      if (enterable) {
        // The threshold carries the floor out into the doorway.
        B.detail.box(ox - openW / 2, 0, fz - T - 0.02, ox + openW / 2, ROOM_Y, fz + 0.01, p.floor, 'b')
      }
    } else {
      out.forge = forgeMouth(B, front, W, D, openW, openH, p, c, r)
    }
    // ── The upper storey ──
    let Y = F
    if (twoStorey) {
      const uw = W + jut * 2
      const ud = D + jut * 2
      const Y1 = F + U
      // The floor joists show under the jetty.
      if (jut > 0 && !c.low) for (let x = -uw / 2 + 0.2; x < uw / 2; x += 0.42) cut.detail.box(x - 0.06, F - 0.1, D / 2 - 0.2, x + 0.06, F, ud / 2 + 0.03, p.timber, '')
      const uc = { front: p.upper, back: p.upper, east: p.upper, west: p.upper, top: p.timber }
      cut.hull.box(-uw / 2, F, -ud / 2, uw / 2, Y1, ud / 2, uc, 'b')
      // Windows and framing on the upper faces.
      const uf = (f: Face, len: number): void => {
        const n = Math.max(1, Math.floor((len - 0.5) / 1.35))
        const gaps: Array<[number, number]> = []
        onFace(cut, uw, ud, f, 0, () => {
          for (let i = 0; i < n; i++) {
            const x = -len / 2 + ((i + 0.5) / n) * len
            windowOn(cut, x, F + 0.6, 0.55, 0.62, p, lit(), { shutters: !stone && !c.low && r() < 0.5, box: f === 's' && !c.low && !c.ruined && c.style !== 'mountain' && r() < 0.5, boarded: c.ruined && r() < 0.6, stone })
            gaps.push([x - 0.36, x + 0.36])
          }
          if (stone) masonry(cut, len, F, Y1, p.upper, r)
          else framing(cut, len, F, Y1, p, gaps, r, c.ruined)
        })
      }
      uf('s', uw)
      uf('e', ud)
      uf('w', ud)
      Y = Y1
    }
    out.top = Y
    // ── The roof ──
    const roofKind: Roof = pickRoof(h, c.style, r)
    const rows = c.low ? 4 : 6
    const pitch = c.style === 'mountain' ? 0.95 : c.style === 'mercantile' ? 0.8 : 0.72
    if (roofKind === 'thatch') {
      const rise = Math.min(W, D) * 0.5 * pitch + 0.6
      thatchRoof(cut, W + jut * 2, D + jut * 2, Y, rise, c.ruined, r)
      out.top = Y + rise
    } else if (roofKind === 'hip') {
      const rise = D * 0.5 * pitch
      hipRoof(cut, W + jut * 2, D + jut * 2, Y, rise, p, 0.4, rows)
      out.top = Y + rise
    } else {
      const along = roofKind === 'gable'
      const L = (along ? W : D) + jut * 2
      const span = (along ? D : W) + jut * 2
      const rise = span * 0.5 * pitch
      cut.hull.push(0, 0, 0, along ? 0 : Math.PI / 2)
      cut.detail.push(0, 0, 0, along ? 0 : Math.PI / 2)
      cut.glow.push(0, 0, 0, along ? 0 : Math.PI / 2)
      gableRoof(cut, cut, L, span, Y, rise, p, { eave: 0.42, gableOver: 0.3, rows, ruined: c.ruined, r, slate: c.style === 'mountain' })
      // The gable-end walls.
      for (const s of [1, -1]) {
        cut.hull.push(s * (L / 2 - 0.01), 0, 0, Math.PI / 2)
        if (s > 0) gableEnd(cut.hull, span / 2, Y, rise, 0, along ? p.upper : p.upper, false)
        else gableEnd(cut.hull, span / 2, Y, rise, 0, p.upper, true)
        cut.hull.pop()
      }
      cut.hull.pop()
      cut.detail.pop()
      cut.glow.pop()
      out.top = Y + rise
      // A gable that faces the camera is a house's face: timber, a window, the trade.
      if (!along) {
        onFace(cut, W + jut * 2, D + jut * 2, 's', 0, () => {
          const d = cut.detail
          const tc = c.ruined ? '#2e2622' : p.timber
          d.beam(0, Y, 0.02, 0, Y + rise - 0.1, 0.02, 0.13, tc, 0.05)
          d.beam(-span * 0.32, Y + rise * 0.32, 0.025, span * 0.32, Y + rise * 0.32, 0.025, 0.12, tc, 0.05)
          if (h.cls && (h.kind === 'hall')) banner(cut, 0, Y + rise * 0.24, h.cls, Math.min(1.25, rise * 0.75))
          else if (h.kind === 'chapel') {
            // A round window.
            rose(cut, 0, Y + rise * 0.48, Math.min(0.42, rise * 0.25), !c.ruined)
          } else windowOn(cut, 0, Y + rise * 0.42, 0.42, 0.42, p, lit(), { stone })
        })
      }
    }
    // A bell cote on a chapel; a dormer on a long roof.
    if (h.kind === 'chapel' && !c.ruined) belfry(cut, D, out.top, p, stone)
    if (roofKind === 'gable' && W > 4.2 && !c.low && r() < 0.6) dormer(cut, (r() - 0.5) * (W - 2.4), D, Y, D * 0.5 * pitch, p, lit())
    // ── Chimneys ──
    if (!c.ruined || r() < 0.4) {
      const n = h.kind === 'tavern' || workshop || h.kind === 'hall' ? 2 : 1
      for (let i = 0; i < n; i++) {
        const cx = (i === 0 ? -1 : 1) * (W / 2 - 0.55) * (0.6 + r() * 0.4)
        const cz = -D * 0.18
        const top = chimney(cut, cx, cz, Y - 0.5, out.top + 0.5 + (workshop ? 0.4 : 0), stone ? '#8a8690' : '#a8786a')
        if (!c.ruined) out.chimneys.push([c.x + top[0], c.y + top[1], c.z + top[2]])
      }
    }
    // ── The trade, told at the door ──
    onFace(front, W, D, 's', 0, () => {
      const sx = workshop ? -W / 2 + 0.55 : doorX + (doorX > 0 ? -1 : 1) * (openW / 2 + 0.55)
      if (h.sign && h.sign !== 'class' && !(c.ruined && r() < 0.5)) hangingSign(front, sx, F - 0.15, h.sign, p, h.cls)
      if (h.sign === 'class' && h.cls && (twoStorey ? false : true)) hangingSign(front, sx, F - 0.15, 'class', p, h.cls)
      if (!c.ruined && (h.kind !== 'cottage' || r() < 0.5)) {
        const lx = workshop ? W / 2 - 0.45 : doorX + (doorX > 0 ? 1 : -1) * (openW / 2 + 0.38)
        const l = lantern(front, lx, F - 0.55)
        out.lamps.push([c.x + l[0], c.y + l[1], c.z + D / 2 + l[2]])
      }
      if ((h.sign === 'weapons' || h.sign === 'trinkets' || h.sign === 'armor' || h.kind === 'tavern') && !c.ruined && !c.low) {
        const cs = h.kind === 'tavern' ? ['#c9483a', '#f4ead2'] : r() < 0.5 ? ['#3f7fd6', '#f4ead2'] : ['#5aa84a', '#f4ead2']
        awning(front, doorX - openW / 2 - 0.9, doorX + openW / 2 + 0.9, F - 0.08, cs[0]!, cs[1]!)
      }
    })
    // ── The room inside ──
    if (enterable) room(B, h, W, D, doorX, c, p, r)
    // A ruin: rubble at its feet.
    if (c.ruined) {
      for (let i = 0; i < 4; i++) {
        const rx = (r() - 0.5) * W
        const rz = D / 2 + 0.2 + r() * 0.3
        B.hull.push(rx, 0.05, rz, r() * 6)
        B.hull.geo(paintRock(0.2 + r() * 0.25, Math.floor(r() * 99), r() < 0.5 ? '#6a645e' : '#4a4442'))
        B.hull.pop()
      }
      B.detail.beam(-W * 0.3, 0.1, D / 2 + 0.35, W * 0.1, 0.25, D / 2 + 0.55, 0.14, '#2a2220', 0.14)
    }
  }
}

const paintRock = (rr: number, seed: number, hex: string): ReturnType<typeof rock> => {
  const g = rock(rr, seed, 7, 5)
  const c = lc(hex)
  const n = g.attributes.position!.count
  const a = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b }
  g.setAttribute('color', new Float32BufferAttribute(a, 3))
  return g
}

const pickRoof = (h: TownHouse, style: TownStyle, r: () => number): Roof => {
  const v = r()
  if (h.kind === 'chapel') return 'front'
  if (h.kind === 'hall') return style === 'mercantile' && !h.cls ? 'hip' : 'front'
  if (style === 'rural') return h.kind === 'cottage' ? (v < 0.75 ? 'thatch' : 'gable') : h.kind === 'tavern' ? 'gable' : v < 0.5 ? 'gable' : 'front'
  if (style === 'mercantile') return h.kind === 'townhouse' ? (v < 0.6 ? 'front' : 'gable') : h.kind === 'tavern' ? 'hip' : 'gable'
  return h.kind === 'cottage' ? (v < 0.5 ? 'front' : 'gable') : v < 0.3 ? 'hip' : 'gable'
}

/** A round window (a chapel's rose). */
const rose = (k: Kit, x: number, y: number, rad: number, lit: boolean): void => {
  const n = 10
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2
    const a1 = ((i + 1) / n) * Math.PI * 2
    const col = lit ? (i % 2 ? '#ffd27a' : '#ff9a7a') : '#3a3a48'
    ;(lit ? k.glow : k.detail).tri(x, y, 0.03, x + Math.cos(a0) * rad, y + Math.sin(a0) * rad, 0.03, x + Math.cos(a1) * rad, y + Math.sin(a1) * rad, 0.03, col)
    k.detail.beam(x + Math.cos(a0) * rad, y + Math.sin(a0) * rad, 0.04, x + Math.cos(a1) * rad, y + Math.sin(a1) * rad, 0.04, 0.07, '#d8d0c0', 0.05)
  }
  k.detail.beam(x - rad, y, 0.05, x + rad, y, 0.05, 0.04, '#d8d0c0', 0.03)
  k.detail.beam(x, y - rad, 0.05, x, y + rad, 0.05, 0.04, '#d8d0c0', 0.03)
}

/** A bell cote over a chapel's front gable. */
const belfry = (k: Kit, D: number, top: number, p: Pal, stone: boolean): void => {
  const z = D / 2 - 0.3
  const c = stone ? '#a8a4a0' : '#f2ead8'
  k.hull.box(-0.38, top - 0.4, z - 0.38, 0.38, top + 0.75, z + 0.38, { front: c, side: shade(c, 0.9), top: c }, 'b')
  k.detail.box(-0.22, top + 0.1, z + 0.38, 0.22, top + 0.62, z + 0.4, '#2a2228', 'b')
  k.detail.ball(0, top + 0.28, z + 0.36, 0.13, '#e8b84a', 6, 4)
  k.hull.push(0, top + 0.75, z, Math.PI / 4)
  k.hull.cyl(0, 0, 0, 0.62, 0.02, 0.85, 4, p.roof)
  k.hull.pop()
  k.detail.ball(0, top + 1.66, z, 0.07, '#ffd84a', 5, 3)
}

/** A dormer window on the front slope of a gable roof. */
const dormer = (k: Kit, x: number, D: number, Y: number, rise: number, p: Pal, lit: boolean): void => {
  const z = D / 2 - 0.55
  const ang = Math.atan2(rise, D / 2)
  const y0 = Y + (D / 2 - z) * Math.tan(ang) * 0 + 0.1
  const w = 0.95
  const hgt = 0.9
  k.hull.box(x - w / 2, y0, z - 0.9, x + w / 2, y0 + hgt, z, { front: p.upper, side: p.upper, top: p.timber }, 'b')
  k.hull.prism([[x - w / 2 - 0.15, y0 + hgt], [x + w / 2 + 0.15, y0 + hgt], [x, y0 + hgt + 0.55]], z - 1.0, z + 0.15, p.roof, shade(p.roof, 0.9))
  under(k, 0, 0, z, 0, () => windowOn(k, x, y0 + 0.2, 0.46, 0.5, p, lit, {}))
}

/** The open front of a forge: a recess with the hearth glowing in it. Returns the coals (local). */
const forgeMouth = (B: Kit, front: Kit, W: number, D: number, ow: number, oh: number, p: Pal, c: HouseCtx, r: () => number): [number, number, number] => {
  const z = D / 2
  const depth = Math.min(D - 0.6, 1.3)
  const zb = z - depth
  // The recess: floor, back wall, sides, ceiling.
  B.detail.box(-ow / 2, BASE_H - 0.02, zb, ow / 2, BASE_H, z, '#5a4a40', 'b')
  B.detail.quad(-ow / 2, BASE_H, zb, ow / 2, BASE_H, zb, ow / 2, oh, zb, -ow / 2, oh, zb, '#3a2e2c')
  B.detail.quad(-ow / 2, BASE_H, z, -ow / 2, BASE_H, zb, -ow / 2, oh, zb, -ow / 2, oh, z, '#4a3a34')
  B.detail.quad(ow / 2, BASE_H, zb, ow / 2, BASE_H, z, ow / 2, oh, z, ow / 2, oh, zb, '#4a3a34')
  B.detail.quad(-ow / 2, oh, zb, ow / 2, oh, zb, ow / 2, oh, z, -ow / 2, oh, z, '#2e2426')
  // Posts and a heavy lintel at the mouth.
  for (const s of [-1, 1]) front.detail.box(s * ow / 2 - 0.12, 0, z - 0.02, s * ow / 2 + 0.12, oh + 0.05, z + 0.12, p.timber, 'b')
  front.detail.box(-ow / 2 - 0.25, oh, z - 0.02, ow / 2 + 0.25, oh + 0.24, z + 0.14, shade(p.timber, 1.1), 'b')
  // The hearth: a stone block with glowing coals and a hood over it.
  const hx = -ow * 0.2
  B.hull.box(hx - 0.45, BASE_H, zb, hx + 0.45, BASE_H + 0.7, zb + 0.75, { front: '#7a7076', side: '#6a6066', top: '#4a4044' }, 'b')
  B.glow.box(hx - 0.33, BASE_H + 0.7, zb + 0.12, hx + 0.33, BASE_H + 0.76, zb + 0.62, '#ff8a2a', 'b')
  for (let i = 0; i < 5; i++) B.glow.ball(hx - 0.25 + i * 0.12, BASE_H + 0.78, zb + 0.25 + (i % 2) * 0.2, 0.07, i % 2 ? '#ffd24a' : '#ff6a1a', 4, 3)
  B.hull.prism([[hx - 0.5, oh - 0.05], [hx + 0.5, oh - 0.05], [hx + 0.2, oh - 0.65], [hx - 0.2, oh - 0.65]].reverse() as Array<[number, number]>, zb, zb + 0.7, '#5a5258')
  // Bellows and a rack of tongs and hammers on the back wall.
  const bx = ow * 0.22
  B.detail.box(bx - 0.25, BASE_H + 0.3, zb + 0.15, bx + 0.25, BASE_H + 0.5, zb + 0.6, { top: '#8a5a3a', side: '#6a4428' }, 'b')
  B.detail.beam(bx - 0.3, BASE_H + 1.2, zb + 0.05, bx + 0.3, BASE_H + 1.2, zb + 0.05, 0.06, '#4a3a30', 0.06)
  for (let i = 0; i < 4; i++) B.detail.beam(bx - 0.22 + i * 0.15, BASE_H + 1.18, zb + 0.08, bx - 0.22 + i * 0.15, BASE_H + 0.7, zb + 0.1, 0.04, '#55585f', 0.03)
  // Sacks of coal.
  B.detail.ball(ow / 2 - 0.3, BASE_H + 0.2, z - 0.35, 0.22, '#3a3434', 6, 4, 0.9)
  void c
  void r
  return [c.x + hx, c.y + BASE_H + 0.9, c.z + zb + 0.4]
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

/** The inside of a house that is walked into: a floor, a rug, the trade's furniture. */
const room = (B: Kit, h: TownHouse, W: number, D: number, doorX: number, c: HouseCtx, p: Pal, r: () => number): void => {
  const d = B.detail
  const x0 = -W / 2 + T
  const x1 = W / 2 - T
  const z0 = -D / 2 + T
  const z1 = D / 2 - T
  const fy = ROOM_Y
  // Floorboards, a shade apart.
  const n = Math.max(4, Math.round((x1 - x0) / 0.3))
  for (let i = 0; i < n; i++) {
    const a = x0 + ((x1 - x0) * i) / n
    const b = x0 + ((x1 - x0) * (i + 1)) / n
    d.quad(a, fy, z1, b, fy, z1, b, fy, z0, a, fy, z0, shade(p.floor, i % 2 ? 0.92 : 1.02 + (r() - 0.5) * 0.06))
  }
  // A rug from the door in.
  const rugC = c.job === 'noble' ? '#a82a3a' : c.job === 'healer' ? '#5aa86a' : c.job === 'rogue' ? '#3a3458' : c.job === 'scholar' ? '#c9482a' : c.job === 'tinker' ? '#2a6a7a' : '#8a4a6a'
  // A runner from the door into the room, with a border.
  const rw = Math.min(0.75, W * 0.16)
  const rz0 = z0 + Math.max(0.6, (z1 - z0) * 0.35)
  d.box(doorX - rw, fy, rz0, doorX + rw, fy + 0.02, z1 - 0.1, { top: rugC }, 'b')
  d.box(doorX - rw + 0.1, fy + 0.02, rz0 + 0.1, doorX + rw - 0.1, fy + 0.025, z1 - 0.2, { top: shade(rugC, 1.25) }, 'b')
  d.box(doorX - 0.1, fy + 0.025, rz0 + 0.3, doorX + 0.1, fy + 0.03, z1 - 0.4, { top: shade(rugC, 0.8) }, 'b')
  // Skirting and a beam along the inside of the walls.
  d.box(x0, fy, z0, x1, fy + 0.12, z0 + 0.03, '#6a4a34', 'b')
  d.box(x0, 1.9, z0, x1, 2.02, z0 + 0.06, p.timber, 'b')
  // The work place: by the west or the east wall (the same side the plan put them).
  const west = h.doorI >= h.i0 + h.cw / 2
  const wx = west ? x0 : x1
  const s = west ? 1 : -1
  const wz = (h.j0 + h.cd - 1.5) * CELL - (h.j0 * CELL + (h.cd * CELL) / 2)
  furnish(B, c.job ?? 'villager', wx, s, wz, fy, c, r)
  // Along the back wall: shelves of the trade, and a hearth or a bench.
  shelves(B, x0 + (west ? 1.6 : 0.4), z0, fy, Math.min(1.5, (x1 - x0) * 0.4), c.job ?? 'villager', r)
  const hx = west ? x1 - 0.7 : x0 + 0.7
  if (c.job === 'noble') throne(B, (x0 + x1) / 2, z0, fy)
  else hearth(B, hx, z0, fy, !c.ruined)
  // A chair in the back corner (the plan's seat).
  const cx = west ? x1 - 0.5 : x0 + 0.5
  chair(d, cx - (west ? 0.1 : -0.1), fy, z0 + 0.95, west ? -2.4 : 2.4)
  // A candle or two.
  if (!c.ruined) for (const s2 of [-1, 1]) {
    d.cyl(s2 * W * 0.28, fy + 1.0, z0 + 0.05, 0.03, 0.03, 0.12, 5, '#3a3034')
    B.glow.ball(s2 * W * 0.28, fy + 1.2, z0 + 0.08, 0.05, '#ffd27a', 4, 3)
  }
}

const chair = (d: Mesher, x: number, y: number, z: number, rot: number): void => {
  d.push(x, y, z, rot)
  d.box(-0.22, 0.2, -0.2, 0.22, 0.26, 0.2, { top: '#a06a3a', side: '#7a4e2c' }, 'b')
  for (const [a, b] of [[-0.18, -0.16], [0.18, -0.16], [-0.18, 0.16], [0.18, 0.16]] as const) d.box(a - 0.03, 0, b - 0.03, a + 0.03, 0.2, b + 0.03, '#6a4428', 'b')
  d.box(-0.22, 0.26, -0.22, 0.22, 0.75, -0.16, { front: '#a06a3a', side: '#7a4e2c', top: '#8a5a34' }, 'b')
  d.pop()
}

/** The trade's own furniture at the work place, against wall `wx`, facing the room by `s`. */
const furnish = (B: Kit, job: TownJob, wx: number, s: number, wz: number, fy: number, c: HouseCtx, r: () => number): void => {
  const d = B.detail
  const g = B.glow
  const fx = wx + s * 0.3
  switch (job) {
    case 'scholar': {
      // A lectern with a tome, and a brazier of fire beside it.
      d.box(fx - 0.18, fy, wz - 0.18, fx + 0.18, fy + 0.85, wz + 0.18, { top: '#6a4428', side: '#7a4e2c' }, 'b')
      d.push(fx, fy + 0.95, wz, s > 0 ? -Math.PI / 2 : Math.PI / 2)
      d.box(-0.3, -0.06, -0.22, 0.3, 0.02, 0.22, { top: '#5a3a24', side: '#5a3a24' }, 'b')
      d.box(-0.26, 0.02, -0.18, -0.01, 0.06, 0.18, '#f4ead2', 'b')
      d.box(0.01, 0.02, -0.18, 0.26, 0.06, 0.18, '#f4ead2', 'b')
      d.pop()
      g.ball(fx + s * 0.1, fy + 1.04, wz, 0.04, '#ff9a3a', 4, 3)
      const bz = wz - 0.85
      d.cyl(fx, fy, bz, 0.12, 0.2, 0.6, 6, '#4a4044')
      d.cyl(fx, fy + 0.6, bz, 0.26, 0.3, 0.12, 8, '#5a5054')
      g.ball(fx, fy + 0.8, bz, 0.2, '#ff7a2a', 6, 4, 1.3)
      g.ball(fx, fy + 0.95, bz, 0.12, '#ffd24a', 5, 3, 1.4)
      break
    }
    case 'healer':
    case 'alchemist': {
      // A bench with a bubbling pot and bottles.
      d.box(wx, fy + 0.72, wz - 0.55, wx + s * 0.62, fy + 0.8, wz + 0.55, { top: '#8a5a34', side: '#6a4428' }, 'b')
      for (const zz of [-0.48, 0.48]) d.box(wx + s * 0.04, fy, wz + zz - 0.04, wx + s * 0.58, fy + 0.72, wz + zz + 0.04, '#6a4428', 'b')
      d.cyl(fx, fy + 0.8, wz, 0.2, 0.24, 0.26, 8, '#3a3438')
      g.cyl(fx, fy + 1.05, wz, 0.19, 0.19, 0.02, 8, job === 'healer' ? '#7dff8a' : '#ff4a6a', job === 'healer' ? '#7dff8a' : '#ff4a6a')
      const cols = job === 'healer' ? ['#7dff8a', '#5fd8ff', '#ffd84a'] : ['#ff4a6a', '#b06aff', '#ffd84a']
      for (let i = 0; i < 4; i++) {
        const z = wz - 0.42 + i * 0.13 + (i > 1 ? 0.5 : 0)
        g.ball(fx + s * 0.05, fy + 0.9, z, 0.06, cols[i % 3]!, 5, 3)
        d.cyl(fx + s * 0.05, fy + 0.95, z, 0.018, 0.018, 0.06, 4, '#e8f0f4')
      }
      break
    }
    case 'merchant':
    case 'smith': {
      // A counter, and a rack of blades behind it.
      d.box(wx, fy, wz - 0.6, wx + s * 0.55, fy + 0.85, wz + 0.6, { top: '#8a5a34', front: '#7a4e2c', side: '#6a4428' }, 'b')
      d.box(wx, fy + 0.85, wz - 0.65, wx + s * 0.6, fy + 0.9, wz + 0.65, '#a06a3a', 'b')
      for (let i = 0; i < 4; i++) {
        const z = wz - 0.45 + i * 0.3
        d.beam(wx + s * 0.04, fy + 1.0, z, wx + s * 0.04, fy + 1.75, z, 0.04, '#d8dde8', 0.015)
        d.box(wx + s * 0.02, fy + 1.0, z - 0.08, wx + s * 0.07, fy + 1.04, z + 0.08, '#d8b04a', 'b')
      }
      d.ball(wx + s * 0.35, fy + 0.98, wz + 0.3, 0.07, '#ffd24a', 5, 3)
      break
    }
    case 'rogue': {
      // A target board on the wall, daggers in it; a crate table with a map.
      d.push(wx + s * 0.03, fy + 1.3, wz, s > 0 ? Math.PI / 2 : -Math.PI / 2)
      d.cyl(0, 0, 0, 0.42, 0.42, 0.06, 10, '#c8a070', '#c8a070')
      d.pop()
      for (const [a, b] of [[0.1, 0.05], [-0.12, -0.1], [0.02, -0.2]] as const) d.beam(wx + s * 0.1, fy + 1.3 + b, wz + a, wx + s * 0.3, fy + 1.3 + b, wz + a, 0.03, '#d8dde8', 0.03)
      d.box(fx - 0.3 + s * 0.3, fy, wz + 0.6, fx + 0.3 + s * 0.3, fy + 0.55, wz + 1.1, { top: '#8a6a44', side: '#6a4a2c' }, 'b')
      d.box(fx - 0.25 + s * 0.3, fy + 0.55, wz + 0.65, fx + 0.25 + s * 0.3, fy + 0.56, wz + 1.0, '#f0e0b0', 'b')
      break
    }
    case 'tinker': {
      d.box(wx, fy + 0.75, wz - 0.6, wx + s * 0.6, fy + 0.82, wz + 0.6, { top: '#6a6a74', side: '#4a4a54' }, 'b')
      for (const zz of [-0.52, 0.52]) d.box(wx + s * 0.05, fy, wz + zz - 0.04, wx + s * 0.55, fy + 0.75, wz + zz + 0.04, '#4a4a54', 'b')
      for (let i = 0; i < 3; i++) d.cyl(fx, fy + 0.82, wz - 0.3 + i * 0.3, 0.1, 0.1, 0.05, 8, '#c9a24a', '#d8b04a')
      g.cyl(fx + s * 0.05, fy + 0.82, wz + 0.45, 0.07, 0.07, 0.2, 6, '#4ff0c8', '#4ff0c8')
      d.beam(wx + s * 0.02, fy + 1.1, wz - 0.6, wx + s * 0.02, fy + 1.1, wz + 0.6, 0.08, '#8a8f9a', 0.08)
      break
    }
    case 'noble': {
      // A writing desk with a candle and a scroll.
      d.box(wx + s * 0.05, fy + 0.7, wz - 0.5, wx + s * 0.6, fy + 0.78, wz + 0.5, { top: '#6a3a2a', side: '#4a2a1c' }, 'b')
      d.box(wx + s * 0.1, fy, wz - 0.45, wx + s * 0.55, fy + 0.7, wz + 0.45, '#5a3424', 'b')
      d.box(wx + s * 0.25, fy + 0.78, wz - 0.2, wx + s * 0.45, fy + 0.8, wz + 0.15, '#f0e0b0', 'b')
      g.ball(wx + s * 0.4, fy + 0.95, wz + 0.35, 0.04, '#ffd27a', 4, 3)
      break
    }
    default: {
      d.box(fx - 0.35, fy + 0.7, wz - 0.4, fx + 0.35, fy + 0.78, wz + 0.4, { top: '#8a5a34', side: '#6a4428' }, 'b')
      d.box(fx - 0.3, fy, wz - 0.35, fx + 0.3, fy + 0.7, wz + 0.35, '#6a4428', 'b')
    }
  }
  void c
  void r
}

/** Shelves on the back wall, stocked by trade. */
const shelves = (B: Kit, x: number, z0: number, fy: number, w: number, job: TownJob, r: () => number): void => {
  const d = B.detail
  d.box(x, fy, z0, x + w, fy + 1.7, z0 + 0.35, { front: '#5a3a24', side: '#6a4428', top: '#7a4e2c' }, 'b')
  const cols = job === 'scholar' || job === 'noble' ? ['#c9482a', '#3f6fd6', '#5aa84a', '#d8b04a', '#7a3fa0'] : job === 'healer' || job === 'alchemist' ? ['#7dff8a', '#5fd8ff', '#ff6a8a', '#ffd84a'] : ['#8a8f9a', '#a06a3a', '#d8b04a', '#5a5a64']
  for (let row = 0; row < 3; row++) {
    const y = fy + 0.2 + row * 0.5
    d.box(x + 0.04, y - 0.04, z0 + 0.32, x + w - 0.04, y, z0 + 0.36, '#7a4e2c', 'b')
    let xx = x + 0.08
    while (xx < x + w - 0.14) {
      const bw = 0.06 + r() * 0.07
      const bh = 0.2 + r() * 0.16
      const col = cols[Math.floor(r() * cols.length)]!
      if (job === 'healer' || job === 'alchemist') B.glow.ball(xx + 0.05, y + 0.08, z0 + 0.2, 0.06, col, 4, 3)
      else d.box(xx, y, z0 + 0.08, xx + bw, y + bh, z0 + 0.3, { front: col, side: shade(col, 0.8), top: shade(col, 1.1) }, 'b')
      xx += bw + 0.03 + (job === 'healer' || job === 'alchemist' ? 0.08 : 0)
    }
  }
}

const hearth = (B: Kit, x: number, z0: number, fy: number, burning: boolean): void => {
  B.hull.box(x - 0.55, fy, z0, x + 0.55, fy + 1.25, z0 + 0.5, { front: '#9a8a84', side: '#8a7a74', top: '#7a6a64' }, 'b')
  B.detail.box(x - 0.35, fy, z0 + 0.48, x + 0.35, fy + 0.6, z0 + 0.51, '#2a2026', 'b')
  B.detail.box(x - 0.65, fy + 1.25, z0, x + 0.65, fy + 1.37, z0 + 0.6, '#6a4428', 'b')
  if (burning) {
    B.glow.ball(x, fy + 0.18, z0 + 0.4, 0.2, '#ff7a2a', 5, 4, 1.2)
    B.glow.ball(x, fy + 0.28, z0 + 0.42, 0.11, '#ffd24a', 4, 3, 1.4)
  }
  B.detail.beam(x - 0.25, fy + 0.06, z0 + 0.45, x + 0.25, fy + 0.08, z0 + 0.4, 0.09, '#5a3a24', 0.09)
}

const throne = (B: Kit, x: number, z0: number, fy: number): void => {
  const d = B.detail
  d.box(x - 0.45, fy, z0 + 0.1, x + 0.45, fy + 0.12, z0 + 1.0, { top: '#a82a3a', side: '#7a1c28' }, 'b')
  d.box(x - 0.35, fy + 0.12, z0 + 0.2, x + 0.35, fy + 0.42, z0 + 0.8, { top: '#a82a3a', front: '#d8b04a', side: '#b8903a' }, 'b')
  d.box(x - 0.38, fy + 0.12, z0 + 0.12, x + 0.38, fy + 1.55, z0 + 0.26, { front: '#a82a3a', side: '#d8b04a', top: '#d8b04a' }, 'b')
  for (const s of [-1, 1]) {
    d.box(x + s * 0.38 - 0.06, fy + 0.12, z0 + 0.15, x + s * 0.38 + 0.06, fy + 0.72, z0 + 0.82, '#d8b04a', 'b')
    d.ball(x + s * 0.38, fy + 1.6, z0 + 0.2, 0.08, '#ffd84a', 5, 3)
  }
}

/** A tiny tri count of a whole town's houses (perf notes). */
export const _meshInfo = (k: Kit): number => (k.hull.idx.length + k.detail.idx.length + k.glow.idx.length) / 3
