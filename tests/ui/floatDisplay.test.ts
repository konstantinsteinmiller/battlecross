// @vitest-environment jsdom
// Owner rule: every fractional number the player reads shows at most two
// digits after the point, trailing zeros dropped, in the player's own decimal
// sign. A playtest showed the hero sheet's Stamina as `13.120000000000001`
// (a forged `+6.12` summed onto 7 base points). Guarded three ways: the
// formatter, the global `t` that formats every fractional parameter, and a
// sweep of every forged item through the numbers the screens print — plus a
// scan of the templates for an attribute total or a delta printed raw.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { fmt2 } from '@/utils/format'
import { formatNumberParams, installNumberParams } from '@/i18n/numberParams'
import { compareMods, modLines, signed } from '@/components/game/modLines'
import { ITEMS } from '@/game/data/items'
import { FORGE_MAX, forgedMods } from '@/game/data/forge'
import { ATTRS } from '@/game/data/attributes'

/** What a shown number may look like: digits, a group sign, at most two decimals. */
const CLEAN = /^[+−-]?\d{1,3}([,.   ]\d{3})*([.,]\d{1,2})?$/
const NOISE = /\d[.,]\d{3,}(?!\d*[.,   ]\d)/

afterEach(() => { document.documentElement.lang = 'en' })

describe('fmt2', () => {
  it('two decimals at most, trailing zeros dropped', () => {
    expect([fmt2(13.120000000000001), fmt2(6.120000000000001), fmt2(4.6), fmt2(2.5), fmt2(2.499), fmt2(3)]).toEqual(['13.12', '6.12', '4.6', '2.5', '2.5', '3'])
  })
  it('in the player\'s own decimal sign', () => {
    document.documentElement.lang = 'de'
    expect([fmt2(13.120000000000001), fmt2(2.5), fmt2(1234.5)]).toEqual(['13,12', '2,5', '1.234,5'])
    document.documentElement.lang = 'fr'
    expect(fmt2(2.5)).toBe('2,5')
  })
})

describe('the global t', () => {
  it('formats every fractional parameter and leaves whole numbers and strings alone', () => {
    const p = { a: 6.120000000000001, b: 7, c: 'x' }
    expect(formatNumberParams(p)).toEqual({ a: '6.12', b: 7, c: 'x' })
    const q = { b: 7 }
    expect(formatNumberParams(q)).toBe(q)
    expect(formatNumberParams(undefined)).toBeUndefined()
  })
  it('a line reads clean through the installed t, plural count untouched', () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { m: '+{n} Stamina', p: 'one | {n} many' } } })
    installNumberParams(i18n.global as never)
    const t = i18n.global.t as (...a: unknown[]) => string
    expect(t('m', { n: 6.120000000000001 })).toBe('+6.12 Stamina')
    expect(t('m', { n: 6 })).toBe('+6 Stamina')
    expect(t('p', { n: 3 }, 3)).toBe('3 many')
  })
})

describe('every forged piece, through the numbers the screens print', () => {
  it('no float noise in an attribute total, a tooltip line or a comparison', () => {
    const bad: string[] = []
    const check = (where: string, s: string): void => { if (!CLEAN.test(s) || NOISE.test(s)) bad.push(`${where}: ${s}`) }
    for (let lvl = 0; lvl <= FORGE_MAX; lvl++) {
      // The sum the hero sheet shows: base points plus every piece's attributes.
      const total: Record<string, number> = Object.fromEntries(ATTRS.map(a => [a, 7]))
      for (const it of ITEMS) {
        const m = forgedMods(it, lvl)
        for (const a of ATTRS) total[a]! += (m[a] ?? 0) + (m.allAttrs ?? 0)
        for (const l of modLines(m)) check(`${it.id}+${lvl} ${l.id}`, fmt2(l.n))
        for (const l of compareMods(m, forgedMods(it, Math.max(0, lvl - 1)))) if (l.delta) check(`${it.id}+${lvl} Δ${l.id}`, signed(l.delta))
        for (const a of ATTRS) {
          check(`total ${a}`, fmt2(total[a]!))
          check(`bonus ${a}`, `+${fmt2(total[a]! - 7)}`)
        }
      }
    }
    expect(bad.slice(0, 10)).toEqual([])
  })
})

describe('templates', () => {
  const vueFiles = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? vueFiles(p) : p.endsWith('.vue') ? [p] : []
  })
  it('never print an attribute total, a stat or a delta without a formatter', () => {
    // Values that can carry a fraction; an interpolation of one must go
    // through fmt / fmt2 / fmtBig / signed (or a t() line, which formats it).
    const FRACTIONAL = /^(total\[[^\]]+\]|[\w.]*attrs\[[^\]]+\]|[\w.]*\.delta|[\w.]*(Stats|stats)\.\w+|total\[[^\]]+\] - .*)$/
    const bad: string[] = []
    for (const f of vueFiles(join(__dirname, '../../src'))) {
      const src = readFileSync(f, 'utf8')
      const tpl = src.slice(0, Math.max(0, src.indexOf('<script')))
      for (const m of tpl.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)) {
        if (FRACTIONAL.test(m[1]!)) bad.push(`${f.replace(/.*[\\/]src[\\/]/, 'src/')}: {{ ${m[1]} }}`)
      }
    }
    expect(bad).toEqual([])
  })
})
