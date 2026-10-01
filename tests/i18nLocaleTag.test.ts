import { describe, expect, it } from 'vitest'
import { bcp47For, localeCandidates, toLocale } from '@/i18n/localeTag'
import { PLURAL_RULES } from '@/i18n/plural'
import { LANGUAGES, LANGUAGE_AUTONYMS } from '@/utils/enums'

describe('portal and browser tags map onto shipped locales (#116)', () => {
  it('keeps the regional variants apart', () => {
    expect(toLocale('pt-BR')).toBe('pt')
    expect(toLocale('pt')).toBe('pt')
    expect(toLocale('pt_PT')).toBe('pt-PT')
    expect(toLocale('pt-AO')).toBe('pt-PT')
    expect(toLocale('zh-CN')).toBe('zh')
    expect(toLocale('zh-TW')).toBe('zh-TW')
    expect(toLocale('zh-HK')).toBe('zh-TW')
    expect(toLocale('zh-Hant')).toBe('zh-TW')
    // The script subtag wins over the region.
    expect(toLocale('zh-Hans-HK')).toBe('zh')
  })

  it('reads aliases, ISO 639-2 codes and casing', () => {
    expect(toLocale('UA')).toBe('uk')
    expect(toLocale('jpn')).toBe('ja')
    expect(toLocale('no')).toBe('nb')
    expect(toLocale('nn-NO')).toBe('nb')
    expect(toLocale('in')).toBe('id')
    expect(toLocale('EL')).toBe('el')
    expect(toLocale(' sv-SE ')).toBe('sv')
  })

  it('answers null for a language the game does not ship', () => {
    expect(toLocale('xx')).toBeNull()
    expect(toLocale('he')).toBeNull()
    expect(toLocale('')).toBeNull()
    expect(toLocale(undefined)).toBeNull()
    // A variant falls back to its sibling before English.
    expect(toLocale('zh-TW', ['en', 'zh'])).toBe('zh')
    expect(localeCandidates('pt-PT')).toEqual(['pt-PT', 'pt'])
  })

  it('stamps real BCP-47 tags on <html lang>', () => {
    expect(bcp47For('zh')).toBe('zh-Hans')
    expect(bcp47For('zh-TW')).toBe('zh-Hant')
    expect(bcp47For('pt')).toBe('pt-BR')
    expect(bcp47For('pt-PT')).toBe('pt-PT')
    expect(bcp47For('de')).toBe('de')
  })

  it('names every shipped language in its own tongue, once', () => {
    for (const code of LANGUAGES) expect(LANGUAGE_AUTONYMS[code], code).toBeTruthy()
    expect(new Set(Object.values(LANGUAGE_AUTONYMS)).size).toBe(LANGUAGES.length)
    expect(new Set(LANGUAGES).size).toBe(LANGUAGES.length)
  })
})

describe('three-form plural rules pick the CLDR category', () => {
  const pick = (code: string, n: number) => PLURAL_RULES[code]!(n, 3, undefined as never)
  const table: Record<string, Array<[number, number]>> = {
    cs: [[1, 0], [2, 1], [4, 1], [5, 2], [0, 2], [21, 2]],
    hr: [[1, 0], [21, 0], [11, 2], [3, 1], [23, 1], [13, 2], [5, 2]],
    ro: [[1, 0], [0, 1], [2, 1], [19, 1], [20, 2], [101, 2], [102, 1], [120, 2]],
    lt: [[1, 0], [21, 0], [11, 2], [2, 1], [9, 1], [12, 2], [10, 2], [0, 2]],
    lv: [[0, 0], [10, 0], [11, 0], [19, 0], [1, 1], [21, 1], [2, 2], [22, 2]]
  }
  for (const [code, cases] of Object.entries(table)) {
    it(code, () => {
      for (const [n, form] of cases) expect(pick(code, n), `${code} ${n}`).toBe(form)
    })
  }
})
