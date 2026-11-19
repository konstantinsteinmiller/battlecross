import {
  BARREL_HIT, BRAZIER_R, CART_ACCEL, CART_GRACE, CART_SPEED, CART_STEER, CART_STUMBLE, GAP_HIT, GAP_LEN, OBSTACLE_EVERY, PLATE_HIT, stashGold
} from '../data/undercroft'
import { face, setGoal, stop, walk } from './actors'
import { dealDamage } from './combat'
import { plainStats } from './stats'
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
  /** The freed teachers who came down with him (units), seconds since the drop, and when each line was last said. */
  teachers: number[]
  arrive: number
  said: Record<string, number>
}

/** The teachers' comments (#EXT-12): who says it (index in `teachers`), the key of the line, and the seconds before it may be said again (0: once). */
export const UNDER_LINES = {
  arrive: { who: 0, key: 'dlg.bark.trainerAegis.under.1', gap: 0 },
  cart: { who: 3, key: 'dlg.bark.sbMasterIronmonk.cart.1', gap: 0 },
  hit: { who: 2, key: 'dlg.bark.sbMasterSoulwarden.hit.1', gap: 9 },
  clean: { who: 1, key: 'dlg.bark.trainerPyro.clean.1', gap: 0 },
  won: { who: 0, key: 'dlg.bark.trainerAegis.won.1', gap: 0 }
} as const
export type UnderLine = keyof typeof UNDER_LINES

/** The four teachers of the cage: who they are (looks) and where they stand round the hero. */
const TEACHERS = ['trainerAegis', 'trainerPyro', 'sbMasterSoulwarden', 'sbMasterIronmonk'] as const
/** How long the fall into the Undercroft takes (s), and how high it begins (m). */
export const DROP_S = 1
export const DROP_H = 7

const say = (sim: Sim, line: UnderLine): void => {
  const u = sim.under!
  const l = UNDER_LINES[line]
  const last = u.said[line]
  if (last !== undefined && (l.gap === 0 || u.t - last < l.gap)) return
  const id = u.teachers[l.who]
  const t = id !== undefined ? sim.get(id) : undefined
  if (!t?.alive) return
  u.said[line] = u.t
  sim.emit({ t: 'bark', unit: t.id, key: l.key })
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
  // The freed teachers come down with him (#EXT-1): they follow and comment (#EXT-12). Nobody aims at an NPC.
  const teachers: number[] = TEACHERS.map((look, k) => {
    const t = sim.addUnit({ kind: look, team: 0, rank: 'npc', level: 1, x: L.start.x + (k - 1.5) * 1.3, z: L.start.z + 2 + (k % 2) * 0.8, r: 0.3, h: 1.45, s: plainStats({ hp: 1000, dmg: 0, speed: 4.4 }), facing: Math.PI })
    t.crowd = true
    t.stunt = { lift: DROP_H, flip: 0 }
    return t.id
  })
  sim.hero.unit.stunt = { lift: DROP_H, flip: 0 }
  sim.under = {
    teachers, arrive: 0, said: {},
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

/** The teachers follow the hero: behind him on the rails (running), else at his side; they wait at the arena's door for the fight. */
const stepTeachers = (sim: Sim, dt: number): void => {
  const u = sim.under!
  const h = sim.hero.unit
  u.teachers.forEach((id, k) => {
    const t = sim.get(id)
    if (!t) return
    if (u.cart.on) {
      // They run behind the cart, cheering.
      t.x = t.px = LANE_X + (k % 2 ? 1 : -1) * 0.8
      t.z = t.pz = h.z + 4.2 + k * 1.3
      t.facing = Math.PI
      t.anim = 'walk'
      stop(t)
      return
    }
    const hold = u.phase === 'warden'
    const gx = hold ? UNDER_LAYOUT.start.x * 0 + (ROOMS.stash.i0 + 3 + k * 3) * CELL : h.x + (k - 1.5) * 1.6
    const gz = hold ? (ROOMS.stash.j0 + 3) * CELL : h.z + 2.4
    if (Math.hypot(gx - t.x, gz - t.z) > 1.2) {
      t.repathT -= dt
      if (t.repathT <= 0 || !t.hasGoal) { t.repathT = 0.5; setGoal(sim, t, gx, gz) }
      if (walk(sim, t, dt, Math.hypot(h.x - t.x, h.z - t.z) > 8 ? 1.8 : 1.1)) t.anim = 'walk'
    } else {
      stop(t)
      t.anim = 'idle'
      face(t, h.x, h.z)
    }
  })
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
    say(sim, 'hit')
    if (o.kind === 'barrel') { c.hits++; hurt(sim, BARREL_HIT); sim.emit({ t: 'under', id: 'barrel', n: c.hits, x: o.x, z: o.z }) }
    else { c.falls++; hurt(sim, GAP_HIT); sim.emit({ t: 'under', id: 'gap', n: c.falls, x: hu.x, z: o.z }) }
  }
  if (hu.z <= CART_END_Z + 2) {
    c.on = false
    c.done = true
    hu.z = hu.pz = (ROOMS.stash.j1 - 0.5) * CELL
    u.phase = 'stash'
    for (const id of u.teachers) { const t = sim.get(id); if (t) { t.x = t.px = hu.x + (u.teachers.indexOf(id) - 1.5) * 1.4; t.z = t.pz = hu.z + 3; stop(t) } }
    if (c.hits + c.falls === 0) say(sim, 'clean')
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
  // The fall in: he drops from the hole above and lands in a cloud of dust, the teachers after him.
  if (u.arrive < DROP_S) {
    const wasAir = u.arrive === 0
    u.arrive += dt
    const k = Math.min(1, u.arrive / DROP_S)
    const lift = DROP_H * (1 - k * k)
    h.stunt = k < 1 ? { lift, flip: 0 } : undefined
    u.teachers.forEach((id, i) => { const t = sim.get(id); if (t) t.stunt = k < 1 ? { lift: Math.max(0, DROP_H * (1 - Math.min(1, k * 1.1 - i * 0.04) ** 2)), flip: 0 } : undefined })
    h.noFight = true
    if (wasAir) sim.emit({ t: 'under', id: 'drop', n: 0, x: h.x, z: h.z })
    if (k >= 1) sim.emit({ t: 'under', id: 'land', n: 0, x: h.x, z: h.z })
    return
  }
  if (u.t < DROP_S + 2.5 && u.phase === 'corridor') say(sim, 'arrive')
  h.noFight = u.cart.on
  stepTeachers(sim, dt)
  // The braziers catch as he passes.
  for (const b of u.braziers) {
    if (!b.lit && Math.hypot(b.x - h.x, b.z - h.z) < BRAZIER_R) { b.lit = true; sim.emit({ t: 'under', id: 'brazier', n: u.braziers.indexOf(b), x: b.x, z: b.z }) }
  }
  if (u.phase === 'corridor' && h.z < CART_START_Z + 6 && h.alive) {
    u.phase = 'cart'
    u.cart.on = true
    u.cart.speed = 1
    u.cart.z = h.z
    say(sim, 'cart')
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
    if (u.won < 0 && (!w || !w.alive)) { u.won = 0; say(sim, 'won'); sim.emit({ t: 'under', id: 'won', n: 0, x: L.exit.x, z: L.exit.z }) }
    if (u.won >= 0) {
      u.won += dt
      if (u.won >= 3) { u.outcome = 'won'; u.phase = 'done'; u.t = 0 }
    }
  }
}
