import type { Group, Mesh, Sprite } from 'three'
import type { Rig } from '../models/kit'
import type { EnemyKind } from '../models/enemies'
import type { EnemyDef, Element } from '../data/enemies'
import type { Nav } from '../world/nav'
import type { MapData } from '../world/levelGen'
import type { Particles } from '../fx/particles'
import type { FloorMarkers, ShockRings } from '../fx/markers'

/**
 * Shared shapes for the mission sim. Kept free of three.js VALUES (types only)
 * so the pure logic modules stay unit-testable.
 */

export type EnemyState = 'idle' | 'alert' | 'engage' | 'tele' | 'act' | 'recover' | 'stun' | 'dead'

export interface Enemy {
  id: number
  kind: EnemyKind
  def: EnemyDef
  level: number
  elite: boolean
  boss: boolean
  element: Element
  /** i18n key of the display name. */
  nameKey: string
  x: number
  z: number
  y: number
  px: number
  pz: number
  py: number
  yaw: number
  vx: number
  vz: number
  hp: number
  maxHp: number
  dmg: number
  room: number
  awake: boolean
  /** A lesson's machine: stays asleep whatever it sees until it is hurt. */
  hold?: boolean
  /** A boss before its entrance: not in the arena yet, so it is not drawn,
   *  hit, aimed at, woken or bumped into. Its intro drops it in. */
  offstage?: boolean
  state: EnemyState
  st: number
  cd: number
  /** Current attack id (kind-specific). */
  attack: string
  step: number
  teleDur: number
  teleRed: boolean
  /** 0..1: how "shut" the defence is (hardhat helmet down, trooper shield up). */
  guard: number
  aim: number
  stunT: number
  flash: number
  path: Array<[number, number]> | null
  pathT: number
  walk: number
  anim: number
  /** Scratch slots for per-kind state. */
  a: number
  b: number
  tx: number
  tz: number
  sx: number
  sz: number
  hitPlayer: boolean
  rig: Rig
  root: Group
  shadow: Mesh
  ring: Sprite
  deathT: number
  /** Guard broken by a full charge: defence is down until this counts out. */
  guardBreakT: number
  /** Last time this enemy took damage (for the floating HP bar). */
  hurtAt: number
  /** Boss-only: which Core Master, whether phase 2 has begun. */
  bossId: import('../models/bosses').BossId | null
  phase2: boolean
  /** Status effects from special weapons. */
  burnT: number
  burnDps: number
  frozenT: number
  /** Id of the special weapon that last hit (weapon XP on kill). */
  lastWeapon: string
}

export type ShotKind = 'pellet' | 'charge1' | 'charge2' | 'charge3' | 'enemy' | 'shell' | 'reflect' | 'special'

export interface Shot {
  active: boolean
  owner: 'player' | 'enemy'
  kind: ShotKind
  x: number
  y: number
  z: number
  px: number
  py: number
  pz: number
  vx: number
  vy: number
  vz: number
  dmg: number
  crit: boolean
  radius: number
  life: number
  pierce: number
  hitIds: number[]
  homing: Enemy | null
  turn: number
  source: Enemy | null
  blockable: boolean
  /** Ballistic shells: start, target, time. */
  sx: number
  sy: number
  sz: number
  tx: number
  tz: number
  t: number
  dur: number
  color: string
  sprite: Sprite
  core: Mesh | null
  element: Element
  /** Special weapon id when kind === 'special'. */
  weapon: string
  /** Enemy orbs that steer toward the player and can be shot down. */
  homePlayer: boolean
  destructible: boolean
  /** Special-weapon payloads: burn (dps, s) / freeze (s) applied on hit. */
  burn: number
  freeze: number
}

export type PickupKind = 'bolt' | 'hp' | 'hpBig' | 'we' | 'weBig' | 'core'

export interface Pickup {
  active: boolean
  kind: PickupKind
  value: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  t: number
  root: Group
  magnet: boolean
}

export interface CombatPlayer {
  hp: number
  maxHp: number
  we: number
  maxWe: number
  power: number
  maxPower: number
  powerDelay: number
  charge: number
  charging: boolean
  fireCd: number
  blocking: boolean
  blockPressedAt: number
  guardBroken: number
  slideT: number
  slideCd: number
  slideDX: number
  slideDZ: number
  iframes: number
  hurtT: number
  target: Enemy | null
  recoil: number
  dead: boolean
  lastStandUsed: boolean
}

export interface World {
  map: MapData
  nav: Nav
  time: number
  player: { x: number; z: number; yaw: number; pitch: number }
  combat: CombatPlayer
  enemies: Enemy[]
  fx: Particles
  markers: FloorMarkers
  shocks: ShockRings
  fireEnemyShot(e: Enemy, x: number, y: number, z: number, dx: number, dy: number, dz: number, speed: number, dmg: number, blockable: boolean): void
  lobShell(e: Enemy, tx: number, tz: number, dur: number, dmg: number): void
  /** Boss hazards (see CombatSystem). */
  spawnWave(e: Enemy, x: number, z: number, dx: number, dz: number, speed: number, halfWidth: number, range: number, dmg: number, color: string): void
  spawnRing(e: Enemy, x: number, z: number, speed: number, maxR: number, dmg: number, color: string): void
  fireOrb(e: Enemy, x: number, y: number, z: number, speed: number, dmg: number): void
  /** Melee / AoE / contact damage from an enemy to the player. */
  hitPlayer(e: Enemy | null, dmg: number, opts: { blockable: boolean; fromX: number; fromZ: number; kind: 'melee' | 'aoe' | 'shot' }): 'hit' | 'block' | 'parry' | 'miss'
  shake(amount: number): void
  sfx(name: string, x?: number, z?: number): void
}
