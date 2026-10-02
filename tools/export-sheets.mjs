#!/usr/bin/env node
/**
 * Drive the art bench's "Export all sheets" in a private headless Chrome.
 *
 *   pnpm art:export                           # own dev server, own Chrome, then stops both
 *   pnpm art:export --only sheet-items-weapons,coin   # only these sheets (by stem or id)
 *   pnpm art:export http://127.0.0.1:2194     # against a dev server that is already up
 *
 * The bench (`/#/art-sheets`) writes into `art-sheets/` through the dev
 * server's own POST endpoint (`artSheetsExportPlugin` in vite.config.ts), so
 * this only has to open it, press the button and wait. Run it when a DRAWING
 * changed; `pnpm art:prompts` is enough for a reworded prompt.
 *
 * Everything it starts is its own and is stopped before it returns:
 *
 * · a dev server on a free port with `--strictPort` (a stale server from
 *   another project answering on a guessed port would export the wrong game —
 *   the served <title> is checked against index.html before anything else),
 *   with the leaderboard endpoint blanked and a dependency cache of its own;
 * · Chrome on a fresh `--user-data-dir`, never the shared debugging profile:
 *   that one belongs to whatever the user has open.
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const GIVEN = args.find((a) => a.startsWith('http'))
const onlyAt = args.indexOf('--only')
const ONLY = onlyAt >= 0 ? (args[onlyAt + 1] ?? '') : ''

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].find((p) => existsSync(p))
if (!CHROME) { console.error('No Chrome found.'); process.exit(1) }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const freePort = () => new Promise((ok, no) => {
  const s = createServer()
  s.once('error', no)
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => ok(port)) })
})
/** Stop a process WE started, with its children (Vite's esbuild, Chrome's helpers). */
const stop = (child) => {
  if (!child?.pid || child.exitCode !== null) return
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true })
  else try { child.kill() } catch { /* already gone */ }
}

const TITLE = /<title>([^<]*)<\/title>/i.exec(readFileSync(join(ROOT, 'index.html'), 'utf-8'))?.[1]?.trim() ?? ''

let vite = null
let chrome = null
let browser = null
let profile = null

try {
  // ── The dev server ──
  let base = GIVEN ? GIVEN.replace(/\/?#.*$/, '').replace(/\/$/, '') : null
  if (!base) {
    const port = await freePort()
    base = `http://127.0.0.1:${port}`
    let out = ''
    vite = spawn(process.execPath, [join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(port), '--strictPort', '--host', '127.0.0.1'], {
      cwd: ROOT,
      // `.env` holds the live leaderboard and its signing secret; nothing a
      // tool starts may reach it. The cache is this tool's own, so it never
      // re-optimises dependencies under a dev server somebody has open.
      env: { ...process.env, VITE_LEADERBOARD_URL: '', VITE_LEADERBOARD_SECRET: '', VITE_CACHE_DIR: 'node_modules/.vite-art-export' },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    })
    vite.stdout.on('data', (d) => { out += d })
    vite.stderr.on('data', (d) => { out += d })
    console.log(`dev server: ${base} (pid ${vite.pid})`)
    let up = false
    for (let i = 0; i < 120 && !up; i++) {
      if (vite.exitCode !== null) throw new Error(`the dev server exited (${vite.exitCode}):\n${out.trim()}`)
      try { up = (await fetch(`${base}/`)).ok } catch { /* not up yet */ }
      if (!up) await sleep(500)
    }
    if (!up) throw new Error(`the dev server did not answer at ${base}:\n${out.trim()}`)
  }
  // Is it THIS game? A stale server from another project answers happily.
  const served = /<title>([^<]*)<\/title>/i.exec(await (await fetch(`${base}/`)).text())?.[1]?.trim() ?? ''
  if (!TITLE || served !== TITLE) throw new Error(`${base} serves "${served}", not "${TITLE}" — that is not this project's dev server`)
  console.log(`title: ${served}`)

  // ── Chrome ──
  const debugPort = await freePort()
  profile = mkdtempSync(join(tmpdir(), 'bcross-art-'))
  chrome = spawn(CHROME, [
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    // Without these `requestAnimationFrame` and timers throttle in a window
    // nobody is looking at, and a page that waits on them stalls.
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--window-size=1400,1000',
    'about:blank'
  ], { stdio: 'ignore', windowsHide: true })
  let cdp = false
  for (let i = 0; i < 60 && !cdp; i++) {
    try { cdp = (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).ok } catch { /* not up yet */ }
    if (!cdp) await sleep(250)
  }
  if (!cdp) throw new Error('Chrome did not open its debugging port')
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${debugPort}`)
  const context = browser.contexts()[0] ?? await browser.newContext()
  // No live reload under the exporter. Vite reloads the page on any `src/`
  // edit and on a file added to `public/`, and with another session editing
  // the tree that happens mid-export: the reloaded bench shows an empty
  // status and the run looks like a success that wrote nothing. The page's
  // HMR socket is answered here and never reaches the server.
  await context.routeWebSocket(/.*/, () => {})
  const page = await context.newPage()
  page.on('pageerror', (e) => console.error('  page error:', e.message))

  const url = `${base}/#/art-sheets${ONLY ? `?only=${encodeURIComponent(ONLY)}` : ''}`
  // The splash sits in front of every route; the bench mounts behind it and
  // says when its sheets are drawn. A first run on an empty dependency cache
  // can need one reload of its own, which the blocked socket cannot deliver.
  let ready = false
  for (let attempt = 0; attempt < 3 && !ready; attempt++) {
    if (attempt === 0) await page.goto(url, { waitUntil: 'load' })
    else { console.log('  · not ready, reloading'); await page.reload({ waitUntil: 'load' }) }
    const started = Date.now()
    while (Date.now() - started < 60_000 && !ready) {
      const st = await page.evaluate(() => ({
        ready: !!document.querySelector('.art-sheets[data-ready="1"]'),
        status: document.querySelector('.art-sheets .bar .status')?.textContent?.trim() ?? ''
      }))
      if (/FAILED/.test(st.status)) throw new Error(`the bench could not draw its sheets — ${st.status}`)
      ready = st.ready
      if (!ready) await sleep(500)
    }
  }
  if (!ready) throw new Error('the bench never became ready — is /#/art-sheets registered (dev only)?')
  const heading = await page.evaluate(() => document.querySelector('.art-sheets h1')?.textContent ?? '')
  if (!heading.includes('Art sheets')) throw new Error('not the art bench')
  console.log(`page: ${await page.title()} / ${heading} — ${await page.evaluate(() => document.querySelectorAll('.art-sheets .sheet').length)} sheets drawn`)

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.art-sheets .bar button')].find((x) => /Export all/i.test(x.textContent ?? ''))
    if (!b) throw new Error('no export button')
    b.click()
  })

  // Poll the STATUS string, not the button re-enabling: a page that reloaded
  // mid-export resets `busy` and looks like a success having written nothing.
  let last = ''
  let moved = Date.now()
  for (;;) {
    await sleep(400)
    const status = await page.evaluate(() => document.querySelector('.art-sheets .bar .status')?.textContent?.trim() ?? '')
    if (status && status !== last) { console.log('  ·', status); last = status; moved = Date.now() }
    if (/^wrote /.test(status)) break
    if (/FAILED/.test(status)) throw new Error(status)
    if (Date.now() - moved > 180_000) throw new Error(`no progress for 3 minutes (last: "${last}")`)
  }
  console.log('DONE:', last)
} catch (err) {
  console.error('ERROR:', err.message)
  process.exitCode = 1
} finally {
  try { await browser?.close() } catch { /* closed */ }
  stop(chrome)
  stop(vite)
  await sleep(300)
  if (profile) try { rmSync(profile, { recursive: true, force: true }) } catch { /* locked */ }
}

// The paint status is a fact about the filesystem, so the bench cannot write
// it. Running the headless route here also proves the two routes agree: every
// prompt document must come back "unchanged".
if (!process.exitCode) {
  const r = spawnSync(process.execPath, ['--import', './tools/ts-resolve.mjs', 'tools/art-prompts.mjs'], { cwd: ROOT, stdio: 'inherit', windowsHide: true })
  if (r.status) process.exitCode = r.status
}
