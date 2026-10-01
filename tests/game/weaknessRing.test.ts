// The weakness rings run WITH the story order (`data/bosses.ts`): each Master
// is weak to the weapon of the Master freed just before it, so on a first run
// Flux already carries the answer to every Master but the two ring openers.

import { describe, expect, it } from 'vitest'
import { BOSSES, COUNTER } from '@/game/data/bosses'
import { SECTORS } from '@/game/data/regions'
import { WEAPONS, WEAPON_IDS } from '@/game/data/weapons'

/** Bosses in story order, and the weapons Flux owns when each is first met. */
const storyRun = () => {
  const owned = new Set(WEAPON_IDS.filter(w => !WEAPONS[w].from))
  return SECTORS.map(s => {
    const boss = BOSSES[s.boss]
    const ownedAtFight = new Set(owned)
    for (const w of WEAPON_IDS) if (WEAPONS[w].from === s.boss) owned.add(w)
    return { boss, ownedAtFight }
  })
}

describe('weakness rings', () => {
  it('every Master but the ring openers (Blaze, Magnet) is weak to a weapon Flux already owns at the first fight', () => {
    const run = storyRun()
    const withWeakness = run.filter(r => r.boss.weakTo)
    expect(withWeakness.length).toBe(9)
    const unanswered = withWeakness.filter(r => !r.ownedAtFight.has(r.boss.weakTo!)).map(r => r.boss.id)
    expect(unanswered).toEqual(['blazeMaster', 'magnetMaster'])
  })

  it('each Master is weak to the weapon of the Master freed just before it; the openers to their ring\'s last', () => {
    const masters = SECTORS.map(s => BOSSES[s.boss]).filter(b => b.weakTo)
    const dropOf = (id: string) => WEAPON_IDS.find(w => WEAPONS[w].from === id)
    for (let i = 0; i < masters.length; i++) {
      const b = masters[i]!
      if (b.id === 'blazeMaster') expect(b.weakTo).toBe(dropOf('galeMaster'))
      else if (b.id === 'magnetMaster') expect(b.weakTo).toBe(dropOf('rotorMaster'))
      else expect(b.weakTo, b.id).toBe(dropOf(masters[i - 1]!.id))
    }
  })

  it('machines follow the same elemental ring as the first four Masters', () => {
    for (const id of ['blazeMaster', 'frostMaster', 'voltMaster', 'galeMaster'] as const) {
      const b = BOSSES[id]
      expect(COUNTER[b.element], id).toBe(WEAPONS[b.weakTo!].element)
    }
  })
})
