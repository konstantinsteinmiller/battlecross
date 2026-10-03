// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { ARENA_MODS, GLASS_DAMAGE, SWARM_HP, arenaModOf, weekKey } from '@/game/arenaWeek'
import { weekKey as workerWeekKey } from '../../worker/src/index'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan, leaveLadder, LADDER_REST, WAVE_CAP } from '@/game/sim/director'
import { dealDamage } from '@/game/sim/combat'
import { spawnEnemy } from '@/game/sim/spawn'
import { startAttrs } from '@/game/data/attributes'
import { ARENA_WAVES } from '@/game/data/zones'
import type { ArenaMod } from '@/game/arenaWeek'

/** The colosseum as an endless ladder (roadmap #10, D69–D72). */

describe('the week', () => {
  it('is the ISO week in UTC, and the Worker files scores under the same one', () => {
    expect(weekKey(new Date(Date.UTC(2026, 0, 1)))).toBe('2026-W01')
    expect(weekKey(new Date(Date.UTC(2024, 11, 30)))).toBe('2025-W01')
    expect(weekKey(new Date(Date.UTC(2027, 0, 1)))).toBe('2026-W53')
    expect(weekKey(new Date(Date.UTC(2026, 9, 4, 23, 59)))).toBe('2026-W40')
    expect(weekKey(new Date(Date.UTC(2026, 9, 5, 0, 0)))).toBe('2026-W41')
    for (let d = 0; d < 800; d += 3) {
      const at = new Date(Date.UTC(2025, 0, 1) + d * 86_400_000 + 13 * 3_600_000)
      expect(workerWeekKey(at)).toBe(weekKey(at))
    }
  })

  it('turns the modifier once a week, through all six', () => {
    const seen = new Set<ArenaMod>()
    const monday = Date.UTC(2026, 9, 5)
    for (let w = 0; w < ARENA_MODS.length; w++) {
      const a = arenaModOf(new Date(monday + w * 7 * 86_400_000))
      const b = arenaModOf(new Date(monday + w * 7 * 86_400_000 + 6 * 86_400_000))
      expect(a).toBe(b)
      seen.add(a)
    }
    expect(seen.size).toBe(ARENA_MODS.length)
  })
})

const arena = (mod: ArenaMod | '' = '', level = 6): { sim: Sim; plan: ReturnType<typeof generateArena> } => {
  const plan = generateArena(3)
  const sim = new Sim({ seed: 3, w: plan.w, h: plan.h, level, difficulty: 1, mode: 'arena', zone: 'arena' })
  sim.arenaMod = mod
  applyPlan(sim, plan)
  createHero(sim, { build: { level, attrs: startAttrs(), equipped: { main: null, off: null, head: null, body: null, hands: null, feet: null, trinket1: null, trinket2: null }, passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  return { sim, plan }
}
const step = (sim: Sim, plan: ReturnType<typeof generateArena>, s: number): void => {
  for (let t = 0; t < s; t += 1 / 30) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
}
/** Fight until \`n\` waves are cleared (the hero cannot fall: he is shielded). */
const clearTo = (sim: Sim, plan: ReturnType<typeof generateArena>, n: number): number[] => {
  const sizes: number[] = []
  for (let guard = 0; guard < 4000 && sim.wave.cleared < n; guard++) {
    sim.hero.unit.hp = sim.hero.unit.s.maxHp
    const foes = sim.units.filter(u => u.alive && u.team === 1)
    if (foes.length && sizes.length < sim.wave.n) sizes.push(foes.length)
    for (const u of foes) dealDamage(sim, null, u, 1e9, { type: 'true', canCrit: false })
    step(sim, plan, 0.2)
  }
  return sizes
}

describe('the ladder', () => {
  it('goes on past the eighth wave: the prize at eight, a purse every fifth after, and Leave only between waves from eight on', () => {
    const { sim, plan } = arena()
    clearTo(sim, plan, ARENA_WAVES - 1)
    expect(leaveLadder(sim)).toBe(false)
    const gold7 = sim.hero.gold
    clearTo(sim, plan, ARENA_WAVES)
    expect(sim.ended).toBe('')
    expect(sim.hero.gold).toBeGreaterThan(gold7)
    expect(sim.wave.rest).toBeGreaterThan(LADDER_REST - 0.5)
    clearTo(sim, plan, ARENA_WAVES + 4)
    const before13 = sim.hero.gold
    clearTo(sim, plan, ARENA_WAVES + 5)
    expect(sim.hero.gold).toBeGreaterThan(before13)
    expect(sim.wave.cleared).toBe(ARENA_WAVES + 5)
    expect(leaveLadder(sim)).toBe(true)
    expect(sim.ended).toBe('victory')
    expect(sim.endReady).toBe(true)
  })

  it('climbs by level past eight, keeps a wave to a sane size, and sends a champion every third wave', () => {
    const { sim, plan } = arena()
    const sizes = clearTo(sim, plan, 20)
    expect(Math.max(...sizes)).toBeLessThanOrEqual(WAVE_CAP + 1)
    // Wave 21 spawns: enemies six levels above the visit's (13 past eight, one per two).
    step(sim, plan, LADDER_REST + 0.5)
    const foes = sim.units.filter(u => u.alive && u.team === 1)
    expect(foes.length).toBeGreaterThan(0)
    expect(foes.every(u => u.level === sim.level + Math.floor((21 - ARENA_WAVES) / 2))).toBe(true)
  })

  it('Swarm sends more enemies at less health; Elite parade a champion every wave', () => {
    const plain = arena('')
    const swarm = arena('swarm')
    step(plain.sim, plain.plan, 2)
    step(swarm.sim, swarm.plan, 2)
    const a = plain.sim.units.filter(u => u.alive && u.team === 1)
    const b = swarm.sim.units.filter(u => u.alive && u.team === 1)
    expect(b.length).toBeGreaterThan(a.length)
    const base = spawnEnemy(plain.sim, b[0]!.kind, 0, 0)!.s.maxHp
    expect(b[0]!.s.maxHp).toBe(Math.max(1, Math.round(base * SWARM_HP)))
    const elites = arena('elites')
    step(elites.sim, elites.plan, 2)
    expect(elites.sim.units.some(u => u.alive && u.team === 1 && u.rank === 'elite')).toBe(true)
  })

  it('Glass makes every blow harder; All fire turns enemy blows to fire', () => {
    const g = arena('glass')
    const p = arena('')
    const hit = (s: Sim): number => {
      const e = spawnEnemy(s, 'goblin', s.hero.unit.x + 1, s.hero.unit.z)!
      return dealDamage(s, s.hero.unit, e, 10, { type: 'true', canCrit: false })
    }
    expect(hit(g.sim)).toBeCloseTo(hit(p.sim) * GLASS_DAMAGE)
    const f = arena('fire')
    const e = spawnEnemy(f.sim, 'goblin', f.sim.hero.unit.x + 1, f.sim.hero.unit.z)!
    const seen: string[] = []
    const before = f.sim.events.length
    dealDamage(f.sim, e, f.sim.hero.unit, 10, { type: 'physical', canCrit: false })
    for (const ev of f.sim.events.slice(before)) if (ev.t === 'hit') seen.push(ev.type)
    expect(seen).toEqual(['fire'])
  })
})

describe('the best wave in the save', () => {
  type Flow = typeof import('@/game/flow')
  type P = typeof import('@/game/state/profile')
  let f: Flow
  let p: P
  beforeEach(async () => {
    vi.useFakeTimers({ now: new Date(Date.UTC(2026, 9, 7, 12)) })
    drainAndResetModules()
    await holdGameState()
    vi.doMock('@/use/useLeaderboard', () => ({ reportRun: async () => {}, reportLadder: async () => {} }))
    vi.doMock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))
    vi.doMock('@/game/engine/app', () => ({ app: { mode: null, setMode() {}, setWanted() {}, setSuspended() {}, renderOnce() {} } }))
    p = await import('@/game/state/profile')
    f = await import('@/game/flow')
    p.initProfile()
    p.profile.stats.runs = 4
  })
  afterEach(() => { drainPersist(); vi.useRealTimers() })

  const tally = (waves: number) => ({ xp: 10, gold: 10, kills: 3, items: [], seconds: 60, waves })

  it('a fall ends a climb without the gold toll, and still records the waves cleared', async () => {
    p.profile.gold = 1000
    await f.bankVisit('defeat', 'arena', tally(11))
    expect(f.flow.results!.goldLost).toBe(0)
    expect(p.profile.gold).toBe(1010)
    expect(p.profile.world.arenaBest).toBe(11)
    expect(f.flow.results!.arenaNewBest).toBe(true)
    expect(p.arenaWeekBest()).toBe(11)
  })

  it('a lower climb is no new best; a new week starts its own best', async () => {
    await f.bankVisit('victory', 'arena', tally(12))
    await f.bankVisit('defeat', 'arena', tally(9))
    expect(f.flow.results!.arenaNewBest).toBe(false)
    expect(p.profile.world.arenaBest).toBe(12)
    vi.setSystemTime(new Date(Date.UTC(2026, 9, 13, 12)))
    expect(p.arenaWeekBest()).toBe(0)
    await f.bankVisit('defeat', 'arena', tally(5))
    expect(p.arenaWeekBest()).toBe(5)
    expect(p.profile.world.arenaBest).toBe(12)
  })
})
