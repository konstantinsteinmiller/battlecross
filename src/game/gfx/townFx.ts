import {
  CanvasTexture, DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, LinearFilter, NormalBlending, PlaneGeometry,
  ShaderMaterial, type Object3D
} from 'three'
import type { Emote } from '../sim/townLife'

/**
 * ─── A town's small effects ──────────────────────────────────────────────────
 *
 *   Puffs    soft round smoke, alpha-blended (the shared particles are
 *            additive: smoke made of them glows): chimneys, pipes, the forge.
 *   Bubbles  wordless speech bubbles over heads — "…", "!", "?", a note, a
 *            heart, a drop of sweat — drawn once into a small atlas.
 *
 * Each is ONE instanced draw with a fixed capacity, written in place each
 * frame: no allocation while the town runs.
 */

const BILLBOARD = /* glsl */`
attribute vec4 aPos;
attribute vec4 aCol;
varying vec4 vCol;
varying vec2 vUv;
void main() {
  vCol = aCol;
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(aPos.xyz, 1.0);
  mv.xy += position.xy * aPos.w;
  gl_Position = projectionMatrix * mv;
}
`

export class Puffs {
  readonly mesh: InstancedMesh
  private n = 0
  private readonly cap: number
  private pos: Float32Array
  private col: Float32Array
  private vel: Float32Array
  private life: Float32Array
  private max: Float32Array
  private size: Float32Array
  private grow: Float32Array
  private aPos: InstancedBufferAttribute
  private aCol: InstancedBufferAttribute

  constructor(cap = 96) {
    this.cap = cap
    const g = new PlaneGeometry(1, 1)
    this.aPos = new InstancedBufferAttribute(new Float32Array(cap * 4), 4).setUsage(DynamicDrawUsage)
    this.aCol = new InstancedBufferAttribute(new Float32Array(cap * 4), 4).setUsage(DynamicDrawUsage)
    g.setAttribute('aPos', this.aPos)
    g.setAttribute('aCol', this.aCol)
    const m = new ShaderMaterial({
      vertexShader: BILLBOARD,
      fragmentShader: /* glsl */`
varying vec4 vCol;
varying vec2 vUv;
void main() {
  vec2 d = vUv - 0.5;
  float r = length(d) * 2.0;
  float a = (1.0 - smoothstep(0.55, 1.0, r)) * vCol.a;
  // A little shading: the top of a puff is lighter.
  vec3 c = vCol.rgb * (0.88 + 0.22 * vUv.y);
  gl_FragColor = vec4(c, a);
  #include <colorspace_fragment>
}`,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending
    })
    this.mesh = new InstancedMesh(g, m, cap)
    this.mesh.count = 0
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 6
    this.pos = new Float32Array(cap * 3)
    this.col = new Float32Array(cap * 3)
    this.vel = new Float32Array(cap * 3)
    this.life = new Float32Array(cap)
    this.max = new Float32Array(cap)
    this.size = new Float32Array(cap)
    this.grow = new Float32Array(cap)
  }

  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, size: number, grow: number, life: number, r: number, g: number, b: number): void {
    if (this.n >= this.cap) return
    const i = this.n++
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz
    this.col[i * 3] = r; this.col[i * 3 + 1] = g; this.col[i * 3 + 2] = b
    this.life[i] = 0
    this.max[i] = life
    this.size[i] = size
    this.grow[i] = grow
  }

  update(dt: number): void {
    let w = 0
    const P = this.aPos.array as Float32Array
    const Cc = this.aCol.array as Float32Array
    for (let i = 0; i < this.n; i++) {
      const l = this.life[i]! + dt
      if (l >= this.max[i]!) continue
      const k = l / this.max[i]!
      // Smoke slows and drifts with a breeze.
      const px = this.pos[i * 3]! + (this.vel[i * 3]! + 0.18 * k) * dt
      const py = this.pos[i * 3 + 1]! + this.vel[i * 3 + 1]! * dt * (1 - 0.5 * k)
      const pz = this.pos[i * 3 + 2]! + this.vel[i * 3 + 2]! * dt
      if (w !== i) {
        this.vel[w * 3] = this.vel[i * 3]!; this.vel[w * 3 + 1] = this.vel[i * 3 + 1]!; this.vel[w * 3 + 2] = this.vel[i * 3 + 2]!
        this.col[w * 3] = this.col[i * 3]!; this.col[w * 3 + 1] = this.col[i * 3 + 1]!; this.col[w * 3 + 2] = this.col[i * 3 + 2]!
        this.max[w] = this.max[i]!
        this.size[w] = this.size[i]!
        this.grow[w] = this.grow[i]!
      }
      this.pos[w * 3] = px; this.pos[w * 3 + 1] = py; this.pos[w * 3 + 2] = pz
      this.life[w] = l
      P[w * 4] = px; P[w * 4 + 1] = py; P[w * 4 + 2] = pz
      P[w * 4 + 3] = this.size[w]! + this.grow[w]! * k
      Cc[w * 4] = this.col[w * 3]!; Cc[w * 4 + 1] = this.col[w * 3 + 1]!; Cc[w * 4 + 2] = this.col[w * 3 + 2]!
      // In quickly, out slowly.
      Cc[w * 4 + 3] = Math.min(1, k * 6) * (1 - k) * 0.75
      w++
    }
    this.n = w
    this.mesh.count = w
    this.aPos.needsUpdate = true
    this.aCol.needsUpdate = true
  }

  dispose(): void {
    this.mesh.geometry.dispose()
    ;(this.mesh.material as ShaderMaterial).dispose()
  }
}

// ─── Bubbles ─────────────────────────────────────────────────────────────────

const EMOTES: Emote[] = ['dots', 'note', 'bang', 'ask', 'heart', 'sweat', 'zzz', 'star']
const CELLPX = 64

/** The atlas: a white bubble with a tail, and a glyph in it, eight of them in a row. */
const atlas = (): CanvasTexture => {
  const c = document.createElement('canvas')
  c.width = CELLPX * EMOTES.length
  c.height = CELLPX
  const x = c.getContext('2d')!
  EMOTES.forEach((e, i) => {
    const ox = i * CELLPX
    x.save()
    x.translate(ox, 0)
    // The bubble: a rounded body and a tail toward the head below.
    x.fillStyle = '#ffffff'
    x.strokeStyle = '#1b1626'
    x.lineWidth = 4
    x.beginPath()
    x.moveTo(14, 6)
    x.lineTo(50, 6)
    x.quadraticCurveTo(60, 6, 60, 16)
    x.lineTo(60, 38)
    x.quadraticCurveTo(60, 48, 50, 48)
    x.lineTo(38, 48)
    x.lineTo(30, 60)
    x.lineTo(28, 48)
    x.lineTo(14, 48)
    x.quadraticCurveTo(4, 48, 4, 38)
    x.lineTo(4, 16)
    x.quadraticCurveTo(4, 6, 14, 6)
    x.closePath()
    x.fill()
    x.stroke()
    x.fillStyle = '#1b1626'
    x.strokeStyle = '#1b1626'
    x.lineCap = 'round'
    x.lineWidth = 5
    switch (e) {
      case 'dots':
        for (const dx of [-11, 0, 11]) { x.beginPath(); x.arc(32 + dx, 28, 3.6, 0, Math.PI * 2); x.fill() }
        break
      case 'note':
        x.fillStyle = '#3f6fd6'
        x.strokeStyle = '#3f6fd6'
        x.beginPath(); x.ellipse(27, 35, 6, 4.5, -0.4, 0, Math.PI * 2); x.fill()
        x.lineWidth = 3.5
        x.beginPath(); x.moveTo(32, 34); x.lineTo(32, 13); x.lineTo(42, 18); x.stroke()
        break
      case 'bang':
        x.fillStyle = '#e0484a'
        x.beginPath(); x.moveTo(28, 12); x.lineTo(36, 12); x.lineTo(34, 31); x.lineTo(30, 31); x.closePath(); x.fill()
        x.beginPath(); x.arc(32, 39, 3.6, 0, Math.PI * 2); x.fill()
        break
      case 'ask':
        x.strokeStyle = '#7a4ad8'
        x.fillStyle = '#7a4ad8'
        x.lineWidth = 4.5
        x.beginPath(); x.arc(32, 20, 7, Math.PI * 1.1, Math.PI * 0.45); x.lineTo(32, 31); x.stroke()
        x.beginPath(); x.arc(32, 39, 3.2, 0, Math.PI * 2); x.fill()
        break
      case 'heart':
        x.fillStyle = '#ff4a6a'
        x.beginPath(); x.moveTo(32, 40)
        x.bezierCurveTo(16, 30, 18, 14, 32, 22)
        x.bezierCurveTo(46, 14, 48, 30, 32, 40)
        x.fill()
        break
      case 'sweat':
        x.fillStyle = '#5fb8ff'
        x.beginPath(); x.moveTo(32, 12); x.quadraticCurveTo(44, 30, 32, 40); x.quadraticCurveTo(20, 30, 32, 12); x.fill()
        break
      case 'zzz':
        x.lineWidth = 3.5
        x.strokeStyle = '#5a4a8a'
        x.beginPath(); x.moveTo(20, 16); x.lineTo(30, 16); x.lineTo(20, 28); x.lineTo(30, 28); x.stroke()
        x.beginPath(); x.moveTo(34, 26); x.lineTo(44, 26); x.lineTo(34, 38); x.lineTo(44, 38); x.stroke()
        break
      case 'star':
        x.fillStyle = '#ffc23a'
        x.beginPath()
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2 - Math.PI / 2
          const rr = k % 2 ? 6 : 14
          x.lineTo(32 + Math.cos(a) * rr, 27 + Math.sin(a) * rr)
        }
        x.closePath(); x.fill()
        break
      default:
        break
    }
    x.restore()
  })
  const t = new CanvasTexture(c)
  t.minFilter = LinearFilter
  t.magFilter = LinearFilter
  t.generateMipmaps = false
  return t
}

export class Bubbles {
  readonly mesh: InstancedMesh
  private readonly cap: number
  private aPos: InstancedBufferAttribute
  private aCol: InstancedBufferAttribute
  private tex: CanvasTexture
  private n = 0

  constructor(cap = 16) {
    this.cap = cap
    const g = new PlaneGeometry(1, 1)
    this.aPos = new InstancedBufferAttribute(new Float32Array(cap * 4), 4).setUsage(DynamicDrawUsage)
    // aCol: x = atlas cell, y = alpha.
    this.aCol = new InstancedBufferAttribute(new Float32Array(cap * 4), 4).setUsage(DynamicDrawUsage)
    g.setAttribute('aPos', this.aPos)
    g.setAttribute('aCol', this.aCol)
    this.tex = atlas()
    const m = new ShaderMaterial({
      uniforms: { uMap: { value: this.tex }, uCells: { value: EMOTES.length } },
      vertexShader: BILLBOARD,
      fragmentShader: /* glsl */`
uniform sampler2D uMap;
uniform float uCells;
varying vec4 vCol;
varying vec2 vUv;
void main() {
  vec4 t = texture2D(uMap, vec2((vCol.x + vUv.x) / uCells, vUv.y));
  gl_FragColor = vec4(t.rgb, t.a * vCol.y);
  #include <colorspace_fragment>
}`,
      transparent: true,
      depthWrite: false,
      depthTest: false
    })
    this.mesh = new InstancedMesh(g, m, cap)
    this.mesh.count = 0
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 28
  }

  begin(): void {
    this.n = 0
  }

  /** A bubble over a head, `t` seconds after it appeared (it pops in, bobs, fades). */
  add(x: number, y: number, z: number, e: Emote, t: number, scale = 1): void {
    if (this.n >= this.cap || !e) return
    const cell = EMOTES.indexOf(e)
    if (cell < 0) return
    const pop = t < 0.18 ? 0.4 + (t / 0.18) * 0.75 : t < 0.3 ? 1.15 - ((t - 0.18) / 0.12) * 0.15 : 1
    const fade = t > 1.8 ? Math.max(0, 1 - (t - 1.8) / 0.4) : 1
    const i = this.n++
    const P = this.aPos.array as Float32Array
    const C = this.aCol.array as Float32Array
    P[i * 4] = x
    P[i * 4 + 1] = y + Math.sin(t * 4) * 0.03 + 0.08 * Math.min(1, t * 4)
    P[i * 4 + 2] = z
    P[i * 4 + 3] = 0.62 * pop * scale
    C[i * 4] = cell
    C[i * 4 + 1] = fade
  }

  end(): void {
    this.mesh.count = this.n
    this.aPos.needsUpdate = true
    this.aCol.needsUpdate = true
  }

  dispose(): void {
    this.mesh.geometry.dispose()
    ;(this.mesh.material as ShaderMaterial).dispose()
    this.tex.dispose()
  }
}

export type { Object3D }
