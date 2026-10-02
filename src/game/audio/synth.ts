import { registerOneShotSource } from '@/use/useAssets'
import { audio, canPlay, noise, pulse, midiHz, duckMusic } from './engine'
import { setSfxPlayer, type SfxName } from './sfx'
import { SFX_FILES } from '../assets/overrides'

/**
 * ─── Synthesized SFX ─────────────────────────────────────────────────────────
 *
 * Every sound effect is a small recipe on a few voices: sine / triangle / saw
 * oscillators with pitch sweeps and vibrato, filtered noise bursts, and short
 * note runs. Nothing is sampled, so the whole set costs zero bytes of download
 * and is ready before the first frame.
 *
 * The recipes are layered the way a foley artist would build them: a blade is
 * a whoosh of band-passed noise with a thin metallic ring on top; a fireball
 * is a low roar under a bright crackle; a heal is a rising bell chord. Pitched
 * sounds stay inside one key (D minor pentatonic: D F G A C) so a busy fight
 * and the music never grind against each other.
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
}

const panners: StereoPannerNode[] = []
/** A muffled sound's low-pass (see `play`): while its recipe runs, every
 *  voice routes through it on its way to the sfx bus. */
let route: BiquadFilterNode | null = null
/** The current recipe's pitch factor (see `VARY`): every voice it starts is
 *  tuned by it. 1 outside `play`. */
let pitch = 1

const out = (pan: number): AudioNode | null => {
  const a = audio()
  if (!a) return null
  const bus = route ?? a.sfx
  if (!pan || !('createStereoPanner' in a.ctx)) return bus
  const p = a.ctx.createStereoPanner()
  p.pan.value = pan
  p.connect(bus)
  panners.push(p)
  if (panners.length > 64) panners.shift()?.disconnect()
  return p
}

const tone = (o: ToneOpts): void => {
  const a = audio()
  if (!a) return
  const dest = out(o.pan ?? 0)
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
  q?: number
  at?: number
  pan?: number
  attack?: number
}

const burst = (o: NoiseOpts): void => {
  const a = audio()
  const buf = noise()
  if (!a || !buf) return
  const dest = out(o.pan ?? 0)
  if (!dest) return
  const t = a.ctx.currentTime + (o.at ?? 0)
  const src = a.ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const f = a.ctx.createBiquadFilter()
  f.type = o.type ?? 'lowpass'
  f.Q.value = o.q ?? 0.8
  f.frequency.setValueAtTime((o.f0 ?? 4000) * pitch, t)
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

// Voice limiting: the same sound can only retrigger every `gap` seconds.
const lastAt = new Map<string, number>()
const GAP: Partial<Record<SfxName, number>> = {
  swing: 0.05, swingHeavy: 0.08, shoot: 0.05, cast: 0.07, hit: 0.035, hitHeavy: 0.06, crit: 0.06, hurt: 0.13,
  block: 0.08, dodge: 0.1, coin: 0.05, explode: 0.07, fire: 0.1, ice: 0.1, poison: 0.12, shadow: 0.1, quake: 0.12,
  alert: 0.3, death: 0.05, telegraph: 0.25, uiClick: 0.03, summon: 0.1, heal: 0.15, teleport: 0.08
}

/**
 * The sounds heard dozens of times a minute get a small random pitch (±5 %)
 * and level (±10 %) each time, so a fight is not one sample on repeat.
 */
const VARY: ReadonlySet<SfxName> = new Set<SfxName>([
  'swing', 'swingHeavy', 'shoot', 'cast', 'hit', 'hitHeavy', 'crit', 'coin', 'explode', 'death', 'hurt', 'block', 'fire'
])

/** The big stings: the music steps back under them (seconds). */
const DUCK_FOR: Partial<Record<SfxName, number>> = { bossIntro: 1.8, levelUp: 1.6, chest: 1.2, deathBig: 1.2 }

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
  'uiChoice', 'potion', 'chest', 'loot', 'deathBig', 'overheat'
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
  // A blade through the air: a band of noise swept up and back, a thin ring.
  swing: (p, g) => {
    burst({ dur: 0.16, vol: 0.2 * g, type: 'bandpass', f0: 900, f1: 3600, q: 1.6, attack: 0.03, pan: p })
    tone({ wave: 'sine', f0: 2400, f1: 1500, dur: 0.1, vol: 0.035 * g, at: 0.05, pan: p })
  },
  swingHeavy: (p, g) => {
    burst({ dur: 0.26, vol: 0.26 * g, type: 'bandpass', f0: 420, f1: 2200, q: 1.3, attack: 0.05, pan: p })
    tone({ wave: 'tri', f0: 150, f1: 70, dur: 0.22, vol: 0.14 * g, pan: p })
  },
  // A gun or a bowstring: a sharp crack over a short thump.
  shoot: (p, g) => {
    burst({ dur: 0.07, vol: 0.26 * g, type: 'highpass', f0: 2600, pan: p })
    tone({ wave: 'tri', f0: 620, f1: 150, dur: 0.1, vol: 0.2 * g, pan: p })
    tone({ wave: 'sine', f0: 1900, f1: 900, dur: 0.06, vol: 0.06 * g, pan: p })
  },
  // A spell leaving the hand: a rising shimmer.
  cast: (p, g) => {
    tone({ wave: 'sine', f0: midiHz(A4), f1: midiHz(D6), dur: 0.22, vol: 0.13 * g, vib: 18, vibRate: 24, pan: p })
    tone({ wave: 'tri', f0: midiHz(D5), f1: midiHz(A5), dur: 0.18, vol: 0.07 * g, at: 0.02, pan: p })
    burst({ dur: 0.2, vol: 0.07 * g, type: 'bandpass', f0: 3000, f1: 7000, q: 2, pan: p })
  },
  // ── Impacts ──
  hit: (p, g) => {
    burst({ dur: 0.07, vol: 0.26 * g, type: 'bandpass', f0: 1900, q: 1.1, pan: p })
    tone({ wave: 'tri', f0: 260, f1: 110, dur: 0.08, vol: 0.2 * g, pan: p })
  },
  hitHeavy: (p, g) => {
    burst({ dur: 0.16, vol: 0.34 * g, f0: 2600, f1: 320, pan: p })
    tone({ wave: 'tri', f0: 170, f1: 55, dur: 0.18, vol: 0.34 * g, pan: p })
    tone({ wave: 'sine', f0: 90, f1: 40, dur: 0.22, vol: 0.22 * g, pan: p })
  },
  // A critical: the heavy hit plus a bright ringing fifth.
  crit: (p, g) => {
    burst({ dur: 0.18, vol: 0.32 * g, f0: 6500, f1: 700, pan: p })
    tone({ wave: 'tri', f0: 190, f1: 60, dur: 0.2, vol: 0.3 * g, pan: p })
    bell(D6, 0.14 * g, 0.34, 0.01, p)
    bell(A5 + 12, 0.1 * g, 0.3, 0.04, p)
  },
  // Steel on a shield.
  block: (p, g) => {
    tone({ wave: 'tri', f0: 1500, f1: 1150, dur: 0.14, vol: 0.2 * g, pan: p })
    tone({ wave: 'sine', f0: 3100, f1: 2600, dur: 0.2, vol: 0.07 * g, pan: p })
    burst({ dur: 0.06, vol: 0.18 * g, type: 'highpass', f0: 3200, pan: p })
  },
  dodge: (p, g) => burst({ dur: 0.16, vol: 0.14 * g, type: 'bandpass', f0: 2600, f1: 700, q: 2, attack: 0.02, pan: p }),
  // The hero is hit: a dull thud and a falling pair of notes.
  hurt: (p, g) => {
    burst({ dur: 0.12, vol: 0.24 * g, f0: 1500, f1: 300, pan: p })
    tone({ wave: 'tri', f0: midiHz(A4), f1: midiHz(D4), dur: 0.16, vol: 0.2 * g, pan: p * 0.5 })
  },
  // ── Elements ──
  fire: (p, g) => {
    burst({ dur: 0.42, vol: 0.24 * g, f0: 1400, f1: 260, attack: 0.03, pan: p })
    burst({ dur: 0.22, vol: 0.12 * g, type: 'bandpass', f0: 2600, f1: 5200, q: 2.4, pan: p })
    tone({ wave: 'saw', f0: 110, f1: 70, dur: 0.3, vol: 0.09 * g, pan: p })
  },
  ice: (p, g) => {
    burst({ dur: 0.3, vol: 0.14 * g, type: 'bandpass', f0: 7000, f1: 2400, q: 4, pan: p })
    for (let k = 0; k < 4; k++) bell(D6 + 7 - k * 3, 0.07 * g, 0.16, k * 0.045, p)
  },
  holy: (p, g) => {
    bell(D5, 0.14 * g, 0.5, 0, p)
    bell(A5, 0.12 * g, 0.5, 0.03, p)
    bell(D6, 0.1 * g, 0.55, 0.06, p)
    burst({ dur: 0.35, vol: 0.06 * g, type: 'highpass', f0: 5000, attack: 0.05, pan: p })
  },
  shadow: (p, g) => {
    tone({ wave: 'saw', f0: 180, f1: 62, dur: 0.38, vol: 0.14 * g, vib: 22, vibRate: 9, pan: p })
    burst({ dur: 0.34, vol: 0.14 * g, type: 'bandpass', f0: 700, f1: 240, q: 2.6, pan: p })
  },
  poison: (p, g) => {
    for (let k = 0; k < 4; k++) tone({ wave: 'sine', f0: 240 + k * 90, f1: 520 + k * 130, dur: 0.07, vol: 0.12 * g, at: k * 0.05, pan: p })
    burst({ dur: 0.26, vol: 0.1 * g, type: 'bandpass', f0: 1200, f1: 500, q: 3, pan: p })
  },
  blood: (p, g) => {
    tone({ wave: 'sine', f0: 320, f1: 90, dur: 0.24, vol: 0.2 * g, pan: p })
    burst({ dur: 0.2, vol: 0.14 * g, type: 'lowpass', f0: 900, f1: 260, pan: p })
    tone({ wave: 'tri', f0: midiHz(F4), f1: midiHz(D4), dur: 0.3, vol: 0.07 * g, at: 0.06, pan: p })
  },
  quake: (p, g) => {
    burst({ dur: 0.5, vol: 0.4 * g, f0: 700, f1: 60, pan: p })
    tone({ wave: 'sine', f0: 95, f1: 34, dur: 0.5, vol: 0.4 * g, pan: p })
    burst({ dur: 0.16, vol: 0.16 * g, type: 'bandpass', f0: 1600, q: 1.2, pan: p })
  },
  beam: (p, g) => {
    tone({ wave: 'saw', f0: 520, f1: 1300, dur: 0.45, vol: 0.1 * g, vib: 30, vibRate: 40, pan: p })
    tone({ wave: 'sine', f0: 1040, f1: 2600, dur: 0.45, vol: 0.08 * g, pan: p })
    burst({ dur: 0.45, vol: 0.1 * g, type: 'bandpass', f0: 4200, f1: 6800, q: 3, pan: p })
  },
  explode: (p, g) => {
    burst({ dur: 0.5, vol: 0.42 * g, f0: 2800, f1: 110, pan: p })
    tone({ wave: 'sine', f0: 140, f1: 36, dur: 0.42, vol: 0.34 * g, pan: p })
    burst({ dur: 0.12, vol: 0.2 * g, type: 'highpass', f0: 3500, pan: p })
  },
  teleport: (p, g) => {
    tone({ wave: 'sine', f0: 300, f1: 2200, dur: 0.16, vol: 0.14 * g, pan: p })
    tone({ wave: 'sine', f0: 2200, f1: 500, dur: 0.2, vol: 0.1 * g, at: 0.12, pan: p })
    burst({ dur: 0.24, vol: 0.08 * g, type: 'bandpass', f0: 5000, f1: 1500, q: 3, pan: p })
  },
  // ── Abilities ──
  summon: (p, g) => {
    arp([D4, A4, D5, F5], 0.045, 'tri', 0.13 * g, 0.12, 0, p)
    burst({ dur: 0.3, vol: 0.1 * g, type: 'bandpass', f0: 600, f1: 2400, q: 1.6, attack: 0.05, pan: p })
  },
  heal: (p, g) => {
    bell(D5, 0.12 * g, 0.4, 0, p)
    bell(F5, 0.12 * g, 0.4, 0.07, p)
    bell(A5, 0.12 * g, 0.5, 0.14, p)
    bell(D6, 0.1 * g, 0.6, 0.21, p)
  },
  shieldUp: (p, g) => {
    tone({ wave: 'tri', f0: midiHz(D4), f1: midiHz(D5), dur: 0.2, vol: 0.14 * g, pan: p })
    bell(A5, 0.1 * g, 0.4, 0.12, p)
    burst({ dur: 0.25, vol: 0.07 * g, type: 'highpass', f0: 4000, attack: 0.06, pan: p })
  },
  roar: (p, g) => {
    tone({ wave: 'saw', f0: 150, f1: 70, dur: 0.6, vol: 0.2 * g, vib: 14, vibRate: 27, attack: 0.05, pan: p })
    tone({ wave: 'saw', f0: 226, f1: 100, dur: 0.55, vol: 0.12 * g, vib: 20, vibRate: 31, attack: 0.05, pan: p })
    burst({ dur: 0.55, vol: 0.2 * g, type: 'bandpass', f0: 900, f1: 380, q: 1.4, attack: 0.05, pan: p })
  },
  // A wind-up worth dodging: a short rising warning, quiet.
  telegraph: (p, g) => {
    tone({ wave: 'tri', f0: midiHz(D4), f1: midiHz(A4), dur: 0.24, vol: 0.09 * g, pan: p })
    burst({ dur: 0.24, vol: 0.05 * g, type: 'bandpass', f0: 800, f1: 2200, q: 2, attack: 0.08, pan: p })
  },
  overheat: (_p, g) => {
    burst({ dur: 0.7, vol: 0.2 * g, type: 'highpass', f0: 3000, f1: 6500, q: 0.7 })
    tone({ wave: 'saw', f0: 700, f1: 180, dur: 0.5, vol: 0.12 * g, vib: 40, vibRate: 30 })
    arp([A5, F5, D5], 0.09, 'p25', 0.08 * g, 0.1)
  },
  // ── Enemies ──
  alert: (p, g) => {
    tone({ wave: 'tri', f0: midiHz(A4), dur: 0.1, vol: 0.13 * g, pan: p })
    tone({ wave: 'tri', f0: midiHz(D5), dur: 0.16, vol: 0.13 * g, at: 0.09, pan: p })
  },
  bossIntro: (_p, g) => {
    tone({ wave: 'saw', f0: midiHz(D4 - 24), dur: 1.3, vol: 0.2 * g, vib: 3, vibRate: 6, attack: 0.08 })
    tone({ wave: 'tri', f0: midiHz(D4 - 12), dur: 1.3, vol: 0.2 * g, attack: 0.08 })
    arp([D4 - 12, F4 - 12, A4 - 12, D4], 0.16, 'saw', 0.13 * g, 0.3, 0.1)
    burst({ dur: 0.9, vol: 0.2 * g, f0: 500, f1: 70 })
  },
  death: (p, g) => {
    burst({ dur: 0.2, vol: 0.2 * g, type: 'bandpass', f0: 1500, f1: 400, q: 1.2, pan: p })
    tone({ wave: 'tri', f0: 420, f1: 110, dur: 0.22, vol: 0.14 * g, pan: p })
    bell(A5, 0.06 * g, 0.2, 0.06, p)
  },
  deathBig: (p, g) => {
    burst({ dur: 0.9, vol: 0.4 * g, f0: 2400, f1: 80, pan: p })
    tone({ wave: 'sine', f0: 120, f1: 30, dur: 0.9, vol: 0.36 * g, pan: p })
    arp([D5, A4, F4, D4, A4 - 12], 0.09, 'tri', 0.14 * g, 0.2, 0.1, p)
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
  }
}

export const installSynth = (): void => {
  setSfxPlayer(play)
}
