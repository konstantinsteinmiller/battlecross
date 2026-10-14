import {
  Color, ShaderMaterial, BackSide, FrontSide, UniformsLib, UniformsUtils, Vector3, Vector4, MeshBasicMaterial,
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
/** The see-through hole round the hero: their spot on screen (NDC x, y), their
 *  view depth, on; and its radius (NDC y), the screen's aspect, the knee height. */
const sharedSee: IUniform<Vector4> = { value: new Vector4(0, 0, 0, 0) }
const sharedSeeR: IUniform<Vector3> = { value: new Vector3(0.4, 1, 0) }

/**
 * The haze at the edge of the walkable world (roadmap #83). One soft field of
 * how far each spot lies from where the hero can walk (`gfx/edgeFog.ts`),
 * sampled by the ground, the land beyond, the scenery and the scenery's
 * outlines alike: the playfield sinks into a dusk instead of ending on a line
 * (two meshes shaded apart, a step in a capped distance, lit props on dark
 * ground). Off (strength 0) where no zone has set one.
 */
const sharedEdgeTex: IUniform<Texture | null> = { value: null }
/** The field's world corner (x, z) and 1 / its size in metres. */
const sharedEdgeXf: IUniform<Vector4> = { value: new Vector4(0, 0, 1, 1) }
/** Where the haze begins and is full (m past the walkable), its strength, the field's top value (m). */
const sharedEdgeK: IUniform<Vector4> = { value: new Vector4(1, 9, 0, 24) }
const sharedEdgeCol: IUniform<Color> = { value: new Color('#1b1626') }

/** Lay the edge haze over the world (`tex`: the field; red 1 = `maxD` metres out). */
export const setEdgeFog = (tex: Texture, x0: number, z0: number, sizeX: number, sizeZ: number, maxD: number, from: number, to: number, strength: number, hex: string): void => {
  sharedEdgeTex.value = tex
  sharedEdgeXf.value.set(x0, z0, 1 / sizeX, 1 / sizeZ)
  sharedEdgeK.value.set(from, to, strength, maxD)
  sharedEdgeCol.value.set(hex)
}

/** No haze (the zone is gone). */
export const clearEdgeFog = (tex?: Texture): void => {
  if (tex && sharedEdgeTex.value !== tex) return
  sharedEdgeK.value.z = 0
}

/** The haze's numbers, for tests. */
export const edgeFogState = (): { on: boolean; from: number; to: number; strength: number } =>
  ({ on: sharedEdgeK.value.z > 0 && !!sharedEdgeTex.value, from: sharedEdgeK.value.x, to: sharedEdgeK.value.y, strength: sharedEdgeK.value.z })

/** Let a material sink into the edge haze. */
export const edgeFog = <T extends ShaderMaterial>(m: T): T => {
  m.defines.EDGE_FOG = ''
  m.uniforms.uEdgeTex = sharedEdgeTex
  m.uniforms.uEdgeXf = sharedEdgeXf
  m.uniforms.uEdgeK = sharedEdgeK
  m.uniforms.uEdgeCol = sharedEdgeCol
  return m
}

/** GLSL: how deep in the haze a fragment stands (0..strength). */
export const EDGE_FOG_K = 'uEdgeK.z * smoothstep(uEdgeK.x, uEdgeK.y, texture2D(uEdgeTex, vEdgeUv).r * uEdgeK.w)'

const WORLD_LIGHT = new Vector3(0.4, 0.82, 0.42).normalize()
const _v = new Vector3()

/** Per frame: the world light as the camera sees it, and the outline's
 *  reference depth (the follow camera's distance to its target). */
export const updateCelFrame = (camera: Camera, refDepth: number): void => {
  _v.copy(WORLD_LIGHT).transformDirection(camera.matrixWorldInverse)
  sharedLightDir.value.copy(_v)
  sharedRefDepth.value = Math.max(1, refDepth)
}

/** A close-up's own key light, in VIEW space (a figure on a turntable, #125):
 *  the world light seen from the side lights every face he shows, and he
 *  reads flat. The next `updateCelFrame` puts the world light back. */
export const setCelViewLight = (x: number, y: number, z: number): void => {
  sharedLightDir.value.set(x, y, z).normalize()
}

const _see = new Vector3()

/**
 * Per frame: where the hero is, for the scenery to open a see-through hole
 * round them (`SEE_THROUGH`: instanced scenery and its outlines). `on`
 * false closes it (a cut-scene, no hero).
 */
export const updateSeeThrough = (camera: Camera, x: number, y: number, z: number, on: boolean, aspect: number): void => {
  const s = sharedSee.value
  s.w = on ? 1 : 0
  if (!on) return
  _see.set(x, y + 0.9, z).applyMatrix4(camera.matrixWorldInverse)
  s.z = -_see.z
  _see.set(x, y + 0.9, z).project(camera)
  s.x = _see.x
  s.y = _see.y
  sharedSeeR.value.y = aspect
  sharedSeeR.value.z = y + 0.35
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
#ifdef SEE_THROUGH
varying vec4 vSeeClip;
varying float vSeeDepth;
varying float vSeeY;
#endif
#ifdef EDGE_FOG
uniform vec4 uEdgeXf;
varying vec2 vEdgeUv;
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
  #ifdef EDGE_FOG
  vec4 edgeW = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
  edgeW = instanceMatrix * edgeW;
  #endif
  edgeW = modelMatrix * edgeW;
  vEdgeUv = (edgeW.xz - uEdgeXf.xy) * uEdgeXf.zw;
  #endif
  #ifdef SEE_THROUGH
  vSeeClip = gl_Position;
  vSeeDepth = -mvPosition.z;
  vec4 seeW = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
  seeW = instanceMatrix * seeW;
  #endif
  vSeeY = (modelMatrix * seeW).y;
  #endif
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
uniform vec3 uRim;
uniform float uRimK;
#ifdef USE_CEL_MAP
uniform sampler2D uMap;
varying vec2 vCelUv;
#endif
varying vec3 vViewNormal;
#ifdef SEE_THROUGH
uniform vec4 uSee;
uniform vec3 uSeeR;
varying vec4 vSeeClip;
varying float vSeeDepth;
varying float vSeeY;
float seeBayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float seeBayer4(vec2 a) { return seeBayer2(0.5 * a) * 0.25 + seeBayer2(a); }
#endif
#ifdef EDGE_FOG
uniform sampler2D uEdgeTex;
uniform vec4 uEdgeK;
uniform vec3 uEdgeCol;
varying vec2 vEdgeUv;
#endif
void main() {
  #ifdef SEE_THROUGH
  // In front of the hero (nearer the camera), above their knees, round them on
  // screen: an ordered dither takes most of it away (no sorting, no blending).
  if (uSee.w > 0.5 && vSeeDepth < uSee.z - 0.8 && vSeeY > uSeeR.z) {
    vec2 seeD = (vSeeClip.xy / vSeeClip.w - uSee.xy) * vec2(uSeeR.y, 1.0);
    float seeK = 1.0 - smoothstep(uSeeR.x * 0.5, uSeeR.x, length(seeD));
    if (seeK * 0.8 > seeBayer4(gl_FragCoord.xy)) discard;
  }
  #endif
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
  // A rim of light round the silhouette (a boss's presence, #74): a hard band
  // where the surface turns away from the camera, cel like the rest.
  float rim = 1.0 - max(0.0, normalize(vViewNormal).z);
  col += uRim * uRimK * smoothstep(0.58, 0.62, rim);
  col = mix(col, base, uUnlit);
  col = mix(col, uFlash, uFlashK);
  #ifdef EDGE_FOG
  col = mix(col, uEdgeCol, ${EDGE_FOG_K});
  #endif
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
        uRim: { value: new Color(0, 0, 0) },
        uRimK: { value: 0 },
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
/** `celVC` for instanced meshes: the scenery, so it opens round the hero (`SEE_THROUGH`). */
export const celVCInst = (): CelMaterial => (vcInstShared ??= edgeFog(seeThrough(makeCel())))

/** Let a material open its see-through hole round the hero. */
const seeThrough = <T extends ShaderMaterial>(m: T): T => {
  m.defines.SEE_THROUGH = ''
  m.uniforms.uSee = sharedSee
  m.uniforms.uSeeR = sharedSeeR
  return m
}

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

const mapEdgeCache = new Map<Texture, CelMaterial>()
/** `celVCMap` that sinks into the edge haze (the land beyond the playfield). */
export const celVCMapEdge = (map: Texture): CelMaterial => {
  const hit = mapEdgeCache.get(map)
  if (hit) return hit
  const m = edgeFog(makeCel({ map }))
  mapEdgeCache.set(map, m)
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
/** A rim of light in `hex` round a rig's silhouette, `k` strong (0: none). */
export const setCelRim = (m: Material, hex: string, k: number): void => {
  const u = (m as ShaderMaterial).uniforms
  if (!u?.uRimK) return
  u.uRimK.value = k
  ;(u.uRim!.value as Color).set(hex)
}

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
#ifdef SEE_THROUGH
varying vec4 vSeeClip;
varying float vSeeDepth;
varying float vSeeY;
#endif
#ifdef EDGE_FOG
uniform vec4 uEdgeXf;
varying vec2 vEdgeUv;
#endif
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
  #ifdef EDGE_FOG
  vec4 edgeW = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
  edgeW = instanceMatrix * edgeW;
  #endif
  edgeW = modelMatrix * edgeW;
  vEdgeUv = (edgeW.xz - uEdgeXf.xy) * uEdgeXf.zw;
  #endif
  #ifdef SEE_THROUGH
  vSeeClip = gl_Position;
  vSeeDepth = -mvPosition.z;
  vec4 seeW = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
  seeW = instanceMatrix * seeW;
  #endif
  vSeeY = (modelMatrix * seeW).y;
  #endif
  #include <fog_vertex>
}
`
const OUTLINE_FRAG = /* glsl */`
#include <common>
#include <fog_pars_fragment>
uniform vec3 uColor;
uniform float uOpacity;
#ifdef EDGE_FOG
uniform sampler2D uEdgeTex;
uniform vec4 uEdgeK;
uniform vec3 uEdgeCol;
varying vec2 vEdgeUv;
#endif
#ifdef SEE_THROUGH
uniform vec4 uSee;
uniform vec3 uSeeR;
varying vec4 vSeeClip;
varying float vSeeDepth;
varying float vSeeY;
float seeBayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float seeBayer4(vec2 a) { return seeBayer2(0.5 * a) * 0.25 + seeBayer2(a); }
#endif
void main() {
  #ifdef SEE_THROUGH
  // In front of the hero (nearer the camera), above their knees, round them on
  // screen: an ordered dither takes most of it away (no sorting, no blending).
  if (uSee.w > 0.5 && vSeeDepth < uSee.z - 0.8 && vSeeY > uSeeR.z) {
    vec2 seeD = (vSeeClip.xy / vSeeClip.w - uSee.xy) * vec2(uSeeR.y, 1.0);
    float seeK = 1.0 - smoothstep(uSeeR.x * 0.55, uSeeR.x, length(seeD));
    if (seeK * 0.85 > seeBayer4(gl_FragCoord.xy)) discard;
  }
  #endif
  vec3 ink = uColor;
  #ifdef EDGE_FOG
  // The ink fades into the haze with what it outlines.
  ink = mix(ink, uEdgeCol, ${EDGE_FOG_K});
  #endif
  gl_FragColor = vec4(ink, uOpacity);
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`

const outlineCache = new Map<string, ShaderMaterial>()
/** The scenery's outlines (instanced), switched off together by the effects ladder. */
const sceneryOutlines = new Set<ShaderMaterial>()
let sceneryOutlinesOn = true

/** Draw the scenery's outlines (rocks, trees, props), or not (`engine/effectsLadder.ts`). */
export const setSceneryOutlines = (on: boolean): void => {
  sceneryOutlinesOn = on
  for (const m of sceneryOutlines) m.visible = on
}
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
  if (instanced) {
    edgeFog(seeThrough(m))
    sceneryOutlines.add(m)
    m.visible = sceneryOutlinesOn
  }
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
