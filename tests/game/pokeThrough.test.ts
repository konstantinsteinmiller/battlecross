// @vitest-environment jsdom
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BackSide, type BufferGeometry, type InstancedMesh, Matrix4, type Mesh, type Object3D, Scene } from 'three'
import '../stubs/lazyCode'
import { stubCanvas } from './zfightTools'
import { installFrameTrace, jointOf, partsOfGeo, partsOfMesher, pokes, type Hit, type Joint, type Part } from './pokeTools'
import { JOINTS } from './pokeJoints'

/**
 * No part of a prop pokes through another (`pokeTools.ts` has the rules): the
 * hint stone's heap came out through its carved face once the collision fit
 * squeezed it forward. Every multi-part prop the game draws, as its own
 * builder makes it: the level props of every zone (two seeds each, the first
 * visit too), every set piece (six seeds), every shape of terrain scenery,
 * every town prop in every style, whole and ruined, the fences and town
 * stones of every town, every house archetype with its room, the training
 * dummy, the reward chest and the arena's stands.
 *
 * `pokeJoints.ts` names the meetings that are meant (a strap round a chest,
 * timber set into plaster); anything else fails. Every prop kind in the
 * registries (`propRoles.ts`, `DRESS_ROLE`) must be met, and every module
 * that builds from the kits must be audited here or say why not (`MODULES`).
 */

/** `POKE_REPORT=<file>`: write every hit, joints included, to a file. */
const REPORT = process.env.POKE_REPORT

let undo: () => void = () => {}
beforeAll(() => {
  stubCanvas()
  undo = installFrameTrace()
})
afterAll(() => undo())

/** Every hit, by prop kind, rule and the pair of parts. */
const found = new Map<string, { hits: Hit[]; where: string[]; joint?: Joint }>()
const kindsSeen = new Set<string>()
const jointsUsed = new Set<Joint>()
let frameMisses = 0

const audit = (kind: string, where: string, parts: Part[]): void => {
  kindsSeen.add(kind)
  const r = pokes(parts)
  frameMisses += r.frameMisses
  for (const h of r.hits) {
    const key = `${kind} | ${h.rule} | ${h.box} [${h.boxSize}] <- ${h.part} [${h.partSize}]`
    const joint = jointOf(JOINTS, h)
    if (joint) jointsUsed.add(joint)
    const f = found.get(key) ?? { hits: [], where: [], joint }
    f.hits.push(h)
    if (f.where.length < 3 && !f.where.includes(where)) f.where.push(where)
    found.set(key, f)
  }
}

const geoParts = (geos: readonly BufferGeometry[]): Part[] => geos.flatMap(g => partsOfGeo(g))

/** The world geometry of a mesh tree (outlines and hidden parts left out). */
const worldGeos = (root: Object3D): BufferGeometry[] => {
  root.updateMatrixWorld(true)
  const out: BufferGeometry[] = []
  const m = new Matrix4()
  root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh) return
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

/**
 * Every module that builds props from the kits (`kit.ts`, `archKit.ts`):
 * audited here, or why not. A new builder fails until it is listed.
 */
const MODULES: Record<string, string> = {
  'gfx/levelProps.ts': 'audited: level props of every zone',
  'gfx/setPieces.ts': 'audited: set pieces',
  'gfx/terrain.ts': 'audited: scenery shapes and the reward chest',
  'gfx/townProps.ts': 'audited: town props, fences and town stones',
  'gfx/houses.ts': 'audited: houses',
  'gfx/interiors.ts': 'audited: the rooms of the houses, and the town props it lends (armour stand, pack)',
  'gfx/plants.ts': 'audited: the herbs of the level props',
  'gfx/dummyProp.ts': 'audited: the training dummy',
  'gfx/arenaCrowd.ts': 'audited: the arena\'s stands and banners',
  'gfx/townView.ts': 'composes houses and props it does not shape (audited as built)',
  'gfx/archKit.ts': 'the building mesher itself',
  'gfx/townAnimals.ts': 'animated rigs (zfight covers every pose)',
  'gfx/rigs/anim.ts': 'animated rigs',
  'gfx/rigs/creatures.ts': 'animated rigs',
  'gfx/rigs/handProps.ts': 'held by animated rigs',
  'gfx/rigs/humanoid.ts': 'animated rigs',
  'gfx/rigs/index.ts': 'animated rigs'
}

describe('poke-through: no part of a prop shows through another', () => {
  it('every module that builds from the kits is audited or says why not', () => {
    const root = 'src/game/'
    const walk = (d: string): string[] => readdirSync(root + d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(`${d}/${e.name}`) : e.name.endsWith('.ts') ? [`${d}/${e.name}`] : []))
    const users = walk('gfx').filter(f => /from '\.\.?\/(\.\.\/)?(kit|archKit)'/.test(readFileSync(root + f, 'utf8')))
    expect(users.filter(f => !MODULES[f]), 'builders nobody audits for poke-through').toEqual([])
    expect(Object.keys(MODULES).filter(f => !users.includes(f)), 'listed, but no longer a builder').toEqual([])
  })

  it('set pieces', async () => {
    const { setPiece, piecePalette } = await import('@/game/gfx/setPieces')
    const { DRESS_ROLE } = await import('@/game/sim/dressing')
    const pal = piecePalette('#7a8a5a', '#3a4a2a')
    for (const kind of Object.keys(DRESS_ROLE) as Array<keyof typeof DRESS_ROLE>) {
      for (const seed of [1, 2, 3, 4, 5, 6]) {
        const g = setPiece(kind, pal, seed)
        audit(kind, `seed ${seed}`, geoParts([...g.lit, ...g.glow]))
      }
    }
  })

  it('terrain scenery shapes, and the reward chest', async () => {
    const { THEMES, buildChest, layTerrainProps } = await import('@/game/gfx/terrain')
    const { generateZone } = await import('@/game/sim/zoneGen')
    const { generateTown } = await import('@/game/sim/townGen')
    const { ZONES, ZONE_IDS, TOWNS } = await import('@/game/data/zones')
    const shapes = new Set<import('@/game/gfx/terrain').PropShape>()
    for (const th of Object.values(THEMES)) for (const s of [...th.border, ...th.decor]) shapes.add(s)
    for (const id of ZONE_IDS) for (const seed of [5, 9]) for (const g of layTerrainProps(generateZone(ZONES[id], seed), ZONES[id].theme)) shapes.add(g.shape)
    for (const [t, f] of [['oakhaven', []], ['ironhold', []], ['oakhaven', ['oakhavenFallen']]] as const) for (const g of layTerrainProps(generateTown(TOWNS[t], new Set(f), 7), f.length ? 'ruin' : 'town')) shapes.add(g.shape)
    for (const s of shapes) {
      const b = s.build()
      audit(s.kind, 'shape', geoParts([...b.lit, ...(b.glow ?? [])]))
    }
    audit('rewardChest', 'zone', geoParts(worldGeos(buildChest().root)))
  }, 60_000)

  it('town props in every style, whole and ruined; every town\'s fences and town stones', async () => {
    const { newKit } = await import('@/game/gfx/archKit')
    const { buildFences, buildProp, buildTownStone } = await import('@/game/gfx/townProps')
    const { TOWN_PROP_ROLE } = await import('@/game/gfx/propRoles')
    const { generateTown } = await import('@/game/sim/townGen')
    const { TOWNS } = await import('@/game/data/zones')
    const meshers = (k: ReturnType<typeof newKit>): Part[] => [k.hull, k.detail, k.glow].flatMap(m => partsOfMesher(m))
    for (const style of ['rural', 'mercantile', 'mountain'] as const) {
      for (const ruined of [false, true]) {
        for (const kind of Object.keys(TOWN_PROP_ROLE) as Array<keyof typeof TOWN_PROP_ROLE>) {
          // Both variants: w 3 / v 5, and w 1 / v 4 (a taproom's table with a pack, the broken cart).
          for (const [w, v] of [[3, 5], [1, 4]] as const) {
            const k = newKit()
            buildProp(k, { kind, x: 0, z: 0, rot: 0.3, w, v, cells: [] }, { style, ruined, low: false, gy: () => 0 })
            audit(`town:${kind}`, `${style}${ruined ? ' ruined' : ''} w${w} v${v}`, meshers(k))
          }
        }
      }
    }
    for (const [t, flags] of [['sunford', []], ['oakhaven', []], ['ironhold', []], ['silverbridge', []], ['oakhaven', ['oakhavenFallen']]] as const) {
      const plan = generateTown(TOWNS[t], new Set(flags), 7)
      const town = plan.town!
      const ctx = { style: town.style, ruined: town.ruined, low: false, gy: () => 0 }
      // Every prop as the town places it.
      for (const p of town.props) {
        const k = newKit()
        buildProp(k, p, ctx)
        audit(`town:${p.kind}`, `${t}${flags.length ? ' (fallen)' : ''}`, meshers(k))
      }
      const k = newKit()
      buildFences(k, town, plan.w, plan.h, ctx)
      buildTownStone(k, town, plan.w, plan.h, ctx)
      audit('town:fences', `${t}${flags.length ? ' (fallen)' : ''}`, meshers(k))
    }
  }, 60_000)

  it('houses and their rooms', async () => {
    const { newKit } = await import('@/game/gfx/archKit')
    type Kit = ReturnType<typeof newKit>
    // As they are seen together (`TownView`): from outside, the house whole with
    // its room through the doorway; inside, its front lifted off (the cut) and
    // the room's small things shown.
    const auditHouse = (kind: string, where: string, k: Kit, o: { cut: Kit | null; room: Kit | null; clutter: Kit | null }): void => {
      for (const kits of [[k, o.cut, o.room], [k, o.room, o.clutter]]) {
        const ks = kits.filter((q, i, a): q is Kit => !!q && a.indexOf(q) === i)
        audit(kind, where, ks.flatMap(q => [q.hull, q.detail, q.glow]).flatMap(m => partsOfMesher(m)))
      }
    }
    const { buildHouse } = await import('@/game/gfx/houses')
    // Every sign a house hangs out, in turn.
    const SIGNS = ['smith', 'armor', 'weapons', 'trinkets', 'healer', 'tavern', 'class', 'guard', 'black'] as const
    let n = 0
    for (const style of ['rural', 'mercantile', 'mountain'] as const) {
      for (const ruined of [false, true]) {
        for (const kind of ['cottage', 'townhouse', 'workshop', 'tavern', 'hall', 'chapel'] as const) {
          for (const inside of [false, true]) {
            if (inside && kind === 'workshop') continue
            for (const storeys of [1, 2] as const) {
              const k = newKit()
              const cw = kind === 'cottage' ? 4 : 6
              const h = { kind, i0: 0, j0: 0, cw, cd: inside ? 5 : 4, doorI: Math.floor(cw / 2), inside, owner: '', owners: [], sign: kind === 'tavern' ? 'tavern' : SIGNS[n++ % SIGNS.length], cls: 'pyro', storeys, setback: false, seed: 1000 + storeys * 77, yard: null, row: 0 } as never
              const o = buildHouse(k, h, { style, ruined, low: false, x: 0, y: 0, z: 0, job: 'merchant', cls: 'pyro' })
              auditHouse(`house:${kind}`, `${style}${ruined ? ' ruined' : ''}${inside ? ' inside' : ''} ${storeys}st`, k, o)
            }
          }
        }
      }
    }
    // And every house of every town as the town builds it (its signs, awnings and rooms).
    const { generateTown } = await import('@/game/sim/townGen')
    const { TOWNS } = await import('@/game/data/zones')
    const { roomPropsOf } = await import('@/game/gfx/houses')
    for (const [t, flags] of [['sunford', []], ['oakhaven', []], ['ironhold', []], ['silverbridge', []], ['oakhaven', ['oakhavenFallen']]] as const) {
      const town = generateTown(TOWNS[t], new Set(flags), 7).town!
      town.houses.forEach((h, hi) => {
        const k = newKit()
        const o = buildHouse(k, h, { style: town.style, ruined: town.ruined, low: false, x: 0, y: 0, z: 0, cls: h.cls, inRoom: h.inside ? roomPropsOf(town, hi) : undefined })
        auditHouse(`house:${h.kind}`, `${t}${flags.length ? ' (fallen)' : ''} house ${hi}`, k, o)
      })
    }
  }, 120_000)

  it('level props of every zone, the training dummy and the arena\'s stands', async () => {
    const { LevelProps } = await import('@/game/gfx/levelProps')
    const { Vfx } = await import('@/game/gfx/vfx')
    const { setGround } = await import('@/game/gfx/ground')
    const { THEMES } = await import('@/game/gfx/terrain')
    const { buildParts } = await import('@/game/gfx/dummyProp')
    const { ArenaCrowd } = await import('@/game/gfx/arenaCrowd')
    const { Sim } = await import('@/game/sim/world')
    const { applyPlan, populateZone } = await import('@/game/sim/director')
    const { generateArena, generateZone } = await import('@/game/sim/zoneGen')
    const { ZONES, ZONE_IDS } = await import('@/game/data/zones')
    // Moving props the scene holds (their own meshes, not the merged pieces).
    const MOVING = ['chest', 'cage', 'ore', 'doorRocks', 'plate', 'herb', 'key']
    LevelProps.trace = true
    try {
      for (const z of ZONE_IDS) {
        for (const seed of [3, 8, 0]) {
          const odd = seed % 2 === 1
          const plan = seed ? generateZone(ZONES[z], seed, { cage: odd, treasure: !odd }) : generateZone(ZONES[z], 3, { tutorial: true, openingPack: 2 })
          const at = `${z}#${seed || 'first'}`
          setGround({ w: plan.w, h: plan.h, height: plan.height })
          const scene = new Scene()
          const sim = new Sim({ seed: seed || 3, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: z })
          applyPlan(sim, plan)
          populateZone(sim, plan, z, [])
          const lp = new LevelProps(sim, new Vfx(scene), THEMES[ZONES[z].theme])
          await lp.build(plan, scene)
          for (const t of lp.traced) audit(t.kind, at, geoParts(t.geos))
          scene.traverse((o) => {
            if (!MOVING.includes(o.name)) return
            // A buried chest under its heap of earth is one prop.
            if (o.getObjectByName('treasureMound')) kindsSeen.add('treasureMound')
            audit(o.name, at, geoParts(worldGeos(o)))
          })
          for (const t of lp.traced) for (const g of t.geos) g.dispose()
        }
      }
    } finally {
      LevelProps.trace = false
    }
    const d = buildParts()
    audit('dummy', 'rest', geoParts([d.post, d.arms, d.body, d.head]))
    const crowd = new ArenaCrowd(generateArena(5), { burst: () => {} } as never, false)
    audit('arena', 'seed 5', geoParts(worldGeos(crowd.root)))
  }, 180_000)

  it('every prop kind was met, and nothing pokes through but the joints named', async () => {
    const { LEVEL_PROP_ROLE, SCENERY_ROLE, TOWN_PROP_ROLE } = await import('@/game/gfx/propRoles')
    const { DRESS_ROLE } = await import('@/game/sim/dressing')
    const lines = [...found.entries()].map(([k, f]) => `${f.joint ? 'joint ' : 'HIT   '}${k}  x${f.hits.length} @${f.hits[0]!.at.map(c => c.toFixed(2)).join(',')} [${f.where.join('; ')}]`).sort()
    if (REPORT) writeFileSync(REPORT, `frame misses ${frameMisses}\nkinds ${[...kindsSeen].sort().join(' ')}\n${lines.join('\n')}\n`)
    const want = [
      ...Object.keys(LEVEL_PROP_ROLE), ...Object.keys(DRESS_ROLE), ...Object.keys(SCENERY_ROLE),
      ...Object.keys(TOWN_PROP_ROLE).map(k => `town:${k}`), 'town:fences', 'rewardChest', 'dummy', 'arena',
      ...['cottage', 'townhouse', 'workshop', 'tavern', 'hall', 'chapel'].map(k => `house:${k}`)
    ]
    expect(want.filter(k => !kindsSeen.has(k)), 'prop kinds the audit never met').toEqual([])
    // Every box is checked in its own frame: none bent out of it after it was made.
    expect(frameMisses).toBe(0)
    expect(lines.filter(l => l.startsWith('HIT')).slice(0, 40)).toEqual([])
    // The list holds only joints that still occur.
    expect(JOINTS.filter(j => !jointsUsed.has(j)).map(j => `${j.box} <- ${j.part}: ${j.why}`)).toEqual([])
  })
})
