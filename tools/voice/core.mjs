// The core voice lines of the non-English languages (data/voice-core.json,
// resolved by src/game/audio/voiceCore.ts against the manifest).

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { MANIFEST, ROOT } from './lib.mjs'

const { coreIdsOf, voiceBaseId } = await import(pathToFileURL(join(ROOT, 'src/game/audio/voiceCore.ts')).href)

export { voiceBaseId }
export const CORE_SPEC = JSON.parse(readFileSync(join(ROOT, 'data/voice-core.json'), 'utf8'))
/** The core line ids (the girl hero's twins included). */
export const CORE_IDS = new Set(coreIdsOf(CORE_SPEC, MANIFEST.lines.map(l => l.id)))
export const isCoreId = (id) => CORE_IDS.has(id)
