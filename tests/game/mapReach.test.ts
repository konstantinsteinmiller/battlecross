import { describe, expect, it } from 'vitest'
import { ZONES, levelTier, nodeOpen, nodeReachable } from '@/game/data/zones'

/** The world map past the fog (roadmap #72). */

describe('where the hero may go', () => {
  it('anywhere without a story lock, open or not; the colosseum and the rift wait for their story', () => {
    const none = new Set<string>()
    expect(nodeOpen('fortress', none, none)).toBe(false)
    expect(nodeReachable('fortress', none)).toBe(true)
    expect(nodeReachable('citadel', none)).toBe(true)
    expect(nodeReachable('arena', none)).toBe(false)
    expect(nodeReachable('arena', new Set(['arenaOpen']))).toBe(true)
    expect(nodeReachable('rift', none)).toBe(false)
    expect(nodeReachable('rift', new Set(['throneDone']))).toBe(true)
  })
})

describe('the level badge on a place\'s name', () => {
  const z = ZONES.woods
  it('says how the zone sits against the hero: below, a match, above, well above (7+), deadly (10+)', () => {
    expect(levelTier(z, z.max + 1)).toBe('low')
    expect(levelTier(z, z.min)).toBe('match')
    expect(levelTier(z, z.max)).toBe('match')
    expect(levelTier(z, z.min - 1)).toBe('above')
    expect(levelTier(z, z.min - 6)).toBe('above')
    expect(levelTier({ ...z, min: 20, max: 22 }, 13)).toBe('high')
    expect(levelTier({ ...z, min: 30, max: 30 }, 20)).toBe('deadly')
    expect(levelTier({ ...z, min: 30, max: 30 }, 21)).toBe('high')
  })
})
