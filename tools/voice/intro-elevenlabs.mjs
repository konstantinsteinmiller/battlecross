// `pnpm voice:intro` — the intro's narration (roadmap #130) by ElevenLabs,
// over its HTTP API: the Chronicler, an old storyteller with a deep, warm,
// charming voice, reads the five lines of `dlg.intro.*` (data/voice-manifest.json),
// each take through the pipeline's own post-production (`post.mjs`: the
// chain, the trim, the loudness, Opus 24 kbps in .ogg) into
// public/audio/voice/<lang>/<id>.ogg, and recorded in vo-src/shipped.json
// like every other shipped take, so a later text change marks it stale.
//
//   pnpm voice:intro                 English (the owner's choice for this voice)
//   pnpm voice:intro --lang de       another voiced language, same voice (multilingual model)
//   pnpm voice:intro --voice <id>    another ElevenLabs voice (default: ELEVENLABS_VOICE_ID, else "Bill")
//   pnpm voice:intro --dry           print the jobs, call nothing
//
// The key: ELEVENLABS_API_KEY in the environment, `.env.voice.local` or
// `.env` (never committed: every .env file is gitignored). Without one it
// stops and says so; it never signs in to anything. The voice-over rules of
// this repo still hold for the other languages: `pnpm voice:gen --engine
// chatterbox --lang <lang>` voices them from their own locale text.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { LANGS, ROOT, VOICE_LINES, VO_SRC, VOICE_OUT, args, hashFor, maxFor, textOf } from './lib.mjs'
import { ffmpeg, processTake } from './post.mjs'
import { normalize } from './normalize.mjs'

const a = args()
const lang = a.lang ?? 'en'
if (!LANGS.includes(lang)) throw new Error(`--lang must be one of ${LANGS.join(', ')}`)

/** KEY=VALUE files, first one that has the key wins (the environment before all). */
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

// "Bill": ElevenLabs' premade old American male narrator (wise, mature, warm).
const VOICE = a.voice ?? (envKey('ELEVENLABS_VOICE_ID') || 'pqHfZKP75CvOlQylNhV4')
const MODEL = a.model ?? 'eleven_multilingual_v2'
// Slow and grave with room to colour each line; a little style for the charm.
const SETTINGS = { stability: 0.42, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 0.92 }

const lines = VOICE_LINES.filter(l => l.key.startsWith('dlg.intro.'))
if (!lines.length) throw new Error('no dlg.intro.* lines in data/voice-manifest.json: run `pnpm voice:manifest` first')

const jobs = lines.map((l) => {
  const shown = textOf(l, lang)
  if (!shown) throw new Error(`${lang}/${l.key} has no text in that locale`)
  return { id: `${lang}/${l.key}`, key: l.key, speaker: l.speaker, text: normalize(shown, lang).text, shown, max: maxFor(l, lang, shown), hash: hashFor(l, lang, shown) }
})

if (a.dry) {
  for (const j of jobs) console.log(`${j.id}  (${j.max}s)  ${j.text}`)
  process.exit(0)
}

const KEY = envKey('ELEVENLABS_API_KEY')
if (!KEY) {
  console.error([
    'No ElevenLabs key. Add one line to `.env.voice.local` (gitignored):',
    '',
    '  ELEVENLABS_API_KEY=sk_...',
    '',
    '(ElevenLabs → Profile → API keys; the "Text to Speech" permission is enough.)',
    'Optionally ELEVENLABS_VOICE_ID=<voice id> for another voice. Then run `pnpm voice:intro` again.'
  ].join('\n'))
  process.exit(2)
}

const work = join(VO_SRC, 'gen', 'elevenlabs-api', lang)
mkdirSync(work, { recursive: true })
const bookFile = join(VO_SRC, 'shipped.json')
const book = existsSync(bookFile) ? JSON.parse(readFileSync(bookFile, 'utf8')) : {}
const day = new Date().toISOString().slice(0, 10)

for (const j of jobs) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text: j.text, model_id: MODEL, voice_settings: SETTINGS })
  })
  if (!res.ok) throw new Error(`ElevenLabs ${res.status} for ${j.id}: ${(await res.text()).slice(0, 400)}`)
  const mp3 = join(work, `${j.key}.mp3`)
  writeFileSync(mp3, Buffer.from(await res.arrayBuffer()))
  const raw = join(work, `${j.key}.wav`)
  await ffmpeg(['-i', mp3, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s24le', raw])
  const ogg = join(VOICE_OUT, lang, `${j.key}.ogg`)
  const m = await processTake({ raw, master: join(work, `${j.key}.master.wav`), ogg, speaker: j.speaker, key: j.key, max: j.max * 1.6 })
  book[j.id] = { engine: 'elevenlabs', at: day, hash: j.hash }
  console.log(`${j.id}: ${m.seconds.toFixed(2)} s, ${m.lufs ?? '-'} LUFS → ${ogg.slice(ROOT.length + 1)}`)
}
const sorted = Object.fromEntries(Object.entries(book).sort(([x], [y]) => x.localeCompare(y)))
writeFileSync(bookFile, `${JSON.stringify(sorted, null, 2)}\n`)
console.log('Done. Listen in the game (VITE_INTRO_ENABLED=true) and check each line ends before the next one starts (src/game/intro/script.ts).')
