import { describe, expect, it } from 'vitest'
import { Box3, Vector3 } from 'three'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { INVASION, STAND_INS, invadedZone, resolveKind } from '@/game/data/invasion'
import { BOSS_BARKS } from '@/game/data/dialogs/bosses'
import { BOSS_SCRIPTS } from '@/game/sim/bosses'
import { ARENA_PROPS } from '@/game/sim/bosses/kit'
import { CELL, findPath, isSolidAt } from '@/game/sim/grid'
import { botThink, setupRun } from '@/game/sim/bot'
import { stepSim } from '@/game/sim/step'
import { wallParts } from '@/game/gfx/terrain'
import { merge } from '@/game/gfx/kit'
import { BODY_H } from '@/game/gfx/propRoles'
import { findFights, trisOf } from './zfightTools'
import type { ZoneId } from '@/game/data/items'

/**
 * The Breaking's first three bosses (afterplay §5.1-5.3, phase 5): each is in
 * the bestiary on its own script, holds its invaded zone's finale (no stand-in
 * any more), stands its arena's props on open ground without shutting a way,
 * and the reference player clears its zone.
 */

const BOSSES: Array<{ zone: ZoneId; boss: string; script: string; prop: string; n: number }> = [
  { zone: 'woods', boss: 'chimera', script: 'chimera', prop: 'pillar', n: 2 },
  { zone: 'outskirts', boss: 'centaurWarchief', script: 'centaur', prop: 'wagon', n: 3 },
  { zone: 'mines', boss: 'cyclops', script: 'cyclops', prop: 'beam', n: 4 }
]

describe('the phase 5 bosses (data)', () => {
  it('each is a boss on its script, with its barks, and its invaded zone\'s finale resolves to it', () => {
    for (const { zone, boss, script } of BOSSES) {
      const def = ENEMY_BY_ID[boss]
      expect(def?.rank, boss).toBe('boss')
      expect(def?.script, boss).toBe(script)
      expect(BOSS_SCRIPTS[script], script).toBeDefined()
      // Three phases: 100-60, 60-30, 30-0.
      expect(BOSS_SCRIPTS[script]!.phases).toEqual([0.6, 0.3])
      expect(INVASION[zone].boss).toBe(boss)
      expect(resolveKind(boss)).toBe(boss)
      expect(invadedZone(zone).finale.leader, zone).toBe(boss)
      // Intro, two phases and its fall.
      const b = BOSS_BARKS.find(c => c.id === `bark.${boss}`)
      expect(b?.greet.map(g => g.id), boss).toEqual(expect.arrayContaining(['intro', 'death']))
      expect(b!.greet.length).toBe(4)
      // The stand-in stays only as the seam's record.
      expect(STAND_INS[boss]).toBeDefined()
    }
  })
})

describe('the phase 5 arenas', () => {
  for (const { zone, boss, prop, n } of BOSSES) {
    it(`${zone}: the ${boss}'s ${n} ${prop}s stand on open ground, and the finale's chest is still reached`, () => {
      for (const seed of [1, 7, 1234]) {
        const { sim, plan } = setupRun({ zone, level: INVASION[zone].max, cls: 'aegis', geared: true, invaded: true, seed })
        stepSim(sim, plan, 1 / 30)
        const walls = sim.walls.filter(w => w.fx === prop)
        expect(walls.length, `${zone}#${seed}`).toBe(n)
        const b = sim.units.find(u => u.kind === boss)!
        expect(b).toBeDefined()
        for (const w of walls) {
          expect(w.cells.length).toBe(1)
          const k = w.cells[0]!
          const x = ((k % sim.grid.w) + 0.5) * CELL
          const z = (Math.floor(k / sim.grid.w) + 0.5) * CELL
          // Near the boss's home, never on a chest or where one is opened.
          expect(Math.hypot(x - b.homeX, z - b.homeZ)).toBeLessThan(9)
          for (const c of sim.chests) expect(Math.hypot(c.sx - x, c.sz - z), `${zone}#${seed} chest`).toBeGreaterThan(1)
        }
        // With the props up, the finale's chest (and the boss) are still walked to.
        const path: number[] = []
        const fin = sim.chests.find(c => c.role === 'finale')!
        expect(findPath(sim.grid, plan.start.x, plan.start.z, fin.sx, fin.sz, path, 8000), `${zone}#${seed} chest`).toBeGreaterThan(0)
        expect(isSolidAt(sim.grid, b.x, b.z)).toBe(false)
      }
    })
  }

  it('every prop is drawn inside its one cell below body height, with no coplanar faces', () => {
    const parts = wallParts()
    const box = new Box3()
    const v = new Vector3()
    for (const fx of ARENA_PROPS) {
      const geos = parts[fx]
      expect(geos, fx).toBeDefined()
      const g = merge(geos!)
      const pos = g.attributes.position!
      box.makeEmpty()
      let reach = 0
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i)
        box.expandByPoint(v)
        if (v.y < BODY_H) reach = Math.max(reach, Math.abs(v.x), Math.abs(v.z))
      }
      // Whatever its turn in the cell, it keeps inside it (the corner's reach).
      expect(reach * Math.SQRT2, fx).toBeLessThanOrEqual(CELL / 2 + 0.3)
      expect(box.min.y, fx).toBeGreaterThanOrEqual(-0.05)
      expect(findFights(trisOf(g, null, fx, [], 'cel'), 0.003), fx).toEqual([])
    }
  })
})

describe('the phase 5 zones (the reference player)', () => {
  // Three classes of three styles (a knight, a caster, a bruiser). The geared
  // Shadow at the band's top bursts any afterplay boss down in seconds, the
  // Reborn ones too (outstanding-decisions.md): a balance matter of its own.
  for (const { zone, boss } of BOSSES) for (const cls of ['aegis', 'pyro', 'blood'] as const) {
    it(`${zone}: a geared ${cls} of the band clears its invaded self, boss and all three of its phases, in about a minute`, () => {
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
      console.log(`[phase 5 bot] ${zone} ${cls} lvl ${level}: ${sim.ended || 'timeout'} in ${Math.round(sim.time)} s, the boss fight ${Math.round(fight)} s, hp ${Math.round((100 * sim.hero.unit.hp) / sim.hero.unit.s.maxHp)} %`)
      expect(sim.ended).toBe('victory')
      expect(b.alive).toBe(false)
      expect(phase).toBe(3)
      // D82: about a minute to a minute and a half from its waking.
      expect(fight).toBeGreaterThan(20)
      expect(fight).toBeLessThan(120)
    }, 180_000)
  }
})
