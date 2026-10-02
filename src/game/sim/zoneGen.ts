import type { TownDef, ZoneDef } from '../data/zones'
import { ENEMY_BY_ID } from '../data/enemies'
import { CELL } from './grid'
import { mulberry32, type Rng } from './rng'

/**
 * ─── Zone layouts ────────────────────────────────────────────────────────────
 *
 * A zone is a chain of clearings joined by short passes, cut out of solid
 * terrain (trees, rock, walls — the theme decides what the solid cells look
 * like). The hero starts in the first clearing, which is always empty; each
 * later one holds a pack, and the last holds the zone's finale. Seeded: the
 * same seed is the same zone, so a layout can be tested and a bug replayed.
 *
 * Pure: it returns a plan (which cells are solid, where things stand). The sim
 * spawns from it and the view builds meshes from it.
 */

export interface Clearing {
  /** Centre in metres, and radius in metres. */
  x: number
  z: number
  r: number
  role: 'start' | 'pack' | 'finale' | 'secret'
}

export interface PackPlan {
  x: number
  z: number
  r: number
  kinds: string[]
  finale: boolean
  /** The finale's leader kind ('' for an ordinary pack). */
  boss: string
}

export interface BuildingPlan {
  x: number
  z: number
  /** Footprint in metres. */
  w: number
  d: number
  style: number
}

export interface NpcPlan {
  id: string
  look: string
  x: number
  z: number
  facing: number
}

export interface ZonePlan {
  seed: number
  w: number
  h: number
  /** 1 = solid terrain. */
  solid: Uint8Array
  /** 1 = a worn trail (the passes and the way through each clearing). */
  trail: Uint8Array
  clearings: Clearing[]
  start: { x: number; z: number }
  packs: PackPlan[]
  chest: { x: number; z: number } | null
  secret: { x: number; z: number } | null
  buildings: BuildingPlan[]
  npcs: NpcPlan[]
  /** Where arena waves come in. */
  gates: Array<[number, number]>
}

const W = 40

const carveDisc = (solid: Uint8Array, w: number, h: number, ci: number, cj: number, r: number, rng: Rng): void => {
  // A lumpy edge: the radius wobbles with the bearing, so no clearing is a
  // perfect circle.
  const lobes = 3 + Math.floor(rng() * 3)
  const ph = rng() * Math.PI * 2
  const amp = 0.1 + rng() * 0.08
  const R = Math.ceil(r) + 1
  for (let dj = -R; dj <= R; dj++) {
    for (let di = -R; di <= R; di++) {
      const i = ci + di
      const j = cj + dj
      if (i < 2 || j < 2 || i >= w - 2 || j >= h - 2) continue
      const d = Math.hypot(di, dj)
      const a = Math.atan2(dj, di)
      if (d <= r * (1 + amp * Math.sin(a * lobes + ph))) solid[j * w + i] = 0
    }
  }
}

const carveLine = (solid: Uint8Array, trail: Uint8Array, w: number, h: number, ai: number, aj: number, bi: number, bj: number, half: number): void => {
  const n = Math.max(1, Math.ceil(Math.hypot(bi - ai, bj - aj) * 2))
  for (let s = 0; s <= n; s++) {
    const ci = ai + ((bi - ai) * s) / n
    const cj = aj + ((bj - aj) * s) / n
    const R = Math.ceil(half)
    for (let dj = -R; dj <= R; dj++) {
      for (let di = -R; di <= R; di++) {
        const i = Math.round(ci + di)
        const j = Math.round(cj + dj)
        if (i < 2 || j < 2 || i >= w - 2 || j >= h - 2) continue
        const d = Math.hypot(i - ci, j - cj)
        if (d <= half) solid[j * w + i] = 0
        if (d <= 0.9) trail[j * w + i] = 1
      }
    }
  }
}

const weighted = (rng: Rng, kinds: ZoneDef['kinds']): string => {
  let total = 0
  for (const k of kinds) total += k.w
  let r = rng() * total
  for (const k of kinds) {
    r -= k.w
    if (r <= 0) return k.kind
  }
  return kinds[0]!.kind
}

export interface ZoneGenOpts {
  /** The very first visit: a soft opening pack close to the start. */
  tutorial?: boolean
  /** A hostile faction's ambush pack (unit kind). */
  ambush?: string | null
  /** Extra enemies per pack (a quest left the zone infested). */
  extra?: number
}

export const generateZone = (def: ZoneDef, seed: number, o: ZoneGenOpts = {}): ZonePlan => {
  const rng = mulberry32(seed)
  const boss = ENEMY_BY_ID[def.finale.leader]?.rank === 'boss'
  const n = def.sections
  const step = 11
  const h = 16 + n * step + (boss ? 6 : 3)
  const solid = new Uint8Array(W * h).fill(1)
  const trail = new Uint8Array(W * h)

  // Centres, from the bottom of the map (near the camera) upward.
  const cs: Array<{ i: number; j: number; r: number }> = []
  let ci = W / 2 + Math.round((rng() - 0.5) * 6)
  let cj = h - 8
  cs.push({ i: ci, j: cj, r: 4.2 })
  for (let k = 1; k <= n; k++) {
    const last = k === n
    const r = last ? (boss ? 7.4 : 6.4) : 4.6 + rng() * 1.4
    cj -= step + (last && boss ? 2 : 0) + Math.round(rng() * 1.5)
    ci = Math.max(Math.ceil(r) + 3, Math.min(W - Math.ceil(r) - 4, ci + Math.round((rng() - 0.5) * 16)))
    cs.push({ i: ci, j: cj, r })
  }
  for (let k = 0; k < cs.length; k++) {
    const c = cs[k]!
    carveDisc(solid, W, h, c.i, c.j, c.r, rng)
    if (k > 0) carveLine(solid, trail, W, h, cs[k - 1]!.i, cs[k - 1]!.j, c.i, c.j, 1.7)
  }

  // A side pocket for a secret chest, off one of the middle clearings.
  let secret: { x: number; z: number } | null = null
  const clearings: Clearing[] = cs.map((c, k) => ({
    x: (c.i + 0.5) * CELL, z: (c.j + 0.5) * CELL, r: c.r * CELL,
    role: k === 0 ? 'start' : k === n ? 'finale' : 'pack'
  }))
  if (def.secret && n >= 3) {
    const from = cs[Math.max(1, Math.floor(n / 2))]!
    const side = from.i > W / 2 ? -1 : 1
    const si = Math.max(6, Math.min(W - 7, from.i + side * 10))
    const sj = from.j - 2
    carveDisc(solid, W, h, si, sj, 2.6, rng)
    carveLine(solid, trail, W, h, from.i, from.j, si, sj, 1.1)
    secret = { x: (si + 0.5) * CELL, z: (sj + 0.5) * CELL }
    clearings.push({ x: secret.x, z: secret.z, r: 2.6 * CELL, role: 'secret' })
  }

  // Boulders and stumps inside the clearings: cover to fight round, never on
  // the trail and never in the middle.
  for (let k = 1; k < cs.length; k++) {
    const c = cs[k]!
    const count = 2 + Math.floor(rng() * 3)
    for (let q = 0; q < count; q++) {
      const a = rng() * Math.PI * 2
      const d = c.r * (0.5 + rng() * 0.3)
      const i = Math.round(c.i + Math.cos(a) * d)
      const j = Math.round(c.j + Math.sin(a) * d)
      if (i < 3 || j < 3 || i >= W - 3 || j >= h - 3) continue
      let nearTrail = false
      for (let dj = -2; dj <= 2 && !nearTrail; dj++) {
        for (let di = -2; di <= 2; di++) if (trail[(j + dj) * W + i + di]) { nearTrail = true; break }
      }
      if (!nearTrail) solid[j * W + i] = 1
    }
  }

  // Packs.
  const packs: PackPlan[] = []
  for (let k = 1; k <= n; k++) {
    const c = clearings[k]!
    const last = k === n
    if (last) {
      packs.push({ x: c.x, z: c.z, r: c.r, kinds: [def.finale.leader, ...def.finale.with], finale: true, boss: def.finale.leader })
      continue
    }
    let size = def.pack[0] + Math.floor(rng() * (def.pack[1] - def.pack[0] + 1)) + (o.extra ?? 0)
    const kinds: string[] = []
    if (o.tutorial && k === 1) {
      // Two plain goblins: something to learn the controls on.
      kinds.push(def.kinds[0]!.kind, def.kinds[0]!.kind)
      size = 0
    }
    let elites = 0
    for (let q = 0; q < size; q++) {
      let kind = weighted(rng, def.kinds)
      if (ENEMY_BY_ID[kind]?.rank === 'elite') {
        if (elites > 0) kind = def.kinds[0]!.kind
        else elites++
      }
      kinds.push(kind)
    }
    packs.push({ x: c.x, z: c.z, r: c.r, kinds, finale: false, boss: '' })
  }
  // A hostile faction lies in wait in one of the middle clearings.
  if (o.ambush && packs.length >= 2) {
    const p = packs[Math.floor(rng() * (packs.length - 1))]!
    p.kinds.push(o.ambush, o.ambush)
  }

  const fin = clearings[n]!
  return {
    seed, w: W, h, solid, trail, clearings,
    start: { x: clearings[0]!.x, z: clearings[0]!.z },
    packs,
    // The reward chest waits behind the finale.
    chest: { x: fin.x, z: fin.z - fin.r * 0.55 },
    secret,
    buildings: [],
    npcs: [],
    gates: []
  }
}

/** A town: an open square ringed by houses, its people standing in it. */
export const generateTown = (def: TownDef, flags: ReadonlySet<string>, seed: number): ZonePlan => {
  const rng = mulberry32(seed)
  const w = 30
  const h = 30
  const solid = new Uint8Array(w * h).fill(1)
  const trail = new Uint8Array(w * h)
  carveDisc(solid, w, h, w / 2, h / 2, 11.5, rng)
  // Streets: a cross through the square.
  carveLine(solid, trail, w, h, w / 2, 4, w / 2, h - 4, 1.6)
  carveLine(solid, trail, w, h, 5, h / 2, w - 5, h / 2, 1.2)

  const buildings: BuildingPlan[] = []
  const npcs: NpcPlan[] = []
  const span = 17 * CELL
  const ox = (w / 2) * CELL - span / 2
  const oz = (h / 2) * CELL - span / 2
  const present = def.npcs.filter(n => (!n.needs || n.needs.every(f => flags.has(f))) && !(n.not && n.not.some(f => flags.has(f))))
  for (const n of present) npcs.push({ id: n.id, look: n.look, x: ox + n.at[0] * span, z: oz + n.at[1] * span, facing: 0 })

  // Shops and trainers stand in front of their house. A house is only built
  // where it swallows nobody: its footprint must leave every person's cell
  // (and the cells around it) open, or that person could not be walked up to.
  const keep = new Uint8Array(w * h)
  for (const p of npcs) {
    const ci = Math.floor(p.x / CELL)
    const cj = Math.floor(p.z / CELL)
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const i = ci + di
      const j = cj + dj
      if (i >= 0 && j >= 0 && i < w && j < h) keep[j * w + i] = 1
    }
  }
  const built = new Uint8Array(w * h)
  const footprint = (bx: number, bz: number, bw: number, bd: number): number[] | null => {
    const cells: number[] = []
    const i0 = Math.floor((bx - bw / 2) / CELL)
    const i1 = Math.floor((bx + bw / 2) / CELL)
    const j0 = Math.floor((bz - bd / 2) / CELL)
    const j1 = Math.floor((bz + bd / 2) / CELL)
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        if (i < 0 || j < 0 || i >= w || j >= h) return null
        const k = j * w + i
        if (keep[k] || built[k] || trail[k]) return null
        cells.push(k)
      }
    }
    return cells
  }
  for (let n = 0; n < present.length; n++) {
    const def1 = present[n]!
    if (def1.role !== 'shop' && def1.role !== 'trainer') continue
    const p = npcs[n]!
    const bw = 4.2 + rng() * 1.2
    const bd = 3.6 + rng() * 0.8
    const style = Math.floor(rng() * 4)
    // Behind them first; then further back, then to either side.
    const back = bd / 2 + 2.2
    const side = bw / 2 + 2.4
    const tries: Array<[number, number]> = [
      [0, -back], [0, -back - CELL], [-CELL, -back], [CELL, -back], [-2 * CELL, -back], [2 * CELL, -back],
      [-CELL, -back - CELL], [CELL, -back - CELL], [0, -back - 2 * CELL],
      // Someone standing on a street has their house beside them.
      [-side, -CELL], [side, -CELL], [-side, 0], [side, 0], [-side - CELL, -CELL], [side + CELL, -CELL],
      [-3 * CELL, -back], [3 * CELL, -back]
    ]
    for (const [dx, dz] of tries) {
      const cells = footprint(p.x + dx, p.z + dz, bw, bd)
      if (!cells) continue
      for (const k of cells) { built[k] = 1; solid[k] = 1 }
      buildings.push({ x: p.x + dx, z: p.z + dz, w: bw, d: bd, style })
      break
    }
  }
  return {
    seed, w, h, solid, trail,
    clearings: [{ x: (w / 2) * CELL, z: (h / 2) * CELL, r: 11.5 * CELL, role: 'start' }],
    start: { x: (w / 2) * CELL, z: oz + span * 0.9 },
    packs: [],
    chest: null,
    secret: null,
    buildings,
    npcs,
    gates: []
  }
}

/** The colosseum: one ring, gates all round it. */
export const generateArena = (seed: number): ZonePlan => {
  const rng = mulberry32(seed)
  const w = 30
  const h = 30
  const solid = new Uint8Array(w * h).fill(1)
  const trail = new Uint8Array(w * h)
  const R = 10
  // A true circle here: an arena has walls, not a tree line.
  for (let j = 2; j < h - 2; j++) for (let i = 2; i < w - 2; i++) if (Math.hypot(i + 0.5 - w / 2, j + 0.5 - h / 2) <= R) solid[j * w + i] = 0
  const gates: Array<[number, number]> = []
  const off = rng() * Math.PI
  for (let k = 0; k < 6; k++) {
    const a = off + (k / 6) * Math.PI * 2
    gates.push([(w / 2 + Math.cos(a) * (R - 1.6)) * CELL, (h / 2 + Math.sin(a) * (R - 1.6)) * CELL])
  }
  return {
    seed, w, h, solid, trail,
    clearings: [{ x: (w / 2) * CELL, z: (h / 2) * CELL, r: R * CELL, role: 'finale' }],
    start: { x: (w / 2) * CELL, z: (h / 2) * CELL },
    packs: [],
    chest: { x: (w / 2) * CELL, z: (h / 2) * CELL },
    secret: null,
    buildings: [],
    npcs: [],
    gates
  }
}
