import { CELL, cellCenter, type NeonBridge, type NeonSwitch, type Terrain } from '../../world/levelGen'
import { BUTTON_Y } from '../../world/stages/builder'
import type { Plat } from '../../world/nav'
import { buildBridge, buildSwitch, NEON_A, NEON_B, type BridgeMesh, type SwitchMesh } from '../../models/stageProps/neon'
import type { ClimbBody, ClimbHost } from '../climb'
import type { Shot } from '../world'
import { segNear } from '../secrets'
import { AtlasCue, type StageFeature } from '../stageFeatures'

/**
 * ─── Bridges of light (the Blackout Boulevard, `world/stages/neon.ts`) ───────
 *
 * A `NeonBridge` is a platform (`nav.plats`, like a crumbling slab) that is
 * floor only while lit. A switched bridge is lit while its room's switch
 * says its group (shoot the switch: group 0 ↔ 1). A clock bridge is lit
 * `on` s of every `period`; FLICKER s before it goes dark it stutters (and
 * buzzes), so a player on it knows to move. Dark, a faint outline stays.
 * Which group each room shows rides in the climb's snapshot.
 */

/** A clock bridge flickers this long before it goes dark (s). */
export const FLICKER = 0.7
/** A switch's hit radius (m) over the shot's own. */
const SWITCH_R = 0.45

/** Is clock bridge `b` lit at `time`? (A switched one: see its room.) */
export const clockLit = (b: NeonBridge, time: number): boolean => {
  const period = b.period ?? 4
  const on = b.on ?? period / 2
  const u = ((((time + (b.phase ?? 0)) % period) + period) % period)
  return u < on
}

/** Is clock bridge `b` about to go dark? */
export const clockFlicker = (b: NeonBridge, time: number): boolean => {
  const period = b.period ?? 4
  const on = b.on ?? period / 2
  const u = ((((time + (b.phase ?? 0)) % period) + period) % period)
  return u < on && u >= on - FLICKER
}

interface BridgeRt {
  def: NeonBridge
  plat: Plat
  mesh: BridgeMesh
  lit: boolean
  x: number
  z: number
}

interface SwitchRt {
  def: NeonSwitch
  mesh: SwitchMesh
  x: number
  y: number
  z: number
  nx: number
  nz: number
  flash: number
}

const SIDE = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] } as const

export class NeonFeature implements StageFeature {
  private readonly host: ClimbHost
  readonly bridges: BridgeRt[] = []
  readonly switches: SwitchRt[] = []
  /** The lit group of each room with a switch. */
  readonly group = new Map<number, 0 | 1>()
  private readonly cues: AtlasCue[] = []

  constructor(host: ClimbHost, t: Terrain) {
    this.host = host
    const nav = host.nav
    for (const d of t.neon ?? []) {
      const x0 = d.i * CELL
      const z0 = d.j * CELL
      const plat: Plat = { x0, z0, x1: x0 + d.w * CELL, z1: z0 + d.d * CELL, top: d.y, dx: 0, dz: 0 }
      nav.plats!.push(plat)
      const mesh = buildBridge(d.w * CELL, d.d * CELL, d.group === 1 ? NEON_B : NEON_A)
      const x = x0 + (d.w * CELL) / 2
      const z = z0 + (d.d * CELL) / 2
      mesh.root.position.set(x, d.y, z)
      host.propParent(x, z).add(mesh.root)
      this.bridges.push({ def: d, plat, mesh, lit: true, x, z })
      if (d.group !== undefined && !this.group.has(d.room)) this.group.set(d.room, 0)
    }
    for (const d of t.neonSwitches ?? []) {
      const [sx, sz] = SIDE[d.side]
      const x = cellCenter(d.i) + sx * (CELL / 2 - 0.08)
      const z = cellCenter(d.j) + sz * (CELL / 2 - 0.08)
      const y = t.floor[d.j * host.map.w + d.i]! + BUTTON_Y
      const mesh = buildSwitch()
      mesh.root.position.set(x, y, z)
      mesh.root.rotation.y = Math.atan2(-sx, -sz)
      host.propParent(x, z).add(mesh.root)
      this.switches.push({ def: d, mesh, x, y, z, nx: -sx, nz: -sz, flash: 0 })
      if (!this.group.has(d.room)) this.group.set(d.room, 0)
    }
    const clock = this.bridges.find(b => b.def.group === undefined)
    if (clock) this.cues.push(new AtlasCue(host, 'hint.neon.blink', clock.x, clock.z, clock.def.y, 6))
    const sw = this.switches[0]
    if (sw) this.cues.push(new AtlasCue(host, 'hint.neon.switch', sw.x, sw.z, sw.y - BUTTON_Y, 6))
    // The wall-kick shaft's foot: the one line that teaches it.
    const kick = t.ladders.find(l => l.kick)
    if (kick) this.cues.push(new AtlasCue(host, 'hint.neon.kick', cellCenter(kick.i), cellCenter(kick.j), kick.y0, 4))
    this.apply(0)
  }

  update(dt: number, time: number, p: ClimbBody, playing: boolean): void {
    for (const s of this.switches) s.flash = Math.max(0, s.flash - dt)
    this.apply(time)
    for (const c of this.cues) c.update(p, playing)
  }

  shot(s: Shot): boolean {
    for (const w of this.switches) {
      if ((s.px - w.x) * w.nx + (s.pz - w.z) * w.nz < -0.05) continue
      if (!segNear(s.px, s.py, s.pz, s.x, s.y, s.z, w.x, w.y, w.z, SWITCH_R + s.radius)) continue
      const g = this.group.get(w.def.room) ?? 0
      this.group.set(w.def.room, g === 0 ? 1 : 0)
      w.flash = 0.3
      this.host.sfx('uiClick', w.x, w.z)
      this.host.sfx('energy', w.x, w.z)
      return true
    }
    return false
  }

  save(): unknown {
    return { group: [...this.group.entries()], cues: this.cues.map(c => (c.said ? 1 : 0)) }
  }

  restore(s: unknown): void {
    const o = s as { group?: unknown; cues?: unknown } | null
    if (!o || typeof o !== 'object') return
    if (Array.isArray(o.group)) for (const e of o.group) if (Array.isArray(e) && this.group.has(e[0])) this.group.set(e[0], e[1] === 1 ? 1 : 0)
    if (Array.isArray(o.cues)) this.cues.forEach((c, i) => { c.said = (o.cues as unknown[])[i] === 1 })
    this.apply(0)
  }

  /** Light and solidity of every bridge, and the switches' rings. */
  private apply(time: number): void {
    for (const b of this.bridges) {
      const d = b.def
      let lit: boolean
      let flicker = false
      if (d.group !== undefined) lit = (this.group.get(d.room) ?? 0) === d.group
      else {
        lit = clockLit(d, time)
        flicker = clockFlicker(d, time)
      }
      if (lit !== b.lit) {
        b.lit = lit
        b.plat.top = lit ? d.y : -1e4
        if (lit) this.host.fx.riseRing(b.x, d.y + 0.05, b.z, d.group === 1 ? NEON_B : NEON_A, 0.8, 10)
      }
      const blink = flicker && Math.sin(time * 45) > 0
      b.mesh.slab.opacity = lit ? (blink ? 0.12 : 0.55) : 0.04
      b.mesh.rim.opacity = 1
      b.mesh.rim.transparent = !lit
      b.mesh.rim.color.set(d.group === 1 ? NEON_B : NEON_A).multiplyScalar(lit ? (blink ? 0.4 : 1) : 0.25)
      if (flicker && Math.sin(time * 45) > 0.97) this.host.sfx('uiClick', b.x, b.z)
    }
    for (const s of this.switches) {
      const g = this.group.get(s.def.room) ?? 0
      s.mesh.ring.color.set(g === 1 ? NEON_B : NEON_A).multiplyScalar(1 + s.flash * 3)
    }
  }
}
