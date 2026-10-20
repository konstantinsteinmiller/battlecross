import { cageOf } from '../data/cages'
import { mulberry32 } from './rng'
import { centerOf } from './grid'
import { pickSpots, walkableFrom, type SpotPlan } from './herbs'
import { K_BLOCK, K_GROUND, type ChestPlan } from './zoneFeatures'
import { face, setGoal, stop, walk } from './actors'
import { plainStats } from './stats'
import type { Unit } from './types'
import type { ChestState, Sim } from './world'
import { campWayOut } from './camp'

/**
 * ─── A cage and its key (roadmap #100, D125) ────────────────────────────────
 *
 * Laid last, on a stream of its own: the cage on open ground well along the
 * way (all eight neighbours open, so it stands free and is seen), the hero's
 * place to open it on the camera's side; the key somewhere else, at least
 * fourteen metres off. The cage is a chest (role `cage`) that a missing key
 * locks; the key is picked up by walking over it.
 */

const CAGE_SALT = 0x1f83d9ab

export interface CageKeyState {
  x: number
  z: number
  taken: boolean
}

/** Where the cage stands and where its key lies; null when the place has no room. */
export const placeCage = (
  p: SpotPlan & { seed: number },
  avoid: ReadonlyArray<{ x: number; z: number }>
): { chest: Omit<ChestPlan, 'id'>; key: { x: number; z: number } } | null => {
  const rng = mulberry32((p.seed ^ CAGE_SALT) >>> 0)
  const reach = walkableFrom(p.w, p.h, p.solid, p.sealed, p.start)
  const cand: number[] = []
  for (let j = 2; j < p.h - 3; j++) {
    for (let i = 2; i < p.w - 2; i++) {
      const k = j * p.w + i
      if (!reach[k] || p.kind[k] !== K_GROUND || p.trail[k]) continue
      let open = 0
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const nk = (j + dj) * p.w + i + di
        if (!p.solid[nk] && p.kind[nk] === K_GROUND) open++
      }
      if (open < 9) continue
      // The stand, a cell nearer the camera: open ground, off the road.
      const s = (j + 1) * p.w + i
      if (p.trail[s]) continue
      const x = centerOf(i)
      const z = centerOf(j)
      if (Math.hypot(x - p.start.x, z - p.start.z) < 24) continue
      if (p.chests.some(c => Math.hypot(c.x - x, c.z - z) < 6)) continue
      if (avoid.some(c => Math.hypot(c.x - x, c.z - z) < 4)) continue
      cand.push(k)
    }
  }
  if (!cand.length) return null
  const k = cand[Math.floor(rng() * cand.length)]!
  const i = k % p.w
  const j = (k - i) / p.w
  const x = centerOf(i)
  const z = centerOf(j)
  const keys = pickSpots(p, rng, 6, 4, [...avoid, { x, z }]).filter(s => Math.hypot(s.x - x, s.z - z) >= 14 && Math.hypot(s.x - p.start.x, s.z - p.start.z) >= 10)
  const key = keys[0]
  if (!key) return null
  p.kind[k] = K_BLOCK
  return { chest: { x, z, tier: 'iron', role: 'cage', sx: x, sz: centerOf(j + 1), door: -1, guard: -1 }, key }
}

/**
 * ─── The captives ────────────────────────────────────────────────────────────
 *
 * Whoever is in the cage is a person, the same one met later in town (their
 * own look, their own voice), standing behind the bars. The door swings
 * open: they step out to the side of it, turn to the hero, and the first of
 * them says who they are and where to find them (a voiced line over their
 * head, `dlg.bark.<npc>.freed.1`). Then they set off home, back the way the
 * hero came, and are gone once out of sight.
 */

export type CaptivePhase = 'caged' | 'out' | 'talk' | 'leave' | 'stay'

export interface CaptiveState {
  unit: number
  /** The one who speaks. */
  lead: boolean
  phase: CaptivePhase
  /** Seconds in the phase. */
  t: number
  /** Out of the cage: the points still to walk through. */
  path: Array<[number, number]>
  /** Home: the way back to town (the place's start). */
  hx: number
  hz: number
  /** The first visit's camp (#156, `camp.ts`): they stay, walking to their
   *  place (`hx`, `hz`) instead of home, and answer to their town id there. */
  stay?: boolean
  npc?: string
  /** The lead's own line (default: the cage's `captiveLine`). */
  line?: string
}

/** Stepping out of the cage, m/s. */
const STEP_OUT = 1.6
/** How long they stand and talk before setting off. */
export const CAPTIVE_TALK = 5.5
/** Gone once this far from the hero (well out of the picture). */
export const CAPTIVE_GONE = 19
/** And at the latest after this long on the road. */
const CAPTIVE_ROAD = 40

/** A freed captive's line. */
export const captiveLine = (npc: string): string => `dlg.bark.${npc}.freed.1`

/** The key lying in the place (null: no cage here), and the people in the cage. */
export const populateCage = (sim: Sim, key: { x: number; z: number } | undefined, home?: { x: number; z: number }): void => {
  sim.cageKey = key ? { x: key.x, z: key.z, taken: false } : null
  sim.captives = []
  const def = cageOf(sim.zone)
  const cage = sim.chests.find(c => c.role === 'cage')
  if (!def || !cage || cage.state === 'open') return
  for (let q = 0; q < def.count; q++) {
    const x = cage.x + (def.count === 1 ? 0 : (q - (def.count - 1) / 2) * 0.5)
    const z = cage.z - 0.05
    const u = sim.addUnit({
      kind: def.look, team: 0, rank: 'npc', level: 1, x, z, r: 0.3, h: 1.45,
      s: plainStats({ hp: 1000, dmg: 0, speed: 3.2 }), facing: 0
    })
    // Behind the bars, facing out (the cell is a block: put it there exactly).
    u.x = u.px = x
    u.z = u.pz = z
    sim.captives.push({ unit: u.id, lead: q === 0, phase: 'caged', t: 0, path: [], hx: home?.x ?? cage.x, hz: home?.z ?? cage.z })
  }
}

/** The cage is open: out they come, through the door and to either side. */
export const freeCaptives = (sim: Sim, c: ChestState): void => {
  sim.captives.forEach((p, q) => {
    if (p.phase !== 'caged') return
    const side = q === 0 ? 1 : -1
    const u = sim.get(p.unit)
    p.phase = 'out'
    p.t = 0
    p.path = p.stay ? campWayOut(u, c) : [[u?.x ?? c.x, c.z + 0.8], [c.x + side * 1.35, c.z + 1.05]]
    // Out of the cage, the camp's teachers answer to their town ids (#156).
    if (u && p.npc) u.npc = p.npc
  })
}

const dismiss = (sim: Sim, p: CaptiveState, u: Unit | undefined): void => {
  if (u) sim.dismiss(u)
  sim.captives.splice(sim.captives.indexOf(p), 1)
}

/** Every step: out of the cage, a word, and off home. */
export const stepCaptives = (sim: Sim, dt: number): void => {
  const hero = sim.hero?.unit
  if (!hero) return
  for (const p of sim.captives.slice()) {
    const u = sim.get(p.unit)
    if (!u) { dismiss(sim, p, u); continue }
    p.t += dt
    if (p.phase === 'caged') { u.anim = 'idle'; continue }
    if (p.phase === 'out') {
      const at = p.path[0]
      if (!at) {
        p.phase = 'talk'
        p.t = 0
        u.anim = 'idle'
        if (p.lead) {
          const def = cageOf(sim.zone)
          const key = p.line ?? (def ? captiveLine(def.npc) : '')
          if (key) sim.emit({ t: 'bark', unit: u.id, key })
        }
        continue
      }
      const dx = at[0] - u.x
      const dz = at[1] - u.z
      const d = Math.hypot(dx, dz)
      const s = STEP_OUT * dt
      // Through the bars' door: no walls to walk round, a straight step.
      if (d <= s) { u.x = at[0]; u.z = at[1]; p.path.shift() } else { u.x += (dx / d) * s; u.z += (dz / d) * s }
      face(u, at[0], at[1])
      u.anim = 'walk'
      continue
    }
    if (p.phase === 'talk') {
      face(u, hero.x, hero.z)
      u.anim = 'idle'
      if (p.t >= CAPTIVE_TALK) {
        p.phase = p.stay ? 'stay' : 'leave'
        p.t = 0
        setGoal(sim, u, p.hx, p.hz)
      }
      continue
    }
    if (p.phase === 'stay') {
      // The camp (#156): to their place by the fire, and there they keep.
      if (walk(sim, u, dt)) { u.anim = 'walk'; continue }
      stop(u)
      face(u, hero.x, hero.z)
      u.anim = 'idle'
      continue
    }
    // Off home.
    const far = Math.hypot(u.x - hero.x, u.z - hero.z)
    if (far > CAPTIVE_GONE || p.t > CAPTIVE_ROAD) { dismiss(sim, p, u); continue }
    if (!walk(sim, u, dt)) {
      // Home already (the hero stands by it): wait there, looking at him.
      stop(u)
      face(u, hero.x, hero.z)
      u.anim = 'idle'
    } else u.anim = 'walk'
  }
}
