import { MENTOR_NPC } from '../data/mentor'
import type { ClassId } from '../data/skills'
import { face, setGoal, stop, walk } from './actors'
import { nearestOpen } from './grid'
import { CELL } from './grid'
import { applyStatus } from './combat'
import { mulberry32 } from './rng'
import { plainStats } from './stats'
import { K_BLOCK, K_GROUND, type ChestPlan } from './zoneFeatures'
import type { Dresser } from './dressing'
import type { Unit } from './types'
import type { Sim } from './world'

/**
 * ─── The rescued teachers' camp (roadmap #156, moved by #182) ────────────────
 *
 * The first visit's boss floor holds a small encampment, so the player stumbles
 * on it DURING the fight: a big cage with three of Sunford's teachers in it (the
 * Aegis knight, the pyromancer and the Soul Warden) to the RIGHT of where the
 * boss stands, the broken-down caravan to its LEFT, the camp fire a little
 * BELOW it, and a track of fallen wheels and splinters leading from below the
 * floor to the caravan. The finale's chest stays where it was. They are the very
 * people the hero meets in Sunford again (their ids, looks and voices), held
 * here by the bandits.
 *
 * The boss drops the cage's golden key as it falls (it arcs to the ground and
 * must be picked up); the cage opens once the key is in hand: they step out, the
 * knight thanks the hero in one line (`dlg.bark.trainerAegis.freed.1`) and they
 * settle round the fire, where each teaches (their lessons only, no small talk)
 * and the first lesson bought here is free (`lesson.camp`). The road teacher,
 * Nettle, walks over to the fire as soon as the boss falls. Nobody waits on any of
 * it: leaving the visit leaves them, and they are found in Sunford whatever
 * happened here (the town lists them unconditionally).
 *
 * The cage is the place's `cage` chest (`cages.ts` locks and opens it), three
 * cells wide; its people are captives that stay (`CaptiveState.stay`). Nothing
 * is carved: every piece stands on the floor's open ground, outside the ring the
 * boss's pack spawns in, and none stands on another.
 */

/** Rows of rock added above the first visit's chain for the camp: none since #182 (the camp stands on the boss's floor). */
export const CAMP_ROOM = 0
/** Half the cage's width, in cells (five cells across: four teachers in a row, #186 follow-up). */
export const CAGE_HALF = 2

/** Who is in the cage, the speaker in the middle. */
export const CAMP_TEACHERS: ReadonlyArray<{ npc: string; look: string; cls: ClassId; teaches: boolean }> = [
  { npc: 'trainerPyro', look: 'trainerPyro', cls: 'pyro', teaches: true },
  // The hero already has his school's first skill (the knight's): he thanks the hero and steps aside, like the road teacher at the fire (#186).
  { npc: 'trainerAegis', look: 'trainerAegis', cls: 'aegis', teaches: false },
  { npc: 'sbMasterSoulwarden', look: 'sbMasterSoulwarden', cls: 'soulwarden', teaches: true },
  { npc: 'sbMasterIronmonk', look: 'sbMasterIronmonk', cls: 'ironmonk', teaches: true }
]
/** The camp's teachers who give lessons (the knight is not one). */
export const CAMP_LESSONS: ReadonlyArray<(typeof CAMP_TEACHERS)[number]> = CAMP_TEACHERS.filter(t => t.teaches)
/** The knight's thanks, said once as the cage opens (a bark with its recording). */
export const CAMP_THANKS = 'dlg.bark.trainerAegis.freed.1'
export const CAMP_SPEAKER = 'trainerAegis'
/** The knight's last words once the free lesson is taken: Mara's reward, the Goblin King, the hero's choice (the quest objective follows). */
export const CAMP_NEXT = 'dlg.bark.trainerAegis.next.1'
/** The tip that marks those words as said (and the "go to Mara or beat the Goblin King" objective as given). */
export const CAMP_NEXT_TIP = 'campNext'

export interface CampPlan {
  /** The camp's middle (metres). */
  x: number
  z: number
  /** The cage's cells (the middle one is the chest's). */
  cells: number[]
  /** The fire, and where each teacher stands round it (the three, then Nettle). */
  fire: { x: number; z: number }
  spots: Array<{ x: number; z: number }>
  /** Where the knight stands once he has stepped aside: by the cage's door, away from the fire (#186). */
  aside: { x: number; z: number }
  /** Where Nettle steps in when she is not in the scene yet (the camp's far side). */
  entry: { x: number; z: number }
}

const cx = (i: number): number => (i + 0.5) * CELL

/** The seconds a dropped key takes to fall to the ground; it cannot be picked up before. */
export const KEY_DROP_T = 0.75

/** Is this cell open ground a piece may stand on (not rock, water, a block or sealed)? */
const openCell = (p: { w: number; h: number; solid: Uint8Array; kind: Uint8Array; sealed: Uint8Array }, i: number, j: number): boolean => {
  if (i < 2 || j < 2 || i >= p.w - 2 || j >= p.h - 2) return false
  const k = j * p.w + i
  return !p.solid[k] && p.kind[k] === K_GROUND && !p.sealed[k]
}

/**
 * Stand the cage on the boss's floor, to the right of where the boss stands: three
 * cells across in the boss's row (as far out as the floor holds three open
 * cells and the one in front of the door), its door facing the camera. Nothing is
 * carved. Returns the cage (a chest), the place its key falls when the boss is
 * not found, and the cage's cells.
 */
export const placeCamp = (p: {
  w: number; h: number; solid: Uint8Array; trail: Uint8Array; kind: Uint8Array; sealed: Uint8Array
  boss: { x: number; z: number }
}): { chest: Omit<ChestPlan, 'id'>; key: { x: number; z: number }; bi: number; bj: number; ci: number; cj: number; cells: number[] } | null => {
  const { w, kind } = p
  const bi = Math.floor(p.boss.x / CELL)
  const bj = Math.floor(p.boss.z / CELL)
  // Out of the ring the boss's pack spawns in (2.5 cells round the pack; the cage's nearest cell is at least 3.5): 4 or 5 to the
  // right, in the boss's row or the one below or above it; where the floor holds none, the wall is notched (two cells deep).
  const fits = (ci: number, cj: number): boolean => [-2, -1, 0, 1, 2].every(d => openCell(p, ci + d, cj) && openCell(p, ci + d, cj + 1))
  let spot: { ci: number; cj: number } | null = null
  for (const dj of [0, 1, -1]) for (const side of [6, 7]) if (!spot && fits(bi + side, bj + dj)) spot = { ci: bi + side, cj: bj + dj }
  if (!spot) {
    const ci = bi + 6
    for (const d of [-2, -1, 0, 1, 2]) for (const r of [0, 1]) {
      const i = ci + d
      const j = bj + r
      const k = j * w + i
      if (i < 3 || i >= w - 2 || j < 3 || j >= p.h - 3 || p.sealed[k]) return null
      p.solid[k] = 0
      kind[k] = K_GROUND
    }
    spot = { ci, cj: bj }
  }
  // The caravan needs room on the left (two cells across, three along, a cell of open ground round it): where the floor
  // holds none, the wall is notched here, before the dresser counts the reachable ground.
  const roomLeft = [-1, 0].some(dj => [-6, -7, -5].some(di => {
    for (let j = bj + dj - 1; j <= bj + dj + 3; j++) for (let i = bi + di - 1; i <= bi + di + 2; i++) if (!openCell(p, i, j)) return false
    return true
  }))
  if (!roomLeft) {
    for (let j = bj - 3; j <= bj + 3; j++) {
      for (let i = bi - 10; i <= bi - 4; i++) {
        const k = j * w + i
        if (i < 3 || j < 3 || j >= p.h - 3 || p.sealed[k]) continue
        p.solid[k] = 0
        kind[k] = K_GROUND
      }
    }
  }
  const { ci, cj } = spot
  const cells: number[] = []
  for (const d of [-2, -1, 0, 1, 2]) {
    const k = cj * w + ci + d
    kind[k] = K_BLOCK
    cells.push(k)
  }
  return {
    chest: { x: cx(ci), z: cx(cj), tier: 'iron', role: 'cage', sx: cx(ci), sz: cx(cj + 1), door: -1, guard: -1 },
    key: { x: cx(bi), z: cx(bj + 1) },
    bi, bj, ci, cj, cells
  }
}

/** Where the fire may stand, tried in turn (cells from the boss: a little below it). */
const FIRE_AT: ReadonlyArray<readonly [number, number]> = [[0, 3], [1, 3], [-1, 3], [0, 4], [1, 4], [-1, 4], [0, 5], [2, 4], [-2, 4]]
/** Where the caravan may stand, tried in turn (cells from the boss: to its left; two across, three along). */
const WAGON_AT: ReadonlyArray<readonly [number, number, number]> = [-1, 0, -2, 1].flatMap(dj => [-6, -5, -7, -4, -8].map(di => [di, dj, 0] as const))
/** The rock round the fire is cut back this far (cells): the trees of the wood stand beyond it, and there is room to walk all round. */
const FIRE_CLEAR = 5.5
/**
 * Where the three teachers stand round the fire once they are out: evenly, a third of the way round from each other (east-south-east,
 * west-south-west and north), each with the nearer and the farther ring to fall back on. Then Nettle, a little further west than
 * the ring so the way past the fire stays open.
 */
const TEACHER_ANGLE: ReadonlyArray<number> = [(30 * Math.PI) / 180, (150 * Math.PI) / 180, (270 * Math.PI) / 180]
const RING: ReadonlyArray<number> = [2.4, 2.0, 2.7]
const NETTLE_AT: ReadonlyArray<readonly [number, number]> = [[-4, 0], [-4, 1], [-3, 0], [-4, -1], [-3, 1], [-3, -1], [-2, 0]]
/** The wreckage on the way in, in cells from the boss: from below the floor towards the caravan (left, and a little above the boss's row), thicker towards it. */
const DEBRIS_AT: ReadonlyArray<readonly [number, number, 'wheel' | 'spikes']> = [
  [-2.6, 6.2, 'spikes'], [-3.0, 5.2, 'wheel'], [-3.3, 4.2, 'spikes'], [-3.5, 3.3, 'wheel'], [-3.6, 2.6, 'spikes'], [-4.0, 2.1, 'wheel']
]

/**
 * The fire and the broken-down caravan (set pieces: they keep their cells, and the
 * dresser takes either back if it would cut anything off), the track of wreckage
 * between them, and the teachers' places round the fire.
 */
export const dressCamp = (d: Dresser, p: {
  w: number; h: number; solid: Uint8Array; kind: Uint8Array; sealed: Uint8Array
  bi: number; bj: number; ci: number; cj: number; cells: readonly number[]; key: { x: number; z: number }
}): CampPlan => {
  const { w, solid, kind, sealed, bi, bj } = p
  let fi = bi
  let fj = bj + 4
  for (const [di, dj] of FIRE_AT) {
    if (d.stand('fire', bi + di, bj + dj, 0, { clear: 0 })) { fi = bi + di; fj = bj + dj; break }
  }
  let wagon = false
  for (const [di, dj, a] of WAGON_AT) if (!wagon && d.stand('wagon', bi + di, bj + dj, a, { clear: 0 })) wagon = true
  // What fell off the caravan (#177, #182): dice-free, on open ground only, never on a piece.
  for (const [dx, dz, kd] of DEBRIS_AT) {
    // dx, dz are cells from the boss's cell centre: the wreck lies where it says, on a cell that is open ground.
    const x = (bi + 0.5 + dx) * CELL
    const z = (bj + 0.5 + dz) * CELL
    if (!d.free(Math.floor(x / CELL), Math.floor(z / CELL), 0)) continue
    d.lay(kd, x, z, 0.7 * (dx + 9))
  }
  // The wood is cut back from the fire: no tree (a rim cell of rock) within `FIRE_CLEAR` cells of it, the cage's own cells kept.
  for (let j = Math.floor(fj - FIRE_CLEAR); j <= Math.ceil(fj + FIRE_CLEAR); j++) {
    for (let i = Math.floor(fi - FIRE_CLEAR); i <= Math.ceil(fi + FIRE_CLEAR); i++) {
      if (Math.hypot(i - fi, j - fj) > FIRE_CLEAR || i < 3 || j < 3 || i >= p.w - 3 || j >= p.h - 3) continue
      const k = j * w + i
      if (!solid[k] || sealed[k] || kind[k] === K_BLOCK || (Math.abs(j - p.cj) <= 2 && Math.abs(i - p.ci) <= 3)) continue
      solid[k] = 0
      kind[k] = K_GROUND
    }
  }
  // And round the cage: no stone or tree where the teachers step out and stand (the cage's own cells and the map's edge stay).
  for (let j = p.cj - 5; j <= p.cj + 6; j++) {
    for (let i = p.ci - 6; i <= p.ci + 6; i++) {
      if (Math.hypot((i - p.ci) / 1.25, j - p.cj) > 5.2 || i < 3 || j < 3 || i >= p.w - 3 || j >= p.h - 3) continue
      const k = j * w + i
      if (!solid[k] || sealed[k] || kind[k] === K_BLOCK) continue
      solid[k] = 0
      kind[k] = K_GROUND
    }
  }
  const keyK = Math.floor(p.key.z / CELL) * w + Math.floor(p.key.x / CELL)
  const spots: Array<{ x: number; z: number }> = []
  const usable = (i: number, j: number): boolean => {
    if (!openCell(p, i, j) || j * w + i === keyK || !d.free(i, j, 0)) return false
    if (spots.some(sp => Math.floor(sp.x / CELL) === i && Math.floor(sp.z / CELL) === j)) return false
    // Not on the wreckage, nor on the way the hero walks up to the cage's door.
    return !DEBRIS_AT.some(([dx, dz]) => Math.hypot(bi + 0.5 + dx - (i + 0.5), bj + 0.5 + dz - (j + 0.5)) < 1.4)
  }
  for (const a of TEACHER_ANGLE) {
    for (const r of RING) {
      const i = fi + Math.round(Math.cos(a) * r)
      const j = fj + Math.round(Math.sin(a) * r)
      if (usable(i, j)) { spots.push({ x: cx(i), z: cx(j) }); break }
    }
  }
  // Too crowded or too narrow for the ring: any open cell round the fire, nearest first.
  if (spots.length < 3) {
    for (let r = 1; r <= 5 && spots.length < 3; r++) for (let dj = -r; dj <= r && spots.length < 3; dj++) for (let di = -r; di <= r && spots.length < 3; di++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) === r && usable(fi + di, fj + dj)) spots.push({ x: cx(fi + di), z: cx(fj + dj) })
    }
  }
  // Nettle, west of the fire.
  for (const [di, dj] of NETTLE_AT) {
    if (spots.length >= 4) break
    if (usable(fi + di, fj + dj)) spots.push({ x: cx(fi + di), z: cx(fj + dj) })
  }
  // Too crowded round the fire (it never is on the seeds tried): the fire's own cell and its neighbours.
  while (spots.length < 4) spots.push({ x: cx(fi + spots.length - 2), z: cx(fj) })
  // Nettle comes in from the south edge of the floor, the way the hero came.
  let entry = { x: cx(bi), z: cx(bj + 3) }
  for (const [di, dj] of [[0, 6], [1, 6], [-1, 6], [0, 5], [1, 5], [-1, 5], [2, 5]] as const) {
    if (openCell(p, bi + di, bj + dj) && !solid[(bj + dj) * w + bi + di]) { entry = { x: cx(bi + di), z: cx(bj + dj) }; break }
  }
  // The knight's place: a couple of cells left of the cage's door, a row or two below it, on open ground.
  let aside = { x: cx(p.ci - 3), z: cx(p.cj + 2) }
  for (const [di, dj] of [[-3, 2], [-3, 1], [-2, 3], [3, 2], [3, 1], [-4, 2]] as const) {
    const i = p.ci + di
    const j = p.cj + dj
    if (openCell(p, i, j) && d.free(i, j, 0) && !spots.some(sp => Math.floor(sp.x / CELL) === i && Math.floor(sp.z / CELL) === j)) { aside = { x: cx(i), z: cx(j) }; break }
  }
  void kind
  return { x: cx(fi), z: cx(fj), cells: [...p.cells], fire: { x: cx(fi), z: cx(fj) }, spots, aside, entry }
}

// ─── The camp in the world ───────────────────────────────────────────────────

export type NettleBeat = 'idle' | 'walk' | 'there'

export interface CampState {
  fire: { x: number; z: number }
  /** Nettle's place by the fire, where she steps in from, and how her walk goes. */
  nx: number
  nz: number
  ex: number
  ez: number
  nettle: NettleBeat
  /** Seconds into her walk. */
  t: number
  /** The cage's cries for help (#187): armed by the first chest the hero opens, over when the cage is. */
  help?: { armed: boolean; t: number; n: number }
  /** The goal's "Free the caged teachers" was tapped: the hero walks to the key, then to the cage (`rescue.ts`). */
  auto?: { kind: '' | 'move' | 'chest' }
}

// ─── The cries for help (#187) ───────────────────────────────────────────────
/**
 * Once the hero has opened the first chest of the first visit he says, to himself, "Is there somebody screaming for
 * help?", and the cage begins to call: each of three teachers in turn ("Help, anybody!", "We were kidnapped!", "Monsters,
 * help!"), a bubble over the one who calls with its recording, every 3 seconds until all three have been heard, then every
 * 5 seconds until all three have been heard again, then every 7 for the rest of the level, so it never grates. It
 * stops when the cage opens. It is a pull toward the camp, not a fight timer: nothing here moves a unit.
 */
export const HELP_MONOLOG = 'dlg.bark.hero.cage.1'
export const HELP_CALLS: ReadonlyArray<{ npc: string; key: string }> = [
  { npc: 'trainerPyro', key: 'dlg.bark.trainerPyro.help.1' },
  { npc: 'sbMasterSoulwarden', key: 'dlg.bark.sbMasterSoulwarden.help.1' },
  { npc: 'sbMasterIronmonk', key: 'dlg.bark.sbMasterIronmonk.help.1' }
]
/**
 * Seconds between two calls, by how many have been made: 3 for the first three, 8 for the next three, then a different
 * wait of 12 to 15 s each time (#193: it grated). The third tier's wait is a fixed hash of the count, not a dice roll,
 * so a visit replays the same.
 */
export const helpPeriod = (made: number): number => (made < 3 ? 3 : made < 6 ? 8 : 12 + (((made * 2654435761) >>> 0) % 3001) / 1000)
/** From the monologue to the first call. */
export const HELP_FIRST_S = 3

/** Every step, in the first visit before the cage is open: the monologue, then the calls. */
export const stepHelp = (sim: Sim, dt: number): void => {
  const c = sim.camp
  const h = sim.hero
  if (!c || !h) return
  const cage = sim.chests.find(q => q.role === 'cage')
  if (!cage || cage.state === 'open' || !h.unit.alive) return
  const s = (c.help ??= { armed: false, t: 0, n: 0 })
  if (!s.armed) {
    if (h.chests <= 0) return
    s.armed = true
    s.t = 0
    s.n = 0
    sim.emit({ t: 'bark', unit: h.unit.id, key: HELP_MONOLOG })
    return
  }
  s.t += dt
  if (s.t < (s.n === 0 ? HELP_FIRST_S : helpPeriod(s.n))) return
  const call = HELP_CALLS[s.n % HELP_CALLS.length]!
  const who = sim.captives.find(p => p.npc === call.npc && p.phase === 'caged')
  s.t = 0
  s.n++
  if (who) sim.emit({ t: 'bark', unit: who.unit, key: call.key })
}

/** Nettle's pace, and the walk given up after this long (she is simply there, in a puff). */
const NETTLE_SPEED = 3.6
export const NETTLE_WALK_MAX = 30
const NETTLE_SALT = 0x6c2f19a3
const TEACHER_SALT = 0x3b8e51d7
const SHADOW = '#9c7bff'

/** The camp's people: three teachers in the cage, and the fire they will sit by. */
export const populateCamp = (sim: Sim, plan: CampPlan, key: { x: number; z: number } | undefined): void => {
  // The boss drops it when it falls (#182): until then it is nowhere (`drop` -1).
  sim.cageKey = key ? { x: key.x, z: key.z, taken: false, drop: -1 } : null
  sim.captives = []
  const n = plan.spots[3] ?? plan.fire
  sim.camp = { fire: { ...plan.fire }, nx: n.x, nz: n.z, ex: plan.entry.x, ez: plan.entry.z, nettle: 'idle', t: 0 }
  const cage = sim.chests.find(c => c.role === 'cage')
  if (!cage || cage.state === 'open') return
  CAMP_TEACHERS.forEach((t, q) => {
    const x = cage.x + (q - 1.5) * 1.5
    const z = cage.z - 0.05
    // A unit rolls dice as it is born: theirs come from a stream of their own,
    // so the opening fight's dice fall as they did before the camp.
    const born: { u: Unit | null } = { u: null }
    sim.withStream(mulberry32((sim.seed ^ TEACHER_SALT ^ q) >>> 0), () => {
      born.u = sim.addUnit({
        kind: t.look, team: 0, rank: 'npc', level: 1, x, z, r: 0.3, h: 1.45,
        s: plainStats({ hp: 1000, dmg: 0, speed: 3.2 }), facing: 0
      })
    })
    const u = born.u
    if (!u) return
    u.x = u.px = x
    u.z = u.pz = z
    u.rooted = true
    // The boss fights beside them: nothing aims at or sweeps over an NPC (`rank: 'npc'` is skipped by every query), so
    // they need no shield status (it drew a glowing bubble round each of them).
    const spot = t.teaches ? (plan.spots[CAMP_LESSONS.indexOf(t)] ?? plan.fire) : plan.aside
    sim.captives.push({
      unit: u.id, lead: t.npc === CAMP_SPEAKER, phase: 'caged', t: 0, path: [[x, z]], hx: spot.x, hz: spot.z,
      npc: t.npc, stay: true, ...(t.npc === CAMP_SPEAKER ? { line: CAMP_THANKS } : {})
    })
  })
}

/** Out of the big cage: each to the door in the middle, through it, and a step to the side. */
export const campWayOut = (u: Unit | undefined, c: { x: number; z: number }, slot = 0, n = 1): Array<[number, number]> => {
  // To the door in the middle, through it, and to their own place in a row in front of the cage: side by side, a body-width and a half apart.
  const x = c.x + (slot - (n - 1) / 2) * LINE_GAP
  return [[c.x, u?.z ?? c.z], [c.x, c.z + 0.9], [c.x, c.z + 1.9], [x, c.z + 2.5]]
}
/** Metres between two teachers standing in a row in front of the cage. */
const LINE_GAP = 1.45

/** Is this person one of the rescued teachers, out of the cage, in this visit's camp? */
export const inCamp = (sim: Sim, npcId: string): boolean =>
  !!sim.camp && sim.captives.some(p => p.stay && p.npc === npcId && p.phase !== 'caged')

const nettleOf = (sim: Sim): Unit | null => {
  for (const u of sim.units) if (u.alive && u.npc === MENTOR_NPC) return u
  return null
}

/** The teachers are still caged: the visit is not over (the Leave button waits, the way points to the cage). */
export const campPending = (sim: Sim): boolean => !!sim.camp && sim.chests.some(c => c.role === 'cage' && c.state !== 'open')

/** Where the way to the teachers leads: the key while it lies, then the cage's door. */
export const campTarget = (sim: Sim): { id: number; x: number; z: number } | null => {
  // Before the boss drops it the key is nowhere: the way leads to the cage's door.
  if (sim.cageKey && !sim.cageKey.taken && (sim.cageKey.drop ?? KEY_DROP_T) >= 0) return { id: -2, x: sim.cageKey.x, z: sim.cageKey.z }
  const cage = sim.chests.find(c => c.role === 'cage' && c.state !== 'open')
  return cage ? { id: -3, x: cage.sx, z: cage.sz } : null
}

/**
 * The boss's key (#182): where the boss fell (or the nearest open ground to it), arcing down
 * for `KEY_DROP_T` seconds; it can be picked up once it has landed.
 */
const dropKey = (sim: Sim, dt: number): void => {
  const k = sim.cageKey
  if (!k || k.taken || k.drop === undefined) return
  if (k.drop < 0) {
    // Where the boss lay: the dead leader of the finale's pack, else the planned place.
    const g = sim.groups.find(q => q.boss)
    const boss = g ? sim.units.find(u => u.group === g.id && !u.alive && u.kind === g.boss) : undefined
    let x = boss?.x ?? k.x
    let z = boss?.z ?? k.z
    const out: [number, number] = [x, z]
    if (nearestOpen(sim.grid, x, z, out, 4)) { x = out[0]; z = out[1] }
    k.x = x
    k.z = z
    k.drop = 0
    sim.emit({ t: 'cageKeyDrop', x, z })
    return
  }
  if (k.drop < KEY_DROP_T) k.drop = Math.min(KEY_DROP_T, k.drop + dt)
}

/** Every step: once the boss is down, Nettle walks over to the fire. */
export const stepCamp = (sim: Sim, dt: number): void => {
  const c = sim.camp
  if (!c || sim.ended !== 'victory') return
  dropKey(sim, dt)
  const hero = sim.hero?.unit
  let u = nettleOf(sim)
  if (c.nettle === 'idle') {
    if (!u) {
      // She never came into the opening (the hero knew her skill): she comes now.
      const born: { u: Unit | null } = { u: null }
      sim.withStream(mulberry32((sim.seed ^ NETTLE_SALT) >>> 0), () => {
        born.u = sim.addUnit({
          kind: 'sfShadow', team: 0, rank: 'npc', level: 1, x: c.ex, z: c.ez, r: 0.5, h: 1.45,
          s: plainStats({ hp: 1000, dmg: 0, speed: NETTLE_SPEED }), facing: 0, npc: MENTOR_NPC
        })
      })
      u = born.u
      if (!u) return
      u.x = u.px = c.ex
      u.z = u.pz = c.ez
      sim.emit({ t: 'fx', id: 'blink', x: c.ex, z: c.ez, unit: 0, color: SHADOW })
    }
    setGoal(sim, u, c.nx, c.nz)
    c.nettle = 'walk'
    c.t = 0
    return
  }
  if (!u) return
  if (c.nettle === 'walk') {
    c.t += dt
    const near = Math.hypot(c.nx - u.x, c.nz - u.z) < 0.5
    if (!near && walk(sim, u, dt)) { u.anim = 'walk'; return }
    if (!near && c.t < NETTLE_WALK_MAX) {
      // Held up (a body in the way): try the way again now and then.
      if (!u.hasGoal || (c.t % 1) < dt) setGoal(sim, u, c.nx, c.nz)
      u.anim = 'idle'
      return
    }
    if (!near) {
      u.x = u.px = c.nx
      u.z = u.pz = c.nz
      sim.emit({ t: 'fx', id: 'blink', x: c.nx, z: c.nz, unit: 0, color: SHADOW })
    }
    stop(u)
    c.nettle = 'there'
  }
  // By the fire: she turns to the hero.
  u.anim = 'idle'
  if (hero) face(u, hero.x, hero.z)
}
