import { ClampToEdgeWrapping, Color, DataTexture, LinearFilter, RedFormat, UnsignedByteType } from 'three'
import { CELL } from '../sim/grid'

/**
 * ─── The haze at the edge of the walkable world (roadmap #83) ────────────────
 *
 * Past where the hero can walk the land darkens, so the eye stays on the
 * playfield. It used to darken in steps a player could see as a contour: the
 * distance stopped counting at four cells and jumped, two ground meshes met
 * shaded apart, and the scenery stood fully lit on darkened ground.
 *
 * Now it is one field: the distance (metres) from every spot to the walkable
 * area, round (chamfer 1 / √2 on half cells) and softened by two box blurs,
 * stored in a small texture with linear filtering. The ground, the land
 * beyond, the scenery and the scenery's outlines all read it (`cel.ts`
 * EDGE_FOG) and sink by the same easing into the same dusk colour: a fog of war
 * with no line in it.
 */

/** Samples per cell. */
export const EDGE_SUB = 2
/** The field's top value (m): past it, the haze is the same. */
export const EDGE_MAX = 24
/** Where the haze begins and where it is full (m past the walkable edge). */
export const EDGE_FROM = 0.5
export const EDGE_TO = 10
/** How far into the haze colour it goes at full depth. */
export const EDGE_STRENGTH = 0.74

export interface EdgeField {
  /** Metres to the walkable area, per sample (row-major, z rows). */
  data: Float32Array
  nx: number
  nz: number
  /** The world corner of the first sample's square, and one sample's size (m). */
  x0: number
  z0: number
  step: number
}

/** The haze's depth at `d` metres past the walkable edge (0..EDGE_STRENGTH). */
export const edgeHaze = (d: number): number => {
  const t = Math.max(0, Math.min(1, (d - EDGE_FROM) / (EDGE_TO - EDGE_FROM)))
  return EDGE_STRENGTH * t * t * (3 - 2 * t)
}

/** The dusk a theme's edge sinks into: its own rim colour, deep. */
export const edgeColour = (rim: string): string => '#' + new Color(rim).multiplyScalar(0.55).getHexString()

/**
 * The distance field over a grid of `w` × `h` cells and `margin` cells round
 * it (outside the grid nothing is walkable).
 */
export const edgeField = (walkable: (i: number, j: number) => boolean, w: number, h: number, margin: number): EdgeField => {
  const step = CELL / EDGE_SUB
  const nx = (w + margin * 2) * EDGE_SUB
  const nz = (h + margin * 2) * EDGE_SUB
  const x0 = -margin * CELL
  const z0 = -margin * CELL
  const d = new Float32Array(nx * nz)
  const far = 1e9
  for (let b = 0; b < nz; b++) {
    const j = Math.floor(b / EDGE_SUB) - margin
    for (let a = 0; a < nx; a++) {
      const i = Math.floor(a / EDGE_SUB) - margin
      d[b * nx + a] = i >= 0 && j >= 0 && i < w && j < h && walkable(i, j) ? 0 : far
    }
  }
  // Chamfer: forward then backward, straight steps and diagonal ones.
  const s1 = step
  const s2 = step * Math.SQRT2
  const relax = (k: number, n: number, c: number): void => { const v = d[n]! + c; if (v < d[k]!) d[k] = v }
  for (let b = 0; b < nz; b++) {
    for (let a = 0; a < nx; a++) {
      const k = b * nx + a
      if (a > 0) relax(k, k - 1, s1)
      if (b > 0) {
        relax(k, k - nx, s1)
        if (a > 0) relax(k, k - nx - 1, s2)
        if (a < nx - 1) relax(k, k - nx + 1, s2)
      }
    }
  }
  for (let b = nz - 1; b >= 0; b--) {
    for (let a = nx - 1; a >= 0; a--) {
      const k = b * nx + a
      if (a < nx - 1) relax(k, k + 1, s1)
      if (b < nz - 1) {
        relax(k, k + nx, s1)
        if (a < nx - 1) relax(k, k + nx + 1, s2)
        if (a > 0) relax(k, k + nx - 1, s2)
      }
    }
  }
  // From the centres of walkable samples to their edge: half a sample less.
  for (let k = 0; k < d.length; k++) d[k] = Math.min(EDGE_MAX, Math.max(0, d[k]! > 0 ? d[k]! - step / 2 : 0))
  // Two box blurs: the chamfer's eight directions leave faint facets.
  const tmp = new Float32Array(d.length)
  for (let pass = 0; pass < 2; pass++) {
    for (let b = 0; b < nz; b++) {
      for (let a = 0; a < nx; a++) {
        let t = 0
        let n = 0
        for (let db = -1; db <= 1; db++) {
          const bb = b + db
          if (bb < 0 || bb >= nz) continue
          for (let da = -1; da <= 1; da++) {
            const aa = a + da
            if (aa < 0 || aa >= nx) continue
            t += d[bb * nx + aa]!
            n++
          }
        }
        tmp[b * nx + a] = t / n
      }
    }
    d.set(tmp)
  }
  return { data: d, nx, nz, x0, z0, step }
}

/** The field as a texture the shaders sample (red: metres / EDGE_MAX). */
export const edgeTexture = (f: EdgeField): DataTexture => {
  const px = new Uint8Array(f.nx * f.nz)
  for (let k = 0; k < px.length; k++) px[k] = Math.round((f.data[k]! / EDGE_MAX) * 255)
  const t = new DataTexture(px, f.nx, f.nz, RedFormat, UnsignedByteType)
  t.magFilter = LinearFilter
  t.minFilter = LinearFilter
  t.wrapS = ClampToEdgeWrapping
  t.wrapT = ClampToEdgeWrapping
  t.generateMipmaps = false
  t.needsUpdate = true
  return t
}
