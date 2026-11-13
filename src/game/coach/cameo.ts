import { isSolidAt } from '../sim/grid'
import { mulberry32 } from '../sim/rng'
import { HEAD_COLOR } from '../sim/bosses/chimera'
import { plainStats } from '../sim/stats'
import { newAction, type Sim } from '../sim/world'
import type { Unit } from '../sim/types'

/**
 * ─── The gunslinger on the plains (roadmap #210) ────────────────────────────
 *
 * First-time players drop out around the opening fight's first boss, so the
 * opening shows them, once, that the world is bigger than their fight: right
 * after the first pack of four falls, a chimera bounds in from the right edge
 * of the picture with a hunter on its heels. He lands like a hero, plants a
 * turret, wraps himself in a shield, and the two trade blows on the beat of the
 * intro's own fight cue ("The Drake Falls", `audio/songs.ts`); on its biggest
 * hit the beast leaps away to the left, he runs after it and is gone in a leap,
 * and his turret folds away. The player's hero says one line ("Someone else is
 * hunting that beast"), and Silverbridge's aether master, the same man, knows
 * the hero when they meet (`data/dialogs/silverbridge.ts`, `CAMEO_FLAG`).
 *
 * A scene piece like the road teacher (`mentor.ts`): `npc` units under a truce
 * (`outOfReach`), so nothing can aim at them, pick them or hurt them, and the
 * game goes on round them. Nothing here touches the fight's dice: the units
 * roll from a stream of their own, every move is a function of the scene's
 * clock. The scene's clock IS the cue's film clock (the leaps begin before the
 * cue's first 16th, `CAMEO_FROM`), so every beat lands on the music.
 *
 * Where: near the TOP edge of the player's view, or the bottom one when the
 * top is crowded by palisades, rock or trees (`stageCameo`, from the camera's
 * own screen-to-ground and the grid). When: never mid-fight (`cameoDue`).
 * Once per save (`CAMEO_TIP` in the profile, marked as it begins).
 */

/** The look of the hunter (`gfx/rigs/looks.ts`): Silverbridge's aether master in his hunting gear. */
export const CAMEO_HERO = 'cameoGunslinger'
/** The beast: the chimera's own rig, here a scene piece. */
export const CAMEO_BEAST = 'chimera'
/** His turret (the aether school's `deployTurret`). */
export const CAMEO_TOWER = 'turret'
const KINDS: ReadonlySet<string> = new Set([CAMEO_HERO, CAMEO_BEAST, CAMEO_TOWER])
/** What the player's hero says as the beast leaps away (a hero line: the girl hero has her own take). */
export const CAMEO_LINE = 'dlg.bark.hero.hunt.1'
/** What the hunter shouts as he squares up to the beast, in the aether master's own voice ("Fight me, Nightmare!"). */
export const CAMEO_SHOUT = 'dlg.bark.sbMasterAether.fight.1'

/** Seconds after the pack of four is down before the scene may start: the kill reads first. */
export const CAMEO_DELAY = 1.4
/** No awake foe this close to the hero (m): the fight is not over, the scene waits. */
export const CAMEO_FOE_NEAR = 14
/** Retry a crowded view this often (s). */
const RETRY = 0.5

/** The scene's clock starts here (s), while the two are in the air; 0 is the cue's film second 0. */
export const CAMEO_FROM = -1.1
/** The last of the cue has rung out (its tail runs to ~14 s): the place's own music comes back. */
export const CAMEO_END = 13.4

export type CameoAct =
  | 'leap' | 'beastLand' | 'landPose' | 'land' | 'shout' | 'roar' | 'towerPose' | 'tower' | 'breathPose' | 'shieldPose' | 'breath'
  | 'shield' | 'burn' | 'shot' | 'lashPose' | 'lash' | 'claw' | 'turret' | 'flee' | 'line' | 'run' | 'exit' | 'beastGone' | 'gone'
  | 'towerOut' | 'end'
export interface CameoBeat { at: number; act: CameoAct; n?: number }

/** One 16th of the cue (s): 133⅓ BPM (`introFight` in `audio/songs.ts`); its step k sounds at film second 0.0875 + k·16th. */
export const CAMEO_16TH = 0.1125
/** The cue's step `k` on the scene's clock. */
const step16 = (k: number): number => Math.round((0.0875 + k * CAMEO_16TH) * 10000) / 10000

/**
 * The chimera's breath (a stream of fire, the boss's own held breath, `cone`): its first gust on the cue's 19th 16th (the
 * drive's accent after the summon), one gust a 16th to the 29th, while he sets the turret down and closes the shield; the
 * flames break on the shell from the moment it closes.
 */
export const CAMEO_BREATH = { from: step16(19), to: step16(29) } as const

/**
 * The script, on the cue's clock (see the table over `introFight` in `audio/songs.ts`):
 *   0.20   the cue's opening blow      the superhero landing (the chimera landed a beat before, turning on him)
 *   0.31   the blow ringing out        his shout ("Fight me, Nightmare!"), in the room before the violin's pickup
 *   1.44   the toms of the build       the chimera roars back
 *   1.90   the summon downbeat         the turret is set down; the chimera rears for its breath
 *   2.23–3.35  the 3+3+2 drive         its breath: a stream of fire, a gust a 16th; the shield closes into it at 2.40
 *                                      (he is pushed back a step) and flares on the drums' accents (2.56, 2.79, 3.13)
 *   3.69…  the six blows, 0.45 apart   pistol, pistol | claw on the shield | turret, both pistols | claw
 *          and the 8ths between them   the serpent tail lashes: on the shield (he hops back), then through it (a flash)
 *   6.50   THE hit                     the charged shot; the chimera bounds away to the left
 *   7.0–   the resolve                 the line, a few running steps, the leap away; the turret folds
 */
export const CAMEO_ACTS: readonly CameoBeat[] = [
  { at: CAMEO_FROM, act: 'leap' },
  { at: -0.15, act: 'beastLand' },
  { at: -0.1, act: 'landPose' },
  { at: 0.2, act: 'land' },
  { at: 0.31, act: 'shout' },
  { at: step16(12), act: 'roar' },
  { at: 1.65, act: 'towerPose' },
  { at: 1.9, act: 'tower' },
  { at: CAMEO_BREATH.from - 0.3, act: 'breathPose' },
  { at: 2.15, act: 'shieldPose' },
  { at: CAMEO_BREATH.from, act: 'breath' },
  { at: 2.4, act: 'shield' },
  { at: step16(22), act: 'burn', n: 0 },
  { at: step16(24), act: 'burn', n: 1 },
  { at: step16(27), act: 'burn', n: 2 },
  { at: 3.69, act: 'shot', n: 0 },
  { at: 4.14, act: 'shot', n: 1 },
  { at: step16(38) - 0.2, act: 'lashPose', n: 0 },
  { at: step16(38), act: 'lash', n: 0 },
  { at: 4.59, act: 'claw', n: 0 },
  { at: 5.04, act: 'turret' },
  { at: step16(46) - 0.2, act: 'lashPose', n: 1 },
  { at: step16(46), act: 'lash', n: 1 },
  { at: 5.49, act: 'shot', n: 2 },
  { at: 5.94, act: 'claw', n: 1 },
  { at: 6.5, act: 'flee' },
  { at: 6.85, act: 'line' },
  { at: 7.0, act: 'run' },
  { at: 8.3, act: 'exit' },
  { at: 8.6, act: 'beastGone' },
  { at: 9.6, act: 'gone' },
  { at: 9.9, act: 'towerOut' },
  { at: CAMEO_END, act: 'end' }
]

/** The blows of the exchange, in order (for the tests: they fall on the cue's six blows and its big hit). */
export const CAMEO_BLOWS: readonly number[] = CAMEO_ACTS.filter(b => b.act === 'shot' || b.act === 'claw' || b.act === 'turret').map(b => b.at)

/** The aether school's teal: his gun light, his shield, his turret. */
export const CAMEO_TEAL = '#4ff0c8'
/** The beast's colours are the boss's own: the lion's fire, the serpent tail's green (`sim/bosses/chimera.ts`). */
const BEAST_FIRE = HEAD_COLOR.lion
const BEAST_TAIL = HEAD_COLOR.serpent

/** How the hunter's speech bubble is drawn (`BossBarkLayer.vue`): his teal on the paper, said as a shout. */
export const CAMEO_BARK_LOOK: Readonly<Record<string, { paper: string; band: string; emotion: string }>> = {
  [CAMEO_HERO]: { paper: '#eafff8', band: CAMEO_TEAL, emotion: 'shout' }
}

/** Where the two fight, in world metres. */
export interface CameoStage {
  side: 'top' | 'bottom'
  /** Where each lands and stands. */
  hero: { x: number; z: number }
  beast: { x: number; z: number }
  tower: { x: number; z: number }
  /** Where each leaps in from (beyond the right edge). */
  heroFrom: { x: number; z: number }
  beastFrom: { x: number; z: number }
  /** The end of his running steps, the far end of his leap away and of the beast's (beyond the left edge). */
  run: { x: number; z: number }
  heroTo: { x: number; z: number }
  beastTo: { x: number; z: number }
}

/** A point on the ground under a point of the screen (fractions of its width and height; beyond 0..1 is off it). */
export type ScreenToGround = (fx: number, fy: number) => { x: number; z: number } | null

/**
 * The rows of the screen the two stand on, nearest the edge first: near the top edge, or near the bottom one. A phone held
 * upright sees far more ground up and down than across, and its edge rows can lie beyond the field's palisades: the rows
 * further in are tried before the other edge.
 */
export const CAMEO_BANDS = { top: [0.25, 0.31, 0.37], bottom: [0.8, 0.74, 0.68] } as const

/** How high the leaps go (m, the feet): over the treetops of a wood (a tree stands 3-5 m), never through them. */
export const LEAP_HERO = 6
export const LEAP_BEAST = 5.2
export const LEAP_OUT = 10

/** A leap or a run in progress, on the scene's clock. */
interface Move {
  u: number
  fx: number
  fz: number
  tx: number
  tz: number
  t0: number
  dur: number
  /** Top of the arc (m); 0 is a run on the ground. `rise`: it keeps rising (a leap out of the picture). */
  high: number
  flips: number
  rise: boolean
  /** Pushed or hopping back: the body keeps facing where it faced (at the beast), it does not turn to the way it goes. */
  back?: boolean
  done?: boolean
}

export interface CameoState {
  phase: 'wait' | 'play' | 'done'
  /** Seconds since the pack of four fell (waiting), or of retrying a crowded view. */
  wait: number
  retry: number
  /** The scene's clock (s, film seconds of the cue). */
  t: number
  /** The next beat to play. */
  next: number
  stage: CameoStage | null
  hero: number
  beast: number
  tower: number
  moves: Move[]
  /** The clock of the next running footstep. */
  step: number
  /** The clock of the breath's next gust of fire. */
  flame: number
}

/** Arm the scene for this visit (the opening fight, on a save that has not seen it). */
export const armCameo = (): CameoState => ({
  phase: 'wait', wait: 0, retry: 0, t: CAMEO_FROM, next: 0, stage: null, hero: 0, beast: 0, tower: 0, moves: [], step: 0, flame: CAMEO_BREATH.from
})

/** The scene is on (the units are in the world, the cue is wanted). */
export const cameoPlaying = (s: CameoState | null): boolean => !!s && s.phase === 'play'

/**
 * Whether the scene may start now: the pack of four (the tutorial's second group) has fallen a moment ago and no foe that is
 * awake stands near the hero; never in a lost or won visit, never with the hero down or in a conversation. `dt` counts the
 * moment since the pack fell.
 */
export const cameoDue = (sim: Sim, s: CameoState, dt: number, talking = false): boolean => {
  if (s.phase !== 'wait') return false
  const hero = sim.hero.unit
  if (!sim.groups[1]?.cleared || sim.ended || !hero.alive) return false
  s.wait += dt
  if (s.wait < CAMEO_DELAY || talking) return false
  return !foeNear(sim, hero.x, hero.z, CAMEO_FOE_NEAR)
}

/** An awake foe within `r` of a point. */
const foeNear = (sim: Sim, x: number, z: number, r: number, awakeOnly = true): boolean => {
  for (const e of sim.units) {
    if (!e.alive || e.team !== 1 || e.rank === 'npc' || (awakeOnly && !e.awake)) continue
    if (Math.hypot(e.x - x, e.z - z) < r) return true
  }
  return false
}

const clear = (sim: Sim, x: number, z: number, r: number): boolean => {
  for (let dz = -r; dz <= r + 1e-6; dz += r / 2) {
    for (let dx = -r; dx <= r + 1e-6; dx += r / 2) {
      if (dx * dx + dz * dz > r * r + 1e-6) continue
      if (isSolidAt(sim.grid, x + dx, z + dz)) return false
    }
  }
  return true
}

/** The ground of the fight is open: the two places, the turret's, the run, and the line between them. */
const stageOpen = (sim: Sim, st: CameoStage): boolean => {
  if (!clear(sim, st.hero.x, st.hero.z, 1.2) || !clear(sim, st.beast.x, st.beast.z, 1.6) || !clear(sim, st.tower.x, st.tower.z, 0.9) || !clear(sim, st.run.x, st.run.z, 0.9)) return false
  const n = Math.ceil(Math.hypot(st.hero.x - st.beast.x, st.hero.z - st.beast.z) / 0.5)
  for (let i = 0; i <= n; i++) {
    const k = i / n
    if (isSolidAt(sim.grid, st.beast.x + (st.hero.x - st.beast.x) * k, st.beast.z + (st.hero.z - st.beast.z) * k)) return false
  }
  // No pack sleeping on the stage (the two would land among goblins), and the player's hero is not on it.
  for (const p of [st.hero, st.beast, st.tower, st.run]) {
    if (foeNear(sim, p.x, p.z, 5, false)) return false
    if (Math.hypot(sim.hero.unit.x - p.x, sim.hero.unit.z - p.z) < 2.5) return false
  }
  return true
}

/**
 * The stage, from the camera: the two land on a row near the top edge of the view (the bottom row when the top one is
 * crowded), the beast left of the middle, the hunter right of it, each leaping in from beyond the right edge and leaving
 * beyond the left one. Null: neither row is open (the scene waits for the hero to walk on).
 */
export const stageCameo = (sim: Sim, toGround: ScreenToGround): CameoStage | null => {
  for (const side of ['top', 'bottom'] as const) for (const fy of CAMEO_BANDS[side]) {
    const L = toGround(0, fy)
    const R = toGround(1, fy)
    const heroFrom = toGround(1.3, fy - 0.04)
    const beastFrom = toGround(1.18, fy + 0.03)
    const beastTo = toGround(-0.45, fy + 0.04)
    const heroTo = toGround(-0.7, fy - 0.04)
    if (!L || !R || !heroFrom || !beastFrom || !beastTo || !heroTo) continue
    const w = Math.hypot(R.x - L.x, R.z - L.z)
    if (w < 1) continue
    const ux = (R.x - L.x) / w
    const uz = (R.z - L.z) / w
    // Across the screen's row, and the way off it toward its edge (up the screen on the top row, down it on the bottom one).
    const px = -uz * (side === 'top' ? -1 : 1)
    const pz = ux * (side === 'top' ? -1 : 1)
    // Far enough apart for a chimera and a gunfight, close enough for both to be in a phone's picture.
    const half = Math.max(2, Math.min(2.8, w * 0.12))
    // The middle of the row first, then a little to either side (a tree or a rock on the row is stepped round).
    for (const fx of [0.52, 0.44, 0.6, 0.36]) {
      const M = toGround(fx, fy)
      if (!M) continue
      const hero = { x: M.x + ux * half, z: M.z + uz * half }
      const beast = { x: M.x - ux * half, z: M.z - uz * half }
      const run = { x: hero.x - ux * half * 0.9, z: hero.z - uz * half * 0.9 }
      // The turret: a step behind him (to the right), off the line of fire: toward the edge or the middle; else at his side.
      for (const [b, k] of [[1.7, 0.8], [1.7, -0.8], [0.5, 1.5], [0.5, -1.5]] as const) {
        const tower = { x: hero.x + ux * b + px * k, z: hero.z + uz * b + pz * k }
        const st: CameoStage = { side, hero, beast, tower, heroFrom, beastFrom, run, heroTo, beastTo }
        if (stageOpen(sim, st)) return st
      }
    }
  }
  return null
}

/** The scene's units, wherever they are (a saved visit may have kept them: they go, the scene is not played again). */
export const cameoUnits = (sim: Sim): Unit[] => sim.units.filter(u => u.rank === 'npc' && u.truce && KINDS.has(u.kind))
export const clearCameoUnits = (sim: Sim): void => { for (const u of cameoUnits(sim)) sim.dismiss(u) }

/** A unit rolls two dice as it is born: theirs come from a stream of their own. */
const SALT = 0x2100ca3e

const actor = (sim: Sim, kind: string, at: { x: number; z: number }, o: { r: number; h: number; style?: 'melee' | 'ranged' }): Unit => {
  let u!: Unit
  sim.withStream(mulberry32((sim.seed ^ SALT ^ kind.length) >>> 0), () => {
    u = sim.addUnit({ kind, team: 0, rank: 'npc', level: 60, x: at.x, z: at.z, r: o.r, h: o.h, s: plainStats({ hp: 1000, dmg: 0, speed: 4, style: o.style }), facing: -Math.PI / 2 })
  })
  // Out of everyone's reach: nothing picks, aims at or hurts a unit under a truce (`outOfReach`), and a tap on it is no order.
  u.truce = true
  // Its poses run on the scene's clock alone (`tickPose`): the fight's step leaves them be.
  u.staged = true
  u.x = u.px = at.x
  u.z = u.pz = at.z
  return u
}

/** Start the scene on a stage: the two are put up in the air beyond the right edge. */
export const beginCameo = (sim: Sim, s: CameoState, st: CameoStage): void => {
  s.stage = st
  s.phase = 'play'
  s.t = CAMEO_FROM
  s.next = 0
  s.flame = CAMEO_BREATH.from
  const hero = actor(sim, CAMEO_HERO, st.heroFrom, { r: 0.45, h: 1.45, style: 'ranged' })
  hero.s.dual = 1
  const beast = actor(sim, CAMEO_BEAST, st.beastFrom, { r: 0.9, h: 1.85 })
  s.hero = hero.id
  s.beast = beast.id
  hero.stunt = { lift: LEAP_HERO, flip: 0 }
  beast.stunt = { lift: LEAP_BEAST, flip: 0 }
}

/** Over: whatever of the scene is still in the world goes (a skip of the visit, a defeat). */
export const endCameo = (sim: Sim, s: CameoState): void => {
  for (const id of [s.hero, s.beast, s.tower]) { const u = sim.get(id); if (u) sim.dismiss(u) }
  s.hero = s.beast = s.tower = 0
  s.moves.length = 0
  s.phase = 'done'
}

const move = (s: CameoState, u: Unit, to: { x: number; z: number }, dur: number, high: number, flips = 0, rise = false, back = false): void => {
  s.moves = s.moves.filter(m => m.u !== u.id)
  s.moves.push({ u: u.id, fx: u.x, fz: u.z, tx: to.x, tz: to.z, t0: s.t, dur, high, flips, rise, back })
}

/** A step (or a small hop, `high`) straight back from the beast, still facing it. */
const giveGround = (s: CameoState, u: Unit, from: Unit, d: number, dur: number, high: number): void => {
  const l = Math.hypot(u.x - from.x, u.z - from.z) || 1
  move(s, u, { x: u.x + ((u.x - from.x) / l) * d, z: u.z + ((u.z - from.z) / l) * d }, dur, high, 0, false, true)
}

/** Where the beast's jaws are (its head is about 1.1 m ahead of it at the size it is drawn), and a point a little short of a body. */
const ahead = (u: Unit, d: number): { x: number; z: number } => ({ x: u.x + Math.sin(u.facing) * d, z: u.z + Math.cos(u.facing) * d })
const shortOf = (from: Unit, to: Unit, d: number): { x: number; z: number } => {
  const l = Math.hypot(to.x - from.x, to.z - from.z) || 1
  return { x: to.x - ((to.x - from.x) / l) * d, z: to.z - ((to.z - from.z) / l) * d }
}
/** The shell round him is about this far out (m): fire and tail break on it, not on him. */
const SHELL = 0.85

/** A pose of a named cast (the hero rig's clip for that skill or ability), its blow `hitAt` seconds in. */
const pose = (u: Unit, id: string, hitAt: number, end: number, at: { x: number; z: number }, anim: Unit['anim'] = 'cast'): void => {
  u.facing = Math.atan2(at.x - u.x, at.z - u.z)
  u.action = newAction(u, id, hitAt, end, 0, at.x, at.z)
  u.anim = anim
  u.animT = 0
  u.animStyle = 1
}

const fx = (sim: Sim, id: string, x: number, z: number, o: { x2?: number; z2?: number; r?: number; color?: string; unit?: number; a?: number } = {}): void => {
  sim.emit({ t: 'fx', id: `cameo:${id}`, x, z, ...o })
}

/** A blow that reads as one: the game's own impact and flinch (a `hit` from the one who dealt it), no number, no sound of the hero's. */
const strike = (sim: Sim, from: Unit, to: Unit, heavy: boolean, type: 'pierce' | 'poison' = 'pierce'): void => {
  sim.emit({ t: 'hit', src: from.id, tgt: to.id, x: to.x, z: to.z, h: to.h, amount: 0, crit: heavy, type, heavy, toHero: false, killed: false, dot: false })
}

/** Where a pistol's barrel is, roughly (for the shot's line: the rig's own muzzle flash is drawn at the real one). */
const barrel = (u: Unit, side: number): { x: number; z: number } => {
  const f = u.facing
  return { x: u.x + Math.sin(f) * 0.55 + Math.cos(f) * 0.22 * side, z: u.z + Math.cos(f) * 0.55 - Math.sin(f) * 0.22 * side }
}

const play = (sim: Sim, s: CameoState, b: CameoBeat): void => {
  const st = s.stage!
  const hero = sim.get(s.hero)
  const beast = sim.get(s.beast)
  const tower = sim.get(s.tower)
  const me = sim.hero.unit
  switch (b.act) {
    case 'leap':
      // Both bound in from beyond the right edge: the beast first, its hunter a stride behind with a forward flip.
      if (beast) move(s, beast, st.beast, -0.15 - CAMEO_FROM, LEAP_BEAST)
      if (hero) move(s, hero, st.hero, 0.2 - CAMEO_FROM, LEAP_HERO, 1)
      break
    case 'beastLand':
      if (!beast) break
      beast.facing = Math.atan2(st.hero.x - beast.x, st.hero.z - beast.z)
      fx(sim, 'thud', beast.x, beast.z, { r: 2.6, color: BEAST_FIRE })
      break
    case 'landPose':
      // The superhero landing: the slam's pose (arms up as he comes down, the ground taken in a crouch on the blow).
      if (hero) pose(hero, 'slam', 0.3, 1.1, st.beast)
      break
    case 'land':
      if (!hero) break
      hero.stunt = undefined
      fx(sim, 'land', st.hero.x, st.hero.z, { r: 3.2, color: CAMEO_TEAL, unit: hero.id })
      break
    case 'shout':
      // He rises out of the landing and calls the beast by its name: his line, in a bubble over his own head.
      if (hero) sim.emit({ t: 'bark', unit: hero.id, key: CAMEO_SHOUT })
      break
    case 'roar':
      // The beast answers him: up on its haunches, a roar (short: it rears for its breath next).
      if (!beast) break
      pose(beast, 'enrage', 0.2, 0.48, hero ?? st.hero)
      fx(sim, 'roar', beast.x, beast.z, { r: 5, color: BEAST_FIRE, unit: beast.id })
      break
    case 'towerPose':
      if (hero) pose(hero, 'deployTurret', 0.25, 0.7, st.tower)
      break
    case 'breathPose':
      // It draws its breath in, rearing back (the boss's breath, held open for the whole stream: `breathe`).
      if (beast) pose(beast, 'breathe', CAMEO_BREATH.from - b.at, CAMEO_BREATH.to - b.at + 0.3, hero ?? st.hero)
      break
    case 'breath':
      if (!beast || !hero) break
      // The stream starts: a tongue of fire along the ground to him (each 16th's gust is `stepCameo`'s).
      beast.facing = Math.atan2(hero.x - beast.x, hero.z - beast.z)
      {
        const m = ahead(beast, 1.1)
        const p = shortOf(beast, hero, SHELL)
        fx(sim, 'breath', m.x, m.z, { x2: p.x, z2: p.z, color: BEAST_FIRE, unit: beast.id, a: beast.facing })
      }
      break
    case 'tower': {
      const t = actor(sim, CAMEO_TOWER, st.tower, { r: 0.4, h: 1.1, style: 'ranged' })
      t.facing = Math.atan2(st.beast.x - st.tower.x, st.beast.z - st.tower.z)
      // Locked on the beast (an idle turret sweeps its head about).
      if (beast) t.targetId = beast.id
      s.tower = t.id
      fx(sim, 'tower', st.tower.x, st.tower.z, { r: 1.2, color: CAMEO_TEAL, unit: t.id })
      break
    }
    case 'shieldPose':
      // The shell's cast, its arms held braced against the fire until the breath is spent.
      if (hero) pose(hero, 'geodeShell', 0.25, CAMEO_BREATH.to - b.at, beast ?? st.beast)
      break
    case 'shield':
      if (!hero) break
      fx(sim, 'shield', hero.x, hero.z, { r: 1.4, color: CAMEO_TEAL, unit: hero.id })
      // It closes as the fire reaches him: the shell takes it, and the push of it slides him back a step.
      if (beast) {
        fx(sim, 'shieldHit', hero.x, hero.z, { r: 1.2, color: CAMEO_TEAL, unit: hero.id })
        giveGround(s, hero, beast, 0.3, 0.4, 0)
      }
      break
    case 'burn':
      // The flames flare on the shell on the drums' accents (he holds; nothing gets through).
      if (hero) fx(sim, 'shieldHit', hero.x, hero.z, { r: 1.2, color: CAMEO_TEAL, unit: hero.id })
      break
    case 'lashPose':
      // The serpent tail draws back over its back, between his shots.
      if (beast && hero) pose(beast, 'lash', 0.2, 0.46, hero)
      break
    case 'lash': {
      if (!beast || !hero) break
      // It whips over the beast's back and cracks on the shell: the first time he hops back from it, the second it gets
      // through for a flash (a flinch, a green spark: no harm, no number).
      beast.facing = Math.atan2(hero.x - beast.x, hero.z - beast.z)
      const root = ahead(beast, -0.75)
      const p = shortOf(beast, hero, SHELL)
      fx(sim, 'lash', root.x, root.z, { x2: p.x, z2: p.z, color: BEAST_TAIL, unit: beast.id, a: beast.facing })
      fx(sim, 'shieldHit', hero.x, hero.z, { r: 1.2, color: CAMEO_TEAL, unit: hero.id })
      if (b.n === 0) giveGround(s, hero, beast, 0.4, 0.28, 0.3)
      else strike(sim, beast, hero, false, 'poison')
      break
    }
    case 'shot': {
      if (!hero || !beast) break
      // Left, right, then both: the basic attack's pose, its flash at the barrel (`trackUnit`), a tracer and an impact.
      hero.facing = Math.atan2(beast.x - hero.x, beast.z - hero.z)
      hero.action = newAction(hero, 'attack', 0.001, 0.3, beast.id, beast.x, beast.z)
      hero.anim = 'attack'
      hero.animT = 0
      const sides = b.n === 2 ? [-1, 1] : [b.n === 0 ? -1 : 1]
      for (const side of sides) {
        const p = barrel(hero, side)
        fx(sim, 'shot', p.x, p.z, { x2: beast.x, z2: beast.z, color: CAMEO_TEAL, unit: hero.id })
      }
      strike(sim, hero, beast, b.n === 2)
      break
    }
    case 'claw':
      if (!hero || !beast) break
      // It lunges and rakes him: the shield takes it (a flare round him, he does not flinch).
      beast.facing = Math.atan2(hero.x - beast.x, hero.z - beast.z)
      beast.action = newAction(beast, 'attack', 0.001, 0.4, hero.id, hero.x, hero.z)
      beast.anim = 'attack'
      beast.animT = 0
      fx(sim, 'claw', hero.x, hero.z, { r: 2, color: BEAST_FIRE, a: beast.facing, unit: hero.id })
      fx(sim, 'shieldHit', hero.x, hero.z, { r: 1.2, color: CAMEO_TEAL, unit: hero.id })
      break
    case 'turret':
      if (!tower || !beast) break
      tower.facing = Math.atan2(beast.x - tower.x, beast.z - tower.z)
      tower.action = newAction(tower, 'attack', 0.001, 0.3, beast.id, beast.x, beast.z)
      tower.anim = 'attack'
      fx(sim, 'shot', tower.x, tower.z, { x2: beast.x, z2: beast.z, color: CAMEO_TEAL, unit: tower.id })
      strike(sim, tower, beast, false)
      break
    case 'flee':
      if (!hero || !beast) break
      // THE hit: both barrels, charged. The beast roars and bounds off to the left in one big leap.
      hero.facing = Math.atan2(beast.x - hero.x, beast.z - hero.z)
      hero.action = newAction(hero, 'attack', 0.001, 0.4, beast.id, beast.x, beast.z)
      hero.anim = 'attack'
      fx(sim, 'bigShot', hero.x, hero.z, { x2: beast.x, z2: beast.z, color: CAMEO_TEAL, unit: hero.id })
      strike(sim, hero, beast, true)
      fx(sim, 'roar', beast.x, beast.z, { r: 3.2, color: BEAST_FIRE, unit: beast.id })
      fx(sim, 'leap', beast.x, beast.z, { r: 2.4, color: BEAST_FIRE, unit: beast.id })
      beast.action = null
      move(s, beast, st.beastTo, 2.1, LEAP_BEAST)
      break
    case 'line':
      // The player's own hero, as it goes: one line of framing.
      if (me.alive) sim.emit({ t: 'bark', unit: me.id, key: CAMEO_LINE })
      break
    case 'run':
      if (!hero) break
      hero.action = null
      move(s, hero, st.run, 8.3 - 7.0, 0)
      s.step = s.t
      break
    case 'exit':
      if (!hero) break
      // Away in a leap, rising out of the picture to the left: a hunter on a trail.
      fx(sim, 'leap', hero.x, hero.z, { r: 1.6, color: CAMEO_TEAL, unit: hero.id })
      move(s, hero, st.heroTo, 9.6 - 8.3, LEAP_OUT, 1, true)
      break
    case 'beastGone':
      if (beast) sim.dismiss(beast)
      s.beast = 0
      break
    case 'gone':
      if (hero) sim.dismiss(hero)
      s.hero = 0
      break
    case 'towerOut':
      // His turret folds itself away once he is gone.
      if (tower) {
        fx(sim, 'towerOut', tower.x, tower.z, { r: 1.2, color: CAMEO_TEAL, unit: tower.id })
        sim.dismiss(tower)
      }
      s.tower = 0
      break
    case 'end':
      endCameo(sim, s)
      break
  }
}

/** The leaps and runs: each body along its arc, the drawn body lifted and turned, its stride given to the rig. */
const stepMoves = (sim: Sim, s: CameoState, dt: number): void => {
  for (const m of s.moves) {
    const u = sim.get(m.u)
    if (!u) continue
    const raw = Math.min(1, Math.max(0, (s.t - m.t0) / m.dur))
    // A run eases into its pace; a leap is one arc.
    const A = 0.2
    const k = m.high > 0 ? raw : (raw < A ? (raw * raw) / (2 * A) : raw - A / 2) / (1 - A / 2)
    const x0 = u.x
    const z0 = u.z
    // Moved once a frame on the scene's clock: drawn where it is (no interpolation between steps).
    u.x = u.px = m.fx + (m.tx - m.fx) * k
    u.z = u.pz = m.fz + (m.tz - m.fz) * k
    if (dt > 0) { u.vx = (u.x - x0) / dt; u.vz = (u.z - z0) / dt }
    if (m.done) { u.vx = u.vz = 0; continue }
    if (raw >= 1) {
      // Arrived: the beat that follows turns it where it should look (the move no longer does).
      m.done = true
      u.vx = u.vz = 0
      if (!m.rise) u.stunt = undefined
      if (u.anim === 'walk') u.anim = 'idle'
      continue
    }
    if (!m.back && Math.abs(m.tx - m.fx) + Math.abs(m.tz - m.fz) > 1e-3) u.facing = Math.atan2(m.tx - m.fx, m.tz - m.fz)
    // A run and the beast's bounds are strides; his leaps are a flip in the air, legs together; a step back is a slide.
    if (!u.action) u.anim = m.flips || m.back ? 'idle' : 'walk'
    if (m.high <= 0) { u.stunt = undefined; continue }
    // Over the treetops the whole way: a flat-topped arc (the body is high above the canopy for most of the flight, down only at its ends), and the leap out of the picture climbs fast.
    const lift = m.rise ? m.high * Math.pow(k, 0.55) : m.high * Math.pow(Math.sin(Math.PI * k), 0.45)
    u.stunt = { lift, flip: m.flips ? Math.min(1, Math.max(0, (k - 0.12) / 0.7)) * m.flips : 0 }
  }
  s.moves = s.moves.filter(m => s.t < m.t0 + m.dur + 0.05)
}

/** The poses run on the scene's clock (these units are not stepped as fighters). */
const tickPose = (u: Unit | undefined, dt: number): void => {
  const a = u?.action
  if (!u || !a) return
  a.t += dt
  if (a.t >= a.hitAt) a.done = true
  if (a.t >= a.end) { u.action = null; if (u.anim !== 'walk') u.anim = 'idle' }
}

/**
 * One step of the scene (`dt` real seconds: the scene keeps time with the music, not with the fight's hit-stop). Plays every
 * beat that is due, in order; returns true on the step it ends.
 */
export const stepCameo = (sim: Sim, s: CameoState, dt: number): boolean => {
  if (s.phase !== 'play') return false
  s.t += dt
  for (const id of [s.hero, s.beast, s.tower]) tickPose(sim.get(id), dt)
  stepMoves(sim, s, dt)
  // His running steps, on the ground.
  const hero = sim.get(s.hero)
  if (hero && s.t >= 7.0 && s.t < 8.3 && s.t >= s.step) {
    s.step = s.t + 0.3
    fx(sim, 'step', hero.x, hero.z, { unit: hero.id })
  }
  // Facing: the two look at each other while they fight; the turret keeps its aim on the beast.
  const beast = sim.get(s.beast)
  const tower = sim.get(s.tower)
  if (tower && beast) tower.facing = Math.atan2(beast.x - tower.x, beast.z - tower.z)
  // The breath: a gust of fire every 16th of the cue, from its jaws to the shell round him.
  if (beast && hero && s.t >= s.flame && s.flame <= CAMEO_BREATH.to + 1e-6) {
    s.flame += CAMEO_16TH
    beast.facing = Math.atan2(hero.x - beast.x, hero.z - beast.z)
    const m = ahead(beast, 1.1)
    const p = shortOf(beast, hero, SHELL)
    fx(sim, 'flame', m.x, m.z, { x2: p.x, z2: p.z, color: BEAST_FIRE, unit: beast.id })
  }
  while (s.next < CAMEO_ACTS.length && s.t >= CAMEO_ACTS[s.next]!.at) {
    const b = CAMEO_ACTS[s.next++]!
    play(sim, s, b)
    if (s.phase !== 'play') return true
  }
  return false
}

/**
 * Wait for the moment and the room: true on the step the scene begins. `toGround` is the camera's screen-to-ground; a
 * crowded view is tried again every half second (the hero walks on, the view moves with him).
 */
export const tryStartCameo = (sim: Sim, s: CameoState, dt: number, toGround: ScreenToGround, talking = false): boolean => {
  if (!cameoDue(sim, s, dt, talking)) return false
  s.retry -= dt
  if (s.retry > 0) return false
  s.retry = RETRY
  const st = stageCameo(sim, toGround)
  if (!st) return false
  beginCameo(sim, s, st)
  return true
}
