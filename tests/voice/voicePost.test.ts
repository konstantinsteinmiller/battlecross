// The voice-over post chain (tools/voice/fx.mjs, post.mjs) and its automatic
// QA (qa.mjs): the chain each speaker gets, a take run end to end through
// ffmpeg (trimmed, levelled, shipped as OGG), and how a take passes or fails.
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { FX_SPEAKERS, chainFor, dynamicsFor, tailFor } from '../../tools/voice/fx.mjs'
import { ffmpeg, measure, processTake } from '../../tools/voice/post.mjs'
import { cer, judge, pickBest, wer } from '../../tools/voice/qa.mjs'

const dir = mkdtempSync(join(tmpdir(), 'voice-post-'))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

describe('the chains', () => {
  it('keeps people clean and gives only the creatures a light effect', () => {
    for (const s of ['hero', 'heroine', 'elderMara', 'smalltalkKids']) {
      const g = chainFor(s, `dlg.${s}.x`)
      expect(g, s).not.toContain('rubberband')
      expect(g, s).not.toContain('aecho')
      expect(g, s).not.toContain('acrusher')
    }
    expect(chainFor('goblinKing', 'k')).toContain('rubberband=pitch=1.09')
    expect(chainFor('goblinTrader', 'k')).toContain('equalizer=f=1100')
    expect(chainFor('dragon', 'k')).toContain('rubberband=pitch=0.5')
    expect(chainFor('archDemon', 'k')).toContain('aecho')
    expect(FX_SPEAKERS).toEqual(['goblinKing', 'goblinTrader', 'dragon', 'archDemon'])
    // Nobody is crushed: a crushed layer reads as "crisping".
    for (const s of FX_SPEAKERS) expect(chainFor(s, 'k')).not.toContain('acrusher')
    expect(chainFor('dragon', 'k', { dry: true })).not.toContain('rubberband')
  })

  it('levels everyone alike, the soft voices a touch under, and lets a creature\'s room ring', () => {
    expect(dynamicsFor('hero').lufs).toBe(-16)
    expect(dynamicsFor('somebodyNew').lufs).toBe(-16)
    expect(dynamicsFor('trainerShadow').lufs).toBe(-17)
    expect(tailFor('dragon')).toBe(0.3)
    expect(tailFor('hero')).toBe(0.05)
  })
})

describe('a take through the chain', () => {
  it('comes out trimmed, on its loudness target and as a small mono OGG', async () => {
    const raw = join(dir, 'raw.wav')
    // 0.3 s of silence, then 1.6 s of a wobbling tone with a quiet tail: a stand-in for a read.
    await ffmpeg(['-f', 'lavfi', '-i', "aevalsrc='0.3*sin(2*PI*220*t)*(0.6+0.4*sin(2*PI*3*t))':d=1.6:s=48000", '-af', 'adelay=300', raw])
    const r = await processTake({ raw, master: join(dir, 'm.wav'), ogg: join(dir, 'a.ogg'), speaker: 'hero', key: 'dlg.hero.bye', max: 3 })
    expect(r.seconds).toBeGreaterThan(1.5)
    expect(r.seconds).toBeLessThan(1.75) // the 0.3 s lead is gone
    expect(Math.abs(r.lufs - -16)).toBeLessThan(1.5)
    expect(r.peak).toBeLessThan(-1)
    const ogg = await measure(join(dir, 'a.ogg'))
    expect(Math.abs(ogg.seconds - r.seconds)).toBeLessThan(0.05)
    expect(statSync(join(dir, 'a.ogg')).size).toBeLessThan(20_000)
  }, 60_000)

  it('tightens a take that runs a little past its max', async () => {
    const r = await processTake({ raw: join(dir, 'raw.wav'), master: join(dir, 'm2.wav'), ogg: null, speaker: 'hero', key: 'dlg.hero.bye', max: 1.6 })
    expect(r.tempo).toBeGreaterThan(1)
    expect(r.seconds).toBeLessThanOrEqual(1.62)
  }, 60_000)

  it('runs a creature\'s layered chain through ffmpeg', async () => {
    const r = await processTake({ raw: join(dir, 'raw.wav'), master: join(dir, 'm3.wav'), ogg: null, speaker: 'dragon', key: 'dlg.quest.dragon.ask.1', max: 3 })
    expect(Math.abs(r.lufs - -15)).toBeLessThan(1.5)
    expect(r.peak).toBeLessThan(-1)
  }, 60_000)
})

describe('automatic QA', () => {
  it('counts wrong words, ignoring case, punctuation and accents', () => {
    expect(wer("I'll let you get on.", 'I will let you get on')).toBeCloseTo(1 / 6)
    expect(wer('Back for proper steel?', 'back for proper steel')).toBe(0)
    expect(cer('Hilda Hammerhand.', 'HILDAHAMMERHAND')).toBe(0)
  })

  it('fails a take on words, length, level or clipping, and says why', () => {
    const good = { text: 'Back again. What can I do for you?', heard: 'Back again, what can I do for you?', seconds: 1.9, lufs: -16.2, peak: -3.4, target: { lufs: -16 } }
    expect(judge(good, 3)).toMatchObject({ ok: true })
    expect(judge({ ...good, heard: 'Black rain. Who can I sue?' }, 3).ok).toBe(false)
    // Whisper's own habits are not the take's fault: digits, one added word, a joined name.
    expect(judge({ ...good, text: 'Two silver for a cabbage. Two!', heard: '2 silver for a cabbage, 2!' }, 3).ok).toBe(true)
    expect(judge({ ...good, text: 'Goblins took three hens off the Miller farm.', heard: 'The goblins took three hens off the Miller farm.' }, 3).ok).toBe(true)
    expect(judge({ ...good, text: 'Hilda Hammerhand.', heard: 'Hilda Hammer Hand.' }, 3).ok).toBe(true)
    // British spellings and homophones Whisper writes its own way.
    expect(judge({ ...good, text: 'Mana draught. Tastes like old coins, but it works.', heard: 'Mana draft. Tastes like old coins, but it works.' }, 4).ok).toBe(true)
    expect(judge({ ...good, text: 'Nobody\'s taken the plains road in a week.', heard: 'Nobody\'s taken the plane\'s road in a week.' }, 4).ok).toBe(true)
    expect(judge({ ...good, text: 'Horseshoes, ploughs, the odd sword.', heard: 'Horseshoes, plows, the odd sword.' }, 4).ok).toBe(true)
    // Short lines (≤ 3 words) may lose one word to Whisper.
    expect(judge({ ...good, text: 'Any good?', heard: 'Any could?' }, 3).ok).toBe(true)
    expect(judge({ ...good, seconds: 4.2 }, 3)).toMatchObject({ ok: true, warnings: [expect.stringMatching(/long/)] })
    expect(judge({ ...good, seconds: 6 }, 3).reasons[0]).toMatch(/length/)
    expect(judge({ ...good, lufs: -20 }, 3).reasons[0]).toMatch(/loudness/)
    expect(judge({ ...good, peak: -0.2 }, 3).reasons[0]).toMatch(/peak/)
  })

  it('ships the passing take with the fewest wrong words', () => {
    const t = (wer: number, ok: boolean, seconds = 1) => ({ seconds, qa: { ok, wer } })
    expect(pickBest([t(0.2, true), t(0, true, 2), t(0, false)])).toEqual(t(0, true, 2))
    expect(pickBest([t(0.5, false)])).toBeNull()
  })
})
