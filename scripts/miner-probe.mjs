#!/usr/bin/env node
/** The first level on a RUNNING dev server: the move hint with the WASD keys, the miner at the ore rock, and his talk. Frames to reports/miner/. */
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const URL = process.argv[2] ?? 'http://localhost:2194/'
const OUT = resolve(root, 'reports/miner'); mkdirSync(OUT, { recursive: true })
const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-miner-')), {
  channel: 'chrome', headless: false, viewport: { width: 1100, height: 700 }, locale: 'en-US', args: ['--mute-audio']
})
await ctx.routeWebSocket(/.*/, () => {})
const page = ctx.pages()[0] ?? await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(String(e.stack ?? e).slice(0, 400)))
await page.goto(URL, { waitUntil: 'load', timeout: 600000 })
await page.waitForFunction(() => window.__game && window.__game.app.mode && window.__game.hud.phase !== 'boot', null, { timeout: 600000 })
await page.waitForSelector('.hero-choice .hero-choice__card', { timeout: 120000 })
await page.waitForTimeout(800)
await page.locator('.hero-choice [data-hero="m"]').click({ force: true })
for (let i = 0; i < 400; i++) {
  const s = await page.evaluate(() => ({ film: !!document.querySelector('.intro'), zone: window.__game.zone()?.setup?.zone }))
  if (!s.film && s.zone === 'plains') break
  await page.waitForTimeout(250)
}
await page.waitForTimeout(6000)
await page.screenshot({ path: join(OUT, 'm0-start-hint.png') })
console.log('hints', JSON.stringify(await page.evaluate(() => window.__game.hud.hints.map(h => h.id))))
const info = await page.evaluate(() => {
  const sim = window.__game.zone().sim
  const m = sim.units.find(u => u.npc === 'plainsMiner')
  return { hint: sim.puzzle?.hint ?? null, ores: sim.ores.map(o => [o.x, o.z, o.sx, o.sz, o.spent]), miner: m && [m.x, m.z, m.action?.id, m.anim] }
})
console.log('miner', JSON.stringify(info))
if (info.miner) {
  await page.evaluate(() => {
    const z = window.__game.zone(); const sim = z.sim
    const m = sim.units.find(u => u.npc === 'plainsMiner'); const h = sim.hero.unit
    const hint = z.plan.puzzle?.hint
    h.x = h.px = hint ? (hint.x + m.x) / 2 : m.x + 1.6; h.z = h.pz = hint ? (hint.z + m.z) / 2 : m.z + 2.4; z.cam.snap()
  })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: join(OUT, 'm1-miner.png') })
  await page.evaluate(() => window.__game.talkTo('plainsMiner'))
  await page.waitForTimeout(3500)
  await page.screenshot({ path: join(OUT, 'm2-talk.png') })
  console.log('talk', await page.evaluate(() => window.__game.flow.talk))
}
console.log('errors', JSON.stringify([...new Set(errors)]))
await ctx.close().catch(() => {}); process.exit(0)
