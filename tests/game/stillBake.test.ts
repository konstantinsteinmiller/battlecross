// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { Frustum, Matrix4, PerspectiveCamera, Scene, type InstancedMesh, type Material, type Mesh, type Object3D } from 'three'
import { stubCanvas, trisOfScene, type Tri } from './zfightTools'

/**
 * The still world baked (roadmap #151, `gfx/stillBake.ts`): every opaque
 * still mesh a zone's builders made is merged into a few draws per 15 m tile,
 * and the merge keeps the builders' world triangles one for one (so the
 * z-fight guard, which checks the builders' output, covers what is drawn).
 *
 * The draw budget it holds: at most MAX_KINDS kinds of baked surface in a
 * place, and at most one draw of each kind per tile.
 */

stubCanvas()

/** cel-lit, scenery hulls, prop hulls, glow, ground, water. */
const MAX_KINDS = 6

const r = (c: number): number => Math.round(c * 100)
/** A triangle by its corners (to the cm) and the way it faces. */
const keyOf = (t: Tri): string =>
  [[t.ax, t.ay, t.az], [t.bx, t.by, t.bz], [t.cx, t.cy, t.cz]].map(v => v.map(r).join(',')).sort().join('|') + `>${Math.round(t.nx * 10)},${Math.round(t.ny * 10)},${Math.round(t.nz * 10)}`

/** Triangles the culled still world draws from the game's camera (phone
 *  portrait, 52° down, ~18 m back) at each spot. */
const drawnAt = async (scene: Scene, spots: Array<[number, number]>): Promise<Array<{ tris: number; calls: number }>> => {
  const { StillCull } = await import('@/game/gfx/cull')
  const cull = new StillCull()
  cull.collect(scene)
  const cam = new PerspectiveCamera(42, 390 / 780, 0.5, 120)
  const fr = new Frustum()
  const out: Array<{ tris: number; calls: number }> = []
  for (const [x, z] of spots) {
    cam.position.set(x, 18 * Math.sin(0.91), z + 18 * Math.cos(0.91))
    cam.lookAt(x, 0, z)
    cam.updateMatrixWorld()
    fr.setFromProjectionMatrix(new Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse))
    cull.update(fr)
    let n = 0
    let calls = 0
    scene.traverse((o) => {
      const m = o as Mesh
      if (!m.isMesh || !m.userData.stillCull || !m.visible || (m.material as Material).transparent) return
      const g = m.geometry
      const tris = (g.getIndex()?.count ?? g.getAttribute('position').count) / 3
      calls++
      n += tris * ((m as InstancedMesh).isInstancedMesh ? (m as InstancedMesh).count : 1)
    })
    out.push({ tris: n, calls })
  }
  // Leave everything shown, as the build does (the bake skips hidden meshes).
  cull.update(new Frustum().setFromProjectionMatrix(new Matrix4().makeOrthographic(-1e4, 1e4, 1e4, -1e4, -1e4, 1e4)))
  return out
}

const stillOpaque = (root: Object3D): Mesh[] => {
  const out: Mesh[] = []
  root.traverse((o) => {
    const m = o as Mesh
    if (m.isMesh && m.userData.stillCull && !(m.material as Material).transparent && m.name !== 'baked') out.push(m)
  })
  return out
}

describe('still bake', () => {
  it('every zone: the same world triangles, a few kinds, one draw per kind per tile', async () => {
    const { generateZone } = await import('@/game/sim/zoneGen')
    const { ZONES } = await import('@/game/data/zones')
    const { buildTerrain } = await import('@/game/gfx/terrain')
    const { LevelProps } = await import('@/game/gfx/levelProps')
    const { Vfx } = await import('@/game/gfx/vfx')
    const { setGround } = await import('@/game/gfx/ground')
    const { Sim } = await import('@/game/sim/world')
    const { applyPlan, populateZone } = await import('@/game/sim/director')
    const { StillBake, BAKE_TILE } = await import('@/game/gfx/stillBake')
    const bad: string[] = []
    for (const z of ['plains', 'woods', 'crags', 'tundra', 'temple', 'rift'] as const) {
      const plan = generateZone(ZONES[z], 3)
      setGround({ w: plan.w, h: plan.h, height: plan.height })
      const scene = new Scene()
      const terrain = await buildTerrain(plan, ZONES[z].theme, scene, async () => {})
      const sim = new Sim({ seed: 3, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: z })
      applyPlan(sim, plan)
      populateZone(sim, plan, z, [])
      await new LevelProps(sim, new Vfx(scene), terrain.theme).build(plan, scene)

      const before = new Map<string, number>()
      for (const m of stillOpaque(scene)) for (const t of trisOfScene(m, [], 1e9)) before.set(keyOf(t), (before.get(keyOf(t)) ?? 0) + 1)
      const sources = stillOpaque(scene).length
      const spots: Array<[number, number]> = [[plan.start.x, plan.start.z], ...plan.packs.map((k): [number, number] => [k.x, k.z + 3.5])]
      const drawnBefore = await drawnAt(scene, spots)

      const bake = new StillBake()
      await bake.bake(scene)
      if (stillOpaque(scene).length) bad.push(`${z}: ${stillOpaque(scene).length} still meshes left unbaked`)
      expect(bake.replaced).toBe(sources)

      const after = new Map<string, number>()
      for (const t of trisOfScene(bake.root, [], 1e9)) after.set(keyOf(t), (after.get(keyOf(t)) ?? 0) + 1)
      let lost = 0, total = 0, totalAfter = 0
      for (const [k, n] of before) { total += n; if ((after.get(k) ?? 0) !== n) lost++ }
      for (const n of after.values()) totalAfter += n
      // The same count exactly; a corner on a centimetre's edge may round the
      // other way after float32 world maths (~0.1 % of keys), never more.
      if (total !== totalAfter || lost > total * 0.002) bad.push(`${z}: ${lost} triangles differ (${total} → ${totalAfter})`)

      // From the game's camera, summed over the spots: no more triangles than
      // the builders' own tiles drew, and at most 70 % of their draws. Per
      // spot: at most 15 % more triangles (a tile in view whose pieces were not).
      const drawnAfter = await drawnAt(scene, spots)
      const sum = (l: Array<{ tris: number; calls: number }>, k: 'tris' | 'calls'): number => l.reduce((a, b) => a + b[k], 0)
      if (sum(drawnAfter, 'tris') > sum(drawnBefore, 'tris')) bad.push(`${z}: ${sum(drawnBefore, 'tris')} → ${sum(drawnAfter, 'tris')} triangles drawn`)
      if (sum(drawnAfter, 'calls') > sum(drawnBefore, 'calls') * 0.7) bad.push(`${z}: ${sum(drawnBefore, 'calls')} → ${sum(drawnAfter, 'calls')} still draws`)
      drawnAfter.forEach((n, i) => { if (n.tris > drawnBefore[i]!.tris * 1.15) bad.push(`${z} spot ${i}: ${drawnBefore[i]!.tris} → ${n.tris} triangles drawn`) })

      const kinds = new Set<Material>()
      const perTile = new Map<string, number>()
      for (const o of bake.root.children) {
        const m = o as Mesh
        kinds.add(m.material as Material)
        m.geometry.computeBoundingBox()
        const b = m.geometry.boundingBox!
        // A tile's triangles have their centres in it: the box's centre is inside that tile ± a prop's reach.
        const k = `${(m.material as Material).uuid}|${Math.floor((b.min.x + b.max.x) / 2 / BAKE_TILE)},${Math.floor((b.min.z + b.max.z) / 2 / BAKE_TILE)}`
        perTile.set(k, (perTile.get(k) ?? 0) + 1)
      }
      if (kinds.size > MAX_KINDS) bad.push(`${z}: ${kinds.size} kinds of baked surface`)
      const tiles = new Set([...perTile.keys()].map(k => k.split('|')[1]))
      if (bake.made > kinds.size * tiles.size * 1.6) bad.push(`${z}: ${bake.made} draws for ${tiles.size} tiles × ${kinds.size} kinds`)
      bake.dispose()
    }
    expect(bad).toEqual([])
  }, 300_000)
})
