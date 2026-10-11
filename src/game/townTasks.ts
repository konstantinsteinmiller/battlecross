import { ZONES, type TownId } from './data/zones'
import type { ZoneId } from './data/items'
import { ENEMY_BY_ID } from './data/enemies'
import { plantsOf, type PlantId } from './data/plants'
import { hashSeed, mulberry32, pick, randInt } from './sim/rng'

/**
 * ─── The town boards' tasks (roadmap #85, D105) ──────────────────────────────
 *
 * Each town's notice board posts three tasks a day for whoever will take
 * them: "Defeat 10 Goblins in the Goblin Hollows", "Gather 6 Sunpetals", and
 * on the road between Sunford and Oakhaven, "Guard the caravan". They need no
 * taking: a defeat task counts the visits as they end, a gathering task looks
 * in the herb pouch, the caravan is the escort itself (`flow.ts`). Each is
 * handed in at its own town's board for gold and a fifth of a level's
 * experience.
 */

export type TaskKind = 'slay' | 'gather' | 'escort'

export interface TownTask {
  town: TownId
  kind: TaskKind
  /** Where to fight (slay); '' otherwise. */
  zone: ZoneId | ''
  enemy: string
  plant: PlantId | ''
  n: number
  /** Counted so far (slay, escort); a gathering task reads the pouch. */
  have: number
  done: boolean
}

export const TASKS_PER_TOWN = 3
/** The zones round each town: its board's hunts are set there first. */
export const TOWN_REGION: Readonly<Record<TownId, readonly ZoneId[]>> = {
  sunford: ['plains', 'hollows', 'woods'],
  oakhaven: ['outskirts', 'woods', 'crags'],
  ironhold: ['mines', 'crags', 'tundra'],
  silverbridge: ['woods', 'crags', 'mines']
}
/** What the hero "talks to" at the notice board, and from how near he reads it. */
export const BOARD = '@board'
export const BOARD_REACH = 2.8
/** The towns on the caravan's road. */
export const CARAVAN_TOWNS: readonly TownId[] = ['sunford', 'oakhaven']
/** Gold a task pays at the hero's level, and the share of a level's XP. */
export const taskGold = (level: number): number => 50 + level * 15
export const TASK_XP = 0.2
/** The caravan pays more: it is a whole journey. */
export const ESCORT_PAY = 2

/**
 * A town's tasks for a day. `zones`: the zones the hero can reach, hardest
 * last; `caravan`: the road to Oakhaven is open (its outskirts won).
 */
export const postTasks = (town: TownId, day: string, zones: readonly ZoneId[], caravan: boolean): TownTask[] => {
  const rng = mulberry32(hashSeed(`task:${day}:${town}`))
  // Hunts close to home: the reachable zones of the town's own region; a
  // hero who has gone further than that still finds work back there.
  const home = (TOWN_REGION[town] ?? []).filter(z => zones.includes(z))
  const recent = home.length ? home : zones.slice(-3)
  const out: TownTask[] = []
  const slay = (): TownTask | null => {
    if (!recent.length) return null
    const zone = pick(rng, recent)
    const kinds = ZONES[zone].kinds.map(k => k.kind).filter(k => ENEMY_BY_ID[k]?.rank === 'normal')
    if (!kinds.length) return null
    return { town, kind: 'slay', zone, enemy: pick(rng, kinds), plant: '', n: randInt(rng, 8, 12), have: 0, done: false }
  }
  const gather = (): TownTask | null => {
    // What grows where the hero can go; the common herbs more often.
    const grows = new Map<PlantId, number>()
    for (const z of zones.length ? zones : ['plains' as ZoneId]) for (const p of plantsOf(z)) grows.set(p.id, p.weight)
    const list = [...grows.entries()]
    if (!list.length) return null
    let r = rng() * list.reduce((s, [, w]) => s + w, 0)
    let plant = list[0]![0]
    for (const [id, w] of list) { r -= w; if (r <= 0) { plant = id; break } }
    return { town, kind: 'gather', zone: '', enemy: '', plant, n: randInt(rng, 3, 6), have: 0, done: false }
  }
  const a = slay()
  if (a) out.push(a)
  const b = gather()
  if (b) out.push(b)
  if (caravan && CARAVAN_TOWNS.includes(town)) out.push({ town, kind: 'escort', zone: '', enemy: '', plant: '', n: 1, have: 0, done: false })
  // Fill up to three with more of the same kinds, never two alike.
  for (let tries = 0; out.length < TASKS_PER_TOWN && tries < 8; tries++) {
    const t = rng() < 0.5 ? slay() : gather()
    if (t && !out.some(o => o.kind === t.kind && o.enemy === t.enemy && o.plant === t.plant && o.zone === t.zone)) out.push(t)
  }
  return out
}

/** What one visit did, as the boards read it. */
export interface TaskDeeds {
  zone: ZoneId | ''
  kills: Readonly<Record<string, number>>
}

/** Count a visit into the boards' defeat tasks (returns those it moved). */
export const countTaskDeeds = (list: TownTask[], d: TaskDeeds): TownTask[] => {
  const moved: TownTask[] = []
  for (const t of list) {
    if (t.done || t.kind !== 'slay' || t.have >= t.n || t.zone !== d.zone) continue
    const add = d.kills[t.enemy] ?? 0
    if (add > 0) { t.have = Math.min(t.n, t.have + add); moved.push(t) }
  }
  return moved
}
