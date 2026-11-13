// A line's pause, measured: some lines need a short, exact break between two
// phrases ("Fight me — Nightmare!": the name must land as a name). The
// catalogue asks for it (`pause: [min, max]` seconds in the cards'
// LINE_DELIVERY); `voice:gen` reads each take back with Whisper's word times,
// finds the words either side of the line's first break (its first comma,
// dash, ellipsis or inner !/?), and measures the silence between them in the
// audio itself (10 ms frames; silent = 32 dB under the take's loudest frame).
// QA fails a take whose pause is out of range, so `--retry` voices new takes.

import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { ROOT } from './lib.mjs'

const FFMPEG = createRequire(join(ROOT, 'package.json'))('ffmpeg-static')
const SR = 16000
const HOP = 160
const DROP_DB = 32

const letters = (s) => [...s].filter(c => /[\p{L}\p{N}]/u.test(c)).length

/**
 * Where the line's first break falls among the heard words: the index of the first word AFTER it (null when the text has
 * no inner break). Matched by letters said, not by spelling, so a misheard word or a dropped comma still finds it.
 */
export const boundaryOf = (text, words) => {
  const m = /(\.\.\.|[,，、—–…;:；：]|[!！?？](?=.*[\p{L}\p{N}]))/u.exec(text)
  if (!m || words.length < 2) return null
  const before = letters(text.slice(0, m.index))
  if (!before || !letters(text.slice(m.index))) return null
  let best = null
  let cum = 0
  for (let k = 1; k < words.length; k++) {
    cum += letters(words[k - 1][0])
    const d = Math.abs(cum - before)
    if (!best || d < best.d) best = { k, d }
  }
  return best.k
}

/** Frames of the audio, loud or not (10 ms each). */
const loudFrames = (file) => {
  const r = spawnSync(FFMPEG, ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 })
  if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr}`)
  const b = r.stdout
  const x = new Float32Array(b.buffer, b.byteOffset, Math.floor(b.length / 4))
  const n = Math.floor(x.length / HOP)
  const db = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let s = 0
    for (let k = 0; k < HOP; k++) { const v = x[i * HOP + k]; s += v * v }
    db[i] = 10 * Math.log10(s / HOP + 1e-12)
  }
  let peak = -Infinity
  for (const v of db) if (v > peak) peak = v
  return Array.from(db, v => v > peak - DROP_DB)
}

/** The longest silent run of frames (s) within [from, to] seconds, and where it starts. */
export const silenceIn = (loud, from, to) => {
  const lo = Math.max(0, Math.floor(from * 100))
  const hi = Math.min(loud.length, Math.ceil(to * 100))
  let best = 0
  let at = lo
  let run = 0
  for (let i = lo; i < hi; i++) {
    if (loud[i]) { run = 0; continue }
    run++
    if (run > best) { best = run; at = i - run + 1 }
  }
  return { gap: best / 100, at: at / 100 }
}

/**
 * The pause of one take at its line's first break: `{ gap, at, words }` seconds, or null when the break cannot be found
 * (no read-back words, or a text without one).
 */
export const pauseOf = (wav, text, words) => {
  const k = words ? boundaryOf(text, words) : null
  if (k == null) return null
  const a = words[k - 1][2]
  const b = words[k][1]
  const r = silenceIn(loudFrames(wav), Math.min(a, b) - 0.15, Math.max(a, b) + 0.15)
  return { ...r, words: [words[k - 1][0].trim(), words[k][0].trim()] }
}
