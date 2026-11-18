import {
  BARREL_HIT, BRAZIER_R, CART_ACCEL, CART_GRACE, CART_SPEED, CART_STEER, CART_STUMBLE, GAP_HIT, GAP_LEN, OBSTACLE_EVERY, PLATE_HIT, stashGold
} from '../data/undercroft'
import { dealDamage } from './combat'
import { spawnEnemy } from './spawn'
import { CART_END_Z, CART_START_Z, LANE_X, ROOMS, UNDER_LAYOUT } from './undercroftMap'
import { CELL } from './grid'
import type { TrapState } from './tricks'
import type { Sim } from './world'
import type { LootDraw } from './world'

/**
 * ─── The Undercroft, as the sim plays it (roadmap #EXT-1) ────────────────────
 *
 * Phases: `corridor` (dark; braziers light as he passes), `cart` (he rides the rails, steering and rolling over what comes),
 * `stash` (three chests, one behind a pressure plate), `warden` (the Tunnel Warden), `done`. The phase follows where the hero stands.
 * Everything that moves on its own is a pure function of the state, so a test steps the sim and reads it.
 */

export type UnderPhase = 'corridor' | 'cart' | 'stash' | 'warden' | 'done'
export interface Obstacle { kind: 'barrel' | 'gap'; x: number; z: number; len: number; hit: boolean }
export interface UnderState {
  phase: UnderPhase
  t: number
  braziers: Array<{ x: number; z: number; lit: boolean }>
  cart: { on: boolean; done: boolean; speed: number; grace: number; hits: number; falls: number; obstacles: Obstacle[]; z: number }
  stash: { opened: number }
  warden: number
  /** Seconds since the warden fell (-1: standing). */
  won: number
  outcome: '' | 'won' | 'skipped'
}

/** The lane's obstacles: a barrel left, a barrel right, a rail gap, over and over down the whole lane. */
export const laneObstacles = (): Obstacle[] => {
  const out: Obstacle[] = []
  let k = 0
  for (let z = CART_START_Z - 22; z > CART_END_Z + 14; z -= OBSTACLE_EVERY, k++) {
    const m = k % 3
    if (m === 2) out.push({ kind: 'gap', x: LANE_X, z, len: GAP_LEN, hit: false })
    else out.push({ kind: 'barrel', x: LANE_X + (m ? 1 : -1) * 1.1, z, len: 1.4, hit: false })
  }
  return out
}

export const armUndercroft = (sim: Sim): void => {
  const L = UNDER_LAYOUT
  // The stash: three chests, the third behind a pressure plate; the gold shows why he left the road.
  const lvl = sim.level
  L.chests.forEach((c, k) => {
    const loot: LootDraw[] = [{ kind: 'gold', gold: stashGold(lvl, k), u: 0, item: '' }]
    if (k === 1) loot.push({ kind: 'potion', gold: 0, u: 0, item: '' })
    sim.chests.push({
      id: sim.chests.length, x: c.x, z: c.z, sx: c.sx, sz: c.sz, tier: k === 2 ? 'gold' : 'iron', role: 'nook', state: 'closed', door: -1, guard: -1, loot, special: '', openedAt: 0
    })
  })
  const trap: TrapState = { x: L.plate.x, z: L.plate.z, r: 1.7, state: 'armed', t: 0, dwell: 0 }
  sim.tricks = { pots: [], lanes: [], galleries: [], traps: [trap] }
  sim.under = {
    phase: 'corridor', t: 0,
    braziers: L.braziers.map(b => ({ ...b, lit: false })),
    cart: { on: false, done: false, speed: 0, grace: 0, hits: 0, falls: 0, obstacles: laneObstacles(), z: CART_START_Z },
    stash: { opened: 0 }, warden: -1, won: -1, outcome: ''
  }
}

export const underOver = (sim: Sim): boolean => !!sim.under && sim.under.phase === 'done'

/** Skip the whole Undercroft: the tunnel leads straight out. */
export const skipUndercroft = (sim: Sim): void => {
  const u = sim.under
  if (!u || u.phase === 'done') return
  u.outcome = 'skipped'
  u.phase = 'done'
  u.t = 0
}

const hurt = (sim: Sim, share: number): void => {
  const h = sim.hero.unit
  dealDamage(sim, null, h, h.s.maxHp * share, { type: 'true', canCrit: false, echo: true })
}

const stepCart = (sim: Sim, dt: number): void => {
  const u = sim.under!
  const c = u.cart
  const h = sim.hero
  const hu = h.unit
  c.grace = Math.max(0, c.grace - dt)
  // A hurt rider slows, then the cart speeds up again.
  c.speed += (CART_SPEED - c.speed) * Math.min(1, dt * CART_ACCEL * 0.5)
  c.z -= c.speed * dt
  hu.z = hu.pz = c.z
  hu.x += h.stickX * CART_STEER * dt
  hu.x = Math.max(LANE_X - 1.9, Math.min(LANE_X + 1.9, hu.x))
  hu.px = hu.x
  hu.vx = hu.vz = 0
  hu.facing = Math.PI
  if (hu.anim !== 'cast') hu.anim = 'walk'
  h.order = { kind: 'none', targetId: 0, x: hu.x, z: hu.z }
  // The dodge is a hop here: it comes back quickly.
  h.rollCd = Math.min(h.rollCd, 0.55)
  const hop = hu.action?.id === 'roll' || hu.statuses.some(s => s.id === 'invulnerable')
  for (const o of c.obstacles) {
    if (o.hit) continue
    const dz = Math.abs(hu.z - o.z)
    if (dz > o.len / 2 + 0.3) { if (hu.z < o.z - o.len) o.hit = true; continue }
    if (o.kind === 'barrel' && Math.abs(hu.x - o.x) > 1.0) continue
    if (hop) continue
    if (c.grace > 0) continue
    o.hit = true
    c.grace = CART_GRACE
    c.speed *= CART_STUMBLE
    if (o.kind === 'barrel') { c.hits++; hurt(sim, BARREL_HIT); sim.emit({ t: 'under', id: 'barrel', n: c.hits, x: o.x, z: o.z }) }
    else { c.falls++; hurt(sim, GAP_HIT); sim.emit({ t: 'under', id: 'gap', n: c.falls, x: hu.x, z: o.z }) }
  }
  if (hu.z <= CART_END_Z + 2) {
    c.on = false
    c.done = true
    hu.z = hu.pz = (ROOMS.stash.j1 - 0.5) * CELL
    u.phase = 'stash'
    sim.emit({ t: 'under', id: 'cartEnd', n: 0, x: hu.x, z: hu.z })
  }
}

export const stepUndercroft = (sim: Sim, dt: number): void => {
  const u = sim.under
  if (!u || u.phase === 'done') {
    if (u && sim.hero) sim.hero.unit.noFight = false
    return
  }
  const h = sim.hero.unit
  u.t += dt
  const L = UNDER_LAYOUT
  h.noFight = u.cart.on
  // The braziers catch as he passes.
  for (const b of u.braziers) {
    if (!b.lit && Math.hypot(b.x - h.x, b.z - h.z) < BRAZIER_R) { b.lit = true; sim.emit({ t: 'under', id: 'brazier', n: u.braziers.indexOf(b), x: b.x, z: b.z }) }
  }
  if (u.phase === 'corridor' && h.z < CART_START_Z + 6 && h.alive) {
    u.phase = 'cart'
    u.cart.on = true
    u.cart.speed = 1
    u.cart.z = h.z
    sim.emit({ t: 'under', id: 'cartStart', n: 0, x: h.x, z: h.z })
  }
  if (u.cart.on) stepCart(sim, dt)
  if (u.phase === 'stash') {
    // The chests open as in any zone; the plate is a trick of the sim's (`tricks.ts`).
    u.stash.opened = sim.chests.filter(c => c.state === 'open').length
    if (h.z < (ROOMS.warden.j1 + 1) * CELL) {
      u.phase = 'warden'
      const w = spawnEnemy(sim, 'tunnelWarden', L.warden.x, L.warden.z, -1)
      if (w) {
        w.awake = true
        w.targetId = sim.hero.unit.id
        u.warden = w.id
        sim.emit({ t: 'under', id: 'warden', n: 0, x: w.x, z: w.z })
      }
    }
  }
  if (u.phase === 'warden') {
    const w = sim.get(u.warden)
    if (u.won < 0 && (!w || !w.alive)) { u.won = 0; sim.emit({ t: 'under', id: 'won', n: 0, x: L.exit.x, z: L.exit.z }) }
    if (u.won >= 0) {
      u.won += dt
      if (u.won >= 3) { u.outcome = 'won'; u.phase = 'done'; u.t = 0 }
    }
  }
}
