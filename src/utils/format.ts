import { formatCount } from './localeNumber'

/** A whole number grouped the way the player's language groups it (the
 *  document's `lang` follows the chosen locale). */
export const fmt = (n: number): string =>
  formatCount(Math.round(n), (typeof document !== 'undefined' && document.documentElement.lang) || 'en')

/** Seconds as `m:ss`. */
export const clock = (sec: number): string => {
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const decimals = new Map<string, Intl.NumberFormat | null>()

/** A number with at most two digits after the point, none when they are zero
 *  (`5.3000000004` → `5.3`, `12.456` → `12.46`), grouped and pointed the way
 *  the player's language does it. For the stats menu. */
export const fmt2 = (n: number): string => {
  if (!Number.isFinite(n)) return ''
  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || 'en'
  let f = decimals.get(lang)
  if (f === undefined) {
    try { f = new Intl.NumberFormat(lang, { maximumFractionDigits: 2, numberingSystem: 'latn' }) } catch { f = null }
    decimals.set(lang, f)
  }
  const r = Math.round(n * 100) / 100
  return f ? f.format(r) : String(r)
}

const compacts = new Map<string, Intl.NumberFormat | null>()

/** A whole number that can run into the billions and beyond (an upgrade's
 *  price): grouped up to a million, then compact (`2.4M`, `1.1B`, `3.2e21`),
 *  so it fits a button. */
export const fmtBig = (n: number): string => {
  if (!Number.isFinite(n)) return '∞'
  if (n < 1e6) return fmt(n)
  if (n >= 1e15) return n.toExponential(1).replace('e+', 'e')
  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || 'en'
  let f = compacts.get(lang)
  if (f === undefined) {
    try { f = new Intl.NumberFormat(lang, { notation: 'compact', maximumFractionDigits: 1, numberingSystem: 'latn' }) } catch { f = null }
    compacts.set(lang, f)
  }
  return f ? f.format(n) : String(Math.round(n))
}
