import type { BufferGeometry } from 'three'
import { PLANT_BY_ID, type PlantId } from '../data/plants'
import { cap, dome, ell, gradY, lathe, limb, merge, paint, rock, rod, sph, spike, tone, xform } from './kit'

/**
 * ─── The eight herbs, as they grow (roadmap #87, #88) ────────────────────────
 *
 * Small, bright and readable from the camera's height: each has a silhouette
 * of its own (a sun flower, a cluster of glowing caps, a fan of fronds, a
 * mossy stone, a flame of petals, a frosted clump, hanging bells, a thorn
 * bush) in its own colours, so a ten-year-old learns them by sight. Every part
 * is a closed, rounded shape: no flat faces to fight over the same pixels.
 *
 * Built in the herb's own space (y up, standing on y = 0), about half a metre
 * tall; the level props place, sway and pick them.
 */

type V3 = [number, number, number]
const P = (g: BufferGeometry, hex: string, p?: V3, r?: V3, s?: number | V3): BufferGeometry => xform(paint(g, hex), p, r, s ?? 1)

export interface PlantGeo {
  lit: BufferGeometry
  /** Parts that glow (a mushroom's spots, a bloom's heart); null: none. */
  glow: BufferGeometry | null
}

/** A ring of `n` leaves round the foot, tipped out by `tilt`. */
const rosette = (n: number, len: number, wid: number, hex: string, tilt: number, y = 0.04, turn = 0): BufferGeometry[] => {
  const out: BufferGeometry[] = []
  for (let i = 0; i < n; i++) {
    const a = turn + (i / n) * Math.PI * 2
    const g = ell(wid, 0.025, len, 8, 5)
    // Tilted up, then turned round the stem; pushed out so its base meets it.
    xform(g, [0, 0, len * 0.85], [-tilt, 0, 0])
    xform(g, [0, y, 0], [0, a, 0])
    out.push(paint(g, i % 2 ? tone(hex, 1.08) : hex))
  }
  return out
}

/** Petals round a heart, facing up and out. */
const corolla = (n: number, len: number, wid: number, hex: string, y: number, cup: number): BufferGeometry[] => {
  const out: BufferGeometry[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const g = ell(wid, 0.022, len, 8, 5)
    xform(g, [0, 0, len * 0.8], [-cup, 0, 0])
    xform(g, [0, y, 0], [0, a, 0])
    out.push(gradY(g, tone(hex, 0.9), tone(hex, 1.15)))
  }
  return out
}

const sunpetal = (): PlantGeo => {
  const d = PLANT_BY_ID.sunpetal
  const lit = [
    ...rosette(5, 0.16, 0.07, d.leaf, 0.35),
    P(rod(0.022, 0.36), d.leaf, [0, 0.18, 0]),
    ...corolla(8, 0.11, 0.055, d.bloom, 0.38, 0.35),
    P(sph(0.06, 10, 8), '#c8761a', [0, 0.39, 0])
  ]
  return { lit: merge(lit), glow: null }
}

const glowcap = (): PlantGeo => {
  const d = PLANT_BY_ID.glowcap
  const lit: BufferGeometry[] = []
  const glow: BufferGeometry[] = []
  const caps: Array<[number, number, number, number]> = [[0, 0, 0.3, 0.13], [0.13, 0.08, 0.2, 0.09], [-0.11, 0.06, 0.16, 0.075]]
  for (const [x, z, h, r] of caps) {
    lit.push(P(cap(r * 0.32, h * 0.7, 8, 2), d.leaf, [x, h * 0.45, z]))
    lit.push(xform(gradY(dome(r, Math.PI / 2, 12, 5), tone(d.bloom, 0.75), d.bloom), [x, h * 0.82, z], [0, 0, 0], [1, 0.7, 1]))
    glow.push(P(sph(r * 0.18, 6, 4), '#e8ffff', [x + r * 0.35, h * 0.82 + r * 0.5, z + r * 0.3]))
    glow.push(P(sph(r * 0.14, 6, 4), '#e8ffff', [x - r * 0.4, h * 0.82 + r * 0.42, z - r * 0.1]))
  }
  return { lit: merge(lit), glow: merge(glow) }
}

const swiftfern = (): PlantGeo => {
  const d = PLANT_BY_ID.swiftfern
  const lit: BufferGeometry[] = []
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3
    // A frond: a long thin leaf arching out, and two rows of small pinnae.
    const f = xform(ell(0.035, 0.02, 0.26, 8, 4), [0, 0, 0.24], [-0.85, 0, 0])
    xform(f, [0, 0.05, 0], [0, a, 0])
    lit.push(paint(f, i % 2 ? d.leaf : tone(d.leaf, 1.12)))
    for (let k = 1; k <= 3; k++) {
      for (const s of [-1, 1]) {
        const p = xform(ell(0.05, 0.012, 0.022, 6, 3), [s * 0.05, 0, 0.1 * k], [0, s * 0.5, 0])
        xform(p, [0, 0, 0], [-0.85, 0, 0])
        xform(p, [0, 0.05, 0], [0, a, 0])
        lit.push(paint(p, d.bloom))
      }
    }
  }
  lit.push(P(sph(0.05, 8, 6), tone(d.leaf, 0.8), [0, 0.04, 0]))
  return { lit: merge(lit), glow: null }
}

const ironmoss = (): PlantGeo => {
  const d = PLANT_BY_ID.ironmoss
  const lit = [
    P(rock(0.2, 7, 9, 7), '#8a8e94', [0, 0.1, 0], [0, 0, 0], [1.1, 0.75, 1]),
    P(ell(0.16, 0.06, 0.14, 10, 6), d.leaf, [0.02, 0.22, 0]),
    P(ell(0.09, 0.05, 0.08, 8, 5), d.bloom, [-0.1, 0.19, 0.08]),
    P(ell(0.08, 0.045, 0.07, 8, 5), tone(d.leaf, 1.15), [0.11, 0.18, -0.07])
  ]
  // Sprigs with grey-green buds.
  for (const [x, z] of [[0.04, 0.03], [-0.05, -0.04], [0.09, 0.07]] as const) {
    lit.push(P(rod(0.01, 0.1, 4), tone(d.leaf, 0.85), [x, 0.29, z]))
    lit.push(P(sph(0.022, 6, 4), d.bloom, [x, 0.35, z]))
  }
  return { lit: merge(lit), glow: null }
}

const emberbloom = (): PlantGeo => {
  const d = PLANT_BY_ID.emberbloom
  const lit: BufferGeometry[] = [...rosette(4, 0.13, 0.06, d.leaf, 0.3)]
  lit.push(P(rod(0.02, 0.24, 5), d.leaf, [0, 0.12, 0]))
  // Flame petals: tall, curling in.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const g = ell(0.045, 0.025, 0.13, 8, 5)
    xform(g, [0, 0, 0.06], [-1.15, 0, 0])
    xform(g, [0, 0.27, 0], [0, a, 0])
    lit.push(gradY(g, '#c8321a', '#ffb04a'))
  }
  const glow = [P(sph(0.05, 8, 6), '#ffe27a', [0, 0.31, 0])]
  return { lit: merge(lit), glow: merge(glow) }
}

const frostmint = (): PlantGeo => {
  const d = PLANT_BY_ID.frostmint
  const lit = [
    ...rosette(6, 0.12, 0.07, d.leaf, 0.55, 0.04),
    ...rosette(5, 0.1, 0.06, tone(d.leaf, 1.15), 0.95, 0.1, 0.4),
    ...rosette(4, 0.08, 0.05, d.bloom, 1.25, 0.17, 0.9)
  ]
  // Hoarfrost: little ice needles standing in the clump.
  for (const [x, z, h] of [[0.05, 0.02, 0.1], [-0.04, 0.05, 0.08], [0.01, -0.06, 0.09]] as const) lit.push(P(spike(0.012, h, 5), '#f0faff', [x, 0.16, z]))
  return { lit: merge(lit), glow: null }
}

const moonbell = (): PlantGeo => {
  const d = PLANT_BY_ID.moonbell
  const lit: BufferGeometry[] = [...rosette(4, 0.12, 0.05, d.leaf, 0.3)]
  // A stem that bows over, with three bells hanging from it.
  lit.push(P(limb(0.018, 0.014, 0.42, 6, 2), d.leaf, [0, 0.42, 0], [0, 0, 0.18]))
  const glow: BufferGeometry[] = []
  const bell = (): BufferGeometry => lathe([[0.002, 0], [0.05, -0.012], [0.058, -0.06], [0.04, -0.09], [0.002, -0.1]], 12)
  for (const [x, y, z, s] of [[-0.06, 0.4, 0.02, 1], [-0.11, 0.3, -0.05, 0.85], [-0.02, 0.32, 0.08, 0.8]] as const) {
    lit.push(xform(gradY(bell(), tone(d.bloom, 0.8), d.bloom), [x, y, z], [0, 0, 0], s))
    glow.push(P(sph(0.018 * s, 6, 4), '#f4ecff', [x, y - 0.085 * s, z]))
  }
  return { lit: merge(lit), glow: merge(glow) }
}

const shadowthorn = (): PlantGeo => {
  const d = PLANT_BY_ID.shadowthorn
  const lit: BufferGeometry[] = [P(ell(0.13, 0.08, 0.12, 10, 6), d.leaf, [0, 0.06, 0])]
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    const t = 0.5 + (i % 3) * 0.25
    const g = spike(0.022, 0.2 + (i % 2) * 0.08, 5)
    xform(g, [0, 0, 0], [t, 0, 0])
    xform(g, [0, 0.08, 0], [0, a, 0])
    lit.push(paint(g, i % 2 ? tone(d.leaf, 1.3) : d.leaf))
  }
  lit.push(P(ell(0.05, 0.07, 0.05, 8, 6), d.bloom, [0, 0.2, 0]))
  const glow = [P(sph(0.022, 6, 4), '#e8a8ff', [0, 0.27, 0])]
  return { lit: merge(lit), glow: merge(glow) }
}

const BUILD: Record<PlantId, () => PlantGeo> = { sunpetal, glowcap, swiftfern, ironmoss, emberbloom, frostmint, moonbell, shadowthorn }

const cache = new Map<PlantId, PlantGeo>()
/** A herb's geometry (built once, shared by every one of its kind). */
export const plantGeometry = (id: PlantId): PlantGeo => {
  let g = cache.get(id)
  if (!g) { g = BUILD[id](); cache.set(id, g) }
  return g
}

/**
 * A piece of the treasure map (roadmap #89), lying where it was dropped: a
 * rolled scrap of old paper tied with a red ribbon, a gold wax seal glowing on
 * it. Closed, rounded parts only, like the herbs.
 */
let pieceGeo: PlantGeo | null = null
export const mapPieceGeometry = (): PlantGeo => {
  if (pieceGeo) return pieceGeo
  const lit = [
    // The roll, lying on its side, its ends a little darker with age.
    P(rod(0.075, 0.46, 10), '#f2e2b8', [0, 0.08, 0], [0, 0, Math.PI / 2]),
    P(ell(0.06, 0.08, 0.08, 10, 8), '#d9c08a', [0.22, 0.08, 0]),
    P(ell(0.06, 0.08, 0.08, 10, 8), '#d9c08a', [-0.22, 0.08, 0]),
    // The ribbon round its middle (a ring fatter than the roll).
    P(rod(0.088, 0.06, 10), '#d8423a', [0, 0.08, 0], [0, 0, Math.PI / 2])
  ]
  pieceGeo = { lit: merge(lit), glow: P(sph(0.045, 10, 8), '#ffd24a', [0, 0.17, 0]) }
  return pieceGeo
}
