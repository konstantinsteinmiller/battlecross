import type { ZoneDef } from '../data/zones'
import { ENEMY_BY_ID } from '../data/enemies'
import { CELL, SOLID_LOW, SOLID_ROUND, SOLID_SEALED, SOLID_TERRAIN, type Grid } from './grid'
import { mulberry32, type Rng } from './rng'
import {
  K_BLOCK, K_BRIDGE, K_CLIFF, K_FORD, K_GROUND, K_WATER, addFeatures, noFeatures,
  type CavePlan, type ChestPlan, type CrossingPlan, type DoorPlan, type OptionalPackPlan, type PlatePlan, type PuzzlePlan,
  type RiverPlan, type SignPlan, type LedgePlan, type DaisPlan, type LobePlan, type BranchPlan, type ForkPlan
} from './zoneFeatures'
import { ZONE_BRANCHES, ZONE_RELIEF, ZONE_SHAPE, type LiquidId, type ZoneShape } from '../data/zones'
import { buildRelief } from './relief'
import type { TownPlan } from './town'
import { placeHerbs, placePieces, placeTreasure, type HerbPlan, type PiecePlan } from './herbs'
import { placeOres, type OrePlan } from './ores'
import { placeCage } from './cages'
import { CAMP_ROOM, carveCamp, dressCamp, type CampPlan } from './camp'
import { LAID_SHAPES, carveDisc, carveLine, carveRect, layOut, layoutHeight, wallFace, type Chamber, type Fixture, type Guide, type Laid } from './layouts'
import { dressPlace, makeDresser, type DressPlan } from './dressing'
import { widenWays, type Target } from './widen'
import { INVASION } from '../data/invasion'

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
  /** The ways off the main road (roadmap #70) and the signposts at their forks. */
  branches: BranchPlan[]
  forks: ForkPlan[]
  buildings: BuildingPlan[]
  npcs: NpcPlan[]
  /** A town's houses, props, places and people (`town.ts`); absent elsewhere. */
  town?: TownPlan
  /** Where arena waves come in. */
  gates: Array<[number, number]>
  /** The first visit of a new save: where the straw training dummy stands,
   *  by the road in the opening clearing (`coach/dummy.ts`). */
  dummy?: { x: number; z: number }
  /** Herbs growing in the wild this visit (roadmap #88), walked over to pick. */
  herbs?: HerbPlan[]
  /** Ore outcrops against the stone (roadmap #99). */
  ores?: OrePlan[]
  /** A cage's key lying in the place (roadmap #100); the cage is a chest. */
  cageKey?: { x: number; z: number }
  /** The treasure map's pieces lying here (roadmap #89). */
  pieces?: PiecePlan[]
  /** The first visit's camp of rescued teachers past the finale (roadmap #156); its cage is a chest. */
  camp?: CampPlan
  /** An escort (roadmap #85): the caravan's road, x, z pairs from start to end. */
  caravan?: { path: number[] }
  /** A field's standing crop (the field layout, #103): 1 where wheat grows.
   *  The view's alone: the cells are open ground for everything else. */
  crop?: Uint8Array
  /** The place's set pieces (#120): beds, fires, mills, columns, timbers… */
  dressing?: DressPlan[]
  /** Rock that is a built wall (#120): 1 dressed stone, 2 a crumbling ruin. */
  masonry?: Uint8Array
  /** An invaded zone (the afterplay, `sim/invasion.ts`): a demon pylon in each section. */
  pylons?: Array<{ x: number; z: number }>
}

/** The main chain's width (cells): the road wanders inside it. */
const W = 40
/** The streams a layout and its set pieces draw from (#120). */
const LAYOUT_SALT = 0x2c71e3b5
const DRESS_SALT = 0x4d17a9c3
const PYLON_SALT = 0x71c3a5e9
/** Rock either side of the chain where the branches run (roadmap #70): the
 *  chain is laid exactly as in a 40-wide zone, then set this far in. */
export const BRANCH_MARGIN = 10

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
 * opened). The sim's grid is this with the doors shut. A level prop that is
 * not a set piece (a chest, a post, an ore rock) stops a body by its round
 * footprint (`SOLID_ROUND`); a set piece covers its cells and stops by them,
 * and so do a cage (its bars stand at the cell's corners) and the carved
 * hint stone (three cells wide: `hintCells`).
 */
export const fillGrid = (g: Grid, plan: ZonePlan, doorsOpen = false): Grid => {
  const round = new Uint8Array(plan.solid.length)
  const at = (p: { x: number; z: number }): void => { round[Math.floor(p.z / CELL) * plan.w + Math.floor(p.x / CELL)] = 1 }
  for (const c of plan.chests) if (c.role !== 'cage') at(c)
  plan.signs.forEach(at)
  plan.forks.forEach(at)
  plan.ores?.forEach(at)
  for (const d of plan.dressing ?? []) for (const k of d.cells) round[k] = 0
  for (let k = 0; k < plan.solid.length; k++) {
    let v = plan.solid[k]! ? SOLID_TERRAIN : 0
    const kd = plan.kind[k]!
    if (kd === K_WATER || kd === K_BLOCK || kd === K_CLIFF) v |= SOLID_LOW
    if (kd === K_BLOCK && round[k]) v |= SOLID_ROUND
    if (plan.sealed[k]! && !doorsOpen) v |= SOLID_SEALED
    g.solid[k] = v
  }
  return g
}

/** Every place one goes to in a plan (`widen.ts`): packs, chests (where one
 *  stands to open them), plates, caves, posts, herbs, ore, map pieces, a key. */
export const waysTo = (p: Pick<ZonePlan, 'packs' | 'optionalPacks' | 'chests' | 'plates' | 'puzzle' | 'caves' | 'signs' | 'forks' | 'herbs' | 'ores' | 'pieces' | 'cageKey'>): Target[] => [
  ...p.packs, ...p.optionalPacks, ...p.chests.map(c => ({ x: c.sx, z: c.sz })), ...p.plates,
  ...(p.puzzle ? [p.puzzle.hint] : []),
  ...p.caves.flatMap(c => [c.mouth, c]),
  ...p.signs, ...p.forks,
  ...(p.herbs ?? []), ...(p.ores ?? []).map(o => ({ x: o.sx, z: o.sz })), ...(p.pieces ?? []),
  ...(p.cageKey ? [p.cageKey] : [])
]

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
  /** The opening fight's pack size after its first pack (`OPENING.pack`). */
  openingPack?: number
  /** A hostile faction's ambush pack (unit kind). */
  ambush?: string | null
  /** Extra enemies per pack (a quest left the zone infested). */
  extra?: number
  /** No water, caves, corners or side chests: the chain alone (measurements). */
  bare?: boolean
  /** False: the zone as one road, without its branches or the rock they run
   *  through (the perf A/B arm of roadmap #70). */
  branches?: boolean
  /** The treasure map's pieces still lying in this zone (roadmap #89). */
  pieces?: readonly string[]
  /** The map is whole: the buried chest is here under its X. */
  treasure?: boolean
  /** Somebody is held here in a cage (roadmap #100). */
  cage?: boolean
}

export const generateZone = (def: ZoneDef, seed: number, o: ZoneGenOpts = {}): ZonePlan => {
  const rng = mulberry32(seed)
  const boss = ENEMY_BY_ID[def.finale.leader]?.rank === 'boss'
  const n = def.sections
  const step = 11
  // The place's own layout (#103, #120); the first visit and a bare chain are always the chain.
  const shape: ZoneShape = o.tutorial || o.bare ? 'chain' : ZONE_SHAPE[def.id] ?? 'chain'
  // The first visit has room above its finale for the rescued teachers' camp (#156).
  const h = layoutHeight(shape, n, boss) + (o.tutorial && !o.bare ? CAMP_ROOM : 0)
  // A zone with branches has rock either side of its chain for them to run
  // through; the tutorial's single road and the bare chain do not.
  const M = o.tutorial || o.bare || o.branches === false ? 0 : BRANCH_MARGIN
  const Wd = W + 2 * M
  const solid = new Uint8Array(Wd * h).fill(1)
  const trail = new Uint8Array(Wd * h)

  // Centres, from the bottom of the map (near the camera) upward, drawn in
  // the chain's own 40 columns and then set in by the margin.
  let cs: Array<{ i: number; j: number; r: number }> = []
  /** Each clearing's room, where it is one (a temple's chamber, a gallery, a court). */
  let chambers: Array<Chamber | null> = []
  /** What the layout builds in, the liquid it lies in, its crossings and walls (`layouts.ts`). */
  let laid: Laid | null = null
  const fixtures: Fixture[] = []
  const guides: Guide[] = []
  /** Rock drawn as built wall: 1 dressed, 2 a ruin. */
  const masonry = new Uint8Array(Wd * h)
  // The layout's own stream: what it adds draws nothing from the plan's.
  const lrng = mulberry32((seed ^ LAYOUT_SALT) >>> 0)
  if (LAID_SHAPES.has(shape)) {
    laid = layOut({ shape, rng, lrng, n, boss, W, M, w: Wd, h, solid, trail })
    cs = laid.cs
    chambers = laid.chambers
    fixtures.push(...laid.fixtures)
    guides.push(...laid.guides)
    for (const k of laid.masonry) masonry[k] = 1
  } else {
    /** A room's half-size (the rooms layout): its clearing's r is the larger. */
    const rooms: Array<{ hw: number; hh: number }> = []
    let ci = W / 2 + Math.round((rng() - 0.5) * 6)
    let cj = h - 8
    // A temple is entered on its axis: the halls line up above the entrance,
    // their corridors running straight up (a long sideways leg would cross the
    // rock the side ways run through).
    if (shape === 'rooms') ci = W / 2
    // The tundra's road starts below its lake.
    if (shape === 'ring') ci = W / 2 - 8
    cs.push({ i: ci + M, j: cj, r: 4.2 })
    rooms.push({ hw: 4, hh: 3.5 })
    for (let k = 1; k <= n; k++) {
      const last = k === n
      if (shape === 'ring') {
        // Round the frozen lake: up its right shore, and over its head to the end.
        const r = last ? (boss ? 7.4 : 6.4) : 4.4 + rng() * 1
        cj -= step + (last && boss ? 2 : 0) + Math.round(rng() * 1.5)
        ci = last ? W / 2 - 7 : W - Math.ceil(r) - 5 - Math.round(rng() * 2)
        cs.push({ i: ci + M, j: cj, r })
      } else if (shape === 'field') {
        // Wide fields of wheat, to one side and the other: the path zig-zags
        // from field to field.
        const r = last ? (boss ? 7.4 : 6.6) : 5.6 + rng() * 1.2
        cj -= step + (last && boss ? 2 : 0) + Math.round(rng() * 1.5)
        const sideI = k % 2 ? W / 2 + 5 : W / 2 - 5
        ci = Math.max(Math.ceil(r) + 3, Math.min(W - Math.ceil(r) - 4, last ? W / 2 : sideI + Math.round((rng() - 0.5) * 4)))
        cs.push({ i: ci + M, j: cj, r })
      } else if (shape === 'rooms') {
        // Halls to one side and the other of the middle, the last the great hall.
        const hw = last ? (boss ? 8 : 7) : 4.5 + Math.round(rng() * 2)
        const hh = last ? (boss ? 6.5 : 5.5) : 3.5 + Math.round(rng() * 1.5)
        cj -= step + (last && boss ? 2 : 0) + Math.round(rng() * 1.5)
        const sideI = k % 2 ? W / 2 + 2 : W / 2 - 2
        ci = Math.max(hw + 3, Math.min(W - hw - 4, last ? W / 2 : sideI + Math.round((rng() - 0.5) * 2)))
        cs.push({ i: ci + M, j: cj, r: Math.max(hw, hh) })
        rooms.push({ hw, hh })
      } else {
        const r = last ? (boss ? 7.4 : 6.4) : 4.6 + rng() * 1.4
        cj -= step + (last && boss ? 2 : 0) + Math.round(rng() * 1.5)
        ci = Math.max(Math.ceil(r) + 3, Math.min(W - Math.ceil(r) - 4, ci + Math.round((rng() - 0.5) * 16)))
        cs.push({ i: ci + M, j: cj, r })
      }
    }
    for (let k = 0; k < cs.length; k++) {
      const c = cs[k]!
      if (shape === 'rooms' && k > 0) {
        // A chamber of the ruined temple: a rectangle, entered through the
        // passage's doorway; and the way from the last one, straight up and
        // then across.
        const { hw, hh } = rooms[k]!
        const room = { i0: Math.round(c.i - hw), j0: Math.round(c.j - hh), i1: Math.round(c.i + hw), j1: Math.round(c.j + hh) }
        carveRect(solid, Wd, h, room.i0, room.j0, room.i1, room.j1)
        chambers.push(room)
        const p = cs[k - 1]!
        carveLine(solid, trail, Wd, h, p.i, p.j, p.i, c.j, 1.2)
        carveLine(solid, trail, Wd, h, p.i, c.j, c.i, c.j, 1.2)
        // A colonnade a step in from the walls, a column every other cell, a
        // few of them fallen to stumps (the doorways keep clear: `dressing.ts`).
        const at = (i: number, j: number): void => { fixtures.push({ kind: lrng() < 0.22 ? 'brokenColumn' : 'column', i, j, a: 0 }) }
        for (let i = room.i0 + 1; i <= room.i1 - 1; i += 2) { at(i, room.j0 + 1); at(i, room.j1 - 1) }
        for (let j = room.j0 + 3; j <= room.j1 - 3; j += 2) { at(room.i0 + 1, j); at(room.i1 - 1, j) }
      } else {
        chambers.push(null)
        carveDisc(solid, Wd, h, c.i, c.j, c.r, rng)
        // The field's lanes are wider than a pass; the woods' trails narrower.
        const half = shape === 'field' ? 2.4 : shape === 'glades' ? 1.3 : 1.7
        if (k > 0 && shape === 'glades') {
          // A trail through deep forest: it winds, out to one side and back.
          const p = cs[k - 1]!
          const dx = c.i - p.i
          const dz = c.j - p.j
          const l = Math.hypot(dx, dz) || 1
          const bend = (lrng() < 0.5 ? -1 : 1) * (3 + lrng() * 2.5)
          const pts: Array<[number, number]> = []
          for (let s = 0; s <= 12; s++) {
            const t = s / 12
            const off = bend * Math.sin(t * Math.PI) + 1.2 * Math.sin(t * Math.PI * 3)
            pts.push([p.i + dx * t - (dz / l) * off, p.j + dz * t + (dx / l) * off])
          }
          for (let s = 1; s < pts.length; s++) carveLine(solid, trail, Wd, h, pts[s - 1]![0], pts[s - 1]![1], pts[s]![0], pts[s]![1], half)
        } else if (k > 0) carveLine(solid, trail, Wd, h, cs[k - 1]!.i, cs[k - 1]!.j, c.i, c.j, half)
      }
    }
  }
  // The temple's chambers stand in crumbling walls.
  if (shape === 'rooms') for (const k of wallFace(solid, Wd, h, chambers)) masonry[k] = 2
  // The first visit's chain keeps the edge it had before the camp's rows were
  // added above it (#156): the boss's floor is the floor the opening fight was
  // tuned on; only the camp's own way opens it up (`carveCamp`).
  if (h !== layoutHeight(shape, n, boss)) solid.fill(1, 0, (CAMP_ROOM + 2) * Wd)

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
    const fromK = laid?.secretFrom ?? Math.max(1, Math.floor(n / 2))
    const from = cs[fromK]!
    const side = from.i - M > W / 2 ? -1 : 1
    const si = M + Math.max(6, Math.min(W - 7, from.i - M + side * 10))
    const sj = from.j - 2
    const rock = solid.slice()
    carveDisc(solid, Wd, h, si, sj, 2.6, rng)
    carveLine(solid, trail, Wd, h, from.i, from.j, si, sj, 1.1)
    // A small place off the road: the view keeps the scenery in front of it low.
    for (let k = 0; k < rock.length; k++) if (rock[k] && !solid[k]) secretCells.push(k)
    secret = { x: (si + 0.5) * CELL, z: (sj + 0.5) * CELL }
    secretSlot = { k: fromK, side }
    clearings.push({ x: secret.x, z: secret.z, r: 2.6 * CELL, role: 'secret' })
  }

  // Boulders and stumps inside the clearings: cover to fight round, never on
  // the trail and never in the middle. (A temple's chambers have their
  // columns; a built place has none.)
  const liquidAt = new Uint8Array(Wd * h)
  if (laid) for (const k of laid.water) liquidAt[k] = 1
  for (let k = 1; k < cs.length && shape !== 'rooms' && (!laid || laid.boulders); k++) {
    const c = cs[k]!
    const count = 2 + Math.floor(rng() * 3)
    for (let q = 0; q < count; q++) {
      const a = rng() * Math.PI * 2
      const d = c.r * (0.5 + rng() * 0.3)
      const i = Math.round(c.i + Math.cos(a) * d)
      const j = Math.round(c.j + Math.sin(a) * d)
      if (i < 3 || j < 3 || i >= Wd - 3 || j >= h - 3) continue
      let nearTrail = false
      for (let dj = -2; dj <= 2 && !nearTrail; dj++) {
        for (let di = -2; di <= 2; di++) if (trail[(j + dj) * Wd + i + di]) { nearTrail = true; break }
      }
      // Never in the lava or the void a layout opened round its ways.
      if (!nearTrail && !liquidAt[j * Wd + i]) solid[j * Wd + i] = 1
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
    } else if (o.tutorial && o.openingPack) size = o.openingPack
    let elites = 0
    // Half-way along the road, an old boss leads the pack (D85).
    if (def.midBoss && !o.tutorial && k === Math.ceil(n / 2)) {
      kinds.push(def.midBoss)
      elites = 1
      size = Math.max(1, size - 1)
    }
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

  // The tundra's frozen lake (the ring layout): an oval in the middle-left
  // between the first clearing and the last, which the road curves round.
  const lakeCells: number[] = []
  let lake: { x: number; z: number; r: number } | null = null
  if (shape === 'ring' && n >= 3) {
    const lj = (cs[1]!.j + cs[n - 1]!.j) / 2
    const li = M + W / 2 - 8
    const ry = Math.max(5, (cs[1]!.j - cs[n - 1]!.j) / 2 + 1)
    const rx = 7
    for (let j = Math.floor(lj - ry); j <= Math.ceil(lj + ry); j++) {
      for (let i = Math.floor(li - rx); i <= Math.ceil(li + rx); i++) {
        if (i < 3 || j < 3 || i >= Wd - 3 || j >= h - 3) continue
        const e = ((i - li) / rx) ** 2 + ((j - lj) / ry) ** 2
        if (e > 1) continue
        const k = j * Wd + i
        // Two cells of shore from the road and every clearing.
        let near = false
        for (const c of cs) if (Math.hypot(i - c.i, j - c.j) <= c.r + 2) { near = true; break }
        for (let dj = -2; dj <= 2 && !near; dj++) for (let di = -2; di <= 2; di++) if (trail[(j + dj) * Wd + i + di]) { near = true; break }
        if (near) continue
        lakeCells.push(k)
        solid[k] = 0
      }
    }
    lake = { x: (li + 0.5) * CELL, z: (lj + 0.5) * CELL, r: Math.max(rx, ry) * CELL }
  }

  const fin = clearings[n]!
  // The reward chest waits behind the finale.
  const chest = { x: fin.x, z: fin.z - fin.r * 0.55 }
  const kind = new Uint8Array(Wd * h)
  for (const k of lakeCells) kind[k] = K_WATER
  // The lava round the Crags' tongues, the void round the Rift's islands, and their crossings.
  if (laid) {
    for (const k of laid.water) kind[k] = K_WATER
    for (const cr of laid.crossings) for (const k of cr.cells) kind[k] = cr.kind === 'bridge' ? K_BRIDGE : K_FORD
  }
  const cave = new Uint8Array(Wd * h)
  const sealed = new Uint8Array(Wd * h)
  const side = new Uint8Array(Wd * h)
  for (const k of secretCells) if (!solid[k]) side[k] = 1
  const features = addFeatures({ def, seed, w: Wd, h, solid, trail, kind, cave, sealed, side, cs, chest, secret, secretSlot, tutorial: !!o.tutorial, bare: !!o.bare, branches: M > 0, ...(laid?.loopSites.length ? { loopSites: laid.loopSites } : {}) })
  if (lake) features.ponds.push(lake)
  if (laid) features.crossings.unshift(...laid.crossings)
  // The first visit's camp (#156): cut out above the finale, its cage a chest.
  const campCut = o.tutorial && !o.bare ? carveCamp({ w: Wd, h, solid, trail, kind, sealed, fin: cs[n]! }) : null
  if (campCut) features.chests.push({ id: features.chests.length, ...campCut.chest })
  // The place's set pieces (#120), on their own stream, before the relief
  // (each blocking one stands on a level pad) and before the herbs and the
  // ore (which keep off them). Clear of every place one goes to.
  const keep: Array<{ x: number; z: number; r: number; pack?: boolean }> = []
  for (const ch of features.chests) keep.push({ x: ch.x, z: ch.z, r: 2.4 }, { x: ch.sx, z: ch.sz, r: 1.6 })
  for (const p of features.plates) keep.push({ x: p.x, z: p.z, r: 1.6 })
  if (features.puzzle) keep.push({ x: features.puzzle.hint.x, z: features.puzzle.hint.z, r: 2 })
  for (const p of packs) keep.push({ x: p.x, z: p.z, r: p.finale ? 3 : 2.3, pack: true })
  for (const p of features.optionalPacks) keep.push({ x: p.x, z: p.z, r: 2.3, pack: true })
  for (const cv of features.caves) keep.push({ x: cv.mouth.x, z: cv.mouth.z, r: 2 })
  for (const f2 of [...features.forks, ...features.signs]) keep.push({ x: f2.x, z: f2.z, r: 1.4 })
  // A way off the road is a second route: a piece across it would cut the
  // loop and still leave every cell reachable by the road, so it keeps clear.
  for (const br of features.branches) {
    for (let q = 1; q < br.way.length; q++) {
      const a = br.way[q - 1]!
      const b = br.way[q]!
      const steps = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / CELL)
      for (let s = 0; s <= steps; s++) keep.push({ x: a.x + ((b.x - a.x) * s) / steps, z: a.z + ((b.z - a.z) * s) / steps, r: ZONE_BRANCHES[def.id].half + 1.5 })
    }
  }
  const dresser = makeDresser({ w: Wd, h, solid, trail, kind, sealed, side, start: { i: cs[0]!.i, j: cs[0]!.j }, keep, chests: features.chests })
  const invasion = def.invaded ? { ruins: INVASION[def.id].ruins, scars: INVASION[def.id].scars } : undefined
  if (!o.tutorial && !o.bare) dressPlace(dresser, { shape, rng: mulberry32((seed ^ DRESS_SALT) >>> 0), w: Wd, kind, cs, chambers, fixtures, ...(invasion ? { invasion } : {}) })
  const camp = campCut ? dressCamp(dresser, { w: Wd, solid, kind, ...campCut }) : null
  for (const k of secretCells) masonry[k] = 0
  // The secret's pocket is a side place too: it lies a little above its clearing.
  const lobes = features.lobes.slice()
  if (secret && secretSlot) lobes.push({ x: secret.x, z: secret.z, r: 2.6 * CELL, k: secretSlot.k, lift: 0.35 })
  // The Peak's summit stands above every shelf and every way off the road.
  if (shape === 'spiral') lobes.push({ x: fin.x, z: fin.z, r: fin.r, k: n, lift: 1.2 })
  const start = { x: clearings[0]!.x, z: clearings[0]!.z }
  // Herbs (#88), on their own stream: nothing above moves for them.
  // Not on the very first visit (one thing at a time) nor on a bare chain.
  const spots = { seed, w: Wd, h, solid, sealed, trail, kind, start, chests: features.chests }
  const herbs = o.tutorial || o.bare ? [] : placeHerbs(spots, def.id)
  // The treasure map (#89), after the herbs and on streams of their own too.
  const pieces = o.tutorial || o.bare ? [] : placePieces(spots, o.pieces ?? [], herbs)
  const end = clearings.find(c => c.role === 'finale') ?? clearings[clearings.length - 1]!
  const x = o.treasure && !o.tutorial && !o.bare ? placeTreasure({ ...spots, end: { x: end.x, z: end.z } }, [...herbs, ...pieces]) : null
  // Ore (#99), last of all and on its own stream: against the stone, off the
  // herbs, the pieces and the treasure, and (a solid rock) clear of every
  // place one goes to: a cave and its mouth, a plate, the hint stone, a pack.
  const named = [
    ...features.caves.flatMap(c => [c, c.mouth]), ...features.plates, ...features.optionalPacks,
    ...(features.puzzle ? [features.puzzle.hint] : []),
    // The top of a ledge is reached by its ramp: no ore stands on either.
    ...features.ledges.flatMap(l => [{ x: l.x, z: l.z }, { x: ((l.probe % Wd) + 0.5) * CELL, z: (Math.floor(l.probe / Wd) + 0.5) * CELL }])
  ]
  const ores = o.tutorial || o.bare ? [] : placeOres({ ...spots, cave }, def.min, [...herbs, ...pieces, ...(x ? [x] : []), ...named])
  if (x) {
    // Its cell is its own, like any chest's (it stood on open ground with
    // nothing to stop a body walking into it).
    kind[Math.floor(x.z / CELL) * Wd + Math.floor(x.x / CELL)] = K_BLOCK
    features.chests.push({ id: features.chests.length, x: x.x, z: x.z, tier: 'gold', role: 'treasure', sx: x.x, sz: x.z + CELL, door: -1, guard: -1 })
  }
  // A cage (#100), last of all and on its own stream.
  const cage = o.cage && !o.tutorial && !o.bare ? placeCage(spots, [...herbs, ...pieces, ...ores, ...(x ? [x] : [])]) : null
  if (cage) features.chests.push({ id: features.chests.length, ...cage.chest })
  // A way two cells across from the start to every place one goes to, cut
  // through the rock where the layout left only a gap (`widen.ts`).
  // It runs before the relief is raised: a cliff it turns to ramp is ramp in the ground too.
  const cageKey = cage?.key ?? campCut?.key
  widenWays({ w: Wd, h, solid, kind, sealed, masonry, doors: features.doors, pieces: dresser.pieces, crossings: features.crossings, anchored: ores.map(q => Math.floor(q.z / CELL) * Wd + Math.floor(q.x / CELL)) }, start,
    [...waysTo({ ...features, packs, herbs, pieces, ores, ...(cageKey ? { cageKey } : {}) }), ...(camp ? camp.spots : [])])
  const height = buildRelief({
    seed, w: Wd, h, kind, trail, cs, lobes, ledges: features.ledges, dais: features.dais, rivers: features.rivers, crossings: features.crossings,
    relief: ZONE_RELIEF[def.id], tutorial: !!o.tutorial, guides
  })
  // The standing wheat (the field layout): the fields and the lanes between
  // them, off the paths; the side places (corners, caves, ways off the road)
  // stay bare, and so does water, a bridge, a chest's spot.
  let crop: Uint8Array | undefined
  if (shape === 'field') {
    crop = new Uint8Array(Wd * h)
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < Wd; i++) {
        const k = j * Wd + i
        if (solid[k] || road[k] || kind[k] !== K_GROUND || side[k] || cave[k] || sealed[k]) continue
        let inField = false
        for (const c of cs) if (Math.hypot(i - c.i, j - c.j) <= c.r + 0.5) { inField = true; break }
        if (!inField) {
          for (let q = 1; q < cs.length && !inField; q++) {
            const p = cs[q - 1]!
            const c = cs[q]!
            const L = Math.hypot(c.i - p.i, c.j - p.j) || 1
            const t = Math.max(0, Math.min(1, ((i - p.i) * (c.i - p.i) + (j - p.j) * (c.j - p.j)) / (L * L)))
            if (Math.hypot(i - (p.i + (c.i - p.i) * t), j - (p.j + (c.j - p.j) * t)) <= 2.9) inField = true
          }
        }
        if (inField) crop[k] = 1
      }
    }
  }
  const anyWall = masonry.some(v => v > 0)
  // An invaded zone's demon pylons (afterplay §3), last of all and on their
  // own stream: one in each section the hero fights through, on open ground
  // clear of everything else that stands or lies there.
  const pylons = def.invaded && !o.tutorial && !o.bare
    ? placePylons({ w: Wd, h, solid, trail: road, kind, sealed, cave, side, cs, packs },
      [...features.chests.flatMap(c => [{ x: c.x, z: c.z }, { x: c.sx, z: c.sz }]), ...features.plates, ...(features.puzzle ? [features.puzzle.hint] : []),
        ...features.caves.map(c => c.mouth), ...features.signs, ...features.forks, ...herbs, ...pieces, ...ores, ...ores.map(q => ({ x: q.sx, z: q.sz })),
        ...(x ? [x] : []), ...(cage ? [cage.key] : []), ...dresser.pieces],
      mulberry32((seed ^ PYLON_SALT) >>> 0))
    : []
  return {
    ...(pylons.length ? { pylons } : {}),
    ...(crop ? { crop } : {}),
    ...(dresser.pieces.length ? { dressing: dresser.pieces } : {}),
    ...(anyWall ? { masonry } : {}),
    seed, w: Wd, h, solid, trail, kind, cave, sealed, side, height, clearings,
    start,
    packs,
    chest,
    secret,
    ...features,
    buildings: [],
    npcs: [],
    gates: [],
    herbs,
    ores,
    ...(cageKey ? { cageKey } : {}),
    ...(camp ? { camp } : {}),
    pieces,
    // The first visit opens on a calm beat: a dummy to learn to fight on.
    ...(o.tutorial ? { dummy: placeDummy(solid, h, cs, features.chests, packs[0]!) } : {})
  }
}

/** Metres a pylon keeps from anything else on the ground, and from its pack's middle. */
const PYLON_CLEAR = 2.2
const PYLON_PACK = 3

/** One demon pylon per section: the open cell, 3 × 3 of flat ground round it, nearest the clearing's ring. */
const placePylons = (
  p: { w: number; h: number; solid: Uint8Array; trail: Uint8Array; kind: Uint8Array; sealed: Uint8Array; cave: Uint8Array; side: Uint8Array; cs: ReadonlyArray<{ i: number; j: number; r: number }>; packs: readonly PackPlan[] },
  avoid: ReadonlyArray<{ x: number; z: number }>, rng: Rng
): Array<{ x: number; z: number }> => {
  const { w, h, solid, trail, kind, sealed, cave, side, cs, packs } = p
  const out: Array<{ x: number; z: number }> = []
  const open = (i: number, j: number): boolean => {
    if (i < 3 || j < 3 || i >= w - 3 || j >= h - 3) return false
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const k = (j + dj) * w + i + di
      if (solid[k] || kind[k] !== K_GROUND || sealed[k] || cave[k] || side[k]) return false
    }
    return !trail[j * w + i]
  }
  for (let k = 1; k < cs.length - 1; k++) {
    const c = cs[k]!
    const pack = packs[k - 1]
    const a0 = rng() * Math.PI * 2
    let best: { x: number; z: number } | null = null
    for (let t = 0; t < 120 && !best; t++) {
      const a = a0 + t * 2.399
      const r = c.r * (0.3 + (t % 8) * 0.1)
      const i = Math.round(c.i + Math.cos(a) * r)
      const j = Math.round(c.j + Math.sin(a) * r)
      if (!open(i, j)) continue
      const x = (i + 0.5) * CELL
      const z = (j + 0.5) * CELL
      if (pack && Math.hypot(pack.x - x, pack.z - z) < PYLON_PACK) continue
      if ([...avoid, ...out].some(q => Math.hypot(q.x - x, q.z - z) < PYLON_CLEAR)) continue
      best = { x, z }
    }
    if (best) out.push(best)
  }
  return out
}

/**
 * A random encounter on the world map (roadmap #67): a short stretch of the
 * region's own ground — a clearing to land in, then one clearing per pack up
 * the trail, the last of them the "finale" whose fall wins the fight. No
 * chests, no puzzles, no water: a quick fight, over in a minute. Seeded like
 * every other plan. `packs`: the enemies of each pack, the nearest first.
 */
export const generateEncounter = (packs: ReadonlyArray<readonly string[]>, seed: number, o: { escort?: boolean } = {}): ZonePlan => {
  const rng = mulberry32(seed)
  const w = 32
  const n = Math.max(1, packs.length)
  // An escort's road is longer: the caravan needs room to roll between ambushes.
  const step = o.escort ? 13 : 10
  const h = 15 + n * step
  const solid = new Uint8Array(w * h).fill(1)
  const trail = new Uint8Array(w * h)
  const cs: Array<{ i: number; j: number; r: number }> = []
  let ci = w / 2 + Math.round((rng() - 0.5) * 4)
  let cj = h - 7
  cs.push({ i: ci, j: cj, r: 4.2 })
  for (let k = 1; k <= n; k++) {
    const r = k === n ? 5.8 : 4.8
    cj -= step + Math.round(rng())
    ci = Math.max(Math.ceil(r) + 3, Math.min(w - Math.ceil(r) - 4, ci + Math.round((rng() - 0.5) * 10)))
    cs.push({ i: ci, j: cj, r })
  }
  for (let k = 0; k < cs.length; k++) {
    const c = cs[k]!
    carveDisc(solid, w, h, c.i, c.j, c.r, rng)
    if (k > 0) carveLine(solid, trail, w, h, cs[k - 1]!.i, cs[k - 1]!.j, c.i, c.j, o.escort ? 2.3 : 1.8)
  }
  // A boulder or two to fight round, off the trail.
  for (let k = 1; k < cs.length; k++) {
    const c = cs[k]!
    for (let q = 0; q < 2; q++) {
      const a = rng() * Math.PI * 2
      const i = Math.round(c.i + Math.cos(a) * c.r * 0.65)
      const j = Math.round(c.j + Math.sin(a) * c.r * 0.65)
      if (i < 3 || j < 3 || i >= w - 3 || j >= h - 3) continue
      let nearTrail = false
      for (let dj = -2; dj <= 2 && !nearTrail; dj++) for (let di = -2; di <= 2; di++) if (trail[(j + dj) * w + i + di]) { nearTrail = true; break }
      if (!nearTrail) solid[j * w + i] = 1
    }
  }
  const clearings: Clearing[] = cs.map((c, k) => ({
    x: (c.i + 0.5) * CELL, z: (c.j + 0.5) * CELL, r: c.r * CELL, role: k === 0 ? 'start' : k === n ? 'finale' : 'pack'
  }))
  const plans: PackPlan[] = []
  for (let k = 1; k <= n; k++) {
    const c = clearings[k]!
    const kinds = [...(packs[k - 1] ?? [])]
    // An escort's packs lie in wait beside the road, not on it.
    const side = o.escort ? (k % 2 ? 1 : -1) * c.r * 0.45 : 0
    plans.push({ x: c.x + side, z: c.z, r: c.r, kinds, finale: k === n, boss: '' })
  }
  widenWays({ w, h, solid, kind: new Uint8Array(w * h), sealed: new Uint8Array(w * h) }, clearings[0]!, plans)
  // The caravan's road: the start, then through each clearing to the far end.
  const caravan = o.escort ? { path: clearings.flatMap(c => [c.x, c.z]) } : undefined
  return {
    seed, w, h, solid, trail, kind: new Uint8Array(w * h), cave: new Uint8Array(w * h), sealed: new Uint8Array(w * h),
    side: new Uint8Array(w * h),
    height: new Float32Array((w + 1) * (h + 1)),
    ...noFeatures(),
    clearings,
    start: { x: clearings[0]!.x, z: clearings[0]!.z },
    packs: plans,
    chest: null,
    secret: null,
    buildings: [],
    npcs: [],
    gates: [],
    ...(caravan ? { caravan } : {})
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
