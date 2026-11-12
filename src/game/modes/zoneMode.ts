import { campPending, CAMP_NEXT, CAMP_NEXT_TIP, CAMP_SPEAKER, HELP_CALLS } from '../sim/camp'
import { campLessonPending } from '../coach/campLesson'
import { trackFtue } from '@/use/useAnalytics'
import { AmbientLight, Color, Frustum, Matrix4, Scene, Sphere, Vector2, Vector3, Vector4, type Group, type InstancedMesh, type Line, type Material, type Mesh, type Object3D, type Points, type ShaderMaterial, type SkinnedMesh } from 'three'
import { ArenaCrowd } from '../gfx/arenaCrowd'
import { nextMilestone } from '../data/arena'
import type { GameMode } from '../engine/app'
import { FollowCam, CAM_FOV, CAM_PITCH } from '../engine/camera'
import { ShakeBudget, critTrauma } from '../engine/shakeBudget'
import { consumeEdges, type Input } from '../engine/input'
import { getRenderer } from '../engine/renderer'
import { createSlicer, yieldToBrowser, type Slice } from '../engine/slicer'
import { sceneQuality } from '../engine/quality'
import { sfx, type SfxName } from '../audio/sfx'
import { ENEMY_BY_ID, MINIONS } from '../data/enemies'
import { SPIRIT_COLOR } from '../sim/spawn'
import { newPressure, sessionPressure, sessionRampPool, setSessionPressure, setSessionRampPool } from '../sim/pressure'
import { BOSS_SCRIPTS } from '../sim/bosses'
import { ACTIVE_SLOTS, SKILL_BY_ID } from '../data/skills'
import { IMPACT_SOUND, castSoundOf, skillElement } from '../data/skillSounds'
import { ARENA_WAVES, CAMPAIGN_HARDER, OPENING, TOWNS, ZONES, unitLevelTier, type ThemeId, type TownId } from '../data/zones'
import { ITEM_BY_ID, type ZoneId } from '../data/items'
import { applyPlan, populateTown, populateZone, summonDragonAlly } from '../sim/director'
import { arenaKinds, leaveLadder, leaveVisit } from '../sim/director'
import type { ArenaMod } from '../arenaWeek'
import { cellOf, isSolidAt } from '../sim/grid'
import { castSkill, createHero, cycleTarget, orderAttack, orderMove, setStick, slotState, usePotion } from '../sim/hero'
import { stepSim } from '../sim/step'
import { grantXp, reviveHero } from '../sim/combat'
import { generateArena, generateEncounter, generateZone, type ZonePlan } from '../sim/zoneGen'
import { Sim } from '../sim/world'
import { captureBaseline, restoreSim, snapshotSim, type SimBaseline, type SimSnapshot } from '../sim/snapshot'
import type { DamageType, SimEvent, Unit } from '../sim/types'
import { setCelMood, updateCelFrame, updateSeeThrough } from '../gfx/cel'
import { fxLevel } from '../engine/effectsLadder'
import { BAR_RANK, HealthBars, Markers, barBadge, makeBlobShadow, placeBlobShadow, type BarRank } from '../gfx/markers'
import { clearGround, groundAt, setGround } from '../gfx/ground'
import type { HeightField } from '../sim/ground'
import { blowOf, trackUnit } from '../gfx/combatFx'
import { animate, squash, struck } from '../gfx/rigs/anim'
import { makeRigView, prewarmKinds, prewarmLook, type RigView } from '../gfx/rigs'
import { townLoop } from '../gfx/rigs/townClips'
import { heroLook } from '../gfx/rigs/looks'
import { WallRocks, buildChest, buildTerrain, setZoneFog, type Terrain } from '../gfx/terrain'
import { corruptColors, corruptTheme } from '../gfx/corruption'
import { REBORN, invadedZone } from '../data/invasion'
import { armInvasion, isPylon } from '../sim/invasion'
import { ARENA_PROPS } from '../sim/bosses/kit'
import { DEFENCES, SIEGE_CAP, SIEGE_CAP_LOW, SIEGE_LORD, SIEGE_WAVES, siegeKinds, type DefenceId, type SiegeTier } from '../data/siege'
import { generateSiege } from '../sim/siegeMap'
import { armSiege, buildBlock, buildDefence, skipBuild } from '../sim/siege'
import { SIEGE_PROP_KINDS, SiegeProps } from '../gfx/siegeProps'
import { siegeActions, siegeHud } from '../state/siegeHud'
import { AssaultProps } from '../gfx/assaultProps'
import { RebelProps } from '../gfx/rebelProps'
import { CelebrateProps } from '../gfx/celebrateProps'
import { armCelebration, skipCelebration } from '../sim/celebrate'
import { PARTY_LAYOUT, generateCelebration } from '../sim/celebrateMap'
import { PARTY_S, PARTY_TITLE_AT } from '../data/celebrate'
import { celebrateHud, celebrateActions } from '../state/celebrateHud'
import { assaultActions, assaultHud } from '../state/assaultHud'
import { armAssault, assaultHint, skipAssault, skipPanorama } from '../sim/assault'
import { ASSAULT_LAYOUT, generateAssault } from '../sim/assaultMap'
import { PANORAMA_S } from '../data/assault'

import { Vfx } from '../gfx/vfx'
import { NO_STATUSES, StackOrbs } from '../gfx/stackOrbs'
import { SLOW_MO, slowMoScale } from '../gfx/slowMo'
import { LevelProps } from '../gfx/levelProps'
import type { TownView } from '../gfx/townView'
import { loadTownView } from '../gfx/townLoader'
import { prefetchLikely, prefetchNow, queueEarlyArt, warmCampCards } from '../assets/preload'
import { idleTask } from '@/utils/idleQueue'
import { UI_ART } from '../assets/overrides'
import { StillCull } from '../gfx/cull'
import { BAKE_TILE, StillBake } from '../gfx/stillBake'
import { townExitAt } from '../sim/townCells'
import { townSim, townSimReady } from '../sim/townHooks'
import { loadTownSim } from '../sim/townSimLoader'
import { loadTalk } from '../talkLoader'
import { POTION_CD, ROLL_CD, ROLL_DIST, cycleElixir, rollHero, useElixir, useManaPotion } from '../sim/hero'
import { nearChest, orderOpen, pickChest } from '../sim/interact'
import { nearOre, orderMine, pickOre } from '../sim/ores'
import { hud, hudLive, pushHud, sayBark, tickHud, type SkillSlotView, type TextKind } from '../state/hud'
import { CAMEO_TIP, heroBuild, loadoutActive, markTip, profile, TUTORIAL_NODE, tutorialLevelOpen } from '../state/profile'
import { coach, hintGeo, hintPath } from '../coach'
import { emitCrumbs, findChest, finder, peekOffset } from '../coach/nudgeFx'
import { BOARD, BOARD_REACH } from '../townTasks'
import { isDummy, spawnDummy, stepDummy } from '../coach/dummy'
import { armMentor, boostOpeningFoes, stepMentor, syncHeroSkills } from '../coach/mentor'
import { CAMEO_BEAST, CAMEO_HERO, CAMEO_TOWER, armCameo, cameoPlaying, clearCameoUnits, endCameo, stepCameo, tryStartCameo, type CameoState } from '../coach/cameo'
import { INTRO_FIGHT_AT } from '../audio/songs'
import { MENTOR_SKILL } from '../data/mentor'
import { isKitLevel, kitEase } from '../coach/kitEase'
import { grantMercy, stepRelief, TUTORIAL_CHARGED_CAP, potionStopDue, potionStopOver, stepMercy } from '../coach/tutorialAid'
import { setTruce, watchTruce } from '../sim/truce'
import { markRevealUsed } from '../coach/reveal'
import { PREVIEW_FEED } from '../previewFlags'
import { endSceneCue, holdSceneCue, setBossMusic, startSceneCue } from '@/use/useSound'
import { heroStatusView, sameChips, targetStackView } from '../state/statusView'

/**
 * ─── A zone visit ────────────────────────────────────────────────────────────
 *
 * The mode the loop runs while the hero is on a map: a combat zone, a town or
 * the colosseum. It owns nothing of the RULES (that is `sim/`) and nothing of
 * the LOOK (that is `gfx/`); it is the wiring between them and the player:
 *
 *   input  → orders, casts, aims
 *   sim    → events → effects, sound, shake, hit-stop, damage text
 *   render → interpolated rigs, markers, bars, the follow camera
 *   HUD    → a shallow mirror at ≤ 15 Hz, per-frame numbers by direct DOM write
 *
 * The GDD's "juice" numbers (§2.3) are applied here:
 *   hit-stop: time scale 0.01 for 0.04 s (light), 0.08 s (heavy / critical),
 *             0.25 s with a zoom-in (a boss's finishing blow);
 *   shake:    trauma +0.2 on a light hit, +0.6 on a critical or an explosion.
 */

export interface ZoneSetup {
  kind: 'zone' | 'town' | 'arena'
  zone?: ZoneId
  town?: TownId
  theme: ThemeId
  seed: number
  /** Enemy level of the visit. */
  level: number
  difficulty: number
  tutorial?: boolean
  /** A hook on the generated plan before anything is built from it (the intro cuts its stage clear). */
  carve?: (plan: ZonePlan) => void
  ambush?: string | null
  extra?: number
  dragonAlly?: boolean
  /** A random encounter met on the world map: its packs (`generateEncounter`). */
  encounter?: string[][]
  /** The encounter is the caravan's road (#85): guard the cart to the end. */
  escort?: boolean
  /** The treasure map (#89): its pieces lying here, and the X once it is whole. */
  pieces?: string[]
  treasure?: boolean
  /** Somebody is held here in a cage (#100). */
  cage?: boolean
  /** The Hollows' chain gang of gnome diggers (#205): laid while the Goblin King lives. */
  rebels?: boolean
  /** The Hollows' celebration after the Goblin King's answer (#206): how many gnomes the hero freed. */
  celebrate?: { freed: number }
  /** The colosseum's weekly modifier (roadmap #10). */
  arenaMod?: ArenaMod
  /** The zone's invaded version (the afterplay, `data/invasion.ts`): its roster,
   *  ruins, pylons and scars, the corruption's tint, and kills worth more. */
  invaded?: boolean
  /** The Siege of Bastion (afterplay §8): its tier, whether it is the story's
   *  (it cannot be lost), whose turn the fifth wave's captain is, and who
   *  commands the fort (Elder Mara when Oakhaven fell). */
  siege?: { tier: SiegeTier; story: boolean; rotation: number; commander: 'hale' | 'mara' }
  /** The besieged gate before the Hollows' first entry (roadmap #204, `sim/assault.ts`). */
  assault?: boolean
  flags: ReadonlySet<string>
}

/**
 * A visit as a manual save slot keeps it (`state/saveSlots.ts`): a zone's
 * whole state on top of its generation, or — in a town, whose folk are
 * regenerated anyway — just where the hero stood.
 */
export interface VisitResume {
  /** A zone, an encounter or the colosseum: everything that changed. */
  sim?: SimSnapshot
  /** A town: the hero's spot and heading. */
  hero?: { x: number; z: number; facing: number }
  /** The training dummy stood in this visit (it is generated only while
   *  `profile.tips.dummy` is unset, which the visit itself may have set). */
  dummy?: boolean
}

export interface ZoneCallbacks {
  /** The visit is decided (after its closing beat). */
  onEnd(outcome: 'victory' | 'defeat'): void
  /** The hero fell: may Second wind be offered (#18)? True holds the defeat
   *  beat until `secondWind` answers. Absent: never offered. */
  askSecondWind?(): boolean
  /** The hero walked up to a townsperson. */
  onInteract(npcId: string): void
  onPause(): void
  onPanel(panel: 'map' | 'character' | 'inventory' | 'skills'): void
  /** A conversation or a window is open (the truce watchdog, #153). Absent: only this scene's own conversation counts. */
  menuOpen?(): boolean
  /** The finale is won and its beat has passed: may the first-clear hoard be laid out now (the Goblin King's pick)?
   *  True: handled (laid out, or not due); false: something else is on screen, ask again. */
  onFinaleWon?(): boolean
  /** The besieged gate is over: won (both towers down) or skipped (#204). */
  onAssaultEnd?(how: 'won' | 'skipped'): void
  /** The celebration is over (watched to its end, or skipped). */
  onCelebrateEnd?(how: 'watched' | 'skipped'): void
}

/** An enemy's name key: a returning boss of an invaded zone is its Reborn self (§5.8). */
const foeKey = (invaded: boolean, kind: string): string => (invaded && REBORN.has(kind) ? 'invasion.reborn.' + kind : 'enemy.' + kind)

const HIT_STOP_SCALE = 0.01
const HIT_STOP_LIGHT = 0.04
const HIT_STOP_HEAVY = 0.08
const HIT_STOP_BOSS = 0.25
const TRAUMA_LIGHT = 0.2
const TRAUMA_HEAVY = 0.6
/** The cameo's effects (#210) and what each sounds like, at what part of full gain. */
const CAMEO_SOUND: Readonly<Record<string, readonly [SfxName, number]>> = {
  land: ['cameoLand', 0.75], thud: ['cameoLeap', 0.6], roar: ['cameoRoar', 0.62], tower: ['cameoTower', 0.6], shield: ['cameoShield', 0.62],
  shot: ['cameoShot', 0.55], bigShot: ['cameoShot', 0.85], claw: ['cameoClaw', 0.58], leap: ['cameoLeap', 0.5], step: ['cameoStep', 0.5],
  towerOut: ['cameoTowerOut', 0.55]
}
/** The element a blow of a damage type carries, layered under its hit (#74). */
const HIT_ELEMENT: Partial<Record<DamageType, SfxName>> = { fire: 'fire', frost: 'ice', shadow: 'shadow', holy: 'holy', poison: 'poison', acid: 'poison', blood: 'blood', beam: 'beam' }
/** What a swing or a shot sounds like, by what is in the hand (#74): a sword cuts the air, a club pushes it. */
const swingSound = (style: 'melee' | 'ranged' | 'magic', heavy: boolean, v: RigView | undefined): SfxName => {
  if (style === 'magic') return 'cast'
  const held = v?.held ?? 'none'
  if (style === 'ranged') return held === 'bow' || held === 'sling' ? 'shootBow' : 'shoot'
  if (v && v.family !== 'humanoid' && v.family !== 'naga') return v.family === 'dragon' || v.family === 'wyvern' || heavy ? 'swingBlunt' : 'swingDagger'
  switch (held) {
    case 'dagger': return 'swingDagger'
    case 'greatsword':
    case 'axe':
    case 'scythe':
      return 'swingHeavy'
    case 'hammer':
    case 'club':
    case 'none':
    case 'staff':
    case 'cannon':
      return 'swingBlunt'
    default: return heavy ? 'swingHeavy' : 'swing'
  }
}
/** Seconds the world plays on after the outcome, before the result screen. */
const END_BEAT = { victory: 2.1, defeat: 1.8 }
/** Seconds after the finale falls that the first-clear hoard is laid out. */
const HOARD_AT = 2
/** Seconds after the fall that Second wind is offered: the fall reads first. */
const WIND_AT = 1
/** The tip that marks the dodge lesson as taught. */
const DODGE_TIP = 'dodgeLesson'
/** The boss's first charge has wound up this long when the world stops for the dodge. */
const DODGE_STOP_AFTER_S = 0.5
/** The camera rests on the cages this long after the first cry for help, then flies back to the hero. */
const HELP_SHOT_S = 3
const HELP_SHOT_ZOOM = 1.3
/** The world stays still this long after the cage shot, while the view flies back to the hero. */
const HELP_BACK_S = 1.1

interface View {
  v: RigView
  shadow: Mesh
  /** NPCs: the floating marker above their head. */
  pin: Object3D | null
}

/** A conversation's framing: how far the camera closes in on two speakers
 *  (more on an upright phone, whose view is fitted to its narrow width and so
 *  stands far back), and on the hero alone (a decision after a fight). */
const TALK_ZOOM = 0.8
const TALK_ZOOM_TALL = 0.62
const TALK_ZOOM_SOLO = 0.9
/** The dialogue layer puts the list of topics BESIDE the speakers on a short
 *  landscape screen and under them everywhere else (`DialogLayer.vue` has the
 *  same breakpoint): the camera leaves that part of the picture free. */
const TALK_SIDE_MAX_H = 480

/** How an enemy's bar (and its target ring) is framed: by rank, a champion above an elite. */
const barRank = (u: Unit): BarRank =>
  u.rank === 'boss' ? BAR_RANK.boss : u.champion ? BAR_RANK.champion : u.rank === 'elite' ? BAR_RANK.elite : u.rank === 'weak' ? BAR_RANK.minion : BAR_RANK.normal

const ground = { x: 0, z: 0 }
const screen = { x: 0, y: 0 }
const frustum = new Frustum()
const _size = new Vector2()
const _wc = new Vector3()
/** The see-through copies of the rigs' materials, one per kind, alive for the session so their programs are too. */
const SEE_VARIANTS = new Map<string, Material>()
const _view = new Vector4()
/** How far (m) from the hero's start the scenery is warmed with the load; the rest streams in (#190). */
const WARM_NEAR = 44
/** Metres from (x, z) to the nearest edge of a mesh's bounds (0 when inside); a tile of instances or one drawn piece. */
const distanceTo = (m: Mesh, x: number, z: number): number => {
  const inst = m as InstancedMesh
  let s: Sphere | null
  if (inst.isInstancedMesh) { if (!inst.boundingSphere) inst.computeBoundingSphere(); s = inst.boundingSphere } else {
    if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere()
    s = m.geometry.boundingSphere
  }
  if (!s) return -1
  m.updateWorldMatrix(true, false)
  _wc.copy(s.center).applyMatrix4(m.matrixWorld)
  return Math.max(0, Math.hypot(_wc.x - x, _wc.z - z) - s.radius * m.matrixWorld.getMaxScaleOnAxis())
}
const _px = new Uint8Array(4)
const viewProj = new Matrix4()
const bound = new Sphere()

export class ZoneMode implements GameMode {
  readonly scene = new Scene()
  readonly cam = new FollowCam()
  readonly camera = this.cam.camera
  readonly sim: Sim
  readonly plan: ZonePlan
  readonly setup: ZoneSetup
  /** The camp fires (the Hollows, #120): a goblin asleep beside one squats by it. */
  private fires: Array<{ x: number; z: number }> = []
  private input: Input
  private cb: ZoneCallbacks
  private terrain!: Terrain
  private vfx!: Vfx
  /** The charges the hero's skills build, circling him (`gfx/stackOrbs.ts`). */
  private orbs!: StackOrbs
  private critShakes = new ShakeBudget()
  private markers!: Markers
  private bars!: HealthBars
  /** The ground's theme (the intro re-sets the haze for its pulled-back camera). */
  terrainTheme(): Terrain['theme'] { return this.terrain.theme }

  /** No health bars over anyone (the intro's film, #189). */
  hideBars = false
  private walls = new WallRocks()
  /** The still world (scenery tiles, ground, props, houses), culled by its boxes. */
  private still = new StillCull()
  /** The still world merged into a few draws per tile (`gfx/stillBake.ts`, roadmap #151). */
  private baked = new StillBake()
  private bakeTile = BAKE_TILE
  private bakeOn = true
  private bakeStarted = false
  /** The scenery still to be uploaded to the GPU, nearest first (see `warmUp`, `warmStep`). */
  private warmQueue: Object3D[] = []
  private gone = false
  /** See-through copies of materials, held so their programs stay compiled (`warmUp`). */
  /** The height of this place's ground. */
  private field: HeightField | null = null
  /** Chests, plates, doors, bridges and the water (`gfx/levelProps.ts`). */
  private props: LevelProps | null = null
  /** A town's houses, props and life (`gfx/townView.ts`). */
  private town: TownView | null = null
  /** The colosseum's stands, crowd and banners (#117), and the waves it has seen fall. */
  private crowd: ArenaCrowd | null = null
  private crowdCleared = 0
  /** The siege's gate, bell, platforms, ballistas, fires and rams (`gfx/siegeProps.ts`). */
  private siegeProps: SiegeProps | null = null
  /** The Hollows' besieged gate (#204): its props, whether the hand-over was made, and the camera's zoom while it frames the scene. */
  private assaultProps: AssaultProps | null = null
  private rebelProps: RebelProps | null = null
  private celebrateProps: CelebrateProps | null = null
  private celebrateFired = false
  private celebrateZoom = 1
  private assaultFired = false
  private assaultZoom = 1
  private chest: { root: Group; lid: Object3D; dispose(): void } | null = null
  private chestOpen = 0
  private views = new Map<number, View>()
  private time = 0
  /** Real seconds of hit-stop left. */
  private stop = 0
  /** The level-up slow-motion: seconds into it (`SLOW_MO` = off), and how long
   *  a boss's own beat (its entrance, a phase) still holds the stage. */
  private slowT = SLOW_MO
  private beat = 0
  private hudT = 0
  private dragT = 0
  private endFired = false
  /** The first-clear hoard has been asked about (once the finale has been won for two seconds). */
  private hoardAsked = false
  /** Second wind was asked for this visit (once, taken or not). */
  private windAsked = false
  /** The defeat waits on the player's answer to Second wind. */
  private windHeld = false
  /** The first cry for help has cut the view to the cages (seconds into the shot; -1: not showing). */
  private helpShotT = -1
  private helpBackT = 0
  private helpShown = false
  /** The tutorial level (the plains before their first clear): revives are free and unlimited, big blows are capped. */
  readonly tutorialLevel: boolean
  private stepSfx = 0
  /** The enemy the pointer is over (the drag line snaps to it). */
  private hoverId = 0
  private entered = false
  private low = sceneQuality() === 'low'
  /** A conversation is on (`setTalk`): input locked, speakers turned, camera framing them. */
  private talkOn = false
  /** A town's way out may take the hero to the map (#131): armed once he has stood outside it, so coming back from the map in the gateway does not send him again. */
  private exitArmed = false
  /** The townsperson spoken to (unit id; 0: the speaker is not in the scene). */
  private talkNpc = 0
  /** Where they were looking before they turned to the hero. */
  private talkFace = 0
  /** 0..1: how far the camera is into the conversation's framing. */
  private talkK = 0
  /** The framing: the look-at point's offset from the hero, and the zoom. */
  private talkDx = 0
  private talkDz = 0
  private talkZoom = 1
  /** Seconds after a conversation in which input is still swallowed (the key
   *  or tap that ended it is not an order). */
  private talkHold = 0
  /** The truce watchdog's clock (#153, `sim/truce.ts`). */
  private truceWatch = { t: 0 }
  /** The opening fight's potion stop (#154): the world waits until the hero drinks. */
  private potionStop = false
  /** The dodge lesson (tutorial level): seconds of the first boss charge's wind-up left before the world stops (-1: not running). */
  private dodgeT = -1
  /** The world waits for the dodge roll. */
  private dodgeStop = false
  /** The lane the charge was aimed along (its start, its direction), for the way out. */
  private dodgeLane = { x: 0, z: 0, a: 0, src: 0 }
  private dodgeDone = !!profile.tips[DODGE_TIP]
  /** The units as this visit was generated: what a saved game is told apart from. */
  private baseline: SimBaseline | null = null
  /** The share of the hero's run gold already paid into the purse (see `bankRunGold`). */
  bankedGold = 0
  /** The coins of this same visit (same seed) a reload already paid: the first of the new run's are not paid again (#196). */
  private goldCredit = 0
  private visitKey = ''
  /** The training dummy was set up in this visit. */
  private dummy = false
  /** The early art was moved up for this visit's first boss. */
  private bossArt = false
  /** The gunslinger on the plains (#210, `coach/cameo.ts`): armed in the opening fight of a save that has not seen it. */
  private cameo: CameoState | null = null
  /** The wall clock (ms) the cameo last kept time by: it runs on the music's seconds, which a slow device's capped steps would lose. */
  private cameoWall = 0
  /** Skills the hero knew when the loadout was last copied into the scene. */
  private learnedN = profile.hero.learned.length

  private constructor(setup: ZoneSetup, plan: ZonePlan, input: Input, cb: ZoneCallbacks) {
    this.setup = setup
    this.plan = plan
    this.fires = (plan.dressing ?? []).filter(d => d.kind === 'fire').map(d => ({ x: d.x, z: d.z }))
    this.input = input
    this.cb = cb
    this.sim = new Sim({
      seed: setup.seed, w: plan.w, h: plan.h, level: setup.level, difficulty: setup.difficulty,
      mode: setup.kind, zone: setup.zone ?? setup.town ?? 'arena'
    })
    this.tutorialLevel = setup.kind === 'zone' && setup.zone === TUTORIAL_NODE && !setup.invaded && !setup.encounter && !setup.assault && !setup.celebrate && tutorialLevelOpen()
    if (this.tutorialLevel) this.sim.chargedCap = TUTORIAL_CHARGED_CAP
  }

  /** Build a visit, time-sliced so the loader keeps painting. */
  static async create(setup: ZoneSetup, input: Input, cb: ZoneCallbacks, onProgress: (p01: number) => void = () => {}, resume?: VisitResume): Promise<ZoneMode> {
    const slice: Slice = createSlicer(12)
    // A town's simulation and its people's conversations are chunks of their
    // own (roadmap #142), usually fetched long before on the idle queue.
    if (setup.kind === 'town') await Promise.all([loadTownSim(), loadTalk()])
    const plan = setup.kind === 'town'
      ? townSim().generateTown(TOWNS[setup.town!], setup.flags, setup.seed)
      : setup.siege
        ? generateSiege(setup.seed)
      : setup.celebrate
        ? generateCelebration(setup.seed)
      : setup.assault
        ? generateAssault(setup.seed)
      : setup.kind === 'arena'
        ? generateArena(setup.seed)
        : setup.encounter
          ? generateEncounter(setup.encounter, setup.seed, { escort: setup.escort })
          : generateZone(setup.invaded ? invadedZone(setup.zone!) : ZONES[setup.zone!], setup.seed, {
            tutorial: setup.tutorial, openingPack: setup.tutorial ? OPENING.pack : undefined, ambush: setup.ambush, extra: setup.extra,
            pieces: setup.pieces, treasure: setup.treasure, cage: setup.cage, rebels: setup.rebels,
            // DEV: `?branches=0` plays the zone as one road (the perf A/B arm of roadmap #70).
            ...(import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).get('branches') === '0' ? { branches: false } : {})
          })
    setup.carve?.(plan)
    const m = new ZoneMode(setup, plan, input, cb)
    const sim = m.sim
    if (setup.arenaMod) sim.arenaMod = setup.arenaMod
    // The opening fight's own tuning (`OPENING`): harder blows, the level-up on the result screen.
    if (setup.kind === 'zone' && setup.tutorial) {
      sim.enemyDmgMul = OPENING.dmg
      sim.holdLevelUp = true
      // A hero who already knows the teacher's skill meets foes that carry it in (a saved visit regenerates the same).
      if (profile.hero.learned.includes(MENTOR_SKILL)) sim.enemyHpMul = OPENING.skillHp
    }
    // The campaign's Frostlands and Temple hold more than their level band says (the invaded ones have their own multipliers).
    const harder = setup.kind === 'zone' && !setup.invaded && setup.zone ? CAMPAIGN_HARDER[setup.zone] : undefined
    if (harder) { sim.enemyHpMul *= harder.hp; sim.enemyDmgMul *= harder.dmg }
    // The foes meet the hero's kit: fewer skills learned than the level is tuned for, softer foes (`coach/kitEase.ts`).
    const kitLevel = setup.kind === 'zone' && !setup.invaded ? (setup.tutorial ? 'plains' : setup.zone) : undefined
    if (isKitLevel(kitLevel)) {
      const e = kitEase(kitLevel, profile.hero.learned.length)
      sim.enemyDmgMul *= e.dmg
      sim.enemyHpMul *= e.hp
    }
    applyPlan(sim, plan)
    createHero(sim, {
      build: heroBuild(), skills: loadoutActive(), x: plan.start.x, z: plan.start.z, xpInto: profile.hero.xp,
      // A "No potions" week in the colosseum (#10) carries none in.
      potions: setup.kind === 'town' || setup.arenaMod === 'nopotions' ? 0 : profile.inv.potions,
      // Mana potions are a carried stock: as many slots as the health belt has.
      manaPotions: setup.kind === 'town' || setup.arenaMod === 'nopotions' ? 0 : profile.inv.manaPotions, manaPotionsMax: profile.inv.potions,
      // Elixirs too (#87): none drunk in town, none in a "No potions" week.
      elixirs: setup.kind === 'town' || setup.arenaMod === 'nopotions' ? {} : profile.inv.elixirs, elixirPick: profile.inv.elixirPick,
      rested: setup.kind === 'town' ? 0 : profile.meta.rested
    })
    // Adaptive pressure (#124, D144): zones only — never a town, the colosseum
    // (its ladder climbs by itself, and its board stays fair) or the opening fight.
    if (setup.kind === 'zone' && !setup.tutorial && !setup.assault && !setup.celebrate) sim.pressure = newPressure(sessionPressure(), sessionRampPool())
    // An invaded zone or an encounter in its wilds (the afterplay): kills pay more, pylons and scars stand.
    if (setup.kind === 'zone' && setup.invaded) armInvasion(sim)
    if (setup.kind === 'zone' && setup.celebrate) armCelebration(sim, { freed: setup.celebrate.freed })
    else if (setup.kind === 'zone' && setup.assault) armAssault(sim, { low: m.low })
    else if (setup.kind === 'zone') populateZone(sim, plan, setup.zone!, profile.inv.items, profile.world.chests)
    // The colosseum knows what is owned: a milestone's mythic is given once (#117).
    else if (setup.kind === 'arena') for (const id of profile.inv.items) sim.owned.add(id)
    // The siege (afterplay §8): its gate, its commander, its first build phase.
    if (setup.siege) {
      armSiege(sim, {
        tier: setup.siege.tier, story: setup.siege.story, rotation: setup.siege.rotation, cap: m.low ? SIEGE_CAP_LOW : SIEGE_CAP,
        commander: setup.siege.commander === 'mara' ? { look: 'elder', voice: 'mara' } : { look: 'captain', voice: 'hale' }
      })
    }
    // An encounter pays in gold and experience, never in the zone's gear.
    if (setup.encounter) { sim.dropTable.mob = []; sim.dropTable.chest = []; sim.dropTable.boss = []; sim.dropTable.infernal = []; sim.dropTable.after = [] }
    // The first visit's training dummy, until it has been dealt with once.
    // (A saved game says whether it stood: the visit may have dealt with it since.)
    m.dummy = setup.kind === 'zone' && !!setup.tutorial && (resume ? !!resume.dummy : !profile.tips.dummy)
    if (m.dummy) spawnDummy(sim, plan)
    // A weak device leaves out most of the folk; every visit is a different day.
    else if (setup.kind === 'town') populateTown(sim, plan, { lite: sceneQuality() === 'low', visit: profile.world.visits[setup.town!] ?? 0 })
    else sim.wave.rest = 1.6
    if (setup.dragonAlly) summonDragonAlly(sim)
    // The road teacher (#136) walks into the opening fight once its first pack is down.
    if (setup.kind === 'zone' && setup.tutorial && !profile.hero.learned.includes(MENTOR_SKILL)) armMentor(sim)
    // The gunslinger and the chimera (#210) pass by once the pack of four is down: once per save, never on a replay.
    if (setup.kind === 'zone' && setup.tutorial && !profile.tips[CAMEO_TIP]) m.cameo = armCameo()
    // Brann at the opening level's ore rock (#195) is not in the scene any more: a second person to talk to, mid-fight, took
    // the first-timer's eyes off the action (the playtests' early leavers). Smithing is taught in Sunford (`sunfordSmith`).
    // An escort (#85): what the visit is about, said once at the start.
    if (setup.escort) pushHud({ t: 'toast', key: 'escort.start' })
    sim.events.length = 0
    m.baseline = captureBaseline(sim)
    // A saved game: the same visit, put back as it was saved.
    if (resume?.sim && !restoreSim(sim, m.baseline, resume.sim)) throw new Error('[zone] the saved visit does not match this zone')
    // A visit saved mid-cameo kept its actors: they go (the scene was marked seen as it began, it is not played again).
    clearCameoUnits(sim)
    m.bankedGold = sim.hero.gold
    m.visitKey = `${setup.kind}:${setup.zone ?? setup.town ?? ''}:${setup.seed}:${setup.tutorial ? 1 : 0}:${setup.encounter ? 1 : 0}`
    const paid = profile.meta.visitGold
    m.goldCredit = !resume?.sim && paid && paid.key === m.visitKey ? paid.gold : 0
    if (resume?.hero) {
      const h = sim.hero.unit
      h.x = h.px = h.homeX = resume.hero.x
      h.z = h.pz = h.homeZ = resume.hero.z
      h.facing = resume.hero.facing
    }
    onProgress(0.08)
    await slice()

    m.scene.add(new AmbientLight(0xffffff, 1))
    // The ground everything in this place stands on (`gfx/ground.ts`).
    // DEV: `?relief=0` lays every place flat (the perf A/B arm of roadmap #57).
    if (import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).get('relief') === '0') plan.height.fill(0)
    m.field = { w: plan.w, h: plan.h, height: plan.height }
    setGround(m.field)
    performance.mark('zone:ground-start')
    m.terrain = await buildTerrain(plan, setup.theme, m.scene, slice)
    performance.mark('zone:terrain-built')
    // Invaded (afterplay §3), or the siege's field: the mood darkens toward dried blood, embers drift.
    if ((setup.kind === 'zone' && setup.invaded) || setup.siege) {
      m.terrain.theme = corruptTheme(m.terrain.theme)
      setCelMood({ ambient: m.terrain.theme.ambient, shadowTint: m.terrain.theme.shadow })
      m.scene.background = new Color(m.terrain.theme.sky)
    }
    // The haze now, not at the first resize: every program is compiled with
    // it, so the first live frame does not recompile them all (a 0.6 s task
    // at 4× CPU, measured).
    setZoneFog(m.scene, m.terrain.theme, m.cam.dist)
    onProgress(0.5)

    // Every rig template this visit can need, one per slice: the pack's kinds,
    // what they summon, and what the hero's own skills call in.
    const kinds = new Set<string>()
    for (const u of sim.units) if (u.rank !== 'hero') kinds.add(u.kind)
    for (const k of [...kinds]) for (const a of ENEMY_BY_ID[k]?.abilities ?? []) if (a.spawn) kinds.add(a.spawn)
    const skills = sim.hero.skills
    if (skills.includes('royalGuard') || skills.includes('armyOfTheRealm')) { kinds.add('guard'); kinds.add('archer'); kinds.add('mage') }
    if (skills.includes('deployTurret')) { kinds.add('turret'); kinds.add('rocketTurret') }
    // The cameo's three rigs are built now, not on the frame they leap in.
    if (m.cameo) for (const k of [CAMEO_HERO, CAMEO_BEAST, CAMEO_TOWER]) kinds.add(k)
    if (setup.siege) for (const id of [...siegeKinds(setup.siege.tier), 'guard']) kinds.add(id)
    else if (setup.kind === 'arena') for (const id of arenaKinds(setup.level)) kinds.add(id)
    const jobs = prewarmKinds(kinds)
    performance.mark('zone:rigs-start')
    // The hero is a job of its own too (his rig is the richest: ~0.1 s at 4× CPU).
    jobs.unshift(() => prewarmLook(heroLook(profile.inv.equipped, profile.hero.gender)))
    for (let i = 0; i < jobs.length; i++) {
      jobs[i]!()
      onProgress(0.5 + ((i + 1) / jobs.length) * 0.35)
      await slice()
    }

    performance.mark('zone:rigs-built')
    m.vfx = new Vfx(m.scene)
    m.orbs = new StackOrbs(m.scene)
    m.markers = new Markers(m.scene)
    m.bars = new HealthBars(m.scene, 72)
    m.scene.add(m.walls.root)
    // A zone's chests (the finale's too) are level props; the colosseum keeps its prize chest.
    // A town on a river (#103) has its water drawn the same way.
    if (setup.kind === 'zone' || (setup.kind === 'town' && plan.liquid)) {
      m.props = new LevelProps(sim, m.vfx, m.terrain.theme, n => m.cam.addTrauma(n))
      await m.props.build(plan, m.scene, slice)
      if (resume?.sim) m.props.syncFromSim()
    }
    // The corruption's tint, baked into the vertex colours of the ground, the
    // scenery and the props before anything is baked (no shader, no draw call).
    if ((setup.kind === 'zone' && setup.invaded) || setup.siege) {
      corruptColors(m.terrain.root)
      if (m.props) corruptColors(m.props.root)
      await slice()
    }
    if (setup.kind === 'town' && plan.town) {
      const { TownView } = await loadTownView()
      m.town = await TownView.build(plan, sim, m.scene, slice, m.vfx.particles)
    }
    // The Hollows' chain gang (#205), while the King lives.
    if (plan.rebels) {
      m.rebelProps = new RebelProps(sim, m.vfx)
      m.rebelProps.build(m.scene, plan.rebels)
    }
    if (setup.celebrate) {
      m.celebrateProps = new CelebrateProps(sim, m.vfx)
      m.celebrateProps.build(m.scene)
    }
    if (setup.assault) {
      m.assaultProps = new AssaultProps(sim, m.vfx, n => m.cam.addTrauma(n))
      m.assaultProps.build(m.scene)
    }
    if (setup.siege) {
      m.siegeProps = new SiegeProps(sim, m.vfx)
      m.siegeProps.build(m.scene)
    } else if (setup.kind === 'arena') {
      m.crowd = new ArenaCrowd(plan, m.vfx.particles, m.low)
      m.scene.add(m.crowd.root)
    }
    if (setup.kind === 'arena' && plan.chest) {
      m.chest = buildChest()
      m.chest.root.position.set(plan.chest.x, 0, plan.chest.z)
      m.chest.root.visible = false
      m.scene.add(m.chest.root)
    }
    performance.mark('zone:props-built')
    for (const u of sim.units) {
      m.addView(u)
      if ((u.id & 3) === 3) await slice()
    }
    performance.mark('zone:views-built')
    // DEV: `?bake=0` keeps the builders' meshes, `?bakeTile=<m>|all` sizes the
    // baked tiles (the A/B arms of roadmap #151).
    const q = import.meta.env.DEV && typeof location !== 'undefined' ? new URLSearchParams(location.search) : null
    // The bake (a merge of the still world into a few draws, a pure speed-up: the builders' own pieces draw the same
    // pixels meanwhile) is the second-longest step of a load and nothing the first frame needs: it runs after the place
    // is on screen (`bakeLater`, #190), in slices, the merged programs compiled before the swap.
    m.bakeTile = q?.get('bakeTile') === 'all' ? Infinity : q?.get('bakeTile') ? Number(q.get('bakeTile')) : BAKE_TILE
    m.bakeOn = q?.get('bake') !== '0'
    performance.mark('zone:baked')
    m.still.collect(m.scene)
    onProgress(0.95)
    m.cam.snap()
    const at = resume ? sim.hero.unit : plan.start
    m.cam.follow(at.x, at.z, 0, 0, 0.016, groundAt(at.x, at.z))
    m.syncHud(true)
    onProgress(1)
    return m
  }

  /** This visit as a save slot keeps it (null: nothing to keep — the visit
   *  is over, or the hero has fallen). */
  snapshot(): VisitResume | null {
    const sim = this.sim
    // A siege is fought in one sitting: a save slot keeps the hero, not the siege.
    if (!this.baseline || !sim.hero.unit.alive || sim.siege || sim.assault || sim.celebrate) return null
    if (this.setup.kind === 'town') {
      const h = sim.hero.unit
      return { hero: { x: h.x, z: h.z, facing: h.facing } }
    }
    return { sim: snapshotSim(sim, this.baseline), dummy: this.dummy }
  }

  // ─── Views ─────────────────────────────────────────────────────────────────

  private addView(u: Unit): void {
    // The training dummy is a level prop, not a rig (`gfx/dummyProp.ts`).
    if (this.views.has(u.id) || isDummy(u) || isPylon(u) || SIEGE_PROP_KINDS.has(u.kind)) return
    const v = makeRigView(u, u.rank === 'hero' ? heroLook(profile.inv.equipped, profile.hero.gender) : undefined)
    const shadow = makeBlobShadow(u.r)
    this.scene.add(v.rig.root, shadow)
    this.views.set(u.id, { v, shadow, pin: null })
  }

  /** A goblin asleep by a camp fire warms its hands at it (or huddles); woken, it is up. */
  private restPose(v: RigView, u: Unit, dt: number): void {
    const by = !u.awake && u.alive && u.kind.startsWith('goblin') && this.fires.some(f => Math.hypot(f.x - u.x, f.z - u.z) < 3.6)
    if (!by) {
      v.loop = null
      return
    }
    v.loop = townLoop(v.set, u.id % 3 ? 'warm' : 'huddle')
    v.loopT += dt
  }

  private dropView(id: number): void {
    const w = this.views.get(id)
    if (!w) return
    this.scene.remove(w.v.rig.root, w.shadow)
    this.town?.drop(id)
    w.v.rig.material.dispose()
    w.v.rider?.material.dispose()
    this.views.delete(id)
  }

  /** The hero was picked or switched (roadmap #71, the hero choice): the rig
   *  is rebuilt in place from the profile. */
  restyleHero(): void {
    const u = this.sim.hero.unit
    this.dropView(u.id)
    this.addView(u)
  }

  /** Upload every mesh and compile every program before the first live frame. */
  async warmUp(slice: Slice, onProgress: (f01: number) => void = () => {}): Promise<void> {
    const r = getRenderer()
    this.cam.update(0)
    updateCelFrame(this.camera, this.cam.refDepth)
    // A few meshes per draw, sliced: the first draw of a mesh uploads its
    // buffers and the first draw of a program reads back its uniforms, and the
    // whole place in one render was a single task of ~0.8 s at 4× CPU. What is
    // hidden now stays hidden (and is uploaded when it first shows, as before).
    // Drawn into ONE pixel: the uploads are the point, not the picture, and a
    // backlog of full-screen warm-up frames would stall the first real one.
    const own = createSlicer(12)
    const size = r.getSize(_size)
    r.setScissorTest(true)
    r.setScissor(0, 0, 1, 1)
    r.setViewport(0, 0, 1, 1)
    const everything: Object3D[] = []
    this.scene.traverse((o) => { if ((o as Mesh).isMesh || (o as Points).isPoints || (o as Line).isLine) everything.push(o) })
    // The still world far from where the hero starts (more than ~2 screens of walking) is warmed after the place is up (#190):
    // its geometry is uploaded in small steps, nearest first, a few milliseconds a frame (`warmStep`), long before a walk
    // reaches it; the load itself pays only for what is round the hero and for everything that is not scenery.
    const all: Object3D[] = []
    const hero = this.sim.hero?.unit
    const far: Array<{ o: Object3D; d: number }> = []
    for (const o of everything) {
      const d = hero && o.userData.stillCull ? distanceTo(o as Mesh, hero.x, hero.z) : -1
      if (d > WARM_NEAR) far.push({ o, d }); else all.push(o)
    }
    far.sort((a, b) => a.d - b.d)
    this.warmQueue = far.map(f => f.o)
    const shown = all.map(o => o.visible)
    // …so the far pieces are hidden while the near ones are drawn (a render draws whatever is shown).
    const farShown = far.map(f => f.o.visible)
    for (const f of far) f.o.visible = false
    for (const o of all) o.visible = false
    try {
      let i = 0
      while (i < all.length) {
        let verts = 0
        const from = i
        while (i < all.length && (i === from || (i - from < 8 && verts < 20000))) {
          const o = all[i]!
          o.visible = shown[i]!
          verts += ((o as Mesh).geometry?.attributes.position?.count ?? 0) * Math.max(1, (o as InstancedMesh).count ?? 1)
          i++
        }
        r.clear()
        r.render(this.scene, this.camera)
        for (let k = from; k < i; k++) all[k]!.visible = false
        onProgress((i / all.length) * 0.9)
        await own()
        await slice()
      }
    } finally {
      for (let k = 0; k < all.length; k++) all[k]!.visible = shown[k]!
      far.forEach((f, k) => { f.o.visible = farShown[k]! })
      r.setScissorTest(false)
      r.setViewport(0, 0, size.x, size.y)
    }
    performance.mark('zone:warm-near-done')
    // A body fading in or out (a spawn, a death, stealth, a house's cut-away
    // front) is drawn see-through, and three gives a see-through material its
    // own program: compiled here, one kind of mesh at a time, not on the first
    // frame that fades someone (~0.15 s at 4× CPU, measured on the boot).
    const kinds = new Set<string>()
    for (const o of everything) {
      const m = (o as Mesh).material as ShaderMaterial | undefined
      if (!m || Array.isArray(m) || m.transparent || !m.uniforms?.uOpacity) continue
      const key = ((o as SkinnedMesh).isSkinnedMesh ? 's' : (o as InstancedMesh).isInstancedMesh ? 'i' : 'm') + m.vertexShader.length + ':' + m.fragmentShader.length + Object.keys(m.defines ?? {}).join()
      if (kinds.has(key)) continue
      kinds.add(key)
      // A see-through copy, kept for the whole session (#190): three frees a program once no material uses it, and a
      // copy made and thrown away per visit meant re-deriving the same programs on every place entered (~0.4 s).
      if (SEE_VARIANTS.has(key)) continue
      const see = m.clone()
      see.transparent = true
      SEE_VARIANTS.set(key, see)
      ;(o as Mesh).material = see
      try {
        for (const c of r.compile(o, this.camera, this.scene)) (r.properties.get(c) as { currentProgram?: { getUniforms(): unknown } }).currentProgram?.getUniforms()
      } finally {
        ;(o as Mesh).material = m
      }
      await own()
    }
    performance.mark('zone:warm-fade-done')
    // Programs compiled for things hidden until their moment (a chest's glow, a
    // ring) read their uniforms back here, one a slice, not on the frame that
    // first shows them; the read also waits for the GPU to finish the above.
    const gl = r.getContext()
    for (const p of r.info.programs ?? []) {
      p.getUniforms()
      await own()
    }
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, _px)
    onProgress(1)
    await slice()
    // What follows (the scene taking over, the HUD mounting) is a task of its own.
    await yieldToBrowser()
  }

  /**
   * Upload the far scenery in the background (#190): a few milliseconds of a frame, nearest first, each batch drawn into one
   * pixel exactly as `warmUp` does, then put back as it was. A piece the bake has since replaced is skipped. Called at the
   * top of the frame, before the cull sets what is shown.
   */
  private warmStep(): void {
    const q = this.warmQueue
    if (!q.length || !this.entered) return
    const r = getRenderer()
    const t0 = performance.now()
    const view = r.getViewport(_view)
    const test = r.getScissorTest()
    r.setScissorTest(true)
    r.setScissor(0, 0, 1, 1)
    r.setViewport(0, 0, 1, 1)
    const was: Array<[Object3D, boolean]> = []
    try {
      do {
        let verts = 0
        let n = 0
        while (q.length && n < 8 && verts < 20000) {
          const o = q.shift()!
          if (!o.parent) continue
          was.push([o, o.visible])
          o.visible = true
          verts += ((o as Mesh).geometry?.attributes.position?.count ?? 0) * Math.max(1, (o as InstancedMesh).count ?? 1)
          n++
        }
        if (!was.length) continue
        // Everything else of the scene is hidden for the call, so the one pixel draws these and nothing more.
        const rest: Array<[Object3D, boolean]> = []
        this.scene.traverse((o) => { if (((o as Mesh).isMesh || (o as Points).isPoints || (o as Line).isLine) && !was.some(w => w[0] === o)) { rest.push([o, o.visible]); o.visible = false } })
        r.render(this.scene, this.camera)
        for (const [o, v] of rest) o.visible = v
        for (const [o, v] of was) o.visible = v
        was.length = 0
      } while (q.length && performance.now() - t0 < 3)
    } finally {
      for (const [o, v] of was) o.visible = v
      r.setScissorTest(test)
      r.setViewport(view)
    }
  }

  /**
   * Merge the still world into its few draws, once the place is showing (#190). Safe to call twice (the second is a no-op),
   * and nothing happens to a mode that has been disposed meanwhile. Sliced like the build; the merged programs are compiled
   * before the swap, and the cull list is made again from what the scene holds then.
   */
  async bakeLater(): Promise<void> {
    if (this.bakeStarted || !this.bakeOn || this.gone) return
    this.bakeStarted = true
    const slice = createSlicer(6)
    await this.baked.bake(this.scene, this.bakeTile, slice, async (root) => {
      try {
        const cam = this.camera
        const r = getRenderer()
        const pre = [...(root.children as Mesh[])]
        // One representative per material program is enough.
        const seen = new Set<unknown>()
        for (const mesh of pre) {
          const key = (mesh.material as Material).uuid
          if (seen.has(key)) continue
          seen.add(key)
          r.compile(mesh, cam, this.scene)
          await slice()
        }
      } catch { /* compiled on its first draw instead */ }
    })
    if (this.gone) { this.baked.dispose(); return }
    this.still = new StillCull()
    this.still.collect(this.scene)
    // The merged tiles are new buffers: the ones round the hero are drawn at once, the rest are uploaded like the far scenery.
    const h = this.sim.hero?.unit
    const merged = [...(this.baked.root.children as Mesh[])].map(o => ({ o, d: h ? distanceTo(o, h.x, h.z) : 0 })).sort((a, b) => a.d - b.d)
    this.warmQueue.push(...merged.map(m => m.o))
  }

  enter(): void {
    this.entered = true
    // The bake waits until the first frames are drawn, then runs in the background.
    window.setTimeout(() => { void this.bakeLater() }, 1200)
    // The siege's buttons reach this scene while it is the live one.
    celebrateHud.active = !!this.sim.celebrate
    if (this.sim.celebrate) {
      celebrateActions.skip = () => skipCelebration(this.sim)
      this.syncCelebrate()
    }
    assaultHud.active = !!this.sim.assault
    if (this.sim.assault) {
      assaultActions.skipCut = () => skipPanorama(this.sim)
      assaultActions.skipSiege = () => skipAssault(this.sim)
      this.syncAssault()
    }
    siegeHud.active = !!this.sim.siege
    if (this.sim.siege) {
      siegeActions.build = id => this.siegeBuild(id)
      siegeActions.ready = () => this.siegeReady()
    }
    // The town's code, fetched while the player is busy here (see `townLoader.ts`):
    // on the background queue, after the field's own screens (`screens/chunks.ts`).
    if (!this.town) {
      idleTask('town-sim', loadTownSim, 13.4)
      idleTask('town-view', loadTownView, 13.5)
    }
    // The conversations' code (a mentor on the road, a quest's decision).
    idleTask('talk', loadTalk, 12.5)
    // The art of what can be reached from here, on a slow drip (`assets/preload.ts`).
    prefetchLikely(this.setup.zone ?? this.setup.town ?? 'arena')
    // The first visit's camp: its three skill cards are ready before the cage opens.
    if (this.sim.camp) warmCampCards()
    hud.phase = this.setup.kind === 'town' ? 'town' : 'play'
    this.syncHud(true)
  }

  // ─── Input ─────────────────────────────────────────────────────────────────

  private unitAtScreen(sx: number, sy: number, pad: number): Unit | undefined {
    if (!this.cam.screenToGround(sx, sy, ground)) return undefined
    // The ground point under a finger on a character's HEAD is behind the
    // character; try the feet and a point pulled toward the camera too.
    return this.sim.pick(-1, ground.x, ground.z, pad) ?? this.sim.pick(-1, ground.x, ground.z + 0.9, pad * 0.8)
  }

  private handleInput(): void {
    const i = this.input
    const sim = this.sim
    const h = sim.hero
    // A won zone is still the hero's to walk (and to leave: the Leave button).
    const live = (!sim.ended || (sim.ended === 'victory' && this.setup.kind === 'zone' && !sim.leaving)) && h.unit.alive
    hud.device = i.device
    // A conversation holds the hero still: its own layer takes the taps and keys.
    if (this.talkOn || this.talkHold > 0) { setStick(sim, 0, 0); return }
    // The besieged gate's panorama: the camera has the scene, nothing the player does counts.
    if (sim.assault?.phase === 'panorama' || sim.celebrate) { setStick(sim, 0, 0); return }

    if (i.pauseQueued) this.cb.onPause()
    if (i.panelQueued) this.cb.onPanel(i.panelQueued)
    if (!live) { setStick(sim, 0, 0); return }

    // The stick and the keys are screen-space: up on screen is −Z in the world.
    setStick(sim, i.moveX, -i.moveY)
    if (Math.hypot(i.moveX, i.moveY) > 0.3) coach.progress('move', 0.02)

    const pad = i.device === 'touch' ? 0.7 : 0.35
    for (const t of i.taps) {
      this.boardWalk = false
      const u = this.unitAtScreen(t.x, t.y, pad)
      // (The rebels and the archers at the besieged gate are scenery: a tap there is a tap on the ground.)
      if (u && !sim.assault && !sim.celebrate && (u.team === 1 || u.rank === 'npc')) {
        orderAttack(sim, u.id)
        if (u.team === 1) { coach.use('target'); sfx('uiClick') }
      } else if (this.cam.screenToGround(t.x, t.y, ground)) {
        // The notice board under the finger (#85): walk up to it and read it.
        const board = this.boardSpot()
        if (board && Math.hypot(ground.x - board.x, ground.z - board.z) < 1.6) {
          orderMove(sim, board.ax, board.az)
          this.boardWalk = true
          sfx('uiClick')
          continue
        }
        // A chest under the finger is opened, not walked onto.
        if (!this.openAt(ground.x, ground.z, pad)) {
          orderMove(sim, ground.x, ground.z)
          this.markers.tapAt(ground.x, ground.z)
          coach.use('move')
        }
      }
    }

    // The drag line: from the hero to the pointer, snapping to an enemy.
    this.hoverId = 0
    if (i.held && i.dragging) {
      const u = this.unitAtScreen(i.ptrX, i.ptrY, pad + 0.25)
      if (u && u.team === 1) this.hoverId = u.id
      // A long drag over open ground steers him there as it goes.
      this.dragT -= 1 / 60
      if (!this.hoverId && this.dragT <= 0 && this.cam.screenToGround(i.ptrX, i.ptrY, ground)) {
        this.dragT = 0.18
        orderMove(sim, ground.x, ground.z)
      }
    } else if (i.hoverX >= 0 && i.device === 'mouse') {
      const u = this.unitAtScreen(i.hoverX, i.hoverY, 0.3)
      if (u && u.team === 1) this.hoverId = u.id
    }
    if (i.dropped) {
      const u = this.unitAtScreen(i.dropX, i.dropY, pad + 0.25)
      if (u && (u.team === 1 || u.rank === 'npc')) {
        orderAttack(sim, u.id)
        if (u.team === 1) { coach.use('target'); sfx('uiClick') }
      } else if (this.cam.screenToGround(i.dropX, i.dropY, ground)) {
        // A chest under the finger is opened, not walked onto.
        if (!this.openAt(ground.x, ground.z, pad)) {
          orderMove(sim, ground.x, ground.z)
          this.markers.tapAt(ground.x, ground.z)
          coach.use('move')
        }
      }
    }

    if (i.skillTap >= 0) {
      if (castSkill(sim, i.skillTap, null)) coach.use('skill')
    }
    if (i.aimDrop >= 0 && this.cam.screenToGround(i.aimDropX, i.aimDropY, ground)) {
      if (castSkill(sim, i.aimDrop, { x: ground.x, z: ground.z })) { coach.use('skill'); coach.use('aim') }
    }
    if (i.rollQueued) rollHero(sim, h.stickX, h.stickZ)
    if (i.potionQueued && usePotion(sim)) coach.use('potion')
    if (i.manaPotionQueued && useManaPotion(sim)) { coach.use('mana'); markRevealUsed('mana') }
    if (i.elixirNextQueued) cycleElixir(sim)
    if (i.elixirQueued) useElixir(sim)
    if (i.targetQueued) cycleTarget(sim)
    if (i.leaveQueued && (leaveVisit(sim) || leaveLadder(sim))) sfx('uiOpen')
    if (i.findChestQueued && findChest(sim)) {
      // Where it is: a column of light over it, the crumbs run there, the camera leans.
      this.vfx.pillar(finder.x, finder.z, 0.6, 6, '#ffd84a', 1.6)
      this.vfx.ring(finder.x, finder.z, 0.3, 2.6, '#ffd84a', 0.8)
      sfx('uiOpen')
    }
    if (i.interactQueued) {
      const u = h.unit
      let best: Unit | undefined
      let bd = 4
      for (const n of sim.units) {
        if (n.rank !== 'npc' || !n.npc) continue
        // Not through a wall: in the same room, or either side of a doorway.
        if (this.plan.town && !townSim().townCanTalk(this.plan.town, u.x, u.z, n.x, n.z)) continue
        const d = Math.hypot(n.x - u.x, n.z - u.z)
        if (d < bd) { bd = d; best = n }
      }
      if (best) orderAttack(sim, best.id)
      else if (hud.interactBoard) this.cb.onInteract(BOARD)
      else {
        // No one to talk to: the chest in reach, if there is one; else an
        // outcrop to mine (#99).
        const c = nearChest(sim)
        const o = c ? undefined : nearOre(sim)
        if (c) orderOpen(sim, c.id)
        else if (o) orderMine(sim, o.id)
      }
    }
  }

  /** The town square's notice board (#85): where it stands and where one reads it from. */
  private boardAt: { x: number; z: number; ax: number; az: number } | null | undefined
  /** The hero was sent to the board: it opens when he gets there. */
  private boardWalk = false
  boardSpot(): { x: number; z: number; ax: number; az: number } | null {
    if (this.boardAt !== undefined) return this.boardAt
    const t = this.plan.town
    const b = t?.props.find(p => p.kind === 'board')
    if (!t || !b) return (this.boardAt = null)
    const spot = t.spots.find(s => s.kind === 'look' && s.prop === t.props.indexOf(b))
    return (this.boardAt = { x: b.x, z: b.z, ax: spot?.ax ?? b.x, az: spot?.az ?? b.z + 1.2 })
  }

  /** Open the chest at a tapped ground point. The point under a finger on a
   *  chest's lid is behind the chest, so a point nearer the camera counts too. */
  private openAt(x: number, z: number, pad: number): boolean {
    const c = pickChest(this.sim, x, z, pad) ?? pickChest(this.sim, x, z + 0.7, pad)
    if (!c) {
      // An outcrop under the finger is mined, not walked onto (#99).
      const o = pickOre(this.sim, x, z, pad) ?? pickOre(this.sim, x, z + 0.7, pad)
      if (!o) return false
      if (orderMine(this.sim, o.id)) sfx('uiClick')
      return true
    }
    if (orderOpen(this.sim, c.id)) sfx('uiClick')
    return true
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  private hitStop(sec: number): void {
    this.stop = Math.max(this.stop, sec)
  }

  private pan(x: number): number {
    return Math.max(-1, Math.min(1, (x - this.cam.target.x) / 9))
  }

  private drain(): void {
    const sim = this.sim
    const hero = sim.hero.unit
    const ev = sim.events
    for (let n = 0; n < ev.length; n++) {
      const e = ev[n]!
      this.props?.onEvent(e)
      this.siegeProps?.onEvent(e)
      this.assaultProps?.onEvent(e)
      this.rebelProps?.onEvent(e)
      switch (e.t) {
        case 'rebel':
          // The overseers still guard the gang: the hero is told once in a while.
          if (e.id === 'guarded') pushHud({ t: 'toast', key: 'rebels.toast.guarded' })
          else if (e.id === 'snap' && sim.rebels && sim.rebels.freed === 1) pushHud({ t: 'toast', key: 'rebels.toast.freed' })
          break
        case 'assault':
          // The two news of the siege that get a line of their own.
          if (e.id === 'tower') pushHud({ t: 'toast', key: 'assault.toast.tower' })
          else if (e.id === 'breach') pushHud({ t: 'toast', key: 'assault.toast.breach' })
          break
        case 'hit': {
          const y = e.h * 0.6
          const from = sim.get(e.src)
          const mine = e.src === hero.id || from?.ownerId === hero.id
          // The blow's way on the ground, from whoever dealt it: the impact is
          // thrown along it, and the body rocks (or falls) away from it.
          let bx = 0
          let bz = 0
          if (from && from.id !== e.tgt) {
            bx = e.x - from.x
            bz = e.z - from.z
            const l = Math.hypot(bx, bz)
            if (l > 1e-3) { bx /= l; bz /= l } else bx = bz = 0
          }
          const by = this.views.get(e.src)?.v
          const hit = sim.get(e.tgt)
          const r = hit?.r ?? 0.45
          this.vfx.impact({
            x: e.x - bx * r * 0.55, y, z: e.z - bz * r * 0.55, dx: bx, dz: bz, type: e.type, blow: blowOf(by), heavy: e.heavy,
            crit: e.crit, dot: e.dot, size: r, toHero: e.toHero
          })
          if (!e.dot) {
            const on = this.views.get(e.tgt)?.v
            if (on) struck(on, bx || bz ? Math.atan2(bx, bz) : on.yaw + Math.PI, e.crit ? 1 : 0, '#ffd84a')
            if (by) by.fxHit = true
          }
          const kind: TextKind = e.toHero ? 'hurt' : e.crit ? 'crit' : 'normal'
          // Every blow the hero deals or takes is counted; the minions' own are not.
          if (e.toHero || mine || e.src === 0) pushHud({ t: 'num', x: e.x, y: e.h + 0.3, z: e.z, amount: e.amount, kind })
          // A tick of damage over time is a number and a small mark: no freeze, no shake.
          if (e.dot) break
          if (e.toHero) {
            pushHud({ t: 'hurt', strength: Math.min(1, e.amount / Math.max(1, hero.s.maxHp) * 4) })
            this.cam.addTrauma(e.heavy ? TRAUMA_HEAVY * 0.7 : TRAUMA_LIGHT)
            sfx('hurt', this.pan(e.x))
          } else if (mine) {
            const boss = sim.get(e.tgt)?.rank === 'boss'
            if (e.killed && boss) {
              // A boss's finishing blow: the long freeze, and the camera pushes in.
              this.hitStop(HIT_STOP_BOSS)
              this.cam.punchZoom(0.78, 0.12, 0.3)
              this.cam.addTrauma(TRAUMA_HEAVY)
            } else if (e.crit || e.heavy) {
              this.hitStop(HIT_STOP_HEAVY)
              // A crit shakes at half strength and only a few times per 5 s (#140).
              this.cam.addTrauma(e.crit ? critTrauma(this.critShakes, sim.time, TRAUMA_HEAVY) : TRAUMA_LIGHT * 1.6)
            } else {
              this.hitStop(HIT_STOP_LIGHT)
              this.cam.addTrauma(TRAUMA_LIGHT)
            }
            // It sounds like what landed: an edge, a weight or a point, and the element it carried.
            const blow = e.type === 'pierce' ? 'pierce' : blowOf(by)
            // A skill's hit sounds like its element landing (#101): the fireball's
            // explosion, ice shattering. Anything else carries its damage's element.
            const sk = e.skill && !e.dot ? SKILL_BY_ID[e.skill] : undefined
            const elem = sk ? skillElement(sk) : null
            // An elemental skill is its element alone: under a staff's blunt hit a
            // fireball sounded like a punch (#118). A crit still rings, softly.
            const spell = !!elem && elem !== 'physical' && elem !== 'command'
            if (!spell) sfx(e.crit ? 'crit' : e.heavy ? 'hitHeavy' : blow === 'blunt' ? 'hitBlunt' : blow === 'pierce' ? 'hitPierce' : 'hit', this.pan(e.x))
            else if (e.crit) sfx('crit', this.pan(e.x), 0.45)
            if (sk) sfx(IMPACT_SOUND[elem!], this.pan(e.x), spell ? 1 : 0.8)
            else {
              const elem = HIT_ELEMENT[e.type]
              if (elem) sfx(elem, this.pan(e.x), 0.45)
            }
          }
          break
        }
        case 'miss':
          pushHud({ t: 'word', x: e.x, y: e.h + 0.3, z: e.z, key: 'combat.' + e.why, kind: 'status' })
          sfx(e.why === 'block' ? 'block' : 'dodge', this.pan(e.x))
          break
        case 'heal':
          pushHud({ t: 'num', x: e.x, y: e.h + 0.3, z: e.z, amount: e.amount, kind: 'heal' })
          break
        case 'mana':
          pushHud({ t: 'num', x: e.x, y: e.h + 0.5, z: e.z, amount: e.amount, kind: 'mana' })
          break
        case 'status':
          pushHud({ t: 'word', x: e.x, y: e.h + 0.55, z: e.z, key: 'status.' + e.id, kind: 'status' })
          break
        case 'swing':
          sfx(swingSound(e.style, e.heavy, this.views.get(e.src)?.v), this.pan(sim.get(e.src)?.x ?? 0), e.src === hero.id ? 1 : 0.55)
          break
        case 'cast': {
          const def = SKILL_BY_ID[e.skill]
          // Each skill gathers in its element's own sound (#101).
          if (def) sfx(castSoundOf(def), this.pan(e.x))
          else sfx('telegraph', this.pan(e.x), 0.7)
          // The skill's colour gathers under the caster as the cast begins.
          if (def && e.src === hero.id) this.vfx.castStart(e.x, e.z, def.color, def.cast >= 0.4)
          break
        }
        case 'fx':
          if (e.id === 'interact') {
            const npc = e.unit ? sim.get(e.unit)?.npc : undefined
            if (npc) this.cb.onInteract(npc)
            // One of the folk, walked up to: a wave and a bubble.
            else if (e.unit) townSimReady()?.townGreet(sim, e.unit)
            break
          }
          this.vfx.play(e, id => sim.get(id)?.h ?? 1.2)
          if (e.id.startsWith('cameo:')) { this.cameoSound(e.id.slice(6), e.x, e.z); break }
          this.fxSound(e.id, e.x)
          if (e.id.startsWith('burst:') || e.id === 'slam' || e.id === 'quake' || e.id === 'blast') this.cam.addTrauma(TRAUMA_HEAVY * (e.id === 'quake' ? 1 : 0.55))
          break
        case 'tele':
          this.vfx.telegraph(e.tele, sim.get(e.tele.src ?? 0) ?? null, sim.time, e.tele.follow ? sim.get(e.tele.follow) ?? null : null)
          this.armDodgeLesson(e.tele)
          break
        case 'death': {
          const def = ENEMY_BY_ID[e.kind]
          const big = e.rank === 'boss' ? 2.4 : e.rank === 'elite' ? 1.5 : 1
          const u = sim.get(e.unit)
          if (e.team === 1) {
            this.vfx.death(e.x, e.z, u?.h ?? 1.2, def?.color ?? '#ffffff', big)
            sfx(e.rank === 'boss' ? 'deathBig' : 'death', this.pan(e.x))
          } else if (e.rank === 'hero') {
            this.vfx.death(e.x, e.z, 1.4, '#ff5a5a', 1.6)
            sfx('deathBig')
          } else this.vfx.poof(e.x, e.z, MINIONS[e.kind]?.color ?? (ENEMY_BY_ID[e.kind] && e.team === 0 ? SPIRIT_COLOR : '#ffffff'), 0.8)
          break
        }
        case 'spawn': {
          const u = sim.get(e.unit)
          if (u) this.addView(u)
          break
        }
        case 'wall':
          this.walls.set(e.cells, sim.grid.w, e.on, e.fx)
          if (e.on && !ARENA_PROPS.has(e.fx)) { sfx('quake'); this.cam.addTrauma(TRAUMA_LIGHT * 1.5) }
          break
        case 'loot':
          if (e.gold > 0) {
            this.vfx.coins(e.x, e.z, Math.ceil(e.gold / 10))
            pushHud({ t: 'num', x: e.x, y: 1.2, z: e.z, amount: e.gold, kind: 'gold' })
            sfx('coin', this.pan(e.x))
          }
          if (e.item) {
            // A find is an event: a beam in its tier's colour, a fanfare by tier,
            // and its icon flying from the drop to the bag (`FloatLayer`).
            const tier = ITEM_BY_ID[e.item]?.tier ?? 1
            pushHud({ t: 'toast', key: 'toast.item', params: { item: 'item.' + e.item + '.name' }, icon: e.item, at: { x: e.x, y: 0.9, z: e.z } })
            this.vfx.lootBeam(e.x, e.z, tier)
            sfx(tier >= 6 ? 'lootLegend' : tier >= 4 ? 'lootEpic' : tier >= 3 ? 'lootRare' : 'loot', this.pan(e.x))
          }
          break
        case 'xp':
          break
        case 'levelUp':
          this.vfx.levelUp(hero.x, hero.z)
          pushHud({ t: 'toast', key: 'toast.levelUp', params: { level: e.level } })
          pushHud({ t: 'flash', color: '#ffe9a8', strength: 0.5 })
          sfx('levelUp')
          // A second of slow motion — unless a boss has the stage, or the visit is over.
          if (this.beat <= 0 && !this.talkOn && !sim.ended) this.slowT = 0
          break
        case 'awake':
          sfx(e.boss && ENEMY_BY_ID[e.boss]?.rank === 'boss' ? 'bossIntro' : 'alert')
          if (e.boss && ENEMY_BY_ID[e.boss]?.rank === 'boss') { this.beat = 2; this.slowT = SLOW_MO }
          if (e.boss && ENEMY_BY_ID[e.boss]?.rank === 'boss') pushHud({ t: 'toast', key: 'toast.boss', params: { boss: foeKey(sim.invaded, e.boss) } })
          break
        case 'groupDone':
          break
        case 'wave': {
          // The announcer's moment (#117): the wave's number big over the sand,
          // and the next prize the ladder holds.
          const next = nextMilestone(id => profile.inv.items.includes(id) || sim.hero.items.includes(id))
          hud.arenaBanner = { id: (hud.arenaBanner?.id ?? 0) + 1, kind: 'wave', n: e.n, champion: e.n > ARENA_WAVES && (e.n - ARENA_WAVES) % 3 === 0, item: next?.item ?? '', at: next?.wave ?? 0 }
          sfx('alert')
          break
        }
        case 'pylonsDown':
          // An invaded zone's last pylon (afterplay §3): its hoard spills out.
          pushHud({ t: 'toast', key: 'invasion.pylonsDown' })
          this.cam.addTrauma(TRAUMA_LIGHT)
          break
        case 'milestone':
          // A milestone falls: the crowd roars, the mythic is in the sand.
          hud.arenaBanner = { id: (hud.arenaBanner?.id ?? 0) + 1, kind: e.fresh ? 'prize' : 'milestone', n: e.wave, champion: false, item: e.item, at: e.wave }
          this.crowd?.cheer(sim.hero.unit.x, sim.hero.unit.z, true)
          sfx('crowdRoar')
          break
        case 'bark':
          sayBark(e.unit, e.key)
          // The first cry from the cages: the view cuts to them, so the player sees where the goal is (`helpShot`).
          if (!this.helpShown && e.key === HELP_CALLS[0]!.key) { this.helpShown = true; this.helpShotT = 0; this.cam.snap() }
          break
        case 'bossPhase': {
          const u = sim.get(e.unit)
          if (u) { this.vfx.slam(u.x, u.z, 5, ENEMY_BY_ID[u.kind]?.color ?? '#ff5a5a'); const w = this.views.get(u.id); if (w) squash(w.v, 0.3) }
          this.cam.addTrauma(TRAUMA_HEAVY)
          sfx('roar')
          this.beat = 1.5
          this.slowT = SLOW_MO
          break
        }
        case 'overheat':
          if (e.on) { sfx('overheat'); pushHud({ t: 'word', x: hero.x, y: hero.h + 0.6, z: hero.z, key: 'status.overheat', kind: 'status' }) }
          break
        case 'denied':
          sfx('denied')
          break
        case 'potion':
          sfx('potion')
          break
        case 'victory':
          // The map opens next: its art decoded before it does.
          prefetchNow(UI_ART.get('map'))
          this.chestOpen = 0.001
          if (this.chest) this.chest.root.visible = true
          pushHud({ t: 'flash', color: '#ffffff', strength: 0.35 })
          break
        case 'defeat':
          this.cam.addTrauma(TRAUMA_HEAVY)
          // A fallen hero starts the next visit at the designed difficulty (#124).
          if (!sim.hero.unit.alive) { setSessionPressure(0); setSessionRampPool(0) }
          break
        case 'pressure':
          setSessionPressure(sim.pressure?.bonus ?? 0)
          pushHud({ t: 'toast', key: e.up ? 'toast.pressureUp' : 'toast.pressureDown', params: { skulls: '\u2620'.repeat(e.pips) } })
          break
        case 'caravan':
          // The escort's word on its cart (#85): only the moments that matter.
          if (e.phase === 'waiting') pushHud({ t: 'toast', key: 'escort.waiting' })
          else if (e.phase === 'arrived') { pushHud({ t: 'toast', key: 'escort.arrived' }); sfx('levelUp') }
          else if (e.phase === 'lost') { pushHud({ t: 'toast', key: 'escort.lost' }); this.vfx.death(e.x, e.z, 1.6, '#c8a070', 1.4); sfx('deathBig') }
          break
      }
    }
    ev.length = 0
  }

  /**
   * The cameo's own sounds (#210): distinct, but under the player's fight (each recipe is trimmed in `synth.ts`, and here
   * they are played at part gain, a little muffled, and fainter the further the hero is from them).
   */
  private cameoSound(id: string, x: number, z: number): void {
    const name = CAMEO_SOUND[id]
    const h = this.sim.hero.unit
    const far = Math.max(0.3, Math.min(1, 1 - (Math.hypot(x - h.x, z - h.z) - 10) / 24))
    if (name) sfx(name[0], this.pan(x), name[1] * far, 0.12)
    // The superhero landing: a small shake (the player's own blows shake harder).
    if (id === 'land') this.cam.addTrauma(TRAUMA_LIGHT * 1.2 * far)
  }

  private fxSound(id: string, x: number): void {
    const p = this.pan(x)
    if (id.startsWith('burst:')) {
      const k = id.slice(6)
      sfx(k === 'flask' || k === 'venom' ? 'poison' : k === 'icicle' || k === 'geyser' ? 'ice' : k === 'curse' ? 'shadow' : k === 'roots' ? 'quake' : 'explode', p)
    } else if (id === 'slam' || id === 'quake' || id === 'spike') sfx('quake', p)
    else if (id === 'blink' || id === 'rewind') sfx('teleport', p)
    else if (id === 'summon' || id === 'deploy') sfx('summon', p)
    else if (id === 'heal') sfx('heal', p)
    else if (id === 'roar') sfx('roar', p)
    else if (id === 'beam') sfx('beam', p)
    else if (id === 'breath') sfx('fire', p)
    else if (id === 'cleave' || id === 'dash') sfx('swingHeavy', p, 0.8)
    else if (id === 'shield' || id === 'bastion' || id === 'buff' || id === 'fatalSave') sfx('shieldUp', p)
    else if (id === 'chest') sfx('chest', p)
  }

  // ─── The step ──────────────────────────────────────────────────────────────

  update(dt: number, first: boolean): void {
    // A lesson that stops the world stops the cameo and its music with it (they go on together after).
    if (cameoPlaying(this.cameo)) {
      holdSceneCue(this.potionStop || this.dodgeStop)
      // Stopped, its clock does not run either.
      if (this.potionStop || this.dodgeStop) this.cameoWall = performance.now()
    }
    if (this.potionStop) { this.holdForPotion(first); return }
    if (this.dodgeStop) { this.holdForDodge(first); return }
    // The cut to the cages and the way back: nobody fights or walks while the view is away from the fight.
    if (this.helpShotT >= 0 || this.helpBackT > 0) {
      if (this.helpShotT < 0) this.helpBackT -= dt
      this.holdForShot(first)
      return
    }
    if (first) this.handleInput()
    if (this.talkOn) this.holdTalk()
    else if (this.talkHold > 0) this.talkHold -= dt
    // Hit-stop: the world all but freezes, for attacker and victim alike.
    let simDt = dt
    if (this.stop > 0) {
      this.stop -= dt
      simDt = dt * HIT_STOP_SCALE
    } else if (this.slowT < SLOW_MO) simDt = dt * slowMoScale(this.slowT)
    if (this.slowT < SLOW_MO) this.slowT += dt
    if (this.beat > 0) this.beat -= dt
    stepSim(this.sim, this.plan, simDt)
    // The opening fight's helping hands (`coach/tutorialAid.ts`).
    if (this.setup.kind === 'zone' && this.setup.tutorial) {
      stepMercy(this.sim, simDt)
      if (potionStopDue(this.sim)) { this.potionStop = true; hud.potionStop = true }
    }
    // The tutorial level softens the blows while the hero runs, misses or cancels his own swings.
    if (this.tutorialLevel) stepRelief(this.sim, simDt)
    // The dodge lesson: half a second into the first boss charge the world stops (`beginDodgeStop`).
    if (this.dodgeT >= 0) {
      this.dodgeT -= simDt
      if (this.dodgeT <= 0) this.beginDodgeStop()
    }
    // The besieged gate is over: the Hollows follow (or the hero chose to skip).
    if (this.sim.assault?.phase === 'done' && !this.assaultFired) {
      this.assaultFired = true
      this.cb.onAssaultEnd?.(this.sim.assault.outcome === 'won' ? 'won' : 'skipped')
    }
    // The celebration is over: the story goes on (or the hero skipped it).
    if (this.sim.celebrate?.phase === 'done' && !this.celebrateFired) {
      this.celebrateFired = true
      this.cb.onCelebrateEnd?.(this.sim.celebrate.outcome === 'watched' ? 'watched' : 'skipped')
    }
    // A truce never outlives its conversation (#153).
    watchTruce(this.sim, this.truceWatch, dt, this.talkOn || !!this.cb.menuOpen?.())
    // The dummy knocked apart (or walked past): the opening beat is done for good.
    if (stepDummy(this.sim)) markTip('dummy')
    stepMentor(this.sim, simDt)
    this.stepCameo(dt, first)
    // A skill learned on the way (hers) joins the hero in the scene at once.
    if (profile.hero.learned.length !== this.learnedN) {
      this.learnedN = profile.hero.learned.length
      syncHeroSkills(this.sim, loadoutActive())
      // Learned mid-fight in the opening: the foes still standing toughen to match.
      if (this.setup.kind === 'zone' && this.setup.tutorial && profile.hero.learned.includes(MENTOR_SKILL)) boostOpeningFoes(this.sim, OPENING.skillHp)
    }
    // The camp's last words: once the free lesson is taken the knight sends the hero on (Mara, or the Goblin King), and the objective follows.
    if (this.sim.ended === 'victory' && this.sim.camp && !profile.tips[CAMP_NEXT_TIP] && !campPending(this.sim) && !campLessonPending(this.sim)) {
      const knight = this.sim.units.find(q => q.alive && q.npc === CAMP_SPEAKER)
      if (knight) {
        this.sim.emit({ t: 'bark', unit: knight.id, key: CAMP_NEXT })
        markTip(CAMP_NEXT_TIP)
      }
    }
    this.drain()
    coach.step(this, simDt)
    if (first) consumeEdges(this.input)

    const sim = this.sim
    if (sim.ended === 'defeat' && !this.windAsked && sim.endedT >= WIND_AT) {
      this.windAsked = true
      this.windHeld = !!this.cb.askSecondWind?.()
    }
    // The Goblin King's hoard: about two seconds after the finale falls, before Leave is pressed.
    if (sim.ended === 'victory' && !this.hoardAsked && sim.endedT >= HOARD_AT && this.setup.kind === 'zone' && sim.hero.unit.alive) {
      this.hoardAsked = !this.cb.onFinaleWon || this.cb.onFinaleWon()
    }
    if (sim.ended && !this.endFired && !this.windHeld && sim.endedT >= END_BEAT[sim.ended] && (sim.ended !== 'victory' || sim.endReady)) {
      this.endFired = true
      hud.phase = sim.ended === 'victory' ? 'won' : 'dead'
      this.cb.onEnd(sim.ended)
    }
  }

  /**
   * The cameo (#210): waits for its moment and for room in the view, then plays on wall seconds, once a frame: the scene
   * keeps the music's time, not the fight's (its hit-stop and slow motion, nor the steps a slow device drops: the loop caps
   * the steps of a frame, and on a busy machine the fight's clock fell a third behind the cue; a 0.25 s clamp on the frame
   * still lost 2.6 s of 13 to long frames). A pause (no frames) or a lesson's stop does not count: the cue stopped with it
   * and comes back where the scene is.
   */
  private stepCameo(dt: number, first: boolean): void {
    const c = this.cameo
    if (!c || c.phase === 'done') return
    if (c.phase === 'wait') {
      if (!tryStartCameo(this.sim, c, dt, this.screenGround, this.talkOn)) return
      markTip(CAMEO_TIP)
      this.cameoWall = performance.now()
      startSceneCue(() => c.t - INTRO_FIGHT_AT)
      return
    }
    if (!first) return
    const now = performance.now()
    // A long frame (a hitch, a screenshot) is kept; a gap of over a second was a pause (no frames ran): it counts as one step.
    const gap = Math.max(0, (now - this.cameoWall) / 1000)
    const real = gap > 1 ? dt : gap
    this.cameoWall = now
    if (stepCameo(this.sim, c, real)) endSceneCue()
  }

  /** The ground under a point of the view (fractions of its width and height), for the cameo's stage. */
  private screenGround = (fx: number, fy: number): { x: number; z: number } | null =>
    this.cam.screenToGround(fx * this.cam.width, fy * this.cam.height, ground) ? { x: ground.x, z: ground.z } : null

  /** The first lane charge of the tutorial level's boss starts: the dodge lesson comes half a second into it. */
  private armDodgeLesson(t: { shape: string; x: number; z: number; a: number; src?: number }): void {
    if (!this.tutorialLevel || this.dodgeDone || this.dodgeT >= 0 || this.dodgeStop || t.shape !== 'line') return
    const src = this.sim.get(t.src ?? 0)
    const ab = src ? ENEMY_BY_ID[src.kind]?.abilities[src.action?.ability ?? -1] : undefined
    if (!src || src.team !== 1 || ab?.kind !== 'charge') return
    this.dodgeLane = { x: t.x, z: t.z, a: t.a, src: src.id }
    this.dodgeT = DODGE_STOP_AFTER_S
  }

  /** Half a second in: the world stops, the dodge is ready (its cooldown cleared if it was running) and its button is lit. */
  private beginDodgeStop(): void {
    this.dodgeT = -1
    const sim = this.sim
    const h = sim.hero
    const src = sim.get(this.dodgeLane.src)
    // The charge was stunned or the hero is down or busy: the lesson waits for the next one.
    if (!h.unit.alive || sim.ended || !src || !src.alive || !src.action || src.action.done) return
    h.rollCd = 0
    this.dodgeStop = true
    hud.rollStop = true
  }

  /** The way out: sideways across the charge's lane, to the side the hero already stands on (the other if rock is there). */
  private dodgeWay(): { x: number; z: number } {
    const u = this.sim.hero.unit
    const { a, x, z } = this.dodgeLane
    const px = Math.cos(a)
    const pz = -Math.sin(a)
    let side = (u.x - x) * px + (u.z - z) * pz >= 0 ? 1 : -1
    if (isSolidAt(this.sim.grid, u.x + px * side * ROLL_DIST, u.z + pz * side * ROLL_DIST)) side = -side
    return { x: px * side, z: pz * side }
  }

  /** The dodge stop: nothing moves; the pause still opens, and the dodge (button or Space) is the only order taken. */
  private holdForDodge(first: boolean): void {
    if (!first) return
    const i = this.input
    hud.device = i.device
    if (i.pauseQueued) this.cb.onPause()
    if (i.rollQueued) {
      const way = this.dodgeWay()
      if (rollHero(this.sim, way.x, way.z)) {
        this.dodgeStop = false
        this.dodgeDone = true
        hud.rollStop = false
        markTip(DODGE_TIP)
      }
    }
    consumeEdges(i)
  }

  /** The view is on the cages (or on its way back): the world waits; only the pause is taken, and the hero's orders are dropped. */
  private holdForShot(first: boolean): void {
    if (!first) return
    const i = this.input
    if (i.pauseQueued) this.cb.onPause()
    consumeEdges(i)
  }

  /** The potion stop (#154): nothing moves; the pause still opens, and the
   *  flask (button or key) is the only order taken. */
  private holdForPotion(first: boolean): void {
    if (!first) return
    const i = this.input
    hud.device = i.device
    if (i.pauseQueued) this.cb.onPause()
    if (i.potionQueued) usePotion(this.sim)
    // Drunk by any road, or no longer needed: the world goes on, the hint goes.
    if (potionStopOver(this.sim)) {
      if (this.sim.hero.potionCd > 0) coach.use('potion')
      this.potionStop = false
      hud.potionStop = false
    }
    consumeEdges(i)
  }

  /** The answer to Second wind: up again, or the defeat goes on to its result. */
  secondWind(take: boolean): void {
    this.windHeld = false
    if (take && reviveHero(this.sim)) {
      hud.phase = 'play'
      this.cam.addTrauma(TRAUMA_LIGHT)
      // The tutorial level's revive is free and as many as it takes: the next fall is asked about again,
      // and the foes that felled the hero hit softer from here on.
      if (this.tutorialLevel) {
        this.windAsked = false
        grantMercy(this.sim)
      }
    }
  }

  // ─── The frame ─────────────────────────────────────────────────────────────

  render(alpha: number, dt: number): void {
    const sim = this.sim
    const hero = sim.hero.unit
    // Effects slow with the hit-stop (so the frozen frame reads) but never stop.
    const fxDt = this.stop > 0 ? dt * 0.2 : dt * slowMoScale(this.slowT)
    this.time += fxDt
    const a = this.stop > 0 ? 1 : alpha

    const hx = hero.px + (hero.x - hero.px) * a
    const hz = hero.pz + (hero.z - hero.pz) * a
    // A conversation eases the view from the hero to a frame for both speakers.
    const tk = this.talkFrame(hx, hz, dt)
    // A place built behind the veil (or by the recorder) may have set its own ground since.
    setGround(this.field)
    // A nudge may lean the view toward a chest nearby (`coach/nudgeFx.ts`).
    const peek = peekOffset(dt, hx, hz)
    const shot = this.celebrateShot(dt) ?? this.assaultShot(hx, hz, dt) ?? this.helpShot(dt)
    if (shot) this.cam.follow(shot.x, shot.z, 0, 0, dt, groundAt(shot.x, shot.z))
    else this.cam.follow(hx + this.talkDx * tk + peek.x, hz + this.talkDz * tk + peek.z, hero.vx, hero.vz, dt, groundAt(hx, hz))
    if (shot) this.cam.zoom = this.sim.celebrate ? this.celebrateZoom : this.helpShotT >= 0 ? HELP_SHOT_ZOOM : this.assaultZoom
    this.cam.update(dt)
    updateCelFrame(this.camera, this.cam.refDepth)
    // Scenery between the camera and the hero opens round them (a tall rock at a field's near edge).
    updateSeeThrough(this.camera, hx, groundAt(hx, hz), hz, hero.alive, this.camera.aspect)

    // Things far outside the view are not posed or drawn: past the camera's
    // reach, or wholly outside the picture (a rig is not culled by three: its
    // bounds would be its rest pose's).
    const reach = this.cam.dist * this.cam.zoom * 0.62 + 7
    const reach2 = reach * reach
    viewProj.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(viewProj)
    this.warmStep()
    this.still.update(frustum)
    this.bars.begin(dt)
    this.town?.begin()
    for (const [id, w] of this.views) {
      const u = sim.get(id)
      if (!u || w.v.gone) { this.dropView(id); continue }
      const x = u.px + (u.x - u.px) * a
      const z = u.pz + (u.z - u.pz) * a
      const dx = x - this.cam.target.x
      const dz = z - this.cam.target.z
      let seen = dx * dx + dz * dz < reach2
      if (seen) {
        // Room for a raised weapon, a cape, a knock-up and a big swing's trail.
        const s = Math.max(1, w.v.scale)
        bound.radius = (u.h + u.r) * s + 1.2 + Math.max(0, w.v.float)
        bound.center.set(x, groundAt(x, z) + u.h * s * 0.5 + (u.stunt?.lift ?? 0), z)
        seen = frustum.intersectsSphere(bound)
      }
      w.v.rig.root.visible = seen
      // Its ~30 bones are not walked by the scene's matrix update either.
      w.v.rig.root.matrixWorldAutoUpdate = seen
      w.shadow.visible = seen && u.alive
      if (!seen) continue
      // A townsperson's loop, held prop and bubble are set before the pose is made.
      if (u.rank === 'npc') this.town?.pose(w.v, u, fxDt)
      else if (this.fires.length && u.team === 1) this.restPose(w.v, u, fxDt)
      animate(w.v, u, x, z, this.time, fxDt)
      // Swing trails, muzzle flashes and the like are read off the pose just made.
      trackUnit(this.vfx, w.v, u)
      placeBlobShadow(w.shadow, w.v.x, w.v.z)
      if (!this.hideBars && u.alive && u.rank !== 'npc' && (u.rank !== 'hero') && (u.awake || u.hp < u.s.maxHp)) {
        // The frame says how special it is (D42); allies are green, the hero's own summons teal.
        const ours = u.team === 0
        const rank: BarRank = ours ? BAR_RANK.ally : barRank(u)
        const col = ours ? (u.ownerId === hero.id ? '#3fd8c8' : '#5fe08a') : rank === BAR_RANK.elite ? '#ffb02a' : rank === BAR_RANK.champion ? '#ff7a3a' : '#ff5a5a'
        this.bars.add(
          id, w.v.x, groundAt(w.v.x, w.v.z) + u.h * w.v.scale / Math.max(0.5, w.v.scale) + 0.45 + w.v.float + (rank === BAR_RANK.boss ? 0.25 : 0), w.v.z,
          u.hp / u.s.maxHp, u.shield / u.s.maxHp, col, Math.min(1.5, 0.7 + u.r * 0.7), rank,
          // Every enemy's level, on its tier's colour against the hero's (#77).
          ours ? 0 : barBadge(u.level, unitLevelTier(u.level, sim.hero.level))
        )
      }
    }
    // An invaded zone's pylons are props, not rigs: their bars once struck.
    for (const id of sim.pylons) {
      const p = sim.live(id)
      if (!p || p.hp >= p.s.maxHp) continue
      this.bars.add(id, p.x, groundAt(p.x, p.z) + p.h + 0.4, p.z, p.hp / p.s.maxHp, 0, '#ff5a5a', 1.1, barRank(p), barBadge(p.level, unitLevelTier(p.level, sim.hero.level)))
    }
    // The siege's props that can be struck: a ram's bar always, a ballista's once hurt (the gate's is the HUD's).
    if (sim.siege) {
      for (const r of sim.siege.rams) {
        const p = sim.live(r.id)
        if (p) this.bars.add(p.id, p.x, groundAt(p.x, p.z) + p.h + 0.5, p.z, p.hp / p.s.maxHp, 0, '#ffb02a', 1.3, BAR_RANK.elite, barBadge(p.level, unitLevelTier(p.level, sim.hero.level)))
      }
      for (const id of sim.siege.ballistas) {
        const p = id ? sim.live(id) : undefined
        if (p && p.hp < p.s.maxHp) this.bars.add(p.id, p.x, groundAt(p.x, p.z) + 1.9, p.z, p.hp / p.s.maxHp, 0, '#5fe08a', 1, BAR_RANK.ally, 0)
      }
    }
    this.bars.end()
    this.town?.update(fxDt, hx, hz, sim.get(this.talkNpc), this.cam.target.x, this.cam.target.z)
    // DEV: the recorder's textless cut hides what the renderer itself paints.
    if (PREVIEW_FEED === 'pure') { this.bars.mesh.visible = false; this.markers.root.visible = false }
    this.statusFx(fxDt)
    this.orbs.update(hero.alive ? hero.statuses : NO_STATUSES, hx, hz, hero.r, hero.h, fxDt, this.time, this.camera, groundAt(hx, hz))

    // ── Markers ──
    const live = hero.alive && (!sim.ended || (sim.ended === 'victory' && !sim.leaving))
    this.markers.hero(hx, hz, hero.r, live)
    const tgt = sim.live(sim.hero.order.targetId) ?? sim.live(this.hoverId)
    if (tgt && tgt.rank !== 'hero') this.markers.target(tgt.px + (tgt.x - tgt.px) * a, tgt.pz + (tgt.z - tgt.pz) * a, tgt.r, true, tgt.team === 1, tgt.team === 1 ? Math.max(0, barRank(tgt) - 1) as 0 | 1 | 2 | 3 : 0)
    else this.markers.target(0, 0, 1, false)
    const i = this.input
    if (live && i.held && i.dragging && this.cam.screenToGround(i.ptrX, i.ptrY, ground)) {
      const snap = sim.live(this.hoverId)
      this.markers.drag(true, hx, hz, snap ? snap.x : ground.x, snap ? snap.z : ground.z, !!snap)
    } else this.markers.drag(false)
    // A skill being dragged out of its button: where it would land.
    if (live && i.aimSlot >= 0 && i.aimLive && this.cam.screenToGround(i.aimX, i.aimY, ground)) {
      const def = SKILL_BY_ID[sim.hero.skills[i.aimSlot] ?? '']
      if (def) {
        let ax = ground.x
        let az = ground.z
        const d = Math.hypot(ax - hx, az - hz)
        const inRange = def.range <= 0 || d <= def.range + 0.4 || def.target === 'enemy'
        if (def.target === 'ground' && d > def.range && d > 1e-3) { ax = hx + ((ax - hx) / d) * def.range; az = hz + ((az - hz) / d) * def.range }
        if (def.target === 'self') { ax = hx; az = hz }
        this.markers.aim(true, hx, hz, def.range, ax, az, def.target === 'dir' ? 0 : def.radius ?? (def.target === 'enemy' ? 0.9 : 0), def.color, inRange)
      } else this.markers.aim(false)
    } else this.markers.aim(false)
    this.markers.way(dt, hintGeo.talk.on || hintPath.lead, hx, hz, hintPath.world, hintPath.world.length >> 1)
    this.markers.update(dt)

    this.vfx.syncProjectiles(sim.projectiles, a, fxDt)
    this.vfx.update(fxDt, sim.time)
    this.walls.update(fxDt)
    this.props?.update(fxDt, hx, hz)
    this.siegeProps?.update(fxDt)
    this.assaultProps?.update(fxDt)
    this.celebrateProps?.update(fxDt)
    this.rebelProps?.update(fxDt)
    if (this.crowd) {
      // A wave fought to its end: the crowd is on its feet (#117).
      if (sim.wave.cleared > this.crowdCleared) {
        this.crowdCleared = sim.wave.cleared
        this.crowd.cheer(hx, hz)
        sfx('crowdCheer')
      }
      this.crowd.update(fxDt)
    }
    emitCrumbs(sim, this.vfx.particles, fxDt, this.low || fxLevel() >= 1)
    if (this.chestOpen > 0 && this.chest) {
      this.chestOpen = Math.min(1, this.chestOpen + dt * 2.2)
      const k = this.chestOpen
      this.chest.lid.rotation.x = -1.9 * (1 - (1 - k) * (1 - k))
      if (k > 0.3 && k < 0.36) this.vfx.levelUp(this.chest.root.position.x, this.chest.root.position.z)
    }
    this.ambient(fxDt)

    const r = getRenderer()
    r.clear()
    r.render(this.scene, this.camera)

    // ── HUD ──
    if (this.project(hx, 1.6, hz, screen)) { hudLive.heroX = screen.x; hudLive.heroY = screen.y }
    this.hudT -= dt
    if (this.hudT <= 0) {
      this.hudT = 1 / 15
      this.syncHud(false)
    }
    const h = sim.hero
    for (let s = 0; s < ACTIVE_SLOTS; s++) { hudLive.cd[s] = h.cd[s]!; hudLive.cdMax[s] = h.cdMax[s]! }
    hudLive.potionCd = h.potionCd
    hudLive.potionCdMax = POTION_CD
    hudLive.elixirCd = h.elixirCd
    hudLive.elixirCdMax = POTION_CD
    hudLive.rollCd = h.rollCd
    hudLive.rollCdMax = ROLL_CD
    hudLive.manaPotionCd = h.manaPotionCd
    hudLive.manaPotionCdMax = POTION_CD
    tickHud(dt)
  }

  /** What every unit is under, shown on its body (`Vfx.statusTells`), and the hero's footfalls. */
  private statusFx(dt: number): void {
    const ps = this.vfx.particles
    for (const u of this.sim.units) {
      if (u.alive && (u.statuses.length || u.shield > 0)) this.vfx.statusTells(u, dt)
      // A boss stands in its own light.
      if (u.alive && u.rank === 'boss' && u.team === 1) this.vfx.aura(u.id, u.x, u.z, u.r * 2.6, ENEMY_BY_ID[u.kind]?.color ?? '#ff5a5a', dt)
    }
    // The hero's footfalls.
    const hero = this.sim.hero.unit
    if (hero.alive && hero.anim === 'walk') {
      this.stepSfx -= dt
      if (this.stepSfx <= 0) { this.stepSfx = 0.3; ps.emit({ x: hero.x, y: 0.08, z: hero.z, vy: 0.6, color: '#e8dcc8', size: 0.3, sizeEnd: 0.7, life: 0.28 }) }
    }
  }

  /** Motes in the air round the camera: fireflies, embers, snow. */
  private ambient(dt: number): void {
    // The effects ladder's last rung: no motes at all.
    if (fxLevel() >= 3 || Math.random() > dt * (this.low || fxLevel() >= 1 ? 1.5 : 5)) return
    const t = this.cam.target
    const x = t.x + (Math.random() - 0.5) * 22
    const z = t.z + (Math.random() - 0.5) * 22
    this.vfx.particles.emit({ x, y: 0.3 + Math.random() * 2.5, z, vx: (Math.random() - 0.5) * 0.4, vy: 0.15 + Math.random() * 0.3, vz: (Math.random() - 0.5) * 0.4, color: this.terrain.theme.mote, size: 0.16, sizeEnd: 0.03, life: 2 + Math.random() * 2 })
  }

  /**
   * Coins are the player's the moment they are picked up: they go into the
   * purse at once, so a trainer or a shop met inside the visit sees them. The
   * hero's run total (`sim.hero.gold`) stays the visit's tally for the result
   * screen and its "triple the purse" offer, which pays twice that on top.
   */
  /**
   * The hero keeps a piece of the Goblin King's hoard: it goes into this
   * visit's finds (banked with the rest, shown on the result screen with its
   * Equip button), and the finale chest no longer rolls a piece of gear of
   * its own, only its purse.
   */
  claimHoard(id: string): void {
    const sim = this.sim
    const h = sim.hero
    if (!h.items.includes(id)) h.items.push(id)
    sim.owned.add(id)
    for (const c of sim.chests) if (c.role === 'finale') c.loot = c.loot.filter(d => d.kind !== 'item')
    sim.emit({ t: 'loot', x: h.unit.x, z: h.unit.z, gold: 0, item: id })
  }

  bankRunGold(): void {
    const gold = this.sim.hero.gold
    const d = gold - this.bankedGold
    if (!d) return
    // A reloaded visit: its first `goldCredit` coins were paid before the reload (the ledger is saved with the purse).
    const pay = d > 0 ? Math.max(0, gold - Math.max(this.bankedGold, this.goldCredit)) : d
    profile.gold = Math.max(0, profile.gold + pay)
    this.bankedGold = gold
    if (gold > 0) profile.meta.visitGold = { key: this.visitKey, gold: Math.max(gold, this.goldCredit) }
  }

  /** Mirror the fight into the reactive HUD state. */
  private syncHud(force: boolean): void {
    this.bankRunGold()
    const sim = this.sim
    const h = sim.hero
    const u = h.unit
    hud.hp = Math.max(0, Math.ceil(u.hp))
    hud.maxHp = u.s.maxHp
    hud.shield = Math.round(u.shield)
    hud.mana = Math.floor(u.mana)
    hud.maxMana = u.s.maxMana
    hud.heat = h.usesHeat ? Math.round(h.heat) : -1
    hud.overheated = h.overheatT > 0
    hud.level = h.level
    hud.gold = profile.gold
    hud.rested = h.rested > 0
    hud.potions = h.potions
    hud.potionsMax = h.potionsMax
    hud.potionReady = h.potionCd <= 0
    hud.manaPotions = h.manaPotions
    hud.manaPotionMax = h.manaPotionsMax
    hud.manaPotionReady = h.manaPotionCd <= 0
    hud.elixir = h.elixirPick
    hud.elixirs = h.elixirPick ? h.elixirs[h.elixirPick] ?? 0 : 0
    hud.elixirKinds = Object.values(h.elixirs).filter(n => n > 0).length
    hud.elixirReady = h.elixirCd <= 0
    let changed = force
    const next: SkillSlotView[] = []
    for (let s = 0; s < ACTIVE_SLOTS; s++) {
      const st = slotState(sim, s)
      const v: SkillSlotView = { id: h.skills[s] ?? '', ready: st.ready, noMana: st.noMana, locked: st.locked, active: false }
      const cur = hud.skills[s]
      if (!cur || cur.id !== v.id || cur.ready !== v.ready || cur.noMana !== v.noMana || cur.locked !== v.locked) changed = true
      next.push(v)
    }
    if (changed) hud.skills = next
    const st = heroStatusView(u.statuses)
    if (!sameChips(st, hud.statuses)) hud.statuses = st
    hud.chi = u.statuses.find(s => s.id === 'chi')?.n ?? 0
    const t = sim.live(h.order.targetId)
    const ts = targetStackView(t && t.team === 1 ? t.statuses : undefined)
    if (!sameChips(ts, hud.targetStacks)) hud.targetStacks = ts
    hud.targetKey = t && t.team === 1 ? foeKey(sim.invaded, t.kind) : ''
    hud.targetLevel = t?.level ?? 0
    hud.targetTier = unitLevelTier(t?.level ?? 0, h.level)
    hud.targetHp01 = t ? t.hp / t.s.maxHp : 0
    hud.targetElite = t?.rank === 'elite'
    let boss: Unit | undefined
    // A zone may hold several bosses (a branch boss, the finale's, roadmap
    // #70): the plate shows the nearest one that is up.
    let bossD = Infinity
    for (const e of sim.units) {
      if (!e.alive || e.rank !== 'boss' || e.team !== 1 || !e.awake || e.boss?.mode === 'exit') continue
      const d = Math.hypot(e.x - u.x, e.z - u.z)
      if (d < bossD) { bossD = d; boss = e }
    }
    // A first-timer's first boss: what follows the fight (the level-up, the
    // loot, the book) has its art moved to the head of the idle queue (D149).
    if (boss && !hud.bossKey && !this.bossArt && profile.stats.runs === 0) { this.bossArt = true; queueEarlyArt(true) }
    hud.bossKey = boss ? foeKey(sim.invaded, boss.kind) : ''
    // The opening boss wakes: the level-up the first fights banked is paid out now (a breather before the fight, shown with the
    // burst and the toast), instead of waiting for the result screen with the hero at level 1 through the whole boss fight.
    if (boss && sim.holdLevelUp && this.setup.kind === 'zone' && this.setup.tutorial) {
      sim.holdLevelUp = false
      grantXp(sim, 1)
    }
    hud.bossHp01 = boss ? boss.hp / boss.s.maxHp : 0
    hud.bossLevel = boss?.level ?? 0
    hud.bossTier = unitLevelTier(boss?.level ?? 0, h.level)
    // Where its fight changes: the script's phase lines, or an old boss's one.
    const lines = !boss ? [] : boss.boss ? BOSS_SCRIPTS[boss.boss.script]?.phases ?? [] : ENEMY_BY_ID[boss.kind]?.phase2 ? [ENEMY_BY_ID[boss.kind]!.phase2!] : []
    if (lines.join() !== hud.bossPhases.join()) hud.bossPhases = [...lines]
    // The boss theme plays for exactly as long as the boss plate shows.
    setBossMusic(boss !== undefined && !sim.ended)
    hud.groupsDone = sim.groupsDone
    hud.groupsTotal = sim.groups.length
    hud.wave = sim.wave.n
    hud.arenaMod = sim.arenaMod
    hud.zoneKey = this.setup.siege ? 'bastion' : this.setup.zone ?? this.setup.town ?? 'arena'
    hud.zoneLevel = sim.level
    if (sim.siege) this.syncSiege()
    if (sim.assault) this.syncAssault()
    if (sim.celebrate) this.syncCelebrate()
    // The townsperson within reach.
    let near = ''
    if (this.setup.kind !== 'arena') {
      let bd = 3.2
      for (const n of sim.units) {
        if (n.rank !== 'npc' || !n.npc) continue
        if (this.plan.town && !townSim().townCanTalk(this.plan.town, u.x, u.z, n.x, n.z)) continue
        const d = Math.hypot(n.x - u.x, n.z - u.z)
        if (d < bd) { bd = d; near = n.npc }
      }
    }
    hud.interactKey = near
    // Walking into the town's way out leaves for the map (#131).
    if (this.setup.kind === 'town' && this.plan.town && u.alive) {
      if (!townExitAt(this.plan.town.exits, cellOf(u.x), cellOf(u.z))) this.exitArmed = true
      else if (this.exitArmed && !this.talkOn) { this.exitArmed = false; this.cb.onPanel('map') }
    }
    // The notice board in the square (#85), when nobody nearer has the word.
    const board = this.boardSpot()
    hud.interactBoard = !near && !!board && Math.hypot(board.x - u.x, board.z - u.z) < BOARD_REACH
    if (this.boardWalk && hud.interactBoard) { this.boardWalk = false; this.cb.onInteract(BOARD) }
    // The chest within reach, for the "Open" prompt.
    hud.interactChest = ((!sim.ended || (sim.ended === 'victory' && !sim.leaving)) && u.alive && this.props && nearChest(sim)?.tier) || ''
    // An outcrop within reach, for the "Mine" prompt (#99): not while he mines.
    hud.interactOre = (!hud.interactChest && (!sim.ended || (sim.ended === 'victory' && !sim.leaving)) && u.alive && this.props && u.action?.id !== 'mine' && nearOre(sim)?.kind) || ''
    // After the finale falls: the Leave button, whether the finale's chest is
    // open yet, and how many chests the place still holds.
    hud.canLeave = (this.setup.kind === 'zone' && sim.ended === 'victory' && !sim.leaving && !campPending(sim) && !campLessonPending(sim)) ||
      // The ladder (#10): between waves, from the eighth on.
      (this.setup.kind === 'arena' && !sim.ended && sim.wave.alive === 0 && sim.wave.cleared >= ARENA_WAVES)
    let left = 0
    let finaleOpen = false
    // The first visit's funnel (#178), for the portal's event sink: where do the people who leave stop?
    if (this.setup.kind === 'zone' && this.setup.tutorial) {
      const at = Math.round(sim.time)
      if (hud.bossKey) trackFtue('boss_seen', { at })
      if (!sim.hero.unit.alive) trackFtue('hero_fell', { at })
      if (sim.ended === 'victory') trackFtue('boss_down', { at })
      if (sim.cageKey?.taken) trackFtue('key_taken', { at })
    }
    for (const c of sim.chests) {
      if (c.state === 'open' && this.setup.kind === 'zone' && this.setup.tutorial) trackFtue(c.role === 'cage' ? 'cage_open' : c.role === 'finale' ? 'finale_open' : 'chest_open', { at: Math.round(sim.time) })
      if (c.role === 'finale') finaleOpen = c.state === 'open'
      if (c.state === 'closed' || c.state === 'opening') left++
    }
    hud.chestsLeft = left
    hud.finaleOpen = finaleOpen
  }

  // ─── The besieged gate (roadmap #204) ─────────────────────────────────────

  /**
   * The camera's shot at the besieged gate: the panorama sweeps from the left tower along the wall to the
   * right one, pulls back over the whole field and comes home to the hero; the breach frames the cave
   * mouth. Null otherwise (the hero's follow shot, with the zoom eased back to normal).
   */
  private assaultShot(hx: number, hz: number, dt: number): { x: number; z: number } | null {
    const a = this.sim.assault
    if (!a) return null
    const L = ASSAULT_LAYOUT
    let shot: { x: number; z: number; zoom: number } | null = null
    if (a.phase === 'panorama') {
      const A = L.towers[0]!
      const B = L.towers[1]!
      const T = PANORAMA_S
      // Time, ground point, zoom: the sweep, then the pull-back, then home.
      const keys: Array<[number, number, number, number]> = [
        [0, A.x - 3, A.z + 9, 1.8], [2.4, A.x + 3, A.z + 3, 1.45], [4.6, B.x - 3, B.z + 3, 1.45], [6.2, 27, 24, 2.1], [T - 0.5, hx, hz, 1], [T + 1, hx, hz, 1]
      ]
      let q = 0
      while (q < keys.length - 2 && a.t > keys[q + 1]![0]) q++
      const k0 = keys[q]!
      const k1 = keys[q + 1]!
      const u = Math.min(1, Math.max(0, (a.t - k0[0]) / (k1[0] - k0[0])))
      const e = u * u * (3 - 2 * u)
      shot = { x: k0[1] + (k1[1] - k0[1]) * e, z: k0[2] + (k1[2] - k0[2]) * e, zoom: k0[3] + (k1[3] - k0[3]) * e }
    } else if (a.phase === 'breach') {
      shot = { x: hx * 0.4 + L.mouth.x * 0.6, z: hz * 0.4 + L.mouth.z * 0.6 + 6, zoom: 1.3 }
    }
    if (!shot) {
      // Back to the hero's own shot: the zoom eases home.
      if (this.assaultZoom !== 1) {
        this.assaultZoom += (1 - this.assaultZoom) * (1 - Math.exp(-dt * 4))
        if (Math.abs(this.assaultZoom - 1) < 0.004) this.assaultZoom = 1
        this.cam.zoom = this.assaultZoom
      }
      return null
    }
    this.assaultZoom += (shot.zoom - this.assaultZoom) * (a.phase === 'panorama' ? 1 : 1 - Math.exp(-dt * 3))
    return shot
  }

  /**
   * The first cry for help in the tutorial level: the view cuts to the cages and rests there for `HELP_SHOT_S`
   * seconds, then the ordinary follow shot carries it back to the hero.
   */
  private helpShot(dt: number): { x: number; z: number } | null {
    if (this.helpShotT < 0) return null
    const cage = this.sim.chests.find(q => q.role === 'cage')
    this.helpShotT += dt
    if (!cage || this.helpShotT >= HELP_SHOT_S) { this.helpShotT = -1; if (cage) this.helpBackT = HELP_BACK_S; return null }
    // The zoom comes home with the assault's own easing once the shot is over.
    this.assaultZoom = HELP_SHOT_ZOOM
    return { x: cage.x, z: cage.z }
  }

  /**
   * The camera's shot at the celebration: from behind the feast table over the crowd to the fire, round the dancers,
   * then a slow pull back to the whole camp (the hero in front of it) for the last seconds.
   */
  private celebrateShot(dt: number): { x: number; z: number } | null {
    const c = this.sim.celebrate
    if (!c) return null
    const F = PARTY_LAYOUT.fire
    const T = PARTY_S
    // Time, ground point, zoom (a bigger number is farther, but the distance fog swallows the scene past about 1.9: the film starts on the feast table and ends on the camp).
    const keys: Array<[number, number, number, number]> = [
      [0, F.x - 8, F.z - 6, 1.5], [4.5, F.x - 2.5, F.z - 2.5, 1.55], [9, F.x + 3, F.z - 1.5, 1.6], [13.5, F.x, F.z - 0.5, 1.65], [T, F.x, F.z + 2.5, 1.65], [T + 2, F.x, F.z + 2.5, 1.65]
    ]
    let q = 0
    while (q < keys.length - 2 && c.t > keys[q + 1]![0]) q++
    const k0 = keys[q]!
    const k1 = keys[q + 1]!
    const u = Math.min(1, Math.max(0, (c.t - k0[0]) / (k1[0] - k0[0])))
    const e = u * u * (3 - 2 * u)
    this.celebrateZoom = k0[3] + (k1[3] - k0[3]) * e
    void dt
    return { x: k0[1] + (k1[1] - k0[1]) * e, z: k0[2] + (k1[2] - k0[2]) * e }
  }

  /** The celebration's state into the HUD's mirror. */
  private syncCelebrate(): void {
    const c = this.sim.celebrate!
    celebrateHud.active = true
    celebrateHud.title = c.t >= PARTY_TITLE_AT && c.t < PARTY_S - 2.5
    celebrateHud.t01 = Math.min(1, c.t / PARTY_S)
  }

  /** The siege's state into the HUD's mirror. */
  private syncAssault(): void {
    const a = this.sim.assault!
    const v = assaultHud
    v.active = true
    v.phase = a.phase === 'panorama' ? 'panorama' : a.phase === 'play' ? 'play' : 'breach'
    v.towers = a.towers.filter(t => !t.down).length
    v.hint = assaultHint(a)
    v.cut01 = a.phase === 'panorama' ? Math.min(1, a.t / PANORAMA_S) : 1
    // The ram's direction on the screen: a chevron over the ram, pointing to the tower it rolls to (the nearest still standing).
    const r = a.ram
    let tw: { x: number; z: number } | null = null
    let bd = Infinity
    if (a.phase === 'play' && (r.mode === 'idle' || r.mode === 'roll')) {
      for (let q = 0; q < a.towers.length; q++) {
        if (a.towers[q]!.down) continue
        const L = ASSAULT_LAYOUT.towers[q]!
        const d = Math.hypot(L.x - r.x, L.z - r.z)
        if (d < bd) { bd = d; tw = L }
      }
    }
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 0, y: 0 }
    if (tw && this.project(r.x, 2.2, r.z, p1) && this.project(tw.x, 2.2, tw.z, p2)) {
      v.aim = true
      v.aimX = p1.x
      v.aimY = p1.y
      v.aimAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    } else v.aim = false
  }

  // ─── The siege (afterplay §8) ─────────────────────────────────────────────

  /** Buy a defence in the build phase (the HUD's buttons). */
  siegeBuild(id: DefenceId): boolean {
    const ok = buildDefence(this.sim, id)
    sfx(ok ? 'uiBuy' : 'denied')
    if (ok) this.syncSiege()
    return ok
  }

  /** Ready: the next wave comes now. */
  siegeReady(): boolean {
    const ok = skipBuild(this.sim)
    if (ok) sfx('uiClick')
    return ok
  }

  /** The siege's news (`sim/siege.ts`) into toasts and sounds, and its state into the HUD's mirror. */
  private syncSiege(): void {
    const sim = this.sim
    const s = sim.siege
    if (!s) return
    for (const n of s.news) {
      switch (n.t) {
        case 'wave': sfx('bossIntro'); if (n.ram) pushHud({ t: 'toast', key: 'siege.toast.ram' }); break
        case 'cleared':
          pushHud({ t: 'toast', key: n.unharmed ? 'siege.toast.clearedUnharmed' : 'siege.toast.cleared', params: { n: n.n, marks: n.marks } })
          sfx('chest')
          break
        case 'horn': pushHud({ t: 'toast', key: 'siege.toast.horn', params: { pct: n.pct } }); sfx('alert'); this.cam.addTrauma(TRAUMA_LIGHT); break
        case 'lost': pushHud({ t: 'flash', color: '#c0202a', strength: 0.6 }); sfx('deathBig'); this.cam.addTrauma(TRAUMA_HEAVY); break
        case 'rally': pushHud({ t: 'toast', key: 'siege.toast.rally' }); break
        case 'won': case 'build': case 'built': case 'ram': break
      }
    }
    s.news.length = 0
    const v = siegeHud
    const gate = sim.get(s.gate)
    v.active = true
    v.tier = s.tier
    v.story = s.story
    v.phase = s.phase
    v.wave = s.wave
    v.buildT = Math.ceil(Math.max(0, s.buildT))
    v.gateMax = s.gateMax
    v.gateHp = gate && gate.alive ? Math.ceil(gate.hp) : 0
    v.gate01 = v.gateHp / Math.max(1, s.gateMax)
    v.marks = s.marks
    for (const d of DEFENCES) { const b = buildBlock(sim, d); if (v.blocks[d] !== b) v.blocks[d] = b }
    const boss = s.boss ? sim.live(s.boss) : undefined
    v.bossKey = boss ? (boss.kind === SIEGE_LORD ? 'siege.lord' : foeKey(true, boss.kind)) : ''
    v.boss01 = boss ? boss.hp / boss.s.maxHp : 0
    let b = 0
    for (const id of s.ballistas) if (id && sim.live(id)) b++
    v.ballistas = b
    v.cauldrons = s.cauldrons.filter(Boolean).length
    v.barricades = s.barricades.filter(Boolean).length
    v.militia = s.militia.filter(id => sim.live(id)).length
    // The badge under the hero's frame counts the waves held.
    hud.groupsDone = s.cleared
    hud.groupsTotal = SIEGE_WAVES
  }

  // ─── Conversations ─────────────────────────────────────────────────────────

  /**
   * A conversation starts or ends (`flow.ts`). The world keeps running; the
   * hero's input is locked. With a townsperson of this scene, the two turn to
   * each other and the camera frames both; without one (a decision after a
   * fight) it only closes in on the hero a little.
   */
  setTalk(on: boolean, npcId = ''): void {
    const sim = this.sim
    const was = sim.get(this.talkNpc)
    if (was) was.facing = this.talkFace
    this.talkNpc = 0
    this.talkOn = on
    // Untouchable while he listens, and not a moment longer (#153).
    setTruce(sim, on)
    if (!on) { this.talkHold = 0.3; townSimReady()?.townAddress(sim, 0); return }
    const npc = npcId ? sim.units.find(u => u.npc === npcId) : undefined
    if (npc) { this.talkNpc = npc.id; this.talkFace = npc.facing }
    // They stop what they are doing and turn to him (`sim/townLife.ts`).
    townSimReady()?.townAddress(sim, npc ? npc.id : 0)
    // Whatever he was on his way to, he stands and listens.
    const h = sim.hero
    h.order.kind = 'none'
    h.unit.hasGoal = false
    setStick(sim, 0, 0)
    this.holdTalk()
  }

  /** Each step of a conversation: a townsperson who was walking stops, and
   *  both keep facing each other. */
  private holdTalk(): void {
    const npc = this.sim.get(this.talkNpc)
    if (!npc) return
    const hero = this.sim.hero.unit
    npc.hasGoal = false
    if (Math.hypot(hero.x - npc.x, hero.z - npc.z) < 0.05) return
    npc.facing = Math.atan2(hero.x - npc.x, hero.z - npc.z)
    hero.facing = Math.atan2(npc.x - hero.x, npc.z - hero.z)
  }

  /** Ease the camera into (and out of) the conversation's framing; returns
   *  the eased weight of its offset from the hero. */
  private talkFrame(hx: number, hz: number, dt: number): number {
    const was = this.talkK
    this.talkK = Math.max(0, Math.min(1, was + (this.talkOn ? dt : -dt) * 2.4))
    const k = this.talkK
    if (k <= 0) {
      if (was > 0) this.cam.zoom = 1
      return 0
    }
    if (this.talkOn) {
      const npc = this.sim.get(this.talkNpc)
      this.talkZoom = !npc ? TALK_ZOOM_SOLO : this.cam.width < this.cam.height ? TALK_ZOOM_TALL : TALK_ZOOM
      let dx = npc ? (npc.x - hx) / 2 : 0
      let dz = npc ? (npc.z - hz) / 2 : 0
      if (npc) {
        // Leave the topics' part of the screen free: beside the speakers on a
        // short landscape screen, under them everywhere else.
        const c = this.cam
        const ppm = c.height / (2 * Math.tan((CAM_FOV * Math.PI) / 360) * c.dist * this.talkZoom)
        // (A point further toward the camera puts the speakers higher up.)
        if (c.height < TALK_SIDE_MAX_H && c.width > c.height) { dx += (c.width * 0.21) / ppm; dz -= (c.height * 0.1) / (ppm * Math.sin(CAM_PITCH)) }
        else dz += (c.height * 0.09) / (ppm * Math.sin(CAM_PITCH))
      }
      this.talkDx = dx
      this.talkDz = dz
    }
    const e = k * k * (3 - 2 * k)
    this.cam.zoom = 1 - (1 - this.talkZoom) * e
    return e
  }

  /** Where a speaker is on the surface: just over their head (the speech
   *  bubble's anchor), or just under their feet. False when they are not in
   *  this scene. */
  speakerAnchor(who: 'hero' | 'npc', out: { x: number; y: number }, feet = false): boolean {
    const u = who === 'hero' ? this.sim.hero.unit : this.sim.get(this.talkNpc)
    if (!u) return false
    return this.project(u.x, feet ? -0.2 : u.h + 0.5, u.z, out)
  }

  /** A speaker starts a line: a small bounce, so the eye finds who is talking. */
  speakerBeat(who: 'hero' | 'npc'): void {
    const u = who === 'hero' ? this.sim.hero.unit : this.sim.get(this.talkNpc)
    const w = u ? this.views.get(u.id) : undefined
    if (w) squash(w.v, 0.16)
  }

  /** A point `y` metres above the ground at (x, z) → surface pixels (damage
   *  text, pins, coach glyphs). */
  project(x: number, y: number, z: number, out: { x: number; y: number }): boolean {
    return this.cam.project(x, y + groundAt(x, z), z, out)
  }

  resize(w: number, h: number): void {
    this.cam.setViewport(w, h)
    this.vfx?.setViewport(h, CAM_FOV)
    if (this.terrain) setZoneFog(this.scene, this.terrain.theme, this.cam.dist)
  }

  get isEntered(): boolean {
    return this.entered
  }

  dispose(): void {
    setBossMusic(false)
    if (cameoPlaying(this.cameo)) { endCameo(this.sim, this.cameo!); endSceneCue(0.4) }
    hud.potionStop = false
    hud.rollStop = false
    if (this.sim.siege) {
      siegeHud.active = false
      siegeActions.build = () => false
      siegeActions.ready = () => false
    }
    this.siegeProps?.dispose()
    if (this.sim.celebrate) {
      celebrateHud.active = false
      celebrateActions.skip = () => {}
    }
    this.celebrateProps?.dispose()
    if (this.sim.assault) {
      assaultHud.active = false
      assaultActions.skipCut = () => {}
      assaultActions.skipSiege = () => {}
    }
    this.assaultProps?.dispose()
    this.rebelProps?.dispose()
    for (const id of [...this.views.keys()]) this.dropView(id)
    this.vfx.dispose()
    this.orbs.dispose()
    this.markers.dispose()
    this.bars.dispose()
    this.walls.dispose()
    this.props?.dispose()
    this.town?.dispose()
    this.crowd?.dispose()
    this.chest?.dispose()
    this.terrain.dispose()
    this.gone = true
    this.baked.dispose()
    clearGround(this.field)
    this.scene.clear()
  }
}
