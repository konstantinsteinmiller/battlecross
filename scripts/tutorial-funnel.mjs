#!/usr/bin/env node
/**
 * The first visit's funnel, walked in a real browser, as a structured report (#178).
 *
 *   node scripts/tutorial-funnel.mjs                  # phone portrait, phone landscape, desktop
 *   node scripts/tutorial-funnel.mjs --only phone     # one device (phone | landscape | desktop)
 *   node scripts/tutorial-funnel.mjs --out reports/tutorial-funnel
 *
 * 95 % of the Poki players who leave do so just before the opening boss or just
 * after opening its chest. This walks exactly that stretch — boot, the dummy, the
 * first pack, the boss in view, the win, the finale chest, the camp's cage, Leave,
 * the result window, the map — on each device, and at every step writes down what
 * a player is shown: the goal chip, the lessons, whether the Leave button is up
 * (and where), the chest prompt, the chevrons' length, the modal, the hero's health,
 * plus a screenshot. The fights themselves are skipped with damage (their
 * difficulty is the sim bot's business, `tests/game/tutorialAid`); this is about
 * what the screen says at the moments a player decides to stay or go.
 *
 * Output: <out>/<device>/NN-<step>.png and <out>/funnel.json. Starts its own dev
 * server and Chrome and stops both. Exit code 1 only when a step could not run.
 */
import { spawn, execSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def }
const PORT = Number(arg('port', 5415))
const ONLY = arg('only', '')
const OUT = resolve(root, arg('out', 'reports/tutorial-funnel'))
const URL = `http://localhost:${PORT}/`
const PHONE_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
const DEVICES = [
  { id: 'phone', name: 'Phone, portrait (390×844, touch)', w: 390, h: 844, touch: true },
  { id: 'landscape', name: 'Phone, landscape (844×390, touch)', w: 844, h: 390, touch: true },
  { id: 'desktop', name: 'Desktop (1280×720, mouse)', w: 1280, h: 720, touch: false }
].filter(d => !ONLY || d.id === ONLY)

const titleAt = async () => { try { return /<title>([^<]*)<\/title>/.exec(await (await fetch(URL)).text())?.[1] ?? '' } catch { return null } }
let server = null
const startServer = async () => {
  if ((await titleAt()) !== null) throw new Error(`port ${PORT} is already serving something: pass another --port`)
  server = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore', shell: process.platform === 'win32', windowsHide: true })
  for (let i = 0; i < 240; i++) {
    await new Promise(r => setTimeout(r, 500))
    const t = await titleAt()
    if (t === 'Battlecross') return
    if (t !== null) throw new Error(`port ${PORT} serves "${t}"`)
  }
  throw new Error('the dev server did not come up')
}
const stopServer = () => {
  if (!server?.pid) return
  try { if (process.platform === 'win32') execSync(`taskkill /PID ${server.pid} /T /F`, { stdio: 'ignore', windowsHide: true }); else server.kill('SIGTERM') } catch { /* gone */ }
}

const game = (page, fn, a) => page.evaluate(fn, a)

/** What a player is shown right now. */
const look = (page) => page.evaluate(async () => {
  const G = window.__game
  const z = G.zone()
  const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); if (r.width < 1 || r.height < 1 || s.visibility === 'hidden' || s.display === 'none') return null; return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), inView: r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 } }
  const text = (sel) => document.querySelector(sel)?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  const { hintPath } = await import('/src/game/coach.ts')
  const sim = z?.sim
  return {
    screen: G.flow.screen, modal: G.flow.modal, talk: !!G.flow.talk,
    simTime: sim ? +sim.time.toFixed(1) : null,
    ended: sim?.ended || '',
    hero: sim ? { hp: Math.round(sim.hero.unit.hp), maxHp: Math.round(sim.hero.unit.s.maxHp), level: G.profile.level } : null,
    foesAlive: sim ? sim.units.filter(u => u.alive && u.team === 1).length : null,
    goal: text('.top-status .goal'),
    hints: G.hud.hints.map(h => h.id),
    bossPlate: G.hud.bossKey || '',
    leave: rect(document.querySelector('[data-coach="leave"]')),
    chestPrompt: text('.chest-prompt'),
    chestsLeft: G.hud.chestsLeft,
    chevronPoints: hintPath.n,
    campPending: !!sim?.camp && sim.chests.some(c => c.role === 'cage' && c.state !== 'open'),
    modalTitle: text('.f-modal__ribbon-text')
  }
})

const run = async (dev) => {
  const dir = join(OUT, dev.id)
  mkdirSync(dir, { recursive: true })
  const steps = []
  const t0 = Date.now()
  let n = 0
  const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'bc-funnel-')), {
    channel: 'chrome', headless: true, viewport: { width: dev.w, height: dev.h }, hasTouch: dev.touch, isMobile: dev.touch, locale: 'en-US',
    userAgent: dev.touch ? PHONE_UA : undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio']
  })
  await ctx.routeWebSocket(/.*/, () => {})
  const page = ctx.pages()[0] ?? await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', e => errors.push('[pageerror] ' + String(e).slice(0, 240)))
  const snap = async (key, note = '') => {
    n++
    let data = {}
    try { data = await look(page) } catch (e) { data = { error: String(e).slice(0, 160) } }
    const file = `${String(n).padStart(2, '0')}-${key}.png`
    await page.screenshot({ path: join(dir, file) }).catch(() => {})
    steps.push({ step: n, key, note, wallSeconds: +((Date.now() - t0) / 1000).toFixed(1), shot: `${dev.id}/${file}`, ...data })
    console.log(`  ${dev.id} ${String(n).padStart(2, '0')} ${key}${data.goal ? '  goal: ' + data.goal : ''}${data.leave ? '  LEAVE up' : ''}`)
  }
  const tap = async (x, y) => { if (dev.touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y) }
  try {
    await page.goto(URL, { waitUntil: 'load', timeout: 900000 })
    await page.waitForFunction(() => window.__game && window.__game.app.mode && window.__game.hud.phase !== 'boot', null, { timeout: 600000 })
    await page.waitForFunction(() => !document.querySelector('.splash-backdrop') || getComputedStyle(document.querySelector('.splash-backdrop')).pointerEvents === 'none', null, { timeout: 30000 })
    await page.waitForTimeout(800)
    await snap('boot-hero-choice', 'a new save is asked for its hero over the opening fight')
    const card = page.locator('.hero-choice [data-hero="m"]')
    if (await card.count()) {
      await page.waitForTimeout(900)
      const r = await card.boundingBox()
      await tap(r.x + r.width / 2, r.y + r.height / 2)
      await page.waitForSelector('.hero-choice', { state: 'detached', timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(600)
    }
    await snap('first-seconds', 'the fight starts: the goal, the first lesson')
    // The dummy.
    await game(page, async () => {
      const { dealDamage } = await import('/src/game/sim/combat.ts')
      const z = window.__game.zone()
      const d = z.sim.units.find(u => u.kind === 'trainingDummy')
      if (d) for (let i = 0; i < 6 && d.alive; i++) dealDamage(z.sim, z.sim.hero.unit, d, 1e6, { type: 'true', canCrit: false })
    })
    await page.waitForTimeout(1500)
    await snap('dummy-down', 'the first goal done')
    // The first pack.
    await game(page, () => {
      const z = window.__game.zone(); const p = z.plan.packs[0]; const u = z.sim.hero.unit
      u.x = p.x; u.z = p.z + 5; u.hasGoal = false
      z.sim.hero.order = { kind: 'none', targetId: 0, x: u.x, z: u.z }
    })
    await page.waitForTimeout(2500)
    await snap('first-pack', 'the goblins wake')
    // Every pack but the boss's: skip the fights.
    await game(page, async () => {
      const { dealDamage } = await import('/src/game/sim/combat.ts')
      const z = window.__game.zone()
      const boss = z.sim.groups.find(g => g.boss)
      for (let i = 0; i < 40; i++) {
        for (const u of z.sim.units) if (u.alive && u.team === 1 && u.group !== boss?.id) dealDamage(z.sim, z.sim.hero.unit, u, 1e7, { type: 'true', canCrit: false })
        await new Promise(r => setTimeout(r, 50))
      }
    })
    await page.waitForTimeout(1200)
    // The boss in view, still asleep.
    const bossAt = await game(page, () => {
      const z = window.__game.zone(); const b = z.sim.units.find(u => u.alive && u.team === 1 && z.sim.groups.find(g => g.id === u.group)?.boss)
      if (!b) return null
      const u = z.sim.hero.unit; u.x = b.x; u.z = b.z + 10; u.hasGoal = false
      return { x: b.x, z: b.z, kind: b.kind }
    })
    await page.waitForTimeout(2500)
    await snap('boss-in-view', 'the road up to the boss (the chevrons lead to it)' + (bossAt ? '' : ' — no boss found'))
    // The boss falls.
    await game(page, async () => {
      const { dealDamage } = await import('/src/game/sim/combat.ts')
      const z = window.__game.zone()
      for (let i = 0; i < 80 && !z.sim.ended; i++) {
        for (const u of z.sim.units) if (u.alive && u.team === 1) dealDamage(z.sim, z.sim.hero.unit, u, 1e7, { type: 'true', canCrit: false })
        await new Promise(r => setTimeout(r, 100))
      }
    })
    await page.waitForTimeout(2500)
    await snap('boss-down', 'victory, before the chest is opened: what is on screen?')
    // The finale chest.
    await game(page, async () => {
      const { orderOpen } = await import('/src/game/sim/interact.ts')
      const z = window.__game.zone()
      const c = z.sim.chests.find(q => q.role === 'finale')
      if (!c) return
      const u = z.sim.hero.unit; u.x = c.sx; u.z = c.sz + 1.5; u.hasGoal = false
      orderOpen(z.sim, c.id)
    })
    await page.waitForTimeout(400)
    await snap('finale-chest-opening', 'the lid lifts')
    await page.waitForFunction(() => window.__game.zone().sim.chests.find(q => q.role === 'finale')?.state === 'open', null, { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(3500)
    await snap('finale-chest-open', 'THE DROP-OFF MOMENT: the chest is open; what tells the player there is more?')
    // The camp: the key, then the cage.
    await game(page, async () => {
      const z = window.__game.zone()
      if (z.sim.cageKey) { const u = z.sim.hero.unit; u.x = z.sim.cageKey.x; u.z = z.sim.cageKey.z + 0.4; u.hasGoal = false }
    })
    await page.waitForTimeout(1500)
    await snap('camp-key-taken', 'the key in hand')
    await game(page, async () => {
      const { orderOpen } = await import('/src/game/sim/interact.ts')
      const z = window.__game.zone()
      const c = z.sim.chests.find(q => q.role === 'cage')
      if (c) { const u = z.sim.hero.unit; u.x = c.sx; u.z = c.sz + 1.2; u.hasGoal = false; orderOpen(z.sim, c.id) }
    })
    await page.waitForTimeout(9000)
    await snap('cage-open', 'the teachers are out and talk; the Leave button?')
    // Leave and the result window.
    const leave = page.locator('[data-coach="leave"]')
    if (await leave.count()) {
      await leave.click({ force: true }).catch(() => {})
      await page.waitForFunction(() => window.__game.flow.modal === 'results', null, { timeout: 20000 }).catch(() => {})
      await page.waitForTimeout(900)
      await snap('results', 'the result window')
      await page.locator('.f-modal__footer button').last().click({ force: true }).catch(() => {})
      await page.waitForFunction(() => window.__game.flow.screen === 'map', null, { timeout: 20000 }).catch(() => {})
      await page.waitForTimeout(2500)
      await snap('map', 'the world map: is the next step clear?')
    } else steps.push({ step: ++n, key: 'no-leave-button', note: 'no Leave button was found after the cage opened' })
  } catch (e) {
    steps.push({ step: ++n, key: 'ERROR', note: String(e).slice(0, 300) })
    await page.screenshot({ path: join(dir, 'error.png') }).catch(() => {})
  }
  await ctx.close().catch(() => {})
  return { device: dev, steps, consoleErrors: [...new Set(errors)].slice(0, 12) }
}

const report = { generated: new Date().toISOString(), runs: [] }
mkdirSync(OUT, { recursive: true })
let failed = false
try {
  await startServer()
  for (const dev of DEVICES) {
    console.log(`\n${dev.name}`)
    const r = await run(dev)
    report.runs.push(r)
    if (r.steps.some(s => s.key === 'ERROR')) failed = true
    writeFileSync(join(OUT, 'funnel.json'), JSON.stringify(report, null, 2))
  }
} finally {
  stopServer()
}
console.log(`\nwritten: ${join(OUT, 'funnel.json')}`)
process.exit(failed ? 1 : 0)
