// A line's pause between its phrases (tools/voice/pause.mjs): found at the line's first break among Whisper's heard
// words (by letters said, so a dropped comma or a misheard word still finds it), measured in the audio, judged by QA.
import { describe, expect, it } from 'vitest'
import { boundaryOf, silenceIn } from '../../tools/voice/pause.mjs'
import { judge } from '../../tools/voice/qa.mjs'
import { LINE_DELIVERY } from '@/game/audio/voiceCards'

type W = [string, number, number]

describe('the break between two phrases', () => {
  it('is found after the words before the first comma, dash or inner exclamation, whatever Whisper heard', () => {
    const heard: W[] = [[' Fight', 0, 0.2], [' me', 0.25, 0.45], [' nightmare!', 0.6, 1.2]]
    expect(boundaryOf('Fight me, Nightmare!', heard)).toBe(2)
    // No comma heard, a word misheard ("Bite"): still after "me".
    expect(boundaryOf('Fight me, Nightmare!', [[' Bite', 0, 0.2], [' me', 0.25, 0.45], [' nightmare', 0.6, 1.2]])).toBe(2)
    expect(boundaryOf('Kämpf gegen mich — Albtraum!', [[' Kämpf', 0, 0.2], [' gegen', 0.2, 0.4], [' mich,', 0.4, 0.6], [' Albtraum!', 0.8, 1.3]])).toBe(3)
    // Written without spaces: by characters.
    expect(boundaryOf('かかってこい、ナイトメア！', [['かか', 0, 0.2], ['って', 0.2, 0.4], ['こい', 0.4, 0.6], ['ナイト', 0.8, 1], ['メア', 1, 1.2]])).toBe(3)
    // A line with no inner break has none.
    expect(boundaryOf('Someone else is hunting that beast.', [[' Someone', 0, 0.3], [' else', 0.3, 0.5]])).toBeNull()
  })

  it('is the longest silence in the window round it', () => {
    const loud = [...Array(100)].map((_, i) => !(i >= 40 && i < 58) && !(i >= 10 && i < 14))
    expect(silenceIn(loud, 0.3, 0.7)).toEqual({ gap: 0.18, at: 0.4 })
  })

  it('fails a take whose pause is out of the line\'s range, and passes one inside it', () => {
    const want = LINE_DELIVERY['dlg.bark.sbMasterAether.fight.1']!.pause!
    expect(want[0]).toBeGreaterThanOrEqual(0.1)
    expect(want[1]).toBeLessThanOrEqual(0.3)
    const take = { text: 'Fight me, Nightmare!', heard: 'Fight me, Nightmare!', lang: 'en', seconds: 1.4, peak: -3, pauseWant: want }
    expect(judge({ ...take, pause: 0.18 }, 2).ok).toBe(true)
    expect(judge({ ...take, pause: 0.04 }, 2).reasons.join()).toMatch(/pause 0\.04 s/)
    expect(judge({ ...take, pause: 0.4 }, 2).ok).toBe(false)
    expect(judge({ ...take, pause: null }, 2).reasons.join()).toMatch(/pause not found/)
    // A line that asks for no pause is not judged on one.
    expect(judge({ text: 'Hello there.', heard: 'Hello there.', lang: 'en', seconds: 1, peak: -3 }, 2).ok).toBe(true)
  })
})
