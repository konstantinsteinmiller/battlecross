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
