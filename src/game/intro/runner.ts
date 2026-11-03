import { shallowReactive } from 'vue'
import { app, type GameMode } from '../engine/app'
import { createInput } from '../engine/input'
import { precompile } from '../boot'
import { ZoneMode, type ZoneCallbacks, type ZoneSetup } from '../modes/zoneMode'
import { profile, saveProfile } from '../state/profile'
import { hud } from '../state/hud'
import { applyStatus, dealDamage, removeStatus } from '../sim/combat'
import { spawnEnemy, spawnMinion } from '../sim/spawn'
import { plainStats } from '../sim/stats'
import { newAction, type Sim } from '../sim/world'
import type { DamageType, Unit } from '../sim/types'
import { pushHud } from '../state/hud'
import type { ZoneId } from '../data/items'
import { ZONES } from '../data/zones'
import { CELL } from '../sim/grid'
import { K_BLOCK, K_GROUND } from '../sim/zoneFeatures'
import type { ZonePlan } from '../sim/zoneGen'
import { heroLook, LOOKS } from '../gfx/rigs/looks'
import type { Look } from '../gfx/rigs/humanoid'
import { stopSpeech } from '../audio/speech'
import { setZoneFog } from '../gfx/terrain'
import { trackForTheme } from '../audio/themes'
import { setMusicTrack, startGameMusic } from '@/use/useSound'
import { isGamePaused } from '@/use/useGamePause'
import { INTRO_TIP, introBoot } from './state'
import { setSfxGate } from '../audio/sfx'
import { buildFirstLevel, enterFirstLevel, startFirstLevel } from '../flow'
import {
  BUILD_CAP_S, INTRO_ACTS, INTRO_BEAST, INTRO_DRAGON, INTRO_FOE_LEVEL, INTRO_LENGTH, INTRO_MAGE, INTRO_PACK, INTRO_SEED, INTRO_ZONE,
  ENTRY_AT, ENTRY_S, INTRO_ZOOMS, LABEL_AT, NO_SKIP_AT, SCENE_AT, createIntroClock, labelAt, veilAt, type IntroAct
} from './script'

/**
 * ─── The intro, played (roadmap #130, the films of #183, #188 and #189) ──────
 *
 * A lazy chunk: fetched only when the intro plays (`GameScene.vue`). The scene is the game's own: the tundra built as a
 * visit builds it, the player's hero face down in the snow, a drake over him, and two heroes of another league, in mythic
 * gear: an elementalist and a beast caller with her pack. They leap in over the edge of the picture with a flip, land
 * like superheroes, dodge the drake's breath and charge with flips, bring every spell they have on it, kill it and leap
 * away. The film is scripted: the drake and the pack are moved by hand (their AI is off), the heroes' leaps are arcs
 * (`unit.stunt` lifts and turns the drawn body), and the spells are the game's own effects, timed by the script
 * (`intro/script.ts`). Nothing is kept but the `introSeen` flag.
 *
 * Its input is a fresh one no key or finger reaches, its callbacks do nothing (no result screen, no reward, no funnel
 * event), its pack is never the finale, so there is no victory to report. The scene is built while the hero choice shows
 * (`prepareIntro`); when the film is over the opening level is built behind the last black (`startFirstLevel`).
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
  label: 0,
  /** The skip button is up (until the label and the load). */
  canSkip: true
})

let end: (() => void) | null = null

/** Skip: the film is over now (the button, or Space). */
export const skipIntro = (): void => { if (introView.t < NO_SKIP_AT) end?.() }
/** End the intro now (it is over, or it could not play). */
export const endIntro = (): void => end?.()

const NONE: ZoneCallbacks = { onEnd: () => {}, onInteract: () => {}, onPause: () => {}, onPanel: () => {} }

/** The place's music again, for the scene the intro hands the renderer to. */
export const settleAfterIntro = (mode: GameMode | null): void => {
  if (mode instanceof ZoneMode) setMusicTrack(trackForTheme(mode.setup.theme))
}

/** The stage cut clear: no tree or stone where the heroes land, fight and walk off (the way each leaves, `flee`). */
const carveStage = (plan: ZonePlan): void => {
  const packs = plan.packs.filter(p => !p.finale)
  const p = packs[Math.min(INTRO_PACK, packs.length - 1)] ?? plan.packs[0]
  if (!p) return
  // Segments (metres): the landing marks to where each walks to, and the ground between the two and the drake.
  const segs: Array<[number, number, number, number]> = [
    [p.x - 4.4, p.z + 0.2, p.x - 4.4 - FLEE_X, p.z + 0.2 + FLEE_Z],
    [p.x + 4.4, p.z + 0.2, p.x + 4.4 + FLEE_X, p.z + 0.2 + FLEE_Z],
    [p.x - 4.4, p.z + 0.2, p.x + 4.4, p.z + 0.2],
    [p.x, p.z - 3.4, p.x, p.z + 3.2]
  ]
  const R = 3.2 // metres either side of a path
  for (let j = 1; j < plan.h - 1; j++) {
    for (let i = 1; i < plan.w - 1; i++) {
      const k = j * plan.w + i
      if (!plan.solid[k] || plan.sealed[k] || plan.kind[k] === K_BLOCK) continue
      const x = (i + 0.5) * CELL
      const z = (j + 0.5) * CELL
      for (const [ax, az, bx, bz] of segs) {
        const dx = bx - ax
        const dz = bz - az
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)))
        if (Math.hypot(x - (ax + dx * t), z - (az + dz * t)) <= R) { plan.solid[k] = 0; plan.kind[k] = K_GROUND; break }
      }
    }
  }
}

const setup = (): ZoneSetup => ({
  kind: 'zone', zone: INTRO_ZONE as ZoneId, theme: ZONES[INTRO_ZONE as ZoneId].theme, seed: INTRO_SEED,
  level: INTRO_FOE_LEVEL, difficulty: 1, tutorial: false, ambush: null, extra: 0, flags: new Set(), carve: carveStage
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

/** A leap in progress: an arc over the ground from where the body is to a mark, with `flips` turns on the way. */
interface Leap { walk?: boolean; exit?: boolean; u: Unit; fx: number; fz: number; tx: number; tz: number; t0: number; dur: number; high: number; flips: number; land: boolean; done: boolean }

/** The cast of the film, once the scene is staged. */
interface Cast {
  hero: Unit
  mage: Unit
  beast: Unit
  dragon: Unit
  /** The beast caller's pack, run by hand. */
  pack: Unit[]
  leaps: Leap[]
  /** Where each of the two lands first. */
  land: { mage: { x: number; z: number }; beast: { x: number; z: number } }
  /** The pack's phase: charging in, circling the drake. */
  packAt: number
  fled: boolean
  /** The clock of the last bite, per pack member. */
  bite: number[]
  /** The drake's home spot, and how far a blow has pushed it off (it eases back). */
  home: { x: number; z: number }
  settle: number
  /** The elementalist's spells cast so far (they come in turn). */
  casts: number
  /** The way the beast caller walks off (a unit vector), which the pack follows. */
  beastDir: { x: number; z: number }
  /** Where each of the pack stood, relative to her, when she set off, and when that was. */
  packOff: Array<{ x: number; z: number }>
  fleeT: number
}

/** How far (m) each walks off, sideways and toward the camera (the stage is cut clear along it). */
const FLEE_X = 14
const FLEE_Z = 7
/** How far out (m) the two start their leap from, and how high (m) it goes. */
const ENTRY_RUN = 15
const ENTRY_HIGH = 9
/** The heroes' mythic gear: what each carries (items of the game's own highest tiers). */
const MAGE_GEAR = { main: 'staffOfTheStarlessSky', off: 'tomeOfEternalReign', body: 'vestmentsOfSovereign', head: 'laurelOfTheVictor', hands: null, feet: null } as const
const BEAST_GEAR = { main: 'tidecallerStaff', off: 'bastionBanner', body: 'vestmentsOfSovereign', head: 'crownOfTheLastBastion', hands: null, feet: null } as const

/** The two heroes' looks: the hero rig in mythic gear, in the masters' own colours. */
const registerLooks = (): void => {
  const gear = (g: Record<string, string | null>): Look => heroLook({ main: null, off: null, head: null, body: null, hands: null, feet: null, trinket1: null, trinket2: null, ...g } as Parameters<typeof heroLook>[0], 'm')
  const looks = LOOKS as Record<string, Look>
  const mage = gear(MAGE_GEAR)
  const beast = gear(BEAST_GEAR)
  looks.introMage = { ...mage, hero: true, top: '#7a35d8', glow: '#ff9a3a' }
  looks.introBeast = { ...beast, hero: true, top: '#2f8f4a', glow: '#7ff0a0' }
}

/** A person of the story: the hero rig in its own look, untouchable (nothing can aim at an NPC), and shown (`spawn`). */
const person = (sim: Sim, kind: string, x: number, z: number, facing: number): Unit => {
  const u = sim.addUnit({
    kind, team: 0, rank: 'npc', level: 60, x, z, r: 0.45, h: 1.45,
    s: plainStats({ hp: 1000, dmg: 0, speed: 4.4 }), facing
  })
  u.x = u.px = x
  u.z = u.pz = z
  sim.emit({ t: 'spawn', unit: u.id })
  return u
}

/**
 * Stage it: the tundra's second pack's ground cleared, a drake in the middle, the player's hero on the ground in front of
 * it, the two heroes up in the air beyond the picture's edges.
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
  // Its fall pays nothing: no level-up (and its slow motion and flash), no loot, no gold.
  sim.holdLevelUp = true
  sim.dropTable = { mob: [], chest: [], boss: [], secret: [], infernal: [], after: [] }
  // The place's own packs were just dismissed: left alone, the director would find the finale's pack cleared on the first
  // step and call the visit won (the scene froze on its "victory"). They count as cleared already, and the drake is in no pack.
  for (const g of sim.groups) g.cleared = true
  const dragon = spawnEnemy(sim, INTRO_DRAGON, p.x, p.z - 3.4, -1)
  if (!dragon) return null
  dragon.awake = true
  dragon.s.maxHp *= 80
  dragon.hp = dragon.s.maxHp
  dragon.facing = 0
  // Its moves are the script's: it never decides anything for itself.
  dragon.aiT = 1e9
  dragon.rooted = true
  // The player's hero: face down in the snow in front of it.
  const hero = sim.hero.unit
  hero.x = hero.px = p.x
  hero.z = hero.pz = p.z + 3.2
  hero.hasGoal = false
  hero.facing = Math.PI
  sim.hero.order = { kind: 'none', targetId: 0, x: hero.x, z: hero.z }
  applyStatus(sim, hero, 'knockdown', 1e9, 1, null, { quiet: true })
  // Lying down turns the body about its feet: lifted a little, it lies on the snow and not half in it.
  hero.stunt = { lift: 0.42, flip: 0 }
  registerLooks()
  const land = { mage: { x: p.x - 4.4, z: p.z + 0.2 }, beast: { x: p.x + 4.4, z: p.z + 0.2 } }
  const mage = person(sim, 'introMage', land.mage.x - ENTRY_RUN, land.mage.z + ENTRY_RUN * 0.45, -0.7)
  const beast = person(sim, 'introBeast', land.beast.x + ENTRY_RUN, land.beast.z + ENTRY_RUN * 0.45, 0.7)
  for (const u of [mage, beast]) u.stunt = { lift: ENTRY_HIGH, flip: 0 }
  m.hideBars = true
  // The haze is set for the usual view: with the camera pulled back it would swallow the dragon.
  setZoneFog(m.scene, m.terrainTheme(), m.cam.dist * INTRO_ZOOMS[0]!.to * 12)
  m.cam.snap()
  return { hero, mage, beast, dragon, pack: [], leaps: [], land, packAt: -1, fled: false, bite: [], home: { x: dragon.x, z: dragon.z }, settle: 0, casts: 0, beastDir: { x: 1, z: 0.5 }, packOff: [], fleeT: 0 }
}

/** Start a leap: `high` metres at the top of the arc, `flips` forward turns on the way, a hero's landing at the end. */
const leap = (c: Cast, u: Unit, tx: number, tz: number, t: number, dur: number, high: number, flips: number, land = true, exit = false): void => {
  c.leaps = c.leaps.filter(l => l.u !== u)
  c.leaps.push({ exit, u, fx: u.x, fz: u.z, tx, tz, t0: t, dur, high, flips, land, done: false })
}

/** A person casts: the pose of the spell they name, facing `at`. */
const pose = (u: Unit, skill: string, at: { x: number; z: number; id?: number }): void => {
  u.facing = Math.atan2(at.x - u.x, at.z - u.z)
  u.action = newAction(u, skill, 0.3, 0.75, at.id ?? 0, at.x, at.z)
  u.anim = 'cast'
  u.animT = 0
  u.animStyle = 1
}

/**
 * A blow on the drake that reads as one (#189): the game's own impact effect and flinch (a `hit` event from whoever struck
 * it), a number over it, and a small step back from the one who struck. `big`: a crit's weight.
 */
const hit = (sim: Sim, c: Cast, dmg: number, type: DamageType, from: Unit = c.mage, big = false): void => {
  const d = c.dragon
  dealDamage(sim, null, d, dmg, { type, spell: true, canCrit: false } as Parameters<typeof dealDamage>[4])
  const amount = Math.round(dmg * (big ? 11 : 6) * (0.85 + ((sim.time * 7) % 1) * 0.3))
  sim.emit({
    t: 'hit', src: from.id, tgt: d.id, x: d.x + (((sim.time * 13) % 1) - 0.5) * 1.4, z: d.z + (((sim.time * 17) % 1) - 0.5) * 1.2, h: d.h,
    amount, crit: big, type, heavy: big, toHero: false, killed: false, dot: false
  })
  if (big) pushHud({ t: 'num', x: d.x, y: d.h + 0.6, z: d.z, amount, kind: 'crit' })
  // It rocks back from the blow and settles again.
  const dx = d.x - from.x
  const dz = d.z - from.z
  const l = Math.hypot(dx, dz) || 1
  const k = big ? 0.5 : 0.18
  d.x = d.px = d.x + (dx / l) * k
  d.z = d.pz = d.z + (dz / l) * k
  c.settle = Math.max(c.settle, k)
}

const FIRE = '#ff7a1a'
const FROST = '#a8d8ff'
const BOLT = '#ffe14a'
const HOLY = '#fff0a0'

/** The opening level, once the film asks for it (it builds while the two walk away). */
let building: ReturnType<typeof buildFirstLevel> | null = null
let bootRun = false

/** One beat of the film. */
const play = (m: ZoneMode, c: Cast, t: number, act: IntroAct, who: 'beast' | 'mage' | 'both'): void => {
  const sim = m.sim
  const d = c.dragon
  const shake = (n: number): void => m.cam.addTrauma(n)
  switch (act) {
    case 'roar':
      // The drake rears and roars over the one in the snow: the picture shakes once.
      pose(d, 'slam', c.hero)
      sim.emit({ t: 'fx', id: 'roar', x: d.x, z: d.z, r: 9, color: '#58e0d0' })
      shake(0.7)
      break
    case 'summon': {
      // The pack, thrown in: three wolves, a bear and a hawk run at the drake and bite.
      pose(c.beast, 'wildHunt', d)
      shake(0.25)
      const pack: Array<[string, number, number]> = [
        ['packWolf', -1.6, -1.2], ['packWolf', 0.6, -2.2], ['packWolf', -3, -0.2], ['packBear', 1.8, -0.8], ['packHawk', 0, -1.6]
      ]
      for (const [kind, dx, dz] of pack) {
        const mn = spawnMinion(sim, kind, c.beast.x + dx, c.beast.z + dz, 12, false)
        if (!mn) continue
        mn.s.maxHp *= 200
        mn.hp = mn.s.maxHp
        mn.aiT = 1e9
        // Staged: the sim's own follower AI (which walks a minion to its owner, the hero in the snow, and has it look at him)
        // leaves it alone.
        mn.stunt = { lift: 0, flip: 0 }
        c.pack.push(mn)
        c.bite.push(0)
      }
      c.packAt = t
      break
    }
    case 'close':
      // The two walk up to the drake, one at either flank: they do not hurry.
      walk(c, c.mage, d.x - 2.6, d.z + 2.4, t, 1.3)
      walk(c, c.beast, d.x + 2.6, d.z + 2.4, t, 1.3)
      break
    case 'slap': {
      if (who === 'mage') {
        // The elementalist answers with a spell a beat: fire, frost, lightning in turn, each one drawn once.
        const spells: Array<[string, string, string]> = [['fireball', FIRE, 'burst:bolt'], ['frostLance', FROST, 'burst:icicle'], ['chainSpark', BOLT, 'burst:bolt']]
        const [skill, color, burst] = spells[c.casts++ % spells.length]!
        pose(c.mage, skill, d)
        sim.emit({ t: 'fx', id: 'lob:holy', x: c.mage.x, z: c.mage.z, x2: d.x, z2: d.z, dur: 0.4, color })
        sim.after(0.4, () => {
          sim.emit({ t: 'fx', id: burst, x: d.x, z: d.z, r: 2.6, color })
          hit(sim, c, 40, skill === 'fireball' ? 'fire' : skill === 'frostLance' ? 'frost' : 'holy', c.mage, false)
          shake(0.15)
        })
        break
      }
      // A slap: the back of a hand. The game's own impact and flinch, the drake rocks back, nothing more.
      const u = c.beast
      u.facing = Math.atan2(d.x - u.x, d.z - u.z)
      u.anim = 'attack'
      u.animT = 0
      hit(sim, c, 20, 'physical', u, false)
      shake(0.12)
      break
    }
    case 'slay':
      // Both together: one more slap, and the drake goes down.
      for (const u of [c.mage, c.beast]) { u.facing = Math.atan2(d.x - u.x, d.z - u.z); u.anim = 'attack'; u.animT = 0 }
      sim.emit({ t: 'fx', id: 'quake', x: d.x, z: d.z, r: 8, color: HOLY })
      shake(0.8)
      dealDamage(sim, null, d, 1e12, { type: 'true', canCrit: false } as Parameters<typeof dealDamage>[4])
      break
    case 'flee':
      // They walk off calmly, one each way, the pack at the beast caller's heels, not one look at the hero in the snow.
      c.fled = true
      walk(c, c.mage, c.land.mage.x - FLEE_X, c.land.mage.z + FLEE_Z, t, 5.6)
      walk(c, c.beast, c.land.beast.x + FLEE_X, c.land.beast.z + FLEE_Z, t, 5.6)
      c.fleeT = t
      c.packOff = c.pack.map(mn => ({ x: mn.x - c.beast.x, z: mn.z - c.beast.z }))
      { const bx = c.land.beast.x + FLEE_X - c.beast.x; const bz = c.land.beast.z + FLEE_Z - c.beast.z; const l = Math.hypot(bx, bz) || 1; c.beastDir = { x: bx / l, z: bz / l } }
      break
    case 'load':
      // The screen goes dark. From here the film cannot be skipped (`NO_SKIP_AT`): what is up is the label and the load,
      // which starts when the black is whole (the frame loop below).
      break
    case 'rise':
      // The one in the snow gets up, as the screen goes dark.
      removeStatus(c.hero, 'knockdown')
      c.hero.stunt = undefined
      c.hero.anim = 'idle'
      break
  }
}

/** A walk: a straight line at a steady pace, in the unit's walk. */
const walk = (c: Cast, u: Unit, tx: number, tz: number, t: number, dur: number): void => {
  c.leaps = c.leaps.filter(l => l.u !== u)
  c.leaps.push({ walk: true, u, fx: u.x, fz: u.z, tx, tz, t0: t, dur, high: 0, flips: 0, land: false, done: false })
}

/** The leaps: positions along each arc, the drawn body lifted and turned, and a hero's landing at the end. */
const stepLeaps = (m: ZoneMode, c: Cast, t: number): void => {
  const sim = m.sim
  for (const l of c.leaps) {
    if (l.done) continue
    const raw = Math.min(1, Math.max(0, (t - l.t0) / l.dur))
    // A walk eases into its pace (the first quarter) and then holds it; a leap is one arc.
    const A = 0.25
    const k = l.walk ? (raw < A ? (raw * raw) / (2 * A) : raw - A / 2) / (1 - A / 2) : raw
    const u = l.u
    u.x = u.px = l.fx + (l.tx - l.fx) * k
    u.z = u.pz = l.fz + (l.tz - l.fz) * k
    u.facing = Math.atan2(l.tx - l.fx, l.tz - l.fz)
    u.anim = l.walk && k < 1 ? 'walk' : 'idle'
    u.action = null
    if (l.walk) { u.stunt = undefined; if (k >= 1) l.done = true; continue }
    u.stunt = { lift: l.exit ? l.high * k * k : l.high * 4 * k * (1 - k), flip: Math.min(1, Math.max(0, (k - 0.12) / 0.7)) * l.flips % (l.flips + 0.0001) }
    if (l.flips > 1) u.stunt.flip = Math.min(1, Math.max(0, (k - 0.1) / 0.75)) * l.flips
    if (k >= 1) {
      l.done = true
      if (l.exit) continue
      u.stunt = undefined
      if (l.land) {
        // A hero's landing: the ground answers.
        sim.emit({ t: 'fx', id: 'slam', x: l.tx, z: l.tz, r: 4.4, color: '#e8f4ff' })
        sim.emit({ t: 'fx', id: 'quake', x: l.tx, z: l.tz, r: 4, color: '#cfe8ff' })
        m.cam.addTrauma(0.9)
      }
    }
  }
}

/** The pack runs at the drake and circles it, snapping; its blows are drawn and counted. */
const stepPack = (m: ZoneMode, c: Cast, t: number, dt: number): void => {
  if (c.packAt < 0) return
  const sim = m.sim
  const d = c.dragon
  c.pack.forEach((mn, i) => {
    if (!mn.alive) return
    if (!d.alive) {
      // The drake is down. Until she sets off they stand about her, turned the way she is; then they trot with her, each
      // from where it stood into its place behind her, all facing the way she walks (never at the one in the snow).
      const b = c.beast
      const dir = c.fled ? c.beastDir : { x: 0, z: 1 }
      const k = c.fled ? Math.min(1, Math.max(0, (t - c.fleeT) / 2.2)) : 0
      const off = c.packOff[i] ?? { x: mn.x - b.x, z: mn.z - b.z }
      const back = 1.6 + 0.9 * (i % 3) + Math.floor(i / 3) * 0.8
      const side = ((i % 3) - 1) * 0.95 + (i > 2 ? 0.45 : 0)
      const fx = -dir.x * back - dir.z * side
      const fz = -dir.z * back + dir.x * side
      const tx = b.x + off.x + (fx - off.x) * k * k * (3 - 2 * k)
      const tz = b.z + off.z + (fz - off.z) * k * k * (3 - 2 * k)
      const dx = tx - mn.x
      const dz = tz - mn.z
      const dist = Math.hypot(dx, dz)
      // They travel at her pace, and a little more to close a gap.
      const sp = c.fled ? Math.min(3.3 + dist * 2.5, 6) : 0
      let want = mn.facing
      if (c.fled) {
        mn.x = mn.px = mn.x + (dx / (dist || 1)) * Math.min(sp * dt, dist)
        mn.z = mn.pz = mn.z + (dz / (dist || 1)) * Math.min(sp * dt, dist)
        // The body points the way she walks; a long way to go points at the place it is running to.
        want = dist > 1.6 ? Math.atan2(dx, dz) : Math.atan2(dir.x, dir.z)
      } else want = Math.atan2(dir.x, dir.z)
      let diff = want - mn.facing
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      mn.facing += Math.sign(diff) * Math.min(Math.abs(diff), 5 * dt)
      mn.anim = c.fled ? 'walk' : 'idle'
      return
    }
    // Each takes a place on the drake's near side (it keeps its own, as in a fight) and goes at it flat out.
    const side = i - (c.pack.length - 1) / 2
    const tx = d.x + side * 1.8
    const tz = d.z + d.r * 0.9 + mn.r + 0.4 + Math.abs(side) * 0.3
    const dx = tx - mn.x
    const dz = tz - mn.z
    const dist = Math.hypot(dx, dz)
    const sp = Math.min(dist, 11 * dt)
    if (dist > 0.05) { mn.x = mn.px = mn.x + (dx / dist) * sp; mn.z = mn.pz = mn.z + (dz / dist) * sp }
    mn.facing = Math.atan2(d.x - mn.x, d.z - mn.z)
    if (dist > 0.9) { mn.anim = 'walk'; return }
    // A bite: the animal lunges in and back, the drake is struck (flinch, impact, step back).
    const gap = t - (c.bite[i] ?? 0)
    if (gap > 1.05 + (i % 3) * 0.15) {
      c.bite[i] = t
      mn.anim = 'attack'
      mn.animT = 0
      mn.x = mn.px = mn.x + Math.sin(mn.facing) * 0.45
      mn.z = mn.pz = mn.z + Math.cos(mn.facing) * 0.45
      sim.emit({ t: 'fx', id: 'burst:bolt', x: d.x + (mn.x - d.x) * 0.6, z: d.z + (mn.z - d.z) * 0.6, r: 1.5, color: '#7ff0a0' })
      if (i % 2 === 0) hit(sim, c, 6, 'physical', mn, false)
    } else if (gap > 0.2) mn.anim = 'idle'
  })
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

const FILM_SOUNDS: ReadonlySet<string> = new Set(['roar', 'summon', 'hit', 'hitHeavy', 'hitBlunt', 'deathBig'])

/** At most a few sounds at once, and one of a kind at a time: a film of spells is not a wall of noise. */
const soundGate = (): ((name: string) => boolean) => {
  const last = new Map<string, number>()
  let windowAt = 0
  let inWindow = 0
  return (name) => {
    // Only the few sounds the film is made of: a roar, the pack, blows, the fall. Everything else the scene's own events
    // would ask for (casts, impacts of every element, footsteps of a pack) stays silent.
    if (!FILM_SOUNDS.has(name)) return false
    const now = performance.now()
    if (now - (last.get(name) ?? -1e9) < 350) return false
    if (now - windowAt > 300) { windowAt = now; inWindow = 0 }
    if (inWindow >= 2) return false
    inWindow++
    last.set(name, now)
    return true
  }
}

/** The poses run on the clock the film keeps (these units are not stepped as fighters). */
const tickPose = (u: Unit, dt: number): void => {
  const a = u.action
  if (!a) return
  a.t += dt
  if (a.t >= a.end) { u.action = null; u.anim = 'idle' }
}

/**
 * Play the intro, resolving when it has ended or been skipped. `next`: the
 * scene that takes over when nothing is on screen yet (a replay), so its
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
  bootRun = boot
  building = null
  setSfxGate(soundGate())
  let over = false
  let raf = 0
  let last = performance.now()
  let wall = 0
  let beat = 0
  let zoom = 0
  let started = false

  Object.assign(introView, { t: 0, ready: false, veil: 1, label: 0, canSkip: true })

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
      // The loop stops for the build; the level is entered (and the loop restarted) when it is ready.
      if (!building) { app.setWanted(false); building = buildFirstLevel() }
      const ready = building.then((lvl) => enterFirstLevel(lvl))
      void ready.catch((e) => console.warn('[intro] the opening level could not be built', e)).finally(() => {
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
  else {
    build().then((m) => {
      if (over) { m.dispose(); return }
      cast = stage(m)
      if (!cast) { m.dispose(); finish(); return }
      mode = m
    }).catch((e) => { console.warn('[intro] the scene could not be built', e); finish() })
  }

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
    introView.canSkip = t < NO_SKIP_AT
    // The opening level is built when the screen is wholly black, with the game's own loop stopped and nothing of the film
    // running: a build beside a live scene is not safe (the live scene sets the global ground height every frame, and
    // the new level's props, chests, herbs and the dummy were placed on the wrong ground, under it), and it gets the whole
    // CPU, as a journey's build does.
    if (boot && !building && t >= LABEL_AT + 0.5 && introView.veil >= 1) {
      app.setWanted(false)
      building = buildFirstLevel()
    }
    if (!clock.done) {
      introView.veil = veilAt(t, shown)
      introView.label = labelAt(t)
    }
    if (shown && m && cast) {
      while (zoom < INTRO_ZOOMS.length && t >= INTRO_ZOOMS[zoom]!.at) {
        const z = INTRO_ZOOMS[zoom++]!
        m.cam.punchZoom(z.to, z.dur, z.hold)
      }
      if (!started) {
        started = true
        // The two leap in from beyond the picture's edges.
        leap(cast, cast.mage, cast.land.mage.x, cast.land.mage.z, ENTRY_AT, ENTRY_S, ENTRY_HIGH, 1)
        leap(cast, cast.beast, cast.land.beast.x, cast.land.beast.z, ENTRY_AT, ENTRY_S, ENTRY_HIGH, 1)
      }
      while (beat < INTRO_ACTS.length && t >= INTRO_ACTS[beat]!.at) {
        const b = INTRO_ACTS[beat++]!
        play(m, cast, t, b.act, b.who)
      }
      stepLeaps(m, cast, t)
      stepPack(m, cast, t, dt)
      // …and the drake eases back to its place after a blow.
      if (cast.dragon.alive && cast.settle > 0) {
        const d = cast.dragon
        const k = Math.min(1, 6 * dt)
        d.x = d.px = d.x + (cast.home.x - d.x) * k
        d.z = d.pz = d.z + (cast.home.z - d.z) * k
        cast.settle = Math.hypot(cast.home.x - d.x, cast.home.z - d.z) < 0.03 ? 0 : cast.settle
      }
      tickPose(cast.mage, dt)
      tickPose(cast.beast, dt)
      tickPose(cast.dragon, dt)
      // Nobody in the picture is ever hurt: the hero on the ground and the pack are mended as they are struck.
      cast.hero.hp = cast.hero.s.maxHp
      for (const mn of cast.pack) if (mn.alive) mn.hp = mn.s.maxHp
    }
    if (clock.done) finish()
  }
  raf = requestAnimationFrame(frame)
  void INTRO_LENGTH
})
