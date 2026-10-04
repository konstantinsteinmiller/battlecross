// voice-todo.md: every voice line with the state of its recording, rendered
// by src/game/audio/voiceTodo.ts (the test that keeps the file current renders
// the same text). Written by `pnpm voice:script` and after every voice:gen run.

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { MANIFEST, ROOT, VOICE_OUT, VO_SRC, voiceOf } from './lib.mjs'
import { textHashOf } from './stale.mjs'

const { renderVoiceTodo, todoLinesOf, voiceFileId } = await import(pathToFileURL(join(ROOT, 'src/game/audio/voiceTodo.ts')).href)

/** The file names (no extension) in public/audio/voice/<lang>/. */
export const voiceFilesOf = (lang) => {
  const dir = join(VOICE_OUT, lang)
  return new Set(existsSync(dir) ? readdirSync(dir).filter(f => /\.(ogg|mp3|m4a)$/i.test(f)).map(voiceFileId) : [])
}

export const writeVoiceTodo = () => {
  const shippedFile = join(VO_SRC, 'shipped.json')
  const lines = todoLinesOf(MANIFEST.lines, voiceOf, textHashOf)
  const md = renderVoiceTodo({
    lines,
    shipped: existsSync(shippedFile) ? JSON.parse(readFileSync(shippedFile, 'utf8')) : {},
    files: voiceFilesOf('en')
  })
  const out = join(ROOT, 'voice-todo.md')
  writeFileSync(out, md)
  console.log(`${relative(ROOT, out)}: ${lines.length} lines`)
}
