import type { HouseKind, NpcDef, NpcPlace, TownDef, TownFolkDef, TownId, TownJob, TownStyle } from '../data/zones'
import type { ClassId } from '../data/skills'
import { CELL, SOLID_LOW, SOLID_TERRAIN, createGrid, findPath, type Grid } from './grid'
import { mulberry32, type Rng } from './rng'
import { K_BLOCK } from './zoneFeatures'

/**
 * ─── A town's plan (roadmap #41, #42) ───────────────────────────────────────
 *
 * A town is laid out the way a street of real houses is: three rows of houses
 * across the map, each row's fronts on one line and facing SOUTH, toward the
 * camera, with a street before them and gardens behind:
 *
 *   north row   the big houses (schools, halls, the tavern), backed by the trees
 *   high street
 *   middle row  shops and workshops either side of the square
 *   lower street
 *   south row   cottages
 *   the green   where the road comes in, and the hero with it
 *
 * The square sits in the middle of the middle row, the main road runs down
 * through it to the green. Every door faces the camera, so a door, a sign and
 * a shop front always read; and behind every house is a garden nobody walks
 * in, so a roof never stands between the camera and anybody in the street.
 *
 * The cast's houses go where their data puts them (`NpcDef.at`: the door);
 * the gaps between are filled with houses nobody in particular lives in, and
 * the whole is dressed with props (`TownProp`), places to sit, lean, work and
 * train (`TownSpot`), and people (`TownPerson`): the cast and the folk who
 * make a town feel lived in. A house with someone `inside` is walked into:
 * walls and a doorway on the walk grid, a furnished room in the view.
 *
 * Pure and seeded like every plan: the same town and flags, the same seed,
 * the same town. The buildings stand whatever the world's flags (a fallen
 * town is the same streets, ruined); only who is in them changes.
 */

// ─── Cells ───────────────────────────────────────────────────────────────────

export const TOWN_W = 38
export const TOWN_H = 36

/** What a town cell is (`TownPlan.cell`). */
export const TC_GRASS = 0
/** A cobbled street: walkable, nothing stands in its middle lane. */
export const TC_STREET = 1
/** The paved square. */
export const TC_SQUARE = 2
/** A room's floor. */
export const TC_FLOOR = 3
/** A doorway: walked through, never stood in. */
export const TC_DOOR = 4
/** A house's wall (solid). */
export const TC_WALL = 5
/** A garden or backyard: kept out of (low: fences, beds, woodpiles). */
export const TC_YARD = 6
/** A prop in the way: a well, a stall, an anvil (low). */
export const TC_PROP = 7
/** A fence (low). */
export const TC_FENCE = 8
/** A training ground: beaten earth, walkable. */
export const TC_GROUND = 9
/** Out of town (the trees). */
export const TC_RIM = 10

const CX = 19
/** The front (south) wall row of the north, middle and south rows of houses. */
const FRONT = [8, 17, 25] as const
/** The deepest a house may be in each row (the gardens behind take the rest). */
const DEPTH = [5, 4, 3] as const
/** The square. */
const SQ = { i0: CX - 5, i1: CX + 5, j0: 9, j1: 20 }
/** The main road, from the square down to the edge of the green. */
const ROAD = { i0: CX - 1, i1: CX + 1, j1: TOWN_H - 3 }
/** Where houses may stand in each row (inclusive column spans). */
const SEGMENTS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[3, 34]],
  [[3, SQ.i0 - 1], [SQ.i1 + 1, 34]],
  [[3, ROAD.i0 - 2], [ROAD.i1 + 2, 34]]
]
const START_J = 28
/** The well's (the fountain's) row: the middle of the square. */
const WELL_J = 14

/** The lanes nothing may stand in: the middle of each street and the road
 *  below the square (inside the square, the fountain splits the way). */
export const townLane = (i: number, j: number): boolean =>
  ((j === FRONT[0] + 2 || j === FRONT[1] + 2) && i >= 4 && i <= TOWN_W - 5 && (i < SQ.i0 || i > SQ.i1)) ||
  (i >= ROAD.i0 && i <= ROAD.i1 && j > SQ.j1 && j <= ROAD.j1)
const isLane = townLane

// ─── The plan ────────────────────────────────────────────────────────────────

/** What hangs over a door: the trade it tells of. */
export type SignKind = '' | 'smith' | 'armor' | 'weapons' | 'trinkets' | 'healer' | 'tavern' | 'class' | 'guard' | 'black'

export interface TownHouse {
  kind: HouseKind
  /** The footprint in cells (walls included). */
  i0: number
  j0: number
  cw: number
  cd: number
  /** The door's column (on the front row, `j0 + cd - 1`). */
  doorI: number
  /** Walked into: walls round a floor, and a doorway. */
  inside: boolean
  /** Whose house it is (an npc id; '' for nobody's). The first PRESENT of the
   *  people who share it. */
  owner: string
  /** Everybody who may live here, whatever the flags. */
  owners: string[]
  sign: SignKind
  /** A school's class (its emblem on the banner). */
  cls?: ClassId
  /** One or two storeys. */
  storeys: 1 | 2
  /** A row back from the street, with a front garden. */
  setback: boolean
  /** The variation: colours, roof, details (`gfx/houses.ts`). */
  seed: number
  /** A training ground beside it (cells, inclusive). */
  yard: { i0: number; j0: number; i1: number; j1: number } | null
  /** Which row of the town it stands in (0 north, 1 middle, 2 south). */
  row: number
}

export type TownPropKind =
  | 'well' | 'fountain' | 'stall' | 'board' | 'bench' | 'table' | 'barrel' | 'crates' | 'cart' | 'hay' | 'lamp' | 'tree'
  | 'dummy' | 'stone' | 'rack' | 'anvil' | 'trough' | 'grindstone' | 'woodpile' | 'laundry' | 'garden' | 'fence'
  | 'campfire' | 'brazier' | 'rubble' | 'signpost' | 'bush' | 'flowers' | 'sacks' | 'cauldron' | 'pumpkins' | 'gate'
  | 'planter' | 'barrels' | 'armorStand' | 'ore' | 'chalk' | 'spill'

export interface TownProp {
  kind: TownPropKind
  /** Centre (metres) and heading (radians, 0 faces +Z: the camera). */
  x: number
  z: number
  rot: number
  /** Length along its own x (fences, stalls, beds), metres; 0 for the default. */
  w: number
  /** A seeded variant. */
  v: number
  /** The cells it keeps everybody out of. */
  cells: number[]
}

/** What a body does at a spot. */
export type SpotKind = 'work' | 'seat' | 'lean' | 'look' | 'dummy' | 'spar' | 'fire'

export interface TownSpot {
  kind: SpotKind
  /** Where the body is while using it, and which way it faces. */
  x: number
  z: number
  facing: number
  /** Where it is walked to first (a walkable cell's centre). */
  ax: number
  az: number
  /** The house it is in (-1: outdoors). */
  room: number
  /** Kept for one person (their id); '' for anybody. */
  owner: string
  /** The prop it belongs to (-1: none): a dummy wobbles, a table is shared. */
  prop: number
  /** A sparring spot's partner. */
  pair: number
}

export interface TownPerson {
  id: string
  /** The npc id ('' for one of the folk: no conversation, no pin). */
  npc: string
  look: string
  job: TownJob
  place: NpcPlace
  /** Where they start the day and come back to. */
  x: number
  z: number
  facing: number
  /** The house they keep to (-1: outdoors). */
  room: number
  /** Their own place of work (a spot index, -1: none). */
  station: number
  /** How far they stroll from home, metres. */
  roam: number
  /** Kept on a weak device. */
  lite: boolean
  /** Body size (children are small) and walking pace. */
  scale: number
  r: number
  speed: number
}

export interface TownPlan {
  id: TownId
  style: TownStyle
  /** Burnt and broken: the fallen town. */
  ruined: boolean
  /** The grid's width (cells). */
  w: number
  /** `TC_*` per cell. */
  cell: Uint8Array
  /** The house a floor, door or wall cell belongs to (-1: none). */
  room: Int16Array
  /** Parallel to `ZonePlan.buildings`. */
  houses: TownHouse[]
  props: TownProp[]
  spots: TownSpot[]
  people: TownPerson[]
  square: { i0: number; j0: number; i1: number; j1: number }
  /** Where the guards walk their round. */
  patrol: Array<[number, number]>
}

/** What `generateTown` needs from the layout. */
export interface TownLayout {
  w: number
  h: number
  solid: Uint8Array
  trail: Uint8Array
  kind: Uint8Array
  start: { x: number; z: number }
  buildings: Array<{ x: number; z: number; w: number; d: number; style: number }>
  npcs: Array<{ id: string; look: string; x: number; z: number; facing: number }>
  town: TownPlan
}

// ─── Who is in town ──────────────────────────────────────────────────────────

const present = <T extends { needs?: string[]; not?: string[] }>(x: T, flags: ReadonlySet<string>): boolean =>
  (!x.needs || x.needs.every(f => flags.has(f))) && !(x.not && x.not.some(f => flags.has(f)))

/** The folk in town for this world state (a weak device keeps the `lite` ones). */
export const townFolk = (def: TownDef, flags: ReadonlySet<string>): TownFolkDef[] => def.folk.filter(f => present(f, flags))

/** Is the town a ruin in this world state? */
export const townRuined = (def: TownDef, flags: ReadonlySet<string>): boolean => !!def.fallen && flags.has(def.fallen)

/** A townsperson's routine, by what they do in the story. */
export const jobOf = (n: NpcDef): TownJob => {
  if (n.job) return n.job
  if (n.role === 'healer') return 'healer'
  if (n.role === 'trainer') {
    switch (n.cls) {
      case 'aegis': return 'knight'
      case 'shadow': return 'rogue'
      case 'sovereign': return 'noble'
      case 'blood': return 'alchemist'
      case 'aether': return 'tinker'
      case 'geo': return 'geo'
      default: return 'scholar'
    }
  }
  return n.role === 'shop' ? 'merchant' : 'villager'
}

const SIGN_OF = (n: NpcDef): SignKind => {
  if (n.role === 'healer') return 'healer'
  if (n.role === 'trainer') return 'class'
  if (n.role !== 'shop' || !n.stock) return n.job === 'captain' ? 'guard' : ''
  if (n.id === 'blackMarket') return 'black'
  const s = n.stock.slots
  if (s.every(x => x === 'trinket')) return 'trinkets'
  if (s.includes('main') && !s.includes('body')) return 'weapons'
  if (s.includes('body') && !s.includes('main')) return 'armor'
  return 'smith'
}

// ─── Layout ──────────────────────────────────────────────────────────────────

interface Home {
  kind: HouseKind
  /** The door's anchor in cells. */
  ai: number
  aj: number
  row: number
  owners: NpcDef[]
  yard: boolean
  inside: boolean
  sign: SignKind
  cls?: ClassId
}

/** A 0..1 point of the town's own square → a cell. */
const anchor = (at: [number, number]): [number, number] => [Math.round(3 + at[0] * 31), Math.round(3 + at[1] * 29)]

const rowOf = (aj: number): number => (aj <= 12 ? 0 : aj <= 21 ? 1 : 2)

const WIDTH: Readonly<Record<HouseKind, [number, number]>> = {
  hall: [6, 7], chapel: [5, 6], workshop: [5, 6], townhouse: [4, 5], tavern: [7, 7], cottage: [3, 4]
}

const defaultHouse = (n: NpcDef): HouseKind =>
  n.house ?? (n.role === 'healer' ? 'chapel' : n.role === 'trainer' ? 'hall' : n.place === 'porch' ? 'workshop' : 'townhouse')

/** Ruinous houses keep only a little roof: one storey is enough of them. */
const storeysOf = (kind: HouseKind, style: TownStyle, row: number, rng: Rng): 1 | 2 => {
  if (row === 2 || kind === 'workshop' || kind === 'cottage') return 1
  if (kind === 'hall' || kind === 'tavern') return 2
  return style === 'mercantile' || rng() < 0.45 ? 2 : 1
}

export const layTown = (def: TownDef, flags: ReadonlySet<string>, seed: number): TownLayout => {
  const rng = mulberry32(seed)
  const W = TOWN_W
  const H = TOWN_H
  const N = W * H
  const solid = new Uint8Array(N).fill(1)
  const trail = new Uint8Array(N)
  const kind = new Uint8Array(N)
  const cell = new Uint8Array(N).fill(TC_RIM)
  const room = new Int16Array(N).fill(-1)
  const K = (i: number, j: number): number => j * W + i
  const inGrid = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < W && j < H
  const ruined = townRuined(def, flags)

  // ── The town's ground: a rounded block of open land in the trees ──
  for (let j = 3; j <= H - 3; j++) {
    for (let i = 2; i <= W - 3; i++) {
      // Rounded corners, and a ragged edge so the trees do not stand in a ruled line.
      const ci = Math.max(0, 7 - i, i - (W - 8))
      const cj = Math.max(0, 7 - j, j - (H - 8))
      const out = Math.hypot(ci, cj)
      const wob = ((i * 7 + j * 13 + seed) % 5) * 0.25
      if (out > 5.2 + wob) continue
      solid[K(i, j)] = 0
      cell[K(i, j)] = TC_GRASS
    }
  }

  // ── Streets ──
  const street = (i: number, j: number, c = TC_STREET): void => {
    if (!inGrid(i, j) || solid[K(i, j)]) return
    cell[K(i, j)] = c
    trail[K(i, j)] = 1
  }
  for (const f of [FRONT[0], FRONT[1]]) for (let i = 3; i <= W - 4; i++) for (let j = f + 1; j <= f + 3; j++) street(i, j)
  for (let j = SQ.j0; j <= SQ.j1; j++) for (let i = SQ.i0; i <= SQ.i1; i++) street(i, j, TC_SQUARE)
  for (let j = SQ.j1 + 1; j <= ROAD.j1; j++) for (let i = ROAD.i0; i <= ROAD.i1; i++) street(i, j)
  // The street ends fray into the grass.
  for (const f of [FRONT[0], FRONT[1]]) for (const i of [3, W - 4]) { trail[K(i, f + 1)] = 0; trail[K(i, f + 3)] = 0 }

  // ── Homes: the cast's houses, then the town's landmarks ──
  const homes: Home[] = []
  const byAt = new Map<string, Home>()
  for (const n of def.npcs) {
    const place = n.place ?? 'street'
    if (place === 'street') continue
    const key = n.at.join(',')
    const had = byAt.get(key)
    if (had) { had.owners.push(n); continue }
    const [ai, aj] = anchor(n.at)
    const h: Home = {
      kind: defaultHouse(n), ai, aj, row: rowOf(aj), owners: [n], yard: place === 'yard', inside: place === 'inside',
      sign: SIGN_OF(n), cls: n.cls
    }
    byAt.set(key, h)
    homes.push(h)
  }
  for (const l of def.houses) {
    const [ai, aj] = anchor(l.at)
    homes.push({ kind: l.kind, ai, aj, row: rowOf(aj), owners: [], yard: false, inside: !!l.inside, sign: l.kind === 'tavern' ? 'tavern' : '' })
  }

  // ── Placing them: along each row, at their anchors, never overlapping ──
  interface Lot { home: Home | null; i0: number; cw: number; yw: number; yardLeft: boolean; row: number }
  const lots: Lot[] = []
  // How many family homes are left to make walkable (see below).
  let familyLeft = 2
  for (let row = 0; row < 3; row++) {
    for (const [s0, s1] of SEGMENTS[row]!) {
      const mine = homes.filter(h => h.row === row && h.ai >= s0 - 3 && h.ai <= s1 + 3).sort((a, b) => a.ai - b.ai)
      const placed: Lot[] = []
      for (const h of mine) {
        const [w0, w1] = WIDTH[h.kind]
        let cw = w0 + Math.floor(rng() * (w1 - w0 + 1))
        const yw = h.yard ? 6 + Math.floor(rng() * 2) : 0
        // The yard lies toward the middle of the town.
        const yardLeft = h.yard && h.ai > CX
        const total = cw + yw
        let i0 = h.ai - Math.floor(total / 2)
        const prev = placed[placed.length - 1]
        const lo = prev ? prev.i0 + prev.cw + prev.yw : s0
        if (i0 < lo) i0 = lo
        if (i0 + total - 1 > s1) i0 = s1 - total + 1
        if (i0 < lo) {
          // No room: a narrower house, or none here at all.
          cw = Math.max(w0, s1 - lo + 1 - yw)
          i0 = lo
          if (i0 + cw + yw - 1 > s1) continue
        }
        placed.push({ home: h, i0, cw, yw, yardLeft, row })
      }
      // Fill the gaps with houses that are nobody's in particular.
      let at = s0
      const gaps: Array<[number, number]> = []
      for (const l of placed) {
        if (l.i0 > at) gaps.push([at, l.i0 - 1])
        at = l.i0 + l.cw + l.yw
      }
      if (at <= s1) gaps.push([at, s1])
      for (const [g0, g1] of gaps) {
        let i = g0
        // A narrow alley is left between some houses.
        if (g1 - g0 >= 4 && rng() < 0.5) i++
        while (g1 - i + 1 >= 3) {
          const room = g1 - i + 1
          const kindA: HouseKind = row === 2 || def.style === 'rural' ? 'cottage' : room >= 4 && rng() < 0.7 ? 'townhouse' : 'cottage'
          const [w0, w1] = WIDTH[kindA]
          let cw = Math.min(room, w0 + Math.floor(rng() * (w1 - w0 + 1)))
          // A sliver left over is taken in, now and then (else it stays an alley).
          if (room - cw > 0 && room - cw < 3 && rng() < 0.4) cw = Math.min(w1 + 1, room)
          // The first two homes in the deep rows are walked into: a family lives there
          // (four cells each way: a room needs them; a few, for each one's front is drawn apart).
          const family = row < 2 && familyLeft > 0 && room >= 4
          if (family) { cw = Math.max(4, cw); familyLeft-- }
          placed.push({ home: { kind: kindA, ai: i + (cw >> 1), aj: FRONT[row]!, row, owners: [], yard: false, inside: family, sign: '' }, i0: i, cw, yw: 0, yardLeft: false, row })
          i += cw
          // Gaps between houses: alleys, gardens, a way through to the next street.
          if (g1 - i + 1 >= 4 && rng() < 0.6) i += rng() < 0.3 ? 2 : 1
        }
      }
      placed.sort((a, b) => a.i0 - b.i0)
      lots.push(...placed)
    }
  }

  // ── Houses on the grid ──
  const houses: TownHouse[] = []
  const buildings: TownLayout['buildings'] = []
  for (const l of lots) {
    const h = l.home!
    const row = l.row
    const front = FRONT[row]!
    // An ambient cottage in a deep row sits a step back with a front garden.
    const setback = h.owners.length === 0 && h.kind === 'cottage' && row < 2 && rng() < 0.4
    const maxD = DEPTH[row]!
    // (A taproom needs a room four cells deep: in the shallow south row it reaches a cell into the street behind.)
    const cd = (h.kind === 'tavern' || h.kind === 'cottage') && h.inside ? Math.max(4, maxD) : Math.min(maxD, h.kind === 'cottage' ? 3 + (row === 0 ? 1 : 0) : h.kind === 'townhouse' || h.kind === 'workshop' ? Math.min(4, maxD) : maxD)
    const hi0 = l.yardLeft ? l.i0 + l.yw : l.i0
    const fj = setback ? front - 1 : front
    const j0 = fj - cd + 1
    const inside = h.inside && l.cw >= 4 && cd >= 4
    const doorI = hi0 + Math.floor(l.cw / 2) - (l.cw % 2 === 0 && rng() < 0.5 ? 1 : 0)
    const hs = Math.floor(rng() * 0x7fffffff)
    const idx = houses.length
    const owner = h.owners.find(o => present(o, flags))
    const yard = l.yw > 0 ? { i0: l.yardLeft ? l.i0 : hi0 + l.cw, j0: front - 4, i1: (l.yardLeft ? l.i0 : hi0 + l.cw) + l.yw - 1, j1: front } : null
    houses.push({
      kind: h.kind, i0: hi0, j0, cw: l.cw, cd, doorI, inside, owner: owner?.id ?? '', owners: h.owners.map(o => o.id),
      sign: h.sign, cls: h.cls, storeys: storeysOf(h.kind, def.style, row, rng), setback, seed: hs, yard, row
    })
    buildings.push({ x: (hi0 + l.cw / 2) * CELL, z: (j0 + cd / 2) * CELL, w: l.cw * CELL, d: cd * CELL, style: hs % 4 })
    for (let j = j0; j <= fj; j++) {
      for (let i = hi0; i < hi0 + l.cw; i++) {
        const k = K(i, j)
        const edge = i === hi0 || i === hi0 + l.cw - 1 || j === j0 || j === fj
        room[k] = idx
        if (inside && !edge) { solid[k] = 0; cell[k] = TC_FLOOR; trail[k] = 0; continue }
        if (inside && j === fj && i === doorI) { solid[k] = 0; cell[k] = TC_DOOR; trail[k] = 0; continue }
        solid[k] = 1
        cell[k] = TC_WALL
        trail[k] = 0
      }
    }
    // The front garden of a house set back: a row of beds, a path to the door.
    if (setback) {
      for (let i = hi0; i < hi0 + l.cw; i++) {
        const k = K(i, front)
        if (i === doorI) { cell[k] = TC_GRASS; continue }
        cell[k] = TC_YARD
      }
    }
    // The gardens behind: nobody may stand where the roof would hide them.
    for (let j = j0 - 3; j < j0; j++) {
      for (let i = hi0; i < hi0 + l.cw; i++) {
        if (!inGrid(i, j)) continue
        const k = K(i, j)
        if (cell[k] === TC_GRASS) cell[k] = TC_YARD
      }
    }
    if (yard) {
      for (let j = yard.j0; j <= yard.j1; j++) {
        for (let i = yard.i0; i <= yard.i1; i++) {
          const k = K(i, j)
          const side = i === yard.i0 || i === yard.i1 || j === yard.j0 || j === yard.j1
          // A fence round it with a gate in front.
          const gate = j === yard.j1 && Math.abs(i - (yard.i0 + yard.i1) / 2) < 1.1
          cell[k] = side && !gate ? TC_FENCE : TC_GROUND
          solid[k] = 0
          trail[k] = 0
        }
      }
      // A fence where it meets the house is the house's wall.
      for (let j = yard.j0; j <= yard.j1; j++) {
        const k = K(l.yardLeft ? yard.i1 : yard.i0, j)
        if (cell[k] === TC_FENCE && j !== yard.j1) cell[k] = TC_FENCE
      }
      // Behind the yard: its own back garden.
      for (let j = yard.j0 - 2; j < yard.j0; j++) for (let i = yard.i0; i <= yard.i1; i++) if (inGrid(i, j) && cell[K(i, j)] === TC_GRASS) cell[K(i, j)] = TC_YARD
    }
  }
  // Grass in the north row's band (between houses, behind gardens) beyond the
  // first row of the street is garden too: it is hidden by the houses either side.
  for (let j = 3; j < FRONT[0] - 1; j++) for (let i = 2; i < W - 2; i++) if (cell[K(i, j)] === TC_GRASS) cell[K(i, j)] = TC_YARD

  const plan: TownPlan = {
    id: def.id, style: def.style, ruined, w: W, cell, room, houses, props: [], spots: [], people: [],
    square: { i0: SQ.i0, j0: SQ.j0, i1: SQ.i1, j1: SQ.j1 }, patrol: []
  }
  const pr = mulberry32(seed ^ 0x7a11)
  const layout: TownLayout = {
    w: W, h: H, solid, trail, kind, start: { x: (CX + 0.5) * CELL, z: (START_J + 0.5) * CELL }, buildings, npcs: [], town: plan
  }
  dress(def, flags, layout, pr)
  // Low cells: yards, fences and props keep feet out (the walk grid's LOW layer).
  for (let k = 0; k < N; k++) {
    const c = cell[k]
    if (c === TC_YARD || c === TC_PROP || c === TC_FENCE) kind[k] = K_BLOCK
  }
  return layout
}

// ─── Dressing: props, spots and people ──────────────────────────────────────

const yawTo = (dx: number, dz: number): number => Math.atan2(dx, dz)
const C = (i: number): number => (i + 0.5) * CELL

const dress = (def: TownDef, flags: ReadonlySet<string>, L: TownLayout, rng: Rng): void => {
  const T = L.town
  const W = L.w
  const H = L.h
  const cell = T.cell
  const K = (i: number, j: number): number => j * W + i
  const inGrid = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < W && j < H
  const at = (i: number, j: number): number => (inGrid(i, j) ? cell[K(i, j)]! : TC_RIM)
  const walk = (c: number): boolean => c === TC_GRASS || c === TC_STREET || c === TC_SQUARE || c === TC_FLOOR || c === TC_DOOR || c === TC_GROUND
  /** The lanes nothing may stand in: the middle of each street, the road, the square's cross. */
  const lane = (i: number, j: number): boolean => isLane(i, j)
  /** In front of a door: kept clear. */
  const doorstep = (i: number, j: number): boolean => {
    for (const h of T.houses) {
      const fj = h.j0 + h.cd - 1
      if (Math.abs(i - h.doorI) <= 0 && j >= fj + 1 && j <= fj + 1) return true
    }
    return false
  }
  const free = (i: number, j: number): boolean => walk(at(i, j)) && at(i, j) !== TC_FLOOR && at(i, j) !== TC_DOOR && !lane(i, j) && !doorstep(i, j) && !taken.has(K(i, j))
  const taken = new Set<number>()

  const props = T.props
  const spots = T.spots
  /** The taprooms: their keeper's and bard's places and their stools (spot indices). */
  const inns = new Map<number, { keeper: number; bard: number; seats: number[] }>()
  const addProp = (kind: TownPropKind, x: number, z: number, rot: number, cells: number[], w = 0): number => {
    for (const k of cells) { cell[k] = TC_PROP; taken.add(k) }
    props.push({ kind, x, z, rot, w, v: Math.floor(rng() * 1000), cells })
    return props.length - 1
  }
  const addSpot = (s: Omit<TownSpot, 'pair'> & { pair?: number }): number => {
    spots.push({ pair: -1, ...s })
    // Nothing is put down later where it is walked to from.
    taken.add(K(Math.floor(s.ax / CELL), Math.floor(s.az / CELL)))
    return spots.length - 1
  }

  // ── The square: a well (a fountain in a bigger town), benches round it, lamps ──
  const wj = WELL_J
  const big = def.style === 'mercantile'
  const wellCells: number[] = []
  if (big) { for (let j = wj - 1; j <= wj + 1; j++) for (let i = CX - 1; i <= CX + 1; i++) wellCells.push(K(i, j)) } else wellCells.push(K(CX, wj))
  const well = addProp(big ? 'fountain' : 'well', C(CX), C(wj), 0, wellCells)
  // Nobody stands right against it: a ring to walk round it.
  const ring = big ? 2 : 1
  for (let j = wj - ring; j <= wj + ring; j++) for (let i = CX - ring; i <= CX + ring; i++) taken.add(K(i, j))
  // The fountain stands on the square's cross: the lane walks round it.
  // Benches face it from either side, and the well's rim can be sat on.
  for (const s of [-1, 1]) {
    const bi = CX + s * (big ? 3 : 2)
    const bj = wj
    if (!free(bi, bj)) continue
    const b = addProp('bench', C(bi), C(bj), s < 0 ? Math.PI / 2 : -Math.PI / 2, [K(bi, bj)])
    // Two places on a bench: its ends.
    for (const dz of [-0.42, 0.42]) {
      addSpot({ kind: 'seat', x: C(bi) - s * 0.08, z: C(bj) + dz, facing: s < 0 ? Math.PI / 2 : -Math.PI / 2, ax: C(bi - s), az: C(bj), room: -1, owner: '', prop: b })
    }
  }
  void well
  // Lamps at the square's corners; a notice board on its north side.
  for (const [i, j] of [[SQ.i0, SQ.j0], [SQ.i1, SQ.j0], [SQ.i0, SQ.j1], [SQ.i1, SQ.j1]] as const) {
    if (free(i, j)) addProp(def.style === 'mountain' ? 'brazier' : 'lamp', C(i), C(j), 0, [K(i, j)])
  }
  {
    const bi = CX + 3
    const bj = SQ.j0 + 1
    if (free(bi, bj)) {
      const b = addProp('board', C(bi), C(bj), 0, [K(bi, bj)])
      if (free(bi, bj + 1)) addSpot({ kind: 'look', x: C(bi), z: C(bj + 1) - 0.1, facing: Math.PI, ax: C(bi), az: C(bj + 1), room: -1, owner: '', prop: b })
    }
  }
  // Market stalls nobody keeps today, with goods to look at; flower planters;
  // barrels and crates stacked by the stalls.
  for (const [i, j] of [[SQ.i0 + 1, WELL_J + 2], [SQ.i1 - 2, WELL_J + 2]] as const) {
    if (!free(i, j) || !free(i + 1, j) || !free(i, j + 1) || !free(i + 1, j + 1)) continue
    const st = addProp('stall', C(i) + CELL / 2, C(j), 0, [K(i, j), K(i + 1, j)], CELL * 2)
    addSpot({ kind: 'look', x: C(i) + 0.3, z: C(j + 1) - 0.15, facing: Math.PI, ax: C(i), az: C(j + 1), room: -1, owner: '', prop: st })
    taken.add(K(i, j + 1))
    taken.add(K(i + 1, j + 1))
  }
  for (const [i, j] of [[SQ.i0 + 1, SQ.j0 + 3], [SQ.i1 - 1, SQ.j0 + 3]] as const) if (free(i, j)) addProp('planter', C(i), C(j), 0, [K(i, j)])
  {
    const ci = SQ.i0 + 2
    const cj = WELL_J - 2
    if (free(ci, cj) && !T.ruined) { addProp('chalk', C(ci), C(cj), rng() * 6.28, []); taken.add(K(ci, cj)) }
    const si = SQ.i0 + 3
    const sj = WELL_J + 2
    if (free(si, sj)) addProp('spill', C(si), C(sj), rng() * 6.28, [K(si, sj)])
  }
  for (const [i, j] of [[SQ.i0, WELL_J + 2], [SQ.i1, WELL_J + 2]] as const) if (free(i, j)) addProp('barrels', C(i), C(j), rng() * 6.28, [K(i, j)])
  // Trees in the square's corners (a ruined town has stumps).
  for (const [i, j] of [[SQ.i0 + 1, SQ.j1 - 1], [SQ.i1 - 1, SQ.j1 - 1]] as const) {
    if (free(i, j) && rng() < 0.85) addProp('tree', C(i), C(j), rng() * 6.28, [K(i, j)])
  }

  // ── The houses' own things ──
  for (let hi = 0; hi < T.houses.length; hi++) {
    const h = T.houses[hi]!
    const fj = h.j0 + h.cd - 1
    const sj = fj + 1
    if (h.kind === 'workshop') {
      // Before the forge: the anvil, a quench trough, a grindstone.
      const ai = h.doorI + 1
      if (free(ai, sj)) addProp('anvil', C(ai), C(sj), Math.PI / 2, [K(ai, sj)])
      const ti = h.doorI - 1
      if (free(ti, sj) && rng() < 0.8) addProp('trough', C(ti), C(sj), 0, [K(ti, sj)])
    }
    if (h.kind === 'tavern') {
      // Outdoor seating either side of the door.
      for (const s of [-2, 2]) {
        const ti = h.doorI + s
        if (!free(ti, sj) || !free(ti - 1, sj) || !free(ti + 1, sj)) continue
        const t = addProp('table', C(ti), C(sj), 0, [K(ti, sj)])
        for (const e of [-1, 1]) {
          addSpot({ kind: 'seat', x: C(ti) + e * 0.66, z: C(sj), facing: e < 0 ? Math.PI / 2 : -Math.PI / 2, ax: C(ti + e), az: C(sj), room: -1, owner: '', prop: t })
          taken.add(K(ti + e, sj))
        }
      }
    }
    // A place to lean by the front wall, away from the door.
    for (const s of [-1, 1]) {
      const li = h.doorI + s * 2
      if (li <= h.i0 || li >= h.i0 + h.cw - 1 || h.kind === 'workshop') continue
      if (!free(li, sj) || h.setback) continue
      addSpot({ kind: 'lean', x: C(li), z: (fj + 1) * CELL + 0.05, facing: 0, ax: C(li), az: C(sj), room: -1, owner: '', prop: -1 })
      taken.add(K(li, sj))
    }
    // A training ground: dummies on its far side, a rack, and two marks to spar on.
    if (h.yard) {
      const y = h.yard
      const farLeft = y.i0 < h.i0
      const di = farLeft ? y.i0 + 1 : y.i1 - 1
      const geo = h.cls === 'geo'
      for (const dj of [y.j0 + 1, y.j0 + 3]) {
        if (dj >= y.j1) continue
        const d = addProp(geo ? 'stone' : 'dummy', C(di), C(dj), farLeft ? Math.PI / 2 : -Math.PI / 2, [K(di, dj)])
        const pi = farLeft ? di + 1 : di - 1
        addSpot({ kind: 'dummy', x: C(pi) + (farLeft ? -0.2 : 0.2), z: C(dj), facing: farLeft ? -Math.PI / 2 : Math.PI / 2, ax: C(pi), az: C(dj), room: -1, owner: '', prop: d })
        taken.add(K(pi, dj))
      }
      // A weapon rack against the back fence; in a corner, what the class keeps
      // (the Aegis Knight's armour on its stand, the Geomancer's ore samples).
      addProp('rack', C(Math.round((y.i0 + y.i1) / 2)), y.j0 * CELL + CELL * 0.9, 0, [])
      if (h.cls === 'aegis' || h.cls === 'geo') addProp(h.cls === 'aegis' ? 'armorStand' : 'ore', C(farLeft ? y.i1 - 1 : y.i0 + 1), y.j0 * CELL + CELL * 0.85, 0, [])
      // Sparring marks: two cells apart across the middle of the yard.
      const mj = y.j0 + 2
      const m0 = farLeft ? y.i0 + 3 : y.i1 - 4
      const a = addSpot({ kind: 'spar', x: C(m0) + 0.1, z: C(mj), facing: Math.PI / 2, ax: C(m0), az: C(mj), room: -1, owner: '', prop: -1 })
      const b = addSpot({ kind: 'spar', x: C(m0 + 1) - 0.1, z: C(mj), facing: -Math.PI / 2, ax: C(m0 + 1), az: C(mj), room: -1, owner: '', prop: -1 })
      taken.add(K(m0, mj))
      taken.add(K(m0 + 1, mj))
      spots[a]!.pair = b
      spots[b]!.pair = a
    }
  }

  // ── The cast ──
  const npcs = L.npcs
  const people = T.people
  const homeOf = (id: string): number => T.houses.findIndex(h => h.owners.includes(id))
  for (const n of def.npcs) {
    if (!present(n, flags)) continue
    const job = jobOf(n)
    const place = n.place ?? 'street'
    const hi = homeOf(n.id)
    const h = hi >= 0 ? T.houses[hi]! : null
    let x = 0
    let z = 0
    let facing = 0
    let room = -1
    let station = -1
    if (h && place === 'inside' && h.inside) {
      // At work in the room: by the west or east wall, side-on to the camera.
      const fj = h.j0 + h.cd - 1
      const west = h.doorI >= h.i0 + h.cw / 2
      const wi = west ? h.i0 + 1 : h.i0 + h.cw - 2
      const wj = fj - 1
      x = C(wi) + (west ? -0.55 : 0.55)
      z = C(wj)
      facing = west ? -Math.PI / 2 : Math.PI / 2
      room = hi
      station = addSpot({ kind: 'work', x, z, facing, ax: C(wi), az: C(wj), room: hi, owner: n.id, prop: -1 })
    } else if (h && (place === 'porch' || place === 'inside')) {
      const fj = h.j0 + h.cd - 1
      // A smith works side-on at the anvil beside him: right up to it.
      x = C(h.doorI) + (h.kind === 'workshop' ? 0.62 : 0)
      z = C(fj + 1) - 0.2
      facing = h.kind === 'workshop' ? Math.PI / 2 : 0
      station = addSpot({ kind: 'work', x, z, facing, ax: C(h.doorI), az: C(fj + 1), room: -1, owner: n.id, prop: -1 })
      taken.add(K(h.doorI, fj + 1))
    } else if (h && place === 'yard' && h.yard) {
      const y = h.yard
      // By the dummies: the first of them is theirs.
      const d = spots.findIndex(s => s.kind === 'dummy' && s.x >= C(y.i0) && s.x <= C(y.i1) && s.z >= C(y.j0) && s.z <= C(y.j1) && !s.owner)
      if (d >= 0) {
        spots[d]!.owner = n.id
        station = d
        x = spots[d]!.ax
        z = spots[d]!.az
        facing = spots[d]!.facing
      } else {
        x = C((y.i0 + y.i1) >> 1)
        z = C(y.j0 + 2)
      }
    } else {
      // Out in the street, at their own stall, bench or fire.
      const [ai, aj] = anchor(n.at)
      const c = nearestFree(ai, aj, free, 6)
      x = C(c[0])
      z = C(c[1])
      taken.add(K(c[0], c[1]))
      if (job === 'merchant' || job === 'fence') {
        // A stall beside them, its open front to where customers can stand (a
        // street, the square, the grass: south first), they behind it facing them.
        const open = (i: number, j: number): boolean => walk(at(i, j)) && at(i, j) !== TC_FLOOR && at(i, j) !== TC_DOOR && !taken.has(K(i, j)) && !doorstep(i, j)
        const side = ([[0, 1], [1, 0], [-1, 0], [0, -1]] as const).find(([dx, dz]) => free(c[0] + dx, c[1] + dz) && open(c[0] + 2 * dx, c[1] + 2 * dz))
        if (side) {
          const [dx, dz] = side
          const si = c[0] + dx
          const sj = c[1] + dz
          // A second cell along its counter (across the way it faces), if free.
          const pi = Math.abs(dz)
          const pj = Math.abs(dx)
          const cells = [K(si, sj)]
          if (free(si + pi, sj + pj) && open(si + pi + dx, sj + pj + dz)) cells.push(K(si + pi, sj + pj))
          const two = cells.length > 1
          const yaw = yawTo(dx, dz)
          const st = addProp(job === 'fence' ? 'crates' : 'stall', C(si) + (two ? (pi * CELL) / 2 : 0), C(sj) + (two ? (pj * CELL) / 2 : 0), yaw, cells, cells.length * CELL)
          station = addSpot({ kind: 'work', x: x + dx * 0.15, z: z + dz * 0.15, facing: yaw, ax: x, az: z, room: -1, owner: n.id, prop: st })
          const ci = c[0] + 2 * dx
          const cj = c[1] + 2 * dz
          addSpot({ kind: 'look', x: C(ci) - dx * 0.15, z: C(cj) - dz * 0.15, facing: yawTo(-dx, -dz), ax: C(ci), az: C(cj), room: -1, owner: '', prop: st })
        } else station = addSpot({ kind: 'work', x, z, facing: 0, ax: x, az: z, room: -1, owner: n.id, prop: -1 })
      } else if (job === 'boss') {
        // By a fire in the ruined square.
        const fi = c[0] + 1
        const fjj = c[1]
        if (free(fi, fjj)) {
          const f = addProp('campfire', C(fi), C(fjj), 0, [K(fi, fjj)])
          for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
            const si = fi + dx
            const sj = fjj + dz
            if (!walk(at(si, sj)) || lane(si, sj)) continue
            const s = addSpot({ kind: 'fire', x: C(si) - dx * 0.3, z: C(sj) - dz * 0.3, facing: yawTo(-dx, -dz), ax: C(si), az: C(sj), room: -1, owner: si === c[0] && sj === c[1] ? n.id : '', prop: f })
            if (si === c[0] && sj === c[1]) station = s
          }
        }
        facing = Math.PI / 2
      } else if (job === 'elder') {
        // Her bench by the well.
        const b = spots.findIndex(s => s.kind === 'seat' && s.prop >= 0 && props[s.prop]!.kind === 'bench' && !s.owner)
        if (b >= 0) { spots[b]!.owner = n.id; station = b }
      }
    }
    npcs.push({ id: n.id, look: n.look, x, z, facing })
    people.push({
      id: n.id, npc: n.id, look: n.look, job, place, x, z, facing, room, station, roam: room >= 0 ? 2.2 : 4.5, lite: true,
      scale: 1, r: 0.5, speed: 1.6
    })
  }

  // ── A taproom: the bar, tables with stools, the keeper's and the bard's places ──
  for (let hi = 0; hi < T.houses.length; hi++) {
    const h = T.houses[hi]!
    if (!h.inside || h.kind !== 'tavern') continue
    const fj = h.j0 + h.cd - 1
    const a = h.i0 + 1
    const b = h.i0 + h.cw - 2
    const r0 = h.j0 + 1
    const r1 = fj - 1
    // The bar on the side away from the door (as every room's work place).
    const west = h.doorI >= h.i0 + h.cw / 2
    const bi = west ? a : b
    const s = west ? 1 : -1
    inns.set(hi, { keeper: addSpot({ kind: 'work', x: C(bi) - s * 0.55, z: C(r1), facing: s * Math.PI / 2, ax: C(bi), az: C(r1), room: hi, owner: '', prop: -1 }), bard: -1, seats: [] })
    const inn = inns.get(hi)!
    // The bard by the hearth, at the back on the far side.
    const hi2 = west ? b : a
    inn.bard = addSpot({ kind: 'work', x: C(hi2), z: C(r0) - 0.2, facing: 0, ax: C(hi2), az: C(r0), room: hi, owner: '', prop: -1 })
    // Tables, each with a stool either side. A table never stands where
    // somebody walks to (the keeper's and the bard's places, the way in), never
    // beside another (their stools would meet), and every place in the room
    // stays reachable from the doorway, or it is taken away again.
    const fixed = [K(bi, r1), K(hi2, r0), K(h.doorI, r1)]
    const walkTo = new Set(fixed)
    const tables: number[] = []
    const reachable = (): boolean => {
      const seen = new Set([K(h.doorI, r1)])
      const q = [[h.doorI, r1]]
      while (q.length) {
        const [i, j] = q.pop()!
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const ni = i! + di
          const nj = j! + dj
          if (ni < a || ni > b || nj < r0 || nj > r1 || seen.has(K(ni, nj)) || at(ni, nj) !== TC_FLOOR) continue
          seen.add(K(ni, nj))
          q.push([ni, nj])
        }
      }
      return [...walkTo].every(k => seen.has(k))
    }
    for (let tj = r0; tj <= r1; tj++) {
      for (let ti = a + 1; ti <= b - 1; ti++) {
        if (tables.length >= 3 || walkTo.has(K(ti, tj)) || at(ti, tj) !== TC_FLOOR) continue
        if (at(ti - 1, tj) !== TC_FLOOR || at(ti + 1, tj) !== TC_FLOOR) continue
        if (tables.some(k => Math.floor(k / W) === tj && Math.abs((k % W) - ti) <= 2)) continue
        cell[K(ti, tj)] = TC_PROP
        for (const e of [-1, 1]) walkTo.add(K(ti + e, tj))
        if (!reachable()) {
          cell[K(ti, tj)] = TC_FLOOR
          for (const e of [-1, 1]) if (!fixed.includes(K(ti + e, tj)) && !tables.some(k => Math.floor(k / W) === tj && Math.abs((k % W) - (ti + e)) === 1)) walkTo.delete(K(ti + e, tj))
          continue
        }
        cell[K(ti, tj)] = TC_FLOOR
        // (`w` 1: a taproom's table, a traveller's pack by it.)
        const t = addProp('table', C(ti), C(tj), 0, [K(ti, tj)], 1)
        tables.push(K(ti, tj))
        for (const e of [-1, 1]) {
          inn.seats.push(addSpot({ kind: 'seat', x: C(ti) + e * 0.66, z: C(tj), facing: e < 0 ? Math.PI / 2 : -Math.PI / 2, ax: C(ti + e), az: C(tj), room: hi, owner: '', prop: t }))
        }
      }
    }
  }

  // ── Fires for the survivors of a fallen town (if the boss did not light one) ──
  // ── The folk ──
  for (const f of townFolk(def, flags)) {
    const child = f.job === 'child'
    // In the taproom: the keeper at the bar, the bard by the hearth, a patron on a stool.
    const inn = f.inn ? [...inns.entries()][0] : undefined
    if (inn) {
      const [hi, v] = inn
      const free2 = v.seats.find(k => !spots[k]!.owner)
      const at2 = f.job === 'keeper' ? v.keeper : f.job === 'bard' ? v.bard : free2 ?? -1
      if (at2 >= 0) {
        const sp = spots[at2]!
        if (f.job === 'keeper' || f.job === 'bard') sp.owner = f.id
        people.push({
          id: f.id, npc: '', look: f.look, job: f.job, place: 'inside', x: sp.ax, z: sp.az, facing: sp.facing, room: hi,
          station: f.job === 'keeper' || f.job === 'bard' ? at2 : -1, roam: 2.2, lite: !!f.lite, scale: 1, r: 0.48, speed: 1.3
        })
        continue
      }
    }
    const [ai, aj] = anchor(f.at)
    const c = nearestFree(ai, aj, free, 7)
    taken.add(K(c[0], c[1]))
    people.push({
      id: f.id, npc: '', look: f.look, job: f.job, place: 'street', x: C(c[0]), z: C(c[1]), facing: 0, room: -1, station: -1,
      roam: child ? 5 : f.job === 'guard' ? 3 : 4, lite: !!f.lite, scale: child ? 0.74 : f.look === 'miner' || f.look === 'dwarfGuard' ? 0.92 : 1,
      r: child ? 0.36 : 0.48, speed: child ? 2.5 : f.job === 'guard' ? 1.5 : 1.4
    })
  }

  // ── Street dressing: lamps along the streets, barrels and crates at the walls ──
  for (const f of [FRONT[0], FRONT[1]]) {
    for (let i = 5; i < W - 5; i += 6) {
      const j = f + 3
      if (i >= SQ.i0 && i <= SQ.i1) continue
      if (free(i, j) && rng() < 0.8) addProp('lamp', C(i), C(j) + 0.4, 0, [K(i, j)])
    }
  }
  // Gardens: what grows and stands behind the houses (the view draws them; the
  // cells were already kept clear of feet).
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      if (cell[K(i, j)] !== TC_YARD) continue
      const r = rng()
      if (r < 0.12) props.push({ kind: 'woodpile', x: C(i), z: C(j), rot: rng() < 0.5 ? 0 : Math.PI / 2, w: 0, v: Math.floor(rng() * 1000), cells: [] })
      else if (r < 0.3) props.push({ kind: 'garden', x: C(i), z: C(j), rot: 0, w: CELL, v: Math.floor(rng() * 1000), cells: [] })
      else if (r < 0.38) props.push({ kind: 'bush', x: C(i), z: C(j), rot: rng() * 6.28, w: 0, v: Math.floor(rng() * 1000), cells: [] })
      else if (r < 0.43) props.push({ kind: 'hay', x: C(i), z: C(j), rot: rng() * 6.28, w: 0, v: Math.floor(rng() * 1000), cells: [] })
    }
  }

  // ── The green: the road in, a signpost, a cart, a laundry line, a field ──
  {
    const gj = FRONT[2] + 3
    const si = ROAD.i1 + 1
    if (free(si, START_J - 1)) addProp('signpost', C(si), C(START_J - 1), 0, [K(si, START_J - 1)])
    // The town's gate over the road where it comes in.
    {
      const gjj = ROAD.j1 - 1
      const cells = [K(ROAD.i0 - 1, gjj), K(ROAD.i1 + 1, gjj)]
      if (free(ROAD.i0 - 1, gjj) && free(ROAD.i1 + 1, gjj)) addProp('gate', C(CX), C(gjj), 0, cells, CELL * 4)
    }
    // A field each side of the road.
    for (const [fi, fw] of [[ROAD.i1 + 3, 5], [ROAD.i0 - 8, 5]] as const) {
      const fj = gj + 3
      let ok = true
      for (let j = fj; j <= fj + 1; j++) for (let i = fi; i < fi + fw; i++) if (!free(i, j)) ok = false
      if (!ok) continue
      const cells: number[] = []
      for (let j = fj; j <= fj + 1; j++) for (let i = fi; i < fi + fw; i++) cells.push(K(i, j))
      const p = addProp('garden', C(fi) + (CELL * (fw - 1)) / 2, C(fj) + CELL / 2, 0, cells, CELL * fw)
      if (free(fi + 1, fj - 1)) addSpot({ kind: 'work', x: C(fi + 1), z: C(fj - 1) + 0.3, facing: 0, ax: C(fi + 1), az: C(fj - 1), room: -1, owner: '', prop: p })
    }
    for (const [i, j, k] of [[ROAD.i0 - 4, gj + 1, 'cart'], [ROAD.i1 + 5, gj + 2, 'hay'], [ROAD.i0 - 8, gj + 3, 'hay']] as const) {
      if (free(i, j)) addProp(k, C(i), C(j), rng() * 0.6 - 0.3, [K(i, j)])
    }
    // A laundry line between two posts, and a vegetable patch with a fence.
    {
      const li = ROAD.i1 + 7
      const lj = gj + 1
      if (free(li, lj) && free(li + 1, lj)) {
        const p = addProp('laundry', C(li) + CELL / 2, C(lj), 0, [K(li, lj), K(li + 1, lj)], CELL * 2)
        if (free(li, lj + 1)) addSpot({ kind: 'work', x: C(li) + 0.3, z: C(lj + 1) - 0.3, facing: Math.PI, ax: C(li), az: C(lj + 1), room: -1, owner: '', prop: p })
      }
      const gi = ROAD.i0 - 9
      const gjj = gj + 1
      let ok = true
      for (let j = gjj; j <= gjj + 1; j++) for (let i = gi; i <= gi + 3; i++) if (!free(i, j)) ok = false
      if (ok) {
        const cells: number[] = []
        for (let j = gjj; j <= gjj + 1; j++) for (let i = gi; i <= gi + 3; i++) cells.push(K(i, j))
        const p = addProp('garden', C(gi) + CELL * 1.5, C(gjj) + CELL / 2, 0, cells, CELL * 4)
        if (free(gi + 1, gjj + 2)) addSpot({ kind: 'work', x: C(gi + 1), z: C(gjj + 2) - 0.25, facing: Math.PI, ax: C(gi + 1), az: C(gjj + 2), room: -1, owner: '', prop: p })
      }
    }
  }
  if (T.ruined) {
    // Rubble in the streets' edges, and a fire for those who stayed.
    for (let n = 0; n < 9; n++) {
      const i = 3 + Math.floor(rng() * (W - 6))
      const j = 9 + Math.floor(rng() * 20)
      if (free(i, j) && at(i, j) !== TC_FLOOR) addProp('rubble', C(i), C(j), rng() * 6.28, [K(i, j)])
    }
  }

  // ── Interiors: chairs for the people inside ──
  for (let hi = 0; hi < T.houses.length; hi++) {
    const h = T.houses[hi]!
    // (A taproom has its own stools.)
    if (!h.inside || h.kind === 'tavern') continue
    const fj = h.j0 + h.cd - 1
    // A seat in the back corner across from the work place.
    const west = h.doorI >= h.i0 + h.cw / 2
    const si = west ? h.i0 + h.cw - 2 : h.i0 + 1
    const sj = h.j0 + 1
    if (sj < fj) addSpot({ kind: 'seat', x: C(si) + (west ? 0.35 : -0.35), z: C(sj) - 0.35, facing: west ? -2.4 : 2.4, ax: C(si), az: C(sj), room: hi, owner: '', prop: -1 })
  }

  // ── The guards' round: the square's corners and the streets' ends ──
  const round: Array<[number, number]> = [[SQ.i0 + 1, FRONT[0] + 2], [SQ.i1 - 1, FRONT[0] + 2], [SQ.i1 + 4, FRONT[1] + 2], [SQ.i1 - 1, FRONT[1] + 2],
    [ROAD.i1, FRONT[2] + 3], [SQ.i0 + 1, FRONT[1] + 2], [SQ.i0 - 4, FRONT[1] + 2]]
  const open = (i: number, j: number): boolean => { const c = at(i, j); return (c === TC_STREET || c === TC_SQUARE || c === TC_GRASS) && !doorstep(i, j) }
  T.patrol = round.map(([i, j]) => { const c = nearestFree(i, j, open, 4); return [C(c[0]), C(c[1])] })
}

/** The nearest cell to (i, j) that `ok` accepts, searching outward in rings. */
const nearestFree = (i: number, j: number, ok: (i: number, j: number) => boolean, max: number): [number, number] => {
  if (ok(i, j)) return [i, j]
  for (let r = 1; r <= max; r++) {
    for (let dj = -r; dj <= r; dj++) {
      for (let di = -r; di <= r; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue
        if (ok(i + di, j + dj)) return [i + di, j + dj]
      }
    }
  }
  return [i, j]
}

/**
 * Which house a point is in: its room (`room`, -1 outdoors), and whether it is
 * in the doorway. Who can be spoken to from where: the people of one room,
 * and anybody either side of a doorway.
 */
export const townRoomAt = (t: TownPlan, x: number, z: number): { room: number; door: boolean } => {
  const i = Math.floor(x / CELL)
  const j = Math.floor(z / CELL)
  const H = t.cell.length / t.w
  if (i < 0 || j < 0 || i >= t.w || j >= H) return { room: -1, door: false }
  const k = j * t.w + i
  const c = t.cell[k]
  if (c === TC_FLOOR) return { room: t.room[k]!, door: false }
  // A taproom's table stands in its room.
  if (c === TC_PROP && (t.room[k] ?? -1) >= 0) return { room: t.room[k]!, door: false }
  if (c === TC_DOOR) return { room: t.room[k]!, door: true }
  return { room: -1, door: false }
}

/** Can somebody at (ax, az) talk to somebody at (bx, bz)? Not through a wall. */
export const townCanTalk = (t: TownPlan, ax: number, az: number, bx: number, bz: number): boolean => {
  const a = townRoomAt(t, ax, az)
  const b = townRoomAt(t, bx, bz)
  if (a.room === b.room) return true
  if (a.door) return b.room === -1 || b.room === a.room
  if (b.door) return a.room === -1 || a.room === b.room
  return false
}

// ─── The walk grid of a layout (tests, validation) ──────────────────────────

/** The sim's walk grid for a town layout: walls solid, yards and props low. */
export const townGrid = (l: { w: number; h: number; solid: Uint8Array; kind: Uint8Array }): Grid => {
  const g = createGrid(l.w, l.h)
  for (let k = 0; k < l.solid.length; k++) g.solid[k] = (l.solid[k] ? SOLID_TERRAIN : 0) | (l.kind[k] === K_BLOCK ? SOLID_LOW : 0)
  return g
}

/** Is there a walk from (ax, az) to (bx, bz) on a grid? */
export const townReach = (g: Grid, ax: number, az: number, bx: number, bz: number): boolean => {
  if (Math.floor(ax / CELL) === Math.floor(bx / CELL) && Math.floor(az / CELL) === Math.floor(bz / CELL)) return true
  return findPath(g, ax, az, bx, bz, scratch, 6000) > 0
}
const scratch: number[] = []

/** The town as text, one character a cell (debugging and tests). */
export const townAscii = (l: TownLayout): string => {
  const ch = ['.', '=', '#', '_', 'D', 'H', '%', 'o', '+', ',', 'T']
  const rows: string[] = []
  const pp = new Set(l.town.people.map(p => Math.floor(p.z / CELL) * l.w + Math.floor(p.x / CELL)))
  for (let j = 0; j < l.h; j++) {
    let s = ''
    for (let i = 0; i < l.w; i++) {
      const k = j * l.w + i
      s += pp.has(k) ? '@' : ch[l.town.cell[k]!] ?? '?'
    }
    rows.push(s)
  }
  return rows.join('\n')
}
