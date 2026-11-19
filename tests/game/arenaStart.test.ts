import { describe, expect, it } from 'vitest'
import { ARENA_START_BACK, arenaStartWave, powerWave } from '@/game/data/arenaStart'

// Where the colosseum may begin from the second visit (#230): the best wave less three, held down by what the build can do.
describe('the colosseum start wave', () => {
  const strong = { attrs: 600, highSkills: 8, passives: 4 }
  const weak = { attrs: 60, highSkills: 0, passives: 1 }

  it('is the best wave less three for a strong build, and never below wave 1', () => {
    expect(arenaStartWave(22, strong)).toBe(22 - ARENA_START_BACK)
    expect(arenaStartWave(3, strong)).toBe(1)
    expect(arenaStartWave(0, strong)).toBe(1)
  })
  it('is held down for a build that cannot hold its best wave', () => {
    expect(powerWave(weak)).toBeLessThan(10)
    expect(arenaStartWave(22, weak)).toBe(powerWave(weak))
    expect(arenaStartWave(22, weak)).toBeLessThan(arenaStartWave(22, strong))
  })
  it('grows with attributes, high-level skills and passives', () => {
    const base = powerWave(weak)
    expect(powerWave({ ...weak, attrs: 300 })).toBeGreaterThan(base)
    expect(powerWave({ ...weak, highSkills: 4 })).toBeGreaterThan(base)
    expect(powerWave({ ...weak, passives: 4 })).toBeGreaterThan(base)
  })
})
