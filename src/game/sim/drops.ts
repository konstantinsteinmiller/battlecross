import type { Object3D } from 'three'
import type { ClimbHost } from './climb'
import { PLAYER_R } from './constants'

/**
 * ─── Things that fall on a telegraph ─────────────────────────────────────────
 *
 * The icicles' rhythm, lifted out of the stage so an arena can use it too (the
 * Scrapper's crane, the lightning on the Fortress roof): a red ring opens on
 * the floor and fills (`warn` s), the object falls (`fall` s, accelerating),
 * and where it lands it hurts whoever stands within `reach` — Flux by `cost`
 * of his max health, not blockable, and machines through `hurtMachines` (never
 * a Core Master: a feature that wants the boss hurt does it in `onLand`).
 *
 * In first person nobody looks up, so the ring on the floor is the warning;
 * `sound` plays when it opens (a creak, a crackle) for the ones looking away.
 */

export interface DropSpec {
  x: number
  z: number
  /** The floor it lands on. */
  y: number
  /** Ring time before it falls, and the fall itself (s). */
  warn: number
  fall: number
  /** Where it falls from, over the floor (m). Ignored without a mesh. */
  height: number
  reach: number
  /** Flux's loss on a hit, as a share of his max health (0 = harmless). */
  cost: number
  /** What falls (shown hanging during the warning, then dropped). Optional: a
   *  lightning strike has nothing to show but the ring and the flash. */
  mesh?: Object3D
  /** The ring's opening sound. */
  sound?: string
  /** The hazard name Flux's hit carries (the damage feed, Atlas's lines). */
  hazard?: string
  /** The impact colour (sparks, shock ring). */
  color?: string
  /** After the impact (a crate stays as cover, a strike scorches…). */
  onLand?: (d: DropSpec, hitFlux: boolean) => void
}

export type DropHost = Pick<ClimbHost, 'markers' | 'shocks' | 'fx' | 'sfx' | 'hitPlayer' | 'hurtMachines' | 'shake'> & {
  combat: { maxHp: number }
}

interface DropRt { spec: DropSpec; t: number }

export class Drops {
  private readonly host: DropHost
  private readonly live: DropRt[] = []

  constructor(host: DropHost) {
    this.host = host
  }

  get count(): number { return this.live.length }

  /** Start one: the ring opens now. */
  drop(spec: DropSpec): void {
    this.live.push({ spec, t: 0 })
    this.host.markers.spawn(spec.x, spec.z, spec.reach + 0.25, spec.warn + spec.fall)
    if (spec.sound) this.host.sfx(spec.sound, spec.x, spec.z)
    if (spec.mesh) spec.mesh.position.set(spec.x, spec.y + spec.height, spec.z)
  }

  /** `player`: where Flux is; `playing`: he can be hurt now. */
  update(dt: number, player: { x: number; y: number; z: number }, playing: boolean): void {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const d = this.live[i]!
      const s = d.spec
      d.t += dt
      if (d.t < s.warn) {
        // Hanging, trembling harder as the ring closes in.
        const k = d.t / s.warn
        s.mesh?.position.set(s.x + Math.sin(d.t * 55) * 0.05 * k, s.y + s.height, s.z)
        continue
      }
      if (d.t < s.warn + s.fall) {
        const k = (d.t - s.warn) / s.fall
        s.mesh?.position.set(s.x, s.y + s.height * (1 - k * k), s.z)
        continue
      }
      s.mesh?.position.set(s.x, s.y, s.z)
      this.live.splice(i, 1)
      this.land(s, player, playing)
    }
  }

  private land(s: DropSpec, p: { x: number; y: number; z: number }, playing: boolean): void {
    const h = this.host
    const color = s.color ?? '#ffb12a'
    h.sfx('guardCrack', s.x, s.z)
    h.fx.sparks(s.x, s.y + 0.3, s.z, color, 14, 5, 0.22)
    h.shocks.spawn(s.x, s.y + 0.05, s.z, s.reach + 0.4, color, 0.3)
    h.shake(0.15)
    if (s.cost > 0) {
      h.hurtMachines?.(s.cost, s.x, s.z, (x, y, z) => Math.abs(y - s.y) < 1.2 && (x - s.x) ** 2 + (z - s.z) ** 2 < (s.reach + 0.4) ** 2)
    }
    let hit = false
    if (playing && s.cost > 0 && Math.abs(p.y - s.y) <= 1.2) {
      const reach = s.reach + PLAYER_R * 0.6
      if ((p.x - s.x) ** 2 + (p.z - s.z) ** 2 <= reach * reach) {
        hit = true
        h.hitPlayer(null, Math.round(h.combat.maxHp * s.cost), { blockable: false, fromX: s.x, fromZ: s.z, kind: 'aoe', hazard: s.hazard })
      }
    }
    s.onLand?.(s, hit)
  }

  /** Drop everything in flight (a phase change, a retry). */
  clear(): void {
    this.live.length = 0
  }
}
