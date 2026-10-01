import {
  AdditiveBlending, Color, DoubleSide, Group, Mesh, PlaneGeometry, ShaderMaterial, type BufferGeometry
} from 'three'
import { rbox, rcyl, torus, xform, paint, merge } from '../kit'
import { toonVC, outlineMat } from '../toon'

/**
 * The Polarity Works' props (`sim/stages/magnet.ts`):
 *
 *  - a magnet rail's floor: a steel strip with raised edge rails and a field
 *    of chevrons that scroll the way it pulls, red (north) or blue (south) —
 *    the colour and the arrows both say which way Flux will be dragged;
 *  - its polarity panel: a round plate on a wall, half red half blue with a
 *    lit ring in the colour of the rail's pull now. Shoot it to flip.
 *
 * The chevrons are one additive shader quad per rail (no textures, nothing
 * per step but two uniforms).
 */

export const NORTH = '#ff4a5e'
export const SOUTH = '#5a8cff'

const STEEL = '#59607a'
const EDGE = '#a7afc4'

const VERT = /* glsl */ `
varying vec2 vP;
void main() {
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Chevrons along uDir (in the quad's plane), scrolling at uSpeed; bright
// rails along both long edges. uFlick dims it in the flip's warning.
const FRAG = /* glsl */ `
uniform vec2 uDir;
uniform vec2 uHalf;
uniform float uTime;
uniform vec3 uColor;
uniform float uAlpha;
varying vec2 vP;
void main() {
  float a = dot(vP, uDir);
  vec2 n = vec2(-uDir.y, uDir.x);
  float c = dot(vP, n);
  float across = abs(dot(uHalf, abs(n)));
  float v = fract((a - abs(c) * 0.55) / 1.5 - uTime * 1.6);
  float chev = smoothstep(0.0, 0.07, v) * (1.0 - smoothstep(0.26, 0.36, v));
  chev *= 1.0 - smoothstep(across - 0.5, across - 0.15, abs(c));
  float edge = smoothstep(across - 0.32, across - 0.12, abs(c));
  gl_FragColor = vec4(uColor, (chev * 0.85 + edge * 0.55) * uAlpha);
}
`

export interface MagnetRailMesh {
  root: Group
  mat: ShaderMaterial
}

/** The floor of a rail over the rectangle (x0, z0)–(x1, z1) at height y. */
export const buildMagnetRail = (x0: number, z0: number, x1: number, z1: number, y: number): MagnetRailMesh => {
  const w = x1 - x0
  const d = z1 - z0
  const root = new Group()
  root.position.set((x0 + x1) / 2, y, (z0 + z1) / 2)
  // The steel strip and its edge rails (along the longer side).
  const along = w >= d
  const parts: BufferGeometry[] = [xform(paint(rbox(w - 0.1, 0.06, d - 0.1, 0.02, 4, 2), STEEL), [0, 0.03, 0])]
  for (const s of [-1, 1]) {
    parts.push(along
      ? xform(paint(rbox(w - 0.1, 0.12, 0.16, 0.04, 4, 2), EDGE), [0, 0.06, s * (d / 2 - 0.2)])
      : xform(paint(rbox(0.16, 0.12, d - 0.1, 0.04, 4, 2), EDGE), [s * (w / 2 - 0.2), 0.06, 0]))
  }
  const g = merge(parts)
  root.add(new Mesh(g, toonVC()))
  const mat = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uDir: { value: [1, 0] },
      uHalf: { value: [w / 2, d / 2] },
      uTime: { value: 0 },
      uColor: { value: new Color(NORTH) },
      uAlpha: { value: 1 }
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    toneMapped: false
  })
  const quad = new Mesh(new PlaneGeometry(w, d), mat)
  // The quad lies flat: its local (x, y) is the world's (x, −z).
  quad.rotation.x = -Math.PI / 2
  quad.position.y = 0.075
  quad.renderOrder = 2
  root.add(quad)
  return { root, mat }
}

/** Point a rail's chevrons along world (dx, dz) in `color`. */
export const setRailPull = (m: MagnetRailMesh, dx: number, dz: number, color: string): void => {
  const u = m.mat.uniforms
  // World (dx, dz) in the quad's plane: x stays, z flips.
  u.uDir!.value = [dx, -dz]
  ;(u.uColor!.value as Color).set(color)
}

export interface PolarityPanelMesh {
  root: Group
  /** The lit ring: its colour is the rail's pull now. */
  ring: Mesh
}

let plateGeo: BufferGeometry | null = null

/** A polarity panel facing +Z (the caller turns it to face the room). */
export const buildPolarityPanel = (): PolarityPanelMesh => {
  if (!plateGeo) {
    plateGeo = merge([
      xform(paint(rcyl(0.42, 0.1, 0.03, 24), '#2a2f40'), [0, 0, 0.05], [Math.PI / 2, 0, 0]),
      // Half red, half blue: the two poles (two thin half-discs side by side).
      xform(paint(rbox(0.28, 0.52, 0.04, 0.12, 6, 4), NORTH), [-0.15, 0, 0.12]),
      xform(paint(rbox(0.28, 0.52, 0.04, 0.12, 6, 4), SOUTH), [0.15, 0, 0.12])
    ])
  }
  const root = new Group()
  root.add(new Mesh(plateGeo, toonVC()))
  const o = new Mesh(plateGeo, outlineMat(0.02))
  o.renderOrder = -1
  root.add(o)
  const ring = new Mesh(torus(0.44, 0.045, 6, 28), new ShaderMaterial({
    vertexShader: 'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform vec3 uColor;void main(){gl_FragColor=vec4(uColor,1.0);}',
    uniforms: { uColor: { value: new Color(NORTH) } },
    toneMapped: false
  }))
  ring.position.z = 0.12
  root.add(ring)
  return { root, ring }
}

export const setPanelColor = (p: PolarityPanelMesh, color: string, bright = 1): void => {
  const c = ((p.ring.material as ShaderMaterial).uniforms.uColor!.value as Color)
  c.set(color).multiplyScalar(bright)
}
