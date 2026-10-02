import {
  BufferGeometry, BufferAttribute, Points, ShaderMaterial, AdditiveBlending, Color, type Texture
} from 'three'
import { glowTexture } from './textures'

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
    this.pos[i * 3 + 1] = s.y
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
