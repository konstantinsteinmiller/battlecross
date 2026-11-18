import { CELL } from './grid'
import { K_BLOCK, noFeatures } from './zoneFeatures'
import type { ZonePlan } from './zoneGen'

/**
 * The Undercroft's field: one long, narrow chain of rooms seen from the south, the hero starting at the foot and going north.
 *
 *   warden arena      wide, with room to run
 *   stash room        a hall with three chests
 *   cart lane         one straight rail lane, five cells wide, a very long way
 *   corridor          six cells wide, dark
 *   entry             where the trapdoor drops him
 */

export const UNDER_W = 24
export const UNDER_H = 236

const mid = (i: number): number => (i + 0.5) * CELL

/** Rows (j) of each room, top (north) to bottom. */
export const ROOMS = {
  warden: { j0: 4, j1: 25, i0: 2, i1: 21 },
  stash: { j0: 26, j1: 41, i0: 4, i1: 19 },
  cart: { j0: 42, j1: 191, i0: 9, i1: 13 },
  corridor: { j0: 192, j1: 223, i0: 8, i1: 14 },
  entry: { j0: 224, j1: 233, i0: 5, i1: 17 }
} as const

/** The rail lane's centre line (x) and where it starts (south) and ends (north), in metres. */
export const LANE_X = ((ROOMS.cart.i0 + ROOMS.cart.i1 + 1) / 2) * CELL
export const CART_START_Z = (ROOMS.cart.j1 + 0.5) * CELL
export const CART_END_Z = (ROOMS.cart.j0 + 0.5) * CELL

export interface UnderLayout {
  start: { x: number; z: number }
  /** Where the hero first stands the trapdoor's drop. */
  braziers: Array<{ x: number; z: number }>
  /** The three stash chests (x, z) and where he stands to open each. */
  chests: Array<{ x: number; z: number; sx: number; sz: number }>
  /** The pressure plate before the trapped chest (the third). */
  plate: { x: number; z: number }
  /** The warden's spot, and the arena's rotten pillars. */
  warden: { x: number; z: number }
  pillars: Array<{ x: number; z: number }>
  /** The way out, past the arena's far wall. */
  exit: { x: number; z: number }
}

const layoutOf = (): UnderLayout => {
  const braziers: Array<{ x: number; z: number }> = []
  for (let k = 0; k < 4; k++) {
    const j = ROOMS.corridor.j1 - 3 - k * 8
    braziers.push({ x: mid(k % 2 ? ROOMS.corridor.i1 : ROOMS.corridor.i0), z: mid(j) })
  }
  const sj = ROOMS.stash.j0 + 4
  const chests = [ROOMS.stash.i0 + 3, ROOMS.stash.i0 + 8, ROOMS.stash.i1 - 2].map(i => ({ x: mid(i), z: mid(sj), sx: mid(i), sz: mid(sj + 2) }))
  return {
    start: { x: mid(11), z: mid(ROOMS.entry.j1 - 2) },
    braziers,
    chests,
    plate: { x: chests[2]!.sx, z: chests[2]!.sz + 0.6 },
    warden: { x: mid(11), z: mid(ROOMS.warden.j0 + 4) },
    pillars: [[5, 10], [17, 10], [5, 18], [17, 18]].map(([i, j]) => ({ x: mid(i!), z: mid(j!) })),
    exit: { x: mid(11), z: mid(ROOMS.warden.j0 + 1) }
  }
}

export const UNDER_LAYOUT: UnderLayout = layoutOf()

export const generateUndercroft = (seed: number): ZonePlan => {
  const w = UNDER_W
  const h = UNDER_H
  const solid = new Uint8Array(w * h).fill(1)
  const trail = new Uint8Array(w * h)
  const kind = new Uint8Array(w * h)
  const cave = new Uint8Array(w * h).fill(1)
  for (const r of Object.values(ROOMS)) for (let j = r.j0; j <= r.j1; j++) for (let i = r.i0; i <= r.i1; i++) solid[j * w + i] = 0
  // The rail lane's worn middle, and the chests' stands.
  for (let j = ROOMS.cart.j0; j <= ROOMS.cart.j1; j++) trail[j * w + (ROOMS.cart.i0 + ROOMS.cart.i1) / 2] = 1
  const L = UNDER_LAYOUT
  for (const c of L.chests) { const k = Math.floor(c.z / CELL) * w + Math.floor(c.x / CELL); solid[k] = 0; kind[k] = K_BLOCK }
  return {
    seed, w, h, solid, trail, kind, cave, sealed: new Uint8Array(w * h), side: new Uint8Array(w * h),
    height: new Float32Array((w + 1) * (h + 1)),
    ...noFeatures(),
    clearings: [{ x: L.start.x, z: L.start.z, r: 6 * CELL, role: 'start' }],
    start: { ...L.start },
    packs: [],
    chest: null,
    secret: null,
    buildings: [],
    npcs: [],
    gates: []
  }
}
