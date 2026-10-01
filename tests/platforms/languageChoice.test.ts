// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { LANGUAGE_KEY } from '@/keys'

describe('the player\'s language choice (#115)', () => {
  it('is only a choice when Options made it, not when an older build seeded the portal language', async () => {
    const { setState } = await import('@/use/useGameState')
    const { default: useUser, hasLanguageChoice, clearLanguageChoice } = await import('@/use/useUser')
    // What an older CrazyGames / Yandex / Poki build left behind.
    setState(LANGUAGE_KEY, 'de')
    expect(hasLanguageChoice()).toBe(false)
    // The player picks a language in Options.
    useUser().setSettingValue('language', 'es')
    expect(hasLanguageChoice()).toBe(true)
    // A portal language change clears it entirely.
    clearLanguageChoice('fr')
    expect(hasLanguageChoice()).toBe(false)
    setState(LANGUAGE_KEY, 'de')
    expect(hasLanguageChoice()).toBe(false)
  })
})
