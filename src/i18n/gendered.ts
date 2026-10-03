import { ref } from 'vue'

/**
 * ─── Lines that agree with the hero (roadmap #71) ────────────────────────────
 *
 * English addresses the hero as "you" and almost never changes with who the
 * hero is. About half the game's other languages do: an adjective, a past
 * tense or a noun takes the hero's gender ("Du bist bereit" stays, but
 * "Ты готов" becomes "Ты готова"). So a message MAY have a feminine variant
 * under the same key plus `__f`:
 *
 *   dlg.elderMara.hello.1      'Ты готов?'
 *   dlg.elderMara.hello.1__f   'Ты готова?'
 *
 * When the hero is the girl hero, `t('dlg.elderMara.hello.1')` gives the
 * variant if the CURRENT locale has one, and the plain message otherwise (a
 * language that needs no variant has none, and English almost never). The
 * choice happens in the message resolver, so every `t()` in the game follows
 * it, with no call site to remember. The parity test holds every variant to
 * its base key: the base must exist, and the `{placeholders}` must match.
 *
 * Kept free of the game: this module runs in the i18n bootstrap, before the
 * save is read. The profile pushes the hero's gender in (`setHeroForm`).
 */

/** The suffix of a feminine variant. */
export const FEMININE = '__f'

/** Whose lines are read: 'f' prefers the `__f` variants. Reactive, so a
 *  component that rendered a line re-renders when the choice changes. */
export const heroForm = ref<'m' | 'f'>('m')

export const setHeroForm = (g: 'm' | 'f'): void => {
  heroForm.value = g === 'f' ? 'f' : 'm'
}

/** Is this key a feminine variant (`…__f`)? */
export const isFeminineKey = (key: string): boolean => key.endsWith(FEMININE)
/** The base key of a variant (`a.b__f` → `a.b`). */
export const baseKeyOf = (key: string): string => (isFeminineKey(key) ? key.slice(0, -FEMININE.length) : key)

/** A dotted path in a nested message object; null when it is not there. */
const walk = (obj: unknown, path: string): unknown => {
  let cur: unknown = obj
  for (const part of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return null
    cur = (cur as Record<string, unknown>)[part]
    if (cur === undefined) return null
  }
  return cur
}

/**
 * vue-i18n's `messageResolver`: the message at `path` in one locale's
 * messages, its feminine variant first when the hero is the girl hero. Null
 * when the locale has neither, so vue-i18n falls back (to English) as usual.
 */
export const resolveGendered = (obj: unknown, path: string): unknown => {
  // Read every time, so the dependency is tracked even for the boy hero.
  const fem = heroForm.value === 'f'
  if (fem && !isFeminineKey(path)) {
    const v = walk(obj, path + FEMININE)
    if (typeof v === 'string') return v
  }
  return walk(obj, path)
}

/** The id a line is spoken by for this hero: `<id>__f` when the girl hero
 *  has a recording of her own (`has`), else the line's own id. */
export const genderedId = (id: string, has: (id: string) => boolean): string =>
  heroForm.value === 'f' && has(id + FEMININE) ? id + FEMININE : id
