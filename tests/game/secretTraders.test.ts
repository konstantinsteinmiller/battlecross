// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { TOWNS } from '@/game/data/zones'
import { errandDef } from '@/game/data/errands'
import { layTown } from '@/game/sim/town'

/**
 * The secret traders of Silverbridge (roadmap #86, D108): no sign and no shop
 * until their favour is done; then Rare and Epic stock for good.
 */

const SECRET = TOWNS.silverbridge.npcs.filter(n => n.secret && n.role === 'shop')

describe('the secret traders', () => {
  it('two of them, each opened by the flag of an errand they give, selling Rare and Epic pieces', () => {
    expect(SECRET.map(n => n.id).sort()).toEqual(['sbCollector', 'sbFence'])
    for (const n of SECRET) {
      expect(n.role).toBe('shop')
      expect(n.stock!.tiers).toEqual([3, 4])
      const e = ['collectorFavor', 'mirelaFavor'].map(errandDef).find(d => d!.giver === n.id)!
      expect(e.reward.flags).toContain(n.secret)
    }
  })

  it('hang out no sign over their door', () => {
    const L = layTown(TOWNS.silverbridge, new Set(), 7)
    const h = L.town.houses.find(x => x.owners.includes('sbCollector'))!
    expect(h.sign).toBe('')
  })
})

describe('earning the shop', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  let talk: typeof import('@/game/talk')
  beforeEach(async () => {
    drainAndResetModules()
    localStorage.clear()
    await holdGameState()
    p = await import('@/game/state/profile')
    talk = await import('@/game/talk')
    p.initProfile()
  })
  afterEach(() => { drainPersist(); vi.restoreAllMocks() })

  it('a face in the crowd, a favour, the moonbells handed in: a shop from then on', () => {
    const def = TOWNS.silverbridge.npcs.find(n => n.id === 'sbCollector')!
    expect(talk.npcPin(def).kind).toBe('talk')
    expect(p.startErrand('collectorFavor')).toBe(true)
    p.countErrands({ node: 'woods', won: true, kills: { treant: 6 } })
    p.addHerbs({ moonbell: 4 })
    expect(p.errandStateOf('collectorFavor')).toBe('ready')
    expect(p.completeErrand('collectorFavor')).not.toBeNull()
    expect(p.herbCount('moonbell')).toBe(2)
    expect(p.hasFlag('collectorOpen')).toBe(true)
    expect(talk.npcPin(def).kind).toBe('shop')
  })
})
