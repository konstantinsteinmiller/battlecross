import { describe, expect, it } from 'vitest'
import { BufferGeometry, Float32BufferAttribute, Frustum, Matrix4, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Group } from 'three'
import { StillCull, markStill, splitByTile } from '@/game/gfx/cull'

/** A flat sheet on the ground, `n` × `n` quads of 1 m from (0, 0). */
const sheet = (n: number): BufferGeometry => {
  const g = new PlaneGeometry(n, n, n, n)
  g.rotateX(-Math.PI / 2)
  g.translate(n / 2, 0, n / 2)
  return g
}

describe('splitByTile', () => {
  it('keeps every triangle exactly once, sharing the vertices', () => {
    const g = sheet(40)
    const tiles = splitByTile(g, 15)
    expect(tiles.length).toBe(9)
    const total = tiles.reduce((s, t) => s + t.getIndex()!.count, 0)
    expect(total).toBe(g.getIndex()!.count)
    const seen = new Set<string>()
    for (const t of tiles) {
      // The same attribute objects: one upload, seams on the same vertices.
      expect(t.getAttribute('position')).toBe(g.getAttribute('position'))
      const idx = t.getIndex()!
      for (let k = 0; k < idx.count; k += 3) {
        const key = [idx.getX(k), idx.getX(k + 1), idx.getX(k + 2)].join(',')
        expect(seen.has(key)).toBe(false)
        seen.add(key)
      }
    }
  })

  it('leaves a geometry that fits one tile as it is, and handles an unindexed one', () => {
    const small = sheet(4)
    expect(splitByTile(small, 15)).toEqual([small])
    const plain = sheet(40).toNonIndexed()
    const tiles = splitByTile(plain, 20)
    expect(tiles.length).toBe(4)
    expect(tiles.reduce((s, t) => s + t.getIndex()!.count, 0)).toBe(plain.getAttribute('position').count)
  })
})

describe('StillCull', () => {
  const frustumOf = (cam: OrthographicCamera): Frustum => {
    cam.updateMatrixWorld()
    return new Frustum().setFromProjectionMatrix(new Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse))
  }

  it('shows a marked tile only when its own box (not the sheet\'s) is in view, and leaves unmarked meshes alone', () => {
    const root = new Group()
    const g = sheet(60)
    const tiles = splitByTile(g, 15).map(t => markStill(new Mesh(t, new MeshBasicMaterial())))
    root.add(...tiles)
    const other = new Mesh(new BufferGeometry().setAttribute('position', new Float32BufferAttribute([500, 0, 500, 501, 0, 500, 500, 0, 501], 3)), new MeshBasicMaterial())
    root.add(other)
    const cull = new StillCull()
    cull.collect(root)
    expect(cull.size).toBe(16)
    expect(tiles.every(t => !t.matrixAutoUpdate && !t.matrixWorldAutoUpdate && !t.frustumCulled)).toBe(true)
    // Looking straight down on the tile at (0..15, 0..15) only.
    const cam = new OrthographicCamera(-5, 5, 5, -5, 0.1, 100)
    cam.position.set(7.5, 50, 7.5)
    cam.lookAt(7.5, 0, 7.5)
    cull.update(frustumOf(cam))
    const shown = tiles.filter(t => t.visible)
    expect(shown.length).toBe(1)
    expect(other.visible).toBe(true)
    expect(other.frustumCulled).toBe(true)
    // Over the corner of four tiles: those four.
    cam.position.set(30, 50, 30)
    cam.lookAt(30, 0, 30)
    cull.update(frustumOf(cam))
    expect(tiles.filter(t => t.visible).length).toBe(4)
  })
})
