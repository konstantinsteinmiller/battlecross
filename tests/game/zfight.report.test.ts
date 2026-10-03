// @vitest-environment jsdom
import { it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { Scene } from 'three'
import { stubCanvas, trisOf, trisOfScene, findFights, describe1, type Tri } from './zfightTools'

stubCanvas()

const out: string[] = []
const report = (name: string, tris: Tri[], tol = 0.006): void => {
  const f = findFights(tris, tol)
  out.push(`${name}: ${f.length} fights (${tris.length} tris)`)
  for (const x of f.slice(0, 8)) out.push('   ' + describe1(x))
}

it('houses and props', async () => {
  const { buildHouse } = await import('@/game/gfx/houses')
  const { newKit } = await import('@/game/gfx/archKit')
  const { buildProp } = await import('@/game/gfx/townProps')
  const kinds = ['cottage', 'townhouse', 'workshop', 'tavern', 'hall', 'chapel'] as const
  const jobs = ['scholar', 'healer', 'merchant', 'rogue', 'tinker', 'noble', 'alchemist'] as const
  for (const style of ['rural', 'mercantile', 'mountain'] as const) {
    for (const ruined of [false, true]) {
      for (const kind of kinds) {
        for (const inside of [false, true]) {
          if (inside && kind === 'workshop') continue
          for (const storeys of [1, 2] as const) {
            const tris: Tri[] = []
            for (let s = 0; s < 3; s++) {
              const k = newKit()
              const h = { kind, i0: 0, j0: 0, cw: kind === 'cottage' ? 4 : 6, cd: inside ? 5 : 4, doorI: 3, inside, owner: '', owners: [], sign: kind === 'tavern' ? 'tavern' : 'smith', cls: 'pyro', storeys, setback: false, seed: 1000 + s * 77, yard: null, row: 0 } as never
              const o = buildHouse(k, h, { style, ruined, low: false, x: s * 30, y: 0, z: 0, job: jobs[s % jobs.length], cls: 'pyro' })
              for (const kit of [k, o.cut, o.room]) if (kit) for (const m of [kit.hull, kit.detail, kit.glow]) trisOf(m.build(), null, `${kind}`, tris)
            }
            report(`house ${style} ${kind}${ruined ? ' ruined' : ''}${inside ? ' inside' : ''} ${storeys}st`, tris)
          }
        }
      }
    }
  }
  const pk = ['well', 'fountain', 'stall', 'board', 'bench', 'table', 'barrel', 'crates', 'cart', 'hay', 'lamp', 'tree', 'dummy', 'stone', 'rack', 'anvil', 'trough', 'woodpile', 'laundry', 'garden', 'campfire', 'brazier', 'rubble', 'signpost', 'bush', 'planter', 'barrels', 'gate'] as const
  for (const style of ['rural', 'mercantile', 'mountain'] as const) {
    for (const ruined of [false, true]) {
      for (const kind of pk) {
        const k = newKit()
        buildProp(k, { kind, x: 0, z: 0, rot: 0.3, w: 3, v: 5, cells: [] }, { style, ruined, low: false, gy: () => 0 })
        const tris: Tri[] = []
        for (const m of [k.hull, k.detail, k.glow]) trisOf(m.build(), null, kind, tris)
        const f = findFights(tris)
        if (f.length) report(`prop ${style} ${kind}${ruined ? ' ruined' : ''}`, tris)
      }
    }
  }
  writeFileSync(process.env.DUMP ?? 'zf.txt', out.join('\n'))
})

it('whole towns and zones', async () => {
  const { generateTown, generateZone } = await import('@/game/sim/zoneGen')
  const { TOWNS, ZONES } = await import('@/game/data/zones')
  const { buildTerrain } = await import('@/game/gfx/terrain')
  const { TownView } = await import('@/game/gfx/townView')
  const { LevelProps } = await import('@/game/gfx/levelProps')
  const { Vfx } = await import('@/game/gfx/vfx')
  const { setGround } = await import('@/game/gfx/ground')
  const { Sim } = await import('@/game/sim/world')
  const { applyPlan, populateZone } = await import('@/game/sim/director')
  const slice = async (): Promise<void> => {}
  for (const [t, f] of [['sunford', []], ['oakhaven', []], ['ironhold', []], ['oakhaven', ['oakhavenFallen']]] as const) {
    const plan = generateTown(TOWNS[t], new Set(f), 7)
    setGround({ w: plan.w, h: plan.h, height: plan.height })
    const scene = new Scene()
    await buildTerrain(plan, f.length ? 'ruin' : 'town', scene, slice)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'town', zone: t })
    const v = await TownView.build(plan, sim, scene, slice, {} as never)
    for (const c of (v as unknown as { cuts: Array<{ room: { visible: boolean } | null }> }).cuts) if (c.room) c.room.visible = true
    report(`town ${t}${f.length ? ' fallen' : ''}`, trisOfScene(scene, [], 300))
  }
  for (const z of ['plains', 'hollows', 'woods', 'crags', 'mines', 'temple', 'fortress'] as const) {
    for (const seed of [3, 11]) {
      const plan = generateZone(ZONES[z], seed)
      setGround({ w: plan.w, h: plan.h, height: plan.height })
      const scene = new Scene()
      const terrain = await buildTerrain(plan, ZONES[z].theme, scene, slice)
      const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: z })
      applyPlan(sim, plan)
      populateZone(sim, plan, z, [])
      const vfx = new Vfx(scene)
      const lp = new LevelProps(sim, vfx, terrain.theme)
      lp.build(plan, scene)
      report(`zone ${z}#${seed}`, trisOfScene(scene, [], 300))
    }
  }
  writeFileSync((process.env.DUMP ?? 'zf.txt') + '.scenes.txt', out.join('\n'))
})

it('rigs', async () => {
  const { buildHumanoid } = await import('@/game/gfx/rigs/humanoid')
  const { LOOKS } = await import('@/game/gfx/rigs/looks')
  const cr = await import('@/game/gfx/rigs/creatures')
  out.length = 0
  for (const [id, look] of Object.entries(LOOKS)) {
    for (const d of [0, 1, 2] as const) {
      const rig = buildHumanoid(look, d)
      report(`rig ${id} q${d}`, trisOf(rig.mesh.geometry, null, id), 0.003)
    }
  }
  const builds: Array<[string, () => { mesh: { geometry: import('three').BufferGeometry } }]> = [
    ['wolf', () => cr.buildBeast('wolf')], ['stalker', () => cr.buildBeast('stalker')], ['spider', () => cr.buildSpider('spider')], ['brood', () => cr.buildSpider('brood')],
    ['treant', () => cr.buildTreant('treant')], ['elder', () => cr.buildTreant('elder')], ['golem', () => cr.buildGolem('iron')], ['colossus', () => cr.buildGolem('colossus')],
    ['fire', () => cr.buildElemental('fire')], ['emberLord', () => cr.buildElemental('emberLord')], ['void', () => cr.buildElemental('void')], ['naga', () => cr.buildNaga('naga')], ['oracle', () => cr.buildNaga('oracle')],
    ['wyvern', () => cr.buildWyvern()], ['dragon', () => cr.buildDragon('void')], ['ally', () => cr.buildDragon('ally')], ['gatling', () => cr.buildTurret('gatling')], ['rocket', () => cr.buildTurret('rocket')]
  ]
  for (const [id, b] of builds) report(`creature ${id}`, trisOf(b().mesh.geometry, null, id), 0.003)
  writeFileSync((process.env.DUMP ?? 'zf.txt') + '.rigs.txt', out.join('\n'))
})
