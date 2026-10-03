import { Box3, BufferGeometry, Uint16BufferAttribute, Uint32BufferAttribute, Vector3, type Frustum, type InstancedMesh, type Mesh, type Object3D } from 'three'

/**
 * ─── Culling the still world by its boxes ────────────────────────────────────
 *
 * three culls a mesh by its bounding SPHERE. For a flat 15 m tile of scenery
 * or ground the sphere reaches ~10 m above and below it, and the tilted
 * frustum of a portrait phone's camera keeps catching tiles that have not one
 * pixel on screen (measured: a dozen draws and ~20 k triangles a frame in a
 * fight, `PERF-LEDGER.md`). Things that never move are tested by their world
 * box instead, once a frame, before the render.
 *
 * Only meshes MARKED by their builder (`markStill`) are taken: nothing whose
 * visibility someone else already drives (a chest's glow, a house's cut-away
 * front, a room) and nothing that moves.
 */

const MARK = 'stillCull'

/** Mark a mesh as still: its box decides whether it is drawn. */
export const markStill = <T extends Mesh>(m: T): T => {
  m.userData[MARK] = true
  return m
}

/** Margin round a box: outline hulls and vertex wobble reach a little past the geometry. */
const PAD = 0.35

const _p = new Vector3()
/** The box of the vertices a geometry DRAWS: a tile of `splitByTile` shares the
 *  whole sheet's vertices, and three's own box would be the whole sheet's. */
const indexedBox = (geo: BufferGeometry): Box3 => {
  const index = geo.getIndex()
  if (!index) {
    if (!geo.boundingBox) geo.computeBoundingBox()
    return geo.boundingBox!.clone()
  }
  const pos = geo.getAttribute('position')
  const box = new Box3()
  for (let k = 0; k < index.count; k++) box.expandByPoint(_p.fromBufferAttribute(pos, index.getX(k)))
  return box
}

export class StillCull {
  private items: Array<{ o: Mesh; box: Box3 }> = []

  /** Take every marked mesh under `root` (its world matrix must be final). */
  collect(root: Object3D): void {
    root.updateMatrixWorld(true)
    root.traverse((o) => {
      const m = o as Mesh
      if (!m.isMesh || !m.userData[MARK]) return
      const inst = m as InstancedMesh
      let box: Box3
      if (inst.isInstancedMesh) {
        inst.computeBoundingBox()
        box = inst.boundingBox!.clone()
      } else box = indexedBox(m.geometry)
      box.applyMatrix4(m.matrixWorld).expandByScalar(PAD)
      // The box is the test now; the sphere would only pass what it passes.
      m.frustumCulled = false
      // Never moves: its matrices are final, and the scene's per-frame walk
      // need not recompose them (hundreds of tiles in a zone).
      m.matrixAutoUpdate = false
      m.matrixWorldAutoUpdate = false
      this.items.push({ o: m, box })
    })
  }

  /** Before each render: show what the frustum touches. */
  update(frustum: Frustum): void {
    const items = this.items
    for (let i = 0; i < items.length; i++) {
      const it = items[i]!
      it.o.visible = frustum.intersectsBox(it.box)
    }
  }

  get size(): number {
    return this.items.length
  }
}

/**
 * Split one big indexed (or plain) geometry into tiles of `tile` metres by
 * where each triangle's centre lies. The tiles SHARE the vertex attributes
 * (one upload) and differ only in their index, so the seams are the same
 * vertices and cannot crack; each tile is then culled on its own.
 */
export const splitByTile = (geo: BufferGeometry, tile: number): BufferGeometry[] => {
  const pos = geo.getAttribute('position')
  const index = geo.getIndex()
  const n = index ? index.count : pos.count
  const at = (k: number): number => (index ? index.getX(k) : k)
  const buckets = new Map<number, number[]>()
  for (let t = 0; t < n; t += 3) {
    const a = at(t), b = at(t + 1), c = at(t + 2)
    const cx = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3
    const cz = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3
    const key = (Math.floor(cz / tile) + 2048) * 4096 + Math.floor(cx / tile) + 2048
    let list = buckets.get(key)
    if (!list) buckets.set(key, (list = []))
    list.push(a, b, c)
  }
  if (buckets.size <= 1) return [geo]
  const out: BufferGeometry[] = []
  for (const list of buckets.values()) {
    const g = new BufferGeometry()
    for (const name of Object.keys(geo.attributes)) g.setAttribute(name, geo.getAttribute(name))
    g.setIndex(pos.count > 65535 ? new Uint32BufferAttribute(list, 1) : new Uint16BufferAttribute(list, 1))
    out.push(g)
  }
  return out
}
