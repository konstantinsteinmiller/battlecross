// New Game+ (`sim/ngPlus.ts`): the level cap stays at 40; the bands lift to
// it, every machine and boss gains a cycle's health, bosses get quicker, and
// starting a cycle relocks the story while Flux keeps everything he is.

import { describe, expect, it } from 'vitest'
import { NG_FOLLOW_CD, ngFollowUp, ngHpMul, ngTempo } from '@/game/sim/ngPlus'
import { SECTORS, SECTOR_BY_ID, enemyLevelFor } from '@/game/data/regions'
import { MAX_LEVEL } from '@/game/data/progression'
import { storyQuest } from '@/game/data/quests'
import { loadProfile, profile, startNewGamePlus } from '@/game/state/profile'
import { getState } from '@/use/useGameState'
import { WORLD_KEY } from '@/keys'
import { REFERENCE, simulate } from '@/game/sim/balance'

describe('New Game+ scaling', () => {
  it('a cycle adds 25% health (up to ×2), bosses 15% quicker (down to ×0.6), with follow-ups', () => {
    expect([0, 1, 2, 4, 9].map(ngHpMul)).toEqual([1, 1.25, 1.5, 2, 2])
    expect(ngTempo(0)).toBe(1)
    expect(ngTempo(1)).toBeCloseTo(0.85)
    expect(ngTempo(10)).toBe(0.6)
    expect(ngFollowUp(0)).toBe(0)
    expect(ngFollowUp(1)).toBeGreaterThan(0)
    expect(ngFollowUp(9)).toBeLessThanOrEqual(0.4)
    expect(NG_FOLLOW_CD).toBeGreaterThan(0.2)
  })

  it('lifts every band to the cap, and never past it', () => {
    const yard = SECTOR_BY_ID.scrapyard
    expect(enemyLevelFor(yard, 30, 1)).toBe(yard.levels[1])
    expect(enemyLevelFor(yard, 30, 1, 1)).toBe(31)
    for (const s of SECTORS) {
      expect(enemyLevelFor(s, MAX_LEVEL, 1, 1), s.id).toBe(MAX_LEVEL)
      expect(enemyLevelFor(s, 1, 0, 1), s.id).toBe(s.levels[0])
    }
    expect(storyQuest(SECTOR_BY_ID.blaze, 36, 0, 1).level).toBe(37)
    expect(storyQuest(SECTOR_BY_ID.blaze, 36, 0, 0).level).toBe(SECTOR_BY_ID.blaze.levels[1])
  })

  it('in the balance sim a cycle stays a real fight: no story mission past the cap, bosses as long, Flux downed sooner', () => {
    const rows = simulate(REFERENCE, 1).filter(r => r.kind === 'story')
    const first = new Map(rows.filter(r => r.cycle === 0).map(r => [r.sector, r]))
    const ng = rows.filter(r => r.cycle === 1)
    expect(ng.length).toBe(SECTORS.length)
    for (const r of ng) {
      expect(r.level, r.sector).toBeLessThanOrEqual(MAX_LEVEL)
      const f = first.get(r.sector)
      if (!f) continue // the Scrapyard was the tutorial
      expect(r.bossTtk, r.sector).toBeGreaterThanOrEqual(f.bossTtk * 0.85)
      expect(r.bossTtd, r.sector).toBeLessThanOrEqual(f.bossTtd)
    }
    // The Scrapyard's machines no longer fall in a hit or two.
    expect(ng.find(r => r.sector === 'scrapyard')!.foeTtk).toBeGreaterThanOrEqual(1.5)
  })
})

describe('starting New Game+', () => {
  it('relocks the story, keeps the hero, and is saved', () => {
    loadProfile()
    profile.level = 40
    profile.bolts = 999
    profile.hero.weapons = ['flameWave', 'iceLance']
    profile.world.unlocked = SECTORS.map(s => s.id)
    profile.world.bosses = SECTORS.map(s => s.boss)
    profile.world.tutorialDone = true
    profile.quests.storyAttempts = { story_blaze: 3 }
    startNewGamePlus()
    expect(profile.world.ngPlus).toBe(1)
    expect(profile.world.unlocked).toEqual(['scrapyard'])
    expect(profile.world.bosses).toEqual([])
    expect(profile.world.tutorialDone).toBe(true)
    expect(profile.quests.storyAttempts).toEqual({})
    expect([profile.level, profile.bolts, profile.hero.weapons.length]).toEqual([40, 999, 2])
    expect((getState(WORLD_KEY) as { ngPlus: number }).ngPlus).toBe(1)
    loadProfile()
    expect(profile.world.ngPlus).toBe(1)
    startNewGamePlus()
    expect(profile.world.ngPlus).toBe(2)
  })
})
