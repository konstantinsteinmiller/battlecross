// A recording must say what its line says now. Every file `voice:gen` ships
// is booked in vo-src/shipped.json with the hash of the text it was voiced
// from; this fails, naming the lines, when a line's text in
// data/voice-manifest.json changed after its file was made. Fix: run
// `pnpm voice:collect` and `pnpm voice:gen --engine chatterbox` (it re-voices
// exactly the stale lines), never edit shipped.json by hand.

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { hashText, staleVoiceIds, strayVoiceIds, textHashOf } from '../../tools/voice/stale.mjs'

const ROOT = resolve(__dirname, '../..')
const manifest = JSON.parse(readFileSync(resolve(ROOT, 'data/voice-manifest.json'), 'utf8'))
const shippedFile = resolve(ROOT, 'vo-src/shipped.json')
const shipped = existsSync(shippedFile) ? JSON.parse(readFileSync(shippedFile, 'utf8')) : {}

describe('shipped voice files', () => {
  it('all say the text their line has now (re-voice the stale ones with voice:gen)', () => {
    const stale = staleVoiceIds(manifest, shipped)
    expect(stale, `stale recordings (text changed since voiced): ${stale.join(', ')}`).toEqual([])
  })

  it('have no booked file whose line is gone', () => {
    const strays = strayVoiceIds(manifest, shipped)
    expect(strays, `booked recordings with no line in the manifest: ${strays.join(', ')}`).toEqual([])
  })
})

describe('staleVoiceIds', () => {
  const lines = [
    { id: 'dlg.a.1', text: 'Hello there.', textHash: hashText('Hello there.') },
    { id: 'dlg.a.2', text: 'Changed text.' },
    { id: 'dlg.a.3', text: 'Not voiced yet.' }
  ]

  it('hashes like voice:manifest: trimmed, single-spaced, sha1, 10 hex chars', () => {
    expect(hashText('  Hello   there. ')).toBe(hashText('Hello there.'))
    expect(hashText('Hello there.')).toMatch(/^[0-9a-f]{10}$/)
    expect(textHashOf({ text: 'x', textHash: 'given' })).toBe('given')
    expect(textHashOf({ text: 'Hello there.' })).toBe(hashText('Hello there.'))
  })

  it('is empty while nothing is shipped', () => {
    expect(staleVoiceIds({ lines }, {})).toEqual([])
  })

  it('names a file voiced from another text, or booked without a hash', () => {
    const book = {
      'en/dlg.a.1': { engine: 'chatterbox', hash: hashText('Hello there.') },
      'en/dlg.a.2': { engine: 'chatterbox', hash: hashText('The old text.') },
      'en/dlg.gone.1': { engine: 'chatterbox', hash: 'abc' }
    }
    expect(staleVoiceIds({ lines }, book)).toEqual(['dlg.a.2'])
    expect(staleVoiceIds(lines, { 'en/dlg.a.3': { engine: 'by hand' } })).toEqual(['dlg.a.3'])
    expect(strayVoiceIds(lines, book)).toEqual(['dlg.gone.1'])
  })

  it('agrees with every textHash the manifest carries', () => {
    for (const l of manifest.lines) if (l.textHash) expect(l.textHash, l.id).toBe(hashText(l.text))
  })
})
