// Shared by the voice-over pipeline (`pnpm voice:*`, tools/voice/): the
// lines, the cards, a line's text, and the folders.
//
// Battlecross keeps ONE source of truth for its spoken lines:
// data/voice-manifest.json, written by `pnpm voice:manifest` from the game's
// dialogue data and the English locale. Every entry is a voice line here, read
// fresh on every run, so a new or changed line can never be missed. The cards
// (src/game/audio/voiceCards.ts) are imported with Node's type stripping
// (`--experimental-strip-types`).

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { hashText, textHashOf } from './stale.mjs'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const load = async (rel) => import(pathToFileURL(join(ROOT, rel)).href)

/**
 * ADAPT (the one block a project edits): where the lines and the voice cards
 * live, which languages get a voice, and where the files go.
 */
const PATHS = {
  manifest: 'data/voice-manifest.json',
  cards: 'src/game/audio/voiceCards.ts',
  // English first; the others are voiced from the game's own locale files
  // (src/i18n/locales/<lang>.ts, same code as the game's: pt = Brazil, zh =
  // simplified). Chatterbox cannot speak Indonesian (id) or Vietnamese (vi):
  // they are not listed, and the game stays silent in them.
  langs: ['en', 'de', 'fr', 'es', 'ru', 'ja', 'pt', 'zh'],
  localeDir: 'src/i18n/locales',
  work: 'vo-src',
  out: 'public/audio/voice'
}

export const { CARDS, TONES, toneOf, directionOf, voiceOf } = await load(PATHS.cards)
export const LANGS = PATHS.langs
/** Languages written without spaces between words: QA compares characters, lengths count characters. */
export const CJK = new Set(['zh', 'ja'])
/** The manifest as `voice:manifest` wrote it (`lines`: id, speaker, who, scene, to, emotion, text, textHash…). */
export const MANIFEST = JSON.parse(readFileSync(join(ROOT, PATHS.manifest), 'utf8'))

/** A line's file name, without the extension: the id itself (dots stay: `dlg.hero.bye.ogg`). */
export const fileName = (key) => key

/** Where the girl hero or a quest scene is, in words, for the situation the model is told. */
const placeOf = (scene) => {
  if (scene === 'hero') return 'in any conversation'
  if (scene.startsWith('quest.')) return `at the end of the ${scene.slice(6).replace(/([A-Z])/g, ' $1').toLowerCase()} quest, a big story choice`
  if (scene.startsWith('smalltalk')) return 'overheard: two townspeople chatting in the street as the hero walks by'
  if (scene === 'intro') return 'narrating the game\'s opening: a legend told over a hero\'s battle, like a film trailer\'s storyteller'
  return 'talking with the hero in town'
}

/** The situation a line is said in: who speaks, to whom, where. */
const whenOf = (l) => {
  const to = l.to ? ` to ${l.to}` : ''
  if (l.speaker === 'hero' || l.speaker === 'heroine') return `${l.who} (the player) says this${to}, ${placeOf(l.scene)}.`
  if (l.speaker === 'narrator') return `The storyteller tells what happened, ${placeOf(l.scene)}.`
  return `${l.who} says this, ${placeOf(l.scene)}.`
}

/** Seconds a line should take at an easy pace (a guide: QA's budget is the longer of this and its words). */
const maxOf = (text) => Math.round((text.split(/\s+/).filter(Boolean).length / 2.6 + 0.8) * 10) / 10

/**
 * Every voice line, in manifest order. `speaker` is the VOICE (the card): the
 * manifest's speaker, except where `voiceOf` gives a line another voice (the
 * child who answers in the children's small talk). `hash` is the text's hash:
 * a shipped file recorded under another hash is stale and is voiced again.
 */
export const VOICE_LINES = MANIFEST.lines.map(l => {
  const line = {
    key: l.id,
    speaker: voiceOf(l),
    role: l.speaker,
    scene: l.scene,
    status: 'live',
    who: l.who,
    emotion: l.emotion,
    when: [whenOf(l)],
    direction: [directionOf(l)],
    max: maxOf(l.text),
    text: l.text,
    hash: textHashOf(l),
    ...(l.variantOf ? { variantOf: l.variantOf } : {})
  }
  return { ...line, tone: toneOf(line) }
})

/** Pipeline work files: sources worth keeping (refs) and caches (gen). */
export const VO_SRC = join(ROOT, PATHS.work)
/** Where the game reads the finished files (`src/game/audio/speech.ts`). */
export const VOICE_OUT = join(ROOT, PATHS.out)

const LOCALES = new Map()
/** A language's messages (src/i18n/locales/<lang>.ts: plain data, read with type stripping). */
const localeOf = async (lang) => {
  if (!LOCALES.has(lang)) LOCALES.set(lang, (await load(`${PATHS.localeDir}/${lang}.ts`)).default)
  return LOCALES.get(lang)
}
for (const l of LANGS) if (l !== 'en') await localeOf(l)
const walk = (o, path) => {
  let cur = o
  for (const k of path.split('.')) { if (cur == null || typeof cur !== 'object') return null; cur = cur[k] }
  return typeof cur === 'string' && cur.trim() ? cur : null
}

/**
 * The line's text in `lang`: English is the manifest's; any other language
 * reads its own locale file at the line's key (a girl-hero take `<id>__f`
 * falls back to the base line, like the game's resolver). Null when the
 * locale has none or the text still holds a {placeholder} (nothing to voice).
 */
export const textOf = (line, lang) => {
  if (lang === 'en') return typeof line.text === 'string' && line.text.trim() ? line.text : null
  const m = LOCALES.get(lang)
  const t = m ? (walk(m, line.key) ?? (line.variantOf ? walk(m, line.variantOf) : null)) : null
  return t && !/[{]/.test(t) ? t : null
}

/** The hash of the text a take of `lang` says: English keeps the manifest's `textHash`. */
export const hashFor = (line, lang, shown) => (lang === 'en' ? line.hash : hashText(shown))

/** The seconds a line should take at an easy pace, from its words (or characters in Chinese and Japanese). */
export const maxFor = (line, lang, shown) => {
  if (lang === 'en') return line.max
  const n = CJK.has(lang) ? [...shown.replace(/[\s\p{P}]/gu, '')].length / 3.2 : shown.split(/\s+/).filter(Boolean).length / 2.6
  return Math.round((n + 0.8) * 10) / 10
}

/** `--name value` / `--flag` from argv. */
export const args = (argv = process.argv.slice(2)) => {
  const o = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) { o._.push(a); continue }
    const [k, v] = a.slice(2).split('=')
    if (v !== undefined) o[k] = v
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) o[k] = argv[++i]
    else o[k] = true
  }
  return o
}

/** `voice:collect --samples`: calm, warm, excited and cold lines across the boy, the girl and two townspeople. */
export const SAMPLE_KEYS = ['dlg.hero.who', 'dlg.hero.who__f', 'dlg.elderMara.hello.1', 'dlg.trainerPyro.again.1', 'dlg.quest.dragon.ask.1']
