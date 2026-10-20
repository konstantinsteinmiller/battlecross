import { describe, expect, it } from 'vitest'
import { Sim, hasStatus } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { cellIndex, raiseWall } from '@/game/sim/actors'
import { dealDamage } from '@/game/sim/combat'
import { CELL, isSolidAt } from '@/game/sim/grid'
import { startAttrs } from '@/game/data/attributes'
import { LEVIATHAN_TUNING, inLee, leviathanOf } from '@/game/sim/bosses/leviathan'
import type { SimEvent, Unit } from '@/game/sim/types'

/**
 * The Leviathan (afterplay §5.5): a flooded hall that slows the hero; it is
 * only hit while it is up, and it comes up where bubbles show first; a tidal
 * wave crosses the hall, broken in an island's lee; islands sink from 60 %;
 * from 30 % it grabs, and sea-demons come up.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 52, difficulty: 1, mode: 'zone', zone: 'citadel' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 52, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
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
/** The Leviathan in its hall round the hero, awake. */
const leviathan = (sim: Sim): Unit => {
  const h = sim.hero.unit
  const u = spawnEnemy(sim, 'leviathan', h.x, h.z - 6)!
  step(sim, 1 / 30)
  u.awake = true
  u.targetId = h.id
  return u
}

describe('the Leviathan (afterplay §5.5)', () => {
  it('six islands stand in its flooded hall; the water slows the hero and does no harm', () => {
    const sim = arena()
    const u = leviathan(sim)
    expect(sim.walls.filter(w => w.fx === 'isle').length).toBe(LEVIATHAN_TUNING.ISLES)
    const h = sim.hero.unit
    const hp = h.hp
    h.x = u.homeX + 2
    h.z = u.homeZ
    step(sim, 0.3)
    expect(hasStatus(h, 'slow')).toBe(true)
    // (it may bite: only the water is measured here)
    expect(h.hp).toBe(hp)
  })

  it('under the water it takes nothing; the bubbles show where it rises before the bite', () => {
    const sim = arena()
    const u = leviathan(sim)
    expect(leviathanOf(u)!.up).toBe(false)
    const hp = u.hp
    dealDamage(sim, sim.hero.unit, u, 1000, { type: 'true', canCrit: false })
    expect(u.hp).toBe(hp)
    const seen: SimEvent[] = []
    step(sim, 6, () => leviathanOf(u)!.rising, seen)
    expect(leviathanOf(u)!.rising).toBe(true)
    const teleAt = sim.time
    step(sim, 3, () => leviathanOf(u)!.up)
    expect(leviathanOf(u)!.up).toBe(true)
    expect(sim.time - teleAt).toBeGreaterThanOrEqual(LEVIATHAN_TUNING.BUBBLES - 0.1)
    expect(seen.some(e => e.t === 'tele' && e.tele.src === u.id && e.tele.shape === 'circle')).toBe(true)
    // Up, it is hit.
    dealDamage(sim, sim.hero.unit, u, 1000, { type: 'true', canCrit: false })
    expect(u.hp).toBeLessThan(hp)
  })

  it('the tidal wave: two lanes show it first; it breaks in an island\'s lee, and hits in the open', () => {
    const sim = arena()
    const u = leviathan(sim)
    // An island in the lee test's way, and the rule read straight.
    const c = cellIndex(sim, u.homeX + 4, u.homeZ)
    raiseWall(sim, [c], 1e6, 'isle')
    const ix = ((c % sim.grid.w) + 0.5) * CELL
    const iz = (Math.floor(c / sim.grid.w) + 0.5) * CELL
    // A wave heading +x: behind the island (further along +x) is the lee.
    expect(inLee(sim, ix + CELL * 0.5 + 0.8, iz, 1, 0)).toBe(true)
    expect(inLee(sim, ix - CELL * 0.5 - 0.8, iz, 1, 0)).toBe(false)
    // A wave in earnest: warned, then it runs and knocks down a hero in the open.
    const seen: SimEvent[] = []
    step(sim, 20, () => !!leviathanOf(u)!.wave, seen)
    const w = leviathanOf(u)!.wave!
    expect(w).toBeTruthy()
    expect(seen.filter(e => e.t === 'tele' && e.tele.shape === 'line' && e.tele.src === u.id).length).toBe(2)
    const h = sim.hero.unit
    // In the open, off the gap, not in any lee, at the hall's middle.
    const px = w.dz
    const pz = -w.dx
    let placed = false
    for (const off of [w.gap + 5, w.gap - 5, w.gap + 7, w.gap - 7]) {
      const x = u.homeX + px * off
      const z = u.homeZ + pz * off
      const ax = (x - w.x) * px + (z - w.z) * pz
      if (Math.abs(ax) > 13 || isSolidAt(sim.grid, x, z) || inLee(sim, x, z, w.dx, w.dz)) continue
      h.x = x - px * (ax - off)
      h.z = z - pz * (ax - off)
      if (isSolidAt(sim.grid, h.x, h.z) || inLee(sim, h.x, h.z, w.dx, w.dz)) continue
      placed = true
      break
    }
    expect(placed).toBe(true)
    const hp = h.hp
    let hit = false
    for (let i = 0; i < 200 && !hit; i++) {
      h.kx = h.kz = 0
      step(sim, 1 / 30)
      hit = h.hp < hp && hasStatus(h, 'knockdown')
    }
    expect(hit).toBe(true)
  })

  it('from 60 % an island sinks after its warning, and comes back 15 s later', () => {
    const sim = arena()
    const u = leviathan(sim)
    u.hp = u.s.maxHp * 0.59
    u.boss!.phase = 2
    const n = sim.walls.filter(w => w.fx === 'isle' && w.t < w.dur).length
    step(sim, 12, () => leviathanOf(u)!.sunk.length > 0)
    expect(leviathanOf(u)!.sunk.length).toBe(1)
    step(sim, 0.2)
    expect(sim.walls.filter(w => w.fx === 'isle' && w.t < w.dur).length).toBe(n - 1)
    // The first one back (others may be under by then): an island stands on its cell again.
    const first = leviathanOf(u)!.sunk[0]!
    step(sim, LEVIATHAN_TUNING.SINK_DUR + 0.5, () => !leviathanOf(u)!.sunk.includes(first))
    expect(leviathanOf(u)!.sunk).not.toContain(first)
    expect(sim.walls.some(w => w.fx === 'isle' && w.t < w.dur && w.cells[0] === first)).toBe(true)
  })

  it('from 30 % it grabs the hero who stays on its bubbles (held 2 s), and sea-demons come up', () => {
    const sim = arena()
    const u = leviathan(sim)
    const seen: SimEvent[] = []
    u.hp = u.s.maxHp * 0.29
    u.boss!.phase = 2
    // Free a moment so the phase can begin.
    step(sim, 1, () => u.boss!.phase === 3, seen)
    expect(u.boss!.phase).toBe(3)
    expect(sim.units.filter(q => q.alive && q.kind === 'seaDemon').length).toBe(2)
    expect(seen.some(e => e.t === 'bark' && e.key === 'dlg.bark.leviathan.grab.1')).toBe(true)
    const h = sim.hero.unit
    let held = false
    for (let i = 0; i < 30 * 12 && !held; i++) {
      step(sim, 1 / 30)
      held = hasStatus(h, 'stun')
    }
    expect(held).toBe(true)
    step(sim, LEVIATHAN_TUNING.GRAB_HOLD - 0.3)
    expect(hasStatus(h, 'stun')).toBe(true)
  })

  it('says its last words', () => {
    const sim = arena()
    const u = leviathan(sim)
    step(sim, 8, () => leviathanOf(u)!.up)
    sim.events.length = 0
    dealDamage(sim, sim.hero.unit, u, 1e9, { type: 'true', canCrit: false })
    expect(u.alive).toBe(false)
    expect(sim.events.some(e => e.t === 'bark' && e.key === 'dlg.bark.leviathan.death.1')).toBe(true)
  })
})
