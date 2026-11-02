// Voice samples for the cage's cries (#187): ElevenLabs premade voices (over the API, key from `.env.voice.local`)
// speaking the five lines in English and German, into reports/vo-help/el/<voice>/<lang>/<key>.mp3, for the report
// page (scripts/vo-help-report.mjs). Nothing here is shipped.
//
//   node --experimental-strip-types --no-warnings tools/voice/help-samples.mjs

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, VOICE_LINES, textOf } from './lib.mjs'

const key = (() => {
  for (const f of ['.env.voice.local', '.env']) {
    const p = join(ROOT, f)
    if (!existsSync(p)) continue
    const m = readFileSync(p, 'utf8').match(/^\s*ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]*)"?\s*$/m)
    if (m && m[1].trim()) return m[1].trim()
  }
  return process.env.ELEVENLABS_API_KEY ?? ''
})()
if (!key) throw new Error('no ELEVENLABS_API_KEY')

export const VOICES = [
  ['Liam', 'TX3LPaxmHKxFdv7VOQHJ', 'young man, articulate'],
  ['Charlie', 'IKne3meq5aSn9XLyUdCD', 'casual, confident man'],
  ['Daniel', 'onwK4e9ZLuTAKqWW03F9', 'deep, steady narrator'],
  ['Bill', 'pqHfZKP75CvOlQylNhV4', 'old, warm, wise'],
  ['Brian', 'nPczCjzI2devNBz1zQrb', 'deep, resonant'],
  ['George', 'JBFqnCBsd6RMkjVDRZzb', 'warm, raspy storyteller'],
  ['Sarah', 'EXAVITQu4vr4xnSDxMaL', 'soft young woman'],
  ['Laura', 'FGY2WhTYpPnrIDTdsKH5', 'upbeat young woman'],
  ['Jessica', 'cgSgspJ2msm6clMCkdW9', 'expressive, bright woman'],
  ['Alice', 'Xb7hH8MSUJpSbSDYk0k2', 'clear, confident woman'],
  ['Matilda', 'XrExE9yKIg1WjnnlVkGX', 'warm, friendly woman'],
  ['Lily', 'pFZP5JQG7iQjIQuC4Bku', 'velvety, mature woman'],
  ['Rachel', '21m00Tcm4TlvDq8ikWAM', 'calm, steady woman']
]
const LINES = ['dlg.bark.hero.cage.1', 'dlg.bark.trainerPyro.help.1', 'dlg.bark.sbMasterSoulwarden.help.1', 'dlg.bark.sbMasterIronmonk.help.1']
const out = join(ROOT, 'reports', 'vo-help', 'el')
for (const lang of ['en', 'de']) {
  for (const [name, id] of VOICES) {
    for (const k of LINES) {
      const l = VOICE_LINES.find(q => q.key === k)
      const text = textOf(l, lang)
      const dir = join(out, name, lang)
      mkdirSync(dir, { recursive: true })
      const file = join(dir, `${k}.mp3`)
      if (existsSync(file)) continue
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true } })
      })
      if (!res.ok) { console.error(`${name}/${lang}/${k}: ${res.status} ${(await res.text()).slice(0, 160)}`); continue }
      writeFileSync(file, Buffer.from(await res.arrayBuffer()))
      console.log(`${name}/${lang}/${k}`)
    }
  }
}
