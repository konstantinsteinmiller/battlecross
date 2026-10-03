import {
  Color, ShaderMaterial, BackSide, FrontSide, UniformsLib, UniformsUtils, Vector3, MeshBasicMaterial,
  type Camera, type Material, type Texture, type IUniform
} from 'three'

/**
 * ─── The cel-shaded look (GDD §2.2) ──────────────────────────────────────────
 *
 * Every lit surface is ONE small shader: a two-tone step ramp over an albedo
 * that comes from vertex colours (and, optionally, an albedo map). No specular,
 * no normal maps, no light loop:
 *
 *   lit    = step(0.45, N·L remapped to 0..1)
 *   shadow = albedo × 0.65, tinted toward a deep purple-blue
 *   light  = albedo × 1.25, flat
 *
 * and every character carries an inverted-hull outline in a deep charcoal
 * (never pure black) whose width is constant ON SCREEN: the hull is pushed out
 * in proportion to its view depth, so a far goblin and a near hero wear the
 * same line.
 *
 * The shader uses three's own skinning / instancing / fog chunks, so the same
 * material shades a skinned rig, an instanced prop and static terrain. The
 * light direction, the tints and the outline's reference depth are SHARED
 * uniform objects: one write per frame reaches every material.
 */

/** GDD: light intensity threshold of the ramp. */
export const CEL_THRESHOLD = 0.45
/** GDD: shadow = base × 0.65, tinted toward deep purple / blue. */
export const CEL_SHADOW = 0.65
export const CEL_SHADOW_TINT = new Color(0.86, 0.82, 1.0)
/** GDD: highlight = base × 1.25, flattened. */
export const CEL_LIGHT = 1.25
/** GDD: RGBA(15, 12, 25, 255) — deep dark charcoal, never pure black. */
export const OUTLINE_COLOR = new Color(15 / 255, 12 / 255, 25 / 255)
/** GDD: outline width in world units at the camera's reference depth. */
export const OUTLINE_WIDTH = 0.035

// ─── Shared uniforms (one object, every material) ───────────────────────────

const sharedLightDir: IUniform<Vector3> = { value: new Vector3(0.35, 0.8, 0.45).normalize() }
const sharedShadowTint: IUniform<Color> = { value: CEL_SHADOW_TINT.clone().multiplyScalar(CEL_SHADOW) }
const sharedLight: IUniform<number> = { value: CEL_LIGHT }
const sharedThreshold: IUniform<number> = { value: CEL_THRESHOLD }
/** Tints the whole lit world (a zone's mood: warm dusk, cold cave, void). */
const sharedAmbient: IUniform<Color> = { value: new Color(1, 1, 1) }
/** View depth at which an outline is exactly its nominal width. */
const sharedRefDepth: IUniform<number> = { value: 18 }

const WORLD_LIGHT = new Vector3(0.4, 0.82, 0.42).normalize()
const _v = new Vector3()

/** Per frame: the world light as the camera sees it, and the outline's
 *  reference depth (the follow camera's distance to its target). */
export const updateCelFrame = (camera: Camera, refDepth: number): void => {
  _v.copy(WORLD_LIGHT).transformDirection(camera.matrixWorldInverse)
  sharedLightDir.value.copy(_v)
  sharedRefDepth.value = Math.max(1, refDepth)
}

/** A zone's light: where it comes from and how it colours the world. */
export const setCelMood = (opts: { light?: [number, number, number]; ambient?: string; shadowTint?: string } = {}): void => {
  if (opts.light) WORLD_LIGHT.set(opts.light[0], opts.light[1], opts.light[2]).normalize()
  sharedAmbient.value.set(opts.ambient ?? '#ffffff')
  sharedShadowTint.value.set(opts.shadowTint ?? '#dbd1ff').multiplyScalar(CEL_SHADOW)
}

// ─── The cel material ───────────────────────────────────────────────────────

const CEL_VERT = /* glsl */`
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <skinning_pars_vertex>
#include <fog_pars_vertex>
varying vec3 vViewNormal;
#ifdef USE_CEL_MAP
varying vec2 vCelUv;
#endif
void main() {
  #include <color_vertex>
  #include <beginnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  vViewNormal = normalize(transformedNormal);
  #ifdef USE_CEL_MAP
  vCelUv = uv;
  #endif
  #include <begin_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  #include <fog_vertex>
}
`

const CEL_FRAG = /* glsl */`
#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
uniform vec3 uLightDir;
uniform vec3 uShadowTint;
uniform vec3 uAmbient;
uniform float uLight;
uniform float uThreshold;
uniform vec3 uTint;
uniform vec3 uFlash;
uniform float uFlashK;
uniform float uOpacity;
uniform float uUnlit;
#ifdef USE_CEL_MAP
uniform sampler2D uMap;
varying vec2 vCelUv;
#endif
varying vec3 vViewNormal;
void main() {
  vec3 base = uTint;
  #ifdef USE_COLOR
  base *= vColor.rgb;
  #endif
  #ifdef USE_CEL_MAP
  base *= texture2D(uMap, vCelUv).rgb;
  #endif
  float ndl = dot(normalize(vViewNormal), uLightDir) * 0.5 + 0.5;
  // The ramp is a hard step; the 1.2 % shoulder only anti-aliases the edge.
  float lit = smoothstep(uThreshold - 0.012, uThreshold + 0.012, ndl);
  vec3 col = mix(base * uShadowTint, min(base * uLight, vec3(1.0)), lit) * uAmbient;
  col = mix(col, base, uUnlit);
  col = mix(col, uFlash, uFlashK);
  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`

export interface CelOptions {
  /** Flat colour over the vertex colours (sRGB hex). */
  tint?: string
  /** Use the geometry's vertex colours. Default true. */
  vertexColors?: boolean
  /** Albedo map (needs uvs). */
  map?: Texture
  /** Starts see-through (a ghost, a stealthed hero). */
  transparent?: boolean
}

export type CelMaterial = ShaderMaterial

const makeCel = (o: CelOptions = {}): CelMaterial => {
  const m = new ShaderMaterial({
    uniforms: UniformsUtils.merge([
      UniformsLib.fog,
      {
        uTint: { value: new Color(o.tint ?? '#ffffff') },
        uFlash: { value: new Color(1, 1, 1) },
        uFlashK: { value: 0 },
        uOpacity: { value: 1 },
        uUnlit: { value: 0 },
        uMap: { value: o.map ?? null }
      }
    ]),
    vertexShader: CEL_VERT,
    fragmentShader: CEL_FRAG,
    vertexColors: o.vertexColors !== false,
    fog: true,
    side: FrontSide,
    transparent: !!o.transparent
  })
  // Shared by reference (after `merge`, which would have cloned them).
  m.uniforms.uLightDir = sharedLightDir
  m.uniforms.uShadowTint = sharedShadowTint
  m.uniforms.uAmbient = sharedAmbient
  m.uniforms.uLight = sharedLight
  m.uniforms.uThreshold = sharedThreshold
  if (o.map) m.defines.USE_CEL_MAP = ''
  return m
}

let vcShared: CelMaterial | null = null
/** Shared vertex-coloured cel material (terrain, props: nothing that flashes). */
export const celVC = (): CelMaterial => (vcShared ??= makeCel())

// One material object per variant three compiles: a material drawn by both
// plain and instanced meshes makes three re-derive its program (parameters and
// cache key) every time the draw order alternates between the two — dozens of
// times a frame in a zone (`PERF-LEDGER.md`). The instanced scenery and
// props get their own (same shader, same program).
let vcInstShared: CelMaterial | null = null
/** `celVC` for instanced meshes. */
export const celVCInst = (): CelMaterial => (vcInstShared ??= makeCel())

const flatCache = new Map<string, CelMaterial>()
/** Shared (cached) cel material of one flat colour. */
export const cel = (hex: string): CelMaterial => {
  const hit = flatCache.get(hex)
  if (hit) return hit
  const m = makeCel({ tint: hex, vertexColors: false })
  flatCache.set(hex, m)
  return m
}

const mapCache = new Map<Texture, CelMaterial>()
/** Vertex-coloured cel material with an albedo / detail map. */
export const celVCMap = (map: Texture): CelMaterial => {
  const hit = mapCache.get(map)
  if (hit) return hit
  const m = makeCel({ map })
  mapCache.set(map, m)
  return m
}

/** A PER-CHARACTER cel material. Not cached: each rig owns its hit flash, its
 *  tint and its opacity. Same defines → same GL program, so an extra rig costs
 *  a uniform upload, never a shader compile. */
export const rigToon = (): CelMaterial => makeCel()

/** Unlit vertex-coloured material for glowing parts (eyes, runes, cores). */
export const rigGlow = (): MeshBasicMaterial =>
  new MeshBasicMaterial({ vertexColors: true, toneMapped: false })

let glowShared: MeshBasicMaterial | null = null
export const glowVC = (): MeshBasicMaterial => (glowShared ??= rigGlow())
let glowInstShared: MeshBasicMaterial | null = null
/** `glowVC` for instanced meshes (see `celVCInst`). */
export const glowVCInst = (): MeshBasicMaterial => (glowInstShared ??= rigGlow())

const basicCache = new Map<string, MeshBasicMaterial>()
export const glow = (hex: string): MeshBasicMaterial => {
  const hit = basicCache.get(hex)
  if (hit) return hit
  const m = new MeshBasicMaterial({ color: new Color(hex), toneMapped: false })
  basicCache.set(hex, m)
  return m
}

/** Hit flash: blend the whole surface toward `hex` by `k` (0..1). */
export const setCelFlash = (m: Material, k: number, hex?: string): void => {
  const u = (m as ShaderMaterial).uniforms
  if (!u?.uFlashK) return
  u.uFlashK.value = k
  if (hex) (u.uFlash!.value as Color).set(hex)
}

/** Fade a rig (stealth, a summoned spirit, a death fade). */
export const setCelOpacity = (m: Material, opacity: number): void => {
  const u = (m as ShaderMaterial).uniforms
  if (!u?.uOpacity) return
  u.uOpacity.value = opacity
  const t = opacity < 0.999
  if (m.transparent !== t) {
    m.transparent = t
    m.depthWrite = !t
    m.needsUpdate = true
  }
}

/** Multiply the surface colour (petrified grey, frozen blue, a recolour). */
export const setCelTint = (m: Material, hex: string): void => {
  const u = (m as ShaderMaterial).uniforms
  if (u?.uTint) (u.uTint.value as Color).set(hex)
}

// ─── Inverted-hull outline ───────────────────────────────────────────────────
//
// A back-face-only copy of the mesh pushed out along its normals. ONE extra
// draw call per rig, bound to the same skeleton. The push scales with view
// depth (`uRefDepth` = the follow camera's distance), which is what keeps the
// line the same width on screen at any distance.

const OUTLINE_VERT = /* glsl */`
#include <common>
#include <skinning_pars_vertex>
#include <fog_pars_vertex>
uniform float uThickness;
uniform float uRefDepth;
void main() {
  #include <skinbase_vertex>
  #include <beginnormal_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  vec4 celPos = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
  celPos = instanceMatrix * celPos;
  #endif
  float celDepth = max(0.5, -(modelViewMatrix * celPos).z);
  transformed += normalize(objectNormal) * uThickness * celDepth / uRefDepth;
  #include <project_vertex>
  #include <fog_vertex>
}
`
const OUTLINE_FRAG = /* glsl */`
#include <common>
#include <fog_pars_fragment>
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  gl_FragColor = vec4(uColor, uOpacity);
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`

const outlineCache = new Map<string, ShaderMaterial>()
/** Outline material of a given nominal thickness. Cached per thickness (and
 *  per use: `instanced` for instanced meshes, see `celVCInst`). */
export const outlineMat = (thickness = OUTLINE_WIDTH, color: Color = OUTLINE_COLOR, instanced = false): ShaderMaterial => {
  const key = `${thickness.toFixed(4)}|${color.getHexString()}${instanced ? '|i' : ''}`
  const hit = outlineCache.get(key)
  if (hit) return hit
  const m = new ShaderMaterial({
    uniforms: UniformsUtils.merge([
      UniformsLib.fog,
      {
        uThickness: { value: thickness },
        uColor: { value: color.clone() },
        uOpacity: { value: 1 }
      }
    ]),
    vertexShader: OUTLINE_VERT,
    fragmentShader: OUTLINE_FRAG,
    side: BackSide,
    fog: true
  })
  m.uniforms.uRefDepth = sharedRefDepth
  outlineCache.set(key, m)
  return m
}

/** A rig's OWN outline material (so it can fade with the rig). */
export const rigOutline = (thickness = OUTLINE_WIDTH): ShaderMaterial => {
  const m = outlineMat(thickness).clone()
  m.uniforms.uRefDepth = sharedRefDepth
  return m
}

export const setOutlineOpacity = (m: Material, opacity: number): void => {
  const u = (m as ShaderMaterial).uniforms
  if (!u?.uOpacity) return
  u.uOpacity.value = opacity
  m.visible = opacity > 0.02
  const t = opacity < 0.999
  if (m.transparent !== t) {
    m.transparent = t
    m.needsUpdate = true
  }
}

/** Scratch colour for vertex-colour writes (linear space). */
const tmp = new Color()
export const lin = (hex: string): Color => tmp.set(hex)

export const disposeMaterial = (m: Material | Material[]): void => {
  if (Array.isArray(m)) m.forEach(x => x.dispose())
  else m.dispose()
}
