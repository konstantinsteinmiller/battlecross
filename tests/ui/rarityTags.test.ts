// ─── A rarity tier reads right next to any item ──────────────────────────────
//
// The tier is shown beside a noun it cannot see: inline before the item name in
// the results "Gear found" row (ResultsModal), first in the item card's
// "tier · slot · level" line (ItemDetail), and in brackets after the name in
// the loot toast (`loot.found`). A gendered adjective can agree with only some
// of the items — "Легендарный Быстрозарядная пушка", "Legendario Botas" — so
// the inflecting locales name the tier with a NOUN, the way ranks are named.
//
// Locales whose tier words never inflect (English, the uninflected German and
// Dutch label forms, Hindi, the Asian and Turkic languages) keep adjectives.
// Arabic keeps them too: before the name they read as a label, and only the
// toast, where the tag sits after the noun, gets a masculine head noun (طراز,
// "model") for the adjective to agree with.

import { describe, expect, it } from 'vitest'

type Messages = Record<string, unknown>
const load = async (code: string): Promise<Messages> =>
  (await import(`../../src/i18n/locales/${code}.ts`)).default as Messages

const NOUN_TIERS: Record<string, Record<'standard' | 'tuned' | 'prototype' | 'legendary', string>> = {
  ru: { standard: 'Стандарт', tuned: 'Тюнинг', prototype: 'Прототип', legendary: 'Легенда' },
  uk: { standard: 'Стандарт', tuned: 'Тюнінг', prototype: 'Прототип', legendary: 'Легенда' },
  pl: { standard: 'Standard', tuned: 'Tuning', prototype: 'Prototyp', legendary: 'Legenda' },
  es: { standard: 'Estándar', tuned: 'Tuning', prototype: 'Prototipo', legendary: 'Leyenda' },
  pt: { standard: 'Padrão', tuned: 'Tuning', prototype: 'Protótipo', legendary: 'Lenda' },
  it: { standard: 'Standard', tuned: 'Tuning', prototype: 'Prototipo', legendary: 'Leggenda' },
  fr: { standard: 'Standard', tuned: 'Tuning', prototype: 'Prototype', legendary: 'Légende' }
}

describe('inflecting locales name the rarity tier with a noun', () => {
  it.each(Object.keys(NOUN_TIERS))('%s', async (code) => {
    expect((await load(code)).rarity).toEqual(NOUN_TIERS[code])
  })
})

describe('Arabic: the loot toast gives the tier a noun to agree with', () => {
  it('reads "(طراز أسطوري)" after any item, masculine or feminine', async () => {
    const loot = (await load('ar')).loot as { found: string }
    expect(loot.found).toContain('(طراز {rarity})')
    expect(loot.found).toContain('{item}')
  })
})
