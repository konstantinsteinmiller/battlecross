import { mulberry32, type Rng } from '../sim/rng'
import { makeOut, playEvents, type ChanSpec, type Ev, type Inst, type Mix, type Out } from './voices'

export { makeOut, PERCUSSION, OSC_BUDGET, OSC_BUDGET_BOSS } from './voices'
export type { Ev, Inst, Out } from './voices'

/**
 * ─── The score ───────────────────────────────────────────────────────────────
 *
 * Every piece of music Battlecross plays, written out as note data for the
 * instruments in `voices.ts`. Nothing is sampled and nothing is generated: each
 * piece is composed by hand — a melody, its harmony voiced chord by chord, a
 * bass line — and costs a few thousand numbers.
 *
 * It is a chamber score for an adventure on foot: a solo violin, a string
 * section, a cello, plucked strings and a piano, slow and warm, with hand
 * percussion that enters for a section and leaves again.
 *
 *   town      Hearthlight        F major       3/4   every town
 *   meadow    Sunford Fields     D major       4/4   plains, farmland
 *   wildwood  Whispering Canopy  E dorian      6/8   forest, the ruined town
 *   deep      Hollow Echoes      C aeolian     4/4   cave, mine
 *   ember     Cinder Road        D phrygian    4/4   ash, the rift
 *   frost     Snowbound          B aeolian     3/4   snow, the peak
 *   sanctum   The Silent Nave    G dorian      4/4   temple, the void
 *   bastion   Iron Banner        A aeolian     4/4   fortress, arena
 *   journey   The Long Road      G mixolydian  4/4   the travelling piece: any zone, between passes of its theme
 *   boss      Trial of Blades    D aeolian     4/4   a boss is awake
 *   victory, defeat                                  the result jingles
 *
 * Which zone plays which is `themes.ts`; how they follow each other is
 * `music.ts`. Each song declares its `key`, and every pitched note is either in
 * it or marked (`!` in the notation, `x` on the note): the tests hold the score
 * to that, so a typo cannot ship as a wrong note.
 */

/** What the game asks for: an area's theme, or the boss fight. */
export type TrackId = 'town' | 'meadow' | 'wildwood' | 'deep' | 'ember' | 'frost' | 'sanctum' | 'bastion' | 'boss'
/** Everything that can sound: the tracks, the travelling piece, the two jingles. */
export type SongId = TrackId | 'journey' | 'victory' | 'defeat'
export type SongKind = 'area' | 'travel' | 'boss' | 'jingle'

export interface Song extends Mix {
  id: SongId
  title: string
  kind: SongKind
  /** Quarter notes a minute. A step is a 16th. */
  bpm: number
  bars: number
  /** 16ths in a bar: 16 in 4/4, 12 in 3/4 and 6/8. */
  barSteps: number
  /** Bar a repeat restarts from (the boss skips its intro on repeats). */
  loopBar: number
  /** The scale the song is written in: tonic pitch class and the mode's semitones. */
  key: { tonic: number; mode: readonly number[]; name: string }
  steps: Ev[][]
}

/** Voice every note on one 16th. Called by the sequencer ahead of time. */
export const playStep = (o: Out, song: Song, step: number, t: number, spb: number): void =>
  playEvents(o, song.steps[step], t, spb)

// ─── Notation ───────────────────────────────────────────────────────────────

const PC: Record<string, number> = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 }
const NOTE = /^([A-G][#b]?)(-?\d)(!)?$/
/** 'C4' → 60; a trailing `!` marks a note written outside the key on purpose. */
const pitch = (s: string): { m: number; x: boolean } => {
  const m = NOTE.exec(s)
  if (!m) throw new Error(`bad note ${s}`)
  return { m: 12 * (Number(m[2]) + 1) + PC[m[1]!]!, x: m[3] === '!' }
}
export const note = (s: string): number => pitch(s).m

export const MAJOR = [0, 2, 4, 5, 7, 9, 11]
export const MIXOLYDIAN = [0, 2, 4, 5, 7, 9, 10]
export const DORIAN = [0, 2, 3, 5, 7, 9, 10]
export const AEOLIAN = [0, 2, 3, 5, 7, 8, 10]
export const PHRYGIAN = [0, 1, 3, 5, 7, 8, 10]

const TOKEN = /^(~)?([A-G][#b]?-?\d!?)\/(\d+)([\^,])?$/
const REST = /^-\/(\d+)$/
/** Percussion strokes: the letter picks the stroke (`Ev.p`), its case the weight. */
const STROKES: Partial<Record<Inst, Record<string, number>>> = {
  bongo: { h: 0, l: 1, t: 2, b: 3 },
  frame: { d: 0, k: 1 },
  snare: { s: 0 },
  taiko: { x: 0 }
}

type Dyn = number | readonly [number, number]

class Score {
  readonly steps: Ev[][]
  private readonly rng: Rng

  constructor (readonly bars: number, readonly barSteps = 16, seed = 1) {
    this.steps = Array.from({ length: bars * barSteps }, () => [])
    this.rng = mulberry32(seed)
  }

  add (bar: number, step: number, i: Inst, m: number, len: number, v: number, o: { p?: number; x?: boolean; lead?: boolean } = {}): void {
    const s = bar * this.barSteps + step
    if (s < 0 || s >= this.steps.length) throw new Error(`${i}: step ${s} is outside the song`)
    const e: Ev = { i, m, len, v: Math.max(0.05, Math.min(1, v)) }
    if (o.p !== undefined) e.p = o.p
    if (o.x) e.x = 1
    if (o.lead) e.lead = 1
    this.steps[s]!.push(e)
  }

  /** A player is not a machine: accompaniment figures get a few percent of give. */
  private human (v: number, amt = 0.07): number {
    return v * (1 - amt + this.rng() * amt * 2)
  }

  /**
   * A line from `bar`, one note after another: "A4/4 ~D5/8 C#5!/2^ -/2 | …"
   * — pitch/length in 16ths, `-` a rest, `~` slurred from the note before
   * (bowed voices), `!` outside the key on purpose, `^` accented, `,` eased
   * off. `|` is a bar line: it must fall on one, and the line must end on one,
   * so a miscounted rhythm fails when the song is composed. `v` is the
   * dynamic, or [from, to] for a crescendo / diminuendo over the line.
   */
  line (bar: number, i: Inst, text: string, v: Dyn, o: { oct?: number; lead?: boolean } = {}): void {
    const toks = text.trim().split(/\s+/)
    const total = toks.reduce((n, tok) => n + Number(TOKEN.exec(tok)?.[3] ?? REST.exec(tok)?.[1] ?? 0), 0)
    const [v0, v1] = typeof v === 'number' ? [v, v] : v
    let at = 0
    let prev: number | null = null
    for (const tok of toks) {
      if (tok === '|') {
        if (at % this.barSteps) throw new Error(`${i} bar ${bar}: bar line after ${at} steps in "${text}"`)
        continue
      }
      const rest = REST.exec(tok)
      if (rest) {
        at += Number(rest[1])
        prev = null
        continue
      }
      const t = TOKEN.exec(tok)
      if (!t) throw new Error(`${i} bar ${bar}: bad token "${tok}"`)
      const { m, x } = pitch(t[2]!)
      const mm = m + 12 * (o.oct ?? 0)
      const len = Number(t[3])
      const slur = t[1] === '~' && prev !== null
      if (t[1] === '~' && i !== 'violin' && i !== 'cello') throw new Error(`${i} cannot slur ("${tok}")`)
      const dyn = (v0 + ((v1 - v0) * at) / Math.max(1, total)) * (t[4] === '^' ? 1.18 : t[4] === ',' ? 0.75 : 1)
      this.add(bar, at, i, mm, len, dyn, { p: slur ? prev! : undefined, x, lead: o.lead })
      prev = mm
      at += len
    }
    if (at % this.barSteps) throw new Error(`${i} bar ${bar}: "${text}" is ${at} steps, not whole bars`)
  }

  /** The melody: a `line` marked as the lead. */
  tune (bar: number, i: Inst, text: string, v: Dyn, oct = 0): void {
    this.line(bar, i, text, v, { oct, lead: true })
  }

  /** Notes struck together: "A3 C4 F4". `roll` spreads a piano chord upward (seconds a note). */
  chord (bar: number, step: number, i: Inst, notes: string, len: number, v: number, roll = 0): void {
    notes.trim().split(/\s+/).forEach((n, j) => {
      const { m, x } = pitch(n)
      this.add(bar, step, i, m, len, v, { p: roll ? j * roll : undefined, x })
    })
  }

  /**
   * A broken chord: `order` indexes into `notes`, one note every `every` 16ths
   * from `step`, each ringing `ring` 16ths. The first of each bar leads a little.
   */
  arp (bar: number, step: number, i: Inst, notes: string, order: readonly number[], every: number, ring: number, v: number): void {
    const ps = notes.trim().split(/\s+/).map(pitch)
    order.forEach((k, j) => {
      const { m, x } = ps[k]!
      this.add(bar, step + j * every, i, m, ring, this.human(j === 0 ? v : v * 0.8), { x })
    })
  }

  /** Percussion, a character a 16th: `.` rests, a letter is a stroke (see `STROKES`), capitals are accents. */
  perc (bar: number, i: Inst, pattern: string, v: number, m = 0): void {
    const strokes = STROKES[i]
    if (!strokes) throw new Error(`${i} has no strokes`)
    if (pattern.length % this.barSteps) throw new Error(`${i} bar ${bar}: "${pattern}" is not whole bars`)
    ;[...pattern].forEach((c, s) => {
      if (c === '.') return
      const p = strokes[c.toLowerCase()]
      if (p === undefined) throw new Error(`${i} bar ${bar}: no stroke "${c}"`)
      this.add(bar, s, i, m, 1, this.human(c === c.toLowerCase() ? v * 0.6 : v), { p: i === 'bongo' || i === 'frame' ? p : undefined })
    })
  }

  /** A run down (or up) the toms, a 16th each, growing. */
  toms (bar: number, step: number, pitches: readonly number[], v: number): void {
    pitches.forEach((m, j) => this.add(bar, step + j, 'tom', m, 1, v * (0.75 + (0.25 * j) / Math.max(1, pitches.length - 1))))
  }
}

/** Where each instrument sits; a song overrides what it needs to. */
const CHANS: Record<string, ChanSpec> = {
  violin: { pan: -0.18, send: 0.4 },
  strings: { pan: 0.1, send: 0.45 },
  cello: { pan: 0.22, send: 0.3 },
  pizz: { pan: 0.15, send: 0.3 },
  spicc: { pan: -0.2, send: 0.2 },
  piano: { pan: -0.06, send: 0.3, lp: 5200 },
  celesta: { pan: 0.25, send: 0.5 },
  choir: { send: 0.55 },
  bongo: { pan: 0.3, send: 0.22 },
  frame: { pan: -0.25, send: 0.3 },
  snare: { pan: 0.1, send: 0.3, lp: 5000 },
  tom: { send: 0.3 },
  taiko: { send: 0.3 },
  cym: { send: 0.3 }
}

interface Sheet {
  id: SongId
  title: string
  kind: SongKind
  bpm: number
  loopBar?: number
  gain: number
  key: readonly [tonic: string, mode: readonly number[], name: string]
  reverb: { seconds: number; decay: number }
  chans?: Record<string, ChanSpec>
}

const finish = (S: Score, h: Sheet): Song => ({
  id: h.id,
  title: h.title,
  kind: h.kind,
  bpm: h.bpm,
  bars: S.bars,
  barSteps: S.barSteps,
  loopBar: h.loopBar ?? 0,
  gain: h.gain,
  key: { tonic: PC[h.key[0]]!, mode: h.key[1], name: h.key[2] },
  reverb: h.reverb,
  chans: { ...CHANS, ...h.chans },
  steps: S.steps
})

/** A piano broken chord in 8ths over four notes, low to high and back. */
const ROLL8 = [0, 1, 2, 3, 2, 1, 2, 1]

// ─── "Hearthlight" — the towns. F major, 3/4, 84 BPM ────────────────────────
// A 8 · A' 8 · B 8 · A'' 8 = 32 bars, 68.6 s.
// A waltz at a walking pace: the piano has the tune over a plucked bass that
// steps down the scale (F E D Bb A G C); the strings come in for the repeat,
// the violin takes the middle section, and sings a descant over the last one.

const town = (): Song => {
  const S = new Score(32, 12, 11)
  const pad = [
    'A3 C4 F4', 'G3 C4 E4', 'A3 D4 F4', 'Bb3 D4 F4', 'A3 C4 F4', 'Bb3 D4 G4', 'G3 C4 E4', 'G3 C4 E4',
    'A3 C4 F4', 'G3 C4 E4', 'A3 D4 F4', 'Bb3 D4 F4', 'A3 C4 F4', 'Bb3 D4 G4', 'Bb3 C4 E4', 'A3 C4 F4',
    'Bb3 D4 F4', 'G3 C4 E4', 'A3 C4 E4', 'A3 D4 F4', 'Bb3 D4 F4', 'A3 C4 F4', 'Bb3 D4 G4', 'G3 C4 E4',
    'A3 C4 F4', 'G3 C4 E4', 'A3 D4 F4', 'Bb3 D4 F4', 'A3 C4 F4', 'Bb3 D4 G4', 'Bb3 C4 E4', 'A3 C4 F4'
  ]
  const bass = ('F3 E3 D3 Bb2 A2 G2 C3 C3  F3 E3 D3 Bb2 A2 G2 C3 F2  Bb2 C3 A2 D3 Bb2 A2 G2 C3  F3 E3 D3 Bb2 A2 G2 C3 F2').split(/\s+/)

  S.tune(0, 'piano', 'C5/6 A4/2 C5/4 | E5/4 D5/4 C5/4 | A4/6 F4/2 A4/4 | Bb4/8 D5/4 | C5/6 A4/2 C5/4 | D5/4 Bb4/4 G4/4 | E4/4 G4/4 Bb4/4 | A4/8 G4/4', [0.62, 0.7])
  S.tune(8, 'piano', 'C5/6 A4/2 C5/4 | C5/4 E5/4 G5/4 | F5/6 E5/2 D5/4 | D5/8 Bb4/4 | C5/6 D5/2 C5/4 | Bb4/4 A4/4 G4/4 | G4/8 E4/4 | F4/12', [0.7, 0.78])
  S.tune(16, 'violin', 'F5/8 ~D5/4 | G5/8 ~E5/4 | A5/6 ~G5/2 E5/4 | F5/8 ~D5/4 | D5/4 F5/4 Bb5/4 | A5/8 ~F5/4 | G5/4 Bb5/4 ~A5/4 | ~G5/12', [0.7, 0.85])
  S.tune(24, 'piano', 'C5/6 A4/2 C5/4 | C5/4 E5/4 G5/4 | F5/6 E5/2 D5/4 | D5/8 Bb4/4 | C5/6 D5/2 C5/4 | Bb4/4 A4/4 G4/4 | G4/8 E4/4 | F4/12', [0.82, 0.7])
  // The descant: long notes over the tune, the seventh (Bb) hanging over the
  // dominant and falling to the third of the last chord.
  S.line(24, 'violin', 'A5/12 | G5/12 | F5/12 | F5/8 ~D5/4 | A5/12 | Bb5/24 | ~A5/12', [0.6, 0.5])

  for (let bar = 0; bar < 32; bar++) {
    const sec = bar >> 3
    if (sec === 2) {
      // The middle section: the cello holds the bass, the piano ripples under the violin.
      S.add(bar, 0, 'cello', note(bass[bar]!), 12, 0.6)
      S.arp(bar, 0, 'piano', pad[bar]!, [0, 1, 2, 1, 2, 1], 2, 4, 0.42)
    } else {
      // Oom-pah-pah, quietly: the bass plucked on one, the piano answering on two and three.
      S.add(bar, 0, 'pizz', note(bass[bar]!), 4, 0.8)
      S.chord(bar, 4, 'piano', pad[bar]!, 2, sec === 0 ? 0.32 : 0.36)
      S.chord(bar, 8, 'piano', pad[bar]!, 2, sec === 0 ? 0.28 : 0.32)
      if (sec === 3) S.add(bar, 8, 'pizz', note(pad[bar]!.split(' ')[0]!), 4, 0.45)
    }
    if (sec > 0) S.chord(bar, 0, 'strings', pad[bar]!, 12, sec === 1 ? 0.55 : sec === 2 ? 0.75 : 0.7)
  }
  return finish(S, {
    id: 'town', title: 'Hearthlight', kind: 'area', bpm: 84, gain: 1.03, key: ['F', MAJOR, 'F major'],
    reverb: { seconds: 1.4, decay: 2.2 }
  })
}

// ─── "Sunford Fields" — plains and farmland. D major, 4/4, 80 BPM ───────────
// A 8 · B 8 · A' 8 = 24 bars, 72 s.
// The violin's tune opens on a rising fourth and fifth (A–D–F#) over rolling
// piano arpeggios; the bongos walk in for the middle section and leave again;
// the last section lifts the tune a third and lands it on the tonic.

const meadow = (): Song => {
  const S = new Score(24, 16, 22)
  const harm = 'D A/C# Bm G D/F# G Em A  G A F#m Bm G D/F# Em A  D A/C# Bm G D/F# Em A D'.split(/\s+/)
  const arp: Record<string, string> = {
    D: 'D3 A3 D4 F#4', 'A/C#': 'C#3 A3 C#4 E4', Bm: 'B2 F#3 B3 D4', G: 'G2 D3 G3 B3', 'D/F#': 'F#2 D3 F#3 A3',
    Em: 'E3 B3 E4 G4', A: 'A2 E3 A3 C#4', 'F#m': 'F#2 C#3 F#3 A3'
  }
  const pad = [
    'F#3 A3 D4', 'E3 A3 C#4', 'F#3 B3 D4', 'G3 B3 D4', 'F#3 A3 D4', 'G3 B3 D4', 'G3 B3 E4', 'A3 C#4 E4',
    'B3 D4 G4', 'A3 C#4 E4', 'A3 C#4 F#4', 'B3 D4 F#4', 'B3 D4 G4', 'A3 D4 F#4', 'G3 B3 E4', 'A3 C#4 E4',
    'A3 D4 F#4', 'A3 C#4 E4', 'F#3 B3 D4', 'G3 B3 D4', 'F#3 A3 D4', 'G3 B3 E4', 'A3 C#4 E4', 'A3 D4 F#4'
  ]

  S.tune(0, 'violin', 'A4/4 D5/4 F#5/6 ~E5/2 | E5/8 ~C#5/4 A4/4 | B4/4 D5/4 F#5/6 ~E5/2 | ~D5/12 B4/4 | A4/4 D5/4 F#5/6 ~G5/2 | B5/8 ~A5/4 ~G5/4 | F#5/4 ~E5/4 G5/4 ~E5/4 | E5/12 -/4', [0.62, 0.75])
  S.tune(8, 'violin', 'B5/6 ~A5/2 G5/4 D5/4 | C#5/4 E5/4 A5/8 | A5/6 ~F#5/2 C#5/4 F#5/4 | D5/8 ~B4/4 D5/4 | B5/6 ~A5/2 G5/4 B5/4 | A5/8 ~F#5/4 D5/4 | E5/4 G5/4 B5/6 ~A5/2 | A5/8 ~G5/4 ~E5/4', [0.8, 0.9])
  S.tune(16, 'violin', 'D5/4 F#5/4 A5/6 ~G5/2 | E5/8 ~C#5/4 E5/4 | D5/4 F#5/4 B5/6 ~A5/2 | ~G5/12 D5/4 | A4/4 D5/4 F#5/6 ~G5/2 | B5/8 ~G5/4 ~E5/4 | F#5/4 ~E5/8 C#5/4 | D5/12 -/4', [0.88, 0.7])

  for (let bar = 0; bar < 24; bar++) {
    const sec = bar >> 3
    const h = arp[harm[bar]!]!
    S.arp(bar, 0, 'piano', h, ROLL8, 2, 5, sec === 1 ? 0.46 : 0.43)
    if (bar >= 4) S.chord(bar, 0, 'strings', pad[bar]!, 16, sec === 0 ? 0.5 : sec === 1 ? 0.78 : 0.7)
    if (sec > 0) S.add(bar, 0, 'cello', note(h.split(' ')[0]!), 15, sec === 1 ? 0.62 : 0.55)
    if (sec === 1) S.perc(bar, 'bongo', bar === 15 ? 'H..h..t.L.l.h.tt' : 'H..h..t.L..h..t.', 0.55)
    if (sec === 2) {
      // Plucked chords on two and four where the bongos were.
      const top = pad[bar]!.split(' ').slice(1).join(' ')
      for (const s of [4, 12]) S.chord(bar, s, 'pizz', top, 2, 0.62)
    }
  }
  return finish(S, {
    id: 'meadow', title: 'Sunford Fields', kind: 'area', bpm: 80, gain: 0.9, key: ['D', MAJOR, 'D major'],
    reverb: { seconds: 1.6, decay: 2.1 }
  })
}

// ─── "Whispering Canopy" — forest, the ruined town. E dorian, 6/8, ♩. = 56 ──
// A 8 · A' 8 · B 8 · A'' 8 = 32 bars, 68.6 s.
// Plucked strings turn over a held E; the raised sixth (C#, in the A chord) is
// the forest's colour. The cello takes the middle section's tune low, the
// violin answers, and a frame drum walks under the last third.

const wildwood = (): Song => {
  const S = new Score(32, 12, 33)
  const harm = 'Em A Em A G D Bm Em  Em A Em A G D Bm Em  G D A Em G D A Bm  Em A Em A G D Bm Em'.split(/\s+/)
  const pluck: Record<string, string> = {
    Em: 'E3 B3 E4 G4', A: 'E3 A3 C#4 E4', G: 'G3 B3 D4 G4', D: 'F#3 A3 D4 F#4', Bm: 'F#3 B3 D4 F#4'
  }
  const pad: Record<string, string> = { Em: 'G3 B3 E4', A: 'E3 A3 C#4', G: 'G3 B3 D4', D: 'F#3 A3 D4', Bm: 'F#3 B3 D4' }
  const padB = ['G3 B3 D4', 'F#3 A3 D4', 'E3 A3 C#4', 'G3 B3 E4', 'G3 B3 D4', 'F#3 A3 D4', 'E3 A3 C#4', 'F#3 B3 D4']
  const drone = 'E2 E2 E2 E2 G2 D3 B2 E2'.split(' ')

  const tuneA = 'E5/4 ~F#5/2 G5/6 | F#5/4 ~E5/2 C#5/6 | E5/4 ~F#5/2 G5/4 B5/2 | A5/6 ~E5/6 | D5/4 G5/2 B5/6 | A5/4 ~F#5/2 D5/6 | D5/4 ~C#5/2 B4/6 | E5/12'
  S.tune(0, 'violin', tuneA, [0.6, 0.7])
  S.tune(8, 'violin', 'E5/4 ~F#5/2 G5/6 | F#5/4 ~E5/2 C#5/4 E5/2 | G5/4 ~A5/2 B5/6 | C#6/4 ~B5/2 A5/6 | B5/4 ~A5/2 G5/6 | F#5/4 ~E5/2 D5/6 | D5/4 ~E5/2 F#5/6 | ~E5/12', [0.7, 0.82])
  S.tune(16, 'cello', 'B3/6 ~D4/6 | A3/6 ~F#3/6 | E3/4 A3/2 C#4/6 | ~B3/12', 0.8)
  S.tune(20, 'violin', 'D5/6 ~G5/6 | F#5/4 ~E5/2 D5/6 | E5/4 ~C#5/2 A4/6 | B4/12', [0.78, 0.65])
  S.tune(24, 'violin', tuneA, [0.8, 0.62])
  // The piano only ever answers, high up, where the tune holds its breath.
  for (const bar of [3, 11, 27]) S.line(bar, 'piano', '-/6 E6/2 C#6/2 A5/2', 0.42)
  for (const bar of [7, 15, 31]) S.line(bar, 'piano', '-/4 B5/2 E6/2 B5/2 G5/2', 0.4)
  S.line(19, 'piano', '-/4 B5/2 E6/2 G6/2 E6/2', 0.42)

  for (let bar = 0; bar < 32; bar++) {
    const sec = bar >> 3
    const k = bar & 7
    const h = harm[bar]!
    if (sec === 2) {
      S.arp(bar, 0, 'piano', pluck[h]!, [0, 1, 2, 3, 2, 1], 2, 4, 0.4)
      S.chord(bar, 0, 'strings', padB[k]!, 12, 0.6)
      if (k >= 4) {
        S.add(bar, 0, 'cello', note(['G2', 'D3', 'A2', 'B2'][k - 4]!), 12, 0.6)
        S.perc(bar, 'frame', 'D.....k...d.', 0.6)
      }
    } else {
      S.arp(bar, 0, 'pizz', pluck[h]!, [0, 1, 2, 3, 2, 1], 2, 2, sec === 0 ? 0.5 : 0.56)
      S.add(bar, 0, 'cello', note(drone[k]!), 12, sec === 0 ? 0.5 : 0.6)
      if (sec > 0) S.chord(bar, 0, 'strings', pad[h]!, 12, sec === 1 ? 0.5 : 0.62)
      if (sec === 3 && k < 7) S.perc(bar, 'frame', 'D.....k...d.', 0.55)
    }
  }
  return finish(S, {
    id: 'wildwood', title: 'Whispering Canopy', kind: 'area', bpm: 84, gain: 0.98, key: ['E', DORIAN, 'E dorian'],
    reverb: { seconds: 1.9, decay: 2 },
    chans: { piano: { gain: 1.4, pan: -0.3, send: 0.55, lp: 5200 } }
  })
}

// ─── "Hollow Echoes" — cave and mine. C aeolian, 4/4, 60 BPM ────────────────
// A 8 · B 8 · tag 2 = 18 bars, 72 s.
// Almost nothing: a falling piano figure that the cave gives back twice, each
// chord held for two bars over a cello drone. The cello sings the second half
// against a soft hand drum, a violin a long way off above it.

const deep = (): Song => {
  const S = new Score(18, 16, 44)
  // The echo is written out: each piano note comes back a dotted eighth later, and again, fainter.
  const echoed = (bar: number, text: string, v: number): void => {
    S.tune(bar, 'piano', text, v)
    const bars = text.split('|').length
    for (let b = bar; b < bar + bars; b++) {
      for (let s = 0; s < 16; s++) {
        for (const e of S.steps[b * 16 + s]!.filter(n => n.i === 'piano' && n.lead)) {
          for (const [d, k] of [[3, 0.36], [6, 0.16]] as const) {
            const at = b * 16 + s + d
            if (at < S.steps.length) S.steps[at]!.push({ i: 'piano', m: e.m, len: 3, v: Math.max(0.05, e.v * k) })
          }
        }
      }
    }
  }
  echoed(0, 'G5/4 Eb5/4 C5/8 | -/8 D5/4 Eb5/4 | Ab5/4 Eb5/4 C5/8 | -/8 Bb4/4 C5/4 | F5/4 C5/4 Ab4/8 | -/8 G4/4 Ab4/4 | G4/4 Bb4/4 D5/8 | -/4 D5/4 F5/4 D5/4', 0.6)
  S.tune(8, 'cello', 'C4/8 ~Eb4/8 | Bb3/8 ~G3/8 | Ab3/6 ~G3/2 F3/8 | G3/12 -/4 | C4/8 ~Eb4/8 | D4/6 ~Eb4/2 F4/8 | Eb4/8 ~D4/4 ~C4/4 | ~C4/16', [0.7, 0.8])
  echoed(11, '-/8 G5/4 Eb5/4', 0.45)
  echoed(15, '-/4 G5/4 Eb5/4 C5/4', 0.42)
  echoed(16, 'D5/4 Bb4/4 G4/8 | -/4 G4/4 Bb4/4 D5/4', 0.55)
  // A long way off.
  S.line(12, 'violin', 'Eb5/16 | ~F5/16 | ~G5/32', [0.3, 0.42])

  const pads: Array<[bar: number, bars: number, notes: string, bass: string]> = [
    [0, 2, 'C3 G3 Eb4', 'C2'], [2, 2, 'C3 Ab3 Eb4', 'Ab2'], [4, 2, 'C3 Ab3 F4', 'F2'], [6, 2, 'D3 Bb3 G4', 'G2'],
    [8, 1, 'C3 Ab3 Eb4', 'Ab2'], [9, 1, 'Bb2 G3 Eb4', 'G2'], [10, 1, 'C3 Ab3 F4', 'F2'], [11, 1, 'C3 G3 Eb4', 'Eb2'],
    [12, 1, 'C3 Ab3 Eb4', 'Ab2'], [13, 1, 'D3 F3 Bb3', 'Bb2'], [14, 2, 'C3 G3 Eb4', 'C2'], [16, 2, 'D3 Bb3 G4', 'G2']
  ]
  for (const [bar, bars, notes, bass] of pads) {
    const second = bar >= 8 && bar < 16
    S.chord(bar, 0, 'strings', notes, bars * 16 - 1, second ? 0.62 : 0.5)
    // The drone under the piano; where the cello has the tune, the piano's left hand takes the bass.
    if (second) S.add(bar, 0, 'piano', note(bass), bars * 16, 0.42)
    else S.add(bar, 0, 'cello', note(bass), bars * 16 - 1, 0.5)
  }
  for (let bar = 8; bar < 16; bar++) S.perc(bar, 'frame', 'D.........d.k...', 0.5)
  return finish(S, {
    id: 'deep', title: 'Hollow Echoes', kind: 'area', bpm: 60, gain: 1.29, key: ['C', AEOLIAN, 'C minor'],
    reverb: { seconds: 2.4, decay: 1.7 },
    chans: { piano: { pan: -0.1, send: 0.7, lp: 4200 }, strings: { pan: 0.1, send: 0.6, lp: 1700 }, frame: { pan: -0.25, send: 0.55 }, violin: { pan: 0.3, send: 0.8 } }
  })
}

// ─── "Cinder Road" — the ash crags, the rift. D phrygian, 4/4, 76 BPM ───────
// A 8 · B 8 · A' 8 = 24 bars, 75.8 s.
// The cello never stops: eighths on the root and fifth, leaning 3+3+2. Over it
// the violin's tune keeps touching the flat second (Eb) and falling back to D.
// The middle section opens out to Bb and F with bongos; the drums come back
// for the end of the reprise.

const ember = (): Song => {
  const S = new Score(24, 16, 55)
  const harm = 'Dm Dm Eb Dm Gm Eb Cm Dm  Bb F Gm Dm Bb Cm Eb Eb  Dm Dm Eb Dm Gm Eb Cm Dm'.split(/\s+/)
  const root: Record<string, string> = { Dm: 'D2', Eb: 'Eb2', Gm: 'G2', Cm: 'C2', Bb: 'Bb2', F: 'F2' }
  const padA = ['A3 D4 F4', 'A3 D4 F4', 'Bb3 Eb4 G4', 'A3 D4 F4', 'Bb3 D4 G4', 'Bb3 Eb4 G4', 'C4 Eb4 G4', 'A3 D4 F4']
  const padB = ['Bb3 D4 F4', 'A3 C4 F4', 'Bb3 D4 G4', 'A3 D4 F4', 'Bb3 D4 F4', 'G3 C4 Eb4', 'G3 Bb3 Eb4', 'G3 Bb3 Eb4']
  const tuneA = 'A4/4 D5/8 ~Eb5/2 ~D5/2 | F5/8 ~D5/8 | G5/6 ~F5/2 ~Eb5/8 | ~D5/12 -/4 | Bb4/4 D5/8 ~Eb5/2 ~D5/2 | G5/8 ~Bb5/8 | G5/6 ~F5/2 ~Eb5/4 C5/4 | D5/12 -/4'

  S.tune(0, 'violin', tuneA, [0.65, 0.78])
  S.tune(8, 'violin', 'F5/8 ~D5/4 F5/4 | A5/8 ~F5/8 | G5/6 ~A5/2 ~Bb5/8 | ~A5/12 -/4 | F5/8 ~D5/4 F5/4 | G5/8 ~Eb5/4 G5/4 | G5/4 ~Bb5/12 | A5/4^ ~G5/4 ~F5/4 ~Eb5/4', [0.8, 0.95])
  S.tune(16, 'violin', tuneA, [0.9, 0.8])
  // The reprise: the piano doubles the tune an octave down, softly.
  S.tune(16, 'piano', tuneA.replace(/~/g, ''), 0.5, -1)

  for (let bar = 0; bar < 24; bar++) {
    const sec = bar >> 3
    const k = bar & 7
    const r = note(root[harm[bar]!]!)
    const v = sec === 0 ? 0.62 : sec === 1 ? 0.55 : 0.72
    ;[0, 0, 7, 0, 0, 7, 0, 7].forEach((d, j) => S.add(bar, j * 2, 'cello', r + d, 2, j === 0 || j === 3 || j === 6 ? v : v * 0.62))
    S.chord(bar, 0, 'piano', `${root[harm[bar]!]} ${root[harm[bar]!]!.replace('2', '3')}`, 8, sec === 1 ? 0.45 : 0.5)
    const pad = sec === 1 ? padB[k]! : padA[k]!
    if (sec > 0 || k >= 4) S.chord(bar, 0, 'strings', pad, 16, sec === 0 ? 0.55 : sec === 1 ? 0.8 : 0.72)
    if (sec === 1) {
      S.chord(bar, 8, 'piano', pad, 4, 0.36)
      S.perc(bar, 'bongo', 'L..h..H.L..h.tH.', 0.48)
    }
    if (sec === 2 && k >= 4) {
      S.perc(bar, 'bongo', 'L..h..H.L..h.tH.', 0.52)
      S.perc(bar, 'taiko', 'X...............', 1, 38)
    }
  }
  S.add(7, 0, 'cym', 0, 16, 0.6)
  S.toms(15, 12, [50, 48, 45, 43], 1)
  return finish(S, {
    id: 'ember', title: 'Cinder Road', kind: 'area', bpm: 76, gain: 0.86, key: ['D', PHRYGIAN, 'D phrygian'],
    reverb: { seconds: 1.7, decay: 2.1 },
    chans: { cello: { gain: 1.5, pan: 0.15, send: 0.18 }, strings: { pan: 0.1, send: 0.4, lp: 2000 } }
  })
}

// ─── "Snowbound" — the tundra, the peak. B aeolian, 3/4, 66 BPM ─────────────
// A 8 · B 8 · A' 8 = 24 bars, 65.5 s.
// One violin, high and alone, over a piano that tolls a note a beat like bells
// across a valley (root, fifth, tenth — wide open). No drums at all. The
// strings only arrive for the middle section, and stay.

const frost = (): Song => {
  const S = new Score(24, 12, 66)
  const harm = 'Bm G D A Bm G Em F#m  G A D Bm Em G F#m F#m  Bm G D A Bm G F#m Bm'.split(/\s+/)
  const bells: Record<string, string> = {
    Bm: 'B3 F#4 D5', G: 'G3 D4 B4', D: 'D3 A3 F#4', A: 'A3 E4 C#5', Em: 'E3 B3 G4', 'F#m': 'F#3 C#4 A4'
  }
  const pad = [
    '', '', '', '', '', '', '', '',
    'B3 D4 G4', 'A3 C#4 E4', 'A3 D4 F#4', 'B3 D4 F#4', 'B3 E4 G4', 'B3 D4 G4', 'A3 C#4 F#4', 'A3 C#4 F#4',
    'B3 D4 F#4', 'B3 D4 G4', 'A3 D4 F#4', 'A3 C#4 E4', 'F#3 B3 D4', 'G3 B3 D4', 'A3 C#4 F#4', 'B3 D4 F#4'
  ]
  const bass = '- - - - - - - -  G2 A2 D3 B2 E2 G2 F#2 F#2  B2 G2 D3 A2 B2 G2 F#2 B2'.split(/\s+/)

  S.tune(0, 'violin', 'F#5/8 ~B5/4 | B5/8 ~A5/2 ~G5/2 | ~F#5/8 A5/4 | ~E5/12 | F#5/8 ~B5/4 | D6/8 ~B5/4 | B5/8 ~G5/4 | ~F#5/12', [0.6, 0.72])
  S.tune(8, 'violin', 'D5/4 G5/4 B5/4 | C#6/8 ~A5/4 | D6/8 ~A5/4 | ~B5/12 | G5/4 B5/4 E6/4 | ~D6/8 ~B5/4 | C#6/8 ~A5/4 | ~F#5/12', [0.75, 0.85])
  S.tune(16, 'violin', 'F#5/8 ~B5/4 | B5/8 ~A5/2 ~G5/2 | ~F#5/8 A5/4 | ~E5/12 | F#5/8 ~B5/4 | D6/8 ~B5/4 | C#6/8 ~A5/4 | ~B5/12', [0.8, 0.6])

  for (let bar = 0; bar < 24; bar++) {
    const sec = bar >> 3
    const h = bells[harm[bar]!]!
    S.arp(bar, 0, 'piano', h, [0, 1, 2], 4, 8, sec === 1 ? 0.64 : 0.58)
    // A celesta doubles the top bell an octave up: every other bar at first, then every bar.
    if (sec > 0 || bar % 2 === 0) S.add(bar, 8, 'celesta', note(h.split(' ')[2]!) + 12, 6, sec === 0 ? 0.3 : 0.4)
    if (pad[bar]) {
      S.chord(bar, 0, 'strings', pad[bar]!, 12, sec === 1 ? 0.68 : 0.6)
      S.add(bar, 0, 'cello', note(bass[bar]!), 12, 0.55)
    }
  }
  return finish(S, {
    id: 'frost', title: 'Snowbound', kind: 'area', bpm: 66, gain: 0.9, key: ['B', AEOLIAN, 'B minor'],
    reverb: { seconds: 2.2, decay: 1.8 },
    chans: { violin: { pan: -0.15, send: 0.6, lp: 4200 }, piano: { pan: 0.1, send: 0.55, lp: 6000 } }
  })
}

// ─── "The Silent Nave" — the temple, the void. G dorian, 4/4, 63 BPM ────────
// A 6 · B 6 · A' 6 = 18 bars, 68.6 s.
// Six-bar phrases, like a chant. A choir holds each chord over a cello pedal
// while the piano tolls and steps out the plainsong; the violin sings the
// middle verse low on its strings; the last verse closes on a bare fifth.

const sanctum = (): Song => {
  const S = new Score(18, 16, 77)
  const voices = [
    'D4 G4 Bb4', 'E4 G4 C5', 'D4 G4 Bb4', 'D4 F4 Bb4', 'C4 F4 A4', 'D4 G4 Bb4',
    'D4 F4 Bb4', 'C4 F4 A4', 'C4 E4 G4', 'Bb3 D4 G4', 'A3 D4 F4', 'A3 D4 F4',
    'D4 G4 Bb4', 'E4 G4 C5', 'D4 G4 Bb4', 'D4 F4 Bb4', 'C4 F4 A4 | C4 E4 G4', 'D4 G4'
  ]
  const bass = 'G2 G2 G2 Bb2 F2 G2  Bb2 F2 C3 G2 D3 D3  G2 G2 G2 Bb2 F2 G2'.split(/\s+/)
  const slow: Record<string, string> = { Bb2: 'Bb2 F3 D4 F4', F2: 'F2 C3 A3 C4', C3: 'C3 G3 E4 G4', G2: 'G2 D3 Bb3 D4', D3: 'D3 A3 F4 A4' }

  S.tune(0, 'piano', 'G4/8 D5/8 | E5/8 C5/8 | D5/8 Bb4/8 | D5/8 F5/8 | C5/8 A4/8 | G4/16', 0.62)
  S.tune(6, 'violin', 'D5/8 ~F5/4 ~D5/4 | C5/8 ~A4/8 | E5/6 ~D5/2 ~C5/4 E5/4 | ~D5/12 -/4 | F5/6 ~E5/2 ~D5/4 A4/4 | A4/12 -/4', [0.7, 0.8])
  S.tune(12, 'piano', 'G4/8 D5/8 | E5/8 C5/8 | D5/8 Bb4/8 | D5/8 F5/8 | C5/8 G4/8 | G4/16', 0.7)
  S.line(12, 'violin', 'D5/16 | ~E5/16 | ~D5/8 ~G5/8 | ~F5/16 | F5/8 ~E5/8 | ~D5/16', [0.55, 0.45])

  for (let bar = 0; bar < 18; bar++) {
    const sec = Math.floor(bar / 6)
    const halves = voices[bar]!.split(' | ')
    halves.forEach((c, j) => {
      const len = 16 / halves.length
      // The choir sings the outer verses and the end of the middle one, and
      // breathes before each chord; the strings carry the rest.
      if (sec !== 1 || bar >= 10) S.chord(bar, j * len, 'choir', c, len - 3, sec === 0 ? 0.66 : 0.8)
      else S.chord(bar, j * len, 'strings', c, len, 0.7)
    })
    // The bass moves with the harmony: the one bar with two chords (F, then C) has two bass notes.
    const low = halves.length === 2 ? [bass[bar]!, 'C3'] : [bass[bar]!]
    low.forEach((b, j) => {
      const len = 16 / low.length
      S.add(bar, j * len, 'cello', note(b), len, sec === 1 ? 0.6 : 0.5)
      // The toll: the bass in octaves, let ring.
      if (sec !== 1) S.chord(bar, j * len, 'piano', `${b} ${b.replace(/\d/, d => String(Number(d) + 1))}`, len, 0.5)
    })
    if (sec === 1) S.arp(bar, 0, 'piano', slow[bass[bar]!]!, [0, 1, 2, 3], 4, 7, 0.42)
    if (sec > 0 && bar % 2 === 0) S.perc(bar, 'taiko', 'X...............', 0.85, 33)
  }
  S.add(11, 0, 'cym', 0, 16, 0.5)
  return finish(S, {
    id: 'sanctum', title: 'The Silent Nave', kind: 'area', bpm: 63, gain: 0.92, key: ['G', DORIAN, 'G dorian'],
    reverb: { seconds: 2.6, decay: 1.6 },
    chans: { choir: { send: 0.7 }, piano: { pan: -0.06, send: 0.6, lp: 4600 }, violin: { pan: -0.18, send: 0.55 }, taiko: { send: 0.6 } }
  })
}

// ─── "Iron Banner" — fortress and arena. A aeolian, 4/4, 88 BPM ─────────────
// A 8 · B 8 · A' 8 = 24 bars, 65.5 s.
// A march. The violin's tune is all dotted rhythm (long–short–LONG) over a
// cello stepping in quarter notes; a field drum joins halfway through the
// first strain. The middle strain turns to C major and drops the drums; a
// roll brings them back, with the raised leading tone (G#) for the cadence.

const bastion = (): Song => {
  const S = new Score(24, 16, 88)
  const harm = 'Am Am F G Am Dm F|G Am  C G Am Em F C Dm E  Am Am F G Am Dm E Am'.split(/\s+/)
  const pad = [
    'A3 C4 E4', 'A3 C4 E4', 'A3 C4 F4', 'B3 D4 G4', 'C4 E4 A4', 'D4 F4 A4', 'C4 F4 A4 | B3 D4 G4', 'A3 C4 E4',
    'G3 C4 E4', 'G3 B3 D4', 'E3 A3 C4', 'G3 B3 E4', 'A3 C4 F4', 'G3 C4 E4', 'A3 D4 F4', 'G#3! B3 E4',
    'A3 C4 E4', 'A3 C4 E4', 'A3 C4 F4', 'B3 D4 G4', 'C4 E4 A4', 'D4 F4 A4', 'B3 E4 G#4!', 'C4 E4 A4'
  ]
  const step: Record<string, string> = {
    Am: 'A2 A2 E2 A2', F: 'F2 F2 C3 F2', G: 'G2 G2 D3 G2', Dm: 'D3 D3 A2 D3', 'F|G': 'F2 F2 G2 G2', E: 'E2 E2 B2 E2'
  }
  const arp: Record<string, string> = {
    C: 'C3 G3 C4 E4', G: 'G2 D3 G3 B3', Am: 'A2 E3 A3 C4', Em: 'E3 B3 E4 G4', F: 'F2 C3 F3 A3', Dm: 'D3 A3 D4 F4', E: 'E2 B2 E3 G#3!'
  }
  const head = 'A4/3^ A4/1 E5/8 D5/2 C5/2 | C5/3^ B4/1 A4/8 -/4 | A4/3^ A4/1 F5/8 E5/2 D5/2 | D5/3^ C5/1 B4/8 D5/4 | E5/3^ E5/1 A5/8 G5/2 E5/2 | F5/3^ E5/1 D5/8 F5/4'

  S.tune(0, 'violin', `${head} | A5/8 ~G5/4 D5/4 | E5/12 -/4`, [0.68, 0.8])
  S.tune(8, 'violin', 'E5/8 ~G5/4 ~E5/4 | D5/8 ~B4/4 D5/4 | C5/8 ~E5/4 A5/4 | ~G5/12 E5/4 | A5/8 ~F5/4 A5/4 | G5/8 ~E5/4 ~C5/4 | D5/4 F5/4 A5/8 | G#5!/8 ~E5/8', [0.7, 0.85])
  S.tune(16, 'violin', `${head} | E5/4 G#5!/4 B5/8 | ~A5/12 -/4`, [0.9, 0.95])

  for (let bar = 0; bar < 24; bar++) {
    const sec = bar >> 3
    const k = bar & 7
    const h = harm[bar]!
    const halves = pad[bar]!.split(' | ')
    if (sec > 0 || k >= 4) halves.forEach((c, j) => S.chord(bar, (j * 16) / halves.length, 'strings', c, 16 / halves.length, sec === 0 ? 0.55 : 0.72))
    if (sec === 1) {
      // The trio: the cello holds, the piano flows.
      S.add(bar, 0, 'cello', note(arp[h]!.split(' ')[0]!.replace('!', '')), 15, 0.6)
      S.arp(bar, 0, 'piano', arp[h]!, ROLL8, 2, 4, 0.46)
    } else {
      const walk = step[h]!.split(' ')
      walk.forEach((n, j) => S.add(bar, j * 4, 'cello', note(n), 3, j % 2 === 0 ? 0.72 : 0.58))
      // The piano on the off-beats; in the reprise its left hand doubles the march in octaves.
      for (const [s, c] of [[4, halves[0]!], [12, halves[halves.length - 1]!]] as const) S.chord(bar, s, 'piano', c, 2, sec === 0 ? 0.42 : 0.5)
      if (sec === 2) for (const j of [0, 2]) S.chord(bar, j * 4, 'piano', `${walk[j]} ${walk[j]!.replace(/\d/, d => String(Number(d) + 1))}`, 3, 0.5)
    }
    if ((sec === 0 && k >= 4) || sec === 2) S.perc(bar, 'snare', 'S...s.ssS...s.ss', sec === 0 ? 0.45 : 0.6)
    if (sec === 2) S.perc(bar, 'taiko', 'X.......x.......', 0.9, 38)
  }
  // The roll back into the march.
  for (let s = 0; s < 16; s++) S.add(15, s, 'snare', 0, 1, 0.25 + 0.04 * s)
  return finish(S, {
    id: 'bastion', title: 'Iron Banner', kind: 'area', bpm: 88, gain: 0.91, key: ['A', AEOLIAN, 'A minor'],
    reverb: { seconds: 1.6, decay: 2.1 }
  })
}

// ─── "The Long Road" — the travelling piece. G mixolydian, 4/4, 72 BPM ──────
// intro 2 · A 8 · B 8 · outro 2 = 20 bars, 66.7 s.
// What plays between two passes of a zone's own theme, wherever the hero is:
// neither glad nor grim (the flat seventh, F, keeps it from settling). A piano
// figure that walks; the violin's tune over it; bongos for the second half.

const journey = (): Song => {
  const S = new Score(20, 16, 99)
  const harm = 'G G  G F C G Em C F G  C G/B Am Em F C Dm Dm  G G'.split(/\s+/)
  const walk: Record<string, string> = {
    G: 'G2 D3 G3 B3', F: 'F2 C3 F3 A3', C: 'C3 G3 C4 E4', Em: 'E2 B2 E3 G3', Am: 'A2 E3 A3 C4', Dm: 'D3 A3 D4 F4', 'G/B': 'B2 G3 B3 D4'
  }
  const pad = [
    '', '', '', '', '', '', 'G3 B3 E4', 'G3 C4 E4', 'A3 C4 F4', 'B3 D4 G4',
    'G3 C4 E4', 'G3 B3 D4', 'E3 A3 C4', 'G3 B3 E4', 'A3 C4 F4', 'G3 C4 E4', 'A3 D4 F4', 'A3 D4 F4', 'B3 D4 G4', ''
  ]

  S.tune(2, 'violin', 'B4/4 D5/4 G5/6 ~E5/2 | F5/8 ~C5/4 A4/4 | E5/6 ~D5/2 ~C5/4 E5/4 | ~D5/12 -/4 | B4/4 E5/4 G5/6 ~E5/2 | G5/8 ~E5/4 ~C5/4 | A4/4 C5/4 F5/6 ~E5/2 | ~D5/12 -/4', [0.62, 0.74])
  S.tune(10, 'violin', 'G5/8 ~E5/4 G5/4 | B5/8 ~G5/4 ~D5/4 | C5/4 E5/4 A5/8 | ~G5/12 -/4 | A5/6 ~G5/2 ~F5/4 A5/4 | G5/8 ~E5/8 | F5/4 ~E5/4 ~D5/4 F5/4 | D5/8 ~E5/4 ~F5/4', [0.76, 0.86])
  S.tune(18, 'violin', 'G5/16', 0.7)

  for (let bar = 0; bar < 20; bar++) {
    const second = bar >= 10 && bar < 18
    const edge = bar < 2 || bar >= 18
    S.arp(bar, 0, 'piano', walk[harm[bar]!]!, ROLL8, 2, 5, edge || second ? 0.46 : 0.42)
    if (pad[bar]) S.chord(bar, 0, 'strings', pad[bar]!, bar === 18 ? 28 : 16, second ? 0.74 : 0.58)
    if (second || bar === 18) S.add(bar, 0, 'cello', note(walk[harm[bar]!]!.split(' ')[0]!), bar === 18 ? 28 : 15, 0.58)
    if (second) S.perc(bar, 'bongo', bar === 17 ? 'H.....h.L..lh.t.' : 'H.....h.L...h...', 0.5)
  }
  return finish(S, {
    id: 'journey', title: 'The Long Road', kind: 'travel', bpm: 72, gain: 1.05, key: ['G', MIXOLYDIAN, 'G mixolydian'],
    reverb: { seconds: 1.7, decay: 2.1 }
  })
}

// ─── "Trial of Blades" — a boss is awake. D aeolian, 4/4, 112 BPM ───────────
// intro 4 (once) · A 8 · B 8 · C (breakdown + build) 8 · A' 8 = 36 bars, 77 s;
// repeats from A (68.6 s), so a long fight never hears the intro twice.
// Strings gallop in 16ths on the root, fifth and octave; the piano hammers the
// theme in octaves over taiko leaning 3+3+2. The violin soars over B, C drops
// to a choir and a pulse and builds back, and the reprise has everyone.

const boss = (): Song => {
  const S = new Score(36, 16, 111)
  const harm = ('Dm Dm Dm A  Dm Dm Bb C Dm Dm Bb A  Gm Dm Bb F Gm Dm Bb A  Bb C Dm Dm Bb C A A  ' +
    'Dm Dm Bb C Dm F Gm|A Dm').split(/\s+/)
  const root: Record<string, string> = { Dm: 'D3', A: 'A2', Bb: 'Bb2', C: 'C3', Gm: 'G2', F: 'F2' }
  const pad: Record<string, string> = {
    // The dominant is voiced as A7 without its root (the gallop has it): no parallel fifths out of Bb.
    Dm: 'A3 D4 F4', A: 'G3 C#4! E4', Bb: 'Bb3 D4 F4', C: 'G3 C4 E4', Gm: 'Bb3 D4 G4', F: 'A3 C4 F4'
  }
  const sung = ['D4 F4 Bb4', 'E4 G4 C5', 'D4 F4 A4', 'D4 F4 A4', 'D4 F4 Bb4', 'E4 G4 C5', 'E4 A4 C#5!', 'E4 A4 C#5!']
  // Octaves and fifths only, so the gallop sits under every chord, major or minor.
  const GALLOP = [0, 0, 12, 0, 7, 0, 12, 0, 0, 0, 12, 0, 7, 12, 7, 12]
  const gallop = (bar: number, v: number): void => {
    const hs = harm[bar]!.split('|')
    GALLOP.forEach((d, s) => {
      const r = note(root[hs[Math.floor((s * hs.length) / 16)]!]!)
      S.add(bar, s, 'spicc', r + d, 1, s % 4 === 0 ? v : v * 0.6)
    })
  }
  const chords = (bar: number, v: number): void => {
    const hs = harm[bar]!.split('|')
    hs.forEach((h, j) => S.chord(bar, (j * 16) / hs.length, 'strings', pad[h]!, 16 / hs.length, v))
  }
  /** The piano's left hand: the root in octaves, on the taiko's 3+3+2. */
  const hammer = (bar: number, v: number): void => {
    const hs = harm[bar]!.split('|')
    for (const s of [0, 6, 12]) {
      const r = root[hs[Math.floor((s * hs.length) / 16)]!]!
      // The weight is in the low note; the octave above only colours it.
      S.add(bar, s, 'piano', note(r) - 12, 2, s === 0 ? v : v * 0.8)
      S.add(bar, s, 'piano', note(r), 2, 0.5)
    }
  }
  const theme = 'D5/3^ D5/1 F5/4 E5/2 D5/2 A4/4 | D5/3^ D5/1 F5/4 G5/2 F5/2 E5/4 | D5/3^ D5/1 F5/4 Bb5/8 | G5/4 E5/4 C5/4 E5/4 | D5/3^ D5/1 F5/4 E5/2 D5/2 A4/4'
  const themeA = `${theme} | D5/3^ D5/1 A5/4 G5/2 F5/2 E5/4 | F5/4 D5/4 Bb4/4 D5/4 | C#5!/8 E5/4 A5/4`
  const themeEnd = `${theme} | C5/3^ C5/1 F5/4 A5/8 | Bb5/4 G5/4 A5/4 E5/4 | D5/12 -/4`

  // Intro: a blow, the room, the gallop arriving.
  S.perc(0, 'taiko', 'X...............', 1, 38)
  S.chord(0, 0, 'piano', 'D2 D3', 16, 0.9)
  S.chord(0, 0, 'strings', pad.Dm!, 32, 0.8)
  S.perc(1, 'taiko', 'X.......X.......', 0.8, 38)
  gallop(2, 0.5)
  S.perc(2, 'taiko', 'X.....x.X.....x.', 0.8, 38)
  S.chord(2, 0, 'strings', pad.Dm!, 16, 0.7)
  gallop(3, 0.72)
  chords(3, 0.8)
  S.perc(3, 'taiko', 'x.x.x.x.xxxxXXXX', 0.85, 38)
  S.add(3, 0, 'cym', 0, 16, 0.9)

  // A (4–11): the theme in the piano, in octaves.
  S.tune(4, 'piano', themeA, 0.85)
  S.line(4, 'piano', themeA, 0.6, { oct: -1 })
  // B (12–19): the violin, long-breathed, over the same gallop.
  S.tune(12, 'violin', 'Bb5/8 ~A5/4 ~G5/4 | A5/12 ~F5/4 | D5/4 F5/4 Bb5/8 | ~A5/16 | Bb5/8 ~A5/4 ~G5/4 | F5/8 ~A5/4 D6/4 | ~D6/8 ~Bb5/8 | A5/8 ~E5/8', [0.85, 1])
  // C (20–27): the cello alone under the choir, then the violin climbing F–G–A into the reprise.
  S.tune(20, 'cello', 'D3/8 ~F3/8 | E3/8 ~G3/8 | F3/8 ~A3/8 | ~D3/16', 0.85)
  S.tune(24, 'violin', 'F5/16 | ~G5/16 | ~A5/32', [0.6, 0.95])
  // A' (28–35): theme again, the violin on top of the piano.
  S.tune(28, 'piano', themeEnd, 0.9)
  S.line(28, 'violin', themeEnd, 0.85)

  for (let bar = 4; bar < 36; bar++) {
    const sec = bar < 12 ? 'A' : bar < 20 ? 'B' : bar < 28 ? 'C' : 'A2'
    const k = (bar - 4) & 7
    if (sec === 'C') {
      S.chord(bar, 0, 'choir', sung[k]!, 16, 0.6 + 0.04 * k)
      const r = root[harm[bar]!]!
      S.chord(bar, 0, 'piano', `${r.replace(/\d/, d => String(Number(d) - 1))} ${r}`, 12, 0.8)
      if (k < 4) S.perc(bar, 'taiko', 'X...............', 0.8, 38)
      else {
        gallop(bar, 0.35 + 0.14 * (k - 4))
        S.perc(bar, 'taiko', k < 6 ? 'X...x...X...x...' : k === 6 ? 'X.x.X.x.X.x.X.x.' : 'XxxxXxxxXxxxXXXX', 0.55 + 0.1 * (k - 4), 38)
      }
      continue
    }
    gallop(bar, sec === 'B' ? 0.72 : 0.85)
    chords(bar, sec === 'A' ? 0.62 : 0.78)
    if (sec === 'B') {
      S.perc(bar, 'taiko', 'X.......X..x....', 0.75, 38)
      S.chord(bar, 0, 'piano', `${root[harm[bar]!]!.replace(/\d/, d => String(Number(d) - 1))} ${root[harm[bar]!]}`, 8, 0.7)
    } else {
      hammer(bar, 0.8)
      S.perc(bar, 'taiko', 'X..x..X.X..x..X.', 0.9, 38)
      if (sec === 'A2') S.perc(bar, 'snare', '....S.......S...', 0.7)
    }
  }
  S.toms(11, 12, [57, 53, 50, 45], 0.8)
  S.toms(19, 8, [62, 60, 57, 55, 53, 50, 48, 45], 0.8)
  S.add(26, 0, 'cym', 0, 32, 1)
  for (let s = 8; s < 16; s++) S.add(27, s, 'snare', 0, 1, 0.3 + 0.07 * (s - 8))
  S.toms(35, 12, [57, 53, 50, 45], 0.8)
  return finish(S, {
    id: 'boss', title: 'Trial of Blades', kind: 'boss', bpm: 112, loopBar: 4, gain: 0.68, key: ['D', AEOLIAN, 'D minor'],
    reverb: { seconds: 1.8, decay: 2 },
    chans: { piano: { gain: 0.72, pan: -0.06, send: 0.22, lp: 6000 }, strings: { gain: 1.3, pan: 0.1, send: 0.4 }, spicc: { gain: 1.3, pan: -0.2, send: 0.2 } }
  })
}

// ─── The result jingles ─────────────────────────────────────────────────────
// Two bars each, played once: strings and piano, like everything else.

/** IV – V – I in D major: the violin climbs to the tonic and holds it. */
const victory = (): Song => {
  const S = new Score(2, 16, 5)
  S.tune(0, 'violin', 'G5/3 G5/1 B5/4 A5/3 A5/1 C#6/4 | ~D6/14 -/2', [0.8, 0.95])
  S.line(0, 'piano', 'G3/2 D4/2 G4/2 B4/2 A3/2 E4/2 A4/2 C#5/2', [0.5, 0.66])
  S.chord(0, 0, 'strings', 'B3 D4 G4', 6, 0.75)
  S.chord(0, 8, 'strings', 'A3 C#4 E4', 6, 0.8)
  S.add(0, 0, 'pizz', note('G2'), 4, 0.8)
  S.add(0, 8, 'pizz', note('A2'), 4, 0.8)
  S.add(0, 0, 'cym', 0, 16, 0.5)
  S.chord(1, 0, 'strings', 'A3 D4 F#4', 14, 0.9)
  S.chord(1, 0, 'piano', 'D3 A3 F#4 D5', 14, 0.7, 0.035)
  S.add(1, 0, 'cello', note('D2'), 14, 0.8)
  S.perc(1, 'taiko', 'X...............', 0.6, 38)
  return finish(S, {
    id: 'victory', title: 'Victory', kind: 'jingle', bpm: 96, gain: 0.82, key: ['D', MAJOR, 'D major'],
    reverb: { seconds: 1.8, decay: 2.1 }
  })
}

/** iv – V – i in D minor: the violin sighs down the scale and the bass settles under it. */
const defeat = (): Song => {
  const S = new Score(2, 16, 6)
  S.tune(0, 'violin', 'A5/4 ~G5/4 ~F5/4 ~E5/4 | ~D5/14 -/2', [0.8, 0.6])
  S.chord(0, 0, 'strings', 'Bb3 D4 G4', 8, 0.75)
  S.chord(0, 8, 'strings', 'A3 C#4! E4', 8, 0.7)
  S.add(0, 0, 'cello', note('G2'), 8, 0.7)
  S.add(0, 8, 'cello', note('A2'), 8, 0.7)
  S.chord(1, 0, 'strings', 'A3 D4 F4', 14, 0.7)
  S.chord(1, 0, 'piano', 'D2 D3 A3', 14, 0.6, 0.03)
  S.add(1, 0, 'cello', note('D2'), 14, 0.7)
  return finish(S, {
    id: 'defeat', title: 'Defeat', kind: 'jingle', bpm: 66, gain: 1.07, key: ['D', AEOLIAN, 'D minor'],
    reverb: { seconds: 2, decay: 2 }
  })
}

// ─── Registry ───────────────────────────────────────────────────────────────

const COMPOSE: Record<SongId, () => Song> = { town, meadow, wildwood, deep, ember, frost, sanctum, bastion, journey, boss, victory, defeat }

/** Every song there is, in the order the table at the top lists them. */
export const SONG_IDS = Object.keys(COMPOSE) as SongId[]

const cache = new Map<SongId, Song>()

/** The song, composed on first use (a few ms) and kept. */
export const getSong = (id: SongId): Song => {
  const hit = cache.get(id)
  if (hit) return hit
  // An id the score does not have (a stale caller) plays the town theme: music never takes the scene down.
  const s = (COMPOSE[id] ?? town)()
  cache.set(id, s)
  return s
}

/** Seconds in one 16th. */
export const stepSeconds = (s: Song): number => 60 / s.bpm / 4

/** Length of one pass through a song, in seconds. */
export const songSeconds = (s: Song): number => s.steps.length * stepSeconds(s)

/** A result jingle, scheduled whole (it is two bars). Returns its output and how long it sounds. */
export const playJingleNotes = (ctx: BaseAudioContext, dest: AudioNode, kind: 'victory' | 'defeat'): { out: Out; seconds: number } => {
  const s = getSong(kind)
  const out = makeOut(ctx, dest, s)
  const spb = stepSeconds(s)
  const t0 = ctx.currentTime + 0.05
  s.steps.forEach((_, i) => playStep(out, s, i, t0 + i * spb, spb))
  return { out, seconds: songSeconds(s) + s.reverb.seconds }
}
