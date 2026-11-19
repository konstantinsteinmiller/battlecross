import { describe, expect, it } from 'vitest'
import { COIN_MUL, coinMulFor, coinPct } from '@/game/data/difficulty'

describe('what the difficulty pays', () => {
  it('Medium is the base, Easy pays a tenth less coin, Hard 30% more', () => {
    expect(coinMulFor(1)).toBe(1)
    expect(coinMulFor(0.8)).toBe(0.9)
    expect(coinMulFor(1.25)).toBe(1.3)
    expect([coinPct('easy'), coinPct('medium'), coinPct('hard')]).toEqual([-10, 0, 30])
    expect(COIN_MUL.hard).toBeGreaterThan(COIN_MUL.medium)
  })
})
