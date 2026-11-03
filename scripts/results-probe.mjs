#!/usr/bin/env node
/** The result screen on a phone on its side (844x390 by default) on a RUNNING dev server, with loot, a level-up and the purse offer. */
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const URL = process.argv[2] ?? 'http://localhost:2194/'
const W = Number(process.argv[3] ?? 844), H = Number(process.argv[4] ?? 390)
const OUT = resolve(root, 'reports/results'); mkdirSync(OUT, { recursive: true })
const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-res-')), {
  channel: 'chrome', headless: false, viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: 'en-US',
  args: ['--mute-audio']
})
await ctx.routeWebSocket(/.*/, () => {})
const page = ctx.pages()[0] ?? await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(String(e.stack ?? e).slice(0, 300)))
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
await page.waitForTimeout(1500)
await page.evaluate(async () => {
  const g = window.__game
  const { ITEMS } = await import('/src/game/data/items.ts')
  const ids = ITEMS.filter(i => i.tier >= 2).slice(0, 3).map(i => i.id)
  g.flow.modal = 'results'
  g.flow.results = {
    outcome: 'victory', node: 'plains', xp: 120, gold: 85, goldLost: 0, kills: 14, items: ids.map(id => ({ id, added: true, gold: 0 })), unlocked: [],
    levelBefore: 1, levelAfter: 2, firstClear: true, seconds: 190, waves: 0, chests: { opened: 2, total: 3 },
    mastery: { bosses: 1, bossesTotal: 1, pct: 80, bestBefore: 0 }
  }
})
await page.waitForTimeout(2000)
await page.screenshot({ path: join(OUT, `results-${W}x${H}.png`) })
const box = await page.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] }; return { page: r('.f-modal__page'), loot: r('.results__loot'), purse: r('.results__purse'), stats: r('.results__stats'), content: r('.f-modal__content'), footer: r('.f-modal__footer') } })
console.log(JSON.stringify(box), 'errors', JSON.stringify(errors))
await ctx.close().catch(() => {}); process.exit(0)
