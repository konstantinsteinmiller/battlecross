import { describe, expect, it } from 'vitest'
import { KIT_FLOOR, kitEase } from '@/game/coach/kitEase'

describe('kit ease: the foes meet the skills the hero has learned', () => {
  it('a full kit (or more) meets the level as tabled', () => {
    expect(kitEase('hollows', 4)).toEqual({ dmg: 1, hp: 1 })
    expect(kitEase('hollows', 9)).toEqual({ dmg: 1, hp: 1 })
    expect(kitEase('plains', 2)).toEqual({ dmg: 1, hp: 1 })
  })
  it('each missing skill softens the foes a little, and never past the floor', () => {
    const a = kitEase('hollows', 3)
    const b = kitEase('hollows', 2)
    const c = kitEase('hollows', 1)
    expect(a.dmg).toBeLessThan(1)
    expect(b.dmg).toBeLessThan(a.dmg)
    expect(c.dmg).toBeLessThan(b.dmg)
    expect(c.hp).toBeLessThan(b.hp)
    expect(kitEase('hollows', -5).dmg).toBeGreaterThanOrEqual(KIT_FLOOR.dmg)
    expect(kitEase('hollows', 0).hp).toBeGreaterThanOrEqual(KIT_FLOOR.hp)
  })
  it('on the plains only the blows ease (the road teacher\'s skill is what toughens its foes)', () => {
    const e = kitEase('plains', 1)
    expect(e.dmg).toBeLessThan(1)
    expect(e.hp).toBe(1)
  })
})
