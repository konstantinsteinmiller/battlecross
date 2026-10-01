// The numbers the whole loop stands on: the XP curve, loot rolls and the job
// board. Each is pure, so the contract is asserted without a scene.

import { describe, expect, it } from 'vitest'
import { xpToNext, addXp, MAX_LEVEL } from '@/game/data/progression'
import { rollItem, mainStat, upgradeCost, RARITY_AFFIXES, BASE_BY_ID, MAX_UPG, RARITIES } from '@/game/data/items'
import { rollJob, storyQuest, tutorialQuest } from '@/game/data/quests'
import { SECTORS, SECTOR_BY_ID } from '@/game/data/regions'

describe('XP curve', () => {
  it('asks for more XP at every level', () => {
    for (let l = 1; l < MAX_LEVEL; l++) expect(xpToNext(l + 1)).toBeGreaterThan(xpToNext(l))
  })

  it('carries overflow XP across several level-ups', () => {
    const big = xpToNext(1) + xpToNext(2) + 5
    const r = addXp(1, 0, big)
    expect(r.level).toBe(3)
    expect(r.gained).toBe(2)
    expect(r.xp).toBe(5)
  })

  it('stops at the level cap', () => {
    const r = addXp(MAX_LEVEL - 1, 0, 10_000_000)
    expect(r.level).toBe(MAX_LEVEL)
    expect(r.xp).toBeLessThanOrEqual(xpToNext(MAX_LEVEL))
  })
})

describe('loot', () => {
  it('rolls the same item for the same seed (ids aside)', () => {
    const strip = (s: number) => { const { id: _id, ...rest } = rollItem(s, 6); return rest }
    expect(strip(99)).toEqual(strip(99))
  })

  it('gives each rarity its number of affixes, on a real base', () => {
    for (let s = 1; s < 400; s++) {
      const it = rollItem(s * 7919, 1 + (s % 30))
      expect(BASE_BY_ID[it.base], `seed ${s}`).toBeDefined()
      // Chips are all affixes (no main stat), so they roll one more.
      expect(it.affixes.length, `seed ${s}`).toBe(RARITY_AFFIXES[it.rarity] + (it.slot === 'chip' ? 1 : 0))
      expect(new Set(it.affixes.map(a => a.id)).size, `seed ${s}: duplicate affix`).toBe(it.affixes.length)
    }
  })

  it('honours a guaranteed rarity (boss rewards)', () => {
    for (let s = 1; s < 50; s++) expect(rollItem(s, 8, { rarity: 'prototype' }).rarity).toBe('prototype')
  })

  it('every rarity can drop', () => {
    const seen = new Set<string>()
    for (let s = 1; s < 3000 && seen.size < RARITIES.length; s++) seen.add(rollItem(s * 31, 10, { bias: 1 }).rarity)
    expect([...seen].sort()).toEqual([...RARITIES].sort())
  })

  it('upgrades raise the main stat and cost more each time', () => {
    const it = rollItem(4, 5, { slot: 'buster' })
    let prevStat = mainStat(it)
    let prevCost = upgradeCost(it)
    for (let u = 1; u <= MAX_UPG; u++) {
      const up = { ...it, upg: u }
      expect(mainStat(up)).toBeGreaterThan(prevStat)
      expect(upgradeCost(up)).toBeGreaterThan(prevCost)
      prevStat = mainStat(up)
      prevCost = upgradeCost(up)
    }
  })
})

describe('missions', () => {
  it('the tutorial is the Scrapyard story mission', () => {
    const q = tutorialQuest()
    expect(q.template).toBe('tutorial')
    expect(q.sector).toBe('scrapyard')
    expect(q.reward.xp).toBeGreaterThan(0)
  })

  it('jobs are deterministic and well-formed', () => {
    const unlocked = SECTORS.slice(0, 3).map(s => s.id)
    for (let s = 1; s < 500; s++) {
      const seed = (s * 1103515245 + 12345) >>> 0
      const a = rollJob(seed, unlocked, 6)
      expect(rollJob(seed, unlocked, 6)).toEqual(a)
      expect(unlocked).toContain(a.sector)
      expect(a.reward.xp).toBeGreaterThan(0)
      expect(a.reward.bolts).toBeGreaterThan(0)
      if (a.template === 'kill') {
        expect(a.target).not.toBeNull()
        expect(a.count).toBeGreaterThanOrEqual(5)
        expect(a.count).toBeLessThanOrEqual(9)
      }
      if (a.template === 'elite') expect(a.target).not.toBeNull()
      if (a.template === 'collect') expect(a.count).toBeGreaterThanOrEqual(3)
      if (a.template === 'supply') expect(a.count).toBeGreaterThanOrEqual(3)
    }
  })

  it('story missions end in a Core Master fight: a platform stage in every sector after the Scrapyard', () => {
    for (const s of SECTORS) {
      if (s.id === 'scrapyard') continue
      const q = storyQuest(SECTOR_BY_ID[s.id], 10, 0)
      expect(q.kind).toBe('story')
      expect(q.template).toBe('stage')
      expect(q.reward.guaranteed).toBe('prototype')
    }
  })
})
