import { describe, expect, it } from 'vitest'
import { generateZone, fillGrid } from '@/game/sim/zoneGen'
import { ZONES, ZONE_IDS } from '@/game/data/zones'
import { LATE_ORE_LEVEL, LATE_ORE_NODES_MIN, ORE_LEVEL, ORE_NODES_MAX, oresAt } from '@/game/data/ores'
import { MINE_REACH, MINE_TIME, mineLock, orderMine, roomyWall } from '@/game/sim/ores'
import { CHEST_NEAR, CHEST_REACH, OPEN_TIME, beginOpen } from '@/game/sim/interact'
import { CELL, cellOf, createGrid, findPath, isSolidAt } from '@/game/sim/grid'
import { K_BLOCK, K_GROUND } from '@/game/sim/zoneFeatures'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { createHero, rollHero, setStick } from '@/game/sim/hero'
import { applyStatus, dealDamage, knockback } from '@/game/sim/combat'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { referenceBuild } from '@/game/sim/bot'

/**
 * Ore (roadmap #99): up to three outcrops a visit against the stone, of the
 * metals the zone's level reaches; three pickaxe swings nothing interrupts,
 * one or two nuggets. And a chest's lid, once lifting, is not given up.
 */

const SEEDS = [1, 2, 3, 7, 11, 42, 77, 1234]

describe('where ore lies', () => {
  it('at most three outcrops a visit, against the stone, of the zone\'s metals, where the hero walks', () => {
    let total = 0
    for (const zone of ZONE_IDS) {
      const def = ZONES[zone]
      const metals = new Set(oresAt(def.min).map(o => o.id))
      for (const seed of SEEDS) {
        const plan = generateZone(def, seed)
        const ores = plan.ores ?? []
        const tag = `${zone}#${seed}`
        expect(ores.length, tag).toBeLessThanOrEqual(ORE_NODES_MAX)
        total += ores.length
        const g = fillGrid(createGrid(plan.w, plan.h), plan)
        const path: number[] = []
        for (const o of ores) {
          expect(metals.has(o.kind), `${tag} ${o.kind}`).toBe(true)
          // The rock is solid: walked round, like a chest.
          expect(isSolidAt(g, o.x, o.z), `${tag} walked through`).toBe(true)
          expect(isSolidAt(g, o.sx, o.sz), `${tag} no place to swing from`).toBe(false)
          expect(Math.hypot(o.sx - o.x, o.sz - o.z), tag).toBeLessThan(MINE_REACH)
          const i = cellOf(o.x)
          const j = cellOf(o.z)
          expect(plan.kind[j * plan.w + i], tag).toBe(K_BLOCK)
          let rock = 0
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if ((di || dj) && plan.solid[(j + dj) * plan.w + i + di]) rock++
          expect(rock, `${tag} not against the stone`).toBeGreaterThanOrEqual(2)
          expect(findPath(g, plan.start.x, plan.start.z, o.sx, o.sz, path), `${tag} out of reach`).toBeGreaterThan(0)
          for (const h of plan.herbs ?? []) expect(Math.hypot(h.x - o.x, h.z - o.z), tag).toBeGreaterThanOrEqual(2.9)
          // Beyond a chest's prompt.
          for (const c of plan.chests) expect(Math.hypot(c.x - o.x, c.z - o.z), tag).toBeGreaterThanOrEqual(CHEST_NEAR + 1.5)
        }
      }
    }
    // Most visits hold some.
    expect(total).toBeGreaterThan(ZONE_IDS.length * SEEDS.length)
  })

  it('never blocks a way: everything walkable without the rocks is walkable with them, and none stands in a passage', () => {
    for (const zone of ZONE_IDS) {
      for (const seed of SEEDS) {
        const plan = generateZone(ZONES[zone], seed)
        const ores = plan.ores ?? []
        if (!ores.length) continue
        const tag = `${zone}#${seed}`
        // Every door open: the pockets behind them count too.
        const g = fillGrid(createGrid(plan.w, plan.h), plan, true)
        const rockCells = new Set(ores.map(o => cellOf(o.z) * plan.w + cellOf(o.x)))
        const flood = (lift: boolean): Uint8Array => {
          const free = (k: number): boolean => (lift && rockCells.has(k)) || !g.solid[k]
          const seen = new Uint8Array(plan.w * plan.h)
          const s = cellOf(plan.start.z) * plan.w + cellOf(plan.start.x)
          const q = [s]
          seen[s] = 1
          while (q.length) {
            const k = q.pop()!
            const i = k % plan.w
            const j = (k - i) / plan.w
            for (let dj = -1; dj <= 1; dj++) {
              for (let di = -1; di <= 1; di++) {
                const ni = i + di
                const nj = j + dj
                if ((!di && !dj) || ni < 0 || nj < 0 || ni >= plan.w || nj >= plan.h) continue
                const nk = nj * plan.w + ni
                if (seen[nk] || !free(nk)) continue
                if (di && dj && (!free(j * plan.w + ni) || !free(nj * plan.w + i))) continue
                seen[nk] = 1
                q.push(nk)
              }
            }
          }
          return seen
        }
        const without = flood(true)
        const withRocks = flood(false)
        for (let k = 0; k < without.length; k++) {
          if (without[k] && !rockCells.has(k)) expect(withRocks[k], `${tag} cell ${k % plan.w},${Math.floor(k / plan.w)} cut off`).toBe(1)
        }
        for (const o of ores) {
          // Against the wall of an open place: the ground runs on 6 m from it.
          const lifted = { ...plan, kind: plan.kind.slice() }
          lifted.kind[cellOf(o.z) * plan.w + cellOf(o.x)] = K_GROUND
          expect(roomyWall(lifted, cellOf(o.x), cellOf(o.z)), `${tag} in a passage`).toBe(true)
        }
      }
    }
  })

  it('a passage two cells wide is never roomy; the wall of a room is', () => {
    const w = 20
    const h = 20
    const mk = (open: (i: number, j: number) => boolean) => {
      const solid = new Uint8Array(w * h)
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) solid[j * w + i] = open(i, j) ? 0 : 1
      const z = new Uint8Array(w * h)
      return { w, h, solid, sealed: z, trail: z, kind: new Uint8Array(w * h), start: { x: 15, z: 15 }, chests: [] }
    }
    // A hallway along x, rows 9 and 10 open.
    const hall = mk((_i, j) => j === 9 || j === 10)
    expect(roomyWall(hall, 10, 9)).toBe(false)
    expect(roomyWall(hall, 10, 10)).toBe(false)
    // A hallway three wide: still a passage.
    const hall3 = mk((_i, j) => j >= 9 && j <= 11)
    expect(roomyWall(hall3, 10, 9)).toBe(false)
    // A room: rock below row 5, open above it.
    const room = mk((i, j) => j >= 5 && j <= 17 && i >= 2 && i <= 17)
    expect(roomyWall(room, 10, 5)).toBe(true)
  })

  it('richer metals only where the level reaches them', () => {
    expect(oresAt(1).map(o => o.id)).toEqual(['iron'])
    expect(oresAt(ORE_LEVEL.mithril).map(o => o.id)).toEqual(['iron', 'silver', 'gold', 'mithril'])
    // The richest the commonest? No: the one below it.
    const w = oresAt(14)
    expect(w.find(o => o.id === 'silver')!.weight).toBeGreaterThan(w.find(o => o.id === 'gold')!.weight)
  })

  it('the last three zones (level 24 and up) hold no iron and no silver, only the high metals (#150)', () => {
    const late = ZONE_IDS.filter(z => ZONES[z].min >= LATE_ORE_LEVEL)
    expect(late).toEqual(['peak', 'fortress', 'rift'])
    for (const z of late) {
      const ids = oresAt(ZONES[z].min).map(o => o.id)
      expect(ids, z).not.toContain('iron')
      expect(ids, z).not.toContain('silver')
      expect(ids, z).toContain('mithril')
      expect(ids.length, z).toBe(3)
    }
    expect(oresAt(ZONES.peak.min).map(o => o.id)).toEqual(['gold', 'mithril', 'adamant'])
    expect(oresAt(ZONES.fortress.min).map(o => o.id)).toEqual(['mithril', 'adamant', 'aetherite'])
    expect(oresAt(ZONES.rift.min).map(o => o.id)).toEqual(['mithril', 'adamant', 'aetherite'])
    // The earlier zones are as they were: iron is still there.
    for (const z of ZONE_IDS.filter(x => ZONES[x].min < LATE_ORE_LEVEL)) expect(oresAt(ZONES[z].min).map(o => o.id), z).toContain('iron')
  })

  it('mithril is a steady find in each late zone: measured over many seeds, and no iron or silver outcrop is ever laid', () => {
    const seeds = Array.from({ length: 60 }, (_, i) => i * 7 + 1)
    for (const z of ['peak', 'fortress', 'rift'] as const) {
      let nodes = 0
      let mithril = 0
      let withMithril = 0
      for (const seed of seeds) {
        const ores = generateZone(ZONES[z], seed).ores ?? []
        nodes += ores.length
        const m = ores.filter(o => o.kind === 'mithril').length
        mithril += m
        if (m) withMithril++
        for (const o of ores) expect(['iron', 'silver'], `${z}#${seed}`).not.toContain(o.kind)
      }
      // Two to three outcrops a visit, about four in nine of them mithril.
      expect(nodes / seeds.length, z).toBeGreaterThanOrEqual(LATE_ORE_NODES_MIN - 0.5)
      expect(mithril / seeds.length, `${z} mithril per visit`).toBeGreaterThanOrEqual(0.7)
      expect(withMithril / seeds.length, `${z} visits with mithril`).toBeGreaterThanOrEqual(0.5)
    }
  })

  it('none on the first visit; a seed lays the same outcrops', () => {
    expect(generateZone(ZONES.plains, 7, { tutorial: true }).ores ?? []).toEqual([])
    expect(generateZone(ZONES.crags, 7).ores).toEqual(generateZone(ZONES.crags, 7).ores)
  })
})

const visitWithOre = () => {
  for (const seed of SEEDS) {
    const plan = generateZone(ZONES.crags, seed)
    if (!plan.ores?.length) continue
    const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 14, difficulty: 1, mode: 'zone', zone: 'crags' })
    applyPlan(sim, plan)
    const ref = referenceBuild({ level: 14, cls: 'aegis' })
    createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    populateZone(sim, plan, 'crags', [])
    return { plan, sim, ore: sim.ores[0]! }
  }
  throw new Error('no ore in any seed')
}

describe('mining', () => {
  it('three swings, one or two nuggets, the outcrop spent; nothing hurts, shoves or stops him meanwhile', () => {
    const { plan, sim, ore } = visitWithOre()
    const u = sim.hero.unit
    u.x = u.px = ore.x + MINE_REACH * 0.6
    u.z = u.pz = ore.z
    expect(orderMine(sim, ore.id)).toBe(true)
    stepSim(sim, plan, 1 / 30)
    expect(u.action?.id).toBe('mine')
    const hp = u.hp
    // An enemy turns up and strikes; the stick pulls away; a roll is tried.
    const e = spawnEnemy(sim, 'goblin', u.x + 1, u.z)!
    dealDamage(sim, e, u, 500, { type: 'physical' })
    applyStatus(sim, u, 'stun', 2, 1, e)
    knockback(u, e.x, e.z, 20)
    setStick(sim, 1, 0)
    expect(rollHero(sim, 1, 0)).toBe(false)
    expect(u.hp).toBe(hp)
    expect(u.action?.id).toBe('mine')
    expect(Math.hypot(u.kx, u.kz)).toBe(0)
    e.alive = false
    for (let t = 0; t < MINE_TIME + 0.5; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    setStick(sim, 0, 0)
    expect(ore.spent).toBe(true)
    const n = sim.hero.ores[ore.kind] ?? 0
    expect(n).toBeGreaterThanOrEqual(1)
    expect(n).toBeLessThanOrEqual(2)
    expect(sim.events.some(ev => ev.t === 'mine' && ev.state === 'done')).toBe(true)
    // Spent: nothing more there.
    expect(orderMine(sim, ore.id)).toBe(false)
  })

  it('not with an awake enemy near: no hiding behind the pickaxe', () => {
    const { plan, sim, ore } = visitWithOre()
    const u = sim.hero.unit
    u.x = u.px = ore.x + MINE_REACH * 0.6
    u.z = u.pz = ore.z
    const e = spawnEnemy(sim, 'goblin', u.x + 3, u.z)!
    e.awake = true
    expect(mineLock(sim)).toBe('enemies')
    orderMine(sim, ore.id)
    stepSim(sim, plan, 1 / 30)
    expect(u.action?.id).not.toBe('mine')
    expect(ore.spent).toBe(false)
    expect(sim.events.some(ev => ev.t === 'mine' && ev.state === 'busy')).toBe(true)
  })
})

describe('a chest\'s lid (#99)', () => {
  it('once lifting, it finishes: the stick, a roll and a stun do not stop it; damage still lands', () => {
    const { plan, sim } = visitWithOre()
    const c = sim.chests.find(x => x.state === 'closed' && x.guard < 0 && x.role !== 'finale')!
    expect(c).toBeTruthy()
    const u = sim.hero.unit
    u.x = u.px = c.x + CHEST_REACH * 0.6
    u.z = u.pz = c.z
    beginOpen(sim, c)
    const hp = u.hp
    const e = spawnEnemy(sim, 'goblin', u.x + 1, u.z)!
    dealDamage(sim, e, u, 10, { type: 'physical' })
    expect(u.hp).toBeLessThan(hp)
    applyStatus(sim, u, 'stun', 0.2, 1, e)
    setStick(sim, 1, 0)
    expect(rollHero(sim, 1, 0)).toBe(false)
    e.alive = false
    for (let t = 0; t < OPEN_TIME + 0.4; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    setStick(sim, 0, 0)
    expect(c.state).toBe('open')
    expect(CELL).toBeGreaterThan(0)
  })
})
