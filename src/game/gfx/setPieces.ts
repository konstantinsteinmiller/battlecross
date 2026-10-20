import type { BufferGeometry } from 'three'
import type { DressKind } from '../sim/dressing'
import { ell, mixHex, paint, rbox, rcone, rcyl, rock, sph, tone, torus, xform } from './kit'

/**
 * ─── Set pieces: what makes each place itself (roadmap #120) ─────────────────
 *
 * The goblins' straw beds, fires, banners and tents in the Hollows, the
 * windmills on the Oakhaven fields, the Sunken Temple's columns, the Deep
 * Mines' timbers, rails, carts and crates, the floes on the tundra's lake,
 * the citadel's pylons, the fortress's gate towers and colours, boulders in
 * the Crags' lava and shards adrift in the Rift (`sim/dressing.ts` lays them).
 *
 * Each is built at the origin on flat ground (y = 0), its length along +Z,
 * and turned and set down where it stands by the caller; every one is merged
 * into the level's static props (`levelProps.ts`), so they cost no draw
 * calls of their own. Neighbouring faces of one piece never lie in one plane
 * (a centimetre or more apart, house rule: never z-fighting).
 */

const P = (g: BufferGeometry, hex: string, p?: [number, number, number], r?: [number, number, number], s?: number | [number, number, number]): BufferGeometry =>
  xform(paint(g, hex), p, r, s ?? 1)

export interface PiecePalette {
  /** The place's own rock (boulders, a tower's stone), light and dark. */
  rock: string
  rock2: string
}

export interface PieceGeo { lit: BufferGeometry[]; glow: BufferGeometry[] }

/** Where the liquid's surface lies below the ground's height at a wet cell (`terrain.ts`'s WATER_Y). */
const WET = -0.17

const bed = (seed: number): PieceGeo => {
  // A goblin's bed: a frame of poles on stumps, a heap of straw, a ragged
  // fur thrown over it and a sack for a pillow.
  const lit: BufferGeometry[] = []
  for (const sx of [-1, 1]) {
    lit.push(P(rcyl(0.08, 2.5, 0.03, 7, 1), '#6a4a2c', [sx * 0.52, 0.2, 0], [Math.PI / 2, 0, 0]))
    for (const sz of [-1, 1]) lit.push(P(rcyl(0.1, 0.24, 0.03, 7, 1), '#5a3e26', [sx * 0.52, 0.1, sz * 1.08]))
  }
  lit.push(P(rbox(1.0, 0.24, 2.3, 0.5, 10, 6), '#d6b65c', [0, 0.34, 0.02]))
  lit.push(P(rbox(0.98, 0.1, 1.15, 0.45, 10, 4), seed % 2 ? '#7a5a3a' : '#5e4a3a', [0.03, 0.5, 0.48], [0, 0.06, 0.04]))
  lit.push(P(ell(0.3, 0.13, 0.22, 9, 6), '#c4ae84', [0, 0.52, -0.84]))
  // A few loose straws on the floor at its foot.
  for (let q = 0; q < 3; q++) lit.push(P(rcyl(0.015, 0.4, 0.005, 4, 1), '#e2c66a', [-0.3 + q * 0.3, 0.03, 1.32 + (q % 2) * 0.08], [Math.PI / 2, 0.4 * (q - 1), Math.PI / 2]))
  return { lit, glow: [] }
}

const club = (): PieceGeo => ({
  // A knobbly club lying on the ground.
  lit: [
    P(rcone(0.07, 0.15, 0.9, 0.04, 7), '#7a5230', [0, 0.11, 0], [0, 0, Math.PI / 2]),
    P(sph(0.13, 7, 5), '#6a4426', [0.42, 0.13, 0]),
    P(rcone(0.04, 0.005, 0.12, 0.01, 5), '#c8c0b0', [0.38, 0.22, 0.05]),
    P(rcone(0.04, 0.005, 0.12, 0.01, 5), '#c8c0b0', [0.46, 0.2, -0.08], [0.6, 0, 0])
  ],
  glow: []
})

const fire = (): PieceGeo => {
  // A camp fire: a ring of stones, logs leaned together, the flames, and a
  // spit over it with something roasting.
  const lit: BufferGeometry[] = []
  const glow: BufferGeometry[] = []
  for (let q = 0; q < 8; q++) {
    const a = (q / 8) * Math.PI * 2
    lit.push(P(rock(0.17, 40 + q, 7, 5), q % 2 ? '#6e6660' : '#58504c', [Math.cos(a) * 0.58, 0.08, Math.sin(a) * 0.58], [0, a, 0], [1, 0.7, 1]))
  }
  for (let q = 0; q < 3; q++) {
    const a = (q / 3) * Math.PI * 2 + 0.4
    lit.push(P(rcyl(0.07, 0.8, 0.03, 7, 1), '#4a3220', [Math.cos(a) * 0.18, 0.24, Math.sin(a) * 0.18], [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9]))
  }
  glow.push(P(rcone(0.3, 0.02, 0.85, 0.02, 8), '#ff7a1a', [0, 0.46, 0]))
  glow.push(P(rcone(0.17, 0.01, 0.55, 0.01, 7), '#ffd84a', [0.03, 0.36, 0.02]))
  glow.push(P(sph(0.08, 6, 5), '#ffb02a', [0.2, 0.08, -0.12]), P(sph(0.06, 6, 5), '#ff8a2a', [-0.18, 0.07, 0.16]))
  // The spit: a forked stick either side, a rod across, a joint on it.
  for (const sx of [-1, 1]) {
    lit.push(P(rcyl(0.035, 1.05, 0.01, 5, 1), '#6a4a2c', [sx * 0.78, 0.52, 0]))
    lit.push(P(rcyl(0.025, 0.22, 0.01, 5, 1), '#6a4a2c', [sx * 0.78 + sx * 0.06, 1.08, 0], [0, 0, sx * 0.5]))
  }
  lit.push(P(rcyl(0.025, 1.8, 0.01, 5, 1), '#8a6a44', [0, 1.0, 0], [0, 0, Math.PI / 2]))
  lit.push(P(ell(0.2, 0.14, 0.14, 8, 6), '#8a3a24', [0.05, 0.98, 0]))
  return { lit, glow }
}

const banner = (seed: number): PieceGeo => {
  // A goblin war banner: a crooked pole on a cairn, a ragged hide with the
  // tribe's daubed skull, horns lashed on top.
  const lit: BufferGeometry[] = []
  const hide = seed % 3 === 0 ? '#9a3a1e' : seed % 3 === 1 ? '#6a7a2a' : '#8a5a1e'
  // The cairn fills the banner's cell: the hero is stopped by stones he can see.
  for (let q = 0; q < 7; q++) {
    const a = (q / 7) * Math.PI * 2 + seed
    lit.push(P(rock(0.34, 60 + q + seed, 7, 5), q % 2 ? '#6a625c' : '#7a7068', [Math.cos(a) * 0.5, 0.14, Math.sin(a) * 0.5]))
  }
  lit.push(P(rock(0.3, 70 + seed, 7, 5), '#5e5650', [0, 0.2, 0]))
  lit.push(P(rcyl(0.06, 3.0, 0.02, 7, 1), '#5a3e26', [0, 1.5, 0], [0, 0, 0.03]))
  lit.push(P(rcyl(0.04, 1.2, 0.02, 6, 1), '#5a3e26', [0.02, 2.75, 0.06], [0, 0, Math.PI / 2]))
  lit.push(P(rbox(1.0, 1.3, 0.04, 0.3, 8, 6), hide, [0.02, 2.05, 0.09]))
  // The ragged hem: tongues of hide.
  for (let q = 0; q < 4; q++) lit.push(P(rcone(0.11, 0.01, 0.3, 0.01, 4), hide, [-0.36 + q * 0.24, 1.27, 0.09], [Math.PI, 0, 0], [1, 1, 0.3]))
  // The skull daubed on it (in front of the hide, never in its plane).
  lit.push(P(ell(0.2, 0.22, 0.05, 8, 6), '#ece4d0', [0.02, 2.15, 0.14]))
  lit.push(P(sph(0.05, 6, 4), '#2a1c18', [-0.06, 2.18, 0.18]), P(sph(0.05, 6, 4), '#2a1c18', [0.1, 2.18, 0.18]))
  // Horns on the top.
  for (const sx of [-1, 1]) lit.push(P(rcone(0.07, 0.01, 0.42, 0.01, 6), '#e8dcc0', [sx * 0.14, 3.12, 0], [0, 0, -sx * 0.7]))
  return { lit, glow: [] }
}

const tent = (seed: number): PieceGeo => {
  // A goblin's hide tent: a cone of patched hides on poles that stick out
  // of its top, the door flap thrown back.
  const lit: BufferGeometry[] = [P(rcone(1.64, 0.12, 2.1, 0.04, 16), seed % 2 ? '#8a6440' : '#7a5a3c', [0, 1.05, 0])]
  for (let q = 0; q < 3; q++) {
    const a = (q / 3) * Math.PI * 2
    lit.push(P(rcyl(0.04, 0.8, 0.01, 5, 1), '#5a3e26', [Math.cos(a) * 0.12, 2.3, Math.sin(a) * 0.12], [Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35]))
  }
  // Patches sewn on (proud of the hide by a few centimetres).
  lit.push(P(ell(0.3, 0.26, 0.06, 7, 5), '#a07a4a', [0.75, 0.95, 0.87], [0.2, 0.75, 0]))
  lit.push(P(ell(0.26, 0.22, 0.06, 7, 5), '#5e4630', [-0.91, 0.75, 0.67], [0.15, -0.95, 0]))
  // The dark doorway and its flap on the camera's side.
  lit.push(P(rcone(0.42, 0.05, 0.95, 0.02, 3), '#2a1e16', [0, 0.47, 1.28], [-0.25, Math.PI, 0], [1, 1, 0.35]))
  return { lit, glow: [] }
}

const mill = (): PieceGeo => {
  // A windmill: a whitewashed stone tower, a thatched cap, a door and two
  // windows, and four latticed sails turned to the road.
  const lit: BufferGeometry[] = []
  // Its cobbled yard covers the three cells it blocks, corner to corner.
  lit.push(P(rbox(4.3, 0.22, 4.3, 0.12, 6, 3), '#9a8e7a', [0, 0.11, 0]))
  lit.push(P(rcone(1.65, 1.2, 4.4, 0.08, 14), '#e2dccc', [0, 2.2, 0]))
  lit.push(P(rcyl(1.78, 0.36, 0.08, 14, 1), '#a89c88', [0, 0.18, 0]))
  lit.push(P(rcone(1.5, 0.08, 1.6, 0.05, 14), '#b4743a', [0, 5.2, 0]))
  lit.push(P(rcyl(1.42, 0.14, 0.04, 14, 1), '#8a5428', [0, 4.42, 0]))
  // The door and two windows, set into the tower's face toward the camera.
  lit.push(P(rbox(0.66, 1.15, 0.24, 0.3, 8, 6), '#5a3a22', [0, 0.78, 1.55], [-0.09, 0, 0]))
  lit.push(P(rbox(0.36, 0.44, 0.2, 0.3, 6, 4), '#3a2a20', [0.42, 2.7, 1.37], [-0.1, 0.3, 0]))
  lit.push(P(rbox(0.32, 0.4, 0.2, 0.3, 6, 4), '#3a2a20', [-0.5, 3.6, 1.26], [-0.1, -0.35, 0]))
  // The hub, and the sails in a cross in front of it.
  lit.push(P(rcyl(0.22, 0.7, 0.05, 9, 1), '#6a4a2c', [0, 4.55, 1.52], [Math.PI / 2, 0, 0]))
  lit.push(P(sph(0.2, 8, 6), '#7a5530', [0, 4.55, 1.9]))
  for (let q = 0; q < 4; q++) {
    const a = (q / 4) * Math.PI * 2 + 0.35
    const ax = Math.sin(a)
    const ay = Math.cos(a)
    // The spar, then the sail cloth a hand behind it, then its lattice bars in front.
    lit.push(P(rbox(0.13, 3.2, 0.1, 0.3, 4, 8), '#7a5530', [ax * 1.6, 4.55 + ay * 1.6, 1.78], [0, 0, -a]))
    lit.push(P(rbox(0.72, 2.5, 0.04, 0.2, 4, 6), '#f2ead6', [ax * 1.85 + ay * 0.42, 4.55 + ay * 1.85 - ax * 0.42, 1.7], [0, 0, -a]))
    for (const t of [0.35, 0.7, 1.05]) {
      const d = 0.75 + t * 1.55
      lit.push(P(rbox(0.8, 0.05, 0.04, 0.3, 4, 3), '#8a6a44', [ax * d + ay * 0.42, 4.55 + ay * d - ax * 0.42, 1.76], [0, 0, -a]))
    }
  }
  return { lit, glow: [] }
}

const scarecrow = (): PieceGeo => ({
  lit: [
    P(rcyl(0.05, 1.9, 0.02, 6, 1), '#6a4a2c', [0, 0.95, 0]),
    P(rcyl(0.04, 1.3, 0.02, 6, 1), '#6a4a2c', [0, 1.45, 0], [0, 0, Math.PI / 2]),
    P(rbox(0.5, 0.62, 0.3, 0.6, 8, 6), '#4a6a8a', [0, 1.3, 0.02]),
    P(sph(0.2, 8, 6), '#d8c08a', [0, 1.85, 0]),
    P(rcone(0.3, 0.12, 0.08, 0.02, 10), '#5a4a30', [0, 2.0, 0]),
    P(rcone(0.13, 0.08, 0.2, 0.02, 10), '#5a4a30', [0, 2.13, 0]),
    P(rcone(0.07, 0.01, 0.26, 0.01, 5), '#e8c860', [0.66, 1.42, 0], [0, 0, -1.4]),
    P(rcone(0.07, 0.01, 0.26, 0.01, 5), '#e8c860', [-0.66, 1.42, 0], [0, 0, 1.4]),
    // Fallen straw heaped round its post: the cell it blocks is all drawn.
    ...[0, 1, 2, 3, 4].map(q => P(rock(0.42, 90 + q, 7, 5), q % 2 ? '#c8a850' : '#b89440', [Math.cos(q * 1.257 + 0.4) * 0.42, 0.1, Math.sin(q * 1.257 + 0.4) * 0.42], [0, 0, 0], [1, 0.45, 1]))
  ],
  glow: []
})

const MARBLE = '#d6dccc'
const MARBLE2 = '#b8c4b4'

const column = (broken: boolean, seed: number): PieceGeo => {
  // A temple column: a square plinth, a fluted shaft (a ring of shallow
  // ridges), a capital; or its stump with a fallen drum beside it.
  const lit: BufferGeometry[] = [P(rbox(1.15, 0.3, 1.15, 0.3, 8, 4), MARBLE2, [0, 0.15, 0])]
  const hgt = broken ? 1.0 + (seed % 3) * 0.25 : 3.1
  lit.push(P(rcyl(0.42, hgt, 0.04, 14, 1), MARBLE, [0, 0.3 + hgt / 2, 0]))
  for (let q = 0; q < 8; q++) {
    const a = (q / 8) * Math.PI * 2
    lit.push(P(rbox(0.07, hgt - 0.2, 0.07, 0.6, 4, 4), MARBLE2, [Math.cos(a) * 0.43, 0.3 + hgt / 2, Math.sin(a) * 0.43]))
  }
  if (broken) {
    // The break: a jagged top, and a piece of the drum that fell, on the
    // ground along the plinth (it lay through the stump and the plinth once).
    lit.push(P(rock(0.36, seed + 5, 8, 5), MARBLE, [0.04, 0.3 + hgt, 0], [0, 0, 0], [1, 0.45, 1]))
    lit.push(P(rcyl(0.22, 0.6, 0.04, 12, 1), MARBLE, [0.8, 0.22, 0.3], [Math.PI / 2, 0, 0]))
  } else {
    lit.push(P(rcyl(0.55, 0.16, 0.04, 14, 1), MARBLE2, [0, 0.3 + hgt + 0.08, 0]))
    lit.push(P(rbox(1.2, 0.24, 1.2, 0.3, 8, 4), MARBLE, [0, 0.3 + hgt + 0.28, 0]))
  }
  return { lit, glow: [] }
}

const rubble = (seed: number): PieceGeo => ({
  // A fallen drum and two cut blocks.
  lit: [
    P(rcyl(0.42, 0.62, 0.05, 12, 1), MARBLE, [0, 0.42, 0], [Math.PI / 2, 0.4 + seed, 0]),
    P(rbox(0.6, 0.42, 0.5, 0.3, 6, 4), MARBLE2, [0.42, 0.21, -0.38], [0, 0.5, 0]),
    P(rbox(0.42, 0.3, 0.38, 0.3, 6, 4), MARBLE, [-0.45, 0.15, 0.42], [0, -0.3, 0.12]),
    // Chips lying round them: the cell the rubble blocks is all drawn.
    P(rock(0.32, 41 + seed, 7, 5), MARBLE2, [-0.48, 0.12, -0.46]),
    P(rock(0.3, 43 + seed, 7, 5), MARBLE, [0.5, 0.11, 0.48])
  ],
  glow: []
})

const boulder = (pal: PiecePalette, seed: number): PieceGeo => ({
  lit: [P(rock(0.68, seed % 17 + 3, 10, 7), pal.rock, [0, 0.45, 0], [0, 0, 0], [1, 0.82, 1]), P(rock(0.36, seed % 11 + 21, 8, 6), pal.rock2, [0.5, 0.2, 0.3])],
  glow: []
})

const lavaRock = (seed: number): PieceGeo => ({
  // A black boulder standing in the lava, a crack glowing in it.
  lit: [P(rock(0.7, seed % 13 + 2, 10, 7), '#2a2024', [0, WET + 0.2, 0], [0, 0, 0], [1, 0.9, 1])],
  glow: [
    P(rbox(0.06, 0.5, 0.06, 0.6, 4, 4), '#ff8a2a', [0.2, WET + 0.45, 0.55], [0.3, 0, 0.4]),
    P(sph(0.09, 6, 5), '#ffb02a', [-0.35, WET + 0.1, 0.45])
  ]
})

const log = (seed: number): PieceGeo => {
  // A trunk fallen across the glade: bark, the cut ends pale, moss on top,
  // a broken branch stub.
  const lit: BufferGeometry[] = [P(rcyl(0.36, 4.0, 0.08, 10, 2), '#5a4430', [0, 0.36, 0], [Math.PI / 2, 0, 0])]
  for (const sz of [-1, 1]) lit.push(P(rcyl(0.3, 0.04, 0.01, 10, 1), '#c8a878', [0, 0.36, sz * 2.02], [Math.PI / 2, 0, 0]))
  lit.push(P(ell(0.3, 0.1, 0.8, 8, 5), '#5f9a3a', [0.05, 0.69, -0.6]), P(ell(0.24, 0.09, 0.5, 8, 5), '#4f8a34', [-0.06, 0.68, 0.9]))
  lit.push(P(rcone(0.1, 0.04, 0.6, 0.02, 6), '#5a4430', [0.36, 0.62, 0.3 + (seed % 3) * 0.2], [0, 0, -0.9]))
  return { lit, glow: [] }
}

const oldTree = (seed: number): PieceGeo => {
  // A giant of the old wood: a massive trunk on flared roots, a crown high
  // above (the fights under it stay in view), moss hanging.
  const lit: BufferGeometry[] = [P(rcone(0.95, 0.6, 3.6, 0.1, 12), '#5a4632', [0, 1.8, 0])]
  for (let q = 0; q < 5; q++) {
    const a = (q / 5) * Math.PI * 2 + seed
    lit.push(P(rcone(0.42, 0.08, 1.5, 0.04, 7), '#4e3c2a', [Math.cos(a) * 0.95, 0.3, Math.sin(a) * 0.95], [Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2]))
  }
  lit.push(P(sph(1.75, 12, 8), '#2f7a40', [0, 4.6, 0]))
  lit.push(P(sph(1.25, 10, 7), '#3f8f48', [1.1, 5.1, 0.4]))
  lit.push(P(sph(1.15, 10, 7), '#3a8444', [-1.05, 4.9, -0.3]))
  lit.push(P(sph(0.95, 9, 6), '#4fa052', [0.1, 5.75, -0.5]))
  for (let q = 0; q < 3; q++) lit.push(P(rcone(0.1, 0.02, 0.9, 0.01, 5), '#7aa05a', [-0.8 + q * 0.8, 3.3, 1.2], [Math.PI, 0, 0]))
  return { lit, glow: [] }
}

const timber = (): PieceGeo => ({
  // A mine's frame across a drift: two props against its walls (at the rock's
  // face, three cells apart: not out on the drift's floor), a cap over them,
  // a lantern hung from it.
  lit: [
    P(rbox(0.26, 2.7, 0.26, 0.3, 6, 6), '#6a4a2c', [-2.2, 1.35, 0]),
    P(rbox(0.26, 2.7, 0.26, 0.3, 6, 6), '#6a4a2c', [2.2, 1.35, 0]),
    P(rbox(4.9, 0.3, 0.3, 0.3, 10, 4), '#7a5634', [0, 2.82, 0]),
    P(rcyl(0.012, 0.3, 0.004, 4, 1), '#2a2a2a', [0.6, 2.5, 0]),
    P(rcone(0.1, 0.06, 0.08, 0.02, 6), '#3a3430', [0.6, 2.33, 0])
  ],
  glow: [P(sph(0.09, 7, 5), '#ffd27a', [0.6, 2.22, 0])]
})

const rail = (): PieceGeo => ({
  // A cell's length of track: two sleepers, two rails on them.
  lit: [
    P(rbox(1.05, 0.08, 0.24, 0.3, 6, 3), '#5a4430', [0, 0.04, -0.36]),
    P(rbox(1.05, 0.08, 0.24, 0.3, 6, 3), '#5a4430', [0, 0.04, 0.38]),
    P(rbox(0.07, 0.07, 1.48, 0.4, 4, 3), '#8a8c92', [-0.36, 0.115, 0]),
    P(rbox(0.07, 0.07, 1.48, 0.4, 4, 3), '#8a8c92', [0.36, 0.115, 0])
  ],
  glow: []
})

const cart = (seed: number): PieceGeo => {
  // An ore cart on its wheels, heaped with ore that glints.
  const lit: BufferGeometry[] = [P(rbox(0.95, 0.55, 1.25, 0.3, 8, 6), '#5a5660', [0, 0.62, 0])]
  lit.push(P(rbox(1.02, 0.1, 1.32, 0.3, 8, 3), '#3e3a44', [0, 0.92, 0]))
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) lit.push(P(rcyl(0.2, 0.08, 0.02, 10, 1), '#2e2c32', [sx * 0.52, 0.22, sz * 0.42], [0, 0, Math.PI / 2]))
  for (let q = 0; q < 4; q++) lit.push(P(rock(0.2, seed + q, 7, 5), '#6e6878', [-0.25 + (q % 2) * 0.45, 1.02, -0.3 + Math.floor(q / 2) * 0.55]))
  return { lit, glow: [P(rcone(0.07, 0.01, 0.3, 0.01, 5), '#5fd8ff', [0.12, 1.12, 0.05], [0, 0, 0.3])] }
}

const crates = (seed: number): PieceGeo => ({
  lit: [
    P(rbox(0.82, 0.74, 0.8, 0.3, 6, 6), '#8a6238', [-0.12, 0.37, -0.1], [0, 0.2, 0]),
    P(rbox(0.6, 0.56, 0.58, 0.3, 6, 6), '#a07444', [-0.06, 1.02, -0.05], [0, -0.3 + seed * 0.1, 0]),
    P(rcyl(0.3, 0.8, 0.06, 10, 2), '#6a4428', [0.48, 0.4, 0.4]),
    P(torus(0.3, 0.03, 4, 12), '#3a3a3a', [0.48, 0.62, 0.4], [Math.PI / 2, 0, 0]),
    // A sack and a small crate in the corners the stack leaves: the cell is all drawn.
    P(ell(0.36, 0.3, 0.34, 8, 6), '#b89a6a', [-0.46, 0.28, 0.46]),
    P(rbox(0.56, 0.5, 0.56, 0.3, 6, 6), '#7a5430', [0.46, 0.25, -0.46], [0, 0.5, 0])
  ],
  glow: []
})

const floe = (seed: number): PieceGeo => ({
  // A floe of ice afloat on the lake, its top a hand above the water.
  lit: [P(rcyl(0.7 + (seed % 3) * 0.12, 0.16, 0.05, 6, 1), '#f2faff', [0, WET + 0.04, 0], [0, seed, 0], [1, 1, 0.75])],
  glow: []
})

const pylon = (pal: PiecePalette): PieceGeo => ({
  // A pylon of the citadel: a tapering four-sided stone, runes glowing down
  // its faces, a crystal burning on its tip.
  lit: [
    P(rbox(1.0, 0.36, 1.0, 0.3, 8, 4), pal.rock2, [0, 0.18, 0]),
    P(rcone(0.52, 0.22, 3.2, 0.03, 4), pal.rock, [0, 1.96, 0], [0, Math.PI / 4, 0])
  ],
  glow: [
    P(rcone(0.2, 0.01, 0.8, 0.01, 6), '#c07aff', [0, 3.95, 0]),
    P(rbox(0.06, 1.6, 0.04, 0.5, 4, 6), '#b06aff', [0, 1.9, 0.43], [-0.05, 0, 0]),
    P(rbox(0.06, 1.6, 0.04, 0.5, 4, 6), '#b06aff', [0.43, 1.9, 0], [0, Math.PI / 2, 0.05])
  ]
})

const gateTower = (pal: PiecePalette): PieceGeo => {
  // A round gate tower standing in the wall: its stone, a band of darker
  // courses, merlons round the top, a lit arrow slit.
  const lit: BufferGeometry[] = [P(rcyl(1.35, 4.6, 0.08, 14, 1), pal.rock, [0, 2.3, 0])]
  lit.push(P(rcyl(1.5, 0.44, 0.06, 14, 1), pal.rock2, [0, 4.46, 0]))
  for (let q = 0; q < 8; q++) {
    const a = (q / 8) * Math.PI * 2
    lit.push(P(rbox(0.5, 0.5, 0.4, 0.3, 6, 4), pal.rock, [Math.cos(a) * 1.3, 4.86, Math.sin(a) * 1.3], [0, -a, 0]))
  }
  return { lit, glow: [P(rbox(0.12, 0.6, 0.1, 0.4, 4, 4), '#ffb04a', [0, 2.9, 1.33])] }
}

const warBanner = (seed: number): PieceGeo => ({
  // The fortress's colours: a black pole, a long crimson banner with its
  // brazen sigil, a spike on top.
  lit: [
    // A stepped plinth that fills its cell.
    P(rbox(1.4, 0.22, 1.4, 0.2, 6, 4), '#2a2026', [0, 0.11, 0]),
    P(rbox(0.6, 0.36, 0.6, 0.3, 6, 4), '#36292f', [0, 0.18, 0]),
    P(rcyl(0.06, 3.4, 0.02, 7, 1), '#1e161c', [0, 1.85, 0]),
    P(rcyl(0.04, 1.1, 0.02, 6, 1), '#1e161c', [0, 3.3, 0.06], [0, 0, Math.PI / 2]),
    P(rbox(0.9, 2.0, 0.04, 0.3, 8, 6), seed % 2 ? '#7a1420' : '#5a0e1a', [0, 2.25, 0.1]),
    P(rcone(0.45, 0.01, 0.42, 0.01, 3), seed % 2 ? '#7a1420' : '#5a0e1a', [0, 1.05, 0.1], [Math.PI, 0, 0], [1, 1, 0.1]),
    P(rcone(0.05, 0.005, 0.4, 0.01, 6), '#3a3036', [0, 3.75, 0])
  ],
  glow: [P(ell(0.2, 0.2, 0.03, 8, 6), '#ffb04a', [0, 2.45, 0.15])]
})

const shard = (pal: PiecePalette, seed: number): PieceGeo => ({
  // A shard of the broken land adrift over the void, crystals on it, a
  // spike of rock hanging under it.
  lit: [
    P(rock(0.7, seed % 19 + 4, 9, 6), pal.rock, [0, 1.6, 0], [0, seed, 0], [1, 0.55, 1]),
    P(rcone(0.5, 0.02, 1.2, 0.02, 7), pal.rock2, [0, 0.95, 0], [Math.PI, 0, 0])
  ],
  glow: [
    P(rcone(0.12, 0.01, 0.6, 0.01, 6), '#e06aff', [0.15, 2.05, 0.1], [0, 0, 0.2]),
    P(rcone(0.09, 0.01, 0.4, 0.01, 6), '#f0a8ff', [-0.2, 1.95, -0.1], [0.3, 0, -0.4])
  ]
})

/** A set piece, built at the origin (y = 0 the ground), its length along +Z. */
export const setPiece = (kind: DressKind, pal: PiecePalette, seed: number): PieceGeo => {
  switch (kind) {
    case 'bed': return bed(seed)
    case 'club': return club()
    case 'fire': return fire()
    case 'banner': return banner(seed)
    case 'tent': return tent(seed)
    case 'mill': return mill()
    case 'scarecrow': return scarecrow()
    case 'column': return column(false, seed)
    case 'brokenColumn': return column(true, seed)
    case 'rubble': return rubble(seed)
    case 'boulder': return boulder(pal, seed)
    case 'lavaRock': return lavaRock(seed)
    case 'log': return log(seed)
    case 'oldTree': return oldTree(seed)
    case 'timber': return timber()
    case 'rail': return rail()
    case 'cart': return cart(seed)
    case 'crates': return crates(seed)
    case 'floe': return floe(seed)
    case 'pylon': return pylon(pal)
    case 'gateTower': return gateTower(pal)
    case 'warBanner': return warBanner(seed)
    case 'shard': return shard(pal, seed)
    // Decals, drawn by `levelProps.ts` itself (never merged with what is opaque).
    case 'mist':
    case 'claws': return { lit: [], glow: [] }
  }
}

/** The place's rock, from its ground and the dark round its edge. */
export const piecePalette = (ground: string, rim: string): PiecePalette => ({
  rock: mixHex(ground, rim, 0.55),
  rock2: tone(mixHex(ground, rim, 0.3), 1.08)
})

