// The text a TTS model reads (tools/voice/normalize.mjs): numbers as words in
// the line's language, shouted capitals as words to stress, one ellipsis.
import { describe, expect, it } from 'vitest'
import { normalize, numberWords } from '../../tools/voice/normalize.mjs'

describe('voice text normalisation', () => {
  it('spells numbers in the line\'s language', () => {
    expect(numberWords(13, 'en')).toBe('thirteen')
    expect(numberWords(31, 'en')).toBe('thirty-one')
    expect(numberWords(21, 'de')).toBe('einundzwanzig')
    expect(numberWords(31, 'de')).toBe('einunddreißig')
    expect(numberWords(100, 'de')).toBe('einhundert')
    expect(normalize('Sky Docks runs level 13 and up.', 'en').text).toBe('Sky Docks runs level thirteen and up.')
    expect(normalize('Himmelsdocks beginnt ab Stufe 13.', 'de').text).toBe('Himmelsdocks beginnt ab Stufe dreizehn.')
    expect(normalize('Health under 30 %', 'en').text).toBe('Health under thirty percent')
  })

  it('turns shouted capitals into words to stress, keeping names and word tails right', () => {
    expect(normalize('The oldest! The hottest! BLAZE MASTER!', 'en'))
      .toEqual({ text: 'The oldest! The hottest! Blaze Master!', emphasis: ['blaze', 'master'] })
    expect(normalize('Repelled? Me? Im-POSSIBLE!', 'en').text).toBe('Repelled? Me? Im-possible!')
    expect(normalize('Abgestoßen? Ich? Un-MÖGLICH!', 'de').text).toBe('Abgestoßen? Ich? Un-möglich!')
    expect(normalize('Who turned the lights ON?!', 'en').text).toBe('Who turned the lights On?!')
  })

  it('writes every ellipsis the same way', () => {
    expect(normalize('The cure… is ME!', 'en').text).toBe('The cure... is Me!')
  })

  it('spells numbers and per-cents in the other voiced languages', () => {
    expect(numberWords(5, 'fr')).toBe('cinq')
    expect(numberWords(71, 'fr')).toBe('soixante-et-onze')
    expect(numberWords(95, 'fr')).toBe('quatre-vingt-quinze')
    expect(numberWords(21, 'es')).toBe('veintiuno')
    expect(numberWords(95, 'es')).toBe('noventa y cinco')
    expect(numberWords(21, 'pt')).toBe('vinte e um')
    expect(numberWords(21, 'ru')).toBe('двадцать один')
    expect(numberWords(12, 'zh')).toBe('十二')
    expect(numberWords(105, 'ja')).toBe('一百〇五')
    expect(normalize('pendant 5 minutes, 25 %', 'fr').text).toBe('pendant cinq minutes, vingt-cinq pour cent')
    expect(normalize('提高25%', 'zh').text).toBe('提高百分之二十五')
    expect(normalize('1ポイント', 'ja').text).toBe('一ポイント')
  })
})
