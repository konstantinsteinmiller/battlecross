import { Matrix4, Vector3, type BufferGeometry, type Material, type Mesh, type Object3D, InstancedMesh, BackSide } from 'three'

/**
 * Coplanar-overlap ("z-fighting") detection over triangle soups.
 *
 * Two opaque triangles that lie in the same plane (within `tol` metres), face
 * the same way and overlap in that plane by more than a sliver fight in the
 * depth buffer: the picture tears and flickers as the camera moves. The
 * builders must never make such a pair; these helpers find every one.
 */

export interface Tri {
  ax: number; ay: number; az: number
  bx: number; by: number; bz: number
  cx: number; cy: number; cz: number
  nx: number; ny: number; nz: number
  d: number
  tag: string
  /** How it is drawn (material and flat colour), when it is one colour all
   *  over: two coplanar faces drawn exactly alike make the same pixels, so
   *  their overlap cannot flicker and is not a fight. */
  look?: string
}

/** A triangle's look from its three vertex colours (none when they differ). */
const lookOf = (mat: string, col: ArrayLike<number> | null, i0: number, i1: number, i2: number): string | undefined => {
  if (!col) return mat
  const k = (i: number): string => `${Math.round(col[i * 3]! * 255)},${Math.round(col[i * 3 + 1]! * 255)},${Math.round(col[i * 3 + 2]! * 255)}`
  const a = k(i0)
  return a === k(i1) && a === k(i2) ? `${mat}|${a}` : undefined
}

export interface Fight {
  a: Tri
  b: Tri
  /** Plane distance between them, metres. */
  gap: number
}

const _a = new Vector3()
const _b = new Vector3()
const _c = new Vector3()

/** The triangles of a geometry, through a matrix, tagged. */
export const trisOf = (g: BufferGeometry, m: Matrix4 | null, tag: string, out: Tri[] = [], mat?: string): Tri[] => {
  const p = g.attributes.position
  if (!p) return out
  const colAttr = g.attributes.color
  const col = mat && colAttr ? (colAttr.array as ArrayLike<number>) : null
  const stride = colAttr ? colAttr.itemSize : 3
  const ix = g.index
  const n = ix ? ix.count : p.count
  for (let k = 0; k + 2 < n; k += 3) {
    const i0 = ix ? ix.getX(k) : k
    const i1 = ix ? ix.getX(k + 1) : k + 1
    const i2 = ix ? ix.getX(k + 2) : k + 2
    _a.fromBufferAttribute(p, i0)
    _b.fromBufferAttribute(p, i1)
    _c.fromBufferAttribute(p, i2)
    if (m) { _a.applyMatrix4(m); _b.applyMatrix4(m); _c.applyMatrix4(m) }
    const ux = _b.x - _a.x, uy = _b.y - _a.y, uz = _b.z - _a.z
    const vx = _c.x - _a.x, vy = _c.y - _a.y, vz = _c.z - _a.z
    let nx = uy * vz - uz * vy
    let ny = uz * vx - ux * vz
    let nz = ux * vy - uy * vx
    const l = Math.hypot(nx, ny, nz)
    // Slivers and degenerate triangles cannot fight visibly.
    if (l < 2e-5) continue
    nx /= l; ny /= l; nz /= l
    const look = !mat ? undefined : !colAttr ? mat : stride === 3 ? lookOf(mat, col, i0, i1, i2) : undefined
    const lab = (g.userData.labels as string[] | undefined)?.[i0]
    out.push({ ax: _a.x, ay: _a.y, az: _a.z, bx: _b.x, by: _b.y, bz: _b.z, cx: _c.x, cy: _c.y, cz: _c.z, nx, ny, nz, d: nx * _a.x + ny * _a.y + nz * _a.z, tag: lab ? `${tag}:${lab}` : tag, look })
  }
  return out
}

/** The triangles of a building mesher, each tagged with the builder that made it (`Mesher.trace`). */
export const trisOfMesher = (m: { pos: number[]; idx: number[]; col: number[]; labels: string[] }, prefix: string, out: Tri[] = [], mat = prefix.includes('glow') ? 'glow' : 'cel'): Tri[] => {
  const P = m.pos
  for (let k = 0; k + 2 < m.idx.length; k += 3) {
    const i0 = m.idx[k]!, i1 = m.idx[k + 1]!, i2 = m.idx[k + 2]!
    const ax = P[i0 * 3]!, ay = P[i0 * 3 + 1]!, az = P[i0 * 3 + 2]!
    const bx = P[i1 * 3]!, by = P[i1 * 3 + 1]!, bz = P[i1 * 3 + 2]!
    const cx = P[i2 * 3]!, cy = P[i2 * 3 + 1]!, cz = P[i2 * 3 + 2]!
    const ux = bx - ax, uy = by - ay, uz = bz - az
    const vx = cx - ax, vy = cy - ay, vz = cz - az
    let nx = uy * vz - uz * vy
    let ny = uz * vx - ux * vz
    let nz = ux * vy - uy * vx
    const l = Math.hypot(nx, ny, nz)
    if (l < 2e-5) continue
    nx /= l; ny /= l; nz /= l
    out.push({ ax, ay, az, bx, by, bz, cx, cy, cz, nx, ny, nz, d: nx * ax + ny * ay + nz * az, tag: `${prefix}${m.labels[i0] ?? '?'}`, look: lookOf(mat, m.col, i0, i1, i2) })
  }
  return out
}

/** Every opaque, front-drawn triangle under an object (outline hulls, points, see-through and hidden things left out). */
export const trisOfScene = (root: Object3D, out: Tri[] = [], maxInstances = 4000): Tri[] => {
  root.updateMatrixWorld(true)
  const m = new Matrix4()
  root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh || !mesh.visible) return
    let hidden = false
    for (let q: Object3D | null = o; q; q = q.parent) if (!q.visible) { hidden = true; break }
    if (hidden) return
    const mat = mesh.material as Material
    if (Array.isArray(mat)) return
    if (mat.side === BackSide || mat.transparent || mat.depthTest === false) return
    let path = ''
    for (let q: Object3D | null = o.parent; q && q !== root; q = q.parent) if (q.name) path = `${q.name}/${path}`
    const tag = o.name || o.parent?.name || `${path}mesh${mesh.geometry.attributes.position?.count ?? 0}v(${mat.type})`
    if ((o as InstancedMesh).isInstancedMesh) {
      const im = o as InstancedMesh
      const n = Math.min(im.count, maxInstances)
      const inst = new Matrix4()
      for (let i = 0; i < n; i++) {
        im.getMatrixAt(i, inst)
        m.multiplyMatrices(im.matrixWorld, inst)
        const ic = im.instanceColor ? Array.from(im.instanceColor.array.slice(i * 3, i * 3 + 3), v => Math.round(v * 255)).join(',') : ''
        trisOf(im.geometry, m, `${tag}#${i}`, out, `${mat.uuid}${ic}`)
      }
      return
    }
    trisOf(mesh.geometry, mesh.matrixWorld, tag, out, mat.uuid)
  })
  return out
}

/** Separated in the plane (with a margin: touching edges are not an overlap)? */
const separated = (P: number[][], Q: number[][], eps: number): boolean => {
  const axes = (T: number[][]): number[][] => {
    const out: number[][] = []
    for (let i = 0; i < 3; i++) {
      const a = T[i]!
      const b = T[(i + 1) % 3]!
      const ex = b[0]! - a[0]!
      const ey = b[1]! - a[1]!
      const l = Math.hypot(ex, ey) || 1
      out.push([-ey / l, ex / l])
    }
    return out
  }
  for (const [x, y] of [...axes(P), ...axes(Q)]) {
    let p0 = Infinity, p1 = -Infinity, q0 = Infinity, q1 = -Infinity
    for (const v of P) { const s = v[0]! * x! + v[1]! * y!; if (s < p0) p0 = s; if (s > p1) p1 = s }
    for (const v of Q) { const s = v[0]! * x! + v[1]! * y!; if (s < q0) q0 = s; if (s > q1) q1 = s }
    if (p1 < q0 + eps || q1 < p0 + eps) return true
  }
  return false
}

/**
 * Every pair of triangles that face the same way, lie in one plane (within
 * `tol`) and overlap there by more than `eps` (metres).
 */
export const findFights = (tris: Tri[], tol = 0.006, eps = 0.004, limit = 200): Fight[] => {
  const buckets = new Map<string, Tri[]>()
  for (const t of tris) {
    // The camera never turns and always looks down at 52°: a face turned from it is never seen.
    if (t.ny * 0.788 + t.nz * 0.616 <= 0.02) continue
    const key = `${Math.round(t.nx * 40)},${Math.round(t.ny * 40)},${Math.round(t.nz * 40)}`
    const b = buckets.get(key)
    if (b) b.push(t)
    else buckets.set(key, [t])
  }
  const out: Fight[] = []
  for (const list of buckets.values()) {
    list.sort((p, q) => p.d - q.d)
    for (let i = 0; i < list.length; i++) {
      const a = list[i]!
      const amin = [Math.min(a.ax, a.bx, a.cx), Math.min(a.ay, a.by, a.cy), Math.min(a.az, a.bz, a.cz)]
      const amax = [Math.max(a.ax, a.bx, a.cx), Math.max(a.ay, a.by, a.cy), Math.max(a.az, a.bz, a.cz)]
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j]!
        if (b.d - a.d > tol) break
        if (a.nx * b.nx + a.ny * b.ny + a.nz * b.nz < 0.9995) continue
        if (a.look !== undefined && a.look === b.look) continue
        if (Math.max(b.ax, b.bx, b.cx) < amin[0]! - tol || Math.min(b.ax, b.bx, b.cx) > amax[0]! + tol) continue
        if (Math.max(b.ay, b.by, b.cy) < amin[1]! - tol || Math.min(b.ay, b.by, b.cy) > amax[1]! + tol) continue
        if (Math.max(b.az, b.bz, b.cz) < amin[2]! - tol || Math.min(b.az, b.bz, b.cz) > amax[2]! + tol) continue
        // B's corners must lie on A's plane.
        const da = Math.abs(a.nx * b.ax + a.ny * b.ay + a.nz * b.az - a.d)
        const db = Math.abs(a.nx * b.bx + a.ny * b.by + a.nz * b.bz - a.d)
        const dc = Math.abs(a.nx * b.cx + a.ny * b.cy + a.nz * b.cz - a.d)
        const gap = Math.max(da, db, dc)
        if (gap > tol) continue
        // Into the plane's own 2D frame.
        const ax = Math.abs(a.nx), ay = Math.abs(a.ny), az = Math.abs(a.nz)
        const drop = ax > ay && ax > az ? 0 : ay > az ? 1 : 2
        const pr = (x: number, y: number, z: number): number[] => (drop === 0 ? [y, z] : drop === 1 ? [x, z] : [x, y])
        const P = [pr(a.ax, a.ay, a.az), pr(a.bx, a.by, a.bz), pr(a.cx, a.cy, a.cz)]
        const Q = [pr(b.ax, b.ay, b.az), pr(b.bx, b.by, b.bz), pr(b.cx, b.cy, b.cz)]
        if (separated(P, Q, eps)) continue
        out.push({ a, b, gap })
        if (out.length >= limit) return out
      }
    }
  }
  return out
}

const f2 = (v: number): string => v.toFixed(2)
export const describe1 = (f: Fight): string => {
  const c = (t: Tri): string => `[${t.tag}] (${f2((t.ax + t.bx + t.cx) / 3)}, ${f2((t.ay + t.by + t.cy) / 3)}, ${f2((t.az + t.bz + t.cz) / 3)})`
  return `${c(f.a)} vs ${c(f.b)} n(${f2(f.a.nx)},${f2(f.a.ny)},${f2(f.a.nz)}) gap ${(f.gap * 1000).toFixed(1)} mm`
}

/** Make `canvas.getContext('2d')` answer in jsdom (procedural textures draw into it). */
export const stubCanvas = (): void => {
  const ctx = new Proxy({}, {
    get: (_t, k) => {
      if (k === 'getImageData' || k === 'createImageData') return (_x: number, _y: number, w = 1, h = 1) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h })
      if (k === 'measureText') return () => ({ width: 10 })
      if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop: () => {} })
      if (k === 'canvas') return document.createElement('canvas')
      return () => {}
    },
    set: () => true
  })
  ;(HTMLCanvasElement.prototype as unknown as { getContext: () => unknown }).getContext = () => ctx
}
