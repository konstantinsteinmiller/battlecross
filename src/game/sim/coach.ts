import { profile } from '../state/profile'

/**
 * ─── The control coach: wordless, on-screen, earned away ─────────────────────
 *
 * Replaces the text tips. Every control is taught by a GLYPH drawn where the
 * action happens (a WASD cluster, a mouse with the right button lit, a thumb
 * on a ghost joystick, a pulsing ring on the shield button…), never by a
 * sentence that disappears before it is read. Each glyph stays until the
 * player has actually DONE the thing a few times: every success flashes it
 * green and fills a pip, and the last one pops a check and retires it.
 *
 * Rules, each from a playtest:
 * - Nothing times out. A player who has not learned to look around still sees
 *   the look glyph a minute later; one who has, never sees it again.
 * - Mastery is per INPUT FAMILY (touch vs mouse+keys): a desktop veteran who
 *   picks up a phone has not learned the joystick.
 * - It comes back when the player seems stuck — no camera movement for a
 *   while, not shooting in a fight, eating blockable hits — and the "?"
 *   button brings the core set back on demand.
 * - One input per glyph. "Shift or right-click" was read as Shift+right-click,
 *   which Firefox answers with its own context menu, uncancellably.
 *
 * Pure bookkeeping: the mission reports successes (`use`) and context, the HUD
 * reads `views()`.
 */

export type HintId =
  | 'move' | 'look' | 'walk' | 'fire' | 'charge' | 'block' | 'parry' | 'slide' | 'tank' | 'weapon' | 'interact'
export type InputFamily = 'touch' | 'mouse'

interface HintDef {
  /** Successes that retire the glyph for good (per input family). */
  goal: number
  /** Higher shows first when too many compete. */
  priority: number
}

export const HINTS: Record<HintId, HintDef> = {
  slide: { goal: 2, priority: 9 },
  block: { goal: 2, priority: 8 },
  parry: { goal: 2, priority: 7 },
  tank: { goal: 1, priority: 7 },
  fire: { goal: 4, priority: 6 },
  charge: { goal: 2, priority: 6 },
  look: { goal: 3, priority: 5 },
  move: { goal: 3, priority: 5 },
  weapon: { goal: 2, priority: 4 },
  interact: { goal: 1, priority: 4 },
  walk: { goal: 2, priority: 2 }
}

/** At most this many glyphs at once; urgent ones win. Two: in the first
 *  fight, four glyphs at once (stick, camera, shoot, shield) were more than
 *  a new player could take in. */
const MAX_SHOWN = 2
/** A glyph lingers this long after its context passes, so it does not flicker. */
const LINGER = 3
/** Stuck detection. */
const LOOK_IDLE = 18
const MOVE_IDLE = 16
const FIRE_IDLE = 7
const MISSED_BLOCKS = 3
/** The "?" button shows the core set for up to this long. */
const HELP_HOLD = 25

export interface HintView {
  id: HintId
  family: InputFamily
  /** Successes so far toward `goal` (0..goal). */
  count: number
  goal: number
  /** Increments on every success: the HUD keys its green flash on it. */
  flash: number
  /** Just completed: show the check and fade. */
  done: boolean
}

/** What the mission tells the coach every step. */
export interface CoachContext {
  time: number
  family: InputFamily
  playing: boolean
  combat: boolean
  /** An enemy is in the sights (shots would aim at it). */
  aimCandidate: boolean
  /** A blockable / an unblockable telegraph is winding up within reach. */
  teleBlock: boolean
  teleRed: boolean
  hp01: number
  tanks: number
  hasWeapon: boolean
  canInteract: boolean
}

interface HintState {
  /** Successes counted during the current showing. */
  count: number
  /** Successes still needed for a recall to retire (0 = not recalled). */
  recall: number
  wantedUntil: number
  flash: number
  doneAt: number
  shown: boolean
}

const key = (id: HintId, family: InputFamily): string => `hint:${id}:${family}`

/** Persisted successes for a glyph (monotonic). */
export const hintProgress = (id: HintId, family: InputFamily): number => {
  const v = profile.tips[key(id, family)]
  return typeof v === 'number' ? v : 0
}

export class Coach {
  private st = {} as Record<HintId, HintState>
  private family: InputFamily = 'mouse'
  private now = 0
  private lastLook = 0
  private lastMove = 0
  private lastFire = 0
  private missedBlocks: number[] = []
  private helpUntil = -1
  private lookAcc = 0
  private moveAcc = 0

  constructor() {
    for (const id of Object.keys(HINTS) as HintId[]) {
      this.st[id] = { count: 0, recall: 0, wantedUntil: -1, flash: 0, doneAt: -1, shown: false }
    }
  }

  mastered(id: HintId, family = this.family): boolean {
    return hintProgress(id, family) >= HINTS[id].goal
  }

  /** The player just did it. */
  use(id: HintId): void {
    const s = this.st[id]
    if (id === 'look') this.lastLook = this.now
    if (id === 'move') this.lastMove = this.now
    if (id === 'fire' || id === 'charge') this.lastFire = this.now
    if (id === 'block' || id === 'parry') this.missedBlocks.length = 0
    const k = key(id, this.family)
    const stored = hintProgress(id, this.family)
    if (stored < HINTS[id].goal) profile.tips[k] = stored + 1
    if (!s.shown) {
      if (s.recall > 0) s.recall--
      return
    }
    s.count++
    s.flash++
    if (s.recall > 0) s.recall--
    const retired = this.mastered(id) && s.recall === 0
    if (retired && s.doneAt < 0) {
      s.doneAt = this.now
      // Drop the linger window, or the glyph pops back once its check fades.
      s.wantedUntil = -1
    }
  }

  /** Camera turned by `rad` (drag or keys): every 35° counts as one use. */
  looked(rad: number): void {
    this.lastLook = this.now
    this.lookAcc += Math.abs(rad)
    while (this.lookAcc >= 0.6) {
      this.lookAcc -= 0.6
      this.use('look')
    }
  }

  /** Walked `m` metres under the player's own control: every 2.5 m is a use. */
  moved(m: number): void {
    this.lastMove = this.now
    this.moveAcc += m
    while (this.moveAcc >= 2.5) {
      this.moveAcc -= 2.5
      this.use('move')
    }
  }

  /** A blockable hit landed. Three in a row without a block recall the shield. */
  blockableHit(): void {
    this.missedBlocks.push(this.now)
    this.missedBlocks = this.missedBlocks.filter(t => this.now - t < 20)
    if (this.missedBlocks.length >= MISSED_BLOCKS) {
      this.recall('block')
      this.missedBlocks.length = 0
    }
  }

  /** A shot bounced off a guard: time to learn the charge shot. */
  deflected(): void {
    if (!this.mastered('charge')) this.st.charge.wantedUntil = this.now + 8
  }

  /** The "?" button: the core set, until each is used once more. */
  help(): void {
    this.helpUntil = this.now + HELP_HOLD
    for (const id of ['move', 'look', 'fire', 'block', 'slide'] as HintId[]) this.recall(id)
  }

  private recall(id: HintId): void {
    const s = this.st[id]
    s.recall = Math.max(s.recall, 1)
    s.doneAt = -1
  }

  update(c: CoachContext): void {
    this.now = c.time
    if (c.family !== this.family) {
      // A different hand on a different device: its own progress, fresh views.
      this.family = c.family
      for (const s of Object.values(this.st)) { s.count = 0; s.shown = false; s.doneAt = -1 }
    }
    if (!c.playing) return
    const t = c.time
    const want = (id: HintId, on: boolean): void => {
      if (on) this.st[id].wantedUntil = t + LINGER
    }
    const fresh = (id: HintId): boolean => !this.mastered(id)
    // Movement and camera from the first moment of control, together: a
    // player who never finds the camera is stuck in the first corridor.
    want('move', fresh('move'))
    want('look', fresh('look'))
    want('walk', !c.combat && !fresh('move') && !fresh('look') && fresh('walk'))
    want('fire', (c.combat || c.aimCandidate) && fresh('fire'))
    want('charge', c.combat && !fresh('fire') && fresh('charge'))
    want('block', c.teleBlock && fresh('block'))
    want('parry', c.teleBlock && !fresh('block') && fresh('parry'))
    want('slide', c.teleRed && fresh('slide'))
    want('tank', c.hp01 < 0.4 && c.tanks > 0 && fresh('tank'))
    want('weapon', c.hasWeapon && c.combat && fresh('weapon'))
    want('interact', c.canInteract && fresh('interact'))
    // Stuck: bring the glyph back until the player does it once more.
    if (t > 6) {
      if (t - this.lastLook > LOOK_IDLE && !c.combat) this.recall('look')
      if (t - this.lastMove > MOVE_IDLE && !c.combat) this.recall('move')
      if (c.combat && t - this.lastFire > FIRE_IDLE) this.recall('fire')
    }
    for (const id of Object.keys(this.st) as HintId[]) {
      const s = this.st[id]
      if (s.recall > 0 && (id !== 'block' && id !== 'slide' || c.teleBlock || c.teleRed || t < this.helpUntil)) {
        s.wantedUntil = Math.max(s.wantedUntil, t + 0.5)
      }
    }
  }

  /** What to draw, most urgent first, at most MAX_SHOWN (plus fading checks). */
  views(): HintView[] {
    const t = this.now
    const live: HintId[] = []
    for (const id of Object.keys(this.st) as HintId[]) {
      const s = this.st[id]
      const fading = s.doneAt >= 0 && t - s.doneAt < 0.9
      const wanted = s.wantedUntil > t && (s.doneAt < 0)
      if (wanted || fading) live.push(id)
      else {
        s.shown = false
        s.count = 0
        if (s.doneAt >= 0 && t - s.doneAt >= 0.9) s.doneAt = -1
      }
    }
    live.sort((a, b) => HINTS[b].priority - HINTS[a].priority)
    const shown = live.slice(0, MAX_SHOWN)
    return shown.map((id) => {
      const s = this.st[id]
      if (!s.shown) {
        s.shown = true
        // A recall of something mastered asks for fresh proof; otherwise the
        // pips resume from what was already done.
        s.count = s.recall > 0 && this.mastered(id) ? 0 : Math.min(hintProgress(id, this.family), HINTS[id].goal)
      }
      const goal = s.recall > 0 && this.mastered(id) ? Math.max(1, s.count + s.recall) : HINTS[id].goal
      return { id, family: this.family, count: Math.min(s.count, goal), goal, flash: s.flash, done: s.doneAt >= 0 }
    })
  }
}
