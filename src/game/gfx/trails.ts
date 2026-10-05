import {
  BufferAttribute, BufferGeometry, Color, CustomBlending, DoubleSide, DynamicDrawUsage, Mesh, OneFactor,
  OneMinusSrcAlphaFactor, ShaderMaterial, Vector3, type Bone, type Scene
} from 'three'
import type { RigView } from './rigs'

/**
 * ─── Swing trails ────────────────────────────────────────────────────────────
 *
 * The ribbon a weapon leaves through the air (roadmap #39): every melee swing
 * by anyone, read off the `weapon` bone AFTER the rig has been posed, so the
 * arc on screen is the arc the blade really travelled.
 *
 * ONE mesh and one draw call for every trail in the scene. A trail is a short
 * ring of samples — the cutting edge's inner and outer end, and its age —
 * re-tessellated each frame through a Catmull-Rom curve into a strip, so three
 * frames of a fast strike still draw a round arc. The fragment shader paints
 * it as a cel swoosh: a hot white core along the outer edge, the weapon's
 * colour behind it, an inner edge that climbs toward the tip as the ribbon
 * ages (the taper), two tones and no gradients.
 *
 * Fixed pools: `cap` trails of `MAX_PTS` samples; a swing past the cap takes
 * over the oldest trail instead of growing anything.
 *
 * Every weapon cuts the air its own way (#74, `TRAIL_STYLES`): a dagger a
 * thin quick flick, a sword the classic swoosh, a greatsword a wide ribbon
 * that lingers with a second line of light in it, an axe a heavy crescent, a
 * club or a hammer a soft smear with no edge, a scythe a long ghostly arc, a
 * staff a soft glow, claws and jaws three parallel strands.
 */

/** How one kind of weapon draws its swing. */
export interface TrailStyle {
  /** Seconds a sample lives (a heavy swing lingers 40 % longer). */
  life: number
  /** The white core along the outer edge (0 none, 1 the classic). */
  core: number
  /** The darker line along both edges (what draws the swoosh on snow). */
  ink: number
  /** Parallel strands across the ribbon (0: one ribbon; 3: claw marks). */
  strands: number
  /** 0 hard-edged, 1 a soft smear. */
  soft: number
  /** A second bright line through the middle of the ribbon. */
  flare: number
  /** Where the ribbon starts along the weapon (0 the hand, 1 the tip); unset: the weapon's own. */
  edge?: number
  /** A colour the weapon's colour is pulled toward, and how far. */
  tint?: string
  tintK?: number
  /** What flies off the edge: sparks, dust, wisps of dark, motes, nothing. */
  spark: 'blade' | 'blunt' | 'dark' | 'magic' | 'none'
}

export const TRAIL_STYLES = {
  sword: { life: 0.19, core: 1, ink: 0.8, strands: 0, soft: 0, flare: 0, spark: 'blade' },
  dagger: { life: 0.12, core: 1.2, ink: 0.6, strands: 0, soft: 0, flare: 0, edge: 0.6, spark: 'blade' },
  greatsword: { life: 0.28, core: 1, ink: 1, strands: 0, soft: 0, flare: 0.9, edge: 0.22, spark: 'blade' },
  axe: { life: 0.22, core: 1.1, ink: 1, strands: 0, soft: 0.15, flare: 0, edge: 0.55, spark: 'blade' },
  blunt: { life: 0.2, core: 0.35, ink: 0.2, strands: 0, soft: 1, flare: 0, edge: 0.5, tint: '#f0e8d8', tintK: 0.45, spark: 'blunt' },
  scythe: { life: 0.32, core: 0.6, ink: 1.2, strands: 0, soft: 0.3, flare: 0.5, edge: 0.55, tint: '#6a3aa0', tintK: 0.45, spark: 'dark' },
  magic: { life: 0.24, core: 0.8, ink: 0.3, strands: 0, soft: 0.8, flare: 0.6, tint: '#ffffff', tintK: 0.2, spark: 'magic' },
  claw: { life: 0.14, core: 0.9, ink: 0.8, strands: 3, soft: 0, flare: 0, edge: 0.3, spark: 'none' }
} satisfies Record<string, TrailStyle>

/** The style of `v`'s swing (its off hand's when `off`). */
export const trailStyleOf = (v: Pick<RigView, 'family' | 'held' | 'off'>, off = false): TrailStyle => {
  if (v.family !== 'humanoid' && v.family !== 'naga') return TRAIL_STYLES.claw
  if (off) return v.off === 'dagger' ? TRAIL_STYLES.dagger : TRAIL_STYLES.blunt
  switch (v.held) {
    case 'dagger': return TRAIL_STYLES.dagger
    case 'greatsword': return TRAIL_STYLES.greatsword
    case 'axe': return TRAIL_STYLES.axe
    case 'hammer':
    case 'club':
    case 'none':
    case 'cannon':
      return TRAIL_STYLES.blunt
    case 'scythe': return TRAIL_STYLES.scythe
    case 'staff':
    case 'wand':
      return TRAIL_STYLES.magic
    default: return TRAIL_STYLES.sword
  }
}

const MAX_PTS = 14
/** Floats per sample: base xyz, tip xyz, age. */
const STRIDE = 7

const VERT = /* glsl */`
attribute vec2 aUv;
attribute vec4 aColor;
attribute vec4 aStyle;
attribute float aFlare;
varying vec2 vUv;
varying vec4 vColor;
varying vec4 vStyle;
varying float vFlare;
void main() {
  vUv = aUv;
  vColor = aColor;
  vStyle = aStyle;
  vFlare = aFlare;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const FRAG = /* glsl */`
varying vec2 vUv;
varying vec4 vColor;
varying vec4 vStyle;
varying float vFlare;
void main() {
  // x: 0 at the blade now, 1 at the oldest sample. y: 0 inner edge, 1 the tip.
  float u = vUv.x;
  float w = vUv.y;
  float soft = vStyle.w;
  // The taper: the inner edge climbs toward the tip as the ribbon ages.
  float inner = 0.9 * pow(u, 0.75);
  float hard = smoothstep(inner, inner + 0.1, w) * smoothstep(1.0, 0.95, w);
  // A smear (a club, a staff): soft at both edges, no line to it.
  float smear = smoothstep(inner - 0.05, inner + 0.45, w) * smoothstep(1.0, 0.72, w);
  float body = mix(hard, smear, soft);
  // Claws: parallel strands across the ribbon.
  if (vStyle.z > 0.5) {
    float s = abs(fract(w * vStyle.z) - 0.5) * 2.0;
    body *= smoothstep(0.8, 0.4, s);
  }
  // Two tones: a white core hugging the outer edge, the colour behind it.
  float core = smoothstep(0.62, 0.7, w - u * 0.25) * (1.0 - smoothstep(0.35, 0.8, u)) * vStyle.x;
  // A second line of light through the middle (a greatsword, a scythe, a staff).
  core = max(core, vFlare * smoothstep(0.07, 0.0, abs(w - 0.5 - u * 0.15)) * (1.0 - smoothstep(0.2, 0.75, u)));
  core = clamp(core, 0.0, 1.0);
  float fade = 1.0 - smoothstep(0.55, 1.0, u);
  // A darker line of the same colour along both edges: on snow, where a white
  // core is white on white, it is the edges that draw the swoosh.
  float ink = max(smoothstep(0.93, 0.97, w), 1.0 - smoothstep(inner + 0.06, inner + 0.16, w)) * (1.0 - core) * min(1.0, vStyle.y) * (1.0 - soft);
  vec3 col = mix(mix(vColor.rgb, vColor.rgb * 0.45, ink * 0.8), vec3(1.0), core);
  float a = body * fade * vColor.a * mix(0.8, 1.0, max(core, ink));
  // Premultiplied, a little additive: it glows on dark ground and still covers on snow.
  gl_FragColor = vec4(col * a, a * mix(0.85, 1.0, ink));
  #include <colorspace_fragment>
}
`

interface Trail {
  key: number
  live: boolean
  /** Still being fed this frame. */
  fed: boolean
  /** Samples, newest LAST. */
  pts: Float32Array
  n: number
  life: number
  gain: number
  r: number
  g: number
  b: number
  born: number
  style: TrailStyle
}

/** Send only the part of a dynamic buffer that is in use. */
const upload = (a: BufferAttribute, n: number): void => {
  a.clearUpdateRanges()
  a.addUpdateRange(0, n)
  a.needsUpdate = true
}

const _base = new Vector3()
const _tip = new Vector3()
const _c = new Color()
const _tint = new Color()
const _hsl = { h: 0, s: 0, l: 0 }

/** Catmull-Rom through p1..p2 (p0, p3 are the neighbours). */
const cr = (p0: number, p1: number, p2: number, p3: number, t: number): number => {
  const t2 = t * t
  const t3 = t2 * t
  return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (3 * p1 - p0 - 3 * p2 + p3) * t3)
}

export class Trails {
  readonly mesh: Mesh
  private trails: Trail[] = []
  private pos: BufferAttribute
  private uv: BufferAttribute
  private col: BufferAttribute
  private sty: BufferAttribute
  private flare: BufferAttribute
  private index: BufferAttribute
  private sub: number
  private clock = 0

  constructor(scene: Scene, low = false) {
    const cap = low ? 10 : 22
    this.sub = low ? 2 : 4
    for (let i = 0; i < cap; i++) {
      this.trails.push({ key: 0, live: false, fed: false, pts: new Float32Array(MAX_PTS * STRIDE), n: 0, life: 0.2, gain: 1, r: 1, g: 1, b: 1, born: 0, style: TRAIL_STYLES.sword })
    }
    const sections = (MAX_PTS - 1) * this.sub + 1
    const verts = cap * sections * 2
    this.pos = new BufferAttribute(new Float32Array(verts * 3), 3)
    this.uv = new BufferAttribute(new Float32Array(verts * 2), 2)
    this.col = new BufferAttribute(new Float32Array(verts * 4), 4)
    this.sty = new BufferAttribute(new Float32Array(verts * 4), 4)
    this.flare = new BufferAttribute(new Float32Array(verts), 1)
    this.index = new BufferAttribute(new Uint16Array(cap * (sections - 1) * 6), 1)
    for (const a of [this.pos, this.uv, this.col, this.sty, this.flare, this.index]) a.setUsage(DynamicDrawUsage)
    const g = new BufferGeometry()
    g.setAttribute('position', this.pos)
    g.setAttribute('aUv', this.uv)
    g.setAttribute('aColor', this.col)
    g.setAttribute('aStyle', this.sty)
    g.setAttribute('aFlare', this.flare)
    g.setIndex(this.index)
    g.setDrawRange(0, 0)
    const m = new ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: DoubleSide,
      blending: CustomBlending, blendSrc: OneFactor, blendDst: OneMinusSrcAlphaFactor
    })
    this.mesh = new Mesh(g, m)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 7
    scene.add(this.mesh)
  }

  private slot(key: number): Trail {
    let free: Trail | null = null
    let oldest = this.trails[0]!
    for (const t of this.trails) {
      if (t.live && t.key === key && t.fed) return t
      if (!t.live) free ??= t
      else if (t.born < oldest.born || !oldest.live) oldest = t
    }
    const t = free ?? oldest
    t.live = true
    t.fed = true
    t.key = key
    t.n = 0
    t.gain = 1
    t.born = this.clock
    return t
  }

  /**
   * Feed one frame of a swing. Call AFTER the rig is posed. `key` names the
   * swinging thing (a unit and a hand); `k` is the pose's trail strength
   * (0 ends the trail: what is drawn fades out on its own).
   */
  feed(key: number, v: RigView, off: boolean, k: number, color: string, heavy: boolean): void {
    if (k <= 0.02) { this.release(key); return }
    const bone: Bone | undefined = v.rig.bones[off ? v.trailOffBone : v.trailBone]
    if (!bone) return
    v.rig.root.updateMatrixWorld(true)
    const style = trailStyleOf(v, off)
    const reach = off ? v.offReach : v.reach
    const edge = style.edge ?? (off ? 0.1 : v.edge)
    const m = bone.matrixWorld
    _tip.set(0, 0, reach * (heavy ? 1.08 : 1)).applyMatrix4(m)
    _base.set(0, 0, reach * edge).applyMatrix4(m)
    const t = this.slot(key)
    t.style = style
    // Vivid whatever it was given: a pale weapon colour would vanish on a pale ground.
    _c.set(color)
    if (style.tint) _c.lerp(_tint.set(style.tint), style.tintK ?? 0.5)
    _c.getHSL(_hsl)
    _c.setHSL(_hsl.h, Math.min(1, _hsl.s * 1.35 + 0.1), Math.min(0.62, Math.max(0.5, _hsl.l)))
    t.r = _c.r
    t.g = _c.g
    t.b = _c.b
    // A heavy blow leaves a longer one.
    t.life = style.life * (heavy ? 1.4 : 1)
    const p = t.pts
    if (t.n > 0) {
      const o = (t.n - 1) * STRIDE
      const d = Math.abs(p[o + 3]! - _tip.x) + Math.abs(p[o + 4]! - _tip.y) + Math.abs(p[o + 5]! - _tip.z)
      // Barely moved (a hit-stop, a hold): keep the head on the blade, add nothing.
      if (d < 0.03) {
        p[o] = _base.x; p[o + 1] = _base.y; p[o + 2] = _base.z
        p[o + 3] = _tip.x; p[o + 4] = _tip.y; p[o + 5] = _tip.z
        p[o + 6] = 0
        return
      }
    }
    if (t.n === MAX_PTS) {
      p.copyWithin(0, STRIDE)
      t.n--
    }
    const o = t.n * STRIDE
    p[o] = _base.x; p[o + 1] = _base.y; p[o + 2] = _base.z
    p[o + 3] = _tip.x; p[o + 4] = _tip.y; p[o + 5] = _tip.z
    p[o + 6] = 0
    t.n++
  }

  /** The swing is over (or was cancelled): stop feeding, let it fade. */
  release(key: number): void {
    for (const t of this.trails) if (t.live && t.fed && t.key === key) t.fed = false
  }

  /** Dim a swing's trail (a whiff: the blade met nothing). */
  dim(key: number, gain: number): void {
    for (const t of this.trails) if (t.live && t.key === key) t.gain = Math.min(t.gain, gain)
  }

  update(dt: number): void {
    this.clock += dt
    const pos = this.pos.array as Float32Array
    const uv = this.uv.array as Float32Array
    const col = this.col.array as Float32Array
    const sty = this.sty.array as Float32Array
    const fl = this.flare.array as Float32Array
    const idx = this.index.array as Uint16Array
    const sub = this.sub
    let nv = 0
    let ni = 0
    for (const t of this.trails) {
      if (!t.live) continue
      const p = t.pts
      // Age, and drop what has faded off the tail.
      let dead = 0
      for (let i = 0; i < t.n; i++) {
        const age = (p[i * STRIDE + 6] = p[i * STRIDE + 6]! + dt)
        if (age >= t.life) dead = i + 1
      }
      // The newest sample of a trail still being fed is the blade itself: no age.
      if (dead > 0) {
        if (dead >= t.n) { t.n = 0 } else {
          p.copyWithin(0, dead * STRIDE, t.n * STRIDE)
          t.n -= dead
        }
      }
      // Faded out (or its unit left the view without a goodbye): the slot is free again.
      if (t.n === 0) { t.live = false; continue }
      if (t.n < 2) continue
      const first = nv
      const last = t.n - 1
      for (let i = 0; i < last; i++) {
        const i0 = Math.max(0, i - 1) * STRIDE
        const i1 = i * STRIDE
        const i2 = (i + 1) * STRIDE
        const i3 = Math.min(last, i + 2) * STRIDE
        const steps = i === last - 1 ? sub + 1 : sub
        for (let s = 0; s < steps; s++) {
          const k = s / sub
          const age = p[i1 + 6]! + (p[i2 + 6]! - p[i1 + 6]!) * k
          const u = Math.min(1, age / t.life)
          for (let e = 0; e < 2; e++) {
            const c = e * 3
            pos[nv * 3] = cr(p[i0 + c]!, p[i1 + c]!, p[i2 + c]!, p[i3 + c]!, k)
            pos[nv * 3 + 1] = cr(p[i0 + c + 1]!, p[i1 + c + 1]!, p[i2 + c + 1]!, p[i3 + c + 1]!, k)
            pos[nv * 3 + 2] = cr(p[i0 + c + 2]!, p[i1 + c + 2]!, p[i2 + c + 2]!, p[i3 + c + 2]!, k)
            uv[nv * 2] = u
            uv[nv * 2 + 1] = e
            col[nv * 4] = t.r
            col[nv * 4 + 1] = t.g
            col[nv * 4 + 2] = t.b
            col[nv * 4 + 3] = t.gain
            sty[nv * 4] = t.style.core
            sty[nv * 4 + 1] = t.style.ink
            sty[nv * 4 + 2] = t.style.strands
            sty[nv * 4 + 3] = t.style.soft
            fl[nv] = t.style.flare
            nv++
          }
        }
      }
      for (let q = first; q + 3 < nv; q += 2) {
        idx[ni++] = q
        idx[ni++] = q + 1
        idx[ni++] = q + 2
        idx[ni++] = q + 1
        idx[ni++] = q + 3
        idx[ni++] = q + 2
      }
    }
    this.mesh.geometry.setDrawRange(0, ni)
    this.mesh.visible = ni > 0
    if (ni === 0) return
    upload(this.pos, nv * 3)
    upload(this.uv, nv * 2)
    upload(this.col, nv * 4)
    upload(this.sty, nv * 4)
    upload(this.flare, nv)
    upload(this.index, ni)
  }

  clear(): void {
    for (const t of this.trails) { t.live = false; t.n = 0 }
    this.mesh.geometry.setDrawRange(0, 0)
  }

  dispose(): void {
    this.mesh.geometry.dispose()
    ;(this.mesh.material as ShaderMaterial).dispose()
    this.mesh.removeFromParent()
  }
}
