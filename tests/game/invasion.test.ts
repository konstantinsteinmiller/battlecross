import { describe, expect, it } from 'vitest'
import { AFTER_XP_MUL } from '@/game/data/progression'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { ZONES, ZONE_IDS, visitLevel } from '@/game/data/zones'
import {
  INVASION, INVASION_ORDER, PYLON, REBORN, STAND_INS, invadedBefore, invadedFlag, invadedOpen, invadedZone, invasionLetsIn, resolveKind
} from '@/game/data/invasion'
import { rollEncounter } from '@/game/data/encounters'
import { fillGrid, generateArena, generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { CELL, cellOf, createGrid, findPath, isSolidAt, type Grid } from '@/game/sim/grid'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { dealDamage } from '@/game/sim/combat'
import { stepSim } from '@/game/sim/step'
import { armInvasion, isPylon, pylonAura, pylonsLeft } from '@/game/sim/invasion'
import { referenceBuild, runZone } from '@/game/sim/bot'
import { startAttrs } from '@/game/data/attributes'
import type { HeroBuild } from '@/game/sim/stats'
import { noGear } from '@/game/data/items'
import { demonPylonGeo } from '@/game/gfx/setPieces'
import { BODY_H, SOLID_TOL } from '@/game/gfx/propRoles'

/**
 * The invasion overlay (docs/gdd-afterplay.md §3, §4, §5.8; phase 2): every
 * zone's invaded self is the same layout with the Breaking's band, roster,
 * ruins, scars and pylons, and pays the afterplay's XP — only there.
 */

/** The walk grid as the hero meets it, every door open. */
const gridOf = (plan: ZonePlan): Grid => fillGrid(createGrid(plan.w, plan.h), plan, true)
const path: number[] = []
const reachable = (g: Grid, plan: ZonePlan, x: number, z: number): boolean => {
  if (cellOf(x) === cellOf(plan.start.x) && cellOf(z) === cellOf(plan.start.z)) return true
  return findPath(g, plan.start.x, plan.start.z, x, z, path, 8000) > 0
}

const SEEDS = [1, 7, 1234]

describe('the invaded zones (data)', () => {
  it('every zone has an invaded band inside 31–60, rising with the campaign\'s order, two zones a band', () => {
    for (const z of ZONE_IDS) {
      const inv = INVASION[z]
      expect(inv.min, z).toBeGreaterThanOrEqual(31)
      expect(inv.max, z).toBeLessThanOrEqual(60)
      expect(inv.min, z).toBeLessThanOrEqual(inv.max)
      const d = invadedZone(z)
      expect(visitLevel(d, 1), z).toBe(inv.min)
      expect(visitLevel(d, 99), z).toBe(inv.max)
      expect(d.sections, `${z} keeps its sections`).toBe(ZONES[z].sections)
      expect(d.theme).toBe(ZONES[z].theme)
    }
    expect(INVASION.plains.min).toBe(31)
    expect(INVASION.rift.max).toBe(60)
    for (let k = 1; k < INVASION_ORDER.length; k++) expect(INVASION[INVASION_ORDER[k]!].min).toBeGreaterThanOrEqual(INVASION[INVASION_ORDER[k - 1]!].min)
  })

  it('every kind of the roster fights today: itself, or its stand-in until phase 4/5/7 adds it', () => {
    for (const z of ZONE_IDS) {
      const d = invadedZone(z)
      for (const k of [...d.kinds.map(e => e.kind), d.finale.leader, ...d.finale.with, ...(d.champion ? [d.champion] : [])]) {
        expect(ENEMY_BY_ID[k], `${z}: ${k}`).toBeDefined()
      }
      // The finale is a boss where the campaign's was (the layout, laid for a boss's arena or not, is the same),
      // and wherever the invasion brings a new boss of its own (phase 5: the Wildwood's elite finale becomes the Chimera's arena).
      expect(ENEMY_BY_ID[d.finale.leader]!.rank === 'boss', z).toBe(ENEMY_BY_ID[ZONES[z].finale.leader]!.rank === 'boss' || (!!INVASION[z].boss && !!ENEMY_BY_ID[INVASION[z].boss!]))
    }
    // The seam: a designed kind that exists already resolves to itself, a missing one to its stand-in.
    expect(resolveKind('imp')).toBe('imp')
    for (const [want, stand] of Object.entries(STAND_INS)) {
      expect(ENEMY_BY_ID[stand], `${want} → ${stand}`).toBeDefined()
      if (!ENEMY_BY_ID[want]) expect(resolveKind(want)).toBe(stand)
    }
  })

  it('the four Reborn bosses return on their own scripts, with one add more than in the campaign', () => {
    expect([...REBORN].sort()).toEqual(['emberLord', 'frostJarl', 'tusker', 'voidDragon'])
    for (const z of ZONE_IDS) {
      if (!INVASION[z].reborn) continue
      const d = invadedZone(z)
      expect(d.finale.leader, z).toBe(ZONES[z].finale.leader)
      expect(d.finale.with.length, z).toBe(ZONES[z].finale.with.length + 1)
    }
    for (const k of ['tusker', 'frostJarl', 'voidDragon']) expect(ENEMY_BY_ID[k]!.script, k).toBeTruthy()
  })

  it('the invaded zones open one after the other, the first two with the afterplay', () => {
    const none = new Set<string>()
    expect(INVASION_ORDER.filter(z => invadedOpen(z, none))).toEqual(['plains', 'hollows'])
    const won = new Set([invadedFlag('plains'), invadedFlag('hollows')])
    expect(invadedOpen('woods', won)).toBe(true)
    expect(invadedOpen('outskirts', won)).toBe(false)
    expect(invadedBefore('outskirts')).toBe('woods')
    // Before the afterplay nothing is shut; towns never are.
    expect(invasionLetsIn('rift', false, none)).toBe(true)
    expect(invasionLetsIn('sunford', true, none)).toBe(true)
    expect(invasionLetsIn('rift', true, none)).toBe(false)
  })

  it('an encounter in the afterplay\'s wilds is the region\'s invaded roster at its band', () => {
    for (const z of ZONE_IDS) {
      const d = invadedZone(z)
      const kinds = new Set([...d.kinds.map(e => e.kind), d.champion ?? '', 'banditChief', 'broodSpider', 'outlawCaptain', 'emberLord', 'doomKnight', 'voidWarden', 'pitLord'])
      for (let s = 1; s < 40; s++) {
        const e = rollEncounter(z, 45, s, true)
        expect(e.invaded).toBe(true)
        expect(e.level).toBe(visitLevel(d, 45))
        for (const p of e.packs) for (const k of p) expect(kinds.has(k), `${z}: ${k}`).toBe(true)
      }
      expect(rollEncounter(z, 45, 3).invaded).toBeUndefined()
    }
  })
})

describe('the invaded zones (generation)', () => {
  for (const z of ZONE_IDS) {
    it(`${z}: walkable to every pack and pylon, the campaign's clearings, its roster, ruins, scars and a pylon a section`, () => {
      const d = invadedZone(z)
      const allowed = new Set([...d.kinds.map(e => e.kind), d.finale.leader, ...d.finale.with, ...(d.midBoss ? [d.midBoss] : [])])
      for (const seed of SEEDS) {
        const plan = generateZone(d, seed)
        const camp = generateZone(ZONES[z], seed)
        const at = `${z}#${seed}`
        // The same layout: the clearings are where the campaign's are (a new boss's arena is laid as a boss's: the rest is checked the same).
        const sameArena = (ENEMY_BY_ID[d.finale.leader]!.rank === 'boss') === (ENEMY_BY_ID[ZONES[z].finale.leader]!.rank === 'boss')
        if (sameArena) expect(plan.clearings.map(c => [c.x, c.z, c.r]), at).toEqual(camp.clearings.map(c => [c.x, c.z, c.r]))
        else expect(plan.clearings.length, at).toBe(camp.clearings.length)
        expect(plan.packs.length, at).toBe(ZONES[z].sections)
        for (const p of plan.packs) for (const k of p.kinds) expect(allowed.has(k), `${at}: ${k}`).toBe(true)
        expect(plan.packs[plan.packs.length - 1]!.boss, at).toBe(d.finale.leader)
        const g = gridOf(plan)
        for (const [i, p] of plan.packs.entries()) expect(reachable(g, plan, p.x, p.z), `${at} pack ${i}`).toBe(true)
        // Every chest from where one stands to open it.
        for (const c of plan.chests) if (c.door < 0) expect(reachable(g, plan, c.sx, c.sz), `${at} ${c.role} chest`).toBe(true)
        // A pylon in (nearly) every section the hero fights through, on open ground he reaches.
        const pylons = plan.pylons ?? []
        expect(pylons.length, `${at} pylons`).toBeGreaterThanOrEqual(Math.max(1, ZONES[z].sections - 2))
        expect(pylons.length, `${at} pylons`).toBeLessThanOrEqual(ZONES[z].sections - 1)
        for (const p of pylons) {
          expect(isSolidAt(g, p.x, p.z), `${at} pylon in rock`).toBe(false)
          expect(reachable(g, plan, p.x, p.z), `${at} pylon sealed off`).toBe(true)
        }
        const ruins = (plan.dressing ?? []).filter(x => x.kind === 'ruin')
        const scars = (plan.dressing ?? []).filter(x => x.kind === 'scar')
        expect(ruins.length, `${at} ruins`).toBeGreaterThanOrEqual(ZONES[z].sections)
        for (const r of ruins) expect(r.cells.length, `${at} a ruin blocks its cell`).toBe(1)
        expect(scars.length, `${at} scars`).toBeGreaterThanOrEqual(1)
        expect(scars.length, `${at} scars`).toBeLessThanOrEqual(INVASION[z].scars[1])
        // A scar never lies on the road.
        for (const s of scars) expect(plan.trail[Math.floor(s.z / CELL) * plan.w + Math.floor(s.x / CELL)], `${at} scar on the road`).toBe(0)
      }
    })
  }

  it('the campaign zones carry none of it', () => {
    for (const z of ZONE_IDS) {
      const plan = generateZone(ZONES[z], 7)
      expect(plan.pylons, z).toBeUndefined()
      expect((plan.dressing ?? []).some(d => d.kind === 'ruin' || d.kind === 'scar'), z).toBe(false)
    }
  })
})

// ─── The sim ─────────────────────────────────────────────────────────────────

const naked = (level = 40): HeroBuild => ({ level, attrs: startAttrs(), equipped: noGear(), passives: [] })

const arena = (invaded: boolean, level = 40): Sim => {
  const plan = generateArena(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: naked(level), skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  if (invaded) armInvasion(sim)
  return sim
}

describe('the invaded zones (sim)', () => {
  it(`kills pay ×${AFTER_XP_MUL} in an invaded zone, and only there`, () => {
    const xpOf = (invaded: boolean): number => {
      const sim = arena(invaded)
      const u = sim.hero.unit
      const e = spawnEnemy(sim, 'highDemon', u.x + 2, u.z)!
      dealDamage(sim, u, e, 1e7, { type: 'true', canCrit: false })
      expect(e.alive).toBe(false)
      return sim.hero.xp
    }
    const plain = xpOf(false)
    const inv = xpOf(true)
    expect(plain).toBeGreaterThan(0)
    expect(inv / plain).toBeCloseTo(AFTER_XP_MUL, 1)
  })

  it('an invaded visit stands its pylons and scars; enemies are infernal; the campaign\'s has none', () => {
    for (const invaded of [true, false]) {
      const def = invaded ? invadedZone('plains') : ZONES.plains
      const plan = generateZone(def, 7)
      const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: visitLevel(def, 32), difficulty: 1, mode: 'zone', zone: 'plains' })
      applyPlan(sim, plan)
      createHero(sim, { build: naked(32), skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
      if (invaded) armInvasion(sim)
      populateZone(sim, plan, 'plains', [])
      const pylons = sim.units.filter(isPylon)
      expect(pylons.length).toBe(invaded ? plan.pylons!.length : 0)
      expect(sim.fields.filter(f => f.active && f.fx === 'scar').length).toBe(invaded ? (plan.dressing ?? []).filter(d => d.kind === 'scar').length : 0)
      const foes = sim.units.filter(u => u.team === 1 && !isPylon(u))
      expect(foes.length).toBeGreaterThan(0)
      expect(foes.every(u => !!u.infernal === invaded)).toBe(true)
      if (invaded) expect(foes.every(u => u.level >= INVASION.plains.min && u.level <= INVASION.plains.max + 4)).toBe(true)
    }
  })

  it(`a pylon's aura makes the enemies near it hit ${Math.round(PYLON.dmg * 100)} % harder; felled, the pylons' chest pays once`, () => {
    const plan = generateZone(invadedZone('hollows'), 7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 33, difficulty: 1, mode: 'zone', zone: 'hollows' })
    applyPlan(sim, plan)
    createHero(sim, { build: naked(33), skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    armInvasion(sim)
    populateZone(sim, plan, 'hollows', [])
    const pylons = sim.units.filter(isPylon)
    expect(pylons.length).toBeGreaterThan(0)
    const p = pylons[0]!
    const near = spawnEnemy(sim, 'imp', p.x + 2, p.z)!
    const far = spawnEnemy(sim, 'imp', p.x + PYLON.r + 30, p.z)!
    expect(pylonAura(sim, near)).toBeCloseTo(1 + PYLON.dmg)
    expect(pylonAura(sim, far)).toBe(1)
    expect(pylonAura(sim, p)).toBe(1)
    // The aura is in the blow: the same imp, the same hit, with and without it.
    const hero = sim.hero.unit
    hero.s.armor = 0
    const hp0 = hero.hp
    const hitNear = dealDamage(sim, near, hero, 10, { type: 'true', canCrit: false })
    hero.hp = hp0
    for (const q of pylons) dealDamage(sim, hero, q, 1e9, { type: 'true', canCrit: false })
    expect(pylonsLeft(sim)).toBe(0)
    const hitBare = dealDamage(sim, near, hero, 10, { type: 'true', canCrit: false })
    expect(hitNear / hitBare).toBeCloseTo(1 + PYLON.dmg, 2)
    // A pylon pays no kill of its own: the chest is the prize.
    const gold0 = sim.hero.gold
    const items0 = sim.hero.items.length
    stepSim(sim, plan, 1 / 30)
    const paid = sim.events.filter(e => e.t === 'pylonsDown').length
    expect(paid).toBe(1)
    expect(sim.hero.gold).toBeGreaterThan(gold0)
    expect(sim.hero.items.length).toBeGreaterThanOrEqual(items0)
    sim.events.length = 0
    for (let s = 0; s < 10; s++) stepSim(sim, plan, 1 / 30)
    expect(sim.events.filter(e => e.t === 'pylonsDown').length).toBe(0)
  })

  it('a pylon stops a body at what it draws: below head height its stone keeps inside its collider', () => {
    const plan = generateZone(invadedZone('plains'), 7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 32, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, { build: naked(32), skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
    armInvasion(sim)
    populateZone(sim, plan, 'plains', [])
    const p = sim.units.find(isPylon)!
    const { lit } = demonPylonGeo()
    const pos = lit.attributes.position!
    let reach = 0
    for (let v = 0; v < pos.count; v++) if (pos.getY(v) < BODY_H) reach = Math.max(reach, Math.hypot(pos.getX(v), pos.getZ(v)))
    expect(reach).toBeLessThanOrEqual(p.r + SOLID_TOL)
    // It never moves, never strikes, and pays no kill of its own; a body
    // walking into it is stopped, it is not shoved.
    expect(p.s.moveSpeed).toBe(0)
    expect(ENEMY_BY_ID[p.kind]).toBeUndefined()
    const h = sim.hero.unit
    const at = { x: p.x, z: p.z }
    h.x = p.x + 0.3
    h.z = p.z
    for (let s = 0; s < 30; s++) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
    expect(p.x).toBeCloseTo(at.x, 5)
    expect(p.z).toBeCloseTo(at.z, 5)
    expect(Math.hypot(h.x - p.x, h.z - p.z)).toBeGreaterThan((h.r + p.r) * 0.85)
  })

  it('a rift scar slows and burns whoever stands in it', () => {
    const plan = generateZone(invadedZone('woods'), 7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 35, difficulty: 1, mode: 'zone', zone: 'woods' })
    applyPlan(sim, plan)
    createHero(sim, { build: naked(35), skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
    armInvasion(sim)
    populateZone(sim, plan, 'woods', [])
    const scar = sim.fields.find(f => f.fx === 'scar')!
    expect(scar).toBeDefined()
    const h = sim.hero.unit
    h.x = scar.x
    h.z = scar.z
    const hp0 = h.hp
    for (let s = 0; s < 40; s++) { stepSim(sim, plan, 1 / 30); sim.events.length = 0; h.x = scar.x; h.z = scar.z }
    expect(h.hp).toBeLessThan(hp0)
    expect(h.statuses.some(s => s.id === 'slow')).toBe(true)
  })
})

describe('the invaded zones (the reference player)', () => {
  // The yardstick (`sim/bot.ts`) through the first two invaded zones at their
  // band with a level-appropriate build: they are winnable, in about the time
  // a campaign zone takes (§4: ~5-7 min a zone).
  for (const z of ['plains', 'hollows'] as const) {
    it(`${z}: a geared hero of the band clears its invaded self`, () => {
      const level = INVASION[z].max
      const ref = referenceBuild({ level, cls: 'aegis', geared: true })
      expect(ref.skills.length).toBeGreaterThan(0)
      const r = runZone({ zone: z, level, cls: 'aegis', geared: true, invaded: true, seed: 7, potions: 5, maxSeconds: 900 })
      // eslint-disable-next-line no-console
      console.log(`[invasion bot] ${z} lvl ${level}: ${r.outcome || 'timeout'} in ${Math.round(r.seconds)} s, ${r.kills} kills, ${r.xp} xp, hp ${Math.round(r.hpLeft01 * 100)} %`)
      expect(r.outcome).toBe('victory')
      expect(r.seconds).toBeLessThan(900)
    }, 120_000)
  }
})
