#!/usr/bin/env node
// ─── node tools/score-render.mjs <trailer|game> <out.wav|.ogg|.mp3> ─────────
//
// Renders "The Last Light" (`tools/score-render/score.mjs`) with sampled
// instruments: the FluidR3_GM soundfont (Frank Wen, CC BY 3.0) as published by
// midi-js-soundfonts (https://github.com/gleitz/midi-js-soundfonts), fetched
// once into tools/score-render/.samples/ (not committed), played in a private
// headless Chrome into an OfflineAudioContext (`score-render/page.js`).
//
//   trailer  the whole piece, cut to the cinematic trailer's bars (WAV for the mix)
//   game     the boss fight's loop → public/audio/music/boss.ogg
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { score } from './score-render/score.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [edit = 'trailer', outPath] = process.argv.slice(2)
if (!outPath) { console.error('usage: node tools/score-render.mjs <trailer|game> <out.wav|.ogg|.mp3>'); process.exit(1) }
const ffmpeg = createRequire(join(ROOT, 'package.json'))('ffmpeg-static')
const FONTS = ['acoustic_grand_piano', 'violin', 'cello', 'string_ensemble_1', 'pizzicato_strings', 'acoustic_guitar_nylon', 'taiko_drum', 'timpani']
const CACHE = join(ROOT, 'tools/score-render/.samples')
const BASE = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/'

// 1. The samples, cached.
mkdirSync(CACHE, { recursive: true })
for (const f of FONTS) {
  const file = join(CACHE, `${f}-mp3.js`)
  if (existsSync(file)) continue
  process.stdout.write(`  fetching ${f} … `)
  const r = await fetch(BASE + `${f}-mp3.js`)
  if (!r.ok) { console.error(`HTTP ${r.status}`); process.exit(1) }
  writeFileSync(file, Buffer.from(await r.arrayBuffer()))
  console.log('ok')
}

// 2. A private headless Chrome (own profile, random port), stopped at the end.
const CHROME = process.env.CHROME ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const port = 20000 + Math.floor(Math.random() * 20000)
const profile = mkdtempSync(join(tmpdir(), 'score-render-'))
const chrome = spawn(CHROME, [`--remote-debugging-port=${port}`, '--headless=new', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore', windowsHide: true })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
let ws
const quit = async (code) => {
  try { ws?.close() } catch { /* never opened */ }
  chrome.kill()
  await sleep(300)
  try { rmSync(profile, { recursive: true, force: true }) } catch { /* still letting go */ }
  process.exit(code)
}
let targets
for (let i = 0; i < 60 && !targets; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json() } catch { await sleep(200) }
}
if (!targets) { console.error('Chrome did not start'); await quit(1) }
ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) } })
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 800))
  return r.result?.result?.value
}

try {
  // 3. The soundfonts and the renderer into the page; the score rendered.
  for (const f of FONTS) await evaluate(readFileSync(join(CACHE, `${f}-mp3.js`), 'utf8') + ';true')
  await evaluate(readFileSync(join(ROOT, 'tools/score-render/page.js'), 'utf8') + ';true')
  const s = score(edit)
  console.log(`rendering "${edit}": ${s.events.length} notes, ${s.seconds.toFixed(1)} s`)
  const info = await evaluate(`renderScore(${JSON.stringify(s)}, {})`)
  if (info.missing) console.warn(`  ${info.missing} notes had no sample`)
  // 4. The PCM out of the page in chunks, into a WAV.
  const chunks = []
  const CH = 4 * 1024 * 1024
  for (let at = 0; at < info.bytes; at += CH) chunks.push(Buffer.from(await evaluate(`pcmChunk(${at}, ${CH})`), 'base64'))
  const pcm = Buffer.concat(chunks)
  const head = Buffer.alloc(44)
  head.write('RIFF', 0); head.writeUInt32LE(36 + pcm.length, 4); head.write('WAVE', 8)
  head.write('fmt ', 12); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22)
  head.writeUInt32LE(44100, 24); head.writeUInt32LE(44100 * 4, 28); head.writeUInt16LE(4, 32); head.writeUInt16LE(16, 34)
  head.write('data', 36); head.writeUInt32LE(pcm.length, 40)
  mkdirSync(dirname(resolve(outPath)), { recursive: true })
  if (outPath.endsWith('.wav')) writeFileSync(outPath, Buffer.concat([head, pcm]))
  else {
    const tmp = join(profile, 'score.wav')
    writeFileSync(tmp, Buffer.concat([head, pcm]))
    const codec = outPath.endsWith('.ogg') ? ['-c:a', 'libvorbis', '-q:a', '5'] : ['-c:a', 'libmp3lame', '-b:a', '192k']
    const r = spawnSync(ffmpeg, ['-y', '-v', 'error', '-i', tmp, ...codec, outPath], { stdio: 'inherit', windowsHide: true })
    if (r.status !== 0) throw new Error('encode failed')
  }
  console.log(`✓ ${outPath} (${(pcm.length / 4 / 44100).toFixed(1)} s, peak ${info.peak.toFixed(2)})`)
  await quit(0)
} catch (e) {
  console.error(e)
  await quit(1)
}
