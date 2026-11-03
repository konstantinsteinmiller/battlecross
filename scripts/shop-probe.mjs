#!/usr/bin/env node
/** The merchant's table on a phone on its side (844x390) on a RUNNING dev server: some pieces sold, a worn one picked, then a frame. */
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const URL = process.argv[2] ?? 'http://localhost:2194/'
const W = Number(process.argv[3] ?? 844), H = Number(process.argv[4] ?? 390)
const OUT = resolve(root, 'reports/shop'); mkdirSync(OUT, { recursive: true })
const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-shop-')), {
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
await page.locator('.hero-choice [data-hero="m"]').click()
for (let i = 0; i < 400; i++) {
  const s = await page.evaluate(() => ({ film: !!document.querySelector('.intro'), zone: window.__game.zone()?.setup?.zone }))
  if (!s.film && s.zone === 'plains') break
  await page.waitForTimeout(250)
}
await page.waitForTimeout(1500)
await page.evaluate(async () => {
  const g = window.__game
  const pr = await import('/src/game/state/profile.ts')
  const { ITEMS } = await import('/src/game/data/items.ts')
  g.profile.gold = 5000
  for (const it of ITEMS.slice(0, 40)) if (!g.profile.inv.items.includes(it.id)) g.profile.inv.items.push(it.id)
  g.flow.npc = { id: 'sbArmorer', role: 'shop', look: 'sbArmorer', at: [0, 0], stock: { slots: ['head', 'body', 'hands', 'feet', 'off'], tiers: [2, 3] } }
})
const has = await page.evaluate(() => !!window.__game.flow.npc)
console.log('npc', has)
await page.evaluate(() => { window.__game.flow.modal = 'shop' })
await page.waitForTimeout(1500)
console.log('modal', await page.evaluate(() => window.__game.flow.modal), await page.locator('.trade').count())
// sell three bag pieces (the "sold today" tray), then pick the first bag piece
for (let k = 0; k < 4; k++) {
  await page.locator('.trade__bag .cell').nth(k + 3).click()
  await page.waitForTimeout(300)
  const act = page.locator('.trade__act')
  if (await act.count()) await act.click().catch(() => {})
  await page.waitForTimeout(300)
}
await page.locator('.trade__bag .cell').first().click()
await page.waitForTimeout(600)
await page.screenshot({ path: join(OUT, `shop-${W}x${H}.png`) })
const box = await page.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)] }; return { act: r('.shop__actions'), back: r('.trade__back'), table: r('.trade__table') } })
console.log(JSON.stringify(box), 'errors', JSON.stringify(errors))
await ctx.close().catch(() => {}); process.exit(0)
