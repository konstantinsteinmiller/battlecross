#!/usr/bin/env node
// ─── node tools/spell-sounds.mjs  (npm run sound:spells) ─────────────────────
//
// Owner decision 53 (roadmap #101): the runtime keeps its layered synthesis as
// the shipped spell sound, and the same recipes are ALSO rendered to files in
// `sound-src/generated-spells/` (outside public/, not bundled). The recipes are
// the game's own (`synth.ts`, `recipeFor`, the take the game plays), rendered
// OFFLINE in a private headless Chrome like the trailer's sound render, trimmed,
// levelled to one RMS with ffmpeg (peaks held near -3 dBFS) and encoded to mono Ogg Vorbis. Writes manifest.json beside them.
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'sound-src/generated-spells')
const SR = 44100
const TARGET_RMS = -22 // dBFS RMS of the sound itself
const CEILING = 0.7 // linear, -3 dBFS: headroom for the codec

const ELEMENTS = ['fire', 'ice', 'holy', 'shadow', 'poison', 'blood', 'quake', 'beam', 'explode', 'teleport']
const CASTS = ['cast', 'castFire', 'castIce', 'castShock', 'castHoly', 'castShadow', 'castPoison', 'castBlood', 'castEarth', 'castWind', 'castNature', 'castArcane', 'castTime', 'castSpirit', 'castSong', 'castTech', 'castCommand']
const SKILL_CASTS = ['castEarthShift', 'castBoulder', 'castFrostShatter', 'castAvalancheLeap', 'castAbsoluteZero', 'castSmokeBomb', 'castShadowMark', 'castOrbitalBeam', 'castSpark']
const IMPACTS = ['impactFire', 'impactIce', 'impactShock', 'impactWind', 'impactNature', 'impactArcane', 'impactTime', 'impactSpirit', 'impactSong', 'impactTech']
const KIND = new Map([
  ...ELEMENTS.map(n => [n, 'element']), ...CASTS.map(n => [n, 'cast']),
  ...SKILL_CASTS.map(n => [n, 'skillCast']), ...IMPACTS.map(n => [n, 'impact'])
])
const NAMES = [...KIND.keys()]
const familyOf = (n) => {
  const k = KIND.get(n)
  if (k === 'element') return n
  if (n === 'cast') return 'generic'
  return n.replace(/^(cast|impact)/, '').replace(/^./, c => c.toLowerCase())
}

const sh = (cmd, args) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 26 })
if (sh('ffmpeg', ['-version']).status !== 0) { console.error('ffmpeg not found on PATH'); process.exit(1) }

// 1. The synth bundled with the offline engine (same stubs as tools/sfx-render.mjs).
const STUB = join(ROOT, 'tools/sfx-render/engine-stub.ts')
const { build } = await import('vite')
const res = await build({
  configFile: false,
  logLevel: 'silent',
  resolve: { alias: { '@': join(ROOT, 'src') } },
  plugins: [{
    name: 'offline-engine',
    enforce: 'pre',
    load(id) {
      const f = id.replace(/\\/g, '/')
      if (f.endsWith('/src/game/audio/engine.ts')) return readFileSync(STUB, 'utf8')
      if (f.endsWith('/src/use/useAssets.ts')) return 'export const registerOneShotSource = () => {}'
      if (f.endsWith('/src/game/assets/overrides.ts')) return 'export const SFX_FILES = new Map()'
      return null
    }
  }],
  build: { write: false, minify: false, lib: { entry: join(ROOT, 'src/game/audio/synth.ts'), formats: ['iife'], name: 'Synth' } }
})
const bundle = (Array.isArray(res) ? res[0] : res).output[0].code

// 2. A private headless Chrome (own profile, random port), stopped at the end.
const CHROME = process.env.CHROME ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const port = 20000 + Math.floor(Math.random() * 20000)
const profile = mkdtempSync(join(tmpdir(), 'spell-sounds-'))
const chrome = spawn(CHROME, [`--remote-debugging-port=${port}`, '--headless=new', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore', windowsHide: true })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
let ws
const quit = async (code) => {
  try { ws?.close() } catch { /* never opened */ }
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'])
  else chrome.kill()
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
await evaluate(bundle)
// Mono 16-bit as base64: the two channels summed (the recipes are centred).
await evaluate(`window.renderSfx = async (name) => {
  const ctx = new OfflineAudioContext(2, ${SR * 4}, ${SR})
  const bus = ctx.createGain()
  bus.connect(ctx.destination)
  window.__off = { ctx, sfx: bus, music: bus, voice: bus }
  if (!Synth.recipeFor(name, 0, 1, 1)) return null
  const buf = await ctx.startRendering()
  const l = buf.getChannelData(0), r = buf.getChannelData(1)
  const d = new Int16Array(l.length)
  for (let i = 0; i < l.length; i++) d[i] = Math.max(-1, Math.min(1, (l[i] + r[i]) * 0.5)) * 32767
  const bytes = new Uint8Array(d.buffer)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}; true`)

// 3. Render, trim, level, encode.
mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) if (f.endsWith('.ogg')) unlinkSync(join(OUT, f))
const work = mkdtempSync(join(tmpdir(), 'spell-wav-'))
const entries = []
for (const name of NAMES) {
  const b64 = await evaluate(`renderSfx(${JSON.stringify(name)})`)
  if (!b64) { console.warn(`  no recipe for ${name}`); continue }
  const buf = Buffer.from(b64, 'base64')
  const pcm = new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2)
  let end = pcm.length
  while (end > 0 && Math.abs(pcm[end - 1]) < 33) end-- // about -60 dBFS
  let start = 0
  while (start < end && Math.abs(pcm[start]) < 33) start++
  const seg = pcm.subarray(start, end)
  const wav = Buffer.alloc(44 + seg.length * 2)
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + seg.length * 2, 4); wav.write('WAVE', 8)
  wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22)
  wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34)
  wav.write('data', 36); wav.writeUInt32LE(seg.length * 2, 40)
  Buffer.from(seg.buffer, seg.byteOffset, seg.length * 2).copy(wav, 44)
  const wavPath = join(work, `${name}.wav`)
  writeFileSync(wavPath, wav)
  entries.push({ name, wavPath, seconds: seg.length / SR })
}

const stat = (file, key) => {
  const r = sh('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'astats=metadata=0', '-f', 'null', '-'])
  const block = r.stderr.split('Overall')[1] ?? ''
  return Number(block.match(new RegExp(key + ' dB: (-?[0-9.]+)'))?.[1])
}
const manifest = []
for (const e of entries) {
  // Short percussive sounds fall under loudnorm's 400 ms gate, so the level is
  // the RMS of the sound itself, lifted to one target and held under the
  // ceiling by a limiter (a spiky sound ends a little quieter, never clipped).
  const fade = Math.min(0.02, e.seconds / 4)
  const tail = `afade=t=out:st=${Math.max(0, e.seconds - fade).toFixed(4)}:d=${fade.toFixed(4)}`
  const rms = stat(e.wavPath, 'RMS level')
  const gain = Math.min(30, TARGET_RMS - rms)
  const chain = `${tail},volume=${gain.toFixed(2)}dB,alimiter=limit=${CEILING}:attack=1:release=40:level=false`
  const file = `${e.name}.ogg`
  const r = sh('ffmpeg', ['-hide_banner', '-nostats', '-y', '-i', e.wavPath, '-af', chain, '-ar', String(SR), '-ac', '1', '-c:a', 'libvorbis', '-q:a', '3', join(OUT, file)])
  if (r.status !== 0) { console.error(r.stderr.slice(-600)); await quit(1) }
  const dec = join(work, e.name + '.dec.wav')
  sh('ffmpeg', ['-hide_banner', '-y', '-i', join(OUT, file), dec])
  manifest.push({
    file,
    event: e.name,
    kind: KIND.get(e.name),
    family: familyOf(e.name),
    seconds: Math.round(e.seconds * 1000) / 1000,
    bytes: statSync(join(OUT, file)).size,
    rmsDb: Math.round(stat(dec, 'RMS level') * 10) / 10,
    peakDb: Math.round(stat(dec, 'Peak level') * 10) / 10
  })
}
const files = manifest.sort((a, b) => a.file.localeCompare(b.file))
const totalBytes = files.reduce((s, f) => s + f.bytes, 0)
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({
  note: 'Generated by tools/spell-sounds.mjs (npm run sound:spells) from the game synth recipes. Not shipped: see README.md.',
  sampleRate: SR, channels: 1, codec: 'ogg/vorbis q3', targetRmsDb: TARGET_RMS, peakCeilingDb: -3,
  totalBytes, files
}, null, 2) + '\n')
rmSync(work, { recursive: true, force: true })
console.log(`spell sounds: ${files.length} files, ${(totalBytes / 1048576).toFixed(2)} MB → ${OUT}`)
await quit(0)
