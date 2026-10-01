import {
  AdditiveBlending, BoxGeometry, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, type Object3D
} from 'three'
import { CELL, type Room } from '../world/levelGen'
import { rbox, rcyl, rcone, sph, torus, xform, paint, merge } from '../models/kit'
import { toonVC, outlineMat } from '../models/toon'
import { MASTER_COLOR } from '../data/signature'
import { BOSSES } from '../data/bosses'
import type { BossId } from '../models/bosses'
import type { WeaponId } from '../data/weapons'
import { pushHud, hud } from '../state/hud'
import { showBanner } from '../state/banner'
import type { AtlasLine } from './atlas'
import type { ClimbBody } from './climb'
import type { StageFeature } from './stageFeatures'
import type { Enemy, Shot } from './world'
import { Drops, type DropHost } from './drops'

/**
 * ─── The Grand Master Bot (#101) ─────────────────────────────────────────────
 *
 * Vex's last card. When he falls on the Core ring he presses a big red button:
 * the Fortress rumbles, and the ten Masters' bodies drop from the sky onto the
 * Spire's roof and lock together into one giant — Drill and Tide for feet,
 * the Scrapper's chest, Volt and Magnet shoulders, Blaze and Frost arms, Gale
 * and Rotor wings, Neon's head. Then it fights, in four parts, Mega Man 2's
 * Wily Machine style: one weak spot at a time, marked by Atlas —
 *
 *   ARMS  Blaze's cannon throws fire fans, Frost's lance fires ice;
 *   FEET  the stomps send shockwaves along the floor (block them);
 *   HEAD  a laser sweeps the roof after a glow (block it);
 *   CORE  every Master's attack, at random.
 *
 * From the head on it also charges its own PRISM CANNON: a ring of the ten
 * Masters' colours on its chest, then a wide beam swept across the roof.
 *
 * It is a stage feature of the Fortress (`buildStageFeatures` order: last), so
 * its state rides in the climb's save: a reload or a "Retry from checkpoint"
 * comes back to the fight with every broken part still broken.
 */

type PartId = 'armL' | 'armR' | 'footL' | 'footR' | 'head' | 'body'

interface Part {
  id: PartId
  master: BossId
  root: Group
  /** Its weak spot, in the giant's frame (it faces +z, toward the roof's
   *  south side, where Flux lands). */
  wx: number
  wy: number
  wz: number
  r: number
  share: number
  hp: number
  max: number
  weakTo: WeaponId | null
  gone: boolean
  fallT: number
  flash: number
  /** Where it was put together (local), and the drop's start. */
  home: [number, number, number]
}

/** The parts in the order they come off, and each phase's set. */
export const GM_PHASES: PartId[][] = [['armL', 'armR'], ['footL', 'footR'], ['head'], ['body']]
/** Shares of the giant's health. */
const SHARES: Record<PartId, number> = { armL: 0.125, armR: 0.125, footL: 0.125, footR: 0.125, head: 0.2, body: 0.3 }
/** The giant's health against Vex's own (his max). */
export const GM_HP_MUL = 2.5
/** A hit on the weak spot itself, and with the part's weakness. */
export const WEAK_SPOT_MUL = 1.5
export const WEAKNESS_MUL = 2
const PART_OF: Record<PartId, BossId> = {
  footL: 'drillMaster', footR: 'tideMaster', body: 'scrapper', armL: 'blazeMaster', armR: 'frostMaster', head: 'neonMaster'
}
/** The intro: when each beat lands (s after Vex falls). */
const T_BUTTON = 3.2
const T_RUMBLE = 3.6
const T_BLACK = 8.2
const T_JUMP = 8.6
const T_ASSEMBLE = 9.2
const DROP_EVERY = 0.8
const DROP_S = 0.5
/** Fight timing. */
const ARM_EVERY = 2.2
const STOMP_EVERY = 3.0
const LASER_EVERY = 4.2
const LASER_TELL = 1.0
const LASER_SWEEP = 1.3
const PRISM_EVERY = 9
const PRISM_CHARGE = 1.5
const BODY_EVERY = 2.0
const DEATH_S = 2.4

const ORDER: PartId[] = ['footL', 'footR', 'body', 'armL', 'armR', 'head']
const ALL_MASTERS = Object.keys(MASTER_COLOR).filter(id => id !== 'vexMk1') as BossId[]

export type GmState = 'dormant' | 'intro' | 'fight' | 'dying' | 'done'

export interface GmHost extends DropHost {
  player: ClimbBody & { px: number; pz: number; py: number; pitch?: number }
  /** Vex (dead by now): the source the giant's shots are booked to. */
  vex: Enemy
  dmg: number
  propParent(x: number, z: number): Object3D
  sfx(name: string, x?: number, z?: number): void
  say(line: AtlasLine): void
  fireEnemyShot(e: Enemy, x: number, y: number, z: number, dx: number, dy: number, dz: number, speed: number, dmg: number, blockable: boolean): void
  spawnWave(e: Enemy, x: number, z: number, dx: number, dz: number, speed: number, halfWidth: number, range: number, dmg: number, color: string): void
  pull(x: number, z: number, speed: number, dur: number): void
  skyFlash?(amount: number): void
  keepRetryPoint(): void
  /** A press this frame (skips the intro). */
  pressed(): boolean
  /** The giant fell: the objective is done now. */
  onDefeated(): void
}

export class GrandMaster implements StageFeature {
  state: GmState = 'dormant'
  readonly root = new Group()
  readonly parts: Part[] = []
  private t = 0
  private readonly x: number
  private readonly z: number
  /** The roof (stage 1 of the Core Descent): where it is fought. */
  private readonly roof: Room
  private readonly drops: Drops
  private readonly button: Group
  private readonly marker: Mesh
  private readonly beam: Mesh
  private readonly prism: Mesh
  private visor: MeshBasicMaterial | null = null
  private phase = 0
  private armT = ARM_EVERY
  private stompT = STOMP_EVERY
  private laserT = LASER_EVERY
  private prismT = PRISM_EVERY
  private bodyT = BODY_EVERY
  /** A sweep in progress: −1 none; its kind, start yaw and direction. */
  private sweepT = -1
  private sweepKind: 'laser' | 'prism' = 'laser'
  private sweepYaw = 0
  private sweepDir = 1
  private sweepHit = false
  private chargeT = -1
  private armTurn = 0
  private lastBeat = -1

  constructor(private readonly host: GmHost, roof: Room) {
    this.roof = roof
    this.drops = new Drops(host)
    this.x = (roof.x0 + roof.w / 2) * CELL
    this.z = (roof.z0 + 1.1) * CELL
    this.root.position.set(this.x, 0, this.z)
    this.root.visible = false
    const vexMax = host.vex.maxHp
    for (const id of ORDER) this.parts.push(this.build(id, vexMax))
    // Atlas's mark on the weak spot to hit.
    this.marker = new Mesh(merge([paint(torus(1, 0.08, 6, 32), '#ffffff')]), new MeshBasicMaterial({ color: '#ffffff', transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false }))
    this.marker.visible = false
    this.root.add(this.marker)
    // The laser and the Prism Cannon's beam: a long bar from the head / chest.
    this.beam = new Mesh(new BoxGeometry(0.35, 0.35, 30), new MeshBasicMaterial({ color: '#ff4f8a', transparent: true, opacity: 0.85, blending: AdditiveBlending, depthWrite: false, toneMapped: false }))
    this.beam.visible = false
    this.root.add(this.beam)
    this.prism = new Mesh(merge([torus(1.1, 0.16, 6, 40)]), new MeshBasicMaterial({ color: '#ffffff', transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, toneMapped: false }))
    this.prism.position.set(0, 5, 1.35)
    this.prism.visible = false
    this.root.add(this.prism)
    // Vex's big red button (shown where he fell, during the intro).
    this.button = new Group()
    this.button.add(this.toon(merge([
      xform(paint(rbox(0.5, 0.3, 0.4, 0.1), '#2b2f38'), [0, 0.15, 0]),
      xform(paint(sph(0.16, 12, 8), '#ff2d3f'), [0, 0.34, 0])
    ])))
    this.button.visible = false
    host.propParent(this.x, this.z).add(this.root)
  }

  // ─── The body ──────────────────────────────────────────────────────────────

  private toon(geo: ReturnType<typeof merge>): Mesh {
    const m = new Mesh(geo, toonVC())
    const o = new Mesh(geo, outlineMat(0.04))
    o.renderOrder = -1
    m.add(o)
    return m
  }

  private build(id: PartId, vexMax: number): Part {
    const master = PART_OF[id]
    const c = MASTER_COLOR[master]
    const dark = '#2b2f38'
    const g: ReturnType<typeof paint>[] = []
    let w: [number, number, number] = [0, 0, 0]
    let r = 0.9
    switch (id) {
      case 'footL':
        g.push(xform(paint(rbox(1.7, 1.1, 2.1, 0.3), c), [-1.6, 0.55, 0.1]))
        g.push(xform(paint(rcone(0.55, 0.05, 1.2), '#c9ced8'), [-1.6, 0.55, 1.6], [Math.PI / 2, 0, 0]))
        g.push(xform(paint(rcyl(0.5, 2.6, 0.1), dark), [-1.6, 2.4, 0]))
        w = [-1.6, 0.6, 1.2]
        break
      case 'footR':
        g.push(xform(paint(rbox(1.7, 1.1, 2.1, 0.3), c), [1.6, 0.55, 0.1]))
        g.push(xform(paint(rbox(0.2, 0.9, 1.3, 0.08), '#e6fbff'), [1.6, 1.4, 0]))
        g.push(xform(paint(rcyl(0.5, 2.6, 0.1), dark), [1.6, 2.4, 0]))
        w = [1.6, 0.6, 1.2]
        break
      case 'body': {
        g.push(xform(paint(rbox(4.2, 3.2, 2.5, 0.4), c), [0, 5.1, 0]))
        g.push(xform(paint(rbox(3.2, 1.0, 2.2, 0.3), dark), [0, 3.4, 0]))
        // Shoulders: Volt's and Magnet's; wings: Gale's fan and Rotor's blades.
        g.push(xform(paint(rbox(1.5, 1.0, 1.6, 0.35), MASTER_COLOR.voltMaster), [-2.5, 6.5, 0]))
        g.push(xform(paint(rcone(0.25, 0.02, 0.9), '#fff6a0'), [-2.6, 7.3, 0]))
        g.push(xform(paint(rbox(1.5, 1.0, 1.6, 0.35), MASTER_COLOR.magnetMaster), [2.5, 6.5, 0]))
        g.push(xform(paint(torus(0.45, 0.14, 6, 16, Math.PI), '#ff4f4f'), [2.5, 7.1, 0], [0, 0, 0]))
        g.push(xform(paint(torus(1.0, 0.1, 6, 24), MASTER_COLOR.galeMaster), [-1.3, 6.2, -1.5]))
        g.push(xform(paint(rbox(2.6, 0.1, 0.4, 0.05), MASTER_COLOR.rotorMaster), [1.3, 6.9, -1.5]))
        g.push(xform(paint(rbox(0.4, 0.1, 2.6, 0.05), MASTER_COLOR.rotorMaster), [1.3, 6.9, -1.5]))
        g.push(xform(paint(sph(0.75, 16, 12), '#ffb04a'), [0, 5.1, 1.25]))
        w = [0, 5.1, 1.35]
        r = 1.0
        break
      }
      case 'armL':
        g.push(xform(paint(rcyl(0.45, 2.4, 0.1), dark), [-3.1, 5.4, 0], [0, 0, 0.5]))
        g.push(xform(paint(rcyl(0.7, 2.0, 0.15), c), [-3.4, 4.2, 0.6], [Math.PI / 2, 0, 0]))
        g.push(xform(paint(rcone(0.3, 0.02, 0.8), '#ffd35a'), [-3.4, 5.0, 0.4]))
        w = [-3.4, 4.2, 1.6]
        break
      case 'armR':
        g.push(xform(paint(rcyl(0.45, 2.4, 0.1), dark), [3.1, 5.4, 0], [0, 0, -0.5]))
        g.push(xform(paint(rcone(0.6, 0.05, 2.4), c), [3.4, 4.2, 1.0], [Math.PI / 2, 0, 0]))
        g.push(xform(paint(rcone(0.25, 0.02, 0.8), '#ffffff'), [3.7, 4.8, 0.6]))
        w = [3.4, 4.2, 1.8]
        break
      case 'head': {
        g.push(xform(paint(rbox(1.7, 1.4, 1.5, 0.35), c), [0, 7.5, 0]))
        g.push(xform(paint(torus(0.9, 0.08, 6, 24), '#ff5fd0'), [0, 8.5, 0], [Math.PI / 2, 0, 0]))
        w = [0, 7.5, 0.85]
        r = 0.8
        break
      }
    }
    const root = new Group()
    root.add(this.toon(merge(g)))
    if (id === 'head') {
      // The visor: dark until the giant wakes.
      this.visor = new MeshBasicMaterial({ color: '#331020', toneMapped: false })
      const v = new Mesh(new BoxGeometry(1.3, 0.3, 0.1), this.visor)
      v.position.set(0, 7.6, 0.78)
      root.add(v)
    }
    this.root.add(root)
    const max = Math.round(vexMax * GM_HP_MUL * SHARES[id])
    return {
      id, master, root, wx: w[0], wy: w[1], wz: w[2], r, share: SHARES[id], hp: max, max,
      weakTo: BOSSES[master].weakTo, gone: false, fallT: -1, flash: 0, home: [0, 0, 0]
    }
  }

  // ─── The state ─────────────────────────────────────────────────────────────

  /** Vex fell (at `x, z`): the button, the rumble, the assembly. */
  start(x: number, z: number): void {
    if (this.state !== 'dormant') return
    this.state = 'intro'
    this.t = 0
    this.button.position.set(x, 0, z)
    this.host.propParent(x, z).add(this.button)
    hud.cineSkip = false
  }

  /** The giant stands, and the fight is on (an intro skipped or played out,
   *  or a retry's). */
  private wake(retry: boolean): void {
    this.root.visible = true
    for (const p of this.parts) {
      p.root.position.set(0, 0, 0)
      p.root.visible = !p.gone
    }
    if (this.visor) this.visor.color.set('#ff5fd0')
    this.button.visible = false
    hud.cineSkip = false
    hud.bossName = 'boss.grandMaster'
    hud.bossMarks = this.marks()
    this.syncBar()
    this.phase = this.currentPhase()
    this.state = 'fight'
    this.t = 0
    if (!retry) {
      showBanner('grandMaster')
      this.host.sfx('bossIntro')
      this.host.keepRetryPoint()
    }
    this.host.say(`hint.gm.${PHASE_LINE[this.phase]}`)
  }

  private currentPhase(): number {
    for (let n = 0; n < GM_PHASES.length; n++) {
      if (GM_PHASES[n]!.some(id => !this.part(id).gone)) return n
    }
    return GM_PHASES.length
  }

  part(id: PartId): Part {
    return this.parts.find(p => p.id === id)!
  }

  /** The boss bar's marks: where each phase's share ends. */
  private marks(): number[] {
    const total = this.parts.reduce((a, p) => a + p.max, 0)
    let left = total
    const out: number[] = []
    for (const set of GM_PHASES.slice(0, -1)) {
      for (const id of set) left -= this.part(id).max
      out.push(left / total)
    }
    return out
  }

  private syncBar(): void {
    const total = this.parts.reduce((a, p) => a + p.max, 0)
    const left = this.parts.reduce((a, p) => a + Math.max(0, p.hp), 0)
    hud.bossHp01 = left / total
  }

  /** The intro holds the stick (the fight leaves it free). */
  locksMove(): boolean {
    return this.state === 'intro' && this.t >= T_JUMP
  }

  /** Blocks the exit until it has fallen. */
  get blocking(): boolean {
    return this.state === 'intro' || this.state === 'fight' || this.state === 'dying'
  }

  // ─── Each step ─────────────────────────────────────────────────────────────

  update(dt: number, _time: number, p: ClimbBody, playing: boolean): void {
    this.drops.update(dt, p, playing)
    for (const part of this.parts) this.stepFall(part, dt)
    if (this.state === 'intro') this.stepIntro(dt)
    else if (this.state === 'fight' && playing) this.stepFight(dt)
    else if (this.state === 'dying') this.stepDeath(dt)
  }

  private stepIntro(dt: number): void {
    const h = this.host
    const before = this.t
    this.t += dt
    const t = this.t
    const passed = (at: number) => before < at && t >= at
    // Skippable once the button is pressed (the fight starts as assembled).
    if (t > T_RUMBLE && t < T_ASSEMBLE + DROP_EVERY * ORDER.length && h.pressed()) {
      if (t < T_JUMP) this.jump()
      this.wake(false)
      return
    }
    if (t > T_RUMBLE) hud.cineSkip = true
    if (passed(T_BUTTON)) {
      this.button.visible = true
      h.sfx('alert', this.button.position.x, this.button.position.z)
      h.say('hint.gm.button')
    }
    if (t >= T_RUMBLE && t < T_BLACK) {
      h.shake(0.12)
      const beat = Math.floor((t - T_RUMBLE) / 0.7)
      if (beat !== this.lastBeat) {
        this.lastBeat = beat
        h.sfx(beat % 2 ? 'door' : 'stomp')
      }
    }
    if (t >= T_BLACK && t <= T_JUMP + 0.5) {
      const k = t < T_JUMP ? (t - T_BLACK) / (T_JUMP - T_BLACK) : 1 - (t - T_JUMP) / 0.5
      pushHud({ t: 'flash', color: '#000000', strength: Math.min(1, 0.3 + k) })
    }
    if (passed(T_JUMP)) this.jump()
    if (t >= T_JUMP) this.faceGiant(dt)
    // The assembly: one part every DROP_EVERY, falling DROP_S out of the sky.
    if (t >= T_ASSEMBLE) {
      this.root.visible = true
      ORDER.forEach((id, n) => {
        const part = this.part(id)
        const t0 = T_ASSEMBLE + n * DROP_EVERY
        const k = Math.min(1, Math.max(0, (t - t0) / DROP_S))
        part.root.visible = t >= t0
        part.root.position.y = 30 * (1 - k * k)
        if (passed(t0 + DROP_S)) {
          h.sfx('stomp', this.x, this.z)
          h.sfx('deckLand', this.x, this.z)
          h.shake(0.35)
          h.fx.sparks(this.x + part.wx, part.wy, this.z + 0.5, MASTER_COLOR[part.master], 16, 6, 0.2)
        }
      })
    }
    if (t >= T_ASSEMBLE + DROP_EVERY * ORDER.length + 0.4) this.wake(false)
  }

  /** The fall to the roof: Flux on its south side, facing the giant. */
  private jump(): void {
    const p = this.host.player
    const r = this.roof
    p.x = p.px = (r.x0 + r.w / 2) * CELL
    p.z = p.pz = (r.z0 + r.h - 1.2) * CELL
    p.y = p.py = p.safeY = 0
    p.vx = p.vz = p.vy = 0
    p.yaw = 0
    this.button.visible = false
  }

  private faceGiant(dt: number): void {
    const p = this.host.player
    if (p.pitch !== undefined) p.pitch += (0.32 - p.pitch) * Math.min(1, dt * 3)
  }

  private stepFight(dt: number): void {
    const h = this.host
    const p = h.player
    this.t += dt
    // Atlas's mark on the weak spot to hit (the nearest live one of the set).
    const set = GM_PHASES[this.phase] ?? []
    const target = set.map(id => this.part(id)).filter(q => !q.gone)
      .sort((a, b) => Math.hypot(a.wx - (p.x - this.x), a.wz) - Math.hypot(b.wx - (p.x - this.x), b.wz))[0]
    if (target) {
      this.marker.visible = true
      this.marker.position.set(target.wx, target.wy, target.wz + 0.1)
      this.marker.scale.setScalar(target.r * (1.2 + 0.15 * Math.sin(this.t * 6)))
      ;(this.marker.material as MeshBasicMaterial).color.set(MASTER_COLOR[target.master])
    }
    for (const part of this.parts) {
      if (part.flash > 0) {
        part.flash = Math.max(0, part.flash - dt * 5)
        part.root.scale.setScalar(1 + part.flash * 0.04)
      }
    }
    // Its idle: a slow sway.
    this.root.rotation.y = Math.sin(this.t * 0.7) * 0.08
    if (this.sweepT >= 0) this.stepSweep(dt)
    if (this.chargeT >= 0) this.stepCharge(dt)
    const dmg = this.host.dmg
    switch (this.phase) {
      case 0: this.armsAttack(dt, dmg); break
      case 1: this.stompAttack(dt, dmg); break
      case 2: this.laserAttack(dt, dmg); break
      case 3: this.bodyAttack(dt, dmg); break
    }
    if (this.phase >= 2 && this.sweepT < 0 && this.chargeT < 0) {
      this.prismT -= dt
      if (this.prismT <= 0) {
        this.prismT = PRISM_EVERY
        this.chargeT = 0
        this.prism.visible = true
        h.sfx('bossWarn', this.x, this.z)
        h.say('hint.gm.prism')
      }
    }
  }

  /** From a part's muzzle (world), aimed at Flux's chest. */
  private fire(lx: number, ly: number, lz: number, speed: number, dmg: number, spread = 0): void {
    const h = this.host
    const p = h.player
    const x = this.x + lx
    const z = this.z + lz
    ly += this.root.position.y
    const dx = p.x - x
    const dz = p.z - z
    const a = Math.atan2(dx, dz) + spread
    h.fireEnemyShot(h.vex, x, ly, z, Math.sin(a), (p.y + 1.2 - ly) / Math.max(1, Math.hypot(dx, dz)), Math.cos(a), speed, dmg, true)
  }

  private armsAttack(dt: number, dmg: number): void {
    this.armT -= dt
    if (this.armT > 0) return
    this.armT = ARM_EVERY
    const left = this.part('armL')
    const right = this.part('armR')
    const useLeft = !left.gone && (right.gone || this.armTurn++ % 2 === 0)
    if (useLeft) {
      // Blaze's cannon: a fan of three fireballs.
      for (const s of [-0.22, 0, 0.22]) this.fire(left.wx, left.wy, left.wz, 9, Math.round(dmg * 0.7), s)
      this.host.sfx('flameJet', this.x + left.wx, this.z)
    } else if (!right.gone) {
      // Frost's lance: one fast spike, then another.
      this.fire(right.wx, right.wy, right.wz, 16, Math.round(dmg * 0.9))
      this.host.sfx('enemyShot', this.x + right.wx, this.z)
    }
  }

  private stompAttack(dt: number, dmg: number): void {
    this.stompT -= dt
    if (this.stompT > 0) return
    this.stompT = STOMP_EVERY
    const h = this.host
    const p = h.player
    for (const id of ['footL', 'footR'] as const) {
      const f = this.part(id)
      if (f.gone) continue
      const x = this.x + f.wx
      const z = this.z + f.wz
      h.spawnWave(h.vex, x, z, p.x - x, p.z - z, 7, 1.2, 22, Math.round(dmg * 1.1), MASTER_COLOR[f.master])
    }
    h.sfx('stomp', this.x, this.z)
    h.shake(0.3)
  }

  private laserAttack(dt: number, _dmg: number): void {
    if (this.sweepT >= 0 || this.chargeT >= 0) return
    this.laserT -= dt
    if (this.laserT > 0) return
    this.laserT = LASER_EVERY
    this.startSweep('laser')
  }

  private bodyAttack(dt: number, dmg: number): void {
    if (this.sweepT >= 0 || this.chargeT >= 0) return
    this.bodyT -= dt
    if (this.bodyT > 0) return
    this.bodyT = BODY_EVERY
    const h = this.host
    const p = h.player
    const pick = ALL_MASTERS[Math.floor(Math.random() * ALL_MASTERS.length)]!
    const color = MASTER_COLOR[pick]
    switch (pick) {
      case 'blazeMaster':
        for (const s of [-0.3, -0.1, 0.1, 0.3]) this.fire(0, 5.1, 1.4, 9, Math.round(dmg * 0.6), s)
        break
      case 'frostMaster':
      case 'neonMaster':
        this.fire(0, 5.1, 1.4, 17, Math.round(dmg * 0.8))
        break
      case 'voltMaster':
      case 'drillMaster':
        h.spawnWave(h.vex, this.x, this.z + 1.5, p.x - this.x, p.z - this.z, 7.5, 1.4, 22, dmg, color)
        break
      case 'scrapper':
      case 'tideMaster':
        // Scrap (or water) from the sky: three rings round Flux.
        for (let k = 0; k < 3; k++) {
          const a = Math.random() * Math.PI * 2
          const d = 0.5 + Math.random() * 2.2
          this.drops.drop({ x: p.x + Math.cos(a) * d, z: p.z + Math.sin(a) * d, y: p.y, warn: 1.1, fall: 0.25, height: 0, reach: 1, cost: 0.07, sound: k ? undefined : 'alert', color })
        }
        break
      case 'magnetMaster':
        h.pull(this.x, this.z + 2, 2.4, 1.4)
        h.sfx('locate', this.x, this.z)
        break
      case 'galeMaster':
        h.pull(this.x, this.z + 2, -3.2, 1.2)
        h.sfx('gust', this.x, this.z)
        break
      case 'rotorMaster':
        for (const s of [-0.5, 0.5]) this.fire(s * 4, 6.9, -1, 8, Math.round(dmg * 0.6), s * 0.4)
        break
    }
  }

  private startSweep(kind: 'laser' | 'prism'): void {
    const p = this.host.player
    this.sweepKind = kind
    this.sweepT = 0
    this.sweepHit = false
    const toFlux = Math.atan2(p.x - this.x, p.z - this.z)
    this.sweepDir = Math.random() < 0.5 ? 1 : -1
    // It starts off to one side of Flux and sweeps through him.
    this.sweepYaw = toFlux - this.sweepDir * 0.6
    const m = this.beam.material as MeshBasicMaterial
    m.color.set(kind === 'prism' ? '#ffffff' : MASTER_COLOR.neonMaster)
    this.beam.scale.set(kind === 'prism' ? 4 : 1, kind === 'prism' ? 4 : 1, 1)
    if (kind === 'laser') this.host.sfx('bossWarn', this.x, this.z)
  }

  private stepSweep(dt: number): void {
    const h = this.host
    const p = h.player
    this.sweepT += dt
    const tell = this.sweepKind === 'laser' ? LASER_TELL : 0
    const fromY = this.sweepKind === 'laser' ? 7.6 : 5.1
    if (this.sweepT < tell) {
      // The head glows before it fires.
      if (this.visor) this.visor.color.set(Math.floor(this.sweepT * 8) % 2 ? '#ffffff' : '#ff5fd0')
      return
    }
    const k = (this.sweepT - tell) / LASER_SWEEP
    if (k > 1) {
      this.sweepT = -1
      this.beam.visible = false
      if (this.visor) this.visor.color.set('#ff5fd0')
      return
    }
    const yaw = this.sweepYaw + this.sweepDir * 1.2 * k
    this.beam.visible = true
    // Down from the head (or chest) to Flux's chest height at the room's far side.
    const len = 15
    const dropY = fromY - 1.2
    this.beam.position.set(Math.sin(yaw) * len / 2, fromY - dropY / 2, 0.8 + Math.cos(yaw) * len / 2)
    this.beam.rotation.set(Math.atan2(dropY, len), yaw, 0)
    if (this.sweepKind === 'prism') (this.beam.material as MeshBasicMaterial).color.set(MASTER_COLOR[ALL_MASTERS[Math.floor(this.sweepT * 2.5) % ALL_MASTERS.length]!])
    if (this.sweepHit) return
    const toFlux = Math.atan2(p.x - this.x, p.z - this.z)
    let d = toFlux - yaw
    d = Math.atan2(Math.sin(d), Math.cos(d))
    const width = this.sweepKind === 'prism' ? 0.16 : 0.06
    if (Math.abs(d) < width && p.y < 1.5) {
      this.sweepHit = true
      const dmg = Math.round(this.host.dmg * (this.sweepKind === 'prism' ? 1.8 : 1.2))
      h.hitPlayer(h.vex, dmg, { blockable: true, fromX: this.x, fromZ: this.z, kind: 'shot' })
    }
  }

  private stepCharge(dt: number): void {
    this.chargeT += dt
    // Ten colours round the chest, changing 2.5 times a second.
    const c = MASTER_COLOR[ALL_MASTERS[Math.floor(this.chargeT * 2.5) % ALL_MASTERS.length]!]
    ;(this.prism.material as MeshBasicMaterial).color.set(c)
    this.prism.scale.setScalar(0.6 + this.chargeT / PRISM_CHARGE)
    if (this.chargeT >= PRISM_CHARGE) {
      this.chargeT = -1
      this.prism.visible = false
      this.startSweep('prism')
      this.host.sfx('chargeShotBig', this.x, this.z)
    }
  }

  // ─── Hits ──────────────────────────────────────────────────────────────────

  /** A player shot meets the giant: the live part takes it, the others ring. */
  shot(s: Shot): boolean {
    if (s.owner !== 'player' || (this.state !== 'fight' && this.state !== 'intro')) return false
    if (this.state === 'intro' && !this.root.visible) return false
    for (const part of this.parts) {
      if (part.gone || !part.root.visible) continue
      const wx = this.x + part.wx
      const wz = this.z + part.wz
      // (It sinks once its feet are gone: the parts with it.)
      const d = Math.hypot(s.x - wx, s.y - (part.wy + this.root.position.y), s.z - wz)
      const outer = part.r * 1.9 + s.radius
      if (d > outer) continue
      const live = this.state === 'fight' && (GM_PHASES[this.phase] ?? []).includes(part.id)
      if (!live) {
        this.host.fx.sparks(s.x, s.y, s.z, '#ffffff', 6, 4, 0.14)
        pushHud({ t: 'text', x: s.x, y: s.y + 0.3, z: s.z, key: 'combat.tink', color: '#dfe7ff' })
        this.host.sfx('tink', s.x, s.z)
        return true
      }
      const weakSpot = d <= part.r + s.radius
      const weak = !!s.weapon && s.kind === 'special' && s.weapon === part.weakTo
      const dmg = Math.max(1, Math.round(s.dmg * (weakSpot ? WEAK_SPOT_MUL : 1) * (weak ? WEAKNESS_MUL : 1)))
      this.hit(part, dmg, s, weak || weakSpot)
      return true
    }
    return false
  }

  private hit(part: Part, dmg: number, s: Shot, strong: boolean): void {
    const h = this.host
    part.hp -= dmg
    part.flash = 1
    pushHud({ t: 'damage', x: s.x, y: s.y + 0.2, z: s.z, amount: dmg, crit: s.crit, weak: strong, toPlayer: false })
    h.fx.sparks(s.x, s.y, s.z, MASTER_COLOR[part.master], 8, 5, 0.16)
    h.sfx(strong ? 'hitHeavy' : 'hit', s.x, s.z)
    this.syncBar()
    if (part.hp <= 0) this.breakPart(part)
  }

  private breakPart(part: Part): void {
    const h = this.host
    part.hp = 0
    part.gone = true
    part.fallT = 0
    h.fx.orbBurst(this.x + part.wx, part.wy, this.z + part.wz, MASTER_COLOR[part.master], 2)
    h.sfx('explode', this.x + part.wx, this.z)
    h.shake(0.5)
    const next = this.currentPhase()
    if (next >= GM_PHASES.length) {
      this.state = 'dying'
      this.t = 0
      this.marker.visible = false
      this.beam.visible = false
      this.prism.visible = false
      this.sweepT = -1
      this.chargeT = -1
      return
    }
    if (next !== this.phase) {
      this.phase = next
      this.sweepT = -1
      this.chargeT = -1
      this.beam.visible = false
      this.prism.visible = false
      h.say(`hint.gm.${PHASE_LINE[next]}`)
      // The body crashes down a little once the feet are gone: the head is in reach.
      if (next === 2) this.root.position.y = -1.6
    }
  }

  private stepFall(part: Part, dt: number): void {
    if (part.fallT < 0) return
    part.fallT += dt
    const k = part.fallT
    part.root.position.y = -4.9 * k * k
    part.root.rotation.z = (part.wx >= 0 ? -1 : 1) * k * 1.4
    if (k > 1.3) {
      part.root.visible = false
      part.fallT = -1
    }
  }

  private stepDeath(dt: number): void {
    const h = this.host
    const before = this.t
    this.t += dt
    // Chain explosions round the wreck, a flash every third of a second at most.
    if (Math.floor(this.t * 5) !== Math.floor(before * 5)) {
      const part = this.parts[Math.floor(Math.random() * this.parts.length)]!
      h.fx.orbBurst(this.x + part.wx + (Math.random() - 0.5) * 2, part.wy + Math.random(), this.z + part.wz, MASTER_COLOR[part.master], 1.6)
      h.sfx('explode', this.x, this.z)
      h.shake(0.3)
    }
    if (Math.floor(this.t * 3) !== Math.floor(before * 3)) pushHud({ t: 'flash', color: '#ffffff', strength: 0.35 })
    if (this.t >= DEATH_S) {
      this.state = 'done'
      this.root.visible = false
      hud.bossName = ''
      hud.bossMarks = []
      showBanner('bossDown')
      h.onDefeated()
    }
  }

  // ─── The save (the climb's feature slot) ───────────────────────────────────

  save(): unknown {
    if (this.state === 'dormant') return null
    return { s: this.state === 'done' || this.state === 'dying' ? 'done' : 'fight', hp: this.parts.map(p => Math.round(p.hp)) }
  }

  restore(s: unknown): void {
    const o = s as { s?: string; hp?: unknown } | null
    if (!o || typeof o !== 'object') return
    if (Array.isArray(o.hp)) {
      o.hp.forEach((v, i) => {
        const p = this.parts[i]
        if (!p || typeof v !== 'number') return
        p.hp = Math.max(0, Math.min(p.max, v))
        p.gone = p.hp <= 0
      })
    }
    if (o.s === 'done') {
      this.state = 'done'
      this.root.visible = false
      return
    }
    // Back to the fight as it stood: no intro, no second banner.
    if (this.currentPhase() >= 2) this.root.position.y = -1.6
    this.wake(true)
  }

  dispose(): void {
    this.drops.clear()
    this.root.removeFromParent()
    this.button.removeFromParent()
  }
}

/** Atlas's line as each phase begins. */
const PHASE_LINE = ['arms', 'feet', 'head', 'body'] as const

/** Test seam: the giant's colours, phase by phase. */
export const __gmColor = (id: PartId): Color => new Color(MASTER_COLOR[PART_OF[id]])
