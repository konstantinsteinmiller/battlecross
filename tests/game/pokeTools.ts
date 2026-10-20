import { BufferGeometry, Matrix4, Vector3 } from 'three'
import type { Mesher } from '@/game/gfx/archKit'
import { partTrace, type TracedBox, type TracedPart } from '@/game/gfx/kit'

/**
 * ─── Poke-through: no part of a prop shows through another ───────────────────
 *
 * Tools for `pokeThrough.test.ts`. A prop is drawn as several primitives
 * merged into one mesh. Where two overlap, the one inside is hidden, and that
 * is what a joint is: a post sunk into rock, a beam through a post, a roof
 * through a chimney, a strap round a chest. The bug is a part coming out
 * where it should not: a rock heap out through the carved face of a slab, a
 * post through a sign board, a light shut inside its lantern.
 *
 * The parts are the renderer's own: with `kit.partTrace` on, every painted
 * part keeps the builder line that made it and every rounded box its size, a
 * merge keeps the vertex range of each part in it, the building mesher keeps
 * each primitive's start and each box's frame, and `installFrameTrace` carries
 * a kit box's frame through every transform its geometry is given (`xform`,
 * `translate`, `rotateX`, a mesh's world matrix). Every box is held against
 * every other part of its prop, in the box's own frame. A panel is a thin
 * box with a face to show on either side: a board, a slab, a sign, a deck,
 * a door, a pane. Anything thick may be passed through (that is a joint).
 *   • through: an edge of the other part crosses a panel from one show face
 *     to the other (a post up through a board's rim is the board slotted on
 *     it, and no hit);
 *   • deep: a vertex of the other part sits in a panel beyond its middle,
 *     seen from the side the part stands on: it is about to come out of the
 *     far face (the vertices of a rock are too sparse to catch it crossing);
 *   • swallowed: every vertex of the other part lies inside the box, so it
 *     is never seen.
 * A box whose own vertices do not fit its traced frame (a builder that bent
 * it after making it) is not checked; `frameMisses` counts those.
 */

/** How far (m) past a box's skin counts: rounding, a nail's head. */
export const TOL = 0.02
/** A panel: its thickness at most `PANEL_K` of its next side and at most `PANEL_T` m, and that
 *  side at least `PANEL_W` m (narrower, it is a rail, a strap, a trim: a stick, not a face). */
export const PANEL_K = 0.4
export const PANEL_T = 0.4
export const PANEL_W = 0.25

/** One part: who made it, its vertices in the world (v0..v1), its triangles, and its box if it is one. */
export interface Part {
  label: string
  pos: ArrayLike<number>
  v0: number
  v1: number
  /** Vertex indices, three per triangle; the triangles starting in v0..v1 are this part's. */
  idx: ArrayLike<number> | null
  box?: { inv: Matrix4; lo: [number, number, number]; hi: [number, number, number]; e?: number }
}

const _m = new Matrix4()
const _f = new Matrix4()

/**
 * Carry every traced box's frame through the transforms applied to its
 * geometry (`userData.frame`, and each merged part's), and turn `partTrace`
 * on. `userData` is shared by a clone, so it is replaced, never changed in
 * place. Returns the undo.
 */
export const installFrameTrace = (): (() => void) => {
  const proto = BufferGeometry.prototype
  const orig = proto.applyMatrix4
  proto.applyMatrix4 = function (this: BufferGeometry, m: Matrix4) {
    orig.call(this, m)
    const u = this.userData
    if (!u.box && !u.parts) return this
    const move = (f?: number[]): number[] => _m.copy(m).multiply(f ? _f.fromArray(f) : _f.identity()).toArray()
    const next = { ...u }
    if (u.box) next.frame = move(u.frame as number[] | undefined)
    if (u.parts) next.parts = (u.parts as TracedPart[]).map(p => (p.box ? { ...p, frame: move(p.frame) } : p))
    this.userData = next
    return this
  }
  partTrace.on = true
  return () => {
    proto.applyMatrix4 = orig
    partTrace.on = false
  }
}

/** A builder label without its line: `fn@file.ts`. */
export const who = (label: string): string => label.replace(/:\d+$/, '')

const boxOf = (b: TracedBox, frame?: number[]): NonNullable<Part['box']> => ({
  inv: (frame ? new Matrix4().fromArray(frame) : new Matrix4()).invert(),
  lo: [-b.hx, -b.hy, -b.hz],
  hi: [b.hx, b.hy, b.hz],
  e: b.e
})

/** The parts of a kit geometry already in the world (merged, or one primitive). */
export const partsOfGeo = (g: BufferGeometry, fallback = 'geo'): Part[] => {
  const pos = g.attributes.position!.array
  const n = g.attributes.position!.count
  const idx = g.index?.array ?? null
  const traced = g.userData.parts as TracedPart[] | undefined
  if (traced) return traced.map(p => ({ label: p.label, pos, idx, v0: p.start, v1: p.start + p.count, box: p.box ? boxOf(p.box, p.frame) : undefined }))
  const box = g.userData.box as TracedBox | undefined
  return [{ label: (g.userData.label as string | undefined) ?? fallback, pos, idx, v0: 0, v1: n, box: box ? boxOf(box, g.userData.frame as number[] | undefined) : undefined }]
}

/**
 * The parts of a building mesher (`partTrace`): each box it made (a kit box
 * it took in by `geo` among them), and each other primitive (`Mesher.starts`).
 */
export const partsOfMesher = (m: Mesher): Part[] => {
  const out: Part[] = []
  const pos = m.pos
  const idx = m.idx
  const n = m.vertexCount
  // The primitive of each vertex, from where each one starts.
  const prim = new Int32Array(n).fill(-1)
  m.starts.forEach((s, k) => { const end = m.starts[k + 1]?.v ?? n; for (let v = s.v; v < end; v++) prim[v] = k })
  const name = (v: number): string => m.starts[prim[v]!]?.label ?? '?'
  const inBox = new Uint8Array(n)
  for (const b of m.boxes) {
    for (let v = b.v0; v < b.v1; v++) inBox[v] = 1
    out.push({ label: name(b.v0), pos, idx, v0: b.v0, v1: b.v1, box: { inv: b.inv, lo: b.lo, hi: b.hi, e: b.e } })
  }
  // The rest: one part per primitive (what of it is not a box).
  let s = -1
  for (let v = 0; v <= n; v++) {
    const brk = v === n || inBox[v] || (s >= 0 && prim[v] !== prim[s])
    if (s >= 0 && brk) { out.push({ label: name(s), pos, idx, v0: s, v1: v }); s = -1 }
    if (v < n && !inBox[v] && s < 0) s = v
  }
  return out
}

export type HitRule = 'deep' | 'through' | 'swallowed'
export interface Hit {
  rule: HitRule
  box: string
  part: string
  /** The box's size (cm, its own axes), and the other part's extent in the box's frame (cm): what a joint names. */
  boxSize: string
  partSize: string
  at: [number, number, number]
}

const cm = (v: number): number => Math.round(v * 100)

/** Inside a (rounded) box shrunk by `t` on every side? */
const inside = (b: NonNullable<Part['box']>, l: Vector3, t: number): boolean => {
  const cx = (b.lo[0] + b.hi[0]) / 2, cy = (b.lo[1] + b.hi[1]) / 2, cz = (b.lo[2] + b.hi[2]) / 2
  const hx = (b.hi[0] - b.lo[0]) / 2 - t, hy = (b.hi[1] - b.lo[1]) / 2 - t, hz = (b.hi[2] - b.lo[2]) / 2 - t
  if (hx <= 0 || hy <= 0 || hz <= 0) return false
  const ax = Math.abs(l.x - cx) / hx, ay = Math.abs(l.y - cy) / hy, az = Math.abs(l.z - cz) / hz
  if (ax >= 1 || ay >= 1 || az >= 1) return false
  // A rounded kit box is the superellipsoid |x|^(2/e) + |y|^(2/e) + |z|^(2/e) = 1.
  if (b.e === undefined || b.e <= 0.13) return true
  const p = 2 / b.e
  return ax ** p + ay ** p + az ** p < 1
}

const _v = new Vector3()

/** Does a box's own geometry fit its traced frame (no builder bent it after)? */
export const frameFits = (p: Part): boolean => {
  const b = p.box!
  for (let v = p.v0; v < p.v1; v++) {
    _v.set(p.pos[v * 3]!, p.pos[v * 3 + 1]!, p.pos[v * 3 + 2]!).applyMatrix4(b.inv)
    if (_v.x < b.lo[0] - 0.01 || _v.x > b.hi[0] + 0.01 || _v.y < b.lo[1] - 0.01 || _v.y > b.hi[1] + 0.01 || _v.z < b.lo[2] - 0.01 || _v.z > b.hi[2] + 0.01) return false
  }
  return true
}

/** Each part's edges, as vertex pairs (from its triangles). */
const edgesOf = (p: Part): number[] => {
  const out: number[] = []
  const ix = p.idx
  if (ix) {
    for (let t = 0; t + 2 < ix.length; t += 3) {
      const a = ix[t]!
      if (a < p.v0 || a >= p.v1) continue
      const b = ix[t + 1]!, c = ix[t + 2]!
      out.push(a, b, b, c, c, a)
    }
  } else {
    for (let a = p.v0; a + 2 < p.v1; a += 3) out.push(a, a + 1, a + 1, a + 2, a + 2, a)
  }
  return out
}

/** Every poke-through among one prop's parts. */
export const pokes = (parts: readonly Part[]): { hits: Hit[]; frameMisses: number } => {
  const hits: Hit[] = []
  let frameMisses = 0
  const bounds = parts.map((p) => {
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]
    for (let v = p.v0; v < p.v1; v++) for (let a = 0; a < 3; a++) { const c = p.pos[v * 3 + a]!; if (c < lo[a]!) lo[a] = c; if (c > hi[a]!) hi[a] = c }
    return { lo, hi }
  })
  const edges: Array<number[] | null> = parts.map(() => null)
  parts.forEach((B, bi) => {
    const b = B.box
    if (!b || B.v1 - B.v0 < 4) return
    if (!frameFits(B)) { frameMisses++; return }
    const size = [0, 1, 2].map(a => b.hi[a]! - b.lo[a]!)
    const order = [0, 1, 2].sort((p, q) => size[p]! - size[q]!)
    const thin = order[0]!
    const panel = size[thin]! <= PANEL_K * size[order[1]!]! && size[thin]! <= PANEL_T && size[order[1]!]! >= PANEL_W
    const mid = (b.lo[thin]! + b.hi[thin]!) / 2
    const bb = bounds[bi]!
    parts.forEach((I, ii) => {
      if (ii === bi || I.v1 - I.v0 < 3) return
      const ib = bounds[ii]!
      for (let a = 0; a < 3; a++) if (ib.lo[a]! > bb.hi[a]! || ib.hi[a]! < bb.lo[a]!) return
      // The part in the box's frame.
      const n = I.v1 - I.v0
      const loc = new Float32Array(n * 3)
      const elo = [Infinity, Infinity, Infinity], ehi = [-Infinity, -Infinity, -Infinity]
      let inCount = 0, side = 0
      for (let v = 0; v < n; v++) {
        const k = (I.v0 + v) * 3
        _v.set(I.pos[k]!, I.pos[k + 1]!, I.pos[k + 2]!).applyMatrix4(b.inv)
        loc[v * 3] = _v.x; loc[v * 3 + 1] = _v.y; loc[v * 3 + 2] = _v.z
        for (let a = 0; a < 3; a++) { const c = loc[v * 3 + a]!; if (c < elo[a]!) elo[a] = c; if (c > ehi[a]!) ehi[a] = c }
        side += loc[v * 3 + thin]! - mid
        if (inside(b, _v, TOL)) inCount++
      }
      const at = (v: number): [number, number, number] => [I.pos[(I.v0 + v) * 3]!, I.pos[(I.v0 + v) * 3 + 1]!, I.pos[(I.v0 + v) * 3 + 2]!]
      const hit = (rule: HitRule, v: number): void => {
        hits.push({ rule, box: B.label, part: I.label, boxSize: size.map(cm).join('x'), partSize: [0, 1, 2].map(a => cm(ehi[a]! - elo[a]!)).join('x'), at: at(v) })
      }
      if (inCount === n && n >= 4) return hit('swallowed', 0)
      if (!panel) return
      // Through: an edge from past one show face to past the other, crossing within the face.
      const lo = b.lo[thin]! - TOL, hi = b.hi[thin]! + TOL
      const o1 = (thin + 1) % 3, o2 = (thin + 2) % 3
      const es = edges[ii] ?? (edges[ii] = edgesOf(I))
      for (let e = 0; e < es.length; e += 2) {
        const p = es[e]! - I.v0, q = es[e + 1]! - I.v0
        if (p < 0 || q < 0 || p >= n || q >= n) continue
        const pa = loc[p * 3 + thin]!, qa = loc[q * 3 + thin]!
        if (!((pa < lo && qa > hi) || (qa < lo && pa > hi))) continue
        const t = (mid - pa) / (qa - pa)
        const c1 = loc[p * 3 + o1]! + (loc[q * 3 + o1]! - loc[p * 3 + o1]!) * t
        const c2 = loc[p * 3 + o2]! + (loc[q * 3 + o2]! - loc[p * 3 + o2]!) * t
        if (c1 > b.lo[o1]! + TOL && c1 < b.hi[o1]! - TOL && c2 > b.lo[o2]! + TOL && c2 < b.hi[o2]! - TOL) return hit('through', p)
      }
      // Deep: past a panel's middle, from the side the part stands on.
      if (!inCount) return
      const s = Math.sign(side)
      for (let v = 0; v < n; v++) {
        _v.set(loc[v * 3]!, loc[v * 3 + 1]!, loc[v * 3 + 2]!)
        if (s && (loc[v * 3 + thin]! - mid) * s < 0 && inside(b, _v, TOL)) return hit('deep', v)
      }
    })
  })
  return { hits, frameMisses }
}

/**
 * An intended joint: a part of builder `part` may meet a box of builder `box`
 * (labels without lines, `who`), by `rule`; `boxSize` / `partSize` narrow it
 * to one pair (cm, `Hit`; `*` for any one number). `why` says what it is.
 */
export interface Joint { box: string; part: string; rule?: HitRule; boxSize?: string; partSize?: string; why: string }

const sizeMatch = (pat: string | undefined, s: string): boolean => {
  if (!pat) return true
  const a = pat.split('x'), b = s.split('x')
  return a.length === b.length && a.every((p, k) => p === '*' || p === b[k])
}

/** The joint a hit is, if it is one. */
export const jointOf = (joints: readonly Joint[], h: Hit): Joint | undefined =>
  joints.find(j => (!j.rule || j.rule === h.rule) && j.box === who(h.box) && j.part === who(h.part) && sizeMatch(j.boxSize, h.boxSize) && sizeMatch(j.partSize, h.partSize))
