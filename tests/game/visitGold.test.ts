// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { ZoneMode } from '@/game/modes/zoneMode'
import { profile } from '@/game/state/profile'

// #196: a reload rebuilds the same visit with its coins lying again; the ones already paid are not paid twice.
const bank = (self: Record<string, unknown>): void => (ZoneMode.prototype.bankRunGold as () => void).call(self)

describe('visit coins and a reload', () => {
  it('pays each coin once, also when the same visit is built again', () => {
    profile.gold = 0
    profile.meta.visitGold = null
    const first = { sim: { hero: { gold: 0 } }, bankedGold: 0, goldCredit: 0, visitKey: 'zone:plains:7:1:0' }
    first.sim.hero.gold = 30
    bank(first)
    expect(profile.gold).toBe(30)
    expect(profile.meta.visitGold).toEqual({ key: 'zone:plains:7:1:0', gold: 30 })
    // reload: the same visit again, its coins lying again
    const again = { sim: { hero: { gold: 0 } }, bankedGold: 0, goldCredit: profile.meta.visitGold!.gold, visitKey: 'zone:plains:7:1:0' }
    again.sim.hero.gold = 30
    bank(again)
    expect(profile.gold).toBe(30)
    again.sim.hero.gold = 45
    bank(again)
    expect(profile.gold).toBe(45)
    expect(profile.meta.visitGold!.gold).toBe(45)
  })
})
