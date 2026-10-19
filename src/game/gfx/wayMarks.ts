import {
  DoubleSide, DynamicDrawUsage, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, PlaneGeometry, ShaderMaterial
} from 'three'
import { GROUND_GLSL, withGround } from './ground'

/**
 * ─── The coach's way, ON the ground ──────────────────────────────────────────
 *
 * The gold chevrons that lead the hero to a townsperson (`coach.ts`, the `talk`
 * lesson). They used to be a DOM overlay and so were drawn over everything: a
 * signpost, a cart or a house wall between the camera and the road. Here they
 * are true ground decals: each chevron is a quad laid on the ground (every
 * vertex on the terrain's height), transparent, never writing depth, pulled
 * toward the camera by a polygon offset, and DEPTH-TESTED, so a post, a tree or
 * a wall in front of the road hides the part of the chevron behind it. Never a
 * coplanar opaque face, never a layer above the scene.
 */

/** Metres between chevrons. */
export const WAY_GAP = 1.6
/** Most chevrons drawn at once (a way of 60 m). */
export const WAY_MAX = 48
/** Metres from the hero before the first chevron, and short of the goal before the last. */
const HEAD = 1.3
const TAIL = 1.1
/** A chevron's half size (m). */
const HALF = 0.55

const VERT = /* glsl */`
${GROUND_GLSL}
attribute vec4 aWay;   // x, z, heading (rad, in the xz plane), alpha
varying vec2 vP;
varying float vA;
void main() {
  vP = position.xy;
  vA = aWay.w;
  vec2 f = vec2(cos(aWay.z), sin(aWay.z));
  vec2 s = vec2(-f.y, f.x);
  vec2 xz = aWay.xy + (f * position.x + s * position.y) * ${HALF.toFixed(3)};
  gl_Position = projectionMatrix * viewMatrix * vec4(xz.x, groundY(xz) + 0.05, xz.y, 1.0);
}
`

const FRAG = /* glsl */`
varying vec2 vP;
varying float vA;
// Distance to the segment a-b.
float seg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}
void main() {
  vec2 q = vec2(vP.x, abs(vP.y));
  float d = seg(q, vec2(0.62, 0.0), vec2(-0.32, 0.78));
  float aa = fwidth(d) * 1.2 + 0.004;
  float gold = 1.0 - smoothstep(0.15 - aa, 0.15 + aa, d);
  float ink = 1.0 - smoothstep(0.25 - aa, 0.25 + aa, d);
  float a = ink * vA;
  if (a < 0.01) discard;
  vec3 col = mix(vec3(0.06, 0.1, 0.19), vec3(1.0, 0.847, 0.29), gold);
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
`

/**
 * Where the chevrons stand along the walked way. `pts` is x, z pairs (`n`
 * points, the hero's own spot NOT among them); the way starts at (hx, hz). Writes
 * x, z, heading, alpha per chevron into `out` and returns how many. `phase` (0..1)
 * drifts them toward the goal.
 */
export const layoutWay = (hx: number, hz: number, pts: ArrayLike<number>, n: number, phase: number, out: Float32Array): number => {
  let total = 0
  let px = hx
  let pz = hz
  for (let i = 0; i < n; i++) {
    total += Math.hypot(pts[i * 2]! - px, pts[i * 2 + 1]! - pz)
    px = pts[i * 2]!
    pz = pts[i * 2 + 1]!
  }
  const stop = total - TAIL
  let k = 0
  let seg = 0
  let ax = hx
  let az = hz
  let bx = n > 0 ? pts[0]! : hx
  let bz = n > 0 ? pts[1]! : hz
  let segStart = 0
  let segLen = Math.hypot(bx - ax, bz - az)
  for (let at = HEAD + phase * WAY_GAP; at < stop && k < WAY_MAX; at += WAY_GAP) {
    while (seg < n - 1 && at > segStart + segLen) {
      segStart += segLen
      seg++
      ax = bx
      az = bz
      bx = pts[seg * 2]!
      bz = pts[seg * 2 + 1]!
      segLen = Math.hypot(bx - ax, bz - az)
    }
    const u = segLen > 0 ? Math.min(1, (at - segStart) / segLen) : 0
    const fade = Math.max(0, Math.min(1, (at - HEAD) / 1.5, (stop - at) / 2))
    out[k * 4] = ax + (bx - ax) * u
    out[k * 4 + 1] = az + (bz - az) * u
    out[k * 4 + 2] = Math.atan2(bz - az, bx - ax)
    out[k * 4 + 3] = fade
    k++
  }
  return k
}

export class WayMarks {
  readonly mesh: Mesh
  private readonly attr: InstancedBufferAttribute
  private readonly geo = new InstancedBufferGeometry()
  private readonly quad = new PlaneGeometry(2, 2, 3, 3)
  private time = 0

  constructor() {
    const q = this.quad
    this.geo.setAttribute('position', q.getAttribute('position'))
    this.geo.setIndex(q.getIndex())
    this.attr = new InstancedBufferAttribute(new Float32Array(WAY_MAX * 4), 4).setUsage(DynamicDrawUsage)
    this.geo.setAttribute('aWay', this.attr)
    this.geo.instanceCount = 0
    const mat = new ShaderMaterial({
      uniforms: withGround({}),
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      side: DoubleSide,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    })
    this.mesh = new Mesh(this.geo, mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 3
    this.mesh.visible = false
  }

  /** Lay the chevrons for this frame; `on` false hides them. */
  update(dt: number, on: boolean, hx: number, hz: number, pts: ArrayLike<number>, n: number): void {
    this.mesh.visible = on && n > 0
    if (!this.mesh.visible) return
    this.time += dt
    const k = layoutWay(hx, hz, pts, n, (this.time * 1.1) % 1, this.attr.array as Float32Array)
    this.geo.instanceCount = k
    this.attr.clearUpdateRanges()
    this.attr.addUpdateRange(0, k * 4)
    this.attr.needsUpdate = true
  }

  dispose(): void {
    this.geo.dispose()
    this.quad.dispose()
    ;(this.mesh.material as ShaderMaterial).dispose()
    this.mesh.removeFromParent()
  }
}
