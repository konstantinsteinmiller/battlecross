import { DataTexture, FloatType, NearestFilter, RedFormat, Vector4, type IUniform } from 'three'
import { CELL } from '../sim/grid'
import { groundY, type HeightField } from '../sim/ground'

/**
 * ─── The ground under the view (roadmap #57) ─────────────────────────────────
 *
 * ONE accessor for the height of the live place's ground, set when a zone is
 * built and cleared when it goes: everything that stands on the ground asks it
 * here instead of being handed the plan.
 *
 *   • on the CPU, `groundAt(x, z)`: the sim's own bilinear `groundY` (four
 *     array reads), for a unit's feet, a shadow, a prop, an effect's origin;
 *   • on the GPU, `GROUND_GLSL`'s `groundY(xz)`: the same surface read from a
 *     float texture in the vertex shader, so a big ground mark (a telegraph,
 *     a skill's range ring) lies ON a hill instead of cutting through it.
 *
 * Convention for the effect layers (`vfx.ts`, `particles.ts`, `markers.ts`,
 * `telegraphs.ts`): a y they are given is a height ABOVE the ground under
 * (x, z), exactly as it was when the ground was the plane y = 0.
 */

let field: HeightField | null = null

const blank = new DataTexture(new Float32Array(4), 2, 2, RedFormat, FloatType)
blank.needsUpdate = true

/** Each place's height texture, made once (the recorder cuts between prebuilt places). */
const textures = new WeakMap<HeightField, DataTexture>()

/** The live place's ground (null: flat at 0). */
export const setGround = (f: HeightField | null): void => {
  if (f === field) return
  field = f
  const u = groundUniforms.uGroundDim.value
  if (!f) {
    u.set(1, 1, 1 / CELL, 0)
    groundUniforms.uGround.value = blank
    return
  }
  let tex = textures.get(f)
  if (!tex) {
    tex = new DataTexture(f.height, f.w + 1, f.h + 1, RedFormat, FloatType)
    tex.minFilter = NearestFilter
    tex.magFilter = NearestFilter
    tex.needsUpdate = true
    textures.set(f, tex)
  }
  groundUniforms.uGround.value = tex
  u.set(f.w, f.h, 1 / CELL, 1)
}

/** A place is gone: its ground goes with it, unless another has set its own since. */
export const clearGround = (f: HeightField | null): void => {
  if (!f) return
  if (field === f) setGround(null)
  textures.get(f)?.dispose()
  textures.delete(f)
}

/** The ground's height under (x, z). */
export const groundAt = (x: number, z: number): number => (field ? groundY(field, x, z) : 0)

/** Rise per metre along x and z (finite differences half a metre either side). */
export const groundSlopeAt = (x: number, z: number, out: [number, number]): [number, number] => {
  if (!field) { out[0] = 0; out[1] = 0; return out }
  out[0] = (groundY(field, x + 0.5, z) - groundY(field, x - 0.5, z))
  out[1] = (groundY(field, x, z + 0.5) - groundY(field, x, z - 0.5))
  return out
}


/** Shared by reference into every material that reads the ground. */
export const groundUniforms: { uGround: IUniform<DataTexture | null>; uGroundDim: IUniform<Vector4> } = {
  uGround: { value: blank },
  // Cells across and down, 1 / cell size, and 1 while a ground is set.
  uGroundDim: { value: new Vector4(1, 1, 1 / CELL, 0) }
}

/** `float groundY(vec2 xz)`: the ground's height, bilinear, in a vertex shader. */
export const GROUND_GLSL = /* glsl */`
uniform sampler2D uGround;
uniform vec4 uGroundDim;
float groundY(vec2 xz) {
  if (uGroundDim.w < 0.5) return 0.0;
  vec2 f = clamp(xz * uGroundDim.z, vec2(0.0), uGroundDim.xy);
  vec2 i = min(floor(f), uGroundDim.xy - 1.0);
  vec2 t = f - i;
  vec2 texel = 1.0 / (uGroundDim.xy + 1.0);
  vec2 uv = (i + 0.5) * texel;
  float a = texture2D(uGround, uv).r;
  float b = texture2D(uGround, uv + vec2(texel.x, 0.0)).r;
  float c = texture2D(uGround, uv + vec2(0.0, texel.y)).r;
  float d = texture2D(uGround, uv + texel).r;
  return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
}
`

/** Hand the shared ground uniforms to a material's uniform table. */
export const withGround = <T extends Record<string, IUniform>>(u: T): T => {
  ;(u as Record<string, IUniform>).uGround = groundUniforms.uGround
  ;(u as Record<string, IUniform>).uGroundDim = groundUniforms.uGroundDim
  return u
}
