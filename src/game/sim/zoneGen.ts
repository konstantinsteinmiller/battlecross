import type { TownDef, ZoneDef } from '../data/zones'
import { ENEMY_BY_ID } from '../data/enemies'
import { CELL, SOLID_LOW, SOLID_SEALED, SOLID_TERRAIN, type Grid } from './grid'
import { mulberry32, type Rng } from './rng'
import {
  K_BLOCK, K_CLIFF, K_WATER, addFeatures, noFeatures,
  type CavePlan, type ChestPlan, type CrossingPlan, type DoorPlan, type OptionalPackPlan, type PlatePlan, type PuzzlePlan,
  type RiverPlan, type SignPlan, type LedgePlan, type DaisPlan, type LobePlan
} from './zoneFeatures'
import { ZONE_RELIEF, type LiquidId } from '../data/zones'
import { buildRelief, buildTownRelief } from './relief'
import { layTown, type TownPlan } from './town'

/**
 * ─── Zone layouts ────────────────────────────────────────────────────────────
 *
 * A zone is a chain of clearings joined by short passes, cut out of solid
 * terrain (trees, rock, walls — the theme decides what the solid cells look
 * like). The hero starts in the first clearing, which is always empty; each
 * later one holds a pack, and the last holds the zone's finale. Seeded: the
 * same seed is the same zone, so a layout can be tested and a bug replayed.
 *
 * Over that chain a second, separately seeded pass lays what makes a visit
 * more than its fights (`zoneFeatures.ts`): chests, optional corners, a plate
 * puzzle, water, caves.
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
  /** What stands on each cell (`K_*` in `zoneFeatures.ts`): water, a bridge,
   *  stepping stones, a level prop, a pressure plate. */
  kind: Uint8Array
  /** 1 = inside a cave (the ground and the walls change their look). */
  cave: Uint8Array
  /** Door id + 1 of the hidden pocket the cell belongs to (0: none). Sealed
   *  cells are rock until their door opens. */
  sealed: Uint8Array
  /** 1 = opened by a side feature (a corner, an alcove, a cave): a small
   *  place the view must not hide behind tall scenery. */
  side: Uint8Array
  /** The ground's height at every grid CORNER, (w + 1) × (h + 1) of them
   *  (`sim/ground.ts` reads it). Cosmetic, except that a ledge's cliff edge is
   *  a `K_CLIFF` cell nobody walks across. */
  height: Float32Array
  clearings: Clearing[]
  start: { x: number; z: number }
  /** The MAIN chain's packs: one per clearing, the finale last. */
  packs: PackPlan[]
  /** Where the finale's chest and the secret chest stand (both are also in `chests`). */
  chest: { x: number; z: number } | null
  secret: { x: number; z: number } | null
  /** What fills the rivers and ponds (null: a dry place). */
  liquid: LiquidId | null
  /** Every chest of the visit, the finale's first. */
  chests: ChestPlan[]
  plates: PlatePlan[]
  puzzle: PuzzlePlan | null
  doors: DoorPlan[]
  /** Side packs off the main chain: they never count for the win. */
  optionalPacks: OptionalPackPlan[]
  caves: CavePlan[]
  rivers: RiverPlan[]
  ponds: Array<{ x: number; z: number; r: number }>
  crossings: CrossingPlan[]
  signs: SignPlan[]
  /** Ledges (a cliff edge with a ramp), the finale's dais, and the side places
   *  the relief lifts or sinks. */
  ledges: LedgePlan[]
  dais: DaisPlan | null
  lobes: LobePlan[]
  buildings: BuildingPlan[]
  npcs: NpcPlan[]
  /** A town's houses, props, places and people (`town.ts`); absent elsewhere. */
  town?: TownPlan
  /** Where arena waves come in. */
  gates: Array<[number, number]>
  /** The first visit of a new save: where the straw training dummy stands,
   *  by the road in the opening clearing (`coach/dummy.ts`). */
  dummy?: { x: number; z: number }
}

const W = 40

/**
 * The training dummy's spot: in the opening clearing, off to one side of the
 * road a few steps from the hero's spawn, on open ground, clear of the tutorial chest and
 * far enough from the first pack that hitting it never wakes them.
 */
const placeDummy = (solid: Uint8Array, h: number, cs: Array<{ i: number; j: number }>, chests: ReadonlyArray<{ x: number; z: number }>, pack: { x: number; z: number }): { x: number; z: number } | undefined => {
  const s = cs[0]!
  const n = cs[1]!
  const l = Math.hypot(n.i - s.i, n.j - s.j) || 1
  const ai = (n.i - s.i) / l
  const aj = (n.j - s.j) / l
  let best: { x: number; z: number } | undefined
  let bestD = -1
  // A few steps' walk from the hero's spawn (the walk is the first lesson),
  // a little up the road and to one side: in view both on an upright phone
  // (which shows barely two metres either side of him) and on a wide screen
  // (whose bottom edge is the skill bar). The farther side from the chest
  // wins, so the two are separate stops.
  for (const [off, along] of [[1.4, 1.8], [1.9, 1.2], [1.1, 2.1], [2.2, 0.6], [2.3, -0.3], [1.7, -1.7]] as const) {
    for (const side of [off, -off]) {
      const i = Math.round(s.i + ai * along - aj * side)
      const j = Math.round(s.j + aj * along + ai * side)
      if (i < 3 || j < 3 || i >= W - 3 || j >= h - 3) continue
      let open = true
      for (let dj = -1; dj <= 1 && open; dj++) for (let di = -1; di <= 1; di++) if (solid[(j + dj) * W + i + di]) { open = false; break }
      if (!open) continue
      const x = (i + 0.5) * CELL
      const z = (j + 0.5) * CELL
      // Far enough that walking up to it is a step of its own.
      if (Math.hypot((s.i + 0.5) * CELL - x, (s.j + 0.5) * CELL - z) < 3.3) continue
      if (Math.hypot(pack.x - x, pack.z - z) < 14) continue
      let near = 1e9
      for (const c of chests) near = Math.min(near, Math.hypot(c.x - x, c.z - z))
      if (near < 2.6) continue
      if (near > bestD) { bestD = near; best = { x, z } }
    }
    if (best) return best
  }
  return best
}

/**
 * Write a plan into a walk grid: terrain, water and level props (walked
 * around, seen over) and the sealed pockets (`doorsOpen`: as if every door had
 * opened). The sim's grid is this with the doors shut.
 */
export const fillGrid = (g: Grid, plan: ZonePlan, doorsOpen = false): Grid => {
  for (let k = 0; k < plan.solid.length; k++) {
    let v = plan.solid[k]! ? SOLID_TERRAIN : 0
    const kd = plan.kind[k]!
    if (kd === K_WATER || kd === K_BLOCK || kd === K_CLIFF) v |= SOLID_LOW
    if (plan.sealed[k]! && !doorsOpen) v |= SOLID_SEALED
    g.solid[k] = v
  }
  return g
}

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
  /** No water, caves, corners or side chests: the chain alone (measurements). */
  bare?: boolean
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
  let secretSlot: { k: number; side: number } | null = null
  const secretCells: number[] = []
  // The road as it runs before the secret's own path is cut.
  const road = trail.slice()
  const clearings: Clearing[] = cs.map((c, k) => ({
    x: (c.i + 0.5) * CELL, z: (c.j + 0.5) * CELL, r: c.r * CELL,
    role: k === 0 ? 'start' : k === n ? 'finale' : 'pack'
  }))
  if (def.secret && n >= 3) {
    const from = cs[Math.max(1, Math.floor(n / 2))]!
    const side = from.i > W / 2 ? -1 : 1
    const si = Math.max(6, Math.min(W - 7, from.i + side * 10))
    const sj = from.j - 2
    const rock = solid.slice()
    carveDisc(solid, W, h, si, sj, 2.6, rng)
    carveLine(solid, trail, W, h, from.i, from.j, si, sj, 1.1)
    // A small place off the road: the view keeps the scenery in front of it low.
    for (let k = 0; k < rock.length; k++) if (rock[k] && !solid[k]) secretCells.push(k)
    secret = { x: (si + 0.5) * CELL, z: (sj + 0.5) * CELL }
    secretSlot = { k: Math.max(1, Math.floor(n / 2)), side }
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

  // A secret is not signposted: no worn path leads to it.
  trail.set(road)

  const fin = clearings[n]!
  // The reward chest waits behind the finale.
  const chest = { x: fin.x, z: fin.z - fin.r * 0.55 }
  const kind = new Uint8Array(W * h)
  const cave = new Uint8Array(W * h)
  const sealed = new Uint8Array(W * h)
  const side = new Uint8Array(W * h)
  for (const k of secretCells) if (!solid[k]) side[k] = 1
  const features = addFeatures({ def, seed, w: W, h, solid, trail, kind, cave, sealed, side, cs, chest, secret, secretSlot, tutorial: !!o.tutorial, bare: !!o.bare })
  // The secret's pocket is a side place too: it lies a little above its clearing.
  const lobes = features.lobes.slice()
  if (secret && secretSlot) lobes.push({ x: secret.x, z: secret.z, r: 2.6 * CELL, k: secretSlot.k, lift: 0.35 })
  const height = buildRelief({
    seed, w: W, h, kind, trail, cs, lobes, ledges: features.ledges, dais: features.dais, rivers: features.rivers, crossings: features.crossings,
    relief: ZONE_RELIEF[def.id], tutorial: !!o.tutorial
  })
  return {
    seed, w: W, h, solid, trail, kind, cave, sealed, side, height, clearings,
    start: { x: clearings[0]!.x, z: clearings[0]!.z },
    packs,
    chest,
    secret,
    ...features,
    buildings: [],
    npcs: [],
    gates: [],
    // The first visit opens on a calm beat: a dummy to learn to fight on.
    ...(o.tutorial ? { dummy: placeDummy(solid, h, cs, features.chests, packs[0]!) } : {})
  }
}

/**
 * A town: rows of houses facing the camera along two streets, a square in the
 * middle, the green the road comes in by (`town.ts` lays it out and dresses
 * it). Its people are `npcs` (the cast) and `town.people` (everybody).
 */
export const generateTown = (def: TownDef, flags: ReadonlySet<string>, seed: number): ZonePlan => {
  const t = layTown(def, flags, seed)
  const { w, h } = t
  // Everyone's spot and every house stands level on the gentle slope.
  const level: Array<{ x: number; z: number }> = t.town.people.map(p => ({ x: p.x, z: p.z }))
  for (const s of t.town.spots) level.push({ x: s.x, z: s.z })
  for (const p of t.town.props) if (p.cells.length) level.push({ x: p.x, z: p.z })
  return {
    seed, w, h, solid: t.solid, trail: t.trail, kind: t.kind, cave: new Uint8Array(w * h), sealed: new Uint8Array(w * h),
    side: new Uint8Array(w * h),
    // A gentle slope, with every house and every townsperson on level ground.
    height: buildTownRelief(w, h, seed, t.buildings, level),
    ...noFeatures(),
    clearings: [{ x: (w / 2) * CELL, z: (h / 2) * CELL, r: Math.min(w, h) * 0.45 * CELL, role: 'start' }],
    start: t.start,
    packs: [],
    chest: null,
    secret: null,
    buildings: t.buildings,
    npcs: t.npcs,
    gates: [],
    town: t.town
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
    seed, w, h, solid, trail, kind: new Uint8Array(w * h), cave: new Uint8Array(w * h), sealed: new Uint8Array(w * h),
    side: new Uint8Array(w * h),
    // The colosseum's sand is raked flat.
    height: new Float32Array((w + 1) * (h + 1)),
    ...noFeatures(),
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
