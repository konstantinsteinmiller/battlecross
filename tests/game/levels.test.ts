import { describe, expect, it } from 'vitest'
import { fillGrid, generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { K_BLOCK, K_BRIDGE, K_FORD, K_GROUND, K_PLATE, K_WATER, riverRow } from '@/game/sim/zoneFeatures'
import {
  CELL, cellOf, createGrid, findPath, hasLineOfSight, isSolidAt, isSolidCell, moveCircle, nearestOpen, PATH_BUDGET,
  SOLID_LOW, SOLID_SEALED, type Grid
} from '@/game/sim/grid'
import { ZONES, ZONE_FEATURES, ZONE_IDS } from '@/game/data/zones'
import { ITEM_BY_ID, type ZoneId } from '@/game/data/items'
import { CHAMPION_REWARD, CHEST_TIERS, POTION_BELT_MAX, ZONE_LOOT, finaleGold, lootZoneOf, manaPotionGold } from '@/game/data/loot'
import { Sim, SIDE_GROUP } from '@/game/sim/world'
import { applyPlan, leaveVisit, populateZone } from '@/game/sim/director'
import { createHero, orderAttack, orderMove, useManaPotion, POTION_CD } from '@/game/sim/hero'
import {
  CHEST_REACH, LEAVE_BEAT, chestLock, nearChest, openChest, orderOpen, pickChest, rollChest, specialKey
} from '@/game/sim/interact'
import { stepSim } from '@/game/sim/step'
import { botThink, referenceBuild, runZone, setupRun } from '@/game/sim/bot'
import { fire } from '@/game/sim/actors'
import { dealDamage, kill } from '@/game/sim/combat'
import { mulberry32 } from '@/game/sim/rng'
import type { SimEvent } from '@/game/sim/types'

/**
 * What a zone holds beside its packs (roadmap #54–#59): chests, optional
 * corners, the plate puzzle, water and caves. Every rule the generator and the
 * sim promise about them, on the pure simulation.
 */

const SEEDS = [1, 2, 3, 5, 7, 11, 42, 77, 1234, 99991, 31337, 2024]

const gridOf = (plan: ZonePlan, doorsOpen = false): Grid => fillGrid(createGrid(plan.w, plan.h), plan, doorsOpen)

const path: number[] = []
const walk = (g: Grid, plan: ZonePlan, x: number, z: number): boolean =>
  (cellOf(x) === cellOf(plan.start.x) && cellOf(z) === cellOf(plan.start.z)) || findPath(g, plan.start.x, plan.start.z, x, z, path) > 0

/** Every zone on every seed, with what a visit of it can hold. */
const everyPlan = (fn: (plan: ZonePlan, zone: ZoneId, tag: string) => void): void => {
  for (const zone of ZONE_IDS) for (const seed of SEEDS) fn(generateZone(ZONES[zone], seed), zone, `${zone}#${seed}`)
}

const visit = (zone: ZoneId, seed: number, opened: string[] = [], o: { level?: number; potions?: number; manaPotions?: number; owned?: string[] } = {}) => {
  const plan = generateZone(ZONES[zone], seed)
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: ZONES[zone].min, difficulty: 1, mode: 'zone', zone })
  applyPlan(sim, plan)
  const ref = referenceBuild({ level: o.level ?? ZONES[zone].min + 1, cls: 'aegis' })
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: o.potions ?? 3, manaPotions: o.manaPotions })
  populateZone(sim, plan, zone, o.owned ?? [], opened)
  sim.events.length = 0
  return { sim, plan }
}

/** Step the world, keeping every event. */
const run = (sim: Sim, plan: ZonePlan, seconds: number, until?: () => boolean): SimEvent[] => {
  const all: SimEvent[] = []
  for (let t = 0; t < seconds; t += 1 / 30) {
    stepSim(sim, plan, 1 / 30)
    all.push(...sim.events)
    sim.events.length = 0
    if (until?.()) break
  }
  return all
}

/** A seed of `zone` whose plan satisfies `want` (the features are a seed's choice). */
const seedWith = (zone: ZoneId, want: (plan: ZonePlan) => boolean): number => {
  for (let seed = 1; seed < 400; seed++) if (want(generateZone(ZONES[zone], seed))) return seed
  throw new Error(`no seed of ${zone} has it`)
}

describe('the plan: everything a visit holds can be walked to', () => {
  it('the main chain is untouched: one pack per clearing, and every one reachable with the water in', () => {
    everyPlan((plan, zone, tag) => {
      const g = gridOf(plan)
      expect(plan.packs.length, tag).toBe(ZONES[zone].sections)
      for (const [i, p] of plan.packs.entries()) {
        expect(isSolidAt(g, p.x, p.z), `${tag} pack ${i} stands in water or rock`).toBe(false)
        expect(walk(g, plan, p.x, p.z), `${tag} pack ${i} is cut off`).toBe(true)
      }
    })
  })

  it('every chest has a standing spot within reach of it that the hero can walk to', () => {
    everyPlan((plan, _zone, tag) => {
      const shut = gridOf(plan)
      const open = gridOf(plan, true)
      expect(plan.chests.length, tag).toBeGreaterThanOrEqual(1)
      expect(plan.chests[0]!.role, tag).toBe('finale')
      for (const c of plan.chests) {
        expect(plan.kind[cellOf(c.z) * plan.w + cellOf(c.x)], `${tag} chest ${c.id} cell`).toBe(K_BLOCK)
        expect(Math.hypot(c.sx - c.x, c.sz - c.z), `${tag} chest ${c.id} stand`).toBeLessThanOrEqual(CHEST_REACH)
        if (c.door >= 0) {
          // Behind its door: walled off until the door opens, reachable after.
          expect(walk(shut, plan, c.sx, c.sz), `${tag} chest ${c.id} is not sealed`).toBe(false)
          expect(walk(open, plan, c.sx, c.sz), `${tag} chest ${c.id} behind an open door`).toBe(true)
        } else expect(walk(shut, plan, c.sx, c.sz), `${tag} chest ${c.id} (${c.role})`).toBe(true)
      }
    })
  })

  it('side chests stay off the road and inside the zone\'s count', () => {
    everyPlan((plan, zone, tag) => {
      // A branch's chest (roadmap #70) is that branch's reward, beside the count.
      const side = plan.chests.filter(c => c.role !== 'finale' && c.role !== 'secret' && c.role !== 'bypass' && c.role !== 'branch')
      const [lo, hi] = ZONE_FEATURES[zone].chests
      expect(side.length, tag).toBeGreaterThanOrEqual(1)
      expect(side.length, tag).toBeLessThanOrEqual(Math.max(lo, hi))
      for (const c of side) expect(plan.trail[cellOf(c.z) * plan.w + cellOf(c.x)], `${tag} chest ${c.id} on the road`).toBe(0)
    })
  })

  it('plates, the hint stone, optional packs, caves and crossings are all reachable', () => {
    everyPlan((plan, _zone, tag) => {
      const g = gridOf(plan)
      for (const p of plan.plates) {
        expect(plan.kind[cellOf(p.z) * plan.w + cellOf(p.x)], tag).toBe(K_PLATE)
        expect(walk(g, plan, p.x, p.z), `${tag} plate ${p.id}`).toBe(true)
      }
      if (plan.puzzle) {
        const out: [number, number] = [0, 0]
        expect(nearestOpen(g, plan.puzzle.hint.x, plan.puzzle.hint.z, out, 1), `${tag} hint`).toBe(true)
        expect(walk(g, plan, out[0], out[1]), `${tag} hint stone`).toBe(true)
      }
      for (const p of plan.optionalPacks) expect(walk(g, plan, p.x, p.z), `${tag} optional pack`).toBe(true)
      for (const c of plan.caves) {
        expect(walk(g, plan, c.x, c.z), `${tag} cave chamber`).toBe(true)
        expect(walk(g, plan, c.mouth.x, c.mouth.z), `${tag} cave mouth`).toBe(true)
        expect(plan.cave[cellOf(c.z) * plan.w + cellOf(c.x)], `${tag} cave floor`).toBe(1)
      }
      for (const cr of plan.crossings) {
        for (const k of cr.cells) {
          expect([K_BRIDGE, K_FORD]).toContain(plan.kind[k])
          expect(walk(g, plan, (k % plan.w + 0.5) * CELL, (Math.floor(k / plan.w) + 0.5) * CELL), `${tag} crossing`).toBe(true)
        }
      }
    })
  })

  it('a zone keeps its rim, and the plan is the same for the same seed', () => {
    everyPlan((plan, zone, tag) => {
      for (let i = 0; i < plan.w; i++) {
        expect(plan.solid[i], tag).toBe(1)
        expect(plan.solid[(plan.h - 1) * plan.w + i], tag).toBe(1)
      }
      for (let j = 0; j < plan.h; j++) {
        expect(plan.solid[j * plan.w], tag).toBe(1)
        expect(plan.solid[j * plan.w + plan.w - 1], tag).toBe(1)
      }
      const again = generateZone(ZONES[zone], plan.seed)
      expect(Array.from(again.kind), tag).toEqual(Array.from(plan.kind))
      expect(Array.from(again.sealed), tag).toEqual(Array.from(plan.sealed))
      expect(again.chests, tag).toEqual(plan.chests)
      expect(again.optionalPacks, tag).toEqual(plan.optionalPacks)
      expect(again.puzzle, tag).toEqual(plan.puzzle)
    })
  })

  it('the packs of a seed are what they were before the zone held anything else', () => {
    // The feature pass draws from its own stream. This is the fingerprint of
    // every pack (place, size, kinds) of every zone on ten seeds, with and
    // without the tutorial and an ambush, taken from the generator as it was
    // BEFORE chests, water and caves existed (commit 779df68). The balance
    // and determinism tests ride on these packs staying byte-identical.
    // A zone with branches (roadmap #70) has rock either side of its chain:
    // the chain is the same, set in by that margin, so it is measured from it.
    let h = 2166136261
    for (const zone of ZONE_IDS) {
      for (const seed of [1, 2, 3, 5, 7, 11, 42, 77, 1234, 99991]) {
        for (const o of [{}, { tutorial: true }, { ambush: 'orderGuard', extra: 1 }]) {
          const plan = generateZone(ZONES[zone], seed, o)
          const off = ((plan.w - 40) / 2) * CELL
          const s = JSON.stringify(plan.packs.map(p => ({ ...p, x: p.x - off })))
          for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
        }
      }
    }
    expect(h >>> 0).toBe(493031836)
    expect(generateZone(ZONES.plains, 77).packs.map(p => p.kinds)).toEqual([
      ['goblinSlinger', 'goblin', 'goblin'], ['goblinSlinger', 'goblin'], ['banditChief', 'bandit', 'goblinSlinger']
    ])
  })

  it('visits differ: across seeds a zone shows each of its features, and not always the same ones', () => {
    for (const zone of ZONE_IDS) {
      const f = ZONE_FEATURES[zone]
      const plans = Array.from({ length: 60 }, (_, s) => generateZone(ZONES[zone], s + 1))
      const share = (fn: (p: ZonePlan) => boolean): number => plans.filter(fn).length / plans.length
      const has = (chance: number, got: number, what: string): void => {
        if (chance <= 0) expect(got, `${zone} ${what}`).toBe(0)
        else {
          expect(got, `${zone} never has ${what}`).toBeGreaterThan(0)
          expect(got, `${zone} always has ${what}`).toBeLessThan(1)
        }
      }
      has(f.liquid ? f.river : 0, share(p => p.rivers.length > 0), 'a river')
      has(f.cave, share(p => p.caves.length > 0), 'a cave')
      has(f.plates ? f.puzzle : 0, share(p => !!p.puzzle), 'a puzzle')
      has(f.champion, share(p => p.optionalPacks.some(o => o.champion)), 'a champion')
      has(f.corner, share(p => p.chests.some(c => c.role === 'guard')), 'a guarded corner')
      if (!f.liquid) expect(share(p => p.kind.includes(K_WATER)), zone).toBe(0)
      expect(new Set(plans.map(p => p.chests.length)).size, `${zone} chest counts`).toBeGreaterThan(1)
    }
  })

  it('the tutorial visit is simple: one easy chest by the road, and nothing else', () => {
    for (const seed of SEEDS) {
      const plan = generateZone(ZONES.plains, seed, { tutorial: true })
      expect(plan.chests.map(c => c.role), `#${seed}`).toEqual(['finale', 'tutorial'])
      const c = plan.chests[1]!
      expect(c.tier).toBe('wood')
      expect(Math.hypot(c.x - plan.start.x, c.z - plan.start.z), `#${seed}`).toBeLessThan(6)
      expect(plan.kind.includes(K_WATER)).toBe(false)
      expect(plan.plates).toEqual([])
      expect(plan.optionalPacks).toEqual([])
      expect(plan.caves).toEqual([])
    }
  })

  it('the first zone never has a puzzle, and a puzzle zone has it on some visits only', () => {
    expect(ZONE_FEATURES.plains.plates).toBe(0)
    expect(ZONE_IDS.filter(z => ZONE_FEATURES[z].plates > 0).length).toBeGreaterThan(2)
    expect(ZONE_IDS.filter(z => ZONE_FEATURES[z].plates === 0).length).toBeGreaterThan(2)
  })
})

describe('water', () => {
  it('never blocks the main road: a river is bridged where the road meets it', () => {
    let rivers = 0
    everyPlan((plan, _zone, tag) => {
      for (const r of plan.rivers) {
        rivers++
        const bridge = plan.crossings.find(c => c.kind === 'bridge')
        expect(bridge, `${tag} bridge`).toBeTruthy()
        // The river runs from rim to rim: without its bridge the road is cut
        // (a branch way it crosses keeps going over a ford of its own).
        for (let i = 2; i < plan.w - 2; i++) {
          const k = riverRow(r, i) * plan.w + i
          expect([K_WATER, K_BRIDGE, K_FORD], `${tag} river column ${i}`).toContain(plan.kind[k])
        }
        for (const k of bridge!.cells) expect(plan.trail[k], `${tag} the road runs over the bridge`).toBe(1)
        const dry = gridOf(plan)
        for (const cr of plan.crossings) for (const k of cr.cells) dry.solid[k] = SOLID_LOW
        const last = plan.packs[plan.packs.length - 1]!
        expect(findPath(dry, plan.start.x, plan.start.z, last.x, last.z, path), `${tag} the crossings are the only ways`).toBe(0)
      }
    })
    expect(rivers).toBeGreaterThan(10)
  })

  it('blocks feet but not eyes or shots', () => {
    const seed = seedWith('woods', p => p.rivers.length > 0)
    const plan = generateZone(ZONES.woods, seed)
    const g = gridOf(plan)
    const r = plan.rivers[0]!
    const bridge = plan.crossings.find(c => c.kind === 'bridge')!
    const i = bridge.i0 - 1
    const j = riverRow(r, i)
    expect(plan.kind[j * plan.w + i]).toBe(K_WATER)
    expect(isSolidCell(g, i, j)).toBe(true)
    expect(g.solid[j * plan.w + i]).toBe(SOLID_LOW)
    // Seen across: bank to bank over three rows of water (to a spot on the far
    // bank beside the bridge that is open ground, not the rock by the road).
    const x = (bridge.i0 + 1) * CELL
    const o = [-2, 2, -3, 3].find(d => !(g.solid[(bridge.j1 + 1) * plan.w + bridge.i0 + 1 + d]! & 1))!
    expect(o).toBeDefined()
    expect(hasLineOfSight(g, x, (bridge.j0 - 1 + 0.5) * CELL, x + o * CELL, (bridge.j1 + 1 + 0.5) * CELL)).toBe(true)

    // A strip of water between two banks: a body pushed at it stops on the
    // bank, a shot crosses it, and a rock in the same place stops both.
    const lake = createGrid(7, 7)
    for (let c = 0; c < 7; c++) lake.solid[3 * 7 + c] = SOLID_LOW
    const out: [number, number] = [0, 0]
    moveCircle(lake, 5, 1.5, 0, 8, 0.45, out)
    expect(out[1]).toBeLessThanOrEqual(3 * CELL - 0.45 + 1e-6)
    expect(hasLineOfSight(lake, 5, 1.5, 5, 9)).toBe(true)
    expect(findPath(lake, 5, 1.5, 5, 9, path)).toBe(0)
    for (let c = 0; c < 7; c++) lake.solid[3 * 7 + c] = 1
    expect(hasLineOfSight(lake, 5, 1.5, 5, 9)).toBe(false)
    // A sealed cell is rock to the eye as well.
    for (let c = 0; c < 7; c++) lake.solid[3 * 7 + c] = SOLID_SEALED
    expect(hasLineOfSight(lake, 5, 1.5, 5, 9)).toBe(false)
  })

  it('a shot flies over water and stops at rock', () => {
    const { sim, plan } = visit('plains', 3)
    const u = sim.hero.unit
    sim.grid.solid.fill(0)
    const row = cellOf(u.z) - 2
    for (let c = 1; c < plan.w - 1; c++) sim.grid.solid[row * plan.w + c] = SOLID_LOW
    const shoot = (): boolean => {
      for (const p of sim.projectiles) p.active = false
      fire(sim, { fx: 'bolt', src: u, tx: u.x, tz: u.z - 12, speed: 20, dmg: 1, type: 'fire', color: '' })
      run(sim, plan, 0.3)
      return sim.projectiles.some(p => p.active)
    }
    expect(shoot()).toBe(true)
    for (let c = 1; c < plan.w - 1; c++) sim.grid.solid[row * plan.w + c] = 1
    expect(shoot()).toBe(false)
  })

  it('nobody starts a visit standing in water, in rock or behind a closed door', () => {
    for (const zone of ZONE_IDS) {
      for (const seed of SEEDS) {
        const { sim, plan } = visit(zone, seed)
        for (const u of sim.units) {
          const k = cellOf(u.z) * plan.w + cellOf(u.x)
          expect(isSolidAt(sim.grid, u.x, u.z), `${zone}#${seed} ${u.kind}`).toBe(false)
          expect(plan.kind[k] === K_WATER || plan.kind[k] === K_BLOCK, `${zone}#${seed} ${u.kind}`).toBe(false)
          expect(plan.sealed[k], `${zone}#${seed} ${u.kind}`).toBe(0)
        }
      }
    }
  })

  it('a teleport, a leap or a shove never leaves a body in water or in a sealed pocket', () => {
    const seed = seedWith('woods', p => p.rivers.length > 0 && !!p.puzzle)
    const { sim, plan } = visit('woods', seed)
    const out: [number, number] = [0, 0]
    for (let k = 0; k < plan.kind.length; k++) {
      if (plan.kind[k] !== K_WATER && !plan.sealed[k]) continue
      const x = (k % plan.w + 0.5) * CELL
      const z = (Math.floor(k / plan.w) + 0.5) * CELL
      // What every blink, leap and swap does with a landing point (`placeNear`).
      expect(isSolidAt(sim.grid, x, z)).toBe(true)
      if (nearestOpen(sim.grid, x, z, out, 4)) {
        const nk = cellOf(out[1]) * plan.w + cellOf(out[0])
        expect(plan.kind[nk] === K_WATER).toBe(false)
        expect(plan.sealed[nk]).toBe(0)
      }
    }
    expect(plan.sealed.some(v => v > 0)).toBe(true)
    expect((sim.grid.solid[plan.doors[0]!.cells[0]!]! & SOLID_SEALED) !== 0).toBe(true)
  })

  it('a long way round a river is still found inside the runtime path budget', () => {
    let worst = 0
    everyPlan((plan, _zone, tag) => {
      const g = gridOf(plan)
      const last = plan.packs[plan.packs.length - 1]!
      // The default budget is the one the game walks with.
      expect(findPath(g, plan.start.x, plan.start.z, last.x, last.z, path), `${tag} start to finale`).toBeGreaterThan(0)
      worst = Math.max(worst, plan.w * plan.h)
    })
    expect(PATH_BUDGET).toBeGreaterThanOrEqual(worst)
  })
})

describe('loot tables', () => {
  it('every zone has a fixed table per chest tier, sized from its own level band', () => {
    for (const zone of ZONE_IDS) {
      const loot = ZONE_LOOT[zone]
      const def = ZONES[zone]
      expect(loot.band).toEqual([def.min, def.max])
      // Equipment is the zone's own, never a boss's promise or a secret.
      expect(loot.items.length, zone).toBeGreaterThan(0)
      for (const id of loot.items) {
        const it = ITEM_BY_ID[id]!
        expect(it.drop.zone, id).toBe(lootZoneOf(zone))
        expect(['mob', 'chest'], id).toContain(it.drop.src)
        // Inside the band: nothing a hero of the next tier would wear.
        expect(it.level, id).toBeLessThanOrEqual(def.max + 2)
      }
      // Only the Void Rift (all boss drops) borrows another zone's list.
      expect(lootZoneOf(zone), zone).toBe(zone === 'rift' ? 'fortress' : zone)
      let prev = 0
      for (const tier of CHEST_TIERS) {
        const t = loot.tables[tier]
        const gold = t.entries.find(e => e.kind === 'gold')!.gold!
        expect(t.entries.map(e => e.kind).sort(), `${zone} ${tier}`).toEqual(['gold', 'item', 'mana', 'potion'])
        // A pile is a share of what the finale pays inside the band, and a better chest pays more.
        expect(gold[0], `${zone} ${tier}`).toBeGreaterThan(0)
        expect(gold[1], `${zone} ${tier}`).toBeLessThanOrEqual(finaleGold(def.max) * 1.25)
        expect(gold[0], `${zone} ${tier}`).toBeGreaterThan(prev)
        prev = gold[1]
      }
    }
    // Later zones pay more.
    expect(ZONE_LOOT.rift.tables.wood.entries[0]!.gold![0]).toBeGreaterThan(ZONE_LOOT.plains.tables.gold.entries[0]!.gold![1])
  })

  it('a chest is the same chest for the same seed, starts with gold and respects its item cap', () => {
    for (const zone of ZONE_IDS) {
      for (const tier of CHEST_TIERS) {
        const t = ZONE_LOOT[zone].tables[tier]
        const range = t.entries.find(e => e.kind === 'gold')!.gold!
        for (let seed = 1; seed <= 40; seed++) {
          const a = rollChest(t, mulberry32(seed))
          expect(rollChest(t, mulberry32(seed))).toEqual(a)
          expect(a.length).toBe(t.draws)
          expect(a[0]!.kind).toBe('gold')
          expect(a.filter(d => d.kind === 'item').length).toBeLessThanOrEqual(t.maxItems)
          for (const d of a) if (d.kind === 'gold') { expect(d.gold).toBeGreaterThanOrEqual(range[0]); expect(d.gold).toBeLessThanOrEqual(range[1]) }
        }
      }
    }
  })

  it('a visit\'s chests are rolled from its seed, not from the fight\'s dice', () => {
    const a = visit('woods', 7)
    const b = visit('woods', 7)
    expect(a.sim.chests.map(c => c.loot)).toEqual(b.sim.chests.map(c => c.loot))
    expect(visit('woods', 8).sim.chests.map(c => c.loot)).not.toEqual(a.sim.chests.map(c => c.loot))
    // The fight's own stream is where it would be without any chest.
    const bare = new Sim({ seed: 7, w: a.plan.w, h: a.plan.h, level: 6, difficulty: 1, mode: 'zone', zone: 'woods' })
    expect(mulberry32(7)()).toBe(bare.rng())
  })

  it('the belt cap the chests fill to is the one the healers sell up to', async () => {
    const p = await import('@/game/state/profile')
    expect(POTION_BELT_MAX).toBe(p.POTION_MAX)
  })
})

describe('opening a chest', () => {
  const sideChest = (zone: ZoneId = 'plains') => {
    const seed = seedWith(zone, p => p.chests.some(c => c.role === 'nook'))
    const v = visit(zone, seed)
    return { ...v, chest: v.sim.chests.find(c => c.role === 'nook')! }
  }

  it('the hero walks to it, opens it after a moment, and its loot is banked on the run', () => {
    const { sim, plan, chest } = sideChest()
    const h = sim.hero
    expect(orderOpen(sim, chest.id)).toBe(true)
    const ev = run(sim, plan, 60, () => chest.state === 'open')
    expect(chest.state).toBe('open')
    expect(Math.hypot(h.unit.x - chest.x, h.unit.z - chest.z)).toBeLessThanOrEqual(CHEST_REACH + 0.01)
    const states = ev.filter((e): e is Extract<SimEvent, { t: 'chest' }> => e.t === 'chest').map(e => e.state)
    expect(states).toEqual(['opening', 'open'])
    const gold = chest.loot.filter(d => d.kind === 'gold').reduce((s, d) => s + d.gold, 0)
    expect(gold).toBeGreaterThan(0)
    expect(h.gold).toBeGreaterThanOrEqual(gold)
    expect(ev.filter(e => e.t === 'loot').length).toBeGreaterThanOrEqual(1)
    expect(h.chests).toBe(1)
    // Once open it is open: a second order does nothing.
    expect(orderOpen(sim, chest.id)).toBe(false)
    expect(pickChest(sim, chest.x, chest.z, 0.5)).toBeUndefined()
  })

  it('opening takes a moment, and walking off with the stick leaves it closed', () => {
    const { sim, plan, chest } = sideChest()
    orderOpen(sim, chest.id)
    run(sim, plan, 60, () => chest.state === 'opening')
    expect(chest.state).toBe('opening')
    expect(sim.hero.gold).toBe(0)
    sim.hero.stickX = 1
    const ev = run(sim, plan, 0.2)
    sim.hero.stickX = 0
    expect(chest.state).toBe('closed')
    expect(ev.some(e => e.t === 'chest' && e.state === 'closed')).toBe(true)
    expect(sim.hero.chests).toBe(0)
  })

  it('a tap finds the chest, and the prompt offers the nearest one in reach', () => {
    const { sim, chest } = sideChest()
    expect(pickChest(sim, chest.x + 0.3, chest.z + 0.2, 0.35)?.id).toBe(chest.id)
    expect(pickChest(sim, chest.x + 4, chest.z, 0.35)).toBeUndefined()
    expect(nearChest(sim)).toBeUndefined()
    sim.hero.unit.x = chest.sx
    sim.hero.unit.z = chest.sz
    expect(nearChest(sim)?.id).toBe(chest.id)
  })

  it('a health potion fills the belt up to its cap and is drunk on the spot when the belt is full', () => {
    const { sim, chest } = sideChest()
    const h = sim.hero
    chest.loot = [{ kind: 'potion', gold: 0, u: 0, item: '' }]
    h.potions = POTION_BELT_MAX - 1
    openChest(sim, chest)
    expect(h.potions).toBe(POTION_BELT_MAX)
    expect(sim.events.some(e => e.t === 'pickup' && e.what === 'potion')).toBe(true)
    const again = sim.chests.find(c => c.id !== chest.id && c.role !== 'finale') ?? sim.chests[0]!
    again.state = 'closed'
    again.loot = [{ kind: 'potion', gold: 0, u: 0, item: '' }]
    h.unit.hp = h.unit.s.maxHp * 0.3
    sim.events.length = 0
    openChest(sim, again)
    expect(h.potions).toBe(POTION_BELT_MAX)
    expect(h.unit.hp).toBeGreaterThan(h.unit.s.maxHp * 0.7)
    expect(sim.events.some(e => e.t === 'pickup' && e.what === 'heal')).toBe(true)
  })

  it('a mana potion goes into the carried stock; with the stock full it is a little gold', () => {
    const { sim, chest } = sideChest()
    const h = sim.hero
    chest.loot = [{ kind: 'mana', gold: 0, u: 0, item: '' }, { kind: 'mana', gold: 0, u: 0, item: '' }]
    h.manaPotions = h.manaPotionsMax - 1
    const mana = h.unit.mana
    openChest(sim, chest)
    expect(h.manaPotions).toBe(h.manaPotionsMax)
    expect(h.unit.mana).toBe(mana)
    expect(h.gold).toBe(manaPotionGold(sim.level))
    expect(sim.events.filter(e => e.t === 'pickup' && e.what === 'mana')).toHaveLength(1)
  })

  it('equipment is something the hero lacks, from the zone\'s own list; two chests never give the same new piece', () => {
    const { sim } = sideChest('woods')
    const h = sim.hero
    const pool = ZONE_LOOT.woods.items
    const [a, b] = [sim.chests[0]!, sim.chests[1]!]
    for (const c of [a, b]) { c.state = 'closed'; c.role = 'nook'; c.guard = -1; c.loot = [{ kind: 'item', gold: 0, u: 0.01, item: '' }] }
    sim.owned.add(pool[0]!)
    openChest(sim, a)
    openChest(sim, b)
    expect(h.items).toHaveLength(2)
    expect(new Set(h.items).size).toBe(2)
    for (const id of h.items) { expect(pool).toContain(id); expect(id).not.toBe(pool[0]) }
    // Everything owned: a second copy (it becomes gold on the way to the bag).
    for (const id of pool) sim.owned.add(id)
    const c = sim.chests[0]!
    c.state = 'closed'
    openChest(sim, c)
    expect(pool).toContain(h.items[2])
  })
})

describe('mana potions (a carried stock, drunk on demand)', () => {
  const field = (manaPotions: number) => {
    const v = visit('plains', 3, [], { manaPotions })
    return v.sim
  }

  it('restores 45 % of the mana, cleanses nothing, and has its own cooldown', () => {
    const sim = field(2)
    const h = sim.hero
    h.unit.mana = 0
    h.unit.statuses.push({ id: 'slow', t: 5, dur: 5, v: 0.4, n: 1, src: 0 })
    expect(useManaPotion(sim)).toBe(true)
    expect(h.unit.mana).toBeCloseTo(h.unit.s.maxMana * 0.45)
    expect(h.manaPotions).toBe(1)
    expect(h.unit.statuses).toHaveLength(1)
    expect(h.manaPotionCd).toBe(POTION_CD)
    expect(h.potionCd).toBe(0)
    expect(sim.events.some(e => e.t === 'potion' && e.mana === true)).toBe(true)
    expect(sim.events.some(e => e.t === 'mana')).toBe(true)
  })

  it('is refused on cooldown, with none left, and with mana already full', () => {
    const sim = field(2)
    const h = sim.hero
    const denied = (): string[] => sim.events.filter((e): e is Extract<SimEvent, { t: 'denied' }> => e.t === 'denied').map(e => e.why)
    expect(useManaPotion(sim)).toBe(false)
    expect(denied()).toEqual(['mana'])
    h.unit.mana = 0
    expect(useManaPotion(sim)).toBe(true)
    h.unit.mana = 0
    sim.events.length = 0
    expect(useManaPotion(sim)).toBe(false)
    expect(denied()).toEqual(['cooldown'])
    h.manaPotionCd = 0
    expect(useManaPotion(sim)).toBe(true)
    h.manaPotionCd = 0
    h.unit.mana = 0
    expect(useManaPotion(sim)).toBe(false)
    expect(h.manaPotions).toBe(0)
  })

  it('the stock never holds more than the belt has slots', () => {
    const sim = field(0)
    expect(sim.hero.manaPotionsMax).toBe(sim.hero.potionsMax)
    expect(sim.hero.manaPotions).toBe(0)
  })

  it('the reference player starts with none, so the balance runs are untouched; given one, it drinks when dry', () => {
    const { sim } = setupRun({ zone: 'plains', level: 2, cls: 'pyro', seed: 77 })
    const h = sim.hero
    expect(h.manaPotions).toBe(0)
    h.unit.mana = 0
    botThink(sim)
    expect(sim.events.some(e => e.t === 'potion')).toBe(false)
    h.manaPotions = 1
    botThink(sim)
    expect(sim.events.some(e => e.t === 'potion' && e.mana === true)).toBe(true)
    expect(h.manaPotions).toBe(0)
    expect(h.unit.mana).toBeGreaterThan(0)
  })
})

describe('optional corners', () => {
  const cornerVisit = (champion: boolean) => {
    const zone: ZoneId = 'woods'
    // A corner's pack, not a branch's (roadmap #70).
    const corner = (o: ZonePlan['optionalPacks'][number]): boolean => o.champion === champion && o.branch === undefined
    const seed = seedWith(zone, p => p.optionalPacks.some(corner) && p.chests.some(c => c.role === (champion ? 'champion' : 'guard')))
    const v = visit(zone, seed)
    const n = v.plan.optionalPacks.findIndex(corner)
    return { ...v, group: v.sim.sideGroups[n]!, pack: v.plan.optionalPacks[n]!, chest: v.sim.chests.find(c => c.guard === n)! }
  }

  it('are side groups: not in the main chain, not in the HUD\'s pips, not needed for the win', () => {
    const { sim, plan, group } = cornerVisit(false)
    expect(sim.groups.length).toBe(ZONES.woods.sections)
    expect(sim.groups.some(g => g.optional)).toBe(false)
    expect(group.id).toBeGreaterThanOrEqual(SIDE_GROUP)
    expect(group.members).toHaveLength(1)
    // Fell the main chain only: the visit is won with the side pack untouched.
    for (const g of sim.groups) for (const id of g.members) kill(sim, sim.get(id)!, sim.hero.unit)
    const ev = run(sim, plan, 0.1)
    expect(sim.ended).toBe('victory')
    expect(sim.groupsDone).toBe(sim.groups.length)
    expect(group.cleared).toBe(false)
    expect(sim.get(group.members[0]!)!.alive).toBe(true)
    const done = ev.filter((e): e is Extract<SimEvent, { t: 'groupDone' }> => e.t === 'groupDone')
    expect(done[done.length - 1]).toMatchObject({ done: sim.groups.length, total: sim.groups.length })
  })

  it('a side pack that falls is no step toward the win', () => {
    const { sim, plan, group } = cornerVisit(false)
    kill(sim, sim.get(group.members[0]!)!, sim.hero.unit)
    const ev = run(sim, plan, 0.1)
    expect(group.cleared).toBe(true)
    expect(sim.groupsDone).toBe(0)
    expect(sim.ended).toBe('')
    expect(ev.some(e => e.t === 'groupDone')).toBe(false)
  })

  it('the guard only notices a hero who walks right up, and its chest is locked while it lives', () => {
    const { sim, plan, group, pack, chest } = cornerVisit(false)
    const guard = sim.get(group.members[0]!)!
    const h = sim.hero
    // In plain sight at nine metres: a main pack would wake, a guard does not.
    h.unit.x = guard.x
    h.unit.z = guard.z + 9
    sim.grid.solid.fill(0)
    run(sim, plan, 0.5)
    expect(guard.awake).toBe(false)
    expect(chestLock(sim, chest)).toBe('guard')
    expect(orderOpen(sim, chest.id)).toBe(false)
    expect(sim.events.some(e => e.t === 'chest' && e.state === 'locked' && e.why === 'guard')).toBe(true)
    h.unit.z = guard.z + 4
    run(sim, plan, 0.2)
    expect(guard.awake).toBe(true)
    expect(pack.levelOffset).toBeLessThanOrEqual(1)
    kill(sim, guard, h.unit)
    run(sim, plan, 0.1)
    expect(chestLock(sim, chest)).toBe('')
  })

  it('a champion is an elite several levels above the zone, marked, and pays a multiple', () => {
    const { sim, plan, group, pack, chest } = cornerVisit(true)
    const champ = sim.get(group.members[0]!)!
    expect(pack.kinds).toEqual([ZONE_FEATURES.woods.championKind])
    expect(champ.champion).toBe(true)
    expect(group.champion).toBe(true)
    expect(champ.rank).toBe('elite')
    expect(champ.level - sim.level).toBeGreaterThanOrEqual(ZONE_FEATURES.woods.championLevels[0])
    expect(champ.level - sim.level).toBeLessThanOrEqual(ZONE_FEATURES.woods.championLevels[1])
    expect(chest.tier).toBe('gold')
    expect(plan.signs.length).toBeGreaterThan(0)
    // Its reward against the same elite, unmarked, at the same level.
    const h = sim.hero
    kill(sim, champ, h.unit)
    const xp = h.xp
    const { sim: plain } = cornerVisit(true)
    const other = plain.get(plain.sideGroups[plain.sideGroups.findIndex(g => g.champion)]!.members[0]!)!
    other.champion = false
    kill(plain, other, plain.hero.unit)
    // Twice the kill, to the rounding of one XP point.
    expect(Math.abs(xp - plain.hero.xp * CHAMPION_REWARD)).toBeLessThanOrEqual(1)
    expect(CHAMPION_REWARD).toBeGreaterThanOrEqual(2)
  })

  it('stands well off the road: the reference player walks the main chain past every corner', () => {
    for (const zone of ZONE_IDS) {
      for (const seed of SEEDS) {
        const plan = generateZone(ZONES[zone], seed)
        for (const p of plan.optionalPacks) {
          let near = Infinity
          for (let k = 0; k < plan.trail.length; k++) {
            if (!plan.trail[k]) continue
            near = Math.min(near, Math.hypot((k % plan.w + 0.5) * CELL - p.x, (Math.floor(k / plan.w) + 0.5) * CELL - p.z))
          }
          expect(near, `${zone}#${seed}`).toBeGreaterThan(7)
        }
      }
    }
  })
})

describe('the plate puzzle', () => {
  const puzzleVisit = (zone: ZoneId = 'woods') => {
    const seed = seedWith(zone, p => !!p.puzzle)
    const v = visit(zone, seed)
    return { ...v, seed }
  }
  /** Put the hero's feet on a plate for a step, then off it again. */
  const press = (sim: Sim, plan: ZonePlan, id: number): SimEvent[] => {
    const p = sim.plates.find(x => x.id === id)!
    const u = sim.hero.unit
    u.x = p.x
    u.z = p.z
    const ev = run(sim, plan, 0.05)
    u.x = plan.start.x
    u.z = plan.start.z
    ev.push(...run(sim, plan, 0.05))
    return ev
  }

  it('has three plates (four in later zones), each with its own symbol, and a hint within sight of all of them', () => {
    for (const zone of ZONE_IDS) {
      const count = ZONE_FEATURES[zone].plates
      if (!count) continue
      const { plan } = puzzleVisit(zone)
      const g = gridOf(plan)
      expect(plan.plates.length, zone).toBe(count)
      expect(new Set(plan.plates.map(p => p.symbol)).size, zone).toBe(count)
      expect(plan.puzzle!.order.slice().sort(), zone).toEqual(plan.plates.map(p => p.id).sort())
      // Never simply the row as it lies.
      expect(plan.puzzle!.order, zone).not.toEqual(plan.plates.map(p => p.id))
      const hint = plan.puzzle!.hint
      for (const p of plan.plates) {
        expect(Math.hypot(p.x - hint.x, p.z - hint.z), zone).toBeLessThan(12)
        expect(hasLineOfSight(g, hint.x, hint.z, p.x, p.z), `${zone} hint sees plate ${p.id}`).toBe(true)
      }
    }
    expect(ZONE_FEATURES.woods.plates).toBe(3)
    expect(ZONE_FEATURES.temple.plates).toBe(4)
  })

  it('stepped on in order it opens the hidden passage and reveals the chest', () => {
    const { sim, plan } = puzzleVisit()
    const chest = sim.chests.find(c => c.role === 'puzzle')!
    const door = sim.doors[plan.puzzle!.door]!
    expect(chest.state).toBe('hidden')
    expect(pickChest(sim, chest.x, chest.z, 1)).toBeUndefined()
    expect(orderOpen(sim, chest.id)).toBe(false)
    for (const k of door.cells) expect((sim.grid.solid[k]! & SOLID_SEALED) !== 0).toBe(true)
    const order = plan.puzzle!.order
    const all: SimEvent[] = []
    for (const [n, id] of order.entries()) {
      const ev = press(sim, plan, id)
      all.push(...ev)
      const e = ev.find((x): x is Extract<SimEvent, { t: 'plate' }> => x.t === 'plate')!
      expect(e).toMatchObject({ id, ok: true, step: n + 1, solved: n === order.length - 1 })
    }
    expect(sim.puzzle!.solved).toBe(true)
    expect(sim.plates.every(p => p.lit)).toBe(true)
    expect(door.open).toBe(true)
    expect(all.filter(e => e.t === 'door')).toHaveLength(1)
    expect(all.some(e => e.t === 'chest' && e.state === 'reveal')).toBe(true)
    for (const k of door.cells) expect(sim.grid.solid[k]! & SOLID_SEALED).toBe(0)
    expect(chest.state).toBe('closed')
    // Open for the rest of the visit: the hero walks in and opens the chest.
    expect(orderOpen(sim, chest.id)).toBe(true)
    run(sim, plan, 60, () => chest.state === 'open')
    expect(chest.state).toBe('open')
    // Plates do nothing more.
    expect(press(sim, plan, order[0]!).some(e => e.t === 'plate')).toBe(false)
  })

  it('a wrong step resets the plates, with no other punishment', () => {
    const { sim, plan } = puzzleVisit()
    const order = plan.puzzle!.order
    const hp = sim.hero.unit.hp
    press(sim, plan, order[0]!)
    expect(sim.puzzle!.step).toBe(1)
    // The last of the order, out of turn.
    const ev = press(sim, plan, order[order.length - 1]!)
    expect(ev.find(e => e.t === 'plate')).toMatchObject({ ok: false, step: 0, solved: false })
    expect(sim.plates.some(p => p.lit)).toBe(false)
    expect(sim.puzzle!.step).toBe(0)
    expect(sim.hero.unit.hp).toBe(hp)
    expect(sim.doors[0]!.open).toBe(false)
    // A lit plate walked over again changes nothing.
    press(sim, plan, order[0]!)
    expect(press(sim, plan, order[0]!).some(e => e.t === 'plate')).toBe(false)
    expect(sim.puzzle!.step).toBe(1)
  })

  it('enemies stepping on plates do nothing', () => {
    const { sim, plan } = puzzleVisit()
    const foe = sim.units.find(u => u.team === 1)!
    const first = sim.plates.find(p => p.id === plan.puzzle!.order[0])!
    foe.x = first.x
    foe.z = first.z
    foe.homeX = first.x
    foe.homeZ = first.z
    const ev = run(sim, plan, 0.3)
    expect(ev.some(e => e.t === 'plate')).toBe(false)
    expect(sim.puzzle!.step).toBe(0)
  })

  it('the puzzle chest and the secret chest are one-time: emptied once, an ordinary chest stands there after', () => {
    const { sim, seed } = puzzleVisit()
    const chest = sim.chests.find(c => c.role === 'puzzle')!
    expect(chest.special).toBe(specialKey('woods', 'puzzle'))
    expect(chest.tier).toBe('gold')
    expect(chest.loot.some(d => d.kind === 'item')).toBe(true)
    chest.state = 'closed'
    openChest(sim, chest)
    expect(sim.specialOpened).toEqual(['woods:puzzle'])
    const later = visit('woods', seed, ['woods:puzzle']).sim.chests.find(c => c.role === 'puzzle')!
    expect(later.special).toBe('')
    expect(later.tier).toBe('iron')

    const fort = visit('fortress', 9)
    const secret = fort.sim.chests.find(c => c.role === 'secret')!
    expect(secret.loot.map(d => d.item)).toContain('ringOfAbsolutePower')
    openChest(fort.sim, secret)
    expect(fort.sim.hero.items).toContain('ringOfAbsolutePower')
    expect(fort.sim.specialOpened).toEqual(['fortress:secret'])
    expect(fort.sim.hero.gold).toBeGreaterThanOrEqual(150 + fort.sim.level * 40)
    const again = visit('fortress', 9, ['fortress:secret']).sim.chests.find(c => c.role === 'secret')!
    expect(again.loot.some(d => d.item === 'ringOfAbsolutePower')).toBe(false)
    // An owned ring is not handed out twice even on a save that never opened the chest.
    const owned = visit('fortress', 9, [], { owned: ['ringOfAbsolutePower'] })
    openChest(owned.sim, owned.sim.chests.find(c => c.role === 'secret')!)
    expect(owned.sim.hero.items).not.toContain('ringOfAbsolutePower')
  })
})

describe('the finale\'s chest', () => {
  it('is locked while the finale stands; after it falls the hero opens it himself, and the visit waits for him to leave', () => {
    const { sim, plan } = visit('plains', 3, [], { level: 6 })
    const chest = sim.chests[0]!
    const h = sim.hero
    expect(chestLock(sim, chest)).toBe('finale')
    expect(orderOpen(sim, chest.id)).toBe(false)
    expect(nearChest(sim, 1e9)?.role).not.toBe('finale')
    // Stand in the finale's clearing and fell it.
    const fin = plan.packs[plan.packs.length - 1]!
    h.unit.x = fin.x
    h.unit.z = fin.z + 3
    for (const g of sim.groups) for (const id of g.members) kill(sim, sim.get(id)!, h.unit)
    const gold = h.gold
    const ev = run(sim, plan, 15)
    expect(sim.ended).toBe('victory')
    expect(ev.filter(e => e.t === 'victory')).toHaveLength(1)
    // Nobody walks him there and nothing closes the visit by itself.
    expect(chest.state).toBe('closed')
    expect(h.order.kind).toBe('none')
    expect(sim.endReady).toBe(false)
    // He opens it like any other chest.
    expect(chestLock(sim, chest)).toBe('')
    expect(orderOpen(sim, chest.id)).toBe(true)
    run(sim, plan, 30, () => chest.state === 'open')
    expect(chest.state).toBe('open')
    // It pays what the finale always paid: its purse, and a piece the hero lacks.
    expect(h.gold - gold).toBe(finaleGold(sim.level))
    expect(h.items.length).toBe(1)
    expect([...sim.dropTable.chest, ...sim.dropTable.mob]).toContain(h.items[0])
    run(sim, plan, 5)
    expect(sim.endReady).toBe(false)
    // Leave: the visit closes a short beat later.
    expect(leaveVisit(sim)).toBe(true)
    expect(leaveVisit(sim)).toBe(false)
    run(sim, plan, 2, () => sim.endReady)
    expect(sim.endReady).toBe(true)
    expect(sim.time - sim.leaveAt).toBeLessThanOrEqual(LEAVE_BEAT + 0.05)
    expect(h.unit.alive).toBe(true)
  })

  it('leaving without opening it opens it on the way out, so the zone always pays', () => {
    const { sim, plan } = visit('plains', 3, [], { level: 6 })
    const chest = sim.chests[0]!
    for (const g of sim.groups) for (const id of g.members) kill(sim, sim.get(id)!, sim.hero.unit)
    run(sim, plan, 0.1)
    expect(sim.ended).toBe('victory')
    expect(chest.state).toBe('closed')
    sim.events.length = 0
    expect(leaveVisit(sim)).toBe(true)
    expect(chest.state).toBe('open')
    expect(sim.events.some(e => e.t === 'loot' && e.gold === finaleGold(sim.level))).toBe(true)
    expect(sim.hero.gold).toBeGreaterThanOrEqual(finaleGold(sim.level))
    // Its loot is seen before the result screen: a longer beat.
    run(sim, plan, 0.5)
    expect(sim.endReady).toBe(false)
    run(sim, plan, 2, () => sim.endReady)
    expect(sim.endReady).toBe(true)
  })

  it('nobody can leave a visit that is not won', () => {
    const { sim } = visit('plains', 3)
    expect(leaveVisit(sim)).toBe(false)
    expect(sim.leaving).toBe(false)
  })

  it('after the win the leftovers of the main chain are at peace; the reference player still stops on the win', () => {
    const { sim, plan } = visit('woods', 7)
    const h = sim.hero
    for (const id of sim.groups[sim.groups.length - 1]!.members) kill(sim, sim.get(id)!, h.unit)
    run(sim, plan, 0.1)
    expect(sim.ended).toBe('victory')
    const foe = sim.units.find(u => u.team === 1 && u.alive && u.group < SIDE_GROUP)!
    expect(dealDamage(sim, h.unit, foe, 9999, { type: 'physical' })).toBe(0)
    expect(dealDamage(sim, foe, h.unit, 9999, { type: 'physical' })).toBe(0)
    expect(foe.alive).toBe(true)
    // An attack order on a leftover does nothing.
    orderAttack(sim, foe.id)
    expect(h.order.kind).not.toBe('attack')
    const r = runZone({ zone: 'plains', level: 2, cls: 'aegis', seed: 77 })
    expect(r.outcome).toBe('victory')
    expect(r.seconds).toBeLessThan(420)
  })

  it('after the win a side pack is still a real fight, its chest opens once it falls, and falling to it still counts as the win', () => {
    const seed = seedWith('woods', p => p.chests.some(c => c.role === 'guard'))
    const { sim, plan } = visit('woods', seed)
    const h = sim.hero
    const n = plan.optionalPacks.findIndex(o => !o.champion && o.branch === undefined)
    const group = sim.sideGroups[n]!
    const guard = sim.get(group.members[0]!)!
    const chest = sim.chests.find(c => c.guard === n)!
    for (const id of sim.groups[sim.groups.length - 1]!.members) kill(sim, sim.get(id)!, h.unit)
    run(sim, plan, 0.1)
    expect(sim.ended).toBe('victory')
    // Still asleep; walked up to, it wakes and fights.
    expect(guard.awake).toBe(false)
    h.unit.x = guard.x
    h.unit.z = guard.z + 2.5
    run(sim, plan, 1.5)
    expect(guard.awake).toBe(true)
    const hp = h.unit.hp
    expect(dealDamage(sim, guard, h.unit, 5, { type: 'physical' })).toBeGreaterThan(0)
    expect(h.unit.hp).toBeLessThan(hp)
    orderAttack(sim, guard.id)
    expect(h.order.kind).toBe('attack')
    expect(chestLock(sim, chest)).toBe('guard')
    kill(sim, guard, h.unit)
    run(sim, plan, 0.1)
    expect(group.cleared).toBe(true)
    expect(chestLock(sim, chest)).toBe('')

    // Another visit: the hero falls to a side pack after the win.
    const v2 = visit('woods', seed)
    const g2 = v2.sim.get(v2.sim.sideGroups[n]!.members[0]!)!
    for (const id of v2.sim.groups[v2.sim.groups.length - 1]!.members) kill(v2.sim, v2.sim.get(id)!, v2.sim.hero.unit)
    run(v2.sim, v2.plan, 0.1)
    v2.sim.hero.unit.hp = 1
    dealDamage(v2.sim, g2, v2.sim.hero.unit, 9999, { type: 'physical' })
    expect(v2.sim.hero.unit.alive).toBe(false)
    expect(v2.sim.ended).toBe('victory')
    expect(v2.sim.leaving).toBe(true)
    run(v2.sim, v2.plan, 3, () => v2.sim.endReady)
    expect(v2.sim.endReady).toBe(true)
    // The boss's reward is not lost.
    expect(v2.sim.chests[0]!.state).toBe('open')
  })

  it('nothing presses on after the win: the hero cannot be killed while he walks the place', () => {
    const { sim, plan } = visit('woods', 7)
    const h = sim.hero
    // Wake a pack and let the finale fall with it still alive and on him.
    const pack = sim.groups[0]!
    for (const id of pack.members) { const u = sim.get(id)!; u.awake = true; u.x = h.unit.x + 1; u.z = h.unit.z }
    for (const id of sim.groups[sim.groups.length - 1]!.members) kill(sim, sim.get(id)!, h.unit)
    h.unit.hp = 1
    run(sim, plan, 0.1)
    expect(sim.ended).toBe('victory')
    dealDamage(sim, sim.get(pack.members[0]!)!, h.unit, 9999, { type: 'physical' })
    run(sim, plan, 3)
    expect(h.unit.alive).toBe(true)
  })
})

describe('the reference player and the new ground', () => {
  it('opens no chest and wakes no side pack on its way through a zone', () => {
    for (const zone of ['plains', 'woods', 'crags'] as ZoneId[]) {
      const seed = seedWith(zone, p => p.optionalPacks.length > 0)
      const { sim, plan } = setupRun({ zone, level: ZONES[zone].min + 1, cls: 'aegis', seed })
      const r = runZone({ zone, level: ZONES[zone].min + 1, cls: 'aegis', seed })
      expect(r.outcome, zone).not.toBe('')
      expect(sim.sideGroups.length).toBe(plan.optionalPacks.length)
    }
  })

  it('a zone with a river is still walked from end to end', () => {
    const seed = seedWith('woods', p => p.rivers.length > 0)
    const { sim, plan } = setupRun({ zone: 'woods', level: 8, cls: 'aegis', seed })
    const last = plan.packs[plan.packs.length - 1]!
    orderMove(sim, last.x, last.z)
    run(sim, plan, 120, () => Math.hypot(sim.hero.unit.x - last.x, sim.hero.unit.z - last.z) < 6 || !sim.hero.unit.alive)
    const u = sim.hero.unit
    expect(plan.kind[cellOf(u.z) * plan.w + cellOf(u.x)]).not.toBe(K_WATER)
    expect(K_GROUND).toBe(0)
  })
})
