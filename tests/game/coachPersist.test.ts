// A learned glyph stays learned across a reload. The coach's per-glyph success
// counts live in `profile.tips`, and the mission only checkpoints the profile on
// kills, chests and doors — so a player who learned "click into the scene" and
// reloaded before the first kill got that glyph back. Each counted success is
// now written to the save state at once.

import { beforeEach, describe, expect, it } from 'vitest'
import { Coach, HINTS } from '@/game/sim/coach'
import { profile } from '@/game/state/profile'
import { getState } from '@/use/useGameState'
import { TUTORIAL_KEY } from '@/keys'

const saved = (): Record<string, number> => (getState(TUTORIAL_KEY, {}) ?? {}) as Record<string, number>

beforeEach(() => { profile.tips = {} })

describe('coach progress is saved as it is earned', () => {
  it('writes each success to the save state, no checkpoint needed', () => {
    const c = new Coach()
    c.use('look')
    expect(saved()['hint:look:mouse']).toBe(1)
    c.use('look')
    expect(saved()['hint:look:mouse']).toBe(2)
  })

  it('stops counting (and saving) at the glyph goal', () => {
    const c = new Coach()
    const goal = HINTS.tank.goal
    for (let i = 0; i < goal + 3; i++) c.use('tank')
    expect(saved()['hint:tank:mouse']).toBe(goal)
  })
})
