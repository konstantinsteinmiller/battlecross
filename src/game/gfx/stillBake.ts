import {
  BufferGeometry, Color, Float32BufferAttribute, Group, Matrix3, Matrix4, Mesh, Uint16BufferAttribute, Uint32BufferAttribute,
  type BufferAttribute, type InstancedMesh, type InterleavedBufferAttribute, type Material, type Object3D
} from 'three'
import { stillTarget } from './cel'
import { markStill } from './cull'
import type { Slice } from '../engine/slicer'

/**
 * ─── One draw per kind of surface per stretch of the world (roadmap #151) ────
 *
 * The builders lay a place out piece by piece: an InstancedMesh per scenery
 * shape per 15 m tile (and its outline), the level props, the ground and the
 * town's quarters in tiles of their own, each culled by its box. Every one of
 * those is a draw call, and a frame in a zone drew ~50 of them for the still
 * world alone.
 *
 * Once the place is built (downstream of every placement, so the builders and
 * the map generation stay as they are), this takes every mesh its builder
 * marked still (`markStill`) and BAKES it: each instance's matrix is applied
 * to its vertices in world space and everything that shades alike is merged,
 * gathered into BAKE_TILE squares by where each WHOLE piece's centre lies (an
 * instance, or a builder's own tile of ground / props / a town quarter): no
 * piece is split, so a tile's box is its pieces' boxes. What stays apart,
 * and why:
 *
 *   • the cel-lit surfaces: ONE material (`celStill`) whether a piece opens
 *     round the hero and sinks into the haze (scenery) or not (props, houses):
 *     a per-vertex flag (`aStill`) chooses;
 *   • the scenery's outline hulls: their own material, because the effects
 *     ladder switches them off as one (`setSceneryOutlines`); the props' and
 *     houses' hulls are another (always drawn); a hull is back faces, so it can
 *     never share a draw with the front faces it outlines;
 *   • the glowing parts: unlit, another shader;
 *   • the ground and the land beyond (the detail map, the relief shading);
 *   • water / lava: its own animated shader;
 *   • anything blended (decals, mist): never merged (sorted per object, and a
 *     merge would change what blends over what).
 *
 * The pixels are the builders' own: the same triangles in the same world
 * places with the same shading (`tests/game/stillBake.test.ts` checks the
 * world triangles of a built zone are kept one for one, so the z-fight guard,
 * which runs on the builders' output, still covers what is drawn).
 */

/** Side of a baked tile, metres (the trade-off is measured in `PERF-LEDGER.md`). */
export const BAKE_TILE = 7.5

type Attr = BufferAttribute | InterleavedBufferAttribute

interface Source {
  mesh: Mesh
  order: number
  see: number
  fog: number
  tint: Color | null
  hull: boolean
}

interface Bucket {
  /** attribute name → values */
  data: Map<string, number[]>
  idx: number[]
  verts: number
  order: number
}

const _m = new Matrix4()
const _inst = new Matrix4()
const _n = new Matrix3()

/** Visible as far as its parents go? */
const shown = (o: Object3D): boolean => {
  for (let q: Object3D | null = o; q; q = q.parent) if (!q.visible) return false
  return true
}

const ITEM: Record<string, number> = { position: 3, normal: 3, color: 3, uv: 2 }

export class StillBake {
  readonly root = new Group()
  private owned: BufferGeometry[] = []
  /** The pieces taken out of the scene (their builders still own and free their geometry). */
  private taken: Mesh[] = []
  /** Draws made, and meshes they replaced (for the ledger and tests). */
  made = 0
  replaced = 0

  /**
   * Bake every still mesh under `scene` into tiles of `tile` metres
   * (Infinity: one mesh per kind for the whole place).
   */
  async bake(scene: Object3D, tile = BAKE_TILE, slice: Slice = () => {}): Promise<void> {
    scene.updateMatrixWorld(true)
    const classes = new Map<Material, { known: boolean; sources: Source[] }>()
    scene.traverse((o) => {
      const mesh = o as Mesh
      if (!mesh.isMesh || !mesh.userData.stillCull || mesh.parent === this.root) return
      const mat = mesh.material as Material
      if (Array.isArray(mat) || mat.transparent || !shown(mesh)) return
      const geo = mesh.geometry
      if (geo.groups.length > 1 || Object.keys(geo.morphAttributes).length) return
      const inst = (mesh as InstancedMesh).isInstancedMesh ? (mesh as InstancedMesh) : null
      if (inst?.instanceColor) return
      const t = stillTarget(mat)
      let target: Material
      if (t) target = t.mat
      else {
        // A material this file does not know (the ground's, the water's): its
        // shader may read the object's own space, so only meshes already in
        // world space are merged, each kind with its own.
        if (inst || !mesh.matrixWorld.equals(_m.identity())) return
        target = mat
      }
      let cls = classes.get(target)
      if (!cls) classes.set(target, (cls = { known: !!t, sources: [] }))
      cls.sources.push({ mesh, order: mesh.renderOrder, see: t?.see ?? 0, fog: t?.fog ?? 0, tint: t?.tint ?? null, hull: t?.hull ?? false })
    })

    for (const [mat, { known, sources }] of classes) {
      // Earlier draws first inside the merged one too (the land sheet under the ground).
      sources.sort((a, b) => a.order - b.order)
      const names = new Set<string>()
      for (const s of sources) for (const n of Object.keys(s.mesh.geometry.attributes)) names.add(n)
      if (known) {
        // The cel / hull / glow shaders read these and no more.
        for (const n of [...names]) if (n !== 'position' && n !== 'normal' && n !== 'color') names.delete(n)
        names.add('color')
        if ((mat as { defines?: Record<string, string> }).defines?.STILL !== undefined) names.add('aStill')
      }
      const sizes = new Map<string, number>()
      for (const n of names) {
        let size = n === 'aStill' ? 3 : ITEM[n] ?? 0
        for (const s of sources) {
          const a = s.mesh.geometry.getAttribute(n) as Attr | undefined
          if (a) { size = a.itemSize; break }
        }
        sizes.set(n, size)
      }
      const buckets = new Map<number, Bucket>()
      const bucketOf = (key: number, order: number): Bucket => {
        let b = buckets.get(key)
        if (!b) {
          b = { data: new Map([...names].map(n => [n, [] as number[]])), idx: [], verts: 0, order }
          buckets.set(key, b)
        }
        return b
      }
      let work = 0
      let pieces = 0
      for (const s of sources) {
        const geo = s.mesh.geometry
        const pos = geo.getAttribute('position') as Attr
        const index = geo.getIndex()
        const tris = index ? index.count : pos.count
        const inst = (s.mesh as InstancedMesh).isInstancedMesh ? (s.mesh as InstancedMesh) : null
        const count = inst ? inst.count : 1
        const attrs = [...names].map(n => [n, geo.getAttribute(n) as Attr | undefined, sizes.get(n)!] as const)
        for (let i = 0; i < count; i++) {
          if (inst) {
            inst.getMatrixAt(i, _inst)
            _m.multiplyMatrices(s.mesh.matrixWorld, _inst)
          } else _m.copy(s.mesh.matrixWorld)
          _n.getNormalMatrix(_m)
          const flip = _m.determinant() < 0
          const scale = _m.getMaxScaleOnAxis()
          const e = _m.elements
          const ne = _n.elements
          // This instance's vertices as written into each bucket.
          const remaps = new Map<Bucket, Int32Array>()
          const vert = (b: Bucket, v: number): number => {
            let r = remaps.get(b)
            if (!r) remaps.set(b, (r = new Int32Array(pos.count).fill(-1)))
            const hit = r[v]!
            if (hit >= 0) return hit
            for (const [n, a, size] of attrs) {
              const out = b.data.get(n)!
              if (n === 'position') {
                const x = a!.getX(v), y = a!.getY(v), z = a!.getZ(v)
                out.push(e[0]! * x + e[4]! * y + e[8]! * z + e[12]!, e[1]! * x + e[5]! * y + e[9]! * z + e[13]!, e[2]! * x + e[6]! * y + e[10]! * z + e[14]!)
              } else if (n === 'normal' && a) {
                const x = a.getX(v), y = a.getY(v), z = a.getZ(v)
                const nx = ne[0]! * x + ne[3]! * y + ne[6]! * z
                const ny = ne[1]! * x + ne[4]! * y + ne[7]! * z
                const nz = ne[2]! * x + ne[5]! * y + ne[8]! * z
                const l = Math.hypot(nx, ny, nz) || 1
                out.push(nx / l, ny / l, nz / l)
              } else if (n === 'aStill') out.push(s.see, s.fog, s.hull ? scale : 1)
              else if (n === 'color' && (s.tint || !a)) {
                const c = s.tint
                out.push(c ? c.r : 1, c ? c.g : 1, c ? c.b : 1)
              } else if (a) {
                out.push(a.getX(v))
                if (size > 1) out.push(a.getY(v))
                if (size > 2) out.push(a.getZ(v))
                if (size > 3) out.push(a.getW(v))
              } else for (let k = 0; k < size; k++) out.push(0)
            }
            r[v] = b.verts
            return b.verts++
          }
          // A WHOLE piece goes to the tile its centre lies in (an instance: its
          // origin; a builder's tile: the middle of what it draws), so a tile's
          // box is never wider than its pieces' and none is split in two.
          let cx: number, cz: number, span: number
          if (inst) {
            cx = e[12]!
            cz = e[14]!
            if (!geo.boundingSphere) geo.computeBoundingSphere()
            span = geo.boundingSphere!.radius * 2 * scale
          } else {
            let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity
            for (let t = 0; t < tris; t++) {
              const v = index ? index.getX(t) : t
              const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v)
              const wx = e[0]! * x + e[4]! * y + e[8]! * z + e[12]!
              const wz = e[2]! * x + e[6]! * y + e[10]! * z + e[14]!
              if (wx < x0) x0 = wx
              if (wx > x1) x1 = wx
              if (wz < z0) z0 = wz
              if (wz > z1) z1 = wz
            }
            cx = (x0 + x1) / 2
            cz = (z0 + z1) / 2
            span = Math.max(x1 - x0, z1 - z0)
          }
          // A piece wider than a tile (a builder's 30 m ground tile, the land
          // sheet, a town quarter) stays a draw of its own, its box as it was:
          // gathered with others it draws them all whenever its far corner is
          // in view (measured: Sunford +40 % triangles at the start).
          const key = !Number.isFinite(tile) ? 0 : span > tile ? -1 - pieces++ : (Math.floor(cz / tile) + 2048) * 4096 + Math.floor(cx / tile) + 2048
          const bk = bucketOf(key, s.order)
          for (let t = 0; t + 2 < tris; t += 3) {
            const a = index ? index.getX(t) : t
            const b = index ? index.getX(t + 1) : t + 1
            const c = index ? index.getX(t + 2) : t + 2
            const ia = vert(bk, a)
            const ib = vert(bk, b)
            const ic = vert(bk, c)
            if (flip) bk.idx.push(ia, ic, ib)
            else bk.idx.push(ia, ib, ic)
          }
          work += tris
          if (work > 60000) { work = 0; await slice() }
        }
        this.taken.push(s.mesh)
      }
      for (const b of buckets.values()) {
        if (!b.idx.length) continue
        const g = new BufferGeometry()
        for (const [n, arr] of b.data) g.setAttribute(n, new Float32BufferAttribute(arr, sizes.get(n)!))
        g.setIndex(b.verts > 65535 ? new Uint32BufferAttribute(b.idx, 1) : new Uint16BufferAttribute(b.idx, 1))
        g.computeBoundingSphere()
        this.owned.push(g)
        const mesh = markStill(new Mesh(g, mat))
        mesh.renderOrder = sources[0]!.order
        mesh.name = 'baked'
        this.root.add(mesh)
        this.made++
      }
      await slice()
    }
    for (const m of this.taken) m.removeFromParent()
    this.replaced = this.taken.length
    if (this.made) scene.add(this.root)
  }

  dispose(): void {
    this.root.removeFromParent()
    for (const g of this.owned) g.dispose()
    this.owned = []
    for (const m of this.taken) if ((m as InstancedMesh).isInstancedMesh) (m as InstancedMesh).dispose()
    this.taken = []
  }
}
