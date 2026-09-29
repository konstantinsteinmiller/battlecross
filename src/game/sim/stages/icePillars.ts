import type { Group } from 'three'
import { cellCenter, type IcePillar, type Terrain } from '../../world/levelGen'
import { buildIcePillar, PILLAR_H } from '../../models/stageProps/frost'
import type { ClimbBody, ClimbHost } from '../climb'
import { AtlasCue, type StageFeature } from '../stageFeatures'

/**
 * ─── Ice pillars (Glacier Run) ───────────────────────────────────────────────
 *
 * `Terrain.icePillars`: a crystal column in the middle of its cell, solid to
 * bodies (a `nav.props` circle, so a slide on the ice fetches up against
 * it) and to Flux's shots; its cell is out of every path (`finish` marks it
 * in `navBlock`). A cracked one gives way to CRACK_HP of shot (a quick shot
 * is one, any charged shot all of it): it bursts into shards, its circle
 * and its cell open, and the short way through the hall is there. Which
 * ones are down rides in the save.
 */

/** A pillar's radius (m): two in neighbouring cells leave no gap a body
 *  (PLAYER_R 0.62) fits through. */
export const PILLAR_R = 1.05
export const CRACK_HP = 3

interface PillarRt {
  def: IcePillar
  x: number
  y: number
  z: number
  k: number
  prop: { x: number; z: number; r: number; active: boolean }
  mesh: Group
  hp: number
  broken: boolean
}

export class IcePillars implements StageFeature {
  private readonly host: ClimbHost
  readonly pillars: PillarRt[] = []
  private readonly cue: AtlasCue | null = null

  constructor(host: ClimbHost, t: Terrain) {
    this.host = host
    const W = host.map.w
    for (const d of t.icePillars ?? []) {
      const x = cellCenter(d.i)
      const z = cellCenter(d.j)
      const k = d.j * W + d.i
      const y = t.floor[k]!
      const prop = { x, z, r: PILLAR_R, active: true }
      host.nav.props.push(prop)
      const mesh = buildIcePillar(d.cracked)
      mesh.position.set(x, y, z)
      mesh.rotation.y = d.i * 1.7 + d.j * 0.9
      host.propParent(x, z).add(mesh)
      this.pillars.push({ def: d, x, y, z, k, prop, mesh, hp: CRACK_HP, broken: false })
    }
    const c = this.pillars.find(p => p.def.cracked)
    if (c) this.cue = new AtlasCue(host, 'hint.cryo.pillar', c.x, c.z, c.y, 8)
  }

  update(_dt: number, _time: number, p: ClimbBody, playing: boolean): void {
    this.cue?.update(p, playing)
  }

  /** A player shot at (x, y, z), radius r: true if a pillar stopped it. */
  shotHits(x: number, y: number, z: number, r: number, charge: number): boolean {
    for (const p of this.pillars) {
      if (p.broken || y < p.y - 0.2 || y > p.y + PILLAR_H + 0.8) continue
      const rr = PILLAR_R + r
      if ((x - p.x) ** 2 + (z - p.z) ** 2 > rr * rr) continue
      if (!p.def.cracked) {
        this.host.sfx('tink', x, z)
        return true
      }
      p.hp -= charge > 0 ? CRACK_HP : 1
      if (p.hp <= 0) this.shatter(p, true)
      else {
        this.host.sfx('guardCrack', x, z)
        this.host.fx.sparks(x, y, z, '#dff8ff', 8, 4, 0.18)
      }
      return true
    }
    return false
  }

  private shatter(p: PillarRt, loud: boolean): void {
    p.broken = true
    p.prop.active = false
    p.mesh.visible = false
    this.host.map.navBlock[p.k] = 0
    if (!loud) return
    this.host.sfx('guardBreak', p.x, p.z)
    this.host.shake(0.12)
    for (let n = 0; n < 3; n++) this.host.fx.sparks(p.x, p.y + 0.8 + n * 1.2, p.z, n & 1 ? '#bfeaff' : '#ffffff', 12, 7, 0.26)
    this.host.shocks.spawn(p.x, p.y + 0.05, p.z, 2, '#bff4ff', 0.4)
  }

  save(): unknown {
    const down: number[] = []
    this.pillars.forEach((p, i) => { if (p.broken) down.push(i) })
    return { down, cue: this.cue?.said ? 1 : 0 }
  }

  restore(s: unknown): void {
    const o = s as { down?: unknown; cue?: unknown } | null
    if (!o || typeof o !== 'object') return
    if (Array.isArray(o.down)) for (const i of o.down) { const p = this.pillars[i as number]; if (p && !p.broken) this.shatter(p, false) }
    if (this.cue) this.cue.said = o.cue === 1
  }
}
