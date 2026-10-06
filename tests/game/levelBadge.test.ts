import { describe, expect, it } from 'vitest'
import { LEVEL_TIERS, LEVEL_TIER_COLORS, unitLevelTier } from '@/game/data/zones'
import { barBadge } from '@/game/gfx/markers'

/**
 * Every enemy's level, on the colour of how it sits against the hero's
 * (roadmap #77): the same five tiers as the map's badges.
 */

describe('an enemy level badge (#77)', () => {
  it('sorts a level into the five tiers by its gap to the hero', () => {
    const at = (gap: number): string => unitLevelTier(20 + gap, 20)
    expect(at(-5)).toBe('low')
    expect(at(-3)).toBe('low')
    expect(at(-2)).toBe('match')
    expect(at(0)).toBe('match')
    expect(at(1)).toBe('match')
    expect(at(2)).toBe('above')
    expect(at(6)).toBe('above')
    expect(at(7)).toBe('high')
    expect(at(9)).toBe('high')
    expect(at(10)).toBe('deadly')
  })

  it('has a colour for every tier, the map\'s own', () => {
    for (const t of LEVEL_TIERS) expect(LEVEL_TIER_COLORS[t].bg).toMatch(/^#[0-9a-f]{6}$/)
    expect(LEVEL_TIER_COLORS.above.bg).toBe('#e07a1c')
  })

  it('packs tier and level into the bar\'s one number, and back', () => {
    const b = barBadge(27, 'high')
    expect(Math.floor(b / 100)).toBe(LEVEL_TIERS.indexOf('high') + 1)
    expect(b % 100).toBe(27)
    expect(barBadge(3, 'low')).toBe(103)
    // Never spills into the tier's digits.
    expect(barBadge(140, 'deadly') % 100).toBe(99)
  })
})
