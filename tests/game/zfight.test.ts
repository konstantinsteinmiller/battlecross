// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { Scene, type Mesh, type Object3D } from 'three'
import { stubCanvas, trisOf, trisOfMesher, trisOfScene, findFights, describe1, type Tri } from './zfightTools'

/**
 * No z-fighting in any static model: no two opaque faces drawn differently
 * that lie in one plane (within 6 mm; 3 mm on the small rigs), face the same
 * way and overlap. Such a pair tears and flickers as the camera moves (the
 * smithy floor did; a town's cobbles showed through house floors).
 *
 * Covered: every house archetype in every style, whole and ruined, closed and
 * enterable (with its interior), one and two storeys; every town prop; every
 * town and fallen Oakhaven as built (terrain, relief, houses, props, fences,
 * rooms open); every zone with its level props; every rig. And the ground is
 * never drawn under a building: the house's own pad is the floor there.
 *
 * `zfight.report.test.ts` lists the fights by the builder line that made them.
 */

stubCanvas()

const fights = (tris: Tri[], tol = 0.006): string[] => findFights(tris, tol, 0.004, 8).map(describe1)

describe('z-fighting: every static model', () => {
  it('every house archetype, whole and ruined, closed and with its room', async () => {
    const { buildHouse } = await import('@/game/gfx/houses')
    const { newKit } = await import('@/game/gfx/archKit')
    const kinds = ['cottage', 'townhouse', 'workshop', 'tavern', 'hall', 'chapel'] as const
    const jobs = ['scholar', 'healer', 'merchant', 'rogue', 'tinker', 'noble', 'alchemist'] as const
    const bad: string[] = []
    for (const style of ['rural', 'mercantile', 'mountain'] as const) {
      for (const ruined of [false, true]) {
        for (const kind of kinds) {
          for (const inside of [false, true]) {
            if (inside && kind === 'workshop') continue
            for (const storeys of [1, 2] as const) {
              const tris: Tri[] = []
              for (let s = 0; s < 3; s++) {
                const k = newKit()
                const cw = kind === 'cottage' ? 4 : 6
                // The door where the town puts it: the middle cell, or the one left of it.
                const h = { kind, i0: 0, j0: 0, cw, cd: inside ? 5 : 4, doorI: Math.floor(cw / 2) - (s % 2), inside, owner: '', owners: [], sign: kind === 'tavern' ? 'tavern' : 'smith', cls: 'pyro', storeys, setback: false, seed: 1000 + s * 77, yard: null, row: 0 } as never
                const o = buildHouse(k, h, { style, ruined, low: false, x: s * 30, y: 0, z: 0, job: jobs[s % jobs.length], cls: 'pyro' })
                for (const [nm, kit] of [['base', k], ['cut', o.cut], ['room', o.room]] as const) {
                  if (kit) for (const [ln, m] of [['hull', kit.hull], ['detail', kit.detail], ['glow', kit.glow]] as const) trisOfMesher(m, `${nm}.${ln}`, tris)
                }
              }
              const f = fights(tris)
              if (f.length) bad.push(`${style} ${kind}${ruined ? ' ruined' : ''}${inside ? ' inside' : ''} ${storeys}st: ${f.join(' | ')}`)
            }
          }
        }
      }
    }
    expect(bad).toEqual([])
  }, 300_000)

  it('every town prop', async () => {
    const { newKit } = await import('@/game/gfx/archKit')
    const { buildProp } = await import('@/game/gfx/townProps')
    const kinds = ['well', 'fountain', 'stall', 'board', 'bench', 'table', 'barrel', 'crates', 'cart', 'hay', 'lamp', 'tree', 'dummy', 'stone', 'rack', 'anvil', 'trough', 'woodpile', 'laundry', 'garden', 'campfire', 'brazier', 'rubble', 'signpost', 'bush', 'planter', 'barrels', 'gate'] as const
    const bad: string[] = []
    for (const style of ['rural', 'mercantile', 'mountain'] as const) {
      for (const ruined of [false, true]) {
        for (const kind of kinds) {
          const k = newKit()
          buildProp(k, { kind, x: 0, z: 0, rot: 0.3, w: 3, v: 5, cells: [] }, { style, ruined, low: false, gy: () => 0 })
          const tris: Tri[] = []
          for (const [ln, m] of [['hull', k.hull], ['detail', k.detail], ['glow', k.glow]] as const) trisOfMesher(m, `${kind}.${ln}`, tris)
          const f = fights(tris)
          if (f.length) bad.push(`${style} ${kind}${ruined ? ' ruined' : ''}: ${f.join(' | ')}`)
        }
      }
    }
    expect(bad).toEqual([])
  }, 120_000)

  it('every town as built, rooms open; and no ground drawn under a building', async () => {
    const { generateTown } = await import('@/game/sim/zoneGen')
    const { TOWNS } = await import('@/game/data/zones')
    const { buildTerrain } = await import('@/game/gfx/terrain')
    const { TownView } = await import('@/game/gfx/townView')
    const { setGround, groundAt } = await import('@/game/gfx/ground')
    const { Sim } = await import('@/game/sim/world')
    const slice = async (): Promise<void> => {}
    const bad: string[] = []
    for (const [t, flags] of [['sunford', []], ['oakhaven', []], ['ironhold', []], ['oakhaven', ['oakhavenFallen']]] as const) {
      const name = `${t}${flags.length ? ' (fallen)' : ''}`
      const plan = generateTown(TOWNS[t], new Set(flags), 7)
      setGround({ w: plan.w, h: plan.h, height: plan.height })
      const scene = new Scene()
      await buildTerrain(plan, flags.length ? 'ruin' : 'town', scene, slice)
      const ground = scene.children.slice()
      const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'town', zone: t })
      const v = await TownView.build(plan, sim, scene, slice, {} as never)
      // Every room open, as the hero sees it from inside; the animals at their
      // homes (the first frame puts them there).
      const tv = v as unknown as { cuts: Array<{ room: { visible: boolean } | null }>; animals: Array<{ obj: Object3D; x: number; z: number }> }
      for (const c of tv.cuts) if (c.room) c.room.visible = true
      for (const a of tv.animals) a.obj.position.set(a.x, groundAt(a.x, a.z), a.z)
      const f = fights(trisOfScene(scene, [], 300))
      if (f.length) bad.push(`${name}: ${f.join(' | ')}`)

      // The terrain draws nothing at ground height inside a footprint (the
      // land sheet far below it is no matter: the house's pad covers it).
      const terrainTris: Tri[] = []
      for (const o of ground) trisOfScene(o, terrainTris, 0)
      for (const b of plan.buildings) {
        const x0 = b.x - b.w / 2 + 0.05, x1 = b.x + b.w / 2 - 0.05
        const z0 = b.z - b.d / 2 + 0.05, z1 = b.z + b.d / 2 - 0.05
        const under = terrainTris.filter((q) => {
          const cx = (q.ax + q.bx + q.cx) / 3, cy = (q.ay + q.by + q.cy) / 3, cz = (q.az + q.bz + q.cz) / 3
          return cx > x0 && cx < x1 && cz > z0 && cz < z1 && cy > groundAt(cx, cz) - 0.1
        })
        if (under.length) bad.push(`${name}: ${under.length} ground faces under the building at ${b.x}, ${b.z}`)
      }

      // And the house closes it: its pad (or its floor, plinth, walls) covers
      // every point of the footprint, the relief applied.
      const town: Tri[] = []
      scene.traverse((o: Object3D) => {
        const m = o as Mesh
        if (m.isMesh && (o.name === 'town' || o.parent?.name === 'town')) trisOf(m.geometry, m.matrixWorld, 'town', town)
      })
      const ups = town.filter(q => q.ny > 0.9)
      const cell = new Map<string, Tri[]>()
      for (const q of ups) {
        const i0 = Math.floor(Math.min(q.ax, q.bx, q.cx)), i1 = Math.floor(Math.max(q.ax, q.bx, q.cx))
        const j0 = Math.floor(Math.min(q.az, q.bz, q.cz)), j1 = Math.floor(Math.max(q.az, q.bz, q.cz))
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const k = `${i},${j}`; const l = cell.get(k); if (l) l.push(q); else cell.set(k, [q]) }
      }
      const inside = (q: Tri, x: number, z: number): boolean => {
        const d = (ax: number, az: number, bx: number, bz: number): number => (bx - ax) * (z - az) - (bz - az) * (x - ax)
        const s1 = d(q.ax, q.az, q.bx, q.bz), s2 = d(q.bx, q.bz, q.cx, q.cz), s3 = d(q.cx, q.cz, q.ax, q.az)
        return (s1 >= -1e-9 && s2 >= -1e-9 && s3 >= -1e-9) || (s1 <= 1e-9 && s2 <= 1e-9 && s3 <= 1e-9)
      }
      for (const b of plan.buildings) {
        const pad = groundAt(b.x, b.z)
        let holes = 0
        for (let x = b.x - b.w / 2 + 0.03; x < b.x + b.w / 2; x += 0.2) {
          for (let z = b.z - b.d / 2 + 0.03; z < b.z + b.d / 2; z += 0.2) {
            const list = cell.get(`${Math.floor(x)},${Math.floor(z)}`) ?? []
            if (!list.some(q => inside(q, x, z) && Math.abs(q.ay - pad) < 0.02)) holes++
          }
        }
        if (holes) bad.push(`${name}: ${holes} points of the building at ${b.x}, ${b.z} with no pad under them`)
      }
    }
    expect(bad).toEqual([])
  }, 300_000)

  it('every zone with its level props', async () => {
    const { generateZone } = await import('@/game/sim/zoneGen')
    const { ZONES } = await import('@/game/data/zones')
    const { buildTerrain } = await import('@/game/gfx/terrain')
    const { LevelProps } = await import('@/game/gfx/levelProps')
    const { Vfx } = await import('@/game/gfx/vfx')
    const { setGround } = await import('@/game/gfx/ground')
    const { Sim } = await import('@/game/sim/world')
    const { applyPlan, populateZone } = await import('@/game/sim/director')
    const bad: string[] = []
    for (const z of ['plains', 'hollows', 'woods', 'crags', 'mines', 'temple', 'fortress'] as const) {
      for (const seed of [3, 11]) {
        const plan = generateZone(ZONES[z], seed)
        setGround({ w: plan.w, h: plan.h, height: plan.height })
        const scene = new Scene()
        const terrain = await buildTerrain(plan, ZONES[z].theme, scene, async () => {})
        const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: z })
        applyPlan(sim, plan)
        populateZone(sim, plan, z, [])
        await new LevelProps(sim, new Vfx(scene), terrain.theme).build(plan, scene)
        const f = fights(trisOfScene(scene, [], 300))
        if (f.length) bad.push(`${z}#${seed}: ${f.join(' | ')}`)
      }
    }
    expect(bad).toEqual([])
  }, 300_000)

  it('every rig, its layered clothing included', async () => {
    const { buildHumanoid } = await import('@/game/gfx/rigs/humanoid')
    const { LOOKS } = await import('@/game/gfx/rigs/looks')
    const cr = await import('@/game/gfx/rigs/creatures')
    const bad: string[] = []
    for (const [id, look] of Object.entries(LOOKS)) {
      for (const d of [0, 1, 2] as const) {
        const f = fights(trisOf(buildHumanoid(look, d).mesh.geometry, null, id, [], 'rig'), 0.003)
        if (f.length) bad.push(`${id} q${d}: ${f.join(' | ')}`)
      }
    }
    const builds: Array<[string, () => { mesh: { geometry: import('three').BufferGeometry } }]> = [
      ['wolf', () => cr.buildBeast('wolf')], ['stalker', () => cr.buildBeast('stalker')], ['spider', () => cr.buildSpider('spider')], ['brood', () => cr.buildSpider('brood')],
      ['treant', () => cr.buildTreant('treant')], ['elder', () => cr.buildTreant('elder')], ['golem', () => cr.buildGolem('iron')], ['colossus', () => cr.buildGolem('colossus')],
      ['fire', () => cr.buildElemental('fire')], ['emberLord', () => cr.buildElemental('emberLord')], ['void', () => cr.buildElemental('void')], ['naga', () => cr.buildNaga('naga')], ['oracle', () => cr.buildNaga('oracle')],
      ['wyvern', () => cr.buildWyvern()], ['dragon', () => cr.buildDragon('void')], ['ally', () => cr.buildDragon('ally')], ['gatling', () => cr.buildTurret('gatling')], ['rocket', () => cr.buildTurret('rocket')]
    ]
    for (const [id, b] of builds) {
      const f = fights(trisOf(b().mesh.geometry, null, id, [], 'rig'), 0.003)
      if (f.length) bad.push(`${id}: ${f.join(' | ')}`)
    }
    expect(bad).toEqual([])
  }, 120_000)

  it('the detector finds a fight, and lets a real step or a same-look overlap be', () => {
    const quad = (y: number, x0: number, tag: string, look?: string): Tri[] => {
      const t = (ax: number, az: number, bx: number, bz: number, cx: number, cz: number): Tri =>
        ({ ax, ay: y, az, bx, by: y, bz, cx, cy: y, cz, nx: 0, ny: 1, nz: 0, d: y, tag, look })
      return [t(x0, 1, x0 + 1, 1, x0 + 1, 0), t(x0, 1, x0 + 1, 0, x0, 0)]
    }
    expect(findFights([...quad(0, 0, 'a', 'x'), ...quad(0.002, 0.5, 'b', 'y')]).length).toBeGreaterThan(0)
    // A real step (2 cm), or two faces drawn exactly alike, cannot flicker.
    expect(findFights([...quad(0, 0, 'a', 'x'), ...quad(0.02, 0.5, 'b', 'y')])).toEqual([])
    expect(findFights([...quad(0, 0, 'a', 'x'), ...quad(0.002, 0.5, 'b', 'x')])).toEqual([])
    // Touching edges are not an overlap.
    expect(findFights([...quad(0, 0, 'a', 'x'), ...quad(0, 1, 'b', 'y')])).toEqual([])
  })
})
