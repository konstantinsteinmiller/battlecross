import { AFTER_XP_MUL } from '../data/progression'
import { PYLON } from '../data/invasion'
import { finaleGold } from '../data/loot'
import { prizeOf } from '../gamble'
import { PYLON_GLASS } from '../data/relics'
import { armRelicDrops } from './relics'
import { enemyDmg, enemyHp, plainStats } from './stats'
import type { Unit } from './types'
import { SIDE_GROUP, type GroupState, type Sim } from './world'
import type { ZonePlan } from './zoneGen'

/**
 * ─── An invaded visit, as the sim plays it (docs/gdd-afterplay.md §3) ────────
 *
 *   the XP     every kill pays `AFTER_XP_MUL` (§2.1: kills in invaded zones);
 *   pylons     a demon pylon in each section: a unit of the enemy team that
 *              never acts (a kind no enemy table knows, like the training
 *              dummy), drawn as a prop (`gfx/pylonProp.ts`). While one stands,
 *              every enemy within its reach hits 20 % harder. They are one
 *              side group: it decides nothing, and when the last pylon falls
 *              their chest pays out where it fell;
 *   scars      the rift's scars: a lasting field of the enemy team that slows
 *              whoever stands in it and burns shadow into them.
 *
 * Generated from the plan like everything else in a visit, so a saved game
 * regenerates the same pylons and scars; the pylons' group remembers (in the
 * snapshot) that their chest has been paid.
 */

/** A demon pylon's kind (no enemy table knows it: it never acts). */
export const PYLON_KIND = 'demonPylon'

export const isPylon = (u: Unit | null | undefined): boolean => !!u && u.kind === PYLON_KIND

/** Scars burn a little of a normal blow every half second. */
const SCAR_DMG = 0.35
const SCAR_EVERY = 0.5

/** Make this an invaded visit (before it is populated). */
export const armInvasion = (sim: Sim): void => {
  sim.invaded = true
  sim.xpMul = AFTER_XP_MUL
}

/** The pylons' side group, once spawned. */
const groupOf = (sim: Sim): GroupState | undefined => (sim.pylonGroup >= 0 ? sim.sideGroups[sim.pylonGroup - SIDE_GROUP] : undefined)

/** Stand the plan's pylons and open its scars (an invaded visit only). */
export const populateInvasion = (sim: Sim, plan: ZonePlan): void => {
  if (!sim.invaded) return
  // Its tables: the zone's Infernal twins, its boss's pair (afterplay phase 8).
  armRelicDrops(sim)
  const pylons = plan.pylons ?? []
  if (pylons.length) {
    const id = SIDE_GROUP + sim.sideGroups.length
    const group: GroupState = { id, x: pylons[0]!.x, z: pylons[0]!.z, members: [], awake: false, cleared: false, finale: false, boss: '', optional: true }
    sim.sideGroups.push(group)
    sim.pylonGroup = id
    for (const p of pylons) {
      const u = sim.addUnit({
        kind: PYLON_KIND, team: 1, rank: 'normal', level: sim.level, x: p.x, z: p.z, r: 0.55, h: 2.6,
        s: plainStats({ hp: Math.round(enemyHp(sim.level) * PYLON.hp * sim.difficulty), dmg: 0, speed: 0, armor: 0 }), group: id, facing: 0
      })
      u.infernal = true
      u.rooted = true
      group.members.push(u.id)
      sim.pylons.push(u.id)
    }
  }
  for (const d of plan.dressing ?? []) {
    if (d.kind !== 'scar') continue
    sim.fields.push({
      active: true, fx: 'scar', team: 1, srcId: 0, x: d.x, z: d.z, r: SCAR_R, t: 0, dur: 1e9, every: SCAR_EVERY, next: SCAR_EVERY,
      dmg: enemyDmg(sim.level) * SCAR_DMG, type: 'shadow', kind: 'web', v: 0, skill: '', color: '#7a2aff'
    })
  }
}

/** A scar's reach (m): what the decal draws (`levelProps.ts`). */
export const SCAR_R = 1.6

/** The damage factor a pylon's aura gives an enemy (1: none in reach). */
export const pylonAura = (sim: Sim, u: Unit): number => {
  if (u.team !== 1 || isPylon(u)) return 1
  const r2 = PYLON.r * PYLON.r
  for (const id of sim.pylons) {
    const p = sim.live(id)
    if (p && (p.x - u.x) ** 2 + (p.z - u.z) ** 2 <= r2) return 1 + PYLON.dmg
  }
  return 1
}

/** Pylons still standing. */
export const pylonsLeft = (sim: Sim): number => {
  let n = 0
  for (const id of sim.pylons) if (sim.live(id)) n++
  return n
}

/**
 * The last pylon fell: its chest pays out where it stood (once: the group's
 * `cleared` says so, and a saved game keeps it). Runs before anything else
 * clears side groups.
 */
export const stepInvasion = (sim: Sim): void => {
  const g = groupOf(sim)
  if (!g || g.cleared || pylonsLeft(sim) > 0) return
  g.cleared = true
  const h = sim.hero
  const last = sim.get(sim.pylons[sim.pylons.length - 1]!)
  const at = last ? { x: last.x, z: last.z } : { x: h.unit.x, z: h.unit.z }
  const gold = Math.round(finaleGold(sim.level) * PYLON.gold)
  h.gold += gold
  sim.emit({ t: 'loot', x: at.x, z: at.z, gold, item: '' })
  // A tier-5 piece not owned yet (§11's pylon chest).
  const prize = prizeOf(5, new Set([...sim.owned, ...h.items]), (sim.seed ^ 0x9e3779b1) >>> 0)
  if (prize) {
    h.items.push(prize.id)
    sim.emit({ t: 'loot', x: at.x, z: at.z, gold: 0, item: prize.id })
  }
  // And its Demonglass (§11).
  h.ores.demonglass = (h.ores.demonglass ?? 0) + PYLON_GLASS
  sim.emit({ t: 'fx', id: 'chest', x: at.x, z: at.z, unit: 0, color: '#ff4a3a' })
  sim.emit({ t: 'pylonsDown', x: at.x, z: at.z })
}
