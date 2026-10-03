// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { computed } from 'vue'
import { createI18n } from 'vue-i18n'
import { baseKeyOf, genderedId, heroForm, isFeminineKey, resolveGendered, setHeroForm } from '@/i18n/gendered'

/**
 * Lines that agree with the hero (roadmap #71): a message may carry a
 * feminine variant `<key>__f`, which `t()` prefers for the girl hero when the
 * CURRENT locale has one — and the plain message otherwise.
 */

afterEach(() => setHeroForm('m'))

const messages = {
  en: {
    dlg: { hello: 'You made it, {name}.', bye: 'Go safely.' },
    hud: { gold: 'Gold' }
  },
  ru: {
    dlg: { hello: 'Ты пришёл, {name}.', hello__f: 'Ты пришла, {name}.', bye: 'Береги себя.' }
  }
}

const make = (locale: string) => createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages,
  missingWarn: false,
  fallbackWarn: false,
  messageResolver: resolveGendered as never
})

describe('the resolver', () => {
  it('prefers the feminine variant for the girl hero, the plain message for the boy', () => {
    expect(resolveGendered(messages.ru, 'dlg.hello')).toBe('Ты пришёл, {name}.')
    setHeroForm('f')
    expect(resolveGendered(messages.ru, 'dlg.hello')).toBe('Ты пришла, {name}.')
    // No variant in this locale: the plain message.
    expect(resolveGendered(messages.ru, 'dlg.bye')).toBe('Береги себя.')
    // Missing altogether: null, so vue-i18n falls back to English.
    expect(resolveGendered(messages.ru, 'hud.gold')).toBeNull()
    // A variant asked for by its own name is itself.
    expect(resolveGendered(messages.ru, 'dlg.hello__f')).toBe('Ты пришла, {name}.')
  })

  it('reads key shapes', () => {
    expect(isFeminineKey('a.b__f')).toBe(true)
    expect(isFeminineKey('a.b')).toBe(false)
    expect(baseKeyOf('a.b__f')).toBe('a.b')
    expect(baseKeyOf('a.b')).toBe('a.b')
  })
})

describe('t() in the game\'s i18n', () => {
  it('follows the hero, with interpolation, in the current locale only', () => {
    const { t } = make('ru').global
    expect(t('dlg.hello', { name: 'Мара' })).toBe('Ты пришёл, Мара.')
    setHeroForm('f')
    expect(t('dlg.hello', { name: 'Мара' })).toBe('Ты пришла, Мара.')
    expect(t('dlg.bye')).toBe('Береги себя.')
    // Falls back to English as before.
    expect(t('hud.gold')).toBe('Gold')
  })

  it('English has no variant here: the girl hero reads the plain line', () => {
    setHeroForm('f')
    expect(make('en').global.t('dlg.hello', { name: 'Mara' })).toBe('You made it, Mara.')
  })

  it('a line already on screen re-renders when the hero changes', () => {
    const { t } = make('ru').global
    const line = computed(() => t('dlg.hello', { name: 'Мара' }))
    expect(line.value).toBe('Ты пришёл, Мара.')
    setHeroForm('f')
    expect(line.value).toBe('Ты пришла, Мара.')
    expect(heroForm.value).toBe('f')
  })
})

describe('the spoken line', () => {
  it('the girl hero gets the feminine recording when there is one', () => {
    const has = (id: string) => id === 'dlg.x.1__f'
    expect(genderedId('dlg.x.1', has)).toBe('dlg.x.1')
    setHeroForm('f')
    expect(genderedId('dlg.x.1', has)).toBe('dlg.x.1__f')
    expect(genderedId('dlg.x.2', has)).toBe('dlg.x.2')
  })
})
