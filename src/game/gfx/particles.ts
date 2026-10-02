import {
  BufferGeometry, BufferAttribute, Points, ShaderMaterial, AdditiveBlending, Color, CustomBlending, DoubleSide,
  DynamicDrawUsage, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, OneFactor, OneMinusSrcAlphaFactor, type Texture
} from 'three'
import { glowTexture } from './textures'
import { groundAt } from './ground'

/**
 * ─── Pooled additive particles ───────────────────────────────────────────────
 *
 * ONE `Points` draw call for every spark, trail puff, muzzle flash and the
 * orb-ring death burst in the scene. A fixed-capacity pool with swap-remove
 * compaction: no allocation per particle, ever. Size is in world units and
 * attenuates with distance in the vertex shader.
 */

const VERT = /* glsl */`
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
uniform float uScale;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vAlpha = aAlpha;
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(aSize * uScale / max(0.05, -mv.z), 0.0, 256.0);
  gl_Position = projectionMatrix * mv;
}
`
const FRAG = /* glsl */`
uniform sampler2D uMap;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec4 t = texture2D(uMap, gl_PointCoord);
  gl_FragColor = vec4(vColor * t.rgb, t.a * vAlpha);
  #include <colorspace_fragment>
}
`

export interface ParticleSpec {
  x: number
  y: number
  z: number
  vx?: number
  vy?: number
  vz?: number
  color: Color | string
  size: number
  sizeEnd?: number
  life: number
  gravity?: number
  drag?: number
}

export class Particles {
  readonly points: Points
  private cap: number
  private n = 0
  private pos: Float32Array
  private col: Float32Array
  private size: Float32Array
  private alpha: Float32Array
  private vel: Float32Array
  private life: Float32Array
  private maxLife: Float32Array
  private s0: Float32Array
  private s1: Float32Array
  private grav: Float32Array
  private drag: Float32Array
  private geo: BufferGeometry
  private mat: ShaderMaterial
  private tmp = new Color()

  constructor(capacity = 900, map: Texture = glowTexture()) {
    this.cap = capacity
    this.pos = new Float32Array(capacity * 3)
    this.col = new Float32Array(capacity * 3)
    this.size = new Float32Array(capacity)
    this.alpha = new Float32Array(capacity)
    this.vel = new Float32Array(capacity * 3)
    this.life = new Float32Array(capacity)
    this.maxLife = new Float32Array(capacity)
    this.s0 = new Float32Array(capacity)
    this.s1 = new Float32Array(capacity)
    this.grav = new Float32Array(capacity)
    this.drag = new Float32Array(capacity)
    this.geo = new BufferGeometry()
    this.geo.setAttribute('position', new BufferAttribute(this.pos, 3))
    this.geo.setAttribute('aColor', new BufferAttribute(this.col, 3))
    this.geo.setAttribute('aSize', new BufferAttribute(this.size, 1))
    this.geo.setAttribute('aAlpha', new BufferAttribute(this.alpha, 1))
    this.geo.setDrawRange(0, 0)
    this.mat = new ShaderMaterial({
      uniforms: { uMap: { value: map }, uScale: { value: 600 } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending
    })
    this.points = new Points(this.geo, this.mat)
    this.points.frustumCulled = false
    this.points.renderOrder = 5
  }

  /** Pixels-per-world-unit at distance 1: viewport height / (2·tan(fov/2)). */
  setScale(viewportHeightPx: number, fovDeg: number): void {
    this.mat.uniforms.uScale!.value = viewportHeightPx / (2 * Math.tan((fovDeg * Math.PI) / 360))
  }

  get count(): number {
    return this.n
  }

  emit(s: ParticleSpec): void {
    let i: number
    if (this.n < this.cap) i = this.n++
    else i = Math.floor(Math.random() * this.cap) // pool full: recycle a random slot
    this.pos[i * 3] = s.x
    // A spec's height is over the ground under it (`gfx/ground.ts`).
    this.pos[i * 3 + 1] = s.y + groundAt(s.x, s.z)
    this.pos[i * 3 + 2] = s.z
    this.vel[i * 3] = s.vx ?? 0
    this.vel[i * 3 + 1] = s.vy ?? 0
    this.vel[i * 3 + 2] = s.vz ?? 0
    const c = typeof s.color === 'string' ? this.tmp.set(s.color) : s.color
    this.col[i * 3] = c.r
    this.col[i * 3 + 1] = c.g
    this.col[i * 3 + 2] = c.b
    this.life[i] = s.life
    this.maxLife[i] = s.life
    this.s0[i] = s.size
    this.s1[i] = s.sizeEnd ?? s.size * 0.3
    this.size[i] = s.size
    this.alpha[i] = 1
    this.grav[i] = s.gravity ?? 0
    this.drag[i] = s.drag ?? 0
  }

  update(dt: number): void {
    let i = 0
    while (i < this.n) {
      this.life[i]! -= dt
      if (this.life[i]! <= 0) {
        this.kill(i)
        continue
      }
      const k = 1 - this.life[i]! / this.maxLife[i]!
      const d = Math.max(0, 1 - this.drag[i]! * dt)
      this.vel[i * 3]! *= d
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1]! * d - this.grav[i]! * dt
      this.vel[i * 3 + 2]! *= d
      this.pos[i * 3]! += this.vel[i * 3]! * dt
      this.pos[i * 3 + 1]! += this.vel[i * 3 + 1]! * dt
      this.pos[i * 3 + 2]! += this.vel[i * 3 + 2]! * dt
      this.size[i] = this.s0[i]! + (this.s1[i]! - this.s0[i]!) * k
      this.alpha[i] = k < 0.15 ? 1 : Math.pow(1 - (k - 0.15) / 0.85, 1.3)
      i++
    }
    this.geo.setDrawRange(0, this.n)
    const a = this.geo.attributes
    a.position!.needsUpdate = true
    a.aColor!.needsUpdate = true
    a.aSize!.needsUpdate = true
    a.aAlpha!.needsUpdate = true
  }

  private kill(i: number): void {
    const last = --this.n
    if (i === last) return
    const copy = (arr: Float32Array, w: number) => {
      for (let c = 0; c < w; c++) arr[i * w + c] = arr[last * w + c]!
    }
    copy(this.pos, 3)
    copy(this.col, 3)
    copy(this.vel, 3)
    copy(this.size, 1)
    copy(this.alpha, 1)
    copy(this.life, 1)
    copy(this.maxLife, 1)
    copy(this.s0, 1)
    copy(this.s1, 1)
    copy(this.grav, 1)
    copy(this.drag, 1)
  }

  clear(): void {
    this.n = 0
    this.geo.setDrawRange(0, 0)
  }

  dispose(): void {
    this.geo.dispose()
    this.mat.dispose()
  }

  // ─── Presets ───────────────────────────────────────────────────────────────

  sparks(x: number, y: number, z: number, color: string, n = 10, speed = 6, size = 0.18): void {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2
      const e = (Math.random() - 0.3) * Math.PI * 0.6
      const sp = speed * (0.4 + Math.random() * 0.8)
      this.emit({
        x, y, z,
        vx: Math.cos(a) * Math.cos(e) * sp, vy: Math.sin(e) * sp + 1.5, vz: Math.sin(a) * Math.cos(e) * sp,
        color, size: size * (0.7 + Math.random() * 0.6), sizeEnd: 0.02, life: 0.25 + Math.random() * 0.3, gravity: 9, drag: 2
      })
    }
  }

  /** Soft expanding flash (muzzle, impact). */
  flash(x: number, y: number, z: number, color: string, size = 0.9, life = 0.12): void {
    this.emit({ x, y, z, color, size, sizeEnd: size * 1.6, life })
  }

  /**
   * The classic robot death: two rings of glowing orbs (one flat, one upright)
   * drifting outward and fading, plus a white core pop. Instantly recognisable.
   */
  orbBurst(x: number, y: number, z: number, color: string, scale = 1): void {
    this.flash(x, y, z, '#ffffff', 1.6 * scale, 0.18)
    this.flash(x, y, z, color, 2.4 * scale, 0.32)
    const n = 8
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2
      const sp = 3.2 * scale
      this.emit({ x, y, z, vx: Math.cos(a) * sp, vy: 0, vz: Math.sin(a) * sp, color, size: 0.55 * scale, sizeEnd: 0.4 * scale, life: 0.75, drag: 0.6 })
      this.emit({ x, y, z, vx: Math.cos(a) * sp * 0.7, vy: Math.sin(a) * sp * 0.7, vz: 0, color: '#ffffff', size: 0.38 * scale, sizeEnd: 0.2 * scale, life: 0.65, drag: 0.6 })
    }
    this.sparks(x, y, z, color, 12, 7, 0.16 * scale)
  }

  /** Rising ring of motes (level up, pickups, beam). */
  riseRing(x: number, y: number, z: number, color: string, r = 0.8, n = 16): void {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2
      this.emit({ x: x + Math.cos(a) * r, y, z: z + Math.sin(a) * r, vy: 2.5 + Math.random() * 1.5, color, size: 0.22, sizeEnd: 0.05, life: 0.9 })
    }
  }
}

// ─── Sprites: shaped, stretched, turned ─────────────────────────────────────
//
// What a round soft dot cannot say: a spark that is a STREAK along the way it
// flies, the cut mark of a blade, the star of a blunt blow, a needle, a shard
// of ice, a bubble of venom. One instanced draw call for all of them; every
// shape is drawn in the fragment shader from the quad's own coordinates, so
// there is no texture to load and a shape is crisp at any size.
//
// A sprite either faces the camera at an angle (`rot`), or is ALIGNED: its
// long axis follows its velocity as the camera sees it, and it stretches with
// its speed. Colours are premultiplied, and `add` slides a sprite from plain
// alpha (0: dust, dark shadow-stuff) to additive (1: light).

export const SHAPE = {
  streak: 0, star: 1, slash: 2, ring: 3, needle: 4, shard: 5, bolt: 6, bubble: 7, cross: 8, puff: 9, claw: 10, dot: 11
} as const
export type Shape = (typeof SHAPE)[keyof typeof SHAPE]

const SPRITE_VERT = /* glsl */`
attribute vec4 iPos;    // xyz, w = length in metres
attribute vec4 iDir;    // xyz = world direction to align to (zero: use the angle), w = angle
attribute vec4 iColor;  // rgb, a
attribute vec4 iMisc;   // shape, aspect (width / length), additive 0..1, age 0..1
varying vec2 vUv;
varying vec4 vColor;
varying vec3 vMisc;
void main() {
  vUv = position.xy;
  vColor = iColor;
  vMisc = iMisc.xzw;
  vec4 mv = modelViewMatrix * vec4(iPos.xyz, 1.0);
  vec2 ax = vec2(cos(iDir.w), sin(iDir.w));
  if (dot(iDir.xyz, iDir.xyz) > 1e-6) {
    // The long axis follows the direction of travel as the camera sees it.
    vec2 d = (modelViewMatrix * vec4(iDir.xyz, 0.0)).xy;
    float l = length(d);
    if (l > 1e-5) ax = d / l;
  }
  vec2 up = vec2(-ax.y, ax.x);
  mv.xy += (ax * position.x + up * position.y * iMisc.y) * iPos.w * 0.5;
  gl_Position = projectionMatrix * mv;
}
`
const SPRITE_FRAG = /* glsl */`
varying vec2 vUv;
varying vec4 vColor;
varying vec3 vMisc;
void main() {
  vec2 p = vUv;
  float shape = vMisc.x;
  float age = vMisc.z;
  float r = length(p);
  float a = 0.0;
  // How much of the sprite is its white-hot core.
  float core = 0.0;
  if (shape < 0.5) {
    // Streak: a lens along x, brightest at the head.
    float w = 0.9 * (1.0 - p.x * p.x);
    a = smoothstep(w, w * 0.25, abs(p.y)) * step(abs(p.x), 1.0);
    core = smoothstep(w * 0.45, 0.0, abs(p.y)) * smoothstep(-0.6, 0.8, p.x);
  } else if (shape < 1.5) {
    // Four-point star.
    float d = sqrt(abs(p.x)) + sqrt(abs(p.y));
    a = smoothstep(1.0, 0.86, d);
    core = smoothstep(0.7, 0.45, d);
  } else if (shape < 2.5) {
    // The cut a blade leaves: a thin hard-edged lens.
    float w = 0.2 * (1.0 - p.x * p.x);
    a = smoothstep(w, w * 0.8, abs(p.y)) * step(abs(p.x), 1.0);
    core = smoothstep(w * 0.5, w * 0.3, abs(p.y));
  } else if (shape < 3.5) {
    // A ring that thins as it ages.
    float w = mix(0.2, 0.04, age);
    a = smoothstep(w, w * 0.6, abs(r - (1.0 - w)));
    core = smoothstep(w * 0.4, 0.0, abs(r - (1.0 - w)));
  } else if (shape < 4.5) {
    // Needle: a long thin diamond.
    a = smoothstep(0.0, 0.03, 0.12 * (1.0 - abs(p.x)) - abs(p.y));
    core = smoothstep(0.0, 0.02, 0.05 * (1.0 - abs(p.x)) - abs(p.y));
  } else if (shape < 5.5) {
    // Shard: a six-armed crystal.
    float t = atan(p.y, p.x);
    float arm = pow(abs(cos(t * 3.0)), 7.0);
    float edge = 0.2 + 0.8 * arm;
    a = smoothstep(edge, edge * 0.82, r);
    core = smoothstep(edge * 0.5, edge * 0.2, r);
  } else if (shape < 6.5) {
    // Bolt: a zigzag.
    float z = abs(fract(p.x * 1.5 + 0.25) - 0.5) * 2.0 - 0.5;
    float y = p.y - z * 0.5 * (1.0 - abs(p.x));
    float w = 0.16 * (1.0 - abs(p.x) * 0.6);
    a = smoothstep(w, w * 0.6, abs(y)) * step(abs(p.x), 1.0);
    core = smoothstep(w * 0.45, 0.0, abs(y));
  } else if (shape < 7.5) {
    // Bubble: a thin ring and a highlight.
    a = smoothstep(0.14, 0.07, abs(r - 0.84)) + smoothstep(0.2, 0.1, length(p - vec2(-0.32, 0.36))) + 0.18 * step(r, 0.84);
    core = smoothstep(0.2, 0.1, length(p - vec2(-0.32, 0.36)));
  } else if (shape < 8.5) {
    // Cross: a plus with tapered arms.
    float ax2 = min(abs(p.x), abs(p.y));
    float len = max(abs(p.x), abs(p.y));
    float w = 0.2 * (1.0 - len * 0.7);
    a = smoothstep(w, w * 0.7, ax2) * step(len, 1.0);
    core = smoothstep(w * 0.5, 0.0, ax2);
  } else if (shape < 9.5) {
    // Puff: a soft cloud, no core.
    a = smoothstep(1.0, 0.25, r) * 0.75;
  } else if (shape < 10.5) {
    // Claw: a crescent.
    float o = length(p - vec2(0.0, 0.42));
    a = smoothstep(1.0, 0.94, r) * smoothstep(0.86, 0.94, o) * step(p.y, 0.3);
    core = a * smoothstep(0.98, 0.9, o);
  } else {
    // Dot: a soft glow.
    a = smoothstep(1.0, 0.0, r);
    a *= a;
    core = smoothstep(0.45, 0.0, r);
  }
  a = clamp(a, 0.0, 1.0) * vColor.a;
  vec3 col = mix(vColor.rgb, vec3(1.0), clamp(core, 0.0, 1.0) * vMisc.y);
  gl_FragColor = vec4(col * a, a * (1.0 - vMisc.y));
  #include <colorspace_fragment>
}
`

export interface SpriteSpec {
  x: number
  y: number
  z: number
  vx?: number
  vy?: number
  vz?: number
  color: Color | string
  /** Length in metres (the long side), and what it ends at. */
  size: number
  sizeEnd?: number
  /** Width as a share of the length (1 = square). */
  aspect?: number
  life: number
  shape: Shape
  /** Angle on screen, radians, and its turn rate. Ignored when `align` is on. */
  rot?: number
  spin?: number
  /** Long axis along the velocity; `stretch` adds length per m/s of speed. */
  align?: boolean
  stretch?: number
  /** A fixed world direction to lie along instead (a cut mark across a blow). */
  dx?: number
  dy?: number
  dz?: number
  gravity?: number
  drag?: number
  /** 1 = light (additive), 0 = matter (plain alpha). Default 1. */
  add?: number
  /** Hold full strength this long (0..1 of life) before fading. Default 0.25. */
  hold?: number
}

export class Sprites {
  readonly mesh: Mesh
  private cap: number
  private n = 0
  private pos: Float32Array
  private dir: Float32Array
  private col: Float32Array
  private misc: Float32Array
  private vel: Float32Array
  private life: Float32Array
  private maxLife: Float32Array
  private s0: Float32Array
  private s1: Float32Array
  private grav: Float32Array
  private drag: Float32Array
  private spin: Float32Array
  private stretch: Float32Array
  private hold: Float32Array
  /** 0 angle, 1 velocity-aligned, 2 fixed direction. */
  private mode: Uint8Array
  private attrs: InstancedBufferAttribute[]
  private geo: InstancedBufferGeometry
  private tmp = new Color()

  constructor(capacity = 320) {
    this.cap = capacity
    const f = (w: number): Float32Array => new Float32Array(capacity * w)
    this.pos = f(4)
    this.dir = f(4)
    this.col = f(4)
    this.misc = f(4)
    this.vel = f(3)
    this.life = f(1)
    this.maxLife = f(1)
    this.s0 = f(1)
    this.s1 = f(1)
    this.grav = f(1)
    this.drag = f(1)
    this.spin = f(1)
    this.stretch = f(1)
    this.hold = f(1)
    this.mode = new Uint8Array(capacity)
    const g = new InstancedBufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3))
    g.setIndex([0, 1, 2, 0, 2, 3])
    this.attrs = [this.pos, this.dir, this.col, this.misc].map((arr) => {
      const a = new InstancedBufferAttribute(arr, 4)
      a.setUsage(DynamicDrawUsage)
      return a
    })
    g.setAttribute('iPos', this.attrs[0]!)
    g.setAttribute('iDir', this.attrs[1]!)
    g.setAttribute('iColor', this.attrs[2]!)
    g.setAttribute('iMisc', this.attrs[3]!)
    g.instanceCount = 0
    this.geo = g
    const m = new ShaderMaterial({
      vertexShader: SPRITE_VERT, fragmentShader: SPRITE_FRAG, transparent: true, depthWrite: false, side: DoubleSide,
      blending: CustomBlending, blendSrc: OneFactor, blendDst: OneMinusSrcAlphaFactor
    })
    this.mesh = new Mesh(g, m)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 8
    // Left visible (and empty) until the first update, so the zone's warm-up
    // render compiles its program rather than the first blow of a fight.
  }

  get count(): number {
    return this.n
  }

  emit(s: SpriteSpec): void {
    let i: number
    if (this.n < this.cap) i = this.n++
    else i = Math.floor(Math.random() * this.cap) // pool full: recycle a random slot
    const i4 = i * 4
    this.pos[i4] = s.x
    this.pos[i4 + 1] = s.y + groundAt(s.x, s.z)
    this.pos[i4 + 2] = s.z
    this.pos[i4 + 3] = s.size
    this.vel[i * 3] = s.vx ?? 0
    this.vel[i * 3 + 1] = s.vy ?? 0
    this.vel[i * 3 + 2] = s.vz ?? 0
    const fixed = s.dx !== undefined || s.dy !== undefined || s.dz !== undefined
    this.mode[i] = fixed ? 2 : s.align ? 1 : 0
    this.dir[i4] = fixed ? (s.dx ?? 0) : s.align ? (s.vx ?? 0) : 0
    this.dir[i4 + 1] = fixed ? (s.dy ?? 0) : s.align ? (s.vy ?? 0) : 0
    this.dir[i4 + 2] = fixed ? (s.dz ?? 0) : s.align ? (s.vz ?? 0) : 0
    this.dir[i4 + 3] = s.rot ?? 0
    const c = typeof s.color === 'string' ? this.tmp.set(s.color) : s.color
    this.col[i4] = c.r
    this.col[i4 + 1] = c.g
    this.col[i4 + 2] = c.b
    this.col[i4 + 3] = 1
    this.misc[i4] = s.shape
    this.misc[i4 + 1] = s.aspect ?? 1
    this.misc[i4 + 2] = s.add ?? 1
    this.misc[i4 + 3] = 0
    this.life[i] = s.life
    this.maxLife[i] = s.life
    this.s0[i] = s.size
    this.s1[i] = s.sizeEnd ?? s.size
    this.grav[i] = s.gravity ?? 0
    this.drag[i] = s.drag ?? 0
    this.spin[i] = s.spin ?? 0
    this.stretch[i] = s.stretch ?? 0
    this.hold[i] = s.hold ?? 0.25
  }

  update(dt: number): void {
    let i = 0
    while (i < this.n) {
      this.life[i] = this.life[i]! - dt
      if (this.life[i]! <= 0) {
        this.kill(i)
        continue
      }
      const k = 1 - this.life[i]! / this.maxLife[i]!
      const i3 = i * 3
      const i4 = i * 4
      const d = Math.max(0, 1 - this.drag[i]! * dt)
      const vx = (this.vel[i3] = this.vel[i3]! * d)
      const vy = (this.vel[i3 + 1] = this.vel[i3 + 1]! * d - this.grav[i]! * dt)
      const vz = (this.vel[i3 + 2] = this.vel[i3 + 2]! * d)
      this.pos[i4] = this.pos[i4]! + vx * dt
      this.pos[i4 + 1] = this.pos[i4 + 1]! + vy * dt
      this.pos[i4 + 2] = this.pos[i4 + 2]! + vz * dt
      let size = this.s0[i]! + (this.s1[i]! - this.s0[i]!) * k
      if (this.mode[i] === 1) {
        this.dir[i4] = vx
        this.dir[i4 + 1] = vy
        this.dir[i4 + 2] = vz
        size += Math.sqrt(vx * vx + vy * vy + vz * vz) * this.stretch[i]!
      } else if (this.mode[i] === 0) {
        this.dir[i4 + 3] = this.dir[i4 + 3]! + this.spin[i]! * dt
      }
      this.pos[i4 + 3] = size
      const h = this.hold[i]!
      this.col[i4 + 3] = k < h ? 1 : Math.pow(1 - (k - h) / (1 - h), 1.4)
      this.misc[i4 + 3] = k
      i++
    }
    this.geo.instanceCount = this.n
    this.mesh.visible = this.n > 0
    if (this.n === 0) return
    for (const a of this.attrs) {
      a.clearUpdateRanges()
      a.addUpdateRange(0, this.n * 4)
      a.needsUpdate = true
    }
  }

  private kill(i: number): void {
    const last = --this.n
    if (i === last) return
    const copy = (arr: Float32Array | Uint8Array, w: number): void => {
      for (let c = 0; c < w; c++) arr[i * w + c] = arr[last * w + c]!
    }
    copy(this.pos, 4)
    copy(this.dir, 4)
    copy(this.col, 4)
    copy(this.misc, 4)
    copy(this.vel, 3)
    for (const arr of [this.life, this.maxLife, this.s0, this.s1, this.grav, this.drag, this.spin, this.stretch, this.hold]) copy(arr, 1)
    copy(this.mode, 1)
  }

  clear(): void {
    this.n = 0
    this.geo.instanceCount = 0
    this.mesh.visible = false
  }

  dispose(): void {
    this.geo.dispose()
    ;(this.mesh.material as ShaderMaterial).dispose()
  }
}
