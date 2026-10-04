// The written delivery an engine is given for a line (tools/voice/style.mjs).
import { describe, expect, it } from 'vitest'
import { styleFor } from '../../tools/voice/style.mjs'
import { tagFor } from '../../tools/voice/engines/elevenlabs.mjs'

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

  it('gives ElevenLabs the tone word alone as its audio tag, never the direction (it read the clause aloud)', () => {
    expect(tagFor('Soft: the first words he ever hears.', 'warm')).toBe('[warm] ')
    expect(tagFor('Worried, quick, not loud.', 'urgent')).toBe('[urgent] ')
    expect(tagFor('A full boxing-announcer build.', 'neutral')).toBe('')
  })

  it('brings the first clause back only when asked (EL_TAG=clause)', () => {
    const was = process.env.EL_TAG
    process.env.EL_TAG = 'clause'
    try {
      expect(tagFor('Soft: the first words he ever hears.', 'warm')).toBe('[warm, soft] ')
      expect(tagFor('Worried, quick, not loud.', 'urgent')).toBe('[urgent, worried, quick, not loud] ')
    } finally {
      if (was === undefined) delete process.env.EL_TAG
      else process.env.EL_TAG = was
    }
  })
})
