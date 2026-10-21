#!/usr/bin/env node
/**
 * ─── node --experimental-strip-types tools/preview-video/narration.mjs ──────
 *
 * The cinematic trailer's own narration lines (roadmap #X2): the lines the
 * Chronicler speaks in the trailer and never in the game, so they are not in
 * the locale files or the voice manifest. Same voice as the game's intro
 * (`tools/voice/intro-elevenlabs.mjs`: ElevenLabs "Bill", same model and
 * settings), the same post-production (`processTake`), and a Whisper read-back
 * that refuses a take that does not say its line. English only: the trailer is.
 *
 * The trailer also uses the intro's own takes (`dlg.intro.*`, public/audio/voice/en);
 * these are only the gameplay lines the intro does not have.
 *
 *   --dry   print the lines, call nothing
 *   --only <id>   one line again
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, VO_SRC, args } from '../voice/lib.mjs'
import { ffmpeg, processTake } from '../voice/post.mjs'
import { transcribe } from '../voice/whisper.mjs'
import { wer } from '../voice/qa.mjs'

/** The lines, by id (the trailer's scenario places them). */
export const NARRATION = {
  'trailer.build': 'Learn new skills. Forge your gear. Grow stronger with every battle.',
  'trailer.loot': 'And in the deepest dark... legendary treasure waits.'
}
export const NARRATION_DIR = join(ROOT, 'tools', 'preview-video', 'narration')

const a = args()
const jobs = Object.entries(NARRATION).filter(([id]) => !a.only || a.only === id)
if (a.dry) { for (const [id, text] of jobs) console.log(`${id}  ${text}`); process.exit(0) }

const envKey = (name) => {
  if (process.env[name]) return process.env[name]
  for (const f of ['.env.voice.local', '.env']) {
    const p = join(ROOT, f)
    if (!existsSync(p)) continue
    const m = readFileSync(p, 'utf8').match(new RegExp(`^\\s*${name}\\s*=\\s*"?([^"\\r\\n]*)"?\\s*$`, 'm'))
    if (m && m[1].trim()) return m[1].trim()
  }
  return ''
}
const KEY = envKey('ELEVENLABS_API_KEY')
if (!KEY) { console.error('No ELEVENLABS_API_KEY (.env.voice.local): the narrator is an ElevenLabs voice.'); process.exit(2) }
// The intro's voice and settings, so the trailer's new lines match its old ones.
const VOICE = envKey('ELEVENLABS_VOICE_ID') || 'pqHfZKP75CvOlQylNhV4'
const SETTINGS = { stability: 0.42, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 0.92 }
const TAKES = 3

const work = join(VO_SRC, 'gen', 'elevenlabs-api', 'trailer')
mkdirSync(work, { recursive: true })
mkdirSync(NARRATION_DIR, { recursive: true })

for (const [id, text] of jobs) {
  const takes = []
  for (let k = 0; k < TAKES; k++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: SETTINGS })
    })
    if (!res.ok) throw new Error(`ElevenLabs ${res.status} for ${id}: ${(await res.text()).slice(0, 400)}`)
    const mp3 = join(work, `${id}.${k}.mp3`)
    writeFileSync(mp3, Buffer.from(await res.arrayBuffer()))
    const raw = join(work, `${id}.${k}.wav`)
    await ffmpeg(['-y', '-i', mp3, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s24le', raw])
    const master = join(work, `${id}.${k}.master.wav`)
    const m = await processTake({ raw, master, ogg: null, speaker: 'chronicler', key: id, max: 0 })
    takes.push({ k, master, seconds: m.seconds })
  }
  const heard = await transcribe(takes.map(t => ({ id: String(t.k), wav: t.master, lang: 'en' })))
  for (const t of takes) t.wer = heard[t.k] == null ? null : wer(text, heard[t.k])
  // The best read: the fewest word errors, then the shorter take.
  const best = takes.filter(t => t.wer === null || t.wer <= 0.1).sort((x, y) => (x.wer ?? 0) - (y.wer ?? 0) || x.seconds - y.seconds)[0]
  for (const t of takes) console.log(`  ${id} take ${t.k}: ${t.seconds.toFixed(2)} s, WER ${t.wer ?? '-'}  "${heard[t.k] ?? ''}"`)
  if (!best) { console.error(`${id}: no take passed the read-back`); process.exitCode = 1; continue }
  const ogg = join(NARRATION_DIR, `${id}.ogg`)
  await ffmpeg(['-y', '-i', best.master, '-c:a', 'libopus', '-b:a', '48k', ogg])
  console.log(`${id}: take ${best.k}, ${best.seconds.toFixed(2)} s → ${ogg.slice(ROOT.length + 1)}`)
}
