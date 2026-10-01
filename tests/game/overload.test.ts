// The Overload (#100): hold a full charge 3 more seconds for a shot 1.75× the
// full charge. Opened by the Gale Master (his Gale Guard), bought once with
// bolts as an epic-violet mod, outside the chip count and the respec.

import { beforeEach, describe, expect, it } from 'vitest'
import { baseStats, chargeInfo, CHARGE_L2, OVERLOAD_EXTRA } from '@/game/sim/stats'
import { SKILL_BY_ID, OVERLOAD_PRICE, canBuyMod, canRankUp, chipsSpent, respecCost } from '@/game/data/skills'
import { profile, chipsAvailable, rankUpSkill, respecSkills, computeStats } from '@/game/state/profile'
import { REFERENCE, simulate } from '@/game/sim/balance'

const giga = SKILL_BY_ID.giga!

beforeEach(() => {
  profile.level = 20
  profile.bolts = 0
  profile.hero.skills = {}
  profile.hero.weapons = []
})

describe('the Overload timing', () => {
  it('arrives 3 s after a full charge, and charge-speed upgrades do not shorten those 3 s', () => {
    const s = { ...baseStats(), giga: true }
    expect(OVERLOAD_EXTRA).toBe(3)
    expect(chargeInfo(CHARGE_L2 + 2.95, s).level).toBe(2)
    expect(chargeInfo(CHARGE_L2 + 3.0, s).level).toBe(3)
    const quick = { ...s, chargeTimeMul: 0.7 }
    const full = CHARGE_L2 * 0.7
    expect(chargeInfo(full + 2.95, quick).level).toBe(2)
    expect(chargeInfo(full + 3.0, quick).level).toBe(3)
    expect(chargeInfo(full + 1.5, quick).toL3).toBeCloseTo(0.5)
  })

  it('never happens without the mod', () => {
    const s = { ...baseStats(), giga: false }
    expect(chargeInfo(CHARGE_L2 + 10, s).level).toBe(2)
    expect(chargeInfo(CHARGE_L2 + 10, s).toL3).toBe(0)
  })
})

describe('the Overload mod', () => {
  it('is locked until the Gale Master is beaten, then bought with bolts, once', () => {
    profile.bolts = OVERLOAD_PRICE * 2
    expect(canBuyMod(giga, profile.hero.skills, profile.bolts, profile.hero.weapons)).toBe(false)
    expect(rankUpSkill('giga')).toBe(false)
    profile.hero.weapons = ['galeGuard']
    expect(canBuyMod(giga, profile.hero.skills, OVERLOAD_PRICE - 1, profile.hero.weapons)).toBe(false)
    expect(canRankUp(giga, profile.hero.skills, 99)).toBe(false)
    const chips = chipsAvailable()
    expect(rankUpSkill('giga')).toBe(true)
    expect(profile.bolts).toBe(OVERLOAD_PRICE)
    expect(chipsAvailable()).toBe(chips)
    expect(computeStats().giga).toBe(true)
    expect(rankUpSkill('giga')).toBe(false)
  })

  it('stays through a circuits reset, which neither counts nor charges for it', () => {
    profile.hero.skills = { giga: 1, rapid: 2 }
    expect(chipsSpent(profile.hero.skills)).toBe(2)
    expect(respecCost(profile.hero.skills)).toBe(60 + 2 * 25)
    profile.bolts = 1000
    expect(respecSkills(respecCost(profile.hero.skills))).toBe(true)
    expect(profile.hero.skills).toEqual({ giga: 1 })
  })

  it('costs about 1.5 story missions at the Magnet step, affordable right after the Gale Master', () => {
    const rows = simulate(REFERENCE)
    const magnet = rows.find(r => r.sector === 'magnet' && r.kind === 'story')!
    const gale = rows.find(r => r.sector === 'gale' && r.kind === 'story')!
    const ratio = OVERLOAD_PRICE / magnet.income
    expect(ratio).toBeGreaterThan(1.2)
    expect(ratio).toBeLessThan(1.8)
    expect(gale.bank).toBeGreaterThan(OVERLOAD_PRICE)
  })

  it('is burst, not sustained damage: worse per second than repeated full charges', () => {
    // A full charge (4×) every ~1.45 s against an Overload (7×) every
    // full-charge time + 3 s + the release.
    const l2Rate = 4 / 1.45
    const overRate = 7 / (CHARGE_L2 + OVERLOAD_EXTRA + 0.25)
    expect(overRate).toBeLessThan(l2Rate)
  })
})
