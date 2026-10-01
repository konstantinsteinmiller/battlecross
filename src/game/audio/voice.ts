import { audio, duckMusic } from './engine'
import { VOICE_FILES } from '../assets/overrides'
import { registerOneShotSource } from '@/use/useAssets'

/**
 * ─── Voice-overs ─────────────────────────────────────────────────────────────
 *
 * Atlas speaks (the intro, and in every mission). Every line is a speech
 * bubble first; a recorded voice is an optional layer on top:
 *
 *   public/audio/voice/en/<line id>.ogg     English
 *   public/audio/voice/de/<line id>.ogg     German
 *
 * `<line id>` is the line's i18n key (`atlas.lowHp`, `story.atlas.goodMorning`
 * — voice-todo.md lists every one with its text). German players hear the
 * German files; every other language hears English — the bubble is always in
 * the player's language.
 *
 * It never fails loudly. The build lists the files that exist (see
 * `assets/overrides.ts`), so a missing line is never requested and never
 * logs a 404. A file that fails to fetch or decode is forgotten silently,
 * and that line stays a bubble. Nothing here throws.
 *
 * Voices play on the sound-effects bus, so the volume, mute, pause and ad
 * gates cover them, and an ad hard-stops one mid-line like any sound.
 */

export type VoiceLang = 'en' | 'de'

/** The voice language for a UI locale: German, or English for the rest. */
export const voiceLangFor = (locale: string | null | undefined): VoiceLang =>
  (locale ?? '').toLowerCase().startsWith('de') ? 'de' : 'en'

const currentLocale = (): string => {
  try {
    const g = (window as unknown as { __i18n?: { global?: { locale?: { value?: string } | string } } }).__i18n?.global
    const l = g?.locale
    return typeof l === 'string' ? l : (l?.value ?? 'en')
  } catch { return 'en' }
}

export const voiceLang = (): VoiceLang => voiceLangFor(currentLocale())

/** The file for a line in a language, if one was dropped in. English stands
 *  in for a German line that has no German file yet. */
export const voiceUrl = (id: string, lang: VoiceLang = voiceLang(), files = VOICE_FILES): string | null =>
  files.get(lang)?.get(id) ?? (lang !== 'en' ? files.get('en')?.get(id) ?? null : null)

const buffers = new Map<string, AudioBuffer>()
const failed = new Set<string>()
const loading = new Map<string, Promise<AudioBuffer | null>>()

/** Fetch and decode one file (once). Resolves null on any failure, silently. */
const load = (url: string): Promise<AudioBuffer | null> => {
  const hit = buffers.get(url)
  if (hit) return Promise.resolve(hit)
  if (failed.has(url)) return Promise.resolve(null)
  const busy = loading.get(url)
  if (busy) return busy
  const a = audio()
  // No unlocked context yet: try again later (never a failure to remember).
  if (!a) return Promise.resolve(null)
  const p = (async (): Promise<AudioBuffer | null> => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('missing')
      const data = await res.arrayBuffer()
      const buf = await new Promise<AudioBuffer>((resolve, reject) => {
        try {
          const r = a.ctx.decodeAudioData(data, resolve, reject)
          if (r && typeof (r as Promise<AudioBuffer>).then === 'function') (r as Promise<AudioBuffer>).then(resolve, reject)
        } catch (e) { reject(e) }
      })
      buffers.set(url, buf)
      return buf
    } catch {
      failed.add(url)
      return null
    } finally {
      loading.delete(url)
    }
  })()
  loading.set(url, p)
  return p
}

/** Warm the files for these lines (the ones that exist), in the background. */
export const preloadVoices = (ids: readonly string[]): void => {
  for (const id of ids) prefetchVoice(id)
}

export type VoiceState = 'none' | 'loading' | 'ready'

/**
 * Load one line's recording ON DEMAND — called when the line is queued, a
 * moment before its bubble pops — and say where it stands: 'ready' (decoded,
 * it will play), 'loading' (worth a short wait), or 'none' (no file, no
 * audio yet, or it failed: the bubble goes up on its own).
 */
export const prefetchVoice = (id: string): VoiceState => {
  const url = voiceUrl(id)
  if (!url || failed.has(url)) return 'none'
  if (buffers.has(url)) return 'ready'
  if (!loading.has(url)) {
    if (!audio()) return 'none'
    void load(url)
  }
  return loading.has(url) ? 'loading' : buffers.has(url) ? 'ready' : 'none'
}

let current: AudioBufferSourceNode | null = null

/** Stop the line being spoken, if any. */
export const stopVoice = (): void => {
  try { current?.stop() } catch { /* already stopped */ }
  current = null
}

/**
 * Speak a line now, if its file is ready: returns how long it lasts (s), or
 * null when there is no voice for it (no file, not decoded yet, no audio) —
 * the caller shows the bubble either way. A line not decoded yet is fetched
 * for next time. Cuts off a line still playing: Atlas says one thing at once.
 */
export const playVoice = (id: string): number | null => {
  try {
    const url = voiceUrl(id)
    if (!url) return null
    const buf = buffers.get(url)
    if (!buf) {
      void load(url)
      return null
    }
    const a = audio()
    if (!a) return null
    stopVoice()
    const src = a.ctx.createBufferSource()
    src.buffer = buf
    src.connect(a.voice)
    src.start()
    // The music steps back while someone speaks.
    duckMusic(buf.duration)
    src.onended = () => { if (current === src) current = null }
    registerOneShotSource(src)
    current = src
    return buf.duration
  } catch {
    return null
  }
}

/** Test seam. */
export const __resetVoices = (): void => {
  buffers.clear()
  failed.clear()
  loading.clear()
  current = null
}
