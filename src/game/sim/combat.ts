import {
  Sprite, SpriteMaterial, AdditiveBlending, Color, Mesh, MeshBasicMaterial, SphereGeometry, Group, type Scene
} from 'three'
import type { Enemy, Shot, World, Pickup, PickupKind } from './world'
import type { PlayerStats } from './stats'
import { glowTexture } from '../world/textures'
import { hasLineOfSight } from '../world/nav'
import { PARRY_WINDOW, wake } from './enemies'
import { pushHud } from '../state/hud'
import { buildBolt, buildCapsule } from '../models/props'
import { BASE_COLORS } from '../models/enemies'
import { PLAYER_R, EYE_H } from './constants'
import { scaleXp } from '../data/enemies'

/**
 * ─── Shots, damage, pickups ──────────────────────────────────────────────────
 *
 * Every projectile in the mission (player pellets and charge shots, enemy
 * bullets, lobbed shells, reflected shots) lives in one pool, as does every
 * pickup. Damage in both directions is resolved here so the rules — guards,
 * crits, block, parry, i-frames — have exactly one home.
 */

export interface CombatHost extends World {
  scene: Scene
  stats: PlayerStats
  hitStop: number
  onEnemyKilled(e: Enemy, xp: number): void
  onPickup(kind: PickupKind, value: number): void
  onPlayerHurt(amount: number): void
  onPlayerDown(): void
  /** Breakable props (crates / barrels): true if the shot struck one. */
  shotHitsProp?(x: number, y: number, z: number, r: number, dmg: number): boolean
}

const SHOT_LOOK: Record<string, { core: string; glow: string; r: number; g: number }> = {
  pellet: { core: '#fff6b0', glow: '#ffe066', r: 0.085, g: 0.55 },
  charge1: { core: '#eaffb0', glow: '#9dff5a', r: 0.15, g: 1.0 },
  charge2: { core: '#e6fbff', glow: '#3ce0ff', r: 0.24, g: 1.9 },
  charge3: { core: '#fff0ff', glow: '#ff5fd8', r: 0.36, g: 2.8 },
  enemy: { core: '#fff0e0', glow: '#ff5a3a', r: 0.12, g: 0.8 },
  shell: { core: '#3b4458', glow: '#ff7a3a', r: 0.22, g: 1.0 },
  reflect: { core: '#ffffff', glow: '#7ff4ff', r: 0.16, g: 1.2 },
  special: { core: '#ffffff', glow: '#ffffff', r: 0.2, g: 1.2 }
}

const sphereGeo = new SphereGeometry(1, 12, 8)

export class CombatSystem {
  shots: Shot[] = []
  pickups: Pickup[] = []
  readonly root = new Group()
  private host: CombatHost

  constructor(host: CombatHost) {
    this.host = host
    host.scene.add(this.root)
  }

  // ─── Shot pool ─────────────────────────────────────────────────────────────

  private acquire(): Shot {
    let s = this.shots.find(x => !x.active)
    if (!s) {
      const glowMat = new SpriteMaterial({ map: glowTexture(), color: new Color('#ffffff'), transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false })
      const sprite = new Sprite(glowMat)
      sprite.renderOrder = 6
      const core = new Mesh(sphereGeo, new MeshBasicMaterial({ color: new Color('#ffffff'), toneMapped: false }))
      this.root.add(sprite, core)
      s = {
        active: false, owner: 'player', kind: 'pellet', x: 0, y: 0, z: 0, px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0,
        dmg: 0, crit: false, radius: 0.1, life: 0, pierce: 0, hitIds: [], homing: null, turn: 0, source: null,
        blockable: true, sx: 0, sy: 0, sz: 0, tx: 0, tz: 0, t: 0, dur: 0, color: '#ffffff', sprite, core,
        element: 'none', weapon: ''
      }
      this.shots.push(s)
    }
    s.active = true
    s.hitIds.length = 0
    s.homing = null
    s.source = null
    s.pierce = 0
    s.crit = false
    s.t = 0
    s.element = 'none'
    s.weapon = ''
    s.sprite.visible = true
    s.core!.visible = true
    return s
  }

  private look(s: Shot, kind: keyof typeof SHOT_LOOK, glowColor?: string): void {
    const L = SHOT_LOOK[kind]!
    ;(s.sprite.material as SpriteMaterial).color.set(glowColor ?? L.glow)
    s.sprite.scale.setScalar(L.g)
    ;(s.core!.material as MeshBasicMaterial).color.set(L.core)
    s.core!.scale.setScalar(L.r)
    s.color = glowColor ?? L.glow
    s.radius = L.r
  }

  spawnPlayerShot(kind: 'pellet' | 'charge1' | 'charge2' | 'charge3', x: number, y: number, z: number, dx: number, dy: number, dz: number, dmg: number, crit: boolean, target: Enemy | null): Shot {
    const s = this.acquire()
    s.owner = 'player'
    s.kind = kind
    s.x = s.px = x
    s.y = s.py = y
    s.z = s.pz = z
    const speed = kind === 'pellet' ? 34 : kind === 'charge1' ? 30 : 28
    s.vx = dx * speed
    s.vy = dy * speed
    s.vz = dz * speed
    s.dmg = dmg
    s.crit = crit
    s.life = 1.4
    s.pierce = kind === 'pellet' ? 0 : kind === 'charge1' ? 1 : 3
    s.homing = target
    s.turn = kind === 'pellet' ? 4 : 2.5
    s.blockable = true
    this.look(s, kind, crit ? '#ffd84a' : undefined)
    if (kind !== 'pellet') s.radius *= 1.8
    return s
  }

  spawnEnemyShot(e: Enemy, x: number, y: number, z: number, dx: number, dy: number, dz: number, speed: number, dmg: number, blockable: boolean): void {
    const s = this.acquire()
    s.owner = 'enemy'
    s.kind = 'enemy'
    s.x = s.px = x
    s.y = s.py = y
    s.z = s.pz = z
    const l = Math.hypot(dx, dy, dz) || 1
    s.vx = (dx / l) * speed
    s.vy = (dy / l) * speed
    s.vz = (dz / l) * speed
    s.dmg = dmg
    s.life = 3
    s.source = e
    s.blockable = blockable
    const glow = e.element === 'fire' ? '#ff7a2a' : e.element === 'ice' ? '#7fe8ff' : e.element === 'volt' ? '#fff04a' : '#ff5a3a'
    this.look(s, 'enemy', glow)
  }

  lobShell(e: Enemy, tx: number, tz: number, dur: number, dmg: number): void {
    const s = this.acquire()
    s.owner = 'enemy'
    s.kind = 'shell'
    s.sx = e.x
    s.sy = 1.0
    s.sz = e.z
    s.x = s.px = s.sx
    s.y = s.py = s.sy
    s.z = s.pz = s.sz
    s.tx = tx
    s.tz = tz
    s.t = 0
    s.dur = dur
    s.dmg = dmg
    s.life = dur + 0.5
    s.source = e
    s.blockable = false
    this.look(s, 'shell')
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  update(dt: number): void {
    const h = this.host
    for (const s of this.shots) {
      if (!s.active) continue
      s.px = s.x
      s.py = s.y
      s.pz = s.z
      s.life -= dt
      if (s.life <= 0) { this.kill(s); continue }

      if (s.kind === 'shell') {
        s.t += dt
        const k = Math.min(1, s.t / s.dur)
        s.x = s.sx + (s.tx - s.sx) * k
        s.z = s.sz + (s.tz - s.sz) * k
        s.y = s.sy * (1 - k) + Math.sin(k * Math.PI) * 4.5
        h.fx.emit({ x: s.x, y: s.y, z: s.z, color: '#ffb070', size: 0.35, sizeEnd: 0.05, life: 0.3, vy: 0.5 })
        if (k >= 1) {
          h.fx.orbBurst(s.x, 0.4, s.z, '#ff7a3a', 0.7)
          h.shocks.spawn(s.x, 0.05, s.z, 2.0, '#ff5a3a', 0.35)
          h.shake(0.3)
          h.sfx('explode', s.x, s.z)
          if (Math.hypot(h.player.x - s.x, h.player.z - s.z) < 1.9 + PLAYER_R) {
            h.hitPlayer(s.source, s.dmg, { blockable: false, fromX: s.x, fromZ: s.z, kind: 'aoe' })
          }
          this.kill(s)
        }
        continue
      }

      // Homing (gentle — a tap should hit what it was aimed at, strafing or not)
      if (s.homing && s.homing.state !== 'dead') {
        const e = s.homing
        const ax = e.x - s.x
        const ay = e.y + e.def.aimY - s.y
        const az = e.z - s.z
        const al = Math.hypot(ax, ay, az) || 1
        const sp = Math.hypot(s.vx, s.vy, s.vz)
        const k = Math.min(1, s.turn * dt)
        s.vx += ((ax / al) * sp - s.vx) * k
        s.vy += ((ay / al) * sp - s.vy) * k
        s.vz += ((az / al) * sp - s.vz) * k
        const nl = Math.hypot(s.vx, s.vy, s.vz) || 1
        s.vx = (s.vx / nl) * sp
        s.vy = (s.vy / nl) * sp
        s.vz = (s.vz / nl) * sp
      }

      s.x += s.vx * dt
      s.y += s.vy * dt
      s.z += s.vz * dt

      // Trails for charged shots
      if (s.kind === 'charge2' || s.kind === 'charge3' || s.kind === 'reflect') {
        h.fx.emit({ x: s.x, y: s.y, z: s.z, color: s.color, size: s.kind === 'charge3' ? 0.9 : 0.6, sizeEnd: 0.05, life: 0.22 })
      }

      // World collision (walls, closed doors, pillars, floor)
      if (s.y < 0.02 || !hasLineOfSight(h.nav, s.px, s.pz, s.x, s.z)) {
        h.fx.sparks(s.px, Math.max(0.1, s.py), s.pz, s.color, s.kind === 'pellet' ? 5 : 12, 4)
        if (s.kind !== 'pellet') h.fx.flash(s.px, s.py, s.pz, s.color, 1.2, 0.14)
        this.kill(s)
        continue
      }

      if (s.owner === 'player') {
        if (h.shotHitsProp?.(s.x, s.y, s.z, s.radius, s.dmg)) {
          h.fx.sparks(s.x, s.y, s.z, s.color, 6, 4)
          if (s.pierce <= 0) { this.kill(s); continue }
          s.pierce--
        }
        for (const e of h.enemies) {
          if (e.state === 'dead' || s.hitIds.includes(e.id)) continue
          const ex = e.x - s.x
          const ey = e.y + e.def.aimY * (e.elite ? 1.18 : 1) - s.y
          const ez = e.z - s.z
          const rr = e.def.hitR * (e.elite ? 1.18 : 1) + s.radius
          if (ex * ex + ey * ey + ez * ez > rr * rr) continue
          s.hitIds.push(e.id)
          this.hitEnemyWithShot(e, s)
          if (s.pierce <= 0) { this.kill(s); break }
          s.pierce--
        }
      } else {
        const dx = h.player.x - s.x
        const dy = (EYE_H - 0.45) - s.y
        const dz = h.player.z - s.z
        const rr = 0.5 + s.radius
        // Late-window flash: the shot glints white when a block now would parry.
        const toPlayer = Math.hypot(dx, dz)
        const sp = Math.hypot(s.vx, s.vz) || 1
        if (s.blockable && toPlayer / sp < PARRY_WINDOW + h.stats.parryBonus) {
          ;(s.sprite.material as SpriteMaterial).color.set('#ffffff')
        }
        if (dx * dx + dy * dy + dz * dz < rr * rr) {
          const r = h.hitPlayer(s.source, s.dmg, { blockable: s.blockable, fromX: s.px, fromZ: s.pz, kind: 'shot' })
          if (r === 'parry') this.reflect(s)
          else if (r !== 'miss') this.kill(s)
        }
      }
    }
    this.updatePickups(dt)
  }

  /** Per-frame visual interpolation. */
  sync(alpha: number): void {
    const h = this.host
    for (const s of this.shots) {
      if (!s.active) continue
      const x = s.px + (s.x - s.px) * alpha
      const y = s.py + (s.y - s.py) * alpha
      const z = s.pz + (s.z - s.pz) * alpha
      s.sprite.position.set(x, y, z)
      s.core!.position.set(x, y, z)
      // Player shots start small and grow over their first ~2.5 m, so a
      // charge shot leaving the buster does not white out the screen.
      if (s.owner === 'player' && s.kind !== 'reflect') {
        const L = SHOT_LOOK[s.kind]!
        const d = Math.hypot(x - h.player.x, z - h.player.z)
        const k = Math.min(1, Math.max(0.15, (d - 0.4) / 2.5))
        s.sprite.scale.setScalar(L.g * k)
      }
    }
    for (const p of this.pickups) {
      if (!p.active) continue
      p.root.position.set(p.x, p.y, p.z)
    }
  }

  private kill(s: Shot): void {
    s.active = false
    s.sprite.visible = false
    if (s.core) s.core.visible = false
  }

  /** Parried enemy shot flies back at its owner, twice as hard. */
  private reflect(s: Shot): void {
    s.owner = 'player'
    s.kind = 'reflect'
    s.vx = -s.vx * 1.6
    s.vy = -s.vy
    s.vz = -s.vz * 1.6
    s.dmg = Math.round(this.host.stats.busterDmg * 2.5 + s.dmg)
    s.homing = s.source
    s.turn = 8
    s.life = 2
    s.hitIds.length = 0
    this.look(s, 'reflect')
  }

  // ─── Damage to enemies ─────────────────────────────────────────────────────

  private hitEnemyWithShot(e: Enemy, s: Shot): void {
    const lvl = s.kind === 'charge3' ? 3 : s.kind === 'charge2' ? 2 : s.kind === 'charge1' ? 1 : s.kind === 'reflect' ? 2 : 0
    this.damageEnemy(e, s.dmg, { crit: s.crit, charge: lvl, fromX: s.px, fromZ: s.pz, x: s.x, y: s.y, z: s.z, color: s.color, element: s.element })
  }

  damageEnemy(e: Enemy, amount: number, o: { crit: boolean; charge: number; fromX: number; fromZ: number; x: number; y: number; z: number; color: string; element?: string; special?: boolean }): void {
    const h = this.host
    if (e.state === 'dead') return
    if (!e.awake) wake(h, e)
    // ── Guards ──
    let guarded = false
    if (e.guardBreakT <= 0) {
      if (e.kind === 'hardhat' && e.guard > 0.55) guarded = true
      if (e.kind === 'trooper' && e.guard > 0.55) {
        const toShot = Math.atan2(o.fromX - e.x, o.fromZ - e.z)
        let d = toShot - e.yaw
        while (d > Math.PI) d -= Math.PI * 2
        while (d < -Math.PI) d += Math.PI * 2
        if (Math.abs(d) < 1.25) guarded = true
      }
    }
    const breaks = o.charge >= 2 || (o.charge >= 1 && h.stats.piercing) || o.special
    if (guarded && !breaks) {
      // TINK — the defence holds; the shot skips off.
      h.fx.sparks(o.x, o.y, o.z, '#ffffff', 7, 5, 0.14)
      pushHud({ t: 'text', x: o.x, y: o.y + 0.3, z: o.z, key: 'combat.tink', color: '#dfe7ff' })
      h.sfx('tink', e.x, e.z)
      return
    }
    let dmg = amount * e.def.armor
    let crit = o.crit
    if (!crit && h.stats.critChance > 0 && Math.random() < h.stats.critChance) {
      crit = true
      dmg *= h.stats.critMul
    }
    if (guarded && breaks) {
      e.guardBreakT = 1.6
      e.guard = 0
      e.stunT = 1.1
      e.state = 'stun'
      e.st = 0
      dmg *= 0.7
      pushHud({ t: 'text', x: o.x, y: o.y + 0.5, z: o.z, key: 'combat.guardBreak', color: '#ffd84a' })
      h.sfx('guardBreak', e.x, e.z)
    }
    if (e.state === 'stun') dmg *= 1.25
    dmg = Math.max(1, Math.round(dmg))
    e.hp -= dmg
    e.flash = 1
    e.hurtAt = h.time
    // Knockback + stagger
    const kb = o.charge >= 2 ? 0.35 : 0.08
    const kx = e.x - o.fromX
    const kz = e.z - o.fromZ
    const kl = Math.hypot(kx, kz) || 1
    if (e.def.speed > 0) {
      e.x += (kx / kl) * kb
      e.z += (kz / kl) * kb
    }
    if (o.charge >= 2 && !e.boss && e.hp > 0 && (e.state === 'tele' || e.state === 'engage' || e.state === 'act')) {
      // A full charge interrupts: telegraphs can be cancelled by timing it.
      e.state = 'stun'
      e.st = 0
      e.stunT = e.kind === 'brute' ? 0.4 : 0.6
      e.ring.visible = false
    }
    pushHud({ t: 'damage', x: o.x, y: o.y + 0.2, z: o.z, amount: dmg, crit, weak: false, toPlayer: false })
    h.fx.sparks(o.x, o.y, o.z, crit ? '#ffd84a' : o.color, o.charge >= 2 ? 16 : 7, o.charge >= 2 ? 7 : 5, o.charge >= 2 ? 0.24 : 0.16)
    h.fx.flash(o.x, o.y, o.z, crit ? '#ffd84a' : o.color, o.charge >= 2 ? 1.5 : 0.7, 0.1)
    h.sfx(crit ? 'crit' : o.charge >= 2 ? 'hitHeavy' : 'hit', e.x, e.z)
    if (o.charge >= 2) {
      h.shake(0.18)
      h.hitStop = Math.max(h.hitStop, crit ? 0.09 : 0.05)
    }
    if (e.hp <= 0) this.killEnemy(e)
  }

  killEnemy(e: Enemy): void {
    const h = this.host
    e.hp = 0
    e.state = 'dead'
    e.deathT = 0
    e.ring.visible = false
    const cy = e.y + e.def.aimY
    const col = e.elite ? '#ffd84a' : BASE_COLORS[e.kind].main
    h.fx.orbBurst(e.x, cy, e.z, col, e.elite ? 1.4 : e.def.radius > 0.8 ? 1.2 : 1)
    h.shake(e.elite ? 0.4 : 0.2)
    h.sfx('explode', e.x, e.z)
    const xp = scaleXp(e.def.xp, e.level) * (e.elite ? 3 : 1)
    pushHud({ t: 'text', x: e.x, y: cy + 0.8, z: e.z, key: 'combat.xp', color: '#9dff5a', params: { n: xp } })
    // Drops
    const [b0, b1] = e.def.bolts
    let bolts = Math.round((b0 + Math.random() * (b1 - b0)) * h.stats.boltMul * (1 + (e.level - 1) * 0.12) * (e.elite ? 3 : 1))
    const chunks = Math.min(6, Math.max(1, Math.ceil(bolts / 4)))
    for (let k = 0; k < chunks; k++) {
      const v = Math.max(1, Math.round(bolts / (chunks - k)))
      bolts -= v
      this.spawnPickup('bolt', v, e.x, cy, e.z)
    }
    const roll = Math.random()
    if (e.elite) this.spawnPickup(Math.random() < 0.6 ? 'hpBig' : 'weBig', 0, e.x, cy, e.z)
    else if (roll < 0.16) this.spawnPickup('hp', 0, e.x, cy, e.z)
    else if (roll < 0.26) this.spawnPickup('we', 0, e.x, cy, e.z)
    h.onEnemyKilled(e, xp)
  }

  // ─── Pickups ───────────────────────────────────────────────────────────────

  spawnPickup(kind: PickupKind, value: number, x: number, y: number, z: number): void {
    let p = this.pickups.find(q => !q.active && q.kind === kind)
    if (!p) {
      const mesh = kind === 'bolt' ? buildBolt()
        : kind === 'hp' || kind === 'hpBig' ? buildCapsule('hp', kind === 'hpBig')
          : kind === 'we' || kind === 'weBig' ? buildCapsule('we', kind === 'weBig')
            : buildBolt()
      p = { active: false, kind, value, x, y, z, vx: 0, vy: 0, vz: 0, t: 0, root: mesh.root, magnet: false }
      this.root.add(p.root)
      this.pickups.push(p)
    }
    const a = Math.random() * Math.PI * 2
    const sp = 1.5 + Math.random() * 2.5
    p.active = true
    p.value = value
    p.x = x
    p.y = y
    p.z = z
    p.vx = Math.cos(a) * sp
    p.vz = Math.sin(a) * sp
    p.vy = 3.5 + Math.random() * 2
    p.t = 0
    p.magnet = false
    p.root.visible = true
    p.root.scale.setScalar(1)
  }

  private updatePickups(dt: number): void {
    const h = this.host
    const px = h.player.x
    const pz = h.player.z
    const magnetR = 2.4 * h.stats.magnetMul
    for (const p of this.pickups) {
      if (!p.active) continue
      p.t += dt
      const dx = px - p.x
      const dz = pz - p.z
      const d = Math.hypot(dx, dz)
      if (p.t > 0.45 && d < magnetR) p.magnet = true
      if (p.magnet) {
        const sp = 9 + p.t * 4
        p.x += (dx / (d || 1)) * Math.min(d, sp * dt)
        p.z += (dz / (d || 1)) * Math.min(d, sp * dt)
        p.y += ((EYE_H - 0.6) - p.y) * Math.min(1, dt * 8)
      } else {
        // Toss, bounce, settle
        p.vy -= 18 * dt
        p.x += p.vx * dt
        p.z += p.vz * dt
        p.y += p.vy * dt
        const rest = p.kind === 'bolt' ? 0.22 : 0.3
        if (p.y < rest) {
          p.y = rest
          p.vy = Math.abs(p.vy) > 2 ? -p.vy * 0.35 : 0
          p.vx *= 0.6
          p.vz *= 0.6
        }
        if (!hasLineOfSight(h.nav, px, pz, p.x, p.z) && p.t < 0.6) {
          // Tossed into a wall: stop horizontally
          p.vx = 0
          p.vz = 0
        }
        const [cx, cz] = [p.x, p.z]
        if (isNaN(cx) || isNaN(cz)) p.active = false
      }
      p.root.rotation.y += dt * 3
      if (p.kind !== 'bolt') p.root.position.y = p.y + Math.sin(p.t * 4) * 0.05
      if (d < 0.75 && p.t > 0.3) {
        p.active = false
        p.root.visible = false
        h.onPickup(p.kind, p.value)
      }
      // Despawn very old loose pickups far from the player
      if (p.t > 90 && d > 20) {
        p.active = false
        p.root.visible = false
      }
    }
  }

  /** After a fight: every visible drop nearby flies to the player (casual QoL —
   *  nobody should have to hoover a room by hand). */
  vacuum(r: number): void {
    const h = this.host
    for (const p of this.pickups) {
      if (!p.active || p.magnet) continue
      if (Math.hypot(p.x - h.player.x, p.z - h.player.z) > r) continue
      if (!hasLineOfSight(h.nav, h.player.x, h.player.z, p.x, p.z)) continue
      p.magnet = true
      p.t = Math.max(p.t, 0.5)
    }
  }

  clear(): void {
    for (const s of this.shots) this.kill(s)
    for (const p of this.pickups) {
      p.active = false
      p.root.visible = false
    }
  }
}
