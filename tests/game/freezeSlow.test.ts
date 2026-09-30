import { describe, expect, it } from 'vitest'
import { frozenDt } from '@/game/sim/enemies'
import { FREEZE_SLOW, FREEZE_SLOW_BOSS } from '@/game/sim/constants'
import type { Enemy } from '@/game/sim/world'

// Ice Lance is an element, not a stun: a chilled machine lives a slower step,
// except in the air (a Stomper's leap keeps its arc), and a Core Master is
// slowed half as much.
const foe = (o: Partial<Enemy>): Enemy => ({ frozenT: 2, state: 'engage', kind: 'trooper', y: 0, floor: 0, boss: false, ...o }) as Enemy

describe('Ice Lance slow', () => {
  it('slows a chilled machine by 30 %', () => {
    expect(frozenDt(foe({}), 1)).toBeCloseTo(1 - FREEZE_SLOW)
  })
  it('leaves a warm one alone', () => {
    expect(frozenDt(foe({ frozenT: 0 }), 1)).toBe(1)
  })
  it('never slows a leap already in the air', () => {
    expect(frozenDt(foe({ kind: 'hopper', y: 1.2 }), 1)).toBe(1)
  })
  it('slows a drone at its flight height', () => {
    expect(frozenDt(foe({ kind: 'heli', y: 2 }), 1)).toBeCloseTo(1 - FREEZE_SLOW)
  })
  it('slows a Core Master half as much', () => {
    expect(frozenDt(foe({ boss: true }), 1)).toBeCloseTo(1 - FREEZE_SLOW_BOSS)
  })
})
