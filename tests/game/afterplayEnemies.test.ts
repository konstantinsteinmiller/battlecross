import { describe, expect, it } from 'vitest'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { INVASION, STAND_INS, invadedZone, resolveKind } from '@/game/data/invasion'
import { ZONE_IDS } from '@/game/data/zones'
import { CREATURE_BUILDS } from '@/game/gfx/rigs/creatures'
import { LOOKS } from '@/game/gfx/rigs/looks'
import { DAZE_VULNERABLE, startAbility } from '@/game/sim/abilities'
import { botThink, setupRun } from '@/game/sim/bot'
import { dealDamage, wakeGroup } from '@/game/sim/combat'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import type { Sim } from '@/game/sim/world'
import type { Unit } from '@/game/sim/types'
import type { ZonePlan } from '@/game/sim/zoneGen'

/**
 * The Breaking's own hordes (docs/gdd-afterplay.md §6, phase 4): twelve new
 * enemy kinds (the thirteenth, the demon pylon, is phase 2's), each in the
 * bestiary, each fighting where the roster asks for it, each with its trick.
 */

const NEW = [
  'hellhound', 'frostHellhound', 'gargoyle', 'harpy', 'corruptedTreant', 'centaurRaider',
  'cyclopsBrute', 'demonMiner', 'sphinxAcolyte', 'seaDemon', 'drakeHatchling', 'hydraSpawn'
] as const

const DT = 1 / 30
/** Abilities that light the ground they will hit, and must light it for long enough to step out. */
const TELEGRAPHED = new Set(['slam', 'smash', 'leap', 'lob', 'cone', 'charge', 'line'])

const arena = (level = 45): { sim: Sim; plan: ZonePlan; hero: Unit } => {
  const { sim, plan } = setupRun({ zone: 'plains', level, enemyLevel: level, cls: 'aegis', geared: true, invaded: true, seed: 3, potions: 5 })
  // The zone's own packs sleep where they stand, far off; only what the test spawns fights.
  sim.events.length = 0
  return { sim, plan, hero: sim.hero.unit }
}

const near = (sim: Sim, hero: Unit, kind: string, d: number): Unit => {
  const u = spawnEnemy(sim, kind, hero.x + d, hero.z)!
  u.awake = true
  return u
}

describe('the new enemies (data)', () => {
  it('each is in the bestiary, needs no stand-in, and fights wherever the roster names it', () => {
    for (const id of NEW) {
      expect(ENEMY_BY_ID[id], id).toBeDefined()
      expect(STAND_INS[id], id).toBeUndefined()
      expect(resolveKind(id), id).toBe(id)
    }
    const fielded = new Set<string>()
    for (const z of ZONE_IDS) {
      const d = invadedZone(z)
      for (const k of [...d.kinds.map(e => e.kind), ...d.finale.with]) fielded.add(k)
      // The roster as designed reaches the field unchanged for every new kind.
      for (const k of INVASION[z].kinds) if ((NEW as readonly string[]).includes(k.kind)) expect(d.kinds.some(e => e.kind === k.kind), `${z}: ${k.kind}`).toBe(true)
    }
    for (const id of NEW) expect(fielded.has(id), `${id} is fought somewhere`).toBe(true)
  })

  it('their numbers sit in a normal enemy\'s range, and grow with the band 31-60', () => {
    for (const id of NEW) {
      const e = ENEMY_BY_ID[id]!
      expect(e.rank, id).toBe('normal')
      expect(e.hp, id).toBeGreaterThanOrEqual(0.6)
      expect(e.hp, id).toBeLessThanOrEqual(2.5)
      expect(e.dmg, id).toBeGreaterThanOrEqual(0.8)
      expect(e.dmg, id).toBeLessThanOrEqual(1.4)
      expect(e.reward, id).toBeGreaterThan(0)
    }
    const at = (id: string, level: number): Unit => {
      const { sim, hero } = arena(level)
      return spawnEnemy(sim, id, hero.x + 5, hero.z)!
    }
    for (const id of NEW) {
      const lo = at(id, 31)
      const hi = at(id, 60)
      expect(hi.s.maxHp, id).toBeGreaterThan(lo.s.maxHp * 1.3)
      expect(hi.s.baseDmg, id).toBeGreaterThan(lo.s.baseDmg * 1.2)
    }
  })

  it('each wears a look its rig can build (placeholder recolours until painted)', () => {
    for (const id of NEW) {
      const e = ENEMY_BY_ID[id]!
      if (e.rig === 'humanoid') expect(LOOKS[e.look!], id).toBeDefined()
      else expect(CREATURE_BUILDS[e.look!], `${id}: ${e.look}`).toBeDefined()
    }
  })
})

describe('the new enemies (sim)', () => {
  for (const id of NEW) {
    it(`${id}: closes in, hurts the hero, and dies`, () => {
      const { sim, plan, hero } = arena()
      // Out of even a shooter's reach: it has to come to the hero.
      const e = near(sim, hero, id, 13)
      const x0 = e.x
      let hurt = 0
      let moved = 0
      for (let t = 0; t < 20; t += DT) {
        const hp = hero.hp
        stepSim(sim, plan, DT)
        hurt += Math.max(0, hp - hero.hp)
        moved = Math.max(moved, Math.abs(e.x - x0))
        hero.hp = hero.s.maxHp
        sim.events.length = 0
      }
      expect(hurt, `${id} hurts`).toBeGreaterThan(0)
      expect(moved, `${id} moves`).toBeGreaterThan(0.5)
      e.statuses.length = 0
      dealDamage(sim, hero, e, 1e9, { type: 'true', canCrit: false })
      expect(e.alive, `${id} dies`).toBe(false)
    })

    it(`${id}: every heavy blow is shown on the ground before it lands`, () => {
      const def = ENEMY_BY_ID[id]!
      for (const [i, a] of def.abilities.entries()) {
        if (!TELEGRAPHED.has(a.kind)) continue
        const { sim, plan, hero } = arena()
        const e = near(sim, hero, id, Math.max(a.min ?? 0, 2) + 0.5)
        const hp0 = hero.hp
        startAbility(sim, e, a, i, hero)
        const tele = sim.events.find(ev => ev.t === 'tele' && ev.tele.src === e.id)
        expect(tele, `${id} ${a.kind}`).toBeDefined()
        expect(a.windup, `${id} ${a.kind}`).toBeGreaterThanOrEqual(0.5)
        // Nothing of it has landed while the warning is up.
        for (let t = 0; t < a.windup - 2 * DT; t += DT) stepSim(sim, plan, DT)
        expect(hero.hp, `${id} ${a.kind} hit before its wind-up ended`).toBe(hp0)
      }
    })
  }

  it('a hellhound\'s leap leaves burning ground; a frost hellhound\'s, freezing ground', () => {
    for (const [id, kind] of [['hellhound', 'burnGround'], ['frostHellhound', 'web']] as const) {
      const { sim, plan, hero } = arena()
      const e = near(sim, hero, id, 5)
      const i = ENEMY_BY_ID[id]!.abilities.findIndex(a => a.kind === 'leap')
      startAbility(sim, e, ENEMY_BY_ID[id]!.abilities[i]!, i, hero)
      for (let t = 0; t < 1; t += DT) stepSim(sim, plan, DT)
      expect(sim.fields.some(f => f.active && f.kind === kind && f.srcId === e.id), id).toBe(true)
    }
  })

  it('a gargoyle sleeps through its pack\'s waking, and wakes only within four metres', () => {
    const { sim, plan, hero } = arena()
    const gi = sim.groups.length
    const g = spawnEnemy(sim, 'gargoyle', hero.x + 9, hero.z, gi)!
    const w = spawnEnemy(sim, 'wolf', hero.x + 9, hero.z + 2, gi)!
    sim.groups.push({ id: gi, x: g.x, z: g.z, members: [g.id, w.id], awake: false, cleared: false, finale: false, boss: '' })
    wakeGroup(sim, w)
    expect(w.awake).toBe(true)
    expect(g.awake).toBe(false)
    w.alive = false
    for (let t = 0; t < 2; t += DT) { stepSim(sim, plan, DT); hero.x = g.x - 6; hero.z = g.z }
    expect(g.awake).toBe(false)
    hero.x = g.x - 3
    stepSim(sim, plan, DT)
    expect(g.awake).toBe(true)
  })

  it('a harpy flies off from a hero at arm\'s length', () => {
    const { sim, plan, hero } = arena()
    const h = near(sim, hero, 'harpy', 1.6)
    h.cds.fill(99)
    for (let t = 0; t < 1; t += DT) { stepSim(sim, plan, DT); hero.hp = hero.s.maxHp }
    expect(Math.hypot(h.x - hero.x, h.z - hero.z)).toBeGreaterThan(2.6)
  })

  it('a cyclops brute reels after its slam, and takes more while it does', () => {
    const { sim, plan, hero } = arena()
    const c = near(sim, hero, 'cyclopsBrute', 2)
    const i = ENEMY_BY_ID.cyclopsBrute!.abilities.findIndex(a => a.daze)
    startAbility(sim, c, ENEMY_BY_ID.cyclopsBrute!.abilities[i]!, i, hero)
    for (let t = 0; t < 1.2; t += DT) stepSim(sim, plan, DT)
    expect(c.statuses.some(s => s.id === 'stun')).toBe(true)
    expect(c.statuses.find(s => s.id === 'vulnerable')?.v).toBe(DAZE_VULNERABLE)
  })

  it('a sea-demon dives out of reach for two seconds, then comes up', () => {
    const { sim, plan, hero } = arena()
    const s = near(sim, hero, 'seaDemon', 4)
    // Tough enough to outlast the hero's own blows until it dives.
    s.s.maxHp *= 100
    s.hp = s.s.maxHp
    let under = -1
    for (let t = 0; t < 15 && under < 0; t += DT) {
      stepSim(sim, plan, DT)
      hero.hp = hero.s.maxHp
      if (s.statuses.some(q => q.id === 'stealth')) under = t
    }
    expect(under).toBeGreaterThanOrEqual(0)
    const hp = s.hp
    expect(dealDamage(sim, hero, s, 1e6, { type: 'true', canCrit: false })).toBe(0)
    expect(s.hp).toBe(hp)
    expect(sim.nearest(1, hero.x, hero.z, 30)?.id).not.toBe(s.id)
    for (let t = 0; t < 2.2; t += DT) { stepSim(sim, plan, DT); hero.hp = hero.s.maxHp }
    expect(s.statuses.some(q => q.id === 'stealth' || q.id === 'invulnerable')).toBe(false)
  })

  it('a hydra spawn splits once into two smaller pieces that do not split again', () => {
    const { sim, hero } = arena()
    const h = near(sim, hero, 'hydraSpawn', 4)
    dealDamage(sim, hero, h, 1e9, { type: 'true', canCrit: false })
    const pieces = sim.units.filter(u => u.alive && u.kind === 'hydraSpawn')
    expect(pieces.length).toBe(2)
    for (const p of pieces) {
      expect(p.s.maxHp).toBeCloseTo(h.s.maxHp * ENEMY_BY_ID.hydraSpawn!.split!.hp, 3)
      expect(p.awake).toBe(true)
      dealDamage(sim, hero, p, 1e9, { type: 'true', canCrit: false })
    }
    expect(sim.units.filter(u => u.alive && u.kind === 'hydraSpawn').length).toBe(0)
  })
})

describe('the new enemies against the reference player', () => {
  // A geared hero of the band beats a pack of three of each, the way the bot plays.
  for (const id of NEW) {
    it(`${id}: a pack of three falls to a geared hero of the band`, () => {
      const { sim, plan, hero } = arena(45)
      const pack = [0, 1, 2].map(k => near(sim, hero, id, 6 + k))
      let think = 0
      while (sim.time < 120 && hero.alive && sim.units.some(u => u.alive && u.team === 1 && (pack.includes(u) || u.ownerId))) {
        stepSim(sim, plan, DT)
        sim.events.length = 0
        think -= DT
        if (think <= 0) { think = 0.2; botThink(sim) }
      }
      expect(hero.alive, `${id}: the hero lives`).toBe(true)
      expect(pack.every(u => !u.alive), `${id}: the pack falls in ${Math.round(sim.time)} s`).toBe(true)
    }, 60_000)
  }
})
