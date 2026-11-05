import { describe, expect, it } from 'vitest'
import { startAttrs } from '@/game/data/attributes'
import { kingHoardPicks, type HoardInput } from '@/game/data/hoard'
import { ITEM_BY_ID, noGear } from '@/game/data/items'

/** The Goblin King's hoard: three pieces this build wants, in three slots. */

const hero = (over: Partial<HoardInput> = {}): HoardInput => ({ level: 5, attrs: startAttrs(), equipped: noGear(), owned: [], ...over })
const build = (a: Partial<Record<'str' | 'dex' | 'int' | 'end' | 'skl' | 'cha', number>>) => ({ ...startAttrs(), ...a })

describe('kingHoardPicks', () => {
  it('three pieces in three different slots, the best fit first, none already owned', () => {
    const owned = ['rustedShortsword', 'woodenBuckler']
    const picks = kingHoardPicks(hero({ owned }))
    expect(picks).toHaveLength(3)
    expect(new Set(picks.map(p => ITEM_BY_ID[p.id]!.slot)).size).toBe(3)
    expect(picks.filter(p => p.best)).toHaveLength(1)
    expect(picks[0]!.best).toBe(true)
    for (const p of picks) expect(owned).not.toContain(p.id)
    for (let i = 1; i < picks.length; i++) expect(picks[i - 1]!.gain).toBeGreaterThanOrEqual(picks[i]!.gain)
  })

  it('stays within the early game: no piece above Rare or far above the hero\'s level', () => {
    for (const p of kingHoardPicks(hero({ level: 4 }))) {
      const it = ITEM_BY_ID[p.id]!
      expect(it.tier).toBeLessThanOrEqual(3)
      expect(it.level).toBeLessThanOrEqual(4 + 3)
      expect(it.infernal).toBeUndefined()
    }
  })

  it('a weapon that scales with the build\'s own strongest attribute is the one offered', () => {
    const weaponOf = (a: ReturnType<typeof build>): string | undefined =>
      kingHoardPicks(hero({ attrs: a })).map(p => ITEM_BY_ID[p.id]!).find(i => i.slot === 'main')?.weapon?.scale
    expect(weaponOf(build({ dex: 30, str: 1, int: 1, skl: 1 }))).toBe('dex')
    expect(weaponOf(build({ int: 30, str: 1, dex: 1, skl: 1 }))).toBe('int')
    expect(weaponOf(build({ str: 30, dex: 1, int: 1, skl: 1 }))).toBe('str')
  })

  it('a worn piece is only replaced by a better one, and the card says what it replaces', () => {
    const equipped = { ...noGear(), main: 'rustedShortsword', body: 'leatherDoublet' }
    const picks = kingHoardPicks(hero({ equipped, owned: ['rustedShortsword', 'leatherDoublet'] }))
    for (const p of picks) {
      expect(p.gain).toBeGreaterThan(0)
      const slot = ITEM_BY_ID[p.id]!.slot
      if (slot === 'main') expect(p.over).toBe('rustedShortsword')
      else if (slot === 'body') expect(p.over).toBe('leatherDoublet')
      else expect(p.over).toBe('')
    }
  })

  it('is the same three for the same hero (a reload shows the same cards)', () => {
    expect(kingHoardPicks(hero())).toEqual(kingHoardPicks(hero()))
  })
})
