/**
 * ─── The objective locator ───────────────────────────────────────────────────
 *
 * A yellow triangle that shows WHERE the mission's goal is — through walls —
 * for a few seconds, then gets out of the way. On a boss mission the goal is
 * the Core Master's arena; on a job it is whatever the floor trail leads to
 * (the elite, the nearest target, a core, a supply chest, the worker-bot).
 *
 * It is a reminder, not a leash: shown for `SHOW` seconds, then asleep for
 * `COOLDOWN` seconds of PLAY (a pause, a modal or the hub never spend it), and
 * it never pops over a fight, a scene lesson or the guided walkthrough — a due
 * locator simply waits for the next quiet moment. A boss locator retires for
 * good once Flux stands within `NEAR` metres of the shutter: he has found it,
 * and the door itself takes over (see the boss door's warning lights). A job's
 * locator keeps cycling, since its goal moves on as targets fall, but skips its
 * turn while the goal is already that close.
 *
 * Pure: the mission feeds it a few numbers per step and reads `visible`,
 * `alpha` and `cooldown01` back. No three.js, so it is unit-tested directly.
 */

/** Seconds the triangle stays up. */
export const LOCATOR_SHOW = 5
/** Seconds of play between two showings. */
export const LOCATOR_COOLDOWN = 30
/** Metres from the goal (a boss mission: from the shutter) that end it. */
export const LOCATOR_NEAR = 10
/** Seconds into play before the first showing: after the title card. */
export const LOCATOR_FIRST = 2.2
/** Fade in / out, seconds. */
const FADE_IN = 0.3
const FADE_OUT = 0.6

export type LocatorPhase = 'wait' | 'show' | 'cool' | 'retired'

export interface LocatorInput {
  /** Live play: not paused, not beaming, no modal. */
  playing: boolean
  /** Nothing else owns the player's attention: no fight, no scene lesson, no
   *  walkthrough gate still teaching. */
  quiet: boolean
  /** A goal exists this step. */
  hasGoal: boolean
  /** Metres from Flux to the goal (a boss mission: to the boss shutter). */
  dist: number
  /** A boss mission: reaching the shutter retires the locator for good. */
  boss: boolean
  /** The goal is met or moot (boss fight begun, objective done). */
  finished: boolean
}

export class Locator {
  phase: LocatorPhase = 'wait'
  /** Seconds spent in the current phase (play time). */
  t = 0
  /** The first showing waits out the title card. */
  private delay = LOCATOR_FIRST
  /** Set on the step a showing begins (the chime); read-and-clear. */
  popped = false

  update(dt: number, i: LocatorInput): void {
    if (this.phase === 'retired') return
    if (i.finished || (i.boss && i.hasGoal && i.dist < LOCATOR_NEAR)) {
      this.phase = 'retired'
      this.t = 0
      return
    }
    if (!i.playing) return
    this.t += dt
    switch (this.phase) {
      case 'wait':
        if (this.delay > 0) {
          this.delay -= dt
          break
        }
        if (i.quiet && i.hasGoal && i.dist >= LOCATOR_NEAR) {
          this.phase = 'show'
          this.t = 0
          this.popped = true
        }
        break
      case 'show':
        // A fight or a lesson starting cuts it short (fading out, not
        // blinking off): the cooldown still starts, the reminder was seen.
        if (this.t >= LOCATOR_SHOW || !i.hasGoal) this.startCooldown()
        else if (!i.quiet && this.t < LOCATOR_SHOW - FADE_OUT) this.t = LOCATOR_SHOW - FADE_OUT
        break
      case 'cool':
        if (this.t >= LOCATOR_COOLDOWN) {
          this.phase = 'wait'
          this.t = 0
        }
        break
    }
  }

  private startCooldown(): void {
    this.phase = 'cool'
    this.t = 0
  }

  get visible(): boolean {
    return this.phase === 'show'
  }

  /** 0..1 opacity: a quick fade in, a slower fade out. */
  get alpha(): number {
    if (this.phase !== 'show') return 0
    const inA = Math.min(1, this.t / FADE_IN)
    const outA = Math.min(1, Math.max(0, (LOCATOR_SHOW - this.t) / FADE_OUT))
    return Math.min(inA, outA)
  }

  /** How far the cooldown has run, 0..1 (1 = due or showing), or -1 once retired. */
  get cooldown01(): number {
    if (this.phase === 'retired') return -1
    if (this.phase === 'cool') return Math.min(1, this.t / LOCATOR_COOLDOWN)
    return 1
  }
}
