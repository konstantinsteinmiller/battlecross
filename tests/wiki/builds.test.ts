import { describe, expect, it } from 'vitest'
import { BUILDS } from '../../wiki/src/builds'
import { problemsOf, pointsAt, spentOf, skillPath, encodePlan, decodePlan } from '../../wiki/src/planner'
import { SKILL_BY_ID } from '@/game/data/skills'
import { ITEM_BY_ID } from '@/game/data/items'
import { ALL_PAIRS } from '../../wiki/src/synergy'

/** The wiki's guide builds must be builds the game lets a player make. */
describe('wiki guide builds', () => {
  it('has at least 16 builds with unique ids', () => {
    expect(BUILDS.length).toBeGreaterThanOrEqual(16)
    expect(new Set(BUILDS.map(b => b.id)).size).toBe(BUILDS.length)
  })
  for (const b of BUILDS) {
    it(`${b.id} is legal at level 30`, () => {
      const plan = { level: 30, attrs: b.attrs, actives: b.actives, passives: b.passives, gear: b.gear }
      expect(spentOf(b.attrs)).toBe(pointsAt(30))
      expect(b.actives).toHaveLength(8)
      expect(b.passives).toHaveLength(4)
      expect(new Set([...b.actives, ...b.passives]).size).toBe(12)
      for (const id of b.actives) expect(SKILL_BY_ID[id]?.kind, id).toBe('active')
      for (const id of b.passives) expect(SKILL_BY_ID[id]?.kind, id).toBe('passive')
      for (const id of Object.values(b.gear)) expect(ITEM_BY_ID[id!], id).toBeTruthy()
      expect(problemsOf(plan)).toEqual([])
      expect(skillPath(plan)).toHaveLength(12)
      expect(decodePlan(encodePlan(plan))).toMatchObject(plan)
    })
  }
  it('finds cross-class combinations', () => {
    expect(ALL_PAIRS().some(p => p.a.cls !== p.b.cls)).toBe(true)
  })
})
