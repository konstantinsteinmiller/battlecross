import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { populateZone, applyPlan } from '@/game/sim/director'
import { generateZone } from '@/game/sim/zoneGen'
import { stepSim } from '@/game/sim/step'
import { startAttrs } from '@/game/data/attributes'
import { ZONES } from '@/game/data/zones'
import { BOULDER_S, LANE_OFFSETS } from '@/game/sim/tricks'

/** #EXT-2: the cook's stew pot mends the pack until the cook falls; the lever rolls boulders through the next pack. */

const DT = 1 / 30
const scene = () => {
  const plan = generateZone(ZONES.hollows, 11)
  const sim = new Sim({ seed: 11, w: plan.w, h: plan.h, level: 4, difficulty: 1, mode: 'zone', zone: 'hollows' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 4, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
  populateZone(sim, plan, 'hollows', [])
  return { sim, plan }
}
const run = (sim: Sim, plan: ReturnType<typeof generateZone>, s: number): void => { for (let t = 0; t < s; t += DT) { stepSim(sim, plan, DT); sim.events.length = 0 } }

describe('the Hollows\' section tricks (#EXT-2)', () => {
  it('lays a pot at the cook\'s camp and a lever at the lane', () => {
    const { sim } = scene()
    expect(sim.tricks).not.toBeNull()
    expect(sim.tricks!.pots).toHaveLength(1)
    expect(sim.tricks!.lanes).toHaveLength(1)
  })

  it('the pot mends the awake pack while the cook lives, and goes cold when he falls', () => {
    const { sim, plan } = scene()
    const pot = sim.tricks!.pots[0]!
    const cook = sim.get(pot.cook)!
    const mate = sim.units.find(u => u.alive && u.team === 1 && u.id !== cook.id && Math.hypot(u.x - pot.x, u.z - pot.z) < 7)
    expect(mate).toBeDefined()
    mate!.awake = true
    mate!.hp = mate!.s.maxHp * 0.3
    sim.hero.unit.x = sim.hero.unit.px = pot.x + 30
    run(sim, plan, 0.1)
    const h0 = mate!.hp
    run(sim, plan, 2)
    expect(mate!.hp).toBeGreaterThan(h0)
    cook.hp = 0
    cook.alive = false
    run(sim, plan, 0.2)
    expect(pot.lit).toBe(false)
    const h1 = mate!.hp
    run(sim, plan, 1)
    expect(mate!.hp).toBeLessThanOrEqual(h1 + 1)
  })

  it('the lever, stood at, rolls three boulders that hurt and fell what they pass', () => {
    const { sim, plan } = scene()
    const ln = sim.tricks!.lanes[0]!
    const mid = { x: (ln.x0 + ln.x1) / 2, z: (ln.z0 + ln.z1) / 2 }
    const foe = sim.units.find(u => u.alive && u.team === 1 && u.rank !== 'boss')!
    foe.x = foe.px = mid.x
    foe.z = foe.pz = mid.z
    foe.awake = true
    foe.hp = foe.s.maxHp
    const u = sim.hero.unit
    u.x = u.px = ln.lx
    u.z = u.pz = ln.lz
    // Hold the foe where the boulders pass.
    for (let t = 0; t < 1 + BOULDER_S + 0.3 * LANE_OFFSETS.length && foe.alive; t += DT) {
      foe.x = mid.x; foe.z = mid.z
      stepSim(sim, plan, DT)
      sim.events.length = 0
    }
    expect(ln.state === 'roll' || ln.state === 'spent').toBe(true)
    expect(ln.hit).toContain(foe.id)
    expect(foe.hp).toBeLessThan(foe.s.maxHp)
  })
})

describe('the slinger gallery and the false floor (#EXT-2)', () => {
  it('lays a gallery with two slingers up out of reach, and a false floor by a side chest', () => {
    const { sim } = scene()
    const g = sim.tricks!.galleries[0]!
    expect(g.units).toHaveLength(2)
    for (const id of g.units) {
      const u = sim.get(id)!
      expect(u.stunt?.lift).toBeGreaterThan(2)
      // Out of reach while up.
      expect(u.boss!.alt).toBeGreaterThan(1.2)
    }
    expect(sim.tricks!.traps).toHaveLength(1)
  })

  it('cutting the rope brings the scaffold down: the slingers fall hurt, stunned and within reach', () => {
    const { sim, plan } = scene()
    const g = sim.tricks!.galleries[0]!
    const u = sim.hero.unit
    u.x = u.px = g.px
    u.z = u.pz = g.pz
    const hp = g.units.map(id => sim.get(id)!.hp)
    run(sim, plan, 1.6)
    expect(g.state).toBe('down')
    g.units.forEach((id, i) => {
      const s = sim.get(id)!
      expect(s.stunt).toBeUndefined()
      expect(s.hp).toBeLessThan(hp[i]!)
      expect(s.boss).toBeUndefined()
    })
  })

  it('the false floor cracks, then gives way: a share of health and a fall, unless the hero is out of it', () => {
    const a = scene()
    for (const u of a.sim.units) if (u.team === 1) { u.x = u.px = 5; u.z = u.pz = 5; u.awake = false }
    const tp = a.sim.tricks!.traps[0]!
    const h = a.sim.hero.unit
    h.s.maxHp = h.hp = 1000
    h.x = h.px = tp.x
    h.z = h.pz = tp.z
    run(a.sim, a.plan, 0.4)
    expect(tp.state).toBe('cracking')
    run(a.sim, a.plan, 1.1)
    expect(tp.state).toBe('gone')
    expect(h.hp).toBeLessThan(1000)
    // Out of it in time: nothing.
    const b = scene()
    for (const u of b.sim.units) if (u.team === 1) { u.x = u.px = 5; u.z = u.pz = 5; u.awake = false }
    const tq = b.sim.tricks!.traps[0]!
    const hb = b.sim.hero.unit
    hb.s.maxHp = hb.hp = 1000
    hb.x = hb.px = tq.x
    hb.z = hb.pz = tq.z
    run(b.sim, b.plan, 0.4)
    hb.x = hb.px = tq.x + 8
    run(b.sim, b.plan, 1.2)
    expect(tq.state).toBe('gone')
    expect(hb.hp).toBe(1000)
  })
})
