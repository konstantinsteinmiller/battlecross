import { describe, expect, it } from 'vitest'
import { CHARGE_FLOOR, chargeCapOf, chargeShare } from '@/game/sim/chargeCap'

describe('the cap on a charged blow', () => {
  it('rises with the foe level: 30 % at a low level, 50 % from the Ashen Lands (level 11) on', () => {
    expect(chargeShare(1)).toBeCloseTo(0.3)
    expect(chargeShare(5)).toBeCloseTo(0.3)
    expect(chargeShare(8)).toBeCloseTo(0.4)
    expect(chargeShare(11)).toBeCloseTo(0.5)
    expect(chargeShare(30)).toBeCloseTo(0.5)
  })
  it('leaves at least a fifth of the hero\'s full health on the table, whatever his current health', () => {
    expect(CHARGE_FLOOR).toBe(0.2)
    expect(chargeCapOf(15)).toEqual({ capHp: 0.5, capFloor: 0.2 })
  })
})
