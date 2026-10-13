#!/usr/bin/env node
// ─── node tools/sfx-review/generate.mjs [--only id,id] [--suffix -alt1] ───────
//
// The sound review (roadmap #118): every sound the game can play (`SFX_NAMES`),
// rendered from the game's own synth recipes (`audio/synth.ts`) in a private
// headless Chrome with an OfflineAudioContext (the same route as
// `tools/sfx-render.mjs`), encoded to WebM (Opus) with ffmpeg-static, and listed in
// `manifest.json` with where each one plays (`descriptions.mjs`, plus the
// skills that use each cast/impact sound from `data/skillSounds.ts`).
//
// Output: tools/sfx-review/out/audio/<id><suffix>.webm and manifest.json.
// Screenshots come from `screenshots.mjs` (out/shots/<context>.jpg).
// For alternatives later: change a recipe (or drop in a file), run with
// `--only <id> --suffix -alt1`, and upload the result next to the original.
import { spawn, execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NOTES, CATEGORIES } from './descriptions.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const OUT = join(HERE, 'out')
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined }
const only = arg('--only')?.split(',')
const suffix = arg('--suffix') ?? ''
const SR = 44100
mkdirSync(join(OUT, 'audio'), { recursive: true })

// 1. What uses what: the skill data, read through Vite's SSR loader.
const { createServer, build } = await import('vite')
const server = await createServer({ configFile: false, logLevel: 'silent', server: { middlewareMode: true, hmr: false }, appType: 'custom', resolve: { alias: { '@': join(ROOT, 'src') } }, root: ROOT })
const ss = await server.ssrLoadModule('/src/game/data/skillSounds.ts')
const sk = await server.ssrLoadModule('/src/game/data/skills.ts')
const sfxMod = await server.ssrLoadModule('/src/game/audio/sfx.ts')
const en = (await server.ssrLoadModule('/src/i18n/locales/en.ts')).default
await server.close()

const NAMES = sfxMod.SFX_NAMES
const className = (c) => en.class?.[c]?.name ?? c
const skillName = (id) => en.skill?.[id]?.name ?? id
/** sound id -> { cast: [{skill, cls}], impact: [...] } */
const uses = new Map()
const add = (id, kind, s) => {
  if (!uses.has(id)) uses.set(id, { cast: [], impact: [], elements: new Set() })
  const u = uses.get(id)
  u[kind].push(s)
}
for (const def of sk.SKILLS.filter(s => s.kind === 'active')) {
  const el = ss.skillElement(def)
  const s = { skill: def.id, name: skillName(def.id), cls: def.cls, className: className(def.cls), element: el }
  add(ss.CAST_SOUND[el], 'cast', s); uses.get(ss.CAST_SOUND[el]).elements.add(el)
  add(ss.IMPACT_SOUND[el], 'impact', s); uses.get(ss.IMPACT_SOUND[el]).elements.add(el)
}

const listSkills = (arr) => {
  const by = new Map()
  for (const s of arr) { if (!by.has(s.className)) by.set(s.className, []); by.get(s.className).push(s.name) }
  return [...by].map(([c, n]) => `${c}: ${n.join(', ')}`).join('; ')
}

const entries = NAMES.map((id) => {
  const u = uses.get(id)
  const note = NOTES[id]
  let category = note?.category ?? (id.startsWith('cast') ? 'Skill cast' : id.startsWith('impact') ? 'Skill impact' : 'Ability')
  if (!note && id.startsWith('cast')) category = 'Skill cast'
  const parts = []
  if (u?.cast.length) parts.push(`CAST sound (plays as the skill starts) of the ${[...u.elements].join('/')} skills: ${listSkills(u.cast)}.`)
  if (u?.impact.length) parts.push(`IMPACT sound (plays when the skill hits, layered over the weapon hit sound: hit, hitBlunt, hitPierce or crit) of the ${[...u.elements].join('/')} skills: ${listSkills(u.impact)}.`)
  if (note) parts.push(note.where)
  if (!parts.length) parts.push('Not referenced by any call site found.')
  const firstCls = (u?.cast[0] ?? u?.impact[0])?.cls
  const shotCtx = !note || note.shot === 'class' ? (firstCls ? `class-${firstCls}` : 'fight') : note.shot
  return {
    id,
    category,
    description: parts.join(' '),
    usedBy: { castOf: (u?.cast ?? []).map(s => s.skill), impactOf: (u?.impact ?? []).map(s => s.skill), classes: [...new Set([...(u?.cast ?? []), ...(u?.impact ?? [])].map(s => s.cls))] },
    file: `out/audio/${id}.webm`,
    screenshot: `out/shots/${shotCtx}.jpg`,
    shotContext: shotCtx
  }
}).sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category))

// 2. The synth, bundled with the offline engine (as tools/sfx-render.mjs does).
const STUB = join(ROOT, 'tools/sfx-render/engine-stub.ts')
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

// 3. A private headless Chrome, stopped at the end.
const CHROME = process.env.CHROME ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const port = 20000 + Math.floor(Math.random() * 20000)
const profile = mkdtempSync(join(tmpdir(), 'sfx-review-'))
const chrome = spawn(CHROME, [`--remote-debugging-port=${port}`, '--headless=new', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore', windowsHide: true })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
let ws
const quit = async () => {
  try { ws?.close() } catch { /* never opened */ }
  chrome.kill()
  await sleep(300)
  try { rmSync(profile, { recursive: true, force: true }) } catch { /* still letting go */ }
}
let targets
for (let i = 0; i < 60 && !targets; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json() } catch { await sleep(200) }
}
if (!targets) { console.error('Chrome did not start'); await quit(); process.exit(1) }
ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r))
let mid = 0
const pending = new Map()
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) } })
const send = (method, params = {}) => new Promise(r => { const i = ++mid; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 800))
  return r.result?.result?.value
}
await evaluate(bundle)
// Stereo, 4 s, the tail trimmed at silence (plus a short pad).
await evaluate(`window.renderStereo = async (name, layer, take) => {
  const ctx = new OfflineAudioContext(2, ${SR} * 4, ${SR})
  const bus = ctx.createGain()
  bus.connect(ctx.destination)
  window.__off = { ctx, sfx: bus, music: bus, voice: bus }
  if (take) {
    const r = Synth.remakeTakes(name)[take]
    if (!r) return null
    r(0, 1)
  } else if (!Synth.recipeFor(name, 0, layer ? 0.8 : 1, 1)) return null
  if (layer) Synth.recipeFor(layer, 0, 1, 1)
  const buf = await ctx.startRendering()
  const l = buf.getChannelData(0), r = buf.getChannelData(1)
  let end = l.length
  while (end > 0 && Math.abs(l[end - 1]) < 2e-4 && Math.abs(r[end - 1]) < 2e-4) end--
  end = Math.min(l.length, end + Math.floor(${SR} * 0.05))
  const pcm = new Int16Array(end * 2)
  for (let i = 0; i < end; i++) { pcm[2 * i] = Math.max(-1, Math.min(1, l[i])) * 32767; pcm[2 * i + 1] = Math.max(-1, Math.min(1, r[i])) * 32767 }
  const bytes = new Uint8Array(pcm.buffer)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}; true`)

const req = createRequire(join(ROOT, 'package.json'))
const FFMPEG = req('ffmpeg-static')
const wavOf = (pcm) => {
  const h = Buffer.alloc(44)
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8)
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22)
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34)
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([h, pcm])
}
const failed = []
const tmp = mkdtempSync(join(tmpdir(), 'sfx-review-wav-'))
for (const e of entries) {
  if (only && !only.includes(e.id)) continue
  const b64 = await evaluate(`renderStereo(${JSON.stringify(e.id)})`)
  if (!b64) { failed.push(e.id); continue }
  const pcm = Buffer.from(b64, 'base64')
  e.durationMs = Math.round(pcm.length / 4 / SR * 1000)
  const wav = join(tmp, `${e.id}.wav`)
  writeFileSync(wav, wavOf(pcm))
  const out = join(OUT, 'audio', `${e.id}${suffix}.webm`)
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libopus', '-b:a', '128k', out])
  console.log(`  ${e.id} ${e.durationMs} ms`)
  // A skill impact never plays alone: the weapon's hit lands with it (zoneMode
  // 'damage'). The mix a staff/wand/fist hero hears: the impact at 0.8 over hitBlunt.
  if (e.category === 'Skill impact') {
    const m = Buffer.from(await evaluate(`renderStereo(${JSON.stringify(e.id)}, 'hitBlunt')`), 'base64')
    writeFileSync(wav, wavOf(m))
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libopus', '-b:a', '128k', join(OUT, 'audio', `${e.id}${suffix}.mix.webm`)])
    e.mixFile = `out/audio/${e.id}.mix.webm`
    e.mixNote = 'As heard in a fight by a staff, wand or bare-handed hero: this impact layered over the hitBlunt hit sound.'
  }
}
// The sound review's remakes (#118): each one's takes A and B, and what it replaced.
const remakes = []
const encode = (pcm, file) => {
  const wav = join(tmp, 'take.wav')
  writeFileSync(wav, wavOf(pcm))
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libopus', '-b:a', '128k', join(OUT, 'audio', file)])
}
for (const e of entries) {
  if (only && !only.includes(e.id)) continue
  const files = {}
  for (const take of ['A', 'B', 'old']) {
    const b64 = await evaluate(`renderStereo(${JSON.stringify(e.id)}, null, '${take}')`)
    if (!b64) continue
    encode(Buffer.from(b64, 'base64'), `${e.id}.${take}.webm`)
    files[take] = `out/audio/${e.id}.${take}.webm`
  }
  if (files.A) { remakes.push({ id: e.id, files }); console.log(`  remake ${e.id}: ${Object.keys(files).join(' ')}`) }
}
if (!only) writeFileSync(join(HERE, 'remakes.json'), JSON.stringify(remakes, null, 2) + '\n')
await quit()
rmSync(tmp, { recursive: true, force: true })

// 4. The manifest (a partial --only run keeps the rest of an existing one).
const mf = join(HERE, 'manifest.json')
if (!only) {
  for (const e of entries) if (!existsSync(join(HERE, e.screenshot))) e.screenshot = null
  writeFileSync(mf, JSON.stringify({ generated: new Date().toISOString(), count: entries.length, sounds: entries }, null, 2) + '\n')
}
console.log(`${entries.length} sounds${failed.length ? `, no recipe: ${failed.join(', ')}` : ''} → ${mf}`)
