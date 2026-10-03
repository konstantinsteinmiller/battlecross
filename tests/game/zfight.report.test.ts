// @vitest-environment jsdom
import { it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { Scene } from 'three'
import { stubCanvas, trisOf, trisOfMesher, trisOfScene, findFights, describe1, type Tri } from './zfightTools'
import { Mesher } from '@/game/gfx/archKit'

stubCanvas()
Mesher.trace = true
// One stack capture per primitive call (not per vertex): the builder and line that asked for it.
{
  const where = (): string => {
    for (const l of (new Error().stack ?? '').split('\n')) {
      if (!l.includes(' at ') || l.includes('archKit') || l.includes('zfight')) continue
      const m = /at (\S+) .*?([A-Za-z]+\.ts):(\d+)/.exec(l)
      if (m) return `${m[1]}@${m[2]}:${m[3]}`
    }
    return '?'
  }
  const proto = Mesher.prototype as unknown as Record<string, (...a: unknown[]) => unknown>
  for (const name of ['quad', 'tri', 'box', 'cbox', 'beam', 'prism', 'cyl', 'disc', 'ball', 'geo']) {
    const orig = proto[name]!
    proto[name] = function (this: Mesher, ...a: unknown[]) {
      const own = !this.tag
      if (own) this.tag = where()
      try { return orig.apply(this, a) } finally { if (own) this.tag = '' }
    }
  }
}

const DUMP = process.env.DUMP ?? 'zf.txt'
const report = (out: string[], name: string, tris: Tri[], tol = 0.006): void => {
  const f = findFights(tris, tol, 0.004, 5000)
  if (!f.length) { out.push(`${name}: 0`); return }
  out.push(`${name}: ${f.length} fights (${tris.length} tris)`)
  const by = new Map<string, number>()
  for (const x of f) {
    const k = [x.a.tag.split('#')[0], x.b.tag.split('#')[0]].sort().join(' vs ')
    by.set(k, (by.get(k) ?? 0) + 1)
  }
  for (const [k, n] of by) { out.push(`   ${n} x ${k}`); ALL.set(k, (ALL.get(k) ?? 0) + n); if (!EX.has(k)) EX.set(k, describe1(f.find(x => [x.a.tag.split('#')[0], x.b.tag.split('#')[0]].sort().join(' vs ') === k)!)) }
  for (const x of f.slice(0, 6)) out.push('   ' + describe1(x))
  const focus = process.env.FOCUS
  if (focus) {
    const v = (t: Tri): string => `[${t.tag}] (${[t.ax, t.ay, t.az].map(q => q.toFixed(3))}) (${[t.bx, t.by, t.bz].map(q => q.toFixed(3))}) (${[t.cx, t.cy, t.cz].map(q => q.toFixed(3))}) ${t.look}`
    for (const x of f.filter(x => x.a.tag.includes(focus) || x.b.tag.includes(focus)).slice(0, 4)) FOC.push(`${name}\n  ${v(x.a)}\n  ${v(x.b)}`)
  }
}
const FOC: string[] = []
const ALL = new Map<string, number>()
const EX = new Map<string, string>()
const summary = (): string => [...ALL].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${String(n).padStart(6)}  ${k}\n          e.g. ${EX.get(k)}`).join('\n')

it('houses and props', async () => {
  const out: string[] = []
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
              const cw = kind === 'cottage' ? 4 : 6
              const h = { kind, i0: 0, j0: 0, cw, cd: inside ? 5 : 4, doorI: Math.floor(cw / 2) - (s % 2), inside, owner: '', owners: [], sign: kind === 'tavern' ? 'tavern' : 'smith', cls: 'pyro', storeys, setback: false, seed: 1000 + s * 77, yard: null, row: 0 } as never
              const o = buildHouse(k, h, { style, ruined, low: false, x: s * 30, y: 0, z: 0, job: jobs[s % jobs.length], cls: 'pyro' })
              const parts: Array<[string, import('@/game/gfx/archKit').Kit | null]> = [['base', k], ['cut', o.cut], ['room', o.room]]
              for (const [nm, kit] of parts) if (kit) for (const [ln, m] of [['hull', kit.hull], ['detail', kit.detail], ['glow', kit.glow]] as const) trisOfMesher(m, `${nm}.${ln}:`, tris)
            }
            report(out, `house ${style} ${kind}${ruined ? ' ruined' : ''}${inside ? ' inside' : ''} ${storeys}st`, tris)
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
        for (const [ln, m] of [['hull', k.hull], ['detail', k.detail], ['glow', k.glow]] as const) trisOfMesher(m, `${kind}.${ln}:`, tris)
        report(out, `prop ${style} ${kind}${ruined ? ' ruined' : ''}`, tris)
      }
    }
  }
  writeFileSync(DUMP, out.join('\n'))
  writeFileSync(DUMP + '.summary.txt', summary())
  if (FOC.length) writeFileSync(DUMP + '.focus.txt', FOC.join('\n'))
}, 300_000)

it('whole towns and zones', async () => {
  const out: string[] = []
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
    // Every room open, as the hero would see it from inside.
    for (const c of (v as unknown as { cuts: Array<{ room: { visible: boolean } | null }> }).cuts) if (c.room) c.room.visible = true
    report(out, `town ${t}${f.length ? ' fallen' : ''}`, trisOfScene(scene, [], 300))
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
      const lp = new LevelProps(sim, new Vfx(scene), terrain.theme)
      lp.build(plan, scene)
      report(out, `zone ${z}#${seed}`, trisOfScene(scene, [], 300))
    }
  }
  writeFileSync(DUMP + '.scenes.txt', out.join('\n'))
}, 600_000)

it('rigs', async () => {
  const out: string[] = []
  const { buildHumanoid } = await import('@/game/gfx/rigs/humanoid')
  const { LOOKS } = await import('@/game/gfx/rigs/looks')
  const cr = await import('@/game/gfx/rigs/creatures')
  for (const [id, look] of Object.entries(LOOKS)) {
    for (const d of [0, 1, 2] as const) report(out, `rig ${id} q${d}`, trisOf(buildHumanoid(look, d).mesh.geometry, null, id), 0.003)
  }
  const builds: Array<[string, () => { mesh: { geometry: import('three').BufferGeometry } }]> = [
    ['wolf', () => cr.buildBeast('wolf')], ['stalker', () => cr.buildBeast('stalker')], ['spider', () => cr.buildSpider('spider')], ['brood', () => cr.buildSpider('brood')],
    ['treant', () => cr.buildTreant('treant')], ['elder', () => cr.buildTreant('elder')], ['golem', () => cr.buildGolem('iron')], ['colossus', () => cr.buildGolem('colossus')],
    ['fire', () => cr.buildElemental('fire')], ['emberLord', () => cr.buildElemental('emberLord')], ['void', () => cr.buildElemental('void')], ['naga', () => cr.buildNaga('naga')], ['oracle', () => cr.buildNaga('oracle')],
    ['wyvern', () => cr.buildWyvern()], ['dragon', () => cr.buildDragon('void')], ['ally', () => cr.buildDragon('ally')], ['gatling', () => cr.buildTurret('gatling')], ['rocket', () => cr.buildTurret('rocket')]
  ]
  for (const [id, b] of builds) report(out, `creature ${id}`, trisOf(b().mesh.geometry, null, id), 0.003)
  writeFileSync(DUMP + '.rigs.txt', out.join('\n'))
}, 300_000)
