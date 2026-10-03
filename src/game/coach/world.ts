import type { Sim } from '../sim/world'
import type { Unit } from '../sim/types'
import { TOWNS } from '../data/zones'
import type { ClassId } from '../data/skills'
import { canLearnFrom } from './goal'
import { dummyBeat, dummyOf } from './dummy'
import { nextObjective, openBranches } from '../sim/route'

/**
 * ─── Where the next objective stands, in the scene (roadmap #69) ─────────────
 *
 * The nudges (`nudge.ts`) need a place in the world to point at: the next
 * pack, the boss, the trainer. ONE lookup (`objectiveOf`), so that zones with
 * branches and several bosses only change it here: today it reads the sim's
 * groups — the nearest main-chain group still standing (a boss goal: the
 * finale's) — and never a side pack.
 *
 * `senseWorld` is called by the coach each step with the live scene; it fills
 * `nudgeWorld` (plain numbers, not reactive) for the layers and the pacing.
 */

export interface Objective { x: number; z: number; kind: 'dummy' | 'pack' | 'boss' | 'trainer'; npc?: string }

const TEACHERS = new Map<string, ClassId | undefined>()
for (const t of Object.values(TOWNS)) for (const n of t.npcs) if (n.role === 'trainer') TEACHERS.set(n.id, n.cls)

/** The trainer in this scene nearest the hero who can teach him something now. */
export const teacherNear = (sim: Sim, u: Unit): Unit | null => {
  let best: Unit | null = null
  let bd = 1e9
  for (const n of sim.units) {
    if (n.rank !== 'npc' || !n.npc || !TEACHERS.has(n.npc)) continue
    const cls = TEACHERS.get(n.npc)
    if (!cls || !canLearnFrom(cls)) continue
    const d = Math.hypot(n.x - u.x, n.z - u.z)
    if (d < bd) { bd = d; best = n }
  }
  return best
}

/** The next thing to walk to, for a goal (`coach/goal.ts` ids). */
export const objectiveOf = (sim: Sim, goal: string): Objective | null => {
  const u = sim.hero.unit
  if (goal === 'dummy') {
    const d = dummyBeat(sim) === 'on' ? dummyOf(sim) : null
    return d ? { x: d.x, z: d.z, kind: 'dummy' } : null
  }
  if (goal === 'trainer') {
    const t = teacherNear(sim, u)
    return t ? { x: t.x, z: t.z, kind: 'trainer', npc: t.npc } : null
  }
  if (goal === 'clear' || goal === 'boss') {
    // The main road, pack by pack (`sim/route.ts`: never into a branch).
    const o = nextObjective(sim, u)
    return o.kind === 'pack' || o.kind === 'boss' ? { x: o.x, z: o.z, kind: o.kind } : null
  }
  return null
}

/** Live numbers for the nudges. Screen points are surface px. */
export const nudgeWorld = {
  /** An objective in this scene, and where it is. */
  has: false,
  kind: 'pack' as Objective['kind'],
  /** The townsperson it is (a trainer), '' else. */
  npc: '',
  x: 0,
  z: 0,
  /** Metres from the hero. */
  dist: 0,
  /** Its point on the screen, and whether that is inside the view. */
  sx: 0,
  sy: 0,
  onScreen: false,
  /** The hero on the screen. */
  hx: 0,
  hy: 0,
  /** What the camera's peek leans toward: an unopened chest nearby the hero
   *  has not been up to, else the signpost of a side path still worth it. */
  chest: false,
  cx: 0,
  cz: 0,
  chestId: -1
}

const p = { x: 0, y: 0 }
/** Chests the hero has been within reach of, per scene. */
const seen = new WeakMap<Sim, Set<number>>()

export interface SenseHost {
  sim: Sim
  setup: { kind: 'zone' | 'town' | 'arena' }
  project(x: number, y: number, z: number, out: { x: number; y: number }): boolean
}

export const senseWorld = (host: SenseHost, goal: string): void => {
  const sim = host.sim
  const u = sim.hero.unit
  const o = goal ? objectiveOf(sim, goal) : null
  const w = nudgeWorld
  w.has = !!o
  if (o) {
    w.kind = o.kind
    w.npc = o.npc ?? ''
    w.x = o.x
    w.z = o.z
    w.dist = Math.hypot(o.x - u.x, o.z - u.z)
    host.project(o.x, 0.8, o.z, p)
    w.sx = p.x
    w.sy = p.y
    const vw = typeof innerWidth === 'number' ? innerWidth : 1
    const vh = typeof innerHeight === 'number' ? innerHeight : 1
    w.onScreen = p.x > vw * 0.06 && p.x < vw * 0.94 && p.y > vh * 0.12 && p.y < vh * 0.88
  }
  host.project(u.x, 0.5, u.z, p)
  w.hx = p.x
  w.hy = p.y
  // The peek: a closed chest within a short walk he has not been up to, else
  // the nearest side path's signpost (a branch worth the walk) close by.
  w.chest = false
  if (host.setup.kind !== 'zone') return
  const side = sim.branches?.length ? openBranches(sim, u)[0] : undefined
  let s = seen.get(sim)
  if (!s) { s = new Set(); seen.set(sim, s) }
  let bd = 14
  for (const c of sim.chests) {
    if (c.state !== 'closed' || c.role === 'finale') continue
    if (c.guard >= 0 && !sim.sideGroups[c.guard]?.cleared) continue
    const d = Math.hypot(c.x - u.x, c.z - u.z)
    if (d < 4.5) s.add(c.id)
    if (s.has(c.id) || d < 5 || d > bd) continue
    bd = d
    w.chest = true
    w.cx = c.x
    w.cz = c.z
    w.chestId = c.id
  }
  if (!w.chest && side && side.d > 5 && side.d < 16) {
    w.chest = true
    w.cx = side.x
    w.cz = side.z
    w.chestId = -1 - side.branch.id
  }
}
