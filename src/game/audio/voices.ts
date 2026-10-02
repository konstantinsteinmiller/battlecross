import { mulberry32 } from '../sim/rng'

/**
 * ─── The orchestra ───────────────────────────────────────────────────────────
 *
 * The instruments the score (`songs.ts`) is written for, and the output graph
 * they play into. Nothing is sampled: every voice is a few oscillators and
 * envelopes built on whatever AudioContext it is handed — the shared one in
 * play, an OfflineAudioContext when a tool renders a song to measure it.
 *
 * It is a small chamber group, because that is what the game sounds like: a
 * solo violin, a string section, a cello, plucked strings, a piano, and hand
 * percussion that comes and goes. The boss fight adds short bowed strings, a
 * choir and the big drums.
 *
 * THE BUDGET. A mid-range phone has to voice this next to the game. The cost
 * of a song is its number of live oscillators, so every voice here is one or
 * two of them, the things a note can share are shared per song (`o.shared`: a
 * body-resonance bank, a vibrato LFO), and every voice stops its sources as
 * soon as its release is inaudible. `tests/game/musicRotation.test.ts` plays
 * every song through a counting context and holds the area themes to
 * `OSC_BUDGET`.
 */

export type Inst =
  | 'violin' | 'strings' | 'cello' | 'pizz' | 'spicc' | 'piano' | 'celesta' | 'choir'
  | 'bongo' | 'frame' | 'snare' | 'tom' | 'taiko' | 'cym'

/** The unpitched voices: they have no place in a song's key. */
export const PERCUSSION: ReadonlySet<Inst> = new Set<Inst>(['bongo', 'frame', 'snare', 'tom', 'taiko', 'cym'])

/** Most oscillators an area theme may sound at once (the boss gets `OSC_BUDGET_BOSS`). */
export const OSC_BUDGET = 28
export const OSC_BUDGET_BOSS = 40

/**
 * One note. Its step is its index in `Song.steps`; `len` is in 16ths.
 *
 * `p` is the voice's own parameter: the pitch a `violin` / `cello` note is
 * slurred from, a `piano` note's roll offset in seconds, the stroke of a
 * `bongo` (0 high open · 1 low open · 2 high muted · 3 low muted) or a
 * `frame` drum (0 centre · 1 edge).
 */
export interface Ev {
  i: Inst
  m: number
  len: number
  v: number
  p?: number
  /** Written outside the song's scale on purpose (a leading tone, a passing tone). */
  x?: 1
  /** Part of the melody rather than the accompaniment. */
  lead?: 1
}

export interface ChanSpec { gain?: number; pan?: number; send?: number; lp?: number; hp?: number }

/** What the output graph needs to know about a song. */
export interface Mix {
  /** Loudness trim — songs are matched to each other (see tools/music-render). */
  gain: number
  reverb: { seconds: number; decay: number }
  chans: Record<string, ChanSpec>
}

// ─── Output graph ───────────────────────────────────────────────────────────

export interface Out {
  ctx: BaseAudioContext
  master: GainNode
  ch: (name: string) => AudioNode
  /** A node every note of an instrument can share (a filter bank, an LFO),
   *  built once per song. Sources it returns are started here and stopped on
   *  dispose. */
  shared: <T extends AudioNode>(key: string, make: () => T) => T
  dispose: () => void
}

const irCache = new WeakMap<BaseAudioContext, Map<string, AudioBuffer>>()

/** A hall: stereo decaying noise, darkened, with a short pre-delay. */
const impulse = (ctx: BaseAudioContext, seconds: number, decay: number): AudioBuffer => {
  let m = irCache.get(ctx)
  if (!m) irCache.set(ctx, (m = new Map()))
  const key = `${seconds}:${decay}`
  const hit = m.get(key)
  if (hit) return hit
  const len = Math.floor(ctx.sampleRate * seconds)
  const pre = Math.floor(ctx.sampleRate * 0.015)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  const rng = mulberry32(7)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    let lp = 0
    for (let i = pre; i < len; i++) {
      const k = (i - pre) / (len - pre)
      // The one-pole darkens as the tail goes on, like air absorbing the highs.
      lp += ((rng() * 2 - 1) - lp) * (0.6 - 0.45 * k)
      d[i] = lp * Math.pow(1 - k, decay)
    }
  }
  m.set(key, buf)
  return buf
}

const isSource = (n: AudioNode): n is AudioScheduledSourceNode => typeof (n as AudioScheduledSourceNode).start === 'function'

export const makeOut = (ctx: BaseAudioContext, dest: AudioNode, mix: Mix): Out => {
  const master = ctx.createGain()
  master.gain.value = mix.gain
  master.connect(dest)
  const nodes: AudioNode[] = [master]
  let verb: AudioNode | null = null
  const reverbIn = (): AudioNode => {
    if (!verb) {
      const cv = ctx.createConvolver()
      cv.buffer = impulse(ctx, mix.reverb.seconds, mix.reverb.decay)
      cv.connect(master)
      nodes.push(cv)
      verb = cv
    }
    return verb
  }
  const chans = new Map<string, AudioNode>()
  const ch = (name: string): AudioNode => {
    const hit = chans.get(name)
    if (hit) return hit
    const spec = mix.chans[name] ?? {}
    const input = ctx.createGain()
    input.gain.value = spec.gain ?? 1
    nodes.push(input)
    let tail: AudioNode = input
    for (const [type, f] of [['lowpass', spec.lp], ['highpass', spec.hp]] as const) {
      if (!f) continue
      const bq = ctx.createBiquadFilter()
      bq.type = type
      bq.frequency.value = f
      bq.Q.value = 0.5
      tail.connect(bq)
      tail = bq
      nodes.push(bq)
    }
    if (spec.pan && 'createStereoPanner' in ctx) {
      const p = ctx.createStereoPanner()
      p.pan.value = spec.pan
      tail.connect(p).connect(master)
      nodes.push(p)
    } else tail.connect(master)
    if (spec.send) {
      const s = ctx.createGain()
      s.gain.value = spec.send
      tail.connect(s).connect(reverbIn())
      nodes.push(s)
    }
    chans.set(name, input)
    return input
  }
  const sharedNodes = new Map<string, AudioNode>()
  const shared = <T extends AudioNode>(key: string, make: () => T): T => {
    const hit = sharedNodes.get(key)
    if (hit) return hit as T
    const n = make()
    if (isSource(n)) n.start()
    sharedNodes.set(key, n)
    nodes.push(n)
    return n
  }
  return {
    ctx,
    master,
    ch,
    shared,
    dispose: () => {
      for (const n of nodes) {
        try { if (isSource(n)) n.stop() } catch { /* not started */ }
        try { n.disconnect() } catch { /* gone */ }
      }
    }
  }
}

// ─── Sources shared per context ─────────────────────────────────────────────

const NOISE_SECONDS = 2
const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>()
const noise = (ctx: BaseAudioContext): AudioBuffer => {
  const hit = noiseCache.get(ctx)
  if (hit) return hit
  const len = ctx.sampleRate * NOISE_SECONDS
  const b = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = b.getChannelData(0)
  const rng = mulberry32(3)
  for (let i = 0; i < len; i++) d[i] = rng() * 2 - 1
  noiseCache.set(ctx, b)
  return b
}

const pianoCache = new WeakMap<BaseAudioContext, [PeriodicWave, PeriodicWave]>()
/**
 * The piano's two partial sets. A struck string is not harmonic — its upper
 * partials run sharp — and a PeriodicWave can only be harmonic, so the tone is
 * split in two: the low partials on one oscillator, the upper ones on a second
 * that is tuned a few cents sharp and dies away faster. A loud note is two
 * oscillators, a soft one (which has no bite to lose) just the first.
 */
const pianoWaves = (ctx: BaseAudioContext): [PeriodicWave, PeriodicWave] => {
  const hit = pianoCache.get(ctx)
  if (hit) return hit
  const N = 20
  const wave = (amp: (n: number) => number): PeriodicWave => {
    const real = new Float32Array(N)
    const imag = new Float32Array(N)
    // Alternating phases keep the waveform's crest down (a softer, rounder attack).
    for (let n = 1; n < N; n++) (n % 2 ? imag : real)[n] = amp(n)
    return ctx.createPeriodicWave(real, imag)
  }
  // The hammer strikes about a seventh of the way along the string, which
  // takes the 7th partial (and its neighbours) out of the tone.
  const strike = (n: number): number => Math.abs(Math.sin((n * Math.PI) / 7.3))
  const body = wave(n => (n <= 8 ? strike(n) / Math.pow(n, 1.45) : 0))
  const bright = wave(n => (n >= 3 ? (strike(n) + 0.15) / Math.pow(n, 1.1) : 0))
  const w: [PeriodicWave, PeriodicWave] = [body, bright]
  pianoCache.set(ctx, w)
  return w
}

export const hz = (m: number): number => 440 * Math.pow(2, (m - 69) / 12)
const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))

const osc = (ctx: BaseAudioContext, type: OscillatorType, f: number, t: number, detune = 0): OscillatorNode => {
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  if (detune) o.detune.value = detune
  return o
}

/** Attack to `peak`, decay toward `peak * sus`, release from `end`. */
const envGain = (
  ctx: BaseAudioContext, t: number, a: number, peak: number, d: number, sus: number, end: number, rel: number
): GainNode => {
  const g = ctx.createGain()
  const e = Math.max(end, t + a + 0.002)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + a)
  g.gain.setTargetAtTime(Math.max(0.0001, peak * sus), t + a, Math.max(0.01, d / 3))
  g.gain.setTargetAtTime(0.0001, e, Math.max(0.005, rel / 4))
  return g
}

const run = (nodes: AudioScheduledSourceNode[], t: number, stop: number): void => {
  for (const n of nodes) { n.start(t); n.stop(stop) }
}

const noiseSrc = (ctx: BaseAudioContext, t: number, dur: number): AudioBufferSourceNode => {
  const s = ctx.createBufferSource()
  s.buffer = noise(ctx)
  s.start(t, (t * 7.31) % 0.5)
  s.stop(t + dur)
  return s
}

const filter = (ctx: BaseAudioContext, type: BiquadFilterType, f: number, q: number, gainDb = 0): BiquadFilterNode => {
  const b = ctx.createBiquadFilter()
  b.type = type
  b.frequency.value = f
  b.Q.value = q
  if (gainDb) b.gain.value = gainDb
  return b
}

/** A chain of filters every note of an instrument runs through, ending in its channel. */
const bank = (o: Out, key: string, chan: string, spec: ReadonlyArray<readonly [BiquadFilterType, number, number, number?]>): GainNode =>
  o.shared(key, () => {
    const input = o.ctx.createGain()
    let tail: AudioNode = input
    for (const [type, f, q, db] of spec) {
      const b = filter(o.ctx, type, f, q, db ?? 0)
      tail.connect(b)
      tail = b
    }
    tail.connect(o.ch(chan))
    return input
  })

/** A shared source feeds one note through `via`; the tap is cut when the note's source ends. */
const tap = (from: AudioNode, via: AudioNode, until: AudioScheduledSourceNode): void => {
  from.connect(via)
  until.addEventListener('ended', () => { try { from.disconnect(via) } catch { /* disposed */ } }, { once: true })
}
/** The same, into a parameter (a shared LFO on one note's detune). */
const tapParam = (from: AudioNode, to: AudioParam, until: AudioScheduledSourceNode): void => {
  from.connect(to)
  until.addEventListener('ended', () => { try { from.disconnect(to) } catch { /* disposed */ } }, { once: true })
}

/** White noise from `t` to `stop` (a cymbal's wash), into `dest`: one-shot sources end to end. */
const noiseInto = (ctx: BaseAudioContext, dest: AudioNode, t: number, stop: number): void => {
  const piece = NOISE_SECONDS - 0.5
  for (let at = t; at < stop; at += piece) {
    const n = ctx.createBufferSource()
    n.buffer = noise(ctx)
    n.connect(dest)
    n.start(at, (at * 7.31) % 0.5)
    n.stop(Math.min(stop, at + piece))
  }
}

// ─── Instruments ────────────────────────────────────────────────────────────
// Each takes (out, start time, note, seconds per 16th). Levels are relative;
// a song's `gain` sets where it sits against the others.

type Voice = (o: Out, t: number, e: Ev, spb: number) => void

/**
 * A bowed solo string: one saw through the instrument's body, a bow that takes
 * a moment to speak, and a vibrato that arrives late and deepens while the
 * note is held. A slurred note (`Ev.p`, the pitch it comes from) glides in on the same bow.
 */
const bowed = (
  o: Out, t: number, e: Ev, spb: number,
  s: { chan: string; body: GainNode; level: number; attack: number; rate: number; depth: number; top: [number, number] }
): void => {
  const c = o.ctx
  const dur = e.len * spb
  const f0 = hz(e.m)
  const slur = e.p !== undefined
  const a = slur ? 0.045 : Math.min(s.attack, 0.03 + dur * 0.12)
  const end = t + Math.max(dur - 0.02, a + 0.02)
  const peak = s.level * e.v
  const src = osc(c, 'sawtooth', f0, t)
  if (slur) {
    src.frequency.setValueAtTime(hz(e.p!), t)
    src.frequency.exponentialRampToValueAtTime(f0, t + 0.07)
  }
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  // A slurred note is already sounding: the bow does not stop between the two.
  if (slur) g.gain.linearRampToValueAtTime(peak * 0.5, t + 0.012)
  g.gain.linearRampToValueAtTime(peak * 0.82, t + a)
  // A held note blooms, then eases as the bow runs out.
  if (dur > 0.7) {
    const bloom = t + Math.min(dur * 0.45, 1.1)
    g.gain.linearRampToValueAtTime(peak, bloom)
    g.gain.setTargetAtTime(peak * 0.7, bloom, Math.max(0.3, dur * 0.6))
  }
  g.gain.setTargetAtTime(0.0001, end, 0.05)
  // Only a note that is held gets vibrato: a modulated oscillator costs more
  // than twice a plain one, and a quick note is played straight anyway.
  if (dur > 0.45) {
    const lfo = o.shared(`${s.chan}:lfo`, () => osc(c, 'sine', s.rate, 0))
    const lg = c.createGain()
    lg.gain.value = 0
    lg.gain.setValueAtTime(0, t + 0.14)
    lg.gain.linearRampToValueAtTime(s.depth * 0.55, t + 0.42)
    lg.gain.linearRampToValueAtTime(s.depth, t + Math.max(0.5, dur))
    lg.connect(src.detune)
    tap(lfo, lg, src)
  }
  // The bow's pressure: brighter where the note is played louder, opening as it speaks.
  const top = clamp(f0 * (2.2 + 3.2 * e.v), s.top[0], s.top[1])
  const f = filter(c, 'lowpass', top, 0.6)
  f.frequency.setValueAtTime(top * 0.55, t)
  f.frequency.linearRampToValueAtTime(top, t + a + 0.05)
  // (No bow noise: a noise source summed into a note's filter made the voice
  // five times as expensive in Chrome, measured, for a breath nobody hears
  // under the reverb.)
  src.connect(f).connect(g).connect(s.body)
  run([src], t, end + 0.26)
}

const violin: Voice = (o, t, e, spb) => bowed(o, t, e, spb, {
  chan: 'violin',
  // The body: the air and wood resonances low down, the "bridge hill" that
  // gives a violin its presence, and the top rolled off.
  body: bank(o, 'violin:body', 'violin', [
    ['highpass', 180, 0.7], ['peaking', 380, 1.6, 5], ['peaking', 1150, 2, -3], ['peaking', 2600, 1.3, 3.5], ['lowpass', 4800, 0.7]
  ]),
  level: 0.19, attack: 0.11, rate: 5.7, depth: 15, top: [1500, 4600]
})

const cello: Voice = (o, t, e, spb) => bowed(o, t, e, spb, {
  chan: 'cello',
  body: bank(o, 'cello:body', 'cello', [
    ['highpass', 55, 0.7], ['peaking', 150, 1.4, 4], ['peaking', 520, 2, 3], ['lowpass', 2800, 0.7]
  ]),
  level: 0.17, attack: 0.09, rate: 5.1, depth: 10, top: [520, 2400]
})

/**
 * The string section holding a chord: two detuned saws a note, slow in and
 * out, darker than the solo violin. The detune is a few cents wider on the
 * lower notes, so each voice of a chord beats at its own rate and the chord
 * never pulses as one. (Static on purpose: an LFO on the detune would put
 * every oscillator of the section on the slow modulated path.)
 */
const strings: Voice = (o, t, e, spb) => {
  const c = o.ctx
  const dur = e.len * spb
  const end = t + dur
  const section = bank(o, 'strings:section', 'strings', [['peaking', 520, 1.2, 3], ['lowpass', 2500, 0.6]])
  // The new chord arrives while the old one leaves: quick enough that the pad does not dip between them.
  const g = envGain(c, t, Math.min(0.3, 0.1 + dur * 0.1), 0.062 * e.v, 1.5, 0.88, end, 0.4)
  const spread = 8 + ((e.m * 5) % 4)
  const oscs = [-spread, spread - 1].map(d => osc(c, 'sawtooth', hz(e.m), t, d))
  for (const s of oscs) s.connect(g)
  g.connect(section)
  run(oscs, t, end + 0.32)
}

/** Plucked string: a saw whose filter snaps shut; low notes ring longer. `len` is ignored. */
const pizz: Voice = (o, t, e) => {
  const c = o.ctx
  const f0 = hz(e.m)
  const tau = clamp(0.2 * Math.pow(2, (55 - e.m) / 24), 0.08, 0.34)
  const f = filter(c, 'lowpass', 400, 1)
  f.frequency.setValueAtTime(Math.min(5500, f0 * (2.5 + 6 * e.v)), t)
  // A ramp that ENDS: a filter whose frequency is still automating recomputes itself every sample.
  f.frequency.exponentialRampToValueAtTime(f0 * 1.3, t + tau * 1.4)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.5 * e.v, t + 0.003)
  g.gain.setTargetAtTime(0.0001, t + 0.003, tau)
  const s = osc(c, 'sawtooth', f0, t)
  s.connect(f).connect(g).connect(o.ch('pizz'))
  run([s], t, t + tau * 4.5)
}

/** Short bowed strings (spiccato) — the boss ostinato. One oscillator: it plays every 16th. */
const spicc: Voice = (o, t, e, spb) => {
  const c = o.ctx
  const end = t + Math.min(e.len * spb, 0.15)
  const f = filter(c, 'lowpass', 1100 + 1700 * e.v, 0.8)
  const g = envGain(c, t, 0.006, 0.42 * e.v, 0.12, 0.4, end, 0.08)
  const s = osc(c, 'sawtooth', hz(e.m), t)
  s.connect(f).connect(g).connect(o.ch('spicc'))
  run([s], t, end + 0.1)
}

/**
 * The velocity above which a piano note has its bright upper partials (a
 * second oscillator). The brightness grows from zero at this point, so there
 * is no step in the tone; accompaniment figures are written at or under it and
 * cost one oscillator a note.
 */
const PIANO_BRIGHT_FROM = 0.5

/**
 * Piano: a hammer strike, then a decay that is long for low notes and short
 * for high ones, with the upper partials (sharp, on their own oscillator) gone
 * first. Velocity is brightness as much as level. `p` rolls a chord (seconds).
 */
const piano: Voice = (o, t0, e, spb) => {
  const c = o.ctx
  const t = t0 + (e.p ?? 0)
  const f0 = hz(e.m)
  const [bodyWave, brightWave] = pianoWaves(c)
  const tau = clamp(1.7 * Math.pow(2, (60 - e.m) / 20), 0.3, 3)
  const end = t + Math.max(0.08, e.len * spb)
  const peak = 0.34 * Math.pow(e.v, 1.3)
  const life = Math.min(end + 0.3, t + tau * 4.2)
  const a = c.createOscillator()
  a.setPeriodicWave(bodyWave)
  a.frequency.setValueAtTime(f0, t)
  const g = c.createGain()
  // A soft note has no bite to speak of: it is the body alone, and one oscillator.
  if (e.v > PIANO_BRIGHT_FROM) {
    const b = c.createOscillator()
    b.setPeriodicWave(brightWave)
    b.frequency.setValueAtTime(f0, t)
    // Stretched tuning: the further from the middle, the sharper the upper partials.
    b.detune.value = 5 + Math.abs(e.m - 60) * 0.22
    const bg = c.createGain()
    const brightness = 1.9 * (e.v - PIANO_BRIGHT_FROM) * clamp(Math.pow(2, (66 - e.m) / 24), 0.35, 1.5)
    bg.gain.setValueAtTime(brightness, t)
    bg.gain.setTargetAtTime(0.0001, t, tau * 0.2)
    b.connect(bg).connect(g)
    // The bite is gone long before the note is: its oscillator goes with it.
    run([b], t, Math.min(life, t + tau + 0.05))
  }
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.004)
  // The prompt sound drops fast; the aftersound hangs on.
  g.gain.setTargetAtTime(peak * 0.5, t + 0.004, tau * 0.1)
  if (t + 0.004 + tau * 0.3 < end) g.gain.setTargetAtTime(0.0001, t + 0.004 + tau * 0.3, tau)
  // The damper, when the key comes up.
  g.gain.setTargetAtTime(0.0001, end, 0.07)
  a.connect(g)
  const dest = o.ch('piano')
  g.connect(dest)
  run([a], t, life)
  if (e.v > 0.3) {
    // The hammer's thump.
    const n = noiseSrc(c, t, 0.04)
    const ng = c.createGain()
    ng.gain.setValueAtTime(0.09 * e.v * e.v, t)
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
    n.connect(filter(c, 'bandpass', clamp(f0 * 3, 500, 3200), 1.2)).connect(ng).connect(dest)
  }
}

/** Celesta: a glassy FM bell, for the cold places. */
const celesta: Voice = (o, t, e, spb) => {
  const c = o.ctx
  const f0 = hz(e.m)
  const ring = clamp(e.len * spb, 0.9, 2.2)
  const car = osc(c, 'sine', f0, t)
  const mod = osc(c, 'sine', f0 * 3.5, t)
  const mg = c.createGain()
  mg.gain.setValueAtTime(f0 * 1.6 * e.v, t)
  mg.gain.exponentialRampToValueAtTime(f0 * 0.1, t + 0.7)
  mod.connect(mg).connect(car.frequency)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.42 * e.v, t + 0.003)
  g.gain.setTargetAtTime(0.0001, t + 0.003, ring / 4)
  car.connect(g).connect(o.ch('celesta'))
  run([car, mod], t, t + ring + 0.1)
}

/** "Aah" choir: saws through vowel formants, slow swell, a little vibrato. */
const choir: Voice = (o, t, e, spb) => {
  const c = o.ctx
  // The vowel and the vibrato are the same for every note, so every note
  // shares them: a note is just two saws and an envelope.
  const vowel = o.shared('choir:vowel', () => {
    const input = c.createGain()
    input.gain.value = 0.5
    for (const [ff, q, lvl] of [[800, 5, 1], [1150, 6, 0.6], [2900, 8, 0.25]] as const) {
      const lv = c.createGain()
      lv.gain.value = lvl
      input.connect(filter(c, 'bandpass', ff, q)).connect(lv).connect(o.ch('choir'))
    }
    return input
  })
  const vibrato = o.shared('choir:vibrato', () => {
    const depth = c.createGain()
    depth.gain.value = 7 // cents
    o.shared('choir:lfo', () => osc(c, 'sine', 4.8, 0)).connect(depth)
    return depth
  })
  const end = t + e.len * spb
  const g = envGain(c, t, 0.5, 0.4 * e.v, 1, 0.9, end, 0.4)
  const oscs = [-8, 8].map(d => osc(c, 'sawtooth', hz(e.m), t, d))
  // Vibrato on one of the pair only: half the modulated oscillators, and the two drift apart like voices do.
  tapParam(vibrato, oscs[0]!.detune, oscs[0]!)
  for (const s of oscs) s.connect(g)
  g.connect(vowel)
  run(oscs, t, end + 0.5)
}

/** A hand on a skin: a pitched thump that drops, and the slap of the fingers. */
const skin = (o: Out, t: number, chan: string, f0: number, bend: number, tau: number, level: number, slapHz: number, slap: number): void => {
  const c = o.ctx
  const dest = o.ch(chan)
  const s = osc(c, 'sine', f0 * bend, t)
  s.frequency.exponentialRampToValueAtTime(f0, t + 0.03)
  const g = c.createGain()
  g.gain.setValueAtTime(level, t)
  g.gain.setTargetAtTime(0.0001, t + 0.002, tau)
  s.connect(g).connect(dest)
  run([s], t, t + tau * 5 + 0.02)
  if (slap > 0) {
    const n = noiseSrc(c, t, 0.05)
    const ng = c.createGain()
    ng.gain.setValueAtTime(slap, t)
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.022)
    n.connect(filter(c, 'bandpass', slapHz, 1.1)).connect(ng).connect(dest)
  }
}

/** Bongos. `p`: 0 high open · 1 low open · 2 high muted · 3 low muted. */
const bongo: Voice = (o, t, e) => {
  const k = e.p ?? 0
  const low = k % 2 === 1
  const muted = k >= 2
  skin(o, t, 'bongo', low ? 262 : 396, 1.3, muted ? 0.022 : low ? 0.075 : 0.055, 0.6 * e.v, low ? 1500 : 2600, (muted ? 0.42 : 0.25) * e.v)
}

/** Frame drum. `p`: 0 the centre (a low "dum") · 1 the edge (a dry "tak"). */
const frame: Voice = (o, t, e) => {
  if (e.p === 1) skin(o, t, 'frame', 310, 1.15, 0.03, 0.22 * e.v, 1900, 0.3 * e.v)
  else skin(o, t, 'frame', 98, 1.4, 0.15, 0.5 * e.v, 480, 0.3 * e.v)
}

/** Field drum: snares rattling over a tuned head — the march, and the rolls. */
const snare: Voice = (o, t, e) => {
  const c = o.ctx
  const dest = o.ch('snare')
  const n = noiseSrc(c, t, 0.2)
  const g = c.createGain()
  // A soft stick: the level comes from the length of the rattle, not from its first sample.
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.9 * e.v, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
  n.connect(filter(c, 'bandpass', 1900, 0.7)).connect(g).connect(dest)
  const s = osc(c, 'triangle', 190, t)
  s.frequency.exponentialRampToValueAtTime(150, t + 0.08)
  const tg = c.createGain()
  tg.gain.setValueAtTime(0.5 * e.v, t)
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  s.connect(tg).connect(dest)
  run([s], t, t + 0.1)
}

const tom: Voice = (o, t, e) => {
  const c = o.ctx
  const s = osc(c, 'sine', hz(e.m) * 1.6, t)
  s.frequency.exponentialRampToValueAtTime(hz(e.m), t + 0.12)
  const g = c.createGain()
  g.gain.setValueAtTime(0.5 * e.v, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
  s.connect(g).connect(o.ch('tom'))
  run([s], t, t + 0.4)
}

/** Big drum: a pitched thump with a skin slap on top. */
const taiko: Voice = (o, t, e) => {
  const c = o.ctx
  const dest = o.ch('taiko')
  const f0 = hz(e.m)
  const s = osc(c, 'sine', f0 * 1.8, t)
  s.frequency.exponentialRampToValueAtTime(f0, t + 0.06)
  const g = c.createGain()
  g.gain.setValueAtTime(0.35 * e.v, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8)
  s.connect(g).connect(dest)
  run([s], t, t + 0.85)
  const n = noiseSrc(c, t, 0.12)
  const ng = c.createGain()
  ng.gain.setValueAtTime(0.25 * e.v, t)
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  n.connect(filter(c, 'lowpass', 1200, 0.8)).connect(ng).connect(dest)
}

/** Suspended cymbal under soft mallets: swells over `len`, then rings away. */
const cym: Voice = (o, t, e, spb) => {
  const c = o.ctx
  const d = Math.max(0.05, e.len * spb)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.32 * e.v, t + d)
  g.gain.setTargetAtTime(0.0001, t + d, 0.45)
  const hp = filter(c, 'highpass', 3800, 0.6)
  hp.connect(filter(c, 'lowpass', 9000, 0.6)).connect(g).connect(o.ch('cym'))
  noiseInto(c, hp, t, t + d + 2.2)
}

const INST: Record<Inst, Voice> = { violin, strings, cello, pizz, spicc, piano, celesta, choir, bongo, frame, snare, tom, taiko, cym }

/** Voice every note of one 16th at time `t`. Called by the sequencer ahead of time. */
export const playEvents = (o: Out, evs: readonly Ev[] | undefined, t: number, spb: number): void => {
  if (!evs) return
  for (const e of evs) INST[e.i](o, t, e, spb)
}
