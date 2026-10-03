import { AmbientLight, Frustum, Matrix4, Scene, Sphere, Vector2, type Group, type InstancedMesh, type Line, type Material, type Mesh, type Object3D, type Points, type ShaderMaterial, type SkinnedMesh } from 'three'
import type { GameMode } from '../engine/app'
import { FollowCam, CAM_FOV, CAM_PITCH } from '../engine/camera'
import { consumeEdges, type Input } from '../engine/input'
import { getRenderer } from '../engine/renderer'
import { createSlicer, yieldToBrowser, type Slice } from '../engine/slicer'
import { sceneQuality } from '../engine/quality'
import { sfx } from '../audio/sfx'
import { ENEMY_BY_ID, MINIONS } from '../data/enemies'
import { SKILL_BY_ID } from '../data/skills'
import { TOWNS, ZONES, type ThemeId, type TownId } from '../data/zones'
import { ITEM_BY_ID, type ZoneId } from '../data/items'
import { applyPlan, populateTown, populateZone, summonDragonAlly } from '../sim/director'
import { leaveVisit } from '../sim/director'
import { castSkill, createHero, cycleTarget, orderAttack, orderMove, setStick, slotState, usePotion } from '../sim/hero'
import { stepSim } from '../sim/step'
import { generateArena, generateEncounter, generateTown, generateZone, type ZonePlan } from '../sim/zoneGen'
import { Sim, findStatus } from '../sim/world'
import type { SimEvent, Unit } from '../sim/types'
import { updateCelFrame } from '../gfx/cel'
import { BAR_RANK, HealthBars, Markers, makeBlobShadow, placeBlobShadow, type BarRank } from '../gfx/markers'
import { clearGround, groundAt, setGround } from '../gfx/ground'
import type { HeightField } from '../sim/ground'
import { blowOf, trackUnit } from '../gfx/combatFx'
import { animate, squash, struck } from '../gfx/rigs/anim'
import { makeRigView, prewarmKinds, prewarmLook, type RigView } from '../gfx/rigs'
import { heroLook } from '../gfx/rigs/looks'
import { WallRocks, buildChest, buildTerrain, setZoneFog, type Terrain } from '../gfx/terrain'
import { Vfx } from '../gfx/vfx'
import { SLOW_MO, slowMoScale } from '../gfx/slowMo'
import { LevelProps } from '../gfx/levelProps'
import type { TownView } from '../gfx/townView'
import { loadTownView } from '../gfx/townLoader'
import { StillCull } from '../gfx/cull'
import { townCanTalk } from '../sim/town'
import { townAddress, townGreet } from '../sim/townLife'
import { POTION_CD, useManaPotion } from '../sim/hero'
import { nearChest, orderOpen, pickChest } from '../sim/interact'
import { hud, hudLive, pushHud, tickHud, type SkillSlotView, type TextKind } from '../state/hud'
import { heroBuild, loadoutActive, markTip, profile } from '../state/profile'
import { coach } from '../coach'
import { emitCrumbs, peekOffset } from '../coach/nudgeFx'
import { isDummy, spawnDummy, stepDummy } from '../coach/dummy'
import { markRevealUsed } from '../coach/reveal'
import { PREVIEW_FEED } from '../previewFlags'
import { setBossMusic } from '@/use/useSound'

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
  ambush?: string | null
  extra?: number
  dragonAlly?: boolean
  /** A random encounter met on the world map: its packs (`generateEncounter`). */
  encounter?: string[][]
  flags: ReadonlySet<string>
}

export interface ZoneCallbacks {
  /** The visit is decided (after its closing beat). */
  onEnd(outcome: 'victory' | 'defeat'): void
  /** The hero walked up to a townsperson. */
  onInteract(npcId: string): void
  onPause(): void
  onPanel(panel: 'map' | 'character' | 'inventory' | 'skills'): void
}

const HIT_STOP_SCALE = 0.01
const HIT_STOP_LIGHT = 0.04
const HIT_STOP_HEAVY = 0.08
const HIT_STOP_BOSS = 0.25
const TRAUMA_LIGHT = 0.2
const TRAUMA_HEAVY = 0.6
/** Seconds the world plays on after the outcome, before the result screen. */
const END_BEAT = { victory: 2.1, defeat: 1.8 }

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
  private input: Input
  private cb: ZoneCallbacks
  private terrain!: Terrain
  private vfx!: Vfx
  private markers!: Markers
  private bars!: HealthBars
  private walls = new WallRocks()
  /** The still world (scenery tiles, ground, props, houses), culled by its boxes. */
  private still = new StillCull()
  /** See-through copies of materials, held so their programs stay compiled (`warmUp`). */
  private variants: Material[] = []
  /** The height of this place's ground. */
  private field: HeightField | null = null
  /** Chests, plates, doors, bridges and the water (`gfx/levelProps.ts`). */
  private props: LevelProps | null = null
  /** A town's houses, props and life (`gfx/townView.ts`). */
  private town: TownView | null = null
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
  private stepSfx = 0
  /** The enemy the pointer is over (the drag line snaps to it). */
  private hoverId = 0
  private entered = false
  private low = sceneQuality() === 'low'
  /** A conversation is on (`setTalk`): input locked, speakers turned, camera framing them. */
  private talkOn = false
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

  private constructor(setup: ZoneSetup, plan: ZonePlan, input: Input, cb: ZoneCallbacks) {
    this.setup = setup
    this.plan = plan
    this.input = input
    this.cb = cb
    this.sim = new Sim({
      seed: setup.seed, w: plan.w, h: plan.h, level: setup.level, difficulty: setup.difficulty,
      mode: setup.kind, zone: setup.zone ?? setup.town ?? 'arena'
    })
  }

  /** Build a visit, time-sliced so the loader keeps painting. */
  static async create(setup: ZoneSetup, input: Input, cb: ZoneCallbacks, onProgress: (p01: number) => void = () => {}): Promise<ZoneMode> {
    const slice: Slice = createSlicer(12)
    const plan = setup.kind === 'town'
      ? generateTown(TOWNS[setup.town!], setup.flags, setup.seed)
      : setup.kind === 'arena'
        ? generateArena(setup.seed)
        : setup.encounter
          ? generateEncounter(setup.encounter, setup.seed)
          : generateZone(ZONES[setup.zone!], setup.seed, {
            tutorial: setup.tutorial, ambush: setup.ambush, extra: setup.extra,
            // DEV: `?branches=0` plays the zone as one road (the perf A/B arm of roadmap #70).
            ...(import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).get('branches') === '0' ? { branches: false } : {})
          })
    const m = new ZoneMode(setup, plan, input, cb)
    const sim = m.sim
    applyPlan(sim, plan)
    createHero(sim, {
      build: heroBuild(), skills: loadoutActive(), x: plan.start.x, z: plan.start.z, xpInto: profile.hero.xp,
      potions: setup.kind === 'town' ? 0 : profile.inv.potions,
      // Mana potions are a carried stock: as many slots as the health belt has.
      manaPotions: setup.kind === 'town' ? 0 : profile.inv.manaPotions, manaPotionsMax: profile.inv.potions
    })
    if (setup.kind === 'zone') populateZone(sim, plan, setup.zone!, profile.inv.items, profile.world.chests)
    // An encounter pays in gold and experience, never in the zone's gear.
    if (setup.encounter) { sim.dropTable.mob = []; sim.dropTable.chest = []; sim.dropTable.boss = [] }
    // The first visit's training dummy, until it has been dealt with once.
    if (setup.kind === 'zone' && setup.tutorial && !profile.tips.dummy) spawnDummy(sim, plan)
    // A weak device leaves out most of the folk; every visit is a different day.
    else if (setup.kind === 'town') populateTown(sim, plan, { lite: sceneQuality() === 'low', visit: profile.world.visits[setup.town!] ?? 0 })
    else sim.wave.rest = 1.6
    if (setup.dragonAlly) summonDragonAlly(sim)
    sim.events.length = 0
    onProgress(0.08)
    await slice()

    m.scene.add(new AmbientLight(0xffffff, 1))
    // The ground everything in this place stands on (`gfx/ground.ts`).
    // DEV: `?relief=0` lays every place flat (the perf A/B arm of roadmap #57).
    if (import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).get('relief') === '0') plan.height.fill(0)
    m.field = { w: plan.w, h: plan.h, height: plan.height }
    setGround(m.field)
    m.terrain = await buildTerrain(plan, setup.theme, m.scene, slice)
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
    if (setup.kind === 'arena') for (const id of ['goblin', 'goblinSlinger', 'wolf', 'bandit', 'banditChief']) kinds.add(id)
    const jobs = prewarmKinds(kinds)
    // The hero is a job of its own too (his rig is the richest: ~0.1 s at 4× CPU).
    jobs.unshift(() => prewarmLook(heroLook(profile.inv.equipped, profile.hero.gender)))
    for (let i = 0; i < jobs.length; i++) {
      jobs[i]!()
      onProgress(0.5 + ((i + 1) / jobs.length) * 0.35)
      await slice()
    }

    m.vfx = new Vfx(m.scene)
    m.markers = new Markers(m.scene)
    m.bars = new HealthBars(m.scene, 72)
    m.scene.add(m.walls.root)
    // A zone's chests (the finale's too) are level props; the colosseum keeps its prize chest.
    if (setup.kind === 'zone') {
      m.props = new LevelProps(sim, m.vfx, m.terrain.theme, n => m.cam.addTrauma(n))
      await m.props.build(plan, m.scene, slice)
    }
    if (setup.kind === 'town' && plan.town) {
      const { TownView } = await loadTownView()
      m.town = await TownView.build(plan, sim, m.scene, slice, m.vfx.particles)
    }
    if (setup.kind === 'arena' && plan.chest) {
      m.chest = buildChest()
      m.chest.root.position.set(plan.chest.x, 0, plan.chest.z)
      m.chest.root.visible = false
      m.scene.add(m.chest.root)
    }
    for (const u of sim.units) {
      m.addView(u)
      if ((u.id & 3) === 3) await slice()
    }
    m.still.collect(m.scene)
    onProgress(0.95)
    m.cam.snap()
    m.cam.follow(plan.start.x, plan.start.z, 0, 0, 0.016, groundAt(plan.start.x, plan.start.z))
    m.syncHud(true)
    onProgress(1)
    return m
  }

  // ─── Views ─────────────────────────────────────────────────────────────────

  private addView(u: Unit): void {
    // The training dummy is a level prop, not a rig (`gfx/dummyProp.ts`).
    if (this.views.has(u.id) || isDummy(u)) return
    const v = makeRigView(u, u.rank === 'hero' ? heroLook(profile.inv.equipped, profile.hero.gender) : undefined)
    const shadow = makeBlobShadow(u.r)
    this.scene.add(v.rig.root, shadow)
    this.views.set(u.id, { v, shadow, pin: null })
  }

  private dropView(id: number): void {
    const w = this.views.get(id)
    if (!w) return
    this.scene.remove(w.v.rig.root, w.shadow)
    this.town?.drop(id)
    w.v.rig.material.dispose()
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
    const all: Object3D[] = []
    this.scene.traverse((o) => { if ((o as Mesh).isMesh || (o as Points).isPoints || (o as Line).isLine) all.push(o) })
    const shown = all.map(o => o.visible)
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
      r.setScissorTest(false)
      r.setViewport(0, 0, size.x, size.y)
    }
    // A body fading in or out (a spawn, a death, stealth, a house's cut-away
    // front) is drawn see-through, and three gives a see-through material its
    // own program: compiled here, one kind of mesh at a time, not on the first
    // frame that fades someone (~0.15 s at 4× CPU, measured on the boot).
    const kinds = new Set<string>()
    for (const o of all) {
      const m = (o as Mesh).material as ShaderMaterial | undefined
      if (!m || Array.isArray(m) || m.transparent || !m.uniforms?.uOpacity) continue
      const key = ((o as SkinnedMesh).isSkinnedMesh ? 's' : (o as InstancedMesh).isInstancedMesh ? 'i' : 'm') + m.vertexShader.length + ':' + m.fragmentShader.length + Object.keys(m.defines ?? {}).join()
      if (kinds.has(key)) continue
      kinds.add(key)
      // A see-through copy, kept for the visit: three frees a program once no
      // material uses it, and flipping the live material would free (and
      // later rebuild) its opaque program instead.
      const see = m.clone()
      see.transparent = true
      this.variants.push(see)
      ;(o as Mesh).material = see
      try {
        for (const c of r.compile(o, this.camera, this.scene)) (r.properties.get(c) as { currentProgram?: { getUniforms(): unknown } }).currentProgram?.getUniforms()
      } finally {
        ;(o as Mesh).material = m
      }
      await own()
    }
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

  enter(): void {
    this.entered = true
    // The town's code, fetched while the player is busy here (see `townLoader.ts`).
    if (!this.town) setTimeout(() => { void loadTownView() }, 2500)
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

    if (i.pauseQueued) this.cb.onPause()
    if (i.panelQueued) this.cb.onPanel(i.panelQueued)
    if (!live) { setStick(sim, 0, 0); return }

    // The stick and the keys are screen-space: up on screen is −Z in the world.
    setStick(sim, i.moveX, -i.moveY)
    if (Math.hypot(i.moveX, i.moveY) > 0.3) coach.progress('move', 0.02)

    const pad = i.device === 'touch' ? 0.7 : 0.35
    for (const t of i.taps) {
      const u = this.unitAtScreen(t.x, t.y, pad)
      if (u && (u.team === 1 || u.rank === 'npc')) {
        orderAttack(sim, u.id)
        if (u.team === 1) { coach.use('target'); sfx('uiClick') }
      } else if (this.cam.screenToGround(t.x, t.y, ground)) {
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
    if (i.potionQueued && usePotion(sim)) coach.use('potion')
    if (i.manaPotionQueued && useManaPotion(sim)) { coach.use('mana'); markRevealUsed('mana') }
    if (i.targetQueued) cycleTarget(sim)
    if (i.leaveQueued && leaveVisit(sim)) sfx('uiOpen')
    if (i.interactQueued) {
      const u = h.unit
      let best: Unit | undefined
      let bd = 4
      for (const n of sim.units) {
        if (n.rank !== 'npc' || !n.npc) continue
        // Not through a wall: in the same room, or either side of a doorway.
        if (this.plan.town && !townCanTalk(this.plan.town, u.x, u.z, n.x, n.z)) continue
        const d = Math.hypot(n.x - u.x, n.z - u.z)
        if (d < bd) { bd = d; best = n }
      }
      if (best) orderAttack(sim, best.id)
      else {
        // No one to talk to: the chest in reach, if there is one.
        const c = nearChest(sim)
        if (c) orderOpen(sim, c.id)
      }
    }
  }

  /** Open the chest at a tapped ground point. The point under a finger on a
   *  chest's lid is behind the chest, so a point nearer the camera counts too. */
  private openAt(x: number, z: number, pad: number): boolean {
    const c = pickChest(this.sim, x, z, pad) ?? pickChest(this.sim, x, z + 0.7, pad)
    if (!c) return false
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
      switch (e.t) {
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
              this.cam.addTrauma(e.crit ? TRAUMA_HEAVY : TRAUMA_LIGHT * 1.6)
            } else {
              this.hitStop(HIT_STOP_LIGHT)
              this.cam.addTrauma(TRAUMA_LIGHT)
            }
            sfx(e.crit ? 'crit' : e.heavy ? 'hitHeavy' : 'hit', this.pan(e.x))
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
          sfx(e.style === 'melee' ? (e.heavy ? 'swingHeavy' : 'swing') : e.style === 'magic' ? 'cast' : 'shoot', this.pan(sim.get(e.src)?.x ?? 0), e.src === hero.id ? 1 : 0.55)
          break
        case 'cast': {
          const def = SKILL_BY_ID[e.skill]
          if (def) sfx(def.fire ? 'fire' : def.cls === 'chrono' ? 'teleport' : def.cls === 'aegis' ? 'holy' : def.cls === 'blood' ? 'blood' : def.cls === 'geo' ? 'quake' : def.cls === 'aether' ? 'shoot' : 'cast')
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
            else if (e.unit) townGreet(sim, e.unit)
            break
          }
          this.vfx.play(e, id => sim.get(id)?.h ?? 1.2)
          this.fxSound(e.id, e.x)
          if (e.id.startsWith('burst:') || e.id === 'slam' || e.id === 'quake' || e.id === 'blast') this.cam.addTrauma(TRAUMA_HEAVY * (e.id === 'quake' ? 1 : 0.55))
          break
        case 'tele':
          this.vfx.telegraph(e.tele, sim.get(e.tele.src ?? 0) ?? null, sim.time)
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
          } else this.vfx.poof(e.x, e.z, MINIONS[e.kind]?.color ?? '#ffffff', 0.8)
          break
        }
        case 'spawn': {
          const u = sim.get(e.unit)
          if (u) this.addView(u)
          break
        }
        case 'wall':
          this.walls.set(e.cells, sim.grid.w, e.on, e.fx)
          if (e.on) { sfx('quake'); this.cam.addTrauma(TRAUMA_LIGHT * 1.5) }
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
          if (e.boss && ENEMY_BY_ID[e.boss]?.rank === 'boss') pushHud({ t: 'toast', key: 'toast.boss', params: { boss: 'enemy.' + e.boss } })
          break
        case 'groupDone':
          break
        case 'wave':
          pushHud({ t: 'toast', key: 'toast.wave', params: { n: e.n } })
          sfx('alert')
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
          this.chestOpen = 0.001
          if (this.chest) this.chest.root.visible = true
          pushHud({ t: 'flash', color: '#ffffff', strength: 0.35 })
          break
        case 'defeat':
          this.cam.addTrauma(TRAUMA_HEAVY)
          break
      }
    }
    ev.length = 0
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
    // The dummy knocked apart (or walked past): the opening beat is done for good.
    if (stepDummy(this.sim)) markTip('dummy')
    this.drain()
    coach.step(this, simDt)
    if (first) consumeEdges(this.input)

    const sim = this.sim
    if (sim.ended && !this.endFired && sim.endedT >= END_BEAT[sim.ended] && (sim.ended !== 'victory' || sim.endReady)) {
      this.endFired = true
      hud.phase = sim.ended === 'victory' ? 'won' : 'dead'
      this.cb.onEnd(sim.ended)
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
    this.cam.follow(hx + this.talkDx * tk + peek.x, hz + this.talkDz * tk + peek.z, hero.vx, hero.vz, dt, groundAt(hx, hz))
    this.cam.update(dt)
    updateCelFrame(this.camera, this.cam.refDepth)

    // Things far outside the view are not posed or drawn: past the camera's
    // reach, or wholly outside the picture (a rig is not culled by three: its
    // bounds would be its rest pose's).
    const reach = this.cam.dist * this.cam.zoom * 0.62 + 7
    const reach2 = reach * reach
    viewProj.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(viewProj)
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
        bound.center.set(x, groundAt(x, z) + u.h * s * 0.5, z)
        seen = frustum.intersectsSphere(bound)
      }
      w.v.rig.root.visible = seen
      // Its ~30 bones are not walked by the scene's matrix update either.
      w.v.rig.root.matrixWorldAutoUpdate = seen
      w.shadow.visible = seen && u.alive
      if (!seen) continue
      // A townsperson's loop, held prop and bubble are set before the pose is made.
      if (u.rank === 'npc') this.town?.pose(w.v, u, fxDt)
      animate(w.v, u, x, z, this.time, fxDt)
      // Swing trails, muzzle flashes and the like are read off the pose just made.
      trackUnit(this.vfx, w.v, u)
      placeBlobShadow(w.shadow, w.v.x, w.v.z)
      if (u.alive && u.rank !== 'npc' && (u.rank !== 'hero') && (u.awake || u.hp < u.s.maxHp)) {
        // The frame says how special it is (D42); allies are green, the hero's own summons teal.
        const ours = u.team === 0
        const rank: BarRank = ours ? BAR_RANK.ally : barRank(u)
        const col = ours ? (u.ownerId === hero.id ? '#3fd8c8' : '#5fe08a') : rank === BAR_RANK.elite ? '#ffb02a' : rank === BAR_RANK.champion ? '#ff7a3a' : '#ff5a5a'
        this.bars.add(
          id, w.v.x, groundAt(w.v.x, w.v.z) + u.h * w.v.scale / Math.max(0.5, w.v.scale) + 0.45 + w.v.float + (rank === BAR_RANK.boss ? 0.25 : 0), w.v.z,
          u.hp / u.s.maxHp, u.shield / u.s.maxHp, col, Math.min(1.5, 0.7 + u.r * 0.7), rank,
          // A level on anything framed; a skull on anything well above him.
          ours ? 0 : u.level >= sim.hero.level + 3 ? -1 : rank >= BAR_RANK.elite ? u.level : 0
        )
      }
    }
    this.bars.end()
    this.town?.update(fxDt, hx, hz, sim.get(this.talkNpc), this.cam.target.x, this.cam.target.z)
    // DEV: the recorder's textless cut hides what the renderer itself paints.
    if (PREVIEW_FEED === 'pure') { this.bars.mesh.visible = false; this.markers.root.visible = false }
    this.statusFx(fxDt)

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
    this.markers.update(dt)

    this.vfx.syncProjectiles(sim.projectiles, a, fxDt)
    this.vfx.update(fxDt, sim.time)
    this.walls.update(fxDt)
    this.props?.update(fxDt, hx, hz)
    emitCrumbs(sim, this.vfx.particles, fxDt, this.low)
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
    for (let s = 0; s < 6; s++) { hudLive.cd[s] = h.cd[s]!; hudLive.cdMax[s] = h.cdMax[s]! }
    hudLive.potionCd = h.potionCd
    hudLive.manaPotionCd = h.manaPotionCd
    hudLive.manaPotionCdMax = POTION_CD
    tickHud(dt)
  }

  /** Little tells for what a unit is under: sparks for a stun, flames for a burn. */
  private statusFx(dt: number): void {
    const ps = this.vfx.particles
    const rate = this.low ? 4 : 9
    for (const u of this.sim.units) {
      if (!u.alive || !u.statuses.length) continue
      for (const s of u.statuses) {
        if (Math.random() > dt * rate) continue
        const a = Math.random() * Math.PI * 2
        const x = u.x + Math.cos(a) * u.r * 0.8
        const z = u.z + Math.sin(a) * u.r * 0.8
        switch (s.id) {
          case 'burn': ps.emit({ x, y: 0.3 + Math.random() * u.h * 0.6, z, vy: 1.6 + Math.random(), color: Math.random() < 0.5 ? '#ffb02a' : '#ff5a1a', size: 0.34, sizeEnd: 0.04, life: 0.45 }); break
          case 'poison': ps.emit({ x, y: 0.4 + Math.random() * u.h * 0.5, z, vy: 1 + Math.random(), color: '#8dff5a', size: 0.22, sizeEnd: 0.06, life: 0.6 }); break
          case 'bleed': ps.emit({ x, y: u.h * 0.6, z, vy: -0.5, color: '#ff4a6a', size: 0.18, sizeEnd: 0.04, life: 0.4, gravity: 6 }); break
          case 'stun':
          case 'confuse': ps.emit({ x: u.x + Math.cos(this.time * 6) * 0.35, y: u.h + 0.25, z: u.z + Math.sin(this.time * 6) * 0.35, color: s.id === 'stun' ? '#ffe04a' : '#d28bff', size: 0.26, sizeEnd: 0.08, life: 0.3 }); break
          case 'slow': ps.emit({ x, y: 0.15, z, vy: 0.4, color: '#9fdcff', size: 0.26, sizeEnd: 0.06, life: 0.5 }); break
          case 'haste':
          case 'accelerate': ps.emit({ x, y: 0.2 + Math.random() * 0.5, z, vx: -u.vx * 0.3, vz: -u.vz * 0.3, color: '#7fd8ff', size: 0.2, sizeEnd: 0.03, life: 0.35 }); break
          case 'damageUp':
          case 'enrage': ps.emit({ x, y: 0.2, z, vy: 2.2, color: s.id === 'enrage' ? '#ff4a3a' : '#ffb04a', size: 0.22, sizeEnd: 0.03, life: 0.5 }); break
          case 'regen': ps.emit({ x, y: 0.2, z, vy: 1.8, color: '#7dff8a', size: 0.2, sizeEnd: 0.03, life: 0.6 }); break
          case 'invulnerable':
          case 'reflect': ps.emit({ x, y: 0.3 + Math.random() * u.h, z, color: '#fff2a8', size: 0.3, sizeEnd: 0.05, life: 0.3 }); break
          case 'overheat': ps.emit({ x, y: u.h * 0.7, z, vy: 2.4, color: '#ff8a3a', size: 0.4, sizeEnd: 0.6, life: 0.5 }); break
          case 'stealth': ps.emit({ x, y: 0.3 + Math.random() * u.h * 0.5, z, vy: 0.4, color: '#8a8fa8', size: 0.5, sizeEnd: 0.9, life: 0.5 }); break
          // Held fast in ice: a glint off it now and then. Afraid: a bead of sweat flung off.
          case 'frozen': ps.emit({ x, y: 0.2 + Math.random() * u.h, z, color: '#eaf8ff', size: 0.3, sizeEnd: 0.02, life: 0.35 }); break
          case 'fear': ps.emit({ x, y: u.h * 0.9, z, vx: Math.cos(a) * 1.6, vy: 1.4, vz: Math.sin(a) * 1.6, color: '#9fdcff', size: 0.18, sizeEnd: 0.05, life: 0.4, gravity: 7 }); break
          default: break
        }
      }
      const sh = u.shield > 0 ? findStatus(u, 'invulnerable') === undefined : false
      if (sh && Math.random() < dt * rate) ps.emit({ x: u.x + (Math.random() - 0.5) * u.r * 2, y: 0.3 + Math.random() * u.h, z: u.z + (Math.random() - 0.5) * u.r * 2, color: '#ffe9a8', size: 0.2, sizeEnd: 0.04, life: 0.3 })
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
    if (Math.random() > dt * (this.low ? 1.5 : 5)) return
    const t = this.cam.target
    const x = t.x + (Math.random() - 0.5) * 22
    const z = t.z + (Math.random() - 0.5) * 22
    this.vfx.particles.emit({ x, y: 0.3 + Math.random() * 2.5, z, vx: (Math.random() - 0.5) * 0.4, vy: 0.15 + Math.random() * 0.3, vz: (Math.random() - 0.5) * 0.4, color: this.terrain.theme.mote, size: 0.16, sizeEnd: 0.03, life: 2 + Math.random() * 2 })
  }

  /** Mirror the fight into the reactive HUD state. */
  private syncHud(force: boolean): void {
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
    hud.gold = profile.gold + h.gold
    hud.potions = h.potions
    hud.potionsMax = h.potionsMax
    hud.potionReady = h.potionCd <= 0
    hud.manaPotions = h.manaPotions
    hud.manaPotionMax = h.manaPotionsMax
    hud.manaPotionReady = h.manaPotionCd <= 0
    let changed = force
    const next: SkillSlotView[] = []
    for (let s = 0; s < 6; s++) {
      const st = slotState(sim, s)
      const v: SkillSlotView = { id: h.skills[s] ?? '', ready: st.ready, noMana: st.noMana, locked: st.locked, active: false }
      const cur = hud.skills[s]
      if (!cur || cur.id !== v.id || cur.ready !== v.ready || cur.noMana !== v.noMana || cur.locked !== v.locked) changed = true
      next.push(v)
    }
    if (changed) hud.skills = next
    const st = u.statuses
    if (st.length !== hud.statuses.length || st.some((s, k) => hud.statuses[k] !== s.id)) hud.statuses = st.map(s => s.id)
    const t = sim.live(h.order.targetId)
    hud.targetKey = t && t.team === 1 ? 'enemy.' + t.kind : ''
    hud.targetLevel = t?.level ?? 0
    hud.targetHp01 = t ? t.hp / t.s.maxHp : 0
    hud.targetElite = t?.rank === 'elite'
    let boss: Unit | undefined
    // A zone may hold several bosses (a branch boss, the finale's, roadmap
    // #70): the plate shows the nearest one that is up.
    let bossD = Infinity
    for (const e of sim.units) {
      if (!e.alive || e.rank !== 'boss' || e.team !== 1 || !e.awake) continue
      const d = Math.hypot(e.x - u.x, e.z - u.z)
      if (d < bossD) { bossD = d; boss = e }
    }
    hud.bossKey = boss ? 'enemy.' + boss.kind : ''
    hud.bossHp01 = boss ? boss.hp / boss.s.maxHp : 0
    // The boss theme plays for exactly as long as the boss plate shows.
    setBossMusic(boss !== undefined && !sim.ended)
    hud.groupsDone = sim.groupsDone
    hud.groupsTotal = sim.groups.length
    hud.wave = sim.wave.n
    hud.zoneKey = this.setup.zone ?? this.setup.town ?? 'arena'
    hud.zoneLevel = sim.level
    // The townsperson within reach.
    let near = ''
    if (this.setup.kind === 'town') {
      let bd = 3.2
      for (const n of sim.units) {
        if (n.rank !== 'npc' || !n.npc) continue
        if (this.plan.town && !townCanTalk(this.plan.town, u.x, u.z, n.x, n.z)) continue
        const d = Math.hypot(n.x - u.x, n.z - u.z)
        if (d < bd) { bd = d; near = n.npc }
      }
    }
    hud.interactKey = near
    // The chest within reach, for the "Open" prompt.
    hud.interactChest = ((!sim.ended || (sim.ended === 'victory' && !sim.leaving)) && u.alive && this.props && nearChest(sim)?.tier) || ''
    // After the finale falls: the Leave button, whether the finale's chest is
    // open yet, and how many chests the place still holds.
    hud.canLeave = this.setup.kind === 'zone' && sim.ended === 'victory' && !sim.leaving
    let left = 0
    let finaleOpen = false
    for (const c of sim.chests) {
      if (c.role === 'finale') finaleOpen = c.state === 'open'
      if (c.state === 'closed' || c.state === 'opening') left++
    }
    hud.chestsLeft = left
    hud.finaleOpen = finaleOpen
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
    if (!on) { this.talkHold = 0.3; townAddress(sim, 0); return }
    const npc = npcId ? sim.units.find(u => u.npc === npcId) : undefined
    if (npc) { this.talkNpc = npc.id; this.talkFace = npc.facing }
    // They stop what they are doing and turn to him (`sim/townLife.ts`).
    townAddress(sim, npc ? npc.id : 0)
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
    for (const id of [...this.views.keys()]) this.dropView(id)
    this.vfx.dispose()
    this.markers.dispose()
    this.bars.dispose()
    this.walls.dispose()
    this.props?.dispose()
    this.town?.dispose()
    this.chest?.dispose()
    this.terrain.dispose()
    for (const v of this.variants) v.dispose()
    clearGround(this.field)
    this.scene.clear()
  }
}
