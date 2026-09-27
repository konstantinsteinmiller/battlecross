import { describe, expect, it } from 'vitest'
import {
  Locator, LOCATOR_COOLDOWN, LOCATOR_FIRST, LOCATOR_NEAR, LOCATOR_SHOW, type LocatorInput
} from '@/game/sim/locator'

// ─── The objective locator's clock ───────────────────────────────────────────
//
// 5 s on, 30 s of PLAY off, never over a fight or a lesson, and a boss
// locator retires for good once Flux is within 10 m of the shutter.

const input = (o: Partial<LocatorInput> = {}): LocatorInput => ({
  playing: true, quiet: true, hasGoal: true, dist: 40, boss: true, finished: false, ...o
})

const run = (l: Locator, seconds: number, i: LocatorInput, step = 1 / 30): void => {
  for (let t = 0; t < seconds; t += step) l.update(step, i)
}

describe('Locator', () => {
  it('shows after the title card, for 5 s, then cools down for 30 s', () => {
    const l = new Locator()
    run(l, LOCATOR_FIRST - 0.2, input())
    expect(l.visible).toBe(false)
    run(l, 0.4, input())
    expect(l.visible).toBe(true)
    expect(l.popped).toBe(true)
    run(l, LOCATOR_SHOW - 0.4, input())
    expect(l.visible).toBe(true)
    run(l, 0.5, input())
    expect(l.visible).toBe(false)
    expect(l.phase).toBe('cool')
    run(l, LOCATOR_COOLDOWN - 1, input())
    expect(l.visible).toBe(false)
    expect(l.cooldown01).toBeGreaterThan(0.9)
    run(l, 1.2, input())
    expect(l.visible).toBe(true)
  })

  it('fades in and out instead of blinking', () => {
    const l = new Locator()
    run(l, LOCATOR_FIRST + 0.05, input())
    expect(l.alpha).toBeGreaterThan(0)
    expect(l.alpha).toBeLessThan(1)
    run(l, 1, input())
    expect(l.alpha).toBe(1)
    run(l, LOCATOR_SHOW - 1.3, input())
    expect(l.alpha).toBeLessThan(1)
  })

  it('never spends its cooldown while the game is paused', () => {
    const l = new Locator()
    run(l, LOCATOR_FIRST + LOCATOR_SHOW + 0.5, input())
    expect(l.phase).toBe('cool')
    const before = l.cooldown01
    run(l, 60, input({ playing: false }))
    expect(l.cooldown01).toBe(before)
  })

  it('waits for a quiet moment when due during a fight', () => {
    const l = new Locator()
    run(l, 10, input({ quiet: false }))
    expect(l.visible).toBe(false)
    run(l, 0.1, input())
    expect(l.visible).toBe(true)
  })

  it('a fight starting cuts a showing short and starts the cooldown', () => {
    const l = new Locator()
    run(l, LOCATOR_FIRST + 1, input())
    expect(l.visible).toBe(true)
    run(l, 0.8, input({ quiet: false }))
    expect(l.visible).toBe(false)
    expect(l.phase).toBe('cool')
  })

  it('a boss locator retires for good near the shutter', () => {
    const l = new Locator()
    run(l, LOCATOR_FIRST + 1, input())
    l.update(1 / 30, input({ dist: LOCATOR_NEAR - 1 }))
    expect(l.phase).toBe('retired')
    expect(l.cooldown01).toBe(-1)
    run(l, 100, input({ dist: 50 }))
    expect(l.visible).toBe(false)
  })

  it('a job locator only skips its turn while the goal is close', () => {
    const l = new Locator()
    run(l, 20, input({ boss: false, dist: LOCATOR_NEAR - 2 }))
    expect(l.phase).toBe('wait')
    run(l, 0.1, input({ boss: false, dist: 30 }))
    expect(l.visible).toBe(true)
  })

  it('retires once the objective is done or the fight began', () => {
    const l = new Locator()
    l.update(0.1, input({ finished: true }))
    expect(l.phase).toBe('retired')
  })
})
