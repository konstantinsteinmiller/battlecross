import {
  AdditiveBlending, BufferGeometry, CircleGeometry, Color, DoubleSide, DynamicDrawUsage, Float32BufferAttribute, Group,
  InstancedBufferAttribute, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, NormalBlending, PlaneGeometry, RingGeometry,
  ShaderMaterial, type Scene
} from 'three'
import { softDisc } from './textures'

/**
 * ─── World-space UI ──────────────────────────────────────────────────────────
 *
 * The marks the player aims and reads by, drawn IN the scene so they sit under
 * the characters and scale with the camera:
 *
 *   • the hero's ring and the locked target's ring;
 *   • the drag line from the hero to the pointer (GDD §7), gold over an enemy;
 *   • the tap marker where a move order landed;
 *   • a skill's aim preview (range ring + area disc) while its button is dragged;
 *   • blob shadows, and every health bar in one instanced draw.
 */

const flat = (m: Mesh, y: number): Mesh => {
  m.rotation.x = -Math.PI / 2
  m.position.y = y
  m.renderOrder = 3
  return m
}

const mat = (color: string, additive: boolean, opacity = 1): MeshBasicMaterial => new MeshBasicMaterial({
  color: new Color(color), transparent: true, opacity, depthWrite: false, side: DoubleSide, toneMapped: false,
  blending: additive ? AdditiveBlending : NormalBlending
})

export class Markers {
  readonly root = new Group()
  private ringGeo = new RingGeometry(0.84, 1, 40)
  private thinRing = new RingGeometry(0.955, 1, 64)
  private discGeo = new CircleGeometry(1, 40)
  private lineGeo = new PlaneGeometry(1, 1)
  private heroRing: Mesh
  private targetRing: Mesh
  private targetFill: Mesh
  private tap: Mesh
  private tapT = 1
  private line: Mesh
  private lineTip: Mesh
  private rangeRing: Mesh
  private aimDisc: Mesh
  private aimRing: Mesh
  private aimLine: Mesh
  private time = 0

  constructor(scene: Scene) {
    this.heroRing = flat(new Mesh(this.ringGeo, mat('#5fe8ff', true, 0.7)), 0.035)
    this.targetRing = flat(new Mesh(this.ringGeo, mat('#ff3d4f', true, 0.95)), 0.04)
    this.targetFill = flat(new Mesh(this.discGeo, mat('#ff3d4f', true, 0.16)), 0.036)
    this.tap = flat(new Mesh(this.ringGeo, mat('#ffffff', true, 0.9)), 0.045)
    this.line = flat(new Mesh(this.lineGeo, mat('#ffd24a', true, 0.85)), 0.07)
    this.lineTip = flat(new Mesh(this.discGeo, mat('#ffd24a', true, 0.9)), 0.075)
    this.rangeRing = flat(new Mesh(this.thinRing, mat('#ffffff', true, 0.35)), 0.05)
    this.aimDisc = flat(new Mesh(this.discGeo, mat('#ffd24a', true, 0.22)), 0.055)
    this.aimRing = flat(new Mesh(this.ringGeo, mat('#ffd24a', true, 0.9)), 0.06)
    this.aimLine = flat(new Mesh(this.lineGeo, mat('#ffd24a', true, 0.5)), 0.052)
    for (const m of [this.targetRing, this.targetFill, this.tap, this.line, this.lineTip, this.rangeRing, this.aimDisc, this.aimRing, this.aimLine]) m.visible = false
    this.root.add(this.heroRing, this.targetRing, this.targetFill, this.tap, this.line, this.lineTip, this.rangeRing, this.aimDisc, this.aimRing, this.aimLine)
    scene.add(this.root)
  }

  hero(x: number, z: number, r: number, visible: boolean): void {
    this.heroRing.visible = visible
    this.heroRing.position.x = x
    this.heroRing.position.z = z
    this.heroRing.scale.setScalar(r * 1.5)
  }

  /** The locked target's ring; `null` hides it. */
  target(x: number, z: number, r: number, on: boolean, hostile = true): void {
    this.targetRing.visible = this.targetFill.visible = on
    if (!on) return
    const pulse = 1 + Math.sin(this.time * 7) * 0.06
    const col = hostile ? '#ff3d4f' : '#7dff8a'
    ;(this.targetRing.material as MeshBasicMaterial).color.set(col)
    ;(this.targetFill.material as MeshBasicMaterial).color.set(col)
    for (const m of [this.targetRing, this.targetFill]) {
      m.position.x = x
      m.position.z = z
      m.scale.setScalar((r + 0.35) * pulse)
    }
    this.targetRing.rotation.z = this.time * 1.2
  }

  /** A move order landed here: a ring that closes and fades. */
  tapAt(x: number, z: number, color = '#ffffff'): void {
    this.tap.position.x = x
    this.tap.position.z = z
    ;(this.tap.material as MeshBasicMaterial).color.set(color)
    this.tapT = 0
    this.tap.visible = true
  }

  private segment(m: Mesh, x0: number, z0: number, x1: number, z1: number, w: number): void {
    const dx = x1 - x0
    const dz = z1 - z0
    const len = Math.hypot(dx, dz) || 0.01
    m.position.x = (x0 + x1) / 2
    m.position.z = (z0 + z1) / 2
    m.rotation.set(-Math.PI / 2, 0, -Math.atan2(dz, dx), 'XYZ')
    m.scale.set(len, w, 1)
  }

  /** The drag line from the hero to the pointer. Gold on an enemy, white on ground. */
  drag(on: boolean, x0 = 0, z0 = 0, x1 = 0, z1 = 0, onEnemy = false): void {
    this.line.visible = this.lineTip.visible = on
    if (!on) return
    const col = onEnemy ? '#ffb02a' : '#ffffff'
    ;(this.line.material as MeshBasicMaterial).color.set(col)
    ;(this.lineTip.material as MeshBasicMaterial).color.set(col)
    this.segment(this.line, x0, z0, x1, z1, 0.14)
    this.lineTip.position.x = x1
    this.lineTip.position.z = z1
    this.lineTip.scale.setScalar(onEnemy ? 0.42 + Math.sin(this.time * 12) * 0.06 : 0.26)
  }

  /**
   * A skill being aimed: its reach round the hero, and the area (or the line
   * of fire) at the aim point. `radius` 0 = a single-target skill.
   */
  aim(on: boolean, hx = 0, hz = 0, range = 0, x = 0, z = 0, radius = 0, color = '#ffd24a', inRange = true): void {
    this.rangeRing.visible = on && range > 0
    this.aimDisc.visible = this.aimRing.visible = on && radius > 0
    this.aimLine.visible = on && radius <= 0
    if (!on) return
    const col = inRange ? color : '#ff5a5a'
    this.rangeRing.position.x = hx
    this.rangeRing.position.z = hz
    this.rangeRing.scale.setScalar(range)
    for (const m of [this.aimDisc, this.aimRing]) {
      m.position.x = x
      m.position.z = z
      m.scale.setScalar(Math.max(0.4, radius))
      ;(m.material as MeshBasicMaterial).color.set(col)
    }
    ;(this.aimLine.material as MeshBasicMaterial).color.set(col)
    this.segment(this.aimLine, hx, hz, x, z, 0.22)
    this.aimRing.rotation.z = this.time * 1.5
  }

  update(dt: number): void {
    this.time += dt
    this.heroRing.rotation.z = -this.time * 0.8
    if (this.tapT < 1) {
      this.tapT += dt / 0.4
      const k = Math.min(1, this.tapT)
      this.tap.scale.setScalar(0.9 - 0.55 * k)
      ;(this.tap.material as MeshBasicMaterial).opacity = 0.9 * (1 - k)
      if (k >= 1) this.tap.visible = false
    }
  }

  dispose(): void {
    this.ringGeo.dispose()
    this.thinRing.dispose()
    this.discGeo.dispose()
    this.lineGeo.dispose()
    this.root.traverse((o) => { const m = (o as Mesh).material as MeshBasicMaterial | undefined; if (m?.dispose) m.dispose() })
    this.root.removeFromParent()
  }
}

// ─── Blob shadows ────────────────────────────────────────────────────────────

let shadowMat: MeshBasicMaterial | null = null
let shadowGeo: CircleGeometry | null = null
/** Soft blob shadow under a character (no shadow maps anywhere). */
export const makeBlobShadow = (r: number): Mesh => {
  if (!shadowMat) {
    shadowMat = new MeshBasicMaterial({
      map: softDisc(), color: new Color('#150f24'), transparent: true, opacity: 0.38, depthWrite: false, toneMapped: false
    })
    shadowGeo = new CircleGeometry(1, 20)
  }
  const m = new Mesh(shadowGeo!, shadowMat)
  m.rotation.x = -Math.PI / 2
  m.position.y = 0.02
  m.scale.set(r * 1.25, r * 1.25, 1)
  m.renderOrder = 1
  return m
}

// ─── Health bars: one instanced draw for the whole field ─────────────────────

const BAR_VERT = /* glsl */`
attribute vec4 aBar;      // x, y, z of the anchor; w = fill 0..1
attribute vec4 aLook;     // r, g, b; a = width in metres
attribute float aShield;  // shield as a share of max health
varying vec2 vUv;
varying float vFill;
varying float vShield;
varying vec3 vColor;
void main() {
  vUv = uv;
  vFill = aBar.w;
  vShield = aShield;
  vColor = aLook.rgb;
  // A billboard: the quad is offset in VIEW space, so it always faces the camera.
  vec4 mv = modelViewMatrix * vec4(aBar.xyz, 1.0);
  mv.xy += vec2(position.x * aLook.a, position.y * 0.13);
  gl_Position = projectionMatrix * mv;
}
`
const BAR_FRAG = /* glsl */`
varying vec2 vUv;
varying float vFill;
varying float vShield;
varying vec3 vColor;
void main() {
  // A dark capsule with an inset fill.
  vec2 p = vUv;
  float edge = min(min(p.x, 1.0 - p.x) * 9.0, min(p.y, 1.0 - p.y) * 1.6);
  vec3 col = vec3(0.06, 0.05, 0.1);
  float inner = step(0.22, edge);
  float f = step(p.x, vFill);
  float sh = step(p.x, min(1.0, vFill + vShield)) - f;
  col = mix(col, mix(vec3(0.16, 0.13, 0.2), vColor * (0.82 + 0.3 * p.y), f), inner);
  col = mix(col, vec3(1.0, 0.92, 0.55), sh * inner);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

/** Every unit's health bar: a pool of instances, rewritten each frame. */
export class HealthBars {
  readonly mesh: InstancedMesh
  private bar: InstancedBufferAttribute
  private look: InstancedBufferAttribute
  private shield: InstancedBufferAttribute
  private n = 0
  private cap: number
  private c = new Color()

  constructor(scene: Scene, capacity = 64) {
    this.cap = capacity
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0], 3))
    g.setAttribute('uv', new Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2))
    g.setIndex([0, 1, 2, 0, 2, 3])
    this.bar = new InstancedBufferAttribute(new Float32Array(capacity * 4), 4)
    this.look = new InstancedBufferAttribute(new Float32Array(capacity * 4), 4)
    this.shield = new InstancedBufferAttribute(new Float32Array(capacity), 1)
    for (const a of [this.bar, this.look, this.shield]) a.setUsage(DynamicDrawUsage)
    g.setAttribute('aBar', this.bar)
    g.setAttribute('aLook', this.look)
    g.setAttribute('aShield', this.shield)
    const m = new ShaderMaterial({ vertexShader: BAR_VERT, fragmentShader: BAR_FRAG, depthTest: false, depthWrite: false, transparent: true })
    this.mesh = new InstancedMesh(g, m, capacity)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 30
    this.mesh.count = 0
    // The instance matrix is unused (placement is in the attributes).
    this.mesh.setMatrixAt(0, new Matrix4())
    scene.add(this.mesh)
  }

  begin(): void {
    this.n = 0
  }

  add(x: number, y: number, z: number, fill: number, shield: number, color: string, width: number): void {
    if (this.n >= this.cap) return
    const i = this.n++
    this.bar.setXYZW(i, x, y, z, Math.max(0, Math.min(1, fill)))
    this.c.set(color)
    this.look.setXYZW(i, this.c.r, this.c.g, this.c.b, width)
    this.shield.setX(i, shield)
  }

  end(): void {
    this.mesh.count = this.n
    this.bar.needsUpdate = true
    this.look.needsUpdate = true
    this.shield.needsUpdate = true
  }

  dispose(): void {
    this.mesh.geometry.dispose()
    ;(this.mesh.material as ShaderMaterial).dispose()
    this.mesh.removeFromParent()
  }
}
