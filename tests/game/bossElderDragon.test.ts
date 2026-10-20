import { describe, expect, it } from 'vitest'
import { Sim, outOfReach } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { cellIndex, raiseWall } from '@/game/sim/actors'
import { dealDamage } from '@/game/sim/combat'
import { CELL } from '@/game/sim/grid'
import { startAttrs } from '@/game/data/attributes'
import { laneLength } from '@/game/sim/bosses/kit'
import { ELDER_DRAGON_TUNING, elderDragonOf } from '@/game/sim/bosses/elderDragon'
import type { SimEvent, Unit } from '@/game/sim/types'

/**
 * The Elder Dragon (afterplay §5.7, the final fight): breath, tail and gust on
 * the ground, each warned; at 70 % it flies out of reach and breathes down
 * lanes a rune stone takes in the hero's stead (two breaths break one); at
 * 40 % the void ring; at 15 % the rift holds it 30 s — not dead by then, it
 * heals to 30 % and the third phase goes on.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 60, difficulty: 1, mode: 'zone', zone: 'rift' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 60, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
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
const dragon = (sim: Sim, ready: string[] = [], dist = 7): Unit => {
  const h = sim.hero.unit
  let ax = 0
  let az = -1
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2
    if (laneLength(sim, h.x, h.z, Math.sin(a), Math.cos(a), dist + 8) >= dist + 7) { ax = Math.sin(a); az = Math.cos(a); break }
  }
  const u = spawnEnemy(sim, 'elderDragon', h.x + ax * dist, h.z + az * dist)!
  u.awake = true
  u.targetId = h.id
  u.homeX = u.x
  u.homeZ = u.z
  for (let i = 0; i < u.cds.length; i++) u.cds[i] = 99
  for (const k of ['tail', 'gust', 'breath']) u.boss!.cd[k] = ready.includes(k) ? 0 : 99
  return u
}

describe('the Elder Dragon (afterplay §5.7)', () => {
  it('its breath shows its cone before the fire comes', () => {
    const sim = arena()
    const h = sim.hero.unit
    const u = dragon(sim, ['breath'], 6)
    const seen: SimEvent[] = []
    const hp = h.hp
    let teleAt = -1
    let hitAt = -1
    for (let i = 0; i < 120 && hitAt < 0; i++) {
      step(sim, 1 / 30, undefined, seen)
      if (teleAt < 0 && seen.some(e => e.t === 'tele' && e.tele.src === u.id && e.tele.shape === 'cone')) teleAt = sim.time
      if (h.hp < hp) hitAt = sim.time
    }
    expect(teleAt).toBeGreaterThan(0)
    expect(hitAt - teleAt).toBeGreaterThanOrEqual(ELDER_DRAGON_TUNING.BREATH_WARN - 0.05)
  })

  it('the wing gust throws the hero back, after its circle shows', () => {
    const sim = arena()
    const h = sim.hero.unit
    const u = dragon(sim, ['gust'], 3)
    const seen: SimEvent[] = []
    step(sim, 3, () => Math.hypot(h.x - u.x, h.z - u.z) > 5.5, seen)
    expect(seen.some(e => e.t === 'tele' && e.tele.src === u.id && e.tele.shape === 'circle')).toBe(true)
    expect(Math.hypot(h.x - u.x, h.z - u.z)).toBeGreaterThan(5.5)
  })

  it('at 70 % it flies out of reach, three rune stones rise, and a stone in the lane takes the breath', () => {
    const sim = arena()
    const h = sim.hero.unit
    const u = dragon(sim, [], 7)
    const seen: SimEvent[] = []
    u.hp = u.s.maxHp * 0.69
    step(sim, 3, () => u.boss!.sub === 'hover', seen)
    expect(u.boss!.phase).toBe(2)
    expect(outOfReach(u)).toBe(true)
    expect(sim.walls.filter(w => w.fx === 'rune').length).toBe(ELDER_DRAGON_TUNING.RUNES)
    expect(seen.some(e => e.t === 'bark' && e.key === 'dlg.bark.elderDragon.flight.1')).toBe(true)
    // A rune stone of the test's own between the dragon and the hero.
    const a = Math.atan2(h.x - u.x, h.z - u.z)
    const c = cellIndex(sim, u.x + Math.sin(a) * 4, u.z + Math.cos(a) * 4)
    raiseWall(sim, [c], 1e6, 'rune')
    const cx = ((c % sim.grid.w) + 0.5) * CELL
    const cz = (Math.floor(c / sim.grid.w) + 0.5) * CELL
    h.x = cx + Math.sin(a) * 2
    h.z = cz + Math.cos(a) * 2
    const standing = (): boolean => sim.walls.some(w => w.fx === 'rune' && w.cells[0] === c && w.t < w.dur)
    // Two breaths down the lane: the stone takes both, and breaks.
    for (let i = 0; i < 30 * 12 && standing(); i++) {
      h.kx = h.kz = 0
      h.x = cx + Math.sin(Math.atan2(cx - u.x, cz - u.z)) * 2
      h.z = cz + Math.cos(Math.atan2(cx - u.x, cz - u.z)) * 2
      step(sim, 1 / 30)
    }
    step(sim, 0.1)
    expect(standing()).toBe(false)
  })

  it('at 40 % the void ring closes round the fight', () => {
    const sim = arena()
    const u = dragon(sim)
    u.hp = u.s.maxHp * 0.39
    u.boss!.phase = 2
    u.boss!.cd.fly = 99
    step(sim, 2, () => u.boss!.phase === 3)
    expect(u.boss!.phase).toBe(3)
    expect(elderDragonOf(u)!.ring).toBe(true)
  })

  it('at 15 % the rift holds it 30 s; not dead by then, it heals to 30 % and the third phase goes on — and again at 15 %', () => {
    const sim = arena()
    const u = dragon(sim)
    const seen: SimEvent[] = []
    u.hp = u.s.maxHp * 0.14
    u.boss!.phase = 3
    step(sim, 1, () => u.boss!.phase === 4, seen)
    expect(u.boss!.phase).toBe(4)
    expect(elderDragonOf(u)!.pull).toBeGreaterThan(ELDER_DRAGON_TUNING.PULL - 1)
    expect(seen.some(e => e.t === 'bark' && e.key === 'dlg.bark.elderDragon.rift.1')).toBe(true)
    // Void shards fall round the hero, each shown first.
    const later: SimEvent[] = []
    step(sim, ELDER_DRAGON_TUNING.PULL + 0.5, () => u.boss!.phase === 3, later)
    expect(later.filter(e => e.t === 'tele' && e.tele.src === u.id && e.tele.shape === 'circle').length).toBeGreaterThan(10)
    expect(u.boss!.phase).toBe(3)
    expect(u.hp).toBeCloseTo(u.s.maxHp * ELDER_DRAGON_TUNING.HEAL_TO, 0)
    expect(elderDragonOf(u)!.heals).toBe(1)
    // Down to 15 % once more: the pull again.
    u.hp = u.s.maxHp * 0.14
    step(sim, 2, () => u.boss!.phase === 4)
    expect(u.boss!.phase).toBe(4)
  })

  it('killed while the rift holds it, it says its last words', () => {
    const sim = arena()
    const u = dragon(sim)
    u.hp = u.s.maxHp * 0.14
    u.boss!.phase = 3
    step(sim, 1, () => u.boss!.phase === 4)
    sim.events.length = 0
    dealDamage(sim, sim.hero.unit, u, 1e9, { type: 'true', canCrit: false })
    expect(u.alive).toBe(false)
    expect(sim.events.some(e => e.t === 'bark' && e.key === 'dlg.bark.elderDragon.death.1')).toBe(true)
  })
})
