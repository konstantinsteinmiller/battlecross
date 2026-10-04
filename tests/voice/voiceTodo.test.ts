// voice-todo.md is the voice work's memory: every line of
// data/voice-manifest.json with the state of its English recording. It is
// rendered from the manifest, the shipped files and vo-src/shipped.json
// (src/game/audio/voiceTodo.ts); a new line shows up there as missing, a
// changed one as stale. This keeps the committed file current: when it
// fails, run `pnpm voice:script` (after `pnpm voice:manifest`).

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderVoiceTodo, todoLinesOf, voiceFileId } from '@/game/audio/voiceTodo'
import { voiceOf } from '@/game/audio/voiceCards'
import { textHashOf } from '../../tools/voice/stale.mjs'

const ROOT = resolve(__dirname, '../..')
const manifest = JSON.parse(readFileSync(resolve(ROOT, 'data/voice-manifest.json'), 'utf8'))
const dir = resolve(ROOT, 'public/audio/voice/en')
const files = new Set(existsSync(dir) ? readdirSync(dir).filter(f => /\.(ogg|mp3|m4a)$/i.test(f)).map(voiceFileId) : [])
const shippedFile = resolve(ROOT, 'vo-src/shipped.json')
const shipped = existsSync(shippedFile) ? JSON.parse(readFileSync(shippedFile, 'utf8')) : {}
const lines = todoLinesOf(manifest.lines, voiceOf, textHashOf)

describe('voice-todo.md', () => {
  const md = renderVoiceTodo({ lines, shipped, files })

  it('is current (run `pnpm voice:script` when it is not)', () => {
    const file = readFileSync(resolve(ROOT, 'voice-todo.md'), 'utf8').replace(/\r\n/g, '\n')
    expect(file === md, 'voice-todo.md is stale: run pnpm voice:script').toBe(true)
  })

  it('lists every line, and names a missing or changed recording', () => {
    for (const l of manifest.lines) expect(md, l.id).toContain(`\`${l.id}\``)
    expect(md).toMatch(/## To do \(\d+\)/)
    const one = [{ id: 'dlg.a.1', speaker: 'hero', who: 'The hero', scene: 'hero', text: 'Hi.', hash: 'new' }]
    expect(renderVoiceTodo({ lines: one, shipped: {}, files: new Set() })).toContain('| **missing** |')
    expect(renderVoiceTodo({ lines: one, shipped: { 'en/dlg.a.1': { engine: 'chatterbox', hash: 'old' } }, files: new Set(['dlg.a.1']) })).toContain('| **stale** |')
    expect(renderVoiceTodo({ lines: one, shipped: { 'en/dlg.a.1': { engine: 'chatterbox', hash: 'new' } }, files: new Set(['dlg.a.1']) })).toContain('## To do (0)')
  })

  it('keeps the dots of an id in its file name', () => {
    expect(voiceFileId('dlg.hero.bye.ogg')).toBe('dlg.hero.bye')
    expect(voiceFileId('dlg.hero.bye__f.ogg')).toBe('dlg.hero.bye__f')
  })
})
