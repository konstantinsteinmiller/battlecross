import {
  Scene, PerspectiveCamera, Fog, HemisphereLight, DirectionalLight, Color, Vector3, Raycaster, Vector2,
  Mesh, RingGeometry, MeshBasicMaterial, AdditiveBlending, DoubleSide, Group, AmbientLight
} from 'three'
import type { GameMode } from '../engine/app'
import { getRenderer } from '../engine/renderer'
import type { Input } from '../engine/input'
import { consumeEdges } from '../engine/input'
import { generateMap, type MapData, CELL, WALL_H } from '../world/levelGen'
import { createNav, moveCircle, findPath, smoothPath, isSolidAt, hasLineOfSight, type Nav, type Slab } from '../world/nav'
import { buildLevel, doorFramePos, type LevelMeshes } from '../world/levelMesh'
import { THEMES, type Theme, type SectorId } from '../world/themes'
import { buildDoor, buildTeleporter, type DoorMesh, type PadMesh } from '../models/props'
import { buildViewmodel, type Viewmodel } from '../models/hero'
import { PAL, RARITY_COLOR as RARITY_HEX } from '../models/palette'
import {
  EYE_H, PLAYER_R, WALK_SPEED, ACCEL, PATH_SPEED, LOOK_TOUCH, LOOK_MOUSE, PITCH_MIN, PITCH_MAX,
  DOOR_OPEN_DIST, DOOR_OPEN_SPEED, BEAM_IN_TIME
} from './constants'
import { hud, tickHud, pushHud } from '../state/hud'
import type { CombatPlayer, Enemy, PickupKind } from './world'
import { CombatSystem, type CombatHost } from './combat'
import { updateEnemy, syncEnemyVisual, PARRY_WINDOW, wake } from './enemies'
import { spawnEncounters, type EncounterTable } from './spawn'
import { baseStats, chargeInfo, type PlayerStats } from './stats'
import { Particles } from '../fx/particles'
import { FloorMarkers, ShockRings } from '../fx/markers'
import { sfx } from '../audio/sfx'
import { setMusicTrack } from '@/use/useSound'
import { Tips } from './tips'
import { chargeHum } from '../audio/synth'
import type { Quest } from '../data/quests'
import { SECTOR_BY_ID } from '../data/regions'
import { MissionObjects, type Chest, type Crate, type Core, type ObjectiveHost } from './objectives'
import {
  profile, grantXp, saveProfile, computeStats, writeSnapshot, xp01, heroColors, type MissionSnapshot
} from '../state/profile'
import { rollItem, type Item } from '../data/items'
import { flow, finishMission } from '../flow'
import { BEAM_OUT_TIME } from './constants'
import { updateBoss, syncBossVisual, startBossIntro, BOSS_INTRO_T, bossRoomOf } from './bosses'
import { WeaponSystem } from './weapons'
import { WEAPONS, type WeaponId } from '../data/weapons'
import type { Room } from '../world/levelGen'

export interface MissionSetup {
  sector: SectorId
  seed: number
  rooms: number
  boss: boolean
  enemyLevel: number
  encounters: EncounterTable
  stats?: PlayerStats
  /** First mission: gentle first room, softer damage until the mini-boss. */
  tutorial?: boolean
  lookSens?: number
  quest?: Quest
  snapshot?: MissionSnapshot | null
}

/** Build a mission setup from a quest (sector theme, enemy table, level). */
export const setupFromQuest = (quest: Quest, snapshot: MissionSnapshot | null): MissionSetup => {
  const sector = SECTOR_BY_ID[quest.sector]
  return {
    sector: quest.sector,
    seed: quest.seed,
    rooms: quest.rooms,
    boss: quest.template === 'boss' || quest.template === 'tutorial',
    enemyLevel: quest.level,
    encounters: sector.encounters,
    stats: computeStats(),
    tutorial: quest.template === 'tutorial',
    quest,
    snapshot
  }
}

interface DoorState {
  id: number
  mesh: DoorMesh
  open: number
  opening: boolean
  closing: boolean
  locked: boolean
  slab: Slab
  x: number
  z: number
  axis: 'x' | 'z'
  cellI: number
  cellJ: number
  to: number
}

export interface PlayerState {
  x: number
  z: number
  px: number
  pz: number
  vx: number
  vz: number
  yaw: number
  pitch: number
  path: Array<[number, number]> | null
  bob: number
  bobAmp: number
}

const _v2 = new Vector2()
const _v3 = new Vector3()

const angDiff = (a: number, b: number): number => {
  let d = a - b
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

export class Mission implements GameMode, CombatHost, ObjectiveHost {
  scene = new Scene()
  camera = new PerspectiveCamera(70, 1, 0.05, 260)
  vmScene = new Scene()
  vmCamera = new PerspectiveCamera(50, 1, 0.01, 10)
  map: MapData
  nav: Nav
  theme: Theme
  level: LevelMeshes
  doors: DoorState[] = []
  pad: PadMesh
  vm: Viewmodel
  player: PlayerState
  input: Input
  setup: MissionSetup
  stats: PlayerStats
  combat: CombatPlayer
  enemies: Enemy[] = []
  fx: Particles
  markers = new FloorMarkers()
  shocks = new ShockRings()
  system: CombatSystem
  time = 0
  phaseT = 0
  hitStop = 0
  bolts = 0
  xp = 0
  kills = 0
  chestsOpened = 0
  itemsFound: Item[] = []
  objects: MissionObjects
  quest: Quest | null
  private snapT = 0
  private dirty = false
  private interact: ReturnType<MissionObjects['nearestInteractable']> | { kind: 'door'; ref: DoorState } | null = null
  private finished = false
  weapons: WeaponSystem
  private bossRoom: Room | null = null
  private boss: Enemy | null = null
  private bossStarted = false
  private bossBarT = 0
  private vmFlash = 0
  private vmFlashColor = '#ffffff'
  private tips = new Tips(true)
  private raycaster = new Raycaster()
  private marker: Mesh
  private markerT = 0
  private shakeAmt = 0
  private lookSens: number
  private vmRoot = new Group()
  private hudT = 0
  private aimCandidate = false
  private targetLostT = 0
  private respawnT = 0
  private deathT = 0
  private combatEndT = 0
  /** DEV: override the camera ([x,y,z, lookX,lookY,lookZ]) for inspection. */
  debugCam: [number, number, number, number, number, number] | null = null

  constructor(setup: MissionSetup, input: Input) {
    this.setup = setup
    this.input = input
    this.lookSens = setup.lookSens ?? 1
    this.stats = setup.stats ?? baseStats()
    const s = this.stats
    this.combat = {
      hp: s.maxHp, maxHp: s.maxHp, we: s.maxWe, maxWe: s.maxWe, power: s.maxPower, maxPower: s.maxPower,
      powerDelay: 0, charge: 0, charging: false, fireCd: 0, blocking: false, blockPressedAt: -10, guardBroken: 0,
      slideT: 0, slideCd: 0, slideDX: 0, slideDZ: 0, iframes: 0, hurtT: 0, target: null, recoil: 0, dead: false,
      lastStandUsed: false
    }
    this.theme = THEMES[setup.sector]
    this.map = generateMap({ seed: setup.seed, rooms: setup.rooms, boss: setup.boss })
    this.nav = createNav(this.map)
    this.level = buildLevel(this.map, this.theme)
    this.scene.add(this.level.root)
    this.scene.add(this.level.sky)

    const th = this.theme
    this.scene.background = new Color(th.skyBottom)
    this.scene.fog = new Fog(new Color(th.fog), th.fogNear, th.fogFar)
    const hemi = new HemisphereLight(new Color(th.hemiSky), new Color(th.hemiGround), 1.05)
    const sun = new DirectionalLight(new Color(th.sun), th.sunIntensity)
    sun.position.set(0.45, 1, 0.3)
    this.scene.add(hemi, sun)

    for (const d of this.map.doors) {
      const mesh = buildDoor(th, d.boss)
      const [fx, fz] = doorFramePos(d)
      mesh.root.position.set(fx, 0, fz)
      mesh.root.rotation.y = d.axis === 'x' ? Math.PI / 2 : 0
      this.scene.add(mesh.root)
      const half = CELL / 2
      const thin = 0.22
      const slab: Slab = d.axis === 'x'
        ? { minX: fx - thin, maxX: fx + thin, minZ: fz - half, maxZ: fz + half, active: true }
        : { minX: fx - half, maxX: fx + half, minZ: fz - thin, maxZ: fz + thin, active: true }
      this.nav.slabs.push(slab)
      this.nav.pathBlock[d.j * this.map.w + d.i] = d.boss ? 2 : 1
      this.doors.push({
        id: d.id, mesh, open: 0, opening: false, closing: false, locked: d.boss, slab, x: fx, z: fz, axis: d.axis, cellI: d.i, cellJ: d.j, to: d.to
      })
    }

    this.pad = buildTeleporter(th)
    const [sx, sz] = [this.map.start.x, this.map.start.z]
    this.pad.root.position.set(sx, 0, sz)
    this.scene.add(this.pad.root)

    this.marker = new Mesh(
      new RingGeometry(0.34, 0.5, 32),
      new MeshBasicMaterial({ color: new Color(PAL.glowCyan), transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, toneMapped: false })
    )
    this.marker.rotation.x = -Math.PI / 2
    this.marker.position.y = 0.03
    this.scene.add(this.marker)

    this.player = {
      x: sx, z: sz, px: sx, pz: sz, vx: 0, vz: 0, yaw: this.map.start.yaw, pitch: -0.06,
      path: null, bob: 0, bobAmp: 0
    }

    // FX layers
    this.fx = new Particles(1000)
    this.scene.add(this.fx.points, this.markers.root, this.shocks.root)
    this.system = new CombatSystem(this)

    // Mission objects + objective, then the cast (deterministic order: the
    // resume snapshot refers to enemies by index).
    this.quest = setup.quest ?? null
    this.objects = new MissionObjects(this, setup.quest ?? {
      id: 'dev', kind: 'job', template: 'purge', sector: setup.sector, seed: setup.seed, level: setup.enemyLevel,
      target: null, count: 1, rooms: setup.rooms, reward: { xp: 0, bolts: 0, rarityBias: 0 }
    })
    this.enemies = spawnEncounters(this.map, setup.encounters, setup.enemyLevel, { firstRoomsGentle: setup.tutorial })
    this.objects.setupEnemyObjectives(this.enemies, (e) => this.enemies.push(e))
    for (const e of this.enemies) this.scene.add(e.root, e.shadow, e.ring)
    this.bossRoom = bossRoomOf(this.map.rooms)
    this.boss = this.enemies.find(e => e.boss) ?? null
    this.weapons = new WeaponSystem(this, profile.hero.weaponXp)
    this.scene.add(this.weapons.root)
    if (setup.snapshot) this.applySnapshot(setup.snapshot)

    // Viewmodel
    this.vm = buildViewmodel(heroColors())
    this.vmRoot.add(this.vm.root)
    this.vmScene.add(this.vmRoot)
    this.vmScene.add(new HemisphereLight(0xffffff, 0x445066, 1.2))
    const vmSun = new DirectionalLight(0xffffff, 1.1)
    vmSun.position.set(-0.4, 1, 0.6)
    this.vmScene.add(vmSun, new AmbientLight(0xffffff, 0.15))

    hud.phase = 'beamIn'
    this.phaseT = 0
    sfx('beamIn')
  }

  // ─── World interface ───────────────────────────────────────────────────────

  fireEnemyShot(e: Enemy, x: number, y: number, z: number, dx: number, dy: number, dz: number, speed: number, dmg: number, blockable: boolean): void {
    this.system.spawnEnemyShot(e, x, y, z, dx, dy, dz, speed, dmg, blockable)
  }

  lobShell(e: Enemy, tx: number, tz: number, dur: number, dmg: number): void {
    this.system.lobShell(e, tx, tz, dur, dmg)
  }

  spawnWave(e: Enemy, x: number, z: number, dx: number, dz: number, speed: number, halfWidth: number, range: number, dmg: number, color: string): void {
    this.system.spawnWave(e, x, z, dx, dz, speed, halfWidth, range, dmg, color)
  }

  spawnRing(e: Enemy, x: number, z: number, speed: number, maxR: number, dmg: number, color: string): void {
    this.system.spawnRing(e, x, z, speed, maxR, dmg, color)
  }

  fireOrb(e: Enemy, x: number, y: number, z: number, speed: number, dmg: number): void {
    this.system.fireOrb(e, x, y, z, speed, dmg)
  }

  shake(amount: number): void {
    this.shakeAmt = Math.min(1, this.shakeAmt + amount)
  }

  sfx(name: string, x?: number, z?: number): void {
    let pan = 0
    let gain = 1
    if (x !== undefined && z !== undefined) {
      const dx = x - this.player.x
      const dz = z - this.player.z
      const d = Math.hypot(dx, dz)
      const rx = Math.cos(this.player.yaw)
      const rz = -Math.sin(this.player.yaw)
      pan = d > 0.01 ? (dx * rx + dz * rz) / d : 0
      gain = Math.max(0.15, Math.min(1, 1.2 - d / 26))
    }
    sfx(name, pan * 0.7, gain)
  }

  hitPlayer(e: Enemy | null, dmg: number, o: { blockable: boolean; fromX: number; fromZ: number; kind: 'melee' | 'aoe' | 'shot' }): 'hit' | 'block' | 'parry' | 'miss' {
    const c = this.combat
    const p = this.player
    if (c.dead || hud.phase !== 'play') return 'miss'
    if (c.iframes > 0) return 'miss'
    const toSrc = Math.atan2(-(o.fromX - p.x), -(o.fromZ - p.z))
    const frontal = Math.abs(angDiff(toSrc, p.yaw)) < 1.35
    if (o.blockable && c.blocking && frontal && c.guardBroken <= 0) {
      if (this.time - c.blockPressedAt <= PARRY_WINDOW + this.stats.parryBonus) {
        // ── PARRY ──
        this.hitStop = Math.max(this.hitStop, 0.14)
        this.shake(0.25)
        pushHud({ t: 'flash', color: '#bff6ff', strength: 0.5 })
        pushHud({ t: 'text', x: p.x - Math.sin(p.yaw) * 1.4, y: EYE_H + 0.2, z: p.z - Math.cos(p.yaw) * 1.4, key: 'combat.parry', color: '#7ff4ff' })
        this.fx.sparks(p.x - Math.sin(p.yaw) * 0.8, EYE_H - 0.3, p.z - Math.cos(p.yaw) * 0.8, '#bff6ff', 18, 7, 0.2)
        sfx('parry')
        if (e && o.kind === 'melee') {
          e.state = 'stun'
          e.st = 0
          e.stunT = 1.6 + this.stats.parryStunBonus
          e.ring.visible = false
          e.flash = 1
        }
        c.iframes = Math.max(c.iframes, 0.2)
        return 'parry'
      }
      // ── BLOCK ──
      const taken = Math.max(1, Math.round(dmg * 0.25 * this.stats.blockDmgMul))
      c.power -= dmg * 0.45 * this.stats.blockCostMul
      c.powerDelay = 0.9
      c.hp -= taken
      this.fx.sparks(p.x - Math.sin(p.yaw) * 0.7, EYE_H - 0.3, p.z - Math.cos(p.yaw) * 0.7, '#7ff4ff', 8, 5)
      this.shake(0.1)
      sfx('block')
      pushHud({ t: 'damage', x: p.x - Math.sin(p.yaw) * 1.2, y: EYE_H - 0.1, z: p.z - Math.cos(p.yaw) * 1.2, amount: taken, crit: false, weak: false, toPlayer: true })
      if (this.stats.reflectPct > 0 && e) {
        this.system.damageEnemy(e, Math.round(dmg * this.stats.reflectPct), { crit: false, charge: 0, fromX: p.x, fromZ: p.z, x: e.x, y: e.y + e.def.aimY, z: e.z, color: '#7ff4ff' })
      }
      if (c.power <= 0) {
        c.power = 0
        c.guardBroken = 0.7
        c.blocking = false
        sfx('guardCrack')
        pushHud({ t: 'text', x: p.x - Math.sin(p.yaw) * 1.4, y: EYE_H + 0.1, z: p.z - Math.cos(p.yaw) * 1.4, key: 'combat.guardCracked', color: '#ff8a5a' })
      }
      this.checkDown()
      return 'block'
    }
    // ── HIT ──
    let taken = dmg * this.stats.damageTakenMul
    if (this.setup.tutorial) taken *= 0.6
    taken = Math.max(1, Math.round(taken))
    c.hp -= taken
    c.iframes = 0.8
    c.hurtT = 0.25
    this.shake(0.35)
    sfx('hurt')
    pushHud({ t: 'hurt', strength: Math.min(1, taken / (c.maxHp * 0.25)) })
    this.onPlayerHurt(taken)
    // Knock the player back a touch
    const kx = p.x - o.fromX
    const kz = p.z - o.fromZ
    const kl = Math.hypot(kx, kz) || 1
    p.vx += (kx / kl) * 4
    p.vz += (kz / kl) * 4
    this.checkDown()
    return 'hit'
  }

  private checkDown(): void {
    const c = this.combat
    if (c.hp > 0) return
    if (this.stats.lastStand && !c.lastStandUsed) {
      c.lastStandUsed = true
      c.hp = 1
      c.iframes = 1.5
      pushHud({ t: 'toast', key: 'combat.lastStand', color: '#ffd84a' })
      return
    }
    c.hp = 0
    this.onPlayerDown()
  }

  onEnemyKilled(e: Enemy, xp: number): void {
    this.xp += xp
    this.kills++
    profile.stats.kills++
    if (this.combat.target === e) this.combat.target = null
    if (e.lastWeapon) this.weapons.onKill(e.lastWeapon)
    if (e.boss) {
      // The shutter lifts again; the bar drains away with the boss.
      const d = this.bossDoor()
      if (d) {
        d.locked = false
        d.opening = true
        d.open = Math.min(d.open, 0.2)
        d.slab.active = true
      }
      pushHud({ t: 'toast', key: 'mission.bossDown', params: { boss: e.nameKey }, color: '#ffd84a' })
    }
    this.objects.onEnemyKilled(e)
    this.gainXp(xp)
    this.dirty = true
  }

  private bossDoor(): DoorState | null {
    if (!this.bossRoom) return null
    return this.doors.find(d => d.to === this.bossRoom!.id) ?? null
  }

  /** Crossing into the boss room: shutter slams, name card, bar fills, fight. */
  private startBoss(): void {
    const b = this.boss
    if (!b || this.bossStarted) return
    this.bossStarted = true
    startBossIntro(b)
    const d = this.bossDoor()
    if (d) {
      d.locked = true
      d.opening = false
      d.open = 1
      d.closing = true
      this.nav.pathBlock[d.cellJ * this.map.w + d.cellI] = 2
    }
    hud.bossName = b.nameKey
    hud.bossHp01 = 0
    hud.titleKey = b.nameKey
    hud.titleSub = `sector.${this.setup.sector}`
    hud.titleShownAt = performance.now()
    this.bossBarT = 0
    this.combat.target = b
    sfx('bossIntro')
    setMusicTrack('boss')
    this.shake(0.3)
  }

  /** Special weapon in slot i (HUD button / 1 / 2). */
  fireWeapon(i: 0 | 1): void {
    const id = profile.hero.slots[i] as WeaponId | ''
    if (!id || hud.phase !== 'play' || this.combat.dead) return
    const m = this.muzzle()
    const aim = this.aimDir(m)
    const r = this.weapons.use(i, id, m, aim)
    if (r === 'ok') {
      this.vmFlash = 1
      this.vmFlashColor = WEAPONS[id].color
      this.combat.recoil = 1
      this.makeNoise(12)
      if (aim[3] && !aim[3].awake) wake(this, aim[3])
    } else if (r === 'energy') {
      pushHud({ t: 'toast', key: 'combat.noEnergy', color: '#ff9a8a' })
      sfx('denied')
    }
  }

  /** Live XP → profile. A level-up mid-mission is a full repair + fanfare;
   *  the attribute pick waits for a calm moment (see LevelUpModal). */
  private gainXp(xp: number): void {
    const gained = grantXp(xp)
    if (gained > 0) {
      const c = this.combat
      this.stats = computeStats()
      c.maxHp = this.stats.maxHp
      c.maxWe = this.stats.maxWe
      c.maxPower = this.stats.maxPower
      c.hp = c.maxHp
      c.we = c.maxWe
      const p = this.player
      this.fx.riseRing(p.x, 0.1, p.z, '#ffd84a', 1.1, 26)
      pushHud({ t: 'flash', color: '#ffd84a', strength: 0.45 })
      pushHud({ t: 'toast', key: 'progress.levelUp', params: { n: profile.level }, color: '#ffd84a' })
      sfx('levelUp')
      this.tips.levelUp(this.time)
    }
  }

  // ─── Objective host ─────────────────────────────────────────────────────────

  onChestOpened(c: Chest): void {
    this.chestsOpened++
    profile.stats.chests++
    const lvl = this.setup.enemyLevel
    // Bolts burst out of every chest; an item drops by rarity chance.
    const bolts = Math.round((12 + lvl * 6) * (c.supply ? 1.2 : 1) * this.stats.boltMul)
    for (let k = 0; k < 5; k++) this.system.spawnPickup('bolt', Math.max(1, Math.round(bolts / 5)), c.x, 1.0, c.z)
    const itemChance = c.rarity === 'standard' ? 0.45 : 1
    const seed = (this.map.seed ^ (0x9e37 * (c.id + 1))) >>> 0
    if (Math.random() < itemChance) {
      const it = rollItem(seed, lvl, { rarity: c.rarity })
      profile.inv.items.push(it)
      profile.inv.fresh.push(it.id)
      this.itemsFound.push(it)
      pushHud({ t: 'toast', key: 'loot.found', params: { rarity: `rarity.${it.rarity}`, item: `item.${it.base}` }, color: RARITY_HEX[it.rarity] })
    }
    if (Math.random() < 0.18 && profile.inv.tanks < this.stats.tanksMax) {
      profile.inv.tanks++
      pushHud({ t: 'toast', key: 'loot.tank', color: '#8dff7a' })
    }
    sfx('chestOpen')
    this.dirty = true
  }

  onCrateBroken(c: Crate): void {
    const n = c.kind === 'barrel' ? 1 : 2
    for (let k = 0; k < n; k++) this.system.spawnPickup('bolt', 2 + Math.floor(Math.random() * 3), c.x, 0.8, c.z)
    if (Math.random() < 0.12) this.system.spawnPickup(Math.random() < 0.6 ? 'hp' : 'we', 0, c.x, 0.8, c.z)
  }

  onCoreTaken(_c: Core): void {
    sfx('objective')
    this.dirty = true
  }

  onObjectiveDone(): void {
    hud.objectiveDone = true
    pushHud({ t: 'toast', key: 'mission.objectiveDone', color: '#8dff7a' })
    pushHud({ t: 'flash', color: '#8dff7a', strength: 0.3 })
    sfx('objective')
    this.dirty = true
  }

  shotHitsProp(x: number, y: number, z: number, r: number, dmg: number): boolean {
    return this.objects.shotHitsCrate(x, y, z, r, dmg)
  }

  /** Barrel blast: hurts every machine (and crate) in the radius. */
  explode(x: number, z: number, r: number, dmg: number): void {
    for (const e of this.enemies) {
      if (e.state === 'dead') continue
      if (Math.hypot(e.x - x, e.z - z) < r + e.def.radius) {
        this.system.damageEnemy(e, dmg, { crit: false, charge: 2, fromX: x, fromZ: z, x: e.x, y: e.y + e.def.aimY, z: e.z, color: '#ffb04a' })
      }
    }
    for (const c of this.objects.crates) {
      if (!c.broken && Math.hypot(c.x - x, c.z - z) < r) this.objects.breakCrate(c)
    }
    const p = this.player
    if (Math.hypot(p.x - x, p.z - z) < r * 0.8) {
      this.hitPlayer(null, Math.round(dmg * 0.25), { blockable: false, fromX: x, fromZ: z, kind: 'aoe' })
    }
  }

  onPickup(kind: PickupKind, value: number): void {
    const c = this.combat
    switch (kind) {
      case 'bolt':
        this.bolts += value
        profile.bolts += value
        this.dirty = true
        sfx('bolt')
        break
      case 'hp':
      case 'hpBig': {
        const amt = Math.round(c.maxHp * (kind === 'hp' ? 0.14 : 0.35))
        c.hp = Math.min(c.maxHp, c.hp + amt)
        sfx('heal')
        pushHud({ t: 'flash', color: '#8dff7a', strength: 0.18 })
        break
      }
      case 'we':
      case 'weBig':
        c.we = Math.min(c.maxWe, c.we + (kind === 'we' ? 6 : 14))
        sfx('energy')
        break
    }
  }

  onPlayerHurt(_amount: number): void {
    // Chunk hooks (tutorial tips, analytics) attach here.
  }

  onPlayerDown(): void {
    const c = this.combat
    if (c.dead) return
    c.dead = true
    c.charging = false
    this.deathT = 0
    hud.phase = 'dead'
    this.fx.orbBurst(this.player.x, EYE_H - 0.4, this.player.z, PAL.heroCyan, 1.3)
    sfx('death')
    this.respawnT = 1.4
    this.writeSnap()
  }

  /** Defeat modal → "Reboot": back on your feet where you fell, full repair. */
  revive(): void {
    const c = this.combat
    c.dead = false
    c.hp = c.maxHp
    c.power = c.maxPower
    c.iframes = 2.5
    c.hurtT = 0
    hud.phase = 'play'
    this.phaseT = 0
    this.fx.riseRing(this.player.x, 0.1, this.player.z, PAL.glowCyan, 1, 22)
    // Push nearby machines back a step so a revive is not an instant re-death.
    for (const e of this.enemies) {
      if (e.state === 'dead') continue
      const d = Math.hypot(e.x - this.player.x, e.z - this.player.z)
      if (d < 4) {
        e.state = 'stun'
        e.st = 0
        e.stunT = 1.2
      }
    }
    sfx('beamIn')
    flow.modal = ''
  }

  /** Retreat / abandon: keep what was earned, fail the quest, go home. */
  retreat(): void {
    if (this.finished) return
    this.finished = true
    finishMission(false, this.tally())
  }

  /** Objective done → beam out (the results follow the animation). */
  beamOut(): void {
    if (hud.phase !== 'play' || !this.objects.objective.done) return
    hud.phase = 'beamOut'
    this.phaseT = 0
    this.combat.charging = false
    this.fx.riseRing(this.player.x, 0.1, this.player.z, PAL.glowCyan, 0.9, 24)
    sfx('beamOut')
  }

  useTank(): boolean {
    const c = this.combat
    if (profile.inv.tanks <= 0 || c.dead || c.hp >= c.maxHp || hud.phase !== 'play') {
      sfx('denied')
      return false
    }
    profile.inv.tanks--
    c.hp = c.maxHp
    c.power = c.maxPower
    this.fx.riseRing(this.player.x, 0.1, this.player.z, '#8dff7a', 0.9, 20)
    pushHud({ t: 'flash', color: '#8dff7a', strength: 0.35 })
    sfx('tank')
    this.dirty = true
    return true
  }

  private tally() {
    return { xp: this.xp, bolts: this.bolts, kills: this.kills, chests: this.chestsOpened, items: this.itemsFound, seconds: this.time }
  }

  // ─── Snapshot (resume) ──────────────────────────────────────────────────────

  private writeSnap(): void {
    if (!this.quest || this.finished) return
    const killed: number[] = []
    this.enemies.forEach((e, i) => { if (e.state === 'dead') killed.push(i) })
    writeSnapshot({
      quest: this.quest,
      killed,
      opened: this.objects.chests.filter(c => c.opened).map(c => c.id),
      doors: this.doors.filter(d => d.opening).map(d => d.id),
      collected: [
        ...this.objects.cores.filter(c => c.taken).map(c => c.id),
        ...(this.objects.npc?.rescued ? [-1] : [])
      ],
      progress: this.objects.objective.progress,
      x: this.player.x,
      z: this.player.z,
      yaw: this.player.yaw,
      hp: Math.max(1, Math.round(this.combat.hp)),
      we: this.combat.we,
      bolts: this.bolts,
      xp: this.xp,
      kills: this.kills,
      t: this.time,
      done: false
    })
  }

  private applySnapshot(s: MissionSnapshot): void {
    for (const i of s.killed) {
      const e = this.enemies[i]
      if (!e) continue
      e.state = 'dead'
      e.hp = 0
      e.deathT = 10
      e.root.visible = false
      e.shadow.visible = false
    }
    for (const id of s.opened) {
      const c = this.objects.chests[id]
      if (!c) continue
      c.opened = true
      c.openT = 1
      c.mesh.lid.rotation.x = -1.9
      this.nav.props[c.navIdx]!.active = false
    }
    for (const id of s.collected) {
      if (id === -1 && this.objects.npc) {
        this.objects.npc.rescued = true
        this.objects.npc.beamT = 1
        this.objects.npc.root.visible = false
        continue
      }
      const core = this.objects.cores[id]
      if (core) {
        core.taken = true
        core.mesh.root.visible = false
      }
    }
    for (const id of s.doors) {
      const d = this.doors[id]
      if (!d) continue
      d.opening = true
      d.locked = false
      d.open = 0.99
    }
    const ob = this.objects.objective
    ob.progress = Math.min(ob.count, s.progress)
    if (ob.progress >= ob.count) {
      ob.done = true
      hud.objectiveDone = true
    }
    const p = this.player
    p.x = p.px = s.x
    p.z = p.pz = s.z
    p.yaw = s.yaw
    this.combat.hp = Math.min(this.combat.maxHp, s.hp)
    this.combat.we = Math.min(this.combat.maxWe, s.we)
    this.bolts = s.bolts
    this.xp = s.xp
    this.kills = s.kills
    this.time = s.t
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  update(rawDt: number, first: boolean): void {
    // Hit-stop: the world slows to a crawl for a few frames on crits/parries.
    const dt = this.hitStop > 0 ? rawDt * 0.08 : rawDt
    this.hitStop = Math.max(0, this.hitStop - rawDt)
    this.time += dt
    this.phaseT += dt
    const p = this.player
    p.px = p.x
    p.pz = p.z

    if (hud.phase === 'beamIn') {
      if (this.phaseT >= BEAM_IN_TIME) {
        hud.phase = 'play'
        this.phaseT = 0
        this.fx.riseRing(p.x, 0.2, p.z, PAL.glowCyan, 0.9, 20)
      }
    } else if (hud.phase === 'play') {
      this.updatePlayer(dt, first)
    } else if (hud.phase === 'dead') {
      this.deathT += dt
      if (this.respawnT > 0) {
        this.respawnT -= rawDt
        if (this.respawnT <= 0) flow.modal = 'defeat'
      }
    } else if (hud.phase === 'beamOut') {
      if (this.phaseT >= BEAM_OUT_TIME && !this.finished) {
        this.finished = true
        writeSnapshot(null)
        finishMission(true, this.tally())
      }
    }

    for (const e of this.enemies) {
      if (e.boss) updateBoss(this, e, dt, this.bossRoom)
      else updateEnemy(this, e, dt)
      // Status effects from special weapons
      if (e.state !== 'dead') {
        if (e.burnT > 0) {
          const before = Math.floor(e.burnT * 2)
          e.burnT -= dt
          if (Math.random() < 0.4) this.fx.emit({ x: e.x + (Math.random() - 0.5) * 0.6, y: e.y + e.def.aimY * Math.random() * 1.4, z: e.z + (Math.random() - 0.5) * 0.6, vy: 2, color: '#ff7a2a', size: 0.45, sizeEnd: 0.05, life: 0.4 })
          if (Math.floor(e.burnT * 2) !== before) {
            e.lastWeapon = 'flameWave'
            this.system.damageEnemy(e, Math.max(1, Math.round(e.burnDps * 0.5)), { crit: false, charge: 0, fromX: e.x, fromZ: e.z, x: e.x, y: e.y + e.def.aimY, z: e.z, color: '#ff7a2a', special: true })
          }
        }
        if (e.frozenT > 0) e.frozenT -= dt
      }
    }
    // Entering the boss room triggers the Core Master
    if (this.boss && !this.bossStarted && this.bossRoom && hud.phase === 'play') {
      const i = Math.floor(p.x / CELL)
      const j = Math.floor(p.z / CELL)
      if (this.map.room[j * this.map.w + i] === this.bossRoom.id) this.startBoss()
    }
    this.weapons.update(dt)
    if (first && this.input.weaponQueued && hud.phase === 'play') this.fireWeapon((this.input.weaponQueued - 1) as 0 | 1)
    this.system.update(dt)
    this.fx.update(dt)
    this.markers.update(dt, this.time)
    this.shocks.update(dt)
    this.updateDoors(dt)
    this.updateRoomCulling()
    this.markerT = Math.max(0, this.markerT - dt)
    ;(this.marker.material as MeshBasicMaterial).opacity = p.path ? 0.55 + Math.sin(this.time * 8) * 0.25 : this.markerT * 2
    this.marker.scale.setScalar(p.path ? 1 + Math.sin(this.time * 6) * 0.08 : 1 + (0.5 - this.markerT) * 0.6)
    this.pad.ringMat.opacity = hud.phase === 'beamIn' || hud.phase === 'beamOut' ? 0.85 : 0.18 + Math.sin(this.time * 2.4) * 0.08
    this.pad.ring.rotation.y += dt * 0.6
    this.objects.update(dt, this.time)

    // Interaction: the nearest chest / bot / sealed boss door in reach.
    if (hud.phase === 'play') {
      const near = this.objects.nearestInteractable(p.x, p.z, p.yaw)
      const door = this.bossStarted ? undefined : this.doors.find(d => d.locked && Math.hypot(d.x - p.x, d.z - p.z) < 3.4)
      this.interact = near ?? (door ? { kind: 'door', ref: door } : null)
      if (first && this.input.interactQueued) this.doInteract()
      if (first && this.input.tankQueued) this.useTank()
      this.tips.update(dt, {
        time: this.time,
        combat: hud.combat,
        enemies: this.enemies,
        player: p,
        hp01: this.combat.hp / this.combat.maxHp,
        tanks: profile.inv.tanks,
        interactKind: hud.interactKey,
        objectiveDone: this.objects.objective.done,
        hasWeapon: !!profile.hero.slots[0],
        touch: this.input.device === 'touch'
      })
    } else {
      this.interact = null
    }

    // Checkpoints: persist profile + mission snapshot at most every 2 s.
    this.snapT -= rawDt
    if (this.dirty && this.snapT <= 0 && hud.phase === 'play') {
      this.snapT = 2
      this.dirty = false
      saveProfile()
      this.writeSnap()
    }

    this.hudT -= rawDt
    if (this.hudT <= 0) {
      this.hudT = 1 / 15
      this.writeHud()
    }

    if (first) {
      this.handleTaps()
      consumeEdges(this.input)
    }
  }

  /** Act on the current interactable (button / E key / tapping it). */
  doInteract(): void {
    const it = this.interact
    if (!it || hud.phase !== 'play') return
    if (it.kind === 'chest') this.objects.openChest(it.ref as Chest)
    else if (it.kind === 'npc') this.objects.rescue(it.ref as NonNullable<MissionObjects['npc']>)
    else if (it.kind === 'door') {
      const d = it.ref as DoorState
      d.locked = false
      d.opening = true
      this.nav.pathBlock[d.cellJ * this.map.w + d.cellI] = 1
      this.shake(0.2)
      this.sfx('door', d.x, d.z)
      pushHud({ t: 'toast', key: 'mission.bossDoor', color: '#ff7a7a' })
    }
    this.interact = null
    this.dirty = true
  }

  private updatePlayer(dt: number, first: boolean): void {
    const p = this.player
    const c = this.combat
    const inp = this.input
    const st = this.stats

    // ── Timers & regen ──
    c.fireCd -= dt
    c.iframes = Math.max(0, c.iframes - dt)
    c.hurtT = Math.max(0, c.hurtT - dt)
    c.slideCd -= dt
    c.guardBroken = Math.max(0, c.guardBroken - dt)
    c.recoil = Math.max(0, c.recoil - dt * 6)
    if (!c.blocking) {
      c.powerDelay -= dt
      if (c.powerDelay <= 0) c.power = Math.min(c.maxPower, c.power + 26 * dt)
    }
    if (!hud.combat && st.regen > 0) c.hp = Math.min(c.maxHp, c.hp + c.maxHp * st.regen * dt)

    // ── Targeting ──
    this.updateTargeting(dt)

    // ── Block ──
    if (inp.blockPressed) c.blockPressedAt = this.time
    c.blocking = inp.blockHeld && c.guardBroken <= 0 && c.slideT <= 0 && c.hurtT <= 0

    // ── Fire / charge (MegaMan: shoot on press, charge while held) ──
    const canAct = c.hurtT <= 0 && c.guardBroken <= 0 && c.slideT <= 0 && !c.blocking
    if (first && inp.firePressed && canAct && this.input.fireHeld !== undefined) {
      if (c.fireCd <= 0 && this.activePellets() < 3) this.firePellet()
      c.charging = true
      c.charge = 0
    }
    if (c.charging && inp.fireHeld) {
      const before = chargeInfo(c.charge, st).level
      c.charge += dt
      const after = chargeInfo(c.charge, st).level
      if (after > before) sfx(after === 1 ? 'charge1' : 'charge2')
    }
    if (first && inp.fireReleased && c.charging) {
      const info = chargeInfo(c.charge, st)
      if (info.level !== 0 && canAct) this.fireCharged(info.level, info.perfect)
      c.charging = false
      c.charge = 0
    } else if (c.charging && !inp.fireHeld && !inp.fireReleased) {
      // Lost the hold without a release edge (focus loss) — drop the charge.
      c.charging = false
      c.charge = 0
    }

    // ── Slide ──
    if (first && inp.slideQueued && c.slideCd <= 0 && c.slideT <= 0 && c.power >= st.slideCost) {
      let dx = 0
      let dz = 0
      const stick = Math.hypot(inp.moveX, inp.moveY)
      const fwdX = -Math.sin(p.yaw)
      const fwdZ = -Math.cos(p.yaw)
      const rightX = Math.cos(p.yaw)
      const rightZ = -Math.sin(p.yaw)
      if (stick > 0.2) {
        dx = fwdX * inp.moveY + rightX * inp.moveX
        dz = fwdZ * inp.moveY + rightZ * inp.moveX
      } else {
        dx = -fwdX
        dz = -fwdZ // no direction: hop back
      }
      const l = Math.hypot(dx, dz) || 1
      c.slideDX = dx / l
      c.slideDZ = dz / l
      c.slideT = 0.28
      c.slideCd = 0.7 * st.slideCdMul
      c.iframes = Math.max(c.iframes, 0.22)
      c.power -= st.slideCost
      c.powerDelay = 0.6
      p.path = null
      sfx('slide')
      this.fx.emit({ x: p.x, y: 0.2, z: p.z, color: '#dfefff', size: 0.9, sizeEnd: 1.6, life: 0.3 })
    }

    // ── Movement ──
    let tx = 0
    let tz = 0
    const fwdX = -Math.sin(p.yaw)
    const fwdZ = -Math.cos(p.yaw)
    const rightX = Math.cos(p.yaw)
    const rightZ = -Math.sin(p.yaw)
    const stick = Math.hypot(inp.moveX, inp.moveY)
    const speedMul = st.moveMul * (c.blocking ? 0.45 : 1) * (c.hurtT > 0 ? 0.5 : 1)
    if (c.slideT > 0) {
      c.slideT -= dt
      const sp = 15
      tx = c.slideDX * sp
      tz = c.slideDZ * sp
      if (Math.random() < 0.6) this.fx.emit({ x: p.x, y: 0.12, z: p.z, color: '#cfe0ff', size: 0.5, sizeEnd: 1.1, life: 0.25 })
    } else if (stick > 0.01) {
      p.path = null
      tx = (fwdX * inp.moveY + rightX * inp.moveX) * WALK_SPEED * speedMul
      tz = (fwdZ * inp.moveY + rightZ * inp.moveX) * WALK_SPEED * speedMul
    } else if (p.path && p.path.length) {
      const [wx, wz] = p.path[0]!
      const dx = wx - p.x
      const dz = wz - p.z
      const d = Math.hypot(dx, dz)
      if (d < 0.35) {
        p.path.shift()
        if (!p.path.length) p.path = null
      } else {
        const sp = Math.min(PATH_SPEED * speedMul, d * 6)
        tx = (dx / d) * sp
        tz = (dz / d) * sp
        if (!hud.combat) {
          const want = Math.atan2(-dx, -dz)
          p.yaw += angDiff(want, p.yaw) * Math.min(1, dt * 3.2)
        }
      }
    }
    const k = c.slideT > 0 ? 1 : Math.min(1, dt * ACCEL)
    p.vx += (tx - p.vx) * k
    p.vz += (tz - p.vz) * k
    const out: [number, number] = [0, 0]
    moveCircle(this.nav, p.x, p.z, p.vx * dt, p.vz * dt, PLAYER_R, out)
    if (p.path && Math.hypot(out[0] - p.x, out[1] - p.z) < 0.002 && Math.hypot(tx, tz) > 1) p.path = null
    p.x = out[0]
    p.z = out[1]
    const speed = Math.hypot(p.vx, p.vz)
    p.bobAmp += ((speed > 0.4 && c.slideT <= 0 ? Math.min(1, speed / WALK_SPEED) : 0) - p.bobAmp) * Math.min(1, dt * 8)
    p.bob += dt * (4.2 + speed * 1.35)
  }

  private activePellets(): number {
    let n = 0
    for (const s of this.system.shots) if (s.active && s.kind === 'pellet') n++
    return n
  }

  /** Muzzle position in world space (right-low of the eye). */
  private muzzle(): [number, number, number] {
    const p = this.player
    const cam = this.camera
    _v3.set(0.26, -0.22, -0.7).applyQuaternion(cam.quaternion)
    return [p.x + _v3.x, EYE_H + _v3.y, p.z + _v3.z]
  }

  private aimDir(from: [number, number, number]): [number, number, number, Enemy | null] {
    const t = this.combat.target
    const p = this.player
    if (t && t.state !== 'dead') {
      const ax = t.x - from[0]
      const ay = t.y + t.def.aimY * (t.elite ? 1.18 : 1) - from[1]
      const az = t.z - from[2]
      const toT = Math.atan2(-(t.x - p.x), -(t.z - p.z))
      if (Math.abs(angDiff(toT, p.yaw)) < 1.1) {
        const l = Math.hypot(ax, ay, az) || 1
        return [ax / l, ay / l, az / l, t]
      }
    }
    // Free aim: along the view, converging on the crosshair ~20 m out
    _v3.set(0, 0, -1).applyQuaternion(this.camera.quaternion)
    const fx = p.x + _v3.x * 20
    const fy = EYE_H + _v3.y * 20
    const fz = p.z + _v3.z * 20
    const dx = fx - from[0]
    const dy = fy - from[1]
    const dz = fz - from[2]
    const l = Math.hypot(dx, dy, dz) || 1
    return [dx / l, dy / l, dz / l, null]
  }

  private firePellet(): void {
    const c = this.combat
    const st = this.stats
    const m = this.muzzle()
    const [dx, dy, dz, tgt] = this.aimDir(m)
    const crit = Math.random() < st.critChance
    const dmg = Math.round(st.busterDmg * st.pelletMul * (crit ? st.critMul : 1))
    this.system.spawnPlayerShot('pellet', m[0], m[1], m[2], dx, dy, dz, dmg, crit, tgt)
    c.fireCd = 0.2
    c.recoil = Math.min(1, c.recoil + 0.45)
    this.fx.flash(m[0] + dx * 0.5, m[1] + dy * 0.5, m[2] + dz * 0.5, '#fff39a', 0.22, 0.06)
    sfx('shoot')
    // Shooting at a sleeping enemy in view wakes it.
    if (tgt && !tgt.awake) wake(this, tgt)
    this.makeNoise(10)
  }

  /** Gunfire is loud: machines within `r` metres that can hear it wake up. */
  private makeNoise(r: number): void {
    const p = this.player
    for (const e of this.enemies) {
      if (e.awake || e.state === 'dead') continue
      if (Math.hypot(e.x - p.x, e.z - p.z) < r) wake(this, e)
    }
  }

  private fireCharged(level: 1 | 2 | 3, perfect: boolean): void {
    const c = this.combat
    const st = this.stats
    const m = this.muzzle()
    const [dx, dy, dz, tgt] = this.aimDir(m)
    const mul = level === 3 ? 7 : level === 2 ? 4 : 2.2
    const crit = perfect || Math.random() < st.critChance
    const dmg = Math.round(st.busterDmg * mul * st.chargeDmgMul * (crit ? st.critMul : 1))
    const kind = level === 3 ? 'charge3' : level === 2 ? 'charge2' : 'charge1'
    this.system.spawnPlayerShot(kind, m[0], m[1], m[2], dx, dy, dz, dmg, crit, tgt)
    c.fireCd = 0.25
    c.recoil = 1
    this.shake(level >= 2 ? 0.16 : 0.06)
    this.fx.flash(m[0] + dx * 0.6, m[1] + dy * 0.6, m[2] + dz * 0.6, level >= 2 ? '#7ff4ff' : '#c8ff7a', level >= 2 ? 0.5 : 0.32, 0.1)
    if (perfect) {
      pushHud({ t: 'flash', color: '#ffd84a', strength: 0.25 })
      pushHud({ t: 'text', x: m[0] + dx * 3, y: m[1] + 0.4, z: m[2] + dz * 3, key: 'combat.perfect', color: '#ffd84a' })
    }
    sfx(level >= 2 ? 'chargeShotBig' : 'chargeShot')
    if (tgt && !tgt.awake) wake(this, tgt)
    this.makeNoise(12)
  }

  private updateTargeting(dt: number): void {
    const c = this.combat
    const p = this.player
    let engaged = 0
    this.aimCandidate = false
    let best: Enemy | null = null
    let bestScore = Infinity
    for (const e of this.enemies) {
      if (e.state === 'dead') continue
      const d = Math.hypot(e.x - p.x, e.z - p.z)
      const ang = Math.abs(angDiff(Math.atan2(-(e.x - p.x), -(e.z - p.z)), p.yaw))
      if (e.awake && d < 22) engaged++
      if (d < 22 && ang < 0.5 && hasLineOfSight(this.nav, p.x, p.z, e.x, e.z)) this.aimCandidate = true
      if ((e.awake && d < 22) || (d < 20 && ang < 0.45)) {
        const score = ang * 2.2 + d / 10
        if (score < bestScore && hasLineOfSight(this.nav, p.x, p.z, e.x, e.z)) {
          bestScore = score
          best = e
        }
      }
    }
    const wasCombat = hud.combat
    hud.combat = engaged > 0
    if (wasCombat && !hud.combat) this.combatEndT = 0.6
    if (this.combatEndT > 0) {
      this.combatEndT -= dt
      if (this.combatEndT <= 0) this.system.vacuum(16)
    }
    const t = c.target
    const valid = t && t.state !== 'dead' && Math.hypot(t.x - p.x, t.z - p.z) < 24
    if (valid && !hasLineOfSight(this.nav, p.x, p.z, t.x, t.z)) this.targetLostT += dt
    else this.targetLostT = 0
    if (!valid || this.targetLostT > 1.2) {
      c.target = best && (best.awake || this.aimCandidate) ? best : null
      this.targetLostT = 0
    }
    // Swipe / Tab: cycle to the next engaged enemy by bearing.
    if (this.input.swipe !== 0) {
      const list = this.enemies
        .filter(e => e.state !== 'dead' && e.awake && Math.hypot(e.x - p.x, e.z - p.z) < 22 && hasLineOfSight(this.nav, p.x, p.z, e.x, e.z))
        .map(e => ({ e, a: angDiff(Math.atan2(-(e.x - p.x), -(e.z - p.z)), p.yaw) }))
        .sort((a, b) => a.a - b.a)
      if (list.length > 1) {
        const i = Math.max(0, list.findIndex(o => o.e === c.target))
        const next = list[(i + (this.input.swipe > 0 ? -1 : 1) + list.length) % list.length]!
        c.target = next.e
        sfx('uiClick')
      }
    }
  }

  private updateDoors(dt: number): void {
    const p = this.player
    for (const d of this.doors) {
      if (!d.opening && !d.locked) {
        if (Math.hypot(p.x - d.x, p.z - d.z) < DOOR_OPEN_DIST) {
          d.opening = true
          this.sfx('door', d.x, d.z)
        }
      }
      if (d.opening && d.open < 1) {
        d.open = Math.min(1, d.open + dt * DOOR_OPEN_SPEED)
        const e = 1 - Math.pow(1 - d.open, 3)
        if (d.mesh.boss) {
          d.mesh.panels[0]!.position.y = e * (WALL_H - 0.6)
        } else {
          // Halves part a little, then retract up into the lintel.
          const part = Math.min(1, e * 2.5)
          const lift = Math.max(0, (e - 0.25) / 0.75)
          for (let k = 0; k < 2; k++) {
            const pn = d.mesh.panels[k]!
            pn.position.x = (k === 0 ? -1 : 1) * part * 0.35
            pn.position.y = lift * (WALL_H - 1.1)
            pn.scale.y = Math.max(0.05, 1 - lift * 0.95)
          }
        }
        if (d.open > 0.55 && d.slab.active) {
          d.slab.active = false
          this.nav.pathBlock[d.cellJ * this.map.w + d.cellI] = 0
        }
        d.mesh.lampMat.color.set(d.open >= 1 ? PAL.glowCyan : PAL.glowYellow)
      }
      // The boss shutter slams shut behind you.
      if (d.closing) {
        d.open = Math.max(0, d.open - dt * DOOR_OPEN_SPEED * 2.2)
        const e = d.open * d.open
        if (d.mesh.boss) d.mesh.panels[0]!.position.y = e * (WALL_H - 0.6)
        if (d.open < 0.5) d.slab.active = true
        if (d.open <= 0) {
          d.closing = false
          this.shake(0.35)
          this.sfx('stomp', d.x, d.z)
          d.mesh.lampMat.color.set(PAL.glowRed)
        }
      }
    }
  }

  private updateRoomCulling(): void {
    const p = this.player
    const far = this.theme.fogFar + 6
    const b = this.level.bounds
    for (let i = 0; i < this.level.rooms.length; i++) {
      const bb = b[i]!
      const d = Math.hypot(bb.x - p.x, bb.z - p.z) - bb.r
      this.level.rooms[i]!.visible = d < far
    }
    for (const e of this.enemies) {
      const vis = e.state !== 'dead' || e.deathT < 0.2
      const near = Math.hypot(e.x - p.x, e.z - p.z) < far
      e.root.visible = vis && near
      e.shadow.visible = e.root.visible
    }
  }

  /** Right-side presses count as FIRE while in combat or an enemy is in the sights. */
  wantsFire(): boolean {
    return hud.phase === 'play' && (hud.combat || this.aimCandidate)
  }

  // ─── Taps: walk-to / interact ────────────────────────────────────────────

  private handleTaps(): void {
    if (hud.phase !== 'play') return
    for (const tap of this.input.taps) {
      const w = getRenderer().domElement.clientWidth || 1
      const h = getRenderer().domElement.clientHeight || 1
      // Tapped an object (chest / bot)? Open it if in reach, else walk to it.
      const hit = this.tappedObject(tap.x, tap.y)
      if (hit) {
        const p = this.player
        if (this.interact && this.interact.ref === hit.ref) this.doInteract()
        else {
          const dx = p.x - hit.x
          const dz = p.z - hit.z
          const d = Math.hypot(dx, dz) || 1
          this.walkTo(hit.x + (dx / d) * 1.6, hit.z + (dz / d) * 1.6)
        }
        continue
      }
      _v2.set((tap.x / w) * 2 - 1, -(tap.y / h) * 2 + 1)
      this.raycaster.setFromCamera(_v2, this.camera)
      const ray = this.raycaster.ray
      if (ray.direction.y >= -0.01) continue
      const t = -ray.origin.y / ray.direction.y
      if (t > 45) continue
      ray.at(t, _v3)
      this.walkTo(_v3.x, _v3.z)
    }
  }

  private tappedObject(sx: number, sy: number): { ref: unknown; x: number; z: number } | null {
    const pt = { x: 0, y: 0, visible: false }
    let best: { ref: unknown; x: number; z: number } | null = null
    let bestD = 70
    const p = this.player
    const consider = (ref: unknown, x: number, y: number, z: number) => {
      if (Math.hypot(x - p.x, z - p.z) > 26) return
      this.project(x, y, z, pt)
      if (!pt.visible) return
      const d = Math.hypot(pt.x - sx, pt.y - sy)
      if (d < bestD && hasLineOfSight(this.nav, p.x, p.z, x, z)) { bestD = d; best = { ref, x, z } }
    }
    for (const c of this.objects.chests) if (!c.opened) consider(c, c.x, 0.6, c.z)
    const n = this.objects.npc
    if (n && !n.rescued) consider(n, n.x, 0.8, n.z)
    if (!this.bossStarted) for (const d of this.doors) if (d.locked) consider(d, d.x, 1.6, d.z)
    return best
  }

  walkTo(x: number, z: number): boolean {
    const p = this.player
    if (isSolidAt(this.nav, x, z)) {
      const dx = x - p.x
      const dz = z - p.z
      const len = Math.hypot(dx, dz)
      let found = false
      for (let s = len; s > 0.5; s -= 0.5) {
        const cx = p.x + (dx / len) * s
        const cz = p.z + (dz / len) * s
        if (!isSolidAt(this.nav, cx, cz)) { x = cx; z = cz; found = true; break }
      }
      if (!found) return false
    }
    const raw = findPath(this.nav, p.x, p.z, x, z, 1400, 1)
    if (!raw) return false
    p.path = smoothPath(this.nav, p.x, p.z, raw, PLAYER_R)
    this.marker.position.x = x
    this.marker.position.z = z
    this.markerT = 0.5
    return true
  }

  // ─── HUD mirror (≤ 15 Hz) ────────────────────────────────────────────────

  private writeHud(): void {
    const c = this.combat
    hud.hp = Math.max(0, c.hp)
    hud.maxHp = c.maxHp
    hud.we = c.we
    hud.maxWe = c.maxWe
    hud.power = c.power
    hud.maxPower = c.maxPower
    hud.bolts = profile.bolts
    hud.level = profile.level
    hud.xp01 = xp01()
    hud.tanks = profile.inv.tanks
    hud.blockHeld = c.blocking
    hud.slideReady = c.slideCd <= 0 && c.power >= this.stats.slideCost
    // Objective line + compass
    const ob = this.objects.objective
    hud.objectiveKey = `objective.${ob.template}`
    hud.objectiveParams = {
      n: ob.progress, total: ob.count,
      target: this.quest?.target ? (ob.template === 'kill' ? `enemyPlural.${this.quest.target}` : `enemy.${this.quest.target}`) : ''
    }
    hud.objectiveDone = ob.done
    const it = this.interact
    hud.interactKey = !it ? '' : it.kind === 'chest' ? 'interact.chest' : it.kind === 'npc' ? 'interact.rescue' : 'interact.bossDoor'
    const p = this.player
    const marks: typeof hud.compass = []
    for (const m of this.objects.compassTargets(this.enemies)) {
      const bearing = angDiff(Math.atan2(-(m.x - p.x), -(m.z - p.z)), p.yaw)
      marks.push({ bearing: -bearing, kind: m.kind, dist: Math.hypot(m.x - p.x, m.z - p.z) })
      if (marks.length >= 6) break
    }
    if (ob.done) marks.push({ bearing: -angDiff(Math.atan2(-(this.map.start.x - p.x), -(this.map.start.z - p.z)), p.yaw), kind: 'exit', dist: Math.hypot(this.map.start.x - p.x, this.map.start.z - p.z) })
    hud.compass = marks
    // Special weapon slots
    for (let i = 0; i < 2; i++) {
      const id = profile.hero.slots[i] as WeaponId | ''
      const w = hud.weapons[i]!
      if (!id) {
        w.id = ''
        continue
      }
      const cost = this.weapons.cost(id)
      w.id = id
      w.cost = cost
      w.color = WEAPONS[id].color
      w.ready = this.weapons.cooldown[i as 0 | 1] <= 0 && (c.we >= cost || (id === 'galeGuard' && this.weapons.guardT > 0))
    }
    // Boss bar: fills segment by segment during the entrance, then tracks HP
    const b = this.boss
    if (b && this.bossStarted) {
      this.bossBarT += 1 / 15
      const fill = Math.min(1, this.bossBarT / (BOSS_INTRO_T * 0.7))
      hud.bossHp01 = b.state === 'dead' ? 0 : Math.min(fill, b.hp / b.maxHp)
      if (b.state === 'dead' && b.deathT > 1.6) hud.bossName = ''
    }
    const t = c.target
    if (t && t.state !== 'dead') {
      hud.targetName = t.nameKey
      hud.targetLevel = t.level
      hud.targetHp01 = t.hp / t.maxHp
      hud.targetElite = t.elite
    } else {
      hud.targetName = ''
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  render(alpha: number, dt: number): void {
    const p = this.player
    const c = this.combat
    const inp = this.input
    if (hud.phase === 'play' && (inp.lookDX || inp.lookDY)) {
      const s = (inp.device === 'touch' ? LOOK_TOUCH : LOOK_MOUSE) * this.lookSens
      // In combat the lock steers yaw; manual look still nudges it.
      const k = hud.combat && c.target ? 0.35 : 1
      p.yaw -= inp.lookDX * s * k
      p.pitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, p.pitch - inp.lookDY * s * k))
    }
    inp.lookDX = 0
    inp.lookDY = 0

    const x = p.px + (p.x - p.px) * alpha
    const z = p.pz + (p.z - p.pz) * alpha

    // Soft lock-on: ease the view toward the target (yaw + pitch).
    const t = c.target
    if (hud.phase === 'play' && t && t.state !== 'dead' && (hud.combat || c.charging)) {
      const ty = t.y + t.def.aimY * (t.elite ? 1.18 : 1)
      const want = Math.atan2(-(t.x - x), -(t.z - z))
      const dist = Math.hypot(t.x - x, t.z - z)
      const wantPitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, Math.atan2(ty - EYE_H, Math.max(0.5, dist)) * 0.85))
      const rate = Math.min(1, dt * 5.5)
      p.yaw += angDiff(want, p.yaw) * rate
      p.pitch += (wantPitch - p.pitch) * Math.min(1, dt * 4)
    }

    const bobY = Math.sin(p.bob * 2) * 0.042 * p.bobAmp
    const bobX = Math.cos(p.bob) * 0.028 * p.bobAmp
    let y = EYE_H + bobY
    if (hud.phase === 'beamIn') {
      const k = Math.min(1, this.phaseT / BEAM_IN_TIME)
      const e = 1 - Math.pow(1 - k, 3)
      y = EYE_H + (1 - e) * 7
    } else if (hud.phase === 'beamOut') {
      const k = Math.min(1, this.phaseT / BEAM_OUT_TIME)
      y = EYE_H + k * k * 9
    } else if (hud.phase === 'dead') {
      y = EYE_H - Math.min(1, this.deathT * 1.5) * 0.9
    }
    if (c.slideT > 0) y -= 0.35
    this.shakeAmt = Math.max(0, this.shakeAmt - dt * 1.8)
    const sh = this.shakeAmt * this.shakeAmt
    const cam = this.camera
    cam.position.set(
      x + Math.cos(p.yaw) * bobX + (Math.random() - 0.5) * sh * 0.2,
      y + (Math.random() - 0.5) * sh * 0.16,
      z - Math.sin(p.yaw) * bobX
    )
    cam.rotation.order = 'YXZ'
    const hurtRoll = c.hurtT > 0 ? Math.sin(this.time * 40) * 0.02 : 0
    cam.rotation.set(p.pitch, p.yaw, Math.cos(p.bob) * 0.006 * p.bobAmp + (Math.random() - 0.5) * sh * 0.05 + hurtRoll + (c.slideT > 0 ? -0.05 : 0))
    if (this.debugCam) {
      const d = this.debugCam
      cam.position.set(d[0], d[1], d[2])
      cam.lookAt(d[3], d[4], d[5])
    }
    cam.updateMatrixWorld()
    this.level.sky.position.copy(cam.position)

    for (const e of this.enemies) {
      if (!e.root.visible && e.state !== 'dead') continue
      if (e.boss) syncBossVisual(e, alpha)
      else syncEnemyVisual(e, alpha, this.time)
      if (e.frozenT > 0) e.rig.material.emissive.setRGB(0.15 + e.flash * 0.7, 0.4 + e.flash * 0.5, 0.75)
    }
    this.system.sync(alpha)

    this.syncViewmodel(dt)

    const r = getRenderer()
    r.clear()
    r.render(this.scene, cam)
    r.clearDepth()
    r.render(this.vmScene, this.vmCamera)
    tickHud(dt)
  }

  private syncViewmodel(dt: number): void {
    const p = this.player
    const c = this.combat
    const vm = this.vmRoot
    const beam = hud.phase === 'beamIn' ? 1 - Math.min(1, this.phaseT / BEAM_IN_TIME)
      : hud.phase === 'beamOut' ? Math.min(1, this.phaseT / BEAM_OUT_TIME)
        : hud.phase === 'dead' ? 1 : 0
    const block = c.blocking ? 1 : 0
    // Portrait screens are narrow: tuck the arm in and shrink it so it never
    // eats the right third of the view.
    const portrait = this.camera.aspect < 1
    const ax = portrait ? 0.15 : 0.25
    const ay = portrait ? -0.3 : -0.27
    vm.position.set(
      ax + Math.cos(p.bob) * 0.012 * p.bobAmp - block * 0.05,
      ay + Math.abs(Math.sin(p.bob)) * 0.014 * p.bobAmp - beam * 0.5 - block * 0.04,
      -0.62 + c.recoil * 0.07
    )
    vm.rotation.set(0.05 + Math.sin(this.time * 1.6) * 0.006 + c.recoil * 0.12, portrait ? 0.16 : 0.1, 0)
    vm.scale.setScalar(portrait ? 0.62 : 0.82)
    // Charge glow: grows through lv1, flickers at full charge (the classic)
    const info = chargeInfo(c.charging ? c.charge : 0, this.stats)
    if (c.charging && info.toL1 > 0.2 && hud.phase === 'play') chargeHum(info.toL1 * 0.5 + info.toL2 * 0.5, info.level >= 2)
    else chargeHum(null)
    const coreMat = this.vm.coreMat
    const haloMat = this.vm.haloMat
    if (c.charging && info.toL1 > 0.25) {
      const lv = info.level
      const flick = lv >= 2 ? (Math.floor(this.time * 30) % 2 === 0 ? 1 : 0.55) : 1
      coreMat.color.set(info.perfect ? '#ffd84a' : lv >= 2 ? '#7ff4ff' : lv === 1 ? '#c8ff7a' : PAL.glowCyan)
      haloMat.color.copy(coreMat.color)
      haloMat.opacity = (0.25 + 0.45 * (lv >= 1 ? 1 : info.toL1)) * flick
      const sc = 1 + info.toL1 * 0.6 + info.toL2 * 0.9
      this.vm.core.scale.setScalar(sc)
      this.vm.halo.scale.setScalar(0.6 + info.toL1 * 0.6 + info.toL2 * 0.8 + (info.perfect ? 0.3 : 0))
    } else {
      coreMat.color.set(PAL.glowCyan)
      haloMat.opacity = Math.max(0, haloMat.opacity - dt * 6)
      this.vm.core.scale.setScalar(1 + Math.sin(this.time * 5) * 0.08 + this.vmFlash * 0.8)
      if (this.vmFlash > 0) {
        coreMat.color.set(this.vmFlashColor)
        haloMat.color.set(this.vmFlashColor)
        haloMat.opacity = Math.max(haloMat.opacity, this.vmFlash * 0.7)
        this.vm.halo.scale.setScalar(0.8 + this.vmFlash)
      }
      this.vmFlash = Math.max(0, this.vmFlash - dt * 4)
    }
    // Barrier disc on block
    const sh = this.vm.shield
    sh.visible = c.blocking || this.vm.shieldMat.opacity > 0.01
    this.vm.shieldMat.opacity += ((c.blocking ? 0.45 : 0) - this.vm.shieldMat.opacity) * Math.min(1, dt * 14)
    sh.position.set(-0.42, 0.08, -0.25)
    sh.rotation.set(0, 0.35, Math.PI / 6 + this.time * 0.8)
  }

  /** Project a world point to CSS pixels on the canvas (for the HUD). */
  project(x: number, y: number, z: number, out: { x: number; y: number; visible: boolean }): void {
    _v3.set(x, y, z).project(this.camera)
    const el = getRenderer().domElement
    out.visible = _v3.z < 1 && _v3.z > -1
    out.x = (_v3.x * 0.5 + 0.5) * el.clientWidth
    out.y = (-_v3.y * 0.5 + 0.5) * el.clientHeight
  }

  resize(w: number, h: number): void {
    this.vmCamera.aspect = w / h
    this.vmCamera.fov = w < h ? 58 : 50
    this.vmCamera.updateProjectionMatrix()
    const r = getRenderer()
    this.fx.setScale(h * r.getPixelRatio(), this.camera.fov)
  }

  dispose(): void {
    chargeHum(null)
    this.tips.clear()
    this.fx.dispose()
    this.scene.traverse((o) => {
      const m = o as Mesh
      if (m.geometry) m.geometry.dispose()
    })
    this.vmScene.traverse((o) => {
      const m = o as Mesh
      if (m.geometry) m.geometry.dispose()
    })
  }
}
