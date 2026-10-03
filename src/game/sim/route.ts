import type { Unit } from './types'
import { SIDE_GROUP, type BranchState, type Sim } from './world'

/**
 * ─── The zone as a graph, for whoever guides the player (roadmap #70) ────────
 *
 * A zone is a main road from the start to the finale with ways off it: loops
 * that rejoin the road further on, and dead ends where a branch boss guards a
 * gold chest. The road is the short way and the only one that counts: the
 * HUD's "n/m" is the main chain's packs (`sim.groups`), every one of them on
 * the shortest route to the finale. Branches are optional and counted apart,
 * as the zone's mastery (bosses beaten, chests opened).
 */

export type ObjectiveKind = 'pack' | 'boss' | 'chest' | 'exit' | 'none'

export interface Objective {
  kind: ObjectiveKind
  x: number
  z: number
  /** The pack to clear (`pack`, `boss`). */
  group?: number
  /** The chest to open (`chest`). */
  chest?: number
}

const NONE: Objective = { kind: 'none', x: 0, z: 0 }

/**
 * The next step on the main road: the first pack still standing (the finale's
 * boss last), then, once the zone is won, its chest, then the way out (Leave).
 * Branches never are the objective: they are offers (`openBranches`).
 */
export const nextObjective = (sim: Sim, hero: Unit = sim.hero.unit): Objective => {
  if (sim.mode !== 'zone' || sim.ended === 'defeat') return NONE
  if (sim.ended === 'victory') {
    const c = sim.chests.find(x => x.role === 'finale')
    if (c && c.state === 'closed') return { kind: 'chest', x: c.x, z: c.z, chest: c.id }
    return sim.leaving ? NONE : { kind: 'exit', x: hero.x, z: hero.z }
  }
  const g = sim.groups.find(x => !x.cleared)
  if (!g) return NONE
  return { kind: g.finale && g.boss ? 'boss' : 'pack', x: g.x, z: g.z, group: g.id }
}

export interface BranchOffer {
  branch: BranchState
  /** Its signpost (or, without one, its clearing). */
  x: number
  z: number
  /** Metres from the hero to the signpost. */
  d: number
  /** Its pack still stands / its chest is still shut. */
  guarded: boolean
  chestShut: boolean
}

/** Is a branch still worth the walk: its pack standing or its chest shut? */
export const branchOpen = (sim: Sim, b: BranchState): { guarded: boolean; chestShut: boolean } => {
  const g = sim.sideGroups[b.group - SIDE_GROUP]
  const c = b.chest >= 0 ? sim.chests.find(x => x.id === b.chest) : undefined
  return { guarded: !!g && !g.cleared, chestShut: !!c && c.state !== 'open' }
}

/** The branches still worth the walk, nearest signpost first. */
export const openBranches = (sim: Sim, hero: Unit = sim.hero.unit): BranchOffer[] => {
  const out: BranchOffer[] = []
  for (const b of sim.branches) {
    const st = branchOpen(sim, b)
    if (!st.guarded && !st.chestShut) continue
    const x = b.fork?.x ?? b.x
    const z = b.fork?.z ?? b.z
    out.push({ branch: b, x, z, d: Math.hypot(x - hero.x, z - hero.z), ...st })
  }
  return out.sort((p, q) => p.d - q.d)
}

export interface Mastery {
  /** Bosses beaten (the finale's leader and every branch boss) of those the visit held. */
  bosses: number
  bossesTotal: number
  chests: number
  chestsTotal: number
}

/** How much of the zone this visit has mastered (the result screen, the save). */
export const zoneMastery = (sim: Sim): Mastery => {
  const fin = sim.groups.find(g => g.finale)
  let bosses = fin?.cleared ? 1 : 0
  let bossesTotal = fin ? 1 : 0
  for (const g of sim.sideGroups) {
    if (!g.boss) continue
    bossesTotal++
    if (g.cleared) bosses++
  }
  let chests = 0
  for (const c of sim.chests) if (c.state === 'open') chests++
  return { bosses, bossesTotal, chests, chestsTotal: sim.chests.length }
}
