#!/usr/bin/env node
// ─── node tools/sfx-lab/generate.mjs ──────────────────────────────────────────
// The sound lab's generator (roadmap #192): for each sound the game plays (`prompts.mjs`), 20 takes from ElevenLabs'
// sound-effect model, into reports/sfx-lab/audio/<id>/r<round>-<nn>.mp3, with `reports/sfx-lab/takes.json` listing them.
// Resumable: a take that exists is never asked for again, so a stopped run (the plan's credits ran out, a network drop)
// picks up where it was. The key is ELEVENLABS_API_KEY in `.env.voice.local` (never printed).
//
//   --only id,id      only these sounds            --count 20     takes per sound per round (default 20)
//   --round 1         a reroll round (other directions; `--rerolls` reads decisions.json for which sounds)
//   --rerolls         every sound the decisions file marks "reroll": the next round for each
//   --parallel 2      calls in flight (the plan's concurrency limit, 2 on a free plan)
//   --dry             print what would be asked, call nothing
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SOUNDS, promptFor, secondsFor } from './prompts.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const LAB = join(ROOT, 'reports', 'sfx-lab')
const AUDIO = join(LAB, 'audio')
const TAKES = join(LAB, 'takes.json')
const DECISIONS = join(LAB, 'decisions.json')
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 && !process.argv[i + 1]?.startsWith('--') ? process.argv[i + 1] : d }
const flag = (k) => process.argv.includes(k)
const COUNT = Number(arg('--count', 20))
const PARALLEL = Number(arg('--parallel', 2))
let round = Number(arg('--round', 0))
let only = arg('--only')?.split(',')

mkdirSync(AUDIO, { recursive: true })
const read = (f, d) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : d)
const takes = read(TAKES, {})
const decisions = read(DECISIONS, {})

// Which sounds, in the order a player meets them first: spells and what they do, then the rest.
const ORDER = Object.keys(SOUNDS)
let ids = (only ?? ORDER).filter(id => SOUNDS[id])
if (flag('--rerolls')) {
  ids = ids.filter(id => decisions[id]?.reroll)
  if (!ids.length) { console.log('no sound is marked "reroll" in decisions.json'); process.exit(0) }
}

const key = (() => {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY
  for (const f of ['.env.voice.local', '.env']) {
    const p = join(ROOT, f)
    if (!existsSync(p)) continue
    const m = readFileSync(p, 'utf8').match(/^\s*ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]*)"?\s*$/m)
    if (m?.[1]?.trim()) return m[1].trim()
  }
  return ''
})()

/** Every take still to make: [id, n, round]. */
const jobs = []
for (const id of ids) {
  // A reroll asks for the round after the last one that exists for this sound.
  const r = flag('--rerolls') ? Math.max(0, ...Object.keys(takes[id] ?? {}).map(f => Number(/^r(\d+)-/.exec(f)?.[1] ?? 0))) + 1 : round
  for (let n = 0; n < COUNT; n++) {
    const file = `r${r}-${String(n + 1).padStart(2, '0')}.mp3`
    if (!existsSync(join(AUDIO, id, file))) jobs.push({ id, n, r, file })
  }
}
console.log(`${jobs.length} takes to make for ${new Set(jobs.map(j => j.id)).size} sounds`)
if (flag('--dry')) { for (const j of jobs.slice(0, 8)) console.log(j.id, j.file, '|', promptFor(j.id, j.n, j.r)); process.exit(0) }
if (!key) throw new Error('no ELEVENLABS_API_KEY in .env.voice.local')

let stopped = ''
let done = 0
const save = () => writeFileSync(TAKES, JSON.stringify(takes, null, 1))
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const one = async (j) => {
  const text = promptFor(j.id, j.n, j.r)
  for (let attempt = 0; attempt < 4 && !stopped; attempt++) {
    const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
      method: 'POST', headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, duration_seconds: secondsFor(j.id), prompt_influence: 0.4 + (j.n % 5) * 0.1 })
    })
    if (res.ok) {
      mkdirSync(join(AUDIO, j.id), { recursive: true })
      writeFileSync(join(AUDIO, j.id, j.file), Buffer.from(await res.arrayBuffer()))
      ;(takes[j.id] ??= {})[j.file] = { text, round: j.r, n: j.n + 1 }
      done++
      if (done % 10 === 0) { save(); console.log(`${done}/${jobs.length}  ${j.id}`) }
      return
    }
    const body = (await res.text()).slice(0, 300)
    if (res.status === 429) { await sleep(4000 * (attempt + 1)); continue }
    // Out of credits, or the key may not do this: stop, keep what is made, say so.
    if ([401, 402, 403].includes(res.status) || /quota|credit|limit|exceed/i.test(body)) { stopped = `${res.status}: ${body}`; return }
    console.warn(`${j.id} ${j.file}: ${res.status} ${body}`)
    await sleep(1500)
  }
}

let next = 0
await Promise.all(Array.from({ length: PARALLEL }, async () => {
  while (next < jobs.length && !stopped) await one(jobs[next++])
}))
save()
console.log(stopped ? `STOPPED after ${done} takes: ${stopped}` : `done: ${done} takes`)
