// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { ELIXIRS, ELIXIR_BY_ID, ELIXIR_CAP, ELIXIR_TIME, brewFee } from '@/game/data/elixirs'
import { PLANT_IDS, PLANT_BY_ID } from '@/game/data/plants'
import { Sim } from '@/game/sim/world'
import { createHero, cycleElixir, nextElixir, useElixir } from '@/game/sim/hero'
import { applyStatus, attackSpeedOf, cdrOf, dealDamage, moveSpeedOf, stepStatuses } from '@/game/sim/combat'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { startAttrs } from '@/game/data/attributes'
import type { HeroBuild } from '@/game/sim/stats'
import { GLYPHS } from '@/components/art/glyphs'
import { statusTint } from '@/components/art/tints'
import en from '@/i18n/locales/en'
import { TOWNS } from '@/game/data/zones'
import { conversationOf } from '@/game/data/dialogs'

/**
 * Alchemy (roadmap #87, D104): six elixirs from the herbs the hero picks, a
 * minute each from the third flask, five of each carried.
 */

const naked = (): HeroBuild => ({ level: 5, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] })
let plan = generateArena(7)
const field = (elixirs: Record<string, number> = {}, pick = ''): Sim => {
  plan = generateArena(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: naked(), skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3, elixirs, elixirPick: pick })
  return sim
}

describe('the elixirs', () => {
  it('six, each its own status, each from three herbs the game grows; every herb is in some recipe', () => {
    expect(ELIXIRS).toHaveLength(6)
    expect(new Set(ELIXIRS.map(e => e.status)).size).toBe(6)
    const used = new Set<string>()
    for (const e of ELIXIRS) {
      const n = Object.values(e.recipe).reduce((s, x) => s + (x ?? 0), 0)
      expect(n, e.id).toBe(3)
      for (const p of Object.keys(e.recipe)) { expect(PLANT_BY_ID[p as 'sunpetal'], `${e.id} ${p}`).toBeDefined(); used.add(p) }
      expect(e.v, e.id).toBeGreaterThan(0)
      expect(e.v, e.id).toBeLessThanOrEqual(0.75)
      // Shown everywhere a status is: an icon, a colour, a name.
      expect(GLYPHS[`status.${e.status}`], e.status).toBeTruthy()
      expect(statusTint(e.status)).toBe(e.colour)
      expect((en.status as Record<string, string>)[e.status], e.status).toBeTruthy()
      expect((en.elixir as Record<string, { name: string; desc: string }>)[e.id]?.desc, e.id).toContain('{n}')
    }
    expect([...used].sort()).toEqual([...PLANT_IDS].sort())
  })

  it('the third flask pours the one picked: five minutes of its status, one fewer, a cooldown', () => {
    const sim = field({ might: 2, iron: 1 }, 'might')
    const h = sim.hero
    expect(h.elixirPick).toBe('might')
    expect(useElixir(sim)).toBe(true)
    expect(h.elixirs.might).toBe(1)
    const st = h.unit.statuses.find(s => s.id === 'elixirMight')!
    expect(ELIXIR_TIME).toBe(300)
    expect(st.dur).toBe(ELIXIR_TIME)
    expect(st.v).toBe(ELIXIR_BY_ID.might.v)
    expect(useElixir(sim)).toBe(false)
    for (let k = 0; k < 7 * 30; k++) stepSim(sim, plan, 1 / 30)
    // The last of a kind drunk: the flask turns to the next kind carried.
    expect(useElixir(sim)).toBe(true)
    expect(h.elixirPick).toBe('iron')
    cycleElixir(sim)
    expect(h.elixirPick).toBe('iron')
    expect(nextElixir({ elixirs: {} }, 'might')).toBe('')
  })

  it('carried nothing: nothing to drink; a pick the hero has none of falls to one he has', () => {
    expect(useElixir(field())).toBe(false)
    expect(field({ swift: 1 }, 'might').hero.elixirPick).toBe('swift')
  })

  it('each adds to its stat, on top of a skill\'s buff of the same kind', () => {
    const sim = field()
    const u = sim.hero.unit
    const ms = moveSpeedOf(u)
    const as = attackSpeedOf(u)
    const cdr = cdrOf(u)
    applyStatus(sim, u, 'elixirSwift', 60, 0.75, u)
    expect(moveSpeedOf(u)).toBeCloseTo(ms * 1.75, 5)
    expect(attackSpeedOf(u)).toBeCloseTo(as * 1.75, 5)
    applyStatus(sim, u, 'elixirMind', 60, 0.75, u)
    expect(cdrOf(u)).toBeCloseTo(Math.min(0.6, cdr + 0.75), 5)
    // Might: more damage, and with a skill's damageUp they add.
    const e = spawnEnemy(sim, 'goblin', u.x + 2, u.z)!
    const hit = (): number => { e.hp = e.s.maxHp; return dealDamage(sim, u, e, 40, { type: 'true', canCrit: false }) }
    const base = hit()
    applyStatus(sim, u, 'elixirMight', 60, 0.75, u)
    expect(hit()).toBeCloseTo(base * 1.75, 0)
    applyStatus(sim, u, 'damageUp', 10, 0.3, u)
    expect(hit()).toBeCloseTo(base * 2.05, 0)
    // Vigor: health back every second.
    u.hp = 1
    applyStatus(sim, u, 'elixirVigor', 60, 0.012, u)
    stepStatuses(sim, u, 1)
    expect(u.hp).toBeGreaterThan(1 + u.s.maxHp * 0.011)
  })
})

describe('at the alchemist', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  beforeEach(async () => {
    drainAndResetModules()
    localStorage.clear()
    await holdGameState()
    p = await import('@/game/state/profile')
    p.initProfile()
  })
  afterEach(() => { drainPersist(); vi.restoreAllMocks() })

  it('a brew takes its herbs and the fee; the first one brewed is the one carried', () => {
    p.profile.gold = 1000
    expect(p.brewBlock('might')).toBe('herbs')
    p.addHerbs({ emberbloom: 4, sunpetal: 2 })
    expect(p.brewBlock('might')).toBe('')
    expect(p.brewElixir('might')).toBe(true)
    expect(p.elixirCount('might')).toBe(1)
    expect(p.herbCount('emberbloom')).toBe(2)
    expect(p.herbCount('sunpetal')).toBe(1)
    expect(p.profile.gold).toBe(1000 - brewFee(p.profile.level))
    expect(p.profile.inv.elixirPick).toBe('might')
    p.profile.gold = 0
    expect(p.brewBlock('might')).toBe('gold')
    expect(p.brewElixir('might')).toBe(false)
    expect(p.elixirCount('might')).toBe(1)
  })

  it('five of each at most; the visit writes back what is left and the one carried', () => {
    p.profile.gold = 1e6
    p.addHerbs({ swiftfern: 20, sunpetal: 20 })
    for (let k = 0; k < ELIXIR_CAP; k++) expect(p.brewElixir('swift')).toBe(true)
    expect(p.brewBlock('swift')).toBe('full')
    p.setElixirs({ swift: 2, might: 0, bogus: 3 }, 'might')
    expect(p.profile.inv.elixirs).toEqual({ swift: 2 })
    expect(p.profile.inv.elixirPick).toBe('swift')
  })

  it('an old save loads with none; a broken one is cleaned', async () => {
    p.profile.inv.elixirs = { might: 99, nope: 2 } as Record<string, number>
    p.profile.inv.elixirPick = 'nope'
    p.saveProfile()
    drainPersist()
    drainAndResetModules()
    await holdGameState()
    const q = await import('@/game/state/profile')
    q.initProfile()
    expect(q.profile.inv.elixirs).toEqual({ might: ELIXIR_CAP })
    expect(q.profile.inv.elixirPick).toBe('might')
  })
})

describe('the alchemist', () => {
  it('lives in Silverbridge, and her conversation opens her table', () => {
    const a = TOWNS.silverbridge.npcs.find(n => n.role === 'alchemist')
    expect(a?.id).toBe('sbAlchemist')
    const conv = conversationOf('sbAlchemist')!
    const brew = Object.values(conv.nodes).flatMap(n => n.choices).find(c => c.effects.some(f => f.t === 'open' && f.window === 'alchemy'))
    expect(brew).toBeTruthy()
  })
})

describe('elixir strength (roadmap #134)', () => {
  it('the percentage elixirs give 75 % (the mind brew the 60 % the cooldown cap allows), for five minutes', () => {
    expect(ELIXIR_TIME).toBe(5 * 60)
    for (const id of ['might', 'iron', 'swift', 'shadow'] as const) expect(ELIXIR_BY_ID[id].v, id).toBe(0.75)
    expect(ELIXIR_BY_ID.mind.v).toBe(0.6)
    // Nothing is worth less than the minute-long 15 %.
    for (const e of ELIXIRS) if (e.id !== 'vigor') expect(e.v, e.id).toBeGreaterThanOrEqual(0.6)
  })

  it('stacked swiftness never carries the hero past two and a half times his base pace', () => {
    const sim = field()
    const u = sim.hero.unit
    const ms = moveSpeedOf(u)
    applyStatus(sim, u, 'elixirSwift', 300, 0.75, u)
    applyStatus(sim, u, 'focus', 10, 1, u)
    expect(moveSpeedOf(u)).toBeLessThanOrEqual(u.s.moveSpeed * 2.5 + 1e-9)
    expect(moveSpeedOf(u)).toBeGreaterThan(ms)
  })
})
