// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import {
  CUPS_ANTE, CUPS_BONUS_ROW, CUPS_FIRST_ROUND, CUPS_PAYOUT, CUPS_ROUNDS, CUPS_ROW, cupsNearMiss, cupsPayout, cupsRound, dealCups
} from '@/game/gamble'
import { ITEM_BY_ID } from '@/game/data/items'
import { TOWNS } from '@/game/data/zones'
import { conversationOf } from '@/game/data/dialogs'

/** The cup stand (roadmap #136): the rules, the purse and the save. */

describe('the cup stand rules', () => {
  it('the rounds only get harder, and the very first is the gentlest', () => {
    expect(CUPS_ROW).toBe(5)
    for (let i = 1; i < CUPS_ROUNDS.length; i++) {
      expect(CUPS_ROUNDS[i]!.ms).toBeLessThanOrEqual(CUPS_ROUNDS[i - 1]!.ms)
      expect(CUPS_ROUNDS[i]!.swaps).toBeGreaterThanOrEqual(CUPS_ROUNDS[i - 1]!.swaps)
      expect(CUPS_ROUNDS[i]!.cups).toBeGreaterThanOrEqual(CUPS_ROUNDS[i - 1]!.cups)
    }
    expect(CUPS_FIRST_ROUND.ms).toBeGreaterThan(CUPS_ROUNDS[0]!.ms)
    expect(CUPS_FIRST_ROUND.swaps).toBeLessThan(CUPS_ROUNDS[0]!.swaps)
    for (const r of [...CUPS_ROUNDS, CUPS_FIRST_ROUND]) expect((r.swaps * (r.ms + 30)) / 1000, 'a shuffle is a few seconds').toBeLessThan(5)
    expect(cupsRound(-3)).toEqual(CUPS_ROUNDS[0])
    expect(cupsRound(99)).toEqual(CUPS_ROUNDS.at(-1))
    expect(cupsRound(4, true)).toEqual(CUPS_FIRST_ROUND)
  })

  it('the reward curve is generous early and bounded: a first win pays three antes, the top at most twenty', () => {
    expect(cupsPayout(0)).toBe(CUPS_ANTE * 3)
    for (let i = 1; i < CUPS_PAYOUT.length; i++) expect(CUPS_PAYOUT[i]!).toBeGreaterThan(CUPS_PAYOUT[i - 1]!)
    for (let r = -2; r < 12; r++) {
      expect(cupsPayout(r)).toBeGreaterThanOrEqual(CUPS_ANTE * 3)
      expect(cupsPayout(r)).toBeLessThanOrEqual(CUPS_ANTE * 20)
    }
    // Even a blind guess at the first table is no loss: three cups, three antes.
    expect(cupsPayout(0) / CUPS_ROUNDS[0]!.cups).toBeGreaterThanOrEqual(CUPS_ANTE)
  })

  it('a deal is the same for the same seed and keeps the gem on the table', () => {
    for (const round of [...CUPS_ROUNDS, CUPS_FIRST_ROUND]) {
      for (const seed of [1, 7, 12345, 4000000000]) {
        const a = dealCups(round, seed)
        expect(dealCups(round, seed)).toEqual(a)
        expect(a.swaps).toHaveLength(round.swaps)
        expect(a.gem).toBeGreaterThanOrEqual(0)
        expect(a.gem).toBeLessThan(round.cups)
        expect(a.end).toBeGreaterThanOrEqual(0)
        expect(a.end).toBeLessThan(round.cups)
        // Replaying the swaps from the gem's slot lands where the deal says.
        let at = a.gem
        for (const [x, y] of a.swaps) {
          expect(x).not.toBe(y)
          if (at === x) at = y
          else if (at === y) at = x
        }
        expect(at).toBe(a.end)
      }
    }
    expect(dealCups(CUPS_ROUNDS[0]!, 1)).not.toEqual(dealCups(CUPS_ROUNDS[0]!, 2))
  })

  it('the gem moves: over many seeds it does not always end where it began', () => {
    let moved = 0
    for (let s = 1; s <= 60; s++) { const d = dealCups(CUPS_ROUNDS[2]!, s); if (d.end !== d.gem) moved++ }
    expect(moved).toBeGreaterThan(20)
  })

  it('a near miss is a wrong pick one slot away', () => {
    expect(cupsNearMiss(1, 2)).toBe(true)
    expect(cupsNearMiss(2, 2)).toBe(false)
    expect(cupsNearMiss(0, 2)).toBe(false)
  })
})

type P = typeof import('@/game/state/profile')
let p: P
beforeEach(async () => {
  drainAndResetModules()
  localStorage.clear()
  await holdGameState()
  p = await import('@/game/state/profile')
  p.initProfile()
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

describe('the cup stand at the save', () => {
  it('the day\'s first round is free, the next costs the ante, and no gold means no round', () => {
    p.profile.gold = 100
    expect(p.cupsFree()).toBe(true)
    expect(p.startCups()).toEqual({ free: true, first: true })
    expect(p.profile.gold).toBe(100)
    expect(p.cupsFree()).toBe(false)
    expect(p.startCups()).toEqual({ free: false, first: false })
    expect(p.profile.gold).toBe(100 - CUPS_ANTE)
    p.profile.gold = CUPS_ANTE - 1
    expect(p.cupsBlock()).toBe('gold')
    expect(p.startCups()).toBeNull()
    // Another day gives another free round, even with an empty purse.
    p.profile.gold = 0
    p.profile.meta.gamble.cups.day = '2000-01-01'
    expect(p.cupsBlock()).toBe('')
    expect(p.startCups()?.free).toBe(true)
  })

  it('a win pays by the row; the third brings a Rare, the fifth an Epic and the row starts over; a loss breaks it', () => {
    p.profile.gold = 0
    const paid: number[] = []
    let prizes = 0
    for (let k = 0; k < CUPS_ROW; k++) {
      const before = p.profile.gold
      const r = p.settleCups(true)
      paid.push(p.profile.gold - before)
      expect(r.gold).toBe(cupsPayout(k))
      if (r.prize) {
        prizes++
        if (r.prize.item) expect(ITEM_BY_ID[r.prize.item]!.tier).toBe(k + 1 === CUPS_BONUS_ROW ? 3 : 4)
        expect(k + 1 === CUPS_BONUS_ROW || k + 1 === CUPS_ROW).toBe(true)
      }
    }
    expect(paid.slice(0, 2)).toEqual(CUPS_PAYOUT.slice(0, 2).map(m => m * CUPS_ANTE))
    expect(prizes).toBe(2)
    expect(p.profile.meta.gamble.cups.row).toBe(0)
    p.settleCups(true)
    p.settleCups(true)
    expect(p.profile.meta.gamble.cups.row).toBe(2)
    const gold = p.profile.gold
    expect(p.settleCups(false)).toEqual({ gold: 0, prize: null, row: 0 })
    expect(p.profile.gold).toBe(gold)
  })

  it('an old save has no cup state and a damaged one is put right on load', () => {
    expect(p.profile.meta.gamble.cups).toEqual({ row: 0, day: '', seen: false })
    p.profile.meta.gamble.cups = { row: 99, day: 5 as unknown as string, seen: 'yes' as unknown as boolean }
    p.saveProfile()
    drainPersist()
    p.loadProfile()
    expect(p.profile.meta.gamble.cups.row).toBe(CUPS_ROW - 1)
    expect(p.profile.meta.gamble.cups.day).toBe('')
    expect(p.profile.meta.gamble.cups.seen).toBe(false)
    p.profile.meta.gamble.cups = { row: 3, day: '2026-10-18', seen: true }
    p.saveProfile()
    drainPersist()
    p.loadProfile()
    expect(p.profile.meta.gamble.cups).toEqual({ row: 3, day: '2026-10-18', seen: true })
  })
})

describe('Nell Nimblefingers', () => {
  it('stands in Sunford, early and for everyone, and hands over to the cups with a parting line', () => {
    const n = TOWNS.sunford.npcs.find(x => x.id === 'sunfordCups')!
    expect(n.role).toBe('gambler')
    expect(n.game).toBe('cups')
    expect(n.needs).toBeUndefined()
    expect(n.not).toBeUndefined()
    const conv = conversationOf('sunfordCups')!
    const opens = Object.values(conv.nodes).flatMap(x => x.choices).flatMap(c => c.effects).filter(f => f.t === 'open')
    expect(opens.map(f => (f.t === 'open' ? f.window : ''))).toEqual(['cups'])
    expect(conv.back.cups?.length).toBeGreaterThan(0)
    expect(conv.bye.length).toBeGreaterThan(0)
  })
})
