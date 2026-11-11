import { isSolidAt } from '../sim/grid'
import { mulberry32 } from '../sim/rng'
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
  | 'leap' | 'beastLand' | 'landPose' | 'land' | 'roar' | 'towerPose' | 'tower' | 'shieldPose' | 'shield'
  | 'shot' | 'claw' | 'turret' | 'flee' | 'line' | 'run' | 'exit' | 'beastGone' | 'gone' | 'towerOut' | 'end'
export interface CameoBeat { at: number; act: CameoAct; n?: number }

/**
 * The script, on the cue's clock (see the table over `introFight` in `audio/songs.ts`):
 *   0.20   the cue's opening blow      the superhero landing (the chimera landed a beat before, turning on him)
 *   1.90   the summon downbeat         the turret is set down
 *   2.40                               the shield, wrapped round him before he shoots
 *   3.69…  the six blows, 0.45 apart   pistol, pistol | claw on the shield | turret, both pistols | claw
 *   6.50   THE hit                     the charged shot; the chimera bounds away to the left
 *   7.0–   the resolve                 the line, a few running steps, the leap away; the turret folds
 */
export const CAMEO_ACTS: readonly CameoBeat[] = [
  { at: CAMEO_FROM, act: 'leap' },
  { at: -0.15, act: 'beastLand' },
  { at: -0.1, act: 'landPose' },
  { at: 0.2, act: 'land' },
  { at: 0.8, act: 'roar' },
  { at: 1.65, act: 'towerPose' },
  { at: 1.9, act: 'tower' },
  { at: 2.15, act: 'shieldPose' },
  { at: 2.4, act: 'shield' },
  { at: 3.69, act: 'shot', n: 0 },
  { at: 4.14, act: 'shot', n: 1 },
  { at: 4.59, act: 'claw', n: 0 },
  { at: 5.04, act: 'turret' },
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
const BEAST_FIRE = '#ff9a3a'

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
}

/** Arm the scene for this visit (the opening fight, on a save that has not seen it). */
export const armCameo = (): CameoState => ({
  phase: 'wait', wait: 0, retry: 0, t: CAMEO_FROM, next: 0, stage: null, hero: 0, beast: 0, tower: 0, moves: [], step: 0
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
  const hero = actor(sim, CAMEO_HERO, st.heroFrom, { r: 0.45, h: 1.45, style: 'ranged' })
  hero.s.dual = 1
  const beast = actor(sim, CAMEO_BEAST, st.beastFrom, { r: 0.9, h: 1.85 })
  s.hero = hero.id
  s.beast = beast.id
  hero.stunt = { lift: 3.4, flip: 0 }
  beast.stunt = { lift: 2.6, flip: 0 }
}

/** Over: whatever of the scene is still in the world goes (a skip of the visit, a defeat). */
export const endCameo = (sim: Sim, s: CameoState): void => {
  for (const id of [s.hero, s.beast, s.tower]) { const u = sim.get(id); if (u) sim.dismiss(u) }
  s.hero = s.beast = s.tower = 0
  s.moves.length = 0
  s.phase = 'done'
}

const move = (s: CameoState, u: Unit, to: { x: number; z: number }, dur: number, high: number, flips = 0, rise = false): void => {
  s.moves = s.moves.filter(m => m.u !== u.id)
  s.moves.push({ u: u.id, fx: u.x, fz: u.z, tx: to.x, tz: to.z, t0: s.t, dur, high, flips, rise })
}

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
const strike = (sim: Sim, from: Unit, to: Unit, heavy: boolean): void => {
  sim.emit({ t: 'hit', src: from.id, tgt: to.id, x: to.x, z: to.z, h: to.h, amount: 0, crit: heavy, type: 'pierce', heavy, toHero: false, killed: false, dot: false })
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
      if (beast) move(s, beast, st.beast, -0.15 - CAMEO_FROM, 2.6)
      if (hero) move(s, hero, st.hero, 0.2 - CAMEO_FROM, 3.4, 1)
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
    case 'roar':
      if (!beast) break
      pose(beast, 'enrage', 0.25, 1.1, st.hero)
      fx(sim, 'roar', beast.x, beast.z, { r: 5, color: BEAST_FIRE, unit: beast.id })
      break
    case 'towerPose':
      if (hero) pose(hero, 'deployTurret', 0.25, 0.7, st.tower)
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
      if (hero) pose(hero, 'geodeShell', 0.25, 0.7, st.beast)
      break
    case 'shield':
      if (hero) fx(sim, 'shield', hero.x, hero.z, { r: 1.4, color: CAMEO_TEAL, unit: hero.id })
      break
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
      move(s, beast, st.beastTo, 2.1, 3.6)
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
      move(s, hero, st.heroTo, 9.6 - 8.3, 6.5, 1, true)
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
    if (Math.abs(m.tx - m.fx) + Math.abs(m.tz - m.fz) > 1e-3) u.facing = Math.atan2(m.tx - m.fx, m.tz - m.fz)
    // A run and the beast's bounds are strides; his leaps are a flip in the air, legs together.
    if (!u.action) u.anim = m.flips ? 'idle' : 'walk'
    if (m.high <= 0) { u.stunt = undefined; continue }
    const lift = m.rise ? m.high * k * k : m.high * 4 * k * (1 - k)
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
