#!/usr/bin/env node
// ─── Frozen-frame A/B: draw calls, triangles and pixels of two builds ───────
//
//   node scripts/perf-still.mjs <portA> <portB> <node> [low|full] [w h]
//
// Two dev servers (A: the build before a change, B: after; a `git worktree`
// serves the old one) are each asked for the same place, built by the preview
// API (`?preview=1`), the world held, randomness pinned, and the camera put on
// the same spots: the start, every pack and a few townsfolk. For each spot it
// prints the draw calls and triangles of one frame in both builds and how many
// pixels differ. A render optimisation that changes no pixel and draws less
// is proven by this alone; frame TIME on this machine (SwiftShader, shared
// CPU) needs the interleaved probe runs described in `PERF-LEDGER.md`.
//
// Each run starts its own headless Chrome on a private profile, checks the
// served <title> is the game's, and writes the B frames and a diff (A darkened,
// differing pixels red) to the system temp folder (`bc-perf-still/`).

import { createRequire } from 'node:module'
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const { chromium } = require('playwright-core')
const sharp = require('sharp')

const [pa, pb, place, q = 'low', W = '390', H = '780'] = process.argv.slice(2)
if (!pa || !pb || !place) {
  console.log('usage: node scripts/perf-still.mjs <portA> <portB> <node> [low|full] [w h]')
  process.exit(1)
}
const OUT = join(tmpdir(), 'bc-perf-still')
mkdirSync(OUT, { recursive: true })
const w = Number(W)
const h = Number(H)
const touch = w < h

const grab = async (port) => {
  const profile = mkdtempSync(join(tmpdir(), 'bc-still-'))
  const ctx = await chromium.launchPersistentContext(profile, {
    channel: 'chrome', headless: true, viewport: { width: w, height: h }, deviceScaleFactor: 1,
    hasTouch: touch, isMobile: touch,
    userAgent: touch ? 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36' : undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio']
  })
  try {
    const page = ctx.pages()[0] ?? await ctx.newPage()
    // Other work in the tree must not reload the page mid-run.
    await page.routeWebSocket(/.*/, () => {})
    await page.goto(`http://127.0.0.1:${port}/?preview=1&scenery=${q}`, { waitUntil: 'load', timeout: 180000 })
    const title = await page.title()
    if (title !== 'Battlecross') throw new Error(`port ${port} serves "${title}", not the game`)
    await page.waitForFunction(() => !!window.__preview && window.__game?.app.mode, null, { timeout: 180000 })
    return await page.evaluate(async (place) => {
      Math.random = () => 0.9999
      const p = window.__preview
      p.hold(true)
      p.hero({ level: 19, cls: 'aegis', potions: 3 })
      p.cut(await p.build(place))
      const { getRenderer } = await import('/src/game/engine/renderer.ts')
      const r = getRenderer()
      const gl = r.getContext()
      const z = window.__game.zone()
      const spots = [
        [z.sim.hero.unit.x, z.sim.hero.unit.z],
        ...z.plan.packs.map(k => [k.x, k.z + 3.5]),
        ...z.sim.units.filter(u => u.rank === 'npc').slice(0, 6).map(u => [u.x, u.z + 1.5])
      ]
      const out = []
      for (const [x, zz] of spots) {
        const u = z.sim.hero.unit
        u.x = u.px = x
        u.z = u.pz = zz
        z.cam.snap()
        for (let i = 0; i < 3; i++) z.render(0, 0)
        r.info.reset()
        z.render(0, 0)
        const calls = r.info.render.calls
        const tris = r.info.render.triangles
        const bw = gl.drawingBufferWidth
        const bh = gl.drawingBufferHeight
        const buf = new Uint8Array(bw * bh * 4)
        gl.readPixels(0, 0, bw, bh, gl.RGBA, gl.UNSIGNED_BYTE, buf)
        let s = ''
        for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode.apply(null, buf.subarray(i, i + 32768))
        out.push({ w: bw, h: bh, b64: btoa(s), calls, tris })
      }
      return out
    }, place)
  } finally {
    await ctx.close()
    try { rmSync(profile, { recursive: true, force: true }) } catch { /* locked: the OS cleans it */ }
  }
}

const A = await grab(pa)
const B = await grab(pb)
let differ = 0
for (let k = 0; k < Math.min(A.length, B.length); k++) {
  const a = Buffer.from(A[k].b64, 'base64')
  const b = Buffer.from(B[k].b64, 'base64')
  const { w: bw, h: bh } = A[k]
  const diff = Buffer.alloc(bw * bh * 4)
  const img = Buffer.alloc(bw * bh * 4)
  let n = 0
  for (let i = 0; i < a.length; i += 4) {
    const d = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])
    // GL rows run bottom-up.
    const px = (i / 4) % bw
    const py = bh - 1 - Math.floor(i / 4 / bw)
    const o = (py * bw + px) * 4
    if (d > 24) { n++; diff[o] = 255 } else diff[o] = diff[o + 1] = diff[o + 2] = a[i] >> 2
    diff[o + 3] = 255
    b.copy(img, o, i, i + 4)
  }
  differ += n
  await sharp(diff, { raw: { width: bw, height: bh, channels: 4 } }).png().toFile(join(OUT, `diff-${place}-${q}-${k}.png`))
  await sharp(img, { raw: { width: bw, height: bh, channels: 4 } }).png().toFile(join(OUT, `still-${place}-${q}-${k}.png`))
  console.log(`${place} ${q} spot ${k}: calls ${A[k].calls} -> ${B[k].calls}   tris ${A[k].tris} -> ${B[k].tris}   ${n} px differ (${(n / (bw * bh) * 100).toFixed(3)} %)`)
}
process.exit(differ ? 2 : 0)
