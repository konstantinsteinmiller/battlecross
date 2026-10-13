#!/usr/bin/env node
// ─── node tools/sfx-review/screenshots.mjs <dev-server-url> [--only ctx,ctx] ──
//
// The sound review's pictures (roadmap #118): one 400x225 shot per situation
// a sound plays in, taken from the running game through the DEV preview seam
// (`window.__preview`, `src/game/previewFeed.ts`). Per class: a fight in the
// woods with the reference player casting, shot just after the first cast of
// one of the class's skills. Plus a boss fight, the colosseum, and a town.
//
// Start a dev server first (`npx vite --port 58xx --strictPort`, with
// VITE_LEADERBOARD_URL= and VITE_LEADERBOARD_SECRET= blanked) and pass its URL.
// Writes out/shots/<context>.jpg.
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { saveFixture, seedSaveScript } from '../preview-video/scenarios/_drive.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const OUT = join(HERE, 'out', 'shots')
mkdirSync(OUT, { recursive: true })
const req = createRequire(join(ROOT, 'package.json'))
const { chromium } = req('playwright-core')
const FFMPEG = req('ffmpeg-static')

const base = process.argv[2]
if (!base) { console.error('usage: node tools/sfx-review/screenshots.mjs <url> [--only ctx,ctx]'); process.exit(1) }
const oi = process.argv.indexOf('--only')
const only = oi > 0 ? process.argv[oi + 1].split(',') : null

const CLASSES = ['aegis', 'shadow', 'pyro', 'sovereign', 'chrono', 'blood', 'aether', 'geo', 'windrunner', 'frostwarden', 'lightbringer', 'beastcaller', 'elementalist', 'soulwarden', 'ironmonk', 'bard']
/** context -> how to stage it */
const PLAN = [
  ...CLASSES.map(cls => ({ ctx: `class-${cls}`, cls, level: 16, node: 'woods', pack: 1, waitCast: true })),
  { ctx: 'boss', cls: 'aegis', level: 6, node: 'plains', pack: 'finale', wait: 5000 },
  { ctx: 'arena', cls: 'aegis', level: 14, node: 'arena', wait: 6000, noStage: true },
  { ctx: 'town', cls: 'aegis', level: 14, node: 'sunford', wait: 1500, noStage: true, noBot: true }
].filter(p => !only || only.includes(p.ctx))

const url = `${base.replace(/\/$/, '')}/?preview=1&darkguard=off&device=normal&scenery=full`
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio'] })
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })).newPage()
await page.addInitScript(seedSaveScript, saveFixture())
await page.goto(url, { waitUntil: 'domcontentloaded' })
const title = await page.title()
if (!/battlecross/i.test(title)) { console.error(`not Battlecross at ${url}: "${title}"`); await browser.close(); process.exit(1) }
await page.waitForFunction(() => !!window.__preview, null, { timeout: 120_000 })
await page.waitForFunction(() => {
  const s = document.getElementById('static-splash')
  return (!s || s.classList.contains('hidden')) && !document.querySelector('.splash-backdrop')
}, null, { timeout: 90_000 })

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
// The first cut after boot does not take (the boot's own place is still entering): warm up with one.
await page.evaluate(async () => { const w = window.__preview; w.hold(true); w.cut(await w.build('woods')) })
await sleep(1500)
for (const p of PLAN) {
  try {
    await page.evaluate(async (p) => {
      const w = window.__preview
      w.hold(true)
      w.bot(false)
      w.hero({ level: p.level, cls: p.cls, potions: 5 })
      const shot = await w.build(p.node)
      w.cut(shot)
      if (!p.noStage) w.stage({ pack: p.pack, gap: 4 })
    }, p)
    const t0 = await page.evaluate(() => performance.now())
    await page.evaluate((p) => { const w = window.__preview; if (!p.noBot) w.bot(true); w.hold(false) }, p)
    if (p.waitCast) {
      // The first skill cast after the cut (a cast/swingHeavy logged by the sound tap), then let it land.
      const end = Date.now() + 20_000
      let seen = false
      while (!seen && Date.now() < end) {
        await sleep(250)
        seen = await page.evaluate((t0) => window.__preview.sfxLog().some(s => s.t >= t0 && /^(cast[A-Z]|swingHeavy)/.test(s.name)), t0)
      }
      await sleep(seen ? 450 : 0)
      if (!seen) console.warn(`  ${p.ctx}: no cast seen in 20 s, shot anyway`)
    } else await sleep(p.wait)
    const png = join(OUT, `${p.ctx}.png`)
    await page.screenshot({ path: png })
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', png, '-vf', 'scale=400:225:flags=lanczos', '-q:v', '3', join(OUT, `${p.ctx}.jpg`)])
    if (!process.argv.includes('--keep-png')) rmSync(png)
    console.log(`  ${p.ctx}`)
  } catch (e) {
    console.warn(`  ${p.ctx} failed: ${String(e).slice(0, 200)}`)
  }
}
await browser.close()
// The generic fight: the Aegis Knight's.
if (existsSync(join(OUT, 'class-aegis.jpg'))) copyFileSync(join(OUT, 'class-aegis.jpg'), join(OUT, 'fight.jpg'))
