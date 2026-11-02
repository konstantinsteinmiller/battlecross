#!/usr/bin/env node
/**
 * After the intro, what stands in the opening level? On a RUNNING dev server: a new save picks its hero, the film plays, the
 * level takes over; then the scene is counted (props, the dummy, chests, plates) and shot, and the same is done for a level
 * entered the usual way (a reload of the saved game), to compare. Frames to reports/intro/after/.
 *   node scripts/intro-after.mjs [--url http://localhost:2194/]
 */
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d }
const URL = arg('url', 'http://localhost:2194/')
const OUT = resolve(root, 'reports/intro/after')
mkdirSync(OUT, { recursive: true })
const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-after-')), {
  channel: 'chrome', headless: true, viewport: { width: 1100, height: 700 }, locale: 'en-US',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio']
})
await ctx.routeWebSocket(/.*/, () => {})
const page = ctx.pages()[0] ?? await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(String(e.stack ?? e).slice(0, 400)))
const census = () => page.evaluate(() => {
  const z = window.__game.zone()
  if (!z) return { none: true }
  const sim = z.sim
  const kids = (o) => (o ? o.children.length : null)
  let meshes = 0, visible = 0
  z.scene.traverse((o) => { if (o.isMesh) { meshes++; if (o.visible) visible++ } })
  return {
    zone: z.setup.zone, tutorial: z.setup.tutorial, dummyFlag: z.dummy, sceneKids: kids(z.scene), meshes, visible,
    propsRoot: z.props ? { kids: kids(z.props.root), visible: z.props.root.visible, inScene: z.props.root.parent === z.scene } : null,
    chests: sim.chests.map(c => [c.role, c.state, Math.round(c.x), Math.round(c.z)]).slice(0, 6),
    dummyUnits: sim.units.filter(u => u.kind === 'dummy' || /dummy/i.test(u.kind)).map(u => [u.kind, u.alive, Math.round(u.x), Math.round(u.z)]),
    hero: [Math.round(sim.hero.unit.x), Math.round(sim.hero.unit.z)], baked: z.baked ? Object.keys(z.baked).length : null
  }
})
await page.goto(URL, { waitUntil: 'load', timeout: 600000 })
await page.waitForFunction(() => window.__game && window.__game.app.mode && window.__game.hud.phase !== 'boot', null, { timeout: 600000 })
await page.waitForSelector('.hero-choice .hero-choice__card', { timeout: 120000 })
await page.waitForTimeout(1200)
await page.locator('.hero-choice [data-hero="m"]').click()
let saw = false
for (let i = 0; i < 400; i++) {
  const s = await page.evaluate(() => ({ film: !!document.querySelector('.intro'), zone: window.__game.zone()?.setup?.zone }))
  if (s.film) saw = true
  if (saw && !s.film && s.zone === 'plains') break
  await page.waitForTimeout(250)
}
console.log('after the film, at once:', JSON.stringify(await census()))
await page.screenshot({ path: join(OUT, 'a0-just-after.png') })
await page.waitForTimeout(4000)
console.log('after the film, +4 s:', JSON.stringify(await census()))
await page.screenshot({ path: join(OUT, 'a1-4s.png') })
// the camp's cage, from the south: the hero is put there (the chest list says where)
await page.evaluate(() => {
  const z = window.__game.zone()
  const c = z.sim.chests.find(q => q.role === 'cage')
  const h = z.sim.hero.unit
  h.x = h.px = c.x - 1; h.z = h.pz = c.z + 5.5
  z.cam.snap()
})
await page.waitForTimeout(3500)
await page.screenshot({ path: join(OUT, 'a2-cage.png') })
// the same level entered the usual way: a reload of the (now introSeen) save
await page.reload({ waitUntil: 'load' })
await page.waitForFunction(() => window.__game && window.__game.zone() && window.__game.hud.phase !== 'boot', null, { timeout: 600000 })
await page.waitForTimeout(5000)
console.log('a plain reload:', JSON.stringify(await census()))
await page.screenshot({ path: join(OUT, 'b0-reload.png') })
console.log('errors', JSON.stringify([...new Set(errors)]))
await ctx.close().catch(() => {})
process.exit(0)
