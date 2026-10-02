#!/usr/bin/env node
/**
 * End-to-end play-through in a real browser, with real input.
 *
 *   node scripts/e2e-play.mjs                 # every case
 *   node scripts/e2e-play.mjs --only layout   # one group: play | touch | layout
 *   node scripts/e2e-play.mjs --shots out/    # also write screenshots
 *
 * Three groups:
 *
 *   play    desktop, mouse and keys: the opening fight is played by clicking
 *           (walk, lock a goblin, press the skill key), then the loop is
 *           followed through its screens by clicking what a player clicks —
 *           result → map → town → walk up to the smith → talk ("Show me
 *           your goods") → buy → equip → the trainer ("Teach me") → learn →
 *           slot → the character sheet's "+" — and the page is RELOADED to
 *           prove all of it was saved.
 *   touch   a phone: the stick moves the hero, a tap locks an enemy, a skill
 *           is dragged from its button onto the field and cast where it is
 *           let go.
 *   layout  the HUD, the map and a menu at 320×658, 658×320, 768×1024,
 *           1366×768 and 1920×1080: every control inside the viewport, none
 *           overlapping another, no page scroll, modal header clear of its
 *           content.
 *
 * Starts its own dev server (leaderboard off in dev) and its own headless
 * Chrome; both are stopped at the end. Exit code 1 on any failed check.
 */
import { spawn, execSync } from 'node:child_process'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def }
const PORT = Number(arg('port', 5414))
const ONLY = arg('only', '')
const SHOTS = arg('shots', '')
const TITLE = 'Battlecross'
const URL = `http://localhost:${PORT}/`
const PHONE_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
if (SHOTS) mkdirSync(resolve(SHOTS), { recursive: true })

// ── Reporting ────────────────────────────────────────────────────────────────
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? '  — ' + detail : ''}`) }

// ── Server ───────────────────────────────────────────────────────────────────
const titleAt = async () => { try { return /<title>([^<]*)<\/title>/.exec(await (await fetch(URL)).text())?.[1] ?? '' } catch { return null } }
let server = null
const startServer = async () => {
  const before = await titleAt()
  if (before !== null) throw new Error(`port ${PORT} is already serving "${before}" — pass another --port`)
  server = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore', shell: process.platform === 'win32', windowsHide: true })
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 500))
    const t = await titleAt()
    if (t === TITLE) return
    if (t !== null) throw new Error(`port ${PORT} serves "${t}", not ${TITLE}`)
  }
  throw new Error('the dev server did not come up')
}
const stopServer = () => {
  if (!server?.pid) return
  try { if (process.platform === 'win32') execSync(`taskkill /PID ${server.pid} /T /F`, { stdio: 'ignore', windowsHide: true }); else server.kill('SIGTERM') } catch { /* gone */ }
}

// ── Browser ──────────────────────────────────────────────────────────────────
const open = async ({ w, h, touch = false, profile = null }) => {
  const dir = profile ?? mkdtempSync(join(tmpdir(), 'bc-e2e-'))
  const ctx = await chromium.launchPersistentContext(dir, {
    channel: 'chrome', headless: true, viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, locale: 'en-US',
    userAgent: touch ? PHONE_UA : undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio']
  })
  // No live reload: a file saved by someone else mid-run must not restart the page under a check.
  await ctx.routeWebSocket(/.*/, () => {})
  const page = ctx.pages()[0] ?? await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 240)) })
  page.on('pageerror', e => errors.push('[pageerror] ' + String(e).slice(0, 300)))
  await page.goto(URL, { waitUntil: 'load' })
  if (await page.title() !== TITLE) throw new Error('wrong app on the port')
  await page.waitForFunction(() => window.__game && window.__game.app.mode && window.__game.hud.phase !== 'boot', null, { timeout: 90000 })
  // The splash has handed over (its fade no longer takes input, but wait it out).
  await page.waitForFunction(() => !document.querySelector('.splash-backdrop') || getComputedStyle(document.querySelector('.splash-backdrop')).pointerEvents === 'none', null, { timeout: 30000 })
  await page.waitForTimeout(500)
  const cdp = touch ? await ctx.newCDPSession(page) : null
  return { ctx, page, errors, dir, cdp }
}
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: join(resolve(SHOTS), name + '.png') }) }
const game = (page, fn, a) => page.evaluate(fn, a)

/** Screen position of a world point. */
const project = (page, x, y, z) => game(page, ([x, y, z]) => { const o = { x: 0, y: 0 }; window.__game.zone().project(x, y, z, o); return o }, [x, y, z])
const heroPos = (page) => game(page, () => { const u = window.__game.zone().sim.hero.unit; return { x: u.x, z: u.z, hp: u.hp, mana: u.mana } })
/** The nearest live enemy (waking its pack, as walking up to it would). */
const nearestFoe = (page) => game(page, () => {
  const z = window.__game.zone(); const u = z.sim.hero.unit
  let best = null; let bd = 1e9
  for (const e of z.sim.units) { if (!e.alive || e.team !== 1) continue; const d = Math.hypot(e.x - u.x, e.z - u.z); if (d < bd) { bd = d; best = e } }
  return best ? { id: best.id, x: best.x, z: best.z, h: best.h, hp: best.hp, d: bd } : null
})
/** Put the hero a few metres short of the first pack (walking there is tested once; this saves the rest). */
const nearFirstPack = (page, dist = 5) => game(page, (dist) => {
  const z = window.__game.zone(); const p = z.plan.packs[0]; const u = z.sim.hero.unit
  u.x = p.x; u.z = p.z + dist; u.hasGoal = false
  z.sim.hero.order = { kind: 'none', targetId: 0, x: u.x, z: u.z }
}, dist)
const winZone = (page) => game(page, async () => {
  const { dealDamage } = await import('/src/game/sim/combat.ts')
  const z = window.__game.zone()
  for (let i = 0; i < 80 && !z.sim.ended; i++) {
    for (const u of z.sim.units) if (u.alive && u.team === 1) dealDamage(z.sim, z.sim.hero.unit, u, 1e7, { type: 'true', canCrit: false })
    await new Promise(r => setTimeout(r, 120))
  }
})
/** Hear a conversation's lines (Space) until its topics, a window it opens, or its end. */
const talkThrough = async (page) => {
  for (let i = 0; i < 40; i++) {
    const s = await game(page, () => ({ talk: window.__game.flow.talk, modal: window.__game.flow.modal, phase: window.__game.talk.phase }))
    if (!s.talk || s.modal || s.phase !== 'line') return s
    await page.keyboard.press('Space')
    await page.waitForTimeout(160)
  }
  return game(page, () => ({ talk: window.__game.flow.talk, modal: window.__game.flow.modal, phase: window.__game.talk.phase }))
}
/** Take a polite leave (Esc; a second one skips the farewell). */
const endTalk = async (page) => {
  for (let i = 0; i < 8 && await game(page, () => window.__game.flow.talk); i++) {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(260)
  }
}
const touchDrag = async (cdp, from, to, steps = 10, hold = 80) => {
  const pt = (p) => [{ x: Math.round(p.x), y: Math.round(p.y), id: 1, radiusX: 8, radiusY: 8, force: 1 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(from) })
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt({ x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps }) })
    await new Promise(r => setTimeout(r, 25))
  }
  await new Promise(r => setTimeout(r, hold))
  return () => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

// ── Geometry checks ──────────────────────────────────────────────────────────
/** Rects of the visible elements matching each selector, by label. */
const rectsOf = (page, groups) => page.evaluate((groups) => {
  const out = []
  for (const [label, sel] of groups) {
    document.querySelectorAll(sel).forEach((el, i) => {
      const r = el.getBoundingClientRect()
      const st = getComputedStyle(el)
      if (r.width < 1 || r.height < 1 || st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) === 0) return
      out.push({ label: `${label}${i ? '#' + i : ''}`, x: r.left, y: r.top, w: r.width, h: r.height })
    })
  }
  return { rects: out, vw: innerWidth, vh: innerHeight, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight }
}, groups)
const overlaps = (a, b, slack = 1) => a.x < b.x + b.w - slack && b.x < a.x + a.w - slack && a.y < b.y + b.h - slack && b.y < a.y + a.h - slack
const layoutProblems = ({ rects, vw, vh, sw, sh }, minTap = 0) => {
  const bad = []
  if (sw > vw + 1 || sh > vh + 1) bad.push(`the page scrolls (${sw}×${sh} in ${vw}×${vh})`)
  for (const r of rects) {
    if (r.x < -1 || r.y < -1 || r.x + r.w > vw + 1 || r.y + r.h > vh + 1) bad.push(`${r.label} leaves the viewport (${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.w)}×${Math.round(r.h)})`)
    if (minTap && r.tap && (r.w < minTap || r.h < minTap)) bad.push(`${r.label} is a ${Math.round(r.w)}×${Math.round(r.h)} tap target`)
  }
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i]; const b = rects[j]
    if (a.label.split('#')[0] === b.label.split('#')[0] && a.label.startsWith('~')) continue
    if (overlaps(a, b)) bad.push(`${a.label} overlaps ${b.label}`)
  }
  return bad
}

// ═════════════════════════════════════════════════════════════════════════════
const playDesktop = async () => {
  console.log('\nplay — desktop, mouse and keys')
  const b = await open({ w: 1280, h: 720 })
  const { page } = b
  await page.waitForFunction(() => window.__game.hud.hints.length > 0, null, { timeout: 8000 }).catch(() => {})
  let s = await game(page, () => ({ screen: window.__game.flow.screen, node: window.__game.flow.node, level: window.__game.profile.level, hints: window.__game.hud.hints.map(h => h.id) }))
  check('a new player boots straight into the opening fight (no menu)', s.screen === 'zone' && s.node === 'plains' && s.level === 1, `${s.screen}/${s.node}`)
  check('the first control lesson is on screen', s.hints.includes('move'), s.hints.join(','))
  await shot(page, 'play-1-boot')

  // Click the ground: the hero walks there.
  const p0 = await heroPos(page)
  const ground = await project(page, p0.x + 1.5, 0, p0.z - 4)
  await page.mouse.click(ground.x, ground.y)
  await page.waitForTimeout(1500)
  const p1 = await heroPos(page)
  check('clicking the ground walks the hero there', Math.hypot(p1.x - p0.x, p1.z - p0.z) > 1.5, `moved ${Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(1)} m`)

  // The movement keys.
  await page.keyboard.down('KeyW')
  await page.waitForTimeout(700)
  await page.keyboard.up('KeyW')
  const p2 = await heroPos(page)
  check('the movement keys steer him (W is up-screen)', p2.z < p1.z - 0.8, `Δz ${(p2.z - p1.z).toFixed(1)}`)

  // Click an enemy: lock and attack.
  await nearFirstPack(page, 4.5)
  await page.waitForTimeout(900)
  const foe = await nearestFoe(page)
  const fp = await project(page, foe.x, foe.h * 0.5, foe.z)
  await page.mouse.click(fp.x, fp.y)
  await page.waitForTimeout(300)
  const order = await game(page, () => window.__game.zone().sim.hero.order)
  check('clicking an enemy locks it as the target', order.kind === 'attack' && order.targetId === foe.id, JSON.stringify(order))
  const target = await game(page, () => window.__game.hud.targetKey)
  check('the target frame names it', target.startsWith('enemy.'), target)
  await page.waitForTimeout(2600)
  const hurt = await game(page, (id) => { const u = window.__game.zone().sim.live(id); return u ? u.hp / u.s.maxHp : 0 }, foe.id)
  check('the hero walks up and auto-attacks it', hurt < 1, `enemy at ${(hurt * 100).toFixed(0)} %`)

  // The skill key.
  const before = await game(page, () => ({ mana: window.__game.zone().sim.hero.unit.mana, cd: window.__game.zone().sim.hero.cd[0] }))
  const foe2 = await nearestFoe(page)
  const fp2 = await project(page, foe2.x, foe2.h * 0.5, foe2.z)
  await page.mouse.click(fp2.x, fp2.y)
  await page.waitForTimeout(700)
  await page.keyboard.press('Digit1')
  await page.waitForTimeout(900)
  const after = await game(page, () => ({ mana: window.__game.zone().sim.hero.unit.mana, cd: window.__game.zone().sim.hero.cd[0], shown: window.__game.hud.skills[0] }))
  check('key 1 casts the first skill: mana spent, cooldown running', after.cd > 0 && (after.mana < before.mana || before.cd > 0), `mana ${before.mana.toFixed(0)}→${after.mana.toFixed(0)} cd ${after.cd.toFixed(1)}`)
  check('the skill button shows it is cooling down', after.shown.id === 'shieldSlam' && after.shown.ready === false)
  await shot(page, 'play-2-fight')

  // Pause with Escape: the loop stops, Escape resumes.
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  const t0 = await game(page, () => ({ modal: window.__game.flow.modal, t: window.__game.zone().sim.time }))
  await page.waitForTimeout(600)
  const t1 = await game(page, () => window.__game.zone().sim.time)
  check('Escape pauses: the menu is up and the simulation stands still', t0.modal === 'pause' && t1 === t0.t, `${t0.modal}, Δt ${(t1 - t0.t).toFixed(2)}`)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  const t2 = await game(page, () => ({ modal: window.__game.flow.modal, t: window.__game.zone().sim.time }))
  check('Escape resumes', t2.modal === '' && t2.t > t1)

  // Win, and follow the screens.
  await winZone(page)
  await page.waitForFunction(() => window.__game.flow.modal === 'results', null, { timeout: 20000 })
  await page.waitForTimeout(500)
  const res = await game(page, () => ({ r: window.__game.flow.results, title: document.querySelector('.f-modal__ribbon-text')?.textContent }))
  check('the result screen opens with the win', res.r.outcome === 'victory' && res.r.firstClear && /victory/i.test(res.title ?? ''), res.title)
  await shot(page, 'play-3-results')
  await page.locator('.f-modal__footer button').last().click({ force: true })
  await page.waitForFunction(() => window.__game.flow.screen === 'map', null, { timeout: 15000 })
  await page.waitForTimeout(400)
  check('Continue leads to the world map', true)
  const nodes = await page.evaluate(() => [...document.querySelectorAll('.node')].map(n => ({ id: n.dataset.node, locked: n.classList.contains('is-locked'), cleared: n.classList.contains('is-cleared') })))
  const st = Object.fromEntries(nodes.map(n => [n.id, n]))
  check('the plains are cleared; the Hollows and the Woods have opened; the rest is locked',
    st.plains.cleared && !st.hollows.locked && !st.woods.locked && st.crags.locked && st.fortress.locked)
  await shot(page, 'play-4-map')

  // Travel to the town by clicking its node and the card's button.
  await page.locator('[data-node="sunford"]').click()
  await page.waitForTimeout(300)
  await page.locator('.card__actions button').last().click({ force: true })
  await page.waitForFunction(() => window.__game.flow.screen === 'town' && !window.__game.flow.loading && window.__game.zone(), null, { timeout: 60000 })
  await page.waitForTimeout(800)
  check('clicking Sunford and Enter travels to the town', true)

  // Walk up to the smith by clicking him.
  const smith = await game(page, () => { const z = window.__game.zone(); const n = z.sim.units.find(u => u.npc === 'sunfordSmith'); const u = z.sim.hero.unit; u.x = n.x + 0.5; u.z = n.z + 5; return { x: n.x, z: n.z, h: n.h } })
  await page.waitForTimeout(500)
  const sp = await project(page, smith.x, smith.h * 0.5, smith.z)
  await page.mouse.click(sp.x, sp.y)
  await page.waitForFunction(() => window.__game.flow.talk === 'npc', null, { timeout: 12000 }).catch(() => {})
  await page.waitForTimeout(400)
  const met = await game(page, () => ({ talk: window.__game.flow.talk, modal: window.__game.flow.modal, line: window.__game.talk.line?.id ?? '', bubble: !!document.querySelector('.dialog .bubble'), t: window.__game.zone().sim.time }))
  await page.waitForTimeout(400)
  const running = await game(page, () => window.__game.zone().sim.time)
  check('clicking a shopkeeper walks up to them and starts a conversation: a speech bubble, no window, the world keeps running',
    met.talk === 'npc' && met.modal === '' && met.bubble && met.line === 'dlg.sunfordSmith.hello.1' && running > met.t, JSON.stringify(met))
  await shot(page, 'play-5-talk')
  let said = await talkThrough(page)
  const topics = await page.evaluate(() => [...document.querySelectorAll('[data-choice]')].map(el => el.dataset.choice))
  check('the greeting ends in a list of topics, "End" last', said.phase === 'choices' && topics[0] === 'trade' && topics.at(-1) === 'end', topics.join(','))
  await page.locator('[data-choice="trade"]').click()
  await talkThrough(page)
  await page.waitForFunction(() => window.__game.flow.modal === 'shop', null, { timeout: 8000 }).catch(() => {})
  let modal = await game(page, () => window.__game.flow.modal)
  check('"Show me your goods" opens the shop', modal === 'shop', modal)
  await shot(page, 'play-5-shop')

  // Buy the cheapest thing on the shelf with real clicks.
  await game(page, () => { window.__game.profile.gold = 5000 })
  const wares = page.locator('.ware:not(.is-owned)')
  const n = await wares.count()
  await wares.first().click()
  await page.waitForTimeout(200)
  const owned0 = await game(page, () => window.__game.profile.inv.items.length)
  await page.locator('.shop__actions button').click()
  await page.waitForTimeout(300)
  const bought = await game(page, () => ({ n: window.__game.profile.inv.items.length, gold: window.__game.profile.gold, last: window.__game.profile.inv.items.at(-1) }))
  check('buying an item takes the gold and puts it in the bag', n > 0 && bought.n === owned0 + 1 && bought.gold < 5000, `${bought.last}, gold ${bought.gold}`)
  await page.locator('.f-modal__close').click()
  await page.waitForTimeout(500)
  const resumed = await game(page, () => ({ talk: window.__game.flow.talk, modal: window.__game.flow.modal, line: window.__game.talk.line?.id ?? '' }))
  check('closing the shop returns to the conversation (a parting line)', resumed.talk === 'npc' && resumed.modal === '' && resumed.line === 'dlg.sunfordSmith.shopBack.1', JSON.stringify(resumed))
  await endTalk(page)
  const left = await game(page, () => ({ talk: window.__game.flow.talk, modal: window.__game.flow.modal }))
  check('Escape ends the conversation (and does not open the pause menu)', left.talk === '' && left.modal === '', JSON.stringify(left))
  await page.waitForTimeout(500)

  // The bag: equip it.
  await page.locator('.menu-buttons button[aria-label="Bag"]').click()
  await page.waitForFunction(() => window.__game.flow.modal === 'inventory', null, { timeout: 5000 })
  await page.locator(`.bag__grid .cell[aria-label]`).last().waitFor()
  // Pick a new item (it carries the "new" dot) and equip it.
  const worn0 = await game(page, () => JSON.stringify(window.__game.profile.inv.equipped))
  const fresh0 = await game(page, () => window.__game.profile.inv.fresh.length)
  await page.locator('.bag__grid .cell:has(.cell__new)').first().click()
  await page.waitForTimeout(200)
  const fresh1 = await game(page, () => window.__game.profile.inv.fresh.length)
  check('looking at a new item clears its "new" dot', fresh1 === fresh0 - 1, fresh0 + ' → ' + fresh1)
  const equipBtn = page.locator('.bag__actions button').last()
  const canEquip = !(await equipBtn.isDisabled())
  if (canEquip) await equipBtn.click()
  await page.waitForTimeout(300)
  const worn1 = await game(page, () => JSON.stringify(window.__game.profile.inv.equipped))
  check('the bag equips it (or refuses an item above the hero level)', canEquip ? worn1 !== worn0 : worn1 === worn0, canEquip ? worn1 : 'too high a level')
  await shot(page, 'play-6-bag')

  // The character tab: spend a point with "+".
  await page.locator('.f-tabs__tab').first().click()
  await page.waitForFunction(() => window.__game.flow.modal === 'character', null, { timeout: 5000 })
  const pts = await game(page, () => ({ points: window.__game.profile.hero.points, str: window.__game.profile.hero.attrs.str }))
  await page.locator('.attr__plus').first().click()
  await page.waitForTimeout(200)
  const pts2 = await game(page, () => ({ points: window.__game.profile.hero.points, str: window.__game.profile.hero.attrs.str }))
  check('"+" on the character sheet spends a point on Strength', pts.points > 0 && pts2.points === pts.points - 1 && pts2.str === pts.str + 1, `points ${pts.points}→${pts2.points}`)
  await shot(page, 'play-7-sheet')
  await page.locator('.f-modal__close').click()
  await page.waitForTimeout(400)

  // The trainer: learn Fireball, and find it slotted.
  const tr = await game(page, () => { const z = window.__game.zone(); const n = z.sim.units.find(u => u.npc === 'trainerPyro'); const u = z.sim.hero.unit; u.x = n.x + 0.5; u.z = n.z + 5; return { x: n.x, z: n.z, h: n.h } })
  await page.waitForTimeout(500)
  const tp = await project(page, tr.x, tr.h * 0.5, tr.z)
  await page.mouse.click(tp.x, tp.y)
  await page.waitForFunction(() => window.__game.flow.talk === 'npc', null, { timeout: 12000 }).catch(() => {})
  said = await talkThrough(page)
  await page.keyboard.press('Digit1')
  await talkThrough(page)
  await page.waitForFunction(() => window.__game.flow.modal === 'trainer', null, { timeout: 8000 }).catch(() => {})
  modal = await game(page, () => window.__game.flow.modal)
  check('a trainer is talked to, and "Teach me" (key 1) opens their six skills', said.phase === 'choices' && modal === 'trainer' && await page.locator('.lesson').count() === 6, modal)
  await page.locator('.lesson').first().click()
  await page.waitForTimeout(200)
  await page.locator('.trainer__actions button').click()
  await page.waitForTimeout(300)
  const learned = await game(page, () => ({ learned: [...window.__game.profile.hero.learned], active: [...window.__game.profile.hero.active] }))
  check('learning Fireball costs gold and slots it next to Shield Slam', learned.learned.includes('fireball') && learned.active[1] === 'fireball', learned.active.join(','))
  await shot(page, 'play-8-trainer')
  await page.locator('.f-modal__close').click()
  await page.waitForTimeout(500)
  await endTalk(page)
  await page.waitForTimeout(400)

  // Reload: everything is still there, and the game boots as a returning player.
  const saved = await game(page, async () => {
    const s = await import('/src/use/useSaveStatus.ts'); await s.flushSaveNow()
    const p = window.__game.profile
    return { level: p.level, gold: p.gold, items: [...p.inv.items], learned: [...p.hero.learned], str: p.hero.attrs.str, cleared: [...p.world.cleared], keys: Object.keys(localStorage).filter(k => k.startsWith('bc')) }
  })
  check('the device holds ONE save entry for the game: bcross_state', saved.keys.filter(k => k !== 'bcross_state' && !k.startsWith('bcross_')).length === 0 && saved.keys.includes('bcross_state'), saved.keys.join(','))
  await page.reload({ waitUntil: 'load' })
  await page.waitForFunction(() => window.__game && window.__game.app.mode && window.__game.hud.phase !== 'boot', null, { timeout: 90000 })
  await page.waitForTimeout(500)
  const back = await game(page, () => { const p = window.__game.profile; return { screen: window.__game.flow.screen, node: window.__game.flow.node, level: p.level, gold: p.gold, items: [...p.inv.items], learned: [...p.hero.learned], str: p.hero.attrs.str, cleared: [...p.world.cleared] } })
  check('after a reload the player is a RETURNING player: in their town, not in the opening fight', back.screen === 'town' && back.node === 'sunford', `${back.screen}/${back.node}`)
  check('level, gold, bag, skills, attributes and the map survived the reload',
    back.level === saved.level && back.gold === saved.gold && back.items.join() === saved.items.join() && back.learned.join() === saved.learned.join() && back.str === saved.str && back.cleared.join() === saved.cleared.join())
  check('no console errors during the whole play-through', b.errors.length === 0, [...new Set(b.errors)].slice(0, 3).join(' | '))
  await b.ctx.close()
}

// ═════════════════════════════════════════════════════════════════════════════
const playTouch = async () => {
  console.log('\ntouch — a phone')
  const b = await open({ w: 390, h: 780, touch: true })
  const { page, cdp } = b
  const dev = await game(page, () => ({ device: window.__game.hud.device, home: [window.__game.input.joyHomeX, window.__game.input.joyHomeY, window.__game.input.joyHomeR] }))
  check('the phone gets the touch controls and a resting stick', dev.device === 'touch' && dev.home[2] > 20, JSON.stringify(dev))

  // The stick: press its home, drag up.
  const p0 = await heroPos(page)
  const end = await touchDrag(cdp, { x: dev.home[0], y: dev.home[1] }, { x: dev.home[0], y: dev.home[1] - 60 }, 8, 900)
  const mid = await game(page, () => ({ active: window.__game.input.joyActive, moveY: window.__game.input.moveY, held: window.__game.input.held, phase: window.__game.hud.phase, modal: window.__game.flow.modal, paused: window.__game.app.suspended ?? null }))
  await end()
  await page.waitForTimeout(200)
  const p1 = await heroPos(page)
  check('dragging the stick up walks the hero up the screen', mid.active && mid.moveY > 0.5 && p1.z < p0.z - 1, `Δz ${(p1.z - p0.z).toFixed(1)}, stick ${JSON.stringify(mid)}`)
  const rest = await game(page, () => ({ active: window.__game.input.joyActive, moveY: window.__game.input.moveY }))
  check('letting go stops him', !rest.active && rest.moveY === 0)

  // Tap an enemy. (The pack is made sturdy so it outlasts the checks below.)
  await nearFirstPack(page, 4.5)
  await game(page, () => { for (const e of window.__game.zone().sim.units) if (e.team === 1) { e.s.maxHp *= 60; e.hp = e.s.maxHp } })
  await page.waitForTimeout(900)
  const foe = await nearestFoe(page)
  const fp = await project(page, foe.x, foe.h * 0.5, foe.z)
  await page.touchscreen.tap(fp.x, fp.y)
  await page.waitForTimeout(400)
  const order = await game(page, () => window.__game.zone().sim.hero.order)
  check('tapping an enemy locks it', order.kind === 'attack', JSON.stringify(order))

  // Drag from the hero onto an enemy (the GDD's line): locks that one.
  const others = await game(page, (id) => window.__game.zone().sim.units.filter(u => u.alive && u.team === 1 && u.awake && u.id !== id).map(u => ({ id: u.id, x: u.x, z: u.z, h: u.h })), foe.id)
  if (others.length) {
    const hp = await heroPos(page)
    const from = await project(page, hp.x, 0.5, hp.z)
    const to = await project(page, others[0].x, others[0].h * 0.5, others[0].z)
    const up = await touchDrag(cdp, from, to, 10, 120)
    const dragging = await game(page, () => window.__game.input.dragging)
    await up()
    await page.waitForTimeout(300)
    const o2 = await game(page, () => window.__game.zone().sim.hero.order)
    check('dragging a line from the hero onto another enemy re-targets it', dragging && o2.kind === 'attack' && o2.targetId === others[0].id, JSON.stringify(o2))
  }

  // A skill tapped (with a live enemy locked: the earlier ones may have fallen).
  await page.waitForTimeout(800)
  const live = await nearestFoe(page)
  const lp = await project(page, live.x, live.h * 0.5, live.z)
  await page.touchscreen.tap(lp.x, lp.y)
  await page.waitForTimeout(1200)
  const btn = await page.locator('[data-skill-slot="0"]').boundingBox()
  await game(page, () => { const h = window.__game.zone().sim.hero; h.cd[0] = 0; h.unit.mana = h.unit.s.maxMana; window.__den = []; const z = window.__game.zone(); const em = z.sim.emit.bind(z.sim); z.sim.emit = (e) => { if (e.t === 'denied' || e.t === 'cast') window.__den.push(e.t + ':' + (e.why ?? e.skill)); em(e) } })
  await page.touchscreen.tap(btn.x + btn.width / 2, btn.y + btn.height / 2)
  await page.waitForTimeout(700)
  const tapped = await game(page, () => { const h = window.__game.zone().sim.hero; return { cd: h.cd[0], order: h.order.kind, act: h.unit.action?.id ?? null, st: h.unit.statuses.map(x => x.id), alive: h.unit.alive, ended: window.__game.zone().sim.ended, skills: h.skills, hud: window.__game.hud.skills[0], ev: window.__den } })
  check('tapping the skill button casts it', tapped.cd > 0, JSON.stringify(tapped))

  // A ground skill dragged from its button onto the field.
  await game(page, async () => {
    const g = window.__game; const h = g.zone().sim.hero
    h.skills[1] = 'flamePillar'; h.cd[1] = 0; h.unit.s.maxMana = 200; h.unit.mana = 200
  })
  await page.waitForFunction(() => document.querySelector('[data-skill-slot="1"]'), null, { timeout: 5000 })
  const b1 = await page.locator('[data-skill-slot="1"]').boundingBox()
  const foe3 = await nearestFoe(page)
  const aimAt = await project(page, foe3.x, 0, foe3.z)
  const release = await touchDrag(cdp, { x: b1.x + b1.width / 2, y: b1.y + b1.height / 2 }, aimAt, 10, 150)
  const aiming = await game(page, () => ({ slot: window.__game.input.aimSlot, live: window.__game.input.aimLive }))
  await shot(page, 'touch-1-aim')
  await release()
  await page.waitForTimeout(900)
  const cast = await game(page, () => ({ cd: window.__game.zone().sim.hero.cd[1], fields: window.__game.zone().sim.fields.length, slot: window.__game.input.aimSlot }))
  check('dragging a skill off its button aims it (the preview follows the finger)', aiming.slot === 1 && aiming.live, JSON.stringify(aiming))
  check('letting go over the field casts it there', cast.cd > 0 && cast.slot === -1, `cd ${cast.cd.toFixed(1)}, fields ${cast.fields}`)
  await shot(page, 'touch-2-cast')

  // The potion.
  await game(page, () => { const u = window.__game.zone().sim.hero.unit; u.hp = u.s.maxHp * 0.3 })
  const pb = await page.locator('[data-potion]').boundingBox()
  await page.touchscreen.tap(pb.x + pb.width / 2, pb.y + pb.height / 2)
  await page.waitForTimeout(400)
  const pot = await game(page, () => ({ left: window.__game.zone().sim.hero.potions, hp01: window.__game.zone().sim.hero.unit.hp / window.__game.zone().sim.hero.unit.s.maxHp }))
  check('tapping the potion drinks one', pot.left === 2 && pot.hp01 > 0.5, `${pot.left} left, ${(pot.hp01 * 100).toFixed(0)} % health`)
  check('no console errors', b.errors.length === 0, [...new Set(b.errors)].slice(0, 3).join(' | '))
  await b.ctx.close()
}

// ═════════════════════════════════════════════════════════════════════════════
const VIEWPORTS = [
  { name: 'phone portrait 320×658', w: 320, h: 658, touch: true },
  { name: 'phone landscape 658×320', w: 658, h: 320, touch: true },
  { name: 'tablet 768×1024', w: 768, h: 1024, touch: true },
  { name: 'laptop 1366×768', w: 1366, h: 768, touch: false },
  { name: 'desktop 1920×1080', w: 1920, h: 1080, touch: false }
]
const HUD = [['hero frame', '.hero-frame'], ['corner menu', '.hud-menu'], ['zone status', '.top-status .zone'], ['skill bar', '.skill-bar'], ['stick', '.stick__base']]
const TOWN = [['hero frame', '.hero-frame'], ['corner menu', '.hud-menu'], ['menu buttons', '.hud__br .menu-buttons'], ['stick', '.stick__base']]
const MAPUI = [['top bar', '.wmap__top'], ['sheet', '.wmap__sheet'], ['bottom bar', '.wmap__bottom']]

const layout = async () => {
  console.log('\nlayout — every size')
  for (const v of VIEWPORTS) {
    const b = await open(v)
    const { page } = b
    // The fight HUD, with six skills on the bar and a target locked (the fullest it gets).
    await game(page, () => {
      const g = window.__game; const h = g.zone().sim.hero
      h.skills = ['shieldSlam', 'fireball', 'flamePillar', 'royalGuard', 'stoneSpike', 'aetherPistol']
    })
    await nearFirstPack(page, 4.5)
    await page.waitForTimeout(1200)
    const hud = await rectsOf(page, [...HUD, ['~slot', '.skill-bar .slot']])
    const slots = hud.rects.filter(r => r.label.startsWith('~slot'))
    const hudBad = layoutProblems({ ...hud, rects: hud.rects.filter(r => !r.label.startsWith('~slot')) })
    check(`${v.name}: fight HUD — nothing overlaps, nothing leaves the screen`, hudBad.length === 0, hudBad.join('; '))
    const small = slots.filter(r => r.w < 43.5 || r.h < 43.5)
    check(`${v.name}: all ${slots.length} skill buttons and both flasks are at least 44 px`, slots.length === 8 && small.length === 0, small.map(r => `${Math.round(r.w)}×${Math.round(r.h)}`).join(','))
    const slotOverlap = slots.some((a, i) => slots.some((c, j) => j > i && overlaps(a, c)))
    check(`${v.name}: the skill buttons do not overlap each other`, !slotOverlap)
    await shot(page, `layout-${v.w}x${v.h}-fight`)

    // Results, then the map.
    await winZone(page)
    await page.waitForFunction(() => window.__game.flow.modal === 'results', null, { timeout: 20000 })
    await page.waitForTimeout(600)
    const modal = await page.evaluate(() => {
      const r = (sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, b: b.bottom, r: b.right } }
      const content = document.querySelector('.f-modal__content')
      const first = content?.firstElementChild?.getBoundingClientRect()
      return { frame: r('.f-modal__frame'), header: r('.f-modal__ribbon-body'), footer: r('.f-modal__footer'), firstTop: first?.top ?? 0, vw: innerWidth, vh: innerHeight, scrolls: content ? content.scrollHeight > content.clientHeight + 1 : false }
    })
    const inView = modal.frame && modal.frame.x >= 0 && modal.frame.r <= modal.vw + 1 && modal.frame.y >= 0 && modal.frame.b <= modal.vh + 1 && modal.header.y >= 0
    check(`${v.name}: the result window fits the screen (its own content scrolls if it must)`, !!inView, modal.frame ? `${Math.round(modal.frame.w)}×${Math.round(modal.frame.h)} at ${Math.round(modal.frame.x)},${Math.round(modal.frame.y)}` : 'no frame')
    check(`${v.name}: the window's title ribbon does not cover its content`, modal.header.b <= modal.firstTop + 1, `ribbon ends ${Math.round(modal.header.b)}, content starts ${Math.round(modal.firstTop)}`)
    await shot(page, `layout-${v.w}x${v.h}-results`)
    await page.locator('.f-modal__footer button').last().click({ force: true })
    await page.waitForFunction(() => window.__game.flow.screen === 'map', null, { timeout: 15000 })
    await page.waitForTimeout(500)
    const map = await rectsOf(page, [...MAPUI, ['~world', '.wmap__world'], ['~node', '.node']])
    const mapBad = layoutProblems({ ...map, rects: map.rects.filter(r => !r.label.startsWith('~')) })
    check(`${v.name}: world map — bars and sheet do not overlap or leave the screen`, mapBad.length === 0, mapBad.join('; '))
    // The drawn sheet keeps its shape: on a screen too small for it, it is
    // larger than the table it lies on and pans. The places are held to the
    // SHEET, and the one the hero stands at must be in view on the table.
    const sheet = map.rects.find(r => r.label === 'sheet')
    const world = map.rects.find(r => r.label === '~world')
    const nodes = map.rects.filter(r => r.label.startsWith('~node'))
    const within = (n, box) => n.x >= box.x - 1 && n.y >= box.y - 1 && n.x + n.w <= box.x + box.w + 1 && n.y + n.h <= box.y + box.h + 1
    const outside = world ? nodes.filter(n => !within(n, world)) : nodes
    const nodeClash = nodes.some((a, i) => nodes.some((c, j) => j > i && overlaps(a, c, 2)))
    const here = await page.evaluate(() => { const r = document.querySelector('.node.is-here')?.getBoundingClientRect(); return r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null })
    check(`${v.name}: all ${nodes.length} places sit on the map sheet, none on top of another, each at least 44 px; the hero's place is in view`, nodes.length === 16 && outside.length === 0 && !nodeClash && nodes.every(n => n.w >= 43.5 && n.h >= 43.5) && !!here && within(here, sheet), `${outside.length} off the sheet${nodeClash ? ', overlapping' : ''}, smallest ${Math.round(Math.min(...nodes.map(n => n.w)))}${here && within(here, sheet) ? '' : ', the hero\'s place is out of view'}`)
    await shot(page, `layout-${v.w}x${v.h}-map`)

    // The town HUD and the widest menu (the hero's tabs).
    await game(page, () => window.__game.travel('sunford'))
    await page.waitForFunction(() => window.__game.flow.screen === 'town' && !window.__game.flow.loading && window.__game.zone(), null, { timeout: 60000 })
    await page.waitForTimeout(700)
    const town = await rectsOf(page, TOWN)
    const townBad = layoutProblems(town)
    check(`${v.name}: town HUD — nothing overlaps, nothing leaves the screen`, townBad.length === 0, townBad.join('; '))
    await game(page, () => { window.__game.flow.modal = 'character' })
    await page.waitForTimeout(600)
    const hero = await page.evaluate(() => {
      const f = document.querySelector('.f-modal__frame')?.getBoundingClientRect()
      const tabs = [...document.querySelectorAll('.f-tabs__tab')].map(t => t.getBoundingClientRect())
      const plus = [...document.querySelectorAll('.attr__plus')].map(t => t.getBoundingClientRect())
      return { fx: f?.left ?? -1, fr: f?.right ?? 1e9, fb: f?.bottom ?? 1e9, fy: f?.top ?? -1, vw: innerWidth, vh: innerHeight, tabsIn: tabs.every(t => t.left >= -1 && t.right <= innerWidth + 1 && t.top >= -1), plusMin: Math.min(...plus.map(p => Math.min(p.width, p.height))), n: plus.length }
    })
    check(`${v.name}: the hero window and its three tabs fit; the six "+" buttons are at least 40 px`, hero.fx >= -1 && hero.fr <= hero.vw + 1 && hero.fb <= hero.vh + 1 && hero.tabsIn && hero.n === 6 && hero.plusMin >= 39.5, `frame ${Math.round(hero.fx)}..${Math.round(hero.fr)} of ${hero.vw}, "+" ${Math.round(hero.plusMin)} px`)
    await shot(page, `layout-${v.w}x${v.h}-sheet`)
    check(`${v.name}: no console errors`, b.errors.length === 0, [...new Set(b.errors)].slice(0, 2).join(' | '))
    await b.ctx.close()
  }
}

// ═════════════════════════════════════════════════════════════════════════════
try {
  await startServer()
  if (!ONLY || ONLY === 'play') await playDesktop()
  if (!ONLY || ONLY === 'touch') await playTouch()
  if (!ONLY || ONLY === 'layout') await layout()
} catch (e) {
  check('the run itself', false, String(e?.stack ?? e).slice(0, 500))
} finally {
  stopServer()
}
const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length} / ${results.length} checks passed`)
if (failed.length) console.log('failed:\n' + failed.map(f => '  - ' + f.name).join('\n'))
process.exit(failed.length ? 1 : 0)
