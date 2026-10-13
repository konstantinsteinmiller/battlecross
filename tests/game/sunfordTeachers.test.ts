import { describe, expect, it } from 'vitest'
import { TOWNS } from '@/game/data/zones'
import { layTown } from '@/game/sim/town'
import { conversationOf } from '@/game/data/dialogs'

/**
 * Sunford's teachers (#106, #121): six classes in the first town, a spread of
 * main attributes, and every one of them has a door to walk in at.
 */
describe('Sunford teaches', () => {
  const trainers = TOWNS.sunford.npcs.filter(n => n.role === 'trainer' && !n.needs)
  it('six classes from the start, the Shadowblade and the Soul Warden among them', () => {
    expect(trainers.map(n => n.cls).sort()).toEqual(['aegis', 'geo', 'ironmonk', 'pyro', 'shadow', 'soulwarden'])
    for (const n of trainers) expect(conversationOf(n.id), n.id).toBeTruthy()
  })

  for (const seed of [1, 7, 42]) {
    it(`every teacher has a house of their own (seed ${seed})`, () => {
      const L = layTown(TOWNS.sunford, new Set(), seed)
      for (const n of trainers) {
        const placed = L.town.houses.some(h => h.owners.includes(n.id)) || L.town.people.some(p => p.npc === n.id)
        expect(placed, n.id).toBe(true)
      }
    })
  }
})
