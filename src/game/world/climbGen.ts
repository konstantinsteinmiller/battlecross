import {
  CELL, Cell, Ramp, cellCenter, type MapData, type Room, type RoomRole, type Door, type Terrain, type SectionKind,
  type Ladder, type Lift, type Crusher, type RollerLane, type Checkpoint, type RewardSpot, type FoePost
} from './levelGen'
import { mulberry32, shuffle } from './rng'

/**
 * ─── The climb ("Tower Run") ─────────────────────────────────────────────────
 *
 * A MegaMan stage instead of a labyrinth: a hand-authored run of "screens",
 * each teaching one verb, climbing a tower and dropping back down into the
 * Core Master's arena. No jump anywhere — the verbs are stairs, ladders,
 * lifts, drops, and dodging.
 *
 *   1 Ground hall      the pad, a staircase up to a gallery (a turret on it)
 *   2 Ladder shaft     a ladder up the wall; a side ladder to a reward ledge
 *   3 Rolling stairs   a wide staircase, scrap balls roll down its lanes
 *   4 Lift hall        a shuttle over a pit, then a lift up (Rotor Drones)
 *   5 Crusher bridge   a walkway over a pit under piston crushers; a side
 *                      ladder to a reward ledge (a borrowed-weapon capsule)
 *   6 Drop descent     ledge to ledge, 3 m at a time, down to the floor
 *   7 Arena            the boss shutter, the arena at y = 0
 *
 * It is still a `MapData` — rooms, corridors, doors, the boss shutter — with
 * a `terrain` on top, so doors, portal culling, the objective and the boss
 * flow all work unchanged. The arena floor is at y = 0, so the boss needs no
 * heights at all. Deterministic from the seed (a resumed climb regenerates the
 * same tower); the seed varies the details, never the route: a mirrored
 * layout, which side the stairs sit on, how many crushers and their timing,
 * the scrap-ball rhythm, the shuttle's pace, what waits on the reward ledges.
 */

/** One storey of the tower (m). A ladder climbs one, a lift one, the stairs
 *  one (two ramp cells of half a storey), a drop falls one. */
export const STOREY = 3
/** Scrap ball radius (m). */
export const BALL_R = 0.55
const GRID_W = 32
const GRID_H = 19
/** Walls rise this far above a room's highest floor (m). */
const WALL_OVER = 5
/** Pits are drawn this deep under the floor they are cut into (m). */
const PIT_DEPTH = 12

class Builder {
  readonly W = GRID_W
  readonly H = GRID_H
  cell = new Uint8Array(GRID_W * GRID_H)
  room = new Int16Array(GRID_W * GRID_H).fill(-1)
  floor = new Float32Array(GRID_W * GRID_H)
  ramp = new Uint8Array(GRID_W * GRID_H)
  rise = new Float32Array(GRID_W * GRID_H)
  pit = new Uint8Array(GRID_W * GRID_H)
  rooms: Room[] = []
  doors: Door[] = []
  sections: SectionKind[] = []
  ladders: Ladder[] = []
  lifts: Lift[] = []
  crushers: Crusher[] = []
  lanes: RollerLane[] = []
  checkpoints: Checkpoint[] = []
  rewards: RewardSpot[] = []
  foes: FoePost[] = []

  k(i: number, j: number): number { return j * this.W + i }

  addRoom(x0: number, z0: number, w: number, h: number, role: RoomRole, kind: SectionKind, y: number): Room {
    const parent = this.rooms.length - 1
    const r: Room = {
      id: this.rooms.length, x0, z0, w, h, depth: this.rooms.length, parent, children: [], role, door: -1,
      spots: [], wallSpots: []
    }
    if (parent >= 0) this.rooms[parent]!.children.push(r.id)
    this.rooms.push(r)
    this.sections.push(kind)
    for (let j = z0; j < z0 + h; j++) {
      for (let i = x0; i < x0 + w; i++) {
        const k = this.k(i, j)
        this.cell[k] = Cell.Room
        this.room[k] = r.id
        this.floor[k] = y
      }
    }
    return r
  }

  /** Floor height over a rectangle of cells (inclusive). */
  level(i0: number, j0: number, i1: number, j1: number, y: number): void {
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) this.floor[this.k(i, j)] = y
  }

  pits(i0: number, j0: number, i1: number, j1: number): void {
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) this.pit[this.k(i, j)] = 1
  }

  stair(i: number, j: number, dir: Ramp, lo: number, rise: number): void {
    const k = this.k(i, j)
    this.ramp[k] = dir
    this.floor[k] = lo
    this.rise[k] = rise
  }

  /** A straight corridor out of the last room: `n` cells from (i, j) along
   *  (di, dj); the door stands in its last cell, facing the next room. */
  corridor(i: number, j: number, di: number, dj: number, n: number, y: number, boss = false): void {
    for (let s = 0; s < n; s++) {
      const k = this.k(i + di * s, j + dj * s)
      this.cell[k] = Cell.Corridor
      this.floor[k] = y
    }
    const from = this.rooms.length - 1
    this.doors.push({
      id: this.doors.length, i: i + di * (n - 1), j: j + dj * (n - 1), axis: di !== 0 ? 'x' : 'z',
      dir: (di !== 0 ? di : dj) as 1 | -1, from, to: from + 1, boss
    })
  }

  checkpoint(i: number, j: number, yaw: number, cells: Array<[number, number]>): void {
    const r = this.room[this.k(i, j)]!
    this.checkpoints.push({
      x: cellCenter(i), z: cellCenter(j), y: this.floor[this.k(i, j)]!, yaw, room: r,
      cells: cells.map(([a, b]) => this.k(a, b))
    })
  }

  /** A machine's post, leashed to a rectangle of cells (inclusive). */
  foe(role: FoePost['role'], i: number, j: number, yaw: number, box: [number, number, number, number], fly?: [number, number]): void {
    const [i0, j0, i1, j1] = box
    const pad = 0.75
    this.foes.push({
      role, x: cellCenter(i), z: cellCenter(j), y: this.floor[this.k(i, j)]!, yaw, room: this.room[this.k(i, j)]!,
      leash: [i0 * CELL + pad, j0 * CELL + pad, (i1 + 1) * CELL - pad, (j1 + 1) * CELL - pad], fly
    })
  }
}

/** Facing yaw (the game's convention: forward = (−sin, −cos)) toward +X etc. */
const YAW_PX = -Math.PI / 2
const YAW_NX = Math.PI / 2
const YAW_PZ = Math.PI
const YAW_NZ = 0

/**
 * Build the tower for `seed`. Every storey is STOREY metres: floor levels
 * L0..L5 = 0, 3, … 15.
 */
export const generateClimb = (seed: number): MapData => {
  const rng = mulberry32(seed ^ 0xc11b)
  const b = new Builder()
  const L = (n: number) => n * STOREY
  const half = STOREY / 2

  // ── 1 Ground hall ─────────────────────────────────────────────────────────
  // The pad on the floor, a staircase (two ramp cells) up to a gallery along
  // the back wall, the way on at the gallery's far end. The seed picks which
  // of two columns the stairs climb in.
  b.addRoom(2, 3, 6, 5, 'start', 'hall', L(0))
  b.level(2, 3, 7, 3, L(1))
  const stairI = rng() < 0.5 ? 6 : 5
  b.stair(stairI, 5, Ramp.NZ, L(0), half)
  b.stair(stairI, 4, Ramp.NZ, half, half)
  // Machines a few metres off the pad, never on it: one by the back wall
  // under the gallery, one across the hall.
  b.foe('turret', 3, 3, YAW_PZ, [3, 3, 3, 3])
  b.foe('ground', 2, 4, YAW_PZ, [2, 4, 4, 5])
  b.foe('ground', 7, 6, YAW_NX, [7, 5, 7, 7])
  b.corridor(8, 3, 1, 0, 2, L(1))

  // ── 2 Ladder shaft ────────────────────────────────────────────────────────
  // A landing, a ladder up the wall to the upper ledge and the way on; a
  // second ladder up the other wall to a reward alcove that leads nowhere.
  b.addRoom(10, 2, 3, 4, 'combat', 'ladder', L(1))
  b.level(10, 2, 12, 2, L(2))
  b.level(12, 3, 12, 3, L(2))
  b.level(10, 5, 10, 5, L(2))
  b.ladders.push({ i: 11, j: 3, di: 0, dj: -1, y0: L(1), y1: L(2), side: false })
  b.ladders.push({ i: 10, j: 4, di: 0, dj: 1, y0: L(1), y1: L(2), side: true })
  b.rewards.push({ x: cellCenter(10), z: cellCenter(5), y: L(2), room: 1, kind: 'hp' })
  b.checkpoint(10, 3, YAW_PX, [[10, 3], [11, 3], [10, 4], [11, 4], [12, 4], [11, 5], [12, 5]])
  b.foe('flyer', 11, 4, YAW_NX, [10, 2, 12, 5], [L(1), L(2)])
  b.corridor(13, 2, 1, 0, 2, L(2))

  // ── 3 Rolling stairs ──────────────────────────────────────────────────────
  // Three lanes up a wide staircase; scrap balls drop out of hatches in the
  // gantry at the top and roll down into the gutter at the foot. Every lane
  // fires on the same period, staggered, so a free lane always exists.
  b.addRoom(15, 1, 4, 3, 'combat', 'rolling', L(2))
  for (let j = 1; j <= 3; j++) {
    b.stair(16, j, Ramp.PX, L(2), half)
    b.stair(17, j, Ramp.PX, L(2) + half, half)
  }
  b.level(18, 1, 18, 3, L(3))
  const lanePeriod = 2.7 + rng() * 0.6
  const laneOrder = shuffle(rng, [0, 1, 2])
  for (let n = 0; n < 3; n++) {
    b.lanes.push({
      x: 18 * CELL + 0.35, z: cellCenter(1 + n), dx: -1, dz: 0, len: 18 * CELL + 0.35 - 16 * CELL,
      period: lanePeriod, phase: laneOrder[n]! * lanePeriod / 3, room: 2
    })
  }
  b.checkpoint(15, 2, YAW_PX, [[15, 1], [15, 2], [15, 3]])
  b.corridor(19, 2, 1, 0, 2, L(3))

  // ── 4 Lift hall ───────────────────────────────────────────────────────────
  // The entry ledge, a three-cell pit the shuttle crosses, the far ledge, and
  // a lift up to the upper level around it. Rotor Drones patrol the heights.
  b.addRoom(21, 1, 7, 4, 'combat', 'lift', L(3))
  b.pits(22, 1, 24, 4)
  b.level(26, 1, 27, 4, L(4))
  b.pits(26, 2, 26, 2)
  const shuttle = 2.3 + rng() * 0.8
  b.lifts.push({
    kind: 'h', hw: 1.46, hd: 1.46, ax: cellCenter(22), ay: L(3), az: cellCenter(2), bx: cellCenter(24), by: L(3), bz: cellCenter(2),
    travel: shuttle, wait: 1.3, phase: rng() * (shuttle + 1.3) * 2, room: 3
  })
  b.lifts.push({
    kind: 'v', hw: 1.46, hd: 1.46, ax: cellCenter(26), ay: L(3), az: cellCenter(2), bx: cellCenter(26), by: L(4), bz: cellCenter(2),
    travel: 1.9, wait: 1.6, phase: 0, room: 3
  })
  b.checkpoint(21, 2, YAW_PX, [[21, 1], [21, 2], [21, 3], [21, 4]])
  b.checkpoint(25, 2, YAW_PX, [[25, 1], [25, 2], [25, 3], [25, 4]])
  b.foe('flyer', 25, 3, YAW_NX, [21, 1, 27, 4], [L(3), L(4)])
  b.foe('flyer', 27, 1, YAW_NX, [21, 1, 27, 4], [L(3), L(4)])
  b.corridor(27, 5, 0, 1, 2, L(4))

  // ── 5 Crusher bridge ──────────────────────────────────────────────────────
  // A one-cell walkway over a pit, piston crushers over it; a safe cell
  // between them with a spur and a side ladder up to a reward ledge.
  b.addRoom(25, 7, 5, 7, 'combat', 'crusher', L(4))
  b.pits(25, 7, 29, 13)
  for (const [i, j] of [[26, 7], [27, 7], [28, 7], [25, 13], [26, 13], [27, 13], [28, 13], [26, 10], [25, 10]] as const) {
    b.pit[b.k(i, j)] = 0
  }
  for (let j = 8; j <= 12; j++) b.pit[b.k(27, j)] = 0
  b.level(25, 10, 25, 10, L(5))
  b.ladders.push({ i: 26, j: 10, di: -1, dj: 0, y0: L(4), y1: L(5), side: true })
  // The harder ledge holds the better prize: a borrowed Core Master weapon
  // (`sim/borrowed.ts` places and pays it; the climb's runtime skips it).
  b.rewards.push({ x: cellCenter(25), z: cellCenter(10), y: L(5), room: 4, kind: 'weapon' })
  // Never over the first walkway cell: from the entry ledge the walk ahead
  // must be in view, crushers and all.
  const slams = rng() < 0.5 ? [9, 11] : [9, 11, 12]
  const beat = 2.4 + rng() * 0.5
  slams.forEach((j, n) => b.crushers.push({ i: 27, j, y: L(4), period: beat, phase: (n * 0.55 + rng() * 0.2) * beat, room: 4 }))
  b.checkpoint(27, 7, YAW_PZ, [[26, 7], [27, 7], [28, 7]])
  b.corridor(24, 13, -1, 0, 2, L(4))

  // ── 6 Drop descent ────────────────────────────────────────────────────────
  // Terraces a storey apart, stepping down to the floor: each ledge is a
  // one-way drop. Turrets on the terraces, a machine waiting at the bottom.
  b.addRoom(17, 11, 6, 5, 'combat', 'descent', L(4))
  b.level(21, 11, 21, 15, L(3))
  b.level(20, 11, 20, 15, L(2))
  b.level(19, 11, 19, 15, L(1))
  b.level(17, 11, 18, 15, L(0))
  b.checkpoint(22, 13, YAW_NX, [[22, 11], [22, 12], [22, 13], [22, 14], [22, 15]])
  b.foe('turret', 20, 11, YAW_PZ, [20, 11, 20, 11])
  b.foe('turret', 19, 15, YAW_NZ, [19, 15, 19, 15])
  b.foe('ground', 17, 12, YAW_PX, [17, 11, 18, 15])
  // The last checkpoint: the floor in front of the boss shutter.
  b.checkpoint(17, 13, YAW_NX, [[17, 11], [17, 12], [17, 13], [17, 14], [17, 15], [18, 11], [18, 12], [18, 13], [18, 14], [18, 15]])
  b.corridor(16, 13, -1, 0, 2, L(0), true)

  // ── 7 Arena ───────────────────────────────────────────────────────────────
  b.addRoom(8, 10, 7, 7, 'boss', 'arena', L(0))

  // Doors lead INTO rooms: each room's door index.
  for (const d of b.doors) b.rooms[d.to]!.door = d.id

  const wallTop: number[] = []
  const pitBottom: number[] = []
  b.rooms.forEach((r, id) => {
    let hi = -Infinity
    let lo = Infinity
    for (let j = r.z0; j < r.z0 + r.h; j++) {
      for (let i = r.x0; i < r.x0 + r.w; i++) {
        const k = b.k(i, j)
        if (b.pit[k]) continue
        hi = Math.max(hi, b.floor[k]! + b.rise[k]!)
        lo = Math.min(lo, b.floor[k]!)
      }
    }
    // The arena keeps the labyrinth's wall height: the boss drops in over it.
    wallTop.push(b.sections[id] === 'arena' ? 4.2 : hi + WALL_OVER)
    pitBottom.push(lo - PIT_DEPTH)
  })

  const terrain: Terrain = {
    floor: b.floor, ramp: b.ramp, rise: b.rise, pit: b.pit, wallTop, pitBottom, sections: b.sections,
    ladders: b.ladders, lifts: b.lifts, crushers: b.crushers, lanes: b.lanes, checkpoints: b.checkpoints,
    rewards: b.rewards, foes: b.foes
  }
  // Start: on the pad in the hall, facing the stairs.
  const sx = cellCenter(3)
  const sz = cellCenter(6)
  const start = { x: sx, z: sz, yaw: Math.atan2(-(cellCenter(stairI) - sx), -(cellCenter(5) - sz)) }
  const map: MapData = {
    seed, w: b.W, h: b.H, cell: b.cell, room: b.room, navBlock: new Uint8Array(b.W * b.H), rooms: b.rooms,
    doors: b.doors, pillars: [], start, terrain
  }
  return rng() < 0.5 ? mirrorX(map) : map
}

/** The whole tower mirrored left-right: same route, the other hand. */
const mirrorX = (m: MapData): MapData => {
  const W = m.w
  const X = W * CELL
  const t = m.terrain!
  const flip = <A extends Uint8Array | Int16Array | Float32Array>(a: A): A => {
    const out = a.slice() as A
    for (let j = 0; j < m.h; j++) for (let i = 0; i < W; i++) out[j * W + i] = a[j * W + (W - 1 - i)]!
    return out
  }
  const ramp = flip(t.ramp)
  for (let k = 0; k < ramp.length; k++) {
    if (ramp[k] === Ramp.PX) ramp[k] = Ramp.NX
    else if (ramp[k] === Ramp.NX) ramp[k] = Ramp.PX
  }
  const mi = (i: number) => W - 1 - i
  const mk = (k: number) => { const i = k % W; return (k - i) + mi(i) }
  const box = (l: [number, number, number, number]): [number, number, number, number] => [X - l[2], l[1], X - l[0], l[3]]
  return {
    ...m,
    cell: flip(m.cell),
    room: flip(m.room),
    navBlock: flip(m.navBlock),
    rooms: m.rooms.map(r => ({ ...r, x0: W - (r.x0 + r.w) })),
    doors: m.doors.map(d => ({ ...d, i: mi(d.i), dir: (d.axis === 'x' ? -d.dir : d.dir) as 1 | -1 })),
    start: { x: X - m.start.x, z: m.start.z, yaw: -m.start.yaw },
    terrain: {
      ...t,
      floor: flip(t.floor),
      ramp,
      rise: flip(t.rise),
      pit: flip(t.pit),
      ladders: t.ladders.map(l => ({ ...l, i: mi(l.i), di: -l.di })),
      lifts: t.lifts.map(l => ({ ...l, ax: X - l.ax, bx: X - l.bx })),
      crushers: t.crushers.map(c => ({ ...c, i: mi(c.i) })),
      lanes: t.lanes.map(l => ({ ...l, x: X - l.x, dx: -l.dx })),
      checkpoints: t.checkpoints.map(c => ({ ...c, x: X - c.x, yaw: -c.yaw, cells: c.cells.map(mk) })),
      rewards: t.rewards.map(r => ({ ...r, x: X - r.x })),
      foes: t.foes.map(f => ({ ...f, x: X - f.x, yaw: -f.yaw, leash: box(f.leash) }))
    }
  }
}
