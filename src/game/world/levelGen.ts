import { mulberry32, randInt, shuffle, type Rng } from './rng'

/**
 * ─── Procedural sector maps ──────────────────────────────────────────────────
 *
 * A map is a grid of 3 m cells. Rooms are GROWN off the start room: each new
 * room hangs off an existing one by a straight corridor with a sliding door at
 * the new room's threshold. That gives the Blades shape for free — a readable
 * main path of rooms with short side branches ending in treasure — and makes
 * the map a tree, so "the farthest room" is a well-defined objective / boss
 * room and a door always faces into the room it guards.
 *
 * Everything is reproducible from `seed`, which is what lets a mission
 * snapshot store only what the player changed.
 */

export const CELL = 3
export const WALL_H = 4.2

export const enum Cell { Void = 0, Room = 1, Corridor = 2 }

export type RoomRole = 'start' | 'combat' | 'treasure' | 'objective' | 'boss'

/** The four grid neighbours, in a fixed order (+X, −X, +Z, −Z). */
export const DIRS4: ReadonlyArray<readonly [number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export interface Room {
  id: number
  x0: number
  z0: number
  w: number
  h: number
  depth: number
  parent: number
  children: number[]
  role: RoomRole
  /** Door index leading INTO this room (none for the start room). */
  door: number
  /** Interior cells shuffled, minus cells next to doors (spawns, pickups). */
  spots: Array<[number, number]>
  /** Edge cells against a wall, minus doorways (crates, chests, terminals). */
  wallSpots: Array<[number, number, number]> // i, j, facing yaw
}

export interface Door {
  id: number
  i: number
  j: number
  /** Corridor axis: 'x' = corridor runs along X, so the panel spans Z. */
  axis: 'x' | 'z'
  /** Sign of travel from parent into child along the axis. */
  dir: 1 | -1
  from: number
  to: number
  boss: boolean
}

export interface Pillar {
  x: number
  z: number
  r: number
}

export interface MapData {
  seed: number
  w: number
  h: number
  cell: Uint8Array
  /** Room id per cell (corridor cells hold -1). */
  room: Int16Array
  /** 1 where a static obstacle (pillar) blocks path-finding. */
  navBlock: Uint8Array
  rooms: Room[]
  doors: Door[]
  pillars: Pillar[]
  start: { x: number; z: number; yaw: number }
  /** Floor heights, ladders, lifts, pits and timed obstacles (the climb,
   *  `climbGen.ts`). Absent on every labyrinth map: those stay flat at y = 0
   *  and nothing below reads this unless it is there. */
  terrain?: Terrain
}

// ─── Terrain (the climb) ─────────────────────────────────────────────────────

/** Which way a ramp cell climbs: its floor rises across the cell toward
 *  +X, −X, +Z or −Z (0 = a flat cell). The stairs are drawn as steps, walked
 *  as a slope. */
export const enum Ramp { None = 0, PX = 1, NX = 2, PZ = 3, NZ = 4 }

/** A ladder bolted to the cliff face between two floors. */
export interface Ladder {
  /** The foot cell: the lower floor, in front of the wall. */
  i: number
  j: number
  /** From the foot cell toward the wall (and the top cell): one axis, ±1. */
  di: number
  dj: number
  /** Floor heights at the foot and at the top (m). */
  y0: number
  y1: number
  /** Off the main line: it leads to a reward ledge. */
  side: boolean
}

/** A moving platform. `v` waits at its lower stop and rides up once stood
 *  on; `h` shuttles across a pit on a loop. Both stops are the platform's
 *  top centre. Under it the lift is a solid column (a piston, a hull), so
 *  nothing walks beneath it. */
export interface Lift {
  kind: 'v' | 'h'
  /** Half extents of the platform (m). */
  hw: number
  hd: number
  ax: number
  ay: number
  az: number
  bx: number
  by: number
  bz: number
  /** Seconds per leg and dwell at each stop. */
  travel: number
  wait: number
  /** Loop offset (s) of an `h` lift. */
  phase: number
  room: number
}

/** A piston crusher over a walkway cell: it warns, slams, holds, rises. */
export interface Crusher {
  i: number
  j: number
  /** The floor it slams onto (m). */
  y: number
  /** Seconds between slams, and the loop offset. */
  period: number
  phase: number
  room: number
}

/** A lane down a staircase that scrap balls roll along. */
export interface RollerLane {
  /** Where a ball lands out of its hatch (top of the slope) and the downhill
   *  direction (a unit axis). */
  x: number
  z: number
  dx: number
  dz: number
  /** How far it rolls before it drops into the gutter at the foot (m). */
  len: number
  period: number
  phase: number
  room: number
}

/** A restart spot: a pit fall (and a resume) puts Flux back here. Reached by
 *  standing on any of its cells. */
export interface Checkpoint {
  x: number
  z: number
  y: number
  yaw: number
  room: number
  cells: number[]
}

/** A reward ledge off the main line: bolts, a big capsule, or (`weapon`) a
 *  borrowed-weapon capsule, which `sim/borrowed.ts` owns — the climb's own
 *  runtime draws and pays only the other kinds. */
export interface RewardSpot {
  x: number
  z: number
  y: number
  room: number
  kind: 'hp' | 'we' | 'bolts' | 'weapon'
}

/** A machine's post in the climb: what kind of slot it is, where it stands,
 *  the rectangle it may not leave (its own platform) and, for a flyer, the
 *  band of heights it follows the player through. */
export interface FoePost {
  role: 'ground' | 'turret' | 'flyer'
  x: number
  z: number
  y: number
  yaw: number
  room: number
  leash: [number, number, number, number]
  fly?: [number, number]
}

export type SectionKind = 'hall' | 'ladder' | 'rolling' | 'lift' | 'crusher' | 'descent' | 'arena'

export interface Terrain {
  /** Floor height per cell (m); a ramp's height at its low edge. */
  floor: Float32Array
  ramp: Uint8Array
  /** Height a ramp cell gains across it (m). */
  rise: Float32Array
  /** 1 = no floor at all: a pit. */
  pit: Uint8Array
  /** Per room: the top of its walls and how deep its pits are drawn (m). */
  wallTop: number[]
  pitBottom: number[]
  /** Per room: which section of the climb it is. */
  sections: SectionKind[]
  ladders: Ladder[]
  lifts: Lift[]
  crushers: Crusher[]
  lanes: RollerLane[]
  checkpoints: Checkpoint[]
  rewards: RewardSpot[]
  foes: FoePost[]
}

export interface MapSpec {
  seed: number
  rooms: number
  boss: boolean
}

export const cellCenter = (i: number): number => (i + 0.5) * CELL
export const worldToCell = (x: number): number => Math.floor(x / CELL)

interface Rect { x0: number; z0: number; w: number; h: number }

const DIRS: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]]

/**
 * Generate a sector map. A boss mission needs its boss room, and the 7×7
 * room can fail to fit off every deep room on a crowded grid — so such a map
 * re-rolls from a derived seed. Deterministic: a resumed mission regenerates
 * the very same map from its quest seed.
 */
export const generateMap = (spec: MapSpec): MapData => {
  let seed = spec.seed
  for (let attempt = 0; attempt < 8; attempt++) {
    const m = generateOnce({ ...spec, seed })
    if (!spec.boss || m.rooms.some(r => r.role === 'boss')) return m
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
  }
  return generateOnce(spec)
}

const generateOnce = (spec: MapSpec): MapData => {
  const rng = mulberry32(spec.seed)
  const W = 44
  const H = 44
  const cell = new Uint8Array(W * H)
  const room = new Int16Array(W * H).fill(-1)
  const rooms: Room[] = []
  const doors: Door[] = []

  const idx = (i: number, j: number) => j * W + i
  const inBounds = (i: number, j: number) => i >= 1 && j >= 1 && i < W - 1 && j < H - 1

  /** Rect is placeable if it and a 1-cell margin are empty and in bounds. */
  const rectFree = (r: Rect, pad = 1): boolean => {
    for (let j = r.z0 - pad; j < r.z0 + r.h + pad; j++) {
      for (let i = r.x0 - pad; i < r.x0 + r.w + pad; i++) {
        if (!inBounds(i, j)) return false
        if (cell[idx(i, j)] !== Cell.Void) return false
      }
    }
    return true
  }

  const carveRoom = (r: Rect, id: number) => {
    for (let j = r.z0; j < r.z0 + r.h; j++) {
      for (let i = r.x0; i < r.x0 + r.w; i++) {
        cell[idx(i, j)] = Cell.Room
        room[idx(i, j)] = id
      }
    }
  }

  const addRoom = (r: Rect, parent: number, depth: number, door: number): Room => {
    const rm: Room = {
      id: rooms.length, ...r, depth, parent, children: [], role: 'combat', door, spots: [], wallSpots: []
    }
    rooms.push(rm)
    carveRoom(r, rm.id)
    if (parent >= 0) rooms[parent]!.children.push(rm.id)
    return rm
  }

  // Start room, off-centre so the map has room to grow in every direction.
  const s0: Rect = { x0: Math.floor(W / 2) - 2, z0: Math.floor(H / 2) - 2, w: 4, h: 4 }
  addRoom(s0, -1, 0, -1)

  /**
   * Try to hang a new room of size (w,h) off `parent` in direction `d`.
   * Returns true and carves it on success.
   */
  const tryGrow = (parent: Room, d: [number, number], w: number, h: number, len: number, boss: boolean): boolean => {
    const [dx, dz] = d
    let k: number // exit coordinate on the parent's side
    let cx: number
    let cz: number // (cx, cz) = first corridor cell
    if (dx !== 0) {
      if (parent.h < 3) return false
      k = randInt(rng, parent.z0 + 1, parent.z0 + parent.h - 2)
      cx = dx > 0 ? parent.x0 + parent.w : parent.x0 - 1
      cz = k
    } else {
      if (parent.w < 3) return false
      k = randInt(rng, parent.x0 + 1, parent.x0 + parent.w - 2)
      cz = dz > 0 ? parent.z0 + parent.h : parent.z0 - 1
      cx = k
    }
    const corridor: Array<[number, number]> = []
    for (let n = 0; n < len; n++) corridor.push([cx + dx * n, cz + dz * n])
    const [ex, ez] = corridor[corridor.length - 1]!
    // New room rect: its near side touches the corridor's end.
    let r: Rect
    if (dx !== 0) {
      const off = randInt(rng, 1, h - 2)
      r = { x0: dx > 0 ? ex + 1 : ex - w, z0: ez - off, w, h }
    } else {
      const off = randInt(rng, 1, w - 2)
      r = { x0: ex - off, z0: dz > 0 ? ez + 1 : ez - h, w, h }
    }
    if (!rectFree(r, 1)) return false
    // Corridor cells must be empty and not brush against other rooms'
    // walls (the side neighbours must be void too), except where it leaves
    // the parent and enters the child.
    for (let n = 0; n < corridor.length; n++) {
      const [i, j] = corridor[n]!
      if (!inBounds(i, j) || cell[idx(i, j)] !== Cell.Void) return false
      const side: Array<[number, number]> = dx !== 0 ? [[i, j - 1], [i, j + 1]] : [[i - 1, j], [i + 1, j]]
      for (const [si, sj] of side) {
        if (!inBounds(si, sj)) return false
        if (cell[idx(si, sj)] !== Cell.Void) return false
      }
    }
    for (const [i, j] of corridor) cell[idx(i, j)] = Cell.Corridor
    const doorId = doors.length
    const child = addRoom(r, parent.id, parent.depth + 1, doorId)
    doors.push({
      id: doorId, i: ex, j: ez, axis: dx !== 0 ? 'x' : 'z', dir: (dx !== 0 ? dx : dz) as 1 | -1,
      from: parent.id, to: child.id, boss
    })
    return true
  }

  const target = Math.max(3, spec.rooms)
  let guard = 0
  while (rooms.length < target && guard++ < 600) {
    // Bias growth toward deep rooms so there is a main path, with ~35 %
    // branches off any room.
    let parent: Room
    if (rng() < 0.35) parent = rooms[Math.floor(rng() * rooms.length)]!
    else {
      const maxDepth = rooms.reduce((m, r) => Math.max(m, r.depth), 0)
      const deep = rooms.filter(r => r.depth >= maxDepth - 1)
      parent = deep[Math.floor(rng() * deep.length)]!
    }
    if (parent.children.length >= 3) continue
    const d = DIRS[Math.floor(rng() * 4)]!
    const big = rng() < 0.4
    const w = big ? randInt(rng, 5, 7) : randInt(rng, 3, 5)
    const h = big ? randInt(rng, 5, 7) : randInt(rng, 3, 5)
    tryGrow(parent, d, w, h, randInt(rng, 2, 4), false)
  }

  // The boss / final room hangs off the DEEPEST room so it is the end of the
  // main path. Retry with every deep room and direction before giving up.
  if (spec.boss) {
    const byDepth = [...rooms].sort((a, b) => b.depth - a.depth)
    let placed = false
    for (const p of byDepth) {
      for (const d of shuffle(rng, [...DIRS])) {
        if (tryGrow(p, d, 7, 7, 3, true)) { placed = true; break }
      }
      if (placed) break
    }
  }

  // ── Roles ────────────────────────────────────────────────────────────────
  rooms[0]!.role = 'start'
  const last = rooms[rooms.length - 1]!
  if (spec.boss && doors.length && doors[doors.length - 1]!.boss) last.role = 'boss'
  const nonBoss = rooms.filter(r => r.role !== 'boss' && r.role !== 'start')
  const deepest = nonBoss.reduce<Room | null>((m, r) => (!m || r.depth > m.depth ? r : m), null)
  for (const r of nonBoss) {
    if (r.children.length === 0 && r !== deepest) r.role = 'treasure'
  }
  if (deepest) deepest.role = 'objective'

  // ── Pillars in big rooms ─────────────────────────────────────────────────
  const navBlock = new Uint8Array(W * H)
  const pillars: Pillar[] = []
  for (const r of rooms) {
    if (r.role === 'start' || r.role === 'boss') continue
    if (r.w >= 5 && r.h >= 5 && rng() < 0.75) {
      const inset = r.w >= 7 || r.h >= 7 ? 2 : 1
      const pts: Array<[number, number]> = [
        [r.x0 + inset, r.z0 + inset], [r.x0 + r.w - 1 - inset, r.z0 + inset],
        [r.x0 + inset, r.z0 + r.h - 1 - inset], [r.x0 + r.w - 1 - inset, r.z0 + r.h - 1 - inset]
      ]
      for (const [i, j] of pts) {
        pillars.push({ x: cellCenter(i), z: cellCenter(j), r: 0.62 })
        navBlock[idx(i, j)] = 1
      }
    }
  }

  // ── Spots ────────────────────────────────────────────────────────────────
  const nearDoor = (i: number, j: number): boolean => {
    for (const d of doors) {
      if (Math.abs(d.i - i) + Math.abs(d.j - j) <= 1) return true
    }
    return false
  }
  // Cells directly inside a doorway (the room cell the corridor enters).
  const doorway = new Set<number>()
  for (const d of doors) {
    for (const [di, dj] of DIRS) {
      const i = d.i + di
      const j = d.j + dj
      if (cell[idx(i, j)] === Cell.Room) doorway.add(idx(i, j))
    }
  }
  for (const r of rooms) {
    const spots: Array<[number, number]> = []
    const wallSpots: Array<[number, number, number]> = []
    for (let j = r.z0; j < r.z0 + r.h; j++) {
      for (let i = r.x0; i < r.x0 + r.w; i++) {
        if (navBlock[idx(i, j)]) continue
        if (doorway.has(idx(i, j)) || nearDoor(i, j)) continue
        spots.push([i, j])
        // Facing yaw turns an object's local +Z to point into the room, away
        // from the wall it stands against (rotation.y = yaw).
        if (i === r.x0 && cell[idx(i - 1, j)] === Cell.Void) wallSpots.push([i, j, Math.PI / 2])
        else if (i === r.x0 + r.w - 1 && cell[idx(i + 1, j)] === Cell.Void) wallSpots.push([i, j, -Math.PI / 2])
        else if (j === r.z0 && cell[idx(i, j - 1)] === Cell.Void) wallSpots.push([i, j, 0])
        else if (j === r.z0 + r.h - 1 && cell[idx(i, j + 1)] === Cell.Void) wallSpots.push([i, j, Math.PI])
      }
    }
    r.spots = shuffle(rng, spots)
    r.wallSpots = shuffle(rng, wallSpots)
  }

  // Start: centre of the start room, facing its first door.
  const sr = rooms[0]!
  const sx = cellCenter(sr.x0) + (sr.w - 1) * CELL / 2
  const sz = cellCenter(sr.z0) + (sr.h - 1) * CELL / 2
  let yaw = 0
  const firstDoor = doors.find(d => d.from === 0)
  if (firstDoor) yaw = Math.atan2(-(cellCenter(firstDoor.i) - sx), -(cellCenter(firstDoor.j) - sz))

  return { seed: spec.seed, w: W, h: H, cell, room, navBlock, rooms, doors, pillars, start: { x: sx, z: sz, yaw } }
}

/** Room centre in world space. */
export const roomCenter = (r: Room): [number, number] => [
  cellCenter(r.x0) + (r.w - 1) * CELL / 2,
  cellCenter(r.z0) + (r.h - 1) * CELL / 2
]

export type { Rng }
