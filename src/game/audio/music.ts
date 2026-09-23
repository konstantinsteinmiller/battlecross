import { audio, audioAllowed, noise, pulse, midiHz } from './engine'
import { mulberry32, type Rng } from '../world/rng'
import { MUSIC_FILES } from '../assets/overrides'
import { registerHtmlAudio, unregisterHtmlAudio } from '@/use/useAssets'

/**
 * ─── Chiptune music ──────────────────────────────────────────────────────────
 *
 * A lookahead step sequencer on the shared AudioContext and a small composer
 * that writes an original tune per track from a chord progression, a key, a
 * mode and a seed — the house style of the blue-bomber era: an octave-bouncing
 * bass, 16th-note arpeggios, a catchy motif-based lead and a driving beat.
 *
 * Nothing is sampled; a track is a few hundred numbers. Because it runs on the
 * shared context, the ad / pause / mute gates silence it automatically.
 */

export type TrackId = 'hub' | 'scrapyard' | 'blaze' | 'cryo' | 'volt' | 'gale' | 'fortress' | 'boss'

interface TrackSpec {
  bpm: number
  root: number // MIDI note of the tonic (bass octave)
  mode: number[]
  progA: number[]
  progB: number[]
  seed: number
  leadDuty: number
  arpDuty: number
  drums: 'drive' | 'half' | 'march'
}

const MINOR = [0, 2, 3, 5, 7, 8, 10]
const DORIAN = [0, 2, 3, 5, 7, 9, 10]
const MAJOR = [0, 2, 4, 5, 7, 9, 11]
const LYDIAN = [0, 2, 4, 6, 7, 9, 11]
const PHRYG = [0, 1, 3, 5, 7, 8, 10]

const SPECS: Record<TrackId, TrackSpec> = {
  hub: { bpm: 112, root: 48, mode: MAJOR, progA: [0, 5, 3, 4], progB: [5, 3, 0, 4], seed: 11, leadDuty: 0.25, arpDuty: 0.125, drums: 'half' },
  scrapyard: { bpm: 150, root: 40, mode: MINOR, progA: [0, 5, 2, 6], progB: [3, 4, 0, 6], seed: 21, leadDuty: 0.25, arpDuty: 0.125, drums: 'drive' },
  blaze: { bpm: 160, root: 45, mode: MINOR, progA: [0, 6, 5, 6], progB: [3, 4, 5, 4], seed: 32, leadDuty: 0.5, arpDuty: 0.25, drums: 'drive' },
  cryo: { bpm: 144, root: 38, mode: DORIAN, progA: [0, 3, 0, 4], progB: [5, 3, 1, 4], seed: 43, leadDuty: 0.125, arpDuty: 0.25, drums: 'march' },
  volt: { bpm: 168, root: 42, mode: MINOR, progA: [0, 2, 5, 4], progB: [3, 5, 6, 4], seed: 54, leadDuty: 0.25, arpDuty: 0.125, drums: 'drive' },
  gale: { bpm: 150, root: 43, mode: LYDIAN, progA: [0, 1, 0, 4], progB: [5, 3, 1, 4], seed: 65, leadDuty: 0.25, arpDuty: 0.125, drums: 'march' },
  fortress: { bpm: 162, root: 36, mode: PHRYG, progA: [0, 1, 0, 6], progB: [5, 3, 1, 0], seed: 76, leadDuty: 0.5, arpDuty: 0.25, drums: 'drive' },
  boss: { bpm: 176, root: 47, mode: MINOR, progA: [0, 0, 5, 6], progB: [3, 4, 5, 6], seed: 87, leadDuty: 0.25, arpDuty: 0.125, drums: 'drive' }
}

interface Note { step: number; midi: number; len: number }
interface Section { lead: Note[]; bass: Note[]; arp: Note[]; kick: number[]; snare: number[]; hat: number[] }

const RHYTHMS = [
  'x..x..x.x.x.x...',
  'x.x.x..xx.x.x...',
  'x...x.x.x..xx.x.',
  'x.xx..x.x.x..x..',
  'x..xx.x...x.x.x.'
]

const scaleNote = (spec: TrackSpec, degree: number, octave: number): number => {
  const n = spec.mode.length
  const oct = Math.floor(degree / n)
  const d = ((degree % n) + n) % n
  return spec.root + 12 * (octave + oct) + spec.mode[d]!
}

const compose = (spec: TrackSpec, prog: number[], rng: Rng, variant: number): Section => {
  const lead: Note[] = []
  const bass: Note[] = []
  const arp: Note[] = []
  const kick: number[] = []
  const snare: number[] = []
  const hat: number[] = []
  const rhythm = RHYTHMS[Math.floor(rng() * RHYTHMS.length)]!
  // A 2-bar motif, then its answer (repeat with a sequence up / cadence)
  let deg = prog[0]! + 7 * 2
  const motif: Array<{ step: number; deg: number; len: number }> = []
  for (let s = 0; s < 32; s++) {
    const on = rhythm[s % 16] === 'x'
    if (!on) continue
    const bar = Math.floor(s / 16)
    const chordRoot = prog[bar]!
    const strong = s % 4 === 0
    if (strong) {
      // snap to the nearest chord tone
      const tones = [chordRoot, chordRoot + 2, chordRoot + 4].map(t => t + 14)
      deg = tones.reduce((a, b) => (Math.abs(b - deg) < Math.abs(a - deg) ? b : a))
    } else {
      deg += Math.round((rng() - 0.5) * 4)
    }
    let len = 1
    for (let k = s + 1; k < 32 && rhythm[k % 16] !== 'x'; k++) len++
    motif.push({ step: s, deg, len: Math.min(len, 4) })
  }
  // Lead sits an octave above the arpeggio so the two never mask each other.
  for (const m of motif) lead.push({ step: m.step, midi: scaleNote(spec, m.deg, 1), len: m.len })
  const lift = variant === 1 ? 1 : variant === 2 ? -1 : 2
  for (const m of motif) {
    const last = m.step >= 24
    const d = last && m === motif[motif.length - 1] ? prog[3]! + 14 : m.deg + lift
    lead.push({ step: m.step + 32, midi: scaleNote(spec, d, 1), len: m.len })
  }
  for (let bar = 0; bar < 4; bar++) {
    const r = prog[bar]!
    for (let e = 0; e < 8; e++) {
      const s = bar * 16 + e * 2
      const oct = e % 2 === 1 ? 1 : 0
      const walk = e === 7 && rng() < 0.5 ? scaleNote(spec, r + 4, 0) : scaleNote(spec, r, oct)
      bass.push({ step: s, midi: walk, len: 2 })
    }
    const chord = [r, r + 2, r + 4, r + 7]
    const order = variant === 2 ? [3, 2, 1, 0, 2, 1] : [0, 1, 2, 3, 2, 1]
    for (let k = 0; k < 16; k++) {
      arp.push({ step: bar * 16 + k, midi: scaleNote(spec, chord[order[k % order.length]!]!, 2), len: 1 })
    }
    for (let k = 0; k < 16; k++) {
      const s = bar * 16 + k
      if (spec.drums === 'drive') {
        if (k === 0 || k === 8 || (k === 10 && rng() < 0.4) || (k === 6 && bar % 2 === 1)) kick.push(s)
        if (k === 4 || k === 12) snare.push(s)
        if (k % 2 === 0) hat.push(s)
      } else if (spec.drums === 'march') {
        if (k === 0 || k === 6 || k === 8) kick.push(s)
        if (k === 4 || k === 12 || (k === 14 && bar === 3)) snare.push(s)
        if (k % 2 === 0 || k === 15) hat.push(s)
      } else {
        if (k === 0) kick.push(s)
        if (k === 8) snare.push(s)
        if (k % 4 === 2) hat.push(s)
      }
    }
  }
  return { lead, bass, arp, kick, snare, hat }
}

const composeTrack = (id: TrackId): { spec: TrackSpec; sections: Section[] } => {
  const spec = SPECS[id]
  const rng = mulberry32(spec.seed)
  const A = compose(spec, spec.progA, rng, 0)
  const A2 = compose(spec, spec.progA, mulberry32(spec.seed), 1)
  const B = compose(spec, spec.progB, rng, 2)
  return { spec, sections: [A, A2, B, A2] }
}

// ─── Sequencer ───────────────────────────────────────────────────────────────

const cache = new Map<TrackId, ReturnType<typeof composeTrack>>()
let current: TrackId | null = null
let timer: number | null = null
let nextTime = 0
let stepIdx = 0
let trackGain: GainNode | null = null

const voice = (t: number, dur: number, midi: number, kind: 'lead' | 'arp' | 'bass', duty: number, dest: AudioNode): void => {
  const a = audio()
  if (!a) return
  const osc = a.ctx.createOscillator()
  if (kind === 'bass') osc.type = 'triangle'
  else {
    const w = pulse(duty)
    if (w) osc.setPeriodicWave(w)
  }
  osc.frequency.setValueAtTime(midiHz(midi), t)
  if (kind === 'lead') {
    // A touch of delayed vibrato on held lead notes
    const lfo = a.ctx.createOscillator()
    const lg = a.ctx.createGain()
    lfo.frequency.value = 6
    lg.gain.setValueAtTime(0, t)
    lg.gain.linearRampToValueAtTime(midiHz(midi) * 0.012, t + Math.min(dur, 0.25))
    lfo.connect(lg).connect(osc.frequency)
    lfo.start(t)
    lfo.stop(t + dur + 0.05)
  }
  const g = a.ctx.createGain()
  const vol = kind === 'lead' ? 0.13 : kind === 'arp' ? 0.045 : 0.3
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006)
  g.gain.setValueAtTime(vol * (kind === 'arp' ? 0.6 : 0.85), t + dur * 0.5)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(dest)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

const drum = (t: number, kind: 'kick' | 'snare' | 'hat', dest: AudioNode): void => {
  const a = audio()
  if (!a) return
  if (kind === 'kick') {
    const osc = a.ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(150, t)
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.12)
    const g = a.ctx.createGain()
    g.gain.setValueAtTime(0.5, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
    osc.connect(g).connect(dest)
    osc.start(t)
    osc.stop(t + 0.18)
    return
  }
  const buf = noise()
  if (!buf) return
  const src = a.ctx.createBufferSource()
  src.buffer = buf
  const f = a.ctx.createBiquadFilter()
  f.type = kind === 'hat' ? 'highpass' : 'bandpass'
  f.frequency.value = kind === 'hat' ? 7000 : 1800
  f.Q.value = kind === 'hat' ? 0.7 : 0.9
  const g = a.ctx.createGain()
  const vol = kind === 'hat' ? 0.07 : 0.22
  const len = kind === 'hat' ? 0.04 : 0.14
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + len)
  src.connect(f).connect(g).connect(dest)
  src.start(t, Math.random() * 0.5)
  src.stop(t + len + 0.02)
}

const tick = (): void => {
  const a = audio()
  if (!a || !current || !trackGain) return
  const trk = cache.get(current)!
  const spb = 60 / trk.spec.bpm / 4 // seconds per 16th
  const horizon = a.ctx.currentTime + 0.15
  if (nextTime < a.ctx.currentTime - 0.5) nextTime = a.ctx.currentTime + 0.05 // resumed after a long suspend
  while (nextTime < horizon) {
    const total = trk.sections.length * 64
    const s = stepIdx % total
    const sec = trk.sections[Math.floor(s / 64)]!
    const local = s % 64
    const t = nextTime
    for (const n of sec.lead) if (n.step === local) voice(t, n.len * spb * 0.92, n.midi, 'lead', trk.spec.leadDuty, trackGain)
    for (const n of sec.bass) if (n.step === local) voice(t, n.len * spb * 0.8, n.midi, 'bass', 0.5, trackGain)
    for (const n of sec.arp) if (n.step === local) voice(t, spb * 0.9, n.midi, 'arp', trk.spec.arpDuty, trackGain)
    const bar = local % 16
    if (sec.kick.includes(local)) drum(t, 'kick', trackGain)
    if (sec.snare.includes(local)) drum(t, 'snare', trackGain)
    if (sec.hat.includes(local)) drum(t, 'hat', trackGain)
    void bar
    nextTime += spb
    stepIdx++
  }
}

// A track asked for before the first gesture waits here. Activation lands on
// pointerup for touch (pointerdown only counts for a mouse), so listen to both.
let pending: TrackId | null = null
let gestureArmed = false
const GESTURES = ['pointerdown', 'pointerup', 'keydown'] as const

const onGesture = (): void => {
  if (!audioAllowed()) return
  for (const g of GESTURES) window.removeEventListener(g, onGesture, true)
  gestureArmed = false
  const id = pending
  pending = null
  if (id) playMusic(id)
}

const startOnGesture = (id: TrackId): void => {
  pending = id
  if (gestureArmed) return
  gestureArmed = true
  for (const g of GESTURES) window.addEventListener(g, onGesture, true)
}

// ─── Drop-in music files ─────────────────────────────────────────────────────
// public/audio/music/<track id>.ogg replaces that composed track, and
// victory / defeat.ogg the jingles (see `game/assets/overrides.ts`). A file
// STREAMS through a media element, routed into the same music bus as the
// synth, so the volume, the platform mute and the ad / pause gates apply to
// it unchanged; it is also registered with the suspend registry, which pauses
// the element itself under an ad.

/** Drop-ins are mastered far hotter than the synth voices. */
const FILE_GAIN = 0.35
let fileEl: HTMLAudioElement | null = null
let fileGain: GainNode | null = null

const startFile = (url: string, loop: boolean): { el: HTMLAudioElement; gain: GainNode } | null => {
  const a = audio()
  if (!a) return null
  const el = new Audio(url)
  el.loop = loop
  el.preload = 'auto'
  const g = a.ctx.createGain()
  g.gain.setValueAtTime(0.0001, a.ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(FILE_GAIN, a.ctx.currentTime + 0.35)
  a.ctx.createMediaElementSource(el).connect(g).connect(a.music)
  registerHtmlAudio(el)
  el.play().catch(() => { /* blocked or failed — the gates retry the start */ })
  return { el, gain: g }
}

const stopFile = (el: HTMLAudioElement, g: GainNode, fade: number): void => {
  const a = audio()
  if (a) {
    g.gain.cancelScheduledValues(a.ctx.currentTime)
    g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), a.ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, a.ctx.currentTime + fade)
  }
  setTimeout(() => {
    el.pause()
    unregisterHtmlAudio(el)
    g.disconnect()
  }, (fade + 0.05) * 1000)
}

/** Start (or switch to) a track. Idempotent for the track already playing. */
export const playMusic = (id: TrackId): void => {
  const a = audio()
  if (!a) {
    startOnGesture(id)
    return
  }
  if (current === id && (timer !== null || fileEl !== null)) return
  stopMusic(0.15)
  const url = MUSIC_FILES.get(id)
  if (url) {
    const f = startFile(url, true)
    if (f) {
      current = id
      fileEl = f.el
      fileGain = f.gain
      return
    }
  }
  if (!cache.has(id)) cache.set(id, composeTrack(id))
  current = id
  trackGain = a.ctx.createGain()
  trackGain.gain.setValueAtTime(0.0001, a.ctx.currentTime)
  trackGain.gain.exponentialRampToValueAtTime(1, a.ctx.currentTime + 0.35)
  trackGain.connect(a.music)
  stepIdx = 0
  nextTime = a.ctx.currentTime + 0.08
  timer = window.setInterval(tick, 30)
  tick()
}

/** Stop with a short fade. */
export const stopMusic = (fade = 0.25): void => {
  pending = null
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
  const a = audio()
  if (trackGain && a) {
    const g = trackGain
    g.gain.cancelScheduledValues(a.ctx.currentTime)
    g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), a.ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, a.ctx.currentTime + fade)
    setTimeout(() => g.disconnect(), (fade + 0.3) * 1000)
  }
  trackGain = null
  if (fileEl && fileGain) stopFile(fileEl, fileGain, fade)
  fileEl = null
  fileGain = null
  current = null
}

export const isMusicRunning = (): boolean => timer !== null || fileEl !== null
export const currentMusic = (): TrackId | null => current

/** Short fanfares (not looped). */
export const playJingle = (kind: 'victory' | 'defeat'): void => {
  const a = audio()
  if (!a) return
  stopMusic(0.1)
  const url = MUSIC_FILES.get(kind)
  if (url) {
    const f = startFile(url, false)
    if (f) f.el.addEventListener('ended', () => stopFile(f.el, f.gain, 0.05), { once: true })
    return
  }
  const g = a.ctx.createGain()
  g.connect(a.music)
  const t0 = a.ctx.currentTime + 0.05
  const notes = kind === 'victory'
    ? [[72, 0], [76, 0.12], [79, 0.24], [84, 0.36], [79, 0.6], [84, 0.72], [88, 0.84]]
    : [[67, 0], [63, 0.2], [60, 0.4], [55, 0.7]]
  for (const [m, dt] of notes) voice(t0 + dt!, kind === 'victory' ? 0.22 : 0.35, m!, 'lead', 0.25, g)
  for (const [m, dt] of notes) voice(t0 + dt!, kind === 'victory' ? 0.22 : 0.35, m! - 24, 'bass', 0.5, g)
  setTimeout(() => g.disconnect(), 2500)
}
