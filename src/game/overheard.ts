import { meets } from './dialog/conditions'
import { speakSeconds } from './dialog/pacing'
import type { DialogWorld } from './dialog/types'
import { smalltalkOf } from './data/dialogs/smalltalk'
import type { TownChat } from './sim/townLife'

/**
 * ─── Overheard small talk (roadmap #42) ──────────────────────────────────────
 *
 * When the hero walks within a few metres of two townsfolk chatting, he
 * catches an exchange: two or three short lines (`data/dialogs/smalltalk.ts`),
 * said in turn, one bubble over each speaker. Nothing to answer; never the
 * same exchange twice in a visit; at most a few exchanges from one pair; and
 * never while a conversation or a screen is open (it simply stops).
 *
 * This decides WHAT is said and WHEN; `OverheardLayer.vue` draws the bubble
 * and town life (`townSay`) turns the speaker to talk and the other to listen.
 */

/** How near the hero must come to a chat to hear it, and how far he may wander off before it stops. */
export const HEAR_RADIUS = 3
export const LOSE_RADIUS = 5
/** Exchanges one pair says in a visit, and the pause between them. */
export const PER_PAIR = 3
const BETWEEN = 3
/** The breath between two lines of an exchange. */
const GAP = 0.35

export interface HeardLine {
  /** The unit saying it, and its line id (= i18n key). */
  unit: number
  key: string
  /** Seconds into the line, and how long it is spoken for. */
  t: number
  dur: number
}

interface Run {
  pair: string
  a: number
  b: number
  lines: Array<{ unit: number; key: string; dur: number }>
  i: number
  t: number
}

export interface OverhearInput {
  /** A new value: a new visit (what was heard is forgotten). */
  visit: unknown
  town: string
  chats: readonly TownChat[]
  hx: number
  hz: number
  /** A conversation or a screen is open: nothing is said, and a line stops. */
  quiet: boolean
  world: DialogWorld
  /** Turn the speaker to talk for that long (town life); false when the chat is over. */
  say: (unit: number, seconds: number) => boolean
  /** The words of a line (to time it). */
  text: (key: string) => string
}

export class Overhearing {
  private visit: unknown = undefined
  private said = new Set<string>()
  private pairs = new Map<string, number>()
  private run: Run | null = null
  private rest = 0
  /** The line being said now (the layer draws it). */
  now: HeardLine | null = null

  step(dt: number, o: OverhearInput): HeardLine | null {
    if (o.visit !== this.visit) {
      this.visit = o.visit
      this.said.clear()
      this.pairs.clear()
      this.run = null
      this.rest = 0
    }
    this.rest = Math.max(0, this.rest - dt)
    if (o.quiet) return this.stop()
    if (this.run) this.carry(dt, o)
    else if (this.rest <= 0) this.begin(o)
    const r = this.run
    const l = r?.lines[r.i]
    this.now = r && l && r.t < l.dur ? { unit: l.unit, key: l.key, t: r.t, dur: l.dur } : null
    return this.now
  }

  /** Stop at once (a conversation or a screen opened). */
  stop(): null {
    this.run = null
    this.now = null
    return null
  }

  private carry(dt: number, o: OverhearInput): void {
    const r = this.run!
    const chat = o.chats.find(c => pairKey(c) === r.pair)
    // The chat broke up, or the hero walked on.
    if (!chat || Math.hypot(chat.x - o.hx, chat.z - o.hz) > LOSE_RADIUS) { this.run = null; this.rest = 1; return }
    r.t += dt
    const l = r.lines[r.i]!
    if (r.t < l.dur + GAP) return
    r.i++
    r.t = 0
    const next = r.lines[r.i]
    if (!next || !o.say(next.unit, next.dur)) { this.run = null; this.rest = BETWEEN }
  }

  private begin(o: OverhearInput): void {
    let best: TownChat | null = null
    let bd = HEAR_RADIUS
    for (const c of o.chats) {
      const d = Math.hypot(c.x - o.hx, c.z - o.hz)
      if (d <= bd && (this.pairs.get(pairKey(c)) ?? 0) < PER_PAIR) { best = c; bd = d }
    }
    if (!best) return
    const conv = smalltalkOf(o.town, best.kids)
    if (!conv) return
    const blocks = conv.greet ?? []
    // Each pair starts somewhere else in the list: neighbours do not open alike.
    const k0 = (best.a * 7 + best.b * 3) % Math.max(1, blocks.length)
    for (let n = 0; n < blocks.length; n++) {
      const b = blocks[(k0 + n) % blocks.length]!
      const id = `${conv.id}.${b.id}`
      if (this.said.has(id) || !meets(b.when, o.world, conv.id)) continue
      const lines = b.lines.map(l => ({ unit: l.by === 'npc' ? best!.a : best!.b, key: l.id, dur: speakSeconds(o.text(l.id)) }))
      if (!lines.length || !o.say(lines[0]!.unit, lines[0]!.dur)) return
      this.said.add(id)
      const pair = pairKey(best)
      this.pairs.set(pair, (this.pairs.get(pair) ?? 0) + 1)
      this.run = { pair, a: best.a, b: best.b, lines, i: 0, t: 0 }
      return
    }
  }
}

const pairKey = (c: { a: number; b: number }): string => `${c.a}:${c.b}`
