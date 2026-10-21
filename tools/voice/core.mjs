// The core voice lines of the core-only languages, and the languages voiced in
// full (data/voice-core.json, resolved by src/game/audio/voiceCore.ts against
// the manifest).

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { MANIFEST, ROOT } from './lib.mjs'

const { coreIdsOf, fullLangsOf, voicedIn, voiceBaseId } = await import(pathToFileURL(join(ROOT, 'src/game/audio/voiceCore.ts')).href)

export { voiceBaseId }
export const CORE_SPEC = JSON.parse(readFileSync(join(ROOT, 'data/voice-core.json'), 'utf8'))
/** The core line ids (the girl hero's twins included). */
export const CORE_IDS = new Set(coreIdsOf(CORE_SPEC, MANIFEST.lines.map(l => l.id)))
export const isCoreId = (id) => CORE_IDS.has(id)
/** The languages voiced in full (English first). */
export const FULL_LANGS = fullLangsOf(CORE_SPEC)
/** Whether `lang` voices line `id`: every line in a full language, the core elsewhere. */
export const isVoicedIn = (lang, id) => voicedIn(CORE_SPEC, CORE_IDS, lang, id)
