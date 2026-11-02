#!/usr/bin/env node
/**
 * The intro on an ALREADY RUNNING dev server (default http://localhost:2194/, nothing started or stopped here): a new save
 * picks its hero and the film plays. Every 200 ms: the film's clock, the veil, whether the drake lives, the hero's state,
 * the longest frame gap, and the page errors; frames at chosen film seconds. It prints where the film stalls.
 *   node scripts/intro-probe.mjs [--url http://localhost:2194/] [--out reports/intro/probe]
 */
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d }
const URL = arg('url', 'http://localhost:2194/')
const OUT = resolve(root, arg('out', 'reports/intro/probe'))
mkdirSync(OUT, { recursive: true })
const AT = [0.5, 1.8, 3, 4.5, 6.2, 6.9, 7.6, 8.4, 9.0, 9.6, 10.4, 11.4]
const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-probe-')), {
  channel: 'chrome', headless: true, viewport: { width: 1280, height: 720 }, locale: 'en-US',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio']
})
await ctx.routeWebSocket(/.*/, () => {})
const page = ctx.pages()[0] ?? await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + String(e.stack ?? e).slice(0, 900)))
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text().slice(0, 240)) })
await page.addInitScript(() => {
  // The longest gap between two animation frames, and the frame count, from the first.
  const s = { last: 0, max: 0, n: 0, big: [] }
  window.__gap = s
  const tick = (now) => { if (s.last) { const g = now - s.last; if (g > s.max) s.max = g; if (g > 400) s.big.push([+(now / 1000).toFixed(2), Math.round(g)]) } s.last = now; s.n++; requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
})
await page.goto(URL, { waitUntil: 'load', timeout: 600000 })
await page.waitForFunction(() => window.__game && window.__game.app.mode && window.__game.hud.phase !== 'boot', null, { timeout: 600000 })
await page.waitForSelector('.hero-choice .hero-choice__card', { timeout: 120000 })
await page.waitForTimeout(1500)
await page.screenshot({ path: join(OUT, '00-choice.png') })
await page.locator('.hero-choice [data-hero="m"]').click()
const t0 = Date.now()
const log = []
const shot = new Set()
let lastT = -1
let stuckSince = Date.now()
for (;;) {
  const s = await page.evaluate(async () => {
    const m = await import('/src/game/intro/runner.ts')
    const z = window.__game.zone()
    const sim = z?.sim
    const drake = sim?.units.find(u => u.kind === 'voidDrake')
    return {
      t: +m.introView.t.toFixed(2), veil: +m.introView.veil.toFixed(2), label: +m.introView.label.toFixed(2), canSkip: m.introView.canSkip,
      intro: !!document.querySelector('.intro'), screen: window.__game.flow.screen, ended: sim?.ended ?? null,
      drake: drake ? { alive: drake.alive, hp: Math.round(drake.hp), deadT: +(drake.deadT ?? 0).toFixed(2) } : null,
      hero: sim ? { hp: Math.round(sim.hero.unit.hp), st: sim.hero.unit.statuses.map(q => q.id).join(','), y: +(sim.hero.unit.h).toFixed(2) } : null,
      mode: window.__game.app.mode?.constructor?.name, zone: window.__game.zone()?.setup?.zone, flag: (await import('/src/game/intro/state.ts')).INTRO_ENABLED, boot: (await import('/src/game/intro/state.ts')).introBoot.value, playing: (await import('/src/game/intro/state.ts')).introPlaying.value, paused: !!window.__game.app.suspended, gap: Math.round(window.__gap.max), frames: window.__gap.n, big: window.__gap.big.slice(-4)
    }
  }).catch(e => ({ err: String(e).slice(0, 120) }))
  const wall = +((Date.now() - t0) / 1000).toFixed(1)
  log.push({ wall, ...s })
  if (s.t !== lastT) { lastT = s.t; stuckSince = Date.now() }
  for (const at of AT) if (s.t >= at && !shot.has(at)) { shot.add(at); await page.screenshot({ path: join(OUT, `t${String(at).replace('.', '_')}.png`) }); console.log('shot', at, JSON.stringify(s)) }
  if (log.length % 5 === 0) console.log('wall', wall, JSON.stringify(s))
  if (!s.intro && s.t > 1 && wall > 5) { console.log('film over', JSON.stringify(s)); break }
  if (Date.now() - stuckSince > 25000) { console.log('STALLED: the film clock has not moved for 25 s', JSON.stringify(s)); break }
  if (wall > 240) { console.log('timeout'); break }
  await page.waitForTimeout(200)
}
await page.waitForTimeout(3000)
await page.screenshot({ path: join(OUT, '99-after.png') })
console.log('errors', JSON.stringify([...new Set(errors)].slice(0, 12), null, 1))
writeFileSync(join(OUT, 'probe.json'), JSON.stringify({ log, errors: [...new Set(errors)] }, null, 1))
await ctx.close().catch(() => {})
process.exit(0)
