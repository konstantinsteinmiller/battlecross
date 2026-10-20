import { describe, expect, it } from 'vitest'
import { Sim, hasStatus } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { cellIndex, raiseWall } from '@/game/sim/actors'
import { isSolidAt } from '@/game/sim/grid'
import { startAttrs } from '@/game/data/attributes'
import { laneLength } from '@/game/sim/bosses/kit'
import { CENTAUR_TUNING } from '@/game/sim/bosses/centaur'
import type { SimEvent, Unit } from '@/game/sim/types'

/**
 * The Centaur Warchief (afterplay §5.2): it keeps its distance and shoots,
 * and tramples whoever closes in (so staying close costs); at 60 % raiders
 * and spears; at 30 % it rears before each charge, and a charge into a hay
 * wagon smashes it and stuns the Warchief 4 s.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 40, difficulty: 1, mode: 'zone', zone: 'outskirts' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 40, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
  })
  sim.hero.unit.s.maxHp = sim.hero.unit.hp = 1e7
  return sim
}
const step = (sim: Sim, seconds: number, until?: () => boolean, seen?: SimEvent[]): void => {
  for (let t = 0; t < seconds; t += 1 / 30) {
    stepSim(sim, plan, 1 / 30)
    if (seen) seen.push(...sim.events)
    sim.events.length = 0
    if (until?.()) return
  }
}
/** The Warchief `dist` m off along a long open lane, awake; `ready` names the script's moves that may go, `bow` lets its arrows fly. */
const warchief = (sim: Sim, ready: string[] = [], dist = 8, bow = false): Unit => {
  const h = sim.hero.unit
  let ax = 0
  let az = -1
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2
    if (laneLength(sim, h.x, h.z, Math.sin(a), Math.cos(a), dist + 8) >= dist + 7) { ax = Math.sin(a); az = Math.cos(a); break }
  }
  const c = spawnEnemy(sim, 'centaurWarchief', h.x + ax * dist, h.z + az * dist)!
  c.awake = true
  c.targetId = h.id
  c.homeX = c.x
  c.homeZ = c.z
  c.boss!.marks.push('arena')
  if (!bow) for (let i = 0; i < c.cds.length; i++) c.cds[i] = 99
  for (const k of ['charge', 'spears']) c.boss!.cd[k] = ready.includes(k) ? 0 : 99
  return c
}

describe('the Centaur Warchief (afterplay §5.2)', () => {
  it('close in on it and it tramples: the lane shows a full second before it runs', () => {
    const sim = arena()
    const h = sim.hero.unit
    const c = warchief(sim, ['charge'], 3)
    const hp = h.hp
    let teleAt = -1
    let hitAt = -1
    const seen: SimEvent[] = []
    for (let i = 0; i < 120 && hitAt < 0; i++) {
      step(sim, 1 / 30, undefined, seen)
      if (teleAt < 0 && seen.some(e => e.t === 'tele' && e.tele.src === c.id && e.tele.shape === 'line')) teleAt = sim.time
      if (h.hp < hp) hitAt = sim.time
    }
    expect(teleAt).toBeGreaterThan(0)
    expect(hitAt - teleAt).toBeGreaterThanOrEqual(CENTAUR_TUNING.WARN - 0.05)
  })

  it('kiting pays: a hero who stays in its face takes far more than one who keeps his range', () => {
    const taken = (dist: number): number => {
      const sim = arena()
      const h = sim.hero.unit
      const c = warchief(sim, ['charge'], dist, true)
      const hp = h.hp
      // The hero holds his spot (and is put back on it after every blow).
      const hx = h.x
      const hz = h.z
      for (let i = 0; i < 30 * 14; i++) {
        step(sim, 1 / 30)
        h.x = hx
        h.z = hz
        // The Warchief stays where the test put it, unless it is running.
        if (c.boss!.mode !== 'charge' && !c.action) { c.x = c.homeX; c.z = c.homeZ }
      }
      return hp - h.hp
    }
    const close = taken(3)
    const far = taken(10)
    expect(far).toBeGreaterThan(0)
    expect(close).toBeGreaterThan(far * 1.3)
  })

  it('at 60 % two raiders ride in, and spears fly down three lanes after their warning', () => {
    const sim = arena()
    const h = sim.hero.unit
    const c = warchief(sim, [], 8)
    c.hp = c.s.maxHp * 0.59
    step(sim, 2, () => c.boss!.phase === 2 && !c.action)
    expect(c.boss!.phase).toBe(2)
    expect(sim.units.filter(u => u.alive && u.kind === 'centaurRaider').length).toBe(2)
    for (const u of sim.units) if (u.kind === 'centaurRaider') { u.alive = false; u.hp = 0 }
    c.boss!.cd.spears = 0
    c.boss!.next = 0
    const seen: SimEvent[] = []
    const hp = h.hp
    step(sim, 1, () => c.action?.id === 'spears', seen)
    expect(c.action?.id).toBe('spears')
    expect(seen.filter(e => e.t === 'tele' && e.tele.src === c.id && e.tele.shape === 'line').length).toBe(3)
    // Nothing has struck yet (a little health regained at most).
    expect(h.hp).toBeGreaterThanOrEqual(hp)
    step(sim, 1.2)
    expect(h.hp).toBeLessThan(hp)
  })

  it('at 30 % it rears up before each charge; into a hay wagon it smashes it and stands stunned 4 s', () => {
    const sim = arena()
    const h = sim.hero.unit
    const c = warchief(sim, [], 10)
    c.hp = c.s.maxHp * 0.29
    step(sim, 3, () => c.boss!.phase === 3 && !c.action)
    expect(c.boss!.phase).toBe(3)
    c.boss!.cd.charge = 0
    c.boss!.next = 0
    const seen: SimEvent[] = []
    step(sim, 1, () => c.action?.id === 'charge', seen)
    expect(c.action?.id).toBe('charge')
    // The rear: a roar, and a longer wind-up than the trample's.
    expect(seen.some(e => e.t === 'fx' && e.id === 'roar')).toBe(true)
    expect(c.action!.hitAt).toBeGreaterThanOrEqual(CENTAUR_TUNING.REAR - 0.01)
    // The hero has put a hay wagon between them, and steps out of its lane.
    const a = c.action!.a
    const wx = c.x + Math.sin(a) * 5
    const wz = c.z + Math.cos(a) * 5
    raiseWall(sim, [cellIndex(sim, wx, wz)], 1e6, 'wagon')
    h.x += Math.cos(a) * 4
    h.z -= Math.sin(a) * 4
    step(sim, 3, () => c.boss!.mode === 'dazed')
    expect(c.boss!.mode).toBe('dazed')
    step(sim, 0.2)
    // Smashed to straw.
    expect(isSolidAt(sim.grid, wx, wz)).toBe(false)
    step(sim, CENTAUR_TUNING.WAGON_STUN - 0.6)
    expect(hasStatus(c, 'stun')).toBe(true)
  })

  it('a charge into plain rock does not stun it: only the wagons do', () => {
    const sim = arena()
    const h = sim.hero.unit
    const c = warchief(sim, ['charge'], 3)
    step(sim, 1, () => c.action?.id === 'charge')
    const a = c.action!.a
    h.x += Math.cos(a) * 4
    h.z -= Math.sin(a) * 4
    let dazed = false
    for (let i = 0; i < 90; i++) { step(sim, 1 / 30); if (c.boss!.mode === 'dazed') dazed = true }
    expect(dazed).toBe(false)
  })

  it('raises three hay wagons on its field', () => {
    const sim = arena()
    const h = sim.hero.unit
    spawnEnemy(sim, 'centaurWarchief', h.x, h.z - 8)
    step(sim, 0.2)
    expect(sim.walls.filter(w => w.fx === 'wagon').length).toBe(3)
  })
})
