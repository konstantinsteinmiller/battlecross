import { describe, expect, it } from 'vitest'
import { Scene, type InstancedBufferGeometry } from 'three'
import { ENEMIES } from '@/game/data/enemies'
import { SKILLS } from '@/game/data/skills'
import { ABILITY_CAST, SKILL_CAST, castClip, clipSet, styleOf, type CastName, type Style } from '@/game/gfx/rigs/clips'
import type { Held } from '@/game/gfx/rigs/humanoid'
import { I, N, sample, type Clip } from '@/game/gfx/rigs/pose'
import { Telegraphs } from '@/game/gfx/telegraphs'
import { applyStatus, dealDamage } from '@/game/sim/combat'
import { createHero } from '@/game/sim/hero'
import { applyPlan } from '@/game/sim/director'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { startAttrs } from '@/game/data/attributes'
import { generateArena } from '@/game/sim/zoneGen'
import { Sim, newAction } from '@/game/sim/world'
import type { SimEvent, Telegraph, Unit } from '@/game/sim/types'

/**
 * The view's side of an attack (decision D43): the choreography is laid over
 * the sim's timings and never changes them, so what is pinned here is the
 * contract between the two — the strike's pose is the one drawn at the sim's
 * hit time, whatever the wind-up's length; every skill and every enemy
 * ability has a cast of its own; a ground preview fills on the SIM's clock and
 * is withdrawn when its caster loses the action.
 */

const STYLES: Style[] = ['sword', 'dagger', 'great', 'heavy', 'staff', 'wand', 'caster', 'gun', 'cannon', 'bow', 'sling', 'scythe', 'flask', 'unarmed']
const CASTS: CastName[] = [
  'slam', 'dash', 'throw', 'throwDown', 'channel', 'summon', 'shout', 'ward', 'buff', 'whirl', 'beam', 'raise', 'burst', 'point',
  'plant', 'drain', 'call', 'bash', 'strike', 'cleave', 'breath', 'charge', 'line', 'leap', 'open'
]
const TAU = Math.PI * 2

const everyClip = (): Array<[string, Clip, Float32Array]> => {
  const out: Array<[string, Clip, Float32Array]> = []
  for (const style of STYLES) {
    for (const [shield, dual] of [[false, false], [true, false], [false, true]] as const) {
      const set = clipSet(style, shield, dual)
      set.attacks.forEach((c, i) => out.push([`${style}${shield ? '+shield' : ''}${dual ? '+dual' : ''} attack ${i}`, c, set.stance]))
      for (const name of CASTS) out.push([`${style}${shield ? '+shield' : ''} ${name}`, castClip(set, name), set.stance])
    }
  }
  return out
}

describe('attack choreography', () => {
  it('gives every weapon family a stance and at least one attack', () => {
    for (const style of STYLES) {
      const set = clipSet(style, false, false)
      expect(set.stance).toHaveLength(N)
      expect(set.attacks.length, style).toBeGreaterThan(0)
    }
    // The families the brief names have more than one beat to alternate.
    for (const style of ['sword', 'dagger', 'great', 'heavy', 'staff', 'scythe', 'unarmed'] as const) {
      expect(clipSet(style, false, false).attacks.length, style).toBeGreaterThan(1)
    }
    // A dual-wielder's stab brings the off hand in behind the main hand's hit.
    expect(clipSet('dagger', false, true).attacks[0]!.trailOff).toBe(true)
    expect(clipSet('gun', false, true).attacks).toHaveLength(2)
  })

  it('starts and ends every clip in its stance, with one key exactly on the hit', () => {
    for (const [name, c, stance] of everyClip()) {
      const at = c.keys.map(k => k.at)
      expect(at[0], name).toBe(0)
      expect(at[at.length - 1], name).toBe(2)
      expect([...at].sort((a, b) => a - b), name).toEqual(at)
      expect(at.filter(t => t === 1), name).toHaveLength(1)
      const first = new Float32Array(N)
      const last = new Float32Array(N)
      sample(c, 0, 0.7, first)
      sample(c, 2, 0.7, last)
      for (let i = 0; i < N; i++) {
        expect(first[i], `${name} starts in stance`).toBeCloseTo(stance[i]!, 5)
        // A whirl or a sling's wind-up may end whole turns on from where it began.
        const whole = i === I.spin || i === I.wRx ? Math.round((last[i]! - stance[i]!) / TAU) * TAU : 0
        expect(last[i]! - whole, `${name} ends in stance`).toBeCloseTo(stance[i]!, 3)
      }
    }
  })

  it('draws the strike on the sim\'s hit time however long the wind-up is', () => {
    for (const [name, c] of everyClip()) {
      const hit = c.keys.find(k => k.at === 1)!.p
      // S is where the strike begins inside the wind-up: 0.55 for the hero's
      // 0.17 s dagger, 0.93 for a boss's 1.6 s slam. The hit pose is the same.
      for (const S of [0.55, 0.7, 0.93]) {
        const out = new Float32Array(N)
        sample(c, 1, S, out)
        for (let i = 0; i < N; i++) expect(out[i], `${name} at S=${S}`).toBeCloseTo(hit[i]!, 5)
      }
      // And the hit pose is not the stance the clip began in (the body DID something).
      const before = new Float32Array(N)
      sample(c, 0.02, 0.7, before)
      let moved = 0
      for (let i = 0; i < N; i++) moved += Math.abs(before[i]! - hit[i]!)
      expect(moved, `${name} moves`).toBeGreaterThan(0.5)
    }
  })

  it('has a cast for every active hero skill and every enemy ability kind', () => {
    for (const s of SKILLS) if (s.kind === 'active') expect(SKILL_CAST[s.id], `skill ${s.id}`).toBeDefined()
    const kinds = new Set(ENEMIES.flatMap(e => e.abilities.map(a => a.kind)))
    for (const k of kinds) expect(ABILITY_CAST[k], `ability ${k}`).toBeDefined()
    // More than the four pose buckets there used to be.
    expect(new Set(Object.values(SKILL_CAST)).size).toBeGreaterThanOrEqual(12)
  })

  it('carries every held thing in a style, for every kind of basic attack', () => {
    const held: Held[] = ['none', 'sword', 'dagger', 'greatsword', 'axe', 'hammer', 'staff', 'wand', 'gun', 'cannon', 'club', 'bow', 'sling', 'scythe', 'flask']
    for (const h of held) for (const atk of ['melee', 'ranged', 'magic'] as const) expect(STYLES).toContain(styleOf(h, 'none', atk))
    expect(styleOf('none', 'none', 'melee')).toBe('unarmed')
    expect(styleOf('greatsword', 'none', 'melee')).toBe('great')
    expect(styleOf('scythe', 'none', 'melee')).toBe('scythe')
    // A necromancer casts with his scythe; he does not reap with it.
    expect(styleOf('scythe', 'none', 'magic')).toBe('staff')
  })
})

describe('ground attack previews', () => {
  const tele = (over: Partial<Telegraph> = {}): Telegraph => ({ shape: 'circle', x: 0, z: 0, r: 3, w: 0, a: 0, dur: 1, team: 1, ...over })
  const caster = (): Unit => {
    const u = { id: 7, alive: true, rank: 'normal', action: null } as unknown as Unit
    u.action = newAction({ x: 0, z: 0 } as Unit, 'slam', 1, 1.5, 0, 0, 0, 0)
    return u
  }
  const live = (t: Telegraphs): number => (t.mesh.geometry as InstancedBufferGeometry).instanceCount
  /** Progress, flash and alpha of the first preview. */
  const state = (t: Telegraphs): number[] => Array.from((t.mesh.geometry.getAttribute('iC').array as Float32Array).slice(0, 3))

  it('fills on the sim\'s clock, not the frame\'s (a hit-stop slows them differently)', () => {
    const t = new Telegraphs(new Scene())
    t.add(tele(), null, 10)
    // Two seconds of frames pass, but the sim has only moved half a second.
    for (let i = 0; i < 120; i++) t.update(1 / 60, 10 + (i / 120) * 0.5)
    expect(live(t)).toBe(1)
    expect(state(t)[0]).toBeCloseTo(0.5, 1)
    expect(state(t)[1]).toBe(0)
  })

  it('flashes when it lands, then is gone', () => {
    const t = new Telegraphs(new Scene())
    t.add(tele(), null, 0)
    t.update(1 / 60, 1.001)
    expect(state(t)[0]).toBe(1)
    expect(state(t)[1]).toBeGreaterThan(0.8)
    for (let i = 0; i < 20; i++) t.update(1 / 60, 1.1)
    expect(live(t)).toBe(0)
  })

  it('is withdrawn without a flash when the caster loses the action or dies', () => {
    const t = new Telegraphs(new Scene())
    const u = caster()
    t.add(tele({ src: u.id, wind: 1 }), u, 0)
    t.update(1 / 60, 0.3)
    expect(live(t)).toBe(1)
    u.action = null // stunned: the sim says nothing, the action is simply gone
    t.update(1 / 60, 0.32)
    expect(state(t)[1]).toBe(0)
    expect(state(t)[2]).toBeLessThanOrEqual(1)
    for (let i = 0; i < 12; i++) t.update(1 / 60, 0.4)
    expect(live(t)).toBe(0)

    // A barrage's circles are not tied to the action (it is over by then): only a death withdraws them.
    const b = caster()
    t.add(tele({ src: b.id }), b, 1)
    b.action = null
    t.update(1 / 60, 1.5)
    expect(live(t)).toBe(1)
    b.alive = false
    for (let i = 0; i < 12; i++) t.update(1 / 60, 1.6)
    expect(live(t)).toBe(0)
  })

  it('never drops a preview: the pool grows', () => {
    const t = new Telegraphs(new Scene())
    for (let i = 0; i < 60; i++) t.add(tele({ x: i }), null, 0)
    t.update(1 / 60, 0.1)
    expect(live(t)).toBe(60)
  })
})

describe('what the sim tells the view about a hit', () => {
  const field = (): Sim => {
    const plan = generateArena(7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, {
      build: { level: 5, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
      skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
    })
    return sim
  }
  const hits = (sim: Sim): Array<Extract<SimEvent, { t: 'hit' }>> => sim.events.filter((e): e is Extract<SimEvent, { t: 'hit' }> => e.t === 'hit')

  it('marks a tick of damage over time, so it gets a small effect and no hit-stop', () => {
    const sim = field()
    const hero = sim.hero.unit
    const e = spawnEnemy(sim, 'ironGolem', hero.x + 2, hero.z)!
    sim.events.length = 0
    dealDamage(sim, hero, e, 5, { type: 'physical', attack: true, canCrit: false })
    expect(hits(sim).map(h => h.dot)).toEqual([false])
    sim.events.length = 0
    applyStatus(sim, e, 'burn', 4, 10, hero, { type: 'fire' })
    const plan = generateArena(7)
    for (let i = 0; i < 40; i++) stepSim(sim, plan, 1 / 30)
    // (The golem woke and the two trade blows meanwhile: those are not ticks.)
    const all = hits(sim)
    const ticks = all.filter(h => h.type === 'fire')
    expect(ticks.length).toBeGreaterThan(1)
    expect(ticks.every(h => h.dot && h.tgt === e.id && h.src === hero.id)).toBe(true)
    expect(all.filter(h => h.type !== 'fire').every(h => !h.dot)).toBe(true)
  })

  it('names the caster of a ground preview, and how long its wind-up must hold', () => {
    const sim = field()
    const hero = sim.hero.unit
    const king = spawnEnemy(sim, 'goblinKing', hero.x + 2, hero.z)!
    king.awake = true
    const plan = generateArena(7)
    const teles: Telegraph[] = []
    for (let i = 0; i < 600 && teles.length < 3; i++) {
      stepSim(sim, plan, 1 / 30)
      hero.hp = hero.s.maxHp
      for (const ev of sim.events) if (ev.t === 'tele') teles.push(ev.tele)
      sim.events.length = 0
    }
    expect(teles.length).toBeGreaterThan(0)
    for (const t of teles) expect(t.src).toBe(king.id)
    // His slam is bound to its wind-up; his barrage's circles (raised later) are not.
    expect(teles.some(t => (t.wind ?? 0) > 0)).toBe(true)
  })
})
