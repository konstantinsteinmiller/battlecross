import { LANGUAGES } from '@/utils/enums'

/**
 * ─── Portal / browser language tag → a locale this game ships ───────────────
 *
 * Every portal hands its language over in its own shape: `pt-BR`, `pt_PT`,
 * `zh-Hant-HK`, `UA` (Playgama's enum), `jpn` (ISO 639-2), `no`. This maps
 * any of them onto a code in `LANGUAGES`, region-aware where the game ships
 * two variants: European Portuguese (`pt-PT`) beside the Brazilian `pt`, and
 * Traditional Chinese (`zh-TW`) beside the Simplified `zh`. A variant falls
 * back to its sibling before English (a Traditional reader prefers Simplified
 * to English).
 *
 * `null`, never the raw code, for a language the game does not ship: callers
 * treat a non-null answer as safe to apply, so an unshipped portal language
 * can never knock the player out of their own choice.
 *
 * Internal codes `pt`, `ja`, `ko`, `zh` stay as they are: they live in saves.
 */

/** Non-canonical base subtags → the ISO 639-1 subtag. */
const BASE_ALIASES: Readonly<Record<string, string>> = {
  // Country codes seen as language codes (only ones that are not themselves
  // ISO 639-1 codes: `se`, `tw`, `br` are real languages).
  jp: 'ja', kr: 'ko', ua: 'uk', kz: 'kk', gr: 'el', cz: 'cs', dk: 'da', vn: 'vi', cn: 'zh',
  // Norwegian: the macro-language and Nynorsk → the one Norwegian we ship.
  no: 'nb', nn: 'nb', nob: 'nb', nor: 'nb', nno: 'nb',
  // Android / Java legacy.
  in: 'id',
  // ISO 639-2 / 639-3.
  eng: 'en', deu: 'de', ger: 'de', spa: 'es', fra: 'fr', fre: 'fr', ita: 'it', por: 'pt', nld: 'nl', dut: 'nl',
  ind: 'id', swe: 'sv', dan: 'da', fin: 'fi', cat: 'ca', glg: 'gl', pol: 'pl', tur: 'tr', vie: 'vi', aze: 'az',
  uzb: 'uz', ces: 'cs', cze: 'cs', hrv: 'hr', ron: 'ro', rum: 'ro', mol: 'ro', mo: 'ro', hun: 'hu', lav: 'lv',
  lit: 'lt', epo: 'eo', ell: 'el', gre: 'el', rus: 'ru', ukr: 'uk', bul: 'bg', kaz: 'kk', ara: 'ar', hin: 'hi',
  tha: 'th', jpn: 'ja', kor: 'ko', zho: 'zh', chi: 'zh', cmn: 'zh', yue: 'zh-hk'
}

/** Regions whose Portuguese follows the European norm. */
const PT_EUROPEAN = new Set(['pt', 'ao', 'mz', 'cv', 'gw', 'st', 'tl', 'mo', 'gq', 'lu', 'ch', 'ad', 'fr'])
/** Regions that write Traditional Chinese. */
const ZH_TRADITIONAL = new Set(['tw', 'hk', 'mo'])

/** Ordered candidate codes for a raw tag, best match first. */
export const localeCandidates = (raw: unknown): string[] => {
  if (typeof raw !== 'string') return []
  const parts = raw.trim().replace(/_/g, '-').toLowerCase().split('-').filter(Boolean)
  if (parts.length === 0) return []
  const aliased = (BASE_ALIASES[parts[0]!] ?? parts[0]!).split('-')
  const base = aliased[0]!
  const sub = [...aliased.slice(1), ...parts.slice(1)]
  if (base === 'zh') {
    // The script subtag wins over the region: zh-Hans-HK is Simplified.
    const traditional = sub.includes('hant') || (!sub.includes('hans') && sub.some((s) => ZH_TRADITIONAL.has(s)))
    return traditional ? ['zh-TW', 'zh'] : ['zh', 'zh-TW']
  }
  if (base === 'pt') return sub.some((s) => PT_EUROPEAN.has(s)) ? ['pt-PT', 'pt'] : ['pt', 'pt-PT']
  return [base]
}

/** Raw tag → a shipped locale code, or `null`. */
export const toLocale = (raw: unknown, shipped: readonly string[] = LANGUAGES): string | null => {
  for (const code of localeCandidates(raw)) if (shipped.includes(code)) return code
  return null
}

/** The real BCP-47 tag for `<html lang>`, Intl and screen readers. */
export const bcp47For = (code: string): string =>
  code === 'zh' ? 'zh-Hans' : code === 'zh-TW' ? 'zh-Hant' : code === 'pt' ? 'pt-BR' : code
