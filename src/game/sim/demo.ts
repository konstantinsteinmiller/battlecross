import type { Input } from '../engine/input'
import { CHARGE_L2 } from './stats'

/**
 * ─── The demo: a lesson played once through the real controls ───────────────
 *
 * A lesson's demo (`training.ts`) is not an animation of the move: the game
 * PRESSES the buttons. A timed script of cues writes into the same input
 * record the mouse, keys and touch buttons write into, so the charged shot
 * the player watches is a real charged shot — its hum, its glow, its release
 * window — and can never drift from the mechanic it teaches. The HUD lights
 * the input in step with each cue (`hud.demoAct` / `hud.demoDown`), on the
 * very button a phone player will press.
 *
 * While a demo runs the player's own hands are ignored (a press counts toward
 * skipping it: two presses skip, the same rule as every shot in the game).
 */

export type DemoAct = 'fire' | 'block' | 'slide' | 'tank' | 'move' | 'look'

export type DemoCue =
  | { at: number; do: 'press'; act: DemoAct }
  | { at: number; do: 'release'; act: DemoAct }
  /** Hold the stick at (x, y) (x right, y forward), or let it go (0, 0). */
  | { at: number; do: 'stick'; x: number; y: number }
  /** Turn the view at this rate (rad/s; 0 stops) — the look thumb. */
  | { at: number; do: 'turn'; rate: number }
  /** A scene event the mission performs (a demo shot, a ring): `tag`. */
  | { at: number; do: 'emit'; tag: string }
  | { at: number; do: 'end' }

export interface DemoScript {
  cues: DemoCue[]
  /** Aim the view at this point while the demo runs (null: leave it). */
  aim: (() => { x: number; y: number; z: number } | null) | null
}

/** Real presses that skip a demo. */
export const DEMO_SKIP = 2

export class DemoDriver {
  script: DemoScript | null = null
  t = 0
  private next = 0
  /** The input shown lit (and whether it is pressed right now). */
  act: DemoAct | '' = ''
  down = false
  stickX = 0
  stickY = 0
  turnRate = 0
  private fire = false
  private block = false
  /** Real presses counted toward a skip. */
  presses = 0
  /** Emit tags due this step (the mission performs them). */
  readonly emits: string[] = []
  ended = false

  get active(): boolean {
    return this.script !== null
  }

  start(s: DemoScript): void {
    this.script = s
    this.t = 0
    this.next = 0
    this.act = ''
    this.down = false
    this.stickX = this.stickY = this.turnRate = 0
    this.fire = this.block = false
    this.presses = 0
    this.ended = false
  }

  stop(): void {
    this.script = null
    this.act = ''
    this.down = false
    this.ended = true
  }

  /**
   * One step: read the player's real presses (for the skip), then overwrite
   * the input record with the script's. Returns the edges to apply this step.
   */
  step(dt: number, input: Input): void {
    const s = this.script
    this.emits.length = 0
    if (!s) return
    if (input.anyPressed) this.presses++
    if (this.presses >= DEMO_SKIP) {
      this.clear(input)
      this.stop()
      return
    }
    // The player's own hands are out of it while the demo plays.
    input.moveX = input.moveY = input.turn = 0
    input.lookDX = input.lookDY = 0
    input.taps.length = 0
    input.firePressed = input.fireReleased = input.fireCancelled = false
    input.blockPressed = false
    input.slideQueued = input.tankQueued = input.interactQueued = input.beamQueued = false
    input.weaponQueued = 0
    this.t += dt
    while (this.next < s.cues.length && s.cues[this.next]!.at <= this.t) {
      const c = s.cues[this.next++]!
      switch (c.do) {
        case 'press':
          this.act = c.act
          this.down = true
          if (c.act === 'fire') { this.fire = true; input.firePressed = true }
          else if (c.act === 'block') { this.block = true; input.blockPressed = true }
          else if (c.act === 'slide') input.slideQueued = true
          else if (c.act === 'tank') input.tankQueued = true
          break
        case 'release':
          this.act = c.act
          this.down = false
          if (c.act === 'fire' && this.fire) { this.fire = false; input.fireReleased = true }
          else if (c.act === 'block') this.block = false
          break
        case 'stick':
          this.stickX = c.x
          this.stickY = c.y
          if (c.x || c.y) this.act = 'move'
          break
        case 'turn':
          this.turnRate = c.rate
          break
        case 'emit':
          this.emits.push(c.tag)
          break
        case 'end':
          this.clear(input)
          this.stop()
          return
      }
    }
    input.fireHeld = this.fire
    input.blockHeld = this.block
    input.moveX = this.stickX
    input.moveY = this.stickY
  }

  /** Hands off: nothing the script pressed stays pressed. */
  private clear(input: Input): void {
    if (this.fire) input.fireCancelled = true
    input.fireHeld = false
    input.blockHeld = false
    input.moveX = input.moveY = 0
    this.fire = this.block = false
  }
}

// ─── The scripts ─────────────────────────────────────────────────────────────

/** The charged shot: aim at the demo drone, hold past the second charge
 *  level, let go. On touch it then shows the thing phone players never
 *  found: walking and turning WHILE charging (stick + the fire thumb). */
export const chargeDemo = (aim: DemoScript['aim'], touch: boolean): DemoScript => {
  const hold = CHARGE_L2 + 0.35
  const cues: DemoCue[] = [
    { at: 0.5, do: 'press', act: 'fire' },
    { at: 0.5 + hold, do: 'release', act: 'fire' },
    { at: 1.4 + hold, do: 'end' }
  ]
  if (touch) {
    // The charge carried while moving and looking round.
    const t0 = 1.6 + hold
    cues.splice(2, 1,
      { at: t0, do: 'press', act: 'fire' },
      { at: t0 + 0.2, do: 'stick', x: 0.7, y: 0.4 },
      { at: t0 + 0.4, do: 'turn', rate: 0.9 },
      { at: t0 + 1.4, do: 'turn', rate: -0.9 },
      { at: t0 + 2.4, do: 'turn', rate: 0 },
      { at: t0 + 2.4, do: 'stick', x: 0, y: 0 },
      { at: t0 + 2.5, do: 'release', act: 'fire' },
      { at: t0 + 3.3, do: 'end' }
    )
  }
  return { cues, aim }
}

/** The shield: raise it early for three shots, then a PERFECT block — pressed
 *  just before the fourth lands — that knocks the shooter out. `lead`: the
 *  demo shots' flight time (s). */
export const blockDemo = (aim: DemoScript['aim'], lead: number): DemoScript => ({
  aim,
  cues: [
    { at: 0.4, do: 'press', act: 'block' },
    { at: 0.6, do: 'emit', tag: 'shot' },
    { at: 1.1, do: 'emit', tag: 'shot' },
    { at: 1.6, do: 'emit', tag: 'shot' },
    { at: 1.6 + lead + 0.3, do: 'release', act: 'block' },
    { at: 2.8 + lead, do: 'emit', tag: 'shot' },
    // Pressed a tenth of a second before the hit: the parry window.
    { at: 2.8 + lead + lead - 0.1, do: 'press', act: 'block' },
    { at: 2.8 + 2 * lead + 0.6, do: 'release', act: 'block' },
    { at: 2.8 + 2 * lead + 1.4, do: 'end' }
  ]
})

/** The slide: a red ring rolls out (unblockable), Flux slides through it
 *  sideways just before it reaches him. `lead`: the ring's time to reach him. */
export const slideDemo = (aim: DemoScript['aim'], lead: number): DemoScript => ({
  aim,
  cues: [
    { at: 0.5, do: 'emit', tag: 'ring' },
    { at: 0.5 + lead - 0.18, do: 'stick', x: 1, y: 0 },
    { at: 0.5 + lead - 0.16, do: 'press', act: 'slide' },
    { at: 0.5 + lead + 0.2, do: 'stick', x: 0, y: 0 },
    { at: 0.5 + lead + 0.25, do: 'release', act: 'slide' },
    { at: 0.5 + lead + 1.3, do: 'end' }
  ]
})

/** The gap: walk straight at the edge; the edge-leap carries him over. */
export const gapDemo = (aim: DemoScript['aim'], walk: number): DemoScript => ({
  aim,
  cues: [
    { at: 0.3, do: 'stick', x: 0, y: 1 },
    { at: 0.3 + walk, do: 'stick', x: 0, y: 0 },
    { at: 0.6 + walk, do: 'end' }
  ]
})

/** The Repair Gel: the button lights and is pressed (the lesson grants the gel
 *  used, so the player still has one to try with). */
export const gelDemo = (): DemoScript => ({
  aim: null,
  cues: [
    { at: 0.6, do: 'press', act: 'tank' },
    { at: 0.9, do: 'release', act: 'tank' },
    { at: 2.0, do: 'end' }
  ]
})
