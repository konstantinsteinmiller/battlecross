import { describe, it, expect } from 'vitest'
import { ShakeBudget, critTrauma, CRIT_SHAKE_MAX, CRIT_SHAKE_WINDOW, CRIT_SHAKE_SCALE } from '../../src/game/engine/shakeBudget'
import { FollowCam } from '../../src/game/engine/camera'

describe('crit shake budget (#140)', () => {
  it('halves the crit trauma', () => {
    expect(CRIT_SHAKE_SCALE).toBe(0.5)
    expect(critTrauma(new ShakeBudget(), 0, 0.6)).toBeCloseTo(0.3)
  })

  it('caps shakes inside the 5 s window', () => {
    const b = new ShakeBudget()
    let shook = 0
    for (let i = 0; i < 20; i++) if (critTrauma(b, i * 0.2, 0.6) > 0) shook++
    expect(shook).toBe(CRIT_SHAKE_MAX)
  })

  it('slides: a shake frees up once it is older than the window', () => {
    const b = new ShakeBudget()
    for (let i = 0; i < CRIT_SHAKE_MAX; i++) expect(b.tryTake(i)).toBe(true)
    expect(b.tryTake(CRIT_SHAKE_WINDOW - 0.01)).toBe(false)
    expect(b.tryTake(CRIT_SHAKE_WINDOW)).toBe(true) // the one from t=0 expired
    expect(b.tryTake(CRIT_SHAKE_WINDOW + 0.1)).toBe(false)
  })

  it('a restarted clock does not inherit the old window', () => {
    const b = new ShakeBudget()
    for (let i = 0; i < CRIT_SHAKE_MAX; i++) b.tryTake(100 + i)
    expect(b.tryTake(1)).toBe(true)
  })

  it('exempt events (boss slams, boss kills) still shake with a spent crit budget', () => {
    const b = new ShakeBudget()
    for (let i = 0; i < 10; i++) critTrauma(b, 0, 0.6)
    expect(critTrauma(b, 0.1, 0.6)).toBe(0)
    // They call cam.addTrauma directly and never touch the budget.
    const cam = new FollowCam()
    cam.addTrauma(0.6)
    expect(cam.trauma).toBeCloseTo(0.6)
  })
})
