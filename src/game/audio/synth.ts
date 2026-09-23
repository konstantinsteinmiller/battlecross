import { registerOneShotSource } from '@/use/useAssets'
import { audio, canPlay, noise, pulse, midiHz } from './engine'
import { setSfxPlayer, type SfxName } from './sfx'
import { SFX_FILES } from '../assets/overrides'

/**
 * ─── Chiptune SFX ────────────────────────────────────────────────────────────
 *
 * Every sound effect is a tiny recipe on three voices — a pulse wave (12.5 /
 * 25 / 50 % duty), a triangle, and noise through a filter — the palette of the
 * 8-bit era. Recipes are pitched sweeps, arpeggios and bursts; nothing is
 * sampled, so the whole SFX set costs zero bytes of download.
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

let busOut: GainNode | null = null
const panners: StereoPannerNode[] = []

const out = (pan: number): AudioNode | null => {
  const a = audio()
  if (!a) return null
  if (!busOut) busOut = a.sfx
  if (!pan || !('createStereoPanner' in a.ctx)) return a.sfx
  const p = a.ctx.createStereoPanner()
  p.pan.value = pan
  p.connect(a.sfx)
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
  osc.frequency.setValueAtTime(o.f0, t)
  if (o.f1 !== undefined) {
    if (o.exp !== false) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t + o.dur)
    else osc.frequency.linearRampToValueAtTime(o.f1, t + o.dur)
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
  f.frequency.setValueAtTime(o.f0 ?? 4000, t)
  if (o.f1 !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.f1), t + o.dur)
  const g = a.ctx.createGain()
  g.gain.setValueAtTime(o.vol, t)
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

// Voice limiting: the same sound can only retrigger every `gap` seconds.
const lastAt = new Map<string, number>()
const GAP: Partial<Record<SfxName, number>> = {
  shoot: 0.04, hit: 0.035, bolt: 0.05, tink: 0.05, enemyShot: 0.06, explode: 0.06, alert: 0.12, uiClick: 0.03
}

const RECIPES: Record<SfxName, (pan: number, g: number) => void> = {
  // ── Buster ──
  shoot: (p, g) => {
    tone({ wave: 'p25', f0: 1500, f1: 520, dur: 0.07, vol: 0.28 * g, pan: p })
    tone({ wave: 'p12', f0: 2200, f1: 900, dur: 0.05, vol: 0.12 * g, pan: p })
  },
  charge1: (p, g) => arp([79, 84], 0.045, 'p12', 0.16 * g, 0.06, 0, p),
  charge2: (p, g) => arp([84, 88, 91, 96], 0.035, 'p12', 0.18 * g, 0.05, 0, p),
  chargeShot: (p, g) => {
    tone({ wave: 'p50', f0: 900, f1: 180, dur: 0.18, vol: 0.32 * g, pan: p })
    burst({ dur: 0.12, vol: 0.18 * g, f0: 5000, f1: 800, pan: p })
  },
  chargeShotBig: (p, g) => {
    tone({ wave: 'p50', f0: 1100, f1: 110, dur: 0.32, vol: 0.4 * g, pan: p })
    tone({ wave: 'p25', f0: 1650, f1: 220, dur: 0.26, vol: 0.18 * g, pan: p })
    burst({ dur: 0.25, vol: 0.26 * g, f0: 6000, f1: 300, pan: p })
  },
  // ── Impacts ──
  hit: (p, g) => {
    burst({ dur: 0.06, vol: 0.22 * g, type: 'bandpass', f0: 2400, q: 1.2, pan: p })
    tone({ wave: 'p50', f0: 320, f1: 140, dur: 0.06, vol: 0.14 * g, pan: p })
  },
  hitHeavy: (p, g) => {
    burst({ dur: 0.14, vol: 0.32 * g, f0: 3000, f1: 400, pan: p })
    tone({ wave: 'p50', f0: 220, f1: 70, dur: 0.14, vol: 0.28 * g, pan: p })
  },
  crit: (p, g) => {
    arp([96, 91, 100], 0.03, 'p12', 0.16 * g, 0.05, 0, p)
    burst({ dur: 0.16, vol: 0.28 * g, f0: 7000, f1: 900, pan: p })
  },
  tink: (p, g) => {
    tone({ wave: 'tri', f0: 2600, f1: 2300, dur: 0.12, vol: 0.28 * g, pan: p })
    tone({ wave: 'p12', f0: 3900, dur: 0.04, vol: 0.1 * g, pan: p })
  },
  guardBreak: (p, g) => {
    burst({ dur: 0.28, vol: 0.34 * g, f0: 5000, f1: 500, pan: p })
    arp([72, 67, 60], 0.05, 'p50', 0.2 * g, 0.07, 0, p)
  },
  explode: (p, g) => {
    burst({ dur: 0.45, vol: 0.42 * g, f0: 3200, f1: 120, pan: p })
    tone({ wave: 'p50', f0: 160, f1: 40, dur: 0.35, vol: 0.3 * g, pan: p })
  },
  // ── Enemy actions ──
  enemyShot: (p, g) => tone({ wave: 'p25', f0: 520, f1: 900, dur: 0.08, vol: 0.14 * g, pan: p }),
  lob: (p, g) => tone({ wave: 'p12', f0: 1400, f1: 300, dur: 0.45, vol: 0.12 * g, exp: false, pan: p }),
  jump: (p, g) => tone({ wave: 'p25', f0: 180, f1: 700, dur: 0.18, vol: 0.18 * g, pan: p }),
  stomp: (p, g) => {
    burst({ dur: 0.35, vol: 0.4 * g, f0: 900, f1: 80, pan: p })
    tone({ wave: 'tri', f0: 110, f1: 38, dur: 0.35, vol: 0.4 * g, pan: p })
  },
  dash: (p, g) => burst({ dur: 0.3, vol: 0.2 * g, type: 'bandpass', f0: 600, f1: 3000, q: 2, pan: p }),
  bonk: (p, g) => {
    tone({ wave: 'p50', f0: 260, f1: 90, dur: 0.18, vol: 0.28 * g, pan: p })
    arp([88, 91], 0.07, 'tri', 0.12 * g, 0.08, 0.1, p)
  },
  punch: (p, g) => {
    burst({ dur: 0.1, vol: 0.28 * g, f0: 1400, f1: 200, pan: p })
    tone({ wave: 'p50', f0: 150, f1: 60, dur: 0.1, vol: 0.2 * g, pan: p })
  },
  alert: (p, g) => arp([81, 88], 0.07, 'p25', 0.14 * g, 0.07, 0, p),
  // ── Player state ──
  hurt: (_p, g) => {
    arp([76, 72, 69, 64], 0.028, 'p50', 0.24 * g, 0.04)
    burst({ dur: 0.1, vol: 0.18 * g, f0: 2000, f1: 400 })
  },
  block: (p, g) => {
    tone({ wave: 'tri', f0: 1500, f1: 1100, dur: 0.1, vol: 0.2 * g, pan: p })
    burst({ dur: 0.07, vol: 0.18 * g, type: 'highpass', f0: 3000, pan: p })
  },
  parry: (_p, g) => {
    arp([88, 95, 100, 107], 0.028, 'p12', 0.22 * g, 0.09)
    tone({ wave: 'tri', f0: 2640, dur: 0.3, vol: 0.2 * g })
  },
  guardCrack: (_p, g) => {
    burst({ dur: 0.3, vol: 0.3 * g, f0: 2500, f1: 200 })
    arp([67, 63, 58], 0.06, 'p50', 0.2 * g, 0.08)
  },
  slide: (_p, g) => burst({ dur: 0.22, vol: 0.18 * g, f0: 3000, f1: 500 }),
  // ── Pickups & rewards ──
  bolt: (p, g) => arp([88, 95], 0.04, 'p25', 0.13 * g, 0.06, 0, p),
  heal: (_p, g) => arp([72, 76, 79, 84, 88], 0.04, 'p25', 0.16 * g, 0.06),
  energy: (_p, g) => arp([74, 79, 83, 86, 91], 0.04, 'p12', 0.16 * g, 0.06),
  tank: (_p, g) => {
    for (let k = 0; k < 10; k++) tone({ wave: 'p25', f0: midiHz(72 + k), dur: 0.06, vol: 0.13 * g, at: k * 0.045 })
  },
  chestOpen: (_p, g) => {
    burst({ dur: 0.15, vol: 0.14 * g, type: 'bandpass', f0: 1200, f1: 2400 })
    arp([79, 83, 86, 91, 95], 0.05, 'p12', 0.15 * g, 0.1, 0.08)
  },
  loot: (_p, g) => arp([84, 88, 91, 96], 0.06, 'p25', 0.16 * g, 0.12),
  levelUp: (_p, g) => {
    arp([72, 76, 79, 84, 79, 84, 88], 0.07, 'p25', 0.2 * g, 0.12)
    arp([60, 64, 67, 72], 0.14, 'tri', 0.2 * g, 0.2)
  },
  objective: (_p, g) => arp([79, 84, 88, 91, 96], 0.06, 'p50', 0.17 * g, 0.12),
  weapon: (_p, g) => arp([76, 83, 88], 0.04, 'p12', 0.15 * g, 0.07),
  // ── World ──
  door: (p, g) => {
    burst({ dur: 0.35, vol: 0.14 * g, type: 'bandpass', f0: 400, f1: 1600, q: 1.5, pan: p })
    tone({ wave: 'tri', f0: 90, f1: 140, dur: 0.3, vol: 0.12 * g, pan: p })
  },
  beamIn: (_p, g) => {
    tone({ wave: 'p25', f0: 2400, f1: 300, dur: 0.5, vol: 0.2 * g, vib: 60, vibRate: 30 })
    arp([72, 84, 96], 0.06, 'p12', 0.14 * g, 0.1, 0.45)
  },
  beamOut: (_p, g) => {
    arp([96, 84, 72], 0.05, 'p12', 0.14 * g, 0.08)
    tone({ wave: 'p25', f0: 300, f1: 2800, dur: 0.6, vol: 0.2 * g, vib: 60, vibRate: 30, at: 0.12 })
  },
  bossIntro: (_p, g) => {
    arp([45, 48, 51, 54, 57], 0.12, 'p50', 0.2 * g, 0.2)
    tone({ wave: 'tri', f0: 55, dur: 0.9, vol: 0.35 * g, vib: 3, vibRate: 7 })
  },
  death: (_p, g) => {
    for (let k = 0; k < 6; k++) tone({ wave: 'p50', f0: midiHz(84 - k * 5), f1: midiHz(78 - k * 5), dur: 0.1, vol: 0.2 * g, at: k * 0.09 })
    burst({ dur: 0.7, vol: 0.3 * g, f0: 2500, f1: 100, at: 0.1 })
  },
  // ── UI ──
  denied: (_p, g) => tone({ wave: 'p50', f0: 140, f1: 110, dur: 0.14, vol: 0.18 * g }),
  uiClick: (_p, g) => tone({ wave: 'p12', f0: 1800, dur: 0.035, vol: 0.1 * g }),
  uiOpen: (_p, g) => arp([79, 86], 0.045, 'p12', 0.12 * g, 0.06)
}

// ─── Drop-in SFX files ───────────────────────────────────────────────────────
// A file in public/audio/sfx/ named after a recipe replaces it (see
// `game/assets/overrides.ts`). Decoded on an OfflineAudioContext, which needs
// no user gesture, so the buffers are ready before the first shot and the
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
  const g = a.ctx.createGain()
  g.gain.value = FILE_GAIN * gain
  src.connect(g).connect(dest)
  src.start()
  registerOneShotSource(src)
}

const play = (name: SfxName, pan: number, gain: number): void => {
  if (!canPlay()) return
  const a = audio()
  if (!a || a.ctx.state !== 'running') return
  const gap = GAP[name] ?? 0.02
  const now = a.ctx.currentTime
  const last = lastAt.get(name) ?? -1
  if (now - last < gap) return
  lastAt.set(name, now)
  const g = Math.max(0.05, Math.min(1.4, gain))
  const file = fileBuffers.get(name)
  if (file) {
    try { playFile(file, pan, g) } catch { /* a voice failed to start — never fatal */ }
    return
  }
  const r = RECIPES[name]
  if (r) {
    try { r(pan, g) } catch { /* a voice failed to start — never fatal */ }
  }
}

export const installSynth = (): void => {
  setSfxPlayer(play)
}

// ─── The charge hum ──────────────────────────────────────────────────────────
// The buster's signature: a thin pulse that climbs while the button is held
// and, at full charge, settles into a fast warble. One persistent voice,
// re-pitched every frame — never a new oscillator per frame.

let humOsc: OscillatorNode | null = null
let humGain: GainNode | null = null
let humLfo: OscillatorNode | null = null
let humLfoGain: GainNode | null = null

/** `k01` 0..1 toward full charge; `full` once fully charged; null stops it. */
export const chargeHum = (k01: number | null, full = false): void => {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  if (k01 === null || !canPlay()) {
    if (humGain) {
      humGain.gain.setTargetAtTime(0, t, 0.02)
      const o = humOsc
      const l = humLfo
      setTimeout(() => { try { o?.stop(); l?.stop() } catch { /* stopped */ } }, 120)
    }
    humOsc = null
    humGain = null
    humLfo = null
    humLfoGain = null
    return
  }
  if (!humOsc) {
    humOsc = a.ctx.createOscillator()
    const w = pulse(0.125)
    if (w) humOsc.setPeriodicWave(w)
    humGain = a.ctx.createGain()
    humGain.gain.value = 0
    humLfo = a.ctx.createOscillator()
    humLfo.frequency.value = 22
    humLfoGain = a.ctx.createGain()
    humLfoGain.gain.value = 0
    humLfo.connect(humLfoGain).connect(humOsc.frequency)
    humOsc.connect(humGain).connect(a.sfx)
    humOsc.start(t)
    humLfo.start(t)
    registerOneShotSource(humOsc)
  }
  const f = full ? 1320 : 180 + k01 * 900
  humOsc.frequency.setTargetAtTime(f, t, 0.03)
  humLfoGain!.gain.setTargetAtTime(full ? 90 : 8, t, 0.05)
  humGain!.gain.setTargetAtTime(full ? 0.07 : 0.03 + k01 * 0.03, t, 0.03)
}
