import { describe, expect, it } from 'vitest'
import {
  BATTLE_ROW, MEMORY_ROUNDS, MEMORY_ROW, battleFee, battleRound, battleXp, dealMemory, gamblerItem, memoryRound, memoryStakes, prizeOf
} from '@/game/gamble'
import { ITEMS, sellValue } from '@/game/data/items'

/** The gamblers' rules (roadmap #91, #92, D110, D111, D113). */

describe('the memory stand', () => {
  it('every win in the row leaves less time; the fifth is the hardest, 70 s down to 34 s', () => {
    expect(MEMORY_ROW).toBe(5)
    expect(MEMORY_ROUNDS[0]!.seconds).toBe(70)
    expect(MEMORY_ROUNDS.at(-1)!.seconds).toBe(34)
    for (let i = 1; i < MEMORY_ROUNDS.length; i++) {
      expect(MEMORY_ROUNDS[i]!.seconds).toBeLessThan(MEMORY_ROUNDS[i - 1]!.seconds)
      expect(MEMORY_ROUNDS[i]!.pairs).toBeGreaterThanOrEqual(MEMORY_ROUNDS[i - 1]!.pairs)
    }
    expect(memoryRound(-1)).toEqual(MEMORY_ROUNDS[0])
    expect(memoryRound(99)).toEqual(MEMORY_ROUNDS.at(-1))
  })

  it('deals each pair twice, shuffled, the same for the same seed', () => {
    const a = dealMemory(8, 42)
    expect(a).toHaveLength(16)
    for (let p = 0; p < 8; p++) expect(a.filter(c => c === p)).toHaveLength(2)
    expect(dealMemory(8, 42)).toEqual(a)
    expect(dealMemory(8, 43)).not.toEqual(a)
    expect(a).not.toEqual([...a].sort((x, y) => x - y))
  })

  it('takes three bets that grow with the hero, in fives', () => {
    for (const l of [1, 10, 30]) {
      const s = memoryStakes(l)
      expect(s[0]).toBeLessThan(s[1])
      expect(s[1]).toBeLessThan(s[2])
      for (const v of s) expect(v % 5).toBe(0)
    }
    expect(memoryStakes(30)[0]).toBeGreaterThan(memoryStakes(1)[2])
  })
})

describe('the item battle', () => {
  it('a low fee and a little experience, both by level', () => {
    expect(battleFee(1)).toBe(12)
    expect(battleFee(20)).toBe(50)
    expect(battleXp(10)).toBeGreaterThan(battleXp(2))
    expect(BATTLE_ROW).toBe(3)
  })

  it('the gambler lays dearer things the further into a game and the longer the row, never a Legendary', () => {
    for (const level of [1, 8, 15, 22, 30]) {
      for (let seed = 1; seed < 20; seed++) {
        const first = gamblerItem(level, 0, 0, seed)
        const last = gamblerItem(level, 2, 2, seed)
        expect(last.tier).toBeGreaterThanOrEqual(first.tier)
        expect(first.tier).toBeLessThan(6)
        expect(last.tier).toBeLessThan(6)
      }
    }
    expect(gamblerItem(8, 0, 0, 5)).toEqual(gamblerItem(8, 0, 0, 5))
  })

  it('the dearer item takes the point; a tie goes to the house', () => {
    const cheap = ITEMS.find(i => i.tier === 1)!
    const dear = ITEMS.find(i => i.tier === 4)!
    expect(battleRound(dear, cheap)).toBe('win')
    expect(battleRound(cheap, dear)).toBe('lose')
    const twin = ITEMS.find(i => i.id !== cheap.id && sellValue(i) === sellValue(cheap))
    if (twin) expect(battleRound(twin, cheap)).toBe('lose')
  })
})

describe('the prizes', () => {
  it('an Epic or a Legendary the hero does not own; none left: none', () => {
    const epics = ITEMS.filter(i => i.tier === 4)
    const owned = new Set(epics.slice(1).map(i => i.id))
    expect(prizeOf(4, owned, 3)?.id).toBe(epics[0]!.id)
    expect(prizeOf(4, new Set(epics.map(i => i.id)), 3)).toBeNull()
    expect(prizeOf(6, new Set(), 9)!.tier).toBe(6)
  })
})
