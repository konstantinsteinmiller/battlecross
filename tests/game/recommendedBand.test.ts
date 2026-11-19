import { describe, expect, it } from 'vitest'
import { ZONE_IDS } from '@/game/data/zones'
import { ARC2_RECOMMEND_CUT, invadedZone, recommendedBand } from '@/game/data/invasion'
import { ZONES } from '@/game/data/zones'

describe('the levels the map recommends (#228)', () => {
  it('are the real ones in the first arc and five lower in the second, the enemies keep theirs', () => {
    for (const id of ZONE_IDS) {
      expect(recommendedBand(ZONES[id])).toEqual({ min: ZONES[id].min, max: ZONES[id].max })
      const z = invadedZone(id)
      const b = recommendedBand(z)
      expect(b.min).toBe(Math.max(1, z.min - ARC2_RECOMMEND_CUT))
      expect(b.max).toBe(Math.max(1, z.max - ARC2_RECOMMEND_CUT))
    }
  })
})
