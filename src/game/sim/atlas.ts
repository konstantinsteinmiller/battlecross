/**
 * ─── Atlas, in a mission: what it says, and when ────────────────────────────
 *
 * Atlas talks TO Flux: short monologue lines — a briefing on the way in, the
 * story so far, a boss ahead, a trap or a plate ahead, health or weapon
 * energy running low, the objective done, the ride out. Each line is an i18n
 * key under `atlas.*` (the bubble) and a voice id of the same name (the
 * optional recording, `audio/voice.ts`).
 *
 * The platform stages add two open families, keyed by the level's own
 * files (`sim/stageFeatures.ts`, `ClimbHost.say`): `hint.<id>` — a tip on a
 * trap or a jump ahead, as urgent as a trap warning — and `secret.<id>` — a
 * cryptic nudge toward a secret, low key. Their text is `atlas.hint.<id>` /
 * `atlas.secret.<id>` in the locales; a recording is optional (no file: the
 * bubble alone). Like most lines, each is said once a mission.
 *
 * Rules that keep it from nagging:
 * - one line at a time; a waiting line with a higher priority goes first;
 * - a gap after each line, and a cooldown per line;
 * - warnings re-arm only once their cause has cleared (health back up, …);
 * - a quiet stretch in play (no fight) may earn one line of small talk.
 *
 * It also drives where Atlas's model is: `peek` 0..1 eases it into the top
 * left of Flux's view while it speaks, and now and then just to check in,
 * then back out of sight.
 *
 * Pure: no three.js, no Vue. The mission feeds it a tick and reads `line`.
 */

import type { SectorId } from '../world/themes'
import type { WeaponId } from '../data/weapons'
import { BOSSES } from '../data/bosses'

export type AtlasLine =
  | 'landed'
  | 'brief.tutorial' | 'brief.job' | 'brief.climb' | 'brief.story'
  | `story.${SectorId}`
  | `arc.${number}`
  | 'bossAhead' | 'bossDown' | 'vexDown' | 'guardDown'
  /** After `bossAhead`: the weapon the Master is weak to (Flux carries it),
   *  or that this one has no weakness at all. */
  | `weak.${WeaponId}` | 'noWeak'
  | 'lowHp' | 'lowHpGel' | 'lowWe'
  | 'trap' | 'plate'
  | 'exit' | 'levelUp'
  | 'idle.1' | 'idle.2' | 'idle.3' | 'idle.4'
  | `hint.${string}` | `secret.${string}`
  /** A lesson room's gold intro, and its hint when the player is stuck. */
  | `train.${string}` | `help.${string}`
  /** Lines inside the voiced story scenes (`story/vexScene.ts`, #117). */
  | `story.${string}` | `volt.${string}` | `mk1.${string}`
  /** The story's own warnings, hints, machine scans and sector beam-ins
   *  (`story-arc.md` §7–8): the first-time and the specific variants of the
   *  lines above. One line per event, never both. */
  | `warn.${string}` | `scan.${string}` | `sector.${string}` | 'boss.signalFirst' | 'fortress.bays'

/** The relays to light before Vex's shield falls (the Core Masters, the
 *  Scrapper's included): one progress line each (`arc.1` … `arc.10`). */
export const ARC_LINES = 10

/** Every fixed mission line, for the voice list and the preload (a stage's
 *  `hint.*` / `secret.*` lines are its own, fetched when said). */
export const ATLAS_LINES: readonly AtlasLine[] = [
  'landed', 'brief.tutorial', 'brief.job', 'brief.climb', 'brief.story',
  'story.scrapyard', 'story.blaze', 'story.cryo', 'story.volt', 'story.gale', 'story.magnet', 'story.drill', 'story.tide',
  'story.neon', 'story.rotor', 'story.fortress',
  ...Array.from({ length: ARC_LINES }, (_, n) => `arc.${n + 1}` as AtlasLine),
  'bossAhead', 'bossDown', 'vexDown', 'guardDown', 'lowHp', 'lowHpGel', 'lowWe', 'trap', 'plate',
  ...Object.values(BOSSES).flatMap(b => b.weakTo ? [`weak.${b.weakTo}` as AtlasLine] : []), 'noWeak',
  'exit', 'levelUp', 'idle.1', 'idle.2', 'idle.3', 'idle.4'
]

/** The i18n key and the voice id of a line. */
export const atlasKey = (l: AtlasLine): string => `atlas.${l}`

/** How urgent each kind of line is (higher first). */
const PRIO: Partial<Record<AtlasLine, number>> = {
  lowHp: 9, lowHpGel: 9, bossAhead: 8, trap: 7, plate: 7, lowWe: 6, bossDown: 8, vexDown: 8,
  exit: 7, levelUp: 5, landed: 4,
  'warn.gelFirst': 9, 'warn.gel': 9, 'warn.criticalFirst': 9, 'warn.critical': 9, 'warn.noGel': 9, 'warn.down': 9,
  'warn.boss': 8, 'boss.signalFirst': 8, 'warn.flame': 7, 'warn.blade': 7, 'warn.crusher': 7, 'warn.ladder': 7, 'warn.pit': 7,
  'warn.weLow': 6, 'warn.weEmpty': 6, 'hint.done': 6, 'hint.rescue': 6, 'hint.levelUp': 5, 'hint.locator': 4, 'hint.upgrade': 4
}
/** A stage's tip on the danger ahead weighs like a trap warning; its secret
 *  nudges keep the default. */
const HINT_PRIO = 7
const prioOf = (l: AtlasLine): number =>
  PRIO[l] ?? (l === 'noWeak' || l.startsWith('weak.') ? 8 : l.startsWith('idle') ? 1 : l.startsWith('train.') ? 8
    : l.startsWith('hint.') || l.startsWith('help.') ? HINT_PRIO : l.startsWith('scan.') || l.startsWith('warn.') ? 6 : 3)

/** Seconds before the same line may come back (default: once a mission). */
const COOLDOWN: Partial<Record<AtlasLine, number>> = {
  lowHp: 30, lowHpGel: 30, lowWe: 45, trap: 25, plate: 25, levelUp: 10,
  'warn.gel': 30, 'warn.critical': 30, 'warn.weEmpty': 20, 'warn.down': 1, 'hint.levelUp': 10, 'hint.upgrade': 20
}
/** A borrowed weapon can be refilled and run dry again: its last-shot line may return. */
const cooldownOf = (id: AtlasLine): number | undefined =>
  COOLDOWN[id] ?? (id.startsWith('help.') ? 25 : id.startsWith('warn.borrowedLast.') ? 20 : undefined)
/** Health under this with a gel in the pack: "use a gel" (the gel lesson's own mark). */
const GEL_AT = 0.5
/** Health under this: critical (the low-health heartbeat's mark). */
const CRITICAL_AT = 0.25
/** The sectors with a beam-in line of their own (`sector.<id>`): the first story landing there. */
const SECTOR_LINES: ReadonlySet<string> = new Set(['blaze', 'cryo', 'gale', 'magnet', 'drill', 'tide', 'neon', 'rotor'])
/** Quiet after a line before the next one (s). */
export const ATLAS_GAP = 1.2
/** Longest a line waits for its recording to finish loading before it goes
 *  up as a bubble alone (s). */
export const VOICE_WAIT = 0.8
/** A waiting line older than this is dropped (it would come too late).
 *  Doubled with the hold times, so a queue of two lines still gets through. */
const STALE = 16
/** Quiet play before a line of small talk (s), and at most this many. */
const IDLE_AFTER = 55
const IDLE_MAX = 2
/** An idle peek into view every so often (s), for this long. */
const PEEK_EVERY = 38
const PEEK_FOR = 2.6

/** How long a line stays up without a voice: by its length in characters.
 *  Doubled after playtests — players lost lines mid-read (a voiced line keeps
 *  the voice's own length). */
export const lineSeconds = (chars: number): number => 2 * Math.min(3.8, Math.max(1.6, 1.1 + chars * 0.045))

export interface AtlasMissionInfo {
  tutorial: boolean
  /** Quest kind and template. */
  kind: 'story' | 'job'
  template: string
  sector: SectorId
  /** Core Masters freed so far (story progress). */
  freed: number
  /** The first story landing in this sector ever: its beam-in line stands in for the briefing. */
  firstVisit?: boolean
}

export interface AtlasTick {
  /** Live play (not the beam-in, not a modal). */
  playing: boolean
  combat: boolean
  hp01: number
  tanks: number
  /** Special weapon energy 0..1, or −1 with no special weapon equipped. */
  we01: number
  level: number
  objectiveDone: boolean
  /** A trap ahead within reach: its id, or −1. */
  trapNear: number
  /** What that trap is (a corridor flame jet or a blade), for its first-time line. */
  trapKind?: '' | 'flame' | 'blade'
  plateNear: boolean
}

export interface SpokenLine {
  id: AtlasLine
  /** When it came up, and how long it stays (s). */
  at: number
  hold: number
}

export class AtlasDirector {
  /** The line up now, if any. */
  line: SpokenLine | null = null
  /** 0..1: how far into view Atlas is (eased). */
  peek = 0
  private t = 0
  private queue: Array<{ id: AtlasLine; at: number }> = []
  private said = new Map<AtlasLine, number>()
  private quietSince = -ATLAS_GAP
  private idleSaid = 0
  private nextPeek = PEEK_EVERY * 0.6
  private peekUntil = -1
  private lastLevel = -1
  private armed = { hp: true, gel: true, we: true, objective: true }
  private trapsWarned = new Set<number>()
  private briefed = false
  private held = false

  /**
   * @param info the mission
   * @param speak voice hook: plays the line's recording if there is one and
   *   returns its length (s), or null — the bubble shows either way.
   */
  /**
   * @param prefetch voice hook: start loading the line's recording now (it
   *   is called when the line is queued, before its bubble), and say where
   *   it stands. A line whose file is still 'loading' waits up to VOICE_WAIT.
   */
  constructor(
    info: AtlasMissionInfo,
    speak: (key: string) => number | null = () => null,
    prefetch: (key: string) => 'none' | 'loading' | 'ready' = () => 'none',
    first: (flag: string) => boolean = () => false
  ) {
    this.info = info
    this.speak = speak
    this.prefetch = prefetch
    this.first = first
  }

  /** True the first time EVER a teaching line's flag is asked (the profile keeps it), false after:
   *  the story's "first time" variants are said once in a save, not once a mission. */
  readonly first: (flag: string) => boolean

  private readonly info: AtlasMissionInfo
  private readonly speak: (key: string) => number | null
  private readonly prefetch: (key: string) => 'none' | 'loading' | 'ready'

  /** Ask for a line (it waits its turn; a line on cooldown is dropped). */
  say(id: AtlasLine): void {
    const last = this.said.get(id)
    // A lesson's hint repeats while the player stays stuck (`training.ts`).
    const cd = cooldownOf(id)
    if (last !== undefined && (cd === undefined || this.t - last < cd)) return
    if (this.queue.some(q => q.id === id) || this.line?.id === id) return
    this.queue.push({ id, at: this.t })
    // Its recording loads now, on demand: it has the wait before the bubble.
    this.prefetch(atlasKey(id))
  }

  /**
   * A story scene speaks now (`story/vexScene.ts`): this line goes up at once,
   * cutting nothing (the scene holds the director first). Returns its hold (s).
   */
  sayNow(id: AtlasLine): number {
    this.queue = this.queue.filter(q => q.id !== id)
    this.start(id)
    return this.line!.hold
  }

  /** While a scene runs, the director starts nothing of its own; warnings still arm and wait. */
  hold(on: boolean): void {
    this.held = on
  }

  /** One-off moments the mission reports. */
  event(e: 'landed' | 'play' | 'bossAhead' | 'bossDown' | 'vexDown' | 'exit'): void {
    if (e === 'play') return this.brief()
    this.say(e)
  }

  /** The way in: a briefing, then (on a story mission) where the story is. */
  private brief(): void {
    if (this.briefed) return
    this.briefed = true
    const i = this.info
    if (i.tutorial) this.say('brief.tutorial')
    else if (i.template === 'climb') this.say('brief.climb')
    else if (i.kind === 'story') {
      // The first landing in a sector: what the place is to the story, in place of the usual line.
      this.say((i.firstVisit && SECTOR_LINES.has(i.sector) ? `sector.${i.sector}` : `story.${i.sector}`) as AtlasLine)
      if (i.freed >= 1 && i.freed <= ARC_LINES) this.say(`arc.${i.freed}` as AtlasLine)
    } else this.say('brief.job')
  }

  update(dt: number, k: AtlasTick): void {
    this.t += dt
    const t = this.t
    // ── Warnings, each re-armed once its cause has cleared ──
    if (k.playing) {
      // Health, in two steps. With a gel in the pack: under half, "use a gel"
      // (in full the first time ever, then each mission's first nudge, then one
      // word); under a quarter, "Critical!". With none: under a quarter, "No
      // gel left" once a mission, then the plain "Careful".
      // One hit through both steps says only the critical line.
      if (k.hp01 < CRITICAL_AT && this.armed.hp) {
        this.armed.hp = false
        this.armed.gel = false
        if (k.tanks > 0) this.say(this.first('atlas:critical') ? 'warn.criticalFirst' : 'warn.critical')
        else this.say(this.said.has('warn.noGel') ? 'lowHp' : 'warn.noGel')
      } else if (k.tanks > 0 && k.hp01 < GEL_AT && this.armed.gel) {
        this.armed.gel = false
        this.say(this.first('atlas:gel') ? 'warn.gelFirst'
          : this.said.has('lowHpGel') || this.said.has('warn.gelFirst') ? 'warn.gel' : 'lowHpGel')
      }
      if (k.hp01 > 0.7) this.armed.gel = true
      if (k.hp01 > 0.55) this.armed.hp = true
      if (k.we01 >= 0 && k.we01 < 0.2 && this.armed.we) {
        this.armed.we = false
        // With the advice the first time in a mission (the Buster costs nothing), short after.
        this.say(this.said.has('warn.weLow') ? 'lowWe' : 'warn.weLow')
      } else if (k.we01 > 0.45) this.armed.we = true
      if (!this.info.tutorial && k.trapNear >= 0 && !this.trapsWarned.has(k.trapNear)) {
        this.trapsWarned.add(k.trapNear)
        // What to do about this kind of trap, the first time ever; after that, the plain warning.
        const kind = k.trapKind
        this.say(kind && this.first(`atlas:trap:${kind}`) ? `warn.${kind}` as AtlasLine : 'trap')
      }
      if (k.plateNear) this.say('plate')
      if (k.objectiveDone && this.armed.objective) {
        this.armed.objective = false
        this.say('hint.done')
      }
      // Two ways to say it, by turns.
      if (this.lastLevel >= 0 && k.level > this.lastLevel) this.say(k.level % 2 ? 'hint.levelUp' : 'levelUp')
    }
    this.lastLevel = k.level
    // ── The line up now ──
    if (this.line && t >= this.line.at + this.line.hold) {
      this.line = null
      this.quietSince = t
    }
    this.queue = this.queue.filter(q => t - q.at < STALE)
    if (!this.held && !this.line && this.queue.length && t - this.quietSince >= ATLAS_GAP) {
      this.queue.sort((a, b) => prioOf(b.id) - prioOf(a.id) || a.at - b.at)
      const next = this.queue[0]!
      // Still loading its voice: give it a moment, then go without.
      if (this.prefetch(atlasKey(next.id)) !== 'loading' || t - next.at >= VOICE_WAIT) {
        this.queue.shift()
        this.start(next.id)
      }
    }
    // ── Small talk, in a quiet stretch ──
    if (!this.held && k.playing && !k.combat && !this.line && !this.queue.length && this.idleSaid < IDLE_MAX &&
      t - this.quietSince > IDLE_AFTER) {
      this.idleSaid++
      this.say(`idle.${1 + ((this.info.freed + this.idleSaid) % 4)}` as AtlasLine)
    }
    // ── Where the model is: in view while talking, now and then to check in ──
    if (k.playing && !k.combat && !this.line && t >= this.nextPeek) {
      this.peekUntil = t + PEEK_FOR
      this.nextPeek = t + PEEK_EVERY + ((t * 7.31) % 1) * 20
    }
    // (It stays out while more lines wait: no flying off between two.)
    const want = this.line || this.queue.length || t < this.peekUntil ? 1 : 0
    this.peek += (want - this.peek) * Math.min(1, dt * (want ? 3.2 : 1.8))
  }

  private start(id: AtlasLine): void {
    const key = atlasKey(id)
    const voice = this.speak(key)
    this.said.set(id, this.t)
    const chars = id.length * 3 + 12 // no text here; a rough stand-in, see `holdFor`
    const hold = voice !== null ? Math.max(1.2, voice + 0.35) : holdFor(key) ?? lineSeconds(chars)
    this.line = { id, at: this.t, hold }
  }
}

/** The bubble's text length decides how long a line without a voice stays;
 *  the HUD registers the lookup (it has the translations). */
let textOf: ((key: string) => string) | null = null
export const setAtlasTextLookup = (fn: ((key: string) => string) | null): void => { textOf = fn }
const holdFor = (key: string): number | null => {
  const s = textOf?.(key)
  return s ? lineSeconds(s.length) : null
}
