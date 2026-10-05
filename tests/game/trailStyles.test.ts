import { describe, expect, it } from 'vitest'
import { TRAIL_STYLES, trailStyleOf } from '@/game/gfx/trails'
import type { Held } from '@/game/gfx/rigs/humanoid'

const hand = (held: Held, off: 'none' | 'dagger' = 'none') => ({ family: 'humanoid' as const, held, off })

describe('every weapon cuts the air its own way (#74)', () => {
  it('blades, weights, a reaper and magic each have a style of their own', () => {
    expect(trailStyleOf(hand('sword'))).toBe(TRAIL_STYLES.sword)
    expect(trailStyleOf(hand('dagger'))).toBe(TRAIL_STYLES.dagger)
    expect(trailStyleOf(hand('greatsword'))).toBe(TRAIL_STYLES.greatsword)
    expect(trailStyleOf(hand('axe'))).toBe(TRAIL_STYLES.axe)
    for (const h of ['hammer', 'club', 'none'] as Held[]) expect(trailStyleOf(hand(h)), h).toBe(TRAIL_STYLES.blunt)
    expect(trailStyleOf(hand('scythe'))).toBe(TRAIL_STYLES.scythe)
    for (const h of ['staff', 'wand'] as Held[]) expect(trailStyleOf(hand(h)), h).toBe(TRAIL_STYLES.magic)
  })

  it('an off-hand dagger flicks like a dagger; claws and jaws leave strands', () => {
    expect(trailStyleOf(hand('sword', 'dagger'), true)).toBe(TRAIL_STYLES.dagger)
    for (const family of ['beast', 'spider', 'wyvern', 'dragon'] as const) {
      expect(trailStyleOf({ family, held: 'none', off: 'none' }).strands, family).toBeGreaterThan(1)
    }
  })

  it('the styles really differ: a smear has no edge, a dagger is quick, a greatsword lingers', () => {
    expect(TRAIL_STYLES.blunt.soft).toBeGreaterThan(0.5)
    expect(TRAIL_STYLES.dagger.life).toBeLessThan(TRAIL_STYLES.sword.life)
    expect(TRAIL_STYLES.greatsword.life).toBeGreaterThan(TRAIL_STYLES.sword.life)
    expect(TRAIL_STYLES.greatsword.flare).toBeGreaterThan(0)
  })
})
