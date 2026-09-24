import { beforeEach, describe, expect, it } from 'vitest'
import { grantXp, lifetimeXp, profile } from '@/game/state/profile'
import { MAX_LEVEL, xpToNext, xpToReach } from '@/game/data/progression'

/**
 * Lifetime XP is the leaderboard's score. The board's whole write rule
 * ("post only on a personal record") depends on it only ever growing, so these
 * pin exactly that — including past the level cap, where the bar stops.
 */

beforeEach(() => {
  profile.level = 1
  profile.hero.xp = 0
  profile.hero.pendingAttrs = 0
  profile.stats.xpEarned = 0
  profile.stats.bestLevel = 1
})

describe('lifetime XP', () => {
  it('counts every grant, across level-ups', () => {
    grantXp(50)
    grantXp(xpToNext(1))
    expect(lifetimeXp()).toBe(50 + xpToNext(1))
    expect(profile.level).toBe(2)
  })

  it('keeps counting after the cap, where the bar stops filling', () => {
    profile.level = MAX_LEVEL
    profile.hero.xp = 0
    profile.stats.xpEarned = xpToReach(MAX_LEVEL)
    grantXp(xpToNext(MAX_LEVEL) * 3)
    expect(profile.level).toBe(MAX_LEVEL)
    expect(profile.hero.xp).toBe(xpToNext(MAX_LEVEL))
    expect(lifetimeXp()).toBe(xpToReach(MAX_LEVEL) + xpToNext(MAX_LEVEL) * 3)
  })

  it('floors a save from before the stat existed at what its level proves', () => {
    profile.level = 12
    profile.hero.xp = 100
    profile.stats.xpEarned = 0
    expect(lifetimeXp()).toBe(xpToReach(12) + 100)
    // The next grant builds on that floor instead of starting from zero.
    grantXp(10)
    expect(lifetimeXp()).toBe(xpToReach(12) + 110)
  })

  it('never goes down', () => {
    let last = lifetimeXp()
    for (const gain of [0, 5, 0, 120, 3000, 0, 7]) {
      grantXp(gain)
      expect(lifetimeXp()).toBeGreaterThanOrEqual(last)
      last = lifetimeXp()
    }
  })
})
