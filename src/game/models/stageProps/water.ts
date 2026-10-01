import { Color, DoubleSide, Group, Mesh, PlaneGeometry, ShaderMaterial, type BufferGeometry } from 'three'
import { rbox, rcyl, sph, torus, xform, paint, merge } from '../kit'
import { toonVC, outlineMat } from '../toon'

/**
 * The Tidewater Locks' props (`sim/stages/water.ts`):
 *
 *  - a water surface over a zone: one translucent quad, rippling (two
 *    crossing sine sets in the fragment shader), foam at its rim, raised
 *    and lowered with the tide (its `y`);
 *  - a lock's valve: a red wheel on a wall that spins and turns green when
 *    shot (the lock drains).
 */

const WATER_VERT = /* glsl */ `
varying vec2 vP;
void main() {
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const WATER_FRAG = /* glsl */ `
uniform float uTime;
uniform vec2 uHalf;
uniform vec3 uDeep;
uniform vec3 uLight;
uniform float uFlow;
uniform vec2 uDir;
varying vec2 vP;
void main() {
  vec2 p = vP - uDir * uTime * uFlow;
  float r = sin(p.x * 1.7 + uTime * 1.3) * 0.5 + sin(p.y * 2.1 - uTime * 1.1) * 0.5;
  r += sin((p.x + p.y) * 3.3 + uTime * 2.0) * 0.25;
  float glint = smoothstep(0.75, 1.0, r * 0.5 + 0.5);
  vec2 e = uHalf - abs(vP);
  float rim = 1.0 - smoothstep(0.0, 0.35, min(e.x, e.y));
  vec3 c = mix(uDeep, uLight, 0.35 + 0.35 * (r * 0.5 + 0.5)) + glint * 0.35 + rim * 0.5;
  gl_FragColor = vec4(c, 0.62 + 0.25 * rim);
}
`

export interface WaterMesh {
  mesh: Mesh
  mat: ShaderMaterial
}

/** The surface over (x0, z0)–(x1, z1); the caller sets `mesh.position.y`. */
export const buildWater = (x0: number, z0: number, x1: number, z1: number, flow = 0, dx = 0, dz = 0): WaterMesh => {
  const w = x1 - x0
  const d = z1 - z0
  const mat = new ShaderMaterial({
    vertexShader: WATER_VERT,
    fragmentShader: WATER_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uHalf: { value: [w / 2, d / 2] },
      uDeep: { value: new Color('#1d6fb8') },
      uLight: { value: new Color('#5fd2ff') },
      uFlow: { value: flow },
      // World (dx, dz) in the quad's plane: x stays, z flips.
      uDir: { value: [dx, -dz] }
    },
    transparent: true,
    depthWrite: false,
    side: DoubleSide
  })
  const mesh = new Mesh(new PlaneGeometry(w, d), mat)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2)
  mesh.renderOrder = 3
  return { mesh, mat }
}

export interface ValveMesh {
  root: Group
  wheel: Group
  /** The rim: red while the lock is shut, green once it drains. */
  rim: Mesh
}

let hubGeo: BufferGeometry | null = null

/** A valve wheel facing +Z (the caller turns it to face the room). */
export const buildValve = (): ValveMesh => {
  if (!hubGeo) {
    hubGeo = merge([
      xform(paint(rbox(0.5, 0.5, 0.16, 0.3), '#4a5468'), [0, 0, 0]),
      xform(paint(rcyl(0.07, 0.4, 0.02, 10), '#6a7488'), [0, 0, 0.2], [Math.PI / 2, 0, 0])
    ])
  }
  const root = new Group()
  root.add(new Mesh(hubGeo, toonVC()))
  const wheel = new Group()
  wheel.position.z = 0.42
  const spokes = merge([
    xform(paint(sph(0.09, 10, 8), '#d8dde8'), [0, 0, 0]),
    ...[0, 1, 2, 3].map(k => xform(paint(rbox(0.05, 0.62, 0.05, 0.3), '#d8dde8'), [0, 0, 0], [0, 0, (k * Math.PI) / 4]))
  ])
  wheel.add(new Mesh(spokes, toonVC()))
  const rim = new Mesh(torus(0.33, 0.06, 8, 26), new ShaderMaterial({
    vertexShader: 'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform vec3 uColor;void main(){gl_FragColor=vec4(uColor,1.0);}',
    uniforms: { uColor: { value: new Color('#ff4a3a') } },
    toneMapped: false
  }))
  wheel.add(rim)
  const o = new Mesh(spokes, outlineMat(0.02))
  o.renderOrder = -1
  wheel.add(o)
  root.add(wheel)
  return { root, wheel, rim }
}

export const setValveColor = (v: ValveMesh, hex: string): void => {
  ((v.rim.material as ShaderMaterial).uniforms.uColor!.value as Color).set(hex)
}
