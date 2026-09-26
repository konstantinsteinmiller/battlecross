#!/usr/bin/env node
// ─── Poki store thumbnail, rendered from the real rig ───────────────────────
//
//   node scripts/render-thumbnail.mjs                 # all variants, the pick → store-art/poki/
//   node scripts/render-thumbnail.mjs --port 5173     # reuse a running `pnpm dev` (else starts its own)
//   node scripts/render-thumbnail.mjs --only lab      # just these variants (comma list)
//   node scripts/render-thumbnail.mjs --pick sector   # which variant becomes thumbnail-*.png
//   node scripts/render-thumbnail.mjs --chrome <path> # Chrome executable (or CHROME_PATH)
//
// Each variant is the dev-only composition view `#/models?m=thumb&v=<id>`
// (src/views/ModelLab.vue): Flux in his default look, a charge in the arm
// cannon, a backdrop from the game's own scene builders, and nothing on a
// clock, so a re-render is the same picture. It is rendered at 628 CSS px and
// deviceScaleFactor 4 (2512 px), read straight off the WebGL canvas (so no
// DOM overlay can end up in it), and scaled DOWN with Lanczos: the 1256
// master is 2x2 supersampled and the 628 export 4x4, which is what makes the
// inverted-hull outlines crisp (the renderer has no MSAA at this DPR).
//
// Writes, into store-art/poki/ (a repo folder that never ships: only public/
// is copied into dist):
//   thumbnail-1256.png          the master (lossless)
//   thumbnail-628.png / .jpg    the upload size; the jpg only when it is smaller
//                               AND scores SSIM ≥ 0.99 against the png
//   preview-200.png, -128.png   the pick at Poki tile sizes, the readability check
//   variants/<id>-628.png       every variant, and variants/sheet.png side by side
//
// Poki's rules it checks mechanically: square, the size, and nothing near
// Poki's playground colour #83FFE7 (fails on any pixel within CIE76 ΔE 10;
// reports the share within ΔE 20). It also fails a frame without the amber
// plasma in it, i.e. one where Flux and his charge never rendered. What it
// cannot check: no text, one clear subject, reads at 128 px. Look at
// preview-128.png before uploading.
//
// Its own Chrome, on a fresh temporary profile (never the MCP browser's), and
// the pointer lock is stubbed: automation must never capture the real mouse.
// A server it starts is its own child, killed with its whole tree at the end.

import { createRequire } from 'node:module'
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:net'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright-core')
const sharp = require('sharp')
const { ssim } = require('ssim.js')

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'store-art', 'poki')
const argv = process.argv.slice(2)
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d }
const VARIANTS = (arg('only', 'lab,sector,full')).split(',').map(s => s.trim()).filter(Boolean)
const PICK = arg('pick', 'sector')
const CHROME = arg('chrome', process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe')
const CSS = 628
const DSF = 4
const TITLE = 'Mega Adventure'

// ─── Dev server: reuse one, or start our own on a free port ─────────────────

const freePort = () => new Promise((res, rej) => {
  const s = createServer()
  s.once('error', rej)
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) })
})

/**
 * The port answers, and with THIS game (a stale server from another project
 * answers too). Vite may bind `localhost` to ::1 only, and Node's fetch can
 * give up on `localhost` under load, so each address is tried in turn.
 */
const titleAt = async (port) => {
  for (const host of ['localhost', '[::1]', '127.0.0.1']) {
    try {
      const r = await fetch(`http://${host}:${port}/`, { signal: AbortSignal.timeout(15000) })
      return (await r.text()).match(/<title>([^<]*)<\/title>/)?.[1] ?? null
    } catch { /* next address */ }
  }
  return null
}

let server = null
const stopServer = () => {
  if (!server || server.exitCode !== null) return
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' })
  else { try { process.kill(-server.pid, 'SIGTERM') } catch { server.kill('SIGTERM') } }
}
process.on('exit', stopServer)
process.on('SIGINT', () => { stopServer(); process.exit(130) })

let port = Number(arg('port', 0))
if (port) {
  const t = await titleAt(port)
  if (t !== TITLE) throw new Error(`localhost:${port} serves "${t}", not ${TITLE}: start \`pnpm dev\` or drop --port`)
} else {
  port = await freePort()
  const vite = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
  server = spawn(process.execPath, [vite, '--port', String(port), '--strictPort'], {
    cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
  })
  let log = ''
  server.stdout.on('data', (d) => { log += d })
  server.stderr.on('data', (d) => { log += d })
  const t0 = Date.now()
  let t = null
  while (Date.now() - t0 < 180000 && server.exitCode === null) {
    t = await titleAt(port)
    if (t) break
    await new Promise(r => setTimeout(r, 1000))
  }
  if (t !== TITLE) throw new Error(`dev server on ${port} did not come up as ${TITLE} (got "${t}")\n${log}`)
  console.log(`dev server: localhost:${port} (own, pid ${server.pid})`)
}

// ─── Colour check: Poki's playground mint must not appear ───────────────────

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const toLab = (r, g, b) => {
  const R = lin(r); const G = lin(g); const B = lin(b)
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116)
  const fx = f((0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047)
  const fy = f(0.2126 * R + 0.7152 * G + 0.0722 * B)
  const fz = f((0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}
const MINT = toLab(0x83, 0xff, 0xe7)
/** Near-mint shares, the closest pixel, and how much of the frame is the amber plasma (the charge, the eyes). */
const colourReport = async (buf) => {
  const { data } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  let near10 = 0; let near20 = 0; let closest = Infinity; let amber = 0
  const n = data.length / 3
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i]; const g = data[i + 1]; const b = data[i + 2]
    const L = toLab(r, g, b)
    const d = Math.hypot(L[0] - MINT[0], L[1] - MINT[1], L[2] - MINT[2])
    if (d < 10) near10++
    if (d < 20) near20++
    if (d < closest) closest = d
    // Amber: bright, saturated, red > green > blue with green about half-way (hue ≈ 25–50°)
    const max = Math.max(r, g, b); const min = Math.min(r, g, b)
    if (max > 200 && (max - min) / max > 0.45 && r === max && g > b && (g - b) / (r - b) > 0.35 && (g - b) / (r - b) < 0.8) amber++
  }
  return { near10: near10 / n, near20: near20 / n, closest, amber: amber / n }
}

// ─── Render ─────────────────────────────────────────────────────────────────

const shoot = async (id) => {
  const profile = mkdtempSync(join(tmpdir(), 'mega-thumb-'))
  const ctx = await chromium.launchPersistentContext(profile, {
    executablePath: CHROME,
    headless: true,
    viewport: { width: CSS, height: CSS },
    deviceScaleFactor: DSF,
    args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--mute-audio']
  })
  try {
    await ctx.addInitScript(() => {
      // Never let automation take a real pointer lock
      Element.prototype.requestPointerLock = function () { return Promise.resolve() }
    })
    const page = ctx.pages()[0] ?? await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(`http://localhost:${port}/#/models?m=thumb&v=${id}`, { waitUntil: 'load', timeout: 180000 })
    if (await page.title() !== TITLE) throw new Error(`wrong page title on ${port}`)
    await page.waitForFunction(() => window.__lab?.thumbReady === true, null, { timeout: 240000 })
    await page.waitForTimeout(1000)
    // Read the canvas itself, not a page screenshot: the boot loader (or any
    // other overlay) may still be up over it in a cold profile
    const url = await page.evaluate(() => window.__lab.thumbPng())
    if (errors.length) throw new Error(`page errors in v=${id}: ${errors.join(' | ')}`)
    return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')
  } finally {
    await ctx.close()
    rmSync(profile, { recursive: true, force: true })
  }
}

const down = (buf, size) => sharp(buf).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 }).toBuffer()

const rgba = async (buf) => {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), width: info.width, height: info.height }
}

/** Smallest mozjpeg that still scores SSIM ≥ 0.99 against the png; null when none beats the png's size. */
const bestJpeg = async (png) => {
  const ref = await rgba(png)
  let best = null
  for (const q of [96, 94, 92, 90, 88, 86, 84, 82, 80]) {
    const jpg = await sharp(png).jpeg({ quality: q, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer()
    const s = ssim(ref, await rgba(jpg)).mssim
    if (s < 0.99) break
    best = { jpg, q, ssim: s }
  }
  return best && best.jpg.length < png.length ? best : null
}

mkdirSync(join(OUT, 'variants'), { recursive: true })
const shots = {}
const kb = (b) => `${(b.length / 1024).toFixed(0)} KB`
try {
  for (const id of VARIANTS) {
    const raw = await shoot(id)
    const meta = await sharp(raw).metadata()
    if (meta.width !== CSS * DSF || meta.height !== CSS * DSF) throw new Error(`v=${id}: got ${meta.width}x${meta.height}, want ${CSS * DSF} square`)
    const v628 = await down(raw, 628)
    const m = await colourReport(v628)
    if (m.amber < 0.003) throw new Error(`v=${id}: no amber plasma in the frame (${(m.amber * 100).toFixed(2)}%): Flux and his charge did not render`)
    if (m.near10 > 0) throw new Error(`v=${id}: ${(m.near10 * 100).toFixed(2)}% of pixels within ΔE 10 of #83FFE7 (Poki's playground)`)
    writeFileSync(join(OUT, 'variants', `${id}-628.png`), v628)
    shots[id] = { raw, v628 }
    console.log(`v=${id}: 628 ${kb(v628)} · near #83FFE7: ΔE<20 ${(m.near20 * 100).toFixed(2)}%, closest ΔE ${m.closest.toFixed(1)} · amber ${(m.amber * 100).toFixed(1)}%`)
  }

  const ids = Object.keys(shots)
  if (ids.length > 1) {
    const cell = 400
    const tiles = await Promise.all(ids.map(id => sharp(shots[id].v628).resize(cell, cell).png().toBuffer()))
    await sharp({ create: { width: ids.length * cell + (ids.length - 1) * 12, height: cell, channels: 3, background: '#808080' } })
      .composite(tiles.map((input, i) => ({ input, left: i * (cell + 12), top: 0 })))
      .png().toFile(join(OUT, 'variants', 'sheet.png'))
  }

  const pick = shots[PICK]
  if (pick) {
    const master = await down(pick.raw, 1256)
    writeFileSync(join(OUT, 'thumbnail-1256.png'), master)
    writeFileSync(join(OUT, 'thumbnail-628.png'), pick.v628)
    const jpg = await bestJpeg(pick.v628)
    if (jpg) writeFileSync(join(OUT, 'thumbnail-628.jpg'), jpg.jpg)
    else rmSync(join(OUT, 'thumbnail-628.jpg'), { force: true })
    for (const s of [200, 128]) writeFileSync(join(OUT, `preview-${s}.png`), await down(pick.raw, s))
    console.log(`pick v=${PICK}: thumbnail-1256.png ${kb(master)} · thumbnail-628.png ${kb(pick.v628)}` +
      (jpg ? ` · thumbnail-628.jpg ${kb(jpg.jpg)} (q${jpg.q}, SSIM ${jpg.ssim.toFixed(4)})` : ' · no jpg (none smaller at SSIM ≥ 0.99)'))
    for (const f of ['thumbnail-1256.png', 'thumbnail-628.png', 'preview-200.png', 'preview-128.png']) statSync(join(OUT, f))
  } else if (!arg('only')) {
    throw new Error(`--pick ${PICK} is not one of the rendered variants (${ids.join(', ')})`)
  }
} finally {
  stopServer()
}
