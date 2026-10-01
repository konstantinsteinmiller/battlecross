import { CELL, cellCenter, type MagnetRail, type Terrain } from '../../world/levelGen'
import { BUTTON_Y } from '../../world/stages/builder'
import {
  buildMagnetRail, buildPolarityPanel, setRailPull, setPanelColor, NORTH, SOUTH,
  type MagnetRailMesh, type PolarityPanelMesh
} from '../../models/stageProps/magnet'
import type { ClimbBody, ClimbHost } from '../climb'
import type { Shot } from '../world'
import type { AtlasLine } from '../atlas'
import { segNear } from '../secrets'
import { cueFeature, type MoveMod, type StageFeature } from '../stageFeatures'

/**
 * ─── Magnet rails (the Polarity Works, `world/stages/magnet.ts`) ────────────
 *
 * A `MagnetRail` drags Flux along its strip at `strength` m/s — a push on top
 * of his walk, like a gust: against it he inches forward, with it he races.
 * The chevrons on its floor scroll the way it pulls, red (north) or blue
 * (south). Its polarity panel on a wall flips the pull when shot; a rail
 * with `every` flips on the clock too, the chevrons flickering FLIP_WARN
 * before (and a hum), so a flip is never a surprise.
 *
 * Fairness is the level's: a rail lies over solid floor between walls or
 * along a gap's edge-leap line, and the push never lifts or drops a body.
 * The state (which way each rail pulls) rides in the climb's snapshot.
 */

/** A clock flip is announced this long before (s). */
export const FLIP_WARN = 0.7
/** Flux counts as on a rail standing within this of its floor (m). */
const RAIL_DY = 1.2
/** A panel's hit radius (m), over the shot's own. */
const PANEL_R = 0.45
/** The panel's ring burns bright this long after a hit (s). */
const PANEL_FLASH = 0.35

interface RailRt {
  def: MagnetRail
  y: number
  /** +1: pulls along (dx, dz); −1: the other way. The panel's flips. */
  sign: number
  /** The clock's part (−1 on odd periods of `every`). */
  clock: number
  mesh: MagnetRailMesh
  panel: PolarityPanelMesh | null
  /** The panel's spot and its normal (into the room). */
  px: number
  py: number
  pz: number
  nx: number
  nz: number
  flash: number
}

/** The clock's sign of a rail at `time`: +1, −1 on odd periods. */
export const clockSign = (r: MagnetRail, time: number): number => {
  if (!r.every || r.every <= 0) return 1
  return Math.floor((time + (r.phase ?? 0)) / r.every) % 2 === 0 ? 1 : -1
}

/** A clock flip is coming within FLIP_WARN. */
export const flipSoon = (r: MagnetRail, time: number): boolean => {
  if (!r.every || r.every <= 0) return false
  const u = (((time + (r.phase ?? 0)) % r.every) + r.every) % r.every
  return u >= r.every - FLIP_WARN
}

const SIDE = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] } as const

export class MagnetFeature implements StageFeature {
  private readonly host: ClimbHost
  private readonly rails: RailRt[]
  private t = 0

  constructor(host: ClimbHost, t: Terrain) {
    this.host = host
    const map = host.map
    this.rails = (t.magnets ?? []).map(def => {
      const y = t.floor[def.j0 * map.w + def.i0]!
      const mesh = buildMagnetRail(def.i0 * CELL, def.j0 * CELL, (def.i1 + 1) * CELL, (def.j1 + 1) * CELL, y)
      const cx = ((def.i0 + def.i1 + 1) / 2) * CELL
      const cz = ((def.j0 + def.j1 + 1) / 2) * CELL
      host.propParent(cx, cz).add(mesh.root)
      let panel: PolarityPanelMesh | null = null
      let px = 0
      let py = 0
      let pz = 0
      let nx = 0
      let nz = 0
      if (def.panel) {
        const [sx, sz] = SIDE[def.panel.side]
        // On the wall of that side, facing back into the cell.
        px = cellCenter(def.panel.i) + sx * (CELL / 2 - 0.08)
        pz = cellCenter(def.panel.j) + sz * (CELL / 2 - 0.08)
        py = t.floor[def.panel.j * map.w + def.panel.i]! + BUTTON_Y
        nx = -sx
        nz = -sz
        panel = buildPolarityPanel()
        panel.root.position.set(px, py, pz)
        panel.root.rotation.y = Math.atan2(nx, nz)
        host.propParent(px, pz).add(panel.root)
      }
      const rt: RailRt = { def, y, sign: 1, clock: 1, mesh, panel, px, py, pz, nx, nz, flash: 0 }
      this.paint(rt, 1)
      return rt
    })
  }

  /** Rail `n`'s pull now: +1 along its (dx, dz), −1 against. */
  pullOf(n: number): number {
    const r = this.rails[n]
    return r ? r.sign * r.clock : 0
  }

  update(dt: number, time: number, p: ClimbBody): void {
    this.t = time
    for (const r of this.rails) {
      const c = clockSign(r.def, time)
      if (c !== r.clock) {
        r.clock = c
        this.host.sfx('energy', cellCenter(r.def.i0), cellCenter(r.def.j0))
      }
      r.flash = Math.max(0, r.flash - dt)
      const soon = flipSoon(r.def, time)
      // The flicker of a coming flip; the hum when Flux is on it.
      const alpha = soon ? 0.35 + 0.65 * (Math.sin(time * 40) > 0 ? 1 : 0) : 1
      if (soon && this.on(r, p) && Math.sin(time * 40) > 0.95) this.host.sfx('uiClick', p.x, p.z)
      this.paint(r, alpha)
      r.mesh.mat.uniforms.uTime!.value = time
    }
  }

  move(p: ClimbBody, out: MoveMod): void {
    for (const r of this.rails) {
      if (!this.on(r, p)) continue
      const s = r.sign * r.clock * r.def.strength
      out.pushX += r.def.dx * s
      out.pushZ += r.def.dz * s
    }
  }

  shot(s: Shot): boolean {
    for (const r of this.rails) {
      if (!r.panel) continue
      // Only from the room's side of the wall.
      if ((s.px - r.px) * r.nx + (s.pz - r.pz) * r.nz < -0.05) continue
      if (!segNear(s.px, s.py, s.pz, s.x, s.y, s.z, r.px, r.py, r.pz, PANEL_R + s.radius)) continue
      r.sign = -r.sign
      r.flash = PANEL_FLASH
      this.host.sfx('uiClick', r.px, r.pz)
      this.host.sfx('energy', r.px, r.pz)
      this.paint(r, 1)
      return true
    }
    return false
  }

  save(): unknown {
    return this.rails.map(r => r.sign)
  }

  restore(s: unknown): void {
    if (!Array.isArray(s)) return
    this.rails.forEach((r, i) => {
      r.sign = s[i] === -1 ? -1 : 1
      r.clock = clockSign(r.def, this.t)
      this.paint(r, 1)
    })
  }

  private on(r: RailRt, p: ClimbBody): boolean {
    const d = r.def
    const i = Math.floor(p.x / CELL)
    const j = Math.floor(p.z / CELL)
    if (i < d.i0 || i > d.i1 || j < d.j0 || j > d.j1) return false
    const k = j * this.host.map.w + i
    const t = this.host.map.terrain!
    return !t.pit[k] && Math.abs(p.y - t.floor[k]!) < RAIL_DY
  }

  private paint(r: RailRt, alpha: number): void {
    const s = r.sign * r.clock
    const color = s > 0 ? NORTH : SOUTH
    setRailPull(r.mesh, r.def.dx * s, r.def.dz * s, color)
    r.mesh.mat.uniforms.uAlpha!.value = alpha
    if (r.panel) setPanelColor(r.panel, color, 1 + r.flash * 4)
  }
}

/**
 * Atlas on the Polarity Works, each line once:
 *
 *   hint.magnet.rail   the first rail's near end
 *   hint.magnet.panel  the first polarity panel
 */
export const polarityCues = (host: ClimbHost, t: Terrain): StageFeature => {
  const map = host.map
  const cues: Array<{ line: AtlasLine; x: number; y: number; z: number; r?: number }> = []
  const first = t.magnets?.[0]
  if (first) {
    cues.push({ line: 'hint.magnet.rail', x: cellCenter(first.i0), z: cellCenter(first.j0), y: t.floor[first.j0 * map.w + first.i0]!, r: 5 })
  }
  const withPanel = t.magnets?.find(m => m.panel)
  if (withPanel?.panel) {
    const { i, j } = withPanel.panel
    cues.push({ line: 'hint.magnet.panel', x: cellCenter(i), z: cellCenter(j), y: t.floor[j * map.w + i]!, r: 4 })
  }
  return cueFeature(host, cues)
}
