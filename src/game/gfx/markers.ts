import {
  BufferAttribute, CircleGeometry, Color, DoubleSide, DynamicDrawUsage, Group, InstancedBufferAttribute,
  InstancedBufferGeometry, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial, Vector2, Vector3, type Scene
} from 'three'
import { barGlyphs, softDisc } from './textures'
import { GROUND_GLSL, groundAt, groundSlopeAt, withGround } from './ground'

/**
 * ─── World-space UI ──────────────────────────────────────────────────────────
 *
 * The marks the player aims and reads by, drawn IN the scene so they sit under
 * the characters and scale with the camera:
 *
 *   • the hero's ring and the locked target's ring (framed by the target's rank);
 *   • the drag line from the hero to the pointer (GDD §7), gold over an enemy;
 *   • the tap marker where a move order landed;
 *   • a skill's aim preview (range ring + area disc) while its button is dragged;
 *   • blob shadows, and every health bar in one instanced draw.
 *
 * Rings, discs and lines share one small shader in the language of the ground
 * attack previews (`telegraphs.ts`): a crisp bright line on a dark hairline
 * over a soft fill, so each reads on grass, snow, lava and the void alike.
 */

const MARK_VERT = /* glsl */`
${GROUND_GLSL}
uniform vec2 uSize;   // half extents of the quad, metres
varying vec2 vP;
void main() {
  vP = position.xy * uSize;
  // Laid on the ground: each vertex of the (fine) quad sits on its height.
  vec4 wp = modelMatrix * vec4(position, 1.0);
  wp.y += groundY(wp.xz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const MARK_FRAG = /* glsl */`
uniform float uKind;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
uniform float uR;       // the ring's radius, or a line's half width
uniform float uLen;     // a line's length
uniform float uRank;    // 0 normal, 1 elite, 2 champion, 3 boss
varying vec2 vP;

const vec3 INK = vec3(0.06, 0.05, 0.1);

// A crisp line of half-width w around d = 0, and the dark hairline beside it.
void stroke(float d, float w, float aa, vec3 line, inout vec3 col, inout float a) {
  float ink = 1.0 - smoothstep(w + 0.018, w + 0.018 + aa, abs(d));
  col = mix(col, INK, ink * (1.0 - a * 0.5));
  a = max(a, ink * 0.55);
  float l = 1.0 - smoothstep(w - aa, w + aa, abs(d));
  col = mix(col, line, l);
  a = max(a, l);
}

void main() {
  vec2 p = vP;
  float r = length(p);
  float ang = atan(p.y, p.x);
  float aa = fwidth(r) * 1.1 + 0.003;
  vec3 col = uColor;
  float a = 0.0;
  if (uKind < 0.5) {
    // The hero's ring: a thin circle, four notches that turn, a breath of fill.
    a = 0.1 * (1.0 - smoothstep(uR - aa, uR + aa, r));
    float seg = step(0.14, abs(fract((ang + uTime * 0.7) / 1.5708) - 0.5));
    stroke(r - uR, 0.028, aa, uColor, col, a);
    a *= mix(0.25, 1.0, max(seg, step(r, uR - 0.05)));
    float tick = (1.0 - seg) * (1.0 - smoothstep(0.02, 0.02 + aa, abs(r - uR + 0.08)));
    col = mix(col, vec3(1.0), tick);
    a = max(a, tick);
  } else if (uKind < 1.5) {
    // The target's ring: brackets that turn round a soft fill; its rank adds
    // a second ring with studs, and a boss a crown of spikes.
    a = (0.12 + 0.05 * sin(uTime * 7.0)) * (1.0 - smoothstep(uR - aa, uR + aa, r));
    float gap = step(0.2, abs(fract((ang - uTime * 1.2) / 1.5708) - 0.5));
    float ring = (1.0 - gap);
    vec3 lc = uColor;
    float aRing = 0.0;
    vec3 cRing = col;
    stroke(r - uR, 0.04, aa, lc, cRing, aRing);
    col = mix(col, cRing, ring);
    a = max(a, aRing * ring);
    if (uRank > 0.5) {
      vec3 gold = uRank > 1.5 && uRank < 2.5 ? vec3(0.75, 0.92, 1.0) : vec3(1.0, 0.78, 0.25);
      float o = uR + 0.13;
      stroke(r - o, 0.018, aa, gold, col, a);
      // Studs at the four points.
      float qa = (fract(ang / 1.5708 + 0.5) - 0.5) * 1.5708;
      vec2 q = vec2(r * cos(qa) - o, r * sin(qa));
      float stud = abs(q.x) + abs(q.y) - 0.07;
      stroke(stud, 0.0, aa, gold, col, a);
      col = mix(col, gold, 1.0 - smoothstep(-aa, aa, stud));
      a = max(a, 1.0 - smoothstep(-aa, aa, stud));
      if (uRank > 2.5) {
        // A crown of spikes, turning against the brackets.
        float sa = (fract((ang + uTime * 0.5) / 0.7854) - 0.5) * 0.7854;
        float sr = o + 0.03 + 0.16 * (1.0 - smoothstep(0.0, 0.2, abs(sa) * r / 0.12));
        float spike = (1.0 - smoothstep(sr - aa, sr + aa, r)) * step(o, r);
        col = mix(col, gold, spike);
        a = max(a, spike);
      }
    }
  } else if (uKind < 2.5) {
    // A move order: a ring that closes on the spot, four chevrons pointing in.
    stroke(r - uR, 0.03, aa, uColor, col, a);
    float qa = (fract(ang / 1.5708 + 0.5) - 0.5) * 1.5708;
    vec2 q = vec2(r * cos(qa) - uR * 0.55, r * sin(qa));
    float chev = abs(abs(q.y) - (0.1 - q.x) * 0.8) - 0.02;
    float c = (1.0 - smoothstep(0.0, aa, chev)) * step(abs(q.x), 0.1);
    col = mix(col, uColor, c);
    a = max(a, c);
  } else if (uKind < 3.5) {
    // A skill's reach: a thin dashed circle.
    float dash = step(0.35, fract(ang * uR * 1.1 - uTime * 0.6));
    float aR = 0.0;
    vec3 cR = col;
    stroke(r - uR, 0.022, aa, uColor, cR, aR);
    col = cR;
    a = aR * mix(0.25, 0.9, dash);
  } else if (uKind < 4.5) {
    // A skill's area: soft fill, a crisp rim, four ticks pointing in.
    a = (0.16 + 0.05 * (r / uR) * (r / uR)) * (1.0 - smoothstep(uR - aa, uR + aa, r));
    stroke(r - uR + 0.04, 0.035, aa, mix(uColor, vec3(1.0), 0.45), col, a);
    float qa = (fract((ang + uTime * 0.4) / 1.5708 + 0.5) - 0.5) * 1.5708;
    vec2 q = vec2(r * cos(qa) - uR + 0.2, r * sin(qa));
    float t = max(abs(q.x) - 0.11, abs(q.y) - 0.022);
    float tick = 1.0 - smoothstep(0.0, aa, t);
    col = mix(col, vec3(1.0), tick);
    a = max(a, tick * 0.9);
    float dotc = 1.0 - smoothstep(0.05, 0.05 + aa, r);
    col = mix(col, vec3(1.0), dotc);
    a = max(a, dotc * 0.9);
  } else {
    // A line: two crisp rails, chevrons running along it, a head at the end.
    float w = uR;
    float y = p.y + uLen * 0.5;
    float head = clamp((y - (uLen - w * 2.6)) / (w * 2.6), 0.0, 1.0);
    float half_ = w * (1.0 + 0.8 * step(0.001, head) * (1.0 - head) - head);
    float d = abs(p.x) - half_;
    float inside = (1.0 - smoothstep(-aa, aa, d)) * step(0.0, y) * step(y, uLen);
    a = 0.2 * inside;
    float rail = (1.0 - smoothstep(0.02, 0.02 + aa, abs(d + 0.025))) * step(0.0, y) * step(y, uLen);
    float v = fract(y * 1.2 - uTime * 2.2 + abs(p.x) * 1.4 / max(0.05, w) * 0.25);
    float chev = smoothstep(0.0, 0.08, v) * (1.0 - smoothstep(0.26, 0.36, v)) * inside;
    col = mix(col, mix(uColor, vec3(1.0), 0.5), max(rail, chev * 0.8));
    a = max(a, max(rail * 0.95, chev * 0.6));
    float ink = (1.0 - smoothstep(0.0, 0.03, abs(d - 0.02))) * step(0.0, y) * step(y, uLen);
    col = mix(col, INK, ink * (1.0 - rail));
    a = max(a, ink * 0.45);
  }
  a *= uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
`

type MarkKind = 0 | 1 | 2 | 3 | 4 | 5

const mark = (geo: PlaneGeometry, kind: MarkKind, color: string, y: number): Mesh => {
  const m = new Mesh(geo, new ShaderMaterial({
    uniforms: withGround({
      uKind: { value: kind }, uColor: { value: new Color(color) }, uOpacity: { value: 1 }, uTime: { value: 0 }, uR: { value: 1 },
      uLen: { value: 1 }, uRank: { value: 0 }, uSize: { value: new Vector2(1, 1) }
    }),
    vertexShader: MARK_VERT, fragmentShader: MARK_FRAG, transparent: true, depthWrite: false, side: DoubleSide
  }))
  m.rotation.x = -Math.PI / 2
  m.position.y = y
  m.renderOrder = 3
  m.visible = false
  return m
}

const uni = (m: Mesh): ShaderMaterial['uniforms'] => (m.material as ShaderMaterial).uniforms

/** A target's frame, by how special it is. */
export type MarkRank = 0 | 1 | 2 | 3

export class Markers {
  readonly root = new Group()
  // Fine enough to follow a hill under a 10 m range ring.
  private quad = new PlaneGeometry(2, 2, 16, 16)
  private heroRing: Mesh
  private targetRing: Mesh
  private tap: Mesh
  private tapT = 1
  private line: Mesh
  private lineTip: Mesh
  private rangeRing: Mesh
  private aimDisc: Mesh
  private aimLine: Mesh
  private all: Mesh[]
  private time = 0

  constructor(scene: Scene) {
    this.heroRing = mark(this.quad, 0, '#5fe8ff', 0.035)
    // Shown from the start (it is the one mark every zone has): the zone's
    // warm-up render compiles the marks' program with it.
    this.heroRing.visible = true
    this.targetRing = mark(this.quad, 1, '#ff3d4f', 0.04)
    this.tap = mark(this.quad, 2, '#ffffff', 0.045)
    this.line = mark(this.quad, 5, '#ffd24a', 0.07)
    this.lineTip = mark(this.quad, 4, '#ffd24a', 0.075)
    this.rangeRing = mark(this.quad, 3, '#ffffff', 0.05)
    this.aimDisc = mark(this.quad, 4, '#ffd24a', 0.055)
    this.aimLine = mark(this.quad, 5, '#ffd24a', 0.052)
    this.all = [this.heroRing, this.targetRing, this.tap, this.line, this.lineTip, this.rangeRing, this.aimDisc, this.aimLine]
    this.root.add(...this.all)
    scene.add(this.root)
  }

  /** Place a round mark: radius `r`, with `pad` metres of room for what sits outside the ring. */
  private round(m: Mesh, x: number, z: number, r: number, pad = 0.12): void {
    const u = uni(m)
    m.position.x = x
    m.position.z = z
    m.scale.set(r + pad, r + pad, 1)
    u.uR!.value = r
    ;(u.uSize!.value as Vector2).set(r + pad, r + pad)
  }

  hero(x: number, z: number, r: number, visible: boolean): void {
    this.heroRing.visible = visible
    this.round(this.heroRing, x, z, r * 1.45)
  }

  /** The locked target's ring; `on` false hides it. `rank` frames it. */
  target(x: number, z: number, r: number, on: boolean, hostile = true, rank: MarkRank = 0): void {
    this.targetRing.visible = on
    if (!on) return
    const u = uni(this.targetRing)
    ;(u.uColor!.value as Color).set(hostile ? '#ff3d4f' : '#7dff8a')
    u.uRank!.value = rank
    const pulse = 1 + Math.sin(this.time * 7) * 0.04
    this.round(this.targetRing, x, z, (r + 0.32) * pulse, rank > 0 ? 0.42 : 0.14)
  }

  /** A move order landed here: a ring that closes and fades. */
  tapAt(x: number, z: number, color = '#ffffff'): void {
    ;(uni(this.tap).uColor!.value as Color).set(color)
    this.tap.position.x = x
    this.tap.position.z = z
    this.tapT = 0
    this.tap.visible = true
  }

  private segment(m: Mesh, x0: number, z0: number, x1: number, z1: number, w: number): void {
    const dx = x1 - x0
    const dz = z1 - z0
    const len = Math.hypot(dx, dz) || 0.01
    const u = uni(m)
    m.position.x = (x0 + x1) / 2
    m.position.z = (z0 + z1) / 2
    // Laid flat (local +Y then points at −Z), and turned so it runs from A to B.
    m.rotation.set(-Math.PI / 2, 0, Math.atan2(-dx, -dz), 'XYZ')
    const hw = w + 0.1
    const hl = len / 2 + 0.05
    m.scale.set(hw, hl, 1)
    u.uR!.value = w
    u.uLen!.value = len
    ;(u.uSize!.value as Vector2).set(hw, hl)
  }

  /** The drag line from the hero to the pointer. Gold on an enemy, white on ground. */
  drag(on: boolean, x0 = 0, z0 = 0, x1 = 0, z1 = 0, onEnemy = false): void {
    this.line.visible = this.lineTip.visible = on
    if (!on) return
    const col = onEnemy ? '#ffb02a' : '#ffffff'
    ;(uni(this.line).uColor!.value as Color).set(col)
    ;(uni(this.lineTip).uColor!.value as Color).set(col)
    this.segment(this.line, x0, z0, x1, z1, 0.09)
    this.round(this.lineTip, x1, z1, onEnemy ? 0.4 + Math.sin(this.time * 12) * 0.05 : 0.26)
  }

  /**
   * A skill being aimed: its reach round the hero, and the area (or the line
   * of fire) at the aim point. `radius` 0 = a single-target skill.
   */
  aim(on: boolean, hx = 0, hz = 0, range = 0, x = 0, z = 0, radius = 0, color = '#ffd24a', inRange = true): void {
    this.rangeRing.visible = on && range > 0
    this.aimDisc.visible = on && radius > 0
    this.aimLine.visible = on && radius <= 0
    if (!on) return
    const col = inRange ? color : '#ff5a5a'
    this.round(this.rangeRing, hx, hz, Math.max(0.1, range), 0.08)
    ;(uni(this.aimDisc).uColor!.value as Color).set(col)
    this.round(this.aimDisc, x, z, Math.max(0.4, radius))
    ;(uni(this.aimLine).uColor!.value as Color).set(col)
    this.segment(this.aimLine, hx, hz, x, z, 0.16)
  }

  update(dt: number): void {
    this.time += dt
    for (const m of this.all) uni(m).uTime!.value = this.time
    if (this.tapT < 1) {
      this.tapT += dt / 0.4
      const k = Math.min(1, this.tapT)
      const u = uni(this.tap)
      const r = 0.85 - 0.5 * k
      this.tap.scale.set(r + 0.12, r + 0.12, 1)
      u.uR!.value = r
      ;(u.uSize!.value as Vector2).set(r + 0.12, r + 0.12)
      u.uOpacity!.value = 1 - k * k
      if (k >= 1) this.tap.visible = false
    }
  }

  dispose(): void {
    this.quad.dispose()
    for (const m of this.all) (m.material as ShaderMaterial).dispose()
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

const _slope: [number, number] = [0, 0]
const _sn = new Vector3()
const _sz = new Vector3(0, 0, 1)
/** Lay a blob shadow on the ground under (x, z), tilted to the slope there. */
export const placeBlobShadow = (m: Mesh, x: number, z: number): void => {
  groundSlopeAt(x, z, _slope)
  _sn.set(-_slope[0], 1, -_slope[1]).normalize()
  m.quaternion.setFromUnitVectors(_sz, _sn)
  m.position.set(x, groundAt(x, z) + 0.03, z)
}

// ─── Health bars: one instanced draw for the whole field ─────────────────────
//
// Every bar over every head is one quad of one instanced mesh. The quad is
// larger than the bar: the room round it is where the FRAME is drawn, and the
// frame says how special the thing under it is (decision D42):
//
//   minion / weak   a plain small bar
//   normal          end caps
//   elite           gold, winged, a gem
//   champion        a crest over the bar
//   boss            a crown, wings, and larger
//
// Inside: ticks at 25 / 50 / 75 %, a two-tone fill, the shield as a striped
// segment, and a GHOST of the health just lost that lingers and then drains.
// A badge on the left carries the level of anything framed, or a skull when
// the enemy is well above the hero.
//
// Bars keep a minimum size on screen: on an upright phone the camera stands
// far back, and a bar scaled with the world would be five pixels tall.

/** The bar's own height in metres (its track, without the frame). */
const BAR_H = 0.12

const BAR_VERT = /* glsl */`
attribute vec4 aBar;      // x, y, z of the anchor; w = fill 0..1
attribute vec4 aLook;     // r, g, b; a = width in metres
attribute vec4 aState;    // shield (share of max health), ghost 0..1, rank, badge (level, −1 skull, 0 none)
uniform float uViewH;
uniform float uMinPx;
varying vec2 vP;
varying float vHw;
varying float vS;
varying float vFill;
varying vec4 vState;
varying vec3 vColor;
void main() {
  vFill = aBar.w;
  vState = aState;
  vColor = aLook.rgb;
  vec4 mv = modelViewMatrix * vec4(aBar.xyz, 1.0);
  // Never smaller on screen than uMinPx tall, however far the camera stands.
  float ppm = projectionMatrix[1][1] * uViewH * 0.5 / max(0.1, -mv.z);
  float s = max(1.0, uMinPx / (${BAR_H.toFixed(3)} * ppm)) * (aState.z > 3.5 && aState.z < 4.5 ? 1.5 : aState.z < 0.5 ? 0.8 : 1.0);
  float hw = aLook.a * 0.5 * s;
  // Room round the bar for its frame: wings and the badge at the sides, a crown above.
  vec2 pad = vec2(0.27, 0.19) * s;
  vec2 half_ = vec2(hw, ${(BAR_H / 2).toFixed(3)} * s) + pad;
  vP = position.xy * half_ + vec2(0.0, 0.06 * s);
  vHw = hw;
  vS = s;
  mv.xy += vP;
  gl_Position = projectionMatrix * mv;
}
`
const BAR_FRAG = /* glsl */`
uniform sampler2D uGlyphs;
varying vec2 vP;
varying float vHw;
varying float vS;
varying float vFill;
varying vec4 vState;
varying vec3 vColor;

const vec3 INK = vec3(0.07, 0.055, 0.12);

float box(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float tri(vec2 p, vec2 a, vec2 b, vec2 c) {
  vec2 e0 = b - a, e1 = c - b, e2 = a - c;
  vec2 v0 = p - a, v1 = p - b, v2 = p - c;
  vec2 q0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
  vec2 q1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
  vec2 q2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(q0, q0), s * (v0.x * e0.y - v0.y * e0.x)), vec2(dot(q1, q1), s * (v1.x * e1.y - v1.y * e1.x))), vec2(dot(q2, q2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}
// Lay an inked shape over what is there: fill inside, a dark line round it.
void lay(float d, float aa, vec3 fill, inout vec3 col, inout float a) {
  float ink = 1.0 - smoothstep(0.012 * vS, 0.012 * vS + aa, d);
  col = mix(col, INK, ink);
  a = max(a, ink);
  float f = 1.0 - smoothstep(-aa, aa, d);
  col = mix(col, fill, f);
}
float glyph(vec2 uv, float cell) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  float cx = mod(cell, 4.0);
  float cy = floor(cell / 4.0);
  return texture2D(uGlyphs, vec2((cx + uv.x) / 4.0, 1.0 - (cy + 1.0 - uv.y) / 4.0)).a;
}

void main() {
  vec2 p = vP;
  float s = vS;
  float hw = vHw;
  float hh = ${(BAR_H / 2).toFixed(3)} * s;
  float rank = vState.z;
  float aa = fwidth(p.x) * 1.1 + 0.0005;
  vec3 col = INK;
  float a = 0.0;

  // The frame's metal, by rank.
  vec3 metal = vec3(0.8, 0.84, 0.9);
  if (rank > 1.5 && rank < 2.5) metal = vec3(1.0, 0.72, 0.2);
  else if (rank > 2.5 && rank < 3.5) metal = vec3(0.74, 0.9, 1.0);
  else if (rank > 3.5 && rank < 4.5) metal = vec3(1.0, 0.8, 0.26);
  else if (rank > 4.5) metal = mix(vColor, vec3(1.0), 0.55);
  vec3 metalLo = metal * 0.72;
  float ax = abs(p.x);

  // ── Behind the bar: wings (elite, boss), then the crest or the crown ──
  if ((rank > 1.5 && rank < 2.5) || (rank > 3.5 && rank < 4.5)) {
    float wl = (rank > 3.5 ? 0.2 : 0.14) * s;
    vec2 q = vec2(ax - hw, p.y);
    float w1 = tri(q, vec2(-0.02 * s, -hh), vec2(-0.02 * s, hh * 2.4), vec2(wl, hh * 1.5));
    float w2 = tri(q, vec2(-0.02 * s, -hh * 1.2), vec2(wl * 0.75, hh * 0.3), vec2(-0.02 * s, hh * 0.9));
    lay(min(w1, w2), aa, p.y > hh * 0.7 ? metal : metalLo, col, a);
  }
  if (rank > 3.5 && rank < 4.5) {
    // The crown: a band and three points, a red stone in the middle one.
    float band = box(p - vec2(0.0, hh + 0.022 * s), vec2(0.1 * s, 0.018 * s), 0.004 * s);
    float pk = min(tri(p, vec2(-0.03 * s, hh + 0.03 * s), vec2(0.0, hh + 0.13 * s), vec2(0.03 * s, hh + 0.03 * s)),
      min(tri(vec2(ax, p.y), vec2(0.045 * s, hh + 0.03 * s), vec2(0.085 * s, hh + 0.105 * s), vec2(0.1 * s, hh + 0.03 * s)), band));
    lay(pk, aa, p.y > hh + 0.04 * s ? metal : metalLo, col, a);
    float gem = length(p - vec2(0.0, hh + 0.05 * s)) - 0.02 * s;
    lay(gem, aa, vec3(1.0, 0.25, 0.3), col, a);
  } else if (rank > 2.5 && rank < 3.5) {
    // The crest: a kite over the bar, a smaller one each side of it.
    vec2 q = p - vec2(0.0, hh + 0.035 * s);
    float kite = abs(q.x) * 1.25 + abs(q.y) - 0.06 * s;
    vec2 q2 = vec2(ax - 0.085 * s, p.y - hh - 0.012 * s);
    float side = abs(q2.x) * 1.2 + abs(q2.y) - 0.03 * s;
    lay(min(kite, side), aa, q.y > 0.0 ? metal : metalLo, col, a);
    lay(abs(q.x) * 1.25 + abs(q.y) - 0.026 * s, aa, vec3(1.0), col, a);
  }

  // ── The track ──
  float dTrack = box(p, vec2(hw, hh), hh * 0.55);
  lay(dTrack, aa, vec3(0.13, 0.1, 0.19), col, a);
  float inset = 0.017 * s;
  float dIn = box(p, vec2(hw - inset, hh - inset), (hh - inset) * 0.5);
  float inner = 1.0 - smoothstep(-aa, aa, dIn);
  float x01 = (p.x + hw - inset) / max(0.001, 2.0 * (hw - inset));
  // The health just lost lingers pale, then drains.
  float ghost = step(x01, vState.y) * step(vFill, x01);
  col = mix(col, vec3(1.0, 0.9, 0.78), ghost * inner);
  // The fill: two flat tones and a hard highlight band along the top.
  float fill = step(x01, vFill);
  vec3 tone = vColor * (p.y > hh * 0.05 ? 1.0 : 0.74);
  tone = mix(tone, mix(vColor, vec3(1.0), 0.55), step(hh * 0.42, p.y) * step(p.y, hh * 0.7));
  col = mix(col, tone, fill * inner);
  // The shield: a striped pale segment after the health (over its end when the bar is full).
  float sh = vState.x;
  if (sh > 0.001) {
    float from = min(vFill, 1.0 - min(1.0, sh));
    float seg = step(from, x01) * step(x01, from + min(1.0, sh));
    float stripe = step(0.5, fract((p.x + p.y) / (0.05 * s)));
    col = mix(col, mix(vec3(1.0, 0.93, 0.6), vec3(1.0), stripe * 0.6), seg * inner * 0.92);
  }
  // Quarter marks; the half a little stronger.
  for (int i = 1; i < 4; i++) {
    float tx = (float(i) * 0.25 * 2.0 - 1.0) * (hw - inset);
    float t = 1.0 - smoothstep(0.004 * s, 0.004 * s + aa, abs(p.x - tx));
    float reach = i == 2 ? 1.0 : step(p.y, hh * 0.1);
    col = mix(col, INK, t * inner * reach * (i == 2 ? 0.85 : 0.7));
  }

  // ── On top: end caps (normal and up), the elite's gem ──
  if (rank > 0.5) {
    float cap = box(vec2(ax - hw + 0.004 * s, p.y), vec2(0.02 * s, hh + 0.012 * s), 0.008 * s);
    lay(cap, aa, p.y > 0.0 ? metal : metalLo, col, a);
  }
  if (rank > 1.5 && rank < 2.5) {
    vec2 q = p - vec2(0.0, hh + 0.012 * s);
    lay(abs(q.x) + abs(q.y) - 0.04 * s, aa, q.x + q.y > 0.0 ? vec3(1.0, 0.86, 0.4) : vec3(0.95, 0.55, 0.12), col, a);
  }

  // ── The badge: a level, or a skull ──
  float badge = vState.w;
  if (abs(badge) > 0.5) {
    float br = 0.085 * s;
    vec2 c = vec2(-hw - br - 0.035 * s, 0.0);
    vec2 q = p - c;
    float d = length(q) - br;
    lay(d, aa, badge < 0.0 ? vec3(0.45, 0.07, 0.12) : vec3(0.16, 0.13, 0.24), col, a);
    float ring = abs(d + 0.012 * s) - 0.008 * s;
    col = mix(col, badge < 0.0 ? vec3(1.0, 0.45, 0.4) : metal, 1.0 - smoothstep(-aa, aa, ring));
    float g = 0.0;
    if (badge < 0.0) g = glyph(q / (br * 1.5) + 0.5, 10.0);
    else if (badge < 9.5) g = glyph(q / (br * 1.45) + 0.5, floor(badge + 0.5));
    else {
      float n = floor(badge + 0.5);
      vec2 uv = q / (br * 1.15) + vec2(0.5);
      g = max(glyph(vec2(uv.x + 0.36, uv.y), floor(n / 10.0)), glyph(vec2(uv.x - 0.36, uv.y), mod(n, 10.0)));
    }
    col = mix(col, vec3(1.0), g);
  }

  if (a < 0.01) discard;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
`

/** How a bar is framed (decision D42). */
export const BAR_RANK = { minion: 0, normal: 1, elite: 2, champion: 3, boss: 4, ally: 5 } as const
export type BarRank = (typeof BAR_RANK)[keyof typeof BAR_RANK]

interface Ghost { v: number; last: number; hold: number; seen: number }

/** Every unit's health bar: a pool of instances, rewritten each frame. */
export class HealthBars {
  readonly mesh: Mesh
  private geo: InstancedBufferGeometry
  private mat: ShaderMaterial
  private bar!: InstancedBufferAttribute
  private look!: InstancedBufferAttribute
  private state!: InstancedBufferAttribute
  private n = 0
  private cap = 0
  private c = new Color()
  private ghosts = new Map<number, Ghost>()
  private frame = 0
  private dt = 0
  private size = new Vector2()

  constructor(scene: Scene, capacity = 64) {
    const g = new InstancedBufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3))
    g.setIndex([0, 1, 2, 0, 2, 3])
    this.geo = g
    this.grow(capacity)
    this.mat = new ShaderMaterial({
      uniforms: { uGlyphs: { value: barGlyphs() }, uViewH: { value: 600 }, uMinPx: { value: 8 } },
      vertexShader: BAR_VERT, fragmentShader: BAR_FRAG, depthTest: false, depthWrite: false, transparent: true
    })
    this.mesh = new Mesh(g, this.mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 30
    // The bars' minimum size is in screen pixels: the viewport is read as they are drawn.
    this.mesh.onBeforeRender = (renderer) => {
      this.mat.uniforms.uViewH!.value = renderer.getSize(this.size).y
    }
    scene.add(this.mesh)
  }

  /** More room: a bar is never dropped (a wave of summons, a crowded arena). */
  private grow(cap: number): void {
    const mk = (old?: InstancedBufferAttribute): InstancedBufferAttribute => {
      const arr = new Float32Array(cap * 4)
      if (old) arr.set(old.array as Float32Array)
      const at = new InstancedBufferAttribute(arr, 4)
      at.setUsage(DynamicDrawUsage)
      return at
    }
    this.bar = mk(this.bar)
    this.look = mk(this.look)
    this.state = mk(this.state)
    this.geo.setAttribute('aBar', this.bar)
    this.geo.setAttribute('aLook', this.look)
    this.geo.setAttribute('aState', this.state)
    this.cap = cap
  }

  /** Start a frame of bars. `dt` drives the damage ghosts. */
  begin(dt = 0): void {
    this.n = 0
    this.dt = dt
    this.frame++
  }

  /**
   * One unit's bar. `id` is the unit's (its damage ghost is remembered by
   * it); `shield` is a share of max health; `width` is in metres; `badge` is
   * the level to show (0: none), or −1 for a skull.
   */
  add(id: number, x: number, y: number, z: number, fill01: number, shield: number, color: string, width: number, rank: BarRank, badge: number): void {
    if (this.n >= this.cap) this.grow(this.cap * 2)
    const i = this.n++
    const fill = Math.max(0, Math.min(1, fill01))
    let g = this.ghosts.get(id)
    if (!g) {
      g = { v: fill, last: fill, hold: 0, seen: this.frame }
      this.ghosts.set(id, g)
    }
    // A fresh loss holds for a beat, then the pale part drains to the fill.
    if (fill < g.last - 0.002) g.hold = 0.32
    if (fill >= g.v) g.v = fill
    else if (g.hold > 0) g.hold -= this.dt
    else g.v = Math.max(fill, g.v - this.dt * 0.7)
    g.last = fill
    g.seen = this.frame
    this.bar.setXYZW(i, x, y, z, fill)
    this.c.set(color)
    this.look.setXYZW(i, this.c.r, this.c.g, this.c.b, width)
    this.state.setXYZW(i, shield, g.v, rank, badge)
  }

  end(): void {
    this.geo.instanceCount = this.n
    const used = this.n * 4
    this.bar.clearUpdateRanges()
    this.bar.addUpdateRange(0, used)
    this.bar.needsUpdate = true
    this.look.clearUpdateRanges()
    this.look.addUpdateRange(0, used)
    this.look.needsUpdate = true
    this.state.clearUpdateRanges()
    this.state.addUpdateRange(0, used)
    this.state.needsUpdate = true
    // Forget the ghosts of things that have not had a bar for a while.
    if (this.frame % 240 === 0) {
      for (const [id, g] of this.ghosts) if (this.frame - g.seen > 120) this.ghosts.delete(id)
    }
  }

  dispose(): void {
    this.geo.dispose()
    this.mat.dispose()
    this.mesh.removeFromParent()
  }
}
