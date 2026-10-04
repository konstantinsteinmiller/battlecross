// Every voice in data/voice-manifest.json has a card (src/game/audio/
// voiceCards.ts), and every card asks the voice-design model for a clean
// human voice with a reference text long enough to clone from.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CARDS, DIRECTIONS, TONES, TONES_LIST, directionOf, toneOf, voiceOf } from '@/game/audio/voiceCards'

const manifest = JSON.parse(readFileSync(resolve(__dirname, '../../data/voice-manifest.json'), 'utf8'))

describe('voice cards', () => {
  it('cover every voice of the manifest', () => {
    const voices = [...new Set<string>(manifest.lines.map(voiceOf))]
    expect(voices.filter(v => !CARDS[v]), 'add a card to voiceCards.ts').toEqual([])
  })

  it('give the children\'s small talk a child to answer, never a grown man', () => {
    expect(voiceOf({ speaker: 'townsfolk', scene: 'smalltalkKids' })).toBe('kidFriend')
    expect(voiceOf({ speaker: 'townsfolk', scene: 'smalltalkSunford' })).toBe('townsfolk')
    expect(voiceOf({ speaker: 'elderMara', scene: 'elderMara' })).toBe('elderMara')
  })

  it('ask for a clean human voice, read from a 20–45 word reference', () => {
    for (const [id, c] of Object.entries(CARDS)) {
      expect(c.designPrompt.en, id).toMatch(/Clean, close-miked studio recording, no reverb, no background noise\.$/)
      // The effect is the FX chain's job (tools/voice/fx.mjs), never the model's.
      expect(c.designPrompt.en.replace(/Clean, close-miked.*$/, ''), id).not.toMatch(/robot|synth|metallic|vocoder|echo|reverb/i)
      const words = c.referenceText.en.split(/\s+/).length
      expect(words, id).toBeGreaterThanOrEqual(20)
      expect(words, id).toBeLessThanOrEqual(45)
    }
  })

  it('turn every emotion into a known tone and a direction', () => {
    const emotions = [...new Set<string>(manifest.lines.map((l: { emotion: string }) => l.emotion))]
    for (const e of emotions) {
      expect(TONES_LIST, e).toContain(TONES[e])
      expect(DIRECTIONS[e], e).toBeTruthy()
    }
    expect(toneOf({ emotion: 'cold' })).toBe('deadpan')
    expect(toneOf({ emotion: 'cold', tone: 'menacing' })).toBe('menacing')
    expect(directionOf({ emotion: 'warm', gesture: 'nod' })).toBe('Warm and kind, a smile in the voice. (With a nod.)')
  })
})
