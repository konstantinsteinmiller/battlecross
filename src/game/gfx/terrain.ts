import {
  BufferGeometry, Color, DynamicDrawUsage, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh, Object3D,
  Quaternion, Vector3, Fog, type Scene
} from 'three'
import type { LiquidId, ThemeId } from '../data/zones'
import { CELL } from '../sim/grid'
import { mulberry32 } from '../sim/rng'
import type { ZonePlan } from '../sim/zoneGen'
import { K_BLOCK, K_BRIDGE, K_CLIFF, K_FORD, K_GROUND, K_RAMP, K_WATER, riverRow } from '../sim/zoneFeatures'
import { groundAt } from './ground'
import type { Slice } from '../engine/slicer'
import { sceneQuality } from '../engine/quality'
import { celVC, celVCMap, glowVC, outlineMat, setCelMood } from './cel'
import { cap, dome, ell, merge, paint, rbox, rcone, rcyl, rock, sph, xform } from './kit'
import { groundDetail } from './textures'

/**
 * ─── The ground and what stands on it ────────────────────────────────────────
 *
 * A zone's look is a THEME: a palette for the ground, a handful of prop shapes
 * for its solid cells (trees in a wood, stalagmites in a cave, pillars in a
 * temple) and small decor for its clearings. The whole zone is:
 *
 *   • ONE ground mesh, vertex-coloured, with one greyscale detail map;
 *   • one InstancedMesh (plus its outline) per prop shape — a few hundred
 *     trees are two draw calls;
 *   • one merged mesh for a town's houses.
 *
 * So a zone is ~12–16 draw calls of scenery whatever its size, with no per-
 * frame work at all: nothing here moves.
 *
 * The ground has the zone's relief (`sim/relief.ts`, read through
 * `gfx/ground.ts`): every vertex takes its height and the slope's normal, the
 * slopes that face the light are a little lighter and the others a little
 * darker (so a hill reads without a shadow map), a ledge's cliff is rock
 * banded in the theme's stone with a crag of outlined boulders along it, and
 * a ramp is a worn way up (built steps in a dressed-stone zone). Everything
 * that stands on the ground stands on its height.
 *
 * Water and caves are part of the ground: the ground mesh DIPS under every wet
 * cell (the bank is the slope, the bed is its floor) and takes the cave's
 * colours inside one; the solid cells round a cave carry cave rock, tall on
 * the far side and low on the near one, so the fixed camera always sees in.
 * What stands in or moves on that ground (the water surface, bridges, chests,
 * plates) is `levelProps.ts`.
 */

interface PropShape {
  /** Lit parts and glowing parts, already painted. */
  build: () => { lit: BufferGeometry[]; glow?: BufferGeometry[] }
  /** Relative frequency among the theme's shapes. */
  w: number
  /** Scale range. */
  s: [number, number]
}

export interface Theme {
  /** The two tones the ground is mottled with, the trail, and the dark rim. */
  ground: [string, string]
  trail: string
  rim: string
  /** Sky / void colour and fog. */
  sky: string
  /** Tints the lit world (see `setCelMood`). */
  ambient: string
  shadow: string
  border: PropShape[]
  decor: PropShape[]
  /** Particle colour of ambient motes (fireflies, embers, snow). */
  mote: string
}

const P = (g: BufferGeometry, hex: string, p?: [number, number, number], r?: [number, number, number], s?: number | [number, number, number]): BufferGeometry =>
  xform(paint(g, hex), p, r, s ?? 1)

// ── Prop shapes ──────────────────────────────────────────────────────────────

const tree = (leaf: string, leaf2: string, trunk = '#7a5a3a') => () => ({
  lit: [
    P(rcyl(0.16, 0.8, 0.05, 8, 2), trunk, [0, 0.4, 0]),
    P(sph(0.72, 10, 7), leaf, [0, 1.25, 0]),
    P(sph(0.5, 9, 6), leaf2, [0.36, 1.7, 0.1]),
    P(sph(0.46, 9, 6), leaf2, [-0.34, 1.6, -0.14])
  ]
})
const pine = (leaf: string, tip: string, trunk = '#6a4a34') => () => ({
  lit: [
    P(rcyl(0.14, 0.5, 0.04, 8, 2), trunk, [0, 0.25, 0]),
    P(rcone(0.78, 0.2, 0.9, 0.06, 9), leaf, [0, 0.9, 0]),
    P(rcone(0.58, 0.12, 0.8, 0.05, 9), leaf, [0, 1.5, 0]),
    P(rcone(0.38, 0.02, 0.7, 0.03, 9), tip, [0, 2.05, 0])
  ]
})
const bush = (leaf: string, leaf2: string) => () => ({
  lit: [P(sph(0.5, 9, 6), leaf, [0, 0.36, 0]), P(sph(0.34, 8, 6), leaf2, [0.32, 0.5, 0.1]), P(sph(0.3, 8, 6), leaf2, [-0.3, 0.42, -0.12])]
})
const boulder = (hex: string, hex2: string) => () => ({
  lit: [P(rock(0.62, 3), hex, [0, 0.4, 0]), P(rock(0.36, 9), hex2, [0.46, 0.24, 0.2])]
})
const spire = (hex: string, hex2: string) => () => ({
  lit: [P(rcone(0.5, 0.06, 2, 0.04, 8), hex, [0, 1, 0]), P(rcone(0.3, 0.04, 1.1, 0.03, 7), hex2, [0.45, 0.55, 0.15]), P(rock(0.4, 5), hex2, [-0.3, 0.2, -0.2])]
})
const crystal = (stone: string, glowHex: string) => () => ({
  lit: [P(rock(0.5, 7), stone, [0, 0.3, 0])],
  glow: [
    P(rcone(0.2, 0.02, 1.3, 0.02, 6), glowHex, [0, 0.9, 0], [0, 0, 0.12]),
    P(rcone(0.14, 0.02, 0.9, 0.02, 6), glowHex, [0.3, 0.6, 0.1], [0, 0, -0.5]),
    P(rcone(0.12, 0.02, 0.7, 0.02, 6), glowHex, [-0.28, 0.5, -0.1], [0.2, 0, 0.55])
  ]
})
const mushroom = (stem: string, capHex: string, glows: boolean) => () => {
  const stemG = P(rcyl(0.11, 0.5, 0.04, 8, 2), stem, [0, 0.25, 0])
  const capG = P(dome(0.44, 1.5, 10, 5), capHex, [0, 0.42, 0])
  return glows ? { lit: [stemG], glow: [capG] } : { lit: [stemG, capG] }
}
const column = (stone: string, broken: boolean) => () => ({
  lit: [
    P(rcyl(0.44, 0.28, 0.06, 10, 2), stone, [0, 0.14, 0]),
    P(rcyl(0.32, broken ? 1.1 : 2.3, 0.05, 10, 2), stone, [0, broken ? 0.8 : 1.4, 0]),
    ...(broken ? [P(rock(0.3, 4), stone, [0.5, 0.2, 0.2])] : [P(rcyl(0.44, 0.26, 0.06, 10, 2), stone, [0, 2.65, 0])])
  ]
})
const wallBlock = (stone: string, stone2: string) => () => ({
  lit: [P(rbox(1.5, 1.6, 1.5, 0.3, 10, 8), stone, [0, 0.8, 0]), P(rbox(0.7, 0.5, 0.7, 0.4, 8, 6), stone2, [0.2, 1.8, -0.1])]
})
const deadTree = (trunk: string) => () => ({
  lit: [
    P(rcone(0.2, 0.08, 1.6, 0.03, 7), trunk, [0, 0.8, 0]),
    P(cap(0.06, 0.7, 6, 2), trunk, [0.3, 1.4, 0], [0, 0, -0.9]),
    P(cap(0.05, 0.5, 6, 2), trunk, [-0.25, 1.15, 0.1], [0.2, 0, 0.8])
  ]
})
const brazier = (stone: string, fire: string) => () => ({
  lit: [P(rcyl(0.2, 1, 0.05, 8, 2), stone, [0, 0.5, 0]), P(dome(0.42, 1.4, 10, 5), stone, [0, 0.9, 0], [Math.PI, 0, 0])],
  glow: [P(rcone(0.3, 0.02, 0.7, 0.02, 7), fire, [0, 1.3, 0])]
})
const hay = () => ({
  lit: [P(rcyl(0.6, 0.8, 0.16, 10, 2), '#e0b84a', [0, 0.6, 0], [0, 0, Math.PI / 2]), P(rcyl(0.5, 0.7, 0.14, 10, 2), '#c99a3a', [0.2, 0.5, 0.9], [0, 0.5, Math.PI / 2])]
})
const iceRock = () => ({
  lit: [P(rock(0.66, 13), '#dff4ff', [0, 0.4, 0]), P(rcone(0.3, 0.03, 1.2, 0.03, 6), '#b8e6ff', [0.3, 0.6, 0.1], [0, 0, -0.3])]
})
// Decor (never solid)
const tuft = (hex: string) => () => ({ lit: [P(rcone(0.07, 0.01, 0.34, 0.01, 5), hex, [0, 0.17, 0]), P(rcone(0.06, 0.01, 0.26, 0.01, 5), hex, [0.1, 0.13, 0.04], [0, 0, -0.4]), P(rcone(0.06, 0.01, 0.24, 0.01, 5), hex, [-0.09, 0.12, -0.03], [0, 0, 0.45])] })
const flower = (petal: string) => () => ({ lit: [P(rcyl(0.02, 0.26, 0.008, 5, 1), '#5fae4a', [0, 0.13, 0]), P(sph(0.09, 7, 5), petal, [0, 0.3, 0])] })
const pebble = (hex: string) => () => ({ lit: [P(rock(0.16, 21, 7, 5), hex, [0, 0.07, 0])] })
const bones = () => ({ lit: [P(cap(0.04, 0.34, 6, 2), '#e8e2cf', [0, 0.05, 0], [0, 0.4, Math.PI / 2]), P(sph(0.11, 7, 5), '#e8e2cf', [0.26, 0.1, 0.12])] })
const ember = (hex: string) => () => ({ lit: [P(rock(0.18, 17, 7, 5), '#3a2a28', [0, 0.08, 0])], glow: [P(sph(0.07, 6, 5), hex, [0, 0.16, 0])] })
const shroom = (hex: string) => () => ({ lit: [P(rcyl(0.035, 0.16, 0.012, 6, 1), '#e8e2d0', [0, 0.08, 0])], glow: [P(dome(0.12, 1.5, 8, 4), hex, [0, 0.14, 0])] })

export const THEMES: Readonly<Record<ThemeId, Theme>> = {
  plains: {
    ground: ['#7fc65a', '#6ab04a'], trail: '#c9b07a', rim: '#3f7a3a', sky: '#8fd0ff', ambient: '#ffffff', shadow: '#d6ccff', mote: '#fff6b8',
    border: [{ build: tree('#4fa84a', '#7fd060'), w: 5, s: [0.9, 1.4] }, { build: bush('#58b04a', '#8fd864'), w: 3, s: [0.9, 1.5] }, { build: boulder('#9aa4a8', '#b8c0c4'), w: 1, s: [0.8, 1.3] }],
    decor: [{ build: tuft('#5fae4a'), w: 6, s: [0.8, 1.4] }, { build: flower('#ffd84a'), w: 2, s: [0.8, 1.2] }, { build: flower('#ff8ab0'), w: 2, s: [0.8, 1.2] }, { build: pebble('#b8c0c4'), w: 1, s: [0.7, 1.3] }]
  },
  cave: {
    ground: ['#7a6a5a', '#6a5a4c'], trail: '#9a8a74', rim: '#3a3038', sky: '#1c1826', ambient: '#e8dcd0', shadow: '#b8a8e8', mote: '#7dffd0',
    border: [{ build: spire('#6a5c54', '#857468'), w: 4, s: [0.9, 1.5] }, { build: boulder('#6a5c54', '#857468'), w: 4, s: [1, 1.6] }, { build: mushroom('#e8e2d0', '#5fffd0', true), w: 2, s: [0.9, 1.6] }],
    decor: [{ build: pebble('#857468'), w: 4, s: [0.8, 1.6] }, { build: shroom('#5fffd0'), w: 3, s: [0.8, 1.4] }, { build: bones, w: 1, s: [0.9, 1.2] }]
  },
  forest: {
    ground: ['#4f9a4a', '#3f8440'], trail: '#8a7a54', rim: '#234a2c', sky: '#2f5a4a', ambient: '#e4f4dc', shadow: '#b8c8ff', mote: '#c8ff9a',
    border: [{ build: pine('#2f7a44', '#4fa85a'), w: 5, s: [1, 1.6] }, { build: tree('#3f8f44', '#5fb85a', '#5a4430'), w: 3, s: [1.1, 1.7] }, { build: mushroom('#e8e2d0', '#e0484a', false), w: 1, s: [0.9, 1.4] }],
    decor: [{ build: tuft('#3f8f44'), w: 5, s: [0.9, 1.5] }, { build: shroom('#ffd24a'), w: 2, s: [0.8, 1.3] }, { build: flower('#c8a8ff'), w: 2, s: [0.8, 1.2] }]
  },
  farm: {
    ground: ['#b8c85a', '#a4b44a'], trail: '#c9a86a', rim: '#6a7a34', sky: '#ffd8a0', ambient: '#fff0d8', shadow: '#d0c0f0', mote: '#fff0a0',
    border: [{ build: hay, w: 3, s: [0.9, 1.2] }, { build: tree('#7aa83a', '#a8cc4a'), w: 4, s: [0.9, 1.4] }, { build: bush('#8ab04a', '#b0d060'), w: 3, s: [0.9, 1.4] }],
    decor: [{ build: tuft('#c8b04a'), w: 6, s: [0.9, 1.6] }, { build: flower('#ff9a4a'), w: 2, s: [0.8, 1.2] }, { build: pebble('#c8b89a'), w: 1, s: [0.7, 1.2] }]
  },
  ash: {
    ground: ['#5a4a4a', '#4a3c40'], trail: '#7a625a', rim: '#241c22', sky: '#3a1c1c', ambient: '#ffe0c8', shadow: '#c8a0c0', mote: '#ff8a3a',
    border: [{ build: spire('#3a2e30', '#56444a'), w: 4, s: [1, 1.7] }, { build: deadTree('#2a2024'), w: 3, s: [0.9, 1.4] }, { build: crystal('#3a2e30', '#ff7a2a'), w: 2, s: [0.8, 1.3] }],
    decor: [{ build: ember('#ff8a3a'), w: 4, s: [0.8, 1.4] }, { build: pebble('#3a2e30'), w: 3, s: [0.8, 1.6] }, { build: bones, w: 1, s: [0.9, 1.2] }]
  },
  mine: {
    ground: ['#6a6470', '#5a5460'], trail: '#8a8490', rim: '#2a2630', sky: '#16141c', ambient: '#e0e4f4', shadow: '#a8b0f0', mote: '#7fd8ff',
    border: [{ build: wallBlock('#565060', '#6e6878'), w: 5, s: [0.95, 1.1] }, { build: crystal('#565060', '#5fd8ff'), w: 2, s: [0.8, 1.3] }, { build: boulder('#565060', '#6e6878'), w: 2, s: [1, 1.5] }],
    decor: [{ build: pebble('#6e6878'), w: 5, s: [0.8, 1.6] }, { build: ember('#5fd8ff'), w: 2, s: [0.7, 1.1] }]
  },
  snow: {
    ground: ['#e8f4ff', '#d4e8fa'], trail: '#b8cce0', rim: '#8fa8c8', sky: '#a8c8e8', ambient: '#eaf4ff', shadow: '#b8c8ff', mote: '#ffffff',
    border: [{ build: pine('#4f8a7a', '#f4fbff'), w: 5, s: [1, 1.6] }, { build: iceRock, w: 3, s: [0.9, 1.5] }, { build: boulder('#c8d8e8', '#f4fbff'), w: 2, s: [0.9, 1.4] }],
    decor: [{ build: pebble('#c8d8e8'), w: 3, s: [0.8, 1.4] }, { build: tuft('#9ab8c8'), w: 2, s: [0.8, 1.2] }]
  },
  temple: {
    ground: ['#4fa8a0', '#3f948e'], trail: '#c8d8c0', rim: '#1c4a54', sky: '#12343c', ambient: '#dcfff4', shadow: '#a8c0ff', mote: '#7fffe8',
    border: [{ build: column('#b8c8b8', false), w: 3, s: [0.95, 1.1] }, { build: column('#a8b8a8', true), w: 3, s: [0.95, 1.2] }, { build: crystal('#4a7a78', '#5fffe0'), w: 2, s: [0.8, 1.2] }],
    decor: [{ build: pebble('#b8c8b8'), w: 3, s: [0.8, 1.5] }, { build: shroom('#5fffe0'), w: 3, s: [0.8, 1.3] }, { build: tuft('#3fc7b0'), w: 2, s: [0.8, 1.3] }]
  },
  void: {
    ground: ['#4a3a7a', '#3c2e68'], trail: '#7a6ab0', rim: '#180e30', sky: '#0e0820', ambient: '#e8dcff', shadow: '#b090ff', mote: '#d0a8ff',
    border: [{ build: crystal('#2a1c50', '#b06aff'), w: 4, s: [1, 1.7] }, { build: spire('#2a1c50', '#3e2c70'), w: 4, s: [1, 1.6] }, { build: column('#4a3a7a', true), w: 1, s: [0.95, 1.2] }],
    decor: [{ build: ember('#d0a8ff'), w: 4, s: [0.8, 1.4] }, { build: pebble('#3e2c70'), w: 3, s: [0.8, 1.5] }]
  },
  peak: {
    ground: ['#8a7a70', '#766860'], trail: '#a89888', rim: '#3a3038', sky: '#5a3a5a', ambient: '#ffe8dc', shadow: '#c8b0e0', mote: '#ffb07a',
    border: [{ build: spire('#5a4e50', '#76686a'), w: 5, s: [1.1, 1.9] }, { build: boulder('#5a4e50', '#76686a'), w: 3, s: [1, 1.7] }, { build: deadTree('#3a2e30'), w: 1, s: [0.9, 1.3] }],
    decor: [{ build: bones, w: 3, s: [0.9, 1.5] }, { build: pebble('#76686a'), w: 4, s: [0.8, 1.6] }, { build: ember('#ffb07a'), w: 1, s: [0.8, 1.2] }]
  },
  fortress: {
    ground: ['#4a3a44', '#3e2e3a'], trail: '#6a5460', rim: '#180e16', sky: '#1c0a12', ambient: '#ffdcd8', shadow: '#c090b0', mote: '#ff5a4a',
    border: [{ build: wallBlock('#3a2a34', '#52404a'), w: 5, s: [0.95, 1.15] }, { build: brazier('#3a2a34', '#ff6a2a'), w: 2, s: [0.9, 1.2] }, { build: column('#52404a', true), w: 1, s: [0.95, 1.2] }],
    decor: [{ build: bones, w: 3, s: [0.9, 1.4] }, { build: ember('#ff5a4a'), w: 3, s: [0.8, 1.3] }, { build: pebble('#52404a'), w: 3, s: [0.8, 1.5] }]
  },
  rift: {
    ground: ['#2e1c5a', '#24144a'], trail: '#5a3fa0', rim: '#0a0418', sky: '#06020e', ambient: '#f0dcff', shadow: '#a070ff', mote: '#f0a8ff',
    border: [{ build: crystal('#1c1040', '#e06aff'), w: 5, s: [1.1, 1.9] }, { build: spire('#1c1040', '#30206a'), w: 3, s: [1.1, 1.8] }],
    decor: [{ build: ember('#f0a8ff'), w: 5, s: [0.8, 1.5] }, { build: pebble('#30206a'), w: 2, s: [0.8, 1.4] }]
  },
  town: {
    ground: ['#8fc85a', '#7ab84c'], trail: '#d8c090', rim: '#4a8a3a', sky: '#9fd8ff', ambient: '#ffffff', shadow: '#d6ccff', mote: '#fff6b8',
    border: [{ build: tree('#4fa84a', '#7fd060'), w: 4, s: [1, 1.5] }, { build: bush('#58b04a', '#8fd864'), w: 3, s: [0.9, 1.4] }, { build: hay, w: 1, s: [0.8, 1] }],
    decor: [{ build: tuft('#5fae4a'), w: 4, s: [0.8, 1.3] }, { build: flower('#ffd84a'), w: 3, s: [0.8, 1.2] }, { build: flower('#ff8ab0'), w: 3, s: [0.8, 1.2] }]
  },
  ruin: {
    ground: ['#7a7460', '#686250'], trail: '#8a8068', rim: '#2e2a26', sky: '#4a3a3a', ambient: '#f0e0d0', shadow: '#c0b0d8', mote: '#ff9a5a',
    border: [{ build: deadTree('#3a302a'), w: 4, s: [1, 1.5] }, { build: wallBlock('#5a544a', '#706a5e'), w: 3, s: [0.9, 1.1] }, { build: boulder('#5a544a', '#706a5e'), w: 2, s: [0.9, 1.5] }],
    decor: [{ build: ember('#ff9a5a'), w: 3, s: [0.8, 1.3] }, { build: bones, w: 2, s: [0.9, 1.3] }, { build: pebble('#706a5e'), w: 4, s: [0.8, 1.5] }]
  },
  arena: {
    ground: ['#d8c090', '#c8b080'], trail: '#e8d4a8', rim: '#7a6444', sky: '#ffcf8a', ambient: '#fff4e0', shadow: '#d8c0e8', mote: '#fff0c0',
    border: [{ build: wallBlock('#b8a078', '#d0b890'), w: 6, s: [0.98, 1.05] }, { build: column('#d0b890', false), w: 2, s: [0.95, 1.1] }, { build: brazier('#8a7458', '#ffb02a'), w: 1, s: [0.9, 1.1] }],
    decor: [{ build: pebble('#b8a078'), w: 4, s: [0.8, 1.4] }, { build: bones, w: 1, s: [0.9, 1.2] }]
  }
}

// ── Water and caves ──────────────────────────────────────────────────────────

/** How a liquid looks: the surface's tones (drawn by `levelProps.ts`), the
 *  bed under it and what it does to the bank beside it. */
export interface LiquidLook {
  deep: string
  shallow: string
  glint: string
  foam: string
  bed: string
  /** The bank's tint (wet mud, a rim of ice, a lava glow) and its strength. */
  bank: string
  bankK: number
  /** The foam line: where it starts (0 deep .. 1 bank) and how much it moves. */
  foamAt: number
  wobble: number
  /** Dark crust drifting on it (lava). */
  crust: number
  /** How fast the surface moves. */
  flow: number
}

export const LIQUIDS: Readonly<Record<LiquidId, LiquidLook>> = {
  water: { deep: '#2a84cc', shallow: '#58bcee', glint: '#ffffff', foam: '#f6fcff', bed: '#3a6c8c', bank: '#7a6a4a', bankK: 0.42, foamAt: 0.59, wobble: 1, crust: 0, flow: 1 },
  ice: { deep: '#3a8cc4', shallow: '#93d8f6', glint: '#ffffff', foam: '#f4fbff', bed: '#5a8cb0', bank: '#ffffff', bankK: 0.75, foamAt: 0.44, wobble: 0.25, crust: 0, flow: 0.45 },
  lava: { deep: '#e2400c', shallow: '#ff9218', glint: '#fff0a0', foam: '#ffdc5a', bed: '#2a1410', bank: '#ff5a14', bankK: 0.5, foamAt: 0.56, wobble: 0.7, crust: 1, flow: 0.4 },
  pool: { deep: '#11545e', shallow: '#1f9090', glint: '#a8ffe6', foam: '#bafff0', bed: '#1a3038', bank: '#2f6a66', bankK: 0.45, foamAt: 0.6, wobble: 0.6, crust: 0, flow: 0.5 },
  void: { deep: '#3c1a92', shallow: '#7c4ee6', glint: '#f4d8ff', foam: '#dcb8ff', bed: '#1a0e30', bank: '#8a5af0', bankK: 0.45, foamAt: 0.59, wobble: 0.8, crust: 0, flow: 0.6 }
}

/** The water's surface, and the floor under it. */
export const WATER_Y = -0.17
const BED_Y = -0.56

/**
 * Is there water under this cell? Bridged and forded water counts, and so do
 * the cells of a river PAST the walkable grid: the plan keeps its rim of rock
 * there, the picture carries the river on to the edge of the land.
 */
export const wetCell = (plan: ZonePlan, i: number, j: number): boolean => {
  if (i >= 2 && j >= 0 && i < plan.w - 2 && j < plan.h) {
    const kd = plan.kind[j * plan.w + i]
    return kd === K_WATER || kd === K_BRIDGE || kd === K_FORD
  }
  for (const r of plan.rivers) if (Math.abs(j - riverRow(r, i)) <= r.half) return true
  return false
}

/** The look inside a cave, whatever the zone outside it. */
const CAVE = {
  ground: ['#4c485c', '#3d3a4c'] as [string, string],
  rim: '#15131c'
}
const caveWall = (hex: string, hex2: string, hex3: string) => () => ({
  lit: [
    P(rcone(0.86, 0.46, 2.5, 0.1, 7), hex, [0, 1.25, 0]),
    P(rock(0.62, 11), hex2, [0.08, 2.5, 0.04]),
    P(rcone(0.5, 0.2, 1.5, 0.08, 6), hex3, [-0.62, 0.75, 0.2]),
    P(rock(0.45, 14), hex, [0.58, 0.28, -0.2])
  ]
})
const caveGlow = (stone: string, glowHex: string) => () => ({
  lit: [P(rock(0.5, 7), stone, [0, 0.28, 0])],
  glow: [
    P(rcone(0.16, 0.02, 0.9, 0.02, 6), glowHex, [0, 0.7, 0], [0, 0, 0.14]),
    P(rcone(0.11, 0.02, 0.6, 0.02, 6), glowHex, [0.26, 0.5, 0.08], [0, 0, -0.5]),
    P(dome(0.2, 1.5, 8, 4), glowHex, [-0.3, 0.42, -0.1])
  ]
})

/**
 * What stands in front of a side pocket instead of the theme's tall scenery:
 * shapes a hero is never hidden behind. Rock in the theme's colours where
 * nothing low grows.
 */
const LOW_PROPS: Readonly<Record<ThemeId, PropShape[]>> = {
  plains: [{ build: bush('#58b04a', '#8fd864'), w: 4, s: [0.7, 1.15] }, { build: boulder('#9aa4a8', '#b8c0c4'), w: 2, s: [0.6, 1] }],
  cave: [{ build: boulder('#6a5c54', '#857468'), w: 4, s: [0.7, 1.15] }, { build: mushroom('#e8e2d0', '#5fffd0', true), w: 1, s: [0.6, 0.9] }],
  forest: [{ build: bush('#3f8f44', '#5fb85a'), w: 5, s: [0.7, 1.2] }, { build: mushroom('#e8e2d0', '#e0484a', false), w: 1, s: [0.6, 1] }, { build: boulder('#7a8a80', '#96a69a'), w: 2, s: [0.6, 1] }],
  farm: [{ build: bush('#8ab04a', '#b0d060'), w: 4, s: [0.7, 1.15] }, { build: boulder('#c8b89a', '#dccdb0'), w: 2, s: [0.6, 1] }],
  ash: [{ build: boulder('#3a2e30', '#56444a'), w: 4, s: [0.7, 1.2] }, { build: ember('#ff8a3a'), w: 1, s: [1.4, 2.2] }],
  mine: [{ build: boulder('#565060', '#6e6878'), w: 4, s: [0.7, 1.2] }, { build: ember('#5fd8ff'), w: 1, s: [1.4, 2.2] }],
  snow: [{ build: boulder('#c8d8e8', '#f4fbff'), w: 4, s: [0.7, 1.15] }, { build: bush('#4f8a7a', '#f4fbff'), w: 2, s: [0.7, 1.1] }],
  temple: [{ build: boulder('#7a9a94', '#b8c8b8'), w: 4, s: [0.7, 1.15] }, { build: bush('#2f9a8c', '#3fc7b0'), w: 2, s: [0.7, 1.1] }],
  void: [{ build: boulder('#2a1c50', '#3e2c70'), w: 4, s: [0.7, 1.2] }, { build: ember('#d0a8ff'), w: 1, s: [1.4, 2.2] }],
  peak: [{ build: boulder('#5a4e50', '#76686a'), w: 4, s: [0.7, 1.25] }],
  fortress: [{ build: boulder('#3a2a34', '#52404a'), w: 4, s: [0.7, 1.2] }, { build: ember('#ff5a4a'), w: 1, s: [1.4, 2.2] }],
  rift: [{ build: boulder('#1c1040', '#30206a'), w: 4, s: [0.7, 1.2] }, { build: ember('#f0a8ff'), w: 1, s: [1.4, 2.2] }],
  town: [{ build: bush('#58b04a', '#8fd864'), w: 4, s: [0.7, 1.15] }],
  ruin: [{ build: boulder('#5a544a', '#706a5e'), w: 4, s: [0.7, 1.2] }],
  arena: [{ build: boulder('#b8a078', '#d0b890'), w: 4, s: [0.7, 1.1] }]
}

/** A ledge's stone, per theme: its dark and light tone, and whether it is
 *  dressed (cut blocks and built steps) or wild (crags and a worn ramp). */
const CLIFF: Readonly<Record<ThemeId, { a: string; b: string; dressed: boolean }>> = {
  plains: { a: '#8c969a', b: '#b4bec2', dressed: false },
  cave: { a: '#5e5048', b: '#857468', dressed: false },
  forest: { a: '#6e7e74', b: '#96a69a', dressed: false },
  farm: { a: '#9a8a6a', b: '#c4b496', dressed: false },
  ash: { a: '#34282a', b: '#56444a', dressed: false },
  mine: { a: '#4e4858', b: '#726c7c', dressed: true },
  snow: { a: '#98aebe', b: '#e4f2ff', dressed: false },
  temple: { a: '#6e8e88', b: '#b8c8b8', dressed: true },
  void: { a: '#241848', b: '#3e2c70', dressed: true },
  peak: { a: '#4e4446', b: '#76686a', dressed: false },
  fortress: { a: '#34262e', b: '#56444e', dressed: true },
  rift: { a: '#180e38', b: '#30206a', dressed: false },
  town: { a: '#8c969a', b: '#b4bec2', dressed: false },
  ruin: { a: '#54504a', b: '#706a5e', dressed: true },
  arena: { a: '#a89070', b: '#d0b890', dressed: true }
}

/** A low stone on a ledge's brow (outlined: it inks the edge of the drop). */
const browStone = (a: string, b: string) => () => ({
  lit: [P(rock(0.36, 7, 9, 7), b, [0, 0.08, 0], [0, 0, 0], [1.3, 0.75, 1]), P(rock(0.2, 13, 8, 6), a, [0.26, 0.04, 0.12])]
})
/** A cut coping stone along a built terrace's edge. */
const coping = (a: string, b: string) => () => ({
  lit: [P(rbox(1.56, 0.2, 0.42, 0.3, 10, 6), b, [0, 0.06, 0]), P(rbox(1.5, 0.5, 0.3, 0.3, 10, 6), a, [0, -0.25, 0.08])]
})
/** One step of a built ramp (laid across the way up). */
const tread = (a: string, b: string) => () => ({
  lit: [P(rbox(1.5, 0.34, 0.74, 0.25, 10, 6), b, [0, -0.1, 0]), P(rbox(1.52, 0.1, 0.1, 0.4, 8, 4), a, [0, 0.07, 0.34])]
})
/** A stone that lines a ramp. */
const kerb = (a: string, b: string) => () => ({ lit: [P(rock(0.32, 31, 8, 6), b, [0, 0.12, 0]), P(rock(0.2, 37, 7, 5), a, [0.18, 0.06, 0.12])] })

// ── Value noise for the ground's mottling ────────────────────────────────────

const hash = (x: number, y: number, seed: number): number => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
const noise = (x: number, y: number, seed: number): number => {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = x - xi
  const fy = y - yi
  const u = fx * fx * (3 - 2 * fx)
  const v = fy * fy * (3 - 2 * fy)
  const a = hash(xi, yi, seed)
  const b = hash(xi + 1, yi, seed)
  const c = hash(xi, yi + 1, seed)
  const d = hash(xi + 1, yi + 1, seed)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

/** Cells of ground drawn past the grid on every side (the camera's reach up-screen on a tall phone is about 12). */
const LAND = 18
/** Cells of scenery past the grid. */
const WILDS = 13

export interface Terrain {
  root: Group
  theme: Theme
  /** Free every geometry this terrain created (materials are shared). */
  dispose(): void
}

const _m = new Matrix4()
const _q = new Quaternion()
const _p = new Vector3()
const _s = new Vector3()
const _up = new Vector3(0, 1, 0)
const _nrm = new Vector3()

/** Side of a scenery tile, metres. One InstancedMesh per shape per tile: an
 *  instanced mesh is culled as a whole, so a zone-wide one is drawn in full on
 *  every frame however little of it is on screen. */
const TILE = 15

/** x, z, turn, scale, and (optionally) the height to stand at. */
type Place = [number, number, number, number, number?]

const instanced = (shape: PropShape, places: Place[], outline: boolean, root: Group, owned: BufferGeometry[]): void => {
  if (!places.length) return
  const tiles = new Map<number, Place[]>()
  for (const p of places) {
    const key = Math.floor(p[0] / TILE) * 4096 + Math.floor(p[1] / TILE)
    const list = tiles.get(key)
    if (list) list.push(p)
    else tiles.set(key, [p])
  }
  const built = shape.build()
  const add = (geos: BufferGeometry[], lit: boolean): void => {
    if (!geos.length) return
    const geo = merge(geos)
    owned.push(geo)
    for (const list of tiles.values()) {
      const mesh = new InstancedMesh(geo, lit ? celVC() : glowVC(), list.length)
      const line = lit && outline ? new InstancedMesh(geo, outlineMat(), list.length) : null
      for (let i = 0; i < list.length; i++) {
        const [x, z, rot, sc, y] = list[i]!
        _q.setFromAxisAngle(_up, rot)
        // On the ground's height, unless the place says where.
        _p.set(x, y ?? groundAt(x, z), z)
        _s.set(sc, sc, sc)
        _m.compose(_p, _q, _s)
        mesh.setMatrixAt(i, _m)
        line?.setMatrixAt(i, _m)
      }
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
      root.add(mesh)
      if (line) {
        line.instanceMatrix.needsUpdate = true
        line.computeBoundingSphere()
        line.renderOrder = -1
        root.add(line)
      }
    }
  }
  add(built.lit, true)
  add(built.glow ?? [], false)
}

const pickShape = (shapes: PropShape[], r: number): number => {
  let total = 0
  for (const s of shapes) total += s.w
  let v = r * total
  for (let i = 0; i < shapes.length; i++) {
    v -= shapes[i]!.w
    if (v <= 0) return i
  }
  return 0
}


/**
 * Build a zone's scenery from its plan. Time-sliced (`slice`) so the loader
 * keeps painting while a large zone is assembled.
 */
export const buildTerrain = async (plan: ZonePlan, themeId: ThemeId, scene: Scene, slice: Slice): Promise<Terrain> => {
  const theme = THEMES[themeId]
  const root = new Group()
  const owned: BufferGeometry[] = []
  const rng = mulberry32(plan.seed ^ 0x51ab)
  const { w, h, solid, trail } = plan
  const low = sceneQuality() === 'low'
  const liquid = plan.liquid ? LIQUIDS[plan.liquid] : null
  // Water per cell, and how near each cell is to it (its 3 × 3): the bank's tint.
  const wet = new Uint8Array(w * h)
  let anyWet = false
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (wetCell(plan, i, j)) { wet[j * w + i] = 1; anyWet = true }
  const damp = new Float32Array(w * h)
  if (anyWet) {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        let n = 0
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          const ni = i + di
          const nj = j + dj
          if (ni >= 0 && nj >= 0 && ni < w && nj < h && wet[nj * w + ni]) n++
        }
        damp[j * w + i] = n / 9
      }
    }
  }
  // A side pocket is a small place: tall scenery on its near (down-screen)
  // side would hide all of it from a camera that cannot look round a tree.
  // The solid cells up to three rows in front of one carry low props only.
  const lowRing = new Uint8Array(w * h)
  let anySide = false
  for (let j = 2; j < h - 5; j++) {
    for (let i = 2; i < w - 2; i++) {
      if (!plan.side[j * w + i]) continue
      anySide = true
      for (let dj = 1; dj <= 3; dj++) for (let di = -1; di <= 1; di++) {
        const k = (j + dj) * w + i + di
        // The row count in front of the pocket: the first row is its edge.
        if (solid[k] && (!lowRing[k] || lowRing[k]! > dj)) lowRing[k] = dj
      }
    }
  }
  // Solid cells within two of a cave's floor carry cave rock, not the zone's own.
  const caveRing = new Uint8Array(w * h)
  if (plan.caves.length) {
    for (let j = 2; j < h - 2; j++) {
      for (let i = 2; i < w - 2; i++) {
        if (!plan.cave[j * w + i]) continue
        for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) {
          const k = (j + dj) * w + i + di
          if (solid[k]) caveRing[k] = 1
        }
      }
    }
  }

  setCelMood({ ambient: theme.ambient, shadowTint: theme.shadow })
  scene.background = new Color(theme.sky)

  // Distance from each cell to the nearest walkable one (0 = walkable), up to 4.
  const near = new Uint8Array(w * h).fill(9)
  for (let k = 0; k < w * h; k++) if (!solid[k]) near[k] = 0
  for (let pass = 1; pass <= 4; pass++) {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const k = j * w + i
        if (near[k]! <= pass) continue
        let hit = false
        for (let dj = -1; dj <= 1 && !hit; dj++) {
          for (let di = -1; di <= 1; di++) {
            const ni = i + di
            const nj = j + dj
            if (ni >= 0 && nj >= 0 && ni < w && nj < h && near[nj * w + ni] === pass - 1) { hit = true; break }
          }
        }
        if (hit) near[k] = pass
      }
    }
  }
  await slice()

  // ── Ground: two vertices per cell edge, so the mottling has room to blend ──
  const SUB = 2
  const gw = w * SUB + 1
  const gh = h * SUB + 1
  const pos: number[] = []
  const col: number[] = []
  const uv: number[] = []
  const nor: number[] = []
  const idx: number[] = []
  const vmap = new Int32Array(gw * gh).fill(-1)
  const cA = new Color(theme.ground[0])
  const cB = new Color(theme.ground[1])
  const cT = new Color(theme.trail)
  const cR = new Color(theme.rim)
  const c = new Color()
  const c2 = new Color()
  // Ledges: which cells are a cliff edge and which a ramp.
  const cliffMask = new Uint8Array(w * h)
  const rampMask = new Uint8Array(w * h)
  let anyCliff = false
  for (let k = 0; k < w * h; k++) {
    if (plan.kind[k] === K_CLIFF) { cliffMask[k] = 1; anyCliff = true }
    if (plan.kind[k] === K_RAMP) { rampMask[k] = 1; anyCliff = true }
  }
  const rockLook = CLIFF[themeId]
  let meanH = 0
  for (const v of plan.height) meanH += v
  meanH /= Math.max(1, plan.height.length)
  const cRockA = new Color(rockLook.a)
  const cRockB = new Color(rockLook.b)
  const cBed = new Color(liquid?.bed ?? '#000000')
  const cBank = new Color(liquid?.bank ?? '#000000')
  const cCaveA = new Color(CAVE.ground[0])
  const cCaveB = new Color(CAVE.ground[1])
  const cCaveR = new Color(CAVE.rim)
  /** The share of the cells touching a ground vertex that `layer` marks (0..1). */
  const shareAt = (layer: Uint8Array | Float32Array, gi: number, gj: number): number => {
    let t = 0
    let n = 0
    for (let dj = -1; dj <= 0; dj++) {
      for (let di = -1; di <= 0; di++) {
        const i = Math.floor((gi + di) / SUB)
        const j = Math.floor((gj + dj) / SUB)
        if (i < 0 || j < 0 || i >= w || j >= h) continue
        t += layer[j * w + i]!
        n++
      }
    }
    return n ? t / n : 0
  }
  const cellNear = (gi: number, gj: number): number => {
    // The vertex's cell (clamped), for the rim falloff.
    const i = Math.min(w - 1, Math.floor(gi / SUB))
    const j = Math.min(h - 1, Math.floor(gj / SUB))
    return near[j * w + i]!
  }
  const trailAt = (gi: number, gj: number): number => {
    // Soft trail: average over the cells touching this vertex.
    let t = 0
    let n = 0
    for (let dj = -1; dj <= 0; dj++) {
      for (let di = -1; di <= 0; di++) {
        const i = Math.floor((gi + di) / SUB)
        const j = Math.floor((gj + dj) / SUB)
        if (i < 0 || j < 0 || i >= w || j >= h) continue
        t += trail[j * w + i]!
        n++
      }
    }
    return n ? t / n : 0
  }
  const vertex = (gi: number, gj: number): number => {
    const key = gj * gw + gi
    if (vmap[key]! >= 0) return vmap[key]!
    const x = (gi / SUB) * CELL
    const z = (gj / SUB) * CELL
    const n = noise(x * 0.22, z * 0.22, plan.seed) * 0.65 + noise(x * 0.7, z * 0.7, plan.seed + 7) * 0.35
    c.copy(cA).lerp(cB, n)
    const t = trailAt(gi, gj)
    if (t > 0) c.lerp(cT, Math.min(0.85, t * (0.7 + 0.3 * n)))
    // Inside a cave the ground is the cave's own, whatever grows outside.
    const cv = plan.caves.length ? shareAt(plan.cave, gi, gj) : 0
    if (cv > 0) c.lerp(c2.copy(cCaveA).lerp(cCaveB, n), cv)
    const d = cellNear(gi, gj)
    if (d > 0) {
      const ci = Math.min(w - 1, Math.floor(gi / SUB))
      const cj = Math.min(h - 1, Math.floor(gj / SUB))
      c.lerp(caveRing[cj * w + ci] ? cCaveR : cR, Math.min(1, d / 2.5))
    }
    // A cliff is banded stone; a ramp is worn like a trail.
    if (anyCliff) {
      const cl = shareAt(cliffMask, gi, gj)
      if (cl > 0) c.lerp(c2.copy(cRockA).lerp(cRockB, n > 0.5 ? 0.85 : 0.25), Math.min(1, cl * 1.6))
      const rp = shareAt(rampMask, gi, gj)
      if (rp > 0) c.lerp(cT, Math.min(0.75, rp))
    }
    // The relief: the slope's normal, and a light hill shade baked in (a
    // slope that faces the light a little lighter, one turned away darker).
    let gy = groundAt(x, z)
    const gx = (groundAt(x + 0.4, z) - groundAt(x - 0.4, z)) / 0.8
    const gz = (groundAt(x, z + 0.4) - groundAt(x, z - 0.4)) / 0.8
    c.multiplyScalar(1 + Math.max(-0.3, Math.min(0.3, -(gx * 0.4 + gz * 0.42) * 1.1)))
    _nrm.set(-gx, 1, -gz).normalize()
    // Higher ground a touch lighter, lower a touch darker: a terrace reads as a level.
    c.multiplyScalar(1 + Math.max(-0.12, Math.min(0.12, (gy - meanH) * 0.06)))
    // At a cliff's foot the ground lies in its shadow.
    if (anyCliff) {
      const cl = shareAt(cliffMask, gi, gj)
      if (cl > 0 && cl < 1) {
        const ci = Math.min(w - 1, Math.floor(gi / SUB))
        const cj = Math.min(h - 1, Math.floor(gj / SUB))
        const near0 = groundAt((ci + 0.5) * CELL, (cj + 0.5) * CELL)
        if (gy <= near0 + 0.05) c.multiplyScalar(0.8)
      }
    }
    // Inside a cliff cell the face is steep, not a ramp: its own vertices are
    // drawn toward its foot or its brow, and it is dark stone with a light brow.
    if (anyCliff && shareAt(cliffMask, gi, gj) >= 1) {
      const ci = Math.min(w - 1, Math.floor(gi / SUB))
      const cj = Math.min(h - 1, Math.floor(gj / SUB))
      const W1 = w + 1
      const hs = plan.height
      const lo = Math.min(hs[cj * W1 + ci]!, hs[cj * W1 + ci + 1]!, hs[(cj + 1) * W1 + ci]!, hs[(cj + 1) * W1 + ci + 1]!)
      const hi = Math.max(hs[cj * W1 + ci]!, hs[cj * W1 + ci + 1]!, hs[(cj + 1) * W1 + ci]!, hs[(cj + 1) * W1 + ci + 1]!)
      if (hi - lo > 0.3) {
        const t = Math.max(0, Math.min(1, (gy - lo) / (hi - lo)))
        const s = t * t * (3 - 2 * t)
        gy = lo + (hi - lo) * (s * s * (3 - 2 * s))
        c.copy(cRockA).lerp(cRockB, t > 0.82 ? 0.9 : n * 0.3)
        if (t < 0.15) c.multiplyScalar(0.82)
      }
    }
    // Water: the ground dips to the bed (the slope is the bank), the bank
    // takes the liquid's tint and the bed its colour.
    let y = 0
    if (anyWet) {
      const f = shareAt(wet, gi, gj)
      const by = shareAt(damp, gi, gj)
      if (by > 0 && liquid) c.lerp(cBank, Math.min(1, by * 1.8) * liquid.bankK)
      if (f > 0) {
        y = BED_Y * f
        if (f > 0.34) c.lerp(cBed, Math.min(1, (f - 0.34) / 0.4))
      }
    }
    vmap[key] = pos.length / 3
    pos.push(x, y + gy, z)
    col.push(c.r, c.g, c.b)
    uv.push(x / 5, z / 5)
    nor.push(_nrm.x, _nrm.y, _nrm.z)
    return vmap[key]!
  }
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if (near[j * w + i]! > 3) continue
      for (let sj = 0; sj < SUB; sj++) {
        for (let si = 0; si < SUB; si++) {
          const gi = i * SUB + si
          const gj = j * SUB + sj
          const a = vertex(gi, gj)
          const b = vertex(gi + 1, gj)
          const d = vertex(gi + 1, gj + 1)
          const e = vertex(gi, gj + 1)
          idx.push(a, e, b, b, e, d)
        }
      }
    }
    if ((j & 7) === 7) await slice()
  }
  const ground = new BufferGeometry()
  ground.setAttribute('position', new Float32BufferAttribute(pos, 3))
  ground.setAttribute('normal', new Float32BufferAttribute(nor, 3))
  ground.setAttribute('color', new Float32BufferAttribute(col, 3))
  ground.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  ground.setIndex(idx)
  owned.push(ground)
  const groundMesh = new Mesh(ground, celVCMap(groundDetail()))
  groundMesh.renderOrder = -2
  root.add(groundMesh)
  await slice()

  // ── The land beyond: the world does not stop where the walking does ──
  // The camera never sees the horizon (it looks down at 52°), so "no edge"
  // means ground under every pixel it can reach: a coarse sheet under the
  // whole grid and `LAND` cells past it, in the rim colour where it meets the
  // detailed ground and drifting darker with distance.
  {
    const fw = w + LAND * 2 + 1
    const fh = h + LAND * 2 + 1
    const fpos = new Float32Array(fw * fh * 3)
    const fcol = new Float32Array(fw * fh * 3)
    const fuv = new Float32Array(fw * fh * 2)
    const fnor = new Float32Array(fw * fh * 3)
    const cF = new Color(theme.rim).multiplyScalar(0.72)
    for (let j = 0; j < fh; j++) {
      for (let i = 0; i < fw; i++) {
        const ci = i - LAND
        const cj = j - LAND
        const x = ci * CELL
        const z = cj * CELL
        // How deep into the unwalkable mass this corner is (cells past ring 3).
        const ii = Math.max(0, Math.min(w - 1, ci))
        const jj = Math.max(0, Math.min(h - 1, cj))
        const out = Math.max(0, -ci, ci - w, -cj, cj - h)
        const d = Math.min(9, near[jj * w + ii]!) + out
        const n = noise(x * 0.11, z * 0.11, plan.seed + 3)
        c.copy(cR).lerp(cF, Math.max(0, Math.min(1, (d - 3) / 5)) * (0.45 + 0.55 * n))
        const k = j * fw + i
        // Under water the sheet drops below the bed, so it never shows through;
        // under the detailed ground it keeps a hand's breadth below it (a
        // bilinear cell and the sheet's flat halves never cross).
        const sunk = anyWet && (wetCell(plan, ci, cj) || wetCell(plan, ci - 1, cj) || wetCell(plan, ci, cj - 1) || wetCell(plan, ci - 1, cj - 1))
        const inGrid = ci >= 0 && cj >= 0 && ci <= w && cj <= h
        const under = inGrid && near[Math.min(h - 1, cj) * w + Math.min(w - 1, ci)]! <= 3
        fpos[k * 3] = x; fpos[k * 3 + 1] = groundAt(x, z) + (sunk ? BED_Y - 0.3 : under ? -0.14 : -0.03); fpos[k * 3 + 2] = z
        fcol[k * 3] = c.r; fcol[k * 3 + 1] = c.g; fcol[k * 3 + 2] = c.b
        fuv[k * 2] = x / 5; fuv[k * 2 + 1] = z / 5
        fnor[k * 3 + 1] = 1
      }
    }
    const fidx: number[] = []
    for (let j = 0; j < fh - 1; j++) {
      for (let i = 0; i < fw - 1; i++) {
        const a = j * fw + i
        fidx.push(a, a + fw, a + 1, a + 1, a + fw, a + fw + 1)
      }
    }
    const far = new BufferGeometry()
    far.setAttribute('position', new Float32BufferAttribute(fpos, 3))
    far.setAttribute('normal', new Float32BufferAttribute(fnor, 3))
    far.setAttribute('color', new Float32BufferAttribute(fcol, 3))
    far.setAttribute('uv', new Float32BufferAttribute(fuv, 2))
    far.setIndex(fidx)
    owned.push(far)
    const farMesh = new Mesh(far, celVCMap(groundDetail()))
    farMesh.renderOrder = -3
    root.add(farMesh)
    await slice()
  }

  // ── Border props on the solid cells that face the walkable ground ──
  const borderPlaces: Array<Array<[number, number, number, number]>> = theme.border.map(() => [])
  const footprint = new Set<number>()
  for (const b of plan.buildings) {
    const i0 = Math.floor((b.x - b.w / 2) / CELL)
    const i1 = Math.floor((b.x + b.w / 2) / CELL)
    const j0 = Math.floor((b.z - b.d / 2) / CELL)
    const j1 = Math.floor((b.z + b.d / 2) / CELL)
    for (let j = j0 - 1; j <= j1 + 1; j++) for (let i = i0 - 1; i <= i1 + 1; i++) footprint.add(j * w + i)
  }
  // Past the two rings that face the player, the same scenery carries on,
  // thinner and without outlines: woods behind the trees, rock behind the
  // rocks, out to `WILDS` cells beyond the grid.
  const wildPlaces: Array<Array<[number, number, number, number]>> = theme.border.map(() => [])
  const wildDensity = low ? 0.12 : 0.3
  // Round a cave: tall rock on the far (up-screen) side, low rock on the near
  // side, and a glowing cluster now and then. The camera has no way to look
  // through a wall, so nothing tall ever stands between it and the cave floor.
  const caveShapes: PropShape[] = [
    { build: caveWall('#4a4458', '#5e586e', '#3c3848'), w: 1, s: [0.95, 1.25] },
    { build: boulder('#4a4458', '#5e586e'), w: 1, s: [0.85, 1.25] },
    { build: caveGlow('#3c3848', theme.mote), w: 1, s: [0.8, 1.2] }
  ]
  const cavePlaces: Array<Array<[number, number, number, number]>> = caveShapes.map(() => [])
  // In front of a side pocket: the theme's own low shapes (a bush, a boulder,
  // a mushroom), or a plain rock in its colours where it has none.
  const lowShapes: PropShape[] = anySide ? LOW_PROPS[themeId] : []
  const lowPlaces: Array<Array<[number, number, number, number]>> = lowShapes.map(() => [])
  for (let j = -WILDS; j < h + WILDS; j++) {
    for (let i = -WILDS; i < w + WILDS; i++) {
      const inside = i >= 0 && j >= 0 && i < w && j < h
      const k = j * w + i
      const d = inside ? near[k]! : 9
      if (d === 0 || (inside && footprint.has(k))) continue
      // A river runs on past the grid; a level prop has its cell to itself.
      if (anyWet && wetCell(plan, i, j)) continue
      if (inside && plan.kind[k] === K_BLOCK) continue
      if (inside && caveRing[k]) {
        if (d === 2 && rng() < 0.4) continue
        // Far side: a cave cell lies just down-screen of this one.
        let far = false
        for (let dj = 1; dj <= 2 && !far; dj++) for (let di = -1; di <= 1; di++) if (plan.cave[(j + dj) * w + i + di]) { far = true; break }
        const shape = far ? (rng() < 0.82 ? 0 : 2) : rng() < 0.8 ? 1 : 2
        const s = caveShapes[shape]!
        cavePlaces[shape]!.push([(i + 0.5 + (rng() - 0.5) * 0.4) * CELL, (j + 0.5 + (rng() - 0.5) * 0.4) * CELL, rng() * Math.PI * 2, s.s[0] + rng() * (s.s[1] - s.s[0])])
        continue
      }
      if (inside && lowRing[k]) {
        // Thick along the pocket's edge, thinning away from it: a hem, not a field.
        if (rng() > (lowRing[k] === 1 ? 0.8 : lowRing[k] === 2 ? 0.42 : 0.2)) continue
        const shape = pickShape(lowShapes, rng())
        const s = lowShapes[shape]!
        lowPlaces[shape]!.push([(i + 0.5 + (rng() - 0.5) * 0.5) * CELL, (j + 0.5 + (rng() - 0.5) * 0.5) * CELL, rng() * Math.PI * 2, s.s[0] + rng() * (s.s[1] - s.s[0])])
        continue
      }
      const facing = d <= (low ? 1 : 2)
      if (facing) {
        // The second ring is thinned: it only has to close the gaps of the first.
        if (d === 2 && rng() < 0.45) continue
      } else if (rng() > wildDensity) continue
      const shape = pickShape(theme.border, rng())
      const s = theme.border[shape]!
      const jitter = facing ? 0.5 : 0.9
      ;(facing ? borderPlaces : wildPlaces)[shape]!.push([
        (i + 0.5 + (rng() - 0.5) * jitter) * CELL, (j + 0.5 + (rng() - 0.5) * jitter) * CELL, rng() * Math.PI * 2,
        (s.s[0] + rng() * (s.s[1] - s.s[0])) * (facing ? 1 : 1.12)
      ])
    }
  }
  for (let n = 0; n < theme.border.length; n++) {
    instanced(theme.border[n]!, borderPlaces[n]!, true, root, owned)
    instanced(theme.border[n]!, wildPlaces[n]!, false, root, owned)
    await slice()
  }
  for (let n = 0; n < caveShapes.length; n++) instanced(caveShapes[n]!, cavePlaces[n]!, true, root, owned)
  for (let n = 0; n < lowShapes.length; n++) instanced(lowShapes[n]!, lowPlaces[n]!, true, root, owned)

  // ── Ledges: a crag (or a wall of cut blocks) along each cliff edge, and the ramp's steps or kerbs ──
  if (anyCliff) {
    const wall: Place[] = []
    const steps: Place[] = []
    const kerbs: Place[] = []
    const corner = (i: number, j: number): number => plan.height[j * (w + 1) + i]!
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const k = j * w + i
        const cx0 = (i + 0.5) * CELL
        const cz0 = (j + 0.5) * CELL
        if (cliffMask[k]) {
          const c00 = corner(i, j)
          const c10 = corner(i + 1, j)
          const c01 = corner(i, j + 1)
          const c11 = corner(i + 1, j + 1)
          const lo = Math.min(c00, c10, c01, c11)
          const hi = Math.max(c00, c10, c01, c11)
          if (hi - lo < 0.3) continue
          // The brow is the ledge's own straight line: every stone on it sits
          // exactly there and turns its way, so the edge reads as one line.
          const l = plan.ledges.find(q => Math.hypot(q.x - cx0, q.z - cz0) < q.r * 1.5)
          let ux = (c10 + c11 - c00 - c01) / 2
          let uz = (c01 + c11 - c00 - c10) / 2
          const ul = Math.hypot(ux, uz) || 1
          ux /= ul
          uz /= ul
          let bx = cx0 + ux * 0.5
          let bz = cz0 + uz * 0.5
          if (l) {
            ux = l.ux
            uz = l.uz
            const sc = (cx0 - l.x) * ux + (cz0 - l.z) * uz
            bx = cx0 + ux * (l.d0 + 0.32 - sc)
            bz = cz0 + uz * (l.d0 + 0.32 - sc)
          }
          const yaw = Math.atan2(ux, uz) + Math.PI / 2
          if (rockLook.dressed) {
            // A coping stone along the terrace's edge: the line the eye reads as a drop.
            wall.push([bx, bz, yaw, 1, hi + 0.01])
          } else {
            // Stones along the brow, and now and then a boulder fallen to the foot.
            wall.push([bx + uz * 0.35, bz - ux * 0.35, rng() * 6, 0.75 + rng() * 0.3, hi - 0.06])
            wall.push([bx - uz * 0.35, bz + ux * 0.35, rng() * 6, 0.6 + rng() * 0.3, hi - 0.06])
            if (rng() < 0.3) kerbs.push([cx0 - ux * 0.6, cz0 - uz * 0.6, rng() * 6, 1.2 + rng() * 0.5, lo])
          }
        } else if (rampMask[k]) {
          const l = plan.ledges.find(q => Math.hypot(q.x - cx0, q.z - cz0) < q.r * 1.4)
          const yaw = l ? Math.atan2(l.ux, l.uz) : 0
          if (rockLook.dressed && l) {
            // Two treads to a cell, each at the ground's height where it lies.
            for (const f of [-0.25, 0.25]) {
              const px = cx0 + l.ux * f * CELL
              const pz = cz0 + l.uz * f * CELL
              steps.push([px, pz, yaw, 1, groundAt(px, pz)])
            }
          } else {
            // Stones along the sides where the ramp meets the cliff.
            for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
              if (!cliffMask[(j + dj) * w + i + di]) continue
              const px = cx0 + di * 0.55
              const pz = cz0 + dj * 0.55
              kerbs.push([px, pz, rng() * 6, 0.8 + rng() * 0.4, groundAt(px, pz)])
            }
          }
        }
      }
    }
    const look = rockLook
    instanced({ build: look.dressed ? coping(look.a, look.b) : browStone(look.a, look.b), w: 1, s: [1, 1] }, wall, true, root, owned)
    if (steps.length) instanced({ build: tread(look.a, look.b), w: 1, s: [1, 1] }, steps, true, root, owned)
    if (kerbs.length) instanced({ build: kerb(look.a, look.b), w: 1, s: [1, 1] }, kerbs, true, root, owned)
    await slice()
  }

  // ── Decor scattered through the clearings (never on the trail) ──
  const decorPlaces: Array<Array<[number, number, number, number]>> = theme.decor.map(() => [])
  const density = low ? 0.05 : 0.11
  const caveDecor: PropShape[] = [{ build: pebble('#5e586e'), w: 3, s: [0.8, 1.6] }, { build: shroom(theme.mote), w: 2, s: [0.8, 1.4] }]
  const caveDecorPlaces: Array<Array<[number, number, number, number]>> = caveDecor.map(() => [])
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = j * w + i
      if (solid[k] || trail[k] || footprint.has(k) || rng() > density) continue
      // Nothing grows in water, on a bridge, under a chest or on a plate.
      if (plan.kind[k] !== K_GROUND) continue
      if (plan.cave[k]) {
        const shape = pickShape(caveDecor, rng())
        const s = caveDecor[shape]!
        caveDecorPlaces[shape]!.push([(i + rng()) * CELL, (j + rng()) * CELL, rng() * Math.PI * 2, s.s[0] + rng() * (s.s[1] - s.s[0])])
        continue
      }
      const shape = pickShape(theme.decor, rng())
      const s = theme.decor[shape]!
      decorPlaces[shape]!.push([(i + rng()) * CELL, (j + rng()) * CELL, rng() * Math.PI * 2, s.s[0] + rng() * (s.s[1] - s.s[0])])
    }
  }
  for (let n = 0; n < theme.decor.length; n++) instanced(theme.decor[n]!, decorPlaces[n]!, false, root, owned)
  for (let n = 0; n < caveDecor.length; n++) instanced(caveDecor[n]!, caveDecorPlaces[n]!, false, root, owned)
  await slice()

  // A town's houses, props and people are `gfx/townView.ts`.

  scene.add(root)
  return {
    root,
    theme,
    dispose: () => {
      scene.remove(root)
      for (const g of owned) g.dispose()
      root.traverse((o) => { if ((o as InstancedMesh).isInstancedMesh) (o as InstancedMesh).dispose() })
    }
  }
}

/**
 * Distance haze, fitted to the camera's distance. The hero stands at depth
 * `camDist` and the top edge of the screen is at about 1.31 x that, so the
 * haze begins just past the playfield and only the land beyond fades into it.
 */
export const setZoneFog = (scene: Scene, theme: Theme, camDist: number): void => {
  scene.fog = new Fog(new Color(theme.sky), camDist * 1.2, camDist * 2.05)
}

// ─── Temporary walls (Earth Barrier, rubble) ─────────────────────────────────

/** A pool of rock columns that rise out of and sink back into the ground. */
export class WallRocks {
  readonly root = new Group()
  private pool: Array<{ mesh: Mesh; line: Mesh; cell: number; t: number; state: 0 | 1 | 2 }> = []
  private geo: BufferGeometry | null = null
  private rubble: BufferGeometry | null = null

  private shapes(): void {
    if (this.geo) return
    this.geo = merge([P(rcone(0.78, 0.36, 1.9, 0.08, 7), '#b08a5a', [0, 0.95, 0]), P(rock(0.5, 5), '#c79a5a', [0.2, 1.9, 0.1]), P(rock(0.45, 8), '#9a744a', [-0.4, 0.3, 0.3])])
    this.rubble = merge([P(rock(0.7, 3), '#8a7a6a', [0, 0.4, 0]), P(rock(0.5, 12), '#a8988a', [0.4, 0.7, -0.2]), P(rock(0.4, 19), '#6a5c50', [-0.4, 0.3, 0.3])])
  }

  set(cells: number[], gridW: number, on: boolean, fx: string): void {
    this.shapes()
    for (const cell of cells) {
      if (on) {
        let r = this.pool.find(p => p.state === 0)
        if (!r) {
          const mesh = new Mesh(this.geo!, celVC())
          const line = new Mesh(this.geo!, outlineMat())
          line.renderOrder = -1
          this.root.add(mesh, line)
          r = { mesh, line, cell, t: 0, state: 0 }
          this.pool.push(r)
        }
        const i = cell % gridW
        const j = (cell - i) / gridW
        r.mesh.geometry = r.line.geometry = fx === 'rubble' ? this.rubble! : this.geo!
        r.mesh.position.set((i + 0.5) * CELL, groundAt((i + 0.5) * CELL, (j + 0.5) * CELL), (j + 0.5) * CELL)
        r.mesh.rotation.y = (cell * 2.39996) % (Math.PI * 2)
        r.cell = cell
        r.t = 0
        r.state = 1
        r.mesh.visible = r.line.visible = true
      } else {
        const r = this.pool.find(p => p.state === 1 && p.cell === cell)
        if (r) { r.state = 2; r.t = 0 }
      }
    }
  }

  update(dt: number): void {
    for (const r of this.pool) {
      if (r.state === 0) continue
      r.t += dt
      let k: number
      if (r.state === 1) {
        // Bursts up with an overshoot.
        const u = Math.min(1, r.t / 0.35)
        k = u >= 1 ? 1 : 1 + Math.sin(u * Math.PI) * 0.22 - (1 - u) * (1 - u)
      } else {
        k = Math.max(0, 1 - r.t / 0.4)
        if (k <= 0) { r.state = 0; r.mesh.visible = r.line.visible = false }
      }
      r.mesh.scale.set(1, Math.max(0.001, k), 1)
      r.line.position.copy(r.mesh.position)
      r.line.rotation.copy(r.mesh.rotation)
      r.line.scale.copy(r.mesh.scale)
    }
  }

  dispose(): void {
    this.geo?.dispose()
    this.rubble?.dispose()
  }
}

/** The zone's reward chest. */
export const buildChest = (): { root: Group; lid: Object3D; dispose(): void } => {
  const root = new Group()
  const base = merge([P(rbox(0.9, 0.5, 0.6, 0.4, 10, 8), '#8a5a34', [0, 0.25, 0]), P(rbox(0.94, 0.12, 0.64, 0.4, 10, 6), '#ffd24a', [0, 0.46, 0])])
  const lidG = merge([P(rbox(0.92, 0.36, 0.62, 0.6, 10, 8), '#a06a3a', [0, 0.16, -0.3]), P(rbox(0.16, 0.2, 0.08, 0.5, 8, 6), '#ffd24a', [0, 0.06, -0.62])])
  const lid = new Group()
  lid.position.set(0, 0.5, 0.3)
  lid.add(new Mesh(lidG, celVC()))
  const lo = new Mesh(lidG, outlineMat())
  lo.renderOrder = -1
  lid.add(lo)
  root.add(new Mesh(base, celVC()))
  const bo = new Mesh(base, outlineMat())
  bo.renderOrder = -1
  root.add(bo, lid)
  return { root, lid, dispose: () => { base.dispose(); lidG.dispose() } }
}

export { DynamicDrawUsage, ell }
