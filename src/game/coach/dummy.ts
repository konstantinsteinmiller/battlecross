import { plainStats } from '../sim/stats'
import type { Sim } from '../sim/world'
import type { Unit } from '../sim/types'
import type { ZonePlan } from '../sim/zoneGen'

/**
 * ─── The straw training dummy (roadmap #52) ──────────────────────────────────
 *
 * The very first visit of a new save opens on a calm beat before the goblins
 * wake: a dummy on a post by the road, to walk up to, pick and hit. It is a
 * unit of the enemy team (so every rule of picking, swinging and damage
 * numbers applies unchanged) of a kind no enemy table knows — so it never
 * acts, never pays the kill reward, and draws no rig. Its look is a level prop
 * (`gfx/dummyProp.ts`); its little reward (a handful of coins, as it bursts
 * into straw) is paid here.
 *
 * It never wakes: an asleep enemy is not one the hero auto-engages, so once
 * the player walks off toward the pack he is never pulled back to the post.
 * Nobody has to finish it: walking past it (the first pack waking) ends the
 * beat as surely as knocking it apart.
 */

export const DUMMY_KIND = 'trainingDummy'

export const isDummy = (u: Unit | null | undefined): boolean => !!u && u.kind === DUMMY_KIND

/** How the beat ended (or that it is still on). */
export type DummyBeat = 'on' | 'fell' | 'passed'

interface DummyState {
  id: number
  x: number
  z: number
  /** The coins have been paid. */
  paid: boolean
  beat: DummyBeat
}

const states = new WeakMap<Sim, DummyState>()

/** The hits a new hero's plain swing takes to knock it apart. */
export const DUMMY_HITS = 3.4

/** Put the dummy up where the plan stands it (the tutorial visit only). */
export const spawnDummy = (sim: Sim, plan: ZonePlan): Unit | null => {
  const at = plan.dummy
  if (!at) return null
  const hero = sim.hero.unit
  const hp = Math.max(24, Math.round(hero.s.baseDmg * DUMMY_HITS))
  const u = sim.addUnit({
    kind: DUMMY_KIND, team: 1, rank: 'weak', level: 1, x: at.x, z: at.z, r: 0.5, h: 1.7,
    // It faces the hero's way in, so the painted target is seen.
    s: plainStats({ hp, dmg: 0, speed: 0 }), facing: Math.atan2(plan.start.x - at.x, plan.start.z - at.z)
  })
  states.set(sim, { id: u.id, x: u.x, z: u.z, paid: false, beat: 'on' })
  return u
}

/** The dummy of this visit, while it stands. */
export const dummyOf = (sim: Sim): Unit | null => {
  const s = states.get(sim)
  return s ? sim.live(s.id) ?? null : null
}

/** Where the beat is. 'on' with no dummy at all is never returned. */
export const dummyBeat = (sim: Sim): DummyBeat | null => states.get(sim)?.beat ?? null

/** The coins it holds: a token, not a farm. */
export const dummyPurse = (level: number): number => 6 + level * 2

/**
 * Each step: it stays planted on its post (knock-backs do not slide it), stays
 * asleep, and pays out once when it falls. Returns the beat's new state when
 * it changes this step, else null.
 */
export const stepDummy = (sim: Sim): DummyBeat | null => {
  const s = states.get(sim)
  if (!s || s.beat !== 'on') return null
  const u = sim.get(s.id)
  if (u && u.alive) {
    u.x = u.px = s.x
    u.z = u.pz = s.z
    u.vx = u.vz = 0
    u.kx = u.kz = 0
    u.awake = false
    // Walked past it: the first pack is up, the lesson is moot.
    if (sim.groups[0]?.awake) { s.beat = 'passed'; return s.beat }
    return null
  }
  if (!s.paid) {
    s.paid = true
    const gold = dummyPurse(sim.level)
    sim.hero.gold += gold
    sim.emit({ t: 'loot', x: s.x, z: s.z, gold, item: '' })
  }
  s.beat = 'fell'
  return s.beat
}
