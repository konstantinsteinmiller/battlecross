<template lang="pug">
  div.lab
    div.host(ref="host")
    //- The store thumbnail carries no text, so the bar stays out of its frame
    div.bar(v-if="current !== 'thumb'")
      button(v-for="m in models" :key="m" :class="{ on: m === current }" @click="current = m") {{ m }}
</template>

<script setup lang="ts">
/**
 * DEV-ONLY turntable for every procedural model (route `/models`). Lets the
 * art be iterated on and screenshotted without playing into a mission.
 */
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  Scene, PerspectiveCamera, HemisphereLight, DirectionalLight, AmbientLight, Color, Group, GridHelper, Fog, Mesh,
  MeshBasicMaterial, SphereGeometry, Sprite, SpriteMaterial, AdditiveBlending, NormalBlending, PointLight, Vector3,
  type Object3D, type SkinnedMesh, type Texture
} from 'three'
import { getRenderer } from '@/game/engine/renderer'
import { buildHero, animateHeroIdle, animateHeroVictory, buildViewmodel, DEFAULT_HERO_COLORS, type Viewmodel, type HeroColors } from '@/game/models/hero'
import { BASES, BASE_BY_ID } from '@/game/data/items'
import { WEAPONS, WEAPON_IDS, type WeaponId } from '@/game/data/weapons'
import { buildDoor, buildTeleporter, buildCrate, buildBarrel, buildChest, buildBolt, buildCapsule, buildDataCore } from '@/game/models/props'
import { THEMES, type SectorId } from '@/game/world/themes'
import { bakeTextures, glowTexture, ringTexture } from '@/game/world/textures'
import { generateMap } from '@/game/world/levelGen'
import { buildLevel, doorFramePos } from '@/game/world/levelMesh'
import { mulberry32 } from '@/game/world/rng'
import { HubMode } from '@/game/sim/hub'
import { PAL } from '@/game/models/palette'
import { pose, nudge, type Rig, type V3 } from '@/game/models/kit'
import { buildBossRig, poseBoss, type BossId } from '@/game/models/bosses'
import { buildEnemyRig, poseHardhat, poseTrooper, poseHeli, poseHopper, poseRoller, poseBrute, poseTurret, type EnemyKind } from '@/game/models/enemies'

const host = ref<HTMLElement | null>(null)
const ENEMIES: EnemyKind[] = ['hardhat', 'trooper', 'heli', 'hopper', 'roller', 'brute', 'turret']
const BOSSES: BossId[] = ['scrapper', 'blazeMaster', 'frostMaster', 'voltMaster', 'galeMaster', 'vexMk1']
const models = ['hero', 'hubview', 'turn', 'gear', 'viewmodel', 'fp', 'thumb', 'props', 'enemies', 'bosses', ...ENEMIES, ...BOSSES]
let bossRigs: Array<{ id: BossId; rig: Rig }> = []
let enemyRigs: Array<{ kind: EnemyKind; rig: Rig }> = []
const hashQuery = new URLSearchParams(location.hash.split('?')[1] ?? '')
const current = ref(hashQuery.get('m') ?? 'hero')
/** Fixed turntable angle in degrees (`#/models?m=hero&angle=0`); spins when absent. */
const fixedAngle = hashQuery.has('angle') ? Number(hashQuery.get('angle')) * Math.PI / 180 : null
const zoom = Number(hashQuery.get('zoom') ?? 1)
/** `pose=victory` holds the results pose; `tint=1` tries a gear recolour. */
const heroPose = hashQuery.get('pose')
/** `still=1` freezes the idle animation (repeatable screenshots). */
const still = hashQuery.get('still') === '1'
/**
 * Flux in gear, composed the way `profile.heroColors()` does it: the
 * starter look (`DEFAULT_HERO_COLORS`), then each item's tint, then a copied
 * weapon's arm colours. `gear=helm_ace,body_reactor,arm_nova,flameWave`.
 */
const gearColors = (ids: string[]): HeroColors => {
  const c: HeroColors = { ...DEFAULT_HERO_COLORS }
  for (const id of ids) {
    const tint = BASE_BY_ID[id]?.tint
    if (tint) Object.assign(c, Object.fromEntries(Object.entries(tint).filter(([, v]) => v)))
    const w = WEAPONS[id as WeaponId]
    if (w) Object.assign(c, { buster: w.shell, core: w.color })
  }
  return c
}
const TINT: HeroColors = gearColors(['helm_ace', 'body_reactor', 'arm_quick'])
const gearParam = hashQuery.get('gear')
const heroTint = gearParam ? gearColors(gearParam.split(',')) : hashQuery.get('tint') === '1' ? TINT : undefined
/**
 * `m=gear`: every tint on the starter look, one row per slot (helmets,
 * chests, arm cannons, copied weapons), then a row of mixed kits.
 * `m=turn`: the default look from the front, three-quarter, side and back.
 */
const GEAR_ROWS: string[][][] = [
  BASES.filter(b => b.slot === 'helmet').map(b => [b.id]),
  BASES.filter(b => b.slot === 'chest').map(b => [b.id]),
  BASES.filter(b => b.slot === 'buster').map(b => [b.id]),
  WEAPON_IDS.map(w => [w]),
  [
    ['helm_royal', 'body_reactor', 'arm_heavy'], ['helm_guard', 'body_aegis', 'arm_quick'],
    ['helm_ace', 'body_plated', 'arm_nova'], ['helm_royal', 'body_light', 'flameWave'],
    ['helm_scout', 'body_reactor', 'iceLance']
  ]
]
/** `bg=hub` lights the bench like the hub (dark lab, cool rim light). */
const hubLight = hashQuery.get('bg') === 'hub'
let heroRigs: Rig[] = []
/**
 * `m=fp` — the in-mission first-person view (viewmodel scene, camera at the
 * origin looking down −Z, arm placed like mission.ts). `block=1` holds the
 * barrier up, `power=0.2` drains it, `impact=block|parry|break` fires that
 * impact every 1.5 s — or once at 1 s, then freezes `hold` seconds later
 * (`&hold=0.1`) so a screenshot catches a given moment.
 */
const fpBlock = hashQuery.get('block') === '1'
const fpPower = Number(hashQuery.get('power') ?? 1)
const fpImpact = hashQuery.get('impact') as 'block' | 'parry' | 'break' | null
const fpHold = hashQuery.has('hold') ? Number(hashQuery.get('hold')) : null
/** `freeze=0.46` stops the bench clock at that time (catch a raise mid-snap). */
const fpFreezeAt = hashQuery.has('freeze') ? Number(hashQuery.get('freeze')) : null
/** `drop=1.2` releases the guard at that time (catch the collapse). */
const fpDropAt = hashQuery.has('drop') ? Number(hashQuery.get('drop')) : null

const scene = new Scene()
scene.background = new Color(hubLight ? '#0e1c3f' : '#8fc8ff')
const camera = new PerspectiveCamera(35, 1, 0.05, 100)
if (hubLight) {
  // The hub's rig (sim/hub.ts): cool sky, white key from the front-right, cyan rim behind.
  scene.add(new HemisphereLight('#dbe8ff', '#1a2340', 1.1))
  const key = new DirectionalLight('#ffffff', 1.25)
  key.position.set(0.6, 1, 0.9)
  const rim = new DirectionalLight('#7fd6ff', 0.7)
  rim.position.set(-1, 0.6, -0.8)
  scene.add(key, rim)
} else {
  scene.add(new HemisphereLight('#e6f3ff', '#6b5f4f', 1.05))
  const sun = new DirectionalLight('#fff4dc', 1.25)
  sun.position.set(0.45, 1, 0.3)
  scene.add(sun)
}
const grid = new GridHelper(10, 20, hubLight ? 0x3a5a9a : 0x335577, hubLight ? 0x26365f : 0x557799)
scene.add(grid)
const stage = new Group()
scene.add(stage)
let rig: Rig | null = null
let raf = 0
const t0 = performance.now()

// First-person bench
const fpScene = new Scene()
fpScene.background = new Color('#1d2740')
const fpCamera = new PerspectiveCamera(50, 1, 0.01, 10)
fpScene.add(new HemisphereLight(0xffffff, 0x445066, 1.2))
const fpSun = new DirectionalLight(0xffffff, 1.1)
fpSun.position.set(-0.4, 1, 0.6)
fpScene.add(fpSun, new AmbientLight(0xffffff, 0.15))
const fpFloor = new GridHelper(12, 24, 0x5b7bb5, 0x3a4f7a)
fpFloor.position.y = -1.3
fpScene.add(fpFloor)
const fpVmRoot = new Group()
const fpBackdrop = new Group()
fpScene.add(fpVmRoot, fpBackdrop)
let fpVm: Viewmodel | null = null
let fpStart = 0
let fpLast = 0
let fpFired = -1
let fpFrozen = false
let fpDownUntil = -1

// ─── Store thumbnail (`m=thumb`) ─────────────────────────────────────────────
//
// The Poki thumbnail (store-art/poki/README.md), rendered from the real rig:
// Flux in his DEFAULT look with a charge building in the arm cannon, on a
// backdrop made by the game's own scene builders. `v=lab` is a low close-up
// on the hub's pad (HubMode's scene), `v=sector` a close-up in a Volt Tower
// room (generateMap + buildLevel, as a mission builds it) with a Rotor Drone
// over his shoulder, `v=full` head to boots on the pad. Nothing runs on a clock:
// pose, camera, lights and the spark layout are fixed, so a re-render is the
// same picture. The page renders at the full devicePixelRatio (the play-time
// cap is for frame rate, not for a still); `window.__lab.thumb({...})`
// re-poses and re-frames without a reload, for iterating on a composition.

interface ThumbShot {
  bg: 'lab' | 'sector'
  /** Camera, look-at point (relative to the anchor: the pad's centre on the floor) and vertical FOV in degrees. */
  cam: V3
  look: V3
  fov: number
  /** Flux's feet (relative to the anchor) and facing. */
  at: V3
  yaw: number
  /** Bone → euler offset from the rest pose (radians); the hips drop by `crouch`. */
  pose: Record<string, V3>
  crouch: number
  /** Size of the charge at the muzzle (1 = a full charge) and its light. */
  charge: number
  glow: number
  /** The whole composition turns about the anchor by this (radians): picks the wall behind him. */
  turn: number
  /** A white key light from over the camera (0 = none): keeps the pearl armour pearl under a tinted sector sky. */
  key: number
  enemy?: { kind: EnemyKind; at: V3; yaw: number }
}

/**
 * Braced, three-quarter to the camera: the cannon raised and out to screen
 * right with the charge on its muzzle, the free fist cocked at the chest
 * (clear of the jaw), the head turned back to look at the viewer.
 */
const THUMB_STANCE: Record<string, V3> = {
  chest: [-0.06, 0.12, 0.05],
  head: [0.04, -0.48, 0.1],
  shoulderR: [-1.85, 0, 0.7],
  elbowR: [-0.3, 0, 0],
  shoulderL: [-0.55, 0, -0.35],
  elbowL: [-1.6, 0, 0],
  hipL: [-0.3, 0, -0.18],
  kneeL: [0.35, 0, 0],
  hipR: [0.3, 0, 0.2],
  kneeR: [0.35, 0, 0]
}
/** The same stance with the feet set wider, for the full-body frame. */
const THUMB_WIDE: Record<string, V3> = {
  ...THUMB_STANCE, head: [0.02, -0.5, 0.1], hipL: [-0.38, 0, -0.26], kneeL: [0.42, 0, 0], hipR: [0.36, 0, 0.26], kneeR: [0.36, 0, 0]
}
const THUMB: Record<string, ThumbShot> = {
  // Low and close on the hub's pad, turned so the consoles stay out of frame
  lab: {
    bg: 'lab', cam: [-0.55, 0.78, 1.85], look: [0.05, 1.2, 0], fov: 42, at: [0, 0.38, 0], yaw: 0.3,
    pose: THUMB_STANCE, crouch: 0.05, charge: 1, glow: 1.2, turn: 0.3, key: 0
  },
  // Off the pad in the start room, a Rotor Drone over his shoulder; placed
  // where no wall pipe runs into the frame edges
  sector: {
    bg: 'sector', cam: [-0.25, 0.72, -1.35], look: [0.3, 1.2, -3.25], fov: 43, at: [0.2, 0, -3.25], yaw: 0.3,
    pose: THUMB_STANCE, crouch: 0.05, charge: 1, glow: 1.2, turn: 1.42, key: 1.05,
    enemy: { kind: 'heli', at: [-0.05, 2.75, -5.55], yaw: 0.05 }
  },
  // Head to boots on the hub's pad
  full: {
    bg: 'lab', cam: [-0.6, 0.72, 2.9], look: [0.08, 1.08, 0], fov: 36, at: [0, 0.38, 0], yaw: 0.3,
    pose: THUMB_WIDE, crouch: 0.06, charge: 1, glow: 1.2, turn: 0.3, key: 0
  }
}
const thumbBase: ThumbShot = THUMB[hashQuery.get('v') ?? 'lab'] ?? THUMB.lab!
/** `v=sector` only: which sector's room (`theme=scrapyard`…); the Volt Tower by default. */
const thumbTheme: SectorId = (hashQuery.get('theme') as SectorId | null) ?? 'volt'
let thumbScene: Scene | null = null
let thumbReady = false
let thumbHero: Rig | null = null
let thumbEnemy: Rig | null = null
let thumbSky: Object3D | null = null
const thumbAnchor = new Vector3()
const thumbCharge = new Group()
const thumbLight = new PointLight(new Color(PAL.heroPlasma), 2, 2.4, 2)
const thumbKey = new DirectionalLight(new Color('#ffffff'), 0)

/** The charge at the muzzle: a white-hot core in an amber halo, a gathering ring, sparks drawn in. */
const buildCharge = (): void => {
  thumbCharge.clear()
  const add = (map: Texture, hex: string, scale: number, opacity: number, additive = true): Sprite => {
    const s = new Sprite(new SpriteMaterial({
      map, color: new Color(hex), transparent: true, opacity, blending: additive ? AdditiveBlending : NormalBlending,
      depthWrite: false, toneMapped: false, fog: false
    }))
    s.scale.setScalar(scale)
    thumbCharge.add(s)
    return s
  }
  // The outer bloom is painted, not added: added onto a purple sector sky,
  // amber turns pink; laid over it, it stays amber on any backdrop
  add(glowTexture(), '#ff9a2e', 1.25, 0.5, false)
  add(glowTexture(), PAL.heroPlasma, 0.62, 0.95)
  add(ringTexture(), '#ffc266', 0.44, 0.85)
  add(glowTexture(), PAL.heroPlasmaHot, 0.3, 1)
  thumbCharge.add(new Mesh(
    new SphereGeometry(0.05, 16, 12), new MeshBasicMaterial({ color: new Color(PAL.heroPlasmaHot), toneMapped: false })
  ))
  // A fixed, seeded spark layout: the same picture on every render
  const rng = mulberry32(0xc0ba17)
  for (let i = 0; i < 16; i++) {
    const u = rng() * 2 - 1
    const a = rng() * Math.PI * 2
    const r = 0.2 + rng() * 0.28
    const s = Math.sqrt(1 - u * u)
    const sp = add(glowTexture(), i % 3 ? '#ffd08a' : PAL.heroPlasmaHot, 0.03 + rng() * 0.05, 0.9)
    sp.position.set(Math.cos(a) * s * r, u * r, Math.sin(a) * s * r)
  }
}

const Y_AXIS = new Vector3(0, 1, 0)
/** A composition point (anchor-relative, turned by `turn`) in world space. */
const thumbAt = (v: V3, turn: number): Vector3 => new Vector3(v[0], v[1], v[2]).applyAxisAngle(Y_AXIS, turn).add(thumbAnchor)

/** Pose Flux, frame him, put the charge on the muzzle (no rebuild of the backdrop). */
const applyThumb = (shot: ThumbShot): void => {
  const hero = thumbHero
  if (!hero || !thumbScene) return
  for (const name of Object.keys(hero.bones)) pose(hero, name)
  for (const [name, [x, y, z]] of Object.entries(shot.pose)) pose(hero, name, x, y, z)
  nudge(hero, 'hips', 0, -shot.crouch, 0)
  hero.root.position.copy(thumbAt(shot.at, shot.turn))
  hero.root.rotation.y = shot.yaw + shot.turn
  hero.root.updateMatrixWorld(true)
  // The muzzle opens toward −Y in the forearm's (elbowR) space; the core sits just outside it
  const muzzle = hero.bones.elbowR!.localToWorld(new Vector3(0, -0.36, 0))
  thumbCharge.position.copy(muzzle)
  thumbCharge.scale.setScalar(shot.charge)
  thumbLight.position.copy(muzzle)
  thumbLight.intensity = shot.glow
  if (thumbEnemy && shot.enemy) {
    thumbEnemy.root.position.copy(thumbAt(shot.enemy.at, shot.turn))
    thumbEnemy.root.rotation.y = shot.enemy.yaw + shot.turn
  }
  camera.fov = shot.fov
  camera.position.copy(thumbAt(shot.cam, shot.turn))
  camera.lookAt(thumbAt(shot.look, shot.turn))
  camera.updateProjectionMatrix()
  thumbSky?.position.copy(camera.position)
  thumbKey.intensity = shot.key
  thumbKey.position.copy(camera.position).add(new Vector3(0, 1.5, 0))
  thumbKey.target.position.copy(hero.root.position)
}

/**
 * The thumbnail's pixels straight off the WebGL canvas, rendered and read in
 * one task (the drawing buffer is still intact then): no page screenshot, so
 * no DOM overlay (the boot loader, a debug meter) can land in the picture.
 * Full devicePixelRatio: 628 CSS px at deviceScaleFactor 4 is 2512 px.
 */
const thumbPng = (): string => {
  const r = getRenderer()
  const el = host.value!
  r.setPixelRatio(window.devicePixelRatio)
  r.setSize(el.clientWidth, el.clientHeight, false)
  camera.aspect = el.clientWidth / el.clientHeight
  camera.updateProjectionMatrix()
  r.clear()
  if (thumbScene) r.render(thumbScene, camera)
  return r.domElement.toDataURL('image/png')
}

const buildThumb = async (shot: ThumbShot): Promise<void> => {
  thumbReady = false
  let sc: Scene
  if (shot.bg === 'lab') {
    // The hub exactly as the game builds it; its own Flux and Pip step
    // aside, and so do the additive light columns over the pad (seen from
    // this close they are a cyan haze across him, not a beam)
    sc = new HubMode().scene
    sc.traverse((o) => {
      if ((o as SkinnedMesh).isSkinnedMesh && o.parent) o.parent.visible = false
      const m = (o as Mesh).material
      if (m instanceof MeshBasicMaterial && m.blending === AdditiveBlending) o.visible = false
    })
    thumbAnchor.set(0, 0, 0)
  } else {
    // A Volt Tower room, built the way a mission builds it (mission.ts)
    const th = THEMES[thumbTheme] ?? THEMES.volt
    const map = generateMap({ seed: 20260926, rooms: 5, boss: false })
    const level = await buildLevel(map, th)
    sc = new Scene()
    sc.add(level.root, level.sky)
    thumbSky = level.sky
    sc.background = new Color(th.skyBottom)
    sc.fog = new Fog(new Color(th.fog), th.fogNear, th.fogFar)
    const sun = new DirectionalLight(new Color(th.sun), th.sunIntensity)
    sun.position.set(0.45, 1, 0.3)
    sc.add(new HemisphereLight(new Color(th.hemiSky), new Color(th.hemiGround), 1.05), sun)
    for (const d of map.doors) {
      const door = buildDoor(th, d.boss)
      const [fx, fz] = doorFramePos(d)
      door.root.position.set(fx, 0, fz)
      door.root.rotation.y = d.axis === 'x' ? Math.PI / 2 : 0
      sc.add(door.root)
    }
    thumbAnchor.set(map.start.x, 0, map.start.z)
    const pad = buildTeleporter(th)
    pad.root.position.copy(thumbAnchor)
    pad.ringMat.opacity = 0
    sc.add(pad.root)
  }
  thumbHero = buildHero()
  buildCharge()
  sc.add(thumbHero.root, thumbCharge, thumbLight, thumbKey, thumbKey.target)
  thumbEnemy = null
  if (shot.enemy) {
    thumbEnemy = buildEnemyRig(shot.enemy.kind)
    if (shot.enemy.kind === 'heli') poseHeli(thumbEnemy, 0.6, 0.12, 0.5)
    else if (shot.enemy.kind === 'brute') poseBrute(thumbEnemy, 0, 0, 1, 0.4, 0)
    sc.add(thumbEnemy.root)
  }
  thumbScene = sc
  applyThumb(shot)
  thumbReady = true
}

const show = (name: string) => {
  stage.clear()
  rig = null
  enemyRigs = []
  bossRigs = []
  heroRigs = []
  camera.fov = 35
  camera.updateProjectionMatrix()
  const th = THEMES.scrapyard
  if (name === 'thumb') {
    void buildThumb(thumbBase)
  } else if (name === 'hero') {
    rig = buildHero(heroTint)
    stage.add(rig.root)
    camera.position.set(0, 1.0, 4.2 / zoom)
    camera.lookAt(0, zoom > 1.5 ? 1.15 : 0.78, 0)
  } else if (name === 'hubview') {
    // Flux where the hub stands him (sim/hub.ts), seen through its camera:
    // landscape by default, `portrait=1` for the phone framing.
    rig = buildHero(heroTint)
    rig.root.position.set(0, 0.38, 0)
    rig.root.rotation.y = 0.25
    stage.add(rig.root)
    if (hashQuery.get('portrait') === '1') {
      camera.fov = 46
      camera.position.set(0, 1.2, 7.2)
      camera.lookAt(0, -0.95, 0)
    } else {
      camera.fov = 38
      camera.position.set(-1.6, 1.5, 5.6)
      camera.lookAt(-1.7, 1.0, 0)
    }
    camera.updateProjectionMatrix()
  } else if (name === 'turn') {
    // Front, three-quarter, side, back — one frame for a turnaround sheet.
    ;[0, 35, 90, 180].forEach((deg, i) => {
      const r = buildHero(heroTint)
      r.root.position.x = (i - 1.5) * 1.3
      r.root.rotation.y = (deg * Math.PI) / 180
      stage.add(r.root)
      heroRigs.push(r)
    })
    camera.position.set(0, 0.95, 4.4 / zoom)
    camera.lookAt(0, 0.76, 0)
  } else if (name === 'gear') {
    const only = hashQuery.has('row') ? Number(hashQuery.get('row')) : null
    const rows = GEAR_ROWS.filter((_r, i) => only === null || i === only)
    rows.forEach((row, ri) => {
      row.forEach((ids, i) => {
        const r = buildHero(gearColors(ids))
        r.root.position.set((i - (row.length - 1) / 2) * 1.05, (rows.length - 1 - ri) * 1.8, 0)
        r.root.rotation.y = fixedAngle ?? 0.35
        stage.add(r.root)
        heroRigs.push(r)
      })
    })
    const midY = ((rows.length - 1) * 1.8) / 2 + 0.76
    const span = Math.max(rows.length * 1.8, 2.2)
    camera.position.set(0, midY + 0.3, (span / (2 * Math.tan((17.5 * Math.PI) / 180))) * 1.05)
    camera.lookAt(0, midY, 0)
  } else if (name === 'fp') {
    fpVmRoot.clear()
    fpBackdrop.clear()
    fpVm = buildViewmodel(heroTint)
    fpVmRoot.add(fpVm.root)
    // A couple of enemies downrange, to judge how readable the view stays
    for (const [kind, x, z] of [['hardhat', -0.7, -3.4], ['trooper', 0.9, -4.6]] as const) {
      const r = buildEnemyRig(kind)
      r.root.position.set(x, -1.3, z)
      r.root.rotation.y = -x * 0.4
      fpBackdrop.add(r.root)
      enemyRigs.push({ kind, rig: r })
    }
    fpStart = performance.now() / 1000
    fpLast = fpStart
    fpVT = 0
    fpFired = -1
    fpFrozen = false
    fpDownUntil = -1
  } else if (name === 'viewmodel') {
    const vm = buildViewmodel(heroTint)
    vm.root.scale.setScalar(3)
    vm.root.position.y = 1
    stage.add(vm.root)
    camera.position.set(0, 1.9, 4.6)
    camera.lookAt(0, 1, 0)
  } else if (name === 'bosses' || (BOSSES as string[]).includes(name)) {
    const ids = name === 'bosses' ? BOSSES : [name as BossId]
    ids.forEach((id, i) => {
      const r = buildBossRig(id)
      const sc = id === 'scrapper' || id === 'vexMk1' ? 1 : 1.35
      r.root.scale.setScalar(sc)
      r.root.position.set((i - (ids.length - 1) / 2) * 2.6, id === 'vexMk1' ? 1.6 : 0, 0)
      stage.add(r.root)
      bossRigs.push({ id, rig: r })
    })
    camera.position.set(0, 2.2, ids.length > 1 ? 12 : 5.5)
    camera.lookAt(0, 1.2, 0)
  } else if (name === 'enemies' || (ENEMIES as string[]).includes(name)) {
    const kinds = name === 'enemies' ? ENEMIES : [name as EnemyKind]
    kinds.forEach((kind, i) => {
      const r = buildEnemyRig(kind)
      r.root.position.set((i - (kinds.length - 1) / 2) * 2.1, kind === 'heli' ? 1.6 : 0, 0)
      stage.add(r.root)
      enemyRigs.push({ kind, rig: r })
    })
    if (kinds.length > 1) {
      camera.position.set(0, 2.4, 11)
      camera.lookAt(0, 1.0, 0)
    } else {
      const h = enemyRigs[0]!.rig.height
      camera.position.set(0, h * 0.75 + 0.4, h * 2.2 + 1.2)
      camera.lookAt(0, h * 0.5, 0)
    }
  } else {
    const items: Object3D[] = [
      buildDoor(th, false).root, buildDoor(th, true).root, buildTeleporter(th).root, buildCrate(th).root,
      buildBarrel(th).root, buildChest(th, 'prototype').root, buildBolt().root, buildCapsule('hp', true).root,
      buildCapsule('we', false).root, buildDataCore().root
    ]
    items.forEach((o, i) => {
      o.position.set((i % 5) * 3.4 - 6.8, i === 6 || i > 6 ? 0.5 : 0, Math.floor(i / 5) * 4 - 2)
      stage.add(o)
    })
    camera.position.set(0, 7, 13)
    camera.lookAt(0, 0.8, 0)
  }
}

/** One frame of the first-person bench: arm placed exactly like mission.ts.
 *  Runs on a fixed 60 Hz virtual clock (catching up to the wall clock) so a
 *  `hold` freeze lands on the same moment however slow the machine is. */
const FP_STEP = 1 / 60
let fpVT = 0
const fpFrame = () => {
  const vm = fpVm
  if (!vm) return
  const now = performance.now() / 1000
  const target = now - fpStart
  const portrait = fpCamera.aspect < 1
  let steps = 0
  while (!fpFrozen && fpVT + FP_STEP <= target && steps++ < 30) {
    fpVT += FP_STEP
    const t = fpVT
    if (fpImpact) {
      const period = 1.5
      const due = fpHold === null ? Math.floor((t - 1) / period) : t >= 1 ? 0 : -1
      if (due > fpFired) {
        fpFired = due
        vm.barrier.impact(fpImpact)
        if (fpImpact === 'break') fpDownUntil = t + (fpHold === null ? 0.8 : 99)
      }
    }
    const up = fpBlock && t > 0.4 && t > fpDownUntil && (fpDropAt === null || t < fpDropAt)
    const block = up ? 1 : 0
    fpVmRoot.position.set((portrait ? 0.15 : 0.25) - block * 0.05, (portrait ? -0.3 : -0.27) - block * 0.04, -0.62)
    fpVmRoot.rotation.set(0.05 + Math.sin(t * 1.6) * 0.006, portrait ? 0.16 : 0.1, 0)
    fpVmRoot.scale.setScalar(portrait ? 0.62 : 0.82)
    vm.barrier.update(FP_STEP, up, fpPower, t)
    if (fpHold !== null && fpFired >= 0 && t >= 1 + fpHold) fpFrozen = true
    if (fpFreezeAt !== null && t >= fpFreezeAt) fpFrozen = true
  }
  fpLast = now
}

const loop = () => {
  raf = requestAnimationFrame(loop)
  const t = (performance.now() - t0) / 1000
  if (current.value === 'thumb') {
    const r = getRenderer()
    r.clear()
    if (thumbScene && thumbReady) r.render(thumbScene, camera)
    return
  }
  if (current.value === 'fp') {
    fpFrame()
    for (const { kind, rig: er } of enemyRigs) {
      if (kind === 'hardhat') poseHardhat(er, 1, t, 0)
      else poseTrooper(er, 0.5 + 0.5 * Math.sin(t), 0, t, 0.3)
    }
    const r = getRenderer()
    r.clear()
    r.render(fpScene, fpCamera)
    return
  }
  for (const hr of rig ? [rig, ...heroRigs] : heroRigs) {
    if (heroPose === 'victory') animateHeroVictory(hr, 1)
    else animateHeroIdle(hr, still ? 0 : t)
  }
  for (const { kind, rig: r } of enemyRigs) {
    if (kind === 'hardhat') poseHardhat(r, 0.5 + 0.5 * Math.sin(t * 1.5), t, 0)
    else if (kind === 'trooper') poseTrooper(r, 0.5 + 0.5 * Math.sin(t), 0.5 - 0.5 * Math.sin(t), t, 0.3)
    else if (kind === 'heli') poseHeli(r, t, 0.1, t * 25)
    else if (kind === 'hopper') poseHopper(r, Math.sin(t * 2), t)
    else if (kind === 'roller') poseRoller(r, t * 3, t, 0.4)
    else if (kind === 'brute') poseBrute(r, t, 0.2, Math.sin(t) > 0 ? 1 : -1, Math.sin(t * 2), 0)
    else if (kind === 'turret') poseTurret(r, 0.2 + Math.sin(t) * 0.2, 0)
  }
  for (const { id, rig: r } of bossRigs) poseBoss(r, id, t, 'idle', 0)
  if (bossRigs.length > 1) stage.rotation.y = fixedAngle ?? Math.sin(t * 0.4) * 0.4
  if (enemyRigs.length > 1) stage.rotation.y = fixedAngle ?? Math.sin(t * 0.4) * 0.5
  if (heroRigs.length > 0 || current.value === 'hubview') stage.rotation.y = 0
  else if (current.value !== 'props' && enemyRigs.length <= 1 && bossRigs.length <= 1) stage.rotation.y = fixedAngle ?? t * 0.6
  const r = getRenderer()
  r.clear()
  r.render(scene, camera)
}

onMounted(() => {
  // Handle for headless screenshot scripts (dev-only page)
  ;(window as unknown as { __lab: unknown }).__lab = {
    scene, stage, fpScene, getRig: () => rig, getRigs: () => heroRigs, getVm: () => fpVm, show,
    /** `m=thumb`: true once the backdrop is built and the first pose applied. */
    get thumbReady () { return thumbReady },
    /** `m=thumb`: re-pose / re-frame the current backdrop (`{ cam, look, fov, yaw, pose, … }`). */
    thumb: (o: Partial<ThumbShot> = {}) => applyThumb({ ...thumbBase, ...o, pose: { ...thumbBase.pose, ...o.pose } }),
    /** `m=thumb`: the frame as a PNG data URL, read off the canvas (scripts/render-thumbnail.mjs). */
    thumbPng
  }
  bakeTextures()
  const r = getRenderer()
  // A still, not a frame-rate budget: render the thumbnail at the page's full pixel ratio
  if (current.value === 'thumb') r.setPixelRatio(window.devicePixelRatio)
  host.value!.appendChild(r.domElement)
  const resize = () => {
    const w = host.value!.clientWidth
    const h = host.value!.clientHeight
    r.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    fpCamera.aspect = w / h
    fpCamera.fov = w < h ? 58 : 50
    fpCamera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)
  show(current.value)
  loop()
})
watch(current, show)
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<style scoped lang="sass">
.lab
  position: fixed
  inset: 0
.host
  position: absolute
  inset: 0
  :deep(canvas)
    width: 100%
    height: 100%
    display: block
.bar
  position: absolute
  left: 8px
  top: 8px
  display: flex
  gap: 6px
  button
    padding: 4px 10px
    background: #1f2a44
    color: #fff
    border-radius: 6px
    &.on
      background: #3cc8ff
      color: #000
</style>
