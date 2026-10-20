import { CELL } from './grid'
import { K_BLOCK, noFeatures } from './zoneFeatures'
import type { ZonePlan } from './zoneGen'

/**
 * ─── The siege's field: Bastion Crossing's south gate (afterplay §8.1) ──────
 *
 * One fixed layout (§12: "one new siege map layout"): the fort's wall across
 * the top of the field with the siege gate in it, a yard before the gate, and
 * three lanes running down from the yard to where the horde comes in, joined
 * by a cross way half-way down (a barricaded lane is walked round by it).
 *
 *        ███████████████████████████████████  wall (built stone), gate in its middle
 *        ███  B    P    ▓▓GATE▓▓   P    P  ███  the yard: the bell, the ballista platforms
 *        ███ lane ██████ lane ██████ lane ███
 *        ███  C   ██████  C   ██████  C   ███  each lane's cauldron stand at its chokepoint
 *        ███ ═════════ cross way ═════════ ███
 *        ███ lane ██████ lane ██████ lane ███
 *        ███        where they come in      ███
 *
 * Every fixed piece of the siege (the gate, the bell, the platforms, the
 * cauldron stands) blocks its cells from the start, empty or built: building
 * a defence changes what is drawn there, never where anybody can walk. Only a
 * barricade raises cells for a while (`sim/siege.ts`).
 *
 * Pure: the sim lays it, the view (`gfx/siegeProps.ts`) draws its pieces.
 */

export const SIEGE_W = 34
export const SIEGE_H = 40

/** The rows of the wall (built stone) and the gate's row and columns. */
const WALL_J0 = 2
const GATE_J = 3
const GATE_I0 = 15
const GATE_I1 = 18
/** The yard's rows, the lanes' rows, the cross way's and the horde's ground. */
const YARD_J0 = 4
const YARD_J1 = 9
const LANE_J0 = 10
const LANE_J1 = 33
const CROSS_J0 = 21
const CROSS_J1 = 22
const ENTRY_J0 = 34
const ENTRY_J1 = 36
/** Each lane's first column (it is six cells wide). */
const LANE_I0 = [4, 14, 24] as const
const LANE_W = 6

export interface SiegeLane {
  /** Its first column and its middle (metres). */
  i0: number
  x: number
  /** The ballista platform at its mouth, in the yard. */
  platform: { i: number; j: number; x: number; z: number }
  /** The cauldron stand on its edge at the chokepoint, and the patch the fire burns on. */
  stand: { i: number; j: number; x: number; z: number }
  fire: { x: number; z: number }
  /** The cells a barricade raises across it. */
  barricade: number[]
  /** Where the horde comes in down it. */
  entry: { x: number; z: number }
}

export interface SiegeLayout {
  lanes: SiegeLane[]
  /** The gate's cells, its middle, and where its defender (the gate's body) stands. */
  gate: { cells: number[]; x: number; z: number; front: { x: number; z: number } }
  bell: { i: number; j: number; x: number; z: number }
  /** Where gargoyles land on the wall by the gate (§8.3, wave 3). */
  leaps: Array<{ x: number; z: number }>
  start: { x: number; z: number }
}

const mid = (i: number): number => (i + 0.5) * CELL

const layoutOf = (): SiegeLayout => {
  const lanes = LANE_I0.map((i0): SiegeLane => {
    const pi = i0
    const pj = YARD_J1 - 1
    const si = i0 + LANE_W - 1
    const sj = LANE_J0 + 3
    return {
      i0,
      x: (i0 + LANE_W / 2) * CELL,
      platform: { i: pi, j: pj, x: mid(pi), z: mid(pj) },
      stand: { i: si, j: sj, x: mid(si), z: mid(sj) },
      fire: { x: (i0 + (LANE_W - 1) / 2) * CELL, z: mid(sj) },
      barricade: Array.from({ length: LANE_W }, (_, d) => (LANE_J0 + 1) * SIEGE_W + i0 + d),
      entry: { x: (i0 + LANE_W / 2) * CELL, z: mid(ENTRY_J0 + 1) }
    }
  })
  const gateCells: number[] = []
  for (let i = GATE_I0; i <= GATE_I1; i++) gateCells.push(GATE_J * SIEGE_W + i)
  const gx = ((GATE_I0 + GATE_I1 + 1) / 2) * CELL
  return {
    lanes,
    gate: { cells: gateCells, x: gx, z: mid(GATE_J), front: { x: gx, z: (YARD_J0 + 0.55) * CELL } },
    bell: { i: GATE_I0 - 3, j: YARD_J0, x: mid(GATE_I0 - 3), z: mid(YARD_J0) },
    leaps: [{ x: mid(GATE_I0 - 6), z: mid(YARD_J0 + 1) }, { x: mid(GATE_I1 + 6), z: mid(YARD_J0 + 1) }],
    start: { x: gx, z: mid(YARD_J0 + 3) }
  }
}

/** The field's fixed places (the same for every siege). */
export const SIEGE_LAYOUT: SiegeLayout = layoutOf()

/** The siege's field as a plan: walls of built stone, ridges of rock, the gate and the fixed pieces as blocks. */
export const generateSiege = (seed: number): ZonePlan => {
  const w = SIEGE_W
  const h = SIEGE_H
  const solid = new Uint8Array(w * h).fill(1)
  const trail = new Uint8Array(w * h)
  const kind = new Uint8Array(w * h)
  const masonry = new Uint8Array(w * h)
  const open = (i0: number, i1: number, j0: number, j1: number): void => {
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) solid[j * w + i] = 0
  }
  const L = SIEGE_LAYOUT
  open(3, w - 4, YARD_J0, YARD_J1)
  for (const l of L.lanes) open(l.i0, l.i0 + LANE_W - 1, LANE_J0, LANE_J1)
  open(LANE_I0[0], LANE_I0[2] + LANE_W - 1, CROSS_J0, CROSS_J1)
  open(LANE_I0[0], LANE_I0[2] + LANE_W - 1, ENTRY_J0, ENTRY_J1)
  // The fort's wall: built stone the whole width, two rows deep.
  for (let j = WALL_J0; j <= GATE_J; j++) for (let i = 0; i < w; i++) masonry[j * w + i] = 1
  // The gate stands in the wall's front row: open ground under it, blocked by
  // what is built there (`gfx/siegeProps.ts` draws it), as the bell, the
  // platforms and the stands are.
  const block = (k: number): void => { solid[k] = 0; masonry[k] = 0; kind[k] = K_BLOCK }
  for (const k of L.gate.cells) block(k)
  block(L.bell.j * w + L.bell.i)
  for (const l of L.lanes) {
    block(l.platform.j * w + l.platform.i)
    block(l.stand.j * w + l.stand.i)
  }
  // The worn ground: down every lane's middle, across the yard to the gate.
  for (const l of L.lanes) {
    const c = l.i0 + 2
    for (let j = YARD_J1; j <= ENTRY_J1; j++) for (let i = c; i <= c + 1; i++) trail[j * w + i] = 1
  }
  for (let j = YARD_J0 + 1; j <= YARD_J0 + 3; j++) for (let i = LANE_I0[0] + 2; i <= LANE_I0[2] + 3; i++) if (!kind[j * w + i]) trail[j * w + i] = 1
  return {
    seed, w, h, solid, trail, kind, cave: new Uint8Array(w * h), sealed: new Uint8Array(w * h), side: new Uint8Array(w * h),
    // The field before the fort is trodden flat.
    height: new Float32Array((w + 1) * (h + 1)),
    ...noFeatures(),
    clearings: [{ x: L.start.x, z: L.start.z, r: 6 * CELL, role: 'finale' }],
    start: { ...L.start },
    packs: [],
    chest: null,
    secret: null,
    buildings: [],
    npcs: [],
    gates: L.lanes.map((l): [number, number] => [l.entry.x, l.entry.z]),
    masonry
  }
}
