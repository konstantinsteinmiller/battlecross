import {
  BufferAttribute, DoubleSide, DynamicDrawUsage, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, ShaderMaterial,
  type Scene
} from 'three'
import type { Action, Telegraph, Unit } from '../sim/types'
import { GROUND_GLSL, withGround } from './ground'

/**
 * ─── Ground attack previews ──────────────────────────────────────────────────
 *
 * The warning under an attack before it lands (roadmap #43). Two questions,
 * and the drawing answers each with a different part of itself:
 *
 *   WHERE   a crisp bright rim on a dark hairline: the exact edge of the hit,
 *           readable on grass, snow, lava and the void alike;
 *   WHEN    an inner fill that sweeps from where the blow starts to that rim
 *           and arrives on the frame it lands, with a bright leading edge;
 *           the last fifth of the wait pulses, and the landing is a flash that
 *           hands over to the hit effect.
 *
 * Lines and cones carry chevrons that run the way the blow will; a boss's
 * abilities are hatched; the enemy's are red and the hero's side's are blue
 * with a gold rim, so nobody dodges their own meteor.
 *
 * A preview is CANCELLED (it fades without a flash) when its caster dies, is
 * stunned or otherwise loses the action: the sim says nothing when that
 * happens, so the caster's action is polled.
 *
 * Every preview on screen is one instance of one quad: ONE draw call, the
 * shape cut out in the fragment shader. The quad is a fine grid whose every
 * vertex is set down on the ground's height (`gfx/ground.ts`), so a slam on
 * a hillside lies on the hill instead of cutting into it.
 */

const VERT = /* glsl */`
${GROUND_GLSL}
attribute vec4 iA;   // x, z, heading, lift
attribute vec4 iB;   // shape (0 circle, 1 cone, 2 line), radius / length, half-angle / half-width, seed
attribute vec4 iC;   // progress 0..1, flash 0..1, alpha, flags (1 hero's side, 2 boss)
varying vec2 vP;
varying vec4 vB;
varying vec4 vC;
void main() {
  vB = iB;
  vC = iC;
  float r = iB.y;
  float m = 0.35;
  vec2 half_ = vec2(r + m);
  vec2 mid = vec2(0.0);
  if (iB.x > 1.5) {
    half_ = vec2(iB.z + m, r * 0.5 + m);
    mid = vec2(0.0, r * 0.5);
  } else if (iB.x > 0.5) {
    half_ = vec2((iB.z > 1.5 ? r : r * sin(iB.z)) + m, r * 0.5 + m);
    mid = vec2(0.0, r * 0.5);
  }
  vec2 p = mid + position.xy * half_;
  vP = p;
  // Local +y runs along the heading: (sin a, cos a) on the ground.
  float s = sin(iA.z);
  float c = cos(iA.z);
  vec3 world = vec3(iA.x + p.x * c + p.y * s, iA.w, iA.y - p.x * s + p.y * c);
  world.y += groundY(world.xz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
}
`

const FRAG = /* glsl */`
uniform float uTime;
varying vec2 vP;
varying vec4 vB;
varying vec4 vC;
void main() {
  vec2 p = vP;
  float shape = vB.x;
  float r = vB.y;
  float w = vB.z;
  // d: metres to the edge (negative inside). along: 0 where the blow starts, 1 at its far edge.
  float d;
  float along;
  if (shape < 0.5) {
    float l = length(p);
    d = l - r;
    along = l / r;
  } else if (shape < 1.5) {
    float l = length(p);
    float ang = atan(abs(p.x), p.y);
    d = max(l - r, (ang - w) * max(l, 0.05));
    along = l / r;
  } else {
    vec2 q = abs(vec2(p.x, p.y - r * 0.5)) - vec2(w, r * 0.5);
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
    along = clamp(p.y / r, 0.0, 1.0);
  }
  float aa = fwidth(d) * 1.2 + 0.004;
  float inside = 1.0 - smoothstep(-aa, aa, d);
  // The flags arrive interpolated: round before reading the bits (a bare mod()
  // of 2.0 ± an epsilon flips between the two sides' colours line by line).
  float flags = floor(vC.w + 0.5);
  bool ally = fract(flags * 0.5) > 0.25;
  bool boss = flags > 1.5;
  vec3 fillCol = ally ? vec3(0.16, 0.56, 1.0) : vec3(1.0, 0.1, 0.18);
  vec3 rimCol = ally ? vec3(1.0, 0.88, 0.5) : vec3(1.0, 0.72, 0.62);
  vec3 dark = ally ? vec3(0.02, 0.07, 0.24) : vec3(0.26, 0.0, 0.05);

  float prog = vC.x;
  // The last fifth of the wait pulses.
  float late = smoothstep(0.8, 1.0, prog);
  float pulse = late * (0.5 + 0.5 * sin(uTime * 26.0));

  // The base: soft, a little fuller toward the edge.
  float base = (0.32 + 0.16 * along * along) * inside;
  vec3 col = fillCol;
  float a = base;
  if (boss) {
    // Danger hatch.
    float h = step(0.5, fract((p.x + p.y) * 1.1 + uTime * 0.35));
    a += 0.12 * h * inside;
    col = mix(col, dark, 0.45 * h);
  }
  // The sweep: eased, arriving on the edge as the blow lands.
  float f = pow(prog, 1.35);
  float swept = (1.0 - smoothstep(f - 0.012, f + 0.012, along)) * inside;
  a = mix(a, 0.58 + 0.14 * pulse, swept);
  col = mix(col, mix(fillCol, rimCol, 0.12 + 0.35 * pulse), swept);
  // Its leading edge.
  float lead = (1.0 - smoothstep(0.0, 0.035, abs(along - f))) * inside * step(0.02, prog);
  col = mix(col, rimCol, lead);
  a = max(a, lead * 0.9);
  if (shape > 0.5) {
    // Chevrons running the way the blow will go.
    float v = fract(p.y * 0.9 - uTime * 1.5 + abs(p.x) * 0.9);
    float chev = smoothstep(0.0, 0.05, v) * (1.0 - smoothstep(0.13, 0.2, v)) * inside;
    col = mix(col, rimCol, chev * 0.5);
    a += chev * 0.16;
  }
  // The rim, just inside the edge: a band of the side's own colour at full
  // strength (it is what reads on snow), a bright line down its middle (it is
  // what reads on the void), and a dark hairline outside both.
  float rw = min(0.1, 0.045 + r * 0.012);
  float band = (1.0 - smoothstep(rw - aa, rw + aa, abs(d + rw))) * inside;
  col = mix(col, fillCol, band);
  a = max(a, band);
  float hi = (1.0 - smoothstep(rw * 0.32 - aa, rw * 0.32 + aa, abs(d + rw))) * inside;
  col = mix(col, rimCol * (1.0 + 0.5 * pulse), hi);
  float halo = smoothstep(-aa, aa, d) * (1.0 - smoothstep(0.05, 0.08, d));
  col = mix(col, dark, halo);
  a = max(a, halo * 0.75);
  // The landing: the whole shape goes white-hot for a beat.
  float flash = vC.y;
  col = mix(col, vec3(1.0), flash * 0.85 * inside);
  a = max(a, flash * 0.8 * inside);
  a *= vC.z;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
`

interface Tele {
  live: boolean
  shape: number
  x: number
  z: number
  a: number
  r: number
  w: number
  flags: number
  /** Sim time it was raised at, how far in it is, and how long it runs. */
  t0: number
  t: number
  dur: number
  /** Seconds since it landed (−1: still waiting). */
  landed: number
  /** Seconds since it was cancelled (−1: it was not). */
  cancelled: number
  /** The caster, the action it began with, and how long that action must hold. */
  caster: Unit | null
  action: Action | null
  wind: number
}

const upload = (at: InstancedBufferAttribute, n: number): void => {
  at.clearUpdateRanges()
  at.addUpdateRange(0, n)
  at.needsUpdate = true
}

const FLASH = 0.16
const FADE = 0.14
/** Grid steps across a preview (a 10 m slam: a vertex every 1.4 m). */
const TESS = 16

export class Telegraphs {
  readonly mesh: Mesh
  private list: Tele[] = []
  private geo: InstancedBufferGeometry
  private mat: ShaderMaterial
  private a!: InstancedBufferAttribute
  private b!: InstancedBufferAttribute
  private c!: InstancedBufferAttribute
  private cap = 0
  private time = 0

  constructor(scene: Scene) {
    const g = new InstancedBufferGeometry()
    // A grid rather than one quad: each vertex is set down on the ground.
    const N = TESS
    const pos: number[] = []
    const idx: number[] = []
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) pos.push((i / N) * 2 - 1, (j / N) * 2 - 1, 0)
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const a = j * (N + 1) + i
        idx.push(a, a + 1, a + N + 2, a, a + N + 2, a + N + 1)
      }
    }
    g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    g.setIndex(idx)
    this.geo = g
    this.grow(24)
    this.mat = new ShaderMaterial({
      uniforms: withGround({ uTime: { value: 0 } }), vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: DoubleSide,
      // A nudge toward the camera: ground decals a few centimetres up must not cut through it.
      polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3
    })
    this.mesh = new Mesh(g, this.mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 3
    // Left visible (and empty) until the first update: the zone's warm-up
    // render then compiles its program, not the first telegraph of a fight.
    scene.add(this.mesh)
  }

  /** More room (a boss's barrage on top of a meteor shower): never drop one. */
  private grow(cap: number): void {
    this.cap = cap
    const mk = (): InstancedBufferAttribute => {
      const at = new InstancedBufferAttribute(new Float32Array(cap * 4), 4)
      at.setUsage(DynamicDrawUsage)
      return at
    }
    this.a = mk()
    this.b = mk()
    this.c = mk()
    this.geo.setAttribute('iA', this.a)
    this.geo.setAttribute('iB', this.b)
    this.geo.setAttribute('iC', this.c)
  }

  /**
   * Raise a preview. `caster` is the unit whose action it belongs to (null:
   * nobody's); `now` is the SIM's clock. The fill runs on that clock, not the
   * frame's: a hit-stop slows the sim and the effects by different amounts,
   * and the fill must still arrive exactly when the blow does.
   */
  add(t: Telegraph, caster: Unit | null, now: number): void {
    let e = this.list.find(q => !q.live)
    if (!e) {
      e = { live: false, shape: 0, x: 0, z: 0, a: 0, r: 1, w: 0, flags: 0, t0: 0, t: 0, dur: 1, landed: -1, cancelled: -1, caster: null, action: null, wind: 0 }
      this.list.push(e)
    }
    e.live = true
    e.shape = t.shape === 'circle' ? 0 : t.shape === 'cone' ? 1 : 2
    e.x = t.x
    e.z = t.z
    e.a = t.a
    e.r = t.r
    e.w = t.w
    e.flags = (t.team === 0 ? 1 : 0) + (caster && caster.rank === 'boss' ? 2 : 0)
    e.t0 = now
    e.t = 0
    e.dur = Math.max(0.05, t.dur)
    e.landed = -1
    e.cancelled = -1
    e.caster = caster
    e.action = caster ? caster.action : null
    e.wind = t.wind ?? 0
  }

  /** `dt` is the frame's effect time (pulses, fades); `now` the sim's clock (the fill). */
  update(dt: number, now: number): void {
    this.time += dt
    this.mat.uniforms.uTime!.value = this.time
    let n = 0
    for (const e of this.list) if (e.live) n++
    if (n > this.cap) this.grow(Math.max(n, this.cap * 2))
    const a = this.a.array as Float32Array
    const b = this.b.array as Float32Array
    const c = this.c.array as Float32Array
    let i = 0
    for (const e of this.list) {
      if (!e.live) continue
      if (e.cancelled >= 0) {
        e.cancelled += dt
        if (e.cancelled >= FADE) { e.live = false; continue }
      } else if (e.landed >= 0) {
        e.landed += dt
        if (e.landed >= FLASH) { e.live = false; continue }
      } else {
        // The caster fell, or lost the action it was winding up (a stun, an order).
        const u = e.caster
        if (u && (!u.alive || (e.t < e.wind - 0.02 && u.action !== e.action))) e.cancelled = 0
        else {
          e.t = Math.max(e.t, now - e.t0)
          if (e.t >= e.dur) e.landed = 0
        }
      }
      const prog = Math.min(1, e.t / e.dur)
      const flash = e.landed >= 0 ? 1 - e.landed / FLASH : 0
      const alpha = e.cancelled >= 0 ? 1 - e.cancelled / FADE : Math.min(1, e.t / 0.08 + 0.25) * (e.landed >= 0 ? 0.35 + 0.65 * flash : 1)
      const o = i * 4
      a[o] = e.x
      a[o + 1] = e.z
      a[o + 2] = e.a
      // Later instances a hair higher, so overlapping previews do not fight for depth.
      a[o + 3] = 0.07 + (i % 8) * 0.005
      b[o] = e.shape
      b[o + 1] = e.r
      b[o + 2] = e.w
      b[o + 3] = 0
      c[o] = prog
      c[o + 1] = flash
      c[o + 2] = alpha
      c[o + 3] = e.flags
      i++
    }
    this.geo.instanceCount = i
    this.mesh.visible = i > 0
    if (i === 0) return
    upload(this.a, i * 4)
    upload(this.b, i * 4)
    upload(this.c, i * 4)
  }

  clear(): void {
    for (const e of this.list) e.live = false
    this.geo.instanceCount = 0
    this.mesh.visible = false
  }

  dispose(): void {
    this.geo.dispose()
    this.mat.dispose()
    this.mesh.removeFromParent()
  }
}
