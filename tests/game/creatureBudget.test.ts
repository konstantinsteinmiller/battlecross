import { describe, expect, it } from 'vitest'
import { CREATURE_BUILDS } from '@/game/gfx/rigs/creatures'

/**
 * What a creature may cost (#74). A pack is up to five of them on screen with
 * the hero; what a frame pays for is draw calls (three a character, however
 * many parts) far more than a few thousand skinned triangles, so the line is
 * drawn where the #74 models sit, to stop them creeping, not to starve them.
 * The big ones (golems, treants, the dragon) come one or two at a time.
 * Triangles of the skinned mesh (the outline is the same mesh again).
 */
const BUDGET: Record<string, number> = { dragon: 7500, ally: 7500, colossus: 5000, cinder: 5000, golem: 4600, matriarch: 4800, wyvern: 4800, treant: 4800, elder: 4800, thorn: 4800 }
const DEFAULT = 4000

const trisOf = (g: import('three').BufferGeometry): number => (g.index ? g.index.count : g.attributes.position!.count) / 3

describe('creature rigs stay within their triangle budget (#74)', () => {
  for (const [id, build] of Object.entries(CREATURE_BUILDS)) {
    it(id, () => {
      const n = trisOf(build().mesh.geometry)
      expect(n, `${id}: ${n} triangles`).toBeLessThanOrEqual(BUDGET[id] ?? DEFAULT)
    })
  }
})
