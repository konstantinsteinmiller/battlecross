import { MENTOR_NPC } from '../data/mentor'
import { ENEMY_BY_ID } from '../data/enemies'
import { CELL, isSolidAt, nearestOpen } from '../sim/grid'
import { face, setGoal, walk } from '../sim/actors'
import { mulberry32 } from '../sim/rng'
import { plainStats } from '../sim/stats'
import type { Sim } from '../sim/world'
import type { Unit } from '../sim/types'

/**
 * ─── The road teacher's entrance (roadmap #136) ──────────────────────────────
 *
 * In the opening fight, a moment after the first pack (the two goblins) is
 * down, a stranger walks in from the top edge of the screen to the place the
 * goblins fell and stays there: Nettle Quickhand, who teaches the Shadow's
 * first skill, the teleport. The hero may talk to her or walk on; nothing
 * waits on her. This is a scene beat, like the straw dummy (`dummy.ts`): the
 * sim only stands her up and walks her; her words, her window and her gift
 * are the dialogue's and the trainer screen's.
 *
 * Deterministic and dice-free: a fixed delay, a fixed walk, no `sim.rng`, so
 * a seed's fights fall exactly as they did before she existed. She is a unit
 * of the `npc` rank (never a target, never hurt), found again by her NPC id,
 * so a saved visit that restored her needs no state of its own.
 */

/** Seconds after the first pack falls before she is seen. */
export const MENTOR_DELAY = 1.1
/** How far above her place (toward the top of the screen) she starts, at most. */
export const MENTOR_ENTRY = 15
/** …and at least this far, or she steps in on the spot instead. */
const ENTRY_MIN = 7
/** Her walking speed, m/s. */
const SPEED = 3.6
/** The walk is given up (she is simply there) after this long. */
const WALK_MAX = 14
/** A hero this far from her has walked on: the cue lets go of him. */
export const MENTOR_LEFT = 26
/** The shadow-violet of her class (the puffs). */
const COLOR = '#9c7bff'
/** A unit rolls two dice as it is born: hers come from a stream of her own. */
const SALT = 0x5ad0e1f7

export type MentorBeat = 'wait' | 'walk' | 'stand'

interface MentorState {
  beat: MentorBeat
  /** Seconds in the beat (in `wait`: since the pack fell). */
  t: number
  /** Her place. */
  x: number
  z: number
  /** The hero has walked on (the next pack woke, or he is far away). */
  left: boolean
  /** Seconds to the next try at the way, when she is held up. */
  retry: number
}

const states = new WeakMap<Sim, MentorState>()

/** Arm the beat for this visit (the tutorial visit only). */
export const armMentor = (sim: Sim): void => {
  states.set(sim, { beat: 'wait', t: 0, x: 0, z: 0, left: false, retry: 0 })
}

/** Where the beat is; null when it was never armed. */
export const mentorBeat = (sim: Sim): MentorBeat | null => states.get(sim)?.beat ?? null

/** She, once she is in the scene. */
export const mentorUnit = (sim: Sim): Unit | null => {
  for (const u of sim.units) if (u.alive && u.npc === MENTOR_NPC) return u
  return null
}

/** She stands in the scene and the hero has not walked on: the goal is her. */
export const mentorCue = (sim: Sim): boolean => {
  const s = states.get(sim)
  return !!s && s.beat === 'stand' && !s.left && !sim.ended
}

/**
 * Where she waits: the place the first pack stood (where its goblins fell),
 * a little further back when the hero happens to stand on it.
 */
const placeOf = (sim: Sim): { x: number; z: number } | null => {
  const g = sim.groups[0]
  if (!g) return null
  const hero = sim.hero.unit
  let x = g.x
  let z = g.z
  if (Math.hypot(hero.x - x, hero.z - z) < 1.8) z -= 2
  if (isSolidAt(sim.grid, x, z)) {
    const out: [number, number] = [x, z]
    if (!nearestOpen(sim.grid, x, z, out, 5)) return null
    x = out[0]
    z = out[1]
  }
  return { x, z }
}

/** Tilts from straight up the screen, tried in this order. */
const TILTS = [0, 0.3, -0.3, 0.6, -0.6, 0.9, -0.9]

/**
 * The far end of her walk: up the screen from her place as far as the ground
 * is open, leaning off straight up only when a wall stands in the way.
 */
const entryOf = (sim: Sim, x: number, z: number): { x: number; z: number } | null => {
  let best: { x: number; z: number } | null = null
  let bestD = 0
  for (const tilt of TILTS) {
    const dx = Math.sin(tilt)
    const dz = -Math.cos(tilt)
    let reach = 0
    for (let d = CELL * 0.5; d <= MENTOR_ENTRY; d += CELL * 0.5) {
      if (isSolidAt(sim.grid, x + dx * d, z + dz * d)) break
      reach = d
    }
    if (reach > bestD + 0.01) { bestD = reach; best = { x: x + dx * reach, z: z + dz * reach } }
    // Straight up with room to spare: no need to look further.
    if (bestD >= MENTOR_ENTRY - CELL) break
  }
  return bestD >= ENTRY_MIN ? best : null
}

const puff = (sim: Sim, x: number, z: number): void => {
  sim.emit({ t: 'fx', id: 'blink', x, z, unit: 0, color: COLOR })
}

/** Stand her up at `at`, facing the way she will walk. */
const arrive = (sim: Sim, at: { x: number; z: number }): Unit => {
  let u!: Unit
  sim.withStream(mulberry32((sim.seed ^ SALT) >>> 0), () => {
    u = sim.addUnit({
      kind: 'sfShadow', team: 0, rank: 'npc', level: 1, x: at.x, z: at.z, r: 0.5, h: 1.45,
      s: plainStats({ hp: 1000, dmg: 0, speed: SPEED }), facing: 0, npc: MENTOR_NPC
    })
  })
  u.x = u.px = at.x
  u.z = u.pz = at.z
  return u
}

/** Every step. Returns the beat's new state when it changes this step, else null. */
export const stepMentor = (sim: Sim, dt: number): MentorBeat | null => {
  const s = states.get(sim)
  // Once the opening is won and its camp waits (#156), the camp walks her to its fire (`sim/camp.ts`).
  if (!s || sim.ended === 'defeat' || (sim.ended === 'victory' && sim.camp)) return null
  const hero = sim.hero.unit
  let u = mentorUnit(sim)

  if (s.beat === 'wait') {
    // A saved visit gave her back: pick the beat up where she stands.
    if (u) {
      s.x = u.hasGoal ? u.goalX : u.x
      s.z = u.hasGoal ? u.goalZ : u.z
      s.beat = Math.hypot(u.x - s.x, u.z - s.z) > 0.6 ? 'walk' : 'stand'
      s.t = 0
      if (s.beat === 'walk') setGoal(sim, u, s.x, s.z)
      return s.beat
    }
    if (!sim.groups[0]?.cleared || sim.ended || !hero.alive) return null
    s.t += dt
    if (s.t < MENTOR_DELAY) return null
    const spot = placeOf(sim)
    if (!spot) return null
    s.x = spot.x
    s.z = spot.z
    const entry = entryOf(sim, spot.x, spot.z)
    u = arrive(sim, entry ?? spot)
    puff(sim, u.x, u.z)
    s.t = 0
    if (!entry) {
      // No room to walk in: she steps in where she is to stand.
      s.beat = 'stand'
      return s.beat
    }
    setGoal(sim, u, s.x, s.z)
    s.beat = 'walk'
    return s.beat
  }

  if (!u) return null
  s.t += dt
  // The hero walked on: the next pack woke, or he is a long way off.
  if (!s.left && (sim.groups[1]?.awake || Math.hypot(hero.x - u.x, hero.z - u.z) > MENTOR_LEFT)) s.left = true

  if (s.beat === 'walk') {
    u.anim = 'walk'
    const near = Math.hypot(s.x - u.x, s.z - u.z) < 0.5
    // This runs after the sim step, which measured velocity before she moved:
    // give the rig the stride she just took, or it sees her glide in idle.
    const x0 = u.x
    const z0 = u.z
    const going = !near && walk(sim, u, dt)
    if (dt > 0) {
      u.px = x0
      u.pz = z0
      u.vx = (u.x - x0) / dt
      u.vz = (u.z - z0) / dt
    }
    // Held up (a body in the way, the hero on her place): try the way again,
    // and after too long she is simply there, in a puff, as a teleporter would be.
    s.retry -= dt
    if (!going && !near && s.retry <= 0) { s.retry = 0.8; setGoal(sim, u, s.x, s.z) }
    if (near || s.t > WALK_MAX) {
      if (!near) { u.x = u.px = s.x; u.z = u.pz = s.z }
      u.hasGoal = false
      u.path.length = 0
      u.anim = 'idle'
      puff(sim, u.x, u.z)
      s.beat = 'stand'
      s.t = 0
      return s.beat
    }
    return null
  }

  // Standing: she turns to the hero and waits.
  u.anim = 'idle'
  u.vx = u.vz = 0
  face(u, hero.x, hero.z)
  return null
}

/**
 * The skill's price (D-table, `OPENING.skillHp`): once the hero knows the free
 * teleport, the fight's foes carry `mul` times the health, so the opening stays
 * as close as it was without it. Living foes are scaled in proportion (a foe
 * half-dead stays half-dead); foes born later come with it (`spawnEnemy`).
 * Applied once: a second call is a no-op. Returns whether it applied.
 */
export const boostOpeningFoes = (sim: Sim, mul: number): boolean => {
  if (sim.enemyHpMul !== 1 || mul === 1) return false
  sim.enemyHpMul = mul
  for (const e of sim.units) {
    // Only the bestiary's own (not the straw dummy, not her).
    if (!e.alive || e.team !== 1 || e.npc || !ENEMY_BY_ID[e.kind]) continue
    e.s.maxHp *= mul
    e.hp *= mul
  }
  return true
}

/**
 * The hero's loadout reached the scene: a skill learned on the way (hers) fills
 * its slot in the live hero, ready at once. Only empty slots are filled, and a
 * slot that already holds something is left alone.
 */
export const syncHeroSkills = (sim: Sim, ids: readonly string[]): boolean => {
  const h = sim.hero
  let changed = false
  for (let i = 0; i < h.skills.length; i++) {
    const id = ids[i] ?? ''
    if (id && !h.skills[i]) {
      h.skills[i] = id
      h.cd[i] = 0
      h.cdMax[i] = 1
      changed = true
    }
  }
  return changed
}
