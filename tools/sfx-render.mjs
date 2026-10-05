#!/usr/bin/env node
// ─── node tools/sfx-render.mjs <events.json> <out.wav> ───────────────────────
//
// The trailer's sound effects: the game's own synth recipes (`src/game/audio/
// synth.ts`, `recipeFor`) rendered OFFLINE in a private headless Chrome — one
// take per sound and pitch variant — then laid at the times the recording
// logged them (`events.json`: { durationMs, events: [{ name, ms, pan, gain }] }),
// with the live player's own rules: a minimum gap per sound, at most so many
// sounds in a quarter second, a little pitch and level variety (three takes of
// each sound, a few percent apart in pitch, picked at random). Events named
// `trailer…` are the trailer's own (`sfx-render/sweeteners.js`: a cinematic
// hit on a cut, a whoosh into it, a riser, a last sub drop). Writes a 44.1 kHz
// stereo WAV the trailer mix lays under the music.
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [eventsPath, outPath] = process.argv.slice(2)
if (!eventsPath || !outPath) { console.error('usage: node tools/sfx-render.mjs <events.json> <out.wav>'); process.exit(1) }
const { durationMs, events } = JSON.parse(readFileSync(eventsPath, 'utf8'))
const SR = 44100

// 1. The synth, bundled with an offline engine in place of the live one.
const STUB = join(ROOT, 'tools/sfx-render/engine-stub.ts')
const { build } = await import('vite')
const res = await build({
  configFile: false,
  logLevel: 'silent',
  resolve: { alias: { '@': join(ROOT, 'src') } },
  plugins: [{
    name: 'offline-engine',
    enforce: 'pre',
    // By the file it lands on: Vite's '@' alias resolves before any plugin sees the import.
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
const profile = mkdtempSync(join(tmpdir(), 'sfx-render-'))
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
await evaluate(bundle)
await evaluate(readFileSync(join(ROOT, 'tools/sfx-render/sweeteners.js'), 'utf8'))
await evaluate(`window.renderSfx = async (name, tune) => {
  const sweet = name.startsWith('trailer')
  const ctx = new OfflineAudioContext(2, Math.ceil(${SR} * (sweet ? window.trailerSweeteners.length[name] ?? 3 : 3.6)), ${SR})
  if (sweet) window.trailerSweeteners.render(name, ctx)
  else {
    const bus = ctx.createGain()
    bus.connect(ctx.destination)
    window.__off = { ctx, sfx: bus, music: bus, voice: bus }
    if (!Synth.recipeFor(name, 0, 1, tune)) return null
  }
  const buf = await ctx.startRendering()
  // Mono for the layout (it pans each placement itself): the two channels summed.
  const l = buf.getChannelData(0)
  const r = buf.getChannelData(1)
  const d = new Float32Array(l.length)
  for (let i = 0; i < l.length; i++) d[i] = (l[i] + r[i]) * 0.5
  let end = d.length
  while (end > 0 && Math.abs(d[end - 1]) < 1e-4) end--
  const pcm = new Int16Array(end)
  for (let i = 0; i < end; i++) pcm[i] = Math.max(-1, Math.min(1, d[i])) * 32767
  const bytes = new Uint8Array(pcm.buffer)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}; true`)

// 3. Three takes per sound used (a few percent apart in pitch, each with its own noise): no two hits alike.
const names = [...new Set(events.map(e => e.name))]
const takes = new Map()
for (const n of names) {
  const set = []
  for (const tune of n.startsWith('trailer') ? [1] : [0.94, 1, 1.06]) {
    const b64 = await evaluate(`renderSfx(${JSON.stringify(n)}, ${tune})`)
    if (!b64) break
    const buf = Buffer.from(b64, 'base64')
    set.push(new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2))
  }
  if (!set.length) { console.warn(`  no recipe for ${n}`); continue }
  takes.set(n, set)
}

// 4. Lay them out with the live player's rules (synth.ts: GAP 0.02 s, CAP 22 per 0.25 s).
const total = Math.ceil(SR * durationMs / 1000)
const L = new Float32Array(total)
const R = new Float32Array(total)
const last = new Map()
const recent = []
let laid = 0
for (const e of [...events].sort((a, b) => a.ms - b.ms)) {
  const set = takes.get(e.name)
  if (!set) continue
  const take = set[Math.floor(Math.random() * set.length)]
  const t = e.ms / 1000
  const sweet = e.name.startsWith('trailer')
  if (!sweet && t - (last.get(e.name) ?? -1) < 0.04) continue
  while (recent.length && t - recent[0] > 0.25) recent.shift()
  if (!sweet && recent.length >= 22) continue
  if (!sweet) recent.push(t)
  last.set(e.name, t)
  const pan = Math.max(-1, Math.min(1, e.pan ?? 0))
  const g = Math.max(0.05, Math.min(1.4, e.gain ?? 1)) * (0.9 + Math.random() * 0.2)
  const gl = g * Math.cos((pan + 1) * Math.PI / 4)
  const gr = g * Math.sin((pan + 1) * Math.PI / 4)
  const at = Math.floor(t * SR)
  for (let i = 0; i < take.length && at + i < total; i++) {
    const s = take[i] / 32768
    L[at + i] += s * gl
    R[at + i] += s * gr
  }
  laid++
}

// 5. A 16-bit stereo WAV (soft-clipped: a big fight stacks a lot of hits).
const pcm = Buffer.alloc(44 + total * 4)
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + total * 4, 4); pcm.write('WAVE', 8)
pcm.write('fmt ', 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22)
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34)
pcm.write('data', 36); pcm.writeUInt32LE(total * 4, 40)
const clip = (x) => Math.tanh(x * 0.9)
for (let i = 0; i < total; i++) {
  pcm.writeInt16LE(Math.round(clip(L[i]) * 32767), 44 + i * 4)
  pcm.writeInt16LE(Math.round(clip(R[i]) * 32767), 46 + i * 4)
}
writeFileSync(outPath, pcm)
console.log(`sfx: ${laid} of ${events.length} sounds laid (${takes.size} kinds) → ${outPath}`)
await quit(0)
