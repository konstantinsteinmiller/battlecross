import { Float32BufferAttribute, Matrix4, type Color } from 'three'
import type { TownStyle } from '../data/zones'
import { CELL } from '../sim/grid'
import { TC_FENCE, TC_GRASS, TC_GROUND, TC_SQUARE, TC_STREET, TC_YARD, type TownPlan, type TownProp } from '../sim/town'
import { Mesher, cage, lc, seeded, shade, under, type Kit } from './archKit'
import { rock } from './kit'

/**
 * ─── What stands in a town's streets (roadmap #41) ──────────────────────────
 *
 * The props a town plan places (`TownProp`): a well or a fountain, market
 * stalls, benches and tables, carts and hay, lamps, a notice board, the
 * training yard's dummies and racks, the smith's anvil and trough, laundry,
 * wood piles, gardens; plus the fences and low walls round every garden, and
 * the cobbles of the streets and the square.
 *
 * Built into the same kits as the houses (`archKit.ts`): flat planes, vertex
 * colours, a hull for the big shapes. The few things that move (a dummy that
 * rocks when it is struck) are built on their own.
 */

export interface PropCtx {
  style: TownStyle
  ruined: boolean
  low: boolean
  /** Ground height at a point. */
  gy: (x: number, z: number) => number
}

const WOOD = '#8a5a34'
const WOOD_D = '#6a4428'
const IRON = '#3a363c'

const rockGeo = (r: number, seed: number, hex: string): ReturnType<typeof rock> => {
  const g = rock(r, seed, 7, 5)
  const c = lc(hex)
  const n = g.attributes.position!.count
  const a = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b }
  g.setAttribute('color', new Float32BufferAttribute(a, 3))
  return g
}

/** A barrel, standing. */
export const barrel = (m: Mesher, x: number, y: number, z: number, s = 1): void => {
  m.cyl(x, y, z, 0.24 * s, 0.27 * s, 0.32 * s, 8, WOOD, shade(WOOD, 0.85))
  m.cyl(x, y + 0.32 * s, z, 0.27 * s, 0.24 * s, 0.32 * s, 8, WOOD, '#5a3a24')
  for (const h of [0.08, 0.32, 0.56]) m.cyl(x, y + h * s, z, 0.25 * s + (h === 0.32 ? 0.03 * s : 0.01 * s), 0.25 * s + (h === 0.32 ? 0.03 * s : 0.01 * s), 0.05 * s, 8, IRON)
}

/** A crate. */
export const crate = (m: Mesher, x: number, y: number, z: number, s: number, rot: number): void => {
  m.push(x, y, z, rot)
  m.box(-0.26 * s, 0, -0.26 * s, 0.26 * s, 0.5 * s, 0.26 * s, { top: '#c8965a', side: '#b07e48', front: '#b88850' }, 'b')
  m.box(-0.27 * s, 0.03, -0.27 * s, 0.27 * s, 0.09 * s, 0.27 * s, '#8a5e34', 't')
  m.box(-0.27 * s, 0.41 * s, -0.27 * s, 0.27 * s, 0.47 * s, 0.27 * s, '#8a5e34', 't')
  m.pop()
}

/** Build one prop into a kit (world coordinates). */
export const buildProp = (k: Kit, p: TownProp, c: PropCtx): void => {
  const y = c.gy(p.x, p.z)
  const r = seeded(p.v * 7919 + 13)
  under(k, p.x, y, p.z, p.rot, () => draw(k, p, c, r))
}

const draw = (k: Kit, p: TownProp, c: PropCtx, r: () => number): void => {
  const h = k.hull
  const d = k.detail
  const g = k.glow
  const ruined = c.ruined
  switch (p.kind) {
    case 'well': {
      // A round stone well with a little roof, a crank and a bucket.
      const st = c.style === 'mountain' ? '#9a98a2' : '#b8ab98'
      h.cyl(0, 0, 0, 0.72, 0.7, 0.62, 10, st)
      d.cyl(0, 0.62, 0, 0.75, 0.75, 0.08, 10, shade(st, 1.15), shade(st, 1.2))
      d.cyl(0, 0.5, 0, 0.55, 0.55, 0.15, 10, '#2a3a4a', '#3a6a8a')
      for (let i = 0; i < 10; i += 2) d.box(Math.sin(i * 0.628) * 0.71 - 0.1, 0.18, Math.cos(i * 0.628) * 0.71 - 0.02, Math.sin(i * 0.628) * 0.71 + 0.1, 0.3, Math.cos(i * 0.628) * 0.71 + 0.02, shade(st, 0.85), 'b')
      if (ruined) { d.beam(-0.6, 0.7, 0, 0.3, 1.2, 0.1, 0.1, '#2e2622', 0.1); break }
      for (const s of [-1, 1]) h.box(s * 0.62 - 0.07, 0.6, -0.07, s * 0.62 + 0.07, 1.8, 0.07, WOOD_D, 'b')
      h.prism([[-0.95, 1.75], [0.95, 1.75], [0, 2.3]], -0.6, 0.6, c.style === 'mountain' ? '#4d566e' : '#c75440', c.style === 'mountain' ? '#424a60' : '#a84434')
      d.beam(-0.7, 1.35, 0, 0.75, 1.35, 0, 0.09, WOOD, 0.09)
      d.beam(0.75, 1.35, 0, 0.75, 1.15, 0.15, 0.05, IRON, 0.05)
      d.beam(0, 1.32, 0, 0, 0.95, 0, 0.02, '#c8b890', 0.02)
      d.cyl(0, 0.8, 0, 0.13, 0.15, 0.17, 6, WOOD, '#3a6a8a')
      break
    }
    case 'fountain': {
      const st = '#c4bcb0'
      h.cyl(0, 0, 0, 1.95, 1.95, 0.55, 8, st, shade(st, 1.15))
      if (ruined) {
        d.cyl(0, 0.55, 0, 1.6, 1.6, 0.01, 8, '#6a5a4a', '#5a4a3a')
        h.cyl(0, 0.55, 0, 0.32, 0.36, 0.8, 6, shade(st, 0.7))
        h.push(0.5, 0.65, 0.6, 0.6)
        h.geo(rockGeo(0.35, 4, '#8a847a'))
        h.pop()
        break
      }
      d.cyl(0, 0.555, 0, 1.68, 1.68, 0.01, 8, '#5fb8e8', '#7fd4f6')
      h.cyl(0, 0.55, 0, 0.3, 0.26, 1.2, 8, st)
      h.cyl(0, 1.65, 0, 0.75, 0.25, 0.3, 8, shade(st, 1.05), '#7fd4f6')
      h.cyl(0, 1.95, 0, 0.12, 0.1, 0.45, 6, st)
      d.ball(0, 2.45, 0, 0.16, '#d8b04a', 6, 4)
      // Water falling from the bowl.
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        d.beam(Math.sin(a) * 0.72, 1.85, Math.cos(a) * 0.72, Math.sin(a) * 0.95, 0.6, Math.cos(a) * 0.95, 0.06, '#a8e4fa', 0.03)
      }
      break
    }
    case 'stall': {
      // A market stall: a counter of goods under a striped awning. The keeper stands behind (−z).
      const w = Math.max(1.4, p.w - 0.35)
      const cols = ruined ? [['#5a4a44', '#7a6e62'], ['#4a4458', '#6a6270']][p.v % 2]! : [['#c9483a', '#f4ead2'], ['#3f7fd6', '#f4ead2'], ['#5aa84a', '#f8f0d8'], ['#d8962a', '#fff4e0']][p.v % 4]!
      h.box(-w / 2, 0, -0.35, w / 2, 0.82, 0.32, { top: '#c8965a', front: WOOD, side: WOOD_D }, 'b')
      d.box(-w / 2 - 0.04, 0.82, -0.38, w / 2 + 0.04, 0.88, 0.36, '#a06a3a', 'b')
      d.quad(-w / 2 + 0.05, 0.1, 0.33, w / 2 - 0.05, 0.1, 0.33, w / 2 - 0.05, 0.7, 0.33, -w / 2 + 0.05, 0.7, 0.33, shade(cols[0]!, 0.85))
      for (const s of [-1, 1]) for (const zz of [-0.32, 0.3]) h.box(s * w / 2 - 0.05, 0.82, zz - 0.05, s * w / 2 + 0.05, zz < 0 ? 2.15 : 1.85, zz + 0.05, WOOD_D, 'b')
      const n = Math.round(w / 0.3)
      for (let i = 0; i < n; i++) {
        const a = -w / 2 - 0.15 + ((w + 0.3) * i) / n
        const b = -w / 2 - 0.15 + ((w + 0.3) * (i + 1)) / n
        // A ruined stall's awning is in tatters: every other stripe torn away.
        if (ruined && i % 2) continue
        h.quad(a, 1.8, 0.55, b, 1.8, 0.55, b, 2.15, -0.45, a, 2.15, -0.45, i % 2 ? cols[0]! : cols[1]!)
        d.tri(a, 1.8, 0.55, (a + b) / 2, 1.66, 0.56, b, 1.8, 0.55, i % 2 ? shade(cols[0]!, 0.85) : shade(cols[1]!, 0.85))
      }
      // Goods: fruit, bottles, trinkets.
      const goods = ['#ff5a4a', '#ffd84a', '#7dd84a', '#ff9a3a', '#c08aff', '#5fd8ff']
      for (let i = 0; i < (ruined ? 3 : 9); i++) {
        const gx = -w / 2 + 0.2 + ((i % 5) / 4) * (w - 0.4)
        const gz = -0.15 + Math.floor(i / 5) * 0.28
        const col = goods[(i * 5 + p.v) % goods.length]!
        if (i % 3 === 0) d.box(gx - 0.1, 0.88, gz - 0.08, gx + 0.1, 0.98, gz + 0.08, { top: col, side: shade(col, 0.8) }, 'b')
        else d.ball(gx, 0.95, gz, 0.07, col, 5, 3)
      }
      barrel(d, w / 2 + 0.35, 0, 0.1, 0.8)
      break
    }
    case 'crates': {
      // The fence's stall: crates for a counter, a lantern, goods half-hidden.
      crate(h, -0.35, 0, 0, 1.1, 0.1)
      crate(h, 0.4, 0, 0.05, 1, -0.15)
      crate(h, 0.0, 0.52, 0.0, 0.85, 0.3)
      d.box(-0.6, 0.55, -0.25, 0.75, 0.57, 0.25, '#4a3a5a', 'b')
      d.ball(0.45, 0.66, 0, 0.08, '#b48cff', 5, 3)
      g.ball(-0.4, 0.66, 0.05, 0.07, '#ffd24a', 4, 3)
      break
    }
    case 'board': {
      for (const s of [-1, 1]) h.box(s * 0.62 - 0.06, 0, -0.06, s * 0.62 + 0.06, 1.85, 0.06, WOOD_D, 'b')
      h.box(-0.7, 0.8, -0.05, 0.7, 1.7, 0.03, { front: '#a87a4a', side: WOOD_D, top: WOOD_D }, 'b')
      h.prism([[-0.85, 1.8], [0.85, 1.8], [0, 2.15]], -0.25, 0.2, '#7a4e2e')
      const papers = ['#fff8e8', '#f4e8c8', '#ffe8e0', '#e8f0ff']
      for (let i = 0; i < 5; i++) {
        const px = -0.5 + (i % 3) * 0.45 + (r() - 0.5) * 0.1
        const py = 0.95 + Math.floor(i / 3) * 0.38 + (r() - 0.5) * 0.06
        d.quad(px - 0.16, py, 0.04, px + 0.16, py, 0.04, px + 0.16, py + 0.3, 0.04, px - 0.16, py + 0.3, 0.04, papers[i % papers.length]!)
        d.ball(px, py + 0.27, 0.05, 0.025, '#c9483a', 4, 2)
      }
      break
    }
    case 'bench': {
      // Facing +z: a seat plank on legs, a back rail behind.
      h.box(-0.65, 0.2, -0.2, 0.65, 0.28, 0.2, { top: '#b07e48', side: WOOD_D, front: WOOD }, 'b')
      for (const s of [-1, 1]) d.box(s * 0.55 - 0.06, 0, -0.18, s * 0.55 + 0.06, 0.2, 0.18, WOOD_D, 'b')
      for (const s of [-1, 1]) d.box(s * 0.55 - 0.05, 0.28, -0.22, s * 0.55 + 0.05, 0.75, -0.14, WOOD_D, 'b')
      h.box(-0.68, 0.5, -0.24, 0.68, 0.72, -0.14, { front: '#b07e48', side: WOOD_D, top: WOOD }, 'b')
      break
    }
    case 'table': {
      // A low round table (a chibi sits low), a stool each side.
      h.cyl(0, 0.44, 0, 0.48, 0.48, 0.08, 8, WOOD, '#b07e48')
      d.cyl(0, 0, 0, 0.1, 0.08, 0.44, 6, WOOD_D)
      d.cyl(0, 0, 0, 0.3, 0.3, 0.05, 6, WOOD_D, WOOD_D)
      for (const s of [-1, 1]) {
        h.cyl(s * 0.68, 0.12, 0, 0.19, 0.2, 0.07, 7, '#a07040', '#b88a50')
        for (const [a, b] of [[-0.1, -0.1], [0.1, -0.1], [0, 0.11]] as const) d.box(s * 0.68 + a - 0.025, 0, b - 0.025, s * 0.68 + a + 0.025, 0.12, b + 0.025, WOOD_D, 'b')
      }
      if (!ruined) {
        for (const [a, b] of [[-0.2, 0.1], [0.18, -0.12]] as const) {
          d.cyl(a, 0.52, b, 0.07, 0.07, 0.14, 6, '#c98a3a', '#fff4d8')
        }
        d.ball(0.05, 0.56, 0.2, 0.08, '#d8a050', 5, 3, 0.7)
      }
      break
    }
    case 'barrel':
      barrel(h, 0, 0, 0)
      break
    case 'cart': {
      // A hay cart: a bed on two wheels, its shafts down on the ground.
      h.box(-0.9, 0.5, -0.55, 0.9, 0.62, 0.55, { top: '#b07e48', side: WOOD_D }, 'b')
      for (const s of [-1, 1]) h.box(-0.9, 0.62, s * 0.55 - 0.05, 0.9, 0.9, s * 0.55 + 0.05, { front: WOOD, side: WOOD_D, top: WOOD }, 'b')
      h.box(0.85, 0.62, -0.55, 0.95, 0.9, 0.55, WOOD, 'b')
      for (const s of [-1, 1]) {
        h.push(-0.1, 0.42, s * 0.68, 0)
        h.pushMatrix(ALONG_Z)
        h.cyl(0, -0.05, 0, 0.42, 0.42, 0.1, 10, '#7a5030', '#a07040')
        h.pop()
        h.pop()
      }
      for (const s of [-1, 1]) d.beam(-0.9, 0.55, s * 0.4, -1.9, 0.05, s * 0.3, 0.08, WOOD_D, 0.08)
      if (!ruined) d.ball(0, 0.95, 0, 0.75, '#e2b850', 7, 4, 0.45)
      break
    }
    case 'hay': {
      // Round bales lying on their sides, one on top now and then.
      const hc = ruined ? '#6a5a40' : '#e2b850'
      const bale = (x: number, y: number, z: number, rot: number): void => {
        h.push(x, y + 0.42, z, rot)
        h.pushMatrix(ALONG_Z)
        h.cyl(0, -0.42, 0, 0.42, 0.42, 0.84, 10, hc, shade(hc, 1.12), true)
        h.cyl(0, 0.42, 0, 0.42, 0.42, 0.001, 10, hc, shade(hc, 1.12))
        h.pop()
        h.pop()
        d.push(x, y + 0.42, z, rot)
        d.pushMatrix(ALONG_Z)
        for (const yy of [-0.2, 0.2]) d.cyl(0, yy, 0, 0.435, 0.435, 0.05, 10, shade(hc, 0.72))
        // The spiral on its face.
        d.cyl(0, 0.425, 0, 0.22, 0.22, 0.01, 8, shade(hc, 0.85), shade(hc, 0.85))
        d.pop()
        d.pop()
      }
      bale(0, 0, 0, 0)
      if (r() < 0.6) bale(0.95, 0, 0.05, 0.15)
      if (r() < 0.35) bale(0.5, 0.76, 0, 0.05)
      break
    }
    case 'lamp': {
      h.cyl(0, 0, 0, 0.12, 0.09, 0.25, 6, '#5a5258')
      h.box(-0.05, 0.25, -0.05, 0.05, 2.15, 0.05, IRON, 'b')
      d.beam(0, 2.05, 0, 0.32, 2.12, 0, 0.04, IRON, 0.04)
      cage(k, 0.22, 1.7, -0.11, 0.44, 1.98, 0.11, IRON, ruined ? '#3a3438' : '#ffd27a')
      d.prism([[0.18, 1.98], [0.48, 1.98], [0.33, 2.12]], -0.13, 0.13, IRON)
      break
    }
    case 'tree': {
      if (ruined) { h.cyl(0, 0, 0, 0.22, 0.18, 0.45, 7, '#3a2e28', '#5a4a3a'); d.beam(0.1, 0.3, 0, 0.6, 0.9, 0.2, 0.1, '#3a2e28', 0.1); break }
      h.cyl(0, 0, 0, 0.18, 0.14, 1.3, 7, '#7a5a3a')
      const leaf = c.style === 'mountain' ? ['#3f7a4a', '#55905a'] : ['#5fae4a', '#86cc5c']
      h.ball(0, 1.75, 0, 0.85, leaf[0]!, 8, 6, 0.85)
      h.ball(0.45, 2.15, 0.1, 0.55, leaf[1]!, 7, 5)
      h.ball(-0.4, 2.05, -0.15, 0.5, leaf[1]!, 7, 5)
      if (c.style === 'rural') for (let i = 0; i < 5; i++) d.ball(Math.sin(i * 1.7) * 0.7, 1.55 + (i % 3) * 0.3, Math.cos(i * 1.7) * 0.7 + 0.2, 0.08, '#ff6a5a', 4, 3)
      break
    }
    case 'dummy':
    case 'stone':
      // Drawn by the view on their own (they rock when struck); a base here.
      d.cyl(0, 0, 0, 0.32, 0.36, 0.08, 7, '#8a7a64', '#9a8a74')
      break
    case 'rack': {
      for (const s of [-1, 1]) h.box(s * 0.7 - 0.05, 0, -0.05, s * 0.7 + 0.05, 1.2, 0.05, WOOD_D, 'b')
      d.beam(-0.75, 1.05, 0.05, 0.75, 1.05, 0.05, 0.07, WOOD, 0.07)
      d.beam(-0.75, 0.35, 0.05, 0.75, 0.35, 0.05, 0.07, WOOD, 0.07)
      for (let i = 0; i < 5; i++) {
        const x = -0.5 + i * 0.25
        const kind = i % 3
        if (kind === 0) d.beam(x, 0.15, 0.12, x, 1.45, 0.12, 0.04, '#d8dde8', 0.02)
        else if (kind === 1) { d.beam(x, 0.1, 0.12, x, 1.55, 0.12, 0.035, WOOD, 0.035); d.prism([[x - 0.06, 1.55], [x + 0.06, 1.55], [x, 1.75]], 0.1, 0.14, '#c9d3e4') } else { d.beam(x, 0.15, 0.12, x, 1.2, 0.12, 0.04, WOOD, 0.04); d.box(x - 0.1, 1.05, 0.08, x + 0.1, 1.3, 0.16, '#8a8f9a', 'b') }
      }
      break
    }
    case 'anvil': {
      // On a stump, a hammer resting on it.
      h.cyl(0, 0, 0, 0.3, 0.33, 0.45, 8, '#7a5030', '#a07848')
      h.box(-0.12, 0.45, -0.2, 0.12, 0.6, 0.2, '#4a4a54', 'b')
      h.box(-0.18, 0.6, -0.32, 0.18, 0.78, 0.28, { top: '#6a6a78', side: '#4a4a54' }, 'b')
      h.prism([[-0.12, 0.66], [0.12, 0.66], [0, 0.78]], 0.28, 0.5, '#4a4a54')
      d.beam(-0.1, 0.8, 0.1, 0.25, 0.83, -0.25, 0.04, WOOD, 0.04)
      d.box(-0.16, 0.78, 0.04, -0.02, 0.88, 0.16, '#55585f', 'b')
      break
    }
    case 'trough': {
      // Plank sides round a trough of water, a bucket beside it.
      h.box(-0.62, 0, -0.34, 0.62, 0.12, 0.34, WOOD_D, 'b')
      h.box(-0.62, 0.12, 0.26, 0.62, 0.52, 0.34, { front: WOOD, top: '#a07040', back: WOOD_D }, 'b')
      h.box(-0.62, 0.12, -0.34, 0.62, 0.52, -0.26, { back: WOOD, top: '#a07040', front: WOOD_D }, 'b')
      h.box(-0.62, 0.12, -0.26, -0.54, 0.52, 0.26, { top: '#a07040', side: WOOD }, 'b')
      h.box(0.54, 0.12, -0.26, 0.62, 0.52, 0.26, { top: '#a07040', side: WOOD }, 'b')
      d.box(-0.54, 0.12, -0.26, 0.54, 0.44, 0.26, { top: '#4f9ac8' }, 'b')
      for (const x of [-0.45, 0.45]) d.box(x - 0.03, 0.05, 0.33, x + 0.03, 0.55, 0.37, IRON, 'b')
      d.cyl(0.85, 0, 0.1, 0.13, 0.16, 0.26, 7, '#8a6038', '#4f9ac8')
      break
    }
    case 'grindstone': {
      d.cyl(0, 0, 0, 0.1, 0.1, 0.5, 5, WOOD_D)
      break
    }
    case 'woodpile': {
      // Logs stacked under a lean-to.
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 4 - row; i++) {
          d.push(-0.45 + i * 0.3 + row * 0.15, 0.13 + row * 0.24, 0, 0)
          d.pushMatrix(ALONG_Z)
          d.cyl(0, -0.45, 0, 0.13, 0.13, 0.9, 6, '#8a6038', '#d8b080')
          d.pop()
          d.pop()
        }
      }
      if (!c.low) h.quad(-0.75, 1.05, 0.55, 0.75, 1.05, 0.55, 0.75, 1.25, -0.55, -0.75, 1.25, -0.55, '#7a5a3a')
      break
    }
    case 'laundry': {
      const w = p.w * 0.95
      for (const s of [-1, 1]) h.box(s * w / 2 - 0.05, 0, -0.05, s * w / 2 + 0.05, 1.75, 0.05, WOOD_D, 'b')
      d.beam(-w / 2, 1.7, 0, w / 2, 1.62, 0, 0.02, '#e8e0c8', 0.02)
      const cl = ['#ffffff', '#7fb0e8', '#ff9a8a', '#ffe07a', '#a8e09a']
      for (let i = 0; i < 4; i++) {
        const x = -w / 2 + 0.35 + i * ((w - 0.7) / 3)
        const cw = 0.3 + r() * 0.2
        const ch = 0.45 + r() * 0.3
        const col = cl[(i + p.v) % cl.length]!
        d.quad(x - cw / 2, 1.66 - ch, 0.01, x + cw / 2, 1.66 - ch, 0.01, x + cw / 2, 1.66, 0.01, x - cw / 2, 1.66, 0.01, col)
        d.quad(x + cw / 2, 1.66 - ch, -0.01, x - cw / 2, 1.66 - ch, -0.01, x - cw / 2, 1.66, -0.01, x + cw / 2, 1.66, -0.01, shade(col, 0.85))
      }
      d.cyl(w / 2 - 0.35, 0, 0.3, 0.25, 0.3, 0.25, 8, '#c8a070', '#f4ece0')
      break
    }
    case 'garden': {
      // Beds of soil, rows of greens; a pumpkin or two.
      const w = Math.max(CELL, p.w) - 0.3
      const rows = Math.max(2, Math.round(w / 0.5))
      for (let i = 0; i < rows; i++) {
        const x = -w / 2 + (i + 0.5) * (w / rows)
        d.box(x - 0.16, 0, -0.55, x + 0.16, 0.1, 0.55, { top: '#6a4a30', side: '#5a3e28' }, 'b')
        if (ruined) continue
        for (let j = 0; j < 3; j++) {
          const z = -0.38 + j * 0.38
          const veg = (i + j + p.v) % 5
          if (veg === 0) d.ball(x, 0.2, z, 0.14, '#ff9a2a', 6, 4, 0.8)
          else d.ball(x, 0.17, z, 0.12 + (veg % 2) * 0.03, veg % 2 ? '#5aa84a' : '#7fc65a', 5, 3, 0.75)
        }
      }
      break
    }
    case 'campfire':
    case 'brazier': {
      if (p.kind === 'brazier') {
        for (let i = 0; i < 3; i++) { const a = i * 2.09; d.beam(Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3, Math.sin(a) * 0.15, 0.7, Math.cos(a) * 0.15, 0.04, IRON, 0.04) }
        h.cyl(0, 0.65, 0, 0.18, 0.38, 0.3, 8, '#4a4448', '#2a1a14')
        g.ball(0, 1.0, 0, 0.26, '#ff7a2a', 6, 4, 1.3)
        g.ball(0, 1.12, 0, 0.15, '#ffd24a', 5, 3, 1.5)
        break
      }
      for (let i = 0; i < 8; i++) {
        h.push(Math.sin(i * 0.785) * 0.55, 0.05, Math.cos(i * 0.785) * 0.55, i)
        h.geo(rockGeo(0.16, i + 3, '#7a7470'))
        h.pop()
      }
      for (let i = 0; i < 3; i++) { const a = i * 2.09; d.beam(Math.sin(a) * 0.4, 0.05, Math.cos(a) * 0.4, -Math.sin(a) * 0.2, 0.18, -Math.cos(a) * 0.2, 0.1, '#5a3a24', 0.1) }
      g.ball(0, 0.32, 0, 0.3, '#ff7a2a', 6, 4, 1.25)
      g.ball(0, 0.45, 0, 0.17, '#ffd24a', 5, 3, 1.5)
      break
    }
    case 'rubble': {
      for (let i = 0; i < 4; i++) {
        h.push((r() - 0.5) * 0.8, 0.05, (r() - 0.5) * 0.8, r() * 6)
        h.geo(rockGeo(0.18 + r() * 0.2, Math.floor(r() * 99), r() < 0.5 ? '#6a645e' : '#57514c'))
        h.pop()
      }
      d.beam(-0.6, 0.1, 0.2, 0.5, 0.35, -0.3, 0.12, '#2a2220', 0.12)
      break
    }
    case 'signpost': {
      h.box(-0.06, 0, -0.06, 0.06, 2.0, 0.06, WOOD_D, 'b')
      for (const [yy, rot, col] of [[1.75, 0.3, '#c8a070'], [1.45, -0.5, '#b89060']] as const) {
        d.push(0, yy, 0, rot)
        d.prism([[-0.05, -0.1], [0.62, -0.1], [0.75, 0], [0.62, 0.1], [-0.05, 0.1]], -0.03, 0.03, col, shade(col, 0.8))
        d.pop()
      }
      break
    }
    case 'planter': {
      // A round stone planter in bloom.
      const st = c.style === 'mountain' ? '#8e8c96' : '#c8b49a'
      h.cyl(0, 0, 0, 0.55, 0.6, 0.5, 8, st, '#6a4a30')
      d.cyl(0, 0.5, 0, 0.62, 0.62, 0.07, 8, shade(st, 1.12), shade(st, 1.15))
      if (ruined) break
      h.ball(0, 0.68, 0, 0.42, '#4f9a44', 7, 4, 0.6)
      const cols = ['#ff6a8a', '#ffd84a', '#ffffff', '#c08aff', '#ff8a4a']
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4
        const rr = 0.1 + (i % 3) * 0.13
        d.ball(Math.sin(a) * rr, 0.86 + (i % 2) * 0.04, Math.cos(a) * rr, 0.075, cols[(i + p.v) % cols.length]!, 5, 3)
      }
      break
    }
    case 'barrels': {
      barrel(h, -0.25, 0, -0.1)
      barrel(h, 0.3, 0, 0.12, 0.9)
      crate(h, 0.05, 0, 0.5, 0.7, 0.4)
      if (!ruined) d.ball(-0.25, 0.68, -0.1, 0.12, '#ff5a4a', 5, 3)
      break
    }
    case 'gate': {
      // Posts either side of the road, a beam across, the town's board hung from it.
      const w = p.w / 2
      const stone = c.style === 'mountain'
      for (const s of [-1, 1]) {
        if (stone) h.box(s * w - 0.35, 0, -0.35, s * w + 0.35, 3.3, 0.35, { front: '#9a98a2', side: '#8a8892', top: '#a8a6b0' }, 'b')
        else {
          h.box(s * w - 0.14, 0, -0.14, s * w + 0.14, 3.2, 0.14, { front: WOOD, side: WOOD_D, top: WOOD }, 'b')
          d.beam(s * w, 2.2, 0, s * (w - 0.7), 3.05, 0, 0.1, WOOD_D, 0.1)
        }
        h.box(s * w - 0.3, 0, -0.3, s * w + 0.3, 0.3, 0.3, { top: '#a8a49a', side: '#8a867c' }, 'b')
      }
      if (ruined) {
        // The beam fell: one end down in the road's edge.
        d.beam(-w, 3.1, 0, -w + 2.6, 0.2, 0.4, 0.22, '#2e2622', 0.22)
        break
      }
      h.box(-w - 0.45, 3.05, -0.17, w + 0.45, 3.4, 0.17, { front: stone ? '#7a7680' : WOOD, side: WOOD_D, top: stone ? '#8a8690' : '#a07040' }, 'b')
      if (!stone) h.prism([[-w - 0.6, 3.4], [w + 0.6, 3.4], [w + 0.3, 3.62], [-w - 0.3, 3.62]], -0.3, 0.3, '#c75440', '#a8402f')
      for (const s of [-1, 1]) d.beam(s * 0.55, 3.05, 0.05, s * 0.55, 2.75, 0.05, 0.03, IRON, 0.03)
      d.box(-0.75, 2.2, -0.04, 0.75, 2.78, 0.04, { front: '#f4e2b8', side: WOOD_D, top: WOOD_D }, 'b')
      // The town's mark: a sun, an oak leaf, an anvil.
      d.push(0, 2.49, 0.05, 0)
      if (c.style === 'rural') {
        d.cyl(0, 0, 0, 0.16, 0.16, 0.03, 10, '#ffb02a', '#ffd84a')
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; d.prism([[Math.cos(a - 0.2) * 0.18, Math.sin(a - 0.2) * 0.18], [Math.cos(a) * 0.27, Math.sin(a) * 0.27], [Math.cos(a + 0.2) * 0.18, Math.sin(a + 0.2) * 0.18]], 0, 0.03, '#ffb02a') }
      } else if (c.style === 'mercantile') {
        d.prism([[0, 0.24], [-0.16, 0.06], [-0.1, -0.16], [0.1, -0.16], [0.16, 0.06]], 0, 0.03, '#5aa84a', '#3f8a34')
        d.box(-0.02, -0.26, 0.0, 0.02, -0.12, 0.04, '#6a4428', 'b')
      } else {
        d.box(-0.2, -0.02, 0, 0.2, 0.08, 0.03, '#4a4a54', 'b')
        d.box(-0.09, -0.16, 0, 0.09, -0.02, 0.03, '#3a3a44', 'b')
        d.box(-0.15, -0.21, 0, 0.15, -0.16, 0.03, '#4a4a54', 'b')
      }
      d.pop()
      // A garland of flowers along the beam.
      if (c.style !== 'mountain') for (let i = 0; i < 9; i++) d.ball(-w + (i / 8) * 2 * w, 3.0 - Math.sin((i / 8) * Math.PI) * 0.25, 0.2, 0.09, ['#ff6a8a', '#ffd84a', '#ffffff'][i % 3]!, 5, 3)
      else for (const s of [-1, 1]) g.box(s * w - 0.12, 3.45, -0.12, s * w + 0.12, 3.7, 0.12, '#ff9a3a', 'b')
      break
    }
    case 'bush': {
      const leaf = c.style === 'mountain' ? '#3f7a4a' : ruined ? '#5a6a3a' : '#58b04a'
      h.ball(0, 0.32, 0, 0.42, leaf, 7, 5, 0.85)
      h.ball(0.28, 0.42, 0.1, 0.28, shade(leaf, 1.2), 6, 4)
      break
    }
    default:
      break
  }
}

/** Turns a cylinder standing on Y to lie along Z (wheels, logs). */
const ALONG_Z = new Matrix4().makeRotationX(Math.PI / 2)

// ─── Fences and low walls ────────────────────────────────────────────────────

/** Fences round every garden and every training yard, walls in the mountains. */
export const buildFences = (k: Kit, t: TownPlan, w: number, h: number, c: PropCtx): void => {
  const cell = t.cell
  const walkable = (i: number, j: number): boolean => {
    if (i < 0 || j < 0 || i >= w || j >= h) return false
    const v = cell[j * w + i]!
    return v === TC_GRASS || v === TC_STREET || v === TC_SQUARE || v === TC_GROUND
  }
  // Garden edges that meet open ground; the yard fence's own cells.
  const H = (i: number, j: number): number => j * w + i
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const v = cell[H(i, j)]
      if (v === TC_YARD) {
        const x0 = i * CELL
        const z0 = j * CELL
        if (walkable(i, j - 1)) fence(k, x0, z0, x0 + CELL, z0, c, false)
        if (walkable(i, j + 1)) fence(k, x0 + CELL, z0 + CELL, x0, z0 + CELL, c, false)
        if (walkable(i - 1, j)) fence(k, x0, z0 + CELL, x0, z0, c, false)
        if (walkable(i + 1, j)) fence(k, x0 + CELL, z0, x0 + CELL, z0 + CELL, c, false)
      } else if (v === TC_FENCE) {
        const cx = (i + 0.5) * CELL
        const cz = (j + 0.5) * CELL
        if (i + 1 < w && cell[H(i + 1, j)] === TC_FENCE) fence(k, cx, cz, cx + CELL, cz, c, true)
        if (j + 1 < h && cell[H(i, j + 1)] === TC_FENCE) fence(k, cx, cz, cx, cz + CELL, c, true)
        // The gate posts stand at the ends of the front fence.
        if (j + 1 < h && cell[H(i, j + 1)] !== TC_FENCE && (cell[H(i - 1, j)] !== TC_FENCE || cell[H(i + 1, j)] !== TC_FENCE)) fence(k, cx, cz, cx, cz, c, true)
      }
    }
  }
}

/** One length of fence from a to b (a post at a). */
const fence = (k: Kit, ax: number, az: number, bx: number, bz: number, c: PropCtx, yard: boolean): void => {
  const d = k.detail
  const hh = k.hull
  const ya = c.gy(ax, az)
  const yb = c.gy(bx, bz)
  const len = Math.hypot(bx - ax, bz - az)
  if (c.style === 'mountain' && !yard) {
    if (len < 0.01) return
    const n = 2
    for (let i = 0; i < n; i++) {
      const t0 = i / n
      const t1 = (i + 1) / n
      const col = shade('#8a8890', 0.88 + ((i * 7 + Math.round(ax * 3 + az)) % 3) * 0.08)
      hh.beam(ax + (bx - ax) * t0, ya + 0.24, az + (bz - az) * t0, ax + (bx - ax) * t1, yb + 0.24, az + (bz - az) * t1, 0.38, col, 0.48)
    }
    return
  }
  if (c.style === 'mercantile' && !yard) {
    if (len < 0.01) return
    hh.beam(ax, ya + 0.32, az, bx, yb + 0.32, bz, 0.46, c.ruined ? '#6a6a3a' : '#4f9a44', 0.64)
    d.beam(ax, ya + 0.66, az, bx, yb + 0.66, bz, 0.32, c.ruined ? '#7a7a4a' : '#6ab45a', 0.06)
    return
  }
  const col = c.ruined ? '#4a3e34' : yard ? '#8a5a34' : '#f2ead8'
  const dark = c.ruined ? '#3a302a' : yard ? '#6a4428' : '#d8ccb0'
  hh.box(ax - 0.07, ya, az - 0.07, ax + 0.07, ya + (yard ? 1.05 : 0.85), az + 0.07, { top: col, side: dark }, 'b')
  if (len < 0.01) return
  for (const yy of yard ? [0.42, 0.85] : [0.25, 0.55]) d.beam(ax, ya + yy, az, bx, yb + yy, bz, 0.06, col, 0.08)
  if (!yard && !c.low && !(c.ruined && (Math.round(ax * 7 + az * 3) % 3 === 0))) {
    const n = Math.max(2, Math.round(len / 0.24))
    const ang = Math.atan2(bx - ax, bz - az)
    for (let i = 1; i < n; i++) {
      const t = i / n
      d.push(ax + (bx - ax) * t, ya + (yb - ya) * t, az + (bz - az) * t, ang + Math.PI / 2)
      d.prism([[-0.045, 0.05], [0.045, 0.05], [0.045, 0.66], [0, 0.76], [-0.045, 0.66]], -0.02, 0.02, col, dark)
      d.pop()
    }
  }
}

// ─── The cobbles ─────────────────────────────────────────────────────────────

/**
 * Stones over every street and the square: small cobbles in Sunford's lanes,
 * dressed flags in Oakhaven, big grey slabs in Ironhold; a square laid in rings
 * round its well. Flat, a finger above the ground, sand showing between.
 */
export const buildPaving = (m: Mesher, plan: { w: number; h: number; trail: Uint8Array }, t: TownPlan, c: PropCtx, seed: number): void => {
  const r = seeded(seed ^ 0x5eed)
  const tones = c.style === 'mountain' ? ['#8e8c96', '#9a98a2', '#84828c', '#a4a0a0'] : c.style === 'mercantile' ? ['#c8bca8', '#d4c8b2', '#bcae98', '#cfc2ae'] : ['#c2b294', '#cdbd9e', '#b5a586', '#d2c4a4']
  const sq = t.square
  const cxm = ((sq.i0 + sq.i1 + 1) / 2) * CELL
  const czm = (14.5) * CELL
  const stone = (x0: number, z0: number, x1: number, z1: number, col: Color): void => {
    const lift = 0.025
    m.quad(x0, c.gy(x0, z1) + lift, z1, x1, c.gy(x1, z1) + lift, z1, x1, c.gy(x1, z0) + lift, z0, x0, c.gy(x0, z0) + lift, z0, col)
  }
  for (let j = 0; j < plan.h; j++) {
    for (let i = 0; i < plan.w; i++) {
      const k = j * plan.w + i
      if (!plan.trail[k]) continue
      const inSquare = i >= sq.i0 && i <= sq.i1 && j >= sq.j0 && j <= sq.j1
      const x0 = i * CELL
      const z0 = j * CELL
      // Ruined streets have lost stones.
      const keep = c.ruined ? 0.55 : c.low ? 0.85 : 1
      if (inSquare) {
        // Flags in rings round the well: three by three a cell, turned to it.
        const n = 3
        for (let b = 0; b < n; b++) {
          for (let a = 0; a < n; a++) {
            if (r() > keep) continue
            const sx = x0 + ((a + 0.5) / n) * CELL
            const sz = z0 + ((b + 0.5) / n) * CELL
            const ring = Math.floor(Math.hypot(sx - cxm, sz - czm) / 1.1)
            const col = lc(tones[(ring + (r() < 0.25 ? 1 : 0)) % tones.length]!).clone().multiplyScalar(0.95 + r() * 0.1)
            const s = CELL / n / 2 - 0.035
            stone(sx - s, sz - s, sx + s, sz + s, col)
          }
        }
        continue
      }
      // Street cobbles: a jittered grid, rows offset like a running bond.
      const n = c.style === 'mountain' ? 2 : 3
      for (let b = 0; b < n; b++) {
        const off = (b % 2) * 0.5
        for (let a = 0; a < n; a++) {
          if (r() > keep * (c.style === 'rural' ? 0.88 : 1)) continue
          const sx = x0 + ((a + 0.5 + off * (a < n - 1 ? 1 : 0)) / n) * CELL
          const sz = z0 + ((b + 0.5) / n) * CELL
          const s = CELL / n / 2 - 0.045 - r() * 0.03
          const col = lc(tones[Math.floor(r() * tones.length)]!).clone().multiplyScalar(0.93 + r() * 0.12)
          stone(sx - s * (0.85 + r() * 0.3), sz - s, sx + s * (0.85 + r() * 0.3), sz + s, col)
        }
      }
    }
  }
}
