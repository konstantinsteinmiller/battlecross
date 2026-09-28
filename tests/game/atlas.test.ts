// Atlas, Flux's AI companion (`sim/atlas.ts`, `audio/voice.ts`).
//
// What it says and when: a briefing on the way in, then the story so far;
// one line at a time, the urgent ones first; warnings that fire once and
// re-arm only when their cause has cleared; never a nag. Where its model is:
// in view while it talks. And the voice layer: German for German players,
// English for everyone else, and a missing or broken file is never an error
// — the line just stays a speech bubble.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { AtlasDirector, ATLAS_LINES, VOICE_WAIT, atlasKey, lineSeconds, type AtlasMissionInfo, type AtlasTick } from '@/game/sim/atlas'
import { voiceLangFor, voiceUrl, playVoice, preloadVoices, __resetVoices } from '@/game/audio/voice'
import { voiceFiles } from '@/game/assets/overrides'
import en from '@/i18n/locales/en'

const info = (o: Partial<AtlasMissionInfo> = {}): AtlasMissionInfo =>
  ({ tutorial: false, kind: 'story', template: 'boss', sector: 'blaze', freed: 1, ...o })
const tick = (o: Partial<AtlasTick> = {}): AtlasTick =>
  ({ playing: true, combat: false, hp01: 1, tanks: 1, we01: -1, level: 3, objectiveDone: false, trapNear: -1, plateNear: false, ...o })

/** Run the director for `sec` seconds; collect every line that came up. */
const run = (a: AtlasDirector, sec: number, k: AtlasTick = tick(), said: string[] = []): string[] => {
  for (let t = 0; t < sec; t += 1 / 60) {
    const before = a.line
    a.update(1 / 60, k)
    if (a.line && a.line !== before) said.push(a.line.id)
  }
  return said
}

const lookup = (key: string): unknown => key.split('.').reduce<unknown>((o, p) => (o as Record<string, unknown> | undefined)?.[p], en)

describe('Atlas: every line has its text', () => {
  it('each mission line is an English string under atlas.*', () => {
    for (const l of ATLAS_LINES) expect(typeof lookup(atlasKey(l)), atlasKey(l)).toBe('string')
  })
  it('lines are short (a small bubble)', () => {
    for (const l of ATLAS_LINES) expect((lookup(atlasKey(l)) as string).length, l).toBeLessThanOrEqual(38)
  })
})

describe('Atlas: what it says, and when', () => {
  it('briefs on the way in: the sector, then the story so far — one at a time', () => {
    const a = new AtlasDirector(info({ sector: 'cryo', freed: 2 }))
    a.event('play')
    expect(run(a, 12)).toEqual(['story.cryo', 'arc.2'])
  })

  it('a job, a climb and the tutorial get their own briefing', () => {
    for (const [i, line] of [[info({ kind: 'job' }), 'brief.job'], [info({ kind: 'job', template: 'climb' }), 'brief.climb'], [info({ tutorial: true }), 'brief.tutorial']] as const) {
      const a = new AtlasDirector(i)
      a.event('play')
      expect(run(a, 5)[0]).toBe(line)
    }
  })

  it('urgent lines go first', () => {
    const a = new AtlasDirector(info())
    a.say('idle.1')
    a.say('bossAhead')
    a.update(1 / 60, tick())
    a.say('lowHp')
    const said = run(a, 10)
    expect(said.indexOf('lowHp')).toBeLessThan(said.indexOf('idle.1'))
  })

  it('low health warns once, suggests a gel if there is one, and re-arms only after healing', () => {
    const a = new AtlasDirector(info())
    const said = run(a, 6, tick({ hp01: 0.2, tanks: 2 }))
    expect(said).toEqual(['lowHpGel'])
    run(a, 10, tick({ hp01: 0.25, tanks: 0 }), said)
    expect(said).toEqual(['lowHpGel'])
    run(a, 1, tick({ hp01: 0.9 }), said)
    run(a, 40, tick({ hp01: 0.2, tanks: 0 }), said)
    expect(said).toEqual(['lowHpGel', 'lowHp'])
  })

  it('warns of each trap once, never in the tutorial (it has its own lessons)', () => {
    const a = new AtlasDirector(info())
    const said = run(a, 4, tick({ trapNear: 3 }))
    run(a, 30, tick({ trapNear: 3 }), said)
    expect(said.filter(l => l === 'trap')).toHaveLength(1)
    const tut = new AtlasDirector(info({ tutorial: true }))
    expect(run(tut, 5, tick({ trapNear: 1 }))).not.toContain('trap')
  })

  it('low weapon energy, the objective, a level up', () => {
    const a = new AtlasDirector(info())
    const said = run(a, 4, tick({ we01: 0.1 }))
    run(a, 4, tick({ we01: 0.1, objectiveDone: true }), said)
    run(a, 4, tick({ we01: 0.1, objectiveDone: true, level: 4 }), said)
    expect(said).toEqual(['lowWe', 'objective', 'levelUp'])
  })

  it('a quiet stretch earns a little small talk, twice at most', () => {
    const a = new AtlasDirector(info())
    const said = run(a, 400)
    expect(said.filter(l => l.startsWith('idle'))).toHaveLength(2)
    // …never in a fight.
    const b = new AtlasDirector(info())
    expect(run(b, 400, tick({ combat: true }))).toEqual([])
  })

  it('flies into view while it talks, and back out after', () => {
    const a = new AtlasDirector(info())
    a.say('bossAhead')
    run(a, 1, tick({ combat: true }))
    expect(a.peek).toBeGreaterThan(0.9)
    run(a, 8, tick({ combat: true }))
    expect(a.line).toBeNull()
    expect(a.peek).toBeLessThan(0.05)
  })

  it('a recorded voice sets how long the line stays; without one, its length does', () => {
    const voiced = new AtlasDirector(info(), () => 4.2)
    voiced.say('bossAhead')
    voiced.update(1 / 60, tick())
    expect(voiced.line!.hold).toBeCloseTo(4.55, 2)
    const plain = new AtlasDirector(info(), () => null)
    plain.say('bossAhead')
    plain.update(1 / 60, tick())
    expect(plain.line!.hold).toBeGreaterThanOrEqual(lineSeconds(0))
    expect(plain.line!.hold).toBeLessThanOrEqual(lineSeconds(999))
  })
})

describe('voice-overs: German or English, and never an error', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    __resetVoices()
  })

  it('German players hear German; every other language hears English', () => {
    expect(voiceLangFor('de')).toBe('de')
    expect(voiceLangFor('de-AT')).toBe('de')
    for (const l of ['en', 'fr', 'ja', 'ar', '', null]) expect(voiceLangFor(l)).toBe('en')
  })

  it('files are found by convention (<lang>/<line id>.ogg); English stands in for a missing German one', () => {
    const files = voiceFiles(['en/atlas.lowHp.ogg', 'en/atlas.trap.mp3', 'de/atlas.lowHp.ogg', 'de/atlas.trap.mp3', 'de/atlas.trap.ogg', 'en/atlas.exit.ogg'])
    expect(voiceUrl('atlas.lowHp', 'de', files)).toMatch(/audio\/voice\/de\/atlas\.lowHp\.ogg$/)
    expect(voiceUrl('atlas.trap', 'de', files)).toMatch(/de\/atlas\.trap\.ogg$/)
    expect(voiceUrl('atlas.exit', 'de', files)).toMatch(/en\/atlas\.exit\.ogg$/)
    expect(voiceUrl('atlas.bossAhead', 'de', files)).toBeNull()
    expect(voiceUrl('atlas.bossAhead', 'en', files)).toBeNull()
  })

  it('a line without a file is never requested, logs nothing and plays nothing', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const errors = vi.spyOn(console, 'error')
    const warns = vi.spyOn(console, 'warn')
    preloadVoices(ATLAS_LINES.map(atlasKey))
    for (const l of ATLAS_LINES) expect(playVoice(atlasKey(l))).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
    expect(warns).not.toHaveBeenCalled()
  })
})

describe('Atlas: the voice loads on demand, just before its bubble', () => {
  it('a line starts loading its recording the moment it is asked for', () => {
    const prefetch = vi.fn(() => 'none' as const)
    const a = new AtlasDirector(info(), () => null, prefetch)
    a.event('landed')
    expect(prefetch).toHaveBeenCalledWith('atlas.landed')
  })

  it('a line still loading waits a moment for its voice, then plays with it', () => {
    let state: 'loading' | 'ready' = 'loading'
    const speak = vi.fn(() => (state === 'ready' ? 2 : null))
    const a = new AtlasDirector(info(), speak, () => state)
    a.event('landed')
    run(a, 0.3)
    expect(a.line).toBeNull()
    state = 'ready'
    run(a, 0.1)
    expect(a.line?.id).toBe('landed')
    expect(speak).toHaveBeenCalledWith('atlas.landed')
    expect(a.line?.hold).toBeCloseTo(2.35)
  })

  it('a voice that never arrives: the bubble goes up alone after VOICE_WAIT', () => {
    const a = new AtlasDirector(info(), () => null, () => 'loading')
    a.event('landed')
    run(a, VOICE_WAIT - 0.1)
    expect(a.line).toBeNull()
    run(a, 0.2)
    expect(a.line?.id).toBe('landed')
  })

  it('no file at all: no wait', () => {
    const a = new AtlasDirector(info(), () => null, () => 'none')
    a.event('landed')
    run(a, 1 / 60)
    expect(a.line?.id).toBe('landed')
  })
})
