import { describe, expect, it } from 'vitest'
import { OPENING, ZONES } from '@/game/data/zones'
import { generateZone } from '@/game/sim/zoneGen'

// #195: the first level's ore rock (and the miner beside it) lies south-west or south-east of the puzzle's hint board.
describe('the first level\'s ore rock', () => {
  it('lies south of the hint board, to a side of it, and near', () => {
    let near = 0
    const seeds = Array.from({ length: 30 }, (_, i) => 100 + i * 37)
    for (const seed of seeds) {
      const plan = generateZone(ZONES.plains, seed, { tutorial: true, openingPack: OPENING.pack })
      const hint = plan.puzzle?.hint
      const ore = plan.ores[0]
      expect(ore, `seed ${seed}`).toBeTruthy()
      if (!hint || !ore) continue
      const dx = Math.abs(ore.x - hint.x)
      const dz = ore.z - hint.z
      if (dz > 1 && dx > 1 && Math.hypot(dx, dz) < 18) near++
    }
    // Where the stone allows it: nearly every seed.
    expect(near).toBeGreaterThanOrEqual(24)
  })
})
