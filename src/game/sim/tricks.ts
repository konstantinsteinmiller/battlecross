import { applyStatus, dealDamage, heal } from './combat'
import { nearestOpen } from './grid'
import { spawnEnemy } from './spawn'
import { newBossState } from './bosses/kit'
import { hasStatus } from './world'
import type { ZonePlan } from './zoneGen'
import type { Sim } from './world'

/**
 * ─── One trick per Hollows section (roadmap #EXT-2) ──────────────────────────
 *
 *   section 1  the cook's camp: a stew pot by the fire mends every foe round it while the cook (the pack's goblin shaman)
 *              lives. Kill the cook first and the pot goes cold.
 *   section 2  the boulder lane: a lever at the edge of the clearing. Stood at, it rolls three boulders down the lane through
 *              the pack (a share of their health and a knockdown). Once.
 *   section 3  the slinger gallery: a scaffold over the clearing with two slingers up on it, out of reach and pelting the hero. A rope
 *              post stands at its foot: stood at, it cuts the rope, the scaffold comes down and the slingers fall hurt and stunned.
 *   section 4  the false floor: by the first side chest, a patch of floor that gives way. The ground cracks for a second, then falls
 *              in: roll away or drop (a share of health, a knockdown). Once.
 *
 * Laid after the packs on no dice of the sim's own; the view (`gfx/hollowsTricks.ts`) draws what it finds in `sim.tricks`.
 */

export const POT_R = 8
export const POT_HEAL = 0.03
export const LEVER_REACH = 1.7
/** How near the hero comes before the trick is explained, once (m). */
const HINT_R = 13
export const LEVER_DWELL = 0.4
export const BOULDER_S = 1.7
export const BOULDER_GAP = 0.3
export const BOULDER_HIT = 0.45
export const BOULDER_R = 1.5
export const LANE_OFFSETS: readonly number[] = [-1.5, 0, 1.5]

export interface PotState { x: number; z: number; group: number; cook: number; t: number; lit: boolean; told?: boolean }
export interface LaneState {
  lx: number; lz: number
  x0: number; z0: number; x1: number; z1: number
  state: 'ready' | 'roll' | 'spent'
  t: number
  dwell: number
  hit: number[]
  told?: boolean
}
export interface GalleryState {
  x: number; z: number
  /** The rope post. */
  px: number; pz: number
  units: number[]
  state: 'up' | 'down'
  /** Seconds since the rope was cut. */
  t: number
  dwell: number
  shot: number
  told?: boolean
}
export interface TrapState {
  x: number; z: number; r: number
  state: 'armed' | 'cracking' | 'gone'
  t: number
  dwell: number
}
export interface TrickState { pots: PotState[]; lanes: LaneState[]; galleries: GalleryState[]; traps: TrapState[] }

export const GALLERY_LIFT = 2.3
export const GALLERY_SHOT_GAP = 2.4
export const GALLERY_RANGE = 14
export const GALLERY_FALL_HIT = 0.35
export const TRAP_R = 2.1
export const TRAP_CRACK_S = 1
export const TRAP_HIT = 0.12

const snap = (sim: Sim, x: number, z: number): [number, number] => {
  const o: [number, number] = [x, z]
  nearestOpen(sim.grid, x, z, o, 6)
  return o
}

/** Lay the tricks of a Hollows visit (not the first one's tutorial, which has its own set fights). */
export const layTricks = (sim: Sim, plan: ZonePlan, zone: string): void => {
  sim.tricks = null
  if (zone !== 'hollows' || plan.camp || plan.chests.some(c => c.role === 'cage')) return
  const t: TrickState = { pots: [], lanes: [], galleries: [], traps: [] }
  const p0 = plan.packs[0]
  const cook = p0 ? sim.units.find(u => u.alive && u.kind === 'goblinShaman' && u.group === 0) : undefined
  if (p0 && cook) {
    const fire = plan.dressing?.find(d => d.kind === 'fire' && Math.hypot(d.x - p0.x, d.z - p0.z) < p0.r)
    const [x, z] = snap(sim, fire ? fire.x + 1.2 : p0.x + 1.6, fire ? fire.z : p0.z + 0.4)
    t.pots.push({ x, z, group: 0, cook: cook.id, t: 0, lit: true })
  }
  const p1 = plan.packs[1]
  if (p1 && !p1.finale) {
    // The lane runs along the way the hero comes in (from the clearing before it).
    const prev = plan.packs[0] ?? { x: plan.start.x, z: plan.start.z }
    let dx = p1.x - prev.x
    let dz = p1.z - prev.z
    const l = Math.hypot(dx, dz) || 1
    dx /= l
    dz /= l
    const R = p1.r * 0.8
    const [x0, z0] = snap(sim, p1.x - dx * R, p1.z - dz * R)
    const [x1, z1] = snap(sim, p1.x + dx * R, p1.z + dz * R)
    const [lx, lz] = snap(sim, p1.x - dz * p1.r * 0.8 - dx * R * 0.5, p1.z + dx * p1.r * 0.8 - dz * R * 0.5)
    t.lanes.push({ lx, lz, x0, z0, x1, z1, state: 'ready', t: 0, dwell: 0, hit: [] })
  }
  const p2 = plan.packs[2]
  if (p2 && !p2.finale) {
    const [x, z] = snap(sim, p2.x, p2.z - p2.r * 0.45)
    const [px, pz] = snap(sim, x + 3.4, z + 1.2)
    const g: GalleryState = { x, z, px, pz, units: [], state: 'up', t: 0, dwell: 0, shot: 1.5 }
    for (const side of [-1, 1]) {
      const u = spawnEnemy(sim, 'goblinSlinger', x + side * 0.6, z + 0.1, 2)
      if (!u) continue
      u.rooted = true
      u.stunt = { lift: GALLERY_LIFT, flip: 0 }
      // On the scaffold they are out of reach of everything, like a boss in the air.
      u.boss = newBossState('gallery')
      u.boss.alt = GALLERY_LIFT
      u.facing = Math.PI
      g.units.push(u.id)
      sim.groupById(2)?.members.push(u.id)
    }
    if (g.units.length) t.galleries.push(g)
  }
  // The false floor, by the first chest off the road.
  const side = plan.chests.find(c => ['nook', 'guard', 'cave', 'bypass', 'ledge'].includes(c.role))
  if (side) {
    const [x, z] = snap(sim, (side.x + side.sx) / 2, (side.z + side.sz) / 2)
    t.traps.push({ x, z, r: TRAP_R, state: 'armed', t: 0, dwell: 0 })
  }
  if (t.pots.length || t.lanes.length || t.galleries.length || t.traps.length) sim.tricks = t
}

/** Where boulder `k` is at lane time `t` (false: not rolling then). */
export const boulderAt = (ln: LaneState, k: number, t: number, out: [number, number]): boolean => {
  const u = (t - k * BOULDER_GAP) / BOULDER_S
  if (u < 0 || u > 1) return false
  const dx = ln.x1 - ln.x0
  const dz = ln.z1 - ln.z0
  const l = Math.hypot(dx, dz) || 1
  out[0] = ln.x0 + dx * u + (-dz / l) * LANE_OFFSETS[k]!
  out[1] = ln.z0 + dz * u + (dx / l) * LANE_OFFSETS[k]!
  return true
}

const at: [number, number] = [0, 0]

/** The gallery's slingers: pelt the hero from the scaffold; the rope cut brings it all down. */
const stepGallery = (sim: Sim, g: GalleryState, dt: number): void => {
  const h = sim.hero.unit
  if (g.state === 'up') {
    if (!g.told && h.alive && Math.hypot(h.x - g.x, h.z - g.z) < 13) { g.told = true; sim.emit({ t: 'trick', id: 'galleryHint', x: g.x, z: g.z }) }
    const near = h.alive && Math.hypot(g.px - h.x, g.pz - h.z) <= LEVER_REACH
    g.dwell = near ? g.dwell + dt : 0
    if (g.dwell >= LEVER_DWELL) {
      g.state = 'down'
      g.t = 0
      sim.emit({ t: 'trick', id: 'galleryDown', x: g.x, z: g.z })
      return
    }
    g.shot -= dt
    if (g.shot > 0 || !h.alive || Math.hypot(h.x - g.x, h.z - g.z) > GALLERY_RANGE) return
    g.shot = GALLERY_SHOT_GAP
    for (const id of g.units) {
      const u = sim.get(id)
      if (!u?.alive) continue
      sim.emit({ t: 'fx', id: 'dash', x: u.x, z: u.z, x2: h.x, z2: h.z, color: '#9bd45a' })
      dealDamage(sim, u, h, u.s.baseDmg * 0.9, { type: 'pierce', canCrit: false })
    }
    return
  }
  g.t += dt
  for (const id of g.units) {
    const u = sim.get(id)
    if (!u?.alive) continue
    if (g.t < 0.6) {
      // Falling with the scaffold.
      if (u.stunt) u.stunt = { lift: GALLERY_LIFT * (1 - Math.min(1, g.t / 0.6) ** 2), flip: 0 }
      continue
    }
    if (u.stunt) {
      u.stunt = undefined
      u.rooted = false
      u.boss = undefined
      u.awake = true
      dealDamage(sim, null, u, u.s.maxHp * GALLERY_FALL_HIT, { type: 'true', canCrit: false, echo: true })
      applyStatus(sim, u, 'stun', 3, 1, null, { quiet: true })
      sim.emit({ t: 'trick', id: 'galleryLand', x: u.x, z: u.z })
    }
  }
}

/** The false floor: cracks while the hero stands on it, then gives way. */
const stepTrap = (sim: Sim, p: TrapState, dt: number): void => {
  const h = sim.hero.unit
  const on = h.alive && Math.hypot(h.x - p.x, h.z - p.z) <= p.r - 0.3
  if (p.state === 'armed') {
    p.dwell = on ? p.dwell + dt : 0
    if (p.dwell < 0.25) return
    p.state = 'cracking'
    p.t = 0
    sim.emit({ t: 'tele', tele: { team: 1, src: h.id, shape: 'circle', x: p.x, z: p.z, r: p.r, w: 0, a: 0, dur: TRAP_CRACK_S } })
    sim.emit({ t: 'trick', id: 'trapCrack', x: p.x, z: p.z })
  } else if (p.state === 'cracking') {
    p.t += dt
    if (p.t < TRAP_CRACK_S) return
    p.state = 'gone'
    sim.emit({ t: 'trick', id: 'trapFall', x: p.x, z: p.z })
    const rolling = h.action?.id === 'roll' || hasStatus(h, 'invulnerable')
    if (h.alive && !rolling && Math.hypot(h.x - p.x, h.z - p.z) <= p.r) {
      dealDamage(sim, null, h, h.s.maxHp * TRAP_HIT, { type: 'true', canCrit: false, echo: true })
      applyStatus(sim, h, 'knockdown', 1.2, 1, null, { quiet: true })
    }
  }
}

export const stepTricks = (sim: Sim, dt: number): void => {
  const tr = sim.tricks
  if (!tr || !sim.hero) return
  const h = sim.hero.unit
  for (const g of tr.galleries) stepGallery(sim, g, dt)
  for (const p of tr.traps) stepTrap(sim, p, dt)
  for (const p of tr.pots) {
    const cook = sim.get(p.cook)
    const was = p.lit
    p.lit = !!cook?.alive
    if (was && !p.lit) sim.emit({ t: 'trick', id: 'potOut', x: p.x, z: p.z })
    if (!p.lit) continue
    p.t += dt
    if (!p.told && h.alive && Math.hypot(h.x - p.x, h.z - p.z) < HINT_R) { p.told = true; sim.emit({ t: 'trick', id: 'potHint', x: p.x, z: p.z }) }
    // The pot only works for foes that are awake: a sleeping camp is just a camp.
    for (const u of sim.units) {
      if (!u.alive || u.team !== 1 || u.rank === 'npc' || !u.awake || u.hp >= u.s.maxHp) continue
      if (Math.hypot(u.x - p.x, u.z - p.z) > POT_R) continue
      heal(sim, u, u.s.maxHp * POT_HEAL * dt, true)
    }
    if (p.t >= 1.5) {
      p.t = 0
      sim.emit({ t: 'trick', id: 'pot', x: p.x, z: p.z })
    }
  }
  for (const ln of tr.lanes) {
    if (ln.state === 'ready') {
      if (!ln.told && h.alive && Math.hypot(ln.lx - h.x, ln.lz - h.z) < HINT_R) { ln.told = true; sim.emit({ t: 'trick', id: 'leverHint', x: ln.lx, z: ln.lz }) }
      const near = h.alive && Math.hypot(ln.lx - h.x, ln.lz - h.z) <= LEVER_REACH
      ln.dwell = near ? ln.dwell + dt : 0
      if (ln.dwell >= LEVER_DWELL) {
        ln.state = 'roll'
        ln.t = 0
        ln.hit.length = 0
        sim.emit({ t: 'trick', id: 'lever', x: ln.lx, z: ln.lz })
      }
    } else if (ln.state === 'roll') {
      ln.t += dt
      for (let k = 0; k < LANE_OFFSETS.length; k++) {
        if (!boulderAt(ln, k, ln.t, at)) continue
        for (const u of sim.units) {
          if (!u.alive || u.team !== 1 || u.rank === 'npc' || u.rank === 'boss' || ln.hit.includes(u.id)) continue
          if (Math.hypot(u.x - at[0], u.z - at[1]) > BOULDER_R + u.r) continue
          ln.hit.push(u.id)
          u.awake = true
          dealDamage(sim, null, u, u.s.maxHp * BOULDER_HIT, { type: 'physical', canCrit: false, echo: true })
          applyStatus(sim, u, 'knockdown', 1.4, 1, null, { quiet: true })
          sim.emit({ t: 'trick', id: 'boulderHit', x: u.x, z: u.z })
        }
      }
      if (ln.t > BOULDER_S + BOULDER_GAP * LANE_OFFSETS.length) ln.state = 'spent'
    }
  }
}
