// The written delivery an engine is given for a line (tools/voice/style.mjs).
import { describe, expect, it } from 'vitest'
// @ts-expect-error plain .mjs tool module, no types
import { styleFor } from '../../tools/voice/style.mjs'

const job = { lang: 'en', direction: 'Worried, quick, not loud.', tone: 'urgent', situation: 'Health under 30 %', emphasis: [], max: 3 }

describe('the delivery a line is spoken with', () => {
  it('carries the direction, the tone, the situation and the length', () => {
    expect(styleFor(job)).toBe('Worried, quick, not loud. Tone: urgent. Situation: Health under 30 %. Brisk, 3 seconds at most.')
  })

  it('names the shouted words, and speaks German to a German line', () => {
    const de = styleFor({ ...job, lang: 'de', direction: 'Besorgt.', emphasis: ['blaze', 'master'] })
    expect(de).toContain('Betont: blaze, master.')
    expect(de).toContain('höchstens 3 Sekunden')
  })
})
