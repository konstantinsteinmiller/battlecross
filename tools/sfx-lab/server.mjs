#!/usr/bin/env node
// ─── node tools/sfx-lab/server.mjs  (pnpm sfx:lab) ────────────────────────────
// The sound lab (roadmap #192): http://127.0.0.1:5190/ — every sound the game plays, the game's current synthesized one
// beside up to 20 ElevenLabs takes of it, to rate (1-5 stars), pick, or reject all of ("reroll": asks for 20 new ones).
// Ratings and picks are written to reports/sfx-lab/decisions.json as they are made, so a session can read them.
import { spawn } from 'node:child_process'
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SOUNDS, secondsFor } from './prompts.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const LAB = join(ROOT, 'reports', 'sfx-lab')
const REVIEW = join(ROOT, 'tools', 'sfx-review')
const PORT = Number(process.env.SFX_LAB_PORT ?? 5190)
mkdirSync(join(LAB, 'audio'), { recursive: true })
const read = (f, d) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : d)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.mp3': 'audio/mpeg', '.webm': 'audio/webm', '.css': 'text/css' }
const manifest = read(join(REVIEW, 'manifest.json'), { sounds: [] })

const state = () => {
  const takes = read(join(LAB, 'takes.json'), {})
  const decisions = read(join(LAB, 'decisions.json'), {})
  const sounds = manifest.sounds.filter(s => SOUNDS[s.id]).map(s => ({
    id: s.id, category: s.category, description: s.description, usedBy: s.usedBy, seconds: secondsFor(s.id),
    current: existsSync(join(REVIEW, 'out', 'audio', `${s.id}.webm`)) ? `/current/${s.id}.webm` : '',
    takes: Object.entries(takes[s.id] ?? {}).map(([file, t]) => ({ file, url: `/audio/${s.id}/${file}`, round: t.round, n: t.n, text: t.text })).sort((a, b) => a.round - b.round || a.n - b.n)
  }))
  return { sounds, decisions, job: jobStatus() }
}

let job = null
const jobStatus = () => (job ? { running: job.running, what: job.what, log: job.log.slice(-6) } : null)
const startJob = (what, args) => {
  if (job?.running) return false
  job = { running: true, what, log: [] }
  const p = spawn(process.execPath, [join(HERE, 'generate.mjs'), ...args], { cwd: ROOT, windowsHide: true })
  const eat = (b) => { for (const l of String(b).split('\n')) if (l.trim()) job.log.push(l.trim()) }
  p.stdout.on('data', eat); p.stderr.on('data', eat)
  p.on('close', () => { job.running = false })
  return true
}

const body = (req) => new Promise((res) => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => res(Buffer.concat(c).toString())) })
const json = (res, code, o) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)) }

const serve = (res, file) => {
  if (!existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); res.end('not found'); return }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' })
  createReadStream(file).pipe(res)
}
const inside = (root, p) => { const f = normalize(join(root, p)); return f.startsWith(root) ? f : null }

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  const p = decodeURIComponent(url.pathname)
  if (req.method === 'GET' && p === '/api/state') return json(res, 200, state())
  if (req.method === 'POST') {
    // Writes only from the lab's own page.
    if (req.headers['x-sfx-lab'] !== '1') return json(res, 403, { error: 'forbidden' })
    const b = JSON.parse((await body(req)) || '{}')
    if (p === '/api/decision') {
      const f = join(LAB, 'decisions.json')
      const d = read(f, {})
      d[b.id] = { ratings: b.ratings ?? {}, pick: b.pick ?? null, reroll: !!b.reroll, at: new Date().toISOString() }
      writeFileSync(f, JSON.stringify(d, null, 1))
      return json(res, 200, { ok: true })
    }
    if (p === '/api/reroll') return json(res, 200, { started: startJob('reroll', ['--rerolls', '--only', (b.ids ?? []).join(',')]) })
    if (p === '/api/generate') return json(res, 200, { started: startJob('generate', b.ids?.length ? ['--only', b.ids.join(',')] : []) })
    return json(res, 404, { error: 'no such call' })
  }
  if (p === '/' || p === '/index.html') return serve(res, join(HERE, 'index.html'))
  if (p.startsWith('/audio/')) { const f = inside(join(LAB, 'audio'), p.slice(7)); return f ? serve(res, f) : (res.writeHead(400), res.end()) }
  if (p.startsWith('/current/')) { const f = inside(join(REVIEW, 'out', 'audio'), p.slice(9)); return f ? serve(res, f) : (res.writeHead(400), res.end()) }
  res.writeHead(404); res.end('not found')
}).listen(PORT, '127.0.0.1', () => console.log(`Sound lab  http://127.0.0.1:${PORT}/`))
