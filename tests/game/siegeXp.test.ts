// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { siegeXp } from '@/game/flow'
import { xpToNext, xpToReach } from '@/game/data/progression'

describe('the siege reward', () => {
  it('lifts a level 1 or 2 hero to level 3, wherever in the bar he stands', () => {
    expect(xpToReach(1) + 0 + siegeXp(1, 0)).toBe(xpToReach(3))
    expect(xpToReach(2) + 10 + siegeXp(2, 10)).toBe(xpToReach(3))
  })
  it('lifts a level 3 hero to level 4', () => {
    expect(xpToReach(3) + 5 + siegeXp(3, 5)).toBe(xpToReach(4))
  })
  it('pays half the bar from level 4 up', () => {
    expect(siegeXp(4, 0)).toBe(Math.round(xpToNext(4) * 0.5))
    expect(siegeXp(7, 99)).toBe(Math.round(xpToNext(7) * 0.5))
  })
})
