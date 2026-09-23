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
  /** Melee / AoE / contact damage from an enemy to the player. */
  hitPlayer(e: Enemy | null, dmg: number, opts: { blockable: boolean; fromX: number; fromZ: number; kind: 'melee' | 'aoe' | 'shot' }): 'hit' | 'block' | 'parry' | 'miss'
  shake(amount: number): void
  sfx(name: string, x?: number, z?: number): void
}
