import { registerOneShotSource } from '@/use/useAssets'
import { VOICE_FILES } from '../assets/overrides'
import { audio, canPlay, duckMusic } from './engine'

/**
 * ─── Spoken dialogue ─────────────────────────────────────────────────────────
 *
 * A dialogue line with a recording at `public/audio/voice/<lang>/<line id>.ogg`
 * is PLAYED (on the voice bus, the music ducking under it); a line without one
 * is a text-paced bubble with a soft per-speaker blip. The folder is listed at
 * build time (`virtual:asset-overrides`), so a missing recording is never a
 * request, let alone a 404. A language with no recording of a line falls back
 * to the English one: a voice with translated subtitles beats silence.
 *
 * Everything goes through `voiceBus` (`engine.ts`): the volume slider, the
 * mute buttons and the ad / pause gates hold for speech exactly as for SFX.
 */

/** The recording of a line for a language ('' = none). */
export const voiceUrl = (lang: string, id: string): string =>
  VOICE_FILES.get(`${lang}/${id}`) ?? VOICE_FILES.get(`en/${id}`) ?? ''

const buffers = new Map<string, Promise<AudioBuffer | null>>()
let current: AudioBufferSourceNode | null = null
/** Bumped by every `speakLine` / `stopSpeech`: a decode that lands late is dropped. */
let ticket = 0

const load = (url: string): Promise<AudioBuffer | null> => {
  let p = buffers.get(url)
  if (p) return p
  const Offline = window.OfflineAudioContext
    ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext
  p = !Offline
    ? Promise.resolve(null)
    : fetch(url)
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(buf => new Offline(1, 1, 44100).decodeAudioData(buf))
      .catch((e) => { console.warn(`[voice] "${url}" could not be loaded — the line stays text-paced`, e); return null })
  buffers.set(url, p)
  return p
}

export const stopSpeech = (): void => {
  ticket++
  const s = current
  current = null
  if (s) { try { s.stop() } catch { /* already ended */ } }
}

/**
 * Speak a line if it has a recording. Resolves with the recording's length in
 * seconds once it STARTS, or 0 when the line is text-paced (no file, audio
 * locked or muted, or the line was left before the file was ready).
 */
export const speakLine = async (id: string, lang: string): Promise<number> => {
  stopSpeech()
  const url = voiceUrl(lang, id)
  if (!url) return 0
  const mine = ticket
  const buf = await load(url)
  if (!buf || mine !== ticket || !canPlay()) return 0
  const a = audio()
  if (!a || a.ctx.state !== 'running') return 0
  const src = a.ctx.createBufferSource()
  src.buffer = buf
  src.connect(a.voice)
  src.onended = () => { if (current === src) current = null }
  src.start()
  registerOneShotSource(src)
  current = src
  duckMusic(buf.duration)
  return buf.duration
}

let lastBlip = 0

/**
 * The "voice" of a line without a recording: a short soft tone per few
 * letters, pitched by the speaker (`seed` 0..1) and wobbling a little so it
 * reads as speech. Quiet on purpose, and silent whenever SFX would be.
 */
export const speechBlip = (seed: number, loud = 1): void => {
  if (!canPlay()) return
  const a = audio()
  if (!a || a.ctx.state !== 'running') return
  const t = a.ctx.currentTime
  if (t - lastBlip < 0.055) return
  lastBlip = t
  const osc = a.ctx.createOscillator()
  const g = a.ctx.createGain()
  osc.type = 'triangle'
  const hz = (150 + seed * 260) * (0.94 + Math.random() * 0.14)
  osc.frequency.setValueAtTime(hz, t)
  osc.frequency.exponentialRampToValueAtTime(hz * 0.86, t + 0.06)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.55 * loud, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.07)
  osc.connect(g).connect(a.voice)
  osc.start(t)
  osc.stop(t + 0.08)
  registerOneShotSource(osc)
}
