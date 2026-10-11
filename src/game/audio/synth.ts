import { registerOneShotSource } from '@/use/useAssets'
import { audio, canPlay, noise, pulse, midiHz, duckMusic } from './engine'
import { setSfxPlayer, type SfxName } from './sfx'
import { SFX_FILES } from '../assets/overrides'

/**
 * ─── Synthesized SFX ─────────────────────────────────────────────────────────
 *
 * Every sound effect is a recipe of voices built on the spot: oscillators with
 * pitch sweeps, filtered noise, nothing sampled, so the set costs zero bytes
 * of download and is ready before the first frame.
 *
 * The fight sounds (#74) are built the way a sound designer layers a hit for
 * an action game, not as chip blips:
 *
 *   crack    the transient: a few milliseconds of broadband noise, the snap
 *            that tells the ear something landed
 *   boom     the weight: a sub-bass sine dropping in pitch, driven through a
 *            saturator so it is felt on small speakers too
 *   body     filtered noise with a swept resonance: flesh, stone, flame
 *   metal    inharmonic partials decaying at their own rates: a blade's ring,
 *            an anvil's clang, a crystal's shatter (never a tuned bell)
 *   whoosh   band-passed air swept up and back while it travels across the
 *            stereo field
 *   rumble   low noise with a long tail: the ground answering
 *   growl    sawtooths through three vowel-like formants with a rough tremolo:
 *            throats, not synths
 *
 * Two sends give them a place: a GRIT bus (a soft saturator) for weight, and a
 * SPACE (a generated reverb) the bigger sounds ring out in. Pitched sounds
 * that are meant to be musical (rewards, the UI) stay inside one key (D minor
 * pentatonic: D F G A C) so they never grind against the music.
 *
 * Every source is registered with `registerOneShotSource`, so an ad or a
 * platform mute hard-stops in-flight sounds (the suspend gate alone would only
 * freeze them).
 */

type Wave = 'p12' | 'p25' | 'p50' | 'tri' | 'saw' | 'sine'

interface ToneOpts {
  wave: Wave
  f0: number
  f1?: number
  dur: number
  vol: number
  at?: number
  attack?: number
  exp?: boolean
  vib?: number
  vibRate?: number
  pan?: number
  /** Through the grit bus (weight). */
  dirt?: boolean
}

/** A muffled sound's low-pass (see `play`): while its recipe runs, every
 *  voice routes through it on its way to the sfx bus. */
let route: BiquadFilterNode | null = null
/** The current recipe's pitch factor (see `VARY`): every voice it starts is
 *  tuned by it. 1 outside `play`. */
let pitch = 1
/** The current recipe's reverb send (0..1): set by `space()` at its top. */
let wet = 0

interface Sends { ctx: BaseAudioContext; bus: AudioNode; grit: AudioNode; space: AudioNode }
let sends: Sends | null = null

/** A reverb's impulse: two channels of decaying noise, darker as it fades, with a short pre-delay. */
const impulse = (ctx: BaseAudioContext, seconds: number): AudioBuffer => {
  const rate = ctx.sampleRate
  const len = Math.floor(rate * seconds)
  const ir = ctx.createBuffer(2, len, rate)
  const pre = Math.floor(rate * 0.012)
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch)
    let lp = 0
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / rate
      // One-pole low-pass whose cutoff falls with time: the tail darkens.
      const k = Math.max(0.05, 0.9 - t * 0.5)
      lp += (Math.random() * 2 - 1 - lp) * k
      d[i] = lp * Math.exp(-t * 3.4) * (i - pre < rate * 0.05 ? 0.6 + Math.random() * 0.4 : 1)
    }
  }
  return ir
}

/** The grit and space sends for this context and bus (made once, remade if either changes). */
const sendsFor = (ctx: BaseAudioContext, bus: AudioNode): Sends => {
  if (sends && sends.ctx === ctx && sends.bus === bus) return sends
  const shaper = ctx.createWaveShaper()
  const curve = new Float32Array(1024)
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1
    curve[i] = Math.tanh(x * 2.6) / Math.tanh(2.6)
  }
  shaper.curve = curve
  shaper.oversample = '2x'
  const gritOut = ctx.createGain()
  gritOut.gain.value = 0.8
  shaper.connect(gritOut).connect(bus)
  const verb = ctx.createConvolver()
  verb.buffer = impulse(ctx, 1.7)
  const verbOut = ctx.createGain()
  verbOut.gain.value = 0.55
  verb.connect(verbOut).connect(bus)
  sends = { ctx, bus, grit: shaper, space: verb }
  return sends
}

/** Set the current recipe's reverb send (call at a recipe's top). */
const space = (amount: number): void => { wet = amount }

/** Where a voice goes: panned into the bus (or the grit bus), and a share of it into the space. */
const out = (pan: number, dirt = false, panTo?: number, panDur = 0): AudioNode | null => {
  const a = audio()
  if (!a) return null
  const bus = route ?? a.sfx
  const s = sendsFor(a.ctx, a.sfx)
  const v = a.ctx.createGain()
  if ((pan || panTo !== undefined) && 'createStereoPanner' in a.ctx) {
    const p = a.ctx.createStereoPanner()
    p.pan.value = pan
    if (panTo !== undefined) p.pan.linearRampToValueAtTime(Math.max(-1, Math.min(1, panTo)), a.ctx.currentTime + panDur)
    v.connect(p)
    p.connect(dirt ? s.grit : bus)
  } else v.connect(dirt ? s.grit : bus)
  if (wet > 0.001) {
    const w = a.ctx.createGain()
    w.gain.value = wet
    v.connect(w).connect(s.space)
  }
  // Nothing to keep: a voice's chain is let go once its source has stopped.
  return v
}

const tone = (o: ToneOpts): void => {
  const a = audio()
  if (!a) return
  const dest = out(o.pan ?? 0, o.dirt)
  if (!dest) return
  const t = a.ctx.currentTime + (o.at ?? 0)
  const osc = a.ctx.createOscillator()
  if (o.wave === 'tri') osc.type = 'triangle'
  else if (o.wave === 'saw') osc.type = 'sawtooth'
  else if (o.wave === 'sine') osc.type = 'sine'
  else {
    const w = pulse(o.wave === 'p12' ? 0.125 : o.wave === 'p25' ? 0.25 : 0.5)
    if (w) osc.setPeriodicWave(w)
  }
  osc.frequency.setValueAtTime(o.f0 * pitch, t)
  if (o.f1 !== undefined) {
    if (o.exp !== false) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1 * pitch), t + o.dur)
    else osc.frequency.linearRampToValueAtTime(o.f1 * pitch, t + o.dur)
  }
  if (o.vib) {
    const lfo = a.ctx.createOscillator()
    const lg = a.ctx.createGain()
    lfo.frequency.value = o.vibRate ?? 14
    lg.gain.value = o.vib
    lfo.connect(lg).connect(osc.frequency)
    lfo.start(t)
    lfo.stop(t + o.dur + 0.05)
  }
  const g = a.ctx.createGain()
  const atk = o.attack ?? 0.004
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.vol, t + atk)
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur)
  osc.connect(g).connect(dest)
  osc.start(t)
  osc.stop(t + o.dur + 0.02)
  registerOneShotSource(osc)
}

interface NoiseOpts {
  dur: number
  vol: number
  type?: BiquadFilterType
  f0?: number
  f1?: number
  /** A middle frequency the sweep passes through at `fmidAt` (0..1) of its length: up and back down. */
  fmid?: number
  fmidAt?: number
  q?: number
  at?: number
  pan?: number
  /** Travels across the stereo field to here over its length. */
  panTo?: number
  attack?: number
  dirt?: boolean
}

const burst = (o: NoiseOpts): void => {
  const a = audio()
  const buf = noise()
  if (!a || !buf) return
  const dest = out(o.pan ?? 0, o.dirt, o.panTo, o.dur)
  if (!dest) return
  const t = a.ctx.currentTime + (o.at ?? 0)
  const src = a.ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const f = a.ctx.createBiquadFilter()
  f.type = o.type ?? 'lowpass'
  f.Q.value = o.q ?? 0.8
  f.frequency.setValueAtTime((o.f0 ?? 4000) * pitch, t)
  if (o.fmid !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.fmid * pitch), t + o.dur * (o.fmidAt ?? 0.4))
  if (o.f1 !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.f1 * pitch), t + o.dur)
  const g = a.ctx.createGain()
  if (o.attack) {
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(o.vol, t + o.attack)
  } else g.gain.setValueAtTime(o.vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur)
  src.connect(f).connect(g).connect(dest)
  src.start(t, Math.random() * 0.5)
  src.stop(t + o.dur + 0.02)
  registerOneShotSource(src)
}

/** Quick note run (MIDI numbers), e.g. pickups and fanfares. */
const arp = (notes: number[], step: number, wave: Wave, vol: number, len = step * 1.4, at = 0, pan = 0): void => {
  notes.forEach((n, i) => tone({ wave, f0: midiHz(n), dur: len, vol, at: at + i * step, pan }))
}

/** A struck bell: a sine with two quiet inharmonic partials. */
const bell = (midi: number, vol: number, dur: number, at = 0, pan = 0): void => {
  const f = midiHz(midi)
  tone({ wave: 'sine', f0: f, dur, vol, at, pan })
  tone({ wave: 'sine', f0: f * 2.76, dur: dur * 0.5, vol: vol * 0.3, at, pan })
  tone({ wave: 'tri', f0: f * 5.4, dur: dur * 0.2, vol: vol * 0.12, at, pan })
}

// ─── The fight's building blocks ─────────────────────────────────────────────

/** The transient: a few milliseconds of bright noise. */
const crack = (vol: number, pan: number, at = 0, hz = 2200, dur = 0.018): void =>
  burst({ dur, vol, type: 'highpass', f0: hz, q: 0.6, at, pan })

/** The weight: a sub sine dropping in pitch, with its octave, through the grit. */
const boom = (f0: number, f1: number, dur: number, vol: number, pan: number, at = 0): void => {
  tone({ wave: 'sine', f0, f1, dur, vol, at, pan: pan * 0.4, attack: 0.002, dirt: true })
  tone({ wave: 'tri', f0: f0 * 2, f1: f1 * 2, dur: dur * 0.5, vol: vol * 0.35, at, pan: pan * 0.4, attack: 0.002, dirt: true })
}

/** Inharmonic partials decaying at their own rates: a ring, a clang, a shard (not a tuned bell). */
const metal = (f: number, dur: number, vol: number, pan: number, at = 0, bright = 1): void => {
  const P: Array<[number, number, number]> = [[1, 1, 1], [2.32, 0.6, 0.7], [3.76, 0.42, 0.5], [5.4, 0.28 * bright, 0.34], [6.91, 0.18 * bright, 0.24]]
  for (const [r, v, d] of P) tone({ wave: 'sine', f0: f * r * (0.995 + Math.random() * 0.01), dur: dur * d, vol: vol * v, at, pan, attack: 0.002 })
}

/** Air, swept up and back, travelling across the field. */
const whoosh = (f0: number, fmid: number, f1: number, dur: number, vol: number, pan: number, at = 0, q = 2.2): void =>
  burst({ dur, vol, type: 'bandpass', f0, fmid, fmidAt: 0.45, f1, q, attack: dur * 0.42, at, pan: pan - 0.35, panTo: pan + 0.35 })

/** The ground answering: low noise with a long tail. */
const rumble = (dur: number, vol: number, pan: number, at = 0, hz = 160): void =>
  burst({ dur, vol, type: 'lowpass', f0: hz, f1: 50, q: 0.7, attack: 0.03, at, pan: pan * 0.5, dirt: true })

/** A throat: two sawtooths through three vowel formants with a rough tremolo, and its breath. */
const growl = (f0: number, f1: number, dur: number, vol: number, pan: number, at = 0, rough = 24): void => {
  const a = audio()
  if (!a) return
  const dest = out(pan, true)
  if (!dest) return
  const t = a.ctx.currentTime + at
  const sum = a.ctx.createGain()
  sum.gain.setValueAtTime(0.0001, t)
  sum.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.12, dur * 0.25))
  sum.gain.setValueAtTime(vol, t + dur * 0.6)
  sum.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  // The roughness of a throat: the level shaken fast.
  const trem = a.ctx.createGain()
  trem.gain.value = 0.7
  const lfo = a.ctx.createOscillator()
  const lfoG = a.ctx.createGain()
  lfo.frequency.value = rough
  lfoG.gain.value = 0.3
  lfo.connect(lfoG).connect(trem.gain)
  trem.connect(sum).connect(dest)
  for (const [ratio, det] of [[1, 0], [1.5, 7]] as const) {
    const o = a.ctx.createOscillator()
    o.type = 'sawtooth'
    o.detune.value = det
    o.frequency.setValueAtTime(f0 * ratio * pitch, t)
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1 * ratio * pitch), t + dur)
    for (const [hz, q, g] of [[480, 4, 0.7], [1150, 5, 0.38], [2500, 6, 0.16]] as const) {
      const f = a.ctx.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = hz * (0.9 + Math.random() * 0.2)
      f.Q.value = q
      const gg = a.ctx.createGain()
      gg.gain.value = g
      o.connect(f).connect(gg).connect(trem)
    }
    o.start(t)
    o.stop(t + dur + 0.05)
    registerOneShotSource(o)
  }
  lfo.start(t)
  lfo.stop(t + dur + 0.05)
  registerOneShotSource(lfo)
  burst({ dur: dur * 0.9, vol: vol * 0.5, type: 'bandpass', f0: 900, f1: 500, q: 1.2, attack: 0.06, at, pan })
}

/** Crackle: many tiny pops spread over a span (fire, debris, sparks). */
const crackle = (n: number, span: number, vol: number, pan: number, at = 0, hz = 2600): void => {
  for (let k = 0; k < n; k++) burst({ dur: 0.008 + Math.random() * 0.02, vol: vol * (0.4 + Math.random() * 0.6), type: 'bandpass', f0: hz * (0.6 + Math.random() * 0.9), q: 2.5, at: at + Math.random() * span, pan: pan + (Math.random() - 0.5) * 0.5 })
}

// Voice limiting: the same sound can only retrigger every `gap` seconds.
const lastAt = new Map<string, number>()
const GAP: Partial<Record<SfxName, number>> = {
  swing: 0.05, swingDagger: 0.04, swingHeavy: 0.08, swingBlunt: 0.07, shoot: 0.05, shootBow: 0.06, cast: 0.07, hit: 0.035, hitBlunt: 0.04, hitPierce: 0.035, hitHeavy: 0.06, crit: 0.06, hurt: 0.13,
  block: 0.08, dodge: 0.1, coin: 0.05, explode: 0.07, fire: 0.1, ice: 0.1, poison: 0.12, shadow: 0.1, quake: 0.12,
  alert: 0.3, death: 0.05, telegraph: 0.25, uiClick: 0.03, summon: 0.1, heal: 0.15, teleport: 0.08,
  // A skill's cast and impact (#101): a volley of hits is one sound, not twenty.
  castFire: 0.08, castIce: 0.08, castShock: 0.08, castHoly: 0.08, castShadow: 0.08, castPoison: 0.08, castBlood: 0.08, castEarth: 0.08, castWind: 0.08, castNature: 0.08, castArcane: 0.08, castTime: 0.08, castSpirit: 0.08, castSong: 0.08, castTech: 0.08, castCommand: 0.08,
  impactFire: 0.07, impactIce: 0.07, impactShock: 0.07, impactWind: 0.07, impactNature: 0.07, impactArcane: 0.07, impactTime: 0.07, impactSpirit: 0.07, impactSong: 0.07, impactTech: 0.07
}

/**
 * The sounds heard dozens of times a minute get a small random pitch (±5 %)
 * and level (±10 %) each time, so a fight is not one sample on repeat.
 */
const VARY: ReadonlySet<SfxName> = new Set<SfxName>([
  'swing', 'swingDagger', 'swingHeavy', 'swingBlunt', 'shoot', 'shootBow', 'cast', 'hit', 'hitBlunt', 'hitPierce', 'hitHeavy', 'crit', 'coin', 'explode', 'death', 'hurt', 'block', 'fire',
  'impactFire', 'impactIce', 'impactShock', 'impactWind', 'impactNature', 'impactArcane', 'impactTime', 'impactSpirit', 'impactSong', 'impactTech'
])

/** The big stings: the music steps back under them (seconds). */
const DUCK_FOR: Partial<Record<SfxName, number>> = { bossIntro: 1.8, levelUp: 1.6, chest: 1.2, deathBig: 1.2, lootEpic: 1.2, lootLegend: 1.9, crowdRoar: 2.2 }

/** The loudest hits, trimmed 2–3 dB under the frequent ones. */
const TRIM: Partial<Record<SfxName, number>> = { explode: 0.78, quake: 0.8, deathBig: 0.85, roar: 0.85 }

/**
 * At most this many sounds start in any `CAP_WINDOW` seconds. A big fight can
 * fire hits, casts and bursts at once; past the cap the frequent small sounds
 * are dropped, never the rare important ones (`NEVER_DROP`).
 */
const CAP = 22
const CAP_WINDOW = 0.25
const recent: number[] = []
const NEVER_DROP: ReadonlySet<SfxName> = new Set<SfxName>([
  'hurt', 'bossIntro', 'levelUp', 'denied', 'uiClick', 'uiOpen', 'uiClose', 'uiEquip', 'uiBuy', 'uiLearn', 'uiPoint',
  'uiChoice', 'potion', 'chest', 'loot', 'lootRare', 'lootEpic', 'lootLegend', 'deathBig', 'overheat'
])

/** Open (a muffle of 0 has no filter at all) and fully muffled cutoffs (Hz). */
const OPEN_HZ = 16000
const MUFFLED_HZ = 850
/** The low-pass cutoff for a muffle of 0..1, on an exponential (pitch) scale. */
export const muffleHz = (muffle: number): number =>
  OPEN_HZ * Math.pow(MUFFLED_HZ / OPEN_HZ, Math.max(0, Math.min(1, muffle)))

// D minor pentatonic, as MIDI: D4 F4 G4 A4 C5 D5 F5 G5 A5 C6 D6
const D4 = 62
const F4 = 65
const G4 = 67
const A4 = 69
const C5 = 72
const D5 = 74
const F5 = 77
const A5 = 81
const D6 = 86

const RECIPES: Record<SfxName, (pan: number, g: number) => void> = {
  // ── Weapons ──
  // A sword through the air: a NARROW band of air swept high and fast (rising
  // slowly, cut off sharply, as a blade passes the ear), the edge's own whistle
  // over it, a breath of steel ringing at the start. Nothing low: a sword is
  // thin, it does not push air, it cuts it.
  swing: (p, g) => {
    space(0.1)
    burst({ dur: 0.17, vol: 0.32 * g, type: 'bandpass', f0: 1700, fmid: 5600, fmidAt: 0.62, f1: 2600, q: 6.5, attack: 0.11, pan: p - 0.4, panTo: p + 0.4 })
    burst({ dur: 0.15, vol: 0.12 * g, type: 'highpass', f0: 5200, f1: 8000, attack: 0.1, pan: p - 0.2, panTo: p + 0.3 })
    tone({ wave: 'sine', f0: 2900, f1: 4300, dur: 0.15, vol: 0.022 * g, attack: 0.1, pan: p })
    metal(3650, 0.28, 0.012 * g, p, 0.004)
  },
  // A dagger: quicker, higher, a flick.
  swingDagger: (p, g) => {
    space(0.06)
    burst({ dur: 0.1, vol: 0.28 * g, type: 'bandpass', f0: 2800, fmid: 7600, fmidAt: 0.6, f1: 4200, q: 7, attack: 0.06, pan: p - 0.3, panTo: p + 0.3 })
    tone({ wave: 'sine', f0: 4200, f1: 5800, dur: 0.09, vol: 0.016 * g, attack: 0.05, pan: p })
  },
  // A greatsword, an axe, a scythe: still a blade, but long and heavy: a lower,
  // longer sweep, a deeper whistle, the steel ringing longer.
  swingHeavy: (p, g) => {
    space(0.14)
    burst({ dur: 0.3, vol: 0.34 * g, type: 'bandpass', f0: 700, fmid: 3000, fmidAt: 0.62, f1: 1100, q: 4.2, attack: 0.19, pan: p - 0.45, panTo: p + 0.45 })
    burst({ dur: 0.26, vol: 0.08 * g, type: 'lowpass', f0: 220, f1: 140, attack: 0.16, pan: p })
    tone({ wave: 'sine', f0: 1500, f1: 2300, dur: 0.26, vol: 0.02 * g, attack: 0.17, pan: p })
    metal(2250, 0.45, 0.014 * g, p, 0.004)
  },
  // A club, a hammer, a fist, a beast's swipe: no edge, all weight: a wide, low whoomp.
  swingBlunt: (p, g) => {
    space(0.12)
    burst({ dur: 0.3, vol: 0.36 * g, type: 'bandpass', f0: 160, fmid: 620, fmidAt: 0.6, f1: 220, q: 1.3, attack: 0.18, pan: p - 0.3, panTo: p + 0.3 })
    tone({ wave: 'sine', f0: 80, f1: 52, dur: 0.28, vol: 0.14 * g, attack: 0.16, pan: p, dirt: true })
  },
  // A gun: the crack, the thump of it, the whiz of the shot leaving.
  shoot: (p, g) => {
    space(0.16)
    crack(0.34 * g, p, 0, 2600, 0.012)
    tone({ wave: 'tri', f0: 520, f1: 120, dur: 0.09, vol: 0.22 * g, pan: p, dirt: true })
    burst({ dur: 0.16, vol: 0.12 * g, type: 'bandpass', f0: 4200, f1: 1400, q: 3, at: 0.01, pan: p, panTo: p * 0.3 })
  },
  // A bow (or a sling): the string let go (a plucked, dying twang) and the arrow hissing off.
  shootBow: (p, g) => {
    space(0.14)
    tone({ wave: 'tri', f0: 196, f1: 180, dur: 0.22, vol: 0.18 * g, attack: 0.002, pan: p })
    tone({ wave: 'sine', f0: 392, f1: 370, dur: 0.14, vol: 0.08 * g, attack: 0.002, pan: p })
    burst({ dur: 0.03, vol: 0.18 * g, type: 'bandpass', f0: 2400, q: 1.5, pan: p })
    burst({ dur: 0.2, vol: 0.14 * g, type: 'bandpass', f0: 5200, f1: 2600, q: 4, attack: 0.02, at: 0.015, pan: p, panTo: p * 0.2 })
  },
  // A spell leaving the hand: air drawn up into a shimmer, two voices beating against each other.
  cast: (p, g) => {
    space(0.32)
    whoosh(500, 4200, 2600, 0.3, 0.24 * g, p, 0, 3.5)
    tone({ wave: 'sine', f0: midiHz(A4), f1: midiHz(A5), dur: 0.32, vol: 0.08 * g, vib: 9, vibRate: 7, attack: 0.05, pan: p })
    tone({ wave: 'sine', f0: midiHz(A4) * 1.007, f1: midiHz(A5) * 1.007, dur: 0.32, vol: 0.07 * g, attack: 0.05, pan: p })
    crackle(4, 0.25, 0.05 * g, p, 0.08, 6000)
  },
  // ── Impacts ──
  // A blade lands: a bright snap, the wet tearing of the cut, the chop of it
  // into the body (mid, not low), a small push of weight, and now and then
  // the clink of steel on mail.
  hit: (p, g) => {
    space(0.1)
    crack(0.34 * g, p, 0, 4200, 0.008)
    burst({ dur: 0.1, vol: 0.26 * g, type: 'bandpass', f0: 4200, f1: 1700, q: 1.6, pan: p })
    burst({ dur: 0.07, vol: 0.2 * g, type: 'bandpass', f0: 820, f1: 520, q: 2.4, at: 0.004, pan: p, dirt: true })
    tone({ wave: 'sine', f0: 190, f1: 110, dur: 0.06, vol: 0.12 * g, pan: p })
    if (Math.random() < 0.5) metal(2700 + Math.random() * 600, 0.16, 0.035 * g, p, 0.006)
  },
  // A club or a hammer: no edge to it, all thud.
  hitBlunt: (p, g) => {
    space(0.1)
    crack(0.22 * g, p, 0, 1300, 0.02)
    boom(130, 48, 0.2, 0.42 * g, p)
    burst({ dur: 0.14, vol: 0.2 * g, type: 'lowpass', f0: 1100, f1: 200, pan: p, dirt: true })
  },
  // A point goes in: a sharp tick, a short tearing, a thunk.
  hitPierce: (p, g) => {
    space(0.08)
    crack(0.32 * g, p, 0, 3600, 0.01)
    burst({ dur: 0.06, vol: 0.16 * g, type: 'bandpass', f0: 4200, f1: 2200, q: 2, pan: p })
    tone({ wave: 'sine', f0: 320, f1: 120, dur: 0.07, vol: 0.2 * g, pan: p, dirt: true })
  },
  // A heavy blow: a bigger snap and a deeper chop, the weight behind it, steel ringing, the air after.
  hitHeavy: (p, g) => {
    space(0.22)
    crack(0.42 * g, p, 0, 3200, 0.014)
    burst({ dur: 0.18, vol: 0.42 * g, type: 'bandpass', f0: 4400, f1: 1500, q: 1.4, pan: p })
    burst({ dur: 0.12, vol: 0.26 * g, type: 'bandpass', f0: 640, f1: 360, q: 2, at: 0.004, pan: p, dirt: true })
    boom(120, 52, 0.18, 0.13 * g, p)
    metal(1900, 0.3, 0.05 * g, p, 0.006)
  },
  // A critical: a blade's full stroke: the snap, a long tearing cut, the chop, a
  // bright ringing clang over it, a shing of steel, and a drop under it all.
  crit: (p, g) => {
    space(0.3)
    crack(0.46 * g, p, 0, 3600, 0.016)
    burst({ dur: 0.24, vol: 0.44 * g, type: 'bandpass', f0: 5600, f1: 1600, q: 1.3, pan: p })
    burst({ dur: 0.14, vol: 0.28 * g, type: 'bandpass', f0: 700, f1: 380, q: 2, at: 0.004, pan: p, dirt: true })
    boom(110, 36, 0.3, 0.17 * g, p)
    metal(2350, 0.55, 0.1 * g, p, 0.006, 1.3)
    burst({ dur: 0.32, vol: 0.09 * g, type: 'highpass', f0: 5200, f1: 9000, attack: 0.02, at: 0.02, pan: p })
  },
  // Steel on a shield: an anvil's clang and its ring.
  block: (p, g) => {
    space(0.26)
    crack(0.3 * g, p, 0, 3000, 0.012)
    metal(880, 0.6, 0.15 * g, p, 0, 1.2)
    metal(1320, 0.35, 0.06 * g, p, 0.004)
    tone({ wave: 'sine', f0: 140, f1: 90, dur: 0.12, vol: 0.18 * g, pan: p, dirt: true })
  },
  dodge: (p, g) => {
    space(0.1)
    whoosh(2400, 3600, 700, 0.2, 0.34 * g, p, 0, 2.6)
  },
  // The hero is hit: a thud into him, a grunt of breath.
  hurt: (p, g) => {
    space(0.1)
    crack(0.24 * g, p * 0.5, 0, 1500, 0.018)
    boom(150, 60, 0.16, 0.36 * g, p * 0.5)
    burst({ dur: 0.18, vol: 0.12 * g, type: 'bandpass', f0: 700, f1: 380, q: 2.2, attack: 0.02, at: 0.02, pan: p * 0.5 })
  },
  // ── Elements ──
  // Fire: a gout that roars up and falls, crackling, a low roll under it.
  fire: (p, g) => {
    space(0.24)
    burst({ dur: 0.6, vol: 0.3 * g, type: 'lowpass', f0: 300, fmid: 2600, fmidAt: 0.25, f1: 500, attack: 0.04, pan: p, dirt: true })
    burst({ dur: 0.5, vol: 0.12 * g, type: 'bandpass', f0: 1800, f1: 3600, q: 1.4, attack: 0.05, pan: p })
    crackle(10, 0.5, 0.12 * g, p, 0.05)
    tone({ wave: 'saw', f0: 70, f1: 50, dur: 0.45, vol: 0.06 * g, attack: 0.05, pan: p, dirt: true })
  },
  // Ice: it freezes and shatters: a crunch, shards ringing out of tune with each other.
  ice: (p, g) => {
    space(0.38)
    crack(0.24 * g, p, 0, 4200, 0.02)
    burst({ dur: 0.18, vol: 0.14 * g, type: 'highpass', f0: 3500, f1: 7000, pan: p })
    for (let k = 0; k < 5; k++) metal(2600 + Math.random() * 3200, 0.3, 0.035 * g, p + (Math.random() - 0.5) * 0.4, k * 0.035)
    tone({ wave: 'sine', f0: 160, f1: 90, dur: 0.12, vol: 0.12 * g, pan: p })
  },
  // Light: a chord swelling out of nothing (consonant, in the key), a shimmer, a bright ring.
  holy: (p, g) => {
    space(0.5)
    for (const [m, v] of [[D4, 0.1], [A4, 0.08], [D5, 0.07], [A5, 0.04]] as const) {
      tone({ wave: 'sine', f0: midiHz(m), dur: 0.9, vol: v * g, attack: 0.12, pan: p })
      tone({ wave: 'sine', f0: midiHz(m) * 1.004, dur: 0.9, vol: v * 0.6 * g, attack: 0.14, pan: p })
    }
    burst({ dur: 0.6, vol: 0.07 * g, type: 'highpass', f0: 6000, attack: 0.1, pan: p })
    metal(1760, 0.6, 0.04 * g, p, 0.02)
  },
  // Shadow: air sucked in backwards, a throat under it, a dark hum.
  shadow: (p, g) => {
    space(0.42)
    burst({ dur: 0.32, vol: 0.32 * g, type: 'bandpass', f0: 2600, f1: 260, q: 2.2, attack: 0.28, pan: p + 0.3, panTo: p - 0.3 })
    growl(90, 60, 0.5, 0.2 * g, p, 0.15, 17)
    tone({ wave: 'saw', f0: 55, f1: 41, dur: 0.55, vol: 0.06 * g, attack: 0.1, pan: p, dirt: true })
  },
  // Poison: a wet hiss and things bubbling in it.
  poison: (p, g) => {
    space(0.16)
    burst({ dur: 0.36, vol: 0.22 * g, type: 'bandpass', f0: 2400, f1: 1600, q: 0.8, attack: 0.03, pan: p })
    for (let k = 0; k < 6; k++) tone({ wave: 'sine', f0: 180 + Math.random() * 260, f1: 420 + Math.random() * 400, dur: 0.05, vol: 0.07 * g, at: k * 0.045 + Math.random() * 0.02, pan: p })
    burst({ dur: 0.2, vol: 0.12 * g, type: 'lowpass', f0: 700, f1: 200, at: 0.05, pan: p })
  },
  blood: (p, g) => {
    space(0.12)
    crack(0.18 * g, p, 0, 1600, 0.016)
    burst({ dur: 0.24, vol: 0.18 * g, type: 'lowpass', f0: 900, f1: 180, pan: p })
    tone({ wave: 'sine', f0: 260, f1: 80, dur: 0.22, vol: 0.18 * g, pan: p, dirt: true })
  },
  // The ground breaks: a sub drop, a long rumble, stones raining back down.
  quake: (p, g) => {
    space(0.32)
    crack(0.3 * g, p, 0, 900, 0.03)
    boom(80, 26, 0.8, 0.5 * g, p)
    rumble(1.1, 0.4 * g, p)
    crackle(9, 0.8, 0.12 * g, p, 0.12, 1600)
  },
  // A beam: a charged hum, detuned, a whine climbing over it, sparks crackling along it.
  beam: (p, g) => {
    space(0.28)
    tone({ wave: 'saw', f0: 110, dur: 0.55, vol: 0.08 * g, attack: 0.03, pan: p, dirt: true })
    tone({ wave: 'saw', f0: 110 * 1.012, dur: 0.55, vol: 0.07 * g, attack: 0.03, pan: p, dirt: true })
    tone({ wave: 'sine', f0: 1800, f1: 3200, dur: 0.55, vol: 0.05 * g, vib: 40, vibRate: 31, pan: p })
    burst({ dur: 0.55, vol: 0.1 * g, type: 'bandpass', f0: 3000, f1: 5200, q: 2, attack: 0.04, pan: p })
    crackle(8, 0.5, 0.07 * g, p, 0, 5000)
  },
  // ── A skill's element (#101): the cast as it gathers, the impact as it lands ──
  // Fire gathers: a roar drawn in and up, the first crackles, a low swell.
  castFire: (p, g) => {
    space(0.2)
    burst({ dur: 0.45, vol: 0.26 * g, type: 'lowpass', f0: 220, fmid: 2400, fmidAt: 0.7, f1: 900, attack: 0.18, pan: p, dirt: true })
    crackle(6, 0.35, 0.08 * g, p, 0.08)
    tone({ wave: 'saw', f0: 80, f1: 140, dur: 0.4, vol: 0.05 * g, attack: 0.15, pan: p, dirt: true })
  },
  // Frost crystallises: four chimes climbing, a cold hiss rising under them.
  castIce: (p, g) => {
    space(0.42)
    ;[1900, 2400, 3000, 3700].forEach((f, k) => metal(f, 0.32, 0.03 * g, p + (k - 1.5) * 0.12, k * 0.05, 0.6))
    burst({ dur: 0.35, vol: 0.1 * g, type: 'highpass', f0: 4500, f1: 8000, attack: 0.2, pan: p })
    tone({ wave: 'sine', f0: 600, f1: 1250, dur: 0.3, vol: 0.04 * g, attack: 0.1, pan: p })
  },
  // A spark builds: a buzz that tightens, crackling.
  castShock: (p, g) => {
    space(0.18)
    tone({ wave: 'saw', f0: 110, f1: 220, dur: 0.3, vol: 0.07 * g, attack: 0.05, vib: 30, vibRate: 47, pan: p, dirt: true })
    burst({ dur: 0.3, vol: 0.1 * g, type: 'bandpass', f0: 2800, f1: 6200, q: 3, attack: 0.08, pan: p })
    crackle(10, 0.28, 0.06 * g, p, 0.02, 5200)
  },
  // Light gathers: a soft chord rising out of nothing, a shimmer over it.
  castHoly: (p, g) => {
    space(0.5)
    ;[D4, A4, D5].forEach((m, k) => tone({ wave: 'sine', f0: midiHz(m), dur: 0.55, vol: (0.07 - k * 0.012) * g, attack: 0.2 + k * 0.04, pan: p }))
    burst({ dur: 0.5, vol: 0.05 * g, type: 'highpass', f0: 6500, attack: 0.25, pan: p })
  },
  // Darkness drawn in: air sucked backwards, a low throat.
  castShadow: (p, g) => {
    space(0.4)
    burst({ dur: 0.36, vol: 0.36 * g, type: 'bandpass', f0: 320, f1: 2400, q: 2, attack: 0.32, pan: p - 0.25, panTo: p + 0.25 })
    growl(70, 55, 0.4, 0.16 * g, p, 0.05, 15)
  },
  // A brew: a cork, a slosh, bubbles.
  castPoison: (p, g) => {
    space(0.14)
    tone({ wave: 'sine', f0: 900, f1: 300, dur: 0.06, vol: 0.12 * g, pan: p })
    burst({ dur: 0.22, vol: 0.12 * g, type: 'bandpass', f0: 900, f1: 500, q: 1.2, attack: 0.03, at: 0.05, pan: p })
    for (let k = 0; k < 4; k++) tone({ wave: 'sine', f0: 240 + Math.random() * 300, f1: 520 + Math.random() * 300, dur: 0.05, vol: 0.06 * g, at: 0.08 + k * 0.05, pan: p })
  },
  // Blood: a heartbeat, twice, and a wet pull.
  castBlood: (p, g) => {
    space(0.12)
    boom(62, 40, 0.16, 0.26 * g, p)
    boom(58, 38, 0.14, 0.2 * g, p, 0.2)
    burst({ dur: 0.3, vol: 0.1 * g, type: 'lowpass', f0: 1200, f1: 300, attack: 0.08, at: 0.05, pan: p })
  },
  // The earth stirs: a rumble rising, grit shifting.
  castEarth: (p, g) => {
    space(0.24)
    rumble(0.5, 0.22 * g, p, 0, 140)
    crackle(6, 0.4, 0.07 * g, p, 0.05, 1200)
    boom(70, 55, 0.3, 0.12 * g, p, 0.1)
  },
  // Wind: a gust drawn across the field.
  castWind: (p, g) => {
    space(0.3)
    whoosh(400, 2400, 700, 0.5, 0.4 * g, p)
    whoosh(900, 3400, 1200, 0.35, 0.15 * g, p, 0.12, 3)
  },
  // The wild answers: leaves rustling, a bird's call.
  castNature: (p, g) => {
    space(0.3)
    for (let k = 0; k < 4; k++) burst({ dur: 0.07, vol: 0.15 * g, type: 'bandpass', f0: 2200 + Math.random() * 1200, q: 0.9, at: k * 0.06, pan: p + (Math.random() - 0.5) * 0.4 })
    tone({ wave: 'sine', f0: 2100, f1: 3300, dur: 0.09, vol: 0.09 * g, at: 0.12, pan: p })
    tone({ wave: 'sine', f0: 2600, f1: 3600, dur: 0.07, vol: 0.07 * g, at: 0.24, pan: p })
  },
  // Arcane: a quick run of glassy notes, a sparkle.
  castArcane: (p, g) => {
    space(0.45)
    arp([84, 88, 91, 96], 0.04, 'tri', 0.035 * g, 0.18, 0, p)
    burst({ dur: 0.35, vol: 0.06 * g, type: 'highpass', f0: 7000, attack: 0.12, pan: p })
  },
  // Time: a clock's ticks, and a swell drawn backwards.
  castTime: (p, g) => {
    space(0.4)
    for (let k = 0; k < 3; k++) crack(0.12 * g, p, k * 0.08, 3600, 0.01)
    tone({ wave: 'sine', f0: 380, f1: 760, dur: 0.4, vol: 0.06 * g, attack: 0.35, pan: p })
    tone({ wave: 'sine', f0: 383, f1: 766, dur: 0.4, vol: 0.04 * g, attack: 0.35, pan: p })
  },
  // Spirits: a ghostly rising tone, breath in the air.
  castSpirit: (p, g) => {
    space(0.55)
    tone({ wave: 'sine', f0: 440, f1: 560, dur: 0.6, vol: 0.06 * g, attack: 0.2, vib: 9, vibRate: 5, pan: p })
    tone({ wave: 'sine', f0: 446, f1: 566, dur: 0.6, vol: 0.04 * g, attack: 0.22, vib: 9, vibRate: 5.5, pan: p })
    burst({ dur: 0.5, vol: 0.06 * g, type: 'highpass', f0: 3000, attack: 0.25, pan: p })
  },
  // A song: a plucked chord, a bright bell over it.
  castSong: (p, g) => {
    space(0.35)
    arp([D5, F5, A5], 0.05, 'tri', 0.1 * g, 0.3, 0, p)
    bell(86, 0.045 * g, 0.4, 0.12, p)
  },
  // A machine: a servo whirring up, a click, a beep.
  castTech: (p, g) => {
    space(0.12)
    tone({ wave: 'p12', f0: 180, f1: 760, dur: 0.16, vol: 0.05 * g, pan: p })
    crack(0.16 * g, p, 0.16, 3000, 0.012)
    tone({ wave: 'sine', f0: 1480, dur: 0.06, vol: 0.06 * g, at: 0.2, pan: p })
  },
  // A command: a horn call, two notes.
  castCommand: (p, g) => {
    space(0.4)
    tone({ wave: 'saw', f0: midiHz(D4), dur: 0.32, vol: 0.06 * g, attack: 0.04, pan: p, dirt: true })
    tone({ wave: 'saw', f0: midiHz(A4), dur: 0.42, vol: 0.05 * g, attack: 0.04, at: 0.18, pan: p, dirt: true })
  },
  // A fireball lands: the snap, a sub shove, the blast's roar, the flames crackling after it.
  impactFire: (p, g) => {
    space(0.4)
    crack(0.42 * g, p, 0, 1400, 0.025)
    boom(100, 30, 0.7, 0.45 * g, p)
    burst({ dur: 0.8, vol: 0.34 * g, type: 'lowpass', f0: 3600, f1: 160, pan: p, dirt: true })
    crackle(14, 0.8, 0.09 * g, p, 0.1)
  },
  // Ice shatters: a crunch, shards ringing out of tune, a cold hiss.
  impactIce: (p, g) => {
    space(0.42)
    crack(0.32 * g, p, 0, 5000, 0.02)
    for (let k = 0; k < 7; k++) metal(3000 + Math.random() * 4000, 0.28, 0.03 * g, p + (Math.random() - 0.5) * 0.5, k * 0.025)
    burst({ dur: 0.25, vol: 0.12 * g, type: 'highpass', f0: 4000, f1: 9000, pan: p })
    tone({ wave: 'sine', f0: 180, f1: 90, dur: 0.12, vol: 0.12 * g, pan: p })
  },
  // A spark strikes: a sharp crack, a falling zap, crackling.
  impactShock: (p, g) => {
    space(0.24)
    crack(0.46 * g, p, 0, 6000, 0.015)
    tone({ wave: 'saw', f0: 1800, f1: 160, dur: 0.14, vol: 0.09 * g, pan: p, dirt: true })
    crackle(12, 0.22, 0.07 * g, p, 0.01, 5500)
    boom(130, 60, 0.18, 0.14 * g, p)
  },
  // A gust strikes: air slamming past, a knock.
  impactWind: (p, g) => {
    space(0.3)
    whoosh(300, 3200, 500, 0.4, 0.3 * g, p)
    crack(0.18 * g, p, 0.1, 1500, 0.02)
  },
  // The wild strikes: a woody thud, roots and splinters.
  impactNature: (p, g) => {
    space(0.2)
    boom(140, 70, 0.25, 0.24 * g, p)
    crack(0.22 * g, p, 0, 1200, 0.02)
    crackle(6, 0.3, 0.07 * g, p, 0.03, 1200)
    burst({ dur: 0.2, vol: 0.08 * g, type: 'bandpass', f0: 1800, q: 1, pan: p })
  },
  // Arcane lands: a glassy pop and a sparkle falling away.
  impactArcane: (p, g) => {
    space(0.42)
    crack(0.26 * g, p, 0, 7000, 0.012)
    metal(2093, 0.4, 0.05 * g, p)
    arp([96, 91, 88], 0.035, 'tri', 0.03 * g, 0.14, 0.03, p)
    burst({ dur: 0.35, vol: 0.07 * g, type: 'highpass', f0: 6000, pan: p })
  },
  // Time snaps shut: a tick, a chime falling backwards.
  impactTime: (p, g) => {
    space(0.42)
    crack(0.2 * g, p, 0, 3600, 0.01)
    bell(86, 0.05 * g, 0.5, 0, p)
    tone({ wave: 'sine', f0: 1200, f1: 600, dur: 0.3, vol: 0.05 * g, pan: p })
  },
  // A spirit strikes: a wail falling, a cold breath.
  impactSpirit: (p, g) => {
    space(0.5)
    tone({ wave: 'sine', f0: 720, f1: 300, dur: 0.4, vol: 0.07 * g, vib: 12, vibRate: 7, pan: p })
    burst({ dur: 0.3, vol: 0.1 * g, type: 'bandpass', f0: 1200, f1: 600, q: 1.4, attack: 0.04, pan: p })
    crack(0.14 * g, p, 0, 2000, 0.015)
  },
  // A note strikes: a bright chord stabbed, a thump.
  impactSong: (p, g) => {
    space(0.3)
    for (const m of [D5, F5, A5]) tone({ wave: 'tri', f0: midiHz(m), dur: 0.22, vol: 0.045 * g, pan: p })
    crack(0.16 * g, p, 0, 2500, 0.015)
    boom(120, 80, 0.12, 0.1 * g, p)
  },
  // A grenade, a bolt: a metallic bang, shrapnel.
  impactTech: (p, g) => {
    space(0.32)
    crack(0.36 * g, p, 0, 3000, 0.02)
    boom(120, 40, 0.42, 0.34 * g, p)
    metal(900, 0.3, 0.05 * g, p)
    crackle(8, 0.4, 0.08 * g, p, 0.05, 3000)
  },
  // ── The colosseum's crowd (#117) ──
  // A wave falls: a thousand voices swelling ("yeah!") in three formant bands,
  // drifting across the stands, and claps scattered through it.
  crowdCheer: (p, g) => {
    space(0.55)
    for (const [f0, f1, v] of [[500, 900, 0.16], [1100, 1700, 0.12], [2400, 3000, 0.07]] as const) {
      burst({ dur: 1.4, vol: v * g, type: 'bandpass', f0, fmid: f1, fmidAt: 0.3, f1: f0 * 0.8, q: 1.6, attack: 0.25, pan: p - 0.4, panTo: p + 0.4 })
    }
    for (let k = 0; k < 18; k++) crack(0.05 * g * (0.5 + Math.random()), p + (Math.random() - 0.5) * 1.4, 0.15 + Math.random() * 1.0, 1800 + Math.random() * 1600, 0.012)
  },
  // A milestone: the whole house on its feet, longer and louder, and a horn call over it.
  crowdRoar: (p, g) => {
    space(0.6)
    for (const [f0, f1, v] of [[420, 1000, 0.22], [1000, 1900, 0.16], [2200, 3200, 0.1]] as const) {
      burst({ dur: 2.4, vol: v * g, type: 'bandpass', f0, fmid: f1, fmidAt: 0.25, f1: f0 * 0.75, q: 1.4, attack: 0.3, pan: p - 0.6, panTo: p + 0.6 })
    }
    for (let k = 0; k < 34; k++) crack(0.05 * g * (0.5 + Math.random()), p + (Math.random() - 0.5) * 1.6, 0.2 + Math.random() * 1.8, 1800 + Math.random() * 1600, 0.012)
    tone({ wave: 'saw', f0: midiHz(D4), dur: 0.36, vol: 0.06 * g, attack: 0.04, at: 0.1, pan: p, dirt: true })
    tone({ wave: 'saw', f0: midiHz(A4), dur: 0.7, vol: 0.06 * g, attack: 0.04, at: 0.42, pan: p, dirt: true })
    tone({ wave: 'saw', f0: midiHz(D5), dur: 0.9, vol: 0.05 * g, attack: 0.05, at: 0.42, pan: p, dirt: true })
  },
  // An explosion: the snap, the sub that shoves the air, the blast's roar falling away, debris raining, the ground answering.
  explode: (p, g) => {
    space(0.45)
    crack(0.5 * g, p, 0, 1200, 0.03)
    boom(90, 26, 1.0, 0.58 * g, p)
    burst({ dur: 1.1, vol: 0.46 * g, type: 'lowpass', f0: 4200, f1: 110, pan: p, dirt: true })
    rumble(1.4, 0.28 * g, p, 0.08)
    crackle(12, 1.0, 0.1 * g, p, 0.2, 2200)
  },
  // A blink: air drawn in, a pop, the air let go the other side.
  teleport: (p, g) => {
    space(0.42)
    burst({ dur: 0.2, vol: 0.16 * g, type: 'bandpass', f0: 600, f1: 5200, q: 3, attack: 0.18, pan: p - 0.3, panTo: p })
    crack(0.22 * g, p, 0.2, 2400, 0.014)
    whoosh(5200, 2400, 600, 0.26, 0.12 * g, p + 0.2, 0.21, 3)
  },
  // ── Abilities ──
  // Something called up: a dark swell out of the ground, a drone, a cold shimmer.
  summon: (p, g) => {
    space(0.5)
    burst({ dur: 0.6, vol: 0.2 * g, type: 'bandpass', f0: 180, f1: 1600, q: 1.4, attack: 0.45, pan: p })
    tone({ wave: 'saw', f0: midiHz(D4 - 24), dur: 0.8, vol: 0.08 * g, attack: 0.3, pan: p, dirt: true })
    metal(1180, 0.7, 0.04 * g, p, 0.45)
    crack(0.2 * g, p, 0.48, 1400, 0.02)
  },
  heal: (p, g) => {
    space(0.42)
    for (const [m, at] of [[D5, 0], [F5, 0.06], [A5, 0.12], [D6, 0.18]] as const) {
      tone({ wave: 'sine', f0: midiHz(m), dur: 0.7, vol: 0.07 * g, attack: 0.08, at, pan: p })
      tone({ wave: 'sine', f0: midiHz(m) * 1.005, dur: 0.7, vol: 0.05 * g, attack: 0.1, at, pan: p })
    }
    burst({ dur: 0.6, vol: 0.06 * g, type: 'highpass', f0: 6500, attack: 0.15, pan: p })
  },
  shieldUp: (p, g) => {
    space(0.32)
    whoosh(300, 1800, 1200, 0.28, 0.14 * g, p, 0, 2)
    tone({ wave: 'sine', f0: 180, f1: 360, dur: 0.3, vol: 0.12 * g, attack: 0.05, pan: p, dirt: true })
    metal(1040, 0.6, 0.08 * g, p, 0.2)
  },
  // A beast's roar: a throat, a sub under it, the breath of it.
  roar: (p, g) => {
    space(0.42)
    growl(110, 72, 1.1, 0.24 * g, p, 0, 26)
    growl(165, 100, 0.95, 0.1 * g, p, 0.04, 31)
    tone({ wave: 'sine', f0: 55, f1: 40, dur: 1.0, vol: 0.2 * g, attack: 0.08, pan: p, dirt: true })
  },
  // A wind-up worth dodging: a low swell of dread, quiet.
  telegraph: (p, g) => {
    space(0.3)
    burst({ dur: 0.36, vol: 0.08 * g, type: 'bandpass', f0: 260, f1: 1100, q: 2.2, attack: 0.3, pan: p })
    tone({ wave: 'sine', f0: 58, f1: 78, dur: 0.38, vol: 0.12 * g, attack: 0.25, pan: p, dirt: true })
  },
  overheat: (_p, g) => {
    space(0.2)
    burst({ dur: 0.7, vol: 0.2 * g, type: 'highpass', f0: 3000, f1: 6500, q: 0.7 })
    tone({ wave: 'saw', f0: 700, f1: 180, dur: 0.5, vol: 0.1 * g, vib: 40, vibRate: 30, dirt: true })
    for (let k = 0; k < 3; k++) metal(1800 - k * 300, 0.25, 0.04 * g, 0, 0.1 + k * 0.09)
  },
  // ── Enemies ──
  // A foe sees him: a short snarl.
  alert: (p, g) => {
    space(0.2)
    growl(150, 120, 0.32, 0.22 * g, p, 0, 30)
  },
  // A boss steps in: a hit, a low brass of a drone opening up, a roar, all of it in a great hall.
  bossIntro: (_p, g) => {
    space(0.55)
    crack(0.4 * g, 0, 0, 900, 0.04)
    boom(70, 26, 1.4, 0.55 * g, 0)
    for (const [m, det] of [[D4 - 24, 0], [D4 - 24, 9], [A4 - 24, 0], [D4 - 12, 5]] as const) {
      tone({ wave: 'saw', f0: midiHz(m) * Math.pow(2, det / 1200), dur: 2.1, vol: 0.06 * g, attack: 0.25, dirt: true })
    }
    rumble(1.8, 0.24 * g, 0, 0.05)
    growl(100, 64, 1.4, 0.16 * g, 0, 0.35, 22)
  },
  // A foe goes down: a body hitting the ground, the breath leaving it.
  death: (p, g) => {
    space(0.18)
    boom(120, 45, 0.24, 0.3 * g, p, 0.02)
    burst({ dur: 0.22, vol: 0.16 * g, type: 'lowpass', f0: 900, f1: 220, at: 0.02, pan: p, dirt: true })
    burst({ dur: 0.3, vol: 0.08 * g, type: 'bandpass', f0: 800, f1: 400, q: 2, attack: 0.04, at: 0.05, pan: p })
  },
  // A boss falls: the blast, the ground shaking, its last roar falling away.
  deathBig: (p, g) => {
    space(0.55)
    crack(0.44 * g, p, 0, 1000, 0.04)
    boom(80, 24, 1.3, 0.58 * g, p)
    burst({ dur: 1.2, vol: 0.4 * g, type: 'lowpass', f0: 3200, f1: 90, pan: p, dirt: true })
    rumble(1.8, 0.32 * g, p, 0.1)
    growl(120, 50, 1.3, 0.14 * g, p, 0.1, 20)
    crackle(10, 1.2, 0.08 * g, p, 0.3, 1800)
  },
  // ── Rewards ──
  coin: (p, g) => {
    bell(A5 + 12, 0.1 * g, 0.12, 0, p)
    bell(D6 + 12, 0.1 * g, 0.2, 0.06, p)
  },
  loot: (_p, g) => {
    arp([D5, F5, A5, D6], 0.07, 'tri', 0.14 * g, 0.2)
    bell(D6 + 12, 0.1 * g, 0.5, 0.3)
  },
  // A find of a higher tier (3 rare, 4–5 epic, 6 legendary): the same rising
  // pentatonic as `loot`, longer and brighter by tier, the legendary with a
  // shimmer of bells over a held chord.
  lootRare: (_p, g) => {
    arp([A4, D5, F5, A5, D6], 0.065, 'tri', 0.15 * g, 0.24)
    bell(D6 + 12, 0.11 * g, 0.6, 0.32)
    bell(A5 + 12, 0.07 * g, 0.5, 0.4)
  },
  lootEpic: (_p, g) => {
    tone({ wave: 'sine', f0: 220, f1: 880, dur: 0.22, vol: 0.06 * g })
    arp([D4, A4, D5, F5, A5, D6], 0.065, 'tri', 0.16 * g, 0.28, 0.06)
    arp([D5, A5, D6], 0.0, 'sine', 0.08 * g, 0.9, 0.46)
    bell(D6 + 12, 0.13 * g, 0.8, 0.5)
  },
  lootLegend: (_p, g) => {
    burst({ dur: 0.5, vol: 0.06 * g, type: 'highpass', f0: 5000 })
    arp([D4, A4, D5, F5, A5, C5 + 12, D6], 0.07, 'tri', 0.17 * g, 0.3, 0.05)
    arp([D4 - 12, A4 - 12, D4, F4], 0.0, 'sine', 0.11 * g, 1.3, 0.5)
    for (let k = 0; k < 6; k++) bell([D6, A5 + 12, F5 + 12, D6 + 12, A5 + 12, D6 + 12][k]!, (0.09 - k * 0.008) * g, 0.7, 0.55 + k * 0.09)
  },
  chest: (_p, g) => {
    burst({ dur: 0.16, vol: 0.16 * g, type: 'bandpass', f0: 500, f1: 1400, q: 1.4 })
    arp([D4, A4, D5, F5, A5, D6], 0.07, 'tri', 0.16 * g, 0.24, 0.1)
    bell(D6 + 12, 0.12 * g, 0.7, 0.55)
  },
  levelUp: (_p, g) => {
    arp([D4, A4, D5, F5, A5], 0.08, 'tri', 0.18 * g, 0.26)
    arp([D4 - 12, A4 - 12, D4], 0.16, 'sine', 0.18 * g, 0.4)
    bell(D6, 0.14 * g, 0.9, 0.42)
    bell(A5 + 12, 0.1 * g, 0.9, 0.46)
  },
  potion: (_p, g) => {
    for (let k = 0; k < 5; k++) tone({ wave: 'sine', f0: 300 + k * 70, f1: 620 + k * 90, dur: 0.06, vol: 0.14 * g, at: k * 0.055 })
    bell(A5, 0.1 * g, 0.4, 0.3)
  },
  // ── UI ──
  denied: (_p, g) => {
    tone({ wave: 'tri', f0: 180, f1: 130, dur: 0.12, vol: 0.16 * g })
    tone({ wave: 'tri', f0: 150, f1: 110, dur: 0.14, vol: 0.14 * g, at: 0.09 })
  },
  uiClick: (_p, g) => {
    tone({ wave: 'sine', f0: 1100, f1: 760, dur: 0.05, vol: 0.12 * g })
    burst({ dur: 0.025, vol: 0.05 * g, type: 'highpass', f0: 4000 })
  },
  uiOpen: (_p, g) => arp([A4, D5], 0.05, 'sine', 0.11 * g, 0.1),
  uiClose: (_p, g) => arp([D5, A4], 0.045, 'sine', 0.08 * g, 0.08),
  uiEquip: (_p, g) => {
    burst({ dur: 0.08, vol: 0.14 * g, type: 'bandpass', f0: 2200, q: 1.5 })
    tone({ wave: 'tri', f0: 520, f1: 780, dur: 0.1, vol: 0.12 * g, at: 0.03 })
    bell(D6, 0.06 * g, 0.2, 0.08)
  },
  uiBuy: (_p, g) => {
    bell(A5 + 12, 0.1 * g, 0.12)
    bell(D6 + 12, 0.1 * g, 0.14, 0.05)
    bell(F5 + 24, 0.1 * g, 0.3, 0.1)
  },
  uiLearn: (_p, g) => {
    arp([D5, A5, D6, F5 + 12], 0.07, 'tri', 0.13 * g, 0.22)
    burst({ dur: 0.4, vol: 0.06 * g, type: 'highpass', f0: 5000, attack: 0.08 })
  },
  uiPoint: (_p, g) => {
    tone({ wave: 'tri', f0: midiHz(D5), f1: midiHz(A5), dur: 0.1, vol: 0.13 * g })
    bell(D6, 0.07 * g, 0.2, 0.06)
  },
  uiChoice: (_p, g) => {
    bell(D5, 0.14 * g, 0.6)
    bell(A4, 0.12 * g, 0.7, 0.05)
    tone({ wave: 'sine', f0: midiHz(D4 - 12), dur: 0.7, vol: 0.14 * g })
  },
  mapMove: (_p, g) => {
    burst({ dur: 0.12, vol: 0.09 * g, type: 'bandpass', f0: 1400, f1: 500, q: 1.5 })
    tone({ wave: 'sine', f0: midiHz(G4), f1: midiHz(D5), dur: 0.1, vol: 0.09 * g })
  }
}

// ─── Drop-in SFX files ───────────────────────────────────────────────────────
// A file in public/audio/sfx/ named after a recipe replaces it (see
// `game/assets/overrides.ts`). Decoded on an OfflineAudioContext, which needs
// no user gesture, so the buffers are ready before the first swing and the
// autoplay policy never sees a context it would refuse.

/** Drop-ins are mastered hotter than the synth voices; this evens them out. */
const FILE_GAIN = 0.55
const fileBuffers = new Map<string, AudioBuffer>()
let filesRequested = false

/** Fetch and decode every drop-in SFX file (from the boot loader). */
export const loadSfxOverrides = (): void => {
  if (filesRequested || SFX_FILES.size === 0) return
  filesRequested = true
  const Offline = window.OfflineAudioContext
    ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext
  if (!Offline) return
  const decoder = new Offline(2, 1, 44100)
  for (const [name, url] of SFX_FILES) {
    fetch(url)
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(buf => decoder.decodeAudioData(buf))
      .then(ab => { fileBuffers.set(name, ab) })
      .catch(e => console.warn(`[sfx] drop-in "${name}" could not be loaded — keeping the synth`, e))
  }
}

const playFile = (buf: AudioBuffer, pan: number, gain: number): void => {
  const a = audio()
  if (!a) return
  const dest = out(pan)
  if (!dest) return
  const src = a.ctx.createBufferSource()
  src.buffer = buf
  src.playbackRate.value = pitch
  const g = a.ctx.createGain()
  g.gain.value = FILE_GAIN * gain
  src.connect(g).connect(dest)
  src.start()
  registerOneShotSource(src)
}

const play = (name: SfxName, pan: number, gain: number, muffle = 0): void => {
  if (!canPlay()) return
  const a = audio()
  if (!a || a.ctx.state !== 'running') return
  const gap = GAP[name] ?? 0.02
  const now = a.ctx.currentTime
  const last = lastAt.get(name) ?? -1
  if (now - last < gap) return
  while (recent.length && now - recent[0]! > CAP_WINDOW) recent.shift()
  if (recent.length >= CAP && !NEVER_DROP.has(name)) return
  recent.push(now)
  lastAt.set(name, now)
  const vary = VARY.has(name)
  const g = Math.max(0.05, Math.min(1.4, gain * (TRIM[name] ?? 1) * (vary ? 0.9 + Math.random() * 0.2 : 1)))
  pitch = vary ? 0.95 + Math.random() * 0.1 : 1
  const duckFor = DUCK_FOR[name]
  if (duckFor) duckMusic(duckFor)
  // Muffled: one low-pass in front of the SAME sfx bus, so the mute, the
  // volume and the ad gates hold for it like for any other sound.
  if (muffle > 0.01) {
    try {
      route = a.ctx.createBiquadFilter()
      route.type = 'lowpass'
      route.frequency.value = muffleHz(muffle)
      route.Q.value = 0.7
      route.connect(a.sfx)
      // Every voice of a recipe ends within ~2 s; then the filter goes too.
      const r = route
      setTimeout(() => { try { r.disconnect() } catch { /* gone */ } }, 2500)
    } catch { route = null }
  }
  try {
    const file = fileBuffers.get(name)
    if (file) playFile(file, pan, g)
    else RECIPES[name]?.(pan, g)
  } catch { /* a voice failed to start — never fatal */ } finally {
    route = null
    pitch = 1
    wet = 0
  }
}

/**
 * Voice one sound straight into whatever graph `audio()` hands out, without the
 * live player's gates (gap, cap, mute): the trailer's offline sound render
 * (`tools/sfx-render.mjs`) plays the game's own recipes into an offline context.
 */
export const recipeFor = (name: SfxName, pan = 0, gain = 1, tune = 1): boolean => {
  const r = RECIPES[name]
  if (!r) return false
  pitch = tune
  try {
    r(pan, Math.max(0.05, Math.min(1.4, gain * (TRIM[name] ?? 1))))
  } finally {
    pitch = 1
    wet = 0
  }
  return true
}

export const installSynth = (): void => {
  setSfxPlayer(play)
}
