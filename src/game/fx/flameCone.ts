import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from 'three'
import { sceneQuality } from '../engine/quality'

/**
 * ─── Flame material: a real fire look for jets, pillars and sheets ───────────
 *
 * The flame traps and vents used to be flat additive cones and curtains with
 * a flickering opacity: they read as coloured glass. This material draws fire
 * on the same geometry: scrolling fractal noise rising along the flame (the
 * UV's v runs mouth → tip), a ragged tip that eats into the shape, a heat
 * ramp from a white-yellow core through orange to a deep red edge, and a soft
 * falloff at grazing angles so a cone's silhouette is soft rather than a
 * hard ring. Additive, no depth write.
 *
 * One program for every flame (the defines only pick the noise depth and the
 * plane variant), so a sector compiles it once. Low-quality devices get two
 * noise octaves instead of four — the look holds, the cost halves.
 *
 * The owner drives it per frame with `setFlame(mat, power, time)`.
 */

export interface FlameColors {
  core: string
  mid: string
  edge: string
}

const VERT = /* glsl */`
varying vec2 vUv;
varying float vFacing;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  // How squarely the surface faces the eye: 1 head on, 0 edge on.
  vFacing = abs(dot(n, normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
}
`

const FRAG = /* glsl */`
uniform float uTime;
uniform float uPower;
uniform float uSeed;
uniform vec3 uCore;
uniform vec3 uMid;
uniform vec3 uEdge;
varying vec2 vUv;
varying float vFacing;
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    s += a * noise(p);
    p = p * 2.07 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}
void main() {
  float v = vUv.y;
  // Fire rises: the noise field scrolls toward the tip, stretched along it.
  float n = fbm(vec2(vUv.x * 5.0 + uSeed, v * 2.4 - uTime * 3.4));
  float n2 = fbm(vec2(vUv.x * 9.0 - uSeed, v * 4.5 - uTime * 5.3));
  float ragged = (n - 0.5) * 0.6 + (n2 - 0.5) * 0.25;
  // The body: full at the mouth, eaten away toward a flickering tip.
  float body = smoothstep(1.0, 0.42, v + ragged) * smoothstep(0.0, 0.06, v);
  #ifdef PLANE
  float soft = 1.0 - pow(abs(vUv.x - 0.5) * 2.0, 3.0);
  #else
  float soft = pow(vFacing, 0.7);
  #endif
  float heat = clamp(1.05 - v * 1.25 + ragged * 0.8, 0.0, 1.0);
  vec3 col = mix(uEdge, uMid, smoothstep(0.12, 0.55, heat));
  col = mix(col, uCore, smoothstep(0.62, 0.95, heat));
  float a = body * soft * uPower * (0.55 + 0.75 * n);
  if (a < 0.01) discard;
  gl_FragColor = vec4(col * (1.0 + heat * 0.6), a);
  #include <colorspace_fragment>
}
`

let seed = 0

/** A flame material (cone or, with `plane`, a sheet whose UV x spans it). */
export const makeFlameMaterial = (c: FlameColors, plane = false): ShaderMaterial => {
  const low = sceneQuality() === 'low'
  const defines: Record<string, number | string> = { OCTAVES: low ? 2 : 4 }
  if (plane) defines.PLANE = 1
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPower: { value: 0 },
      uSeed: { value: (seed++ * 7.31) % 50 },
      uCore: { value: new Color(c.core) },
      uMid: { value: new Color(c.mid) },
      uEdge: { value: new Color(c.edge) }
    },
    defines,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    toneMapped: false
  })
}

/** Drive a flame: `power` 0..1 (off .. full burn), the mission clock. */
export const setFlame = (m: ShaderMaterial, power: number, time: number): void => {
  m.uniforms.uPower!.value = power
  m.uniforms.uTime!.value = time
}
