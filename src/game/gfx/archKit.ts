import { BufferGeometry, Color, Float32BufferAttribute, Matrix3, Matrix4, Uint32BufferAttribute, Vector3 } from 'three'

/**
 * ─── A mesher for buildings ──────────────────────────────────────────────────
 *
 * Characters and trees are made of the rounded primitives in `kit.ts`; a house
 * is planes: walls, roof slopes, beams, steps. Built from those primitives it
 * would come out pillowy (the old house was a cushion with a cone on it). So
 * buildings get their own small mesher: FLAT faces with one normal each, so
 * the cel ramp lays one clean tone on a wall and another on the next, and the
 * vertex colours carry the rest (shingle rows, stone courses, grime toward the
 * ground).
 *
 * Flat normals split at every edge, which would crack the inverted-hull
 * outline (it is pushed out along the normals). So the outline is drawn from a
 * SECOND geometry over the same positions whose normals are welded: averaged
 * over every face that meets at a corner (`welded`). Only the big forms go
 * into that hull (walls, roofs, chimneys); the small parts (beams, frames,
 * shutters) are drawn without one.
 *
 * Everything is accumulated straight into number arrays under a transform
 * stack, and comes out as ONE indexed geometry: a whole quarter of a town is
 * a single draw.
 */

const _c = new Color()
const cache = new Map<string, Color>()
/** A hex colour in linear space (cached). */
export const lc = (hex: string): Color => {
  let c = cache.get(hex)
  if (!c) { c = new Color(hex); cache.set(hex, c) }
  return c
}

export type Col = string | Color

const _v = new Vector3()
const _n = new Vector3()
const _a = new Vector3()
const _b = new Vector3()
const _d = new Vector3()

export class Mesher {
  /** Tests: record which builder made each vertex (`labels`), for the z-fight audit. Off in the game. */
  static trace = false
  labels: string[] = []
  /** Tests: the label the vertices being made now carry (set once per primitive). */
  tag = ''
  pos: number[] = []
  nor: number[] = []
  col: number[] = []
  idx: number[] = []
  private stack: Matrix4[] = []
  private m = new Matrix4()
  private nm = new Matrix3()

  get vertexCount(): number {
    return this.pos.length / 3
  }

  /** Concatenate the transform with a translation / rotation about Y (and optional scale). */
  push(x: number, y: number, z: number, ry = 0, s = 1): this {
    this.stack.push(this.m.clone())
    const t = new Matrix4().makeRotationY(ry).setPosition(x, y, z)
    if (s !== 1) t.scale(_v.set(s, s, s))
    this.m.multiply(t)
    this.nm.getNormalMatrix(this.m)
    return this
  }

  /** Concatenate an arbitrary matrix. */
  pushMatrix(t: Matrix4): this {
    this.stack.push(this.m.clone())
    this.m.multiply(t)
    this.nm.getNormalMatrix(this.m)
    return this
  }

  pop(): this {
    const m = this.stack.pop()
    if (m) this.m.copy(m)
    this.nm.getNormalMatrix(this.m)
    return this
  }

  private vert(x: number, y: number, z: number, nx: number, ny: number, nz: number, c: Color): number {
    if (Mesher.trace) this.labels.push(this.tag || caller())
    _v.set(x, y, z).applyMatrix4(this.m)
    _n.set(nx, ny, nz).applyMatrix3(this.nm).normalize()
    this.pos.push(_v.x, _v.y, _v.z)
    this.nor.push(_n.x, _n.y, _n.z)
    this.col.push(c.r, c.g, c.b)
    return this.pos.length / 3 - 1
  }

  /**
   * A flat quad, corners counter-clockwise seen from its front. One colour, or
   * one per corner (a gradient across the face).
   */
  quad(ax: number, ay: number, az: number, bx: number, by: number, bz: number, cx: number, cy: number, cz: number, dx: number, dy: number, dz: number, c: Col | [Col, Col, Col, Col]): this {
    _a.set(bx - ax, by - ay, bz - az)
    _b.set(dx - ax, dy - ay, dz - az)
    _d.crossVectors(_a, _b).normalize()
    const cs = Array.isArray(c) ? c.map(x => (typeof x === 'string' ? lc(x) : x)) : null
    const one = cs ? null : typeof c === 'string' ? lc(c) : (c as Color)
    const i0 = this.vert(ax, ay, az, _d.x, _d.y, _d.z, cs ? cs[0]! : one!)
    this.vert(bx, by, bz, _d.x, _d.y, _d.z, cs ? cs[1]! : one!)
    this.vert(cx, cy, cz, _d.x, _d.y, _d.z, cs ? cs[2]! : one!)
    this.vert(dx, dy, dz, _d.x, _d.y, _d.z, cs ? cs[3]! : one!)
    this.idx.push(i0, i0 + 1, i0 + 2, i0, i0 + 2, i0 + 3)
    return this
  }

  tri(ax: number, ay: number, az: number, bx: number, by: number, bz: number, cx: number, cy: number, cz: number, c: Col): this {
    _a.set(bx - ax, by - ay, bz - az)
    _b.set(cx - ax, cy - ay, cz - az)
    _d.crossVectors(_a, _b).normalize()
    const k = typeof c === 'string' ? lc(c) : c
    const i0 = this.vert(ax, ay, az, _d.x, _d.y, _d.z, k)
    this.vert(bx, by, bz, _d.x, _d.y, _d.z, k)
    this.vert(cx, cy, cz, _d.x, _d.y, _d.z, k)
    this.idx.push(i0, i0 + 1, i0 + 2)
    return this
  }

  /**
   * A box from (x0, y0, z0) to (x1, y1, z1) in the current frame. `c` is one
   * colour or per face; `bottom` darkens the foot of the side faces (grime).
   * Faces in `skip` ('t','b','n','s','e','w') are left out.
   */
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: Col | { top?: Col; side?: Col; front?: Col; back?: Col; east?: Col; west?: Col; bottom?: Col }, skip = 'b', foot?: Col): this {
    const f = (k: 'top' | 'front' | 'back' | 'east' | 'west' | 'bottom'): Col => {
      if (typeof c === 'string' || c instanceof Color) return c
      return (c as Record<string, Col | undefined>)[k] ?? c.side ?? c.top ?? '#ff00ff'
    }
    const g = (top: Col): Col | [Col, Col, Col, Col] => (foot ? [foot, foot, top, top] : top)
    if (!skip.includes('t')) this.quad(x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0, f('top'))
    if (!skip.includes('b')) this.quad(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1, f('bottom'))
    // South (+Z), north (−Z), east (+X), west (−X).
    if (!skip.includes('s')) this.quad(x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1, g(f('front')))
    if (!skip.includes('n')) this.quad(x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0, g(f('back')))
    if (!skip.includes('e')) this.quad(x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1, g(f('east')))
    if (!skip.includes('w')) this.quad(x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0, g(f('west')))
    return this
  }

  /** A box by centre and size. */
  cbox(x: number, y: number, z: number, w: number, h: number, d: number, c: Parameters<Mesher['box']>[6], skip = 'b', foot?: Col): this {
    return this.box(x - w / 2, y - h / 2, z - d / 2, x + w / 2, y + h / 2, z + d / 2, c, skip, foot)
  }

  /** A beam from point A to point B with a square section `s` (timber, rails, posts). */
  beam(ax: number, ay: number, az: number, bx: number, by: number, bz: number, s: number, c: Col, t = s): this {
    _a.set(bx - ax, by - ay, bz - az)
    const len = _a.length()
    if (len < 1e-4) return this
    _a.normalize()
    // A frame along the beam: x across, y up-ish, z along.
    const up = Math.abs(_a.y) > 0.95 ? _b.set(1, 0, 0) : _b.set(0, 1, 0)
    const xa = new Vector3().crossVectors(up, _a).normalize()
    const ya = new Vector3().crossVectors(_a, xa).normalize()
    const t4 = new Matrix4().makeBasis(xa, ya, _a).setPosition(ax, ay, az)
    this.pushMatrix(t4)
    this.box(-s / 2, -t / 2, 0, s / 2, t / 2, len, c, '')
    this.pop()
    return this
  }

  /**
   * A prism: a convex polygon in the XY plane (counter-clockwise) extruded
   * along Z from z0 to z1. Gables, roof slabs, steps, signs.
   */
  prism(pts: Array<[number, number]>, z0: number, z1: number, c: Col, side?: Col, caps = true): this {
    const n = pts.length
    if (caps) {
      for (let k = 1; k < n - 1; k++) {
        this.tri(pts[0]![0], pts[0]![1], z1, pts[k]![0], pts[k]![1], z1, pts[k + 1]![0], pts[k + 1]![1], z1, c)
        this.tri(pts[0]![0], pts[0]![1], z0, pts[k + 1]![0], pts[k + 1]![1], z0, pts[k]![0], pts[k]![1], z0, c)
      }
    }
    const sc = side ?? c
    for (let k = 0; k < n; k++) {
      const a = pts[k]!
      const b = pts[(k + 1) % n]!
      this.quad(a[0], a[1], z0, b[0], b[1], z0, b[0], b[1], z1, a[0], a[1], z1, sc)
    }
    return this
  }

  /** A cylinder along Y, flat-shaded sides (posts, barrels' staves, a well's ring). */
  cyl(x: number, y0: number, z: number, r0: number, r1: number, h: number, segs: number, c: Col, top?: Col, smooth = false): this {
    const k = typeof c === 'string' ? lc(c) : c
    for (let s = 0; s < segs; s++) {
      const a0 = (s / segs) * Math.PI * 2
      const a1 = ((s + 1) / segs) * Math.PI * 2
      if (smooth) {
        const i0 = this.pos.length / 3
        const ny = (r0 - r1) / h
        this.vert(x + Math.sin(a0) * r0, y0, z + Math.cos(a0) * r0, Math.sin(a0), ny, Math.cos(a0), k)
        this.vert(x + Math.sin(a1) * r0, y0, z + Math.cos(a1) * r0, Math.sin(a1), ny, Math.cos(a1), k)
        this.vert(x + Math.sin(a1) * r1, y0 + h, z + Math.cos(a1) * r1, Math.sin(a1), ny, Math.cos(a1), k)
        this.vert(x + Math.sin(a0) * r1, y0 + h, z + Math.cos(a0) * r1, Math.sin(a0), ny, Math.cos(a0), k)
        this.idx.push(i0, i0 + 1, i0 + 2, i0, i0 + 2, i0 + 3)
      } else {
        this.quad(x + Math.sin(a0) * r0, y0, z + Math.cos(a0) * r0, x + Math.sin(a1) * r0, y0, z + Math.cos(a1) * r0,
          x + Math.sin(a1) * r1, y0 + h, z + Math.cos(a1) * r1, x + Math.sin(a0) * r1, y0 + h, z + Math.cos(a0) * r1, k)
      }
      if (top) this.tri(x, y0 + h, z, x + Math.sin(a0) * r1, y0 + h, z + Math.cos(a0) * r1, x + Math.sin(a1) * r1, y0 + h, z + Math.cos(a1) * r1, top)
    }
    return this
  }

  /** A flat disc at height y (`down`: facing down, the open bottom end of a cylinder). */
  disc(x: number, y: number, z: number, r: number, segs: number, c: Col, down = false): this {
    for (let s = 0; s < segs; s++) {
      const a0 = (s / segs) * Math.PI * 2
      const a1 = ((s + 1) / segs) * Math.PI * 2
      if (down) this.tri(x, y, z, x + Math.sin(a1) * r, y, z + Math.cos(a1) * r, x + Math.sin(a0) * r, y, z + Math.cos(a0) * r, c)
      else this.tri(x, y, z, x + Math.sin(a0) * r, y, z + Math.cos(a0) * r, x + Math.sin(a1) * r, y, z + Math.cos(a1) * r, c)
    }
    return this
  }

  /** A low-poly ball (bushes, lamps, flowers, fruit), smooth normals. */
  ball(x: number, y: number, z: number, r: number, c: Col, ws = 6, hs = 4, sy = 1): this {
    const k = typeof c === 'string' ? lc(c) : c
    const base = this.pos.length / 3
    for (let j = 0; j <= hs; j++) {
      const v = j / hs
      const ph = v * Math.PI
      for (let i = 0; i <= ws; i++) {
        const th = (i / ws) * Math.PI * 2
        const nx = Math.sin(ph) * Math.sin(th)
        const ny = Math.cos(ph)
        const nz = Math.sin(ph) * Math.cos(th)
        this.vert(x + nx * r, y + ny * r * sy, z + nz * r, nx, ny / sy, nz, k)
      }
    }
    for (let j = 0; j < hs; j++) {
      for (let i = 0; i < ws; i++) {
        const a = base + j * (ws + 1) + i
        const b = a + ws + 1
        if (j > 0) this.idx.push(a, b, a + 1)
        if (j < hs - 1) this.idx.push(a + 1, b, b + 1)
      }
    }
    return this
  }

  /** Append another mesher's triangles (already in world space). */
  append(o: Mesher): this {
    const base = this.pos.length / 3
    // (A loop, not a spread: a town's worth of numbers overflows an argument list.)
    for (let i = 0; i < o.pos.length; i++) { this.pos.push(o.pos[i]!); this.nor.push(o.nor[i]!); this.col.push(o.col[i]!) }
    if (Mesher.trace) for (const l of o.labels) this.labels.push(l)
    for (const i of o.idx) this.idx.push(i + base)
    return this
  }

  /** Append a kit geometry (indexed, with colours), placed by the current transform. */
  geo(g: BufferGeometry): this {
    const p = g.attributes.position!
    const n = g.attributes.normal!
    const c = g.attributes.color
    const base = this.pos.length / 3
    for (let i = 0; i < p.count; i++) {
      _c.setRGB(c ? c.getX(i) : 1, c ? c.getY(i) : 1, c ? c.getZ(i) : 1)
      this.vert(p.getX(i), p.getY(i), p.getZ(i), n.getX(i), n.getY(i), n.getZ(i), _c)
    }
    const ix = g.index
    if (ix) for (let i = 0; i < ix.count; i++) this.idx.push(ix.getX(i) + base)
    else for (let i = 0; i < p.count; i++) this.idx.push(base + i)
    g.dispose()
    return this
  }

  get empty(): boolean {
    return this.idx.length === 0
  }

  build(): BufferGeometry {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3))
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3))
    g.setAttribute('color', new Float32BufferAttribute(this.col, 3))
    g.setIndex(new Uint32BufferAttribute(this.idx, 1))
    if (Mesher.trace) g.userData.labels = this.labels.slice()
    g.computeBoundingSphere()
    return g
  }

  /** The same positions with WELDED normals: the outline hull's geometry. */
  welded(): BufferGeometry {
    const sum = new Map<string, [number, number, number]>()
    const keys: string[] = []
    const P = this.pos
    const Nn = this.nor
    for (let i = 0; i < P.length; i += 3) {
      const key = `${Math.round(P[i]! * 200)},${Math.round(P[i + 1]! * 200)},${Math.round(P[i + 2]! * 200)}`
      keys.push(key)
      const s = sum.get(key)
      if (s) { s[0] += Nn[i]!; s[1] += Nn[i + 1]!; s[2] += Nn[i + 2]! } else sum.set(key, [Nn[i]!, Nn[i + 1]!, Nn[i + 2]!])
    }
    const nor = new Float32Array(P.length)
    for (let v = 0; v < keys.length; v++) {
      const s = sum.get(keys[v]!)!
      const l = Math.hypot(s[0], s[1], s[2]) || 1
      nor[v * 3] = s[0] / l
      nor[v * 3 + 1] = s[1] / l
      nor[v * 3 + 2] = s[2] / l
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3))
    g.setAttribute('normal', new Float32BufferAttribute(nor, 3))
    g.setIndex(new Uint32BufferAttribute(this.idx, 1))
    if (Mesher.trace) g.userData.labels = this.labels.slice()
    g.computeBoundingSphere()
    return g
  }
}

/** The first builder outside this file on the stack (`Mesher.trace`). */
const caller = (): string => {
  const lines = (new Error().stack ?? '').split('\n')
  for (const l of lines) {
    if (!l.includes(' at ') || l.includes('archKit')) continue
    const m = /at (\S+) .*?([A-Za-z]+\.ts):(\d+)/.exec(l)
    if (m) return `${m[1]}@${m[2]}:${m[3]}`
    const n = /([A-Za-z]+\.ts):(\d+)/.exec(l)
    if (n) return `${n[1]}:${n[2]}`
  }
  return '?'
}

/** The three layers a building is drawn in: forms with an outline, details without, and what glows. */
export interface Kit {
  hull: Mesher
  detail: Mesher
  glow: Mesher
}

export const newKit = (): Kit => ({ hull: new Mesher(), detail: new Mesher(), glow: new Mesher() })

/** Run `fn` with every layer of a kit under one more transform. */
export const under = (k: Kit, x: number, y: number, z: number, ry: number, fn: () => void, s = 1): void => {
  k.hull.push(x, y, z, ry, s)
  k.detail.push(x, y, z, ry, s)
  k.glow.push(x, y, z, ry, s)
  fn()
  k.hull.pop()
  k.detail.pop()
  k.glow.pop()
}

/** A lantern's cage round a glowing core: corner posts, a floor and a cap, the light showing between. */
export const cage = (k: Kit, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, metal: Col, light: Col): void => {
  const t = 0.028
  const d = k.detail
  // The plates stand proud of the posts, so no face of one lies in a face of the other.
  d.box(x0 - 0.012, y0, z0 - 0.012, x1 + 0.012, y0 + 0.04, z1 + 0.012, metal, '')
  d.box(x0 - 0.02, y1 - 0.04, z0 - 0.02, x1 + 0.02, y1, z1 + 0.02, metal, '')
  for (const [x, z] of [[x0, z0], [x1 - t, z0], [x0, z1 - t], [x1 - t, z1 - t]] as const) d.box(x, y0 + 0.04, z, x + t, y1 - 0.04, z + t, metal, 'tb')
  k.glow.box(x0 + 0.015, y0 + 0.04, z0 + 0.015, x1 - 0.015, y1 - 0.04, z1 - 0.015, light, 'b')
}

/** A seeded value stream for a building's variation. */
export const seeded = (seed: number): (() => number) => {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A colour nudged lighter or darker by `k` (0.9 = 10 % darker). */
export const shade = (hex: Col, k: number): Color => (typeof hex === 'string' ? new Color(hex) : hex.clone()).multiplyScalar(k)
