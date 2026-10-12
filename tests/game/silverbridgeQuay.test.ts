import { describe, expect, it } from 'vitest'
import { TOWNS } from '@/game/data/zones'
import { layTown, townGeo } from '@/game/sim/town'
import { K_BLOCK } from '@/game/sim/zoneFeatures'
import { CELL } from '@/game/sim/grid'

/**
 * Silverbridge's south street, on the quay by the water: wide enough that the
 * folk and the secret masters standing on it never close the way, and an alley
 * between every two houses of the row, up to the middle street.
 */
const FLAGS = [new Set<string>(), new Set(['foundWindrunner', 'foundFrostwarden', 'foundLightbringer', 'foundBeastcaller', 'collectorOpen', 'mirelaOpen', 'freedHerbalist'])]

describe('Silverbridge by the water', () => {
  const def = TOWNS.silverbridge
  const G = townGeo(def.width, def.site)
  const Q = G.QUAY!

  it('the quay is three cells wide, its lane down the middle', () => {
    expect(Q.parapet - (G.FRONT[2] + 1)).toBe(3)
    expect(Q.j).toBe(G.FRONT[2] + 2)
  })

  for (const flags of FLAGS) {
    for (const seed of [1, 7, 42, 1234]) {
      it(`nobody and nothing stands in the quay's lane (seed ${seed}, ${flags.size ? 'every secret open' : 'a new game'})`, () => {
        const L = layTown(def, flags, seed)
        const blocked: number[] = []
        for (let i = Q.bank; i <= L.w - 1 - Q.bank; i++) {
          const k = Q.j * L.w + i
          if (L.solid[k] || L.kind[k] === K_BLOCK) blocked.push(i)
        }
        expect(blocked).toEqual([])
        const standing = L.town.people.filter(p => Math.floor(p.z / CELL) === Q.j).map(p => p.id)
        expect(standing).toEqual([])
      })

      it(`an alley between every two houses of the south row (seed ${seed})`, () => {
        const L = layTown(def, flags, seed)
        const row = L.town.houses.filter(h => h.row === 2).sort((a, b) => a.i0 - b.i0)
        for (let n = 1; n < row.length; n++) {
          const prev = row[n - 1]!
          expect(row[n]!.i0 - (prev.i0 + prev.cw), `${prev.kind}@${prev.i0} → ${row[n]!.kind}@${row[n]!.i0}`).toBeGreaterThanOrEqual(1)
        }
      })
    }
  }
})
