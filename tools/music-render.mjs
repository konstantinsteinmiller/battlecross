#!/usr/bin/env node
// ─── node tools/music-render.mjs [--out <dir>] [--seconds <n>] [--stems] [song …] ─
//
// Renders the composed score (`src/game/audio/songs.ts`) offline, in a headless
// Chrome of its own (private profile, random debugging port), and reports per
// song:
//
//   pass       one pass's length (a jingle: the whole thing, tail included)
//   loudness   integrated, K-weighted (LUFS-style, gating omitted)
//   peak       sample peak of the song's own mix
//   lo/mid/hi  share of the energy below 250 Hz, 250 Hz–2 kHz, above 2 kHz
//   comp       the most the game's master compressor pulls the song down with
//              the music volume at MAXIMUM (engine.ts: bus gain 0.2, threshold
//              −14 dB, knee 12, ratio 4) — the pumping check: under 1 dB is
//              inaudible
//   speed      offline render speed, × realtime: a rough CPU-cost gauge, and
//              only that — anything else running on the machine slows it, so
//              compare songs from one quiet run (--best 3 renders each song
//              three times and keeps the fastest)
//
// That is how the songs' `gain` trims are set: every song should land within
// ±1.5 LU of the others, so a handover never jumps in level, and no peak may
// reach 0 dB.
//
// With --out it also writes <song>.mp3 (via ffmpeg-static) so the score can be
// listened to without playing the game.
//
// Usage:
//   node tools/music-render.mjs                     # every song, stats only
//   node tools/music-render.mjs --out tmp/music meadow boss
//   node tools/music-render.mjs --stems meadow      # the same, per instrument
//   node tools/music-render.mjs --dry               # without the reverb (what the voices alone cost)

import { spawn } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(ROOT, 'package.json'))

const argv = process.argv.slice(2)
const flag = (name) => { const i = argv.indexOf(name); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, 2); return v }
const OUT = flag('--out')
const SECONDS = Number(flag('--seconds') ?? 0)
const STEMS = argv.includes('--stems') ? (argv.splice(argv.indexOf('--stems'), 1), true) : false
const DRY = argv.includes('--dry') ? (argv.splice(argv.indexOf('--dry'), 1), true) : false
const BEST = Math.max(1, Number(flag('--best') ?? 1))

// 1. Bundle songs.ts for the browser with Vite's own build (no extra deps).
const { build } = await import('vite')
const res = await build({
  configFile: false,
  logLevel: 'silent',
  resolve: { alias: { '@': join(ROOT, 'src') } },
  build: {
    write: false,
    minify: false,
    lib: { entry: join(ROOT, 'src/game/audio/songs.ts'), formats: ['iife'], name: 'Songs' }
  }
})
const bundle = (Array.isArray(res) ? res[0] : res).output[0].code

// 2. A private headless Chrome.
const CHROME = process.env.CHROME ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const port = 20000 + Math.floor(Math.random() * 20000)
const profile = mkdtempSync(join(tmpdir(), 'music-render-'))
const chrome = spawn(CHROME, [`--remote-debugging-port=${port}`, '--headless=new', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore', windowsHide: true })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const quit = async (code) => {
  try { ws?.close() } catch { /* never opened */ }
  chrome.kill()
  await sleep(300)
  try { rmSync(profile, { recursive: true, force: true }) } catch { /* Chrome still letting go of it */ }
  process.exit(code)
}
let ws
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

await evaluate(bundle)
await evaluate(`
window.renderSong = async (id, seconds, wantWav, only) => {
  const full = Songs.getSong(id)
  const base = only ? { ...full, steps: full.steps.map(evs => evs.filter(e => e.i === only)) } : full
  // --dry: no reverb sends, to tell what the voices cost from what the hall costs.
  const song = ${DRY} ? { ...base, chans: Object.fromEntries(Object.entries(base.chans).map(([k, v]) => [k, { ...v, send: 0 }])) } : base
  const once = song.kind === 'jingle'
  const pass = Songs.songSeconds(song) + (once ? song.reverb.seconds : 0)
  const len = seconds || pass
  const SR = 44100
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * (len + 1.5)), SR)
  const out = Songs.makeOut(ctx, ctx.destination, song)
  const spb = Songs.stepSeconds(song)
  let t = 0.05, step = 0
  // Schedule the way the game's sequencer does — a little ahead of the clock,
  // chunk by chunk — so the graph only ever holds the voices that are live.
  // (Scheduling the whole song up front leaves tens of thousands of pending
  // nodes in the graph, and the render speed then measures that, not the music.)
  const CHUNK = 256 * 128 / SR
  const scheduleUntil = (until) => {
    while (t < Math.min(until, len)) {
      if (step >= song.steps.length) { if (once) return; step = song.loopBar * song.barSteps }
      Songs.playStep(out, song, step, t, spb)
      t += spb; step++
    }
  }
  scheduleUntil(CHUNK + 0.2)
  for (let at = CHUNK; at < len; at += CHUNK) {
    const until = at + CHUNK + 0.2
    ctx.suspend(at).then(() => { scheduleUntil(until); ctx.resume() })
  }
  const t0 = performance.now()
  const buf = await ctx.startRendering()
  const speed = (len + 1.5) / ((performance.now() - t0) / 1000)
  const n = Math.min(buf.length, Math.floor(SR * len))
  // K-weighting (BS.1770 shape: high shelf + high-pass), then mean square.
  const k = new OfflineAudioContext(2, buf.length, SR)
  const src = k.createBufferSource(); src.buffer = buf
  const shelf = k.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 1500; shelf.gain.value = 4
  const hp = k.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 38; hp.Q.value = 0.5
  src.connect(shelf).connect(hp).connect(k.destination); src.start()
  const kb = await k.startRendering()
  let ms = 0, peak = 0
  for (let c = 0; c < 2; c++) {
    const d = kb.getChannelData(c), raw = buf.getChannelData(c)
    let s = 0
    for (let i = 0; i < n; i++) { s += d[i] * d[i]; const a = Math.abs(raw[i]); if (a > peak) peak = a }
    ms += s / n
  }
  // The spectrum in three bands (4th-order splits at 250 Hz and 2 kHz).
  const band = async (lo, hi) => {
    const b = new OfflineAudioContext(2, buf.length, SR)
    const s = b.createBufferSource(); s.buffer = buf
    let tail = s
    for (const [type, f] of [['highpass', lo], ['highpass', lo], ['lowpass', hi], ['lowpass', hi]]) {
      if (!f) continue
      const q = b.createBiquadFilter(); q.type = type; q.frequency.value = f; q.Q.value = 0.707
      tail.connect(q); tail = q
    }
    tail.connect(b.destination); s.start()
    const r = await b.startRendering()
    let e = 0
    for (let c = 0; c < 2; c++) { const d = r.getChannelData(c); for (let i = 0; i < n; i++) e += d[i] * d[i] }
    return e
  }
  const bands = [await band(0, 250), await band(250, 2000), await band(2000, 0)]
  const sum = bands[0] + bands[1] + bands[2] || 1
  // The game's master chain with the music volume at maximum: how far does the
  // compressor pull the song down, at worst, over any 100 ms?
  const m = new OfflineAudioContext(2, buf.length, SR)
  const ms2 = m.createBufferSource(); ms2.buffer = buf
  const bus = m.createGain(); bus.gain.value = 0.2
  const comp = m.createDynamicsCompressor()
  comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2
  ms2.connect(bus).connect(comp).connect(m.destination); ms2.start()
  const mb = await m.startRendering()
  const W = Math.floor(SR * 0.1)
  let least = Infinity, most = -Infinity
  const dry = buf.getChannelData(0), wet = mb.getChannelData(0)
  // The compressor node delays its output by its look-ahead (6 ms): line the two up.
  const D = Math.round(SR * 0.006)
  for (let i = W; i + W + D < n; i += W) {
    let a = 0, b = 0
    for (let j = 0; j < W; j++) { a += dry[i + j] * dry[i + j]; b += wet[i + j + D] * wet[i + j + D] }
    if (a / W < 1e-5) continue
    const g = 10 * Math.log10(b / (a * 0.04))
    if (g < least) least = g
    if (g > most) most = g
  }
  // A DynamicsCompressorNode adds a fixed make-up gain, so the absolute figure
  // means nothing: what pumps is the spread between the song's quietest
  // window (untouched) and its loudest (pulled down the most).
  const worst = Number.isFinite(least) ? least - most : 0
  const r = {
    id: only ? id + '/' + only : id, pass: +pass.toFixed(1), lufs: +(-0.691 + 10 * Math.log10(ms)).toFixed(1),
    peakDb: +(20 * Math.log10(peak)).toFixed(1), speed: Math.round(speed),
    bands: bands.map(e => Math.round(100 * e / sum)), comp: +worst.toFixed(1)
  }
  if (wantWav) {
    const L = buf.getChannelData(0), R = buf.getChannelData(1)
    const pcm = new Int16Array(buf.length * 2)
    for (let i = 0; i < buf.length; i++) {
      pcm[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767
      pcm[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767
    }
    const bytes = new Uint8Array(pcm.buffer)
    let bin = ''
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
    r.pcm = btoa(bin)
  }
  return r
}`)

const ALL = await evaluate('Songs.SONG_IDS')
const ids = argv.length ? argv : ALL
const unknown = ids.filter(i => !ALL.includes(i))
if (unknown.length) { console.error(`no such song: ${unknown.join(', ')} (there are: ${ALL.join(', ')})`); await quit(1) }

if (OUT) mkdirSync(OUT, { recursive: true })
const ffmpeg = OUT ? require('ffmpeg-static') : null
const row = (r) => `${r.id.padEnd(18)} ${String(r.pass).padStart(6)}  ${String(r.lufs).padStart(6)} LU  ${String(r.peakDb).padStart(6)} dB  ${r.bands.map(b => String(b).padStart(3)).join('/')} %  ${String(r.comp).padStart(5)} dB  ${String(r.speed).padStart(5)}x`
console.log('song               pass(s)  loudness     peak    lo/mid/hi      comp    speed')
if (STEMS) {
  for (const sid of ids) {
    const insts = await evaluate(`[...new Set(Songs.getSong(${JSON.stringify(sid)}).steps.flat().map(e => e.i))]`)
    for (const inst of insts) console.log(row(await evaluate(`renderSong(${JSON.stringify(sid)}, ${SECONDS}, false, ${JSON.stringify(inst)})`)))
  }
  await quit(0)
}
for (const sid of ids) {
  const r = await evaluate(`renderSong(${JSON.stringify(sid)}, ${SECONDS}, ${Boolean(OUT)})`)
  for (let k = 1; k < BEST; k++) r.speed = Math.max(r.speed, (await evaluate(`renderSong(${JSON.stringify(sid)}, ${SECONDS}, false)`)).speed)
  console.log(row(r))
  if (OUT) {
    const raw = join(OUT, `${sid}.pcm`)
    writeFileSync(raw, Buffer.from(r.pcm, 'base64'))
    await new Promise((ok, fail) => {
      const p = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', '44100', '-ac', '2', '-i', raw, '-b:a', '160k', join(OUT, `${sid}.mp3`)], { stdio: 'inherit', windowsHide: true })
      p.on('exit', c => (c === 0 ? ok() : fail(new Error(`ffmpeg exited ${c}`))))
    })
    rmSync(raw)
  }
}
await quit(0)
