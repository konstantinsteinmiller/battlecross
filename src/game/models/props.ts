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
  const ring = new Mesh(new CylinderGeometry(0.9, 0.9, 3.2, 28, 1, true), ringMat)
  ring.position.y = 1.9
  p.root.add(ring)
  return { ...p, ring, ringMat }
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
