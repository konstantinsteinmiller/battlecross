import {
  BufferGeometry, SphereGeometry, CapsuleGeometry, LatheGeometry, TorusGeometry, CylinderGeometry,
  Vector2, Vector3, Matrix4, Quaternion, Euler, Float32BufferAttribute, Uint16BufferAttribute,
  Bone, Skeleton, SkinnedMesh, Group, Color, Mesh, type Material
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js'
import { rigToon, rigGlow, outlineMat, OUTLINE_WIDTH, type CelMaterial } from './cel'
import type { MeshBasicMaterial } from 'three'

/**
 * ─── Rounded low-poly kit ────────────────────────────────────────────────────
 *
 * The art direction is "low poly but never cubey": every body part is a
 * sphere, capsule, torus or lathe at a modest segment count, with SMOOTH
 * normals so the cel ramp draws one clean terminator across it. Hard-edged primitives
 * (boxes, capped cylinders) are avoided on purpose — their split normals also
 * crack the inverted-hull outline at every edge.
 *
 * All helpers return indexed geometry WITHOUT uvs, so any mix of them merges.
 */

export const stripUv = <T extends BufferGeometry>(g: T): T => {
  g.deleteAttribute('uv')
  return g
}

export const sph = (r: number, ws = 14, hs = 10): BufferGeometry =>
  stripUv(new SphereGeometry(r, ws, hs))

/** Ellipsoid — a sphere with per-axis radii. Normals are recomputed after the
 *  non-uniform scale so the shading stays correct. */
export const ell = (rx: number, ry: number, rz: number, ws = 14, hs = 10): BufferGeometry => {
  const g = new SphereGeometry(1, ws, hs)
  g.scale(rx, ry, rz)
  g.computeVertexNormals()
  return stripUv(g)
}

/** Partial sphere (dome). `thetaLen` is the polar angle covered from the top. */
export const dome = (r: number, thetaLen = Math.PI / 2, ws = 16, hs = 8): BufferGeometry =>
  stripUv(new SphereGeometry(r, ws, hs, 0, Math.PI * 2, 0, thetaLen))

/** Capsule along Y; `len` is the straight middle section. */
export const cap = (r: number, len: number, rs = 12, cs = 4): BufferGeometry =>
  stripUv(new CapsuleGeometry(r, Math.max(0.0001, len), cs, rs))

export const torus = (R: number, r: number, rs = 8, ts = 20, arc = Math.PI * 2): BufferGeometry =>
  stripUv(new TorusGeometry(R, r, rs, ts, arc))

/** Open cylinder (no caps) — only for parts whose ends are hidden. */
export const tube = (rt: number, rb: number, h: number, rs = 14): BufferGeometry =>
  stripUv(new CylinderGeometry(rt, rb, h, rs, 1, true))

/** Lathe from a profile of `[radius, y]` points, bottom to top. */
export const lathe = (pts: Array<[number, number]>, segs = 16): BufferGeometry => {
  const g = new LatheGeometry(pts.map(([r, y]) => new Vector2(Math.max(0, r), y)), segs)
  return stripUv(g)
}

/** Arc points from angle a0 to a1 around (cx, cy), radius r, for lathe profiles. */
const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n: number): Array<[number, number]> => {
  const out: Array<[number, number]> = []
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * (i / n)
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
  return out
}

/**
 * Rounded cylinder along Y: straight side with a quarter-round bevel into each
 * flat cap. The workhorse of the "machine but friendly" look — cannons, cans,
 * pads, joints. `bevel` ≤ min(r, h/2).
 */
export const rcyl = (r: number, h: number, bevel = 0.3 * r, segs = 16, bevelSteps = 3): BufferGeometry => {
  const b = Math.min(bevel, r * 0.99, h / 2 * 0.99)
  const y0 = -h / 2
  const y1 = h / 2
  const pts: Array<[number, number]> = [[0, y0]]
  pts.push(...arc(r - b, y0 + b, b, -Math.PI / 2, 0, bevelSteps))
  pts.push(...arc(r - b, y1 - b, b, 0, Math.PI / 2, bevelSteps))
  pts.push([0, y1])
  return lathe(pts, segs)
}

/** Rounded cone/frustum (flared cuffs, nozzles, helmets' lower rims). */
export const rcone = (rb: number, rt: number, h: number, bevel = 0.04, segs = 16): BufferGeometry => {
  const b = Math.min(bevel, rb * 0.5, rt * 0.5 + 0.001, h / 2 * 0.9)
  const pts: Array<[number, number]> = [[0, -h / 2]]
  pts.push(...arc(rb - b, -h / 2 + b, b, -Math.PI / 2, 0, 2))
  pts.push(...arc(Math.max(b, rt - b), h / 2 - b, b, 0, Math.PI / 2, 2))
  pts.push([0, h / 2])
  return lathe(pts, segs)
}

/**
 * Rounded box — a superellipsoid-ish lathe won't do for boxes, so this builds
 * a box from a sphere by pushing vertices toward the box surface. The result
 * has continuous normals (no hull cracks) and reads as "pillowy machine block".
 */
export const rbox = (w: number, h: number, d: number, round = 0.35, ws = 16, hs = 12): BufferGeometry => {
  const g = new SphereGeometry(1, ws, hs)
  const pos = g.attributes.position!
  const v = new Vector3()
  // Exponent < 1 squares the sphere; `round` = 1 keeps it a sphere.
  const e = Math.max(0.12, Math.min(1, round))
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const sx = Math.sign(v.x) * Math.pow(Math.abs(v.x), e)
    const sy = Math.sign(v.y) * Math.pow(Math.abs(v.y), e)
    const sz = Math.sign(v.z) * Math.pow(Math.abs(v.z), e)
    pos.setXYZ(i, sx * w / 2, sy * h / 2, sz * d / 2)
  }
  g.computeVertexNormals()
  return stripUv(g)
}

/**
 * `rbox` cut along one of its latitude rings into two pieces: rows 0..k (the
 * top cap) and rows k..hs (the rest). A superellipsoid ring is flat, so the
 * cut is a clean plane, and both pieces take their positions AND normals from
 * the whole box — put back together they shade pixel-for-pixel like
 * `rbox(w, h, d, round, ws, hs)`, with no line where they meet (normals
 * recomputed per piece would band the toon ramp along the cut). The crate
 * golem's lid is invisible until it opens. `y` is the cut's height, `halfD`
 * the ring's half-depth (where a back hinge goes).
 */
export const rboxSplit = (
  w: number, h: number, d: number, round = 0.35, k = 4, ws = 16, hs = 12
): { top: BufferGeometry; bottom: BufferGeometry; y: number; halfD: number } => {
  const whole = rbox(w, h, d, round, ws, hs)
  const wp = whole.attributes.position!
  const wn = whole.attributes.normal!
  const row = ws + 1
  // A partial sphere for the index layout; every vertex is then the whole's
  const piece = (first: number, rows: number): BufferGeometry => {
    const g = new SphereGeometry(1, ws, rows, 0, Math.PI * 2, (first * Math.PI) / hs, (rows * Math.PI) / hs)
    const pos = g.attributes.position!
    const nor = g.attributes.normal!
    for (let i = 0; i < pos.count; i++) {
      const src = first * row + i
      pos.setXYZ(i, wp.getX(src), wp.getY(src), wp.getZ(src))
      nor.setXYZ(i, wn.getX(src), wn.getY(src), wn.getZ(src))
    }
    return stripUv(g)
  }
  let halfD = 0
  for (let ix = 0; ix < row; ix++) halfD = Math.max(halfD, Math.abs(wp.getZ(k * row + ix)))
  const out = { top: piece(0, k), bottom: piece(k, hs - k), y: wp.getY(k * row), halfD }
  whole.dispose()
  return out
}

/**
 * A rounded rock: a low sphere with seeded bumps, a little flattened so it
 * lies like a stone. Smooth normals (a boulder, never a gem). Coincident seam
 * and pole vertices get the same bump, so the surface cannot crack open.
 * Same seed, same rock.
 */
export const rock = (r: number, seed = 1, ws = 9, hs = 7): BufferGeometry => {
  const g = new SphereGeometry(1, ws, hs)
  const pos = g.attributes.position!
  let st = (Math.imul(seed | 0, 2654435761) >>> 0) || 1
  const bumps = new Map<string, number>()
  const keys: string[] = []
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const key = `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`
    keys.push(key)
    let k = bumps.get(key)
    if (k === undefined) {
      st = (Math.imul(st, 1664525) + 1013904223) >>> 0
      k = 0.84 + 0.3 * (st / 4294967296)
      bumps.set(key, k)
    }
    pos.setXYZ(i, x * r * k, y * r * k * 0.8, z * r * k)
  }
  g.computeVertexNormals()
  // Weld the normals of coincident vertices too, or the outline hull (pushed
  // out along them) splits open along the seam
  const nor = g.attributes.normal!
  const sum = new Map<string, Vector3>()
  for (let i = 0; i < pos.count; i++) {
    const v = sum.get(keys[i]!) ?? new Vector3()
    v.x += nor.getX(i)
    v.y += nor.getY(i)
    v.z += nor.getZ(i)
    sum.set(keys[i]!, v)
  }
  for (let i = 0; i < pos.count; i++) {
    const v = sum.get(keys[i]!)!
    const l = v.length() || 1
    nor.setXYZ(i, v.x / l, v.y / l, v.z / l)
  }
  return stripUv(g)
}

/**
 * The front half of an ellipsoid (facing +Z), open at the back: eyes, lids,
 * cheeks, a mouth — anything that sits ON a head and whose back nobody sees.
 * Half the triangles of `ell`.
 */
export const lens = (rx: number, ry: number, rz: number, ws = 6, hs = 5): BufferGeometry => {
  const g = new SphereGeometry(1, ws, hs, 0, Math.PI)
  g.scale(rx, ry, rz)
  g.computeVertexNormals()
  return stripUv(g)
}

/**
 * A tapered limb hanging from its joint: a rounded tube from y = 0 (radius
 * `r0`) down to y = −len (radius `r1`), both ends capped by a hemisphere, so
 * the joint above and the joint below are covered whichever way it bends.
 */
export const limb = (r0: number, r1: number, len: number, rs = 8, cs = 2): BufferGeometry => {
  const pts: Array<[number, number]> = []
  pts.push(...arc(0, -len, r1, -Math.PI / 2, 0, cs))
  pts.push(...arc(0, 0, r0, 0, Math.PI / 2, cs))
  return lathe(pts, rs)
}

/**
 * A blade along +Z from the guard (z = 0) to its point (z = len): a flattened
 * leaf that swells a little past the guard and tapers to the tip.
 */
export const blade = (len: number, width: number, thick: number, belly = 0.72, segs = 6): BufferGeometry => {
  const w = width / 2
  const g = lathe([[0, 0], [w * 0.86, 0.004], [w, len * 0.2], [w * 0.9, len * belly], [w * 0.5, len * 0.93], [0, len]], segs)
  // `scale` carries the normals with it; recomputing them would split the seam.
  g.scale(1, 1, thick / width)
  g.rotateX(Math.PI / 2)
  return g
}

/** A cheap cone along Y, base (radius `rb`) at −len/2, point at +len/2: horns,
 *  spikes, tufts. A third of `rcone`'s triangles. */
export const spike = (rb: number, len: number, rs = 5): BufferGeometry =>
  lathe([[0, -len / 2], [rb, -len / 2 + rb * 0.35], [rb * 0.42, len * 0.12], [0, len / 2]], rs)

/** A cheap rounded rod along Y (grips, hafts, shafts): four rings, no bevel steps. */
export const rod = (r: number, len: number, rs = 5): BufferGeometry =>
  lathe([[0, -len / 2], [r, -len / 2 + r * 0.6], [r, len / 2 - r * 0.6], [0, len / 2]], rs)

// ─── Colour helpers ──────────────────────────────────────────────────────────

const _c1 = new Color()
const _c2 = new Color()

/** A colour made darker (k < 1) or lighter (k > 1). */
export const tone = (hex: string, k: number): string => {
  _c1.set(hex)
  _c1.setRGB(Math.min(1, _c1.r * k), Math.min(1, _c1.g * k), Math.min(1, _c1.b * k))
  return '#' + _c1.getHexString()
}

/** `a` blended toward `b` by t (0..1). */
export const mixHex = (a: string, b: string, t: number): string => {
  _c1.set(a)
  _c2.set(b)
  return '#' + _c1.lerp(_c2, t).getHexString()
}

/**
 * Paint a geometry with a vertical gradient (`bottom` at its lowest vertex,
 * `top` at its highest): cloth that darkens toward the hem, hair that catches
 * the light on top. Called BEFORE the part is placed, in its own space.
 */
export const gradY = (g: BufferGeometry, bottom: string, top: string): BufferGeometry => {
  const pos = g.attributes.position!
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    if (y < lo) lo = y
    if (y > hi) hi = y
  }
  const a = new Color(bottom)
  const b = new Color(top)
  const arr = new Float32Array(pos.count * 3)
  const span = Math.max(1e-5, hi - lo)
  for (let i = 0; i < pos.count; i++) {
    const k = (pos.getY(i) - lo) / span
    arr[i * 3] = a.r + (b.r - a.r) * k
    arr[i * 3 + 1] = a.g + (b.g - a.g) * k
    arr[i * 3 + 2] = a.b + (b.b - a.b) * k
  }
  g.setAttribute('color', new Float32BufferAttribute(arr, 3))
  return g
}

// ─── Transform helpers ───────────────────────────────────────────────────────

export type V3 = [number, number, number]

const _m = new Matrix4()
const _q = new Quaternion()
const _e = new Euler()
const _p = new Vector3()
const _s = new Vector3()

export const xform = (g: BufferGeometry, p: V3 = [0, 0, 0], r: V3 = [0, 0, 0], s: V3 | number = 1): BufferGeometry => {
  _e.set(r[0], r[1], r[2])
  _q.setFromEuler(_e)
  _p.set(p[0], p[1], p[2])
  if (typeof s === 'number') _s.set(s, s, s)
  else _s.set(s[0], s[1], s[2])
  _m.compose(_p, _q, _s)
  g.applyMatrix4(_m)
  return g
}

/** Paint a whole geometry one colour (linear-space vertex colours). */
export const paint = (g: BufferGeometry, hex: string | Color): BufferGeometry => {
  const c = typeof hex === 'string' ? new Color(hex) : hex
  const n = g.attributes.position!.count
  const arr = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r
    arr[i * 3 + 1] = c.g
    arr[i * 3 + 2] = c.b
  }
  g.setAttribute('color', new Float32BufferAttribute(arr, 3))
  return g
}

/** Paint by a per-vertex function of the (already transformed) position. */
export const paintBy = (g: BufferGeometry, fn: (x: number, y: number, z: number) => string | Color): BufferGeometry => {
  const pos = g.attributes.position!
  const n = pos.count
  const arr = new Float32Array(n * 3)
  const cache = new Map<string, Color>()
  for (let i = 0; i < n; i++) {
    const r = fn(pos.getX(i), pos.getY(i), pos.getZ(i))
    let c: Color
    if (typeof r === 'string') {
      c = cache.get(r) ?? new Color(r)
      cache.set(r, c)
    } else c = r
    arr[i * 3] = c.r
    arr[i * 3 + 1] = c.g
    arr[i * 3 + 2] = c.b
  }
  g.setAttribute('color', new Float32BufferAttribute(arr, 3))
  return g
}

/** Merge painted geometries (all must share attribute sets). */
export const merge = (geos: BufferGeometry[], groups = false): BufferGeometry => {
  const out = mergeGeometries(geos, groups)
  if (!out) throw new Error('[kit] mergeGeometries failed — attribute mismatch')
  return out
}

// ─── Rig builder: one skinned mesh per character ─────────────────────────────
//
// Parts are authored in their BONE's local space. `build()` bakes every part
// into the rig's bind pose, tags each vertex with its bone (rigid skinning,
// weight 1) and merges the lot into ONE SkinnedMesh with two material groups
// (toon, glow) plus ONE outline SkinnedMesh bound to the same skeleton. A whole
// android is therefore 3 draw calls however many parts it has, and every part
// still animates independently by rotating its bone.

interface PartSpec {
  bone: number
  geo: BufferGeometry
  glow: boolean
  outline: boolean
}

export interface Rig {
  root: Group
  mesh: SkinnedMesh
  outline: SkinnedMesh | null
  bones: Record<string, Bone>
  rest: Record<string, { p: Vector3; q: Quaternion }>
  material: CelMaterial
  glowMaterial: MeshBasicMaterial
  height: number
  /** Triangles in the body mesh (the outline hull draws about as many again). */
  tris: number
}

export class RigBuilder {
  private bones: Bone[] = []
  private byName = new Map<string, number>()
  private parts: PartSpec[] = []

  bone(name: string, parent: string | null, p: V3, r: V3 = [0, 0, 0]): this {
    const b = new Bone()
    b.name = name
    b.position.set(p[0], p[1], p[2])
    b.rotation.set(r[0], r[1], r[2])
    if (parent !== null) {
      const pi = this.byName.get(parent)
      if (pi === undefined) throw new Error(`[rig] unknown parent bone ${parent}`)
      this.bones[pi]!.add(b)
    }
    this.byName.set(name, this.bones.length)
    this.bones.push(b)
    return this
  }

  /** Add a part (geometry in bone space) painted one colour. */
  part(bone: string, geo: BufferGeometry, hex: string, opts: { p?: V3; r?: V3; s?: V3 | number; glow?: boolean; outline?: boolean } = {}): this {
    const bi = this.byName.get(bone)
    if (bi === undefined) throw new Error(`[rig] unknown bone ${bone}`)
    xform(geo, opts.p, opts.r, opts.s ?? 1)
    if (!geo.attributes.color) paint(geo, hex)
    this.parts.push({ bone: bi, geo, glow: !!opts.glow, outline: opts.outline !== false })
    return this
  }

  /** Add a pre-painted geometry (use `paintBy` for gradients / stripes). */
  painted(bone: string, geo: BufferGeometry, opts: { p?: V3; r?: V3; s?: V3 | number; glow?: boolean; outline?: boolean } = {}): this {
    return this.part(bone, geo, '#ffffff', opts)
  }

  /** Mirror helper: calls `fn` for side = -1 (left) and +1 (right). */
  mirror(fn: (side: -1 | 1, tag: 'L' | 'R') => void): this {
    fn(-1, 'L')
    fn(1, 'R')
    return this
  }

  build(opts: { outline?: number; height?: number } = {}): Rig {
    const root = this.bones[0]
    if (!root) throw new Error('[rig] no bones')
    root.updateMatrixWorld(true)

    const toonGeos: BufferGeometry[] = []
    const glowGeos: BufferGeometry[] = []
    const outlineGeos: BufferGeometry[] = []
    for (const part of this.parts) {
      const g = part.geo
      g.applyMatrix4(this.bones[part.bone]!.matrixWorld)
      const n = g.attributes.position!.count
      const idx = new Uint16Array(n * 4)
      const w = new Float32Array(n * 4)
      for (let i = 0; i < n; i++) {
        idx[i * 4] = part.bone
        w[i * 4] = 1
      }
      g.setAttribute('skinIndex', new Uint16BufferAttribute(idx, 4))
      g.setAttribute('skinWeight', new Float32BufferAttribute(w, 4))
      ;(part.glow ? glowGeos : toonGeos).push(g)
      if (part.outline) outlineGeos.push(g)
    }

    const material = rigToon()
    const glowMaterial = rigGlow()
    let geometry: BufferGeometry
    let mats: Material | Material[]
    if (glowGeos.length > 0 && toonGeos.length > 0) {
      geometry = merge([merge(toonGeos), merge(glowGeos)], true)
      mats = [material, glowMaterial]
    } else if (glowGeos.length > 0) {
      geometry = merge(glowGeos)
      mats = glowMaterial
    } else {
      geometry = merge(toonGeos)
      mats = material
    }

    const skeleton = new Skeleton(this.bones)
    const mesh = new SkinnedMesh(geometry, mats)
    mesh.add(root)
    mesh.bind(skeleton)
    mesh.frustumCulled = false

    let outline: SkinnedMesh | null = null
    const thickness = opts.outline ?? OUTLINE_WIDTH
    if (thickness > 0 && outlineGeos.length > 0) {
      const og = outlineGeos.length === this.parts.length && glowGeos.length === 0
        ? geometry
        : merge(outlineGeos)
      outline = new SkinnedMesh(og, outlineMat(thickness))
      outline.bind(skeleton, mesh.bindMatrix)
      outline.frustumCulled = false
      outline.renderOrder = -1
    }

    const group = new Group()
    group.add(mesh)
    if (outline) group.add(outline)

    const bones: Record<string, Bone> = {}
    const rest: Record<string, { p: Vector3; q: Quaternion }> = {}
    for (const b of this.bones) {
      bones[b.name] = b
      rest[b.name] = { p: b.position.clone(), q: b.quaternion.clone() }
    }
    const tris = (geometry.index ? geometry.index.count : geometry.attributes.position!.count) / 3
    return { root: group, mesh, outline, bones, rest, material, glowMaterial, height: opts.height ?? 1.5, tris }
  }
}

/**
 * Another instance of a built rig: the same geometry (shared on the GPU), its
 * own bones and its own cel material (so its hit flash, tint and fade are its
 * own). A pack of six goblins is one geometry upload, not six.
 */
export const cloneRig = (t: Rig): Rig => {
  const root = cloneSkinned(t.root) as Group
  const bones: Record<string, Bone> = {}
  let mesh: SkinnedMesh | null = null
  let outline: SkinnedMesh | null = null
  root.traverse((o) => {
    if ((o as Bone).isBone) bones[o.name] = o as Bone
    else if ((o as SkinnedMesh).isSkinnedMesh) {
      if (o.renderOrder === -1) outline = o as SkinnedMesh
      else mesh = o as SkinnedMesh
    }
  })
  const m = mesh as SkinnedMesh | null
  if (!m) throw new Error('[rig] clone lost its mesh')
  const material = rigToon()
  if (Array.isArray(m.material)) m.material = [material, t.glowMaterial]
  else if (m.material === t.material) m.material = material
  return { root, mesh: m, outline, bones, rest: t.rest, material, glowMaterial: t.glowMaterial, height: t.height, tris: t.tris }
}

// ─── Pose helpers ────────────────────────────────────────────────────────────

const _pq = new Quaternion()
const _pe = new Euler()

/** Set a bone to its rest rotation plus an euler offset (radians). */
export const pose = (rig: Rig, name: string, rx = 0, ry = 0, rz = 0): void => {
  const b = rig.bones[name]
  const r = rig.rest[name]
  if (!b || !r) return
  _pe.set(rx, ry, rz)
  _pq.setFromEuler(_pe)
  b.quaternion.copy(r.q).multiply(_pq)
}

/** Offset a bone from its rest position (units, bone-parent space). */
export const nudge = (rig: Rig, name: string, dx = 0, dy = 0, dz = 0): void => {
  const b = rig.bones[name]
  const r = rig.rest[name]
  if (!b || !r) return
  b.position.set(r.p.x + dx, r.p.y + dy, r.p.z + dz)
}

export const scaleBone = (rig: Rig, name: string, sx: number, sy = sx, sz = sx): void => {
  const b = rig.bones[name]
  if (b) b.scale.set(sx, sy, sz)
}

/** Static (non-skinned) merged prop mesh + optional outline, as one Group. */
export const staticProp = (toonGeos: BufferGeometry[], glowGeos: BufferGeometry[], material: Material, glowMaterial: Material, outline = OUTLINE_WIDTH): Group => {
  const g = new Group()
  if (toonGeos.length) {
    const geo = merge(toonGeos)
    g.add(new Mesh(geo, material))
    if (outline > 0) {
      const o = new Mesh(geo, outlineMat(outline))
      o.renderOrder = -1
      g.add(o)
    }
  }
  if (glowGeos.length) g.add(new Mesh(merge(glowGeos), glowMaterial))
  return g
}
