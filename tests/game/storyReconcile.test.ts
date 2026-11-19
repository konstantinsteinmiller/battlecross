// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

// #235: the Hydra dead and the Rift still sealed. The chain asked for each step's level at the moment of the win; now it only
// asks for the zones, and a save already in that corner is mended when it loads.
type P = typeof import('@/game/state/profile')
let p: P
beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  p.initProfile()
})
afterEach(() => drainPersist())

describe('the second arc\'s chain', () => {
  it('gives the Hydra\'s key for the zones alone, at any hero level', async () => {
    const { onZoneWon, purgedFlag } = await import('@/game/data/breaking')
    const flags = new Set(['brk0', 'brk1', 'brk2', 'brk3', 'brk4', 'brk5', purgedFlag('crags'), purgedFlag('mines'), purgedFlag('tundra'), purgedFlag('temple'), purgedFlag('citadel')])
    const add = onZoneWon('fortress', true, flags, 36)
    expect(add).toEqual(expect.arrayContaining(['brk6', 'brk7', 'brk8', 'brk9', 'hydraKey']))
  })

  it('mends a save with the invaded zones won and the steps missing', async () => {
    p.profile.world.afterplay = true
    const zones = ['plains', 'hollows', 'woods', 'outskirts', 'crags', 'mines', 'tundra', 'temple', 'citadel', 'fortress']
    p.profile.world.flags.push('brk0', 'brk1', 'brk2', ...zones.map(z => `invaded:${z}`))
    p.profile.level = 36
    p.reconcileStory()
    expect(p.profile.world.flags).toEqual(expect.arrayContaining(['brk9', 'hydraKey']))
    const { invadedOpen } = await import('@/game/data/invasion')
    expect(invadedOpen('rift', new Set(p.profile.world.flags))).toBe(true)
  })
})
