// ElevenLabs (Eleven v4) through its web app, driven in the voice desk's own
// Chrome (browser.mjs). The free plan is 10,000 credits a month (about that
// many characters), forbids commercial use and asks for attribution; mega-droid
// ships its takes on the owner's call (2026-10-03). A second free account on
// the same machine meets ElevenLabs' paywall at once: that is its abuse check,
// not something to route around.
//
//   pnpm voice:gen --engine elevenlabs --jobs samples
//   pnpm voice:gen --engine elevenlabs --sign-in      (once: opens the plain window)
//
// Voices: one library voice per speaker (VOICES; they speak every language).
// The line's direction goes in front of the text as a v4 audio tag
// ("[worried, quick] Ouch! Careful, Flux!"), in English whatever the line's
// language. The take is read from the app's own stream response (MP3), then
// converted to the WAV the pipeline expects. Paced, one line at a time.

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ffmpeg } from '../post.mjs'
import { existsSync, readFileSync } from 'node:fs'
import { ROOT } from '../lib.mjs'
import { connect, signInWindow, sleep } from './browser.mjs'
import { DE_CAST, DE_FIRST, DE_VOICES } from './elevenlabs-cast.mjs'

const URL = 'https://elevenlabs.io/app/speech-synthesis/text-to-speech'
/** One library voice per speaker (the "My voices" defaults; search finds them by name). */
// ADAPT: none picked for Battlecross yet (it ships with Chatterbox); e.g. { hero: '<library voice name>' }.
export const VOICES = {}
const GAP_MS = 3000
/** Longest one line may take, voice pick to WAV, before the run gives up. */
const LINE_MS = 180000

/**
 * The delivery as a v4 audio tag: the tone word alone ("[cheeky] "). The
 * direction's first clause rode along at first, and the model read it out:
 * "[warm, the score so far, with a hint of pride] One relay lit" came back as
 * "The score so far... One relay lit", and a tag before a short line made it
 * say the line twice (the English run, 2026-10-03). `EL_TAG=clause` brings the
 * clause back for a test.
 */
export const tagFor = (direction, tone) => {
  const first = process.env.EL_TAG === 'clause'
    ? (direction ?? '').replace(/"[^"]*"/g, '').split(/[.:;!?]/)[0].replace(/\s+/g, ' ').trim().toLowerCase()
    : ''
  const parts = [...new Set([tone, first].filter(Boolean).filter(p => p !== 'neutral'))]
  return parts.length ? `[${parts.join(', ').slice(0, 48)}] ` : ''
}

const ready = async (page) => {
  if (!page.url().startsWith(URL)) await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('tts-editor').waitFor({ timeout: 30000 }).catch(() => {
    throw new Error(/sign-in|login/.test(page.url()) ? 'signed out: run with --sign-in' : 'ElevenLabs: the editor did not load')
  })
  await page.locator('[aria-label="Dismiss"]').first().click({ timeout: 800 }).catch(() => {})
}

const setVoice = async (page, name) => {
  const sel = page.getByTestId('tts-voice-selector')
  if ((await sel.innerText()).trim() === name) return
  // DOM clicks throughout: the app's popups and its sticky audio player sit over controls.
  await sel.evaluate((b) => b.click())
  const search = page.getByPlaceholder('Start typing to search...')
  await search.waitFor({ timeout: 10000 })
  await search.fill(name.split(' - ')[0])
  await page.waitForTimeout(2000)
  // The row's "Use" button is labelled "Select <voice name>"; it only shows on hover in a narrow window,
  // so it is clicked through the DOM.
  const use = page.locator(`button[aria-label=${JSON.stringify(`Select ${name}`)}]`).first()
  await use.waitFor({ state: 'attached', timeout: 10000 })
  await use.evaluate((b) => b.click())
  await page.waitForTimeout(1200)
  if (await search.isVisible().catch(() => false)) await page.keyboard.press('Escape')
  if ((await sel.innerText()).trim() !== name) throw new Error(`ElevenLabs: could not select the voice "${name}"`)
}

/** Type the line, generate, and return the MP3 the app streams back. */
const speak = async (page, text) => {
  const editor = page.getByTestId('tts-editor')
  // The app's own "Clear text" (select-all + delete leaves the rich editor's earlier block behind).
  const clear = page.locator('button[aria-label="Clear text"]')
  if (await clear.count()) await clear.first().evaluate((b) => b.click())
  await page.waitForTimeout(300)
  const field = editor.locator('[contenteditable=true]').first().or(editor).first()
  await field.focus()
  await page.keyboard.insertText(text)
  await page.waitForTimeout(300)
  let typed = (await editor.innerText()).replace(/\s+/g, ' ').trim()
  if (!typed) {
    // Pip's German welcome never landed (2026-10-03): something kept the
    // focus after the voice pick. Shut any popup, click into the box, type again.
    await page.keyboard.press('Escape')
    await field.click({ force: true }).catch(() => {})
    await field.focus()
    await page.keyboard.insertText(text)
    await page.waitForTimeout(400)
    typed = (await editor.innerText()).replace(/\s+/g, ' ').trim()
  }
  if (typed !== text.replace(/\s+/g, ' ').trim()) throw new Error(`ElevenLabs: the editor holds "${typed.slice(0, 60)}", not the line`)
  const audio = page.waitForResponse(r => r.request().method() === 'POST' && /\/v1\/text-to-(dialogue|speech)\b/.test(r.url()) && /audio/.test(r.headers()['content-type'] ?? ''), { timeout: 90000 })
  await page.getByTestId('tts-generate').evaluate((b) => b.click())
  const res = await audio
  if (!res.ok()) throw new Error(`ElevenLabs ${res.status()}: ${(await res.text().catch(() => '')).slice(0, 160)}`)
  return res.body()
}

// ── By API key (preferred, roadmap #219): the German cast of elevenlabs-cast.mjs ──────────────────────────
/** KEY=VALUE from the environment or .env.voice.local (never printed). */
const envKey = (name) => {
  if (process.env[name]) return process.env[name]
  const p = join(ROOT, '.env.voice.local')
  if (!existsSync(p)) return ''
  const line = readFileSync(p, "utf8").split(String.fromCharCode(10)).find(l => l.trim().startsWith(`${name}=`))
  return line ? line.slice(line.indexOf('=') + 1).trim().replace(/^"|"$/g, '') : ''
}
const KEY = envKey('ELEVENLABS_API_KEY')
const MODEL = process.env.EL_MODEL ?? 'eleven_multilingual_v2'
/** The credits this run may spend (1 credit a character on the multilingual model): EL_BUDGET, default all. */
const BUDGET = Number(process.env.EL_BUDGET ?? Infinity)
/** Delivery by tone: [stability (steady ↔ lively), style (exaggeration)]. */
const SETTINGS = {
  neutral: [0.5, 0.15], calm: [0.62, 0.1], warm: [0.5, 0.2], cheeky: [0.4, 0.3], excited: [0.34, 0.4], urgent: [0.34, 0.35],
  shout: [0.3, 0.5], whisper: [0.62, 0.1], menacing: [0.42, 0.35], sad: [0.5, 0.25], deadpan: [0.66, 0.05], pained: [0.34, 0.4], laugh: [0.34, 0.4]
}
const voiceSettings = (tone) => {
  const [stability, style] = SETTINGS[tone] ?? SETTINGS.neutral
  return { stability, similarity_boost: 0.8, style, use_speaker_boost: true }
}
/** Speakers meant to come first when the budget is short: the tutorial path. */
const rank = (speaker) => { const i = DE_FIRST.indexOf(speaker); return i < 0 ? DE_FIRST.length : i }

const synthApi = async (items) => {
  const out = new Array(items.length)
  const order = items.map((it, i) => i).sort((x, y) => rank(items[x].job.speaker) - rank(items[y].job.speaker) || x - y)
  let spent = 0
  let stop = ''
  for (const i of order) {
    const it = items[i]
    const text = it.text
    if (stop) { out[i] = { ok: false, error: `skipped: ${stop}` }; continue }
    if (spent + text.length > BUDGET) { out[i] = { ok: false, error: 'skipped: over the credit budget (EL_BUDGET)' }; continue }
    const t0 = Date.now()
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${it.voice.id}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: MODEL, voice_settings: voiceSettings(it.tone), seed: it.seed })
      })
      if (!res.ok) {
        const body = (await res.text()).replace(/sk_\w+/g, 'sk_***').slice(0, 200)
        if ([401, 402, 403, 429].includes(res.status)) stop = `ElevenLabs ${res.status}: ${body}`
        throw new Error(`ElevenLabs ${res.status}: ${body}`)
      }
      spent += Number(res.headers.get('character-cost') ?? text.length)
      const mp3 = it.raw.replace(/\.wav$/, '.mp3')
      writeFileSync(mp3, Buffer.from(await res.arrayBuffer()))
      await ffmpeg(['-i', mp3, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', it.raw])
      out[i] = { ok: true, wall: (Date.now() - t0) / 1000 }
    } catch (e) {
      out[i] = { ok: false, error: e.message.split('\n')[0] }
    }
  }
  console.log(`  ElevenLabs credits spent this run: ${spent}${Number.isFinite(BUDGET) ? ` of a budget of ${BUDGET}` : ''}`)
  return out
}

/** The web app route (no key): the voice desk's own Chrome. */
const synthWeb = async (items) => {
  const { page, close } = await connect(URL)
  const tmp = mkdtempSync(join(tmpdir(), 'el-'))
  const out = new Array(items.length)
  try {
    await ready(page)
    // Grouped by voice: the voice is picked once per speaker.
    const order = items.map((it, i) => [it, i]).sort((x, y) => x[0].voice.id.localeCompare(y[0].voice.id))
    for (const [it, i] of order) {
      try {
        // A window closed mid-run left every call waiting for ever: stop instead.
        if (page.isClosed()) throw new Error('browser closed: run again')
        let timer
        const line = (async () => {
          await setVoice(page, it.voice.id)
          const mp3 = join(tmp, `${i}.mp3`)
          writeFileSync(mp3, await speak(page, tagFor(it.directionEn ?? it.direction, it.tone) + it.text))
          await ffmpeg(['-i', mp3, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', it.raw])
        })()
        const stuck = new Promise((_, no) => { timer = setTimeout(() => no(new Error('browser stuck: no take in 3 minutes, run again')), LINE_MS) })
        await Promise.race([line, stuck]).finally(() => clearTimeout(timer))
        out[i] = { ok: true }
      } catch (e) {
        out[i] = { ok: false, error: e.message.split('\n')[0] }
        if (/signed out|quota|credit|limit|browser closed|browser stuck|Target.*closed|has been closed/i.test(e.message)) { for (const [, j] of order) out[j] ??= { ok: false, error: 'skipped: ' + out[i].error }; break }
        await page.goto(URL, { waitUntil: 'domcontentloaded' }).catch(() => {})
        await ready(page).catch(() => {})
      }
      await sleep(GAP_MS + Math.random() * 1500)
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
    await close() // detaches; the window stays for the next run
  }
  return out
}

export default {
  name: 'elevenlabs',
  label: KEY ? `ElevenLabs ${MODEL} (API)` : 'ElevenLabs Eleven v4 (web app, browser)',
  signIn: () => signInWindow(URL),
  async voice({ speaker, lang }) {
    if (KEY) {
      const name = lang === 'de' ? DE_CAST[speaker] : null
      if (!name) throw new Error(`ElevenLabs: no ${lang} voice for "${speaker}" yet; add it to elevenlabs-cast.mjs`)
      return { id: DE_VOICES[name] }
    }
    // A speaker added to the cast later needs its library voice picked by ear first.
    if (!VOICES[speaker]) throw new Error(`ElevenLabs: no library voice for "${speaker}" yet; add one to VOICES`)
    return { id: VOICES[speaker] }
  },
  async synth(items) {
    return KEY ? synthApi(items) : synthWeb(items)
  }
}
