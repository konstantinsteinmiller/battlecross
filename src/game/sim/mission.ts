import {
  Scene, PerspectiveCamera, Fog, HemisphereLight, DirectionalLight, Color, Vector3, Raycaster, Vector2,
  Mesh, RingGeometry, MeshBasicMaterial, AdditiveBlending, DoubleSide, Group, AmbientLight
} from 'three'
import type { GameMode } from '../engine/app'
import { getRenderer } from '../engine/renderer'
import type { Input } from '../engine/input'
import { consumeEdges } from '../engine/input'
import { generateMap, type MapData, CELL, cellCenter, roomCenter, WALL_H } from '../world/levelGen'
import { createNav, moveCircle, findPath, smoothPath, isSolidAt, type Nav, type Slab } from '../world/nav'
import { buildLevel, doorFramePos, type LevelMeshes } from '../world/levelMesh'
import { THEMES, type Theme, type SectorId } from '../world/themes'
import { buildDoor, buildTeleporter, type DoorMesh, type PadMesh } from '../models/props'
import { buildViewmodel, type Viewmodel } from '../models/hero'
import { PAL } from '../models/palette'
import {
  EYE_H, PLAYER_R, WALK_SPEED, ACCEL, PATH_SPEED, LOOK_TOUCH, LOOK_MOUSE, PITCH_MIN, PITCH_MAX,
  DOOR_OPEN_DIST, DOOR_OPEN_SPEED, BEAM_IN_TIME
} from './constants'
import { hud, tickHud } from '../state/hud'

export interface MissionSetup {
  sector: SectorId
  seed: number
  rooms: number
  boss: boolean
  /** Look sensitivity multiplier from settings. */
  lookSens?: number
}

interface DoorState {
  id: number
  mesh: DoorMesh
  open: number
  opening: boolean
  locked: boolean
  slab: Slab
  x: number
  z: number
  axis: 'x' | 'z'
  cellI: number
  cellJ: number
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

export class Mission implements GameMode {
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
  time = 0
  phaseT = 0
  private raycaster = new Raycaster()
  private marker: Mesh
  private markerT = 0
  private shake = 0
  private lookSens: number
  private vmRoot = new Group()
  /** DEV: override the camera ([x,y,z, lookX,lookY,lookZ]) for inspection. */
  debugCam: [number, number, number, number, number, number] | null = null

  constructor(setup: MissionSetup, input: Input) {
    this.input = input
    this.lookSens = setup.lookSens ?? 1
    this.theme = THEMES[setup.sector]
    this.map = generateMap({ seed: setup.seed, rooms: setup.rooms, boss: setup.boss })
    this.nav = createNav(this.map)
    this.level = buildLevel(this.map, this.theme)
    this.scene.add(this.level.root)
    this.scene.add(this.level.sky)

    // Lighting: a bright hemisphere for the flat toon fill plus one sun for
    // the band edges. No shadow maps — blob shadows only (cheap, readable).
    const th = this.theme
    this.scene.background = new Color(th.skyBottom)
    this.scene.fog = new Fog(new Color(th.fog), th.fogNear, th.fogFar)
    const hemi = new HemisphereLight(new Color(th.hemiSky), new Color(th.hemiGround), 1.05)
    const sun = new DirectionalLight(new Color(th.sun), th.sunIntensity)
    sun.position.set(0.45, 1, 0.3)
    this.scene.add(hemi, sun)

    // Doors
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
      this.nav.pathBlock[d.j * this.map.w + d.i] = 1
      this.doors.push({
        id: d.id, mesh, open: 0, opening: false, locked: d.boss, slab, x: fx, z: fz, axis: d.axis, cellI: d.i, cellJ: d.j
      })
    }

    // Teleporter pad in the start room
    this.pad = buildTeleporter(th)
    const [sx, sz] = [this.map.start.x, this.map.start.z]
    this.pad.root.position.set(sx, 0, sz)
    this.scene.add(this.pad.root)

    // Tap-to-move marker
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

    // Viewmodel scene: its own camera and lights so the arm never clips into
    // walls and is lit consistently regardless of the room.
    this.vm = buildViewmodel()
    this.vmRoot.add(this.vm.root)
    this.vmScene.add(this.vmRoot)
    this.vmScene.add(new HemisphereLight(0xffffff, 0x445066, 1.2))
    const vmSun = new DirectionalLight(0xffffff, 1.1)
    vmSun.position.set(-0.4, 1, 0.6)
    this.vmScene.add(vmSun, new AmbientLight(0xffffff, 0.15))
    this.vmCamera.position.set(0, 0, 0)

    hud.phase = 'beamIn'
    this.phaseT = 0
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  update(dt: number, first: boolean): void {
    this.time += dt
    this.phaseT += dt
    const p = this.player
    p.px = p.x
    p.pz = p.z

    if (hud.phase === 'beamIn') {
      if (this.phaseT >= BEAM_IN_TIME) {
        hud.phase = 'play'
        this.phaseT = 0
      }
    } else if (hud.phase === 'play') {
      this.updatePlayer(dt)
    }
    this.updateDoors(dt)
    this.updateRoomCulling()
    this.markerT = Math.max(0, this.markerT - dt)
    ;(this.marker.material as MeshBasicMaterial).opacity = p.path ? 0.55 + Math.sin(this.time * 8) * 0.25 : this.markerT * 2
    this.marker.scale.setScalar(p.path ? 1 + Math.sin(this.time * 6) * 0.08 : 1 + (0.5 - this.markerT) * 0.6)
    this.pad.ringMat.opacity = hud.phase === 'beamIn' ? 0.85 : 0.18 + Math.sin(this.time * 2.4) * 0.08
    this.pad.ring.rotation.y += dt * 0.6

    if (first) {
      this.handleTaps()
      consumeEdges(this.input)
    }
  }

  private updatePlayer(dt: number): void {
    const p = this.player
    const inp = this.input
    let tx = 0
    let tz = 0
    const fwdX = -Math.sin(p.yaw)
    const fwdZ = -Math.cos(p.yaw)
    const rightX = Math.cos(p.yaw)
    const rightZ = -Math.sin(p.yaw)
    const stick = Math.hypot(inp.moveX, inp.moveY)
    if (stick > 0.01) {
      p.path = null
      tx = (fwdX * inp.moveY + rightX * inp.moveX) * WALK_SPEED
      tz = (fwdZ * inp.moveY + rightZ * inp.moveX) * WALK_SPEED
    } else if (p.path && p.path.length) {
      const [wx, wz] = p.path[0]!
      const dx = wx - p.x
      const dz = wz - p.z
      const d = Math.hypot(dx, dz)
      if (d < 0.35) {
        p.path.shift()
        if (!p.path.length) p.path = null
      } else {
        const sp = Math.min(PATH_SPEED, d * 6)
        tx = (dx / d) * sp
        tz = (dz / d) * sp
        // Turn the view gently toward the walking direction (Blades does
        // this), but only while no stick input fights it.
        const want = Math.atan2(-dx, -dz)
        let dy = want - p.yaw
        while (dy > Math.PI) dy -= Math.PI * 2
        while (dy < -Math.PI) dy += Math.PI * 2
        p.yaw += dy * Math.min(1, dt * 3.2)
      }
    }
    const k = Math.min(1, dt * ACCEL)
    p.vx += (tx - p.vx) * k
    p.vz += (tz - p.vz) * k
    const out: [number, number] = [0, 0]
    moveCircle(this.nav, p.x, p.z, p.vx * dt, p.vz * dt, PLAYER_R, out)
    // If a path step got blocked (door closing, crowding), drop the path.
    if (p.path && Math.hypot(out[0] - p.x, out[1] - p.z) < 0.002 && Math.hypot(tx, tz) > 1) p.path = null
    p.x = out[0]
    p.z = out[1]
    const speed = Math.hypot(p.vx, p.vz)
    p.bobAmp += ((speed > 0.4 ? Math.min(1, speed / WALK_SPEED) : 0) - p.bobAmp) * Math.min(1, dt * 8)
    p.bob += dt * (4.2 + speed * 1.35)
  }

  private updateDoors(dt: number): void {
    const p = this.player
    for (const d of this.doors) {
      if (!d.opening && !d.locked) {
        if (Math.hypot(p.x - d.x, p.z - d.z) < DOOR_OPEN_DIST) d.opening = true
      }
      if (d.opening && d.open < 1) {
        d.open = Math.min(1, d.open + dt * DOOR_OPEN_SPEED)
        const e = 1 - Math.pow(1 - d.open, 3)
        if (d.mesh.boss) {
          d.mesh.panels[0]!.position.y = e * (WALL_H - 0.6)
        } else {
          d.mesh.panels[0]!.position.x = -e * (CELL / 2 - 0.12)
          d.mesh.panels[1]!.position.x = e * (CELL / 2 - 0.12)
        }
        if (d.open > 0.55 && d.slab.active) {
          d.slab.active = false
          this.nav.pathBlock[d.cellJ * this.map.w + d.cellI] = 0
        }
        d.mesh.lampMat.color.set(d.open >= 1 ? PAL.glowCyan : PAL.glowYellow)
      }
    }
  }

  /** Hide room groups that are well beyond the fog. */
  private updateRoomCulling(): void {
    const p = this.player
    const far = this.theme.fogFar + 6
    const b = this.level.bounds
    for (let i = 0; i < this.level.rooms.length; i++) {
      const bb = b[i]!
      const d = Math.hypot(bb.x - p.x, bb.z - p.z) - bb.r
      this.level.rooms[i]!.visible = d < far
    }
  }

  // ─── Taps: walk-to / interact ────────────────────────────────────────────

  private handleTaps(): void {
    if (hud.phase !== 'play') return
    for (const tap of this.input.taps) {
      const w = getRenderer().domElement.clientWidth || 1
      const h = getRenderer().domElement.clientHeight || 1
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

  walkTo(x: number, z: number): boolean {
    const p = this.player
    if (isSolidAt(this.nav, x, z)) {
      // Clamp to the last walkable point along the ray toward the tap.
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
    const raw = findPath(this.nav, p.x, p.z, x, z)
    if (!raw) return false
    p.path = smoothPath(this.nav, p.x, p.z, raw, PLAYER_R)
    this.marker.position.x = x
    this.marker.position.z = z
    this.markerT = 0.5
    return true
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  render(alpha: number, dt: number): void {
    const p = this.player
    const inp = this.input
    // Look is applied per rendered frame, not per logic step, so a 120 Hz
    // screen gets 120 Hz look even though the sim runs at 60.
    if (hud.phase === 'play' && (inp.lookDX || inp.lookDY)) {
      const s = (inp.device === 'touch' ? LOOK_TOUCH : LOOK_MOUSE) * this.lookSens
      p.yaw -= inp.lookDX * s
      p.pitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, p.pitch - inp.lookDY * s))
      if (Math.abs(inp.lookDX) + Math.abs(inp.lookDY) > 2) p.path = p.path // look never cancels a walk
    }
    inp.lookDX = 0
    inp.lookDY = 0

    const x = p.px + (p.x - p.px) * alpha
    const z = p.pz + (p.z - p.pz) * alpha
    const bobY = Math.sin(p.bob * 2) * 0.042 * p.bobAmp
    const bobX = Math.cos(p.bob) * 0.028 * p.bobAmp
    let y = EYE_H + bobY
    if (hud.phase === 'beamIn') {
      const k = Math.min(1, this.phaseT / BEAM_IN_TIME)
      const e = 1 - Math.pow(1 - k, 3)
      y = EYE_H + (1 - e) * 7
    }
    this.shake = Math.max(0, this.shake - dt * 1.8)
    const sh = this.shake * this.shake
    const cam = this.camera
    cam.position.set(
      x + Math.cos(p.yaw) * bobX + (Math.random() - 0.5) * sh * 0.18,
      y + (Math.random() - 0.5) * sh * 0.14,
      z - Math.sin(p.yaw) * bobX
    )
    cam.rotation.order = 'YXZ'
    cam.rotation.set(p.pitch, p.yaw, Math.cos(p.bob) * 0.006 * p.bobAmp + (Math.random() - 0.5) * sh * 0.05)
    if (this.debugCam) {
      const d = this.debugCam
      cam.position.set(d[0], d[1], d[2])
      cam.lookAt(d[3], d[4], d[5])
    }
    this.level.sky.position.copy(cam.position)

    // Viewmodel: bob + sway opposite the look, lowered during beam-in.
    const vm = this.vmRoot
    const beam = hud.phase === 'beamIn' ? 1 - Math.min(1, this.phaseT / BEAM_IN_TIME) : 0
    vm.position.set(
      0.25 + Math.cos(p.bob) * 0.012 * p.bobAmp,
      -0.27 + Math.abs(Math.sin(p.bob)) * 0.014 * p.bobAmp - beam * 0.5,
      -0.62
    )
    vm.rotation.set(0.05 + Math.sin(this.time * 1.6) * 0.006, 0.1, 0)
    vm.scale.setScalar(0.82)
    this.vm.core.scale.setScalar(1 + Math.sin(this.time * 5) * 0.08)

    const r = getRenderer()
    r.clear()
    r.render(this.scene, cam)
    r.clearDepth()
    this.vmCamera.aspect = cam.aspect
    this.vmCamera.updateProjectionMatrix()
    r.render(this.vmScene, this.vmCamera)
    tickHud(dt)
  }

  resize(w: number, h: number): void {
    this.vmCamera.aspect = w / h
    // Keep the arm a similar screen size in portrait by widening its FOV.
    this.vmCamera.fov = w < h ? 64 : 50
    this.vmCamera.updateProjectionMatrix()
  }

  addShake(amount: number): void {
    this.shake = Math.min(1, this.shake + amount)
  }

  dispose(): void {
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

export { roomCenter, cellCenter }
