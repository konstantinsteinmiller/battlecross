import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Sim, outOfReach } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { applyPlan, populateZone } from '@/game/sim/director'
import { stepSim } from '@/game/sim/step'
import { generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { CELL } from '@/game/sim/grid'
import { ZONES, OPENING } from '@/game/data/zones'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import { INTRO_ACTS } from '@/game/intro/script'
import { INTRO_FIGHT_AT, getSong, stepSeconds } from '@/game/audio/songs'
import { SFX_NAMES } from '@/game/audio/sfx'
import { conversationOf } from '@/game/data/dialogs'
import { CAPTIVE_BARKS } from '@/game/data/dialogs/captives'
import { meets } from '@/game/dialog/conditions'
import type { DialogWorld } from '@/game/dialog/types'
import { LOOKS } from '@/game/gfx/rigs/looks'
import { CAMEO_FLAG, CAMEO_TIP, flagSet, profile } from '@/game/state/profile'
import en from '@/i18n/locales/en'
import {
  CAMEO_ACTS, CAMEO_BEAST, CAMEO_BLOWS, CAMEO_DELAY, CAMEO_END, CAMEO_FOE_NEAR, CAMEO_FROM, CAMEO_HERO, CAMEO_LINE, CAMEO_TOWER,
  armCameo, beginCameo, cameoDue, cameoUnits, clearCameoUnits, stageCameo, stepCameo, tryStartCameo, type CameoStage, type ScreenToGround
} from '@/game/coach/cameo'

/**
 * The gunslinger on the plains (roadmap #210): after the opening fight's pack of four falls, a hunter and a chimera pass
 * through the top (or bottom) of the view, on the beat of the intro's fight cue; the player's hero says one line; the
 * aether master in Silverbridge, the same man, knows the hero on their first meeting.
 */

const DT = 1 / 60
const at = (act: string, n = 0): number => CAMEO_ACTS.filter(b => b.act === act)[n]!.at

const visit = (seed = 7): { sim: Sim; plan: ZonePlan } => {
  const plan = generateZone(ZONES.plains, seed, { tutorial: true, openingPack: OPENING.pack })
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: ['shieldSlam'], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, 'plains', [])
  return { sim, plan }
}

/** Packs 0 and 1 fall; the hero stands where the second one stood. */
const packsDown = (sim: Sim, plan: ZonePlan): void => {
  const g = plan.packs[1]!
  sim.hero.unit.x = sim.hero.unit.px = g.x
  sim.hero.unit.z = sim.hero.unit.pz = g.z
  for (const u of sim.units) if (u.team === 1 && (u.group === 0 || u.group === 1)) { u.hp = 0; u.alive = false }
  stepSim(sim, plan, DT)
}

/** A flat camera over the hero: the view spans `w` metres across and `d` deep, +x to the right, +z toward the bottom. */
const view = (sim: Sim, w = 20, d = 12): ScreenToGround => (fx, fy) => ({ x: sim.hero.unit.x + (fx - 0.5) * w, z: sim.hero.unit.z + (fy - 0.5) * d })

/** No pack sleeps in the view (the next one may lie up the road, and the two never land among goblins). */
const noFoes = (sim: Sim): void => { for (const u of [...sim.units]) if (u.team === 1) sim.dismiss(u) }

/** A view over open ground, wherever this seed's road runs: the grid is cleared round the hero. */
const openGround = (sim: Sim, r = 26): void => {
  const g = sim.grid
  const h = sim.hero.unit
  for (let j = 0; j < g.h; j++) for (let i = 0; i < g.w; i++) {
    const x = (i + 0.5) * CELL
    const z = (j + 0.5) * CELL
    if (Math.abs(x - h.x) < r && Math.abs(z - h.z) < r) g.solid[j * g.w + i] = 0
  }
}

describe('the cameo: its script is cut to the intro\'s fight cue', () => {
  const song = getSong('introFight')
  const spb = stepSeconds(song)

  it('its clock is the cue\'s film clock: the cue\'s first blow is the superhero landing', () => {
    // Step k of the cue sounds at film second INTRO_FIGHT_AT + k·spb; the opening blow is step 1, the slay step 57.
    expect(INTRO_FIGHT_AT + spb).toBeCloseTo(0.2, 2)
    expect(at('land')).toBeCloseTo(INTRO_FIGHT_AT + spb, 2)
    expect(Math.abs(at('land') - INTRO_ACTS.find(b => b.act === 'roar')!.at)).toBeLessThan(0.1)
    // The two are in the air before the cue begins, and the chimera is down a moment before he is.
    expect(CAMEO_FROM).toBeLessThan(0)
    expect(at('beastLand')).toBeLessThan(at('land'))
  })

  it('the turret goes down on the summon\'s downbeat, and the shield is up before the first shot', () => {
    expect(at('tower')).toBeCloseTo(INTRO_ACTS.find(b => b.act === 'summon')!.at, 2)
    expect(at('shield')).toBeGreaterThan(at('tower'))
    expect(at('shield')).toBeLessThanOrEqual(2.45)
    expect(at('shield')).toBeLessThan(at('shot'))
  })

  it('the blows are exchanged on the cue\'s six blows, both ways, and the chimera bounds off on THE hit', () => {
    const slaps = INTRO_ACTS.filter(b => b.act === 'slap').map(b => b.at)
    expect(CAMEO_BLOWS).toHaveLength(6)
    CAMEO_BLOWS.forEach((t, k) => expect(Math.abs(t - slaps[k]!), `blow ${k}`).toBeLessThan(0.03))
    // His and the beast's: two each way at least.
    expect(CAMEO_ACTS.filter(b => b.act === 'claw')).toHaveLength(2)
    expect(CAMEO_ACTS.filter(b => b.act === 'shot' || b.act === 'turret').length).toBeGreaterThanOrEqual(2)
    expect(at('flee')).toBeCloseTo(INTRO_ACTS.find(b => b.act === 'slay')!.at, 2)
    expect(at('flee')).toBeCloseTo(INTRO_FIGHT_AT + 57 * spb, 2)
  })

  it('then the resolve: the line as the beast leaps away, a few running steps, the leap out, the turret folds after him', () => {
    expect(at('line')).toBeGreaterThan(at('flee'))
    expect(at('line') - at('flee')).toBeLessThan(0.6)
    expect(at('run')).toBeGreaterThanOrEqual(7.0)
    expect(at('exit')).toBeGreaterThan(at('run'))
    expect(at('exit')).toBeLessThanOrEqual(10.1)
    expect(at('gone')).toBeLessThanOrEqual(10.1)
    expect(at('towerOut')).toBeGreaterThan(at('gone'))
  })

  it('is short (the cue\'s length), in order, and ends once its last notes have rung', () => {
    const times = CAMEO_ACTS.map(b => b.at)
    expect([...times].sort((a, b) => a - b)).toEqual(times)
    const cueLen = song.steps.length * spb
    expect(cueLen).toBeGreaterThan(12.3)
    expect(cueLen).toBeLessThan(12.9)
    expect(CAMEO_END).toBeGreaterThanOrEqual(INTRO_FIGHT_AT + cueLen)
    expect(CAMEO_END).toBeLessThan(14.5)
    expect(CAMEO_ACTS.at(-1)!.act).toBe('end')
  })
})

describe('the cameo: when it comes', () => {
  it('not while the pack of four stands, however long the hero waits', () => {
    const { sim, plan } = visit()
    expect(plan.packs[0]!.kinds).toHaveLength(2)
    expect(plan.packs[1]!.kinds).toHaveLength(OPENING.pack)
    const s = armCameo()
    for (const u of sim.units) if (u.team === 1 && u.group === 0) { u.hp = 0; u.alive = false }
    stepSim(sim, plan, DT)
    for (let i = 0; i < 60 * 10; i++) expect(cameoDue(sim, s, DT)).toBe(false)
  })

  it('a moment after it falls, with no awake foe near the hero', () => {
    const { sim, plan } = visit()
    packsDown(sim, plan)
    const s = armCameo()
    let t = 0
    while (!cameoDue(sim, s, DT) && t < 5) t += DT
    expect(t).toBeGreaterThanOrEqual(CAMEO_DELAY - DT * 2)
    expect(t).toBeLessThan(CAMEO_DELAY + 0.1)
  })

  it('never mid-fight: an awake foe near the hero holds it, and it comes once he is clear', () => {
    const { sim, plan } = visit()
    packsDown(sim, plan)
    const s = armCameo()
    const foe = sim.units.find(u => u.team === 1 && u.alive && u.rank !== 'npc')!
    foe.awake = true
    foe.x = sim.hero.unit.x + 3
    foe.z = sim.hero.unit.z
    for (let i = 0; i < 60 * 6; i++) expect(cameoDue(sim, s, DT)).toBe(false)
    foe.x = sim.hero.unit.x + CAMEO_FOE_NEAR + 4
    expect(cameoDue(sim, s, DT)).toBe(true)
  })

  it('not in a conversation, nor in a visit that is over, nor with the hero down', () => {
    const { sim, plan } = visit()
    packsDown(sim, plan)
    const s = armCameo()
    for (let i = 0; i < 60 * 3; i++) expect(cameoDue(sim, s, DT, true)).toBe(false)
    sim.hero.unit.alive = false
    expect(cameoDue(sim, s, DT)).toBe(false)
    sim.hero.unit.alive = true
    sim.ended = 'defeat'
    expect(cameoDue(sim, s, DT)).toBe(false)
    sim.ended = ''
    expect(cameoDue(sim, s, DT)).toBe(true)
  })

  it('once per save and never on a replay: armed only in the opening fight of a save that has not seen it, marked as it begins', () => {
    const src = readFileSync(resolve(__dirname, '../../src/game/modes/zoneMode.ts'), 'utf8')
    expect(src).toMatch(/if \(setup\.kind === 'zone' && setup\.tutorial && !profile\.tips\[CAMEO_TIP\]\) m\.cameo = armCameo\(\)/)
    // A replay of the plains is no tutorial (`flow.ts`: only a fresh profile's first visit is).
    expect(readFileSync(resolve(__dirname, '../../src/game/flow.ts'), 'utf8')).toMatch(/tutorial: node === 'plains' && isFreshProfile\(\)/)
    const step = src.slice(src.indexOf('private stepCameo('), src.indexOf('private screenGround'))
    expect(step).toMatch(/if \(!tryStartCameo\([^)]*\)\) return\s*markTip\(CAMEO_TIP\)\s*this\.cameoWall = performance\.now\(\)\s*startSceneCue/)
    // A visit saved mid-scene is put back without its actors.
    expect(src).toMatch(/restoreSim\(sim, m\.baseline, resume\.sim\)[^\n]*\n[^\n]*\n\s*clearCameoUnits\(sim\)/)
  })
})

describe('the cameo: where it plays', () => {
  it('near the top edge of the view, the beast left of the hunter, both leaping in from beyond the right edge', () => {
    const { sim, plan } = visit()
    packsDown(sim, plan)
    openGround(sim)
    noFoes(sim)
    const st = stageCameo(sim, view(sim))!
    expect(st).not.toBeNull()
    expect(st.side).toBe('top')
    const h = sim.hero.unit
    expect(st.hero.z).toBeLessThan(h.z)
    expect(st.beast.x).toBeLessThan(st.hero.x)
    // From beyond the right edge (the view is 20 m across, centred on the hero), off beyond the left one.
    expect(st.heroFrom.x).toBeGreaterThan(h.x + 10)
    expect(st.beastFrom.x).toBeGreaterThan(h.x + 10)
    expect(st.heroTo.x).toBeLessThan(h.x - 10)
    expect(st.beastTo.x).toBeLessThan(h.x - 10)
  })

  it('on the bottom edge when palisades or rock crowd the top, and not at all when both are crowded', () => {
    const { sim, plan } = visit()
    packsDown(sim, plan)
    openGround(sim)
    noFoes(sim)
    const toGround = view(sim)
    const top = stageCameo(sim, toGround)!
    expect(top.side).toBe('top')
    const g = sim.grid
    const wall = (z: number): void => { const j = Math.floor(z / CELL); for (let i = 0; i < g.w; i++) g.solid[j * g.w + i] = 1 }
    wall(top.hero.z)
    const st = stageCameo(sim, toGround)!
    expect(st.side).toBe('bottom')
    expect(st.hero.z).toBeGreaterThan(sim.hero.unit.z)
    wall(st.hero.z)
    expect(stageCameo(sim, toGround)).toBeNull()
  })

  it('never among a sleeping pack: a pack on the top row sends the scene to the bottom one', () => {
    const { sim, plan } = visit()
    packsDown(sim, plan)
    openGround(sim)
    noFoes(sim)
    const toGround = view(sim)
    const top = stageCameo(sim, toGround)!
    const g = plan.packs[2]!
    const foe = sim.addUnit({ kind: 'goblin', team: 1, rank: 'normal', level: 1, x: top.beast.x, z: top.beast.z, r: 0.4, h: 1, s: sim.hero.unit.s, group: 2 })
    expect(foe.awake).toBe(false)
    expect(g).toBeDefined()
    expect(stageCameo(sim, toGround)!.side).toBe('bottom')
  })

  it('a crowded view waits for the hero to walk on, and tries again', () => {
    const { sim, plan } = visit()
    packsDown(sim, plan)
    const s = armCameo()
    let crowded = true
    const toGround: ScreenToGround = (fx, fy) => (crowded ? null : view(sim)(fx, fy))
    for (let i = 0; i < 60 * 4; i++) expect(tryStartCameo(sim, s, DT, toGround)).toBe(false)
    expect(s.phase).toBe('wait')
    openGround(sim)
    crowded = false
    let started = false
    for (let i = 0; i < 60 && !started; i++) started = tryStartCameo(sim, s, DT, toGround)
    expect(started).toBe(true)
    expect(s.phase).toBe('play')
  })
})

/** Run a whole scene; the events of every step are kept. */
const runScene = (): { sim: Sim; plan: ZonePlan; events: Array<{ t: number; e: Sim['events'][number] }>; stage: CameoStage; seen: Map<string, number[]> } => {
  const { sim, plan } = visit()
  packsDown(sim, plan)
  openGround(sim)
  const s = armCameo()
  const stage = stageCameo(sim, view(sim))!
  beginCameo(sim, s, stage)
  const events: Array<{ t: number; e: Sim['events'][number] }> = []
  const seen = new Map<string, number[]>()
  for (let i = 0; i < 60 * 16 && s.phase === 'play'; i++) {
    sim.events.length = 0
    stepSim(sim, plan, DT)
    stepCameo(sim, s, DT)
    for (const e of sim.events) events.push({ t: s.t, e })
    for (const u of cameoUnits(sim)) { const l = seen.get(u.kind) ?? []; l.push(s.t); seen.set(u.kind, l) }
  }
  expect(s.phase).toBe('done')
  return { sim, plan, events, stage, seen }
}

describe('the cameo: as it plays', () => {
  it('lands on the beat, plants the turret, trades blows, says its line, and leaves nothing behind', () => {
    const { sim, events, seen } = runScene()
    const fx = (id: string): number[] => events.filter(x => x.e.t === 'fx' && x.e.id === `cameo:${id}`).map(x => x.t)
    expect(fx('land')).toHaveLength(1)
    expect(Math.abs(fx('land')[0]! - 0.2)).toBeLessThan(0.03)
    expect(fx('tower')).toHaveLength(1)
    expect(fx('shield')).toHaveLength(1)
    expect(fx('shot').length).toBeGreaterThanOrEqual(4)
    expect(fx('claw')).toHaveLength(2)
    expect(fx('bigShot')).toHaveLength(1)
    expect(fx('towerOut')).toHaveLength(1)
    expect(fx('step').length).toBeGreaterThanOrEqual(3)
    // The player's hero says the one line, once, over his own head.
    const barks = events.filter(x => x.e.t === 'bark')
    expect(barks).toHaveLength(1)
    expect(barks[0]!.e).toMatchObject({ unit: sim.hero.unit.id, key: CAMEO_LINE })
    // The turret stands only while he is there; everyone is gone at the end.
    const tower = seen.get(CAMEO_TOWER)!
    expect(Math.min(...tower)).toBeGreaterThanOrEqual(1.9 - 0.02)
    expect(Math.max(...tower)).toBeGreaterThan(Math.max(...seen.get(CAMEO_HERO)!))
    expect(Math.max(...seen.get(CAMEO_BEAST)!)).toBeLessThan(9)
    expect(cameoUnits(sim)).toHaveLength(0)
  })

  it('its blows are drawn as blows (impact, flinch) but count for nothing: no damage, no number, nothing of the hero\'s', () => {
    const { events } = runScene()
    const hits = events.filter(x => x.e.t === 'hit').map(x => x.e as Extract<Sim['events'][number], { t: 'hit' }>)
    expect(hits.length).toBeGreaterThanOrEqual(5)
    for (const h of hits) { expect(h.amount).toBe(0); expect(h.toHero).toBe(false); expect(h.killed).toBe(false) }
  })

  it('nothing can target, pick or hurt the scene\'s units, and a saved visit drops them', () => {
    const { sim, plan } = visit()
    packsDown(sim, plan)
    openGround(sim)
    const s = armCameo()
    beginCameo(sim, s, stageCameo(sim, view(sim))!)
    for (let i = 0; i < 60 * 4; i++) { stepSim(sim, plan, DT); stepCameo(sim, s, DT) }
    const units = cameoUnits(sim)
    expect(units.map(u => u.kind).sort()).toEqual([CAMEO_BEAST, CAMEO_HERO, CAMEO_TOWER].sort())
    for (const u of units) {
      expect(u.rank).toBe('npc')
      expect(u.team).toBe(0)
      expect(outOfReach(u)).toBe(true)
      // A tap on it is no order (`pick`), no area or query of either side holds it.
      expect(sim.pick(-1, u.x, u.z, 1)?.id ?? 0).not.toBe(u.id)
      for (const team of [0, 1] as const) expect(sim.inCircle(team, u.x, u.z, 3, []).some(q => q.id === u.id)).toBe(false)
      expect(u.hp).toBe(u.s.maxHp)
    }
    // Nothing aims at them for the length of the fight that goes on round them.
    const ids = new Set(units.map(u => u.id))
    for (let i = 0; i < 60 * 3; i++) {
      stepSim(sim, plan, DT)
      for (const e of sim.units) if (e.team === 1 && e.alive) expect(ids.has(e.targetId)).toBe(false)
    }
    clearCameoUnits(sim)
    expect(cameoUnits(sim)).toHaveLength(0)
  })

  it('does not touch the fight\'s dice', () => {
    const a = visit(11)
    const b = visit(11)
    packsDown(a.sim, a.plan)
    packsDown(b.sim, b.plan)
    openGround(a.sim)
    const s = armCameo()
    beginCameo(a.sim, s, stageCameo(a.sim, view(a.sim))!)
    expect(a.sim.rng()).toBe(b.sim.rng())
  })
})

describe('the cameo: its words, its look, its sounds', () => {
  it('the hero\'s line is a hero line (the girl hero has her own take), short, in English first', () => {
    const conv = CAPTIVE_BARKS.find(c => c.id === 'bark.hero')!
    const line = conv.greet.flatMap(g => g.lines).find(l => l.id === CAMEO_LINE)!
    expect(line.by).toBe('hero')
    const text = (en as any).dlg.bark.hero.hunt['1'] as string
    expect(text).toBe('Someone else is hunting that beast.')
    expect(text.length).toBeLessThanOrEqual(120)
  })

  it('the hunter is the aether master: his face, hair and beard, goggles, coat and gun light, with a pistol in each hand', () => {
    const me = LOOKS[CAMEO_HERO]!
    const master = LOOKS.sbMasterAether!
    for (const k of ['skin', 'hair', 'beard', 'head', 'outfit', 'top', 'glow'] as const) expect(me[k], k).toBe(master[k])
    expect(me.held).toBe('gun')
    expect(me.off).toBe('gun')
    expect(me.cape).toBeTruthy()
    expect(me.pauldrons).toBe(true)
  })

  it('every sound of the scene is a sound of its own', () => {
    for (const n of ['cameoLand', 'cameoShot', 'cameoTower', 'cameoTowerOut', 'cameoShield', 'cameoRoar', 'cameoLeap', 'cameoClaw', 'cameoStep']) expect(SFX_NAMES).toContain(n)
    // …and it is played under the player's fight: trimmed, and at part gain by the scene.
    const synth = readFileSync(resolve(__dirname, '../../src/game/audio/synth.ts'), 'utf8')
    const trim = synth.slice(synth.indexOf('const TRIM'), synth.indexOf('const CAP ='))
    for (const n of ['cameoLand', 'cameoShot', 'cameoRoar', 'cameoClaw']) expect(trim).toMatch(new RegExp(`${n}: 0\\.[1-7]`))
    const zone = readFileSync(resolve(__dirname, '../../src/game/modes/zoneMode.ts'), 'utf8')
    const table = zone.slice(zone.indexOf('const CAMEO_SOUND'), zone.indexOf('}', zone.indexOf('const CAMEO_SOUND')))
    for (const m of table.matchAll(/\['cameo\w+', ([\d.]+)\]/g)) expect(Number(m[1])).toBeLessThan(1)
  })
})

describe('the payoff: the aether master knows the hero in Silverbridge', () => {
  const conv = conversationOf('sbMasterAether')!
  const world = (flags: string[], met: boolean): DialogWorld => ({
    level: 10, gold: 0, attrs: startAttrs(), flags: new Set(flags), rep: { order: 0, syndicate: 0, circle: 0 }, quests: {}, cleared: new Set(),
    said: new Set(met ? ['sbMasterAether'] : []), errands: {}
  } as unknown as DialogWorld)
  const greet = (w: DialogWorld): string => conv.greet.find(b => meets(b.when, w, conv.id))!.id

  it('with one line of his own, on the first meeting, only when the hero saw the scene', () => {
    expect(greet(world([CAMEO_FLAG], false))).toBe('plains')
    expect(greet(world([], false))).toBe('hello')
    expect(greet(world([CAMEO_FLAG], true))).toBe('again')
    const plains = conv.greet.find(b => b.id === 'plains')!
    expect(plains.lines).toHaveLength(1)
    expect(plains.lines[0]!.by).toBe('npc')
    const text = (en as any).dlg.sbMasterAether.plains['1'] as string
    expect(text.length).toBeLessThanOrEqual(120)
    expect(text).toMatch(/plains/)
    expect(text).toMatch(/chimera/)
  })

  it('the flag is the scene\'s tip, derived (it is not stored twice)', () => {
    const had = profile.tips[CAMEO_TIP]
    try {
      delete profile.tips[CAMEO_TIP]
      expect(flagSet().has(CAMEO_FLAG)).toBe(false)
      profile.tips[CAMEO_TIP] = true
      expect(flagSet().has(CAMEO_FLAG)).toBe(true)
      expect(profile.world.flags).not.toContain(CAMEO_FLAG)
    } finally {
      if (had) profile.tips[CAMEO_TIP] = had
      else delete profile.tips[CAMEO_TIP]
    }
    // The conversation names the same flag.
    expect(readFileSync(resolve(__dirname, '../../src/game/data/dialogs/silverbridge.ts'), 'utf8')).toContain(`flags: ['${CAMEO_FLAG}']`)
  })
})
