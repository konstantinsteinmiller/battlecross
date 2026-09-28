import {
  AdditiveBlending, BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Fog, Group, HemisphereLight, DirectionalLight,
  LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector3, CylinderGeometry
} from 'three'
import type { GameMode } from '../engine/app'
import { getRenderer } from '../engine/renderer'
import { buildHero, animateHeroIdle, animateHeroWalk, type HeroColors } from '../models/hero'
import { buildPip, animatePip } from '../models/npc'
import { buildTeleporter, type PadMesh } from '../models/props'
import { buildTrooper, poseTrooper, buildHeli, poseHeli } from '../models/enemies'
import { buildBlazeMaster, poseBoss } from '../models/bosses'
import { buildGauss, poseGauss, newGaussPose, setGaussGlow, type GaussRig } from '../models/gauss'
import { buildStasisCapsule, type StasisCapsule } from '../models/stasis'
import { buildDiorama, type Diorama } from '../models/diorama'
import { buildStreet, vexFaceTexture, STREET_HAZE, type Street } from '../models/street'
import { newMotion } from '../models/motion'
import { pose, nudge, torus, cap, sph, rcyl, paint, type Rig } from '../models/kit'
import { PAL } from '../models/palette'
import { THEMES } from '../world/themes'
import { buildLabSet } from '../sim/hub'
import { Particles } from '../fx/particles'
import { tickHud } from '../state/hud'
import { sfx } from '../audio/sfx'
import { setMusicTrack } from '@/use/useSound'
import { setSongStartHint } from '../audio/music'
import {
  INTRO_END, SKIP_AFTER, eventsBetween, overlayAt, shotIndexAt, streetTime, ringReach, ramp, clamp01,
  FREEZE_AT, SPIRE_FLASH, VEX_ON, CUTIN_FROM, CUTIN_TO, DISC_FROM, DISC_TO, LEVER_AT, SEAL_AT, FROST_FROM, FROST_TO,
  PIP_POP, GLYPH_ON, HOLO_FROM, SCRAP_BLINK, TURN_FROM, STEP_FROM, STEP_TO, BEAM_RISE, FLASH_FULL
} from './introScript'
import { cine, cineLive, resetCine, setSkipHandler } from './cine'
import { sceneQuality, type SceneQuality } from '../engine/quality'
import { buildAtlas, animateAtlas } from '../models/atlas'
import { playVoice, prefetchVoice } from '../audio/voice'

/** How far ahead of an Atlas line its recording starts loading (s). */
const VOICE_LEAD = 1.5

/**
 * ─── The intro cutscene: "Wake-Up Call" ──────────────────────────────────────
 *
 * A `GameMode` that plays `introScript.ts` (the six shots of `story-arc.md`
 * § 1) on the game loop's fixed step, so ads, modals, a hidden tab and a
 * platform pause freeze it like any mission: the loop simply stops calling it.
 *
 * All five sets live in one scene, far apart, and only the current shot's is
 * drawn: the neon street (cold open), the valley diorama (the Red Signal), a
 * dark stage for Blaze Master's cut-in, and Gauss's lab (the lab, safe mode,
 * the wake-up and the beam), which holds Pip's hologram of the valley. The
 * light count never changes between shots (one hemisphere, two directionals,
 * re-tinted), so no shot recompiles a shader.
 *
 * Every pose, camera and effect is a function of the cutscene clock, like the
 * beam-in (`sim/beamIn.ts`); the renderer interpolates between steps. The
 * overlays (rewind, eyelids, HUD boot, flash) are drawn by
 * `components/story/CutsceneLayer.vue` from `cineLive`.
 */

export interface IntroOptions {
  /** A replay from Options: no music handover, and the owner goes back to the hub. */
  replay?: boolean
  /** The cutscene became the live mode (the loader is gone): the owner starts
   *  building what comes next behind it. */
  onStart?: () => void
  /** It ended (`skipped`: by the player). Called once. */
  onEnd?: (skipped: boolean) => void
  /** Flux's gear colours (the hub's refresh passes the player's). */
  colors?: HeroColors
  /** Scenery quality (default: the device's, `engine/quality.ts`). */
  quality?: SceneQuality
}

const STEP = 1 / 60

/** Where the sets stand (the lab is at the origin). */
const STREET_AT = new Vector3(-300, 0, 0)
const VALLEY_AT = new Vector3(300, 0, 0)
const CUTIN_AT = new Vector3(0, 0, 300)

/** The lab's layout: Flux's capsule, Gauss's, where she stands, the hologram. */
const FLUX_CAP = new Vector3(1.45, 0, -3.1)
const GAUSS_CAP = new Vector3(-1.45, 0, -3.1)
const GAUSS_AT = new Vector3(0.05, 0, -2.3)
const HOLO_AT = new Vector3(0.7, 1.12, -1.75)
/** Flux's eye as he wakes: at the front of his capsule, the glass down. */
const EYE = new Vector3(FLUX_CAP.x, 0.34 + 1.06, FLUX_CAP.z + 0.45)
const PAD_EYE = new Vector3(0, 0.3 + 1.06, 0)
/** The hologram's scale: the valley (r 14 m) as a table-top a metre across. */
const HOLO_SCALE = 0.052
/** Where Pip hovers while projecting: up and aside, clear of the hologram. */
const PIP_PROJECT = new Vector3(1.35, 1.9, -1.65)
/** …and on the pad's edge, spinning the ring up. */
const PIP_PAD = new Vector3(-1.1, 1.5, 0.95)

interface CamKey {
  t: number
  pos: [number, number, number]
  look: [number, number, number]
  /** Horizontal field of view (deg): the framing's width holds in portrait. */
  hfov: number
}

const _a = new Vector3()
const _b = new Vector3()
const _c = new Vector3()
const _d = new Vector3()
const _up = new Vector3(0, 1, 0)

/** Smoothly between camera keys (held before the first and after the last). */
const camAt = (list: readonly CamKey[], t: number, pos: Vector3, look: Vector3): number => {
  if (t <= list[0]!.t) {
    pos.fromArray(list[0]!.pos)
    look.fromArray(list[0]!.look)
    return list[0]!.hfov
  }
  for (let i = 1; i < list.length; i++) {
    const k1 = list[i]!
    if (t <= k1.t) {
      const k0 = list[i - 1]!
      const u = ramp(k0.t, k1.t, t)
      pos.fromArray(k0.pos).lerp(_a.fromArray(k1.pos), u)
      look.fromArray(k0.look).lerp(_a.fromArray(k1.look), u)
      return k0.hfov + (k1.hfov - k0.hfov) * u
    }
  }
  const last = list[list.length - 1]!
  pos.fromArray(last.pos)
  look.fromArray(last.look)
  return last.hfov
}

// ─── Camera keys per shot (set-local coordinates) ────────────────────────────

/** Cold open, on the ACTION clock (`streetTime`): so the rewind rewinds it. */
const STREET_CAM: readonly CamKey[] = [
  { t: 0, pos: [1.3, 0.6, -1.2], look: [0, 1.0, -14], hfov: 72 },
  { t: 0.9, pos: [0.9, 0.5, -2.6], look: [0, 1.1, -9], hfov: 74 },
  // The poster frame: low, under the Trooper's swing, the billboards above.
  { t: 1.2, pos: [-1.5, 0.28, -3.6], look: [0.4, 1.35, -6.8], hfov: 80 },
  { t: 1.55, pos: [-1.3, 0.3, -3.2], look: [0.3, 1.3, -6.2], hfov: 80 },
  // Side on: Flux planted on the right, the Trooper's shield on the left.
  { t: 2.0, pos: [4.6, 1.1, -3.9], look: [0.1, 0.95, -5.0], hfov: 72 },
  { t: FREEZE_AT, pos: [4.0, 1.0, -4.4], look: [0.15, 0.95, -5.0], hfov: 70 }
]

const VALLEY_CAM: readonly CamKey[] = [
  { t: 3.5, pos: [6, 18, 36], look: [0, 1, 0], hfov: 72 },
  { t: 4.5, pos: [2, 14, 28], look: [-1.5, 2.2, -1.5], hfov: 72 },
  { t: 5.6, pos: [-0.5, 10.5, 17], look: [-4, 4.5, -3], hfov: 76 },
  { t: 6.5, pos: [2, 12, 24], look: [-2, 2, -1], hfov: 78 }
]

// Low and wide from beside the pad, on the right: Gauss three-quarter on,
// Flux's capsule beyond her, Pip peeking over the console at the edge.
const LAB_CAM: readonly CamKey[] = [
  { t: 6.5, pos: [2.9, 0.7, 1.9], look: [0.3, 1.35, -2.7], hfov: 80 },
  { t: 7.5, pos: [2.5, 0.75, 1.4], look: [0.45, 1.35, -2.75], hfov: 78 },
  { t: 7.96, pos: [2.3, 0.85, 1.1], look: [0.55, 1.3, -2.8], hfov: 76 },
  { t: 9.5, pos: [1.9, 0.95, 0.6], look: [0.7, 1.25, -2.9], hfov: 76 }
]

const DISC_CAM: readonly CamKey[] = [
  { t: DISC_FROM, pos: [1.9, 1.45, -1.55], look: [1.45, 1.2, -2.9], hfov: 56 },
  { t: DISC_TO, pos: [1.85, 1.42, -1.7], look: [1.45, 1.2, -2.9], hfov: 52 }
]

const SAFE_CAM: readonly CamKey[] = [
  { t: 9.5, pos: [-0.1, 1.5, -0.5], look: [-1.3, 1.3, -3.1], hfov: 64 },
  { t: 11, pos: [-0.5, 1.5, -1.0], look: [-1.45, 1.35, -3.1], hfov: 58 }
]

/** Where Flux looks in first person (world). */
const FP_LOOK: ReadonlyArray<readonly [number, number, number, number]> = [
  // t, x, y, z
  [11.0, GAUSS_CAP.x, 1.3, GAUSS_CAP.z + 0.2],
  [13.25, GAUSS_CAP.x, 1.35, GAUSS_CAP.z],
  [13.6, HOLO_AT.x, HOLO_AT.y + 0.2, HOLO_AT.z],
  [TURN_FROM, HOLO_AT.x, HOLO_AT.y + 0.2, HOLO_AT.z],
  [STEP_FROM, 0, 1.0, 0],
  [STEP_TO, -0.3, 1.45, 3],
  [INTRO_END, -0.3, 1.5, 3]
]

const fpLookAt = (t: number, out: Vector3): Vector3 => {
  let i = 1
  while (i < FP_LOOK.length - 1 && t > FP_LOOK[i]![0]) i++
  const k0 = FP_LOOK[i - 1]!
  const k1 = FP_LOOK[i]!
  const u = ramp(k0[0], k1[0], t)
  return out.set(k0[1] + (k1[1] - k0[1]) * u, k0[2] + (k1[2] - k0[2]) * u, k0[3] + (k1[3] - k0[3]) * u)
}

/** The stasis heartbeat: a beat every 1.3 s from the seal, 0..1. */
const heartbeat = (t: number): number => {
  if (t < 10.6) return 0
  const p = (t - 10.6) % 1.3
  return Math.exp(-p * 7) + 0.6 * Math.exp(-Math.max(0, p - 0.2) * 9) * (p > 0.2 ? 1 : 0)
}

/** A zig-zag of red lightning between two points, re-rolled every call. */
const crackle = (line: LineSegments, from: Vector3, to: Vector3, jag: number): void => {
  const pos = line.geometry.attributes.position!.array as Float32Array
  const n = pos.length / 6
  let px = from.x
  let py = from.y
  let pz = from.z
  for (let i = 0; i < n; i++) {
    const u = (i + 1) / n
    const j = i === n - 1 ? 0 : jag
    const x = from.x + (to.x - from.x) * u + (Math.random() - 0.5) * j
    const y = from.y + (to.y - from.y) * u + (Math.random() - 0.5) * j
    const z = from.z + (to.z - from.z) * u + (Math.random() - 0.5) * j
    pos.set([px, py, pz, x, y, z], i * 6)
    px = x
    py = y
    pz = z
  }
  line.geometry.attributes.position!.needsUpdate = true
}

const newCrackle = (segs: number): LineSegments => {
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(new Float32Array(segs * 6), 3))
  const l = new LineSegments(g, new LineBasicMaterial({ color: new Color('#ff3048'), transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false }))
  l.frustumCulled = false
  l.visible = false
  return l
}

const additive = (hex: string, opacity: number): MeshBasicMaterial =>
  new MeshBasicMaterial({ color: new Color(hex), transparent: true, opacity, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, toneMapped: false })

export class IntroMode implements GameMode {
  scene = new Scene()
  camera = new PerspectiveCamera(50, 1, 0.05, 420)
  /** The cutscene clock (s). */
  t = 0
  private started = false
  private ended = false
  private readonly opts: IntroOptions
  private fx: Particles
  private hemi = new HemisphereLight(new Color('#ffffff'), new Color('#202040'), 1)
  private key = new DirectionalLight(new Color('#ffffff'), 1)
  private rim = new DirectionalLight(new Color('#7fd6ff'), 0.6)
  private fog = new Fog(new Color('#000000'), 20, 60)
  private sky = new Color('#000000')

  // ── Sets ──
  private streetSet = new Group()
  private street: Street
  private runner: Rig
  private runnerRoot = new Group()
  private runMotion = newMotion(7)
  private trooper: Rig
  private trooperRoot = new Group()
  private drones: Rig[] = []
  private droneRoots: Group[] = []
  private chargeRing: Mesh
  private shotBall: Mesh
  private eyeStreak: Mesh

  // Everything after the cold open streams in (see the constructor), so these
  // are assigned by their build jobs.
  private valleySet = new Group()
  private valley!: Diorama
  private vexHolo!: Mesh
  private vexMat!: MeshBasicMaterial

  private cutinSet = new Group()
  private blaze!: Rig

  private labSet = new Group()
  private pad!: PadMesh
  private fluxCap!: StasisCapsule
  private gaussCap!: StasisCapsule
  private sleeper!: Rig
  private sleeperRoot = new Group()
  private gauss!: GaussRig
  private gaussRoot = new Group()
  private gp = newGaussPose()
  private pip!: Rig
  private pipRoot = new Group()
  private holo!: Diorama
  private holoBeam!: Mesh
  private disc!: Mesh
  private alarm: MeshBasicMaterial[] = []
  private armCrackle = newCrackle(10)
  private glassCrackle = newCrackle(14)
  private beamGlow!: Mesh
  /** The sets still to build, in shot order, and how many are done. */
  private jobs: Array<() => Group> = []
  private jobAt = 0
  private readonly low: boolean
  /** Atlas: at Flux's shoulder in the cold open; out of his chest disc and
   *  into the top left of his view from the wake-up on. */
  private atlasStreet!: Rig
  private atlasLab!: Rig
  private camPos = new Vector3()
  private camLook = new Vector3()

  constructor(opts: IntroOptions = {}) {
    this.opts = opts
    this.low = (opts.quality ?? sceneQuality()) === 'low'
    this.fx = new Particles(this.low ? 220 : 500)
    const s = this.scene
    s.background = this.sky
    s.fog = this.fog
    this.key.position.set(0.6, 1, 0.9)
    this.rim.position.set(-1, 0.6, -0.8)
    s.add(this.hemi, this.key, this.rim, this.fx.points)

    // ── 0 · The neon street ──
    this.street = buildStreet({ low: this.low })
    this.streetSet.add(this.street.root)
    this.runner = buildHero(opts.colors)
    this.runnerRoot.add(this.runner.root)
    this.streetSet.add(this.runnerRoot)
    this.trooper = buildTrooper()
    this.trooperRoot.add(this.trooper.root)
    this.streetSet.add(this.trooperRoot)
    for (let k = 0; k < 2; k++) {
      const d = buildHeli()
      const r = new Group()
      r.add(d.root)
      this.drones.push(d)
      this.droneRoots.push(r)
      this.streetSet.add(r)
    }
    this.chargeRing = new Mesh(torus(0.16, 0.03, 6, 24), additive(PAL.heroPlasma, 0.9))
    this.shotBall = new Mesh(sph(0.2, 14, 10), additive(PAL.heroPlasmaHot, 1))
    this.eyeStreak = new Mesh(cap(0.03, 1.2, 6, 2), additive(PAL.heroPlasma, 0.55))
    this.streetSet.add(this.chargeRing, this.shotBall, this.eyeStreak)
    // Atlas, flying at his shoulder: the cold open is a flash-forward.
    this.atlasStreet = buildAtlas()
    this.streetSet.add(this.atlasStreet.root)
    this.streetSet.position.copy(STREET_AT)
    s.add(this.streetSet)

    // The loader builds only the cold open's street: it is all the first
    // 3.5 s show. The other sets stream in one per frame while it plays
    // (`streamSets`), and a shot that needs one not built yet builds it
    // first (`needSets`), so a skip never shows a missing set.
    this.jobs = [
      () => this.buildValley(),
      () => this.buildCutin(),
      () => this.buildLab(),
      () => this.buildCast(),
      () => this.buildHolo()
    ]
  }

  /** Build the next set (one per frame), and compile its materials now,
   *  while the cold open plays, rather than on its first frame. */
  private streamSets(): void {
    if (this.jobAt >= this.jobs.length) return
    const set = this.jobs[this.jobAt++]!()
    // Shown or not yet, compile it now (compile skips hidden objects).
    const was = set.visible
    set.visible = true
    try { getRenderer().compile(set, this.camera, this.scene) } catch { /* compiles on first draw */ }
    set.visible = was
  }

  /** Make sure the first `n` sets exist. */
  private needSets(n: number): void {
    while (this.jobAt < Math.min(n, this.jobs.length)) this.jobs[this.jobAt++]!()
  }

  private buildValley(): Group {
    const s = this.scene
    this.valley = buildDiorama({ low: this.low })
    this.valleySet.add(this.valley.root)
    this.vexMat = new MeshBasicMaterial({
      map: vexFaceTexture(), transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, toneMapped: false
    })
    this.vexHolo = new Mesh(new PlaneGeometry(7.2, 4.5), this.vexMat)
    this.vexHolo.position.set(this.valley.spireTip.x, this.valley.spireTip.y + 3.4, this.valley.spireTip.z)
    this.valleySet.add(this.vexHolo)
    this.valleySet.position.copy(VALLEY_AT)
    s.add(this.valleySet)
    return this.valleySet
  }

  private buildCutin(): Group {
    const s = this.scene
    this.blaze = buildBlazeMaster()
    this.cutinSet.add(this.blaze.root)
    const back = new Mesh(new PlaneGeometry(8, 8), additive('#ff5a1f', 0.35))
    back.position.set(0, 1.4, -1.5)
    this.cutinSet.add(back)
    this.cutinSet.position.copy(CUTIN_AT)
    s.add(this.cutinSet)
    return this.cutinSet
  }

  private buildLab(): Group {
    this.labSet.add(buildLabSet())
    this.pad = buildTeleporter(THEMES.scrapyard)
    ;(this.pad.ringMat as MeshBasicMaterial).opacity = 0.12
    this.labSet.add(this.pad.root)
    // The alarm: a red strip over each of the dome's glow strips.
    for (let k = 0; k < 11; k++) {
      const a = Math.PI + (k / 10) * Math.PI
      const m = additive('#ff2036', 0)
      const strip = new Mesh(cap(0.1, 3.3, 8, 2), m)
      strip.position.set(Math.cos(a) * 7.85, 3.2, Math.sin(a) * 7.85)
      this.labSet.add(strip)
      this.alarm.push(m)
    }
    this.labSet.add(this.armCrackle, this.glassCrackle)
    this.scene.add(this.labSet)
    return this.labSet
  }

  private buildCast(): Group {
    const opts = this.opts
    this.fluxCap = buildStasisCapsule()
    this.fluxCap.root.position.copy(FLUX_CAP)
    // Its lever to the front, where Gauss stands (and out of his view).
    this.fluxCap.root.rotation.y = -Math.PI / 2
    this.gaussCap = buildStasisCapsule()
    this.gaussCap.root.position.copy(GAUSS_CAP)
    // Its lever to the back, its heartbeat light toward Flux as he wakes.
    this.gaussCap.root.rotation.y = Math.PI / 2
    this.labSet.add(this.fluxCap.root, this.gaussCap.root)
    this.sleeper = buildHero(opts.colors)
    this.sleeperRoot.add(this.sleeper.root)
    this.sleeperRoot.position.set(FLUX_CAP.x, 0.34, FLUX_CAP.z)
    this.labSet.add(this.sleeperRoot)
    this.gauss = buildGauss()
    this.gaussRoot.add(this.gauss.root)
    this.labSet.add(this.gaussRoot)
    this.pip = buildPip()
    this.pipRoot.add(this.pip.root)
    this.labSet.add(this.pipRoot)
    this.disc = new Mesh(paint(rcyl(0.07, 0.02, 0.008, 16), '#ffffff'), additive(PAL.glowCyan, 1))
    this.labSet.add(this.disc)
    this.beamGlow = new Mesh(new CylinderGeometry(0.95, 0.95, 4, 28, 1, true), additive(PAL.glowCyan, 0))
    this.beamGlow.position.y = 2.3
    this.labSet.add(this.beamGlow)
    this.atlasLab = buildAtlas()
    this.atlasLab.root.visible = false
    this.labSet.add(this.atlasLab.root)
    return this.labSet
  }

  private buildHolo(): Group {
    this.holo = buildDiorama({ holo: true, low: this.low })
    this.holo.root.scale.setScalar(HOLO_SCALE)
    this.holo.root.position.copy(HOLO_AT)
    this.holo.root.rotation.y = 0.5
    this.labSet.add(this.holo.root)
    this.holoBeam = new Mesh(new CylinderGeometry(0.62, 0.02, 1, 20, 1, true), additive(PAL.glowCyan, 0.12))
    this.labSet.add(this.holoBeam)
    return this.labSet
  }

  enter(): void {
    resetCine()
    cine.on = true
    setSkipHandler(() => this.skip())
    this.started = true
    // The score ("Wake-Up Call", `audio/songs.ts`) follows this clock: if the
    // audio only unlocks later (the first tap), it joins at the shot on screen.
    setSongStartHint((id) => (id === 'intro' ? this.t : 0))
    setMusicTrack('intro')
    this.opts.onStart?.()
  }

  /** The player skipped (the glyph, a tap on it, `Esc`). Counts from `SKIP_AFTER`. */
  skip(): void {
    if (this.ended || this.t < SKIP_AFTER) return
    // Straight to the flash: the handover shows the white frame and the logo,
    // never a cut back into the middle of a shot.
    this.t = Math.max(this.t, FLASH_FULL)
    this.end(true)
  }

  /** End it now, without the end callback (the owner has moved on). */
  abort(): void {
    if (this.ended) return
    this.ended = true
    setSkipHandler(null)
    setSongStartHint(null)
    resetCine()
  }

  get isEnded(): boolean {
    return this.ended
  }

  private end(skipped: boolean): void {
    if (this.ended) return
    this.ended = true
    cine.skip = false
    cine.vex = ''
    setSkipHandler(null)
    setSongStartHint(null)
    this.opts.onEnd?.(skipped)
  }

  update(dt: number, first = true): void {
    if (!this.started || this.ended) return
    if (first) this.streamSets()
    const t0 = this.t
    this.t = Math.min(INTRO_END, this.t + dt)
    // Atlas's recordings load on demand, a moment before each line.
    for (const e of eventsBetween(t0 + VOICE_LEAD, this.t + VOICE_LEAD)) {
      if (e.kind === 'atlas') prefetchVoice(`story.atlas.${e.key}`)
    }
    for (const e of eventsBetween(t0, this.t)) {
      switch (e.kind) {
        case 'sfx': sfx(e.name, 0, e.gain ?? 1); break
        case 'line': cine.line = e.shot; break
        case 'atlas':
          cine.atlas = e.key
          cine.atlasSeq++
          cineLive.atlasAt = e.at
          // Its recorded voice, if one was dropped in (else the caption only).
          playVoice(`story.atlas.${e.key}`)
          break
        case 'vex': cine.vex = e.key; break
        case 'music': if (!this.opts.replay) setMusicTrack(e.track); break
      }
    }
    const skipNow = this.t >= SKIP_AFTER
    if (cine.skip !== skipNow) cine.skip = skipNow
    this.emit(dt)
    this.fx.update(dt)
    if (this.t >= INTRO_END) this.end(false)
  }

  /** Scripted particles: the flame jet, the charge, the steam, the frost, the beam. */
  private emit(dt: number): void {
    const t = this.t
    const S = STREET_AT
    const st = streetTime(t)
    if (t < FREEZE_AT) {
      if (st > 1.55 && st < 2.3) {
        for (let k = 0; k < 4; k++) {
          this.fx.emit({
            x: S.x - 4.4, y: S.y + 0.9 + (Math.random() - 0.5) * 0.4, z: S.z - 8.2 + (Math.random() - 0.5) * 0.4,
            vx: 9 + Math.random() * 4, vy: (Math.random() - 0.3) * 1.5, vz: (Math.random() - 0.5) * 1.5,
            color: Math.random() < 0.5 ? '#ff7a1f' : '#ffd84a', size: 0.7, sizeEnd: 1.4, life: 0.55, drag: 1.5
          })
        }
      }
      if (st > 1.9 && st < 2.6 && Math.random() < dt * 40) {
        const m = this.chargeRing.position
        const a = Math.random() * Math.PI * 2
        this.fx.emit({ x: S.x + m.x + Math.cos(a) * 0.6, y: S.y + m.y + Math.sin(a) * 0.6, z: S.z + m.z, vx: -Math.cos(a) * 2, vy: -Math.sin(a) * 2, color: PAL.heroPlasma, size: 0.08, sizeEnd: 0.02, life: 0.3 })
      }
    }
    if (t > LEVER_AT + 0.05 && t < LEVER_AT + 0.9) {
      for (let k = 0; k < 3; k++) {
        const a = Math.random() * Math.PI * 2
        this.fx.emit({ x: FLUX_CAP.x + Math.cos(a) * 0.7, y: 0.4, z: FLUX_CAP.z + Math.sin(a) * 0.7, vx: Math.cos(a) * 1.5, vy: 1.5 + Math.random() * 1.5, vz: Math.sin(a) * 1.5, color: '#e8f4ff', size: 0.35, sizeEnd: 0.9, life: 0.9, drag: 1.2 })
      }
    }
    if (t > FROST_FROM && t < FROST_TO + 0.2 && Math.random() < dt * 30) {
      const a = Math.random() * Math.PI * 2
      this.fx.emit({ x: GAUSS_CAP.x + Math.cos(a) * 0.66, y: 0.4 + ramp(FROST_FROM, FROST_TO, t) * 2.2, z: GAUSS_CAP.z + Math.sin(a) * 0.66, vy: 0.3, color: '#dff6ff', size: 0.07, sizeEnd: 0.01, life: 0.5 })
    }
    if (t > BEAM_RISE && Math.random() < dt * 30) {
      const a = Math.random() * Math.PI * 2
      this.fx.emit({ x: Math.cos(a) * 0.8, y: 0.4, z: Math.sin(a) * 0.8, vy: 3 + Math.random() * 2, color: PAL.glowCyan, size: 0.1, sizeEnd: 0.02, life: 0.8 })
    }
  }

  render(alpha: number, dt: number): void {
    const t = this.ended || !this.started ? this.t : Math.min(INTRO_END, this.t + alpha * STEP)
    const shot = shotIndexAt(t)
    if (this.started) this.needSets(shot === 1 ? 2 : shot >= 2 ? this.jobs.length : 0)
    overlayAt(t, cineLive)
    cineLive.t = t
    const cutin = t >= CUTIN_FROM && t < CUTIN_TO
    // Only the live set is drawn (before the first live frame: all of them,
    // for the precompile).
    if (this.started) {
      this.streetSet.visible = shot === 0
      this.valleySet.visible = shot === 1 && !cutin
      this.cutinSet.visible = cutin
      this.labSet.visible = shot >= 2
    }
    const cam = this.camera
    const pos = this.camPos
    const look = this.camLook
    let hfov = 70
    if (shot === 0) hfov = this.renderStreet(t, pos, look)
    else if (shot === 1) hfov = cutin ? this.renderCutin(t, pos, look) : this.renderValley(t, pos, look)
    else hfov = this.renderLab(t, dt, pos, look)
    this.frame(pos, look, hfov)
    cam.position.copy(pos)
    cam.lookAt(look)
    cam.updateProjectionMatrix()
    this.anchors(shot, cutin)
    // The tutorial builds behind the cutscene, and its GPU warm-up renders
    // into an off-screen target across async slices: draw to the screen
    // regardless, and hand its target back.
    const r = getRenderer()
    const prev = r.getRenderTarget()
    r.setRenderTarget(null)
    r.clear()
    r.render(this.scene, cam)
    r.setRenderTarget(prev)
    tickHud(dt)
  }

  /**
   * Hold a shot's framing in any orientation: the keys give a horizontal
   * field of view; a tall screen gets the vertical one that keeps that width,
   * and past a sane lens the camera backs off along its view instead.
   */
  private frame(pos: Vector3, look: Vector3, hfov: number): void {
    const cam = this.camera
    const aspect = Math.max(0.2, cam.aspect)
    // A tall screen keeps most of the width, not all of it: the shots are
    // staged round their middle, and backing off far enough to keep the
    // edges would shrink the subject to a speck.
    const crop = aspect < 1 ? 0.72 + 0.28 * aspect : 1
    const th = Math.tan((hfov * crop * Math.PI) / 360)
    let v = (2 * Math.atan(th / aspect) * 180) / Math.PI
    const MAX_V = 88
    if (v > MAX_V) {
      const back = th / aspect / Math.tan((MAX_V * Math.PI) / 360)
      _a.copy(pos).sub(look).multiplyScalar(back)
      pos.copy(look).add(_a)
      // Never back down through the floor.
      pos.y = Math.max(pos.y, 0.25)
      v = MAX_V
    }
    cam.fov = Math.max(30, v)
  }

  private light(sky: string, ground: string, hemi: number, key: string, keyI: number, rim: string, rimI: number, fogNear: number, fogFar: number): void {
    this.sky.set(sky)
    this.fog.color.set(sky)
    this.fog.near = fogNear
    this.fog.far = fogFar
    this.hemi.color.set(key)
    this.hemi.groundColor.set(ground)
    this.hemi.intensity = hemi
    this.key.color.set(key)
    this.key.intensity = keyI
    this.rim.color.set(rim)
    this.rim.intensity = rimI
  }

  // ─── 0 · Cold open ─────────────────────────────────────────────────────────

  private renderStreet(t: number, pos: Vector3, look: Vector3): number {
    const st = streetTime(t)
    // Fog in the skyline's haze: the far street melts into the city.
    this.light(STREET_HAZE, '#1a0f2a', 0.85, '#ff7ad8', 0.7, '#3ff4ff', 1.1, 14, 62)
    this.street.animate(st)
    // Flux: runs at the camera, slides under the swing, plants, charges.
    const R = this.runner
    const run = st < 1.1
    const slideK = ramp(1.1, 1.2, st) * (1 - ramp(1.5, 1.7, st))
    let z: number
    if (st < 1.1) z = -16 + 6.8 * st
    else if (st < 1.6) z = -8.52 + (1 - Math.pow(1 - (st - 1.1) / 0.5, 2)) * 4.92
    else z = -3.6
    const turn = ramp(1.6, 1.9, st)
    this.runnerRoot.position.set(0.15 * slideK, -0.28 * slideK, z)
    this.runnerRoot.rotation.set(-0.35 * slideK + 0.18 * (run ? 1 : 0), Math.PI * turn, 0)
    const m = this.runMotion
    m.walk = run ? 1 : 0.2
    m.phase = st * 12
    m.stride = m.phase
    animateHeroWalk(R, m, st)
    if (slideK > 0) {
      pose(R, 'hipL', -1.45 * slideK, 0, -0.05)
      pose(R, 'kneeL', 0.2 * slideK, 0, 0)
      pose(R, 'hipR', -0.5 * slideK, 0, 0.05)
      pose(R, 'kneeR', 1.7 * slideK, 0, 0)
      pose(R, 'chest', -0.35 * slideK, 0, 0)
      pose(R, 'shoulderL', 0.6 * slideK, 0, -0.6 * slideK)
    }
    const aim = ramp(1.75, 2.0, st)
    if (aim > 0) {
      pose(R, 'shoulderR', -1.5 * aim, 0, 0.12)
      pose(R, 'elbowR', -0.05, 0, 0)
      pose(R, 'hipL', -0.35 * aim, 0, -0.08)
      pose(R, 'hipR', 0.3 * aim, 0, 0.08)
      pose(R, 'kneeL', 0.35 * aim, 0, 0)
      pose(R, 'chest', 0.05, 0.2 * aim, 0)
    }
    // The charge ring at the muzzle, then the shot a hand's width off the shield.
    this.streetSet.updateMatrixWorld(true)
    const ry = Math.PI * turn
    const muzzle = R.bones.elbowR!.getWorldPosition(_a).sub(this.streetSet.position)
      .add(_b.set(Math.sin(ry), 0, Math.cos(ry)).multiplyScalar(0.38))
    const charge = st > 1.9 && st < 2.62 ? ramp(1.9, 2.55, st) : 0
    this.chargeRing.visible = charge > 0
    this.chargeRing.position.copy(muzzle)
    this.chargeRing.rotation.set(0, ry, st * 9)
    this.chargeRing.scale.setScalar(0.6 + 2.2 * charge)
    const shield = _b.set(0.55, 0.75, -6.0)
    const fly = st >= 2.6 ? clamp01((st - 2.6) / 0.1) * 0.88 : -1
    this.shotBall.visible = fly >= 0
    if (fly >= 0) this.shotBall.position.copy(muzzle).lerp(shield, fly)
    this.shotBall.scale.setScalar(1 + Math.sin(t * 50) * 0.08)
    // Amber streaks off his visor while he runs.
    this.eyeStreak.visible = st < 1.6
    this.eyeStreak.position.copy(R.bones.head!.getWorldPosition(_a)).sub(this.streetSet.position).add(_d.set(0, 0.02, -0.75))
    this.eyeStreak.rotation.set(Math.PI / 2, 0, 0)
    // Atlas keeps pace above his shoulder (it rewinds with the tape, too).
    const A = this.atlasStreet
    A.root.position.set(this.runnerRoot.position.x + 0.75, 1.75 + Math.sin(st * 3) * 0.08, this.runnerRoot.position.z - 0.7 * Math.cos(ry))
    A.root.rotation.set(0, ry, 0)
    animateAtlas(A, st, this.atlasTalk(t))
    // The Shield Trooper: steps out of the alley, swings, turns to face him.
    const step = ramp(0.85, 1.2, st)
    this.trooperRoot.position.set(3.9 - 3.2 * step, 0, -6.4)
    this.trooperRoot.rotation.y = -Math.PI / 2 + (Math.PI / 2) * ramp(1.45, 1.9, st)
    poseTrooper(this.trooper, 0.4 + 0.6 * ramp(1.1, 1.3, st), 0, st, step < 1 && step > 0 ? 1 : 0)
    // Two Rotor Drones swoop in overhead.
    this.drones.forEach((d, i) => {
      const s = i ? 1 : -1
      const k = ramp(0.25, 1.3, st)
      this.droneRoots[i]!.position.set(s * (2.8 - 0.9 * k) + Math.sin(st * 2 + i) * 0.2, 7 - 3.4 * k + Math.sin(st * 3 + i) * 0.15, 3 - 10.5 * k)
      this.droneRoots[i]!.rotation.y = Math.PI + s * 0.3
      poseHeli(d, st, 0.35 * (1 - k), st * 40)
    })
    const hfov = camAt(STREET_CAM, st, pos, look)
    pos.add(STREET_AT)
    look.add(STREET_AT)
    return hfov
  }

  // ─── 1 · The valley and the Red Signal ─────────────────────────────────────

  private renderValley(t: number, pos: Vector3, look: Vector3): number {
    const reach = ringReach(t)
    const flash = t >= SPIRE_FLASH ? 0.5 + 0.5 * Math.sin((t - SPIRE_FLASH) * 30) : 0
    this.light(
      reach > 0.3 ? '#3a1630' : '#2b2350', '#1a1030', 1.0,
      reach > 0.3 ? '#ff9a9a' : '#ffd7a8', 1.0, '#7fd6ff', 0.5, 40, 120
    )
    this.valley.animate(t)
    this.valley.setSignal(reach, t >= SPIRE_FLASH ? Math.max(flash, reach > 0 ? 1 : 0) : 0)
    // Vex's face glitches on over the Spire, and stays, grinning.
    const on = ramp(VEX_ON, VEX_ON + 0.2, t)
    const glitch = t < VEX_ON + 0.35 || Math.sin(t * 17) > 0.93
    this.vexMat.opacity = on * (glitch ? 0.4 + Math.random() * 0.6 : 0.85 + Math.sin(t * 40) * 0.08)
    this.vexHolo.visible = on > 0
    this.vexHolo.scale.set(1 + (glitch ? (Math.random() - 0.5) * 0.3 : 0), Math.max(0.01, on) * (glitch ? 0.8 + Math.random() * 0.3 : 1), 1)
    const hfov = camAt(VALLEY_CAM, t, pos, look)
    pos.add(VALLEY_AT)
    look.add(VALLEY_AT)
    this.vexHolo.lookAt(pos)
    return hfov
  }

  private renderCutin(t: number, pos: Vector3, look: Vector3): number {
    this.light('#1a0604', '#200806', 1.1, '#ffb070', 1.2, '#ff3040', 0.9, 4, 20)
    const k = (t - CUTIN_FROM) / (CUTIN_TO - CUTIN_FROM)
    poseBoss(this.blaze, 'blazeMaster', t, 'idle', 0)
    // Gold eyes flicker, then lock red.
    const red = k > 0.55 || (k > 0.15 && Math.sin(t * 70) > 0)
    this.blaze.glowMaterial.color.set(red ? '#ff2036' : '#ffffff')
    this.cutinSet.updateMatrixWorld(true)
    this.blaze.bones.head!.getWorldPosition(look)
    look.y += 0.08
    pos.copy(look).add(_a.set(0.12, 0.02, 0.95 - 0.15 * k))
    return 42
  }

  // ─── 2–5 · The lab ─────────────────────────────────────────────────────────

  private renderLab(t: number, dt: number, pos: Vector3, look: Vector3): number {
    const fp = t >= 11
    // Red alarm light, closing in panel by panel; calmer once Gauss is frozen.
    const panels = 11 * ramp(6.5, 8.4, t)
    const calm = ramp(10.6, 11.5, t)
    const pulse = 0.5 + 0.5 * Math.sin(t * 6)
    this.alarm.forEach((m, k) => {
      m.opacity = (k < panels ? 0.75 : 0) * (1 - 0.65 * calm) * (0.7 + 0.3 * pulse)
    })
    if (calm < 1) {
      this.light('#1c0a14', '#2a0c18', 0.9 + 0.2 * pulse, '#ff6a78', 0.9, '#7fd6ff', 0.45, 16, 44)
    } else {
      this.light('#0e1c3f', '#1a2340', 1.0, '#dbe8ff', 1.0, '#7fd6ff', 0.7, 18, 46)
      this.hemi.color.set('#c8d8ff')
    }
    // Flux asleep in his capsule: eye-lights and reactor down to embers.
    animateHeroIdle(this.sleeper, t * 0.3)
    pose(this.sleeper, 'head', 0.3, 0, 0)
    this.sleeper.glowMaterial.color.setScalar(0.1)
    this.sleeperRoot.visible = !fp
    // His capsule: the lever, the glass sliding down.
    const lever = ramp(LEVER_AT - 0.2, LEVER_AT, t)
    this.fluxCap.setLever(lever)
    this.fluxCap.setOpen(ramp(LEVER_AT + 0.1, LEVER_AT + 0.7, t))
    // (In first person the camera stands inside it: no wash over the view.)
    this.fluxCap.setInner('#ff4050', fp ? 0 : 0.12)
    this.fluxCap.setFrost(0)
    this.fluxCap.setHeart(0)
    // Gauss's capsule: open until she steps in, then sealed and frosting.
    this.gaussCap.setOpen(t < SEAL_AT ? 1 : 1 - ramp(SEAL_AT, SEAL_AT + 0.15, t))
    this.gaussCap.setFrost(ramp(FROST_FROM, FROST_TO, t))
    const hb = heartbeat(t)
    this.gaussCap.setHeart(hb)
    this.gaussCap.setLever(ramp(SEAL_AT - 0.1, SEAL_AT, t))
    this.gaussCap.setInner(t < FROST_FROM ? '#ff4050' : '#5b8cff', t < FROST_FROM ? 0.08 : 0.1 + 0.1 * hb)
    // Gauss: at Flux's capsule (disc, crackle, lever), then into her own.
    const gp = this.gp
    const walk = ramp(9.45, 9.9, t)
    const from = GAUSS_AT
    this.gaussRoot.position.set(from.x + (GAUSS_CAP.x - from.x) * walk, 0.34 * ramp(9.75, 9.9, t), from.z + (GAUSS_CAP.z - from.z) * walk)
    this.gaussRoot.rotation.y = 2.1 * (1 - walk)
    gp.disc = t < DISC_TO + 0.2 ? ramp(7.1, DISC_FROM + 0.1, t) : 1 - ramp(DISC_TO + 0.2, DISC_TO + 0.5, t)
    gp.stagger = t > 8.0 && t < 9.5 ? ramp(8.0, 8.2, t) * (1 - ramp(8.5, 9.0, t)) : 0
    gp.look = t < 7.2 ? -0.2 : t < 8.1 ? 0.4 : t < 8.3 ? -0.7 : 0.3
    gp.lever = t < 9.4 ? ramp(8.2, LEVER_AT, t) : 0
    gp.slap = ramp(9.85, 9.98, t) * (1 - ramp(10.1, 10.35, t))
    gp.asleep = ramp(10.3, 10.9, t)
    poseGauss(this.gauss, gp, t)
    setGaussGlow(this.gauss, 1 - gp.asleep, hb)
    this.labSet.updateMatrixWorld(true)
    // The Atlas disc: from her hand into his chest port, where it stays lit.
    this.gauss.bones.elbowL!.getWorldPosition(_a)
    _a.y -= 0.25
    this.sleeper.bones.chest!.getWorldPosition(_b)
    _b.add(_d.set(0, 0.07, 0.19))
    const into = ramp(DISC_FROM - 0.1, DISC_TO - 0.05, t)
    this.disc.visible = t > 7.0 && !fp
    this.disc.position.copy(_a).lerp(_b, into)
    this.disc.rotation.set(Math.PI / 2, 0, 0)
    ;(this.disc.material as MeshBasicMaterial).opacity = 0.7 + 0.3 * Math.sin(t * 12)
    // The red crackle: up her arm, then at the frost, where it dies.
    const arm = t > 7.3 && t < 8.9
    this.armCrackle.visible = arm && Math.random() < 0.85
    if (arm) {
      this.gauss.bones.shoulderL!.getWorldPosition(_b)
      const climb = ramp(7.3, 8.1, t)
      crackle(this.armCrackle, _a, _c.copy(_a).lerp(_b, climb), 0.09)
    }
    const glass = t > 9.95 && t < 10.55
    this.glassCrackle.visible = glass && Math.random() < 0.8 * (1 - ramp(10.35, 10.55, t)) + 0.1
    if (glass) {
      const top = 0.4 + 2.2 * ramp(FROST_FROM, FROST_TO, t)
      _a.set(GAUSS_CAP.x + 0.25, 0.1, GAUSS_CAP.z + 0.75)
      _b.set(GAUSS_CAP.x + 0.1, Math.max(0.5, top - 0.1), GAUSS_CAP.z + 0.68)
      crackle(this.glassCrackle, _a, _b, 0.18)
    }
    // Pip: hiding behind the console, then in Flux's face, then the hologram.
    this.renderPip(t)
    // The hologram of the valley: five sectors red, the Fortress shielded.
    const holoOn = ramp(HOLO_FROM, HOLO_FROM + 0.3, t) * (1 - ramp(TURN_FROM + 0.2, TURN_FROM + 0.45, t))
    this.holo.root.visible = holoOn > 0.01
    this.holo.root.scale.set(HOLO_SCALE, HOLO_SCALE * holoOn, HOLO_SCALE)
    this.holo.animate(t)
    this.holo.setHolo(t, t >= SCRAP_BLINK ? 1 : 0)
    this.holoBeam.visible = holoOn > 0.01
    if (this.holoBeam.visible) {
      this.pipRoot.getWorldPosition(_a)
      _b.copy(HOLO_AT)
      this.holoBeam.position.copy(_a).lerp(_b, 0.5)
      this.holoBeam.scale.set(holoOn, _a.distanceTo(_b), holoOn)
      this.holoBeam.lookAt(_b)
      this.holoBeam.rotateX(-Math.PI / 2)
    }
    // The pad: its ring spins up, the beam column rises.
    const spin = ramp(STEP_FROM, BEAM_RISE, t)
    this.pad.ring.rotation.y += dt * (0.5 + 12 * spin)
    const beam = ramp(BEAM_RISE, FLASH_FULL, t)
    ;(this.pad.ringMat as MeshBasicMaterial).opacity = 0.12 + 0.6 * beam
    ;(this.beamGlow.material as MeshBasicMaterial).opacity = 0.25 * beam
    this.beamGlow.scale.set(1, Math.max(0.01, beam), 1)
    this.beamGlow.position.y = 0.3 + 2 * beam
    // The camera.
    if (!fp) {
      if (t < 9.5) {
        if (t >= DISC_FROM && t < DISC_TO) return camAt(DISC_CAM, t, pos, look)
        return camAt(LAB_CAM, t, pos, look)
      }
      return camAt(SAFE_CAM, t, pos, look)
    }
    // First person: his eye, then the step onto the pad.
    const walkK = ramp(STEP_FROM, STEP_TO, t)
    pos.copy(EYE).lerp(PAD_EYE, walkK)
    pos.y += Math.sin(walkK * Math.PI * 2) * 0.03
    // The wake-up: a small dip and rise as the eyes open.
    pos.y += -0.05 * (1 - ramp(11.6, 12.4, t))
    fpLookAt(t, look)
    this.placeAtlasFp(t, pos, look)
    return 82
  }

  /** Atlas is talking (a caption is up). */
  private atlasTalk(t: number): number {
    const age = t - cineLive.atlasAt
    return age >= 0 && age < 1.8 ? 1 : 0
  }

  /**
   * First person: Atlas rises out of Flux's chest disc as the HUD boots and
   * settles in the top left of his view, where it stays with him.
   */
  private placeAtlasFp(t: number, pos: Vector3, look: Vector3): void {
    const A = this.atlasLab
    const on = ramp(GLYPH_ON - 0.3, GLYPH_ON + 0.15, t)
    A.root.visible = on > 0.01
    if (!A.root.visible) return
    const f = _a.copy(look).sub(pos).normalize()
    const r = _b.crossVectors(f, _up).normalize()
    const u = _c.crossVectors(r, f)
    // From his chest (below the view) to the top left of it.
    const k = on * on * (3 - 2 * on)
    A.root.position.copy(pos)
      .addScaledVector(f, 0.55 + 0.45 * k)
      .addScaledVector(r, -0.42 * k)
      .addScaledVector(u, -0.55 + 0.82 * k + Math.sin(t * 1.9) * 0.02)
    A.root.scale.setScalar((0.25 + 0.75 * k) * 0.7)
    A.root.lookAt(pos)
    animateAtlas(A, t, this.atlasTalk(t), k)
  }

  private renderPip(t: number): void {
    const P = this.pipRoot
    animatePip(this.pip, t)
    const pop = ramp(PIP_POP - 0.1, PIP_POP + 0.1, t)
    const back = ramp(12.95, 13.35, t)
    if (t < 11) {
      // Behind the right console, only his eye over the top.
      P.position.set(3.5, 1.2 + Math.sin(t * 3) * 0.03, -2.95)
      P.rotation.y = -0.6
      P.scale.setScalar(1)
    } else if (t < STEP_FROM) {
      // In Flux's face, eye huge, then a happy squint; then back to project.
      fpLookAt(t, _a)
      _b.copy(_a).sub(EYE).normalize()
      const near = _c.copy(EYE).addScaledVector(_b, 0.85).add(_d.set(0.05, -0.1, 0))
      P.position.copy(near).lerp(PIP_PROJECT, back)
      P.position.y += (1 - pop) * -0.8 + Math.sin(t * 2.4) * 0.03
      P.lookAt(EYE)
      const sq = t > 12.45 && t < 12.95 ? 0.8 : 1
      const s = 0.3 + 0.7 * pop
      P.scale.set(s, s * sq, s)
      // As the view turns to the pad, he flies ahead to its edge.
      if (t > TURN_FROM) P.position.lerp(PIP_PAD, ramp(TURN_FROM, STEP_FROM, t))
    } else {
      // On the pad's edge, spinning the ring up, his halo spinning with it.
      P.position.copy(PIP_PAD)
      P.position.y += Math.sin(t * 2.4) * 0.04
      P.lookAt(0, 1.4, 0)
      P.scale.setScalar(1)
      pose(this.pip, 'ring', 0, t * (3 + 30 * ramp(STEP_FROM, BEAM_RISE, t)), 0)
    }
    nudge(this.pip, 'body', 0, Math.sin(t * 2.4) * 0.05, 0)
  }

  /** Project the bubble's and the tags' anchors for the layer. */
  private anchors(shot: number, cutin: boolean): void {
    const cam = this.camera
    cam.updateMatrixWorld(true)
    if (shot === 1 && !cutin) {
      this.vexHolo.updateMatrixWorld(true)
      _a.set(2.6, 2.0, 0).applyMatrix4(this.vexHolo.matrixWorld).project(cam)
      cineLive.bubbleX = clamp01((_a.x + 1) / 2)
      cineLive.bubbleY = clamp01((1 - _a.y) / 2)
    }
    if (shot === 4) {
      this.holo.root.updateMatrixWorld(true)
      const f = this.holo.spireTip
      _a.set(f.x, f.y + 1, f.z).applyMatrix4(this.holo.root.matrixWorld).project(cam)
      cineLive.fortX = (_a.x + 1) / 2
      cineLive.fortY = (1 - _a.y) / 2
      const s = this.holo.scrapyard
      _a.set(s.x, 4, s.z).applyMatrix4(this.holo.root.matrixWorld).project(cam)
      cineLive.scrapX = (_a.x + 1) / 2
      cineLive.scrapY = (1 - _a.y) / 2
    }
  }

  resize(_w: number, h: number): void {
    this.fx.setScale(h * getRenderer().getPixelRatio(), this.camera.fov)
  }

  dispose(): void {
    if (!this.ended) setSkipHandler(null)
    resetCine()
    this.fx.dispose()
    this.scene.traverse((o) => {
      const m = o as Mesh
      if (m.geometry) m.geometry.dispose()
    })
  }
}
