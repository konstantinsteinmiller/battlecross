// `pnpm voice:intro:fit` — does every voiced language's narration fit the
// intro's beats (roadmap #130)? Plays the runner's queue on paper: a line
// starts at its beat, or 0.15 s after the one before it ends, whichever is
// later; the last one must be over before the fade (FADE_OUT_AT).

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { LANGS, VOICE_OUT } from './lib.mjs'
import { measure } from './post.mjs'
import { FADE_OUT_AT, INTRO_LINES } from '../../src/game/intro/script.ts'

let bad = 0
for (const lang of LANGS) {
  let end = 0
  const row = []
  for (let i = 0; i < INTRO_LINES.length; i++) {
    const l = INTRO_LINES[i]
    const f = join(VOICE_OUT, lang, `${l.id}.ogg`)
    const d = existsSync(f) ? (await measure(f)).seconds : 0
    const start = Math.max(l.at, end + (end ? 0.15 : 0))
    end = start + d
    const slot = (INTRO_LINES[i + 1]?.at ?? FADE_OUT_AT) - l.at
    const late = start - l.at
    row.push(`${l.id.split('.')[2]} ${d.toFixed(2)}/${slot.toFixed(1)}${late > 0.05 ? ` (+${late.toFixed(2)} late)` : ''}${d ? '' : ' MISSING'}`)
  }
  const ok = end <= FADE_OUT_AT
  if (!ok) bad++
  console.log(`${lang}  ${ok ? 'fits' : 'LATE'}  last ends ${end.toFixed(2)} s (fade ${FADE_OUT_AT})  |  ${row.join('  ')}`)
}
process.exit(bad ? 1 : 0)
