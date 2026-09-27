import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'
import { LANGUAGES } from '@/utils/enums'

// ─── Locale parity ──────────────────────────────────────────────────────────
//
// English is the source of truth. Every other locale the game SHIPS must carry
// the exact same key shape — a missing key silently falls back to English, so
// the failure mode is a half-translated screen that nobody notices until a
// player in that language reports it.

const flatten = (obj: any, prefix = ''): string[] => {
  const out: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flatten(v, path))
    else out.push(path)
  }
  return out.sort()
}

const enKeys = flatten(en)

describe('every shipped locale mirrors the English key shape', () => {
  for (const code of LANGUAGES) {
    if (code === 'en') continue
    it(`${code} has no missing or extra keys`, async () => {
      const mod = await import(`../src/i18n/locales/${code}.ts`)
      const keys = flatten(mod.default)
      const missing = enKeys.filter((k) => !keys.includes(k))
      const extra = keys.filter((k) => !enKeys.includes(k))
      expect(missing, `${code} is MISSING keys`).toEqual([])
      expect(extra, `${code} has EXTRA keys`).toEqual([])
    })
  }
})

describe('interpolation placeholders survive translation', () => {
  // A dropped `{n}` renders as literal text and looks like a bug to the player.
  const stringAt = (obj: any, path: string): string | null => {
    let cur: any = obj
    for (const p of path.split('.')) cur = cur?.[p]
    return typeof cur === 'string' ? cur : null
  }
  const placeholders = (s: string): string[] => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort()
  const isPlural = (s: string) => s.includes('|')
  /** vue-i18n's implicit plural count: a form may spell it in words. */
  const COUNT = ['{n}', '{count}']

  /**
   * A plural message ("… {n} mission | … {n} missions") has as many forms as
   * its language needs (three in ru/uk/pl, six in ar, one in ja), so it is
   * checked form by form instead of by counting over the whole string: every
   * form carries every placeholder English has, except the count, which a
   * form may spell in words (Arabic's dual is one word, "two missions") but
   * at least one form must show. No form may bring a placeholder of its own.
   */
  const pluralMismatch = (a: string, b: string): string | null => {
    const want = [...new Set(placeholders(a))]
    const forms = b.split('|').map(f => new Set(placeholders(f)))
    for (const [i, got] of forms.entries()) {
      const missing = want.filter(p => !got.has(p) && !COUNT.includes(p))
      const extra = [...got].filter(p => !want.includes(p))
      if (missing.length || extra.length) return `form ${i + 1} missing ${missing.join(',')} extra ${extra.join(',')}`
    }
    const count = want.filter(p => COUNT.includes(p))
    if (count.some(p => !forms.some(f => f.has(p)))) return `no form shows ${count.join(',')}`
    return null
  }

  for (const code of LANGUAGES) {
    if (code === 'en') continue
    it(`${code} keeps every {placeholder}`, async () => {
      const mod = await import(`../src/i18n/locales/${code}.ts`)
      const mismatches: string[] = []
      for (const key of enKeys) {
        const a = stringAt(en, key)
        if (a === null || placeholders(a).length === 0) continue
        const b = stringAt(mod.default, key) ?? ''
        if (isPlural(a)) {
          const why = pluralMismatch(a, b)
          if (why) mismatches.push(`${key}: ${why}`)
        } else if (JSON.stringify(placeholders(a)) !== JSON.stringify(placeholders(b))) {
          mismatches.push(`${key}: expected ${placeholders(a).join(',')} got ${placeholders(b).join(',')}`)
        }
      }
      expect(mismatches).toEqual([])
    })
  }
})
