// The control coach (src/game/sim/coach.ts): wordless glyphs that stay until
// the control has been USED, flash on every success, retire with a check, and
// come back when the player is stuck. Pure bookkeeping, so it is asserted
// without a scene.

import { beforeEach, describe, expect, it } from 'vitest'
import { Coach, hintProgress, type CoachContext, type HintId } from '@/game/sim/coach'
import { profile } from '@/game/state/profile'

const base = (time: number, over: Partial<CoachContext> = {}): CoachContext => ({
  time, family: 'mouse', playing: true, combat: false, aimCandidate: false,
  teleBlock: false, teleRed: false, hp01: 1, tanks: 0, hasWeapon: false, canInteract: false, ...over
})

/** Run the coach from `t0` to `t1` in 1/15 s steps, returning the last views. */
const run = (c: Coach, t0: number, t1: number, over: Partial<CoachContext> = {}) => {
  let v = c.views()
  for (let t = t0; t <= t1 + 1e-9; t += 1 / 15) {
    c.update(base(t, over))
    v = c.views()
  }
  return v
}
const ids = (views: ReturnType<Coach['views']>): HintId[] => views.map(v => v.id)

beforeEach(() => { profile.tips = {} })

describe('first steps', () => {
  it('shows movement and camera together from the start, and nothing else', () => {
    const c = new Coach()
    const v = run(c, 0, 1)
    expect(ids(v).sort()).toEqual(['look', 'move'])
    expect(v.every(h => h.count === 0 && h.goal === 3)).toBe(true)
  })

  it('never times out: the look glyph is still there a minute later', () => {
    const c = new Coach()
    const v = run(c, 0, 60)
    expect(ids(v)).toContain('look')
  })

  it('counts each success, flashes it, and retires the glyph with a check', () => {
    const c = new Coach()
    run(c, 0, 1)
    c.use('move')
    let v = c.views().find(h => h.id === 'move')!
    expect(v.count).toBe(1)
    expect(v.flash).toBe(1)
    c.use('move')
    c.use('move')
    v = c.views().find(h => h.id === 'move')!
    expect(v.done).toBe(true)
    expect(hintProgress('move', 'mouse')).toBe(3)
    // The check shows briefly, then the glyph is gone — and stays gone.
    expect(ids(run(c, 1.1, 3))).not.toContain('move')
    expect(ids(run(c, 3, 10))).not.toContain('move')
  })

  it('counts movement by distance and looking by angle', () => {
    const c = new Coach()
    run(c, 0, 1)
    c.moved(2.4)
    expect(c.views().find(h => h.id === 'move')!.count).toBe(0)
    c.moved(0.2)
    expect(c.views().find(h => h.id === 'move')!.count).toBe(1)
    c.looked(0.61)
    expect(c.views().find(h => h.id === 'look')!.count).toBe(1)
  })

  it('learns per input family: the joystick is not the WASD keys', () => {
    const c = new Coach()
    run(c, 0, 1)
    for (let i = 0; i < 3; i++) c.use('move')
    expect(c.mastered('move', 'mouse')).toBe(true)
    expect(c.mastered('move', 'touch')).toBe(false)
    const v = run(c, 1, 2, { family: 'touch' })
    expect(ids(v)).toContain('move')
    expect(v.find(h => h.id === 'move')!.family).toBe('touch')
  })
})

describe('context', () => {
  it('teaches shooting when there is something to shoot', () => {
    const c = new Coach()
    expect(ids(run(c, 0, 1))).not.toContain('fire')
    expect(ids(run(c, 1, 2, { combat: true }))).toContain('fire')
  })

  it('shows the shield on a blockable wind-up and the slide on a red one, first', () => {
    const c = new Coach()
    const v = run(c, 0, 1, { teleBlock: true, teleRed: true, combat: true })
    expect(v.length).toBeLessThanOrEqual(2)
    expect(ids(v)).toEqual(['slide', 'block'])
  })

  it('a deflected shot calls up the charge shot', () => {
    const c = new Coach()
    for (let i = 0; i < 4; i++) c.use('fire')
    run(c, 0, 1)
    c.deflected()
    expect(ids(run(c, 1, 2))).toContain('charge')
  })
})

describe('stuck', () => {
  const masterAll = (c: Coach) => {
    for (const id of ['move', 'look', 'walk'] as HintId[]) for (let i = 0; i < 3; i++) c.use(id)
  }

  it('brings the camera glyph back after a long time without looking — one look retires it', () => {
    const c = new Coach()
    masterAll(c)
    expect(ids(run(c, 0, 10))).not.toContain('look')
    const v = run(c, 10, 22)
    const look = v.find(h => h.id === 'look')
    expect(look).toBeDefined()
    expect(look!.goal).toBe(1)
    c.looked(0.7)
    expect(c.views().find(h => h.id === 'look')!.done).toBe(true)
    expect(ids(run(c, 22.1, 24))).not.toContain('look')
  })

  it('three blockable hits without a block bring the shield back at the next wind-up', () => {
    const c = new Coach()
    masterAll(c)
    for (let i = 0; i < 2; i++) c.use('block')
    run(c, 0, 1)
    c.blockableHit()
    c.blockableHit()
    c.blockableHit()
    expect(ids(run(c, 1, 2))).not.toContain('block')
    expect(ids(run(c, 2, 3, { teleBlock: true }))).toContain('block')
  })

  it('the "?" button shows the core set again', () => {
    const c = new Coach()
    masterAll(c)
    for (const id of ['fire', 'block', 'slide'] as HintId[]) for (let i = 0; i < 4; i++) c.use(id)
    run(c, 0, 1)
    c.help()
    const v = run(c, 1, 2)
    expect(ids(v)).toEqual(['slide', 'block'])
    // …and as those are used, the rest of the set follows.
    c.use('slide')
    c.use('block')
    expect(ids(run(c, 2.1, 4))).toEqual(expect.arrayContaining(['fire']))
  })
})

describe('during a scene lesson', () => {
  const learnThumbs = (c: Coach) => {
    for (const id of ['move', 'look', 'walk'] as HintId[]) for (let i = 0; i < 3; i++) c.use(id)
  }

  it('never silences moving and looking — the rest keeps quiet', () => {
    const c = new Coach()
    expect(ids(run(c, 0, 30, { quiet: true, aimCandidate: true })).sort()).toEqual(['look', 'move'])
  })

  it('shows the stick and the camera together from the first frame, on a phone too', () => {
    const c = new Coach()
    const v = run(c, 0, 0, { quiet: true, family: 'touch' })
    expect(ids(v).sort()).toEqual(['look', 'move'])
    expect(v.every(h => h.family === 'touch')).toBe(true)
  })

  it('still warns: a blockable wind-up shows the shield, and nothing else competes', () => {
    const c = new Coach()
    learnThumbs(c)
    const v = run(c, 0, 1, { quiet: true, teleBlock: true, combat: true, aimCandidate: true })
    expect(ids(v)).toEqual(['block'])
  })

  it('the shield never pushes the thumbs out', () => {
    const c = new Coach()
    const v = run(c, 0, 1, { quiet: true, teleBlock: true, combat: true })
    expect(ids(v)).toEqual(['block', 'look', 'move'])
  })

  it('a player frozen in front of the lesson gets the stick back', () => {
    const c = new Coach()
    learnThumbs(c)
    expect(ids(run(c, 0, 10, { quiet: true }))).toEqual([])
    const v = ids(run(c, 10, 22, { quiet: true }))
    expect(v).toContain('move')
    expect(v).toContain('look')
  })

  it('the lesson over, the glyphs it held back come in', () => {
    const c = new Coach()
    learnThumbs(c)
    expect(ids(run(c, 0, 5, { quiet: true, aimCandidate: true }))).toEqual([])
    expect(ids(run(c, 5, 6, { aimCandidate: true }))).toEqual(['fire'])
  })
})

describe('the repair tank', () => {
  it('comes in at half health with a tank carried, not before', () => {
    const c = new Coach()
    expect(ids(run(c, 0, 1, { hp01: 0.6, tanks: 1 }))).not.toContain('tank')
    expect(ids(run(c, 1, 2, { hp01: 0.45, tanks: 1 }))).toContain('tank')
    const d = new Coach()
    expect(ids(run(d, 0, 1, { hp01: 0.2, tanks: 0 }))).not.toContain('tank')
  })
})
