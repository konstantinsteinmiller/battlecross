import { beforeEach, describe, expect, it } from 'vitest'
import { FX_TOP, __resetEffectsLadder, fxLevel, stepEffectsLadder } from '@/game/engine/effectsLadder'
import { outlineMat } from '@/game/gfx/cel'

/**
 * The effects ladder (question 43): the canvas keeps the screen's resolution;
 * a device that cannot keep up gives up effects a rung at a time — half the
 * particles, then the scenery's outlines, then the motes — and climbs back.
 */

const run = (seconds: number, frameMs: number): void => {
  for (let t = 0; t < seconds; t += frameMs / 1000) stepEffectsLadder(frameMs / 1000)
}

describe('the effects ladder (question 43)', () => {
  beforeEach(() => __resetEffectsLadder())

  it('starts with everything on a capable device', () => {
    expect(fxLevel()).toBe(0)
    expect(outlineMat(undefined, undefined, true).visible).toBe(true)
  })

  it('steps down while frames run slow, one rung every couple of seconds, to its last rung', () => {
    run(3, 30)
    expect(fxLevel()).toBe(1)
    run(3, 30)
    expect(fxLevel()).toBe(2)
    // Rung 2: the scenery's outlines are off; a character's are not touched.
    expect(outlineMat(undefined, undefined, true).visible).toBe(false)
    expect(outlineMat().visible).toBe(true)
    run(20, 30)
    expect(fxLevel()).toBe(FX_TOP)
  })

  it('holds steady at a fine frame rate, and climbs back once it is fast again', () => {
    run(10, 16.7)
    expect(fxLevel()).toBe(0)
    run(6, 30)
    expect(fxLevel()).toBe(2)
    run(9, 12)
    expect(fxLevel()).toBe(1)
    run(9, 12)
    expect(fxLevel()).toBe(0)
    expect(outlineMat(undefined, undefined, true).visible).toBe(true)
  })

  it('a slow hitch is not a slow device', () => {
    run(5, 16.7)
    run(0.3, 80)
    run(5, 16.7)
    expect(fxLevel()).toBe(0)
  })
})
