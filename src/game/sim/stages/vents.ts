import { Color } from 'three'
import { CELL, type Terrain, type VentSpec } from '../../world/levelGen'
import { buildVent, FIRE_LOOK, JET_LEN, COLUMN_H, type VentLook, type VentMesh } from '../../models/stageProps/vents'
import type { ClimbBody, ClimbHost } from '../climb'
import type { StageFeature } from '../stageFeatures'

/**
 * ─── Stage vents: fire (and, in its own file, frost) on a rhythm ────────────
 *
 * A vent (`Terrain.vents`) sits at cell (i, j). With (dx, dz) a unit axis it
 * is a nozzle in the wall on the cell's −(dx, dz) side, its mouth at height
 * `y`, jetting ACROSS the cell along (dx, dz); with both 0 it is a grate in
 * the floor (`y`) and the jet is a column over the cell. Either way the jet
 * covers that one cell, so the cells beside it are always cold — a level
 * puts its vents so a cold cell is always there to stand on.
 *
 * Each cycle of `period` s (offset by `phase` on the mission clock):
 *   warn   VENT_WARN s: the mouth pulses, a hiss, a ring on the floor under
 *          the jet (`host.markers`);
 *   burn   `on` s: the roar, the jet flares out; whoever stands in it at its
 *          height is hit once per burst — a red-ring rule, not blockable;
 *   idle   the rest: the pilot glows dim.
 *
 * One class for every kind: `VentFeature` takes the kind it drives and its
 * `VentStyle` (cost, sounds, colours, what a hit does besides the damage),
 * so a frost thrower is a style and a line in `buildStageFeatures`. The
 * timing and the jet's shape are pure functions (`ventStage`, `inJet`), for
 * the tests and for any other kind. Meshes: `models/stageProps/vents.ts`.
 * Nothing allocates per step.
 */

/** The warning before each burst (s). */
export const VENT_WARN = 0.8
/** A wall jet's half width (m) and a floor column's radius, both counting
 *  a little of Flux's body. */
const JET_HALF = 1.0
const COLUMN_R = 1.2
/** Flux's height for a jet at chest height (m). */
const BODY_H = 1.75
/** Vents farther than this (m) or this many metres off Flux's floor keep
 *  quiet: no ring, no hiss, no motes. */
const NEAR = 26
const NEAR_DY = 5

export type VentStage = 'idle' | 'warn' | 'burn'

/** Seconds into vent `v`'s current cycle at `time`. */
export const ventClock = (v: VentSpec, time: number): number => {
  const u = (time + v.phase) % v.period
  return u < 0 ? u + v.period : u
}

/** Which cycle vent `v` is in at `time` (a burst's id). */
export const ventCycle = (v: VentSpec, time: number): number => Math.floor((time + v.phase) / v.period)

/** The stage `u` seconds into a cycle whose jet roars `on` s. */
const stageAt = (u: number, on: number): VentStage => (u < VENT_WARN ? 'warn' : u < VENT_WARN + on ? 'burn' : 'idle')

/** Where in its cycle vent `v` is at `time`. */
export const ventStage = (v: VentSpec, time: number): VentStage => stageAt(ventClock(v, time), v.on)

/** A wall vent's mouth (on its wall, `y` high); a floor vent's grate centre. */
export const ventMouth = (v: VentSpec): { x: number; z: number } => ({
  x: (v.i + 0.5) * CELL - v.dx * CELL / 2,
  z: (v.j + 0.5) * CELL - v.dz * CELL / 2
})

/** Is a body with its feet at (x, y, z) inside vent `v`'s jet? A wall jet
 *  runs a cell long from the wall and must pass between the feet and the
 *  head; a floor column rises COLUMN_H over its grate. */
export const inJet = (v: VentSpec, x: number, y: number, z: number): boolean => {
  const cx = (v.i + 0.5) * CELL
  const cz = (v.j + 0.5) * CELL
  if (!v.dx && !v.dz) {
    return (x - cx) ** 2 + (z - cz) ** 2 < COLUMN_R * COLUMN_R && y > v.y - 0.5 && y < v.y + COLUMN_H - 0.4
  }
  const mx = cx - v.dx * CELL / 2
  const mz = cz - v.dz * CELL / 2
  const along = (x - mx) * v.dx + (z - mz) * v.dz
  const across = Math.abs((x - mx) * v.dz - (z - mz) * v.dx)
  return along > 0 && along < JET_LEN + 0.2 && across < JET_HALF && v.y > y - 0.3 && v.y < y + BODY_H + 0.3
}

/** What a kind of vent does and looks like. */
export interface VentStyle {
  /** Share of max health one burst costs. */
  cost: number
  warnSfx: string
  burnSfx: string
  look: VentLook
  /** Anything a hit does besides the damage (a frost slow). */
  onHit?(p: ClimbBody): void
}

export const FIRE_STYLE: VentStyle = { cost: 0.15, warnSfx: 'trapHiss', burnSfx: 'flameJet', look: FIRE_LOOK }

interface VentRt {
  def: VentSpec
  mesh: VentMesh
  /** The jet cell's centre and the floor under it. */
  cx: number
  cz: number
  /** The cycle the warning / the roar / the hit last fired in. */
  warned: number
  roared: number
  hitCyc: number
  /** Motes owed (fractional, per step). */
  acc: number
}

export class VentFeature implements StageFeature {
  private vents: VentRt[] = []
  private lampIdle: Color
  private lampWarn: Color
  private lampHot: Color

  constructor(private host: ClimbHost, t: Terrain, kind: VentSpec['kind'], private style: VentStyle = FIRE_STYLE) {
    this.lampIdle = new Color(style.look.lampIdle)
    this.lampWarn = new Color(style.look.lampWarn)
    this.lampHot = new Color(style.look.lampHot)
    for (const v of t.vents ?? []) {
      if (v.kind !== kind) continue
      const m = ventMouth(v)
      const cx = (v.i + 0.5) * CELL
      const cz = (v.j + 0.5) * CELL
      const mesh = buildVent(host.theme, style.look, host.fx, m.x, v.y, m.z, v.dx, v.dz)
      host.propParent(cx, cz).add(mesh.root)
      this.vents.push({ def: v, mesh, cx, cz, warned: -1, roared: -1, hitCyc: -1, acc: 0 })
    }
  }

  update(dt: number, time: number, p: ClimbBody, playing: boolean): void {
    for (const rt of this.vents) this.step(rt, dt, time, p, playing)
  }

  private step(rt: VentRt, dt: number, time: number, p: ClimbBody, playing: boolean): void {
    const v = rt.def
    const u = ventClock(v, time)
    const cyc = ventCycle(v, time)
    const stage = stageAt(u, v.on)
    const near = Math.abs(p.y - v.y) < NEAR_DY && (p.x - rt.cx) ** 2 + (p.z - rt.cz) ** 2 < NEAR * NEAR
    const m = rt.mesh
    const shown = !m.root.parent || m.root.parent.visible
    if (stage === 'warn') {
      // Pulse faster as the burst nears; hiss and ring once a cycle.
      const k = u / VENT_WARN
      m.lampMat.color.copy(Math.floor(u * (8 + k * 14)) % 2 ? this.lampWarn : this.lampIdle)
      if (rt.warned !== cyc) {
        rt.warned = cyc
        if (near) {
          this.host.sfx(this.style.warnSfx, rt.cx, rt.cz)
          this.host.markers.spawn(rt.cx, rt.cz, 1.35, VENT_WARN + v.on)
        }
      }
      m.jet.visible = false
      if (shown && near) {
        rt.acc += dt * 10 * k
        const n = Math.floor(rt.acc)
        rt.acc -= n
        if (n) m.spit(n, 2)
      }
    } else if (stage === 'burn') {
      const b = u - VENT_WARN
      // Flare out fast, flicker, die back at the end.
      const grow = Math.min(1, b / 0.12)
      const fade = Math.min(1, (v.on - b) / 0.2)
      const f = grow * fade
      m.lampMat.color.copy(this.lampHot)
      m.jet.visible = f > 0.01
      m.jet.scale.set(0.8 + 0.2 * f, Math.max(0.05, f * (0.92 + Math.sin(time * 37 + v.i) * 0.08)), 0.8 + 0.2 * f)
      for (let n = 0; n < m.layers.length; n++) m.layers[n]!.opacity = f * (0.5 + n * 0.2) * (0.85 + Math.sin(time * 29 + n * 2) * 0.15)
      if (rt.roared !== cyc) {
        rt.roared = cyc
        if (near) this.host.sfx(this.style.burnSfx, rt.cx, rt.cz)
      }
      if (shown && near) {
        rt.acc += dt * 45
        const n = Math.floor(rt.acc)
        rt.acc -= n
        if (n) m.spit(n, 9)
      }
      // Whoever is in the jet: once a burst, not blockable.
      if (playing && f > 0.3 && rt.hitCyc !== cyc && inJet(v, p.x, p.y, p.z)) {
        rt.hitCyc = cyc
        const mo = ventMouth(v)
        const r = this.host.hitPlayer(null, Math.round(this.host.combat.maxHp * this.style.cost), { blockable: false, fromX: mo.x, fromZ: mo.z, kind: 'aoe' })
        if (r === 'hit') this.style.onHit?.(p)
      }
    } else {
      m.lampMat.color.copy(this.lampIdle)
      m.jet.visible = false
    }
  }
}
