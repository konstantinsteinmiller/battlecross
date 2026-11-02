import { shallowReactive } from 'vue'
import { app, type GameMode } from '../engine/app'
import { createInput } from '../engine/input'
import { precompile } from '../boot'
import { ZoneMode, type ZoneCallbacks, type ZoneSetup } from '../modes/zoneMode'
import { profile, saveProfile } from '../state/profile'
import { hud } from '../state/hud'
import { applyStatus, dealDamage } from '../sim/combat'
import { spawnEnemy, spawnMinion } from '../sim/spawn'
import { plainStats } from '../sim/stats'
import { newAction, type Sim } from '../sim/world'
import type { Unit } from '../sim/types'
import type { ZoneId } from '../data/items'
import { ZONES } from '../data/zones'
import { stopSpeech } from '../audio/speech'
import { setZoneFog } from '../gfx/terrain'
import { trackForTheme } from '../audio/themes'
import { setMusicTrack, startGameMusic } from '@/use/useSound'
import { isGamePaused } from '@/use/useGamePause'
import { INTRO_TIP, introBoot } from './state'
import { setSfxGate } from '../audio/sfx'
import { startFirstLevel } from '../flow'
import {
  BUILD_CAP_S, INTRO_ACTS, INTRO_BEAST, INTRO_DRAGON, INTRO_FOE_LEVEL, INTRO_LENGTH, INTRO_MAGE, INTRO_PACK, INTRO_SEED, INTRO_ZONE,
  ENTRY_AT, ENTRY_S, INTRO_ZOOMS, SCENE_AT, createIntroClock, labelAt, veilAt, type IntroAct
} from './script'

/**
 * ─── The intro, played (roadmap #130, the film of #183) ──────────────────────
 *
 * A lazy chunk: fetched only when the intro plays (`GameScene.vue`). The scene
 * is the game's own: the tundra built as a visit builds it, the player's hero
 * face down in the snow, a drake over him, and two heroes of another league —
 * a beast caller with her pack and an elementalist — who kill it and walk off.
 * Their spells are drawn by the game's own effects, timed by the script
 * (`intro/script.ts`); nothing here is kept but the `introSeen` flag.
 *
 * Its input is a fresh one no key or finger reaches, its callbacks do nothing
 * (no result screen, no reward, no funnel event), its pack is never the
 * finale, so there is no victory to report. A place already on screen (the
 * opening fight, held still behind the hero choice) is kept, not disposed: the
 * intro borrows the renderer and hands it back.
 */

/** What the overlay draws (`IntroLayer.vue`). */
export const introView = shallowReactive({
  /** The script's clock, seconds. */
  t: 0,
  /** The place is built and showing. */
  ready: false,
  /** 0..1: how black the screen is. */
  veil: 1,
  /** 0..1: how visible "1 month later…" is. */
  label: 0
})

let end: (() => void) | null = null

/** Skip: the film is over now (the button, or Space). */
export const skipIntro = (): void => end?.()
/** End the intro now (it is over, or it could not play). */
export const endIntro = (): void => end?.()

const NONE: ZoneCallbacks = { onEnd: () => {}, onInteract: () => {}, onPause: () => {}, onPanel: () => {} }

/** The place's music again, for the scene the intro hands the renderer to. */
export const settleAfterIntro = (mode: GameMode | null): void => {
  if (mode instanceof ZoneMode) setMusicTrack(trackForTheme(mode.setup.theme))
}

const setup = (): ZoneSetup => ({
  kind: 'zone', zone: INTRO_ZONE as ZoneId, theme: ZONES[INTRO_ZONE as ZoneId].theme, seed: INTRO_SEED,
  level: INTRO_FOE_LEVEL, difficulty: 1, tutorial: false, ambush: null, extra: 0, flags: new Set()
})

/**
 * The scene, built and staged while the hero choice shows (#189): the boot hands it to the game view as its first mode,
 * and `runIntro` plays on it. Null until prepared (or once taken).
 */
let prepared: { mode: ZoneMode; cast: Cast } | null = null

const build = async (): Promise<ZoneMode> => {
  const m = await ZoneMode.create(setup(), createInput(), NONE)
  await precompile(m)
  await m.warmUp(async () => {})
  return m
}

/** The cast of the film, once the scene is staged. */
interface Cast {
  hero: Unit
  mage: Unit
  beast: Unit
  dragon: Unit
  /** Where each of the two walks off to once the fight is won. */
  leave: { mage: { x: number; z: number }; beast: { x: number; z: number } }
  /** Where each of the two lands, and from where they leapt (the entry, #188). */
  land: { mage: { x: number; z: number }; beast: { x: number; z: number } }
  fled: boolean
  landed?: boolean
}

/** A person of the story: an NPC rig (the school master's look), untouchable. */
const person = (sim: Sim, kind: string, x: number, z: number, facing: number): Unit => {
  const u = sim.addUnit({
    kind, team: 0, rank: 'npc', level: 30, x, z, r: 0.45, h: 1.45,
    s: plainStats({ hp: 1000, dmg: 0, speed: 4.4 }), facing
  })
  u.x = u.px = x
  u.z = u.pz = z
  return u
}

/**
 * Stage it: the tundra's second pack's ground cleared, a drake in the middle,
 * the player's hero on the ground in front of it, the heroes at either side.
 */
const stage = (m: ZoneMode): Cast | null => {
  const sim = m.sim
  const packs = m.plan.packs.filter(p => !p.finale)
  const p = packs[Math.min(INTRO_PACK, packs.length - 1)] ?? m.plan.packs[0]
  if (!p) return null
  // Nobody else of the place is in the picture.
  // (a copy: `dismiss` takes the unit out of the list being walked, and every second one would be skipped)
  for (const e of [...sim.units]) if (e.team === 1) sim.dismiss(e)
  sim.wave.rest = 1e9
  const dragon = spawnEnemy(sim, INTRO_DRAGON, p.x, p.z - 3.2, 0)
  if (!dragon) return null
  dragon.awake = true
  dragon.s.maxHp *= 60
  dragon.hp = dragon.s.maxHp
  dragon.facing = 0
  // It stands and takes it: its moves and calls are the heroes' to show off, not its own to land on the one in the snow.
  dragon.aiT = 1e9
  dragon.rooted = true
  // The player's hero: face down in the snow in front of it, hurt by nothing.
  const hero = sim.hero.unit
  hero.x = hero.px = p.x
  hero.z = hero.pz = p.z + 3
  hero.hasGoal = false
  hero.facing = Math.PI
  sim.hero.order = { kind: 'none', targetId: 0, x: hero.x, z: hero.z }
  applyStatus(sim, hero, 'knockdown', 1e9, 1, null, { quiet: true })
  applyStatus(sim, hero, 'invulnerable', 1e9, 1, hero, { quiet: true })
  // They leap in from beyond the picture's edge (#188): each starts far out and high, and lands on the mark at the entry beat.
  const land = { mage: { x: p.x - 3.6, z: p.z + 0.6 }, beast: { x: p.x + 3.6, z: p.z + 0.6 } }
  const mage = person(sim, INTRO_MAGE, land.mage.x - ENTRY_RUN, land.mage.z + ENTRY_RUN * 0.4, -0.7)
  const beast = person(sim, INTRO_BEAST, land.beast.x + ENTRY_RUN, land.beast.z + ENTRY_RUN * 0.4, 0.7)
  for (const u of [mage, beast]) u.stunt = { lift: ENTRY_HIGH, flip: 0 }
  m.hideBars = true
  // The haze is set for the usual view: with the camera pulled back it would swallow the dragon.
  setZoneFog(m.scene, m.terrainTheme(), m.cam.dist * INTRO_ZOOMS[0]!.to)
  m.cam.snap()
  return { hero, mage, beast, dragon, leave: { mage: { x: p.x - 26, z: p.z + 14 }, beast: { x: p.x + 26, z: p.z + 14 } }, land, fled: false }
}

/** How far out (m) and how high (m) the two start their leap from. */
const ENTRY_RUN = 14
const ENTRY_HIGH = 9

/**
 * The entrance (#188): from the edge of the picture a long arc in, a forward flip on the way down, and a hero landing
 * (a crouch, a slam of dust and a ring) on the mark. `k` is 0..1 over the leap's seconds.
 */
const entry = (sim: Sim, c: Cast, t: number): void => {
  const k = Math.min(1, Math.max(0, (t - ENTRY_AT) / ENTRY_S))
  for (const [u, to, sign] of [[c.mage, c.land.mage, -1], [c.beast, c.land.beast, 1]] as const) {
    const run = ENTRY_RUN * (1 - k)
    u.x = u.px = to.x + sign * run
    u.z = u.pz = to.z + run * 0.4
    // An arc: up fast, over, down onto the mark; the flip is spent in the middle of it.
    u.stunt = { lift: ENTRY_HIGH * 4 * k * (1 - k) * (k < 0.5 ? 1 : 1 + 0.0), flip: Math.min(1, Math.max(0, (k - 0.15) / 0.6)) }
    u.facing = Math.atan2(-sign * 1, -0.4)
    u.anim = 'idle'
  }
  if (k >= 1 && !c.landed) {
    c.landed = true
    for (const [u, to] of [[c.mage, c.land.mage], [c.beast, c.land.beast]] as const) {
      u.stunt = undefined
      u.x = u.px = to.x
      u.z = u.pz = to.z
      sim.emit({ t: 'fx', id: 'slam', x: to.x, z: to.z, r: 3.4, color: '#e8f4ff' })
      sim.emit({ t: 'fx', id: 'quake', x: to.x, z: to.z, r: 3, color: '#cfe8ff' })
    }
  }
}

/** Build and stage the film's scene now (the boot's first mode); `runIntro` takes it. */
export const prepareIntro = async (onProgress: (p01: number) => void = () => {}): Promise<ZoneMode> => {
  onProgress(0.05)
  const m = await build()
  const cast = stage(m)
  if (!cast) { m.dispose(); throw new Error('the intro scene could not be staged') }
  onProgress(1)
  prepared = { mode: m, cast }
  return m
}

/** At most a few sounds at once, and one of a kind at a time: a film of spells is not a wall of noise. */
const soundGate = (): ((name: string) => boolean) => {
  const last = new Map<string, number>()
  let windowAt = 0
  let inWindow = 0
  return (name) => {
    const now = performance.now()
    if (now - (last.get(name) ?? -1e9) < 140) return false
    if (now - windowAt > 160) { windowAt = now; inWindow = 0 }
    if (inWindow >= 3) return false
    inWindow++
    last.set(name, now)
    return true
  }
}

/** A person casts: the pose of the spell they name, facing the dragon. */
const pose = (u: Unit, skill: string, at: Unit): void => {
  u.facing = Math.atan2(at.x - u.x, at.z - u.z)
  u.action = newAction(u, skill, 0.3, 0.75, at.id, at.x, at.z)
  u.anim = 'cast'
  u.animT = 0
  u.animStyle = 1
}

const hit = (sim: Sim, c: Cast, dmg: number, type: string): void => {
  dealDamage(sim, null, c.dragon, dmg, { type, spell: true, canCrit: false } as Parameters<typeof dealDamage>[4])
}

const FIRE = '#ff7a1a'
const FROST = '#a8d8ff'
const BOLT = '#ffe14a'

/** One beat of the film. */
const play = (sim: Sim, c: Cast, who: 'beast' | 'mage' | 'both', act: IntroAct): void => {
  const d = c.dragon
  const lob = (from: Unit, color: string): void => {
    sim.emit({ t: 'fx', id: 'lob:holy', x: from.x, z: from.z, x2: d.x, z2: d.z, dur: 0.45, color })
    sim.after(0.45, () => {
      sim.emit({ t: 'fx', id: 'burst:bolt', x: d.x, z: d.z, r: 2.6, color })
      hit(sim, c, 40, 'fire')
    })
  }
  void who
  switch (act) {
    case 'summon': {
      // The whole pack: three wolves, a bear and a hawk, at her side and in the dragon's face.
      pose(c.beast, 'wildHunt', d)
      sim.emit({ t: 'fx', id: 'roar', x: c.beast.x, z: c.beast.z, r: 6, color: '#4fb85a' })
      const pack: Array<[string, number, number]> = [
        ['packWolf', -2, -3], ['packWolf', 1, -4.5], ['packWolf', -4, -1.5], ['packBear', 2.5, -2.5], ['packHawk', 0, -3]
      ]
      for (const [kind, dx, dz] of pack) {
        const m = spawnMinion(sim, kind, c.beast.x + dx, c.beast.z + dz, 12, false)
        if (!m) continue
        m.s.maxHp *= 200
        m.hp = m.s.maxHp
        applyStatus(sim, m, 'invulnerable', 1e9, 1, m, { quiet: true })
        sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: '#4fb85a' })
      }
      break
    }
    case 'fire': pose(c.mage, 'fireball', d); lob(c.mage, FIRE); break
    case 'frost':
      pose(c.mage, 'frostLance', d)
      sim.emit({ t: 'fx', id: 'burst:icicle', x: d.x, z: d.z, r: 3, color: FROST })
      lob(c.mage, FROST)
      break
    case 'hawk':
      pose(c.beast, 'callHawk', d)
      sim.emit({ t: 'fx', id: 'dash', x: c.beast.x, z: c.beast.z, x2: d.x, z2: d.z, color: '#f0d890' })
      sim.after(0.4, () => { sim.emit({ t: 'fx', id: 'burst:bolt', x: d.x, z: d.z, r: 2.2, color: '#f0d890' }); hit(sim, c, 30, 'physical') })
      break
    case 'bolt':
      pose(c.mage, 'chainSpark', d)
      for (let i = 0; i < 3; i++) {
        sim.after(i * 0.18, () => {
          sim.emit({ t: 'fx', id: 'burst:bolt', x: d.x + (i - 1) * 1.6, z: d.z + (i % 2 ? 1 : -1), r: 2, color: BOLT })
          hit(sim, c, 20, 'lightning')
        })
      }
      break
    case 'storm':
      pose(c.mage, 'elementalConvergence', d)
      sim.emit({ t: 'fx', id: 'roar', x: c.mage.x, z: c.mage.z, r: 8, color: '#e86bff' })
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        const x = d.x + Math.cos(a) * 3.2
        const z = d.z + Math.sin(a) * 3.2
        sim.after(0.2 + i * 0.28, () => {
          sim.emit({ t: 'fx', id: 'fall:holy', x, z, r: 2, dur: 0.5, color: FIRE })
          sim.after(0.5, () => { sim.emit({ t: 'fx', id: 'burst:bolt', x, z, r: 2.4, color: FIRE }); hit(sim, c, 25, 'fire') })
        })
      }
      break
    case 'slay':
      sim.emit({ t: 'fx', id: 'quake', x: d.x, z: d.z, r: 8, color: FIRE })
      dealDamage(sim, null, d, 1e12, { type: 'true', canCrit: false } as Parameters<typeof dealDamage>[4])
      break
    case 'flee':
      // They walk off the way they came, not one look at the hero in the snow.
      c.fled = true
      break
  }
}

/** The two leave: a steady walk to their own side's edge of the picture. */
const walkOff = (c: Cast, dt: number): void => {
  for (const [u, to] of [[c.mage, c.leave.mage], [c.beast, c.leave.beast]] as const) {
    const dx = to.x - u.x
    const dz = to.z - u.z
    const dist = Math.hypot(dx, dz)
    if (dist < 0.2) continue
    const step = Math.min(dist, 4.6 * dt)
    u.x = u.px = u.x + (dx / dist) * step
    u.z = u.pz = u.z + (dz / dist) * step
    u.facing = Math.atan2(dx, dz)
    u.anim = 'walk'
    u.action = null
  }
}

/** The poses run on the clock the film keeps (these two are not stepped as fighters). */
const tickPose = (u: Unit, dt: number): void => {
  const a = u.action
  if (!a) return
  a.t += dt
  if (a.t >= a.end) { u.action = null; u.anim = 'idle' }
}

/**
 * Play the intro, resolving when it has ended or been skipped. `next`: the
 * scene that takes over when nothing is on screen yet (the first boot), so its
 * music is the one restored.
 */
export const runIntro = (next: GameMode | null = null): Promise<void> => new Promise<void>((resolve) => {
  const clock = createIntroClock()
  const prev = app.mode
  const prevPhase = hud.phase
  const pre = prepared
  prepared = null
  let mode: ZoneMode | null = pre?.mode ?? null
  let cast: Cast | null = pre?.cast ?? null
  let shown = !!pre
  const boot = !!pre
  introBoot.value = false
  setSfxGate(soundGate())
  let over = false
  let raf = 0
  let last = performance.now()
  let wall = 0
  let beat = 0
  let zoom = 0

  Object.assign(introView, { t: 0, ready: false, veil: 1, label: 0 })

  const finish = (): void => {
    if (over) return
    over = true
    end = null
    cancelAnimationFrame(raf)
    stopSpeech()
    setSfxGate(null)
    profile.tips[INTRO_TIP] = true
    saveProfile()
    if (boot) {
      // The film ran on the game's first scene: the opening level is built behind the black (the label stays up while it
      // builds) and takes the renderer over; the veil then lifts on it.
      mode = null
      hud.phase = prevPhase
      introView.veil = 1
      introView.label = 1
      void startFirstLevel().catch((e) => console.warn('[intro] the opening level could not be built', e)).finally(() => {
        // The black lifts off the opening level over a third of a second.
        let k = 1
        const lift = window.setInterval(() => {
          k -= 0.08
          introView.veil = Math.max(0, k)
          introView.label = Math.max(0, k)
          if (k > 0) return
          window.clearInterval(lift)
          introView.ready = false
          resolve()
        }, 30)
      })
      return
    }
    if (shown) {
      app.mode = prev
      if (prev) app.resize()
    }
    mode?.dispose()
    mode = null
    hud.phase = prevPhase
    settleAfterIntro(prev ?? next)
    introView.ready = false
    resolve()
  }
  end = finish

  if (pre) { setMusicTrack(trackForTheme(pre.mode.setup.theme)); startGameMusic(); app.setWanted(true); introView.ready = true }
  else build().then((m) => {
    if (over) { m.dispose(); return }
    cast = stage(m)
    if (!cast) { m.dispose(); finish(); return }
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

  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame)
    const real = Math.min(0.1, Math.max(0, (now - last) / 1000))
    last = now
    // An ad, a portal pause, a hidden tab: the intro stands still with the game.
    const dt = isGamePaused.value ? 0 : real
    wall += dt
    const m = mode
    if (!shown && m && clock.t >= SCENE_AT) show(m)
    if (!shown && wall > BUILD_CAP_S) { finish(); return }
    const t = clock.tick(dt, shown)
    introView.t = t
    if (!clock.done) {
      introView.veil = veilAt(t, shown)
      introView.label = labelAt(t)
    }
    if (shown && m && cast) {
      while (zoom < INTRO_ZOOMS.length && t >= INTRO_ZOOMS[zoom]!.at) {
        const z = INTRO_ZOOMS[zoom++]!
        m.cam.punchZoom(z.to, z.dur, z.hold)
      }
      while (beat < INTRO_ACTS.length && t >= INTRO_ACTS[beat]!.at) {
        const b = INTRO_ACTS[beat++]!
        play(m.sim, cast, b.who, b.act)
      }
      tickPose(cast.mage, dt)
      tickPose(cast.beast, dt)
      if (cast.fled) walkOff(cast, dt)
      // The hero on the ground is never touched, never dry.
      cast.hero.hp = cast.hero.s.maxHp
    }
    if (clock.done) finish()
  }
  raf = requestAnimationFrame(frame)
  void INTRO_LENGTH
})
