import { ENEMY_BY_ID } from '../data/enemies'
import { skillsOf, type ClassId } from '../data/skills'
import { MAP, NODE_BY_ID, TOWNS, townNpcs, type NodeId, type TownId } from '../data/zones'
import { flagSet, isNodeOpen, learnBlock, profile } from '../state/profile'
import type { FeatureId } from './state'

/**
 * ─── The next goal (roadmap #2) ──────────────────────────────────────────────
 *
 * One short goal on screen from the first second — what to do next, never a
 * list: "Clear the Sunford Plains 1/3", "Talk to a trainer", "Spend your
 * points 3", "Leave for the Goblin Hollows", "Beat the Goblin King".
 *
 * A pure function of where the player is (`GoalCtx`, read off the flow and the
 * live zone) and the save. It reuses the game's own bookkeeping: the zone's
 * groups cleared, the map's unlock order, the trainers' requirements and the
 * quest decision waiting.
 *
 *   in a fight     the training dummy → the zone's groups → its boss → leave
 *   in a town      a trainer (until a skill is learned, and only where one
 *                  can be learned now) → points to spend → the next place
 *   on the map     the decision waiting → the next place
 *
 * A player who walks out on the trainer is not nagged for it: on the map the
 * goal is the next place, and the trainer comes back only in a town.
 */

export type GoalId =
  | 'dummy' | 'clear' | 'boss' | 'exit' | 'wave' | 'fight'
  | 'trainer' | 'learn' | 'points' | 'leave' | 'travel' | 'decide' | 'explore'

export interface Goal {
  id: GoalId
  /** A node id (`node.<id>.name`) for "Clear…", "Leave for…", "Travel to…". */
  place?: string
  /** An enemy kind (`enemy.<kind>`) for "Beat…". */
  foe?: string
  /** Progress: `n` of `of` (or a lone count, `of` 0). */
  n?: number
  of?: number
}

/** What the live zone says (null: not in one). */
export interface ZoneGoalState {
  kind: 'zone' | 'arena'
  node: string
  /** Groups beaten of the zone's main chain. */
  done: number
  total: number
  /** The finale's leader when it is a boss (an enemy kind), else ''. */
  boss: string
  /** A boss is up and fighting (its plate shows): it is the goal now. */
  bossAwake?: boolean
  /** A branch's boss is up and fighting (its plate shows): its kind. */
  sideBoss?: string
  ended: '' | 'victory' | 'defeat'
  /** The opening dummy still stands, and the pack still sleeps. */
  dummy: boolean
  /** A random encounter met on the map: no place to clear, just this fight. */
  encounter?: boolean
  wave: number
  waves: number
}

export interface GoalCtx {
  screen: string
  /** The scene's node ('' on the boot screen). */
  node: string
  modal: string
  /** A quest decision waits (`flow.quest`). */
  quest: string
  zone: ZoneGoalState | null
  /** He closed the hero sheet with points left this visit: he is keeping them. */
  pointsKept?: boolean
}

/** Skills the hero knew before any trainer taught him one. */
const START_SKILLS = 1

/** Has a trainer ever taught him anything? */
export const learnedFromTrainer = (): boolean => profile.hero.learned.length > START_SKILLS

/** Can this class's trainer teach him something right now (level, attributes, gold)? */
export const canLearnFrom = (cls: ClassId): boolean => skillsOf(cls).some(s => learnBlock(s.id) === '')

/** The trainers of a town (as the world's flags leave it) who can teach him now. */
export const teachersIn = (town: string): string[] => {
  if (!TOWNS[town as TownId]) return []
  return townNpcs(town as TownId, flagSet()).filter(n => n.role === 'trainer' && n.cls && canLearnFrom(n.cls)).map(n => n.id)
}

/** The next place to go: a town not yet walked into, else the first open
 *  zone not yet cleared, in the map's own order (the story's). */
export const nextNode = (): NodeId | null => {
  const cleared = new Set(profile.world.cleared)
  const open = MAP.filter(n => n.kind !== 'arena' && !cleared.has(n.id) && isNodeOpen(n.id))
  return (open.find(n => n.kind === 'town') ?? open[0])?.id ?? null
}

const travelGoal = (id: 'leave' | 'travel'): Goal => {
  const next = nextNode()
  return next ? { id, place: next } : { id: 'explore' }
}

export const nextGoal = (c: GoalCtx): Goal | null => {
  if (c.quest) return { id: 'decide' }
  if (c.screen === 'zone' && c.zone) {
    const z = c.zone
    if (z.ended === 'victory') return { id: 'exit' }
    if (z.ended) return null
    if (z.kind === 'arena') return { id: 'wave', n: Math.max(0, z.wave - 1), of: z.waves }
    if (z.dummy) return { id: 'dummy' }
    if (z.encounter) return { id: 'fight', n: z.done, of: z.total }
    // A branch's boss, met off the road: beating it is the goal while it fights.
    if (z.sideBoss) return { id: 'boss', foe: z.sideBoss }
    if (z.boss && (z.bossAwake || (z.total > 0 && z.done >= z.total - 1))) return { id: 'boss', foe: z.boss }
    return { id: 'clear', place: z.node, n: z.done, of: z.total }
  }
  if (c.screen === 'town') {
    if (!learnedFromTrainer() && teachersIn(c.node).length) return { id: c.modal === 'trainer' ? 'learn' : 'trainer' }
    if (profile.hero.points > 0 && !c.pointsKept) return { id: 'points', n: profile.hero.points, of: 0 }
    return travelGoal('leave')
  }
  if (c.screen === 'map') return travelGoal('travel')
  return null
}

/** The lesson a goal's pointer is (tapping the tracker brings it back). */
export const GOAL_LESSON: Partial<Record<GoalId, FeatureId | 'move'>> = {
  dummy: 'move', clear: 'move', boss: 'move',
  trainer: 'talk', learn: 'learn', points: 'attr', leave: 'exit', travel: 'travel'
}

/** Is the finale of this plan's zone a boss? Its kind, else ''. */
export const bossOf = (kinds: readonly string[] | undefined): string => {
  const k = kinds?.[0]
  return k && ENEMY_BY_ID[k]?.rank === 'boss' ? k : ''
}

/** A goal as one comparable string (a change pops the tracker). */
export const goalSig = (g: Goal | null): string => (g ? `${g.id}|${g.place ?? ''}|${g.foe ?? ''}|${g.n ?? ''}|${g.of ?? ''}` : '')

/** Is the node a town? */
export const isTown = (id: string): boolean => NODE_BY_ID[id as NodeId]?.kind === 'town'
