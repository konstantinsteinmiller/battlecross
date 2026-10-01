// Gemini TTS through AI Studio's speech page (aistudio.google.com/generate-
// speech), driven in a Chrome profile of its own — the browser route beside
// the API. It runs on the playground's own free quota (no API key), which is
// what makes it worth having: the API's free tier is 10 requests a day.
//
// SIGNING IN (once): `pnpm voice:gen --engine aistudio --sign-in` opens the
// profile plainly at Google's sign-in (Google refuses sign-in in a window
// with an automation port); sign in, close that window, run again.
//
// Voices: the playground can't design voices on the free tier, so each
// speaker gets one fixed library voice (VOICES) and its card's description
// rides in the style text with the line's direction.

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { ROOT } from '../lib.mjs'

export const PROFILE = process.env.VOICE_DESK_PROFILE ?? join(homedir(), '.voice-desk', 'chrome')
const URL = 'https://aistudio.google.com/generate-speech'
/** One library voice per speaker (Google's studio voices: Kore firm/female, Charon low/male, Puck upbeat/male, Gacrux mature/female). */
export const VOICES = { atlas: 'Kore', vex: 'Charon', flux: 'Puck', gauss: 'Gacrux' }
const GAP_MS = 4000
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome'
].find(p => p && existsSync(p))

const livePort = async () => {
  const f = join(PROFILE, 'DevToolsActivePort')
  if (!existsSync(f)) return null
  const port = readFileSync(f, 'utf8').split('\n')[0].trim()
  try { await fetch(`http://127.0.0.1:${port}/json/version`); return port } catch { return null }
}

/** The plain window for Google's sign-in (no automation port). */
export const signInWindow = () => {
  mkdirSync(PROFILE, { recursive: true })
  spawn(CHROME, [`--user-data-dir=${PROFILE}`, '--no-first-run', '--no-default-browser-check',
    `https://accounts.google.com/ServiceLogin?continue=${encodeURIComponent(URL)}`], { detached: true, stdio: 'ignore' }).unref()
}

const launch = async () => {
  let port = await livePort()
  if (port) return port
  if (!CHROME) throw new Error('No Chrome found: set CHROME_PATH')
  mkdirSync(PROFILE, { recursive: true })
  rmSync(join(PROFILE, 'DevToolsActivePort'), { force: true })
  spawn(CHROME, [`--user-data-dir=${PROFILE}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', URL],
  { detached: true, stdio: 'ignore' }).unref()
  for (let i = 0; i < 80; i++) {
    await sleep(250)
    port = await livePort()
    if (port) return port
  }
  throw new Error(`Chrome opened no DevTools port. Is a sign-in window on ${PROFILE} still open? Close it and run again.`)
}

/** A fresh speech editor: one speech block, the voice panel closed. */
const openEditor = async (page) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000)
  if (/accounts\.google\.com/.test(page.url())) throw new Error('signed out: run with --sign-in')
  await page.locator('button.glue-cookie-notification-bar__accept').click({ timeout: 1500 }).catch(() => {})
  await page.getByText('Create new dialog').first().click()
  await page.getByLabel('Speech block text').waitFor({ timeout: 20000 })
}

const setVoice = async (page, name) => {
  await page.getByRole('button', { name: /^Speaker 1/ }).click()
  await page.getByLabel('Search voices').fill(name)
  await page.waitForTimeout(2000)
  await page.getByRole('button', { name, exact: true }).first().click()
  await page.waitForTimeout(800)
  const close = page.getByRole('button', { name: /Steuerfeld schließen|Close panel|close/i }).first()
  if (await page.getByLabel('Search voices').isVisible().catch(() => false)) await close.click().catch(() => page.keyboard.press('Escape'))
  await page.waitForTimeout(600)
}

const setStyle = async (page, style) => {
  await page.getByRole('button', { name: 'Style' }).first().click()
  const box = page.getByLabel('Describe the voice style')
  await box.waitFor({ timeout: 8000 })
  await box.fill(style)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
}

/** Run the block; resolves with the WAV the page plays (a data: URL on its audio element). */
const run = async (page, text) => {
  const before = await page.locator('audio').evaluateAll(as => as.map(a => a.src))
  await page.getByLabel('Speech block text').fill(text)
  await page.getByRole('button', { name: /^Run/ }).click()
  for (let i = 0; i < 120; i++) {
    await page.waitForTimeout(500)
    const srcs = await page.locator('audio').evaluateAll(as => as.map(a => a.src))
    const fresh = srcs.find(s => s.startsWith('data:audio') && !before.includes(s))
    if (fresh) return Buffer.from(fresh.slice(fresh.indexOf(',') + 1), 'base64')
    const err = await page.locator('ms-error, .error-message, [role=alert], mat-snack-bar-container').allInnerTexts().catch(() => [])
    const msg = err.join(' ').trim()
    if (/quota|limit|exceeded|error|fehler/i.test(msg)) throw new Error(`AI Studio: ${msg.slice(0, 200)}`)
  }
  throw new Error('AI Studio: no audio after 60 s')
}

export default {
  name: 'aistudio',
  label: 'Gemini 3.8 Flash TTS (AI Studio, browser)',
  async voice({ speaker }) {
    return { id: VOICES[speaker] }
  },
  async synth(items) {
    const port = await launch()
    const { chromium } = createRequire(join(ROOT, 'package.json'))('playwright-core')
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`)
    const ctx = browser.contexts()[0] ?? await browser.newContext()
    const page = ctx.pages().find(p => p.url().startsWith('https://aistudio')) ?? await ctx.newPage()
    const out = new Array(items.length)
    try {
      await openEditor(page)
      let voice = null
      // Grouped by voice: the voice is set once per speaker.
      const order = items.map((it, i) => [it, i]).sort((x, y) => x[0].voice.id.localeCompare(y[0].voice.id))
      for (const [it, i] of order) {
        try {
          if (voice !== it.voice.id) { await setVoice(page, it.voice.id); voice = it.voice.id }
          await setStyle(page, `Voice: ${it.card.designPrompt[it.lang]} Delivery: ${it.style}`)
          writeFileSync(it.raw, await run(page, it.text))
          out[i] = { ok: true }
        } catch (e) {
          out[i] = { ok: false, error: e.message.split('\n')[0] }
          if (/quota|limit|signed out/i.test(e.message)) { for (const [, j] of order) out[j] ??= { ok: false, error: 'skipped: ' + out[i].error }; break }
          await openEditor(page).catch(() => {}); voice = null
        }
        await sleep(GAP_MS + Math.random() * 2000)
      }
    } finally {
      await browser.close().catch(() => {}) // disconnects; the window stays for the next run
    }
    return out
  }
}
