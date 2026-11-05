import { describe, expect, it } from 'vitest'
import { conversationOf } from '@/game/data/dialogs'
import { RECIPE_BY_ID } from '@/game/data/smithing'
import { ITEMS } from '@/game/data/items'

/**
 * #207: Brann, teaching smithing, gives the hero the iron for his first sword; and a weapon's card says what it does.
 */

describe('Brann at the opening level\'s rock', () => {
  it('teaching smithing, he hands over at least the nuggets of one new weapon, once', () => {
    const c = conversationOf('plainsMiner')!
    const learn = Object.values(c.nodes).flatMap(n => n.choices).find(ch => ch.id === 'learnSmith')!
    expect(learn).toBeTruthy()
    const gift = learn.effects.find(e => e.t === 'ore')
    expect(gift).toMatchObject({ t: 'ore', id: 'iron' })
    const n = (gift as { n: number }).n
    expect(n).toBeGreaterThanOrEqual(RECIPE_BY_ID['iron:sword']!.nuggets)
    expect(n).toBeLessThanOrEqual(3)
    // He gives it as he teaches, before the forge opens, and only while the hero has not learnt it yet.
    expect(learn.effects.map(e => e.t)).toEqual(['ore', 'learnSmith', 'open'])
    expect(learn.once).toBe(false)
    expect(learn.when).toMatchObject({ smithing: false })
    // The answer is three lines (the gift is the third), each a voiced line of his.
    expect(learn.replies[0]!.lines).toHaveLength(3)
  })
})

describe('what a weapon card says', () => {
  it('every weapon has a number for the hero and a colour: the attribute it scales with', async () => {
    const { weaponNumbers } = await import('@/components/game/heroSheet')
    const { ATTR_COLOR } = await import('@/game/data/attributes')
    const weapons = ITEMS.filter(i => i.weapon)
    expect(weapons.length).toBeGreaterThan(10)
    for (const w of weapons) {
      const n = weaponNumbers(w.id)
      expect(n, w.id).toBeTruthy()
      expect(n!.hit, w.id).toBeGreaterThan(0)
      expect(n!.dps, w.id).toBeGreaterThan(0)
      expect(ATTR_COLOR[w.weapon!.scale], w.id).toMatch(/^#/)
    }
    expect(weaponNumbers('rustedHelm')).toBeNull()
  })
})
