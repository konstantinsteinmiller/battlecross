import {
  InstancedMesh, InstancedBufferAttribute, PlaneGeometry, ShaderMaterial, NormalBlending, DynamicDrawUsage, Color
} from 'three'

/**
 * ─── Wind lines (the Sky Docks' wind tunnel) ─────────────────────────────────
 *
 * Anime-style wind: long, thin, white streaks that sweep along the wind,
 * each a gently curved ribbon that draws itself on from its tail to its head
 * and wipes off again as it flies. Many and fast in a gust, a few lazy ones
 * in the calm (`sim/stages/wind.ts` spawns and moves them).
 *
 *  - ONE instanced draw for every streak, blended, no depth write: a white
 *    core in a thin blue rim, so a line reads on a white floor too.
 *  - Each streak: its instance matrix puts its path's start and turns local
 *    +X down the wind; `aShape` = (path length, side bend, lift bend, width),
 *    `aProg` = (head position along the path 0..1.45, opacity). The ribbon
 *    faces the camera (widened across its tangent in view space), so a
 *    streak reads from any side and never goes edge-on.
 *  - The vertex shader bends and windows the path; nothing is rebuilt per
 *    frame, the sim only writes matrices and the two small attributes.
 */

/** How much of its path a streak shows at once (the stroke's length). */
export const STREAK_WINDOW = 0.45

const VERT = /* glsl */`
attribute vec4 aShape;
attribute vec2 aProg;
varying float vU;
varying float vV;
varying float vA;
vec3 pathAt(float s) {
  // Down the wind (+X), bowed sideways and up, with a little hook at the
  // head end — the curl of a drawn wind line.
  float bow = sin(s * 3.14159);
  float hook = s * s * s;
  return vec3(s * aShape.x, aShape.z * bow + aShape.z * 0.6 * hook, aShape.y * bow - aShape.y * 1.4 * hook);
}
void main() {
  float u = position.x;
  float v = position.y;
  float head = aProg.x;
  float tail = head - ${STREAK_WINDOW.toFixed(2)};
  float s = clamp(mix(tail, head, u), 0.0, 1.0);
  vec3 c = pathAt(s);
  vec3 tg = pathAt(min(1.0, s + 0.02)) - pathAt(max(0.0, s - 0.02));
  mat4 m = modelMatrix * instanceMatrix;
  vec4 vp = viewMatrix * m * vec4(c, 1.0);
  vec3 vt = (viewMatrix * m * vec4(tg, 0.0)).xyz;
  vec2 side = vec2(-vt.y, vt.x);
  float sl = length(side);
  side = sl > 1e-5 ? side / sl : vec2(0.0, 1.0);
  // Thin at the tail, full just behind the head, pointed at the head.
  float taper = smoothstep(0.0, 0.7, u) * (1.0 - smoothstep(0.9, 1.0, u) * 0.7);
  vp.xy += side * v * aShape.w * taper;
  gl_Position = projectionMatrix * vp;
  vU = u;
  vV = v;
  // Nothing of the stroke outside the path: fade where it is clamped.
  float inside = step(0.0, mix(tail, head, u)) * step(mix(tail, head, u), 1.0);
  vA = aProg.y * inside;
}
`

const FRAG = /* glsl */`
uniform vec3 uColor;
uniform vec3 uEdge;
varying float vU;
varying float vV;
varying float vA;
void main() {
  // A white core in a thin sky-blue rim: it reads on the teal walls and on
  // the white floors alike (a purely additive white vanishes on the latter).
  float across = 1.0 - abs(vV) * 2.0;
  float core = smoothstep(0.35, 0.75, across);
  float a = vA * smoothstep(0.0, 0.3, across) * (0.3 + 0.7 * vU);
  if (a < 0.004) discard;
  gl_FragColor = vec4(mix(uEdge, uColor, core), a);
  #include <colorspace_fragment>
}
`

export interface WindStreaksMesh {
  mesh: InstancedMesh
  /** Per streak: path length, side bend, lift bend, width (m). */
  shape: InstancedBufferAttribute
  /** Per streak: head position along the path (0..1 + window), opacity. */
  prog: InstancedBufferAttribute
  dispose(): void
}

/** The pool's mesh: `max` streaks, each a ribbon of `segs` pieces. */
export const buildWindStreaks = (max: number, segs: number): WindStreaksMesh => {
  const geo = new PlaneGeometry(1, 1, segs, 1).translate(0.5, 0, 0)
  const shape = new InstancedBufferAttribute(new Float32Array(max * 4), 4).setUsage(DynamicDrawUsage)
  const prog = new InstancedBufferAttribute(new Float32Array(max * 2), 2).setUsage(DynamicDrawUsage)
  geo.setAttribute('aShape', shape)
  geo.setAttribute('aProg', prog)
  const mat = new ShaderMaterial({
    uniforms: { uColor: { value: new Color('#ffffff') }, uEdge: { value: new Color('#5aaeff') } },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: NormalBlending,
    toneMapped: false
  })
  const mesh = new InstancedMesh(geo, mat, max)
  mesh.instanceMatrix.setUsage(DynamicDrawUsage)
  // In the scene from birth, empty: the precompile reaches its shader.
  mesh.count = 0
  // Streaks move every frame; a cached bounding sphere would be stale.
  mesh.frustumCulled = false
  mesh.renderOrder = 4
  mesh.name = 'windStreaks'
  return {
    mesh, shape, prog,
    dispose() {
      mesh.removeFromParent()
      geo.dispose()
      mat.dispose()
    }
  }
}
