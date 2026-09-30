import { Color } from 'three'
import { CELL, cellCenter, type VentSpec } from '../../world/levelGen'
import { buildShockPanel, type ShockPanelMesh } from '../../models/stageProps/rail'
import { PLAYER_R } from '../constants'
import type { ClimbBody, ClimbHost } from '../climb'
import { AtlasCue, type StageFeature } from '../stageFeatures'

/**
 * ─── Electrified floor panels (Rail Rush's shock walkway) ───────────────────
 *
 * A `VentSpec` of kind 'shock' is a floor panel filling its cell: live for
 * `on` s of every `period`, offset by `phase` on the mission clock. It warns
 * first (the grid blinks amber and clicks for SHOCK_WARN s), then goes
 * white-hot with a crackle of sparks; Flux standing on it while it is live
 * takes SHOCK_COST of his health, once a pulse, unblockable. The walkway's
 * rows pulse staggered (`world/stages/volt.ts`), so the dark row ahead is
 * the one to step onto — timing, not luck.
 *
 * Atlas says the tip once, as Flux comes up to the first panel.
 */

/** The warning before a panel goes live (s), and what a jolt costs (share
 *  of max health). */
export const SHOCK_WARN = 0.55
export const SHOCK_COST = 0.12
/** Sparks off a live panel every so often (s). */
const SPARK_EVERY = 0.12

const GRID = {
  rest: new Color('#2a3a7a'),
  warn: new Color('#ffb02a'),
  warnDim: new Color('#5a3a08'),
  live: new Color('#fffbe0'),
  liveAlt: new Color('#9fe8ff')
}

interface PanelRt {
  def: VentSpec
  x: number
  z: number
  mesh: ShockPanelMesh
  /** The pulse the warning / the jolt / the crackle last fired in. */
  warned: number
  hitCyc: number
  spark: number
  /** The first panel of its row (same column, same pulse): it alone clicks
   *  and hisses for the row. */
  lead: boolean
}

export class ShockFeature implements StageFeature {
  private readonly host: ClimbHost
  private readonly panels: PanelRt[] = []
  private readonly cue: AtlasCue | null

  constructor(host: ClimbHost, vents: VentSpec[]) {
    this.host = host
    for (const v of vents) {
      if (v.kind !== 'shock') continue
      const x = cellCenter(v.i)
      const z = cellCenter(v.j)
      const mesh = buildShockPanel(CELL)
      mesh.root.position.set(x, v.y + 0.03, z)
      host.propParent(x, z).add(mesh.root)
      const lead = !this.panels.some(o => o.def.i === v.i && o.def.phase === v.phase)
      this.panels.push({ def: v, x, z, mesh, warned: -1, hitCyc: -1, spark: 0, lead })
    }
    const first = this.panels[0]
    this.cue = first ? new AtlasCue(host, 'hint.volt.panels', first.x, first.z, first.def.y, 7) : null
  }

  /** Whether a panel is live at `time` (its pulse's first `on` s). */
  static live(v: VentSpec, time: number): boolean {
    const clock = time + v.phase
    return clock - Math.floor(clock / v.period) * v.period < v.on
  }

  update(dt: number, time: number, p: ClimbBody, playing: boolean): void {
    this.cue?.update(p, playing)
    const host = this.host
    for (const pn of this.panels) {
      const d = pn.def
      const clock = time + d.phase
      const cyc = Math.floor(clock / d.period)
      const u = clock - cyc * d.period
      const live = u < d.on
      const toGo = d.period - u
      const warn = !live && toGo < SHOCK_WARN
      const near = Math.abs(p.x - pn.x) < 16 && Math.abs(p.z - pn.z) < 16
      if (live) pn.mesh.mat.color.copy(Math.floor(time * 20 + d.i) % 2 ? GRID.live : GRID.liveAlt)
      else if (warn) pn.mesh.mat.color.copy(Math.floor(toGo * 12) % 2 ? GRID.warn : GRID.warnDim)
      else pn.mesh.mat.color.copy(GRID.rest)
      // One click per row's warning, one hiss as it goes live.
      if (warn && pn.warned !== cyc + 1 && near) {
        pn.warned = cyc + 1
        if (pn.lead) host.sfx('trapClick', pn.x, pn.z)
      }
      if (live) {
        pn.spark -= dt
        if (pn.spark <= 0 && near) {
          pn.spark = SPARK_EVERY
          host.fx.sparks(pn.x + (Math.random() - 0.5) * 2.4, d.y + 0.1, pn.z + (Math.random() - 0.5) * 2.4, '#fff6a0', 3, 4, 0.12)
        }
        if (u < dt * 1.5 && near && pn.lead) host.sfx('trapHiss', pn.x, pn.z)
      }
      // Machines standing on a live panel take the jolt too.
      if (live) {
        const r0 = CELL / 2
        host.hurtMachines?.(SHOCK_COST, pn.x, pn.z, (x, y, z) => Math.abs(y - d.y) < 0.5 && Math.abs(x - pn.x) < r0 && Math.abs(z - pn.z) < r0)
      }
      // The jolt: standing on the live panel.
      if (!playing || !live || pn.hitCyc === cyc || !p.ground || Math.abs(p.y - d.y) > 0.5) continue
      const r = CELL / 2 + PLAYER_R * 0.3
      if (Math.abs(p.x - pn.x) > r || Math.abs(p.z - pn.z) > r) continue
      pn.hitCyc = cyc
      const res = host.hitPlayer(null, Math.round(host.combat.maxHp * SHOCK_COST), { blockable: false, fromX: pn.x, fromZ: pn.z, kind: 'aoe', hazard: 'volt' })
      if (res === 'hit') {
        host.shake(0.18)
        host.fx.sparks(p.x, p.y + 0.8, p.z, '#fffbe0', 12, 6, 0.16)
      }
    }
  }

  save(): unknown {
    return this.cue?.said ? 1 : 0
  }

  restore(s: unknown): void {
    if (this.cue) this.cue.said = s === 1
  }

  dispose(): void {
    for (const pn of this.panels) pn.mesh.root.removeFromParent()
  }
}
