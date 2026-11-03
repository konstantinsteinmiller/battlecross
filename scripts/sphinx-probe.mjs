#!/usr/bin/env node
/** The Sphinx in the real game on a RUNNING dev server: the temple's finale is entered, the hero is made unhurtable, the Sphinx is
 *  pushed to 59 % so the riddle starts, and frames are taken through it: up, the plates, the hero stepping them, down, dazed. */
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const URL = process.argv[2] ?? 'http://localhost:2194/'
const OUT = resolve(root, 'reports/sphinx'); mkdirSync(OUT, { recursive: true })
const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-sx-')), {
  channel: 'chrome', headless: true, viewport: { width: 1100, height: 700 }, locale: 'en-US',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio']
})
await ctx.routeWebSocket(/.*/, () => {})
const page = ctx.pages()[0] ?? await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(String(e.stack ?? e).slice(0, 400)))
await page.goto(URL, { waitUntil: 'load', timeout: 600000 })
await page.waitForFunction(() => window.__game && window.__game.app.mode && window.__game.hud.phase !== 'boot', null, { timeout: 600000 })
await page.waitForSelector('.hero-choice .hero-choice__card', { timeout: 120000 })
await page.waitForTimeout(1000)
await page.locator('.hero-choice [data-hero="m"]').click()
for (let i = 0; i < 400; i++) { // the film, then the level
  const s = await page.evaluate(() => ({ film: !!document.querySelector('.intro'), zone: window.__game.zone()?.setup?.zone }))
  if (!s.film && s.zone === 'plains') break
  await page.waitForTimeout(250)
}
await page.waitForTimeout(2000)
// open the map, the story and the afterplay; go to the temple
await page.evaluate(async () => {
  const g = window.__game
  g.profile.level = 49
  const { MAP } = await import('/src/game/data/zones.ts')
  for (const n of MAP) if (!g.profile.world.cleared.includes(n.id)) g.profile.world.cleared.push(n.id)
  const pr = await import('/src/game/state/profile.ts')
  pr.openAfterplay()
  const inv = await import('/src/game/data/invasion.ts')
  for (const z of inv.INVASION_ORDER) { const f = inv.invadedFlag(z); if (!g.profile.world.flags.includes(f)) g.profile.world.flags.push(f) }
  const node = MAP.find(n => n.id === 'temple')
  window.__node = node.id
  await g.travel(node.id)
})
await page.waitForTimeout(500)
console.log('flow', JSON.stringify(await page.evaluate(() => ({ loading: window.__game.flow.loading, zone: window.__game.zone()?.setup?.zone }))))
await page.waitForFunction(() => window.__game.zone()?.setup?.zone === 'temple' && !window.__game.flow.loading, null, { timeout: 300000 })
await page.waitForTimeout(3000)
const info = await page.evaluate(async () => {
  const z = window.__game.zone(); const sim = z.sim
  const sx = sim.units.find(u => u.kind === 'sphinx')
  const st = await import('/src/game/sim/world.ts')
  const cb = await import('/src/game/sim/combat.ts')
  cb.applyStatus(sim, sim.hero.unit, 'invulnerable', 900, 1, sim.hero.unit)
  window.__sx = sx
  return { has: !!sx, hp: sx?.hp, node: window.__node }
})
console.log('temple', JSON.stringify(info))
if (!info.has) { console.log('errors', JSON.stringify(errors)); await ctx.close(); process.exit(1) }
await page.evaluate(() => {
  const z = window.__game.zone(); const sx = window.__sx; const h = z.sim.hero.unit
  sx.awake = true; sx.targetId = h.id
  h.x = h.px = sx.x + 5; h.z = h.pz = sx.z; z.cam.snap()
})
await page.waitForTimeout(2500)
await page.screenshot({ path: join(OUT, 's0-ground.png') })
await page.evaluate(() => { const sx = window.__sx; sx.hp = sx.s.maxHp * 0.59 })
const read = () => page.evaluate(() => { const sx = window.__sx; const b = sx.boss; return { hp: Math.round(sx.hp), max: Math.round(sx.s.maxHp), mode: b.mode, sub: b.sub, alt: +b.alt.toFixed(2), phase: b.phase } })
let shots = 0
for (let i = 0; i < 40; i++) {
  await page.waitForTimeout(1000)
  const r = await read()
  console.log(i, JSON.stringify(r))
  if (r.sub === 'show' && shots === 0) { await page.screenshot({ path: join(OUT, 's1-show.png') }); shots = 1 }
  if (r.sub === 'step' && shots === 1) { await page.screenshot({ path: join(OUT, 's2-step.png') }); shots = 2; break }
}
// solve it like a player: step the plates in order
await page.evaluate(async () => {
  const m = { riddleOf: window.__riddleOf }
  const z = window.__game.zone(); const h = z.sim.hero.unit
  window.__solve = setInterval(() => {
    const r = m.riddleOf(window.__sx); if (!r) return
    const k = r.seq[r.at]; if (k === undefined) return
    if (Math.hypot(h.x - r.px[k], h.z - r.pz[k]) < 1) { h.x = h.px = window.__sx.homeX; h.z = h.pz = window.__sx.homeZ; return }
    h.x = h.px = r.px[k]; h.z = h.pz = r.pz[k]
  }, 500)
})
let got = 0
for (let i = 0; i < 40; i++) {
  await page.waitForTimeout(500)
  const r = await read()
  if (i % 4 === 0) console.log('solve', i, JSON.stringify(r), JSON.stringify(await page.evaluate(async () => { const m = { riddleOf: window.__riddleOf }; const q = m.riddleOf(window.__sx); const h = window.__game.zone().sim.hero.unit; return { at: q.at, seq: q.seq, hero: [+h.x.toFixed(1), +h.z.toFixed(1)], plates: q.px.map((x, k) => [+x.toFixed(1), +q.pz[k].toFixed(1)]) } })))
  if (r.mode === 'dazed' && !got) { got = 1; await page.screenshot({ path: join(OUT, 's3-dazed.png') }); console.log('dazed on the ground', JSON.stringify(r)); break }
}
console.log('errors', JSON.stringify([...new Set(errors)]))
await ctx.close().catch(() => {}); process.exit(0)
