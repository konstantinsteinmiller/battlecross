#!/usr/bin/env node
/**
 * The intro on an ALREADY RUNNING dev server: a new save picks its hero, then a frame every 1.2 s of wall time until the
 * film has handed over to the opening level (the film's own clock is not read: a dev server's HMR gives the page's modules
 * query-stringed URLs, so a second import would be a second copy of them). Frames to reports/intro/reel/.
 *   node scripts/intro-reel.mjs [--url http://localhost:2194/]
 */
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d }
const URL = arg('url', 'http://localhost:2194/')
const OUT = resolve(root, 'reports/intro/reel')
mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) rmSync(join(OUT, f))
const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-reel-')), {
  channel: 'chrome', headless: true, viewport: { width: 1000, height: 600 }, locale: 'en-US',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio']
})
await ctx.routeWebSocket(/.*/, () => {})
const page = ctx.pages()[0] ?? await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(String(e.stack ?? e).slice(0, 500)))
await page.goto(URL, { waitUntil: 'load', timeout: 600000 })
await page.waitForFunction(() => window.__game && window.__game.app.mode && window.__game.hud.phase !== 'boot', null, { timeout: 600000 })
await page.waitForSelector('.hero-choice .hero-choice__card', { timeout: 120000 })
await page.waitForTimeout(1500)
await page.locator('.hero-choice [data-hero="m"]').click()
let n = 0
let sawFilm = false
const t0 = Date.now()
for (;;) {
  const s = await page.evaluate(() => ({ film: !!document.querySelector('.intro'), zone: window.__game.zone()?.setup?.zone, later: document.querySelector('.intro__later')?.textContent?.trim() ?? '' })).catch(() => ({}))
  await page.screenshot({ path: join(OUT, `${String(n++).padStart(3, '0')}.png`) })
  if (s.film) sawFilm = true
  if (n % 5 === 0) console.log(n, Math.round((Date.now() - t0) / 1000) + 's', JSON.stringify(s))
  if (sawFilm && !s.film && s.zone === 'plains') { console.log('handed over to the opening level after', n, 'frames'); break }
  if (Date.now() - t0 > 180000) { console.log('timeout'); break }
  await page.waitForTimeout(Number(arg('every', 1000)))
}
await page.waitForTimeout(2000)
await page.screenshot({ path: join(OUT, 'zz-after.png') })
console.log('page errors:', JSON.stringify([...new Set(errors)], null, 1))
await ctx.close().catch(() => {})
process.exit(0)
