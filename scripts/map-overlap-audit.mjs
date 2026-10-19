#!/usr/bin/env node
// ─── World-map overlap audit, in a real browser ─────────────────────────────
//
//   pnpm dev   (VITE_LEADERBOARD_URL= VITE_LEADERBOARD_SECRET= blanked)
//   node scripts/map-overlap-audit.mjs [--url http://localhost:5173] [--locale pl-PL]
//        [--sizes 880x495@1.5,844x390@3] [--shot out.png] [--card] [--exit]
//
// Opens the world map with the late zones open, then measures every pair of
// the goal chip, the corner HUD buttons, the node buttons and labels (and the
// picked place's card) with getBoundingClientRect, once as the raw boxes and
// once as what a finger can reach (the part of a box inside its scroll
// ancestors, topmost at its centre). Own headless Chrome on a private profile.
// --exit makes any overlap a non-zero exit.

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright-core')

const argv = process.argv.slice(2)
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d }
const has = n => argv.includes(`--${n}`)
const URL_ = arg('url', 'http://localhost:5173')
const LOCALE = arg('locale', 'pl-PL')
const SIZES = arg('sizes', '880x495@1.5').split(',').map(s => { const [wh, d = '1'] = s.split('@'); const [w, h] = wh.split('x').map(Number); return { w, h, d: Number(d) } })
const SHOT = arg('shot', '')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

/** Runs in the page: boxes of the named controls, and their pairwise overlaps. */
const audit = () => {
  const rectOf = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }
  /** The box clipped by every scrolling / clipping ancestor: what a finger can reach. */
  const reach = el => {
    let r = el.getBoundingClientRect()
    let l = r.left, t = r.top, rt = r.right, b = r.bottom
    for (let p = el.parentElement; p; p = p.parentElement) {
      const cs = getComputedStyle(p)
      if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
      const pr = p.getBoundingClientRect()
      l = Math.max(l, pr.left); t = Math.max(t, pr.top); rt = Math.min(rt, pr.right); b = Math.min(b, pr.bottom)
    }
    return { x: l, y: t, w: Math.max(0, rt - l), h: Math.max(0, b - t) }
  }
  const name = el => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')}${el.dataset.node ? `[${el.dataset.node}]` : ''} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 28)}"`
  const sel = ['.wmap .goal', '.wmap .f-hud-button', '.wmap .node', '.wmap .node__label', '.wmap .card', '.wmap .card__close', '.wmap .wmap__bottom button', '.wmap .mstick']
  const els = [...new Set(sel.flatMap(s => [...document.querySelectorAll(s)]))]
  const inter = (a, b) => {
    const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
    const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
    if (w <= 1 || h <= 1) return 0
    return (w * h) / Math.max(1, Math.min(a.w * a.h, b.w * b.h))
  }
  const raw = [], seen = []
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
    const a = els[i], b = els[j]
    if (a.contains(b) || b.contains(a)) continue
    // Two nodes' own labels and boxes are the map's art; the audit is about controls and chrome.
    const aNode = a.closest('.node'), bNode = b.closest('.node')
    if (aNode && bNode) continue
    // A place under the open card is covered by design: the card is the modal surface.
    if ((aNode && b.closest('.card')) || (bNode && a.closest('.card'))) continue
    const nodeVsChrome = aNode || bNode
    const chrome = nodeVsChrome ? (aNode ? b : a) : null
    if (nodeVsChrome && !chrome.matches('.goal, .f-hud-button, .card, .card__close, .wmap__bottom button, .mstick')) continue
    const ra = rectOf(a), rb = rectOf(b)
    const f = inter(ra, rb)
    if (f > 0) raw.push({ a: name(a), b: name(b), cover: Math.round(f * 100) })
    const fa = reach(a), fb = reach(b)
    const g = inter(fa, fb)
    if (g > 0) seen.push({ a: name(a), b: name(b), cover: Math.round(g * 100) })
  }
  // Tap-blocking: the centre of every node button must hit the node (or its card-free surroundings), never a control.
  const blocked = []
  for (const n of document.querySelectorAll('.wmap .node')) {
    const r = reach(n)
    if (r.w < 4 || r.h < 4) continue
    const hit = document.elementFromPoint(r.x + r.w / 2, r.y + r.h / 2)
    if (hit && !n.contains(hit) && !hit.closest('.card')) blocked.push({ node: name(n), by: name(hit) })
  }
  return { raw, seen, blocked, vw: innerWidth, vh: innerHeight }
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
let bad = 0
try {
  for (const s of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: s.d, hasTouch: true, isMobile: s.w < 1000, locale: LOCALE })
    await ctx.addInitScript(() => { Element.prototype.requestPointerLock = function () {} })
    const page = await ctx.newPage()
    page.on('pageerror', e => console.log('  pageerror', String(e).slice(0, 200)))
    await page.goto(URL_ + '/?nohmr=1', { waitUntil: 'load' })
    await page.waitForTimeout(2500)
    for (const withCard of has('card') ? [false, true] : [false]) {
      // A dev server reloads the page when a file changes under it: start over then.
      for (let attempt = 1; ; attempt++) {
        try {
          await page.evaluate(async () => {
            const p = await import('/src/game/state/profile.ts')
            const f = await import('/src/game/flow.ts')
            for (const id of ['plains', 'hollows', 'woods', 'crags', 'tundra', 'citadel', 'fortress']) p.clearNode(id)
            p.saveProfile?.()
            f.openMap()
          })
          await page.waitForSelector('.wmap .node', { timeout: 20000 })
          break
        } catch (e) {
          if (attempt >= 4) throw e
          await page.goto(URL_ + '/', { waitUntil: 'load' })
          await page.waitForTimeout(2500)
        }
      }
      await page.waitForTimeout(1200)
      if (withCard) {
        // A real tap on the first open place whose middle is on the sheet.
        const at = await page.evaluate(() => {
          const sh = document.querySelector('.wmap__sheet').getBoundingClientRect()
          for (const n of document.querySelectorAll('.wmap .node:not(.is-locked)')) {
            const r = n.getBoundingClientRect()
            const x = r.left + r.width / 2, y = r.top + r.height / 2
            if (x > sh.left + 8 && x < sh.right - 8 && y > sh.top + 8 && y < sh.bottom - 8 && n.contains(document.elementFromPoint(x, y))) return [x, y]
          }
          return null
        })
        if (at) await page.touchscreen.tap(at[0], at[1])
        // The card slides in: measure it where it comes to rest.
        await page.waitForSelector('.wmap .card')
        await page.waitForFunction(() => document.querySelector('.wmap .card').getAnimations().length === 0)
        await page.waitForTimeout(300)
      }
      const r = await page.evaluate(audit)
      const tag = `${s.w}x${s.h}@${s.d} ${LOCALE}${withCard ? ' +card' : ''}`
      console.log(`\n== ${tag}  raw:${r.raw.length} reachable:${r.seen.length} tap-blocked:${r.blocked.length}`)
      for (const o of r.raw) console.log('  raw  ', o.cover + '%', o.a, '<>', o.b)
      for (const o of r.seen) console.log('  REACH', o.cover + '%', o.a, '<>', o.b)
      for (const o of r.blocked) console.log('  BLOCK', o.node, 'under', o.by)
      bad += r.seen.length + r.blocked.length + r.raw.length
      if (SHOT) await page.screenshot({ path: SHOT.replace(/(\.\w+)$/, `-${s.w}x${s.h}${withCard ? '-card' : ''}$1`) })
    }
    await ctx.close()
  }
} finally {
  await browser.close()
}
if (has('exit') && bad) process.exit(1)
