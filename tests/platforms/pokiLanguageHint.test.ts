// ─── Poki's language is a hint, never the player's choice ───────────────────
//
// `PokiSDK.getLanguage()` returns the Poki SITE's language (`?iso_lang`, else
// the browser's). The rule every portal integration here follows — platform
// state is not player state — says it may pick the locale a session starts in,
// but must never be written into the player's own language key: Poki's wrapper
// cloud-syncs localStorage, so a stored portal locale would outrank every later
// visit (a player who once arrived via poki.com/en would stay English on
// poki.com/de), and "the portal said so" would become indistinguishable from
// "the player chose this".
//
// The seeding lives in `main.ts`'s bootstrap, inside env-literal branches that
// no unit test can import, so this pins the SOURCE: the persisted seed must not
// include Poki's locale, the unchosen-player guard must cover Poki (or the 'en'
// default would overwrite the hint one tick after boot), and the hint must still
// reach the first-paint locale. The real behaviour is checked on the built
// bundle by the Poki smoke run (`?iso_lang=de` then `fr` on one profile).

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const main = readFileSync(resolve(__dirname, '..', '..', 'src', 'main.ts'), 'utf8')
  // Comments explain the rule and name the variables; only CODE is pinned.
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/.*$/gm, '$1')

describe('poki language hint (main.ts)', () => {
  it('never persists any portal locale into the player language key', () => {
    expect(main).not.toMatch(/portalSeed/)
    expect(main).not.toMatch(/setSettingValue\('language'/)
  })

  it('does not overwrite the hint with a stored value the player never chose', () => {
    const guard = /const hintBuild\s*=([^\n]+)\n\s*const applyStored\s*=([^\n]+)/.exec(main)
    expect(guard, 'applyStored guard not found').not.toBeNull()
    expect(guard![1]).toMatch(/VITE_APP_POKI === 'true'/)
    expect(guard![2]).toMatch(/chosen \|\| \(!portalLocale && !hintBuild\)/)
  })

  it('still lets the hint choose the first-paint locale', () => {
    expect(main).toMatch(/const portalLocaleHint\s*=[^\n]*pkLocale/)
  })
})
