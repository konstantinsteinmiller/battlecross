import { describe, expect, it } from 'vitest'
import { AFTER_ITEMS, INFERNALS } from '@/game/data/items'
import { ITEM_LINES, MATRIX_SLOTS, servesLine } from '@/game/data/itemMatrix'

// The second arc drops Infernal twins and the afterplay's set pieces (#227): every build must find a weapon there, and a piece for
// every slot but the off hand it can fill (the endurance line once had no weapon at all, the charisma line none).
const pool = [...INFERNALS, ...AFTER_ITEMS]

describe('what the second arc drops, for every build', () => {
  it('has weapons of every attribute, spread over the levels', () => {
    for (const line of ITEM_LINES) {
      const w = pool.filter(i => i.weapon && i.weapon.scale === line)
      expect(w.length, line).toBeGreaterThanOrEqual(3)
      expect(Math.max(...w.map(i => i.level)) - Math.min(...w.map(i => i.level)), line).toBeGreaterThanOrEqual(10)
    }
  })
  it('has something in every slot for every build', () => {
    for (const line of ITEM_LINES) for (const slot of MATRIX_SLOTS) expect(pool.some(i => i.slot === slot && servesLine(i, line)), `${line} ${slot}`).toBe(true)
  })
})
