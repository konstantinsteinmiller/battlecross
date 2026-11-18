import { registerOneShotSource } from '@/use/useAssets'
import { VOICE_FILES } from '../assets/overrides'
import { genderedId } from '@/i18n/gendered'
import { audio, canPlay, duckMusic } from './engine'

/**
 * ─── Spoken dialogue ─────────────────────────────────────────────────────────
 *
 * A dialogue line with a recording at `public/audio/voice/<lang>/<line id>.ogg`
 * is PLAYED (on the voice bus, the music ducking under it); a line without one
 * is a text-paced bubble with a soft per-speaker blip. The folder is listed at
 * build time (`virtual:asset-overrides`), so a missing recording is never a
 * request, let alone a 404. A language with NO recordings at all (Indonesian,
 * Vietnamese …) falls back to the English ones: a voice with translated
 * subtitles beats silence. A voiced language never hears English, with one
 * exception (#219): German is re-voiced line by line (ElevenLabs), and a line not
 * recorded yet plays its English recording rather than going silent. Any other
 * voiced language keeps a text-paced bubble for a line it lacks.
 *
 * Everything goes through `voiceBus` (`engine.ts`): the volume slider, the
 * mute buttons and the ad / pause gates hold for speech exactly as for SFX.
 */

/** Voiced languages that play the English recording of a line they have no recording of yet (#219). */
const ENGLISH_BACKUP: ReadonlySet<string> = new Set(['de'])

/** The recording of a line for a language ('' = none). For the girl hero a
 *  line's own feminine take (`<id>__f`, roadmap #71) comes first. */
export const voiceUrl = (lang: string, id: string): string => {
  const tongue = isVoiced(lang) ? lang : 'en'
  const own = genderedId(id, (v) => VOICE_FILES.has(`${tongue}/${v}`))
  const mine = VOICE_FILES.get(`${tongue}/${own}`)
  if (mine || tongue === 'en' || !ENGLISH_BACKUP.has(tongue)) return mine ?? ''
  const english = genderedId(id, (v) => VOICE_FILES.has(`en/${v}`))
  return VOICE_FILES.get(`en/${english}`) ?? ''
}

let voicedLangs: Set<string> | null = null
/** Does the language have a recording folder of its own? */
const isVoiced = (lang: string): boolean => {
  if (!voicedLangs) voicedLangs = new Set([...VOICE_FILES.keys()].map(k => k.slice(0, k.indexOf('/'))))
  return voicedLangs.has(lang)
}

const buffers = new Map<string, Promise<AudioBuffer | null>>()
/** The recordings of the conversation in hand (`prefetchVoices`): never dropped to make room. */
const keep = new Set<string>()
/** Decoded recordings kept (a place's worth and some): the oldest not wanted by the current place go first. */
const MAX_BUFFERS = 160
const wanted = new Set<string>()
const trim = (): void => {
  if (buffers.size <= MAX_BUFFERS) return
  for (const k of buffers.keys()) {
    if (buffers.size <= MAX_BUFFERS) break
    if (!wanted.has(k) && !keep.has(k)) buffers.delete(k)
  }
}
/** What is speaking: the source and its own gain, which fades the line in and out (a cut mid-wave is a click). */
let current: { src: AudioBufferSourceNode; gain: GainNode } | null = null
/** A line fades in over this long and out over the last of it, and a line cut short fades out in `FADE_CUT_S`: no edge of a recording ever reaches the speakers as a step. */
const FADE_IN_S = 0.008
const FADE_OUT_S = 0.02
const FADE_CUT_S = 0.04
/** Bumped by every `speakLine` / `stopSpeech`: a decode that lands late is dropped. */
let ticket = 0

/**
 * One decoder for every recording, at the sample rate the speakers run at (the engine's): a recording decoded at another rate
 * is resampled by the engine as it plays, on the audio thread, with a cheaper filter, which is a harsh edge on a voice.
 * (A context per recording was a context allocated per line, too.)
 */
let decoder: OfflineAudioContext | null = null
const decoderCtx = (): OfflineAudioContext | null => {
  if (decoder) return decoder
  const Offline = window.OfflineAudioContext
    ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext
  if (!Offline) return null
  decoder = new Offline(1, 1, audio()?.ctx.sampleRate ?? 48000)
  return decoder
}

const load = (url: string): Promise<AudioBuffer | null> => {
  let p = buffers.get(url)
  if (p) return p
  const dec = decoderCtx()
  p = !dec
    ? Promise.resolve(null)
    : fetch(url)
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(buf => dec.decodeAudioData(buf))
      // Silence, never an error (owner's rule): a recording that cannot be
      // loaded leaves the line text-paced. Dev builds note it for the author.
      .catch((e) => { if (import.meta.env.DEV) console.debug(`[voice] "${url}" could not be loaded — the line stays text-paced`, e); return null })
  buffers.set(url, p)
  trim()
  return p
}

/**
 * Fetch and decode recordings ahead of their lines (#211), one at a time with a breath between so a busy frame is never
 * made busier; `stale` drops the rest of the queue (the player has moved on). Silent about failures, like `load`.
 */
export const preloadVoices = async (ids: readonly string[], lang: string, stale: () => boolean): Promise<void> => {
  const urls = ids.map(id => voiceUrl(lang, id)).filter(Boolean)
  wanted.clear()
  for (const u of urls) wanted.add(u)
  // Two at a time, a breath between: the first seconds' lines are at the front of the queue.
  let at = 0
  const worker = async (): Promise<void> => {
    while (at < urls.length) {
      const url = urls[at++]!
      if (stale()) return
      if (buffers.has(url)) continue
      await load(url)
      await new Promise<void>(r => setTimeout(r, 30))
    }
  }
  await Promise.all([worker(), worker()])
}

/** Every line id (`dlg.…`) a conversation can say, wherever it sits in its graph. */
export const lineIdsOf = (def: unknown, out: string[] = []): string[] => {
  if (Array.isArray(def)) { for (const v of def) lineIdsOf(v, out); return out }
  if (!def || typeof def !== 'object') return out
  for (const [k, v] of Object.entries(def as Record<string, unknown>)) {
    if (k === 'id' && typeof v === 'string' && v.startsWith('dlg.')) out.push(v)
    else lineIdsOf(v, out)
  }
  return out
}

/**
 * A conversation has begun (or a line is coming): its recordings are fetched and decoded now, the lines first that come
 * first, and kept while it lasts, so no line waits on the network when its turn comes. Not tied to a place's queue.
 */
export const prefetchVoices = (ids: readonly string[], lang: string): void => {
  keep.clear()
  for (const id of ids) {
    const url = voiceUrl(lang, id)
    if (!url) continue
    keep.add(url)
    void load(url)
  }
}

export const stopSpeech = (): void => {
  ticket++
  const s = current
  current = null
  if (!s) return
  // Cut short: the gain runs down first, then the source stops (stopping a source mid-wave is a click).
  const a = audio()
  try {
    if (a) {
      const t = a.ctx.currentTime
      s.gain.gain.cancelScheduledValues(t)
      s.gain.gain.setValueAtTime(s.gain.gain.value, t)
      s.gain.gain.linearRampToValueAtTime(0, t + FADE_CUT_S)
      s.src.stop(t + FADE_CUT_S + 0.005)
    } else s.src.stop()
  } catch { /* already ended */ }
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
  // Its own gain: in over a few milliseconds, out over the last of the recording.
  const gain = a.ctx.createGain()
  const t = a.ctx.currentTime + 0.005
  const end = t + buf.duration
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(1, t + FADE_IN_S)
  gain.gain.setValueAtTime(1, Math.max(t + FADE_IN_S, end - FADE_OUT_S))
  gain.gain.linearRampToValueAtTime(0, end)
  src.connect(gain).connect(a.voice)
  const me = { src, gain }
  src.onended = () => { if (current === me) current = null; try { gain.disconnect() } catch { /* gone */ } }
  src.start(t)
  registerOneShotSource(src)
  current = me
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
