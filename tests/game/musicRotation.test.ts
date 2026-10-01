import { describe, it, expect, vi } from 'vitest'

vi.mock('virtual:asset-overrides', () => ({ default: { sfx: [], music: [], textures: [] } }))

import { getSong, songSeconds, type SongId } from '@/game/audio/songs'
import { songFor, shouldRotate, keepsPlaying, ROTATION_SIZE, ROTATE_AFTER_S } from '@/game/audio/music'

const AREAS = ['hub', 'scrapyard', 'blaze', 'cryo', 'volt', 'gale', 'magnet', 'drill', 'tide', 'neon', 'fortress'] as const
const ALL: SongId[] = [...AREAS, 'drift', 'circuit', 'boss']
const CHIP = /^c[A-Z]/

describe('music rotation', () => {
  it('rotates area theme → drift → circuit, for every area', () => {
    expect(ROTATION_SIZE).toBe(3)
    for (const a of AREAS) {
      expect([0, 1, 2, 3].map(s => songFor(a, s))).toEqual([a, 'drift', 'circuit', a])
    }
  })

  it('the intro cutscene has its own scored song: never rotated, never kept under another area', () => {
    for (const sl of [0, 1, 2]) expect(songFor('intro', sl)).toBe('intro')
    expect(shouldRotate('intro', 'intro', 999)).toBe(false)
    expect(keepsPlaying('intro', 'drift', 1)).toBe(false)
    expect(keepsPlaying('scrapyard', 'intro', 1)).toBe(false)
  })

  it('the boss fight has its own song at every slot and never rotates away', () => {
    for (const s of [0, 1, 2]) expect(songFor('boss', s)).toBe('boss')
    expect(shouldRotate('boss', 'boss', 999)).toBe(false)
    expect(shouldRotate('hub', 'boss', 999)).toBe(false)
  })

  it('hands over only once a song has played long enough', () => {
    expect(shouldRotate('scrapyard', 'scrapyard', ROTATE_AFTER_S - 1)).toBe(false)
    expect(shouldRotate('scrapyard', 'scrapyard', ROTATE_AFTER_S)).toBe(true)
    expect(shouldRotate('hub', 'drift', 57.6)).toBe(true)
  })

  it('a rotation song carries across areas; the area theme follows the area', () => {
    expect(keepsPlaying('scrapyard', 'drift', 1)).toBe(true)
    expect(keepsPlaying('hub', 'circuit', 2)).toBe(true)
    expect(keepsPlaying('scrapyard', 'hub', 0)).toBe(false)
    expect(keepsPlaying('hub', 'hub', 0)).toBe(true)
    // A boss fight always takes over, and always gives the floor back.
    expect(keepsPlaying('boss', 'drift', 1)).toBe(false)
    expect(keepsPlaying('hub', 'boss', 1)).toBe(false)
    expect(keepsPlaying('hub', null, 0)).toBe(false)
  })
})

describe('the songs', () => {
  it('the two rotation songs and the boss song are about a minute long', () => {
    for (const id of ['drift', 'circuit', 'boss'] as const) {
      const s = songSeconds(getSong(id))
      expect(s, id).toBeGreaterThan(50)
      expect(s, id).toBeLessThan(65)
    }
  })

  it('every area theme reaches the rotation threshold within two passes', () => {
    for (const a of AREAS) expect(2 * songSeconds(getSong(a)), a).toBeGreaterThanOrEqual(ROTATE_AFTER_S)
  })

  it('the new songs are not chiptune, and the area themes still are', () => {
    for (const id of ['drift', 'circuit', 'boss'] as const) {
      const insts = new Set(getSong(id).steps.flat().map(e => e.i))
      expect([...insts].filter(i => CHIP.test(i)), id).toEqual([])
    }
    for (const a of AREAS) expect(getSong(a).steps.flat().every(e => CHIP.test(e.i)), a).toBe(true)
  })

  it('the boss repeats from its first full section, not from the intro', () => {
    const b = getSong('boss')
    expect(b.loopBar).toBeGreaterThan(0)
    expect(b.loopBar).toBeLessThan(b.bars)
  })

  it('every note is well-formed', () => {
    for (const id of ALL) {
      const s = getSong(id)
      expect(s.steps.length, id).toBe(s.bars * 16)
      for (const e of s.steps.flat()) {
        expect(Number.isFinite(e.m) && e.len > 0 && e.v > 0 && e.v <= 1, `${id}/${e.i}`).toBe(true)
      }
    }
  })
})
