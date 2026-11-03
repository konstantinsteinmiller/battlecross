#!/usr/bin/env node
/**
 * The first level on a RUNNING dev server: frames of the palisade gate (shut, and opened by the key), and of the camp round the
 * fire after the teachers are out (spacing, no trees close, Nettle west). Frames to reports/camp/.
 *   node scripts/camp-probe.mjs [http://localhost:2194/]
 */
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const URL = process.argv[2] ?? 'http://localhost:2194/'
const OUT = resolve(root, 'reports/camp'); mkdirSync(OUT, { recursive: true })
const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-camp-')), {
  channel: 'chrome', headless: false, viewport: { width: 1100, height: 700 }, locale: 'en-US',
  args: ['--mute-audio']
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
for (let i = 0; i < 400; i++) {
  const s = await page.evaluate(() => ({ film: !!document.querySelector('.intro'), zone: window.__game.zone()?.setup?.zone }))
  if (!s.film && s.zone === 'plains') break
  await page.waitForTimeout(250)
}
await page.waitForTimeout(2500)
const shot = async (name) => { await page.waitForTimeout(2200); await page.screenshot({ path: join(OUT, name + '.png') }) }
const where = (name, dx = 0, dz = 0) => page.evaluate(([n, dx, dz]) => {
  const z = window.__game.zone(); const sim = z.sim; const h = sim.hero.unit
  const t = n === 'gate' ? sim.gate : n === 'fire' ? { fx: sim.camp.fire.x, fz: sim.camp.fire.z } : null
  const x = (n === 'gate' ? t.fx : t.fx) + dx; const zz = (n === 'gate' ? t.fz : t.fz) + dz
  h.x = h.px = x; h.z = h.pz = zz; z.cam.snap()
  return { gate: sim.gate && { o: sim.gate.opened, door: sim.gate.door }, fire: sim.camp.fire }
}, [name, dx, dz])
console.log('gate', JSON.stringify(await where('gate', 0, 3)))
await page.evaluate(() => { const z = window.__game.zone(); z.sim.hero.unit.facing = 0 })
await shot('g0-gate-shut')
// the pack is dead: the key falls where the last one lay
await page.evaluate(async () => {
  const z = window.__game.zone(); const sim = z.sim
  const cb = await import('/src/game/sim/combat.ts')
  const grp = sim.groups[sim.gate.group]
  for (const u of sim.units) if (u.group === grp.id && u.alive) cb.dealDamage(sim, sim.hero.unit, u, 1e9, { type: 'true', canCrit: false })
  const g = sim.gate
  window.__g = g
})
await page.waitForTimeout(1500)
console.log('key', JSON.stringify(await page.evaluate(() => window.__g.key)))
await shot('g1-key')
await page.evaluate(() => { const z = window.__game.zone(); const h = z.sim.hero.unit; const k = window.__g.key; h.x = h.px = k.x; h.z = h.pz = k.z })
await page.waitForTimeout(800)
await page.evaluate(() => { const z = window.__game.zone(); const h = z.sim.hero.unit; const g = window.__g; h.x = h.px = g.fx; h.z = h.pz = g.fz; z.cam.snap() })
await page.waitForTimeout(500)
await page.screenshot({ path: join(OUT, 'g2-opening.png') })
await shot('g3-open')
console.log('gate after', JSON.stringify(await page.evaluate(() => ({ o: window.__g.opened, taken: window.__g.key.taken }))))
// the camp round the fire: the teachers are out
await page.evaluate(async () => {
  const z = window.__game.zone(); const sim = z.sim
  const ic = await import('/src/game/sim/interact.ts')
  const cage = sim.chests.find(c => c.role === 'cage')
  cage.state = 'closed'
  sim.cageKey.taken = true
  ic.openChest(sim, cage)
})
await page.waitForTimeout(9000)
console.log('camp', JSON.stringify(await where('fire', 0, 6)))
await shot('c0-fire-south')
const pos = await page.evaluate(() => { const sim = window.__game.zone().sim; return { fire: sim.camp.fire, nettle: sim.units.find(u => u.npc === 'nettle' || /nettle/i.test(u.npc ?? ''))?.x, caps: sim.captives.map(c => { const u = sim.units.find(q => q.id === c.unit); return [c.npc, c.phase, +u.x.toFixed(1), +u.z.toFixed(1)] }) } })
console.log('positions', JSON.stringify(pos))
await page.evaluate(() => { const z = window.__game.zone(); const f = z.sim.camp.fire; const h = z.sim.hero.unit; h.x = h.px = f.x; h.z = h.pz = f.z + 9; z.cam.snap() })
await shot('c1-fire-wide')
console.log('errors', JSON.stringify([...new Set(errors)]))
await ctx.close().catch(() => {}); process.exit(0)
