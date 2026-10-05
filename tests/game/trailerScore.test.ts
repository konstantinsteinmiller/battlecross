import { describe, expect, it } from 'vitest'
// @ts-expect-error plain .mjs tools without types
import { SHOTS, BEAT } from '../../tools/preview-video/scenarios/cinematic-trailer.mjs'
// @ts-expect-error plain .mjs tools without types
import { BPM, TRAILER_BARS, score } from '../../tools/score-render/score.mjs'

type Shot = { id: string; beats: number }

describe('the cinematic trailer is cut on its score (#74)', () => {
  it('same tempo, same length', () => {
    expect(60_000 / BPM).toBeCloseTo(BEAT, 6)
    const beats = (SHOTS as Shot[]).reduce((n, s) => n + s.beats, 0)
    expect(beats).toBe(score('trailer').beats)
  })

  it('every shot is whole bars, and every section of the music starts on a cut', () => {
    const starts = new Set<number>()
    let t = 0
    for (const s of SHOTS as Shot[]) { expect(s.beats % 4, s.id).toBe(0); starts.add(t); t += s.beats }
    let bar = 0
    for (const [name, bars] of Object.entries(TRAILER_BARS as Record<string, number>)) {
      expect(starts.has(bar * 4), `${name} starts at beat ${bar * 4}`).toBe(true)
      bar += bars
    }
  })

  it('the game edit is a loop of whole bars that opens on a drum blow', () => {
    const g = score('game')
    expect(g.loop).toBe(true)
    expect(g.beats % 4).toBe(0)
    const first = g.events.filter((e: { t: number; inst: string }) => e.t < 0.1).map((e: { inst: string }) => e.inst)
    expect(first).toContain('taiko')
  })
})
