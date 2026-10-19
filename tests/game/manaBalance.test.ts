import { describe, expect, it } from 'vitest'
import { CLASSES, SKILLS } from '@/game/data/skills'
import { MANA_POTION } from '@/game/data/loot'

/** #129: the classes that do not scale with Intelligence pay less mana. */
describe('class mana costs', () => {
  const INT_CASTERS = ['pyro', 'elementalist', 'soulwarden', 'chrono']

  it('keeps the Intelligence casters at the table price and cuts every other class', () => {
    for (const c of Object.values(CLASSES)) {
      if (INT_CASTERS.includes(c.id)) expect(c.manaCost).toBe(1)
      else expect(c.manaCost).toBeLessThan(1)
      expect(c.manaCost).toBeGreaterThan(0)
    }
  })

  it('charges every active at least 1 mana, and a Strength skill less than the same table number would', () => {
    for (const s of SKILLS.filter(s => s.kind === 'active' && !s.hpCost)) expect(s.mana).toBeGreaterThanOrEqual(1)
    const slam = SKILLS.find(s => s.id === 'shieldSlam')!
    expect(slam.mana).toBe(Math.round(8 * CLASSES.aegis.manaCost))
    expect(slam.mana).toBeLessThan(8)
  })

  it('a mana potion refills the whole bar', () => {
    expect(MANA_POTION).toBe(1)
  })
})
