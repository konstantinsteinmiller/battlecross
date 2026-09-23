import { Group, Mesh, MeshBasicMaterial, AdditiveBlending, Color, CylinderGeometry, DoubleSide, type Scene } from 'three'
import type { Quest, QuestTemplate } from '../data/quests'
import type { Enemy, World } from './world'
import type { Theme } from '../world/themes'
import { cellCenter, roomCenter, type MapData, type Room } from '../world/levelGen'
import { buildChest, buildCrate, buildBarrel, buildDataCore, type ChestMesh, type PropMesh } from '../models/props'
import { buildWorkerBot, animateWorkerBot } from '../models/npc'
import type { Rig } from '../models/kit'
import { mulberry32, shuffle } from '../world/rng'
import { rollRarity, type Rarity } from '../data/items'
import { createEnemy } from './enemies'
import { createBoss } from './bosses'
import { SECTOR_BY_ID } from '../data/regions'
import type { BossId } from '../models/bosses'
import { makeBlobShadow } from '../fx/markers'
import { hasLineOfSight } from '../world/nav'
import { pushHud } from '../state/hud'
import { RARITY_COLOR } from '../models/palette'

/**
 * ─── Mission objects & objectives ────────────────────────────────────────────
 *
 * Everything in a sector map that is not a wall or an enemy: supply chests,
 * breakable crates and volatile barrels, data cores, the stranded worker-bot.
 * Their placement is deterministic from the map seed (so a resumed mission
 * rebuilds them and the snapshot only lists what was opened / taken), and
 * this module also owns the mission's objective counter.
 */

export interface Chest {
  id: number
  x: number
  z: number
  yaw: number
  mesh: ChestMesh
  opened: boolean
  openT: number
  supply: boolean
  rarity: Rarity
  navIdx: number
  beam: Mesh
}

export interface Crate {
  id: number
  x: number
  z: number
  kind: 'crate' | 'barrel'
  mesh: PropMesh
  hp: number
  broken: boolean
  navIdx: number
  hitT: number
}

export interface Core {
  id: number
  x: number
  z: number
  mesh: PropMesh
  taken: boolean
}

export interface Npc {
  x: number
  z: number
  rig: Rig
  root: Group
  rescued: boolean
  beamT: number
}

export interface ObjectiveInfo {
  template: QuestTemplate
  count: number
  progress: number
  done: boolean
}

export interface ObjectiveHost extends World {
  scene: Scene
  theme: Theme
  map: MapData
  onChestOpened(c: Chest): void
  onCrateBroken(c: Crate): void
  onCoreTaken(c: Core): void
  onObjectiveDone(): void
  explode(x: number, z: number, r: number, dmg: number): void
}

export class MissionObjects {
  chests: Chest[] = []
  crates: Crate[] = []
  cores: Core[] = []
  npc: Npc | null = null
  objective: ObjectiveInfo
  quest: Quest
  /** Enemy id of the elite target / boss (elite + boss jobs). */
  eliteId = -1
  private host: ObjectiveHost
  readonly root = new Group()

  constructor(host: ObjectiveHost, quest: Quest) {
    this.host = host
    this.quest = quest
    host.scene.add(this.root)
    this.objective = { template: quest.template, count: quest.count, progress: 0, done: false }
    this.place()
  }

  private addChest(room: Room, spot: [number, number, number], supply: boolean, rarity: Rarity): void {
    const h = this.host
    const mesh = buildChest(h.theme, rarity)
    const x = cellCenter(spot[0])
    const z = cellCenter(spot[1])
    // Push toward the wall it stands against so it does not block the room.
    const off = 0.55
    const cx = x - Math.sin(spot[2]) * off
    const cz = z - Math.cos(spot[2]) * off
    mesh.root.position.set(cx, 0, cz)
    mesh.root.rotation.y = spot[2]
    this.root.add(mesh.root)
    const navIdx = h.nav.props.length
    h.nav.props.push({ x: cx, z: cz, r: 0.8, active: true })
    const beam = new Mesh(
      new CylinderGeometry(0.35, 0.6, 5, 16, 1, true),
      new MeshBasicMaterial({ color: new Color(RARITY_COLOR[rarity]), transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, toneMapped: false })
    )
    beam.position.set(cx, 2.5, cz)
    beam.visible = false
    this.root.add(beam)
    this.chests.push({ id: this.chests.length, x: cx, z: cz, yaw: spot[2], mesh, opened: false, openT: 0, supply, rarity, navIdx, beam })
    void room
  }

  private place(): void {
    const h = this.host
    const map = h.map
    const rng = mulberry32(map.seed ^ 0xc4e57)
    const q = this.quest
    const rooms = map.rooms
    const byDepthDesc = [...rooms].filter(r => r.role !== 'start' && r.role !== 'boss').sort((a, b) => b.depth - a.depth)
    const wallCursor = new Map<number, number>()
    const takeWall = (r: Room): [number, number, number] | null => {
      const i = wallCursor.get(r.id) ?? 0
      wallCursor.set(r.id, i + 1)
      return r.wallSpots[r.wallSpots.length - 1 - i] ?? null
    }
    const spotCursor = new Map<number, number>()
    const takeSpot = (r: Room): [number, number] | null => {
      // Take from the END of the shuffled list so enemy spawns (front) and
      // objects rarely share a cell.
      const i = spotCursor.get(r.id) ?? 0
      spotCursor.set(r.id, i + 1)
      return r.spots[r.spots.length - 1 - i] ?? null
    }

    // Treasure rooms: one chest each; combat rooms: occasional bonus chest.
    for (const r of rooms) {
      if (r.role === 'treasure' || (r.role === 'combat' && rng() < 0.22)) {
        const spot = takeWall(r)
        if (spot) this.addChest(r, spot, false, rollRarity(rng, r.role === 'treasure' ? 0.6 : 0))
      }
    }
    // Supply jobs: N supply chests in the deepest rooms.
    if (q.template === 'supply') {
      let placed = 0
      for (const r of [...byDepthDesc, ...byDepthDesc]) {
        if (placed >= q.count) break
        const spot = takeWall(r)
        if (spot) {
          this.addChest(r, spot, true, rollRarity(rng, 0.3))
          placed++
        }
      }
      this.objective.count = placed
    }
    // Crates & barrels along walls in combat rooms.
    for (const r of rooms) {
      if (r.role === 'start' || r.role === 'boss') continue
      const n = Math.min(3, Math.floor(rng() * 3) + (r.w * r.h > 20 ? 1 : 0))
      for (let k = 0; k < n; k++) {
        const spot = takeWall(r)
        if (!spot) break
        const barrel = rng() < 0.3
        const mesh = barrel ? buildBarrel(h.theme) : buildCrate(h.theme)
        const x = cellCenter(spot[0]) - Math.sin(spot[2]) * 0.7 + (rng() - 0.5) * 0.8
        const z = cellCenter(spot[1]) - Math.cos(spot[2]) * 0.7 + (rng() - 0.5) * 0.8
        mesh.root.position.set(x, 0, z)
        mesh.root.rotation.y = rng() * Math.PI * 2
        this.root.add(mesh.root)
        const navIdx = h.nav.props.length
        h.nav.props.push({ x, z, r: barrel ? 0.5 : 0.62, active: true })
        this.crates.push({ id: this.crates.length, x, z, kind: barrel ? 'barrel' : 'crate', mesh, hp: barrel ? 1 : 12, broken: false, navIdx, hitT: 0 })
      }
    }
    // Collect jobs: data cores, one per room from the deepest outward.
    if (q.template === 'collect') {
      let placed = 0
      for (const r of shuffle(rng, [...byDepthDesc])) {
        if (placed >= q.count) break
        const sp = takeSpot(r)
        if (!sp) continue
        const mesh = buildDataCore()
        const x = cellCenter(sp[0])
        const z = cellCenter(sp[1])
        mesh.root.position.set(x, 1.1, z)
        this.root.add(mesh.root, (() => { const s = makeBlobShadow(0.35); s.position.set(x, 0.02, z); return s })())
        this.cores.push({ id: this.cores.length, x, z, mesh, taken: false })
        placed++
      }
      this.objective.count = placed
    }
    // Rescue jobs: the worker-bot waits in the objective room.
    if (q.template === 'rescue') {
      const r = rooms.find(x => x.role === 'objective') ?? byDepthDesc[0]!
      const [cx, cz] = roomCenter(r)
      const rig = buildWorkerBot()
      const root = new Group()
      root.add(rig.root)
      root.position.set(cx, 0, cz)
      this.root.add(root, (() => { const s = makeBlobShadow(0.45); s.position.set(cx, 0.02, cz); return s })())
      this.npc = { x: cx, z: cz, rig, root, rescued: false, beamT: 0 }
      h.nav.props.push({ x: cx, z: cz, r: 0.5, active: true })
      this.objective.count = 1
    }
  }

  /** Called once enemies exist: attach elite / kill / purge targets. */
  setupEnemyObjectives(enemies: Enemy[], addEnemy: (e: Enemy) => void): void {
    const h = this.host
    const q = this.quest
    const rng = mulberry32(h.map.seed ^ 0x0b1e)
    if (q.template === 'tutorial' || q.template === 'boss') {
      // The sector's Core Master waits behind the boss shutter.
      const room = h.map.rooms.find(r => r.role === 'boss') ?? h.map.rooms.find(r => r.role === 'objective')!
      const [cx, cz] = roomCenter(room)
      const boss = createBoss(SECTOR_BY_ID[q.sector].boss as BossId, q.level + (q.template === 'tutorial' ? 0 : 1), cx, cz, room.id)
      addEnemy(boss)
      this.eliteId = boss.id
      this.objective.count = 1
    }
    if (q.template === 'elite') {
      const room = h.map.rooms.find(r => r.role === 'objective') ?? h.map.rooms[h.map.rooms.length - 1]!
      const [cx, cz] = roomCenter(room)
      const kind = q.target ?? 'brute'
      const e = createEnemy(kind, q.level + 1, cx, cz, room.id, { elite: true })
      addEnemy(e)
      this.eliteId = e.id
      this.objective.count = 1
    }
    if (q.template === 'kill' && q.target) {
      // Guarantee enough of the target kind: top up in random rooms.
      const have = enemies.filter(e => e.kind === q.target).length
      const need = Math.max(0, q.count + 1 - have)
      const rooms = h.map.rooms.filter(r => r.role === 'combat' || r.role === 'objective')
      for (let k = 0; k < need && rooms.length; k++) {
        const r = rooms[Math.floor(rng() * rooms.length)]!
        const sp = r.spots[Math.floor(rng() * r.spots.length)]
        if (!sp) continue
        addEnemy(createEnemy(q.target, q.level, cellCenter(sp[0]), cellCenter(sp[1]), r.id, { element: 'none' }))
      }
    }
    if (q.template === 'purge') this.objective.count = enemies.length
  }

  // ─── Per-step ──────────────────────────────────────────────────────────────

  update(dt: number, time: number): void {
    const h = this.host
    for (const c of this.chests) {
      if (!c.opened) {
        // Idle shimmer on the lock lamp
        c.mesh.lampMat.color.setScalar(0.75 + Math.sin(time * 4 + c.id) * 0.25).multiply(new Color(RARITY_COLOR[c.rarity]))
        continue
      }
      if (c.openT < 1) {
        c.openT = Math.min(1, c.openT + dt * 2.2)
        const e = 1 - Math.pow(1 - c.openT, 3)
        c.mesh.lid.rotation.x = -e * 1.9
        c.beam.visible = true
        ;(c.beam.material as MeshBasicMaterial).opacity = Math.sin(c.openT * Math.PI) * 0.55
        c.beam.scale.set(1, 0.3 + e, 1)
      } else if (c.beam.visible) {
        c.beam.visible = false
      }
    }
    for (const c of this.crates) {
      if (c.broken) continue
      c.hitT = Math.max(0, c.hitT - dt * 6)
      c.mesh.root.scale.setScalar(1 + c.hitT * 0.08)
    }
    for (const core of this.cores) {
      if (core.taken) continue
      core.mesh.root.rotation.y += dt * 1.6
      core.mesh.root.position.y = 1.1 + Math.sin(time * 2 + core.id) * 0.12
      if (Math.hypot(h.player.x - core.x, h.player.z - core.z) < 1.2) {
        core.taken = true
        core.mesh.root.visible = false
        h.fx.riseRing(core.x, 0.5, core.z, '#8dff7a', 0.6, 14)
        h.fx.flash(core.x, 1.1, core.z, '#8dff7a', 1.2, 0.2)
        this.progress(1)
        h.onCoreTaken(core)
      }
    }
    if (this.npc) {
      const n = this.npc
      animateWorkerBot(n.rig, time, !n.rescued)
      if (n.rescued && n.beamT < 1) {
        n.beamT = Math.min(1, n.beamT + dt * 1.2)
        n.root.scale.set(1 - n.beamT * 0.8, 1 + n.beamT * 2, 1 - n.beamT * 0.8)
        n.root.position.y = n.beamT * 2
        if (n.beamT >= 1) n.root.visible = false
      } else if (!n.rescued) {
        n.root.rotation.y = Math.atan2(h.player.x - n.x, h.player.z - n.z)
      }
    }
  }

  progress(n: number): void {
    if (this.objective.done) return
    this.objective.progress = Math.min(this.objective.count, this.objective.progress + n)
    if (this.objective.progress >= this.objective.count) {
      this.objective.done = true
      this.host.onObjectiveDone()
    }
  }

  onEnemyKilled(e: Enemy): void {
    const q = this.quest
    if (q.template === 'kill' && e.kind === q.target) this.progress(1)
    else if (q.template === 'purge') this.progress(1)
    else if ((q.template === 'elite' || q.template === 'tutorial' || q.template === 'boss') && e.id === this.eliteId) this.progress(1)
  }

  // ─── Interaction ───────────────────────────────────────────────────────────

  /** The nearest thing the player can interact with right now. */
  nearestInteractable(px: number, pz: number, yaw: number): { kind: 'chest' | 'npc'; ref: Chest | Npc } | null {
    const h = this.host
    let best: { kind: 'chest' | 'npc'; ref: Chest | Npc } | null = null
    let bestD = 2.9
    for (const c of this.chests) {
      if (c.opened) continue
      const d = Math.hypot(c.x - px, c.z - pz)
      if (d < bestD && hasLineOfSight(h.nav, px, pz, c.x, c.z)) { bestD = d; best = { kind: 'chest', ref: c } }
    }
    if (this.npc && !this.npc.rescued) {
      const d = Math.hypot(this.npc.x - px, this.npc.z - pz)
      if (d < bestD + 0.4) best = { kind: 'npc', ref: this.npc }
    }
    void yaw
    return best
  }

  openChest(c: Chest): void {
    if (c.opened) return
    c.opened = true
    c.openT = 0
    this.host.nav.props[c.navIdx]!.active = false
    this.host.fx.riseRing(c.x, 0.4, c.z, RARITY_COLOR[c.rarity], 0.9, 18)
    this.host.fx.sparks(c.x, 0.9, c.z, RARITY_COLOR[c.rarity], 16, 5)
    if (c.supply) this.progress(1)
    this.host.onChestOpened(c)
  }

  rescue(n: Npc): void {
    if (n.rescued) return
    n.rescued = true
    n.beamT = 0
    this.host.nav.props.forEach(p => { if (p.x === n.x && p.z === n.z) p.active = false })
    this.host.fx.riseRing(n.x, 0.2, n.z, '#7ff4ff', 0.7, 20)
    pushHud({ t: 'toast', key: 'mission.rescued', color: '#7fffc8' })
    this.progress(1)
  }

  /** A player shot hit something? Returns true if it struck a crate/barrel. */
  shotHitsCrate(x: number, y: number, z: number, r: number, dmg: number): boolean {
    for (const c of this.crates) {
      if (c.broken) continue
      const top = c.kind === 'barrel' ? 1.3 : 1.15
      if (y > top + r) continue
      if (Math.hypot(c.x - x, c.z - z) > (c.kind === 'barrel' ? 0.5 : 0.62) + r) continue
      c.hp -= dmg
      c.hitT = 1
      if (c.hp <= 0) this.breakCrate(c)
      return true
    }
    return false
  }

  breakCrate(c: Crate): void {
    if (c.broken) return
    const h = this.host
    c.broken = true
    c.mesh.root.visible = false
    h.nav.props[c.navIdx]!.active = false
    if (c.kind === 'barrel') {
      h.fx.orbBurst(c.x, 0.7, c.z, '#ffb04a', 1.2)
      h.shocks.spawn(c.x, 0.05, c.z, 3.2, '#ff8a3a', 0.4)
      h.shake(0.35)
      h.sfx('explode', c.x, c.z)
      h.explode(c.x, c.z, 3.2, 40)
    } else {
      h.fx.sparks(c.x, 0.6, c.z, h.theme.crate, 14, 5, 0.22)
      h.fx.emit({ x: c.x, y: 0.6, z: c.z, color: '#ffffff', size: 1.1, sizeEnd: 1.8, life: 0.18 })
      h.sfx('bonk', c.x, c.z)
    }
    h.onCrateBroken(c)
  }

  /** Items shown on the compass: remaining objective locations. */
  compassTargets(enemies: Enemy[]): Array<{ x: number; z: number; kind: 'objective' | 'chest' | 'boss' }> {
    const out: Array<{ x: number; z: number; kind: 'objective' | 'chest' | 'boss' }> = []
    const q = this.quest
    if (this.objective.done) return out
    if (q.template === 'collect') for (const c of this.cores) { if (!c.taken) out.push({ x: c.x, z: c.z, kind: 'objective' }) }
    if (q.template === 'supply') for (const c of this.chests) { if (c.supply && !c.opened) out.push({ x: c.x, z: c.z, kind: 'objective' }) }
    if (q.template === 'rescue' && this.npc && !this.npc.rescued) out.push({ x: this.npc.x, z: this.npc.z, kind: 'objective' })
    if (q.template === 'elite' || q.template === 'tutorial' || q.template === 'boss') {
      const e = enemies.find(x => x.id === this.eliteId && x.state !== 'dead')
      if (e) out.push({ x: e.x, z: e.z, kind: q.template === 'elite' ? 'objective' : 'boss' })
    }
    if (q.template === 'kill') for (const e of enemies) { if (e.kind === q.target && e.state !== 'dead') out.push({ x: e.x, z: e.z, kind: 'objective' }) }
    if (q.template === 'purge') for (const e of enemies) { if (e.state !== 'dead') out.push({ x: e.x, z: e.z, kind: 'objective' }) }
    return out
  }
}
