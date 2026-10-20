import { describe, expect, it } from 'vitest'
import {
  ARM_BEATS, RING_DEPTHS, RING_DEPTH_TOL, RING_FLIGHT, RING_PERFECT, RING_RINGS, WHACK_GOAL, WHACK_HOLES, WHACK_SECONDS,
  armBeat, armOnBeat, armWindow, dealHeads, dealWhack, defaultFair, fairFee, fairTopGold, headSway, normalizeFair,
  ringHit, ringPower, ringScore, ringTier, trinketPrize, whackPlain, whackUp
} from '@/game/fair'
import { ITEM_BY_ID } from '@/game/data/items'

/** The fair corner's rules (afterplay §9): stakes, deals, scoring, the save block. */

describe('stakes and prizes', () => {
  it('the fee follows the level; the top gold runs 600 at 31 to 1,200 at 60', () => {
    expect(fairFee(45)).toBeGreaterThan(fairFee(31))
    expect(fairFee(31) % 5).toBe(0)
    expect(fairTopGold(31)).toBe(600)
    expect(fairTopGold(60)).toBe(1200)
    expect(fairTopGold(10)).toBe(600)
    expect(fairTopGold(99)).toBe(1200)
  })

  it('a trinket prize is a rare trinket not owned yet', () => {
    const it0 = trinketPrize(new Set(), 7)!
    expect(ITEM_BY_ID[it0.id]!.slot).toBe('trinket')
    expect(it0.tier).toBe(3)
    expect(trinketPrize(new Set([it0.id]), 7)?.id).not.toBe(it0.id)
  })
})

describe('Whack-a-Imp', () => {
  it('imps stay up 0.6 s at the start and 0.3 s at the end', () => {
    expect(whackUp(0)).toBeCloseTo(0.6)
    expect(whackUp(WHACK_SECONDS)).toBeCloseTo(0.3)
  })

  it('a deal fits the round, never doubles a barrel up, and always offers more plain imps than the goal', () => {
    for (let seed = 1; seed < 40; seed++) {
      const pops = dealWhack(seed % 3, seed)
      expect(pops.every(p => p.at >= 0 && p.at < WHACK_SECONDS && p.hole >= 0 && p.hole < WHACK_HOLES)).toBe(true)
      expect(whackPlain(pops)).toBeGreaterThan(WHACK_GOAL + 10)
      const until = new Array<number>(WHACK_HOLES).fill(-1)
      for (const p of pops) {
        expect(p.at).toBeGreaterThanOrEqual(until[p.hole]!)
        until[p.hole] = p.at + p.up
      }
    }
  })

  it('the same seed deals the same round', () => {
    expect(dealWhack(0, 99)).toEqual(dealWhack(0, 99))
  })
})

describe('Ring Toss', () => {
  it('the power bar climbs to 1 and falls back', () => {
    expect(ringPower(0)).toBe(0)
    expect(ringPower(0.7)).toBeCloseTo(1)
    expect(ringPower(1.4)).toBeCloseTo(0)
  })

  it('a ring takes a head only at its depth and near the middle of its sway', () => {
    const heads = [{ period: 2, phase: 0 }, { period: 2, phase: 0 }, { period: 2, phase: 0 }]
    // Sway 0 when the ring lands: let go RING_FLIGHT before a whole period.
    const t = 2 - RING_FLIGHT
    expect(headSway(heads[0]!, t + RING_FLIGHT)).toBeCloseTo(0)
    expect(ringHit(RING_DEPTHS[1]!, t, heads)).toBe(1)
    expect(ringHit(RING_DEPTHS[1]! + RING_DEPTH_TOL + 0.01, t, heads)).toBe(-1)
    // A quarter period later the heads are at the end of their sway.
    expect(ringHit(RING_DEPTHS[1]!, t + 0.5, heads)).toBe(-1)
  })

  it('heads are dealt with their own speeds', () => {
    const h = dealHeads(5)
    expect(h).toHaveLength(RING_DEPTHS.length)
    expect(new Set(h.map(x => x.period)).size).toBe(RING_DEPTHS.length)
  })

  it('ringed heads in a row count up; all five is perfect', () => {
    expect(ringScore([true, true, false, true, true])).toBe(1 + 2 + 0 + 1 + 2)
    expect(ringScore(new Array(RING_RINGS).fill(true))).toBe(RING_PERFECT)
    expect(ringTier(RING_PERFECT)).toBe(4)
    expect(ringTier(14)).toBe(3)
    expect(ringTier(6)).toBe(2)
    expect(ringTier(3)).toBe(1)
    expect(ringTier(2)).toBe(0)
  })
})

describe('Arm-Wrestle', () => {
  it('Strength widens the beat, up to a cap', () => {
    expect(armWindow(0)).toBeCloseTo(0.08)
    expect(armWindow(150)).toBeGreaterThan(armWindow(0))
    expect(armWindow(300)).toBeCloseTo(0.14)
    expect(armWindow(900)).toBeCloseTo(0.14)
  })

  it('each win in the row quickens the beat', () => {
    for (let r = 1; r < ARM_BEATS.length; r++) expect(armBeat(r)).toBeLessThan(armBeat(r - 1))
    expect(armBeat(99)).toBe(ARM_BEATS[ARM_BEATS.length - 1])
  })

  it('a tap counts on a beat, within the window, never before the first', () => {
    expect(armOnBeat(0.9, 0.9, 0.08)).toBe(true)
    expect(armOnBeat(1.85, 0.9, 0.08)).toBe(true)
    expect(armOnBeat(1.3, 0.9, 0.08)).toBe(false)
    expect(armOnBeat(0.02, 0.9, 0.08)).toBe(false)
  })
})

describe('the save block', () => {
  it('a save from before the fair loads as never played; junk is cleaned', () => {
    expect(normalizeFair(undefined)).toEqual(defaultFair())
    const n = normalizeFair({ rows: { whack: 9, arm: -2 }, best: { ring: 99 }, full: { ring: 50 }, clears: 'x', discount: 1 })
    expect(n.rows.whack).toBe(2)
    expect(n.rows.arm).toBe(0)
    expect(n.best.ring).toBe(RING_PERFECT)
    expect(n.full.ring).toBe(5)
    expect(n.clears).toBe(0)
    expect(n.discount).toBe(false)
  })
})
