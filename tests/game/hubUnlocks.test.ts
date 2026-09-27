// The lab's menus open one at a time (src/components/hub/hubUnlocks.ts): the
// first visit shows Missions and Flux; the Workshop opens after two finished
// missions, Circuits after three, the leaderboard pill after four. Only
// successes count (the tutorial is one), and a player from before the
// unlocks keeps every menu they had.
//
// Pure: the rules read a profile and answer. The component half is
// tests/ui/hubUnlocks.test.ts.

import { describe, expect, it } from 'vitest'
import {
  HUB_UNLOCKS, ALL_OPEN, FLOOR_TIP, isUnlocked, missionsLeft, needFor, finishedMissions, usedOldLab,
  unlockFloor, unlockCount, isFresh, toAnnounce, unlockedTip, openedTip, placeTip,
  type HubMenu, type UnlockProfile
} from '@/components/hub/hubUnlocks'
import { getState } from '@/use/useGameState'
import { QUESTS_DONE_KEY } from '@/keys'
import { profile, saveProfile, loadProfile, setSaveSandbox } from '@/game/state/profile'

/** A profile as the rules read it: a new player unless told otherwise. */
const make = (over: Partial<UnlockProfile> = {}): UnlockProfile => ({
  questsDone: 0,
  story: 0,
  tips: {},
  world: { bosses: [], tutorialDone: false },
  inv: { items: [{ upg: 0 }, { upg: 0 }] },
  hero: { skills: {} },
  stats: { lastDropAt: 0 },
  ...over
})
const MENUS: HubMenu[] = ['missions', 'hero', 'workshop', 'circuits', 'leaderboard']
const openAt = (n: number) => MENUS.filter(id => isUnlocked(id, n))

describe('the unlock table', () => {
  it('is Missions and Flux from the start, then Workshop 2, Circuits 3, leaderboard 4', () => {
    expect(HUB_UNLOCKS).toEqual([
      { id: 'missions', need: 0 },
      { id: 'hero', need: 0 },
      { id: 'workshop', need: 2 },
      { id: 'circuits', need: 3 },
      { id: 'leaderboard', need: 4 }
    ])
    expect(ALL_OPEN).toBe(4)
  })

  it('opens each menu exactly at its threshold', () => {
    expect(openAt(0)).toEqual(['missions', 'hero'])
    expect(openAt(1)).toEqual(['missions', 'hero'])
    expect(openAt(2)).toEqual(['missions', 'hero', 'workshop'])
    expect(openAt(3)).toEqual(['missions', 'hero', 'workshop', 'circuits'])
    expect(openAt(4)).toEqual(MENUS)
    expect(openAt(40)).toEqual(MENUS)
    for (const { id, need } of HUB_UNLOCKS) {
      expect(needFor(id)).toBe(need)
      if (need > 0) expect(isUnlocked(id, need - 1)).toBe(false)
      expect(isUnlocked(id, need)).toBe(true)
    }
  })

  it('counts down the missions a locked menu still waits for', () => {
    expect(missionsLeft('workshop', 0)).toBe(2)
    expect(missionsLeft('workshop', 1)).toBe(1)
    expect(missionsLeft('leaderboard', 1)).toBe(3)
    expect(missionsLeft('circuits', 3)).toBe(0)
    expect(missionsLeft('hero', 0)).toBe(0)
  })
})

describe('finished missions', () => {
  it('is the success counter (the tutorial counts; deaths and retreats never reach it)', () => {
    // finishMission bumps `questsDone` on a success only; `stats.missions` and
    // `stats.deaths` (every end) are not read.
    const p = { ...make({ questsDone: 1, world: { bosses: ['scrapper'], tutorialDone: true } }), stats: { lastDropAt: 0, missions: 7, deaths: 6 } }
    expect(finishedMissions(p)).toBe(1)
    expect(finishedMissions(make({ questsDone: 3 }))).toBe(3)
  })

  it('never reads lower than the story: a missing or lagging counter still counts beaten bosses and the tutorial', () => {
    expect(finishedMissions(make({ world: { bosses: [], tutorialDone: true } }))).toBe(1)
    expect(finishedMissions(make({ story: 2, world: { bosses: ['scrapper', 'blazeMaster'], tutorialDone: true } }))).toBe(2)
    expect(finishedMissions(make({ questsDone: undefined as unknown as number, world: { bosses: ['a', 'b', 'c'], tutorialDone: true } }))).toBe(3)
  })
})

describe('players from before the unlocks keep their menus', () => {
  const legacy: Array<[string, Partial<UnlockProfile>]> = [
    ['took the upgrade tour', { tips: { 'lesson:upgrade': true } }],
    ['started it (the wallet top-up)', { tips: { 'lesson:upgradeGrant': true } }],
    ['upgraded an item', { inv: { items: [{ upg: 0 }, { upg: 2 }] } }],
    ['ranked a circuit', { hero: { skills: { overclock: 1 } } }],
    ['claimed a supply drop', { stats: { lastDropAt: 1_700_000_000_000 } }]
  ]

  it.each(legacy)('a save that %s has been in the old lab: every menu stays open', (_, over) => {
    // One finished mission (the tutorial) would open nothing new by itself.
    const p = make({ questsDone: 1, world: { bosses: ['scrapper'], tutorialDone: true }, ...over })
    expect(usedOldLab(p)).toBe(true)
    expect(unlockFloor(p)).toBe(ALL_OPEN)
    expect(openAt(unlockCount(p))).toEqual(MENUS)
  })

  it('a new player has no floor: the table alone decides', () => {
    const p = make({ questsDone: 1 })
    expect(usedOldLab(p)).toBe(false)
    expect(unlockCount(p)).toBe(1)
  })

  it('the floor, once decided on the first lab visit, is what counts from then on', () => {
    // A new player who later upgrades (the Workshop is open at 2) is not
    // mistaken for a returning one: Circuits still waits for mission 3.
    const p = make({ questsDone: 2, tips: { [FLOOR_TIP]: 0 }, inv: { items: [{ upg: 1 }] } })
    expect(unlockCount(p)).toBe(2)
    expect(isUnlocked('circuits', unlockCount(p))).toBe(false)
    // …and a returning player's floor stays whatever else changes.
    expect(unlockCount(make({ tips: { [FLOOR_TIP]: ALL_OPEN } }))).toBe(ALL_OPEN)
  })

  it('a count above the floor still wins', () => {
    expect(unlockCount(make({ questsDone: 9, tips: { [FLOOR_TIP]: 0 } }))).toBe(9)
  })
})

describe('the "new" badge flags', () => {
  it('announces a menu once it is open, and only once', () => {
    const p = make({ questsDone: 2, tips: { [FLOOR_TIP]: 0 } })
    expect(toAnnounce(p, MENUS)).toEqual(['workshop'])
    p.tips[unlockedTip('workshop')] = true
    expect(toAnnounce(p, MENUS)).toEqual([])
    expect(isFresh(p, 'workshop')).toBe(true)
    p.tips[openedTip('workshop')] = true
    expect(isFresh(p, 'workshop')).toBe(false)
  })

  it('never announces the menus that are always open', () => {
    expect(toAnnounce(make({ questsDone: 4, tips: { [FLOOR_TIP]: 0 } }), MENUS)).toEqual(['workshop', 'circuits', 'leaderboard'])
  })
})

describe('the lock hint stays on screen', () => {
  const view = { width: 412, height: 915 }
  const none = { top: 0, right: 0, bottom: 0, left: 0 }
  const tip = { width: 200, height: 40 }

  it('sits centred above its control, pointing at it', () => {
    const at = placeTip({ left: 150, top: 820, width: 100, height: 60 }, tip, view, none)
    expect(at).toEqual({ x: 100, y: 772, below: false, arrow: 100 })
  })

  it('is pushed in from the right edge (the Workshop tab), the pointer still on the tab', () => {
    const tab = { left: 312, top: 820, width: 92, height: 60 }
    const at = placeTip(tab, tip, view, { top: 0, right: 20, bottom: 0, left: 0 })
    expect(at.x).toBe(412 - 20 - 8 - 200)
    expect(at.x + tip.width).toBeLessThanOrEqual(412 - 20)
    expect(at.x + at.arrow).toBeCloseTo(tab.left + tab.width / 2)
  })

  it('is pushed in from the left edge past a notch', () => {
    const at = placeTip({ left: 0, top: 820, width: 80, height: 60 }, tip, view, { top: 0, right: 0, bottom: 0, left: 44 })
    expect(at.x).toBe(52)
    // The pointer stays on the hint's rounded body.
    expect(at.arrow).toBe(12)
  })

  it('goes under a control at the top of the screen (the leaderboard pill), below the notch', () => {
    const pill = { left: 330, top: 20, width: 36, height: 36 }
    const at = placeTip(pill, tip, { width: 915, height: 412 }, { top: 24, right: 0, bottom: 0, left: 0 })
    expect(at.below).toBe(true)
    expect(at.y).toBe(20 + 36 + 8)
  })

  it('never leaves the bottom either, however tall', () => {
    const at = placeTip({ left: 10, top: 10, width: 30, height: 380 }, { width: 200, height: 120 }, { width: 915, height: 412 }, { top: 0, right: 0, bottom: 21, left: 0 })
    expect(at.y + 120).toBeLessThanOrEqual(412 - 21)
    expect(at.y).toBeGreaterThanOrEqual(8)
  })
})

describe('a /levels test run counts nothing', () => {
  it('its finished mission never reaches the save, so no menu opens from it', () => {
    profile.questsDone = 1
    saveProfile()
    setSaveSandbox(true)
    try {
      // What finishMission does on a success, on the sandbox.
      profile.questsDone++
      saveProfile()
      expect(getState(QUESTS_DONE_KEY)).toBe(1)
    } finally {
      setSaveSandbox(false)
    }
    // Leaving the run re-reads the save (`endTestRun` → `loadProfile`).
    loadProfile()
    expect(profile.questsDone).toBe(1)
    expect(isUnlocked('workshop', unlockCount(profile))).toBe(false)
  })
})
