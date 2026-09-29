import {
  AdditiveBlending, CircleGeometry, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, type BufferGeometry
} from 'three'
import { rbox, rcyl, sph, torus, tube, ell, xform, paint, merge } from './kit'
import { toonVC, glowVC, outlineMat } from './toon'
import { buildCapsule } from './props'
import type { Theme } from '../world/themes'
import type { SecretSpec } from '../world/levelGen'

/**
 * ─── A secret's props (`sim/secrets.ts` drives them) ─────────────────────────
 *
 * Wall buttons, the hint panel, the colour frame on a false wall, the prize
 * and the light shaft over it. Each face is built looking down +Z (the
 * wall's normal into the room) with its origin on the face's centre; the sim
 * turns it to its wall. The lamps own their materials (the sim sets their
 * colours on a hit, never per frame at rest); the rest is shared toon.
 *
 * Colour is never the only cue: every colour has its own icon, drawn on its
 * lamp — red ●, green ▲, blue ■, yellow ◆ — so a colour-blind player reads
 * the panel by shape. The 'lights' puzzle is bright against dark.
 */

/** Red, green, blue, yellow: saturated and far apart in hue and brightness. */
export const SECRET_COLORS = ['#ff3b3b', '#2fe05a', '#3a8bff', '#ffd21a'] as const
/** A 'lights' lamp: on and off. */
export const LIGHT_ON = '#fff1b8'
export const LIGHT_OFF = '#3b4254'
/** The solved glow. */
export const SOLVED = '#8dff7a'
/** A lamp at rest (not lit) is its colour at this brightness. */
export const DIM = 0.2
const ICON_DARK = '#141a33'

/** A button's lamp radius (m): its face, and the shot's target. */
export const BUTTON_R = 0.26

// Icon shapes, flat in XY facing +Z, shared by every lamp (the sim swaps a
// lamp's icon geometry when a cycle button changes colour).
let icons: BufferGeometry[] | null = null
export const iconGeometry = (color: number): BufferGeometry => {
  if (!icons) {
    icons = [
      new CircleGeometry(0.5, 20),
      new CircleGeometry(0.62, 3, Math.PI / 2),
      new CircleGeometry(0.6, 4, Math.PI / 4),
      new CircleGeometry(0.62, 4, Math.PI / 2)
    ]
  }
  return icons[((color % 4) + 4) % 4]!
}

const assemble = (toonParts: BufferGeometry[], glowParts: BufferGeometry[], outline = 0.02): Group => {
  const root = new Group()
  if (toonParts.length) {
    const g = merge(toonParts)
    root.add(new Mesh(g, toonVC()))
    const o = new Mesh(g, outlineMat(outline))
    o.renderOrder = -1
    root.add(o)
  }
  if (glowParts.length) root.add(new Mesh(merge(glowParts), glowVC()))
  return root
}

/** A disc lying in XY (its axis along Z). */
const disc = (r: number, h: number, z: number, hex: string): BufferGeometry =>
  xform(paint(rcyl(r, h, h * 0.45, 20), hex), [0, 0, z], [Math.PI / 2, 0, 0])

export interface LampMesh {
  root: Group
  lampMat: MeshBasicMaterial
  icon: Mesh
  iconMat: MeshBasicMaterial
}

/** A round lamp with an icon on its face (radius r), origin at its back. */
const lamp = (r: number, z: number): LampMesh => {
  const root = new Group()
  const lampMat = new MeshBasicMaterial({ color: new Color(LIGHT_OFF), toneMapped: false })
  const bulb = new Mesh(xform(ell(r, r, r * 0.42, 18, 8), [0, 0, z]), lampMat)
  root.add(bulb)
  const iconMat = new MeshBasicMaterial({ color: new Color(ICON_DARK), toneMapped: false })
  const icon = new Mesh(iconGeometry(0), iconMat)
  icon.scale.setScalar(r * 0.95)
  icon.position.z = z + r * 0.42 + 0.004
  root.add(icon)
  return { root, lampMat, icon, iconMat }
}

/**
 * A wall button: a steel back plate in the theme's trim with a rim, and a
 * big round lamp. The origin is the lamp's face centre on its wall (the
 * spec's button position); +Z points into the room.
 */
export const buildButton = (theme: Theme): LampMesh => {
  const back = assemble([
    disc(BUTTON_R + 0.12, 0.1, -0.04, theme.pilaster),
    xform(paint(torus(BUTTON_R + 0.05, 0.04, 6, 24), theme.trim), [0, 0, 0.02])
  ], [])
  const l = lamp(BUTTON_R, 0.01)
  l.root.add(back)
  return l
}

export interface PanelMesh {
  root: Group
  lamps: LampMesh[]
}

/**
 * The hint panel: a dark plate framed in the theme's trim with a row of
 * `n` small lamps, the sim lights them with the target. `n` lamps fit in
 * 1.7 m (the builder leaves 0.9 m either side of the panel's centre).
 */
export const buildPanel = (theme: Theme, n: number): PanelMesh => {
  const step = Math.min(0.36, 1.45 / Math.max(1, n))
  const r = step * 0.38
  const w = step * n + 0.22
  const h = Math.max(0.42, r * 2 + 0.26)
  const plate = assemble([
    xform(paint(rbox(w + 0.1, h + 0.1, 0.08, 0.25), theme.trim), [0, 0, -0.04]),
    xform(paint(rbox(w, h, 0.06, 0.25), '#1c2130'), [0, 0, 0])
  ], [])
  const root = new Group()
  root.add(plate)
  const lamps: LampMesh[] = []
  for (let i = 0; i < n; i++) {
    const l = lamp(r, 0.02)
    l.root.position.x = (i - (n - 1) / 2) * step
    root.add(l.root)
    lamps.push(l)
  }
  return { root, lamps }
}

/**
 * A 'color' puzzle's frame round its false wall, in the key colour, with
 * the key's icon over it: the frame says which colour opens it. Origin on
 * the floor at the face's middle, +Z into the room; `w`, `h` the opening.
 */
export const buildKeyFrame = (key: number, w: number, h: number): Group => {
  const hex = SECRET_COLORS[key] ?? SECRET_COLORS[0]
  const t = 0.14
  const root = new Group()
  const mat = new MeshBasicMaterial({ color: new Color(hex), toneMapped: false })
  const g = merge([
    xform(rbox(t, h, t, 0.4), [-w / 2, h / 2, 0]),
    xform(rbox(t, h, t, 0.4), [w / 2, h / 2, 0]),
    xform(rbox(w + t, t, t, 0.4), [0, h, 0]),
    xform(rbox(w + t, t, t, 0.4), [0, 0.06, 0])
  ])
  root.add(new Mesh(g, mat))
  const badge = new Mesh(xform(ell(0.3, 0.3, 0.1, 18, 8), [0, h + 0.36, 0]), mat)
  root.add(badge)
  const icon = new Mesh(iconGeometry(key), new MeshBasicMaterial({ color: new Color(ICON_DARK), toneMapped: false }))
  icon.scale.setScalar(0.26)
  icon.position.set(0, h + 0.36, 0.11)
  root.add(icon)
  return root
}

/** The prize, floating over its origin (the alcove floor): a Repair Gel
 *  flask, a big heal capsule, or a power orb (a borrowed weapon). */
export const buildPrize = (prize: SecretSpec['prize']): Group => {
  if (prize === 'hp') {
    const g = buildCapsule('hp', true).root
    g.scale.setScalar(1.5)
    return g
  }
  if (prize === 'tank') {
    return assemble([
      xform(paint(rcyl(0.2, 0.46, 0.08, 16), '#dff7ff'), [0, 0, 0]),
      xform(paint(rcyl(0.13, 0.12, 0.04, 14), '#5f6878'), [0, 0.3, 0]),
      xform(paint(rcyl(0.215, 0.2, 0.05, 16), '#3fe07a'), [0, -0.04, 0])
    ], [xform(paint(torus(0.22, 0.03, 6, 20), '#8dff7a'), [0, 0.1, 0], [Math.PI / 2, 0, 0])], 0.015)
  }
  return assemble([
    xform(paint(torus(0.34, 0.045, 6, 22), '#c9d3e6'), [0, 0, 0], [Math.PI / 2, 0, 0]),
    xform(paint(torus(0.34, 0.045, 6, 22), '#c9d3e6'), [0, 0, 0], [0, Math.PI / 2, 0])
  ], [xform(paint(sph(0.2, 12, 8), '#ff5fd8'), [0, 0, 0])], 0.015)
}

/** A shaft of light over the prize once the wall is gone: the room's one
 *  unmissable cue, no glyph. Origin on the floor; the sim breathes it. */
export const buildLightShaft = (): { root: Mesh; mat: MeshBasicMaterial } => {
  const mat = new MeshBasicMaterial({
    color: new Color('#fff2a8'), transparent: true, opacity: 0.3, blending: AdditiveBlending,
    depthWrite: false, side: DoubleSide, toneMapped: false
  })
  const root = new Mesh(xform(tube(0.45, 0.75, 5, 18), [0, 2.5, 0]), mat)
  return { root, mat }
}

/** The palette as colours, made once: the sim recolours lamps on the fly. */
export const LAMP = {
  colors: SECRET_COLORS.map(h => new Color(h)),
  on: new Color(LIGHT_ON),
  off: new Color(LIGHT_OFF),
  solved: new Color(SOLVED),
  white: new Color('#ffffff'),
  dark: new Color(ICON_DARK),
  pale: new Color('#c8cdd8')
}

/** A lamp at colour `c`, `k` of its brightness, blended `w` toward white
 *  (a hit's flash). Allocation-free. */
export const setLamp = (m: MeshBasicMaterial, c: Color, k = 1, w = 0): void => {
  m.color.copy(c).multiplyScalar(k)
  if (w > 0) m.color.lerp(LAMP.white, w)
}
