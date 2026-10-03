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

// A feminine variant (`<key>__f`, roadmap #71: `src/i18n/gendered.ts`) is
// OPTIONAL in every locale — a language adds one only where it inflects for
// the girl hero — so variants are left out of the shape and held to their own
// rules below.
const isVariant = (k: string): boolean => k.endsWith('__f')
const baseOf = (k: string): string => k.slice(0, -3)
const enAll = flatten(en)
const enKeys = enAll.filter(k => !isVariant(k))

const stringIn = (obj: any, path: string): string | null => {
  let cur: any = obj
  for (const p of path.split('.')) cur = cur?.[p]
  return typeof cur === 'string' ? cur : null
}
const slots = (s: string): string[] => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort()

/**
 * What is wrong with a locale's feminine variants: each must be a non-empty
 * string, stand next to a base key that English has AND this locale has, and
 * carry exactly the base's `{placeholders}` (form by form for a plural).
 */
const variantProblems = (msgs: any, english: any = en): string[] => {
  const bad: string[] = []
  for (const k of flatten(msgs).filter(isVariant)) {
    const base = baseOf(k)
    const v = stringIn(msgs, k)
    const own = stringIn(msgs, base)
    if (!v) { bad.push(`${k}: not a non-empty string`); continue }
    if (stringIn(english, base) === null) { bad.push(`${k}: English has no "${base}"`); continue }
    if (own === null) { bad.push(`${k}: no "${base}" beside it`); continue }
    const a = own.split('|').map(f => slots(f).join())
    const b = v.split('|').map(f => slots(f).join())
    if (a.length !== b.length || a.some((x, i) => x !== b[i])) bad.push(`${k}: placeholders ${b.join(' | ')} differ from ${a.join(' | ')}`)
  }
  return bad
}

describe('every shipped locale mirrors the English key shape', () => {
  for (const code of LANGUAGES) {
    if (code === 'en') continue
    it(`${code} has no missing or extra keys`, async () => {
      const mod = await import(`../src/i18n/locales/${code}.ts`)
      const keys = flatten(mod.default).filter(k => !isVariant(k))
      const missing = enKeys.filter((k) => !keys.includes(k))
      const extra = keys.filter((k) => !enKeys.includes(k))
      expect(missing, `${code} is MISSING keys`).toEqual([])
      expect(extra, `${code} has EXTRA keys`).toEqual([])
    })
  }
})

describe('feminine variants (`<key>__f`) stand on their base key', () => {
  for (const code of LANGUAGES) {
    it(`${code}: every variant has its base, and the same placeholders`, async () => {
      const mod = code === 'en' ? { default: en } : await import(`../src/i18n/locales/${code}.ts`)
      expect(variantProblems(mod.default)).toEqual([])
    })
  }

  it('the rule itself passes a good variant and catches an orphan, a blank, a missing base and a dropped placeholder', () => {
    const english = { dlg: { ok: 'You came, {name}.', blank: 'Ready?', slot: '{n} on the road', alone: 'Hi.' } }
    const msgs = {
      dlg: {
        'ok': 'Ты пришёл, {name}.', 'ok__f': 'Ты пришла, {name}.',
        'nobase__f': 'x', 'blank': 'Готов?', 'blank__f': '', 'slot': '{n} в пути', 'slot__f': 'в пути', 'alone__f': 'Привет.'
      }
    }
    expect(variantProblems(msgs, english).map(s => s.split(':')[0]).sort()).toEqual(['dlg.alone__f', 'dlg.blank__f', 'dlg.nobase__f', 'dlg.slot__f'])
  })
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
