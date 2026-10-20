import { describe, expect, it } from 'vitest'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { INVASION, STAND_INS, invadedZone, resolveKind } from '@/game/data/invasion'
import { BOSS_BARKS, DEATH_BARKS } from '@/game/data/dialogs/bosses'
import { BOSS_SCRIPTS } from '@/game/sim/bosses'
import { CELL, findPath, isSolidAt } from '@/game/sim/grid'
import { botThink, setupRun } from '@/game/sim/bot'
import { stepSim } from '@/game/sim/step'
import type { ZoneId } from '@/game/data/items'

/**
 * The Breaking's last four bosses (afterplay §5.4-5.7, phase 7): each is in
 * the bestiary on its own script, holds its invaded zone's finale (no stand-in
 * any more), stands its arena's props on open ground without shutting a way,
 * and the reference player clears its zone, puzzle and all.
 */

const BOSSES: Array<{ zone: ZoneId; boss: string; script: string; phases: number[]; prop: string; n: number }> = [
  { zone: 'temple', boss: 'sphinx', script: 'sphinx', phases: [0.6, 0.3], prop: '', n: 0 },
  { zone: 'citadel', boss: 'leviathan', script: 'leviathan', phases: [0.6, 0.3], prop: 'isle', n: 6 },
  { zone: 'fortress', boss: 'hydra', script: 'hydra', phases: [0.6, 0.3], prop: 'brazier', n: 4 },
  // Four phases: the rift's pull is the last (100-70 / 70-40 / 40-15 / 15-0).
  { zone: 'rift', boss: 'elderDragon', script: 'elderDragon', phases: [0.7, 0.4, 0.15], prop: '', n: 0 }
]

describe('the phase 7 bosses (data)', () => {
  it('each is a boss on its script, with its barks, and its invaded zone\'s finale resolves to it', () => {
    for (const { zone, boss, script, phases } of BOSSES) {
      const def = ENEMY_BY_ID[boss]
      expect(def?.rank, boss).toBe('boss')
      expect(def?.script, boss).toBe(script)
      expect(BOSS_SCRIPTS[script]!.phases, script).toEqual(phases)
      expect(INVASION[zone].boss).toBe(boss)
      expect(resolveKind(boss)).toBe(boss)
      expect(invadedZone(zone).finale.leader, zone).toBe(boss)
      const b = BOSS_BARKS.find(c => c.id === `bark.${boss}`)
      expect(b?.greet.map(g => g.id), boss).toEqual(expect.arrayContaining(['intro', 'death']))
      expect(b!.greet.length).toBe(4)
      expect(DEATH_BARKS[boss]).toBe(boss)
      expect(STAND_INS[boss]).toBeDefined()
    }
  })
})

describe('the phase 7 arenas', () => {
  for (const { zone, boss, prop, n } of BOSSES.filter(b => b.n > 0)) {
    it(`${zone}: the ${boss}'s ${n} ${prop}s stand on open ground, and the finale's chest is still reached`, () => {
      for (const seed of [1, 7, 1234]) {
        const { sim, plan } = setupRun({ zone, level: INVASION[zone].max, cls: 'aegis', geared: true, invaded: true, seed })
        stepSim(sim, plan, 1 / 30)
        const walls = sim.walls.filter(w => w.fx === prop)
        expect(walls.length, `${zone}#${seed}`).toBe(n)
        const b = sim.units.find(u => u.kind === boss)!
        for (const w of walls) {
          expect(w.cells.length).toBe(1)
          const k = w.cells[0]!
          const x = ((k % sim.grid.w) + 0.5) * CELL
          const z = (Math.floor(k / sim.grid.w) + 0.5) * CELL
          expect(Math.hypot(x - b.homeX, z - b.homeZ)).toBeLessThan(9.5)
          for (const c of sim.chests) expect(Math.hypot(c.sx - x, c.sz - z), `${zone}#${seed} chest`).toBeGreaterThan(1)
        }
        const path: number[] = []
        const fin = sim.chests.find(c => c.role === 'finale')!
        expect(findPath(sim.grid, plan.start.x, plan.start.z, fin.sx, fin.sz, path, 8000), `${zone}#${seed} chest`).toBeGreaterThan(0)
        expect(isSolidAt(sim.grid, b.x, b.z)).toBe(false)
      }
    })
  }
})

describe('the phase 7 zones (the reference player)', () => {
  for (const { zone, boss, phases } of BOSSES) for (const cls of ['aegis', 'pyro', 'blood'] as const) {
    it(`${zone}: a geared ${cls} of the band clears its invaded self, the ${boss} and every phase, in 20-120 s`, () => {
      const level = INVASION[zone].max
      const { sim, plan } = setupRun({ zone, level, cls, geared: true, invaded: true, seed: 7, potions: 5 })
      const b = sim.units.find(u => u.kind === boss)!
      let think = 0
      let woke = -1
      let phase = 1
      while (!sim.ended && sim.time < 900) {
        think -= 1 / 30
        if (think <= 0) { think = 0.2; botThink(sim) }
        stepSim(sim, plan, 1 / 30)
        sim.events.length = 0
        if (woke < 0 && b.awake) woke = sim.time
        phase = Math.max(phase, b.boss!.phase)
      }
      const fight = woke >= 0 ? sim.time - woke : 0
      // eslint-disable-next-line no-console
      console.log(`[phase 7 bot] ${zone} ${cls} lvl ${level}: ${sim.ended || 'timeout'} in ${Math.round(sim.time)} s, the boss fight ${Math.round(fight)} s, hp ${Math.round((100 * sim.hero.unit.hp) / sim.hero.unit.s.maxHp)} %`)
      expect(sim.ended).toBe('victory')
      expect(b.alive).toBe(false)
      expect(phase).toBe(phases.length + 1)
      expect(fight).toBeGreaterThan(20)
      expect(fight).toBeLessThan(120)
    }, 240_000)
  }
})
