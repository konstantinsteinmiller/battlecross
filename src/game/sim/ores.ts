import { LATE_ORE_LEVEL, LATE_ORE_NODES_MIN, ORE_NODES_MAX, oresAt, type OreId } from '../data/ores'
import { face, stop } from './actors'
import { cellOf, centerOf } from './grid'
import { walkableFrom, type SpotPlan } from './herbs'
import { mulberry32 } from './rng'
import { newAction, type Sim } from './world'
import { K_BLOCK, K_CLIFF, K_GROUND, K_WATER } from './zoneFeatures'

/**
 * ─── Mining (roadmap #99) ────────────────────────────────────────────────────
 *
 * Up to three outcrops a visit, each against the stone at the edge of the
 * walkable ground (D117), laid on a stream of their own after everything
 * else: a seed's packs, chests and herbs are what they were.
 *
 * The hero walks up to one and swings a pickaxe three times (D118). While he
 * mines nothing stops him: no damage, no knockback, no stun, no cancel. So
 * that this is not a shield to hide behind, mining only starts with no awake
 * enemy near. The outcrop gives one or two nuggets and is spent.
 *
 * The rock is solid (its cell is a block, walked around like a chest), so it
 * may never stand where it would close or narrow a way through: never in a
 * passage between two places, only against the wall of an open place, and
 * only where every cell reachable before is still reachable with it there.
 */

export interface OrePlan {
  x: number
  z: number
  kind: OreId
  /** Where the hero stands to swing: an open cell beside the rock. */
  sx: number
  sz: number
}
export interface OreState extends OrePlan {
  id: number
  spent: boolean
}

/** The hero mines from this far (centre to centre). */
export const MINE_REACH = 1.9
/** The prompt offers an outcrop this near. */
export const MINE_NEAR = 3.4
/** Three swings. */
export const MINE_TIME = 2.4
/** No awake enemy may be this near when mining starts. */
export const MINE_CLEAR = 8

const ORE_SALT = 0x510e527f

/** The eight neighbours, in order round the cell. */
const RING: ReadonlyArray<readonly [number, number]> = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]

/** A cell anything walks on (a door's pocket counts: it opens later). */
const openCell = (p: SpotPlan, k: number): boolean => !p.solid[k] && p.kind[k] !== K_WATER && p.kind[k] !== K_BLOCK && p.kind[k] !== K_CLIFF

/** How many cells can be walked to from the start (`shut`: one more blocked). */
const reachCount = (p: SpotPlan, shut: number): number => {
  const { w, h } = p
  const seen = new Uint8Array(w * h)
  const s = cellOf(p.start.z) * w + cellOf(p.start.x)
  if (!openCell(p, s)) return 0
  const free = (k: number): boolean => k !== shut && openCell(p, k)
  const q = [s]
  seen[s] = 1
  let n = 1
  while (q.length) {
    const k = q.pop()!
    const i = k % w
    const j = (k - i) / w
    for (const [di, dj] of RING) {
      const ni = i + di
      const nj = j + dj
      if (ni < 0 || nj < 0 || ni >= w || nj >= h) continue
      const nk = nj * w + ni
      if (seen[nk] || !free(nk)) continue
      // No cutting a corner between two blocked cells (as A* walks).
      if (di && dj && (!free(j * w + ni) || !free(nj * w + i))) continue
      seen[nk] = 1
      n++
      q.push(nk)
    }
  }
  return n
}

/**
 * Against the wall of an OPEN place, not in a passage: the open cells round
 * it form one unbroken arc (a rock there leaves no gap to squeeze through),
 * the ground runs on at least four cells (6 m) away from the wall, and the
 * place about it is mostly open.
 */
export const roomyWall = (p: SpotPlan, i: number, j: number): boolean => {
  const { w } = p
  let arcs = 0
  let ax = 0
  let az = 0
  for (let q = 0; q < 8; q++) {
    const [di, dj] = RING[q]!
    const [ei, ej] = RING[(q + 1) % 8]!
    const a = openCell(p, (j + dj) * w + i + di)
    const b = openCell(p, (j + ej) * w + i + ei)
    if (a && !b) arcs++
    if (!a) { ax -= di; az -= dj }
  }
  if (arcs !== 1) return false
  const l = Math.hypot(ax, az)
  if (l < 0.5) return false
  for (let s = 1; s <= 4; s++) {
    const ni = Math.round(i + (ax / l) * s)
    const nj = Math.round(j + (az / l) * s)
    if (ni < 0 || nj < 0 || ni >= w || nj >= p.h || !openCell(p, nj * w + ni)) return false
  }
  let open = 0
  for (let dj = -3; dj <= 3; dj++) {
    for (let di = -3; di <= 3; di++) {
      const ni = i + di
      const nj = j + dj
      if (ni >= 0 && nj >= 0 && ni < w && nj < p.h && openCell(p, nj * w + ni)) open++
    }
  }
  return open >= 28
}

/**
 * The outcrops a visit holds: reachable ground with stone on two to five of
 * its eight sides against the wall of an open place (`roomyWall`), off the
 * road and a cell clear of it, away from the start, the chests (beyond their
 * prompt), the herbs and each other; and never cutting anything off. Each
 * one's cell becomes a block.
 */
export const placeOres = (p: SpotPlan & { seed: number; cave?: Uint8Array }, level: number, avoid: ReadonlyArray<{ x: number; z: number }>): OrePlan[] => {
  const pool = oresAt(level)
  if (!pool.length) return []
  const rng = mulberry32((p.seed ^ ORE_SALT) >>> 0)
  const reach = walkableFrom(p.w, p.h, p.solid, p.sealed, p.start)
  const cand: number[] = []
  for (let j = 3; j < p.h - 3; j++) {
    for (let i = 3; i < p.w - 3; i++) {
      const k = j * p.w + i
      // Not in a cave: its ways are narrow and it is a place one goes into.
      if (!reach[k] || p.kind[k] !== K_GROUND || p.trail[k] || p.cave?.[k]) continue
      let rock = 0
      let road = false
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const nk = (j + dj) * p.w + i + di
          if ((di || dj) && p.solid[nk]) rock++
          if (p.trail[nk]) road = true
        }
      }
      if (rock < 2 || rock > 5 || road) continue
      if (!roomyWall(p, i, j)) continue
      const x = centerOf(i)
      const z = centerOf(j)
      if (Math.hypot(x - p.start.x, z - p.start.z) < 8) continue
      // Clear of a chest's prompt: the two never offer themselves at once.
      if (p.chests.some(c => Math.hypot(c.x - x, c.z - z) < 5)) continue
      if (avoid.some(c => Math.hypot(c.x - x, c.z - z) < 3)) continue
      cand.push(k)
    }
  }
  // The last zones are where the smith's endgame metals are mined: no thin visits.
  const lo = level >= LATE_ORE_LEVEL ? LATE_ORE_NODES_MIN : 1
  const n = lo + Math.floor(rng() * (ORE_NODES_MAX - lo + 1))
  const total = pool.reduce((s, q) => s + q.weight, 0)
  const out: OrePlan[] = []
  let before = -1
  for (let tries = 0; out.length < n && cand.length && tries < 300; tries++) {
    const k = cand[Math.floor(rng() * cand.length)]!
    const i = k % p.w
    const j = (k - i) / p.w
    const x = centerOf(i)
    const z = centerOf(j)
    if (out.some(o => Math.hypot(o.x - x, o.z - z) < 12)) continue
    let r = rng() * total
    let kind = pool[pool.length - 1]!.id
    for (const q of pool) {
      r -= q.weight
      if (r <= 0) { kind = q.id; break }
    }
    // Nothing reachable before may be lost behind it.
    if (before < 0) before = reachCount(p, -1)
    if (reachCount(p, k) !== before - 1) continue
    // The hero's place to swing: the open side nearest the camera.
    let stand = -1
    for (const [di, dj] of [[0, 1], [1, 0], [-1, 0], [0, -1]] as const) {
      const nk = (j + dj) * p.w + i + di
      if (openCell(p, nk) && p.kind[nk] === K_GROUND) { stand = nk; break }
    }
    if (stand < 0) continue
    p.kind[k] = K_BLOCK
    before--
    const si = stand % p.w
    out.push({ x, z, kind, sx: centerOf(si), sz: centerOf((stand - si) / p.w) })
  }
  return out
}

export const populateOres = (sim: Sim, ores: readonly OrePlan[]): void => {
  sim.ores = ores.map((o, id) => ({ ...o, id, spent: false }))
}

/** Why mining cannot start now ('' = it can). */
export const mineLock = (sim: Sim): '' | 'enemies' => {
  const u = sim.hero.unit
  for (const e of sim.units) {
    if (!e.alive || e.team !== 1) continue
    if (!e.awake) continue
    if (Math.hypot(e.x - u.x, e.z - u.z) < MINE_CLEAR) return 'enemies'
  }
  return ''
}

/** The outcrop nearest the hero within `maxDist`. */
export const nearOre = (sim: Sim, maxDist = MINE_NEAR): OreState | undefined => {
  const u = sim.hero.unit
  let best: OreState | undefined
  let bd = maxDist
  for (const o of sim.ores) {
    if (o.spent) continue
    const d = Math.hypot(o.x - u.x, o.z - u.z)
    if (d < bd) { bd = d; best = o }
  }
  return best
}

/** The outcrop under a ground point (a tap). */
export const pickOre = (sim: Sim, x: number, z: number, pad: number): OreState | undefined => {
  let best: OreState | undefined
  let bd = 0.9 + pad
  for (const o of sim.ores) {
    if (o.spent) continue
    const d = Math.hypot(o.x - x, o.z - z)
    if (d < bd) { bd = d; best = o }
  }
  return best
}

/** Send the hero to an outcrop. */
export const orderMine = (sim: Sim, id: number): boolean => {
  const o = sim.ores[id]
  const h = sim.hero
  if (!o || o.spent || !h.unit.alive || sim.ended === 'defeat' || sim.leaving) return false
  h.order.kind = 'mine'
  h.order.targetId = id
  h.order.x = o.x
  h.order.z = o.z
  h.queued = null
  h.unit.targetId = 0
  h.unit.repathT = 0
  return true
}

/** At the outcrop: three swings, and nothing stops them. */
export const beginMine = (sim: Sim, o: OreState): boolean => {
  const h = sim.hero
  const u = h.unit
  if (mineLock(sim)) {
    sim.emit({ t: 'mine', id: o.id, kind: o.kind, x: o.x, z: o.z, state: 'busy', n: 0 })
    return false
  }
  stop(u)
  face(u, o.x, o.z)
  u.action = newAction(u, 'mine', MINE_TIME, MINE_TIME + 0.15, 0, o.x, o.z)
  u.anim = 'cast'
  u.animT = 0
  u.animStyle = 0
  h.mining = o.id
  // Untouchable while the action lasts (`combat.ts` reads the action itself:
  // no shield is drawn over the swing).
  sim.emit({ t: 'mine', id: o.id, kind: o.kind, x: o.x, z: o.z, state: 'start', n: 0 })
  return true
}

/** The third swing lands: the nuggets are the hero's, the outcrop is spent. */
export const finishMine = (sim: Sim): void => {
  const h = sim.hero
  const o = sim.ores[h.mining]
  h.mining = -1
  if (!o || o.spent) return
  o.spent = true
  // On the ore's own stream, not the fight's dice.
  const n = 1 + (mulberry32((sim.seed ^ ORE_SALT ^ (o.id * 0x9e3779b1)) >>> 0)() < 0.5 ? 1 : 0)
  h.ores[o.kind] = (h.ores[o.kind] ?? 0) + n
  sim.emit({ t: 'mine', id: o.id, kind: o.kind, x: o.x, z: o.z, state: 'done', n })
}

/** Is the hero in a swing that nothing may stop (a chest's lid, the pickaxe)? */
export const committed = (sim: Sim): boolean => {
  const a = sim.hero?.unit.action
  return !!a && (a.id === 'open' || a.id === 'mine')
}
