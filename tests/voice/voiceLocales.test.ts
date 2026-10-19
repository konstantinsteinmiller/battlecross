// The other languages' voice lines come from the game's own locale files
// (tools/voice/lib.mjs `textOf`): every manifest line has its text there, and
// the languages Chatterbox cannot speak are not listed.
import { describe, expect, it } from 'vitest'
import { CJK, LANGS, MANIFEST, VOICE_LINES, hashFor, maxFor, textOf } from '../../tools/voice/lib.mjs'
import de from '@/i18n/locales/de'

describe('voice lines in the other languages', () => {
  it('voices the seven languages Chatterbox speaks, never Indonesian or Vietnamese', () => {
    expect(LANGS).toEqual(['en', 'de', 'fr', 'es', 'ru', 'ja', 'pt', 'zh'])
    expect(LANGS).not.toContain('id')
    expect(LANGS).not.toContain('vi')
    expect([...CJK]).toEqual(['zh', 'ja'])
  })

  it('reads the line\'s text from the locale at its key', () => {
    const line = VOICE_LINES.find(l => l.key === 'dlg.hero.bye')!
    expect(textOf(line, 'en')).toBe(line.text)
    expect(textOf(line, 'de')).toBe((de as any).dlg.hero.bye)
  })

  it('every language has a text for every line, with no placeholder left', () => {
    for (const lang of LANGS) {
      const missing = VOICE_LINES.filter(l => !textOf(l, lang)).map(l => l.key)
      expect(missing, lang).toEqual([])
    }
    expect(VOICE_LINES.length).toBe(MANIFEST.lines.length)
  })

  it('hashes the language\'s own text, and sizes Chinese by characters', () => {
    const line = VOICE_LINES.find(l => l.key === 'dlg.hero.bye')!
    expect(hashFor(line, 'en', 'x')).toBe(line.hash)
    expect(hashFor(line, 'de', 'Hallo')).not.toBe(line.hash)
    expect(maxFor(line, 'zh', '一二三四五六七八九十一二')).toBeGreaterThan(4)
  })
})
