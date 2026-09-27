import type { PluralizationRule } from 'vue-i18n'

/**
 * ─── Plural forms for the languages "one | other" does not fit ──────────────
 *
 * vue-i18n picks a plural form the English way (1 → the first form, anything
 * else → the second). Russian, Ukrainian and Polish need three forms after a
 * number (1 миссию, 2 миссии, 5 миссий) and Arabic six, so a message written
 * with that many forms is picked by the language's CLDR rule here. A message
 * with any other number of forms (the older two-form strings) keeps vue-i18n's
 * own choice, so nothing written before these rules changes.
 *
 * Wired into `createI18n({ pluralRules })` in `main.ts`.
 */

const within = (v: number, lo: number, hi: number) => v >= lo && v <= hi

/** East Slavic: one (1, 21, 31…) | few (2–4, 22–24…) | many (0, 5–20, 25…). */
const eastSlavic = (n: number): number =>
  n % 10 === 1 && n % 100 !== 11 ? 0
    : within(n % 10, 2, 4) && !within(n % 100, 12, 14) ? 1
      : 2

/** Polish: one (1 only) | few (2–4, 22–24…) | many (0, 5–21, 25…). */
const polish = (n: number): number =>
  n === 1 ? 0
    : within(n % 10, 2, 4) && !within(n % 100, 12, 14) ? 1
      : 2

/** Arabic: zero | one | two | few (3–10) | many (11–99) | other (100, 101…). */
const arabic = (n: number): number =>
  n === 0 ? 0
    : n === 1 ? 1
      : n === 2 ? 2
        : within(n % 100, 3, 10) ? 3
          : within(n % 100, 11, 99) ? 4
            : 5

/** A rule for messages with exactly `forms` forms; others keep the default. */
const rule = (forms: number, pick: (n: number) => number): PluralizationRule =>
  (choice, choicesLength, orgRule) => {
    const n = Math.abs(Math.trunc(choice))
    if (choicesLength === forms) return pick(n)
    return orgRule ? orgRule(choice, choicesLength) : (n === 1 ? 0 : Math.min(1, choicesLength - 1))
  }

export const PLURAL_RULES: Record<string, PluralizationRule> = {
  ru: rule(3, eastSlavic),
  uk: rule(3, eastSlavic),
  pl: rule(3, polish),
  ar: rule(6, arabic)
}
