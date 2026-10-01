// Shared by the voice-over pipeline (`pnpm voice:*`, tools/voice/): the
// catalogue, the cards, the locales, a line's text, and the folders.
//
// Runs on Node's own TypeScript stripping (`--experimental-strip-types`): the
// catalogue, the cards and the locales are imported straight from src/.

import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const load = async (rel) => import(pathToFileURL(join(ROOT, rel)).href)

export const { VOICE_LINES, SPEAKERS, SCENES, fileName } = await load('src/game/audio/voiceCatalog.ts')
export const { CARDS, TONES } = await load('src/game/audio/voiceCards.ts')
export const LOCALES = {
  en: (await load('src/i18n/locales/en.ts')).default,
  de: (await load('src/i18n/locales/de.ts')).default
}
export const LANGS = ['en', 'de']
const LI = { en: 0, de: 1 }

/** Pipeline work files: sources worth keeping (refs) and caches (gen). */
export const VO_SRC = join(ROOT, 'vo-src')
/** Where the game reads the finished files (`vite.config.ts` lists them). */
export const VOICE_OUT = join(ROOT, 'public', 'audio', 'voice')

export const at = (o, key) => key.split('.').reduce((x, k) => x?.[k], o)

/** `{name}` → the param's text in `lang`; `{NAME}` → the same in capitals. */
export const fill = (s, params, lang) => s.replace(/\{(\w+)\}/g, (m, name) => {
  const ref = params?.[name] ?? params?.[name.toLowerCase()]
  const v = ref ? at(LOCALES[lang], ref) : null
  if (typeof v !== 'string') return m
  return name === name.toUpperCase() ? v.toUpperCase() : v
})

/**
 * The line's text in `lang`, or null when that language has none: the
 * locale's when the key is there (every live line, and the ending's
 * captions), else the draft. A neutral line (barks, laughs) is English only.
 */
export const textOf = (line, lang) => {
  if (line.neutral && lang !== 'en') return null
  const raw = at(LOCALES[lang], line.key) ?? line.draft?.[LI[lang]]
  return typeof raw === 'string' && raw.trim() ? fill(raw, line.params, lang) : null
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
