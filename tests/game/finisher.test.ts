import { describe, expect, it } from 'vitest'
import { FINISHER_FLOOR, FINISHER_S, finisherScale } from '@/game/gfx/slowMo'
import { lastOfPack } from '@/game/gfx/finisher'

/** #EXT-10: the last foe of a fight and a boss fall in half a second of slow motion. */

type U = { team: number; group: number; rank: string; alive: boolean; id: number; x: number; z: number; awake: boolean; ownerId: number }
const sim = (units: U[]) => ({ units }) as never
const u = (id: number, o: Partial<U> = {}): U => ({ id, group: -1, alive: true, team: 1, rank: 'minion', x: 0, z: 0, awake: true, ownerId: 0, ...o })

describe('the finisher\'s slow motion', () => {
  it('drops to the floor at once, holds, and is back to full speed after half a second', () => {
    expect(finisherScale(0.001)).toBe(FINISHER_FLOOR)
    expect(finisherScale(FINISHER_S * 0.5)).toBe(FINISHER_FLOOR)
    expect(finisherScale(FINISHER_S * 0.8)).toBeGreaterThan(FINISHER_FLOOR)
    expect(finisherScale(FINISHER_S * 0.8)).toBeLessThan(1)
    expect(finisherScale(FINISHER_S)).toBe(1)
    expect(FINISHER_S).toBe(0.5)
  })
})

describe('the last foe of a fight', () => {
  const a = u(1, { group: 3 })
  it('is the last when nobody awake stands near, whatever group the director filed them in', () => {
    expect(lastOfPack(sim([a, u(2, { group: 3, alive: false }), u(3, { group: 4, x: 40 })]), a as never)).toBe(true)
    // The arena and the tutorial file everyone under group 0 or none.
    const g0 = u(5, { group: 0 })
    expect(lastOfPack(sim([g0, u(6, { group: 0, x: 30 })]), g0 as never)).toBe(true)
  })
  it('is not while a foe still fights near it, or a pack-mate lives close by', () => {
    expect(lastOfPack(sim([a, u(2, { x: 6 })]), a as never)).toBe(false)
    expect(lastOfPack(sim([a, u(2, { group: 3, x: 15, awake: false })]), a as never)).toBe(false)
  })
  it('a sleeper far off does not spoil it', () => {
    expect(lastOfPack(sim([a, u(2, { x: 6, awake: false })]), a as never)).toBe(true)
  })
  it('never counts a summon, an ally or a missing target', () => {
    expect(lastOfPack(sim([u(5, { ownerId: 9 })]), u(5, { ownerId: 9 }) as never)).toBe(false)
    expect(lastOfPack(sim([u(6, { team: 0 })]), u(6, { team: 0 }) as never)).toBe(false)
    expect(lastOfPack(sim([]), undefined)).toBe(false)
  })
})
