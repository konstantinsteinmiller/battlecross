import { MENTOR_NPC } from '../data/mentor'
import { face, setGoal, stop, walk } from './actors'
import { CELL } from './grid'
import { mulberry32 } from './rng'
import { plainStats } from './stats'
import { K_BLOCK, K_GROUND, type ChestPlan } from './zoneFeatures'
import { carveLine } from './layouts'
import type { Dresser } from './dressing'
import type { Unit } from './types'
import type { Sim } from './world'

/**
 * ─── The rescued teachers' camp (roadmap #156) ───────────────────────────────
 *
 * The first visit's boss area runs on into a small encampment, up the screen
 * from the boss's floor (some 40 % more ground): a big cage with three of
 * Sunford's teachers in it — the Aegis knight, the pyromancer and the Soul
 * Warden — the cage's golden key on the ground in front of it, a broken-down
 * caravan and a camp fire. They are the very people the hero meets in Sunford
 * again (their ids, looks and voices), held here by the bandits.
 *
 * The cage opens once the boss is down and the key is in hand: they step out,
 * the knight thanks the hero in one line (`dlg.bark.trainerAegis.freed.1`)
 * and they settle round the fire, where each teaches (their lessons only, no
 * small talk) and the first lesson bought here is free (`lesson.camp`). The
 * road teacher, Nettle, walks over to the fire as soon as the boss falls.
 * Nobody waits on any of it: leaving the visit leaves them, and they are found
 * in Sunford whatever happened here (the town lists them unconditionally).
 *
 * The cage is the place's `cage` chest (`cages.ts` locks and opens it), three
 * cells wide; its people are captives that stay (`CaptiveState.stay`).
 */

/** Rows of rock added above the first visit's chain for the camp. */
export const CAMP_ROOM = 18
/** The camp's radius (cells), and how far up the screen from the finale's edge its middle lies. */
const CAMP_R = 5.2
const CAMP_GAP = 3.6
/** Half the cage's width, in cells (three cells across). */
export const CAGE_HALF = 1

/** Who is in the cage, the speaker in the middle. */
export const CAMP_TEACHERS: ReadonlyArray<{ npc: string; look: string }> = [
  { npc: 'trainerPyro', look: 'trainerPyro' },
  { npc: 'trainerAegis', look: 'trainerAegis' },
  { npc: 'sbMasterSoulwarden', look: 'sbMasterSoulwarden' }
]
/** The knight's thanks, said once as the cage opens (a bark with its recording). */
export const CAMP_THANKS = 'dlg.bark.trainerAegis.freed.1'
export const CAMP_SPEAKER = 'trainerAegis'

export interface CampPlan {
  /** The camp's middle (metres). */
  x: number
  z: number
  /** The cage's cells (the middle one is the chest's). */
  cells: number[]
  /** The fire, and where each teacher stands round it (the three, then Nettle). */
  fire: { x: number; z: number }
  spots: Array<{ x: number; z: number }>
  /** Where Nettle steps in when she is not in the scene yet (the camp's far side). */
  entry: { x: number; z: number }
}

const cx = (i: number): number => (i + 0.5) * CELL

/**
 * Cut the camp out of the rock above the finale and stand the cage in it.
 * Returns the cage (a chest), its key and the camp; the fire, the caravan and
 * the teachers' places come after, once the set pieces can be stood
 * (`dressCamp`).
 */
export const carveCamp = (p: {
  w: number; h: number; solid: Uint8Array; trail: Uint8Array; kind: Uint8Array; sealed: Uint8Array
  fin: { i: number; j: number; r: number }
}): { chest: Omit<ChestPlan, 'id'>; key: { x: number; z: number }; ci: number; cj: number; cells: number[] } => {
  const { w, h, solid, trail, kind, sealed, fin } = p
  const ci = fin.i
  const cj = Math.max(8, Math.round(fin.j - fin.r - CAMP_GAP))
  // A round of open ground, its edge even (no dice: the place's stream is untouched).
  const R = Math.ceil(CAMP_R)
  for (let dj = -R; dj <= R; dj++) {
    for (let di = -R; di <= R; di++) {
      const i = ci + di
      const j = cj + dj
      if (i < 3 || j < 3 || i >= w - 3 || j >= h - 3 || Math.hypot(di, dj) > CAMP_R) continue
      const k = j * w + i
      if (sealed[k]) continue
      solid[k] = 0
    }
  }
  // The worn way in, from the boss's floor to the middle of the camp.
  carveLine(solid, trail, w, h, fin.i, fin.j, ci, cj, 2)
  // The cage across the top, its door facing the camera; the key two steps in front.
  const gj = cj - 3
  const cells: number[] = []
  for (let di = -CAGE_HALF; di <= CAGE_HALF; di++) {
    const k = gj * w + ci + di
    solid[k] = 0
    trail[k] = 0
    kind[k] = K_BLOCK
    cells.push(k)
  }
  for (const j of [gj + 1, gj + 2]) { solid[j * w + ci] = 0; kind[j * w + ci] = K_GROUND }
  return {
    chest: { x: cx(ci), z: cx(gj), tier: 'iron', role: 'cage', sx: cx(ci), sz: cx(gj + 1), door: -1, guard: -1 },
    key: { x: cx(ci), z: cx(gj + 2) },
    ci, cj, cells
  }
}

/** Where the fire and the caravan may stand, tried in turn (cells from the camp's middle). */
const FIRE_AT: ReadonlyArray<readonly [number, number]> = [[2, 1], [-2, 1], [2, 2], [-2, 2], [3, 0], [-3, 0], [1, 2], [-1, 2]]
const WAGON_AT: ReadonlyArray<readonly [number, number, number]> = [[-4, -2, 0], [3, -2, 0], [-4, 0, 0], [3, 0, 0], [-3, 2, Math.PI / 2], [1, 2, Math.PI / 2]]
/** The places round the fire the teachers keep (cells from it): the three, then Nettle. */
const SPOT_AT: ReadonlyArray<readonly [number, number]> = [[-1, 1], [1, 1], [0, 2], [1, -1], [-1, -1], [-2, 0], [2, 0], [0, -2], [-2, 2], [2, 2]]

/**
 * The fire and the broken-down caravan (set pieces: they keep their cells,
 * and the dresser takes either back if it would cut anything off), and the
 * teachers' places round the fire.
 */
export const dressCamp = (d: Dresser, p: {
  w: number; solid: Uint8Array; kind: Uint8Array
  ci: number; cj: number; cells: readonly number[]; key: { x: number; z: number }
}): CampPlan => {
  const { w, solid, kind, ci, cj } = p
  let fi = ci + 2
  let fj = cj + 1
  for (const [di, dj] of FIRE_AT) {
    if (d.stand('fire', ci + di, cj + dj, 0, { clear: 0 })) { fi = ci + di; fj = cj + dj; break }
  }
  for (const [di, dj, a] of WAGON_AT) if (d.stand('wagon', ci + di, cj + dj, a, { clear: 0 })) break
  const keyK = Math.floor(p.key.z / CELL) * w + Math.floor(p.key.x / CELL)
  const spots: Array<{ x: number; z: number }> = []
  for (const [di, dj] of SPOT_AT) {
    if (spots.length >= 4) break
    const k = (fj + dj) * w + fi + di
    if (solid[k] || kind[k] !== K_GROUND || k === keyK || k === keyK - w) continue
    spots.push({ x: cx(fi + di), z: cx(fj + dj) })
  }
  // Too crowded round the fire (it never is on the seeds tried): the camp's middle.
  while (spots.length < 4) spots.push({ x: cx(ci + spots.length - 2), z: cx(cj + 1) })
  // Nettle comes in from the camp's far edge, beside the cage.
  let entry = { x: cx(ci), z: cx(cj) }
  for (const di of [-3, 3, -4, 4, -2, 2]) {
    const k = (cj - 3) * w + ci + di
    if (!solid[k] && kind[k] === K_GROUND) { entry = { x: cx(ci + di), z: cx(cj - 3) }; break }
  }
  return { x: cx(ci), z: cx(cj), cells: [...p.cells], fire: { x: cx(fi), z: cx(fj) }, spots, entry }
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
}

/** Nettle's pace, and the walk given up after this long (she is simply there, in a puff). */
const NETTLE_SPEED = 3.6
export const NETTLE_WALK_MAX = 30
const NETTLE_SALT = 0x6c2f19a3
const TEACHER_SALT = 0x3b8e51d7
const SHADOW = '#9c7bff'

/** The camp's people: three teachers in the cage, and the fire they will sit by. */
export const populateCamp = (sim: Sim, plan: CampPlan, key: { x: number; z: number } | undefined): void => {
  sim.cageKey = key ? { x: key.x, z: key.z, taken: false } : null
  sim.captives = []
  const n = plan.spots[3] ?? plan.fire
  sim.camp = { fire: { ...plan.fire }, nx: n.x, nz: n.z, ex: plan.entry.x, ez: plan.entry.z, nettle: 'idle', t: 0 }
  const cage = sim.chests.find(c => c.role === 'cage')
  if (!cage || cage.state === 'open') return
  CAMP_TEACHERS.forEach((t, q) => {
    const x = cage.x + (q - 1) * CELL
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
    const spot = plan.spots[q] ?? plan.fire
    sim.captives.push({
      unit: u.id, lead: t.npc === CAMP_SPEAKER, phase: 'caged', t: 0, path: [[x, z]], hx: spot.x, hz: spot.z,
      npc: t.npc, stay: true, ...(t.npc === CAMP_SPEAKER ? { line: CAMP_THANKS } : {})
    })
  })
}

/** Out of the big cage: each to the door in the middle, through it, and a step to the side. */
export const campWayOut = (u: Unit | undefined, c: { x: number; z: number }): Array<[number, number]> => {
  const side = u ? Math.sign(Math.round((u.x - c.x) / CELL)) : 0
  return [[c.x, u?.z ?? c.z], [c.x, c.z + 0.9], [c.x + side * 1.3, c.z + 1.6]]
}

/** Is this person one of the rescued teachers, out of the cage, in this visit's camp? */
export const inCamp = (sim: Sim, npcId: string): boolean =>
  !!sim.camp && sim.captives.some(p => p.stay && p.npc === npcId && p.phase !== 'caged')

const nettleOf = (sim: Sim): Unit | null => {
  for (const u of sim.units) if (u.alive && u.npc === MENTOR_NPC) return u
  return null
}

/** Every step: once the boss is down, Nettle walks over to the fire. */
export const stepCamp = (sim: Sim, dt: number): void => {
  const c = sim.camp
  if (!c || sim.ended !== 'victory') return
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
