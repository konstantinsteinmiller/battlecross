import { Group, Mesh, type Object3D } from 'three'
import { CELL, type Room } from '../world/levelGen'
import { floorAt, type Nav } from '../world/nav'
import { rbox, rcyl, xform, paint, merge } from '../models/kit'
import { toonVC, outlineMat } from '../models/toon'
import { buildCrate } from '../models/props'
import type { Theme } from '../world/themes'
import type { Enemy } from './world'
import type { Crate } from './objectives'
import { Drops, type DropHost } from './drops'

/**
 * ─── The Scrapper's magnet crane (#108) ──────────────────────────────────────
 *
 * The scrapyard boss is "a junk crane with a magnet claw", and his arena gets
 * the real thing: a gantry on the two long walls, a bridge across, a trolley
 * with a magnet on a cable. It wakes for the second half of the fight only —
 * the Scrapper is Mission 1's boss, and a first-time player's first fight
 * stays exactly as it was until he is half beaten:
 *
 *   • every CRANE_EVERY s it rolls over Flux (lagging a step behind him), a
 *     ring opens on the floor (CRANE_WARN s), the hum cuts out, and a crate
 *     drops: CRANE_COST of Flux's health if he is still under it;
 *   • a crate landing on the Scrapper hurts HIM (BOSS_COST of his health):
 *     baiting the drop is the room's trick;
 *   • the crates stay as cover, break to any shot (not just a charge, like a
 *     supply crate) and always hold an energy pill;
 *   • at most CRANE_MAX stand at once: then the crane picks the oldest up and
 *     drops it again.
 *
 * On the mission's clock, outside the boss's own AI, like the arena's enrage.
 */

export const CRANE_EVERY = 8
export const CRANE_WARN = 1.4
export const CRANE_FALL = 0.4
export const CRANE_COST = 0.1
export const BOSS_COST = 0.06
export const CRANE_MAX = 2
/** The crane's travel to a spot (s): it rolls there before the ring opens. */
const TRAVEL = 1.2
/** The rails' height over the floor, and the magnet's cable under them (m):
 *  the crate it carries hangs from 3 m, well over Flux's head. */
const RAIL_H = 5.6
const HANG = 1.6
/** The bottom of a carried crate over the floor (m). */
const CRATE_Y = RAIL_H + 0.5 - HANG - 1.5

export interface CraneHost extends DropHost {
  nav: Nav
  theme: Theme
  player: { x: number; y: number; z: number }
  addArenaCrate(x: number, z: number, yaw: number, kind: 'crate' | 'barrel', y: number): Crate | null
  /** The crate's own removal (the crane lifts it away). */
  liftCrate(c: Crate): void
  hurtBoss(boss: Enemy, frac: number, x: number, z: number): void
  propParent(x: number, z: number): Object3D
}

type Phase = 'idle' | 'travel' | 'drop'

export class BossCrane {
  readonly root = new Group()
  private readonly bridge: Group
  private readonly trolley: Group
  private readonly cable: Mesh
  private readonly hanging: Group
  private readonly drops: Drops
  readonly standing: Crate[] = []
  private phase: Phase = 'idle'
  private t = CRANE_EVERY * 0.5
  private from = { x: 0, z: 0 }
  private to = { x: 0, z: 0 }
  private carry = { x: 0, z: 0 }
  private readonly x0: number
  private readonly x1: number
  private readonly z0: number
  private readonly z1: number
  readonly y: number

  constructor(private readonly host: CraneHost, readonly room: Room) {
    this.drops = new Drops(host)
    this.x0 = (room.x0 + 1.5) * CELL
    this.x1 = (room.x0 + room.w - 1.5) * CELL
    this.z0 = (room.z0 + 1.5) * CELL
    this.z1 = (room.z0 + room.h - 1.5) * CELL
    const cx = (room.x0 + room.w / 2) * CELL
    const cz = (room.z0 + room.h / 2) * CELL
    this.y = Math.max(0, floorAt(host.nav, cx, cz))
    const t = host.theme
    const len = room.w * CELL
    const span = room.h * CELL
    // The two rails along the walls, on the room's x axis.
    const rails = merge([-1, 1].map(s => xform(paint(rbox(len, 0.35, 0.45, 0.08), t.pilaster), [0, 0, s * (span / 2 - 0.4)])))
    const railMesh = this.toon(rails)
    railMesh.position.set(cx, this.y + RAIL_H + 0.5, cz)
    this.root.add(railMesh)
    // The bridge spans the rails and rolls along x; the trolley rolls along it.
    this.bridge = new Group()
    this.bridge.add(this.toon(merge([
      xform(paint(rbox(0.6, 0.5, span - 0.6, 0.1), '#e0a21a'), [0, 0, 0]),
      ...[-1, 1].map(s => xform(paint(rbox(0.9, 0.35, 0.6, 0.08), t.trim), [0, 0.1, s * (span / 2 - 0.4)]))
    ])))
    this.bridge.position.set(cx, this.y + RAIL_H + 0.5, cz)
    this.trolley = new Group()
    this.trolley.add(this.toon(paint(rbox(0.9, 0.5, 0.9, 0.12), '#3a3f4a')))
    this.cable = this.toon(paint(rcyl(0.04, 1, 0.01, 6), '#202430'))
    this.trolley.add(this.cable)
    const magnet = this.toon(merge([
      xform(paint(rcyl(0.62, 0.32, 0.08, 18), '#c43a2a'), [0, 0, 0]),
      xform(paint(rcyl(0.5, 0.06, 0.02, 18), '#d8dde6'), [0, -0.18, 0])
    ]))
    magnet.name = 'magnet'
    this.trolley.add(magnet)
    this.bridge.add(this.trolley)
    this.root.add(this.bridge)
    this.hanging = buildCrate(t).root
    this.hanging.visible = false
    this.root.add(this.hanging)
    this.setMagnet(HANG)
    host.propParent(cx, cz).add(this.root)
  }

  private toon(geo: ReturnType<typeof merge>): Mesh {
    const m = new Mesh(geo, toonVC())
    const o = new Mesh(geo, outlineMat(0.03))
    o.renderOrder = -1
    m.add(o)
    return m
  }

  /** The magnet `drop` metres under the trolley (the cable stretched to it). */
  private setMagnet(drop: number): void {
    const magnet = this.trolley.getObjectByName('magnet')!
    magnet.position.y = -drop
    this.cable.scale.set(1, drop, 1)
    this.cable.position.y = -drop / 2
  }

  /** Where the crane is over the floor (x, z). */
  private at(x: number, z: number): void {
    this.bridge.position.x = x
    this.trolley.position.z = z - this.bridge.position.z
  }

  /** A crane crate was broken (it no longer stands). */
  forget(c: Crate): void {
    const i = this.standing.indexOf(c)
    if (i >= 0) this.standing.splice(i, 1)
  }

  /**
   * One step. `live`: the fight is on and the boss is in its second half (the
   * crane rests above the room otherwise, and whatever it carried still lands).
   */
  update(dt: number, boss: Enemy, live: boolean, playing: boolean): void {
    this.drops.update(dt, this.host.player, playing)
    if (this.phase === 'drop' && this.drops.count === 0) {
      this.phase = 'idle'
      this.hanging.visible = false
    }
    if (this.phase === 'travel') {
      this.t += dt
      const k = Math.min(1, this.t / TRAVEL)
      const e = k * k * (3 - 2 * k)
      this.at(this.from.x + (this.to.x - this.from.x) * e, this.from.z + (this.to.z - this.from.z) * e)
      this.hanging.position.set(this.bridge.position.x, this.y + CRATE_Y, this.bridge.position.z + this.trolley.position.z)
      if (k >= 1) this.release(boss)
      return
    }
    if (this.phase !== 'idle' || !live) return
    this.t -= dt
    if (this.t > 0) return
    this.t = 0
    this.pick()
  }

  /** Roll over Flux (a step behind him), lifting the oldest crate first when
   *  the room already has CRANE_MAX. */
  private pick(): void {
    const p = this.host.player
    if (this.standing.length >= CRANE_MAX) {
      const old = this.standing.shift()!
      this.host.liftCrate(old)
      this.host.sfx('door', old.x, old.z)
    }
    this.from = { x: this.bridge.position.x, z: this.bridge.position.z + this.trolley.position.z }
    const lag = 0.6 + Math.random() * 0.6
    const a = Math.random() * Math.PI * 2
    this.to = {
      x: Math.max(this.x0, Math.min(this.x1, p.x + Math.cos(a) * lag)),
      z: Math.max(this.z0, Math.min(this.z1, p.z + Math.sin(a) * lag))
    }
    this.hanging.visible = true
    this.phase = 'travel'
    this.t = 0
    this.host.sfx('trapHiss', this.to.x, this.to.z)
  }

  private release(boss: Enemy): void {
    this.phase = 'drop'
    this.t = CRANE_EVERY
    const { x, z } = this.to
    this.carry = { x, z }
    this.drops.drop({
      x, z, y: this.y,
      warn: CRANE_WARN, fall: CRANE_FALL, height: CRATE_Y,
      reach: 0.9, cost: CRANE_COST, mesh: this.hanging, sound: 'alert', hazard: 'crate', color: '#ffb12a',
      onLand: () => this.landed(boss)
    })
  }

  private landed(boss: Enemy): void {
    const { x, z } = this.carry
    this.hanging.visible = false
    // On the Scrapper: his own crane's crate.
    if (boss.state !== 'dead' && Math.hypot(boss.x - x, boss.z - z) < 0.9 + boss.def.hitR) {
      this.host.hurtBoss(boss, BOSS_COST, x, z)
      return
    }
    const c = this.host.addArenaCrate(x, z, Math.random() * Math.PI, 'crate', this.y)
    if (!c) return
    c.arena = true
    c.soft = true
    c.crane = true
    c.hp = 1
    this.standing.push(c)
  }

  dispose(): void {
    this.drops.clear()
    this.root.removeFromParent()
  }
}
