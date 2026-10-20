// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { BackSide, type BufferGeometry, type InstancedMesh, Matrix4, type Mesh, type Object3D, Scene } from 'three'
import { generateZone } from '@/game/sim/zoneGen'
import { ZONES, ZONE_IDS } from '@/game/data/zones'
import { invadedZone } from '@/game/data/invasion'
import { DRESS_ROLE } from '@/game/sim/dressing'
import { LEVEL_PROP_ROLE, SOLID_TOL } from '@/game/gfx/propRoles'
import { stubCanvas } from './zfightTools'
import { worldSpill } from './propCollideTools'

/**
 * The level props a zone's scene holds stand on their colliders
 * (`propCollide.test.ts` has the rule): the merged pieces as `LevelProps`
 * drew them (`LevelProps.trace`: cave mouths, posts, the hint stone, the
 * water's bank stones, the set pieces), and the props that move on their
 * own (chests, cages, ore, the rocks that seal a pocket). The walk grid is
 * the sim's own, doors shut, as the hero meets them.
 */

/** The world geometry of a prop's drawn meshes (outlines and hidden parts left out). */
const worldParts = (root: Object3D): BufferGeometry[] => {
  root.updateMatrixWorld(true)
  const out: BufferGeometry[] = []
  const m = new Matrix4()
  root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh || o.name === 'treasureMound') return
    for (let q: Object3D | null = o; q; q = q.parent) if (!q.visible) return
    const mat = mesh.material as { side?: number; transparent?: boolean }
    if (mat.side === BackSide || mat.transparent) return
    if ((o as InstancedMesh).isInstancedMesh) {
      const im = o as InstancedMesh
      for (let i = 0; i < im.count; i++) {
        im.getMatrixAt(i, m)
        out.push(mesh.geometry.clone().applyMatrix4(m.premultiply(im.matrixWorld)))
      }
      return
    }
    out.push(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld))
  })
  return out
}

describe('level props stand on their colliders', () => {
  it('every zone: the merged pieces, chests, cages, ore and the rocks of a door', async () => {
    stubCanvas()
    const { LevelProps } = await import('@/game/gfx/levelProps')
    const { Vfx } = await import('@/game/gfx/vfx')
    const { setGround, groundAt } = await import('@/game/gfx/ground')
    const { THEMES } = await import('@/game/gfx/terrain')
    const { Sim } = await import('@/game/sim/world')
    const { applyPlan, populateZone } = await import('@/game/sim/director')
    LevelProps.trace = true
    const bad: string[] = []
    const kinds = new Set<string>()
    let solids = 0
    try {
      for (const z of ZONE_IDS) {
        // Two visits, and the afterplay's invaded self (its burning ruins).
        for (const [seed, inv] of [[3, false], [8, false], [3, true]] as const) {
          const odd = seed % 2 === 1
          const plan = generateZone(inv ? invadedZone(z) : ZONES[z], seed, { cage: odd, treasure: !odd })
          setGround({ w: plan.w, h: plan.h, height: plan.height })
          const scene = new Scene()
          const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: z })
          applyPlan(sim, plan)
          populateZone(sim, plan, z, [])
          const lp = new LevelProps(sim, new Vfx(scene), THEMES[ZONES[z].theme])
          await lp.build(plan, scene)
          const at = `${z}${inv ? ' invaded' : ''}#${seed}`
          for (const t of lp.traced) {
            kinds.add(t.kind)
            // Every piece is one the registry names, with the role it gives.
            const role = (LEVEL_PROP_ROLE as Record<string, string>)[t.kind] ?? (DRESS_ROLE as Record<string, string>)[t.kind]
            if (!role) bad.push(`${at}: ${t.kind} is in no registry`)
            if (t.role !== 'solid') continue
            solids++
            const { spill, x, z: zz } = worldSpill(sim.grid, t.geos, groundAt)
            if (spill > SOLID_TOL) bad.push(`${at}: ${t.kind} at ${x.toFixed(1)},${zz.toFixed(1)} reaches ${spill.toFixed(2)} m past its colliders`)
          }
          scene.traverse((o) => {
            if (!['chest', 'cage', 'ore', 'doorRocks'].includes(o.name)) return
            kinds.add(o.name)
            const parts = worldParts(o)
            if (!parts.length) return
            solids++
            const { spill, x, z: zz } = worldSpill(sim.grid, parts, groundAt)
            if (spill > SOLID_TOL) bad.push(`${at}: ${o.name} at ${x.toFixed(1)},${zz.toFixed(1)} reaches ${spill.toFixed(2)} m past its colliders`)
            for (const p of parts) p.dispose()
          })
          for (const t of lp.traced) for (const g of t.geos) g.dispose()
        }
      }
    } finally {
      LevelProps.trace = false
    }
    expect(solids).toBeGreaterThan(400)
    // The kinds a zone holds were all met (a check that the trace sees them).
    for (const k of ['chest', 'cage', 'ore', 'doorRocks', 'caveMouth', 'signpost', 'hintStone', 'gateTower', 'pylon', 'ruin']) expect([...kinds], k).toContain(k)
    expect(bad.slice(0, 30), `${bad.length} level props drawn over walkable ground`).toEqual([])
  }, 120_000)
})
