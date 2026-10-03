/**
 * ─── Nudges: soft pulls toward the next goal (roadmap #69) ───────────────────
 *
 * The goal tracker names the next step; a nudge points at it, wordlessly, and
 * only when it is needed: after the player has stood about (or wandered off)
 * for a while without getting any closer. For 10–15 year olds: short delays,
 * bright friendly cues, and a reward when a goal is done.
 *
 *   bounce   the thing to use hops (the next map place, Leave, the map button,
 *            the trainer's pin, a chest in reach, the hero button with points
 *            waiting, the bag with an upgrade in it) — a glow instead of a hop
 *            for players who ask for reduced motion;
 *   edge     an arrow at the screen's edge toward a goal that is off screen
 *            (the next pack, the trainer);
 *   crumbs   a short sparkle trail on the ground toward the next objective;
 *   peek     once per zone, the camera leans toward an unopened chest nearby;
 *   mapWay   on the world map: the next place's landmark hops, an arrow at
 *            the hero points the way and the suggested road lights up.
 *
 * Never aggressive: ONE nudge at a time; none during fights, conversations,
 * windows, ads or a lesson; each one shows for a few seconds, waits before it
 * comes again, and backs off for the visit after it has been ignored
 * `MAX_IGNORED` times — and for good once the player does the thing.
 *
 * Pure: the clock, the idleness and the candidates are handed in, so the
 * tests drive it (`tests/game/coachNudge.test.ts`); `onboarding.ts` wires it.
 */

export type NudgeKind = 'bounce' | 'edge' | 'crumbs' | 'peek' | 'mapWay'

export interface NudgeCand {
  /** Unique per target: `bounce:menu-map`, `edge:pack`, `mapWay:hollows`. */
  id: string
  kind: NudgeKind
}

export interface NudgeTiming {
  /** Seconds without progress before it first shows: a first-timer, everyone else. */
  first: number
  vet: number
  /** Seconds it stays up (then it counts as ignored). */
  show: number
  /** Seconds before the same nudge may come back. */
  gap: number
}

/**
 * The timings, in one place. Tuned for 10–15 year olds, who drift off fast:
 * the delays are short, a first-timer's shorter still, but a cue never stays
 * up longer than a few seconds and never comes straight back.
 */
export const NUDGE_TIMING: Record<NudgeKind, NudgeTiming> = {
  // The thing to press hops: the cheapest cue, so the first to come.
  bounce: { first: 5, vet: 9, show: 5, gap: 12 },
  // An arrow at the edge toward a goal off screen.
  edge: { first: 9, vet: 14, show: 6, gap: 14 },
  // Sparkles on the ground toward the next objective: after a longer idle.
  crumbs: { first: 13, vet: 19, show: 6, gap: 18 },
  // The camera leans toward a chest the player walked past: once a zone.
  peek: { first: 7, vet: 10, show: 1.8, gap: 1e9 },
  // The world map: the next place hops, an arrow and its road light up.
  mapWay: { first: 10, vet: 15, show: 5, gap: 14 }
}

/** Ignored this many times in one visit, a nudge backs off until the next. */
export const MAX_IGNORED = 3

/** Seconds of quiet between one cue going and any other coming: never two
 *  back to back. (The wait without progress keeps counting meanwhile, so a
 *  player who goes on standing about meets the next, stronger cue.) */
export const BREATHER = 4

export interface NudgeInput {
  now: number
  dt: number
  /** A fight, a conversation, a window, an ad, a lesson on screen. */
  blocked: boolean
  /** What could be pointed at here, most useful first. */
  cands: readonly NudgeCand[]
  firstTimer: boolean
  /** The player asked for reduced motion: a glow instead of a hop, and no
   *  camera peek. */
  reduced?: boolean
}

export interface NudgeOut {
  active: NudgeCand | null
  /** How a cue on a thing is drawn: a hop, or (reduced motion) a glow. */
  style: 'bounce' | 'glow'
  /** Seconds it has been up (the layers ease in and out on it). */
  age: number
}

export class Nudger {
  active: NudgeCand | null = null
  /** Seconds without progress (only while nothing blocks). */
  idle = 0
  private since = 0
  /** When the last cue went (the breather runs from it). */
  private lastAny = -Infinity
  private ignored = new Map<string, number>()
  private lastEnd = new Map<string, number>()
  /** Done, or used up (a peek): not again this visit. */
  private retired = new Set<string>()
  /** Done for good, across visits (the player did the thing). */
  private learned = new Set<string>()

  /** A new place (or a new screen): ignores and peeks start over. */
  visit(): void {
    this.active = null
    this.lastAny = -Infinity
    this.idle = 0
    this.ignored.clear()
    this.lastEnd.clear()
    this.retired.clear()
  }

  /** The player got somewhere (closer to the goal, or a goal done): calm. */
  progress(): void {
    this.idle = 0
    this.active = null
  }

  /** The player did the thing a nudge points at: it backs off for good. */
  used(id: string): void {
    this.learned.add(id)
    this.retired.add(id)
    if (this.active?.id === id) this.active = null
    this.idle = 0
  }

  /** Has the player given up on it this visit (or done it)? */
  backedOff(id: string): boolean {
    return this.retired.has(id) || this.learned.has(id) || (this.ignored.get(id) ?? 0) >= MAX_IGNORED
  }

  step(inp: NudgeInput): NudgeOut {
    const style = inp.reduced ? 'glow' : 'bounce'
    if (inp.blocked) {
      // Nothing during a fight or a window, and the wait does not run on.
      this.active = null
      return { active: null, age: 0, style }
    }
    this.idle += inp.dt
    const a = this.active
    if (a) {
      const still = inp.cands.some(c => c.id === a.id)
      if (!still) this.active = null
      else if (inp.now - this.since >= NUDGE_TIMING[a.kind].show) {
        // Shown and not acted on: one ignore. A peek is once a zone anyway.
        this.ignored.set(a.id, (this.ignored.get(a.id) ?? 0) + 1)
        this.lastEnd.set(a.id, inp.now)
        if (a.kind === 'peek') this.retired.add(a.id)
        this.active = null
        this.lastAny = inp.now
      } else return { active: a, age: inp.now - this.since, style }
    }
    if (inp.now - this.lastAny < BREATHER) return { active: null, age: 0, style }
    for (const c of inp.cands) {
      if (this.backedOff(c.id)) continue
      if (c.kind === 'peek' && inp.reduced) continue
      const t = NUDGE_TIMING[c.kind]
      if (this.idle < (inp.firstTimer ? t.first : t.vet)) continue
      const end = this.lastEnd.get(c.id)
      if (end !== undefined && inp.now - end < t.gap) continue
      this.active = c
      this.since = inp.now
      return { active: c, age: 0, style }
    }
    return { active: null, age: 0, style }
  }

  /** Test seam. */
  reset(): void {
    this.visit()
    this.learned.clear()
  }
}
