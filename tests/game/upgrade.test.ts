import { describe, expect, it } from 'vitest'
import { noGear } from '@/game/data/items'
import { attrWeights, isUpgrade, itemScore, slotHasUpgrade } from '@/game/data/upgrade'
import { ITEM_BY_ID } from '@/game/data/items'

const STR_BUILD = { str: 25, dex: 5, int: 5, end: 10, skl: 5, cha: 5 }
const INT_BUILD = { str: 5, dex: 5, int: 25, end: 8, skl: 5, cha: 5 }

describe('isUpgrade: the one "better" rule', () => {
  it('anything beats an empty slot; an unknown id beats nothing', () => {
    expect(isUpgrade('rustedShortsword', noGear())).toBe(true)
    expect(isUpgrade('nope', noGear())).toBe(false)
  })

  it('what is already worn is never an upgrade on itself', () => {
    const eq = { ...noGear(), main: 'ironBroadsword' }
    expect(isUpgrade('ironBroadsword', eq, STR_BUILD)).toBe(false)
  })

  it('a higher-tier piece beats a lower one for a matching build', () => {
    const eq = { ...noGear(), main: 'rustedShortsword' }
    expect(isUpgrade('ironBroadsword', eq, STR_BUILD)).toBe(true)
    expect(isUpgrade('rustedShortsword', { ...noGear(), main: 'ironBroadsword' }, STR_BUILD)).toBe(false)
  })

  it('weighs by the build: a strong hero prefers strength, a mage intellect', () => {
    // A robe of INT and CHA against a mail vest of STR and END (same tier).
    const robeOverMail = { ...noGear(), body: 'chainmailVest' }
    const mailOverRobe = { ...noGear(), body: 'scholarsRobe' }
    expect(isUpgrade('scholarsRobe', robeOverMail, STR_BUILD)).toBe(false)
    expect(isUpgrade('chainmailVest', mailOverRobe, STR_BUILD)).toBe(true)
    expect(isUpgrade('scholarsRobe', robeOverMail, INT_BUILD)).toBe(true)
  })

  it('a trinket is measured against the weaker of the two worn, or an empty one', () => {
    expect(isUpgrade('ringOfMending', { ...noGear(), trinket1: 'copperBand' })).toBe(true)
    const both = { ...noGear(), trinket1: 'copperBand', trinket2: 'timekeepersHourglass' }
    expect(isUpgrade('ringOfMending', both)).toBe(true)
    expect(isUpgrade('copperBand', { ...noGear(), trinket1: 'ringOfMending', trinket2: 'castersEmblem' })).toBe(false)
  })

  it('weights run 0.25..1 with Endurance floored at 0.5; a flat build weighs all 1', () => {
    const w = attrWeights(INT_BUILD)
    expect(w.int).toBe(1)
    expect(w.str).toBe(0.25)
    expect(w.end).toBeGreaterThanOrEqual(0.5)
    expect(Object.values(attrWeights({ str: 5, dex: 5, int: 5, end: 5, skl: 5, cha: 5 }))).toEqual([1, 1, 1, 1, 1, 1])
    expect(itemScore(ITEM_BY_ID.ringOfAbsolutePower!, attrWeights())).toBeGreaterThan(itemScore(ITEM_BY_ID.heartOfTheMountain!, attrWeights()))
  })

  it("a socket's arrow: only wearable, unworn bag pieces that beat it count", () => {
    const eq = { ...noGear(), main: 'rustedShortsword' }
    expect(slotHasUpgrade('main', eq, ['ironBroadsword'], 6, STR_BUILD)).toBe(true)
    expect(slotHasUpgrade('main', eq, ['ironBroadsword'], 5, STR_BUILD)).toBe(false)
    expect(slotHasUpgrade('main', eq, ['rustedShortsword'], 30, STR_BUILD)).toBe(false)
    expect(slotHasUpgrade('head', eq, ['ironBroadsword'], 30, STR_BUILD)).toBe(false)
    expect(slotHasUpgrade('trinket2', eq, ['copperBand'], 30)).toBe(true)
  })
})
