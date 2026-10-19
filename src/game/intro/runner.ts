import { shallowReactive } from 'vue'
import { app, type GameMode } from '../engine/app'
import { createInput } from '../engine/input'
import { precompile } from '../boot'
import { ZoneMode, type ZoneCallbacks, type ZoneSetup } from '../modes/zoneMode'
import { loadProfile, profile, saveProfile, setSaveSandbox } from '../state/profile'
import { hud } from '../state/hud'
import { referenceBuild } from '../sim/bot'
import { castSkill, orderAttack } from '../sim/hero'
import type { Unit } from '../sim/types'
import { ACTIVE_SLOTS, PASSIVE_SLOTS, SKILLS } from '../data/skills'
import type { ZoneId } from '../data/items'
import { ZONES } from '../data/zones'
import { speakLine, stopSpeech } from '../audio/speech'
import { trackForTheme } from '../audio/themes'
import { setMusicTrack, startGameMusic } from '@/use/useSound'
import { isGamePaused } from '@/use/useGamePause'
import { saveDataVersion } from '@/use/useSaveStatus'
import { INTRO_TIP } from './state'
import {
  BUILD_CAP_S, FINALE_AT, INTRO_BELT, INTRO_CASTS, INTRO_CLASS, INTRO_FOE_HP, INTRO_FOE_LEVEL, INTRO_LEVEL, INTRO_LINES,
  INTRO_PACK, INTRO_SEED, INTRO_ZONE, INTRO_ZOOMS, SCENE_AT, createHoldSkip, createIntroClock, lineAt, titleAt, veilAt
} from './script'

/**
 * ─── The intro, played (roadmap #130) ────────────────────────────────────────
 *
 * A lazy chunk: fetched only when the intro plays (`GameScene.vue`). The scene
 * is the game's own: the tundra built as a visit builds it, a level-30
 * Pyromancer in it, and the skills cast through the same `castSkill` a tap
 * reaches. Only the timing is scripted (`intro/script.ts`).
 *
 * Nothing it does is kept. The made-up hero is swapped into the profile for
 * the build and swapped out again at the end, and saving is sandboxed in
 * between (a cloud save that lands meanwhile is read again afterwards). Its
 * input is a fresh one no key or finger reaches, its callbacks do nothing
 * (no result screen, no reward, no funnel event), and its pack is never the
 * finale, so there is no victory to report. The one thing written is the
 * `introSeen` flag, once it has ended or been skipped.
 *
 * A place already on screen (a replay from the options) is kept, not
 * disposed: the intro borrows the renderer and hands it back.
 */

/** What the overlay draws (`IntroLayer.vue`). */
export const introView = shallowReactive({
  /** The script's clock, seconds. */
  t: 0,
  /** The place is built and showing. */
  ready: false,
  /** The narration line on screen (index into INTRO_LINES, -1: none). */
  line: -1,
  title: true,
  /** 0..1: how black the screen is. */
  veil: 1,
  /** 0..1: the hold-to-skip ring. */
  skip: 0
})

let hold = createHoldSkip()
let end: (() => void) | null = null

/** The overlay's hold-to-skip (Space, or a finger or the mouse on the button). */
export const holdSkip = (down: boolean): void => { if (down) hold.press(); else hold.release() }
/** End the intro now (it is over, or it could not play). */
export const endIntro = (): void => end?.()

const NONE: ZoneCallbacks = { onEnd: () => {}, onInteract: () => {}, onPause: () => {}, onPanel: () => {} }

/** The place's music again, for the scene the intro hands the renderer to. */
export const settleAfterIntro = (mode: GameMode | null): void => {
  if (mode instanceof ZoneMode) setMusicTrack(trackForTheme(mode.setup.theme))
}

/** The made-up hero, in the profile for the build. Returns the way back. */
const lendHero = (): (() => void) => {
  const kept = { level: profile.level, hero: profile.hero, inv: profile.inv }
  const version = saveDataVersion.value
  setSaveSandbox(true)
  const ref = referenceBuild({ level: INTRO_LEVEL, cls: INTRO_CLASS })
  const active = new Array<string>(ACTIVE_SLOTS).fill('')
  INTRO_BELT.forEach((id, i) => { active[i] = id })
  profile.level = INTRO_LEVEL
  profile.hero = {
    xp: 0, attrs: { ...ref.build.attrs }, points: 0, pointsSeen: 0,
    learned: SKILLS.map(s => s.id), active,
    passive: Array.from({ length: PASSIVE_SLOTS }, (_, i) => ref.build.passives[i] ?? ''),
    gender: kept.hero.gender
  }
  profile.inv = {
    ...kept.inv,
    items: Object.values(ref.build.equipped).filter((id): id is string => !!id),
    equipped: { ...ref.build.equipped },
    fresh: [], potions: 3, manaPotions: 0, upgrades: {}, herbs: {}, ores: {}, oresFound: [], elixirs: {}, elixirPick: ''
  }
  return () => {
    profile.level = kept.level
    profile.hero = kept.hero
    profile.inv = kept.inv
    setSaveSandbox(false)
    // A cloud save landed while the intro played: read it again.
    if (saveDataVersion.value !== version) loadProfile()
  }
}

const setup = (): ZoneSetup => ({
  kind: 'zone', zone: INTRO_ZONE as ZoneId, theme: ZONES[INTRO_ZONE as ZoneId].theme, seed: INTRO_SEED,
  level: INTRO_FOE_LEVEL, difficulty: 1, tutorial: false, ambush: null, extra: 0, flags: new Set()
})

const build = async (): Promise<ZoneMode> => {
  const m = await ZoneMode.create(setup(), createInput(), NONE)
  await precompile(m)
  await m.warmUp(async () => {})
  return m
}

/** The hero a few steps short of the pack, the pack and its neighbours awake and tougher. */
const stage = (m: ZoneMode): void => {
  const sim = m.sim
  const packs = m.plan.packs.filter(p => !p.finale)
  const p = packs[Math.min(INTRO_PACK, packs.length - 1)] ?? m.plan.packs[0]
  if (!p) return
  const u = sim.hero.unit
  u.x = u.px = p.x
  u.z = u.pz = p.z + 7
  u.hasGoal = false
  sim.hero.order = { kind: 'none', targetId: 0, x: u.x, z: u.z }
  m.cam.snap()
  for (const e of sim.units) {
    if (!e.alive || e.team !== 1 || Math.hypot(e.x - p.x, e.z - p.z) > p.r + 8) continue
    e.awake = true
    e.s.maxHp *= INTRO_FOE_HP
    e.hp = e.s.maxHp
  }
  for (const g of sim.groups) if (Math.hypot(g.x - p.x, g.z - p.z) < p.r + 8) g.awake = true
}

/** The middle of the awake foes near the hero (where a ground skill lands). */
const aimAt = (m: ZoneMode): { x: number; z: number } | null => {
  const u = m.sim.hero.unit
  let x = 0
  let z = 0
  let n = 0
  for (const e of m.sim.units) {
    if (!e.alive || e.team !== 1 || !e.awake || Math.hypot(e.x - u.x, e.z - u.z) > 12) continue
    x += e.x
    z += e.z
    n++
  }
  return n ? { x: x / n, z: z / n } : null
}

const foes = (m: ZoneMode): Unit[] => m.sim.units.filter(e => e.alive && e.team === 1 && e.awake)

/**
 * Play the intro, resolving when it has ended or been skipped. `lang`: the
 * language the narration is spoken in (subtitles follow the game's own).
 * `next`: the scene that takes over when nothing is on screen yet (the
 * first boot), so its music is the one restored.
 */
export const runIntro = (lang: () => string, next: GameMode | null = null): Promise<void> => new Promise<void>((resolve) => {
  hold = createHoldSkip()
  const clock = createIntroClock()
  const prev = app.mode
  const prevPhase = hud.phase
  const giveBack = lendHero()
  let mode: ZoneMode | null = null
  let shown = false
  let over = false
  let raf = 0
  let last = performance.now()
  let wall = 0
  let spoken = 0
  /** The narrator is still speaking until this point of the clock (a line never cuts the last one off). */
  let busyUntil = 0
  let cast = 0
  let zoom = 0
  let finale = false

  Object.assign(introView, { t: 0, ready: false, line: -1, title: true, veil: 1, skip: 0 })

  const finish = (): void => {
    if (over) return
    over = true
    end = null
    cancelAnimationFrame(raf)
    stopSpeech()
    if (shown) {
      app.mode = prev
      if (prev) app.resize()
    }
    mode?.dispose()
    mode = null
    giveBack()
    hud.phase = prevPhase
    settleAfterIntro(prev ?? next)
    profile.tips[INTRO_TIP] = true
    saveProfile()
    introView.ready = false
    resolve()
  }
  end = finish

  build().then((m) => {
    if (over) { m.dispose(); return }
    stage(m)
    mode = m
  }).catch((e) => { console.warn('[intro] the scene could not be built', e); finish() })

  const show = (m: ZoneMode): void => {
    shown = true
    app.mode = m
    app.resize()
    m.enter()
    app.setWanted(true)
    setMusicTrack(trackForTheme(m.setup.theme))
    startGameMusic()
    introView.ready = true
  }

  const direct = (m: ZoneMode, t: number): void => {
    const sim = m.sim
    const u = sim.hero.unit
    // The hero is the show: never hurt, never dry.
    u.hp = u.s.maxHp
    u.mana = u.s.maxMana
    while (zoom < INTRO_ZOOMS.length && t >= INTRO_ZOOMS[zoom]!.at) {
      const z = INTRO_ZOOMS[zoom++]!
      m.cam.punchZoom(z.to, z.dur, z.hold)
    }
    if (!finale && t >= FINALE_AT) {
      finale = true
      // The meteors finish the field.
      for (const e of foes(m)) e.hp = Math.min(e.hp, e.s.maxHp * 0.12)
    }
    // A cast that is due goes off as soon as the hero is free (a swing ends first);
    // one that cannot (no one in reach) is let go after a second.
    const next = INTRO_CASTS[cast]
    if (next && t >= next.at) {
      if (castSkill(sim, next.slot, aimAt(m)) || t > next.at + 1) cast++
      return
    }
    if (!u.action && sim.hero.order.kind === 'none') {
      const target = sim.nearest(1, u.x, u.z, 30)
      if (target) orderAttack(sim, target.id)
    }
  }

  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame)
    const real = Math.min(0.1, Math.max(0, (now - last) / 1000))
    last = now
    // An ad, a portal pause, a hidden tab: the intro stands still with the game.
    const dt = isGamePaused.value ? 0 : real
    wall += dt
    if (hold.tick(dt)) { finish(); return }
    introView.skip = hold.progress
    const m = mode
    if (!shown && m && clock.t >= SCENE_AT) show(m)
    if (!shown && wall > BUILD_CAP_S) { finish(); return }
    const t = clock.tick(dt, shown)
    introView.t = t
    // The subtitles never run ahead of the voice.
    introView.line = Math.min(lineAt(t), spoken - 1)
    introView.title = titleAt(t)
    introView.veil = veilAt(t, shown)
    if (spoken < INTRO_LINES.length && t >= INTRO_LINES[spoken]!.at && t >= busyUntil) {
      busyUntil = Infinity
      void speakLine(INTRO_LINES[spoken++]!.id, lang())
        .then((d) => { busyUntil = clock.t + (d > 0 ? d + 0.15 : 0) }, () => { busyUntil = clock.t })
    }
    if (shown && m) direct(m, t)
    if (clock.done) finish()
  }
  raf = requestAnimationFrame(frame)
})
