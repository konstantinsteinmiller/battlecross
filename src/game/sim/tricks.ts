import { applyStatus, dealDamage, heal } from './combat'
import { nearestOpen } from './grid'
import type { ZonePlan } from './zoneGen'
import type { Sim } from './world'

/**
 * ─── One trick per Hollows section (roadmap #EXT-2) ──────────────────────────
 *
 *   section 1  the cook's camp: a stew pot by the fire mends every foe round it while the cook (the pack's goblin shaman)
 *              lives. Kill the cook first and the pot goes cold.
 *   section 2  the boulder lane: a lever at the edge of the clearing. Stood at, it rolls three boulders down the lane through
 *              the pack (a share of their health and a knockdown). Once.
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
export interface TrickState { pots: PotState[]; lanes: LaneState[] }

const snap = (sim: Sim, x: number, z: number): [number, number] => {
  const o: [number, number] = [x, z]
  nearestOpen(sim.grid, x, z, o, 6)
  return o
}

/** Lay the tricks of a Hollows visit (not the first one's tutorial, which has its own set fights). */
export const layTricks = (sim: Sim, plan: ZonePlan, zone: string): void => {
  sim.tricks = null
  if (zone !== 'hollows' || plan.camp || plan.chests.some(c => c.role === 'cage')) return
  const t: TrickState = { pots: [], lanes: [] }
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
  if (t.pots.length || t.lanes.length) sim.tricks = t
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

export const stepTricks = (sim: Sim, dt: number): void => {
  const tr = sim.tricks
  if (!tr || !sim.hero) return
  const h = sim.hero.unit
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
