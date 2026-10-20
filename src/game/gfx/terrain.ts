import {
  BufferGeometry, Color, DynamicDrawUsage, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh, Object3D,
  Quaternion, ShaderMaterial, UniformsLib, UniformsUtils, Vector3, Fog, type Scene, type Texture
} from 'three'
import type { LiquidId, ThemeId } from '../data/zones'
import { CELL, createGrid, type Grid } from '../sim/grid'
import { mulberry32 } from '../sim/rng'
import { townExitClear } from '../sim/townCells'
import { fillGrid, type ZonePlan } from '../sim/zoneGen'
import { K_BLOCK, K_BRIDGE, K_CLIFF, K_FORD, K_GROUND, K_RAMP, K_WATER, riverRow } from '../sim/zoneFeatures'
import { groundAt } from './ground'
import type { Slice } from '../engine/slicer'
import { sceneQuality } from '../engine/quality'
import { EDGE_FOG_K, celVC, celVCInst, celVCMap, clearEdgeFog, edgeFog, glowVC, glowVCInst, outlineMat, setCelMood, setEdgeFog } from './cel'
import { EDGE_FROM, EDGE_MAX, EDGE_STRENGTH, EDGE_TO, edgeColour, edgeField, edgeTexture } from './edgeFog'
import { cap, dome, ell, merge, paint, rbox, rcone, rcyl, rock, sph, xform } from './kit'
import { groundDetail } from './textures'
import { markStill, splitByTile } from './cull'
import { COVER_TOL, FootIndex, cellSamples, footOf, footPoints, footedDist, spillOf, type Foot } from './footprint'
import { BODY_H, GROUND_H, SOLID_TOL, type SceneryKind } from './propRoles'
import { ARENA_PROPS } from '../sim/bosses/kit'

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

export interface PropShape {
  /** What it is, and so whether it stands in the way (`propRoles.ts`). */
  kind: SceneryKind
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
// A broken column's plinth is taller than a whole one's (0.34 against 0.28, so
// 0.32–0.41 against 0.27–0.31 m once scaled): where the two stand close enough
// for their plinths to overlap, the tops never lie in one plane.
const column = (stone: string, broken: boolean) => () => ({
  lit: [
    P(rcyl(0.44, broken ? 0.34 : 0.28, 0.06, 10, 2), stone, [0, broken ? 0.17 : 0.14, 0]),
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
/** A clump of standing wheat (the field layout, #103): two crossed panels of
 *  stalks, the ears gold at the top. Cheap on purpose — a field holds
 *  thousands of them. */
const wheatClump = () => ({
  lit: [
    P(rbox(0.62, 0.62, 0.025, 0.02, 1, 1), '#b89a3e', [0, 0.31, 0]),
    P(rbox(0.62, 0.62, 0.025, 0.02, 1, 1), '#b89a3e', [0, 0.31, 0], [0, Math.PI / 2, 0]),
    P(rbox(0.66, 0.26, 0.03, 0.02, 1, 1), '#e8c45a', [0, 0.75, 0]),
    P(rbox(0.66, 0.26, 0.03, 0.02, 1, 1), '#e8c45a', [0, 0.75, 0], [0, Math.PI / 2, 0])
  ]
})
const shroom = (hex: string) => () => ({ lit: [P(rcyl(0.035, 0.16, 0.012, 6, 1), '#e8e2d0', [0, 0.08, 0])], glow: [P(dome(0.12, 1.5, 8, 4), hex, [0, 0.14, 0])] })

export const THEMES: Readonly<Record<ThemeId, Theme>> = {
  plains: {
    ground: ['#7fc65a', '#6ab04a'], trail: '#c9b07a', rim: '#3f7a3a', sky: '#8fd0ff', ambient: '#ffffff', shadow: '#d6ccff', mote: '#fff6b8',
    border: [{ kind: 'tree', build: tree('#4fa84a', '#7fd060'), w: 5, s: [0.9, 1.4] }, { kind: 'bush', build: bush('#58b04a', '#8fd864'), w: 3, s: [0.9, 1.5] }, { kind: 'boulder', build: boulder('#9aa4a8', '#b8c0c4'), w: 1, s: [0.8, 1.3] }],
    decor: [{ kind: 'tuft', build: tuft('#5fae4a'), w: 6, s: [0.8, 1.4] }, { kind: 'flower', build: flower('#ffd84a'), w: 2, s: [0.8, 1.2] }, { kind: 'flower', build: flower('#ff8ab0'), w: 2, s: [0.8, 1.2] }, { kind: 'pebble', build: pebble('#b8c0c4'), w: 1, s: [0.7, 1.3] }]
  },
  cave: {
    ground: ['#7a6a5a', '#6a5a4c'], trail: '#9a8a74', rim: '#3a3038', sky: '#1c1826', ambient: '#e8dcd0', shadow: '#b8a8e8', mote: '#7dffd0',
    border: [{ kind: 'spire', build: spire('#6a5c54', '#857468'), w: 4, s: [0.9, 1.5] }, { kind: 'boulder', build: boulder('#6a5c54', '#857468'), w: 4, s: [1, 1.6] }, { kind: 'mushroom', build: mushroom('#e8e2d0', '#5fffd0', true), w: 2, s: [0.9, 1.6] }],
    decor: [{ kind: 'pebble', build: pebble('#857468'), w: 4, s: [0.8, 1.6] }, { kind: 'shroom', build: shroom('#5fffd0'), w: 3, s: [0.8, 1.4] }, { kind: 'bones', build: bones, w: 1, s: [0.9, 1.2] }]
  },
  forest: {
    ground: ['#4f9a4a', '#3f8440'], trail: '#8a7a54', rim: '#234a2c', sky: '#2f5a4a', ambient: '#e4f4dc', shadow: '#b8c8ff', mote: '#c8ff9a',
    border: [{ kind: 'pine', build: pine('#2f7a44', '#4fa85a'), w: 5, s: [1, 1.6] }, { kind: 'tree', build: tree('#3f8f44', '#5fb85a', '#5a4430'), w: 3, s: [1.1, 1.7] }, { kind: 'mushroom', build: mushroom('#e8e2d0', '#e0484a', false), w: 1, s: [0.9, 1.4] }],
    decor: [{ kind: 'tuft', build: tuft('#3f8f44'), w: 5, s: [0.9, 1.5] }, { kind: 'shroom', build: shroom('#ffd24a'), w: 2, s: [0.8, 1.3] }, { kind: 'flower', build: flower('#c8a8ff'), w: 2, s: [0.8, 1.2] }]
  },
  farm: {
    ground: ['#b8c85a', '#a4b44a'], trail: '#c9a86a', rim: '#6a7a34', sky: '#ffd8a0', ambient: '#fff0d8', shadow: '#d0c0f0', mote: '#fff0a0',
    border: [{ kind: 'hay', build: hay, w: 3, s: [0.9, 1.2] }, { kind: 'tree', build: tree('#7aa83a', '#a8cc4a'), w: 4, s: [0.9, 1.4] }, { kind: 'bush', build: bush('#8ab04a', '#b0d060'), w: 3, s: [0.9, 1.4] }],
    decor: [{ kind: 'tuft', build: tuft('#c8b04a'), w: 6, s: [0.9, 1.6] }, { kind: 'flower', build: flower('#ff9a4a'), w: 2, s: [0.8, 1.2] }, { kind: 'pebble', build: pebble('#c8b89a'), w: 1, s: [0.7, 1.2] }]
  },
  ash: {
    ground: ['#5a4a4a', '#4a3c40'], trail: '#7a625a', rim: '#241c22', sky: '#3a1c1c', ambient: '#ffe0c8', shadow: '#c8a0c0', mote: '#ff8a3a',
    border: [{ kind: 'spire', build: spire('#3a2e30', '#56444a'), w: 4, s: [1, 1.7] }, { kind: 'deadTree', build: deadTree('#2a2024'), w: 3, s: [0.9, 1.4] }, { kind: 'crystal', build: crystal('#3a2e30', '#ff7a2a'), w: 2, s: [0.8, 1.3] }],
    decor: [{ kind: 'ember', build: ember('#ff8a3a'), w: 4, s: [0.8, 1.4] }, { kind: 'pebble', build: pebble('#3a2e30'), w: 3, s: [0.8, 1.6] }, { kind: 'bones', build: bones, w: 1, s: [0.9, 1.2] }]
  },
  mine: {
    ground: ['#6a6470', '#5a5460'], trail: '#8a8490', rim: '#2a2630', sky: '#16141c', ambient: '#e0e4f4', shadow: '#a8b0f0', mote: '#7fd8ff',
    border: [{ kind: 'wallBlock', build: wallBlock('#565060', '#6e6878'), w: 5, s: [0.95, 1.1] }, { kind: 'crystal', build: crystal('#565060', '#5fd8ff'), w: 2, s: [0.8, 1.3] }, { kind: 'boulder', build: boulder('#565060', '#6e6878'), w: 2, s: [1, 1.5] }],
    decor: [{ kind: 'pebble', build: pebble('#6e6878'), w: 5, s: [0.8, 1.6] }, { kind: 'ember', build: ember('#5fd8ff'), w: 2, s: [0.7, 1.1] }]
  },
  snow: {
    ground: ['#e8f4ff', '#d4e8fa'], trail: '#b8cce0', rim: '#8fa8c8', sky: '#a8c8e8', ambient: '#eaf4ff', shadow: '#b8c8ff', mote: '#ffffff',
    border: [{ kind: 'pine', build: pine('#4f8a7a', '#f4fbff'), w: 5, s: [1, 1.6] }, { kind: 'iceRock', build: iceRock, w: 3, s: [0.9, 1.5] }, { kind: 'boulder', build: boulder('#c8d8e8', '#f4fbff'), w: 2, s: [0.9, 1.4] }],
    decor: [{ kind: 'pebble', build: pebble('#c8d8e8'), w: 3, s: [0.8, 1.4] }, { kind: 'tuft', build: tuft('#9ab8c8'), w: 2, s: [0.8, 1.2] }]
  },
  temple: {
    ground: ['#4fa8a0', '#3f948e'], trail: '#c8d8c0', rim: '#1c4a54', sky: '#12343c', ambient: '#dcfff4', shadow: '#a8c0ff', mote: '#7fffe8',
    border: [{ kind: 'column', build: column('#b8c8b8', false), w: 3, s: [0.95, 1.1] }, { kind: 'brokenColumn', build: column('#a8b8a8', true), w: 3, s: [0.95, 1.2] }, { kind: 'crystal', build: crystal('#4a7a78', '#5fffe0'), w: 2, s: [0.8, 1.2] }],
    decor: [{ kind: 'pebble', build: pebble('#b8c8b8'), w: 3, s: [0.8, 1.5] }, { kind: 'shroom', build: shroom('#5fffe0'), w: 3, s: [0.8, 1.3] }, { kind: 'tuft', build: tuft('#3fc7b0'), w: 2, s: [0.8, 1.3] }]
  },
  void: {
    ground: ['#4a3a7a', '#3c2e68'], trail: '#7a6ab0', rim: '#180e30', sky: '#0e0820', ambient: '#e8dcff', shadow: '#b090ff', mote: '#d0a8ff',
    border: [{ kind: 'crystal', build: crystal('#2a1c50', '#b06aff'), w: 4, s: [1, 1.7] }, { kind: 'spire', build: spire('#2a1c50', '#3e2c70'), w: 4, s: [1, 1.6] }, { kind: 'brokenColumn', build: column('#4a3a7a', true), w: 1, s: [0.95, 1.2] }],
    decor: [{ kind: 'ember', build: ember('#d0a8ff'), w: 4, s: [0.8, 1.4] }, { kind: 'pebble', build: pebble('#3e2c70'), w: 3, s: [0.8, 1.5] }]
  },
  peak: {
    ground: ['#8a7a70', '#766860'], trail: '#a89888', rim: '#3a3038', sky: '#5a3a5a', ambient: '#ffe8dc', shadow: '#c8b0e0', mote: '#ffb07a',
    border: [{ kind: 'spire', build: spire('#5a4e50', '#76686a'), w: 5, s: [1.1, 1.9] }, { kind: 'boulder', build: boulder('#5a4e50', '#76686a'), w: 3, s: [1, 1.7] }, { kind: 'deadTree', build: deadTree('#3a2e30'), w: 1, s: [0.9, 1.3] }],
    decor: [{ kind: 'bones', build: bones, w: 3, s: [0.9, 1.5] }, { kind: 'pebble', build: pebble('#76686a'), w: 4, s: [0.8, 1.6] }, { kind: 'ember', build: ember('#ffb07a'), w: 1, s: [0.8, 1.2] }]
  },
  fortress: {
    ground: ['#4a3a44', '#3e2e3a'], trail: '#6a5460', rim: '#180e16', sky: '#1c0a12', ambient: '#ffdcd8', shadow: '#c090b0', mote: '#ff5a4a',
    border: [{ kind: 'wallBlock', build: wallBlock('#3a2a34', '#52404a'), w: 5, s: [0.95, 1.15] }, { kind: 'brazier', build: brazier('#3a2a34', '#ff6a2a'), w: 2, s: [0.9, 1.2] }, { kind: 'brokenColumn', build: column('#52404a', true), w: 1, s: [0.95, 1.2] }],
    decor: [{ kind: 'bones', build: bones, w: 3, s: [0.9, 1.4] }, { kind: 'ember', build: ember('#ff5a4a'), w: 3, s: [0.8, 1.3] }, { kind: 'pebble', build: pebble('#52404a'), w: 3, s: [0.8, 1.5] }]
  },
  rift: {
    ground: ['#2e1c5a', '#24144a'], trail: '#5a3fa0', rim: '#0a0418', sky: '#06020e', ambient: '#f0dcff', shadow: '#a070ff', mote: '#f0a8ff',
    border: [{ kind: 'crystal', build: crystal('#1c1040', '#e06aff'), w: 5, s: [1.1, 1.9] }, { kind: 'spire', build: spire('#1c1040', '#30206a'), w: 3, s: [1.1, 1.8] }],
    decor: [{ kind: 'ember', build: ember('#f0a8ff'), w: 5, s: [0.8, 1.5] }, { kind: 'pebble', build: pebble('#30206a'), w: 2, s: [0.8, 1.4] }]
  },
  town: {
    ground: ['#8fc85a', '#7ab84c'], trail: '#d8c090', rim: '#4a8a3a', sky: '#9fd8ff', ambient: '#ffffff', shadow: '#d6ccff', mote: '#fff6b8',
    border: [{ kind: 'tree', build: tree('#4fa84a', '#7fd060'), w: 4, s: [1, 1.5] }, { kind: 'bush', build: bush('#58b04a', '#8fd864'), w: 3, s: [0.9, 1.4] }, { kind: 'hay', build: hay, w: 1, s: [0.8, 1] }],
    decor: [{ kind: 'tuft', build: tuft('#5fae4a'), w: 4, s: [0.8, 1.3] }, { kind: 'flower', build: flower('#ffd84a'), w: 3, s: [0.8, 1.2] }, { kind: 'flower', build: flower('#ff8ab0'), w: 3, s: [0.8, 1.2] }]
  },
  ruin: {
    ground: ['#7a7460', '#686250'], trail: '#8a8068', rim: '#2e2a26', sky: '#4a3a3a', ambient: '#f0e0d0', shadow: '#c0b0d8', mote: '#ff9a5a',
    border: [{ kind: 'deadTree', build: deadTree('#3a302a'), w: 4, s: [1, 1.5] }, { kind: 'wallBlock', build: wallBlock('#5a544a', '#706a5e'), w: 3, s: [0.9, 1.1] }, { kind: 'boulder', build: boulder('#5a544a', '#706a5e'), w: 2, s: [0.9, 1.5] }],
    decor: [{ kind: 'ember', build: ember('#ff9a5a'), w: 3, s: [0.8, 1.3] }, { kind: 'bones', build: bones, w: 2, s: [0.9, 1.3] }, { kind: 'pebble', build: pebble('#706a5e'), w: 4, s: [0.8, 1.5] }]
  },
  arena: {
    ground: ['#d8c090', '#c8b080'], trail: '#e8d4a8', rim: '#7a6444', sky: '#ffcf8a', ambient: '#fff4e0', shadow: '#d8c0e8', mote: '#fff0c0',
    border: [{ kind: 'wallBlock', build: wallBlock('#b8a078', '#d0b890'), w: 6, s: [0.98, 1.05] }, { kind: 'column', build: column('#d0b890', false), w: 2, s: [0.95, 1.1] }, { kind: 'brazier', build: brazier('#8a7458', '#ffb02a'), w: 1, s: [0.9, 1.1] }],
    decor: [{ kind: 'pebble', build: pebble('#b8a078'), w: 4, s: [0.8, 1.4] }, { kind: 'bones', build: bones, w: 1, s: [0.9, 1.2] }]
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
  /** Where the shallow tone begins (0 deep .. 1 bank): water's broad
   *  shallows; a hot liquid's thin glowing line just short of its crust (#120). */
  shallowAt: number
  /** The bank's outline traced smooth rather than cell by cell (the Crags'
   *  lava sea, the Rift's void: shores long enough that steps showed). */
  smooth: boolean
}

export const LIQUIDS: Readonly<Record<LiquidId, LiquidLook>> = {
  water: { deep: '#2a84cc', shallow: '#58bcee', glint: '#ffffff', foam: '#f6fcff', bed: '#3a6c8c', bank: '#7a6a4a', bankK: 0.42, foamAt: 0.59, wobble: 1, crust: 0, flow: 1, shallowAt: 0.2, smooth: false },
  ice: { deep: '#3a8cc4', shallow: '#93d8f6', glint: '#ffffff', foam: '#f4fbff', bed: '#5a8cb0', bank: '#ffffff', bankK: 0.75, foamAt: 0.44, wobble: 0.25, crust: 0, flow: 0.45, shallowAt: 0.2, smooth: false },
  // Lava meets the land at a rim of cooled, dark crust, a thin glowing line before it.
  lava: { deep: '#e2400c', shallow: '#ffc24a', glint: '#fff0a0', foam: '#2e1c18', bed: '#2a1410', bank: '#8a2a10', bankK: 0.4, foamAt: 0.6, wobble: 0.35, crust: 1, flow: 0.4, shallowAt: 0.52, smooth: true },
  pool: { deep: '#11545e', shallow: '#1f9090', glint: '#a8ffe6', foam: '#bafff0', bed: '#1a3038', bank: '#2f6a66', bankK: 0.45, foamAt: 0.6, wobble: 0.6, crust: 0, flow: 0.5, shallowAt: 0.2, smooth: false },
  // The void's edge: dark broken rock, a thin violet glow before it.
  void: { deep: '#3c1a92', shallow: '#c08aff', glint: '#f4d8ff', foam: '#22163c', bed: '#1a0e30', bank: '#5a3aa0', bankK: 0.35, foamAt: 0.6, wobble: 0.35, crust: 0, flow: 0.6, shallowAt: 0.53, smooth: true }
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
  plains: [{ kind: 'bush', build: bush('#58b04a', '#8fd864'), w: 4, s: [0.7, 1.15] }, { kind: 'boulder', build: boulder('#9aa4a8', '#b8c0c4'), w: 2, s: [0.6, 1] }],
  cave: [{ kind: 'boulder', build: boulder('#6a5c54', '#857468'), w: 4, s: [0.7, 1.15] }, { kind: 'mushroom', build: mushroom('#e8e2d0', '#5fffd0', true), w: 1, s: [0.6, 0.9] }],
  forest: [{ kind: 'bush', build: bush('#3f8f44', '#5fb85a'), w: 5, s: [0.7, 1.2] }, { kind: 'mushroom', build: mushroom('#e8e2d0', '#e0484a', false), w: 1, s: [0.6, 1] }, { kind: 'boulder', build: boulder('#7a8a80', '#96a69a'), w: 2, s: [0.6, 1] }],
  farm: [{ kind: 'bush', build: bush('#8ab04a', '#b0d060'), w: 4, s: [0.7, 1.15] }, { kind: 'boulder', build: boulder('#c8b89a', '#dccdb0'), w: 2, s: [0.6, 1] }],
  ash: [{ kind: 'boulder', build: boulder('#3a2e30', '#56444a'), w: 4, s: [0.7, 1.2] }, { kind: 'emberRock', build: ember('#ff8a3a'), w: 1, s: [1.4, 2.2] }],
  mine: [{ kind: 'boulder', build: boulder('#565060', '#6e6878'), w: 4, s: [0.7, 1.2] }, { kind: 'emberRock', build: ember('#5fd8ff'), w: 1, s: [1.4, 2.2] }],
  snow: [{ kind: 'boulder', build: boulder('#c8d8e8', '#f4fbff'), w: 4, s: [0.7, 1.15] }, { kind: 'bush', build: bush('#4f8a7a', '#f4fbff'), w: 2, s: [0.7, 1.1] }],
  temple: [{ kind: 'boulder', build: boulder('#7a9a94', '#b8c8b8'), w: 4, s: [0.7, 1.15] }, { kind: 'bush', build: bush('#2f9a8c', '#3fc7b0'), w: 2, s: [0.7, 1.1] }],
  void: [{ kind: 'boulder', build: boulder('#2a1c50', '#3e2c70'), w: 4, s: [0.7, 1.2] }, { kind: 'emberRock', build: ember('#d0a8ff'), w: 1, s: [1.4, 2.2] }],
  peak: [{ kind: 'boulder', build: boulder('#5a4e50', '#76686a'), w: 4, s: [0.7, 1.25] }],
  fortress: [{ kind: 'boulder', build: boulder('#3a2a34', '#52404a'), w: 4, s: [0.7, 1.2] }, { kind: 'emberRock', build: ember('#ff5a4a'), w: 1, s: [1.4, 2.2] }],
  rift: [{ kind: 'boulder', build: boulder('#1c1040', '#30206a'), w: 4, s: [0.7, 1.2] }, { kind: 'emberRock', build: ember('#f0a8ff'), w: 1, s: [1.4, 2.2] }],
  town: [{ kind: 'bush', build: bush('#58b04a', '#8fd864'), w: 4, s: [0.7, 1.15] }],
  ruin: [{ kind: 'boulder', build: boulder('#5a544a', '#706a5e'), w: 4, s: [0.7, 1.2] }],
  arena: [{ kind: 'boulder', build: boulder('#b8a078', '#d0b890'), w: 4, s: [0.7, 1.1] }]
}

/**
 * What fills a cell the scenery left bare (`layScenery`): the theme's own
 * low bush or boulder, big enough to cover a whole cell. Built once.
 */
const FILLER: Readonly<Record<ThemeId, PropShape>> = Object.fromEntries(
  (Object.keys(LOW_PROPS) as ThemeId[]).map(id => [id, { ...LOW_PROPS[id][0]!, s: [1, 1.2] as [number, number] }])
) as Record<ThemeId, PropShape>

// ── The ground's own material ────────────────────────────────────────────────
//
// The cel material's ramp and mood (it shares their uniforms, so a cave's dark
// reaches it), plus what makes the lie of the land READ from a high camera:
//   • two tones by slope: ground turned to the sun is lighter, ground turned
//     away darker, eased in over a range of slopes. (A crisp edge here drew
//     straight light/dark bands along the triangle edges of the height grid;
//     contour lines drew thin dark polygons across the grass: owner, 2026-10-04.)
// It fades out on water beds, cliff rock, the road and cave floors (`aRelief`).
/** The world light the cel ramp uses (`cel.ts`), for the slope tones. */
const SUN = new Vector3(0.4, 0.82, 0.42).normalize()

const GROUND_VERT = /* glsl */`
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
attribute float aRelief;
varying vec3 vN;
varying vec3 vViewN;
varying vec3 vW;
varying vec2 vUv2;
varying float vRelief;
#ifdef EDGE_FOG
uniform vec4 uEdgeXf;
varying vec2 vEdgeUv;
#endif
void main() {
  #include <color_vertex>
  vN = normal;
  vViewN = normalize(normalMatrix * normal);
  vUv2 = uv;
  vRelief = aRelief;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  #ifdef EDGE_FOG
  vEdgeUv = (wp.xz - uEdgeXf.xy) * uEdgeXf.zw;
  #endif
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const GROUND_FRAG = /* glsl */`
#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
uniform vec3 uLightDir;
uniform vec3 uShadowTint;
uniform vec3 uAmbient;
uniform float uLight;
uniform float uThreshold;
uniform sampler2D uMap;
uniform vec3 uSun;
varying vec3 vN;
varying vec3 vViewN;
varying vec3 vW;
varying vec2 vUv2;
varying float vRelief;
#ifdef EDGE_FOG
uniform sampler2D uEdgeTex;
uniform vec4 uEdgeK;
uniform vec3 uEdgeCol;
varying vec2 vEdgeUv;
#endif
void main() {
  vec3 base = vColor.rgb * texture2D(uMap, vUv2).rgb;
  float ndl = dot(normalize(vViewN), uLightDir) * 0.5 + 0.5;
  float lit = smoothstep(uThreshold - 0.012, uThreshold + 0.012, ndl);
  vec3 col = mix(base * uShadowTint, min(base * uLight, vec3(1.0)), lit);
  vec3 n = normalize(vN);
  float slope = length(n.xz) / max(n.y, 0.2);
  // Two tones by the way the ground faces: toward the sun, or away from it.
  float face = dot(n.xz, uSun.xz) / max(length(uSun.xz), 1e-4) / max(n.y, 0.2);
  float toSun = smoothstep(0.02, 0.3, face);
  float away = 1.0 - smoothstep(-0.3, -0.02, face);
  col *= 1.0 + vRelief * (0.12 * toSun - 0.14 * away) * smoothstep(0.0, 0.06, slope);
  col *= uAmbient;
  #ifdef EDGE_FOG
  col = mix(col, uEdgeCol, ${EDGE_FOG_K});
  #endif
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`

let groundMat: ShaderMaterial | null = null
let groundMatMap: Texture | null = null
/** The ground's material (one per detail map, shared by every zone). */
const groundMaterial = (map: Texture): ShaderMaterial => {
  if (groundMat && groundMatMap === map) return groundMat
  // The cel material's shared light and mood, by reference.
  const ref = celVCMap(map).uniforms
  const m = new ShaderMaterial({
    uniforms: UniformsUtils.merge([UniformsLib.fog, { uMap: { value: map }, uSun: { value: SUN.clone() } }]),
    vertexShader: GROUND_VERT,
    fragmentShader: GROUND_FRAG,
    vertexColors: true,
    fog: true
  })
  for (const k of ['uLightDir', 'uShadowTint', 'uAmbient', 'uLight', 'uThreshold'] as const) m.uniforms[k] = ref[k]!
  m.uniforms.uMap!.value = map
  edgeFog(m)
  groundMat = m
  groundMatMap = map
  return m
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
/**
 * Built walls (#120): a citadel's or a fortress's dressed stone, a temple's
 * crumbling ruin. Each block fills its cell's width; on the near (camera's)
 * side of a room the wall is low, so nothing in the room hides behind it.
 */
const builtWall = (a: string, b: string, tall: boolean) => () => ({
  lit: tall
    ? [P(rbox(1.5, 2.3, 1.5, 0.25, 8, 8), a, [0, 1.15, 0]), P(rbox(1.56, 0.22, 1.56, 0.3, 8, 4), b, [0, 2.38, 0]), P(rbox(0.5, 0.42, 1.0, 0.3, 6, 4), a, [-0.36, 2.68, 0]), P(rbox(0.5, 0.42, 1.0, 0.3, 6, 4), a, [0.42, 2.68, 0])]
    : [P(rbox(1.5, 0.8, 1.5, 0.25, 8, 6), a, [0, 0.4, 0]), P(rbox(1.56, 0.2, 1.56, 0.3, 8, 4), b, [0, 0.88, 0])]
})
const ruinWall = (a: string, b: string, hgt: number) => () => ({
  lit: [
    P(rbox(1.5, hgt, 1.3, 0.25, 8, 8), b, [0, hgt / 2, 0]),
    P(rbox(0.9, 0.4, 1.0, 0.3, 6, 4), a, [-0.2, hgt + 0.16, 0.05], [0, 0.1, 0.12]),
    P(rock(0.3, Math.round(hgt * 10), 7, 5), b, [0.5, 0.16, 0.48])
  ]
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
/** Cells inside the grid where the rim colour starts to ease in, and cells past it where it is full: the blend straddles the grid's edge. */
export const LAND_RIM_IN = 5
export const LAND_RIM_OUT = 10
/**
 * 0 (the open ground's colour) to 1 (the rim): by a cell's distance to walkable
 * ground inside the grid (`dIn`) and its signed distance past the grid's edge
 * in cells (`s`, negative inside), so the blend has no start line anywhere.
 */
export const landRimK = (dIn: number, s: number): number => {
  const k = Math.min(1, Math.max(0, dIn / 3, (s + LAND_RIM_IN) / (LAND_RIM_IN + LAND_RIM_OUT)))
  return k * k * (3 - 2 * k)
}
/** Signed distance (cells) of a vertex at cell coordinates (x, z) past the grid's edge: negative inside. */
/** Cells of the walkable region's surround the detailed ground covers (past it the rim colour is full: the sheet beyond starts under the haze). */
export const GROUND_NEAR = 9
export const gridEdgeDist = (x: number, z: number, w: number, h: number): number => {
  const ox = Math.max(-x, x - w, 0)
  const oz = Math.max(-z, z - h, 0)
  if (ox > 0 || oz > 0) return Math.hypot(ox, oz)
  return -Math.min(x, z, w - x, h - z)
}

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
export type Place = [number, number, number, number, number?]

/** The flat, upward faces of a shape (a plinth's top, a slab): their heights,
 *  and how far from its foot they reach. */
const flatsOf = (shape: PropShape): { ys: number[]; r: number } => {
  const ys = new Set<number>()
  let r = 0
  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  for (const g of shape.build().lit) {
    const pos = g.attributes.position!
    const index = g.index
    const n = index ? index.count : pos.count
    for (let t = 0; t + 2 < n; t += 3) {
      const ia = index ? index.getX(t) : t
      const ib = index ? index.getX(t + 1) : t + 1
      const ic = index ? index.getX(t + 2) : t + 2
      a.fromBufferAttribute(pos, ia)
      b.fromBufferAttribute(pos, ib)
      c.fromBufferAttribute(pos, ic)
      _nrm.subVectors(b, a).cross(_p.subVectors(c, a))
      const l = _nrm.length()
      if (l < 1e-9 || _nrm.y / l < 0.97) continue
      ys.add(Math.round(((a.y + b.y + c.y) / 3) * 1000) / 1000)
      r = Math.max(r, Math.hypot(a.x, a.z), Math.hypot(b.x, b.z), Math.hypot(c.x, c.z))
    }
  }
  return { ys: [...ys], r }
}

/** Two flat faces this near in height, overlapping, would fight for the same pixels. */
const FLAT_GAP = 0.015

/**
 * No two pieces of scenery that overlap may hold a flat face at the same
 * height (a column's plinth beside another's, both at 0.55 m: they tear in a
 * shimmer). Where a pair comes within FLAT_GAP, the later one is lifted
 * clear of it, a centimetre or two nobody sees (house rule: never z-fighting).
 */
const separateFlats = (groups: Array<[PropShape, Place[]]>): void => {
  type Item = { x: number; z: number; r: number; hs: number[] }
  const grid = new Map<string, Item[]>()
  const key = (x: number, z: number): string => `${Math.floor(x / 2)},${Math.floor(z / 2)}`
  for (const [shape, places] of groups) {
    if (!places.length) continue
    const f = flatsOf(shape)
    if (!f.ys.length) continue
    for (const p of places) {
      const sc = p[3]
      const r = f.r * sc
      let y = p[4] ?? groundAt(p[0], p[1])
      const near: Item[] = []
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) near.push(...(grid.get(key(p[0] + dx * 2, p[1] + dz * 2)) ?? []))
      for (let tries = 0; tries < 6; tries++) {
        let clash = false
        for (const q of near) {
          if (Math.hypot(q.x - p[0], q.z - p[1]) >= q.r + r) continue
          for (const fy of f.ys) for (const h of q.hs) if (Math.abs(y + fy * sc - h) < FLAT_GAP) clash = true
        }
        if (!clash) break
        y += FLAT_GAP * 1.2
      }
      if (y !== (p[4] ?? groundAt(p[0], p[1]))) p[4] = y
      const it: Item = { x: p[0], z: p[1], r, hs: f.ys.map(fy => y + fy * sc) }
      const k = key(p[0], p[1])
      const list = grid.get(k)
      if (list) list.push(it)
      else grid.set(k, [it])
    }
  }
}

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
      const mesh = markStill(new InstancedMesh(geo, lit ? celVCInst() : glowVCInst(), list.length))
      mesh.name = shape.kind
      const line = lit && outline ? markStill(new InstancedMesh(geo, outlineMat(undefined, undefined, true), list.length)) : null
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

const memo = <T>(fn: (id: ThemeId) => T): ((id: ThemeId) => T) => {
  const m = new Map<ThemeId, T>()
  return (id) => {
    let v = m.get(id)
    if (v === undefined) { v = fn(id); m.set(id, v) }
    return v
  }
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


/** The cells a building stands on (1), exactly its footprint: the ground is not drawn there. */
export const builtCells = (plan: Pick<ZonePlan, 'w' | 'h' | 'buildings'>): Uint8Array => {
  const out = new Uint8Array(plan.w * plan.h)
  for (const b of plan.buildings) {
    const i0 = Math.round((b.x - b.w / 2) / CELL)
    const i1 = Math.round((b.x + b.w / 2) / CELL) - 1
    const j0 = Math.round((b.z - b.d / 2) / CELL)
    const j1 = Math.round((b.z + b.d / 2) / CELL) - 1
    for (let j = Math.max(0, j0); j <= Math.min(plan.h - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(plan.w - 1, i1); i++) out[j * plan.w + i] = 1
  }
  return out
}

/**
 * Build a zone's scenery from its plan. Time-sliced (`slice`) so the loader
 * keeps painting while a large zone is assembled.
 */
/**
 * A side pocket is a small place: tall scenery on its near (down-screen) side
 * would hide all of it from a camera that cannot look round a tree. The solid
 * cells up to three rows in front of one carry low props only (the value: how
 * many rows in front, 1..3; 0 = free to grow tall). Every chest is such a place
 * too, wherever it stands (roadmap #79: a chest by a clearing's near wall sat
 * behind three-metre stalagmites, unseen).
 */
export const lowRingOf = (plan: ZonePlan): { ring: Uint8Array; any: boolean } => {
  const { w, h, solid } = plan
  const ring = new Uint8Array(w * h)
  let any = false
  const hem = (i: number, j: number): void => {
    any = true
    for (let dj = 1; dj <= 3; dj++) for (let di = -1; di <= 1; di++) {
      if (j + dj >= h || i + di < 0 || i + di >= w) continue
      const k = (j + dj) * w + i + di
      // The row count in front of the pocket: the first row is its edge.
      if (solid[k] && (!ring[k] || ring[k]! > dj)) ring[k] = dj
    }
  }
  for (let j = 2; j < h - 3; j++) {
    for (let i = 2; i < w - 2; i++) if (plan.side[j * w + i]) hem(i, j)
  }
  for (const c of plan.chests) hem(Math.floor(c.x / CELL), Math.floor(c.z / CELL))
  return { ring, any }
}

/** Distance from each cell to the nearest walkable one (0 = walkable), in
 *  rings, up to 11 (it once stopped at 4 and jumped to 9: a step a player saw). */
export const nearWalk = (plan: Pick<ZonePlan, 'w' | 'h' | 'solid'>): Uint8Array => {
  const { w, h, solid } = plan
  const near = new Uint8Array(w * h).fill(12)
  for (let k = 0; k < w * h; k++) if (!solid[k]) near[k] = 0
  for (let pass = 1; pass <= 11; pass++) {
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
  return near
}

/** Solid cells within two of a cave's floor carry cave rock, not the zone's own. */
export const caveRingOf = (plan: ZonePlan): Uint8Array => {
  const { w, h, solid } = plan
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
  return caveRing
}

/** The cells round a building (its footprint and one more): no scenery grows there. */
const footprintOf = (plan: ZonePlan): Set<number> => {
  const w = plan.w
  const footprint = new Set<number>()
  for (const b of plan.buildings) {
    const i0 = Math.floor((b.x - b.w / 2) / CELL)
    const i1 = Math.floor((b.x + b.w / 2) / CELL)
    const j0 = Math.floor((b.z - b.d / 2) / CELL)
    const j1 = Math.floor((b.z + b.d / 2) / CELL)
    for (let j = j0 - 1; j <= j1 + 1; j++) for (let i = i0 - 1; i <= i1 + 1; i++) footprint.add(j * w + i)
  }
  return footprint
}

/** One kind of scenery and where each of it stands. `slice`: yield after building it. */
export interface SceneryGroup { shape: PropShape; places: Place[]; outline: boolean; slice?: boolean }

/** The scenery shapes that are the theme's own and not a palette swap: built once per theme. */
const caveShapesOf = memo((themeId: ThemeId): PropShape[] => [
  { kind: 'caveWall', build: caveWall('#4a4458', '#5e586e', '#3c3848'), w: 1, s: [0.95, 1.25] },
  { kind: 'caveBoulder', build: boulder('#4a4458', '#5e586e'), w: 1, s: [0.85, 1.25] },
  { kind: 'caveGlow', build: caveGlow('#3c3848', THEMES[themeId].mote), w: 1, s: [0.8, 1.2] }
])
const wallShapesOf = memo((themeId: ThemeId): PropShape[] => {
  const stone = CLIFF[themeId]
  return [
    { kind: 'builtWall', build: builtWall(stone.a, stone.b, true), w: 1, s: [1, 1] },
    { kind: 'lowWall', build: builtWall(stone.a, stone.b, false), w: 1, s: [1, 1] },
    { kind: 'ruinWall', build: ruinWall(stone.a, stone.b, 2.2), w: 1, s: [1, 1] },
    { kind: 'ruinWall', build: ruinWall(stone.a, stone.b, 1.4), w: 1, s: [1, 1] },
    { kind: 'ruinWall', build: ruinWall(stone.a, stone.b, 0.6), w: 1, s: [1, 1] }
  ]
})

/** A shape's footprint from above (`footprint.ts`), built once. */
const feet = new WeakMap<PropShape, Foot>()
export const shapeFoot = (shape: PropShape): Foot => {
  let f = feet.get(shape)
  if (!f) {
    const b = shape.build()
    f = footOf([...b.lit, ...(b.glow ?? [])])
    for (const g of [...b.lit, ...(b.glow ?? [])]) g.dispose()
    feet.set(shape, f)
  }
  return f
}

/** What a shape covers of the ground up to a body's height (`footPoints`), built once. */
const bodies = new WeakMap<PropShape, Float32Array>()
export const bodyPoints = (shape: PropShape): Float32Array => {
  let pts = bodies.get(shape)
  if (!pts) {
    const b = shape.build()
    const parts = [...b.lit, ...(b.glow ?? [])]
    // In the shape's own units: at its smallest scale more of it reaches below a body's height.
    pts = footPoints(footOf(parts, BODY_H / Math.min(1, shape.s[0]), GROUND_H / Math.max(1, shape.s[1])))
    for (const g of parts) g.dispose()
    bodies.set(shape, pts)
  }
  return pts
}

/** How far a solid prop is let reach past its colliders when placed: under `SOLID_TOL`, with room for sampling. */
const FIT = SOLID_TOL - 0.06

/**
 * Keep a solid prop on its colliders (`propRoles.ts`): where what it covers
 * up to a body's height reaches past the blocked cells into walkable ground
 * (a big rock jittered toward the path, a side boulder turned out), it is
 * drawn toward its cell's middle, made smaller and turned until it fits.
 * Mutates the place; false when it fits no way (then it is left out, and the
 * cover pass fills its cell).
 */
export const fitPlace = (g: Grid, shape: PropShape, p: Place, i: number, j: number, minSc = shape.s[0] * 0.6): boolean => {
  const pts = bodyPoints(shape)
  if (spillOf(g, pts, p[0], p[1], p[2], p[3], FIT) <= FIT) return true
  const cx = (i + 0.5) * CELL
  const cz = (j + 0.5) * CELL
  for (const t of [0.5, 1]) {
    const x = p[0] + (cx - p[0]) * t
    const z = p[1] + (cz - p[1]) * t
    for (let sc = p[3]; sc >= minSc - 1e-6; sc -= 0.08) {
      for (let q = 0; q < 4; q++) {
        const rot = p[2] + (q * Math.PI) / 2
        if (spillOf(g, pts, x, z, rot, sc, FIT) > FIT) continue
        p[0] = x; p[1] = z; p[2] = rot; p[3] = sc
        return true
      }
    }
  }
  return false
}

/**
 * Where the scenery of a zone's solid cells stands. Every solid cell the hero
 * can touch (one that faces walkable ground) carries something drawn over the
 * whole of it, within `COVER_TOL`: a cell the thinning or a small prop left
 * bare gets a filler (the theme's own low bush or boulder) at its middle.
 * A blocked cell with nothing on it is an invisible wall (playtest, the
 * Whisperwood: the hem of low props in front of a chest skipped a cell in
 * five, and its ember or mushroom covered a third of one).
 */
export const layScenery = (
  plan: ZonePlan, themeId: ThemeId, rng: () => number, low: boolean,
  near = nearWalk(plan), caveRing = caveRingOf(plan), lowRing = lowRingOf(plan).ring
): SceneryGroup[] => {
  const theme = THEMES[themeId]
  const { w, h, solid } = plan
  // The walk grid with every door open: what stops a body once the visit is under way.
  const walk = fillGrid(createGrid(w, h), plan, true)
  let anyWet = false
  for (let j = 0; j < h && !anyWet; j++) for (let i = 0; i < w; i++) if (wetCell(plan, i, j)) { anyWet = true; break }
  const footprint = footprintOf(plan)
  const anySide = lowRing.some(v => v > 0)
  const borderPlaces: Place[][] = theme.border.map(() => [])
  // Past the two rings that face the player, the same scenery carries on,
  // thinner and without outlines: woods behind the trees, rock behind the
  // rocks, out to `WILDS` cells beyond the grid.
  const wildPlaces: Place[][] = theme.border.map(() => [])
  const wildDensity = low ? 0.12 : 0.3
  // Round a cave: tall rock on the far (up-screen) side, low rock on the near
  // side, and a glowing cluster now and then. The camera has no way to look
  // through a wall, so nothing tall ever stands between it and the cave floor.
  const caveShapes = caveShapesOf(themeId)
  const cavePlaces: Place[][] = caveShapes.map(() => [])
  // In front of a side pocket: the theme's own low shapes (a bush, a boulder,
  // a mushroom), or a plain rock in its colours where it has none.
  const lowShapes: PropShape[] = anySide ? LOW_PROPS[themeId] : []
  const lowPlaces: Place[][] = lowShapes.map(() => [])
  // Built walls round a layout's rooms (#120): dressed (tall, low) or a ruin (tall, broken, low).
  const wallShapes = wallShapesOf(themeId)
  const wallPlaces: Place[][] = wallShapes.map(() => [])
  const townExits = plan.town?.exits
  for (let j = -WILDS; j < h + WILDS; j++) {
    for (let i = -WILDS; i < w + WILDS; i++) {
      const inside = i >= 0 && j >= 0 && i < w && j < h
      const k = j * w + i
      // The way out of a town (#131) is open ground out to the horizon: no tree in front of it.
      if (townExits && townExitClear(townExits, i, j)) continue
      const d = inside ? near[k]! : 9
      if (d === 0 || (inside && footprint.has(k))) continue
      // A river runs on past the grid; a level prop has its cell to itself.
      if (anyWet && wetCell(plan, i, j)) continue
      if (inside && plan.kind[k] === K_BLOCK) continue
      if (inside && caveRing[k]) {
        if (d === 2 && rng() < 0.4) continue
        // Far side: a cave cell lies just down-screen of this one (never in
        // front of a pocket or a chest: that rock stays low).
        let far = false
        if (!lowRing[k]) for (let dj = 1; dj <= 2 && !far; dj++) for (let di = -1; di <= 1; di++) if (plan.cave[(j + dj) * w + i + di]) { far = true; break }
        const shape = far ? (rng() < 0.82 ? 0 : 2) : rng() < 0.8 ? 1 : 2
        const s = caveShapes[shape]!
        const p: Place = [(i + 0.5 + (rng() - 0.5) * 0.4) * CELL, (j + 0.5 + (rng() - 0.5) * 0.4) * CELL, rng() * Math.PI * 2, s.s[0] + rng() * (s.s[1] - s.s[0])]
        if (fitPlace(walk, s, p, i, j)) cavePlaces[shape]!.push(p)
        continue
      }
      if (inside && plan.masonry?.[k] && d <= 2) {
        // A built wall: square to the grid, one block a cell. On a room's near
        // side (open ground just up-screen of it) it stays low.
        let near = false
        for (let dj = 1; dj <= 2 && !near; dj++) for (let di = -1; di <= 1; di++) if (j - dj >= 0 && !solid[(j - dj) * w + i + di]) { near = true; break }
        const ruin = plan.masonry[k] === 2
        const shape = ruin ? (near ? 4 : rng() < 0.55 ? 2 : 3) : near ? 1 : 0
        wallPlaces[shape]!.push([(i + 0.5) * CELL, (j + 0.5) * CELL, ruin ? (rng() - 0.5) * 0.12 : 0, 1])
        continue
      }
      if (inside && lowRing[k]) {
        // Thick along the pocket's edge, thinning away from it: a hem, not a
        // field. A cell that faces walkable ground is never left out (the hero
        // can touch it); the thinning is for the rows behind.
        if (d > 1 && rng() > (lowRing[k] === 1 ? 0.8 : lowRing[k] === 2 ? 0.42 : 0.2)) continue
        const shape = pickShape(lowShapes, rng())
        const s = lowShapes[shape]!
        const p: Place = [(i + 0.5 + (rng() - 0.5) * 0.5) * CELL, (j + 0.5 + (rng() - 0.5) * 0.5) * CELL, rng() * Math.PI * 2, s.s[0] + rng() * (s.s[1] - s.s[0])]
        if (fitPlace(walk, s, p, i, j)) lowPlaces[shape]!.push(p)
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
      const p: Place = [
        (i + 0.5 + (rng() - 0.5) * jitter) * CELL, (j + 0.5 + (rng() - 0.5) * jitter) * CELL, rng() * Math.PI * 2,
        (s.s[0] + rng() * (s.s[1] - s.s[0])) * (facing ? 1 : 1.12)
      ]
      // Off the facing rings a prop stands two cells and more from open ground (`fitPlace` all the same, cheap there).
      if (fitPlace(walk, s, p, i, j)) (facing ? borderPlaces : wildPlaces)[shape]!.push(p)
    }
  }
  const groups: SceneryGroup[] = [
    ...theme.border.flatMap((s, n): SceneryGroup[] => [{ shape: s, places: borderPlaces[n]!, outline: true }, { shape: s, places: wildPlaces[n]!, outline: false, slice: true }]),
    ...caveShapes.map((s, n): SceneryGroup => ({ shape: s, places: cavePlaces[n]!, outline: true })),
    ...lowShapes.map((s, n): SceneryGroup => ({ shape: s, places: lowPlaces[n]!, outline: true })),
    ...wallShapes.map((s, n): SceneryGroup => ({ shape: s, places: wallPlaces[n]!, outline: true }))
  ]

  // ── The cover pass: no cell the hero can touch is left bare ──
  const index = new FootIndex()
  for (const g of groups) {
    const f = shapeFoot(g.shape)
    for (const p of g.places) index.add({ foot: f, x: p[0], z: p[1], rot: p[2], sc: p[3] })
  }
  const filler = FILLER[themeId]
  const fillFoot = shapeFoot(filler)
  const fills: Place[] = []
  // On a stream of its own: the scenery above lies exactly as it always did.
  const frng = mulberry32((plan.seed ^ 0x6c0f3) >>> 0)
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = j * w + i
      if (!solid[k] || near[k] !== 1 || footprint.has(k) || plan.kind[k] === K_BLOCK) continue
      if (townExits && townExitClear(townExits, i, j)) continue
      if (anyWet && wetCell(plan, i, j)) continue
      const pts = cellSamples(i, j, CELL)
      if (pts.every(([x, z]) => index.covered(x, z))) continue
      // At the cell's middle, as large as it takes to cover the whole cell alone.
      const x = (i + 0.5) * CELL
      const z = (j + 0.5) * CELL
      const rot = frng() * Math.PI * 2
      const covers = (r: number, sc: number): boolean => pts.every(([px, pz]) => footedDist({ foot: fillFoot, x, z, rot: r, sc }, px, pz) <= COVER_TOL)
      // As small as covers the cell, turned so it keeps on the colliders.
      let p: Place | null = null
      for (let sc = filler.s[0]; sc < filler.s[1] * 1.6 && !p; sc += 0.05) {
        for (let q = 0; q < 4 && !p; q++) {
          const r = rot + (q * Math.PI) / 2
          if (covers(r, sc) && spillOf(walk, bodyPoints(filler), x, z, r, sc, FIT) <= FIT) p = [x, z, r, sc]
        }
      }
      if (!p) {
        let sc = filler.s[0]
        while (sc < filler.s[1] * 1.6 && !covers(rot, sc)) sc += 0.05
        p = [x, z, rot, sc]
      }
      fills.push(p)
      index.add({ foot: fillFoot, x: p[0], z: p[1], rot: p[2], sc: p[3] })
    }
  }
  if (fills.length) groups.push({ shape: filler, places: fills, outline: true })
  return groups
}

/**
 * What the ground carries besides the scenery of its solid cells: stones
 * along a ledge's brow (or a coping), the ramp's treads or kerbs, the decor
 * scattered through the clearings, a field's wheat and the relief's tells.
 * `rng` carries on the stream `layScenery` drew from. Pure placement.
 */
export const layGround = (plan: ZonePlan, themeId: ThemeId, rng: () => number, low: boolean): SceneryGroup[] => {
  const theme = THEMES[themeId]
  const { w, h, solid, trail } = plan
  const out: SceneryGroup[] = []
  const footprint = footprintOf(plan)
  const townExits = plan.town?.exits
  const rockLook = CLIFF[themeId]
  const cliffMask = new Uint8Array(w * h)
  const rampMask = new Uint8Array(w * h)
  let anyCliff = false
  for (let k = 0; k < w * h; k++) {
    if (plan.kind[k] === K_CLIFF) { cliffMask[k] = 1; anyCliff = true }
    if (plan.kind[k] === K_RAMP) { rampMask[k] = 1; anyCliff = true }
  }
  // ── Ledges: a crag (or a wall of cut blocks) along each cliff edge, and the ramp's steps or kerbs ──
  if (anyCliff) {
    const wall: Place[] = []
    const steps: Place[] = []
    const kerbs: Place[] = []
    const look = rockLook
    const wallShape: PropShape = look.dressed ? { kind: 'coping', build: coping(look.a, look.b), w: 1, s: [1, 1] } : { kind: 'browStone', build: browStone(look.a, look.b), w: 1, s: [1, 1] }
    const kerbShape: PropShape = { kind: 'kerb', build: kerb(look.a, look.b), w: 1, s: [1, 1] }
    // Every stone keeps on the cliff's own cells (`fitPlace`): the ground at its foot and on its brow is walked.
    const walk = fillGrid(createGrid(w, h), plan, true)
    const stone = (to: Place[], shape: PropShape, p: Place, i: number, j: number): void => { if (fitPlace(walk, shape, p, i, j)) to.push(p) }
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
            // (Not beside a ramp: the ramp's top tread is the edge there, and the
            // two stones would lie through each other.)
            let byRamp = false
            for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (rampMask[k + dj * w + di]) byRamp = true
            if (!byRamp) stone(wall, wallShape, [bx, bz, yaw, 1, hi + 0.01], i, j)
          } else {
            // Stones along the brow, and now and then a boulder fallen to the foot.
            stone(wall, wallShape, [bx + uz * 0.35, bz - ux * 0.35, rng() * 6, 0.75 + rng() * 0.3, hi - 0.06], i, j)
            stone(wall, wallShape, [bx - uz * 0.35, bz + ux * 0.35, rng() * 6, 0.6 + rng() * 0.3, hi - 0.06], i, j)
            // Fallen against the cliff's foot, on its own cell (it once lay half on the ground below).
            if (rng() < 0.3) stone(kerbs, kerbShape, [cx0 - ux * 0.3, cz0 - uz * 0.3, rng() * 6, 1 + rng() * 0.3, lo], i, j)
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
            // Stones along the sides where the ramp meets the cliff: on the
            // cliff's side of the seam, so the way up stays the ramp's width.
            for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
              if (!cliffMask[(j + dj) * w + i + di]) continue
              const px = cx0 + di * 1.0
              const pz = cz0 + dj * 1.0
              stone(kerbs, kerbShape, [px, pz, rng() * 6, 0.8 + rng() * 0.4, groundAt(px, pz)], i + di, j + dj)
            }
          }
        }
      }
    }
    out.push({ shape: wallShape, places: wall, outline: true })
    if (steps.length) out.push({ shape: { kind: 'tread', build: tread(look.a, look.b), w: 1, s: [1, 1] }, places: steps, outline: true })
    if (kerbs.length) out.push({ shape: kerbShape, places: kerbs, outline: true })
  }

  // ── Decor scattered through the clearings (never on the trail) ──
  const decorPlaces: Array<Array<[number, number, number, number]>> = theme.decor.map(() => [])
  const density = low ? 0.05 : 0.11
  const caveDecor: PropShape[] = [{ kind: 'pebble', build: pebble('#5e586e'), w: 3, s: [0.8, 1.6] }, { kind: 'shroom', build: shroom(theme.mote), w: 2, s: [0.8, 1.4] }]
  const caveDecorPlaces: Array<Array<[number, number, number, number]>> = caveDecor.map(() => [])
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = j * w + i
      if (solid[k] || trail[k] || footprint.has(k) || rng() > density) continue
      if (townExits && townExitClear(townExits, i, j)) continue
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
  for (let n = 0; n < theme.decor.length; n++) out.push({ shape: theme.decor[n]!, places: decorPlaces[n]!, outline: false })

  // ── A field's standing wheat (#103): clumps over every crop cell ──
  if (plan.crop) {
    const wrng = mulberry32((plan.seed ^ 0x3a7e) >>> 0)
    const per = low ? 2 : 4
    const wheat: Place[] = []
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const k = j * w + i
        if (!plan.crop[k] || footprint.has(k)) continue
        for (let q = 0; q < per; q++) wheat.push([(i + wrng()) * CELL, (j + wrng()) * CELL, wrng() * Math.PI, 0.85 + wrng() * 0.35])
      }
    }
    out.push({ shape: { kind: 'wheat', build: wheatClump, w: 1, s: [1, 1] }, places: wheat, outline: false })
  }
  for (let n = 0; n < caveDecor.length; n++) out.push({ shape: caveDecor[n]!, places: caveDecorPlaces[n]!, outline: false })

  // ── The relief's tells: a stone or two on a crest, dark tufts in a hollow ──
  {
    const trng = mulberry32((plan.seed ^ 0x7e11) >>> 0)
    const crest: Place[] = []
    const hollow: Place[] = []
    for (let j = 1; j < h - 1; j++) {
      for (let i = 1; i < w - 1; i++) {
        const k = j * w + i
        if (solid[k] || trail[k] || footprint.has(k) || plan.kind[k] !== K_GROUND || plan.cave[k]) continue
        if (townExits && townExitClear(townExits, i, j)) continue
        const x = (i + 0.5) * CELL
        const z = (j + 0.5) * CELL
        const gy = groundAt(x, z)
        const lap = groundAt(x + 1.5, z) + groundAt(x - 1.5, z) + groundAt(x, z + 1.5) + groundAt(x, z - 1.5) - 4 * gy
        const r = trng()
        if (lap < -0.12 && r < (low ? 0.1 : 0.2)) {
          const px = x + (trng() - 0.5) * CELL * 0.7
          const pz = z + (trng() - 0.5) * CELL * 0.7
          // A stone the size of a pebble: walked over, so never more than ankle high.
          crest.push([px, pz, trng() * 6, 0.16 + trng() * 0.14, groundAt(px, pz) - 0.03])
        } else if (lap > 0.1 && r < (low ? 0.25 : 0.5)) {
          for (let q = 0; q < 2; q++) {
            const px = x + (trng() - 0.5) * CELL
            const pz = z + (trng() - 0.5) * CELL
            hollow.push([px, pz, trng() * 6, 1 + trng() * 0.5, groundAt(px, pz)])
          }
        }
      }
    }
    const tuftHex = '#' + new Color(theme.ground[1]).lerp(new Color(theme.rim), 0.5).getHexString()
    out.push({ shape: { kind: 'crestStone', build: boulder(rockLook.a, rockLook.b), w: 1, s: [1, 1] }, places: crest, outline: true })
    out.push({ shape: { kind: 'tuft', build: tuft(tuftHex), w: 1, s: [1, 1] }, places: hollow, outline: false })
  }
  return out
}

/** Everything `buildTerrain` instances, placed exactly as it places it (the
 *  same seeded stream): for the tests that hold it against the colliders. */
export const layTerrainProps = (plan: ZonePlan, themeId: ThemeId, low = false): SceneryGroup[] => {
  const rng = mulberry32(plan.seed ^ 0x51ab)
  const scenery = layScenery(plan, themeId, rng, low)
  return [...scenery, ...layGround(plan, themeId, rng, low)]
}

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
  const { ring: lowRing, any: anySide } = lowRingOf(plan)
  const caveRing = caveRingOf(plan)

  setCelMood({ ambient: theme.ambient, shadowTint: theme.shadow })
  scene.background = new Color(theme.sky)

  const near = nearWalk(plan)
  await slice()

  // The haze past the walkable edge (roadmap #83): one soft field every
  // surface out there reads, so ground, scenery and outlines sink together.
  const field = edgeField((i, j) => !solid[j * w + i], w, h, LAND)
  const fogTex = edgeTexture(field)
  setEdgeFog(fogTex, field.x0, field.z0, field.nx * field.step, field.nz * field.step, EDGE_MAX, EDGE_FROM, EDGE_TO, EDGE_STRENGTH, edgeColour(theme.rim))
  await slice()

  // ── Ground: two vertices per cell edge, so the mottling has room to blend ──
  const SUB = 2
  const gw = w * SUB + 1
  const gh = h * SUB + 1
  const pos: number[] = []
  const col: number[] = []
  const uv: number[] = []
  const relief: number[] = []
  const nor: number[] = []
  const idx: number[] = []
  // The ground reaches past the grid by the blend's width (`LAND_RIM_OUT`), so every exit looks out over ONE mesh.
  const E = LAND_RIM_OUT
  const gwE = (w + 2 * E) * SUB + 1
  const ghE = (h + 2 * E) * SUB + 1
  const vmap = new Int32Array(gwE * ghE).fill(-1)
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
  // The relief's tones: sunlit, shaded, and the light top of a crest.
  const cSun = new Color(theme.ground[0]).lerp(new Color('#fff6c8'), 0.42)
  const cShade = new Color(theme.ground[1]).lerp(new Color(theme.rim), 0.55).lerp(new Color(theme.shadow), 0.12)
  const cCrest = new Color(theme.ground[0]).lerp(new Color('#ffffff'), 0.22)
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
    // For the rim falloff: the distance averaged over the cells touching this
    // vertex, so the fade has no steps (one cell's value drew hard bands).
    let t = 0
    let n = 0
    for (let dj = -1; dj <= 0; dj++) {
      for (let di = -1; di <= 0; di++) {
        const i = Math.min(w - 1, Math.max(0, Math.floor((gi + di) / SUB)))
        const j = Math.min(h - 1, Math.max(0, Math.floor((gj + dj) / SUB)))
        t += near[j * w + i]!
        n++
      }
    }
    return t / n
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
    const key = (gj + E * SUB) * gwE + gi + E * SUB
    if (vmap[key]! >= 0) return vmap[key]!
    const x = (gi / SUB) * CELL
    const z = (gj / SUB) * CELL
    // Past the grid, the walkable cells' own edge values carry on (clamped); a place's water, cliffs and caves do not.
    const inV = gi >= 0 && gj >= 0 && gi < gw && gj < gh
    const qi = Math.min(gw - 1, Math.max(0, gi))
    const qj = Math.min(gh - 1, Math.max(0, gj))
    const sEdge = gridEdgeDist(gi / SUB, gj / SUB, w, h)
    const d = cellNear(qi, qj)
    const plain = !inV || d > 3
    const n = noise(x * 0.22, z * 0.22, plan.seed) * 0.65 + noise(x * 0.7, z * 0.7, plan.seed + 7) * 0.35
    c.copy(cA).lerp(cB, n)
    const t = trailAt(qi, qj) * (sEdge > 0 ? Math.max(0, 1 - sEdge / 2) : 1)
    if (t > 0) c.lerp(cT, Math.min(0.85, t * (0.7 + 0.3 * n)))
    // The road is worn into the ground (`sim/relief.ts` lowers it): its edges
    // are a darker rut.
    if (t > 0.12 && t < 0.62) c.multiplyScalar(0.88)
    // Inside a cave the ground is the cave's own, whatever grows outside.
    const cv = plan.caves.length && !plain ? shareAt(plan.cave, gi, gj) : 0
    if (cv > 0) c.lerp(c2.copy(cCaveA).lerp(cCaveB, n), cv)
    // The rim: by the distance to walkable ground, and eased in from a few cells
    // inside the grid's edge (see `landRimK`), one blend the land beyond shares.
    const kRim = landRimK(d, sEdge)
    if (kRim > 0) {
      const ci = Math.min(w - 1, Math.floor(qi / SUB))
      const cj = Math.min(h - 1, Math.floor(qj / SUB))
      c.lerp(caveRing[cj * w + ci] ? cCaveR : cR, kRim)
    }
    // A cliff is banded stone; a ramp is worn like a trail.
    if ((anyCliff && !plain)) {
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
    // Cel relief, in two tones rather than a gradient: a slope turned to the
    // sun takes the light tone, one turned away the shade tone; a crest is
    // lighter grass and a hollow lies in its own shade.
    const lap = groundAt(x + 1.5, z) + groundAt(x - 1.5, z) + groundAt(x, z + 1.5) + groundAt(x, z - 1.5) - 4 * gy
    if (lap < -0.05) c.lerp(cCrest, lap < -0.14 ? 0.5 : 0.3)
    else if (lap > 0.05) c.lerp(cShade, lap > 0.14 ? 0.48 : 0.28)
    // Where the ground shader may draw its relief tones and contours (open
    // ground: not water, a cliff's rock, the worn road or a cave's floor).
    let open = 1
    if ((anyWet && !plain)) open -= shareAt(wet, gi, gj) * 2
    if ((anyCliff && !plain)) open -= shareAt(cliffMask, gi, gj) * 2
    if (t > 0) open -= t * 0.7
    if (cv > 0) open -= cv
    relief.push(Math.max(0, Math.min(1, open)))
    _nrm.set(-gx, 1, -gz).normalize()
    // Higher ground a touch lighter, lower a touch darker: a terrace reads as a level.
    c.multiplyScalar(1 + Math.max(-0.12, Math.min(0.12, (gy - meanH) * 0.06)))
    // At a cliff's foot the ground lies in its shadow.
    if ((anyCliff && !plain)) {
      const cl = shareAt(cliffMask, gi, gj)
      if (cl > 0 && cl < 1) {
        const ci = Math.min(w - 1, Math.floor(qi / SUB))
        const cj = Math.min(h - 1, Math.floor(qj / SUB))
        const near0 = groundAt((ci + 0.5) * CELL, (cj + 0.5) * CELL)
        if (gy <= near0 + 0.05) c.multiplyScalar(0.8)
      }
    }
    // Inside a cliff cell the face is steep, not a ramp: its own vertices are
    // drawn toward its foot or its brow, and it is dark stone with a light brow.
    if ((anyCliff && !plain) && shareAt(cliffMask, gi, gj) >= 1) {
      const ci = Math.min(w - 1, Math.floor(qi / SUB))
      const cj = Math.min(h - 1, Math.floor(qj / SUB))
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
    if ((anyWet && !plain)) {
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
  // No ground under a building: its own pad (`gfx/houses.ts`) is the floor
  // there, so the street can never show through a room or a forge.
  const built = builtCells(plan)
  /** Cells the detailed ground spans (built ones aside): the walkable region's surround and a ring past the grid. */
  const inGround = (i: number, j: number): boolean =>
    i >= 0 && j >= 0 && i < w && j < h ? near[j * w + i]! <= GROUND_NEAR : i >= -E && j >= -E && i < w + E && j < h + E
  for (let j = -E; j < h + E; j++) {
    for (let i = -E; i < w + E; i++) {
      if (inGround(i, j) && (i < 0 || j < 0 || i >= w || j >= h || !built[j * w + i])) {} else continue
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
  ground.setAttribute('aRelief', new Float32BufferAttribute(relief, 1))
  ground.setIndex(idx)
  owned.push(ground)
  // In tiles, each culled by its box: a zone-wide mesh is drawn whole however
  // little of it is on screen.
  for (const g of splitByTile(ground, TILE * 2)) {
    if (g !== ground) owned.push(g)
    const groundMesh = markStill(new Mesh(g, groundMaterial(groundDetail())))
    groundMesh.renderOrder = -2
    root.add(groundMesh)
  }
  await slice()

  // ── The land beyond: the world does not stop where the walking does ──
  // The camera never sees the horizon (it looks down at 52°), so "no edge"
  // means ground under every pixel it can reach: a coarse sheet under the
  // whole grid and `LAND` cells past it, in the rim colour where it meets the
  // detailed ground and drifting darker with distance.
  {
    const fw = w + LAND * 2 + 1
    const fh = h + LAND * 2 + 1
    // Under the detailed ground the sheet is never seen, yet drawn first it
    // was shaded under every pixel of it: a whole screen of fragments twice.
    // Those quads are left out; the sheet starts exactly where the ground ends,
    // at the same height along the shared edge (no overlap, so nothing to fight).
    const inner = inGround
    const covered = (ci: number, cj: number): boolean => inner(ci, cj) && !(ci >= 0 && cj >= 0 && ci < w && cj < h && built[cj * w + ci])
    const fpos = new Float32Array(fw * fh * 3)
    const fcol = new Float32Array(fw * fh * 3)
    const fuv = new Float32Array(fw * fh * 2)
    const fnor = new Float32Array(fw * fh * 3)
    const frel = new Float32Array(fw * fh)
    for (let j = 0; j < fh; j++) {
      for (let i = 0; i < fw; i++) {
        const ci = i - LAND
        const cj = j - LAND
        const x = ci * CELL
        const z = cj * CELL
        const n = noise(x * 0.11, z * 0.11, plan.seed + 3)
        // The rim's colour, mottled; the haze does the darkening (same as the
        // detailed ground's, so the two meet without a line).
        // Past the grid it carries the detailed ground's own mottle and trail
        // on, easing into the rim over `landRimK` (a flat rim colour from the
        // grid's very edge drew a hard line below an exit).
        const gx = Math.min(w - 1, Math.max(0, ci))
        const gy = Math.min(h - 1, Math.max(0, cj))
        const dOut = Math.hypot(ci - gx, cj - gy)
        const kRim = landRimK(near[gy * w + gx]!, gridEdgeDist(ci, cj, w, h))
        const nb = noise(x * 0.22, z * 0.22, plan.seed) * 0.65 + noise(x * 0.7, z * 0.7, plan.seed + 7) * 0.35
        c.copy(cA).lerp(cB, nb)
        const tr = trail[gy * w + gx]! * Math.max(0, 1 - dOut / 2)
        if (tr > 0) c.lerp(cT, Math.min(0.85, tr * (0.7 + 0.3 * nb)))
        c.lerp(c2.copy(cR).multiplyScalar(0.9 + 0.14 * n), kRim)
        // The detailed ground's own relief tones, so the two read as one surface.
        const fgy = groundAt(x, z)
        const fgx = (groundAt(x + 0.4, z) - groundAt(x - 0.4, z)) / 0.8
        const fgz = (groundAt(x, z + 0.4) - groundAt(x, z - 0.4)) / 0.8
        const lap = groundAt(x + 1.5, z) + groundAt(x - 1.5, z) + groundAt(x, z + 1.5) + groundAt(x, z - 1.5) - 4 * fgy
        if (lap < -0.05) c.lerp(cCrest, lap < -0.14 ? 0.5 : 0.3)
        else if (lap > 0.05) c.lerp(cShade, lap > 0.14 ? 0.48 : 0.28)
        c.multiplyScalar(1 + Math.max(-0.12, Math.min(0.12, (fgy - meanH) * 0.06)))
        _nrm.set(-fgx, 1, -fgz).normalize()
        frel[j * fw + i] = Math.max(0, 1 - tr * 0.7)
        const k = j * fw + i
        // Under water the sheet drops below the bed, so it never shows through;
        // under the detailed ground it keeps a hand's breadth below it (a
        // bilinear cell and the sheet's flat halves never cross).
        const sunk = anyWet && (wetCell(plan, ci, cj) || wetCell(plan, ci - 1, cj) || wetCell(plan, ci, cj - 1) || wetCell(plan, ci - 1, cj - 1))
            // The sheet meets the detailed ground exactly ON it along the seam (the same
        // plane, so the texture does not shift and no crack opens), then is
        // lowered beneath it: a vertex touching any cell outside the town stays on the
        // ground, one wholly inside it drops (nothing coplanar under the ground).
        const edge = !(inner(ci - 1, cj - 1) && inner(ci, cj - 1) && inner(ci - 1, cj) && inner(ci, cj))
        fpos[k * 3] = x; fpos[k * 3 + 1] = fgy + (sunk ? BED_Y - 0.3 : edge ? 0 : -0.14); fpos[k * 3 + 2] = z
        fcol[k * 3] = c.r; fcol[k * 3 + 1] = c.g; fcol[k * 3 + 2] = c.b
        fuv[k * 2] = x / 5; fuv[k * 2 + 1] = z / 5
        fnor[k * 3] = _nrm.x; fnor[k * 3 + 1] = _nrm.y; fnor[k * 3 + 2] = _nrm.z
      }
    }
    const fidx: number[] = []
    for (let j = 0; j < fh - 1; j++) {
      for (let i = 0; i < fw - 1; i++) {
        const ci = i - LAND
        const cj = j - LAND
        if (covered(ci, cj)) continue
        const a = j * fw + i
        fidx.push(a, a + fw, a + 1, a + 1, a + fw, a + fw + 1)
      }
    }
    // A skirt: down from every seam edge, so the hairline between the ground's
    // edge and the sheet's shows the sheet's own colour, never the sky.
    const skirt = (a: number, b: number): void => {
      const vs = [a, b]
      const lo: number[] = []
      for (const v of vs) {
        const n = fpos.length / 3 + extra.length / 3
        extra.push(fpos[v * 3]!, fpos[v * 3 + 1]! - 0.3, fpos[v * 3 + 2]!)
        extraCol.push(fcol[v * 3]!, fcol[v * 3 + 1]!, fcol[v * 3 + 2]!)
        extraUv.push(fuv[v * 2]!, fuv[v * 2 + 1]!)
        extraNor.push(fnor[v * 3]!, fnor[v * 3 + 1]!, fnor[v * 3 + 2]!)
        lo.push(n)
      }
      fidx.push(a, b, lo[0]!, b, lo[1]!, lo[0]!, a, lo[0]!, b, b, lo[0]!, lo[1]!)
    }
    const extra: number[] = []
    const extraCol: number[] = []
    const extraUv: number[] = []
    const extraNor: number[] = []
    const fv = (ci: number, cj: number): number => (cj + LAND) * fw + ci + LAND
    for (let cj = -E - 1; cj <= h + E; cj++) {
      for (let ci = -E - 1; ci <= w + E; ci++) {
        if (!covered(ci, cj)) continue
        if (!inner(ci - 1, cj)) skirt(fv(ci, cj), fv(ci, cj + 1))
        if (!inner(ci + 1, cj)) skirt(fv(ci + 1, cj), fv(ci + 1, cj + 1))
        if (!inner(ci, cj - 1)) skirt(fv(ci, cj), fv(ci + 1, cj))
        if (!inner(ci, cj + 1)) skirt(fv(ci, cj + 1), fv(ci + 1, cj + 1))
      }
    }
    const far = new BufferGeometry()
    far.setAttribute('position', new Float32BufferAttribute([...fpos, ...extra], 3))
    far.setAttribute('normal', new Float32BufferAttribute([...fnor, ...extraNor], 3))
    far.setAttribute('color', new Float32BufferAttribute([...fcol, ...extraCol], 3))
    far.setAttribute('uv', new Float32BufferAttribute([...fuv, ...extraUv], 2))
    far.setAttribute('aRelief', new Float32BufferAttribute([...frel, ...extra.filter((_, k) => k % 3 === 0).map(() => 0)], 1))
    far.setIndex(fidx)
    owned.push(far)
    for (const g of splitByTile(far, TILE * 4)) {
      if (g !== far) owned.push(g)
      const farMesh = markStill(new Mesh(g, groundMaterial(groundDetail())))
      farMesh.renderOrder = -3
      root.add(farMesh)
    }
    await slice()
  }

  // ── Border props on the solid cells, then what the ground carries (`layGround`) ──
  const scenery = layScenery(plan, themeId, rng, low, near, caveRing, lowRing)
  separateFlats(scenery.map((g): [PropShape, Place[]] => [g.shape, g.places]))
  for (const g of scenery) {
    instanced(g.shape, g.places, g.outline, root, owned)
    if (g.slice) await slice()
  }
  for (const g of layGround(plan, themeId, rng, low)) instanced(g.shape, g.places, g.outline, root, owned)
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
      clearEdgeFog(fogTex)
      fogTex.dispose()
    }
  }
}

/**
 * Distance haze, fitted to the camera's distance. The hero stands at depth
 * `camDist` and the top edge of the screen is at about 1.31 x that, so the
 * haze begins just past the playfield and only the land beyond fades into it.
 */
export const setZoneFog = (scene: Scene, theme: Theme, camDist: number): void => {
  // Updated in place: a new Fog object makes three re-derive every material's
  // program on the next frame.
  const fog = scene.fog as Fog | null
  if (fog && (fog as Fog).isFog) {
    fog.color.set(theme.sky)
    fog.near = camDist * 1.2
    fog.far = camDist * 2.05
  } else scene.fog = new Fog(new Color(theme.sky), camDist * 1.2, camDist * 2.05)
}

// ─── Temporary walls (Earth Barrier, rubble) ─────────────────────────────────

/**
 * The parts of each temporary wall's shape, by its `fx` ('' the plain rock
 * column): what `WallRocks` merges, and what the poke-through and coplanar
 * audits read. A boss arena's props (`ARENA_PROPS`) keep inside their one
 * cell (1.5 m) below body height, so what stops a body is what is drawn.
 */
export const wallParts = (): Record<string, BufferGeometry[]> => ({
  '': [P(rcone(0.78, 0.36, 1.9, 0.08, 7), '#b08a5a', [0, 0.95, 0]), P(rock(0.5, 5), '#c79a5a', [0.2, 1.9, 0.1]), P(rock(0.45, 8), '#9a744a', [-0.4, 0.3, 0.3])],
  rubble: [P(rock(0.7, 3), '#8a7a6a', [0, 0.4, 0]), P(rock(0.5, 12), '#a8988a', [0.4, 0.7, -0.2]), P(rock(0.4, 19), '#6a5c50', [-0.4, 0.3, 0.3])],
  // The Frost Jarl's ice spike: a cluster of crystals, pale at their tips.
  ice: [
    P(rcone(0.42, 0.04, 2.3, 0.03, 6), '#9fd4ff', [0, 1.15, 0]),
    P(rcone(0.28, 0.03, 1.5, 0.03, 6), '#cfeaff', [0.38, 0.7, 0.1], [0, 0, -0.35]),
    P(rcone(0.26, 0.03, 1.3, 0.03, 6), '#7fc0f0', [-0.34, 0.6, -0.12], [0.2, 0, 0.4]),
    P(rcone(0.22, 0.03, 1.0, 0.03, 6), '#e8f6ff', [0.05, 0.48, 0.38], [0.45, 0, 0])
  ],
  // The Chimera's clearing: a weathered stone pillar on a round plinth, a mossy capital.
  pillar: [
    P(rcyl(0.62, 0.3, 0.06, 12, 2), '#7a7468', [0, 0.15, 0]),
    P(rcyl(0.44, 2.5, 0.06, 12, 2), '#a8a090', [0, 1.45, 0]),
    P(rcyl(0.56, 0.3, 0.06, 12, 2), '#8a8478', [0, 2.75, 0]),
    P(ell(0.4, 0.12, 0.36, 9, 5), '#5a7a3a', [0.08, 2.92, -0.04])
  ],
  // The Centaur Warchief's burned field: a farm wagon heaped with hay.
  wagon: [
    P(rbox(1.2, 0.3, 0.74, 0.3, 8, 6), '#7a5232', [0, 0.6, 0]),
    P(rcyl(0.3, 0.08, 0.03, 12, 1), '#4e3420', [0.36, 0.3, 0.45], [Math.PI / 2, 0, 0]),
    P(rcyl(0.3, 0.08, 0.03, 12, 1), '#4e3420', [-0.36, 0.3, 0.45], [Math.PI / 2, 0, 0]),
    P(rcyl(0.3, 0.08, 0.03, 12, 1), '#4e3420', [0.36, 0.3, -0.45], [Math.PI / 2, 0, 0]),
    P(rcyl(0.3, 0.08, 0.03, 12, 1), '#4e3420', [-0.36, 0.3, -0.45], [Math.PI / 2, 0, 0]),
    P(ell(0.52, 0.34, 0.33, 10, 6), '#e0bc5a', [0, 1.06, 0])
  ],
  // The siege's barricade (afterplay §8.2): sharpened stakes crossed over a log, a cell of a lane's width.
  barricade: [
    P(rcyl(0.17, 1.3, 0.04, 9, 1), '#6a4a2e', [0, 0.18, 0], [0, 0, Math.PI / 2]),
    P(rcone(0.09, 0.012, 1.6, 0.01, 7), '#8a6a42', [-0.22, 0.66, 0.1], [0.5, 0, 0.42]),
    P(rcone(0.09, 0.012, 1.6, 0.01, 7), '#7a5a36', [0.24, 0.66, -0.08], [-0.5, 0, -0.4]),
    P(rcone(0.08, 0.012, 1.4, 0.01, 7), '#8a6a42', [0.02, 0.62, 0.32], [0.62, 0, -0.1])
  ],
  // The Cyclops's mine hall: a timber support post under its cross beam, rocks at its foot.
  beam: [
    P(rbox(0.34, 2.8, 0.34, 0.2, 6, 8), '#6a4a2e', [0, 1.4, 0]),
    P(rbox(1.3, 0.26, 0.42, 0.2, 8, 4), '#5a3e26', [0, 2.9, 0]),
    P(rock(0.22, 31, 7, 5), '#7a6a5a', [0.42, 0.12, 0.3]),
    P(rock(0.18, 37, 7, 5), '#6a5c50', [-0.38, 0.1, -0.34])
  ],
  // The Leviathan's flooded hall: a low island of wet stone, a tuft of weed on it.
  isle: [
    P(rcyl(0.7, 0.5, 0.08, 10, 2), '#5a6a6e', [0, 0.25, 0]),
    P(rock(0.45, 43, 7, 5), '#7a8a8a', [0.1, 0.6, -0.05]),
    P(ell(0.3, 0.1, 0.26, 8, 5), '#4a7a5a', [-0.25, 0.52, 0.25])
  ],
  // The Hydra's moat: an iron brazier on a pole, its bowl heaped with live coals.
  brazier: [
    P(rcyl(0.5, 0.12, 0.03, 10, 1), '#2a2420', [0, 0.06, 0]),
    P(rcyl(0.11, 0.9, 0.03, 8, 1), '#3a3430', [0, 0.56, 0]),
    P(rcone(0.3, 0.55, 0.35, 0.04, 10), '#5a4a40', [0, 1.15, 0]),
    P(ell(0.42, 0.12, 0.42, 9, 5), '#ff7a2a', [0, 1.28, 0])
  ],
  // The Elder Dragon's rift: a standing rune stone, its rune set proud of the face, glowing.
  rune: [
    P(rbox(0.7, 2, 0.34, 0.08, 6, 8), '#5a5068', [0, 1, 0]),
    P(rbox(0.12, 0.9, 0.05, 0.02, 2, 4), '#c87aff', [0, 1.2, 0.2])
  ]
})

/** A pool of rock columns that rise out of and sink back into the ground. */
export class WallRocks {
  readonly root = new Group()
  private pool: Array<{ mesh: Mesh; line: Mesh; cell: number; t: number; state: 0 | 1 | 2 }> = []
  private shaped: Record<string, BufferGeometry> | null = null

  private shapes(): Record<string, BufferGeometry> {
    if (!this.shaped) {
      const parts = wallParts()
      this.shaped = {}
      for (const k in parts) this.shaped[k] = merge(parts[k]!)
    }
    return this.shaped
  }

  set(cells: number[], gridW: number, on: boolean, fx: string): void {
    const shapes = this.shapes()
    const geo = shapes[fx] ?? shapes['']!
    for (const cell of cells) {
      if (on) {
        let r = this.pool.find(p => p.state === 0)
        if (!r) {
          const mesh = new Mesh(geo, celVC())
          const line = new Mesh(geo, outlineMat())
          line.renderOrder = -1
          this.root.add(mesh, line)
          r = { mesh, line, cell, t: 0, state: 0 }
          this.pool.push(r)
        }
        const i = cell % gridW
        const j = (cell - i) / gridW
        r.mesh.geometry = r.line.geometry = geo
        r.mesh.position.set((i + 0.5) * CELL, groundAt((i + 0.5) * CELL, (j + 0.5) * CELL), (j + 0.5) * CELL)
        r.mesh.rotation.y = (cell * 2.39996) % (Math.PI * 2)
        r.cell = cell
        // A boss arena's props stand there already when the zone comes in.
        r.t = ARENA_PROPS.has(fx) ? 1 : 0
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
    for (const k in this.shaped) this.shaped[k]!.dispose()
    this.shaped = null
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
