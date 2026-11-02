#!/usr/bin/env node
/**
 * The film of #183, shot in a real browser: a new save picks its hero, the intro plays, and a frame is taken at
 * chosen seconds of the film's own clock.
 *   node scripts/intro-shots.mjs [--only phone|desktop] [--out reports/intro]
 */
import { spawn, execSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d }
const PORT = Number(arg('port', 5417))
const ONLY = arg('only', '')
const OUT = resolve(root, arg('out', 'reports/intro'))
const URL = `http://localhost:${PORT}/`
const PHONE_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
const DEVICES = [
  { id: 'desktop', w: 1280, h: 720, touch: false },
  { id: 'phone', w: 390, h: 844, touch: true }
].filter(d => !ONLY || d.id === ONLY)
const AT = [0.3, 1.5, 2.6, 3.8, 5.0, 6.6, 8.2, 9.2, 10.8, 11.6]
const titleAt = async () => { try { return /<title>([^<]*)<\/title>/.exec(await (await fetch(URL)).text())?.[1] ?? '' } catch { return null } }
let server = null
const stopServer = () => { if (server?.pid) try { execSync(`taskkill /PID ${server.pid} /T /F`, { stdio: 'ignore', windowsHide: true }) } catch { /* gone */ } }
mkdirSync(OUT, { recursive: true })
const report = []
try {
  server = spawn('npx.cmd', ['vite', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore', shell: true, windowsHide: true })
  for (let i = 0; i < 240; i++) { await new Promise(r => setTimeout(r, 500)); if ((await titleAt()) === 'Battlecross') break }
  for (const dev of DEVICES) {
    const dir = join(OUT, dev.id); mkdirSync(dir, { recursive: true })
    const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-intro-')), {
      channel: 'chrome', headless: true, viewport: { width: dev.w, height: dev.h }, hasTouch: dev.touch, isMobile: dev.touch, locale: 'en-US',
      userAgent: dev.touch ? PHONE_UA : undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio']
    })
    await ctx.routeWebSocket(/.*/, () => {})
    const page = ctx.pages()[0] ?? await ctx.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(String(e).slice(0, 240)))
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
    await page.goto(URL, { waitUntil: 'load', timeout: 900000 })
    await page.waitForFunction(() => window.__game && window.__game.app.mode && window.__game.hud.phase !== 'boot', null, { timeout: 600000 })
    await page.waitForFunction(() => !document.querySelector('.splash-backdrop') || getComputedStyle(document.querySelector('.splash-backdrop')).pointerEvents === 'none', null, { timeout: 30000 })
    await page.waitForSelector('.hero-choice .hero-choice__card', { timeout: 30000 })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: join(dir, '00-choice.png') })
    const card = page.locator('.hero-choice [data-hero="m"]')
    const r = await card.boundingBox()
    if (dev.touch) await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); else await card.click()
    // The film starts: a frame at each second of its own clock.
    const t0 = Date.now()
    const frames = []
    for (const at of AT) {
      await page.waitForFunction(async (at) => { const m = await import('/src/game/intro/runner.ts'); return m.introView.t >= at || !document.querySelector('.intro') && m.introView.t > 0 }, at, { timeout: 120000, polling: 100 }).catch(() => {})
      const info = await page.evaluate(async () => { const m = await import('/src/game/intro/runner.ts'); return { t: +m.introView.t.toFixed(2), veil: +m.introView.veil.toFixed(2), label: +m.introView.label.toFixed(2), on: !!document.querySelector('.intro') } })
      await page.screenshot({ path: join(dir, `${String(frames.length + 1).padStart(2, '0')}-t${String(at).replace('.', '_')}.png`) })
      frames.push({ at, ...info })
      console.log(dev.id, at, JSON.stringify(info))
    }
    await page.waitForTimeout(2500)
    const after = await page.evaluate(() => ({ intro: !!document.querySelector('.intro'), choice: !!document.querySelector('.hero-choice'), screen: window.__game.flow.screen, seen: window.__game.profile.tips.introSeen === true, gender: window.__game.profile.hero.gender }))
    await page.screenshot({ path: join(dir, '99-after.png') })
    console.log(dev.id, 'after', JSON.stringify(after), 'errors', errors.length)
    report.push({ device: dev.id, frames, after, errors: [...new Set(errors)].slice(0, 10), seconds: +((Date.now() - t0) / 1000).toFixed(1) })
    await ctx.close().catch(() => {})
  }
} finally { stopServer() }
writeFileSync(join(OUT, 'intro.json'), JSON.stringify(report, null, 2))
process.exit(0)
