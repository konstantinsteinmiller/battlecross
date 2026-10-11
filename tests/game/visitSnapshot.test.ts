import { describe, expect, it } from 'vitest'
import { botThink, setupRun, type RunOpts } from '@/game/sim/bot'
import { stepSim } from '@/game/sim/step'
import { rngState } from '@/game/sim/rng'
import { captureBaseline, restoreSim, snapshotSim } from '@/game/sim/snapshot'
import type { Sim } from '@/game/sim/world'
import type { ZonePlan } from '@/game/sim/zoneGen'

/**
 * A manual save slot keeps a zone visit mid-fight (`sim/snapshot.ts`): the
 * hero's spot, the enemies left and where they stand, the chests, the herbs,
 * the dice. Loading regenerates the same visit and lays the snapshot over it.
 * These play real visits with the reference player, save in the middle, put
 * the save onto a FRESH copy of the visit, and require the two to be the same
 * world — and to stay the same world as both play on.
 */

const DT = 1 / 30

const quiet = (sim: Sim): boolean =>
  sim.core().timers === 0 && !sim.projectiles.some(p => p.active) && !sim.fields.some(f => f.active) &&
  sim.walls.length === 0 && sim.dangers.length === 0

/** Play with the reference player until `until`, then on to a quiet moment
 *  (nothing in flight: what a save made from the pause menu sees). */
const play = (sim: Sim, plan: ZonePlan, until: () => boolean, maxSeconds = 240): void => {
  let think = 0
  const step = (): void => {
    think -= DT
    if (think <= 0) { think = 0.2; botThink(sim, true) }
    stepSim(sim, plan, DT)
    sim.events.length = 0
  }
  while (!until() && sim.time < maxSeconds && !sim.ended) step()
  for (let i = 0; i < 30 * 20 && !quiet(sim); i++) step()
}

/** Step both worlds with the same player and no thinking in between. */
const playOn = (sim: Sim, plan: ZonePlan, seconds: number): void => {
  let think = 0
  for (let t = 0; t < seconds; t += DT) {
    think -= DT
    if (think <= 0) { think = 0.2; botThink(sim, true) }
    stepSim(sim, plan, DT)
    sim.events.length = 0
  }
}

/** The world as data: everything a save must bring back. */
const world = (sim: Sim): string => JSON.stringify({
  time: sim.time,
  dice: rngState(sim.rng),
  units: sim.units,
  hero: { ...sim.hero, unit: sim.hero.unit.id },
  groups: sim.groups, sideGroups: sim.sideGroups, groupsDone: sim.groupsDone,
  chests: sim.chests, herbs: sim.herbs, pieces: sim.pieces, doors: sim.doors, plates: sim.plates, puzzle: sim.puzzle,
  caravan: sim.caravan, wave: sim.wave, owned: [...sim.owned], ended: sim.ended
})

const CASES: Array<{ name: string; o: RunOpts }> = [
  { name: 'the plains', o: { zone: 'plains', level: 2, cls: 'aegis', seed: 11 } },
  { name: 'the woods', o: { zone: 'woods', level: 6, cls: 'aegis', seed: 42 } },
  { name: 'the hollows', o: { zone: 'hollows', level: 5, cls: 'aegis', seed: 7 } }
]

describe('a zone saved mid-fight is the same zone when loaded', () => {
  for (const c of CASES) {
    it(`${c.name}: kills, chests and positions survive, and play continues identically`, () => {
      const a = setupRun(c.o)
      const baseA = captureBaseline(a.sim)
      play(a.sim, a.plan, () => a.sim.hero.kills >= 4)
      expect(a.sim.hero.kills, 'the visit got going').toBeGreaterThanOrEqual(1)
      const snap = snapshotSim(a.sim, baseA)
      // The save really holds the fight: enemies dead (gone or lying there), the hero moved.
      const dead = snap.removed.length + snap.changed.filter(d => d.d.alive === false).length
      expect(dead).toBe(a.sim.hero.kills)
      expect(snap.changed.some(d => d.id === a.sim.hero.unit.id && 'x' in d.d)).toBe(true)
      expect(a.sim.time).toBeGreaterThan(5)
      // A save round-trips through JSON (the save blob, the cloud).
      const stored = JSON.parse(JSON.stringify(snap))

      const b = setupRun(c.o)
      const baseB = captureBaseline(b.sim)
      expect(world(b.sim)).not.toBe(world(a.sim))
      expect(restoreSim(b.sim, baseB, stored)).toBe(true)
      expect(world(b.sim)).toBe(world(a.sim))
      expect(b.sim.hero.unit).toBe(b.sim.get(b.sim.hero.unit.id))

      playOn(a.sim, a.plan, 12)
      playOn(b.sim, b.plan, 12)
      expect(world(b.sim)).toBe(world(a.sim))
    })
  }

  it('is small: what changed, not the world', () => {
    const a = setupRun(CASES[1]!.o)
    const base = captureBaseline(a.sim)
    play(a.sim, a.plan, () => a.sim.hero.kills >= 4)
    const bytes = JSON.stringify(snapshotSim(a.sim, base)).length
    expect(bytes).toBeLessThan(40_000)
  })

  it('a save of another visit is refused, and nothing is changed', () => {
    const a = setupRun(CASES[0]!.o)
    const snap = snapshotSim(a.sim, captureBaseline(a.sim))
    const other = setupRun({ ...CASES[0]!.o, seed: 12 })
    const before = world(other.sim)
    expect(restoreSim(other.sim, captureBaseline(other.sim), snap)).toBe(false)
    expect(world(other.sim)).toBe(before)
  })
})
