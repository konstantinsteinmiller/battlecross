// A recording must say what the text says. Every shipped file is booked in
// vo-src/shipped.json with the hash of the text it was voiced from; when the
// line's text changes, its hash changes, the file is STALE, and `voice:gen`
// voices it again on its next run (a stale file counts as missing). Pure, so
// tests/voice/voiceStale.test.ts can hold the shipped files to the manifest.

import { createHash } from 'node:crypto'

/** The hash `voice:manifest` writes per line (`textHash`): sha1 of the trimmed, single-spaced text, 10 hex chars. */
export const hashText = (text) => createHash('sha1').update(String(text).trim().replace(/\s+/g, ' ')).digest('hex').slice(0, 10)

/** A manifest entry's text hash: its own `textHash` when the manifest has one, else computed the same way. */
export const textHashOf = (entry) => entry.textHash ?? hashText(entry.text)

/**
 * The ids whose shipped recording in `lang` was voiced from another text than
 * the manifest's now (or booked with no hash at all). `manifest` is the JSON
 * (or its `lines`); `shipped` is vo-src/shipped.json (`<lang>/<id>` →
 * `{ engine, at, hash }`). Booked files of ids the manifest no longer has are
 * not stale: they are strays (`strayVoiceIds`).
 */
export const staleVoiceIds = (manifest, shipped, lang = 'en') => {
  const lines = Array.isArray(manifest) ? manifest : manifest.lines
  return lines
    .filter(l => {
      const rec = shipped[`${lang}/${l.id}`]
      return rec && rec.hash !== textHashOf(l)
    })
    .map(l => l.id)
}

/** Booked files whose id the manifest no longer lists (a line removed or renamed). */
export const strayVoiceIds = (manifest, shipped, lang = 'en') => {
  const ids = new Set((Array.isArray(manifest) ? manifest : manifest.lines).map(l => l.id))
  return Object.keys(shipped).filter(k => k.startsWith(`${lang}/`)).map(k => k.slice(lang.length + 1)).filter(id => !ids.has(id))
}
