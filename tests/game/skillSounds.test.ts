import { describe, expect, it } from 'vitest'
import { ACTIVE_ELEMENTS, CAST_SOUND, IMPACT_SOUND, type SoundElement } from '@/game/data/skillSounds'
import { SFX_NAMES } from '@/game/audio/sfx'
import { SKILLS } from '@/game/data/skills'

/**
 * The sound pass (roadmap #101): every active skill has an element, and an
 * element its own cast and its own impact, so a fireball roars as it is
 * thrown and explodes where it lands, and frost does neither.
 */
describe('what each skill sounds like', () => {
  it('every active skill has an element; every element a cast and an impact the game knows', () => {
    const els = ACTIVE_ELEMENTS()
    expect(els).toHaveLength(SKILLS.filter(s => s.kind === 'active').length)
    for (const { element } of els) {
      expect(SFX_NAMES).toContain(CAST_SOUND[element])
      expect(SFX_NAMES).toContain(IMPACT_SOUND[element])
    }
  })

  it('no two magical elements share a cast or an impact', () => {
    const magic = (Object.keys(CAST_SOUND) as SoundElement[]).filter(e => e !== 'physical' && e !== 'command')
    expect(new Set(magic.map(e => CAST_SOUND[e])).size).toBe(magic.length)
    expect(new Set(magic.map(e => IMPACT_SOUND[e])).size).toBe(magic.length)
  })

  it('the classes sound like themselves: fire for the pyromancer, frost for the warden, wind for the runner', () => {
    const of = (id: string): SoundElement => ACTIVE_ELEMENTS().find(x => x.id === id)!.element
    expect(of('fireball')).toBe('fire')
    expect(of('frostCleave')).toBe('ice')
    expect(of('galeArrow')).toBe('wind')
    expect(of('chainSpark')).toBe('shock')
    expect(of('venomousBlade')).toBe('poison')
    expect(of('shieldSlam')).toBe('physical')
    // Every class uses at least one element of its own (none is all plain steel but the monk's fists).
    const byClass = new Map<string, Set<SoundElement>>()
    for (const s of SKILLS.filter(x => x.kind === 'active')) {
      const set = byClass.get(s.cls) ?? new Set()
      set.add(ACTIVE_ELEMENTS().find(x => x.id === s.id)!.element)
      byClass.set(s.cls, set)
    }
    for (const [cls, set] of byClass) if (cls !== 'ironmonk') expect([...set].some(e => e !== 'physical'), cls).toBe(true)
  })
})
