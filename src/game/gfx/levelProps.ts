import {
  AdditiveBlending, BufferGeometry, CircleGeometry, Color, Float32BufferAttribute, Fog, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial,
  PlaneGeometry, Quaternion, RingGeometry, ShaderMaterial, UniformsLib, UniformsUtils, Vector3, type Scene
} from 'three'
import type { LiquidId } from '../data/zones'
import type { ChestTier } from '../data/loot'
import { sfx } from '../audio/sfx'
import { sceneQuality } from '../engine/quality'
import { CELL } from '../sim/grid'
import { mulberry32 } from '../sim/rng'
import type { SimEvent } from '../sim/types'
import type { ChestState, Sim } from '../sim/world'
import type { ZonePlan } from '../sim/zoneGen'
import { K_BRIDGE, K_FORD, K_WATER } from '../sim/zoneFeatures'
import { pushHud } from '../state/hud'
import { celVC, glowVC, outlineMat, setCelMood } from './cel'
import { cap, dome, merge, paint, paintBy, rbox, rcone, rcyl, rock, sph, torus, xform } from './kit'
import { LIQUIDS, WATER_Y, wetCell, type Theme } from './terrain'
import { groundAt } from './ground'
import type { Vfx } from './vfx'

/**
 * ─── What stands in a zone beside its scenery (roadmap #54–#59) ──────────────
 *
 * Chests that open, pressure plates and their carved hint stone, the rocks
 * that seal a hidden pocket and crumble when its puzzle is solved, bridges and
 * stepping stones, reeds and lily pads, the mouth of a cave, the skulls by a
 * champion's path, and the water itself.
 *
 * The sim owns every rule; this only draws the plan and answers its events.
 * Cost: one draw for the water, three for everything that never moves (merged
 * once), four per chest, three per plate, and two per sealed pocket.
 */

const P = (g: BufferGeometry, hex: string, p?: [number, number, number], r?: [number, number, number], s?: number | [number, number, number]): BufferGeometry =>
  xform(paint(g, hex), p, r, s ?? 1)

// ─── The water's surface ─────────────────────────────────────────────────────
//
// A flat sheet over every wet cell and one cell past it (it runs under the
// bank, which is the ground rising through it). Each vertex knows how near
// the bank it is (`aShore`: 0 in open water, 1 on dry land), and the shader
// draws three cel tones from that: deep in the middle, shallow by the bank and
// a foam line where the two meet the ground. Highlights drift across it.

const WATER_VERT = /* glsl */`
#include <common>
#include <fog_pars_vertex>
attribute float aShore;
varying float vShore;
varying vec2 vW;
void main() {
  vShore = aShore;
  #include <begin_vertex>
  vW = (modelMatrix * vec4(transformed, 1.0)).xz;
  #include <project_vertex>
  #include <fog_vertex>
}
`

const WATER_FRAG = /* glsl */`
#include <common>
#include <fog_pars_fragment>
uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uGlint;
uniform vec3 uFoam;
uniform vec3 uCrust;
uniform vec3 uAmbient;
uniform float uFoamAt;
uniform float uWobble;
uniform float uCrustK;
varying float vShore;
varying vec2 vW;
void main() {
  vec2 p = vW * 0.55;
  float t = uTime;
  float a = sin(p.x * 2.3 + t * 0.9 + sin(p.y * 1.7 - t * 0.4) * 1.4);
  float b = sin(p.y * 3.1 - t * 0.7 + sin(p.x * 1.3 + t * 0.3) * 1.6);
  // Two tones: deep in the middle, shallow toward the bank, a wavy line between.
  vec3 col = mix(uDeep, uShallow, smoothstep(0.2, 0.24, vShore + 0.05 * a));
  // Slabs of cooled crust drifting on lava.
  float cr = sin(p.x * 1.9 + t * 0.22 + sin(p.y * 2.3) * 1.2) * sin(p.y * 1.7 - t * 0.16 + sin(p.x * 2.1) * 1.3);
  col = mix(col, uCrust, smoothstep(0.42, 0.47, cr) * uCrustK);
  // Highlights: thin bright streaks that drift.
  col = mix(col, uGlint, smoothstep(0.83, 0.87, a * b) * 0.9);
  // Foam: a ripple a little way out, and the line along the bank.
  float w = uWobble * (0.035 * sin(vW.x * 2.9 + t * 1.8) + 0.03 * sin(vW.y * 3.3 - t * 1.4));
  float out1 = uFoamAt - 0.15 + 0.035 * sin(t * 0.9 + vW.x * 0.7 + vW.y * 0.5);
  float ripple = smoothstep(out1, out1 + 0.02, vShore + w) - smoothstep(out1 + 0.045, out1 + 0.065, vShore + w);
  col = mix(col, uFoam, ripple * 0.55);
  col = mix(col, uFoam, smoothstep(uFoamAt, uFoamAt + 0.025, vShore + w));
  gl_FragColor = vec4(col * uAmbient, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`

/** Past the grid a river runs on this many cells (the land sheet's own reach). */
const RIVER_REACH = 18

// ─── Chests ──────────────────────────────────────────────────────────────────

interface ChestLook { body: string; body2: string; trim: string; lock: string; gem: string; glow: string; scale: number }
const CHEST_LOOK: Record<ChestTier, ChestLook> = {
  wood: { body: '#7a4424', body2: '#925428', trim: '#ffc83a', lock: '#fff0a0', gem: '', glow: '#ffe27a', scale: 1.25 },
  iron: { body: '#46566a', body2: '#5a6e88', trim: '#e6edf6', lock: '#ffd24a', gem: '#5fd8ff', glow: '#c8ecff', scale: 1.32 },
  gold: { body: '#d48a14', body2: '#f0a81e', trim: '#fff6c0', lock: '#ffffff', gem: '#ff3a5a', glow: '#fff2a8', scale: 1.42 }
}
const CHEST_RING: Record<ChestTier, string> = { wood: '#ffd84a', iron: '#9fdcff', gold: '#ffe9a8' }

interface ChestGeo { base: BufferGeometry; lid: BufferGeometry; glow: BufferGeometry }
const chestGeo = (tier: ChestTier): ChestGeo => {
  const k = CHEST_LOOK[tier]
  const base = [
    P(rbox(1.0, 0.5, 0.66, 0.34, 10, 8), k.body, [0, 0.29, 0]),
    // Corner straps and a base rail.
    P(rbox(0.13, 0.54, 0.7, 0.4, 8, 6), k.trim, [-0.36, 0.29, 0]),
    P(rbox(0.13, 0.54, 0.7, 0.4, 8, 6), k.trim, [0.36, 0.29, 0]),
    P(rbox(1.04, 0.1, 0.7, 0.4, 10, 6), k.trim, [0, 0.52, 0]),
    // Stubby feet.
    P(sph(0.1, 7, 5), k.body2, [-0.4, 0.07, 0.25]), P(sph(0.1, 7, 5), k.body2, [0.4, 0.07, 0.25]),
    P(sph(0.1, 7, 5), k.body2, [-0.4, 0.07, -0.25]), P(sph(0.1, 7, 5), k.body2, [0.4, 0.07, -0.25])
  ]
  // The lid is authored round its hinge (the back edge): it swings about X.
  const lid = [
    P(rbox(1.02, 0.4, 0.68, 0.62, 10, 8), k.body2, [0, 0.14, 0.33]),
    P(rbox(0.13, 0.44, 0.72, 0.62, 8, 6), k.trim, [-0.36, 0.14, 0.33]),
    P(rbox(0.13, 0.44, 0.72, 0.62, 8, 6), k.trim, [0.36, 0.14, 0.33]),
    P(rbox(0.2, 0.26, 0.1, 0.5, 8, 6), k.lock, [0, 0.02, 0.68])
  ]
  if (k.gem) lid.push(P(sph(0.075, 8, 6), k.gem, [0, 0.05, 0.74]))
  // What shows when the lid lifts: a heap of light.
  const glowG = [P(dome(0.36, Math.PI / 2, 10, 5), k.glow, [0, 0.42, 0], [0, 0, 0], [1.15, 0.5, 0.72])]
  return { base: merge(base), lid: merge(lid), glow: merge(glowG) }
}

interface ChestView {
  id: number
  tier: ChestTier
  root: Group
  lid: Group
  glow: Mesh
  /** 0 shut .. 1 thrown back; `aim` is where the lid is going. */
  open: number
  aim: number
  /** Seconds since the lid began to lift (the anticipation shake). */
  liftT: number
  /** Seconds since it popped open (-1: it has not). */
  popT: number
  /** Appearing from behind a door: 0..1. */
  show: number
  /** Seconds to the next idle glint. */
  glint: number
  x: number
  z: number
}

// ─── Plates ──────────────────────────────────────────────────────────────────

/** Each plate's own colour (and shape: colour is never the only clue). */
const SYMBOL_COLOR = ['#ff5a5a', '#4aa8ff', '#6adf6a', '#ffd24a']

/** A flat symbol facing +Z, about `r` across: ring, triangle, square, cross. */
const symbolGeo = (n: number, r: number): BufferGeometry => {
  if (n === 0) return new RingGeometry(r * 0.55, r, 28)
  if (n === 1) { const g = new CircleGeometry(r * 1.12, 3); g.rotateZ(Math.PI / 2); return g }
  if (n === 2) { const g = new CircleGeometry(r * 1.12, 4); g.rotateZ(Math.PI / 4); return g }
  const a = new PlaneGeometry(r * 2, r * 0.56)
  const b = new PlaneGeometry(r * 0.56, r * 2)
  const g = merge([a, b])
  g.rotateZ(Math.PI / 4)
  a.dispose()
  b.dispose()
  return g
}

interface PlateView {
  id: number
  root: Group
  mat: MeshBasicMaterial
  halo: Mesh
  /** The ground's height under it. */
  gy: number
  color: Color
  /** 0 dark .. 1 lit, eased. */
  lit: number
  aim: number
  /** Pressed down, springing back. */
  press: number
  /** A wrong step's red blink. */
  wrong: number
  x: number
  z: number
}

interface HintGlyph { mat: MeshBasicMaterial; color: Color; plate: number; lit: number }

// ─── Sealed pockets ──────────────────────────────────────────────────────────

interface DoorView {
  id: number
  mesh: InstancedMesh
  line: InstancedMesh
  /** Per rock: place, turn, size, and when it starts to sink. */
  rocks: Array<{ x: number; z: number; rot: number; s: number; delay: number; dust: boolean }>
  /** Seconds since the door began to open (-1: shut). */
  t: number
  /** Seconds until it starts (the solved puzzle's light is on its way). */
  wait: number
}

const _m = new Matrix4()
const _q = new Quaternion()
const _p = new Vector3()
const _s = new Vector3()
const _up = new Vector3(0, 1, 0)
const _c = new Color()

/** Seconds the solved puzzle's light takes from the last plate to the wall. */
const DOOR_WAIT = 0.55

/** The dark a cave turns the world, and how far the light falls. */
const CAVE_AMBIENT = '#6f6c98'
const CAVE_SKY = '#0d0b15'
const CAVE_DARK = 0.62

export class LevelProps {
  readonly root = new Group()
  private scene: Scene | null = null
  private plan: ZonePlan | null = null
  private owned: BufferGeometry[] = []
  private mats: Array<MeshBasicMaterial | ShaderMaterial> = []
  private water: ShaderMaterial | null = null
  private chests: ChestView[] = []
  private plates: PlateView[] = []
  private glyphs: HintGlyph[] = []
  private doors: DoorView[] = []
  /** Wet cell centres (motes rise from lava, pools and void-water). */
  private wetSpots: Array<[number, number]> = []
  private time = 0
  private heroX = 0
  private heroZ = 0
  /** 0 outside .. 1 deep in a cave: the mood eases between the two. */
  private dark = 0
  private darkSet = -1
  private low = sceneQuality() === 'low'
  private ambient = new Color()
  private sky = new Color()
  private caveAmbient = new Color(CAVE_AMBIENT)
  private caveSky = new Color(CAVE_SKY)

  /**
   * @param shake camera trauma, for the rumble of a door.
   */
  constructor(private sim: Sim, private vfx: Vfx, private theme: Theme, private shake: (amount: number) => void = () => {}) {
    this.ambient.set(theme.ambient)
    this.sky.set(theme.sky)
  }

  // ─── Building ──────────────────────────────────────────────────────────────

  build(plan: ZonePlan, scene: Scene): void {
    this.plan = plan
    this.scene = scene
    const lit: BufferGeometry[] = []
    const glow: BufferGeometry[] = []
    if (plan.liquid) {
      this.buildWater(plan, plan.liquid)
      this.dressWater(plan, plan.liquid, lit, glow)
    }
    // Each piece is built on flat ground at 0 and set down on the ground's height where it stands.
    const lift = (y: number, fn: () => void): void => {
      const l0 = lit.length
      const g0 = glow.length
      fn()
      for (let q = l0; q < lit.length; q++) lit[q]!.translate(0, y, 0)
      for (let q = g0; q < glow.length; q++) glow[q]!.translate(0, y, 0)
    }
    for (const cr of plan.crossings) {
      if (cr.kind === 'bridge') lift(groundAt(cr.x, cr.z), () => this.buildBridge(plan, cr.i0, cr.i1, cr.j0, cr.j1, lit))
      else this.buildFord(plan, cr.cells, lit)
    }
    // A cave's mouth stands on the lower of its two feet, so neither floats.
    for (const cv of plan.caves) {
      const m = cv.mouth
      const px = Math.cos(m.a) * 1.55
      const pz = -Math.sin(m.a) * 1.55
      lift(Math.min(groundAt(m.x + px, m.z + pz), groundAt(m.x - px, m.z - pz), groundAt(m.x, m.z)), () => this.buildMouth(m.x, m.z, m.a, lit, glow))
    }
    for (const s of plan.signs) lift(groundAt(s.x, s.z), () => this.buildSign(s.x, s.z, s.a, lit, glow))
    if (plan.puzzle) lift(groundAt(plan.puzzle.hint.x, plan.puzzle.hint.z), () => this.buildHint(plan, lit))
    if (lit.length) {
      const g = merge(lit)
      this.owned.push(g)
      this.root.add(new Mesh(g, celVC()))
      const o = new Mesh(g, outlineMat())
      o.renderOrder = -1
      this.root.add(o)
    }
    if (glow.length) {
      const g = merge(glow)
      this.owned.push(g)
      this.root.add(new Mesh(g, glowVC()))
    }
    for (const g of [...lit, ...glow]) g.dispose()
    this.buildPlates(plan)
    this.buildDoors(plan)
    this.buildChests()
    scene.add(this.root)
  }

  private buildWater(plan: ZonePlan, liquid: LiquidId): void {
    const look = LIQUIDS[liquid]
    const SUB = this.low ? 1 : 2
    const i0 = plan.rivers.length ? -RIVER_REACH : 0
    const i1 = plan.rivers.length ? plan.w + RIVER_REACH : plan.w
    const pos: number[] = []
    const shore: number[] = []
    const idx: number[] = []
    const vmap = new Map<number, number>()
    const gw = (i1 - i0) * SUB + 1
    const wetShare = (gi: number, gj: number): number => {
      let t = 0
      for (let dj = -1; dj <= 0; dj++) for (let di = -1; di <= 0; di++) {
        if (wetCell(plan, i0 + Math.floor((gi + di) / SUB), Math.floor((gj + dj) / SUB))) t++
      }
      return t / 4
    }
    const vertex = (gi: number, gj: number): number => {
      const key = gj * gw + gi
      const hit = vmap.get(key)
      if (hit !== undefined) return hit
      const n = pos.length / 3
      const vx = (i0 + gi / SUB) * CELL
      const vz = (gj / SUB) * CELL
      pos.push(vx, groundAt(vx, vz) + WATER_Y, vz)
      shore.push(1 - wetShare(gi, gj))
      vmap.set(key, n)
      return n
    }
    for (let j = 0; j < plan.h; j++) {
      for (let i = i0; i < i1; i++) {
        // The sheet covers each wet cell and the ring of cells round it.
        let covered = false
        for (let dj = -1; dj <= 1 && !covered; dj++) for (let di = -1; di <= 1; di++) if (wetCell(plan, i + di, j + dj)) { covered = true; break }
        if (!covered) continue
        if (wetCell(plan, i, j) && i >= 0 && i < plan.w) this.wetSpots.push([(i + 0.5) * CELL, (j + 0.5) * CELL])
        for (let sj = 0; sj < SUB; sj++) {
          for (let si = 0; si < SUB; si++) {
            const gi = (i - i0) * SUB + si
            const gj = j * SUB + sj
            const a = vertex(gi, gj)
            const b = vertex(gi + 1, gj)
            const d = vertex(gi + 1, gj + 1)
            const e = vertex(gi, gj + 1)
            idx.push(a, e, b, b, e, d)
          }
        }
      }
    }
    if (!idx.length) return
    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(pos, 3))
    geo.setAttribute('aShore', new Float32BufferAttribute(shore, 1))
    geo.setIndex(idx)
    this.owned.push(geo)
    // Lava, pools and void-water shine by themselves: a cave does not dim them.
    const lit = liquid === 'water' || liquid === 'ice'
    const mat = new ShaderMaterial({
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        {
          uTime: { value: 0 },
          uDeep: { value: new Color(look.deep) },
          uShallow: { value: new Color(look.shallow) },
          uGlint: { value: new Color(look.glint) },
          uFoam: { value: new Color(look.foam) },
          uCrust: { value: new Color('#3a1612') },
          uAmbient: { value: new Color(1, 1, 1) },
          uFoamAt: { value: look.foamAt },
          uWobble: { value: look.wobble },
          uCrustK: { value: look.crust * 0.85 }
        }
      ]),
      vertexShader: WATER_VERT,
      fragmentShader: WATER_FRAG,
      fog: true
    })
    mat.userData.lit = lit
    mat.userData.flow = look.flow
    this.water = mat
    this.mats.push(mat)
    const mesh = new Mesh(geo, mat)
    mesh.renderOrder = -1
    this.root.add(mesh)
  }

  /** Reeds, lily pads and stones (or floes, embers, crystals): what grows at a bank. */
  private dressWater(plan: ZonePlan, liquid: LiquidId, lit: BufferGeometry[], glow: BufferGeometry[]): void {
    const rng = mulberry32((plan.seed ^ 0x77a1) >>> 0)
    const { w, h, kind } = plan
    const density = this.low ? 0.5 : 1
    for (let j = 2; j < h - 2; j++) {
      for (let i = 2; i < w - 2; i++) {
        if (kind[j * w + i] !== K_WATER) continue
        const x = (i + 0.5) * CELL
        const z = (j + 0.5) * CELL
        // This body of water's surface (it lies level: \`sim/relief.ts\`).
        const wy = groundAt(x, z) + WATER_Y
        // Which sides are bank?
        const banks: Array<[number, number]> = []
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const k = kind[(j + dj) * w + i + di]
          if (k !== K_WATER && k !== K_BRIDGE && k !== K_FORD) banks.push([di, dj])
        }
        const r = rng()
        if (banks.length && r < 0.42 * density) {
          const [di, dj] = banks[Math.floor(rng() * banks.length)]!
          const bx = x + di * 0.42 + (rng() - 0.5) * 0.7 * Math.abs(dj)
          const bz = z + dj * 0.42 + (rng() - 0.5) * 0.7 * Math.abs(di)
          const rot = rng() * Math.PI * 2
          if (liquid === 'water') {
            // A clump of reeds, one with a cattail.
            for (let q = 0; q < 4; q++) {
              const a = rot + q * 1.7
              const d = 0.08 + q * 0.05
              const hgt = 0.55 + rng() * 0.5
              lit.push(P(rcone(0.035, 0.01, hgt, 0.01, 5), q % 2 ? '#5fae4a' : '#4a9a44', [bx + Math.cos(a) * d, wy + hgt / 2, bz + Math.sin(a) * d], [(rng() - 0.5) * 0.25, 0, (rng() - 0.5) * 0.25]))
            }
            lit.push(P(cap(0.05, 0.16, 6, 2), '#7a4a2a', [bx, wy + 0.95, bz]))
          } else if (liquid === 'ice') {
            lit.push(P(rock(0.36, 3 + Math.floor(rng() * 20), 7, 5), '#eaf7ff', [bx, wy + 0.06, bz], [0, rot, 0], [1, 0.5, 1]))
          } else if (liquid === 'lava') {
            lit.push(P(rock(0.34, 3 + Math.floor(rng() * 20), 7, 5), '#2c2024', [bx, wy + 0.08, bz], [0, rot, 0], [1, 0.7, 1]))
            glow.push(P(sph(0.07, 6, 5), '#ffb02a', [bx + 0.12, wy + 0.26, bz - 0.06]))
          } else {
            const hex = liquid === 'void' ? '#d0a8ff' : '#7dffd0'
            lit.push(P(rock(0.26, 3 + Math.floor(rng() * 20), 7, 5), liquid === 'void' ? '#2a1c50' : '#3a4a52', [bx, wy + 0.08, bz], [0, rot, 0]))
            glow.push(P(rcone(0.07, 0.01, 0.5, 0.01, 5), hex, [bx, wy + 0.4, bz], [0, 0, (rng() - 0.5) * 0.5]))
          }
        } else if (r > 0.86 - 0.08 * density) {
          const lx = x + (rng() - 0.5) * 0.8
          const lz = z + (rng() - 0.5) * 0.8
          if (liquid === 'water') {
            // A lily pad, sometimes in flower.
            lit.push(P(rcyl(0.24, 0.03, 0.012, 9, 1), '#4fa84a', [lx, wy + 0.02, lz], [0, rng() * 6, 0]))
            if (rng() < 0.4) lit.push(P(sph(0.08, 7, 5), rng() < 0.5 ? '#ff9ac0' : '#fff4f8', [lx + 0.05, wy + 0.09, lz]))
          } else if (liquid === 'ice') {
            lit.push(P(rcyl(0.34, 0.07, 0.03, 6, 1), '#f4fbff', [lx, wy + 0.03, lz], [0, rng() * 6, 0], [1, 1, 0.75]))
          }
        }
      }
    }
  }

  /** A plank bridge over water, a stone one over lava: the deck covers the bridged cells exactly. */
  private buildBridge(plan: ZonePlan, i0: number, i1: number, j0: number, j1: number, lit: BufferGeometry[]): void {
    const stone = plan.liquid === 'lava' || plan.liquid === 'void'
    const x0 = i0 * CELL
    const x1 = (i1 + 1) * CELL
    const z0 = j0 * CELL - 0.45
    const z1 = (j1 + 1) * CELL + 0.45
    const cx = (x0 + x1) / 2
    const cz = (z0 + z1) / 2
    const wide = x1 - x0
    const len = z1 - z0
    if (stone) {
      lit.push(P(rbox(wide, 0.34, len, 0.18, 8, 6), '#6c6676', [cx, -0.15, cz]))
      for (const sx of [-1, 1]) {
        lit.push(P(rbox(0.3, 0.3, len, 0.3, 6, 6), '#857f90', [cx + sx * (wide / 2 - 0.12), 0.13, cz]))
        for (const sz of [-1, 1]) lit.push(P(rbox(0.46, 0.62, 0.46, 0.35, 8, 6), '#57525f', [cx + sx * (wide / 2 - 0.12), 0.26, cz + sz * (len / 2 - 0.2)]))
      }
      for (const sz of [-0.28, 0.28]) lit.push(P(rbox(wide * 0.6, 0.7, 0.5, 0.3, 8, 6), '#4a4652', [cx, -0.6, cz + sz * len]))
      return
    }
    // Planks across, two tones, a little uneven.
    const n = Math.max(4, Math.round(len / 0.42))
    for (let q = 0; q < n; q++) {
      const z = z0 + ((q + 0.5) / n) * len
      const hex = q % 3 === 0 ? '#b98a54' : q % 3 === 1 ? '#a87844' : '#c69a62'
      lit.push(P(rbox(wide - 0.06, 0.1, (len / n) * 0.9, 0.3, 6, 4), hex, [cx + ((q * 7) % 3 - 1) * 0.02, -0.03, z], [0, ((q * 5) % 3 - 1) * 0.012, 0]))
    }
    // Beams under the deck, posts at the corners and a rail down each side.
    for (const sx of [-1, 1]) {
      const px = cx + sx * (wide / 2 - 0.1)
      lit.push(P(rbox(0.16, 0.16, len, 0.3, 6, 6), '#7a5630', [cx + sx * wide * 0.3, -0.14, cz]))
      lit.push(P(rbox(0.09, 0.09, len - 0.2, 0.4, 6, 6), '#8a6238', [px, 0.6, cz]))
      const posts = Math.max(2, Math.round(len / 1.8))
      for (let q = 0; q <= posts; q++) {
        const z = z0 + 0.12 + (q / posts) * (len - 0.24)
        lit.push(P(rcyl(0.08, 0.9, 0.03, 7, 1), '#7a5630', [px, 0.28, z]))
        lit.push(P(sph(0.1, 7, 5), '#c69a62', [px, 0.76, z]))
      }
    }
  }

  /** Stepping stones: flat-topped rocks, two or three to a cell. */
  private buildFord(plan: ZonePlan, cells: number[], lit: BufferGeometry[]): void {
    const hot = plan.liquid === 'lava'
    for (const k of cells) {
      const i = k % plan.w
      const x = (i + 0.5) * CELL
      const z = ((k - i) / plan.w + 0.5) * CELL
      const spots: Array<[number, number, number]> = [[-0.3, -0.25, 0.56], [0.32, 0.2, 0.5], [-0.18, 0.38, 0.4], [0.3, -0.36, 0.38]]
      spots.forEach(([dx, dz, r], q) => {
        const g = rock(r, k * 7 + q, 9, 6)
        paintBy(g, (_x, y) => (y > r * 0.3 ? (hot ? '#6a5a5e' : '#b6bcc0') : hot ? '#3a2e30' : '#8a9296'))
        lit.push(xform(g, [x + dx, groundAt(x, z) + WATER_Y + 0.02, z + dz], [0, q * 1.3 + k, 0], [1, 0.42, 1]))
      })
    }
  }

  /** A cave's mouth: two leaning horns of rock that nearly meet. Nothing spans
   *  the way in, so the hero is never under a roof the camera cannot see past. */
  private buildMouth(x: number, z: number, a: number, lit: BufferGeometry[], glow: BufferGeometry[]): void {
    // Across the way in.
    const px = Math.cos(a)
    const pz = -Math.sin(a)
    for (const sgn of [-1, 1]) {
      const bx = x + px * sgn * 1.55
      const bz = z + pz * sgn * 1.55
      const lean = Math.atan2(px * -sgn, pz * -sgn)
      lit.push(P(rcone(0.74, 0.4, 2.1, 0.1, 8), '#4a4458', [bx, 1.05, bz]))
      lit.push(P(rock(0.5, 5 + sgn, 9, 7), '#3c3848', [bx + px * sgn * 0.4, 0.3, bz + pz * sgn * 0.4 + 0.2]))
      // The horn: tilted in over the path from the pillar's top.
      const horn = P(rcone(0.36, 0.07, 1.5, 0.04, 7), '#5e586e', [0, 0.75, 0])
      xform(horn, [0, 0, 0], [0.82, 0, 0])
      xform(horn, [bx, 2.0, bz], [0, lean, 0])
      lit.push(horn)
      // A glowing shard at each foot: the way in shows from across a clearing.
      glow.push(P(rcone(0.15, 0.01, 0.95, 0.01, 6), this.theme.mote, [bx - px * sgn * 0.45, 0.46, bz - pz * sgn * 0.45 + 0.4], [0, 0, sgn * 0.28]))
      glow.push(P(rcone(0.09, 0.01, 0.55, 0.01, 6), this.theme.mote, [bx - px * sgn * 0.72, 0.26, bz - pz * sgn * 0.72 + 0.5], [0, 0, sgn * 0.6]))
    }
  }

  /** Skulls on a post by a champion's path: a warning that needs no words. */
  private buildSign(x: number, z: number, a: number, lit: BufferGeometry[], glow: BufferGeometry[]): void {
    const parts: BufferGeometry[] = [
      P(rcyl(0.09, 2.0, 0.03, 7, 1), '#6a4a30', [0, 1.0, 0], [0, 0, 0.06]),
      // Crossed bones behind the skull.
      P(cap(0.055, 0.9, 6, 2), '#efe8d6', [0.02, 1.62, -0.04], [0, 0, 0.9]),
      P(cap(0.055, 0.9, 6, 2), '#efe8d6', [0.02, 1.62, -0.04], [0, 0, -0.9]),
      // The skull: a big head, a jaw, two dark sockets and a nose.
      P(sph(0.4, 12, 9), '#f6f0e0', [0.02, 2.12, 0.04], [0, 0, 0], [1, 0.9, 0.95]),
      P(rbox(0.42, 0.24, 0.34, 0.4, 8, 6), '#e6dec8', [0.02, 1.8, 0.14]),
      P(sph(0.115, 8, 6), '#1b1626', [-0.14, 2.12, 0.36], [0, 0, 0], [1, 1.15, 0.6]),
      P(sph(0.115, 8, 6), '#1b1626', [0.18, 2.12, 0.36], [0, 0, 0], [1, 1.15, 0.6]),
      P(sph(0.05, 6, 5), '#1b1626', [0.02, 1.96, 0.4], [0, 0, 0], [0.9, 1.3, 0.6]),
      // A red rag below it: danger.
      P(rbox(0.5, 0.56, 0.05, 0.4, 6, 6), '#d2342c', [0.04, 1.2, 0.07], [0, 0, -0.08]),
      P(rbox(0.9, 0.1, 0.1, 0.4, 6, 6), '#7a5636', [0, 1.45, 0])
    ]
    const eyes = [P(sph(0.045, 6, 4), '#ff3a2a', [-0.14, 2.12, 0.43]), P(sph(0.045, 6, 4), '#ff3a2a', [0.18, 2.12, 0.43])]
    for (const g of parts) lit.push(xform(g, [x, 0, z], [0, a, 0]))
    for (const g of eyes) glow.push(xform(g, [x, 0, z], [0, a, 0]))
  }

  /** The carved stone: the plates' symbols in order, left to right, with pips
   *  under each (one, two, three…) so the order reads without a word. */
  private buildHint(plan: ZonePlan, lit: BufferGeometry[]): void {
    const pz = plan.puzzle!
    const n = pz.order.length
    const STEP = 0.74
    const wide = STEP * n + 0.4
    const { x, z } = pz.hint
    const tilt = -0.66
    // The slab leans on a heap of rock behind it; a stone props each foot.
    lit.push(P(rock(0.7, 23, 9, 7), '#7c7a84', [x, 0.3, z - 0.72], [0, 0.4, 0], [wide / 1.6, 1.1, 0.7]))
    lit.push(P(rock(0.3, 5, 8, 6), '#8a8892', [x - wide / 2 - 0.05, 0.14, z + 0.2]))
    lit.push(P(rock(0.26, 9, 8, 6), '#6e6c78', [x + wide / 2 + 0.05, 0.12, z + 0.22]))
    const slab = P(rbox(wide, 1.3, 0.2, 0.22, 10, 8), '#a6a4b0', [0, 0.6, 0])
    xform(slab, [0, 0, 0], [tilt, 0, 0])
    lit.push(xform(slab, [x, 0.2, z + 0.12]))
    const frame = P(rbox(wide + 0.14, 0.14, 0.24, 0.4, 8, 6), '#6e6c78', [0, 1.28, 0])
    xform(frame, [0, 0, 0], [tilt, 0, 0])
    lit.push(xform(frame, [x, 0.2, z + 0.12]))
    const face = new Group()
    face.position.set(x, 0.2 + groundAt(x, z), z + 0.12)
    face.rotation.x = tilt
    for (let q = 0; q < n; q++) {
      const plate = plan.plates.find(p => p.id === pz.order[q])
      if (!plate) continue
      const color = new Color(SYMBOL_COLOR[plate.symbol % SYMBOL_COLOR.length]!)
      const mat = new MeshBasicMaterial({ color: color.clone().multiplyScalar(0.72), toneMapped: false })
      this.mats.push(mat)
      const sx = (q - (n - 1) / 2) * STEP
      const geo = symbolGeo(plate.symbol, 0.26)
      this.owned.push(geo)
      const sym = new Mesh(geo, mat)
      sym.position.set(sx, 0.78, 0.108)
      face.add(sym)
      // Pips: the place in the order.
      const pip = new CircleGeometry(0.055, 10)
      this.owned.push(pip)
      for (let d = 0; d <= q; d++) {
        const dot = new Mesh(pip, mat)
        dot.position.set(sx + (d - q / 2) * 0.15, 0.36, 0.108)
        face.add(dot)
      }
      this.glyphs.push({ mat, color, plate: plate.id, lit: 0 })
    }
    this.root.add(face)
  }

  private buildPlates(plan: ZonePlan): void {
    if (!plan.plates.length) return
    const slab = merge([
      P(rcyl(0.64, 0.12, 0.04, 16, 2), '#8e8c98', [0, 0.02, 0]),
      P(torus(0.6, 0.05, 6, 20), '#6a6874', [0, 0.08, 0], [Math.PI / 2, 0, 0])
    ])
    this.owned.push(slab)
    // A lit plate's halo: a ring of its colour on the ground round it.
    const halo = new RingGeometry(0.66, 0.92, 32)
    halo.rotateX(-Math.PI / 2)
    this.owned.push(halo)
    for (const p of plan.plates) {
      const root = new Group()
      root.position.set(p.x, groundAt(p.x, p.z), p.z)
      root.add(new Mesh(slab, celVC()))
      const line = new Mesh(slab, outlineMat())
      line.renderOrder = -1
      root.add(line)
      const color = new Color(SYMBOL_COLOR[p.symbol % SYMBOL_COLOR.length]!)
      const mat = new MeshBasicMaterial({ color: color.clone().multiplyScalar(0.42), toneMapped: false })
      this.mats.push(mat)
      const geo = symbolGeo(p.symbol, 0.3)
      geo.rotateX(-Math.PI / 2)
      this.owned.push(geo)
      const sym = new Mesh(geo, mat)
      sym.position.y = 0.095
      root.add(sym)
      const haloMat = new MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, toneMapped: false })
      this.mats.push(haloMat)
      const ring = new Mesh(halo, haloMat)
      ring.position.set(p.x, 0.05 + groundAt(p.x, p.z), p.z)
      ring.renderOrder = 3
      ring.visible = false
      this.root.add(ring)
      this.root.add(root)
      this.plates.push({ id: p.id, root, mat, halo: ring, color, lit: 0, aim: 0, press: 0, wrong: 0, x: p.x, z: p.z, gy: groundAt(p.x, p.z) })
    }
  }

  /** The rocks that seal a hidden pocket: one heap to a sealed cell. */
  private buildDoors(plan: ZonePlan): void {
    if (!plan.doors.length) return
    const geo = merge([
      P(rock(0.95, 5, 10, 8), '#8d8a94', [0, 0.62, 0]),
      P(rock(0.6, 12, 9, 7), '#a5a2ac', [0.5, 0.36, 0.42]),
      P(rock(0.52, 19, 9, 7), '#77747e', [-0.52, 0.3, 0.3]),
      P(rock(0.56, 27, 9, 7), '#9a97a1', [-0.1, 1.3, -0.12])
    ])
    this.owned.push(geo)
    for (const d of plan.doors) {
      const rng = mulberry32((plan.seed ^ (0x51d0 + d.id)) >>> 0)
      const rocks: DoorView['rocks'] = []
      for (const k of d.cells) {
        const i = k % plan.w
        const x = (i + 0.5) * CELL
        const z = ((k - i) / plan.w + 0.5) * CELL
        // The wall goes from the door inward: the nearest rocks fall first.
        const delay = Math.min(1.1, Math.hypot(x - d.x, z - d.z) * 0.085)
        rocks.push({ x: x + (rng() - 0.5) * 0.3, z: z + (rng() - 0.5) * 0.3, rot: rng() * Math.PI * 2, s: 0.95 + rng() * 0.3, delay, dust: false })
      }
      const mesh = new InstancedMesh(geo, celVC(), rocks.length)
      const line = new InstancedMesh(geo, outlineMat(), rocks.length)
      line.renderOrder = -1
      const view: DoorView = { id: d.id, mesh, line, rocks, t: -1, wait: -1 }
      this.placeRocks(view, 0)
      this.root.add(mesh, line)
      this.doors.push(view)
    }
  }

  /** Write a door's rocks: standing (t = 0) or sinking into the ground. */
  private placeRocks(d: DoorView, t: number): void {
    for (let n = 0; n < d.rocks.length; n++) {
      const r = d.rocks[n]!
      const u = Math.max(0, Math.min(1, (t - r.delay) / 0.55))
      // A shudder, then down and gone.
      const sink = u * u
      const shudder = u > 0 && u < 1 ? Math.sin(t * 60 + n) * 0.04 * (1 - u) : 0
      _q.setFromAxisAngle(_up, r.rot + u * 0.5)
      _p.set(r.x + shudder, groundAt(r.x, r.z) - sink * 2.2, r.z)
      const s = r.s * (1 - sink * 0.35)
      _s.set(s, s, s)
      _m.compose(_p, _q, _s)
      d.mesh.setMatrixAt(n, _m)
      d.line.setMatrixAt(n, _m)
    }
    d.mesh.instanceMatrix.needsUpdate = true
    d.line.instanceMatrix.needsUpdate = true
    d.mesh.computeBoundingSphere()
    d.line.computeBoundingSphere()
  }

  private buildChests(): void {
    const geos = new Map<ChestTier, ChestGeo>()
    for (const c of this.sim.chests) {
      let g = geos.get(c.tier)
      if (!g) {
        g = chestGeo(c.tier)
        geos.set(c.tier, g)
        this.owned.push(g.base, g.lid, g.glow)
      }
      const look = CHEST_LOOK[c.tier]
      const root = new Group()
      root.position.set(c.x, groundAt(c.x, c.z), c.z)
      // Its front faces where the hero will stand.
      root.rotation.y = Math.atan2(c.sx - c.x, c.sz - c.z)
      root.scale.setScalar(look.scale)
      const base = new Mesh(g.base, celVC())
      const bo = new Mesh(g.base, outlineMat())
      bo.renderOrder = -1
      const lid = new Group()
      lid.position.set(0, 0.56, -0.33)
      lid.add(new Mesh(g.lid, celVC()))
      const lo = new Mesh(g.lid, outlineMat())
      lo.renderOrder = -1
      lid.add(lo)
      const glow = new Mesh(g.glow, glowVC())
      glow.visible = false
      root.add(base, bo, glow, lid)
      const open = c.state === 'open'
      const view: ChestView = {
        id: c.id, tier: c.tier, root, lid, glow, open: open ? 1 : 0, aim: open ? 1 : 0, liftT: 0, popT: -1,
        show: c.state === 'hidden' ? 0 : 1, glint: 1 + Math.random() * 3, x: c.x, z: c.z
      }
      root.visible = c.state !== 'hidden'
      this.root.add(root)
      this.chests.push(view)
    }
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  private pan(x: number): number {
    return Math.max(-1, Math.min(1, (x - this.heroX) / 9))
  }

  onEvent(e: SimEvent): void {
    switch (e.t) {
      case 'chest': this.onChest(e); break
      case 'pickup': {
        const what = e.what
        const color = what === 'mana' ? '#6ab8ff' : what === 'potion' ? '#ff6a7a' : '#7dff8a'
        // The flask flies from the chest to the hero's belt.
        this.vfx.orb(e.x, 0.9, e.z, this.heroX, 1.0, this.heroZ, 0.2, color, color, 0.45, 1.6)
        this.vfx.ring(this.heroX, this.heroZ, 0.3, 1.5, color, 0.5)
        if (what !== 'heal') {
          pushHud({ t: 'word', x: this.heroX, y: 2.2, z: this.heroZ, key: what === 'mana' ? 'level.manaPotion' : 'level.potion', kind: what === 'mana' ? 'mana' : 'heal' })
          sfx('uiEquip')
        } else sfx('heal')
        break
      }
      case 'plate': this.onPlate(e); break
      case 'door': {
        // A light leaves the last plate for the wall; the wall gives way when it lands.
        const d = this.doors.find(v => v.id === e.id)
        if (d && d.t < 0 && d.wait < 0) d.wait = DOOR_WAIT
        this.vfx.orb(this.heroX, 0.5, this.heroZ, e.x, 1.1, e.z, 0.3, '#fff2a8', '#ffd84a', DOOR_WAIT, 2.4)
        break
      }
      case 'fx':
        if (e.id === 'manaPotion') {
          this.vfx.ring(e.x, e.z, 0.3, 2.2, '#6ab8ff', 0.5)
          this.vfx.particles.riseRing(e.x, 0.1, e.z, '#8fd0ff', 0.7, this.low ? 8 : 16)
        }
        break
      case 'victory': {
        // The finale's chest is the last thing to do: a light stands on it.
        const c = this.sim.chests.find(x => x.role === 'finale')
        if (c && c.state === 'closed') this.vfx.pillar(c.x, c.z, 0.9, 7, '#ffe9a8', 3)
        break
      }
      default: break
    }
  }

  private onChest(e: Extract<SimEvent, { t: 'chest' }>): void {
    const v = this.chests.find(c => c.id === e.id)
    if (!v) return
    const p = this.pan(e.x)
    switch (e.state) {
      case 'reveal':
        v.root.visible = true
        v.show = 0.001
        this.vfx.ring(e.x, e.z, 0.2, 2.4, CHEST_RING[v.tier], 0.6)
        this.vfx.particles.riseRing(e.x, 0.2, e.z, '#ffe9a8', 0.7, this.low ? 8 : 16)
        break
      case 'opening':
        v.aim = 0.16
        v.liftT = 0
        sfx('uiOpen', p)
        break
      case 'closed':
        v.aim = 0
        break
      case 'open': {
        v.aim = 1
        v.popT = 0
        v.glow.visible = true
        const ring = CHEST_RING[v.tier]
        this.vfx.ring(e.x, e.z, 0.3, v.tier === 'wood' ? 2.6 : 3.6, ring, 0.55)
        this.vfx.ring(e.x, e.z, 0.2, 1.8, '#ffffff', 0.4)
        if (v.tier !== 'wood') this.vfx.pillar(e.x, e.z, 0.7, v.tier === 'gold' ? 7 : 4.5, ring, 0.7)
        const ps = this.vfx.particles
        const n = (v.tier === 'gold' ? 26 : v.tier === 'iron' ? 18 : 12) * (this.low ? 0.5 : 1)
        for (let k = 0; k < n; k++) {
          const a = Math.random() * Math.PI * 2
          const sp = 0.6 + Math.random() * 1.8
          ps.emit({ x: e.x, y: 0.7, z: e.z, vx: Math.cos(a) * sp, vy: 3.2 + Math.random() * 3, vz: Math.sin(a) * sp, color: k % 3 ? ring : '#ffffff', size: 0.2 + Math.random() * 0.14, sizeEnd: 0.03, life: 0.6 + Math.random() * 0.5, gravity: 7, drag: 0.6 })
        }
        sfx('chest', p)
        this.shake(v.tier === 'gold' ? 0.3 : 0.14)
        break
      }
      case 'locked':
        // Its guard still lives (or the finale stands): a red blink and a word.
        this.vfx.ring(e.x, e.z, 1.3, 0.5, '#ff4a3a', 0.4)
        pushHud({ t: 'word', x: e.x, y: 1.5, z: e.z, key: e.why === 'guard' ? 'level.guarded' : 'level.locked', kind: 'status' })
        sfx('denied', p)
        break
    }
  }

  private onPlate(e: Extract<SimEvent, { t: 'plate' }>): void {
    const v = this.plates.find(p => p.id === e.id)
    if (!v) return
    const p = this.pan(e.x)
    v.press = 1
    if (e.ok) {
      // Any plates that were lit before a restart go dark first.
      if (e.step === 1) for (const q of this.plates) q.aim = 0
      v.aim = 1
      this.vfx.ring(e.x, e.z, 0.5, 1.7, '#' + v.color.getHexString(), 0.45)
      sfx('uiPoint', p)
      if (e.solved) {
        for (const q of this.plates) {
          this.vfx.ring(q.x, q.z, 0.4, 2.4, '#ffffff', 0.6)
          this.vfx.particles.riseRing(q.x, 0.1, q.z, '#' + q.color.getHexString(), 0.6, this.low ? 6 : 12)
        }
        sfx('uiLearn')
      }
    } else {
      // Out of turn: every plate goes dark, with a soft buzz and nothing worse.
      for (const q of this.plates) q.aim = 0
      v.wrong = 1
      this.vfx.ring(e.x, e.z, 1.2, 0.5, '#ff6a5a', 0.35)
      sfx('denied', p, 0.45)
    }
  }

  // ─── The frame ─────────────────────────────────────────────────────────────

  update(dt: number, heroX: number, heroZ: number): void {
    this.time += dt
    this.heroX = heroX
    this.heroZ = heroZ
    const plan = this.plan
    if (!plan) return
    if (this.water) this.water.uniforms.uTime!.value = this.time * (this.water.userData.flow as number)

    // ── Chests ──
    for (const v of this.chests) {
      if (!v.root.visible) continue
      const look = CHEST_LOOK[v.tier]
      if (v.show < 1) v.show = Math.min(1, v.show + dt * 2.6)
      // The lid: eases to where it is going; thrown back with an overshoot.
      v.open += (v.aim - v.open) * Math.min(1, dt * (v.aim >= 1 ? 13 : 9))
      let angle = -1.95 * v.open
      let squash = 1
      if (v.popT >= 0) {
        v.popT += dt
        const k = Math.min(1, v.popT / 0.5)
        angle -= Math.sin(k * Math.PI) * 0.34 * (1 - k)
        squash = 1 + Math.sin(Math.min(1, v.popT / 0.28) * Math.PI) * 0.16
        v.glow.scale.setScalar(1 + Math.sin(this.time * 7) * 0.05)
      } else if (v.aim > 0) {
        // Something stirs inside: the lid rattles as it starts to lift.
        v.liftT += dt
        angle += Math.sin(v.liftT * 42) * 0.035
      } else {
        // Shut and waiting: a glint now and then, so it catches the eye.
        v.glint -= dt
        if (v.glint <= 0) {
          v.glint = 2.2 + Math.random() * 2.6
          const c = this.sim.chests[v.id]
          if (c && this.closedAndFree(c) && Math.hypot(v.x - heroX, v.z - heroZ) < 22) {
            this.vfx.particles.emit({ x: v.x + (Math.random() - 0.5) * 0.6, y: 0.75 + Math.random() * 0.3, z: v.z + (Math.random() - 0.5) * 0.3, vy: 0.5, color: CHEST_RING[v.tier], size: 0.34, sizeEnd: 0.02, life: 0.5 })
          }
        }
      }
      v.lid.rotation.x = angle
      const pop = v.show < 1 ? 1 + Math.sin(v.show * Math.PI) * 0.25 : 1
      const s = look.scale * (v.show < 1 ? v.show * pop : 1)
      v.root.scale.set(s / Math.sqrt(squash), s * squash, s / Math.sqrt(squash))
    }

    // ── Plates and the carved stone ──
    for (const v of this.plates) {
      v.lit += (v.aim - v.lit) * Math.min(1, dt * 10)
      if (v.press > 0) v.press = Math.max(0, v.press - dt * 3.2)
      if (v.wrong > 0) v.wrong = Math.max(0, v.wrong - dt * 2.4)
      v.root.position.y = v.gy - 0.07 * Math.sin(Math.min(1, v.press) * Math.PI)
      // Dim until it is pressed in turn; a lit plate breathes.
      const k = 0.42 + v.lit * (0.7 + 0.1 * Math.sin(this.time * 4 + v.id))
      v.mat.color.copy(v.color).multiplyScalar(k)
      v.halo.visible = v.lit > 0.02
      ;(v.halo.material as MeshBasicMaterial).opacity = v.lit * (0.6 + 0.15 * Math.sin(this.time * 4 + v.id))
      v.halo.scale.setScalar(1 + 0.05 * Math.sin(this.time * 4 + v.id))
      if (v.wrong > 0) v.mat.color.lerp(_c.set('#ff3a2a'), v.wrong * 0.7)
    }
    for (const g of this.glyphs) {
      const plate = this.plates.find(p => p.id === g.plate)
      g.lit += ((plate?.aim ?? 0) - g.lit) * Math.min(1, dt * 10)
      g.mat.color.copy(g.color).multiplyScalar(0.72 + g.lit * 0.5)
    }

    // ── Doors ──
    for (const d of this.doors) {
      if (d.wait >= 0) {
        d.wait -= dt
        if (d.wait < 0) {
          d.t = 0
          const p = this.plan?.doors.find(q => q.id === d.id)
          if (p) {
            this.vfx.ring(p.x, p.z, 0.5, 5, '#ffe9a8', 0.8)
            this.vfx.ring(p.x, p.z, 0.3, 3, '#ffffff', 0.5)
            sfx('quake', this.pan(p.x))
          }
          this.shake(0.55)
        }
      }
      if (d.t < 0 || !d.mesh.visible) continue
      d.t += dt
      this.placeRocks(d, d.t)
      for (const r of d.rocks) {
        if (r.dust || d.t < r.delay) continue
        r.dust = true
        const ps = this.vfx.particles
        for (let k = 0; k < (this.low ? 2 : 5); k++) {
          const a = Math.random() * Math.PI * 2
          ps.emit({ x: r.x + Math.cos(a) * 0.5, y: 0.3 + Math.random() * 0.8, z: r.z + Math.sin(a) * 0.5, vx: Math.cos(a) * 1.4, vy: 1 + Math.random() * 1.6, vz: Math.sin(a) * 1.4, color: '#d8d0c0', size: 0.5, sizeEnd: 1.1, life: 0.55 + Math.random() * 0.3, drag: 1.6 })
        }
        if (Math.random() < 0.3) this.shake(0.12)
      }
      if (d.t > 1.9) d.mesh.visible = d.line.visible = false
    }

    // ── What rises off lava, pools and void-water ──
    const liquid = plan.liquid
    if (liquid && liquid !== 'water' && liquid !== 'ice' && this.wetSpots.length && Math.random() < dt * (this.low ? 2 : 6)) {
      const [x, z] = this.wetSpots[Math.floor(Math.random() * this.wetSpots.length)]!
      if (Math.hypot(x - heroX, z - heroZ) < 16) {
        const hot = liquid === 'lava'
        this.vfx.particles.emit({
          x: x + (Math.random() - 0.5) * CELL, y: WATER_Y + 0.1, z: z + (Math.random() - 0.5) * CELL, vy: hot ? 1.4 + Math.random() * 1.2 : 0.5 + Math.random() * 0.5,
          color: hot ? (Math.random() < 0.5 ? '#ffb02a' : '#ff6a1a') : LIQUIDS[liquid].glint, size: hot ? 0.22 : 0.16, sizeEnd: 0.02, life: hot ? 0.9 : 1.6
        })
      }
    }

    // ── The cave's dark ──
    if (plan.caves.length) {
      const i = Math.floor(heroX / CELL)
      const j = Math.floor(heroZ / CELL)
      const inCave = i >= 0 && j >= 0 && i < plan.w && j < plan.h && plan.cave[j * plan.w + i] === 1
      this.dark = Math.max(0, Math.min(1, this.dark + (inCave ? dt : -dt) * 1.6))
      this.applyMood()
    }
  }

  private closedAndFree(c: ChestState): boolean {
    if (c.state !== 'closed') return false
    if (c.role === 'finale' && this.sim.ended !== 'victory') return false
    return !(c.guard >= 0 && !this.sim.sideGroups[c.guard]?.cleared)
  }

  /** Ease the whole lit world toward the cave's dark (one uniform write, shared by every cel material). */
  private applyMood(): void {
    if (Math.abs(this.dark - this.darkSet) < 0.004) return
    this.darkSet = this.dark
    const k = this.dark * this.dark * (3 - 2 * this.dark) * CAVE_DARK
    _c.copy(this.ambient).lerp(this.caveAmbient, k).multiplyScalar(1 - k * 0.28)
    setCelMood({ ambient: '#' + _c.getHexString(), shadowTint: this.theme.shadow })
    if (this.water) (this.water.uniforms.uAmbient!.value as Color).copy(this.water.userData.lit ? _c : _c.set('#ffffff'))
    const scene = this.scene
    if (!scene) return
    _c.copy(this.sky).lerp(this.caveSky, k)
    if (scene.background instanceof Color) scene.background.copy(_c)
    if (scene.fog instanceof Fog) scene.fog.color.copy(_c)
  }

  dispose(): void {
    // The next place sets its own mood; leave this one's as it found it.
    if (this.darkSet > 0) {
      this.dark = 0
      this.darkSet = -1
      this.applyMood()
    }
    this.scene?.remove(this.root)
    for (const g of this.owned) g.dispose()
    for (const m of this.mats) m.dispose()
    for (const d of this.doors) { d.mesh.dispose(); d.line.dispose() }
    this.chests.length = 0
    this.plates.length = 0
    this.doors.length = 0
  }
}
