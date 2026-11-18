import { CELL } from './grid'
import { K_BLOCK, noFeatures } from './zoneFeatures'
import type { ZonePlan } from './zoneGen'

/**
 * ─── The gate of the Hollows, besieged (roadmap #204) ───────────────────────
 *
 * One fixed field, seen from the south (the camera's side):
 *
 *   ███████████  ▒▒▒▒▒▒▒▒  ███████████   rock; the cave mouth (▒) in it
 *   ██  behind the palisade: the defenders ██
 *   ██ [T]═══════════ palisade ══════════[T] ██   two towers in the wall
 *   ██                                       ██
 *   ██       the rebels storm the wall       ██
 *   ██  (C)                           (C)    ██   a catapult by each side
 *   ██              [ram]                    ██   the ram in the middle
 *   ██              hero                     ██
 *
 * The palisade is a row of cells raised as a temporary blocker (`SOLID_TEMP`): it falls
 * between the towers when the second tower does. The towers, the catapults and the ram stand on
 * blocked cells so nobody walks through them; the view (`gfx/assaultProps.ts`) draws everything.
 *
 * Pure: the sim lays it, the view draws it.
 */

export const ASSAULT_W = 36
export const ASSAULT_H = 34

const mid = (i: number): number => (i + 0.5) * CELL

/** The palisade's row, its columns, and the breach between the towers. */
export const PAL_J = 10
export const PAL_I0 = 4
export const PAL_I1 = 31
export const BREACH_I0 = 14
export const BREACH_I1 = 23
/** The great gate that swings open for the sally (#EXT-7): four cells (6 m) in the middle of the wall, on the cave mouth's axis. */
export const SALLY_GATE_I0 = 16
export const SALLY_GATE_I1 = 19
/** The cave mouth's columns and rows (behind the palisade). */
const MOUTH_I0 = 15
const MOUTH_I1 = 20
const MOUTH_J0 = 3

export interface AssaultTower {
  /** Its middle (m), and the cells it stands on (2 × 2). */
  x: number
  z: number
  cells: number[]
  /** Where the ram stops in front of it. */
  foot: { x: number; z: number }
  /** Where the archers stand: the platform's height (m) and spots round its middle. */
  top: number
}

export interface AssaultCatapult {
  x: number
  z: number
  /** Where the hero pulls the lever. */
  lever: { x: number; z: number }
  /** The tower it throws at (index). */
  at: number
  cells: number[]
}

export interface AssaultLayout {
  towers: AssaultTower[]
  catapults: AssaultCatapult[]
  ram: { x: number; z: number; cells: number[] }
  /** The rams: the first in the middle of the yard (for the first tower), the second waiting almost at the wall before the other tower. */
  rams: Array<{ x: number; z: number }>
  start: { x: number; z: number }
  /** The cave mouth's middle, and the line the party pours through. */
  mouth: { x: number; z: number }
  /** The palisade, front and back (m). */
  wallZ: number
  /** Where the rebels storm: spots along the wall's foot, and the ground they fall back to. */
  storm: Array<{ x: number; z: number }>
  rally: Array<{ x: number; z: number }>
  /** Where the defenders stand behind the wall. */
  behind: Array<{ x: number; z: number }>
}

const tower = (i0: number, j0: number): AssaultTower => {
  const cells = [j0 * ASSAULT_W + i0, j0 * ASSAULT_W + i0 + 1, (j0 + 1) * ASSAULT_W + i0, (j0 + 1) * ASSAULT_W + i0 + 1]
  const x = (i0 + 1) * CELL
  const z = (j0 + 1) * CELL
  return { x, z, cells, foot: { x, z: z + 2.6 * CELL }, top: 4.4 }
}

const catapult = (i0: number, j0: number, at: number, leverSide: 1 | -1): AssaultCatapult => {
  const cells = [j0 * ASSAULT_W + i0, j0 * ASSAULT_W + i0 + 1, (j0 + 1) * ASSAULT_W + i0, (j0 + 1) * ASSAULT_W + i0 + 1]
  const x = (i0 + 1) * CELL
  const z = (j0 + 1) * CELL
  return { x, z, lever: { x: x + leverSide * 2.2, z: z + 1.5 }, at, cells }
}

const layoutOf = (): AssaultLayout => {
  const towers = [tower(8, PAL_J - 1), tower(26, PAL_J - 1)]
  const catapults = [catapult(5, 22, 0, 1), catapult(28, 22, 1, -1)]
  const storm: Array<{ x: number; z: number }> = []
  for (let i = 6; i <= 29; i += 2) storm.push({ x: mid(i), z: (PAL_J + 2.2) * CELL })
  const rally: Array<{ x: number; z: number }> = []
  for (let i = 7; i <= 28; i += 3) rally.push({ x: mid(i), z: (PAL_J + 6.5) * CELL })
  const behind: Array<{ x: number; z: number }> = []
  for (let i = 8; i <= 27; i += 4) behind.push({ x: mid(i), z: (PAL_J - 3) * CELL })
  return {
    towers,
    catapults,
    ram: { x: mid(17), z: mid(25), cells: [] },
    rams: [{ x: mid(17), z: mid(25) }, { x: towers[1]!.foot.x, z: towers[1]!.foot.z + 5 }],
    start: { x: mid(17), z: mid(29) },
    mouth: { x: ((MOUTH_I0 + MOUTH_I1 + 1) / 2) * CELL, z: mid(MOUTH_J0 + 1) },
    wallZ: (PAL_J + 0.5) * CELL,
    storm,
    rally,
    behind
  }
}

/** The field's fixed places (the same for every siege). */
export const ASSAULT_LAYOUT: AssaultLayout = layoutOf()

/** The palisade's cells (the temporary blocker), and the part of it that falls between the towers. */
export const palisadeCells = (): number[] => {
  const out: number[] = []
  for (let i = PAL_I0; i <= PAL_I1; i++) out.push(PAL_J * ASSAULT_W + i)
  return out
}
export const breachCells = (): number[] => {
  const out: number[] = []
  for (let i = BREACH_I0; i <= BREACH_I1; i++) out.push(PAL_J * ASSAULT_W + i)
  return out
}

/** The field as a plan: a rock bowl, the cave mouth in its far wall, the fixed pieces as blocks. */
export const generateAssault = (seed: number): ZonePlan => {
  const w = ASSAULT_W
  const h = ASSAULT_H
  const solid = new Uint8Array(w * h).fill(1)
  const trail = new Uint8Array(w * h)
  const kind = new Uint8Array(w * h)
  const cave = new Uint8Array(w * h)
  const open = (i0: number, i1: number, j0: number, j1: number): void => {
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) solid[j * w + i] = 0
  }
  const L = ASSAULT_LAYOUT
  open(4, 31, 6, 31)
  open(MOUTH_I0, MOUTH_I1, MOUTH_J0, 5)
  for (let j = MOUTH_J0; j <= 5; j++) for (let i = MOUTH_I0; i <= MOUTH_I1; i++) cave[j * w + i] = 1
  const block = (k: number): void => { solid[k] = 0; kind[k] = K_BLOCK }
  for (const t of L.towers) for (const k of t.cells) block(k)
  for (const c of L.catapults) for (const k of c.cells) block(k)
  // The worn ground: from where the hero stands up to the wall, and along its foot.
  for (let j = PAL_J + 1; j <= 29; j++) for (let i = 16; i <= 18; i++) if (!kind[j * w + i]) trail[j * w + i] = 1
  for (let i = 6; i <= 29; i++) trail[(PAL_J + 2) * w + i] = 1
  return {
    seed, w, h, solid, trail, kind, cave, sealed: new Uint8Array(w * h), side: new Uint8Array(w * h),
    height: new Float32Array((w + 1) * (h + 1)),
    ...noFeatures(),
    clearings: [{ x: L.start.x, z: L.start.z, r: 8 * CELL, role: 'start' }],
    start: { ...L.start },
    packs: [],
    chest: null,
    secret: null,
    buildings: [],
    npcs: [],
    gates: []
  }
}
