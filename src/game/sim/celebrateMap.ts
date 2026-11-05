import { CELL } from './grid'
import { K_BLOCK, noFeatures } from './zoneFeatures'
import type { DressPlan } from './dressing'
import type { ZonePlan } from './zoneGen'

/**
 * ─── The celebration's ground (roadmap #206) ─────────────────────────────────
 *
 * One fixed bowl of the Hollows, seen from the south (the camera's side): the camp fire in the middle with its
 * spit, the long feast table behind it, two goblin tents against the far wall, and room all round for the crowd.
 * What stands is a blocked cell; the view draws it (the level props for the fire and the tents,
 * `gfx/celebrateProps.ts` for the rest). Pure: the sim lays it, the view draws it.
 */

export const PARTY_W = 36
export const PARTY_H = 30

const mid = (i: number): number => (i + 0.5) * CELL

export interface PartyLayout {
  fire: { x: number; z: number }
  /** The feast table's middle and half length (along X). */
  table: { x: number; z: number; half: number }
  /** The hero's place: south of the fire, facing it. */
  start: { x: number; z: number }
  /** The crest banners' poles, the barrels and the tents. */
  poles: Array<{ x: number; z: number }>
  barrels: Array<{ x: number; z: number }>
  tents: Array<{ x: number; z: number }>
}

export const PARTY_LAYOUT: PartyLayout = {
  fire: { x: mid(18), z: mid(15) },
  table: { x: mid(18), z: mid(8), half: 4.6 },
  start: { x: mid(18), z: mid(19) },
  poles: [{ x: mid(7), z: mid(12) }, { x: mid(29), z: mid(12) }, { x: mid(11), z: mid(6) }, { x: mid(25), z: mid(6) }],
  barrels: [{ x: mid(26), z: mid(9) }, { x: mid(27.6), z: mid(9.4) }, { x: mid(9), z: mid(9) }],
  tents: [{ x: mid(5), z: mid(5) }, { x: mid(31), z: mid(5) }]
}

const cellsOf = (x: number, z: number, n: number): number[] => {
  const i0 = Math.floor(x / CELL) - (n === 2 ? 1 : 0)
  const j0 = Math.floor(z / CELL) - (n === 2 ? 1 : 0)
  const out: number[] = []
  for (let dj = 0; dj < n; dj++) for (let di = 0; di < n; di++) out.push((j0 + dj) * PARTY_W + i0 + di)
  return out
}

/** The bowl as a plan: rock all round, open ground inside, the fire and the tents as set pieces. */
export const generateCelebration = (seed: number): ZonePlan => {
  const w = PARTY_W
  const h = PARTY_H
  const solid = new Uint8Array(w * h).fill(1)
  const kind = new Uint8Array(w * h)
  for (let j = 3; j <= 27; j++) for (let i = 3; i <= 32; i++) solid[j * w + i] = 0
  const L = PARTY_LAYOUT
  const dressing: DressPlan[] = [{ kind: 'fire', x: L.fire.x, z: L.fire.z, a: 0, cells: cellsOf(L.fire.x, L.fire.z, 1) }]
  for (const t of L.tents) dressing.push({ kind: 'tent', x: t.x, z: t.z, a: 0, cells: cellsOf(t.x, t.z, 2) })
  for (const d of dressing) for (const k of d.cells) { solid[k] = 0; kind[k] = K_BLOCK }
  return {
    seed, w, h, solid, trail: new Uint8Array(w * h), kind, cave: new Uint8Array(w * h), sealed: new Uint8Array(w * h), side: new Uint8Array(w * h),
    height: new Float32Array((w + 1) * (h + 1)),
    ...noFeatures(),
    clearings: [{ x: L.start.x, z: L.start.z, r: 9 * CELL, role: 'start' }],
    start: { ...L.start },
    packs: [],
    chest: null,
    secret: null,
    buildings: [],
    npcs: [],
    gates: [],
    dressing
  }
}
