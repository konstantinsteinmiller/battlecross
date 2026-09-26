import { Group, Mesh, MeshBasicMaterial, AdditiveBlending, Color, CylinderGeometry, DoubleSide, type BufferGeometry } from 'three'
import { rcyl, rbox, torus, sph, ell, cap, xform, paint, paintBy, merge, lathe } from './kit'
import { toonVC, glowVC, outlineMat } from './toon'
import { PAL, RARITY_COLOR } from './palette'
import type { Theme } from '../world/themes'
import { CELL, WALL_H } from '../world/levelGen'

/**
 * Props — doors, the teleporter pad, crates, energy barrels, chests, pickups,
 * data cores. All static meshes (no skeleton); each is at most three draw
 * calls (toon body, glow parts, outline).
 */

export interface PropMesh {
  root: Group
  body: Mesh | null
  glow: Mesh | null
}

const assemble = (toonParts: BufferGeometry[], glowParts: BufferGeometry[], outline = 0.02): PropMesh => {
  const root = new Group()
  let body: Mesh | null = null
  let glow: Mesh | null = null
  if (toonParts.length) {
    const g = merge(toonParts)
    body = new Mesh(g, toonVC())
    root.add(body)
    if (outline > 0) {
      const o = new Mesh(g, outlineMat(outline))
      o.renderOrder = -1
      root.add(o)
    }
  }
  if (glowParts.length) {
    glow = new Mesh(merge(glowParts), glowVC())
    root.add(glow)
  }
  return { root, body, glow }
}

// ─── Door ────────────────────────────────────────────────────────────────────

export interface DoorMesh {
  root: Group
  /** Panels that slide apart (normal door) or the shutter that lifts (boss). */
  panels: Group[]
  boss: boolean
  lamp: Mesh
  lampMat: MeshBasicMaterial
}

/**
 * A sliding double door built in local space with the doorway spanning X
 * (width = one cell) and facing ±Z. The mission rotates it to the corridor.
 * The boss door is a single heavy shutter of rounded slats that LIFTS — the
 * classic boss-gate silhouette.
 */
export const buildDoor = (theme: Theme, boss: boolean): DoorMesh => {
  const root = new Group()
  const panels: Group[] = []
  const w = CELL
  const h = WALL_H - 0.9
  if (!boss) {
    for (const s of [-1, 1]) {
      const toon: BufferGeometry[] = []
      toon.push(xform(paint(rbox(w / 2 - 0.05, h, 0.34, 0.3), theme.crate), [s * (w / 4), h / 2, 0]))
      // Chevron stripes on the leading edges
      toon.push(paintBy(
        xform(rbox(0.26, h - 0.3, 0.4, 0.3), [s * 0.16, h / 2, 0]),
        (_x, y) => (Math.floor(y * 2.6) & 1 ? theme.hazard : theme.crateTrim)
      ))
      toon.push(xform(paint(ell(0.36, 0.36, 0.08), theme.crateTrim), [s * (w / 4), h * 0.62, 0.18]))
      toon.push(xform(paint(ell(0.36, 0.36, 0.08), theme.crateTrim), [s * (w / 4), h * 0.62, -0.18]))
      const glowG = [
        xform(paint(sph(0.12, 10, 8), theme.accent), [s * (w / 4), h * 0.62, 0.24]),
        xform(paint(sph(0.12, 10, 8), theme.accent), [s * (w / 4), h * 0.62, -0.24])
      ]
      const p = assemble(toon, glowG, 0.025)
      panels.push(p.root)
      root.add(p.root)
    }
  } else {
    const toon: BufferGeometry[] = []
    const slats = 6
    for (let k = 0; k < slats; k++) {
      const y = (k + 0.5) * (h / slats)
      toon.push(xform(paint(rbox(w - 0.1, h / slats - 0.04, 0.5, 0.45), k % 2 ? theme.trim : theme.pilaster), [0, y, 0]))
    }
    const glowG = [
      xform(paint(ell(0.5, 0.5, 0.12), PAL.glowRed), [0, h * 0.55, 0.28]),
      xform(paint(ell(0.5, 0.5, 0.12), PAL.glowRed), [0, h * 0.55, -0.28])
    ]
    const p = assemble(toon, glowG, 0.03)
    panels.push(p.root)
    root.add(p.root)
  }
  const lampMat = new MeshBasicMaterial({ color: new Color(boss ? PAL.glowRed : PAL.glowGreen), toneMapped: false })
  const lamp = new Mesh(new CylinderGeometry(0.16, 0.16, 0.12, 12), lampMat)
  lamp.rotation.x = Math.PI / 2
  lamp.position.set(0, h + 0.35, 0)
  root.add(lamp)
  return { root, panels, boss, lamp, lampMat }
}

// ─── Teleporter pad ──────────────────────────────────────────────────────────

export interface PadMesh extends PropMesh {
  ring: Mesh
  ringMat: MeshBasicMaterial
  /**
   * The light column for a first-person camera; call it every sim step (the
   * mission does). `distToAxis` is the camera's distance from the pad's axis
   * in plan view, `active` is true during beam-in and beam-out. Full while
   * active, then a slow fade; gone while the camera is within ~2 m of the pad
   * (standing at the rim of a lit column tints part of the screen behind a
   * hard edge); a faint pulse from further off. The first call also turns on
   * the soft edges. The hub never calls it: its far camera keeps the plain
   * tube at the opacity it sets.
   */
  setBeamView(distToAxis: number, active: boolean, dt: number): void
}

/** The light column: radius and height (it stands on the pad, 0.3 → 3.5 m). */
const COL_R = 0.9
const COL_H = 3.2
/** Column opacity during beam-in and beam-out, and its idle glow (± 0.08). */
const BEAM_FULL = 0.85
const BEAM_IDLE = 0.18

const smooth = (a: number, b: number, x: number): number => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

// Soft edges for the column, patched into its MeshBasicMaterial so `opacity`
// keeps its meaning for the hub and the mission alike. Alpha follows how
// squarely the view meets the column in plan view: 1 through its middle and
// 0 at its silhouette, so it reads as a glowing volume, not a tube with an
// outline. It thins out within a metre of the camera, where the near plane
// would slice it into a hard edge, and fades in from the base and out toward
// the open top, whose rim would cut a hard ring into the view from inside.
// The vertex stage hands over small relative vectors, so the fragment math
// stays exact anywhere on the map. uSoft = 0 renders the plain tube, as is.
const COL_VARY = /* glsl */`
varying vec2 vColR;
varying vec3 vColV;
varying float vColH;
`
const COL_VERT = /* glsl */`
vec4 colW = modelMatrix * vec4( transformed, 1.0 );
vColR = colW.xz - ( modelMatrix * vec4( 0.0, transformed.y, 0.0, 1.0 ) ).xz;
vColV = cameraPosition - colW.xyz;
vColH = position.y / ${COL_H.toFixed(2)} + 0.5;
`
const COL_FRAG = /* glsl */`
float colLen = length( vColV.xz );
float colFace = colLen > 1e-4 ? abs( dot( normalize( vColR ), vColV.xz ) ) / colLen : 0.0;
float colSoft = colFace * colFace * smoothstep( 0.1, 0.8, length( vColV ) )
  * smoothstep( 0.0, 0.1, vColH ) * ( 1.0 - smoothstep( 0.3, 1.0, vColH ) );
diffuseColor.a *= mix( 1.0, colSoft, uSoft );
`

/** Patches the soft edges in; returns their switch (`value` 0 = plain tube).
 *  Every pad shares the patched program: only the uniform differs. */
const softenColumn = (mat: MeshBasicMaterial): { value: number } => {
  const soft = { value: 0 }
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uSoft = soft
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>${COL_VARY}`)
      .replace('#include <fog_vertex>', `#include <fog_vertex>${COL_VERT}`)
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float uSoft;${COL_VARY}`)
      .replace('#include <opaque_fragment>', `${COL_FRAG}#include <opaque_fragment>`)
  }
  return soft
}

export const buildTeleporter = (theme: Theme): PadMesh => {
  const toon = [
    xform(paint(rcyl(1.25, 0.28, 0.12, 28), theme.pilaster), [0, 0.14, 0]),
    xform(paint(torus(1.18, 0.1, 8, 32), theme.trim), [0, 0.28, 0], [Math.PI / 2, 0, 0]),
    xform(paint(rcyl(0.9, 0.1, 0.04, 28), theme.crateTrim), [0, 0.3, 0])
  ]
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2
    toon.push(xform(paint(rcyl(0.14, 0.5, 0.06, 10), theme.trim), [Math.cos(a) * 1.35, 0.25, Math.sin(a) * 1.35]))
  }
  const glowParts = [xform(paint(rcyl(0.78, 0.06, 0.02, 28), PAL.glowCyan), [0, 0.35, 0])]
  const p = assemble(toon, glowParts, 0.03)
  const ringMat = new MeshBasicMaterial({
    color: new Color(PAL.glowCyan), transparent: true, opacity: 0.5, blending: AdditiveBlending,
    depthWrite: false, side: DoubleSide, toneMapped: false
  })
  const soft = softenColumn(ringMat)
  const ring = new Mesh(new CylinderGeometry(COL_R, COL_R, COL_H, 28, 1, true), ringMat)
  ring.position.y = 0.3 + COL_H / 2
  p.root.add(ring)

  let lit = -1 // 0..1: how far the column is beaming; −1 until the first call
  let t = 0
  const setBeamView = (distToAxis: number, active: boolean, dt: number): void => {
    soft.value = 1
    t += dt
    // Snaps on the first call (the beam-in's first frame); after that a beam
    // lights up quickly and dies away slowly.
    const want = active ? 1 : 0
    lit = lit < 0 ? want : want > lit ? Math.min(want, lit + dt / 0.25) : Math.max(want, lit - dt / 0.8)
    // Beaming, but not with the camera at the wall (a beam-out beside the
    // pad): the far side would tint half the screen, up to the wall.
    const rim = smooth(0.12, 0.45, Math.abs(distToAxis - COL_R))
    // Idle: a faint pulse from afar, nothing on or beside the pad.
    const idle = (BEAM_IDLE + Math.sin(t * 2.4) * 0.08) * smooth(1.8, 3, distToAxis)
    ringMat.opacity = BEAM_FULL * lit * rim + idle * (1 - lit)
    // Seen from inside, even a blank column is a transparent pass over the
    // whole screen: skip the draw while there is nothing to show.
    ring.visible = ringMat.opacity > 0.004
  }
  return { ...p, ring, ringMat, setBeamView }
}

// ─── Crate & barrel (breakable) ──────────────────────────────────────────────

export const buildCrate = (theme: Theme): PropMesh => {
  const s = 1.15
  const toon = [
    xform(paint(rbox(s, s, s, 0.28), theme.crate), [0, s / 2, 0]),
    // Rounded corner bumpers
    ...[-1, 1].flatMap(a => [-1, 1].map(b => xform(paint(sph(0.2, 10, 8), theme.crateTrim), [a * s * 0.42, s * 0.9, b * s * 0.42]))),
    xform(paint(ell(s * 0.36, s * 0.36, 0.06), theme.crateTrim), [0, s / 2, s * 0.5]),
    xform(paint(ell(s * 0.36, s * 0.36, 0.06), theme.crateTrim), [0, s / 2, -s * 0.5])
  ]
  const glowParts = [
    xform(paint(sph(0.09, 8, 6), theme.accent), [0, s / 2, s * 0.54]),
    xform(paint(sph(0.09, 8, 6), theme.accent), [0, s / 2, -s * 0.54])
  ]
  return assemble(toon, glowParts, 0.028)
}

export const buildBarrel = (theme: Theme): PropMesh => {
  const toon = [
    xform(paint(rcyl(0.46, 1.3, 0.18, 18), theme.pipe), [0, 0.65, 0]),
    xform(paint(torus(0.47, 0.06, 6, 18), theme.crateTrim), [0, 0.3, 0], [Math.PI / 2, 0, 0]),
    xform(paint(torus(0.47, 0.06, 6, 18), theme.crateTrim), [0, 1.0, 0], [Math.PI / 2, 0, 0])
  ]
  const glowParts = [xform(paint(rcyl(0.475, 0.22, 0.05, 18), PAL.glowOrange), [0, 0.65, 0])]
  return assemble(toon, glowParts, 0.028)
}

// ─── Chest ───────────────────────────────────────────────────────────────────

export interface ChestMesh {
  root: Group
  lid: Group
  lampMat: MeshBasicMaterial
}

/** Supply chest: a rounded capsule-crate with a hinged lid and a glowing lock. */
export const buildChest = (theme: Theme, rarity: keyof typeof RARITY_COLOR = 'standard'): ChestMesh => {
  const root = new Group()
  const trim = rarity === 'standard' ? theme.trim : RARITY_COLOR[rarity]
  const base = assemble([
    xform(paint(rbox(1.5, 0.75, 0.95, 0.35), theme.crateTrim), [0, 0.4, 0]),
    xform(paint(rbox(1.56, 0.16, 1.0, 0.5), trim), [0, 0.1, 0]),
    xform(paint(rbox(1.56, 0.12, 1.0, 0.5), trim), [0, 0.74, 0])
  ], [], 0.028)
  root.add(base.root)
  const lid = new Group()
  lid.position.set(0, 0.78, -0.47)
  const lidMesh = assemble([
    xform(paint(rbox(1.5, 0.42, 0.95, 0.35), theme.crate), [0, 0.18, 0.47]),
    xform(paint(rbox(0.3, 0.46, 1.0, 0.5), trim), [-0.45, 0.18, 0.47]),
    xform(paint(rbox(0.3, 0.46, 1.0, 0.5), trim), [0.45, 0.18, 0.47])
  ], [], 0.028)
  lid.add(lidMesh.root)
  root.add(lid)
  const lampMat = new MeshBasicMaterial({ color: new Color(RARITY_COLOR[rarity]), toneMapped: false })
  const lamp = new Mesh(xform(sph(0.13, 12, 8), [0, 0.62, 0.5]), lampMat)
  root.add(lamp)
  return { root, lid, lampMat }
}

// ─── Pickups ─────────────────────────────────────────────────────────────────

/** Bolt (currency): a hex-headed bolt with a rounded shaft. Spins in world. */
export const buildBolt = (): PropMesh => {
  const head = new CylinderGeometry(0.16, 0.16, 0.1, 6)
  head.deleteAttribute('uv')
  return assemble([
    xform(paint(head, '#ffd84a'), [0, 0.09, 0]),
    xform(paint(cap(0.06, 0.16, 8, 2), '#e6e9f2'), [0, -0.06, 0])
  ], [], 0.012)
}

/** Health (red/white) or weapon-energy (blue/white) capsule. */
export const buildCapsule = (kind: 'hp' | 'we', big: boolean): PropMesh => {
  const s = big ? 1.4 : 1
  const col = kind === 'hp' ? '#ff4a5a' : '#3a8bff'
  const toon = [
    xform(paint(ell(0.17 * s, 0.14 * s, 0.14 * s), '#f4f7ff'), [-0.09 * s, 0, 0]),
    xform(paint(ell(0.17 * s, 0.14 * s, 0.14 * s), col), [0.09 * s, 0, 0])
  ]
  const glowParts = [xform(paint(torus(0.13 * s, 0.03 * s, 6, 14), kind === 'hp' ? PAL.glowRed : PAL.glowCyan), [0, 0, 0], [0, Math.PI / 2, 0])]
  return assemble(toon, glowParts, 0.012)
}

/** Data core (collect objective): a floating glowing octa-sphere in a ring cage. */
export const buildDataCore = (): PropMesh => {
  const toon = [
    xform(paint(torus(0.36, 0.05, 6, 20), PAL.steel), [0, 0, 0], [Math.PI / 2, 0, 0]),
    xform(paint(torus(0.36, 0.05, 6, 20), PAL.steel), [0, 0, 0], [0, 0, 0])
  ]
  const glowParts = [xform(paint(sph(0.22, 8, 6), PAL.glowGreen), [0, 0, 0])]
  return assemble(toon, glowParts, 0.015)
}

/** Exit beacon: the pillar of light the player walks into to beam out. */
export const buildBeacon = (): { root: Group; mat: MeshBasicMaterial } => {
  const root = new Group()
  const mat = new MeshBasicMaterial({
    color: new Color(PAL.glowCyan), transparent: true, opacity: 0.35, blending: AdditiveBlending,
    depthWrite: false, side: DoubleSide, toneMapped: false
  })
  const g = lathe([[0.9, 0], [0.75, 3], [0.2, 9]], 24)
  root.add(new Mesh(g, mat))
  return { root, mat }
}

// ─── Training target (the charge-shot lesson) ────────────────────────────────

export interface TrainingTargetMesh {
  root: Group
  /** The bullseye drone; bobs and turns to face the player. */
  body: Group
  /** Side rotor pods (spin). */
  rotors: Group[]
  /** The energy bubble that turns quick shots away. */
  barrier: Mesh
  barrierMat: MeshBasicMaterial
  /** The bright rim ring facing the player (flashes on every deflected shot). */
  rim: Mesh
  rimMat: MeshBasicMaterial
}

/**
 * A hovering training drone: a red-and-white bullseye in an energy bubble.
 * Quick shots skip off the bubble; a charged shot pops it — the charge shot's
 * first lesson, with no words. Built around its hover centre, front = +Z.
 */
export const buildTrainingTarget = (): TrainingTargetMesh => {
  const root = new Group()
  const body = new Group()
  root.add(body)
  // The face: a rounded disc painted as a bullseye, steel on the back.
  const disc = xform(rcyl(0.42, 0.14, 0.05, 28), [0, 0, 0], [Math.PI / 2, 0, 0])
  paintBy(disc, (x, y, z) => {
    if (z < 0.02) return PAL.steel
    const r = Math.hypot(x, y)
    return r < 0.1 ? PAL.glowRed : r < 0.19 ? PAL.white : r < 0.29 ? PAL.glowRed : PAL.white
  })
  const toon = [
    disc,
    xform(paint(torus(0.42, 0.04, 8, 28), PAL.steelDark), [0, 0, 0]),
    // Hub and the two stubby arms that carry the rotor pods
    xform(paint(sph(0.17, 14, 10), PAL.gunmetal), [0, 0, -0.12]),
    xform(paint(cap(0.045, 0.62, 8, 2), PAL.steelDark), [0, 0, -0.1], [0, 0, Math.PI / 2]),
    // Antenna
    xform(paint(cap(0.018, 0.16, 6, 2), PAL.steelDark), [0, 0.52, -0.04])
  ]
  const glowParts = [
    xform(paint(sph(0.045, 10, 8), PAL.glowYellow), [0, 0.63, -0.04])
  ]
  const face = assemble(toon, glowParts, 0.02)
  body.add(face.root)
  const rotors: Group[] = []
  for (const s of [-1, 1]) {
    const pod = assemble(
      [xform(paint(ell(0.13, 0.08, 0.13, 14, 8), PAL.hardhat), [0, 0, 0])],
      [xform(paint(torus(0.14, 0.022, 6, 18), PAL.glowCyan), [0, 0.02, 0], [Math.PI / 2, 0, 0])],
      0.016
    )
    pod.root.position.set(s * 0.56, 0, -0.1)
    body.add(pod.root)
    rotors.push(pod.root)
  }
  // The bubble: soft additive shell + a bright rim facing the player.
  const barrierMat = new MeshBasicMaterial({
    color: new Color(PAL.glowCyan), transparent: true, opacity: 0.13, blending: AdditiveBlending,
    depthWrite: false, toneMapped: false
  })
  const barrier = new Mesh(stripUvSphere(0.78), barrierMat)
  const rimMat = new MeshBasicMaterial({
    color: new Color(PAL.glowCyan), transparent: true, opacity: 0.55, blending: AdditiveBlending,
    depthWrite: false, side: DoubleSide, toneMapped: false
  })
  const rim = new Mesh(torus(0.78, 0.022, 6, 40), rimMat)
  root.add(barrier, rim)
  return { root, body, rotors, barrier, barrierMat, rim, rimMat }
}

const stripUvSphere = (r: number): BufferGeometry => sph(r, 28, 18)
