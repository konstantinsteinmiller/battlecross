// The voice-over post chain (tools/voice/fx.mjs, post.mjs) and its automatic
// QA (qa.mjs): the chain each speaker gets, a take run end to end through
// ffmpeg (trimmed, levelled, shipped as OGG), and how a take passes or fails.
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
// @ts-expect-error plain .mjs tool modules, no types
import { chainFor, dynamicsFor, tailFor, vexPlace } from '../../tools/voice/fx.mjs'
// @ts-expect-error plain .mjs tool modules, no types
import { ffmpeg, measure, processTake } from '../../tools/voice/post.mjs'
// @ts-expect-error plain .mjs tool modules, no types
import { cer, judge, pickBest, wer } from '../../tools/voice/qa.mjs'

const dir = mkdtempSync(join(tmpdir(), 'voice-post-'))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

describe('the robot chains', () => {
  it('places Vex where the story has him', () => {
    expect(vexPlace('vex.present.blaze')).toBe('pa')
    expect(vexPlace('vex.mk1.obey')).toBe('clinic')
    expect(vexPlace('vex.laugh.short')).toBe('clinic')
    expect(vexPlace('vex.hub.volt')).toBe('broadcast')
  })

  it('gives each speaker its own sound, and a dry graph for A/B', () => {
    expect(chainFor('atlas', 'atlas.lowHp')).toContain('sin(2*PI*1200*t)')
    expect(chainFor('vex', 'vex.present.blaze')).toContain('rubberband=pitch=0.5')
    expect(chainFor('vex', 'vex.sting.doctorIn')).not.toContain('rubberband=pitch=0.5')
    expect(chainFor('flux', 'flux.hurt.heavy.1')).toContain('sin(2*PI*330*t)')
    expect(chainFor('gauss', 'ending.gauss')).toContain('sin(2*PI*2400*t)')
    expect(chainFor('atlas', 'atlas.lowHp', { dry: true })).not.toContain('sin(')
    expect(() => chainFor('pip', 'x')).toThrow()
  })

  it('keeps the per-line exceptions from the chains\' tables', () => {
    expect(dynamicsFor('atlas', 'atlas.warn.critical').ratio).toBe(5)
    expect(dynamicsFor('atlas', 'atlas.story.firstDraft').lufs).toBe(-19)
    expect(dynamicsFor('vex', 'vex.sting.doctorIn').lufs).toBe(-18)
    expect(tailFor('vex.laugh.short')).toBe(0.25)
  })
})

describe('a take through the chain', () => {
  it('comes out trimmed, on its loudness target and as a small mono OGG', async () => {
    const raw = join(dir, 'raw.wav')
    // 0.3 s of silence, then 1.6 s of a wobbling tone with a quiet tail: a stand-in for a read.
    await ffmpeg(['-f', 'lavfi', '-i', "aevalsrc='0.3*sin(2*PI*220*t)*(0.6+0.4*sin(2*PI*3*t))':d=1.6:s=48000", '-af', 'adelay=300', raw])
    const r = await processTake({ raw, master: join(dir, 'm.wav'), ogg: join(dir, 'a.ogg'), speaker: 'atlas', key: 'atlas.lowHp', max: 3 })
    expect(r.seconds).toBeGreaterThan(1.5)
    expect(r.seconds).toBeLessThan(1.75) // the 0.3 s lead is gone
    expect(Math.abs(r.lufs - -16)).toBeLessThan(1.5)
    expect(r.peak).toBeLessThan(-1)
    const ogg = await measure(join(dir, 'a.ogg'))
    expect(Math.abs(ogg.seconds - r.seconds)).toBeLessThan(0.05)
    expect(statSync(join(dir, 'a.ogg')).size).toBeLessThan(20_000)
  }, 60_000)

  it('tightens a take that runs a little past its max', async () => {
    const r = await processTake({ raw: join(dir, 'raw.wav'), master: join(dir, 'm2.wav'), ogg: null, speaker: 'atlas', key: 'atlas.lowHp', max: 1.6 })
    expect(r.tempo).toBeGreaterThan(1)
    expect(r.seconds).toBeLessThanOrEqual(1.62)
  }, 60_000)
})

describe('automatic QA', () => {
  it('counts wrong words, ignoring case, punctuation and accents', () => {
    expect(wer('Core online. Good morning, Flux.', 'core online good morning flux')).toBe(0)
    expect(wer('Kern online. Guten Morgen, Flux.', 'Kern Online, guten Morgen Flucks')).toBeCloseTo(0.2)
    expect(wer('Schöne Grüße', 'schone grusse')).toBe(0)
    expect(cer('The oldest! Blaze Master!', 'THE OLDEST, BLAZEMASTER!')).toBe(0)
  })

  it('fails a take on words, length, level or clipping, and says why', () => {
    const good = { text: 'Ouch! Careful, Flux!', heard: 'Ouch, careful Flux.', seconds: 1.2, lufs: -16.2, peak: -3.4, target: { lufs: -16 } }
    expect(judge(good, 3)).toMatchObject({ ok: true })
    expect(judge({ ...good, heard: 'Oh, careful Flux.' }, 3).ok).toBe(true) // one word of three may be misheard
    expect(judge({ ...good, heard: 'Oh, terrible fox.' }, 3).ok).toBe(false)
    expect(judge({ ...good, text: 'Der Älteste! Der Heißeste! Glutmeister!', heard: 'Der älteste, der heißeste Clubmeister.' }, 3).ok).toBe(false)
    expect(judge({ ...good, text: 'The hottest! Blaze Master!', heard: 'The hottest, BLAZEMASTER!' }, 3).ok).toBe(true)
    // Whisper's own habits are not the take's fault: digits, the cast's names, one added word.
    expect(judge({ ...good, text: 'Three lit. Keep glowing!', heard: '3 lit. Keep glowing.' }, 3).ok).toBe(true)
    expect(judge({ ...good, lang: 'de', text: 'Schild ist weg. Jetzt ist Vex dran!', heard: 'Schild ist weg. Jetzt ist Wechs dran.' }, 3).ok).toBe(true)
    expect(judge({ ...good, lang: 'de', text: 'Drohnenschwarm tut ihm weh!', heard: 'Der Drohnenschwarm tut ihm weh.' }, 3).ok).toBe(true)
    expect(judge({ ...good, lang: 'de', text: 'Zwei Relais! Vex schmollt.', heard: 'Zweiheles, Vex, Schmold.' }, 3).ok).toBe(false)
    // German as it sounds: a final d is a t, a doubled consonant is one.
    expect(judge({ ...good, lang: 'de', text: 'Zwei Relais! Vex schmollt.', heard: 'Zwei Relais, Vex, Schmold.' }, 3).ok).toBe(true)
    expect(judge({ ...good, text: "Blink and you'll miss it! Volt Master!", heard: "Blink and you'll miss it, Vault Master!" }, 3).ok).toBe(true)
    expect(judge({ ...good, text: 'Hmph. A new low. Literally.', heard: 'Mmm, a new low, literally.' }, 3).ok).toBe(true)
    // Cut off mid-word on purpose: the last word is whatever was left of it.
    expect(judge({ ...good, lang: 'de', text: 'Flux... da ist etwas in mei—', heard: 'Flux, da ist etwas in Mai.' }, 3).ok).toBe(true)
    // A bark is a sound: only speech added to it fails.
    expect(judge({ ...good, loose: true, text: 'Nnngh!', heard: 'Ungh.', seconds: 0.5 }, 0.6).ok).toBe(true)
    expect(judge({ ...good, loose: true, text: 'Ow!', heard: "Ow! What's safe?", seconds: 0.8 }, 0.4).ok).toBe(false)
    expect(judge({ ...good, seconds: 3.4 }, 3)).toMatchObject({ ok: true, warnings: [expect.stringMatching(/long/)] })
    expect(judge({ ...good, seconds: 4.6 }, 3).reasons[0]).toMatch(/length/)
    // A long sentence gets the time its words need, whatever the catalogue's max says.
    expect(judge({ ...good, text: 'Spikes under that ice. Walk it straight, no sharp turns.', heard: 'Spikes under that ice. Walk it straight, no sharp turns.', seconds: 3.9 }, 2.4).ok).toBe(true)
    expect(judge({ ...good, lufs: -20 }, 3).reasons[0]).toMatch(/loudness/)
    expect(judge({ ...good, peak: -0.2 }, 3).reasons[0]).toMatch(/peak/)
  })

  it('ships the passing take with the fewest wrong words', () => {
    const t = (wer: number, ok: boolean, seconds = 1) => ({ seconds, qa: { ok, wer } })
    expect(pickBest([t(0.2, true), t(0, true, 2), t(0, false)])).toEqual(t(0, true, 2))
    expect(pickBest([t(0.5, false)])).toBeNull()
  })
})
