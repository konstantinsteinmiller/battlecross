import { mulberry32 } from './rng'
import { knockback } from './combat'
import { openChest } from './interact'
import { spawnEnemy } from './spawn'
import type { Sim, ChestState } from './world'

/**
 * ─── The mimic (roadmap #225) ────────────────────────────────────────────────
 *
 * A chest that is not one. Each visit rolls how many of a zone's chests are mimics: the Goblin Hollows always one, every other
 * zone one in three quarters of visits and two in a tenth (the rest none). The FIRST ordinary chest the hero opens is the first
 * mimic (the second one he opens, the second): the lid lifts, and the chest comes alive as a champion that leaps and bites. What
 * the chest held is paid when the mimic falls, from where it stood.
 *
 * The roll rides on a stream of its own (the seed's), so no pack or chest of a seed changes.
 */

const SALT = 0x6d1f3a57
export const MIMIC_P1 = 0.75
export const MIMIC_P2 = 0.1
/** Chests that stay what they are: a cage, the finale's, the tutorial's, a one-time prize. */
const NEVER: ReadonlySet<string> = new Set(['cage', 'finale', 'tutorial', 'branch', 'secret', 'treasure'])

export interface MimicState { chest: number; unit: number; paid: boolean }

/** How many mimics a visit holds, by the roll `u` in [0, 1). */
export const mimicCount = (zone: string, u: number): number => {
  if (zone === 'hollows') return 1
  if (u < MIMIC_P2) return 2
  if (u < MIMIC_P2 + MIMIC_P1) return 1
  return 0
}

/** Roll the visit's mimics (once the zone is populated). */
export const rollMimics = (sim: Sim, zone: string): void => {
  sim.mimics = []
  // The test suite's chests are plain ones (`tests/setup.mimic.ts`).
  if ((globalThis as { __NO_MIMIC__?: boolean }).__NO_MIMIC__) { sim.mimicLeft = 0; return }
  const eligible = sim.chests.filter(c => mimicable(c)).length
  sim.mimicLeft = Math.min(eligible, mimicCount(zone, mulberry32((sim.seed ^ SALT) >>> 0)()))
}

export const mimicable = (c: ChestState): boolean => !NEVER.has(c.role) && !c.special

/**
 * The lid has lifted on `c`: if a mimic is owed, it springs out instead of the loot. Returns true when it did (the caller then
 * pays nothing).
 */
export const maybeMimic = (sim: Sim, c: ChestState): boolean => {
  if (sim.mimicLeft <= 0 || !mimicable(c)) return false
  const hero = sim.hero.unit
  const u = spawnEnemy(sim, 'mimic', c.x, c.z, -1)
  if (!u) return false
  sim.mimicLeft--
  u.awake = true
  u.champion = true
  u.targetId = hero.id
  // A beat to throw its lid open and show its teeth before the first lunge.
  u.aiT = 0.7
  u.facing = Math.atan2(hero.x - u.x, hero.z - u.z)
  sim.mimics.push({ chest: c.id, unit: u.id, paid: false })
  c.state = 'opening'
  // It springs at him: he is thrown back a step.
  knockback(hero, c.x, c.z, 5)
  sim.emit({ t: 'mimic', id: 'wake', chest: c.id, unit: u.id, x: c.x, z: c.z })
  return true
}

/** Every step: a fallen mimic pays out what the chest held. */
export const stepMimics = (sim: Sim): void => {
  for (const m of sim.mimics) {
    if (m.paid) continue
    const u = sim.get(m.unit)
    if (u && u.alive) continue
    m.paid = true
    const c = sim.chests[m.chest]
    if (!c) continue
    sim.emit({ t: 'mimic', id: 'fall', chest: c.id, unit: m.unit, x: u?.x ?? c.x, z: u?.z ?? c.z })
    openChest(sim, c)
  }
}
