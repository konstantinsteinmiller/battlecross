import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { applyPlan } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { spawnEnemy } from '@/game/sim/spawn'
import { startAttrs } from '@/game/data/attributes'
import { noGear } from '@/game/data/items'
import { generateUndercroft, UNDER_LAYOUT, CART_END_Z, CART_START_Z, LANE_X } from '@/game/sim/undercroftMap'
import { armUndercroft, laneObstacles, skipUndercroft } from '@/game/sim/undercroft'
import { CART_SPEED } from '@/game/data/undercroft'

/** #EXT-1: the Undercroft's four beats. */

const DT = 1 / 30
const scene = () => {
  const plan = generateUndercroft(3)
  const sim = new Sim({ seed: 3, w: plan.w, h: plan.h, level: 4, difficulty: 1, mode: 'zone', zone: 'hollows' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 4, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
  armUndercroft(sim)
  return { sim, plan }
}
const run = (sim: Sim, plan: ReturnType<typeof generateUndercroft>, s: number, each?: () => void): void => {
  for (let t = 0; t < s; t += DT) { each?.(); stepSim(sim, plan, DT); sim.events.length = 0 }
}

describe('the Undercroft (#EXT-1)', () => {
  it('opens dark in a corridor; the braziers light as he walks by', () => {
    const { sim, plan } = scene()
    const u = sim.under!
    expect(u.phase).toBe('corridor')
    expect(u.braziers.every(b => !b.lit)).toBe(true)
    const h = sim.hero.unit
    // Walk north up the corridor.
    run(sim, plan, 2, () => { h.x = h.px = UNDER_LAYOUT.start.x; h.z = Math.max(h.z - 0.6, CART_START_Z + 7); h.pz = h.z })
    expect(u.braziers.some(b => b.lit)).toBe(true)
  })

  it('the corridor leads to the rails: he is carried north at speed, barrels and gaps cost health, a roll over them costs none', () => {
    const a = scene()
    const ha = a.sim.hero.unit
    ha.s.maxHp = ha.hp = 1000
    ha.x = ha.px = LANE_X
    ha.z = ha.pz = CART_START_Z + 5
    run(a.sim, a.plan, 40)
    expect(a.sim.under!.cart.done).toBe(true)
    expect(a.sim.under!.cart.hits + a.sim.under!.cart.falls).toBeGreaterThan(3)
    expect(ha.hp).toBeLessThan(900)
    expect(a.sim.under!.phase).toBe('stash')
    // Hopping every obstacle (invulnerable at each one) comes through untouched.
    const b = scene()
    const hb = b.sim.hero.unit
    hb.s.maxHp = hb.hp = 1000
    hb.x = hb.px = LANE_X
    hb.z = hb.pz = CART_START_Z + 5
    run(b.sim, b.plan, 40, () => {
      const near = b.sim.under!.cart.obstacles.some(o => !o.hit && Math.abs(hb.z - o.z) < 2.2)
      if (near && b.sim.under!.cart.on) b.sim.hero.unit.statuses.push({ id: 'invulnerable', t: 0.3, dur: 0.3, v: 1, n: 1, src: hb.id, tick: 0 })
    })
    expect(b.sim.under!.cart.done).toBe(true)
    expect(hb.hp).toBe(1000)
    expect(laneObstacles().length).toBeGreaterThan(8)
    expect(CART_SPEED * 20).toBeGreaterThan(150)
    expect(CART_START_Z - CART_END_Z).toBeGreaterThan(200)
  })

  it('the stash has three chests, the last behind a plate that drops the floor, then the warden wakes in the arena', () => {
    const { sim, plan } = scene()
    expect(sim.chests).toHaveLength(3)
    expect(sim.tricks!.traps).toHaveLength(1)
    const u = sim.under!
    u.phase = 'stash'
    const h = sim.hero.unit
    h.x = h.px = UNDER_LAYOUT.warden.x
    h.z = h.pz = UNDER_LAYOUT.warden.z + 12
    run(sim, plan, 1.6)
    expect(u.phase).toBe('warden')
    const w = sim.get(u.warden)!
    expect(w.kind).toBe('tunnelWarden')
    expect(w.rank).toBe('boss')
    // He falls: the tunnel opens.
    w.hp = 0
    w.alive = false
    run(sim, plan, 3.4)
    expect(u.phase).toBe('done')
    expect(u.outcome).toBe('won')
  })

  it('four freed teachers fall in with him and comment: arriving, the cart, a hit, a clean ride, the win (#EXT-12)', () => {
    const { sim, plan } = scene()
    const u = sim.under!
    expect(u.teachers).toHaveLength(4)
    const keys: string[] = []
    const watch = (): void => { for (const e of sim.events) if (e.t === 'bark') keys.push(e.key) }
    // The fall: nobody acts until they land.
    expect(sim.hero.unit.stunt?.lift).toBeGreaterThan(5)
    for (let t = 0; t < 4; t += DT) { stepSim(sim, plan, DT); watch(); sim.events.length = 0 }
    expect(sim.hero.unit.stunt).toBeUndefined()
    expect(keys).toContain('dlg.bark.trainerAegis.under.1')
    // The cart, ridden badly: the barb; ridden clean afterwards (a fresh run): the praise.
    const h = sim.hero.unit
    h.s.maxHp = h.hp = 1000
    h.x = h.px = LANE_X
    h.z = h.pz = CART_START_Z + 5
    for (let t = 0; t < 40; t += DT) { stepSim(sim, plan, DT); watch(); sim.events.length = 0 }
    expect(keys).toContain('dlg.bark.sbMasterIronmonk.cart.1')
    expect(keys).toContain('dlg.bark.sbMasterSoulwarden.hit.1')
    expect(keys).not.toContain('dlg.bark.trainerPyro.clean.1')
    // The warden falls.
    u.phase = 'warden'
    const w = spawnEnemy(sim, 'tunnelWarden', UNDER_LAYOUT.warden.x, UNDER_LAYOUT.warden.z)!
    u.warden = w.id
    w.hp = 0
    w.alive = false
    for (let t = 0; t < 1; t += DT) { stepSim(sim, plan, DT); watch(); sim.events.length = 0 }
    expect(keys).toContain('dlg.bark.trainerAegis.won.1')
  })

  it('can be skipped', () => {
    const { sim } = scene()
    skipUndercroft(sim)
    expect(sim.under!.phase).toBe('done')
    expect(sim.under!.outcome).toBe('skipped')
  })
})
