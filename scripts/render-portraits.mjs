#!/usr/bin/env node
/**
 * Bakes every Master's portrait (and Vex's) into public/images/masters/.
 *
 *   pnpm dev                                   (any free port)
 *   node scripts/render-portraits.mjs http://localhost:2194/
 *
 * The portraits are the in-mission ones (`models/portrait.ts`: the real rig,
 * a three-quarter turn, the mission's light rig), drawn by the game itself in
 * a headless Chrome and saved as small WebP files. The hub and the outro show
 * these files rather than drawing a rig: drawing one in the lab would compile
 * shader programs the lab never warmed up, and a compile is a stall.
 *
 * Re-run it whenever a boss model changes.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

const BOSSES = ['scrapper', 'blazeMaster', 'frostMaster', 'voltMaster', 'galeMaster', 'magnetMaster',
  'drillMaster', 'tideMaster', 'neonMaster', 'rotorMaster', 'vexMk1']
const url = process.argv[2]
if (!url) {
  console.error('usage: node scripts/render-portraits.mjs <dev server url>')
  process.exit(1)
}
const root = fileURLToPath(new URL('..', import.meta.url))
const out = `${root}public/images/masters`
mkdirSync(out, { recursive: true })
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
try {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
  page.on('console', (m) => { if (m.type() !== 'debug') console.log('[page]', m.text().slice(0, 160)) })
  await page.goto(url, { waitUntil: 'load' })
  if (!/Mega Droid/.test(await page.title())) throw new Error(`${url} is not Mega Droid (title: ${await page.title()})`)
  await page.waitForFunction(async () => (await import('/src/game/engine/renderer.ts')).hasRenderer(), null, { timeout: 30000 })
  for (const id of BOSSES) {
    const dataUrl = await page.evaluate(async (id) => (await import('/src/game/models/portrait.ts')).bossPortrait(id), id)
    if (!dataUrl) throw new Error(`no portrait for ${id}`)
    const png = Buffer.from(dataUrl.split(',')[1], 'base64')
    const webp = await sharp(png).webp({ quality: 82, alphaQuality: 90, effort: 5 }).toBuffer()
    writeFileSync(`${out}/${id}.webp`, webp)
    console.log(`${id}.webp  ${(webp.length / 1024).toFixed(1)} KB`)
  }
} finally {
  await browser.close()
}
